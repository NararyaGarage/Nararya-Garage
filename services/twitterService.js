/**
 * Twitter Service
 * 
 * Service untuk memeriksa update Twitter/X JKT48 dan memberikan notifikasi.
 * Menggunakan web scraping untuk mendapatkan data tanpa API.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { execSync } = require('child_process');
const { logger } = require('../utils/logger');
const config = require('../config');

// Cache file untuk menyimpan tweet terakhir
const cacheFilePath = path.join(__dirname, '..', 'data', 'twitterCache.json');

// Pastikan folder data ada
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file cache ada
if (!fs.existsSync(cacheFilePath)) {
  fs.writeFileSync(cacheFilePath, JSON.stringify({
    lastChecked: Date.now(),
    accounts: {}
  }));
}

/**
 * Setup monitoring Twitter
 * @param {Client} client - Discord client
 */
function setupTwitterMonitoring(client) {
  logger.info('Twitter monitoring service started');
  
  // Jalankan pengecekan pertama setelah 30 detik untuk memberi waktu bot startup
  setTimeout(() => {
    checkTwitterUpdates(client).catch(err => {
      logger.error('Error in Twitter check:', err);
    });
    
    // Set interval untuk pengecekan berkala (setiap 5 menit)
    setInterval(() => {
      checkTwitterUpdates(client).catch(err => {
        logger.error('Error in Twitter check interval:', err);
      });
    }, 5 * 60 * 1000); // 5 menit
  }, 30 * 1000);
}

/**
 * Check for new Twitter/X posts from JKT48 members and official accounts
 * @param {Client} client - Discord client
 */
async function checkTwitterUpdates(client) {
  try {
    // Baca data cache
    const cache = loadCache();
    
    // Update lastChecked
    cache.lastChecked = Date.now();
    
    // Dapatkan semua akun Twitter dari model
    let twitterAccounts = [];
    
    try {
      // Import dengan require untuk menghindari masalah circular dependency
      const jkt48Module = require('../models/jkt48Data');
      if (typeof jkt48Module.getAllSocialMediaUrls === 'function') {
        twitterAccounts = jkt48Module.getAllSocialMediaUrls('twitter') || [];
      } else {
        logger.error('getAllSocialMediaUrls function not found in jkt48Data module');
      }
    } catch (error) {
      logger.error('Error importing jkt48Data module:', error);
      twitterAccounts = [];
    }
    
    // Tambahkan akun Twitter official
    twitterAccounts.push({
      id: 'official',
      name: 'JKT48 Official',
      url: 'https://twitter.com/officialJKT48',
      isOfficial: true
    });
    
    // Tidak perlu pemrosesan jika tidak ada akun Twitter
    if (!twitterAccounts || twitterAccounts.length === 0) {
      logger.warn('No Twitter accounts found to monitor');
      return;
    }
    
    // Loop melalui semua akun
    for (const account of twitterAccounts) {
      try {
        if (!account || !account.url) {
          logger.warn('Invalid Twitter account:', account);
          continue;
        }
        
        const accountUrl = account.url;
        const accountName = account.name || 'Unknown';
        const accountId = account.id || accountUrl.split('/').pop();
        
        // Jika akun belum ada di cache, tambahkan
        if (!cache.accounts[accountId]) {
          cache.accounts[accountId] = {
            lastTweetId: null,
            lastTweetText: null,
            lastTweetUrl: null,
            lastTweetTime: null,
            lastChecked: Date.now()
          };
        }
        
        // Hanya lanjutkan jika URL valid
        if (!accountUrl || !accountUrl.includes('twitter.com')) {
          continue;
        }
        
        // Dapatkan tweet terbaru dengan web scraping
        // Gunakan script Python untuk mendapatkan data tweet terbaru
        try {
          // Gunakan direktori sementara untuk mencegah masalah dengan karakter khusus dalam URL
          const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import get_latest_tweet; print(get_latest_tweet('${accountUrl}'))"`;
          
          const result = execSync(command, { encoding: 'utf8', timeout: 30000 }).trim();
          
          // Jika hasil tidak valid, skip
          if (!result || result.includes('Error:')) {
            logger.warn(`Invalid result from Twitter scraper for ${accountUrl}: ${result}`);
            continue;
          }
          
          // Parse hasil yang seharusnya dalam format JSON
          try {
            const tweetData = JSON.parse(result);
            
            // Jika tidak ada tweet atau tweetId, skip
            if (!tweetData || !tweetData.tweetId) {
              logger.debug(`No tweets found for ${accountUrl}`);
              continue;
            }
            
            // Cek apakah ini tweet baru
            if (cache.accounts[accountId].lastTweetId !== tweetData.tweetId) {
              // Kirim notifikasi hanya jika bukan pengecekan pertama
              if (cache.accounts[accountId].lastTweetId) {
                await sendTweetNotification(client, {
                  account: account,
                  tweet: tweetData
                });
              }
              
              // Update cache
              cache.accounts[accountId] = {
                lastTweetId: tweetData.tweetId,
                lastTweetText: tweetData.text,
                lastTweetUrl: tweetData.url,
                lastTweetTime: tweetData.timestamp,
                lastChecked: Date.now()
              };
            }
          } catch (jsonError) {
            logger.error(`Error parsing tweet JSON for ${accountUrl}:`, jsonError);
            logger.debug('Raw result:', result);
            continue;
          }
        } catch (scrapingError) {
          // Tangani error scraping tanpa menghentikan semua pengecekan
          logger.error(`Error scraping Twitter for ${accountUrl}:`, scrapingError);
          continue;
        }
      } catch (accountError) {
        // Error pemrosesan akun, lanjutkan ke akun berikutnya
        logger.error('Error processing Twitter account:', account, accountError);
        continue;
      }
    }
    
    // Simpan cache
    saveCache(cache);
    
  } catch (error) {
    logger.error('Error in Twitter check:', error);
  }
}

/**
 * Send notification for a new tweet
 * @param {Client} client - Discord client
 * @param {Object} data - Tweet data
 */
async function sendTweetNotification(client, data) {
  try {
    const { account, tweet } = data;
    
    if (!account || !tweet) {
      logger.error('Invalid tweet data for notification');
      return;
    }
    
    // Tentukan channel tujuan
    const channelId = account.isOfficial ? 
      config.notificationChannels.twitterOfficialChannel : 
      config.notificationChannels.twitterMemberChannel;
    
    // Dapatkan channel
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) {
      logger.error(`Channel not found for ID: ${channelId}`);
      return;
    }
    
    // Buat embed
    const embed = new EmbedBuilder()
      .setColor('#1DA1F2')
      .setTitle(`${account.name} Twitter/X Update`)
      .setURL(tweet.url)
      .setDescription(tweet.text)
      .setTimestamp(new Date(tweet.timestamp))
      .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' });
    
    // Add tweet image if available
    if (tweet.image) {
      embed.setImage(tweet.image);
    }
    
    // Buat pesan notifikasi
    const greeting = getTimeGreeting();
    let content = '';
    
    // Format notifikasi custom
    if (account.isOfficial) {
      content = `${greeting} Semua **JKT48** Sudah Mengupload Tweet Baru Jangan Lupa Di Lihat Ya Temen Temen! <@&${config.roles.jkt48NotificationRole}>`;
    } else {
      content = `${greeting} Semua **${account.name}** Sudah Mengupload Tweet Baru Jangan Lupa Di Lihat Ya Temen Temen!`;
    }
    
    // Kirim notifikasi
    await channel.send({
      content: content,
      embeds: [embed]
    });
    
    logger.info(`Sent Twitter notification for ${account.name}`);
    
  } catch (error) {
    logger.error('Error sending Twitter notification:', error);
  }
}

/**
 * Get appropriate greeting based on time of day
 * @returns {string} Time-based greeting
 */
function getTimeGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Selamat Pagi';
  } else if (hour >= 12 && hour < 15) {
    return 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    return 'Selamat Sore';
  } else {
    return 'Selamat Malam';
  }
}

/**
 * Load cache from file
 * @returns {Object} Cache data
 */
function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
  } catch (error) {
    logger.error('Error loading Twitter cache, creating new cache:', error);
    return {
      lastChecked: Date.now(),
      accounts: {}
    };
  }
}

/**
 * Save cache to file
 * @param {Object} cache - Cache data
 */
function saveCache(cache) {
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    logger.error('Error saving Twitter cache:', error);
  }
}

module.exports = {
  setupTwitterMonitoring
};
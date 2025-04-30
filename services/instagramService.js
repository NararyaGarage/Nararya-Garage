/**
 * Instagram Service
 * 
 * Service untuk memeriksa update Instagram JKT48 dan memberikan notifikasi.
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

// Cache file untuk menyimpan post terakhir
const cacheFilePath = path.join(__dirname, '..', 'data', 'instagramCache.json');

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
 * Setup monitoring Instagram
 * @param {Client} client - Discord client
 */
function setupInstagramMonitoring(client) {
  logger.info('Instagram monitoring service started');
  
  // Jalankan pengecekan pertama setelah 30 detik untuk memberi waktu bot startup
  setTimeout(() => {
    checkInstagramUpdates(client).catch(err => {
      logger.error('Error in Instagram check:', err);
    });
    
    // Set interval untuk pengecekan berkala (setiap 5 menit)
    setInterval(() => {
      checkInstagramUpdates(client).catch(err => {
        logger.error('Error in Instagram check interval:', err);
      });
    }, 5 * 60 * 1000); // 5 menit
  }, 30 * 1000);
}

/**
 * Check for new Instagram posts from JKT48 members and official accounts
 * @param {Client} client - Discord client
 */
async function checkInstagramUpdates(client) {
  try {
    // Baca data cache
    const cache = loadCache();
    
    // Update lastChecked
    cache.lastChecked = Date.now();
    
    // Dapatkan semua akun Instagram dari model
    let instagramAccounts = [];
    
    try {
      // Import dengan require untuk menghindari masalah circular dependency
      const jkt48Module = require('../models/jkt48Data');
      if (typeof jkt48Module.getAllSocialMediaUrls === 'function') {
        instagramAccounts = jkt48Module.getAllSocialMediaUrls('instagram') || [];
      } else {
        // Jika fungsi tidak ditemukan, gunakan data fallback
        logger.warn('getAllSocialMediaUrls function not found in jkt48Data module, using fallback data');
        instagramAccounts = [
          {
            id: 'jkt48',
            name: 'JKT48 Official',
            url: 'https://www.instagram.com/jkt48/',
            isOfficial: true
          }
        ];
      }
    } catch (error) {
      logger.error('Error importing jkt48Data module:', error);
      instagramAccounts = [
        {
          id: 'jkt48',
          name: 'JKT48 Official',
          url: 'https://www.instagram.com/jkt48/',
          isOfficial: true
        }
      ];
    }
    
    // Tidak perlu pemrosesan jika tidak ada akun Instagram
    if (!instagramAccounts || instagramAccounts.length === 0) {
      logger.warn('No Instagram accounts found to monitor');
      return;
    }
    
    // Loop melalui semua akun
    for (const account of instagramAccounts) {
      try {
        if (!account || !account.url) {
          logger.warn('Invalid Instagram account data');
          continue;
        }
        
        const accountUrl = account.url;
        const accountName = account.name || 'Unknown';
        const accountId = account.id || accountUrl.split('/').pop().replace(/\/$/, '');
        
        // Jika akun belum ada di cache, tambahkan
        if (!cache.accounts[accountId]) {
          cache.accounts[accountId] = {
            lastPostId: null,
            lastPostText: null,
            lastPostUrl: null,
            lastPostTime: null,
            lastChecked: Date.now()
          };
        }
        
        // Hanya lanjutkan jika URL valid
        if (!accountUrl || !accountUrl.includes('instagram.com')) {
          continue;
        }
        
        // Setup error handling untuk mencegah crash 
        try {
          // Gunakan script Python untuk mendapatkan data post terbaru
          // dengan timeout untuk mencegah hanging
          const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import get_instagram_post; print(get_instagram_post('${accountUrl}'))"`;
          
          const result = execSync(command, { encoding: 'utf8', timeout: 30000 }).trim();
          
          // Jika hasil tidak valid, skip
          if (!result || result.includes('Error:')) {
            logger.warn(`Invalid result from Instagram scraper for ${accountName}: ${result}`);
            continue;
          }
          
          // Parse hasil
          try {
            const postData = JSON.parse(result);
            
            // Jika tidak ada post atau postId, skip
            if (!postData || !postData.postId) {
              logger.debug(`No posts found for ${accountName}`);
              continue;
            }
            
            // Cek apakah ini post baru
            if (cache.accounts[accountId].lastPostId !== postData.postId) {
              // Kirim notifikasi hanya jika bukan pengecekan pertama
              if (cache.accounts[accountId].lastPostId) {
                await sendInstagramNotification(client, postData, accountName, account.isOfficial);
              }
              
              // Update cache
              cache.accounts[accountId] = {
                lastPostId: postData.postId,
                lastPostText: postData.caption,
                lastPostUrl: postData.url,
                lastPostImage: postData.imageUrl,
                lastPostTime: postData.timestamp,
                lastChecked: Date.now()
              };
            }
          } catch (jsonError) {
            logger.error(`Error parsing Instagram JSON for ${accountName}:`, jsonError);
            continue;
          }
        } catch (scrapingError) {
          // Tangani error scraping tanpa menghentikan semua pengecekan
          logger.error(`Error scraping Instagram for ${accountName}:`, scrapingError.message);
          continue;
        }
      } catch (accountError) {
        // Error pemrosesan akun, lanjutkan ke akun berikutnya
        logger.error('Error processing Instagram account:', accountError.message);
        continue;
      }
    }
    
    // Simpan cache
    saveCache(cache);
    
  } catch (error) {
    logger.error('Error in Instagram check:', error.message);
  }
}

/**
 * Send notification for a new Instagram post
 * @param {Client} client - Discord client
 * @param {Object} post - Instagram post data
 * @param {string} username - Instagram username
 * @param {boolean} isOfficial - Whether this is an official account
 */
async function sendInstagramNotification(client, post, username, isOfficial = false) {
  try {
    if (!post || !username) {
      logger.error('Invalid Instagram post data for notification');
      return;
    }
    
    // Tentukan channel tujuan
    const channelId = isOfficial ? 
      config.channels.instagramNotifications : 
      config.channels.instagramNotifications;
    
    // Dapatkan channel
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) {
      logger.error(`Channel not found for ID: ${channelId}`);
      return;
    }
    
    // Buat embed
    const embed = new EmbedBuilder()
      .setColor('#E1306C')
      .setTitle(`${username} Instagram Update`)
      .setURL(post.url)
      .setDescription(post.caption ? (post.caption.length > 1000 ? post.caption.substring(0, 1000) + '...' : post.caption) : 'No caption')
      .setTimestamp(new Date(post.timestamp || Date.now()))
      .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' });
    
    // Add post image if available
    if (post.imageUrl) {
      embed.setImage(post.imageUrl);
    }
    
    // Buat pesan notifikasi
    const greeting = getTimeGreeting();
    let content = '';
    
    // Format notifikasi custom
    if (isOfficial) {
      content = `${greeting} Semua **JKT48** Sudah Mengupload Post Instagram Baru Jangan Lupa Di Lihat Ya Temen Temen! <@&${config.roles.newsNotification}>`;
    } else {
      content = `${greeting} Semua **${username}** Sudah Mengupload Post Instagram Baru Jangan Lupa Di Lihat Ya Temen Temen!`;
    }
    
    // Kirim notifikasi
    await channel.send({
      content: content,
      embeds: [embed]
    });
    
    logger.info(`Sent Instagram notification for ${username}`);
    
  } catch (error) {
    logger.error('Error sending Instagram notification:', error.message);
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
    logger.error('Error loading Instagram cache, creating new cache:', error.message);
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
    logger.error('Error saving Instagram cache:', error.message);
  }
}

module.exports = {
  setupInstagramMonitoring,
  checkInstagramUpdates
};
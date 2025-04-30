/**
 * TikTok Realtime Service
 * 
 * Service untuk memantau akun TikTok untuk streaming langsung (LIVE)
 * dengan notifikasi instan tanpa delay.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { Client, EmbedBuilder } = require('discord.js');
const { createSuccessEmbed } = require('../utils/embedBuilder');
const { logger } = require('../utils/logger');
const config = require('../config');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { get_website_text_content } = require('../utils/webScraper');

// Cache untuk menyimpan status LIVE terakhir
const cacheFilePath = path.join(__dirname, '..', 'data', 'tiktok_live_cache.json');

// Pastikan direktori data ada
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Buat file cache jika belum ada
if (!fs.existsSync(cacheFilePath)) {
  fs.writeFileSync(cacheFilePath, JSON.stringify({
    accounts: {},
    lastCheck: Date.now(),
    notificationChannels: {}
  }, null, 2));
}

/**
 * Setup TikTok monitoring
 * @param {Client} client - Discord client
 */
function setupTiktokMonitoring(client) {
  logger.info('Setting up TikTok realtime monitoring...');
  
  // Periksa LIVE setiap 15 detik
  setInterval(() => checkTiktokLiveStreams(client), 15000);
  
  // Periksa awal
  setTimeout(() => checkTiktokLiveStreams(client), 5000);
}

/**
 * Periksa stream LIVE TikTok
 * @param {Client} client - Discord client
 */
async function checkTiktokLiveStreams(client) {
  try {
    const cache = loadCache();
    const now = Date.now();
    
    // Periksa apakah cukup waktu telah berlalu sejak pengecekan terakhir
    if (now - cache.lastCheck < 5000) {
      return;
    }
    
    // Perbarui waktu pengecekan terakhir
    cache.lastCheck = now;
    saveCache(cache);
    
    // Dapatkan akun yang dipantau
    const accounts = getTiktokAccounts();
    
    // Periksa setiap akun
    for (const account of accounts) {
      await checkAccountLiveStream(client, account, cache);
    }
    
  } catch (error) {
    logger.error('Error checking TikTok live streams:', error);
  }
}

/**
 * Periksa apakah akun sedang LIVE
 * @param {Client} client - Discord client
 * @param {Object} account - Informasi akun
 * @param {Object} cache - Data cache
 */
async function checkAccountLiveStream(client, account, cache) {
  try {
    // Inisialisasi cache akun jika belum ada
    if (!cache.accounts[account.username]) {
      cache.accounts[account.username] = {
        isLive: false,
        lastLiveTitle: null,
        lastLiveUrl: null,
        lastNotified: null
      };
    }
    
    const accountCache = cache.accounts[account.username];
    
    // URL untuk profil TikTok
    const profileUrl = `https://www.tiktok.com/@${account.username}`;
    
    // Scrape halaman profil
    try {
      const html = await get_website_text_content(profileUrl);
      
      // Jika ada indikator LIVE
      if (html && (html.includes('LIVE') || html.includes('is Live now') || html.includes('is live streaming'))) {
        // URL untuk stream LIVE
        const liveUrl = `https://www.tiktok.com/@${account.username}/live`;
        
        // Jika belum dinotifikasi atau baru mulai LIVE
        if (!accountCache.isLive) {
          // Ekstrak judul LIVE jika memungkinkan
          let liveTitle = null;
          
          try {
            const liveHtml = await get_website_text_content(liveUrl);
            const titleMatch = liveHtml.match(/is LIVE now: ([^\n]+)/);
            if (titleMatch) {
              liveTitle = titleMatch[1].trim();
            } else {
              liveTitle = `${account.name} Live Stream`;
            }
          } catch (e) {
            logger.error(`Error extracting TikTok live title for ${account.username}:`, e);
            liveTitle = `${account.name} Live Stream`;
          }
          
          // Perbarui cache
          accountCache.isLive = true;
          accountCache.lastLiveTitle = liveTitle;
          accountCache.lastLiveUrl = liveUrl;
          accountCache.lastNotified = Date.now();
          saveCache(cache);
          
          // Kirim notifikasi
          await sendLiveNotification(client, account, liveTitle, liveUrl);
        }
      } else {
        // Jika sebelumnya LIVE tapi sekarang sudah tidak
        if (accountCache.isLive) {
          accountCache.isLive = false;
          saveCache(cache);
          
          // Opsional: Notifikasi bahwa LIVE telah berakhir
          // await sendLiveEndedNotification(client, account);
        }
      }
    } catch (error) {
      logger.error(`Error checking TikTok live status for ${account.username}:`, error);
    }
  } catch (error) {
    logger.error(`Error in checkAccountLiveStream for ${account.username}:`, error);
  }
}

/**
 * Kirim notifikasi LIVE
 * @param {Client} client - Discord client
 * @param {Object} account - Informasi akun
 * @param {string} liveTitle - Judul LIVE
 * @param {string} liveUrl - URL LIVE
 */
async function sendLiveNotification(client, account, liveTitle, liveUrl) {
  try {
    // Dapatkan channel notifikasi
    let notificationChannelId = account.notificationChannelId || 
                              config.channels.tiktokNotifications || 
                              config.channels.socialMediaNotifications;
    
    // Jika tidak ada channel yang dikonfigurasi, gunakan default (general atau first text channel)
    if (!notificationChannelId) {
      const guild = client.guilds.cache.get(config.guildId);
      if (guild) {
        const generalChannel = guild.channels.cache.find(ch => ch.name === 'general' && ch.type === 0);
        if (generalChannel) {
          notificationChannelId = generalChannel.id;
        } else {
          // Gunakan channel teks pertama sebagai fallback
          const firstTextChannel = guild.channels.cache.find(ch => ch.type === 0);
          if (firstTextChannel) {
            notificationChannelId = firstTextChannel.id;
          }
        }
      }
    }
    
    if (!notificationChannelId) {
      logger.error(`No notification channel found for TikTok updates from ${account.username}`);
      return;
    }
    
    const notificationChannel = client.channels.cache.get(notificationChannelId);
    
    if (!notificationChannel) {
      logger.error(`Could not find notification channel for TikTok updates: ${notificationChannelId}`);
      return;
    }
    
    // Dapatkan role mention
    const mentionRoleId = account.mentionRoleId || config.roles.tiktokNotifications || config.roles.socialMediaNotifications;
    
    // Dapatkan greeting berdasarkan waktu (Pagi/Siang/Sore/Malam)
    const greeting = getTimeGreeting();
    
    // Buat embed untuk notifikasi
    const embed = new EmbedBuilder()
      .setTitle(liveTitle || `${account.name} Live Stream`)
      .setURL(liveUrl)
      .setColor('#FE2C55') // Warna TikTok
      .setTimestamp()
      .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' });
    
    // Tambahkan thumbnail jika tersedia
    if (account.profileImageUrl) {
      embed.setThumbnail(account.profileImageUrl);
    }
    
    embed.setAuthor({ 
      name: `${account.name} sedang LIVE di TikTok!`, 
      iconURL: 'https://i.imgur.com/mZFJPnC.png', // TikTok icon
      url: liveUrl
    });
    
    embed.setDescription(`Selamat ${greeting} Semuanya! ${account.name} sedang LIVE di TikTok sekarang!\n\n[🔴 Tonton di TikTok](${liveUrl})`);
    
    // Tentukan apakah perlu mention role
    const mentionText = mentionRoleId ? `<@&${mentionRoleId}>` : '';
    
    // Kirim notifikasi
    await notificationChannel.send({
      content: mentionText,
      embeds: [embed]
    });
    
    logger.info(`Sent TikTok live notification for ${account.name} (${account.username})`);
  } catch (error) {
    logger.error('Error sending TikTok live notification:', error);
  }
}

/**
 * Tambahkan channel notifikasi baru
 * @param {string} channelId - ID channel Discord
 * @param {string} accountUsername - Username akun TikTok
 * @param {string} roleId - ID role untuk mention (opsional)
 * @returns {boolean} Berhasil atau tidak
 */
function addNotificationChannel(channelId, accountUsername, roleId = null) {
  try {
    const cache = loadCache();
    
    if (!cache.notificationChannels) {
      cache.notificationChannels = {};
    }
    
    cache.notificationChannels[accountUsername] = {
      channelId: channelId,
      roleId: roleId,
      addedAt: Date.now()
    };
    
    saveCache(cache);
    return true;
  } catch (error) {
    logger.error('Error adding notification channel:', error);
    return false;
  }
}

/**
 * Hapus channel notifikasi
 * @param {string} accountUsername - Username akun TikTok
 * @returns {boolean} Berhasil atau tidak
 */
function removeNotificationChannel(accountUsername) {
  try {
    const cache = loadCache();
    
    if (!cache.notificationChannels) {
      return false;
    }
    
    if (cache.notificationChannels[accountUsername]) {
      delete cache.notificationChannels[accountUsername];
      saveCache(cache);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error removing notification channel:', error);
    return false;
  }
}

/**
 * Daftar akun TikTok yang dipantau
 * @returns {Array} Daftar akun TikTok
 */
function getTiktokAccounts() {
  // Akun dari config/model members
  const configAccounts = config.tiktokAccounts || [];
  
  // Tambahkan akun dari cache notifikasi khusus
  const cache = loadCache();
  const customAccounts = [];
  
  if (cache.notificationChannels) {
    for (const [username, data] of Object.entries(cache.notificationChannels)) {
      customAccounts.push({
        username: username,
        name: username.replace('@', ''),
        notificationChannelId: data.channelId,
        mentionRoleId: data.roleId
      });
    }
  }
  
  // Gabungkan semua akun
  return [
    // Akun default JKT48
    {
      username: 'jkt48.official',
      name: 'JKT48 Official',
      notificationChannelId: config.channels.tiktokNotifications || config.channels.socialMediaNotifications,
      mentionRoleId: config.roles.tiktokNotifications || config.roles.socialMediaNotifications,
      profileImageUrl: 'https://i.imgur.com/example-jkt48-official.jpg'
    },
    // Akun dari config
    ...configAccounts,
    // Akun custom dari notifikasi khusus
    ...customAccounts
  ];
}

/**
 * Dapatkan greeting berdasarkan waktu
 * @returns {string} Greeting (Pagi/Siang/Sore/Malam)
 */
function getTimeGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 3 && hour < 11) {
    return 'Pagi';
  } else if (hour >= 11 && hour < 15) {
    return 'Siang';
  } else if (hour >= 15 && hour < 19) {
    return 'Sore';
  } else {
    return 'Malam';
  }
}

/**
 * Load cache dari file
 * @returns {Object} Data cache
 */
function loadCache() {
  try {
    if (fs.existsSync(cacheFilePath)) {
      return JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    }
    return {
      accounts: {},
      lastCheck: Date.now(),
      notificationChannels: {}
    };
  } catch (error) {
    logger.error('Error loading TikTok cache:', error);
    return {
      accounts: {},
      lastCheck: Date.now(),
      notificationChannels: {}
    };
  }
}

/**
 * Simpan cache ke file
 * @param {Object} cache - Data cache untuk disimpan
 */
function saveCache(cache) {
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    logger.error('Error saving TikTok cache:', error);
  }
}

module.exports = { 
  setupTiktokMonitoring, 
  addNotificationChannel, 
  removeNotificationChannel 
};
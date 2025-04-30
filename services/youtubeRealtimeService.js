/**
 * YouTube Realtime Service
 * 
 * Service untuk memeriksa update YouTube JKT48 dan memberikan notifikasi.
 * Menggunakan web scraping untuk mendapatkan data tanpa API.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('../utils/logger');
const config = require('../config');

// Cache file untuk menyimpan video terakhir
const cacheFilePath = path.join(__dirname, '..', 'data', 'youtubeCache.json');

// Pastikan folder data ada
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file cache ada
if (!fs.existsSync(cacheFilePath)) {
  fs.writeFileSync(cacheFilePath, JSON.stringify({
    lastChecked: Date.now(),
    channels: {}
  }));
}

/**
 * Setup monitoring YouTube
 * @param {Client} client - Discord client
 */
function setupYoutubeMonitoring(client) {
  logger.info('Setting up YouTube realtime monitoring...');
  
  // Jalankan pengecekan pertama setelah 30 detik untuk memberi waktu bot startup
  setTimeout(() => {
    checkYoutubeUploads(client).catch(err => {
      logger.error('Error in YouTube check:', err);
    });
    
    // Set interval untuk pengecekan berkala (setiap 1 menit)
    setInterval(() => {
      checkYoutubeUploads(client).catch(err => {
        logger.error('Error in YouTube check interval:', err);
      });
    }, 60 * 1000); // 1 menit
  }, 30 * 1000);
}

/**
 * Check for new YouTube videos from JKT48 official and members
 * @param {Client} client - Discord client
 */
async function checkYoutubeUploads(client) {
  try {
    // Baca data cache
    const cache = loadCache();
    
    // Update lastChecked
    cache.lastChecked = Date.now();
    
    // Dapatkan semua channel YouTube dari model
    let youtubeChannels = [];
    
    try {
      // Import dengan require untuk menghindari masalah circular dependency
      const jkt48Module = require('../models/jkt48Data');
      if (typeof jkt48Module.getAllSocialMediaUrls === 'function') {
        youtubeChannels = jkt48Module.getAllSocialMediaUrls('youtube') || [];
      } else {
        // Jika fungsi tidak ditemukan, gunakan data fallback
        logger.warn('getAllSocialMediaUrls function not found in jkt48Data module, using fallback data');
        youtubeChannels = [
          {
            id: 'jkt48official',
            name: 'JKT48 Official',
            url: 'https://www.youtube.com/@OfficialJKT48',
            isOfficial: true
          }
        ];
      }
    } catch (error) {
      logger.error('Error importing jkt48Data module:', error);
      youtubeChannels = [
        {
          id: 'jkt48official',
          name: 'JKT48 Official',
          url: 'https://www.youtube.com/@OfficialJKT48',
          isOfficial: true
        }
      ];
    }
    
    // Tidak perlu pemrosesan jika tidak ada channel YouTube
    if (!youtubeChannels || youtubeChannels.length === 0) {
      logger.warn('No YouTube channels found to monitor');
      return;
    }
    
    // Loop melalui semua channel
    for (const channel of youtubeChannels) {
      try {
        if (!channel || !channel.url) {
          logger.warn('Invalid YouTube channel data');
          continue;
        }
        
        const channelUrl = channel.url;
        const channelName = channel.name || 'Unknown';
        const channelId = channel.id || channelUrl.split('@')[1];
        
        // Jika channel belum ada di cache, tambahkan
        if (!cache.channels[channelId]) {
          cache.channels[channelId] = {
            lastVideoId: null,
            lastVideoTitle: null,
            lastVideoUrl: null,
            lastVideoTime: null,
            lastChecked: Date.now(),
            isLive: false
          };
        }
        
        // Hanya lanjutkan jika URL valid
        if (!channelUrl || !channelUrl.includes('youtube.com')) {
          continue;
        }
        
        const videosUrl = `${channelUrl}/videos`;
        
        // Setup error handling untuk mencegah crash 
        try {
          // Gunakan script Python untuk mendapatkan data video terbaru
          try {
            logger.debug(`Scraping YouTube channel: ${channelName}`);
            
            const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import get_latest_youtube_videos; print(get_latest_youtube_videos('${channelUrl}'))"`;
            
            const result = execSync(command, { encoding: 'utf8', timeout: 30000 }).trim();
            
            // Jika hasil tidak valid, skip
            if (!result || result.includes('Error:')) {
              logger.error(`Error scraping YouTube: ${result}`);
              continue;
            }
            
            // Parse hasil
            const videos = JSON.parse(result);
            
            if (!videos || videos.length === 0) {
              logger.debug(`No videos found for ${channelName}`);
              continue;
            }
            
            // Dapatkan video terbaru
            const latestVideo = videos[0];
            
            // Skip jika tidak ada videoId
            if (!latestVideo.videoId) {
              logger.debug(`No video ID found for latest video from ${channelName}`);
              continue;
            }
            
            // Cek apakah ini video baru
            if (cache.channels[channelId].lastVideoId !== latestVideo.videoId) {
              // Kirim notifikasi hanya jika bukan pengecekan pertama
              if (cache.channels[channelId].lastVideoId) {
                // Cek apakah ini live stream
                if (latestVideo.isLive) {
                  await sendLiveNotification(client, latestVideo, channelName, channel.isOfficial);
                  cache.channels[channelId].isLive = true;
                } else {
                  // Ini adalah upload video biasa
                  await sendVideoNotification(client, latestVideo, channelName, channel.isOfficial);
                  cache.channels[channelId].isLive = false;
                }
              }
              
              // Update cache
              cache.channels[channelId] = {
                lastVideoId: latestVideo.videoId,
                lastVideoTitle: latestVideo.title,
                lastVideoUrl: latestVideo.url,
                lastVideoTime: latestVideo.publishedAt,
                lastChecked: Date.now(),
                isLive: latestVideo.isLive
              };
            }
            // Jika video terbaru sama, periksa apakah live stream telah berakhir
            else if (cache.channels[channelId].isLive && !latestVideo.isLive) {
              // Live stream berakhir
              await sendLiveEndNotification(client, latestVideo, channelName, channel.isOfficial);
              cache.channels[channelId].isLive = false;
            }
          } catch (scrapingError) {
            logger.error(`Error scraping YouTube: ${scrapingError.message}`);
            continue;
          }
        } catch (channelError) {
          logger.error(`Error processing YouTube channel ${channelName}: ${channelError.message}`);
          continue;
        }
      } catch (error) {
        logger.error(`Error in YouTube channel check: ${error.message}`);
        continue;
      }
    }
    
    // Simpan cache
    saveCache(cache);
    
  } catch (error) {
    logger.error(`Error in YouTube check: ${error.message}`);
  }
}

/**
 * Send notification for a new live stream
 * @param {Client} client - Discord client
 * @param {Object} videoData - Video data
 * @param {string} channelName - Channel name
 * @param {boolean} isOfficial - Whether this is an official JKT48 channel
 */
async function sendLiveNotification(client, videoData, channelName, isOfficial = false) {
  try {
    if (!videoData || !channelName) {
      logger.error('Invalid video data for notification');
      return;
    }
    
    // Tentukan channel tujuan
    const channelId = isOfficial ? 
      config.channels.youtubeNotifications : 
      config.channels.youtubeNotifications;
    
    // Dapatkan channel
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) {
      logger.error(`Channel not found for ID: ${channelId}`);
      return;
    }
    
    // Buat pesan notifikasi NON-EMBEDDED
    const greeting = getTimeGreeting();
    let content = '';
    
    // Format notifikasi custom sesuai permintaan
    if (isOfficial) {
      content = `${greeting} Semua **JKT48** Sedang live Jangan Lupa Di Tonton Ya Temen Temen! <@&${config.roles.newsNotification}>\n\n🔴 **${videoData.title}**\n🔗 ${videoData.url}`;
    } else {
      content = `${greeting} Semua **${channelName}** Sedang live Jangan Lupa Di Tonton Ya Temen Temen!\n\n🔴 **${videoData.title}**\n🔗 ${videoData.url}`;
    }
    
    // Kirim notifikasi
    await channel.send({
      content: content
    });
    
    logger.info(`Sent YouTube live notification for ${channelName}`);
    
  } catch (error) {
    logger.error('Error sending YouTube live notification:', error);
  }
}

/**
 * Send notification for a regular video upload
 * @param {Client} client - Discord client
 * @param {Object} videoData - Video data
 * @param {string} channelName - Channel name
 * @param {boolean} isOfficial - Whether this is an official JKT48 channel
 */
async function sendVideoNotification(client, videoData, channelName, isOfficial = false) {
  try {
    if (!videoData || !channelName) {
      logger.error('Invalid video data for notification');
      return;
    }
    
    // Tentukan channel tujuan
    const channelId = isOfficial ? 
      config.channels.youtubeNotifications : 
      config.channels.youtubeNotifications;
    
    // Dapatkan channel
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) {
      logger.error(`Channel not found for ID: ${channelId}`);
      return;
    }
    
    // Buat pesan notifikasi NON-EMBEDDED
    const greeting = getTimeGreeting();
    let content = '';
    
    // Format notifikasi custom sesuai permintaan
    if (isOfficial) {
      content = `${greeting} Semua **JKT48** Sudah Mengupload Video Baru Jangan Lupa Di Tonton Ya Temen Temen! <@&${config.roles.newsNotification}>\n\n📺 **${videoData.title}**\n🔗 ${videoData.url}`;
    } else {
      content = `${greeting} Semua **${channelName}** Sudah Mengupload Video Baru Jangan Lupa Di Tonton Ya Temen Temen!\n\n📺 **${videoData.title}**\n🔗 ${videoData.url}`;
    }
    
    // Kirim notifikasi
    await channel.send({
      content: content
    });
    
    logger.info(`Sent YouTube video notification for ${channelName}`);
    
  } catch (error) {
    logger.error('Error sending YouTube video notification:', error);
  }
}

/**
 * Send notification for an ended live stream
 * @param {Client} client - Discord client
 * @param {Object} videoData - Video data
 * @param {string} channelName - Channel name
 * @param {boolean} isOfficial - Whether this is an official JKT48 channel
 */
async function sendLiveEndNotification(client, videoData, channelName, isOfficial = false) {
  try {
    if (!videoData || !channelName) {
      logger.error('Invalid video data for notification');
      return;
    }
    
    // Tentukan channel tujuan
    const channelId = isOfficial ? 
      config.channels.youtubeNotifications : 
      config.channels.youtubeNotifications;
    
    // Dapatkan channel
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) {
      logger.error(`Channel not found for ID: ${channelId}`);
      return;
    }
    
    // Buat pesan notifikasi NON-EMBEDDED
    let content = '';
    
    // Format notifikasi custom sesuai permintaan
    if (isOfficial) {
      content = `Terimakasih Banyak Kek Pada **JKT48** Sudah Menemani Hari Ini Dengan Live YouTube Dan Sampai Jumpa Di Live Selanjutnya Dari **JKT48**.\n\n📺 **${videoData.title}**\n🔗 ${videoData.url}`;
    } else {
      content = `Terimakasih Banyak Kek Pada **${channelName}** Sudah Menemani Hari Ini Dengan Live YouTube Dan Sampai Jumpa Di Live Selanjutnya Dari **${channelName}**.\n\n📺 **${videoData.title}**\n🔗 ${videoData.url}`;
    }
    
    // Kirim notifikasi
    await channel.send({
      content: content
    });
    
    logger.info(`Sent YouTube live end notification for ${channelName}`);
    
  } catch (error) {
    logger.error('Error sending YouTube live end notification:', error);
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
    if (fs.existsSync(cacheFilePath)) {
      return JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    } else {
      const initialCache = {
        lastChecked: Date.now(),
        channels: {}
      };
      fs.writeFileSync(cacheFilePath, JSON.stringify(initialCache));
      return initialCache;
    }
  } catch (error) {
    logger.error('Error loading YouTube cache, creating new cache:', error);
    return {
      lastChecked: Date.now(),
      channels: {}
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
    logger.error('Error saving YouTube cache:', error);
  }
}

module.exports = {
  setupYoutubeMonitoring,
  checkYoutubeUploads,
  sendLiveNotification,
  sendVideoNotification,
  sendLiveEndNotification
};
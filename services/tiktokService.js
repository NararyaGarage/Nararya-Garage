// Service for handling TikTok updates with web scraping (no API dependency)
const { logger } = require('../utils/logger');
const { createEmbed } = require('../utils/embedBuilder');
const { scrapeTikTok } = require('../utils/webScraper');
const { getAllMembers } = require('../models/jkt48Members');
const config = require('../config');

// Store last checked videos to avoid duplicate notifications
let lastCheckedVideos = new Map();

/**
 * Check for new TikTok videos from JKT48 members and official accounts
 * @param {Client} client - Discord client
 */
async function checkTikTokUpdates(client) {
  try {
    // Create a list of TikTok accounts to monitor
    const members = getAllMembers();
    const tiktokAccounts = members
      .filter(member => member.tiktokHandle)
      .map(member => ({
        username: member.tiktokHandle,
        displayName: member.nickName || member.fullName,
        isOfficial: member.tiktokHandle === 'jkt48.official'
      }));
    
    // Add official account if not already included
    if (!tiktokAccounts.some(account => account.username === 'jkt48.official')) {
      tiktokAccounts.push({
        username: 'jkt48.official',
        displayName: 'JKT48 Official',
        isOfficial: true
      });
    }
    
    // Process each TikTok account
    for (const account of tiktokAccounts) {
      try {
        // Construct TikTok URL
        const tiktokUrl = `https://www.tiktok.com/@${account.username}/`;
        
        // Scrape videos using web scraper
        const videos = await scrapeTikTok(tiktokUrl);
        
        if (!videos || videos.length === 0) {
          continue;
        }
        
        // Get previously seen videos for this account
        const previousVideos = lastCheckedVideos.get(account.username) || [];
        
        // Check for new videos
        const newVideos = videos.filter(video => {
          // Check if this video URL has been seen before
          return !previousVideos.some(prevVideo => 
            prevVideo.url === video.url || 
            (prevVideo.thumbnail && video.thumbnail && prevVideo.thumbnail === video.thumbnail)
          );
        });
        
        if (newVideos.length === 0) {
          continue;
        }
        
        // Update last checked videos for this account
        lastCheckedVideos.set(account.username, videos);
        
        // Process new videos and send notifications
        for (const video of newVideos) {
          await sendTikTokNotification(client, video, account);
          logger.info(`New TikTok video from ${account.displayName}`);
        }
      } catch (error) {
        logger.error(`Error checking TikTok for ${account.username}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in checkTikTokUpdates service:', error);
  }
}

/**
 * Send notification for a new TikTok video
 * @param {Client} client - Discord client
 * @param {Object} video - TikTok video data from web scraper
 * @param {Object} account - TikTok account info
 */
async function sendTikTokNotification(client, video, account) {
  try {
    // Find relevant notification channels in all guilds
    for (const guild of client.guilds.cache.values()) {
      try {
        // Find appropriate notification channels
        const notificationChannels = guild.channels.cache.filter(
          channel => 
            channel.type === 0 && // Text channel type
            (channel.name.includes('tiktok') || 
             channel.name.includes('notification') ||
             channel.name.includes('social-media'))
        );
        
        if (notificationChannels.size === 0) continue;
        
        // Create the embed for the notification
        const videoEmbed = createEmbed()
          .setTitle(`TikTok Baru dari ${account.displayName}`)
          .setDescription(video.caption || 'TikTok video')
          .setURL(video.url || `https://www.tiktok.com/@${account.username}/`)
          .setColor('#000000'); // TikTok color (black)
        
        // Add timestamp if available
        if (video.timestamp) {
          videoEmbed.addFields({ name: 'Posted', value: video.timestamp });
        }
        
        // Add likes count if available
        if (video.likes) {
          videoEmbed.addFields({ name: 'Likes', value: video.likes.toString() });
        }
        
        // Add thumbnail if available
        if (video.thumbnail) {
          videoEmbed.setImage(video.thumbnail);
        }
        
        // Determine mention role based on account type
        const mentionRole = account.isOfficial ? 
          config.roles.newsNotification : 
          config.roles.newsNotification; // Could be different role for member videos
        
        // Send to each notification channel
        for (const channel of notificationChannels.values()) {
          await channel.send({
            content: `🎵 **TikTok Baru dari ${account.displayName}!** <@&${mentionRole}>`,
            embeds: [videoEmbed]
          });
        }
      } catch (error) {
        logger.error(`Error sending TikTok notification to guild ${guild.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendTikTokNotification:', error);
  }
}

/**
 * Get videos from a specific JKT48 member's TikTok account
 * @param {string} username - TikTok username (without @)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of video objects
 */
async function getMemberTikTokVideos(username, maxResults = 5) {
  try {
    // Construct TikTok URL
    const tiktokUrl = `https://www.tiktok.com/@${username}/`;
    
    // Scrape videos using web scraper
    const videos = await scrapeTikTok(tiktokUrl);
    
    // Return limited number of videos
    return videos.slice(0, maxResults);
  } catch (error) {
    logger.error(`Error getting TikTok videos for ${username}:`, error);
    return [];
  }
}

module.exports = {
  checkTikTokUpdates,
  getMemberTikTokVideos
};
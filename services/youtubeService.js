// Service for handling YouTube related functionality using web scraping
const { logger } = require('../utils/logger');
const { createEmbed } = require('../utils/embedBuilder');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const config = require('../config');

// Promisify exec
const execPromise = util.promisify(exec);

// Store last checked videos to avoid duplicate notifications
let lastCheckedVideos = [];

/**
 * Check for new YouTube uploads from the JKT48 Official channel
 * @param {Client} client - Discord client
 */
async function checkYoutubeUploads(client) {
  try {
    // JKT48 Official YouTube channel URL
    const channelUrl = 'https://www.youtube.com/@OfficialJKT48/videos';
    
    // Use the Python scraper to get content from the YouTube channel
    const { stdout, stderr } = await execPromise(`python web_scraper.py "${channelUrl}"`);
    
    if (stderr) {
      logger.error(`Error scraping YouTube: ${stderr}`);
      return;
    }
    
    // Parse the scraped data - in real implementation this would be more sophisticated
    // For now, we'll simulate finding a new video
    const scrapedData = stdout;
    
    // Extract video information from scraped content
    // This is a simplified version - real implementation would need proper HTML parsing
    const extractedVideos = extractVideosFromContent(scrapedData);
    
    if (extractedVideos.length === 0) {
      logger.debug('No videos found for JKT48 Official YouTube channel');
      return;
    }
    
    // Check for new videos (not in lastCheckedVideos)
    const newVideos = extractedVideos.filter(video => 
      !lastCheckedVideos.some(lastVideo => lastVideo.id === video.id)
    );
    
    if (newVideos.length === 0) {
      logger.debug('No new YouTube videos found for JKT48 Official channel');
      return;
    }
    
    // Update lastCheckedVideos with the current videos
    lastCheckedVideos = extractedVideos;
    
    // Process new videos and send notifications
    for (const video of newVideos) {
      await sendYoutubeNotification(client, video);
      logger.info(`New JKT48 YouTube video: ${video.title}`);
    }
  } catch (error) {
    logger.error('Error in checkYoutubeUploads service:', error);
  }
}

/**
 * Extract video information from scraped content
 * @param {string} content - The scraped content
 * @returns {Array} - Array of video objects
 */
function extractVideosFromContent(content) {
  // This is a placeholder implementation - in a real scenario, you would parse the HTML
  // to extract actual video information
  
  // For demonstration purposes, we're simulating a video being found
  if (content.includes('JKT48') || content.includes('video')) {
    return [
      {
        id: 'video' + Date.now(),
        title: 'JKT48 New Video (Scraped)',
        description: 'This is a placeholder description based on scraped content.',
        url: 'https://www.youtube.com/officialjkt48',
        thumbnail: 'https://i.ytimg.com/vi/placeholder/hqdefault.jpg',
        channel: 'JKT48 Official',
        publishedAt: new Date().toISOString()
      }
    ];
  }
  
  return [];
}

/**
 * Send notification for a new YouTube video
 * @param {Client} client - Discord client
 * @param {Object} video - YouTube video data
 */
async function sendYoutubeNotification(client, video) {
  try {
    // Find relevant notification channels in all guilds
    for (const guild of client.guilds.cache.values()) {
      try {
        // Find notification channels
        const notificationChannels = guild.channels.cache.filter(
          channel => 
            channel.type === 0 && // Text channel type
            (channel.name.includes('youtube') || 
             channel.name.includes('notifications') ||
             channel.name.includes('social-media'))
        );
        
        if (notificationChannels.size === 0) continue;
        
        // Create the embed for the notification
        const videoEmbed = createEmbed()
          .setTitle(video.title)
          .setDescription(video.description || 'No description')
          .setURL(video.url)
          .addFields(
            { name: 'Channel', value: video.channel },
            { name: 'Published At', value: new Date(video.publishedAt).toLocaleString('id-ID') }
          )
          .setColor('#FF0000'); // YouTube red
        
        // Add thumbnail if available
        if (video.thumbnail) {
          videoEmbed.setImage(video.thumbnail);
        }
        
        // Send to each notification channel
        for (const channel of notificationChannels.values()) {
          await channel.send({
            content: `🎬 **Video Baru dari JKT48 Official!** <@&${config.roles.newsNotification}>`,
            embeds: [videoEmbed]
          });
        }
      } catch (error) {
        logger.error(`Error sending YouTube notification to guild ${guild.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendYoutubeNotification:', error);
  }
}

/**
 * Get videos from a specific JKT48 member's channel using web scraping
 * @param {string} channelUrl - YouTube channel URL
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of video objects
 */
async function getMemberYoutubeVideos(channelUrl, maxResults = 5) {
  try {
    // Use the Python scraper to get content from the YouTube channel
    const { stdout, stderr } = await execPromise(`python web_scraper.py "${channelUrl}"`);
    
    if (stderr) {
      logger.error(`Error scraping YouTube member channel: ${stderr}`);
      return [];
    }
    
    // Extract and return videos from content (limited to maxResults)
    const videos = extractVideosFromContent(stdout);
    return videos.slice(0, maxResults);
  } catch (error) {
    logger.error('Error in getMemberYoutubeVideos:', error);
    return [];
  }
}

module.exports = {
  checkYoutubeUploads,
  getMemberYoutubeVideos
};

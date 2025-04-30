// Service for handling Showroom related functionality
const { logger } = require('../utils/logger');
const { scrapeShowroomLive } = require('../utils/webScraper');
const { createLiveEmbed } = require('../utils/embedBuilder');
const { getCurrentMembers } = require('../models/jkt48Members');
const config = require('../config');

// Store currently live members to avoid duplicate notifications
const currentlyLive = new Map();

/**
 * Check for active Showroom streams and send notifications
 * @param {Client} client - Discord client
 */
async function checkShowroomLives(client) {
  try {
    // Get all current JKT48 members
    const members = getCurrentMembers();
    
    // List of members who are no longer live
    const endedLives = new Map(currentlyLive);
    
    // Check each member's stream status
    for (const member of members) {
      if (!member.showroomId) continue; // Skip if member doesn't have Showroom ID
      
      try {
        const liveData = await scrapeShowroomLive(member.showroomId);
        
        if (liveData && liveData.isLive) {
          // Member is currently live
          const isNewLive = !currentlyLive.has(member.id);
          
          // Prepare data with member information
          const fullLiveData = {
            ...liveData,
            memberId: member.id,
            memberName: member.nickName || member.fullName,
            platform: 'Showroom'
          };
          
          // If this is a new live, send notification
          if (isNewLive) {
            await sendLiveStartNotification(client, fullLiveData);
            
            // Add to currently live list with timestamp and initial data
            currentlyLive.set(member.id, {
              data: fullLiveData,
              startTime: Date.now(),
              initialViewers: fullLiveData.viewers || 0,
              peakViewers: fullLiveData.viewers || 0,
              initialGifts: fullLiveData.giftsReceived || 0,
              initialGiftPoints: fullLiveData.giftPoints || 0
            });
          } else {
            // Update peak viewers
            const liveInfo = currentlyLive.get(member.id);
            if (fullLiveData.viewers > liveInfo.peakViewers) {
              liveInfo.peakViewers = fullLiveData.viewers;
              currentlyLive.set(member.id, liveInfo);
            }
          }
          
          // Remove from ended lives list since they're still live
          endedLives.delete(member.id);
        } else {
          // Member is not live
          // If they were previously live, they ended their stream
          if (currentlyLive.has(member.id)) {
            await processEndedShowroom(client, member.id);
          }
        }
      } catch (error) {
        logger.error(`Error checking Showroom for member ${member.fullName}:`, error);
      }
    }
    
    // Process ended lives (in case a member wasn't checked due to an error)
    for (const [memberId] of endedLives.entries()) {
      if (currentlyLive.has(memberId)) {
        await processEndedShowroom(client, memberId);
      }
    }
  } catch (error) {
    logger.error('Error in checkShowroomLives service:', error);
  }
}

/**
 * Process data for a member who ended their Showroom stream
 * @param {Client} client - Discord client
 * @param {string} memberId - Member ID
 */
async function processEndedShowroom(client, memberId) {
  try {
    const liveInfo = currentlyLive.get(memberId);
    const duration = Math.floor((Date.now() - liveInfo.startTime) / 1000);
    
    // Calculate statistics
    const viewerGrowth = liveInfo.peakViewers - liveInfo.initialViewers;
    const giftsReceived = liveInfo.data.giftsReceived - liveInfo.initialGifts;
    const giftPointsEarned = liveInfo.data.giftPoints - liveInfo.initialGiftPoints;
    
    // Calculate gifts value in Indonesian Rupiah (approximation)
    const giftValueRupiah = giftPointsEarned * 10; // 1 gift point ≈ 10 IDR
    
    // Calculate percentage of free vs paid gifts (approximation)
    const totalGiftPoints = liveInfo.data.giftPoints || 0;
    const freeGiftPercentage = totalGiftPoints > 0 ? 
      Math.floor((liveInfo.data.freeGiftPoints || 0) / totalGiftPoints * 100) : 0;
    
    // Add calculated data to the live data
    const endData = {
      ...liveInfo.data,
      duration,
      viewerGrowth,
      giftsReceived,
      giftPointsEarned,
      giftsRupiah: giftValueRupiah,
      totalGiftPoints: totalGiftPoints,
      freeGiftPercentage: freeGiftPercentage
    };
    
    // Send end notification
    await sendLiveEndNotification(client, endData);
    
    // Remove from currently live list
    currentlyLive.delete(memberId);
    
    logger.info(`${endData.memberName} ended their Showroom stream after ${formatDuration(duration)}`);
  } catch (error) {
    logger.error(`Error processing ended Showroom for member ID ${memberId}:`, error);
  }
}

/**
 * Send notification for a new live stream
 * @param {Client} client - Discord client
 * @param {Object} liveData - Live stream data
 */
async function sendLiveStartNotification(client, liveData) {
  try {
    // Find specific Showroom notification channel from config
    for (const guild of client.guilds.cache.values()) {
      try {
        // Get channel ID from config
        const showroomChannelId = config.channels.showroomNotifications;
        const channel = guild.channels.cache.get(showroomChannelId);
        
        // If channel not found in this guild, try fallback
        if (!channel) {
          const fallbackChannelId = config.channels.liveNotifications;
          const fallbackChannel = guild.channels.cache.get(fallbackChannelId);
          
          if (!fallbackChannel) continue; // Skip if no fallback
          
          // Create the embed for the notification
          const embed = createLiveEmbed(liveData, 'Showroom', true);
          
          // Send with red line border styling
          const nonEmbed = `Selamat ${getTimeGreeting()}, ${liveData.memberName} ❤️ lagi live cuy!\nYuk Ditonton..`;
          
          await fallbackChannel.send({
            content: nonEmbed,
            embeds: [embed]
          });
          
          continue; // Move to next guild
        }
        
        // Create the embed for the notification with red line styling
        const embed = createLiveEmbed(liveData, 'Showroom', true);
        
        // Send styled message
        const nonEmbed = `Selamat ${getTimeGreeting()}, ${liveData.memberName} ❤️ lagi live cuy!\nYuk Ditonton..`;
        
        await channel.send({
          content: nonEmbed,
          embeds: [embed]
        });
        
        // Log successful notification
        logger.info(`Sent Showroom notification for ${liveData.memberName} to channel ${channel.name}`);
      } catch (error) {
        logger.error(`Error sending Showroom notification to guild ${guild.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendLiveStartNotification:', error);
  }
}

/**
 * Send notification for an ended live stream
 * @param {Client} client - Discord client
 * @param {Object} liveData - Live stream data
 */
async function sendLiveEndNotification(client, liveData) {
  try {
    // Find specific Showroom notification channel from config
    for (const guild of client.guilds.cache.values()) {
      try {
        // Get channel ID from config
        const showroomChannelId = config.channels.showroomNotifications;
        const channel = guild.channels.cache.get(showroomChannelId);
        
        // If channel not found in this guild, try fallback
        if (!channel) {
          const fallbackChannelId = config.channels.liveNotifications;
          const fallbackChannel = guild.channels.cache.get(fallbackChannelId);
          
          if (!fallbackChannel) continue; // Skip if no fallback
          
          // Create the embed for the notification
          const embed = createLiveEmbed(liveData, 'Showroom', false);
          
          // Send with styling
          const nonEmbed = `Terimakasih Banyak ${liveData.memberName} Sudah Menemani Hari Ini Dengan Live Showroom Dan Sampai Jumpa Di Live Selanjutnya.`;
          
          await fallbackChannel.send({
            content: nonEmbed,
            embeds: [embed]
          });
          
          continue; // Move to next guild
        }
        
        // Create the embed for the notification
        const embed = createLiveEmbed(liveData, 'Showroom', false);
        
        // Send styled message
        const nonEmbed = `Terimakasih Banyak ${liveData.memberName} Sudah Menemani Hari Ini Dengan Live Showroom Dan Sampai Jumpa Di Live Selanjutnya.`;
        
        await channel.send({
          content: nonEmbed,
          embeds: [embed]
        });
        
        // Log successful notification
        logger.info(`Sent Showroom end notification for ${liveData.memberName} to channel ${channel.name}`);
      } catch (error) {
        logger.error(`Error sending Showroom end notification to guild ${guild.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendLiveEndNotification:', error);
  }
}

/**
 * Format duration in seconds to a readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (minutes > 0 || hours > 0) {
    result += `${minutes}m `;
  }
  
  result += `${remainingSeconds}s`;
  
  return result;
}

/**
 * Format a number as Indonesian Rupiah
 * @param {number} amount - Amount to format
 * @returns {string} Formatted Rupiah string
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get appropriate greeting based on time of day
 * @returns {string} Time-based greeting
 */
function getTimeGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Pagi';
  } else if (hour >= 12 && hour < 15) {
    return 'Siang';
  } else if (hour >= 15 && hour < 18) {
    return 'Sore';
  } else {
    return 'Malam';
  }
}

module.exports = {
  checkShowroomLives
};
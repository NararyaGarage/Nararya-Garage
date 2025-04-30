/**
 * Scheduled Tasks Utility
 * 
 * This utility sets up scheduled tasks for the bot, including:
 * - Checking for live streams
 * - Checking for social media updates
 * - Sending theater and event reminders
 * - Rotating bot status
 */

const cron = require('node-cron');
const { logger } = require('./logger');
const { startStatusRotation } = require('./statusRotation');
const { checkIDNLives } = require('../services/idnLiveService');
const { checkShowroomLives } = require('../services/showroomService');
const { checkTwitterUpdates } = require('../services/twitterService');
const { checkInstagramUpdates } = require('../services/instagramService');
const { checkTikTokUpdates } = require('../services/tiktokService');
const { checkYoutubeUploads } = require('../services/youtubeService');
const { checkJKT48News, checkJKT48Calendar } = require('../services/jkt48WebsiteService');
const config = require('../config');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, createTheaterEmbed, createEventEmbed } = require('./embedBuilder');

// Track upcoming events and theaters with reminders already set
const scheduledReminders = new Map();

/**
 * Set up all scheduled tasks for the bot
 * @param {Client} client - Discord client
 */
function setupScheduledTasks(client) {
  logger.info('Setting up scheduled tasks...');

  // Set up status rotation (will handle its own ready check)
  startStatusRotation(client);

  // Start tasks only when client is ready
  const setupTasks = () => {
    // Check for IDN Lives every 30 seconds
    cron.schedule('*/30 * * * * *', () => {
      checkIDNLives(client).catch(err => {
        logger.error('Error checking IDN Lives:', err);
      });
    });

    // Check for Showroom Lives every 30 seconds
    cron.schedule('*/30 * * * * *', () => {
      checkShowroomLives(client).catch(err => {
        logger.error('Error checking Showroom Lives:', err);
      });
    });

    // Check for Twitter/X updates every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      checkTwitterUpdates(client).catch(err => {
        logger.error('Error checking Twitter updates:', err);
      });
    });

    // Check for Instagram updates every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      checkInstagramUpdates(client).catch(err => {
        logger.error('Error checking Instagram updates:', err);
      });
    });

    // Check for TikTok updates every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      checkTikTokUpdates(client).catch(err => {
        logger.error('Error checking TikTok updates:', err);
      });
    });

    // Check for YouTube uploads every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      checkYoutubeUploads(client).catch(err => {
        logger.error('Error checking YouTube uploads:', err);
      });
    });

    // Check for JKT48 news updates every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      checkJKT48News(client).catch(err => {
        logger.error('Error checking JKT48 news:', err);
      });
    });

    // Check for theater/event updates and set reminders every hour
    cron.schedule('0 * * * *', () => {
      checkJKT48Calendar(client)
        .then(events => {
          // Schedule reminders for new events
          setupEventReminders(client, events);
        })
        .catch(err => {
          logger.error('Error checking JKT48 calendar:', err);
        });
    });

    logger.info('Scheduled tasks setup complete');
  };
  
  // Check if client is already ready
  if (client.isReady()) {
    setupTasks();
  } else {
    // Wait for client to be ready
    client.once('ready', () => {
      setupTasks();
    });
  }
}

/**
 * Set up reminders for theater and other events
 * @param {Client} client - Discord client
 * @param {Array} events - Array of event objects
 */
function setupEventReminders(client, events) {
  if (!events || events.length === 0) return;

  const now = new Date();

  for (const event of events) {
    // Skip if we've already set reminders for this event
    if (scheduledReminders.has(event.id)) continue;

    // Parse event start time
    const eventTime = new Date(event.datetime);
    
    // Skip events that have already passed
    if (eventTime < now) continue;

    // Calculate times for reminders
    const dayOfReminder = new Date(eventTime);
    dayOfReminder.setHours(6, 0, 0, 0); // 6 AM on the day of the event
    
    const minutesBeforeReminder = new Date(eventTime);
    minutesBeforeReminder.setMinutes(minutesBeforeReminder.getMinutes() - 30); // 30 minutes before event

    // Schedule the morning reminder if it's still in the future
    if (dayOfReminder > now) {
      const morningDelay = dayOfReminder.getTime() - now.getTime();
      
      setTimeout(() => {
        sendEventReminder(client, event, 'morning');
      }, morningDelay);
      
      logger.info(`Scheduled morning reminder for ${event.type} "${event.title}" on ${dayOfReminder.toLocaleString()}`);
    }

    // Schedule the 30-minute reminder if it's still in the future
    if (minutesBeforeReminder > now) {
      const beforeEventDelay = minutesBeforeReminder.getTime() - now.getTime();
      
      setTimeout(() => {
        sendEventReminder(client, event, '30min');
      }, beforeEventDelay);
      
      logger.info(`Scheduled 30-min reminder for ${event.type} "${event.title}" on ${minutesBeforeReminder.toLocaleString()}`);
    }

    // Mark this event as having reminders scheduled
    scheduledReminders.set(event.id, true);
  }
}

/**
 * Send a reminder for an upcoming event
 * @param {Client} client - Discord client
 * @param {Object} event - Event data
 * @param {string} reminderType - Type of reminder ('morning' or '30min')
 */
async function sendEventReminder(client, event, reminderType) {
  try {
    // Determine channel ID and role to tag based on event type
    const channelId = event.type === 'theater' 
      ? config.channels.theaterSchedule 
      : config.channels.eventSchedule;
    
    const roleToTag = event.type === 'theater'
      ? `<@&${config.roles.theaterNotification}>`
      : `<@&${config.roles.eventNotification}>`;

    // Get the channel
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      logger.error(`Unable to find channel ${channelId} for event reminder`);
      return;
    }

    // Format the message based on reminder type
    let content, embed;
    
    if (reminderType === 'morning') {
      // Morning reminder (6 AM)
      if (event.type === 'theater') {
        content = `${roleToTag} Hari ini ada jadwal theater **${event.title}**! Jangan sampai ketinggalan!`;
        embed = createTheaterEmbed(event);
      } else {
        content = `${roleToTag} Hari ini ada event **${event.title}**! Jangan sampai ketinggalan!`;
        embed = createEventEmbed(event);
      }
    } else {
      // 30 minutes before reminder
      if (event.type === 'theater') {
        content = `${roleToTag} Theater **${event.title}** akan dimulai dalam 30 menit! Siap-siap ya!`;
        embed = createTheaterEmbed(event);
      } else {
        content = `${roleToTag} Event **${event.title}** akan dimulai dalam 30 menit! Siap-siap ya!`;
        embed = createEventEmbed(event);
      }
    }

    // Add buttons for additional actions if needed
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Lihat Detail')
          .setStyle(ButtonStyle.Link)
          .setURL(event.url || config.urls.calendar),
        new ButtonBuilder()
          .setLabel('Jadwal Lengkap')
          .setStyle(ButtonStyle.Link)
          .setURL(config.urls.calendar)
      );

    // Send the reminder
    await channel.send({
      content: content,
      embeds: [embed],
      components: [row]
    });

    logger.info(`Sent ${reminderType} reminder for ${event.type}: ${event.title}`);
  } catch (error) {
    logger.error(`Error sending ${reminderType} reminder for event:`, error);
  }
}

module.exports = { setupScheduledTasks };
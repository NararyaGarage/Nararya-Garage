/**
 * Theater Reminder Service
 * 
 * This service handles reminders for upcoming JKT48 theater shows and events
 * with notifications sent at 6 AM on the event day and 30 minutes before the event
 */

const { Client } = require('discord.js');
const { jkt48WebsiteService } = require('./jkt48WebsiteService');
const { createTheaterEmbed, createEventEmbed } = require('../utils/embedBuilder');
const { logger } = require('../utils/logger');
const config = require('../config');
const cron = require('node-cron');

/**
 * Initialize theater reminders
 * @param {Client} client - Discord client
 */
function setupTheaterReminders(client) {
  logger.info('Setting up theater reminders...');
  
  // Check for daily reminders at 6 AM WIB (UTC+7)
  // In UTC, this is 23:00 of the previous day
  cron.schedule('0 23 * * *', () => {
    logger.debug('Running daily theater/event reminder check...');
    sendDailyReminders(client);
  });
  
  // Check every minute for 30-minute before event reminders
  cron.schedule('* * * * *', () => {
    checkFor30MinuteReminders(client);
  });
}

/**
 * Send daily reminders at 6 AM for all events happening today
 * @param {Client} client - Discord client
 */
async function sendDailyReminders(client) {
  try {
    // Get today's date in YYYY-MM-DD format, considering UTC+7 timezone
    const today = new Date();
    today.setHours(today.getHours() + 7); // Convert to WIB (UTC+7)
    
    const todayFormatted = today.toISOString().split('T')[0];
    
    logger.debug(`Checking for theater/events on ${todayFormatted}...`);
    
    // Get events for today
    const eventsToday = await jkt48WebsiteService.getTheaterEventsForDate(todayFormatted);
    
    if (!eventsToday || eventsToday.length === 0) {
      logger.debug('No theater/events found for today');
      return;
    }
    
    logger.info(`Found ${eventsToday.length} theater/events for today (${todayFormatted})`);
    
    // Send reminders for each event
    for (const event of eventsToday) {
      await sendEventReminder(client, event, 'daily');
    }
  } catch (error) {
    logger.error('Error sending daily reminders:', error);
  }
}

/**
 * Check for events starting in the next 30 minutes and send reminders
 * @param {Client} client - Discord client
 */
async function checkFor30MinuteReminders(client) {
  try {
    // Get current date and time in WIB (UTC+7)
    const now = new Date();
    now.setHours(now.getHours() + 7); // Convert to WIB
    
    // Calculate the time 30 minutes from now
    const thirtyMinutesFromNow = new Date(now);
    thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30);
    
    // Format the current date as YYYY-MM-DD for the API call
    const todayFormatted = now.toISOString().split('T')[0];
    
    // Get today's events
    const eventsToday = await jkt48WebsiteService.getTheaterEventsForDate(todayFormatted);
    
    if (!eventsToday || eventsToday.length === 0) {
      return;
    }
    
    // Loop through events and check if any start in 30 minutes
    for (const event of eventsToday) {
      // Parse event time
      const eventTime = parseEventTime(event.datetime, todayFormatted);
      
      if (!eventTime) continue;
      
      // Check if event starts in 30 minutes (±1 minute to avoid missing due to seconds)
      const timeDiffMinutes = (eventTime - now) / (1000 * 60);
      
      if (timeDiffMinutes >= 29 && timeDiffMinutes <= 31) {
        logger.info(`Event "${event.title}" starts in 30 minutes, sending reminder...`);
        await sendEventReminder(client, event, '30min');
      }
    }
  } catch (error) {
    logger.error('Error checking for 30-minute reminders:', error);
  }
}

/**
 * Parse event time string to Date object
 * @param {string} timeString - Event time string (e.g., "19:30")
 * @param {string} dateString - Event date in YYYY-MM-DD format
 * @returns {Date|null} - Parsed date or null if invalid
 */
function parseEventTime(timeString, dateString) {
  try {
    if (!timeString || !timeString.includes(':')) return null;
    
    const [hours, minutes] = timeString.split(':').map(n => parseInt(n));
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    const eventDate = new Date(dateString);
    eventDate.setHours(hours, minutes, 0, 0);
    
    return eventDate;
  } catch (error) {
    logger.error('Error parsing event time:', error);
    return null;
  }
}

/**
 * Send reminder for a specific event
 * @param {Client} client - Discord client
 * @param {Object} event - Event data
 * @param {string} reminderType - Type of reminder ('daily' or '30min')
 */
async function sendEventReminder(client, event, reminderType) {
  try {
    // Determine the correct channel and role to tag based on event type
    let channelId, roleId;
    
    const isTheater = event.type === 'theater';
    const prefix = reminderType === 'daily' ? 'Hari ini' : 'Dalam 30 menit';
    
    if (isTheater) {
      channelId = config.channels.theaterUpdates;
      roleId = config.roles.theaterNotifications;
    } else {
      channelId = config.channels.eventUpdates;
      roleId = config.roles.eventNotifications;
    }
    
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) {
      logger.error(`Channel with ID ${channelId} not found`);
      return;
    }
    
    // Create appropriate embed
    const embed = isTheater 
      ? createTheaterEmbed(event) 
      : createEventEmbed(event);
    
    // Send non-embed message with role tag
    const messageText = isTheater
      ? `${prefix} ada Theater Show JKT48! <@&${roleId}>`
      : `${prefix} ada Event JKT48! <@&${roleId}>`;
    
    await channel.send({
      content: messageText,
      embeds: [embed]
    });
    
    logger.info(`Sent ${reminderType} reminder for ${event.title}`);
  } catch (error) {
    logger.error('Error sending event reminder:', error);
  }
}

module.exports = { setupTheaterReminders };
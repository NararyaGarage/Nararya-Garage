// Service for handling JKT48 official website related functionality
const { logger } = require('../utils/logger');
const { scrapeJKT48News, scrapeJKT48Calendar, scrapeTheaterDetails } = require('../utils/webScraper');
const { createEmbed, createNewsEmbed, createTheaterEmbed, createEventEmbed } = require('../utils/embedBuilder');
const { formatDateIndonesia } = require('../utils/formatters');
const config = require('../config');

// Store last checked news and events to avoid duplicate notifications
let lastCheckedNews = [];
let lastCheckedEvents = [];

/**
 * Check JKT48 website for news updates
 * @param {Client} client - Discord client
 */
async function checkJKT48News(client) {
  try {
    // Scrape news from the JKT48 website
    const newsItems = await scrapeJKT48News();
    
    if (!newsItems || newsItems.length === 0) {
      logger.debug('No news items found on JKT48 website');
      return;
    }
    
    // Check for new items (not in lastCheckedNews)
    const newItems = newsItems.filter(item => 
      !lastCheckedNews.some(lastItem => lastItem.url === item.url)
    );
    
    if (newItems.length === 0) {
      logger.debug('No new news items found on JKT48 website');
      return;
    }
    
    // Update lastCheckedNews with the current items
    lastCheckedNews = newsItems;
    
    // Process new items and send notifications
    for (const newsItem of newItems) {
      await sendNewsNotification(client, newsItem);
      logger.info(`New JKT48 news: ${newsItem.title}`);
    }
  } catch (error) {
    logger.error('Error in checkJKT48News service:', error);
  }
}

/**
 * Check JKT48 website for calendar/event updates
 * @param {Client} client - Discord client
 */
async function checkJKT48Calendar(client) {
  try {
    // Scrape calendar from the JKT48 website
    const calendarItems = await scrapeJKT48Calendar();
    
    if (!calendarItems || calendarItems.length === 0) {
      logger.debug('No calendar items found on JKT48 website');
      return;
    }
    
    // Check for new items (not in lastCheckedEvents)
    const newItems = calendarItems.filter(item => 
      !lastCheckedEvents.some(lastItem => lastItem.detailUrl === item.detailUrl)
    );
    
    if (newItems.length === 0) {
      logger.debug('No new calendar items found on JKT48 website');
      return;
    }
    
    // Update lastCheckedEvents with the current items
    lastCheckedEvents = calendarItems;
    
    // Process new items and send notifications
    for (const calendarItem of newItems) {
      // For theater events, get additional details
      if (calendarItem.isTheater) {
        try {
          const theaterDetails = await scrapeTheaterDetails(calendarItem.detailUrl);
          if (theaterDetails) {
            await sendTheaterNotification(client, theaterDetails);
            logger.info(`New JKT48 theater event: ${theaterDetails.name}`);
          }
        } catch (detailError) {
          logger.error(`Error fetching theater details for ${calendarItem.title}:`, detailError);
          // If details fail, send basic notification
          await sendCalendarNotification(client, calendarItem);
        }
      } else {
        // For regular events
        await sendCalendarNotification(client, calendarItem);
        logger.info(`New JKT48 event: ${calendarItem.title}`);
      }
    }
  } catch (error) {
    logger.error('Error in checkJKT48Calendar service:', error);
  }
}

/**
 * Send notification for a news item
 * @param {Client} client - Discord client
 * @param {Object} newsItem - News item data
 */
async function sendNewsNotification(client, newsItem) {
  try {
    // Find relevant notification channels in all guilds
    for (const guild of client.guilds.cache.values()) {
      try {
        // Get the dedicated news channel if configured
        const newsChannel = guild.channels.cache.get(config.channels.news);
        
        if (!newsChannel) {
          logger.debug(`News channel not found in guild ${guild.name}`);
          continue;
        }
        
        // Create the embed for the news
        const newsEmbed = createNewsEmbed({
          title: newsItem.title,
          description: `${newsItem.category} - ${newsItem.date}`,
          url: newsItem.url
        });
        
        // Send to the news channel with role mention
        await newsChannel.send({
          content: `Berita terbaru dari JKT48 Official! <@&${config.roles.newsNotification}>`,
          embeds: [newsEmbed]
        });
      } catch (error) {
        logger.error(`Error sending news notification to guild ${guild.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendNewsNotification:', error);
  }
}

/**
 * Send notification for a theater event
 * @param {Client} client - Discord client
 * @param {Object} theaterEvent - Theater event data
 */
async function sendTheaterNotification(client, theaterEvent) {
  try {
    // Find relevant notification channels in all guilds
    for (const guild of client.guilds.cache.values()) {
      try {
        // Get the dedicated theater/event channel if configured
        const theaterChannel = guild.channels.cache.get(config.channels.theaterSchedule);
        
        if (!theaterChannel) {
          logger.debug(`Theater channel not found in guild ${guild.name}`);
          continue;
        }
        
        // Format the theater event data
        const formattedEvent = {
          name: theaterEvent.name,
          date: formatDateIndonesia(theaterEvent.date),
          ticketExchange: theaterEvent.ticketInfo || 'TBA',
          location: theaterEvent.location || 'JKT48 Theater',
          members: theaterEvent.members || 'TBA',
          price: theaterEvent.ticketInfo || 'TBA',
          ytMembershipPrice: 'Lihat di Official JKT48',
          notes: theaterEvent.notes || '-',
          url: theaterEvent.url
        };
        
        // Create the embed for the theater event
        const theaterEmbed = createTheaterEmbed(formattedEvent);
        
        // Send to the theater channel with role mention
        await theaterChannel.send({
          content: `Berikut Informasi Jadwal Theater Di Minggu Ini <@&${config.roles.theaterNotification}>`,
          embeds: [theaterEmbed]
        });
      } catch (error) {
        logger.error(`Error sending theater notification to guild ${guild.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendTheaterNotification:', error);
  }
}

/**
 * Send notification for a calendar event (non-theater)
 * @param {Client} client - Discord client
 * @param {Object} calendarItem - Calendar event data
 */
async function sendCalendarNotification(client, calendarItem) {
  try {
    // Find relevant notification channels in all guilds
    for (const guild of client.guilds.cache.values()) {
      try {
        // Get the dedicated theater/event channel if configured
        const eventChannel = guild.channels.cache.get(config.channels.theaterSchedule);
        
        if (!eventChannel) {
          logger.debug(`Event channel not found in guild ${guild.name}`);
          continue;
        }
        
        // Format the event data
        const formattedEvent = {
          name: calendarItem.title,
          location: calendarItem.location || 'TBA',
          date: formatDateIndonesia(calendarItem.date),
          lineup: 'Member JKT48 (Detail akan diumumkan)',
          additionalInfo: 'Lihat di website resmi JKT48 untuk informasi lebih lanjut',
          url: calendarItem.detailUrl
        };
        
        // Create the embed for the event
        const eventEmbed = createEventEmbed(formattedEvent);
        
        // Send to the event channel with role mention
        await eventChannel.send({
          content: `Berikut Informasi Jadwal Event JKT48 <@&${config.roles.eventNotification}>`,
          embeds: [eventEmbed]
        });
      } catch (error) {
        logger.error(`Error sending event notification to guild ${guild.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendCalendarNotification:', error);
  }
}

/**
 * Get theater/events for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of events for that date
 */
async function getTheaterEventsForDate(date) {
  try {
    // Convert date for comparison
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Scrape calendar from the JKT48 website
    const calendarItems = await scrapeJKT48Calendar();
    
    if (!calendarItems || calendarItems.length === 0) {
      logger.debug('No calendar items found on JKT48 website');
      return [];
    }
    
    // Filter items for the target date
    const eventsForDate = calendarItems.filter(item => {
      try {
        // Parse date from format like "2023-09-24"
        const itemDateParts = item.date.split(' ')[0].split('-');
        const eventDate = new Date(
          parseInt(itemDateParts[0]), 
          parseInt(itemDateParts[1]) - 1, 
          parseInt(itemDateParts[2])
        );
        eventDate.setHours(0, 0, 0, 0);
        
        return eventDate.getTime() === targetDate.getTime();
      } catch (e) {
        return false;
      }
    });
    
    // Fetch details for theater events
    const detailedEvents = [];
    
    for (const event of eventsForDate) {
      let detailedEvent = { ...event };
      
      if (event.isTheater) {
        try {
          const theaterDetails = await scrapeTheaterDetails(event.detailUrl);
          if (theaterDetails) {
            detailedEvent = { ...event, ...theaterDetails };
          }
        } catch (error) {
          logger.error(`Error fetching details for event ${event.title}:`, error);
        }
      }
      
      detailedEvents.push(detailedEvent);
    }
    
    return detailedEvents;
  } catch (error) {
    logger.error('Error in getTheaterEventsForDate:', error);
    return [];
  }
}

module.exports = {
  checkJKT48News,
  checkJKT48Calendar,
  getTheaterEventsForDate
};

// Command to display theater/event schedule information
const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, createTheaterEmbed, createEventEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const { formatDateIndonesia } = require('../../utils/formatters');
const { scrapeJKT48Calendar, scrapeTheaterDetails } = require('../../utils/webScraper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('theaterjkt48')
    .setDescription('Tampilkan jadwal teater & event JKT48 mendatang'),
  cooldown: 10,
  async execute(interaction, client) {
    // PENTING: deferReply sudah dihandle oleh commandWrapper, jadi tidak perlu memanggil lagi di sini
    // interaction.deferReply() TIDAK BOLEH dipanggil di sini, sudah ditangani di utils/commandWrapper.js
    
    try {
      // Scrape the JKT48 calendar
      const calendarItems = await scrapeJKT48Calendar();
      
      if (!calendarItems || calendarItems.length === 0) {
        await interaction.editReply({ 
          content: 'Tidak ada jadwal teater atau event yang ditemukan saat ini. Silakan coba lagi nanti.'
        });
        return;
      }
      
      // Filter only upcoming events (start from today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingItems = calendarItems.filter(item => {
        // Parse date from format like "2023-09-24"
        const itemDate = item.date.split(' ')[0].split('-');
        const eventDate = new Date(parseInt(itemDate[0]), parseInt(itemDate[1])-1, parseInt(itemDate[2]));
        return eventDate >= today;
      });
      
      if (upcomingItems.length === 0) {
        await interaction.editReply({ 
          content: 'Tidak ada jadwal teater atau event mendatang yang ditemukan saat ini. Silakan coba lagi nanti.'
        });
        return;
      }
      
      // Separate theater and event items
      const theaterItems = upcomingItems.filter(item => item.isTheater);
      const eventItems = upcomingItems.filter(item => !item.isTheater);
      
      // Create embeds
      const mainEmbed = createEmbed()
        .setTitle('Jadwal JKT48 Theater & Event')
        .setDescription(`Berikut adalah jadwal teater dan event JKT48 yang akan datang untuk ${formatDateIndonesia(new Date())} dan seterusnya.`);
      
      // Add theater schedule
      if (theaterItems.length > 0) {
        let theaterList = '';
        
        for (let i = 0; i < Math.min(theaterItems.length, 5); i++) {
          const item = theaterItems[i];
          theaterList += `• **${item.title}**\n`;
          theaterList += `  📅 ${formatDateIndonesia(item.date)}\n`;
          theaterList += `  📍 ${item.location}\n\n`;
        }
        
        if (theaterItems.length > 5) {
          theaterList += `...dan ${theaterItems.length - 5} jadwal teater lainnya.`;
        }
        
        mainEmbed.addFields({ name: '🎭 Theater Show', value: theaterList });
      } else {
        mainEmbed.addFields({ name: '🎭 Theater Show', value: 'Tidak ada jadwal teater mendatang saat ini.' });
      }
      
      // Add event schedule
      if (eventItems.length > 0) {
        let eventList = '';
        
        for (let i = 0; i < Math.min(eventItems.length, 5); i++) {
          const item = eventItems[i];
          eventList += `• **${item.title}**\n`;
          eventList += `  📅 ${formatDateIndonesia(item.date)}\n`;
          eventList += `  📍 ${item.location}\n\n`;
        }
        
        if (eventItems.length > 5) {
          eventList += `...dan ${eventItems.length - 5} jadwal event lainnya.`;
        }
        
        mainEmbed.addFields({ name: '🎪 Event', value: eventList });
      } else {
        mainEmbed.addFields({ name: '🎪 Event', value: 'Tidak ada jadwal event mendatang saat ini.' });
      }
      
      // Get details for next theater show if available
      if (theaterItems.length > 0) {
        try {
          const nextTheater = theaterItems[0];
          const theaterDetails = await scrapeTheaterDetails(nextTheater.detailUrl);
          
          if (theaterDetails) {
            mainEmbed.addFields({
              name: '📌 Detail Teater Mendatang',
              value: `**${theaterDetails.name}**\n` +
                     `📅 ${formatDateIndonesia(theaterDetails.date)}\n` +
                     `⏰ ${theaterDetails.time}\n` +
                     `👥 ${theaterDetails.members || 'TBA'}`
            });
          }
        } catch (error) {
          logger.error('Error getting theater details:', error);
        }
      }
      
      await interaction.editReply({
        embeds: [mainEmbed]
      });
      
      logger.info(`Theater schedule requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error executing theaterjkt48 command:', error);
      await interaction.editReply({ 
        content: 'Terjadi kesalahan saat mengambil jadwal teater. Silakan coba lagi nanti.'
      });
    }
  }
};

// Command to display the current status of the bot's services
const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botstatus')
    .setDescription('Tampilkan status layanan bot'),
  cooldown: 30,
  async execute(interaction, client) {
    // deferReply sudah dihandle oleh commandWrapper, jadi tidak perlu memanggil lagi di sini
    
    try {
      // Create services status array
      const services = [
        { name: 'Discord API', url: 'https://discord.com/api/v9/gateway' },
        { name: 'JKT48 Website', url: 'https://jkt48.com' },
        { name: 'IDN Live', url: 'https://www.idn.app' },
        { name: 'Showroom', url: 'https://www.showroom-live.com' }
      ];
      
      // Check each service
      const results = await Promise.all(
        services.map(async (service) => {
          try {
            const startTime = Date.now();
            const response = await axios.get(service.url, {
              timeout: 5000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            return {
              name: service.name,
              status: response.status >= 200 && response.status < 300 ? 'Online' : 'Issues',
              responseTime,
              online: true
            };
          } catch (error) {
            return {
              name: service.name,
              status: 'Offline',
              responseTime: 0,
              online: false,
              error: error.message
            };
          }
        })
      );
      
      // Create the status embed
      const statusEmbed = createEmbed()
        .setTitle('🔍 Status Layanan Bot')
        .setDescription('Status layanan yang digunakan oleh Nararya Garage Bot:');
      
      // Add service status fields
      results.forEach(result => {
        const emoji = result.online ? '✅' : '❌';
        const responseTime = result.online ? `${result.responseTime}ms` : 'N/A';
        statusEmbed.addFields({
          name: `${emoji} ${result.name}`,
          value: `Status: ${result.status}\nResponse Time: ${responseTime}`,
          inline: true
        });
      });
      
      // Add bot performance fields
      const memUsage = process.memoryUsage();
      const memoryUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      statusEmbed.addFields(
        { name: '\u200B', value: '\u200B' },
        {
          name: '⚙️ Performa Bot',
          value: `RAM: ${memoryUsed}MB\nPing: ${client.ws.ping}ms\nUptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`
        }
      );
      
      await interaction.editReply({
        embeds: [statusEmbed]
      });
      
      logger.info(`Bot status requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error executing botstatus command:', error);
      await interaction.editReply({ 
        content: 'Terjadi kesalahan saat memeriksa status layanan bot.'
      });
    }
  }
};

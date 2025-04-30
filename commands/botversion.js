// Command to display the bot version information
const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const config = require('../../config');
const { logger } = require('../../utils/logger');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botversion')
    .setDescription('Tampilkan informasi versi dan status bot'),
  cooldown: 10,
  async execute(interaction, client) {
    // deferReply sudah dihandle oleh commandWrapper, jadi tidak perlu memanggil lagi di sini
    try {
      // Calculate uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      
      // Get memory usage
      const memUsage = process.memoryUsage();
      const memoryUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memoryTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      // Get system info
      const platform = os.platform();
      const arch = os.arch();
      
      // Calculate ping (tanpa perlu deferReply karena sudah dilakukan di commandWrapper)
      const pingStart = Date.now();
      // Tidak perlu deferReply lagi, sudah ditangani di wrapper
      const pingEnd = Date.now();
      const ping = pingEnd - pingStart;
      
      // Create embed
      const versionEmbed = createEmbed()
        .setTitle('Nararya Garage Bot - Informasi')
        .addFields(
          { name: '📊 Versi Bot', value: config.version },
          { name: '⏱️ Uptime', value: uptimeString },
          { name: '🏓 Ping', value: `${ping}ms` },
          { name: '💾 Penggunaan Memori', value: `${memoryUsed}MB / ${memoryTotal}MB` },
          { name: '💻 Platform', value: `${platform} (${arch})` },
          { name: '🌐 Discord.js', value: require('discord.js').version },
          { name: '🔧 Node.js', value: process.version }
        );
      
      await interaction.editReply({
        embeds: [versionEmbed]
      });
      
      logger.info(`Bot version info requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error executing botversion command:', error);
      
      // Gunakan editReply jika sudah deferred, reply jika belum
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat menampilkan informasi versi bot.'
        }).catch(e => logger.error('Error sending edit reply:', e));
      } else if (!interaction.replied) {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat menampilkan informasi versi bot.',
          ephemeral: true 
        }).catch(e => logger.error('Error sending reply:', e));
      }
    }
  }
};

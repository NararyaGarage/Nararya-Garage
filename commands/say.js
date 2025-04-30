/**
 * Say Command
 * 
 * Command untuk membuat bot mengatakan pesan yang diinginkan.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Membuat bot mengatakan pesan yang kamu inginkan')
    .addStringOption(option => 
      option.setName('pesan')
        .setDescription('Pesan yang ingin kamu buat bot katakan')
        .setRequired(true))
    .addBooleanOption(option => 
      option.setName('anonymous')
        .setDescription('Sembunyikan siapa yang membuat pesan ini')
        .setRequired(false)),
  
  async execute(interaction) {
    // Dapatkan pesan dan flag anonymous
    const message = interaction.options.getString('pesan');
    const anonymous = interaction.options.getBoolean('anonymous') || false;
    
    // Hapus @everyone dan @here untuk mencegah penyalahgunaan
    const sanitizedMessage = message
      .replace(/@everyone/g, '@\u200Beveryone')
      .replace(/@here/g, '@\u200Bhere');
    
    try {
      // Defer reply agar bot tidak terlihat "not responding"
      await interaction.deferReply({ ephemeral: true });
      
      // Buat pesan yang akan dikatakan bot
      let content = sanitizedMessage;
      
      // Jika tidak anonymous, tambahkan informasi siapa yang menggunakan command
      if (!anonymous) {
        content = `**${interaction.user.tag} berkata:** ${sanitizedMessage}`;
      }
      
      // Kirim pesan ke channel
      await interaction.channel.send(content);
      
      // Beri tahu pengguna bahwa pesan berhasil dikirim
      await interaction.editReply({ 
        content: 'Pesan berhasil dikirim!',
        ephemeral: true
      });
      
      logger.info(`User ${interaction.user.tag} used say command${anonymous ? ' (anonymous)' : ''}`);
    } catch (error) {
      logger.error(`Error executing say command: ${error.message}`);
      
      // Beri tahu pengguna jika terjadi error
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat mengirim pesan.',
          ephemeral: true
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat mengirim pesan.',
          ephemeral: true
        });
      }
    }
  }
};
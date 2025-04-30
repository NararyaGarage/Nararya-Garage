/**
 * Magic 8 Ball Command
 * 
 * Command untuk bertanya pada Magic 8 Ball dan mendapatkan jawaban acak.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Bertanya pada Magic 8 Ball')
    .addStringOption(option => 
      option.setName('pertanyaan')
        .setDescription('Pertanyaan yang ingin kamu tanyakan pada Magic 8 Ball')
        .setRequired(true)),
  
  async execute(interaction) {
    const question = interaction.options.getString('pertanyaan');
    
    // Array jawaban dari Magic 8 Ball dalam Bahasa Indonesia
    const responses = [
      // Positive
      'Ya, tentu saja!',
      'Sangat mungkin terjadi.',
      'Tanpa keraguan!',
      'Pasti!',
      'Kamu bisa mengandalkannya.',
      'Yang saya lihat, ya.',
      'Kemungkinan besar.',
      'Prospek baik.',
      'Ya!',
      'Tanda-tanda menunjukkan ya.',
      
      // Neutral
      'Jawaban tidak jelas, coba lagi.',
      'Tanya lagi nanti.',
      'Lebih baik saya tidak memberitahumu sekarang.',
      'Tidak bisa diprediksi sekarang.',
      'Konsentrasi dan tanya lagi.',
      'Jangan terlalu mengandalkan ini.',
      
      // Negative
      'Jawabanku tidak.',
      'Sumber saya mengatakan tidak.',
      'Prospek tidak terlalu bagus.',
      'Sangat meragukan.',
      'Tidak.',
      'Lebih baik kamu tidak berharap.',
      'Menurut saya, tidak begitu.'
    ];
    
    // Ambil jawaban acak
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    const embed = new EmbedBuilder()
      .setColor('#8517FF')
      .setTitle('🔮 Magic 8 Ball')
      .addFields(
        { name: 'Pertanyaan', value: question },
        { name: 'Jawaban', value: response }
      )
      .setThumbnail('https://i.imgur.com/44uYT3K.png')
      .setFooter({ text: `Ditanyakan oleh ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`User ${interaction.user.tag} used 8ball command: "${question}" - got: "${response}"`);
  }
};
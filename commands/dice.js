/**
 * Dice Command
 * 
 * Command untuk melempar dadu virtual dengan berbagai jumlah sisi.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');

// Emoji untuk setiap nomor dadu standard (6 sisi)
const diceEmoji = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Lempar dadu virtual dengan jumlah sisi yang bisa disesuaikan')
    .addIntegerOption(option => 
      option.setName('count')
        .setDescription('Jumlah dadu yang ingin dilempar (1-10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10))
    .addIntegerOption(option => 
      option.setName('sides')
        .setDescription('Jumlah sisi dadu (2-100)')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100))
    .addBooleanOption(option => 
      option.setName('sum')
        .setDescription('Apakah ingin menjumlahkan hasil dadu')
        .setRequired(false)),
  
  async execute(interaction) {
    try {
      // Dapatkan opsi command
      const count = interaction.options.getInteger('count') || 1;
      const sides = interaction.options.getInteger('sides') || 6;
      const sum = interaction.options.getBoolean('sum') || false;
      
      // Defer reply agar bot tidak terlihat "not responding"
      await interaction.deferReply();
      
      // Lempar dadu
      const results = [];
      let total = 0;
      
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        results.push(roll);
        total += roll;
      }
      
      // Buat pesan hasil
      const embed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle(`🎲 Hasil Lemparan Dadu ${count}d${sides}`)
        .setDescription(`${interaction.user} melempar ${count} dadu dengan ${sides} sisi!`)
        .setTimestamp();
      
      // Tambahkan hasil untuk setiap dadu
      if (count === 1) {
        // Jika hanya 1 dadu
        const roll = results[0];
        const emoji = sides === 6 ? diceEmoji[roll] : '🎲';
        embed.addFields(
          { name: 'Hasil', value: `${emoji} **${roll}**`, inline: true }
        );
      } else {
        // Jika lebih dari 1 dadu
        const resultText = results.map((roll, index) => {
          const emoji = sides === 6 ? diceEmoji[roll] : '🎲';
          return `Dadu ${index+1}: ${emoji} **${roll}**`;
        }).join('\n');
        
        embed.addFields(
          { name: 'Hasil', value: resultText, inline: false }
        );
        
        // Tambahkan total jika diminta
        if (sum) {
          embed.addFields(
            { name: 'Total', value: `📊 **${total}**`, inline: true }
          );
        }
      }
      
      // Kirim hasil lemparan dadu
      await interaction.editReply({ embeds: [embed] });
      logger.info(`User ${interaction.user.tag} rolled ${count}d${sides} and got ${results.join(', ')}`);
    } catch (error) {
      logger.error(`Error executing dice command: ${error.message}`);
      
      // Beri tahu pengguna jika terjadi error
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat melempar dadu.',
          ephemeral: true
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat melempar dadu.',
          ephemeral: true
        });
      }
    }
  }
};
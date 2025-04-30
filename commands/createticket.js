/**
 * Create Ticket Command
 * 
 * Command untuk membuat embed ticket dengan buttons.
 * User bisa membuat ticket dengan mengklik button.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logger } = require('../../utils/logger');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createticket')
    .setDescription('Membuat panel ticket dengan embed dan button')
    .addStringOption(option => 
      option.setName('title')
        .setDescription('Judul embed ticket')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('description')
        .setDescription('Deskripsi embed ticket')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('button_label')
        .setDescription('Text pada button ticket')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('button_emoji')
        .setDescription('Emoji pada button ticket (opsional)')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('footer')
        .setDescription('Text footer pada embed (opsional)')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('color')
        .setDescription('Warna embed dalam format HEX (default: FF6200)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
  async execute(interaction) {
    try {
      // Verifikasi hak akses berdasarkan role
      const allowedRoles = [
        '1343224344591077386', // Role IDs sesuai yang diberikan user
        '1343224002113699973',
        '1343223432334282894',
        '1343224904182661232',
        '1343223596792811561',
        '1343224119159947315',
        '1343219680650727527',
        '1343220918096363520',
        '1343221052125479003'
      ];
      
      const hasPermission = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));
      
      if (!hasPermission) {
        return interaction.reply({
          content: '❌ Anda tidak memiliki izin untuk menggunakan perintah ini.',
          ephemeral: true
        });
      }
      
      // Dapatkan options
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const buttonLabel = interaction.options.getString('button_label');
      const buttonEmoji = interaction.options.getString('button_emoji');
      const footer = interaction.options.getString('footer') || `𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁`;
      const color = interaction.options.getString('color') || 'FF6200';
      
      // Buat Embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(`#${color.replace('#', '')}`)
        .setFooter({ 
          text: footer,
          iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
        })
        .setAuthor({
          name: `𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 𝙱𝙾𝚃`,
          iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
        })
        .setTimestamp();
        
      // Buat Button
      const button = new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel(buttonLabel)
        .setStyle(ButtonStyle.Primary);
        
      // Tambah emoji jika ada
      if (buttonEmoji) {
        button.setEmoji(buttonEmoji);
      }
      
      const row = new ActionRowBuilder().addComponents(button);
      
      // Kirim pesan
      await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });
      
      // Konfirmasi kepada user yang menjalankan command
      return interaction.reply({
        content: '✅ Panel ticket berhasil dibuat!',
        ephemeral: true
      });
      
    } catch (error) {
      logger.error('Error creating ticket panel:', error);
      return interaction.reply({
        content: '❌ Terjadi kesalahan saat membuat panel ticket.',
        ephemeral: true
      });
    }
  },
};
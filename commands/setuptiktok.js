/**
 * Setup TikTok Notifications Command
 * 
 * Command untuk mengatur notifikasi live TikTok.
 * Gunakan command ini untuk menambah atau menghapus notifikasi TikTok.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addNotificationChannel, removeNotificationChannel } = require('../../services/tiktokRealtimeService');
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setuptiktok')
    .setDescription('Atur notifikasi live TikTok')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Tambahkan notifikasi TikTok baru')
        .addStringOption(option => 
          option.setName('username')
            .setDescription('Username TikTok (tanpa @)')
            .setRequired(true))
        .addChannelOption(option => 
          option.setName('channel')
            .setDescription('Channel untuk mengirim notifikasi')
            .setRequired(true))
        .addRoleOption(option => 
          option.setName('role')
            .setDescription('Role untuk di-mention saat live dimulai')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Hapus notifikasi TikTok')
        .addStringOption(option => 
          option.setName('username')
            .setDescription('Username TikTok yang ingin dihapus notifikasinya')
            .setRequired(true))),
            
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      
      if (subcommand === 'add') {
        // Ambil parameter
        let username = interaction.options.getString('username');
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        
        // Validasi username
        if (username.startsWith('@')) {
          username = username.substring(1);
        }
        
        if (!username || username.includes(' ')) {
          return interaction.reply({
            embeds: [createErrorEmbed('Username TikTok tidak valid. Jangan gunakan spasi dan karakter khusus.')],
            ephemeral: true
          });
        }
        
        // Validasi channel
        if (!channel.isTextBased()) {
          return interaction.reply({
            embeds: [createErrorEmbed('Channel harus berupa text channel.')],
            ephemeral: true
          });
        }
        
        // Tambahkan notifikasi
        const success = addNotificationChannel(channel.id, username, role ? role.id : null);
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('✅ Notifikasi TikTok Ditambahkan')
            .setDescription(`Notifikasi untuk akun TikTok **@${username}** telah diatur.`)
            .setColor('#2ecc71')
            .addFields(
              { name: 'Channel', value: `<#${channel.id}>`, inline: true },
              { name: 'Role Mention', value: role ? `<@&${role.id}>` : 'Tidak ada', inline: true },
              { name: 'Tentang Fitur', value: 'Bot akan secara otomatis memeriksa akun TikTok ini setiap 15 detik. Saat akun mulai LIVE, bot akan segera mengirimkan notifikasi ke channel yang ditentukan.' }
            )
            .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
            .setTimestamp();
            
          await interaction.reply({ embeds: [embed] });
          logger.info(`TikTok notification added for @${username} in channel ${channel.name} by ${interaction.user.tag}`);
        } else {
          await interaction.reply({
            embeds: [createErrorEmbed('Gagal menambahkan notifikasi TikTok. Silakan coba lagi.')],
            ephemeral: true
          });
        }
      } else if (subcommand === 'remove') {
        // Ambil parameter
        let username = interaction.options.getString('username');
        
        // Validasi username
        if (username.startsWith('@')) {
          username = username.substring(1);
        }
        
        // Hapus notifikasi
        const success = removeNotificationChannel(username);
        
        if (success) {
          await interaction.reply({
            embeds: [createSuccessEmbed(`Notifikasi untuk akun TikTok **@${username}** telah dihapus.`)]
          });
          logger.info(`TikTok notification removed for @${username} by ${interaction.user.tag}`);
        } else {
          await interaction.reply({
            embeds: [createErrorEmbed(`Tidak ada notifikasi yang terdaftar untuk akun TikTok **@${username}**.`)],
            ephemeral: true
          });
        }
      }
    } catch (error) {
      logger.error('Error executing setupTikTok command:', error);
      await interaction.reply({
        embeds: [createErrorEmbed('Terjadi kesalahan saat mengatur notifikasi TikTok. Silakan coba lagi.')],
        ephemeral: true
      });
    }
  }
};
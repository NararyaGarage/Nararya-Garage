/**
 * Inventory Command
 * 
 * Command untuk melihat barang-barang yang dimiliki pengguna.
 * Sistem ekonomi dengan NGC (Nararya Garage Currency).
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');

// File untuk data ekonomi
const economyFilePath = path.join(__dirname, '..', '..', 'data', 'economy.json');

// Pastikan folder data ada
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file ekonomi ada
if (!fs.existsSync(economyFilePath)) {
  fs.writeFileSync(economyFilePath, JSON.stringify({ users: {} }, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Lihat barang-barang yang kamu miliki')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Lihat inventory user lain (khusus admin)')
        .setRequired(false)),
        
  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const userId = targetUser.id;
      
      // Cek apakah user memiliki permission untuk melihat inventory user lain
      if (targetUser.id !== interaction.user.id && !interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({
          content: 'Kamu tidak memiliki izin untuk melihat inventory user lain.',
          ephemeral: true
        });
      }
      
      // Baca data ekonomi
      const economyData = JSON.parse(fs.readFileSync(economyFilePath, 'utf8'));
      
      // Cek apakah user sudah ada di sistem ekonomi
      if (!economyData.users[userId]) {
        economyData.users[userId] = {
          balance: 100, // NGC awal untuk user baru
          inventory: {},
          transactions: []
        };
        
        // Simpan user baru
        fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
      }
      
      // Ambil data inventory
      const userInventory = economyData.users[userId].inventory;
      const userBalance = economyData.users[userId].balance;
      
      // Cek apakah inventory kosong
      if (Object.keys(userInventory).length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setTitle(`🎒 Inventory ${targetUser.username}`)
          .setDescription(`Inventory kosong. Gunakan \`/pasar\` untuk membeli barang.`)
          .setColor('#95a5a6')
          .addFields({ name: 'Saldo NGC', value: `${userBalance} NGC`, inline: true })
          .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
          .setTimestamp();
          
        return interaction.reply({ embeds: [emptyEmbed] });
      }
      
      // Persiapkan informasi untuk embed
      let itemList = '';
      
      for (const [itemId, itemData] of Object.entries(userInventory)) {
        itemList += `**${itemData.name}** (ID: \`${itemId}\`)\n`;
        itemList += `Jumlah: ${itemData.quantity}\n`;
        itemList += `Pembelian terakhir: ${new Date(itemData.purchaseDate[itemData.purchaseDate.length - 1].date).toLocaleDateString()}\n\n`;
      }
      
      // Buat embed untuk inventory
      const embed = new EmbedBuilder()
        .setTitle(`🎒 Inventory ${targetUser.username}`)
        .setDescription(itemList)
        .setColor('#3498db')
        .addFields({ name: 'Saldo NGC', value: `${userBalance} NGC`, inline: true })
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Tombol untuk kembali ke pasar
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('go_to_pasar')
            .setLabel('Ke Pasar')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏪'),
          new ButtonBuilder()
            .setCustomId('transaction_history')
            .setLabel('Riwayat Transaksi')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📜')
        );
      
      await interaction.reply({
        embeds: [embed],
        components: [buttons]
      });
      
    } catch (error) {
      logger.error('Error in inventory command:', error);
      await interaction.reply({
        content: 'Terjadi kesalahan saat menampilkan inventory.',
        ephemeral: true
      });
    }
  }
};
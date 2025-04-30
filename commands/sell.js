/**
 * Sell Command
 * 
 * Command untuk menjual barang ke marketplace NGC.
 * Sistem ekonomi dengan NGC (Nararya Garage Currency).
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');

// File untuk data ekonomi
const economyFilePath = path.join(__dirname, '..', '..', 'data', 'economy.json');
const marketFilePath = path.join(__dirname, '..', '..', 'data', 'marketplace.json');

// Pastikan folder data ada
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file ekonomi ada
if (!fs.existsSync(economyFilePath)) {
  fs.writeFileSync(economyFilePath, JSON.stringify({ users: {} }, null, 2));
}

// Pastikan file marketplace ada
if (!fs.existsSync(marketFilePath)) {
  const defaultMarket = {
    items: [
      {
        id: 'ngc_ticket',
        name: 'NGC Ticket',
        description: 'Tiket spesial yang bisa ditukarkan dengan hadiah di event',
        basePrice: 250,
        stock: 100,
        maxPerUser: 5,
        category: 'special'
      },
      {
        id: 'vip_role',
        name: 'VIP Role',
        description: 'Role VIP untuk 1 minggu',
        basePrice: 500,
        stock: 10,
        maxPerUser: 1,
        category: 'role'
      },
      {
        id: 'pfp_custom',
        name: 'Custom Profile Picture',
        description: 'Ubah profile picture bot untuk 1 hari',
        basePrice: 1000,
        stock: 5,
        maxPerUser: 1,
        category: 'custom'
      },
      {
        id: 'nickname_change',
        name: 'Nickname Change',
        description: 'Ubah nickname member lain',
        basePrice: 300,
        stock: 20,
        maxPerUser: 3,
        category: 'power'
      },
      {
        id: 'voice_effect',
        name: 'Voice Effect',
        description: 'Efek suara khusus di voice channel',
        basePrice: 150,
        stock: 30,
        maxPerUser: 3,
        category: 'perk'
      }
    ],
    lastUpdate: new Date().toISOString()
  };
  fs.writeFileSync(marketFilePath, JSON.stringify(defaultMarket, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Jual barang ke marketplace')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('ID barang yang ingin dijual')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('quantity')
        .setDescription('Jumlah barang yang ingin dijual')
        .setRequired(false)),
        
  async execute(interaction) {
    try {
      const itemId = interaction.options.getString('item');
      const quantity = interaction.options.getInteger('quantity') || 1;
      const userId = interaction.user.id;
      
      // Validasi jumlah penjualan
      if (quantity <= 0) {
        return interaction.reply({
          content: 'Jumlah penjualan harus lebih dari 0',
          ephemeral: true
        });
      }
      
      // Baca data ekonomi dan market
      const economyData = JSON.parse(fs.readFileSync(economyFilePath, 'utf8'));
      const marketData = JSON.parse(fs.readFileSync(marketFilePath, 'utf8'));
      
      // Cek apakah user sudah ada di sistem ekonomi
      if (!economyData.users[userId]) {
        economyData.users[userId] = {
          balance: 100, // NGC awal untuk user baru
          inventory: {},
          transactions: []
        };
      }
      
      // Cek apakah user memiliki barang yang ingin dijual
      const userInventory = economyData.users[userId].inventory;
      
      if (!userInventory[itemId] || userInventory[itemId].quantity < quantity) {
        return interaction.reply({
          content: `Kamu tidak memiliki cukup ${itemId} untuk dijual. Kamu memiliki: ${userInventory[itemId] ? userInventory[itemId].quantity : 0}`,
          ephemeral: true
        });
      }
      
      // Cari barang di marketplace
      const marketItem = marketData.items.find(i => i.id === itemId);
      
      if (!marketItem) {
        return interaction.reply({
          content: `Barang dengan ID "${itemId}" tidak ditemukan di marketplace`,
          ephemeral: true
        });
      }
      
      // Hitung harga jual (biasanya lebih rendah dari harga beli)
      // Harga jual adalah 70% dari harga dasar
      const sellPrice = Math.round(marketItem.basePrice * 0.7);
      const totalEarned = sellPrice * quantity;
      
      // Proses penjualan
      economyData.users[userId].balance += totalEarned;
      userInventory[itemId].quantity -= quantity;
      marketItem.stock += quantity;
      
      // Hapus item dari inventory jika jumlahnya 0
      if (userInventory[itemId].quantity <= 0) {
        delete userInventory[itemId];
      }
      
      // Catat transaksi
      economyData.users[userId].transactions.push({
        type: 'sale',
        itemId: itemId,
        itemName: marketItem.name,
        quantity: quantity,
        price: sellPrice,
        total: totalEarned,
        date: new Date().toISOString()
      });
      
      // Simpan perubahan
      fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
      fs.writeFileSync(marketFilePath, JSON.stringify(marketData, null, 2));
      
      // Buat embed untuk konfirmasi penjualan
      const embed = new EmbedBuilder()
        .setTitle('💰 Penjualan Berhasil')
        .setDescription(`Kamu telah menjual ${quantity} ${marketItem.name}`)
        .setColor('#f1c40f')
        .addFields(
          { name: 'Barang', value: marketItem.name, inline: true },
          { name: 'Jumlah', value: quantity.toString(), inline: true },
          { name: 'Harga Satuan', value: `${sellPrice} NGC`, inline: true },
          { name: 'Total Diterima', value: `${totalEarned} NGC`, inline: true },
          { name: 'Saldo Sekarang', value: `${economyData.users[userId].balance} NGC`, inline: true }
        )
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      logger.error('Error in sell command:', error);
      await interaction.reply({
        content: 'Terjadi kesalahan saat memproses penjualan.',
        ephemeral: true
      });
    }
  }
};
/**
 * Buy Command
 * 
 * Command untuk membeli barang dari marketplace NGC.
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
    .setName('buy')
    .setDescription('Beli barang dari marketplace')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('ID barang yang ingin dibeli')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('quantity')
        .setDescription('Jumlah barang yang ingin dibeli')
        .setRequired(false)),
        
  async execute(interaction) {
    try {
      const itemId = interaction.options.getString('item');
      const quantity = interaction.options.getInteger('quantity') || 1;
      const userId = interaction.user.id;
      
      // Validasi jumlah pembelian
      if (quantity <= 0) {
        return interaction.reply({
          content: 'Jumlah pembelian harus lebih dari 0',
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
      
      // Cari barang yang ingin dibeli
      const item = marketData.items.find(i => i.id === itemId);
      
      if (!item) {
        return interaction.reply({
          content: `Barang dengan ID "${itemId}" tidak ditemukan di marketplace`,
          ephemeral: true
        });
      }
      
      // Cek stok
      if (item.stock < quantity) {
        return interaction.reply({
          content: `Stok tidak mencukupi. Stok tersedia: ${item.stock}`,
          ephemeral: true
        });
      }
      
      // Cek batas pembelian per user
      const userInventory = economyData.users[userId].inventory;
      const currentOwned = userInventory[itemId] ? userInventory[itemId].quantity : 0;
      
      if (currentOwned + quantity > item.maxPerUser) {
        return interaction.reply({
          content: `Kamu hanya bisa memiliki maksimal ${item.maxPerUser} ${item.name}. Kamu sudah memiliki ${currentOwned}`,
          ephemeral: true
        });
      }
      
      // Hitung harga berdasarkan supply-demand
      // Semakin sedikit stok, semakin mahal
      const demandMultiplier = Math.max(0.8, 1 + (1 - item.stock / 100) * 0.5);
      const finalPrice = Math.round(item.basePrice * demandMultiplier);
      const totalCost = finalPrice * quantity;
      
      // Cek saldo user
      if (economyData.users[userId].balance < totalCost) {
        return interaction.reply({
          content: `Saldo NGC tidak mencukupi. Kamu membutuhkan ${totalCost} NGC, tapi hanya memiliki ${economyData.users[userId].balance} NGC`,
          ephemeral: true
        });
      }
      
      // Proses pembelian
      economyData.users[userId].balance -= totalCost;
      item.stock -= quantity;
      
      // Update inventory user
      if (!userInventory[itemId]) {
        userInventory[itemId] = {
          name: item.name,
          quantity: 0,
          purchaseDate: []
        };
      }
      
      userInventory[itemId].quantity += quantity;
      userInventory[itemId].purchaseDate.push({
        date: new Date().toISOString(),
        quantity: quantity,
        price: finalPrice
      });
      
      // Catat transaksi
      economyData.users[userId].transactions.push({
        type: 'purchase',
        itemId: itemId,
        itemName: item.name,
        quantity: quantity,
        price: finalPrice,
        total: totalCost,
        date: new Date().toISOString()
      });
      
      // Simpan perubahan
      fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
      fs.writeFileSync(marketFilePath, JSON.stringify(marketData, null, 2));
      
      // Buat embed untuk konfirmasi pembelian
      const embed = new EmbedBuilder()
        .setTitle('✅ Pembelian Berhasil')
        .setDescription(`Kamu telah membeli ${quantity} ${item.name}`)
        .setColor('#2ecc71')
        .addFields(
          { name: 'Barang', value: item.name, inline: true },
          { name: 'Jumlah', value: quantity.toString(), inline: true },
          { name: 'Harga Satuan', value: `${finalPrice} NGC`, inline: true },
          { name: 'Total Biaya', value: `${totalCost} NGC`, inline: true },
          { name: 'Saldo Tersisa', value: `${economyData.users[userId].balance} NGC`, inline: true }
        )
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      logger.error('Error in buy command:', error);
      await interaction.reply({
        content: 'Terjadi kesalahan saat memproses pembelian.',
        ephemeral: true
      });
    }
  }
};
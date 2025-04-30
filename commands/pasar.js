/**
 * Pasar Command
 * 
 * Command untuk melihat barang-barang yang tersedia di marketplace NGC.
 * Sistem ekonomi dengan NGC (Nararya Garage Currency).
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');

// File untuk data ekonomi dan market
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
    .setName('pasar')
    .setDescription('Lihat barang-barang di marketplace')
    .addStringOption(option =>
      option
        .setName('kategori')
        .setDescription('Tampilkan barang berdasarkan kategori')
        .setRequired(false)
        .addChoices(
          { name: 'Semua', value: 'all' },
          { name: 'Special', value: 'special' },
          { name: 'Role', value: 'role' },
          { name: 'Custom', value: 'custom' },
          { name: 'Power', value: 'power' },
          { name: 'Perk', value: 'perk' }
        )),
        
  async execute(interaction) {
    try {
      const category = interaction.options.getString('kategori') || 'all';
      const userId = interaction.user.id;
      
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
        
        // Simpan user baru
        fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
      }
      
      // Ambil saldo user
      const userBalance = economyData.users[userId].balance;
      
      // Filter barang berdasarkan kategori
      let items = marketData.items;
      if (category !== 'all') {
        items = items.filter(item => item.category === category);
      }
      
      // Jika tidak ada barang di kategori tersebut
      if (items.length === 0) {
        return interaction.reply({
          content: `Tidak ada barang dalam kategori ${category}`,
          ephemeral: true
        });
      }
      
      // Persiapkan informasi untuk embed
      let itemList = '';
      
      for (const item of items) {
        // Hitung harga berdasarkan supply-demand
        const demandMultiplier = Math.max(0.8, 1 + (1 - item.stock / 100) * 0.5);
        const buyPrice = Math.round(item.basePrice * demandMultiplier);
        const sellPrice = Math.round(item.basePrice * 0.7);
        
        // Tambahkan informasi item ke daftar
        itemList += `**${item.name}** (ID: \`${item.id}\`)\n`;
        itemList += `${item.description}\n`;
        itemList += `💰 Beli: ${buyPrice} NGC | 💸 Jual: ${sellPrice} NGC\n`;
        itemList += `📦 Stok: ${item.stock} | 🛒 Max per user: ${item.maxPerUser}\n\n`;
      }
      
      // Buat embed untuk marketplace
      const embed = new EmbedBuilder()
        .setTitle('🏪 NGC Marketplace')
        .setDescription(`Selamat datang di Pasar Nararya Garage!\nSaldo kamu: **${userBalance} NGC**\n\n${itemList}`)
        .setColor('#f39c12')
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Tambahkan petunjuk penggunaan
      embed.addFields(
        { name: 'Cara Membeli', value: '`/buy item:<id_item> quantity:<jumlah>`', inline: true },
        { name: 'Cara Menjual', value: '`/sell item:<id_item> quantity:<jumlah>`', inline: true }
      );
      
      // Tombol untuk refresh pasar dan cek inventory
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('refresh_pasar')
            .setLabel('Refresh Pasar')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔄'),
          new ButtonBuilder()
            .setCustomId('inventory')
            .setLabel('Inventory')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🎒')
        );
      
      await interaction.reply({
        embeds: [embed],
        components: [buttons]
      });
      
    } catch (error) {
      logger.error('Error in pasar command:', error);
      await interaction.reply({
        content: 'Terjadi kesalahan saat menampilkan marketplace.',
        ephemeral: true
      });
    }
  }
};
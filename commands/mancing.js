/**
 * Mancing Command
 * 
 * Command untuk memancing ikan dan mendapatkan NGC.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

// Data File Path
const dataFile = path.join(__dirname, '../../data/economy.json');
const fishingDataFile = path.join(__dirname, '../../data/fishing.json');

// Create directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure economy data file exists
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({
    users: {},
    lastReset: Date.now()
  }));
}

// Ensure fishing data file exists
if (!fs.existsSync(fishingDataFile)) {
  fs.writeFileSync(fishingDataFile, JSON.stringify({
    users: {},
    lastReset: Date.now()
  }));
}

// Cooldown tracking for fishing
const fishingCooldowns = new Map();

// Fishing items
const fishingItems = [
  { id: 'ikan_mas', name: 'Ikan Mas', value: 40, rarity: 'common', chance: 30 },
  { id: 'ikan_nila', name: 'Ikan Nila', value: 35, rarity: 'common', chance: 30 },
  { id: 'ikan_lele', name: 'Ikan Lele', value: 30, rarity: 'common', chance: 30 },
  { id: 'ikan_gurame', name: 'Ikan Gurame', value: 50, rarity: 'uncommon', chance: 20 },
  { id: 'ikan_bawal', name: 'Ikan Bawal', value: 55, rarity: 'uncommon', chance: 15 },
  { id: 'ikan_mujair', name: 'Ikan Mujair', value: 60, rarity: 'uncommon', chance: 15 },
  { id: 'ikan_patin', name: 'Ikan Patin', value: 70, rarity: 'rare', chance: 10 },
  { id: 'ikan_gabus', name: 'Ikan Gabus', value: 75, rarity: 'rare', chance: 8 },
  { id: 'ikan_tuna', name: 'Ikan Tuna', value: 100, rarity: 'rare', chance: 5 },
  { id: 'ikan_salmon', name: 'Ikan Salmon', value: 120, rarity: 'epic', chance: 3 },
  { id: 'ikan_hiu', name: 'Ikan Hiu', value: 150, rarity: 'epic', chance: 2 },
  { id: 'ikan_paus', name: 'Ikan Paus', value: 300, rarity: 'legendary', chance: 1 },
  { id: 'sepatu_boot', name: 'Sepatu Boot', value: 5, rarity: 'trash', chance: 20 },
  { id: 'kaleng_bekas', name: 'Kaleng Bekas', value: 3, rarity: 'trash', chance: 25 },
  { id: 'plastik', name: 'Sampah Plastik', value: 2, rarity: 'trash', chance: 30 },
  { id: 'ban_bekas', name: 'Ban Bekas', value: 4, rarity: 'trash', chance: 15 },
  { id: 'emas', name: 'Emas', value: 500, rarity: 'mythic', chance: 0.5 },
  { id: 'berlian', name: 'Berlian', value: 1000, rarity: 'mythic', chance: 0.1 }
];

// Fishing rod levels
const rodLevels = [
  { level: 1, name: 'Pancingan Bambu', cost: 0, multiplier: 1, cooldown: 3600000 }, // 1 jam
  { level: 2, name: 'Pancingan Kayu', cost: 1000, multiplier: 1.2, cooldown: 3000000 }, // 50 menit
  { level: 3, name: 'Pancingan Aluminium', cost: 3000, multiplier: 1.5, cooldown: 2400000 }, // 40 menit
  { level: 4, name: 'Pancingan Carbon', cost: 8000, multiplier: 2, cooldown: 1800000 }, // 30 menit
  { level: 5, name: 'Pancingan Pro', cost: 20000, multiplier: 3, cooldown: 1200000 } // 20 menit
];

// Rarity colors
const rarityColors = {
  'trash': '#7F8C8D', // Gray
  'common': '#2ECC71', // Green
  'uncommon': '#3498DB', // Blue
  'rare': '#9B59B6', // Purple
  'epic': '#E91E63', // Pink
  'legendary': '#F1C40F', // Gold
  'mythic': '#E74C3C' // Red
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mancing')
    .setDescription('Memancing untuk mendapatkan ikan dan NGC')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Mulai memancing'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('inventory')
        .setDescription('Melihat hasil pancingan kamu'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('sell')
        .setDescription('Menjual hasil pancingan')
        .addStringOption(option =>
          option.setName('item')
            .setDescription('Item yang ingin dijual')
            .setRequired(true)
            .addChoices(
              { name: 'all', value: 'all' },
              { name: 'trash', value: 'trash' },
              { name: 'common', value: 'common' },
              { name: 'uncommon', value: 'uncommon' },
              { name: 'rare', value: 'rare' },
              { name: 'epic', value: 'epic' },
              { name: 'legendary', value: 'legendary' },
              { name: 'mythic', value: 'mythic' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('shop')
        .setDescription('Beli alat pancing yang lebih baik'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('upgrade')
        .setDescription('Upgrade alat pancingmu')
        .addIntegerOption(option =>
          option.setName('level')
            .setDescription('Level pancingan yang ingin dibeli')
            .setRequired(true)
            .addChoices(
              { name: 'Level 2 - Pancingan Kayu', value: 2 },
              { name: 'Level 3 - Pancingan Aluminium', value: 3 },
              { name: 'Level 4 - Pancingan Carbon', value: 4 },
              { name: 'Level 5 - Pancingan Pro', value: 5 }
            ))),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'start') {
      await goFishing(interaction);
    } else if (subcommand === 'inventory') {
      await viewInventory(interaction);
    } else if (subcommand === 'sell') {
      await sellFish(interaction);
    } else if (subcommand === 'shop') {
      await viewShop(interaction);
    } else if (subcommand === 'upgrade') {
      await upgradeFishingRod(interaction);
    }
  }
};

/**
 * Start fishing
 * @param {Interaction} interaction - Discord interaction
 */
async function goFishing(interaction) {
  try {
    const userId = interaction.user.id;
    
    // Get fishing data
    const fishingData = getFishingData();
    
    // Get or create user data
    if (!fishingData.users[userId]) {
      fishingData.users[userId] = {
        rodLevel: 1,
        lastFished: null,
        inventory: {},
        totalCaught: 0
      };
      saveFishingData(fishingData);
    }
    
    const userData = fishingData.users[userId];
    const rodLevel = userData.rodLevel || 1;
    const rod = rodLevels[rodLevel - 1];
    
    // Check cooldown
    if (fishingCooldowns.has(userId)) {
      return await interaction.reply({ 
        content: 'Kamu sedang memancing. Tunggu sebentar...', 
        ephemeral: true 
      });
    }
    
    // Check if already fished recently
    const lastFished = userData.lastFished ? new Date(userData.lastFished) : null;
    const now = new Date();
    
    if (lastFished && (now - lastFished) < rod.cooldown) {
      const timeLeft = Math.ceil((rod.cooldown - (now - lastFished)) / 60000);
      
      return await interaction.reply({ 
        content: `Alat pancingmu masih dipakai. Coba lagi dalam ${timeLeft} menit!`, 
        ephemeral: true 
      });
    }
    
    // Set cooldown
    fishingCooldowns.set(userId, true);
    
    // Show fishing animation
    await interaction.reply({ 
      content: `🎣 ${interaction.user}, kamu mulai memancing dengan ${rod.name}...`
    });
    
    // Wait for 3 seconds for the "fishing" effect
    setTimeout(async () => {
      // Pick random item based on weighted chance
      const item = pickRandomItem(rod.multiplier);
      
      // Add to inventory
      if (!userData.inventory[item.id]) {
        userData.inventory[item.id] = 0;
      }
      
      userData.inventory[item.id]++;
      userData.totalCaught = (userData.totalCaught || 0) + 1;
      userData.lastFished = now.getTime();
      
      // Save fishing data
      saveFishingData(fishingData);
      
      // Get rarity color
      const color = rarityColors[item.rarity] || '#000000';
      
      // Prepare embed
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`🎣 Hasil Mancing: ${item.name}`)
        .setDescription(`${interaction.user} mendapatkan **${item.name}** (${item.rarity})!`)
        .addFields(
          { name: 'Nilai', value: `${item.value} NGC`, inline: true },
          { name: 'Tingkat Kelangkaan', value: formatRarity(item.rarity), inline: true },
          { name: 'Alat Pancing', value: rod.name, inline: true }
        )
        .setFooter({ text: 'Gunakan /mancing sell untuk menjual hasil pancingan' })
        .setTimestamp();
      
      // Send result
      await interaction.editReply({ 
        content: null,
        embeds: [embed]
      });
      
      // Remove cooldown
      fishingCooldowns.delete(userId);
      
      logger.info(`User ${interaction.user.tag} caught ${item.name} (${item.rarity}) worth ${item.value} NGC`);
    }, 3000);
    
  } catch (error) {
    // Remove cooldown in case of error
    fishingCooldowns.delete(interaction.user.id);
    
    logger.error(`Error while fishing: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat memancing. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * View fishing inventory
 * @param {Interaction} interaction - Discord interaction
 */
async function viewInventory(interaction) {
  try {
    const userId = interaction.user.id;
    
    // Get fishing data
    const fishingData = getFishingData();
    
    // Get or create user data
    if (!fishingData.users[userId]) {
      fishingData.users[userId] = {
        rodLevel: 1,
        lastFished: null,
        inventory: {},
        totalCaught: 0
      };
      saveFishingData(fishingData);
    }
    
    const userData = fishingData.users[userId];
    const rodLevel = userData.rodLevel || 1;
    const rod = rodLevels[rodLevel - 1];
    const inventory = userData.inventory || {};
    
    // Check if inventory is empty
    if (Object.keys(inventory).length === 0) {
      return await interaction.reply({ 
        content: 'Kamu belum memiliki ikan. Gunakan `/mancing start` untuk mulai memancing!', 
        ephemeral: true 
      });
    }
    
    // Prepare inventory list by rarity
    const inventoryByRarity = {
      trash: [],
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
      mythic: []
    };
    
    // Calculate total value
    let totalValue = 0;
    
    // Iterate through all items in inventory
    for (const itemId in inventory) {
      const count = inventory[itemId];
      const itemData = fishingItems.find(item => item.id === itemId);
      
      if (itemData && count > 0) {
        const value = itemData.value * count;
        totalValue += value;
        
        inventoryByRarity[itemData.rarity].push(`${itemData.name} (${count}x) - ${value} NGC`);
      }
    }
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🎣 Inventory Mancing: ${interaction.user.username}`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Total ikan tertangkap: **${userData.totalCaught || 0}**\nNilai total: **${totalValue} NGC**\nAlat pancing: **${rod.name} (Level ${rodLevel})**`)
      .setFooter({ text: 'Gunakan /mancing sell untuk menjual hasil pancingan' })
      .setTimestamp();
    
    // Add fields for each rarity if they exist
    for (const [rarity, items] of Object.entries(inventoryByRarity)) {
      if (items.length > 0) {
        embed.addFields({
          name: `${formatRarity(rarity)} (${items.length} item)`,
          value: items.join('\n'),
          inline: false
        });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`User ${interaction.user.tag} viewed fishing inventory worth ${totalValue} NGC`);
  } catch (error) {
    logger.error(`Error viewing fishing inventory: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat melihat inventory. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * Sell fish from inventory
 * @param {Interaction} interaction - Discord interaction
 */
async function sellFish(interaction) {
  try {
    const userId = interaction.user.id;
    const itemType = interaction.options.getString('item');
    
    // Get fishing data
    const fishingData = getFishingData();
    const economyData = getEconomyData();
    
    // Get or create user data
    if (!fishingData.users[userId]) {
      fishingData.users[userId] = {
        rodLevel: 1,
        lastFished: null,
        inventory: {},
        totalCaught: 0
      };
      saveFishingData(fishingData);
    }
    
    if (!economyData.users[userId]) {
      economyData.users[userId] = {
        balance: 0,
        lastDaily: null,
        transactions: []
      };
      saveEconomyData(economyData);
    }
    
    const userData = fishingData.users[userId];
    const inventory = userData.inventory || {};
    
    // Check if inventory is empty
    if (Object.keys(inventory).length === 0) {
      return await interaction.reply({ 
        content: 'Kamu belum memiliki ikan. Gunakan `/mancing start` untuk mulai memancing!', 
        ephemeral: true 
      });
    }
    
    // Items to sell and total value
    const itemsToSell = [];
    let totalValue = 0;
    let itemsSold = 0;
    
    // Determine which items to sell
    for (const itemId in inventory) {
      const count = inventory[itemId];
      const itemData = fishingItems.find(item => item.id === itemId);
      
      if (itemData && count > 0) {
        if (itemType === 'all' || itemType === itemData.rarity) {
          itemsToSell.push({
            id: itemId,
            name: itemData.name,
            count: count,
            value: itemData.value * count,
            rarity: itemData.rarity
          });
          
          totalValue += itemData.value * count;
          itemsSold += count;
          
          // Remove from inventory
          delete inventory[itemId];
        }
      }
    }
    
    // If no items were sold
    if (itemsToSell.length === 0) {
      return await interaction.reply({ 
        content: `Kamu tidak memiliki ikan dengan tipe "${itemType}" untuk dijual.`, 
        ephemeral: true 
      });
    }
    
    // Add NGC to user balance
    economyData.users[userId].balance += totalValue;
    
    // Record transaction
    economyData.users[userId].transactions.push({
      type: 'fishing_sell',
      amount: totalValue,
      itemCount: itemsSold,
      timestamp: Date.now()
    });
    
    // Save data
    saveFishingData(fishingData);
    saveEconomyData(economyData);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('💰 Penjualan Hasil Mancing')
      .setDescription(`${interaction.user} telah menjual ${itemsSold} ikan dengan total **${totalValue} NGC**!`)
      .addFields(
        { name: 'Total NGC', value: `${totalValue} NGC`, inline: true },
        { name: 'Saldo Baru', value: `${economyData.users[userId].balance} NGC`, inline: true }
      )
      .setFooter({ text: 'Terima kasih telah menjual ikan!' })
      .setTimestamp();
    
    // Add field for sold items if not too many
    if (itemsToSell.length <= 15) {
      const soldItemsText = itemsToSell.map(item => `${item.name} (${item.count}x) - ${item.value} NGC`).join('\n');
      embed.addFields({ name: 'Ikan Terjual', value: soldItemsText });
    } else {
      embed.addFields({ name: 'Ikan Terjual', value: `${itemsSold} ikan dari kategori ${itemType}` });
    }
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`User ${interaction.user.tag} sold ${itemsSold} fish for ${totalValue} NGC`);
  } catch (error) {
    logger.error(`Error selling fish: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat menjual ikan. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * View fishing shop
 * @param {Interaction} interaction - Discord interaction
 */
async function viewShop(interaction) {
  try {
    const userId = interaction.user.id;
    
    // Get fishing and economy data
    const fishingData = getFishingData();
    const economyData = getEconomyData();
    
    // Get or create user data
    if (!fishingData.users[userId]) {
      fishingData.users[userId] = {
        rodLevel: 1,
        lastFished: null,
        inventory: {},
        totalCaught: 0
      };
      saveFishingData(fishingData);
    }
    
    if (!economyData.users[userId]) {
      economyData.users[userId] = {
        balance: 0,
        lastDaily: null,
        transactions: []
      };
      saveEconomyData(economyData);
    }
    
    const userData = fishingData.users[userId];
    const rodLevel = userData.rodLevel || 1;
    const balance = economyData.users[userId].balance || 0;
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🎣 Toko Alat Pancing')
      .setDescription(`Saldo NGC kamu: **${balance} NGC**\nAlat pancing saat ini: **${rodLevels[rodLevel - 1].name} (Level ${rodLevel})**\n\nUpgrade alat pancing untuk mendapatkan peluang ikan yang lebih bagus dan cooldown yang lebih pendek!`)
      .setFooter({ text: 'Gunakan /mancing upgrade [level] untuk membeli' })
      .setTimestamp();
    
    // Add fields for each rod level
    rodLevels.forEach((rod, index) => {
      const level = index + 1;
      const canBuy = rodLevel < level && balance >= rod.cost;
      const statusText = rodLevel === level ? '(Terpasang)' : 
                         rodLevel > level ? '(Dimiliki)' : 
                         canBuy ? '(Dapat dibeli)' : '(NGC tidak cukup)';
      
      embed.addFields({
        name: `Level ${level}: ${rod.name} ${statusText}`,
        value: `💰 Harga: **${rod.cost} NGC**\n⏱️ Cooldown: **${formatTime(rod.cooldown)}**\n🎯 Bonus: **${(rod.multiplier * 100) - 100}%** peluang lebih baik`,
        inline: true
      });
    });
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`User ${interaction.user.tag} viewed fishing shop`);
  } catch (error) {
    logger.error(`Error viewing fishing shop: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat melihat toko. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * Upgrade fishing rod
 * @param {Interaction} interaction - Discord interaction
 */
async function upgradeFishingRod(interaction) {
  try {
    const userId = interaction.user.id;
    const targetLevel = interaction.options.getInteger('level');
    
    // Get fishing and economy data
    const fishingData = getFishingData();
    const economyData = getEconomyData();
    
    // Get or create user data
    if (!fishingData.users[userId]) {
      fishingData.users[userId] = {
        rodLevel: 1,
        lastFished: null,
        inventory: {},
        totalCaught: 0
      };
      saveFishingData(fishingData);
    }
    
    if (!economyData.users[userId]) {
      economyData.users[userId] = {
        balance: 0,
        lastDaily: null,
        transactions: []
      };
      saveEconomyData(economyData);
    }
    
    const userData = fishingData.users[userId];
    const currentRodLevel = userData.rodLevel || 1;
    const balance = economyData.users[userId].balance || 0;
    
    // Check if rod is already at or beyond target level
    if (currentRodLevel >= targetLevel) {
      return await interaction.reply({ 
        content: `Kamu sudah memiliki alat pancing level ${currentRodLevel} atau lebih tinggi!`, 
        ephemeral: true 
      });
    }
    
    // Get target rod data
    const targetRod = rodLevels[targetLevel - 1];
    
    // Check if user has enough NGC
    if (balance < targetRod.cost) {
      return await interaction.reply({ 
        content: `NGC tidak cukup! Kamu membutuhkan ${targetRod.cost} NGC untuk upgrade ke ${targetRod.name}.`, 
        ephemeral: true 
      });
    }
    
    // Deduct NGC
    economyData.users[userId].balance -= targetRod.cost;
    
    // Record transaction
    economyData.users[userId].transactions.push({
      type: 'fishing_rod_upgrade',
      amount: -targetRod.cost,
      rodLevel: targetLevel,
      timestamp: Date.now()
    });
    
    // Update rod level
    userData.rodLevel = targetLevel;
    
    // Save data
    saveFishingData(fishingData);
    saveEconomyData(economyData);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('🎣 Upgrade Alat Pancing')
      .setDescription(`${interaction.user} telah mengupgrade alat pancing ke **${targetRod.name} (Level ${targetLevel})**!`)
      .addFields(
        { name: 'Harga', value: `${targetRod.cost} NGC`, inline: true },
        { name: 'Saldo NGC', value: `${economyData.users[userId].balance} NGC`, inline: true },
        { name: 'Cooldown Baru', value: formatTime(targetRod.cooldown), inline: true },
        { name: 'Bonus Peluang', value: `+${(targetRod.multiplier * 100) - 100}%`, inline: true }
      )
      .setFooter({ text: 'Selamat memancing!' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`User ${interaction.user.tag} upgraded fishing rod to level ${targetLevel} for ${targetRod.cost} NGC`);
  } catch (error) {
    logger.error(`Error upgrading fishing rod: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat mengupgrade alat pancing. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * Pick a random item based on weighted chances and rod multiplier
 * @param {number} multiplier - Rod multiplier
 * @returns {Object} Selected item
 */
function pickRandomItem(multiplier) {
  // Calculate total chance
  const totalChance = fishingItems.reduce((total, item) => total + item.chance, 0);
  
  // Adjust chances based on rod multiplier
  const adjustedItems = fishingItems.map(item => {
    // Increase chance for better items, decrease for worse items
    let adjustedChance = item.chance;
    
    if (item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'mythic') {
      adjustedChance *= multiplier;
    } else if (item.rarity === 'trash') {
      adjustedChance /= multiplier;
    }
    
    return { ...item, adjustedChance };
  });
  
  // Calculate new total chance
  const newTotalChance = adjustedItems.reduce((total, item) => total + item.adjustedChance, 0);
  
  // Pick random number
  const random = Math.random() * newTotalChance;
  
  // Find item based on random number
  let cumulativeChance = 0;
  for (const item of adjustedItems) {
    cumulativeChance += item.adjustedChance;
    if (random < cumulativeChance) {
      return item;
    }
  }
  
  // Fallback to first item
  return adjustedItems[0];
}

/**
 * Format rarity with emojis
 * @param {string} rarity - Rarity name
 * @returns {string} Formatted rarity
 */
function formatRarity(rarity) {
  switch (rarity) {
    case 'trash':
      return '🗑️ Sampah';
    case 'common':
      return '⚪ Umum';
    case 'uncommon':
      return '🟢 Tidak Umum';
    case 'rare':
      return '🔵 Langka';
    case 'epic':
      return '🟣 Epik';
    case 'legendary':
      return '🟡 Legendaris';
    case 'mythic':
      return '🔴 Mistis';
    default:
      return rarity;
  }
}

/**
 * Format time in milliseconds to readable string
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time
 */
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} jam ${minutes % 60} menit`;
  } else if (minutes > 0) {
    return `${minutes} menit`;
  } else {
    return `${seconds} detik`;
  }
}

/**
 * Get fishing data from file
 * @returns {Object} Fishing data
 */
function getFishingData() {
  try {
    return JSON.parse(fs.readFileSync(fishingDataFile, 'utf8'));
  } catch (error) {
    logger.error(`Error reading fishing data: ${error.message}`);
    return { users: {}, lastReset: Date.now() };
  }
}

/**
 * Save fishing data to file
 * @param {Object} data - Fishing data to save
 */
function saveFishingData(data) {
  try {
    fs.writeFileSync(fishingDataFile, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error(`Error saving fishing data: ${error.message}`);
  }
}

/**
 * Get economy data from file
 * @returns {Object} Economy data
 */
function getEconomyData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    logger.error(`Error reading economy data: ${error.message}`);
    return { users: {}, lastReset: Date.now() };
  }
}

/**
 * Save economy data to file
 * @param {Object} data - Economy data to save
 */
function saveEconomyData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error(`Error saving economy data: ${error.message}`);
  }
}
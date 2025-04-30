/**
 * Fishing (Mancing) Command
 * 
 * This command allows users to fish for rewards and XP in a fun mini-game.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { 
  SlashCommandBuilder, 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const { createErrorEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const { addXP } = require('../levels/level');

// Path to fishing data file
const dataFilePath = path.join(__dirname, '..', '..', 'data', 'fishing.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create fishing.json if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify({}, null, 2));
}

// Define fishing items with rarities and XP rewards
const fishingItems = [
  { id: 'boot', name: 'Sepatu Boot Bekas', emoji: '👢', rarity: 'common', xp: 10, value: 5, chance: 20 },
  { id: 'trash', name: 'Sampah Plastik', emoji: '🗑️', rarity: 'common', xp: 5, value: 2, chance: 20 },
  { id: 'seaweed', name: 'Rumput Laut', emoji: '🌿', rarity: 'common', xp: 15, value: 10, chance: 15 },
  { id: 'fish1', name: 'Ikan Kecil', emoji: '🐟', rarity: 'common', xp: 20, value: 15, chance: 15 },
  { id: 'fish2', name: 'Ikan Sedang', emoji: '🐠', rarity: 'uncommon', xp: 30, value: 25, chance: 10 },
  { id: 'crab', name: 'Kepiting', emoji: '🦀', rarity: 'uncommon', xp: 40, value: 35, chance: 8 },
  { id: 'octopus', name: 'Gurita', emoji: '🐙', rarity: 'rare', xp: 50, value: 50, chance: 5 },
  { id: 'lobster', name: 'Lobster', emoji: '🦞', rarity: 'rare', xp: 60, value: 75, chance: 3 },
  { id: 'squid', name: 'Cumi-cumi', emoji: '🦑', rarity: 'rare', xp: 70, value: 100, chance: 2 },
  { id: 'dolphin', name: 'Lumba-Lumba', emoji: '🐬', rarity: 'epic', xp: 100, value: 200, chance: 1 },
  { id: 'shark', name: 'Hiu', emoji: '🦈', rarity: 'epic', xp: 150, value: 300, chance: 0.5 },
  { id: 'whale', name: 'Paus', emoji: '🐋', rarity: 'legendary', xp: 250, value: 500, chance: 0.3 },
  { id: 'treasure', name: 'Peti Harta Karun', emoji: '💰', rarity: 'legendary', xp: 300, value: 1000, chance: 0.2 }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fishing')
    .setDescription('Pergi memancing untuk mendapatkan hadiah dan XP (English version)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Mulai memancing untuk mendapatkan hadiah dan XP'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('collection')
        .setDescription('Lihat koleksi mancing kamu'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('sell')
        .setDescription('Jual hasil tangkapan kamu untuk mendapatkan koin')
        .addStringOption(option =>
          option.setName('item')
            .setDescription('Item yang ingin dijual (all untuk menjual semua)')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Jumlah item yang ingin dijual')
            .setRequired(false))),
    
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      
      switch (subcommand) {
        case 'start':
          await handleFishing(interaction);
          break;
        case 'collection':
          await handleViewCollection(interaction);
          break;
        case 'sell':
          await handleSellItems(interaction);
          break;
      }
    } catch (error) {
      logger.error('Error executing fishing command:', error);
      await interaction.reply({ 
        embeds: [createErrorEmbed('Terjadi kesalahan saat memancing. Silakan coba lagi.')],
        ephemeral: true 
      });
    }
  }
};

/**
 * Handle fishing mini-game
 * @param {CommandInteraction} interaction - Command interaction
 */
async function handleFishing(interaction) {
  try {
    const userId = interaction.user.id;
    
    // Check fishing cooldown
    const fishingData = loadFishingData();
    const userFishing = fishingData[userId] || {
      lastFishing: 0,
      inventory: {},
      fishingLevel: 1,
      totalCaught: 0,
      coins: 0
    };
    
    const now = Date.now();
    const cooldownTime = 3 * 60 * 1000; // 3 minutes cooldown
    
    if (now - userFishing.lastFishing < cooldownTime) {
      const remainingTime = Math.ceil((userFishing.lastFishing + cooldownTime - now) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      
      return interaction.reply({ 
        embeds: [createErrorEmbed(`Anda harus menunggu **${minutes} menit ${seconds} detik** lagi sebelum bisa memancing lagi.`)],
        ephemeral: true 
      });
    }
    
    // Create the initial embed
    const embed = new EmbedBuilder()
      .setTitle('🎣 Memancing...')
      .setDescription('Kamu melempar kail pancing ke air...\n\nTunggu sebentar hingga ikan menggigit umpan!')
      .setColor('#3498db')
      .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
      .setTimestamp();
    
    // Create buttons
    const pullButton = new ButtonBuilder()
      .setCustomId('pull')
      .setLabel('Tarik Kail! 🎣')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);
    
    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Batalkan 🚫')
      .setStyle(ButtonStyle.Danger);
    
    const row = new ActionRowBuilder().addComponents(pullButton, cancelButton);
    
    // Send initial message
    const message = await interaction.reply({ 
      embeds: [embed],
      components: [row],
      fetchReply: true
    });
    
    // Wait a random amount of time (2-7 seconds) before "fish bites"
    const waitTime = Math.floor(Math.random() * 5000) + 2000;
    
    // Create collector
    const collector = message.createMessageComponentCollector({ 
      componentType: ComponentType.Button,
      time: 15000 // 15 seconds timeout
    });
    
    // Setup timer for when fish bites
    const timer = setTimeout(async () => {
      // Enable the pull button when fish bites
      pullButton.setDisabled(false);
      pullButton.setLabel('Tarik Kail! 🎣 (Cepat!)');
      pullButton.setStyle(ButtonStyle.Success);
      
      // Update the message
      embed.setDescription('Ada yang menggigit umpan! Cepat tarik kailnya sebelum lepas!');
      embed.setColor('#f1c40f');
      
      await message.edit({ 
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(pullButton, cancelButton)]
      });
      
      // Set another timer for when fish escapes if not pulled
      setTimeout(async () => {
        if (!collector.ended) {
          embed.setDescription('Ikan lepas dari kail! Kamu terlalu lambat menariknya.');
          embed.setColor('#e74c3c');
          
          pullButton.setDisabled(true);
          pullButton.setStyle(ButtonStyle.Primary);
          
          await message.edit({ 
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(pullButton, cancelButton)]
          });
          
          collector.stop('timeout');
        }
      }, 3000); // Fish escapes after 3 seconds if not pulled
    }, waitTime);
    
    // Handle button interactions
    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ 
          content: 'Ini bukan pancingan kamu!', 
          ephemeral: true 
        });
      }
      
      clearTimeout(timer);
      
      if (i.customId === 'pull') {
        // User pulled the fishing rod
        const caughtItem = getRandomFishingItem(userFishing.fishingLevel);
        
        // Update user's fishing data
        userFishing.lastFishing = now;
        userFishing.totalCaught++;
        
        // Add item to inventory
        if (!userFishing.inventory[caughtItem.id]) {
          userFishing.inventory[caughtItem.id] = 0;
        }
        userFishing.inventory[caughtItem.id]++;
        
        // Save fishing data
        fishingData[userId] = userFishing;
        saveFishingData(fishingData);
        
        // Give XP for fishing
        const levelUp = await addXP(
          interaction.guild.id, 
          userId, 
          interaction.user.username, 
          caughtItem.xp
        );
        
        // Create result embed
        embed.setTitle(`🎣 ${caughtItem.emoji} Kamu Mendapatkan ${caughtItem.name}!`);
        embed.setDescription(
          `**Rarity:** ${getRarityDisplay(caughtItem.rarity)}\n` +
          `**XP Earned:** ${caughtItem.xp} XP\n` +
          `**Value:** ${caughtItem.value} koin\n\n` +
          `Item telah ditambahkan ke koleksi kamu. Gunakan \`/fishing collection\` untuk melihat koleksimu.`
        );
        embed.setColor(getRarityColor(caughtItem.rarity));
        
        // Add level up message if user leveled up
        if (levelUp) {
          embed.addFields({
            name: '🎉 Level Up!',
            value: `Kamu naik level ke **Level ${levelUp.newLevel}**!`
          });
        }
        
        // Disable buttons
        pullButton.setDisabled(true);
        cancelButton.setDisabled(true);
        
        await i.update({ 
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(pullButton, cancelButton)]
        });
      } else if (i.customId === 'cancel') {
        // User canceled fishing
        embed.setTitle('🎣 Memancing Dibatalkan');
        embed.setDescription('Kamu menarik kail pancing dan memutuskan untuk berhenti memancing.');
        embed.setColor('#95a5a6');
        
        // Disable buttons
        pullButton.setDisabled(true);
        cancelButton.setDisabled(true);
        
        await i.update({ 
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(pullButton, cancelButton)]
        });
        
        collector.stop('canceled');
      }
    });
    
    // Handle collect end
    collector.on('end', async (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        embed.setTitle('🎣 Memancing Timeout');
        embed.setDescription('Kamu meninggalkan kail pancingmu terlalu lama. Tidak ada ikan yang tertangkap.');
        embed.setColor('#95a5a6');
        
        // Disable buttons
        pullButton.setDisabled(true);
        cancelButton.setDisabled(true);
        
        await message.edit({ 
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(pullButton, cancelButton)]
        });
      }
    });
  } catch (error) {
    logger.error('Error handling fishing:', error);
    if (!interaction.replied) {
      await interaction.reply({ 
        embeds: [createErrorEmbed('Terjadi kesalahan saat memancing. Silakan coba lagi.')],
        ephemeral: true 
      });
    }
  }
}

/**
 * Handle viewing user's fishing collection
 * @param {CommandInteraction} interaction - Command interaction
 */
async function handleViewCollection(interaction) {
  try {
    const userId = interaction.user.id;
    
    // Load fishing data
    const fishingData = loadFishingData();
    const userFishing = fishingData[userId] || {
      lastFishing: 0,
      inventory: {},
      fishingLevel: 1,
      totalCaught: 0,
      coins: 0
    };
    
    // Check if user has any items
    if (Object.keys(userFishing.inventory).length === 0) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Kamu belum memiliki koleksi hasil memancing. Gunakan `/mancing mulai` untuk mulai memancing!')],
        ephemeral: true 
      });
    }
    
    // Group items by rarity
    const itemsByRarity = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: []
    };
    
    // Calculate total value of all items
    let totalValue = 0;
    
    // Process inventory
    for (const [itemId, count] of Object.entries(userFishing.inventory)) {
      const item = fishingItems.find(i => i.id === itemId);
      if (item && count > 0) {
        itemsByRarity[item.rarity].push({
          ...item,
          count: count,
          totalValue: count * item.value
        });
        
        totalValue += count * item.value;
      }
    }
    
    // Create embed description
    let description = `**Total Tangkapan:** ${userFishing.totalCaught} item\n` +
                      `**Koin:** ${userFishing.coins} koin\n` +
                      `**Nilai Total Koleksi:** ${totalValue} koin\n\n`;
    
    // Add items by rarity
    const rarities = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    
    for (const rarity of rarities) {
      const items = itemsByRarity[rarity];
      if (items.length > 0) {
        description += `**${getRarityDisplay(rarity)}**\n`;
        
        for (const item of items) {
          description += `${item.emoji} **${item.name}** - ${item.count}x (${item.totalValue} koin)\n`;
        }
        
        description += '\n';
      }
    }
    
    description += `Gunakan \`/mancing lelang <item> [jumlah]\` untuk menjual hasil tangkapanmu.`;
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`🎣 Koleksi Mancing ${interaction.user.username}`)
      .setDescription(description)
      .setColor('#3498db')
      .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
      .setTimestamp();
    
    // Send the embed
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Error handling view collection:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('Terjadi kesalahan saat melihat koleksi. Silakan coba lagi.')],
      ephemeral: true 
    });
  }
}

/**
 * Handle selling fishing items
 * @param {CommandInteraction} interaction - Command interaction
 */
async function handleSellItems(interaction) {
  try {
    const userId = interaction.user.id;
    const itemToSell = interaction.options.getString('item');
    const amountToSell = interaction.options.getInteger('jumlah') || 0;
    
    // Load fishing data
    const fishingData = loadFishingData();
    const userFishing = fishingData[userId] || {
      lastFishing: 0,
      inventory: {},
      fishingLevel: 1,
      totalCaught: 0,
      coins: 0
    };
    
    // Check if user has any items
    if (Object.keys(userFishing.inventory).length === 0) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Kamu belum memiliki koleksi hasil memancing. Gunakan `/mancing mulai` untuk mulai memancing!')],
        ephemeral: true 
      });
    }
    
    // Handle selling all items
    if (itemToSell.toLowerCase() === 'semua') {
      let totalValue = 0;
      let totalItems = 0;
      
      // Calculate total value and clear inventory
      for (const [itemId, count] of Object.entries(userFishing.inventory)) {
        const item = fishingItems.find(i => i.id === itemId);
        if (item && count > 0) {
          totalValue += count * item.value;
          totalItems += count;
          userFishing.inventory[itemId] = 0;
        }
      }
      
      // Update user's coins
      userFishing.coins += totalValue;
      
      // Save fishing data
      fishingData[userId] = userFishing;
      saveFishingData(fishingData);
      
      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('💰 Lelang Berhasil')
        .setDescription(`Kamu telah menjual **${totalItems}** item dengan total **${totalValue}** koin.\n\nKoin saat ini: **${userFishing.coins}** koin.`)
        .setColor('#2ecc71')
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Send the embed
      return interaction.reply({ embeds: [embed] });
    }
    
    // Find the item to sell
    const item = fishingItems.find(i => 
      i.id.toLowerCase() === itemToSell.toLowerCase() || 
      i.name.toLowerCase() === itemToSell.toLowerCase()
    );
    
    if (!item) {
      return interaction.reply({ 
        embeds: [createErrorEmbed('Item tidak ditemukan. Gunakan `/mancing koleksi` untuk melihat daftar item yang kamu miliki.')],
        ephemeral: true 
      });
    }
    
    // Check if user has the item
    const itemCount = userFishing.inventory[item.id] || 0;
    if (itemCount <= 0) {
      return interaction.reply({ 
        embeds: [createErrorEmbed(`Kamu tidak memiliki ${item.name} untuk dijual.`)],
        ephemeral: true 
      });
    }
    
    // Determine amount to sell
    const sellAmount = amountToSell <= 0 ? itemCount : Math.min(amountToSell, itemCount);
    const totalValue = sellAmount * item.value;
    
    // Update user's inventory and coins
    userFishing.inventory[item.id] -= sellAmount;
    userFishing.coins += totalValue;
    
    // Save fishing data
    fishingData[userId] = userFishing;
    saveFishingData(fishingData);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle('💰 Lelang Berhasil')
      .setDescription(`Kamu telah menjual **${sellAmount}x ${item.emoji} ${item.name}** dengan total **${totalValue}** koin.\n\nKoin saat ini: **${userFishing.coins}** koin.`)
      .setColor('#2ecc71')
      .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
      .setTimestamp();
    
    // Send the embed
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Error handling sell items:', error);
    await interaction.reply({ 
      embeds: [createErrorEmbed('Terjadi kesalahan saat menjual item. Silakan coba lagi.')],
      ephemeral: true 
    });
  }
}

/**
 * Get a random fishing item based on user's fishing level
 * @param {number} fishingLevel - User's fishing level
 * @returns {Object} Random fishing item
 */
function getRandomFishingItem(fishingLevel) {
  // Calculate item chances (higher level increases chance for rare items)
  const levelMultiplier = 1 + (fishingLevel * 0.05); // 5% bonus per level
  
  // Adjust item chances based on level
  const adjustedItems = fishingItems.map(item => {
    let adjustedChance = item.chance;
    
    // Increase chance for rare items based on level
    if (item.rarity !== 'common') {
      adjustedChance *= levelMultiplier;
    }
    
    return {
      ...item,
      adjustedChance
    };
  });
  
  // Calculate total chance
  const totalChance = adjustedItems.reduce((sum, item) => sum + item.adjustedChance, 0);
  
  // Generate random number
  const randomValue = Math.random() * totalChance;
  
  // Find the selected item
  let cumulativeChance = 0;
  for (const item of adjustedItems) {
    cumulativeChance += item.adjustedChance;
    if (randomValue <= cumulativeChance) {
      return item;
    }
  }
  
  // Fallback to a common item if something goes wrong
  return adjustedItems.find(item => item.rarity === 'common');
}

/**
 * Get display text for rarity
 * @param {string} rarity - Rarity ID
 * @returns {string} Formatted rarity text
 */
function getRarityDisplay(rarity) {
  switch (rarity) {
    case 'common':
      return '🟢 Umum';
    case 'uncommon':
      return '🔵 Tidak Umum';
    case 'rare':
      return '🟣 Langka';
    case 'epic':
      return '🟠 Epik';
    case 'legendary':
      return '🔴 Legenda';
    default:
      return rarity;
  }
}

/**
 * Get color for rarity
 * @param {string} rarity - Rarity ID
 * @returns {string} Hex color code
 */
function getRarityColor(rarity) {
  switch (rarity) {
    case 'common':
      return '#2ecc71'; // Green
    case 'uncommon':
      return '#3498db'; // Blue
    case 'rare':
      return '#9b59b6'; // Purple
    case 'epic':
      return '#e67e22'; // Orange
    case 'legendary':
      return '#e74c3c'; // Red
    default:
      return '#95a5a6'; // Grey
  }
}

/**
 * Load fishing data from file
 * @returns {Object} Fishing data
 */
function loadFishingData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }
    return {};
  } catch (error) {
    logger.error('Error loading fishing data:', error);
    return {};
  }
}

/**
 * Save fishing data to file
 * @param {Object} fishingData - Fishing data to save
 */
function saveFishingData(fishingData) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(fishingData, null, 2));
  } catch (error) {
    logger.error('Error saving fishing data:', error);
  }
}
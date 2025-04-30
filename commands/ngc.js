/**
 * NGC Economy System
 * 
 * Command untuk sistem ekonomi NGC (Nararya Garage Currency).
 * Dapat digunakan untuk melihat saldo, mendapatkan harian, dan mentransfer.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logger } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

// Data File Path
const dataFile = path.join(__dirname, '../../data/economy.json');

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

// Cooldown tracking for daily rewards
const dailyCooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ngc')
    .setDescription('Sistem ekonomi NGC (Nararya Garage Currency)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('balance')
        .setDescription('Cek saldo NGC milikmu')
        .addUserOption(option => 
          option.setName('user')
            .setDescription('User yang ingin dicek saldonya (opsional)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('daily')
        .setDescription('Klaim NGC harian (antara 50-150 NGC)'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transfer')
        .setDescription('Transfer NGC ke user lain')
        .addUserOption(option => 
          option.setName('user')
            .setDescription('User yang akan menerima transfer')
            .setRequired(true))
        .addIntegerOption(option => 
          option.setName('amount')
            .setDescription('Jumlah NGC yang akan ditransfer')
            .setRequired(true)
            .setMinValue(10))),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'balance') {
      await checkBalance(interaction);
    } else if (subcommand === 'daily') {
      await claimDaily(interaction);
    } else if (subcommand === 'transfer') {
      await transferNGC(interaction);
    }
  }
};

/**
 * Check NGC balance for a user
 * @param {Interaction} interaction - Discord interaction
 */
async function checkBalance(interaction) {
  try {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;
    
    // Get economy data
    const economyData = getEconomyData();
    
    // Get or create user data
    if (!economyData.users[userId]) {
      economyData.users[userId] = {
        balance: 0,
        lastDaily: null,
        transactions: []
      };
      saveEconomyData(economyData);
    }
    
    const userData = economyData.users[userId];
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💰 NGC Balance')
      .setDescription(`Saldo NGC untuk ${targetUser}:`)
      .addFields(
        { name: 'Saldo', value: `${userData.balance} NGC`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'NGC - Nararya Garage Currency' })
      .setTimestamp();
    
    // If checking own balance, show daily reset
    if (targetUser.id === interaction.user.id) {
      const lastDaily = userData.lastDaily ? new Date(userData.lastDaily) : null;
      const canClaim = !lastDaily || isNewDay(lastDaily);
      
      embed.addFields(
        { name: 'Status Daily', value: canClaim ? '✅ Tersedia' : '❌ Sudah diklaim', inline: true }
      );
      
      // Add button for daily claim if available
      if (canClaim) {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('ngc_daily_claim')
              .setLabel('Klaim NGC Harian')
              .setStyle(ButtonStyle.Success)
              .setEmoji('💰')
          );
        
        await interaction.reply({ embeds: [embed], components: [row] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    } else {
      await interaction.reply({ embeds: [embed] });
    }
    
    logger.info(`User ${interaction.user.tag} checked NGC balance for ${targetUser.tag}: ${userData.balance} NGC`);
  } catch (error) {
    logger.error(`Error checking NGC balance: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat mengecek saldo NGC. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * Claim daily NGC reward
 * @param {Interaction} interaction - Discord interaction
 */
async function claimDaily(interaction) {
  try {
    const userId = interaction.user.id;
    
    // Check cooldown
    if (dailyCooldowns.has(userId)) {
      return await interaction.reply({ 
        content: 'Kamu sudah mengklaim NGC harian. Coba lagi besok!', 
        ephemeral: true 
      });
    }
    
    // Get economy data
    const economyData = getEconomyData();
    
    // Get or create user data
    if (!economyData.users[userId]) {
      economyData.users[userId] = {
        balance: 0,
        lastDaily: null,
        transactions: []
      };
    }
    
    const userData = economyData.users[userId];
    
    // Check if already claimed today
    const lastDaily = userData.lastDaily ? new Date(userData.lastDaily) : null;
    if (lastDaily && !isNewDay(lastDaily)) {
      // Set cooldown
      dailyCooldowns.set(userId, true);
      setTimeout(() => dailyCooldowns.delete(userId), 60000); // 1 minute cooldown
      
      return await interaction.reply({ 
        content: 'Kamu sudah mengklaim NGC harian hari ini. Coba lagi besok!', 
        ephemeral: true 
      });
    }
    
    // Generate random amount between 50-150
    const amount = Math.floor(Math.random() * 101) + 50;
    
    // Update user data
    userData.balance += amount;
    userData.lastDaily = Date.now();
    
    // Record transaction
    userData.transactions.push({
      type: 'daily',
      amount: amount,
      timestamp: Date.now()
    });
    
    // Save data
    saveEconomyData(economyData);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('💰 Daily NGC Claimed')
      .setDescription(`${interaction.user}, kamu telah mengklaim NGC harian!`)
      .addFields(
        { name: 'Jumlah', value: `+${amount} NGC`, inline: true },
        { name: 'Saldo Baru', value: `${userData.balance} NGC`, inline: true }
      )
      .setFooter({ text: 'Klaim lagi besok untuk mendapatkan lebih banyak NGC!' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`User ${interaction.user.tag} claimed ${amount} NGC daily reward. New balance: ${userData.balance} NGC`);
  } catch (error) {
    logger.error(`Error claiming daily NGC: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat mengklaim NGC harian. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * Transfer NGC to another user
 * @param {Interaction} interaction - Discord interaction
 */
async function transferNGC(interaction) {
  try {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    
    // Check if trying to transfer to self
    if (targetUser.id === interaction.user.id) {
      return await interaction.reply({ 
        content: 'Kamu tidak dapat mentransfer NGC ke dirimu sendiri!', 
        ephemeral: true 
      });
    }
    
    // Check if target is a bot
    if (targetUser.bot) {
      return await interaction.reply({ 
        content: 'Kamu tidak dapat mentransfer NGC ke bot!', 
        ephemeral: true 
      });
    }
    
    // Get economy data
    const economyData = getEconomyData();
    
    // Get or create user data
    if (!economyData.users[interaction.user.id]) {
      economyData.users[interaction.user.id] = {
        balance: 0,
        lastDaily: null,
        transactions: []
      };
      saveEconomyData(economyData);
    }
    
    const userData = economyData.users[interaction.user.id];
    
    // Check if user has enough NGC
    if (userData.balance < amount) {
      return await interaction.reply({ 
        content: `Saldo NGC tidak mencukupi! Saldo kamu: ${userData.balance} NGC`, 
        ephemeral: true 
      });
    }
    
    // Get or create target user data
    if (!economyData.users[targetUser.id]) {
      economyData.users[targetUser.id] = {
        balance: 0,
        lastDaily: null,
        transactions: []
      };
    }
    
    const targetUserData = economyData.users[targetUser.id];
    
    // Transfer NGC
    userData.balance -= amount;
    targetUserData.balance += amount;
    
    // Record transactions
    userData.transactions.push({
      type: 'transfer_out',
      amount: amount,
      target: targetUser.id,
      timestamp: Date.now()
    });
    
    targetUserData.transactions.push({
      type: 'transfer_in',
      amount: amount,
      from: interaction.user.id,
      timestamp: Date.now()
    });
    
    // Save data
    saveEconomyData(economyData);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#4B0082')
      .setTitle('💸 NGC Transfer')
      .setDescription(`${interaction.user} telah mentransfer NGC ke ${targetUser}!`)
      .addFields(
        { name: 'Jumlah', value: `${amount} NGC`, inline: true },
        { name: 'Saldo Pengirim', value: `${userData.balance} NGC`, inline: true }
      )
      .setFooter({ text: 'NGC - Nararya Garage Currency' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    logger.info(`User ${interaction.user.tag} transferred ${amount} NGC to ${targetUser.tag}`);
  } catch (error) {
    logger.error(`Error transferring NGC: ${error.message}`);
    await interaction.reply({ 
      content: 'Terjadi kesalahan saat mentransfer NGC. Silakan coba lagi nanti.', 
      ephemeral: true 
    });
  }
}

/**
 * Handle NGC daily claim button
 * @param {ButtonInteraction} interaction - Button interaction
 */
async function handleDailyButton(interaction) {
  // Just execute the daily command
  await claimDaily(interaction);
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

/**
 * Check if it's a new day compared to the given date
 * @param {Date} date - Date to compare
 * @returns {boolean} True if it's a new day
 */
function isNewDay(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return today > lastDate;
}

module.exports.buttons = {
  ngc_daily_claim: handleDailyButton
};
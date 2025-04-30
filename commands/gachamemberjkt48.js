// Command: /gachamemberjkt48 - Gacha for JKT48 members
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');
const { createEmbed } = require('../../utils/embedBuilder');
const { getCurrentMembers } = require('../../models/jkt48Data');
const config = require('../../config');

// User daily gacha limits
const userDailyLimits = new Map();

// Last reset date for tracking daily limits
let lastResetDate = new Date().setHours(0, 0, 0, 0);

// Gacha tiers and rates
const gachaTiers = config.games.gacha.tiers;

module.exports = {
  // Command definition
  data: new SlashCommandBuilder()
    .setName('gachamemberjkt48')
    .setDescription('Gacha member JKT48 (Max 15x sehari)'),
  
  // Command execution
  async execute(interaction) {
    try {
      // Selalu gunakan deferReply agar tidak terjadi timeout
      await interaction.deferReply();
      
      // Check and reset daily limits if needed
      checkAndResetDailyLimits();
      
      // Check if user has reached their daily limit
      const userId = interaction.user.id;
      const userLimit = userDailyLimits.get(userId) || 0;
      
      if (userLimit >= config.settings.limits.dailyGacha) {
        return await interaction.editReply({
          content: `Kamu sudah mencapai batas ${config.settings.limits.dailyGacha}x gacha untuk hari ini. Silakan coba lagi besok!`,
          ephemeral: true
        });
      }
      
      // Increment user's daily usage
      userDailyLimits.set(userId, userLimit + 1);
      
      // Get all current members for gacha
      const members = getCurrentMembers();
      
      // Roll for gacha tier
      const tier = rollGachaTier();
      
      // Select a random member
      const member = members[Math.floor(Math.random() * members.length)];
      
      // Create the gacha embed
      const embed = createGachaEmbed(member, tier, userLimit + 1);
      
      // Optimized image handling with error catching
      try {
        // Reply with the gacha result
        await interaction.editReply({ 
          embeds: [embed],
          ephemeral: false // Make this visible to everyone for fun
        });
      } catch (imageError) {
        logger.error('Error displaying gacha image:', imageError);
        // Fallback response without image attachment if there was an error
        await interaction.editReply({
          content: `🎮 Gacha Result: ${member.fullName} (${tier.name})`,
          embeds: [embed]
        });
      }
      
      logger.info(`User ${interaction.user.tag} performed gacha and got ${member.nickName || member.fullName} (${tier.name})`);
    } catch (error) {
      logger.error('Error executing gachamemberjkt48 command:', error);
      
      // Jika interaksi sudah di-defer
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat melakukan gacha. Silakan coba lagi.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat melakukan gacha. Silakan coba lagi.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      }
    }
  }
};

/**
 * Reset daily limits if it's a new day
 */
function checkAndResetDailyLimits() {
  const today = new Date().setHours(0, 0, 0, 0);
  
  if (today > lastResetDate) {
    userDailyLimits.clear();
    lastResetDate = today;
    logger.info('Daily gacha limits have been reset');
  }
}

/**
 * Roll for a gacha tier based on configured rates
 * @returns {Object} The selected tier
 */
function rollGachaTier() {
  // Roll a random number between 0-100
  const roll = Math.random() * 100;
  
  // Determine which tier was rolled
  let cumulativeRate = 0;
  
  for (const tier of gachaTiers) {
    cumulativeRate += tier.rate;
    
    if (roll < cumulativeRate) {
      return tier;
    }
  }
  
  // Fallback to the lowest tier (should rarely happen)
  return gachaTiers[0];
}

/**
 * Create a gacha result embed
 * @param {Object} member - The member object
 * @param {Object} tier - The tier object
 * @param {number} dailyCount - Current daily gacha count
 * @returns {EmbedBuilder} The formatted embed
 */
function createGachaEmbed(member, tier, dailyCount) {
  const embed = createEmbed()
    .setTitle(`🎮 Gacha Member JKT48 - ${tier.name}`)
    .setDescription(`Kamu mendapatkan member ${tier.name} Tier!`)
    .setColor(tier.color)
    .addFields(
      { name: 'Member', value: member.fullName, inline: true },
      { name: 'Nickname', value: member.nickName || '-', inline: true },
      { name: 'Team', value: member.team || '-', inline: true },
      { name: 'Generation', value: member.generation.toString(), inline: true },
      { name: 'Tier', value: tier.name, inline: true },
      { name: 'Gacha Hari Ini', value: `${dailyCount}/${config.settings.limits.dailyGacha}`, inline: true }
    );
  
  // Add member social media links if available
  const socialLinks = [];
  
  if (member.twitterHandle) {
    socialLinks.push(`[Twitter](https://twitter.com/${member.twitterHandle})`);
  }
  
  if (member.instagramHandle) {
    socialLinks.push(`[Instagram](https://www.instagram.com/${member.instagramHandle}/)`);
  }
  
  if (member.tiktokHandle) {
    socialLinks.push(`[TikTok](https://www.tiktok.com/@${member.tiktokHandle}/)`);
  }
  
  if (member.showroomId) {
    socialLinks.push(`[Showroom](https://www.showroom-live.com/r/${member.showroomId})`);
  }
  
  if (socialLinks.length > 0) {
    embed.addFields({ name: 'Social Media', value: socialLinks.join(' | '), inline: false });
  }
  
  return embed;
}
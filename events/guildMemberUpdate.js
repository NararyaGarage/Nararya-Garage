/**
 * Guild Member Update Event
 * 
 * Event yang dipicu ketika ada perubahan pada member di server,
 * termasuk ketika mereka menjadi booster (premium subscriber).
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { logger } = require('../utils/logger');

module.exports = {
  name: 'guildMemberUpdate',
  
  /**
   * Dijalankan ketika member server diupdate (role, nickname, dll)
   * @param {GuildMember} oldMember - Member sebelum update
   * @param {GuildMember} newMember - Member setelah update
   * @param {Client} client - Discord client
   */
  async execute(oldMember, newMember, client) {
    try {
      // Check for new booster (premium subscriber)
      // Indikasi member menjadi booster adalah dia mendapatkan role "nitro booster"
      const oldBooster = oldMember.premiumSince;
      const newBooster = newMember.premiumSince;
      
      // Member baru saja menjadi booster
      if (!oldBooster && newBooster) {
        logger.info(`${newMember.user.tag} menjadi booster server`);
        
        // Find announcement channel for boosters
        if (config.channels && config.channels.boosterAnnouncement) {
          const boosterChannel = client.channels.cache.get(config.channels.boosterAnnouncement);
          
          if (boosterChannel) {
            // Create a fancy embed for the booster
            const embed = new EmbedBuilder()
              .setColor('#ff73fa') // Warna pink Nitro
              .setTitle('🚀 Server Booster Baru!')
              .setDescription(`Terima kasih <@${newMember.id}> telah menjadi **Server Booster**!\nServer kita menjadi lebih kuat berkat dukungan Anda!`)
              .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
              .addFields(
                { name: 'Perks untuk Booster', value: '• Akses ke channel khusus booster\n• Role eksklusif dengan warna pink\n• Prioritas dalam event-event server\n• Emoji khusus' },
                { name: 'Server Level', value: `Level ${newMember.guild.premiumTier} (${newMember.guild.premiumSubscriptionCount} boost)` }
              )
              .setFooter({ text: `🎉 Bergabung dengan server pada ${newMember.joinedAt.toLocaleDateString()}` })
              .setTimestamp();
            
            // Send the embed
            await boosterChannel.send({ 
              content: `<@${newMember.id}> telah men-boost server kita! 🚀✨`,
              embeds: [embed] 
            });
          }
        }
      }
      
      // Check if member STOPPED boosting
      if (oldBooster && !newBooster) {
        logger.info(`${newMember.user.tag} berhenti menjadi booster server`);
        
        // Notification in mod channel
        if (config.channels && config.channels.modLog) {
          const modChannel = client.channels.cache.get(config.channels.modLog);
          
          if (modChannel) {
            await modChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#ff3333')
                  .setTitle('⚠️ Booster Hilang')
                  .setDescription(`<@${newMember.id}> telah berhenti menjadi server booster.`)
                  .setTimestamp()
              ]
            });
          }
        }
      }
      
      // Track role changes
      const oldRoles = [...oldMember.roles.cache.keys()];
      const newRoles = [...newMember.roles.cache.keys()];
      
      // Member got new roles
      const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
      
      // Check for specific VIP/donatur roles
      if (addedRoles.length > 0 && config.roles) {
        // Check if any of the added roles is a donatur/VIP role
        const donaturRoles = config.roles.donatur || [];
        const vipRoles = config.roles.vip || [];
        
        const gotDonaturRole = addedRoles.some(roleId => donaturRoles.includes(roleId));
        const gotVipRole = addedRoles.some(roleId => vipRoles.includes(roleId));
        
        if (gotDonaturRole || gotVipRole) {
          logger.info(`${newMember.user.tag} mendapatkan role donatur/VIP`);
          
          // Find announcement channel
          if (config.channels && config.channels.donaturAnnouncement) {
            const donaturChannel = client.channels.cache.get(config.channels.donaturAnnouncement);
            
            if (donaturChannel) {
              // Find which specific role was added
              let roleName = '';
              let roleType = gotDonaturRole ? 'Donatur' : 'VIP';
              
              // Get the actual role object for the name
              for (const roleId of addedRoles) {
                if ((gotDonaturRole && donaturRoles.includes(roleId)) || 
                    (gotVipRole && vipRoles.includes(roleId))) {
                  const role = newMember.guild.roles.cache.get(roleId);
                  if (role) {
                    roleName = role.name;
                    break;
                  }
                }
              }
              
              // Create a fancy embed for the donatur/VIP
              const embed = new EmbedBuilder()
                .setColor(gotDonaturRole ? '#ffd700' : '#8a2be2') // Gold for donatur, purple for VIP
                .setTitle(`🏆 ${roleType} Baru!`)
                .setDescription(`Terima kasih <@${newMember.id}> telah menjadi **${roleName}**!\nDukungan Anda sangat berarti bagi komunitas kita!`)
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                  { name: `Perks untuk ${roleType}`, value: '• Akses ke channel eksklusif\n• Role special dengan warna custom\n• Prioritas dalam semua aktivitas server\n• Kesempatan eksklusif bertemu JKT48' }
                )
                .setFooter({ text: `🎉 Bergabung dengan server pada ${newMember.joinedAt.toLocaleDateString()}` })
                .setTimestamp();
              
              // Send the embed
              await donaturChannel.send({ 
                content: `<@${newMember.id}> telah menjadi ${roleType} server! 🎖️✨`,
                embeds: [embed] 
              });
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error in guildMemberUpdate event: ${error.message}`);
    }
  }
};
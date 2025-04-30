// Command to ban a member from the server
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)),
  cooldown: 5,
  moderatorOnly: true,
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client) {
    try {
      // Get the command options
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      const days = interaction.options.getInteger('days') || 0;
      
      // Check if user is trying to ban themselves
      if (targetUser.id === interaction.user.id) {
        await interaction.reply({
          content: 'Anda tidak dapat mem-ban diri sendiri!',
          ephemeral: true
        });
        return;
      }
      
      // Check if user is trying to ban the bot
      if (targetUser.id === client.user.id) {
        await interaction.reply({
          content: 'Anda tidak dapat mem-ban bot ini!',
          ephemeral: true
        });
        return;
      }
      
      // Get the target member from the guild
      const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
      
      // Check if the target is a server member
      if (!targetMember) {
        await interaction.reply({
          content: 'User yang dipilih bukan member server ini!',
          ephemeral: true
        });
        return;
      }
      
      // Check if the target has higher role than the user executing the command
      if (
        targetMember.roles.highest.position >= interaction.member.roles.highest.position &&
        interaction.guild.ownerId !== interaction.user.id
      ) {
        await interaction.reply({
          content: 'Anda tidak dapat mem-ban member dengan role yang lebih tinggi atau sama dengan Anda!',
          ephemeral: true
        });
        return;
      }
      
      // Check if the bot can ban the target
      if (!targetMember.bannable) {
        await interaction.reply({
          content: 'Bot tidak memiliki izin untuk mem-ban member tersebut!',
          ephemeral: true
        });
        return;
      }
      
      // Get confirmation
      const confirmEmbed = createEmbed()
        .setTitle('Konfirmasi Ban')
        .setDescription(`Apakah Anda yakin ingin mem-ban ${targetUser.tag}?`)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>` },
          { name: 'Reason', value: reason },
          { name: 'Delete Messages', value: `${days} day(s)` }
        )
        .setFooter({
          text: 'Klik tombol di bawah untuk konfirmasi',
          iconURL: interaction.user.displayAvatarURL()
        });
      
      const row = {
        type: 1,
        components: [
          {
            type: 2,
            style: 4,
            label: 'Ban',
            custom_id: 'confirm_ban'
          },
          {
            type: 2,
            style: 2,
            label: 'Cancel',
            custom_id: 'cancel_ban'
          }
        ]
      };
      
      const confirmMessage = await interaction.reply({
        embeds: [confirmEmbed],
        components: [row],
        fetchReply: true
      });
      
      // Create a filter to only allow the original user to click buttons
      const filter = i => i.user.id === interaction.user.id;
      
      // Create a collector for the buttons
      const collector = confirmMessage.createMessageComponentCollector({ filter, time: 60000 });
      
      collector.on('collect', async i => {
        if (i.customId === 'confirm_ban') {
          try {
            // Ban the user
            await interaction.guild.members.ban(targetUser, {
              days: days,
              reason: `Ban by ${interaction.user.tag}: ${reason}`
            });
            
            // Create the ban confirmation embed
            const banEmbed = createEmbed()
              .setTitle('User Banned')
              .setDescription(`User ${targetUser.tag} telah di-ban dari server.`)
              .addFields(
                { name: 'User', value: `<@${targetUser.id}>` },
                { name: 'Moderator', value: `<@${interaction.user.id}>` },
                { name: 'Reason', value: reason },
                { name: 'Delete Messages', value: `${days} day(s)` }
              )
              .setColor('#FF0000')
              .setTimestamp();
            
            // Edit the reply to confirm the ban
            await i.update({
              embeds: [banEmbed],
              components: []
            });
            
            // Log the ban action
            logger.info(`User ${targetUser.tag} (${targetUser.id}) was banned by ${interaction.user.tag} (${interaction.user.id}) for reason: ${reason}`);
            
            // Send notification to logs channel if configured
            const logsChannel = interaction.guild.channels.cache.get(config.channels.kickBanLogs);
            if (logsChannel) {
              await logsChannel.send({
                embeds: [banEmbed]
              });
            }
            
            // Try to send DM to the banned user
            try {
              await targetUser.send({
                embeds: [
                  createEmbed()
                    .setTitle(`Anda Telah Di-ban dari ${interaction.guild.name}`)
                    .setDescription(`Anda telah di-ban dari server ${interaction.guild.name}.`)
                    .addFields(
                      { name: 'Reason', value: reason },
                      { name: 'Moderator', value: interaction.user.tag }
                    )
                    .setColor('#FF0000')
                    .setTimestamp()
                ]
              });
            } catch (error) {
              logger.warn(`Could not send DM to banned user ${targetUser.tag}: ${error.message}`);
            }
          } catch (error) {
            logger.error(`Error banning user ${targetUser.tag}:`, error);
            await i.update({
              content: `Error: Gagal mem-ban ${targetUser.tag}. ${error.message}`,
              embeds: [],
              components: []
            });
          }
        } else if (i.customId === 'cancel_ban') {
          // Cancel the ban
          await i.update({
            content: 'Ban dibatalkan.',
            embeds: [],
            components: []
          });
          
          logger.info(`Ban of ${targetUser.tag} was cancelled by ${interaction.user.tag}`);
        }
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          // Time expired without a response
          await interaction.editReply({
            content: 'Ban dibatalkan: waktu konfirmasi habis.',
            embeds: [],
            components: []
          });
        }
      });
    } catch (error) {
      logger.error('Error executing ban command:', error);
      await interaction.reply({ 
        content: 'Terjadi kesalahan saat mencoba mem-ban user.',
        ephemeral: true 
      });
    }
  }
};

// Command to kick a member from the server
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(true)),
  cooldown: 5,
  moderatorOnly: true,
  permissions: [PermissionFlagsBits.KickMembers],
  async execute(interaction, client) {
    try {
      // Get the command options
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      
      // Check if user is trying to kick themselves
      if (targetUser.id === interaction.user.id) {
        await interaction.reply({
          content: 'Anda tidak dapat mengeluarkan diri sendiri!',
          ephemeral: true
        });
        return;
      }
      
      // Check if user is trying to kick the bot
      if (targetUser.id === client.user.id) {
        await interaction.reply({
          content: 'Anda tidak dapat mengeluarkan bot ini!',
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
          content: 'Anda tidak dapat mengeluarkan member dengan role yang lebih tinggi atau sama dengan Anda!',
          ephemeral: true
        });
        return;
      }
      
      // Check if the bot can kick the target
      if (!targetMember.kickable) {
        await interaction.reply({
          content: 'Bot tidak memiliki izin untuk mengeluarkan member tersebut!',
          ephemeral: true
        });
        return;
      }
      
      // Get confirmation
      const confirmEmbed = createEmbed()
        .setTitle('Konfirmasi Kick')
        .setDescription(`Apakah Anda yakin ingin mengeluarkan ${targetUser.tag}?`)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>` },
          { name: 'Reason', value: reason }
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
            label: 'Kick',
            custom_id: 'confirm_kick'
          },
          {
            type: 2,
            style: 2,
            label: 'Cancel',
            custom_id: 'cancel_kick'
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
        if (i.customId === 'confirm_kick') {
          try {
            // Try to send DM to the kicked user first
            try {
              await targetUser.send({
                embeds: [
                  createEmbed()
                    .setTitle(`Anda Telah Dikeluarkan dari ${interaction.guild.name}`)
                    .setDescription(`Anda telah dikeluarkan dari server ${interaction.guild.name}.`)
                    .addFields(
                      { name: 'Reason', value: reason },
                      { name: 'Moderator', value: interaction.user.tag }
                    )
                    .setColor('#FF8000')
                    .setTimestamp()
                ]
              });
            } catch (error) {
              logger.warn(`Could not send DM to kicked user ${targetUser.tag}: ${error.message}`);
            }
            
            // Kick the user
            await targetMember.kick(`Kick by ${interaction.user.tag}: ${reason}`);
            
            // Create the kick confirmation embed
            const kickEmbed = createEmbed()
              .setTitle('User Kicked')
              .setDescription(`User ${targetUser.tag} telah dikeluarkan dari server.`)
              .addFields(
                { name: 'User', value: `<@${targetUser.id}>` },
                { name: 'Moderator', value: `<@${interaction.user.id}>` },
                { name: 'Reason', value: reason }
              )
              .setColor('#FF8000')
              .setTimestamp();
            
            // Edit the reply to confirm the kick
            await i.update({
              embeds: [kickEmbed],
              components: []
            });
            
            // Log the kick action
            logger.info(`User ${targetUser.tag} (${targetUser.id}) was kicked by ${interaction.user.tag} (${interaction.user.id}) for reason: ${reason}`);
            
            // Send notification to logs channel if configured
            const logsChannel = interaction.guild.channels.cache.get(config.channels.kickBanLogs);
            if (logsChannel) {
              await logsChannel.send({
                embeds: [kickEmbed]
              });
            }
          } catch (error) {
            logger.error(`Error kicking user ${targetUser.tag}:`, error);
            await i.update({
              content: `Error: Gagal mengeluarkan ${targetUser.tag}. ${error.message}`,
              embeds: [],
              components: []
            });
          }
        } else if (i.customId === 'cancel_kick') {
          // Cancel the kick
          await i.update({
            content: 'Kick dibatalkan.',
            embeds: [],
            components: []
          });
          
          logger.info(`Kick of ${targetUser.tag} was cancelled by ${interaction.user.tag}`);
        }
      });
      
      collector.on('end', async collected => {
        if (collected.size === 0) {
          // Time expired without a response
          await interaction.editReply({
            content: 'Kick dibatalkan: waktu konfirmasi habis.',
            embeds: [],
            components: []
          });
        }
      });
    } catch (error) {
      logger.error('Error executing kick command:', error);
      await interaction.reply({ 
        content: 'Terjadi kesalahan saat mencoba mengeluarkan user.',
        ephemeral: true 
      });
    }
  }
};

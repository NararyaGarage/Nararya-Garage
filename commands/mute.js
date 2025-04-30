// Command to mute/timeout a member
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member temporarily (timeout)')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to mute')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('duration')
        .setDescription('Duration of the mute in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080)) // Max 7 days (10080 minutes)
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(true)),
  cooldown: 5,
  moderatorOnly: true,
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    try {
      // Get the command options
      const targetUser = interaction.options.getUser('user');
      const durationMinutes = interaction.options.getInteger('duration');
      const reason = interaction.options.getString('reason');
      
      // Check if user is trying to mute themselves
      if (targetUser.id === interaction.user.id) {
        await interaction.reply({
          content: 'Anda tidak dapat mute diri sendiri!',
          ephemeral: true
        });
        return;
      }
      
      // Check if user is trying to mute the bot
      if (targetUser.id === client.user.id) {
        await interaction.reply({
          content: 'Anda tidak dapat mute bot ini!',
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
          content: 'Anda tidak dapat mute member dengan role yang lebih tinggi atau sama dengan Anda!',
          ephemeral: true
        });
        return;
      }
      
      // Check if the bot can moderate the target
      if (!targetMember.moderatable) {
        await interaction.reply({
          content: 'Bot tidak memiliki izin untuk mute member tersebut!',
          ephemeral: true
        });
        return;
      }
      
      // Calculate timeout end date (milliseconds)
      const durationMs = durationMinutes * 60 * 1000;
      const timeoutUntil = Date.now() + durationMs;
      
      // Format duration for display
      let formattedDuration = '';
      if (durationMinutes >= 1440) { // 1 day or more
        const days = Math.floor(durationMinutes / 1440);
        const remainingMinutes = durationMinutes % 1440;
        const hours = Math.floor(remainingMinutes / 60);
        formattedDuration = `${days} hari`;
        if (hours > 0) formattedDuration += ` ${hours} jam`;
      } else if (durationMinutes >= 60) { // 1 hour or more
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        formattedDuration = `${hours} jam`;
        if (minutes > 0) formattedDuration += ` ${minutes} menit`;
      } else {
        formattedDuration = `${durationMinutes} menit`;
      }
      
      try {
        // Timeout the member
        await targetMember.timeout(durationMs, `Muted by ${interaction.user.tag}: ${reason}`);
        
        // Create the mute confirmation embed
        const muteEmbed = createEmbed()
          .setTitle('User Muted')
          .setDescription(`User ${targetUser.tag} telah di-mute selama ${formattedDuration}.`)
          .addFields(
            { name: 'User', value: `<@${targetUser.id}>` },
            { name: 'Moderator', value: `<@${interaction.user.id}>` },
            { name: 'Durasi', value: formattedDuration },
            { name: 'Berakhir Pada', value: `<t:${Math.floor(timeoutUntil / 1000)}:F>` },
            { name: 'Reason', value: reason }
          )
          .setColor('#FFA500')
          .setTimestamp();
        
        await interaction.reply({
          embeds: [muteEmbed]
        });
        
        // Log the mute action
        logger.info(`User ${targetUser.tag} (${targetUser.id}) was muted for ${durationMinutes} minutes by ${interaction.user.tag} (${interaction.user.id}) for reason: ${reason}`);
        
        // Send notification to logs channel if configured
        const logsChannel = interaction.guild.channels.cache.get(config.channels.automodLogs);
        if (logsChannel) {
          await logsChannel.send({
            embeds: [muteEmbed]
          });
        }
        
        // Try to send DM to the muted user
        try {
          await targetUser.send({
            embeds: [
              createEmbed()
                .setTitle(`Anda Telah Di-mute di ${interaction.guild.name}`)
                .setDescription(`Anda telah di-mute di server ${interaction.guild.name} selama ${formattedDuration}.`)
                .addFields(
                  { name: 'Reason', value: reason },
                  { name: 'Moderator', value: interaction.user.tag },
                  { name: 'Berakhir Pada', value: `<t:${Math.floor(timeoutUntil / 1000)}:F>` }
                )
                .setColor('#FFA500')
                .setTimestamp()
            ]
          });
        } catch (error) {
          logger.warn(`Could not send DM to muted user ${targetUser.tag}: ${error.message}`);
        }
      } catch (error) {
        logger.error(`Error muting user ${targetUser.tag}:`, error);
        await interaction.reply({
          content: `Error: Gagal mute ${targetUser.tag}. ${error.message}`,
          ephemeral: true
        });
      }
    } catch (error) {
      logger.error('Error executing mute command:', error);
      await interaction.reply({ 
        content: 'Terjadi kesalahan saat mencoba mute user.',
        ephemeral: true 
      });
    }
  }
};

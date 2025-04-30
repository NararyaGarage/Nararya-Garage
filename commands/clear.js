// Command to clear messages from a channel
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from the channel')
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('target')
        .setDescription('Target type of messages to delete')
        .setRequired(false)
        .addChoices(
          { name: 'All Messages', value: 'all' },
          { name: 'User Messages', value: 'user' },
          { name: 'Bot Messages', value: 'bot' },
          { name: 'Images Only', value: 'images' },
          { name: 'Links Only', value: 'links' }
        )),
  cooldown: 5,
  moderatorOnly: true,
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });
      
      // Get the command options
      const amount = interaction.options.getInteger('amount');
      const user = interaction.options.getUser('user');
      const target = interaction.options.getString('target') || 'all';
      
      // Get messages from the channel
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      
      // Filter messages based on options
      let filteredMessages = [];
      
      if (user && target === 'user') {
        // Delete messages from a specific user
        filteredMessages = messages.filter(m => m.author.id === user.id).first(amount);
      } else if (target === 'bot') {
        // Delete only bot messages
        filteredMessages = messages.filter(m => m.author.bot).first(amount);
      } else if (target === 'images') {
        // Delete only messages with attachments
        filteredMessages = messages.filter(m => m.attachments.size > 0).first(amount);
      } else if (target === 'links') {
        // Delete only messages with links
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        filteredMessages = messages.filter(m => linkRegex.test(m.content)).first(amount);
      } else if (user) {
        // Delete messages from a specific user (default target)
        filteredMessages = messages.filter(m => m.author.id === user.id).first(amount);
      } else {
        // Delete any messages (default behavior)
        filteredMessages = messages.first(amount);
      }
      
      // Check if we have messages to delete
      if (filteredMessages.length === 0) {
        await interaction.editReply({
          content: 'Tidak ada pesan yang ditemukan untuk dihapus sesuai kriteria yang dipilih.',
          ephemeral: true
        });
        return;
      }
      
      // Discord allows bulk deletion for messages less than 14 days old
      // Messages older than 14 days need to be deleted individually
      
      // Get message IDs
      const messageIds = filteredMessages.map(m => m.id);
      
      // Delete messages
      try {
        const deletedCount = await interaction.channel.bulkDelete(messageIds, true)
          .then(deleted => deleted.size);
        
        // Create success embed
        const successEmbed = createEmbed()
          .setTitle('Messages Cleared')
          .setDescription(`Successfully deleted ${deletedCount} message(s).`)
          .addFields(
            { name: 'Channel', value: `<#${interaction.channelId}>` },
            { name: 'Moderator', value: `<@${interaction.user.id}>` },
            { name: 'Amount Requested', value: `${amount}` },
            { name: 'Amount Deleted', value: `${deletedCount}` }
          )
          .setColor('#00FF00')
          .setTimestamp();
        
        if (user) {
          successEmbed.addFields({ name: 'Target User', value: `<@${user.id}>` });
        }
        
        if (target !== 'all') {
          successEmbed.addFields({ name: 'Target Type', value: target });
        }
        
        await interaction.editReply({
          embeds: [successEmbed],
          ephemeral: true
        });
        
        // Log the clear action
        logger.info(`${interaction.user.tag} (${interaction.user.id}) cleared ${deletedCount} messages in channel #${interaction.channel.name} (${interaction.channelId})`);
        
        // Send an auto-delete confirmation message to the channel
        const confirmMessage = await interaction.channel.send({
          embeds: [
            createEmbed()
              .setDescription(`🧹 ${deletedCount} pesan telah dihapus oleh ${interaction.user}.`)
              .setColor('#00FF00')
          ]
        });
        
        // Auto-delete the confirmation message after 5 seconds
        setTimeout(() => {
          confirmMessage.delete().catch(e => logger.error('Error deleting confirmation message:', e));
        }, 5000);
      } catch (error) {
        logger.error('Error bulk deleting messages:', error);
        
        // Check if error is about messages being too old
        if (error.code === 50034) {
          await interaction.editReply({
            content: 'Tidak dapat menghapus pesan yang berusia lebih dari 14 hari. Silakan hapus pesan-pesan tersebut secara manual.',
            ephemeral: true
          });
        } else {
          await interaction.editReply({
            content: `Terjadi kesalahan saat menghapus pesan: ${error.message}`,
            ephemeral: true
          });
        }
      }
    } catch (error) {
      logger.error('Error executing clear command:', error);
      
      // If interaction is already deferred, edit the reply
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat menghapus pesan.',
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat menghapus pesan.',
          ephemeral: true 
        });
      }
    }
  }
};

// Event handler for when a new member joins the server
const { logger } = require('../utils/logger');
const { createWelcomeEmbed } = require('../utils/embedBuilder');
const config = require('../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      logger.info(`New member joined: ${member.user.tag} (${member.id})`);
      
      // Auto-assign default role to new members
      try {
        const newMemberRole = member.guild.roles.cache.get(config.roles.newMember);
        
        if (newMemberRole) {
          await member.roles.add(newMemberRole);
          logger.info(`Assigned new member role to ${member.user.tag}`);
        } else {
          logger.warn(`New member role (${config.roles.newMember}) not found in guild ${member.guild.name}`);
        }
      } catch (error) {
        logger.error(`Error assigning new member role to ${member.user.tag}:`, error);
      }
      
      // Send welcome message in designated channel
      const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
      
      if (welcomeChannel) {
        const welcomeEmbed = createWelcomeEmbed(member);
        
        await welcomeChannel.send({
          content: `Selamat datang di server kami, <@${member.id}>! 👋`,
          embeds: [welcomeEmbed]
        });
        
        logger.info(`Sent welcome message for ${member.user.tag}`);
      } else {
        logger.warn(`Welcome channel (${config.channels.welcome}) not found in guild ${member.guild.name}`);
      }
      
      // Send a direct message to the new member
      try {
        await member.send({
          embeds: [
            createWelcomeEmbed(member)
              .setDescription(
                `Selamat datang di server **${member.guild.name}**!\n\n` +
                `Silakan perkenalkan diri di <#${config.channels.introduction}> dan baca peraturan di <#${config.channels.rules}>.\n\n` +
                `Untuk daftar perintah, gunakan \`/help\`. Selamat bergabung!`
              )
          ]
        });
        
        logger.info(`Sent welcome DM to ${member.user.tag}`);
      } catch (error) {
        // The user might have DMs disabled
        logger.warn(`Could not send welcome DM to ${member.user.tag}:`, error.message);
      }
    } catch (error) {
      logger.error(`Error handling guildMemberAdd for ${member?.user?.tag || 'unknown member'}:`, error);
    }
  }
};

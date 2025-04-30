// Event handler for when a member leaves the server
const { logger } = require('../utils/logger');
const { createGoodbyeEmbed } = require('../utils/embedBuilder');
const config = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    try {
      logger.info(`Member left: ${member.user.tag} (${member.id})`);
      
      // Send goodbye message in designated channel
      const goodbyeChannel = member.guild.channels.cache.get(config.channels.goodbye);
      
      if (goodbyeChannel) {
        const goodbyeEmbed = createGoodbyeEmbed(member);
        
        await goodbyeChannel.send({
          embeds: [goodbyeEmbed]
        });
        
        logger.info(`Sent goodbye message for ${member.user.tag}`);
      } else {
        logger.warn(`Goodbye channel (${config.channels.goodbye}) not found in guild ${member.guild.name}`);
      }
      
      // Additional actions for when members leave (e.g., logging, cleanup) can be added here
    } catch (error) {
      logger.error(`Error handling guildMemberRemove for ${member?.user?.tag || 'unknown member'}:`, error);
    }
  }
};

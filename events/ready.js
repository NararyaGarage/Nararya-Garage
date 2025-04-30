// Event handler for when the bot becomes ready
const { logger } = require('../utils/logger');
const config = require('../config');
// Status rotation is now handled in utils/statusRotation.js directly

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`Bot logged in as ${client.user.tag}`);
    
    // Status rotation is set up in utils/statusRotation.js and utils/scheduledTasks.js
    
    // Log information about connected guilds
    const guilds = client.guilds.cache;
    logger.info(`Serving ${guilds.size} guild(s)`);
    
    guilds.forEach(guild => {
      logger.info(`Connected to guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
    });
    
    // Send welcome message when bot joins a new server
    const sendServerWelcomeMessage = (guild) => {
      try {
        // Find the first suitable text channel to send the welcome message
        const channel = guild.channels.cache.find(
          channel => channel.type === 0 && // GUILD_TEXT value in Discord.js v14
                     channel.permissionsFor(guild.members.me).has('SendMessages')
        );
        
        if (!channel) {
          logger.warn(`Could not find a suitable channel to send welcome message in ${guild.name}`);
          return;
        }
        
        const { createEmbed } = require('../utils/embedBuilder');
        
        const welcomeEmbed = createEmbed()
          .setTitle('Terima Kasih Telah Menambahkan Nararya Garage Bot!')
          .setDescription(
            'Bot ini dibuat untuk komunitas penggemar JKT48 dengan berbagai fitur menarik ' +
            'seperti notifikasi live, informasi teater, dan banyak lagi.'
          )
          .addFields(
            { 
              name: 'Mulai Dengan', 
              value: 'Gunakan `/help` untuk melihat daftar perintah yang tersedia.'
            },
            { 
              name: 'Bergabung dengan Komunitas Kami', 
              value: `[Join Discord Server](${config.botInfo.inviteLink})`
            },
            {
              name: 'Fitur Utama',
              value: 
                '• Notifikasi Live JKT48\n' +
                '• Jadwal Teater & Event\n' +
                '• Informasi Member\n' +
                '• Game Interaktif\n' +
                '• Sistem Moderasi\n' +
                '• Dan masih banyak lagi!'
            }
          );
          
        channel.send({ embeds: [welcomeEmbed] })
          .then(() => logger.info(`Sent welcome message to ${guild.name}`))
          .catch(error => logger.error(`Failed to send welcome message to ${guild.name}:`, error));
          
      } catch (error) {
        logger.error(`Error sending welcome message to guild ${guild.name}:`, error);
      }
    };
    
    // Process all guilds the bot is newly connected to
    guilds.forEach(guild => {
      // We can check if this is a fresh connection in production code
      // For now, assume we're connecting for the first time
      if (process.env.SEND_WELCOME_ON_READY === 'true') {
        sendServerWelcomeMessage(guild);
      }
    });
    
    // Set up handler for joining new guilds in the future
    client.on('guildCreate', guild => {
      logger.info(`Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
      sendServerWelcomeMessage(guild);
    });
    
    // Log when removed from a guild
    client.on('guildDelete', guild => {
      logger.info(`Removed from guild: ${guild.name} (${guild.id})`);
    });
  }
};

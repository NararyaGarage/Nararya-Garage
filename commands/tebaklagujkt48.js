// Command for a "guess the JKT48 song" game
const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const { getAllSongs } = require('../../models/setlistData');
const config = require('../../config');

// In-memory storage for daily game limits
// In a production environment, this would use a database
const dailyLimits = new Map();

// Reset daily limits if date changes
const lastResetDate = new Date().toDateString();
function checkAndResetDailyLimits() {
  const currentDate = new Date().toDateString();
  if (currentDate !== lastResetDate) {
    dailyLimits.clear();
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tebaklagujkt48')
    .setDescription('Game tebak lagu JKT48'),
  cooldown: 10,
  async execute(interaction, client) {
    try {
      // Check and reset daily limits if needed
      checkAndResetDailyLimits();
      
      // Check if user has reached daily limit
      const userId = interaction.user.id;
      const userLimit = dailyLimits.get(userId) || 0;
      
      if (userLimit >= config.games.maxTebakLaguPerDay) {
        await interaction.reply({
          content: `Anda telah mencapai batas harian (${config.games.maxTebakLaguPerDay}x) untuk game tebak lagu. Silakan coba lagi besok!`,
          ephemeral: true
        });
        return;
      }
      
      // Update user's daily limit
      dailyLimits.set(userId, userLimit + 1);
      
      // Get all JKT48 songs
      const songs = getAllSongs();
      
      if (songs.length === 0) {
        await interaction.reply({
          content: 'Tidak ada data lagu yang tersedia saat ini. Silakan coba lagi nanti.',
          ephemeral: true
        });
        return;
      }
      
      // Select random song
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      
      // Create a partial song title with some letters hidden
      let songTitle = randomSong;
      let hiddenTitle = '';
      
      for (let i = 0; i < songTitle.length; i++) {
        if (songTitle[i] === ' ') {
          hiddenTitle += ' ';
        } else if (Math.random() > 0.4) { // 60% chance to hide a letter
          hiddenTitle += '_';
        } else {
          hiddenTitle += songTitle[i];
        }
      }
      
      // Find which setlists the song appears in
      const { getAllSetlists } = require('../../models/setlistData');
      const allSetlists = getAllSetlists();
      
      const setlistsWithSong = allSetlists.filter(setlist => 
        setlist.songs.includes(randomSong)
      );
      
      // Create the game embed
      const gameEmbed = createEmbed()
        .setTitle('🎮 Tebak Lagu JKT48')
        .setDescription(
          'Tebak judul lagu JKT48 dari petunjuk berikut:\n\n' +
          `**Judul**: \`${hiddenTitle}\`\n\n`
        )
        .setFooter({
          text: `${userLimit + 1}/${config.games.maxTebakLaguPerDay} permainan hari ini | Dijawab oleh: ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL()
        });
      
      // Add hints for setlists if available
      if (setlistsWithSong.length > 0) {
        const setlistNames = setlistsWithSong.map(s => s.name).join(', ');
        gameEmbed.addFields({
          name: 'Petunjuk',
          value: `Lagu ini ada di setlist: ${setlistNames}`
        });
      }
      
      gameEmbed.setDescription(
        gameEmbed.data.description + 
        'Ketik jawaban Anda dalam 30 detik!'
      );
      
      await interaction.reply({
        embeds: [gameEmbed]
      });
      
      // Set up collector for answers
      const filter = m => m.author.id === interaction.user.id;
      const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });
      
      let answered = false;
      
      collector.on('collect', async message => {
        // Check if answer is correct (case insensitive)
        if (message.content.toLowerCase() === randomSong.toLowerCase()) {
          answered = true;
          collector.stop();
          
          // Create success embed
          const successEmbed = createEmbed()
            .setTitle('🎉 Jawaban Benar!')
            .setDescription(
              `Selamat! Anda berhasil menebak judul lagu JKT48 dengan benar.\n\n` +
              `**Judul**: ${randomSong}\n`
            )
            .setFooter({
              text: `${userLimit + 1}/${config.games.maxTebakLaguPerDay} permainan hari ini | Dijawab oleh: ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL()
            });
          
          // Add setlist information
          if (setlistsWithSong.length > 0) {
            const setlistInfo = setlistsWithSong.map(s => 
              `• ${s.name} (${s.status === 'active' ? 'Active' : 'Inactive'})`
            ).join('\n');
            
            successEmbed.addFields({
              name: 'Setlist',
              value: setlistInfo
            });
          }
          
          await message.reply({
            embeds: [successEmbed]
          });
          
          logger.info(`User ${interaction.user.tag} correctly guessed "${randomSong}" in tebaklagujkt48 game`);
        } else {
          // Give feedback that the answer is wrong
          await message.reply({
            content: 'Jawaban salah! Silakan coba lagi.',
            ephemeral: true
          });
        }
      });
      
      collector.on('end', () => {
        if (!answered) {
          // Create timeout embed
          const timeoutEmbed = createEmbed()
            .setTitle('⏱️ Waktu Habis!')
            .setDescription(
              `Waktu habis! Jawaban yang benar adalah:\n\n` +
              `**Judul**: ${randomSong}\n`
            )
            .setFooter({
              text: `${userLimit + 1}/${config.games.maxTebakLaguPerDay} permainan hari ini | Dijawab oleh: ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL()
            });
          
          // Add setlist information
          if (setlistsWithSong.length > 0) {
            const setlistInfo = setlistsWithSong.map(s => 
              `• ${s.name} (${s.status === 'active' ? 'Active' : 'Inactive'})`
            ).join('\n');
            
            timeoutEmbed.addFields({
              name: 'Setlist',
              value: setlistInfo
            });
          }
          
          interaction.followUp({
            embeds: [timeoutEmbed]
          });
          
          logger.info(`User ${interaction.user.tag} failed to guess "${randomSong}" in tebaklagujkt48 game (timeout)`);
        }
      });
    } catch (error) {
      logger.error('Error executing tebaklagujkt48 command:', error);
      await interaction.reply({ 
        content: 'Terjadi kesalahan saat memulai game tebak lagu. Silakan coba lagi nanti.',
        ephemeral: true 
      });
    }
  }
};

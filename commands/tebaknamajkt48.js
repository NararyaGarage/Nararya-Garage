// Command for a "guess the JKT48 member name" game
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { logger } = require('../../utils/logger');
const { getAllMembers, getCurrentMembers } = require('../../models/jkt48Members');
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
    .setName('tebaknamajkt48')
    .setDescription('Game tebak nama member JKT48')
    .addBooleanOption(option =>
      option.setName('include_graduated')
        .setDescription('Sertakan member yang sudah graduated')
        .setRequired(false)),
  cooldown: 10,
  async execute(interaction, client) {
    try {
      // Check and reset daily limits if needed
      checkAndResetDailyLimits();
      
      // Check if user has reached daily limit
      const userId = interaction.user.id;
      const userLimit = dailyLimits.get(userId) || 0;
      
      if (userLimit >= config.games.maxTebakNamaPerDay) {
        await interaction.reply({
          content: `Anda telah mencapai batas harian (${config.games.maxTebakNamaPerDay}x) untuk game tebak nama. Silakan coba lagi besok!`,
          ephemeral: true
        });
        return;
      }
      
      // Update user's daily limit
      dailyLimits.set(userId, userLimit + 1);
      
      // Get option to include graduated members
      const includeGraduated = interaction.options.getBoolean('include_graduated') || false;
      
      // Get members based on the option
      const members = includeGraduated ? getAllMembers() : getCurrentMembers();
      
      if (members.length === 0) {
        await interaction.reply({
          content: 'Tidak ada data member yang tersedia saat ini. Silakan coba lagi nanti.',
          ephemeral: true
        });
        return;
      }
      
      // Select random member
      const randomMember = members[Math.floor(Math.random() * members.length)];
      
      // Create a partial name with some letters hidden
      let fullName = randomMember.fullName;
      let hiddenName = '';
      
      for (let i = 0; i < fullName.length; i++) {
        if (fullName[i] === ' ') {
          hiddenName += ' ';
        } else if (Math.random() > 0.4) { // 60% chance to hide a letter
          hiddenName += '_';
        } else {
          hiddenName += fullName[i];
        }
      }
      
      // Add some hints
      const hints = [
        `Team: ${randomMember.team || 'Tidak diketahui'}`,
        `Generasi: ${randomMember.generation || 'Tidak diketahui'}`
      ];
      
      // If the member is graduated, add that as a hint
      if (randomMember.graduated) {
        hints.push('Status: Graduated');
      }
      
      // Create the game embed
      const gameEmbed = createEmbed()
        .setTitle('🎮 Tebak Nama Member JKT48')
        .setDescription(
          'Tebak nama lengkap member JKT48 dari petunjuk berikut:\n\n' +
          `**Nama**: \`${hiddenName}\`\n\n` +
          `**Petunjuk**:\n${hints.map(hint => `• ${hint}`).join('\n')}\n\n` +
          'Ketik jawaban Anda dalam 30 detik!'
        )
        .setFooter({
          text: `${userLimit + 1}/${config.games.maxTebakNamaPerDay} permainan hari ini | Dijawab oleh: ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL()
        });
      
      await interaction.reply({
        embeds: [gameEmbed]
      });
      
      // Set up collector for answers
      const filter = m => m.author.id === interaction.user.id;
      const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });
      
      let answered = false;
      
      collector.on('collect', async message => {
        // Check if answer is correct (case insensitive)
        if (message.content.toLowerCase() === randomMember.fullName.toLowerCase()) {
          answered = true;
          collector.stop();
          
          // Create success embed
          const successEmbed = createEmbed()
            .setTitle('🎉 Jawaban Benar!')
            .setDescription(
              `Selamat! Anda berhasil menebak nama member JKT48 dengan benar.\n\n` +
              `**Nama**: ${randomMember.fullName} (${randomMember.nickName})\n` +
              `**Team**: ${randomMember.team || 'Tidak diketahui'}\n` +
              `**Generasi**: ${randomMember.generation || 'Tidak diketahui'}\n` +
              `**Status**: ${randomMember.graduated ? 'Graduated' : 'Active'}`
            )
            .setFooter({
              text: `${userLimit + 1}/${config.games.maxTebakNamaPerDay} permainan hari ini | Dijawab oleh: ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL()
            });
          
          // If there's a profile image, add it (in a real implementation this would use a proper image handling system)
          if (randomMember.instagramHandle) {
            successEmbed.addFields({
              name: 'Social Media',
              value: `[Instagram](https://www.instagram.com/${randomMember.instagramHandle})`
            });
          }
          
          await message.reply({
            embeds: [successEmbed]
          });
          
          logger.info(`User ${interaction.user.tag} correctly guessed ${randomMember.fullName} in tebaknamajkt48 game`);
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
              `**Nama**: ${randomMember.fullName} (${randomMember.nickName})\n` +
              `**Team**: ${randomMember.team || 'Tidak diketahui'}\n` +
              `**Generasi**: ${randomMember.generation || 'Tidak diketahui'}\n` +
              `**Status**: ${randomMember.graduated ? 'Graduated' : 'Active'}`
            )
            .setFooter({
              text: `${userLimit + 1}/${config.games.maxTebakNamaPerDay} permainan hari ini | Dijawab oleh: ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL()
            });
          
          interaction.followUp({
            embeds: [timeoutEmbed]
          });
          
          logger.info(`User ${interaction.user.tag} failed to guess ${randomMember.fullName} in tebaknamajkt48 game (timeout)`);
        }
      });
    } catch (error) {
      logger.error('Error executing tebaknamajkt48 command:', error);
      await interaction.reply({ 
        content: 'Terjadi kesalahan saat memulai game tebak nama. Silakan coba lagi nanti.',
        ephemeral: true 
      });
    }
  }
};

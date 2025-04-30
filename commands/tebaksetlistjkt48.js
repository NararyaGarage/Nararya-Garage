/**
 * Tebak Setlist JKT48 Command
 * 
 * Command permainan tebak setlist JKT48 berdasarkan deskripsi.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { logger } = require('../../utils/logger');
const { createErrorEmbed } = require('../../utils/embedBuilder');
const { getAllSetlists } = require('../../models/setlistData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tebaksetlistjkt48')
    .setDescription('Permainan tebak setlist JKT48'),
  
  async execute(interaction) {
    try {
      // Get all setlists
      const allSetlists = getAllSetlists();
      
      // Pick a random setlist
      const randomSetlist = getRandomSetlist(allSetlists);
      
      if (!randomSetlist) {
        return interaction.reply({
          embeds: [createErrorEmbed('Gagal memuat data setlist. Silakan coba lagi.')],
          ephemeral: true
        });
      }

      // Generate multiple choice options (1 correct, 3 wrong)
      const options = generateOptions(randomSetlist, allSetlists);
      
      // Create buttons for choices
      const row = new ActionRowBuilder();
      
      options.forEach((option, index) => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`answer_${index}`)
            .setLabel(option.name)
            .setStyle(ButtonStyle.Primary)
        );
      });
      
      // Create clue hints
      const hints = generateHints(randomSetlist);
      
      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('🎭 Tebak Setlist JKT48')
        .setDescription(`Tebaklah setlist JKT48 dari petunjuk berikut:\n\n${hints.join('\n')}`)
        .setColor('#FF6200')
        .setFooter({ 
          text: '© 2025 Nararya Garage Team - All Rights Reserved',
          iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
        })
        .setTimestamp();
      
      // Send the question
      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true
      });
      
      // Create collector for button presses
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000 // 30 seconds to answer
      });
      
      // Store correct answer index
      const correctIndex = options.findIndex(option => option.id === randomSetlist.id);
      
      // Handle button presses
      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: 'Ini bukan permainan untukmu! Gunakan `/tebaksetlistjkt48` untuk memulai permainan sendiri.',
            ephemeral: true
          });
        }
        
        // Get the selected answer index
        const selectedIndex = parseInt(i.customId.split('_')[1]);
        
        // Disable all buttons
        row.components.forEach(button => button.setDisabled(true));
        
        // Set button colors based on answer
        row.components.forEach((button, index) => {
          if (index === correctIndex) {
            button.setStyle(ButtonStyle.Success); // Correct answer is green
          } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            button.setStyle(ButtonStyle.Danger); // Wrong answer is red
          }
        });
        
        // Update embed based on answer
        if (selectedIndex === correctIndex) {
          embed.setTitle('🎉 Benar! Kamu Menebak dengan Tepat!');
          embed.setDescription(`Setlist yang benar adalah **${randomSetlist.name}**!\n\n${getSetlistDescription(randomSetlist)}`);
          embed.setColor('#2ecc71');
        } else {
          embed.setTitle('❌ Jawaban Salah!');
          embed.setDescription(`Setlist yang benar adalah **${randomSetlist.name}**.\n\n${getSetlistDescription(randomSetlist)}`);
          embed.setColor('#e74c3c');
        }
        
        // Update the message
        await i.update({
          embeds: [embed],
          components: [row]
        });
        
        // Stop the collector
        collector.stop();
      });
      
      // Handle collector end
      collector.on('end', collected => {
        if (collected.size === 0) {
          // No answer was given, show the correct answer
          row.components.forEach((button, index) => {
            button.setDisabled(true);
            if (index === correctIndex) {
              button.setStyle(ButtonStyle.Success);
            }
          });
          
          embed.setTitle('⌛ Waktu Habis!');
          embed.setDescription(`Setlist yang benar adalah **${randomSetlist.name}**.\n\n${getSetlistDescription(randomSetlist)}`);
          embed.setColor('#95a5a6');
          
          interaction.editReply({
            embeds: [embed],
            components: [row]
          }).catch(error => logger.error('Error updating message after timeout:', error));
        }
      });
    } catch (error) {
      logger.error('Error executing tebaksetlistjkt48 command:', error);
      
      return interaction.reply({
        embeds: [createErrorEmbed('Terjadi kesalahan saat menjalankan permainan. Silakan coba lagi.')],
        ephemeral: true
      });
    }
  }
};

/**
 * Get a random setlist from the list
 * @param {Array} setlists - Array of setlists
 * @returns {Object} Random setlist
 */
function getRandomSetlist(setlists) {
  const activeSetlists = setlists.filter(setlist => setlist.active);
  
  if (activeSetlists.length > 0) {
    return activeSetlists[Math.floor(Math.random() * activeSetlists.length)];
  } else {
    return setlists[Math.floor(Math.random() * setlists.length)];
  }
}

/**
 * Generate multiple choice options
 * @param {Object} correctSetlist - The correct setlist
 * @param {Array} allSetlists - All available setlists
 * @returns {Array} Array of 4 options (1 correct, 3 wrong)
 */
function generateOptions(correctSetlist, allSetlists) {
  // Start with the correct answer
  const options = [correctSetlist];
  
  // Filter out the correct setlist
  const otherSetlists = allSetlists.filter(setlist => setlist.id !== correctSetlist.id);
  
  // Shuffle and pick 3 wrong answers
  const shuffled = otherSetlists.sort(() => 0.5 - Math.random());
  const wrongOptions = shuffled.slice(0, 3);
  
  // Add wrong options to options array
  options.push(...wrongOptions);
  
  // Shuffle all options
  return options.sort(() => 0.5 - Math.random());
}

/**
 * Generate hints for the setlist
 * @param {Object} setlist - The setlist to generate hints for
 * @returns {Array} Array of hint strings
 */
function generateHints(setlist) {
  const hints = [];
  
  // Add theater generation hint
  hints.push(`🏮 Theater generation: **${setlist.generation}**`);
  
  // Add original group hint if available
  if (setlist.originalGroup) {
    hints.push(`🌐 Original group: **${setlist.originalGroup}**`);
  }
  
  // Add year hint if available
  if (setlist.year) {
    hints.push(`📅 Tahun pertama kali diperkenalkan: **${setlist.year}**`);
  }
  
  // Add hint about number of songs
  if (setlist.songs && setlist.songs.length > 0) {
    hints.push(`🎵 Memiliki **${setlist.songs.length}** lagu`);
  }
  
  // Add hint about one random song from the setlist
  if (setlist.songs && setlist.songs.length > 0) {
    const randomSong = setlist.songs[Math.floor(Math.random() * setlist.songs.length)];
    hints.push(`🎶 Salah satu lagunya: **${randomSong.title}**`);
  }
  
  return hints;
}

/**
 * Get a detailed description of the setlist
 * @param {Object} setlist - The setlist
 * @returns {string} Detailed description
 */
function getSetlistDescription(setlist) {
  let description = '';
  
  if (setlist.description) {
    description += `${setlist.description}\n\n`;
  }
  
  description += `🏮 Theater generation: **${setlist.generation}**\n`;
  
  if (setlist.originalGroup) {
    description += `🌐 Original group: **${setlist.originalGroup}**\n`;
  }
  
  if (setlist.year) {
    description += `📅 Tahun pertama kali diperkenalkan: **${setlist.year}**\n`;
  }
  
  description += `💿 Status: **${setlist.active ? 'Aktif' : 'Tidak Aktif'}**`;
  
  return description;
}
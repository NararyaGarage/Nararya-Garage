/**
 * Tebak Suara Member JKT48 Command
 * 
 * Command permainan tebak suara member JKT48 dari cuplikan audio.
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
const { getCurrentMembers } = require('../../models/jkt48Members');

// Audio clips data (URLs to short audio clips of member voices)
const audioClips = [
  {
    id: 'freya',
    name: 'Freya Jayawardana',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/freya_voice.mp3',
    hint: 'Member JKT48 Gen 9'
  },
  {
    id: 'feni',
    name: 'Feni Fitriyanti',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/feni_voice.mp3',
    hint: 'Member JKT48 Gen 7'
  },
  {
    id: 'gracia',
    name: 'Gracia Novita',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/gracia_voice.mp3',
    hint: 'Member JKT48 Gen 3'
  },
  {
    id: 'jinan',
    name: 'Jinan Safa Safira',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/jinan_voice.mp3',
    hint: 'Member JKT48 Gen 7'
  },
  {
    id: 'shani',
    name: 'Shani Indira Natio',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/shani_voice.mp3',
    hint: 'Member JKT48 Gen 3'
  },
  {
    id: 'adel',
    name: 'Adel Yuwono',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/adel_voice.mp3',
    hint: 'Member JKT48 Gen 8'
  },
  {
    id: 'marsha',
    name: 'Marsha Lenathea',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/marsha_voice.mp3',
    hint: 'Member JKT48 Gen 10'
  },
  {
    id: 'muthe',
    name: 'Mutiara Azzahra',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/muthe_voice.mp3',
    hint: 'Member JKT48 Gen 10'
  },
  {
    id: 'ashel',
    name: 'Angelina Christy',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/ashel_voice.mp3',
    hint: 'Member JKT48 Gen 7'
  },
  {
    id: 'flora',
    name: 'Flora Shafiqa Riyadi',
    url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/flora_voice.mp3',
    hint: 'Member JKT48 Gen 9'
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tebaksuarajkt48')
    .setDescription('Permainan tebak suara member JKT48'),
  
  async execute(interaction) {
    try {
      // Select a random audio clip
      const randomClip = audioClips[Math.floor(Math.random() * audioClips.length)];
      
      // Get current members for multiple choice options
      let currentMembers = getCurrentMembers();
      
      // If getCurrentMembers() fails, create a fallback
      if (!currentMembers || !Array.isArray(currentMembers) || currentMembers.length < 4) {
        currentMembers = audioClips.map(clip => ({ id: clip.id, name: clip.name }));
      }
      
      // Generate multiple choice options (1 correct, 3 wrong)
      const options = generateOptions(randomClip, currentMembers);
      
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
      
      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('🎵 Tebak Suara Member JKT48')
        .setDescription(`Siapakah pemilik suara dalam cuplikan audio ini?\n\n**Petunjuk:** ${randomClip.hint}\n\n**Audio:**\n${randomClip.url}`)
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
      const correctIndex = options.findIndex(option => option.id === randomClip.id);
      
      // Handle button presses
      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: 'Ini bukan permainan untukmu! Gunakan `/tebaksuarajkt48` untuk memulai permainan sendiri.',
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
          embed.setDescription(`Suara tersebut adalah milik **${randomClip.name}**!\n\n**Audio:**\n${randomClip.url}`);
          embed.setColor('#2ecc71');
        } else {
          embed.setTitle('❌ Jawaban Salah!');
          embed.setDescription(`Suara tersebut adalah milik **${randomClip.name}**.\n\n**Audio:**\n${randomClip.url}`);
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
          embed.setDescription(`Suara tersebut adalah milik **${randomClip.name}**.\n\n**Audio:**\n${randomClip.url}`);
          embed.setColor('#95a5a6');
          
          interaction.editReply({
            embeds: [embed],
            components: [row]
          }).catch(error => logger.error('Error updating message after timeout:', error));
        }
      });
    } catch (error) {
      logger.error('Error executing tebaksuarajkt48 command:', error);
      
      return interaction.reply({
        embeds: [createErrorEmbed('Terjadi kesalahan saat menjalankan permainan. Silakan coba lagi.')],
        ephemeral: true
      });
    }
  }
};

/**
 * Generate multiple choice options
 * @param {Object} correctMember - The correct member
 * @param {Array} allMembers - All available members
 * @returns {Array} Array of 4 options (1 correct, 3 wrong)
 */
function generateOptions(correctMember, allMembers) {
  // Start with the correct answer
  const options = [correctMember];
  
  // Filter out the correct member
  const otherMembers = allMembers.filter(member => member.id !== correctMember.id);
  
  // Shuffle and pick 3 wrong answers
  const shuffled = otherMembers.sort(() => 0.5 - Math.random());
  const wrongOptions = shuffled.slice(0, 3);
  
  // Add wrong options to options array
  options.push(...wrongOptions);
  
  // Shuffle all options
  return options.sort(() => 0.5 - Math.random());
}
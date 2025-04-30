/**
 * Tebak Jiko (Catchphrase) Member JKT48 Command
 * 
 * Command permainan tebak jiko/catchphrase member JKT48.
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

// Jiko (catchphrase) data
const jikoData = [
  {
    id: 'freya',
    name: 'Freya Jayawardana',
    jiko: "Boleh panggil aku Freya! Nama lengkapku Freya Jayawardana, JKT48 Team J. Love and Respect! Yoroshiku onegaishimasu!",
    team: 'Team J',
    generation: 9
  },
  {
    id: 'feni',
    name: 'Feni Fitriyanti',
    jiko: "Senyum semanis gulali, seceria pelangi. Hai, nama aku Feni Fitriyanti, member JKT48 dari generasi 7. Yoroshiku onegaishimasu!",
    team: 'Team KING',
    generation: 7
  },
  {
    id: 'gracia',
    name: 'Gracia Novita',
    jiko: "Hai, perkenalkan namaku Gracia Novita. Panggil aku Gracia. JKT48 Team KING. Bahagia itu harus, bersyukur itu wajib. Yoroshiku onegaishimasu!",
    team: 'Team KING',
    generation: 3
  },
  {
    id: 'jinan',
    name: 'Jinan Safa Safira',
    jiko: "Satu, dua, tiga, tebak siapa? Hai, namaku Jinan Safa Safira. Panggil aku Jinan. JKT48 Team J. Senyum, sapa, terima kasih. Yoroshiku onegaishimasu!",
    team: 'Team J',
    generation: 7
  },
  {
    id: 'shani',
    name: 'Shani Indira Natio',
    jiko: "Halo, nama aku Shani Indira Natio. Panggil aku Shani. JKT48 Team KING. Mari berbagi kebahagiaan bersama. Yoroshiku onegaishimasu!",
    team: 'Team KING',
    generation: 3
  },
  {
    id: 'adel',
    name: 'Adel Yuwono',
    jiko: "Kecerian yang aku bawa, senyuman yang aku punya. Halo, nama aku Adel Yuwono. JKT48 Team KING. Yoroshiku onegaishimasu!",
    team: 'Team KING',
    generation: 8
  },
  {
    id: 'christy',
    name: 'Angelina Christy',
    jiko: "Hai semuanya! Namaku Angelina Christy, biasa dipanggil Christy atau Ashel. JKT48 Team J. Aku akan memberikan yang terbaik. Yoroshiku onegaishimasu!",
    team: 'Team J',
    generation: 7
  },
  {
    id: 'flora',
    name: 'Flora Shafiqa Riyadi',
    jiko: "Hai semuanya! Aku Flora Shafiqa Riyadi. Panggil aku Flora. JKT48 Team KING. Semangat dan energik, mari bersenang-senang bersama! Yoroshiku onegaishimasu!",
    team: 'Team KING',
    generation: 9
  },
  {
    id: 'gita',
    name: 'Gita Sekar Andarini',
    jiko: "Sepuluh, sembilan, delapan... Hello! Namaku Gita Sekar Andarini. Panggil aku Gita. JKT48 Team J. Mari kita bersenang-senang! Yoroshiku onegaishimasu!",
    team: 'Team J',
    generation: 6
  },
  {
    id: 'kathrina',
    name: 'Kathrina Irene',
    jiko: "Hai hai hai! Namaku Kathrina Irene. JKT48 Team J. Bersama sama lebih menyenangkan. Yoroshiku onegaishimasu!",
    team: 'Team J',
    generation: 8
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tebakjikojkt48')
    .setDescription('Permainan tebak jiko (catchphrase) member JKT48'),
  
  async execute(interaction) {
    try {
      // Select a random jiko
      const randomJiko = jikoData[Math.floor(Math.random() * jikoData.length)];
      
      // Generate multiple choice options (1 correct, 3 wrong)
      const options = generateOptions(randomJiko, jikoData);
      
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
        .setTitle('🎭 Tebak Jiko Member JKT48')
        .setDescription(`Siapakah pemilik jiko/catchphrase berikut?\n\n"${randomJiko.jiko}"`)
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
      const correctIndex = options.findIndex(option => option.id === randomJiko.id);
      
      // Handle button presses
      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: 'Ini bukan permainan untukmu! Gunakan `/tebakjikojkt48` untuk memulai permainan sendiri.',
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
          embed.setDescription(`Jiko tersebut adalah milik **${randomJiko.name}**!\n\n"${randomJiko.jiko}"\n\n**Team:** ${randomJiko.team}\n**Generation:** ${randomJiko.generation}`);
          embed.setColor('#2ecc71');
        } else {
          embed.setTitle('❌ Jawaban Salah!');
          embed.setDescription(`Jiko tersebut adalah milik **${randomJiko.name}**.\n\n"${randomJiko.jiko}"\n\n**Team:** ${randomJiko.team}\n**Generation:** ${randomJiko.generation}`);
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
          embed.setDescription(`Jiko tersebut adalah milik **${randomJiko.name}**.\n\n"${randomJiko.jiko}"\n\n**Team:** ${randomJiko.team}\n**Generation:** ${randomJiko.generation}`);
          embed.setColor('#95a5a6');
          
          interaction.editReply({
            embeds: [embed],
            components: [row]
          }).catch(error => logger.error('Error updating message after timeout:', error));
        }
      });
    } catch (error) {
      logger.error('Error executing tebakjikojkt48 command:', error);
      
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
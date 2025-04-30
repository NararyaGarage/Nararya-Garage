/**
 * Status Rotation Utility
 * 
 * Utility untuk menampilkan dan merotasi status Discord bot.
 * Status berisi lagu-lagu JKT48 untuk rotasi sebagai pengganti nama member.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { ActivityType } = require('discord.js');
const { logger } = require('./logger');

// Daftar lagu-lagu JKT48 untuk rotasi status
const jkt48Songs = [
  'Heavy Rotation', 'River', 'Rapsodi', 'Fortune Cookie', 'Koisuru Fortune Cookie',
  'Kibouteki Refrain', 'Everyday Kachuusha', 'Kokoro no Placard', 'Manatsu no Sounds Good',
  'Beginner', 'Kimi wa Melody', 'Halloween Night', 'High Tension', 'Sakura no Hanabiratachi',
  'Ponytail to Shushu', 'Flying Get', 'First Rabbit', 'Kaze wa Fuiteiru', 'Oogoe Diamond',
  'Musim Panas Sounds Good', 'Gingham Check', 'Kimi no Koto ga Suki Dakara', 'Futari Nori no Jitensha',
  'So Long!', 'Hissatsu Teleport', 'Aitakatta', 'Yuuhi wo Miteiru ka?', 'Shoujotachi yo',
  'Hikaeme I Love You', 'Heart Gata Virus', 'Namida Surprise', 'Kimi no Koto ga Suki Dakara',
  'Gorgeous', 'Idol no Yoake', 'Kimi wa Boku no Kaze', 'Majisuka Rock n Roll', 'Baby! Baby! Baby!',
  'Hanya Lihat Ke Depan', 'Lantang', 'Viva! Hurricane', 'BINGO!', 'Papan Penanda Isi Hati',
  'Shiroi Shirt', 'Kibou, Mirai, Kotoba', 'Ingin Bertemu', 'One for Me', 'Renai Kinshi Jourei',
  'Apakah Kau Melihat Mentari Senja?', 'Mae Shika Mukanee', 'Seifuku ga Jama wo Suru',
  'Suzukake no Ki no Michi de', 'Shonichi', 'Kimi wo Kimi wo Kimi wo', 'Anata ga Ite Kureta Kara',
  'Sugar Rush', 'Maeshika Mukanee', 'Nage Kiss de Uchi Otose', 'Sagaritsuita Kajitsu'
];

// Tipe aktivitas yang akan digunakan untuk rotasi
const activityTypes = [
  { type: ActivityType.Playing, prefix: 'Playing' },
  { type: ActivityType.Watching, prefix: 'Watching' },
  { type: ActivityType.Listening, prefix: 'Listening to' }
];

// Status tambahan untuk ditampilkan
const additionalStatuses = [
  { text: 'JKT48 Theater', type: ActivityType.Watching },
  { text: 'JKT48 Official', type: ActivityType.Watching },
  { text: 'NGC Economy System', type: ActivityType.Playing },
  { text: 'Nararya Garage Community', type: ActivityType.Watching },
  { text: 'Mancing untuk NGC', type: ActivityType.Playing },
  { text: 'JKT48 Setlist', type: ActivityType.Listening },
  { text: 'Ticket Support System', type: ActivityType.Playing },
  { text: 'Help: /help', type: ActivityType.Playing }
];

// Interval rotasi status dalam milidetik (30 detik)
const ROTATION_INTERVAL = 30000;

/**
 * Mulai rotasi status bot
 * @param {Client} client - Discord client
 */
function startStatusRotation(client) {
  try {
    logger.info(`Rotating status with ${jkt48Songs.length} different songs from JKT48`);
    
    let currentIndex = 0;
    let currentTypeIndex = 0;
    let useAdditional = false;
    
    // Set initial status
    updateStatus(client, currentIndex, currentTypeIndex, useAdditional);
    
    // Mulai interval untuk rotasi status
    setInterval(() => {
      // Alternate between songs and additional statuses
      useAdditional = !useAdditional;
      
      if (useAdditional) {
        // Use additional status
        const additionalIndex = Math.floor(Math.random() * additionalStatuses.length);
        const additional = additionalStatuses[additionalIndex];
        
        client.user.setActivity(additional.text, { type: additional.type });
      } else {
        // Update indexes
        currentIndex = (currentIndex + 1) % jkt48Songs.length;
        // Selalu gunakan ActivityType.Listening untuk lagu
        currentTypeIndex = 2; // Index untuk ActivityType.Listening
        
        // Update status dengan lagu JKT48
        updateStatus(client, currentIndex, currentTypeIndex, useAdditional);
      }
    }, ROTATION_INTERVAL);
    
  } catch (error) {
    logger.error(`Error starting status rotation: ${error.message}`);
  }
}

/**
 * Update status bot
 * @param {Client} client - Discord client
 * @param {number} songIndex - Index lagu yang dipilih
 * @param {number} typeIndex - Index tipe aktivitas yang dipilih
 * @param {boolean} useAdditional - Apakah menggunakan status tambahan
 */
function updateStatus(client, songIndex, typeIndex, useAdditional) {
  try {
    const song = jkt48Songs[songIndex];
    const activityType = activityTypes[typeIndex];
    
    client.user.setActivity(`${song}`, { type: activityType.type });
  } catch (error) {
    logger.error(`Error updating status: ${error.message}`);
  }
}

module.exports = { startStatusRotation };
/**
 * Command Preview Utility
 * 
 * Modul ini menyediakan fungsi untuk menampilkan preview instan saat command dijalankan.
 * Preview akan muncul segera, memberikan respon cepat sebelum data penuh diproses.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */
const { logger } = require('./logger');

/**
 * Pesan preview default untuk setiap command
 * Format: { 'nama_command': 'pesan_preview' }
 */
const COMMAND_PREVIEWS = {
  // Info commands
  'help': 'Memuat bantuan Nararya Garage Bot...',
  'botstatus': 'Memeriksa status bot...',
  'botversion': 'Memeriksa versi bot...',
  
  // Member commands
  'allmemberjkt48': 'Memuat data semua member JKT48...',
  'birthdaymemberjkt48': 'Memeriksa member JKT48 yang berulang tahun...',
  'graduatedmemberjkt48': 'Memuat data member JKT48 yang sudah lulus...',
  
  // Game commands
  'gachamemberjkt48': 'Mengacak member JKT48 secara random...',
  'tebaklagujkt48': 'Menyiapkan game tebak lagu JKT48...',
  'tebaknamajkt48': 'Menyiapkan game tebak nama member JKT48...',
  
  // Notification commands
  'livememberjkt48': 'Memeriksa live streaming member JKT48...',
  'theaterjkt48': 'Memeriksa jadwal theater JKT48...',
  
  // Ticket commands
  'createticket': 'Membuat tiket dukungan...',
  
  // Moderation commands
  'ban': 'Menyiapkan ban member...',
  'clear': 'Menyiapkan penghapusan pesan...',
  'kick': 'Menyiapkan kick member...',
  'mute': 'Menyiapkan mute member...',
  
  // Default preview untuk command yang tidak terdaftar
  'default': 'Memproses permintaan...'
};

/**
 * Menampilkan preview untuk command yang dijalankan
 * @param {Interaction} interaction - Discord interaction
 * @param {string} commandName - Nama command yang dijalankan
 * @returns {Promise<void>}
 */
async function generateCommandPreview(interaction, commandName) {
  try {
    // Ambil preview text dari daftar atau gunakan default
    const previewText = COMMAND_PREVIEWS[commandName] || COMMAND_PREVIEWS['default'];
    
    // Reply dengan preview
    await interaction.reply({
      content: `⏳ ${previewText}`,
      ephemeral: false // Bukan ephemeral agar bisa diedit
    });
    
    logger.info(`Showed preview for /${commandName}: "${previewText}"`);
    return true;
  } catch (error) {
    logger.error(`Failed to show preview for /${commandName}: ${error.message}`);
    return false;
  }
}

module.exports = {
  generateCommandPreview
};
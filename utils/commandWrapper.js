/**
 * Command Wrapper Utility
 * 
 * Utility untuk membungkus eksekusi command dan memastikan proper handling
 * untuk mencegah terjadinya "application did not respond" error.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { logger } = require('./logger');

/**
 * Wrapper untuk memastikan eksekusi command aman dari timeout
 * @param {Function} executeFunction - Fungsi execute dari command
 * @returns {Function} - Fungsi execute yang sudah dibungkus dengan error handling
 */
function wrapCommandExecute(executeFunction) {
  return async function(interaction, client) {
    // Set timeout untuk command execution sesuai dengan standar Discord (3 menit)
    // Discord memperbolehkan maksimum 15 menit, tapi kita gunakan 3 menit saja
    const commandTimeout = 180000; // 180 detik (3 menit) - standar maksimum Discord untuk interaksi
    let commandTimedOut = false;
    
    // Setup timer untuk pre-timeout warning - di 2 menit
    const warningTimeoutId = setTimeout(() => {
      if (interaction.deferred && !interaction.replied) {
        interaction.editReply({
          content: `⚠️ Perintah \`/${interaction.commandName}\` masih diproses. Mohon tunggu sebentar lagi...`
        }).catch(e => {
          logger.error(`Failed to send timeout warning: ${e.message}`);
        });
      }
    }, 120000); // 2 menit
    
    // Setup timer untuk timeout akhir dengan logging yang lebih detail
    const timeoutId = setTimeout(() => {
      commandTimedOut = true;
      logger.warn(`Command execution timed out after ${commandTimeout/1000} seconds: ${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id})`);
      
      // Memberi tahu user bahwa command telah timeout
      if (interaction.deferred && !interaction.replied) {
        interaction.editReply({
          content: `❌ Waktu eksekusi perintah \`/${interaction.commandName}\` telah habis. Silakan coba lagi. Jika masalah berlanjut, hubungi admin.`
        }).catch(e => {
          logger.error(`Failed to send timeout error: ${e.message}`);
        });
      }
      
      // Hapus warning timeout
      clearTimeout(warningTimeoutId);
    }, commandTimeout);
    
    try {
      // Always defer reply first if not already deferred or replied
      if (!interaction.deferred && !interaction.replied) {
        try {
          // Cek apakah interaksi masih valid sebelum mencoba deferReply
          if (interaction.isRepliable()) {
            // Discord memiliki batas 3 detik untuk respons awal - jadi kita atur timeout deferReply
            const deferPromise = interaction.deferReply();
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error('Defer reply timeout'));
              }, 2500); // 2.5 detik timeout untuk deferReply (Discord mewajibkan respons dalam 3 detik)
            });
            
            await Promise.race([deferPromise, timeoutPromise]);
            logger.info(`Command ${interaction.commandName} was deferred successfully`);
          } else {
            logger.warn(`Interaction for ${interaction.commandName} is no longer repliable`);
          }
        } catch (e) {
          logger.error(`Failed to defer reply for ${interaction.commandName}: ${e.message}`);
          
          // Jika gagal defer, coba reply ephemeral sebagai fallback dengan pengecekan apakah interaksi masih repliable
          try {
            if (interaction.isRepliable()) {
              await interaction.reply({ 
                content: '⏳ Mohon tunggu sebentar, sedang memproses perintah Anda...', 
                ephemeral: true 
              });
            }
          } catch (replyError) {
            logger.error(`Failed to send fallback reply: ${replyError.message}`);
            // Tidak perlu melakukan apa-apa jika fallback juga gagal - command akan tetap dieksekusi
          }
        }
      }
      
      // Execute the original command function LANGSUNG tanpa menunggu timeout
      try {
        // Log command execution
        logger.info(`Direct executing command ${interaction.commandName} without waiting for timeout`);
        
        // Langsung eksekusi command tanpa sistem timeout atau Promise.race
        const result = await executeFunction(interaction, client);
        
        // Log successful execution
        logger.info(`Successfully completed command ${interaction.commandName}`);
        
        return result;
      } catch (commandError) {
        // Jika ada error saat eksekusi command, log dan lanjutkan
        logger.error(`Error during direct command execution ${interaction.commandName}: ${commandError.message}`);
        
        // Kirim pesan error ke user jika belum reply
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({
            content: `❌ Terjadi kesalahan saat menjalankan perintah: ${commandError.message}`
          }).catch(e => {
            logger.error(`Failed to send command error: ${e.message}`);
          });
        }
        
        throw commandError; // Re-throw error untuk ditangani oleh catch block di luar
      }
      
      // Hapus semua timeout jika command selesai dengan normal
      clearTimeout(warningTimeoutId);
      clearTimeout(timeoutId);
    } catch (error) {
      // Clear timeout on error
      clearTimeout(warningTimeoutId);
      clearTimeout(timeoutId);
      
      logger.error(`Error executing command ${interaction.commandName}: ${error.message}`);
      logger.error(error.stack);
      
      try {
        // Customize error message based on different error types with more detail
        let errorMessage = '⚠️ Mohon maaf, terjadi gangguan sistem. Silakan coba beberapa saat lagi.';
        
        if (commandTimedOut || error.message.includes('timed out')) {
          errorMessage = '⏱️ Perintah membutuhkan waktu terlalu lama. Mohon coba lagi nanti, sistem sedang sibuk.';
        } else if (error.message.includes('permission') || error.message.includes('Privilege')) {
          errorMessage = '🔒 Bot tidak memiliki izin yang cukup untuk menjalankan perintah ini. Silakan hubungi admin server.';
        } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('ECONNRESET')) {
          errorMessage = '🌐 Terjadi gangguan koneksi jaringan. Silakan coba lagi dalam beberapa saat.';
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = '⏳ Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa menit sebelum mencoba lagi.';
        } else if (error.message.includes('Already acknowledged') || error.message.includes('Unknown interaction')) {
          // Masalah dengan interaksi Discord - tidak perlu memberi tahu user
          logger.warn(`Interaction issue for ${interaction.commandName}: ${error.message}`);
          return; // Tidak perlu mengirim pesan error ke user
        } else if (error.message.includes('InteractionAlreadyReplied')) {
          // Masalah dengan interaksi yang sudah dibalas
          logger.warn(`Interaction already replied for ${interaction.commandName}: ${error.message}`);
          return; // Tidak perlu mengirim pesan error ke user
        }
        
        // Send error response to user
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage }).catch(e => {
            logger.error(`Failed to edit reply with error message: ${e.message}`);
          });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMessage, ephemeral: true }).catch(e => {
            logger.error(`Failed to reply with error message: ${e.message}`);
          });
        } else {
          await interaction.followUp({ content: errorMessage, ephemeral: true }).catch(e => {
            logger.error(`Failed to follow up with error message: ${e.message}`);
          });
        }
      } catch (e) {
        logger.error(`Failed to send error response: ${e.message}`);
      }
    }
  };
}

module.exports = {
  wrapCommandExecute
};
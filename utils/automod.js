/**
 * Auto Moderation System
 * 
 * Sistem otomatis untuk memoderasi pesan di server Discord.
 * Termasuk fitur filter kata-kata terlarang, anti-spam, anti-invite, dll.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { logger } = require('./logger');
const config = require('../config');

// Cache untuk menyimpan pesan terakhir dari user untuk mencegah spam
const messageCache = new Map();

// Timer untuk membersihkan cache setiap interval waktu
setInterval(() => {
  const now = Date.now();
  messageCache.forEach((data, userId) => {
    // Hapus pesan yang lebih dari 5 detik
    if (now - data.lastMessageTime > 5000) {
      messageCache.delete(userId);
    }
  });
}, 5000);

/**
 * Filter pesan yang mengandung kata-kata terlarang
 * @param {string} content - Konten pesan
 * @returns {boolean} True jika pesan mengandung kata-kata terlarang
 */
function hasForbiddenWords(content) {
  if (!content) return false;
  const lowercaseContent = content.toLowerCase();
  
  // Daftar kata-kata terlarang
  const forbiddenWords = config.automod?.forbiddenWords || [
    'anjing', 'kontol', 'memek', 'ngentot', 'tolol', 'bangsat', 'babi',
    'goblok', 'idiot', 'jancok', 'cok', 'asu', 'bego'
  ];
  
  return forbiddenWords.some(word => lowercaseContent.includes(word));
}

/**
 * Filter pesan yang mengandung invite Discord
 * @param {string} content - Konten pesan
 * @returns {boolean} True jika pesan mengandung invite Discord
 */
function hasDiscordInvite(content) {
  if (!content) return false;
  
  // Regex untuk mendeteksi link invite Discord
  const inviteRegex = /(discord\.(gg|io|me|li)|discord(app)?\.com\/invite)\/[a-zA-Z0-9-]{2,}/i;
  
  // Jika mengandung link invite dan bukan dari whitelist
  if (inviteRegex.test(content)) {
    // Cek apakah ini link yang diperbolehkan (whitelist)
    const whitelistedInvites = config.automod?.whitelistedInvites || [
      'discord.gg/bM8jpT5e7Z' // Link server sendiri
    ];
    
    return !whitelistedInvites.some(invite => content.includes(invite));
  }
  
  return false;
}

/**
 * Filter pesan yang mengandung URL mencurigakan
 * @param {string} content - Konten pesan
 * @returns {boolean} True jika pesan mengandung URL mencurigakan
 */
function hasSuspiciousUrl(content) {
  if (!content) return false;
  
  // Regex untuk mendeteksi URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex);
  
  if (!urls) return false;
  
  // Daftar domain yang mencurigakan/berbahaya
  const suspiciousDomains = config.automod?.suspiciousDomains || [
    'bit.ly', 'goo.gl', 'tinyurl.com', 'ow.ly', 'is.gd',
    'adf.ly', 'bitly.com', 'j.mp', 'shorturl.at', 't.co',
    'discoordapp.com', 'dlscord.com', 'discorde.com', 'discod.ru', 'dicsord-nitro.click',
    'discord-airdrop.com', 'discordgift.ru', 'dlscordapp.com', 'dscordapp.com'
  ];
  
  return urls.some(url => {
    try {
      const domain = new URL(url).hostname;
      return suspiciousDomains.some(suspiciousDomain => domain.includes(suspiciousDomain));
    } catch (error) {
      return false;
    }
  });
}

/**
 * Memeriksa apakah pesan adalah spam
 * @param {string} userId - ID dari user yang mengirim pesan
 * @param {string} channelId - ID dari channel tempat pesan dikirim
 * @param {string} content - Konten pesan
 * @returns {boolean} True jika pesan terdeteksi sebagai spam
 */
function isSpam(userId, channelId, content) {
  const now = Date.now();
  
  // Dapatkan data user dari cache atau buat baru jika belum ada
  if (!messageCache.has(userId)) {
    messageCache.set(userId, {
      messages: [],
      lastMessageTime: now
    });
    return false;
  }
  
  const userData = messageCache.get(userId);
  
  // Update waktu pesan terakhir
  userData.lastMessageTime = now;
  
  // Tambahkan pesan baru ke cache
  userData.messages.push({
    content,
    channelId,
    timestamp: now
  });
  
  // Jika kurang dari 5 pesan dalam 5 detik, bukan spam
  if (userData.messages.length < 5) {
    return false;
  }
  
  // Filter pesan yang dikirim dalam 5 detik terakhir
  const recentMessages = userData.messages.filter(msg => now - msg.timestamp < 5000);
  userData.messages = recentMessages;
  
  // Jika ada 5 atau lebih pesan dalam 5 detik, anggap spam
  if (recentMessages.length >= 5) {
    return true;
  }
  
  // Jika mengirim pesan yang sama lebih dari 3 kali dalam 5 detik, anggap spam
  const uniqueMessages = new Set(recentMessages.map(msg => msg.content));
  if (recentMessages.length >= 3 && uniqueMessages.size === 1) {
    return true;
  }
  
  // Jika mengirim pesan ke channel yang sama lebih dari 4 kali dalam 5 detik, anggap spam
  const channelCounts = {};
  recentMessages.forEach(msg => {
    channelCounts[msg.channelId] = (channelCounts[msg.channelId] || 0) + 1;
  });
  
  return Object.values(channelCounts).some(count => count >= 4);
}

/**
 * Memeriksa dan memoderasi pesan
 * @param {Message} message - Objek pesan Discord
 * @returns {Object} Hasil dari pemeriksaan
 */
function moderateMessage(message) {
  // Jika pesan dari bot atau sistem, skip
  if (message.author.bot || message.system) {
    return { passed: true };
  }
  
  // Jika user adalah admin/mod, skip
  if (message.member && (
      message.member.permissions.has('ADMINISTRATOR') ||
      message.member.permissions.has('MODERATE_MEMBERS')
  )) {
    return { passed: true };
  }
  
  const content = message.content;
  
  // Cek kata-kata terlarang
  if (hasForbiddenWords(content)) {
    return {
      passed: false,
      reason: 'forbidden_words',
      description: 'Pesan mengandung kata-kata terlarang'
    };
  }
  
  // Cek invite Discord
  if (hasDiscordInvite(content)) {
    return {
      passed: false,
      reason: 'discord_invite',
      description: 'Pesan mengandung link invite Discord yang tidak diperbolehkan'
    };
  }
  
  // Cek URL mencurigakan
  if (hasSuspiciousUrl(content)) {
    return {
      passed: false,
      reason: 'suspicious_url',
      description: 'Pesan mengandung URL yang mencurigakan'
    };
  }
  
  // Cek spam
  if (isSpam(message.author.id, message.channel.id, content)) {
    return {
      passed: false,
      reason: 'spam',
      description: 'User terdeteksi melakukan spam'
    };
  }
  
  return { passed: true };
}

/**
 * Menangani pesan yang melanggar aturan
 * @param {Message} message - Objek pesan Discord
 * @param {Object} moderationResult - Hasil dari moderasi
 * @param {Client} client - Client Discord bot
 */
async function handleViolation(message, moderationResult, client) {
  try {
    // Hapus pesan
    await message.delete().catch(err => {
      logger.error(`Tidak dapat menghapus pesan: ${err.message}`);
    });
    
    // Kirim pesan peringatan ke user
    try {
      let warningMessage = '';
      
      switch (moderationResult.reason) {
        case 'forbidden_words':
          warningMessage = '⚠️ Pesan Anda dihapus karena mengandung kata-kata terlarang. Mohon untuk menjaga kata-kata Anda.';
          break;
        case 'discord_invite':
          warningMessage = '⚠️ Pesan Anda dihapus karena mengandung link invite Discord. Pengiklanan server lain tidak diperbolehkan.';
          break;
        case 'suspicious_url':
          warningMessage = '⚠️ Pesan Anda dihapus karena mengandung URL yang mencurigakan. Mohon untuk berhati-hati dengan link yang Anda bagikan.';
          break;
        case 'spam':
          warningMessage = '⚠️ Pesan Anda dihapus karena terdeteksi sebagai spam. Mohon untuk tidak mengirim pesan secara berulang dalam waktu singkat.';
          break;
        default:
          warningMessage = '⚠️ Pesan Anda dihapus karena melanggar aturan server.';
      }
      
      // Kirim pesan ke user sebagai DM
      await message.author.send(warningMessage).catch(() => {
        // Jika tidak bisa DM, kirim di channel sebagai ephemeral
        message.channel.send({
          content: `${message.author}, ${warningMessage}`,
          flags: ['EPHEMERAL']
        }).catch(err => {
          logger.error(`Tidak dapat mengirim pesan peringatan: ${err.message}`);
        });
      });
    } catch (dmError) {
      logger.error(`Tidak dapat mengirim DM: ${dmError.message}`);
    }
    
    // Log ke channel log jika ada
    if (config.channels && config.channels.modLog) {
      const modLogChannel = client.channels.cache.get(config.channels.modLog);
      
      if (modLogChannel) {
        modLogChannel.send({
          content: `🔨 **Automod:** Pesan dari ${message.author.tag} (${message.author.id}) dihapus.\n**Alasan:** ${moderationResult.description}\n**Channel:** <#${message.channel.id}>\n**Konten:** \`\`\`${message.content.substring(0, 1500)}\`\`\``
        }).catch(err => {
          logger.error(`Tidak dapat mengirim log: ${err.message}`);
        });
      }
    }
    
    // Catat pelanggaran untuk sistem warning/punishment
    // TODO: Implementasi sistem peringatan dan punishment otomatis
    
  } catch (error) {
    logger.error(`Error in handleViolation: ${error.message}`);
  }
}

/**
 * Process a message and apply moderation if needed
 * @param {Message} message - Message object
 * @param {Client} client - Discord client
 */
async function processMessage(message, client) {
  // Skip jika automod tidak diaktifkan
  if (!config.automod?.enabled) {
    return;
  }
  
  // Channel whitelist (channel yang tidak dimoderasi)
  const whitelistedChannels = config.automod?.whitelistedChannels || [];
  if (whitelistedChannels.includes(message.channel.id)) {
    return;
  }
  
  // Moderasi pesan
  const moderationResult = moderateMessage(message);
  
  // Jika tidak lolos moderasi
  if (!moderationResult.passed) {
    await handleViolation(message, moderationResult, client);
  }
}

module.exports = {
  processMessage,
  moderateMessage,
  hasForbiddenWords,
  hasDiscordInvite,
  hasSuspiciousUrl,
  isSpam
};
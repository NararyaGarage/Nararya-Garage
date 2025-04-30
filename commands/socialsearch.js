/**
 * Social Media Search Command
 * 
 * Command untuk mencari akun pengguna di berbagai platform sosial media.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('socialsearch')
    .setDescription('Mencari akun pengguna di berbagai platform sosial media')
    .addStringOption(option => 
      option.setName('username')
        .setDescription('Username yang ingin dicari')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('platform')
        .setDescription('Platform sosial media (opsional)')
        .setRequired(false)
        .addChoices(
          { name: 'Semua Platform', value: 'all' },
          { name: 'Instagram', value: 'instagram' },
          { name: 'Twitter/X', value: 'twitter' },
          { name: 'TikTok', value: 'tiktok' },
          { name: 'Showroom', value: 'showroom' },
          { name: 'YouTube', value: 'youtube' },
          { name: 'Facebook', value: 'facebook' },
          { name: 'Reddit', value: 'reddit' },
          { name: 'GitHub', value: 'github' },
          { name: 'LinkedIn', value: 'linkedin' },
          { name: 'Threads', value: 'threads' }
        )),
  
  async execute(interaction) {
    try {
      // Defer reply untuk mencegah timeout
      await interaction.deferReply();
      
      // Ambil parameter pencarian
      const username = interaction.options.getString('username');
      const platform = interaction.options.getString('platform') || 'all';
      
      if (!username || username.trim() === '') {
        return await interaction.editReply({ 
          content: 'Mohon masukkan username yang ingin dicari.',
          ephemeral: true
        });
      }
      
      // Handle username dengan karakter khusus
      const sanitizedUsername = username.replace(/[^a-zA-Z0-9_.-]/g, '');
      
      if (sanitizedUsername !== username) {
        await interaction.editReply({ 
          content: `Perhatian: Username telah dibersihkan dari karakter khusus: "${sanitizedUsername}"`,
          ephemeral: true
        });
      }
      
      // Cari profil pengguna di berbagai platform
      const socialProfiles = await searchSocialProfiles(sanitizedUsername, platform);
      
      if (!socialProfiles || Object.keys(socialProfiles).length === 0) {
        return await interaction.editReply({ 
          content: `Tidak ditemukan profil pengguna "${username}" di platform yang dipilih.`,
          ephemeral: true
        });
      }
      
      // Buat embed untuk menampilkan hasil pencarian
      const embed = createSocialSearchEmbed(username, sanitizedUsername, socialProfiles);
      
      // Buat tombol untuk hasil pencarian
      const buttons = createSocialButtons(username, sanitizedUsername, socialProfiles);
      
      // Kirim respons dengan embed dan tombol
      await interaction.editReply({ 
        embeds: [embed],
        components: buttons.length > 0 ? [buttons] : [] 
      });
      
      logger.info(`User ${interaction.user.tag} searched for social media profiles with username: ${username}`);
    } catch (error) {
      logger.error(`Error executing socialsearch command: ${error.message}`);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat mencari profil sosial media. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat mencari profil sosial media. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      }
    }
  }
};

/**
 * Mencari profil sosial media berdasarkan username
 * @param {string} username - Username yang dicari
 * @param {string} platform - Platform yang ingin dicari ('all' untuk semua)
 * @returns {Object} - Hasil pencarian di berbagai platform
 */
async function searchSocialProfiles(username, platform) {
  const results = {};
  
  // Daftar platform yang akan diperiksa
  const platforms = platform === 'all' ? 
    ['instagram', 'twitter', 'tiktok', 'youtube', 'github', 'threads', 'facebook', 'reddit', 'linkedin', 'showroom'] : 
    [platform];
  
  // Daftar Promise untuk menjalankan pencarian secara paralel
  const searchPromises = [];
  
  for (const p of platforms) {
    // Tambahkan promise untuk setiap platform
    searchPromises.push(
      checkPlatformProfile(p, username)
        .then(exists => {
          if (exists) {
            results[p] = exists;
          }
        })
        .catch(err => {
          logger.error(`Error checking ${p} profile: ${err.message}`);
        })
    );
  }
  
  // Jalankan semua pencarian secara paralel
  await Promise.all(searchPromises);
  
  return results;
}

/**
 * Memeriksa keberadaan profil pengguna di platform tertentu
 * @param {string} platform - Platform yang diperiksa
 * @param {string} username - Username yang dicari
 * @returns {string|boolean} - URL profil jika ditemukan, false jika tidak
 */
async function checkPlatformProfile(platform, username) {
  try {
    let url = '';
    
    // Menyesuaikan URL berdasarkan platform
    switch (platform) {
      case 'instagram':
        url = `https://www.instagram.com/${username}/`;
        break;
      case 'twitter':
        url = `https://twitter.com/${username}`;
        break;
      case 'threads':
        url = `https://www.threads.net/@${username}`;
        break;
      case 'tiktok':
        url = `https://www.tiktok.com/@${username}`;
        break;
      case 'youtube':
        url = `https://www.youtube.com/@${username}`;
        break;
      case 'github':
        url = `https://github.com/${username}`;
        break;
      case 'reddit':
        url = `https://www.reddit.com/user/${username}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/in/${username}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/${username}`;
        break;
      case 'showroom':
        url = `https://www.showroom-live.com/${username}`;
        break;
      default:
        return false;
    }
    
    // Membuat HEAD request untuk memeriksa ketersediaan halaman
    const response = await axios.head(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      validateStatus: status => status < 500 // Accept all responses except server errors
    });
    
    // Jika response 200 OK atau 300-range redirect, profil kemungkinan ada
    if (response.status >= 200 && response.status < 400) {
      return url;
    }
    
    // LinkedIn dan beberapa platform lain mungkin mengembalikan status 999 untuk bot
    if (platform === 'linkedin' && response.status === 999) {
      return url;
    }
    
    // Facebook memerlukan login, jadi kita hanya bisa memberikan link yang mungkin
    if (platform === 'facebook') {
      return url;
    }
    
    return false;
  } catch (error) {
    // Head request gagal, coba dengan GET untuk beberapa platform yang mungkin memblokir HEAD
    if (['instagram', 'twitter', 'facebook', 'tiktok'].includes(platform)) {
      return getPlatformUrl(platform, username);
    }
    
    logger.error(`Error checking ${platform} profile: ${error.message}`);
    return false;
  }
}

/**
 * Mendapatkan URL platform untuk username
 * @param {string} platform - Platform sosial media
 * @param {string} username - Username yang dicari
 * @returns {string} - URL profil
 */
function getPlatformUrl(platform, username) {
  switch (platform) {
    case 'instagram':
      return `https://www.instagram.com/${username}/`;
    case 'twitter':
      return `https://twitter.com/${username}`;
    case 'threads':
      return `https://www.threads.net/@${username}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${username}`;
    case 'youtube':
      return `https://www.youtube.com/@${username}`;
    case 'github':
      return `https://github.com/${username}`;
    case 'reddit':
      return `https://www.reddit.com/user/${username}`;
    case 'linkedin':
      return `https://www.linkedin.com/in/${username}`;
    case 'facebook':
      return `https://www.facebook.com/${username}`;
    case 'showroom':
      return `https://www.showroom-live.com/${username}`;
    default:
      return '';
  }
}

/**
 * Buat embed untuk menampilkan hasil pencarian sosial media
 * @param {string} originalUsername - Username asli dari pengguna
 * @param {string} cleanUsername - Username yang sudah dibersihkan
 * @param {Object} profiles - Hasil pencarian profil
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createSocialSearchEmbed(originalUsername, cleanUsername, profiles) {
  const platformEmojis = {
    'instagram': '📸',
    'twitter': '🐦',
    'threads': '🧵',
    'tiktok': '🎵',
    'youtube': '📺',
    'github': '💻',
    'reddit': '🔴',
    'linkedin': '💼',
    'facebook': '👤',
    'showroom': '🎭'
  };
  
  const platformNames = {
    'instagram': 'Instagram',
    'twitter': 'Twitter/X',
    'threads': 'Threads',
    'tiktok': 'TikTok',
    'youtube': 'YouTube',
    'github': 'GitHub',
    'reddit': 'Reddit',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook',
    'showroom': 'Showroom'
  };
  
  const embed = new EmbedBuilder()
    .setColor('#1DA1F2')
    .setTitle(`🔍 Pencarian Sosial Media: ${originalUsername}`)
    .setDescription(`Berikut adalah hasil pencarian untuk username "${originalUsername}"${originalUsername !== cleanUsername ? ` (dibersihkan menjadi "${cleanUsername}")` : ''}`);
  
  const platformCount = Object.keys(profiles).length;
  
  embed.addFields({
    name: `Hasil Pencarian (${platformCount} platform)`,
    value: platformCount > 0 ? 'Profil ditemukan di platform berikut:' : 'Tidak ditemukan profil di platform yang dicari.',
    inline: false
  });
  
  // Tambahkan hasil untuk setiap platform
  for (const [platform, url] of Object.entries(profiles)) {
    const emoji = platformEmojis[platform] || '🔗';
    const platformName = platformNames[platform] || platform;
    
    embed.addFields({
      name: `${emoji} ${platformName}`,
      value: `[${originalUsername}](${url})`,
      inline: true
    });
  }
  
  // Tambahkan catatan tentang pencarian
  if (platformCount > 0) {
    embed.setFooter({ 
      text: 'Catatan: Link tidak menjamin profil benar-benar dimiliki oleh orang yang Anda cari • ' + new Date().toLocaleString('id-ID'),
    });
  } else {
    embed.setFooter({ 
      text: 'Tidak ditemukan profil di platform yang dicari • ' + new Date().toLocaleString('id-ID'),
    });
  }
  
  embed.setTimestamp();
  
  return embed;
}

/**
 * Membuat tombol untuk link profil sosial media
 * @param {string} originalUsername - Username asli dari pengguna
 * @param {string} cleanUsername - Username yang sudah dibersihkan
 * @param {Object} profiles - Hasil pencarian profil
 * @returns {ActionRowBuilder} - Action row dengan tombol
 */
function createSocialButtons(originalUsername, cleanUsername, profiles) {
  const row = new ActionRowBuilder();
  
  // Daftarkan platform berdasarkan popularitas
  const platformPriority = [
    'instagram', 'twitter', 'tiktok', 'youtube', 'facebook', 
    'threads', 'linkedin', 'github', 'reddit', 'showroom'
  ];
  
  // Label untuk tombol
  const platformLabels = {
    'instagram': 'Instagram',
    'twitter': 'Twitter/X',
    'threads': 'Threads',
    'tiktok': 'TikTok',
    'youtube': 'YouTube',
    'github': 'GitHub',
    'reddit': 'Reddit',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook',
    'showroom': 'Showroom'
  };
  
  // Emoji untuk tombol
  const platformEmojis = {
    'instagram': '📸',
    'twitter': '🐦',
    'threads': '🧵',
    'tiktok': '🎵',
    'youtube': '📺',
    'github': '💻',
    'reddit': '🔴',
    'linkedin': '💼',
    'facebook': '👤',
    'showroom': '🎭'
  };
  
  // Urutkan platform berdasarkan prioritas
  const sortedPlatforms = Object.keys(profiles).sort((a, b) => {
    const indexA = platformPriority.indexOf(a);
    const indexB = platformPriority.indexOf(b);
    return indexA - indexB;
  });
  
  // Batasi maksimal 5 tombol
  const maxButtons = Math.min(5, sortedPlatforms.length);
  
  for (let i = 0; i < maxButtons; i++) {
    const platform = sortedPlatforms[i];
    const url = profiles[platform];
    const label = platformLabels[platform] || platform;
    const emoji = platformEmojis[platform];
    
    const button = new ButtonBuilder()
      .setLabel(label)
      .setStyle(ButtonStyle.Link)
      .setURL(url);
      
    if (emoji) {
      button.setEmoji(emoji);
    }
    
    row.addComponents(button);
  }
  
  return row;
}
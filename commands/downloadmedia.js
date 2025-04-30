/**
 * Download Media Command
 * 
 * Command untuk mengunduh media (foto/video) dari berbagai platform.
 * Mendukung Instagram, TikTok, Twitter, dan YouTube.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('../../utils/logger');

// Direktori untuk menyimpan media yang diunduh
const downloadsDir = path.join(__dirname, '..', '..', 'data', 'downloads');

// Pastikan direktori ada
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('downloadmedia')
    .setDescription('Download media dari berbagai platform')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('URL media yang akan diunduh')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('kualitas')
        .setDescription('Kualitas unduhan')
        .setRequired(false)
        .addChoices(
          { name: 'HD', value: 'hd' },
          { name: 'SD', value: 'sd' }
        )),
        
  async execute(interaction) {
    try {
      const url = interaction.options.getString('url');
      const quality = interaction.options.getString('kualitas') || 'hd';
      
      // Defer reply karena proses bisa memakan waktu
      await interaction.deferReply();
      
      // Identifikasi platform berdasarkan URL
      const platform = identifyPlatform(url);
      
      if (!platform) {
        return interaction.editReply('URL tidak valid atau platform tidak didukung. Platform yang didukung: Instagram, TikTok, Twitter, dan YouTube.');
      }
      
      // Proses download berdasarkan platform
      let mediaInfo;
      
      switch (platform) {
        case 'instagram':
          mediaInfo = await downloadInstagram(url, quality);
          break;
        case 'tiktok':
          mediaInfo = await downloadTikTok(url, quality);
          break;
        case 'twitter':
          mediaInfo = await downloadTwitter(url, quality);
          break;
        case 'youtube':
          mediaInfo = await downloadYouTube(url, quality);
          break;
      }
      
      if (!mediaInfo || mediaInfo.error) {
        return interaction.editReply(`Gagal mengunduh media: ${mediaInfo?.error || 'Terjadi kesalahan'}`);
      }
      
      // Persiapkan embed untuk respons
      const embed = new EmbedBuilder()
        .setTitle(`📥 Download Media ${platform.charAt(0).toUpperCase() + platform.slice(1)}`)
        .setDescription(`Unduhan berhasil! Media sudah diunduh dalam kualitas ${quality.toUpperCase()}.`)
        .setColor(getPlatformColor(platform))
        .addFields(
          { name: 'Jenis Media', value: mediaInfo.type, inline: true },
          { name: 'Ukuran File', value: mediaInfo.fileSize, inline: true },
          { name: 'Durasi', value: mediaInfo.duration || 'N/A', inline: true }
        )
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      if (mediaInfo.thumbnail) {
        embed.setImage(mediaInfo.thumbnail);
      }
      
      // Jika file terlalu besar untuk Discord (> 8MB)
      if (mediaInfo.isLarge) {
        // Tombol untuk mendapatkan link alternatif
        const buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setURL(mediaInfo.directUrl || url)
              .setLabel('Download Link')
              .setStyle(ButtonStyle.Link)
          );
        
        return interaction.editReply({
          content: 'File terlalu besar untuk dikirim langsung. Gunakan link berikut untuk mengunduh:',
          embeds: [embed],
          components: [buttons]
        });
      }
      
      // Kirim file dan embed
      return interaction.editReply({
        embeds: [embed],
        files: [{ attachment: mediaInfo.filePath, name: mediaInfo.fileName }]
      });
      
    } catch (error) {
      logger.error('Error in downloadmedia command:', error);
      
      if (interaction.deferred) {
        await interaction.editReply('Terjadi kesalahan saat mengunduh media. Silakan coba lagi nanti.');
      } else {
        await interaction.reply({
          content: 'Terjadi kesalahan saat mengunduh media. Silakan coba lagi nanti.',
          ephemeral: true
        });
      }
    }
  }
};

/**
 * Identifikasi platform berdasarkan URL
 * @param {string} url - URL media
 * @returns {string|null} Nama platform atau null jika tidak didukung
 */
function identifyPlatform(url) {
  if (!url) return null;
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) {
    return 'instagram';
  } else if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'twitter';
  } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }
  
  return null;
}

/**
 * Get platform color for embed
 * @param {string} platform - Platform name
 * @returns {string} Color hex code
 */
function getPlatformColor(platform) {
  switch (platform) {
    case 'instagram':
      return '#E1306C';
    case 'tiktok':
      return '#000000';
    case 'twitter':
      return '#1DA1F2';
    case 'youtube':
      return '#FF0000';
    default:
      return '#7289DA';
  }
}

/**
 * Dapatkan ukuran file yang readable
 * @param {number} bytes - Ukuran dalam bytes
 * @returns {string} Ukuran dalam format yang readable
 */
function getReadableFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
}

/**
 * Download media dari Instagram
 * @param {string} url - URL Instagram
 * @param {string} quality - Kualitas (hd/sd)
 * @returns {Object} Informasi media
 */
async function downloadInstagram(url, quality) {
  try {
    // Nama file untuk menyimpan media
    const timestamp = Date.now();
    const fileName = `instagram_${timestamp}.mp4`;
    const filePath = path.join(downloadsDir, fileName);
    
    // Gunakan web scraping untuk mendapatkan URL media langsung
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import extract_instagram_media_url; print(extract_instagram_media_url('${url}', '${quality}'))"`;
    
    try {
      const directUrl = execSync(command, { encoding: 'utf8' }).trim();
      
      if (!directUrl || directUrl.includes('Error:')) {
        return { error: directUrl.replace('Error:', '') || 'Gagal mendapatkan URL media' };
      }
      
      // Download file
      const response = await axios({
        method: 'GET',
        url: directUrl,
        responseType: 'stream'
      });
      
      // Simpan file
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          // Cek ukuran file
          const stats = fs.statSync(filePath);
          const isLarge = stats.size > 8 * 1024 * 1024; // > 8MB
          
          // Cek jenis file
          const isVideo = directUrl.includes('.mp4') || directUrl.includes('video');
          
          resolve({
            type: isVideo ? 'Video' : 'Gambar',
            filePath,
            fileName: isVideo ? fileName : `instagram_${timestamp}.jpg`,
            fileSize: getReadableFileSize(stats.size),
            isLarge,
            directUrl,
            duration: isVideo ? 'Deteksi otomatis' : 'N/A',
            thumbnail: directUrl.replace('.mp4', '.jpg')
          });
        });
        
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error('Error extracting Instagram media:', error);
      return { error: 'Gagal mengekstrak media dari Instagram' };
    }
  } catch (error) {
    logger.error('Error downloading Instagram media:', error);
    return { error: 'Gagal mengunduh media dari Instagram' };
  }
}

/**
 * Download media dari TikTok
 * @param {string} url - URL TikTok
 * @param {string} quality - Kualitas (hd/sd)
 * @returns {Object} Informasi media
 */
async function downloadTikTok(url, quality) {
  try {
    // Nama file untuk menyimpan media
    const timestamp = Date.now();
    const fileName = `tiktok_${timestamp}.mp4`;
    const filePath = path.join(downloadsDir, fileName);
    
    // Gunakan web scraping untuk mendapatkan URL media langsung
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import extract_tiktok_media_url; print(extract_tiktok_media_url('${url}', '${quality}'))"`;
    
    try {
      const directUrl = execSync(command, { encoding: 'utf8' }).trim();
      
      if (!directUrl || directUrl.includes('Error:')) {
        return { error: directUrl.replace('Error:', '') || 'Gagal mendapatkan URL media' };
      }
      
      // Download file
      const response = await axios({
        method: 'GET',
        url: directUrl,
        responseType: 'stream'
      });
      
      // Simpan file
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          // Cek ukuran file
          const stats = fs.statSync(filePath);
          const isLarge = stats.size > 8 * 1024 * 1024; // > 8MB
          
          resolve({
            type: 'Video',
            filePath,
            fileName,
            fileSize: getReadableFileSize(stats.size),
            isLarge,
            directUrl,
            duration: 'Deteksi otomatis',
            thumbnail: null
          });
        });
        
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error('Error extracting TikTok media:', error);
      return { error: 'Gagal mengekstrak media dari TikTok' };
    }
  } catch (error) {
    logger.error('Error downloading TikTok media:', error);
    return { error: 'Gagal mengunduh media dari TikTok' };
  }
}

/**
 * Download media dari Twitter
 * @param {string} url - URL Twitter
 * @param {string} quality - Kualitas (hd/sd)
 * @returns {Object} Informasi media
 */
async function downloadTwitter(url, quality) {
  try {
    // Nama file untuk menyimpan media
    const timestamp = Date.now();
    const fileName = `twitter_${timestamp}.mp4`;
    const filePath = path.join(downloadsDir, fileName);
    
    // Gunakan web scraping untuk mendapatkan URL media langsung
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import extract_twitter_media_url; print(extract_twitter_media_url('${url}', '${quality}'))"`;
    
    try {
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const [directUrl, mediaType] = result.split('|');
      
      if (!directUrl || directUrl.includes('Error:')) {
        return { error: directUrl.replace('Error:', '') || 'Gagal mendapatkan URL media' };
      }
      
      // Download file
      const response = await axios({
        method: 'GET',
        url: directUrl,
        responseType: 'stream'
      });
      
      // Sesuaikan ekstensi file berdasarkan jenis media
      const isImage = mediaType === 'image' || directUrl.includes('.jpg') || directUrl.includes('.png');
      const correctFileName = isImage ? `twitter_${timestamp}.jpg` : fileName;
      const correctFilePath = isImage ? path.join(downloadsDir, correctFileName) : filePath;
      
      // Simpan file
      const writer = fs.createWriteStream(correctFilePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          // Cek ukuran file
          const stats = fs.statSync(correctFilePath);
          const isLarge = stats.size > 8 * 1024 * 1024; // > 8MB
          
          resolve({
            type: isImage ? 'Gambar' : 'Video',
            filePath: correctFilePath,
            fileName: correctFileName,
            fileSize: getReadableFileSize(stats.size),
            isLarge,
            directUrl,
            duration: isImage ? 'N/A' : 'Deteksi otomatis',
            thumbnail: isImage ? directUrl : null
          });
        });
        
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error('Error extracting Twitter media:', error);
      return { error: 'Gagal mengekstrak media dari Twitter' };
    }
  } catch (error) {
    logger.error('Error downloading Twitter media:', error);
    return { error: 'Gagal mengunduh media dari Twitter' };
  }
}

/**
 * Download media dari YouTube
 * @param {string} url - URL YouTube
 * @param {string} quality - Kualitas (hd/sd)
 * @returns {Object} Informasi media
 */
async function downloadYouTube(url, quality) {
  try {
    // Nama file untuk menyimpan media
    const timestamp = Date.now();
    const fileName = `youtube_${timestamp}.mp4`;
    const filePath = path.join(downloadsDir, fileName);
    
    // Gunakan web scraping untuk mendapatkan URL media langsung
    // Atau gunakan youtube-dl jika tersedia di sistem
    
    const qualityParam = quality === 'hd' ? 'best' : 'medium';
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import extract_youtube_media_url; print(extract_youtube_media_url('${url}', '${qualityParam}'))"`;
    
    try {
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const [directUrl, thumbUrl, durationStr] = result.split('|');
      
      if (!directUrl || directUrl.includes('Error:')) {
        return { error: directUrl.replace('Error:', '') || 'Gagal mendapatkan URL media' };
      }
      
      // Untuk YouTube, jika file > 25MB, lebih baik berikan link saja karena proses download bisa sangat lama
      const isAudioOnly = directUrl.includes('audio only');
      const correctFileName = isAudioOnly ? `youtube_${timestamp}.mp3` : fileName;
      const correctFilePath = isAudioOnly ? path.join(downloadsDir, correctFileName) : filePath;
      
      // Untuk file yang sangat besar atau audio-only, berikan link langsung
      if (isAudioOnly || directUrl.includes('filesize~')) {
        return {
          type: isAudioOnly ? 'Audio' : 'Video',
          filePath: null,
          fileName: correctFileName,
          fileSize: 'Diatas 25MB',
          isLarge: true,
          directUrl: url, // Berikan URL asli untuk di-download oleh user
          duration: durationStr || 'Tidak diketahui',
          thumbnail: thumbUrl
        };
      }
      
      // Download file
      const response = await axios({
        method: 'GET',
        url: directUrl,
        responseType: 'stream'
      });
      
      // Simpan file
      const writer = fs.createWriteStream(correctFilePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          // Cek ukuran file
          const stats = fs.statSync(correctFilePath);
          const isLarge = stats.size > 8 * 1024 * 1024; // > 8MB
          
          resolve({
            type: isAudioOnly ? 'Audio' : 'Video',
            filePath: correctFilePath,
            fileName: correctFileName,
            fileSize: getReadableFileSize(stats.size),
            isLarge,
            directUrl,
            duration: durationStr || 'Deteksi otomatis',
            thumbnail: thumbUrl
          });
        });
        
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error('Error extracting YouTube media:', error);
      return { error: 'Gagal mengekstrak media dari YouTube' };
    }
  } catch (error) {
    logger.error('Error downloading YouTube media:', error);
    return { error: 'Gagal mengunduh media dari YouTube' };
  }
}
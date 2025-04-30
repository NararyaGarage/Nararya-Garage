/**
 * Download File Command
 * 
 * Command untuk mengunduh file dari berbagai platform seperti Mediafire, Google Drive, dll.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('../../utils/logger');

// Direktori untuk menyimpan file yang diunduh
const downloadsDir = path.join(__dirname, '..', '..', 'data', 'downloads');

// Pastikan direktori ada
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Ukuran maksimum file yang bisa dikirim ke Discord (8MB)
const MAX_DISCORD_FILE_SIZE = 8 * 1024 * 1024;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('downloadfile')
    .setDescription('Download file dari berbagai platform')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('URL file yang akan diunduh')
        .setRequired(true))
    .addBooleanOption(option =>
      option
        .setName('bypass')
        .setDescription('Bypass link shortener (jika URL merupakan link shortener)')
        .setRequired(false)),
        
  async execute(interaction) {
    try {
      const url = interaction.options.getString('url');
      const bypassShortener = interaction.options.getBoolean('bypass') || false;
      
      // Defer reply karena proses bisa memakan waktu
      await interaction.deferReply();
      
      // Identifikasi platform berdasarkan URL
      const platform = identifyPlatform(url);
      
      if (!platform) {
        return interaction.editReply('URL tidak valid atau platform tidak didukung. Platform yang didukung: Google Drive, Mediafire, MEGA, Dropbox, OneDrive, dan beberapa filehoster lainnya.');
      }
      
      // Jika URL adalah link shortener dan user meminta untuk bypass
      let finalUrl = url;
      if (bypassShortener && isShortLink(url)) {
        try {
          finalUrl = await bypassShortLink(url);
          if (!finalUrl || finalUrl === url) {
            return interaction.editReply('Gagal melakukan bypass link shortener. Coba gunakan link langsung.');
          }
        } catch (error) {
          logger.error('Error bypassing short link:', error);
          return interaction.editReply('Gagal melakukan bypass link shortener. Coba gunakan link langsung.');
        }
      }
      
      // Proses download berdasarkan platform
      let fileInfo;
      
      switch (platform) {
        case 'googledrive':
          fileInfo = await downloadGoogleDrive(finalUrl);
          break;
        case 'mediafire':
          fileInfo = await downloadMediafire(finalUrl);
          break;
        case 'mega':
          fileInfo = await downloadMega(finalUrl);
          break;
        case 'dropbox':
          fileInfo = await downloadDropbox(finalUrl);
          break;
        case 'onedrive':
          fileInfo = await downloadOneDrive(finalUrl);
          break;
        default:
          fileInfo = await downloadGeneric(finalUrl);
          break;
      }
      
      if (!fileInfo || fileInfo.error) {
        return interaction.editReply(`Gagal mengunduh file: ${fileInfo?.error || 'Terjadi kesalahan'}`);
      }
      
      // Persiapkan embed untuk respons
      const embed = new EmbedBuilder()
        .setTitle(`📥 Download File ${platform.charAt(0).toUpperCase() + platform.slice(1)}`)
        .setDescription(`Unduhan berhasil! File sudah diunduh.`)
        .setColor(getPlatformColor(platform))
        .addFields(
          { name: 'Nama File', value: fileInfo.fileName, inline: true },
          { name: 'Ukuran File', value: fileInfo.fileSize, inline: true },
          { name: 'Tipe File', value: fileInfo.fileType || 'Tidak diketahui', inline: true }
        )
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Jika file terlalu besar untuk Discord (> 8MB)
      if (fileInfo.isLarge) {
        // Tombol untuk mendapatkan link alternatif
        const buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setURL(fileInfo.directUrl || finalUrl)
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
        files: [{ attachment: fileInfo.filePath, name: fileInfo.fileName }]
      });
      
    } catch (error) {
      logger.error('Error in downloadfile command:', error);
      
      if (interaction.deferred) {
        await interaction.editReply('Terjadi kesalahan saat mengunduh file. Silakan coba lagi nanti.');
      } else {
        await interaction.reply({
          content: 'Terjadi kesalahan saat mengunduh file. Silakan coba lagi nanti.',
          ephemeral: true
        });
      }
    }
  }
};

/**
 * Identifikasi platform berdasarkan URL
 * @param {string} url - URL file
 * @returns {string} Nama platform
 */
function identifyPlatform(url) {
  if (!url) return null;
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('drive.google.com') || urlLower.includes('docs.google.com')) {
    return 'googledrive';
  } else if (urlLower.includes('mediafire.com')) {
    return 'mediafire';
  } else if (urlLower.includes('mega.nz') || urlLower.includes('mega.co.nz')) {
    return 'mega';
  } else if (urlLower.includes('dropbox.com')) {
    return 'dropbox';
  } else if (urlLower.includes('onedrive.live.com') || urlLower.includes('1drv.ms')) {
    return 'onedrive';
  } else if (urlLower.includes('zippyshare.com')) {
    return 'zippyshare';
  } else if (urlLower.includes('4shared.com')) {
    return '4shared';
  } else if (urlLower.includes('solidfiles.com')) {
    return 'solidfiles';
  } else if (urlLower.includes('racaty.net')) {
    return 'racaty';
  } else if (urlLower.includes('anonfiles.com')) {
    return 'anonfiles';
  } else if (urlLower.includes('bayfiles.com')) {
    return 'bayfiles';
  } else if (urlLower.includes('letsupload.io')) {
    return 'letsupload';
  } else if (
    urlLower.endsWith('.zip') || 
    urlLower.endsWith('.rar') || 
    urlLower.endsWith('.7z') || 
    urlLower.endsWith('.pdf') || 
    urlLower.endsWith('.doc') || 
    urlLower.endsWith('.docx') || 
    urlLower.endsWith('.xls') || 
    urlLower.endsWith('.xlsx') || 
    urlLower.endsWith('.txt')
  ) {
    return 'direct';
  }
  
  // Jika tidak ada platform yang cocok, gunakan metode generic
  return 'direct';
}

/**
 * Get platform color for embed
 * @param {string} platform - Platform name
 * @returns {string} Color hex code
 */
function getPlatformColor(platform) {
  switch (platform) {
    case 'googledrive':
      return '#4285F4';
    case 'mediafire':
      return '#0077FF';
    case 'mega':
      return '#D9272E';
    case 'dropbox':
      return '#0061FF';
    case 'onedrive':
      return '#0078D4';
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
 * Dapatkan tipe file dari nama file
 * @param {string} fileName - Nama file
 * @returns {string} Tipe file
 */
function getFileType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const fileTypes = {
    // Archive
    'zip': 'Archive (ZIP)',
    'rar': 'Archive (RAR)',
    '7z': 'Archive (7Z)',
    
    // Documents
    'pdf': 'Document (PDF)',
    'doc': 'Document (Word)',
    'docx': 'Document (Word)',
    'xls': 'Spreadsheet (Excel)',
    'xlsx': 'Spreadsheet (Excel)',
    'ppt': 'Presentation (PowerPoint)',
    'pptx': 'Presentation (PowerPoint)',
    'txt': 'Text Document',
    
    // Images
    'jpg': 'Image (JPEG)',
    'jpeg': 'Image (JPEG)',
    'png': 'Image (PNG)',
    'gif': 'Image (GIF)',
    'webp': 'Image (WebP)',
    'svg': 'Image (SVG)',
    
    // Audio
    'mp3': 'Audio (MP3)',
    'wav': 'Audio (WAV)',
    'flac': 'Audio (FLAC)',
    'ogg': 'Audio (OGG)',
    
    // Video
    'mp4': 'Video (MP4)',
    'avi': 'Video (AVI)',
    'mkv': 'Video (MKV)',
    'mov': 'Video (MOV)',
    'webm': 'Video (WebM)',
    
    // Code/Programming
    'js': 'JavaScript Code',
    'ts': 'TypeScript Code',
    'py': 'Python Code',
    'java': 'Java Code',
    'cpp': 'C++ Code',
    'c': 'C Code',
    'php': 'PHP Code',
    'html': 'HTML File',
    'css': 'CSS File',
    'json': 'JSON File',
    'xml': 'XML File'
  };
  
  return fileTypes[extension] || 'Unknown Type';
}

/**
 * Cek apakah URL adalah link shortener
 * @param {string} url - URL yang akan dicek
 * @returns {boolean} True jika URL adalah link shortener
 */
function isShortLink(url) {
  const shortLinkDomains = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'ow.ly', 'adf.ly',
    'ouo.io', 'ouo.press', 'cutt.ly', 'shorturl.at', 'ngl.link', 'j.mp',
    'rebrand.ly', 'buff.ly', 'snip.ly', 'ur1.ca', 'cli.gs', 'tiny.cc',
    'short.io', 'fur.ly', 'ht.ly', 'urls.im', 'n9.cl', 'bc.vc', 
    'receh.in', 'gitly.id', 'abrts.co', 'duit.cc', 'linktr.ee', 
    'linko.page', 'trib.al', 'linkpop.com', 'snipfeed.co'
  ];
  
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.replace('www.', '');
  
  return shortLinkDomains.some(domain => hostname === domain);
}

/**
 * Bypass link shortener
 * @param {string} url - URL link shortener
 * @returns {Promise<string>} URL asli setelah bypass
 */
async function bypassShortLink(url) {
  try {
    // Gunakan script Python untuk bypass link shortener
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import bypass_shortlink; print(bypass_shortlink('${url}'))"`;
    
    try {
      const result = execSync(command, { encoding: 'utf8' }).trim();
      
      if (result.includes('Error:')) {
        logger.error(`Error bypassing short link: ${result}`);
        return url;
      }
      
      return result;
    } catch (error) {
      logger.error('Error executing bypass script:', error);
      return url;
    }
  } catch (error) {
    logger.error('Error bypassing short link:', error);
    return url;
  }
}

/**
 * Download file dari Google Drive
 * @param {string} url - URL Google Drive
 * @returns {Promise<Object>} Informasi file
 */
async function downloadGoogleDrive(url) {
  try {
    // Extract file ID from Google Drive URL
    let fileId = null;
    
    if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1].split('/')[0];
    } else if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else {
      return { error: 'ID file Google Drive tidak valid' };
    }
    
    if (!fileId) {
      return { error: 'Tidak dapat mengekstrak ID file Google Drive' };
    }
    
    // Gunakan Link Direct Google Drive
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    // Get file info
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import get_gdrive_file_info; print(get_gdrive_file_info('${fileId}'))"`;
    
    try {
      const fileInfoJson = execSync(command, { encoding: 'utf8' }).trim();
      const fileInfo = JSON.parse(fileInfoJson);
      
      if (fileInfo.error) {
        logger.error(`Error getting Google Drive file info: ${fileInfo.error}`);
        return { error: fileInfo.error };
      }
      
      // Nama file dan ukuran
      const fileName = fileInfo.fileName;
      const fileSize = fileInfo.fileSize;
      const fileSizeBytes = fileInfo.fileSizeBytes;
      
      // Jika file terlalu besar untuk diunduh (> 100MB) atau memerlukan pengesahan
      if (fileSizeBytes > 100 * 1024 * 1024 || fileInfo.requiresAuth) {
        return {
          fileName,
          fileSize,
          fileType: getFileType(fileName),
          directUrl,
          isLarge: true,
          error: null
        };
      }
      
      // Simpan file
      const filePath = path.join(downloadsDir, fileName);
      
      // Download file dengan axios
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
          const isLarge = stats.size > MAX_DISCORD_FILE_SIZE;
          
          resolve({
            fileName,
            filePath,
            fileSize: getReadableFileSize(stats.size),
            fileType: getFileType(fileName),
            directUrl,
            isLarge,
            error: null
          });
        });
        
        writer.on('error', (err) => {
          reject({ error: `Gagal menyimpan file: ${err.message}` });
        });
      });
    } catch (error) {
      logger.error('Error executing gdrive info script:', error);
      return { error: 'Gagal mendapatkan informasi file Google Drive' };
    }
  } catch (error) {
    logger.error('Error downloading Google Drive file:', error);
    return { error: 'Gagal mengunduh file dari Google Drive' };
  }
}

/**
 * Download file dari Mediafire
 * @param {string} url - URL Mediafire
 * @returns {Promise<Object>} Informasi file
 */
async function downloadMediafire(url) {
  try {
    // Bersihkan URL Mediafire
    const cleanUrl = url.split('?')[0];
    
    // Gunakan script Python untuk mendapatkan link download langsung dari Mediafire
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import get_mediafire_direct_link; print(get_mediafire_direct_link('${cleanUrl}'))"`;
    
    try {
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const mediaInfo = JSON.parse(result);
      
      if (mediaInfo.error) {
        logger.error(`Error getting Mediafire direct link: ${mediaInfo.error}`);
        return { error: mediaInfo.error };
      }
      
      const fileName = mediaInfo.fileName;
      const directUrl = mediaInfo.directUrl;
      const fileSize = mediaInfo.fileSize;
      const fileSizeBytes = mediaInfo.fileSizeBytes;
      
      // Jika file terlalu besar untuk diunduh (> 100MB)
      if (fileSizeBytes > 100 * 1024 * 1024) {
        return {
          fileName,
          fileSize,
          fileType: getFileType(fileName),
          directUrl,
          isLarge: true,
          error: null
        };
      }
      
      // Simpan file
      const filePath = path.join(downloadsDir, fileName);
      
      // Download file dengan axios
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
          const isLarge = stats.size > MAX_DISCORD_FILE_SIZE;
          
          resolve({
            fileName,
            filePath,
            fileSize: getReadableFileSize(stats.size),
            fileType: getFileType(fileName),
            directUrl,
            isLarge,
            error: null
          });
        });
        
        writer.on('error', (err) => {
          reject({ error: `Gagal menyimpan file: ${err.message}` });
        });
      });
    } catch (error) {
      logger.error('Error executing mediafire script:', error);
      return { error: 'Gagal mendapatkan link download Mediafire' };
    }
  } catch (error) {
    logger.error('Error downloading Mediafire file:', error);
    return { error: 'Gagal mengunduh file dari Mediafire' };
  }
}

/**
 * Download file dari MEGA
 * @param {string} url - URL MEGA
 * @returns {Promise<Object>} Informasi file
 */
async function downloadMega(url) {
  // Untuk mengunduh dari MEGA, kita memberikan link langsung karena
  // memerlukan pustaka tambahan yang kompleks
  try {
    // Mendapatkan info file MEGA (nama dan ukuran)
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import get_mega_file_info; print(get_mega_file_info('${url}'))"`;
    
    try {
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const fileInfo = JSON.parse(result);
      
      if (fileInfo.error) {
        logger.error(`Error getting MEGA file info: ${fileInfo.error}`);
        return { error: fileInfo.error };
      }
      
      return {
        fileName: fileInfo.fileName || 'MEGA file',
        fileSize: fileInfo.fileSize || 'Unknown size',
        fileType: getFileType(fileInfo.fileName || ''),
        directUrl: url,
        isLarge: true,
        error: null
      };
    } catch (error) {
      logger.error('Error executing MEGA info script:', error);
      return { 
        fileName: 'MEGA file',
        fileSize: 'Unknown size',
        fileType: 'Unknown Type',
        directUrl: url,
        isLarge: true,
        error: null
      };
    }
  } catch (error) {
    logger.error('Error handling MEGA file:', error);
    return { error: 'Gagal mendapatkan informasi file MEGA' };
  }
}

/**
 * Download file dari Dropbox
 * @param {string} url - URL Dropbox
 * @returns {Promise<Object>} Informasi file
 */
async function downloadDropbox(url) {
  try {
    // Ubah URL agar bisa diunduh langsung
    let directUrl = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    
    // Jika URL sudah dalam bentuk share, tambahkan ?dl=1
    if (url.includes('dropbox.com/s/')) {
      directUrl = url.includes('?') ? 
        url.replace(/\?.*$/, '?dl=1') : 
        url + '?dl=1';
    }
    
    // Coba dapatkan info file dengan mengunjungi URL
    const response = await axios.head(directUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxRedirects: 5
    });
    
    // Mendapatkan nama file dari Content-Disposition jika ada
    let fileName = 'dropbox_file';
    if (response.headers['content-disposition']) {
      const match = response.headers['content-disposition'].match(/filename="(.+?)"/);
      if (match) {
        fileName = match[1];
      }
    } else {
      // Ekstrak nama file dari URL jika tidak ada Content-Disposition
      const urlParts = new URL(directUrl).pathname.split('/');
      fileName = urlParts[urlParts.length - 1];
    }
    
    // Mendapatkan ukuran file
    const fileSize = response.headers['content-length'] ? 
      getReadableFileSize(parseInt(response.headers['content-length'])) : 
      'Unknown size';
    
    const fileSizeBytes = response.headers['content-length'] ? 
      parseInt(response.headers['content-length']) : 
      0;
    
    // Jika file terlalu besar untuk diunduh (> 100MB)
    if (fileSizeBytes > 100 * 1024 * 1024) {
      return {
        fileName,
        fileSize,
        fileType: getFileType(fileName),
        directUrl,
        isLarge: true,
        error: null
      };
    }
    
    // Simpan file
    const filePath = path.join(downloadsDir, fileName);
    
    // Download file dengan axios
    const downloadResponse = await axios({
      method: 'GET',
      url: directUrl,
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    // Simpan file
    const writer = fs.createWriteStream(filePath);
    downloadResponse.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // Cek ukuran file
        const stats = fs.statSync(filePath);
        const isLarge = stats.size > MAX_DISCORD_FILE_SIZE;
        
        resolve({
          fileName,
          filePath,
          fileSize: getReadableFileSize(stats.size),
          fileType: getFileType(fileName),
          directUrl,
          isLarge,
          error: null
        });
      });
      
      writer.on('error', (err) => {
        reject({ error: `Gagal menyimpan file: ${err.message}` });
      });
    });
  } catch (error) {
    logger.error('Error downloading Dropbox file:', error);
    return { error: 'Gagal mengunduh file dari Dropbox' };
  }
}

/**
 * Download file dari OneDrive
 * @param {string} url - URL OneDrive
 * @returns {Promise<Object>} Informasi file
 */
async function downloadOneDrive(url) {
  try {
    // 1drv.ms adalah URL pendek dari OneDrive, kita perlu mengikuti redirect
    if (url.includes('1drv.ms')) {
      try {
        const response = await axios.head(url, { maxRedirects: 5 });
        url = response.request.res.responseUrl;
      } catch (error) {
        // Jika ada error, gunakan URL asli
        logger.warn('Error following OneDrive shortlink:', error);
      }
    }
    
    // Ubah URL agar bisa diunduh langsung
    let directUrl = url;
    
    // Jika URL berisi 'view.onedrive.com', ubah menjadi 'download'
    if (url.includes('view.onedrive.com')) {
      directUrl = url.replace('view.onedrive.com', 'download').replace('?', '');
    }
    // Jika URL berisi OneDrive personal
    else if (url.includes('onedrive.live.com/redir')) {
      directUrl = url.replace('redir', 'download').replace('?', '');
    }
    
    // Gunakan script Python untuk mendapatkan link download langsung jika lainnya gagal
    const command = `python -c "import sys; sys.path.append('.'); from utils.web_scraper import get_onedrive_direct_link; print(get_onedrive_direct_link('${url}'))"`;
    
    try {
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const fileInfo = JSON.parse(result);
      
      if (fileInfo.error) {
        logger.error(`Error getting OneDrive direct link: ${fileInfo.error}`);
      } else if (fileInfo.directUrl) {
        directUrl = fileInfo.directUrl;
      }
      
      // Mendapatkan nama file
      const fileName = fileInfo.fileName || 'onedrive_file';
      
      // Jika file terlalu besar atau tidak bisa diunduh langsung
      if (fileInfo.isLarge || fileInfo.error) {
        return {
          fileName,
          fileSize: fileInfo.fileSize || 'Unknown size',
          fileType: getFileType(fileName),
          directUrl: url, // Gunakan URL asli untuk membuka di browser
          isLarge: true,
          error: null
        };
      }
      
      // Simpan file
      const filePath = path.join(downloadsDir, fileName);
      
      // Download file dengan axios
      const downloadResponse = await axios({
        method: 'GET',
        url: directUrl,
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      // Simpan file
      const writer = fs.createWriteStream(filePath);
      downloadResponse.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          // Cek ukuran file
          const stats = fs.statSync(filePath);
          const isLarge = stats.size > MAX_DISCORD_FILE_SIZE;
          
          resolve({
            fileName,
            filePath,
            fileSize: getReadableFileSize(stats.size),
            fileType: getFileType(fileName),
            directUrl,
            isLarge,
            error: null
          });
        });
        
        writer.on('error', (err) => {
          reject({ error: `Gagal menyimpan file: ${err.message}` });
        });
      });
    } catch (error) {
      logger.error('Error executing OneDrive script:', error);
      // Fallback ke direct URL
      return {
        fileName: 'onedrive_file',
        fileSize: 'Unknown size',
        fileType: 'Unknown Type',
        directUrl: url,
        isLarge: true,
        error: null
      };
    }
  } catch (error) {
    logger.error('Error downloading OneDrive file:', error);
    return { error: 'Gagal mengunduh file dari OneDrive' };
  }
}

/**
 * Download file dari URL generic/direct
 * @param {string} url - URL file
 * @returns {Promise<Object>} Informasi file
 */
async function downloadGeneric(url) {
  try {
    // Coba dapatkan info file dengan mengunjungi URL
    const response = await axios.head(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxRedirects: 5
    }).catch(() => {
      // Jika HEAD tidak didukung, lanjutkan tanpa info header
      return { headers: {} };
    });
    
    // Mendapatkan nama file dari Content-Disposition jika ada
    let fileName = 'downloaded_file';
    if (response.headers['content-disposition']) {
      const match = response.headers['content-disposition'].match(/filename="(.+?)"|filename=(.+?)($|;)/);
      if (match) {
        fileName = match[1] || match[2];
      }
    } else {
      // Ekstrak nama file dari URL jika tidak ada Content-Disposition
      const urlParts = new URL(url).pathname.split('/');
      let urlFileName = urlParts[urlParts.length - 1];
      
      // Hapus parameter query jika ada
      urlFileName = urlFileName.split('?')[0];
      
      if (urlFileName && urlFileName !== '/' && urlFileName.length > 0) {
        fileName = urlFileName;
      }
      
      // Tambahkan ekstensi jika tidak ada
      if (!fileName.includes('.') && response.headers['content-type']) {
        const contentType = response.headers['content-type'];
        let extension = '';
        
        if (contentType.includes('application/pdf')) extension = '.pdf';
        else if (contentType.includes('application/zip')) extension = '.zip';
        else if (contentType.includes('application/x-rar')) extension = '.rar';
        else if (contentType.includes('text/plain')) extension = '.txt';
        else if (contentType.includes('image/jpeg')) extension = '.jpg';
        else if (contentType.includes('image/png')) extension = '.png';
        else if (contentType.includes('audio/mpeg')) extension = '.mp3';
        else if (contentType.includes('video/mp4')) extension = '.mp4';
        
        if (extension) fileName += extension;
      }
    }
    
    // Mendapatkan ukuran file
    const fileSize = response.headers['content-length'] ? 
      getReadableFileSize(parseInt(response.headers['content-length'])) : 
      'Unknown size';
    
    const fileSizeBytes = response.headers['content-length'] ? 
      parseInt(response.headers['content-length']) : 
      0;
    
    // Jika file terlalu besar untuk diunduh (> 100MB)
    if (fileSizeBytes > 100 * 1024 * 1024) {
      return {
        fileName,
        fileSize,
        fileType: getFileType(fileName),
        directUrl: url,
        isLarge: true,
        error: null
      };
    }
    
    // Simpan file
    const filePath = path.join(downloadsDir, fileName);
    
    // Download file dengan axios
    const downloadResponse = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    // Simpan file
    const writer = fs.createWriteStream(filePath);
    downloadResponse.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // Cek ukuran file
        const stats = fs.statSync(filePath);
        const isLarge = stats.size > MAX_DISCORD_FILE_SIZE;
        
        resolve({
          fileName,
          filePath,
          fileSize: getReadableFileSize(stats.size),
          fileType: getFileType(fileName),
          directUrl: url,
          isLarge,
          error: null
        });
      });
      
      writer.on('error', (err) => {
        reject({ error: `Gagal menyimpan file: ${err.message}` });
      });
    });
  } catch (error) {
    logger.error('Error downloading generic file:', error);
    return { error: 'Gagal mengunduh file. URL mungkin tidak valid atau server tidak merespons.' };
  }
}
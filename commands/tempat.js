/**
 * Tempat Command
 * 
 * Command untuk mencari informasi tentang restoran, tempat wisata, atau tempat lainnya
 * seperti di Google Maps. Menampilkan rating, alamat, dan informasi penting lainnya.
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
const cheerio = require('cheerio');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempat')
    .setDescription('Mencari informasi tentang restoran, tempat wisata, atau tempat lainnya')
    .addStringOption(option => 
      option.setName('nama')
        .setDescription('Nama tempat yang ingin dicari')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('lokasi')
        .setDescription('Lokasi/kota tempat berada (opsional)')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('jenis')
        .setDescription('Jenis tempat')
        .setRequired(false)
        .addChoices(
          { name: 'Restoran/Cafe', value: 'restaurant' },
          { name: 'Hotel', value: 'hotel' },
          { name: 'Tempat Wisata', value: 'tourist_attraction' },
          { name: 'Mall/Pusat Perbelanjaan', value: 'shopping_mall' },
          { name: 'Semua Jenis', value: 'all' }
        )),
  
  async execute(interaction) {
    try {
      // Defer reply untuk mencegah timeout
      await interaction.deferReply();
      
      // Dapatkan parameter pencarian
      const placeName = interaction.options.getString('nama');
      const location = interaction.options.getString('lokasi') || '';
      const placeType = interaction.options.getString('jenis') || 'all';
      
      if (!placeName || placeName.trim() === '') {
        return await interaction.editReply({
          content: 'Mohon masukkan nama tempat yang ingin dicari.',
          ephemeral: true
        });
      }
      
      // Membuat query pencarian
      let searchQuery = placeName;
      if (location) searchQuery += ' ' + location;
      
      // Tambahkan jenis tempat ke query jika bukan 'all'
      if (placeType !== 'all') {
        const typeMap = {
          'restaurant': 'restoran',
          'hotel': 'hotel',
          'tourist_attraction': 'tempat wisata',
          'shopping_mall': 'mall'
        };
        searchQuery += ' ' + (typeMap[placeType] || '');
      }
      
      // Cari tempat berdasarkan query
      const places = await searchPlaces(searchQuery);
      
      if (!places || places.length === 0) {
        return await interaction.editReply({
          content: `Tidak ditemukan tempat "${placeName}" di ${location || 'pencarian'}. Coba kata kunci lain.`,
          ephemeral: true
        });
      }
      
      // Ambil detail untuk tempat pertama
      const firstPlaceDetails = await getPlaceDetails(places[0].url);
      
      // Buat embed untuk menampilkan tempat
      const embed = createPlaceEmbed(places[0], firstPlaceDetails);
      
      // Buat tombol untuk membuka tempat di Google Maps dan alternatif tempat lainnya
      const buttons = createPlaceButtons(places);
      
      // Kirim respons dengan embed dan tombol
      await interaction.editReply({ 
        embeds: [embed],
        components: [buttons] 
      });
      
      logger.info(`User ${interaction.user.tag} searched for place: ${searchQuery}`);
    } catch (error) {
      logger.error(`Error executing tempat command: ${error.message}`);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat mencari tempat. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat mencari tempat. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      }
    }
  }
};

/**
 * Mencari tempat berdasarkan query
 * @param {string} query - Query pencarian
 * @returns {Array} - Array hasil pencarian tempat
 */
async function searchPlaces(query) {
  try {
    // Menggunakan Google search dengan kata kunci spesifik untuk mendapatkan hasil Google Maps
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    // Fetch data menggunakan axios dengan user agent untuk menghindari blocking
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to search places, status code: ${response.status}`);
    }
    
    // Parsing halaman HTML dengan cheerio
    const $ = cheerio.load(response.data);
    const places = [];
    
    // Mencari hasil Google Maps
    // Cari hasil yang memiliki informasi rating dan alamat
    $('div.rllt__details, div.dbg0pd').each((index, element) => {
      if (places.length < 5) { // Batasi hanya 5 tempat
        const titleElement = $(element).find('h3, div.dbg0pd > div').first();
        const title = titleElement.text().trim();
        
        // Cari link tempat
        let url = '';
        const parentElement = $(element).closest('a');
        if (parentElement.length) {
          url = 'https://www.google.com' + parentElement.attr('href');
        }
        
        // Cari rating
        let rating = '';
        const ratingElement = $(element).find('span.BTtC6e, span.r1zRRb');
        if (ratingElement.length) {
          rating = ratingElement.text().trim();
        }
        
        // Cari alamat
        let address = '';
        const addressElement = $(element).find('div.BNeawe.deIvCb.AP7Wnd');
        if (addressElement.length) {
          address = addressElement.text().trim();
        }
        
        // Cari kategori/jenis tempat
        let category = '';
        const categoryElement = $(element).find('div.BNeawe.tAd8D.AP7Wnd');
        if (categoryElement.length && !categoryElement.text().includes('·')) {
          category = categoryElement.text().trim();
        }
        
        // Cari thumbnail
        let thumbnail = '';
        const imageElement = $(element).closest('div.rllt__container, div.VkpGBb').find('img');
        if (imageElement.length) {
          thumbnail = imageElement.attr('src');
        }
        
        if (title && (rating || address)) {
          places.push({
            title,
            url,
            rating,
            address,
            category,
            thumbnail
          });
        }
      }
    });
    
    // Jika tidak ada hasil spesifik, coba ambil info dari Knowledge Panel
    if (places.length === 0) {
      const knowledgePanel = $('.kp-wholepage');
      if (knowledgePanel.length) {
        const title = knowledgePanel.find('h2').first().text().trim();
        const url = searchUrl;
        
        let rating = '';
        const ratingElement = knowledgePanel.find('div.bGfPX, div.KWrGgd');
        if (ratingElement.length) {
          rating = ratingElement.text().trim();
        }
        
        let address = '';
        knowledgePanel.find('div.wDYxhc').each((idx, el) => {
          const label = $(el).find('span.w8qArf').text().trim().toLowerCase();
          if (label.includes('alamat') || label.includes('address')) {
            address = $(el).find('span.LrzXr').text().trim();
          }
        });
        
        let category = '';
        const categoryElement = knowledgePanel.find('div.ft9Krc, div.t3HED');
        if (categoryElement.length) {
          category = categoryElement.text().trim();
        }
        
        let thumbnail = '';
        const imageElement = knowledgePanel.find('img.PZPZlf, img.Y17vN');
        if (imageElement.length) {
          thumbnail = imageElement.attr('src');
        }
        
        if (title) {
          places.push({
            title,
            url,
            rating,
            address,
            category,
            thumbnail
          });
        }
      }
    }
    
    return places;
  } catch (error) {
    logger.error(`Error searching places: ${error.message}`);
    return [];
  }
}

/**
 * Mendapatkan detail tempat dari URL
 * @param {string} url - URL tempat
 * @returns {Object} - Detail tempat
 */
async function getPlaceDetails(url) {
  try {
    // Jika tidak ada URL, kembalikan objek kosong
    if (!url) return {};
    
    // Fetch data menggunakan axios dengan user agent untuk menghindari blocking
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to get place details, status code: ${response.status}`);
    }
    
    // Parsing halaman HTML dengan cheerio
    const $ = cheerio.load(response.data);
    
    // Dapatkan URL Google Maps
    let mapsUrl = '';
    $('a').each((idx, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('maps.google.com') || href.includes('goo.gl/maps')) {
        mapsUrl = href;
        return false; // break loop
      }
    });
    
    // Dapatkan nomor telepon
    let phone = '';
    $('span').each((idx, el) => {
      const text = $(el).text();
      if (/^\+?[0-9()\s-]{8,}$/.test(text) || /^\(\d+\)\s*\d+[-\s]\d+$/.test(text)) {
        phone = text.trim();
        return false; // break loop
      }
    });
    
    // Dapatkan jam operasional
    let hours = [];
    let hoursSection = false;
    
    $('tr').each((idx, el) => {
      const text = $(el).text();
      if (text.includes('Jam operasional') || text.includes('Jam buka') || text.includes('Hours')) {
        hoursSection = true;
      } else if (hoursSection && (text.includes('Senin') || text.includes('Monday'))) {
        // Kita menemukan jam operasional, coba ambil informasinya
        $(el).find('td, tr').each((i, day) => {
          const dayText = $(day).text().trim();
          if (dayText && !dayText.includes('Jam') && !dayText.includes('Hours')) {
            hours.push(dayText);
          }
        });
      }
    });
    
    // Dapatkan website tempat
    let website = '';
    $('a').each((idx, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().toLowerCase();
      if ((text.includes('situs') || text.includes('website') || text.includes('http')) && 
          href.startsWith('http') && 
          !href.includes('google.com')) {
        website = href;
        return false; // break loop
      }
    });
    
    return {
      mapsUrl: mapsUrl || url,
      phone,
      hours,
      website
    };
  } catch (error) {
    logger.error(`Error getting place details: ${error.message}`);
    return {
      mapsUrl: url,
      phone: '',
      hours: [],
      website: ''
    };
  }
}

/**
 * Membuat embed untuk menampilkan tempat
 * @param {Object} place - Data tempat dasar
 * @param {Object} details - Detail tempat
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createPlaceEmbed(place, details) {
  const embed = new EmbedBuilder()
    .setColor('#4285F4') // Google blue
    .setTitle(`📍 ${place.title}`)
    .setURL(details.mapsUrl || place.url);
  
  // Set thumbnail jika ada
  if (place.thumbnail) {
    embed.setThumbnail(place.thumbnail);
  }
  
  let description = '';
  
  // Tambahkan rating jika ada
  if (place.rating) {
    // Ekstrak rating numerik jika ada format "4.5 (123 ulasan)"
    const ratingMatch = place.rating.match(/([0-9.]+)/);
    const ratingValue = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
    
    // Buat visual rating dengan bintang
    let stars = '';
    if (ratingValue > 0) {
      const fullStars = Math.floor(ratingValue);
      const halfStar = ratingValue - fullStars >= 0.5;
      
      for (let i = 0; i < fullStars; i++) stars += '⭐';
      if (halfStar) stars += '✨';
    }
    
    description += `${stars} **Rating:** ${place.rating}\n`;
  }
  
  // Tambahkan kategori jika ada
  if (place.category) {
    description += `**Kategori:** ${place.category}\n`;
  }
  
  // Tambahkan alamat jika ada
  if (place.address) {
    description += `**Alamat:** ${place.address}\n`;
  }
  
  // Tambahkan nomor telepon jika ada
  if (details.phone) {
    description += `**Telepon:** ${details.phone}\n`;
  }
  
  // Tambahkan website jika ada
  if (details.website) {
    description += `**Website:** [Kunjungi Website](${details.website})\n`;
  }
  
  embed.setDescription(description);
  
  // Tambahkan jam operasional jika ada
  if (details.hours && details.hours.length > 0) {
    const hoursText = details.hours.slice(0, Math.min(7, details.hours.length)).join('\n');
    
    if (hoursText) {
      embed.addFields({
        name: '🕒 Jam Operasional',
        value: hoursText
      });
    }
  }
  
  embed.setFooter({ 
    text: 'Data tersedia via Google • Diperbarui pada ' + new Date().toLocaleString('id-ID'),
  });
  
  return embed;
}

/**
 * Membuat tombol untuk link tempat
 * @param {Array} places - Array data tempat
 * @returns {ActionRowBuilder} - Action row dengan tombol
 */
function createPlaceButtons(places) {
  const row = new ActionRowBuilder();
  
  // Tambahkan tombol untuk tempat utama
  const mainButton = new ButtonBuilder()
    .setLabel(`Buka di Google Maps`)
    .setStyle(ButtonStyle.Link)
    .setURL(places[0].url)
    .setEmoji('🗺️');
  
  row.addComponents(mainButton);
  
  // Tambahkan tombol untuk tempat alternatif jika ada
  const maxButtons = Math.min(4, places.length - 1); // Max 5 tombol total, 1 sudah dipakai
  
  for (let i = 1; i <= maxButtons; i++) {
    const button = new ButtonBuilder()
      .setLabel(places[i].title.substring(0, 20) + (places[i].title.length > 20 ? '...' : ''))
      .setStyle(ButtonStyle.Link)
      .setURL(places[i].url);
    
    row.addComponents(button);
  }
  
  return row;
}
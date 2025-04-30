/**
 * Waktu Indonesia Command
 * 
 * Command untuk menampilkan waktu di berbagai kota di Indonesia dengan timezone yang berbeda.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');

// Daftar kota-kota besar di Indonesia dengan timezonenya
const kotaIndonesia = [
  { name: 'Jakarta', timezone: 'Asia/Jakarta', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Surabaya', timezone: 'Asia/Jakarta', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Bandung', timezone: 'Asia/Jakarta', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Semarang', timezone: 'Asia/Jakarta', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Yogyakarta', timezone: 'Asia/Jakarta', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Medan', timezone: 'Asia/Jakarta', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Palembang', timezone: 'Asia/Jakarta', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Pontianak', timezone: 'Asia/Pontianak', region: 'WIB - Waktu Indonesia Barat' },
  { name: 'Makassar', timezone: 'Asia/Makassar', region: 'WITA - Waktu Indonesia Tengah' },
  { name: 'Denpasar', timezone: 'Asia/Makassar', region: 'WITA - Waktu Indonesia Tengah' },
  { name: 'Manado', timezone: 'Asia/Makassar', region: 'WITA - Waktu Indonesia Tengah' },
  { name: 'Balikpapan', timezone: 'Asia/Makassar', region: 'WITA - Waktu Indonesia Tengah' },
  { name: 'Jayapura', timezone: 'Asia/Jayapura', region: 'WIT - Waktu Indonesia Timur' },
  { name: 'Sorong', timezone: 'Asia/Jayapura', region: 'WIT - Waktu Indonesia Timur' },
  { name: 'Merauke', timezone: 'Asia/Jayapura', region: 'WIT - Waktu Indonesia Timur' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waktuindonesia')
    .setDescription('Menampilkan waktu di berbagai kota di Indonesia')
    .addStringOption(option => 
      option.setName('kota')
        .setDescription('Kota di Indonesia (opsional)')
        .setRequired(false)
        .addChoices(
          { name: 'Jakarta (WIB)', value: 'Jakarta' },
          { name: 'Surabaya (WIB)', value: 'Surabaya' },
          { name: 'Bandung (WIB)', value: 'Bandung' },
          { name: 'Medan (WIB)', value: 'Medan' },
          { name: 'Makassar (WITA)', value: 'Makassar' },
          { name: 'Denpasar (WITA)', value: 'Denpasar' },
          { name: 'Manado (WITA)', value: 'Manado' },
          { name: 'Jayapura (WIT)', value: 'Jayapura' }
        )),
  
  async execute(interaction) {
    try {
      // Defer reply untuk mencegah timeout
      await interaction.deferReply();
      
      // Dapatkan kota yang dipilih atau tampilkan semua kota jika tidak ada yang dipilih
      const selectedCity = interaction.options.getString('kota');
      
      // Jika kota dipilih, hanya tampilkan waktu untuk kota tersebut
      if (selectedCity) {
        const city = kotaIndonesia.find(city => city.name === selectedCity);
        
        if (!city) {
          return await interaction.editReply({ 
            content: `Kota ${selectedCity} tidak ditemukan.`,
            ephemeral: true
          });
        }
        
        const embed = createCityTimeEmbed(city);
        await interaction.editReply({ embeds: [embed] });
        
        logger.info(`User ${interaction.user.tag} requested time for ${city.name}`);
      } 
      // Jika tidak ada kota yang dipilih, tampilkan waktu untuk semua zona waktu Indonesia
      else {
        const embed = createIndonesiaTimeEmbed();
        await interaction.editReply({ embeds: [embed] });
        
        logger.info(`User ${interaction.user.tag} requested Indonesia time overview`);
      }
    } catch (error) {
      logger.error(`Error executing waktuindonesia command: ${error.message}`);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat memperoleh informasi waktu. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat memperoleh informasi waktu. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      }
    }
  }
};

/**
 * Buat embed untuk menampilkan waktu satu kota
 * @param {Object} city - Data kota yang berisi name dan timezone
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createCityTimeEmbed(city) {
  // Dapatkan waktu saat ini di timezone kota
  const currentTime = new Date().toLocaleString('id-ID', { 
    timeZone: city.timezone,
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  
  // Icon berdasarkan waktu
  const hour = new Date().toLocaleString('en-US', { 
    timeZone: city.timezone,
    hour: 'numeric',
    hour12: false
  });
  
  let timeIcon = '🌞'; // Default siang hari
  
  if (hour < 6) timeIcon = '🌙'; // Dini hari
  else if (hour < 11) timeIcon = '🌄'; // Pagi
  else if (hour < 15) timeIcon = '☀️'; // Siang
  else if (hour < 18) timeIcon = '🌇'; // Sore
  else timeIcon = '🌃'; // Malam
  
  const embed = new EmbedBuilder()
    .setColor('#00AAFF')
    .setTitle(`${timeIcon} Waktu di ${city.name}, Indonesia`)
    .setDescription(`**${currentTime}**\n${city.region}`)
    .addFields(
      { name: 'Zona Waktu', value: city.timezone, inline: true },
      { name: 'Wilayah', value: city.region, inline: true }
    )
    .setFooter({ text: 'Waktu lokal Indonesia' })
    .setTimestamp();
  
  return embed;
}

/**
 * Buat embed untuk menampilkan waktu di semua zona waktu Indonesia
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createIndonesiaTimeEmbed() {
  // Dapatkan waktu untuk masing-masing zona waktu Indonesia
  const wibTime = new Date().toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  
  const witaTime = new Date().toLocaleString('id-ID', { 
    timeZone: 'Asia/Makassar',
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  
  const witTime = new Date().toLocaleString('id-ID', { 
    timeZone: 'Asia/Jayapura',
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  
  // Icon berdasarkan waktu di Jakarta
  const hourJakarta = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    hour12: false
  });
  
  let timeIconWIB = '🌞'; // Default siang hari
  
  if (hourJakarta < 6) timeIconWIB = '🌙'; // Dini hari
  else if (hourJakarta < 11) timeIconWIB = '🌄'; // Pagi
  else if (hourJakarta < 15) timeIconWIB = '☀️'; // Siang
  else if (hourJakarta < 18) timeIconWIB = '🌇'; // Sore
  else timeIconWIB = '🌃'; // Malam
  
  // Icon berdasarkan waktu di Makassar
  const hourMakassar = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Makassar',
    hour: 'numeric',
    hour12: false
  });
  
  let timeIconWITA = '🌞'; // Default siang hari
  
  if (hourMakassar < 6) timeIconWITA = '🌙'; // Dini hari
  else if (hourMakassar < 11) timeIconWITA = '🌄'; // Pagi
  else if (hourMakassar < 15) timeIconWITA = '☀️'; // Siang
  else if (hourMakassar < 18) timeIconWITA = '🌇'; // Sore
  else timeIconWITA = '🌃'; // Malam
  
  // Icon berdasarkan waktu di Jayapura
  const hourJayapura = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Jayapura',
    hour: 'numeric',
    hour12: false
  });
  
  let timeIconWIT = '🌞'; // Default siang hari
  
  if (hourJayapura < 6) timeIconWIT = '🌙'; // Dini hari
  else if (hourJayapura < 11) timeIconWIT = '🌄'; // Pagi
  else if (hourJayapura < 15) timeIconWIT = '☀️'; // Siang
  else if (hourJayapura < 18) timeIconWIT = '🌇'; // Sore
  else timeIconWIT = '🌃'; // Malam
  
  const embed = new EmbedBuilder()
    .setColor('#00AAFF')
    .setTitle('🇮🇩 Waktu di Indonesia')
    .setDescription('Berikut adalah waktu di tiga zona waktu Indonesia')
    .addFields(
      { 
        name: `${timeIconWIB} WIB - Waktu Indonesia Barat`,
        value: `**${wibTime}**\nKota: Jakarta, Surabaya, Bandung, Medan`,
        inline: false
      },
      { 
        name: `${timeIconWITA} WITA - Waktu Indonesia Tengah`,
        value: `**${witaTime}**\nKota: Makassar, Denpasar, Manado, Balikpapan`,
        inline: false
      },
      { 
        name: `${timeIconWIT} WIT - Waktu Indonesia Timur`,
        value: `**${witTime}**\nKota: Jayapura, Sorong, Merauke`,
        inline: false
      }
    )
    .setFooter({ text: 'Gunakan /waktuindonesia [kota] untuk detail kota spesifik' })
    .setTimestamp();
  
  return embed;
}
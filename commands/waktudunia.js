/**
 * Waktu Dunia Command
 * 
 * Command untuk menampilkan waktu di berbagai kota besar dunia dengan timezone yang berbeda.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');

// Daftar kota-kota besar di dunia dengan timezone dan negaranya
const kotaDunia = [
  { name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Jepang' },
  { name: 'New York', timezone: 'America/New_York', country: 'Amerika Serikat' },
  { name: 'London', timezone: 'Europe/London', country: 'Inggris' },
  { name: 'Paris', timezone: 'Europe/Paris', country: 'Prancis' },
  { name: 'Beijing', timezone: 'Asia/Shanghai', country: 'China' },
  { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
  { name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
  { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapura' },
  { name: 'Seoul', timezone: 'Asia/Seoul', country: 'Korea Selatan' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'Amerika Serikat' },
  { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Jerman' },
  { name: 'Moscow', timezone: 'Europe/Moscow', country: 'Rusia' },
  { name: 'Rio de Janeiro', timezone: 'America/Sao_Paulo', country: 'Brasil' },
  { name: 'Cairo', timezone: 'Africa/Cairo', country: 'Mesir' },
  { name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waktudunia')
    .setDescription('Menampilkan waktu di berbagai kota besar dunia')
    .addStringOption(option => 
      option.setName('kota')
        .setDescription('Kota di dunia (opsional)')
        .setRequired(false)
        .addChoices(
          { name: 'Tokyo, Jepang', value: 'Tokyo' },
          { name: 'New York, AS', value: 'New York' },
          { name: 'London, Inggris', value: 'London' },
          { name: 'Paris, Prancis', value: 'Paris' },
          { name: 'Beijing, China', value: 'Beijing' },
          { name: 'Dubai, UAE', value: 'Dubai' },
          { name: 'Sydney, Australia', value: 'Sydney' },
          { name: 'Singapore', value: 'Singapore' },
          { name: 'Seoul, Korea Selatan', value: 'Seoul' },
          { name: 'Los Angeles, AS', value: 'Los Angeles' },
          { name: 'Berlin, Jerman', value: 'Berlin' },
          { name: 'Moscow, Rusia', value: 'Moscow' }
        )),
  
  async execute(interaction) {
    try {
      // Defer reply untuk mencegah timeout
      await interaction.deferReply();
      
      // Dapatkan kota yang dipilih atau tampilkan beberapa kota utama jika tidak ada yang dipilih
      const selectedCity = interaction.options.getString('kota');
      
      // Jika kota dipilih, hanya tampilkan waktu untuk kota tersebut
      if (selectedCity) {
        const city = kotaDunia.find(city => city.name === selectedCity);
        
        if (!city) {
          return await interaction.editReply({ 
            content: `Kota ${selectedCity} tidak ditemukan.`,
            ephemeral: true
          });
        }
        
        const embed = createCityTimeEmbed(city);
        await interaction.editReply({ embeds: [embed] });
        
        logger.info(`User ${interaction.user.tag} requested world time for ${city.name}`);
      } 
      // Jika tidak ada kota yang dipilih, tampilkan waktu untuk beberapa kota besar
      else {
        const embed = createWorldTimeEmbed();
        await interaction.editReply({ embeds: [embed] });
        
        logger.info(`User ${interaction.user.tag} requested world time overview`);
      }
    } catch (error) {
      logger.error(`Error executing waktudunia command: ${error.message}`);
      
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
 * @param {Object} city - Data kota yang berisi name, timezone, dan country
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
  const hour = parseInt(new Date().toLocaleString('en-US', { 
    timeZone: city.timezone,
    hour: 'numeric',
    hour12: false
  }));
  
  let timeIcon = '🌞'; // Default siang hari
  
  if (hour < 6) timeIcon = '🌙'; // Dini hari
  else if (hour < 11) timeIcon = '🌄'; // Pagi
  else if (hour < 15) timeIcon = '☀️'; // Siang
  else if (hour < 18) timeIcon = '🌇'; // Sore
  else timeIcon = '🌃'; // Malam
  
  // Dapatkan perbedaan waktu dengan Jakarta
  const jakartaTime = new Date();
  const cityTime = new Date(new Date().toLocaleString('en-US', { timeZone: city.timezone }));
  const jakartaOffset = -jakartaTime.getTimezoneOffset() / 60;
  const cityOffset = (cityTime - jakartaTime) / 3600000 + jakartaOffset;
  
  let offsetText = '';
  if (cityOffset > 0) {
    offsetText = `+${cityOffset} jam dari Jakarta`;
  } else if (cityOffset < 0) {
    offsetText = `${cityOffset} jam dari Jakarta`;
  } else {
    offsetText = `Sama dengan Jakarta`;
  }
  
  const embed = new EmbedBuilder()
    .setColor('#0078D7')
    .setTitle(`${timeIcon} Waktu di ${city.name}, ${city.country}`)
    .setDescription(`**${currentTime}**`)
    .addFields(
      { name: 'Zona Waktu', value: city.timezone, inline: true },
      { name: 'Negara', value: city.country, inline: true },
      { name: 'Perbedaan', value: offsetText, inline: true }
    )
    .setFooter({ text: 'Waktu lokal berdasarkan zona waktu kota' })
    .setTimestamp();
  
  return embed;
}

/**
 * Buat embed untuk menampilkan waktu di beberapa kota besar dunia
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createWorldTimeEmbed() {
  // Pilih beberapa kota besar yang mewakili berbagai belahan dunia
  const selectedCities = [
    kotaDunia.find(city => city.name === 'Tokyo'),
    kotaDunia.find(city => city.name === 'New York'),
    kotaDunia.find(city => city.name === 'London'),
    kotaDunia.find(city => city.name === 'Dubai'),
    kotaDunia.find(city => city.name === 'Sydney')
  ];
  
  const embed = new EmbedBuilder()
    .setColor('#0078D7')
    .setTitle('🌎 Waktu di Kota-Kota Besar Dunia')
    .setDescription('Berikut adalah waktu di beberapa kota besar dunia')
    .setFooter({ text: 'Gunakan /waktudunia [kota] untuk detail kota spesifik' })
    .setTimestamp();
  
  // Tambahkan waktu untuk setiap kota terpilih
  for (const city of selectedCities) {
    try {
      if (city) {
        // Dapatkan waktu lokal
        const currentTime = new Date().toLocaleString('id-ID', { 
          timeZone: city.timezone,
          dateStyle: 'full',
          timeStyle: 'medium'
        });
        
        // Icon berdasarkan waktu
        const hour = parseInt(new Date().toLocaleString('en-US', { 
          timeZone: city.timezone,
          hour: 'numeric',
          hour12: false
        }));
        
        let timeIcon = '🌞'; // Default siang hari
        
        if (hour < 6) timeIcon = '🌙'; // Dini hari
        else if (hour < 11) timeIcon = '🌄'; // Pagi
        else if (hour < 15) timeIcon = '☀️'; // Siang
        else if (hour < 18) timeIcon = '🌇'; // Sore
        else timeIcon = '🌃'; // Malam
        
        embed.addFields({
          name: `${timeIcon} ${city.name}, ${city.country}`,
          value: `**${currentTime}**`,
          inline: false
        });
      }
    } catch (error) {
      logger.error(`Error getting time for ${city?.name}: ${error.message}`);
    }
  }
  
  return embed;
}
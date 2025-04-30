/**
 * Cuaca Dunia Command
 * 
 * Command untuk mendapatkan informasi cuaca dan waktu di kota-kota besar dunia.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');
const axios = require('axios');

// Daftar kota-kota besar di dunia
const kotaDunia = [
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917, country: 'Jepang' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'Amerika Serikat' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'Inggris' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'Prancis' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapura' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'Korea Selatan' },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turki' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'Rusia' }
];

// Emoji untuk kondisi cuaca
const weatherEmoji = {
  'Clear': '☀️',
  'Clouds': '☁️',
  'Rain': '🌧️',
  'Drizzle': '🌦️',
  'Thunderstorm': '⛈️',
  'Snow': '❄️',
  'Mist': '🌫️',
  'Smoke': '🌫️',
  'Haze': '🌫️',
  'Dust': '🌫️',
  'Fog': '🌫️',
  'Sand': '🌫️',
  'Ash': '🌫️',
  'Squall': '💨',
  'Tornado': '🌪️'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cuacadunia')
    .setDescription('Menampilkan informasi cuaca dan waktu di kota-kota besar dunia')
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
          { name: 'Singapore', value: 'Singapore' },
          { name: 'Sydney, Australia', value: 'Sydney' },
          { name: 'Seoul, Korea Selatan', value: 'Seoul' },
          { name: 'Istanbul, Turki', value: 'Istanbul' },
          { name: 'Mumbai, India', value: 'Mumbai' },
          { name: 'Moscow, Rusia', value: 'Moscow' }
        )),
  
  async execute(interaction) {
    try {
      // Defer reply karena API call membutuhkan waktu
      await interaction.deferReply();
      
      // Dapatkan kota yang dipilih atau tampilkan semua kota jika tidak ada yang dipilih
      const selectedCity = interaction.options.getString('kota');
      
      // Jika kota dipilih, hanya tampilkan cuaca untuk kota tersebut
      if (selectedCity) {
        const city = kotaDunia.find(city => city.name === selectedCity);
        
        if (!city) {
          return await interaction.editReply({ 
            content: `Kota ${selectedCity} tidak ditemukan.`,
            ephemeral: true
          });
        }
        
        const weatherData = await getWeatherData(city);
        
        if (!weatherData) {
          return await interaction.editReply({ 
            content: `Tidak dapat memperoleh data cuaca untuk ${city.name}.`,
            ephemeral: true
          });
        }
        
        const embed = createWeatherEmbed(weatherData, city);
        await interaction.editReply({ embeds: [embed] });
        
        logger.info(`User ${interaction.user.tag} requested global weather for ${city.name}`);
      } 
      // Jika tidak ada kota yang dipilih, tampilkan cuaca overview untuk beberapa kota besar
      else {
        const overviewEmbed = await createWeatherOverviewEmbed();
        await interaction.editReply({ embeds: [overviewEmbed] });
        
        logger.info(`User ${interaction.user.tag} requested global weather overview`);
      }
    } catch (error) {
      logger.error(`Error executing cuacadunia command: ${error.message}`);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat memperoleh data cuaca. Silakan coba lagi nanti.',
          ephemeral: true
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat memperoleh data cuaca. Silakan coba lagi nanti.',
          ephemeral: true
        });
      }
    }
  }
};

/**
 * Mendapatkan data cuaca dari API
 * @param {Object} city - Objek kota yang berisi name, lat, dan lon
 * @returns {Object|null} - Data cuaca atau null jika gagal
 */
async function getWeatherData(city) {
  try {
    // Gunakan API publik Open-Meteo
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`);
    
    if (response.status === 200) {
      const data = response.data;
      
      // Tentukan kondisi cuaca berdasarkan kode cuaca
      let weatherCondition = 'Clear';
      const weatherCode = data.current.weather_code;
      
      if (weatherCode === 0) {
        weatherCondition = 'Clear';
      } else if (weatherCode <= 3) {
        weatherCondition = 'Clouds';
      } else if (weatherCode <= 48) {
        weatherCondition = 'Mist';
      } else if (weatherCode <= 57) {
        weatherCondition = 'Drizzle';
      } else if (weatherCode <= 67) {
        weatherCondition = 'Rain';
      } else if (weatherCode <= 77) {
        weatherCondition = 'Snow';
      } else if (weatherCode <= 82) {
        weatherCondition = 'Rain';
      } else if (weatherCode <= 86) {
        weatherCondition = 'Snow';
      } else if (weatherCode >= 95) {
        weatherCondition = 'Thunderstorm';
      }
      
      // Tambahkan kondisi cuaca ke response
      data.weather = {
        main: weatherCondition
      };
      
      return data;
    }
  } catch (error) {
    logger.error(`Error fetching global weather data: ${error.message}`);
  }
  
  return null;
}

/**
 * Buat embed untuk menampilkan data cuaca satu kota
 * @param {Object} data - Data cuaca
 * @param {Object} city - Data kota
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createWeatherEmbed(data, city) {
  const current = data.current;
  const weatherMain = data.weather.main;
  const emoji = weatherEmoji[weatherMain] || '🌦️';
  
  // Format waktu lokal dari timezone dalam data
  const currentTime = new Date().toLocaleString('id-ID', { 
    timeZone: data.timezone,
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  
  // Mendapatkan arah mata angin dari derajat
  const windDirection = getWindDirection(current.wind_direction_10m);
  
  const embed = new EmbedBuilder()
    .setColor('#0078D7')
    .setTitle(`${emoji} Cuaca di ${city.name}, ${city.country}`)
    .setDescription(`**${weatherMain}**\n${currentTime}`)
    .addFields(
      { name: 'Suhu', value: `${current.temperature_2m}°C`, inline: true },
      { name: 'Terasa Seperti', value: `${current.apparent_temperature}°C`, inline: true },
      { name: 'Kelembaban', value: `${current.relative_humidity_2m}%`, inline: true },
      { name: 'Curah Hujan', value: `${current.precipitation} mm`, inline: true },
      { name: 'Angin', value: `${current.wind_speed_10m} km/jam (${windDirection})`, inline: true }
    )
    .setFooter({ text: 'Data dari Open-Meteo Weather API' })
    .setTimestamp();
  
  return embed;
}

/**
 * Buat embed untuk menampilkan overview cuaca di beberapa kota besar dunia
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
async function createWeatherOverviewEmbed() {
  const embed = new EmbedBuilder()
    .setColor('#0078D7')
    .setTitle('🌎 Cuaca di Kota-Kota Besar Dunia')
    .setDescription(`Berikut adalah informasi cuaca terbaru di beberapa kota besar dunia.\nWaktu: ${new Date().toLocaleString('id-ID')}`)
    .setFooter({ text: 'Data dari Open-Meteo Weather API • Gunakan /cuacadunia [kota] untuk detail' })
    .setTimestamp();
  
  // Ambil data cuaca untuk beberapa kota besar
  // Batasi jumlah kota untuk mempercepat respons
  const citiesToShow = kotaDunia.slice(0, 6);
  
  for (const city of citiesToShow) {
    try {
      const weatherData = await getWeatherData(city);
      
      if (weatherData) {
        const current = weatherData.current;
        const weatherMain = weatherData.weather.main;
        const emoji = weatherEmoji[weatherMain] || '🌦️';
        
        embed.addFields({
          name: `${emoji} ${city.name}, ${city.country}`,
          value: `**${weatherMain}** • ${current.temperature_2m}°C • ${current.relative_humidity_2m}% kelembaban`,
          inline: false
        });
      } else {
        embed.addFields({
          name: `${city.name}, ${city.country}`,
          value: 'Data tidak tersedia',
          inline: false
        });
      }
    } catch (error) {
      logger.error(`Error getting global weather for ${city.name}: ${error.message}`);
      
      embed.addFields({
        name: `${city.name}, ${city.country}`,
        value: 'Error mendapatkan data',
        inline: false
      });
    }
  }
  
  return embed;
}

/**
 * Mendapatkan arah mata angin dari derajat
 * @param {number} degrees - Derajat arah angin
 * @returns {string} - Arah mata angin
 */
function getWindDirection(degrees) {
  const directions = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
  return directions[Math.round(degrees / 45) % 8];
}
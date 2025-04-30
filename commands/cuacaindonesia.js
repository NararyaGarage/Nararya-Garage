/**
 * Cuaca Indonesia Command
 * 
 * Command untuk mendapatkan informasi cuaca dan waktu di kota-kota besar Indonesia.
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

// Daftar kota-kota besar di Indonesia
const kotaIndonesia = [
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
  { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
  { name: 'Medan', lat: 3.5952, lon: 98.6722 },
  { name: 'Makassar', lat: -5.1477, lon: 119.4327 },
  { name: 'Semarang', lat: -6.9932, lon: 110.4203 },
  { name: 'Palembang', lat: -2.9761, lon: 104.7754 },
  { name: 'Denpasar', lat: -8.6705, lon: 115.2126 },
  { name: 'Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { name: 'Manado', lat: 1.4748, lon: 124.8421 },
  { name: 'Pontianak', lat: -0.0263, lon: 109.3425 },
  { name: 'Jayapura', lat: -2.5916, lon: 140.6689 }
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
    .setName('cuacaindonesia')
    .setDescription('Menampilkan informasi cuaca dan waktu di kota-kota Indonesia')
    .addStringOption(option => 
      option.setName('kota')
        .setDescription('Kota di Indonesia (opsional)')
        .setRequired(false)
        .addChoices(
          { name: 'Jakarta', value: 'Jakarta' },
          { name: 'Surabaya', value: 'Surabaya' },
          { name: 'Bandung', value: 'Bandung' },
          { name: 'Medan', value: 'Medan' },
          { name: 'Makassar', value: 'Makassar' },
          { name: 'Semarang', value: 'Semarang' },
          { name: 'Palembang', value: 'Palembang' },
          { name: 'Denpasar', value: 'Denpasar' },
          { name: 'Yogyakarta', value: 'Yogyakarta' },
          { name: 'Manado', value: 'Manado' },
          { name: 'Pontianak', value: 'Pontianak' },
          { name: 'Jayapura', value: 'Jayapura' }
        )),
  
  async execute(interaction) {
    try {
      // Defer reply karena API call membutuhkan waktu
      await interaction.deferReply();
      
      // Dapatkan kota yang dipilih atau tampilkan semua kota jika tidak ada yang dipilih
      const selectedCity = interaction.options.getString('kota');
      
      // Jika kota dipilih, hanya tampilkan cuaca untuk kota tersebut
      if (selectedCity) {
        const city = kotaIndonesia.find(city => city.name === selectedCity);
        
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
        
        logger.info(`User ${interaction.user.tag} requested weather for ${city.name}`);
      } 
      // Jika tidak ada kota yang dipilih, tampilkan cuaca overview untuk semua kota besar
      else {
        const overviewEmbed = await createWeatherOverviewEmbed();
        await interaction.editReply({ embeds: [overviewEmbed] });
        
        logger.info(`User ${interaction.user.tag} requested Indonesia weather overview`);
      }
    } catch (error) {
      logger.error(`Error executing cuacaindonesia command: ${error.message}`);
      
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
    // Gunakan API publik OpenWeatherMap
    // Note: Hasilnya sangat terbatas tanpa API key
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`);
    
    if (response.status === 200) {
      const data = response.data;
      
      // Tentukan kondisi cuaca berdasarkan kode cuaca
      // Kode cuaca dari API Open-Meteo:
      // 0: Clear sky
      // 1, 2, 3: Mainly clear, partly cloudy, and overcast
      // 45, 48: Fog and depositing rime fog
      // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
      // 56, 57: Freezing Drizzle: Light and dense intensity
      // 61, 63, 65: Rain: Slight, moderate and heavy intensity
      // 66, 67: Freezing Rain: Light and heavy intensity
      // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
      // 77: Snow grains
      // 80, 81, 82: Rain showers: Slight, moderate, and violent
      // 85, 86: Snow showers slight and heavy
      // 95: Thunderstorm: Slight or moderate
      // 96, 99: Thunderstorm with slight and heavy hail
      
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
    logger.error(`Error fetching weather data: ${error.message}`);
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
  
  // Format waktu lokal dari timestamp
  const currentTime = new Date().toLocaleString('id-ID', { 
    timeZone: data.timezone,
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  
  // Mendapatkan arah mata angin dari derajat
  const windDirection = getWindDirection(current.wind_direction_10m);
  
  const embed = new EmbedBuilder()
    .setColor('#00AAFF')
    .setTitle(`${emoji} Cuaca di ${city.name}, Indonesia`)
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
 * Buat embed untuk menampilkan overview cuaca di beberapa kota besar Indonesia
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
async function createWeatherOverviewEmbed() {
  const embed = new EmbedBuilder()
    .setColor('#00AAFF')
    .setTitle('🇮🇩 Cuaca di Kota-Kota Besar Indonesia')
    .setDescription(`Berikut adalah informasi cuaca terbaru di beberapa kota besar Indonesia.\nWaktu: ${new Date().toLocaleString('id-ID')}`)
    .setFooter({ text: 'Data dari Open-Meteo Weather API • Gunakan /cuacaindonesia [kota] untuk detail' })
    .setTimestamp();
  
  // Ambil data cuaca untuk 6 kota besar
  const citiesToShow = kotaIndonesia.slice(0, 6);
  
  for (const city of citiesToShow) {
    try {
      const weatherData = await getWeatherData(city);
      
      if (weatherData) {
        const current = weatherData.current;
        const weatherMain = weatherData.weather.main;
        const emoji = weatherEmoji[weatherMain] || '🌦️';
        
        embed.addFields({
          name: `${emoji} ${city.name}`,
          value: `**${weatherMain}** • ${current.temperature_2m}°C • ${current.relative_humidity_2m}% kelembaban`,
          inline: false
        });
      } else {
        embed.addFields({
          name: `${city.name}`,
          value: 'Data tidak tersedia',
          inline: false
        });
      }
    } catch (error) {
      logger.error(`Error getting weather for ${city.name}: ${error.message}`);
      
      embed.addFields({
        name: `${city.name}`,
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
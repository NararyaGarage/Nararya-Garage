/**
 * Cari Film Command
 * 
 * Command untuk mencari film dan acara TV di berbagai platform streaming.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logger } = require('../../utils/logger');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('carifilm')
    .setDescription('Mencari film atau acara TV di berbagai platform streaming')
    .addStringOption(option => 
      option
        .setName('judul')
        .setDescription('Judul film atau acara TV yang ingin dicari')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('platform')
        .setDescription('Platform streaming yang ingin dicari')
        .setRequired(false)
        .addChoices(
          { name: 'Semua Platform', value: 'all' },
          { name: 'Netflix', value: 'netflix' },
          { name: 'Disney+', value: 'disney' },
          { name: 'Prime Video', value: 'prime' },
          { name: 'HBO Max', value: 'hbo' },
          { name: 'Hulu', value: 'hulu' }
        )),
  
  async execute(interaction) {
    // Langsung defer reply untuk mencegah timeout
    await interaction.deferReply();
    
    try {
      const title = interaction.options.getString('judul');
      const platform = interaction.options.getString('platform') || 'all';
      
      // Dapatkan hasil pencarian
      const searchResults = await searchMovies(title, platform);
      
      if (!searchResults || searchResults.length === 0) {
        return await interaction.editReply({
          content: `❌ Tidak ditemukan hasil untuk "${title}" ${platform !== 'all' ? `di ${getPlatformName(platform)}` : 'di semua platform'}.`
        });
      }
      
      // Tampilkan hanya 10 hasil pertama untuk menghindari embed yang terlalu panjang
      const displayResults = searchResults.slice(0, 10);
      
      // Buat embed untuk hasil pencarian
      const embed = new EmbedBuilder()
        .setTitle(`🎬 Hasil Pencarian: "${title}"`)
        .setColor('#FF6200')
        .setDescription(`Berikut adalah hasil pencarian untuk "${title}" ${platform !== 'all' ? `di ${getPlatformName(platform)}` : 'di berbagai platform streaming'}.\n\n*Menampilkan ${displayResults.length} dari ${searchResults.length} hasil.*`)
        .setFooter({ 
          text: '© 2025 Nararya Garage Team - All Rights Reserved',
          iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
        })
        .setTimestamp();
      
      // Tambahkan setiap hasil sebagai field
      displayResults.forEach((result, index) => {
        const platformBadges = result.platforms.map(p => getPlatformEmoji(p)).join(' ');
        const typeIcon = result.type === 'movie' ? '🎬' : '📺';
        
        embed.addFields({
          name: `${index + 1}. ${typeIcon} ${result.title} (${result.year || 'N/A'})`,
          value: `${platformBadges}\n${result.overview ? `${truncateString(result.overview, 150)}\n` : ''}${result.rating ? `⭐ **Rating:** ${result.rating}/10\n` : ''}${result.genres ? `🏷️ **Genre:** ${result.genres.join(', ')}\n` : ''}`
        });
      });
      
      // Tambahkan link pencarian
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Cari di Google')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.google.com/search?q=${encodeURIComponent(title + ' film watch online')}`),
          new ButtonBuilder()
            .setLabel('IMDB')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.imdb.com/find/?q=${encodeURIComponent(title)}`),
        );
      
      // Tambahkan tombol Netflix jika platform adalah netflix atau all
      if (platform === 'netflix' || platform === 'all') {
        row.addComponents(
          new ButtonBuilder()
            .setLabel('Netflix')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.netflix.com/search?q=${encodeURIComponent(title)}`)
        );
      }
      
      // Tambahkan tombol Disney+ jika platform adalah disney atau all
      if (platform === 'disney' || platform === 'all') {
        row.addComponents(
          new ButtonBuilder()
            .setLabel('Disney+')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`)
        );
      }
      
      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });
      
      logger.info(`User ${interaction.user.tag} searched for movie/show: ${title} on platform: ${platform}`);
    } catch (error) {
      logger.error('Error executing carifilm command:', error);
      
      await interaction.editReply({
        content: 'Terjadi kesalahan saat mencari film. Silakan coba lagi nanti.'
      });
    }
  }
};

/**
 * Mencari film dan acara TV dari API
 * @param {string} title - Judul film atau acara TV
 * @param {string} platform - Platform streaming
 * @returns {Array} Hasil pencarian
 */
async function searchMovies(title, platform) {
  try {
    // Ini simulasi pencarian karena kita tidak punya akses ke API sebenarnya
    // Dalam implementasi nyata, Anda harus menggunakan API seperti TMDB, OMDb, atau JustWatch
    
    // Simulasi delay untuk menunjukkan proses searching
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Data sampel simulasi hasil pencarian
    const sampleResults = [
      {
        title: 'Avengers: Endgame',
        year: 2019,
        type: 'movie',
        overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
        platforms: ['disney', 'prime'],
        rating: 8.4,
        genres: ['Action', 'Adventure', 'Sci-Fi']
      },
      {
        title: 'Stranger Things',
        year: 2016,
        type: 'series',
        overview: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
        platforms: ['netflix'],
        rating: 8.7,
        genres: ['Drama', 'Fantasy', 'Horror']
      },
      {
        title: 'The Mandalorian',
        year: 2019,
        type: 'series',
        overview: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
        platforms: ['disney'],
        rating: 8.7,
        genres: ['Action', 'Adventure', 'Sci-Fi']
      },
      {
        title: 'The Boys',
        year: 2019,
        type: 'series',
        overview: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
        platforms: ['prime'],
        rating: 8.7,
        genres: ['Action', 'Comedy', 'Crime']
      },
      {
        title: 'Game of Thrones',
        year: 2011,
        type: 'series',
        overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
        platforms: ['hbo'],
        rating: 9.3,
        genres: ['Action', 'Adventure', 'Drama']
      },
      {
        title: 'The Handmaid\'s Tale',
        year: 2017,
        type: 'series',
        overview: 'Set in a dystopian future, a woman is forced to live as a concubine under a fundamentalist theocratic dictatorship.',
        platforms: ['hulu'],
        rating: 8.4,
        genres: ['Drama', 'Sci-Fi', 'Thriller']
      },
      {
        title: 'Black Widow',
        year: 2021,
        type: 'movie',
        overview: 'Natasha Romanoff confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises.',
        platforms: ['disney'],
        rating: 6.7,
        genres: ['Action', 'Adventure', 'Sci-Fi']
      },
      {
        title: 'The Queen\'s Gambit',
        year: 2020,
        type: 'series',
        overview: 'Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA. But child stardom comes at a price.',
        platforms: ['netflix'],
        rating: 8.6,
        genres: ['Drama']
      },
      {
        title: 'The Tomorrow War',
        year: 2021,
        type: 'movie',
        overview: 'A family man is drafted to fight in a future war where the fate of humanity relies on his ability to confront the past.',
        platforms: ['prime'],
        rating: 6.6,
        genres: ['Action', 'Adventure', 'Sci-Fi']
      },
      {
        title: 'Mare of Easttown',
        year: 2021,
        type: 'series',
        overview: 'A detective in a small Pennsylvania town investigates a local murder while trying to keep her life from falling apart.',
        platforms: ['hbo'],
        rating: 8.5,
        genres: ['Crime', 'Drama', 'Mystery']
      },
      {
        title: 'Palm Springs',
        year: 2020,
        type: 'movie',
        overview: 'Stuck in a time loop, two wedding guests develop a budding romance while living the same day over and over again.',
        platforms: ['hulu'],
        rating: 7.4,
        genres: ['Comedy', 'Fantasy', 'Romance']
      },
      {
        title: 'Loki',
        year: 2021,
        type: 'series',
        overview: 'The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after the events of "Avengers: Endgame."',
        platforms: ['disney'],
        rating: 8.3,
        genres: ['Action', 'Adventure', 'Fantasy']
      }
    ];
    
    // Filter berdasarkan platform jika tidak 'all'
    let results = [...sampleResults];
    if (platform !== 'all') {
      results = results.filter(result => result.platforms.includes(platform));
    }
    
    // Filter berdasarkan judul (case-insensitive partial match)
    results = results.filter(result => 
      result.title.toLowerCase().includes(title.toLowerCase())
    );
    
    return results;
  } catch (error) {
    logger.error('Error searching movies:', error);
    return [];
  }
}

/**
 * Mendapatkan nama platform dari kode platform
 * @param {string} platformCode - Kode platform
 * @returns {string} Nama platform
 */
function getPlatformName(platformCode) {
  const platforms = {
    'netflix': 'Netflix',
    'disney': 'Disney+',
    'prime': 'Prime Video',
    'hbo': 'HBO Max',
    'hulu': 'Hulu',
    'all': 'Semua Platform'
  };
  
  return platforms[platformCode] || platformCode;
}

/**
 * Mendapatkan emoji untuk platform
 * @param {string} platformCode - Kode platform
 * @returns {string} Emoji platform
 */
function getPlatformEmoji(platformCode) {
  const emojis = {
    'netflix': '🔴 **Netflix**',
    'disney': '🔵 **Disney+**',
    'prime': '🟢 **Prime Video**',
    'hbo': '🟣 **HBO Max**',
    'hulu': '🟢 **Hulu**'
  };
  
  return emojis[platformCode] || platformCode;
}

/**
 * Memotong string jika terlalu panjang
 * @param {string} str - String yang akan dipotong
 * @param {number} maxLength - Panjang maksimum
 * @returns {string} String yang sudah dipotong
 */
function truncateString(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
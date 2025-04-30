/**
 * Berita Dunia Command
 * 
 * Command untuk mendapatkan berita terbaru dan terlama dari seluruh dunia.
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
    .setName('beritadunia')
    .setDescription('Mendapatkan berita terbaru dari seluruh dunia')
    .addStringOption(option => 
      option.setName('jenis')
        .setDescription('Jenis berita')
        .setRequired(false)
        .addChoices(
          { name: 'Terbaru', value: 'latest' },
          { name: 'Politik', value: 'politics' },
          { name: 'Ekonomi', value: 'economy' },
          { name: 'Teknologi', value: 'technology' },
          { name: 'Olahraga', value: 'sports' },
          { name: 'Hiburan', value: 'entertainment' }
        )),
  
  async execute(interaction) {
    try {
      // Defer reply untuk mencegah timeout
      await interaction.deferReply();
      
      // Dapatkan jenis berita yang dipilih atau default ke terbaru
      const category = interaction.options.getString('jenis') || 'latest';
      
      // Mendapatkan berita global terbaru
      const newsData = await fetchGlobalNews(category);
      
      if (!newsData || newsData.length === 0) {
        return await interaction.editReply({ 
          content: 'Tidak dapat menemukan berita. Silakan coba lagi nanti.',
          ephemeral: true
        });
      }
      
      // Membuat embed untuk berita
      const embed = createNewsEmbed(newsData, category);
      
      // Membuat tombol untuk membuka berita asli
      const buttons = createNewsButtons(newsData);
      
      // Kirim respons dengan embed dan tombol
      await interaction.editReply({ 
        embeds: [embed],
        components: [buttons] 
      });
      
      logger.info(`User ${interaction.user.tag} requested global news in category: ${category}`);
    } catch (error) {
      logger.error(`Error executing beritadunia command: ${error.message}`);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat memperoleh berita. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat memperoleh berita. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      }
    }
  }
};

/**
 * Mengambil berita global dari sumber internasional
 * @param {string} category - Kategori berita
 * @returns {Array} - Array berita dari berbagai sumber
 */
async function fetchGlobalNews(category) {
  try {
    // URL untuk berita global berdasarkan kategori
    let url = 'https://www.bbc.com/news';
    
    if (category === 'politics') {
      url = 'https://www.bbc.com/news/world';
    } else if (category === 'economy') {
      url = 'https://www.bbc.com/news/business';
    } else if (category === 'technology') {
      url = 'https://www.bbc.com/news/technology';
    } else if (category === 'sports') {
      url = 'https://www.bbc.com/sport';
    } else if (category === 'entertainment') {
      url = 'https://www.bbc.com/news/entertainment_and_arts';
    }
    
    // Fetch data menggunakan axios
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch news, status code: ${response.status}`);
    }
    
    // Parsing halaman HTML dengan cheerio
    const $ = cheerio.load(response.data);
    const articles = [];
    
    // Cari artikel berita di halaman BBC
    $('div[data-component="card"]').each((index, element) => {
      if (articles.length < 5) { // Batasi hanya 5 berita
        const titleElement = $(element).find('h3').first();
        const title = titleElement.text().trim();
        
        let link = '';
        const linkElement = $(element).find('a').first();
        if (linkElement.length) {
          const href = linkElement.attr('href');
          // Pastikan link ini adalah URL lengkap
          if (href.startsWith('/')) {
            link = 'https://www.bbc.com' + href;
          } else {
            link = href;
          }
        }
        
        let description = '';
        const descElement = $(element).find('p').first();
        if (descElement.length) {
          description = descElement.text().trim();
        }
        
        if (title && link) {
          articles.push({
            title,
            link,
            description: description || 'Klik tombol di bawah untuk membaca berita lengkap',
            source: 'BBC News'
          });
        }
      }
    });
    
    // Jika tidak menemukan berita dengan selector pertama, coba selector lain
    if (articles.length === 0) {
      $('.gs-c-promo').each((index, element) => {
        if (articles.length < 5) {
          const titleElement = $(element).find('.gs-c-promo-heading__title').first();
          const title = titleElement.text().trim();
          
          let link = '';
          const linkElement = $(element).find('a').first();
          if (linkElement.length) {
            const href = linkElement.attr('href');
            // Pastikan link ini adalah URL lengkap
            if (href.startsWith('/')) {
              link = 'https://www.bbc.com' + href;
            } else {
              link = href;
            }
          }
          
          let description = '';
          const descElement = $(element).find('.gs-c-promo-summary').first();
          if (descElement.length) {
            description = descElement.text().trim();
          }
          
          if (title && link) {
            articles.push({
              title,
              link,
              description: description || 'Klik tombol di bawah untuk membaca berita lengkap',
              source: 'BBC News'
            });
          }
        }
      });
    }
    
    return articles;
  } catch (error) {
    logger.error(`Error fetching global news: ${error.message}`);
    return [];
  }
}

/**
 * Membuat embed untuk menampilkan berita
 * @param {Array} newsData - Array data berita
 * @param {string} category - Kategori berita yang dipilih
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createNewsEmbed(newsData, category) {
  // Mendapatkan judul kategori
  let categoryTitle = 'Terbaru';
  
  if (category === 'politics') categoryTitle = 'Politik';
  else if (category === 'economy') categoryTitle = 'Ekonomi';
  else if (category === 'technology') categoryTitle = 'Teknologi';
  else if (category === 'sports') categoryTitle = 'Olahraga';
  else if (category === 'entertainment') categoryTitle = 'Hiburan';
  
  const embed = new EmbedBuilder()
    .setColor('#0078D7')
    .setTitle(`🌎 Berita Dunia - ${categoryTitle}`)
    .setDescription('Berikut adalah berita terbaru dari seluruh dunia')
    .setFooter({ 
      text: 'Sumber: BBC News • Diperbarui pada ' + new Date().toLocaleString('id-ID'),
    })
    .setTimestamp();
  
  // Tambahkan artikel berita ke embed
  newsData.forEach((news, index) => {
    embed.addFields({
      name: `${index + 1}. ${news.title}`,
      value: `${news.description}\nSumber: ${news.source}`
    });
  });
  
  return embed;
}

/**
 * Membuat tombol untuk link berita
 * @param {Array} newsData - Array data berita
 * @returns {ActionRowBuilder} - Action row dengan tombol
 */
function createNewsButtons(newsData) {
  const row = new ActionRowBuilder();
  
  // Batasi maksimal 5 tombol
  const maxButtons = Math.min(newsData.length, 5);
  
  for (let i = 0; i < maxButtons; i++) {
    const button = new ButtonBuilder()
      .setLabel(`Berita ${i + 1}`)
      .setStyle(ButtonStyle.Link)
      .setURL(newsData[i].link)
      .setEmoji('🔗');
    
    row.addComponents(button);
  }
  
  return row;
}
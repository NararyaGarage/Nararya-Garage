/**
 * Resep Command
 * 
 * Command untuk mencari resep masakan berdasarkan kata kunci.
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
    .setName('resep')
    .setDescription('Mencari resep masakan berdasarkan kata kunci')
    .addStringOption(option => 
      option.setName('nama')
        .setDescription('Nama masakan yang ingin dicari (contoh: "ayam goreng", "rendang", dll)')
        .setRequired(true)),
  
  async execute(interaction) {
    try {
      // Defer reply untuk mencegah timeout
      await interaction.deferReply();
      
      // Dapatkan kata kunci pencarian
      const searchQuery = interaction.options.getString('nama');
      
      if (!searchQuery || searchQuery.trim() === '') {
        return await interaction.editReply({
          content: 'Mohon masukkan nama masakan yang ingin dicari.',
          ephemeral: true
        });
      }
      
      // Mencari resep berdasarkan kata kunci
      const recipes = await searchRecipes(searchQuery);
      
      if (!recipes || recipes.length === 0) {
        return await interaction.editReply({
          content: `Tidak ditemukan resep untuk "${searchQuery}". Coba kata kunci lain.`,
          ephemeral: true
        });
      }
      
      // Ambil resep pertama untuk ditampilkan secara detail
      const firstRecipeDetails = await getRecipeDetails(recipes[0].url);
      
      // Buat embed untuk menampilkan resep
      const embed = createRecipeEmbed(recipes[0], firstRecipeDetails);
      
      // Buat tombol untuk membuka resep asli
      const buttons = createRecipeButtons(recipes);
      
      // Kirim respons dengan embed dan tombol
      await interaction.editReply({ 
        embeds: [embed],
        components: [buttons] 
      });
      
      logger.info(`User ${interaction.user.tag} searched for recipe: ${searchQuery}`);
    } catch (error) {
      logger.error(`Error executing resep command: ${error.message}`);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat mencari resep. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat mencari resep. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      }
    }
  }
};

/**
 * Mencari resep berdasarkan kata kunci
 * @param {string} query - Kata kunci pencarian
 * @returns {Array} - Array hasil pencarian resep
 */
async function searchRecipes(query) {
  try {
    // Membuat query URL dengan format yang benar
    const formattedQuery = encodeURIComponent(query);
    const searchUrl = `https://www.masakapahariini.com/resep/?s=${formattedQuery}`;
    
    // Fetch data menggunakan axios
    const response = await axios.get(searchUrl);
    
    if (response.status !== 200) {
      throw new Error(`Failed to search recipes, status code: ${response.status}`);
    }
    
    // Parsing halaman HTML dengan cheerio
    const $ = cheerio.load(response.data);
    const recipes = [];
    
    // Mencari artikel resep di halaman
    $('.post-card').each((index, element) => {
      if (recipes.length < 5) { // Batasi hanya 5 resep
        const titleElement = $(element).find('.post-card__title a').first();
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        
        let thumbnail = '';
        const imageElement = $(element).find('.post-card__thumbnail img').first();
        if (imageElement.length) {
          thumbnail = imageElement.attr('src') || imageElement.attr('data-src') || '';
        }
        
        let description = '';
        const metaElement = $(element).find('.post-card__meta').first();
        if (metaElement.length) {
          description = metaElement.text().trim();
        }
        
        if (title && url) {
          recipes.push({
            title,
            url,
            thumbnail,
            description: description || 'Klik untuk melihat detail resep'
          });
        }
      }
    });
    
    return recipes;
  } catch (error) {
    logger.error(`Error searching recipes: ${error.message}`);
    return [];
  }
}

/**
 * Mendapatkan detail resep dari URL
 * @param {string} url - URL resep
 * @returns {Object} - Detail resep
 */
async function getRecipeDetails(url) {
  try {
    // Fetch data menggunakan axios
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error(`Failed to get recipe details, status code: ${response.status}`);
    }
    
    // Parsing halaman HTML dengan cheerio
    const $ = cheerio.load(response.data);
    
    // Ambil informasi bahan
    const ingredients = [];
    $('.ingredient-groups .ingredient-item').each((index, element) => {
      const text = $(element).text().trim();
      if (text) ingredients.push(text);
    });
    
    // Ambil langkah-langkah
    const steps = [];
    $('.step-groups .step-item').each((index, element) => {
      const stepNumber = $(element).find('.step-number').text().trim();
      const stepText = $(element).find('.step-description').text().trim();
      if (stepNumber && stepText) steps.push(`${stepNumber} ${stepText}`);
    });
    
    // Ambil informasi waktu dan porsi
    let cookTime = '';
    let portion = '';
    
    $('.recipe-info__item').each((index, element) => {
      const label = $(element).find('.recipe-info__label').text().trim().toLowerCase();
      const value = $(element).find('.recipe-info__value').text().trim();
      
      if (label.includes('waktu')) {
        cookTime = value;
      } else if (label.includes('porsi')) {
        portion = value;
      }
    });
    
    return {
      ingredients,
      steps,
      cookTime,
      portion
    };
  } catch (error) {
    logger.error(`Error getting recipe details: ${error.message}`);
    return {
      ingredients: [],
      steps: [],
      cookTime: 'Tidak tersedia',
      portion: 'Tidak tersedia'
    };
  }
}

/**
 * Membuat embed untuk menampilkan resep
 * @param {Object} recipe - Data resep dasar
 * @param {Object} details - Detail resep
 * @returns {EmbedBuilder} - Embed untuk ditampilkan
 */
function createRecipeEmbed(recipe, details) {
  const embed = new EmbedBuilder()
    .setColor('#FF6F00')
    .setTitle(`🍽️ ${recipe.title}`)
    .setURL(recipe.url);
  
  if (recipe.thumbnail) {
    embed.setImage(recipe.thumbnail);
  }
  
  let infoText = '';
  if (details.cookTime) infoText += `⏱️ Waktu: ${details.cookTime}\n`;
  if (details.portion) infoText += `👥 Porsi: ${details.portion}\n`;
  
  embed.setDescription(infoText || recipe.description);
  
  // Tambahkan bahan-bahan
  if (details.ingredients && details.ingredients.length > 0) {
    const ingredientsText = details.ingredients
      .slice(0, Math.min(10, details.ingredients.length))
      .join('\n');
    
    embed.addFields({
      name: '📋 Bahan-bahan',
      value: ingredientsText || 'Klik tombol di bawah untuk melihat bahan lengkap'
    });
  }
  
  // Tambahkan langkah-langkah
  if (details.steps && details.steps.length > 0) {
    const stepsText = details.steps
      .slice(0, Math.min(5, details.steps.length))
      .join('\n');
    
    if (stepsText) {
      embed.addFields({
        name: '👨‍🍳 Cara Memasak',
        value: stepsText + (details.steps.length > 5 ? '\n*...dan langkah-langkah lainnya*' : '')
      });
    }
  }
  
  embed.setFooter({ 
    text: 'Sumber: masakapahariini.com • Diperbarui pada ' + new Date().toLocaleString('id-ID'),
  });
  
  return embed;
}

/**
 * Membuat tombol untuk link resep
 * @param {Array} recipes - Array data resep
 * @returns {ActionRowBuilder} - Action row dengan tombol
 */
function createRecipeButtons(recipes) {
  const row = new ActionRowBuilder();
  
  // Tambahkan tombol untuk resep pertama
  const mainButton = new ButtonBuilder()
    .setLabel(`Buka Resep Lengkap`)
    .setStyle(ButtonStyle.Link)
    .setURL(recipes[0].url)
    .setEmoji('🔗');
  
  row.addComponents(mainButton);
  
  // Tambahkan tombol untuk resep alternatif jika ada
  const maxButtons = Math.min(4, recipes.length - 1); // Max 5 tombol total, 1 sudah dipakai
  
  for (let i = 1; i <= maxButtons; i++) {
    const button = new ButtonBuilder()
      .setLabel(`Alternatif ${i}`)
      .setStyle(ButtonStyle.Link)
      .setURL(recipes[i].url);
    
    row.addComponents(button);
  }
  
  return row;
}
/**
 * Meme Command
 * 
 * Command untuk menampilkan meme acak dari Reddit.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Menampilkan meme acak'),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      // Fetch random meme from Reddit API
      const response = await axios.get('https://meme-api.herokuapp.com/gimme');
      const memeData = response.data;
      
      const memeEmbed = new EmbedBuilder()
        .setColor('#FF5700')
        .setTitle(memeData.title)
        .setURL(memeData.postLink)
        .setImage(memeData.url)
        .setFooter({ text: `👍 ${memeData.ups} | Dari r/${memeData.subreddit}` });
      
      await interaction.editReply({ embeds: [memeEmbed] });
      logger.info(`User ${interaction.user.tag} requested a meme`);
    } catch (error) {
      logger.error(`Error fetching meme: ${error.message}`);
      await interaction.editReply('Gagal mendapatkan meme. Silakan coba lagi nanti!');
    }
  }
};
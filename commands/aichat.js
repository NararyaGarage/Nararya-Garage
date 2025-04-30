/**
 * AI Chat Command
 * 
 * Command untuk berbicara dengan AI dalam semua bahasa.
 * Menggunakan API Perplexity AI.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aichat')
    .setDescription('Berbicara dengan AI dalam berbagai bahasa')
    .addStringOption(option => 
      option.setName('message')
        .setDescription('Pesan yang ingin disampaikan pada AI')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('model')
        .setDescription('Model AI yang ingin digunakan')
        .setRequired(false)
        .addChoices(
          { name: 'Llama 3.1 Sonar Small (Lebih cepat)', value: 'llama-3.1-sonar-small-128k-online' },
          { name: 'Llama 3.1 Sonar Large (Lebih pintar)', value: 'llama-3.1-sonar-large-128k-online' },
          { name: 'Llama 3.1 Sonar Huge (Terpintar)', value: 'llama-3.1-sonar-huge-128k-online' }
        )),
    
  async execute(interaction) {
    try {
      // Dapatkan options
      const message = interaction.options.getString('message');
      const model = interaction.options.getString('model') || 'llama-3.1-sonar-small-128k-online';
      
      // deferReply sudah dihandle oleh commandWrapper, jadi tidak perlu memanggil lagi di sini
      
      try {
        // Cek API key Perplexity
        const apiKey = process.env.PERPLEXITY_API_KEY;
        let response;
        
        // Jika API key tidak tersedia, gunakan mode fallback lokal
        if (!apiKey) {
          logger.info("PERPLEXITY_API_KEY tidak ditemukan, menggunakan AI chat lokal sebagai fallback");
          
          // Import modul chat AI lokal dari utils
          const { generateResponse } = require('../../utils/chat-engine');
          
          // Generate respons lokal
          const localResponse = generateResponse(message);
          
          // Format respons seperti API Perplexity
          response = {
            data: {
              choices: [
                {
                  message: {
                    content: localResponse
                  }
                }
              ],
              citations: []
            }
          };
        } else {
          // Jika API key tersedia, gunakan Perplexity API
          response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: model,
            messages: [
              {
                role: "system",
                content: "Kamu adalah asisten AI yang membantu pengguna dengan berbagai pertanyaan. Kamu bisa memahami dan menjawab pertanyaan dalam bahasa apapun yang ditanyakan oleh pengguna. Berikan jawaban yang singkat, jelas, dan akurat. Jika pengguna menanyakan sesuatu dalam bahasa selain Bahasa Indonesia, jawablah dalam bahasa yang sama."
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 2048,
            stream: false
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
        }
        
        if (response.data && response.data.choices && response.data.choices.length > 0) {
          const answer = response.data.choices[0].message.content;
          const citations = response.data.citations || [];
          
          // Split answer jika terlalu panjang
          const chunkSize = 4000;
          const answerChunks = [];
          
          for (let i = 0; i < answer.length; i += chunkSize) {
            answerChunks.push(answer.substring(i, i + chunkSize));
          }
          
          // Buat embed untuk jawaban
          const embed = new EmbedBuilder()
            .setTitle('🤖 AI Chat')
            .setDescription(answerChunks[0])
            .setColor('#FF6200')
            .addFields(
              { 
                name: 'Pesan Anda', 
                value: message.length > 1024 ? message.substring(0, 1021) + '...' : message, 
                inline: false 
              }
            )
            .setFooter({ 
              text: `Model: ${model} | 𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁`,
              iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
            })
            .setTimestamp();
          
          // Tambahkan sumber jika ada
          if (citations && citations.length > 0) {
            let sources = "";
            for (let i = 0; i < Math.min(citations.length, 5); i++) {
              sources += `[${i+1}] ${citations[i]}\n`;
            }
            
            if (sources) {
              embed.addFields({
                name: 'Sumber',
                value: sources.substring(0, 1024),
                inline: false
              });
            }
          }
          
          await interaction.followUp({ embeds: [embed] });
          
          // Kirim chunk tambahan jika jawaban terlalu panjang
          if (answerChunks.length > 1) {
            for (let i = 1; i < answerChunks.length; i++) {
              const continuationEmbed = new EmbedBuilder()
                .setTitle(`🤖 AI Chat (Lanjutan ${i+1}/${answerChunks.length})`)
                .setDescription(answerChunks[i])
                .setColor('#FF6200');
              
              await interaction.followUp({ embeds: [continuationEmbed] });
            }
          }
          
          // Tambahkan button "Tanya lebih lanjut"
          const button = new ButtonBuilder()
            .setCustomId(`aichat_continue_${interaction.id}`)
            .setLabel('Tanya Lebih Lanjut')
            .setStyle(ButtonStyle.Primary);
          
          const row = new ActionRowBuilder().addComponents(button);
          
          await interaction.followUp({
            content: '🔍 Ingin melanjutkan percakapan? Klik tombol di bawah untuk bertanya lebih lanjut.',
            components: [row]
          });
          
          return;
        } else {
          throw new Error('Tidak ada jawaban dari API');
        }
      } catch (apiError) {
        logger.error('Error using Perplexity AI API:', apiError);
        
        return interaction.followUp({
          content: `⚠️ Terjadi kesalahan saat berkomunikasi dengan AI. Silakan coba lagi nanti. Error: ${apiError.message}`
        });
      }
    } catch (error) {
      logger.error('Error executing aichat command:', error);
      
      if (interaction.deferred) {
        return interaction.followUp({
          content: '❌ Terjadi kesalahan saat memproses permintaan AI chat.'
        });
      } else {
        return interaction.reply({
          content: '❌ Terjadi kesalahan saat memproses permintaan AI chat.',
          ephemeral: true
        });
      }
    }
  }
};
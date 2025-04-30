/**
 * Translate Command
 * 
 * Command untuk menerjemahkan teks dari satu bahasa ke bahasa lain.
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

// Daftar kode bahasa yang didukung
const supportedLanguages = {
  'id': 'Indonesia',
  'en': 'Inggris',
  'ja': 'Jepang',
  'ko': 'Korea',
  'zh': 'Mandarin',
  'ms': 'Melayu',
  'ar': 'Arab',
  'fr': 'Perancis',
  'de': 'Jerman',
  'es': 'Spanyol',
  'it': 'Italia',
  'nl': 'Belanda',
  'pt': 'Portugis',
  'ru': 'Rusia',
  'th': 'Thailand',
  'vi': 'Vietnam'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Menerjemahkan teks dari satu bahasa ke bahasa lain')
    .addStringOption(option => 
      option.setName('text')
        .setDescription('Teks yang ingin diterjemahkan')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('to')
        .setDescription('Bahasa tujuan (kode bahasa: en, id, ja, ko, dll)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('from')
        .setDescription('Bahasa sumber (kode bahasa, jika dibiarkan kosong akan otomatis terdeteksi)')
        .setRequired(false)),
    
  async execute(interaction) {
    try {
      // Dapatkan options
      const text = interaction.options.getString('text');
      const targetLang = interaction.options.getString('to').toLowerCase();
      const sourceLang = interaction.options.getString('from')?.toLowerCase() || 'auto';
      
      // Defer reply karena terjemahan bisa memakan waktu
      await interaction.deferReply();
      
      // Validasi bahasa target
      if (targetLang !== 'auto' && !supportedLanguages[targetLang]) {
        return interaction.followUp({
          content: `❌ Bahasa tujuan tidak valid. Gunakan salah satu kode bahasa berikut: ${Object.keys(supportedLanguages).join(', ')}`
        });
      }
      
      // Validasi bahasa sumber jika ditentukan
      if (sourceLang !== 'auto' && !supportedLanguages[sourceLang]) {
        return interaction.followUp({
          content: `❌ Bahasa sumber tidak valid. Gunakan salah satu kode bahasa berikut: ${Object.keys(supportedLanguages).join(', ')}`
        });
      }
      
      try {
        // Gunakan Google Translate API (melalui libretranslate.de untuk versi gratis)
        const response = await axios.post('https://libretranslate.de/translate', {
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.translatedText) {
          // Buat embed untuk hasil terjemahan
          const embed = new EmbedBuilder()
            .setTitle('🌐 Hasil Terjemahan')
            .setColor('#FF6200')
            .addFields(
              { 
                name: `${sourceLang === 'auto' ? 'Terdeteksi' : supportedLanguages[sourceLang] || sourceLang}`, 
                value: text, 
                inline: false 
              },
              { 
                name: `${supportedLanguages[targetLang] || targetLang}`, 
                value: response.data.translatedText, 
                inline: false 
              }
            )
            .setFooter({ 
              text: `𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁`,
              iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
            })
            .setTimestamp();
          
          return interaction.followUp({ embeds: [embed] });
        } else {
          throw new Error('Tidak ada hasil terjemahan');
        }
      } catch (apiError) {
        logger.error('Error using LibreTranslate API:', apiError);
        
        // Fallback terjemahan menggunakan Google Translate URL
        const googleTranslateUrl = `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(text)}`;
        
        return interaction.followUp({
          content: `⚠️ Terjadi kesalahan saat menerjemahkan. Silakan coba di Google Translate:\n${googleTranslateUrl}`
        });
      }
    } catch (error) {
      logger.error('Error executing translate command:', error);
      
      if (interaction.deferred) {
        return interaction.followUp({
          content: '❌ Terjadi kesalahan saat menerjemahkan teks.'
        });
      } else {
        return interaction.reply({
          content: '❌ Terjadi kesalahan saat menerjemahkan teks.',
          ephemeral: true
        });
      }
    }
  }
};
/**
 * Currency Converter Command
 * 
 * Command untuk konversi mata uang (misalnya IDR ke USD).
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

// Daftar mata uang yang didukung
const supportedCurrencies = {
  'IDR': 'Indonesian Rupiah',
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'JPY': 'Japanese Yen',
  'GBP': 'British Pound',
  'AUD': 'Australian Dollar',
  'CAD': 'Canadian Dollar',
  'SGD': 'Singapore Dollar',
  'MYR': 'Malaysian Ringgit',
  'CNY': 'Chinese Yuan',
  'KRW': 'South Korean Won',
  'INR': 'Indian Rupee',
  'THB': 'Thai Baht',
  'VND': 'Vietnamese Dong',
  'PHP': 'Philippine Peso'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('currency')
    .setDescription('Mengkonversi nilai mata uang ke mata uang lain')
    .addNumberOption(option => 
      option.setName('amount')
        .setDescription('Jumlah yang ingin dikonversi')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('from')
        .setDescription('Mata uang asal (contoh: IDR, USD)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('to')
        .setDescription('Mata uang tujuan (contoh: USD, IDR)')
        .setRequired(true)),
    
  async execute(interaction) {
    try {
      // Dapatkan options
      const amount = interaction.options.getNumber('amount');
      const fromCurrency = interaction.options.getString('from').toUpperCase();
      const toCurrency = interaction.options.getString('to').toUpperCase();
      
      // Defer reply karena API request bisa memakan waktu
      await interaction.deferReply();
      
      // Validasi mata uang asal
      if (!supportedCurrencies[fromCurrency]) {
        return interaction.followUp({
          content: `❌ Mata uang asal tidak valid. Gunakan salah satu kode mata uang berikut: ${Object.keys(supportedCurrencies).join(', ')}`
        });
      }
      
      // Validasi mata uang tujuan
      if (!supportedCurrencies[toCurrency]) {
        return interaction.followUp({
          content: `❌ Mata uang tujuan tidak valid. Gunakan salah satu kode mata uang berikut: ${Object.keys(supportedCurrencies).join(', ')}`
        });
      }
      
      try {
        // Gunakan API Exchange Rates untuk mendapatkan nilai konversi
        const apiKey = process.env.EXCHANGE_RATES_API_KEY || 'fallback_key'; // Idealnya menggunakan API key
        const response = await axios.get(`https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`);
        
        if (response.data && response.data.result) {
          const result = response.data.result;
          const rate = response.data.info.rate;
          
          // Format result dengan memperhatikan mata uang
          let formattedResult = '';
          
          // Menambahkan format sesuai mata uang
          if (toCurrency === 'IDR') {
            formattedResult = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(result);
          } else if (toCurrency === 'USD') {
            formattedResult = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result);
          } else if (toCurrency === 'EUR') {
            formattedResult = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(result);
          } else if (toCurrency === 'JPY') {
            formattedResult = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(result);
          } else {
            formattedResult = new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: toCurrency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(result);
          }
          
          // Format amount dengan format mata uang asal
          let formattedAmount = '';
          if (fromCurrency === 'IDR') {
            formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
          } else if (fromCurrency === 'USD') {
            formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
          } else if (fromCurrency === 'EUR') {
            formattedAmount = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
          } else if (fromCurrency === 'JPY') {
            formattedAmount = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
          } else {
            formattedAmount = new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: fromCurrency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(amount);
          }
          
          // Buat embed untuk hasil konversi
          const embed = new EmbedBuilder()
            .setTitle('💱 Hasil Konversi Mata Uang')
            .setColor('#FF6200')
            .addFields(
              { 
                name: 'Konversi', 
                value: `${formattedAmount} ➡️ ${formattedResult}`, 
                inline: false 
              },
              { 
                name: 'Kurs Tukar', 
                value: `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`, 
                inline: true 
              },
              {
                name: 'Waktu', 
                value: new Date().toLocaleString('id-ID'), 
                inline: true
              }
            )
            .setFooter({ 
              text: `𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁`,
              iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
            })
            .setTimestamp();
          
          return interaction.followUp({ embeds: [embed] });
        } else {
          throw new Error('Tidak ada hasil konversi');
        }
      } catch (apiError) {
        logger.error('Error using exchange rate API:', apiError);
        
        return interaction.followUp({
          content: `⚠️ Terjadi kesalahan saat konversi mata uang. Silakan coba lagi nanti.`
        });
      }
    } catch (error) {
      logger.error('Error executing currency command:', error);
      
      if (interaction.deferred) {
        return interaction.followUp({
          content: '❌ Terjadi kesalahan saat konversi mata uang.'
        });
      } else {
        return interaction.reply({
          content: '❌ Terjadi kesalahan saat konversi mata uang.',
          ephemeral: true
        });
      }
    }
  }
};
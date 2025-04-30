/**
 * Transfer Command
 * 
 * Command untuk mentransfer NGC (Nararya Garage Currency) ke pengguna lain.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');

// File untuk data ekonomi
const economyFilePath = path.join(__dirname, '..', '..', 'data', 'economy.json');

// Pastikan folder data ada
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file ekonomi ada
if (!fs.existsSync(economyFilePath)) {
  fs.writeFileSync(economyFilePath, JSON.stringify({ users: {} }, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfer NGC ke pengguna lain')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User yang akan menerima NGC')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Jumlah NGC yang akan ditransfer')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('pesan')
        .setDescription('Pesan untuk penerima (opsional)')
        .setRequired(false)),
        
  async execute(interaction) {
    try {
      const recipient = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      const message = interaction.options.getString('pesan') || 'Tidak ada pesan';
      const sender = interaction.user;
      
      // Validasi penerima
      if (recipient.bot) {
        return interaction.reply({
          content: 'Kamu tidak bisa mentransfer NGC ke bot.',
          ephemeral: true
        });
      }
      
      if (recipient.id === sender.id) {
        return interaction.reply({
          content: 'Kamu tidak bisa mentransfer NGC ke dirimu sendiri.',
          ephemeral: true
        });
      }
      
      // Validasi jumlah
      if (amount <= 0) {
        return interaction.reply({
          content: 'Jumlah transfer harus lebih dari 0 NGC.',
          ephemeral: true
        });
      }
      
      // Baca data ekonomi
      const economyData = JSON.parse(fs.readFileSync(economyFilePath, 'utf8'));
      
      // Pastikan data pengirim ada
      if (!economyData.users[sender.id]) {
        economyData.users[sender.id] = {
          balance: 100,
          inventory: {},
          transactions: []
        };
      }
      
      // Pastikan data penerima ada
      if (!economyData.users[recipient.id]) {
        economyData.users[recipient.id] = {
          balance: 100,
          inventory: {},
          transactions: []
        };
      }
      
      // Cek saldo pengirim
      const senderBalance = economyData.users[sender.id].balance;
      
      if (senderBalance < amount) {
        return interaction.reply({
          content: `Saldo tidak mencukupi. Saldo kamu saat ini: ${senderBalance} NGC.`,
          ephemeral: true
        });
      }
      
      // Proses transfer
      const transferFee = Math.ceil(amount * 0.05); // 5% biaya transfer
      const amountAfterFee = amount - transferFee;
      
      economyData.users[sender.id].balance -= amount;
      economyData.users[recipient.id].balance += amountAfterFee;
      
      // Catat transaksi untuk pengirim
      economyData.users[sender.id].transactions.push({
        type: 'transfer_out',
        to: recipient.id,
        toUsername: recipient.username,
        amount: amount,
        fee: transferFee,
        message: message,
        date: new Date().toISOString()
      });
      
      // Catat transaksi untuk penerima
      economyData.users[recipient.id].transactions.push({
        type: 'transfer_in',
        from: sender.id,
        fromUsername: sender.username,
        amount: amountAfterFee,
        originalAmount: amount,
        fee: transferFee,
        message: message,
        date: new Date().toISOString()
      });
      
      // Simpan data ekonomi
      fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
      
      // Buat embed untuk konfirmasi
      const embed = new EmbedBuilder()
        .setTitle('💸 Transfer NGC Berhasil')
        .setDescription(`Kamu telah berhasil mentransfer NGC ke ${recipient.username}`)
        .setColor('#2ecc71')
        .addFields(
          { name: 'Penerima', value: recipient.username, inline: true },
          { name: 'Jumlah Transfer', value: `${amount} NGC`, inline: true },
          { name: 'Biaya Transfer (5%)', value: `${transferFee} NGC`, inline: true },
          { name: 'Jumlah Diterima', value: `${amountAfterFee} NGC`, inline: true },
          { name: 'Saldo Tersisa', value: `${economyData.users[sender.id].balance} NGC`, inline: true },
          { name: 'Pesan', value: message }
        )
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Kirim konfirmasi ke pengirim
      await interaction.reply({ embeds: [embed] });
      
      // Buat embed untuk notifikasi ke penerima
      const recipientEmbed = new EmbedBuilder()
        .setTitle('💰 Transfer NGC Diterima')
        .setDescription(`Kamu menerima transfer NGC dari ${sender.username}`)
        .setColor('#3498db')
        .addFields(
          { name: 'Pengirim', value: sender.username, inline: true },
          { name: 'Jumlah Diterima', value: `${amountAfterFee} NGC`, inline: true },
          { name: 'Saldo Sekarang', value: `${economyData.users[recipient.id].balance} NGC`, inline: true },
          { name: 'Pesan', value: message }
        )
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Coba kirim notifikasi ke penerima jika penerima ada di server yang sama
      try {
        const recipientMember = await interaction.guild.members.fetch(recipient.id);
        await recipientMember.send({ embeds: [recipientEmbed] });
      } catch (error) {
        logger.warn(`Tidak bisa mengirim notifikasi ke penerima: ${recipient.username}`, error);
      }
      
    } catch (error) {
      logger.error('Error in transfer command:', error);
      await interaction.reply({
        content: 'Terjadi kesalahan saat memproses transfer.',
        ephemeral: true
      });
    }
  }
};
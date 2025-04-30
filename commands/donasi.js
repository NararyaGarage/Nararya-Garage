/**
 * Donasi Command
 * 
 * Command untuk melakukan donasi ke server.
 * Memberikan informasi cara donasi dan mencatat donasi yang dilakukan.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('../../config');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('donasi')
    .setDescription('Informasi cara berdonasi dan mendukung server')
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Informasi tentang cara melakukan donasi'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('submit')
        .setDescription('Submit bukti donasi untuk mendapatkan role donatur')),
  
  /**
   * Eksekusi command
   * @param {Interaction} interaction - Interaction object
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'info') {
      await showDonationInfo(interaction);
    } else if (subcommand === 'submit') {
      await handleDonationSubmit(interaction);
    }
  },
  
  /**
   * Menangani button di embed donasi
   * @param {ButtonInteraction} interaction - Button interaction
   */
  async handleButton(interaction) {
    const { customId } = interaction;
    
    if (customId === 'donasi_submit') {
      await showDonationSubmitModal(interaction);
    } else if (customId === 'donasi_faq') {
      await showDonationFAQ(interaction);
    }
  },
  
  /**
   * Menangani modal submission donasi
   * @param {ModalSubmitInteraction} interaction - Modal interaction
   */
  async handleModalSubmit(interaction) {
    if (interaction.customId === 'donasi_modal') {
      await processDonationSubmission(interaction);
    }
  }
};

/**
 * Menampilkan informasi donasi
 * @param {Interaction} interaction - Interaction object
 */
async function showDonationInfo(interaction) {
  const donasiEmbed = new EmbedBuilder()
    .setColor('#ffd700')
    .setTitle('🎁 Donasi untuk Nararya Garage')
    .setDescription('Dukung komunitas JKT48 di server Discord kami dengan donasi. Donasi Anda akan digunakan untuk pengembangan server, event, dan aktivitas komunitas.')
    .addFields(
      { 
        name: '💰 Cara Berdonasi', 
        value: `Anda dapat berdonasi melalui:
                
• DANA: 08123456789 (a.n. Nararya Garage)
• OVO: 08123456789 (a.n. Nararya Garage)
• GoPay: 08123456789 (a.n. Nararya Garage)
• Bank BCA: 1234567890 (a.n. Nararya Garage)
                
Minimal Donasi: Rp25.000` 
      },
      { 
        name: '✨ Benefit Donatur', 
        value: `• Role spesial Donatur dengan warna emas
• Akses ke channel eksklusif donatur
• Prioritas dalam giveaway dan event
• Kesempatan VIP pada event meet & greet
• Badge spesial di profil server` 
      },
      { 
        name: '📝 Cara Mendapatkan Role', 
        value: 'Setelah melakukan donasi, klik tombol "Submit Bukti Donasi" di bawah dan isi formulirnya. Admin akan memverifikasi dan memberikan role dalam 1x24 jam.' 
      }
    )
    .setFooter({ text: 'Donasi Anda sangat berarti untuk komunitas JKT48 kami! 💕' })
    .setTimestamp();
  
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('donasi_submit')
        .setLabel('Submit Bukti Donasi')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId('donasi_faq')
        .setLabel('FAQ Donasi')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❓')
    );
  
  await interaction.reply({
    embeds: [donasiEmbed],
    components: [row],
    ephemeral: false
  });
}

/**
 * Menampilkan modal submission donasi
 * @param {ButtonInteraction} interaction - Button interaction
 */
async function showDonationSubmitModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('donasi_modal')
    .setTitle('Submit Bukti Donasi');
  
  const amountInput = new TextInputBuilder()
    .setCustomId('donasi_amount')
    .setLabel('Jumlah Donasi (dalam Rupiah)')
    .setPlaceholder('contoh: 50000')
    .setMinLength(5)
    .setMaxLength(10)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  
  const methodInput = new TextInputBuilder()
    .setCustomId('donasi_method')
    .setLabel('Metode Pembayaran')
    .setPlaceholder('DANA/OVO/GoPay/BCA/dll')
    .setMinLength(3)
    .setMaxLength(50)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  
  const senderInput = new TextInputBuilder()
    .setCustomId('donasi_sender')
    .setLabel('Nama Pengirim')
    .setPlaceholder('Nama akun/rekening pengirim')
    .setMinLength(3)
    .setMaxLength(100)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  
  const proofInput = new TextInputBuilder()
    .setCustomId('donasi_proof')
    .setLabel('Bukti Transfer (URL gambar)')
    .setPlaceholder('URL screenshot/foto bukti transfer')
    .setMinLength(10)
    .setMaxLength(500)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);
  
  const noteInput = new TextInputBuilder()
    .setCustomId('donasi_note')
    .setLabel('Catatan (opsional)')
    .setPlaceholder('Tambahan informasi jika diperlukan')
    .setMinLength(0)
    .setMaxLength(200)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);
  
  modal.addComponents(
    new ActionRowBuilder().addComponents(amountInput),
    new ActionRowBuilder().addComponents(methodInput),
    new ActionRowBuilder().addComponents(senderInput),
    new ActionRowBuilder().addComponents(proofInput),
    new ActionRowBuilder().addComponents(noteInput)
  );
  
  await interaction.showModal(modal);
}

/**
 * Menampilkan FAQ donasi
 * @param {ButtonInteraction} interaction - Button interaction
 */
async function showDonationFAQ(interaction) {
  const faqEmbed = new EmbedBuilder()
    .setColor('#f0c43f')
    .setTitle('❓ FAQ Donasi')
    .setDescription('Pertanyaan yang sering ditanyakan seputar donasi')
    .addFields(
      { 
        name: '💰 Berapa minimum donasi?', 
        value: 'Minimum donasi adalah Rp25.000 untuk mendapatkan role Donatur.' 
      },
      { 
        name: '⏱️ Berapa lama role Donatur bertahan?', 
        value: 'Role Donatur akan bertahan selamanya. Sekali Anda mendapatkannya, role akan tetap ada di akun Anda.' 
      },
      { 
        name: '🔄 Bagaimana jika saya ingin upgrade role?', 
        value: 'Jika Anda ingin upgrade ke role Donatur tier yang lebih tinggi, Anda bisa donasi lagi dengan jumlah yang sesuai. Admin akan mengupgrade role Anda.' 
      },
      { 
        name: '🌟 Apa saja tier Donatur?', 
        value: `• Donatur Bronze: Rp25.000 - Rp99.999
• Donatur Silver: Rp100.000 - Rp249.999
• Donatur Gold: Rp250.000 - Rp499.999
• Donatur Platinum: Rp500.000+` 
      },
      { 
        name: '🔒 Apakah data donasi saya aman?', 
        value: 'Ya, data donasi Anda akan disimpan secara privat dan hanya bisa dilihat oleh admin server. Kami tidak akan menyebarkan data personal Anda.' 
      }
    )
    .setFooter({ text: 'Untuk pertanyaan lain, silakan hubungi admin server' })
    .setTimestamp();
  
  await interaction.reply({
    embeds: [faqEmbed],
    ephemeral: true
  });
}

/**
 * Menangani submission bukti donasi
 * @param {ModalSubmitInteraction} interaction - Modal interaction
 */
async function processDonationSubmission(interaction) {
  try {
    // Extract values from the modal
    const amount = interaction.fields.getTextInputValue('donasi_amount');
    const method = interaction.fields.getTextInputValue('donasi_method');
    const sender = interaction.fields.getTextInputValue('donasi_sender');
    const proof = interaction.fields.getTextInputValue('donasi_proof');
    const note = interaction.fields.getTextInputValue('donasi_note') || 'Tidak ada catatan';
    
    // Send confirmation to user
    const userEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Bukti Donasi Terkirim')
      .setDescription('Terima kasih atas donasi Anda! Bukti donasi telah dikirim ke admin untuk verifikasi.')
      .addFields(
        { name: 'Jumlah', value: `Rp${amount}` },
        { name: 'Metode Pembayaran', value: method },
        { name: 'Status', value: '⏳ Menunggu verifikasi admin (1x24 jam)' }
      )
      .setFooter({ text: 'Nararya Garage - Donasi System' })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [userEmbed],
      ephemeral: true
    });
    
    // Send to admin channel for verification
    if (config.channels && config.channels.donationLog) {
      const adminChannel = interaction.client.channels.cache.get(config.channels.donationLog);
      
      if (adminChannel) {
        const adminEmbed = new EmbedBuilder()
          .setColor('#ffd700')
          .setTitle('💰 Donasi Baru!')
          .setDescription(`<@${interaction.user.id}> telah mengirimkan bukti donasi untuk diverifikasi`)
          .addFields(
            { name: 'User', value: `<@${interaction.user.id}> (${interaction.user.tag})` },
            { name: 'Jumlah', value: `Rp${amount}` },
            { name: 'Metode Pembayaran', value: method },
            { name: 'Nama Pengirim', value: sender },
            { name: 'Catatan', value: note },
            { name: 'Tier yang Direkomendasikan', value: getTierFromAmount(parseInt(amount)) },
            { name: 'Bukti Transfer', value: proof }
          )
          .setImage(proof)
          .setFooter({ text: `User ID: ${interaction.user.id}` })
          .setTimestamp();
        
        const buttonRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`donasi_approve_${interaction.user.id}`)
              .setLabel('Approve')
              .setStyle(ButtonStyle.Success)
              .setEmoji('✅'),
            new ButtonBuilder()
              .setCustomId(`donasi_deny_${interaction.user.id}`)
              .setLabel('Deny')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('❌')
          );
        
        await adminChannel.send({
          content: `<@&${config.roles.admin}> Donasi baru membutuhkan verifikasi.`,
          embeds: [adminEmbed],
          components: [buttonRow]
        });
        
        logger.info(`Donasi submission from ${interaction.user.tag} (${amount}): Waiting for verification`);
      }
    }
  } catch (error) {
    logger.error(`Error processing donation submission: ${error.message}`);
    
    await interaction.reply({
      content: '❌ Terjadi kesalahan dalam memproses bukti donasi. Silakan coba lagi atau hubungi admin.',
      ephemeral: true
    });
  }
}

/**
 * Menentukan tier donasi berdasarkan jumlah
 * @param {number} amount - Jumlah donasi
 * @returns {string} Tier donasi
 */
function getTierFromAmount(amount) {
  if (amount >= 500000) {
    return 'Donatur Platinum 💎';
  } else if (amount >= 250000) {
    return 'Donatur Gold 🥇';
  } else if (amount >= 100000) {
    return 'Donatur Silver 🥈';
  } else {
    return 'Donatur Bronze 🥉';
  }
}

/**
 * Handle donasi submit from command
 * @param {Interaction} interaction - Interaction object
 */
async function handleDonationSubmit(interaction) {
  await showDonationSubmitModal(interaction);
}
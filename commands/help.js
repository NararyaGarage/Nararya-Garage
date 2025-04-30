const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Menampilkan informasi bantuan untuk menggunakan bot')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Kategori perintah yang ingin ditampilkan')
        .setRequired(false)
        .addChoices(
          { name: 'Info', value: 'info' },
          { name: 'Member', value: 'member' },
          { name: 'Games', value: 'games' },
          { name: 'Notifications', value: 'notifications' },
          { name: 'Moderation', value: 'moderation' },
          { name: 'Tickets', value: 'tickets' },
          { name: 'Music', value: 'music' },
          { name: 'Media', value: 'media' },
          { name: 'Utilities', value: 'utilities' }
        )),

  async execute(interaction, client) {
    const category = interaction.options.getString('category');
    
    if (category) {
      return sendCategoryHelp(interaction, category);
    } else {
      return sendMainHelp(interaction, client);
    }
  },
};

/**
 * Send the main help menu
 * @param {CommandInteraction} interaction - Interaction object
 * @param {Client} client - Discord client
 */
async function sendMainHelp(interaction, client) {
  try {
    // Main help embed
    const helpEmbed = createEmbed()
      .setTitle(`${config.emojis.info} Bantuan Bot ${config.botInfo.name}`)
      .setDescription(`
Selamat datang di menu bantuan ${config.botInfo.name}!
Bot ini dibuat untuk menghadirkan pengalaman JKT48 terbaik di server Discord Anda.

**Fitur Utama**
• Notifikasi live dan aktivitas JKT48
• Informasi dan game terkait JKT48
• Moderation tools dan ticket system
• Media utilities dan downloadable content
• Dan banyak lagi!

**Cara Penggunaan**
Gunakan dropdown menu di bawah untuk melihat perintah berdasarkan kategori.

**Support**
Join server komunitas kami: [${config.botInfo.inviteLink}](${config.botInfo.inviteLink})
      `)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }));

    // Create dropdown menu for categories
    const selectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_category_select')
          .setPlaceholder('Pilih kategori perintah')
          .addOptions([
            {
              label: 'Info & Status',
              description: 'Informasi tentang bot dan status operasional',
              value: 'info',
              emoji: '📊'
            },
            {
              label: 'Member JKT48',
              description: 'Informasi tentang member JKT48',
              value: 'member',
              emoji: '👤'
            },
            {
              label: 'Games',
              description: 'Game interaktif terkait JKT48',
              value: 'games',
              emoji: '🎮'
            },
            {
              label: 'Notifikasi',
              description: 'Notifikasi live dan aktivitas JKT48',
              value: 'notifications',
              emoji: '🔔'
            },
            {
              label: 'Moderasi',
              description: 'Perintah moderasi untuk server',
              value: 'moderation',
              emoji: '🛡️'
            },
            {
              label: 'Tiket',
              description: 'Sistem tiket untuk bantuan',
              value: 'tickets',
              emoji: '🎫'
            },
            {
              label: 'Musik',
              description: 'Perintah terkait musik & audio',
              value: 'music',
              emoji: '🎵'
            },
            {
              label: 'Media',
              description: 'Perintah untuk media & download',
              value: 'media',
              emoji: '📥'
            },
            {
              label: 'Utilitas',
              description: 'Perintah utilitas & lainnya',
              value: 'utilities',
              emoji: '🔧'
            }
          ])
      );

    // Additional info embed
    const statsEmbed = createEmbed()
      .setTitle(`${config.emojis.info} Informasi Bot`)
      .addFields(
        { name: '🤖 Versi', value: config.botInfo.version, inline: true },
        { name: '📡 Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: '🏘️ Server', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Users', value: `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`, inline: true },
        { name: '⌚ Uptime', value: formatUptime(client.uptime), inline: true },
        { name: '👨‍💻 Developer', value: config.botInfo.author, inline: true }
      );

    // Send the help menu with the select menu
    await interaction.reply({
      embeds: [helpEmbed, statsEmbed],
      components: [selectMenu]
    });
  } catch (error) {
    console.error('Error sending help menu:', error);
    await interaction.reply({
      content: 'Terjadi kesalahan saat menampilkan menu bantuan.',
      ephemeral: true
    });
  }
}

/**
 * Send help for a specific category
 * @param {CommandInteraction} interaction - Interaction object
 * @param {string} category - Command category
 */
async function sendCategoryHelp(interaction, category) {
  try {
    // Dynamic title and description based on category
    let title, description, commands;
    
    switch (category) {
      case 'info':
        title = `${config.emojis.info} Informasi & Status Commands`;
        description = 'Perintah untuk mendapatkan informasi tentang bot dan status.';
        commands = [
          { name: '/help', description: 'Menampilkan menu bantuan ini' },
          { name: '/botstatus', description: 'Menampilkan status bot' },
          { name: '/botversion', description: 'Menampilkan versi bot' }
        ];
        break;
        
      case 'member':
        title = `${config.emojis.heart} Member JKT48 Commands`;
        description = 'Perintah untuk mendapatkan informasi tentang member JKT48.';
        commands = [
          { name: '/allmemberjkt48', description: 'Menampilkan daftar semua member JKT48' },
          { name: '/birthdaymemberjkt48', description: 'Menampilkan member yang berulang tahun' },
          { name: '/graduatedmemberjkt48', description: 'Menampilkan daftar member graduated' }
        ];
        break;
        
      case 'games':
        title = `${config.emojis.game} Games Commands`;
        description = 'Perintah game interaktif terkait JKT48.';
        commands = [
          { name: '/tebaknamajkt48', description: 'Game tebak nama member JKT48' },
          { name: '/tebaklagujkt48', description: 'Game tebak lagu JKT48' },
          { name: '/gachamemberjkt48', description: 'Gacha member JKT48' }
        ];
        break;
        
      case 'notifications':
        title = `${config.emojis.live} Notifikasi Commands`;
        description = 'Perintah untuk melihat live dan notifikasi JKT48.';
        commands = [
          { name: '/livememberjkt48', description: 'Menampilkan member yang sedang live' },
          { name: '/recentlivememberjkt48', description: 'Menampilkan live terbaru' },
          { name: '/theaterjkt48', description: 'Menampilkan jadwal teater' }
        ];
        break;
        
      case 'moderation':
        title = `${config.emojis.warning} Moderasi Commands`;
        description = 'Perintah untuk moderasi server (hanya untuk staff).';
        commands = [
          { name: '/ban', description: 'Ban user dari server' },
          { name: '/kick', description: 'Kick user dari server' },
          { name: '/mute', description: 'Mute user dalam server' },
          { name: '/clear', description: 'Hapus pesan dalam channel' }
        ];
        break;
        
      case 'tickets':
        title = `${config.emojis.ticket} Tiket Commands`;
        description = 'Perintah untuk sistem tiket bantuan.';
        commands = [
          { name: '/createticket setup', description: 'Setup sistem tiket dalam channel' },
          { name: '/createticket close', description: 'Tutup tiket yang ada' }
        ];
        break;
        
      case 'music':
        title = `${config.emojis.music} Musik Commands`;
        description = 'Perintah untuk musik dan audio.';
        commands = [
          { name: '/play', description: 'Putar musik dari link atau file' },
          { name: '/pause', description: 'Jeda pemutaran musik' },
          { name: '/resume', description: 'Lanjutkan pemutaran musik' },
          { name: '/stop', description: 'Hentikan pemutaran musik' },
          { name: '/queue', description: 'Lihat antrian musik' }
        ];
        break;
        
      case 'media':
        title = `📥 Media Commands`;
        description = 'Perintah untuk media dan download.';
        commands = [
          { name: '/download', description: 'Download media dari link' },
          { name: '/downloadfoto', description: 'Download foto dengan opsi kualitas' },
          { name: '/downloadvideo', description: 'Download video dengan opsi kualitas' },
          { name: '/downloadlagu', description: 'Download lagu dengan opsi format' },
          { name: '/removebg', description: 'Hapus background dari gambar' }
        ];
        break;
        
      case 'utilities':
        title = `${config.emojis.info} Utilitas Commands`;
        description = 'Perintah utilitas dan lainnya.';
        commands = [
          { name: '/waktuindonesia', description: 'Menampilkan waktu di kota Indonesia' },
          { name: '/cuacaindonesia', description: 'Menampilkan cuaca di kota Indonesia' },
          { name: '/translate', description: 'Menerjemahkan teks ke bahasa lain' },
          { name: '/calculate', description: 'Kalkulator matematika/fisika' }
        ];
        break;
        
      default:
        title = `${config.emojis.info} Bantuan Command`;
        description = 'Daftar perintah yang tersedia.';
        commands = [
          { name: '/help', description: 'Menampilkan menu bantuan' }
        ];
    }
    
    // Create embed for the category
    const embed = createEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor(config.embeds.color);
    
    // Add commands to the embed
    commands.forEach(cmd => {
      embed.addFields({ name: cmd.name, value: cmd.description });
    });
    
    // Add a back button as a select menu
    const backButton = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_category_back')
          .setPlaceholder('Kembali ke menu utama atau pilih kategori lain')
          .addOptions([
            {
              label: 'Kembali ke Menu Utama',
              description: 'Kembali ke menu bantuan utama',
              value: 'main',
              emoji: '🏠'
            },
            {
              label: 'Info & Status',
              description: 'Informasi tentang bot dan status operasional',
              value: 'info',
              emoji: '📊'
            },
            {
              label: 'Member JKT48',
              description: 'Informasi tentang member JKT48',
              value: 'member',
              emoji: '👤'
            },
            {
              label: 'Games',
              description: 'Game interaktif terkait JKT48',
              value: 'games',
              emoji: '🎮'
            },
            {
              label: 'Notifikasi',
              description: 'Notifikasi live dan aktivitas JKT48',
              value: 'notifications',
              emoji: '🔔'
            },
            {
              label: 'Moderasi',
              description: 'Perintah moderasi untuk server',
              value: 'moderation',
              emoji: '🛡️'
            },
            {
              label: 'Tiket',
              description: 'Sistem tiket untuk bantuan',
              value: 'tickets',
              emoji: '🎫'
            },
            {
              label: 'Musik',
              description: 'Perintah terkait musik & audio',
              value: 'music',
              emoji: '🎵'
            },
            {
              label: 'Media',
              description: 'Perintah untuk media & download',
              value: 'media',
              emoji: '📥'
            },
            {
              label: 'Utilitas',
              description: 'Perintah utilitas & lainnya',
              value: 'utilities',
              emoji: '🔧'
            }
          ])
      );
    
    // Reply with the category help
    await interaction.reply({
      embeds: [embed],
      components: [backButton]
    });
  } catch (error) {
    console.error('Error sending category help:', error);
    await interaction.reply({
      content: 'Terjadi kesalahan saat menampilkan bantuan kategori.',
      ephemeral: true
    });
  }
}

/**
 * Format uptime into a readable string
 * @param {number} uptime - Uptime in milliseconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(uptime) {
  const seconds = Math.floor(uptime / 1000) % 60;
  const minutes = Math.floor(uptime / (1000 * 60)) % 60;
  const hours = Math.floor(uptime / (1000 * 60 * 60)) % 24;
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
/**
 * Embed Builder Utility
 * 
 * Utility to create consistent embed styles across the application
 * with proper branding and formatting
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { getTimeGreeting } = require('./formatters');

/**
 * Create a standard embed template with bot branding
 * @returns {EmbedBuilder} A pre-configured EmbedBuilder instance
 */
function createEmbed() {
  return new EmbedBuilder()
    .setColor(config.embeds.color)
    .setAuthor({
      name: config.embeds.author.name,
      iconURL: config.embeds.author.iconURL
    })
    .setFooter({
      text: config.embeds.footer.text,
      iconURL: config.embeds.footer.iconURL
    })
    .setTimestamp();
}

/**
 * Create a notification embed for live streams
 * @param {Object} data - Live stream data
 * @param {string} type - Type of live (IDN/Showroom)
 * @param {boolean} isStarting - Whether the live is starting or ending
 * @returns {EmbedBuilder} Configured embed
 */
function createLiveEmbed(data, type, isStarting) {
  const embed = createEmbed()
    .setTitle(isStarting ? `${data.streamerName} Sedang Live ${type}!` : `${data.streamerName} Sudah Selesai Live ${type}!`)
    .setDescription(isStarting ? 
      `${getTimeGreeting()} Teman-teman! ${data.streamerName} sedang live sekarang. Jangan lupa ditonton ya!` :
      `Terima kasih banyak kepada ${data.streamerName} yang sudah menemani kita dengan live ${type} hari ini!`
    );
    
  if (data.thumbnailUrl) {
    embed.setImage(data.thumbnailUrl);
  }
  
  // Add common fields
  embed.addFields(
    { name: '📌 Judul Stream', value: data.title || 'Live Stream', inline: false }
  );
  
  if (isStarting) {
    // Add fields for live start notification
    embed.addFields(
      { name: '👥 Followers', value: `${data.followers || '?'} Users`, inline: true },
      { name: '🗓️ Tanggal Stream', value: data.startTime || 'Sekarang', inline: true },
      { name: '🔗 Tonton di ' + type, value: `[Klik di sini](${data.url})`, inline: true }
    );
    
    if (data.websiteUrl) {
      embed.addFields(
        { name: '🌐 Tonton di Website', value: `[Klik di sini](${data.websiteUrl})`, inline: true }
      );
    }
  } else {
    // Add fields for live end notification
    const duration = data.duration || '?';
    const endTime = data.endTime || 'Baru saja';
    
    embed.addFields(
      { name: '🗓️ Live Dimulai', value: data.startTime || '?', inline: true },
      { name: '🗓️ Live Berakhir', value: endTime, inline: true },
      { name: '⏰ Durasi', value: duration, inline: true },
      { name: '👥 Followers', value: `${data.followers || '?'} Users`, inline: true }
    );
    
    // Add additional stats if available
    if (data.viewers) {
      embed.addFields(
        { name: '👀 Viewer', value: `${data.viewers} Users`, inline: true }
      );
    }
    
    if (data.activeViewers) {
      embed.addFields(
        { name: '👀 Active Viewer', value: `${data.activeViewers} Users`, inline: true }
      );
    }
    
    if (data.commentCount && data.commentUsers) {
      embed.addFields(
        { name: '💬 Comments', value: `${data.commentCount} By ${data.commentUsers} Users`, inline: true }
      );
    }
    
    if (data.goldAmount) {
      embed.addFields(
        { name: '🎁 Gift', value: `${data.goldAmount}G (± Rp ${data.goldValueRupiah || '?'})`, inline: true }
      );
    }
    
    if (data.totalGiftPoints) {
      embed.addFields(
        { name: '🎁 Total hadiah', value: `${data.totalGiftPoints} pts`, inline: true }
      );
    }
    
    if (data.freeGiftPercentage) {
      embed.addFields(
        { name: '🎁 Jumlah Gift Paid & Free', value: `Free gifts (${data.freeGiftPercentage}%)`, inline: true }
      );
    }
    
    if (data.excitementPoints) {
      embed.addFields(
        { name: '⭐ Excitement Points', value: data.excitementPoints.toString(), inline: true }
      );
    }
  }
  
  return embed;
}

/**
 * Create a theater schedule embed
 * @param {Object} data - Theater data
 * @returns {EmbedBuilder} Configured embed
 */
function createTheaterEmbed(data) {
  const embed = createEmbed()
    .setTitle(`JADWAL SHOW ${data.name}`)
    .setDescription('Berikut adalah jadwal theater JKT48 yang akan datang:');
    
  // Add essential fields
  embed.addFields(
    { name: 'Nama Show', value: data.name, inline: false },
    { name: 'Tanggal Show', value: data.date, inline: true },
    { name: 'Waktu', value: data.time, inline: true }
  );
  
  // Add member lineup if available
  if (data.members && data.members.length > 0) {
    embed.addFields(
      { name: 'Member', value: data.members.join(', '), inline: false }
    );
  }
  
  // Add ticket info if available
  if (data.ticketPrice) {
    embed.addFields(
      { name: 'Harga Tiket', value: data.ticketPrice, inline: true }
    );
  }
  
  if (data.ticketUrl) {
    embed.addFields(
      { name: 'Beli Tiket', value: `[Klik di sini](${data.ticketUrl})`, inline: true }
    );
  }
  
  // Add setlist info if available
  if (data.setlist) {
    embed.addFields(
      { name: 'Setlist', value: data.setlist, inline: false }
    );
  }
  
  // Add notes if available
  if (data.additionalInfo) {
    embed.addFields(
      { name: 'Catatan', value: data.additionalInfo, inline: false }
    );
  }
  
  return embed;
}

/**
 * Create an event schedule embed
 * @param {Object} data - Event data
 * @returns {EmbedBuilder} Configured embed
 */
function createEventEmbed(data) {
  const embed = createEmbed()
    .setTitle(`JADWAL EVENT ${data.name}`)
    .setDescription('Berikut adalah informasi event JKT48 yang akan datang:');
    
  // Add essential fields
  embed.addFields(
    { name: 'Nama Event', value: data.name, inline: false },
    { name: 'Lokasi', value: data.location || 'TBA', inline: true },
    { name: 'Tanggal', value: data.date, inline: true },
    { name: 'Waktu', value: data.time || 'TBA', inline: true }
  );
  
  // Add member lineup if available
  if (data.members && data.members.length > 0) {
    embed.addFields(
      { name: 'Line Up', value: data.members.join(', '), inline: false }
    );
  }
  
  // Add ticket info if available
  if (data.ticketPrice) {
    embed.addFields(
      { name: 'Harga Tiket', value: data.ticketPrice, inline: true }
    );
  }
  
  if (data.ticketUrl) {
    embed.addFields(
      { name: 'Beli Tiket', value: `[Klik di sini](${data.ticketUrl})`, inline: true }
    );
  }
  
  // Add additional info if available
  if (data.additionalInfo) {
    embed.addFields(
      { name: 'Informasi Tambahan', value: data.additionalInfo, inline: false }
    );
  }
  
  return embed;
}

/**
 * Create a news embed
 * @param {Object} data - News data
 * @returns {EmbedBuilder} Configured embed
 */
function createNewsEmbed(data) {
  const embed = createEmbed()
    .setTitle(data.title)
    .setURL(data.link || 'https://jkt48.com/news/list?lang=id');
    
  if (data.summary) {
    embed.setDescription(data.summary);
  }
  
  if (data.date) {
    embed.addFields(
      { name: 'Tanggal', value: data.date, inline: true }
    );
  }
  
  if (data.category) {
    embed.addFields(
      { name: 'Kategori', value: data.category, inline: true }
    );
  }
  
  if (data.imageUrl) {
    embed.setImage(data.imageUrl);
  }
  
  return embed;
}

/**
 * Create a welcome embed for new members
 * @param {GuildMember} member - The new Discord guild member
 * @returns {EmbedBuilder} Configured embed
 */
function createWelcomeEmbed(member) {
  return createEmbed()
    .setTitle(`Selamat Datang di ${member.guild.name}!`)
    .setDescription(`Halo <@${member.id}>, selamat datang di server kami!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'Perkenalan Diri', value: 'Silakan perkenalkan diri kamu di <#1297255485577105470>', inline: false },
      { name: 'Baca Peraturan', value: 'Jangan lupa baca peraturan di <#1297112621555777539>', inline: false },
      { name: 'Dapatkan Role', value: 'Kamu bisa mendapatkan role dengan cara react di <#1353580150075428885>', inline: false }
    );
}

/**
 * Create a goodbye embed for members who left
 * @param {GuildMember} member - The member who left
 * @returns {EmbedBuilder} Configured embed
 */
function createGoodbyeEmbed(member) {
  return createEmbed()
    .setTitle(`Selamat Tinggal!`)
    .setDescription(`<@${member.id}> telah meninggalkan server.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
}

/**
 * Create an error embed
 * @param {string} message - Error message to display
 * @returns {EmbedBuilder} Configured embed
 */
function createErrorEmbed(message) {
  return createEmbed()
    .setTitle('Error')
    .setDescription(message)
    .setColor('#FF0000');
}

/**
 * Create a success embed
 * @param {string} message - Success message to display
 * @returns {EmbedBuilder} Configured embed
 */
function createSuccessEmbed(message) {
  return createEmbed()
    .setTitle('Sukses')
    .setDescription(message)
    .setColor('#00FF00');
}

/**
 * Create a ticket embed
 * @param {Object} data - Ticket data
 * @returns {EmbedBuilder} Configured embed
 */
function createTicketEmbed(data) {
  return createEmbed()
    .setTitle('Sistem Tiket Support')
    .setDescription('Silakan klik tombol di bawah untuk membuat tiket baru.')
    .addFields(
      { name: 'Bantuan', value: 'Kamu dapat membuat tiket untuk bertanya, melaporkan masalah, atau meminta bantuan lainnya.', inline: false },
      { name: 'Catatan', value: 'Harap bersabar, tim kami akan merespon secepatnya.', inline: false }
    );
}

module.exports = {
  createEmbed,
  createLiveEmbed,
  createTheaterEmbed,
  createEventEmbed,
  createNewsEmbed,
  createWelcomeEmbed,
  createGoodbyeEmbed,
  createErrorEmbed,
  createSuccessEmbed,
  createTicketEmbed
};
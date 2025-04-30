/**
 * Holiday Notifications Utility
 * 
 * Script untuk mengelola notifikasi hari besar dan notifikasi sahur/berbuka
 * selama bulan Ramadhan. Semua notifikasi dikirim ke channel yang telah ditentukan.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { EmbedBuilder } = require('discord.js');
const { logger } = require('./logger');
const { createEmbed } = require('./embedBuilder');
const cron = require('node-cron');
const config = require('../config');
const axios = require('axios');
const cheerio = require('cheerio');

// Channel ID untuk notifikasi ramadhan (telah ditetapkan di config.js)
const RAMADHAN_CHANNEL_ID = config.channels.ramadhanChannel || '1349339422688280650';

// Daftar hari besar dengan tanggal statis atau algoritma kalkulasi
const staticHolidays = [
  { name: 'Tahun Baru', date: '01-01', emoji: '🎆', color: '#FFD700', description: 'Selamat Tahun Baru! Mari sambut tahun ini dengan semangat dan harapan baru.' },
  { name: 'Hari Valentine', date: '14-02', emoji: '❤️', color: '#FF69B4', description: 'Selamat Hari Valentine! Hari untuk merayakan cinta dan kasih sayang.' },
  { name: 'Hari Kartini', date: '21-04', emoji: '👸', color: '#9370DB', description: 'Selamat Hari Kartini! Memperingati perjuangan R.A. Kartini untuk emansipasi wanita.' },
  { name: 'Hari Buruh', date: '01-05', emoji: '👷', color: '#FF4500', description: 'Selamat Hari Buruh! Memperingati perjuangan para pekerja di seluruh dunia.' },
  { name: 'Hari Kemerdekaan Indonesia', date: '17-08', emoji: '🇮🇩', color: '#FF0000', description: 'Dirgahayu Republik Indonesia! Memperingati kemerdekaan Indonesia.' },
  { name: 'Halloween', date: '31-10', emoji: '🎃', color: '#FFA500', description: 'Selamat Halloween! Jangan lupa bagikan permen dan bersenang-senang dengan kostum menyeramkan.' },
  { name: 'Hari Pahlawan', date: '10-11', emoji: '🦸', color: '#B22222', description: 'Selamat Hari Pahlawan! Mengenang jasa para pahlawan yang telah berjuang untuk Indonesia.' },
  { name: 'Natal', date: '25-12', emoji: '🎄', color: '#228B22', description: 'Selamat Hari Natal! Merry Christmas dan selamat merayakan bersama keluarga tercinta.' },
  { name: 'Tahun Baru (Malam)', date: '31-12', emoji: '✨', color: '#FFD700', description: 'Selamat Malam Tahun Baru! Bersiap menyambut tahun yang baru, selamat merayakan!' }
];

// Notifikasi hari besar Islam (menggunakan API untuk mendapatkan tanggal Hijriah yang akurat)
const islamicHolidays = [
  { name: 'Tahun Baru Hijriah', month: 1, day: 1, emoji: '🌙', color: '#00AA00', description: 'Selamat Tahun Baru Hijriah! Semoga tahun ini membawa keberkahan.' },
  { name: 'Maulid Nabi Muhammad SAW', month: 3, day: 12, emoji: '☪️', color: '#00AA00', description: 'Selamat Memperingati Maulid Nabi Muhammad SAW.' },
  { name: 'Isra Miraj', month: 7, day: 27, emoji: '☪️', color: '#00AA00', description: 'Selamat Memperingati Isra Miraj Nabi Muhammad SAW.' },
  { name: '1 Ramadhan', month: 9, day: 1, emoji: '🌙', color: '#00AA00', description: 'Selamat Menunaikan Ibadah Puasa Ramadhan! Semoga ibadah puasa kita diterima Allah SWT.' },
  { name: 'Nuzulul Quran', month: 9, day: 17, emoji: '📖', color: '#00AA00', description: 'Selamat Memperingati Nuzulul Quran. Alhamdulillah, Al-Quran telah diturunkan sebagai petunjuk bagi umat manusia.' },
  { name: 'Idul Fitri', month: 10, day: 1, emoji: '🕌', color: '#00AA00', description: 'Selamat Hari Raya Idul Fitri! Mohon maaf lahir dan batin.' },
  { name: 'Idul Adha', month: 12, day: 10, emoji: '🐑', color: '#00AA00', description: 'Selamat Hari Raya Idul Adha! Semoga kita semua bisa mengambil hikmah dari kisah Nabi Ibrahim AS.' }
];

/**
 * Setup semua notifikasi hari besar dan notifikasi Ramadhan
 * @param {Client} client - Discord client
 */
function setupHolidayNotifications(client) {
  logger.info('Setting up holiday notifications system...');
  
  // Notifikasi untuk hari-hari besar yang tanggalnya statis setiap tahun
  setupStaticHolidayNotifications(client);
  
  // Notifikasi untuk hari-hari besar Islam (perlu kalkulasi khusus)
  setupIslamicHolidayNotifications(client);
  
  // Notifikasi khusus Ramadhan (sahur dan berbuka)
  setupRamadhanNotifications(client);
  
  logger.info('Holiday notifications system has been set up successfully.');
}

/**
 * Setup notifikasi hari besar dengan tanggal yang statis setiap tahun
 * @param {Client} client - Discord client
 */
function setupStaticHolidayNotifications(client) {
  // Memeriksa hari besar setiap hari pada pukul 07:00 pagi
  cron.schedule('0 7 * * *', async () => {
    try {
      const now = new Date();
      const currentDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Cek apakah ada hari besar yang jatuh pada hari ini
      const todayHoliday = staticHolidays.find(holiday => holiday.date === currentDate);
      
      if (todayHoliday) {
        await sendHolidayNotification(client, todayHoliday);
      }
    } catch (error) {
      logger.error(`Error checking static holidays: ${error.message}`);
    }
  });
  
  logger.info('Static holiday notifications set up');
}

/**
 * Setup notifikasi hari besar Islam
 * @param {Client} client - Discord client
 */
function setupIslamicHolidayNotifications(client) {
  // Memeriksa hari besar Islam setiap hari pada pukul 07:00 pagi
  cron.schedule('0 7 * * *', async () => {
    try {
      // Dapatkan tanggal Hijriah saat ini
      const hijriDate = await getCurrentHijriDate();
      
      if (!hijriDate) {
        logger.error('Failed to get current Hijri date');
        return;
      }
      
      // Cek apakah ada hari besar Islam yang jatuh pada hari ini
      const todayIslamicHoliday = islamicHolidays.find(
        holiday => holiday.month === hijriDate.month && holiday.day === hijriDate.day
      );
      
      if (todayIslamicHoliday) {
        await sendHolidayNotification(client, todayIslamicHoliday);
        
        // Jika hari ini adalah awal Ramadhan, aktifkan notifikasi Ramadhan
        if (todayIslamicHoliday.name === '1 Ramadhan') {
          activateRamadhanNotifications(client, hijriDate.year);
        }
      }
    } catch (error) {
      logger.error(`Error checking Islamic holidays: ${error.message}`);
    }
  });
  
  logger.info('Islamic holiday notifications set up');
}

/**
 * Setup notifikasi khusus Ramadhan (sahur dan berbuka)
 * @param {Client} client - Discord client
 */
function setupRamadhanNotifications(client) {
  // Cek apakah saat ini bulan Ramadhan dan aktifkan notifikasi jika iya
  (async () => {
    try {
      const hijriDate = await getCurrentHijriDate();
      
      if (hijriDate && hijriDate.month === 9) {
        // Bulan Ramadhan, aktifkan notifikasi
        activateRamadhanNotifications(client, hijriDate.year);
      }
    } catch (error) {
      logger.error(`Error activating Ramadhan notifications: ${error.message}`);
    }
  })();
  
  logger.info('Ramadhan notifications system ready');
}

/**
 * Mendapatkan tanggal Hijriah dengan perhitungan lokal
 * Ini cukup akurat untuk kebanyakan kasus penggunaan
 * @returns {Object} - Perkiraan tanggal Hijriah { day, month, year }
 */
function getFallbackHijriDate() {
  // Perhitungan kalkulasi tanggal Hijriah berdasarkan metode standar
  // Catatan: Tanggal 1 Rajab 1445 H bertepatan dengan 13 Januari 2024
  const referenceGregorianDate = new Date(2024, 0, 13); // 13 Januari 2024
  const referenceHijriMonth = 7; // Rajab
  const referenceHijriDay = 1;   // Tanggal 1
  const referenceHijriYear = 1445;
  
  const now = new Date();
  
  // Hitung selisih hari dengan tanggal referensi
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const dayDifference = Math.floor((now - referenceGregorianDate) / millisecondsPerDay);
  
  // Lama tahun Hijriah adalah 354,367 hari (rata-rata)
  const daysInHijriYear = 354.367;
  const daysInHijriMonth = daysInHijriYear / 12;
  
  // Hitung total hari Hijriah dari tanggal referensi
  let totalHijriDays = (referenceHijriMonth - 1) * daysInHijriMonth + (referenceHijriDay - 1);
  totalHijriDays += dayDifference;
  
  // Tentukan tahun Hijriah
  const hijriYear = referenceHijriYear + Math.floor(totalHijriDays / daysInHijriYear);
  
  // Hitung sisa hari dalam tahun Hijriah
  const remainingDays = totalHijriDays % daysInHijriYear;
  
  // Hitung bulan Hijriah (1-12)
  const hijriMonth = Math.min(12, Math.floor(remainingDays / daysInHijriMonth) + 1);
  
  // Hitung tanggal Hijriah (1-30)
  const dayInMonth = Math.floor(remainingDays % daysInHijriMonth) + 1;
  const hijriDay = Math.min(30, dayInMonth); // Pastikan tidak lebih dari 30
  
  logger.info(`Calculated Hijri date: ${hijriDay}/${hijriMonth}/${hijriYear}`);
  
  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear
  };
}

/**
 * Aktifkan notifikasi untuk bulan Ramadhan
 * @param {Client} client - Discord client
 * @param {number} hijriYear - Tahun Hijriah saat ini
 */
async function activateRamadhanNotifications(client, hijriYear) {
  try {
    logger.info(`Activating Ramadhan notifications for Hijri year ${hijriYear}`);
    
    // Dapatkan data jadwal Ramadhan (seperti waktu imsak, berbuka, dll) dari API atau sumber lainnya
    const ramadhanSchedule = await getRamadhanSchedule();
    
    if (!ramadhanSchedule || ramadhanSchedule.length === 0) {
      logger.error('Failed to get Ramadhan schedule');
      return;
    }
    
    // Setup notifikasi sahur (imsak) setiap hari selama Ramadhan
    // Jadwal sahur biasanya sekitar pukul 04:00 pagi, kita kirim notifikasi 30 menit sebelumnya
    cron.schedule('30 3 * * *', async () => {
      try {
        const now = new Date();
        const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // Dapatkan jadwal untuk hari ini
        const todaySchedule = ramadhanSchedule.find(item => item.date === currentDate);
        
        // Pastikan kita masih di bulan Ramadhan
        const hijriDate = await getCurrentHijriDate();
        if (!hijriDate || hijriDate.month !== 9) {
          // Bukan bulan Ramadhan lagi, hentikan notifikasi
          return;
        }
        
        if (todaySchedule) {
          await sendSahurNotification(client, todaySchedule, hijriDate.day);
        }
      } catch (error) {
        logger.error(`Error sending sahur notification: ${error.message}`);
      }
    });
    
    // Setup notifikasi berbuka setiap hari selama Ramadhan
    // Kita kirim notifikasi 15 menit sebelum waktu berbuka
    cron.schedule('*/15 * * * *', async () => {
      try {
        const now = new Date();
        const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // Dapatkan jadwal untuk hari ini
        const todaySchedule = ramadhanSchedule.find(item => item.date === currentDate);
        
        // Pastikan kita masih di bulan Ramadhan
        const hijriDate = await getCurrentHijriDate();
        if (!hijriDate || hijriDate.month !== 9) {
          // Bukan bulan Ramadhan lagi, hentikan notifikasi
          return;
        }
        
        if (todaySchedule) {
          // Ekstrak jam dan menit dari waktu Maghrib (waktu berbuka)
          const [maghribHour, maghribMinute] = todaySchedule.maghrib.split(':').map(Number);
          
          // Hitung waktu notifikasi (15 menit sebelum Maghrib)
          const notifDate = new Date();
          notifDate.setHours(maghribHour, maghribMinute - 15, 0);
          
          // Periksa apakah sekarang waktunya untuk notifikasi berbuka
          if (now.getHours() === notifDate.getHours() && now.getMinutes() === notifDate.getMinutes()) {
            await sendIfterNotification(client, todaySchedule, hijriDate.day);
          }
        }
      } catch (error) {
        logger.error(`Error sending ifter notification: ${error.message}`);
      }
    });
    
    logger.info('Ramadhan notifications activated successfully');
  } catch (error) {
    logger.error(`Error in activateRamadhanNotifications: ${error.message}`);
  }
}

/**
 * Mendapatkan tanggal Hijriah saat ini
 * @returns {Object|null} - Objek dengan format { day, month, year } atau null jika gagal
 */
async function getCurrentHijriDate() {
  // Kita akan menggunakan perhitungan langsung karena API sering tidak tersedia
  // Ini akan memastikan aplikasi tetap berjalan meskipun API external down
  logger.info('Getting Hijri date with local calculation');
  return getFallbackHijriDate();
}

/**
 * Mendapatkan jadwal Ramadhan untuk daerah Jakarta dan sekitarnya
 * @returns {Array} - Array jadwal Ramadhan
 */
async function getRamadhanSchedule() {
  try {
    // Menggunakan API untuk mendapatkan jadwal Ramadhan
    // Format jadwal: [{date, imsak, subuh, terbit, dhuha, dzuhur, ashar, maghrib, isya}, ...]
    
    // Kode berikut adalah contoh, idealnya Anda mengambil data dari API resmi
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Menggunakan API myquran.com untuk jadwal sholat Jakarta
    const response = await axios.get(`https://api.myquran.com/v1/sholat/jadwal/1301/${year}/${month}`);
    
    if (response.status === 200 && response.data.status) {
      // Convert API response to our format
      return response.data.data.jadwal.map(item => ({
        date: item.date,
        imsak: item.imsak,
        subuh: item.subuh,
        terbit: item.terbit,
        dhuha: item.dhuha,
        dzuhur: item.dzuhur,
        ashar: item.ashar,
        maghrib: item.maghrib,
        isya: item.isya
      }));
    }
    
    logger.error('Failed to get prayer schedule from API');
    
    // Fallback: Buatkan jadwal contoh untuk beberapa hari
    return generateFallbackSchedule();
  } catch (error) {
    logger.error(`Error getting Ramadhan schedule: ${error.message}`);
    
    // Fallback: Buatkan jadwal contoh untuk beberapa hari
    return generateFallbackSchedule();
  }
}

/**
 * Membuat jadwal fallback jika API tidak tersedia
 * @returns {Array} - Jadwal fallback untuk beberapa hari
 */
function generateFallbackSchedule() {
  const schedule = [];
  const now = new Date();
  
  // Buat jadwal untuk 7 hari ke depan
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    
    schedule.push({
      date: dateStr,
      imsak: '04:22',
      subuh: '04:32',
      terbit: '05:48',
      dhuha: '06:15',
      dzuhur: '12:00',
      ashar: '15:20',
      maghrib: '18:05',
      isya: '19:15'
    });
  }
  
  return schedule;
}

/**
 * Kirim notifikasi hari besar
 * @param {Client} client - Discord client
 * @param {Object} holiday - Informasi hari besar
 */
async function sendHolidayNotification(client, holiday) {
  try {
    const channel = await getTargetChannel(client);
    if (!channel) return;
    
    const embed = createEmbed()
      .setTitle(`${holiday.emoji} Selamat ${holiday.name}!`)
      .setDescription(holiday.description)
      .setColor(holiday.color)
      .setTimestamp();
    
    await channel.send({ embeds: [embed] });
    logger.info(`Sent notification for holiday: ${holiday.name}`);
  } catch (error) {
    logger.error(`Error sending holiday notification: ${error.message}`);
  }
}

/**
 * Kirim notifikasi sahur
 * @param {Client} client - Discord client
 * @param {Object} schedule - Jadwal hari ini
 * @param {number} ramadhanDay - Hari ke berapa di bulan Ramadhan
 */
async function sendSahurNotification(client, schedule, ramadhanDay) {
  try {
    const channel = await getTargetChannel(client, RAMADHAN_CHANNEL_ID);
    if (!channel) return;
    
    const embed = createEmbed()
      .setTitle('🌙 Waktunya Sahur!')
      .setDescription(`**Ramadhan hari ke-${ramadhanDay}**\n\nSelamat sahur, jangan lupa niat puasa. Semoga puasa hari ini lancar dan diterima Allah SWT.`)
      .addFields(
        { name: 'Waktu Imsak', value: schedule.imsak, inline: true },
        { name: 'Waktu Subuh', value: schedule.subuh, inline: true },
        { name: 'Waktu Berbuka', value: schedule.maghrib, inline: true }
      )
      .setColor('#00AA00')
      .setFooter({ text: `Jadwal untuk wilayah Jakarta dan sekitarnya - ${schedule.date}` })
      .setTimestamp();
    
    await channel.send({
      content: `<@&${config.roles.newsNotification}>, waktunya sahur!`,
      embeds: [embed]
    });
    logger.info(`Sent sahur notification for Ramadhan day ${ramadhanDay}`);
  } catch (error) {
    logger.error(`Error sending sahur notification: ${error.message}`);
  }
}

/**
 * Kirim notifikasi berbuka
 * @param {Client} client - Discord client
 * @param {Object} schedule - Jadwal hari ini
 * @param {number} ramadhanDay - Hari ke berapa di bulan Ramadhan
 */
async function sendIfterNotification(client, schedule, ramadhanDay) {
  try {
    const channel = await getTargetChannel(client, RAMADHAN_CHANNEL_ID);
    if (!channel) return;
    
    // Doa berbuka puasa
    const doaBerbuka = 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ';
    const doaTransliteration = "Allahumma laka sumtu, wa bika aamantu, wa 'ala rizqika aftartu";
    const doaTranslation = 'Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.';
    
    const embed = createEmbed()
      .setTitle('🕌 Waktunya Berbuka Puasa!')
      .setDescription(`**Ramadhan hari ke-${ramadhanDay}**\n\nWaktu berbuka puasa telah tiba. Selamat berbuka puasa, semoga puasa hari ini diterima Allah SWT.`)
      .addFields(
        { name: 'Waktu Maghrib', value: schedule.maghrib, inline: true },
        { name: 'Waktu Isya', value: schedule.isya, inline: true },
        { name: 'Waktu Imsak (Besok)', value: schedule.imsak, inline: true },
        { name: 'Doa Berbuka Puasa', value: doaBerbuka },
        { name: 'Transliterasi', value: doaTransliteration },
        { name: 'Artinya', value: doaTranslation }
      )
      .setColor('#00AA00')
      .setFooter({ text: `Jadwal untuk wilayah Jakarta dan sekitarnya - ${schedule.date}` })
      .setTimestamp();
    
    await channel.send({
      content: `<@&${config.roles.newsNotification}>, waktunya berbuka puasa!`,
      embeds: [embed]
    });
    logger.info(`Sent ifter notification for Ramadhan day ${ramadhanDay}`);
  } catch (error) {
    logger.error(`Error sending ifter notification: ${error.message}`);
  }
}

/**
 * Mendapatkan channel target untuk notifikasi
 * @param {Client} client - Discord client
 * @param {string} [channelId] - ID channel target, jika tidak ada akan menggunakan default
 * @returns {TextChannel|null} - Channel Discord atau null jika tidak ditemukan
 */
async function getTargetChannel(client, channelId = null) {
  try {
    // Gunakan channel yang ditentukan atau default ke newsNotifications
    const targetChannelId = channelId || config.channels.newsNotifications;
    
    const channel = await client.channels.fetch(targetChannelId);
    
    if (!channel) {
      // Jika channel utama tidak ditemukan, coba gunakan fallback channel
      logger.warn(`Target channel ${targetChannelId} not found, trying fallback channel`);
      return await client.channels.fetch(config.channels.fallbackChannel);
    }
    
    return channel;
  } catch (error) {
    logger.error(`Error getting target channel: ${error.message}`);
    return null;
  }
}

module.exports = {
  setupHolidayNotifications
};
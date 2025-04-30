/**
 * Hari Besar Command
 * 
 * Command untuk menampilkan informasi tentang hari-hari besar,
 * berapa hari lagi sampai hari besar tersebut, dan jadwal Ramadhan.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');
const { createEmbed } = require('../../utils/embedBuilder');
const axios = require('axios');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('haribesar')
    .setDescription('Menampilkan informasi tentang hari-hari besar')
    .addSubcommand(subcommand => 
      subcommand
        .setName('kalender')
        .setDescription('Menampilkan kalender hari besar terdekat'))
    .addSubcommand(subcommand => 
      subcommand
        .setName('cek')
        .setDescription('Cek hari besar tertentu')
        .addStringOption(option => 
          option.setName('nama')
            .setDescription('Nama hari besar')
            .setRequired(true)
            .addChoices(
              { name: 'Tahun Baru', value: 'tahun_baru' },
              { name: 'Idul Fitri', value: 'idul_fitri' },
              { name: 'Idul Adha', value: 'idul_adha' },
              { name: 'Natal', value: 'natal' },
              { name: 'Halloween', value: 'halloween' },
              { name: 'Ramadhan', value: 'ramadhan' },
              { name: 'Hari Kemerdekaan', value: 'kemerdekaan' },
              { name: 'Tahun Baru Imlek', value: 'imlek' },
              { name: 'Valentine', value: 'valentine' },
              { name: 'Nyepi', value: 'nyepi' },
              { name: 'Isra Mi\'raj', value: 'isra_miraj' },
              { name: 'Waisak', value: 'waisak' },
              { name: 'Maulid Nabi', value: 'maulid' }
            )))
    .addSubcommand(subcommand => 
      subcommand
        .setName('ramadhan')
        .setDescription('Menampilkan jadwal Ramadhan hari ini')
        .addStringOption(option => 
          option.setName('wilayah')
            .setDescription('Wilayah jadwal (default: Jakarta)')
            .setRequired(false)
            .addChoices(
              { name: 'Jakarta', value: '1301' },
              { name: 'Bandung', value: '1219' },
              { name: 'Surabaya', value: '1615' },
              { name: 'Yogyakarta', value: '1604' },
              { name: 'Medan', value: '1257' },
              { name: 'Makassar', value: '2079' },
              { name: 'Denpasar', value: '1710' },
              { name: 'Palembang', value: '1303' },
              { name: 'Semarang', value: '1409' },
              { name: 'Manado', value: '1975' }
            ))),
  
  async execute(interaction) {
    try {
      // Defer reply untuk mencegah timeout
      await interaction.deferReply();
      
      const subcommand = interaction.options.getSubcommand();
      
      if (subcommand === 'kalender') {
        await handleKalenderCommand(interaction);
      } 
      else if (subcommand === 'cek') {
        const holidayName = interaction.options.getString('nama');
        await handleCekCommand(interaction, holidayName);
      } 
      else if (subcommand === 'ramadhan') {
        const wilayah = interaction.options.getString('wilayah') || '1301'; // Default: Jakarta
        await handleRamadhanCommand(interaction, wilayah);
      }
    } catch (error) {
      logger.error(`Error executing haribesar command: ${error.message}`);
      
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Terjadi kesalahan saat memperoleh informasi hari besar. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      } else {
        await interaction.reply({ 
          content: 'Terjadi kesalahan saat memperoleh informasi hari besar. Silakan coba lagi nanti.',
          ephemeral: true
        }).catch(e => {
          logger.error('Failed to send error response:', e);
        });
      }
    }
  }
};

/**
 * Menangani subcommand 'kalender' untuk menampilkan hari besar terdekat
 * @param {Interaction} interaction - Discord interaction
 */
async function handleKalenderCommand(interaction) {
  // Daftar hari besar dengan tanggal statis
  const staticHolidays = [
    { name: 'Tahun Baru', date: '01-01', emoji: '🎆', description: 'Selamat Tahun Baru!' },
    { name: 'Hari Valentine', date: '14-02', emoji: '❤️', description: 'Hari kasih sayang' },
    { name: 'Hari Kartini', date: '21-04', emoji: '👸', description: 'Memperingati perjuangan R.A. Kartini' },
    { name: 'Hari Buruh', date: '01-05', emoji: '👷', description: 'Hari buruh internasional' },
    { name: 'Hari Kemerdekaan Indonesia', date: '17-08', emoji: '🇮🇩', description: 'Kemerdekaan Republik Indonesia' },
    { name: 'Halloween', date: '31-10', emoji: '🎃', description: 'Pesta kostum dan permen' },
    { name: 'Hari Pahlawan', date: '10-11', emoji: '🦸', description: 'Mengenang jasa para pahlawan' },
    { name: 'Natal', date: '25-12', emoji: '🎄', description: 'Perayaan kelahiran Yesus Kristus' },
    { name: 'Malam Tahun Baru', date: '31-12', emoji: '✨', description: 'Malam pergantian tahun baru' }
  ];
  
  // Mengambil informasi hari besar Islam
  const islamicHolidays = await getIslamicHolidays();
  
  // Gabungkan semua hari besar
  const allHolidays = [...staticHolidays, ...islamicHolidays];
  
  // Dapatkan hari besar terdekat
  const upcomingHolidays = getUpcomingHolidays(allHolidays, 5);
  
  const embed = createEmbed()
    .setTitle('📅 Kalender Hari Besar')
    .setDescription('Berikut adalah lima hari besar terdekat:')
    .setColor('#4285F4');
  
  // Tambahkan hari besar terdekat ke embed
  if (upcomingHolidays.length === 0) {
    embed.addFields({
      name: 'Informasi tidak tersedia',
      value: 'Tidak dapat memperoleh informasi hari besar saat ini.'
    });
  } else {
    upcomingHolidays.forEach(holiday => {
      embed.addFields({
        name: `${holiday.emoji} ${holiday.name}`,
        value: `${holiday.dateStr}\n${holiday.daysMessage}\n${holiday.description}`
      });
    });
  }
  
  // Tambahkan informasi Ramadhan jika berlangsung atau akan datang
  const ramadhanInfo = await getRamadhanInfo();
  if (ramadhanInfo) {
    embed.addFields({
      name: `🌙 ${ramadhanInfo.title}`,
      value: ramadhanInfo.message
    });
  }
  
  embed.setFooter({ 
    text: 'Semua tanggal berdasarkan wilayah Indonesia/Jakarta'
  });
  
  await interaction.editReply({ embeds: [embed] });
  logger.info(`User ${interaction.user.tag} requested holiday calendar`);
}

/**
 * Menangani subcommand 'cek' untuk memeriksa hari besar tertentu
 * @param {Interaction} interaction - Discord interaction
 * @param {string} holidayName - Nama hari besar yang ingin dicek
 */
async function handleCekCommand(interaction, holidayName) {
  // Dapatkan informasi hari besar yang dicari
  const holidayInfo = await getSpecificHolidayInfo(holidayName);
  
  if (!holidayInfo) {
    await interaction.editReply({
      content: `Informasi untuk hari besar "${holidayName}" tidak tersedia.`,
      ephemeral: true
    });
    return;
  }
  
  // Buat embed untuk menampilkan informasi
  const embed = createEmbed()
    .setTitle(`${holidayInfo.emoji} ${holidayInfo.name}`)
    .setDescription(holidayInfo.description)
    .setColor(holidayInfo.color || '#4285F4');
  
  // Tambahkan informasi tanggal dan waktu tersisa
  embed.addFields(
    { name: 'Jatuh pada', value: holidayInfo.dateStr, inline: true },
    { name: 'Sisa Waktu', value: holidayInfo.daysMessage, inline: true }
  );
  
  // Tambahkan informasi tambahan jika ada
  if (holidayInfo.additionalInfo) {
    for (const info of holidayInfo.additionalInfo) {
      embed.addFields({ name: info.name, value: info.value });
    }
  }
  
  embed.setFooter({ 
    text: `Zona waktu: Indonesia/Jakarta • ${new Date().toLocaleDateString('id-ID')}`
  });
  
  await interaction.editReply({ embeds: [embed] });
  logger.info(`User ${interaction.user.tag} checked information for holiday: ${holidayName}`);
}

/**
 * Menangani subcommand 'ramadhan' untuk menampilkan jadwal Ramadhan
 * @param {Interaction} interaction - Discord interaction
 * @param {string} wilayahId - ID wilayah untuk jadwal
 */
async function handleRamadhanCommand(interaction, wilayahId) {
  // Cek apakah saat ini bulan Ramadhan
  const hijriDate = await getCurrentHijriDate();
  
  if (!hijriDate) {
    await interaction.editReply({
      content: 'Tidak dapat memperoleh informasi tanggal Hijriah saat ini.',
      ephemeral: true
    });
    return;
  }
  
  const isRamadhan = hijriDate.month === 9;
  
  if (isRamadhan) {
    // Ramadhan berlangsung, tampilkan jadwal hari ini
    const schedule = await getRamadhanSchedule(wilayahId);
    
    if (!schedule) {
      await interaction.editReply({
        content: 'Tidak dapat memperoleh jadwal Ramadhan saat ini.',
        ephemeral: true
      });
      return;
    }
    
    const embed = createRamadhanEmbed(schedule, hijriDate.day, wilayahId);
    await interaction.editReply({ embeds: [embed] });
  } else {
    // Bukan bulan Ramadhan, tampilkan informasi kapan Ramadhan berikutnya
    const nextRamadhanInfo = await getNextRamadhanInfo();
    
    if (!nextRamadhanInfo) {
      await interaction.editReply({
        content: 'Tidak dapat memperoleh informasi Ramadhan berikutnya.',
        ephemeral: true
      });
      return;
    }
    
    const embed = createEmbed()
      .setTitle('🌙 Menunggu Ramadhan')
      .setDescription(`Bulan Ramadhan berikutnya diperkirakan akan dimulai pada ${nextRamadhanInfo.dateStr} (${nextRamadhanInfo.daysMessage})`)
      .setColor('#00AA00')
      .addFields({
        name: 'Tahun Hijriah Saat Ini',
        value: `${hijriDate.day} ${getHijriMonthName(hijriDate.month)} ${hijriDate.year} H`
      })
      .setFooter({ 
        text: `Tanggal dapat berbeda berdasarkan pengamatan hilal • ${new Date().toLocaleDateString('id-ID')}`
      });
    
    await interaction.editReply({ embeds: [embed] });
  }
  
  logger.info(`User ${interaction.user.tag} requested Ramadhan schedule for area ID: ${wilayahId}`);
}

/**
 * Membuat embed untuk jadwal Ramadhan
 * @param {Object} schedule - Jadwal shalat dan imsak
 * @param {number} ramadhanDay - Hari ke berapa di bulan Ramadhan
 * @param {string} wilayahId - ID wilayah untuk jadwal
 * @returns {EmbedBuilder} - Embed yang sudah dibuat
 */
function createRamadhanEmbed(schedule, ramadhanDay, wilayahId) {
  const wilayahNames = {
    '1301': 'Jakarta',
    '1219': 'Bandung',
    '1615': 'Surabaya',
    '1604': 'Yogyakarta',
    '1257': 'Medan',
    '2079': 'Makassar',
    '1710': 'Denpasar',
    '1303': 'Palembang',
    '1409': 'Semarang',
    '1975': 'Manado'
  };
  
  const wilayahName = wilayahNames[wilayahId] || 'Indonesia';
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Menghitung waktu tersisa hingga berbuka atau sahur
  let timeUntilMessage = '';
  
  // Ekstrak jam dan menit dari waktu jadwal
  const [maghribHour, maghribMinute] = schedule.maghrib.split(':').map(Number);
  const [imsakHour, imsakMinute] = schedule.imsak.split(':').map(Number);
  
  // Konversi ke total menit untuk perhitungan yang lebih mudah
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const maghribTimeInMinutes = maghribHour * 60 + maghribMinute;
  const imsakTimeInMinutes = imsakHour * 60 + imsakMinute;
  
  if (currentTimeInMinutes < imsakTimeInMinutes) {
    // Sebelum imsak
    const minutesUntilImsak = imsakTimeInMinutes - currentTimeInMinutes;
    const hoursUntilImsak = Math.floor(minutesUntilImsak / 60);
    const remainingMinutes = minutesUntilImsak % 60;
    
    timeUntilMessage = `⏰ Waktu tersisa untuk sahur: ${hoursUntilImsak} jam ${remainingMinutes} menit`;
  } else if (currentTimeInMinutes < maghribTimeInMinutes) {
    // Sebelum maghrib/berbuka
    const minutesUntilMaghrib = maghribTimeInMinutes - currentTimeInMinutes;
    const hoursUntilMaghrib = Math.floor(minutesUntilMaghrib / 60);
    const remainingMinutes = minutesUntilMaghrib % 60;
    
    timeUntilMessage = `⏰ Waktu tersisa hingga berbuka: ${hoursUntilMaghrib} jam ${remainingMinutes} menit`;
  } else {
    // Setelah maghrib, hitung waktu untuk sahur besok
    timeUntilMessage = '✅ Waktu berbuka telah tiba. Selamat berbuka puasa!';
  }
  
  // Buat embed
  const embed = createEmbed()
    .setTitle(`🌙 Jadwal Ramadhan Hari ke-${ramadhanDay}`)
    .setDescription(`Berikut adalah jadwal waktu shalat dan puasa untuk **${wilayahName}** hari ini:\n\n${timeUntilMessage}`)
    .setColor('#00AA00')
    .addFields(
      { name: 'Imsak', value: schedule.imsak, inline: true },
      { name: 'Subuh', value: schedule.subuh, inline: true },
      { name: 'Terbit', value: schedule.terbit, inline: true },
      { name: 'Dzuhur', value: schedule.dzuhur, inline: true },
      { name: 'Ashar', value: schedule.ashar, inline: true },
      { name: 'Maghrib (Berbuka)', value: schedule.maghrib, inline: true },
      { name: 'Isya', value: schedule.isya, inline: true }
    )
    .setFooter({ 
      text: `Jadwal untuk wilayah ${wilayahName} • ${schedule.date}`
    });
  
  return embed;
}

/**
 * Mendapatkan tanggal Hijriah saat ini melalui API
 * @returns {Object|null} - Objek dengan format { day, month, year } atau null jika gagal
 */
async function getCurrentHijriDate() {
  try {
    // Menggunakan API aladhan.com untuk mendapatkan tanggal Hijriah
    // Gunakan HTTPS untuk mencegah mixed content
    const response = await axios.get('https://api.aladhan.com/v1/gToH', {
      params: {
        date: new Date().toISOString().split('T')[0]
      }
    });
    
    if (response.status === 200 && response.data.code === 200) {
      const hijri = response.data.data.hijri;
      return {
        day: parseInt(hijri.day),
        month: parseInt(hijri.month.number),
        year: parseInt(hijri.year),
        monthName: hijri.month.en
      };
    }
    
    logger.error(`Failed to get Hijri date: ${response.status}`);
    return getFallbackHijriDate();
  } catch (error) {
    logger.error(`Error getting Hijri date: ${error.message}`);
    
    // Gunakan API alternatif jika primary API gagal
    try {
      // Coba menggunakan API alternatif sebagai fallback
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const gregorianDate = `${year}-${month}-${day}`;
      
      const response = await axios.get('https://api.aladhan.com/v1/gToH', {
        params: {
          date: gregorianDate
        }
      });
      
      if (response.status === 200 && response.data.code === 200) {
        const hijri = response.data.data.hijri;
        return {
          day: parseInt(hijri.day),
          month: parseInt(hijri.month.number),
          year: parseInt(hijri.year),
          monthName: hijri.month.en
        };
      }
    } catch (fallbackError) {
      logger.error(`Fallback API also failed: ${fallbackError.message}`);
    }
    
    // Fallback: Coba pendekatan lain jika semua API gagal
    return getFallbackHijriDate();
  }
}

/**
 * Fallback untuk mendapatkan tanggal Hijriah jika API utama gagal
 * @returns {Object} - Perkiraan tanggal Hijriah
 */
function getFallbackHijriDate() {
  // Ini adalah fallback sangat sederhana dan tidak akurat
  // Sebaiknya gunakan API resmi untuk tanggal yang akurat
  const now = new Date();
  
  // Tanggal awal tahun Hijriah 1445 adalah sekitar 19 Juli 2023
  const hijriYear1445StartDate = new Date(2023, 6, 19); // Juli 19, 2023
  
  // Hitung selisih hari
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysSinceHijriYearStart = Math.floor((now - hijriYear1445StartDate) / millisecondsPerDay);
  
  // Lama tahun Hijriah sekitar 354 atau 355 hari
  const daysInHijriYear = 354;
  const hijriYear = 1445 + Math.floor(daysSinceHijriYearStart / daysInHijriYear);
  
  // Hari dalam tahun Hijriah ini
  const dayOfHijriYear = daysSinceHijriYearStart % daysInHijriYear;
  
  // Perkirakan bulan dan hari
  // Bulan Hijriah memiliki 29 atau 30 hari
  const daysInMonth = 30;
  const hijriMonth = Math.floor(dayOfHijriYear / daysInMonth) + 1;
  const hijriDay = (dayOfHijriYear % daysInMonth) + 1;
  
  return {
    day: hijriDay,
    month: hijriMonth > 12 ? 12 : hijriMonth,
    year: hijriYear,
    monthName: getHijriMonthName(hijriMonth)
  };
}

/**
 * Mendapatkan nama bulan Hijriah berdasarkan nomor bulan
 * @param {number} month - Nomor bulan (1-12)
 * @returns {string} - Nama bulan Hijriah
 */
function getHijriMonthName(month) {
  const months = [
    'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 
    'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
    'Ramadhan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah'
  ];
  
  return months[Math.min(Math.max(0, month - 1), 11)];
}

/**
 * Mendapatkan jadwal Ramadhan dari API
 * @param {string} wilayahId - ID wilayah (kota) untuk jadwal
 * @returns {Object|null} - Jadwal Ramadhan atau null jika gagal
 */
async function getRamadhanSchedule(wilayahId = '1301') { // Default: Jakarta
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // Format tanggal YYYY-MM-DD
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Menggunakan API myquran.com untuk jadwal sholat
    const response = await axios.get(`https://api.myquran.com/v1/sholat/jadwal/${wilayahId}/${year}/${month}/${day}`);
    
    if (response.status === 200 && response.data.status === true) {
      // Convert API response to our format
      return {
        date: dateStr,
        imsak: response.data.data.jadwal.imsak,
        subuh: response.data.data.jadwal.subuh,
        terbit: response.data.data.jadwal.terbit,
        dhuha: response.data.data.jadwal.dhuha,
        dzuhur: response.data.data.jadwal.dzuhur,
        ashar: response.data.data.jadwal.ashar,
        maghrib: response.data.data.jadwal.maghrib,
        isya: response.data.data.jadwal.isya
      };
    }
    
    logger.error('Failed to get prayer schedule from API');
    return null;
  } catch (error) {
    logger.error(`Error getting Ramadhan schedule: ${error.message}`);
    return null;
  }
}

/**
 * Mendapatkan daftar hari besar Islam terbaru
 * @returns {Array} - Daftar hari besar Islam
 */
async function getIslamicHolidays() {
  try {
    // Dapatkan tanggal Hijriah saat ini
    const hijriDate = await getCurrentHijriDate();
    if (!hijriDate) {
      logger.error('Failed to get current Hijri date for Islamic holidays');
      return [];
    }
    
    // Daftar hari besar Islam dengan bulan dan tanggal Hijriah
    const islamicHolidays = [
      { name: 'Tahun Baru Hijriah', month: 1, day: 1, emoji: '🌙', description: 'Awal tahun kalender Hijriah' },
      { name: 'Maulid Nabi Muhammad SAW', month: 3, day: 12, emoji: '☪️', description: 'Peringatan kelahiran Nabi Muhammad SAW' },
      { name: 'Isra Mi\'raj', month: 7, day: 27, emoji: '☪️', description: 'Peringatan Isra dan Mi\'raj Nabi Muhammad SAW' },
      { name: 'Awal Ramadhan', month: 9, day: 1, emoji: '🌙', description: 'Awal bulan puasa Ramadhan' },
      { name: 'Nuzulul Quran', month: 9, day: 17, emoji: '📖', description: 'Peringatan turunnya Al-Quran' },
      { name: 'Idul Fitri', month: 10, day: 1, emoji: '🕌', description: 'Hari Raya Idul Fitri' },
      { name: 'Idul Adha', month: 12, day: 10, emoji: '🐑', description: 'Hari Raya Idul Adha/Kurban' }
    ];
    
    // Konversi tanggal Hijriah ke tanggal Masehi untuk tahun ini
    const convertedHolidays = [];
    const currentYear = new Date().getFullYear();
    
    for (const holiday of islamicHolidays) {
      try {
        // Menghitung tanggal Masehi untuk hari besar ini
        // Note: Pendekatan sederhana, idealnya menggunakan API konversi yang akurat
        
        // Jika bulan Hijriah ini sudah lewat, ambil untuk tahun depan
        let targetHijriYear = hijriDate.year;
        if (holiday.month < hijriDate.month || (holiday.month === hijriDate.month && holiday.day < hijriDate.day)) {
          targetHijriYear += 1;
        }
        
        // Gunakan API untuk konversi tanggal (gunakan HTTPS)
        const response = await axios.get('https://api.aladhan.com/v1/hToG', {
          params: {
            date: `${holiday.day}-${holiday.month}-${targetHijriYear}`
          }
        });
        
        if (response.status === 200 && response.data.code === 200) {
          const gregorian = response.data.data.gregorian;
          const gregorianDate = new Date(
            parseInt(gregorian.year),
            parseInt(gregorian.month.number) - 1,
            parseInt(gregorian.day)
          );
          
          // Tambahkan holiday dengan tanggal Masehi
          convertedHolidays.push({
            name: holiday.name,
            date: `${String(gregorianDate.getDate()).padStart(2, '0')}-${String(gregorianDate.getMonth() + 1).padStart(2, '0')}`,
            emoji: holiday.emoji,
            description: holiday.description,
            gregorianDate: gregorianDate
          });
        }
      } catch (error) {
        logger.error(`Error converting date for ${holiday.name}: ${error.message}`);
      }
    }
    
    return convertedHolidays;
  } catch (error) {
    logger.error(`Error getting Islamic holidays: ${error.message}`);
    return [];
  }
}

/**
 * Mendapatkan daftar hari besar terdekat
 * @param {Array} holidays - Daftar semua hari besar
 * @param {number} count - Jumlah hari besar yang ingin ditampilkan
 * @returns {Array} - Daftar hari besar terdekat dengan informasi tambahan
 */
function getUpcomingHolidays(holidays, count = 5) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const today = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Ubah format tanggal menjadi objek Date
    const formattedHolidays = holidays.map(holiday => {
      let holidayDate;
      
      if (holiday.gregorianDate) {
        // Untuk hari besar Islam yang sudah dikonversi
        holidayDate = holiday.gregorianDate;
      } else {
        // Untuk hari besar dengan tanggal tetap
        const [day, month] = holiday.date.split('-').map(Number);
        holidayDate = new Date(currentYear, month - 1, day);
        
        // Jika tanggal sudah lewat, gunakan tahun depan
        if (holidayDate < now) {
          holidayDate.setFullYear(currentYear + 1);
        }
      }
      
      // Hitung selisih hari
      const timeDiff = holidayDate - now;
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      const dateStr = holidayDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
      // Buat pesan hari yang tersisa
      let daysMessage;
      if (daysRemaining === 0) {
        daysMessage = 'Hari ini!';
      } else if (daysRemaining === 1) {
        daysMessage = 'Besok!';
      } else {
        daysMessage = `${daysRemaining} hari lagi`;
      }
      
      return {
        ...holiday,
        holidayDate,
        daysRemaining,
        dateStr,
        daysMessage
      };
    });
    
    // Urutkan berdasarkan kedekatan tanggal
    const sortedHolidays = formattedHolidays.sort((a, b) => a.daysRemaining - b.daysRemaining);
    
    // Ambil jumlah yang diinginkan
    return sortedHolidays.slice(0, count);
  } catch (error) {
    logger.error(`Error getting upcoming holidays: ${error.message}`);
    return [];
  }
}

/**
 * Mendapatkan info Ramadhan (jika sedang berlangsung atau kapan akan dimulai)
 * @returns {Object|null} - Informasi Ramadhan atau null jika gagal
 */
async function getRamadhanInfo() {
  try {
    const hijriDate = await getCurrentHijriDate();
    
    if (!hijriDate) {
      return null;
    }
    
    // Cek apakah saat ini bulan Ramadhan
    if (hijriDate.month === 9) {
      return {
        title: 'Ramadhan sedang berlangsung',
        message: `Saat ini adalah hari ke-${hijriDate.day} bulan Ramadhan tahun ${hijriDate.year} H. Gunakan /haribesar ramadhan untuk melihat jadwal hari ini.`
      };
    }
    
    // Jika belum Ramadhan, berikan info kapan Ramadhan berikutnya
    const nextRamadhanInfo = await getNextRamadhanInfo();
    
    if (nextRamadhanInfo) {
      return {
        title: 'Menunggu Ramadhan',
        message: `Bulan Ramadhan berikutnya diperkirakan akan dimulai pada ${nextRamadhanInfo.dateStr} (${nextRamadhanInfo.daysMessage})`
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error getting Ramadhan info: ${error.message}`);
    return null;
  }
}

/**
 * Mendapatkan informasi kapan Ramadhan berikutnya akan dimulai
 * @returns {Object|null} - Informasi Ramadhan berikutnya atau null jika gagal
 */
async function getNextRamadhanInfo() {
  try {
    const hijriDate = await getCurrentHijriDate();
    
    if (!hijriDate) {
      return null;
    }
    
    // Hitung bulan hijriah sampai Ramadhan berikutnya
    let monthsUntilRamadhan;
    
    if (hijriDate.month < 9) {
      // Belum Ramadhan tahun ini
      monthsUntilRamadhan = 9 - hijriDate.month;
    } else {
      // Ramadhan sudah lewat, tunggu tahun depan
      monthsUntilRamadhan = 12 - hijriDate.month + 9;
    }
    
    // Untuk kesederhanaan, asumsikan bulan Hijriah rata-rata 29.5 hari
    // Ini hanya perkiraan, tanggal sebenarnya ditentukan oleh pengamatan hilal
    const daysPerHijriMonth = 29.5;
    const daysUntilRamadhan = Math.round((monthsUntilRamadhan * daysPerHijriMonth) - hijriDate.day + 1);
    
    // Perkirakan tanggal Ramadhan berikutnya
    const nextRamadhanDate = new Date();
    nextRamadhanDate.setDate(nextRamadhanDate.getDate() + daysUntilRamadhan);
    
    const dateStr = nextRamadhanDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    return {
      dateStr,
      daysMessage: `${daysUntilRamadhan} hari lagi`
    };
  } catch (error) {
    logger.error(`Error calculating next Ramadhan: ${error.message}`);
    return null;
  }
}

/**
 * Mendapatkan informasi detail untuk hari besar tertentu
 * @param {string} holidayName - Kode nama hari besar
 * @returns {Object|null} - Informasi detail atau null jika tidak ditemukan
 */
async function getSpecificHolidayInfo(holidayName) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Mapping dari kode hari besar ke informasi detail
    const holidayMapping = {
      'tahun_baru': {
        name: 'Tahun Baru',
        date: '01-01',
        emoji: '🎆',
        color: '#FFD700',
        description: 'Perayaan awal tahun baru Masehi. Tahun Baru adalah saat saat orang-orang di seluruh dunia merayakan pergantian tahun kalender.',
        additionalInfo: []
      },
      'valentine': {
        name: 'Hari Valentine',
        date: '14-02',
        emoji: '❤️',
        color: '#FF69B4',
        description: 'Hari Valentine dirayakan setiap tanggal 14 Februari sebagai hari kasih sayang, di mana orang-orang mengekspresikan rasa cinta dan kasih sayang kepada pasangan, keluarga, dan teman.',
        additionalInfo: []
      },
      'nyepi': {
        name: 'Hari Raya Nyepi',
        emoji: '🧘',
        color: '#FFFFFF',
        description: 'Hari Raya Nyepi adalah hari raya umat Hindu yang merupakan tahun baru Saka. Pada hari Nyepi, umat Hindu melakukan amati geni (tidak menyalakan api), amati karya (tidak bekerja), amati lelungan (tidak bepergian), dan amati lelanguan (tidak mencari hiburan).',
        additionalInfo: []
      },
      'kemerdekaan': {
        name: 'Hari Kemerdekaan Indonesia',
        date: '17-08',
        emoji: '🇮🇩',
        color: '#FF0000',
        description: 'Hari Kemerdekaan Republik Indonesia, dirayakan setiap tanggal 17 Agustus untuk memperingati Proklamasi Kemerdekaan Indonesia yang terjadi pada tahun 1945.',
        additionalInfo: [
          { 
            name: 'Tahun Kemerdekaan', 
            value: `${currentYear - 1945} Tahun` 
          }
        ]
      },
      'halloween': {
        name: 'Halloween',
        date: '31-10',
        emoji: '🎃',
        color: '#FFA500',
        description: 'Halloween adalah perayaan yang berlangsung pada malam tanggal 31 Oktober. Biasanya dirayakan dengan kostum menyeramkan, mendekorasi rumah, memahat labu, trick-or-treating (meminta permen), dan pesta kostum.',
        additionalInfo: []
      },
      'natal': {
        name: 'Hari Natal',
        date: '25-12',
        emoji: '🎄',
        color: '#228B22',
        description: 'Hari Natal adalah hari raya umat Kristen yang dirayakan setiap tanggal 25 Desember untuk memperingati kelahiran Yesus Kristus. Dirayakan dengan berkumpul bersama keluarga, tukar kado, dan menikmati hidangan bersama.',
        additionalInfo: []
      }
    };
    
    // Untuk hari besar yang menggunakan kalender Islam, kita perlu pengolahan khusus
    const islamicHolidayMapping = {
      'ramadhan': {
        name: 'Bulan Ramadhan',
        emoji: '🌙',
        color: '#00AA00',
        description: 'Bulan Ramadhan adalah bulan kesembilan dalam penanggalan Hijriah dan merupakan bulan puasa bagi umat Islam. Selama Ramadhan, umat Islam berpuasa dari terbit fajar hingga terbenamnya matahari.',
        additionalInfo: []
      },
      'idul_fitri': {
        name: 'Hari Raya Idul Fitri',
        emoji: '🕌',
        color: '#00AA00',
        description: 'Hari Raya Idul Fitri adalah hari raya umat Islam yang dirayakan setelah sebulan berpuasa pada bulan Ramadhan. Pada hari ini, umat Islam melakukan shalat Idul Fitri dan bersilaturahmi dengan keluarga dan saudara.',
        additionalInfo: []
      },
      'idul_adha': {
        name: 'Hari Raya Idul Adha',
        emoji: '🐑',
        color: '#00AA00',
        description: 'Hari Raya Idul Adha adalah hari raya umat Islam yang dirayakan pada tanggal 10 Dzulhijjah. Juga dikenal sebagai Hari Raya Kurban, di mana umat Islam melakukan kurban hewan ternak dan membagikan dagingnya kepada yang membutuhkan.',
        additionalInfo: []
      },
      'isra_miraj': {
        name: 'Isra Mi\'raj',
        emoji: '☪️',
        color: '#00AA00',
        description: 'Isra Mi\'raj adalah peristiwa penting dalam sejarah Islam di mana Nabi Muhammad SAW melakukan perjalanan dari Masjidil Haram ke Masjidil Aqsa (Isra) dan kemudian naik ke langit tertinggi (Mi\'raj) dalam satu malam.',
        additionalInfo: []
      },
      'maulid': {
        name: 'Maulid Nabi Muhammad SAW',
        emoji: '☪️',
        color: '#00AA00',
        description: 'Maulid Nabi adalah peringatan hari kelahiran Nabi Muhammad SAW yang diperingati pada tanggal 12 Rabiul Awal dalam kalender Hijriah.',
        additionalInfo: []
      },
      'imlek': {
        name: 'Tahun Baru Imlek',
        emoji: '🧧',
        color: '#FF0000',
        description: 'Tahun Baru Imlek adalah perayaan tahun baru berdasarkan kalender Tionghoa, biasanya jatuh pada akhir Januari atau awal Februari. Dirayakan dengan berkumpul keluarga, angpao, dan pertunjukan barongsai.',
        additionalInfo: []
      }
    };
    
    let holiday;
    
    // Handle hari besar reguler dengan tanggal tetap
    if (holidayMapping[holidayName]) {
      holiday = holidayMapping[holidayName];
      
      // Kalkulasi tanggal hari besar dan hitungan mundur
      if (holiday.date) {
        const [day, month] = holiday.date.split('-').map(Number);
        const holidayDate = new Date(currentYear, month - 1, day);
        
        // Jika tanggalnya sudah lewat, gunakan tahun depan
        if (holidayDate < now) {
          holidayDate.setFullYear(currentYear + 1);
        }
        
        // Hitung selisih hari
        const timeDiff = holidayDate - now;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        const dateStr = holidayDate.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        });
        
        // Buat pesan hari yang tersisa
        let daysMessage;
        if (daysRemaining === 0) {
          daysMessage = 'Hari ini!';
        } else if (daysRemaining === 1) {
          daysMessage = 'Besok!';
        } else {
          daysMessage = `${daysRemaining} hari lagi`;
        }
        
        holiday = {
          ...holiday,
          dateStr,
          daysMessage
        };
      }
    }
    // Handle hari besar Islam
    else if (islamicHolidayMapping[holidayName]) {
      holiday = islamicHolidayMapping[holidayName];
      
      // Dapatkan tanggal Hijriah saat ini
      const hijriDate = await getCurrentHijriDate();
      if (!hijriDate) {
        return null;
      }
      
      let targetMonth, targetDay;
      
      // Tentukan bulan dan tanggal target berdasarkan hari besar
      switch (holidayName) {
        case 'ramadhan':
          targetMonth = 9;
          targetDay = 1;
          break;
        case 'idul_fitri':
          targetMonth = 10;
          targetDay = 1;
          break;
        case 'idul_adha':
          targetMonth = 12;
          targetDay = 10;
          break;
        case 'isra_miraj':
          targetMonth = 7;
          targetDay = 27;
          break;
        case 'maulid':
          targetMonth = 3;
          targetDay = 12;
          break;
        default:
          return null;
      }
      
      // Isi informasi tambahan tergantung hari besar
      if (holidayName === 'ramadhan') {
        // Informasi tambahan untuk Ramadhan
        const isRamadhan = hijriDate.month === 9;
        
        if (isRamadhan) {
          holiday.additionalInfo = [
            { 
              name: 'Status', 
              value: `Sedang berlangsung (Hari ke-${hijriDate.day})` 
            },
            { 
              name: 'Perkiraan Berakhir', 
              value: `Sekitar ${30 - hijriDate.day} hari lagi` 
            },
            {
              name: 'Jadwal Detil',
              value: 'Gunakan "/haribesar ramadhan" untuk melihat jadwal hari ini'
            }
          ];
        }
      }
      
      // Jika bulan Hijriah ini sudah lewat, ambil untuk tahun depan
      let targetHijriYear = hijriDate.year;
      if (targetMonth < hijriDate.month || (targetMonth === hijriDate.month && targetDay < hijriDate.day)) {
        targetHijriYear += 1;
      }
      
      try {
        // Gunakan API untuk konversi tanggal
        const response = await axios.get('http://api.aladhan.com/v1/hToG', {
          params: {
            date: `${targetDay}-${targetMonth}-${targetHijriYear}`
          }
        });
        
        if (response.status === 200 && response.data.code === 200) {
          const gregorian = response.data.data.gregorian;
          const gregorianDate = new Date(
            parseInt(gregorian.year),
            parseInt(gregorian.month.number) - 1,
            parseInt(gregorian.day)
          );
          
          // Hitung selisih hari
          const timeDiff = gregorianDate - now;
          const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          
          const dateStr = gregorianDate.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          });
          
          // Buat pesan hari yang tersisa
          let daysMessage;
          if (daysRemaining === 0) {
            daysMessage = 'Hari ini!';
          } else if (daysRemaining === 1) {
            daysMessage = 'Besok!';
          } else {
            daysMessage = `${daysRemaining} hari lagi`;
          }
          
          holiday = {
            ...holiday,
            dateStr,
            daysMessage
          };
          
          // Informasi tambahan tanggal Hijriah
          if (!holiday.additionalInfo) {
            holiday.additionalInfo = [];
          }
          
          holiday.additionalInfo.push({
            name: 'Tanggal Hijriah',
            value: `${targetDay} ${getHijriMonthName(targetMonth)} ${targetHijriYear} H`
          });
        }
      } catch (error) {
        logger.error(`Error converting date for ${holiday.name}: ${error.message}`);
      }
    }
    // Handle Imlek (special case)
    else if (holidayName === 'imlek') {
      holiday = islamicHolidayMapping[holidayName];
      
      // Tanggal Imlek berubah tiap tahun, ini hanya perkiraan untuk 2025
      // Untuk tanggal akurat gunakan API kalender Lunar Tionghoa
      const imlek2025 = new Date(2025, 0, 29); // 29 Januari 2025
      
      // Hitung selisih hari
      const timeDiff = imlek2025 - now;
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      const dateStr = imlek2025.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
      // Buat pesan hari yang tersisa
      let daysMessage;
      if (daysRemaining === 0) {
        daysMessage = 'Hari ini!';
      } else if (daysRemaining === 1) {
        daysMessage = 'Besok!';
      } else if (daysRemaining < 0) {
        daysMessage = 'Sudah lewat';
      } else {
        daysMessage = `${daysRemaining} hari lagi`;
      }
      
      holiday = {
        ...holiday,
        dateStr,
        daysMessage
      };
    }
    
    return holiday || null;
  } catch (error) {
    logger.error(`Error getting specific holiday info for ${holidayName}: ${error.message}`);
    return null;
  }
}
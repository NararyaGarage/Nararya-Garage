/**
 * Level Command
 * 
 * Command untuk melihat level dan XP user.
 * Sistem leveling terpisah dari sistem ekonomi.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { logger } = require('../../utils/logger');

// File untuk data level
const levelsFilePath = path.join(__dirname, '..', '..', 'data', 'levels.json');

// Pastikan folder data ada
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file levels ada
if (!fs.existsSync(levelsFilePath)) {
  fs.writeFileSync(levelsFilePath, JSON.stringify({ users: {} }, null, 2));
}

// Config untuk level
const levelConfig = {
  // XP yang dibutuhkan untuk naik level
  // Formula: baseXP * (level * multiplier)
  baseXP: 100,
  multiplier: 1.5,
  
  // XP gain range per pesan
  minXpGain: 15,
  maxXpGain: 25,
  
  // Cooldown dalam detik
  messageCooldown: 60,
  
  // Minimal panjang pesan untuk mendapat XP
  minMessageLength: 5,
  
  // Reward poin per level up
  ngcRewardPerLevel: 50
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Lihat level dan XP kamu atau user lain')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User yang ingin dilihat levelnya')
        .setRequired(false)),
        
  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const userId = targetUser.id;
      
      // Baca data level
      const levelData = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));
      
      // Cek apakah user sudah ada di sistem level
      if (!levelData.users[userId]) {
        levelData.users[userId] = {
          xp: 0,
          level: 1,
          lastMessageTimestamp: 0,
          messageCount: 0,
          fishCount: 0,
          minigameWins: 0
        };
        
        // Simpan user baru
        fs.writeFileSync(levelsFilePath, JSON.stringify(levelData, null, 2));
      }
      
      // Ambil data user
      const userData = levelData.users[userId];
      
      // Hitung XP yang dibutuhkan untuk level berikutnya
      const nextLevelXP = getXPForLevel(userData.level + 1);
      const currentLevelXP = getXPForLevel(userData.level);
      const xpForCurrentLevel = userData.xp - currentLevelXP;
      const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
      const xpProgress = Math.floor((xpForCurrentLevel / xpRequiredForNextLevel) * 100);
      
      // Buat canvas untuk level card
      const canvas = createCanvas(800, 300);
      const ctx = canvas.getContext('2d');
      
      // Warna background
      ctx.fillStyle = '#36393f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Gambar avatar
      try {
        const avatar = await loadImage(targetUser.displayAvatarURL({ extension: 'png', size: 256 }));
        
        // Avatar lingkaran
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(avatar, 50, 50, 200, 200);
        ctx.restore();
        
        // Border avatar
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();
      } catch (error) {
        logger.error('Error loading avatar:', error);
      }
      
      // Text styling
      ctx.fillStyle = '#ffffff';
      ctx.font = '30px Arial';
      ctx.fillText(targetUser.username, 280, 80);
      
      // Level dan XP
      ctx.font = '25px Arial';
      ctx.fillText(`Level: ${userData.level}`, 280, 130);
      ctx.fillText(`XP: ${userData.xp} / ${nextLevelXP}`, 280, 170);
      
      // Statistik tambahan
      ctx.font = '20px Arial';
      ctx.fillText(`Pesan: ${userData.messageCount || 0}`, 280, 220);
      ctx.fillText(`Ikan Ditangkap: ${userData.fishCount || 0}`, 280, 250);
      ctx.fillText(`Minigame Dimenangkan: ${userData.minigameWins || 0}`, 500, 250);
      
      // Progress bar background
      ctx.fillStyle = '#555555';
      ctx.fillRect(280, 180, 450, 20);
      
      // Progress bar
      ctx.fillStyle = '#7289da';
      ctx.fillRect(280, 180, 450 * (xpProgress / 100), 20);
      
      // XP Percentage
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px Arial';
      ctx.fillText(`${xpProgress}%`, 500, 195);
      
      // Buat attachment dari canvas
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'level-card.png' });
      
      // Buat embed untuk level
      const embed = new EmbedBuilder()
        .setTitle(`💠 Level ${userData.level}`)
        .setDescription(`Level dan XP untuk ${targetUser.username}`)
        .setColor('#7289da')
        .addFields(
          { name: 'XP', value: `${userData.xp} / ${nextLevelXP} XP`, inline: true },
          { name: 'Progress', value: `${xpProgress}%`, inline: true },
          { name: 'Pesan', value: `${userData.messageCount || 0}`, inline: true },
          { name: 'Ikan Ditangkap', value: `${userData.fishCount || 0}`, inline: true },
          { name: 'Minigame Dimenangkan', value: `${userData.minigameWins || 0}`, inline: true }
        )
        .setImage('attachment://level-card.png')
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      await interaction.editReply({
        embeds: [embed],
        files: [attachment]
      });
      
    } catch (error) {
      logger.error('Error in level command:', error);
      
      if (interaction.deferred) {
        await interaction.editReply('Terjadi kesalahan saat menampilkan level.');
      } else {
        await interaction.reply({
          content: 'Terjadi kesalahan saat menampilkan level.',
          ephemeral: true
        });
      }
    }
  }
};

/**
 * Fungsi untuk menghitung XP yang dibutuhkan untuk naik level
 * @param {number} level - Level yang akan dihitung XP-nya
 * @returns {number} XP yang dibutuhkan untuk mencapai level tersebut
 */
function getXPForLevel(level) {
  let xp = 0;
  
  for (let i = 1; i < level; i++) {
    xp += Math.floor(levelConfig.baseXP * (i * levelConfig.multiplier));
  }
  
  return xp;
}

/**
 * Fungsi untuk menambah XP user saat mengirim pesan
 * Fungsi ini dipanggil dari event messageCreate
 * 
 * @param {string} userId - ID user yang mendapat XP
 * @param {string} message - Pesan yang dikirim
 * @returns {object|null} Data level up jika user naik level, null jika tidak
 */
function addXP(userId, message) {
  try {
    // Pastikan file levels ada
    if (!fs.existsSync(levelsFilePath)) {
      fs.writeFileSync(levelsFilePath, JSON.stringify({ users: {} }, null, 2));
    }
    
    // Baca data level
    const levelData = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));
    
    // Cek apakah user sudah ada di sistem level
    if (!levelData.users[userId]) {
      levelData.users[userId] = {
        xp: 0,
        level: 1,
        lastMessageTimestamp: 0,
        messageCount: 0,
        fishCount: 0,
        minigameWins: 0
      };
    }
    
    // Ambil data user
    const userData = levelData.users[userId];
    
    // Cek cooldown
    const now = Date.now();
    if (now - userData.lastMessageTimestamp < levelConfig.messageCooldown * 1000) {
      return null;
    }
    
    // Cek panjang pesan
    if (message.length < levelConfig.minMessageLength) {
      return null;
    }
    
    // Update waktu terakhir mengirim pesan
    userData.lastMessageTimestamp = now;
    
    // Tambah message count
    userData.messageCount = (userData.messageCount || 0) + 1;
    
    // Hitung XP yang didapat
    const xpGain = Math.floor(
      Math.random() * (levelConfig.maxXpGain - levelConfig.minXpGain + 1) + levelConfig.minXpGain
    );
    
    // Tambah XP
    userData.xp += xpGain;
    
    // Cek apakah user naik level
    const currentLevel = userData.level;
    let newLevel = currentLevel;
    
    // Loop untuk cek apakah XP cukup untuk naik beberapa level sekaligus
    while (userData.xp >= getXPForLevel(newLevel + 1)) {
      newLevel++;
    }
    
    // Jika naik level
    let levelUpData = null;
    if (newLevel > currentLevel) {
      userData.level = newLevel;
      
      // Reward NGC untuk level up
      const ngcReward = levelConfig.ngcRewardPerLevel * (newLevel - currentLevel);
      
      // Data level up untuk notifikasi
      levelUpData = {
        userId,
        oldLevel: currentLevel,
        newLevel,
        xp: userData.xp,
        ngcReward
      };
      
      // Tambahkan NGC reward ke ekonomi sistem
      try {
        const economyFilePath = path.join(__dirname, '..', '..', 'data', 'economy.json');
        
        if (fs.existsSync(economyFilePath)) {
          const economyData = JSON.parse(fs.readFileSync(economyFilePath, 'utf8'));
          
          if (!economyData.users[userId]) {
            economyData.users[userId] = {
              balance: 100, // NGC awal
              inventory: {},
              transactions: []
            };
          }
          
          // Tambah NGC
          economyData.users[userId].balance += ngcReward;
          
          // Catat transaksi
          economyData.users[userId].transactions.push({
            type: 'level_reward',
            amount: ngcReward,
            newLevel,
            date: new Date().toISOString()
          });
          
          // Simpan data ekonomi
          fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
        }
      } catch (error) {
        logger.error('Error updating economy for level up:', error);
      }
    }
    
    // Simpan data level
    fs.writeFileSync(levelsFilePath, JSON.stringify(levelData, null, 2));
    
    return levelUpData;
  } catch (error) {
    logger.error('Error adding XP:', error);
    return null;
  }
}

/**
 * Fungsi untuk menambah jumlah ikan dan XP dari fishing minigame
 * Dipanggil dari command fishing
 * 
 * @param {string} userId - ID user yang mendapat ikan
 * @param {number} xpGain - XP yang didapat
 * @returns {object|null} Data level up jika user naik level, null jika tidak
 */
function addFishingReward(userId, xpGain) {
  try {
    // Pastikan file levels ada
    if (!fs.existsSync(levelsFilePath)) {
      fs.writeFileSync(levelsFilePath, JSON.stringify({ users: {} }, null, 2));
    }
    
    // Baca data level
    const levelData = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));
    
    // Cek apakah user sudah ada di sistem level
    if (!levelData.users[userId]) {
      levelData.users[userId] = {
        xp: 0,
        level: 1,
        lastMessageTimestamp: 0,
        messageCount: 0,
        fishCount: 0,
        minigameWins: 0
      };
    }
    
    // Ambil data user
    const userData = levelData.users[userId];
    
    // Tambah fish count
    userData.fishCount = (userData.fishCount || 0) + 1;
    
    // Tambah XP
    userData.xp += xpGain;
    
    // Cek apakah user naik level
    const currentLevel = userData.level;
    let newLevel = currentLevel;
    
    // Loop untuk cek apakah XP cukup untuk naik beberapa level sekaligus
    while (userData.xp >= getXPForLevel(newLevel + 1)) {
      newLevel++;
    }
    
    // Jika naik level
    let levelUpData = null;
    if (newLevel > currentLevel) {
      userData.level = newLevel;
      
      // Reward NGC untuk level up
      const ngcReward = levelConfig.ngcRewardPerLevel * (newLevel - currentLevel);
      
      // Data level up untuk notifikasi
      levelUpData = {
        userId,
        oldLevel: currentLevel,
        newLevel,
        xp: userData.xp,
        ngcReward
      };
      
      // Tambahkan NGC reward ke ekonomi sistem
      try {
        const economyFilePath = path.join(__dirname, '..', '..', 'data', 'economy.json');
        
        if (fs.existsSync(economyFilePath)) {
          const economyData = JSON.parse(fs.readFileSync(economyFilePath, 'utf8'));
          
          if (!economyData.users[userId]) {
            economyData.users[userId] = {
              balance: 100, // NGC awal
              inventory: {},
              transactions: []
            };
          }
          
          // Tambah NGC
          economyData.users[userId].balance += ngcReward;
          
          // Catat transaksi
          economyData.users[userId].transactions.push({
            type: 'level_reward',
            amount: ngcReward,
            newLevel,
            date: new Date().toISOString()
          });
          
          // Simpan data ekonomi
          fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
        }
      } catch (error) {
        logger.error('Error updating economy for level up:', error);
      }
    }
    
    // Simpan data level
    fs.writeFileSync(levelsFilePath, JSON.stringify(levelData, null, 2));
    
    return {
      fishCount: userData.fishCount,
      xpGain,
      levelUp: levelUpData
    };
  } catch (error) {
    logger.error('Error adding fishing reward:', error);
    return null;
  }
}

/**
 * Fungsi untuk menambah minigame wins dan XP dari minigame
 * Dipanggil dari command minigame
 * 
 * @param {string} userId - ID user yang memenangkan minigame
 * @param {number} xpGain - XP yang didapat
 * @returns {object|null} Data level up jika user naik level, null jika tidak
 */
function addMinigameWin(userId, xpGain) {
  try {
    // Pastikan file levels ada
    if (!fs.existsSync(levelsFilePath)) {
      fs.writeFileSync(levelsFilePath, JSON.stringify({ users: {} }, null, 2));
    }
    
    // Baca data level
    const levelData = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));
    
    // Cek apakah user sudah ada di sistem level
    if (!levelData.users[userId]) {
      levelData.users[userId] = {
        xp: 0,
        level: 1,
        lastMessageTimestamp: 0,
        messageCount: 0,
        fishCount: 0,
        minigameWins: 0
      };
    }
    
    // Ambil data user
    const userData = levelData.users[userId];
    
    // Tambah minigame wins
    userData.minigameWins = (userData.minigameWins || 0) + 1;
    
    // Tambah XP
    userData.xp += xpGain;
    
    // Cek apakah user naik level
    const currentLevel = userData.level;
    let newLevel = currentLevel;
    
    // Loop untuk cek apakah XP cukup untuk naik beberapa level sekaligus
    while (userData.xp >= getXPForLevel(newLevel + 1)) {
      newLevel++;
    }
    
    // Jika naik level
    let levelUpData = null;
    if (newLevel > currentLevel) {
      userData.level = newLevel;
      
      // Reward NGC untuk level up
      const ngcReward = levelConfig.ngcRewardPerLevel * (newLevel - currentLevel);
      
      // Data level up untuk notifikasi
      levelUpData = {
        userId,
        oldLevel: currentLevel,
        newLevel,
        xp: userData.xp,
        ngcReward
      };
      
      // Tambahkan NGC reward ke ekonomi sistem
      try {
        const economyFilePath = path.join(__dirname, '..', '..', 'data', 'economy.json');
        
        if (fs.existsSync(economyFilePath)) {
          const economyData = JSON.parse(fs.readFileSync(economyFilePath, 'utf8'));
          
          if (!economyData.users[userId]) {
            economyData.users[userId] = {
              balance: 100, // NGC awal
              inventory: {},
              transactions: []
            };
          }
          
          // Tambah NGC
          economyData.users[userId].balance += ngcReward;
          
          // Catat transaksi
          economyData.users[userId].transactions.push({
            type: 'level_reward',
            amount: ngcReward,
            newLevel,
            date: new Date().toISOString()
          });
          
          // Simpan data ekonomi
          fs.writeFileSync(economyFilePath, JSON.stringify(economyData, null, 2));
        }
      } catch (error) {
        logger.error('Error updating economy for level up:', error);
      }
    }
    
    // Simpan data level
    fs.writeFileSync(levelsFilePath, JSON.stringify(levelData, null, 2));
    
    return {
      minigameWins: userData.minigameWins,
      xpGain,
      levelUp: levelUpData
    };
  } catch (error) {
    logger.error('Error adding minigame win:', error);
    return null;
  }
}

// Export fungsi-fungsi untuk digunakan di file lain
module.exports.addXP = addXP;
module.exports.addFishingReward = addFishingReward;
module.exports.addMinigameWin = addMinigameWin;
module.exports.getXPForLevel = getXPForLevel;
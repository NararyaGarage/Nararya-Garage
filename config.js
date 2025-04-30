/**
 * Bot Configuration
 * 
 * This file contains all configurable settings for the Nararya Garage Discord Bot
 * including server IDs, channel IDs, role IDs, and notification settings
 * 
 * FITUR UTAMA:
 * - Notifikasi realtime: IDN Live, Showroom, Twitter, Instagram, TikTok, YouTube, dll
 * - Game interaktif: Tebak nama, Tebak lagu, Gacha member JKT48/48Group
 * - Informasi JKT48: Member, Theater, Event, Berita
 * - Moderasi server: Ban, Kick, Mute, Clear, dll
 * - Sistem tiket dengan button
 * - Download media dan edit media
 * - Webhook kustom dengan banner
 * - Reminder event dan theater
 * - Dan banyak lagi
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

module.exports = {
  // Bot settings for Discord API
  clientId: process.env.CLIENT_ID || '1352565363698700348', // ID client aplikasi Discord
  guildId: process.env.GUILD_ID || '1297112621258113024',  // ID server Discord (Nararya Garage Community Server)
  
  // Bot information
  botInfo: {
    name: '𝙽𝚊𝚛𝚊𝚛𝚢𝚊 𝙶𝚊𝚛𝚊𝚐𝚎',
    version: '1.1.0', // Meningkatkan versi untuk mencerminkan pembaruan
    author: 'Nararya Garage Developer',
    inviteLink: 'https://discord.gg/bM8jpT5e7Z',
    repository: 'https://github.com/nararya-garage/nararya-garage-bot',
    supportServer: 'https://discord.gg/bM8jpT5e7Z'
  },
  
  // Discord IDs
  // Discord channels where notifications will be sent
  channels: {
    // Theater and event notifications
    theaterSchedule: '1352331088172941446',
    eventSchedule: '1352331088172941446',
    theaterHistory: '1297127385765777418',
    
    // Live notifications - channel sr-idn-theater dari screenshot yang dikirim
    liveNotifications: '1297112621870481521', // Default jika tidak ada channel khusus
    idnLiveNotifications: '1352331123868024892', // ID channel 'sr-idn-theater'
    showroomNotifications: '1352331123868024892', // ID channel 'sr-idn-theater'
    
    // Social media notifications - channel jkt48-news dari screenshot yang dikirim
    twitterNotifications: '1352331088172941447', // ID channel 'jkt48-news'
    instagramNotifications: '1352331088172941447', // ID channel 'jkt48-news'
    youtubeNotifications: '1352331088172941447', // ID channel 'jkt48-news'
    tiktokNotifications: '1352331088172941447', // ID channel 'jkt48-news'
    threadsNotifications: '1352331088172941447', // ID channel 'jkt48-news'
    newsNotifications: '1352331088172941447', // ID channel 'jkt48-news'
    
    // Store notifications
    storeNotifications: '1352575622517362709',
    
    // Server member notifications
    welcomeChannel: '1297112621685669941',
    goodbyeChannel: '1297112621685669942',
    boosterChannel: '1297112621685669943',
    
    // System notifications
    logChannel: '1297112621555777540',
    introductionChannel: '1297255485577105470',
    rulesChannel: '1297112621555777539',
    modLogChannel: '1353545202027073597',
    reportChannel: '1297112622482718729',
    
    // Request channels
    roleRequestChannel: '1353580150075428885',
    
    // Ramadhan notifications
    ramadhanChannel: '1349339422688280650',
    
    // Backup channel for notifications if others fail
    fallbackChannel: '1297112621555777540',

    // CDID Studios Trello updates
    cdidUpdatesChannel: '1324594158731661323'
  },
  
  // Discord roles to mention in notifications
  roles: {
    // Notification roles
    newsNotification: '1343230683342176277',
    theaterNotification: '1343632720106098799',
    eventNotification: '1343632801727123506',
    liveNotification: '1343230683342176277',
    cdidNotification: '1343251160911319100',
    playstoreNotification: '1343251297742225419',
    
    // Member roles
    memberRole: '1343232377840734281',
    verifiedRole: '1343232377840734281',
    
    // Donator roles
    donator5k: '1343228612371026032',
    donator15k: '1343228429981450310',
    donator25k: '1343227775364104284',
    
    // Booster role
    boosterRole: '1330086356440973313',
    
    // Mod roles with permission to use mod commands
    modRoles: [
      '1343224344591077386', 
      '1343224002113699973', 
      '1343223432334282894', 
      '1343224904182661232', 
      '1343223596792811561', 
      '1343224119159947315', 
      '1343219680650727527', 
      '1343220918096363520', 
      '1343221052125479003'
    ]
  },
  
  // Embed styling
  embeds: {
    color: '#FF6200',
    author: {
      name: '𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 𝙱𝙾𝚃',
      iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
    },
    footer: {
      text: '𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁',
      iconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&'
    }
  },
  
  // Bot settings
  settings: {
    // Default language
    defaultLanguage: 'id',
    
    // Default timezone (Indonesia/Jakarta)
    timezone: 'Asia/Jakarta',
    
    // Default prefix (for legacy commands)
    prefix: '!',
    
    // Status rotation interval (in milliseconds)
    statusInterval: 30000,
    
    // Check intervals for different services (in milliseconds)
    checkIntervals: {
      showroom: 30000,        // 30 seconds
      idn: 30000,             // 30 seconds
      youtube: 300000,        // 5 minutes
      twitter: 300000,        // 5 minutes
      instagram: 300000,      // 5 minutes
      tiktok: 300000,         // 5 minutes
      threads: 300000,        // 5 minutes
      website: 900000,        // 15 minutes
      calendar: 3600000,      // 1 hour
      playstore: 3600000,     // 1 hour
      trello: 3600000         // 1 hour
    },
    
    // Server limits for safety
    limits: {
      // Maximum daily game plays per user
      dailyTebakNama: 35,
      dailyTebakLagu: 35,
      dailyGacha: 15,
      
      // Maximum members to display in lists
      maxMembersInList: 25,
      
      // Maximum embeds per message
      maxEmbedsPerMessage: 10,
      
      // Maximum characters in messages
      maxMessageLength: 2000
    },
    
    // Cache durations (in milliseconds)
    cacheDurations: {
      members: 3600000,       // 1 hour
      setlists: 86400000,     // 24 hours
      songs: 86400000,        // 24 hours
      lives: 60000,           // 1 minute
      social: 300000,         // 5 minutes
      theater: 3600000,       // 1 hour
      news: 3600000,          // 1 hour
      weather: 1800000,       // 30 minutes
      prayerTimes: 86400000   // 24 hours
    }
  },
  
  // URLs for JKT48 resources
  urls: {
    // Official websites
    official: 'https://jkt48.com',
    news: 'https://jkt48.com/news/list?lang=id',
    theater: 'https://jkt48.com/theater/schedule?lang=id',
    calendar: 'https://jkt48.com/calendar/list?lang=id',
    
    // Social media
    twitter: 'https://twitter.com/officialJKT48',
    instagram: 'https://www.instagram.com/jkt48/',
    youtube: 'https://youtube.com/@jkt48',
    tiktok: 'https://www.tiktok.com/@jkt48.official',
    
    // Showroom
    showroom: 'https://www.showroom-live.com/room/profile?room_id=318664',
    
    // IDN
    idn: 'https://www.idn.app/jkt48-official',
    
    // Fan communities
    fanbase: 'https://discord.gg/bM8jpT5e7Z',
    
    // DeepCrush
    deepcrushBase: 'https://dc.crstlnz.my.id/watch/'
  },
  
  // Custom emojis
  emojis: {
    jkt48Logo: '🎭',
    verified: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    success: '✅',
    loading: '⏳',
    live: '🔴',
    theater: '🎭',
    event: '📅',
    twitter: '🐦',
    instagram: '📸',
    youtube: '📺',
    tiktok: '🎵',
    news: '📰',
    store: '🛒',
    birthday: '🎂',
    star: '⭐',
    heart: '❤️',
    ticket: '🎫',
    music: '🎵',
    game: '🎮',
    gift: '🎁'
  },
  
  // Game settings
  games: {
    // Gacha tiers and rates
    gacha: {
      tiers: [
        { name: 'Common', rate: 45, color: '#CCCCCC' },
        { name: 'Uncommon', rate: 30, color: '#1EFF00' },
        { name: 'Rare', rate: 15, color: '#0070DD' },
        { name: 'Epic', rate: 8, color: '#A335EE' },
        { name: 'Legendary', rate: 2, color: '#FF8000' },
        { name: 'Mythic', rate: 0.5, color: '#FF0000' }
      ]
    }
  }
};
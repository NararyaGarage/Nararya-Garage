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
  // Bot Configuration
  prefix: '!', // Legacy prefix, kept for compatibility
  devMode: false,
  defaultCooldown: 3, // Default cooldown in seconds
  ownerID: process.env.OWNER_ID || '123456789012345678', // Owner's Discord ID

  // Server Configuration
  mainGuildID: process.env.MAIN_GUILD_ID || '1297112621555777535', // Nararya Garage Server ID
  
  // Notification Channels IDs
  notificationChannels: {
    newsChannel: '1297112621870481521', // JKT48 News
    theaterChannel: '1352331088172941446', // JKT48 Theater
    theaterHistoryChannel: '1297127385765777418', // JKT48 Theater History
    eventChannel: '1311970340901224469', // JKT48 Event
    showroomReminderChannel: '1297127308611817553', // Showroom IDN Reminder
    webstoreChannel: '1352575622517362709', // Webstore & Shopee & Tokopedia
    youtubeChannel: '1297112622768062490', // YouTube JKT48 & JKT48 TV
    twitterChannel: '1297112622768062487', // Twitter JKT48
    tiktokChannel: '1297112622768062489', // TikTok JKT48
    instagramChannel: '1297112622768062488', // Instagram JKT48
    threadsChannel: '1297112622768062488', // Threads JKT48
    vtuberChannel: '1322151760701296642', // VTuber JKT48 YouTube
    memberSocialChannel: '1356580054582431785', // Member Instagram, Threads, TikTok, Twitter
    trelloChannel: '1324594158731661323', // CDID Studios Trello
    playstoreChannel: '1297112621870481520', // Playstore Studio
    welcomeChannel: '1297112621555777538', // Welcome messages
    rulesChannel: '1297112621555777539', // Rules
    logChannel: '1297112621555777540', // Logs (moderation)
    reportChannel: '1297112622482718729', // User reports
    introductionChannel: '1297255485577105470', // Self-introduction
    modLogChannel: '1353545202027073597', // Mod Log
    ticketChannel: '1297112622482718730', // Ticket system
    boosterChannel: '1297112621685669943', // Server booster notifications
    donationChannel: '1297112621685669941', // Donation notifications
    roleRequestChannel: '1353580150075428885', // Role request channel
    ramadhanChannel: '1349339422688280650', // Ramadhan notifications
  },
  
  // Role IDs
  roles: {
    // Moderation Roles
    adminRole: '1343219680650727527',
    modRole: '1343220918096363520',
    superModRole: '1343221052125479003',
    reviewRole: [
      '1343224344591077386', 
      '1343224002113699973', 
      '1343223432334282894', 
      '1343224904182661232', 
      '1343223596792811561', 
      '1343224119159947315',
      '1343219680650727527',
      '1343220918096363520',
      '1343221052125479003'
    ],
    
    // Member Roles
    memberRole: '1343232377840734281',
    
    // Notification Roles
    newsRole: '1343230683342176277',
    theaterRole: '1343632720106098799',
    eventRole: '1343632801727123506',
    cdidRole: '1343251160911319100',
    playstoreRole: '1343251297742225419',
    
    // Special Roles
    boosterRole: '1330086356440973313',
    donorRole5k: '1343228612371026032',
    donorRole15k: '1343228429981450310',
    donorRole25k: '1343227775364104284',
  },
  
  // Notification Settings
  notificationSettings: {
    checkInterval: 15000, // Check for new content every 15 seconds
    maxRetries: 3, // Maximum retry attempts for failed requests
    timeout: 10000, // Request timeout in milliseconds
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', // User-Agent for web scraping
    embedColor: 0xFF6200, // Orange color (JKT48 theme)
    authorName: '𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 𝙱𝙾𝚃',
    authorIconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&',
    footerText: '𝙽𝙰𝚁𝙰𝚁𝚈𝙰 𝙶𝙰𝚁𝙰𝙶𝙴 - 𝙲𝙾𝙼𝙼𝚄𝙽𝙸𝚃𝚈 𝚂𝙴𝚁𝚅𝙴𝚁',
    footerIconURL: 'https://media.discordapp.net/attachments/1297153787454296074/1341294189337378849/480416095_926454325972260_2363408671788321894_n.jpg?ex=67dd060e&is=67dbb48e&hm=505d9ed1abe771e3f387a74175e08fde512de339d6fcf7cb4ca3e36a8f008cb4&',
    discordInviteLink: 'https://discord.gg/bM8jpT5e7Z',
    remindTimes: {
      morning: '06:00', // Pengingat pagi hari untuk acara hari ini
      beforeEvent: 30, // Pengingat 30 menit sebelum acara dimulai
    }
  },
  
  // Game Settings
  gameSettings: {
    gacha: {
      dailyLimit: 15, // Daily gacha limit
      rarities: {
        common: { chance: 50, color: 0x808080 },
        uncommon: { chance: 30, color: 0x00FF00 },
        rare: { chance: 15, color: 0x0099FF },
        epic: { chance: 3, color: 0x9932CC },
        legendary: { chance: 1.5, color: 0xFF9900 },
        mythic: { chance: 0.5, color: 0xFF0000 }
      }
    },
    quiz: {
      dailyLimit: 35, // Daily quiz limit
      timeLimit: 30, // Time limit in seconds to answer
      pointsPerCorrect: 10,
      pointsLostPerWrong: -5
    }
  },
  
  // URLs for data sources
  dataSources: {
    jkt48Website: 'https://jkt48.com/',
    jkt48News: 'https://jkt48.com/news/list?lang=id',
    jkt48Calendar: 'https://jkt48.com/calendar/list?lang=id',
    showroomJKT48: 'https://www.showroom-live.com/JKT48_Official',
    idnAppJKT48: 'https://www.idn.app/jkt48official',
    youtubeJKT48: 'https://youtube.com/@jkt48official',
    twitterJKT48: 'https://twitter.com/officialJKT48',
    instagramJKT48: 'https://www.instagram.com/jkt48official/',
    tiktokJKT48: 'https://www.tiktok.com/@jkt48.official',
    trelloCDID: 'https://trello.com/b/Q10Tb97m/cdid-studios',
    playstoreStudio: 'https://play.google.com/store/apps/dev?id=8712791193416314130',
  },
  
  // Cooldowns for commands
  cooldowns: {
    default: 3,
    games: 5,
    media: 15,
    moderation: 2
  },
  
  // Theater and event reminder settings
  reminderSettings: {
    theaterReminders: [
      { time: 24 * 60 * 60 * 1000, message: "24 jam lagi sebelum show theater dimulai!" },
      { time: 2 * 60 * 60 * 1000, message: "2 jam lagi sebelum show theater dimulai!" },
      { time: 30 * 60 * 1000, message: "30 menit lagi sebelum show theater dimulai!" }
    ],
    eventReminders: [
      { time: 24 * 60 * 60 * 1000, message: "24 jam lagi sebelum event dimulai!" },
      { time: 2 * 60 * 60 * 1000, message: "2 jam lagi sebelum event dimulai!" },
      { time: 30 * 60 * 1000, message: "30 menit lagi sebelum event dimulai!" }
    ]
  },
  
  // Auto-moderation settings
  automodSettings: {
    enabled: true,
    spamThreshold: 5, // Number of messages in timeframe
    spamTimeframe: 5, // Timeframe in seconds
    maxMentions: 5, // Maximum mentions per message
    maxLinks: 3, // Maximum links per message
    maxEmojis: 10, // Maximum emojis per message
    ignoredChannels: [], // Channel IDs to ignore
    ignoredRoles: [], // Role IDs to ignore
    toxicityThreshold: 0.8, // Threshold for toxic content detection
    punishments: {
      warn: 1, // Number of violations before warning
      mute: 3, // Number of violations before muting
      kick: 5, // Number of violations before kicking
      ban: 10 // Number of violations before banning
    }
  },
  
  // Ticket system settings
  ticketSettings: {
    enabled: true,
    categories: {
      general: {
        name: 'General Support',
        emoji: '🎫',
        color: 0x00FF00
      },
      bot: {
        name: 'Bot Help',
        emoji: '❓',
        color: 0x0099FF
      },
      event: {
        name: 'Event Request',
        emoji: '📅',
        color: 0x9900FF
      }
    },
    ticketCategoryID: '1297112622768062486', // Category to create tickets in
    supportRoles: ['1343224344591077386', '1343224002113699973', '1343223432334282894'] // Roles that can see tickets
  },
  
  // Self introduction system
  selfIntroSettings: {
    required: true,
    minCharacters: 50,
    format: '╭┈➤ Perkenalan Diri Anda\n│ Nama:\n│ Umur:\n│ Oshi:\n│ Asal Kota:\n╰┈➤ Semoga Betah Di Server Kami Ya',
    roleGiven: '1343232377840734281' // Role given after valid introduction
  },
  
  // Gold to Rupiah conversion rate for IDN Live
  goldToRupiah: 700, // 1 Gold ≈ Rp 700
};
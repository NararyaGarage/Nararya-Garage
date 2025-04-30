/**
 * AI Chat Command
 * 
 * Command untuk chatting dengan AI tanpa menggunakan API eksternal.
 * Bot akan merespon sesuai dengan context JKT48.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

// Path untuk menyimpan data chat history
const dataFilePath = path.join(__dirname, '..', '..', 'data', 'ai_chat_history.json');

// Pastikan direktori data ada
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Buat file history jika belum ada
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify({
    conversations: {}
  }, null, 2));
}

// Dataset untuk pengetahuan umum
const GENERAL_KNOWLEDGE = [
  { 
    keywords: ['ai', 'artificial intelligence', 'kecerdasan buatan'], 
    response: 'AI (Artificial Intelligence) atau Kecerdasan Buatan adalah teknologi yang memungkinkan komputer dan mesin untuk meniru kecerdasan manusia, belajar dari pengalaman, dan melakukan tugas-tugas yang biasanya membutuhkan kecerdasan manusia.' 
  },
  { 
    keywords: ['discord', 'server', 'bot', 'channel', 'server discord'], 
    response: 'Discord adalah platform komunikasi populer yang memungkinkan pengguna berinteraksi melalui pesan teks, suara, dan video. Server Discord adalah ruang komunitas dengan berbagai channel untuk percakapan dan bot seperti saya untuk menambah fungsionalitas.' 
  },
  { 
    keywords: ['internet', 'web', 'online', 'teknologi', 'gadget', 'smartphone'], 
    response: 'Internet adalah jaringan komputer global yang menghubungkan miliaran perangkat di seluruh dunia, memungkinkan pertukaran informasi dan komunikasi. Teknologi digital terus berkembang dengan smartphone, gadget, dan berbagai aplikasi yang menjadi bagian penting dari kehidupan modern.' 
  },
  { 
    keywords: ['game', 'gaming', 'bermain', 'esport', 'video game', 'gamer'], 
    response: 'Gaming adalah aktivitas bermain video game yang berkembang menjadi industri besar, dengan esport (kompetisi professional), game mobile, dan berbagai genre dari action, RPG, strategi, hingga simulasi. Banyak orang menikmati gaming sebagai hiburan dan hobi.' 
  },
  { 
    keywords: ['musik', 'lagu', 'artis', 'penyanyi', 'band', 'konser', 'album'], 
    response: 'Musik adalah bentuk seni universal yang terdiri dari berbagai genre seperti pop, rock, jazz, klasik, dan banyak lagi. Musik sering dimainkan oleh artis, band, atau penyanyi, dan dipublikasikan dalam album atau single, serta ditampilkan dalam konser langsung.' 
  },
  { 
    keywords: ['film', 'movie', 'series', 'aktor', 'aktris', 'bioskop', 'netflix', 'streaming'], 
    response: 'Film dan series adalah karya audio-visual yang sering dibintangi aktor dan aktris terkenal. Film biasanya ditayangkan di bioskop atau platform streaming seperti Netflix, Disney+, dan lainnya. Ada berbagai genre seperti action, romance, komedi, horor, dan sci-fi.' 
  },
  { 
    keywords: ['pendidikan', 'sekolah', 'kuliah', 'belajar', 'pelajaran', 'ujian', 'tugas'], 
    response: 'Pendidikan adalah proses pembelajaran yang biasanya berlangsung di sekolah atau universitas. Pendidikan melibatkan berbagai pelajaran, tugas, ujian, dan aktivitas belajar untuk memperoleh pengetahuan dan keterampilan yang berguna untuk masa depan.' 
  },
  { 
    keywords: ['kesehatan', 'olahraga', 'fitnes', 'diet', 'nutrisi', 'makanan', 'minuman'], 
    response: 'Kesehatan adalah keadaan fisik dan mental yang baik. Menjaga kesehatan melibatkan olahraga teratur, diet seimbang, nutrisi yang baik, dan pola hidup sehat. Kesehatan yang baik membantu kita menjalani kehidupan yang lebih bahagia dan produktif.' 
  }
];

// Dataset untuk chat random
const GENERAL_CHAT_RESPONSES = [
  {
    keywords: ['hi', 'hai', 'halo', 'hello', 'hallo', 'hey'],
    responses: [
      'Hai! Ada yang bisa aku bantu?',
      'Halo! Apa kabar hari ini?',
      'Hey~ Senang bertemu denganmu!',
      'Hai hai! Apa yang ingin kamu ketahui hari ini?'
    ]
  },
  {
    keywords: ['pagi', 'morning', 'ohayou', 'ohayo'],
    responses: [
      'Selamat pagi! Semangat untuk hari ini ya!',
      'Pagi~ Sudah sarapan?',
      'Ohayou gozaimasu! Hari yang cerah untuk mendukung JKT48!',
      'Selamat pagi! Semoga harimu menyenangkan!'
    ]
  },
  {
    keywords: ['siang', 'afternoon', 'konnichiwa'],
    responses: [
      'Selamat siang! Jangan lupa makan siang ya!',
      'Konnichiwa~ Apa kabar hari ini?',
      'Siang! Tetap semangat untuk aktivitas selanjutnya!',
      'Selamat siang! Jangan lupa istirahat sejenak~'
    ]
  },
  {
    keywords: ['sore', 'evening'],
    responses: [
      'Selamat sore! Mau nonton theater JKT48 hari ini?',
      'Sore~ Bagaimana harimu?',
      'Selamat sore! Jangan lupa cek jadwal perform JKT48 hari ini!',
      'Sore yang indah untuk mendengarkan lagu JKT48!'
    ]
  },
  {
    keywords: ['malam', 'night', 'konbanwa'],
    responses: [
      'Selamat malam! Jangan begadang ya!',
      'Konbanwa~ Sudah makan malam?',
      'Malam yang indah untuk streaming lagu JKT48!',
      'Selamat malam! Mimpi indah dan semoga bertemu oshi-mu di mimpi!'
    ]
  },
  {
    keywords: ['makasih', 'thanks', 'terima kasih', 'thx', 'tq', 'thank you', 'arigato'],
    responses: [
      'Sama-sama! Senang bisa membantu!',
      'Tidak masalah! Ada yang bisa dibantu lagi?',
      'Douita~ Selalu siap membantumu!',
      'Dengan senang hati! Ada pertanyaan lain tentang JKT48?'
    ]
  },
  {
    keywords: ['bye', 'dadah', 'selamat tinggal', 'sampai jumpa', 'good bye', 'daa'],
    responses: [
      'Bye bye! Sampai jumpa lagi!',
      'Dadah~ Jangan lupa support JKT48 ya!',
      'Sampai jumpa! Ditunggu obrolan selanjutnya!',
      'Sayonara! Semoga harimu menyenangkan!'
    ]
  }
];

// Dataset untuk pertanyaan apa itu ...
const WHAT_IS_RESPONSES = [
  { 
    keywords: ['jkt48'], 
    response: 'JKT48 adalah idol group asal Indonesia yang merupakan sister group dari AKB48 dari Jepang. Mereka didirikan pada tahun 2011 dan telah menjadi salah satu grup idola terbesar di Indonesia dengan theater sendiri di fX Sudirman Jakarta.' 
  },
  { 
    keywords: ['oshi', 'oshimen'], 
    response: 'Oshi atau Oshimen adalah istilah untuk member JKT48 yang paling kamu sukai atau favoritkan. Orang yang memiliki oshi yang sama disebut "Oshi-gumi".' 
  },
  { 
    keywords: ['theater', 'teater'], 
    response: 'JKT48 Theater adalah tempat pertunjukan tetap JKT48 yang terletak di Lantai 4 fX Sudirman Mall, Jakarta. Disana para member menampilkan berbagai setlist secara reguler.' 
  },
  { 
    keywords: ['handshake', 'hs'], 
    response: 'Handshake Event adalah acara jabat tangan dengan member JKT48. Fans bisa berbicara singkat dengan member sambil berjabat tangan. Tiket handshake biasanya didapatkan dari pembelian CD single.' 
  },
  { 
    keywords: ['2-shot', 'two shot', 'foto berdua'], 
    response: '2-shot adalah event dimana fans bisa berfoto berdua dengan member JKT48. Mirip dengan handshake tapi kamu bisa mendapatkan foto bersama member favoritmu.' 
  },
  { 
    keywords: ['senbatsu', 'sembatsu'], 
    response: 'Senbatsu adalah member-member terpilih yang tampil di single utama JKT48. Biasanya dipilih melalui voting fans dalam event seperti Senbatsu Sousenkyo (pemilihan umum).' 
  },
  { 
    keywords: ['kennin', 'kenin', 'keiran'], 
    response: 'Kennin adalah status dimana seorang member menjadi anggota dari dua tim sekaligus. Sedangkan Keiran adalah perpindahan member dari satu tim ke tim lainnya.' 
  },
  { 
    keywords: ['undergirls', 'under'], 
    response: 'Undergirls adalah member-member yang tampil di b-side single JKT48, yang tidak masuk dalam Senbatsu (lagu utama).' 
  },
  { 
    keywords: ['ngt48', 'bnk48', 'akb48', 'nmb48', 'hkt48', 'mnl48', 'sgb48', 'sgo48'], 
    response: 'Itu adalah sister group dari AKB48. NGT48 di Niigata, BNK48 di Bangkok, NMB48 di Osaka, HKT48 di Hakata, MNL48 di Manila, SGB48 di Shanghai, dan SGO48 di Saigon. JKT48 adalah sister group di Jakarta.' 
  }
];

// Dataset untuk pertanyaan siapa member...
const MEMBER_INFO = [
  { 
    keywords: ['freya', 'feni', 'gendis', 'gita', 'adel', 'amanda', 'ashel', 'christy', 'cynthia'], 
    response: 'Dia adalah salah satu member JKT48. Setiap member memiliki kepribadian, bakat, dan charm point yang berbeda-beda. Kamu bisa mengetahui info lebih lengkap tentang mereka di website resmi JKT48 atau melalui akun media sosial mereka.' 
  },
  { 
    keywords: ['danella', 'daisy', 'ela', 'elin', 'fiony', 'flora', 'callie', 'gracie', 'gracia'], 
    response: 'Dia adalah salah satu member JKT48. Para member aktif di berbagai platform media sosial seperti Instagram, TikTok, X/Twitter, dan YouTube. Kamu bisa mengikuti update terbaru mereka disana.' 
  },
  { 
    keywords: ['indah', 'indira', 'jessi', 'kathrina', 'lana', 'marsha', 'michie', 'muthe', 'nachia'], 
    response: 'Dia adalah salah satu member JKT48. JKT48 memiliki puluhan member yang terbagi dalam beberapa tim. Setiap member memiliki warna pengenal (image color) dan slogan (catchphrase) unik.' 
  },
  { 
    keywords: ['raisha', 'lia', 'ribka', 'oniel', 'olivia', 'reva', 'regie', 'shani', 'yessica'], 
    response: 'Dia adalah salah satu member JKT48. Para member JKT48 memiliki berbagai bakat seperti menyanyi, menari, MC, akting, dan lainnya. Mereka juga mengembangkan bakat di luar aktivitas grup.' 
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat dengan AI JKT48 bot')
    .addStringOption(option =>
      option
        .setName('pesan')
        .setDescription('Pesan yang ingin kamu sampaikan ke AI')
        .setRequired(true)),
        
  async execute(interaction) {
    try {
      // Ambil pesan dari user
      const message = interaction.options.getString('pesan');
      const userId = interaction.user.id;
      
      // deferReply sudah ditangani oleh commandWrapper, jadi kita tidak perlu memanggilnya lagi di sini
      
      // Tentukan respons berdasarkan pesan
      let response = generateResponse(message, userId);
      
      // Buat embed
      const embed = new EmbedBuilder()
        .setTitle('🤖 AI Chat')
        .setDescription(response)
        .setColor('#FF6200') // Warna JKT48
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Kirim respons
      await interaction.editReply({ embeds: [embed] });
      
      // Simpan chat history
      saveChat(userId, message, response);
      
    } catch (error) {
      logger.error('Error in chat command:', error);
      
      if (interaction.deferred) {
        await interaction.editReply({ content: 'Maaf, ada error saat memproses chat. Coba lagi nanti ya!' });
      } else {
        await interaction.reply({ content: 'Maaf, ada error saat memproses chat. Coba lagi nanti ya!', ephemeral: true });
      }
    }
  }
};

/**
 * Generate respons berdasarkan pesan user
 * @param {string} message - Pesan dari user
 * @param {string} userId - ID user
 * @returns {string} Respons untuk user
 */
function generateResponse(message, userId) {
  const lowerMessage = message.toLowerCase();
  
  // Cek apakah ada kata kunci greeting
  for (const chatPattern of GENERAL_CHAT_RESPONSES) {
    for (const keyword of chatPattern.keywords) {
      if (lowerMessage.includes(keyword)) {
        // Pilih respons acak dari daftar yang tersedia
        return chatPattern.responses[Math.floor(Math.random() * chatPattern.responses.length)];
      }
    }
  }
  
  // Cek apakah pertanyaan tentang "apa itu ..."
  if (lowerMessage.includes('apa itu') || lowerMessage.includes('apa sih') || lowerMessage.includes('what is')) {
    for (const whatIs of WHAT_IS_RESPONSES) {
      for (const keyword of whatIs.keywords) {
        if (lowerMessage.includes(keyword)) {
          return whatIs.response;
        }
      }
    }
  }
  
  // Cek apakah pertanyaan tentang "siapa ..."
  if (lowerMessage.includes('siapa') || lowerMessage.includes('who is')) {
    for (const memberInfo of MEMBER_INFO) {
      for (const keyword of memberInfo.keywords) {
        if (lowerMessage.includes(keyword)) {
          return memberInfo.response;
        }
      }
    }
  }
  
  // Cek pengetahuan umum
  for (const knowledge of GENERAL_KNOWLEDGE) {
    for (const keyword of knowledge.keywords) {
      if (lowerMessage.includes(keyword)) {
        return knowledge.response;
      }
    }
  }
  
  // Default response jika tidak ada yang cocok
  const defaultResponses = [
    "Maaf, aku tidak mengerti pertanyaanmu. Coba tanyakan tentang JKT48, member, theater, atau event mereka?",
    "Hmm, aku masih belajar. Tapi kamu bisa bertanya tentang JKT48 atau membernya!",
    "Aku masih baru, jadi pengetahuanku terbatas. Aku lebih paham tentang JKT48 dan 48 Group.",
    "Bisa kamu bertanya dengan cara lain? Aku lebih handal menjawab pertanyaan tentang JKT48."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

/**
 * Simpan history chat
 * @param {string} userId - ID user
 * @param {string} userMessage - Pesan dari user
 * @param {string} botResponse - Respons dari bot
 */
function saveChat(userId, userMessage, botResponse) {
  try {
    const chatHistory = loadChatHistory();
    
    if (!chatHistory.conversations[userId]) {
      chatHistory.conversations[userId] = [];
    }
    
    // Tambahkan interaksi ke history
    chatHistory.conversations[userId].push({
      userMessage,
      botResponse,
      timestamp: new Date().toISOString()
    });
    
    // Batasi history ke 10 pesan terakhir
    if (chatHistory.conversations[userId].length > 10) {
      chatHistory.conversations[userId] = chatHistory.conversations[userId].slice(-10);
    }
    
    // Simpan ke file
    fs.writeFileSync(dataFilePath, JSON.stringify(chatHistory, null, 2));
  } catch (error) {
    logger.error('Error saving chat history:', error);
  }
}

/**
 * Load chat history dari file
 * @returns {Object} Chat history
 */
function loadChatHistory() {
  try {
    if (fs.existsSync(dataFilePath)) {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }
    return { conversations: {} };
  } catch (error) {
    logger.error('Error loading chat history:', error);
    return { conversations: {} };
  }
}
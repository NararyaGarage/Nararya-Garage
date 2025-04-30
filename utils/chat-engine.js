/**
 * AI Chat Engine Module
 * 
 * Modul ini menyediakan fallback untuk fitur AI chat tanpa menggunakan API key eksternal.
 * Menggunakan dataset respons terstruktur berbasis keyword untuk mensimulasikan kecerdasan buatan.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { logger } = require('./logger');

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

// Dataset untuk pertanyaan FAQ
const FAQ_RESPONSES = [
  {
    keywords: ['cara', 'gimana', 'bagaimana', 'how', 'tutorial'],
    response: 'Untuk informasi cara melakukan sesuatu yang terkait JKT48, silakan kunjungi website resmi JKT48 di jkt48.com atau cek media sosial resmi mereka untuk panduan terbaru.'
  },
  {
    keywords: ['kapan', 'when', 'jadwal', 'schedule', 'tanggal', 'date'],
    response: 'Untuk informasi jadwal terbaru tentang theater performance, handshake event, atau event JKT48 lainnya, silakan cek official website (jkt48.com) atau akun Instagram resmi @jkt48official.'
  },
  {
    keywords: ['berapa', 'how much', 'harga', 'price', 'tiket', 'ticket', 'cost'],
    response: 'Harga tiket theater JKT48 dan event lainnya bervariasi. Untuk informasi terbaru tentang harga, silakan cek website resmi JKT48 di jkt48.com atau akun media sosial resmi mereka.'
  },
  {
    keywords: ['dimana', 'where', 'lokasi', 'location', 'tempat', 'place'],
    response: 'JKT48 Theater terletak di lantai 4 fX Sudirman, Jakarta. Untuk event lain seperti handshake, lokasi dapat bervariasi dan diumumkan melalui website resmi JKT48.'
  }
];

// Dataset untuk pertanyaan bertingkat
const MULTILEVEL_RESPONSES = {
  'apa': {
    'itu': {
      'jkt48': 'JKT48 adalah idol group asal Indonesia yang merupakan sister group dari AKB48 dari Jepang.',
      'oshi': 'Oshi adalah istilah untuk member JKT48 yang paling kamu sukai.',
      'theater': 'Theater JKT48 adalah tempat pertunjukan tetap JKT48 di lantai 4 fX Sudirman, Jakarta.'
    },
    'kabar': {
      'jkt48': 'JKT48 sedang aktif dengan berbagai kegiatan dan perform. Untuk update terbaru, silakan cek akun media sosial resmi mereka.',
      'member': 'Para member JKT48 sedang aktif berkegiatan. Untuk update terbaru tentang member tertentu, silakan cek akun media sosial pribadi mereka.'
    }
  },
  'siapa': {
    'member': {
      'terbaru': 'Untuk informasi member terbaru JKT48, silakan cek website resmi JKT48 di jkt48.com untuk daftar terlengkap.',
      'jkt48': 'JKT48 memiliki banyak member yang terbagi ke dalam beberapa tim. Untuk daftar lengkap, silakan kunjungi website resmi JKT48.'
    },
    'captain': {
      'team': 'Informasi captain tim bisa berubah seiring waktu. Silakan cek website resmi JKT48 untuk informasi terkini.'
    }
  }
};

// Dataset untuk pertanyaan dalam bahasa lain
const LANGUAGE_RESPONSES = {
  // Bahasa Inggris
  'english': {
    keywords: ['what', 'who', 'when', 'where', 'which', 'why', 'how', 'can', 'could', 'would', 'should', 'may', 'might', 'will', 'do', 'hello', 'hi'],
    response: 'I can understand and respond in English. JKT48 is an Indonesian idol group based in Jakarta, which is a sister group of AKB48 from Japan. They perform regularly at their own theater in fX Sudirman, Jakarta.'
  },
  // Bahasa Jepang
  'japanese': {
    keywords: ['こんにちは', 'おはよう', 'こんばんは', 'ありがとう', 'さようなら', 'はじめまして', 'かわいい', 'すごい', 'チーム', 'メンバー'],
    response: 'こんにちは！JKT48はインドネシアのアイドルグループで、AKB48の姉妹グループです。彼らは定期的にジャカルタのfXスディルマンにある自分たちの劇場でパフォーマンスを行っています。'
  },
  // Bahasa Mandarin
  'mandarin': {
    keywords: ['你好', '谢谢', '再见', '什么', '谁', '哪里', '怎么', '为什么', '成员', '团队'],
    response: '你好！JKT48是印度尼西亚的偶像团体，是日本AKB48的姐妹团体。他们定期在雅加达fX Sudirman的剧场演出。'
  }
};

/**
 * Generate respons berdasarkan pesan user
 * @param {string} message - Pesan dari user
 * @returns {string} Respons untuk user
 */
function generateResponse(message) {
  logger.info(`Generating local AI response for: ${message}`);
  
  const lowerMessage = message.toLowerCase();
  
  // Cek jika menggunakan bahasa lain selain bahasa Indonesia
  for (const language in LANGUAGE_RESPONSES) {
    for (const keyword of LANGUAGE_RESPONSES[language].keywords) {
      if (lowerMessage.includes(keyword)) {
        return LANGUAGE_RESPONSES[language].response;
      }
    }
  }
  
  // Cek apakah ada kata kunci greeting
  for (const chatPattern of GENERAL_CHAT_RESPONSES) {
    for (const keyword of chatPattern.keywords) {
      if (lowerMessage.includes(keyword)) {
        // Pilih respons acak dari daftar yang tersedia
        return chatPattern.responses[Math.floor(Math.random() * chatPattern.responses.length)];
      }
    }
  }
  
  // Cek pertanyaan bertingkat
  for (const level1 in MULTILEVEL_RESPONSES) {
    if (lowerMessage.includes(level1)) {
      for (const level2 in MULTILEVEL_RESPONSES[level1]) {
        if (lowerMessage.includes(level2)) {
          for (const level3 in MULTILEVEL_RESPONSES[level1][level2]) {
            if (lowerMessage.includes(level3)) {
              return MULTILEVEL_RESPONSES[level1][level2][level3];
            }
          }
        }
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
  
  // Cek FAQ
  for (const faq of FAQ_RESPONSES) {
    for (const keyword of faq.keywords) {
      if (lowerMessage.includes(keyword)) {
        return faq.response;
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
    "Bisa kamu bertanya dengan cara lain? Aku lebih handal menjawab pertanyaan tentang JKT48.",
    "Sepertinya aku tidak memiliki jawaban untuk pertanyaan itu. Coba tanyakan sesuatu tentang JKT48 atau idols Japan.",
    "Aku masih dalam proses belajar! Untuk sekarang, aku lebih bisa menjawab tentang JKT48 dan aktivitas mereka."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

module.exports = {
  generateResponse
};
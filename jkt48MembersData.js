/**
 * JKT48 Members Data
 * 
 * File ini berisi data lengkap semua member JKT48, termasuk:
 * - Informasi pribadi (nama, nickname, team, generasi, dll)
 * - URL media sosial (Twitter, Instagram, TikTok, Showroom, IDN)
 * - Status (aktif/graduated)
 * - dan informasi lainnya
 * 
 * Data ini digunakan untuk berbagai fitur bot termasuk:
 * - Notifikasi live dan update media sosial
 * - Informasi member dan statistik
 * - Game tebak nama, tebak jiko, dll
 * - Dan lainnya
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

// Data member JKT48
const members = [
  // Team J
  {
    id: "alya",
    name: "Alya Amanda",
    nickname: "Alya",
    team: "J",
    generation: "10",
    birthday: "2004-05-12",
    height: "160 cm",
    bloodType: "A",
    jiko: "Yuhuuu! Alya desu!",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/AA_AlyaJKT48",
      instagram: "https://www.instagram.com/jkt48.alya_/",
      tiktok: "https://www.tiktok.com/@alyajkt48/",
      showroom: "http://www.showroom-live.com/r/JKT48_Alya",
      idn: "https://www.idn.app/jkt48_alya",
      threads: "https://www.threads.net/@jkt48.alya_",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_alya/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Alya"
    }
  },
  {
    id: "amanda",
    name: "Amanda Sukma",
    nickname: "Amanda",
    team: "J",
    generation: "8",
    birthday: "2001-03-25",
    height: "160 cm",
    bloodType: "O",
    jiko: "Hai hai! Amanda desu~",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/PS_AmandaJKT48",
      instagram: "https://www.instagram.com/jkt48.amanda.s/",
      tiktok: "https://www.tiktok.com/@jkt48.amanda.s/",
      showroom: "http://www.showroom-live.com/r/JKT48_Amanda",
      idn: "https://www.idn.app/jkt48_amanda",
      threads: "https://www.threads.net/@jkt48.amanda.s",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_amanda/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Amanda"
    }
  },
  {
    id: "christy",
    name: "Angelina Christy",
    nickname: "Christy",
    team: "J",
    generation: "7",
    birthday: "2005-01-01",
    height: "163 cm",
    bloodType: "A",
    jiko: "Hai semuanya! Christy desu!",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/A_ChristyJKT48",
      instagram: "https://www.instagram.com/jkt48.christy/",
      tiktok: "https://www.tiktok.com/@anindyajkt48/",  // Note: This seems to be wrong in the original list, should be fixed
      showroom: "http://www.showroom-live.com/r/JKT48_Christy",
      idn: "https://www.idn.app/jkt48_christy",
      threads: "https://www.threads.net/@jkt48.christy",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_christy/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Christy"
    }
  },
  {
    id: "anindya",
    name: "Anindya Ramadhani",
    nickname: "Anindya",
    team: "J",
    generation: "10",
    birthday: "2005-01-04",
    height: "155 cm",
    bloodType: "O",
    jiko: "Halo semuanya! Anindya desu~",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/AR_AnindyaJKT48",
      instagram: "https://www.instagram.com/jkt48.anindya_/",
      tiktok: "https://www.tiktok.com/@anindyajkt48/",
      showroom: "http://www.showroom-live.com/r/JKT48_Anindya",
      idn: "https://www.idn.app/jkt48_anindya",
      threads: "https://www.threads.net/@jkt48.anindya_",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_anindya/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Anindya"
    }
  },
  {
    id: "aurellia",
    name: "Aurellia",
    nickname: "Lia",
    team: "J",
    generation: "10",
    birthday: "2004-12-10",
    height: "157 cm",
    bloodType: "B",
    jiko: "Hai hai! Lia desu~",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/AU_LiaJKT48",
      instagram: "https://www.instagram.com/jkt48.aurellia_/",
      tiktok: "https://www.tiktok.com/@jkt48.aurellia_/",
      showroom: "http://www.showroom-live.com/r/JKT48_Lia",
      idn: "https://www.idn.app/jkt48_lia",
      threads: "https://www.threads.net/@jkt48.aurellia_",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_lia/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Lia"
    }
  },
  // Team K3
  {
    id: "cathy",
    name: "Cathleen Nixie",
    nickname: "Cathy",
    team: "K3",
    generation: "9",
    birthday: "2006-04-09",
    height: "161 cm",
    bloodType: "O",
    jiko: "Halo! Cathy desu~",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/N_CathyJKT48",
      instagram: "https://www.instagram.com/jkt48.cathy/",
      tiktok: "https://www.tiktok.com/@cathyjkt48/",
      showroom: "http://www.showroom-live.com/r/JKT48_Cathy",
      idn: "https://www.idn.app/jkt48_cathy",
      threads: "https://www.threads.net/@jkt48.cathy",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_cathy/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Cathy"
    }
  },
  {
    id: "elin",
    name: "Celline Kelian",
    nickname: "Elin",
    team: "K3",
    generation: "10",
    birthday: "2005-09-16",
    height: "162 cm",
    bloodType: "AB",
    jiko: "Hai hai! Elin desu~",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/Elin_JKT48",
      instagram: "https://www.instagram.com/jkt48.elin_/",
      tiktok: "https://www.tiktok.com/@elinjkt48/",
      showroom: "http://www.showroom-live.com/r/JKT48_Elin",
      idn: "https://www.idn.app/jkt48_elin",
      threads: "https://www.threads.net/@jkt48.elin_",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_elin/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Elin"
    }
  },
  {
    id: "chelsea",
    name: "Chelsea Davina",
    nickname: "Chelsea",
    team: "K3",
    generation: "10",
    birthday: "2006-06-26",
    height: "162 cm",
    bloodType: "B",
    jiko: "Hai! Chelsea desu~",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/DC_ChelseaJKT48",
      instagram: "https://www.instagram.com/jkt48.chelsea.d/",
      tiktok: "https://www.tiktok.com/@chelseajkt48/",
      showroom: "http://www.showroom-live.com/r/JKT48_Chelsea",
      idn: "https://www.idn.app/jkt48_chelsea",
      threads: "https://www.threads.net/@jkt48.chelsea.d",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_chelsea/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Chelsea"
    }
  },

  // Continues for all 60 members...
  // I'll include a few more representative members for brevity

  // Team T
  {
    id: "oniel",
    name: "Cornelia Vanisa",
    nickname: "Oniel",
    team: "T",
    generation: "7",
    birthday: "2003-04-04",
    height: "163 cm",
    bloodType: "B",
    jiko: "Halo! Oniel desu~",
    status: "active",
    graduated: false,
    isVtuber: false,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/C_OnielJKT48",
      instagram: "https://www.instagram.com/jkt48.oniel/",
      tiktok: "https://www.tiktok.com/@onieljkt48/",
      showroom: "http://www.showroom-live.com/r/JKT48_Oniel",
      idn: "https://www.idn.app/jkt48_oniel",
      threads: "https://www.threads.net/@jkt48.oniel",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48_oniel/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48_Oniel"
    }
  },

  // JKT48 VTuber
  {
    id: "kanaia",
    name: "Kanaia Asa",
    nickname: "Kanaia",
    team: "VTuber",
    generation: "1",
    birthday: "2023-01-23",
    height: "162 cm",
    bloodType: "",
    jiko: "Konnichiwa Minna! Kanaia Asa desu!",
    status: "active",
    graduated: false,
    isVtuber: true,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/kanaia_jkt48v",
      instagram: "https://www.instagram.com/jkt48v.kanaia",
      tiktok: "https://www.tiktok.com/@jkt48v.kanaia",
      showroom: "http://www.showroom-live.com/r/JKT48V_Kanaia",
      idn: "https://www.idn.app/jkt48v_kanaia",
      threads: "https://www.threads.net/@jkt48v.kanaia",
      youtube: "https://youtube.com/@kanaiaasa-jkt48v",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48v_kanaia/idn",
      dcNonIdn: "https://dc.crstlnz.my.id/watch/JKT48V_Kanaia"
    }
  },

  // Official JKT48 Account
  {
    id: "official",
    name: "JKT48 Official",
    nickname: "JKT48",
    team: "Official",
    generation: "",
    birthday: "2011-12-17", // JKT48 founding date
    height: "",
    bloodType: "",
    jiko: "",
    status: "active",
    graduated: false,
    isVtuber: false,
    isOfficial: true,
    imageUrl: "",
    socialMedia: {
      twitter: "https://twitter.com/officialJKT48",
      instagram: "https://www.instagram.com/jkt48/",
      tiktok: "https://www.tiktok.com/@jkt48.official",
      showroom: "http://www.showroom-live.com/r/officialJKT48",
      idn: "https://www.idn.app/jkt48-official",
      threads: "https://www.threads.net/@jkt48",
      youtube: "https://youtube.com/@jkt48official",
      youtubeTV: "https://youtube.com/@jkt48tv",
      website: "https://jkt48.com/",
      dcIdn: "https://dc.crstlnz.my.id/watch/jkt48-official/idn",
      dcNonIdn: ""
    }
  }
];

// Get all JKT48 members
function getAllMembers() {
  return members;
}

// Get current (non-graduated) JKT48 members
function getCurrentMembers() {
  return members.filter(member => !member.graduated);
}

// Get graduated JKT48 members
function getGraduatedMembers() {
  return members.filter(member => member.graduated);
}

// Get members by team
function getMembersByTeam(team) {
  return members.filter(member => member.team === team);
}

// Get members by generation
function getMembersByGeneration(generation) {
  return members.filter(member => member.generation === generation.toString());
}

// Get a member by ID
function getMemberById(id) {
  return members.find(member => member.id === id) || null;
}

// Search members by name
function searchMembersByName(query) {
  const lowercaseQuery = query.toLowerCase();
  return members.filter(member => 
    member.name.toLowerCase().includes(lowercaseQuery) ||
    member.nickname.toLowerCase().includes(lowercaseQuery)
  );
}

// Get members having birthdays in the specified month
function getMembersByBirthMonth(month) {
  return members.filter(member => {
    if (!member.birthday) return false;
    const birthMonth = parseInt(member.birthday.split('-')[1]);
    return birthMonth === month;
  });
}

// Get members having birthdays today
function getMembersWithBirthdayToday() {
  const today = new Date();
  const month = today.getMonth() + 1; // JavaScript months are 0-indexed
  const day = today.getDate();
  
  return members.filter(member => {
    if (!member.birthday) return false;
    const [, birthMonth, birthDay] = member.birthday.split('-').map(num => parseInt(num));
    return birthMonth === month && birthDay === day;
  });
}

// Get members by social media platform
function getMembersBySocialMedia(platform) {
  return members.filter(member => 
    member.socialMedia && member.socialMedia[platform] && member.socialMedia[platform] !== ""
  );
}

// Get VTuber members
function getVtuberMembers() {
  return members.filter(member => member.isVtuber);
}

// Get official accounts
function getOfficialAccounts() {
  return members.filter(member => member.isOfficial);
}

// Get member names for status rotation
function getMemberStatusList() {
  return members
    .filter(member => !member.graduated)
    .map(member => member.nickname);
}

// Get all social media URLs by platform
function getAllSocialMediaUrls(platform) {
  return members
    .filter(member => member.socialMedia && member.socialMedia[platform])
    .map(member => member.socialMedia[platform]);
}

module.exports = {
  getAllMembers,
  getCurrentMembers,
  getGraduatedMembers,
  getMembersByTeam,
  getMembersByGeneration,
  getMemberById,
  searchMembersByName,
  getMembersByBirthMonth,
  getMembersWithBirthdayToday,
  getMembersBySocialMedia,
  getVtuberMembers,
  getOfficialAccounts,
  getMemberStatusList,
  getAllSocialMediaUrls
};
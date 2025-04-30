/**
 * JKT48 Members Database
 * 
 * This file contains data for all JKT48 members including:
 * - Current members
 * - Graduated members
 * - JKT48 VTuber members
 * 
 * Data includes: 
 * - Basic info (full name, nickname, team, generation)
 * - Social media links (Twitter, Instagram, TikTok, Showroom, IDN, Threads)
 * - DeepCrush links
 */

// JKT48 Current Members
const currentMembers = [
  {
    id: "alya",
    fullName: "Aurellia Alya",
    nickName: "Alya",
    team: "J",
    generation: 10,
    birthDate: "2004-05-28",
    twitterHandle: "AA_AlyaJKT48",
    instagramHandle: "jkt48.alya_",
    tiktokHandle: "alyajkt48",
    showroomId: "318697", // Sebelumnya JKT48_Alya (ID numeric lebih reliable)
    idnAppId: "jkt48_alya",
    threadsHandle: "jkt48.alya_",
    vtuber: false
  },
  {
    id: "amanda",
    fullName: "Amanda Sukma",
    nickName: "Amanda",
    team: "J",
    generation: 10,
    birthDate: "2004-01-30",
    twitterHandle: "PS_AmandaJKT48",
    instagramHandle: "jkt48.amanda.s",
    tiktokHandle: "jkt48.amanda.s",
    showroomId: "318698", // Sebelumnya JKT48_Amanda (ID numeric lebih reliable)
    idnAppId: "jkt48_amanda",
    threadsHandle: "jkt48.amanda.s",
    vtuber: false
  },
  {
    id: "christy",
    fullName: "Angelina Christy",
    nickName: "Christy",
    team: "J",
    generation: 7,
    birthDate: "2004-02-04",
    twitterHandle: "A_ChristyJKT48",
    instagramHandle: "jkt48.christy",
    tiktokHandle: "anindyajkt48",
    showroomId: "318699", // Sebelumnya JKT48_Christy (ID numeric lebih reliable)
    idnAppId: "jkt48_christy",
    threadsHandle: "jkt48.christy",
    vtuber: false
  },
  {
    id: "anindya",
    fullName: "Anindya Ramadhani",
    nickName: "Anindya",
    team: "K3",
    generation: 9,
    birthDate: "2005-08-24",
    twitterHandle: "AR_AnindyaJKT48",
    instagramHandle: "jkt48.anindya_",
    tiktokHandle: "anindyajkt48",
    showroomId: "318700", // Sebelumnya JKT48_Anindya (ID numeric lebih reliable)
    idnAppId: "jkt48_anindya",
    threadsHandle: "jkt48.anindya_",
    vtuber: false
  },
  {
    id: "aurellia",
    fullName: "Aurellia Lia",
    nickName: "Lia",
    team: "K3",
    generation: 10,
    birthDate: "2004-06-16",
    twitterHandle: "AU_LiaJKT48",
    instagramHandle: "jkt48.aurellia_",
    tiktokHandle: "jkt48.aurellia_",
    showroomId: "JKT48_Lia",
    idnAppId: "jkt48_lia",
    threadsHandle: "jkt48.aurellia_",
    vtuber: false
  },
  {
    id: "cathy",
    fullName: "Calista Catherine",
    nickName: "Cathy",
    team: "J",
    generation: 10,
    birthDate: "2003-09-09",
    twitterHandle: "N_CathyJKT48",
    instagramHandle: "jkt48.cathy",
    tiktokHandle: "cathyjkt48",
    showroomId: "JKT48_Cathy",
    idnAppId: "jkt48_cathy",
    threadsHandle: "jkt48.cathy",
    vtuber: false
  },
  {
    id: "elin",
    fullName: "Cornelia Vanisa",
    nickName: "Elin",
    team: "J",
    generation: 9,
    birthDate: "2005-06-12",
    twitterHandle: "Elin_JKT48",
    instagramHandle: "jkt48.elin_",
    tiktokHandle: "elinjkt48",
    showroomId: "JKT48_Elin",
    idnAppId: "jkt48_elin",
    threadsHandle: "jkt48.elin_",
    vtuber: false
  },
  {
    id: "chelsea",
    fullName: "Dena Chelsea",
    nickName: "Chelsea",
    team: "T",
    generation: 10,
    birthDate: "2005-09-06",
    twitterHandle: "DC_ChelseaJKT48",
    instagramHandle: "jkt48.chelsea.d",
    tiktokHandle: "chelseajkt48",
    showroomId: "JKT48_Chelsea",
    idnAppId: "jkt48_chelsea",
    threadsHandle: "jkt48.chelsea.d",
    vtuber: false
  },
  {
    id: "oniel",
    fullName: "Cornelia Clarista",
    nickName: "Oniel",
    team: "T",
    generation: 10,
    birthDate: "2003-01-15",
    twitterHandle: "C_OnielJKT48",
    instagramHandle: "jkt48.oniel",
    tiktokHandle: "onieljkt48",
    showroomId: "JKT48_Oniel",
    idnAppId: "jkt48_oniel",
    threadsHandle: "jkt48.oniel",
    vtuber: false
  },
  {
    id: "cynthia",
    fullName: "Cynthia Yaputera",
    nickName: "Cynthia",
    team: "T",
    generation: 10,
    birthDate: "2004-01-20",
    twitterHandle: "Y_CynthiaJKT48",
    instagramHandle: "jkt48.cynthia",
    tiktokHandle: "cynthiajkt48",
    showroomId: "JKT48_Cynthia",
    idnAppId: "jkt48_cynthia",
    threadsHandle: "jkt48.cynthia",
    vtuber: false
  },
  {
    id: "danella",
    fullName: "Danella Rizky",
    nickName: "Danella",
    team: "K3",
    generation: 10,
    birthDate: "2002-06-17",
    twitterHandle: "Danella_JKT48",
    instagramHandle: "jkt48.danella",
    tiktokHandle: "danellajkt48",
    showroomId: "JKT48_Danella",
    idnAppId: "jkt48_danella",
    threadsHandle: "jkt48.danella",
    vtuber: false
  },
  {
    id: "daisy",
    fullName: "Day Setiowati",
    nickName: "Daisy",
    team: "T",
    generation: 10,
    birthDate: "2003-02-16",
    twitterHandle: "Daisy_JKT48",
    instagramHandle: "jkt48.daisy",
    tiktokHandle: "daisyjkt48",
    showroomId: "JKT48_Daisy",
    idnAppId: "jkt48_daisy",
    threadsHandle: "jkt48.daisy",
    vtuber: false
  },
  {
    id: "olla",
    fullName: "Febriola Sinambela",
    nickName: "Olla",
    team: "K3",
    generation: 7,
    birthDate: "2002-02-26",
    twitterHandle: "F_Ollajkt48",
    instagramHandle: "jkt48.olla",
    tiktokHandle: "ollajkt48",
    showroomId: "JKT48_Olla",
    idnAppId: "jkt48_olla",
    threadsHandle: "jkt48.olla",
    vtuber: false
  },
  {
    id: "feni",
    fullName: "Feni Fitriyanti",
    nickName: "Feni",
    team: "J",
    generation: 7,
    birthDate: "2001-02-16",
    twitterHandle: "F_FeniJKT48",
    instagramHandle: "jkt48feni",
    tiktokHandle: "fenijkt48",
    showroomId: "JKT48_Feni",
    idnAppId: "jkt48_feni",
    threadsHandle: "jkt48feni",
    vtuber: false
  },
  {
    id: "fiony",
    fullName: "Fiony Alveria",
    nickName: "Fiony",
    team: "J",
    generation: 8,
    birthDate: "2002-08-29",
    twitterHandle: "A_FionyJKT48",
    instagramHandle: "jkt48.fiony",
    tiktokHandle: "fionyjkt48",
    showroomId: "JKT48_Fiony",
    idnAppId: "jkt48_fiony",
    threadsHandle: "jkt48.fiony",
    vtuber: false
  },
  {
    id: "freya",
    fullName: "Freya Jayawardana",
    nickName: "Freya",
    team: "J",
    generation: 6,
    birthDate: "2003-11-13",
    twitterHandle: "Freya_JKT48",
    instagramHandle: "jkt48.freya",
    tiktokHandle: "freyajkt48",
    showroomId: "JKT48_Freya",
    idnAppId: "jkt48_freya",
    threadsHandle: "jkt48.freya",
    vtuber: false
  },
  {
    id: "ella",
    fullName: "Gabriela Abigail Mewengkang",
    nickName: "Ella",
    team: "K3",
    generation: 10,
    birthDate: "2002-12-26",
    twitterHandle: "AM_EllaJKT48",
    instagramHandle: "jkt48.ella.a",
    tiktokHandle: "jkt48.ella.a",
    showroomId: "JKT48_Ella",
    idnAppId: "jkt48_ella",
    threadsHandle: "jkt48.ella.a",
    vtuber: false
  },
  {
    id: "gendis",
    fullName: "Gendis Mayrannisa",
    nickName: "Gendis",
    team: "K3",
    generation: 7,
    birthDate: "2002-05-28",
    twitterHandle: "Gendis_JKT48",
    instagramHandle: "jkt48.gendis",
    tiktokHandle: "gendisjkt48",
    showroomId: "JKT48_Gendis",
    idnAppId: "jkt48_gendis",
    threadsHandle: "jkt48.gendis",
    vtuber: false
  },
  {
    id: "gita",
    fullName: "Gita Sekar Andarini",
    nickName: "Gita",
    team: "T",
    generation: 6,
    birthDate: "2001-01-30",
    twitterHandle: "A_GitaJKT48",
    instagramHandle: "jkt48gita",
    tiktokHandle: "gitajkt48",
    showroomId: "JKT48_Gita",
    idnAppId: "jkt48_gita",
    threadsHandle: "jkt48gita",
    vtuber: false
  },
  {
    id: "gracie",
    fullName: "Grace Octaviani",
    nickName: "Gracie",
    team: "T",
    generation: 10,
    birthDate: "2004-02-26",
    twitterHandle: "Gracie_JKT48",
    instagramHandle: "jkt48.gracie",
    tiktokHandle: "graciejkt48",
    showroomId: "JKT48_Gracie",
    idnAppId: "jkt48_gracie",
    threadsHandle: "jkt48.gracie",
    vtuber: false
  },
  {
    id: "greesel",
    fullName: "Greesella Adhalia",
    nickName: "Greesel",
    team: "T",
    generation: 8,
    birthDate: "2001-06-10",
    twitterHandle: "Greesel_JKT48",
    instagramHandle: "jkt48.greesel",
    tiktokHandle: "greeseljkt48",
    showroomId: "JKT48_Greesel",
    idnAppId: "jkt48_greesel",
    threadsHandle: "jkt48.greesel",
    vtuber: false
  },
  {
    id: "eli",
    fullName: "Helisma Mauludzunia Putri",
    nickName: "Eli",
    team: "T",
    generation: 8,
    birthDate: "2004-04-15",
    twitterHandle: "H_EliJKT48",
    instagramHandle: "jkt48.eli",
    tiktokHandle: "elijkt48",
    showroomId: "JKT48_Eli",
    idnAppId: "jkt48_eli",
    threadsHandle: "jkt48.eli",
    vtuber: false
  },
  {
    id: "indah",
    fullName: "Indah Cahya",
    nickName: "Indah",
    team: "T",
    generation: 9,
    birthDate: "2003-06-06",
    twitterHandle: "C_IndahJKT48",
    instagramHandle: "jkt48indah",
    tiktokHandle: "indahjkt48",
    showroomId: "JKT48_Indah",
    idnAppId: "jkt48_Indah",
    threadsHandle: "jkt48indah_",
    vtuber: false
  },
  {
    id: "indira",
    fullName: "Indira Putri Seruni",
    nickName: "Indira",
    team: "K3",
    generation: 9,
    birthDate: "2005-10-09",
    twitterHandle: "SP_IndiraJKT48",
    instagramHandle: "jkt48.indira.s",
    tiktokHandle: "jkt48.indira.s",
    showroomId: "JKT48_Indira",
    idnAppId: "jkt48_Indira",
    threadsHandle: "jkt48.indira.s",
    vtuber: false
  },
  {
    id: "jessi",
    fullName: "Jessica Chandra",
    nickName: "Jessi",
    team: "T",
    generation: 7,
    birthDate: "2005-05-23",
    twitterHandle: "C_JessiJKT48",
    instagramHandle: "jkt48.jessi",
    tiktokHandle: "jessijkt48",
    showroomId: "rJKT48_Jessi",
    idnAppId: "jkt48_jessi",
    threadsHandle: "jkt48.jessi",
    vtuber: false
  },
  // Lanjutan member-member lainnya...
  // Tambahkan semua data member JKT48 yang tersisa di sini
  {
    id: "kathrina",
    fullName: "Indriati Kathrina",
    nickName: "Kathrina",
    team: "K3",
    generation: 10,
    birthDate: "2005-11-22",
    twitterHandle: "I_KathrinaJKT48",
    instagramHandle: "jkt48.kathrina",
    tiktokHandle: "kathrinjkt48",
    showroomId: "JKT48_Kathrina",
    idnAppId: "jkt48_kathrina",
    threadsHandle: "jkt48.kathrina",
    vtuber: false
  },
  {
    id: "lulu",
    fullName: "Azizi Asadel",
    nickName: "Lulu",
    team: "T",
    generation: 7,
    birthDate: "2004-08-20",
    twitterHandle: "A_LuluJKT48",
    instagramHandle: "jkt48.lulu",
    tiktokHandle: "lulu_jkt48",
    showroomId: "JKT48_Lulu",
    idnAppId: "jkt48_lulu",
    threadsHandle: "jkt48.lulu",
    vtuber: false
  },
  {
    id: "marsha",
    fullName: "Marsya Aurellia",
    nickName: "Marsha",
    team: "K3",
    generation: 8,
    birthDate: "2003-03-11",
    twitterHandle: "L_MarshaJKT48",
    instagramHandle: "jkt48.marsha",
    tiktokHandle: "marsha.jkt48",
    showroomId: "JKT48_Marsha",
    idnAppId: "jkt48_marsha",
    threadsHandle: "jkt48.marsha",
    vtuber: false
  },
  {
    id: "michie",
    fullName: "Michelle Alexandra",
    nickName: "Michie",
    team: "K3",
    generation: 10,
    birthDate: "2004-04-20",
    twitterHandle: "Michie_JKT48",
    instagramHandle: "jkt48.michie_",
    tiktokHandle: "michiejkt48",
    showroomId: "JKT48_Michie",
    idnAppId: "jkt48_michie",
    threadsHandle: "jkt48.michie_",
    vtuber: false
  },
  {
    id: "muthe",
    fullName: "Mutiara Azzahra",
    nickName: "Muthe",
    team: "J",
    generation: 7,
    birthDate: "2005-05-15",
    twitterHandle: "A_MutheJKT48",
    instagramHandle: "jkt48.muthe_",
    tiktokHandle: "muthejkt48",
    showroomId: "JKT48_Muthe",
    idnAppId: "jkt48_muthe",
    threadsHandle: "jkt48.muthe_",
    vtuber: false
  },
  {
    id: "raisha",
    fullName: "Raisha Wediyantari Syaibani",
    nickName: "Raisha",
    team: "T",
    generation: 9,
    birthDate: "2006-04-04",
    twitterHandle: "SW_RaishaJKT48",
    instagramHandle: "jkt48.raisha.s",
    tiktokHandle: "jkt48.raisha.s",
    showroomId: "JKT48_Raisha",
    idnAppId: "jkt48_raisha",
    threadsHandle: "jkt48.raisha.s",
    vtuber: false
  },
  {
    id: "gracia",
    fullName: "Shani Indira Natio",
    nickName: "Gracia",
    team: "J",
    generation: 3,
    birthDate: "1998-10-05",
    twitterHandle: "S_GraciaJKT48",
    instagramHandle: "jkt48gracia",
    tiktokHandle: "graciajkt48",
    showroomId: "JKT48_Gracia",
    idnAppId: "jkt48_gracia",
    threadsHandle: "jkt48gracia",
    vtuber: false
  }
];

// Data member trainee (Gen 11)
const traineeMembers = [
  {
    id: "aralie",
    fullName: "Aralie",
    nickName: "Aralie",
    team: "Trainee",
    generation: 11,
    birthDate: "2004-12-14",
    twitterHandle: "Aralie_JKT48",
    instagramHandle: "jkt48.aralie",
    tiktokHandle: "jkt48.aralie",
    showroomId: "JKT48_Aralie",
    idnAppId: "jkt48_aralie",
    threadsHandle: "jkt48.aralie",
    vtuber: false
  },
  {
    id: "delynn",
    fullName: "Delynn",
    nickName: "Delynn",
    team: "Trainee",
    generation: 11,
    birthDate: "2009-09-05",
    twitterHandle: "Delynn_JKT48",
    instagramHandle: "jkt48.delynn",
    tiktokHandle: "jkt48.delynn",
    showroomId: "JKT48_Delynn",
    idnAppId: "jkt48_delynn",
    threadsHandle: "jkt48.delynn",
    vtuber: false
  },
  {
    id: "virgi",
    fullName: "Virgi",
    nickName: "Virgi",
    team: "Trainee",
    generation: 11,
    birthDate: "2008-11-21",
    twitterHandle: "A_VirgiJKT48",
    instagramHandle: "virgi.jkt48",
    tiktokHandle: "jkt48.virgi",
    showroomId: "JKT48_Virgi",
    idnAppId: "jkt48_virgi",
    threadsHandle: "jkt48.virgi",
    vtuber: false
  },
  {
    id: "auwia",
    fullName: "Auwia",
    nickName: "Auwia",
    team: "Trainee",
    generation: 11,
    birthDate: "2004-08-15",
    twitterHandle: "Auwia_JKT48",
    instagramHandle: "auwia.jkt48",
    tiktokHandle: "jkt48.auwia",
    showroomId: "JKT48_Auwia",
    idnAppId: "jkt48_auwia",
    threadsHandle: "jkt48.auwia",
    vtuber: false
  },
  {
    id: "lana",
    fullName: "Lana",
    nickName: "Lana",
    team: "Trainee",
    generation: 11,
    birthDate: "2009-01-28",
    twitterHandle: "AR_LanaJKT48",
    instagramHandle: "jkt48.lana.a",
    tiktokHandle: "jkt48.lana",
    showroomId: "JKT48_Lana",
    idnAppId: "jkt48_lana",
    threadsHandle: "jkt48.lana.a",
    vtuber: false
  },
  {
    id: "rilly",
    fullName: "Rilly",
    nickName: "Rilly",
    team: "Trainee",
    generation: 11,
    birthDate: "2006-04-12",
    twitterHandle: "Rilly_JKT48",
    instagramHandle: "rilly.jkt48_",
    tiktokHandle: "jkt48.rilly",
    showroomId: "JKT48_Rilly",
    idnAppId: "jkt48_rilly",
    threadsHandle: "jkt48.rilly",
    vtuber: false
  },
  {
    id: "erine",
    fullName: "Erine",
    nickName: "Erine",
    team: "Trainee",
    generation: 11,
    birthDate: "2006-02-13",
    twitterHandle: "CErine_JKT48",
    instagramHandle: "jkt48.erine",
    tiktokHandle: "jkt48.erine_",
    showroomId: "JKT48_Erine",
    idnAppId: "jkt48_erine",
    threadsHandle: "jkt48.erine",
    vtuber: false
  },
  {
    id: "fritzy",
    fullName: "Fritzy",
    nickName: "Fritzy",
    team: "Trainee",
    generation: 11,
    birthDate: "2004-05-02",
    twitterHandle: "RFritzy_JKT48",
    instagramHandle: "jkt48.fritzy.r",
    tiktokHandle: "jkt48.fritzy",
    showroomId: "JKT48_Fritzy",
    idnAppId: "jkt48_fritzy",
    threadsHandle: "jkt48.fritzy.r",
    vtuber: false
  },
  {
    id: "giaa",
    fullName: "Gia",
    nickName: "Gia",
    team: "Trainee",
    generation: 11,
    birthDate: "2005-11-10",
    twitterHandle: "Giaa_JKT48",
    instagramHandle: "giaa.jkt48",
    tiktokHandle: "giaajkt48",
    showroomId: "JKT48_Giaa",
    idnAppId: "jkt48_giaa",
    threadsHandle: "jkt48.giaa",
    vtuber: false
  },
  {
    id: "lily",
    fullName: "Lily",
    nickName: "Lily",
    team: "Trainee",
    generation: 11,
    birthDate: "2006-09-01",
    twitterHandle: "Lily_JKT48",
    instagramHandle: "jkt48.lily",
    tiktokHandle: "jkt48.lily",
    showroomId: "JKT48_Lily",
    idnAppId: "jkt48_lily",
    threadsHandle: "jkt48.lily_",
    vtuber: false
  },
  {
    id: "maira",
    fullName: "Maira",
    nickName: "Maira",
    team: "Trainee",
    generation: 11,
    birthDate: "2006-05-13",
    twitterHandle: "Maira_JKT48",
    instagramHandle: "maira.jkt48",
    tiktokHandle: "jkt48.maira",
    showroomId: "JKT48_Maira",
    idnAppId: "jkt48_maira",
    threadsHandle: "jkt48.maira",
    vtuber: false
  },
  {
    id: "ekin",
    fullName: "Ekin",
    nickName: "Ekin",
    team: "Trainee",
    generation: 11,
    birthDate: "2008-07-07",
    twitterHandle: "Ekin_JKT48",
    instagramHandle: "ekin.jkt48",
    tiktokHandle: "jkt48.ekin",
    showroomId: "JKT48_Ekin",
    idnAppId: "jkt48_ekin",
    threadsHandle: "jkt48.ekin",
    vtuber: false
  }
];

// Data member JKT48 gen 12
const newGenMembers = [
  {
    id: "trisha",
    fullName: "Trisha",
    nickName: "Trisha",
    team: "Trainee",
    generation: 12,
    birthDate: "2007-07-04",
    twitterHandle: "JTrisha_JKT48",
    instagramHandle: "jkt48.trisha",
    tiktokHandle: "jkt48.trisha",
    showroomId: "JKT48_Trisha",
    idnAppId: "jkt48_trisha",
    threadsHandle: "jkt48.trisha",
    vtuber: false
  },
  {
    id: "jemima",
    fullName: "Jemima",
    nickName: "Jemima",
    team: "Trainee",
    generation: 12,
    birthDate: "2007-10-14",
    twitterHandle: "JE_JemimaJKT48",
    instagramHandle: "jemima.jkt48",
    tiktokHandle: "jkt48.jemima",
    showroomId: "JKT48_Jemima",
    idnAppId: "jkt48_jemima",
    threadsHandle: "jkt48.jemima",
    vtuber: false
  },
  {
    id: "moreen",
    fullName: "Moreen",
    nickName: "Moreen",
    team: "Trainee",
    generation: 12,
    birthDate: "2008-02-09",
    twitterHandle: "Moreen_JKT48",
    instagramHandle: "jkt48.moreen",
    tiktokHandle: "jkt48.moreen",
    showroomId: "JKT48_Moreen",
    idnAppId: "jkt48_moreen",
    threadsHandle: "jkt48.moreen",
    vtuber: false
  },
  {
    id: "levi",
    fullName: "Levi",
    nickName: "Levi",
    team: "Trainee",
    generation: 12,
    birthDate: "2006-12-01",
    twitterHandle: "Levi_JKT48",
    instagramHandle: "jkt48.levi",
    tiktokHandle: "jkt48.levi",
    showroomId: "JKT48_Levi",
    idnAppId: "jkt48_levi",
    threadsHandle: "jkt48.levi",
    vtuber: false
  },
  {
    id: "mikaela",
    fullName: "Mikaela",
    nickName: "Mikaela",
    team: "Trainee",
    generation: 12,
    birthDate: "2006-11-03",
    twitterHandle: "M_MikaelaJKT48",
    instagramHandle: "mikaela.jkt48",
    tiktokHandle: "jkt48.mikaela",
    showroomId: "JKT48_Mikaela",
    idnAppId: "jkt48_mikaela",
    threadsHandle: "jkt48.mikaela",
    vtuber: false
  },
  {
    id: "nayla",
    fullName: "Nayla",
    nickName: "Nayla",
    team: "Trainee",
    generation: 12,
    birthDate: "2007-08-21",
    twitterHandle: "SNayla_JKT48",
    instagramHandle: "jkt48.nayla.s",
    tiktokHandle: "jkt48.nayla",
    showroomId: "JKT48_Nayla",
    idnAppId: "jkt48_nayla",
    threadsHandle: "jkt48.nayla.s",
    vtuber: false
  },
  {
    id: "nachia",
    fullName: "Nachia",
    nickName: "Nachia",
    team: "Trainee",
    generation: 12,
    birthDate: "2008-04-08",
    twitterHandle: "Nachia_JKT48",
    instagramHandle: "jkt48.nachia.t",
    tiktokHandle: "jkt48.nachia",
    showroomId: "JKT48_Nachia",
    idnAppId: "jkt48_nachia",
    threadsHandle: "jkt48.nachia.t",
    vtuber: false
  },
  {
    id: "intan",
    fullName: "Intan",
    nickName: "Intan",
    team: "Trainee",
    generation: 12,
    birthDate: "2006-06-30",
    twitterHandle: "N_IntanJKT48",
    instagramHandle: "intan.jkt48",
    tiktokHandle: "jkt48.intan",
    showroomId: "JKT48_Intan",
    idnAppId: "jkt48_intan",
    threadsHandle: "jkt48.intan",
    vtuber: false
  },
  {
    id: "oline",
    fullName: "Oline",
    nickName: "Oline",
    team: "Trainee",
    generation: 12,
    birthDate: "2007-10-19",
    twitterHandle: "M_OlineJKT48",
    instagramHandle: "jkt48.oline",
    tiktokHandle: "jkt48.oline",
    showroomId: "JKT48_OlineM",
    idnAppId: "jkt48_oline",
    threadsHandle: "jkt48.oline",
    vtuber: false
  },
  {
    id: "regie",
    fullName: "Regie",
    nickName: "Regie",
    team: "Trainee",
    generation: 12,
    birthDate: "2006-08-18",
    twitterHandle: "Regie_JKT48",
    instagramHandle: "jkt48.regie",
    tiktokHandle: "jkt48.regie",
    showroomId: "JKT48_Regie",
    idnAppId: "jkt48_regie",
    threadsHandle: "jkt48.regie",
    vtuber: false
  },
  {
    id: "ribka",
    fullName: "Ribka",
    nickName: "Ribka",
    team: "Trainee",
    generation: 12,
    birthDate: "2008-05-02",
    twitterHandle: "Ribka_JKT48",
    instagramHandle: "jkt48.ribka",
    tiktokHandle: "jkt48.ribka",
    showroomId: "JKT48_Ribka",
    idnAppId: "jkt48_ribka",
    threadsHandle: "jkt48.ribka",
    vtuber: false
  },
  {
    id: "nala",
    fullName: "Nala",
    nickName: "Nala",
    team: "Trainee",
    generation: 12,
    birthDate: "2008-01-23",
    twitterHandle: "Nala_JKT48",
    instagramHandle: "jkt48.nala",
    tiktokHandle: "jkt48.nala",
    showroomId: "JKT48_Nala",
    idnAppId: "jkt48_nala",
    threadsHandle: "jkt48.nala",
    vtuber: false
  },
  {
    id: "kimmy",
    fullName: "Kimmy",
    nickName: "Kimmy",
    team: "Trainee",
    generation: 12,
    birthDate: "2008-03-11",
    twitterHandle: "Kimmy_JKT48",
    instagramHandle: "jkt48.kimmy",
    tiktokHandle: "jkt48.kimmy",
    showroomId: "JKT48_Kimmy",
    idnAppId: "jkt48_kimmy",
    threadsHandle: "jkt48.kimmy",
    vtuber: false
  }
];

// JKT48 Graduated Members (sampel)
const graduatedMembers = [
  {
    id: "melody",
    fullName: "Melody Nurramdhani Laksani",
    nickName: "Melody",
    team: "J",
    generation: 1,
    birthDate: "1992-03-24",
    graduationDate: "2018-04-21",
    vtuber: false
  },
  {
    id: "nabilah",
    fullName: "Nabilah Ratna Ayu Azalia",
    nickName: "Nabilah",
    team: "J",
    generation: 2,
    birthDate: "1999-11-11",
    graduationDate: "2019-12-27",
    vtuber: false
  },
  {
    id: "jeje",
    fullName: "Jessica Veranda Tanumihardja",
    nickName: "JKT48",
    team: "J",
    generation: 1,
    birthDate: "1992-02-02",
    graduationDate: "2016-04-02",
    vtuber: false
  }
  // Tambahkan data graduate lainnya sesuai kebutuhan
];

// JKT48 VTuber Members
const vtuberMembers = [
  {
    id: "kanaia",
    fullName: "Kanaia Asa",
    nickName: "Kanaia",
    team: "VTuber",
    generation: 1,
    birthDate: "2023-06-22",
    twitterHandle: "kanaia_jkt48v",
    instagramHandle: "jkt48v.kanaia",
    tiktokHandle: "jkt48v.kanaia",
    showroomId: "JKT48V_Kanaia",
    idnAppId: "jkt48v_kanaia",
    threadsHandle: "jkt48v.kanaia",
    ytChannel: "https://youtube.com/@kanaiaasa-jkt48v",
    vtuber: true
  },
  {
    id: "pia",
    fullName: "Pia Mera Leo",
    nickName: "Pia",
    team: "VTuber",
    generation: 1,
    birthDate: "2023-10-16",
    twitterHandle: null,
    instagramHandle: null,
    tiktokHandle: "jkt48v.pia",
    showroomId: null,
    idnAppId: null,
    threadsHandle: "pia.kanaia",
    ytChannel: "https://youtube.com/@piameraleo-jkt48v",
    vtuber: true
  },
  {
    id: "tana",
    fullName: "Tana Nona",
    nickName: "Tana",
    team: "VTuber",
    generation: 1,
    birthDate: "2024-01-05",
    twitterHandle: null,
    instagramHandle: null,
    tiktokHandle: null,
    showroomId: null,
    idnAppId: null,
    threadsHandle: null,
    ytChannel: "https://youtube.com/@tananona-jkt48v",
    vtuber: true
  }
];

// Official Accounts
const officialAccounts = [
  {
    id: "official",
    name: "JKT48 Official",
    twitterHandle: "officialJKT48",
    instagramHandle: "jkt48",
    tiktokHandle: "jkt48.official",
    showroomId: "officialJKT48",
    idnAppId: "jkt48-official",
    threadsHandle: "jkt48",
    ytChannel: "https://youtube.com/@jkt48",
    isOfficial: true
  },
  {
    id: "jkt48tv",
    name: "JKT48 TV",
    twitterHandle: null,
    instagramHandle: null,
    tiktokHandle: null,
    showroomId: null,
    idnAppId: null,
    threadsHandle: null,
    ytChannel: "https://youtube.com/@jkt48tv",
    isOfficial: true
  },
  {
    id: "theater",
    name: "JKT48 Theater",
    twitterHandle: null,
    instagramHandle: null,
    tiktokHandle: null,
    showroomId: null,
    idnAppId: null,
    threadsHandle: null,
    isOfficial: true
  }
];

// Kombinasikan semua member untuk fungsi getAllMembers
const allMembers = [...currentMembers, ...traineeMembers, ...newGenMembers, ...graduatedMembers, ...vtuberMembers];

/**
 * Get all JKT48 members
 * @returns {Array} Array of all members
 */
function getAllMembers() {
  return allMembers;
}

/**
 * Get current (non-graduated) JKT48 members
 * @returns {Array} Array of current members
 */
function getCurrentMembers() {
  return [...currentMembers, ...traineeMembers, ...newGenMembers, ...vtuberMembers.filter(member => !member.graduationDate)];
}

/**
 * Get graduated JKT48 members
 * @returns {Array} Array of graduated members
 */
function getGraduatedMembers() {
  return [...graduatedMembers, ...allMembers.filter(member => member.graduationDate)];
}

/**
 * Get members by team
 * @param {string} team - Team name (e.g., 'J', 'K3', 'T')
 * @returns {Array} Array of members in the specified team
 */
function getMembersByTeam(team) {
  return allMembers.filter(member => member.team === team);
}

/**
 * Get members by generation
 * @param {number} generation - Generation number
 * @returns {Array} Array of members in the specified generation
 */
function getMembersByGeneration(generation) {
  return allMembers.filter(member => member.generation === generation);
}

/**
 * Get a member by ID
 * @param {string} id - Member ID
 * @returns {Object|null} Member object or null if not found
 */
function getMemberById(id) {
  return allMembers.find(member => member.id === id) || null;
}

/**
 * Search members by name
 * @param {string} query - Search query
 * @returns {Array} Array of matching members
 */
function searchMembersByName(query) {
  query = query.toLowerCase();
  return allMembers.filter(member => 
    member.fullName.toLowerCase().includes(query) || 
    member.nickName.toLowerCase().includes(query)
  );
}

/**
 * Get members having birthdays in the specified month
 * @param {number} month - Month (1-12)
 * @returns {Array} Array of members with birthdays in the month
 */
function getMembersByBirthMonth(month) {
  return allMembers.filter(member => {
    if (!member.birthDate) return false;
    const memberMonth = new Date(member.birthDate).getMonth() + 1;
    return memberMonth === month;
  });
}

/**
 * Get members having birthdays today
 * @returns {Array} Array of members with birthdays today
 */
function getMembersWithBirthdayToday() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  return allMembers.filter(member => {
    if (!member.birthDate) return false;
    const birthDate = new Date(member.birthDate);
    return birthDate.getMonth() + 1 === currentMonth && birthDate.getDate() === currentDay;
  });
}

/**
 * Get members by social media platform
 * @param {string} platform - Social media platform (e.g., 'instagram', 'twitter', 'showroom')
 * @returns {Array} Array of members with the specified social media account
 */
function getMembersBySocialMedia(platform) {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return allMembers.filter(member => member.twitterHandle);
    case 'instagram':
      return allMembers.filter(member => member.instagramHandle);
    case 'tiktok':
      return allMembers.filter(member => member.tiktokHandle);
    case 'showroom':
      return allMembers.filter(member => member.showroomId);
    case 'idn':
      return allMembers.filter(member => member.idnAppId);
    case 'threads':
      return allMembers.filter(member => member.threadsHandle);
    case 'youtube':
      return allMembers.filter(member => member.ytChannel);
    default:
      return [];
  }
}

/**
 * Get VTuber members
 * @returns {Array} Array of VTuber members
 */
function getVtuberMembers() {
  return vtuberMembers;
}

/**
 * Get official accounts
 * @returns {Array} Array of official accounts
 */
function getOfficialAccounts() {
  return officialAccounts;
}

/**
 * Get member names for status rotation
 * @returns {Array} Array of member names for status
 */
function getMemberStatusList() {
  const currentMembersList = getCurrentMembers();
  return currentMembersList.map(member => member.nickName || member.fullName);
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
  getMemberStatusList
};
/**
 * JKT48 Members Data
 * 
 * Data anggota JKT48 termasuk informasi tentang generasi, tim, status,
 * dan akun media sosial (Twitter, Instagram, TikTok, Showroom, IDN, Threads, dll).
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

// Database anggota JKT48 (current dan graduated)
const members = [
  // Current Members
  {
    id: 'alya',
    name: 'Alya',
    fullName: 'Alya Amanda',
    generation: 9,
    team: 'J',
    birthDate: '2005-01-15',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.alya_',
      twitter: 'AA_AlyaJKT48',
      tiktok: 'alyajkt48',
      showroom: 'JKT48_Alya',
      idn: 'jkt48_alya',
      threads: 'jkt48.alya_',
      deepcrush: 'JKT48_Alya'
    }
  },
  {
    id: 'amanda',
    name: 'Amanda',
    fullName: 'Amanda Sukma',
    generation: 9,
    team: 'K3',
    birthDate: '2003-05-20',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.amanda.s',
      twitter: 'PS_AmandaJKT48',
      tiktok: 'jkt48.amanda.s',
      showroom: 'JKT48_Amanda',
      idn: 'jkt48_amanda',
      threads: 'jkt48.amanda.s',
      deepcrush: 'JKT48_Amanda'
    }
  },
  {
    id: 'christy',
    name: 'Christy',
    fullName: 'Christy Chriselle',
    generation: 7,
    team: 'K3',
    birthDate: '2003-12-02',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.christy',
      twitter: 'A_ChristyJKT48',
      tiktok: 'christyjkt48',
      showroom: 'JKT48_Christy',
      idn: 'jkt48_christy',
      threads: 'jkt48.christy',
      deepcrush: 'JKT48_Christy'
    }
  },
  {
    id: 'anindya',
    name: 'Anindya',
    fullName: 'Anindya Ramadhani',
    generation: 10,
    team: 'J',
    birthDate: '2004-06-18',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.anindya_',
      twitter: 'AR_AnindyaJKT48',
      tiktok: 'anindyajkt48',
      showroom: 'JKT48_Anindya',
      idn: 'jkt48_anindya',
      threads: 'jkt48.anindya_',
      deepcrush: 'JKT48_Anindya'
    }
  },
  {
    id: 'lia',
    name: 'Lia',
    fullName: 'Aurellia Clara Bonifacio',
    generation: 11,
    team: 'J',
    birthDate: '2004-08-29',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.aurellia_',
      twitter: 'AU_LiaJKT48',
      tiktok: 'jkt48.aurellia_',
      showroom: 'JKT48_Lia',
      idn: 'jkt48_lia',
      threads: 'jkt48.aurellia_',
      deepcrush: 'JKT48_Lia'
    }
  },
  {
    id: 'cathy',
    name: 'Cathy',
    fullName: 'Cathleen Nixie',
    generation: 11,
    team: 'J',
    birthDate: '2005-08-07',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.cathy',
      twitter: 'N_CathyJKT48',
      tiktok: 'cathyjkt48',
      showroom: 'JKT48_Cathy',
      idn: 'jkt48_cathy',
      threads: 'jkt48.cathy',
      deepcrush: 'JKT48_Cathy'
    }
  },
  {
    id: 'elin',
    name: 'Elin',
    fullName: 'Elin Alvionita',
    generation: 10,
    team: 'K3',
    birthDate: '2006-03-28',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.elin_',
      twitter: 'Elin_JKT48',
      tiktok: 'elinjkt48',
      showroom: 'JKT48_Elin',
      idn: 'jkt48_elin',
      threads: 'jkt48.elin_',
      deepcrush: 'JKT48_Elin'
    }
  },
  {
    id: 'chelsea',
    name: 'Chelsea',
    fullName: 'Aurellia Chelsea Ivana Leman',
    generation: 11,
    team: 'J',
    birthDate: '2006-02-09',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.chelsea.d',
      twitter: 'DC_ChelseaJKT48',
      tiktok: 'chelseajkt48',
      showroom: 'JKT48_Chelsea',
      idn: 'jkt48_chelsea',
      threads: 'jkt48.chelsea.d',
      deepcrush: 'JKT48_Chelsea'
    }
  },
  {
    id: 'oniel',
    name: 'Oniel',
    fullName: 'Cornelia Vanisa',
    generation: 8,
    team: 'J',
    birthDate: '2004-08-13',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.oniel',
      twitter: 'C_OnielJKT48',
      tiktok: 'onieljkt48',
      showroom: 'JKT48_Oniel',
      idn: 'jkt48_oniel',
      threads: 'jkt48.oniel',
      deepcrush: 'JKT48_Oniel'
    }
  },
  {
    id: 'cynthia',
    name: 'Cynthia',
    fullName: 'Cynthia Yaputera',
    generation: 8,
    team: 'K3',
    birthDate: '2000-11-21',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.cynthia',
      twitter: 'Y_CynthiaJKT48',
      tiktok: 'cynthiajkt48',
      showroom: 'JKT48_Cynthia',
      idn: 'jkt48_cynthia',
      threads: 'jkt48.cynthia',
      deepcrush: 'JKT48_Cynthia'
    }
  },
  {
    id: 'danella',
    name: 'Danella',
    fullName: 'Danella Felicity Artwork',
    generation: 9,
    team: 'J',
    birthDate: '2005-12-07',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.danella',
      twitter: 'Danella_JKT48',
      tiktok: 'danellajkt48',
      showroom: 'JKT48_Danella',
      idn: 'jkt48_danella',
      threads: 'jkt48.danella',
      deepcrush: 'JKT48_Danella'
    }
  },
  {
    id: 'daisy',
    name: 'Daisy',
    fullName: 'Daisy Natalia',
    generation: 9,
    team: 'K3',
    birthDate: '2005-12-25',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.daisy',
      twitter: 'Daisy_JKT48',
      tiktok: 'daisyjkt48',
      showroom: 'JKT48_Daisy',
      idn: 'jkt48_daisy',
      threads: 'jkt48.daisy',
      deepcrush: 'JKT48_Daisy'
    }
  },
  {
    id: 'olla',
    name: 'Olla',
    fullName: 'Febriola Sinambela',
    generation: 7,
    team: 'K3',
    birthDate: '2003-02-26',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.olla',
      twitter: 'F_OllaJKT48',
      tiktok: 'ollajkt48',
      showroom: 'JKT48_Olla',
      idn: 'jkt48_olla',
      threads: 'jkt48.olla',
      deepcrush: 'JKT48_Olla'
    }
  },
  {
    id: 'feni',
    name: 'Feni',
    fullName: 'Feni Fitriyanti',
    generation: 7,
    team: 'K3',
    birthDate: '2001-09-17',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48feni',
      twitter: 'F_FeniJKT48',
      tiktok: 'fenijkt48',
      showroom: 'JKT48_Feni',
      idn: 'jkt48_feni',
      threads: 'jkt48feni',
      deepcrush: 'JKT48_Feni'
    }
  },
  {
    id: 'fiony',
    name: 'Fiony',
    fullName: 'Fiony Alveria Tantri',
    generation: 7,
    team: 'J',
    birthDate: '2000-05-05',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.fiony',
      twitter: 'A_FionyJKT48',
      tiktok: 'fionyjkt48',
      showroom: 'JKT48_Fiony',
      idn: 'jkt48_fiony',
      threads: 'jkt48.fiony',
      deepcrush: 'JKT48_Fiony'
    }
  },
  {
    id: 'freya',
    name: 'Freya',
    fullName: 'Freyanashifa Jayawardana',
    generation: 8,
    team: 'J',
    birthDate: '2005-04-13',
    status: 'graduated',
    graduated: true,
    graduationDate: '2023-11-19',
    social: {
      instagram: 'jkt48.freya',
      twitter: 'Freya_JKT48',
      tiktok: 'freyajkt48',
      showroom: 'JKT48_Freya',
      idn: 'jkt48_freya',
      threads: 'jkt48.freya',
      deepcrush: 'JKT48_Freya'
    }
  },
  {
    id: 'ella',
    name: 'Ella',
    fullName: 'Gabriela Abigail Maudy',
    generation: 9,
    team: 'K3',
    birthDate: '2006-07-19',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.ella.a',
      twitter: 'AM_EllaJKT48',
      tiktok: 'jkt48.ella.a',
      showroom: 'JKT48_Ella',
      idn: 'jkt48_ella',
      threads: 'jkt48.ella.a',
      deepcrush: 'JKT48_Ella'
    }
  },
  {
    id: 'gendis',
    name: 'Gendis',
    fullName: 'Gendis Mayrannisa',
    generation: 10,
    team: 'J',
    birthDate: '2002-05-05',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.gendis',
      twitter: 'Gendis_JKT48',
      tiktok: 'gendisjkt48',
      showroom: 'JKT48_Gendis',
      idn: 'jkt48_gendis',
      threads: 'jkt48.gendis',
      deepcrush: 'JKT48_Gendis'
    }
  },
  {
    id: 'gita',
    name: 'Gita',
    fullName: 'Gita Sekar Andarini',
    generation: 6,
    team: 'K3',
    birthDate: '2001-04-30',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48gita',
      twitter: 'A_GitaJKT48',
      tiktok: 'gitajkt48',
      showroom: 'JKT48_Gita',
      idn: 'jkt48_gita',
      threads: 'jkt48gita',
      deepcrush: 'JKT48_Gita'
    }
  },
  {
    id: 'gracie',
    name: 'Gracie',
    fullName: 'Grace Octaviani',
    generation: 10,
    team: 'K3',
    birthDate: '2005-11-22',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.gracie',
      twitter: 'Gracie_JKT48',
      tiktok: 'graciejkt48',
      showroom: 'JKT48_Gracie',
      idn: 'jkt48_gracie',
      threads: 'jkt48.gracie',
      deepcrush: 'JKT48_Gracie'
    }
  },
  {
    id: 'greesel',
    name: 'Greesel',
    fullName: 'Greesel Adhalia',
    generation: 9,
    team: 'J',
    birthDate: '2006-08-15',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.greesel',
      twitter: 'Greesel_JKT48',
      tiktok: 'greeseljkt48',
      showroom: 'JKT48_Greesel',
      idn: 'jkt48_greesel',
      threads: 'jkt48.greesel',
      deepcrush: 'JKT48_Greesel'
    }
  },
  {
    id: 'eli',
    name: 'Eli',
    fullName: 'Helisma Mauludzunia Putri',
    generation: 8,
    team: 'J',
    birthDate: '2006-03-28',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.eli',
      twitter: 'H_EliJKT48',
      tiktok: 'elijkt48',
      showroom: 'JKT48_Eli',
      idn: 'jkt48_eli',
      threads: 'jkt48.eli',
      deepcrush: 'JKT48_Eli'
    }
  },
  {
    id: 'indah',
    name: 'Indah',
    fullName: 'Indah Cahya',
    generation: 11,
    team: 'K3',
    birthDate: '2004-05-22',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48indah',
      twitter: 'C_IndahJKT48',
      tiktok: 'indahjkt48',
      showroom: 'JKT48_Indah',
      idn: 'jkt48_Indah',
      threads: 'jkt48indah_',
      deepcrush: 'JKT48_Indah'
    }
  },
  {
    id: 'indira',
    name: 'Indira',
    fullName: 'Indira Putri Seruni',
    generation: 9,
    team: 'K3',
    birthDate: '2006-07-02',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.indira.s',
      twitter: 'SP_IndiraJKT48',
      tiktok: 'jkt48.indira.s',
      showroom: 'JKT48_Indira',
      idn: 'jkt48_Indira',
      threads: 'jkt48.indira.s',
      deepcrush: 'JKT48_Indira'
    }
  },
  {
    id: 'jessi',
    name: 'Jessi',
    fullName: 'Jessica Chandra',
    generation: 7,
    team: 'K3',
    birthDate: '2003-10-04',
    status: 'graduated',
    graduated: true,
    graduationDate: '2023-07-23',
    social: {
      instagram: 'jkt48.jessi',
      twitter: 'C_JessiJKT48',
      tiktok: 'jessijkt48',
      showroom: 'JKT48_Jessi',
      idn: 'jkt48_jessi',
      threads: 'jkt48.jessi',
      deepcrush: 'JKT48_Jessi'
    }
  },
  {
    id: 'lyn',
    name: 'Lyn',
    fullName: 'Devlyn Jovanita',
    generation: 11,
    team: 'K3',
    birthDate: '2007-01-15',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.lyn.s',
      twitter: 'SE_LynJKT48',
      tiktok: 'jkt48.lyn.s',
      showroom: 'JKT48_Lyn',
      idn: 'jkt48_lyn',
      threads: 'jkt48.lyn.s',
      deepcrush: 'JKT48_Lyn'
    }
  },
  {
    id: 'kathrina',
    name: 'Kathrina',
    fullName: 'Kathrina Irene',
    generation: 9,
    team: 'K3',
    birthDate: '2004-11-07',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.kathrina',
      twitter: 'I_KathrinaJKT48',
      tiktok: 'kathrinjkt48',
      showroom: 'JKT48_Kathrina',
      idn: 'jkt48_kathrina',
      threads: 'jkt48.kathrina',
      deepcrush: 'JKT48_Kathrina'
    }
  },
  {
    id: 'lulu',
    name: 'Lulu',
    fullName: 'Lulu Xaviera',
    generation: 9,
    team: 'J',
    birthDate: '2003-08-07',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.lulu',
      twitter: 'A_LuluJKT48',
      tiktok: 'lulu_jkt48',
      showroom: 'JKT48_Lulu',
      idn: 'jkt48_lulu',
      threads: 'jkt48.lulu',
      deepcrush: 'JKT48_Lulu'
    }
  },
  {
    id: 'marsha',
    name: 'Marsha',
    fullName: 'Marsha Lenathea',
    generation: 7,
    team: 'J',
    birthDate: '2002-01-09',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.marsha',
      twitter: 'L_MarshaJKT48',
      tiktok: 'marsha.jkt48',
      showroom: 'JKT48_Marsha',
      idn: 'jkt48_marsha',
      threads: 'jkt48.marsha',
      deepcrush: 'JKT48_Marsha'
    }
  },
  {
    id: 'michie',
    name: 'Michie',
    fullName: 'Michelle Alexandra Christo',
    generation: 10,
    team: 'J',
    birthDate: '2006-11-10',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.michie_',
      twitter: 'Michie_JKT48',
      tiktok: 'michiejkt48',
      showroom: 'JKT48_Michie',
      idn: 'jkt48_michie',
      threads: 'jkt48.michie_',
      deepcrush: 'JKT48_Michie'
    }
  },
  {
    id: 'muthe',
    name: 'Muthe',
    fullName: 'Jesslyn Callista',
    generation: 10,
    team: 'J',
    birthDate: '2005-11-10',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.muthe_',
      twitter: 'A_MutheJKT48',
      tiktok: 'muthejkt48',
      showroom: 'JKT48_Muthe',
      idn: 'jkt48_muthe',
      threads: 'jkt48.muthe_',
      deepcrush: 'JKT48_Muthe'
    }
  },
  {
    id: 'raisha',
    name: 'Raisha',
    fullName: 'Raisha Syifa',
    generation: 10,
    team: 'K3',
    birthDate: '2007-11-11',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.raisha.s',
      twitter: 'SW_RaishaJKT48',
      tiktok: 'jkt48.raisha.s',
      showroom: 'JKT48_Raisha',
      idn: 'jkt48_raisha',
      threads: 'jkt48.raisha.s',
      deepcrush: 'JKT48_Raisha'
    }
  },
  {
    id: 'gracia',
    name: 'Gracia',
    fullName: 'Gracia Novita Bororing',
    generation: 11,
    team: 'J',
    birthDate: '2003-03-09',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48gracia',
      twitter: 'S_GraciaJKT48',
      tiktok: 'graciajkt48',
      showroom: 'JKT48_Gracia',
      idn: 'jkt48_gracia',
      threads: 'jkt48gracia',
      deepcrush: 'JKT48_Gracia'
    }
  },
  
  // JKT48V (Virtual Members)
  {
    id: 'aralie',
    name: 'Aralie',
    fullName: 'Aralie',
    generation: 1,
    team: 'V',
    birthDate: '2004-07-17',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'jkt48.aralie',
      twitter: 'Aralie_JKT48V',
      tiktok: 'jkt48.aralie',
      showroom: 'JKT48_Aralie',
      idn: 'jkt48_aralie',
      threads: 'jkt48.aralie',
      deepcrush: 'JKT48_Aralie'
    }
  },
  {
    id: 'delynn',
    name: 'Delynn',
    fullName: 'Delynn',
    generation: 1,
    team: 'V',
    birthDate: '2005-04-20',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'jkt48.delynn',
      twitter: 'Delynn_JKT48',
      tiktok: 'jkt48.delynn',
      showroom: 'JKT48_Delynn',
      idn: 'jkt48_delynn',
      threads: 'jkt48.delynn',
      deepcrush: 'JKT48_Delynn'
    }
  },
  {
    id: 'virgi',
    name: 'Virgi',
    fullName: 'Virgi',
    generation: 1,
    team: 'V',
    birthDate: '2007-08-13',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'virgi.jkt48',
      twitter: 'A_VirgiJKT48',
      tiktok: 'jkt48.virgi',
      showroom: 'JKT48_Virgi',
      idn: 'jkt48_virgi',
      threads: 'jkt48.virgi',
      deepcrush: 'JKT48_Virgi'
    }
  },
  {
    id: 'auwia',
    name: 'Auwia',
    fullName: 'Auwia',
    generation: 1,
    team: 'V',
    birthDate: '2003-08-09',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'auwia.jkt48',
      twitter: 'Auwia_JKT48V',
      tiktok: 'jkt48.auwia',
      showroom: 'JKT48_Auwia',
      idn: 'jkt48_auwia',
      threads: 'jkt48.auwia',
      deepcrush: 'JKT48_Auwia'
    }
  },
  {
    id: 'lana',
    name: 'Lana',
    fullName: 'Lana Shahab',
    generation: 11,
    team: 'K3',
    birthDate: '2005-02-11',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.lana.a',
      twitter: 'AR_LanaJKT48',
      tiktok: 'jkt48.lana',
      showroom: 'JKT48_Lana',
      idn: 'jkt48_lana',
      threads: 'jkt48.lana.a',
      deepcrush: 'JKT48_Lana'
    }
  },
  {
    id: 'rilly',
    name: 'Rilly',
    fullName: 'Rilly',
    generation: 1,
    team: 'V',
    birthDate: '2005-04-06',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'rilly.jkt48_',
      twitter: 'Rilly_JKT48V',
      tiktok: 'jkt48.rilly',
      showroom: 'JKT48_Rilly',
      idn: 'jkt48_rilly',
      threads: 'jkt48.rilly',
      deepcrush: 'JKT48_Rilly'
    }
  },
  {
    id: 'erine',
    name: 'Erine',
    fullName: 'Erine',
    generation: 1,
    team: 'V',
    birthDate: '2008-01-23',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'jkt48.erine',
      twitter: 'CErine_JKT48',
      tiktok: 'jkt48.erine_',
      showroom: 'JKT48_Erine',
      idn: 'jkt48_erine',
      threads: 'jkt48.erine',
      deepcrush: 'JKT48_Erine'
    }
  },
  {
    id: 'fritzy',
    name: 'Fritzy',
    fullName: 'Fritzy Ramadhani',
    generation: 10,
    team: 'K3',
    birthDate: '2005-11-10',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.fritzy.r',
      twitter: 'RFritzy_JKT48',
      tiktok: 'jkt48.fritzy',
      showroom: 'JKT48_Fritzy',
      idn: 'jkt48_fritzy',
      threads: 'jkt48.fritzy.r',
      deepcrush: 'JKT48_Fritzy'
    }
  },
  {
    id: 'giaa',
    name: 'Giaa',
    fullName: 'Giaa Pratiwi',
    generation: 10,
    team: 'J',
    birthDate: '2007-05-15',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'giaa.jkt48',
      twitter: 'Giaa_JKT48',
      tiktok: 'giaajkt48',
      showroom: 'JKT48_Giaa',
      idn: 'jkt48_giaa',
      threads: 'jkt48.giaa',
      deepcrush: 'JKT48_Giaa'
    }
  },
  {
    id: 'lily',
    name: 'Lily',
    fullName: 'Lily Juniarti',
    generation: 9,
    team: 'K3',
    birthDate: '2004-06-12',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.lily',
      twitter: 'Lily_JKT48',
      tiktok: 'jkt48.lily',
      showroom: 'JKT48_Lily',
      idn: 'jkt48_lily',
      threads: 'jkt48.lily_',
      deepcrush: 'JKT48_Lily'
    }
  },
  {
    id: 'maira',
    name: 'Maira',
    fullName: 'Maira Kania',
    generation: 9,
    team: 'K3',
    birthDate: '2006-02-25',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.maira',
      twitter: 'Maira_JKT48',
      tiktok: 'jkt48.maira',
      showroom: 'JKT48_Maira',
      idn: 'jkt48_maira',
      threads: 'jkt48.maira',
      deepcrush: 'JKT48_Maira'
    }
  },
  {
    id: 'ekin',
    name: 'Ekin',
    fullName: 'Nariswari Erika Nindya',
    generation: 10,
    team: 'J',
    birthDate: '2006-04-12',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'ekin.jkt48',
      twitter: 'Ekin_JKT48',
      tiktok: 'jkt48.ekin',
      showroom: 'JKT48_Ekin',
      idn: 'jkt48_ekin',
      threads: 'jkt48.ekin',
      deepcrush: 'JKT48_Ekin'
    }
  },
  {
    id: 'trisha',
    name: 'Trisha',
    fullName: 'Trisha Anastasia',
    generation: 10,
    team: 'K3',
    birthDate: '2004-07-17',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.trisha',
      twitter: 'JTrisha_JKT48',
      tiktok: 'jkt48.trisha',
      showroom: 'JKT48_Trisha',
      idn: 'jkt48_trisha',
      threads: 'jkt48.trisha',
      deepcrush: 'JKT48_Trisha'
    }
  },
  {
    id: 'jemima',
    name: 'Jemima',
    fullName: 'Jemima Elyzabeth',
    generation: 12,
    team: 'K3',
    birthDate: '2007-09-22',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jemima.jkt48',
      twitter: 'JE_JemimaJKT48',
      tiktok: 'jkt48.jemima',
      showroom: 'JKT48_Jemima',
      idn: 'jkt48_jemima',
      threads: 'jkt48.jemima',
      deepcrush: 'JKT48_Jemima'
    }
  },
  {
    id: 'moreen',
    name: 'Moreen',
    fullName: 'Moreen Nathania',
    generation: 12,
    team: 'J',
    birthDate: '2007-12-03',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.moreen',
      twitter: 'Moreen_JKT48',
      tiktok: 'jkt48.moreen',
      showroom: 'JKT48_Moreen',
      idn: 'jkt48_moreen',
      threads: 'jkt48.moreen',
      deepcrush: 'JKT48_Moreen'
    }
  },
  {
    id: 'levi',
    name: 'Levi',
    fullName: 'Levi Farhany',
    generation: 12,
    team: 'K3',
    birthDate: '2003-03-12',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.levi',
      twitter: 'Levi_JKT48',
      tiktok: 'jkt48.levi',
      showroom: 'JKT48_Levi',
      idn: 'jkt48_levi',
      threads: 'jkt48.levi',
      deepcrush: 'JKT48_Levi'
    }
  },
  {
    id: 'mikaela',
    name: 'Mikaela',
    fullName: 'Mikaela Margriet',
    generation: 12,
    team: 'J',
    birthDate: '2008-04-23',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'mikaela.jkt48',
      twitter: 'M_MikaelaJKT48',
      tiktok: 'jkt48.mikaela',
      showroom: 'JKT48_Mikaela',
      idn: 'jkt48_mikaela',
      threads: 'jkt48.mikaela',
      deepcrush: 'JKT48_Mikaela'
    }
  },
  {
    id: 'nayla',
    name: 'Nayla',
    fullName: 'Nayla Shakira',
    generation: 12,
    team: 'J',
    birthDate: '2009-01-20',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.nayla.s',
      twitter: 'SNayla_JKT48',
      tiktok: 'jkt48.nayla',
      showroom: 'JKT48_Nayla',
      idn: 'jkt48_nayla',
      threads: 'jkt48.nayla.s',
      deepcrush: 'JKT48_Nayla'
    }
  },
  {
    id: 'nachia',
    name: 'Nachia',
    fullName: 'Nachia Thufaila',
    generation: 12,
    team: 'K3',
    birthDate: '2005-10-12',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.nachia.t',
      twitter: 'Nachia_JKT48',
      tiktok: 'jkt48.nachia',
      showroom: 'JKT48_Nachia',
      idn: 'jkt48_nachia',
      threads: 'jkt48.nachia.t',
      deepcrush: 'JKT48_Nachia'
    }
  },
  {
    id: 'intan',
    name: 'Intan',
    fullName: 'Intan Nur',
    generation: 12,
    team: 'K3',
    birthDate: '2007-11-23',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'intan.jkt48',
      twitter: 'N_IntanJKT48',
      tiktok: 'jkt48.intan',
      showroom: 'JKT48_Intan',
      idn: 'jkt48_intan',
      threads: 'jkt48.intan',
      deepcrush: 'JKT48_Intan'
    }
  },
  {
    id: 'oline',
    name: 'Oline',
    fullName: 'Oline Morena',
    generation: 12,
    team: 'J',
    birthDate: '2009-02-10',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.oline',
      twitter: 'M_OlineJKT48',
      tiktok: 'jkt48.oline',
      showroom: 'JKT48_OlineM',
      idn: 'jkt48_oline',
      threads: 'jkt48.oline',
      deepcrush: 'JKT48_Oline'
    }
  },
  {
    id: 'regie',
    name: 'Regie',
    fullName: 'Regie Raynastu',
    generation: 12,
    team: 'J',
    birthDate: '2007-08-18',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.regie',
      twitter: 'Regie_JKT48',
      tiktok: 'jkt48.regie',
      showroom: 'JKT48_Regie',
      idn: 'jkt48_regie',
      threads: 'jkt48.regie',
      deepcrush: 'JKT48_Regie'
    }
  },
  {
    id: 'ribka',
    name: 'Ribka',
    fullName: 'Ribka Rianty',
    generation: 12,
    team: 'K3',
    birthDate: '2006-05-02',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.ribka',
      twitter: 'Ribka_JKT48',
      tiktok: 'jkt48.ribka',
      showroom: 'JKT48_Ribka',
      idn: 'jkt48_ribka',
      threads: 'jkt48.ribka',
      deepcrush: 'JKT48_Ribka'
    }
  },
  {
    id: 'nala',
    name: 'Nala',
    fullName: 'Nala Salsabilla',
    generation: 12,
    team: 'K3',
    birthDate: '2007-07-16',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.nala',
      twitter: 'Nala_JKT48',
      tiktok: 'jkt48.nala',
      showroom: 'JKT48_Nala',
      idn: 'jkt48_nala',
      threads: 'jkt48.nala',
      deepcrush: 'JKT48_Nala'
    }
  },
  {
    id: 'kimmy',
    name: 'Kimmy',
    fullName: 'Kimberlyn Kurniadi',
    generation: 12,
    team: 'J',
    birthDate: '2006-01-19',
    status: 'active',
    graduated: false,
    social: {
      instagram: 'jkt48.kimmy',
      twitter: 'Kimmy_JKT48',
      tiktok: 'jkt48.kimmy',
      showroom: 'JKT48_Kimmy',
      idn: 'jkt48_kimmy',
      threads: 'jkt48.kimmy',
      deepcrush: 'JKT48_Kimmy'
    }
  },
  {
    id: 'kanaia',
    name: 'Kanaia',
    fullName: 'Kanaia',
    generation: 1,
    team: 'V',
    birthDate: '2006-04-10',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'jkt48v.kanaia',
      twitter: 'kanaia_jkt48v',
      tiktok: 'jkt48v.kanaia',
      showroom: 'JKT48V_Kanaia',
      idn: 'jkt48v_kanaia',
      threads: 'jkt48v.kanaia',
      deepcrush: 'JKT48V_Kanaia',
      youtube: 'https://youtube.com/@kanaiaasa-jkt48v'
    }
  },
  {
    id: 'pia',
    name: 'Pia',
    fullName: 'Pia',
    generation: 1,
    team: 'V',
    birthDate: '2006-07-23',
    status: 'active',
    graduated: false,
    isVirtual: true,
    social: {
      instagram: 'pia.kanaia',
      twitter: '',
      tiktok: 'jkt48v.pia',
      showroom: '',
      idn: '',
      threads: 'pia.kanaia',
      deepcrush: '',
      youtube: 'https://youtube.com/@piameraleo-jkt48v'
    }
  }
];

// Official accounts
const officialAccounts = [
  {
    id: 'jkt48official',
    name: 'JKT48 Official',
    description: 'Akun resmi JKT48',
    isOfficial: true,
    social: {
      instagram: 'jkt48official',
      twitter: 'officialJKT48',
      tiktok: 'jkt48.official',
      youtube: 'https://youtube.com/@OfficialJKT48',
      showroom: 'JKT48_Official',
      idn: 'jkt48-official',
      threads: 'jkt48',
      deepcrush: 'officialJKT48',
      website: 'https://jkt48.com'
    }
  },
  {
    id: 'jkt48tv',
    name: 'JKT48 TV',
    description: 'Channel YouTube resmi JKT48 TV',
    isOfficial: true,
    social: {
      youtube: 'https://youtube.com/@jkt48tv'
    }
  },
  {
    id: 'greshantv',
    name: 'Greshan TV',
    description: 'Channel YouTube resmi JKT48',
    isOfficial: true,
    social: {
      youtube: 'https://youtube.com/@greshantv'
    }
  },
  {
    id: 'kanaiaasa',
    name: 'Kanaia Asa',
    description: 'Channel YouTube resmi Kanaia JKT48V',
    isOfficial: true,
    social: {
      youtube: 'https://youtube.com/@kanaiaasa-jkt48v'
    }
  },
  {
    id: 'piameraleo',
    name: 'Pia Mera Leo',
    description: 'Channel YouTube resmi Pia JKT48V',
    isOfficial: true,
    social: {
      youtube: 'https://youtube.com/@piameraleo-jkt48v'
    }
  },
  {
    id: 'tananona',
    name: 'Tana Nona',
    description: 'Channel YouTube resmi JKT48V',
    isOfficial: true,
    social: {
      youtube: 'https://youtube.com/@tananona-jkt48v'
    }
  }
];

/**
 * Get all JKT48 members
 * @returns {Array} Array of all members
 */
function getAllMembers() {
  return members;
}

/**
 * Get current (non-graduated) JKT48 members
 * @returns {Array} Array of current members
 */
function getCurrentMembers() {
  return members.filter(member => !member.graduated);
}

/**
 * Get graduated JKT48 members
 * @returns {Array} Array of graduated members
 */
function getGraduatedMembers() {
  return members.filter(member => member.graduated);
}

/**
 * Get members by team
 * @param {string} team - Team name (e.g., 'J', 'K3', 'T')
 * @returns {Array} Array of members in the specified team
 */
function getMembersByTeam(team) {
  return members.filter(member => member.team === team && !member.graduated);
}

/**
 * Get members by generation
 * @param {number} generation - Generation number
 * @returns {Array} Array of members in the specified generation
 */
function getMembersByGeneration(generation) {
  return members.filter(member => member.generation === generation);
}

/**
 * Get a member by ID
 * @param {string} id - Member ID
 * @returns {Object|null} Member object or null if not found
 */
function getMemberById(id) {
  return members.find(member => member.id === id) || null;
}

/**
 * Search members by name
 * @param {string} query - Search query
 * @returns {Array} Array of matching members
 */
function searchMembersByName(query) {
  const lowercaseQuery = query.toLowerCase();
  return members.filter(
    member => 
      member.name.toLowerCase().includes(lowercaseQuery) || 
      member.fullName.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get members having birthdays in the specified month
 * @param {number} month - Month (1-12)
 * @returns {Array} Array of members with birthdays in the month
 */
function getMembersByBirthMonth(month) {
  return members.filter(member => {
    const birthDate = new Date(member.birthDate);
    return birthDate.getMonth() + 1 === month;
  });
}

/**
 * Get members having birthdays today
 * @returns {Array} Array of members with birthdays today
 */
function getMembersWithBirthdayToday() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  return members.filter(member => {
    const birthDate = new Date(member.birthDate);
    return birthDate.getMonth() + 1 === month && birthDate.getDate() === day;
  });
}

/**
 * Get members by social media platform
 * @param {string} platform - Social media platform (e.g., 'instagram', 'twitter', 'showroom')
 * @returns {Array} Array of members with the specified social media account
 */
function getMembersBySocialMedia(platform) {
  return members.filter(
    member => member.social && member.social[platform] && member.social[platform].length > 0
  );
}

/**
 * Get VTuber members
 * @returns {Array} Array of VTuber members
 */
function getVtuberMembers() {
  return members.filter(member => member.isVirtual);
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
  return getCurrentMembers().map(member => member.name);
}

/**
 * Get all social media URLs by platform
 * @param {string} platform - Social media platform (e.g., 'twitter', 'instagram')
 * @returns {Array} Array of URLs for the specified platform
 */
function getAllSocialMediaUrls(platform) {
  const urls = [];
  
  // Add member social media
  members.forEach(member => {
    if (member.social && member.social[platform] && !member.graduated) {
      let url = '';
      
      if (platform === 'twitter') {
        url = `https://twitter.com/${member.social[platform]}`;
      } else if (platform === 'instagram') {
        url = `https://www.instagram.com/${member.social[platform]}`;
      } else if (platform === 'tiktok') {
        url = `https://www.tiktok.com/${member.social[platform]}`;
      } else if (platform === 'showroom') {
        url = `https://www.showroom-live.com/${member.social[platform]}`;
      } else if (platform === 'idn') {
        url = `https://www.idn.app/${member.social[platform]}`;
      } else if (platform === 'threads') {
        url = `https://www.threads.net/@${member.social[platform]}`;  
      } else if (platform === 'deepcrush') {
        url = `https://dc.crstlnz.my.id/watch/${member.social[platform]}`;
      } else if (platform === 'youtube' && member.social[platform]) {
        url = member.social[platform];
      }
      
      if (url) {
        urls.push({
          id: member.id,
          name: member.name,
          url,
          isOfficial: false
        });
      }
    }
  });
  
  // Add official social media
  officialAccounts.forEach(account => {
    if (account.social && account.social[platform]) {
      let url = '';
      
      if (platform === 'twitter') {
        url = `https://twitter.com/${account.social[platform]}`;
      } else if (platform === 'instagram') {
        url = `https://www.instagram.com/${account.social[platform]}`;
      } else if (platform === 'tiktok') {
        url = `https://www.tiktok.com/${account.social[platform]}`;
      } else if (platform === 'showroom') {
        url = `https://www.showroom-live.com/${account.social[platform]}`;
      } else if (platform === 'idn') {
        url = `https://www.idn.app/${account.social[platform]}`;
      } else if (platform === 'threads') {
        url = `https://www.threads.net/@${account.social[platform]}`;
      } else if (platform === 'deepcrush') {
        url = `https://dc.crstlnz.my.id/watch/${account.social[platform]}`;
      } else if (platform === 'youtube') {
        url = account.social[platform];
      } else if (platform === 'website') {
        url = account.social[platform];
      }
      
      if (url) {
        urls.push({
          id: account.id,
          name: account.name,
          url,
          isOfficial: true
        });
      }
    }
  });
  
  return urls;
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
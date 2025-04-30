/**
 * JKT48 Setlist Data
 * 
 * Data setlist theater JKT48 baik yang aktif maupun tidak aktif.
 * Termasuk judul lagu, original AKB48 Group, dan tanggal pertama kali digelar.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

// Database setlist JKT48
const setlists = [
  {
    id: 'cara_meminum_ramune',
    name: 'Cara Meminum Ramune',
    originalName: 'ラムネの飲み方',
    originalGroup: 'AKB48',
    firstPerformed: '2023-08-19',
    status: 'active',
    description: 'Setlist perdana untuk JKT48 Generasi 11, adaptasi dari setlist "Ramune no Nomikata" dari AKB48.',
    songs: [
      'Overture',
      'Cara Meminum Ramune',
      'Permen Karet Warna-warna',
      'Kicir-kicir',
      'Langit dan Laut Biru',
      'Gadis Senja',
      'MC 1',
      'Langit dan Laut Biru',
      'Warna-warna Pelangi',
      'Blue Rose',
      'Perempuan dan Kehidupan',
      'MC 2',
      'Kecupan Pertama!',
      'Kehilangan',
      'Musim Panas yang Ditunggu',
      'MC 3',
      'Cerita Pagi Itu',
      'Dunia milik Kita'
    ]
  },
  {
    id: 'melody_kehidupan',
    name: 'Melody Kehidupan',
    originalName: 'パジャマドライブ',
    originalGroup: 'AKB48',
    firstPerformed: '2022-08-27',
    status: 'active',
    description: 'Setlist untuk Team K3 JKT48, adaptasi dari "Pajama Drive" AKB48. Diperkenalkan untuk pertama kali pada 27 Agustus 2022.',
    songs: [
      'Overture',
      'Kaze wa Fuiteiru',
      'Watashi no Taiyou',
      'Arigatou',
      'Glass no I LOVE YOU',
      'MC 1',
      'Pajama Drive',
      'Tsuki to Mizukagami',
      'Namida no Sea-saw Game',
      'MC 2',
      'Dareka no Okurimono',
      'Bird',
      'Tonari no Banana',
      'Tengoku Yarou',
      'MC 3',
      'Nage Kiss de Uchi Otose',
      'Seventeen'
    ]
  },
  {
    id: 'merampok_hatimu',
    name: 'Merampok Hatimu',
    originalName: 'ロマンス・イラネ',
    originalGroup: 'AKB48',
    firstPerformed: '2023-05-12',
    status: 'active',
    description: 'Setlist untuk Team J JKT48, adaptasi dari "Romance Irane" AKB48. Diperkenalkan untuk pertama kali pada 12 Mei 2023.',
    songs: [
      'Overture',
      'Romance ga Ippai',
      'Oogoe Diamond',
      'Sakura no Ki ni Narou',
      'Tenshi no Shippo',
      'MC 1',
      'Futari Nori no Jitensha',
      'Hachigatsu no Yoru',
      'Romance Irane',
      'Vampire Keikaku',
      'MC 2',
      'Glory Days',
      'Temodemo no Namida',
      'Star ni Nante Naritaku Nai',
      'MC 3',
      'Tsuki no Katachi',
      'Shounichi'
    ]
  },
  {
    id: 'banzai_jkt48',
    name: 'Banzai JKT48',
    originalName: 'AKB48 単独リクエストアワー2016',
    originalGroup: 'AKB48',
    firstPerformed: '2023-07-01',
    status: 'active',
    description: 'Setlist khusus untuk perayaan ulang tahun JKT48 yang ke-12. Berisi kumpulan lagu-lagu hits JKT48 dari berbagai era.',
    songs: [
      'Overture',
      'Kokoro no Placard',
      'Papan Nama Mirai',
      'Only Today',
      'Yuuhi wo Miteiru ka?',
      'MC 1',
      'Shinkirou',
      'Namida Surprise',
      'Oogoe Diamond',
      'Kibouteki Refrain',
      'MC 2',
      'Pareo wa Emerald',
      'Kaze wa Fuiteiru',
      'Yakusoku yo',
      'MC 3',
      'Heavy Rotation',
      'Kimi no Koto ga Suki Dakara',
      'Banzai JKT48'
    ]
  },
  {
    id: 'aturan_anti_cinta',
    name: 'Aturan Anti Cinta',
    originalName: '恋愛禁止条例',
    originalGroup: 'AKB48',
    firstPerformed: '2019-02-09',
    status: 'inactive',
    description: 'Setlist legendaris JKT48, adaptasi dari "Renai Kinshi Jourei" AKB48. Salah satu setlist pertama sejak awal berdirinya JKT48.',
    songs: [
      'Overture',
      'Koisuru Fortune Cookie',
      'Renai Kinshi Jourei',
      'Gomen ne Summer',
      'Namida Surprise',
      'MC 1',
      'Kimi no Koto ga Suki Dakara',
      'Idol no Yoake',
      'Hanikami Lollipop',
      'Watarirouka Hashiritai',
      'MC 2',
      'Suki Suki Skip',
      'Dareka no Tame ni',
      'Ama Nojaku Batta',
      'Juujun na Slave',
      'MC 3',
      'Seifuku ga Jama wo Suru',
      'Tsuyoki Mono yo'
    ]
  }
];

/**
 * Get all setlists
 * @returns {Array} Array of all setlists
 */
function getAllSetlists() {
  return setlists;
}

/**
 * Get active setlists
 * @returns {Array} Array of active setlists
 */
function getActiveSetlists() {
  return setlists.filter(setlist => setlist.status === 'active');
}

/**
 * Get inactive setlists
 * @returns {Array} Array of inactive setlists
 */
function getInactiveSetlists() {
  return setlists.filter(setlist => setlist.status === 'inactive');
}

/**
 * Get a setlist by ID
 * @param {string} id - Setlist ID
 * @returns {Object|null} Setlist object or null if not found
 */
function getSetlistById(id) {
  return setlists.find(setlist => setlist.id === id) || null;
}

/**
 * Search setlists by name
 * @param {string} query - Search query
 * @returns {Array} Array of matching setlists
 */
function searchSetlistsByName(query) {
  const lowercaseQuery = query.toLowerCase();
  return setlists.filter(
    setlist => 
      setlist.name.toLowerCase().includes(lowercaseQuery) || 
      setlist.originalName.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get songs from a specific setlist
 * @param {string} setlistId - Setlist ID
 * @returns {Array|null} Array of songs or null if setlist not found
 */
function getSongsFromSetlist(setlistId) {
  const setlist = getSetlistById(setlistId);
  return setlist ? setlist.songs : null;
}

/**
 * Get setlists by original group
 * @param {string} group - Original group name (e.g., 'AKB48', 'SKE48')
 * @returns {Array} Array of setlists from the specified original group
 */
function getSetlistsByOriginalGroup(group) {
  return setlists.filter(
    setlist => setlist.originalGroup.toLowerCase() === group.toLowerCase()
  );
}

module.exports = {
  getAllSetlists,
  getActiveSetlists,
  getInactiveSetlists,
  getSetlistById,
  searchSetlistsByName,
  getSongsFromSetlist,
  getSetlistsByOriginalGroup
};
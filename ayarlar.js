// Oyun ayarları — dengeyi buradan değiştir.
const AYAR = {
  sutun: 10,
  satir: 20,
  kare: 30,               // canvas içindeki blok boyutu (px)

  // Düşme hızı: seviye başına ms cinsinden düşme aralığı
  dusmeBaslangic: 800,
  dusmeAzalma: 60,        // her seviyede hızlanma
  dusmeEnAz: 120,

  // RPG
  kahramanHp: 100,
  dusmanHpTaban: 40,
  dusmanHpArtis: 18,      // düşman başına artış
  dusmanHasarTaban: 8,
  dusmanHasarArtis: 3,
  xpTaban: 50,
  xpArtis: 25,

  // Satır temizleme hasarı
  satirHasar: 10,
  komboCarpani: 5,        // her ek kombo satırı için ek hasar
  tetrisHasar: 25,        // 4 satır birden

  // Yetenekler: seviye ile açılır
  yetenekler: [
    { seviye: 2, ad: 'Kılıç Darbesi', aciklama: 'Her 5 satırda +15 hasar' },
    { seviye: 4, ad: 'Kalkan', aciklama: 'Gelen hasar %25 azalır' },
    { seviye: 6, ad: 'Ateş Topu', aciklama: 'Tetris (4 satır) hasarı 2 katına çıkar' }
  ],

  // Blok renkleri (sprite yoksa canvas ile çizilir)
  renkler: {
    I: '#4ac0e0',
    O: '#f0c040',
    T: '#b04ae0',
    S: '#4ae07a',
    Z: '#e04a5a',
    J: '#4a6ae0',
    L: '#e08a4a'
  }
};

// Tetromino şekilleri (döndürme matrisleri)
const SEKILLER = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

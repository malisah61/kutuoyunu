// RPG Tetris — oyun mantığı (1/2): durum, çizim, arayüz.
// Sprite'lar varliklar.js üzerinden Sprite Atölye görsellerinden yüklenir.

const tuval = document.getElementById('oyun');
const ctx = tuval.getContext('2d');
const siradakiTuval = document.getElementById('siradaki');
const sctx = siradakiTuval.getContext('2d');
const KAHRAMAN_TUVAL = document.getElementById('kahraman');
const DUSMAN_TUVAL = document.getElementById('dusman');

const el = {
  seviye: document.getElementById('seviye'),
  skor: document.getElementById('skor'),
  satir: document.getElementById('satir'),
  hpDolu: document.getElementById('hp-dolu'),
  hpYazi: document.getElementById('hp-yazi'),
  xpDolu: document.getElementById('xp-dolu'),
  xpYazi: document.getElementById('xp-yazi'),
  dusmanAd: document.getElementById('dusman-ad'),
  dusmanHpDolu: document.getElementById('dusman-hp-dolu'),
  dusmanHpYazi: document.getElementById('dusman-hp-yazi'),
  yetenekler: document.getElementById('yetenekler'),
  perde: document.getElementById('perde'),
  perdeBaslik: document.getElementById('perde-baslik'),
  perdeMetin: document.getElementById('perde-metin'),
  perdeDugme: document.getElementById('perde-dugme')
};

const DUSMAN_ADLARI = ['Slime', 'Yarasa', 'İskelet', 'Golem', 'Ejderha'];

const durum = {
  tahta: [],
  parca: null,
  siradaki: null,
  dusmeZamani: 0,
  calisiyor: false,
  skor: 0,
  satirSayisi: 0,
  seviye: 1,
  xp: 0,
  hp: AYAR.kahramanHp,
  dusmanIndeks: 0,
  dusmanHp: 0,
  dusmanMaksHp: 0,
  kombo: 0
};

function bosTahta() {
  return Array.from({ length: AYAR.satir }, () => Array(AYAR.sutun).fill(null));
}

function rastgeleParca() {
  const anahtarlar = Object.keys(SEKILLER);
  const tip = anahtarlar[Math.floor(Math.random() * anahtarlar.length)];
  return { tip, sekil: SEKILLER[tip].map((r) => r.slice()), x: Math.floor(AYAR.sutun / 2) - 1, y: 0 };
}

function carpisma(sekil, px, py) {
  for (let y = 0; y < sekil.length; y++) {
    for (let x = 0; x < sekil[y].length; x++) {
      if (!sekil[y][x]) continue;
      const tx = px + x;
      const ty = py + y;
      if (tx < 0 || tx >= AYAR.sutun || ty >= AYAR.satir) return true;
      if (ty >= 0 && durum.tahta[ty][tx]) return true;
    }
  }
  return false;
}

function dondur(sekil) {
  const satirSay = sekil.length;
  const sutunSay = sekil[0].length;
  const yeni = Array.from({ length: sutunSay }, () => Array(satirSay).fill(0));
  for (let y = 0; y < satirSay; y++) {
    for (let x = 0; x < sutunSay; x++) {
      yeni[x][satirSay - 1 - y] = sekil[y][x];
    }
  }
  return yeni;
}

function blokCiz(c, px, py, boyut, tip) {
  c.fillStyle = AYAR.renkler[tip] || '#888';
  c.fillRect(px, py, boyut, boyut);
  c.strokeStyle = 'rgba(0,0,0,0.35)';
  c.lineWidth = 2;
  c.strokeRect(px + 1, py + 1, boyut - 2, boyut - 2);
  c.fillStyle = 'rgba(255,255,255,0.18)';
  c.fillRect(px + 3, py + 3, boyut - 6, 4);
}

function tahtaCiz() {
  ctx.fillStyle = '#0d0d16';
  ctx.fillRect(0, 0, tuval.width, tuval.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 1; x < AYAR.sutun; x++) {
    ctx.beginPath();
    ctx.moveTo(x * AYAR.kare, 0);
    ctx.lineTo(x * AYAR.kare, tuval.height);
    ctx.stroke();
  }
  for (let y = 1; y < AYAR.satir; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * AYAR.kare);
    ctx.lineTo(tuval.width, y * AYAR.kare);
    ctx.stroke();
  }

  for (let y = 0; y < AYAR.satir; y++) {
    for (let x = 0; x < AYAR.sutun; x++) {
      if (durum.tahta[y][x]) blokCiz(ctx, x * AYAR.kare, y * AYAR.kare, AYAR.kare, durum.tahta[y][x]);
    }
  }

  if (durum.parca) {
    const p = durum.parca;
    for (let y = 0; y < p.sekil.length; y++) {
      for (let x = 0; x < p.sekil[y].length; x++) {
        if (p.sekil[y][x]) blokCiz(ctx, (p.x + x) * AYAR.kare, (p.y + y) * AYAR.kare, AYAR.kare, p.tip);
      }
    }
  }
}

function siradakiCiz() {
  sctx.clearRect(0, 0, siradakiTuval.width, siradakiTuval.height);
  if (!durum.siradaki) return;
  const boyut = 20;
  const p = durum.siradaki;
  const basX = (siradakiTuval.width - p.sekil[0].length * boyut) / 2;
  const basY = (siradakiTuval.height - p.sekil.length * boyut) / 2;
  for (let y = 0; y < p.sekil.length; y++) {
    for (let x = 0; x < p.sekil[y].length; x++) {
      if (p.sekil[y][x]) blokCiz(sctx, basX + x * boyut, basY + y * boyut, boyut, p.tip);
    }
  }
}

function karakterleriCiz() {
  const kctx = KAHRAMAN_TUVAL.getContext('2d');
  varlikCiz(kctx, VARLIK_ADLARI.kahraman, KAHRAMAN_TUVAL.width, 'kahraman');

  const dctx = DUSMAN_TUVAL.getContext('2d');
  const ad = VARLIK_ADLARI.dusmanlar[durum.dusmanIndeks % VARLIK_ADLARI.dusmanlar.length];
  varlikCiz(dctx, ad, DUSMAN_TUVAL.width, 'dusman', durum.dusmanIndeks);
}

function arayuzGuncelle() {
  el.seviye.textContent = durum.seviye;
  el.skor.textContent = durum.skor;
  el.satir.textContent = durum.satirSayisi;

  const hpOran = Math.max(0, durum.hp) / AYAR.kahramanHp;
  el.hpDolu.style.width = (hpOran * 100) + '%';
  el.hpYazi.textContent = Math.max(0, Math.round(durum.hp)) + ' / ' + AYAR.kahramanHp;

  const xpGerek = AYAR.xpTaban + (durum.seviye - 1) * AYAR.xpArtis;
  el.xpDolu.style.width = Math.min(100, (durum.xp / xpGerek) * 100) + '%';
  el.xpYazi.textContent = durum.xp + ' / ' + xpGerek;

  el.dusmanAd.textContent = DUSMAN_ADLARI[durum.dusmanIndeks % DUSMAN_ADLARI.length];
  const dOran = durum.dusmanMaksHp ? Math.max(0, durum.dusmanHp) / durum.dusmanMaksHp : 0;
  el.dusmanHpDolu.style.width = (dOran * 100) + '%';
  el.dusmanHpYazi.textContent = Math.max(0, Math.round(durum.dusmanHp)) + ' / ' + durum.dusmanMaksHp;

  el.yetenekler.innerHTML = '';
  AYAR.yetenekler.forEach((y) => {
    const acik = durum.seviye >= y.seviye;
    const d = document.createElement('div');
    d.className = 'yetenek' + (acik ? ' acik' : '');
    d.textContent = acik ? y.ad : '🔒 ' + y.ad + ' (Sv.' + y.seviye + ')';
    d.title = y.aciklama;
    el.yetenekler.appendChild(d);
  });
}

function perdeGoster(baslik, metin, dugmeYazi) {
  el.perdeBaslik.textContent = baslik;
  el.perdeMetin.textContent = metin;
  el.perdeDugme.textContent = dugmeYazi;
  el.perde.classList.remove('gizli');
}

function perdeGizle() {
  el.perde.classList.add('gizli');
}

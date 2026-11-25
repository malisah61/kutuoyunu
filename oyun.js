// RPG Tetris — oyun mantığı (tek dosya).
// Sprite'lar varliklar.js üzerinden Sprite Atölye görsellerinden yüklenir.

const tuval = document.getElementById('oyun');
const ctx = tuval.getContext('2d');
const siradakiTuval = document.getElementById('sonraki');
const sctx = siradakiTuval.getContext('2d');
const KAHRAMAN_TUVAL = document.getElementById('kahraman');
const DUSMAN_TUVAL = document.getElementById('dusman');

const el = {
  seviye: document.getElementById('seviye'),
  hpDolu: document.getElementById('hp-dolu'),
  hpYazi: document.getElementById('hp-yazi'),
  xpDolu: document.getElementById('xp-dolu'),
  xpYazi: document.getElementById('xp-yazi'),
  dusmanAd: document.getElementById('dusman-ad'),
  dusmanDolu: document.getElementById('dusman-dolu'),
  dusmanYazi: document.getElementById('dusman-yazi'),
  dusmanEtiket: document.getElementById('dusman-etiket'),
  yetenekler: document.getElementById('yetenekler'),
  skor: document.getElementById('skor'),
  satir: document.getElementById('satir'),
  kombo: document.getElementById('kombo'),
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
  skor: 0,
  satirSayisi: 0,
  seviye: 1,
  xp: 0,
  hp: AYAR.kahramanHp,
  dusmanIndeks: 0,
  dusmanHp: 0,
  dusmanMaksHp: 0,
  kombo: 0,
  calisiyor: false,
  dusmeZamani: 0
};

function bosTahta() {
  return Array.from({ length: AYAR.satir }, () => Array(AYAR.sutun).fill(null));
}

function rastgeleParca() {
  const anahtarlar = Object.keys(SEKILLER);
  const tip = anahtarlar[Math.floor(Math.random() * anahtarlar.length)];
  return { tip, sekil: SEKILLER[tip].map((s) => s.slice()), x: 0, y: 0 };
}

function dondur(sekil) {
  const h = sekil.length;
  const w = sekil[0].length;
  const yeni = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) yeni[x][h - 1 - y] = sekil[y][x];
  }
  return yeni;
}

function carpisma(sekil, px, py) {
  for (let y = 0; y < sekil.length; y++) {
    for (let x = 0; x < sekil[y].length; x++) {
      if (!sekil[y][x]) continue;
      const ty = py + y;
      const tx = px + x;
      if (tx < 0 || tx >= AYAR.sutun || ty >= AYAR.satir) return true;
      if (ty >= 0 && durum.tahta[ty][tx]) return true;
    }
  }
  return false;
}

// ---------- Çizim ----------

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
  const k = AYAR.kare;
  ctx.fillStyle = '#0d0d16';
  ctx.fillRect(0, 0, tuval.width, tuval.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 1; x < AYAR.sutun; x++) {
    ctx.beginPath();
    ctx.moveTo(x * k, 0);
    ctx.lineTo(x * k, tuval.height);
    ctx.stroke();
  }
  for (let y = 1; y < AYAR.satir; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * k);
    ctx.lineTo(tuval.width, y * k);
    ctx.stroke();
  }

  for (let y = 0; y < AYAR.satir; y++) {
    for (let x = 0; x < AYAR.sutun; x++) {
      if (durum.tahta[y][x]) blokCiz(ctx, x * k, y * k, k, durum.tahta[y][x]);
    }
  }

  const p = durum.parca;
  if (p) {
    for (let y = 0; y < p.sekil.length; y++) {
      for (let x = 0; x < p.sekil[y].length; x++) {
        if (p.sekil[y][x] && p.y + y >= 0) blokCiz(ctx, (p.x + x) * k, (p.y + y) * k, k, p.tip);
      }
    }
  }
}

function siradakiCiz() {
  sctx.clearRect(0, 0, siradakiTuval.width, siradakiTuval.height);
  const p = durum.siradaki;
  if (!p) return;
  const k = 24;
  const w = p.sekil[0].length * k;
  const h = p.sekil.length * k;
  const ox = (siradakiTuval.width - w) / 2;
  const oy = (siradakiTuval.height - h) / 2;
  for (let y = 0; y < p.sekil.length; y++) {
    for (let x = 0; x < p.sekil[y].length; x++) {
      if (p.sekil[y][x]) blokCiz(sctx, ox + x * k, oy + y * k, k, p.tip);
    }
  }
}

function karakterleriCiz() {
  varlikCiz(KAHRAMAN_TUVAL.getContext('2d'), VARLIK_ADLARI.kahraman, KAHRAMAN_TUVAL.width, 'kahraman');
  const ad = VARLIK_ADLARI.dusmanlar[durum.dusmanIndeks % VARLIK_ADLARI.dusmanlar.length];
  varlikCiz(DUSMAN_TUVAL.getContext('2d'), ad, DUSMAN_TUVAL.width, 'dusman', durum.dusmanIndeks);
}

// ---------- Arayüz ----------

function arayuzGuncelle() {
  el.seviye.textContent = durum.seviye;
  el.hpDolu.style.width = Math.max(0, (durum.hp / AYAR.kahramanHp) * 100) + '%';
  el.hpYazi.textContent = Math.max(0, durum.hp) + '/' + AYAR.kahramanHp;

  const gerek = AYAR.xpTaban + (durum.seviye - 1) * AYAR.xpArtis;
  el.xpDolu.style.width = Math.min(100, (durum.xp / gerek) * 100) + '%';
  el.xpYazi.textContent = durum.xp + '/' + gerek;

  el.dusmanAd.textContent = DUSMAN_ADLARI[durum.dusmanIndeks % DUSMAN_ADLARI.length];
  el.dusmanDolu.style.width = Math.max(0, (durum.dusmanHp / durum.dusmanMaksHp) * 100) + '%';
  el.dusmanYazi.textContent = Math.max(0, durum.dusmanHp) + '/' + durum.dusmanMaksHp;
  const sonraki = DUSMAN_ADLARI[(durum.dusmanIndeks + 1) % DUSMAN_ADLARI.length];
  el.dusmanEtiket.textContent = 'Sıradaki: ' + sonraki;

  el.skor.textContent = durum.skor;
  el.satir.textContent = durum.satirSayisi;
  el.kombo.textContent = durum.kombo;

  el.yetenekler.innerHTML = '';
  AYAR.yetenekler.forEach((y) => {
    const d = document.createElement('div');
    d.className = 'yetenek' + (durum.seviye >= y.seviye ? ' acik' : '');
    d.innerHTML = '<b>' + y.ad + '</b><span>Sv. ' + y.seviye + ' — ' + y.aciklama + '</span>';
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

// ---------- RPG katmanı ----------

function dusmanCagir() {
  durum.dusmanMaksHp = AYAR.dusmanHpTaban + durum.dusmanIndeks * AYAR.dusmanHpArtis;
  durum.dusmanHp = durum.dusmanMaksHp;
  karakterleriCiz();
  arayuzGuncelle();
}

function dusmanaHasar(miktar) {
  durum.dusmanHp -= miktar;
  if (durum.dusmanHp <= 0) {
    durum.dusmanIndeks++;
    durum.skor += 100 * durum.seviye;
    dusmanCagir();
  }
  arayuzGuncelle();
}

function kahramanaHasar() {
  let hasar = AYAR.dusmanHasarTaban + durum.dusmanIndeks * AYAR.dusmanHasarArtis;
  if (durum.seviye >= 4) hasar = Math.round(hasar * AYAR.kalkanCarpani);   // Kalkan yeteneği
  durum.hp -= hasar;
  arayuzGuncelle();
  if (durum.hp <= 0) oyunBitti();
}

function xpEkle(miktar) {
  durum.xp += miktar;
  let gerek = AYAR.xpTaban + (durum.seviye - 1) * AYAR.xpArtis;
  while (durum.xp >= gerek) {
    durum.xp -= gerek;
    durum.seviye++;
    gerek = AYAR.xpTaban + (durum.seviye - 1) * AYAR.xpArtis;
  }
  arayuzGuncelle();
}

// ---------- Tetris akışı ----------

function satirlariTemizle() {
  let temizlenen = 0;
  for (let y = AYAR.satir - 1; y >= 0; y--) {
    if (durum.tahta[y].every((h) => h)) {
      durum.tahta.splice(y, 1);
      durum.tahta.unshift(Array(AYAR.sutun).fill(null));
      temizlenen++;
      y++;   // kaydırma sonrası aynı indeksi tekrar kontrol et
    }
  }
  if (temizlenen > 0) {
    durum.kombo++;
    durum.satirSayisi += temizlenen;
    durum.skor += temizlenen * 100 * durum.seviye;

    let hasar = temizlenen * AYAR.satirHasar + (durum.kombo - 1) * AYAR.komboCarpani;
    if (temizlenen === 4) hasar += AYAR.tetrisHasar;
    if (temizlenen === 4 && durum.seviye >= 6) hasar *= 2;              // Ateş Topu
    if (durum.seviye >= 2 && durum.satirSayisi % 5 === 0) hasar += 15;  // Kılıç Darbesi

    dusmanaHasar(hasar);
    xpEkle(temizlenen * 10);
  } else {
    durum.kombo = 0;
  }
}

function parcaYerlestir() {
  const p = durum.parca;
  for (let y = 0; y < p.sekil.length; y++) {
    for (let x = 0; x < p.sekil[y].length; x++) {
      if (!p.sekil[y][x]) continue;
      const ty = p.y + y;
      const tx = p.x + x;
      if (ty < 0) { oyunBitti(); return; }
      durum.tahta[ty][tx] = p.tip;
    }
  }
  satirlariTemizle();
  if (!durum.calisiyor) return;
  yeniParca();
  kahramanaHasar();   // her yerleşen parça düşmanın hamlesi
}

function yeniParca() {
  durum.parca = durum.siradaki || rastgeleParca();
  durum.siradaki = rastgeleParca();
  durum.parca.x = Math.floor(AYAR.sutun / 2) - 1;
  durum.parca.y = 0;
  siradakiCiz();
  if (carpisma(durum.parca.sekil, durum.parca.x, durum.parca.y)) oyunBitti();
}

function asagiIn() {
  if (!durum.calisiyor) return;
  const p = durum.parca;
  if (!carpisma(p.sekil, p.x, p.y + 1)) {
    p.y++;
  } else {
    parcaYerlestir();
  }
  tahtaCiz();
}

function hareket(dx) {
  if (!durum.calisiyor) return;
  const p = durum.parca;
  if (!carpisma(p.sekil, p.x + dx, p.y)) p.x += dx;
  tahtaCiz();
}

function dondurParca() {
  if (!durum.calisiyor) return;
  const p = durum.parca;
  const yeni = dondur(p.sekil);
  if (!carpisma(yeni, p.x, p.y)) p.sekil = yeni;
  tahtaCiz();
}

function hizliDus() {
  if (!durum.calisiyor) return;
  while (!carpisma(durum.parca.sekil, durum.parca.x, durum.parca.y + 1)) {
    durum.parca.y++;
  }
  parcaYerlestir();
  tahtaCiz();
}

// ---------- Oyun döngüsü ----------

let sonZaman = 0;

function dongu(zaman) {
  if (!durum.calisiyor) return;
  durum.dusmeZamani += zaman - sonZaman;
  sonZaman = zaman;

  const aralik = Math.max(AYAR.dusmeEnAz, AYAR.dusmeBaslangic - (durum.seviye - 1) * AYAR.dusmeAzalma);
  if (durum.dusmeZamani >= aralik) {
    durum.dusmeZamani = 0;
    asagiIn();
  }
  if (durum.calisiyor) requestAnimationFrame(dongu);
}

function oyunBitti() {
  durum.calisiyor = false;
  perdeGoster('Oyun Bitti', 'Skor: ' + durum.skor + ' · Seviye: ' + durum.seviye, 'Tekrar Oyna');
}

function oyunuBaslat() {
  durum.tahta = bosTahta();
  durum.skor = 0;
  durum.satirSayisi = 0;
  durum.seviye = 1;
  durum.xp = 0;
  durum.hp = AYAR.kahramanHp;
  durum.dusmanIndeks = 0;
  durum.kombo = 0;
  durum.calisiyor = true;
  durum.dusmeZamani = 0;
  sonZaman = performance.now();

  durum.siradaki = rastgeleParca();
  yeniParca();
  dusmanCagir();
  arayuzGuncelle();
  tahtaCiz();
  perdeGizle();
  requestAnimationFrame(dongu);
}

// ---------- Girdi ----------

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') hareket(-1);
  else if (e.key === 'ArrowRight') hareket(1);
  else if (e.key === 'ArrowDown') asagiIn();
  else if (e.key === 'ArrowUp') dondurParca();
  else if (e.key === ' ') { e.preventDefault(); hizliDus(); }
});

document.querySelectorAll('[data-tus]').forEach((dugme) => {
  dugme.addEventListener('click', () => {
    const t = dugme.dataset.tus;
    if (t === 'sol') hareket(-1);
    else if (t === 'sag') hareket(1);
    else if (t === 'asagi') asagiIn();
    else if (t === 'dondur') dondurParca();
    else if (t === 'dusur') hizliDus();
  });
});

el.perdeDugme.addEventListener('click', oyunuBaslat);

// ---------- Başlangıç ----------

(async function basla() {
  await tumVarliklariYukle();
  karakterleriCiz();
  perdeGoster('Kutu Kahramanı', 'Satır temizle, düşmana hasar ver. Her yerleşen parça düşmanın hamlesidir!', 'Başla');
})();

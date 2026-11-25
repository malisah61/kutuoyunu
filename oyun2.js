// RPG Tetris — oyun mantığı (2/2): RPG katmanı, tetris akışı, girdi.
// Bu dosya oyun.js'in devamıdır; index.html ikisini sırayla yükler.

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
  if (durum.seviye >= 4) hasar *= AYAR.kalkanCarpani;   // Kalkan yeteneği
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
    else if (t === 'birak') hizliDus();
  });
});

el.perdeDugme.addEventListener('click', oyunuBaslat);

// ---------- Başlangıç ----------

(async function basla() {
  await tumVarliklariYukle();
  karakterleriCiz();
  perdeGoster('RPG Tetris', 'Satır temizle, düşmana hasar ver. Her yerleşen parça düşmanın hamlesidir!', 'Başla');
})();

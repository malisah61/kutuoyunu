// Sprite Atölye varlık yükleyici.
// assets/siparis.json'daki her siparişin görseli assets/<ad>.png olarak beklenir.
// Görsel yoksa (henüz üretilmediyse) kodla çizilen yedek sprite kullanılır; oyun her durumda çalışır.

const VARLIK_YOLU = 'assets/';

// Sipariş listesi: assets/siparis.json ile aynı adları taşımalı.
const VARLIK_ADLARI = {
  kahraman: 'kahraman',
  dusmanlar: ['slime', 'yarasa', 'iskelet', 'golem', 'ejderha']
};

const varliklar = {};   // ad -> HTMLImageElement (yüklendiyse)

function gorselYukle(ad) {
  return new Promise((cozum) => {
    const img = new Image();
    img.onload = () => { varliklar[ad] = img; cozum(img); };
    img.onerror = () => { cozum(null); };   // yoksa sessizce yedeğe düş
    img.src = VARLIK_YOLU + ad + '.png';
  });
}

async function tumVarliklariYukle() {
  const adlar = [VARLIK_ADLARI.kahraman, ...VARLIK_ADLARI.dusmanlar];
  await Promise.all(adlar.map(gorselYukle));
}

// --- Yedek (placeholder) çizimler: sprite üretilmeden de oyun görünür olsun ---

function yedekKahraman(ctx, boyut) {
  const b = boyut / 8;
  ctx.fillStyle = '#4a6ae0';
  ctx.fillRect(b * 2, b * 3, b * 4, b * 4);          // gövde
  ctx.fillStyle = '#f0c8a0';
  ctx.fillRect(b * 2.5, b * 1, b * 3, b * 2.5);      // kafa
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(b * 2, b * 0.5, b * 4, b * 0.8);      // miğfer
  ctx.fillStyle = '#12121c';
  ctx.fillRect(b * 3, b * 2, b * 0.6, b * 0.6);      // gözler
  ctx.fillRect(b * 4.4, b * 2, b * 0.6, b * 0.6);
  ctx.fillStyle = '#c0c0d0';
  ctx.fillRect(b * 6, b * 3, b * 0.7, b * 4);        // kılıç
}

function yedekDusman(ctx, boyut, renk) {
  const b = boyut / 8;
  ctx.fillStyle = renk;
  ctx.beginPath();
  ctx.arc(b * 4, b * 4.5, b * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#12121c';
  ctx.fillRect(b * 2.6, b * 3.6, b * 0.9, b * 0.9);
  ctx.fillRect(b * 4.5, b * 3.6, b * 0.9, b * 0.9);
  ctx.fillStyle = '#fff';
  ctx.fillRect(b * 3, b * 5.6, b * 2, b * 0.5);      // ağız
}

const DUSMAN_RENKLERI = ['#4ae07a', '#8a6ae0', '#d0d0d0', '#8a8a9a', '#e04a5a'];

// Bir canvas'a varlığı (varsa görsel, yoksa yedek) çizer.
function varlikCiz(ctx, ad, boyut, yedekTuru, indeks = 0) {
  ctx.clearRect(0, 0, boyut, boyut);
  const img = varliklar[ad];
  if (img) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, boyut, boyut);
    return;
  }
  if (yedekTuru === 'kahraman') yedekKahraman(ctx, boyut);
  else yedekDusman(ctx, boyut, DUSMAN_RENKLERI[indeks % DUSMAN_RENKLERI.length]);
}

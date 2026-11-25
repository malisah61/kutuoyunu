# Kutu Kahramanı — RPG Tetris

Tarayıcıda çalışan 2D Tetris + RPG karışımı. Blok satırı temizledikçe düşmana hasar verirsin; düşman ölünce XP kazanır, seviye atlarsın. Görseller **Sprite Atölye** ile üretilir.

**Oyna:** https://malisah61.github.io/kutuoyunu/

## Nasıl oynanır
- **Klavye:** ← → hareket, ↑ döndür, ↓ yumuşak düşüş, Boşluk sert düşüş, P duraklat.
- **Dokunmatik:** ekran altındaki düğmeler (mobil için tasarlandı).
- Satır temizlemek düşmana hasar verir; kombo yaptıkça hasar artar.
- Düşman ölünce sıradaki (daha güçlü) düşman gelir, seviye ve düşme hızı artar.
- Tahta tavana ulaşırsa oyun biter.

## Dosyalar
| Dosya | İş |
|---|---|
| `index.html` | Sayfa yapısı, canvas'lar |
| `stil.css` | Arayüz (mobil dokunmatik uyumlu) |
| `ayarlar.js` | Denge sabitleri (hız, HP, hasar) ve tetromino şekilleri |
| `varliklar.js` | Sprite Atölye görsellerini yükler; yoksa kodla çizilen yedek sprite |
| `oyun.js` | Oyun döngüsü, grid/tetromino, RPG katmanı |
| `assets/siparis.json` | Sprite Atölye sipariş listesi |

Dengeyi değiştirmek için `ayarlar.js` yeterli.

## Sprite'ları üretmek (Sprite Atölye)
Görseller `assets/<ad>.png` olarak beklenir. Henüz üretilmemişse oyun kodla çizilen yedek sprite'larla çalışır.

Üretmek için `sprite-atolye` reposundaki **Sipariş** workflow'unu bu repoyu hedefleyerek çalıştır:

- Workflow: `siparis.yml` (repo: `malisah61/sprite-atolye`)
- Girdi `hedef`: `malisah61/kutuoyunu`
- Girdi `dal`: `main` (veya bu PR dalı)

Workflow `assets/siparis.json`'u okur, her sipariş için görsel üretir ve `deneme-sonuclari` dalına yazar. Beğendiğin görselleri `assets/<ad>.png` olarak bu repoya kopyala — oyun otomatik olarak gerçek sprite'ları kullanır.

Sipariş adları `varliklar.js` içindeki `VARLIK_ADLARI` ile birebir aynı olmalı: `kahraman`, `slime`, `yarasa`, `iskelet`, `golem`, `ejderha`.

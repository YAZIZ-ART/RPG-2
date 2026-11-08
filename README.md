# AETHERIA — High-Bit / Neo-Retro RPG

## Menjalankan
1. Ekstrak ZIP.
2. Upload seluruh isi folder ke root repository GitHub Pages (struktur `index.html`, `game.html`, `karakter.html`, `css/`, `js/` harus tetap).
3. Buka URL GitHub Pages. Jangan hanya upload file HTML satu per satu.
4. Tekan PLAY. Di perangkat HP, putar ke landscape; browser yang mendukung akan meminta fullscreen + landscape setelah sentuhan pertama.

## Kontrol
- WASD / tombol panah atau joystick sentuh: bergerak.
- Spasi / tombol SERANG: serangan senjata.
- Tombol skill 1–5 / tombol skill pada layar: skill elemen.
- PETA: buka peta besar.
- Tombol SIANG: ubah waktu lingkungan.
- Kamera memakai jarak pandang tetap; zoom manual telah dinonaktifkan.

## Audio
`js/audio.js` membangkitkan musik lobby, musik pemilihan hero, musik gameplay, dan SFX senjata/elemen/serangan musuh secara prosedural melalui Web Audio API. Audio mulai setelah interaksi pertama karena kebijakan autoplay browser. Tidak membutuhkan file musik eksternal.

## Catatan
Game adalah prototipe HTML Canvas 2D. Kualitas rendering dibatasi oleh performa perangkat dan browser. Tidak ada klaim bahwa ZIP ini berukuran 200 MB; aset audio dihasilkan saat runtime dari kode.

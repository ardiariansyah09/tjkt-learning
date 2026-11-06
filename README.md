# TJKT Learning Hub

Materi, simulasi, latihan, dan evaluasi interaktif Teknik Jaringan Komputer dan
Telekomunikasi, beserta sumber LMS Laravel untuk SMK Wikrama Bogor.

## Portal statis

Jalankan root proyek melalui web server lokal, lalu buka `index.html`.
Portal memakai HTML, CSS, JavaScript, dan aset lokal; dapat dipublikasikan ke
GitHub Pages. Folder `modules/`, `data/`, dan `assets/` harus tetap tersedia
dengan struktur relatif yang sama.

## LMS

Folder `lms/` berisi sumber aplikasi Laravel. LMS membutuhkan PHP >= 8.3,
Composer, serta database dan konfigurasi lingkungan tersendiri. GitHub Pages
tidak menjalankan aplikasi PHP ini. Lihat [panduan LMS](lms/README.md).

Salin `.env.example` menjadi `.env` hanya pada lingkungan instalasi, isi
konfigurasi sendiri, lalu instal dependensi sesuai `composer.lock`. Jangan
menjalankan skrip review, reset, seed, atau aktivasi historis pada produksi
tanpa membaca batasan targetnya. Repositori ini tidak menyertakan database,
akun siswa, kredensial produksi, atau dependensi vendor.

Rilis materi di `lms/storage/app/learning-pack/` merupakan aset pembelajaran
berversi, bukan data hasil belajar. Jangan menimpa versi lama pada instalasi
aktif; gunakan mekanisme pembaruan kompatibel yang didokumentasikan.

## Tema dan validasi

Tampilan mengikuti warna sertifikat TJKT: navy, sian, putih, dan aksen merah.
Logo tersedia lokal. Lihat [catatan tema dan penerapan LMS](docs/tema-sertifikat.md).

Pemeriksaan kompatibilitas paket dapat dijalankan dari root:

```sh
node tools/check-compatible-lms-release.mjs
```

Skrip validasi browser di `tools/` memiliki kebutuhan browser, URL, dan jumlah
modul yang berbeda sesuai tahap pengembangannya; periksa parameternya sebelum
menjalankan. Konfigurasi dan cache runtime tidak disertakan dalam Git.

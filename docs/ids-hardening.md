# Host Hardening — Fase F kelas XII

## Posisi dan sumber

Peran ATP: `inti`; kategori Keamanan Jaringan. Prasyarat: keamanan-jaringan, manajemen-pengguna-server. Urutan, role dan total JP ATP dipertahankan.

Halaman: `modules/keamanan-jaringan/ids-hardening/`. Wrapper konten: `assets/js/course-ids-hardening.js`. Metadata: `data/ids-hardening.json`.

Materi ditulis dalam tiga berkas curriculum terpisah (`remaining-curriculum.js`, `remaining-security-curriculum.js`, `remaining-assurance-curriculum.js`) dan dirender melalui `remaining-courses.js`. Kerangka 12 tahap sama, isi enam konsep, proyek, eksperimen dan mekanik game berbeda per topik.

## Dua belas tahap

Orientasi; enam konsep di bawah; studi kasus/proyek; laboratorium; game tiga level; refleksi; evaluasi akhir. 
- Baseline dan Permukaan Serangan: Mengidentifikasi kebutuhan host sebelum mematikan layanan.
- Akun, Least Privilege dan Remote Access: Mengamankan identitas serta jalur pengelolaan.
- Layanan, Firewall dan Konfigurasi Aman: Mengurangi paparan dengan kontrol berlapis.
- Patch, Staging dan Persistensi: Memperbaiki kelemahan tanpa mengabaikan fungsi layanan.
- Audit, Secret dan Recovery: Melindungi bukti serta kemampuan pulih.
- Uji Penerimaan dan Risiko Tersisa: Menghubungkan kontrol pada bukti yang relevan.

Setiap konsep mempunyai dua pembahasan, worked example, tugas transfer, miskonsepsi dan pertanyaan dengan umpan balik. Proyek memakai rubrik guru/teman 0–3 per empat dimensi, bukan dinilai dari panjang tulisan. Ada contoh config/perintah/format bukti yang dilabeli sesuai platform dan batas pada `remaining-practice-examples.js`.

## Laboratorium dan konteks

Baseline, draft/applied, role service/SSH/web/legacy/root, patch/scope, console, boot/autostart serta restore baseline. Model menolak penerapan yang menghilangkan SSH tanpa console; backup hanya konfigurasi bukan OS/data. ID historis tetap, judul/materi khusus Host Hardening.

Konteks keseharian spesifik ada pada orientasi. Instruksi menyebut tindakan awal, kendali, hasil, reset dan batas; bukti lama dibatalkan ketika input berubah. Tiga percobaan dapat dicatat pada jurnal bersama. Reset hanya sesi simulator, tidak menghapus progres/jurnal. Model state di `final-lab-models.js`, UI khusus cabang topik di `final-lab-activities.js`. Bentuk visual berbeda: rantai, queue, ordered rules, crypto bench, draft/applied, zona, bukti versi, timeline serta papan dependensi.

## Game

Change Window: kartu tindakan dengan prasyarat console/baseline, akses minimum, staging/patch/boot, uji positif/negatif dan latihan restore/retest sesuai level. Tidak menjalankan patch atau command OS.

Game hanya pada tahap game, tanpa radio/select soal pilihan ganda. Semua operasi memodifikasi state objek/resource; ada batas tindakan, gagal, ulang level/permainan, klik/Tab/Enter dan skor100 hanya setelah tiga level. Model `final-game-models.js`, renderer `final-games.js`, petunjuk khas per mekanik.

## Pengamanan terintegrasi

Profil tambahan di `additional-security-profiles.js` menilai fungsi sah tetap tersedia dan akses tak sah ditolak. Matriks/jejak dan bukti baseline-perbaikan memakai penyimpanan evidence terpisah. Tujuan, kasus, refleksi dan penerimaan juga diintegrasikan; tidak mengubah grade lama atau menambahkan backend.

## Validasi dan batas

`tools/final-module-checks.js` memeriksa model positif/negatif, 27 solusi game, budget serta kontrol UI. WebCrypto memeriksa SHA-256 abc terhadap known vector dan verify signature pesan asli versus berubah. Harness bersama memeriksa konteks, security matrix, journal, metadata/content dan letak aktivitas. Evaluasi akhir sepuluh soal ambang80, sertifikat bersama.

Pemeriksaan awal focused sembilan modul baru: masing-masing12 tahap, desktop/ponsel/tema, tanpa error dan style parity benar. Audit seluruh katalog dan penyelesaian dari progres kosong dicatat pada laporan akhir `docs/penyelesaian-sembilan-modul.md`; jangan menganggap laporan focused sebagai audit penuh.

Tidak ada server/OS/VM, scanning/exploit, firewall, backup, email atau jaringan nyata dijalankan. Pengecualian perhitungan WebCrypto lokal dinyatakan pada modul kriptografi. Praktik implementasi serta kualitas proyek dinilai guru pada lingkungan berizin. Perubahan belum dipush/dipublikasikan.

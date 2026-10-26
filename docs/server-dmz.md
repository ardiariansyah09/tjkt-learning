# Membangun dan Menguji Server DMZ — Fase F kelas XII

## Posisi dan sumber

Peran ATP: `inti`; kategori Keamanan Jaringan. Prasyarat: ids-hardening, nat-wan, hosting-server. Urutan, role dan total JP ATP dipertahankan.

Halaman: `modules/keamanan-jaringan/server-dmz/`. Wrapper konten: `assets/js/course-server-dmz.js`. Metadata: `data/server-dmz.json`.

Materi ditulis dalam tiga berkas curriculum terpisah (`remaining-curriculum.js`, `remaining-security-curriculum.js`, `remaining-assurance-curriculum.js`) dan dirender melalui `remaining-courses.js`. Kerangka 12 tahap sama, isi enam konsep, proyek, eksperimen dan mekanik game berbeda per topik.

## Dua belas tahap

Orientasi; enam konsep di bawah; studi kasus/proyek; laboratorium; game tiga level; refleksi; evaluasi akhir. 
- Zona, Trust Boundary dan Tujuan DMZ: Membatasi dampak layanan yang harus dijangkau publik.
- Matriks Aliran dan Default Deny: Mendefinisikan izin minimum sebelum implementasi.
- Routing, DNAT dan Stateful Return: Menelusuri alamat serta izin dua arah.
- Manajemen dan Pembatasan Host: Memisahkan kanal admin dari layanan publik.
- Implementasi dan Uji Isolasi: Menguji keberhasilan fungsi serta penolakan jalur.
- Monitoring, Backup dan Risiko Tersisa: Mengoperasikan DMZ sebagai layanan yang dipelihara.

Setiap konsep mempunyai dua pembahasan, worked example, tugas transfer, miskonsepsi dan pertanyaan dengan umpan balik. Proyek memakai rubrik guru/teman 0–3 per empat dimensi, bukan dinilai dari panjang tulisan. Ada contoh config/perintah/format bukti yang dilabeli sesuai platform dan batas pada `remaining-practice-examples.js`.

## Laboratorium dan konteks

Denah Web/DB/Client/Jump pada DMZ/LAN/Management, drag atau select sebagai alternatif keyboard, DNAT preset, policy spesifik, publikasi DB, batas lateral dan stateful return. Placement tidak otomatis memberi izin publik; request/reply dinilai terpisah.

Konteks keseharian spesifik ada pada orientasi. Instruksi menyebut tindakan awal, kendali, hasil, reset dan batas; bukti lama dibatalkan ketika input berubah. Tiga percobaan dapat dicatat pada jurnal bersama. Reset hanya sesi simulator, tidak menghapus progres/jurnal. Model state di `final-lab-models.js`, UI khusus cabang topik di `final-lab-activities.js`. Bentuk visual berbeda: rantai, queue, ordered rules, crypto bench, draft/applied, zona, bukti versi, timeline serta papan dependensi.

## Game

DMZ Architect: kartu Web, DB, Jump serta Worker sesuai misi, dua slot per zona, edge Web-DB spesifik dan allow-any warisan yang perlu dicabut. Tidak membuat jaringan/firewall nyata.

Game hanya pada tahap game, tanpa radio/select soal pilihan ganda. Semua operasi memodifikasi state objek/resource; ada batas tindakan, gagal, ulang level/permainan, klik/Tab/Enter dan skor100 hanya setelah tiga level. Model `final-game-models.js`, renderer `final-games.js`, petunjuk khas per mekanik.

## Pengamanan terintegrasi

Profil tambahan di `additional-security-profiles.js` menilai fungsi sah tetap tersedia dan akses tak sah ditolak. Matriks/jejak dan bukti baseline-perbaikan memakai penyimpanan evidence terpisah. Tujuan, kasus, refleksi dan penerimaan juga diintegrasikan; tidak mengubah grade lama atau menambahkan backend.

## Validasi dan batas

`tools/final-module-checks.js` memeriksa model positif/negatif, 27 solusi game, budget serta kontrol UI. WebCrypto memeriksa SHA-256 abc terhadap known vector dan verify signature pesan asli versus berubah. Harness bersama memeriksa konteks, security matrix, journal, metadata/content dan letak aktivitas. Evaluasi akhir sepuluh soal ambang80, sertifikat bersama.

Pemeriksaan awal focused sembilan modul baru: masing-masing12 tahap, desktop/ponsel/tema, tanpa error dan style parity benar. Audit seluruh katalog dan penyelesaian dari progres kosong dicatat pada laporan akhir `docs/penyelesaian-sembilan-modul.md`; jangan menganggap laporan focused sebagai audit penuh.

Tidak ada server/OS/VM, scanning/exploit, firewall, backup, email atau jaringan nyata dijalankan. Pengecualian perhitungan WebCrypto lokal dinyatakan pada modul kriptografi. Praktik implementasi serta kualitas proyek dinilai guru pada lingkungan berizin. Perubahan belum dipush/dipublikasikan.

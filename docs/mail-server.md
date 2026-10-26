# Mail Server — Fase F kelas XI

## Posisi dan sumber

Peran ATP: `pengayaan`; kategori Administrasi Sistem Jaringan. Prasyarat: hosting-server. Urutan, role dan total JP ATP dipertahankan.

Halaman: `modules/administrasi-server/mail-server/`. Wrapper konten: `assets/js/course-mail-server.js`. Metadata: `data/mail-server.json`.

Materi ditulis dalam tiga berkas curriculum terpisah (`remaining-curriculum.js`, `remaining-security-curriculum.js`, `remaining-assurance-curriculum.js`) dan dirender melalui `remaining-courses.js`. Kerangka 12 tahap sama, isi enam konsep, proyek, eksperimen dan mekanik game berbeda per topik.

## Dua belas tahap

Orientasi; enam konsep di bawah; studi kasus/proyek; laboratorium; game tiga level; refleksi; evaluasi akhir. 
- MUA, MSA, MTA, Delivery dan Mailbox: Membedakan peran komponen pada perjalanan pesan.
- Domain, MX dan Identitas Tujuan: Menentukan ke mana pesan diarahkan.
- Autentikasi, TLS dan Relay Restriction: Mempertahankan fungsi sah tanpa menjadi open relay.
- Antrean, Deferred, Bounce dan IMAP: Mendiagnosis tahap delivery tanpa menghapus bukti.
- SPF, DKIM dan DMARC: Memisahkan autentikasi domain dari kerahasiaan isi.
- Implementasi Lab dan Penerimaan: Menguji fungsi serta batas layanan dari klien.

Setiap konsep mempunyai dua pembahasan, worked example, tugas transfer, miskonsepsi dan pertanyaan dengan umpan balik. Proyek memakai rubrik guru/teman 0–3 per empat dimensi, bukan dinilai dari panjang tulisan. Ada contoh config/perintah/format bukti yang dilabeli sesuai platform dan batas pada `remaining-practice-examples.js`.

## Laboratorium dan konteks

Antrean SMTP queued/deferred/delivered, autentikasi/relay restriction, TLS, recipient, MX/remote availability dan pengambilan IMAP lokal. DKIM pass+alignment menjadi satu jalur DMARC dataset, SPF aligned dijelaskan sebagai jalur lain yang tidak disimulasikan.

Konteks keseharian spesifik ada pada orientasi. Instruksi menyebut tindakan awal, kendali, hasil, reset dan batas; bukti lama dibatalkan ketika input berubah. Tiga percobaan dapat dicatat pada jurnal bersama. Reset hanya sesi simulator, tidak menghapus progres/jurnal. Model state di `final-lab-models.js`, UI khusus cabang topik di `final-lab-activities.js`. Bentuk visual berbeda: rantai, queue, ordered rules, crypto bench, draft/applied, zona, bukti versi, timeline serta papan dependensi.

## Game

Mail Sorter: tiga amplop ke lajur Local/External/Reject atau Hold, kapasitas dua slot, batch dan jalur tujuan luar gagal/pulih. Tidak ada pesan email nyata dikirim.

Game hanya pada tahap game, tanpa radio/select soal pilihan ganda. Semua operasi memodifikasi state objek/resource; ada batas tindakan, gagal, ulang level/permainan, klik/Tab/Enter dan skor100 hanya setelah tiga level. Model `final-game-models.js`, renderer `final-games.js`, petunjuk khas per mekanik.

## Pengamanan terintegrasi

Profil tambahan di `additional-security-profiles.js` menilai fungsi sah tetap tersedia dan akses tak sah ditolak. Matriks/jejak dan bukti baseline-perbaikan memakai penyimpanan evidence terpisah. Tujuan, kasus, refleksi dan penerimaan juga diintegrasikan; tidak mengubah grade lama atau menambahkan backend.

## Validasi dan batas

`tools/final-module-checks.js` memeriksa model positif/negatif, 27 solusi game, budget serta kontrol UI. WebCrypto memeriksa SHA-256 abc terhadap known vector dan verify signature pesan asli versus berubah. Harness bersama memeriksa konteks, security matrix, journal, metadata/content dan letak aktivitas. Evaluasi akhir sepuluh soal ambang80, sertifikat bersama.

Pemeriksaan awal focused sembilan modul baru: masing-masing12 tahap, desktop/ponsel/tema, tanpa error dan style parity benar. Audit seluruh katalog dan penyelesaian dari progres kosong dicatat pada laporan akhir `docs/penyelesaian-sembilan-modul.md`; jangan menganggap laporan focused sebagai audit penuh.

Tidak ada server/OS/VM, scanning/exploit, firewall, backup, email atau jaringan nyata dijalankan. Pengecualian perhitungan WebCrypto lokal dinyatakan pada modul kriptografi. Praktik implementasi serta kualitas proyek dinilai guru pada lingkungan berizin. Perubahan belum dipush/dipublikasikan.

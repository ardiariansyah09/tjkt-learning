# Autentikasi dan Kriptografi — Fase F kelas XII

## Posisi dan sumber

Peran ATP: `pendukung`; kategori Keamanan Jaringan. Prasyarat: keamanan-jaringan, manajemen-pengguna-server. Urutan, role dan total JP ATP dipertahankan.

Halaman: `modules/keamanan-jaringan/autentikasi-kriptografi/`. Wrapper konten: `assets/js/course-autentikasi-kriptografi.js`. Metadata: `data/autentikasi-kriptografi.json`.

Materi ditulis dalam tiga berkas curriculum terpisah (`remaining-curriculum.js`, `remaining-security-curriculum.js`, `remaining-assurance-curriculum.js`) dan dirender melalui `remaining-courses.js`. Kerangka 12 tahap sama, isi enam konsep, proyek, eksperimen dan mekanik game berbeda per topik.

## Dua belas tahap

Orientasi; enam konsep di bawah; studi kasus/proyek; laboratorium; game tiga level; refleksi; evaluasi akhir. 
- Identitas, AAA dan Sesi: Memisahkan autentikasi, otorisasi dan pencatatan.
- Faktor, MFA dan Recovery: Menilai independensi bukti dan risiko phishing.
- Hash, Password Hashing dan Integritas: Menghindari penyamaan digest dengan enkripsi.
- Enkripsi, Signature dan Key: Membedakan kerahasiaan dari autentisitas/integritas.
- Sertifikat, Nama, Trust dan TLS: Memeriksa identitas tujuan sebelum akses sensitif.
- Pengelolaan Secret dan Penerimaan: Menguji normal, gagal dan pencabutan tanpa membocorkan data.

Setiap konsep mempunyai dua pembahasan, worked example, tugas transfer, miskonsepsi dan pertanyaan dengan umpan balik. Proyek memakai rubrik guru/teman 0–3 per empat dimensi, bukan dinilai dari panjang tulisan. Ada contoh config/perintah/format bukti yang dilabeli sesuai platform dan batas pada `remaining-practice-examples.js`.

## Laboratorium dan konteks

Faktor independen vs password+PIN, identitas server, akun revoked serta role/operasi. Meja WebCrypto benar-benar menghitung SHA-256 dan ECDSA P-256/SHA-256 lokal; key non-extractable ephemeral di memori, tidak diekspor/disimpan. Tidak ada login/MFA/TLS nyata.

Konteks keseharian spesifik ada pada orientasi. Instruksi menyebut tindakan awal, kendali, hasil, reset dan batas; bukti lama dibatalkan ketika input berubah. Tiga percobaan dapat dicatat pada jurnal bersama. Reset hanya sesi simulator, tidak menghapus progres/jurnal. Model state di `final-lab-models.js`, UI khusus cabang topik di `final-lab-activities.js`. Bentuk visual berbeda: rantai, queue, ordered rules, crypto bench, draft/applied, zona, bukti versi, timeline serta papan dependensi.

## Game

Key Custody: private key di Vault, public key ke penerima, pesan pada meja kerja untuk sign lalu ke penerima. Misi kedua mewajibkan perubahan dan tanda tangan ulang; misi ketiga mencabut/mengganti key bocor. Signature bukan enkripsi isi.

Game hanya pada tahap game, tanpa radio/select soal pilihan ganda. Semua operasi memodifikasi state objek/resource; ada batas tindakan, gagal, ulang level/permainan, klik/Tab/Enter dan skor100 hanya setelah tiga level. Model `final-game-models.js`, renderer `final-games.js`, petunjuk khas per mekanik.

## Pengamanan terintegrasi

Profil tambahan di `additional-security-profiles.js` menilai fungsi sah tetap tersedia dan akses tak sah ditolak. Matriks/jejak dan bukti baseline-perbaikan memakai penyimpanan evidence terpisah. Tujuan, kasus, refleksi dan penerimaan juga diintegrasikan; tidak mengubah grade lama atau menambahkan backend.

## Validasi dan batas

`tools/final-module-checks.js` memeriksa model positif/negatif, 27 solusi game, budget serta kontrol UI. WebCrypto memeriksa SHA-256 abc terhadap known vector dan verify signature pesan asli versus berubah. Harness bersama memeriksa konteks, security matrix, journal, metadata/content dan letak aktivitas. Evaluasi akhir sepuluh soal ambang80, sertifikat bersama.

Pemeriksaan awal focused sembilan modul baru: masing-masing12 tahap, desktop/ponsel/tema, tanpa error dan style parity benar. Audit seluruh katalog dan penyelesaian dari progres kosong dicatat pada laporan akhir `docs/penyelesaian-sembilan-modul.md`; jangan menganggap laporan focused sebagai audit penuh.

Tidak ada server/OS/VM, scanning/exploit, firewall, backup, email atau jaringan nyata dijalankan. Pengecualian perhitungan WebCrypto lokal dinyatakan pada modul kriptografi. Praktik implementasi serta kualitas proyek dinilai guru pada lingkungan berizin. Perubahan belum dipush/dipublikasikan.

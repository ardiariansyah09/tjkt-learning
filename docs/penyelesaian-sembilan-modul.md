# Penyelesaian sembilan modul terakhir

Seluruh 53 entri katalog sekarang mempunyai halaman, konten dan aktivitas yang tersedia di workspace. Pembagian tetap 16 Fase E kelas X, 30 Fase F kelas XI dan 7 Fase F kelas XII. Tidak ada perubahan role inti/pendukung/pengayaan, urutan/prasyarat atau total JP ATP. Sembilan modul ini menambah108 tahap ke baseline498 sehingga cakupan konten menjadi606 tahap. Ketersediaan lokal tidak berarti perubahan sudah dipush atau dipublikasikan ke GitHub Pages.

## Modul dan karakter aktivitas

| Modul | Kelas / peran | Eksperimen dan permainan |
| --- | --- | --- |
| Backup dan Pemulihan Server | XI / pendukung | Rantai full/turunan, key/lokasi/manifest, restore terisolasi; Archive Rescue |
| Mail Server | XI / pengayaan | SMTP antrean/deferred/delivery, relay/TLS, IMAP dan jalur DKIM alignment; Mail Sorter |
| Ancaman dan Sistem Keamanan Jaringan | XII / inti | Editor first-match/default, shadowing dan matriks aliran; Policy Weaver |
| Autentikasi dan Kriptografi | XII / pendukung | Faktor/role/trust dan SHA-256/ECDSA lokal; Key Custody |
| Host Hardening | XII / inti | Baseline/draft/applied, patch/scope, boot dan recovery; Change Window |
| Membangun dan Menguji Server DMZ | XII / inti | Denah zona, DNAT/policy/return dan uji lateral; DMZ Architect |
| Pengujian Keamanan Jaringan, Host, dan Server | XII / inti | Izin/scope, bukti versi, fix/retest/closure; Evidence Trail |
| IDS/IPS dan Respons Insiden | XII / pengayaan | Event/window/alert/blok, bukti/containment/recovery; Incident Desk |
| Proyek Integrasi Jaringan | XII / pengayaan | Papan dependensi lintas elemen dan handover versi terbaru; Campus Launch |

Setiap modul mempunyai12 tahap: orientasi, enam konsep, proyek, lab, game, refleksi dan evaluasi. Enam konsep ditulis spesifik dengan dua pembahasan, worked example, tugas transfer, miskonsepsi, pertanyaan serta umpan balik. Contoh keseharian tidak mengubah aturan teknis; batas analogi dipertanyakan. Proyek membutuhkan rancangan, tiga eksperimen, penjelasan batas, tinjauan/revisi dan runbook; rubrik kualitas kerja tetap dinilai guru/teman.

Game memiliki tiga level, resource/tindakan/state, kondisi gagal serta reset. Mekanik berbeda menurut topik; tidak ada soal pilihan ganda atau keharusan ruang3D. Evaluasi konsep terpisah sepuluh soal ambang80. Semua kontrol utama dapat dipakai klik/Tab/Enter; denah DMZ mendukung drag dengan select sebagai alternatif keyboard.

## Arsitektur dan sumber

- Konten: `remaining-curriculum.js`, `remaining-security-curriculum.js`, `remaining-assurance-curriculum.js`; rendering struktur bersama `remaining-courses.js` dengan wrapper per module ID untuk metadata/harness lama.
- Contoh konfigurasi/perintah/format bukti: `remaining-practice-examples.js`, dilabeli sebagai fragmen atau inspeksi VM berizin, bukan perintah yang dieksekusi situs.
- State model lab: `final-lab-models.js`; UI `final-lab-activities.js` dengan cabang visual berbeda per tipe, bukan kalkulator identik yang hanya diganti judul.
- Game: `final-game-models.js` dan `final-games.js`; parent/chain, antrean, ordered rules, kompartemen key, dependency tasks, zone slots, bukti versi, incident lifecycle dan packing graph masing-masing mempunyai state/rules sendiri.
- CSS tambahan `final-modules.css` sebelum stylesheet standar terakhir. Cache shell/foundation diperbarui tanpa mengganti kunci progres lama.
- Sumber primer CISA, NIST, Postfix/Dovecot, W3C/WebCrypto, Ubuntu/Debian dan Suricata disediakan per modul. Dokumen umum/historis tidak dipakai sebagai jaminan sintaks versi sekarang; contoh harus dicocokkan produk/versi pada VM.

Pengamanan dipadukan dalam tujuan, proyek, refleksi, penerimaan serta sembilan profil matriks khusus tambahan. Total53 konteks dan20 profil pengamanan tersedia. Matriks mempertahankan akses sah serta menolak akses tak diperlukan; block-all bukan sukses. Bukti kontrol memakai localStorage evidence terpisah, tidak menulis grade lama. Tidak ada login/dashboard guru atau database backend baru.

## Batas yang dinyatakan

Tidak ada backup fisik, email Internet, scanner/exploit, firewall, VM, host atau koneksi target nyata. Rantai versi/manifest bukan checksum atau throughput alat backup; RPO dataset bukan RTO terukur. Mail queued/delivered bukan dibaca; jalur DMARC lab hanya DKIM pass yang aligned, bukan seluruh SPF/DKIM/forwarding. First-match empat field bukan firewall stateful/IPv6/NAT lengkap. Zona DMZ tidak otomatis mempublikasikan DB; publikasi/policy terpisah.

SHA-256 dan ECDSA P-256/SHA-256 dihitung lokal oleh WebCrypto. Private key sesi dibuat non-extractable, tidak diekspor/disimpan; public key dipakai verifikasi pada sesi tersebut. Hash/signature tidak mengenkripsi pesan atau membuktikan identitas pemilik public key tanpa trust. Bila API tidak tersedia, pesan kegagalan tampil dan tidak ada hasil kriptografi palsu.

Hardening hanya model config/boot, bukan benchmark kepatuhan. Pengujian keamanan hanya dataset dengan scope/izin simbolik; tidak memindai target. IDS/IPS threshold model berbeda dari pemisahan threshold-alert dan drop rule pada engine nyata. Proyek integrasi memakai papan kriteria; checklist “backup” memerlukan bukti restore dari modul terkait/VM, bukan menyalin data dengan checkbox.

Praktik nyata dan mutu diagnosis, keputusan, konfigurasi, laporan serta recovery dinilai guru pada lab berizin. Skor game/quiz serta sertifikat belajar tidak menggantikan penilaian keterampilan tersebut.

## Pemeriksaan

`tools/final-module-checks.js` memeriksa model positif/negatif, guard scope/key/privilege/kapasitas, stale proof, rollback/closure, solusi27 level dan kegagalan budget. UI memeriksa operasi nyata tiap simulator dan game, catatan percobaan, metadata parity serta WebCrypto known vector SHA-256("abc") dan signature pesan asli/berubah.

Pratinjau yang diperiksa visual: `pratinjau-dmz.png`, `pratinjau-kriptografi.png`, `pratinjau-campus-launch.png`. Screenshot menggunakan progres buatan hanya pada profil QA terpisah; pengujian completion memulai progres kosong dan terpisah. Beranda juga diperiksa agar53 kartu mempunyai tautan utama, semua berstatus tersedia serta tidak overflow desktop/ponsel.

Pemeriksaan awal focused sembilan modul:108 tahap, tanpa error, style parity benar. Audit lengkap53 modul serta completion sembilan modul dicatat pada bagian hasil akhir setelah seluruh proses selesai. Laporan JSON merekam cakupan aktual, bukan klaim bahwa screenshot merupakan bukti kelulusan.

## Hasil akhir 26 Oktober 2026

- Validasi ATP dan aset: 53 modul tersedia, tidak ada modul berstatus segera hadir.
- Audit browser seluruh katalog: 53 modul, 606 tahap; desktop 1280x900 dan ponsel 390x844, tema terang/gelap, tanpa error; style parity benar (`module-validation-browser.json`).
- Penyelesaian sembilan modul baru: 108 tahap dari progres kosong, evaluasi dan sertifikat PDF satu halaman berhasil; cetak ulang progres lama menggunakan desain TJKT terbaru, dan nilai di bawah ambang tetap diblokir (`completion-validation-browser.json`, subset sembilan modul dari audit lengkap 53 modul).
- Beranda: 53 kartu tersedia, tautan utama benar, tanpa overflow pada desktop/ponsel (`catalog-validation.json`).

Pengujian otomatis membuktikan alur aplikasi dan kondisi model yang tercatat. Kedalaman jawaban, praktik pada perangkat nyata dan mutu hasil proyek tetap dinilai guru. Semua perubahan masih lokal, belum dipush atau dipublikasikan.
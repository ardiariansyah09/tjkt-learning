# Penyelesaian tiga modul dasar kelas X — lokal

Tanggal: 29 Oktober 2026. Menggantikan status draft pada catatan sebelumnya; **server LMS belum diubah**.

Tiga modul telah dibuat memakai kerangka navigasi, tata letak, penyimpanan progres dan sertifikat yang sama dengan modul kelas X lainnya:

1. Dasar Mesin Virtual: VirtualBox dan VMware Workstation.
2. Instalasi dan Konfigurasi Dasar Sistem Komputer: Linux desktop dan Windows desktop.
3. Konfigurasi Dasar Router dan Switch.

Masing-masing memuat delapan tahap: orientasi, pembahasan sesuai topik, laboratorium, refleksi/penerimaan dan evaluasi akhir. Total 24 tahap baru. Ilustrasi hubungan lapisan/perangkat disertakan. Tidak menambahkan game generik; simulasi digunakan untuk konsep yang relevan.

## Interaksi dan batasnya

- VM: memilih VirtualBox/Workstation, alokasi RAM, media dan segmen; menerima/menolak rencana berdasarkan resource serta isolasi pada model. Bukan menjalankan hypervisor nyata.
- OS: memilih Linux desktop/Windows desktop, target disk latihan, memulai instalasi model, melepas ISO dan menguji boot. Target host berisi data ditolak. Ini model keputusan, bukan replika layar installer; praktik nyata mengikuti panduan versi yang dipilih guru.
- Router/switch: membandingkan jalur satu LAN/lintas subnet saat gateway berubah, menyimpan konfigurasi dan memeriksa sesudah reboot model. Tidak mengirim paket atau mengonfigurasi perangkat nyata.

Petunjuk tujuan, tindakan pertama, perbandingan kondisi dan batas model muncul sebelum kontrol. Mulai percobaan baru hanya mereset model; tidak mereset progres. Status simulasi tidak dianggap bukti kompetensi fisik. Laporan dan praktik nyata ditinjau guru; nilai otomatis adalah pemahaman konsep.

## Progres dan sertifikat

Setiap tahap menggunakan cek pemahaman sesuai materi. Ambang tahap 75 dan evaluasi akhir 80. Evaluasi akhir mengambil tujuh soal yang mewakili seluruh tujuh tahap sebelumnya. Sertifikat baru terbuka setelah semua tahap lulus melalui komponen sertifikat bersama.

Kunci baru terpisah `tjkt:<id-modul-baru>:course:v2`. Modul lama, kunci lama dan nilai lama tidak dihapus. Katalog lokal kini berisi 56 modul: 19 Fase E dan 37 Fase F. Jumlah ini bukan jumlah modul aktif di server; server tetap paket sebelumnya sampai integrasi berikutnya.

## Validasi dan batas pemeriksaan

Berhasil: pemeriksaan struktur 24 tahap, soal dan jawaban, ilustrasi, petunjuk lab, kondisi berhasil/gagal model, graf prasyarat, sintaks JavaScript, pemetaan ATP 202 JP dan pemeriksaan cakupan evaluasi 44 course lama.

Pengujian browser end-to-end telah disiapkan untuk penguncian tahap, pengerjaan asesmen melalui form, pemulihan progres dan pemanggilan cetak sertifikat. Namun Chrome/Edge pada lingkungan ini tidak merespons perintah debugging `Runtime.enable`; pengujian berhenti sebelum aplikasi diuji. **Belum dapat menyatakan alur ketiga modul telah lulus pengujian browser sampai cetak.** Ini tidak mengubah bukti audit versi lama; audit lama juga tidak dianggap mencakup modul baru.

Cara pemeriksaan: `node tools/check-completed-foundations.mjs`, `node tools/check-atp-fase-e.mjs`, `node tools/check-assessment-coverage.mjs`. Pengujian browser: `node tools/check-foundation-previews-browser.mjs`.

Sumber draft Markdown disimpan sebagai arsip penulisan; halaman belajar lokal kini menggunakan `data/<id-modul>.json` dan `assets/js/foundation-course.js`. Generator `complete-foundation-courses.mjs` dapat menghasilkan kembali materi. Generator draft awal diberi pengaman agar tidak menimpa kurikulum yang sudah diselesaikan.

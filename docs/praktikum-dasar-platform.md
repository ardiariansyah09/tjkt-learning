> Dihapus dari tampilan atas permintaan pengguna pada 26 Oktober 2026. Bagian berikut adalah catatan historis implementasi, bukan fitur yang masih aktif. Nilai, jurnal dan laporan lama tidak dihapus dari penyimpanan browser.

# Penguatan praktik di dalam platform: tahap awal Fase E

Ditambahkan pada laboratorium **Analisis Kebutuhan dan Dokumentasi Jaringan** kelas X, setelah panel kapasitas switch. Modul tetap 12 tahap; katalog tetap 53 modul. Tidak menambah atau mengubah kunci kelulusan dan syarat sertifikat.

## Alur siswa

1. Baca tujuan, denah dan rencana melalui terminal model: `help`, `pwd`, `ls`, `cat rencana.txt`.
2. Hubungkan PC, nyalakan VM, pilih jaringan internal LAN-B dan terapkan konfigurasi PC sesuai rencana.
3. Periksa alamat/rute, ping gateway, ping server, query nama, lalu respons HTTP. Uji penerimaan membedakan kesesuaian rencana dan akses layanan.
4. Simpan baseline sehat. Sisipkan DNS salah, kabel lepas, atau NIC VM berpindah. Ambil bukti gagal sebelum memperbaiki.
5. Pulihkan penyebab minimum dan uji lagi. Pemulihan config PC tidak memperbaiki kabel atau mode NIC VM. Restart PC model mengembalikan config boot tersimpan dan memerlukan layanan sehat setelahnya.
6. Isi prediksi, bukti/alasan dan transfer. Catatan tersimpan lokal dengan ekspor JSON; guru menilai mutu penalaran, bukan hanya tanda selesai.

Router dan dua switch telah disiapkan pada dataset; layanan DNS/HTTP model berada pada satu VM. Tidak ada uplink Internet. Terminal bukan shell, tidak mengeksekusi input sebagai kode dan tidak mengirim paket. Latihan tidak mengajarkan instalasi Linux lengkap. Perintah tak dikenal atau target di luar dataset memberi keterangan dan tidak dianggap bukti kegagalan insiden.

## Bukti dan penyimpanan

State dan laporan memakai `tjkt:perencanaan-jaringan:basic-practice:v1`, terpisah dari progres modul. Riwayat operasi dibatasi 30 entri terbaru. Perubahan konfigurasi/lingkungan menaikkan versi dan membatalkan bukti penerimaan serta verifikasi boot sebelumnya. Konfigurasi draft tidak diterapkan sampai siswa menekan tombol terapkan. Gangguan baru memulai bukti gagal/pulih baru.

Reset meminta persetujuan dan hanya mengulang praktikum tambahan. Ekspor memuat keadaan model, konfigurasi baseline, jejak dan catatan siswa. Tidak ada akun, dashboard guru atau pengiriman data otomatis.

## Implementasi dan pengujian

Model: `assets/js/basic-practice-model.js`. Antarmuka: `assets/js/basic-practice.js`. Mount dibatasi pada laboratorium modul perencanaan; tahap lain tidak memunculkan aktivitas ini. Gaya mengikuti variabel tema bersama dan tata letak ponsel.

`tools/basic-practice-checks.js` memeriksa alamat/prefix/gateway, perbedaan ping IP dan DNS, VM/link, batas target, tiga siklus diagnosis–pemulihan, bukti usang dan persistensi setelah restart. Pengujian UI menggunakan kontrol sebenarnya dan memeriksa laporan tersimpan. Terhubung ke audit browser modul perencanaan.

Ini implementasi awal penguatan praktik dasar kelas X. Paket LKPD konfigurasi nyata dan penguatan seluruh modul Fase F pada rekomendasi audit belum dinyatakan selesai melalui tambahan ini.

## Hasil validasi 26 Oktober 2026

- Validasi ATP/aset seluruh katalog: 53 modul, prasyarat dan total JP tetap lulus.
- Audit browser modul perencanaan: 12 tahap, desktop/ponsel dan tema, tanpa error dan style parity benar. Pemeriksaan model dan UI tiga gangguan terhubung pada tahap laboratorium. Laporan terbaru: `module-validation-browser-focused.json`.
- Uji penyelesaian modul perencanaan dari progres kosong: 12 tahap, PDF satu halaman, cetak ulang, desain TJKT terbaru dan penolakan nilai akhir di bawah ambang lulus (audit focused saat implementasi praktik dasar; berkas completion-validation-focused.json dipakai bergantian dan kini mengikuti modul yang diuji pada putaran terbaru).
- Pratinjau ditinjau visual: `pratinjau-praktikum-dasar.png`. Progres pada screenshot merupakan data QA, bukan progres siswa.

Belum dipush atau dipublikasikan. Pengujian tidak menyatakan siswa sudah kompeten menjalankan OS/VM nyata.

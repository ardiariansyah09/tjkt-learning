> Dihapus dari tampilan atas permintaan pengguna pada 26 Oktober 2026. Bagian berikut adalah catatan historis implementasi, bukan fitur yang masih aktif. Nilai, jurnal dan laporan lama tidak dihapus dari penyimpanan browser.

# Penguatan praktik DHCP, DNS dan akses remote

Lokasi: Fase F kelas XI, modul **DHCP, DNS, dan Remote Server**, tahap laboratorium. Menggunakan simulator layanan yang sudah ada, ditambah kasus terurut, pemeriksaan bukti dan laporan. Katalog tetap 53 modul dan modul ini tetap 12 tahap; tidak menambah kuis atau game baru.

## Tiga kasus

| Kasus | Bukti diagnosis yang harus dihasilkan | Pemulihan dan penerimaan |
| --- | --- | --- |
| Ruang baru tidak memperoleh alamat | Minta lease A gagal ketika permintaan melintasi router tanpa relay; permintaan berhasil setelah relay disiapkan | Renew A, query nama ke .10 dan operasi remote sah |
| Server sudah diperbaiki, klien masih salah DNS | Query gagal saat lease berisi resolver salah; tetap gagal setelah opsi server diperbaiki tetapi lease belum diperbarui | Renew membawa opsi baru, lalu query DNS dan uji remote |
| Nama lama dan fingerprint belum dipercaya | Query menjawab cache .20, remote tidak mencapai server yang dimaksud; setelah cache dibersihkan query menuju .10, tetapi host key belum dipercaya tetap menolak login | Verifikasi identitas diasumsikan pada dataset, lalu renew, query dan operasi remote. Tidak menyarankan mengabaikan peringatan host key |

Kasus mempunyai 5, 5 dan 7 langkah. Kemajuan hanya berasal dari hasil operasi simulator dengan klien, konfigurasi dan keadaan lease/cache yang sesuai. Tidak ada centang selesai manual. Petunjuk langkah aktif ditampilkan dekat tombol simulator serta pada daftar langkah di bawahnya; tombol navigasi menghubungkan kontrol dan laporan.

Tiga hasil penerimaan terakhir harus dilakukan berurutan setelah perubahan terakhir: renew lease A, query DNS A, operasi remote A. Perubahan konfigurasi/pilihan klien, kemajuan waktu, release atau flush membatalkan penerimaan lama. Bukti diagnosis sebelumnya tetap merupakan riwayat. Reset lab memblokir kelanjutan kasus sampai siswa secara eksplisit memuat kembali kasus, sehingga hasil dari kondisi lain tidak dianggap penyelesaian.

## Catatan siswa

Siswa mengisi prediksi, bukti/alasan perbaikan, serta batas dan transfer. Laporan akhir disimpan hanya setelah langkah dan penerimaan selesai. Maksimal 10 laporan terakhir tersimpan pada `tjkt:layanan-server:guided-practice:v1`. Ekspor JSON juga tersedia untuk percobaan yang belum selesai. Setiap jejak menyimpan versi, waktu model, operasi, klien, konfigurasi, lease, cache, hasil serta trace. Riwayat run dibatasi 40 operasi dan tampilan memperlihatkan delapan operasi terakhir; bukti langkah yang diterima disimpan terpisah.

Draft teks dipisahkan per kasus selama halaman tetap terbuka. Keadaan simulator/kasus aktif bukan sesi server yang persisten: muat ulang halaman memulai lab baru. Laporan yang sudah disimpan tetap ada. Tidak ada perubahan ke kunci nilai, syarat sertifikat, dashboard guru atau pengiriman data otomatis. Mutu penalaran dan praktik VM nyata tetap ditinjau guru.

## Batas model

Kasus menggunakan model scope dan cache bersama yang sudah dijelaskan pada simulator. Tidak menjalankan DHCP/DNS/SSH, login, routing, verifikasi kriptografis fingerprint atau perintah OS nyata. Kriteria penerimaan di sini berlaku pada klien A dan operasi baca status model, bukan bukti seluruh klien atau seluruh layanan jaringan aman. Konsep dan contoh konfigurasi layanan tetap berada di bagian materi modul.

## Berkas dan verifikasi

- Model kasus: `assets/js/services-practice-model.js`.
- Antarmuka dan laporan: `assets/js/services-practice.js`.
- Integrasi operasi simulator: `assets/js/services-activity.js`.
- Pemeriksaan model/UI: `tools/services-practice-checks.js`, dipanggil audit topic tahap laboratorium.

Pemeriksaan mencakup urutan diagnosis, opsi lease lama, cache, penolakan identitas, tiga kasus selesai, bukti usang, kemajuan waktu, reset dan laporan tersimpan. Audit browser focused mencakup modul layanan dan regresi praktik kelas X; alur sertifikat layanan diuji terpisah dari progres kosong. Hasil akhir dicatat setelah pemeriksaan terakhir selesai. Perubahan masih lokal.

## Hasil akhir 26 Oktober 2026

- Validasi statis 53 modul, aset/import, prasyarat, kelas dan total JP lulus.
- Audit browser focused: layanan server dan perencanaan kelas X, masing-masing 12 tahap, desktop/ponsel dan tema, tanpa error serta style parity benar. Model/UI ketiga kasus layanan dan regresi praktik dasar lulus. Snapshot: `praktik-layanan-server-browser.json`.
- Penyelesaian layanan server dari progres kosong: 12 tahap, sertifikat desain TJKT terbaru, PDF satu halaman, cetak ulang dan penolakan nilai di bawah ambang lulus. Snapshot: `praktik-layanan-server-completion.json`.
- Tampilan kasus ditinjau visual pada `pratinjau-praktik-layanan-server.png`; screenshot memakai profil QA dengan progres contoh, bukan bukti kelulusan siswa.

Laporan penuh 53 modul sebelumnya tetap merupakan baseline historis; pengujian ulang putaran ini dibatasi dua modul yang relevan dan alur sertifikat modul layanan. Perubahan belum dipush atau dipublikasikan.
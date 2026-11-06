# Integrasi kurikulum dan simulator ke LMS — 29 Oktober 2026

Catatan rilis awal. Tujuh kekurangan yang dicatat di bawah sudah ditindaklanjuti dalam [rilis pelengkapan ATP](pelengkapan-atp-lms-2026-10-29.md); gunakan laporan tersebut untuk status terbaru.

**Sudah aktif di produksi:** https://learning.tkjwikrama.my.id pada `/var/www/tjkt-learning`, server `172.16.10.6`.

Rilis `3fd027221e1882c91281b66f0562c656ec5880c2871252c0f03188e31a3658b5` memuat 56 modul dan 642 tahap: 19 modul Fase E dan 37 Fase F. Ketiga modul baru sudah diterbitkan serta disertakan pada kelas yang sesuai. Sepuluh kelas aktif tidak memiliki prasyarat penugasan yang hilang.

## Isi pembaruan

- Pengelompokan kelas X mengikuti empat elemen ATP dan alokasi elemen total 202 JP.
- Tambahan profesi/technopreneurship/visi karier, K3/APD/rambu/ketinggian, perkembangan 3G/4G/5G serta penerapan telekomunikasi masuk pada revisi isi.
- Dasar VM 13 tahap, instalasi desktop 15 tahap dan router/switch 8 tahap tersedia pada halaman native LMS.
- Simulator VM/installer Ubuntu/Windows dapat dipakai dalam modul; sesi simulator ikut tersimpan pada snapshot akun melalui adapter LMS, bukan hanya storage bersama browser.
- Virtualisasi XI diperdalam ke Proxmox VE/ESXi; instalasi Linux server dilengkapi sebagai kelanjutan desktop kelas X.
- Isi rilis, termasuk HTML/JS/CSS/JSON/gambar, disimpan ke database: 344 aset dengan total decoded 4.179.193 byte. Paket lama dipertahankan untuk riwayat/pemulihan.

## Progres dan nilai

53 modul lama tidak diganti versi penilaian, kunci progres atau skema ID/ambang tahapnya. Sebanyak 44 bank soal course dibandingkan dengan rilis lama dan identik. Revisi isi dipetakan melalui `learning_package_content_revisions`, sehingga antrean offline yang memakai namespace versi sebelumnya tetap cocok.

Pemeriksaan produksi memastikan tujuh rekaman `module_progress` yang sudah ada identik sebelum/sesudah aktivasi. Saat aktivasi, tabel snapshot produksi belum berisi rekaman. Pengujian terpisah di review menggunakan 53 snapshot/progres sintetis dan memastikan semuanya tetap identik serta pulih di browser setelah revisi isi. Tidak mengarang nilai, membuat siswa otomatis lulus, atau mereset data lama.

Cadangan database dan kode dibuat sebelum aktivasi: `/home/adminnazh/tjkt-lms-backups/curriculum-20261029-130104`. Berkas ini tetap privat di server, tidak diunduh ke proyek.

## Validasi

- **171 tes, 2.005 assertion** lulus pada database pengujian terpisah.
- Browser review: 56 halaman native LMS, satu kerangka LMS tanpa iframe/Hub/tautan portal lama; 53 progres siswa lama tetap pulih.
- Tiga modul baru: asesmen melalui form, simulator melalui kontrolnya, penyimpanan akun, reload dan pemanggilan cetak sertifikat lulus. Pemanggilan `window.print` diuji dengan stub; tidak mengklaim telah mencetak fisik atau memeriksa seluruh PDF.
- Produksi: 56 HTML modul native, 642 tahap, hash 344 aset database valid, sepuluh kelas, tidak ada prasyarat yang tidak ditugaskan, mode maintenance mati dan login HTTPS valid.

Bukti: [verifikasi produksi](lms-review/curriculum-verification.json), [aktivasi](lms-review/curriculum-activation.json), [hasil browser review](lms-review/curriculum-browser.json), [tes regresi](lms-review/curriculum-release-tests.xml), [kompatibilitas rilis](compatible-lms-release-validation.json).

## Audit ATP dan kedalaman

Audit seluruh 56 modul terhadap empat ATP tersedia di [audit tujuan dan kedalaman](audit-atp-seluruh-modul.md) serta [matriks data](audit-atp-seluruh-modul.json).

Hasil: 44 baris tujuan (termasuk lima baris MP Pilihan yang memakai kompetensi sama dengan XII), 37 tercakup dan 7 sebagian. Pokok besar semuanya memiliki materi terkait, tetapi beberapa rincian/penerapan masih belum cukup mendalam. Kekurangan: laporan per aktivitas legacy; penerapan seluler/microwave/VSAT; definisi/format HTS; praktik spesifik AP Ruijie; kelengkapan router Linux BIRD; RADIUS hingga penegakan profil NAS; penggunaan SmartOLT sesuai fasilitas sekolah.

Peta MP Pilihan XI–XII adalah pemanfaatan materi bersama, bukan pembuatan kelas/mapel atau duplikasi progres/JP otomatis. Pembagian kegiatan mapel pilihan tetap mengikuti rencana mengajar sekolah. Kelulusan sertifikat tidak dijadikan bukti otomatis bahwa semua kompetensi praktik ATP sudah dikuasai siswa.

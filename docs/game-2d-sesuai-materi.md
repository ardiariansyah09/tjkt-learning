# Penggantian game berulang dengan game 2D sesuai materi

Tinjauan 26 Oktober 2026 menemukan 16 modul yang benar-benar memasang mesin kurir grid yang sama melalui `mountActionGame`. Daftar tema lama mempunyai 17 entri, tetapi Media Transmisi tidak memasang tahap game: modul itu mempunyai simulasi media dan cable tester. Tidak menambah tahap baru pada modul tersebut.

## Game pengganti

| Modul | Game dan mekanik |
| --- | --- |
| Proses Bisnis | Meja Layanan Sekolah: urutkan pekerjaan tiket, dahulukan layanan kritis, cocokkan teknisi dan tenggat |
| Wawasan TJKT | Jaga Data Sensor: kelola pembacaan, ringkasan edge, kuota paket, uplink serta detail alarm |
| Profesi/Kewirausahaan | Bengkel Jasa Jaringan: kelola kas, harga, stok kit, pelatihan, pesanan dan laba |
| Dasar Telekomunikasi | Radio Dua Arah: jadwalkan frame half duplex pada slot dengan gangguan |
| Alat Ukur | Meja Ukur Optik: cocokkan panjang gelombang, buat referensi, ganti jalur uji dan hitung rugi sisip |
| K3LH | Amankan Ruang Praktik: penataan benda pada denah, urutan pengamanan, ESD, jalur evakuasi dan limbah |
| Analisis Kebutuhan/Dokumentasi | Rancang Panel Ruang Belajar: pilih kapasitas, alokasikan port perangkat/uplink serta cadangan |
| IPv6 Dasar | Bengkel Alamat IPv6: normalisasi hextet dan pemilihan rangkaian nol kanonis |
| Pengenalan Jaringan | Loket Paket Jaringan: alirkan permintaan dan respons melalui simpul sesuai tujuan lokal/luar |
| Topologi | Jaringan Tetap Terhubung: pasang kabel terbatas dan buktikan ketahanan ketika kabel atau simpul gagal |
| Perangkat Jaringan | Bengkel Modul Perangkat: ganti modul kompatibel pada perangkat model yang sudah dimatikan |
| OSI/TCP-IP | Pabrik Enkapsulasi: susun lapisan transport/IP/Ethernet, kirim, lalu lepaskan dalam urutan penerima |
| IPv4/Subnetting | Lahan Subnet: pecah blok alamat dan alokasikan ruang minimum yang sejajar tanpa overlap |
| Protokol/Layanan | Antrean Layanan Digital: gunakan lease terbatas, resolusi nama, potongan transfer dan release antarklien |
| Troubleshooting | Teknisi dalam Batas Waktu: dapatkan bukti lapisan, pulihkan penyebab dan pertahankan batas akses |
| Switching/VLAN | Ruang Kendali Frame: pelajari MAC, kelola unicast/flood dan segmentasi VLAN dengan bandwidth terbatas |

Setiap game mempunyai tiga level: **48 level**, dengan tujuan, kondisi objek, kendali dan batas yang dijelaskan pada game. Penyelesaian melalui manipulasi objek/sumber daya, bukan soal pilihan ganda. Seret pada beberapa papan memiliki alternatif klik; tombol memakai Tab/Enter. Game tidak lagi memerlukan navigasi avatar, depot D, empat pos, kunci, baterai atau gerbang F. Tidak ada tampilan 3D yang menduplikasi game ini.

Fungsi dan gaya kendali bersama boleh dipakai ulang, tetapi model persoalan 16 modul ini berbeda. Game khusus pada 36 modul lainnya tetap memakai model topiknya. Simulasi/praktik, seperti memasang kabel dan memeriksa link, dinilai dalam konteks tahap praktiknya; gambar jaringan yang sama-sama memakai PC/switch tidak otomatis berarti mesin game yang sama.

## Pelestarian progres

- ID modul, URL modul, urutan/ID tahap, `storageVersion`, kunci localStorage, aturan lulus dan kontrak callback penilaian dipertahankan.
- `action-game.js` menjadi entry kompatibilitas yang memanggil renderer baru. Tidak ada pembacaan, penghapusan atau migrasi nilai/jurnal di model dan renderer game baru.
- Nilai hanya dikirim ke mesin modul setelah tiga level selesai. Reset game hanya mengulang state permainan pada halaman; tidak menghapus nilai terbaik atau kelulusan lama.
- IPv4 tetap memakai kunci sequential v2 dan rekam stage8 yang lama. Format ini berbeda dari mesin course; pengujian memakai fixture yang sesuai.
- Siswa yang sudah lulus tidak diwajibkan mengulang game hanya karena desain berganti. Syarat cetak ulang tetap dibaca dari nilai yang tersimpan.
- Posisi, giliran dan objek pada game lama tidak disimpan oleh renderer lama. Keadaan sesi yang belum dinilai bukan data progres yang dapat dimigrasikan; pembaruan ini mempertahankan hasil yang memang telah tersimpan.

Pengujian kompatibilitas memakai profil QA terpisah dan data contoh. Tidak menyentuh browser siswa. Pada alamat GitHub Pages yang sama, nilai tetap memakai origin, URL dan kunci yang sama; berpindah domain/browser memang mempunyai penyimpanan berbeda sebagaimana sebelumnya.

## Implementasi

Model topik: `assets/js/topic-games-model.js`; renderer: `assets/js/topic-games.js`; gaya: `assets/css/topic-games.css`. Mesin navigasi dan empat adaptor lama tetap menerima callback yang sama. Parameter query aset diperbarui untuk memuat antarmuka baru tanpa mengubah kunci penyimpanan.

Petunjuk generik pada pembangun course diperbaiki agar tidak lagi mewajibkan gerak avatar untuk game lain. Struktur game/refleksi/evaluasi, pertanyaan refleksi serta jumlah tahap dipertahankan. Audit juga memperbaiki lebar tombol mode instruktur lokal pada halaman Pengenalan yang sebelumnya dapat membuat luapan horizontal.

Semua model merupakan batas belajar: tidak mengirim paket, mengukur daya, mengoperasikan radio, membuka perangkat atau menangani sumber berbahaya nyata. K3 memerlukan pengamanan oleh guru/petugas berwenang pada model; tindakan layar tidak memberikan kewenangan praktik lapangan. Permainan VLAN menyederhanakan keputusan operator dan forwarding; bukan implementasi bridge lengkap.

## Verifikasi

`tools/topic-game-checks.js` memeriksa 48 solusi model, kegagalan batas tindakan, urutan K3, kompatibilitas modul perangkat, pemampatan IPv6 yang seri, pool lease, segmentasi, larangan allow-all, tenggat dan penghitungan ringkasan. Pemeriksaan UI memainkan 48 level menggunakan kontrol yang tersedia dan memastikan callback kelulusan tidak dipanggil lebih dari sekali per penyelesaian.

`tools/validate-game-progress-browser.ps1` memuat nilai lama 85, jurnal, serta riwayat percobaan; memuat ulang halaman, membuka/reset game baru, memeriksa data tetap utuh dan menyiapkan cetak ulang sertifikat. Cakupan 16 modul dicatat di `game-progress-compatibility.json`.

Audit browser seluruh katalog dan penyelesaian ulang modul terdampak dicatat pada laporan hasil akhir setelah putaran terakhir selesai. Pratinjau menggunakan data QA, bukan nilai siswa. Perubahan belum dipush atau dipublikasikan.

## Hasil akhir 26 Oktober 2026

- Inventaris seluruh 53 modul: 52 jalur game bertopik dan satu modul tanpa game (`game-inventory.json`). Dari 52 jalur tersebut, 16 mesin kurir berulang diganti; 36 game khusus tetap dipertahankan.
- Model dan kontrol game baru: 16 mekanik, 48 level, seluruh solusi dan kondisi gagal lulus. Pemasangan ulang ke host yang sama tidak menggandakan game atau callback nilai (`topic-game-ui-smoke.json`).
- Audit browser seluruh katalog: 53 modul/606 tahap, desktop 1280x900, ponsel 390x844 dan tema, tanpa error serta style parity benar (`game-validation-browser.json`).
- Audit akhir focused setelah penyempurnaan nama, petunjuk dan kontras: 16 modul/166 tahap lulus (`game-validation-focused.json`).
- Penyelesaian dari progres kosong: 16 modul pengganti ditambah regresi Media Transmisi, total 17 modul/174 tahap; PDF satu halaman, cetak ulang dan penolakan nilai di bawah ambang semuanya lulus (`game-completion-validation.json`).
- Kompatibilitas progres sebelumnya: 16 modul tetap mempertahankan nilai 85, jurnal serta riwayat, termasuk setelah reset game baru; sertifikat lama dapat disiapkan dan dicetak ulang (`game-progress-compatibility.json`).
- Pratinjau bisnis, K3, panel, IPv4 dan OSI ditinjau visual. Pengambilan gambar menunggu font/paint agar indikator terbaca. Dua kasus visual tambahan tetap lulus pemeriksaan progres (`game-progress-compatibility-focused.json`).

Siswa yang sudah lulus tidak perlu mengulang game untuk menjaga kelulusannya. Perubahan hanya tersedia lokal dan belum dipush/dipublikasikan ke GitHub.
# Penyederhanaan praktik dan game

Perubahan 26 Oktober 2026 mengikuti permintaan pengguna untuk melepas tambahan praktik terbimbing dan memperjelas game interaktif.

## Praktik tambahan dilepas

Praktikum terpadu PC/VM pada modul perencanaan kelas X dan kasus terbimbing DHCP/DNS/remote pada modul layanan kelas XI tidak lagi dipasang. Bagian materi yang mengarahkan siswa ke dua tambahan tersebut juga dihapus. Simulator utama, evaluasi, tahap pembelajaran dan syarat sertifikat dipertahankan.

Berkas implementasi lama disimpan sebagai arsip tidak aktif. Tidak ada pemanggilan helper praktik tambahan pada mesin halaman. Tidak ada penghapusan atau migrasi localStorage: catatan praktik dasar, laporan kasus, jurnal utama dan nilai yang pernah disimpan tetap berada pada browser. Dokumentasi fitur sebelumnya diberi penanda historis.

## Informasi game lebih ringkas

- Enam belas game topik menampilkan tujuan dan satu petunjuk tindakan singkat. Petunjuk menyesuaikan keadaan, misalnya setelah pembungkus paket lengkap siswa diarahkan untuk mengirim.
- Aturan rinci berada pada bagian **Cara bermain dan aturan** yang dapat dibuka. Tidak perlu membaca semua aturan panjang sebelum melihat papan.
- Pada 36 game khusus lainnya, informasi awal memuat tujuan, langkah pertama dan tanda selesai. Langkah lengkap, aturan dan cara mengulang berada dalam rincian tertutup. Paragraf aturan yang berulang dipindahkan ke rincian bila aman; indikator, status dan kontrol tidak dipindahkan.
- Tombol akhir pada permainan yang memakai navigasi level diberi label **Selesaikan dan catat nilai** pada level terakhir. Label tidak mengubah tindakan atau mekanisme penilaian.

## Manipulasi objek, bukan soal pilihan

Lima papan diperkuat dengan interaksi langsung yang tetap memiliki alternatif klik/keyboard:

| Game | Interaksi |
| --- | --- |
| Pabrik Enkapsulasi | Seret header ke payload untuk membangun paket berlapis; buka lapisan terluar di penerima |
| Bengkel Modul Perangkat | Matikan perangkat model, pindahkan modul dari rak ke soket, lalu nyalakan dan uji |
| Ruang Kendali Frame | Pindahkan frame aktif ke port; tetap perhatikan MAC, VLAN, flood dan bandwidth |
| Radio Dua Arah | Seret frame dari stasiun pengirim ke penerima pada slot yang tersedia |
| Bengkel Jasa Jaringan | Pindahkan kit dari stok ke pesanan yang belum selesai, dengan batas kas dan kompetensi |

Game lain mempertahankan mekanik topiknya: menata benda/port/blok, menyambung jalur, mengatur antrean, mengelola sumber daya dan menguji pemulihan. Evaluasi pilihan ganda tetap merupakan bagian penilaian terpisah dari permainan. Tidak menambahkan tahap game pada Media Transmisi yang sudah mempunyai simulasi dan cable tester.

Nama modul, ID tahap, kunci skor, penyimpanan versi lama dan callback penilaian dipertahankan. Tidak ada nilai diberikan hanya karena membuka petunjuk, memilih objek, atau mengunjungi tahap pada mode instruktur.

## Pemeriksaan

- Audit browser seluruh 53 modul memeriksa tampilan, operasi simulator/game, absennya dua praktik tambahan, desktop/ponsel dan tema.
- Audit kejelasan memeriksa langsung setiap tahap game: petunjuk singkat, rincian tertutup, tidak ada radio pilihan ganda yang terlihat, tidak ada kendali game 3D, dan tidak ada kelulusan otomatis karena pratinjau.
- Pengujian 48 level game topik mencakup operasi melalui kontrol, seret objek, alternatif klik dan callback tunggal.
- Pengujian kompatibilitas memuat nilai lama 85, jurnal, riwayat game, catatan praktik dasar dan laporan kasus; memeriksa data tetap utuh serta cetak ulang sertifikat. Profil uji terpisah dari browser pengguna.

Laporan hasil akhir dicatat setelah seluruh pemeriksaan selesai. Perubahan masih lokal dan belum dipublikasikan ke GitHub.

## Hasil akhir

- 53 modul/606 tahap: browser desktop/ponsel, tema dan style parity lulus tanpa error (`game-usability-browser.json`). Dua praktik tambahan tidak muncul pada tahap mana pun yang diperiksa.
- 52 game pada 53 modul: seluruhnya mempunyai informasi singkat, rincian tertutup dan kontrol 2D; tidak ada radio pilihan ganda terlihat pada tahap game. Satu modul, Media Transmisi, memang tanpa game (`game-clarity-validation.json`).
- 16 game topik/48 level: model, kontrol, penempatan seret dan callback tunggal lulus (`game-usability-smoke.json`).
- Delapan modul yang paling terdampak: 86 tahap diselesaikan dari progres kosong sampai sertifikat PDF satu halaman, cetak ulang dan penolakan nilai kurang (`game-usability-completion.json`).
- Tujuh belas modul: nilai lama 85, jurnal, riwayat serta data dua praktik tambahan tetap utuh setelah muat ulang/reset game; cetak ulang lulus (`game-usability-progress.json`). Pemeriksaan ini dapat diulang melalui `validate-practice-removal-browser.ps1`.

Tidak ada penghapusan kunci nilai, jurnal atau laporan pengguna. Semua pengujian memakai profil QA terpisah. Belum dipush atau dipublikasikan.
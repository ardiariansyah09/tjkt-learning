# Mode instruktur lokal

Pada `http://localhost/...`, `http://127.0.0.1/...` dan loopback IPv6, navigasi seluruh tahap terbuka secara default. Panel di bawah header menyediakan tombol **Gunakan mode siswa** atau **Aktifkan mode instruktur**. Pergantian mode memuat ulang halaman dan menyimpan pilihan pada browser/origin lokal tersebut.

Hostname lain, termasuk GitHub Pages, selalu menggunakan aturan kelulusan biasa. Preferensi lokal bernilai `on` tidak cukup untuk mengaktifkannya di host lain; pemeriksaan hostname dan protokol dilakukan setiap kali aturan akses diperiksa. Tidak perlu mengedit kode atau menyiapkan versi unggahan yang berbeda. Mode tidak otomatis berlaku pada alamat LAN atau domain lokal kustom.

Mode instruktur hanya membuka navigasi materi. Tidak mengisi skor, menandai lulus, meluluskan game, atau memberi sertifikat. Aktivitas tetap dapat dikerjakan dan penilaian tetap memakai aturan semula. Sertifikat hanya tersedia setelah syarat kelulusan terpenuhi. Posisi tahap terakhir yang dibuka dapat tersimpan sebagaimana navigasi biasa; nilai dan bukti kelulusan tidak diubah hanya karena melihat materi.

Preferensi: `tjkt:local-instructor:v1`, nilai `off` untuk mode siswa dan `on` untuk instruktur. Jika preferensi belum ada pada host lokal yang didukung, instruktur aktif. Jika penyimpanan tidak tersedia, navigasi lokal tetap terbuka dan tombol memberikan keterangan bahwa pilihan tidak dapat disimpan. Di host publik mode tetap nonaktif.

Ini kemudahan pratinjau untuk instruktur pada aplikasi statis, bukan sistem login atau otorisasi server. Aturan kunci GitHub tetap merupakan pengaturan alur belajar pada browser seperti sebelumnya.

Implementasi bersama: `assets/js/local-instructor.js`. Mesin navigasi bab, Pengenalan, Topologi, Perangkat dan IPv4 membaca aturan yang sama; fungsi penilaian dan kelulusan dipertahankan. Seluruh 53 halaman memuat helper sebelum mesin modul. Audit penyelesaian otomatis secara eksplisit memakai mode siswa pada profil QA agar tetap menguji penguncian tahap yang sebenarnya.

Praktik terbimbing tambahan pada perencanaan kelas X dan layanan DHCP/DNS/remote kelas XI telah dilepas kembali atas permintaan pengguna. Penghapusan tampilan ini tidak menghapus catatan, nilai atau laporan yang pernah disimpan.

## Hasil pemeriksaan 26 Oktober 2026

- Seluruh 53 modul: semua 606 tahap dapat dibuka dalam mode instruktur, tombol lanjut bekerja, progres tidak diluluskan dan sertifikat tidak diberikan hanya karena pratinjau.
- Seluruh 53 modul: mode siswa lokal tetap mengunci tahap berikutnya dari progres kosong.
- Seluruh 53 modul: host nonlokal simulasi tetap terkunci walaupun preferensi bernilai on; kontrol instruktur tidak tampil. Tiga putaran berjumlah 159 pemeriksaan modul (`local-instructor-validation.json`).
- Delapan kombinasi hostname/protokol/preferensi termasuk hostname GitHub diperiksa pada sandbox JavaScript. Penangan tombol aktual memindahkan preferensi off/on dan memuat ulang tanpa menulis kunci nilai.
- Lima mesin navigasi diwakili oleh Pengenalan, Perangkat, Topologi, Perencanaan dan IPv4: total 48 tahap lulus dalam mode siswa sampai PDF satu halaman, cetak ulang serta penolakan nilai kurang (`local-instructor-completion.json`).
- Validasi statis seluruh 53 modul, aset, prasyarat dan JP tetap lulus. Tidak dipush atau dipublikasikan.
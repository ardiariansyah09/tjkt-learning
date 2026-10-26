# Internet Gateway dan NAT — Fase F kelas XI

Modul inti pada elemen Konfigurasi Perangkat Jaringan, urutan keenam sesudah Routing Dinamis OSPF. Prasyarat konsep tetap Routing Statis; tidak ditambahkan ketergantungan wajib pada OSPF untuk mempelajari NAT. JP elemen ATP tidak diubah.

Halaman: `modules/konfigurasi-jaringan/nat-wan/`. Materi: `assets/js/course-nat.js`. Metadata: `data/nat-wan.json`.

## Struktur materi

Dua belas tahap: orientasi; gateway LAN–WAN dan jalur balik; jenis NAT dan istilah alamat; PAT/NAPT dan tuple sesi; siklus sesi/kapasitas/DNS; publikasi layanan dan kebijakan masuk; konfigurasi/diagnosis/pemulihan; proyek; laboratorium; game Port Dispatcher; refleksi; rangkuman/evaluasi akhir.

Tiap konsep mempunyai penjelasan, contoh, tugas transfer, miskonsepsi, serta cek pemahaman. Proyek meminta diagram, IP/interface/gateway/rute, aturan translasi dan izin terpisah, tabel tuple pergi–balik, matriks gangguan, tiga eksperimen, uji penerimaan, backup/persistensi/rollback, serta pembahasan batas. Proyek dan refleksi dinilai melalui rubrik manusia, bukan otomatis dari panjang tulisan.

Rujukan primer disertakan pada materi: RFC 3022, RFC 1918, RFC 5737, RFC 6598, serta dokumentasi konfigurasi Cisco. Contoh IOS memakai interface LAN/WAN yang dinyatakan, penandaan inside/outside, default route, ACL pencocokan NAT, dan overload. Contoh static PAT dipisahkan dari kebijakan firewall; tidak diklaim sebagai konfigurasi keamanan lengkap atau hasil eksekusi perangkat nyata.

## Laboratorium

Dataset mempunyai empat klien LAN, gateway .1, WAN 203.0.113.2/29, server luar HTTPS, resolver UDP DNS, serta server LAN untuk static PAT TCP 8443 → 443. Semua alamat luar adalah alamat dokumentasi. Tidak ada request ke Internet nyata.

Pilihan sesi keluar: tanpa translasi; dynamic Basic NAT dengan pool dua alamat; PAT dengan satu alamat dan tiga slot per protokol. Request TCP/UDP membentuk/memakai ulang mapping dan menampilkan tuple serta tabel sesi. Balasan dicocokkan dengan entri dan endpoint remote model. Port numerik yang sama dapat dipakai TCP/UDP sebagai ruang protokol terpisah. Basic NAT mempertahankan port dan memisahkan host lewat alamat global. Sesi diakhiri melalui waktu manual 30 detik untuk membuktikan kedaluwarsa dan penggunaan ulang slot.

Gateway, WAN, rute keluar, peran interface, kecocokan aturan, DNS, akses HTTPS memakai nama, static PAT, dan izin masuk dapat diubah. Perubahan konfigurasi sengaja memulai sesi uji kosong dan membatalkan bukti lama; ini bukan klaim bahwa edit aturan perangkat selalu langsung menghapus semua sesi. Pilihan klien/protokol tidak mengosongkan tabel sehingga beberapa aliran dapat dibandingkan. Pilihan sesi balasan dipertahankan agar target uji tidak berpindah tanpa tindakan siswa. Jurnal menyimpan operasi, pilihan pengujian, konfigurasi, trace, dan tabel hasil.

Static PAT 8443 dan kebijakan izin masuk diuji terpisah; port 22 tidak mempunyai mapping. Balasan sesi keluar dibedakan dari koneksi masuk baru. Penolakan paket tanpa mapping pada dataset bukan klaim bahwa seluruh layanan router WAN atau firewall nyata sudah diuji. Rute/server LAN pada uji inbound diasumsikan tersedia; tidak ada listener layanan lokal router yang disimulasikan.

Model tidak membuat paket biner, TCP handshake, TLS, ICMP, ALG, NAT hairpin, PPPoE, CGNAT, atau pengukuran kapasitas perangkat. Filtering endpoint dan timeout seragam adalah keputusan model yang dinyatakan, bukan perilaku universal NAT.

## Game Port Dispatcher

Puzzle pengelolaan aliran 2D tiga level: alokasi slot publik, antrean request, balasan tertunda, tabel sesi, sisa lease, nyawa, batas giliran, dan paket remote tanpa pasangan. Paket diseret ke slot/host/zona buang atau dipilih lalu dikirim melalui tombol zona. Fokus dipertahankan saat kartu/tabel digambar ulang untuk mendukung penggunaan keyboard.

Slot aktif tidak dapat ditimpa. Tuple internal yang masih aktif tidak dapat diberi mapping duplikat baru. Pengantaran reply yang benar menutup sesi permainan serta membebaskan slot. Salah host/aksi mengurangi nyawa; lease atau batas giliran habis menghasilkan gagal. Ulang level/permainan tersedia. Game tidak menggunakan soal pilihan ganda dan hanya muncul pada tahap game. Lease/giliran serta penutupan setelah satu reply dijelaskan sebagai mekanik permainan, bukan TCP nyata. Nilai 100 disimpan setelah seluruh tiga level selesai.

## Validasi

`tools/nat-checks.js` memeriksa pemisahan mapping PAT, balasan tepat host, reuse tuple, exhaustion, pemisahan TCP/UDP, expiry dan pemulihan slot, Basic NAT pool, gateway/WAN/rute/peran/aturan gagal, DNS versus IP, static PAT versus kebijakan, port tanpa mapping, serta input waktu tidak valid. Pengujian game meliputi solusi tiga level, lease gagal, salah host, slot aktif, drag/drop, fokus, pengulangan, dan penyimpanan nilai. Formulir serta jurnal memakai petunjuk kontekstual sebelum kontrol.

Pengujian browser terpilih mencakup NAT dan regresi OSPF pada desktop/ponsel dan tema terang/gelap. Pengujian kelulusan NAT berjalan dari progres kosong melalui kontrol sebenarnya pada 12 tahap, kemudian mengisi formulir sertifikat, mencetak PDF satu halaman, memuat ulang untuk cetak ulang, serta menolak cetak jika nilai akhir uji di bawah 80. Semua dilakukan pada profil browser sementara, tanpa menghapus progres siswa.

Laporan terpilih: `docs/module-validation-browser-focused.json` dan `docs/completion-validation-focused.json`. Situs tetap HTML/CSS/JS statis, tanpa database/login; progres lokal dan jurnal dapat diekspor.

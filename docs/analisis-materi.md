# Pemetaan materi TJKT dan TKJ

## Pembaruan pemetaan fase

Pembaruan ini menggantikan susunan kelompok dan jumlah entri pada catatan peninjauan awal di bawah. Dokumen ini menjadi catatan pemeliharaan dan tidak ditautkan di halaman belajar.

Acuan pemetaan: [dokumen CP Kemendikdasmen 2025](https://kurikulum.kemendikdasmen.go.id/file/1753929861_manage_file.pdf). Urutan modul adalah rancangan situs; ATP sekolah menentukan pembagian pembelajaran per semester.

**Fase E, kelas X — Dasar-Dasar TJKT:** proses bisnis; perkembangan teknologi dan isu global; profesi dan kewirausahaan; K3LH dan budaya kerja industri; dasar-dasar teknik jaringan komputer dan telekomunikasi; media dan jaringan telekomunikasi; penggunaan alat ukur. Modul dasar ditempatkan pada kelompok dengan fokus utama yang sesuai; hubungan lintas kelompok ditunjukkan melalui prasyarat.

**Fase F, kelas XI–XII — konsentrasi TKJ:** perencanaan dan pengalamatan jaringan; teknologi jaringan kabel dan nirkabel; keamanan jaringan; pemasangan dan konfigurasi perangkat jaringan; administrasi sistem jaringan. Proyek integrasi merupakan penerapan lintas elemen, bukan elemen CP tersendiri. Fase F ini tidak mencakup semua konsentrasi dalam program TJKT.

Katalog kini berisi **42 entri: 17 tersedia dan 25 rencana**. Seluruh 16 modul Fase E kini tersedia, sedangkan Fase F memiliki satu modul tersedia dan 25 rencana. Lima modul Fase E yang dilengkapi adalah proses bisnis, perkembangan teknologi, profesi/kewirausahaan, sistem telekomunikasi, dan penggunaan alat ukur. Ketersediaan modul tidak menggantikan pemetaan ATP dan penilaian praktik oleh sekolah.

Modul IPv4 lama tetap tersedia pada jalur fondasi dengan URL serta progres yang sama; pendalaman CIDR/VLSM dan lab dua subnet dapat digunakan sebagai pengayaan/transisi Fase F. Perencanaan/pengalamatan terpadu Fase F menjadi tempat penerapan kompetensi lanjutan, bukan klaim bahwa seluruh kedalaman modul IPv4 diwajibkan di Fase E. Label Fase F ditampilkan kelas XI–XII, mengikuti cakupan fase tanpa menetapkan pembagian kelas nasional untuk setiap topik.

---

## Catatan peninjauan awal sebelum pemetaan fase

Tanggal peninjauan: 21 Oktober 2026.

## Kesimpulan dan batas cakupan

Versi awal memiliki 23 entri katalog, tetapi baru 9 modul berhalaman. Fondasi jaringan cukup baik sebagai pengantar; jumlah judul dalam katalog belum menunjukkan kelengkapan materi siap belajar. Hub ini belum dapat disebut mencakup seluruh kompetensi TJKT. Pendalaman yang tersedia terutama mengarah ke konsentrasi Teknik Komputer dan Jaringan (TKJ), bukan seluruh konsentrasi telekomunikasi.

Peninjauan ini mencakup katalog, susunan bab pada modul jaringan yang tersedia, dan kesenjangan topik. Ini bukan audit kebenaran setiap kalimat, soal, atau simulator, dan bukan pengesahan kesesuaian seluruh CP/ATP sekolah.

## Pengelompokan dan urutan yang diperbaiki

| Kelompok | Urutan yang disarankan | Alasan |
| --- | --- | --- |
| Dasar Jaringan, Fase E | K3LH → dunia kerja/teknologi → pengenalan → perangkat → media → topologi → perencanaan → OSI/TCP-IP → IPv4/subnetting → IPv6 → protokol/layanan → troubleshooting | Keamanan kerja mendahului praktik; perangkat dan media memberi konteks untuk menyusun topologi; pengalamatan mendahului layanan. |
| Infrastruktur, Fase F | Instalasi kabel → WLAN → fiber optik → VoIP | Pisahkan pengenalan media dari keterampilan instalasi dan pengukuran. VoIP memerlukan protokol serta QoS dari kelompok lain. |
| Konfigurasi, Fase F | Switching/VLAN → routing statis IPv4 → routing dinamis → NAT/WAN → bandwidth/QoS → proxy/load balancing | Rute dasar dipahami sebelum pertukaran rute dan akses WAN. NAT dapat dipelajari setelah routing statis tanpa menunggu routing dinamis. |
| Administrasi, Fase F | Dasar server → virtualisasi → instalasi/administrasi OS → pengguna/hak akses → DHCP/DNS/remote → file → hosting/web/database → mail → VPN → monitoring → backup/pemulihan | Lingkungan latihan dan OS harus tersedia sebelum mengelola layanan. Backup dipraktikkan sejak membuat VM; modul terakhir memperdalam pemulihan layanan terpadu. |
| Keamanan, Fase F | Keamanan dasar → autentikasi/kriptografi → hardening/IDS/IPS/respons insiden | Keamanan dasar diperkenalkan sejak fondasi dan diterapkan di setiap praktikum; pendalaman menggunakan layanan dan log yang sudah dipahami. |
| Proyek integrasi, Fase F | Kebutuhan → rancangan → implementasi → pengujian → pengamanan → dokumentasi/serah terima | Menjadi asesmen penerapan kompetensi lintas kelompok. |

Urutan kelompok bukan kewajiban menuntaskan satu kelompok sebelum membuka kelompok lain. Gunakan daftar `prerequisites` pada katalog, khususnya untuk VoIP, VPN, keamanan, dan proyek. Kelas XI/XII adalah rekomendasi, bukan pembagian resmi CP; sekolah menyusun ATP untuk Fase F yang mencakup kedua kelas.

## Perubahan konkret

- Mempertahankan semua ID dan URL modul lama, termasuk penyimpanan progres modul lama.
- Memindahkan virtualisasi sebelum praktik administrasi OS dan layanan.
- Membatasi judul “Layanan Server” menjadi DHCP, DNS, dan remote server; file serta web/hosting dibahas pada modul tersendiri sehingga cakupan tidak berulang.
- Menambahkan nomor urutan, fase, dan prasyarat eksplisit untuk setiap entri. Pengelompokan memakai fase sehingga kelas XI dan XII tidak memecah jalur yang sama.
- Menyediakan tiga modul baru yang benar-benar dapat dibuka: K3LH, perencanaan/dokumentasi, IPv6 dasar. Masing-masing memuat tujuan, konsep, tugas dengan kriteria hasil, serta cek pemahaman yang memberi umpan balik. Ketiganya adalah materi pengantar dan latihan formatif, belum memiliki kedalaman simulator, posttest, atau sertifikat seperti modul lama.
- Menambahkan rencana topik dunia kerja, instalasi kabel/fiber, VoIP, QoS, proxy/load balancing, autentikasi/kriptografi, hardening/IDS/IPS, VPN, hosting/database, dan mail. Entri rencana tetap berstatus `coming-soon` dan tidak diberi tautan halaman kosong.

Setelah perubahan terdapat 37 entri: 12 tersedia dan 25 rencana. Penambahan struktur tidak berarti semua kompetensi tersebut sudah memiliki materi lengkap.

## Prioritas pengembangan berikutnya

1. Lengkapi dunia kerja dan perkembangan teknologi untuk fondasi Fase E: proses bisnis layanan, profesi, kewirausahaan, cloud, IoT, dan perkembangan akses telekomunikasi. Tambahkan asesmen kebutuhan belajar awal.
2. Kembangkan instalasi kabel, routing statis, WLAN, dan keamanan dasar agar jalur praktik LAN dapat dituntaskan.
3. Lengkapi virtualisasi/instalasi OS, pengguna, DHCP/DNS/SSH, dan file server; setiap praktikum harus menyertakan kondisi awal, hasil yang diharapkan, serta pemulihan ketika salah konfigurasi.
4. Lanjutkan routing dinamis, NAT, QoS, fiber, VoIP, layanan hosting/mail/VPN, monitoring dan backup, serta pendalaman keamanan.
5. Uji proyek integrasi dengan rubrik: kesesuaian kebutuhan, rancangan alamat/segmentasi, konektivitas, keamanan, pemulihan, dan dokumentasi. Jangan mengandalkan skor pilihan ganda untuk membuktikan keterampilan instalasi fisik.

Untuk setiap modul berikutnya gunakan pola tujuan terukur → prasyarat → konsep dan contoh → demonstrasi → praktik terpandu → tugas mandiri → evaluasi dengan pembahasan → rangkuman dan tindak lanjut. Simulasi browser perlu menjelaskan batas model dan dilengkapi praktik perangkat/VM jika keterampilan operasional menjadi target.

## Arsitektur dan pemeliharaan

Semua perubahan menggunakan HTML, CSS, JavaScript, dan JSON statis; tidak ada database maupun backend. Database server pada rencana materi adalah objek pembelajaran di lab, bukan ketergantungan aplikasi ini. GitHub Pages tetap dapat melayani halaman dan `fetch` katalog melalui HTTP(S). Membuka berkas langsung melalui `file://` bukan cara pengujian katalog.

Sumber katalog adalah `data/modules.json`; `groupOrder` mengurutkan kelompok, `order` mengurutkan modul dalam kelompok, `phase` mengelompokkan fase, dan `prerequisites` merujuk ID modul. Edit katalog tersebut langsung. Progres latihan baru tidak disimpan; umpan balik tersedia selama halaman dibuka. Tidak ada pengiriman jawaban ke server.

## Acuan

- [CP Teknik Komputer dan Jaringan, BSKAP](https://kurikulum.kemdikbud.go.id/file/cp/smk/117.%20CP%20Mata%20Pelajaran%20Teknik%20Komputer%20dan%20Jaringan.pdf): cakupan perencanaan, jaringan kabel/nirkabel, keamanan, konfigurasi perangkat, dan administrasi sistem. Digunakan untuk memetakan kesenjangan topik; periksa kembali versi CP/ATP yang berlaku di sekolah.
- [Referensi ATP Teknik Komputer dan Jaringan](https://guru.kemendikdasmen.go.id/kurikulum/referensi-penerapan/capaian-pembelajaran/mata-pelajaran/?label=Teknik+Komputer+dan+Jaringan&level=SMK&subject=Teknik+Komputer+dan+Jaringan): Fase F mencakup kelas XI–XII.
- [Materi dasar TJKT pada TKA Kemendikdasmen](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-pilihan/sma/teknik-jaringan-komputer-dan-telekomunikasi-smk-mak): konteks kecakapan kerja dasar, K3LH, dan budaya kerja.
- [RFC 8200: IPv6](https://www.rfc-editor.org/info/rfc8200/), [RFC 4291: arsitektur pengalamatan IPv6](https://www.rfc-editor.org/rfc/rfc4291), [RFC 3849: prefix dokumentasi](https://www.rfc-editor.org/rfc/rfc3849), [RFC 4861: Neighbor Discovery](https://www.rfc-editor.org/rfc/rfc4861): rujukan teknis materi pengantar IPv6.

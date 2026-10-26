# Routing Dinamis OSPF — Fase F, kelas XI

Modul inti pada elemen Konfigurasi Perangkat Jaringan, urutan kelima setelah Routing Statis. Rancangan mengikuti lingkup ATP XI: konfigurasi/pengujian OSPF, diagnosis tetangga serta rute, dan pengenalan BIRD pada router berbasis server. Alokasi JP tetap mengikuti elemen ATP; tidak dibuat alokasi JP modul baru tanpa dasar.

Materi tersedia pada `modules/konfigurasi-jaringan/routing-dinamis/`. Sumber konten: `assets/js/course-dynamic-routing.js`; metadata: `data/routing-dinamis.json`.

## Dua belas tahap

Orientasi; perbandingan routing statis/dinamis; identitas, area, interface, dan neighbor; LSA/LSDB/konvergensi; SPF/cost/jalur setara; konfigurasi perangkat dan BIRD; pengujian/diagnosis/dokumentasi; proyek terapan; laboratorium; game LSA Relay; refleksi; rangkuman/evaluasi akhir.

Enam pembahasan konsep memuat penjelasan, contoh penalaran, tugas transfer, miskonsepsi, serta cek pemahaman. Proyek meminta diagram, pemetaan interface, rancangan identitas/area, perhitungan, konfigurasi berizin, matriks gangguan, backup/rollback, dan bukti uji. Rubrik proyek serta refleksi diperiksa manusia; panjang tulisan tidak dianggap sebagai nilai keterampilan.

Contoh Cisco IOS menyatakan pemetaan interface dan lingkup lab terisolasi. Kerangka BIRD ditujukan pada BIRD 2.x sesuai dokumentasi yang ditautkan, serta menjelaskan bahwa channel kernel dan forwarding OS belum disediakan oleh kerangka tersebut. Konfigurasi browser tidak diklaim sebagai hasil pengujian perangkat/daemon nyata.

## Laboratorium sesuai karakter OSPF

Empat router, lima transit point-to-point area 0, alamat dokumentasi /30, LAN R1 dan R4, cost per arah, serta cost stub LAN 1. Tiga fase pedagogis memisahkan Hello tervalidasi, sinkronisasi yang disederhanakan, dan SPF. Fase bukan detik konvergensi.

Skenario: kondisi dasar; area mismatch; Hello mismatch; transit passive; link R2–R4 putus; isolasi R4; dua jalur sama cost; iklan LAN R4 dimatikan. Parameter kedua ujung link dapat diperiksa/diubah. Router ID R2 dapat diedit untuk menguji identitas tidak unik. Cost per arah dapat berbeda sehingga hasil arah balik dapat berubah tanpa mengubah jalur pergi.

Diagram, alasan neighbor, ringkasan LSDB komponen R1, relaksasi SPF, next-hop router, semua jalur minimum, dan cost pergi/balik ditampilkan. Tidak ada klaim ARP, ping, timer berjalan, DR/BDR, autentikasi, MTU, LSA aging, multi-area, atau pemasangan rute OS telah disimulasikan. Setiap perubahan input membatalkan bukti lama; hanya hasil fase SPF baru yang dapat dicatat pada jurnal.

## Game LSA Relay

Puzzle graf 2D tiga level dengan anggaran transmisi, versi informasi setiap router, gangguan link, dan pembaruan urutan di kedua ujung link yang gagal. Pemain memilih pengirim lalu tetangga penerima untuk menyalin ringkasan pengetahuan satu arah. Pengiriman duplikat tetap memakai anggaran; non-tetangga ditolak tanpa biaya. Pemain harus menyebarkan versi terbaru ke semua router sebelum menjalankan SPF dan mengirim paket model. Jalur/cost akhir benar-benar dihitung pada graf tersisa. Anggaran habis sebelum konsisten menghasilkan gagal; tersedia ulang level/permainan. Semua router dapat dipilih dengan mouse/sentuh maupun Tab dan Enter/Spasi.

Game bukan kuis pilihan ganda, bukan salinan game TTL, dan tidak muncul pada pertemuan lain. Model ringkasan versi per giliran sengaja dibedakan dari paket flooding OSPF yang sebenarnya. Skor 100 hanya disimpan setelah tiga misi selesai.

## Validasi

`tools/dynamic-routing-checks.js` memeriksa fase, cost, jalur alternatif/isolasi, syarat neighbor, ECMP, cost terarah, iklan LAN, penolakan Router ID ganda, pembatalan hasil lama, solusi tiga level, batas anggaran, gangguan/versi baru, keyboard, pengulangan, serta penyimpanan nilai game. Rute dasar bernilai 21; tanpa link 24 bernilai 26; dua jalur minimum pada skenario ECMP; cost game setelah link 12 putus bernilai 41.

`tools/validate-modules-browser.ps1 -OnlyModules routing-dinamis,routing-ipv4` menguji tampilan dan aktivitas, termasuk regresi modul pendahulu. `tools/validate-completion-browser.ps1 -OnlyModules routing-dinamis` menjalankan 12 tahap dari progres kosong melalui kontrol sebenarnya sampai sertifikat, PDF satu halaman, cetak ulang setelah reload, dan penolakan skor akhir di bawah 80. Profil browser uji terpisah dari browser siswa. Hasil terpilih tersedia pada `docs/module-validation-browser-focused.json` dan `docs/completion-validation-focused.json`.

Sertifikat memakai panel bersama dan desain TJKT terbaru. Situs tetap statis tanpa database; progres/jurnal disimpan lokal dan jurnal dapat diekspor.

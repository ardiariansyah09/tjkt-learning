# Pemisahan aktivitas modul dan proyek gabungan

Tanggal: 30 Oktober 2026. Lingkup perubahan: sumber lokal. Tidak ada aktivasi rilis atau perubahan produksi pada iterasi ini.

## Hasil yang sudah diterapkan

1. Ruang `projek-gabungan.html` terpisah, dapat dibuka dari katalog. Dua proyek tersedia: layanan server dan pengamanan; VM, jaringan dan pemulihan layanan. Masing-masing memiliki enam tahap, modul bekal, produk akhir serta catatan per tahap. Proyek tidak menciptakan nilai kompetensi otomatis.
2. Modul tidak lagi memasang panel tambahan `service-security` pada setiap laboratorium. Materi keamanan yang langsung terkait topik tetap ada, sedangkan penambahan produk lintas modul dari adaptor keamanan tidak lagi dipasang ke setiap kasus/refleksi/evaluasi.
3. Papan instalasi dua OS, volume, jaringan, paket, layanan, patch dan recovery tidak lagi dipasang sebagai lab utama Administrasi Linux/Windows. Bab lab menjadi praktik satu operasi administrasi; installer dan terminal tetap tersedia pada tempatnya. Papan lama tidak dihapus dari repository dan catatan peserta tidak dihapus.
4. Bagian kasus pada modul yang menjadi bekal proyek diarahkan pada tugas satu objek/satu konsep. Penggabungan kompetensi ditautkan ke ruang proyek. ID tahap, bank soal, skor dan ambang kelulusan tidak diganti.
5. Pilihan terminal dipersempit menurut topik: modul pengguna tidak lagi menumpuk SSH dan firewall; modul layanan tidak sekaligus menambahkan UFW dan Fail2ban. Keduanya tetap tersedia pada keamanan/hardening.
6. Sebelas toolbar model konsep yang memuat sedikitnya enam tindakan diganti penyajiannya menjadi satu pemilih operasi dan tombol Jalankan. Handler serta state model tetap dipakai. Ini pengurangan kepadatan kontrol, belum perombakan seluruh mesin aktivitas. Kontrol game dan antarmuka simulator aplikasi tidak diproses oleh aturan tersebut.
7. Field simulasi telekomunikasi mengikuti sistem yang dipilih: parameter seluler tidak ditampilkan pada microwave/VSAT dan sebaliknya.
8. Model konsep diberi penanda yang membedakannya dari antarmuka aplikasi asli. Tampilan ringkas tidak diperlakukan sebagai bukti kesetaraan produk.

## Batas yang belum diselesaikan

Pekerjaan ini belum memenuhi seluruh permintaan kesetaraan tampilan dan perilaku asli. Jangan menyatakan semua simulasi sekarang identik dengan aplikasi nyata atau seluruh game sudah selesai ditinjau secara pedagogis.

| Bagian | Status yang dapat dibuktikan | Pekerjaan lanjutan |
| --- | --- | --- |
| VM dasar dan installer | Pengelola VM rekonstruksi; tiga alur installer; guard disk/media; desktop, subset terminal dan snapshot diuji | Wizard VirtualBox dan Workstation belum seluruhnya berbeda seperti produk; seluruh pilihan installer, perangkat dan error produk belum dimodelkan |
| Proxmox/ESXi | Screenshot asli bersumber, penjelasan menu dan prosedur; lab kapasitas/recovery konsep | Belum simulator interaktif Host Client/Proxmox dengan seluruh alur, validasi konfigurasi dan error sesuai produk |
| Linux/CMD/PowerShell | Parser/state terbatas, command yang didukung dijelaskan; hak dan error model diuji | Belum shell OS asli, pipeline lengkap, seluruh perintah, layanan/kernel/NTFS atau jaringan sungguhan |
| Simulasi layanan/perangkat lain | Aktivitas topik serta model sebab-akibat; kepadatan toolbar dikurangi | Perlu peninjauan per alat/versi, penggantian model tombol yang mengaku praktik konfigurasi, dan pembandingan hasil dengan perangkat/VM referensi |
| Game | Kontrol dan penyimpanan skor lama dipertahankan | Game yang masih menggabungkan beberapa kompetensi perlu desain ulang menjadi satu tujuan modul atau dipindah ke proyek dengan migrasi syarat kelulusan yang benar; tidak boleh sekadar menghapus tahap wajib sehingga sertifikat terhalang |
| Proyek | Tahap, modul bekal dan penyimpanan browser terpisah | Belum rubrik/verifikasi guru atau integrasi database LMS baru; halaman ini hanya lokal sesuai instruksi |

## Kriteria penerimaan untuk praktikum produk

- Tentukan produk, versi/build, edisi, platform host dan kondisi awal. Kesamaan dinilai terhadap profil tersebut, bukan janji universal.
- Cocokkan layar, istilah, urutan wizard, navigasi keyboard, validasi, konfirmasi, persistensi dan kegagalan dengan profil produk.
- Uji satu fungsi per modul: konfigurasi yang disimpan versus diterapkan, proses aktif versus startup, request versus response serta hasil setelah reload/reboot.
- Bandingkan hasil/command dengan VM atau perangkat referensi. Screenshot saja membuktikan tampilan, bukan perilaku.
- Bila suatu perilaku tidak didukung simulator, nyatakan batasnya. Jangan mengembalikan sukses palsu atau memberi nilai praktik nyata berdasarkan model.
- Integrasi lintas layanan dilakukan pada proyek, tanpa memaksa siswa mengulang kompetensi modul lain pada setiap materi.
- Pertahankan ID/kunci progres dan hasil lama. Pemindahan tahap wajib/game memerlukan pemetaan yang diuji agar pengguna lama tidak kehilangan sertifikat dan pengguna baru tetap memiliki jalur lulus yang sah.

## Pengujian iterasi ini

- Audit browser 56 modul: tidak ada panel `service-security` tambahan yang menumpuk, lab dua OS gabungan tidak dipasang pada modul, 11 palet operasi terpasang.
- Proyek diuji untuk navigasi, simpan, reload, layar 390 piksel, serta perbandingan nilai seluruh key modul sebelum/sesudah; data modul tetap sama.
- Palet operasi diuji agar handler asli dijalankan, status disabled diikuti, pemasangan berulang tidak membuat duplikat, dan kontrol game tidak diubah.
- 167 pemeriksaan sumber/kompatibilitas VM, 205 pemeriksaan terminal dan 46 pemeriksaan model ATP lulus. Definisi modul fondasi serta soal terkait tidak diubah.
- Pengujian ini bukan pembandingan seluruh 56 modul dengan semua produk asli dan bukan uji penerbitan ulang semua sertifikat di server.

Artefak: `activity-scope-browser-validation.json`, `activity-operations-validation.json`, `vm-local-update-validation.json`, `terminal-lab-validation.json`, `atp-practice-validation.json`.

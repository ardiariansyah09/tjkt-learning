# File Server dan Berbagi Sumber Daya — Fase F kelas XI

Modul inti Administrasi Sistem Jaringan dengan prasyarat DHCP, DNS, dan Remote Server. Kategori, urutan, peran inti dan JP ATP dipertahankan. Halaman `modules/administrasi-server/file-server/`; sumber `assets/js/course-file-share.js`; metadata `data/file-server.json`.

## Materi

Dua belas tahap mengikuti kerangka bersama: orientasi; file sharing/SMB/namespace; identitas/share/filesystem; konfigurasi Samba/uji klien; sesi/draft/lock; kapasitas/quota/backup; diagnosis/penerimaan; proyek; laboratorium; game; refleksi; evaluasi. Tiap konsep mempunyai contoh, tugas transfer, miskonsepsi dan cek pemahaman. Ada fragmen Samba, inspeksi testparm/smbclient serta padanan inspeksi Windows. Konfigurasi produk nyata harus dilengkapi identitas, path, izin, versi dan kebijakan yang sesuai; bukan langsung diterapkan pada jaringan sekolah.

Referensi primer Ubuntu dan Microsoft tersedia pada modul. Materi membedakan share dari path, pemetaan drive dari disk baru, Samba standalone identity dari akun Unix saja, share permission dari filesystem, signing dari encryption, cache/leases dari lock eksklusif aplikasi, quota dari kapasitas, serta snapshot/RAID dari backup terpisah. Printer disebut sebagai sumber daya terpisah, bukan dianggap file share dengan driver otomatis.

Proyek menghasilkan peta share/path/volume, matriks akun/grup/operasi, kapasitas/quota, prosedur kolaborasi dan rencana pemulihan file/ACL/config. Rubrik diperiksa manusia; skor otomatis tidak menggantikan demonstrasi VM berizin.

## Laboratorium

Satu file laporan.txt awal 4 MiB pada share Proyek di files.lab.test. Klien 1 Editor, klien 2 Reader secara default. Opsi peran sesi baru klien 2 memungkinkan percobaan dua Editor; sesi lama harus ditutup/dihubungkan ulang agar peran baru dipakai. Credential tidak valid membatasi koneksi baru, tidak otomatis mencabut sesi lama model.

Hubungkan → Baca → Checkout → Simpan → Tutup editor. Checkout membuat draft +2 MiB dan lock aplikasi; tidak mengubah file server. Save mengubah generasi/isi/ukuran file jika role, share write, filesystem write, quota dan kapasitas memenuhi. Save tidak langsung melepas lock. Reader tidak boleh checkout. Dua Editor diuji terhadap lock yang sama; normal close/disconnect melepas lock sendiri dan membuang draft tersisa. Gangguan jaringan nyata dan durable handles tidak dimodelkan.

Backup/restore adalah kewenangan administrator model, terpisah dari role klien. Backup satu file berada pada lokasi off-host abstrak; bukan salinan ACL/config/OS. Restore ditolak selama ada lock dan mempertahankan nomor generasi monoton meskipun isi lama dipulihkan. Pemeriksaan versi dasar draft mencegah penerapan draft lama pada model. Baca ulang diperlukan untuk membuktikan isi pulih.

Konfigurasi jaringan/nama/share/credential, write share/filesystem, quota dan kapasitas dapat divariasikan. Edit parameter membatalkan bukti, tidak otomatis mengakhiri sesi. Quota dan kapasitas hanya batas satu file, bukan seluruh pemakaian user/disk. Tidak ada SMB, enkripsi, filesystem, login, token, ACL, cache offline atau backup nyata. Reset mengembalikan sesi/file/salinan model, bukan jurnal/progres belajar. Tiga eksperimen dicatat lewat jurnal bersama.

## Storage Allocator

Puzzle kartu file dengan ukuran/zona, volume Internal/Publik dan volume pengganti saat pemulihan. Pemain memakai kartu/tombol atau drag; Tab/Enter menjadi alternatif. Placement, snapshot lokal, backup off-host, restore dan uji memakai tindakan; pemilihan kartu gratis. Tidak ada soal pilihan ganda, game hanya di tahap game.

Level 1: internal 4+2 MiB pada volume 6, publik 4 pada volume 4. Level 2: internal 5+3 pada 8 dan publik 4+2 pada 6. Level 3: internal 4+4 pada 8 dan publik 3+3 pada 6; off-host repository 8 dan pengganti internal 8. Uji pertama level 3 menghilangkan volume internal asal serta snapshot di sana; backup kedua file internal harus tersedia. Restore ke volume pengganti dan uji ulang membuktikan penerimaan model. Volume pengganti tidak dapat dipakai sebelum gangguan. Snapshot lokal saja menyebabkan kegagalan, bukan skor kelulusan.

Ada budget 9/12/18 tindakan, solusi 4/5/10 tindakan, gagal, ulang level/permainan dan skor 100 setelah ketiga misi. Zona/angka adalah aturan puzzle, bukan implementasi ACL/storage nyata.

## Pemeriksaan

`tools/file-share-checks.js` memeriksa sesi/peran, draft/server, lock/close, backup/restore, dua lapis write, quota/kapasitas, credential baru versus sesi lama, jaringan, zona/kapasitas game, snapshot hilang, backup/restore, larangan pengganti sebelum gangguan, drag dan solusi tiga level. Pemeriksaan terdaftar dalam harness topik/game bersama. Evaluasi sepuluh soal memakai ambang 80 dan sertifikat bersama.

Hasil 26 Oktober 2026: validasi statis 40 modul dan ATP lolos. Browser menguji File Server dan FTP, masing-masing 12 tahap pada desktop/ponsel dan tema terang/gelap, tanpa error dan style parity benar. Alur baru File Server menyelesaikan 12 tahap melalui kontrol aktual sampai sertifikat, PDF satu halaman, cetak ulang setelah reload serta penolakan sertifikat di bawah ambang nilai. Katalog kini 40 terbit dan 13 belum dibuat. Belum dilakukan deployment.

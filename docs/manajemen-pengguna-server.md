# Manajemen Pengguna dan Hak Akses — Fase F kelas XI

Modul mengikuti Administrasi Linux dan Windows Server pada kategori Administrasi Sistem Jaringan. Peran kurikulum, urutan, prasyarat dan JP ATP dipertahankan. Halaman `modules/administrasi-server/manajemen-pengguna-server/`, sumber `assets/js/course-access.js`, metadata `data/manajemen-pengguna-server.json`.

## Materi

Dua belas tahap: orientasi; identitas/autentikasi/otorisasi/audit; siklus akun/grup; mode Linux/direktori; ACL Linux/mask; token Windows/DACL/share; pengujian/pencabutan; proyek; laboratorium; game; refleksi; evaluasi. Setiap konsep mempunyai penjelasan, contoh, tugas transfer, miskonsepsi dan cek pemahaman. Proyek meminta matriks izin, siklus akun, identitas proses layanan, rollback serta uji positif/negatif. Materi ACL/mask dan inheritance Windows dipelajari melalui contoh/proyek serta usulan praktik VM; keduanya tidak diklaim disimulasikan penuh di browser.

Rujukan primer Linux man-pages, Ubuntu dan Microsoft. Materi membedakan kelas owner/group/other dari ACL, mask dari owner/other, file write dari penghapusan entri direktori, token dari keanggotaan direktori, izin lokal dari SMB serta explicit dari inherited ACE. Pernyataan umum “Deny selalu menang” tidak dipakai untuk seluruh algoritme Windows.

## Laboratorium izin

Linux: memilih kelas owner/group/other tanpa fallback, bit baca/tulis isi file yang sudah ada, traversal seluruh induk, serta akun aktif untuk sesi baru model. Windows: dua bit baca/tulis isi, union Allow, Deny eksplisit sederhana dan irisan share ketika remote. Kontrol yang tidak relevan disembunyikan/dinonaktifkan. Input berubah membatalkan bukti; hasil baru menampilkan jalur keputusan. Tiga percobaan disimpan melalui jurnal bersama.

Batas dinyatakan pada aktivitas: tidak ada OS/filesystem/login nyata; tidak menghitung capability/root, ACL/mask Linux, setgid/sticky, create/delete, symlink, read-only mount, urutan ACE umum, pewarisan, privilege Windows atau policy. Read + Write model bukan seluruh Modify Windows. Nonaktif berarti sesi baru model ditolak; sesi lama nyata belum tentu berhenti ketika akun dinonaktifkan. Data akun siswa, password dan token nyata tidak dikumpulkan.

## Access Weaver

Game puzzle koneksi tiga orang ke grup. Target hak tiap orang tertera pada matriks; koneksi mengubah keanggotaan direktori, sedangkan sesi tetap lama sampai refresh. Pemain memasang/mencabut koneksi dan menguji matriks dalam budget tindakan. Keanggotaan berlebih ditolak meskipun union hak sama; maksimal satu grup per orang adalah aturan optimasi game, bukan aturan universal server.

Level 1 membangun hak dari kosong; level 2 mengaudit kelebihan akses; level 3 merotasi tugas dan mencabut grup tamu. Ada kondisi gagal saat budget habis, reset per level/permainan, kontrol klik/Tab/Enter, status dan matriks hasil. Skor 100 hanya diberikan setelah tiga level. Tidak ada soal pilihan ganda di game; game hanya muncul di tahap game. Model game memakai union grup tanpa Deny atau ACL filesystem.

## Validasi

`tools/access-checks.js` memeriksa owner tanpa fallback, grup/other, read/write, traversal induk, akun nonaktif model, share lokal/remote, explicit Deny, pembatalan bukti, sesi lama, solusi tiga puzzle dan kegagalan budget. Pemeriksaan terdaftar dalam harness topik serta game bersama. Evaluasi akhir sepuluh soal memakai ambang 80 dan mekanisme sertifikat bersama; skor otomatis tidak menggantikan penilaian proyek/praktik oleh guru.

Hasil 26 Oktober 2026: validasi statis 37 modul serta ATP lolos. Browser menguji modul ini dan Administrasi Linux/Windows, masing-masing 12 tahap pada desktop/ponsel dan tema terang/gelap, tanpa error dan dengan style parity. Alur baru modul ini menyelesaikan 12 tahap melalui kontrol aktual hingga sertifikat, PDF satu halaman, cetak ulang setelah reload serta penolakan sertifikat ketika nilai akhir di bawah ambang. Katalog kini 37 terbit dan 16 belum dibuat. Perubahan tersedia di workspace; belum dideploy.

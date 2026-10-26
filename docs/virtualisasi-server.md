# Virtualisasi Server Dasar — Fase F kelas XI

Modul pendukung pada elemen Administrasi Sistem Jaringan, urutan kedua dengan prasyarat Dasar Administrasi Server. Peran `pendukung` dan JP elemen dipertahankan. Materi mempersiapkan lab sebelum administrasi Linux/Windows lebih lanjut.

Halaman: `modules/administrasi-server/virtualisasi-server/`. Konten: `assets/js/course-virtualization.js`. Metadata: `data/virtualisasi-server.json`.

## Dua belas tahap

Orientasi; host/guest/hypervisor; RAM/vCPU/storage; definisi/media/boot/shutdown; jaringan VM; snapshot/clone/archive/restore; runbook/penerimaan; proyek; laboratorium; game Hypervisor Dock; refleksi; evaluasi akhir.

Tiap konsep mempunyai penjelasan, contoh, tugas transfer, miskonsepsi, dan cek pemahaman. Proyek meminta inventaris host/guest, resource/pertumbuhan, diagram jaringan/isolasi, identitas clone, tiga eksperimen, cakupan snapshot/archive, serta restore yang diuji. Rubrik proyek/refleksi diperiksa manusia.

Rujukan primer: Oracle VirtualBox 7.2 tentang jaringan/pengelolaan/CLI serta Red Hat manajemen VM. Materi menyatakan batas tiap platform, perbedaan NAT biasa dan NAT Network, internal satu host, vCPU versus CPU fisik, serta media/template versus installer. Contoh VBoxManage berupa inspeksi, bukan perintah yang dijalankan situs.

## Laboratorium dua VM

Host RAM 16 GiB dengan cadangan 4, RAM VM aktif maksimal 12, CPU fisik model 4, pool disk VM 64 GiB di luar storage OS host. VM A berasal dari template OS/aplikasi siap, slot B kosong. RAM tidak diovercommit pada model; vCPU dapat diberi peringatan atau ditolak menurut kebijakan start baru. Tidak ada klaim performa setara jumlah vCPU.

Konfigurasi OFF meliputi RAM/vCPU, virtual disk, dynamic/fixed, mode NIC/segmen, IP guest model, serta forward NAT lokal. Disk fisik tetap terpakai ketika VM OFF. Dynamic memakai data/delta kasar, fixed mereservasi kapasitas. Write guest dapat gagal walaupun virtual capacity masih tersisa jika pool host penuh. Draft yang gagal tidak diterapkan. Clone gagal karena ruang tidak mengubah konfigurasi slot tujuan.

Power ON dibedakan dari guest OS siap. VM disk kosong memerlukan media serta pemuatan image latihan model. Operasi tersebut bukan installer OS nyata. Perubahan hardware/NIC sengaja dilakukan OFF; hot-plug tidak dihitung.

Jaringan: NAT biasa per VM, host-only, internal, bridged. Alamat dipreset sebagai asumsi dataset, bukan konfigurasi guest otomatis oleh hypervisor nyata. NAT biasa dapat memberi alamat privat sama pada ruang berbeda tanpa menjadikannya peer. Forward 127.0.0.1:18080/18081 hanya dari host, tidak otomatis dari LAN. Host diasumsikan terhubung ke host-only; internal tidak menyertakan host, serta membutuhkan nama jaringan sama pada host yang sama. Bridged mengasumsikan LAN mengizinkan VM. Firewall/routing tambahan tidak dihitung.

Clone membuat MAC slot baru tetapi static IP/data guest tersalin. Konflik IP diperiksa pada jaringan L2 bersama saat kedua guest berjalan; konsol guest dibedakan dari uji jaringan. Arah uji: host, LAN fisik, peer, outbound, atau konsol layanan.

Satu snapshot disk offline mencatat data/OS/IP guest dan baseline penggunaan fisik, bukan RAM/hardware. Append menambah logical used/delta; overwrite model menambah delta meskipun logical used tetap. Restore membuang cabang perubahan kini pada model satu titik; merge mempertahankan data kini. Waktu/temp-space/format disk nyata tidak dihitung.

Archive image/config kini berada pada repository off-host abstrak, tidak membawa snapshot history/RAM. Keberadaan archive belum membuktikan isinya sehat. Host loss menghilangkan image serta snapshot lokal dan menghentikan semua VM, tetapi archive tetap. Host pengganti saja tidak memulihkan image. Restore archive, boot, dan uji layanan dapat menandai bukti pemulihan; sumber serta cakupan uji tetap dicatat.

Jurnal menyimpan operasi, konfigurasi, resource, image/guest, cakupan titik, serta hasil uji yang relevan. Reset mengembalikan skenario/image/snapshot/archive sesi model, bukan jurnal/progres belajar. Tidak ada hypervisor, file image, network bridge, installer, atau backup nyata yang dibuat di komputer pengguna.

## Hypervisor Dock

Game placement 2D tiga level dengan kartu VM, dua host, reservasi rencana boot RAM/vCPU, NIC Internal/NAT, IP guest, snapshot lokal, dan archive off-host. Pemain menyeret kartu ke host atau memakai kartu/tombol dengan Tab/Enter. Resource game mereservasi rencana boot termasuk VM OFF; ini dibedakan dari RAM aktif pada model laboratorium.

Level 1 menguji packing dan network. Level 2–3 menempatkan VM awal di A; boot valid pertama memicu kehilangan storage A. Snapshot/image lokal yang terkena hilang. Archive off-host yang tidak tersedia menyebabkan gagal; bila tersedia, restore image dan tempatkan pada B yang masih hidup serta cukup kapasitas, kemudian uji lagi. VM yang sudah ON tidak dipindah/diubah secara langsung, sehingga game tidak mengklaim live migration.

Level 3 mempunyai static IP clone sama. Konflik internal diperiksa hanya pada host/segmen yang sama; internal pada host berbeda tidak otomatis satu jaringan. Tombol IP unik memilih alamat yang belum dipakai VM lain, termasuk ketika image dipulihkan ke host yang sama dengan guest sehat yang tetap berjalan. Archive bisa membawa NIC/IP yang lama sehingga hasil restore tetap perlu diperiksa.

Ada batas tindakan, kondisi gagal, ulang level/permainan, serta penyimpanan skor 100 setelah tiga misi. Ini bukan game pilihan ganda dan hanya muncul pada tahap game. Operasi/cakupan backup serta kapasitas merupakan aturan permainan, bukan hypervisor/DR nyata.

## Validasi

`tools/virtualization-checks.js` memeriksa RAM reserve/admission, perubahan OFF, vCPU warning/strict policy, virtual versus physical disk, fixed allocation, thin pool exhaustion, NAT/forward/host-only/internal, segmen berbeda, clone MAC/IP, snapshot overwrite growth/rollback, snapshot disk kosong sebelum/sesudah pemuatan OS, kehilangan host, serta restore archive yang diuji.

UI menguji draft dan pembatalan bukti, mode/arah akses, konflik IP serta perbaikan, snapshot/app recovery, host loss, archive, serta bukti restore. Game diuji untuk drag placement, kapasitas berlebih, solusi tiga level, network/identitas, host loss, restore, ulang, dan persistensi nilai. Solusi positif tidak memakai cheat nilai; nilai disimpan oleh callback game setelah misi selesai.

Browser terpilih mencakup Virtualisasi dan regresi Dasar Administrasi Server pada desktop/ponsel serta tema terang/gelap. Seluruh 12 tahap Virtualisasi diuji dari progres kosong melalui kontrol sebenarnya hingga formulir sertifikat, PDF satu halaman, cetak ulang setelah reload, dan penolakan nilai akhir di bawah 80. Profil sementara tidak mengubah progres siswa.

Laporan: `docs/module-validation-browser-focused.json` dan `docs/completion-validation-focused.json`. Situs tetap statis tanpa database/login; progres dan jurnal lokal dapat diekspor.

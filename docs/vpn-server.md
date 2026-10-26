# VPN dan Akses Jarak Jauh Aman — Fase F kelas XI

Modul inti Administrasi Sistem Jaringan. Prasyarat DHCP/DNS/Remote Server, Routing Statis dan Manajemen Pengguna dipertahankan bersama urutan, kategori dan JP ATP. Halaman `modules/administrasi-server/vpn-server/`; sumber `assets/js/course-vpn.js`; metadata `data/vpn-server.json`.

## Materi

Dua belas tahap mengikuti kerangka bersama. Enam konsep: tunnel/remote-access/site-to-site; identitas/key/endpoint; route OS/AllowedIPs/firewall; forwarding/rute balik/overlap; split/full/DNS/IPv6/down; implementasi/pencabutan/penerimaan. Ada contoh, tugas transfer, miskonsepsi, cek pemahaman dan proyek dengan rubrik manusia. Referensi primer WireGuard dan Ubuntu.

Fragmen peer WireGuard berisi public-key placeholder dan endpoint alamat dokumentasi, bukan konfigurasi lengkap siap dipasang. Materi membedakan route OS dari AllowedIPs dan perilaku helper, pemetaan tujuan keluar dari validasi sumber masuk, handshake dari hak aplikasi, default IPv4 dari IPv6, NAT dari rute balik serta fail-closed dari ketersediaan layanan. Private key tidak dibuat atau diminta situs.

## Laboratorium

Klien 10.8.0.2 → gateway 10.8.0.1 → LAN 192.168.50.0/24/server .10. Endpoint 203.0.113.10:51820 hanya contoh dokumentasi. Model membandingkan endpoint/UDP/key/revocation/interface, handshake, preset route OS, pemetaan tujuan AllowedIPs, forwarding, firewall, rute balik/SNAT, DNS, overlap dan /32 server.

Gateway tunnel dapat lolos saat forwarding LAN gagal. LAN memerlukan rute balik atau SNAT alternatif dataset. Egress publik IPv4 model memakai SNAT dan jalur Internet gateway yang diasumsikan siap. Overlap connected /24 lokal diprioritaskan menurut metric dataset; /32 hanya untuk server .10. Tidak mengklaim seluruh policy routing platform sama.

Full hanya IPv4. IPv6 dapat langsung atau diblokir, tidak ditunnelkan. Saat interface up tetapi handshake gagal, route tetap dapat memilih VPN dan request gagal. Saat interface down, preset membuka WAN alternatif bila kill switch tidak aktif; kill switch memblokir alternatif itu. Ini bukan implementasi firewall lengkap atau leak test Internet nyata. DNS gagal dibedakan dari tunnel gagal. Perubahan peer/interface membatalkan handshake; semua edit membatalkan bukti. Reset mengembalikan sesi model, bukan jurnal/progres belajar. Tiga percobaan dicatat lewat jurnal bersama.

Tidak ada VPN, key, kriptografi, socket, DNS, Internet atau autentikasi nyata. Handshake boolean tidak mengukur freshness/timer. AllowedIPs incoming/source validation, MTU, policy routing penuh, NAT keepalive, IPv6 tunnel dan otorisasi aplikasi dibahas sebagai batas/kelanjutan, bukan diklaim disimulasikan.

## Tunnel Switchboard

Game matriks jalur tiga kartu trafik: internal, public4 dan public6. Pemain menghubungkan VPN/langsung/blokir serta mengatur izin layanan, rute balik dan kill switch. Ini puzzle kebijakan stateful, tanpa soal pilihan ganda. Klik/Tab/Enter tersedia dan setiap perubahan/uji memakai tindakan.

Level 1 split mengharuskan internal VPN, publik4/6 langsung sesuai kebijakan misi. Level 2 full IPv4 mengharuskan internal/public4 VPN dan public6 blokir. Level 3 menambahkan gangguan interface down setelah uji valid pertama; uji kedua harus membuktikan kill switch aktif. HUD menampilkan rencana dan jalur efektif saat down. Fail-closed berarti trafik terhenti, bukan konektivitas tetap berhasil. Ada budget 12/14/16, gagal, ulang level/permainan serta skor 100 setelah tiga misi. Solusi uji memakai 4 tindakan tiap level.

## Pemeriksaan

`tools/vpn-checks.js` memeriksa handshake/prasyarat, forwarding gateway versus LAN, rute balik/SNAT, AllowedIPs, overlap/host route, full egress, IPv6, fallback/fail-closed, key/revocation/UDP, DNS terpisah, bukti lama, budget, solusi tiga level dan kontrol UI. Pemeriksaan terdaftar pada harness topik/game bersama. Evaluasi akhir sepuluh soal ambang 80 memakai sertifikat bersama; penilaian praktik VPN nyata serta proyek tetap oleh guru.

Hasil 26 Oktober 2026: validasi statis 43 modul dan ATP lolos. Browser menguji VPN serta Panel Hosting, masing-masing 12 tahap pada desktop/ponsel dan tema terang/gelap, tanpa error serta style parity benar. Alur baru VPN menyelesaikan 12 tahap melalui kontrol aktual sampai sertifikat, PDF satu halaman, cetak ulang setelah reload serta penolakan sertifikat di bawah ambang nilai. Katalog kini 43 terbit dan 10 belum dibuat. Belum dilakukan deployment.

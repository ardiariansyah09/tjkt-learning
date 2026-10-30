import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const q=(question,options,answer,explanation)=>({question,options,answer,explanation});
const chapter=(id,title,paragraphs,question)=>({id,title,summary:title,html:paragraphs.map(p=>`<p>${p}</p>`).join(''),questions:[question]});
const lab=(os,session)=>`<section class="foundation-lab"><h3>Praktik VM dan installer di browser</h3><p>Mulai dengan New, siapkan VM dan ISO, Start, lalu ikuti installer sampai boot dari disk. Ubah satu keputusan untuk mengamati penyebab gagal. Sesi disimpan otomatis untuk latihan ini; sandi latihan tidak disimpan.</p><div data-virtual-lab data-os="${os}" data-session="${session}"></div></section>`;
for(const id of ['virtualisasi-server-dasar','instalasi-komputer-dasar']){
 const c=read(`data/${id}.json`);if(!c.legacyChapters)c.legacyChapters=structuredClone(c.chapters);
 const old=Object.fromEntries(c.legacyChapters.map(ch=>[ch.id,structuredClone(ch)]));
 const vm=id==='virtualisasi-server-dasar';
 if(vm){
  c.chapters=[old.orientasi,
   chapter('host-resource','Merencanakan resource host dan guest',[
    'Host model memiliki 16 GiB RAM, 8 CPU logis dan pool disk 256 GiB. Sisihkan 4 GiB RAM bagi host sehingga guest aktif bersama tidak melebihi 12 GiB pada kebijakan konservatif lab. vCPU tidak menciptakan inti fisik baru. Model tidak mengukur penjadwalan, swap, ballooning atau performa nyata.',
    'Latihan: buat dua VM RAM 8 GiB dan coba nyalakan bersamaan. Amati penolakan guest kedua. Matikan satu guest, turunkan alokasi agar total tidak melebihi 12 GiB dan ulangi. Bandingkan RAM per guest dengan RAM guest aktif total, bukan hanya ukuran satu VM.',
    'Disk model menggunakan reservasi kapasitas konservatif, bukan perhitungan thin provisioning nyata. Rencana empat guest 64 GiB tepat mengisi pool 256 GiB model tetapi belum menyediakan cadangan pertumbuhan di lingkungan nyata. Nyatakan batas ini dalam laporan.'
   ],q('Dua guest masing-masing 8 GiB pada host 16 GiB dengan reserve 4 GiB ...',['Dapat ditolak berjalan bersama pada kebijakan model','Selalu cukup karena virtual','Menghasilkan 16 GiB RAM tambahan'],0,'Total guest 16 melebihi jatah 12; ukuran virtual tidak menambah RAM fisik.')),
   chapter('virtualbox-new','Praktik membuat VM di VirtualBox',[
    'Pilih tampilan VirtualBox, New, nama VM unik, jenis guest dan ISO. Periksa Memory, Processors, disk, UEFI serta adapter jaringan. Wizard model menyatukan pengaturan penting; dialog produk asli dapat terbagi menjadi beberapa halaman.',
    'Untuk latihan Ubuntu gunakan profil Ubuntu dan ISO Ubuntu. Buat disk kosong 64 GiB, RAM 4 GiB serta 2 vCPU. Pilih Internal Network dengan nama kelas-x. Guest belum mempunyai OS meskipun tercatat pada daftar. Klik Start untuk masuk installer, bukan menganggap tombol Create sudah memasang OS.',
    'Bukti: nama VM, profil, ISO, resource dan keadaan Powered off sebelum Start. Pada praktik produk asli gunakan instalasi manual untuk memahami pilihan installer; unattended installation adalah jalur berbeda.'
   ],q('Setelah Create VM dengan disk kosong, bukti yang belum ada adalah ...',['Nama VM','Ukuran RAM rencana','OS terpasang serta boot dari disk'],2,'Membuat definisi VM tidak sama dengan menginstal OS.')),
   chapter('vmware-new','Praktik membuat VM di VMware Workstation',[
    'Ubah tampilan ke VMware Workstation lalu Create a New Virtual Machine. Buat guest kedua dengan nama berbeda. Isi profil OS, disk, memory, processors, optical media dan network. Ini Workstation untuk desktop, bukan ESXi yang dipelajari kelas XI.',
    'Gunakan pengaturan setara dengan guest pertama dan bandingkan lokasi/fungsi pengaturan. LAN Segment pada tampilan latihan memodelkan jaringan internal guest; Host-only mencakup host pada konsep produk, sedangkan NAT memberi arah akses yang berbeda. Jangan menyamakan semua opsi hanya dari letak tombol.',
    'Catat bahwa perubahan tab platform simulator hanya mengganti tampilan dari state lab yang sama; itu bukan konversi file VDI/VMDK atau migrasi lintas hypervisor nyata. Praktik nyata perlu memeriksa dukungan image, firmware, perangkat dan guest tools.'
   ],q('VMware Workstation dan VMware ESXi ...',['Adalah satu produk dengan layar sama','Mempunyai konteks pengelolaan berbeda; Workstation dasar di X, hypervisor server lanjutan di XI','Tidak dapat menjalankan guest'],1,'Pembelajaran berlanjut dari pengelola desktop ke pengelola host server.')),
   chapter('hardware-media','Settings, ISO, firmware dan boot guest',[
    'Settings pada model hanya diubah ketika VM OFF. Periksa optical media; Empty pada disk tanpa OS menghasilkan No bootable medium. ISO berbeda profil juga ditolak dalam skenario lab agar target pembelajaran jelas, bukan klaim semua hypervisor selalu menolak ISO lintas nama guest.',
    'Profil Windows memerlukan 4 GiB RAM, 2 vCPU, disk minimal 64 GiB dan konfigurasi UEFI/TPM/Secure Boot yang sesuai kebutuhan latihan. Kesesuaian CPU serta perangkat grafis asli tidak diemulasikan. Profil Ubuntu memakai batas konservatif latihan 4 GiB, 2 vCPU dan disk 25 GiB.',
    'Coba media Empty, media salah lalu media sesuai; baca pesan dan perbaiki satu variabel. Setelah OS terpasang, lepaskan ISO dan mulai guest dari disk. Jika kembali ke installer, periksa media serta boot source sebelum memasang ulang.'
   ],q('Guest disk kosong menampilkan No bootable medium. Tindakan pertama ...',['Periksa ISO/media dan boot; pasang media yang sesuai saat guest OFF','Menghapus data host','Mengganti DNS'],0,'Boot medium mendahului konfigurasi guest dan aplikasi.')),
   old.jaringan,
   chapter('guest-install','Instalasi guest dan verifikasi boot tanpa ISO',[
    'Mulai VM dari ISO untuk membuka installer Ubuntu atau Windows. Ikuti bahasa, keyboard, pilihan instalasi, disk dan tahap akun sesuai profil. Try Ubuntu menjalankan sesi live tanpa menginstal disk; gunakan Install Ubuntu untuk kembali.',
    'Tinjau Disk 0 virtual kosong. Disk 1 DATA latihan harus dipertahankan dan penulisan ke sana ditolak model. Setelah ringkasan dikonfirmasi, ikuti fase penyalinan, lepaskan ISO, Restart dan selesaikan pengaturan awal. Konsol akan menunjukkan boot source disk.',
    'Masuk desktop model bukan menjalankan kernel asli. Buktikan OS, akun, partisi dan versi berkas model lalu catat perbedaan dengan OS sungguhan. Detail installer dipelajari lebih lanjut pada modul Instalasi dan Konfigurasi Dasar Sistem Komputer.'
   ],q('Try Ubuntu berhasil tetapi disk masih kosong. Kesimpulan ...',['OS pasti terpasang','Baru sesi live; lakukan instalasi disk lalu uji tanpa ISO','Semua data sudah tersalin'],1,'Live session dan installed system adalah keadaan berbeda.')),
   old.layanan,old.pemulihan,
   chapter('clone-network','Clone, identitas guest dan jaringan dua VM',[
    'Sesudah instalasi, Shut down dan Clone. Clone menyalin data serta identitas OS/IP dalam model. Nyalakan clone bersama sumber dan uji peer: alamat sama menghasilkan konflik. Matikan clone, ubah IP ke 192.168.50.20 dan cocokkan mode serta nama segmen.',
    'Uji peer hanya untuk dua guest ON yang telah boot disk. Mode internal/host-only dan segmen harus sama, IP berbeda dalam /24 yang sama. NAT biasa per VM tidak dimodelkan sebagai segmen peer bersama; NAT Network merupakan konsep berbeda yang belum tersedia.',
    'Reply model tidak membuktikan DNS, firewall, aplikasi atau jaringan Internet nyata. Untuk snapshot: guest OFF → Take Snapshot → Start → ubah berkas proyek → Shut down → Restore → Start. Bandingkan versi berkas. Snapshot tetap bergantung host yang sama dan tidak menggantikan backup.'
   ],q('Clone memakai IP sumber pada segmen sama. Perbaikan yang sesuai ...',['Ubah identitas/alamat salah satu guest dan uji ulang','Hanya ubah nama di daftar VM','Anggap clone otomatis mempunyai IP unik'],0,'Nama VM pada pengelola berbeda dari identitas jaringan dalam guest.')),
   old.laboratorium,old.refleksi,old.evaluasi];
  c.chapters.find(ch=>ch.id==='laboratorium').html=lab('ubuntu','vm-main');
 }else{
  c.chapters=[old.orientasi,old.persiapan,
   chapter('linux-boot','Ubuntu Desktop: ISO, sesi live dan awal installer',[
    'Acuan latihan adalah Ubuntu Desktop 24.04 LTS. Buat guest Ubuntu dengan media sesuai dan disk kosong. Boot ISO menampilkan pilihan bahasa, aksesibilitas, keyboard, jaringan, serta Try/Install. Tulisan dan urutan dapat berbeda pada point release; konsep boot media tetap sama.',
    'Pilih Try Ubuntu untuk mengamati live session. Periksa bahwa disk belum berisi OS; kembali melalui Install Ubuntu. Selanjutnya gunakan Interactive installation agar setiap keputusan dapat dijelaskan. Automated installation di luar lingkup model dan ditolak bila dipilih.',
    'Praktik: sengaja gunakan ISO kosong dahulu untuk melihat kegagalan boot, perbaiki media, lalu bandingkan sesi live dengan installer. Catat bukti sebelum dan sesudah. Tidak ada ISO asli yang diunduh oleh halaman.'
   ],q('Sesi live berjalan. Bukti apa yang masih diperlukan untuk menyatakan instalasi selesai?',['Desktop terlihat','Instalasi disk selesai dan boot berhasil tanpa ISO','Bahasa sudah dipilih'],1,'Sesi ISO tidak membuktikan disk bootable.')),
   chapter('linux-options','Ubuntu Desktop: aplikasi, perangkat dan jaringan',[
    'Default selection dan Extended selection membedakan kelompok aplikasi pada installer yang dijadikan acuan. Kebutuhan pembelajaran, ruang dan ketersediaan jaringan memengaruhi pilihan. Third-party support tidak berarti semua perangkat selalu memerlukan driver tambahan.',
    'Pada skenario isolated, pilih koneksi tidak tersedia dan jelaskan bahwa repository/pembaruan belum diuji. Model mencatat pilihan jaringan serta aplikasi tetapi tidak mengunduh driver atau memeriksa hardware nyata. Jangan menyimpulkan instalasi model membuktikan driver laptop peserta didukung.',
    'Bandingkan pilihan aplikasi dan dukungan perangkat pada dua percobaan. Tuliskan akibat yang diwakili model dan hal yang perlu dibuktikan pada VM produk asli.'
   ],q('Repository tidak tersedia di lab terisolasi. Laporan yang benar ...',['Seluruh pembaruan pasti terpasang','Nyatakan pembaruan/paket daring belum diuji dan rencanakan akses berizin','Matikan verifikasi sumber paket'],1,'Keputusan dan keterbatasan bukti harus dibedakan dari klaim keberhasilan.')),
   chapter('linux-disk','Ubuntu Desktop: partisi otomatis dan manual',[
    'Disk 0 adalah target virtual kosong; Disk 1 adalah DATA latihan yang dilindungi. Pilih Erase Disk 0 untuk tata letak otomatis, atau Manual partitioning untuk menyiapkan EFI FAT32 pada /boot/efi dan root ext4 pada /. Nilai partisi dalam simulator adalah batas model, bukan ukuran wajib universal installer.',
    'Latihan manual: tambahkan /boot/efi FAT32 1 GiB, kemudian / ext4 40 GiB pada disk 64 GiB. Sisanya dapat digunakan /home sesuai kebutuhan. Model menolak root hilang, filesystem keliru, mount ganda dan jumlah ukuran melebihi kapasitas.',
    'Sengaja pilih Disk 1 dan amati penolakan aman. Kembali ke Disk 0, tinjau rencana, kemudian lanjut. Pada perangkat nyata formatting bisa menghancurkan data; disk, izin dan cadangan harus diverifikasi sebelum perubahan.'
   ],q('Rencana Ubuntu manual hanya memiliki /home ext4, tanpa root dan EFI. Model ...',['Menerima karena ada partisi','Menolak karena struktur boot/root profil belum terpenuhi','Membuat OS dari nama VM'],1,'Mount, filesystem dan kapasitas perlu konsisten agar profil boot yang dipilih dapat dipenuhi.')),
   chapter('linux-account','Ubuntu Desktop: akun, waktu dan ringkasan instalasi',[
    'Nama akun dan hostname berbeda dari nama VM. Gunakan identitas fiktif seperti siswa dan lab-ubuntu, lalu dua sandi latihan yang cocok minimal delapan karakter. Sandi hanya diperiksa sementara dan tidak disimpan ke sesi/log/ekspor.',
    'Pilih zona waktu lalu tinjau ringkasan OS, disk, resource serta partisi. Konfirmasi hanya jika target benar. Tombol Back mengizinkan revisi sebelum penyalinan; setelah penyalinan dimulai, perubahan disk dianggap sudah diterapkan pada model.',
    'Pada Windows, sebagian pengaturan akun terjadi setelah boot awal; jangan memaksakan urutan Ubuntu pada semua OS. Penempatan profil akun adalah bagian perbandingan kedua installer.'
   ],q('Hostname, nama VM dan username ...',['Selalu berubah bersama','Adalah identitas berbeda yang perlu dicatat dan diuji','Selalu berisi alamat IP'],1,'Identitas pengelola, OS dan akun mempunyai fungsi berbeda.')),
   {...old['linux-desktop'],html:old['linux-desktop'].html+lab('ubuntu','os-ubuntu')},
   chapter('windows-media','Windows 11: kebutuhan VM, edisi dan media',[
    'Acuan kedua adalah alur instalasi bersih Windows 11 pada VM. Siapkan RAM, vCPU, disk, UEFI, TPM serta kemampuan Secure Boot sesuai profil. Model memeriksa sebagian parameter; kompatibilitas CPU, grafis, lisensi dan dukungan hypervisor nyata tetap diverifikasi pada produk.',
    'Mulai ISO, pilih bahasa/keyboard, alur instalasi bersih, product key kemudian dan edisi latihan. Tidak ada product key nyata diminta. Tinjau kebutuhan lisensi; centang latihan bukan aktivasi atau persetujuan lisensi vendor.',
    'Edisi/build dapat mengubah pilihan dan urutan layar. Simulator tidak menyatakan meniru semua build identik dan tidak menawarkan bypass persyaratan resmi. Pilih edisi/media yang disetujui sekolah.'
   ],q('VM gagal memenuhi TPM/UEFI profil Windows. Tindakan ...',['Gunakan bypass tanpa verifikasi','Perbaiki dukungan/pengaturan yang sah dan periksa kebutuhan resmi','Ganti nama ISO saja'],1,'Kesesuaian hardware virtual dan kebutuhan guest harus diperiksa sebelum installer.')),
   chapter('windows-disk','Windows 11: target disk dan tata letak boot',[
    'Pilih Disk 0 Unallocated Space pada VM latihan. Profil otomatis merepresentasikan area EFI, MSR, Windows dan Recovery. Besaran yang ditampilkan adalah representasi latihan, bukan ukuran tetap setiap build Windows.',
    'Disk 1 DATA tidak boleh dihapus untuk menyelesaikan misi. Jika salah disk dipilih, simulator menghentikan langkah sebelum penyalinan. Pada produk nyata, baca nomor, kapasitas, identitas dan ringkasan perubahan; jangan menjadikan nomor Disk 0 sebagai jaminan target selalu benar.',
    'Setelah ringkasan dikonfirmasi, jalankan empat fase penyalinan model. Lepas ISO sebelum Restart untuk membuktikan boot disk. Model penyalinan tidak menyalin file Windows asli atau menyatakan aktivasi berhasil.'
   ],q('Disk 1 berisi data, Disk 0 kosong. Target untuk skenario ini ...',['Disk 1 karena lebih besar','Disk 0 yang telah diverifikasi kosong; pertahankan Disk 1','Hapus keduanya'],1,'Pemilihan disk berdasarkan identitas dan kebutuhan, bukan ukuran terbesar.')),
   chapter('windows-oobe','Windows 11: pengaturan awal, akun dan privasi',[
    'Sesudah restart disk, selesaikan wilayah, jaringan, identitas latihan dan privasi. Pada Windows nyata, persyaratan Internet/akun bergantung edisi dan kebijakan. Simulator menggunakan identitas fiktif dan tidak meniru login Microsoft atau mengirim data ke layanan tersebut.',
    'Gunakan hostname dan username yang valid serta sandi fiktif yang cocok. Catat edisi, waktu, pengaturan jaringan dan batas uji. Pengaturan privasi di model hanya pilihan representasi; tidak ada telemetri Windows yang diaktifkan.',
    'Setelah desktop, periksa boot source disk dan identitas. Shut down, Start tanpa ISO lalu periksa lagi. Uji ini berbeda dari sekadar mencapai persentase instalasi 100%.'
   ],q('Pengaturan akun pada simulator selesai. Kesimpulan yang benar ...',['Akun Microsoft nyata telah dibuat','Hanya identitas fiktif model; persyaratan akun produk nyata tetap perlu diperiksa','Windows otomatis berlisensi'],1,'Simulator tidak membuat akun daring atau mengaktifkan produk.')),
   {...old['windows-desktop'],html:old['windows-desktop'].html+lab('windows','os-windows')},old.konfigurasi,
   {...old.laboratorium,html:'<p>Bandingkan bukti dari dua simulator pada tahap Linux desktop dan Windows desktop: media, disk, partisi, akun, penyalinan, restart dan boot disk. Uji sekurangnya satu kegagalan pada setiap OS lalu jelaskan perbaikannya. Tidak perlu mengulang instalasi yang sama hanya untuk menyalin laporan.</p><p>Bukti model dan bukti praktik produk asli ditandai terpisah. Tidak ada disk perangkat peserta yang diakses.</p>'},old.refleksi,old.evaluasi];
 }
 const bank=c.chapters.filter(ch=>ch.id!=='evaluasi').flatMap(ch=>ch.questions);c.chapters.at(-1).questions=bank;
 c.progressVersion=3;c.version=3;
 c.chapters.at(-1).html=c.chapters.at(-1).html.replace('Jawab semua soal',`Jawab seluruh ${bank.length} soal yang mewakili tahap materi. Jawab semua soal`);
 // Older eight-stage students receive the simulator without loss of past scores.
 const legacyLab=c.legacyChapters.find(ch=>ch.id==='laboratorium');legacyLab.html=vm?lab('ubuntu','vm-main'):lab('ubuntu','os-ubuntu')+lab('windows','os-windows');
 fs.writeFileSync(`data/${id}.json`,JSON.stringify(c,null,2)+'\n');
 const catalog=read('data/modules.json'),entry=catalog.find(m=>m.id===id);let html=fs.readFileSync(entry.path+'index.html','utf8');if(!html.includes('virtual-lab.css'))html=html.replace('</head>','<link rel="stylesheet" href="../../../assets/css/virtual-lab.css">\n</head>');fs.writeFileSync(entry.path+'index.html',html);
 console.log(`${id}: ${c.chapters.length} stages; ${bank.length} final questions; old 8-stage records retained.`);
}

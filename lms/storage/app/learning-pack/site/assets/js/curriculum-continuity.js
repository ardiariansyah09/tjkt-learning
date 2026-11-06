// Local curriculum additions; stable existing stage and question identifiers.
export function enrichContinuity(course){
 const add=(id,title,paragraphs)=>{const chapter=course.chapters.find(c=>c.id===id);if(!chapter)throw Error(`Missing ${id}`);chapter.sections.push([title,paragraphs]);};
 if(course.moduleId==='virtualisasi-server'){
  course.title='Mesin Virtual Lanjutan: Proxmox VE dan VMware ESXi';
  course.objectives.push('Merancang instalasi hypervisor server, jaringan manajemen, storage, backup dan uji pemulihan pada Proxmox VE/VMware ESXi.');
  add('konsep-1','Dari VM desktop kelas X menuju hypervisor server kelas XI',[
   'Kelas X membangun VM menggunakan VirtualBox dan VMware Workstation, memasang OS guest, serta menguji jaringan dasar. Kelas XI memakai pengalaman itu untuk mengelola host server melalui Proxmox VE atau VMware ESXi. Perbedaan utamanya bukan nama produk, melainkan pengelolaan host, jaringan manajemen, resource bersama, storage, identitas administrator dan pemulihan banyak layanan.',
   'Proxmox VE menyediakan pengelolaan VM berbasis KVM serta container LXC; container tidak disamakan dengan VM berkernel sendiri. ESXi adalah hypervisor dalam lingkungan VMware; akses melalui Host Client dan pengelolaan terpusat memiliki cakupan/ketergantungan berbeda. Fitur, lisensi, kompatibilitas dan dukungan harus dicocokkan dengan versi yang benar-benar dipakai. Jangan menganggap vCenter wajib untuk setiap pengujian satu host.',
   'Buat tabel pengetahuan awal kelas X, kemampuan lanjutan yang diperlukan dan bukti. Siswa yang belum dapat menjelaskan host/guest, boot atau isolasi jaringan kembali ke dasar VM dahulu. Ini penguatan prasyarat, bukan mengulang seluruh materi dasar dengan nama produk lain.'
  ]);
  add('konsep-3','Instalasi hypervisor pada host latihan',[
   'Rencanakan CPU/dukungan virtualisasi, RAM, NIC, storage, firmware, media resmi, kompatibilitas dan akses konsol. Guru memverifikasi disk target kosong. Installer hypervisor dapat menghapus disk; jangan memakai PC utama atau server sekolah sebagai target coba-coba. Nested lab hanya alternatif berizin dengan dukungan dan batas yang dicatat, bukan bukti kelayakan produksi.',
   'Untuk Proxmox VE: boot media installer yang disetujui, identifikasi disk dan pilihan filesystem, tetapkan lokasi/waktu, akun pengelola serta hostname/IP manajemen sesuai rancangan, lalu mulai ulang dan verifikasi akses konsol/web dari klien berizin. Untuk ESXi: verifikasi compatibility dan image yang didukung, pilih disk target, selesaikan installer, lalu atur jaringan manajemen melalui alat konsol yang sesuai. Jangan menyalin langkah menu Proxmox ke ESXi.',
   'Sebelum membuat guest, rekam versi host, waktu, NIC aktif, alamat manajemen, akses administrator dan storage. Tangani identitas/sertifikat manajemen melalui prosedur tepercaya; jangan menerima perubahan identitas tanpa pemeriksaan. Foto konsol tidak boleh memuat sandi.'
  ]);
  add('konsep-4','Bridge, virtual switch dan jaringan manajemen',[
   'Pada Proxmox, bridge Linux dapat menghubungkan NIC guest ke jaringan yang dirancang; pada ESXi, virtual switch dan port group menjadi bagian pemetaan guest/uplink. VLAN tagging harus cocok di guest/port group/bridge serta switch fisik menurut rancangan. VLAN pada layar tidak membuktikan isolasi bila uplink dan kebijakan salah.',
   'Pisahkan akses manajemen host dari trafik layanan sesuai kapasitas lab. Buat tabel NIC fisik–uplink–bridge/vSwitch–segmen–guest. Uji klien yang boleh mengelola host serta klien tamu yang harus ditolak. NAT/host-only pada simulator lama adalah model dasar; bukan padanan lengkap jaringan Proxmox/ESXi dan tidak boleh dilabel ulang seolah simulator produk nyata.'
  ]);
  add('konsep-5','Storage, template, backup dan batas high availability',[
   'Bedakan datastore/storage host, disk guest, image/template dan repository backup. Pada kedua platform, pemulihan harus membuktikan guest boot, identitas unik, data yang diperlukan dan aplikasi dari klien. Clone perlu pemeriksaan IP/hostname serta identitas OS; snapshot pada storage yang sama tidak menyelamatkan data saat storage itu hilang.',
   'Latihan lanjutan: sediakan dua guest peran berbeda, susun kapasitas dan backup di lokasi yang dirancang, uji satu gangguan guest dan satu skenario kehilangan host melalui data/model. Jika hanya satu host fisik tersedia, jelaskan bahwa cluster, quorum, migration dan HA belum diuji. Live migration/HA bergantung fitur, jaringan, storage dan rancangan; bukan janji tanpa downtime untuk semua aplikasi.'
  ]);
  add('kasus','Produk penerimaan kelas XI',[
   'Serahkan inventaris host, diagram manajemen/guest, rencana storage, prosedur membuat satu VM dari ISO dan satu template, tiga uji akses, backup serta bukti restore. Pilih satu platform utama untuk pelaksanaan dan petakan perbedaannya dengan platform pembanding. Menonton demo platform pembanding diberi label observasi, bukan mengaku sudah menginstalnya.'
  ]);
  course.sources.push(['Proxmox VE: panduan administrasi','https://pve.proxmox.com/pve-docs/pve-admin-guide.pdf'],['VMware: dokumentasi resmi','https://techdocs.broadcom.com/']);
 }
 if(course.moduleId==='administrasi-linux-windows'){
  add('konsep-1','Instalasi Linux server: urutan praktik kelas XI',[
   'Bekal kelas X adalah pemasangan Linux desktop/Windows pada VM dan pembuktian boot. Di kelas XI gunakan media Linux server yang dipilih guru, misalnya Ubuntu Server, pada disk virtual kosong. Catat versi, checksum resmi, kapasitas dan identitas target; gunakan installer interaktif agar keputusan dapat dijelaskan. Media desktop tidak disamakan dengan installer server.',
   'Urutan: boot ISO → pilih bahasa/keyboard → verifikasi interface dan mode jaringan lab → tentukan mirror/proxy hanya jika memang digunakan → tinjau disk dan ringkasan perubahan → buat hostname serta akun personal → pilih layanan awal sesuai kebutuhan → selesaikan instalasi → lepaskan ISO sesuai prosedur → boot dari disk. Nama menu dan fitur mengikuti versi; dokumentasikan keputusan, jangan menghafal posisi tombol.',
   'Untuk latihan isolated tanpa repository, tandai pembaruan/paket yang belum dapat diuji. Jika instalasi OpenSSH dipilih, verifikasi listener, identitas host, izin akun dan jalur klien; jangan menganggap centang SSH membuktikan akses aman. Jangan menulis password/private key pada laporan. Setelah boot, periksa identitas OS, waktu, interface/rute, resolver yang tersedia, storage dan akun berizin.',
   'Bukti penerimaan: OS server boot dari disk, target disk benar, akun dapat masuk dengan hak minimum sesuai kebijakan, jaringan sesuai rancangan dan satu operasi layanan diuji dari klien. Ulangi setelah reboot terjadwal. Catat jika yang dilakukan hanya analisis data atau template siap pakai; keduanya belum membuktikan proses instalasi.'
  ]);
  course.objectives.push('Melaksanakan urutan instalasi Linux server pada VM kosong dan membuktikan baseline setelah boot sebelum memasang layanan jaringan.');
  course.sources.push(['Ubuntu Server: instalasi dasar','https://documentation.ubuntu.com/server/tutorial/basic-installation/']);
 }
 return course;
}

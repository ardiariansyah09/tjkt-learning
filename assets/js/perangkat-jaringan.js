import { bindThemeToggle } from './theme.js';
import { mountActionGame } from './action-game.js';

const KEY = 'tjkt:perangkat-jaringan:progress:v1';
const MIN_PASS = 75;
const POSTTEST_MIN_PASS = 80;
const $ = (id) => document.getElementById(id);
const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const lessons = [
  {
    id: 'peran',
    title: 'Peran Perangkat Jaringan',
    summary: 'Kenali bagaimana perangkat bekerja sama agar jaringan dapat berkomunikasi.',
    objectives: [
      'Menjelaskan fungsi perangkat akhir dan perangkat perantara pada jaringan.',
      'Membedakan fungsi NIC, switch, router, access point, modem/ONT, dan firewall.',
      'Memilih perangkat sesuai kebutuhan, cakupan, media, dan kondisi jaringan.',
      'Menerapkan pemahaman melalui rancangan dan diagnosis jaringan sederhana.'
    ],
    hook: 'Data dari laptop menuju server sekolah tidak berpindah sendiri. Perangkat apa yang membantu data melewati LAN dan mencapai jaringan lain?',
    diagram: {
      caption: 'Alur contoh: perangkat akhir mengakses layanan melalui jaringan lokal dan router.',
      nodes: [['PC', 'PC'], ['SW', 'Switch'], ['R', 'Router'], ['WEB', 'Server']],
      links: [[0, 1], [1, 2], [2, 3]]
    },
    sections: [
      ['Perangkat akhir dan perantara',
        'Perangkat akhir (end device/host), seperti PC, laptop, ponsel, printer jaringan, dan server, menghasilkan atau menerima data. Perangkat perantara menghubungkan segmen, meneruskan trafik, atau mengatur akses.',
        'Contoh alur sederhana: laptop mengirim data melalui NIC dan media jaringan ke switch. Jika tujuan berada di luar subnet lokal, paket diteruskan ke router/gateway. Setiap perangkat menjalankan fungsi tertentu; tidak semua perangkat melakukan routing.'],
      ['Perangkat keras dan fungsi, bukan sekadar bentuk',
        'Bentuk kotak perangkat saja tidak cukup untuk mengenali fungsinya. Periksa antarmuka, konfigurasi, dan peran perangkat. Satu perangkat konsumen dapat menggabungkan router, switch kecil, access point, dan modem/ONT dalam satu unit.',
        'Pada jaringan yang lebih besar, fungsi tersebut sering ditempatkan pada perangkat terpisah agar kapasitas, pengelolaan, dan batas gangguan dapat dirancang dengan lebih jelas.'],
      ['Memilih perangkat dari kebutuhan',
        'Tentukan jumlah pengguna, jenis koneksi, cakupan, kapasitas, kebutuhan mobilitas, layanan yang diakses, keamanan, ketersediaan listrik, dan kemungkinan pengembangan.',
        'Kebutuhan PC berkabel dalam satu LAN mengarah pada NIC, kabel, dan switch. Jaringan Wi-Fi membutuhkan access point. Komunikasi antar-subnet memerlukan fungsi router. Akses ISP membutuhkan layanan dan media dari penyedia, sering melalui modem atau ONT yang sesuai.']
    ],
    example: 'Untuk laboratorium dengan PC berkabel, setiap PC menggunakan NIC dan kabel ke switch. Router menghubungkan LAN ke subnet lain atau internet; access point menyediakan koneksi Wi-Fi bila dibutuhkan.',
    caseQuestion: 'Sebuah PC dapat mengakses server lokal yang satu LAN, tetapi tidak dapat mengakses jaringan internet. Apakah switch pasti rusak? Apa saja pemeriksaan yang lebih tepat?',
    caseAnswer: 'Belum tentu. Karena server lokal dapat diakses, link dan switch LAN kemungkinan bekerja untuk jalur tersebut. Periksa alamat dan subnet, default gateway, fungsi router, DNS, koneksi ISP/modem atau ONT, serta aturan firewall.',
    summary: ['Perangkat akhir menghasilkan atau menerima data; perangkat perantara menghubungkan atau mengendalikan trafik.', 'Fungsi tiap perangkat berbeda meskipun satu unit dapat menggabungkan beberapa fungsi.', 'Pilih perangkat berdasarkan kebutuhan jaringan, bukan hanya nama atau bentuknya.'],
    questions: [
      ['Perangkat akhir pada jaringan berfungsi untuk ...', ['Menerima atau menghasilkan data', 'Selalu meneruskan paket antarjaringan', 'Mengganti semua media transmisi'], 0],
      ['Fungsi perangkat jaringan sebaiknya dikenali berdasarkan ...', ['Peran dan fungsi yang dijalankan', 'Warna casing', 'Lokasi merek dibuat'], 0],
      ['Kebutuhan utama untuk menghubungkan banyak PC berkabel dalam satu LAN adalah ...', ['Switch dan NIC pada host', 'Modem saja', 'Firewall tanpa antarmuka jaringan'], 0],
      ['Satu perangkat rumahan dapat ...', ['Menggabungkan beberapa fungsi perangkat', 'Selalu hanya memiliki satu fungsi', 'Menggantikan semua server internet'], 0]
    ]
  },
  {
    id: 'nic',
    title: 'NIC dan Perangkat Akhir',
    summary: 'Pelajari antarmuka jaringan berkabel dan nirkabel pada host.',
    hook: 'Laptop tidak mempunyai kabel yang terpasang, tetapi tetap bisa mengirim data. Bagian apa yang menghubungkannya ke media jaringan?',
    diagram: {
      caption: 'NIC menghubungkan host ke jaringan. Media dan NIC harus sesuai.',
      nodes: [['PC', 'Laptop'], ['NIC', 'NIC'], ['SW', 'Switch']],
      links: [[0, 1], [1, 2]]
    },
    sections: [
      ['Network Interface Card (NIC)',
        'NIC atau network adapter adalah antarmuka yang memungkinkan perangkat akhir mengirim dan menerima data melalui jaringan. NIC dapat terintegrasi di motherboard, dipasang sebagai kartu ekspansi, atau berupa adapter eksternal.',
        'NIC Ethernet menyediakan antarmuka kabel. NIC Wi-Fi menyediakan antarmuka radio. Sebuah perangkat dapat memiliki beberapa NIC sehingga terhubung ke beberapa jaringan melalui antarmuka yang berbeda.'],
      ['Antarmuka, alamat MAC, dan media',
        'Pada Ethernet, NIC mengirim dan menerima frame pada link lokal dan menggunakan alamat MAC. Pada Wi-Fi, antarmuka radio berkomunikasi dengan access point menggunakan standar dan pita frekuensi yang didukung.',
        'Alamat MAC berkaitan dengan antarmuka link-layer; alamat IP dikonfigurasi untuk komunikasi IP. Jangan menyamakan alamat MAC dengan alamat IP atau menganggap satu alamat IP selalu melekat permanen pada perangkat fisik.'],
      ['Kecepatan dan kompatibilitas',
        'Periksa jenis port, media, konektor, standar Wi-Fi, dan kecepatan yang didukung. Link Ethernet biasanya menegosiasikan kecepatan berdasarkan kemampuan kedua sisi dan kondisi link.',
        'Port Ethernet yang menyala tidak membuktikan konfigurasi IP atau layanan tujuan sudah benar. Link Wi-Fi tersambung juga belum menjamin sinyal kuat, gateway tersedia, atau DNS bekerja.']
    ],
    example: 'PC laboratorium memakai NIC Ethernet dan kabel ke port switch. Laptop yang sama dapat memakai NIC Wi-Fi untuk mengakses jaringan melalui access point.',
    caseQuestion: 'Ikon Wi-Fi laptop menunjukkan tersambung, tetapi halaman intranet tidak dapat dibuka. Apakah NIC pasti rusak?',
    caseAnswer: 'Tidak. Periksa apakah koneksi ke SSID yang benar, kekuatan sinyal, konfigurasi IP, subnet, gateway, DNS, izin akses, dan ketersediaan layanan intranet. Uji koneksi bertahap sebelum menyimpulkan NIC rusak.',
    summary: ['NIC adalah antarmuka jaringan pada host dan dapat berupa Ethernet maupun Wi-Fi.', 'Alamat MAC bekerja pada link lokal; alamat IP dipakai untuk komunikasi IP.', 'Status link aktif bukan bukti bahwa konfigurasi atau layanan tujuan sudah benar.'],
    questions: [
      ['Fungsi utama NIC adalah ...', ['Menghubungkan host ke media/jaringan', 'Menentukan seluruh rute internet sendiri', 'Menyediakan alamat DNS untuk dunia'], 0],
      ['Alamat MAC umumnya digunakan pada ...', ['Komunikasi link-layer lokal', 'Penentuan nama halaman web saja', 'Catu daya perangkat'], 0],
      ['Laptop dengan NIC Ethernet dan Wi-Fi ...', ['Dapat memiliki lebih dari satu antarmuka jaringan', 'Hanya dapat memiliki satu alamat untuk selamanya', 'Tidak dapat memakai jaringan kabel'], 0],
      ['Indikator Wi-Fi tersambung tidak memastikan ...', ['Layanan internet dan DNS pasti tersedia', 'Antarmuka terhubung ke access point', 'Laptop mendeteksi suatu jaringan'], 0]
    ]
  },
  {
    id: 'switching',
    title: 'Hub, Bridge, dan Switch',
    summary: 'Bandingkan perangkat penghubung LAN dan cara meneruskan frame.',
    hook: 'Ketika sebuah PC mengirim frame di LAN, bagaimana switch memilih port tujuan tanpa mengirim data ke seluruh port?',
    diagram: {
      caption: 'Switch menghubungkan host dalam LAN dan meneruskan frame berdasarkan alamat MAC yang dipelajari.',
      nodes: [['PC1', 'PC A'], ['SW', 'Switch'], ['PC2', 'PC B'], ['PRN', 'Printer']],
      links: [[0, 1], [1, 2], [1, 3]]
    },
    sections: [
      ['Repeater dan hub',
        'Repeater meregenerasi atau meneruskan sinyal untuk membantu memperpanjang segmen sesuai media dan batas teknologinya. Hub Ethernet lama pada dasarnya mengulang sinyal ke port lain; ia tidak mempelajari alamat MAC untuk memilih port tujuan.',
        'Hub adalah teknologi lama dan berbagi media/bandwidth. Jangan menyebut hub sebagai switch: perilaku penerusan frame keduanya berbeda.'],
      ['Bridge dan switch',
        'Bridge menghubungkan segmen LAN dan dapat meneruskan atau menyaring frame berdasarkan alamat MAC. Switch Ethernet modern dapat dipahami sebagai bridge multiport yang mempelajari alamat sumber dan mengaitkannya dengan port.',
        'Saat alamat tujuan dikenal, switch meneruskan frame ke port yang sesuai. Untuk broadcast atau tujuan yang belum dikenal, switch dapat meneruskan frame ke beberapa port dalam VLAN terkait. Proses ini bukan routing antarjaringan IP.'],
      ['Batas fungsi dan pemasangan',
        'Switch layer 2 umumnya menghubungkan perangkat dalam LAN/VLAN yang sama. Beberapa switch mendukung fungsi layer 3, tetapi kemampuan routing tersebut harus tersedia dan dikonfigurasi.',
        'Pilih jumlah port dan kapasitas sesuai kebutuhan, gunakan uplink yang sesuai, dan dokumentasikan port. Hindari loop fisik yang tidak dikelola; jaringan switch redundan memerlukan desain serta pencegahan loop yang tepat.']
    ],
    example: 'Empat PC dan satu printer jaringan terhubung ke port switch. Host yang berada pada LAN/VLAN yang sama bertukar frame melalui switch; router dibutuhkan untuk meneruskan paket IP ke jaringan lain.',
    caseQuestion: 'Satu PC tidak dapat mengakses PC lain di LAN. Apakah menukar switch langsung menjadi langkah diagnosis terbaik?',
    caseAnswer: 'Belum. Amati lampu link dan status NIC, periksa kabel serta port, pastikan VLAN dan konfigurasi alamat sesuai, lalu uji koneksi. Ganti atau pindahkan port hanya sebagai pengujian terkontrol.',
    summary: ['Repeater menguatkan/meregenerasi sinyal; hub mengulang sinyal dan tidak menyaring berdasarkan MAC.', 'Bridge menyaring frame; switch modern adalah bridge multiport yang mempelajari alamat MAC.', 'Switch layer 2 menghubungkan segmen LAN, bukan otomatis merutekan trafik antarjaringan IP.'],
    questions: [
      ['Hub Ethernet klasik meneruskan sinyal dengan cara ...', ['Mengulang ke port lain tanpa memilih berdasarkan MAC', 'Merutekan paket ke internet', 'Menerjemahkan nama domain'], 0],
      ['Switch mempelajari alamat MAC sumber untuk ...', ['Mengaitkan alamat dengan port', 'Menentukan kata sandi pengguna', 'Mendapatkan alamat dari DNS'], 0],
      ['Fungsi umum switch layer 2 adalah ...', ['Menghubungkan perangkat dalam LAN/VLAN', 'Menghubungkan semua jaringan IP tanpa router', 'Mengubah kabel tembaga menjadi radio'], 0],
      ['Switch meneruskan frame broadcast umumnya di ...', ['VLAN terkait', 'Semua jaringan internet', 'Catu daya NIC'], 0]
    ]
  },
  {
    id: 'routing',
    title: 'Router dan Default Gateway',
    summary: 'Pahami cara router menghubungkan jaringan IP yang berbeda.',
    hook: 'Mengapa PC mengirim paket ke gateway saat server tujuan berada di subnet lain?',
    diagram: {
      caption: 'Router menghubungkan dua subnet IP; tiap interface router terhubung ke jaringan yang sesuai.',
      nodes: [['PC', 'PC · LAN A'], ['SW1', 'Switch A'], ['RTR', 'Router'], ['SW2', 'Switch B'], ['SRV', 'Server · LAN B']],
      links: [[0, 1], [1, 2], [2, 3], [3, 4]]
    },
    sections: [
      ['Router menghubungkan jaringan',
        'Router meneruskan paket IP antarjaringan berdasarkan alamat tujuan dan tabel routing. Setiap interface yang digunakan pada suatu subnet harus memiliki konfigurasi yang sesuai dengan jaringan tersebut.',
        'Router tidak sekadar memperkuat sinyal atau menambah port LAN. Router memutuskan ke mana paket IP selanjutnya diteruskan menurut rute yang tersedia.'],
      ['Default gateway pada host',
        'Host membandingkan tujuan dengan subnet lokal. Untuk tujuan di luar subnet, host biasanya mengirim paket ke default gateway, yaitu alamat interface router yang dapat dijangkau pada jaringan lokal host tersebut.',
        'Alamat gateway harus berada pada subnet yang benar dan interface router harus aktif. Gateway yang salah dapat membuat komunikasi lokal tetap berjalan, tetapi koneksi ke jaringan lain gagal.'],
      ['Routing, NAT, dan perangkat rumahan',
        'Tabel routing berisi jaringan tujuan dan jalur berikutnya. Router sekolah dapat memiliki beberapa interface atau rute menuju jaringan lain. NAT adalah fungsi yang dapat menerjemahkan alamat pada batas jaringan; NAT tidak sama dengan routing.',
        'Perangkat rumahan sering menggabungkan router, switch, access point, firewall dasar, dan fungsi modem/ONT. Keberadaan semua fungsi dalam satu kotak tidak mengubah perbedaan perannya.']
    ],
    example: 'PC 192.168.10.20/24 mengakses server 192.168.20.10/24. PC mengirim trafik ke gateway LAN-nya, lalu router memilih rute menuju subnet server.',
    caseQuestion: 'Dua PC satu subnet dapat saling ping, tetapi keduanya tidak dapat mengakses subnet lain. Hal apa yang perlu diperiksa sebelum mengganti switch?',
    caseAnswer: 'Periksa alamat serta subnet, default gateway pada host, status interface router, alamat interface router, tabel routing, dan kebijakan firewall. Keberhasilan ping lokal menunjukkan konektivitas lokal berfungsi.',
    summary: ['Router meneruskan paket IP antarjaringan berdasarkan tabel routing.', 'Default gateway adalah jalur host menuju tujuan di luar subnet lokal.', 'Routing, NAT, switching, dan fungsi modem adalah hal yang berbeda.'],
    questions: [
      ['Router meneruskan trafik terutama berdasarkan ...', ['Alamat tujuan dan tabel routing', 'Nama pengguna komputer saja', 'Kekuatan sinyal monitor'], 0],
      ['Default gateway pada host biasanya merupakan ...', ['Alamat interface router pada subnet lokal', 'Alamat broadcast jaringan luar', 'Alamat MAC printer'], 0],
      ['Host biasanya mengirim ke gateway jika tujuan ...', ['Berada di luar subnet lokal', 'Adalah proses lokal sendiri', 'Adalah file di folder yang sama'], 0],
      ['NAT dan routing ...', ['Memiliki fungsi yang berbeda', 'Selalu merupakan istilah yang sama', 'Hanya digunakan switch unmanaged'], 0]
    ]
  },
  {
    id: 'wifi-keamanan',
    title: 'Access Point, Modem/ONT, dan Firewall',
    summary: 'Kenali perangkat Wi-Fi, perangkat akses ISP, dan pengendalian trafik.',
    hook: 'Ponsel tersambung ke Wi-Fi sekolah, tetapi router tetap dibutuhkan untuk mengirim trafik ke jaringan di luar LAN. Apa peran access point?',
    diagram: {
      caption: 'Access point menjembatani klien Wi-Fi ke LAN; router menangani komunikasi antarjaringan.',
      nodes: [['PHONE', 'Klien Wi-Fi'], ['AP', 'Access Point'], ['SW', 'Switch/LAN'], ['RTR', 'Router/Firewall'], ['ISP', 'ISP/Internet']],
      links: [[0, 1], [1, 2], [2, 3], [3, 4]]
    },
    sections: [
      ['Access point dan Wi-Fi',
        'Access point (AP) menyediakan akses nirkabel dan menjembatani klien Wi-Fi ke jaringan distribusi kabel atau jaringan yang dikelolanya. AP bukan sinonim router, meskipun perangkat rumahan dapat menggabungkan keduanya.',
        'SSID adalah nama jaringan nirkabel yang diumumkan. Keamanan, kanal, kapasitas klien, cakupan radio, dan penempatan AP memengaruhi kualitas koneksi. Banyak AP dapat dikelola oleh controller, tetapi controller tidak selalu wajib pada semua instalasi.'],
      ['Modem dan ONT pada akses penyedia',
        'Modem menyesuaikan atau memodulasi sinyal untuk media akses tertentu. ONT (Optical Network Terminal) mengakhiri layanan fiber optik pelanggan dan menyajikan antarmuka jaringan untuk perangkat pelanggan.',
        'Perangkat modem atau ONT menangani sisi akses ISP sesuai teknologi layanan. Fungsinya tidak otomatis sama dengan routing; perangkat yang sama bisa menggabungkan beberapa fungsi bila dirancang demikian.'],
      ['Firewall dan batas keamanan',
        'Firewall menerapkan aturan untuk mengizinkan atau membatasi trafik berdasarkan kebijakan, koneksi, alamat, port, atau karakteristik lain. Firewall dapat berupa perangkat khusus, fungsi pada router, maupun perangkat lunak host.',
        'Firewall bukan pengganti switch, router, atau antivirus. Atur kebijakan sesuai kebutuhan, batasi akses yang tidak diperlukan, dan uji aturan agar layanan yang sah tetap berfungsi.']
    ],
    example: 'Ponsel terhubung ke AP melalui Wi-Fi. AP menghubungkan trafik ke LAN, router meneruskan trafik ke jaringan luar, ONT mengakhiri link fiber ISP, dan firewall menerapkan aturan akses.',
    caseQuestion: 'Wi-Fi di satu ruang lemah, tetapi PC yang terhubung kabel dapat mengakses server dan internet. Perangkat atau faktor apa yang paling relevan untuk diperiksa?',
    caseAnswer: 'Mulai dari cakupan dan interferensi radio, lokasi serta daya AP, kanal, jumlah klien, autentikasi, dan link uplink AP. Karena PC kabel berfungsi, penggantian router atau ONT belum menjadi dugaan utama.',
    summary: ['Access point menyediakan konektivitas Wi-Fi dan menjembatani klien ke LAN.', 'Modem/ONT mengakhiri teknologi akses ISP; perannya tidak selalu mencakup routing.', 'Firewall menegakkan kebijakan trafik dan tidak menggantikan perangkat jaringan lainnya.'],
    questions: [
      ['Access point umumnya berfungsi untuk ...', ['Menyediakan akses Wi-Fi ke jaringan', 'Menerjemahkan setiap alamat IP menjadi MAC publik', 'Mengganti server aplikasi'], 0],
      ['ONT digunakan pada sisi pelanggan untuk ...', ['Mengakhiri layanan akses fiber optik', 'Menyimpan semua halaman web', 'Menghubungkan port switch tanpa media'], 0],
      ['Firewall digunakan untuk ...', ['Menerapkan kebijakan izin/batas trafik', 'Menyediakan sinyal Wi-Fi saja', 'Mengganti semua alamat IP'], 0],
      ['Wi-Fi lemah di satu ruang sementara LAN kabel normal: pemeriksaan awal yang sesuai adalah ...', ['Cakupan, interferensi, dan kondisi AP', 'Mengganti seluruh switch inti terlebih dahulu', 'Menghapus semua alamat IP'], 0]
    ]
  }
];

const activities = [
  {
    title: 'Device Selection Lab',
    summary: 'Pilih perangkat yang sesuai dengan kebutuhan pada empat skenario jaringan.',
    scenarios: [
      { title: 'LAN kabel laboratorium', prompt: '24 PC dan satu printer perlu terhubung dalam satu LAN kabel.', options: ['Switch Ethernet', 'Access point saja', 'Modem saja'], answer: 'Switch Ethernet' },
      { title: 'Jaringan nirkabel ruang kelas', prompt: 'Laptop dan ponsel perlu terhubung ke LAN sekolah melalui Wi-Fi.', options: ['Access point', 'Hub coaxial', 'ONT saja'], answer: 'Access point' },
      { title: 'Komunikasi antar-subnet', prompt: 'Paket dari LAN siswa perlu menuju subnet server yang berbeda.', options: ['Router', 'Repeater', 'NIC tambahan pada printer'], answer: 'Router' },
      { title: 'Pengamanan trafik', prompt: 'Administrator perlu membatasi trafik tertentu melintasi batas jaringan.', options: ['Firewall dengan aturan sesuai kebijakan', 'Access point tanpa keamanan', 'Patch cord lebih panjang'], answer: 'Firewall dengan aturan sesuai kebijakan' }
    ]
  },
  {
    title: 'Virtual Network Builder',
    summary: 'Susun jalur LAN sederhana dari dua PC dan server lokal ke router.',
    instructions: [
      'Hubungkan PC A, PC B, dan Server ke Switch.',
      'Hubungkan Switch ke interface LAN Router.',
      'Gunakan satu link untuk setiap pasangan yang diminta; jangan membuat kabel PC-ke-PC.',
      'Builder hanya memeriksa bentuk koneksi. Konfigurasi IP dan layanan tetap perlu diuji terpisah.'
    ]
  },
  {
    title: 'Device Delivery: Petualangan Jaringan',
    summary: 'Gerakkan karakter, ambil muatan, lewati empat pos perangkat, hindari gangguan, dan selesaikan tiga level.'
  }
];

const gameNodes = [
  { id: 'nic-pc-a', label: 'PC A · NIC', icon: '💻', x: 100, y: 112, role: 'Antarmuka host untuk koneksi kabel.', selectable: true },
  { id: 'pc-b', label: 'PC B', icon: '💻', x: 100, y: 340, role: 'Perangkat akhir lain pada LAN.', selectable: false },
  { id: 'server', label: 'Server', icon: '▣', x: 100, y: 228, role: 'Menyediakan layanan di jaringan lokal.', selectable: false },
  { id: 'switch', label: 'Switch', icon: '⠿', x: 315, y: 228, role: 'Menghubungkan perangkat dalam satu LAN.', selectable: true },
  { id: 'access-point', label: 'Access Point', icon: '◉', x: 315, y: 420, role: 'Menyediakan akses Wi-Fi ke jaringan.', selectable: true },
  { id: 'phone', label: 'Klien Wi-Fi', icon: '▯', x: 500, y: 420, role: 'Perangkat akhir yang tersambung secara nirkabel.', selectable: false },
  { id: 'router', label: 'Router', icon: '⇄', x: 510, y: 228, role: 'Meneruskan paket IP menuju jaringan lain.', selectable: true },
  { id: 'firewall', label: 'Firewall', icon: '⬡', x: 690, y: 228, role: 'Menegakkan kebijakan akses trafik.', selectable: true },
  { id: 'ont', label: 'Modem / ONT', icon: '◇', x: 820, y: 228, role: 'Mengakhiri media akses pelanggan dari ISP.', selectable: true },
  { id: 'internet', label: 'ISP / Internet', icon: '◎', x: 970, y: 112, role: 'Jaringan dan layanan di luar LAN.', selectable: false }
];

const gameLinks = [
  { id: 'pc-a-switch', from: 'nic-pc-a', to: 'switch' },
  { id: 'pc-b-switch', from: 'pc-b', to: 'switch' },
  { id: 'server-switch', from: 'server', to: 'switch' },
  { id: 'switch-router', from: 'switch', to: 'router' },
  { id: 'switch-ap', from: 'switch', to: 'access-point' },
  { id: 'ap-phone', from: 'access-point', to: 'phone' },
  { id: 'router-firewall', from: 'router', to: 'firewall' },
  { id: 'firewall-ont', from: 'firewall', to: 'ont' },
  { id: 'ont-internet', from: 'ont', to: 'internet' }
];

const deviceGameMissions = [
  {
    title: 'Misi 1 · Satu PC Terputus',
    symptoms: 'PC A kehilangan link kabel. PC B dan server masih dapat berkomunikasi di LAN.',
    hint: 'Gangguan hanya terjadi pada satu host. Bandingkan antarmuka dan link PC A dengan host lain.',
    target: 'nic-pc-a',
    action: 'Pasang kembali kabel pada NIC PC A, lalu periksa indikator link.',
    explanation: 'Gangguan yang hanya mengenai satu host mengarah ke link lokal: NIC, kabel, atau port akses. Switch pusat dan router tidak perlu langsung diganti.',
    downLinks: ['pc-a-switch'],
    blockedLinks: [],
    points: 17,
    choices: [
      { device: 'nic-pc-a', action: 'Pasang kembali kabel pada NIC PC A, lalu periksa indikator link.' },
      { device: 'switch', action: 'Ganti seluruh switch LAN.' },
      { device: 'router', action: 'Ubah rute default pada router.' },
      { device: 'access-point', action: 'Ganti kanal Wi-Fi access point.' }
    ]
  },
  {
    title: 'Misi 2 · Satu Laboratorium Offline',
    symptoms: 'PC kabel dan klien Wi-Fi dalam satu laboratorium kehilangan jaringan lokal; router dan koneksi ISP menyala.',
    hint: 'Cari perangkat bersama yang menjadi titik koneksi PC kabel dan uplink access point di ruangan itu.',
    target: 'switch',
    action: 'Periksa daya dan uplink switch akses, lalu pulihkan koneksi port.',
    explanation: 'Switch akses menghubungkan beberapa perangkat pada segmen LAN. Gangguan bersama pada perangkat berkabel dan uplink AP dalam satu lokasi mengarah pada switch atau uplink bersama, bukan ONT.',
    downLinks: ['pc-a-switch', 'pc-b-switch', 'server-switch', 'switch-router', 'switch-ap'],
    blockedLinks: [],
    points: 17,
    choices: [
      { device: 'switch', action: 'Periksa daya dan uplink switch akses, lalu pulihkan koneksi port.' },
      { device: 'ont', action: 'Minta penyedia mengganti perangkat fiber seluruh gedung.' },
      { device: 'firewall', action: 'Izinkan semua jenis trafik dari internet.' },
      { device: 'access-point', action: 'Ubah kata sandi Wi-Fi untuk semua klien.' }
    ]
  },
  {
    title: 'Misi 3 · Wi-Fi Hilang di Satu Ruang',
    symptoms: 'PC kabel dan layanan internet tetap normal. Klien di satu ruang tidak mendapat sinyal Wi-Fi yang memadai.',
    hint: 'Gejala khusus pada radio nirkabel. Link kabel LAN tetap berfungsi.',
    target: 'access-point',
    action: 'Periksa daya, kanal, penempatan, dan uplink access point.',
    explanation: 'Access point menyediakan akses radio. Ketika LAN kabel tetap normal tetapi cakupan Wi-Fi di area tertentu memburuk, periksa AP, interferensi, penempatan, dan uplink-nya.',
    downLinks: [],
    blockedLinks: ['ap-phone'],
    points: 17,
    choices: [
      { device: 'router', action: 'Ganti default gateway semua PC di laboratorium.' },
      { device: 'access-point', action: 'Periksa daya, kanal, penempatan, dan uplink access point.' },
      { device: 'switch', action: 'Matikan VLAN pada seluruh jaringan.' },
      { device: 'ont', action: 'Ganti terminasi fiber ke ISP.' }
    ]
  },
  {
    title: 'Misi 4 · Server Beda Subnet',
    symptoms: 'Perangkat dapat bertukar data dalam LAN, tetapi tidak bisa mencapai server pada subnet yang berbeda.',
    hint: 'Frame lokal berfungsi. Tujuan berada di jaringan IP lain, sehingga periksa gateway dan jalur antarsubnet.',
    target: 'router',
    action: 'Periksa default gateway host dan rute IP pada router.',
    explanation: 'Switch meneruskan frame pada LAN, bukan memilih rute antarsubnet. Host mengirim trafik untuk jaringan lain ke default gateway, lalu router meneruskannya sesuai tabel rute.',
    downLinks: [],
    blockedLinks: ['switch-router'],
    points: 17,
    choices: [
      { device: 'nic-pc-a', action: 'Ganti alamat MAC NIC tanpa memeriksa jaringan tujuan.' },
      { device: 'switch', action: 'Ganti switch meski komunikasi LAN lokal normal.' },
      { device: 'router', action: 'Periksa default gateway host dan rute IP pada router.' },
      { device: 'ont', action: 'Ubah konfigurasi optik ONT meski masalahnya antarsubnet.' }
    ]
  },
  {
    title: 'Misi 5 · Layanan Tepercaya Terblokir',
    symptoms: 'Internet tersedia, tetapi aplikasi intranet resmi tidak dapat dicapai setelah aturan keamanan diperbarui.',
    hint: 'Konektivitas tetap ada. Cari perangkat yang menyaring trafik berdasarkan kebijakan.',
    target: 'firewall',
    action: 'Tinjau aturan firewall dan izinkan hanya trafik layanan intranet yang diperlukan.',
    explanation: 'Firewall menerapkan kebijakan trafik dan dapat memblokir layanan meskipun link fisik dan routing berfungsi. Tinjau aturan, ruang lingkup, dan log; jangan mematikan semua perlindungan.',
    downLinks: [],
    blockedLinks: ['router-firewall'],
    points: 16,
    choices: [
      { device: 'firewall', action: 'Tinjau aturan firewall dan izinkan hanya trafik layanan intranet yang diperlukan.' },
      { device: 'access-point', action: 'Buka jaringan Wi-Fi tanpa autentikasi.' },
      { device: 'switch', action: 'Kirim semua trafik LAN sebagai broadcast.' },
      { device: 'ont', action: 'Reset ONT fiber untuk membuka layanan aplikasi.' }
    ]
  },
  {
    title: 'Misi 6 · Jalur ISP Terputus',
    symptoms: 'Server lokal dan komunikasi satu LAN normal. Seluruh pengguna kehilangan akses melalui jaringan ISP.',
    hint: 'Koneksi internal tetap hidup. Periksa terminasi media akses pelanggan sebelum menyimpulkan seluruh perangkat LAN rusak.',
    target: 'ont',
    action: 'Periksa daya dan status optik ONT, lalu konfirmasi gangguan link dengan ISP.',
    explanation: 'ONT mengakhiri koneksi fiber pelanggan ke jaringan ISP. Periksa indikator daya/link dan jalur yang disediakan penyedia; ONT tidak otomatis melakukan fungsi routing.',
    downLinks: ['ont-internet'],
    blockedLinks: [],
    points: 16,
    choices: [
      { device: 'firewall', action: 'Nonaktifkan firewall secara permanen tanpa memeriksa gejala.' },
      { device: 'router', action: 'Hapus semua rute LAN dan ganti konfigurasi host.' },
      { device: 'ont', action: 'Periksa daya dan status optik ONT, lalu konfirmasi gangguan link dengan ISP.' },
      { device: 'access-point', action: 'Ganti kanal Wi-Fi seluruh sekolah.' }
    ]
  }
];

const stages = [
  ...lessons,
  ...activities.map((activity, index) => ({
    id: ['selection', 'builder', 'fault'][index],
    title: activity.title,
    summary: activity.summary
  })),
  {
    id: 'posttest',
    title: 'Posttest Perangkat Jaringan',
    summary: 'Evaluasi akhir untuk mengukur pemahaman seluruh materi.'
  }
];

const posttestBank = lessons.flatMap((lesson) =>
  lesson.questions.map(([question, options, answer], index) => ({
    id: `${lesson.id}-${index + 1}`, question, options, answer
  }))
).concat([
  ['Perangkat perantara yang meneruskan paket antarjaringan IP adalah ...', ['Router', 'Hub', 'NIC host'], 0],
  ['Perangkat yang menyediakan antarmuka jaringan pada PC adalah ...', ['NIC', 'ONT', 'Firewall pusat'], 0],
  ['Switch layer 2 mempelajari alamat ...', ['MAC sumber', 'Nama domain publik', 'Kata sandi Wi-Fi'], 0],
  ['Access point menghubungkan klien nirkabel ke ...', ['Jaringan yang dilayaninya', 'Sumber daya listrik ISP tanpa jaringan', 'Semua subnet tanpa routing'], 0],
  ['Fungsi umum firewall adalah ...', ['Menegakkan kebijakan trafik', 'Mengubah semua frame menjadi sinyal Wi-Fi', 'Menentukan ukuran layar'], 0],
  ['Perangkat yang mengakhiri layanan fiber pelanggan sering disebut ...', ['ONT', 'Bridge nirkabel wajib', 'Hub'], 0],
  ['Untuk mengirim ke subnet lain, host biasanya mengandalkan ...', ['Default gateway', 'Broadcast lokal sebagai router', 'Nama SSID sebagai alamat'], 0],
  ['Koneksi Wi-Fi lemah di satu area, sementara kabel berfungsi baik. Dugaan awal adalah ...', ['Cakupan atau interferensi AP', 'Semua switch pasti rusak', 'Alamat MAC server berubah'], 0],
  ['Switch mengirim frame broadcast biasanya dalam lingkup ...', ['VLAN terkait', 'Seluruh internet', 'Port WAN ISP saja'], 0],
  ['Satu unit router rumahan dapat menggabungkan ...', ['Router, switch, AP, dan fungsi akses ISP', 'Semua layanan cloud global', 'Server seluruh pengguna internet'], 0]
].map(([question, options, answer], index) => ({
  id: `umum-${index + 1}`, question, options, answer
})));

let state = readState();
let current = firstUnlocked();
let selection = null;
let currentPosttest = [];
const themeButton = $('deviceTheme');
bindThemeToggle(themeButton);

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    const passed = parsed && parsed.passed && typeof parsed.passed === 'object' ? parsed.passed : {};
    const scores = parsed && parsed.scores && typeof parsed.scores === 'object' ? parsed.scores : {};
    return { passed, scores };
  } catch (error) {
    console.warn('Progres Perangkat Jaringan tidak dapat dibaca:', error);
    return { passed: {}, scores: {} };
  }
}

function saveState() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, ...state }));
    $('saveNote').textContent = 'Progres tersimpan pada browser ini.';
    return true;
  } catch (error) {
    console.error('Progres Perangkat Jaringan tidak dapat disimpan:', error);
    $('saveNote').textContent = 'Progres gagal disimpan. Periksa ruang penyimpanan browser.';
    return false;
  }
}

function passed(index) {
  const stage = stages[index];
  const threshold = index === stages.length - 1 ? POSTTEST_MIN_PASS : MIN_PASS;
  return Boolean(stage && Number(state.passed[stage.id]) >= threshold);
}

function unlocked(index) {
  return index === 0 || passed(index - 1);
}

function firstUnlocked() {
  const next = stages.findIndex((_, index) => !passed(index));
  return next < 0 ? stages.length - 1 : next;
}

function createButton(text, className = 'primary-action') {
  const button = el('button', text, className);
  button.type = 'button';
  return button;
}

function renderNavigation() {
  const nav = $('lessonNav');
  nav.replaceChildren();
  stages.forEach((lesson, index) => {
    const button = el('button', undefined, `lesson-nav-item${index === current ? ' active' : ''}`);
    button.type = 'button';
    button.disabled = !unlocked(index);
    if (index === current) button.setAttribute('aria-current', 'step');
    const number = el('span', passed(index) ? '✓' : unlocked(index) ? String(index + 1).padStart(2, '0') : '🔒', 'lesson-number');
    const title = el('span', lesson.title);
    button.append(number, title);
    button.addEventListener('click', () => goTo(index));
    nav.append(button);
  });
  const total = stages.filter((_, index) => passed(index)).length;
  const percentage = Math.round((total / stages.length) * 100);
  $('progressText').textContent = `${percentage}%`;
  $('progressCount').textContent = `${total} dari ${stages.length} tahap lulus`;
  $('progressFill').style.width = `${percentage}%`;
  $('progressBar').setAttribute('aria-valuenow', String(percentage));
}

function goTo(index) {
  if (!unlocked(index)) return;
  current = index;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function appendObjectives(root) {
  const section = el('section', undefined, 'device-objectives');
  section.append(el('h2', '🎯 Tujuan Pembelajaran'));
  const list = el('ul');
  lessons[0].objectives.forEach((objective) => list.append(el('li', objective)));
  section.append(list);
  root.append(section);
}

function appendHook(root, text) {
  const section = el('section', undefined, 'device-hook');
  section.append(el('strong', '💡 Pertanyaan Pemantik'), el('p', text));
  root.append(section);
}

function appendIllustration(root, data) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 720 260');
  svg.setAttribute('class', 'device-diagram');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', data.caption);
  const positions = data.nodes.map((_, index) => [95 + index * (530 / (data.nodes.length - 1)), 118]);
  data.links.forEach(([from, to]) => {
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('class', 'link');
    line.setAttribute('x1', positions[from][0]);
    line.setAttribute('y1', positions[from][1]);
    line.setAttribute('x2', positions[to][0]);
    line.setAttribute('y2', positions[to][1]);
    svg.append(line);
  });
  data.nodes.forEach(([label, name], index) => {
    const [x, y] = positions[index];
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('class', `node${['SW', 'RTR', 'AP'].includes(label) ? ' primary' : ''}`);
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 35);
    const nodeLabel = document.createElementNS(NS, 'text');
    nodeLabel.setAttribute('class', 'node-label');
    nodeLabel.setAttribute('x', x);
    nodeLabel.setAttribute('y', y);
    nodeLabel.textContent = label;
    const caption = document.createElementNS(NS, 'text');
    caption.setAttribute('class', 'caption');
    caption.setAttribute('x', x);
    caption.setAttribute('y', y + 62);
    caption.textContent = name;
    svg.append(circle, nodeLabel, caption);
  });
  const figure = el('figure', undefined, 'device-figure');
  figure.append(svg, el('figcaption', data.caption));
  root.append(figure);
}

function mountDeviceFlowSimulator(root) {
  const panel = el('section', undefined, 'device-flow-simulator');
  panel.append(
    el('h2', '🧪 Simulasi Alur Perangkat 2D'),
    el('p', 'Pilih tujuan, lalu kirim paket. Klik perangkat pada peta untuk mematikan atau memulihkannya dan amati dampaknya.')
  );
  const controls = el('div', undefined, 'device-flow-controls');
  const destination = document.createElement('select');
  destination.setAttribute('aria-label', 'Tujuan paket jaringan');
  [['server', 'Server lokal'], ['internet', 'Internet']].forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    destination.append(option);
  });
  const send = createButton('📨 Kirim Paket');
  const reset = createButton('↻ Pulihkan Perangkat', 'secondary-action');
  controls.append(destination, send, reset);
  const viewport = el('div', undefined, 'device-flow-viewport');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 900 250');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Peta simulasi perangkat jaringan yang dapat diinteraksikan');
  viewport.append(svg);
  const status = el('p', 'Paket belum dikirim.', 'device-result device-flow-status');
  panel.append(controls, viewport, status, el('p', 'Simulasi ini menggambarkan alur konsep; jaringan nyata dapat memiliki perangkat dan kebijakan tambahan.', 'device-flow-note'));
  root.append(panel);

  const nodes = [
    { id: 'pc', label: 'PC / NIC', x: 75, y: 125 },
    { id: 'switch', label: 'Switch', x: 235, y: 125 },
    { id: 'server', label: 'Server lokal', x: 395, y: 55 },
    { id: 'router', label: 'Router', x: 395, y: 180 },
    { id: 'firewall', label: 'Firewall', x: 555, y: 180 },
    { id: 'ont', label: 'Modem / ONT', x: 715, y: 180 },
    { id: 'internet', label: 'ISP / Internet', x: 850, y: 180 }
  ];
  const links = [['pc', 'switch'], ['switch', 'server'], ['switch', 'router'], ['router', 'firewall'], ['firewall', 'ont'], ['ont', 'internet']];
  const offline = new Set();
  let runId = 0;
  const svgNode = (tag, attrs, text) => {
    const item = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([name, value]) => item.setAttribute(name, String(value)));
    if (text) item.textContent = text;
    return item;
  };
  function draw() {
    svg.replaceChildren();
    links.forEach(([fromId, toId]) => {
      const from = nodes.find((node) => node.id === fromId);
      const to = nodes.find((node) => node.id === toId);
      svg.append(svgNode('line', {
        x1: from.x, y1: from.y, x2: to.x, y2: to.y,
        class: `device-flow-link${offline.has(fromId) || offline.has(toId) ? ' is-offline' : ''}`
      }));
    });
    nodes.forEach((item) => {
      const group = svgNode('g', {
        class: `device-flow-node${offline.has(item.id) ? ' is-offline' : ''}`,
        tabindex: 0,
        role: 'button',
        'aria-label': `${item.label}, ${offline.has(item.id) ? 'offline' : 'online'}; klik untuk mengubah status`
      });
      group.append(svgNode('circle', { cx: item.x, cy: item.y, r: 31 }));
      group.append(svgNode('text', { x: item.x, y: item.y + 5 }, item.id === 'pc' ? 'PC' : item.id === 'internet' ? 'ISP' : item.id === 'server' ? 'SRV' : item.id === 'firewall' ? 'FW' : item.id === 'ont' ? 'ONT' : item.id === 'router' ? 'RTR' : 'SW'));
      group.append(svgNode('text', { x: item.x, y: item.y + 53, class: 'device-flow-caption' }, item.label));
      const toggle = () => {
        if (item.id === 'pc') return;
        offline.has(item.id) ? offline.delete(item.id) : offline.add(item.id);
        runId += 1;
        send.disabled = false;
        draw();
        status.textContent = `${item.label} ${offline.has(item.id) ? 'dimatikan' : 'dipulihkan'}. Kirim paket untuk menguji alurnya.`;
      };
      group.addEventListener('click', toggle);
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
      svg.append(group);
    });
  }
  send.addEventListener('click', async () => {
    const target = destination.value;
    const route = target === 'server'
      ? ['pc', 'switch', 'server']
      : ['pc', 'switch', 'router', 'firewall', 'ont', 'internet'];
    const failed = route.find((id) => offline.has(id));
    if (failed) {
      status.textContent = `Paket tertahan: ${nodes.find((node) => node.id === failed).label} sedang offline.`;
      return;
    }
    const id = ++runId;
    send.disabled = true;
    status.textContent = 'Paket sedang melewati perangkat jaringan…';
    const positions = route.map((nodeId) => nodes.find((node) => node.id === nodeId));
    const packet = svgNode('circle', { cx: positions[0].x, cy: positions[0].y, r: 9, class: 'device-flow-packet' });
    svg.append(packet);
    for (let hop = 1; hop < positions.length; hop += 1) {
      const start = positions[hop - 1];
      const end = positions[hop];
      const started = performance.now();
      await new Promise((resolve) => {
        const frame = (now) => {
          if (id !== runId || !svg.isConnected) {
            resolve();
            return;
          }
          const progress = Math.min(1, (now - started) / 380);
          packet.setAttribute('cx', String(start.x + (end.x - start.x) * progress));
          packet.setAttribute('cy', String(start.y + (end.y - start.y) * progress));
          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
      if (id !== runId) return;
    }
    packet.remove();
    send.disabled = false;
    status.textContent = `✓ Paket tiba di ${destination.options[destination.selectedIndex].textContent}.`;
  });
  reset.addEventListener('click', () => {
    offline.clear();
    runId += 1;
    send.disabled = false;
    draw();
    status.textContent = 'Semua perangkat aktif kembali.';
  });
  draw();
}

function appendCase(root, question, answer) {
  const section = el('section', undefined, 'device-case');
  section.append(el('h2', '🔎 Studi Kasus dan Analisis'), el('p', question));
  const details = document.createElement('details');
  details.append(el('summary', 'Lihat pembahasan'));
  details.append(el('p', answer));
  section.append(details);
  root.append(section);
}

function appendSummary(root, points) {
  const heading = el('h2', '📝 Rangkuman');
  const list = document.createElement('ul');
  points.forEach((point) => list.append(el('li', point)));
  root.append(heading, list);
}

function renderTheory(root, lesson, index) {
  if (index === 0) appendObjectives(root);
  appendHook(root, lesson.hook);
  lesson.sections.forEach(([heading, explanation, detail], sectionIndex) => {
    root.append(el('h2', heading), el('p', explanation), el('p', detail));
    if (sectionIndex === 0 && lesson.diagram) {
      appendIllustration(root, lesson.diagram);
      if (index === 0) mountDeviceFlowSimulator(root);
    }
  });
  const example = el('section', undefined, 'device-callout');
  example.append(el('strong', '🧩 Contoh Penerapan'), el('p', lesson.example));
  root.append(example);
  appendCase(root, lesson.caseQuestion, lesson.caseAnswer);
  appendSummary(root, lesson.summary);
  mountTheoryQuiz(root, lesson);
}

function mountTheoryQuiz(root, lesson) {
  const section = el('section', undefined, 'device-check');
  section.append(el('h2', 'Cek Pemahaman'), el('p', 'Jawab seluruh soal untuk membuka tahap berikutnya.'));
  const form = el('form', undefined, 'assessment-form');
  lesson.questions.forEach(([question, options], index) => {
    const field = document.createElement('fieldset');
    field.append(el('legend', `${index + 1}. ${question}`));
    const choices = shuffle(options.map((text, originalIndex) => ({ text, originalIndex })));
    choices.forEach(({ text, originalIndex }) => {
      const label = el('label', undefined, 'assessment-option');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `theory-${index}`;
      input.value = String(originalIndex);
      label.append(input, document.createTextNode(` ${text}`));
      field.append(label);
    });
    form.append(field);
  });
  const result = el('p', 'Pilih jawaban untuk semua soal.', 'device-result');
  const submit = createButton('Periksa Jawaban');
  submit.type = 'submit';
  form.append(submit, result);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = lesson.questions.map((_, index) => form.querySelector(`input[name="theory-${index}"]:checked`));
    if (answers.some((answer) => !answer)) {
      result.textContent = 'Jawab seluruh soal terlebih dahulu.';
      return;
    }
    const correct = answers.filter((answer, index) => Number(answer.value) === lesson.questions[index][2]).length;
    const score = Math.round((correct / answers.length) * 100);
    result.textContent = score >= MIN_PASS ? `✓ Lulus dengan nilai ${score}/100.` : `Nilai ${score}/100. Minimal ${MIN_PASS}; pelajari kembali lalu coba lagi.`;
    completeCurrent(score);
  });
  section.append(form);
  root.append(section);
}

function renderDeviceSelection(root) {
  const activity = activities[0];
  appendHook(root, 'Gunakan kebutuhan tiap skenario untuk memilih perangkat yang benar-benar menjalankan fungsi yang diminta.');
  root.append(el('h2', 'Cocokkan kebutuhan dengan perangkat'), el('p', activity.summary));
  const grid = el('div', undefined, 'scenario-grid');
  const selected = new Map();
  activity.scenarios.forEach((scenario, index) => {
    const card = el('section', undefined, 'scenario-card');
    card.append(el('h3', `${index + 1}. ${scenario.title}`), el('p', scenario.prompt));
    scenario.options.forEach((option) => {
      const button = createButton(option, '');
      button.addEventListener('click', () => {
        selected.set(index, option);
        card.querySelectorAll('button').forEach((choice) => choice.classList.toggle('selected', choice === button));
      });
      card.append(button);
    });
    grid.append(card);
  });
  root.append(grid);
  const result = el('p', 'Pilih satu perangkat pada setiap skenario.', 'device-result');
  const submit = createButton('Periksa Rancangan');
  submit.addEventListener('click', () => {
    if (selected.size !== activity.scenarios.length) {
      result.textContent = 'Pilih perangkat untuk keempat skenario.';
      return;
    }
    const correct = activity.scenarios.filter((scenario, index) => selected.get(index) === scenario.answer).length;
    const score = correct * 25;
    result.textContent = `Jawaban benar ${correct} dari 4. Nilai ${score}/100${score >= MIN_PASS ? ' — lulus!' : ` — minimal ${MIN_PASS}.`}`;
    completeCurrent(score);
  });
  root.append(submit, result);
  appendCase(root, 'Sebuah kantor kecil memiliki laptop Wi-Fi, printer Ethernet, dan server pada subnet terpisah. Fungsi perangkat apa yang dibutuhkan?', 'Access point melayani laptop Wi-Fi, switch menghubungkan perangkat Ethernet pada LAN, dan router menghubungkan subnet yang berbeda. Firewall dapat menerapkan kebijakan akses sesuai kebutuhan.');
  appendSummary(root, ['Pilih perangkat berdasarkan kebutuhan fungsi dan medianya.', 'Satu perangkat dapat menjalankan beberapa fungsi, tetapi setiap peran tetap perlu dibedakan.', 'Verifikasi kapasitas, kompatibilitas, keamanan, dan kebutuhan pengelolaan.']);
}

function renderBuilder(root) {
  const activity = activities[1];
  appendHook(root, 'Rancang LAN sederhana. Klik dua perangkat secara berurutan untuk membuat link kabel.');
  root.append(el('h2', activity.title), el('p', activity.summary));
  const instructions = el('ol');
  activity.instructions.forEach((item) => instructions.append(el('li', item)));
  root.append(instructions);
  const tools = el('div', undefined, 'builder-tools');
  const check = createButton('🔍 Periksa Topologi');
  const clear = createButton('↻ Hapus Link', 'secondary-action');
  tools.append(check, clear);
  root.append(tools);
  const board = el('div', undefined, 'device-builder');
  board.setAttribute('aria-label', 'Papan perancangan LAN interaktif');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 600 360');
  svg.setAttribute('preserveAspectRatio', 'none');
  board.append(svg);
  const nodes = [
    { id: 'pc-a', label: '💻 PC A', x: 16, y: 24, px: 90, py: 86 },
    { id: 'pc-b', label: '💻 PC B', x: 16, y: 76, px: 90, py: 274 },
    { id: 'switch', label: '🔀 Switch', x: 50, y: 50, px: 300, py: 180 },
    { id: 'server', label: '🗄️ Server', x: 84, y: 24, px: 510, py: 86 },
    { id: 'router', label: '🌐 Router', x: 84, y: 76, px: 510, py: 274 }
  ];
  const targets = new Set(['pc-a|switch', 'pc-b|switch', 'server|switch', 'router|switch']);
  const links = new Set();
  let first = null;
  const redraw = () => {
    svg.replaceChildren();
    links.forEach((key) => {
      const [from, to] = key.split('|');
      const start = nodes.find((node) => node.id === from);
      const end = nodes.find((node) => node.id === to);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', start.px);
      line.setAttribute('y1', start.py);
      line.setAttribute('x2', end.px);
      line.setAttribute('y2', end.py);
      svg.append(line);
    });
  };
  nodes.forEach((node) => {
    const button = createButton(node.label, 'device-builder-node');
    button.style.left = `${node.x}%`;
    button.style.top = `${node.y}%`;
    button.addEventListener('click', () => {
      if (first === null) {
        first = node.id;
        button.classList.add('selected');
        $('builderResult').textContent = `${node.label} dipilih. Pilih perangkat tujuan.`;
        return;
      }
      if (first !== node.id) {
        const pair = [first, node.id].sort().join('|');
        links.add(pair);
      }
      first = null;
      board.querySelectorAll('.device-builder-node').forEach((item) => item.classList.remove('selected'));
      redraw();
      $('builderResult').textContent = `${links.size} link dibuat.`;
    });
    board.append(button);
  });
  root.append(board);
  const result = el('p', 'Belum ada link.', 'device-result');
  result.id = 'builderResult';
  clear.addEventListener('click', () => {
    links.clear();
    first = null;
    board.querySelectorAll('.device-builder-node').forEach((item) => item.classList.remove('selected'));
    redraw();
    result.textContent = 'Semua link dihapus.';
  });
  check.addEventListener('click', () => {
    const correct = [...targets].filter((target) => links.has(target)).length;
    const score = Math.max(0, Math.round((correct - Math.max(0, links.size - targets.size)) / targets.size * 100));
    result.textContent = `${correct} dari 4 link yang diminta sudah benar. Nilai ${score}/100${score >= MIN_PASS ? ' — lulus!' : ` — minimal ${MIN_PASS}.`}`;
    completeCurrent(score);
  });
  root.append(result);
  appendCase(root, 'Jika salah satu kabel PC ke switch putus, tetapi PC lain dan server lokal tetap terhubung, area mana yang paling awal diperiksa?', 'Periksa NIC PC tersebut, kabel, dan port switch yang dipakai. Gangguan pada satu link akses biasanya tidak memutus seluruh LAN.');
}

function renderFaultChallenge(root) {
  const activity = activities[2];
  const game = el('section', undefined, 'packet-rescue-game');
  const missions = deviceGameMissions.map((mission) => ({
    ...mission,
    choices: shuffle(mission.choices)
  }));
  let missionIndex = 0;
  let selectedDevice = null;
  let score = 0;
  let energy = 4;
  let retrying = false;
  let feedback = null;
  let finished = false;
  let mapScrollLeft = 0;

  function drawMap(mission, repaired) {
    const viewport = el('div', undefined, 'device-game-viewport');
    viewport.setAttribute('aria-label', 'Peta jaringan 2D, geser mendatar untuk melihat seluruh jaringan.');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1040 500');
    svg.setAttribute('class', 'device-game-map');
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Peta perangkat dan koneksi jaringan simulasi');

    const svgNode = (tag, attributes, text) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
      if (text) node.textContent = text;
      return node;
    };
    const coordinates = new Map(gameNodes.map((node) => [node.id, node]));
    const networkTitle = svgNode('text', { x: 26, y: 34, class: 'device-game-map-label' }, 'SIMULASI JARINGAN · LAB TJKT');
    svg.append(networkTitle);
    gameLinks.forEach((link) => {
      const from = coordinates.get(link.from);
      const to = coordinates.get(link.to);
      const isDown = !repaired && mission.downLinks.includes(link.id);
      const isBlocked = !repaired && mission.blockedLinks.includes(link.id);
      const line = svgNode('line', {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        class: `device-game-link${isDown ? ' is-down' : ''}${isBlocked ? ' is-degraded' : ''}${repaired ? ' is-repaired' : ''}`
      });
      svg.append(line);
    });

    gameNodes.forEach((device) => {
      const attachedDownLink = mission.downLinks.some((id) => {
        const link = gameLinks.find((item) => item.id === id);
        return link && (link.from === device.id || link.to === device.id);
      });
      const attachedBlockedLink = mission.blockedLinks.some((id) => {
        const link = gameLinks.find((item) => item.id === id);
        return link && (link.from === device.id || link.to === device.id);
      });
      const status = repaired
        ? 'LINK PULIH'
        : attachedDownLink
          ? device.id === 'switch' && device.id === mission.target
            ? 'SWITCH OFFLINE'
            : device.id === 'switch'
              ? 'PORT TERGANGGU'
              : 'LINK PUTUS'
          : attachedBlockedLink
            ? 'TRAFIK TERGANGGU'
            : 'AKTIF';
      const group = svgNode('g', {
        class: `device-game-node${device.selectable ? ' is-selectable' : ' is-context'}${device.id === selectedDevice ? ' is-selected' : ''}`,
        transform: `translate(${device.x} ${device.y})`,
        role: device.selectable ? 'button' : 'img',
        tabindex: device.selectable ? '0' : '-1',
        'aria-label': `${device.label}. ${device.role}${device.selectable ? ' Pilih untuk diperiksa.' : ''}`,
        'aria-pressed': device.selectable ? String(device.id === selectedDevice) : 'false'
      });
      group.append(
        svgNode('rect', { x: -68, y: -37, width: 136, height: 74, rx: 15, class: 'device-game-node-card' }),
        svgNode('circle', { cx: -43, cy: 0, r: 17, class: 'device-game-node-icon' }),
        svgNode('text', { x: -43, y: 5, class: 'device-game-icon-label' }, device.icon),
        svgNode('text', { x: -19, y: -2, class: 'device-game-node-name' }, device.label),
        svgNode('text', { x: -19, y: 17, class: 'device-game-node-status' }, status)
      );
      if (device.selectable) {
        const selectDevice = () => {
          if (feedback || finished) return;
          selectedDevice = device.id;
          draw();
        };
        group.addEventListener('click', selectDevice);
        group.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectDevice();
          }
        });
      }
      svg.append(group);
    });

    viewport.append(svg);
    return viewport;
  }

  function finishGame() {
    finished = true;
    completeCurrent(score);
    draw();
  }

  function draw() {
    const viewport = game.querySelector('.device-game-viewport');
    if (viewport) mapScrollLeft = viewport.scrollLeft;
    game.replaceChildren();
    const header = el('div', undefined, 'device-game-header');
    header.append(
      el('span', '🎮 GAME 2D INTERAKTIF', 'device-game-badge'),
      el('span', 'PACKET RESCUE', 'device-game-brand')
    );
    game.append(header, el('p', 'Pilih perangkat bermasalah pada peta, lalu tentukan tindakan pemulihan. Jawaban keliru mengurangi energi.', 'device-game-instructions'));

    if (finished) {
      const result = el('section', undefined, `device-game-finish${score >= MIN_PASS ? ' is-victory' : ''}`);
      result.setAttribute('role', 'status');
      result.setAttribute('aria-live', 'polite');
      const completed = missionIndex >= missions.length;
      result.append(
        el('span', score >= MIN_PASS ? '🏆' : '🔧', 'device-game-finish-icon'),
        el('h2', score >= MIN_PASS ? 'Jaringan Kembali Online!' : 'Sinyal Masih Terputus'),
        el('p', completed
          ? `Skor ${score}/100 · ${missions.length} misi telah diperiksa.`
          : `Skor ${score}/100 · energi habis pada ${missions[missionIndex].title}.`)
      );
      result.append(el('p', score >= MIN_PASS
        ? 'Kamu berhasil mendiagnosis perangkat dan memulihkan jaringan. Siap untuk evaluasi akhir?'
        : `Skor minimal ${MIN_PASS} diperlukan. Perhatikan cakupan gangguan, lalu coba kembali.`));
      const retry = createButton('↻ Mainkan Lagi', 'secondary-action');
      retry.addEventListener('click', () => {
        mapScrollLeft = 0;
        renderFaultChallenge(root);
      });
      result.append(retry);
      game.append(result);
      appendSummary(game, [
        'Mulai dari lingkup gejala sebelum menentukan perangkat yang perlu diperiksa.',
        'NIC menangani antarmuka host; switch menghubungkan LAN; AP menyediakan akses Wi-Fi.',
        'Router memilih rute IP; firewall menerapkan kebijakan trafik; ONT mengakhiri akses fiber pelanggan.'
      ]);
      root.append(game);
      return;
    }

    const mission = missions[missionIndex];
    const solved = Boolean(feedback && feedback.correct === true);
    const hud = el('div', undefined, 'device-game-hud');
    const progress = el('div', undefined, 'device-game-progress');
    progress.append(el('span', `MISI ${missionIndex + 1} / ${missions.length}`));
    const progressTrack = el('div', undefined, 'device-game-progress-track');
    const progressFill = el('span', undefined, 'device-game-progress-fill');
    progressFill.style.width = `${(missionIndex / missions.length) * 100}%`;
    progressTrack.append(progressFill);
    progress.append(progressTrack);
    hud.append(
      progress,
      el('span', `⚡ Energi ${'●'.repeat(energy)}${'○'.repeat(4 - energy)}`, 'device-game-energy'),
      el('span', `⭐ ${score} / 100`, 'device-game-score')
    );
    game.append(hud);

    const alert = el('section', undefined, 'device-game-alert');
    alert.append(
      el('span', '🚨 GANGGUAN TERDETEKSI', 'device-game-alert-label'),
      el('h2', mission.title),
      el('p', mission.symptoms)
    );
    const hint = document.createElement('details');
    hint.className = 'device-game-hint';
    hint.append(el('summary', 'Buka petunjuk misi'), el('p', mission.hint));
    alert.append(hint);
    game.append(alert, drawMap(mission, solved));
    game.querySelector('.device-game-viewport').scrollLeft = mapScrollLeft;
    const legend = el('div', undefined, 'device-game-legend');
    legend.append(
      el('span', 'Jalur aktif', 'is-active'),
      el('span', 'Link putus', 'is-down'),
      el('span', 'Trafik terganggu', 'is-degraded')
    );
    game.append(legend);

    const actionPanel = el('section', undefined, 'device-game-action-panel');
    actionPanel.setAttribute('aria-live', 'polite');
    actionPanel.setAttribute('aria-atomic', 'true');
    if (feedback) {
      actionPanel.classList.add(feedback.correct ? 'is-correct' : 'is-incorrect');
      actionPanel.setAttribute('role', 'status');
      actionPanel.setAttribute('aria-live', 'polite');
      actionPanel.append(
        el('strong', feedback.correct ? '✅ Koneksi berhasil dipulihkan!' : '🟠 Diagnosis belum tepat'),
        el('p', feedback.correct
          ? mission.explanation
          : `Tindakan pada ${gameNodes.find((node) => node.id === feedback.device).label} belum sesuai. Energi berkurang. ${mission.hint}`)
      );
      if (feedback.correct) {
        const next = createButton(missionIndex === missions.length - 1 ? 'Lihat Hasil Game →' : 'Misi Berikutnya →');
        next.addEventListener('click', () => {
          if (missionIndex === missions.length - 1) {
            finishGame();
            return;
          }
          missionIndex += 1;
          selectedDevice = null;
          retrying = false;
          feedback = null;
          mapScrollLeft = 0;
          draw();
        });
        actionPanel.append(next);
      } else if (energy > 0) {
        const retry = createButton('Coba Diagnosis Lagi', 'secondary-action');
        retry.addEventListener('click', () => {
          selectedDevice = null;
          feedback = null;
          draw();
        });
        actionPanel.append(retry);
      } else {
        actionPanel.append(el('p', 'Energi habis. Tinjau petunjuk sebelum memulai ulang.'));
      }
    } else {
      actionPanel.append(
        el('h3', selectedDevice
          ? `Perangkat dipilih: ${gameNodes.find((node) => node.id === selectedDevice).label}`
          : 'Tentukan titik gangguannya'),
        el('p', selectedDevice
          ? gameNodes.find((node) => node.id === selectedDevice).role
          : 'Pilih perangkat pada peta. Perhatikan gejala dan jalur yang terganggu.')
      );
      if (selectedDevice) {
        const choices = el('div', undefined, 'device-game-choices');
        mission.choices.forEach((choice) => {
          const button = createButton(choice.action, 'device-game-choice');
          button.addEventListener('click', () => {
            const correct = selectedDevice === mission.target && choice.action === mission.action;
            if (correct) {
              score += retrying ? Math.floor(mission.points / 2) : mission.points;
              feedback = { correct: true };
            } else {
              energy -= 1;
              retrying = true;
              feedback = { correct: false, device: selectedDevice };
              if (energy === 0) {
                finishGame();
                return;
              }
            }
            draw();
          });
          choices.append(button);
        });
        actionPanel.append(el('strong', 'Pilih tindakan pemulihan:'), choices);
      }
    }
    game.append(actionPanel);
    root.append(game);
    const restoreScroll = mapScrollLeft;
    requestAnimationFrame(() => {
      const map = game.querySelector('.device-game-viewport');
      if (map) map.scrollLeft = restoreScroll;
    });
  }

  draw();
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function renderPosttest(root) {
  appendHook(root, 'Kerjakan evaluasi secara mandiri. Gunakan alasan fungsi perangkat untuk memilih jawaban.');
  root.append(el('h2', 'Posttest Perangkat Jaringan'), el('p', `Sepuluh soal dipilih secara acak. Semua soal wajib dijawab dan nilai minimal kelulusan ${POSTTEST_MIN_PASS}.`));
  const form = el('form', undefined, 'assessment-form');
  const result = el('p', 'Nilai tersimpan pada browser ini.', 'device-result');
  const submit = createButton('Kumpulkan Posttest');
  submit.type = 'submit';
  function start() {
    currentPosttest = shuffle(posttestBank).slice(0, 10);
    form.replaceChildren();
    currentPosttest.forEach((item, index) => {
      const field = document.createElement('fieldset');
      field.append(el('legend', `${index + 1}. ${item.question}`));
      const choices = shuffle(item.options.map((text, originalIndex) => ({ text, originalIndex })));
      choices.forEach(({ text, originalIndex }) => {
        const label = el('label', undefined, 'assessment-option');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `posttest-${index}`;
        input.value = String(originalIndex);
        label.append(input, document.createTextNode(` ${text}`));
        field.append(label);
      });
      form.append(field);
    });
    form.append(submit, result);
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = currentPosttest.map((_, index) => form.querySelector(`input[name="posttest-${index}"]:checked`));
    if (answers.some((answer) => !answer)) {
      result.textContent = 'Jawab seluruh 10 soal terlebih dahulu.';
      return;
    }
    const correct = answers.filter((answer, index) => Number(answer.value) === currentPosttest[index].answer).length;
    const score = correct * 10;
    result.textContent = `${correct}/10 benar. Nilai ${score}/100${score >= POSTTEST_MIN_PASS ? ' — lulus!' : ` — minimal ${POSTTEST_MIN_PASS}, pelajari kembali lalu ulangi.`}`;
    completeCurrent(score);
    if (passed(8)) showCertificate(root);
    const retry = createButton('Ulangi dengan Soal Acak', 'secondary-action');
    retry.addEventListener('click', start);
    if (!form.querySelector('.retry-posttest')) {
      retry.classList.add('retry-posttest');
      form.append(retry);
    }
  });
  start();
  root.append(form);
  if (passed(8)) showCertificate(root);
  appendSummary(root, ['Posttest mencakup perangkat akhir, switching, routing, akses nirkabel, dan keamanan.', 'Nilai minimal 80/100 diperlukan untuk lulus.', 'Hasil disimpan pada browser yang digunakan.']);
}

function showCertificate(root) { window.TJKTCertificateFlow?.refresh(); }

function completeCurrent(score) {
  const id = stages[current].id;
  const requiredScore = current === stages.length - 1 ? POSTTEST_MIN_PASS : MIN_PASS;
  state.scores[id] = Math.max(Number(state.scores[id]) || 0, score);
  if (score >= requiredScore) state.passed[id] = score;
  saveState();
  renderNavigation();
  $('nextLesson').disabled = !passed(current) || current === stages.length - 1;
  $('gateMessage').textContent = score >= requiredScore
    ? `✓ Lulus dengan nilai ${score}/100. Tahap berikutnya terbuka.`
    : `Nilai ${score}/100 belum mencapai nilai minimum ${requiredScore}. Coba lagi setelah meninjau materi.`;
}

function render() {
  const lesson = stages[current];
  $('breadcrumb').textContent = lesson.title;
  $('lessonKicker').textContent = current === 7
    ? 'GAME INTERAKTIF · 2D'
    : current === 8
      ? 'EVALUASI AKHIR'
      : current >= 5
        ? `PRAKTIK ${String(current - 4).padStart(2, '0')}`
        : `MATERI ${String(current + 1).padStart(2, '0')}`;
  $('lessonTitle').textContent = lesson.title;
  $('lessonSummary').textContent = lesson.summary;
  $('previousLesson').disabled = current === 0;
  $('nextLesson').disabled = !passed(current) || current === stages.length - 1;
  $('gateMessage').textContent = passed(current)
    ? `✓ Tahap ini lulus. Nilai terbaik: ${state.scores[lesson.id]}/100.`
    : current === 8 ? 'Jawab seluruh soal dan raih minimal 80 untuk menuntaskan modul.' : 'Luluskan evaluasi tahap ini untuk membuka tahap berikutnya.';
  const root = $('lessonContent');
  root.replaceChildren();
  if (current < 5) renderTheory(root, lesson, current);
  else if (current === 5) renderDeviceSelection(root);
  else if (current === 6) renderBuilder(root);
  else if (current === 7) mountActionGame(root, { moduleId:'perangkat-jaringan', mode:'2d', onComplete:completeCurrent });
  else renderPosttest(root);
  renderNavigation();
}

$('previousLesson').addEventListener('click', () => {
  if (current > 0) goTo(current - 1);
});

$('nextLesson').addEventListener('click', () => {
  if (passed(current) && current < stages.length - 1) goTo(current + 1);
});

$('resetProgress').addEventListener('click', () => {
  if (!window.confirm('Hapus progres dan nilai modul Perangkat Jaringan pada browser ini?')) return;
  try {
    localStorage.removeItem(KEY);
    state = { passed: {}, scores: {} };
    current = 0;
    const certificate = document.getElementById('devicePrintableCertificate');
    if (certificate) certificate.remove();
    render();
    $('gateMessage').textContent = 'Progres modul Perangkat Jaringan telah direset.';
  } catch (error) {
    console.error('Progres Perangkat Jaringan gagal direset:', error);
    $('saveNote').textContent = 'Progres gagal direset. Periksa pengaturan penyimpanan browser.';
  }
});

render();

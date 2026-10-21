import { bindThemeToggle } from './theme.js';
import { mountChapterNavigation } from './chapter-navigation.js?v=5';

mountChapterNavigation({
  moduleId: 'troubleshooting',
  title: 'Troubleshooting Jaringan Dasar',
  chapters: [
    {
      id: 'pengantar',
      title: 'Memulai Troubleshooting',
      summary: 'Kenali gejala, kumpulkan bukti, uji hipotesis, dan verifikasi pemulihan.',
      questions: [{ question: 'Langkah yang tepat sebelum mengubah konfigurasi jaringan adalah ...', options: ['Mengumpulkan bukti dan mencatat kondisi awal', 'Mereset semua perangkat', 'Mengubah banyak pengaturan sekaligus'], answer: 0 }]
    },
    {
      id: 'metode',
      title: 'Mengisolasi Lingkup Masalah',
      summary: 'Bandingkan perangkat dan segmen untuk mempersempit sumber gangguan.',
      questions: [{ question: 'Jika hanya satu klien yang terdampak sementara klien lain normal, pemeriksaan awal sebaiknya berfokus pada ...', options: ['Konfigurasi dan koneksi klien tersebut', 'Seluruh jaringan tanpa membandingkan bukti', 'Mengganti semua perangkat jaringan'], answer: 0 }]
    },
    {
      id: 'fisik',
      title: 'Memeriksa Link Fisik dan Tautan',
      summary: 'Periksa daya, adaptor, kabel, port, dan status koneksi sebelum konfigurasi.',
      questions: [{ question: 'Klien menunjukkan status media terputus. Pemeriksaan awal yang paling relevan adalah ...', options: ['Kabel, port, adaptor, dan status link', 'Record MX domain', 'Alamat DNS publik saja'], answer: 0 }]
    },
    {
      id: 'ip',
      title: 'Memeriksa Konfigurasi IP',
      summary: 'Periksa alamat, prefix, gateway, dan sumber konfigurasi klien.',
      questions: [{ question: 'Alamat IPv4 169.254.x.x pada klien Windows biasanya mengisyaratkan ...', options: ['Klien mungkin belum memperoleh konfigurasi DHCP', 'DNS pasti berjalan normal', 'Default gateway selalu benar'], answer: 0 }]
    },
    {
      id: 'layanan',
      title: 'Menguji Gateway, Jalur, dan DNS',
      summary: 'Bandingkan tes lokal, gateway, alamat IP tujuan, dan nama domain.',
      questions: [{ question: 'Ping ke alamat IP tujuan berhasil, tetapi pencarian nama domain gagal. Area yang perlu diperiksa berikutnya adalah ...', options: ['Konfigurasi atau layanan DNS', 'Kabel antara keyboard dan komputer', 'Resolusi layar klien'], answer: 0 }]
    },
    {
      id: 'alat',
      title: 'Memilih Alat Diagnostik',
      summary: 'Pilih perintah untuk memeriksa konfigurasi, respons, jalur, atau resolusi nama.',
      questions: [{ question: 'Perintah yang umum digunakan untuk memeriksa jawaban resolver terhadap nama domain adalah ...', options: ['nslookup', 'tracert', 'ipconfig /release'], answer: 0 }]
    },
    {
      id: 'simulator',
      title: 'Network Clinic: Lab Diagnosa',
      summary: 'Kumpulkan bukti dari alat pemeriksaan, lakukan perbaikan, dan verifikasi hasil.',
      type: 'simulation',
      questions: [{ question: 'Mengapa satu hasil ping yang gagal belum selalu membuktikan bahwa seluruh layanan tujuan mati?', options: ['ICMP dapat diblokir sementara layanan lain tetap tersedia', 'Ping mematikan koneksi jaringan', 'Ping hanya bekerja saat DNS rusak'], answer: 0 }]
    },
    {
      id: 'game',
      title: 'Network Rescue Run — Petualangan Pemulihan',
      summary: 'Bawa laporan melalui empat pos pemeriksaan, hindari zona gangguan, dan selesaikan tiga level.',
      type: 'game',
      questions: [{ question: 'Urutan tindakan dalam misi pemulihan adalah ...', options: ['Amati gejala, pilih perangkat, lalu terapkan perbaikan yang sesuai', 'Pilih perangkat acak lalu reset seluruh jaringan', 'Lewati pemeriksaan dan ubah semua konfigurasi'], answer: 0 }]
    },
    {
      id: 'posttest',
      title: 'Posttest Troubleshooting Jaringan',
      summary: 'Evaluasi metode, pemeriksaan, alat diagnosa, dan pemulihan gangguan.',
      questions: [
        { question: 'Langkah awal troubleshooting yang baik adalah ...', options: ['Mengidentifikasi gejala dan lingkup dampak', 'Mengubah banyak konfigurasi sekaligus', 'Mengabaikan kondisi awal'], answer: 0 },
        { question: 'Apa yang sebaiknya dilakukan sebelum perubahan konfigurasi?', options: ['Mencatat kondisi awal dan mengumpulkan bukti', 'Mematikan semua perangkat', 'Menghapus seluruh catatan jaringan'], answer: 0 },
        { question: 'Status media terputus paling tepat ditindaklanjuti dengan pemeriksaan ...', options: ['Kabel, port, adaptor, dan link', 'Record DNS', 'Sertifikat HTTPS'], answer: 0 },
        { question: 'Alamat 169.254.x.x pada klien Windows sering menunjukkan ...', options: ['Klien mungkin belum menerima konfigurasi DHCP', 'Koneksi internet pasti tersedia', 'DNS pasti menjawab dengan benar'], answer: 0 },
        { question: 'Ping gateway digunakan untuk membantu memeriksa ...', options: ['Keterjangkauan gateway dari klien', 'Isi halaman web', 'Validitas sertifikat TLS'], answer: 0 },
        { question: 'Alamat IP tujuan merespons ping tetapi nama domain tidak terurai. Periksa ...', options: ['DNS resolver dan konfigurasi DNS', 'Kabel daya monitor', 'Resolusi layar'], answer: 0 },
        { question: 'Perintah untuk meminta informasi jalur hop menuju tujuan di Windows adalah ...', options: ['tracert', 'nslookup', 'ipconfig /flushdns'], answer: 0 },
        { question: 'Setelah perbaikan, langkah yang penting adalah ...', options: ['Uji layanan yang terdampak kembali dan catat hasilnya', 'Menganggap masalah pasti selesai tanpa tes', 'Mengubah kembali seluruh konfigurasi'], answer: 0 }
      ]
    }
  ]
});

bindThemeToggle(document.getElementById('troubleThemeToggle'));

const incidentSelect = document.getElementById('incidentSelect');
const diagram = document.getElementById('labDiagram');
const caption = document.getElementById('labCaption');
const toolsContainer = document.getElementById('diagnosticTools');
const output = document.getElementById('diagnosticOutput');
const repairSelect = document.getElementById('repairSelect');
const repairButton = document.getElementById('applyRepair');
const labStatus = document.getElementById('labStatus');
const svgNS = 'http://www.w3.org/2000/svg';

const incidents = {
  cable: {
    caption: 'Insiden klien: tautan kabel antara klien dan switch terputus.',
    faultLink: 0,
    required: ['link', 'ip'],
    repair: 'reseat-cable',
    title: 'Link klien terputus',
    results: {
      link: 'Tidak ada link pada adaptor klien. Periksa kabel, port, dan adaptor.',
      ip: 'Adaptor Ethernet menunjukkan media terputus; klien belum berkomunikasi melalui link ini.',
      gateway: 'Gateway tidak dapat dijangkau. Link klien masih terputus.',
      target: 'Alamat IP tujuan tidak merespons dari klien ini.',
      dns: 'Kueri nama tidak memperoleh jawaban melalui koneksi saat ini.',
      route: 'Jalur belum dapat diperiksa karena koneksi lokal tidak aktif.'
    }
  },
  gateway: {
    caption: 'Insiden klien: default gateway terisi alamat yang tidak sesuai rencana gateway jaringan.',
    faultNode: 0,
    required: ['ip', 'gateway'],
    repair: 'check-gateway',
    title: 'Default gateway klien keliru',
    results: {
      link: 'Link klien, switch, dan router terdeteksi aktif.',
      ip: 'IPv4 192.168.10.24/24 aktif. Default gateway 192.168.10.254 tidak sesuai gateway segmen, yaitu 192.168.10.1.',
      gateway: 'Gateway yang dikonfigurasi tidak merespons. Bandingkan alamat dengan rencana subnet.',
      target: 'Alamat IP di luar subnet tidak dapat dijangkau dari klien.',
      dns: 'Resolver tidak dapat dijangkau melalui default gateway yang dikonfigurasi.',
      route: 'Rute ke jaringan tujuan tidak memiliki next-hop yang berfungsi.'
    }
  },
  dns: {
    caption: 'Insiden layanan: koneksi IP berfungsi, tetapi resolver DNS tidak merespons.',
    faultNode: 3,
    required: ['gateway', 'target', 'dns'],
    repair: 'check-dns',
    title: 'Layanan DNS tidak merespons',
    results: {
      link: 'Link klien dan jalur menuju router terdeteksi aktif.',
      ip: 'Alamat, prefix, dan default gateway klien tampak sesuai konfigurasi latihan.',
      gateway: 'Gateway 192.168.10.1 merespons dari klien.',
      target: 'Alamat IP tujuan 203.0.113.20 merespons. Ini alamat dokumentasi untuk simulasi.',
      dns: 'nslookup tidak menerima jawaban dari resolver yang dikonfigurasi.',
      route: 'Jalur IP menuju tujuan latihan tersedia; gangguan tampak terbatas pada pencarian nama.'
    }
  }
};

const diagnosticTools = [
  { id: 'link', label: '🔌 Periksa Link' },
  { id: 'ip', label: '🧾 ipconfig /all' },
  { id: 'gateway', label: '📡 Ping Gateway' },
  { id: 'target', label: '🌍 Ping IP Tujuan' },
  { id: 'dns', label: '🔎 nslookup' },
  { id: 'route', label: '🧭 tracert / traceroute' }
];
let checkedTools = new Set();
let repaired = false;

function createSvgNode(tag, attributes, text) {
  const node = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  if (text) node.textContent = text;
  return node;
}

function drawTopology() {
  const incident = incidents[incidentSelect.value];
  const positions = [95, 265, 435, 605, 760];
  const nodeLabels = [
    ['KLIEN', '192.168.10.24'],
    ['SWITCH', 'Link lokal'],
    ['ROUTER', 'Gateway .1'],
    ['DNS', 'Resolver'],
    ['TUJUAN', 'Layanan IP']
  ];
  if (incidentSelect.value === 'gateway') nodeLabels[0][1] = repaired ? 'Gateway .1 · Pulih' : 'Gateway .254 · Salah';
  if (incidentSelect.value === 'dns') nodeLabels[3][1] = repaired ? 'Resolver aktif' : 'Tidak merespons';
  diagram.replaceChildren(createSvgNode('title', {}, incident.caption));
  for (let index = 0; index < positions.length - 1; index += 1) {
    diagram.append(createSvgNode('line', {
      x1: positions[index] + 48,
      y1: 106,
      x2: positions[index + 1] - 48,
      y2: 106,
      class: `trouble-svg-link${incident.faultLink === index && !repaired ? ' is-fault' : ''}`
    }));
  }
  nodeLabels.forEach((labels, index) => {
    const isFault = incident.faultNode === index && !repaired;
    diagram.append(
      createSvgNode('rect', {
        x: positions[index] - 48,
        y: 66,
        width: 96,
        height: 80,
        rx: 15,
        class: `trouble-svg-node${isFault ? ' is-fault' : ''}`
      }),
      createSvgNode('text', { x: positions[index], y: 100, class: 'trouble-svg-label' }, labels[0]),
      createSvgNode('text', { x: positions[index], y: 122, class: 'trouble-svg-label' }, labels[1])
    );
  });
  caption.textContent = repaired ? 'Koneksi pulih. Uji layanan terdampak untuk memverifikasi hasil.' : incident.caption;
}

function renderDiagnostics() {
  toolsContainer.replaceChildren();
  diagnosticTools.forEach((tool) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = tool.label;
    button.setAttribute('aria-pressed', String(checkedTools.has(tool.id)));
    button.addEventListener('click', () => {
      checkedTools.add(tool.id);
      const incident = incidents[incidentSelect.value];
      output.textContent = repaired
        ? `Verifikasi ${tool.label}: layanan latihan merespons setelah pemulihan.`
        : `${tool.label}: ${incident.results[tool.id]}`;
      renderDiagnostics();
    });
    toolsContainer.append(button);
  });
}

function resetLab() {
  checkedTools = new Set();
  repaired = false;
  repairSelect.value = '';
  output.textContent = 'Pilih pemeriksaan untuk melihat bukti.';
  labStatus.textContent = 'Pemeriksaan tidak mengubah jaringan nyata; ini adalah latihan konseptual.';
  drawTopology();
  renderDiagnostics();
}

incidentSelect.addEventListener('change', resetLab);
document.getElementById('resetLab').addEventListener('click', resetLab);
repairButton.addEventListener('click', () => {
  const incident = incidents[incidentSelect.value];
  if (repaired) {
    labStatus.textContent = 'Insiden sudah pulih. Jalankan pemeriksaan lagi untuk memverifikasi layanan.';
    return;
  }
  if (!incident.required.every((tool) => checkedTools.has(tool))) {
    const requiredLabels = incident.required
      .map((id) => diagnosticTools.find((tool) => tool.id === id).label)
      .join(' dan ');
    labStatus.textContent = `Kumpulkan bukti terlebih dahulu dengan ${requiredLabels}.`;
    return;
  }
  if (repairSelect.value !== incident.repair) {
    labStatus.textContent = 'Perbaikan belum sesuai dengan bukti yang ditemukan. Tinjau hasil pemeriksaan dan coba lagi.';
    return;
  }
  repaired = true;
  labStatus.textContent = `✓ ${incident.title} berhasil dipulihkan. Jalankan pemeriksaan sekali lagi untuk memverifikasi koneksi.`;
  output.textContent = 'Verifikasi awal: jalur jaringan latihan telah pulih.';
  drawTopology();
  renderDiagnostics();
});
resetLab();

const missions = [
  {
    brief: 'Klien tidak memiliki link. Pemeriksaan menunjukkan adaptor aktif, tetapi kabel klien tidak terhubung.',
    device: 'client',
    action: 'reseat-cable',
    actions: [
      { id: 'reseat-cable', label: 'Pasang kembali kabel klien' },
      { id: 'change-dns', label: 'Ubah alamat DNS klien' },
      { id: 'restart-router', label: 'Mulai ulang router' }
    ],
    success: 'Link klien tersambung kembali. Paket latihan mencapai switch.'
  },
  {
    brief: 'Klien dapat terhubung ke switch, tetapi jaringan di luar subnet tidak terjangkau. Gateway pada klien tidak sesuai.',
    device: 'client',
    action: 'correct-gateway',
    actions: [
      { id: 'renew-dns', label: 'Perbarui cache DNS' },
      { id: 'correct-gateway', label: 'Perbaiki default gateway' },
      { id: 'replace-switch', label: 'Ganti switch' }
    ],
    success: 'Default gateway klien sesuai dengan jaringan latihan. Jalur ke luar subnet tersedia.'
  },
  {
    brief: 'Gateway dan alamat IP tujuan merespons, tetapi nama layanan tidak ditemukan karena resolver DNS tidak aktif.',
    device: 'dns',
    action: 'start-dns',
    actions: [
      { id: 'start-dns', label: 'Pulihkan layanan resolver DNS' },
      { id: 'reseat-cable', label: 'Ganti kabel klien' },
      { id: 'correct-gateway', label: 'Ubah default gateway klien' }
    ],
    success: 'Resolver menjawab kueri nama. Klien dapat menemukan layanan menggunakan nama domain.'
  }
];

const gameDevices = [...document.querySelectorAll('.rescue-device')];
const missionLabel = document.getElementById('missionLabel');
const missionBrief = document.getElementById('missionBrief');
const rescueScore = document.getElementById('rescueScore');
const rescueActions = document.getElementById('rescueActions');
const rescueStatus = document.getElementById('rescueStatus');
const startMissionButton = document.getElementById('startMission');
let missionIndex = -1;
let selectedDevice = '';
let mistakes = 0;
let repairedMissions = new Set();

function updateGame() {
  const active = missionIndex >= 0 && missionIndex < missions.length;
  missionLabel.textContent = `MISI ${active ? missionIndex + 1 : Math.min(missionIndex + 1, missions.length)}/${missions.length}`;
  rescueScore.textContent = `Perangkat pulih ${repairedMissions.size}/${missions.length} · Langkah keliru ${mistakes}`;
  gameDevices.forEach((button) => {
    const id = button.dataset.device;
    button.disabled = !active || repairedMissions.has(missionIndex);
    button.setAttribute('aria-pressed', String(selectedDevice === id));
    button.classList.toggle('is-repaired', repairedMissions.has(missionIndex) && missions[missionIndex]?.device === id);
  });
  rescueActions.replaceChildren();
  if (active) {
    missions[missionIndex].actions.forEach((action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      button.disabled = !selectedDevice || repairedMissions.has(missionIndex);
      button.addEventListener('click', () => attemptRepair(action.id));
      rescueActions.append(button);
    });
  }
  startMissionButton.textContent = repairedMissions.size === missions.length ? '✓ Semua Misi Selesai' : active ? 'Misi Sedang Berjalan' : '▶ Mulai Misi';
  startMissionButton.disabled = active || repairedMissions.size === missions.length;
}

function startNextMission() {
  if (repairedMissions.size === missions.length) {
    rescueStatus.textContent = '🏆 Semua insiden berhasil dipulihkan. Tekan Mulai Ulang Game untuk bermain kembali.';
    return;
  }
  missionIndex = missions.findIndex((_, index) => !repairedMissions.has(index));
  selectedDevice = '';
  missionBrief.textContent = missions[missionIndex].brief;
  rescueStatus.textContent = 'Pilih perangkat pada peta jaringan, lalu pilih tindakan yang sesuai.';
  updateGame();
}

function attemptRepair(actionId) {
  if (missionIndex < 0 || !selectedDevice) return;
  const mission = missions[missionIndex];
  if (selectedDevice === mission.device && actionId === mission.action) {
    repairedMissions.add(missionIndex);
    rescueStatus.textContent = `✓ ${mission.success}`;
    gameDevices.forEach((button) => {
      if (button.dataset.device === mission.device) button.classList.add('is-repaired');
    });
    selectedDevice = '';
    updateGame();
    if (repairedMissions.size === missions.length) {
      missionBrief.textContent = 'Seluruh klien dan layanan pada peta jaringan telah pulih.';
      rescueStatus.textContent = '🏆 Semua insiden berhasil dipulihkan. Tekan Mulai Ulang Game untuk bermain kembali.';
    } else {
      startMissionButton.disabled = false;
      startMissionButton.textContent = '▶ Misi Berikutnya';
    }
    return;
  }
  mistakes += 1;
  rescueStatus.textContent = 'Tindakan belum menyelesaikan insiden. Perangkat lain tetap aman; tinjau gejala dan coba lagi.';
  updateGame();
}

gameDevices.forEach((button) => {
  button.addEventListener('click', () => {
    selectedDevice = button.dataset.device;
    rescueStatus.textContent = `${button.querySelector('strong').textContent} dipilih. Pilih tindakan pemulihan yang sesuai dengan gejala.`;
    updateGame();
  });
});
startMissionButton.addEventListener('click', startNextMission);
document.getElementById('restartGame').addEventListener('click', () => {
  missionIndex = -1;
  selectedDevice = '';
  mistakes = 0;
  repairedMissions = new Set();
  missionBrief.textContent = 'Pilih Mulai Misi untuk memeriksa jaringan.';
  rescueStatus.textContent = 'Perhatikan gejala misi, lalu pilih perangkat untuk diperiksa.';
  updateGame();
});
updateGame();

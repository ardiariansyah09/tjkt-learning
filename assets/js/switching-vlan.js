import { bindThemeToggle } from './theme.js';
import { mountChapterNavigation } from './chapter-navigation.js?v=5';

mountChapterNavigation({
  moduleId: 'switching-vlan',
  title: 'Switching & VLAN',
  classLevel: 'XI',
  chapters: [
    {
      id: 'pengantar',
      title: 'Memahami Switching dan VLAN',
      summary: 'Kenali forwarding Layer 2 dan segmentasi logis dalam jaringan kampus.',
      questions: [{ question: 'Informasi yang dipelajari switch Layer 2 dari frame masuk adalah ...', options: ['MAC sumber, port masuk, dan VLAN', 'Nama domain dan record MX', 'Alamat gateway untuk seluruh jaringan'], answer: 0 }]
    },
    {
      id: 'switching',
      title: 'Learning dan Forwarding MAC',
      summary: 'Pelajari tabel MAC serta perilaku known, unknown, dan broadcast frame.',
      questions: [{ question: 'Jika MAC tujuan belum ada dalam tabel MAC, switch biasanya ...', options: ['Melakukan flooding dalam VLAN terkait selain port masuk', 'Mengirim frame ke seluruh VLAN tanpa batas', 'Mengubah alamat tujuan menjadi gateway'], answer: 0 }]
    },
    {
      id: 'vlan',
      title: 'VLAN dan Domain Broadcast',
      summary: 'Pahami batas Layer 2, segmentasi, dan contoh perencanaan VLAN.',
      questions: [{ question: 'VLAN pada switch Layer 2 memisahkan ...', options: ['Domain broadcast logis', 'Waktu lease DNS', 'Sinyal listrik dari kabel'], answer: 0 }]
    },
    {
      id: 'access',
      title: 'Port Access',
      summary: 'Tempatkan endpoint ke VLAN yang tepat melalui port access.',
      questions: [{ question: 'Port access paling umum digunakan untuk menghubungkan ...', options: ['Perangkat akhir pada satu VLAN', 'Trunk antarswitch yang membawa banyak VLAN', 'Semua router ke internet tanpa konfigurasi'], answer: 0 }]
    },
    {
      id: 'trunk',
      title: 'Trunk dan IEEE 802.1Q',
      summary: 'Pahami tagging frame dan daftar VLAN yang boleh melintasi trunk.',
      questions: [{ question: 'Fungsi tag IEEE 802.1Q pada trunk adalah ...', options: ['Mengidentifikasi VLAN frame pada link yang membawa beberapa VLAN', 'Mengenkripsi semua isi frame Ethernet', 'Mengganti alamat MAC sumber dengan alamat router'], answer: 0 }]
    },
    {
      id: 'routing',
      title: 'Inter-VLAN Routing',
      summary: 'Telusuri paket antar-VLAN melalui router atau switch Layer 3.',
      questions: [{ question: 'Perangkat pada VLAN dan subnet berbeda memerlukan apa untuk berkomunikasi?', options: ['Fungsi routing Layer 3 dan gateway yang sesuai', 'Hanya tabel MAC pada switch Layer 2', 'Port access tanpa alamat IP'], answer: 0 }]
    },
    {
      id: 'simulator',
      title: 'VLAN Studio: Lab Konfigurasi',
      summary: 'Atur keanggotaan port, allowed VLAN trunk, dan uji paket pada topologi 2D.',
      type: 'simulation',
      questions: [{ question: 'Dua host satu VLAN berada di switch berbeda, tetapi VLAN itu tidak diizinkan pada trunk antarswitch. Apa hasilnya?', options: ['Lalu lintas VLAN tersebut tidak dapat melintasi trunk', 'Switch otomatis melakukan routing antarsubnet', 'Frame dikirim sebagai VLAN lain tanpa tag'], answer: 0 }]
    },
    {
      id: 'game',
      title: 'VLAN Transit — Petualangan Frame',
      summary: 'Gerakkan pembawa frame melalui empat pos, ambil kunci, hindari gangguan, dan selesaikan tiga level.',
      type: 'game',
      questions: [{ question: 'Broadcast yang masuk melalui trunk VLAN 10 seharusnya ...', options: ['Di-flood ke port anggota VLAN 10 selain port masuk', 'Dikirim hanya ke gateway internet', 'Di-flood ke access port semua VLAN'], answer: 0 }]
    },
    {
      id: 'posttest',
      title: 'Posttest Switching & VLAN',
      summary: 'Evaluasi MAC learning, VLAN, port access/trunk, 802.1Q, dan routing.',
      questions: [
        { question: 'Switch Layer 2 mempelajari tabel MAC berdasarkan alamat ...', options: ['Sumber frame yang diterima', 'DNS server tujuan', 'Subnet mask router'], answer: 0 },
        { question: 'Unknown unicast umumnya di-flood dalam ...', options: ['VLAN yang sama, selain port masuk', 'Semua VLAN dan semua jaringan', 'WAN tanpa mempertimbangkan port masuk'], answer: 0 },
        { question: 'VLAN terutama membentuk ...', options: ['Domain broadcast logis yang terpisah', 'Satu domain broadcast global', 'Enkripsi otomatis pada setiap port'], answer: 0 },
        { question: 'Perangkat akhir umumnya terhubung pada port ...', options: ['Access ke VLAN yang sesuai', 'Trunk yang selalu membawa seluruh VLAN', 'Mirror untuk capture saja'], answer: 0 },
        { question: '802.1Q digunakan untuk ...', options: ['Menandai identitas VLAN pada frame trunk', 'Menentukan alamat IPv4 host', 'Mengganti fungsi routing Layer 3'], answer: 0 },
        { question: 'Daftar allowed VLAN pada trunk menentukan ...', options: ['VLAN yang boleh melintasi link trunk tersebut', 'MAC address mana yang boleh dibuat oleh klien', 'Subnet mask seluruh perangkat'], answer: 0 },
        { question: 'Komunikasi antar-VLAN memerlukan ...', options: ['Router atau switch Layer 3 dengan konfigurasi routing', 'Switch Layer 2 saja tanpa gateway', 'DNS cache pada setiap port'], answer: 0 },
        { question: 'Native VLAN pada trunk perlu dikonfigurasi dengan hati-hati karena ...', options: ['Frame tanpa tag pada trunk dapat diasosiasikan dengannya', 'Native VLAN selalu terenkripsi otomatis', 'VLAN ini menggantikan seluruh VLAN tagged'], answer: 0 }
      ]
    }
  ]
});

bindThemeToggle(document.getElementById('switchThemeToggle'));

const hosts = {
  A: { label: 'PC-A', switch: 'SW1', port: 'Fa0/1', octet: 10 },
  B: { label: 'PC-B', switch: 'SW1', port: 'Fa0/2', octet: 20 },
  C: { label: 'PC-C', switch: 'SW2', port: 'Fa0/1', octet: 30 },
  D: { label: 'PC-D', switch: 'SW2', port: 'Fa0/2', octet: 40 }
};
const labSvg = document.getElementById('vlanDiagram');
const legend = document.getElementById('topologyLegend');
const frameStatus = document.getElementById('frameStatus');
const frameLog = document.getElementById('frameLog');
const portControls = Object.fromEntries(
  Object.keys(hosts).map((id) => [id, document.getElementById(`host${id}Select`)])
);
const svgNS = 'http://www.w3.org/2000/svg';
let activePath = [];

function svgNode(tag, attributes, text) {
  const node = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  if (text) node.textContent = text;
  return node;
}

function drawTopology() {
  const hostPoints = {
    A: { x: 95, y: 70 },
    B: { x: 95, y: 230 },
    C: { x: 825, y: 70 },
    D: { x: 825, y: 230 }
  };
  const switchPoints = { SW1: { x: 330, y: 150 }, SW2: { x: 620, y: 150 }, R1: { x: 475, y: 45 } };
  labSvg.replaceChildren(svgNode('title', {}, 'Dua switch dihubungkan trunk 802.1Q; host ditempatkan pada VLAN dan router menyediakan inter-VLAN routing.'));
  const links = [
    { id: 'link-A', a: hostPoints.A, b: { x: 285, y: 130 } },
    { id: 'link-B', a: hostPoints.B, b: { x: 285, y: 170 } },
    { id: 'link-trunk', a: { x: 385, y: 150 }, b: { x: 565, y: 150 } },
    { id: 'link-C', a: { x: 665, y: 130 }, b: hostPoints.C },
    { id: 'link-D', a: { x: 665, y: 170 }, b: hostPoints.D },
    { id: 'link-router', a: { x: 375, y: 115 }, b: { x: 430, y: 76 } }
  ];
  links.forEach((link) => {
    const blocked = link.id === 'link-trunk' && [...allowedVlans()].length === 0;
    labSvg.append(svgNode('line', {
      x1: link.a.x, y1: link.a.y, x2: link.b.x, y2: link.b.y,
      class: `vlan-link${blocked ? ' is-blocked' : ''}${activePath.includes(link.id) ? ' is-active' : ''}`
    }));
  });
  Object.keys(hosts).forEach((id) => {
    const host = hosts[id];
    const point = hostPoints[id];
    const vlan = portControls[id].value;
    const isActive = activePath.includes(`host-${id}`);
    labSvg.append(
      svgNode('rect', { x: point.x - 48, y: point.y - 34, width: 96, height: 68, rx: 14, class: `vlan-node host-node vlan-${vlan}${isActive ? ' is-active' : ''}` }),
      svgNode('text', { x: point.x, y: point.y - 4, class: 'vlan-label' }, host.label),
      svgNode('text', { x: point.x, y: point.y + 17, class: 'vlan-sub-label' }, `VLAN ${vlan}`)
    );
  });
  [['SW1', 'SWITCH 1'], ['SW2', 'SWITCH 2']].forEach(([id, label]) => {
    const point = switchPoints[id];
    labSvg.append(
      svgNode('rect', { x: point.x - 50, y: point.y - 34, width: 100, height: 68, rx: 16, class: 'vlan-node switch-node' }),
      svgNode('text', { x: point.x, y: point.y + 5, class: 'vlan-label' }, label)
    );
  });
  const router = switchPoints.R1;
  labSvg.append(
    svgNode('rect', { x: router.x - 58, y: router.y - 27, width: 116, height: 54, rx: 16, class: `vlan-node router-node${activePath.includes('router') ? ' is-active' : ''}` }),
    svgNode('text', { x: router.x, y: router.y + 5, class: 'vlan-label' }, 'ROUTER · L3')
  );
  labSvg.append(
    svgNode('text', { x: 475, y: 136, class: 'trunk-title' }, 'TRUNK 802.1Q'),
    svgNode('text', { x: 475, y: 178, class: 'trunk-subtitle' }, [...allowedVlans()].map((vlan) => `VLAN ${vlan}`).join(' · ') || 'Tidak ada VLAN diizinkan')
  );
  legend.replaceChildren();
  [['10', 'Administrasi'], ['20', 'Laboratorium']].forEach(([vlan, label]) => {
    const item = document.createElement('span');
    item.className = `legend-item vlan-${vlan}`;
    item.textContent = `VLAN ${vlan} · ${label}`;
    legend.append(item);
  });
}

function allowedVlans() {
  return new Set([...document.querySelectorAll('input[name="allowedVlan"]:checked')].map((input) => input.value));
}

function resetLab() {
  portControls.A.value = '10';
  portControls.B.value = '20';
  portControls.C.value = '10';
  portControls.D.value = '20';
  document.querySelectorAll('input[name="allowedVlan"]').forEach((input) => { input.checked = true; });
  document.getElementById('routingEnabled').checked = true;
  document.getElementById('sourceHost').value = 'A';
  document.getElementById('destinationHost').value = 'C';
  activePath = [];
  frameStatus.textContent = 'Lab direset. Pilih host sumber dan tujuan, lalu jalankan pengujian.';
  frameLog.textContent = '';
  drawTopology();
}

function runFrameTest() {
  const sourceId = document.getElementById('sourceHost').value;
  const targetId = document.getElementById('destinationHost').value;
  if (sourceId === targetId) {
    frameStatus.textContent = 'Pilih dua host yang berbeda untuk menguji komunikasi.';
    return;
  }
  const source = hosts[sourceId];
  const target = hosts[targetId];
  const sourceVlan = portControls[sourceId].value;
  const targetVlan = portControls[targetId].value;
  const allowed = allowedVlans();
  const crossesSwitches = source.switch !== target.switch;
  const needsRouting = sourceVlan !== targetVlan;
  activePath = [`host-${sourceId}`, `host-${targetId}`, `link-${sourceId}`, `link-${targetId}`];
  if (crossesSwitches) activePath.push('link-trunk');
  if (needsRouting) {
    activePath.push('router', 'link-router');
    if (crossesSwitches) activePath.push('link-trunk');
  }
  const missingVlans = crossesSwitches
    ? [...new Set([sourceVlan, ...(needsRouting ? [targetVlan] : [])])].filter((vlan) => !allowed.has(vlan))
    : [];
  let result;
  if (missingVlans.length > 0) {
    result = `GAGAL: VLAN ${missingVlans.join(', ')} tidak diizinkan melintasi trunk SW1–SW2.`;
  } else if (needsRouting && !document.getElementById('routingEnabled').checked) {
    result = `GAGAL: ${source.label} di VLAN ${sourceVlan} dan ${target.label} di VLAN ${targetVlan} berbeda segmen; inter-VLAN routing belum aktif.`;
  } else if (needsRouting) {
    result = `BERHASIL: Paket ${source.label} (${sourceVlan}, 192.168.${sourceVlan}.${source.octet}) menuju ${target.label} (${targetVlan}, 192.168.${targetVlan}.${target.octet}) melewati gateway Layer 3.`;
  } else if (crossesSwitches) {
    result = `BERHASIL: Frame VLAN ${sourceVlan} melewati trunk bertag 802.1Q dan tiba di ${target.label}.`;
  } else {
    result = `BERHASIL: Frame diteruskan di VLAN ${sourceVlan} dalam switch ${source.switch}; routing tidak diperlukan.`;
  }
  frameStatus.textContent = result;
  frameLog.textContent = `Uji: ${source.label} → ${target.label} · ${result}`;
  drawTopology();
}

Object.values(portControls).forEach((select) => select.addEventListener('change', drawTopology));
document.querySelectorAll('input[name="allowedVlan"], #routingEnabled').forEach((input) => input.addEventListener('change', drawTopology));
document.getElementById('sendFrame').addEventListener('click', runFrameTest);
document.getElementById('resetVlanLab').addEventListener('click', resetLab);
drawTopology();

const missions = [
  {
    prompt: 'Known unicast · VLAN 10. Tujuan ada pada tabel MAC di Fa0/3.',
    destination: 'BB:BB:BB:BB:BB:03',
    ingress: 'Ingress: Fa0/1 · VLAN 10',
    vlan: 'Jenis: Unicast · MAC tujuan dikenal',
    rows: [['10', 'BB:BB:BB:BB:BB:03', 'Fa0/3'], ['20', 'CC:CC:CC:CC:CC:04', 'Fa0/4'], ['10', 'DD:DD:DD:DD:DD:05', 'Gi0/1']],
    ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Gi0/1'],
    answer: ['Fa0/3'],
    hint: 'Known unicast diteruskan hanya ke port tujuan yang tercatat dalam VLAN tersebut.'
  },
  {
    prompt: 'Unknown unicast · VLAN 20. MAC tujuan belum dipelajari; trunk mengizinkan VLAN 10 dan 20.',
    destination: 'EE:EE:EE:EE:EE:99',
    ingress: 'Ingress: Fa0/2 · VLAN 20',
    vlan: 'Jenis: Unknown unicast · MAC tujuan belum dikenal',
    rows: [['10', 'AA:AA:AA:AA:AA:01', 'Fa0/1'], ['20', 'CC:CC:CC:CC:CC:04', 'Fa0/4'], ['10', 'DD:DD:DD:DD:DD:05', 'Gi0/1']],
    ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Gi0/1'],
    answer: ['Fa0/4', 'Gi0/1'],
    hint: 'Flood ke port anggota VLAN 20 selain ingress. Fa0/1 dan Fa0/3 adalah VLAN lain.'
  },
  {
    prompt: 'Broadcast · VLAN 10. Frame masuk dari trunk Gi0/1 dan harus disebarkan ke anggota VLAN 10.',
    destination: 'FF:FF:FF:FF:FF:FF',
    ingress: 'Ingress: Gi0/1 · VLAN 10',
    vlan: 'Jenis: Broadcast',
    rows: [['10', 'AA:AA:AA:AA:AA:01', 'Fa0/1'], ['20', 'CC:CC:CC:CC:CC:04', 'Fa0/4'], ['10', 'BB:BB:BB:BB:BB:03', 'Fa0/3']],
    ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Gi0/1'],
    answer: ['Fa0/1', 'Fa0/3'],
    hint: 'Broadcast hanya tersebar dalam VLAN 10 dan tidak dikirim kembali ke ingress trunk.'
  },
  {
    prompt: 'Known unicast · VLAN 10. MAC tujuan dipelajari pada port masuk itu sendiri (Fa0/1).',
    destination: 'AA:AA:AA:AA:AA:01',
    ingress: 'Ingress: Fa0/1 · VLAN 10',
    vlan: 'Jenis: Unicast · MAC tujuan tercatat di ingress',
    rows: [['10', 'AA:AA:AA:AA:AA:01', 'Fa0/1'], ['20', 'CC:CC:CC:CC:CC:04', 'Fa0/4'], ['10', 'BB:BB:BB:BB:BB:03', 'Fa0/3']],
    ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Gi0/1'],
    answer: [],
    hint: 'Switch menyaring frame: tidak perlu mengirimnya kembali ke port tempat tujuan berada.'
  }
];

const framePrompt = document.getElementById('framePrompt');
const frameDestination = document.getElementById('frameDestination');
const frameIngress = document.getElementById('frameIngress');
const frameVlan = document.getElementById('frameVlan');
const macTableBody = document.getElementById('macTableBody');
const portChoices = document.getElementById('switchPortChoices');
const frameGameStatus = document.getElementById('frameGameStatus');
const frameGameScore = document.getElementById('frameGameScore');
const missionLabel = document.getElementById('frameMissionLabel');
const submitForwarding = document.getElementById('submitForwarding');
const nextMission = document.getElementById('nextFrameMission');
let missionIndex = 0;
let selectedPorts = new Set();
let completedMissions = new Set();
let mistakes = 0;

function renderMission() {
  const mission = missions[missionIndex];
  missionLabel.textContent = `RONDE ${missionIndex + 1}/${missions.length}`;
  framePrompt.textContent = mission.prompt;
  frameDestination.textContent = `Destination MAC: ${mission.destination}`;
  frameIngress.textContent = mission.ingress;
  frameVlan.textContent = mission.vlan;
  frameGameScore.textContent = `Keputusan tepat ${completedMissions.size}/${missions.length} · Kesalahan ${mistakes}`;
  macTableBody.replaceChildren();
  mission.rows.forEach(([vlan, mac, port]) => {
    const row = document.createElement('tr');
    [vlan, mac, port].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    macTableBody.append(row);
  });
  portChoices.replaceChildren();
  mission.ports.forEach((port) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = port;
    button.setAttribute('aria-pressed', String(selectedPorts.has(port)));
    button.disabled = completedMissions.has(missionIndex);
    button.addEventListener('click', () => {
      if (selectedPorts.has(port)) selectedPorts.delete(port);
      else selectedPorts.add(port);
      renderMission();
    });
    portChoices.append(button);
  });
  submitForwarding.disabled = completedMissions.has(missionIndex);
  nextMission.disabled = !completedMissions.has(missionIndex) || missionIndex === missions.length - 1;
  nextMission.textContent = missionIndex === missions.length - 1 ? '✓ Tantangan Selesai' : 'Ronde Berikutnya →';
  if (completedMissions.has(missionIndex)) frameGameStatus.textContent = `✓ Tepat! ${mission.hint}`;
  document.getElementById('gameSelectionHint').textContent = selectedPorts.size
    ? `Port terpilih: ${[...selectedPorts].join(', ')}`
    : 'Pilih port keluaran pada peta switch. Tidak memilih port juga merupakan keputusan yang valid bila frame harus disaring.';
}

submitForwarding.addEventListener('click', () => {
  if (completedMissions.has(missionIndex)) return;
  const expected = missions[missionIndex].answer;
  const correct = expected.length === selectedPorts.size && expected.every((port) => selectedPorts.has(port));
  if (correct) {
    completedMissions.add(missionIndex);
    frameGameStatus.textContent = `✓ Keputusan benar. ${missions[missionIndex].hint}`;
    if (completedMissions.size === missions.length) {
      frameGameStatus.textContent = '🏆 Seluruh keputusan forwarding benar. Kamu berhasil mengendalikan frame sesuai tabel MAC dan VLAN!';
    }
  } else {
    mistakes += 1;
    frameGameStatus.textContent = 'Belum tepat. Tinjau VLAN, port ingress, jenis frame, dan tabel MAC; ubah pilihan lalu coba lagi.';
  }
  renderMission();
});
nextMission.addEventListener('click', () => {
  if (!completedMissions.has(missionIndex) || missionIndex === missions.length - 1) return;
  missionIndex += 1;
  selectedPorts = new Set();
  frameGameStatus.textContent = 'Baca informasi ronde, lalu pilih port keluaran.';
  renderMission();
});
document.getElementById('restartFrameGame').addEventListener('click', () => {
  missionIndex = 0;
  selectedPorts = new Set();
  completedMissions = new Set();
  mistakes = 0;
  frameGameStatus.textContent = 'Port ingress dan informasi tabel MAC akan menentukan keputusan forwarding.';
  renderMission();
});
renderMission();

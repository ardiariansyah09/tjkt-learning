import { bindThemeToggle } from './theme.js';
import { mountChapterNavigation } from './chapter-navigation.js';

mountChapterNavigation({
  moduleId: 'osi-tcpip',
  title: 'Model OSI dan TCP/IP',
  chapters: [
    {
      id: 'pengantar',
      title: 'Mengenal Model Berlapis',
      summary: 'Pahami mengapa fungsi komunikasi jaringan dipelajari dalam beberapa lapisan.',
      questions: [{ question: 'Model berlapis membantu kita untuk ...', options: ['Mengelompokkan fungsi komunikasi agar mudah dipelajari dan ditelusuri', 'Mengharuskan setiap lapisan menjadi perangkat terpisah', 'Menghilangkan kebutuhan protokol jaringan'], answer: 0 }]
    },
    {
      id: 'osi',
      title: 'Tujuh Lapisan OSI',
      summary: 'Kenali fungsi lapisan OSI dan unit data protokol yang umum.',
      questions: [{ question: 'Alamat MAC Ethernet dan frame paling terkait dengan lapisan OSI ...', options: ['2 · Data Link', '3 · Jaringan', '4 · Transport'], answer: 0 }]
    },
    {
      id: 'tcpip',
      title: 'Model TCP/IP',
      summary: 'Bandingkan kelompok lapisan TCP/IP dengan model OSI.',
      questions: [{ question: 'Protokol IP termasuk dalam lapisan ... model TCP/IP.', options: ['Aplikasi', 'Transport', 'Internet'], answer: 2 }]
    },
    {
      id: 'enkapsulasi',
      title: 'Enkapsulasi dan Dekapsulasi',
      summary: 'Urutkan pembentukan data hingga sinyal dan pemrosesan kembali di penerima.',
      questions: [{ question: 'Urutan PDU umum saat data bergerak turun dari aplikasi menuju media adalah ...', options: ['Data → segmen/datagram → paket → frame → bit', 'Frame → paket → data → bit → segmen', 'Bit → frame → paket → data → segmen'], answer: 0 }]
    },
    {
      id: 'simulator',
      title: 'Simulator Perjalanan Paket',
      summary: 'Amati penambahan header dan pergerakan paket pada dua skenario komunikasi.',
      type: 'simulation',
      questions: [{ question: 'Informasi alamat IP ditambahkan pada lapisan ...', options: ['Transport', 'Internet / Network', 'Data Link'], answer: 1 }]
    },
    {
      id: 'game',
      title: 'Layer Link-Up: Susun Protokol',
      summary: 'Tempatkan kartu protokol dan fungsi pada lapisan OSI yang tepat.',
      type: 'game',
      questions: [{ question: 'TCP dan UDP paling terkait dengan lapisan OSI ...', options: ['1 · Fisik', '4 · Transport', '7 · Aplikasi'], answer: 1 }]
    },
    {
      id: 'rangkuman',
      title: 'Rangkuman',
      summary: 'Tinjau kembali fungsi lapisan dan batas penggunaan model referensi.',
      questions: [{ question: 'Model OSI paling tepat dipakai sebagai ...', options: ['Kerangka untuk membahas fungsi komunikasi jaringan', 'Daftar perangkat keras yang wajib terpisah', 'Jaminan bahwa implementasi memiliki batas lapisan identik'], answer: 0 }]
    },
    {
      id: 'posttest',
      title: 'Posttest OSI dan TCP/IP',
      summary: 'Evaluasi pemahaman OSI, TCP/IP, enkapsulasi, dan peran protokol.',
      questions: [
        { question: 'Model referensi OSI mempunyai ... lapisan.', options: ['4', '7', '8'], answer: 1 },
        { question: 'Frame Ethernet dan alamat MAC terkait dengan ...', options: ['Data Link', 'Transport', 'Aplikasi'], answer: 0 },
        { question: 'IP termasuk lapisan ... pada model TCP/IP.', options: ['Aplikasi', 'Internet', 'Transport'], answer: 1 },
        { question: 'TCP dan UDP bekerja pada lapisan ...', options: ['Fisik', 'Transport', 'Data Link'], answer: 1 },
        { question: 'Urutan enkapsulasi PDU umum adalah ...', options: ['Data, segmen/datagram, paket, frame, bit', 'Paket, data, frame, segmen, bit', 'Bit, frame, paket, segmen, data'], answer: 0 },
        { question: 'Lapisan fisik merepresentasikan bit menjadi ...', options: ['Sinyal pada media', 'Alamat IP', 'Nama domain'], answer: 0 },
        { question: 'Lapisan aplikasi TCP/IP umumnya dipetakan ke OSI ...', options: ['7 saja', '4, 3, dan 2', '7, 6, dan 5'], answer: 2 },
        { question: 'Model berlapis membantu teknisi untuk ...', options: ['Mengorganisasi analisis fungsi komunikasi', 'Memastikan perangkat fisik selalu terpisah', 'Mengabaikan gejala dan konfigurasi'], answer: 0 }
      ]
    }
  ]
});

bindThemeToggle(document.getElementById('osiThemeToggle'));

const scenarioSelect = document.getElementById('scenarioSelect');
const stepButton = document.getElementById('nextPacketStep');
const resetButton = document.getElementById('resetPacket');
const senderStack = document.getElementById('senderStack');
const receiverStack = document.getElementById('receiverStack');
const currentPdu = document.getElementById('currentPdu');
const packetStatus = document.getElementById('packetStatus');
const networkSvg = document.getElementById('packetNetwork');
const networkCaption = document.getElementById('packetNetworkCaption');
const svgNS = 'http://www.w3.org/2000/svg';

const scenarios = {
  web: {
    app: 'Data aplikasi · HTTP',
    transport: 'Header TCP · port sumber/tujuan',
    network: 'Header IP · alamat sumber/tujuan',
    link: 'Header Ethernet · alamat MAC',
    physical: 'Bit · sinyal pada media',
    transportName: 'TCP',
    caption: 'Permintaan web berjalan dari PC, melewati router, menuju server.'
  },
  dns: {
    app: 'Data kueri · DNS',
    transport: 'Header UDP · port sumber/tujuan',
    network: 'Header IP · alamat sumber/tujuan',
    link: 'Header Ethernet · alamat MAC',
    physical: 'Bit · sinyal pada media',
    transportName: 'UDP',
    caption: 'Kueri DNS melalui UDP berjalan dari PC, melewati router, menuju server DNS.'
  }
};

let step = 0;
let animationId = 0;
const layerNames = ['Aplikasi', 'Transport', 'Internet / Network', 'Data Link', 'Fisik'];

function svgNode(tag, attributes, text) {
  const node = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  if (text) node.textContent = text;
  return node;
}

function drawNetwork(packetPosition = null) {
  const scenario = scenarios[scenarioSelect.value];
  networkSvg.replaceChildren(svgNode('title', {}, scenario.caption));
  networkSvg.append(
    svgNode('line', { x1: 135, y1: 112, x2: 665, y2: 112, class: 'osi-link' }),
    svgNode('rect', { x: 72, y: 76, width: 126, height: 72, rx: 18, class: 'osi-node' }),
    svgNode('text', { x: 135, y: 105, class: 'osi-node-label' }, 'PC PENGIRIM'),
    svgNode('text', { x: 135, y: 126, class: 'osi-node-label' }, 'Aplikasi'),
    svgNode('path', { d: 'M 400 69 L 443 112 L 400 155 L 357 112 Z', class: 'osi-router' }),
    svgNode('text', { x: 400, y: 117, class: 'osi-node-label' }, 'ROUTER'),
    svgNode('rect', { x: 602, y: 76, width: 126, height: 72, rx: 18, class: 'osi-node' }),
    svgNode('text', { x: 665, y: 105, class: 'osi-node-label' }, 'SERVER'),
    svgNode('text', { x: 665, y: 126, class: 'osi-node-label' }, 'Aplikasi')
  );
  if (packetPosition !== null) {
    networkSvg.append(svgNode('circle', { cx: packetPosition, cy: 112, r: 10, class: 'osi-packet' }));
  }
  networkCaption.textContent = scenario.caption;
}

function renderStacks() {
  const scenario = scenarios[scenarioSelect.value];
  senderStack.replaceChildren();
  receiverStack.replaceChildren();
  for (let index = 0; index < 5; index += 1) {
    const senderItem = document.createElement('li');
    senderItem.textContent = index === 0
      ? scenario.app
      : index === 1
        ? scenario.transport
        : index === 2
          ? scenario.network
          : index === 3
            ? scenario.link
            : scenario.physical;
    if (index < Math.min(step, 5)) senderItem.classList.add('is-done');
    if (index === step && step < 5) senderItem.classList.add('is-active');
    senderStack.append(senderItem);

    const receiverItem = document.createElement('li');
    receiverItem.textContent = layerNames[4 - index];
    if (step >= 7 + index) receiverItem.classList.add('is-done');
    if (step === 6 && index === 0) receiverItem.classList.add('is-active');
    if (step >= 7 && step <= 11 && index === step - 7) receiverItem.classList.add('is-active');
    receiverStack.append(receiverItem);
  }

  currentPdu.replaceChildren();
  const pduLayers = [
    ['Data aplikasi', 1],
    [`Segmen / datagram ${scenario.transportName}`, 2],
    ['Paket IP', 3],
    ['Frame Ethernet', 4],
    ['Bit / sinyal', 5]
  ];
  if (step < 6) {
    pduLayers.slice(0, step).forEach(([label]) => {
      const layer = document.createElement('span');
      layer.className = 'pdu-layer';
      layer.textContent = label;
      currentPdu.append(layer);
    });
  }
  if (step >= 6 && step < 11) {
    pduLayers.slice(0, Math.max(0, 11 - step)).forEach(([label]) => {
      const layer = document.createElement('span');
      layer.className = 'pdu-layer';
      layer.textContent = label;
      currentPdu.append(layer);
    });
  }
  if (step === 0) currentPdu.textContent = 'Belum ada header yang ditambahkan.';
  if (step === 11) currentPdu.textContent = 'Data aplikasi diterima.';
}

function updateStatus() {
  if (step === 0) {
    packetStatus.textContent = 'Data aplikasi siap. Mulai enkapsulasi dari lapisan aplikasi.';
    stepButton.textContent = '▶ Mulai Enkapsulasi';
  } else if (step < 5) {
    packetStatus.textContent = `Tahap ${step}/5: informasi lapisan ${layerNames[step - 1]} telah disiapkan.`;
    stepButton.textContent = '▶ Tambahkan Header Berikutnya';
  } else if (step === 5) {
    packetStatus.textContent = 'Enkapsulasi selesai. Kirim bit melewati jaringan menuju server.';
    stepButton.textContent = '📨 Kirim Paket';
  } else if (step === 6) {
    packetStatus.textContent = '✓ Paket tiba di server. Mulai dekapsulasi dari lapisan fisik.';
    stepButton.textContent = '↓ Mulai Dekapsulasi';
  } else if (step < 11) {
    packetStatus.textContent = `Tahap ${step - 6}/5: penerima memproses lapisan ${layerNames[11 - step]}.`;
    stepButton.textContent = '↓ Dekapsulasi Berikutnya';
  } else {
    packetStatus.textContent = '✓ Data tiba di aplikasi penerima setelah dekapsulasi.';
    stepButton.textContent = '✓ Simulasi Selesai';
  }
  stepButton.disabled = step >= 11;
}

function animatePacket() {
  const animation = ++animationId;
  const start = performance.now();
  const from = 135;
  const to = 665;
  const duration = 900;
  const frame = (now) => {
    if (animation !== animationId || !networkSvg.isConnected) return;
    const progress = Math.min(1, (now - start) / duration);
    drawNetwork(from + (to - from) * progress);
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function renderSimulation() {
  renderStacks();
  drawNetwork();
  updateStatus();
}

stepButton.addEventListener('click', () => {
  if (step >= 11) return;
  step += 1;
  renderSimulation();
  if (step === 6 || step === 10) animatePacket();
});

function resetSimulation() {
  animationId += 1;
  step = 0;
  renderSimulation();
}

scenarioSelect.addEventListener('change', resetSimulation);
resetButton.addEventListener('click', resetSimulation);
renderSimulation();

const layerDefinitions = [
  { name: 'Aplikasi', cards: ['HTTP', 'DNS'] },
  { name: 'Presentasi', cards: ['Format / kompresi data'] },
  { name: 'Sesi', cards: ['Pengelolaan dialog sesi'] },
  { name: 'Transport', cards: ['TCP', 'UDP'] },
  { name: 'Jaringan', cards: ['IP'] },
  { name: 'Data Link', cards: ['Ethernet', 'Alamat MAC'] },
  { name: 'Fisik', cards: ['Sinyal listrik / cahaya / radio'] }
];
const cardDefinitions = [
  { label: 'HTTP', layer: 0 },
  { label: 'DNS', layer: 0 },
  { label: 'Format / kompresi data', layer: 1 },
  { label: 'TCP', layer: 3 },
  { label: 'UDP', layer: 3 },
  { label: 'IP', layer: 4 },
  { label: 'Ethernet', layer: 5 },
  { label: 'Alamat MAC', layer: 5 },
  { label: 'Pengelolaan dialog sesi', layer: 2 },
  { label: 'Sinyal listrik / cahaya / radio', layer: 6 }
];
const tower = document.getElementById('layerTower');
const cardsContainer = document.getElementById('protocolCards');
const prompt = document.getElementById('gamePrompt');
const scoreLabel = document.getElementById('gameScore');
const restartGameButton = document.getElementById('restartLayerGame');
let selectedCard = null;
let placements = new Set();
let gameErrors = 0;

function renderGame() {
  tower.replaceChildren();
  layerDefinitions.forEach((layer, index) => {
    const target = document.createElement('button');
    target.type = 'button';
    target.className = `layer-target${selectedCard?.layer === index ? ' is-selected' : ''}${layer.cards.every((item) => placements.has(item)) ? ' is-complete' : ''}`;
    target.setAttribute('aria-label', `Lapisan OSI ${7 - index}, ${layer.name}. Kartu benar: ${layer.cards.filter((item) => placements.has(item)).length} dari ${layer.cards.length}`);
    target.append(
      Object.assign(document.createElement('span'), { textContent: String(7 - index) }),
      Object.assign(document.createElement('strong'), { textContent: layer.name }),
      Object.assign(document.createElement('small'), { textContent: layer.cards.filter((item) => placements.has(item)).length ? '✓ tersusun' : 'tujuan kartu' })
    );
    target.addEventListener('click', () => placeSelectedCard(index));
    tower.append(target);
  });

  cardsContainer.replaceChildren();
  cardDefinitions.forEach((card) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `protocol-card${selectedCard?.label === card.label ? ' is-selected' : ''}`;
    button.textContent = card.label;
    button.disabled = placements.has(card.label);
    button.setAttribute('aria-pressed', String(selectedCard?.label === card.label));
    button.addEventListener('click', () => {
      selectedCard = card;
      prompt.textContent = `Kartu “${card.label}” dipilih. Sekarang pilih lapisan OSI yang sesuai.`;
      renderGame();
    });
    cardsContainer.append(button);
  });
  scoreLabel.textContent = `Tepat ${placements.size}/${cardDefinitions.length} · Kesalahan ${gameErrors}`;
}

function placeSelectedCard(layerIndex) {
  if (!selectedCard) {
    prompt.textContent = 'Pilih kartu protokol atau fungsi terlebih dahulu.';
    return;
  }
  if (selectedCard.layer === layerIndex) {
    placements.add(selectedCard.label);
    prompt.textContent = `✓ Tepat! ${selectedCard.label} ditempatkan pada OSI ${7 - layerIndex} · ${layerDefinitions[layerIndex].name}.`;
    selectedCard = null;
    renderGame();
    if (placements.size === cardDefinitions.length) {
      const score = Math.max(60, 100 - gameErrors * 5);
      prompt.textContent = `🏆 Menara lapisan lengkap! Skor simulasi ${score}/100 dengan ${gameErrors} kesalahan.`;
    }
    return;
  }
  gameErrors += 1;
  prompt.textContent = `Belum tepat. ${selectedCard.label} belum ditempatkan; perhatikan fungsi protokolnya dan coba lapisan lain.`;
  renderGame();
}

restartGameButton.addEventListener('click', () => {
  selectedCard = null;
  placements = new Set();
  gameErrors = 0;
  prompt.textContent = 'Pilih kartu, lalu lapisan tujuan.';
  renderGame();
});
renderGame();

import { bindThemeToggle } from './theme.js';
import { mountChapterNavigation } from './chapter-navigation.js?v=5';

mountChapterNavigation({
  moduleId: 'protokol-layanan',
  title: 'Protokol dan Layanan Jaringan Dasar',
  chapters: [
    {
      id: 'pengantar',
      title: 'Mengenal Protokol dan Layanan',
      summary: 'Bedakan aturan komunikasi jaringan dan fungsi yang dibutuhkan klien.',
      questions: [{ question: 'Protokol jaringan terutama berisi ...', options: ['Aturan dan format pertukaran pesan', 'Daftar nama pengguna perangkat', 'Jenis kabel yang harus dipakai'], answer: 0 }]
    },
    {
      id: 'dhcp',
      title: 'DHCP dan Konfigurasi Otomatis',
      summary: 'Pelajari DORA, masa sewa, opsi konfigurasi, dan port DHCPv4.',
      questions: [{ question: 'Dalam urutan DORA DHCP, pesan yang dikirim klien setelah menerima Offer adalah ...', options: ['Request', 'Discover', 'Acknowledge'], answer: 0 }]
    },
    {
      id: 'dns',
      title: 'DNS dan Record',
      summary: 'Pahami resolver, cache, hierarki DNS, serta record yang umum.',
      questions: [{ question: 'Record DNS yang memetakan nama domain ke alamat IPv4 adalah ...', options: ['A', 'AAAA', 'MX'], answer: 0 }]
    },
    {
      id: 'web',
      title: 'HTTP, HTTPS, dan TLS',
      summary: 'Kenali pola permintaan-respons web dan perlindungan TLS.',
      questions: [{ question: 'HTTPS menambahkan perlindungan komunikasi web terutama melalui ...', options: ['TLS', 'DHCP', 'ARP'], answer: 0 }]
    },
    {
      id: 'ports',
      title: 'Port dan Layanan Umum',
      summary: 'Hubungkan port standar dengan layanan serta protokol transportnya.',
      questions: [{ question: 'Port standar DNS adalah ...', options: ['53', '67/68', '80'], answer: 0 }]
    },
    {
      id: 'simulator',
      title: 'Simulasi Perjalanan Layanan',
      summary: 'Langkahkan alur DHCP, DNS, dan HTTPS untuk melihat peran tiap layanan.',
      type: 'simulation',
      questions: [{ question: 'Saat membuka situs dengan nama domain, layanan yang lazim dicari sebelum koneksi web ke server adalah ...', options: ['DNS', 'DHCP', 'HTTP response'], answer: 0 }]
    },
    {
      id: 'game',
      title: 'Service Delivery — Petualangan Layanan',
      summary: 'Ambil muatan layanan, lalui empat pos, buka gerbang dan antarkan ke tujuan tanpa kehabisan energi.',
      type: 'game',
      questions: [{ question: 'Port UDP 68 digunakan pada DHCPv4 oleh ...', options: ['Klien', 'Server', 'Resolver DNS'], answer: 0 }]
    },
    {
      id: 'posttest',
      title: 'Posttest Protokol dan Layanan',
      summary: 'Evaluasi konsep DHCP, DNS, HTTP/HTTPS, port, dan alur layanan.',
      questions: [
        { question: 'Urutan DHCP DORA yang benar adalah ...', options: ['Discover, Offer, Request, Acknowledge', 'Discover, Request, Offer, Acknowledge', 'Offer, Discover, Acknowledge, Request'], answer: 0 },
        { question: 'DHCPv4 server umumnya menerima permintaan klien pada UDP port ...', options: ['67', '68', '53'], answer: 0 },
        { question: 'Record DNS untuk alamat IPv6 adalah ...', options: ['AAAA', 'A', 'MX'], answer: 0 },
        { question: 'DNS kueri biasa umumnya menggunakan UDP port ...', options: ['53', '80', '443'], answer: 0 },
        { question: 'HTTP secara konvensional menggunakan TCP port ...', options: ['80', '53', '68'], answer: 0 },
        { question: 'HTTPS melindungi komunikasi web dengan ...', options: ['TLS', 'DHCP lease', 'DNS cache'], answer: 0 },
        { question: 'HTTP/3 menggunakan protokol transport ...', options: ['QUIC di atas UDP', 'TCP tanpa TLS', 'DHCP di atas UDP'], answer: 0 },
        { question: 'Nomor port tujuan membantu sistem operasi untuk ...', options: ['Mengirim data ke proses atau layanan yang sesuai', 'Menentukan subnet mask IP', 'Mengganti alamat MAC perangkat'], answer: 0 }
      ]
    }
  ]
});

bindThemeToggle(document.getElementById('serviceThemeToggle'));

const scenarioSelect = document.getElementById('serviceScenario');
const stepButton = document.getElementById('serviceStep');
const resetButton = document.getElementById('serviceReset');
const diagram = document.getElementById('serviceSvg');
const caption = document.getElementById('serviceCaption');
const sequence = document.getElementById('serviceSequence');
const status = document.getElementById('serviceStatus');
const svgNS = 'http://www.w3.org/2000/svg';

const scenarios = {
  web: {
    caption: 'Klien menemukan server melalui DNS, kemudian meminta halaman menggunakan HTTPS.',
    steps: [
      { message: 'Klien meminta record A untuk nama situs kepada resolver DNS.', from: 105, to: 365, label: 'DNS · UDP/TCP 53' },
      { message: 'Resolver menjawab dengan alamat IPv4 yang ditemukan; cache dapat mempercepat jawaban.', from: 365, to: 105, label: 'Jawaban DNS' },
      { message: 'Klien memulai koneksi ke server web pada port HTTPS standar, biasanya TCP 443.', from: 105, to: 665, label: 'Koneksi TCP · 443' },
      { message: 'Klien dan server melakukan negosiasi TLS sebelum bertukar pesan HTTP yang dilindungi.', from: 105, to: 665, label: 'Handshake TLS' },
      { message: 'Klien mengirim permintaan HTTPS dan server membalas sumber web melalui koneksi terlindungi.', from: 665, to: 105, label: 'HTTPS · request/response' }
    ]
  },
  dhcp: {
    caption: 'Klien yang baru bergabung meminta konfigurasi IPv4 dari server DHCP.',
    steps: [
      { message: 'Discover: klien menyiarkan pencarian server DHCP; klien belum memiliki konfigurasi IPv4 normal.', from: 105, to: 665, label: 'Discover · UDP 68 → 67' },
      { message: 'Offer: server menawarkan alamat dan opsi konfigurasi, seperti prefix, gateway, dan DNS.', from: 665, to: 105, label: 'Offer' },
      { message: 'Request: klien meminta tawaran yang dipilih.', from: 105, to: 665, label: 'Request' },
      { message: 'Acknowledge: server mengonfirmasi sewa konfigurasi DHCPv4.', from: 665, to: 105, label: 'Acknowledge · lease' }
    ]
  },
  dns: {
    caption: 'Klien meminta resolver untuk mencari alamat IPv4 dari sebuah nama domain.',
    steps: [
      { message: 'Aplikasi meminta alamat untuk nama domain; stub resolver mengirim kueri record A.', from: 105, to: 365, label: 'Kueri A · port 53' },
      { message: 'Resolver memeriksa cache. Bila jawaban belum tersedia, resolver menelusuri hierarki DNS.', from: 365, to: 665, label: 'Resolver → DNS' },
      { message: 'Jawaban record A kembali ke resolver dan dapat disimpan sementara sesuai TTL.', from: 665, to: 365, label: 'Jawaban IPv4' },
      { message: 'Resolver mengembalikan alamat kepada klien agar aplikasi dapat memulai komunikasi ke tujuan.', from: 365, to: 105, label: 'Alamat ke klien' }
    ]
  }
};

function svgNode(tag, attributes, text) {
  const node = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  if (text) node.textContent = text;
  return node;
}

function drawDiagram(packet = null) {
  const scenarioId = scenarioSelect.value;
  const resolverActive = scenarioId === 'dns' || (scenarioId === 'web' && step < 3);
  const resolverLinkActive = scenarioId === 'dns' && step >= 2 && step <= 3;
  const targetLabel = scenarioId === 'dhcp' ? 'DHCP SERVER' : scenarioId === 'dns' ? 'DNS SERVER' : 'WEB SERVER';
  diagram.replaceChildren(svgNode('title', {}, scenarios[scenarioId].caption));
  diagram.append(
    svgNode('line', {
      x1: 160, y1: 112,
      x2: resolverLinkActive ? 365 : resolverActive ? 365 : 640,
      y2: 112, class: 'service-svg-link'
    })
  );
  if (resolverActive) {
    diagram.append(
      svgNode('line', {
        x1: 435, y1: 112, x2: 640, y2: 112, class: 'service-svg-link',
        opacity: resolverLinkActive || (scenarioId === 'web' && step < 3) ? 1 : .25
      }),
      svgNode('rect', { x: 365, y: 68, width: 70, height: 88, rx: 16, class: 'service-svg-node' }),
      svgNode('text', { x: 400, y: 106, class: 'service-svg-label' }, 'DNS'),
      svgNode('text', { x: 400, y: 127, class: 'service-svg-label' }, 'Resolver')
    );
  }
  diagram.append(
    svgNode('rect', { x: 45, y: 75, width: 120, height: 74, rx: 16, class: 'service-svg-node' }),
    svgNode('text', { x: 105, y: 106, class: 'service-svg-label' }, 'KLIEN'),
    svgNode('text', { x: 105, y: 127, class: 'service-svg-label' }, 'PC / Aplikasi'),
    svgNode('rect', { x: 635, y: 75, width: 120, height: 74, rx: 16, class: 'service-svg-node' }),
    svgNode('text', { x: 695, y: 106, class: 'service-svg-label' }, targetLabel),
    svgNode('text', { x: 695, y: 127, class: 'service-svg-label' }, scenarioId === 'dhcp' ? 'UDP 67' : scenarioId === 'dns' ? 'Port 53' : 'HTTPS 443')
  );
  if (packet) {
    const mid = packet.from < packet.to ? packet.from + (packet.to - packet.from) * .55 : packet.from - (packet.from - packet.to) * .55;
    diagram.append(
      svgNode('circle', { cx: mid, cy: 112, r: 11, class: 'service-svg-packet' }),
      svgNode('text', { x: 400, y: 198, class: 'service-svg-label' }, packet.label)
    );
  }
  caption.textContent = scenarios[scenarioSelect.value].caption;
}

let step = 0;
function renderSimulation() {
  const scenario = scenarios[scenarioSelect.value];
  sequence.replaceChildren();
  scenario.steps.forEach((item, index) => {
    const line = document.createElement('div');
    line.className = `service-sequence-item${index === step - 1 ? ' is-active' : ''}`;
    line.textContent = `${index + 1}. ${item.message}`;
    sequence.append(line);
  });
  drawDiagram(step ? scenario.steps[step - 1] : null);
  if (step >= scenario.steps.length) {
    status.textContent = '✓ Alur skenario selesai. Gunakan reset atau pilih skenario lain untuk mencoba lagi.';
    stepButton.disabled = true;
    stepButton.textContent = '✓ Skenario Selesai';
  } else if (step === 0) {
    status.textContent = 'Mulai simulasi untuk mengikuti pesan pertama.';
    stepButton.disabled = false;
    stepButton.textContent = '▶ Mulai Skenario';
  } else {
    status.textContent = `${step}/${scenario.steps.length} · ${scenario.steps[step - 1].message}`;
    stepButton.disabled = false;
    stepButton.textContent = '▶ Langkah Berikutnya';
  }
}

stepButton.addEventListener('click', () => {
  step = Math.min(step + 1, scenarios[scenarioSelect.value].steps.length);
  renderSimulation();
});
function resetSimulation() { step = 0; renderSimulation(); }
scenarioSelect.addEventListener('change', resetSimulation);
resetButton.addEventListener('click', resetSimulation);
renderSimulation();

const services = [
  { id: 'dhcp', name: 'DHCPv4', port: 'UDP 67 / 68' },
  { id: 'dns', name: 'DNS', port: 'UDP / TCP 53' },
  { id: 'http', name: 'HTTP', port: 'TCP 80' },
  { id: 'https', name: 'HTTPS', port: 'TCP 443' }
];
const cards = document.getElementById('serviceCards');
const gates = document.getElementById('portGates');
const gameStatus = document.getElementById('routeStatus');
const score = document.getElementById('routeScore');
let selectedService = null;
let matched = new Set();
let mistakes = 0;

function renderGame() {
  cards.replaceChildren();
  services.forEach((service) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `service-card${selectedService === service.id ? ' is-selected' : ''}`;
    card.textContent = service.name;
    card.disabled = matched.has(service.id);
    card.setAttribute('aria-pressed', String(selectedService === service.id));
    card.addEventListener('click', () => {
      selectedService = service.id;
      gameStatus.textContent = `${service.name} dipilih. Sekarang tentukan gerbang port tujuannya.`;
      renderGame();
    });
    cards.append(card);
  });
  gates.replaceChildren();
  services.forEach((service) => {
    const gate = document.createElement('button');
    gate.type = 'button';
    gate.className = 'port-gate';
    gate.textContent = matched.has(service.id) ? `✓ ${service.port}` : service.port;
    gate.disabled = matched.has(service.id);
    gate.addEventListener('click', () => placeService(service.id));
    gates.append(gate);
  });
  score.textContent = `Tepat ${matched.size}/4 · Kesalahan ${mistakes}`;
}

function placeService(gateId) {
  if (!selectedService) {
    gameStatus.textContent = 'Pilih kartu layanan terlebih dahulu.';
    return;
  }
  if (selectedService === gateId) {
    const service = services.find((item) => item.id === selectedService);
    matched.add(service.id);
    gameStatus.textContent = matched.size === services.length
      ? '🏆 Semua layanan tiba di gerbang port yang tepat!'
      : `✓ Tepat! ${service.name} menggunakan port standar ${service.port}. Pilih layanan berikutnya.`;
    selectedService = null;
  } else {
    mistakes += 1;
    const service = services.find((item) => item.id === selectedService);
    gameStatus.textContent = `Belum tepat. ${service.name} tetap bisa dipilih; coba gerbang port lainnya.`;
  }
  renderGame();
}

document.getElementById('routeRestart').addEventListener('click', () => {
  selectedService = null;
  matched = new Set();
  mistakes = 0;
  gameStatus.textContent = 'Pilih satu kartu layanan untuk mulai.';
  renderGame();
});
renderGame();

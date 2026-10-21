import { bindThemeToggle } from './theme.js';
import { mountChapterNavigation } from './chapter-navigation.js?v=5';

mountChapterNavigation({
  moduleId: 'media-transmisi',
  title: 'Media Transmisi',
  chapters: [
    {
      id: 'pengantar',
      title: 'Mengenal Media Transmisi',
      summary: 'Pelajari fungsi media transmisi dan perbedaan tembaga, fiber, serta nirkabel.',
      questions: [{ question: 'Media transmisi pada jaringan berfungsi untuk ...', options: ['Membawa sinyal/data antara perangkat', 'Memberi nama pengguna', 'Menggantikan semua protokol'], answer: 0 }]
    },
    {
      id: 'tembaga',
      title: 'Kabel Tembaga',
      summary: 'Pelajari twisted pair, konektor, batas channel, dan pemeriksaan kabel.',
      questions: [{ question: 'Fungsi pasangan kabel yang dipilin pada twisted pair adalah membantu ...', options: ['Mengurangi pengaruh gangguan elektromagnetik', 'Menyimpan alamat IP', 'Memancarkan Wi-Fi'], answer: 0 }]
    },
    {
      id: 'fiber',
      title: 'Fiber Optik',
      summary: 'Kenali transmisi cahaya, karakteristik serat, dan alat pemeriksa optik.',
      questions: [{ question: 'Salah satu keunggulan fiber optik adalah ...', options: ['Tahan terhadap interferensi elektromagnetik', 'Selalu dapat disambung dengan konektor Ethernet tembaga', 'Tidak membutuhkan transceiver'], answer: 0 }]
    },
    {
      id: 'nirkabel',
      title: 'Media Nirkabel',
      summary: 'Pahami sinyal radio Wi-Fi, cakupan, penghalang, dan interferensi.',
      questions: [{ question: 'Kondisi yang dapat memengaruhi kualitas Wi-Fi adalah ...', options: ['Penghalang, jarak, dan interferensi radio', 'Warna kabel Ethernet', 'Jumlah inti fiber'], answer: 0 }]
    },
    {
      id: 'memilih',
      title: 'Memilih dan Menguji Media',
      summary: 'Bandingkan kebutuhan lokasi, jarak, biaya, kapasitas, dan alat uji.',
      questions: [{ question: 'Untuk memilih media antarbangunan, hal utama yang perlu dibandingkan adalah ...', options: ['Jarak, jalur, lingkungan, kapasitas, dan standar perangkat', 'Hanya warna konektor', 'Nama merek tanpa memeriksa kompatibilitas'], answer: 0 }]
    },
    {
      id: 'simulator',
      title: 'Simulator Jalur Transmisi',
      summary: 'Ubah kondisi tembaga, fiber, dan Wi-Fi lalu amati paket pada simulasi.',
      type: 'simulation',
      questions: [{ question: 'Simulator media ini menunjukkan ...', options: ['Model konseptual pengaruh kondisi pada jalur', 'Jaminan throughput dan jarak nyata', 'Hasil sertifikasi kabel profesional'], answer: 0 }]
    },
    {
      id: 'virtual-tester',
      title: 'Virtual Cable Tester',
      summary: 'Jalankan pemeriksaan wire map untuk menemukan kabel putus atau pin tertukar.',
      type: 'simulation',
      questions: [{ question: 'Cable tester dasar membantu memeriksa ...', options: ['Kontinuitas dan susunan pin kabel', 'Redaman fiber sepanjang jalur secara lengkap', 'Konfigurasi DNS server'], answer: 0 }]
    },
    {
      id: 'posttest',
      title: 'Posttest Media Transmisi',
      summary: 'Ukur pemahaman tentang tembaga, fiber, nirkabel, dan pengujian media.',
      questions: [
        { question: 'Data pada kabel twisted pair Ethernet dibawa terutama sebagai ...', options: ['Sinyal listrik', 'Pulsa cahaya pada inti serat', 'Gelombang radio Wi-Fi'], answer: 0 },
        { question: 'Fiber optik membawa informasi menggunakan ...', options: ['Pulsa cahaya', 'Arus listrik pada pasangan tembaga', 'Alamat MAC sebagai sinyal'], answer: 0 },
        { question: 'Access point berkomunikasi dengan klien Wi-Fi melalui ...', options: ['Gelombang radio', 'Konektor 8P8C saja', 'Pulsa cahaya dalam serat'], answer: 0 },
        { question: 'Cable tester straight-through dasar membandingkan ...', options: ['Pemetaan kontinuitas pin di kedua ujung', 'Kualitas autentikasi Wi-Fi', 'Rute IP antarjaringan'], answer: 0 },
        { question: 'Kualitas Wi-Fi dapat berubah karena ...', options: ['Penghalang, jarak, kanal, dan interferensi', 'Jenis alamat IPv4 privat saja', 'Jumlah pasangan kabel pada fiber'], answer: 0 },
        { question: 'Batas umum channel twisted-pair Ethernet perlu dipahami sebagai ...', options: ['Bergantung standar serta instalasi yang berlaku', 'Selalu 1.000 meter untuk semua kategori', 'Tidak dipengaruhi jenis kabel'], answer: 0 },
        { question: 'Untuk mengukur redaman jalur fiber, alat yang sesuai dapat mencakup ...', options: ['Optical power meter dan light source', 'Crimping tool saja', 'Wi-Fi analyzer'], answer: 0 },
        { question: 'Pemilihan media jaringan sebaiknya berdasarkan ...', options: ['Kebutuhan, kondisi lokasi, kompatibilitas, dan biaya', 'Merek yang paling populer saja', 'Jenis konektor yang tersedia tanpa melihat jarak'], answer: 0 }
      ]
    }
  ]
});

bindThemeToggle(document.getElementById('mediaThemeToggle'));

const svg = document.getElementById('mediaSvg');
const distance = document.getElementById('mediaDistance');
const distanceOutput = document.getElementById('distanceOutput');
const obstacle = document.getElementById('mediaObstacle');
const interference = document.getElementById('mediaInterference');
const qualityValue = document.getElementById('qualityValue');
const linkState = document.getElementById('linkState');
const feedback = document.getElementById('mediaFeedback');
const caption = document.getElementById('mediaCaption');
const sendButton = document.getElementById('sendMediaPacket');
const mediumButtons = [...document.querySelectorAll('.media-types button[data-medium]')];
let medium = 'copper';
let animationId = 0;

const svgElement = (tag, attributes, text) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  if (text) node.textContent = text;
  return node;
};

function readConditions() {
  const meters=Number(distance.value),blocked=obstacle.checked,noisy=interference.checked;
  const rangeOk=medium!=='copper'||meters<=100;
  let detail;
  if(medium==='copper')detail=(rangeOk?'Periksa kategori, terminasi, dan standar aplikasi twisted pair.':'Jarak melampaui channel 100 m yang umum untuk banyak aplikasi Ethernet twisted pair; tinjau standar dan rancangan. ')+(noisy?' Ada sumber interferensi: perlu evaluasi instalasi dan pengujian.':'')+(blocked?' Penghalang fisik perlu rute kabel yang aman, bukan langsung dihitung sebagai redaman radio.':'');
  else if(medium==='fiber')detail='Fiber tidak mengalami interferensi elektromagnetik pada serat. Nilai kelayakan memerlukan jenis fiber, transceiver, rugi konektor/sambungan, dan anggaran daya. Penghalang memengaruhi rute instalasi; tidak ada skor kualitas yang dapat diturunkan hanya dari jarak ini.';
  else detail='Radio memerlukan survei cakupan dan kapasitas. '+(blocked?'Penghalang dapat memengaruhi propagasi; besar dampak bergantung bahan dan geometri. ':'')+(noisy?'Interferensi perlu pengukuran kanal dan lingkungan. ':'')+'Jarak saja tidak menentukan throughput atau memastikan paket gagal.';
  return {meters,blocked,noisy,rangeOk,detail,quality:medium==='fiber'?100:(blocked||noisy?50:100)};
}
function updateReadout() {
  const conditions = readConditions();
  distanceOutput.value = `${conditions.meters} m`;
  distanceOutput.textContent = `${conditions.meters} m`;
  qualityValue.textContent = 'Belum diukur';
  linkState.textContent = conditions.rangeOk ? 'Tinjau kondisi dan spesifikasi' : 'Perlu tinjauan panjang channel';
  feedback.textContent = conditions.detail;
  draw();
}

function draw() {
  const conditions = readConditions();
  const source = medium === 'wireless' ? 'Access point' : medium === 'fiber' ? 'Core switch' : 'PC / NIC';
  const target = medium === 'wireless' ? 'Laptop' : medium === 'fiber' ? 'Server' : 'Switch';
  const stroke = medium === 'copper' ? '#35c7dc' : medium === 'fiber' ? '#f6c85f' : '#b49aff';
  svg.replaceChildren(svgElement('title', {}, `Simulasi media ${source} ke ${target}`));
  svg.append(svgElement('line', { x1: 150, y1: 130, x2: 650, y2: 130, class: medium === 'wireless' ? 'media-path-wireless' : 'media-path', stroke }));
  if (medium === 'copper') {
    [-7, -2, 3, 8].forEach((offset, index) => svg.append(svgElement('path', {
      d: `M 150 ${130 + offset} C 280 ${112 + offset} 500 ${148 + offset} 650 ${130 + offset}`,
      fill: 'none',
      stroke: ['#44d0df', '#f3bd65', '#9bdaa7', '#df87aa'][index],
      'stroke-width': 2
    })));
    [150, 650].forEach((x) => svg.append(svgElement('rect', { x: x - 9, y: 117, width: 18, height: 26, rx: 3, fill: '#e6c16b', stroke: '#fff0b6', 'stroke-width': 2 })));
  }
  if (medium === 'fiber') {
    svg.append(svgElement('path', { d: 'M 150 130 C 280 95 500 165 650 130', fill: 'none', stroke: '#fff2b7', 'stroke-width': 2 }));
    svg.append(svgElement('path', { d: 'M 150 135 C 280 100 500 170 650 135', fill: 'none', stroke: '#9b7cff', 'stroke-width': 2 }));
  }
  if (medium === 'wireless') {
    [48, 90, 132].forEach((radius) => svg.append(svgElement('circle', {
      cx: 400, cy: 130, r: radius, class: 'media-wave', stroke: '#b49aff',
      'stroke-dasharray': conditions.noisy ? '5 8' : 'none',
      opacity: conditions.quality < 40 ? .25 : .65
    })));
  }
  if (conditions.blocked && medium === 'wireless') {
    svg.append(svgElement('rect', { x: 378, y: 64, width: 44, height: 130, rx: 8, class: 'media-obstacle' }));
    svg.append(svgElement('text', { x: 400, y: 218, class: 'media-device-label' }, 'PENGHALANG'));
  }
  [[150, source], [650, target]].forEach(([x, label]) => {
    svg.append(svgElement('circle', { cx: x, cy: 130, r: 32, class: 'media-device' }));
    svg.append(svgElement('text', { x, y: 135, class: 'media-device-label' }, medium === 'wireless' ? (x === 150 ? 'AP' : 'Wi-Fi') : medium === 'fiber' ? (x === 150 ? 'CORE' : 'SRV') : (x === 150 ? 'PC' : 'SW')));
    svg.append(svgElement('text', { x, y: 190, class: 'media-device-label' }, label));
  });
  if (conditions.noisy && medium !== 'fiber') {
    svg.append(svgElement('text', { x: 400, y: 34, class: 'media-device-label' }, 'INTERFERENSI'));
  }
  caption.textContent = medium === 'copper'
    ? 'Sinyal listrik pada pasangan kabel tembaga terpilin.'
    : medium === 'fiber'
      ? 'Pulsa cahaya bergerak di inti fiber optik.'
      : 'Gelombang radio menghubungkan klien Wi-Fi ke access point.';
}

async function sendPacket() {
  const conditions = readConditions();
  const currentRun = ++animationId;
  sendButton.disabled = true;
  feedback.textContent = 'Paket sedang dikirim melalui media yang dipilih…';
  const packet = svgElement('circle', { cx: 150, cy: 130, r: 10, class: 'media-packet' });
  svg.append(packet);
  const endX = 650;
  const started = performance.now();
  await new Promise((resolve) => {
    const frame = (now) => {
      if (currentRun !== animationId || !svg.isConnected) {
        resolve();
        return;
      }
      const progress = Math.min(1, (now - started) / 1250);
      packet.setAttribute('cx', String(150 + (endX - 150) * progress));
      if (progress < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
  if (currentRun !== animationId) return;
  packet.remove();
  sendButton.disabled = false;
  feedback.textContent = 'Animasi menelusuri arah sinyal, bukan hasil uji konektivitas. ' + conditions.detail;
}

mediumButtons.forEach((button) => {
  button.addEventListener('click', () => {
    medium = button.dataset.medium;
    mediumButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    animationId += 1;
    sendButton.disabled = false;
    updateReadout();
  });
});
[distance, obstacle, interference].forEach((control) => control.addEventListener('input', () => {
  animationId += 1;
  sendButton.disabled = false;
  updateReadout();
}));
sendButton.addEventListener('click', sendPacket);
updateReadout();

const cableSvg = document.getElementById('cableTesterSvg');
const cableFeedback = document.getElementById('cableTesterFeedback');
const cableCaption = document.getElementById('cableTesterCaption');
const cableButtons = [...document.querySelectorAll('[data-cable-fault]')];
let cableFault = 'normal';
let cableTested = false;
const cableColors = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#facc15', '#06b6d4', '#ef4444', '#64748b'];

function drawCableTester() {
  cableSvg.replaceChildren(svgElement('title', {}, 'Pemetaan pin cable tester'));
  cableSvg.append(
    svgElement('text', { x: 130, y: 28, class: 'media-device-label' }, 'MAIN TESTER'),
    svgElement('text', { x: 670, y: 28, class: 'media-device-label' }, 'REMOTE')
  );
  for (let index = 0; index < 8; index += 1) {
    const pin = index + 1;
    const y = 62 + index * 31;
    let mappedPin = pin;
    if (cableFault === 'miswire' && pin === 3) mappedPin = 6;
    else if (cableFault === 'miswire' && pin === 6) mappedPin = 3;
    const mappedY = 62 + (mappedPin - 1) * 31;
    const disconnected = cableFault === 'open' && pin === 4;
    const lineClass = `cable-wire${disconnected ? ' is-open' : cableFault === 'miswire' && (pin === 3 || pin === 6) ? ' is-crossed' : ''}`;
    if (disconnected) {
      cableSvg.append(
        svgElement('line', { x1: 158, y1: y, x2: 384, y2: y, class: lineClass, stroke: cableColors[index] }),
        svgElement('line', { x1: 416, y1: y, x2: 642, y2: y, class: lineClass, stroke: cableColors[index] }),
        svgElement('path', { d: `M 390 ${y - 7} l 8 14 M 398 ${y - 7} l 8 14`, class: 'cable-break' })
      );
    } else {
      cableSvg.append(svgElement('path', { d: `M 158 ${y} C 310 ${y} 490 ${mappedY} 642 ${mappedY}`, class: lineClass, stroke: cableColors[index] }));
    }
    cableSvg.append(
      svgElement('circle', { cx: 130, cy: y, r: 10, class: `cable-led${cableTested ? ' is-on' : ''}` }),
      svgElement('text', { x: 105, y: y + 5, class: 'cable-pin-label' }, String(pin)),
      svgElement('circle', { cx: 670, cy: mappedY, r: 10, class: `cable-led${cableTested && !disconnected ? ' is-on' : cableTested ? ' is-fail' : ''}` }),
      svgElement('text', { x: 695, y: mappedY + 5, class: 'cable-pin-label' }, String(mappedPin))
    );
  }
  cableCaption.textContent = cableFault === 'normal'
    ? 'Pemetaan straight-through: pin 1 sampai 8 tersambung lurus.'
    : cableFault === 'open'
      ? 'Pin 4 mengalami open circuit; remote tester tidak menerima kontinuitas pada jalur tersebut.'
      : 'Pin 3 dan 6 tertukar; kontinuitas ada, tetapi wire map tidak sesuai kabel straight-through.';
}

cableButtons.forEach((button) => {
  button.addEventListener('click', () => {
    cableFault = button.dataset.cableFault;
    cableTested = false;
    cableButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    cableFeedback.textContent = 'Kondisi simulasi diubah. Jalankan cable tester untuk membaca hasil wire map.';
    drawCableTester();
  });
});
document.getElementById('runCableTest').addEventListener('click', () => {
  cableTested = true;
  drawCableTester();
  cableFeedback.textContent = cableFault === 'normal'
    ? '✓ Delapan jalur menunjukkan kontinuitas dan susunan pin straight-through yang sesuai.'
    : cableFault === 'open'
      ? '⚠ Pin 4 tidak mendapat kontinuitas. Periksa terminasi, konektor, atau kerusakan konduktor.'
      : '⚠ Semua konduktor memiliki jalur, tetapi pin 3 dan 6 tertukar. Periksa urutan terminasi di kedua ujung.';
});
drawCableTester();

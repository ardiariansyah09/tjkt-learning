
import { bindThemeToggle } from './theme.js';

const moduleList = document.getElementById("moduleList");
const themeToggle = document.getElementById("themeToggle");

bindThemeToggle(themeToggle);

const moduleIcons = {
  "pengenalan-jaringan": "🧭",
  "topologi-jaringan": "🔀",
  "perangkat-jaringan": "🔌",
  "media-transmisi": "📡",
  "osi-tcpip": "🧱",
  "ipv4-subnetting": "🧮",
  "protokol-layanan": "🌐",
  troubleshooting: "🛠️",
  "switching-vlan": "🔗",
  "routing-ipv4": "🧭",
  "routing-dinamis": "🔄",
  "dasar-administrasi-server": "🖥️",
  "manajemen-pengguna-server": "👥",
  "layanan-server": "🗄️",
  "file-server": "📁",
  "administrasi-linux-windows": "⚙️",
  "backup-pemulihan-server": "💾",
  "virtualisasi-server": "🧩",
  "wireless-lan": "📶",
  "nat-wan": "🌍",
  "keamanan-jaringan": "🛡️",
  "monitoring-jaringan": "📊",
  "proyek-integrasi-jaringan": "🧩"
};

async function loadModules() {
  if (!moduleList) return;

  try {
    const response = await fetch("data/modules.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Gagal membaca modules.json (HTTP ${response.status})`
      );
    }

    const modules = await response.json();
    const atpResponse = await fetch('data/atp-fase-f.json', { cache:'no-store' });
    if (!atpResponse.ok) throw new Error('Data ATP Fase F tidak dapat dimuat.');
    const atp = await atpResponse.json();

    if (!Array.isArray(modules)) {
      throw new Error("Format modules.json harus berupa array.");
    }

    moduleList.replaceChildren();

    if (modules.length === 0) {
      moduleList.textContent = "Belum ada materi pembelajaran.";
      return;
    }

    modules.sort((a, b) => String(a.phase).localeCompare(String(b.phase)) || (a.phase === 'F' ? String(a.classLevel).localeCompare(String(b.classLevel)) : 0) || (a.groupOrder ?? 99) - (b.groupOrder ?? 99) || (a.order ?? 99) - (b.order ?? 99));
    const byId = new Map(modules.map(module => [module.id, module]));
    const groups = new Map();
    modules.forEach((module) => {
      const groupTitle = `${module.category || "Umum"} - Fase ${module.phase || "-"}${module.phase === 'F' ? ` · Kelas ${module.classLevel}` : ''}`;
      if (!groups.has(groupTitle)) {
        groups.set(groupTitle, []);
      }
      groups.get(groupTitle).push(module);
    });

    let groupIndex = 0;
    let currentPhase;
    let currentClass;
    groups.forEach((groupModules, groupTitle) => {
      const phase = groupModules[0].phase;
      if (phase !== currentPhase) {
        currentPhase = phase;
        const phaseHeading = document.createElement('h2');
        phaseHeading.className = 'phase-heading';
        phaseHeading.id = `fase-${phase.toLowerCase()}`;
        phaseHeading.textContent = phase === 'E'
          ? 'Fase E · Kelas X — Dasar-Dasar TJKT'
          : 'Fase F · Kelas XI–XII — Teknik Komputer dan Jaringan';
        moduleList.append(phaseHeading);
        if (phase === 'F') {
          const note = document.createElement('p');
          note.className = 'phase-atp-note';
          note.textContent = `Mengikuti ATP ${atp.school} ${atp.schoolYear}. JP merupakan alokasi total elemen, bukan alokasi setiap modul.`;
          moduleList.append(note);
        }
      }
      if (phase === 'F' && groupModules[0].classLevel !== currentClass) {
        currentClass = groupModules[0].classLevel;
        const plan = atp.classes.find(item => item.classLevel === currentClass);
        const classHeading = document.createElement('h3');
        classHeading.className = 'class-heading';
        classHeading.id = `fase-f-kelas-${currentClass.toLowerCase()}`;
        classHeading.textContent = `Kelas ${currentClass} · ${plan.totalJP} JP`;
        const summary = document.createElement('p');
        summary.className = 'class-summary';
        summary.textContent = plan.summary;
        moduleList.append(classHeading, summary);
      }
      const index = groupIndex++;
      const section = document.createElement("section");
      section.className = "module-group";
      section.dataset.phase = phase;
      section.dataset.classLevel = groupModules[0].classLevel;
      section.classList.toggle('module-group-single', groupModules.length === 1);
      section.setAttribute("aria-labelledby", `module-group-title-${index}`);

      const heading = document.createElement("h3");
      heading.className = "module-group-title";
      heading.id = `module-group-title-${index}`;
      heading.textContent = groupTitle;
      section.append(heading);
      if (phase === 'F') {
        const element = atp.elements.find(item => item.classLevel === currentClass && item.category === groupModules[0].category);
        if (element) {
          const allocation = document.createElement('p');
          allocation.className = 'element-allocation';
          allocation.textContent = `Alokasi elemen: ${element.jp} JP`;
          section.append(allocation);
        }
      }

      const grid = document.createElement("div");
      grid.className = "module-grid";

      groupModules.forEach((module) => {
        const card = document.createElement("article");
        card.className = "module-card";
        card.classList.add(module.status === "published" ? "is-published" : "is-coming-soon");
        card.dataset.moduleId = module.id || "";
        if (phase === 'F') card.dataset.curriculumRole = module.curriculumRole;

        const cardTop = document.createElement("div");
        cardTop.className = "module-card-top";

        const icon = document.createElement("span");
        icon.className = "module-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = moduleIcons[module.id] || "📚";

        const title = document.createElement("h3");
        title.textContent = module.title || "Tanpa Judul";
        title.id = `module-title-${module.id || "untitled"}`;
        card.setAttribute("aria-labelledby", title.id);

        const description = document.createElement("p");
        description.textContent = module.description || "";

        cardTop.append(icon);
        const position = document.createElement('p');
        position.className = 'module-position';
        position.textContent = `Urutan ${module.order} · Fase ${module.phase} · Kelas ${module.classLevel}`;
        card.append(cardTop, title, position, description);
        if (phase === 'F') {
          const badge = document.createElement('span');
          badge.className = `curriculum-badge curriculum-${module.curriculumRole}`;
          badge.textContent = {inti:'Materi ATP',pendukung:'Pendukung pembelajaran',pengayaan:'Pengayaan'}[module.curriculumRole];
          card.append(badge);
        }

        const outline = document.createElement('details');
        outline.className = 'module-outline';
        const summary = document.createElement('summary');
        summary.textContent = 'Prasyarat belajar';
        outline.append(summary);
        const prerequisiteList = document.createElement('ul');
        (module.prerequisites || []).forEach(id => {
          const prerequisite = byId.get(id);
          if (!prerequisite) return;
          const item = document.createElement('li');
          if (prerequisite.status === 'published' && prerequisite.path) {
            const link = document.createElement('a');
            link.href = prerequisite.path;
            link.textContent = prerequisite.title;
            item.append(link);
          } else {
            item.textContent = `${prerequisite.title} (direncanakan)`;
          }
          prerequisiteList.append(item);
        });
        if (!prerequisiteList.children.length) {
          const item = document.createElement('li');
          item.textContent = 'Tidak ada prasyarat khusus.';
          prerequisiteList.append(item);
        }
        outline.append(prerequisiteList);
        card.append(outline);

        if (module.status === "published" && module.path) {
          const link = document.createElement("a");
          link.href = module.path;
          link.textContent = "Mulai Belajar →";
          card.append(link);
        } else {
          const status = document.createElement("p");
          status.textContent = "🔒 Segera Hadir";
          card.append(status);
        }

        grid.append(card);
      });

      section.append(grid);
      moduleList.append(section);
    });

  } catch (error) {
    console.error("Gagal memuat katalog:", error);

    moduleList.textContent =
      "Gagal memuat materi. Periksa data/modules.json dan Console browser.";
  }
}

// Jalankan saat halaman dibuka
loadModules();

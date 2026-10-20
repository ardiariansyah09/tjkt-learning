
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
  "switching-vlan": "🔗"
};

// ================================
// MEMUAT KATALOG PEMBELAJARAN
// ================================

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

    if (!Array.isArray(modules)) {
      throw new Error("Format modules.json harus berupa array.");
    }

    moduleList.replaceChildren();

    if (modules.length === 0) {
      moduleList.textContent = "Belum ada materi pembelajaran.";
      return;
    }

    modules.forEach((module) => {
      const card = document.createElement("article");
      card.className = "module-card";
      card.classList.add(module.status === "published" ? "is-published" : "is-coming-soon");
      card.dataset.moduleId = module.id || "";

      const cardTop = document.createElement("div");
      cardTop.className = "module-card-top";

      const category = document.createElement("small");
      category.className = "module-category";
      category.textContent =
        `${module.category || "Umum"} • Kelas ${module.classLevel || "-"}`;

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

      cardTop.append(category, icon);
      card.append(cardTop, title, description);

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

      moduleList.append(card);
    });

  } catch (error) {
    console.error("Gagal memuat katalog:", error);

    moduleList.textContent =
      "Gagal memuat materi. Periksa data/modules.json dan Console browser.";
  }
}

// Jalankan saat halaman dibuka
loadModules();

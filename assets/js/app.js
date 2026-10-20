
const moduleList = document.getElementById("moduleList");
const themeToggle = document.getElementById("themeToggle");

// ================================
// PENGATURAN TEMA
// ================================

const savedTheme = localStorage.getItem("tjkt-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark")
      ? "dark"
      : "light";

    localStorage.setItem("tjkt-theme", theme);
  });
}

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

      const category = document.createElement("small");
      category.textContent =
        `${module.category || "Umum"} • Kelas ${module.classLevel || "-"}`;

      const title = document.createElement("h3");
      title.textContent = module.title || "Tanpa Judul";

      const description = document.createElement("p");
      description.textContent = module.description || "";

      card.append(category, title, description);

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

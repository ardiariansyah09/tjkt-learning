/* Network Builder Visual — Fixed Cable Position
   Kompatibel dengan GitHub Pages
   Vanilla JavaScript, tanpa database/backend
*/

(() => {
  "use strict";

  const DEVICES = [
    { id: "pcA", name: "PC A", emoji: "💻", x: 12, y: 26 },
    { id: "pcB", name: "PC B", emoji: "💻", x: 12, y: 75 },
    { id: "switch", name: "Switch", emoji: "🔀", x: 48, y: 50 },
    { id: "router", name: "Router", emoji: "🌐", x: 82, y: 26 },
    { id: "server", name: "Server", emoji: "🗄️", x: 82, y: 75 }
  ];

  const pos = Object.fromEntries(
    DEVICES.map(device => [device.id, device])
  );

  const svgNS = "http://www.w3.org/2000/svg";

  const linkKey = (a, b) =>
    [a, b].sort().join("|");

  function make(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function renderBuilder() {
    if (typeof current === "undefined" || current !== 6) {
      return;
    }

    const root = document.getElementById("content");

    if (!root) return;

    root.querySelectorAll(".intro-sim").forEach(element => {
      if (
        element.querySelector("h3")
          ?.textContent.includes("Network Builder")
      ) {
        element.remove();
      }
    });

    root.querySelector(".nvb")?.remove();

    const section = make("section", "nvb intro-sim");

    section.append(
      make(
        "h3",
        null,
        "🔧 Network Builder — Laboratorium Sekolah"
      ),
      make(
        "p",
        null,
        "Klik dua perangkat untuk memasang kabel. " +
        "Hubungkan PC A dan PC B melalui Switch. " +
        "Router dan Server tersedia untuk eksperimen."
      )
    );

    const board = make("div", "nvb-board");

    const svg = document.createElementNS(svgNS, "svg");

    svg.classList.add("nvb-lines");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");

    // SVG mengikuti ukuran aktual board.
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    board.append(svg);

    const buttons = new Map();
    const links = new Set();

    let selected = null;
    let pinging = false;
    let pingTimer = null;

    const status = make(
      "div",
      "nvb-status",
      "Pilih PC A, kemudian Switch untuk memasang kabel."
    );

    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    const cableList = make("div", "nvb-cables");
    const toolbar = make("div", "nvb-toolbar");

    const isLinked = (a, b) =>
      links.has(linkKey(a, b));

    // =====================================================
    // MENGAMBIL KOORDINAT PERANGKAT SECARA AKURAT
    // =====================================================

    function getDeviceBox(id) {
      const button = buttons.get(id);

      if (!button) return null;

      const deviceRect = button.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();

      return {
        left: deviceRect.left - boardRect.left,
        top: deviceRect.top - boardRect.top,
        right: deviceRect.right - boardRect.left,
        bottom: deviceRect.bottom - boardRect.top,
        cx:
          deviceRect.left -
          boardRect.left +
          deviceRect.width / 2,
        cy:
          deviceRect.top -
          boardRect.top +
          deviceRect.height / 2,
        width: deviceRect.width,
        height: deviceRect.height
      };
    }

    // Menghitung titik perpotongan garis dengan tepi kartu.
    function getEdgePoint(fromBox, toBox) {
      const dx = toBox.cx - fromBox.cx;
      const dy = toBox.cy - fromBox.cy;

      if (dx === 0 && dy === 0) {
        return {
          x: fromBox.cx,
          y: fromBox.cy
        };
      }

      const halfWidth = fromBox.width / 2;
      const halfHeight = fromBox.height / 2;

      const scaleX =
        Math.abs(dx) > 0
          ? halfWidth / Math.abs(dx)
          : Infinity;

      const scaleY =
        Math.abs(dy) > 0
          ? halfHeight / Math.abs(dy)
          : Infinity;

      const scale = Math.min(scaleX, scaleY);

      return {
        x: fromBox.cx + dx * scale,
        y: fromBox.cy + dy * scale
      };
    }

    function getCablePoints(a, b) {
      const boxA = getDeviceBox(a);
      const boxB = getDeviceBox(b);

      if (!boxA || !boxB) return null;

      return {
        start: getEdgePoint(boxA, boxB),
        end: getEdgePoint(boxB, boxA)
      };
    }

    function resizeSvg() {
      const width = board.clientWidth;
      const height = board.clientHeight;

      if (!width || !height) return;

      svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
      );
    }

    // =====================================================
    // GAMBAR KABEL
    // =====================================================

    function draw() {
      resizeSvg();
      svg.replaceChildren();

      for (const key of links) {
        const [a, b] = key.split("|");
        const points = getCablePoints(a, b);

        if (!points) continue;

        const line = document.createElementNS(
          svgNS,
          "line"
        );

        line.setAttribute("x1", points.start.x);
        line.setAttribute("y1", points.start.y);
        line.setAttribute("x2", points.end.x);
        line.setAttribute("y2", points.end.y);

        line.setAttribute("stroke", "#0284c7");
        line.setAttribute("stroke-width", "4");
        line.setAttribute("stroke-linecap", "round");

        line.setAttribute(
          "data-cable",
          key
        );

        svg.append(line);
      }

      for (const [id, button] of buttons) {
        button.classList.toggle(
          "nvb-selected",
          selected === id
        );
      }

      cableList.textContent = links.size
        ? "Kabel terpasang: " +
          [...links]
            .map(key =>
              key
                .split("|")
                .map(id => pos[id].name)
                .join(" ↔ ")
            )
            .join(" · ")
        : "Belum ada kabel terpasang.";
    }

    // =====================================================
    // LOGIKA KONEKSI
    // =====================================================

    function reachable(a, b) {
      const queue = [a];
      const visited = new Set([a]);

      while (queue.length) {
        const node = queue.shift();

        if (node === b) return true;

        for (const key of links) {
          const [x, y] = key.split("|");

          const neighbor =
            x === node ? y :
            y === node ? x :
            null;

          if (
            neighbor &&
            !visited.has(neighbor)
          ) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      return false;
    }

    function choose(id) {
      if (pinging) return;

      if (!selected) {
        selected = id;

        status.textContent =
          `${pos[id].name} dipilih. ` +
          "Klik perangkat tujuan.";

        draw();
        return;
      }

      if (selected === id) {
        selected = null;
        status.textContent = "Pilihan dibatalkan.";
        draw();
        return;
      }

      const key = linkKey(selected, id);

      if (links.has(key)) {
        links.delete(key);

        status.textContent =
          `Kabel ${pos[selected].name} ↔ ` +
          `${pos[id].name} dilepas.`;
      } else {
        links.add(key);

        status.textContent =
          `Kabel ${pos[selected].name} ↔ ` +
          `${pos[id].name} terpasang.`;
      }

      selected = null;
      draw();
    }

    // =====================================================
    // MEMBUAT PERANGKAT
    // =====================================================

    for (const device of DEVICES) {
      const button = make(
        "button",
        "nvb-device"
      );

      button.type = "button";

      button.style.left = device.x + "%";
      button.style.top = device.y + "%";

      button.setAttribute(
        "aria-label",
        device.name + " — pilih perangkat"
      );

      button.append(
        make("span", "nvb-emoji", device.emoji),
        make("strong", null, device.name)
      );

      button.addEventListener(
        "click",
        () => choose(device.id)
      );

      board.append(button);
      buttons.set(device.id, button);
    }

    // =====================================================
    // TOMBOL AKSI
    // =====================================================

    function action(label, callback, secondary = false) {
      const button = make(
        "button",
        secondary
          ? "nvb-btn nvb-secondary"
          : "nvb-btn",
        label
      );

      button.type = "button";
      button.addEventListener("click", callback);

      toolbar.append(button);

      return button;
    }

    action("✓ Uji LAN", () => {
      const valid =
        isLinked("pcA", "switch") &&
        isLinked("pcB", "switch") &&
        reachable("pcA", "pcB");

      status.textContent = valid
        ? "✓ Berhasil! PC A dan PC B " +
          "terhubung melalui Switch. " +
          "Ini simulasi konektivitas fisik."
        : "✗ Belum tepat. Hubungkan " +
          "PC A → Switch dan PC B → Switch.";
    });

    // =====================================================
    // ANIMASI PING BERDASARKAN POSISI ASLI
    // =====================================================

    action("▶ Simulasikan Ping", () => {
      if (pinging) return;

      if (
        !isLinked("pcA", "switch") ||
        !isLinked("pcB", "switch")
      ) {
        status.textContent =
          "Ping gagal: jalur PC A → Switch → PC B " +
          "belum lengkap.";
        return;
      }

      pinging = true;

      status.textContent =
        "Mengirim paket ICMP simulasi: " +
        "PC A → Switch → PC B...";

      const route = [
        "pcA",
        "switch",
        "pcB",
        "switch",
        "pcA"
      ];

      const dot = document.createElementNS(
        svgNS,
        "circle"
      );

      dot.setAttribute("r", "9");
      dot.setAttribute("fill", "#f59e0b");
      dot.setAttribute("stroke", "#ffffff");
      dot.setAttribute("stroke-width", "2");

      svg.append(dot);

      let segment = 0;
      let frame = 0;
      const framesPerSegment = 24;

      function animate() {
        if (!dot.isConnected || !board.isConnected) {
          pinging = false;
          return;
        }

        if (segment >= route.length - 1) {
          dot.remove();
          pinging = false;

          status.textContent =
            "✓ Reply diterima! " +
            "Paket berhasil melewati jalur simulasi.";

          return;
        }

        const from = getDeviceBox(route[segment]);
        const to = getDeviceBox(route[segment + 1]);

        if (!from || !to) {
          dot.remove();
          pinging = false;
          return;
        }

        const progress = frame / framesPerSegment;

        const x =
          from.cx +
          (to.cx - from.cx) * progress;

        const y =
          from.cy +
          (to.cy - from.cy) * progress;

        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);

        frame++;

        if (frame > framesPerSegment) {
          frame = 0;
          segment++;
        }

        pingTimer = requestAnimationFrame(animate);
      }

      animate();
    });

    action(
      "↺ Hapus Semua Kabel",
      () => {
        if (pinging) return;

        links.clear();
        selected = null;

        draw();

        status.textContent =
          "Semua kabel telah dilepas.";
      },
      true
    );

    section.append(
      board,
      toolbar,
      status,
      cableList,
      make(
        "p",
        "nvb-note",
        "Tips: klik dua perangkat untuk " +
        "memasang atau melepas kabel."
      )
    );

    root.append(section);

    draw();

    // Perbarui posisi kabel saat ukuran board berubah.
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        if (!board.isConnected) {
          observer.disconnect();

          if (pingTimer !== null) {
            cancelAnimationFrame(pingTimer);
          }

          return;
        }

        if (!pinging) {
          draw();
        }
      });

      observer.observe(board);
    }

    window.addEventListener(
      "resize",
      () => {
        if (board.isConnected && !pinging) {
          draw();
        }
      }
    );
  }

  // =====================================================
  // INTEGRASI DENGAN MODUL PENGENALAN JARINGAN
  // =====================================================

  if (typeof render === "function") {
    const originalRender = render;

    render = function () {
      originalRender();
      renderBuilder();
    };

    renderBuilder();
  }
})();
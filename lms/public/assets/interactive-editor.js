(() => {
    const kind = document.querySelector('#kind');
    if (!kind) return;
    const catalog = window.tjktGameCatalog || {};
    const template = document.getElementById('game_template');
    const formats = {memory:'2–12 baris: konsep | pasangan. Contoh: SSH | TCP 22.',categorize:'2–12 baris: item | kategori. Gunakan minimal dua kategori; kategori boleh berulang.',word_search:'2–12 baris: KATA | petunjuk. Kata memakai 2–12 huruf A–Z tanpa spasi. Mudah: horizontal maju. Sedang: horizontal maju/mundur. Sulit: vertikal maju/mundur.',maze:'2–12 baris: pertanyaan | jawaban benar | pengecoh 1 | pengecoh 2. Ketiga pilihan harus berbeda.',sudoku:'Tepat empat baris, satu simbol per baris (maksimal 24 karakter). Papan 4×4 dan petunjuk dibuat otomatis.',matching:'2–12 baris: kiri | kanan. Label dan pasangan harus unik.',drag_drop:'2–12 baris: kiri | kanan. Label dan pasangan harus unik.',sorting:'2–12 baris, satu langkah per baris dalam urutan yang benar.'};
    const source = document.getElementById('game_items');
    const rows = document.createElement('div'); rows.className = 'mb-3'; source.before(rows);
    const tools = document.createElement('div'); tools.className = 'd-flex gap-2 mb-3'; rows.after(tools);
    const add = document.createElement('button'); add.type = 'button'; add.className = 'btn btn-sm btn-outline-primary'; add.textContent = 'Tambah item';
    const advanced = document.createElement('button'); advanced.type = 'button'; advanced.className = 'btn btn-sm btn-outline-secondary'; advanced.textContent = 'Tampilkan / sembunyikan teks'; tools.append(add, advanced); source.hidden = true;
    advanced.addEventListener('click', () => source.hidden = !source.hidden);
    let rowData = [];
    function headings() { return selected() === 'sudoku' ? ['Simbol'] : selected() === 'sorting' ? ['Langkah dalam urutan benar'] : selected() === 'maze' ? ['Pertanyaan','Jawaban benar','Pengecoh 1','Pengecoh 2'] : selected() === 'categorize' ? ['Item','Kategori'] : selected() === 'word_search' ? ['Kata','Petunjuk'] : ['Konsep','Pasangan']; }
    function sync() { source.value = rowData.map(parts => parts.join(' | ')).join('\n'); }
    function drawRows() {
        rows.replaceChildren();
        rowData.forEach((parts, index) => {
            const row = document.createElement('div'); row.className = 'border rounded p-3 mb-2';
            const title = document.createElement('strong'); title.textContent = `Item ${index + 1}`; row.append(title);
            headings().forEach((heading, col) => { const label = document.createElement('label'); label.className = 'd-block small mt-2'; label.textContent = heading; const input = document.createElement('input'); input.className = 'form-control'; input.value = parts[col] || ''; input.maxLength = selected() === 'sudoku' ? 24 : 160; input.addEventListener('input', () => { rowData[index][col] = input.value; sync(); }); label.append(input); row.append(label); });
            const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'btn btn-sm btn-outline-danger mt-2'; remove.textContent = 'Hapus item'; remove.addEventListener('click', () => { rowData.splice(index,1); sync(); drawRows(); }); row.append(remove); rows.append(row);
        });
    }
    function readRows() { rowData = source.value.trim().split(/\r?\n/).filter(Boolean).map(line => line.split('|').map(v => v.trim())); drawRows(); }
    add.addEventListener('click', () => { if (rowData.length < 12) { rowData.push(headings().map(() => '')); sync(); drawRows(); } });
    source.addEventListener('input', readRows);
    function selected() { return kind.value === 'game' ? template.value : kind.value; }
    function render() {
        const quiz = ['quiz','checkpoint'].includes(kind.value);
        const games = ['game','matching','drag_drop','sorting'].includes(kind.value);
        document.querySelector('[data-interactive-editor]').hidden = quiz || kind.value === 'practice';
        document.querySelector('[data-practice-editor]').hidden = kind.value !== 'practice';
        document.getElementById('duration_minutes').closest('.col-md-4').hidden = kind.value === 'practice';
        document.querySelector('[data-quiz-editor]').hidden = !quiz;
        ['question_count','random_questions','shuffle_options','min_active_seconds'].forEach(id => document.getElementById(id).closest('.col-md-4').hidden = !quiz);
        document.getElementById('game_items').closest('.col-12').hidden = !games;
        document.getElementById('scenario').closest('.col-md-8').hidden = !['terminal','network'].includes(kind.value);
        document.querySelector('[data-game-library]').hidden = !games;
        document.getElementById('template-help').textContent = catalog[selected()] ? `Terpilih: ${catalog[selected()][0]}. ${catalog[selected()][1]}` : '';
        document.getElementById('game-format').textContent = formats[selected()] || '';
        document.getElementById('game_difficulty').disabled = kind.value !== 'game';
        readRows();
        document.querySelectorAll('[data-template]').forEach(b => { const active = selected() === b.dataset.template; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    }
    document.querySelectorAll('[data-template]').forEach(b => b.addEventListener('click', () => { const key = b.dataset.template; kind.value = ['matching','drag_drop','sorting'].includes(key) ? key : 'game'; if (kind.value === 'game') template.value = key; render(); }));
    document.getElementById('template-example').addEventListener('click', () => { document.getElementById('game_items').value = catalog[selected()][2]; readRows(); });
    source.closest('form').addEventListener('submit', () => {
        if (!['game','matching','drag_drop','sorting'].includes(kind.value)) return;
        source.removeAttribute('name');
        source.closest('form').querySelectorAll('[data-game-transport]').forEach(n => n.remove());
        source.value.trim().split(/\r?\n/).forEach((line, i) => line.split('|').forEach((part, j) => {
            const input = document.createElement('input'); input.type = 'hidden'; input.name = `game_rows[${i}][${j}]`; input.value = part.trim(); input.dataset.gameTransport = '1'; source.closest('form').append(input);
        }));
    });
    kind.addEventListener('change', render); render();
})();

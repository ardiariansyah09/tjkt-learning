(() => {
    const node = (tag, text, cls = '') => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; n.className = cls; return n; };
    window.TJKTTemplateGame = class {
        constructor(config, reporter) { this.config = config; this.reporter = reporter; this.state = reporter.runtime.state; this.host = document.getElementById('interactive-engine'); this.busy = false; }
        button(text, input, cls = 'btn btn-outline-primary') { const b = node('button', text, cls); b.type = 'button'; b.addEventListener('click', () => this.play(input)); return b; }
        async play(input) {
            if (this.busy) return;
            if (this.config.game_template === 'maze' && input.direction) {
                const c = this.config, s = this.state, pending = c.missions[s.position];
                if (pending && !s.solved.includes(pending)) { document.getElementById('interactive-status').textContent = 'Jawab pertanyaan pos terlebih dahulu.'; return; }
                const next = s.position + {up:-9,down:9,left:-1,right:1}[input.direction];
                if (next < 0 || next >= 63 || Math.abs(next%9-s.position%9)>1 || c.map[Math.floor(next/9)][next%9] === '#') { document.getElementById('interactive-status').textContent = 'Ada dinding. Pilih arah lain.'; return; }
            }
            this.busy = true;
            try { const r = await this.reporter.send('play', { input }); this.state = r.state; this.render(); }
            catch (e) { document.getElementById('interactive-status').textContent = e.message; }
            finally { this.busy = false; }
        }
        async flush() { await this.reporter.tail; if (this.reporter.failed) throw new Error('Perubahan belum tersimpan. Coba lagi.'); }
        feedback(r) { const box = document.getElementById('interactive-feedback'); box.replaceChildren(node('strong', `Skor: ${r.score} / 100`)); const ul = node('ul'); Object.entries(r.checks).forEach(([label, ok]) => ul.append(node('li', `${ok ? '✓' : '○'} ${label}`))); box.append(ul); }
        async check() { await this.flush(); this.feedback((await this.reporter.send('checkpoint')).checkpoint); }
        async submit() { await this.flush(); const r = await this.reporter.send(this.config.preview ? 'checkpoint' : 'submit'); if (this.config.preview) this.feedback(r.checkpoint); }
        async reset() { const r = await this.reporter.send('reset'); this.state = r.state; this.render(); document.getElementById('interactive-feedback').replaceChildren(); }
        render() {
            const c = this.config, s = this.state;
            this.host.replaceChildren();
            if (c.game_template === 'memory') {
                this.host.append(node('p', 'Buka dua kartu yang saling berpasangan. Jika belum cocok, buka kartu berikutnya untuk mencoba lagi.'));
                this.host.append(node('p', `Pasangan ditemukan: ${s.matched.length} / ${c.cards.length / 2} · Percobaan tidak cocok: ${s.mistakes}`));
                const grid = node('div', undefined, 'row g-2');
                c.cards.forEach((key, i) => { const col = node('div', undefined, 'col-6 col-md-3'); const b = this.button(s.revealed[key] || `Kartu ${i + 1}`, {key}, 'btn btn-outline-primary w-100 h-100 py-4 text-break'); b.disabled = s.locked.includes(key) || (s.open.length < 2 && s.open.includes(key)); col.append(b); grid.append(col); }); this.host.append(grid);
            } else if (c.game_template === 'categorize') {
                this.host.append(node('p', 'Pilih kategori untuk setiap item. Satu kategori boleh memuat beberapa item.'));
                c.items.forEach(item => { const wrap = node('div', undefined, 'mb-3'); const label = node('label', item.label, 'form-label fw-bold'); label.htmlFor = `category-${item.key}`; const select = node('select', undefined, 'form-select'); select.id = label.htmlFor; select.append(new Option('Pilih kategori…', '')); c.categories.forEach(v => select.append(new Option(v, v))); select.value = s.answer[item.key] || ''; select.addEventListener('change', () => { if (select.value) this.play({ key: item.key, target: select.value }); }); wrap.append(label, select); this.host.append(wrap); });
            } else if (c.game_template === 'word_search') {
                this.host.append(node('p', 'Klik huruf awal lalu huruf akhir kata pada satu baris atau kolom. Kata dapat dibaca maju atau mundur.'));
                const list = node('ul'); c.items.forEach(i => list.append(node('li', `${s.found.includes(i.key) ? '✓ ' : ''}${i.label} — ${i.clue}`))); this.host.append(list);
                const grid = node('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:2px;max-width:540px';
                let start = null;
                c.grid.forEach((letter, index) => { const b = node('button', letter, 'btn btn-outline-primary p-0'); b.type = 'button'; b.style.cssText = 'aspect-ratio:1;min-width:0;font-size:clamp(10px,3vw,20px)'; b.setAttribute('aria-label', `${letter}, baris ${Math.floor(index / 12) + 1}, kolom ${index % 12 + 1}`); b.addEventListener('click', () => { if (start === null) { start = index; b.classList.add('active'); } else { this.play({ start, end: index }); start = null; } }); grid.append(b); }); this.host.append(grid);
            } else if (c.game_template === 'sudoku') {
                this.host.append(node('p', 'Isi setiap baris, kolom, dan blok 2×2 dengan empat simbol berbeda. Sel petunjuk tidak dapat diubah.'));
                const legend = node('ol'); c.items.forEach(i => legend.append(node('li', i.label))); this.host.append(legend);
                const grid = node('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));max-width:600px;border:2px solid #12305a';
                c.givens.forEach((v, index) => { const cell = node('div', undefined, 'p-1'); cell.style.cssText = `border-right:${index % 4 === 1 ? 3 : 1}px solid #12305a;border-bottom:${Math.floor(index / 4) === 1 ? 3 : 1}px solid #12305a`; if (v) { const fixed = node('div', `${v}. ${c.items[v - 1].label}`, 'bg-light p-2 text-break h-100'); cell.append(fixed); } else { const select = node('select', undefined, 'form-select px-1'); select.setAttribute('aria-label', `Sel ${index + 1}`); select.append(new Option('—', '0')); c.items.forEach((item, i) => select.append(new Option(`${i + 1}. ${item.label}`, String(i + 1)))); select.value = String(s.answer[index] || 0); select.addEventListener('change', () => this.play({cell:index, value:Number(select.value)})); cell.append(select); } grid.append(cell); }); this.host.append(grid);
            } else if (c.game_template === 'maze') {
                this.host.append(node('p', 'Jelajahi jalur dengan tombol arah. Jawab pertanyaan di pos ◆ sebelum melanjutkan. Selesaikan semua pos dan capai pintu keluar ⚑.'));
                const grid = node('div'); grid.tabIndex = 0; grid.setAttribute('aria-label', 'Labirin misi. Gunakan tombol panah untuk bergerak.'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:2px;max-width:540px;background:#dbe3f0;padding:3px';
                c.map.forEach((row, y) => [...row].forEach((v, x) => { const p = y * 9 + x; const text = p === s.position ? '●' : p === c.exit ? '⚑' : c.missions[p] ? (s.solved.includes(c.missions[p]) ? '✓' : '◆') : ''; const cell = node('div', text); cell.style.cssText = `aspect-ratio:1;display:grid;place-items:center;font-size:clamp(14px,4vw,28px);background:${v === '#' ? '#12305a' : '#fff'};color:${p === s.position ? '#c05700' : '#087f8c'}`; grid.append(cell); }));
                grid.addEventListener('keydown', e => { const dir = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key]; if (dir) { e.preventDefault(); this.play({direction:dir}).then(() => this.host.querySelector('[tabindex]')?.focus()); } }); this.host.append(grid);
                const controls = node('div', undefined, 'd-flex flex-wrap gap-2 my-3'); [['↑','up'],['←','left'],['↓','down'],['→','right']].forEach(([text,direction]) => { const b = this.button(text, {direction}); b.setAttribute('aria-label', direction); controls.append(b); }); this.host.append(controls);
                const pending = c.missions[s.position]; const item = c.items.find(i => i.key === pending);
                if (item && !s.solved.includes(pending)) { this.host.append(node('h3',item.label,'h5')); const choices = node('div', undefined, 'd-flex flex-wrap gap-2'); item.choices.forEach(choice => choices.append(this.button(choice.label,{choice:choice.key}))); this.host.append(choices); }
                this.host.append(node('p', `Pos selesai: ${s.solved.length}/${c.items.length} · Jawaban salah: ${s.mistakes}${s.escaped ? ' · Pintu keluar tercapai! Kirim hasil untuk dinilai.' : ''}`));
            }
        }
    };
})();

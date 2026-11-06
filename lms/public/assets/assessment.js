(() => {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
    async function post(url, body = {}) {
        const response = await fetch(url, {method: 'POST', credentials: 'same-origin', headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf}, body: JSON.stringify(body)});
        if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Sesi login berakhir atau server tidak merespons. Muat ulang halaman untuk melanjutkan.');
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {const messages = {401: 'Sesi login berakhir. Silakan masuk kembali.', 419: 'Sesi kedaluwarsa. Muat ulang halaman.', 403: 'Akses aktivitas tidak diizinkan. Periksa penugasan atau hubungi guru.', 429: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba kembali.'};const error = new Error(Object.values(data.errors || {}).flat().join(' ') || messages[response.status] || (response.status >= 500 ? 'Terjadi gangguan server. Coba kembali beberapa saat lagi.' : data.message) || 'Permintaan gagal. Muat ulang atau periksa koneksi.');error.status = response.status;throw error;}
        return data;
    }
    const editor = document.querySelector('[data-question-editor]');
    if (editor) {
        let next = 1000;
        const type = editor.querySelector('#question_type');
        function sync() {
            const value = type.value;
            const options = !['short', 'boolean'].includes(value);
            editor.querySelector('[data-options-panel]').hidden = !options;
            editor.querySelectorAll('[data-options-panel] input, [data-options-panel] select').forEach(field => field.disabled = !options);
            editor.querySelector('[data-short-field]').hidden = value !== 'short';
            editor.querySelectorAll('[data-short-field] input, [data-short-field] textarea').forEach(field => field.disabled = value !== 'short');
            editor.querySelector('[data-boolean-field]').hidden = value !== 'boolean';
            editor.querySelector('[name="boolean_answer"]').disabled = value !== 'boolean';
            editor.querySelector('[data-scenario-field]').hidden = value !== 'scenario';
            editor.querySelectorAll('[data-match-field]').forEach(field => field.hidden = value !== 'matching');
            editor.querySelectorAll('[data-correct-field]').forEach(field => field.hidden = !['single', 'multiple', 'scenario'].includes(value));
            editor.querySelectorAll('[data-order-button]').forEach(field => field.hidden = value !== 'ordering');
            editor.querySelector('[data-option-help]').textContent = value === 'matching' ? 'Setiap baris adalah pasangan yang benar. Siswa akan menerima sisi kanan dalam urutan acak.' : value === 'ordering' ? 'Susun baris dalam urutan jawaban yang benar. Tampilan awal siswa akan diacak.' : 'Isi pilihan dan tandai jawaban benar. Pilihan ganda kompleks dapat mempunyai beberapa jawaban benar.';
        }
        type.addEventListener('change', sync);
        editor.querySelector('#add-question-option').addEventListener('click', () => {
            const fragment = document.getElementById('question-option-template').content.cloneNode(true);
            const index = next++;
            fragment.querySelectorAll('[name]').forEach(field => field.name = field.name.replace('[INDEX]', '[' + index + ']'));
            editor.querySelector('#question-options').append(fragment);
            sync();
        });
        editor.addEventListener('click', event => {
            const remove = event.target.closest('.remove-question-option');
            if (remove) remove.closest('.question-option-row').remove();
            const move = event.target.closest('.move-option-up');
            if (move) {const row = move.closest('.question-option-row'); if (row.previousElementSibling) row.parentElement.insertBefore(row, row.previousElementSibling);}
        });
        sync();
    }
    const reader = document.querySelector('[data-reading-tracker]');
    if (reader) {
        const output = reader.querySelector('[data-reading-status]');
        let session = null, busy = false, lastInteraction = Date.now();
        ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(name => document.addEventListener(name, () => lastInteraction = Date.now(), {passive: true}));
        post(reader.dataset.startUrl).then(data => {session = data.session_id; output.textContent = 'Durasi aktif terhitung: ' + data.active_seconds + ' detik.';}).catch(error => output.textContent = error.message);
        setInterval(async () => {
            if (!session || busy || document.hidden || Date.now() - lastInteraction > 60000) return;
            busy = true;
            try {const data = await post(reader.dataset.heartbeatUrl.replace('SESSION_ID', encodeURIComponent(session))); output.textContent = 'Durasi aktif terhitung: ' + data.active_seconds + ' detik.';}
            catch (error) {output.textContent = error.message;if (error.status === 409) session = null;}
            finally {busy = false;}
        }, 15000);
    }
    const form = document.querySelector('[data-quiz-form]');
    if (form) {
        let busy = false, submitting = false, debounce = null;
        const status = document.getElementById('quiz-save-status');
        function answers() {
            const result = {};
            form.querySelectorAll('[data-question-key]').forEach(fieldset => {
                const key = fieldset.dataset.questionKey, type = fieldset.dataset.questionType;
                if (type === 'multiple') result[key] = Array.from(fieldset.querySelectorAll('input:checked')).map(field => field.value);
                else if (type === 'ordering') result[key] = Array.from(fieldset.querySelectorAll('select')).map(field => field.value);
                else if (type === 'matching') {result[key] = {};fieldset.querySelectorAll('select').forEach(field => {const matches = field.name.match(/\[([^\]]+)\]$/); result[key][matches[1]] = field.value;});}
                else if (type === 'short') result[key] = fieldset.querySelector('input').value;
                else result[key] = fieldset.querySelector('input:checked')?.value || '';
            });
            return result;
        }
        async function save() {
            if (busy || submitting) return;
            busy = true;
            try {const data = await post(form.dataset.saveUrl, {answers: answers()}); if (data.status !== 'in_progress') {window.location.assign(form.dataset.resultUrl);return;}status.textContent = 'Jawaban tersimpan: ' + new Date(data.saved_at).toLocaleTimeString('id-ID');}
            catch (error) {status.textContent = 'Belum tersimpan: ' + error.message;}
            finally {busy = false;}
        }
        form.addEventListener('input', () => {clearTimeout(debounce);debounce = setTimeout(save, 800);});
        form.addEventListener('change', () => {clearTimeout(debounce);debounce = setTimeout(save, 500);});
        form.addEventListener('submit', () => {submitting = true;clearTimeout(debounce);});
        setInterval(save, 15000);
        const deadline = Date.parse(form.dataset.expires), offset = Date.parse(form.dataset.serverNow) - Date.now();
        setInterval(() => {const seconds = Math.max(0, Math.ceil((deadline - Date.now() - offset) / 1000));document.getElementById('quiz-countdown').textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');if (seconds === 0 && !submitting) form.requestSubmit();}, 1000);
    }
})();

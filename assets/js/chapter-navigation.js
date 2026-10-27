import { mountFinalGame } from './final-games.js';
import { remainingModules } from './final-game-models.js';
import { mountMonitoringGame } from './monitoring-activity.js';
import { mountVPNGame } from './vpn-activity.js';
import { mountHostingGame } from './hosting-activity.js';
import { mountWebDBGame } from './web-db-activity.js';
import { mountFileShareGame } from './file-share-activity.js';
import { mountFTPGame } from './ftp-activity.js';
import { mountServicesGame } from './services-activity.js';
import { mountAccessGame } from './access-activity.js';
import { mountOSAdminGame } from './os-admin-activity.js';
import { mountVirtualizationGame } from './virtualization-activity.js';
import { mountServerBasicsGame } from './server-basics-activity.js';
import { mountDualWANGame } from './dual-wan-activity.js';
import { mountQoSGame } from './qos-activity.js';
import { mountProxyGame } from './proxy-activity.js';
import { mountNATGame } from './nat-activity.js';
import { mountDynamicRoutingGame } from './dynamic-routing-activity.js';
import { mountStaticRoutingGame } from './static-routing-activity.js';
import { mountReplacementGame } from './replacement-activity.js';
import { mountInstallationGame } from './installation-activity.js';
import { mountFiberGame } from './fiber-activity.js';
import { mountVoIPGame } from './voip-activity.js';
import { mountMaintenanceGame } from './maintenance-activity.js';
import { mountActionGame } from './action-game.js?v=3';
import { topicGameDefinitions } from './topic-games-model.js';
import { mountRequirementsGame } from './requirements-activity.js';
import { mountLayoutGame } from './layout-activity.js';
import { mountAddressGame } from './address-plan-activity.js';
import { mountCablingGame } from './cabling-activity.js';
import { mountWLANGame } from './wlan-activity.js';

export function mountChapterNavigation({ moduleId, title, classLevel = 'X', chapters, passScore = 75, finalPassScore = 80, storageVersion = 1 }) {
  if(topicGameDefinitions[moduleId])chapters=chapters.map(c=>c.type==='game'?{...c,summary:topicGameDefinitions[moduleId].goal}:c);
  const root = document.getElementById('lessonContent');
  const objectives = root?.querySelector('#tujuan');
  const nav = document.getElementById('lessonNav');
  const progressLabel = document.getElementById('progressLabel');
  const progressCount = document.getElementById('progressCount');
  const progressFill = document.getElementById('progressFill');
  const progressBar = document.getElementById('progressBar');
  const heading = document.getElementById('lessonTitle');
  const summary = document.getElementById('lessonSummary');
  const breadcrumb = document.getElementById('breadcrumb');
  const kicker = document.getElementById('lessonKicker');
  const gateMessage = document.getElementById('gateMessage');
  const saveNote = document.getElementById('saveNote');
  const previousButton = document.getElementById('previousChapter');
  const nextButton = document.getElementById('nextChapter');
  const storageKey = `tjkt:${moduleId}:course:v${storageVersion}`;

  if (![root, nav, progressLabel, progressCount, progressFill, progressBar, heading, summary, breadcrumb, kicker, gateMessage, saveNote, previousButton, nextButton].every(Boolean)) {
    throw new Error(`Kerangka navigasi modul ${moduleId} tidak lengkap.`);
  }

  let state = readState();
  let current = findCurrent();
  const actionGames = [];

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return {
        passed: parsed && parsed.passed && typeof parsed.passed === 'object' ? parsed.passed : {},
        scores: parsed && parsed.scores && typeof parsed.scores === 'object' ? parsed.scores : {},
        current: typeof parsed?.current === 'string' ? parsed.current : chapters[0].id
      };
    } catch (error) {
      console.warn(`Progres modul ${moduleId} tidak dapat dibaca:`, error);
      return { passed: {}, scores: {}, current: chapters[0].id };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: storageVersion, ...state }));
      saveNote.textContent = 'Progres tersimpan pada browser ini.';
    } catch (error) {
      console.error(`Progres modul ${moduleId} tidak dapat disimpan:`, error);
      saveNote.textContent = 'Progres gagal disimpan. Periksa ruang penyimpanan browser.';
    }
  }

  function passed(index) {
    const chapter = chapters[index];
    const required = index === chapters.length - 1 ? finalPassScore : passScore;
    return Boolean(chapter && Number(state.passed[chapter.id]) >= required);
  }

  function unlocked(index) {
    return window.TJKTLocalInstructor?.isActive() || index === 0 || passed(index - 1);
  }

  function findCurrent() {
    const nextIncomplete = chapters.findIndex((_, index) => !passed(index));
    const savedIndex = chapters.findIndex((chapter) => chapter.id === state.current);
    if (savedIndex >= 0 && unlocked(savedIndex)) return savedIndex;
    return nextIncomplete < 0 ? chapters.length - 1 : nextIncomplete;
  }

  function create(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function setupAssessment(chapter, index) {
    const section = root.querySelector(`#${CSS.escape(chapter.id)}`);
    if (!section) throw new Error(`Konten tahap "${chapter.title}" tidak ditemukan.`);
    const unit = document.createElement('div');
    unit.className = 'chapter-unit';
    unit.dataset.chapter = chapter.id;
    section.before(unit);
    unit.append(section);
    if (chapter.type === 'game') {
      // Preserve legacy IDs for topic engines, while replacing the learner-facing game.
      section.hidden = true;
      const host = create('div', undefined, 'chapter-action-host');
      unit.append(host);
      const mountGame=remainingModules[moduleId]?mountFinalGame:moduleId==='monitoring-jaringan'?mountMonitoringGame:moduleId==='vpn-server'?mountVPNGame:moduleId==='panel-layanan-hosting'?mountHostingGame:moduleId==='hosting-server'?mountWebDBGame:moduleId==='file-server'?mountFileShareGame:moduleId==='ftp-server'?mountFTPGame:moduleId==='layanan-server'?mountServicesGame:moduleId==='manajemen-pengguna-server'?mountAccessGame:moduleId==='administrasi-linux-windows'?mountOSAdminGame:moduleId==='virtualisasi-server'?mountVirtualizationGame:moduleId==='dasar-administrasi-server'?mountServerBasicsGame:moduleId==='load-balancing'?mountDualWANGame:moduleId==='bandwidth-qos'?mountQoSGame:moduleId==='proxy-load-balancing'?mountProxyGame:moduleId==='nat-wan'?mountNATGame:moduleId==='routing-dinamis'?mountDynamicRoutingGame:moduleId==='routing-ipv4'?mountStaticRoutingGame:moduleId==='penggantian-perangkat-jaringan'?mountReplacementGame:moduleId==='pemasangan-perangkat-jaringan'?mountInstallationGame:moduleId==='fiber-optik'?mountFiberGame:moduleId==='voip'?mountVoIPGame:moduleId==='pemeliharaan-kabel-nirkabel'?mountMaintenanceGame:moduleId==='kebutuhan-teknis-jaringan'?mountRequirementsGame:moduleId==='desain-topologi-arsitektur'?mountLayoutGame:moduleId==='perencanaan-pengalamatan-lanjut'?mountAddressGame:moduleId==='instalasi-kabel'?mountCablingGame:moduleId==='wireless-lan'?mountWLANGame:mountActionGame;
      actionGames.push(mountGame(host, { moduleId, mode:'2d', onComplete(score) {
        state.scores[chapter.id] = Math.max(Number(state.scores[chapter.id]) || 0, score);
        if (score >= passScore) state.passed[chapter.id] = score;
        saveState();render();
      }}));
      return;
    }
    const assessment = create('section', undefined, 'chapter-check');
    assessment.append(create('h2', 'Cek Pemahaman'), create('p', 'Jawab soal di bawah untuk membuka tahap berikutnya.'));
    const form = create('form', undefined, 'chapter-check-form');
    const feedback = create('p', 'Pilih jawaban untuk mulai menjawab.', 'chapter-check-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    chapter.questions.forEach((item, questionIndex) => {
      const field = document.createElement('fieldset');
      field.append(create('legend', `${questionIndex + 1}. ${item.question}`));
      const options = item.options.map((text, optionIndex) => ({ text, optionIndex }));
      for (let index = options.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [options[index], options[randomIndex]] = [options[randomIndex], options[index]];
      }
      options.forEach(({ text, optionIndex }) => {
        const label = create('label', undefined, 'chapter-check-option');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `${moduleId}-${chapter.id}-${questionIndex}`;
        input.value = String(optionIndex);
        input.required = true;
        label.append(input, document.createTextNode(` ${text}`));
        field.append(label);
      });
      form.append(field);
    });

    const submit = create('button', 'Periksa Jawaban', 'primary-action');
    submit.type = 'submit';
    form.append(submit, feedback);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selected = chapter.questions.map((_, questionIndex) =>
        form.querySelector(`input[name="${moduleId}-${chapter.id}-${questionIndex}"]:checked`)
      );
      if (selected.some((answer) => !answer)) {
        feedback.textContent = 'Jawab seluruh soal terlebih dahulu.';
        return;
      }
      const correct = selected.filter((answer, questionIndex) =>
        Number(answer.value) === chapter.questions[questionIndex].answer
      ).length;
      const score = Math.round((correct / chapter.questions.length) * 100);
      assessment.querySelector('.assessment-review')?.remove();
      const review = create('div', undefined, 'assessment-review');
      chapter.questions.forEach((item, questionIndex) => {
        const matches = Number(selected[questionIndex].value) === item.answer;
        review.append(create('p', `${matches ? '✓' : 'Tinjau kembali'} ${questionIndex + 1}. ${item.explanation || `Jawaban yang sesuai: ${item.options[item.answer]}. Baca kembali konsep dan contoh pada tahap ini.`}`));
      });
      assessment.append(review);
      const required = index === chapters.length - 1 ? finalPassScore : passScore;
      state.scores[chapter.id] = Math.max(Number(state.scores[chapter.id]) || 0, score);
      if (score >= required) {
        state.passed[chapter.id] = score;
        feedback.textContent = `✓ Lulus dengan nilai ${score}/100. Tahap berikutnya terbuka.`;
        form.querySelectorAll('input').forEach((input) => { input.disabled = true; });
        submit.disabled = true;
        saveState();
        render();
      } else {
        feedback.textContent = `Nilai ${score}/100 belum mencapai nilai minimum ${required}. Pilihan tetap aktif; ubah jawaban yang salah lalu periksa kembali.`;
      }
    });

    if (passed(index)) {
      form.querySelectorAll('input').forEach((input) => { input.disabled = true; });
      submit.disabled = true;
      feedback.textContent = `✓ Tahap lulus. Nilai terbaik: ${state.passed[chapter.id]}/100.`;
    }
    assessment.append(form);
    unit.append(assessment);
  }

  chapters.forEach(setupAssessment);

  function renderNavigation() {
    nav.replaceChildren();
    chapters.forEach((chapter, index) => {
      const button = create('button', undefined, `lesson-nav-item${index === current ? ' active' : ''}${!unlocked(index) ? ' locked' : ''}`);
      button.type = 'button';
      button.disabled = !unlocked(index);
      if (index === current) button.setAttribute('aria-current', 'step');
      const number = create('span', passed(index) ? '✓' : unlocked(index) ? String(index + 1).padStart(2, '0') : '🔒', 'lesson-number');
      button.append(number, create('span', chapter.title));
      button.addEventListener('click', () => goTo(index));
      nav.append(button);
    });

    const completed = chapters.filter((_, index) => passed(index)).length;
    const percent = Math.round((completed / chapters.length) * 100);
    progressLabel.textContent = `${percent}%`;
    progressCount.textContent = `${completed} dari ${chapters.length} tahap lulus`;
    progressFill.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', String(percent));
  }

  function render() {
    const chapter = chapters[current];
    if (objectives) objectives.hidden = current !== 0;
    root.querySelectorAll('.chapter-unit[data-chapter]').forEach((unit) => {
      unit.hidden = unit.dataset.chapter !== chapter.id;
    });
    breadcrumb.textContent = chapter.title;
    kicker.textContent = `MATERI ${String(current + 1).padStart(2, '0')}`;
    heading.textContent = chapter.title;
    summary.textContent = chapter.summary;
    previousButton.disabled = current === 0;
    nextButton.disabled = (!window.TJKTLocalInstructor?.isActive() && !passed(current)) || current === chapters.length - 1;
    nextButton.textContent = current === chapters.length - 1 ? '✓ Modul Selesai' : 'Tahap Berikutnya →';
    gateMessage.textContent = passed(current)
      ? `✓ Tahap ini lulus. Nilai terbaik: ${state.passed[chapter.id]}/100.`
      : chapter.type === 'game' ? 'Selesaikan tiga level permainan untuk membuka tahap berikutnya.'
      : `Selesaikan cek pemahaman dengan nilai minimal ${current === chapters.length - 1 ? finalPassScore : passScore} untuk membuka tahap berikutnya.`;
    renderNavigation();
  }

  function goTo(index) {
    if (!unlocked(index)) return;
    current = index;
    state.current = chapters[index].id;
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previousButton.addEventListener('click', () => {
    if (current > 0) goTo(current - 1);
  });
  nextButton.addEventListener('click', () => {
    if ((window.TJKTLocalInstructor?.isActive() || passed(current)) && current < chapters.length - 1) goTo(current + 1);
  });
  document.getElementById('resetProgress').addEventListener('click', () => {
    if (!window.confirm(`Hapus progres modul ${title} pada browser ini?`)) return;
    try {
      localStorage.removeItem(storageKey);
      state = { passed: {}, scores: {}, current: chapters[0].id };
      current = 0;
      root.querySelectorAll('.chapter-check-form').forEach(form => {
        form.reset();
        form.querySelectorAll('input, button').forEach(control => { control.disabled = false; });
        form.querySelector('.chapter-check-feedback').textContent = 'Pilih jawaban untuk mulai menjawab.';
      });
      root.querySelectorAll('.assessment-review').forEach(review => review.remove());
      actionGames.forEach(game => game.reset());
      render();
      saveNote.textContent = `Progres modul ${title} telah direset.`;
    } catch (error) {
      console.error(`Progres modul ${moduleId} gagal direset:`, error);
      saveNote.textContent = 'Progres gagal direset. Periksa pengaturan penyimpanan browser.';
    }
  });

  render();
}

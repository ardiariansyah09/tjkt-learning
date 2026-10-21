import { mountLearningStudio } from './learning-studio.js?v=4';
// Shared shell behavior. Topic engines retain their own content and progress keys.
const body = document.body;
const nav = document.querySelector('.lesson-nav');
const hero = document.querySelector('.lesson-hero');
const progressBar = document.getElementById('progressBar');
const fill = document.querySelector('[data-progress-fill]');
const count = document.querySelector('[data-progress-count]');
const percent = document.querySelector('[data-progress-percent]');
const legacy = ['pengenalan-jaringan', 'topologi-jaringan'].includes(body.dataset.moduleId);
const content = document.querySelector('.lesson-content');

function synchronize() {
  content.querySelectorAll('h2, h3').forEach(heading => {
    if (heading.children.length) return;
    const label = heading.textContent.replace(/^[^\p{L}\p{N}]+/u, '');
    if (heading.textContent !== label) heading.textContent = label;
  });
  const gate = document.querySelector('.lesson-main > [role="status"].feedback');
  if (gate && !gate.classList.contains('gate-message')) gate.classList.add('gate-message');
  const buttons = [...nav.querySelectorAll(':scope > button')];
  if (legacy) {
    buttons.forEach((button, index) => {
      button.type = 'button';
      button.classList.add('lesson-nav-item');
      button.classList.toggle('locked', button.disabled);
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      if (!button.querySelector('.lesson-number')) {
        const text = button.textContent;
        const passed = text.trim().startsWith('✓');
        const title = text.replace(/^[✓○🔒\s\d.]+/u, '').trim();
        const number = document.createElement('span');
        number.className = 'lesson-number';
        number.textContent = passed ? '✓' : button.disabled ? '🔒' : String(index + 1).padStart(2, '0');
        const label = document.createElement('span');
        label.textContent = title;
        button.replaceChildren(number, label);
      }
    });
    const active = buttons.findIndex(button => button.classList.contains('active'));
    const previous = document.getElementById('previousLesson');
    previous.disabled = active <= 0;
    const breadcrumb = document.querySelector('[data-breadcrumb]');
    const title = hero.querySelector('h1').textContent;
    if (breadcrumb.textContent !== title) breadcrumb.textContent = title;
    const value = Math.round(Number.parseFloat(fill.style.width) || 0);
    const completed = buttons.filter(button => button.querySelector('.lesson-number')?.textContent === '✓').length;
    const countText = `${completed} dari ${buttons.length} tahap lulus`;
    if (count.textContent !== countText) count.textContent = countText;
    progressBar.setAttribute('aria-valuenow', String(value));
    const text = `${value}%`;
    if (percent.textContent !== text) percent.textContent = text;
    const next = document.getElementById('next');
    const label = active === buttons.length - 1 ? '✓ Modul Selesai' : 'Tahap Berikutnya →';
    if (next.textContent !== label) next.textContent = label;
  }
}

if (legacy) {
  document.getElementById('previousLesson').addEventListener('click', () => {
    const buttons = [...nav.querySelectorAll(':scope > button')];
    const current = buttons.findIndex(button => button.classList.contains('active'));
    if (current > 0) buttons[current - 1].click();
  });
}

// Observe only engine output, never the classes/ARIA attributes updated above.
let pending = false;
const observer = new MutationObserver(() => {
  if (pending) return;
  pending = true;
  queueMicrotask(() => { pending = false; synchronize(); });
});
observer.observe(nav, { childList:true });
observer.observe(hero, { childList:true, subtree:true, characterData:true });
observer.observe(fill, { attributes:true, attributeFilter:['style'] });
observer.observe(count, { childList:true, characterData:true, subtree:true });
observer.observe(content, { childList:true, subtree:true });
if (legacy) observer.observe(document.getElementById(body.dataset.moduleId === 'pengenalan-jaringan' ? 'status' : 'feedback'), { attributes:true, attributeFilter:['class'] });
synchronize();
mountLearningStudio(body.dataset.moduleId);

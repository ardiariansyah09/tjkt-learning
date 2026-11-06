/* Scroll to the beginning of the selected lesson after existing navigation handlers run.
   Does not change scoring, unlock rules, or lesson rendering. */
(() => {
  'use strict';
  const nav = document.getElementById('nav');
  const next = document.getElementById('next');
  const title = document.getElementById('title');
  if (!nav || !next || !title) return;

  function goToLessonTop() {
    const heading = title.closest('.panel') || title;
    const y = Math.max(0, heading.getBoundingClientRect().top + window.scrollY - 12);
    window.scrollTo({ top: y, behavior: 'instant' });
  }

  // Delegation survives drawNav() replacing all sidebar buttons.
  nav.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled || !nav.contains(button)) return;
    requestAnimationFrame(goToLessonTop);
  });

  next.addEventListener('click', () => {
    requestAnimationFrame(goToLessonTop);
  });
})();

export const question = (question, options, answer, explanation) => ({ question, options, answer, explanation });

export function unit(id, title, summary, sections, example, task, misconception, questions) {
  return { id, title, summary, sections, example, task, misconception, questions };
}

export function renderUnit(chapter) {
  // All strings are static curriculum authored in this repository.
  return `<section id="${chapter.id}" class="deep-course-unit">
    <div class="deep-outcome"><h2>Tujuan tahap ini</h2><p>${chapter.summary}</p></div>
    ${chapter.sections.map(([heading, paragraphs]) => `<section><h2>${heading}</h2>${paragraphs.map(text => `<p>${text}</p>`).join('')}</section>`).join('')}
    <section class="deep-worked"><h2>Contoh dan penalaran</h2><p>${chapter.example}</p></section>
    <section class="deep-transfer"><h2>Terapkan pada situasi baru</h2><p>${chapter.task}</p></section>
    <aside class="deep-misconception"><strong>Periksa pemahaman Anda</strong><p>${chapter.misconception}</p></aside>
  </section>`;
}

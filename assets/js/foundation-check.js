import { bindThemeToggle } from './theme.js';
import { mountChapterNavigation } from './chapter-navigation.js?v=5';
import { renderUnit } from './deep-course.js';
import safety from './course-k3.js';
import planning from './course-planning.js';
import ipv6 from './course-ipv6.js';
import business from './course-business.js';
import technology from './course-technology.js';
import career from './course-career.js';
import telecom from './course-telecom.js';
import measurement from './course-measurement.js';

bindThemeToggle(document.querySelector('.theme-button'));
const courses = Object.fromEntries([safety,planning,ipv6,business,technology,career,telecom,measurement].map(course=>[course.moduleId,course]));
const course = courses[document.body.dataset.moduleId];
const root = document.getElementById('lessonContent');
root.innerHTML = `<section id="tujuan"><h2>Tujuan Pembelajaran</h2><ul>${course.objectives.map(text => `<li>${text}</li>`).join('')}</ul><p>Alur belajar: memahami → mengaplikasi → merefleksi. Baca konsep, uji prediksi pada studio, kumpulkan bukti, lalu jelaskan keputusan Anda.</p></section>${course.chapters.map(renderUnit).join('')}<details class="course-sources"><summary>Referensi belajar</summary><ul>${course.sources.map(([title,url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`).join('')}</ul></details>`;
const bank = course.chapters.flatMap(chapter => chapter.questions);
const chapters = course.chapters.map((chapter,index) => ({
  ...chapter,
  type:chapter.id === 'game' ? 'game' : chapter.type,
  questions:index === course.chapters.length - 1 ? bank.slice(0,10) : chapter.questions
}));
mountChapterNavigation({ ...course, chapters, storageVersion:2 });

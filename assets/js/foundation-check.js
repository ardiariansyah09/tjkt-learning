import { remainingCourses } from './remaining-courses.js';
import monitoring from './course-monitoring.js';
import {scopeCourseActivities} from './activity-scope.js';
import vpn from './course-vpn.js';
import hosting from './course-hosting.js';
import webDB from './course-web-db.js';
import fileShare from './course-file-share.js';
import ftp from './course-ftp.js';
import services from './course-services.js?v=3';
import access from './course-access.js';
import osAdmin from './course-os-admin.js';
import virtualization from './course-virtualization.js';
import serverBasics from './course-server-basics.js';
import dualWAN from './course-dual-wan.js';
import qos from './course-qos.js';
import proxy from './course-proxy.js';
import nat from './course-nat.js';
import dynamicRouting from './course-dynamic-routing.js';
import staticRouting from './course-static-routing.js';
import replacement from './course-replacement.js';
import installation from './course-installation.js';
import fiber from './course-fiber.js';
import voip from './course-voip.js';
import { bindThemeToggle } from './theme.js';
import { mountChapterNavigation } from './chapter-navigation.js?v=25';
import { renderUnit } from './deep-course.js';
import safety from './course-k3.js';
import planning from './course-planning.js?v=2';
import ipv6 from './course-ipv6.js';
import business from './course-business.js';
import technology from './course-technology.js';
import career from './course-career.js';
import telecom from './course-telecom.js';
import measurement from './course-measurement.js';
import requirements from './course-requirements.js';
import layout from './course-layout.js';
import addressPlan from './course-address-plan.js';
import cabling from './course-cabling.js';
import wlan from './course-wlan.js';
import maintenance from './course-maintenance.js';

bindThemeToggle(document.querySelector('.theme-button'));
const courses = Object.fromEntries([safety,planning,ipv6,business,technology,career,telecom,measurement,requirements,layout,addressPlan,cabling,wlan,maintenance,voip,fiber,installation,replacement,staticRouting,dynamicRouting,nat,proxy,qos,dualWAN,serverBasics,virtualization,osAdmin,access,services,ftp,fileShare,webDB,hosting,vpn,monitoring,...remainingCourses].map(course=>[course.moduleId,course]));
const course = courses[document.body.dataset.moduleId];
scopeCourseActivities(course);
const root = document.getElementById('lessonContent');
root.innerHTML = `<section id="tujuan"><h2>Tujuan Pembelajaran</h2><ul>${course.objectives.map(text => `<li>${text}</li>`).join('')}</ul><p>Alur belajar: memahami → mengaplikasi → merefleksi. Baca konsep, uji prediksi pada aktivitas terkait, kumpulkan bukti, lalu jelaskan keputusan Anda.</p></section>${course.chapters.map(renderUnit).join('')}<details class="course-sources"><summary>Referensi belajar</summary><ul>${course.sources.map(([title,url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`).join('')}</ul></details>`;
const bank = course.chapters.flatMap(chapter => chapter.questions);
const chapters = course.chapters.map((chapter,index) => ({
  ...chapter,
  type:chapter.id === 'game' ? 'game' : chapter.type,
  questions:index === course.chapters.length - 1 ? bank.slice(0,10) : chapter.questions
}));
mountChapterNavigation({ ...course, chapters, storageVersion:2 });

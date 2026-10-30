import fs from 'node:fs';
import {selectFinalQuestions} from '../lms/public/assets/assessment-coverage.js';
const courses=JSON.parse(fs.readFileSync(new URL('../docs/course-content-audit.json',import.meta.url),'utf8'));
const rows=[];
for(const course of courses){
 const questions=selectFinalQuestions(course.chapters,10);
 const covered=course.chapters.filter(c=>c.questions.some(q=>questions.includes(q))).map(c=>c.id);
 const expected=course.chapters.slice(0,-1).filter(c=>c.id!=='game'&&c.type!=='game'&&c.questions.length).map(c=>c.id);
 if(questions.length!==10||expected.some(id=>!covered.includes(id)))throw Error('Coverage mismatch '+course.id);
 rows.push({id:course.id,questions:questions.length,covered,expected});
}
fs.writeFileSync(new URL('../docs/assessment-coverage-audit.json',import.meta.url),JSON.stringify(rows,null,2));console.log('PASS balanced final assessments:',rows.length,'modules.');

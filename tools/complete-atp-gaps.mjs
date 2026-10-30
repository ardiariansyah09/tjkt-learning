import fs from 'node:fs';
const names=['telecom','layout','wlan','dynamic-routing','qos','monitoring'];
for(const name of names){
 const file=`assets/js/course-${name}.js`;let s=fs.readFileSync(file,'utf8');
 if(s.includes("from './atp-completion-content.js'"))continue;
 s="import {completeATP} from './atp-completion-content.js';\n"+s;
 if(name==='telecom')s=s.replace('export default enrichPhaseE(buildPhaseECourse({','export default completeATP(enrichPhaseE(buildPhaseECourse({').replace(/\}\)\);\s*$/,'})));\n');
 else{if(!s.includes('export default course;'))throw Error('Unexpected export '+name);s=s.replace('export default course;','export default completeATP(course);');}
 fs.writeFileSync(file,s);
}
console.log('Six ATP-specific content/lab additions wired without new assessment stages.');

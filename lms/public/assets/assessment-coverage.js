// Stable selection: cover the assessed stages before taking extra questions.
export function selectFinalQuestions(chapters,limit=10){
 const groups=chapters.slice(0,-1).filter(c=>c.id!=='game'&&c.type!=='game'&&c.questions?.length).map(c=>c.questions);
 const selected=[];for(let offset=0;selected.length<limit;offset++){
  let added=false;for(const group of groups){if(group[offset]&&selected.length<limit){selected.push(group[offset]);added=true;}}
  if(!added)break;
 }
 for(const chapter of chapters)for(const question of chapter.questions||[])if(selected.length<limit&&!selected.includes(question))selected.push(question);
 return selected;
}

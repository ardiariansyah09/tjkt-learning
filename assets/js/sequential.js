// Progress versi 2 dipisah agar status lama 'tandai selesai' tidak otomatis dianggap lulus.
const KEY='tjkt:ipv4-subnetting:sequential:v2';
export const MIN_SCORE=75;
export function readGate(ids) {
  try {
    const x=JSON.parse(localStorage.getItem(KEY)||'{}');
    const passed=x&&typeof x.passed==='object'&&x.passed?x.passed:{};
    return {passed:Object.fromEntries(Object.entries(passed).filter(([id,value])=>ids.includes(id)&&Number.isFinite(value)&&value>=MIN_SCORE))};
  } catch {return {passed:{}};}
}
export function writeGate(gate) {
  try {localStorage.setItem(KEY,JSON.stringify({schemaVersion:2,passed:gate.passed,updatedAt:new Date().toISOString()}));return true;}
  catch{return false;}
}
export function markPassed(gate,id,score){if(score>=MIN_SCORE)gate.passed[id]=Math.max(gate.passed[id]||0,score);}
export function isPassed(gate,id){return Number(gate.passed[id])>=(['games','posttest'].includes(id)?80:MIN_SCORE);}
export function isUnlocked(gate,ids,id){
  const index=ids.indexOf(id);
  return index>=0&&(index===0||ids.slice(0,index).every(previous=>isPassed(gate,previous)));
}

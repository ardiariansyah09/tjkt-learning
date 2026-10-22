export function analyzeVoIP(v){
 if(![20,40].includes(v.ptime)||!Number.isInteger(v.calls)||v.calls<1||!Number.isFinite(v.buffer)||v.buffer<0||!Number.isFinite(v.capacity)||v.capacity<=0)throw Error('Parameter model tidak valid');
 const registered=v.registerA&&v.registerB,common=v.codecA===v.codecB,established=registered&&common;
 const pps=1000/v.ptime,payload=64000/8*v.ptime/1000,perDirection=(payload+40)*8*pps/1000,demand=perDirection*v.calls;
 const variations=[0,10,35,5,55];const packets=Array.from({length:10},(_,i)=>{const sent=i*v.ptime,arrival=sent+40+variations[i%5],deadline=sent+40+v.buffer,lost=Boolean(v.loss&&i===4);return {seq:i+1,sent,arrival:lost?null:arrival,deadline,lost,late:!lost&&arrival>deadline};});
 const events=[{from:'A',to:'PBX',text:'REGISTER A'}, {from:'PBX',to:'A',text:v.registerA?'200 OK (registrasi A)':'Registrasi A gagal (kasus)'} ,{from:'B',to:'PBX',text:'REGISTER B'},{from:'PBX',to:'B',text:v.registerB?'200 OK (registrasi B)':'Registrasi B gagal (kasus)'}];
 if(registered){events.push({from:'A',to:'PBX',text:'INVITE + SDP offer'},{from:'PBX',to:'B',text:'INVITE + SDP offer'});if(common)events.push({from:'B',to:'A',text:'180 Ringing (via PBX)'},{from:'B',to:'A',text:'200 OK + SDP answer (via PBX)'},{from:'A',to:'B',text:'ACK (via PBX)'},{from:'A',to:'B',text:'BYE setelah uji media (via PBX)'},{from:'B',to:'A',text:'200 OK untuk BYE (via PBX)'});else events.push({from:'B',to:'A',text:'488: tidak ada codec bersama (via PBX)'},{from:'A',to:'B',text:'ACK respons gagal INVITE (via PBX)'});}
 return {registered,common,established,directionAB:established&&v.routeAB,directionBA:established&&v.routeBA,pps,payload,perDirection,demand,capacityFits:demand<=v.capacity,packets,networkLost:packets.filter(p=>p.lost).length,late:packets.filter(p=>p.late).length,playoutDelay:40+v.buffer,events};
}
export const bufferLevels=[
 {name:'Meja layanan',start:3,arrivals:[0,2,1,5,4,8]},
 {name:'Paket mendahului tetangga',start:4,arrivals:[1,0,5,2,9,6]},
 {name:'Antrean jam sibuk',start:5,arrivals:[3,1,0,8,5,12,9,16]}
];
export function createBufferState(level=0){return {level,tick:0,buffer:[],played:[],missed:[],finished:false};}
export function packetDeadline(level,seq){return bufferLevels[level].start+(seq-1)*2;}
export function availablePackets(s){return bufferLevels[s.level].arrivals.map((arrival,i)=>({seq:i+1,arrival,deadline:packetDeadline(s.level,i+1)})).filter(p=>p.arrival<=s.tick&&!s.buffer.includes(p.seq)&&!s.played.includes(p.seq)&&!s.missed.includes(p.seq));}
export function bufferPacket(s,seq){if(s.finished)return false;const at=s.buffer.indexOf(seq);if(at>=0){s.buffer.splice(at,1);return true;}if(s.buffer.length===2||!availablePackets(s).some(p=>p.seq===seq))return false;s.buffer.push(seq);return true;}
export function advanceBuffer(s){
 if(s.finished)return;const count=bufferLevels[s.level].arrivals.length;
 for(let seq=1;seq<=count;seq++)if(packetDeadline(s.level,seq)===s.tick){const at=s.buffer.indexOf(seq);if(at>=0){s.buffer.splice(at,1);s.played.push(seq);}else s.missed.push(seq);}
 if(s.missed.length>=3||s.played.length+s.missed.length===count)s.finished=true;else s.tick++;
}

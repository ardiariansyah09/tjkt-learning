export function ipv4Number(text){const p=String(text).split('.');if(p.length!==4||p.some(n=>!/^\d{1,3}$/.test(n)||Number(n)>255))throw Error('IPv4 harus empat oktet 0–255.');return p.reduce((sum,n)=>sum*256+Number(n),0);}
export function ipv4Text(n){return [24,16,8,0].map(bits=>Math.floor(n/2**bits)%256).join('.');}
export function routingPrefix(text){const m=/^([^/]+)\/(\d{1,2})$/.exec(String(text).trim());if(!m||Number(m[2])>32)throw Error('Gunakan network/prefix IPv4, misalnya 10.10.30.0/24.');const ip=ipv4Number(m[1]),prefix=Number(m[2]),block=2**(32-prefix),network=Math.floor(ip/block)*block;if(ip!==network)throw Error('Network address tidak selaras dengan prefix. Gunakan network dasar atau /32 jika memang host route.');return {cidr:`${ipv4Text(network)}/${prefix}`,network,prefix,block};}
const hosts={A:{ip:'10.10.10.10',router:'R1',gateway:'10.10.10.1'},C:{ip:'10.10.30.20',router:'R3',gateway:'10.10.30.1'}};
const interfaces={R1:[{cidr:'10.10.10.0/24',lan:'A'},{cidr:'192.0.2.0/30',link:'AB'}],R2:[{cidr:'192.0.2.0/30',link:'AB'},{cidr:'198.51.100.0/30',link:'BC'}],R3:[{cidr:'10.10.30.0/24',lan:'C'},{cidr:'198.51.100.0/30',link:'BC'}]};
const neighbors={R1:{'192.0.2.2':['R2','AB']},R2:{'192.0.2.1':['R1','AB'],'198.51.100.2':['R3','BC']},R3:{'198.51.100.1':['R2','BC']}};
export function completeStaticRoutes(){return [{router:'R1',cidr:'10.10.30.0/24',nextHop:'192.0.2.2'},{router:'R2',cidr:'10.10.30.0/24',nextHop:'198.51.100.2'},{router:'R2',cidr:'10.10.10.0/24',nextHop:'192.0.2.1'},{router:'R3',cidr:'10.10.10.0/24',nextHop:'198.51.100.1'}];}
export function validateStaticRoutes(routes){const seen=new Set();return routes.map(r=>{if(!interfaces[r.router])throw Error('Router harus R1, R2, atau R3.');const parsed=routingPrefix(r.cidr);ipv4Number(r.nextHop);const key=`${r.router}:${parsed.cidr}`;if(seen.has(key))throw Error('Prefix statis ganda pada router yang sama tidak didukung model; edit/hapus baris lama.');seen.add(key);return {...r,...parsed};});}
export function routingTable(router,v){
 const connected=interfaces[router].map(i=>({...i,...routingPrefix(i.cidr),router,type:'connected',active:!i.link||v.links[i.link],reason:i.link&&!v.links[i.link]?'Interface transit nonaktif':'Connected pada interface model'}));
 const statics=validateStaticRoutes(v.routes).filter(r=>r.router===router).map(r=>{const neighbor=neighbors[router][r.nextHop],active=Boolean(neighbor&&v.links[neighbor[1]]);return {...r,type:'static',neighbor:neighbor?.[0],active,reason:active?'Next-hop tetangga langsung tersedia':neighbor?'Link ke next-hop nonaktif':'Next-hop bukan tetangga langsung dataset (recursive lookup tidak dihitung)'};});return [...connected,...statics];
}
const matches=(row,ip)=>ip>=row.network&&ip<row.network+row.block;
export function traceStatic(sourceKey,destination,v){
 const source=hosts[sourceKey],dstNumber=ipv4Number(destination),target=Object.entries(hosts).find(([,h])=>h.ip===destination);if(!source)throw Error('Pilih host sumber A/C.');if(destination===source.ip)return {arrived:true,steps:[],reason:'Tujuan host sumber sendiri pada dataset.',remaining:v.ttl};
 if(v[`gateway${sourceKey}`]!==source.gateway)return {arrived:false,steps:[],reason:`Gateway host ${sourceKey} tidak sesuai rancangan (${source.gateway}).`,remaining:v.ttl};
 let router=source.router,ttl=v.ttl;const visited=new Set(),steps=[];
 while(steps.length<32){
  if(visited.has(router)){steps.push({router,kind:'loop',detail:'Router dikunjungi ulang; loop terdeteksi model sebelum menunggu TTL habis.'});return {arrived:false,steps,reason:'Loop penerusan.',remaining:ttl};}visited.add(router);
  if(!v.forwarding[router]){steps.push({router,kind:'forwarding',detail:'Forwarding pada router ini nonaktif.'});return {arrived:false,steps,reason:`Forwarding ${router} nonaktif.`,remaining:ttl};}
  const table=routingTable(router,v),candidates=table.filter(r=>r.active&&matches(r,dstNumber)).sort((a,b)=>b.prefix-a.prefix||(a.type==='connected'?-1:1));const selected=candidates[0];
  if(!selected){steps.push({router,kind:'no-route',detail:'Tidak ada rute aktif yang cocok; periksa prefix serta status next-hop.',inactive:table.filter(r=>!r.active&&matches(r,dstNumber)).map(r=>`${r.cidr}: ${r.reason}`)});return {arrived:false,steps,reason:`Tidak ada rute aktif pada ${router}.`,remaining:ttl};}
  if(ttl<=1){steps.push({router,kind:'ttl',detail:'TTL 1 tidak cukup untuk penerusan berikutnya.',selected:selected.cidr});return {arrived:false,steps,reason:`TTL tidak cukup pada ${router}.`,remaining:ttl};}
  ttl--;steps.push({router,kind:'forward',selected:selected.cidr,type:selected.type,nextHop:selected.nextHop||'jaringan terhubung',candidates:candidates.map(r=>r.cidr),remaining:ttl,detail:`${selected.cidr} dipilih dari ${candidates.map(r=>r.cidr).join(', ')}; TTL menjadi ${ttl}.`});
  if(selected.type==='connected'){
   if(selected.lan&&target&&target[0]===selected.lan)return {arrived:true,steps,reason:`Tiba di host ${target[0]} pada LAN terhubung.`,remaining:ttl};
   return {arrived:false,steps,reason:'Tujuan pada jaringan terhubung bukan host A/C dalam dataset; layanan host tidak dimodelkan.',remaining:ttl};
  }
  router=selected.neighbor;
 }
 return {arrived:false,steps,reason:'Batas hop model tercapai.',remaining:ttl};
}
export function analyzeStaticRouting(v){validateStaticRoutes(v.routes);if(!Number.isInteger(v.ttl)||v.ttl<1||v.ttl>32)throw Error('TTL awal harus 1–32.');ipv4Number(v.gatewayA);ipv4Number(v.gatewayC);const forward=traceStatic(v.source,v.destination,v),target=Object.entries(hosts).find(([,h])=>h.ip===v.destination),reply=forward.arrived&&target?traceStatic(target[0],hosts[v.source].ip,v):null;return {passed:forward.arrived&&Boolean(reply?.arrived),forward,reply,tables:Object.fromEntries(Object.keys(interfaces).map(r=>[r,routingTable(r,v)]))};}
const makeRouteLevel=(width,height,blocked,target,ttl)=>{const points=Array.from({length:width*height},(_,i)=>[i%width,Math.floor(i/width)]),edges=[];points.forEach(([x,y],i)=>{for(const j of [x+1<width?i+1:null,y+1<height?i+width:null])if(j!==null&&!blocked.some(([a,b])=>(a===i&&b===j)||(a===j&&b===i)))edges.push([i,j]);});return {width,height,points,edges,blocked,start:0,target,ttl};};
export const ttlLevels=[makeRouteLevel(3,2,[],5,6),makeRouteLevel(3,3,[[1,2],[4,5],[6,7]],8,6),makeRouteLevel(4,3,[[1,2],[5,6]],3,9)];
export function newTTLRun(level){return {node:level.start,ttl:level.ttl,steps:0,path:[level.start],won:false,lost:false,message:'Amati graf, lalu bergerak lewat link menuju LAN tujuan.'};}
export const routingDirections={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
export function moveTTLRun(level,state,direction){if(state.won||state.lost)return state;const delta=routingDirections[direction];if(!delta)return state;const point=level.points[state.node],next=level.points.findIndex(p=>p[0]===point[0]+delta[0]&&p[1]===point[1]+delta[1]);if(next<0||!level.edges.some(([a,b])=>(a===state.node&&b===next)||(b===state.node&&a===next)))return {...state,message:'Tidak ada link aktif ke arah itu; pilih arah lain. TTL tidak berubah karena paket belum berpindah.'};if(state.ttl<=1)return {...state,lost:true,message:'TTL tidak cukup untuk penerusan; ulangi dengan paket baru.'};const ttl=state.ttl-1,won=next===level.target&&ttl>1,lost=!won&&ttl<=1||next===level.target&&!won;return {node:next,ttl:won?ttl-1:ttl,steps:state.steps+1,path:[...state.path,next],won,lost,message:won?'Paket diteruskan ke host LAN tujuan.':lost?'TTL tidak cukup untuk meneruskan sampai host. Ulangi level.':`Paket tiba di R${next+1}; TTL ${ttl}.`};}

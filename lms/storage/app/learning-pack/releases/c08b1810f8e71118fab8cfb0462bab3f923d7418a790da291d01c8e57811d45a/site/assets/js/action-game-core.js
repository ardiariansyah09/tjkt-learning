export const DIRECTIONS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
export const at=(a,b)=>a[0]===b[0]&&a[1]===b[1];
export function createLevel(index=0){
  const flip=([x,y])=>[index===1?10-x:x,index===2?6-y:y];
  const walls=[];for(let x=0;x<11;x++)walls.push([x,0],[x,6]);for(let y=1;y<6;y++)walls.push([0,y],[10,y]);
  walls.push([4,2],[4,3],[4,4],[7,1],[7,2],[7,4],[7,5]);
  return {width:11,height:7,start:flip([1,5]),exit:flip([9,1]),stations:[[2,5],[2,1],[6,3],[9,3]].map(flip),walls:walls.map(flip),gate:flip([7,3]),key:flip([5,1]),hazards:[[5,5],[8,2]].map(flip),batteries:[[3,3],[6,1],[9,5]].map(flip),patrol:[[8,4],[8,3],[8,2],[8,3]].map(flip),index};
}
export function newState(level){return {player:[...level.start],carrying:false,checkpoint:0,key:false,energy:110,lives:3,moves:0,mistakes:0,turn:0,batteries:[],won:false,lost:false,message:'Ambil muatan di depot dengan E / Aksi, lalu kunjungi pos 1–4 secara berurutan.'};}
export function act(level,state,action){
  if(state.won||state.lost)return state;
  const next={...state,player:[...state.player],batteries:[...state.batteries]};
  const fail=message=>{next.mistakes++;next.energy-=2;next.message=message;};
  if(action==='interact'){
    if(at(next.player,level.start)&&!next.carrying){next.carrying=true;next.message='Muatan diambil. Bawa ke pos 1, lalu aktifkan pos dengan E / Aksi.';}
    else if(next.carrying&&next.checkpoint<4&&at(next.player,level.stations[next.checkpoint])){next.checkpoint++;next.message=`Pos ${next.checkpoint}/4 diaktifkan. ${next.checkpoint===4?'Bawa muatan ke gerbang keluar.':'Lanjutkan ke pos berikutnya.'}`;}
    else if(at(next.player,level.exit)&&next.carrying&&next.checkpoint===4){next.won=true;next.message='Pengiriman berhasil. Seluruh pos telah dilalui dan muatan diserahkan.';}
    else next.message='Belum ada interaksi di sini. Berdirilah pada depot, pos aktif, atau gerbang keluar.';
  }else if(DIRECTIONS[action]||action==='wait'){
    const [dx,dy]=DIRECTIONS[action]||[0,0],destination=[next.player[0]+dx,next.player[1]+dy];
    if(level.walls.some(cell=>at(cell,destination))){fail('Terhalang dinding. Cari jalan memutar; energi berkurang.');}
    else if(at(destination,level.gate)&&!next.key){fail('Gerbang masih terkunci. Ambil token kunci di peta terlebih dahulu.');}
    else{
      next.player=destination;next.turn++;next.moves++;next.energy--;next.message='Teruskan perjalanan. Perhatikan pos aktif dan drone.';
      if(at(next.player,level.key)&&!next.key){next.key=true;next.message='Token kunci diperoleh; gerbang dapat dilalui.';}
      level.batteries.forEach((cell,index)=>{if(at(cell,next.player)&&!next.batteries.includes(index)){next.batteries.push(index);next.energy=Math.min(110,next.energy+15);next.message='Energi ditemukan: +15.';}});
      if(level.hazards.some(cell=>at(cell,next.player))||at(next.player,level.patrol[next.turn%level.patrol.length])){
        next.lives--;next.energy-=10;next.mistakes++;next.player=[...level.start];next.message='Terkena zona gangguan/drone. Kembali ke depot; muatan dan kemajuan pos tetap dibawa.';
      }
    }
  }
  if(next.energy<=0||next.lives<=0){next.lost=true;next.message='Misi gagal: energi atau nyawa habis. Ulangi level dan susun rute baru.';}
  return next;
}
export const earnedScore=state=>state.won?Math.max(80,100-state.mistakes*5):0;

export const incidents=[
 {id:'cord',name:'Komputer meja putus link',fix:'cord',physical:'Wiremap cord meja: open pin 3. Cord pembanding pada port sama lulus.',radio:'Klien ini berkabel; uji radio tidak menjawab jalurnya.',ip:'Saat link putus, gateway tidak terjangkau.',service:'Aplikasi lokal gagal pada link ini; klien pembanding di port lain normal.'},
 {id:'radio',name:'WLAN lambat saat kelas ramai',fix:'channel',physical:'Uplink dan cord AP lulus pemeriksaan model.',radio:'RSSI −58 dBm; dua AP saling mendengar pada kanal 1/20 MHz; airtime contoh 92%.',ip:'Alamat, gateway, dan resolusi nama sesuai baseline.',service:'Aplikasi lokal lambat pada WLAN; pembanding berkabel normal pada beban kasus.'},
 {id:'segment',name:'Wi-Fi tersambung tanpa IP siswa',fix:'mapping',physical:'Uplink AP aktif dan wiremap lulus pada data kasus.',radio:'Asosiasi berhasil; RSSI −55 dBm, SNR 32 dB pada sampel kasus.',ip:'SSID siswa salah dipetakan ke VLAN 30; rancangan latihan VLAN 20 dengan DHCP tersedia.',service:'Klien pada SSID ini tidak mencapai aplikasi; klien VLAN 20 yang benar normal.'}
];
export function maintenanceResult(caseId,change,revision,evidence){
 const incident=incidents.find(c=>c.id===caseId);if(!incident)throw Error('Kasus tidak dikenal');
 const restored=change===incident.fix;
 const verified=restored&&['link','application'].every(k=>evidence[k]===revision);
 return {caseId,change,revision,restored,verified,closed:false,evidence:{...evidence}};
}
// Each elbow has ports: 0 north, 1 east, 2 south, 3 west.
export const repairBoards=[
 {cols:2,rows:2,path:[0,2,3,1],initial:[0,2,0,1],target:[2,1,0,3],budget:8},
 {cols:3,rows:2,path:[0,3,4,1,2,5],initial:[1,0,0,3,2,0],target:[2,1,2,0,3,0],budget:12},
 {cols:4,rows:2,path:[0,4,5,1,2,6,7,3],initial:[0,1,0,1,2,1,3,2],target:[2,1,2,1,0,3,0,3],budget:16}
];
export function traceRepair(board,rotations){
 let cell=board.path[0],entry=3;const reached=[],seen=new Set();
 while(!seen.has(cell)){
  seen.add(cell);const ports=[rotations[cell],(rotations[cell]+1)%4];
  if(!ports.includes(entry))return {complete:false,reached,stop:cell};
  reached.push(cell);const exit=ports.find(p=>p!==entry),x=cell%board.cols,y=Math.floor(cell/board.cols);
  const nx=x+[0,1,0,-1][exit],ny=y+[-1,0,1,0][exit];
  if(nx===board.cols&&cell===board.path.at(-1)&&exit===1)return {complete:reached.length===board.path.length,reached,stop:cell};
  if(nx<0||nx>=board.cols||ny<0||ny>=board.rows)return {complete:false,reached,stop:cell};
  cell=ny*board.cols+nx;entry=(exit+2)%4;
 }
 return {complete:false,reached,stop:cell};
}

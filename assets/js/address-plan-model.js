import { parseIPv6 } from './studio-core.js';
export function ipv4Number(text){
  const parts=text.trim().split('.');if(parts.length!==4||parts.some(p=>!/^(0|[1-9]\d{0,2})$/.test(p)||Number(p)>255))throw Error('IPv4 harus empat oktet desimal 0–255 tanpa nol di depan.');
  return parts.reduce((n,p)=>n*256+Number(p),0);
}
export const ipv4Text=n=>[24,16,8,0].map(shift=>Math.floor(n/2**shift)%256).join('.');
export function ipv4Block(text){
  const parts=text.trim().split('/');if(parts.length!==2||!/^\d{1,2}$/.test(parts[1]))throw Error('Gunakan network/prefix, misalnya 10.10.0.0/24.');
  const prefix=Number(parts[1]);if(prefix<0||prefix>30)throw Error('Latihan LAN biasa memakai prefix /0–/30; /31 dan /32 dibahas terpisah.');
  const start=ipv4Number(parts[0]),size=2**(32-prefix);if(start%size)throw Error('Alamat awal bukan batas network yang sejajar dengan prefix.');
  return {start,end:start+size-1,size,prefix,mask:ipv4Text(2**32-size),network:ipv4Text(start),broadcast:ipv4Text(start+size-1),first:ipv4Text(start+1),last:ipv4Text(start+size-2),usable:size-2,cidr:`${ipv4Text(start)}/${prefix}`};
}
export function requiredBlock(hosts){if(!Number.isInteger(hosts)||hosts<1||hosts>2**32-2)throw Error('Kebutuhan host harus bilangan bulat positif dalam kapasitas IPv4.');const bits=Math.max(2,Math.ceil(Math.log2(hosts+2)));return {size:2**bits,prefix:32-bits,usable:2**bits-2};}
export function allocateVLSM(parentText,segments){
  const parent=ipv4Block(parentText);if(!segments.length||segments.length>32)throw Error('Isi 1–32 segmen.');
  const sorted=segments.map((s,i)=>({...s,index:i,...requiredBlock(s.hosts)})).sort((a,b)=>b.size-a.size||a.index-b.index);
  let cursor=parent.start;const rows=[];
  sorted.forEach(s=>{const start=Math.ceil(cursor/s.size)*s.size;if(start+s.size-1>parent.end)throw Error(`Blok induk tidak cukup untuk segmen ${s.name}.`);const block=ipv4Block(`${ipv4Text(start)}/${s.prefix}`);rows.push({...block,name:s.name,needed:s.hosts,index:s.index,gateway:block.first,spare:block.usable-s.hosts});cursor=block.end+1;});
  return {parent,rows,unallocated:parent.end-cursor+1};
}
export function validateSubnetRows(parentText,rows){
  const parent=ipv4Block(parentText),parsed=[],issues=[];
  rows.forEach((row,i)=>{try{const b=ipv4Block(row.cidr);parsed.push({...b,index:i,name:row.name});if(b.start<parent.start||b.end>parent.end)issues.push(`${row.name}: di luar blok induk.`);if(row.hosts!==undefined&&b.usable<row.hosts)issues.push(`${row.name}: kapasitas host usable kurang.`);if(row.gateway!==undefined){const g=ipv4Number(row.gateway);if(g<=b.start||g>=b.end)issues.push(`${row.name}: gateway bukan host usable pada subnet ini.`);}}catch(error){issues.push(`${row.name}: ${error.message}`);}});
  for(let i=0;i<parsed.length;i++)for(let j=i+1;j<parsed.length;j++)if(parsed[i].start<=parsed[j].end&&parsed[j].start<=parsed[i].end)issues.push(`${parsed[i].name} dan ${parsed[j].name}: subnet tumpang tindih.`);
  return {valid:issues.length===0,issues,rows:parsed};
}
export function allocateIPv6(parentText,count){
  const base=parseIPv6(parentText);if(base.prefix===null||base.prefix<32||base.prefix>64)throw Error('Latihan memakai prefix induk IPv6 /32–/64 dan subnet /64.');
  if(!Number.isInteger(count)||count<1||count>256)throw Error('Jumlah subnet latihan 1–256.');
  const raw=BigInt('0x'+base.expanded.replaceAll(':','')),bits=128n-BigInt(base.prefix),size=1n<<bits;
  if(raw%size!==0n)throw Error('Prefix IPv6 induk harus berada pada batas network.');
  const available=1n<<BigInt(64-base.prefix);if(BigInt(count)>available)throw Error('Prefix induk tidak menyediakan cukup subnet /64.');
  const subnets=Array.from({length:count},(_,i)=>{const n=raw+(BigInt(i)<<64n),groups=Array.from({length:8},(_,j)=>((n>>BigInt((7-j)*16))&65535n).toString(16));return `${parseIPv6(groups.join(':')).canonical}/64`;});
  return {parent:parentText,available:available.toString(),subnets};
}
export const addressGameLevels=[
  {name:'Tiga segmen LAN',reserved:[],tokens:[{id:'Lab',prefix:26},{id:'Admin',prefix:27},{id:'Server',prefix:28}]},
  {name:'Kampus bertumbuh',reserved:[],tokens:[{id:'Siswa',prefix:25},{id:'Guru',prefix:26},{id:'IoT',prefix:27},{id:'Kelola',prefix:28}]},
  {name:'Blok lama dipertahankan',reserved:[0,1,2,3],tokens:[{id:'Lab-baru',prefix:25},{id:'Staf',prefix:27},{id:'Layanan',prefix:28}]}
];
export function placeAddressTile(level,placements,id,start){
  const token=level.tokens.find(t=>t.id===id);if(!token)throw Error('Pilih blok segmen.');
  const cells=2**(28-token.prefix);if(!Number.isInteger(start)||start<0||start+cells>16||start%cells)throw Error('Batas blok tidak sejajar dengan prefix atau melewati induk /24.');
  const used=new Set(level.reserved);Object.entries(placements).forEach(([key,p])=>{if(key===id)return;const other=level.tokens.find(t=>t.id===key);for(let i=p;i<p+2**(28-other.prefix);i++)used.add(i);});
  for(let i=start;i<start+cells;i++)if(used.has(i))throw Error('Penempatan bertabrakan dengan blok lain atau alokasi lama.');
  return {...placements,[id]:start};
}

export function parseIPv6(input) {
  const parts = input.trim().split('/');
  if (parts.length > 2 || (parts[1] !== undefined && (!/^\d{1,3}$/.test(parts[1]) || Number(parts[1]) > 128))) throw new Error('Prefix harus berupa bilangan 0–128.');
  const address = parts[0];
  if (!address || /[^0-9a-f:]/i.test(address)) throw new Error('Gunakan notasi heksadesimal; zone ID dan notasi campuran IPv4 belum didukung latihan ini.');
  if ((address.match(/::/g) || []).length > 1 || address.includes(':::')) throw new Error('Gunakan :: paling banyak satu kali.');
  let groups;
  if (address.includes('::')) {
    const [left,right] = address.split('::').map(side => side ? side.split(':') : []);
    const missing = 8 - left.length - right.length;
    if (missing < 1) throw new Error(':: harus menggantikan sedikitnya satu kelompok nol.');
    groups = [...left,...Array(missing).fill('0'),...right];
  } else groups = address.split(':');
  if (groups.length !== 8 || groups.some(group => !/^[0-9a-f]{1,4}$/i.test(group))) throw new Error('Alamat harus dapat diperluas menjadi delapan kelompok, masing-masing 1–4 digit heksadesimal.');
  const values = groups.map(group => Number.parseInt(group,16));
  const normalized = values.map(value => value.toString(16));
  let bestStart = -1, bestLength = 1;
  for (let index=0;index<8;) {
    if (values[index] !== 0) { index++; continue; }
    let end=index;
    while (end<8 && values[end]===0) end++;
    if (end-index>bestLength) { bestStart=index; bestLength=end-index; }
    index=end;
  }
  const canonical = bestStart<0 ? normalized.join(':') : `${normalized.slice(0,bestStart).join(':')}::${normalized.slice(bestStart+bestLength).join(':')}`;
  const expanded = normalized.map(group => group.padStart(4,'0')).join(':');
  const allZero = values.every(value=>value===0);
  const loopback = values.slice(0,7).every(value=>value===0) && values[7]===1;
  const scope = allZero ? 'Unspecified' : loopback ? 'Loopback' : (values[0]&0xff00)===0xff00 ? 'Multicast' : (values[0]&0xffc0)===0xfe80 ? 'Link-local unicast' : (values[0]&0xfe00)===0xfc00 ? 'Unique local (ULA)' : 'Unicast / cek alokasi dan kebijakan';
  const documentation = values[0]===0x2001 && values[1]===0x0db8;
  return { canonical, expanded, scope, documentation, prefix:parts[1]===undefined ? null : Number(parts[1]) };
}

export function subnetIPv4(address, prefix) {
  const parts = address.split('.');
  if(parts.length!==4 || parts.some(part=>!/^\d{1,3}$/.test(part)||Number(part)>255)) throw new Error('IPv4 harus terdiri atas empat oktet 0–255.');
  if(!Number.isInteger(prefix)||prefix<1||prefix>30) throw new Error('Model ini menggunakan subnet biasa dengan prefix /1 sampai /30.');
  const value=parts.reduce((total,part)=>total*256+Number(part),0), size=2**(32-prefix);
  const network=Math.floor(value/size)*size;
  const format=number=>[24,16,8,0].map(shift=>(number>>>shift)&255).join('.');
  return { network:format(network), broadcast:format(network+size-1), first:format(network+1), last:format(network+size-2), hosts:size-2 };
}

export function reachable(edges,source,target,removedNode=-1) {
  if(source===removedNode||target===removedNode)return false;
  const seen=new Set([source]),queue=[source];
  while(queue.length){const current=queue.shift();if(current===target)return true;for(const [a,b] of edges){const next=a===current?b:b===current?a:null;if(next!==null&&next!==removedNode&&!seen.has(next)){seen.add(next);queue.push(next);}}}
  return false;
}

export function capacity(clients,extra,uplinks,reserve,ports) {
  if([clients,extra,uplinks,reserve,ports].some(value=>!Number.isInteger(value)||value<0)||reserve>100)throw new Error('Isi bilangan bulat tidak negatif; cadangan 0–100%.');
  const current=clients+extra+uplinks, spare=Math.ceil(current*reserve/100), required=current+spare;
  return {current,spare,required,remaining:ports-required,enough:ports>=required};
}

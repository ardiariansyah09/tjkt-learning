export const people=['Ayu','Bima','Tamu'];
export function accessCheck(c){
 const trace=[];const reject=reason=>({ok:false,reason,trace});if(!c.enabled)return reject('Akun nonaktif: sesi baru model ditolak.');trace.push('Akun aktif; identitas sesi model tersedia.');
 if(c.os==='linux'){if(!c.traverse)return reject('Direktori induk tidak memberi search/execute kepada identitas sesi.');const cls=c.owner?'owner':c.member?'group':'other',bits=Number(cls==='owner'?c.ownerBits:c[cls]);trace.push(`Kelas yang dipilih: ${cls}, bit ${bits}. Tidak jatuh ke kelas lain.`);const needed=c.operation==='read'?4:2;return {ok:!!(bits&needed),reason:bits&needed?'Operasi file diizinkan oleh kelas terpilih.':'Bit operasi tidak ada pada kelas terpilih.',trace};}
 const bit=c.operation==='read'?1:2;const ntfs=Number(c.allow)&~Number(c.deny);trace.push(`ACL eksplisit sederhana: allow ${c.allow}, deny ${c.deny}, effective ${ntfs}.`);const effective=c.remote?ntfs&Number(c.share):ntfs;trace.push(c.remote?'SMB model: hak share dan NTFS harus sama-sama mengizinkan operasi.':'Lokal model: tidak melewati izin share.');return {ok:!!(effective&bit),reason:effective&bit?'Operasi diizinkan pada lapisan yang dilalui.':'Operasi ditolak oleh ACL atau izin share yang relevan.',trace};
}
export const accessLevels=[
 {name:'Ruang proyek bersama',budget:10,groups:['Pembaca','Editor'],rights:[1,3],target:[1,3,0],initial:[[false,false],[false,false],[false,false]]},
 {name:'Audit kelebihan izin',budget:10,groups:['Pembaca','Editor'],rights:[1,3],target:[1,3,0],initial:[[false,true],[true,false],[true,true]]},
 {name:'Rotasi tugas dan pencabutan',budget:12,groups:['Pembaca','Editor','Arsip'],rights:[1,3,1],target:[3,1,0],initial:[[true,false,false],[false,true,false],[false,false,true]]}
];
export function newAccessGame(level=0){return {level,members:structuredClone(accessLevels[level].initial),session:structuredClone(accessLevels[level].initial),turn:0,tests:0,won:false,lost:false,message:'Susun keanggotaan minimum, perbarui sesi, lalu uji matriks izin.'};}
export function gameRights(s,user,session=true){const groups=session?s.session:s.members;return groups[user].reduce((r,on,g)=>on?r|accessLevels[s.level].rights[g]:r,0);}
export function accessGameAction(old,action,user,group){const s=structuredClone(old),cfg=accessLevels[s.level];if(s.won||s.lost)return s;s.turn++;
 if(action==='toggle'&&Number.isInteger(user)&&Number.isInteger(group)&&s.members[user]?.[group]!==undefined){s.members[user][group]=!s.members[user][group];s.message='Keanggotaan direktori berubah; token sesi masih lama. Perbarui sesi sebelum uji akhir.';}
 else if(action==='refresh'){s.session=structuredClone(s.members);s.message='Sesi model dibuat ulang dengan keanggotaan terkini.';}
 else if(action==='test'){s.tests++;const exact=cfg.target.every((v,i)=>gameRights(s,i)===v),fresh=JSON.stringify(s.session)===JSON.stringify(s.members),minimal=s.members.every(row=>row.filter(Boolean).length<=1);s.won=exact&&fresh&&minimal;s.message=s.won?'Matriks tepat, sesi terbaru, dan tidak ada keanggotaan berlebih.':!fresh?'Sesi masih lama. Perbarui sesi lalu uji lagi.':!minimal?'Hak mungkin benar tetapi ada keanggotaan berlebih. Sisakan maksimal satu per orang.':'Matriks belum sesuai. Baca selisih target dan hasil, lalu perbaiki koneksi.';}
 else s.message='Tindakan tidak valid; baca kontrol koneksi.';
 s.lost=!s.won&&s.turn>=cfg.budget;if(s.lost)s.message='Anggaran habis. Ulangi level dan rencanakan koneksi minimum.';return s;
}

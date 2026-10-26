const assert=(v,m)=>{if(!v)throw Error(m);};
export async function renderSample(long=false){
 assert(window.TJKTCertificate?.print&&window.TJKTCertificate?.ready,'New certificate API missing');
 let paper=document.getElementById('certificateQA');if(!paper){paper=document.createElement('section');paper.id='certificateQA';paper.className=document.body.dataset.moduleId==='ipv4-subnetting'?'stage9-printable':'cert';document.body.append(paper);}
 TJKTCertificate.render(paper,{name:long?'Muhammad Abdurrahman Pratama Wijaya Kusuma Putra Adinata Saputra Santoso':'Nama Peserta',module:long?'Perawatan dan Perbaikan Jaringan Kabel dan Nirkabel untuk Integrasi Layanan Sekolah':'Pengenalan Jaringan Komputer',score:90,date:'2026-10-24T00:00:00+07:00'});
 await TJKTCertificate.ready(paper);const logo=paper.querySelector('img');assert(logo.complete&&logo.naturalWidth===1254,'Original logo not loaded');assert(paper.querySelectorAll('img').length===1,'Repeated logo');assert(paper.querySelector('.tjkt-cert-disclaimer').textContent.includes('bukan sertifikat resmi'),'Certificate status changed');assert(paper.querySelector('.tjkt-cert-date').textContent.includes('24 Oktober 2026'),'Date timezone');
 const print=window.print;let calls=0;window.print=()=>{assert(logo.complete,'Print before logo');calls++;};try{await TJKTCertificate.print();}finally{window.print=print;}assert(calls===1,'Print invocation');return true;
}
export function printGeometry(){
 const p=document.getElementById('certificateQA'),r=p.getBoundingClientRect(),logo=p.querySelector('img').getBoundingClientRect();assert(getComputedStyle(p).display==='grid','Print layout hidden');assert(Math.abs(r.width-1122.52)<2&&Math.abs(r.height-793.7)<2,'Not A4 landscape');assert(Math.abs(logo.width-logo.height)<1,'Logo distorted');assert([...document.body.children].filter(n=>n!==p).every(n=>getComputedStyle(n).display==='none'),'Other content prints');
 for(const n of p.querySelectorAll('h1,h2,h3,p,small,.tjkt-cert-header,.tjkt-cert-footer')){const b=n.getBoundingClientRect();assert(b.left>=r.left-1&&b.right<=r.right+1&&b.top>=r.top-1&&b.bottom<=r.bottom+1,'Clipped: '+n.className);}
 const contentNode=p.querySelector('.tjkt-cert-content'),head=p.querySelector('.tjkt-cert-header').getBoundingClientRect(),content=contentNode.getBoundingClientRect(),foot=p.querySelector('.tjkt-cert-footer').getBoundingClientRect();assert(head.bottom<=content.top+1&&content.bottom<=foot.top+1,'Certificate sections overlap');
 let previous=head.bottom;for(const n of contentNode.children){const b=n.getBoundingClientRect();assert(b.top>=previous-1&&b.bottom<=foot.top+1,'Certificate content overlaps');previous=b.bottom;}
 assert(p.scrollHeight<=p.clientHeight+1,'Vertical overflow');return {width:r.width,height:r.height,logoWidth:logo.width};
}

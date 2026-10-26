/* One local/offline certificate design, shared by every certificate entry point. */
(function(){
  'use strict';
  const scriptURL=document.currentScript?.src||document.baseURI;
  const logoURL=new URL('../images/tjkt-wikrama-logo.png',scriptURL).href;
  const make=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n;};
  function frame(){
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1123 794');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.classList.add('tjkt-cert-frame');
    const add=(tag,attrs)=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>n.setAttribute(key,value));svg.append(n);return n;};
    add('rect',{x:20,y:20,width:1083,height:754,fill:'#fff',stroke:'#08264b','stroke-width':1.5});
    add('path',{d:'M20 20H151L174 43V657L127 704V774H20Z',fill:'#071c3d'});
    add('path',{d:'M151 20L184 53V658L139 703V774',fill:'none',stroke:'#00b9e8','stroke-width':3});
    add('path',{d:'M20 735H112L153 694',fill:'none',stroke:'#ed1424','stroke-width':8});
    add('path',{d:'M965 20H1103V151L1084 132V39H984Z',fill:'#08264b'});
    add('path',{d:'M996 44H1078V123',fill:'none',stroke:'#00b9e8','stroke-width':2});
    add('path',{d:'M1014 20H1078',fill:'none',stroke:'#ed1424','stroke-width':5});
    add('path',{d:'M920 751H1025L1064 712H1103M970 762H1043L1077 728H1103',fill:'none',stroke:'#00a4d7','stroke-width':1.5});
    for(const [d,x,y] of [['M43 70V180L105 242V327',105,327],['M67 70V160L130 223V285',130,285],['M40 510H72L113 551V640',113,640],['M40 537H62L89 564V615',89,615]]){add('path',{d,fill:'none',stroke:'#00b9e8','stroke-width':1.6,opacity:.7});add('circle',{cx:x,cy:y,r:4,fill:'#071c3d',stroke:'#35d4f5','stroke-width':2});}
    const label=add('text',{x:71,y:469,transform:'rotate(-90 71 469)',fill:'#fff','font-size':12,'letter-spacing':4,'font-family':'Arial, sans-serif'});label.textContent='TJKT LEARNING HUB';
    return svg;
  }
  function render(target,data={}){
    if(!target)return;
    const dateValue=data.date?new Date(data.date):new Date();
    const date=new Intl.DateTimeFormat('id-ID',{dateStyle:'long',timeZone:'Asia/Jakarta'}).format(Number.isNaN(dateValue.getTime())?new Date():dateValue);
    const name=String(data.name||'').trim().replace(/\s+/g,' ').slice(0,70),module=String(data.module||'').trim().slice(0,180),score=Number(data.score);
    target.classList.add('tjkt-certificate-paper');target.dataset.certificateDesign='tjkt-circuit-v3';target.setAttribute('aria-label','Sertifikat penyelesaian modul');target.replaceChildren(frame());
    const head=make('div','tjkt-cert-header'),logo=make('img','tjkt-cert-logo');logo.src=logoURL;logo.alt='Logo TJKT SMK Wikrama Bogor';logo.width=1254;logo.height=1254;logo.decoding='sync';
    const brand=make('div','tjkt-cert-identity');brand.append(make('div','tjkt-cert-brand','TJKT LEARNING HUB'),make('div','tjkt-cert-school','SMK WIKRAMA BOGOR'),make('div','tjkt-cert-tagline','TERKONEKSI · TERPROTEKSI · PRESISI'));head.append(logo,brand,make('span','tjkt-cert-category','PEMBELAJARAN\nMANDIRI'));
    const content=make('div','tjkt-cert-content'),heading=make('h1','tjkt-cert-heading','SERTIFIKAT');heading.append(make('span','tjkt-cert-subheading','PENYELESAIAN MODUL'));
    const recipient=make('h2','tjkt-cert-name',name);if(name.length>45)recipient.classList.add('tjkt-cert-name-long');
    const moduleTitle=make('h3','tjkt-cert-module',module);if(module.length>65)moduleTitle.classList.add('tjkt-cert-module-long');
    content.append(heading,make('p','tjkt-cert-intro','Diberikan kepada'),recipient,make('p','tjkt-cert-intro','Atas penyelesaian pembelajaran interaktif pada modul'),moduleTitle,make('p','tjkt-cert-description','Sebagai catatan capaian belajar dan pengembangan kompetensi secara mandiri.'));
    const footer=make('div','tjkt-cert-footer'),meta=make('div','tjkt-cert-meta'),dateBox=make('div','tjkt-cert-date'),scoreBox=make('div','tjkt-cert-score');dateBox.append(make('span','tjkt-cert-label','TANGGAL PENERBITAN'),make('strong','',date));scoreBox.append(make('span','tjkt-cert-label','NILAI POSTTEST TERBAIK'),make('strong','',Number.isFinite(score)&&score>=0&&score<=100?`${score}/100`:'—'));
    meta.append(dateBox,scoreBox);footer.append(meta,make('p','tjkt-cert-author','Media belajar interaktif · Karya Ardi Ariansyah'),make('small','tjkt-cert-disclaimer','Sertifikat penyelesaian mandiri — bukan sertifikat resmi dan tidak memverifikasi identitas.'));
    target.append(head,content,footer);
    return target;
  }
  async function ready(target){await document.fonts.ready;const images=[...(target||document).querySelectorAll('.tjkt-cert-logo')];await Promise.all(images.map(img=>img.decode()));}
  async function print(){
    try{await ready(document);window.print();return true;}
    catch{window.alert('Logo sertifikat belum berhasil dimuat. Muat ulang halaman sebelum mencetak.');return false;}
  }
  window.TJKTCertificate={render,ready,print};
})();

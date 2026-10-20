/* Shared certificate renderer for all TJKT Learning Hub modules. */
(function(){
  'use strict';
  function render(target, data){
    if(!target)return;
    const make=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n;};
    const date=new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date());
    target.classList.add('tjkt-certificate-paper');
    target.replaceChildren();
    target.append(
      make('div','tjkt-cert-brand','TJKT LEARNING HUB'),
      make('div','tjkt-cert-school','KARYA ARDI ARIANSYAH'),
      make('div','tjkt-cert-rule',''),
      make('h1','tjkt-cert-heading','SERTIFIKAT PENYELESAIAN'),
      make('p','tjkt-cert-intro','Diberikan kepada'),
      make('h2','tjkt-cert-name',data.name),
      make('p','tjkt-cert-intro','Telah menyelesaikan modul pembelajaran'),
      make('h3','tjkt-cert-module',data.module),
      make('p','tjkt-cert-score','Nilai Posttest Terbaik: '+data.score+'/100'),
      make('p','tjkt-cert-date','Tanggal penyelesaian: '+date),
      make('small','tjkt-cert-disclaimer','Sertifikat penyelesaian mandiri — bukan sertifikat resmi dan tidak memverifikasi identitas.')
    );
  }
  window.TJKTCertificate={render};
})();

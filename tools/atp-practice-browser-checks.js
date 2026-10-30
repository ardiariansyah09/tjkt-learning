window.__checkATPPractice=(type)=>{
 const box=document.querySelector(`[data-atp-practice="${type}"][data-mounted]`);if(!box)throw Error('Missing practice '+type);
 const q=selector=>box.querySelector(selector),set=(name,value)=>{const input=q(`[name="${name}"]`);if(!input)throw Error('Missing input '+name);if(input.type==='checkbox')input.checked=value;else input.value=String(value);input.dispatchEvent(new Event('change',{bubbles:true}));};
 const click=action=>q(`[data-atp-action="${action}"]`).click();
 const check=(match)=>{if(!q('.atp-result').textContent.includes(match))throw Error(type+': '+q('.atp-result').textContent);};
 click('reset');
 if(type==='telecom'){
  click('test');check('terpenuhi');set('position',80);set('handover',false);click('test');check('tidak tersedia');set('handover',true);click('test');check('terpenuhi');set('mode','microwave');set('extraLoss',17);click('test');check('margin -2');set('extraLoss',2);click('test');check('margin 13');set('mode','vsat');set('queueMs',40);click('test');check('560');
 }else if(type==='handoff'){click('test');check('Tahan penyerahan');set('htsVersion',2);set('approved',true);click('test');check('105 m');check('siap ditinjau');set('portsMatch',false);click('test');check('Konflik');set('portsMatch',true);click('test');}
 else if(type==='ruijie'){click('test');check('Apply');set('channelB',6);click('apply');click('test');check('terpenuhi');click('save');set('uplinkVlan',21);click('apply');click('test');check('tidak cocok');click('restart');click('test');check('terpenuhi');}
 else if(type==='bird'){click('test');check('belum diekspor');set('kernel',true);click('test');check('berhasil');set('forwardA',false);click('test');check('belum berhasil');set('forwardA',true);click('test');check('terpenuhi');}
 else if(type==='radius'){click('test');check('Access-Accept');check('belum menerapkan');set('nasMapping',true);click('test');check('4 Mbit/s');set('freshSession',false);click('test');check('8 Mbit/s');set('freshSession',true);set('secret',false);click('test');check('Tidak ada balasan');set('secret',true);click('test');check('terpenuhi');}
 else{click('test');check('0 dari 3');set('scenario','power');click('test');check('1 dari 3');if(!q('table').textContent.includes('null'))throw Error('Missing RX must be null');set('scenario','pon');click('test');check('3 dari 3');set('age',180);click('test');check('Data basi');set('age',0);set('scenario','normal');click('test');check('terpenuhi');}
 return {type,successAndFailure:true};
};

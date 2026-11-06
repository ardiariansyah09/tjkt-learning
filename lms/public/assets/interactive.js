(() => {
    'use strict';
    const root = document.getElementById('interactive-app');
    if (!root || !window.tjktInteractive) return;
    const {config, runtime} = window.tjktInteractive;
    const el = (tag, text, cls) => { const n=document.createElement(tag); if(text!==undefined)n.textContent=text; if(cls)n.className=cls; return n; };
    const button = (text, fn) => { const n=el('button',text,'btn btn-sm btn-outline-primary');n.type='button';n.addEventListener('click',fn);return n; };
    class ActivityResultReporter {
        constructor() {this.runtime=runtime;this.tail=Promise.resolve();this.stopped=false;this.failed=false;}
        send(action, extra={}) {
            const task=this.tail.then(async()=>{
                if(this.stopped)throw new Error('Percobaan sudah selesai.');
                const response=await fetch(root.dataset.url,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]').content},body:JSON.stringify({action,revision:this.runtime.revision,...extra})});
                let body;try{body=await response.json();}catch{throw new Error('Respons tidak terbaca. Periksa koneksi dan sesi login, lalu muat ulang.');}
                if(!response.ok){
                    if(response.status===409){this.stopped=true;throw new Error('Sesi berubah di tab lain atau respons sebelumnya terputus. Muat ulang halaman sebelum melanjutkan.');}
                    throw new Error(response.status===419?'Sesi berakhir. Masuk kembali.':response.status===429?'Terlalu banyak interaksi. Tunggu sebentar.':Object.values(body.errors||{}).flat().join(' ')||body.message||'Gagal menyimpan interaksi.');
                }
                this.runtime=body;this.failed=false;
                document.getElementById('interactive-status').textContent=body.message||'Tersimpan di server.';
                if(body.status!=='in_progress'){this.stopped=true;location.reload();}
                return body;
            });
            this.tail=task.catch(error=>{this.failed=true;document.getElementById('interactive-status').textContent=error.message;});
            return task;
        }
    }
    class ProgressTracker {
        constructor(reporter){this.reporter=reporter;this.deadline=Date.parse(runtime.expires_at);this.offset=Date.parse(runtime.server_now)-Date.now();this.sent=false;this.tick();this.timer=setInterval(()=>this.tick(),1000);}
        tick(){const sec=Math.max(0,Math.ceil((this.deadline-Date.now()-this.offset)/1000));document.getElementById('interactive-clock').textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} tersisa`;if(sec===0&&!this.sent){this.sent=true;this.reporter.send('submit').catch(()=>{this.sent=false;});}}
    }
    class Engine {
        constructor(config,reporter){this.config=config;this.reporter=reporter;this.host=document.getElementById('interactive-engine');this.state=reporter.runtime.state;}
        feedback(result){const box=document.getElementById('interactive-feedback');box.replaceChildren(el('strong',`Checkpoint: ${result.score} / 100`));const list=el('ul');Object.entries(result.checks).forEach(([label,ok])=>list.append(el('li',`${ok?'✓':'○'} ${label}`)));box.append(list);}
        async check(){await this.flush();const result=await this.reporter.send('checkpoint');this.feedback(result.checkpoint);}
        async submit(){await this.flush();if(!this.reporter.failed){const r=await this.reporter.send(this.config.preview?'checkpoint':'submit');if(this.config.preview)this.feedback(r.checkpoint);}}
        async flush() {await this.reporter.tail; if(this.reporter.failed) throw new Error('Ada perubahan yang belum tersimpan. Coba simpan lagi.');}
        async reset(){const r=await this.reporter.send('reset');this.state=r.state;this.render();document.getElementById('interactive-feedback').replaceChildren();}
    }
    class VirtualTerminalEngine extends Engine {
        render(){
            this.host.replaceChildren(el('p','Konsol root lokal virtual. Klien 192.168.10.10 → server 192.168.10.2. Ketik help untuk perintah.','small text-secondary'));
            this.log=el('pre',this.state.logs.join('\n'),'virtual-terminal p-3 rounded-3');this.log.setAttribute('aria-live','polite');this.host.append(this.log);
            const form=el('form',undefined,'d-flex gap-2 mb-4');const input=el('input',undefined,'form-control font-monospace');input.setAttribute('aria-label','Perintah terminal virtual');input.placeholder='apt update';input.maxLength=300;input.autocomplete='off';const run=el('button','Jalankan','btn btn-primary');run.type='submit';form.append(input,run);this.host.append(form);
            form.addEventListener('submit',async e=>{e.preventDefault();if(!input.value.trim())return;run.disabled=true;try{const r=await this.reporter.send('command',{argv:input.value.trim().split(/\s+/)});this.state=r.state;this.log.textContent=r.state.logs.join('\n');input.value='';this.log.scrollTop=this.log.scrollHeight;}catch{}finally{run.disabled=false;input.focus();}});
            const label=el('label','Editor /etc/ssh/sshd_config','form-label fw-bold');label.htmlFor='virtual-config';this.host.append(label);
            this.editor=el('textarea',undefined,'form-control font-monospace');this.editor.id='virtual-config';this.editor.rows=10;this.editor.maxLength=8000;this.editor.value=this.state.config;this.host.append(this.editor);
            this.host.append(button('Simpan konfigurasi virtual',()=>this.saveConfig().catch(()=>{})));
            this.host.append(el('p','Subset simulator: Port, PermitRootLogin, PubkeyAuthentication, PasswordAuthentication, KbdInteractiveAuthentication, UsePAM. Simulator memakai satu direktif Port; multi-port, Include/Match dan perintah lain tidak disimulasikan. Perubahan berkas berlaku pada listener setelah restart/reload.','form-text'));
        }
        async saveConfig(){const r=await this.reporter.send('write',{content:this.editor.value});this.state=r.state;}
        async flush(){await this.reporter.tail;if(this.editor.value!==this.reporter.runtime.state.config)await this.saveConfig();await super.flush();}
    }
    class MatchingGame extends Engine {
        render(){this.host.replaceChildren(el('p','Pasangkan setiap item dengan jawaban yang sesuai. Pilihan dapat digunakan satu kali.'));this.selects={};const list=el('div',undefined,'row g-3');
            this.config.items.forEach(item=>{const row=el('div',undefined,'col-md-6');const label=el('label',item.label,'form-label fw-bold');label.htmlFor=`match-${item.key}`;const select=el('select',undefined,'form-select');select.id=label.htmlFor;select.append(new Option('Pilih pasangan…',''));this.config.right.forEach(r=>select.append(new Option(r.label,r.key)));select.value=this.state.answer[item.key]||'';this.selects[item.key]=select;select.addEventListener('change',()=>this.save().catch(()=>{}));row.append(label,select);list.append(row);});this.host.append(list);
        }
        answer(){return Object.fromEntries(Object.entries(this.selects).map(([key,select])=>[key,select.value]));}
        async save(){const r=await this.reporter.send('answer',{answer:this.answer()});this.state=r.state;}
        async flush(){await this.save();await super.flush();}
    }
    class DragDropEngine extends MatchingGame {
        render(){super.render();this.host.prepend(el('p','Seret kartu ke kotak pasangan, atau gunakan pilihan dropdown untuk layar sentuh dan keyboard.','small text-secondary'));const cards=el('div',undefined,'d-flex flex-wrap gap-2 mb-3');
            this.config.right.forEach(r=>{const card=el('span',r.label,'badge text-bg-primary p-3');card.draggable=true;card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',r.key));cards.append(card);});this.host.prepend(cards);
            Object.values(this.selects).forEach(select=>{select.closest('.col-md-6').addEventListener('dragover',e=>e.preventDefault());select.closest('.col-md-6').addEventListener('drop',e=>{e.preventDefault();const key=e.dataTransfer.getData('text/plain');if(this.config.right.some(r=>r.key===key)){select.value=key;this.save().catch(()=>{});}});});
        }
    }
    class SortingGame extends Engine {
        render(){this.order=(this.state.answer.length?this.state.answer:this.config.items.map(i=>i.key)).slice();this.host.replaceChildren(el('p','Susun langkah dengan menyeret kartu atau tombol naik/turun.'));this.list=el('ol',undefined,'list-group list-group-numbered');this.host.append(this.list);this.draw();}
        draw(){this.list.replaceChildren();this.order.forEach((key,index)=>{const item=this.config.items.find(i=>i.key===key);const row=el('li',undefined,'list-group-item d-flex align-items-center gap-3');row.draggable=true;row.append(el('span',item.label,'flex-grow-1'));const up=button('↑',()=>this.move(index,index-1));up.setAttribute('aria-label',`Naikkan ${item.label}`);up.disabled=index===0;const down=button('↓',()=>this.move(index,index+1));down.setAttribute('aria-label',`Turunkan ${item.label}`);down.disabled=index===this.order.length-1;row.append(up,down);row.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',key));row.addEventListener('dragover',e=>e.preventDefault());row.addEventListener('drop',e=>{e.preventDefault();const from=this.order.indexOf(e.dataTransfer.getData('text/plain'));if(from>=0)this.move(from,index);});this.list.append(row);});}
        move(from,to){if(to<0||to>=this.order.length)return;const [key]=this.order.splice(from,1);this.order.splice(to,0,key);this.draw();this.save().catch(()=>{});}
        async save(){const r=await this.reporter.send('answer',{answer:this.order.slice()});this.state=r.state;}
        async flush(){await this.save();await super.flush();}
    }
    class NetworkTopologyEngine extends Engine {
        render(){
            this.host.replaceChildren(el('p',`Hubungkan klien → switch → server. Kebijakan server: port ${this.config.scenario==='guided'?'22':'2222'}, autentikasi ${this.config.scenario==='hardening'?'public key':'password'}. Aktifkan layanan SSH lalu uji jalurnya.`));
            this.answer={links:[],port:'22',auth:'password',service:'stopped',...this.state.answer};
            const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 660 150');svg.setAttribute('role','img');svg.setAttribute('aria-label','Diagram jalur SSH klien melalui switch ke server');svg.classList.add('network-diagram');this.host.append(svg);this.svg=svg;
            const controls=el('div',undefined,'d-flex flex-wrap gap-3 my-3');this.links={};[['client-switch','Klien ↔ Switch'],['switch-server','Switch ↔ Server']].forEach(([key,label])=>{const wrap=el('label',undefined,'form-check');const check=el('input',undefined,'form-check-input');check.type='checkbox';check.checked=this.answer.links.includes(key);this.links[key]=check;check.addEventListener('change',()=>{this.answer.links=Object.keys(this.links).filter(k=>this.links[k].checked);this.draw();this.save().catch(()=>{});});wrap.append(check,document.createTextNode(label));controls.append(wrap);});this.host.append(controls);
            const row=el('div',undefined,'row g-3');[['port','Port SSH',[['22','TCP 22'],['2222','TCP 2222']]],['auth','Autentikasi',[['password','Password'],['key','Public key']]],['service','Service SSH',[['stopped','Berhenti'],['running','Aktif']]]].forEach(([key,label,opts])=>{const col=el('div',undefined,'col-md-4');const l=el('label',label,'form-label');l.htmlFor=`network-${key}`;const select=el('select',undefined,'form-select');select.id=l.htmlFor;opts.forEach(([v,t])=>select.append(new Option(t,v)));select.value=this.answer[key];select.addEventListener('change',()=>{this.answer[key]=select.value;this.draw();this.save().catch(()=>{});});col.append(l,select);row.append(col);});this.host.append(row);this.host.append(button('Uji koneksi SSH',()=>this.check().catch(()=>{})));this.draw();
        }
        draw(){this.svg.replaceChildren();const make=(tag,attrs)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};[['client-switch',110,330],['switch-server',330,550]].forEach(([key,x1,x2])=>this.svg.append(make('line',{x1,y1:65,x2,y2:65,stroke:this.answer.links.includes(key)?'#087f8c':'#ced4da','stroke-width':6,'stroke-dasharray':this.answer.links.includes(key)?'0':'8'})));[['Klien',110],['Switch',330],['Server SSH',550]].forEach(([label,x])=>{this.svg.append(make('rect',{x:x-75,y:30,width:150,height:70,rx:12,fill:'#12305a'}));const t=make('text',{x,y:72,fill:'white','text-anchor':'middle','font-size':18});t.textContent=label;this.svg.append(t);});}
        async save(){const r=await this.reporter.send('answer',{answer:JSON.parse(JSON.stringify(this.answer))});this.state=r.state;}
        async flush(){await this.save();await super.flush();}
    }
    const reporter=new ActivityResultReporter();const types={game:window.TJKTTemplateGame,terminal:VirtualTerminalEngine,matching:MatchingGame,drag_drop:DragDropEngine,sorting:SortingGame,network:NetworkTopologyEngine};const engine=new types[config.kind](config,reporter);engine.render();new ProgressTracker(reporter);
    const invoke=fn=>async()=>{try{await fn();}catch(error){document.getElementById('interactive-status').textContent=error.message;}};
    document.getElementById('interactive-checkpoint').addEventListener('click',invoke(()=>engine.check()));
    document.getElementById('interactive-reset').addEventListener('click',invoke(()=>{if(confirm('Reset kondisi? Waktu tetap berjalan dan reset maksimal tiga kali.'))return engine.reset();}));
    document.getElementById('interactive-submit').addEventListener('click',invoke(()=>{if(confirm('Kirim kondisi terakhir untuk dinilai? Percobaan akan ditutup.'))return engine.submit();}));
    window.TJKTInteractive={ActivityResultReporter,ProgressTracker,MatchingGame,DragDropEngine,SortingGame,VirtualTerminalEngine,NetworkTopologyEngine};
})();

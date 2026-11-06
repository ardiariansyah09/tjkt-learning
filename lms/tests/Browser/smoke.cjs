const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {chromium}=require(process.env.TJKT_PLAYWRIGHT_MODULE||'/tmp/tjkt-browser-check/node_modules/playwright');
const contextFile=process.argv[2];if(!contextFile?.startsWith('/tmp/tjkt-uat-'))throw Error('Private UAT context required');
const c=JSON.parse(fs.readFileSync(contextFile));const artifact=process.env.TJKT_UAT_ARTIFACTS||'/tmp/tjkt-uat-artifacts';fs.mkdirSync(artifact,{recursive:true,mode:0o700});
const checks=[];const errors=[];let activePage;const failedRequests=[];const check=(name)=>{checks.push(name);console.log('PASS '+name);};
let browser;
(async()=>{
    browser=await chromium.launch({headless:true});
    async function account(name,viewport){const ctx=await browser.newContext({viewport:viewport||{width:1440,height:1000},acceptDownloads:true});const p=await ctx.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(c.base_url+'/login');await p.getByLabel('Username',{exact:true}).fill(c.accounts[name].username);await p.getByLabel('Password',{exact:true}).fill(c.accounts[name].password);await p.getByRole('button',{name:/^Masuk/}).click();await p.waitForURL('**/'+(name==='teacher'?'guru':'siswa')+'/dashboard');return {ctx,p};}
    const student=await account('student');const p=student.p;activePage=p;p.on('response',async r=>{if(r.status()<400)return;const failure={url:r.url(),status:r.status()};failedRequests.push(failure);try{failure.body=(await r.text()).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,400);}catch{}});check('Login siswa melalui HTTPS publik');
    async function open(kind){await p.goto(c.base_url+'/siswa/aktivitas/'+c.activities[kind]);await p.getByRole('button',{name:/Mulai aktivitas|Lanjutkan aktivitas/}).click();await p.locator('#interactive-app').waitFor();}
    async function submitEngine(){await p.getByRole('button',{name:'Kirim dan nilai',exact:true}).click();await p.getByRole('heading',{name:/Lulus · Skor 100/}).waitFor();}
    for(const kind of ['matching','drag_drop']){
        await open(kind);
        if(kind==='matching'){await p.getByLabel('SSH',{exact:true}).selectOption({label:'TCP 22'});await p.getByLabel('HTTPS',{exact:true}).selectOption({label:'TCP 443'});}
        else{for(const [left,right] of [['SSH','TCP 22'],['HTTPS','TCP 443']]){const select=p.getByLabel(left,{exact:true});await p.locator('#interactive-engine .badge[draggable=true]').filter({hasText:right}).dragTo(select.locator('..'));}}
        await p.screenshot({path:path.join(artifact,kind+'.png'),fullPage:true});await submitEngine();check(kind+' interaksi dan penilaian server');
    }
    await open('sorting');
    for(const label of ['Instal','Konfigurasi','Uji']){
        // Move desired item into its known position using accessible keyboard controls.
        const target=['Instal','Konfigurasi','Uji'].indexOf(label);
        for(let guard=0;guard<3;guard++){const order=await p.locator('#interactive-engine li > span').allTextContents();if(order.indexOf(label)===target)break;await p.getByRole('button',{name:'Naikkan '+label,exact:true}).click();}
    }
    await submitEngine();check('Sorting dengan tombol aksesibel');
    await open('network');await p.getByLabel('Klien ↔ Switch',{exact:true}).check();await p.getByLabel('Switch ↔ Server',{exact:true}).check();await p.getByLabel('Service SSH',{exact:true}).selectOption('running');await p.screenshot({path:path.join(artifact,'network.png'),fullPage:true});await submitEngine();check('Diagram jaringan SVG dan konektivitas');
    await open('terminal');
    for(const command of ['apt update','apt install openssh-server','systemctl enable ssh','ssh siswa@192.168.10.2']){await p.getByLabel('Perintah terminal virtual').fill(command);await p.getByRole('button',{name:'Jalankan',exact:true}).click();await p.waitForFunction(()=>document.querySelector('input[aria-label="Perintah terminal virtual"]').value==='');}
    await p.getByRole('button',{name:'Periksa checkpoint'}).click();await p.locator('#interactive-feedback').getByText('Checkpoint: 100 / 100',{exact:true}).waitFor();await p.screenshot({path:path.join(artifact,'terminal.png'),fullPage:true});await submitEngine();check('Terminal virtual, checkpoint dan kondisi akhir');
    await p.goto(c.base_url+'/siswa/aktivitas/'+c.activities.quiz);await p.getByRole('button',{name:'Mulai percobaan',exact:true}).click();await p.getByLabel('TCP 22',{exact:true}).check();await p.getByRole('button',{name:'Kirim dan nilai jawaban'}).click();await p.getByText('100',{exact:true}).first().waitFor();check('Kuis dari browser dinilai server');
    const proof=path.join(artifact,'bukti-uat.pdf');fs.writeFileSync(proof,'%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n',{mode:0o600});
    async function upload(){await p.goto(c.base_url+'/siswa/praktik/'+c.activities.practice);await p.getByLabel('Laporan dan refleksi praktik').fill('Pengujian UAT browser: bukti koneksi SSH virtual dan proses unggah privat melalui NPM.');await p.getByLabel('Berkas bukti',{exact:true}).setInputFiles(proof);await p.getByRole('button',{name:/Kirim bukti/}).click();await p.waitForURL('**/praktik/pengumpulan/*');return p.url();}
    let submissionUrl=await upload();await p.getByText('Menunggu penilaian',{exact:true}).waitFor();
    const evidenceUrl=await p.getByRole('link',{name:'Buka pratinjau tab baru',exact:true}).getAttribute('href');
    const inline=await p.context().request.get(evidenceUrl.replace(/\/lihat$/,'/pratinjau'));assert.equal(inline.status(),200);assert.deepEqual(fs.readFileSync(proof),await inline.body());check('Unggah dan pratinjau privat melalui NPM/PHP-FPM');
    const teacher=await account('teacher');const tp=teacher.p;check('Login guru melalui HTTPS publik');
    await tp.goto(submissionUrl);await tp.getByLabel('Keputusan',{exact:true}).selectOption('revision_requested');await tp.getByLabel('Nilai 0–100',{exact:true}).fill('60');await tp.getByLabel('Catatan guru (wajib)',{exact:true}).fill('UAT: tambahkan penjelasan dan kirim perbaikan.');await tp.getByRole('button',{name:'Simpan penilaian',exact:true}).click();await tp.getByRole('heading',{name:'Penilaian guru',exact:true}).waitFor();
    submissionUrl=await upload();await tp.goto(submissionUrl);await tp.getByLabel('Nilai 0–100',{exact:true}).fill('90');await tp.getByLabel('Catatan guru (wajib)',{exact:true}).fill('UAT: hasil lengkap dan disetujui.');await tp.getByRole('button',{name:'Simpan penilaian',exact:true}).click();await tp.getByRole('heading',{name:'Penilaian guru',exact:true}).waitFor();check('Revisi bukti dan persetujuan guru');
    await tp.goto(c.base_url+'/pengajaran/analitik');await tp.getByRole('heading',{name:'Analitik pembelajaran',exact:true}).waitFor();await tp.screenshot({path:path.join(artifact,'analytics.png'),fullPage:true});check('Halaman analitik guru');
    await tp.goto(c.base_url+'/pengajaran/praktik');const report=tp.waitForEvent('download');await tp.getByRole('link',{name:'Ekspor rekap praktik',exact:true}).click();const reportDl=await report;await reportDl.saveAs(path.join(artifact,'rekap-praktik.xlsx'));assert.equal(fs.readFileSync(path.join(artifact,'rekap-praktik.xlsx')).subarray(0,2).toString(),'PK');check('Ekspor praktik melalui browser');
    const outsider=await account('outsider');const deny=await outsider.p.goto(evidenceUrl);assert.equal(deny.status(),403);check('Bukti siswa lain ditolak HTTP 403');
    const mobile=await account('student',{width:390,height:844});await mobile.p.goto(c.base_url+'/siswa/progres');await mobile.p.getByRole('heading',{name:'Progres dan nilai saya'}).waitFor();assert(await mobile.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.p.screenshot({path:path.join(artifact,'mobile-progress.png'),fullPage:true});check('Progres mobile tanpa overflow halaman');
    await mobile.p.locator('#menu-toggle').click();await mobile.p.locator('#sidebar.show').waitFor();check('Sidebar mobile');
    await p.goto(c.base_url+'/siswa/progres');await p.screenshot({path:path.join(artifact,'student-progress.png'),fullPage:true});
    assert.deepEqual(errors,[]);check('Tidak ada exception JavaScript pada halaman uji');
    fs.writeFileSync(path.join(artifact,'result.json'),JSON.stringify({passed:checks,base_url:c.base_url,tag:c.tag,completed_at:new Date().toISOString()},null,2),{mode:0o600});
})().catch(async e=>{if(activePage){console.error('UI status:',await activePage.locator('#interactive-status').textContent().catch(()=>''));console.error('HTTP failures:',JSON.stringify(failedRequests));await activePage.screenshot({path:path.join(artifact,'failure.png'),fullPage:true});}fs.writeFileSync(path.join(artifact,'failure.json'),JSON.stringify({message:e.message,passed:checks,errors},null,2),{mode:0o600});console.error('FAIL '+e.message);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});

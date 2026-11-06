const fs=require('node:fs');const assert=require('node:assert/strict');
const {chromium}=require('/tmp/tjkt-browser-check/node_modules/playwright');
const c=JSON.parse(fs.readFileSync(process.argv[2]||'/tmp/tjkt-uat-visual-learning.json'));let browser,page;const errors=[],checks=[];
const pass=t=>{checks.push(t);console.log('PASS '+t);};
(async()=>{
 browser=await chromium.launch({headless:true});
 async function login(role){const ctx=await browser.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(c.base_url+'/login');await p.getByLabel('Username',{exact:true}).fill(c.accounts[role].username);await p.getByLabel('Password',{exact:true}).fill(c.accounts[role].password);await p.getByRole('button',{name:/^Masuk/}).click();await p.waitForURL('**/'+(role==='admin'?'admin':'siswa')+'/dashboard');return p;}
 page=await login('admin');
 await page.goto(c.base_url+'/pengajaran/modul');await page.locator('.journey-card').first().waitFor();pass('Katalog pengajar memakai kartu visual');
 await page.goto(c.base_url+'/pengajaran/modul/'+c.real_preview_module+'/preview');await page.locator('.lesson-visual img').waitFor();
 assert(await page.locator('.lesson-visual img').evaluate(i=>i.complete&&i.naturalWidth>0));assert.equal(await page.locator('[data-reading-tracker]').count(),0);pass('Pratinjau memakai ilustrasi nyata tanpa pelacakan siswa');
 assert.equal(await page.locator('.deep-reading').count(),0);assert(await page.locator('.lesson-reading').isVisible());await page.locator('.learning-content').getByRole('heading',{name:'Siapa yang memperbaiki Wi-Fi sekolah?',exact:true}).waitFor();pass('Pembahasan selalu terlihat tanpa panel lipat');
 await page.getByRole('link',{name:'Berikutnya →',exact:true}).first().click();await page.locator('[data-studio-lab=connection]').waitFor();await page.getByRole('button',{name:'Periksa konektor',exact:true}).click();await page.getByRole('button',{name:'Pasang ulang & uji',exact:true}).click();await page.locator('[data-network-feedback]').getByText(/Berhasil pada simulasi/).waitFor();pass('Latihan singkat memberi umpan balik tanpa menambah nilai');
 await page.getByRole('link',{name:'Berikutnya →',exact:true}).first().click();await page.getByRole('link',{name:'Berikutnya →',exact:true}).first().click();await page.locator('.role-card').first().locator('summary').click();assert(await page.locator('.role-card').first().getAttribute('open')!==null);pass('Kartu profesi dapat dieksplorasi');
 await page.screenshot({path:'/tmp/tjkt-visual-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'/tmp/tjkt-visual-mobile.png',fullPage:true});pass('Materi visual responsif pada 390px');
 if(process.env.TJKT_VISUAL_LAYOUT_ONLY==='1'){assert(await page.locator('.lesson-visual img').evaluate(i=>i.currentSrc.includes('-mobile.svg')&&i.complete&&i.naturalWidth>0));assert.deepEqual(errors,[]);fs.writeFileSync('/tmp/tjkt-visual-mobile-refresh.json',JSON.stringify({checks,mobile_svg:true},null,2),{mode:0o600});return;}

 const student=await login('student');page=student;
 await page.goto(c.base_url+'/siswa/materi');await page.locator('.journey-card').first().waitFor();pass('Katalog siswa memakai kartu visual');
 const [one,two,three]=c.sequence_sections;
 const url=id=>c.base_url+'/siswa/materi/'+c.module+'/submateri/'+id;
 let r=await page.goto(url(three));assert.equal(r.status(),403);pass('Tautan langsung langkah terkunci ditolak server');
 await page.goto(url(one));await page.getByRole('button',{name:'Saya sudah mempelajari bagian ini',exact:true}).click();await page.getByRole('link',{name:'Berikutnya →',exact:true}).first().click();await page.getByRole('heading',{name:'Langkah 2',exact:true}).waitFor();assert((await page.locator('main').textContent()).includes('✓'));const percent=Number(await page.locator('[role=progressbar]').getAttribute('aria-valuenow'));assert(percent>0);pass('Konfirmasi bacaan memberi centang, menambah progres, dan membuka langkah berikutnya');
 r=await page.goto(url(three));assert.equal(r.status(),403);pass('Langkah sesudah aktivitas wajib tetap terkunci');
 await page.goto(url(two));await page.getByRole('link',{name:'UAT matching',exact:true}).click();await page.getByRole('button',{name:/Mulai aktivitas/}).click();
 for(const [left,right] of [['SSH','TCP 22'],['HTTPS','TCP 443']])await page.getByLabel(left,{exact:true}).selectOption({label:right});
 await page.getByRole('button',{name:'Kirim dan nilai',exact:true}).click();await page.getByRole('heading',{name:/Lulus · Skor 100/}).waitFor();
 r=await page.goto(url(three));assert.equal(r.status(),200);pass('Kelulusan aktivitas wajib membuka langkah selanjutnya');
 assert.deepEqual(errors,[]);pass('Tidak ada exception JavaScript');
 fs.writeFileSync('/tmp/tjkt-visual-learning-result.json',JSON.stringify({checks,tag:c.tag,completed_at:new Date().toISOString()},null,2),{mode:0o600});
})().catch(async e=>{console.error(e.message);if(page)await page.screenshot({path:'/tmp/tjkt-visual-learning-failure.png',fullPage:true});process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});

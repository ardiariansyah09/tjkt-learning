const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('/tmp/tjkt-browser-check/node_modules/playwright');
const c=JSON.parse(fs.readFileSync(process.argv[2]));let browser;const errors=[],checks=[];
const pass=t=>{checks.push(t);console.log('PASS '+t);};
(async()=>{
 browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const p=await context.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));
 await p.goto(c.base_url+'/login');await p.getByLabel('Username',{exact:true}).fill(c.accounts.admin.username);await p.getByLabel('Password',{exact:true}).fill(c.accounts.admin.password);await p.getByRole('button',{name:/^Masuk/}).click();await p.waitForURL('**/admin/dashboard');
 const base=`${c.base_url}/pengajaran/modul/${c.real_preview_module}/preview`;
 await p.goto(base);await p.locator('.business-diagram').waitFor();const urls=await p.locator('a.path-step').evaluateAll(nodes=>nodes.map(n=>n.href));assert.equal(urls.length,14);assert((await p.locator('main').textContent()).includes('draft'));
 for(const url of urls){assert.equal((await p.goto(url)).status(),200);assert(await p.locator('.business-diagram').isVisible());assert(await p.locator('.lesson-reading').isVisible());assert.equal(await p.locator('[data-reading-tracker]').count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 pass('Keempat belas bagian draft menampilkan diagram dan pembahasan langsung tanpa pelacakan siswa');
 await p.goto(urls[6]);assert.equal(await p.locator('.studio-chart-bar').count(),2);assert.equal(await p.locator('[data-cost-total]').textContent(),'Rp100.000');assert((await p.locator('article').textContent()).includes('minus Rp5.000'));const csv=await p.request.get(c.base_url+'/assets/learning/usaha-tjkt/biaya-layanan.csv');assert.equal(csv.status(),200);assert((await csv.text()).includes('Waktu kerja jam,2,20000'));await p.screenshot({path:'/tmp/tjkt-business-cost-light.png',fullPage:true});pass('Grafik biaya dan lembar spreadsheet simulasi tersedia');
 await p.locator('[data-theme-toggle]').click();assert.equal(await p.locator('html').getAttribute('data-bs-theme'),'dark');await p.screenshot({path:'/tmp/tjkt-business-cost-dark.png',fullPage:true});
 for(const i of [0,1,3,4,5,6,8]){await p.goto(urls[i]+'&mode=student');await p.setViewportSize({width:390,height:844});assert(await p.locator('.business-diagram').isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('html').getAttribute('data-bs-theme'),'dark');}
 await p.screenshot({path:'/tmp/tjkt-business-mobile.png',fullPage:true});pass('Semua jenis diagram responsif pada 390px dan mengikuti tema gelap di pratinjau siswa');
 await p.goto(urls[10]);assert.equal(await p.locator('article').getByText('Pasangkan konsep layanan dan buktinya',{exact:true}).count(),1);assert.equal(await p.locator('article').getByText('Susun alur rancangan layanan',{exact:true}).count(),1);assert.equal(await p.locator('article').getByText('Pilah fakta asumsi dan batas izin',{exact:true}).count(),1);pass('Tiga latihan game tampil pada bagian arena layanan');
 await p.goto(urls[11]);assert((await p.locator('article').textContent()).includes('Rancangan layanan TJKT: kebutuhan biaya dan bukti revisi'));assert.deepEqual(errors,[]);pass('Kuis dan tugas praktik terpasang; tidak ada exception JavaScript');
 fs.writeFileSync('/tmp/tjkt-business-result.json',JSON.stringify({module:c.real_preview_module,checks,completed_at:new Date().toISOString()},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});

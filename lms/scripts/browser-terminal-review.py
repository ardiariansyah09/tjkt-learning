import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087'
ACCESS=json.loads((ROOT/'review-access.json').read_text());MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text());OUT=ROOT/'storage/app/review-artifacts'
TARGETS=['instalasi-komputer-dasar','konfigurasi-perangkat-dasar','dasar-administrasi-server','administrasi-linux-windows','manajemen-pengguna-server','layanan-server','keamanan-jaringan','ids-hardening','hosting-server','monitoring-jaringan']
async def login(page,role):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(ACCESS['users'][role]['username']);await page.locator('[name=password]').fill(ACCESS['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def lab(page,slug):
 entry=next(m for m in MANIFEST if m['id']==slug);mid=ACCESS['modules'][slug]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button');await page.locator('.lesson-nav>button').nth(next(i for i,s in enumerate(entry['stages']) if s['id']=='laboratorium')).click();await page.wait_for_selector('[data-terminal-lab]');return entry
async def main():
 result={'modules':[],'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);ctx=await browser.new_context(viewport={'width':1366,'height':900});page=await ctx.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));await login(page,'siswa')
  for slug in TARGETS:
   entry=await lab(page,slug);assert await page.locator('[data-terminal-lab]').count()==1
   assert await page.evaluate('Object.keys(JSON.parse(localStorage.getItem(TJKTLMS.key)).passed).length')==len(entry['stages']),slug
   assert await page.locator('body').get_by_text('TJKT Learning Hub',exact=True).count()==0
   await page.locator('[data-terminal-lab] [aria-label="Ketik command"]').fill('help');await page.locator('[data-terminal-lab] form button').click();assert 'Exit status model: 0' in await page.locator('[data-terminal-lab]').inner_text()
   result['modules'].append(slug)
  entry=await lab(page,'keamanan-jaringan');box=page.locator('[data-terminal-lab]');await box.locator('[aria-label="Aktivitas terminal"]').select_option('ufw');await box.get_by_role('button',name='Reset latihan ini',exact=True).click()
  for cmd in ['sudo ufw allow from 192.0.2.10 to any port 22 proto tcp','sudo ufw allow 80/tcp','sudo ufw default deny incoming','sudo ufw enable']:
   await box.locator('[aria-label="Ketik command"]').fill(cmd);await box.locator('form button').click()
  assert await box.locator('[data-terminal-goals]').evaluate('(n)=>[...n.children].every(c=>c.textContent.startsWith("\u2713"))')
  await box.get_by_role('button',name='Simpan ringkasan ke laporan',exact=True).click();await page.wait_for_timeout(2200);await page.wait_for_function('document.getElementById("lms-save-state").innerText.includes("tersimpan")')
  await page.reload();await page.wait_for_selector('.lesson-nav>button');await page.locator('.lesson-nav>button').nth(next(i for i,s in enumerate(entry['stages']) if s['id']=='laboratorium')).click();await page.wait_for_selector('[data-terminal-goals]')
  assert await page.locator('[data-terminal-goals]').evaluate('(n)=>[...n.children].every(c=>c.textContent.startsWith("\u2713"))')
  assert await page.evaluate('Object.keys(TJKTLMS.data).some(k=>k.includes(":terminal:ufw:linux:v1"))')
  result['databaseStateRestored']=True
  await page.set_viewport_size({'width':390,'height':844});assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2');result['mobile']=True
  await ctx.close();ctx=await browser.new_context();page=await ctx.new_page();await login(page,'guru');mid=ACCESS['modules']['keamanan-jaringan']['id'];student=ACCESS['users']['siswa']['id'];response=await page.goto(f'{BASE}/pengajaran/monitoring/{student}/{mid}');assert response.status==200
  assert 'Terminal: UFW: batasi SSH, pertahankan web (linux)' in await page.locator('body').text_content();result['teacherReportVisible']=True
  assert not result['errors'];result['result']='PASS';(OUT/'terminal-browser-review.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));await browser.close()
asyncio.run(main())

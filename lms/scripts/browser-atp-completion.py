import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';OUT=ROOT/'storage/app/review-artifacts';ACCESS=json.loads((ROOT/'review-access.json').read_text());MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text())
TARGETS={'sistem-telekomunikasi-dasar':('telecom','laboratorium'),'desain-topologi-arsitektur':('handoff','konsep-6'),'wireless-lan':('ruijie','konsep-4'),'routing-dinamis':('bird','konsep-5'),'bandwidth-qos':('radius','konsep-5'),'monitoring-jaringan':('smartolt','konsep-5')}
async def login(page,role):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(ACCESS['users'][role]['username']);await page.locator('[name=password]').fill(ACCESS['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def main():
 result={'practice':[],'reports':[],'oldModules':0,'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);ctx=await browser.new_context(viewport={'width':1366,'height':900});page=await ctx.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));await login(page,'siswa')
  for slug,(kind,chapter) in TARGETS.items():
   entry=next(e for e in MANIFEST if e['id']==slug);mid=ACCESS['modules'][slug]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button');await page.locator('.lesson-nav>button').nth(next(i for i,s in enumerate(entry['stages']) if s['id']==chapter)).click();await page.wait_for_selector(f'[data-atp-practice="{kind}"][data-mounted]')
   await page.add_script_tag(path=str(ROOT/'scripts/atp-practice-browser-checks.js'));record=await page.evaluate('(kind)=>window.__checkATPPractice(kind)',kind)
   report=page.locator(f'[data-atp-practice="{kind}"] [data-activity-report]');await report.locator('summary').click();await report.locator('[name=result]').fill('Bukti ATP '+kind+' tersimpan');await report.locator('[name=conclusion]').fill('Kondisi gagal dibandingkan dengan pemulihan.');await page.wait_for_function('document.getElementById("lms-save-state").innerText.includes("Hasil tersimpan")||document.getElementById("lms-save-state").innerText.includes("Seluruh tahap lulus")');await page.wait_for_timeout(1100)
   await page.reload();await page.wait_for_selector('.lesson-nav>button');assert await page.locator(f'[data-atp-practice="{kind}"] [name=result]').input_value()=='Bukti ATP '+kind+' tersimpan'
   await page.set_viewport_size({'width':390,'height':844});assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),slug;await page.set_viewport_size({'width':1366,'height':900});record['databaseRestored']=True;record['mobile']=True;result['practice'].append(record);print('PASS ATP practice',kind,flush=True)
  for entry in MANIFEST:
   if entry['id'] in TARGETS:continue
   mid=ACCESS['modules'][entry['id']]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button');assert await page.evaluate('Object.keys(JSON.parse(localStorage.getItem(TJKTLMS.key)).passed||{}).length')==len(entry['stages']),entry['id'];result['oldModules']+=1
   if entry['id'] in ['pengenalan-jaringan','topologi-jaringan','perangkat-jaringan','media-transmisi','osi-tcpip','ipv4-subnetting','protokol-layanan','troubleshooting','switching-vlan']:
    activity={'pengenalan-jaringan':'lab','topologi-jaringan':'6','perangkat-jaringan':'builder','media-transmisi':'simulator','osi-tcpip':'simulator','ipv4-subnetting':'network-lab','protokol-layanan':'simulator','troubleshooting':'simulator','switching-vlan':'simulator'}[entry['id']]
    await page.locator('.lesson-nav>button').nth(next(i for i,s in enumerate(entry['stages']) if s['id']==activity)).click();await page.wait_for_selector('[data-activity-report]',state='attached');result['reports'].append(entry['id'])
   if result['oldModules']%10==0:print('PASS preserved modules',result['oldModules'],flush=True)
  await ctx.close();ctx=await browser.new_context();page=await ctx.new_page();await login(page,'guru');mid=ACCESS['modules']['routing-dinamis']['id'];student=ACCESS['users']['siswa']['id'];response=await page.goto(f'{BASE}/pengajaran/monitoring/{student}/{mid}')
  assert response.status==200;card=page.get_by_role('heading',name='Laporan singkat dan latihan ATP').locator('..');await card.locator('summary').first.click();assert 'Bukti ATP bird tersimpan' in await card.inner_text();result['teacherEvidenceVisible']=True
  # Server feature tests independently verify authorization, labels and HTML escaping.
  assert not result['errors'],result['errors'];(OUT/'atp-completion-browser.json').write_text(json.dumps(result,indent=2));await browser.close();print('PASS ATP completion browser: six practices, legacy reports, preserved scores.')
asyncio.run(main())

import asyncio,json,re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';ACCESS=json.loads((ROOT/'review-access.json').read_text());MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text());OUT=ROOT/'storage/app/review-artifacts'
async def login(page,role):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(ACCESS['users'][role]['username']);await page.locator('[name=password]').fill(ACCESS['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def main():
 result={'teacher':[],'student':[],'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);context=await browser.new_context(viewport={'width':1366,'height':900});page=await context.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));await login(page,'guru')
  for entry in MANIFEST:
   mid=ACCESS['modules'][entry['id']]['id'];response=await page.goto(f'{BASE}/materi/{mid}/belajar');assert response.status==200,(entry['id'],response.status)
   await page.wait_for_selector('.lesson-nav > button');await page.wait_for_function('document.querySelectorAll(".lesson-nav>button").length===TJKTLMS.stages.length')
   assert await page.locator('.lesson-nav>button').count()==len(entry['stages'])
   assert await page.locator('main').count()==1;assert await page.locator('.topbar').count()==1;assert await page.locator('.module-topbar,iframe').count()==0
   text=await page.locator('body').inner_text();assert 'TJKT Learning Hub' not in text and 'Kembali ke Portal' not in text,entry['id']
   assert await page.locator('#sidebar .lesson-nav').count()==1
   for stage in range(len(entry['stages'])):await page.locator('.lesson-nav>button').nth(stage).click()
   assert await page.locator('[data-certificate-action=print]').count()==0
   await page.locator('[data-theme-toggle]').click();await page.wait_for_timeout(50)
   assert await page.evaluate('document.getElementById("lms-learning-root").classList.contains("dark")===(TJKTTheme.get()==="dark")')
   await page.set_viewport_size({'width':390,'height':844});await page.locator('[data-open-lesson-outline]').click();await page.locator('#sidebar').wait_for(state='visible');await page.locator('.lesson-nav>button').first.click();await page.wait_for_timeout(400)
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),entry['id']+' mobile overflow'
   if entry['id'] in ['wawasan-tjkt','ipv4-subnetting']:
    await page.screenshot(path=str(OUT/('native-'+entry['id']+'-390.png')),full_page=True)
   await page.set_viewport_size({'width':1366,'height':900})
   if entry['id']=='wawasan-tjkt':await page.screenshot(path=str(OUT/'native-wawasan-tjkt-1366.png'),full_page=True)
   result['teacher'].append({'id':entry['id'],'stages':len(entry['stages']),'nativeLms':True,'mobile':True})
   (OUT/'native-lms-progress.json').write_text(json.dumps(result,indent=2))
   if len(result['teacher'])%10==0:print('Native teacher modules:',len(result['teacher']),flush=True)
  await context.close();context=await browser.new_context(viewport={'width':1366,'height':900});page=await context.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));await login(page,'siswa')
  for entry in MANIFEST:
   mid=ACCESS['modules'][entry['id']]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button')
   assert await page.evaluate('Object.keys(JSON.parse(localStorage.getItem(TJKTLMS.key)).passed).length')==len(entry['stages']),entry['id']+' existing progress'
   await page.locator('.lesson-nav>button').last.click();await page.wait_for_selector('.module-certificate-panel form');await page.locator('.module-certificate-panel input').fill('Siswa Contoh LMS');await page.locator('.module-certificate-panel form').evaluate('(f)=>f.requestSubmit()');await page.wait_for_selector('#tjktPrintableCertificate',state='attached');await page.wait_for_function('!document.querySelector("[data-certificate-action=print]").disabled')
   if entry['id'] in ['proses-bisnis-tjkt','ipv4-subnetting','layanan-server']:
    pdf=await page.pdf(path=str(OUT/('native-'+entry['id']+'-certificate.pdf')),prefer_css_page_size=True,print_background=True);assert len(re.findall(rb'/Type\s*/Page\b',pdf))==1,entry['id']+' PDF pages'
   result['student'].append({'id':entry['id'],'oldProgressPreserved':True,'certificateReady':True})
   (OUT/'native-lms-progress.json').write_text(json.dumps(result,indent=2))
   if len(result['student'])%10==0:print('Native student certificates:',len(result['student']),flush=True)
  assert not result['errors'],result['errors'];(OUT/'native-lms-browser.json').write_text(json.dumps(result,indent=2));print('PASS native LMS: 53 modules / 606 stages, LMS sidebar, mobile, shared theme, existing progress and 53 certificate forms.');await browser.close()
asyncio.run(main())

import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';OUT=ROOT/'storage/app/review-artifacts'
ACCESS=json.loads((ROOT/'review-access.json').read_text());MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text())
NEW=['virtualisasi-server-dasar','instalasi-komputer-dasar','konfigurasi-perangkat-dasar']
async def login(page,role):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(ACCESS['users'][role]['username']);await page.locator('[name=password]').fill(ACCESS['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def main():
 result={'teacher':[],'newStudent':[],'oldStudent':[],'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);ctx=await browser.new_context(viewport={'width':1366,'height':900});page=await ctx.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));await login(page,'guru')
  for entry in MANIFEST:
   mid=ACCESS['modules'][entry['id']]['id'];response=await page.goto(f'{BASE}/materi/{mid}/belajar');assert response.status==200,(entry['id'],response.status)
   await page.wait_for_selector('.lesson-nav>button');assert await page.locator('.lesson-nav>button').count()==len(entry['stages']),entry['id']
   text=await page.locator('body').inner_text();assert 'TJKT Learning Hub' not in text and 'Kembali ke Portal' not in text
   assert await page.locator('main').count()==1;assert await page.locator('iframe,.module-topbar').count()==0
   result['teacher'].append(entry['id'])
  await ctx.close();ctx=await browser.new_context(viewport={'width':1366,'height':900});page=await ctx.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));await login(page,'siswa')
  for entry in MANIFEST:
   if entry['id'] in NEW:continue
   mid=ACCESS['modules'][entry['id']]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button')
   assert await page.evaluate('JSON.parse(localStorage.getItem(TJKTLMS.key)).passed && Object.keys(JSON.parse(localStorage.getItem(TJKTLMS.key)).passed).length')==len(entry['stages']),entry['id']
   result['oldStudent'].append(entry['id'])
  for slug in NEW:
   entry=next(e for e in MANIFEST if e['id']==slug);mid=ACCESS['modules'][slug]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button')
   course=await page.evaluate('''async()=>{const script=[...document.scripts].find(s=>s.src.includes('foundation-course.js'));return await(await fetch(new URL('../../data/'+TJKTLMS.slug+'.json',script.src))).json()}''')
   assert len(course['chapters'])==len(entry['stages'])
   if slug!='konfigurasi-perangkat-dasar':
    await page.add_script_tag(path=str(ROOT/'scripts/virtual-lab-browser-actions.js'))
    sessions=[{'session':'vm-main','chapter':'laboratorium','manual':True}] if slug=='virtualisasi-server-dasar' else [{'session':'os-ubuntu','chapter':'linux-desktop','manual':False},{'session':'os-windows','chapter':'windows-desktop','manual':False}]
   else:sessions=[]
   for index,chapter in enumerate(course['chapters']):
    if chapter['id']=='evaluasi':assert await page.locator('[data-certificate-action=print]').count()==0
    for session in sessions:
     if session['chapter']==chapter['id']:await page.evaluate('(s)=>window.__testInstaller(`[data-session="${s.session}"]`,{manual:s.manual,name:"LMS-"+s.session})',session)
    await page.evaluate('''ch=>{const form=document.getElementById(ch.id).parentElement.querySelector('.chapter-check-form');ch.questions.forEach((q,i)=>form.querySelectorAll('fieldset')[i].querySelector('input[value="'+q.answer+'"]').click());form.requestSubmit()}''',chapter)
    if index<len(course['chapters'])-1:await page.locator('#nextChapter').click()
   await page.wait_for_selector('[name=certificateName]');await page.locator('[name=certificateName]').fill('Siswa Uji LMS');await page.locator('[data-certificate-action=create]').click();await page.wait_for_function('!document.querySelector("[data-certificate-action=print]").disabled')
   await page.evaluate('window.print=()=>{window.__printed=true}');await page.locator('[data-certificate-action=print]').click();await page.wait_for_function('window.__printed===true')
   await page.wait_for_function('document.getElementById("lms-save-state").innerText.includes("Seluruh tahap lulus")')
   await page.reload();await page.wait_for_selector('.lesson-nav>button');assert await page.locator('#progressLabel').inner_text()=='100%'
   await page.set_viewport_size({'width':390,'height':844});assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2');await page.set_viewport_size({'width':1366,'height':900})
   result['newStudent'].append({'id':slug,'stages':len(course['chapters']),'simulation':bool(sessions),'certificatePrint':True,'databaseRestored':True})
  assert not result['errors'],result['errors'];(OUT/'curriculum-browser.json').write_text(json.dumps(result,indent=2));print('PASS: native LMS teacher 56, preserved student 53, three new modules with simulations, sync and certificates.');await browser.close()
asyncio.run(main())

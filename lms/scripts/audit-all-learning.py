import asyncio,json,re,os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';ACCESS=json.loads((ROOT/'review-access.json').read_text());MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text());OUT=ROOT/'storage/app/review-artifacts';TOOLS=ROOT/'scripts/audit-tools'
async def login(page,role):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(ACCESS['users'][role]['username']);await page.locator('[name=password]').fill(ACCESS['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def main():
 report_path=OUT/os.environ.get('AUDIT_FILE','audit-all-learning.json')
 report={'modules':[],'errors':[],'method':'fresh isolated review students; real assessment controls and game controls; no prefilled passed grades'}
 if os.environ.get('RESUME')=='1' and (OUT/'audit-all-learning.json').exists():report=json.loads((OUT/'audit-all-learning.json').read_text())
 recheck=[x for x in os.environ.get('RECHECK','').split(',') if x]
 if recheck:report['modules']=[m for m in report['modules'] if m['id'] not in recheck]
 pending=list(MANIFEST);ordered=[]
 while pending:
  ready=next((e for e in pending if all(p in [x['id'] for x in ordered] for p in e['prerequisites'])),None);assert ready,'Prerequisite cycle';ordered.append(ready);pending.remove(ready)
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);ctx=await browser.new_context(viewport={'width':1366,'height':900});page=await ctx.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)))
  async def route(request_route):
   file=TOOLS/Path(request_route.request.url.split('/__audit__/')[1]).name
   text=file.read_text();mid=await page.evaluate('TJKTLMS.module');prefix=f'{BASE}/paket/{mid}/files/'
   text=text.replace('../assets/js/',prefix+'assets/js/').replace('/tjkt-learning/',prefix)
   if file.name=='completion-checks.js':text="import {selectFinalQuestions} from '/assets/assessment-coverage.js';\n"+text.replace('bank.slice(0,10)','selectFinalQuestions(course.chapters,10)')
   await request_route.fulfill(status=200,body=text,content_type='text/javascript')
  await ctx.route('**/__audit__/*.js',route);await login(page,'siswa')
  for entry in ordered:
   if recheck and entry['id'] not in recheck:continue
   if any(m['id']==entry['id'] for m in report['modules']):continue
   mid=ACCESS['modules'][entry['id']]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button')
   await page.evaluate('''async()=>{window.auditCompletion=await import('/__audit__/completion-checks.js');window.auditStudio=await import('/__audit__/studio-checks.js');window.auditInstructions=await import('/__audit__/instruction-checks.js')}''')
   if await page.evaluate('auditCompletion.currentCompletion().missing.length')!=len(entry['stages']):
    await page.evaluate('localStorage.clear()');await page.wait_for_function('document.querySelector("#lms-save-state").textContent.includes("Hasil tersimpan ke akun")');await page.reload();await page.wait_for_selector('.lesson-nav>button');await page.evaluate('''async()=>{window.auditCompletion=await import('/__audit__/completion-checks.js');window.auditStudio=await import('/__audit__/studio-checks.js');window.auditInstructions=await import('/__audit__/instruction-checks.js')}''')
   assert await page.evaluate('auditCompletion.currentCompletion().missing.length')==len(entry['stages']),entry['id']+' not fresh'
   stages=[]
   for index,stage in enumerate(entry['stages']):
    await page.locator('.lesson-nav>button').nth(index).click();await page.wait_for_timeout(80)
    before=await page.evaluate('''()=>{const root=document.querySelector('.lesson-content'),active=root.querySelector('.chapter-unit:not([hidden])')||root;return {text:active.innerText,html:active.innerHTML,instructions:auditInstructions.checkActivityInstructions()}}''')
    simulation=await page.evaluate('auditStudio.checkTopicStage()')
    completed=await page.evaluate('(i)=>auditCompletion.completeCurrentStage(i)',index)
    stages.append({'id':stage['id'],'title':stage['title'],'text':before['text'],'instructions':before['instructions'],'simulation':simulation,'completion':completed})
   certificate=await page.evaluate('auditCompletion.buildAndPrintCertificate()')
   await page.wait_for_function('document.querySelector("#lms-save-state").textContent.includes("Seluruh tahap lulus")',timeout=20000)
   await page.reload();await page.wait_for_selector('.lesson-nav>button');assert await page.evaluate('Object.keys(JSON.parse(localStorage.getItem(TJKTLMS.key)).passed).length')==len(entry['stages'])
   row={'id':entry['id'],'stages':stages,'certificate':certificate,'databaseRestored':True};report['modules'].append(row);report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2));print('PASS full learning audit:',entry['id'],len(stages),'stages',flush=True)
  assert not report['errors'],report['errors'];print('COMPLETE audit:',len(report['modules']),'modules');await browser.close()
asyncio.run(main())

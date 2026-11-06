import asyncio,json,re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';OUT=ROOT/'storage/app/review-artifacts';ACCESS=json.loads((ROOT/'review-access.json').read_text());MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text())
async def login(page,role):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(ACCESS['users'][role]['username']);await page.locator('[name=password]').fill(ACCESS['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def main():
 result={'databaseProgress':[],'savedPractice':[],'teacherEvidenceVisible':False}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);ctx=await browser.new_context();page=await ctx.new_page();await login(page,'siswa')
  for entry in MANIFEST:
   mid=ACCESS['modules'][entry['id']]['id'];response=await page.request.get(f'{BASE}/materi/{mid}/belajar');assert response.status==200;html=await response.text();match=re.search(r'window\.TJKTLMS\s*=\s*(\{.*?\});',html,re.S);assert match,entry['id'];config=json.loads(match.group(1));data=config['data'];state=json.loads(data[config['key']]);assert len(state['passed'])==len(entry['stages']),entry['id'];result['databaseProgress'].append(entry['id'])
   for key,value in data.items():
    if ':atp-practice:' in key:
     lab=json.loads(value);assert len(lab['history'])>0;result['savedPractice'].append(lab['type'])
  assert set(result['savedPractice'])=={'telecom','handoff','ruijie','bird','radius','smartolt'}
  await ctx.close();ctx=await browser.new_context();page=await ctx.new_page();await login(page,'guru');mid=ACCESS['modules']['routing-dinamis']['id'];student=ACCESS['users']['siswa']['id'];response=await page.goto(f'{BASE}/pengajaran/monitoring/{student}/{mid}');assert response.status==200
  card=page.get_by_role('heading',name='Laporan singkat dan latihan ATP').locator('..');await card.locator('summary').first.click();assert 'Bukti ATP bird tersimpan' in await card.inner_text();assert 'Rute kernel' in await card.text_content() or 'Kernel FIB' in await card.text_content();result['teacherEvidenceVisible']=True
  result['result']='PASS';(OUT/'atp-completion-evidence.json').write_text(json.dumps(result,indent=2));print(json.dumps({'result':'PASS','preservedCompletionRecords':len(result['databaseProgress']),'savedPractice':result['savedPractice'],'teacherEvidenceVisible':True}));await browser.close()
asyncio.run(main())

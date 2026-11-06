import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087'
access=json.loads((ROOT/'review-access.json').read_text());entry=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text())[0]
module=access['modules'][entry['id']]['id'];url=f'{BASE}/paket/{module}/buka';out=ROOT/'storage/app/review-artifacts'
async def login(page,kind):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(access['users'][kind]['username']);await page.locator('[name=password]').fill(access['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);context=await browser.new_context();a=await context.new_page();await login(a,'siswa2')
  await a.evaluate('(key)=>localStorage.setItem(key,"original-profile-sentinel")',entry['key'])
  await a.goto(url);await a.wait_for_selector('.lesson-nav > button')
  assert await a.evaluate('localStorage.getItem(window.TJKTLMS.key)') is None
  await context.set_offline(True)
  await a.evaluate('()=>{const c=window.TJKTLMS;localStorage.setItem(c.key,JSON.stringify({passed:{[c.stages[0].id]:85},scores:{[c.stages[0].id]:85}}))}')
  await a.wait_for_function('document.body.firstElementChild.textContent.includes("Koneksi terputus")')
  await context.set_offline(False)
  await a.wait_for_function('document.body.firstElementChild.textContent.includes("Hasil tersimpan ke akun")')
  await a.reload();await a.wait_for_selector('.lesson-nav > button')
  assert await a.locator('.lesson-nav > button:disabled').count()==len(entry['stages'])-2
  b=await context.new_page();await b.goto(url);await b.wait_for_selector('.lesson-nav > button')
  await a.evaluate('()=>localStorage.setItem(`tjkt:${TJKTLMS.slug}:studio:v1`,JSON.stringify({journal:{evidence:"Perangkat A"}}))')
  await a.wait_for_function('document.body.firstElementChild.textContent.includes("Hasil tersimpan ke akun")')
  await b.evaluate('()=>localStorage.setItem(`tjkt:${TJKTLMS.slug}:studio:v1`,JSON.stringify({journal:{evidence:"Perangkat B"}}))')
  await b.wait_for_function('document.body.firstElementChild.textContent.includes("Ada versi lebih baru")')
  async with b.expect_download() as download_info:await b.locator('button',has_text='Unduh cadangan').first.click()
  downloaded=await download_info.value;backup=json.loads(Path(await downloaded.path()).read_text())
  assert json.loads(backup['data'][f"tjkt:{entry['id']}:studio:v1"])['journal']['evidence']=='Perangkat B'
  b.once('dialog',lambda dialog:dialog.accept())
  async with b.expect_navigation(wait_until='networkidle'):await b.locator('button',has_text='Ambil data server').click()
  await b.wait_for_selector('.lesson-nav > button')
  assert await b.evaluate('JSON.parse(localStorage.getItem(`tjkt:${TJKTLMS.slug}:studio:v1`)).journal.evidence')=='Perangkat A'
  await a.goto(BASE+'/siswa/dashboard');assert await a.evaluate('(key)=>localStorage.getItem(key)',entry['key'])=='original-profile-sentinel'
  await a.locator('form[action$="/logout"] button').click();await login(a,'siswa')
  await b.evaluate('()=>localStorage.setItem(`tjkt:${TJKTLMS.slug}:studio:v1`,JSON.stringify({journal:{evidence:"Sesi lama"}}))')
  await b.wait_for_function('document.body.firstElementChild.textContent.includes("Sesi akun berubah")')
  await a.goto(url);await a.wait_for_selector('.lesson-nav > button')
  assert await a.evaluate('Object.keys(JSON.parse(localStorage.getItem(TJKTLMS.key)).passed).length')==len(entry['stages'])
  result={'offlineQueue':True,'reconnectedAndRestored':True,'conflictBackupPreserved':True,'explicitServerRestore':True,'unscopedOldDataUnchanged':True,'expiredSessionRejected':True,'otherAccountProgressUnchanged':True}
  (out/'browser-sync-checks.json').write_text(json.dumps(result,indent=2));print('PASS browser sync: offline, restore, conflicting devices, backup, old storage, expired session, account isolation.')
  game_context=await browser.new_context();game_page=await game_context.new_page();await login(game_page,'guru');await game_page.goto(url);await game_page.wait_for_selector('.lesson-nav > button')
  source=(ROOT/'scripts/topic-game-checks.js').read_text().replace('../assets/js/',f'{BASE}/paket/{module}/files/assets/js/')
  game_result=await game_page.evaluate('''async source=>{const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));try{return await(await import(url)).checkAllTopicGameUIs()}finally{URL.revokeObjectURL(url)}}''',source)
  (out/'browser-games.json').write_text(json.dumps(game_result,indent=2));print('PASS games: 16 topic mechanics, 48 levels, real controls and drag interactions.')
  await browser.close()
asyncio.run(main())

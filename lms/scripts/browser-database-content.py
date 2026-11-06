import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
root=Path('/home/adminnazh/tjkt-lms-review-20261028');base='http://127.0.0.1:18087';access=json.loads((root/'review-access.json').read_text());manifest=json.loads((root/'storage/app/learning-pack/manifest.json').read_text())
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);context=await browser.new_context();page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(base+'/login');await page.locator('[name=username]').fill(access['users']['guru']['username']);await page.locator('[name=password]').fill(access['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
  for entry in manifest:
   response=await context.request.get(f"{base}/paket/{access['modules'][entry['id']]['id']}/buka")
   assert response.status==200,entry['id'];assert 'window.TJKTLMS=' in await response.text()
  samples=['proses-bisnis-tjkt','media-transmisi','pengenalan-jaringan','topologi-jaringan','perangkat-jaringan','ipv4-subnetting']
  for slug in samples:
   await page.goto(f"{base}/paket/{access['modules'][slug]['id']}/buka");await page.wait_for_selector('.lesson-nav > button');entry=next(e for e in manifest if e['id']==slug)
   assert await page.locator('.lesson-nav > button').count()==len(entry['stages']);await page.locator('.lesson-nav > button').last.click();assert await page.locator('.module-certificate-panel').count()==1
  assert not errors,errors
  (root/'storage/app/review-artifacts/database-content-browser.json').write_text(json.dumps({'modulesHttp':53,'sampleEnginesMounted':samples,'errors':errors},indent=2))
  print('PASS database-backed content: 53 authenticated module pages and 6 engine variants mounted without runtime errors.');await browser.close()
asyncio.run(main())

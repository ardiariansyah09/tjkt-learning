import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
root=Path('/home/adminnazh/tjkt-lms-review-20261028');access=json.loads((root/'review-access.json').read_text());base='http://127.0.0.1:18087';out=root/'storage/app/review-artifacts'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
  for role in ['guru','admin']:
   context=await browser.new_context();page=await context.new_page();await page.goto(base+'/login');await page.locator('[name=username]').fill(access['users'][role]['username']);await page.locator('[name=password]').fill(access['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
   for path,name in [(f'/{role}/dashboard',role+'-beranda'),('/pengajaran/monitoring',role+'-monitoring'),('/pengajaran/materi-kelas',role+'-materi-kelas')]:
    response=await page.goto(base+path);assert response.status==200,(path,response.status)
    for width in [1366,390]:
     await page.set_viewport_size({'width':width,'height':900});assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(path,width)
     await page.screenshot(path=str(out/(name+'-'+str(width)+'.png')),full_page=True)
   await context.close()
  await browser.close()
 print('PASS final visuals: teacher/admin home, monitoring and bulk class assignment, desktop/mobile.')
asyncio.run(main())

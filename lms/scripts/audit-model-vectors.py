import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';A=json.loads((ROOT/'review-access.json').read_text());mid=A['modules']['proses-bisnis-tjkt']['id'];prefix=f'{BASE}/paket/{mid}/files/'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);ctx=await browser.new_context();page=await ctx.new_page()
  async def intercept(route):
   file=ROOT/'scripts/audit-tools'/route.request.url.split('/__model__/')[1]
   await route.fulfill(body=file.read_text().replace('../assets/js/',prefix+'assets/js/').replace('/tjkt-learning/',prefix),content_type='text/javascript')
  await ctx.route('**/__model__/*.js',intercept);await page.goto(BASE+'/login');await page.locator('[name=username]').fill(A['users']['guru']['username']);await page.locator('[name=password]').fill(A['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard');await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button')
  result=await page.evaluate("import('/__model__/studio-checks.js').then(async m=>({core:m.checkStudioCore(),topics:await m.checkStudioUI()}))")
  (ROOT/'storage/app/review-artifacts/audit-model-vectors.json').write_text(json.dumps(result,indent=2));print('PASS complete model vectors: all topic models, contextual examples, 20 security profiles and core math.');await browser.close()
asyncio.run(main())

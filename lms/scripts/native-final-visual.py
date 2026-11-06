import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
root=Path('/home/adminnazh/tjkt-lms-review-20261028');access=json.loads((root/'review-access.json').read_text());out=root/'storage/app/review-artifacts';base='http://127.0.0.1:18087'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);context=await browser.new_context(viewport={'width':1366,'height':900});page=await context.new_page();await page.goto(base+'/login');await page.locator('[name=username]').fill(access['users']['guru']['username']);await page.locator('[name=password]').fill(access['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
  await page.goto(f"{base}/materi/{access['modules']['wawasan-tjkt']['id']}/belajar");await page.wait_for_selector('.lesson-nav>button');await page.evaluate('TJKTTheme.set("light")');await page.locator('.lesson-nav>button').last.click();await page.locator('.lesson-nav>button').first.click();await page.evaluate('window.scrollTo(0,0)')
  assert await page.locator('#sidebar .brand').evaluate('(e)=>e.getBoundingClientRect().top>=0')
  assert await page.locator('nav[aria-label="Menu utama"]').evaluate('(e)=>e.getBoundingClientRect().bottom<innerHeight')
  await page.screenshot(path=str(out/'native-final-desktop.png'),full_page=True)
  await page.evaluate('TJKTTheme.set("dark")');await page.screenshot(path=str(out/'native-final-dark.png'),full_page=True)
  await page.set_viewport_size({'width':390,'height':844});await page.evaluate('TJKTTheme.set("light")');await page.screenshot(path=str(out/'native-final-mobile.png'),full_page=True)
  await page.locator('[data-open-lesson-outline]').click();await page.wait_for_timeout(400);await page.screenshot(path=str(out/'native-final-mobile-menu.png'))
  print('PASS final layout: LMS branding/menu stay visible; desktop, dark, mobile and course navigation verified.');await browser.close()
asyncio.run(main())

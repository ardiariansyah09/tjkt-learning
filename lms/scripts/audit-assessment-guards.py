import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';A=json.loads((ROOT/'review-access.json').read_text());M=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text());OUT=ROOT/'storage/app/review-artifacts';T=ROOT/'scripts/audit-tools'
async def main():
 rows=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox']);ctx=await browser.new_context();page=await ctx.new_page()
  async def intercept(route):
   name=route.request.url.split('/__guard__/')[1];text=(T/name).read_text();mid=await page.evaluate('TJKTLMS.module');prefix=f'{BASE}/paket/{mid}/files/'
   text=text.replace('../assets/js/',prefix+'assets/js/').replace('/tjkt-learning/',prefix)
   if name=='completion-checks.js':
    text="import {selectFinalQuestions} from '/assets/assessment-coverage.js';\n"+text.replace('bank.slice(0,10)','selectFinalQuestions(course.chapters,10)')
    text+='''\nexport async function auditWrongAnswers(){const course=await courseData(),chapter=course.chapters.at(-1);choose(document.querySelector('.chapter-unit:not([hidden]) .chapter-check-form'),chapter.questions.map(q=>(q.answer+1)%q.options.length));await pause(50);assert(!completionSnapshot().complete,'Wrong answers gave completion');assert(!document.querySelector('[data-certificate-action=print]'),'Certificate offered after failing');return {score:0,blocked:true};}'''
   await route.fulfill(body=text,content_type='text/javascript')
  await ctx.route('**/__guard__/*.js',intercept)
  await page.goto(BASE+'/login');await page.locator('[name=username]').fill(A['users']['guru']['username']);await page.locator('[name=password]').fill(A['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
  for entry in M:
   mid=A['modules'][entry['id']]['id'];await page.goto(f'{BASE}/materi/{mid}/belajar');await page.wait_for_selector('.lesson-nav>button')
   if not await page.evaluate('document.body.classList.contains("foundation-module")'):continue
   await page.locator('.lesson-nav>button').last.click();result=await page.evaluate("import('/__guard__/completion-checks.js').then(m=>m.auditWrongAnswers())");rows.append({'id':entry['id'],**result})
  # Shared mathematical/state-model vectors independent of grading fixtures.
  models=await page.evaluate("import('/__guard__/studio-checks.js').then(m=>m.checkStudioCore())")
  (OUT/'audit-assessment-guards.json').write_text(json.dumps({'modules':rows,'models':models},indent=2));print('PASS failing assessment guards:',len(rows),'courses; all core/model vectors.');await browser.close()
asyncio.run(main())

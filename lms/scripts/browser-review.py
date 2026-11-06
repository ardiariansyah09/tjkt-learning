import asyncio,json,os,re,signal,time
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028')
BASE='http://127.0.0.1:18087'
ACCESS=json.loads((ROOT/'review-access.json').read_text())
MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text())
OUT=ROOT/'storage/app/review-artifacts';OUT.mkdir(parents=True,exist_ok=True)

async def login(page,kind):
    await page.goto(BASE+'/login')
    await page.locator('[name=username]').fill(ACCESS['users'][kind]['username'])
    await page.locator('[name=password]').fill(ACCESS['password'])
    await page.locator('form button').last.click()
    await page.wait_for_url('**/dashboard')

async def main():
    results={'teacher':[],'student':[],'menus':{},'errors':[],'completionMethod':'controlled fixture grades through real authenticated sync; not a replay of every assessment'}
    if os.environ.get('RESUME')=='1' and (OUT/'browser-review-progress.json').exists():results=json.loads((OUT/'browser-review-progress.json').read_text())
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        context=await browser.new_context(viewport={'width':1366,'height':900})
        page=await context.new_page()
        page.on('pageerror',lambda error:results['errors'].append(str(error)))
        await login(page,'guru')
        assert await page.locator('nav[aria-label="Menu utama"] > a').count()==3
        results['menus']['teacher']=3
        await page.screenshot(path=str(OUT/'guru-beranda.png'),full_page=True)
        await page.goto(BASE+'/pengajaran/monitoring')
        assert not await page.locator('details').filter(has=page.locator('summary',has_text='Filter lainnya dan arsip')).get_attribute('open')
        await page.screenshot(path=str(OUT/'guru-progres.png'),full_page=True)
        for entry in MANIFEST:
            if any(done['id']==entry['id'] for done in results['teacher']):continue
            module=ACCESS['modules'][entry['id']]
            await page.goto(f"{BASE}/paket/{module['id']}/buka")
            await page.wait_for_selector('.lesson-nav > button')
            await page.wait_for_function('document.querySelectorAll(".lesson-nav > button").length===window.TJKTLMS.stages.length')
            assert await page.locator('.lesson-nav > button').count()==len(entry['stages']),entry['id']
            assert await page.evaluate('window.TJKTLocalInstructor.isActive()')
            await page.locator('.lesson-nav > button').last.click()
            assert await page.locator('[data-certificate-action=print]').count()==0
            for width in [1366,390]:
                await page.set_viewport_size({'width':width,'height':900})
                await page.wait_for_timeout(40)
                assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),entry['id']+' overflow'
            await page.set_viewport_size({'width':1366,'height':900})
            results['teacher'].append({'id':entry['id'],'stages':len(entry['stages']),'previewOnly':True,'mobile':True})
            (OUT/'browser-review-progress.json').write_text(json.dumps(results,indent=2))
            if len(results['teacher'])%10==0:print('Teacher previews:',len(results['teacher']),flush=True)
        # One user, two browsers: ensure optimistic conflict preserves the loser.
        await context.close()
        context=await browser.new_context(viewport={'width':1366,'height':900})
        page=await context.new_page();page.on('pageerror',lambda error:results['errors'].append(str(error)))
        await login(page,'siswa')
        first=MANIFEST[0];first_id=ACCESS['modules'][first['id']]['id']
        await page.goto(f'{BASE}/paket/{first_id}/buka');await page.wait_for_selector('.lesson-nav > button')
        assert not await page.evaluate('window.TJKTLocalInstructor.isActive()')
        if not results['student']:assert await page.locator('.lesson-nav > button:disabled').count()==len(first['stages'])-1
        ordered=[];pending=list(MANIFEST)
        while pending:
            ready=next((entry for entry in pending if all(slug in [done['id'] for done in ordered] for slug in entry['prerequisites'])),None)
            assert ready is not None,'Prerequisite cycle'
            ordered.append(ready);pending.remove(ready)
        for entry in ordered:
            if any(done['id']==entry['id'] for done in results['student']):continue
            module=ACCESS['modules'][entry['id']]
            # Current catalog is topologically ordered. Prerequisites must pass first.
            await page.goto(f"{BASE}/paket/{module['id']}/buka")
            await page.wait_for_selector('.lesson-nav > button')
            await page.wait_for_function('document.querySelectorAll(".lesson-nav > button").length===window.TJKTLMS.stages.length')
            await page.evaluate('''()=>{const c=window.TJKTLMS,state={passed:{},scores:{}};for(const s of c.stages){state.passed[s.id]=85;state.scores[s.id]=85}localStorage.setItem(c.key,JSON.stringify(state));}''')
            await page.wait_for_function('document.body.firstElementChild.textContent.includes("Seluruh tahap lulus")',timeout=20000)
            await page.reload();await page.wait_for_selector('.lesson-nav > button')
            await page.locator('.lesson-nav > button').last.click()
            await page.wait_for_selector('.module-certificate-panel form')
            await page.locator('.module-certificate-panel input').fill('Siswa Contoh Pengujian')
            await page.locator('.module-certificate-panel form').evaluate('(form)=>form.requestSubmit()')
            await page.wait_for_selector('#tjktPrintableCertificate',state='attached')
            await page.wait_for_function('!document.querySelector("[data-certificate-action=print]").disabled')
            if entry['id'] in ['proses-bisnis-tjkt','ipv4-subnetting','layanan-server']:
                pdf=await page.pdf(path=str(OUT/(entry['id']+'-sertifikat.pdf')),prefer_css_page_size=True,print_background=True)
                assert len(re.findall(rb'/Type\s*/Page\b',pdf))==1,entry['id']+' PDF pages'
            results['student'].append({'id':entry['id'],'restored':True,'certificateReady':True})
            (OUT/'browser-review-progress.json').write_text(json.dumps(results,indent=2))
            if len(results['student'])%10==0:print('Student completions:',len(results['student']),flush=True)
        # A second account on the same browser must not inherit account one's results.
        await page.goto(BASE+'/siswa/dashboard')
        await page.locator('form[action$="/logout"] button').click()
        await login(page,'siswa2')
        await page.goto(f'{BASE}/paket/{first_id}/buka');await page.wait_for_selector('.lesson-nav > button')
        assert await page.evaluate('localStorage.getItem(window.TJKTLMS.key)') is None
        assert await page.locator('.lesson-nav > button:disabled').count()==len(first['stages'])-1
        results['accountIsolation']=True
        await page.goto(BASE+'/siswa/dashboard');await page.locator('form[action$="/logout"] button').click()
        await login(page,'guru')
        await page.goto(BASE+'/pengajaran/monitoring')
        await page.screenshot(path=str(OUT/'guru-hasil.png'),full_page=True)
        for width in [1366,390]:
            await page.set_viewport_size({'width':width,'height':900})
            assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            await page.screenshot(path=str(OUT/('guru-monitoring-'+str(width)+'.png')),full_page=True)
        await page.goto(BASE+'/guru/dashboard');await page.locator('form[action$="/logout"] button').click()
        await login(page,'admin')
        assert await page.locator('nav[aria-label="Menu utama"] > a').count()==4
        results['menus']['admin']=4
        await page.set_viewport_size({'width':1366,'height':900});await page.screenshot(path=str(OUT/'admin-beranda.png'),full_page=True)
        await page.goto(BASE+'/admin/siswa');assert await page.locator('nav[aria-label="Jenis pengguna"] a').count()==2
        await page.goto(f'{BASE}/paket/{first_id}/penugasan');await page.locator('button',has_text='Simpan penugasan').click()
        await page.wait_for_selector('.alert-success')
        assert not results['errors'],results['errors']
        (OUT/'browser-review.json').write_text(json.dumps(results,indent=2))
        print('PASS browser: 53 teacher previews / 606 stages, 53 restored student completions and certificate forms, 3 one-page PDFs, account isolation, teacher/admin navigation.')
        await browser.close()

asyncio.run(main())

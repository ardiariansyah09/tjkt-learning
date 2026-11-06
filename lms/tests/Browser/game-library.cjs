const fs = require('node:fs');
const assert = require('node:assert/strict');
const {chromium} = require('/tmp/tjkt-browser-check/node_modules/playwright');
const file = process.argv[2];
if (!file?.startsWith('/tmp/tjkt-uat-')) throw Error('Private isolated UAT context required');
const c = JSON.parse(fs.readFileSync(file));
let browser, page;
const errors = [], checks = [];
const pass = message => { checks.push(message); console.log('PASS '+message); };
(async () => {
    browser = await chromium.launch({headless:true});
    const context = await browser.newContext({viewport:{width:1366,height:900}});
    page = await context.newPage(); page.setDefaultTimeout(20000);
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    await page.goto(c.base_url+'/login');
    await page.getByLabel('Username',{exact:true}).fill(c.accounts.teacher.username);
    await page.getByLabel('Password',{exact:true}).fill(c.accounts.teacher.password);
    await page.getByRole('button',{name:/^Masuk/}).click(); await page.waitForURL('**/guru/dashboard');
    const list = c.base_url+'/pengajaran/modul/'+c.module+'/aktivitas';
    const previews = {};
    for (const template of ['matching','drag_drop','sorting','memory','categorize','word_search','maze','sudoku']) {
        await page.goto(list+'/create');
        await page.getByLabel('Judul aktivitas',{exact:true}).fill('UAT library '+template);
        await page.locator('#kind').selectOption('game');
        await page.locator('[data-template="'+template+'"]').click();
        await page.locator('#template-example').click();
        assert.equal(await page.locator('[data-template][aria-pressed=true]').count(),1);
        // Structured row input is synchronized into the versioned definition.
        const row = page.locator('#game_items').locator('xpath=preceding-sibling::div[2]').locator('input').first();
        const first = await row.inputValue(); await row.fill(first+' '); await row.fill(first);
        await page.getByRole('button',{name:'Simpan aktivitas dan versi',exact:true}).click();
        await page.waitForURL(list);
        assert.equal(await page.locator('h1').textContent(),'Aktivitas pembelajaran');
        const tr = page.locator('tr').filter({hasText:'UAT library '+template});
        const href = await tr.getByRole('link',{name:'Pratinjau',exact:true}).getAttribute('href');
        previews[template] = href;
        await page.goto(href); await page.locator('#interactive-engine').waitFor();
        assert(await page.locator('#interactive-engine').textContent());
        assert.equal(await page.locator('#interactive-app').count(),1);
        pass(template+' dipilih, dikonfigurasi, disimpan, dan tampil dalam pratinjau');
    }
    async function action(fn) {
        const wait = page.waitForResponse(r => r.request().method()==='POST' && r.url().includes('/pratinjau'));
        await fn(); const response = await wait;
        if (response.status() !== 200) throw Error('Preview action HTTP '+response.status()+': '+await response.text());
        return response.json();
    }
    await page.goto(previews.memory);
    await action(() => page.getByRole('button',{name:'Kartu 1',exact:true}).click());
    assert.equal(await page.getByRole('button',{name:'Kartu 1',exact:true}).count(),0);
    await action(() => page.getByRole('button',{name:'Kartu 2',exact:true}).click());
    await action(() => page.getByRole('button',{name:'Periksa checkpoint',exact:true}).click());
    pass('Kartu memori membuka kartu dan memeriksa progres melalui server');
    await page.goto(previews.categorize);
    await action(() => page.getByLabel('Router',{exact:true}).selectOption('Perangkat'));
    assert.equal(await page.getByLabel('Router',{exact:true}).inputValue(),'Perangkat');
    pass('Kategori tersimpan dan dipulihkan pada tampilan');
    await page.goto(previews.word_search);
    const endpoints = await page.evaluate(() => {
        const c=window.tjktInteractive.config;
        for (let row=0;row<12;row++) {
            const text=c.grid.slice(row*12,row*12+12).join('');
            const word=c.items[0].label;
            for(const value of [word,[...word].reverse().join('')]) {
                const col=text.indexOf(value); if(col>=0)return [row*12+col,row*12+col+word.length-1];
            }
        }
        throw Error('Word not found');
    });
    const letters=page.locator('#interactive-engine button');
    await letters.nth(endpoints[0]).click();
    await action(() => letters.nth(endpoints[1]).click());
    assert((await page.locator('#interactive-engine ul').textContent()).includes('✓'));
    pass('Cari kata menerima koordinat nyata dari papan');
    await page.goto(previews.maze);
    for(let i=0;i<8;i++) await action(() => page.getByRole('button',{name:'right',exact:true}).click());
    await action(() => page.getByRole('button',{name:'down',exact:true}).click());
    await page.getByRole('heading',{name:'Port default SSH?',exact:true}).waitFor();
    await action(() => page.getByRole('button',{name:'22',exact:true}).click());
    assert((await page.locator('#interactive-engine').textContent()).includes('Pos selesai: 1/3'));
    pass('Labirin 2D bergerak dan menyelesaikan pertanyaan pos');
    await page.goto(previews.sudoku);
    const select=page.locator('#interactive-engine select').first();
    await action(() => select.selectOption('1'));
    assert.equal(await page.locator('#interactive-engine select').first().inputValue(),'1');
    await action(() => page.getByRole('button',{name:'Kirim dan nilai',exact:true}).click());
    await page.locator('#interactive-feedback').getByText(/Skor:/).waitFor();
    pass('Sudoku menerima simbol dan tombol kirim menilai pratinjau tanpa menutup percobaan siswa');
    await page.setViewportSize({width:390,height:844});
    for(const template of ['memory','word_search','maze','sudoku']) {
        await page.goto(previews[template]); await page.locator('#interactive-engine').waitFor();
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),template+' mobile overflow');
    }
    pass('Empat papan game tampil tanpa overflow pada layar 390px');
    assert.deepEqual(errors,[]); pass('Tidak ada exception JavaScript');
    fs.writeFileSync('/tmp/tjkt-uat-game-library-result.json',JSON.stringify({checks,tag:c.tag,time:new Date().toISOString()},null,2),{mode:0o600});
})().catch(async e => { console.error(e); if(page) { console.error('Status:',await page.locator('#interactive-status').textContent().catch(()=>'')); await page.screenshot({path:'/tmp/tjkt-uat-game-library-failure.png',fullPage:true}); } process.exitCode=1; }).finally(async()=>{if(browser) await browser.close();});

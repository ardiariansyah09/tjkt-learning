import asyncio,json,secrets
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');BASE='http://127.0.0.1:18087';ACCESS=json.loads((ROOT/'review-access.json').read_text());MANIFEST=json.loads((ROOT/'storage/app/learning-pack/manifest.json').read_text());OUT=ROOT/'storage/app/review-artifacts'
PHOTO=ROOT/'storage/app/learning-pack/releases'/MANIFEST[0]['contentVersion']/'site/assets/images/tjkt-wikrama-logo.png'
async def login(page,role):
 await page.goto(BASE+'/login');await page.locator('[name=username]').fill(ACCESS['users'][role]['username']);await page.locator('[name=password]').fill(ACCESS['password']);await page.locator('form button').last.click();await page.wait_for_url('**/dashboard')
async def change_password(page,current,new):
 await page.goto(BASE+'/ganti-password');await page.locator('[name=current_password]').fill(current);await page.locator('[name=password]').fill(new);await page.locator('[name=password_confirmation]').fill(new);await page.locator('button',has_text='Simpan password').click();await page.wait_for_url('**/dashboard')
async def main():
 result={'roles':[],'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
  for role in ['admin','guru','siswa']:
   context=await browser.new_context(viewport={'width':1366,'height':900});page=await context.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));await login(page,role)
   assert not await page.locator('.account-dropdown').is_visible();assert not await page.locator('.topbar form[action$="/logout"]').is_visible()
   await page.locator('#accountMenu').click();await page.locator('.account-dropdown.show').wait_for();await page.locator('.account-dropdown a',has_text='Edit profil').click();await page.wait_for_url('**/profil')
   name='Contoh '+role.capitalize()+' Profil';await page.locator('[name=name]').fill(name);await page.locator('[name=email]').fill('review-profile-'+role+'@example.test');await page.locator('[name=photo]').set_input_files(str(PHOTO));await page.locator('button',has_text='Simpan profil').click();await page.wait_for_selector('.alert-success')
   assert await page.locator('[name=name]').input_value()==name;await page.wait_for_function('document.querySelector("#accountMenu img")?.complete&&document.querySelector("#accountMenu img").naturalWidth===256')
   await page.locator('#accountMenu').focus();await page.keyboard.press('Enter');await page.locator('.account-dropdown.show').wait_for();await page.keyboard.press('Escape');assert not await page.locator('.account-dropdown').is_visible()
   await page.locator('#accountMenu').click();await page.locator('.account-dropdown a',has_text='Ganti password').click();await page.wait_for_url('**/ganti-password');assert await page.locator('#sidebar').count()==1
   temporary='ReviewPhoto-2026-'+secrets.token_hex(5)
   await change_password(page,ACCESS['password'],temporary)
   try:await change_password(page,temporary,ACCESS['password'])
   except Exception:
    # Do not print or transfer credentials; retain recovery only on this server.
    (ROOT/('review-recovery-'+role+'.json')).write_text(json.dumps({'password':temporary}));(ROOT/('review-recovery-'+role+'.json')).chmod(0o600);raise
   for width in [1366,390]:
    await page.set_viewport_size({'width':width,'height':844});await page.locator('#accountMenu').click();await page.locator('.account-dropdown.show').wait_for();assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
    if role=='admin':await page.screenshot(path=str(OUT/('account-menu-'+str(width)+'.png')))
    await page.keyboard.press('Escape')
   await page.goto(BASE+'/profil');await page.set_viewport_size({'width':390,'height':844});assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   if role=='admin':await page.screenshot(path=str(OUT/'edit-profile-mobile.png'),full_page=True)
   await page.locator('#accountMenu').click();await page.locator('.account-dropdown button',has_text='Keluar').click();await page.wait_for_url('**/login')
   result['roles'].append({'role':role,'menu':True,'profileSaved':True,'photoUploaded':True,'passwordChangedAndRestored':True,'logout':True,'mobile':True});await context.close()
  assert not result['errors'],result['errors'];(OUT/'account-profile-browser.json').write_text(json.dumps(result,indent=2));print('PASS profile: admin, teacher and student; account menu, private photo, profile, password, keyboard, mobile and logout.');await browser.close()
asyncio.run(main())

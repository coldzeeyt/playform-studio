import os,subprocess,tempfile
from playwright.sync_api import sync_playwright,expect
server=subprocess.Popen(['node','scripts/serve.mjs'],env={**os.environ,'PORT':'14351'},stdout=subprocess.DEVNULL)
URL='http://127.0.0.1:14351'
saved=lambda page:page.evaluate('JSON.parse(localStorage.getItem("playform.projects"))')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);errors=[]
  c=browser.new_context(viewport={'width':1440,'height':900},accept_downloads=True);page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(URL);expect(page.get_by_role('heading',name='Make any game. Or an app.')).to_be_visible()
  expect(page.locator('.app-starts .quick-start')).to_have_count(4)
  # Create a to-do app from the home tile
  page.locator('.quick-start[data-create="app-todo"]').click();page.locator('#project-name').fill('Chores');page.get_by_role('button',name='Create project').click()
  expect(page.locator('.appb')).to_be_visible();expect(page.locator('.appb-screen .pfa-c')).to_have_count(4)
  page.wait_for_timeout(400);assert saved(page)[0]['kind']=='app'
  # Play: add a task, tick one off
  page.locator('[data-play]').click();page.locator('.appb-screen .pfa-field input').fill('Water plants');page.locator('.appb-screen .pfa-btn').click()
  expect(page.locator('.appb-screen .pfa-list li')).to_have_count(4);expect(page.locator('.appb-screen .pfa-num')).to_have_text('4')
  page.locator('.appb-screen .pfa-x').first.click();expect(page.locator('.appb-screen .pfa-num')).to_have_text('3')
  page.locator('[data-play]').click();expect(page.locator('.appb-screen .pfa-num')).to_have_text('3')
  # Click to add, edit, undo/redo
  page.locator('[data-add="heading"]').click();expect(page.locator('.appb-screen .pfa-c')).to_have_count(5)
  page.locator('.appb-right .appb-field textarea, .appb-right .appb-field input').first.fill('Weekend list');expect(page.locator('.appb-screen .pfa-heading').last).to_have_text('Weekend list')
  page.locator('.appb-stagebar').click();page.keyboard.press('Control+z');page.keyboard.press('Control+z');expect(page.locator('.appb-screen .pfa-c')).to_have_count(4)
  page.keyboard.press('Control+Shift+z');expect(page.locator('.appb-screen .pfa-c')).to_have_count(5)
  # Drag a component from the palette onto the top of the phone
  page.locator('[data-add="divider"]').drag_to(page.locator('.appb-screen .pfa-c').first,target_position={'x':20,'y':4})
  assert page.locator('.appb-screen .pfa-c').first.get_attribute('class').startswith('pfa-c pfa-divider')
  # Select, delete with keyboard
  page.locator('.appb-screen .pfa-divider').click();page.keyboard.press('Delete');expect(page.locator('.appb-screen .pfa-divider')).to_have_count(0)
  # New screen + navigation button
  page.locator('[data-add-screen]').click();expect(page.locator('.appb-screen-row')).to_have_count(2)
  page.locator('.appb-screen-row').first.click();page.locator('[data-add="button"]').click()
  page.locator('.appb-right select').last.select_option('navigate');page.locator('.appb-right select').last.select_option(index=1)
  page.locator('[data-play]').click();page.locator('.appb-screen .pfa-btn').last.click();expect(page.locator('.appb-screen .pfa-bar b')).to_have_text('Screen 2')
  page.locator('.appb-screen .pfa-back').click();expect(page.locator('.appb-screen .pfa-bar b')).to_have_text('Today');page.locator('[data-play]').click()
  # Persistence after reload
  page.wait_for_timeout(400);page.reload();expect(page.locator('.project-row .project-icon')).to_have_text('App');page.locator('.project-open').click()
  expect(page.locator('.appb-screen-row')).to_have_count(2)
  # Export a standalone web app and run it
  page.locator('.appb-menu summary').click()
  with page.expect_download() as d:page.locator('[data-export-html]').click()
  path=os.path.join(tempfile.mkdtemp(),'app.html');d.value.save_as(path)
  ex=c.new_page();ex.on('pageerror',lambda e:errors.append('export: '+str(e)));ex.goto('file://'+path)
  ex.locator('.pfa-field input').fill('Fold laundry');ex.locator('.pfa-btn').first.click();expect(ex.locator('.pfa-num')).to_have_text('4')
  # Event template: tabs, switches and {{Name}} text
  page.locator('[data-home]').click();page.locator('.quick-start[data-create="app-event"]').click();page.locator('#project-name').fill('Jam');page.get_by_role('button',name='Create project').click()
  page.locator('[data-play]').click();page.locator('.appb-screen .pfa-tabs button',has_text='RSVP').click();page.locator('.appb-screen .pfa-field input').fill('Robin')
  page.locator('.appb-screen .pfa-switch').click();page.locator('.appb-screen .pfa-btn').click();expect(page.locator('.appb-screen .pfa-h')).to_have_text('See you there, Robin!')
  c.close()
  # Phone layout
  m=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);mp=m.new_page();mp.on('pageerror',lambda e:errors.append(str(e)));mp.goto(URL)
  mp.evaluate('''async()=>{const{createApp}=await import('/app-project.js');localStorage.setItem('playform.projects',JSON.stringify([createApp('Phone','app-links')]))}''');mp.reload();mp.locator('.project-open').click()
  expect(mp.locator('.appb-phone')).to_be_visible();mp.locator('[data-pane-btn="build"]').click();expect(mp.locator('.appb-palette')).to_be_visible();expect(mp.locator('.appb-phone')).to_be_hidden()
  mp.locator('[data-add="card"]').click();expect(mp.locator('.appb-phone')).to_be_visible();mp.locator('[data-pane-btn="props"]').click();expect(mp.locator('.appb-props-head h2')).to_contain_text('Card')
  assert mp.evaluate('document.documentElement.scrollWidth<=innerWidth');m.close()
  assert not errors,errors;browser.close();print('PASS app builder: templates, play, add/edit/undo, drag, screens, navigation, persistence, HTML export, phone layout',flush=True)
finally:server.terminate();server.wait()

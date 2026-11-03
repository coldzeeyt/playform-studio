import json,math,os,subprocess,time,sys
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE='http://127.0.0.1:14335'
server=subprocess.Popen(['node','scripts/serve.mjs'],env={**os.environ,'PORT':'14335'},stdout=subprocess.DEVNULL)
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def start(template,debug=False):
   context=browser.new_context(viewport={'width':1440,'height':960});page=context.new_page();page.set_default_timeout(7000);page.errors=[];page.on('pageerror',lambda e:page.errors.append(str(e)));page.goto(BASE)
   if not debug:
    page.locator(f'[data-play-template="{template}"]').click();expect(page.locator('.game-player-only')).to_be_visible()
   else:
    page.evaluate('''async t=>{const{createProject,templates}=await import('/project.js');localStorage.setItem('playform.projects',JSON.stringify([createProject(templates[t],t)]))}''',template);page.reload();page.locator('.project-open').click();page.locator('.editor-commandbar [data-action="play"]').first.click();page.locator('[data-bottom="Debug"]').click()
   if page.locator('.game-title-screen').is_visible():page.locator('.title-play').click()
   if debug:page.locator('[data-bottom="Debug"]').click()
   page.wait_for_timeout(150)
   return context,page
  def point(page,x,y):
   box=page.locator('canvas').bounding_box();scale=min(box['width']/960,box['height']/540);return box['x']+(box['width']-960*scale)/2+x*scale,box['y']+(box['height']-540*scale)/2+y*scale
  def value(page,name,field):return float(page.locator(f'[data-watch="{name}"] [data-field="{field}"]').inner_text())
  def completed(page,template):
   expect(page.locator('.game-result')).to_be_visible(timeout=9000);assert not page.errors,page.errors;page.screenshot(path=f'screenshots/{template}-complete.png',full_page=True)
   page.locator('.game-result [data-action="restart"]').click();expect(page.locator('.game-result')).to_be_hidden();expect(page.locator('.play-hud')).to_contain_text('Score 0')
  def run(template,fn):
   if len(sys.argv)>1 and template not in sys.argv[1:]:return
   try:fn();results.append({'game':template,'status':'PASS'});print('PASS',template,'completed and restarted through player controls',flush=True)
   except Exception as e:results.append({'game':template,'status':'FAIL','error':str(e)});print('FAIL',template,str(e)[:450],flush=True)
  def vacuum():
   context,page=start('vacuum')
   for i in range(3):
    page.mouse.move(*point(page,142+i*125,154+(i%2)*170));page.mouse.down();page.mouse.move(*point(page,730,127+i*150),steps=12);page.mouse.up();page.wait_for_timeout(120)
   completed(page,'vacuum');context.close()
  def walk_game(template,seconds):
   context,page=start(template);page.keyboard.down('ArrowRight');page.wait_for_timeout(seconds*1000);page.keyboard.up('ArrowRight');completed(page,template);context.close()
  def umbrella():
   context,page=start('umbrella')
   for x,y in [(600,120),(740,270),(640,420)]:
    page.mouse.move(*point(page,x,y));page.wait_for_timeout(80);page.mouse.click(*point(page,x,y));page.wait_for_timeout(1500)
   completed(page,'umbrella');context.close()
  def paper():
   context,page=start('paper');page.keyboard.down('ArrowUp');page.wait_for_timeout(430);page.keyboard.up('ArrowUp');page.keyboard.down('ArrowRight');page.wait_for_timeout(410);page.keyboard.up('ArrowRight');page.wait_for_timeout(250)
   page.keyboard.down('ArrowDown');page.wait_for_timeout(850);page.keyboard.up('ArrowDown');page.keyboard.down('ArrowRight');page.wait_for_timeout(510);page.keyboard.up('ArrowRight');page.wait_for_timeout(250)
   page.keyboard.down('ArrowUp');page.wait_for_timeout(850);page.keyboard.up('ArrowUp');page.keyboard.down('ArrowRight');page.wait_for_timeout(510);page.keyboard.up('ArrowRight');completed(page,'paper');context.close()
  def clockwork(template):
   context,page=start(template,True)
   page.keyboard.down('ArrowRight');page.wait_for_timeout(420);page.keyboard.down('Space');page.wait_for_timeout(720);page.keyboard.up('Space');page.keyboard.up('ArrowRight');page.wait_for_timeout(250)
   assert 280<value(page,'Player','x')<460,('Player missed the lift',value(page,'Player','x'));assert abs(value(page,'Player','y')-372)<5,('Player not standing on lift',value(page,'Player','y'))
   page.mouse.move(*point(page,206,348));page.mouse.down()
   for i in range(1,19):page.mouse.move(*point(page,168+38*math.cos(i/18*math.pi),348+38*math.sin(i/18*math.pi)))
   page.mouse.up();page.wait_for_timeout(180);assert value(page,'Lift','y')<260
   page.keyboard.down('ArrowRight');page.keyboard.down('Space');page.wait_for_timeout(1600 if template=='clockwork' else 2100);page.keyboard.up('Space');page.keyboard.up('ArrowRight');print(template,'end state',page.locator('#runtime-watch').inner_text(),page.locator('.play-hud').inner_text(),flush=True);page.screenshot(path=f'screenshots/{template}-end-state.png',full_page=True);completed(page,template);context.close()
  def ghostline():
   context,page=start('ghostline',True);page.keyboard.press('F5');page.keyboard.press('F5');
   if page.locator('.game-title-screen').is_visible():page.locator('.title-play').click()
   page.keyboard.down('ArrowRight');page.wait_for_timeout(300)
   page.keyboard.down('Space');page.wait_for_timeout(800);page.keyboard.up('Space');page.wait_for_timeout(80)
   page.keyboard.down('Space');page.wait_for_timeout(800);page.keyboard.up('Space');page.wait_for_timeout(80)
   page.keyboard.down('Space');page.wait_for_timeout(1400);page.keyboard.up('Space');page.keyboard.up('ArrowRight');print('ghostline end state',page.locator('#runtime-watch').inner_text(),page.locator('.play-hud').inner_text(),flush=True);page.screenshot(path='screenshots/ghostline-end-state.png',full_page=True);completed(page,'ghostline');context.close()
  run('vacuum',vacuum);run('bellhop',lambda:walk_game('bellhop',3.5));run('gravitygarden',lambda:walk_game('gravitygarden',4.0));run('umbrella',umbrella);run('paper',paper);run('clockwork',lambda:clockwork('clockwork'));run('lanterns',lambda:clockwork('lanterns'));run('ghostline',ghostline)
  browser.close()
finally:
 server.terminate();server.wait(timeout=5)
 Path('screenshots/indie-game-results.json').write_text(json.dumps(results,indent=2))
 print('Games passed:',sum(r['status']=='PASS'for r in results),'of',len(results),flush=True)
if any(r['status']=='FAIL'for r in results):raise SystemExit(1)

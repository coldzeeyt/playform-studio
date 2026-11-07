import base64,json,os,subprocess,time,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parent.parent
BASE='http://127.0.0.1:14331'
server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'14331'},stdout=subprocess.DEVNULL)
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def fixture(template='platformer',changes=None,width=1440,height=960):
   context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
   page=context.new_page();page.set_default_timeout(5000);page.errors=[]
   page.on('pageerror',lambda e:page.errors.append(str(e)))
   page.goto(BASE)
   page.evaluate('''async ({template,changes})=>{const {createProject}=await import('/project.js');const project=createProject('QA project',template);if(changes)Object.assign(project,changes);localStorage.setItem('playform.projects',JSON.stringify([project]));}''',{'template':template,'changes':changes})
   page.reload();page.locator('.project-open').click();expect(page.locator('.pro-studio')).to_be_visible()
   return context,page
  def tool(page,action):
   page.locator('.editor-menu summary').filter(has_text='Tools').click();page.locator(f'.editor-menu [data-action="{action}"]').click()
  def data(page):return page.evaluate('JSON.parse(localStorage.getItem("playform.projects"))[0]')
  def run(name,fn):
   try:fn();results.append({'name':name,'status':'PASS'});print('PASS',name,flush=True)
   except Exception as e:results.append({'name':name,'status':'FAIL','error':str(e)});print('FAIL',name,str(e)[:350],flush=True)
  def modal_shortcuts():
   context,page=fixture();before=data(page)['objects'];tool(page,'sprite');page.keyboard.press('Delete');page.keyboard.press('Control+z');page.keyboard.press('F5')
   assert data(page)['objects']==before,'Scene changed while Sprite Editor had keyboard focus'
   assert not page.locator('.pro-studio').evaluate('(el)=>el.classList.contains("is-playing")'),'Game started behind a modal editor'
   page.locator('#close-art').click();assert not page.errors,page.errors;context.close()
  run('Modal editors isolate scene shortcuts',modal_shortcuts)
  def onion_redraw():
   context,page=fixture();tool(page,'animation');page.locator('#add-frame').click();page.locator('#duplicate-frame').click()
   page.evaluate('''()=>{window.qaDraws=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.id==='pixel-canvas')window.qaDraws++;return original.apply(this,args)}}''')
   page.locator('#onion-skin').check();page.wait_for_timeout(500)
   assert page.evaluate('window.qaDraws')<12,'Onion skin redraws continuously while idle: '+str(page.evaluate('window.qaDraws'))
   page.locator('#close-art').click();context.close()
  run('Onion skin is idle when not painting',onion_redraw)
  def audio_resave():
   context,page=fixture();tool(page,'audio');page.locator('#save-sound').click();expect(page.locator('[data-load-sound]')).to_have_count(1);first=data(page)['sounds'][0]['data'];page.locator('[data-load-sound]').click();page.wait_for_timeout(150);page.locator('#save-sound').click();second=data(page)['sounds'][0]['data']
   def peak(value):
    import struct
    raw=base64.b64decode(value.split(',')[1]);return max(abs(v)for(v,)in struct.iter_unpack('<h',raw[44:]))
   assert peak(second)>=peak(first)*.99,f'Re-saving reduced peak amplitude from {peak(first)} to {peak(second)}'
   page.locator('#close-sound').click();context.close()
  run('Re-saving audio does not compound effects',audio_resave)
  def start_event():
   context,page=fixture();coin=next(o for o in data(page)['objects'] if o['type']=='coin');page.locator(f'[data-select="{coin["id"]}"]').first.click();page.locator('#panel-inspector [data-action="behavior"]').first.click();page.locator('#event-condition').select_option('start');page.locator('#event-action').select_option('damage');page.locator('#event-value').fill('1');page.locator('#behavior-form button[type="submit"]').click();page.locator('.editor-commandbar [data-action="play"]').first.click();expect(page.locator('.play-hud')).to_contain_text('♥ 2');context.close()
  run('Every accepted game-start action runs',start_event)
  def tiny_screens():
   for width,height in [(320,568),(390,844),(768,1024),(1024,768),(1920,1080)]:
    context,page=fixture(width=width,height=height)
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),f'Overflow at {width}px'
    for action in ['sprite','animation','audio']:
     if width<=700:
      page.locator('.mobile-menu').click();page.locator(f'.editor-dialog [data-action="{action}"]').click()
     else:tool(page,action)
     modal=page.locator('dialog[open]').last
     box=modal.bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1,f'{action} outside {width}px'
     page.keyboard.press('Escape')
    assert not page.errors,page.errors;context.close()
  run('Editor and tool dialogs fit five screen sizes',tiny_screens)
  def project_roundtrip():
   context,page=fixture();before=data(page)
   page.locator('.desktop-menus .editor-menu').first.locator('summary').click()
   with page.expect_download() as pending:page.locator('.desktop-menus .editor-menu').first.locator('[data-action="export"]').click()
   exported=json.loads(Path(pending.value.path()).read_text());assert exported['id']==before['id']
   page.locator('#import').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
   expect(page.locator('.pro-studio')).to_be_visible();saved=page.evaluate('JSON.parse(localStorage.getItem("playform.projects"))');assert len(saved)==2 and saved[0]['id']!=saved[1]['id']
   page.locator('#import').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{"objects":null}'})
   expect(page.locator('#toast')).to_contain_text('not a supported');assert len(page.evaluate('JSON.parse(localStorage.getItem("playform.projects"))'))==2
   context.close()
  run('Project export/import and invalid-file recovery',project_roundtrip)
  def layout_recovery():
   context,page=fixture();page.locator('.editor-commandbar [data-action="layout"]').click();page.locator('[data-preset="focus"]').click();page.locator('#layout-done').click();assert page.locator('.dock-right').evaluate('(e)=>getComputedStyle(e).display')=='none'
   page.locator('.editor-commandbar [data-action="layout"]').click();page.locator('[data-preset="default"]').click();page.locator('#save-layout-preset').click(no_wait_after=True)
   # Native prompt is deliberately dismissed so this case stays independent of naming.
   context.close()
  # Named-layout persistence and native prompt paths are covered in browser-smoke.
  browser.close()
finally:
 server.terminate();server.wait(timeout=5)
 report={'cases':results,'passed':sum(r['status']=='PASS'for r in results),'failed':sum(r['status']=='FAIL'for r in results)}
 (ROOT/'screenshots/qa-regression-results.json').write_text(json.dumps(report,indent=2))
 print(json.dumps({'passed':report['passed'],'failed':report['failed']}),flush=True)
if report['failed']:raise SystemExit(1)

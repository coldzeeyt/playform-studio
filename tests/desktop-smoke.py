from pathlib import Path
from urllib.request import urlopen,Request
import json,os,subprocess,time
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parent.parent
log=(root/'.desktop-cache/desktop-test.log').open('w')
process=subprocess.Popen([str(root/'releases/Playform-Studio-Linux-x64/playform-studio'),'--no-sandbox','--ozone-platform=headless','--disable-gpu','--user-data-dir=/tmp/playform-packaged-test','--remote-debugging-port=14328'],stdout=log,stderr=log,env={**os.environ,'XDG_CACHE_HOME':'/tmp/playform-electron-cache'})
try:
 for _ in range(80):
  if process.poll() is not None:raise RuntimeError('Desktop stopped. See .desktop-cache/desktop-test.log')
  try:
   if urlopen('http://127.0.0.1:14328/json/version',timeout=1).status==200:break
  except Exception:time.sleep(.25)
 with sync_playwright() as p:
  browser=p.chromium.connect_over_cdp('http://127.0.0.1:14328')
  page=browser.contexts[0].pages[0]
  page.wait_for_url('http://127.0.0.1:14327/')
  expect(page.get_by_role('heading',name='Playform Studio')).to_be_visible()
  page.screenshot(path=str(root/'screenshots/desktop-packaged-title.png'),full_page=True)
  config=json.load(urlopen('http://127.0.0.1:14327/api/orbit'))
  assert config['bundled'] and config['configured'],config
  request=Request('http://127.0.0.1:14327/api/orbit',headers={'Content-Type':'application/json'},data=json.dumps({'question':'How do I collect Coin 1?','project':{'objects':[{'name':'Coin 1','type':'coin','events':[]}]}}).encode())
  answer=json.load(urlopen(request,timeout=180))
  assert 'score' in answer['answer']['proposedFix'].lower(),answer
  print('PASS: packaged Electron UI loads and bundled Orbit starts automatically and answers. No external Ollama or model install required.',flush=True)
  page.close()
 process.wait(timeout=15)
finally:
 if process.poll() is None:process.terminate();process.wait(timeout=10)
 log.close()

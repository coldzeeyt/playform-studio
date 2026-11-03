from pathlib import Path
from urllib.request import urlopen,Request
import json,os,subprocess,time

root=Path(__file__).resolve().parent.parent
model=subprocess.Popen([str(root/'.desktop-cache/runtime/llama-b12061/llama-server'),'--model',str(root/'.desktop-cache/orbit-qwen-coder.gguf'),'--host','127.0.0.1','--port','14329','--ctx-size','4096','--parallel','1','--threads','4','--n-gpu-layers','0','--no-webui','--jinja'],stdout=subprocess.DEVNULL,stderr=(root/'.desktop-cache/model-test.log').open('w'))
server=None
try:
 for _ in range(240):
  if model.poll() is not None:raise RuntimeError('Model runtime stopped. See .desktop-cache/model-test.log')
  try:
   if urlopen('http://127.0.0.1:14329/health',timeout=2).status==200:break
  except Exception:time.sleep(.5)
 else:raise TimeoutError('Model startup exceeded 120 seconds')
 print('Bundled Qwen model ready.',flush=True)
 server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=root,env={**os.environ,'PORT':'14330','ORBIT_LOCAL_URL':'http://127.0.0.1:14329','ORBIT_MODEL':'Qwen2.5-Coder-1.5B-Instruct'},stdout=subprocess.DEVNULL)
 time.sleep(.5)
 request=Request('http://127.0.0.1:14330/api/orbit',headers={'Content-Type':'application/json'},data=json.dumps({'question':'How do I make this coin collectible?','project':{'objects':[{'name':'Coin 1','type':'coin','events':[]}],'gravity':1}}).encode())
 result=json.load(urlopen(request,timeout=140))
 assert all(isinstance(result['answer'][k],str) for k in ['suspectedCause','evidence','proposedFix']),result
 assert 'score' in result['answer']['proposedFix'].lower(),result
 print('PASS: bundled model answered through Orbit API:',json.dumps(result),flush=True)
 request=Request('http://127.0.0.1:14330/api/orbit',headers={'Content-Type':'application/json'},data=json.dumps({'mode':'build','question':'Build a platformer scene.','project':{'name':'New game','template':'blank','objects':[]}}).encode())
 build=json.load(urlopen(request,timeout=140));assert any(a.get('op')=='build_template' and a.get('template')=='platformer' for a in build['answer'].get('proposals',[])),build
 print('PASS: bundled Orbit proposed a real platformer scene build:',json.dumps(build),flush=True)
finally:
 if server:server.terminate();server.wait(timeout=5)
 model.terminate();model.wait(timeout=10)

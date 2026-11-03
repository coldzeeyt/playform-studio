const { app, BrowserWindow, dialog, shell } = require('electron');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { existsSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { createServer } = require('node:net');
const os = require('node:os');

let mainWindow, modelProcess, localServer, modelReady;
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { mainWindow?.show(); mainWindow?.focus(); });

async function freePort() {
  const server = createServer();
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function startModel() {
  if (modelReady) return modelReady;
  modelReady = (async () => {
    const resources = process.resourcesPath;
    const runtime = path.join(resources, 'orbit', 'runtime');
    const executable = path.join(runtime, process.platform === 'win32' ? 'llama-server.exe' : 'llama-server');
    const model = path.join(resources, 'orbit', 'orbit-qwen-coder.gguf');
    if (!existsSync(executable) || !existsSync(model)) throw Error('Orbit’s bundled model files are missing. Re-extract the complete Playform Studio download.');
    const port = await freePort();
    process.env.ORBIT_LOCAL_URL = `http://127.0.0.1:${port}`;
    process.env.ORBIT_MODEL = 'Qwen2.5-Coder-1.5B-Instruct';
    modelProcess = spawn(executable, ['--model',model,'--host','127.0.0.1','--port',String(port),'--ctx-size','4096','--parallel','1','--threads',String(Math.max(1,Math.min(6,os.availableParallelism?.()||4))),'--n-gpu-layers','0','--no-webui','--jinja'], {
      cwd: runtime, windowsHide: true, stdio: 'ignore',
      env: { ...process.env, LD_LIBRARY_PATH: runtime + (process.env.LD_LIBRARY_PATH ? ':' + process.env.LD_LIBRARY_PATH : '') }
    });
    let failure;
    modelProcess.once('error', e => { failure=e; });
    modelProcess.once('exit', code => { failure=Error(`Orbit’s model runtime stopped (${code}).`); modelReady=null; });
    for (let attempt=0;attempt<240;attempt++) {
      if (failure) throw failure;
      try { const response=await fetch(`http://127.0.0.1:${port}/health`); if(response.ok)return; } catch {}
      await new Promise(resolve=>setTimeout(resolve,500));
    }
    modelProcess?.kill(); throw Error('Orbit took too long to start. The editor still works with Orbit off.');
  })();
  try { await modelReady; } catch(error) { modelReady=null; throw error; }
}

app.whenReady().then(async () => {
  try {
    process.env.PORT='14327';
    process.env.HOST='127.0.0.1';
    process.env.ORBIT_BUNDLED='1';
    globalThis.playformStartOrbit=startModel;
    const module=await import(pathToFileURL(path.join(__dirname,'..','scripts','serve.mjs')).href);
    localServer=module.server;
    if (!localServer.listening) await new Promise((resolve,reject)=>{localServer.once('listening',resolve);localServer.once('error',reject);});
    mainWindow=new BrowserWindow({width:1440,height:940,minWidth:760,minHeight:540,backgroundColor:'#17171c',title:'Playform Studio',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
    mainWindow.webContents.setWindowOpenHandler(({url})=>{if(/^https?:\/\//.test(url))shell.openExternal(url);return{action:'deny'};});
    mainWindow.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('http://127.0.0.1:14327/'))event.preventDefault();});
    await mainWindow.loadURL('http://127.0.0.1:14327');
  } catch(error) { dialog.showErrorBox('Playform Studio could not start',error.message); app.quit(); }
});
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{modelProcess?.kill();localServer?.close();});

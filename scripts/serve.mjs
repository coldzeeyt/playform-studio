import {handleFeedback} from './feedback.mjs';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { handleOrbit } from './orbit.mjs';
import { handleWindowsExport } from './windows-export.mjs';
import { handleMultiplayer } from './multiplayer.mjs';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.ttf':'font/ttf','.txt':'text/plain','.wasm':'application/wasm'};
const files=new Map();
async function load(dir=''){for(const entry of await readdir(new URL('../dist/'+dir,import.meta.url),{withFileTypes:true})){const file=dir+entry.name;if(entry.isDirectory())await load(file+'/');else files.set('/'+file,{body:await readFile(new URL('../dist/'+file,import.meta.url)),type:mime[file.slice(file.lastIndexOf('.'))]||'application/octet-stream'})}}
await load();
export const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/api/export/windows') { handleWindowsExport(req, res); return; }
  if (path.startsWith('/api/multiplayer/')) { handleMultiplayer(req, res); return; }
  if(path==='/api/feedback'){handleFeedback(req,res);return}
  if (path === '/api/orbit') { handleOrbit(req, res); return; }
  if (path === '/health') { res.writeHead(200); res.end('ok'); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const asset = files.get(['/','/play','/play/','/feedback'].includes(path) ? '/index.html' : path);
  if (!asset) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  res.end(req.method === 'HEAD' ? undefined : asset.body);
}).listen(Number(process.env.PORT || 3000), process.env.HOST || '0.0.0.0', () => console.log('Playform Studio is ready'));

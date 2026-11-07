import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.ttf':'font/ttf','.txt':'text/plain','.wasm':'application/wasm'};
const assets = {};
async function load(dir=''){for(const entry of await readdir(new URL('../dist/'+dir,import.meta.url),{withFileTypes:true})){const file=dir+entry.name;if(entry.isDirectory())await load(file+'/');else{const binary=!['.html','.js','.css','.json','.txt'].some(ext=>file.endsWith(ext));assets['/'+file]={body:(await readFile(new URL('../dist/'+file,import.meta.url))).toString(binary?'base64':'utf8'),type:types[file.slice(file.lastIndexOf('.'))]||'application/octet-stream',binary}}}}
await load();
const source = `// Generated from dist/ by scripts/package-railway.mjs.\nconst assets: Record<string, { body: string; type: string; binary: boolean }> = ${JSON.stringify(assets)};\nBun.serve({\n  port: Number(Bun.env.PORT || 3000),\n  hostname: '0.0.0.0',\n  fetch(request) {\n    const path = new URL(request.url).pathname;\n    if (path === '/health') return new Response('ok');\n    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });\n    const asset = assets[path === '/' ? '/index.html' : path];\n    if (!asset) return new Response('Not found', { status: 404 });\n    return new Response(request.method === 'HEAD' ? null : asset.binary ? Uint8Array.from(atob(asset.body), c => c.charCodeAt(0)) : asset.body, { headers: { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' } });\n  }\n});\n`;
await mkdir(new URL('../.deploy/', import.meta.url), { recursive: true });
await writeFile(new URL('../.deploy/railway.ts', import.meta.url), source);
console.log('Railway function packaged from current application assets.');

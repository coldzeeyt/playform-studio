import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const types = { 'index.html': 'text/html; charset=utf-8', 'style.css': 'text/css; charset=utf-8', 'app.js': 'text/javascript; charset=utf-8', 'project.js': 'text/javascript; charset=utf-8' };
const files = new Map();
for (const [file, type] of Object.entries(types)) files.set('/' + file, { body: await readFile(new URL('../dist/' + file, import.meta.url)), type });
createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/health') { res.writeHead(200); res.end('ok'); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const asset = files.get(path === '/' ? '/index.html' : path);
  if (!asset) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  res.end(req.method === 'HEAD' ? undefined : asset.body);
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Playform Studio is ready'));

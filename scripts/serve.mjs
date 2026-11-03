import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { handleOrbit } from './orbit.mjs';
import { handleWindowsExport } from './windows-export.mjs';
import { handleMultiplayer } from './multiplayer.mjs';

const types = { 'index.html': 'text/html; charset=utf-8', 'style.css': 'text/css; charset=utf-8', 'app.js': 'text/javascript; charset=utf-8', 'project.js': 'text/javascript; charset=utf-8', 'editor.js': 'text/javascript; charset=utf-8', 'title-menu.js': 'text/javascript; charset=utf-8', 'presentation.js': 'text/javascript; charset=utf-8', 'indie-presets.js': 'text/javascript; charset=utf-8', 'events.js': 'text/javascript; charset=utf-8', 'proposals.js': 'text/javascript; charset=utf-8', 'multiplayer.js': 'text/javascript; charset=utf-8', 'mechanics.js': 'text/javascript; charset=utf-8', 'art-editor.js': 'text/javascript; charset=utf-8', 'sound-editor.js': 'text/javascript; charset=utf-8', 'graphics.js': 'text/javascript; charset=utf-8', 'setup.js': 'text/javascript; charset=utf-8', 'editor.css': 'text/css; charset=utf-8', 'art-editor.css': 'text/css; charset=utf-8', 'sound-editor.css': 'text/css; charset=utf-8', 'fonts/montserrat-400.ttf': 'font/ttf', 'fonts/montserrat-500.ttf': 'font/ttf', 'fonts/montserrat-600.ttf': 'font/ttf', 'fonts/montserrat-700.ttf': 'font/ttf', 'fonts/pixelify-sans-700.ttf': 'font/ttf', 'fonts/orbitron-700.ttf': 'font/ttf', 'fonts/lora-700.ttf': 'font/ttf' };
const files = new Map();
for (const [file, type] of Object.entries(types)) files.set('/' + file, { body: await readFile(new URL('../dist/' + file, import.meta.url)), type });
export const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/api/export/windows') { handleWindowsExport(req, res); return; }
  if (path.startsWith('/api/multiplayer/')) { handleMultiplayer(req, res); return; }
  if (path === '/api/orbit') { handleOrbit(req, res); return; }
  if (path === '/health') { res.writeHead(200); res.end('ok'); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const asset = files.get(['/','/play','/play/'].includes(path) ? '/index.html' : path);
  if (!asset) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  res.end(req.method === 'HEAD' ? undefined : asset.body);
}).listen(Number(process.env.PORT || 3000), process.env.HOST || '0.0.0.0', () => console.log('Playform Studio is ready'));

import { readFile, mkdir, writeFile } from 'node:fs/promises';

const types = { 'index.html': 'text/html; charset=utf-8', 'style.css': 'text/css; charset=utf-8', 'app.js': 'text/javascript; charset=utf-8', 'project.js': 'text/javascript; charset=utf-8' };
const assets = {};
for (const [file, type] of Object.entries(types)) {
  assets['/' + file] = { body: await readFile(new URL('../dist/' + file, import.meta.url), 'utf8'), type };
}
const source = `// Generated from dist/ by scripts/package-railway.mjs.\nconst assets: Record<string, { body: string; type: string }> = ${JSON.stringify(assets)};\nBun.serve({\n  port: Number(Bun.env.PORT || 3000),\n  hostname: '0.0.0.0',\n  fetch(request) {\n    const path = new URL(request.url).pathname;\n    if (path === '/health') return new Response('ok');\n    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });\n    const asset = assets[path === '/' ? '/index.html' : path];\n    if (!asset) return new Response('Not found', { status: 404 });\n    return new Response(request.method === 'HEAD' ? null : asset.body, { headers: { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' } });\n  }\n});\n`;
await mkdir(new URL('../.deploy/', import.meta.url), { recursive: true });
await writeFile(new URL('../.deploy/railway.ts', import.meta.url), source);
console.log('Railway function packaged from current application assets.');

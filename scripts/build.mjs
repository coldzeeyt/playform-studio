import{access,readFile}from'node:fs/promises';
for(const file of ['index.html','style.css','app.js','project.js','editor.js','graphics.js','setup.js','editor.css'])await access(new URL('../dist/'+file,import.meta.url));
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
if(!html.includes('name="viewport"'))throw Error('Missing mobile viewport');
console.log('Static application ready in dist/. No dependencies required.');

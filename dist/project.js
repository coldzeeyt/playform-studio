export const templates={blank:'Empty scene',platformer:'Platformer',rhythm:'Rhythm runner'};
export function createProject(name,template='blank'){
 if(!name.trim()||name.length>80||!templates[template])throw Error('Enter a project name and choose a valid template.');
 const objects=template==='blank'?[]:[{id:crypto.randomUUID(),name:'Player',type:'player',x:140,y:240,w:32,h:40,color:'#bd9cde'},{id:crypto.randomUUID(),name:'Ground',type:'platform',x:60,y:340,w:620,h:24,color:'#7d698d'},...Array.from({length:template==='rhythm'?8:3},(_,i)=>({id:crypto.randomUUID(),name:`Coin ${i+1}`,type:'coin',x:260+i*64,y:260,w:18,h:18,color:'#d3b777'}))];
 return {format:'playform',version:1,id:crypto.randomUUID(),name:name.trim(),template,updated:Date.now(),objects};
}
export function validateProject(p){
 if(!p||p.format!=='playform'||p.version!==1||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!templates[p.template]||!Array.isArray(p.objects)||p.objects.length>10000)throw Error('This is not a supported Playform project.');
 const ids=new Set();for(const o of p.objects){if(!o||typeof o.id!=='string'||ids.has(o.id)||typeof o.name!=='string'||o.name.length>200||!['player','platform','coin','hazard'].includes(o.type)||!['x','y','w','h'].every(k=>Number.isFinite(o[k])&&Math.abs(o[k])<100000)||o.w<=0||o.h<=0||!/^#[\da-f]{6}$/i.test(o.color))throw Error('Project contains invalid scene objects.');ids.add(o.id)}
 return {...p,id:typeof p.id==='string'?p.id:crypto.randomUUID(),updated:Number.isFinite(p.updated)?p.updated:Date.now()};
}

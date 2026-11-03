export const templates={blank:'Empty scene',platformer:'Platformer',rhythm:'Rhythm runner',topdown:'Top-down adventure',space:'Space shooter',puzzle:'Coin maze',runner:'Endless runner'};
export const objectTypes=['player','platform','coin','hazard','enemy','trigger','camera','flag'];
export function makeObject(type,x=160,y=160){
 const sizes={player:[38,44],platform:[192,32],coin:[32,32],hazard:[96,32],enemy:[40,40],trigger:[96,96],camera:[96,64],flag:[48,96]};
 if(!sizes[type])throw Error('Unknown object type');
 return {id:crypto.randomUUID(),name:type[0].toUpperCase()+type.slice(1),type,x,y,w:sizes[type][0],h:sizes[type][1],color:{player:'#d2e8f8',platform:'#78c929',coin:'#ffcf26',hazard:'#d9e7ed',enemy:'#ed5266',trigger:'#a680dc',camera:'#8fa0b1',flag:'#ef5559'}[type],physics:type!=='camera',body:type==='player'||type==='enemy'?'dynamic':type==='platform'?'static':'trigger',gravity:1,friction:.5,bounce:0,events:[]};
}
export function createProject(name,template='blank'){
 if(!name.trim()||name.length>80||!Object.hasOwn(templates,template))throw Error('Enter a project name and choose a valid template.');
 const objects=[];
 const add=(type,x,y,w,h,label)=>{const o=makeObject(type,x,y);if(w)o.w=w;if(h)o.h=h;if(label)o.name=label;objects.push(o);return o};
 if(['platformer','rhythm','runner'].includes(template)){
  add('player',150,354);add('platform',0,400,288,160,'Start platform');add('platform',288,512,288,48,'Lower platform');add('platform',576,432,96,128,'Step');add('platform',672,320,288,240,'Goal platform');add('hazard',304,480,256,32,'Spikes');
  for(let i=0;i<(template==='rhythm'?6:3);i++){const o=add('coin',416+i*88,template==='rhythm'?300:300-i*32);o.name=`Coin ${i+1}`;if(i>0)o.events=[{id:crypto.randomUUID(),condition:'touch',action:'score',value:1}]}
  add('flag',800,224,48,96,'Checkpoint flag');
 }
 if(['topdown','puzzle','space'].includes(template)){
  add('player',80,260);if(template!=='space'){add('platform',0,0,960,32,'Top boundary');add('platform',0,508,960,32,'Bottom boundary');add('platform',300,0,32,240,'Maze wall');add('platform',600,270,32,240,'Maze wall 2')}
  for(let i=0;i<5;i++){const o=add('coin',200+i*140,160+(i%2)*160);o.name=`Coin ${i+1}`;o.events=[{id:crypto.randomUUID(),condition:'touch',action:'score',value:1}]}
  for(let i=0;i<(template==='space'?5:2);i++)add('enemy',370+i*100,200+(i%2)*100);
  add('flag',860,100,48,96,'Goal');
 }
 return {format:'playform',version:1,id:crypto.randomUUID(),name:name.trim(),template,updated:Date.now(),objects,gravity:['topdown','space','puzzle'].includes(template)?0:1,variables:{Score:0,Health:3},sceneName:'MainScene',description:'',assets:[]};
}
export function validateProject(p){
 if(!p||p.format!=='playform'||p.version!==1||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!Object.hasOwn(templates,p.template)||!Array.isArray(p.objects)||p.objects.length>10000)throw Error('This is not a supported Playform project.');
 const ids=new Set();for(const o of p.objects){if(!o||typeof o.id!=='string'||ids.has(o.id)||typeof o.name!=='string'||o.name.length>200||!objectTypes.includes(o.type)||!['x','y','w','h'].every(k=>Number.isFinite(o[k])&&Math.abs(o[k])<100000)||o.w<=0||o.h<=0||!/^#[\da-f]{6}$/i.test(o.color))throw Error('Project contains invalid scene objects.');ids.add(o.id);if(o.events!==undefined&&(!Array.isArray(o.events)||o.events.some(e=>!e||!['score','damage','checkpoint'].includes(e.action)||e.condition!=='touch'||!Number.isFinite(e.value)||Math.abs(e.value)>1e6)))throw Error('Project contains invalid events.');}
 return {...p,id:typeof p.id==='string'?p.id:crypto.randomUUID(),updated:Number.isFinite(p.updated)?p.updated:Date.now(),gravity:Number.isFinite(p.gravity)?Math.max(0,Math.min(10,p.gravity)):1,variables:p.variables&&typeof p.variables==='object'&&!Array.isArray(p.variables)?Object.fromEntries(Object.entries(p.variables).filter(([k,v])=>k.length<=40&&Number.isFinite(v))):{Score:0,Health:3}};
}

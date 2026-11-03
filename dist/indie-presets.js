import{encodeWav}from'./sound-editor.js';
export const indieIdeas={clockwork:'Clockwork Courier',vacuum:'Vacuum Post',ghostline:'Ghostline Station',umbrella:'Umbrella Archivist',gravitygarden:'Gravity Gardener',bellhop:'Bellhop of Bells',paper:'Paper Detective',lanterns:'Lanterns for Two'};
export function populateIndiePreset(project,make){
 const objects=project.objects;
 const add=(type,name,x,y,w,h,options={})=>{const o=make(type,x,y);o.name=name;if(w)o.w=w;if(h)o.h=h;Object.assign(o,options);objects.push(o);return o};
 const event=(o,condition,action,value=0,extra={})=>{o.events??=[];o.events.push({id:crypto.randomUUID(),condition,action,value,...extra})};
 const platform=(name,x,y,w,h=32)=>add('platform',name,x,y,w,h);
 const player=(x=80,y=436)=>add('player','Player',x,y);
 const goal=score=>{const trigger=add('trigger','Level goal',0,0,32,32);event(trigger,'variable','finish',0,{testVariable:'Score',compare:'atleast',threshold:score})};
 const coin=(name,x,y,options={})=>{const o=add('coin',name,x,y,32,32,options);event(o,'touch','score',1);return o};
 const box=(name,x,y,w,h,color,label,physical=false)=>add('sprite',name,x,y,w,h,{shape:'box',color,label,physics:physical,body:'trigger'});
 project.sounds??=[];project.variables={Score:0,Health:3};project.width=960;project.height=540;project.gravity=1;
 if(['clockwork','lanterns'].includes(project.template)){
  player();platform('Start',0,480,260,60);const lift=platform('Lift',300,416,160,24);platform('Goal ledge',600,256,360,284);add('hazard','Pit',270,510,320,30);
  const gear=add('gear','Lift wheel',120,300);event(gear,'pointerdown','drag',1);event(gear,'gearturn','moveplatform',-160,{targetId:lift.id,axis:'y',turnDegrees:180,startAngle:0});
  coin('Delivery stamp',740,208);if(project.template==='lanterns'){coin('Lantern spark',810,208);coin('Second spark',870,208);goal(3);project.instructions='Play with friends. One turns the wheel; the other reaches the sparks. Collect all 3.'}else{goal(1);project.instructions='Drag around the wheel to raise the lift. Jump across and collect the delivery stamp.'}
 }
 if(project.template==='vacuum'){
  project.gravity=0;player(60,440);const colors=['#9c80dc','#e8b96f','#7fceb3'];for(let i=0;i<3;i++){const bin=box(`Mail slot ${i+1}`,650,70+i*150,160,115,colors[i],`SLOT ${i+1}`);const parcel=box(`Parcel ${i+1}`,110+i*125,130+(i%2)*170,64,48,colors[i],`${i+1}`);event(parcel,'pointerdown','drag',1);event(parcel,'drop','score',1,{conditionTargetId:bin.id})}goal(3);project.instructions='Drag each parcel into its matching colored slot, then release it. Deliver all 3.'
 }
 if(project.template==='ghostline'){
  player();platform('Station',0,480,190,60);const a=platform('Ghost step A',230,400,150,24),b=platform('Ghost step B',440,320,150,24);platform('Last stop',700,240,260,300);const clock=add('trigger','Station clock',0,0);event(clock,'timer','toggle',0,{interval:1.5,repeat:true,targetId:a.id});event(clock,'timer','toggle',0,{interval:2.2,repeat:true,targetId:b.id});coin('Last ticket',810,190);goal(1);project.instructions='Time your jumps as the ghost platforms appear and vanish. Reach the last ticket.'
 }
 if(project.template==='umbrella'){
  project.gravity=0;const p=player(100,270),weapon=add('sprite','Umbrella blaster',160,270,64,24);event(weapon,'frame','attach',0,{targetId:p.id,offsetX:25,offsetY:0});event(weapon,'frame','facepointer',0);event(weapon,'input','shoot',480,{inputAction:'shoot'});project.inputs={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',jump:'Space',shoot:'Mouse0'};for(const[i,pos]of [[0,[580,100]],[1,[720,250]],[2,[620,400]]])add('enemy',`Ink wraith ${i+1}`,pos[0],pos[1]);goal(30);project.instructions='Arrow keys move. Aim with the pointer and click to fire. Clear all 3 ink wraiths.'
 }
 if(project.template==='gravitygarden'){
  player();platform('Garden floor',0,480,960,60);platform('Ceiling garden',0,32,960,32);const up=box('Invert gravity',180,410,56,56,'#b392de','↑',true),down=box('Restore gravity',700,72,56,56,'#8bcdb2','↓',true);event(up,'touch','setgravity',-1);event(down,'touch','setgravity',1);coin('Ceiling seed A',400,76);coin('Ceiling seed B',560,76);coin('Floor seed',830,435);goal(3);project.instructions='Touch ↑ to fall upward and ↓ to restore gravity. Collect all 3 seeds.'
 }
 if(project.template==='bellhop'){
  player();platform('Bell hall',0,480,960,60);const frequencies=[261.63,329.63,392,523.25,659.25];for(let i=0;i<5;i++){const sound=tone(`Bell ${i+1}`,frequencies[i]);project.sounds.push(sound);const bell=add('coin',`Lost note ${i+1}`,200+i*145,430,32,32,{color:['#d1a5ee','#e9b477','#85d0b0','#8cbbe8','#e9d478'][i]});event(bell,'touch','sound',1,{soundId:sound.id});event(bell,'touch','score',1)}goal(5);project.instructions='Collect the 5 lost notes to rebuild the bell hall’s melody.'
 }
 if(project.template==='paper'){
  project.gravity=0;player(70,250);for(let i=0;i<3;i++){const reveal=box(`Memory ${i+1}`,590,70+i*145,230,100,['#b48ddd','#84beb0','#d9bb7e'][i],['A LETTER','THE MAP','A PORTRAIT'][i]);reveal.hidden=true;const clue=box(`Paper clue ${i+1}`,150+i*120,140+(i%2)*170,48,48,'#e3d8c6','?',true);event(clue,'touch','show',0,{targetId:reveal.id});event(clue,'touch','score',1)}goal(3);project.instructions='Find the 3 paper clues. Each reveals a missing memory in the gallery.'
 }
 const materials={clockwork:['metal','#bd9962'],vacuum:['metal','#82b7d1'],ghostline:['ghost','#b1a2df'],umbrella:['paper','#c5acb9'],gravitygarden:['garden','#86c694'],bellhop:['wood','#dfb779'],paper:['paper','#c8b48b'],lanterns:['metal','#88b9b6']};
 for(const o of objects){if(o.type==='platform'){o.material=materials[project.template]?.[0];o.color=materials[project.template]?.[1]||o.color}if(o.type==='player'){o.costume=project.template;o.color=project.template==='paper'?'#6c9da3':project.template==='clockwork'?'#d9c49c':'#c7deeb'} }
 for(const o of objects){if(o.type==='coin')o.kind=project.template==='clockwork'?'stamp':project.template==='ghostline'?'ticket':project.template==='gravitygarden'?'seed':project.template==='bellhop'?'note':project.template==='lanterns'?'spark':o.kind;if(project.template==='paper'&&o.type==='sprite')o.shape='paper';if(project.template==='vacuum'&&o.type==='sprite')o.kind=o.name.startsWith('Parcel')?'parcel':'slot';if(o.name==='Umbrella blaster'){o.shape='umbrella';o.h=44;o.w=72;}}const titleFonts={clockwork:'Lora',vacuum:'Orbitron',ghostline:'Lora',umbrella:'Lora',gravitygarden:'Pixelify Sans',bellhop:'Lora',paper:'Lora',lanterns:'Pixelify Sans'};project.titleScreen={font:titleFonts[project.template],fontSize:project.template==='vacuum'?43:['gravitygarden','lanterns'].includes(project.template)?60:48,buttonFont:'Montserrat',buttonSize:14,enabled:true,title:indieIdeas[project.template],playLabel:'Start game',multiplayer:project.template==='lanterns',settings:true,accent:materials[project.template]?.[1]||'#aa88d3'};project.indieExample=true;
 return project;
}
export function tone(name,frequency){const rate=22050,length=Math.floor(rate*.22),samples=new Float32Array(length);for(let i=0;i<length;i++)samples[i]=Math.sin(2*Math.PI*frequency*i/rate)*Math.exp(-i/length*5)*.5;const bytes=new Uint8Array(encodeWav([samples],rate));let binary='';for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);return{id:crypto.randomUUID(),name,data:'data:audio/wav;base64,'+btoa(binary),duration:.22}}

export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function updateLoopMovement(state,project,dt){state.motionOrigins??=new Map();state.motionDirections??=new Map();state.motionFinished??=new Set();for(const source of state.objects)for(const event of source.events||[]){if(event.action!=='loopmove')continue;const axis=event.axis==='y'?'y':'x',key=source.id+event.id;if(!state.motionOrigins.has(key))state.motionOrigins.set(key,source[axis]);if(state.motionFinished.has(key))continue;const initialDirection=event.direction===1?1:-1,direction=state.motionDirections.get(key)||initialDirection,speed=Math.max(1,Math.min(2000,Math.abs(event.value)||140));source[axis]+=direction*speed*dt;const mode=event.movementMode||'wrap',origin=state.motionOrigins.get(key),range=Math.max(1,Math.abs(event.range)||200);if(mode==='pingpong'){const low=origin-range/2,high=origin+range/2;if(source[axis]<low){source[axis]=low;state.motionDirections.set(key,1)}if(source[axis]>high){source[axis]=high;state.motionDirections.set(key,-1)}}else if(mode==='once'){if(Math.abs(source[axis]-origin)>=range){source[axis]=origin+initialDirection*range;state.motionFinished.add(key)}}else{const size=axis==='x'?source.w:source.h,extent=axis==='x'?(project.width||960):(project.height||540);if(source[axis]<-size||source[axis]>extent){source[axis]=direction<0?extent:-size;source.hidden=false;state.touched?.delete(source.id)}}}}
export function runtimeVariable(state,name){return name==='Score'?state.score:name==='Health'?state.health:Number(state.variables?.[name])||0}
export function executeEvent(state,source,event,context={}){
 const value=Number(event.value)||0,target=event.targetId?state.objects.find(o=>o.id===event.targetId):source;
 if(event.guard){const current=runtimeVariable(state,event.guard.variable),threshold=Number(event.guard.value)||0;if(event.guard.op==='eq'?current!==threshold:event.guard.op==='below'?current>=threshold:current<threshold)return false}
 switch(event.action){
  case'score':state.score+=value;if(event.consume!==false)source.hidden=true;context.onCollect?.(source);break;
  case'damage':context.onDamage?.(Math.max(0,value));break;
  case'checkpoint':{const player=state.objects.find(o=>o.type==='player');state.spawn={x:player?.x??source.x,y:player?.y??source.y};context.onCheckpoint?.();break}
  case'sound':context.onSound?.(event.soundId);break;
  case'toggle':if(target)target.hidden=!target.hidden;break;
  case'show':if(target)target.hidden=false;break;
  case'hide':if(target)target.hidden=true;break;
  case'setgravity':state.gravity=value;break;
  case'addvariable':case'setvariable':{const name=event.variable||'Score',next=event.action==='addvariable'?runtimeVariable(state,name)+value:value;state.variables??={};state.variables[name]=next;if(name==='Score')state.score=next;if(name==='Health')state.health=Math.max(0,next);break}
  case'finish':state.completed=true;break;
  case'shoot':{const angle=(source.rotation||0)*Math.PI/180,speed=Math.max(20,Math.abs(value)||480);state.bullets??=[];state.bullets.push({x:source.x+source.w/2,y:source.y+source.h/2,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:3,owner:source.id});break}
  default:return false;
 }
 return true;
}
export function scheduledEvents(state,project,now,pressed,context={}){
 state.eventActive??=new Set();state.eventTimes??=new Map();
 for(const source of state.objects){if(source.hidden)continue;for(const event of source.events||[]){
  if(event.condition==='timer'){const elapsed=(now-state.started)/1000,interval=Math.max(.05,Number(event.interval)||1),count=Math.floor(elapsed/interval),previous=state.eventTimes.get(event.id)||0;if(count>previous&&(event.repeat!==false||previous===0)){state.eventTimes.set(event.id,count);executeEvent(state,source,event,context)}continue}
  let active=false;
  if(event.condition==='input')active=pressed(event.inputAction||'shoot');
  else if(event.condition==='variable'){const current=runtimeVariable(state,event.testVariable||'Score'),threshold=Number(event.threshold)||0;active=event.compare==='eq'?current===threshold:event.compare==='below'?current<threshold:current>=threshold}
  else continue;
  if(active&&!state.eventActive.has(event.id)){state.eventActive.add(event.id);executeEvent(state,source,event,context)}else if(!active)state.eventActive.delete(event.id);
 }}
}
export function dropEvents(state,source,context={}){for(const event of source.events||[]){if(event.condition!=='drop')continue;const zone=state.objects.find(o=>o.id===event.conditionTargetId&&!o.hidden);if(zone&&overlaps(source,zone))executeEvent(state,source,event,context)}}
export function updateProjectiles(state,project,dt,context={}){
 for(const bullet of state.bullets||[]){bullet.vx??=600;bullet.vy??=0;bullet.life??=3;bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;bullet.life-=dt;for(const target of state.objects){if(target.hidden||target.id===bullet.owner)continue;if(target.type!=='enemy')continue;if(overlaps({x:bullet.x,y:bullet.y,w:12,h:5},target)){target.hidden=true;bullet.life=0;state.score+=10;for(const event of target.events||[])if(event.condition==='projectilehit')executeEvent(state,target,event,context);break}}}
 state.bullets=(state.bullets||[]).filter(b=>b.life>0&&b.x>-100&&b.x<(project.width||960)+100&&b.y>-100&&b.y<(project.height||540)+100)
}

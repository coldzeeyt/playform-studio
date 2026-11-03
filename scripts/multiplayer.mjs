import {randomBytes,randomUUID} from 'node:crypto';
import {validateProject} from '../dist/project.js';
const rooms=new Map();
const origins=new Set(['http://127.0.0.1:14327','http://localhost:14327']);
const frame=room=>({type:'state',code:room.code,round:room.round,host:room.host,players:[...room.players.values()].filter(p=>p.connected).map(({id,name,color,x,y,w,h,score,health})=>({id,name,color,x,y,w,h,score,health})),collected:[...room.collected],score:room.score,objects:[...room.objects.values()]});
const cleanName=value=>(typeof value==='string'?value:'Player').trim().slice(0,24)||'Player';
const colors=['#bca1ee','#83d5ba','#ef9d9b','#e5c36d','#8cb8e6','#e4a3cd','#bccd89','#adadb9'];
const timer=setInterval(()=>{for(const[code,room]of rooms){for(const[id,player]of room.players)if(!player.connected&&Date.now()-player.lastSeen>60000){room.players.delete(id);room.dirty=true}if(Date.now()-room.updated>1800000){for(const stream of room.streams.values()){stream.write('event: closed\ndata: Room expired\n\n');stream.end()}rooms.delete(code);continue}if(room.dirty||Date.now()-room.lastBroadcast>10000){const data='data: '+JSON.stringify(frame(room))+'\n\n';for(const stream of room.streams.values())stream.write(data);room.dirty=false;room.lastBroadcast=Date.now()}}},100);timer.unref();
async function readBody(req){let body='';for await(const chunk of req){body+=chunk;if(body.length>4e6)throw Error('The room project is too large (4 MB maximum).')}return JSON.parse(body||'{}')}
function join(room,name){if(room.players.size>=room.maxPlayers)throw Error('This room is full.');const player={lastSeen:Date.now(),id:randomUUID(),token:randomBytes(24).toString('hex'),name:cleanName(name),color:colors[room.players.size%colors.length],x:80,y:100,w:38,h:44,score:0,health:3,connected:false};room.players.set(player.id,player);room.updated=Date.now();room.dirty=true;return player}
export async function handleMultiplayer(req,res){
 const origin=req.headers.origin;if(origins.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');if(req.method==='OPTIONS'){res.writeHead(204);res.end();return}
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
 const url=new URL(req.url,'http://localhost');
 try{
  if(url.pathname==='/api/multiplayer/stream'){
   const room=rooms.get(url.searchParams.get('code')),id=url.searchParams.get('id'),player=room?.players.get(id);if(!room||!player||player.token!==url.searchParams.get('token')){send(403,{error:'Room session is invalid.'});return}
   const old=room.streams.get(id);if(old)old.end();room.streams.set(id,res);player.connected=true;player.lastSeen=Date.now();room.dirty=true;room.updated=Date.now();res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();res.write('data: '+JSON.stringify(frame(room))+'\n\n');req.on('close',()=>{if(room.streams.get(id)!==res)return;room.streams.delete(id);player.connected=false;player.lastSeen=Date.now();room.dirty=true});return;
  }
  if(req.method!=='POST'){send(405,{error:'Use POST for room actions.'});return}
  const data=await readBody(req);
  if(url.pathname==='/api/multiplayer/host'){
   if(rooms.size>=100)throw Error('The server has reached its room limit. Try again later.');const project=validateProject(data.project);let code;do{code=randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(code));const room={code,round:0,project,maxPlayers:Math.max(2,Math.min(8,Number(data.maxPlayers)||4)),players:new Map(),streams:new Map(),host:null,dirty:true,updated:Date.now(),lastBroadcast:0,collected:new Set(),score:project.variables?.Score||0,objects:new Map()};const player=join(room,data.name);room.host=player.id;rooms.set(code,room);send(201,{code,player,project,maxPlayers:room.maxPlayers});return;
  }
  const room=rooms.get(String(data.code||'').trim().toUpperCase());if(!room){send(404,{error:'Room not found or expired. Check the code.'});return}
  if(url.pathname==='/api/multiplayer/join'){const player=join(room,data.name);send(200,{code:room.code,player,project:room.project,maxPlayers:room.maxPlayers});return}
  const player=room.players.get(data.id);if(!player||player.token!==data.token){send(403,{error:'Room session is invalid.'});return}
  if(url.pathname==='/api/multiplayer/reset'){if(room.host!==player.id){send(403,{error:'Only the host can restart the room.'});return}room.round++;room.collected.clear();room.score=room.project.variables?.Score||0;room.objects.clear();room.updated=Date.now();room.dirty=true;send(200,{ok:true});return}if(url.pathname==='/api/multiplayer/leave'){room.players.delete(player.id);const stream=room.streams.get(player.id);room.streams.delete(player.id);stream?.end();room.dirty=true;if(room.host===player.id){for(const stream of room.streams.values()){stream.write('event: closed\ndata: The host ended the room\n\n');stream.end()}rooms.delete(room.code)}send(200,{ok:true});return}
  if(url.pathname!=='/api/multiplayer/state'){send(404,{error:'Unknown room action.'});return}
  if(Date.now()-(player.lastUpdate||0)<40){send(200,{ok:true});return}player.lastUpdate=Date.now();player.lastSeen=Date.now();
  for(const key of ['x','y','w','h','score','health'])if(Number.isFinite(data[key])&&Math.abs(data[key])<100000)player[key]=data[key];
  if(data.collect){const coin=room.project.objects.find(o=>o.id===data.collect&&o.type==='coin');if(coin&&!room.collected.has(coin.id)&&Math.hypot(player.x-coin.x,player.y-coin.y)<Math.max(120,coin.w+coin.h)){room.collected.add(coin.id);room.score+=(coin.events||[]).filter(e=>e.action==='score').reduce((sum,e)=>sum+e.value,0)}}
  if(data.object){const source=room.project.objects.find(o=>o.id===data.object.id&&o.events?.some(e=>e.action==='drag'));if(source){const update={id:source.id};for(const key of ['x','y','rotation','turnAngle'])if(Number.isFinite(data.object[key])&&Math.abs(data.object[key])<100000)update[key]=data.object[key];room.objects.set(source.id,update)}}
  room.updated=Date.now();room.dirty=true;send(200,{ok:true});
 }catch(error){send(400,{error:error.message||'Room request failed.'})}
}

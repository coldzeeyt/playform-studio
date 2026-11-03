const base=location.hostname==='127.0.0.1'&&location.port==='14327'?'https://playform-studio-production.up.railway.app':'';
async function request(action,body){const response=await fetch(base+'/api/multiplayer/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw Error(data.error||'Multiplayer connection failed.');return data}
export async function hostRoom(project,name,maxPlayers){return request('host',{project,name,maxPlayers})}
export async function joinRoom(code,name){return request('join',{code,name})}
export function connectRoom(session,{onState,onError,onClosed}){
 const credentials={code:session.code,id:session.player.id,token:session.player.token};let busy=false,closed=false,lastUpdate=0,pendingCollect=[];
 const source=new EventSource(base+'/api/multiplayer/stream?'+new URLSearchParams(credentials));
 source.onmessage=e=>{try{onState(JSON.parse(e.data))}catch(error){onError(error.message)}};
 source.onerror=()=>{if(!closed)onError('Room connection interrupted. Reconnecting…')};source.addEventListener('closed',e=>{closed=true;source.close();onClosed(e.data)});
 return{session,send(state){if(closed)return;if(state.collect){pendingCollect.push(state.collect)}if(busy||performance.now()-lastUpdate<100)return;busy=true;lastUpdate=performance.now();const collect=pendingCollect.shift();request('state',{...credentials,...state,collect}).catch(e=>onError(e.message)).finally(()=>busy=false)},leave(){if(closed)return;closed=true;source.close();request('leave',credentials).catch(()=>{})},restart(){return request('reset',credentials)},link(){return'https://playform-studio-production.up.railway.app/play?room='+session.code}}
}

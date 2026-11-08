import{backendRequest,serverURL}from'./backend.js';
async function request(action,body,project){return backendRequest('/api/multiplayer/'+action,body,project)}
export async function hostRoom(project,name,maxPlayers){const base=serverURL(project),next=base?{...project,backend:{url:base}}:project;return request('host',{project:next,name,maxPlayers},next)}
export async function joinRoom(code,name,project){return request('join',{code,name},project)}
export function connectRoom(session,{onState,onError,onClosed}){
 const base=serverURL(session.project);const credentials={code:session.code,id:session.player.id,token:session.player.token};let busy=false,closed=false,lastUpdate=0,pendingCollect=[];
 const source=new EventSource(base+'/api/multiplayer/stream?'+new URLSearchParams(credentials));
 source.onmessage=e=>{try{onState(JSON.parse(e.data))}catch(error){onError(error.message)}};
 source.onerror=()=>{if(!closed)onError('Room connection interrupted. Reconnecting…')};source.addEventListener('closed',e=>{closed=true;source.close();onClosed(e.data)});
 return{session,send(state){if(closed)return;if(state.collect){pendingCollect.push(state.collect)}if(busy||performance.now()-lastUpdate<100)return;busy=true;lastUpdate=performance.now();const collect=pendingCollect.shift();request('state',{...credentials,...state,collect},session.project).catch(e=>onError(e.message)).finally(()=>busy=false)},leave(){if(closed)return;closed=true;source.close();request('leave',credentials,session.project).catch(()=>{})},restart(){return request('reset',credentials,session.project)},link(){return'https://playform-studio-production.up.railway.app/play?room='+session.code+(base?'&server='+encodeURIComponent(base):'')}}
}

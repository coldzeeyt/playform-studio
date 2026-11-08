// App projects: data model, starter templates, validation and the runtime that renders an app.
// The runtime (runApp) is self-contained so it can be serialised into an exported HTML file.

export const appTemplates={
  'app-blank':'Blank app',
  'app-todo':'To-do list',
  'app-links':'Link page',
  'app-event':'Event RSVP'
};

export const componentTypes={
  heading:'Heading',
  text:'Text',
  button:'Button',
  input:'Text field',
  toggle:'Switch',
  list:'List',
  counter:'Number',
  card:'Card',
  image:'Image',
  divider:'Divider',
  spacer:'Space'
};

export const actionTypes={
  none:'Nothing',
  navigate:'Go to screen',
  back:'Go back',
  message:'Show a message',
  set:'Set a value',
  add:'Add to a number',
  append:'Add field text to a list',
  link:'Open a link'
};

export const fonts={
  system:'System',
  rounded:'Rounded',
  serif:'Serif',
  mono:'Monospace'
};

const id=()=>crypto.randomUUID();

export function makeComponent(type){
  const c={id:id(),type};
  switch(type){
    case 'heading':Object.assign(c,{text:'Heading',size:'l',align:'left'});break;
    case 'text':Object.assign(c,{text:'Write something here.',align:'left',muted:false});break;
    case 'button':Object.assign(c,{label:'Button',style:'primary',action:{type:'none'}});break;
    case 'input':Object.assign(c,{label:'Label',placeholder:'Type here',variable:''});break;
    case 'toggle':Object.assign(c,{label:'Switch',variable:''});break;
    case 'list':Object.assign(c,{source:'static',items:['First item','Second item','Third item'],variable:'',removable:false});break;
    case 'counter':Object.assign(c,{label:'Total',variable:''});break;
    case 'card':Object.assign(c,{title:'Card title',text:'A short description.'});break;
    case 'image':Object.assign(c,{src:'',alt:'',height:180,fit:'cover'});break;
    case 'spacer':Object.assign(c,{height:24});break;
  }
  return c;
}

const screen=(name,components,extra={})=>({id:id(),name,title:name,showHeader:true,inTabs:false,components,...extra});
const comp=(type,props)=>Object.assign(makeComponent(type),props);

export function createApp(name,template='app-blank'){
  if(typeof name!=='string'||!name.trim()||name.length>80||!Object.hasOwn(appTemplates,template))throw Error('Enter a project name and choose a valid template.');
  const app={format:'playform',version:1,kind:'app',id:id(),name:name.trim(),template,updated:Date.now(),
    theme:{accent:'#f5a524',background:'#0f1115',surface:'#1b1e26',text:'#f3f4f6',radius:14,font:'system'},
    variables:{},screens:[],startScreen:''};
  if(template==='app-blank'){
    app.screens=[screen('Home',[comp('heading',{text:name.trim()}),comp('text',{text:'Add components from the left, then press Play to try it.',muted:true})])];
  }
  if(template==='app-todo'){
    app.theme={accent:'#2563eb',background:'#f6f7fb',surface:'#ffffff',text:'#111827',radius:12,font:'system'};
    app.variables={NewTask:'',Tasks:['Buy milk','Call Sam','Finish the level design']};
    app.screens=[screen('Today',[
      comp('counter',{label:'Tasks left',variable:'Tasks'}),
      comp('input',{label:'New task',placeholder:'What needs doing?',variable:'NewTask'}),
      comp('button',{label:'Add task',action:{type:'append',variable:'Tasks',source:'NewTask'}}),
      comp('list',{source:'variable',variable:'Tasks',removable:true,items:[]})
    ])];
  }
  if(template==='app-links'){
    app.theme={accent:'#e11d48',background:'#fff7ed',surface:'#ffffff',text:'#1f2937',radius:999,font:'rounded'};
    app.screens=[screen('Links',[
      comp('spacer',{height:20}),
      comp('heading',{text:'Your Name',align:'center',size:'l'}),
      comp('text',{text:'Game dev, pixel artist and occasional streamer.',align:'center',muted:true}),
      comp('button',{label:'Play my latest game',style:'primary',action:{type:'link',url:'https://example.com'}}),
      comp('button',{label:'Watch the devlog',style:'secondary',action:{type:'link',url:'https://example.com'}}),
      comp('button',{label:'Say hello',style:'secondary',action:{type:'link',url:'mailto:hello@example.com'}})
    ],{showHeader:false})];
  }
  if(template==='app-event'){
    app.theme={accent:'#14b8a6',background:'#0b1416',surface:'#132226',text:'#e6f4f1',radius:16,font:'system'};
    app.variables={Name:'',Guest:false};
    const done=screen('Thanks',[comp('spacer',{height:40}),comp('heading',{text:'See you there, {{Name}}!',align:'center'}),comp('text',{text:'We saved your spot.',align:'center',muted:true}),comp('button',{label:'Back to details',style:'secondary',action:{type:'navigate',target:''}})]);
    const rsvp=screen('RSVP',[
      comp('input',{label:'Your name',placeholder:'Alex',variable:'Name'}),
      comp('toggle',{label:'Bringing a guest',variable:'Guest'}),
      comp('button',{label:'Send RSVP',action:{type:'navigate',target:done.id}})
    ],{inTabs:true});
    const details=screen('Details',[
      comp('heading',{text:'Game Jam Night',size:'l'}),
      comp('card',{title:'Saturday, 7 pm',text:'Community hall, room 2. Snacks provided.'}),
      comp('text',{text:'48 minutes, one theme, as many games as we can make. Bring a laptop.'}),
      comp('button',{label:'RSVP now',action:{type:'navigate',target:rsvp.id}})
    ],{inTabs:true});
    done.components[3].action.target=details.id;
    app.screens=[details,rsvp,done];
  }
  app.startScreen=app.screens[0].id;
  return app;
}

const isStr=(v,max)=>typeof v==='string'&&v.length<=max;
const isColor=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
const isImage=v=>v===''||(typeof v==='string'&&v.length<=3000000&&/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v));
export const isSafeLink=v=>typeof v==='string'&&v.length<=2000&&/^(https?:\/\/|mailto:|tel:)/i.test(v);
const varName=v=>v===''||(typeof v==='string'&&/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(v));

export function validateApp(p){
  const fail=m=>{throw Error(m||'This is not a supported Playform app project.')};
  if(!p||p.format!=='playform'||p.version!==1||p.kind!=='app')fail();
  if(!isStr(p.name,80)||!p.name.trim()||!Object.hasOwn(appTemplates,p.template)||!isStr(p.id,100))fail();
  const t=p.theme;
  if(!t||!['accent','background','surface','text'].every(k=>isColor(t[k]))||!Number.isFinite(t.radius)||t.radius<0||t.radius>999||!Object.hasOwn(fonts,t.font))fail('App style is invalid.');
  if(!p.variables||typeof p.variables!=='object'||Array.isArray(p.variables)||Object.keys(p.variables).length>100)fail('App values are invalid.');
  for(const[k,v]of Object.entries(p.variables)){
    if(!varName(k)||!k)fail('App values are invalid.');
    const ok=typeof v==='boolean'||(typeof v==='number'&&Number.isFinite(v))||isStr(v,2000)||(Array.isArray(v)&&v.length<=500&&v.every(i=>isStr(i,500)));
    if(!ok)fail('App values are invalid.');
  }
  if(!Array.isArray(p.screens)||!p.screens.length||p.screens.length>50)fail('App screens are invalid.');
  const screenIds=new Set(p.screens.map(s=>s?.id));
  for(const s of p.screens){
    if(!s||!isStr(s.id,100)||!isStr(s.name,60)||!isStr(s.title,80)||typeof s.showHeader!=='boolean'||typeof s.inTabs!=='boolean'||!Array.isArray(s.components)||s.components.length>200)fail('App screens are invalid.');
    for(const c of s.components)validateComponent(c,screenIds,fail);
  }
  if(!screenIds.has(p.startScreen))fail('Choose a start screen.');
  return p;
}

function validateComponent(c,screenIds,fail){
  if(!c||!isStr(c.id,100)||!Object.hasOwn(componentTypes,c.type))fail('An app component is invalid.');
  const bad=()=>fail(`The ${componentTypes[c.type].toLowerCase()} component is invalid.`);
  const align=v=>['left','center','right'].includes(v);
  switch(c.type){
    case 'heading':if(!isStr(c.text,200)||!['s','m','l'].includes(c.size)||!align(c.align))bad();break;
    case 'text':if(!isStr(c.text,2000)||!align(c.align)||typeof c.muted!=='boolean')bad();break;
    case 'button':{
      const a=c.action;
      if(!isStr(c.label,60)||!['primary','secondary','ghost'].includes(c.style)||!a||!Object.hasOwn(actionTypes,a.type))bad();
      if(a.type==='navigate'&&a.target&&!screenIds.has(a.target))bad();
      if(['set','add','append'].includes(a.type)&&!varName(a.variable))bad();
      if(a.type==='append'&&!varName(a.source))bad();
      if(a.type==='link'&&a.url&&!isSafeLink(a.url))fail('Links must start with https://, http://, mailto: or tel:.');
      if(a.type==='message'&&a.message!==undefined&&!isStr(a.message,200))bad();
      if(a.value!==undefined&&!isStr(String(a.value),500))bad();
      break;
    }
    case 'input':if(!isStr(c.label,80)||!isStr(c.placeholder,80)||!varName(c.variable))bad();break;
    case 'toggle':if(!isStr(c.label,80)||!varName(c.variable))bad();break;
    case 'list':if(!['static','variable'].includes(c.source)||!Array.isArray(c.items)||c.items.length>200||!c.items.every(i=>isStr(i,300))||!varName(c.variable)||typeof c.removable!=='boolean')bad();break;
    case 'counter':if(!isStr(c.label,80)||!varName(c.variable))bad();break;
    case 'card':if(!isStr(c.title,120)||!isStr(c.text,1000))bad();break;
    case 'image':if(!isImage(c.src)||!isStr(c.alt,200)||!Number.isFinite(c.height)||c.height<40||c.height>800||!['cover','contain'].includes(c.fit))bad();break;
    case 'spacer':if(!Number.isFinite(c.height)||c.height<4||c.height>400)bad();break;
  }
}

// ---------------------------------------------------------------------------
// Runtime. Keep this function free of references to module scope: it is
// serialised with toString() for exported apps.
// ---------------------------------------------------------------------------
export function runApp(root,app,opts={}){
  const editing=!!opts.editing;
  const vars=JSON.parse(JSON.stringify(app.variables||{}));
  let history=[opts.screenId||app.startScreen];
  const fontStacks={system:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',rounded:'"SF Pro Rounded","Nunito","Varela Round",ui-rounded,system-ui,sans-serif',serif:'Georgia,"Iowan Old Style","Times New Roman",serif',mono:'ui-monospace,"SF Mono",Menlo,Consolas,monospace'};
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
  const fill=s=>String(s??'').replace(/\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g,(m,k)=>{const v=vars[k];return Array.isArray(v)?String(v.length):v===undefined?'':typeof v==='boolean'?(v?'yes':'no'):String(v)});
  const screenById=sid=>app.screens.find(s=>s.id===sid)||app.screens[0];
  const current=()=>screenById(history[history.length-1]);
  let toastTimer;
  function toast(message){
    const t=root.querySelector('.pfa-toast');if(!t)return;
    t.textContent=fill(message);t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
  }
  function go(sid){if(!sid||sid===history[history.length-1])return;history.push(sid);if(history.length>60)history=history.slice(-60);render();opts.onNavigate?.(sid)}
  function run(a){
    if(editing||!a)return;
    switch(a.type){
      case 'navigate':go(a.target);break;
      case 'back':if(history.length>1){history.pop();render();opts.onNavigate?.(history[history.length-1])}break;
      case 'message':toast(a.message||'Done');break;
      case 'set':if(a.variable){const old=vars[a.variable];const v=a.value??'';vars[a.variable]=typeof old==='number'&&v!==''&&!isNaN(+v)?+v:typeof old==='boolean'?['true','yes','1','on'].includes(String(v).toLowerCase()):v;render()}break;
      case 'add':if(a.variable){vars[a.variable]=(+vars[a.variable]||0)+(+a.value||0);render()}break;
      case 'append':if(a.variable&&a.source){const text=String(vars[a.source]??'').trim();if(!text){toast('Type something first');break}if(!Array.isArray(vars[a.variable]))vars[a.variable]=[];vars[a.variable].push(text.slice(0,300));vars[a.source]='';render()}break;
      case 'link':if(a.url&&/^(https?:\/\/|mailto:|tel:)/i.test(a.url))window.open(a.url,'_blank','noopener');break;
    }
  }
  function component(c){
    const w=el('div','pfa-c pfa-'+c.type);
    w.dataset.cid=c.id;
    if(editing){w.draggable=true;if(c.id===opts.selectedId)w.classList.add('is-selected')}
    switch(c.type){
      case 'heading':{const h=el(c.size==='s'?'h3':c.size==='m'?'h2':'h1','pfa-h pfa-h-'+c.size,fill(c.text));h.style.textAlign=c.align;w.append(h);break}
      case 'text':{const p=el('p','pfa-p'+(c.muted?' muted':''),fill(c.text));p.style.textAlign=c.align;w.append(p);break}
      case 'button':{const b=el('button','pfa-btn pfa-btn-'+c.style,fill(c.label));b.type='button';b.onclick=()=>run(c.action);if(editing)b.tabIndex=-1;w.append(b);break}
      case 'input':{
        const l=el('label','pfa-field');l.append(el('span','',fill(c.label)));
        const i=el('input');i.placeholder=c.placeholder||'';i.value=c.variable?String(vars[c.variable]??''):'';i.disabled=editing;
        i.oninput=()=>{if(c.variable)vars[c.variable]=i.value};
        i.onkeydown=e=>{if(e.key==='Enter'){const next=w.nextElementSibling?.querySelector('.pfa-btn');next?.click()}};
        l.append(i);w.append(l);break}
      case 'toggle':{
        const l=el('label','pfa-switch');l.append(el('span','',fill(c.label)));
        const i=el('input');i.type='checkbox';i.checked=!!(c.variable&&vars[c.variable]);i.disabled=editing;
        i.onchange=()=>{if(c.variable){vars[c.variable]=i.checked;render()}};
        l.append(i,el('i'));w.append(l);break}
      case 'list':{
        const items=c.source==='variable'?(Array.isArray(vars[c.variable])?vars[c.variable]:[]):c.items;
        const ul=el('ul','pfa-list');
        if(!items.length)ul.append(el('li','pfa-empty','Nothing here yet'));
        items.forEach((text,index)=>{const li=el('li');li.append(el('span','',fill(text)));
          if(c.removable&&c.source==='variable'){const x=el('button','pfa-x','✓');x.type='button';x.setAttribute('aria-label','Done: '+text);if(editing)x.tabIndex=-1;x.onclick=()=>{if(editing)return;vars[c.variable].splice(index,1);render()};li.append(x)}
          ul.append(li)});
        w.append(ul);break}
      case 'counter':{const v=vars[c.variable];const n=Array.isArray(v)?v.length:v===undefined?0:v;w.append(el('span','pfa-num',String(typeof n==='boolean'?(n?'Yes':'No'):n)),el('span','pfa-num-label',fill(c.label)));break}
      case 'card':{const d=el('div','pfa-card');d.append(el('b','',fill(c.title)),el('p','',fill(c.text)));w.append(d);break}
      case 'image':{
        if(c.src){const img=el('img');img.src=c.src;img.alt=c.alt||'';img.style.height=c.height+'px';img.style.objectFit=c.fit;img.draggable=false;w.append(img)}
        else{const ph=el('div','pfa-img-empty','Image');ph.style.height=c.height+'px';w.append(ph)}
        break}
      case 'divider':w.append(el('hr'));break;
      case 'spacer':w.style.height=c.height+'px';if(editing)w.classList.add('pfa-spacer-edit');break;
    }
    return w;
  }
  function render(){
    const s=current(),t=app.theme;
    root.innerHTML='';
    const frame=el('div','pfa-app');
    frame.style.cssText=`--a:${t.accent};--bg:${t.background};--sf:${t.surface};--tx:${t.text};--r:${t.radius}px;font-family:${fontStacks[t.font]||fontStacks.system}`;
    if(s.showHeader){const h=el('header','pfa-bar');if(history.length>1){const b=el('button','pfa-back','‹');b.type='button';b.setAttribute('aria-label','Back');b.onclick=()=>run({type:'back'});if(editing)b.tabIndex=-1;h.append(b)}h.append(el('b','',fill(s.title)));frame.append(h)}
    const body=el('main','pfa-body');body.dataset.screen=s.id;
    s.components.forEach(c=>body.append(component(c)));
    if(editing&&!s.components.length)body.append(el('div','pfa-drop-hint','Add components from the panel, or drag them here.'));
    frame.append(body);
    const tabs=app.screens.filter(x=>x.inTabs);
    if(tabs.length>1){const nav=el('nav','pfa-tabs');tabs.forEach(x=>{const b=el('button',x.id===s.id?'on':'',x.name);b.type='button';if(editing)b.tabIndex=-1;b.onclick=()=>{if(!editing){history=[x.id];render();opts.onNavigate?.(x.id)}};nav.append(b)});frame.append(nav)}
    frame.append(el('div','pfa-toast'));
    root.append(frame);
  }
  render();
  return{render,go,get screenId(){return current().id},vars};
}

export const RUNTIME_CSS=`
.pfa-app{position:relative;display:flex;flex-direction:column;height:100%;min-height:100%;background:var(--bg);color:var(--tx);font-size:16px;line-height:1.45;overflow:hidden;-webkit-font-smoothing:antialiased}
.pfa-app *{box-sizing:border-box}
.pfa-bar{display:flex;align-items:center;gap:8px;min-height:52px;padding:8px 16px;border-bottom:1px solid color-mix(in srgb,var(--tx) 10%,transparent);background:color-mix(in srgb,var(--bg) 85%,var(--sf));font-size:17px}
.pfa-bar b{font-weight:650;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pfa-app .pfa-back{border:0;background:none;color:var(--a);font-size:30px;line-height:1;padding:0 6px 4px 0;cursor:pointer;min-height:0}
.pfa-body{flex:1;overflow:auto;padding:18px 18px 28px;display:flex;flex-direction:column;gap:12px}
.pfa-c{position:relative}
.pfa-h{margin:0;letter-spacing:-.02em;line-height:1.15;color:var(--tx)}
.pfa-h-l{font-size:30px;font-weight:750}.pfa-h-m{font-size:22px;font-weight:700}.pfa-h-s{font-size:17px;font-weight:650}
.pfa-p{margin:0;white-space:pre-wrap}.pfa-p.muted{opacity:.65}
.pfa-app .pfa-btn{width:100%;min-height:48px;padding:12px 18px;border-radius:min(var(--r),26px);font:inherit;font-weight:620;cursor:pointer;border:1px solid transparent;transition:transform .1s,filter .15s}
.pfa-app .pfa-btn:active{transform:scale(.98)}
.pfa-app .pfa-btn-primary{background:var(--a);color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.15)}
.pfa-app .pfa-btn-secondary{background:var(--sf);color:var(--tx);border-color:color-mix(in srgb,var(--tx) 14%,transparent)}
.pfa-app .pfa-btn-ghost{background:none;color:var(--a)}
.pfa-field{display:grid;gap:6px;margin:0;font-size:14px;color:inherit}
.pfa-field span{opacity:.75;font-weight:550}
.pfa-app .pfa-field input{width:100%;font:inherit;font-size:16px;padding:12px 14px;border-radius:min(var(--r),16px);border:1px solid color-mix(in srgb,var(--tx) 16%,transparent);background:var(--sf);color:var(--tx);outline:none;margin:0}
.pfa-app .pfa-field input:focus{border-color:var(--a);box-shadow:0 0 0 3px color-mix(in srgb,var(--a) 25%,transparent)}
.pfa-app .pfa-switch{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:12px 14px;background:var(--sf);border-radius:min(var(--r),16px);cursor:pointer;font-size:16px;color:inherit}
.pfa-app .pfa-switch input{position:absolute;opacity:0;pointer-events:none}
.pfa-app .pfa-switch i{flex-shrink:0;width:46px;height:28px;border-radius:99px;background:color-mix(in srgb,var(--tx) 22%,transparent);position:relative;transition:background .2s}
.pfa-app .pfa-switch i:after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
.pfa-app .pfa-switch input:checked+i{background:var(--a)}.pfa-app .pfa-switch input:checked+i:after{transform:translateX(18px)}
.pfa-list{list-style:none;margin:0;padding:0;background:var(--sf);border-radius:min(var(--r),18px);overflow:hidden}
.pfa-list li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 16px;border-bottom:1px solid color-mix(in srgb,var(--tx) 8%,transparent)}
.pfa-list li:last-child{border-bottom:0}
.pfa-list .pfa-empty{opacity:.55;justify-content:center}
.pfa-app .pfa-x{flex-shrink:0;width:30px;height:30px;min-height:0;padding:0;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--tx) 25%,transparent);background:none;color:var(--a);cursor:pointer;font-size:14px}
.pfa-counter{display:flex;flex-direction:column;align-items:flex-start;padding:14px 16px;background:var(--sf);border-radius:min(var(--r),18px)}
.pfa-num{font-size:36px;font-weight:750;letter-spacing:-.03em;line-height:1.1;color:var(--a)}
.pfa-num-label{opacity:.65;font-size:14px}
.pfa-card{padding:16px;background:var(--sf);border-radius:min(var(--r),20px);border:1px solid color-mix(in srgb,var(--tx) 8%,transparent)}
.pfa-card b{display:block;font-size:17px;margin-bottom:4px}.pfa-card p{margin:0;opacity:.75}
.pfa-image img{display:block;width:100%;border-radius:min(var(--r),20px)}
.pfa-img-empty{display:grid;place-items:center;border-radius:min(var(--r),20px);background:var(--sf);border:1.5px dashed color-mix(in srgb,var(--tx) 25%,transparent);opacity:.7;font-size:14px}
.pfa-divider hr{border:0;border-top:1px solid color-mix(in srgb,var(--tx) 14%,transparent);margin:4px 0}
.pfa-tabs{display:flex;border-top:1px solid color-mix(in srgb,var(--tx) 10%,transparent);background:color-mix(in srgb,var(--bg) 80%,var(--sf));padding:6px 6px calc(6px + env(safe-area-inset-bottom))}
.pfa-app .pfa-tabs button{flex:1;border:0;background:none;color:var(--tx);opacity:.55;font:inherit;font-size:13px;font-weight:600;padding:10px 4px;border-radius:12px;cursor:pointer;min-height:0}
.pfa-app .pfa-tabs button.on{opacity:1;color:var(--a);background:color-mix(in srgb,var(--a) 12%,transparent)}
.pfa-toast{position:absolute;left:50%;bottom:84px;transform:translate(-50%,20px);opacity:0;pointer-events:none;background:color-mix(in srgb,var(--tx) 92%,transparent);color:var(--bg);padding:10px 16px;border-radius:99px;font-size:14px;font-weight:600;transition:all .25s;white-space:nowrap;max-width:85%;overflow:hidden;text-overflow:ellipsis}
.pfa-toast.show{opacity:1;transform:translate(-50%,0)}
.pfa-drop-hint{border:1.5px dashed color-mix(in srgb,var(--tx) 25%,transparent);border-radius:16px;padding:40px 20px;text-align:center;opacity:.6;font-size:14px}
.pfa-app .pfa-btn:hover{filter:brightness(1.07)}
.pfa-app .pfa-btn-primary:hover{background:var(--a);border-color:transparent}
.pfa-app .pfa-btn-secondary:hover{background:var(--sf);border-color:color-mix(in srgb,var(--tx) 24%,transparent)}
.pfa-app .pfa-btn-ghost:hover{background:color-mix(in srgb,var(--a) 10%,transparent)}
.pfa-app .pfa-tabs button:hover,.pfa-app .pfa-back:hover,.pfa-app .pfa-x:hover{background:none;border-color:inherit}
.pfa-app .pfa-tabs button.on:hover{background:color-mix(in srgb,var(--a) 12%,transparent)}
.pfa-app button{box-shadow:none;text-transform:none;letter-spacing:normal}
`;

// Builds a single-file web app from an app project.
export function exportAppHTML(app){
  const data=JSON.stringify(app).replace(/</g,'\\u003c');
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="${app.theme.background}"><title>${esc(app.name)}</title><style>html,body{margin:0;height:100%;background:${app.theme.background}}#app{height:100dvh;max-width:560px;margin:0 auto}${RUNTIME_CSS}</style></head><body><div id="app"></div><script id="app-data" type="application/json">${data}</script><script>(${runApp.toString()})(document.getElementById('app'),JSON.parse(document.getElementById('app-data').textContent));</script></body></html>`;
}

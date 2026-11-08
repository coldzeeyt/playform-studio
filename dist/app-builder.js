// App builder: screens, a component palette, a live phone canvas and a properties panel.
import{componentTypes,actionTypes,fonts,makeComponent,runApp,RUNTIME_CSS,exportAppHTML,isSafeLink,validateApp}from'./app-project.js';

const svg=(d,size=16)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const icons={
  heading:'<path d="M6 4v16M18 4v16M6 12h12"/>',
  text:'<path d="M4 6h16M4 12h16M4 18h10"/>',
  button:'<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M9 12h6"/>',
  input:'<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10v4"/>',
  toggle:'<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  counter:'<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  card:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h6"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 20"/>',
  divider:'<path d="M3 12h18"/>',
  spacer:'<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>',
  back:'<path d="M15 18l-6-6 6-6"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  play:'<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  up:'<path d="m6 15 6-6 6 6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  screen:'<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
};
const themes={
  Midnight:{accent:'#f5a524',background:'#0f1115',surface:'#1b1e26',text:'#f3f4f6'},
  Paper:{accent:'#2563eb',background:'#f6f7fb',surface:'#ffffff',text:'#111827'},
  Ocean:{accent:'#14b8a6',background:'#0b1416',surface:'#132226',text:'#e6f4f1'},
  Peach:{accent:'#e11d48',background:'#fff7ed',surface:'#ffffff',text:'#1f2937'},
  Grape:{accent:'#a855f7',background:'#120f1a',surface:'#1e1828',text:'#f1ecf9'}
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const VAR_RE=/^[A-Za-z][A-Za-z0-9_]{0,39}$/;

function ensureRuntimeStyle(){
  if(document.getElementById('pf-app-runtime'))return;
  const s=document.createElement('style');s.id='pf-app-runtime';s.textContent=RUNTIME_CSS;document.head.append(s);
}

export function mountAppEditor({root,project,onSave,onHome,notify}){
  ensureRuntimeStyle();
  let screenId=project.startScreen,selectedId=null,mode='edit',pane='phone',runtime=null,undo=[],redo=[],editSnapshot=false;
  const $=s=>root.querySelector(s);
  const screen=()=>project.screens.find(s=>s.id===screenId)||project.screens[0];
  const selected=()=>screen().components.find(c=>c.id===selectedId)||null;

  // ---------- history and saving ----------
  const snap=()=>JSON.stringify(project);
  function pushUndo(){undo.push(snap());if(undo.length>120)undo.shift();redo=[];updateHistoryButtons()}
  function restore(json){const data=JSON.parse(json);for(const k of Object.keys(project))delete project[k];Object.assign(project,data);if(!project.screens.some(s=>s.id===screenId))screenId=project.startScreen;if(!selected())selectedId=null;persist();renderAll()}
  function doUndo(){if(!undo.length)return;redo.push(snap());restore(undo.pop())}
  function doRedo(){if(!redo.length)return;undo.push(snap());restore(redo.pop())}
  let saveTimer;
  function persist(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{const ok=onSave();const s=$('.appb-saved');if(s)s.textContent=ok?'Saved':'Not saved, export a backup'},250);
    const s=$('.appb-saved');if(s)s.textContent='Saving…';
  }
  function change(fn,{full=true}={}){pushUndo();fn();persist();full?renderAll():renderPhone()}
  // For text fields: one undo step per focus, live updates without re-rendering the panel.
  function liveEdit(input,apply){
    input.addEventListener('focus',()=>{editSnapshot=false});
    input.addEventListener('input',()=>{if(!editSnapshot){pushUndo();editSnapshot=true}apply(input.value);persist();renderPhone();renderScreens()});
  }
  function updateHistoryButtons(){const u=$('[data-undo]'),r=$('[data-redo]');if(u)u.disabled=!undo.length;if(r)r.disabled=!redo.length}

  // ---------- shell ----------
  root.innerHTML=`<div class="appb" data-pane="phone" data-mode="edit">
    <header class="appb-top">
      <button class="appb-home" data-home>${svg(icons.back,14)}<span>Projects</span></button>
      <input class="appb-name" value="${esc(project.name)}" maxlength="80" aria-label="App name">
      <span class="appb-kind">App</span>
      <span class="appb-saved" role="status">Saved</span>
      <span class="appb-fill"></span>
      <button class="appb-icon" data-undo aria-label="Undo" title="Undo (Ctrl+Z)" disabled>${svg(icons.undo)}</button>
      <button class="appb-icon" data-redo aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled>${svg(icons.redo)}</button>
      <details class="appb-menu"><summary aria-label="Export">${svg(icons.download)}<span>Export</span></summary><div>
        <button data-export-html>${svg(icons.download)}<span><b>Web app</b><small>One HTML file that runs in any browser</small></span></button>
        <button data-export-json>${svg(icons.download)}<span><b>Project backup</b><small>JSON you can open again in Playform</small></span></button>
      </div></details>
      <button class="primary appb-play" data-play>${svg(icons.play,13)}<span>Play</span></button>
    </header>
    <nav class="appb-panes" aria-label="Builder panels">
      <button data-pane-btn="build">Screens & add</button><button data-pane-btn="phone" class="active">Phone</button><button data-pane-btn="props">Properties</button>
    </nav>
    <div class="appb-body">
      <aside class="appb-left">
        <section class="appb-section"><div class="appb-section-head"><h3>Screens</h3><button class="appb-mini" data-add-screen>${svg(icons.plus,14)}<span>Add</span></button></div><div class="appb-screens"></div></section>
        <section class="appb-section"><div class="appb-section-head"><h3>Add to screen</h3></div>
          <div class="appb-palette">${Object.entries(componentTypes).map(([t,n])=>`<button draggable="true" data-add="${t}" title="Add ${n.toLowerCase()}">${svg(icons[t],18)}<span>${n}</span></button>`).join('')}</div>
          <p class="appb-tip">Click to add below the selected item, or drag onto the phone.</p>
        </section>
      </aside>
      <main class="appb-stage">
        <div class="appb-stagebar"><span class="appb-screen-chip"></span><span class="appb-mode"></span></div>
        <div class="appb-phone"><div class="appb-notch"></div><div class="appb-screen"></div></div>
      </main>
      <aside class="appb-right"></aside>
    </div>
  </div>`;

  // ---------- screens list ----------
  function renderScreens(){
    $('.appb-screens').innerHTML=project.screens.map(s=>`<button class="appb-screen-row${s.id===screenId?' active':''}" data-screen="${esc(s.id)}">${svg(icons.screen,15)}<span>${esc(s.name)}</span>${s.id===project.startScreen?`<em title="Start screen">${svg(icons.star,13)}</em>`:''}<small>${s.components.length}</small></button>`).join('');
    root.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>{screenId=b.dataset.screen;selectedId=null;if(mode==='play')stopPlay();renderAll()});
  }

  // ---------- phone ----------
  function renderPhone(){
    const host=$('.appb-screen');
    if(mode==='play')return;
    runtime=runApp(host,project,{editing:true,screenId,selectedId});
    $('.appb-screen-chip').innerHTML=`${svg(icons.screen,13)} ${esc(screen().name)}`;
    $('.appb-mode').textContent=selected()?componentTypes[selected().type]+' selected':'Editing';
  }
  function startPlay(){
    mode='play';selectedId=null;root.querySelector('.appb').dataset.mode='play';
    runtime=runApp($('.appb-screen'),project,{editing:false,onNavigate:sid=>{$('.appb-screen-chip').innerHTML=`${svg(icons.screen,13)} ${esc(project.screens.find(s=>s.id===sid)?.name||'')}`}});
    $('.appb-screen-chip').innerHTML=`${svg(icons.screen,13)} ${esc(project.screens.find(s=>s.id===project.startScreen).name)}`;
    $('.appb-mode').textContent='Playing. Tap around like a user would.';
    const b=$('[data-play]');b.innerHTML=`${svg(icons.stop,12)}<span>Stop</span>`;
    if(innerWidth<=820)setPane('phone');
    renderProps();
  }
  function stopPlay(){
    mode='edit';root.querySelector('.appb').dataset.mode='edit';
    $('[data-play]').innerHTML=`${svg(icons.play,13)}<span>Play</span>`;
    renderAll();
  }

  // Selecting and drag-and-drop inside the phone
  const phoneHost=$('.appb-screen');
  phoneHost.addEventListener('click',e=>{
    if(mode!=='edit')return;
    const c=e.target.closest('.pfa-c');
    selectedId=c?c.dataset.cid:null;renderPhone();renderProps();
  });
  let dropIndex=-1;
  function clearDrop(){root.querySelectorAll('.drop-before,.drop-after').forEach(n=>n.classList.remove('drop-before','drop-after'))}
  phoneHost.addEventListener('dragstart',e=>{const c=e.target.closest('.pfa-c');if(!c||mode!=='edit')return;e.dataTransfer.setData('text/plain','move:'+c.dataset.cid);e.dataTransfer.effectAllowed='move';c.classList.add('dragging')});
  phoneHost.addEventListener('dragend',()=>{clearDrop();root.querySelectorAll('.dragging').forEach(n=>n.classList.remove('dragging'))});
  phoneHost.addEventListener('dragover',e=>{
    if(mode!=='edit')return;e.preventDefault();clearDrop();
    const items=[...phoneHost.querySelectorAll('.pfa-body>.pfa-c')];
    dropIndex=items.length;
    for(let i=0;i<items.length;i++){const r=items[i].getBoundingClientRect();if(e.clientY<r.top+r.height/2){dropIndex=i;break}}
    if(items.length){if(dropIndex<items.length)items[dropIndex].classList.add('drop-before');else items[items.length-1].classList.add('drop-after')}
  });
  phoneHost.addEventListener('dragleave',e=>{if(!phoneHost.contains(e.relatedTarget))clearDrop()});
  phoneHost.addEventListener('drop',e=>{
    e.preventDefault();clearDrop();if(mode!=='edit')return;
    const data=e.dataTransfer.getData('text/plain');const list=screen().components;
    if(data.startsWith('new:')){const type=data.slice(4);if(!componentTypes[type])return;const c=makeComponent(type);change(()=>{list.splice(dropIndex<0?list.length:dropIndex,0,c);selectedId=c.id})}
    else if(data.startsWith('move:')){const from=list.findIndex(c=>c.id===data.slice(5));if(from<0)return;let to=dropIndex<0?list.length:dropIndex;if(to>from)to--;if(to===from)return;change(()=>{const[c]=list.splice(from,1);list.splice(to,0,c);selectedId=c.id})}
  });

  // ---------- properties ----------
  function field(label,control,hint){const w=document.createElement('label');w.className='appb-field';w.innerHTML=`<span>${esc(label)}</span>`;w.append(control);if(hint){const h=document.createElement('small');h.textContent=hint;w.append(h)}return w}
  function textInput(obj,key,{multiline=false,max=200,placeholder=''}={}){
    const i=document.createElement(multiline?'textarea':'input');i.value=obj[key]??'';i.maxLength=max;i.placeholder=placeholder;if(multiline)i.rows=3;
    liveEdit(i,v=>{obj[key]=v});return i;
  }
  function select(obj,key,options,after){
    const s=document.createElement('select');
    s.innerHTML=Object.entries(options).map(([v,n])=>`<option value="${esc(v)}"${String(obj[key])===v?' selected':''}>${esc(n)}</option>`).join('');
    s.onchange=()=>change(()=>{obj[key]=s.value;after?.(s.value)});return s;
  }
  function checkbox(obj,key,label){
    const w=document.createElement('label');w.className='appb-check';
    const i=document.createElement('input');i.type='checkbox';i.checked=!!obj[key];
    i.onchange=()=>change(()=>{obj[key]=i.checked});
    w.append(i,document.createTextNode(label));return w;
  }
  function numberInput(obj,key,min,max,step=1){
    const i=document.createElement('input');i.type='number';i.min=min;i.max=max;i.step=step;i.value=obj[key];
    i.addEventListener('focus',()=>{editSnapshot=false});
    i.addEventListener('input',()=>{const v=+i.value;if(!Number.isFinite(v)||v<min||v>max)return;if(!editSnapshot){pushUndo();editSnapshot=true}obj[key]=v;persist();renderPhone()});
    return i;
  }
  // Value picker: type a name; new names create the value with a sensible starting value.
  function valueInput(obj,key,initial,placeholder='e.g. Score'){
    const listId='appb-vars-'+Math.random().toString(36).slice(2);
    const wrap=document.createElement('div');wrap.className='appb-var';
    const i=document.createElement('input');i.value=obj[key]||'';i.placeholder=placeholder;i.setAttribute('list',listId);i.maxLength=40;i.autocomplete='off';
    const dl=document.createElement('datalist');dl.id=listId;dl.innerHTML=Object.keys(project.variables).map(v=>`<option value="${esc(v)}">`).join('');
    i.onchange=()=>{
      const name=i.value.trim();
      if(name&&!VAR_RE.test(name)){notify('Value names start with a letter and use letters, numbers or _.');i.value=obj[key]||'';return}
      change(()=>{obj[key]=name;if(name&&!Object.hasOwn(project.variables,name))project.variables[name]=JSON.parse(JSON.stringify(initial))});
    };
    wrap.append(i,dl);return wrap;
  }
  function iconButton(icon,label,fn,{danger=false,disabled=false}={}){const b=document.createElement('button');b.className='appb-mini'+(danger?' danger':'');b.innerHTML=svg(icon,14)+`<span>${esc(label)}</span>`;b.disabled=disabled;b.onclick=fn;return b}
  function section(title,...children){const s=document.createElement('section');s.className='appb-section';s.innerHTML=`<div class="appb-section-head"><h3>${esc(title)}</h3></div>`;children.flat().filter(Boolean).forEach(c=>s.append(c));return s}

  function componentFields(c){
    const f=[];
    switch(c.type){
      case 'heading':f.push(field('Text',textInput(c,'text',{max:200})),field('Size',select(c,'size',{l:'Large',m:'Medium',s:'Small'})),field('Align',select(c,'align',{left:'Left',center:'Center',right:'Right'})));break;
      case 'text':f.push(field('Text',textInput(c,'text',{multiline:true,max:2000}),'Use {{Name}} to show a value.'),field('Align',select(c,'align',{left:'Left',center:'Center',right:'Right'})),checkbox(c,'muted','Softer color'));break;
      case 'button':f.push(field('Label',textInput(c,'label',{max:60})),field('Style',select(c,'style',{primary:'Filled',secondary:'Outlined',ghost:'Text only'})));break;
      case 'input':f.push(field('Label',textInput(c,'label',{max:80})),field('Placeholder',textInput(c,'placeholder',{max:80})),field('Saves into value',valueInput(c,'variable',''),'Other components can show it with {{Name}}.'));break;
      case 'toggle':f.push(field('Label',textInput(c,'label',{max:80})),field('Saves into value',valueInput(c,'variable',false)));break;
      case 'list':
        f.push(field('Items come from',select(c,'source',{static:'Items I type here',variable:'A list value'})));
        if(c.source==='static'){const t=document.createElement('textarea');t.rows=5;t.value=c.items.join('\n');liveEdit(t,v=>{c.items=v.split('\n').map(x=>x.slice(0,300)).filter((x,i,a)=>x||i<a.length-1).slice(0,200)});f.push(field('Items, one per line',t))}
        else f.push(field('List value',valueInput(c,'variable',[],'e.g. Tasks')),checkbox(c,'removable','Tick off to remove'));
        break;
      case 'counter':f.push(field('Label',textInput(c,'label',{max:80})),field('Shows value',valueInput(c,'variable',0),'Lists show how many items they hold.'));break;
      case 'card':f.push(field('Title',textInput(c,'title',{max:120})),field('Text',textInput(c,'text',{multiline:true,max:1000})));break;
      case 'image':{
        const up=document.createElement('input');up.type='file';up.accept='image/png,image/jpeg,image/webp,image/gif';
        up.onchange=()=>{const file=up.files[0];if(!file)return;if(file.size>2e6){notify('Images must be smaller than 2 MB.');return}const r=new FileReader();r.onload=()=>change(()=>{c.src=String(r.result)});r.readAsDataURL(file)};
        f.push(field('Picture',up));
        if(c.src)f.push(iconButton(icons.trash,'Remove picture',()=>change(()=>{c.src=''})));
        f.push(field('Description for screen readers',textInput(c,'alt',{max:200})),field('Height (px)',numberInput(c,'height',40,800,10)),field('Fit',select(c,'fit',{cover:'Fill and crop',contain:'Show whole image'})));
        break;}
      case 'spacer':f.push(field('Height (px)',numberInput(c,'height',4,400,4)));break;
      case 'divider':{const p=document.createElement('p');p.className='appb-tip';p.textContent='A thin line between sections.';f.push(p);break}
    }
    return f;
  }
  function actionFields(c){
    const a=c.action,f=[field('When tapped',select(a,'type',actionTypes,v=>{for(const k of Object.keys(a))if(k!=='type')delete a[k];if(v==='navigate')a.target=project.screens.find(s=>s.id!==screenId)?.id||'';if(v==='add')a.value=1}))];
    switch(a.type){
      case 'navigate':f.push(field('Screen',select(a,'target',Object.fromEntries([['','Choose a screen'],...project.screens.filter(s=>s.id!==screenId).map(s=>[s.id,s.name])]))));
        if(project.screens.length<2)f.push(iconButton(icons.plus,'Create a new screen',()=>{const s=newScreen();change(()=>{project.screens.push(s);a.target=s.id})}));break;
      case 'message':f.push(field('Message',textInput(a,'message',{max:200,placeholder:'Saved!'}),'You can use {{Name}} here too.'));break;
      case 'set':f.push(field('Value',valueInput(a,'variable','')),field('Set it to',textInput(a,'value',{max:500})));break;
      case 'add':f.push(field('Number value',valueInput(a,'variable',0,'e.g. Score')),field('Add',numberInput(a,'value',-1e6,1e6)));break;
      case 'append':f.push(field('Take text from',valueInput(a,'source','','e.g. NewTask'),'The value a text field saves into.'),field('Add it to list',valueInput(a,'variable',[],'e.g. Tasks')));break;
      case 'link':{const i=textInput(a,'url',{max:2000,placeholder:'https://'});i.addEventListener('change',()=>{if(i.value&&!isSafeLink(i.value))notify('Links must start with https://, http://, mailto: or tel:.')});f.push(field('Address',i));break}
    }
    return f;
  }
  function newScreen(){return{id:crypto.randomUUID(),name:'Screen '+(project.screens.length+1),title:'Screen '+(project.screens.length+1),showHeader:true,inTabs:false,components:[]}}

  function renderProps(){
    const panel=$('.appb-right');panel.innerHTML='';
    if(mode==='play'){panel.append(section('Playing',Object.assign(document.createElement('p'),{className:'appb-tip',textContent:'Values reset each time you press Play. Stop to keep editing.'})));return}
    const c=selected();
    if(c){
      const list=screen().components,i=list.indexOf(c);
      const head=document.createElement('div');head.className='appb-props-head';
      head.innerHTML=`<button class="appb-crumb" data-deselect>${svg(icons.back,13)} ${esc(screen().name)}</button><h2>${svg(icons[c.type],17)} ${esc(componentTypes[c.type])}</h2>`;
      head.querySelector('[data-deselect]').onclick=()=>{selectedId=null;renderPhone();renderProps()};
      const tools=document.createElement('div');tools.className='appb-tools';
      tools.append(
        iconButton(icons.up,'Up',()=>change(()=>{list.splice(i-1,0,list.splice(i,1)[0])}),{disabled:i===0}),
        iconButton(icons.down,'Down',()=>change(()=>{list.splice(i+1,0,list.splice(i,1)[0])}),{disabled:i===list.length-1}),
        iconButton(icons.copy,'Duplicate',duplicateSelected),
        iconButton(icons.trash,'Delete',deleteSelected,{danger:true}));
      panel.append(head,tools,section('Content',componentFields(c)));
      if(c.type==='button')panel.append(section('Action',actionFields(c)));
      return;
    }
    const s=screen();
    const name=textInput(s,'name',{max:60});name.addEventListener('input',()=>{s.title=s.name});
    panel.append(section('Screen',
      field('Name',name),
      field('Title in the top bar',textInput(s,'title',{max:80})),
      checkbox(s,'showHeader','Show top bar'),
      checkbox(s,'inTabs','Show in bottom tabs'),
      (()=>{const row=document.createElement('div');row.className='appb-tools';row.append(
        iconButton(icons.star,s.id===project.startScreen?'Start screen':'Make start screen',()=>change(()=>{project.startScreen=s.id}),{disabled:s.id===project.startScreen}),
        iconButton(icons.copy,'Duplicate',()=>{const copy=JSON.parse(JSON.stringify(s));copy.id=crypto.randomUUID();copy.name=(s.name+' copy').slice(0,60);copy.title=copy.name;copy.components.forEach(x=>x.id=crypto.randomUUID());change(()=>{project.screens.splice(project.screens.indexOf(s)+1,0,copy);screenId=copy.id})}),
        iconButton(icons.trash,'Delete',deleteScreen,{danger:true,disabled:project.screens.length<2}));return row})()
    ));
    const t=project.theme;
    const swatches=document.createElement('div');swatches.className='appb-swatches';
    swatches.innerHTML=Object.entries(themes).map(([n,v])=>`<button data-theme="${n}" title="${n}" style="--s1:${v.background};--s2:${v.accent};--s3:${v.surface}"><i></i><span>${n}</span></button>`).join('');
    swatches.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>change(()=>Object.assign(project.theme,themes[b.dataset.theme])));
    const color=(key,label)=>{const i=document.createElement('input');i.type='color';i.value=t[key];i.addEventListener('focus',()=>{editSnapshot=false});i.addEventListener('input',()=>{if(!editSnapshot){pushUndo();editSnapshot=true}t[key]=i.value;persist();renderPhone()});const w=field(label,i);w.classList.add('appb-color');return w};
    const radius=document.createElement('input');radius.type='range';radius.min=0;radius.max=28;radius.value=Math.min(t.radius,28);radius.addEventListener('focus',()=>{editSnapshot=false});radius.addEventListener('input',()=>{if(!editSnapshot){pushUndo();editSnapshot=true}t.radius=+radius.value===28?999:+radius.value;persist();renderPhone()});
    const colors=document.createElement('div');colors.className='appb-colors';colors.append(color('accent','Accent'),color('background','Background'),color('surface','Cards'),color('text','Text'));
    panel.append(section('App style',swatches,colors,field('Corners',radius),field('Font',select(t,'font',fonts))));
    // Values
    const rows=document.createElement('div');rows.className='appb-values';
    const kind=v=>Array.isArray(v)?'list':typeof v==='boolean'?'yes/no':typeof v==='number'?'number':'text';
    const entries=Object.entries(project.variables);
    if(!entries.length)rows.innerHTML='<p class="appb-tip">Values hold what people type, tick or count. Text fields, switches and buttons create them for you.</p>';
    for(const[k,v]of entries){
      const r=document.createElement('div');r.className='appb-value';
      r.innerHTML=`<b>${esc(k)}</b><small>${kind(v)}</small>`;
      let input;
      if(typeof v==='boolean'){input=document.createElement('input');input.type='checkbox';input.checked=v;input.onchange=()=>change(()=>{project.variables[k]=input.checked})}
      else{input=document.createElement('input');input.value=Array.isArray(v)?v.join(', '):String(v);input.title=Array.isArray(v)?'Starting items, separated by commas':'Starting value';
        input.addEventListener('focus',()=>{editSnapshot=false});
        input.addEventListener('input',()=>{if(!editSnapshot){pushUndo();editSnapshot=true}project.variables[k]=Array.isArray(v)?input.value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,500).map(x=>x.slice(0,500)):typeof v==='number'?(Number.isFinite(+input.value)?+input.value:0):input.value.slice(0,2000);persist();renderPhone()})}
      const del=document.createElement('button');del.className='appb-icon';del.setAttribute('aria-label','Delete value '+k);del.innerHTML=svg(icons.trash,14);del.onclick=()=>change(()=>{delete project.variables[k]});
      r.append(input,del);rows.append(r);
    }
    panel.append(section('Values',rows));
  }

  function duplicateSelected(){const c=selected();if(!c)return;const list=screen().components;const copy=JSON.parse(JSON.stringify(c));copy.id=crypto.randomUUID();change(()=>{list.splice(list.indexOf(c)+1,0,copy);selectedId=copy.id})}
  function deleteSelected(){const c=selected();if(!c)return;const list=screen().components;change(()=>{list.splice(list.indexOf(c),1);selectedId=null})}
  function deleteScreen(){
    if(project.screens.length<2)return;const s=screen();
    if(s.components.length&&!confirm(`Delete the “${s.name}” screen and its ${s.components.length} components?`))return;
    change(()=>{const i=project.screens.indexOf(s);project.screens.splice(i,1);for(const sc of project.screens)for(const c of sc.components)if(c.action?.target===s.id)c.action.target='';if(project.startScreen===s.id)project.startScreen=project.screens[0].id;screenId=project.screens[Math.max(0,i-1)].id;selectedId=null});
  }
  function addComponent(type){
    const c=makeComponent(type),list=screen().components,sel=selected();
    change(()=>{list.splice(sel?list.indexOf(sel)+1:list.length,0,c);selectedId=c.id});
    requestAnimationFrame(()=>phoneHost.querySelector(`[data-cid="${c.id}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'}));
  }

  function setPane(p){pane=p;root.querySelector('.appb').dataset.pane=p;root.querySelectorAll('[data-pane-btn]').forEach(b=>b.classList.toggle('active',b.dataset.paneBtn===p))}
  function renderAll(){renderScreens();renderPhone();renderProps();updateHistoryButtons()}

  // ---------- wiring ----------
  $('[data-home]').onclick=()=>{clearTimeout(saveTimer);onSave();onHome()};
  liveEdit($('.appb-name'),v=>{if(v.trim())project.name=v.trim().slice(0,80)});
  $('[data-undo]').onclick=doUndo;$('[data-redo]').onclick=doRedo;
  $('[data-play]').onclick=()=>mode==='play'?stopPlay():startPlay();
  $('[data-add-screen]').onclick=()=>{const s=newScreen();change(()=>{project.screens.push(s);screenId=s.id;selectedId=null})};
  root.querySelectorAll('[data-add]').forEach(b=>{
    b.onclick=()=>{if(mode==='play')stopPlay();addComponent(b.dataset.add);if(innerWidth<=820)setPane('phone')};
    b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain','new:'+b.dataset.add);e.dataTransfer.effectAllowed='copy'});
  });
  root.querySelectorAll('[data-pane-btn]').forEach(b=>b.onclick=()=>setPane(b.dataset.paneBtn));
  const download=(name,type,text)=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  const fileName=()=>(project.name.replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')||'app').slice(0,60);
  $('[data-export-html]').onclick=()=>{try{validateApp(project);download(fileName()+'.html','text/html',exportAppHTML(project));notify('Web app downloaded. Open it in a browser or host it anywhere.')}catch(e){notify(e.message)}$('.appb-menu').open=false};
  $('[data-export-json]').onclick=()=>{download(fileName()+'.playform.json','application/json',JSON.stringify(project,null,2));notify('Project backup downloaded.');$('.appb-menu').open=false};

  function onKey(e){
    const typing=e.target.closest?.('input,textarea,select,[contenteditable]');
    const mod=e.ctrlKey||e.metaKey;
    if(mod&&e.key.toLowerCase()==='z'&&!typing){e.preventDefault();e.shiftKey?doRedo():doUndo();return}
    if(mod&&e.key.toLowerCase()==='y'&&!typing){e.preventDefault();doRedo();return}
    if(typing||mode!=='edit')return;
    if((e.key==='Delete'||e.key==='Backspace')&&selected()){e.preventDefault();deleteSelected()}
    else if(mod&&e.key.toLowerCase()==='d'&&selected()){e.preventDefault();duplicateSelected()}
    else if(e.key==='Escape'&&selectedId){selectedId=null;renderPhone();renderProps()}
  }
  document.addEventListener('keydown',onKey);
  renderAll();
  return()=>{document.removeEventListener('keydown',onKey);clearTimeout(saveTimer)};
}

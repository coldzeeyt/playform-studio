import{test}from'node:test';
import assert from'node:assert/strict';
import{appTemplates,createApp,validateApp,makeComponent,componentTypes,exportAppHTML}from'../dist/app-project.js';

test('every app template creates a valid app',()=>{
  for(const id of Object.keys(appTemplates)){
    const app=createApp('My app',id);
    assert.equal(app.kind,'app');
    assert.ok(app.screens.some(s=>s.id===app.startScreen));
    assert.doesNotThrow(()=>validateApp(JSON.parse(JSON.stringify(app))));
  }
});

test('every component type validates with its defaults',()=>{
  const app=createApp('Parts','app-blank');
  for(const type of Object.keys(componentTypes))app.screens[0].components.push(makeComponent(type));
  assert.doesNotThrow(()=>validateApp(app));
});

test('unsafe or broken app data is rejected',()=>{
  const link=createApp('Links','app-links');
  link.screens[0].components.find(c=>c.type==='button').action.url='javascript:alert(1)';
  assert.throws(()=>validateApp(link),/Links must start/);
  const name=createApp('Vars','app-todo');name.variables['1bad']='x';
  assert.throws(()=>validateApp(name));
  const nav=createApp('Nav','app-event');nav.screens[0].components.find(c=>c.type==='button').action.target='missing';
  assert.throws(()=>validateApp(nav));
  const start=createApp('Start','app-blank');start.startScreen='nope';
  assert.throws(()=>validateApp(start),/start screen/);
  assert.throws(()=>validateApp({...createApp('Kind','app-blank'),kind:'game'}));
  assert.throws(()=>createApp('','app-blank'));
  assert.throws(()=>createApp('x','platformer'));
});

test('exported HTML cannot be broken out of by app content',()=>{
  const app=createApp('Escape','app-blank');
  app.screens[0].components[0].text='</script><script>alert(1)</script>';
  const html=exportAppHTML(app);
  assert.equal(html.match(/<\/script>/g).length,2);
  assert.ok(html.includes('\\u003c/script>'));
  assert.ok(html.startsWith('<!doctype html>'));
});

test('glass style and remembered values are validated',()=>{
  const app=createApp('Glass','app-blank');
  assert.equal(app.theme.glass,true);
  app.remember=true;assert.doesNotThrow(()=>validateApp(app));
  app.theme.glass='yes';assert.throws(()=>validateApp(app),/style/);
  app.theme.glass=false;app.remember='always';assert.throws(()=>validateApp(app),/settings/);
});

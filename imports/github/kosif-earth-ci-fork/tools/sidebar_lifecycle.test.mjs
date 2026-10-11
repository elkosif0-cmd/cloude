import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const browserMode=process.argv.includes('--browser');
// Executes the actual shell closure. DOM/storage are synthetic boundaries;
// this suite does NOT claim viewport layout or browser focus validation.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=()=>fs.readFileSync(path.join(root,'ui/layouts/shell.js'),'utf8').replace('window.SKosifShell=Object.freeze(', 'window.__sidebarReview={sidebar,syncSidebar};window.SKosifShell=Object.freeze(');
function harness(initial={},width=1280){
  let writeFailure=false;
  const raf=[],events={},docEvents={},toasts=[],actions=[],data={'skosif_prefs':{migrated:1,kosif:1,look:'kosif',rail:'full',...initial}};
  const node=(id='')=>{const attrs={},classes=new Set();return {id,attrs,dataset:{},style:{setProperty(){},removeProperty(){}},children:[],isConnected:true,inert:false,hidden:false,
    classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),contains:v=>classes.has(v),toggle(v,on){const next=on??!classes.has(v);next?classes.add(v):classes.delete(v);return next}},
    setAttribute(k,v){attrs[k]=String(v)},getAttribute:k=>attrs[k]??null,hasAttribute:k=>Object.hasOwn(attrs,k),removeAttribute:k=>delete attrs[k],toggleAttribute(k,on){if(on)attrs[k]='';else delete attrs[k]},
    appendChild(n){this.children.push(n)},append(n){this.children.push(n)},contains(other){return other===this||this.children.some(n=>n===other||n.contains?.(other))},querySelector(s){return s==='span'?this.span:null},querySelectorAll:()=>[],addEventListener(){},remove(){},after(){},before(){},focus(){document.activeElement=this},getBoundingClientRect:()=>({width:50,height:40}),getClientRects:()=>[{}]};};
  const rail=node('rail'),menu=node('menu'),main=node('main'),scrim=node('scrim'),compact=node('sk-rail-mini');compact.span={textContent:''};rail.children.push(compact);
  const de=node('html');de.dir='rtl';const body=node('body');const nodes={'#rail':rail,'.menu-btn':menu,'.topbar .menu-btn':menu,'.maincol':main,'#scrim':scrim,'.scrim':scrim,'#sk-rail-mini':compact};
  const document={documentElement:de,body,head:node('head'),readyState:'loading',activeElement:menu,createElement:()=>node(),getElementById:id=>id.startsWith('sk-font')?node(id):nodes['#'+id],querySelector:s=>nodes[s]||null,querySelectorAll:s=>s.includes('menu-btn')?[menu]:[],addEventListener:(k,f)=>{(docEvents[k]??=[]).push(f)}};
  const core={act(action){actions.push(action);rail.classList.toggle('open',action==='rail-open');scrim.classList.toggle('open',action==='rail-open')},view:()=> 'dash'};
  const SK={load:(k,d)=>structuredClone(data[k]??d),save:(k,v)=>{if(writeFailure)throw new Error('synthetic storage failure');data[k]=structuredClone(v)},$:(s,r)=>r?r.querySelector(s):document.querySelector(s),$$:(s,r)=>r?r.querySelectorAll(s):document.querySelectorAll(s),esc:String,toast:(...x)=>toasts.push(x),bus:{on(){},emit(){}},device:{keyHint:k=>'Ctrl+'+k}};
  const context=vm.createContext({SK,window:{SK,SKosifCore:core},document,innerWidth:width,localStorage:{getItem:()=>null,setItem(){},removeItem(){}},console,
    matchMedia:q=>({matches:q.includes('max-width')?context.innerWidth<=900:false,addEventListener(){}}),getComputedStyle:()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'}),
    addEventListener:(k,f)=>{(events[k]??=[]).push(f)},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:f=>raf.push(f),MutationObserver:class{observe(){} disconnect(){}},navigator:{},CSS:{escape:String}});
  vm.runInContext(source(),context,{filename:'shell.js'});
  return {raf,node,nodes,api:context.window.SKosifShell,data,de,rail,menu,main,scrim,compact,actions,toasts,document,context,events,docEvents,failWrites(){writeFailure=true}};
}
function mobile(){const h=harness({sidebarHidden:true},390);h.context.window.scrollY=500;h.context.window.scrollTo=(x,y)=>{h.context.window.scrollY=y};h.document.scrollingElement=h.de;return h}
if(!browserMode){
test('More opener resized to desktop returns focus to visible topbar',()=>{const h=mobile(),more=h.node('more');more.matches=s=>s==='#skb [data-more]';more.getClientRects=()=>h.context.innerWidth<=900?[{}]:[];more.focus=()=>{if(more.getClientRects().length)h.document.activeElement=more};h.nodes['#skb [data-more]']=more;h.document.activeElement=more;h.api.toggleSidebar();h.document.activeElement=h.compact;h.context.innerWidth=901;h.context.window.SKosifCore.act('rail-close');h.context.window.__sidebarReview.syncSidebar();assert.equal(h.document.activeElement,h.menu,'hidden More must not be selected on desktop');});
test('drawer route close does not replay previous route scroll offset',()=>{const h=mobile();h.api.toggleSidebar();h.context.window.scrollY=0;h.context.window.__sidebarReview.sidebar.route=true;h.nodes['#pg-title']=h.node('title');h.context.window.SKosifCore.act('rail-close');h.context.window.__sidebarReview.syncSidebar();assert.equal(h.context.window.scrollY,0,'route destination top should not receive old route500 offset');});
test('delayed restore callback is invalidated after immediate reopen',()=>{const h=mobile();h.api.toggleSidebar();h.context.window.scrollY=0;h.api.toggleSidebar();assert.ok(h.raf.length>0);h.api.toggleSidebar();h.context.window.scrollY=0;for(const f of h.raf)f();assert.equal(h.context.window.scrollY,0,'old close callback must not scroll newly fixed open drawer');});
test('queued restore cannot overwrite subsequent route navigation',()=>{const h=mobile();let route='dash';h.context.window.SKosifCore.view=()=>route;h.api.toggleSidebar();h.context.window.scrollY=0;h.api.toggleSidebar();route='ledger';h.context.window.scrollY=0;for(const f of h.raf)f();assert.equal(h.context.window.scrollY,0);});
test('queued restore cannot overwrite incompatible desktop resize',()=>{const h=mobile();h.api.toggleSidebar();h.context.window.scrollY=0;h.api.toggleSidebar();h.context.innerWidth=901;h.context.window.scrollY=25;for(const f of h.raf)f();assert.equal(h.context.window.scrollY,25);});
test('ordinary dismissal retains its current transition scroll restoration',()=>{const h=mobile();h.api.toggleSidebar();h.context.window.scrollY=0;h.api.toggleSidebar();h.context.window.scrollY=1;for(const f of h.raf)f();assert.equal(h.context.window.scrollY,500);assert.equal(h.main.inert,false);assert.equal(h.document.body.style.position,'');});
test('route closure through toggle does not use secondary returnY restore',()=>{const h=mobile();h.api.toggleSidebar();h.context.window.scrollY=0;h.context.window.__sidebarReview.sidebar.route=true;h.nodes['#pg-title']=h.node('title');h.api.toggleSidebar();for(const f of h.raf)f();assert.equal(h.context.window.scrollY,0);});
test('new drawer closing restores only its own captured position',()=>{const h=mobile();h.document.body.style.position='relative';h.document.body.style.top='4px';h.api.toggleSidebar();h.context.window.scrollY=0;h.api.toggleSidebar();h.context.window.scrollY=700;h.api.toggleSidebar();h.context.window.scrollY=0;h.api.toggleSidebar();h.context.window.scrollY=1;for(const f of h.raf)f();assert.equal(h.context.window.scrollY,700);assert.equal(h.document.body.style.position,'relative');assert.equal(h.document.body.style.top,'4px');assert.equal(h.main.inert,false);assert.equal(h.document.body.classList.contains('skn-locked'),false);});
test('eligible mobile More remains the focus return target',()=>{const h=mobile(),more=h.node('more');more.matches=s=>s==='#skb [data-more]';h.nodes['#skb [data-more]']=more;h.document.activeElement=more;h.api.toggleSidebar();h.api.toggleSidebar();assert.equal(h.document.activeElement,more);});
test('route change before close without rail click never restores old page offset',()=>{const h=mobile();let route='dash';h.context.window.SKosifCore.view=()=>route;h.api.toggleSidebar();route='ledger';h.context.window.scrollY=0;h.api.toggleSidebar();for(const f of h.raf)f();assert.equal(h.context.window.scrollY,0);});

}

// Explicit CI-only mode. Normal node --test never imports or launches Playwright.
// NODE_PATH=/tmp/pw/node_modules node tools/sidebar_lifecycle.test.mjs --browser http://localhost:8765/app-safe.html
async function runBrowser(){
  const index=process.argv.indexOf('--browser'),url=process.argv[index+1];
  assert.ok(url,'--browser requires the isolated preview URL');
  const parsed=new URL(url);
  assert.ok(['localhost','127.0.0.1','[::1]'].includes(parsed.hostname),'lifecycle browser mode permits loopback preview only');
  const require=createRequire(import.meta.url),{chromium}=require('playwright');
  const out=process.env.SIDEBAR_ARTIFACTS||'artifacts/sidebar';fs.mkdirSync(out,{recursive:true});
  const results=[],failures=[];let browser;
  const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const clean=page=>page.waitForFunction(()=>!document.querySelector('#rail').classList.contains('open')&&!document.querySelector('.scrim')?.classList.contains('open')&&!document.body.classList.contains('skn-locked')&&!document.querySelector('.maincol')?.inert);
  const visibleFocus=page=>page.evaluate(()=>{const el=document.activeElement;if(!el||el.closest('[inert],[hidden]'))return false;const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth});
  async function open(){
    const context=await browser.newContext({viewport:{width:390,height:600}});
    await context.addInitScript(()=>{localStorage.setItem('skosif_demo_v1',JSON.stringify({off:true,sections:{}}));sessionStorage.setItem('sqc_space_chosen','1');sessionStorage.setItem('sqc_helper_user_chosen','1')});
    const page=await context.newPage();await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.SKosifShell&&window.SKosifCore&&document.querySelector('#skb [data-more]'));
    return{context,page};
  }
  async function scrolledMore(page){
    const more=page.locator('#skb [data-more]');
    await page.evaluate(()=>window.scrollTo(0,Math.min(500,document.documentElement.scrollHeight-innerHeight)));
    await more.scrollIntoViewIfNeeded();await frames(page);
    const visible=await more.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth});
    assert.ok(visible,'More must be visible before the real pointer click');
    const y=await page.evaluate(()=>scrollY);assert.ok(y>100,'preview has genuinely scrolled content');
    await more.click();
    await page.waitForFunction(()=>document.querySelector('#rail').classList.contains('open')&&document.body.style.position==='fixed');
    const captured=await page.locator('body').evaluate(el=>-parseFloat(el.style.top));
    assert.ok(Math.abs(captured-y)<=2,'visible More pointer changed the page offset before locking '+JSON.stringify({before:y,captured}));return captured;
  }
  async function check(name,fn){
    const {context,page}=await open();
    try{const observation=await fn(page);await page.screenshot({path:out+'/lifecycle-'+name+'.png'});results.push({name,status:'passed',observation});}
    catch(error){failures.push({name,error:String(error.stack||error)});results.push({name,status:'failed'});await page.screenshot({path:out+'/lifecycle-'+name+'-failed.png'}).catch(()=>{});}
    finally{await context.close()}
  }
  try{
    browser=await chromium.launch({headless:true});
    for(const hidden of [false,true])await check('more-desktop-'+(hidden?'hidden':'visible'),async page=>{
      await page.evaluate(value=>window.SKosifShell.setPref('sidebarHidden',value),hidden);
      await page.locator('#skb [data-more]').click();await page.waitForFunction(()=>document.querySelector('#rail').classList.contains('open'));
      await page.setViewportSize({width:901,height:600});await clean(page);await frames(page);
      assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('.topbar .menu-btn')),true,'desktop topbar is focus fallback');
      assert.ok(await visibleFocus(page),'focus target is visible and usable');
      const before=await page.locator('.menu-btn').getAttribute('aria-expanded');await page.keyboard.press('Enter');
      await page.waitForFunction(before=>document.querySelector('.menu-btn').getAttribute('aria-expanded')!==before,before);
      return{width:901,desktopHidden: hidden,keyboardReopen:true};
    });
    await check('search-enter-route',async page=>{
      const y=await scrolledMore(page),old=await page.evaluate(()=>window.SKosifCore.view());
      const target=await page.locator('#rail .nav-btn:not([aria-current="page"]):visible').first().evaluate(el=>({id:el.dataset.v,label:el.querySelector('span').textContent.trim()}));
      assert.notEqual(target.id,old);await page.locator('#skn-q').fill(target.label);
      const selected=await page.locator('#rail .nav-btn:visible').first().getAttribute('data-v');assert.notEqual(selected,old,'search must select a different route');
      await page.locator('#skn-q').press('Enter');await page.waitForFunction(id=>window.SKosifCore.view()===id,selected);
      await clean(page);await frames(page);await page.waitForTimeout(100);await frames(page);
      assert.ok(await page.evaluate(()=>scrollY<=2),'search route preserves destination top');
      assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#pg-title')),true,'destination title focused');
      assert.ok(await visibleFocus(page),'destination title is visible');return{sourceScroll:y,route:selected,input:'real keyboard Enter'};
    });
    await check('nonrail-route-before-close',async page=>{
      const y=await scrolledMore(page);
      const id=await page.locator('#rail .nav-btn:not([aria-current="page"]):visible').first().getAttribute('data-v');
      await page.evaluate(id=>window.SKosifCore.go(id),id);await page.waitForFunction(id=>window.SKosifCore.view()===id,id);await clean(page);await frames(page);await page.waitForTimeout(100);await frames(page);
      assert.ok(await page.evaluate(()=>scrollY<=2),'non-rail route must not receive previous page offset');
      assert.ok(await visibleFocus(page));return{sourceScroll:y,route:id,input:'programmatic real core navigation; route-race coverage, not pointer proof'};
    });
    await check('rapid-close-reopen-smoke',async page=>{
      const y=await scrolledMore(page);
      // Behavioral smoke only: the browser may restore scroll without queuing a RAF.
      // Deterministic VM tests separately prove queued-callback invalidation. No browser race-branch claim.
      await page.evaluate(()=>{window.SKosifShell.toggleSidebar();window.SKosifShell.toggleSidebar()});
      await frames(page);
      assert.equal(await page.locator('body').evaluate(el=>el.style.position),'fixed');
      assert.ok(await page.evaluate(()=>document.querySelector('#rail').classList.contains('open')&&document.querySelector('.maincol').inert));
      assert.ok(await page.evaluate(()=>Math.abs(scrollY)<=2),'old callback cannot scroll newly locked body');
      const newCapture=await page.locator('body').evaluate(el=>-parseFloat(el.style.top));assert.ok(Math.abs(newCapture-y)<=2);
      await page.keyboard.press('Escape');await clean(page);await frames(page);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-newCapture)<=2,'new dismissal restores its own captured position');
      return{sourceScroll:y,newCapture,classification:'behavioral smoke only',queuedCallbackCoverage:'NOT_OBSERVED; deterministic actual-shell VM regression provides separate queued-RAF proof',input:'real pointer opening, synchronous controller close/reopen, keyboard dismissal'};
    });
    await check('ordinary-pointer-open-keyboard-dismiss',async page=>{
      const y=await scrolledMore(page);await page.keyboard.press('Escape');await clean(page);await frames(page);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)<=2,'ordinary dismissal retains scroll');
      assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#skb [data-more]')),true);assert.ok(await visibleFocus(page));return{sourceScroll:y,input:'real More pointer and Escape'};
    });
  }finally{
    if(browser)await browser.close();
    fs.writeFileSync(out+'/lifecycle-results.json',JSON.stringify({url,head:process.env.GITHUB_SHA||null,results,failures,limits:['Chromium preview only; no Safari or physical-device claim','Programmatic actions are labeled and used only for route/timing counterexamples','Rapid-reopen case is browser behavioral smoke, not proof that a restore RAF was queued; deterministic actual-shell VM tests separately cover queued-callback invalidation','No business transaction, AI action or production data tested']},null,2));
  }
  assert.equal(failures.length,0,JSON.stringify(failures,null,2));
  console.log(`PASS ${results.length} actual-browser lifecycle scenarios`);
}
if(browserMode)await runBrowser();

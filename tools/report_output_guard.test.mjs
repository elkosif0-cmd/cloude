import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Pure DOM boundary fixture: production output.js executes unchanged. Native
// print/download/share/window effects are observed at their external boundary.
function harness({preview=true}={}){
  const effects={prints:[],downloads:[],shares:[],windows:[],storageReads:0};
  let document;const timers=new Map();let timerId=0;
  class Node{
    constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.listeners={};this.attrs={};this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){}};this._html='';this._text='';this.isConnected=false;}
    set textContent(v){this._text=String(v);this._html=String(v);this.children=[];}get textContent(){return this._text||this.children.map(x=>x.textContent).join('');}
    set innerHTML(v){this._html=String(v);this._text=String(v).replace(/<[^>]*>/g,'');this.children=[];
      if(this.className==='skout'||this.className==='skpres'){
        this.frame=new Node('iframe');this.frame.contentWindow=makeWindow();this.frame.contentDocument=this.frame.contentWindow.document;this.appendChild(this.frame);this.controls={};
        for(const [,key,value]of String(v).matchAll(/data-(o|p)="([^"]+)"/g)){const n=new Node('button');n.dataset[key]=value;n.parentElement=this;this.controls[value]=n;}
        this.label=new Node('b');
      }
    }get innerHTML(){return this._html;}
    set srcdoc(html){this._srcdoc=html;this.contentDocument.open();this.contentDocument.write(html);this.contentDocument.close();queueMicrotask(()=>this.dispatch('load'));}get srcdoc(){return this._srcdoc;}
    get outerHTML(){return this.tagName==='HTML'?this._html:'<'+this.tagName.toLowerCase()+'>'+this._html+'</'+this.tagName.toLowerCase()+'>';}
    get firstElementChild(){return this.children[0]||null;}
    appendChild(n){n.parentElement=this;n.isConnected=true;this.children.push(n);return n;}append(...ns){ns.forEach(n=>this.appendChild(n));}
    remove(){this.isConnected=false;if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this);}
    setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}
    addEventListener(k,f){(this.listeners[k]??=[]).push(f);}removeEventListener(k,f){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==f);}
    dispatch(k,e={}){for(const f of [...this.listeners[k]||[]])f(e);}
    querySelector(s){if(s==='iframe')return this.frame;if(s==='.skout-t'||s==='.skpres-n')return this.label;const match=s.match(/\[data-[op]="([^"]+)"\]/);if(match)return this.controls?.[match[1]];return null;}
    querySelectorAll(){return [];}
    cloneNode(){const n=new Node(this.tagName);n._html=this._html;n._text=this._text;n.children=this.children.map(x=>{const c=x.cloneNode(true);c.parentElement=n;return c;});return n;}
    matches(s){return s==='table'&&this.tagName==='TABLE';}focus(){document.activeElement=this;}
  }
  function makeDocument(win){
    const d=new Node('document');d.head=new Node('head');d.body=new Node('body');d.body.isConnected=true;d.documentElement=new Node('html');d.documentElement.append(d.head,d.body);d.title='';d.html='';
    d.open=()=>{d.html='';win.listeners={};d.listeners={};};
    d.write=html=>{d.html+=html;d.documentElement._html=d.html;d.title=(d.html.match(/<title>(.*?)<\/title>/s)||[])[1]||'';d.body._html=(d.html.match(/<body[^>]*>([\s\S]*)<\/body>/)||[])[1]||d.html;d.body._text=d.body._html.replace(/<[^>]*>/g,'');d.body.innerText=d.body._text;d.body.children=[];
      for(const [,tag,text]of d.body._html.matchAll(/<(h1|h2|p)[^>]*>(.*?)<\/\1>/gs)){const n=new Node(tag);n.innerHTML=text;d.body.appendChild(n);}
    };
    d.close=()=>{};d.createElement=tag=>new Node(tag);d.getElementById=id=>d.head.children.find(x=>x.id===id)||null;
    d.querySelector=s=>s==='h1'?d.body.children.find(x=>x.tagName==='H1'):null;
    d.querySelectorAll=s=>s==='table'?[{rows:[{cells:[{textContent:'Metric'},{textContent:'Value'}]},{cells:[{textContent:'Total'},{textContent:'10'}]}]}]:s==='style,link[rel=stylesheet]'?d.head.children:[];
    return d;
  }
  function makeWindow(){const w={listeners:{},closed:false,focus(){},addEventListener(k,f){(this.listeners[k]??=[]).push(f);},removeEventListener(k,f){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==f);},dispatch(k){for(const f of [...this.listeners[k]||[]])f({preventDefault(){}});}};w.document=makeDocument(w);w.print=()=>{w.dispatch('beforeprint');effects.prints.push(w.document.documentElement.textContent||w.document.body.textContent);};w.close=()=>{w.closed=true;w.dispatch('pagehide');};return w;}
  const host=makeWindow();document=host.document;
  host.open=()=>{const w=makeWindow();effects.windows.push(w);return w;};
  const SK={esc:s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),toast(){},print:{options:()=>({preview,paper:'A4'}),css:()=>'',set(){}},download:(name,blob)=>effects.downloads.push({name,blob}),audit:{log(){}}};
  const context=vm.createContext({window:host,document,SK,navigator:{share:async x=>effects.shares.push(x),canShare:()=>true},localStorage:{getItem(){effects.storageReads++;return JSON.stringify({settings:{biz:'LIVE ORG'}});}},SKXlsx:{book:t=>new Blob([JSON.stringify(t)])},location:{href:'https://example.invalid/app/'},URL,Blob,File:class extends Blob{constructor(parts,name,opts){super(parts,opts);this.name=name;}},console,addEventListener:host.addEventListener.bind(host),setInterval:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearInterval:id=>timers.delete(id),setTimeout:()=>++timerId,clearTimeout(){}});
  vm.runInContext(fs.readFileSync(new URL('../ui/core/output.js',import.meta.url),'utf8'),context);
  function write(w,label='CAPTURED'){w.document.open();w.document.write('<html><head><title>'+label+'</title></head><body><h1>'+label+'</h1><p>Report total 10</p></body></html>');w.document.close();return w;}
  const click=a=>{const wrap=document.body.children.find(x=>x.className==='skout');const b=wrap?.controls?.[a];if(!b)throw Error('missing output '+a);document.dispatch('click',{target:{closest:s=>s==='.skout [data-o]'?b:null}});};
  return {context,api:SK.output,effects,document,host,write,open:label=>write(host.open(''),label),click,tick:()=>new Promise(setImmediate),presentation:()=>document.body.children.find(x=>x.className==='skpres'),wrap:()=>document.body.children.find(x=>x.className==='skout')};
}
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
function install(h,w,overrides={}){assert.equal(typeof h.api.guard,'function','SK.output.guard must exist');assert.equal(h.api.guard(w,{identity:{name:'CAPTURED ORG',preparer:'CAPTURED PREPARER'},checkSync:()=>true,check:async()=>true,...overrides}),true);}

for(const action of ['print','word','excel','html','share','present','window']){
  test('guard denies stale '+action+' before its output boundary',async()=>{const h=harness(),w=h.open();install(h,w,{check:async()=>false});h.click(action);await h.tick();assert.equal(h.effects.prints.length+h.effects.downloads.length+h.effects.shares.length+h.effects.windows.length,0);assert.equal(h.presentation(),undefined);assert.equal(w.document.body.textContent,'');});
  test('guard permits fresh '+action+' through its output boundary',async()=>{const h=harness(),w=h.open();install(h,w);h.click(action);await h.tick();const count=h.effects.prints.length+h.effects.downloads.length+h.effects.shares.length+h.effects.windows.length+(h.presentation()?1:0);assert.equal(count,1);});
  for(const lifecycle of ['replacement','close'])test('pending '+action+' cannot outlive '+lifecycle,async()=>{const h=harness(),w=h.open(),gate=deferred();install(h,w,{check:()=>gate.promise});h.click(action);if(lifecycle==='replacement')h.open('NEW REPORT');else w.close();gate.resolve(true);await h.tick();assert.equal(h.effects.prints.length+h.effects.downloads.length+h.effects.shares.length+h.effects.windows.length,0);assert.equal(h.presentation(),undefined);if(lifecycle==='replacement')assert.ok(h.wrap());});
}
test('old window.close never closes a newer preview',()=>{const h=harness(),old=h.open('OLD');h.open('NEW');old.close();assert.ok(h.wrap());assert.equal(h.wrap().frame.contentDocument.title,'NEW');});
test('synchronous freshness loss prevents native print and blanks browser print',()=>{const h=harness(),w=h.open();let fresh=true;install(h,w,{checkSync:()=>fresh});fresh=false;w.__skRealPrint();assert.equal(h.effects.prints.length,0);assert.equal(w.document.body.textContent,'');});
test('beforeprint is installed after the final document write and blanks stale contents',()=>{const h=harness(),w=h.open();let fresh=true;install(h,w,{checkSync:()=>fresh});assert.ok(w.listeners.beforeprint?.length);fresh=false;w.dispatch('beforeprint');assert.equal(w.document.body.textContent,'');});
test('detached window shares the guard and browser print invalidates stale contents',async()=>{const h=harness(),w=h.open();let fresh=true;install(h,w,{checkSync:()=>fresh});h.click('window');await h.tick();const copy=h.effects.windows[0];assert.ok(copy);fresh=false;copy.dispatch('beforeprint');assert.equal(copy.document.body.textContent,'');assert.equal(w.document.body.textContent,'');copy.print();assert.equal(h.effects.prints.length,0);});
test('invalidate removes presentation and detached copies and calls onClose once',async()=>{const h=harness(),w=h.open();let closed=0;install(h,w,{onClose:()=>closed++});h.click('window');await h.tick();h.click('present');await h.tick();assert.ok(h.presentation());assert.equal(typeof h.api.invalidate,'function');h.api.invalidate(w);h.api.invalidate(w);assert.equal(h.wrap(),undefined);assert.equal(h.presentation(),undefined);assert.equal(h.effects.windows[0].document.body.textContent,'');assert.equal(h.effects.windows[0].closed,true);assert.equal(closed,1);});
test('guarded presentation uses copied identity and never reads live business storage',async()=>{const h=harness(),w=h.open(),identity={name:'ORIGINAL ORG'};install(h,w,{identity});identity.name='MUTATED ORG';h.click('present');await h.tick();assert.match(h.presentation().frame.srcdoc,/ORIGINAL ORG/);assert.doesNotMatch(h.presentation().frame.srcdoc,/LIVE ORG|MUTATED ORG/);assert.equal(h.effects.storageReads,0);});
test('unguarded output remains usable and retains live presentation fallback',async()=>{const h=harness();h.open();for(const action of ['print','word','excel','html','share','window']){h.click(action);await h.tick();}assert.equal(h.effects.prints.length,1);assert.equal(h.effects.downloads.length,3);assert.equal(h.effects.shares.length,1);assert.equal(h.effects.windows.length,1);h.click('present');await h.tick();assert.match(h.presentation().frame.srcdoc,/LIVE ORG/);assert.equal(h.effects.storageReads,1);});
test('preview-disabled real print window enforces the same guard',()=>{const h=harness({preview:false}),w=h.open();let fresh=true;install(h,w,{checkSync:()=>fresh});w.print();assert.equal(h.effects.prints.length,1);fresh=false;w.print();assert.equal(h.effects.prints.length,1);assert.equal(w.document.body.textContent,'');});
test('rejected guard checks fail closed without unhandled output',async()=>{const h=harness(),w=h.open();install(h,w,{check:async()=>{throw Error('changed');}});h.click('html');await h.tick();assert.equal(h.effects.downloads.length,0);assert.equal(w.document.body.textContent,'');});
test('same loading guard reattaches after final write while preserving copied identity and close callback',async()=>{const h=harness(),w=h.open('LOADING');let ready=false,closed=0;const g={identity:{name:'CAPTURED'},checkSync:()=>ready,check:async()=>ready,onClose:()=>closed++};assert.equal(h.api.guard(w,g),true);h.write(w,'FINAL');assert.equal(w.listeners.beforeprint,undefined);g.identity.name='MUTATED';ready=true;assert.equal(h.api.guard(w,g),true);assert.ok(w.listeners.beforeprint.length);h.click('present');await h.tick();assert.match(h.presentation().frame.srcdoc,/CAPTURED/);assert.doesNotMatch(h.presentation().frame.srcdoc,/MUTATED/);assert.equal(closed,0);w.close();assert.equal(closed,1);assert.equal(h.api.guard(w,g),false);});
test('loading preview close immediately invokes guard onClose',()=>{const h=harness(),w=h.open('LOADING');let closed=0;install(h,w,{checkSync:()=>false,check:async()=>false,onClose:()=>closed++});w.close();assert.equal(closed,1);assert.equal(h.wrap(),undefined);});
test('guarded presentation uses captured date',async()=>{const h=harness(),w=h.open();install(h,w,{identity:{name:'Captured Org',date:'CAPTURED DATE'}});h.click('present');await h.tick();assert.match(h.presentation().frame.srcdoc,/CAPTURED DATE/);});
test('host browser beforeprint blanks a stale embedded report',()=>{const h=harness(),w=h.open();let fresh=true;install(h,w,{checkSync:()=>fresh});fresh=false;h.host.dispatch('beforeprint');assert.equal(w.document.body.textContent,'');});
test('native popup pagehide closes the session and invokes onClose',()=>{const h=harness({preview:false}),w=h.open();let closed=0;install(h,w,{onClose:()=>closed++});w.close();assert.equal(closed,1);});
for(const action of ['print','word','excel','html','share','present','window'])test('freshness change during pending '+action+' check still prevents output',async()=>{const h=harness(),w=h.open(),gate=deferred();let fresh=true;install(h,w,{checkSync:()=>fresh,check:()=>gate.promise});h.click(action);fresh=false;gate.resolve(true);await h.tick();assert.equal(h.effects.prints.length+h.effects.downloads.length+h.effects.shares.length+h.effects.windows.length,0);assert.equal(h.presentation(),undefined);assert.equal(w.document.body.textContent,'');});
test('explicit invalidation of old target cannot close newer guarded preview',()=>{const h=harness(),old=h.open('OLD');install(h,old);const current=h.open('NEW');install(h,current);h.api.invalidate(old);assert.equal(h.wrap().frame.contentDocument.title,'NEW');});
test('synchronous check cannot emit output after closing its own session',async()=>{const h=harness(),w=h.open();install(h,w,{checkSync:()=>{w.close();return true;}});w.__skRealPrint();assert.equal(h.effects.prints.length,0);});
test('already closed real window rejects guard registration',()=>{const h=harness({preview:false}),w=h.open();w.close();assert.equal(h.api.guard(w,{checkSync:()=>true,check:async()=>true}),false);});
test('host beforeprint after replacing guarded report leaves unrelated output untouched',()=>{const h=harness(),old=h.open('GUARDED');install(h,old);const current=h.open('UNRELATED');h.host.dispatch('beforeprint');old.dispatch('beforeprint');assert.ok(h.wrap());assert.equal(current.document.body.textContent,'UNRELATEDReport total 10');});
for(const action of ['word','excel','html','share'])test('guarded '+action+' filename uses the captured company/period stem',async()=>{const h=harness(),w=h.open('اسم عربي فقط'),identity={name:'شركة ألف',fileStem:'SQC-executive-company-a-2026-04-01-2026-09-30'};install(h,w,{identity});identity.fileStem='changed';h.click(action);await h.tick();const name=action==='share'?h.effects.shares[0].files[0].name:h.effects.downloads[0].name;assert.equal(name,'SQC-executive-company-a-2026-04-01-2026-09-30.'+({word:'doc',excel:'xlsx',html:'html',share:'html'}[action]));});
test('guarded sharing refuses truncated text fallback when full-file sharing is unavailable',async()=>{const h=harness(),w=h.open();install(h,w);h.context.navigator.canShare=()=>false;w.document.body.innerText='Scoped ledger '.repeat(500)+'SOURCE-HASH-AT-END';h.click('share');await h.tick();assert.equal(h.effects.shares.length,0);assert.ok(h.wrap(),'A fresh document remains downloadable')});
test('unguarded sharing retains existing text fallback',async()=>{const h=harness();h.open();h.context.navigator.canShare=()=>false;h.click('share');await h.tick();assert.equal(h.effects.shares.length,1);assert.equal(typeof h.effects.shares[0].text,'string')});
test('source change during synchronous workbook serialization blocks download',async()=>{const h=harness(),w=h.open();let fresh=true;install(h,w,{checkSync:()=>fresh});const encode=h.context.SKXlsx.book;h.context.SKXlsx.book=t=>{const b=encode(t);fresh=false;return b};h.click('excel');await h.tick();assert.equal(h.effects.downloads.length,0)});
for(const action of ['word','html','share','window'])test('source change during '+action+' HTML serialization blocks sink',async()=>{const h=harness(),w=h.open();let fresh=true;install(h,w,{checkSync:()=>fresh});const clone=w.document.documentElement.cloneNode.bind(w.document.documentElement);w.document.documentElement.cloneNode=(...a)=>{const copy=clone(...a);fresh=false;return copy};h.click(action);await h.tick();assert.equal(h.effects.downloads.length+h.effects.shares.length+h.effects.windows.length,0)});

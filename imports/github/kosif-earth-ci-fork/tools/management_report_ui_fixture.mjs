import fs from 'node:fs';import vm from 'node:vm';
export function uiHarness(){
 let active=null,permission=true,exportPermission=true,captureGate=null,htmlGate=null,serializeGate=null,fresh=true,frameMode='normal';
 const calls={capture:0,fresh:0,prepare:0,download:0,print:0,writes:0},timers=new Map(),downloads=[],frames=[];let tid=0;
 class Node{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.listeners={};this.isConnected=false;this.textContent='';this.disabled=false;this.checked=false;this.hidden=false;this._html=''}
  set innerHTML(v){this._html=v;if(this.tagName==='DIALOG'){this.controls={};for(const name of ['close','refresh','confirm','attest','status','context','preview','csv','json','html','print']){const n=new Node(name==='attest'?'input':'button');n.dataset.mr=name;n.parent=this;this.controls[name]=n}}}get innerHTML(){return this._html}
  setAttribute(k,v){this.attrs[k]=String(v)}getAttribute(k){return this.attrs[k]??null}
  addEventListener(k,f){(this.listeners[k]??=[]).push(f)}removeEventListener(){}
  querySelector(s){const m=s.match(/\[data-mr="([^"]+)"\]/);return m?this.controls?.[m[1]]:null}
  querySelectorAll(s){return s==='[data-mr-output]'?['csv','json','html','print'].map(n=>this.controls[n]):[]}
  append(...ns){for(const n of ns){n.parent=this;n.isConnected=true;this.children.push(n);if(n.tagName==='IFRAME'){frames.push(n);if(frameMode!=='stall-load')queueMicrotask(()=>n.onload?.())}}}
  replaceChildren(...ns){this.children=[];this.append(...ns)}remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)}
  focus(){document.activeElement=this}showModal(){this.open=true;active=this;this.isConnected=true}close(){this.open=false;for(const f of this.listeners.close||[])f({})}
  closest(){return this.dataset.mr?this:null}getClientRects(){return this.isConnected?[{}]:[]}
  click(){if(this.tagName==='A'){if(frameMode==='download-throw')throw Error('blocked download');calls.download++;downloads.push(this)}}
 }
 const body=new Node('body');body.isConnected=true;
 const document={body,activeElement:null,createElement(tag){const n=new Node(tag);if(tag==='iframe'){n.contentDocument={fonts:{get ready(){return frameMode==='stall-font'?new Promise(()=>{}):frameMode==='font-throw'?Promise.reject(Error('font fail')):Promise.resolve()}}};n.contentWindow={focus(){},addEventListener(k,f){n.printEvent=f},print(){if(frameMode==='print-throw')throw Error('blocked print');calls.print++;n.printEvent?.()}}}return n},querySelector(){return null},importNode:n=>n};
 const context=vm.createContext({window:{},document,DOMParser:class{parseFromString(){return{querySelector:()=>new Node('main')}}},Blob,URL:{createObjectURL:b=>{downloads.blob=b;return'blob:synthetic'},revokeObjectURL(){}},setTimeout:(f,ms)=>{timers.set(++tid,{f,ms});return tid},clearTimeout:id=>timers.delete(id),console});
 context.SK={perm:{can:(_id,action)=>permission&&(action!=='export'||exportPermission)},toast(){},bus:{on(){}}};
 const cap={ok:true,input:{context:{entityName:'Synthetic',entityId:'c1',start:'2026-01-01',end:'2026-12-31',currency:'SAR'}},inputHash:'1'.repeat(64),contextHash:'2'.repeat(64),evidenceHash:'3'.repeat(64),scopeToken:'s',capturedAt:'2026-10-04T12:00:00.000Z'};
 context.window.SKosifManagementSource={capture:async()=>{calls.capture++;if(captureGate)await captureGate;return cap},checkFresh:async()=>{calls.fresh++;return{fresh,reason:'SOURCE_CHANGED'}}};
 context.window.SKosifManagementModel={build:()=>({ok:true,model:{status:'draft'}})};
 context.window.SKosifManagementOutput={prepare:async e=>{calls.prepare++;return{...e,snapshotHash:'4'.repeat(64)}},html:async()=>{if(htmlGate)await htmlGate;return'<main class="sqc-management-report">Synthetic</main>'},csv:async()=>{if(serializeGate)await serializeGate;return'CSV'},json:async()=>'{"synthetic":true}'};
 const file=new URL('../ui/features/management-report.js',import.meta.url);if(fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),context);
 const opener=new Node('button');opener.isConnected=true;
 return{api:context.window.SKosifManagementReport,calls,cap,context,opener,downloads,frames,get dialog(){return active},control:n=>active.controls[n],async click(n){return active.listeners.click?.[0]({target:active.controls[n],preventDefault(){}})},async confirm(){active.controls.attest.checked=true;return this.click('confirm')},cancel(){return active.listeners.cancel?.[0]({preventDefault(){}})},setPermission:v=>permission=v,setExportPermission:v=>exportPermission=v,setFresh:v=>fresh=v,setCaptureGate:v=>captureGate=v,setHtmlGate:v=>htmlGate=v,setSerializeGate:v=>serializeGate=v,setFrameMode:v=>frameMode=v,timeOut(){for(const [id,t]of [...timers])if(t.ms===10000){timers.delete(id);t.f()}},tick:()=>new Promise(setImmediate)};
}
export function ledgerHookHarness(ledger){
 const views={},calls={open:[],csv:[],writes:0},root={dataset:{},innerHTML:'',listeners:{},addEventListener(k,f){this.listeners[k]=f},querySelector(){return null}};
 const data={skosif_ledger_v1:ledger,skosif_companies_v1:{active:{periodId:'p'},periods:[{id:'p',label:'Synthetic',startDate:'2026-01-01',endDate:'2026-12-31'}]}};
 const context=vm.createContext({window:{},document:{addEventListener(){}},TextEncoder});
 context.SK={$:()=>null,esc:String,load:(k,d)=>data[k]?JSON.parse(JSON.stringify(data[k])):d,save(){calls.writes++;return true},money:String,toast(){},icon:()=>'',view:(id,v)=>views[id]=v,ui:{tabs:()=>'',state:{empty:()=>''}},csv:{download:(...args)=>calls.csv.push(args)}};
 context.window.SKosifCore={go:()=>views.ledger.render(root)};context.window.SKosifManagementReport={open:async o=>calls.open.push(o)};context.SKosifManagementReport=context.window.SKosifManagementReport;
 vm.runInContext(fs.readFileSync(new URL('../ui/core/engines.js',import.meta.url),'utf8'),context);vm.runInContext(fs.readFileSync(new URL('../ui/features/ledger.js',import.meta.url),'utf8'),context);context.window.SKosifLedger.open('tb');
 return{calls,root,click(action){const button={dataset:{l:action}};return root.listeners.click({target:{closest:s=>s==='[data-l]'?button:null}})}};
}

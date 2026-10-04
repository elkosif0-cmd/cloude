import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
export const KEY='skosif_tbreview_v1',ENG='skosif_engagements_v1',CO='skosif_companies_v1',LEDGER='skosif_ledger_v1';
const owner=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
// A standalone candidate carries its untouched dependencies in preview/. An integrated repository uses its own root.
const baseline=process.env.GUARD_SOURCE_ROOT||(fs.existsSync(path.join(owner,'preview'))?path.join(owner,'preview'):owner);
export const oldReview=()=>({ctx:{company:'شركة الهدف السابقة',period:'2025',periodStart:'2025-01-01',periodEnd:'2025-12-31',country:'SA',corpusId:'old-corpus',curSym:'USD',taxKind:'old',sector:'old',reportingFramework:'old',auditStandard:'old'},tbText:'رقم الحساب,اسم الحساب,مدين,دائن\n1100,النقدية,100,0\n3000,رأس المال,0,100',session:{id:'synthetic-old-session',rounds:[],uploads:[{requestId:'old-request',fileName:'synthetic-evidence.pdf'}]},accepted:['accepted-1'],rejected:['rejected-1'],overrides:{1100:'cash'},engagement:{status:'old'},checklists:{old:1},exceptions:[{old:true}],thOverrides:{old:2},evidenceMeta:{old:true},journalSource:'old',journalMeta:{old:1},letterResponses:{old:'yes'},fw:{cash:{signed:true}},materiality:12345,ecl:{keep:1},confirm:{independence:false,edition:false,compliance:false,unrecognized:false,partner:true},narrative:'retained narrative'});
function dom(){
 const listeners={},body={children:[],appendChild(el){el.isConnected=true;this.children.push(el)}};
 const doc={body,activeElement:null,readyState:'loading',visibilityState:'visible',addEventListener(k,f){(listeners[k]??=[]).push(f)},removeEventListener(k,f){listeners[k]=(listeners[k]||[]).filter(x=>x!==f)},getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]}};
 function node(){return{attributes:{},dataset:{},isConnected:true,tabIndex:0,disabled:false,hidden:false,setAttribute(k,v){this.attributes[k]=v},getClientRects(){return[{}]},closest(){return null},focus(){doc.activeElement=this},contains(x){return x===this},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){}}}
 doc.createElement=()=>{const w=node();w.listeners={};w.addEventListener=(k,f)=>w.listeners[k]=f;w.remove=()=>{w.isConnected=false;body.children=body.children.filter(x=>x!==w)};Object.defineProperty(w,'innerHTML',{get:()=>w.html,set:s=>{w.html=s;w.dialog=node();w.buttons=[...s.matchAll(/<button[^>]*data-r="([01])"[^>]*>([^<]*)<\/button>/g)].map(m=>{const b=node();b.dataset.r=m[1];b.textContent=m[2];b.closest=s=>s==='[data-r]'?b:null;return b});w.dialog.querySelectorAll=()=>w.buttons;w.dialog.contains=x=>x===w.dialog||w.buttons.includes(x);w.querySelector=s=>s==='.skd'?w.dialog:w.buttons.find(b=>s===`[data-r="${b.dataset.r}"]`)||null}});return w};
 return{doc,listeners,key(key){for(const f of [...(listeners.keydown||[])])f({key,preventDefault(){},stopImmediatePropagation(){}})},dialog:()=>body.children.at(-1)};
}
export function harness({source='ledger',rounds=0,empty=false,saveMode='success',root=process.env.GUARD_ROOT||'candidate'}={}){
 const d=oldReview();d.session.rounds=Array.from({length:rounds},(_,i)=>({id:'r'+i}));
 const data={[KEY]:JSON.stringify(empty?{}:d),[ENG]:JSON.stringify({active:'target-review',list:[{id:'target-review',company:'شركة الهدف السابقة'},{id:'another-review',company:'شركة أخرى'}]}),skosif_eng_another_review:JSON.stringify({ctx:{company:'شركة أخرى'},session:{id:'other-session',uploads:[{fileName:'other.pdf'}]}}),[CO]:JSON.stringify({active:{companyId:'source-co',periodId:'source-period'},companies:[{id:'source-co',name:'شركة المصدر الجديدة',country:'SA'}],periods:[{id:'source-period',label:'الفترة المختارة',startDate:'2026-02-01',endDate:'2026-08-31'}]}),[LEDGER]:JSON.stringify({accounts:[{id:'cash',code:'1100',name:'النقدية',type:'asset',active:true},{id:'capital',code:'3000',name:'رأس المال',type:'equity',active:true}],entries:source==='ledger'?[{id:'entry-1',date:'2026-03-01',lines:[{accountId:'cash',debit:100,credit:0},{accountId:'capital',debit:0,credit:100}]}]:[]})};
 const docs=new Map([['synthetic-old-session|old-request|synthetic-evidence.pdf','synthetic bytes'],['other-session|other|other.pdf','other bytes']]);
 const calls={setItem:0,removeItem:0,idbOpen:0,idbTransaction:0,idbDelete:0,buildTB:0,booksTB:0,fresh:0,put:0,docClear:0,register:0,paint:0,parse:0};
 const errors=[],toasts=[],audit=[],navigation=[],views={},ui=dom();let mode=saveMode,bridgeAction=null;
 const storage={getItem:k=>data[k]??null,setItem(k,v){calls.setItem++;if(mode==='quota'&&k===KEY){const e=Error('synthetic full');e.name='QuotaExceededError';throw e}data[k]=v},removeItem(k){calls.removeItem++;delete data[k]}};
 const core={registerView:(k,v)=>views[k]=v,toast:(...a)=>toasts.push(a),view:()=>navigation.at(-1)||'ledger',go:v=>navigation.push(v),onView(){}};
 const context=vm.createContext({window:{SKosifCore:core},document:ui.doc,localStorage:storage,addEventListener(){},setInterval(){},setTimeout(){},console,TextEncoder,TextDecoder,getComputedStyle:()=>({visibility:'visible'}),__calls:calls});
 context.window.indexedDB=context.indexedDB={open(){calls.idbOpen++;const q={result:{createObjectStore(){},transaction(){calls.idbTransaction++;const t={objectStore:()=>({openCursor(){const c={result:null};queueMicrotask(()=>{for(const key of [...docs.keys()])if(key.startsWith('synthetic-old-session|')){docs.delete(key);calls.idbDelete++}c.onsuccess?.();t.oncomplete?.()});return c}})};return t}}};queueMicrotask(()=>q.onsuccess?.());return q}};
 const productRead=p=>fs.readFileSync(path.join(['ui/features/tb-review.js','ui/features/ledger.js','ui/features/assistant.js','ui/core/sk.js'].includes(p)?(fs.existsSync(path.join(owner,root))?path.join(owner,root):baseline):baseline,p),'utf8');
 const execute=(p,transform=s=>s)=>vm.runInContext(transform(productRead(p)),context,{filename:p});
 execute('ui/core/sk.js');context.SK=context.window.SK;const actualSave=context.SK.save;
 context.SK.save=(k,v)=>{if(k===KEY){if(mode==='throw')throw Error('synthetic save throw');if(mode==='undefined')return undefined;if(mode==='truthy')return{ok:true}}return actualSave(k,v)};
 Object.assign(context.SK,{errors:{report:(...a)=>errors.push(a)},audit:{log:(...a)=>audit.push(a)},ui:{uid:()=> 'synthetic-id',tabs:()=>'',state:{empty:()=>''}},caps:{get:()=>null,all:()=>[]},perm:{can:()=>true}});
 execute('ui/core/engines.js');context.SKEngines=context.window.SKEngines;context.SKosifCore=core;
 const TI=context.SKEngines.reports.tbImport,realParse=TI.parseTrialBalance;
 context.SKEngines={...context.SKEngines,reports:{...context.SKEngines.reports,tbImport:{...TI,parseTrialBalance(...a){calls.parse++;return realParse(...a)}}}};context.window.SKEngines=context.SKEngines;
 execute('ui/features/ledger.js',s=>s.replace('window.SKosifLedger=Object.freeze({','window.__ledger={bind,tbHTML};window.SKosifLedger=Object.freeze({'));context.SKosifLedger=context.window.SKosifLedger;
 context.window.SKosifAuditBridge=context.SKosifAuditBridge={async buildTB(){calls.buildTB++;calls.idbOpen++;if(bridgeAction)return bridgeAction();return{rows:[['1100','النقدية',100,0],['3000','رأس المال',0,100]]}}};
 execute('ui/features/tb-review.js',s=>s.replace('const fresh=d=>{','const fresh=d=>{__calls.fresh++;').replace('const put=d=>{','const put=d=>{__calls.put++;').replace('async function docClear(){','async function docClear(){__calls.docClear++;').replace('function register(){','function register(){__calls.register++;').replace('async function booksTB(){','async function booksTB(){__calls.booksTB++;').replace('function paint(){','function paint(){__calls.paint++;').replace('window.SKosifTBReview=Object.freeze({','window.__tbr={bind,state:()=>({tab,setup,confHTML,cache}),setState:v=>{tab=v.tab;setup=v.setup;confHTML=v.confHTML;cache=v.cache}};window.SKosifTBReview=Object.freeze({'));
 context.SKosifTBReview=context.window.SKosifTBReview;
 context.window.__tbr.setState({tab:'docs',setup:true,confHTML:{sig:'old',h:'old confidence'},cache:{old:true}});
 execute('ui/features/assistant.js');context.SKosifAssistant=context.window.SKosifAssistant;
 execute('ui/features/month-close.js');
 execute('ui/core/templates.js',s=>s.replace('SK.templates=Object.freeze({','window.__templates=T;SK.templates=Object.freeze({'));
 const node={dataset:{},innerHTML:'',listeners:{},querySelector:()=>null,addEventListener(k,f){this.listeners[k]=f}};
 context.window.__ledger.bind(node);const reviewNode={...node,listeners:{}};context.window.__tbr.bind(reviewNode);
 const buttons=()=>ui.dialog()?.buttons||[],answer=v=>{const w=ui.dialog();if(!w)throw Error('no pending dialog');w.listeners.click({target:buttons().find(b=>b.dataset.r===(v?'1':'0'))})};
 const click=(type,a)=>{const n=type==='review'?reviewNode:node,selector=type==='review'?'[data-a]':'[data-l]',key=type==='review'?'a':'l';return n.listeners.click({target:{closest:s=>s===selector?{dataset:{[key]:a}}:null}})};
 return{api:context.SKosifTBReview,ledger:context.SKosifLedger,assistant:context.SKosifAssistant,SK:context.SK,data,docs,calls,audit,toasts,errors,navigation,ui,context,answer,click,stored:()=>JSON.parse(data[KEY]),state:()=>JSON.parse(JSON.stringify(context.window.__tbr.state())),setSaveMode:v=>mode=v,setBridge:v=>bridgeAction=v,rawSnapshot:()=>JSON.stringify(data),docSnapshot:()=>JSON.stringify([...docs]),ledgerHTML:()=>context.window.__ledger.tbHTML(JSON.parse(data[LEDGER])),monthClose:()=>ui.listeners.click.find(f=>String(f).includes('[data-cl]'))({target:{closest:s=>s==='[data-cl]'?{dataset:{cl:'review'}}:null}}),template:()=>context.window.__templates.find(t=>t.id==='tb')};
}
export async function tick(){await new Promise(r=>setImmediate(r))}
export function importAudit(h){return h.audit.filter(([area,e])=>area==='tbreview'&&e.act==='import')}
export function successfulToasts(h){return h.toasts.filter(([text,type])=>type==='ok'||type==='warn'&&text.includes('استُلم'))}

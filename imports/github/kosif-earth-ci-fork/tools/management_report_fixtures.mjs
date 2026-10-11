import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
export const keys={users:'sqc_helper_users_v1',spaces:'sqc_helper_space_v1',companies:'skosif_companies_v1',ledger:'skosif_ledger_v1'};
export function scopeFixture(){return{
 [keys.users]:{active:'u1',users:{u1:{id:'u1',name:'Synthetic Accountant',pinHash:'SYNTHETIC-HASH',pinSalt:'SYNTHETIC-SALT',lastSpace:'c1',spaces:{c1:{name:'Synthetic Co'},c2:{name:'Other'}}},u2:{id:'u2',name:'Other',pinHash:null,lastSpace:'c2',spaces:{c2:{name:'Other'}}}}},
 [keys.spaces]:{active:'c1',spaces:{c1:{name:'Synthetic Co'},c2:{name:'Other'}}},
 [keys.companies]:{active:{companyId:'c1',periodId:'p1'},companies:[{id:'c1',name:'Synthetic Co',currency:'SAR'},{id:'c2',name:'Other',currency:'USD'}],periods:[{id:'p1',companyId:'c1',startDate:'2026-01-01',endDate:'2026-12-31'}]},
 [keys.ledger]:{accounts:[],entries:[]}
};}
// Actual helper-space closure; only external browser/storage boundaries are synthetic.
export function scopeHarness(seed=scopeFixture()){
 const records=new Map(Object.entries(seed).map(([k,v])=>[k,JSON.stringify(v)]));
 const writes=[],opens=[],timers=[],errors=[];let mode='normal';const releases=[];
 const localStorage={get length(){return records.size},key:i=>[...records.keys()][i]??null,getItem:k=>records.get(k)??null,setItem(k,v){writes.push(['local-set',k]);if(mode==='restore-fail'&&k===keys.ledger)throw new Error('synthetic restore failed');records.set(k,String(v))},removeItem(k){writes.push(['local-remove',k]);records.delete(k)}};
 const sessions=new Map();const sessionStorage={getItem:k=>sessions.get(k)??null,setItem(k,v){writes.push(['session-set',k]);sessions.set(k,String(v))}};
 const snapshots=new Map([['u1::c2',{ls:{[keys.ledger]:JSON.stringify({accounts:[],entries:[]})},app:null}],['u2::c2',{ls:{[keys.ledger]:JSON.stringify({accounts:[],entries:[]})},app:null}]]);
 const indexedDB={databases:async()=>[],open(name){opens.push(name);const r={};const finish=()=>{if(mode==='idb-fail'){r.error=new Error('synthetic IDB failure');r.onerror?.();return}r.result={objectStoreNames:{contains:()=>true},close(){},transaction(){const t={};t.objectStore=()=>({put(v,k){snapshots.set(k,v);writes.push(['idb-put',k]);return{result:k}},get:k=>({result:snapshots.get(k)})});setImmediate(()=>t.oncomplete?.());return t}};r.onsuccess?.()};if(mode==='hold')releases.push(finish);else setImmediate(finish);return r}};
 const SK={esc:String,load(k,f){const s=records.get(k);if(s===undefined)return f;try{return JSON.parse(s)}catch{return f}},save(k,v){writes.push(['save',k]);if(mode==='save-false')return false;records.set(k,JSON.stringify(v));return true},toast(){},errors:{report:e=>errors.push(e.message)},bus:{on(){}},ui:{uid:()=> 'synthetic-new'}};
 const context=vm.createContext({window:{},SK,document:{addEventListener(){},getElementById:()=>null},localStorage,sessionStorage,indexedDB,setTimeout:f=>{if(mode==='timer-fail')throw new Error('synthetic scheduling failure');timers.push(f)},location:{reload(){}},TextEncoder,Uint8Array,console});
 vm.runInContext(fs.readFileSync(new URL('../ui/core/helper-space.js',import.meta.url),'utf8'),context);
 return{context,api:context.window.SKosifSpace,records,writes,opens,timers,errors,setMode:v=>mode=v,release:()=>releases.shift()?.(),set(k,v){records.set(k,JSON.stringify(v))},get:k=>JSON.parse(records.get(k)),tick:()=>new Promise(setImmediate)};
}

export function managementFixture(){
 const entry=(id,date,dr,cr,amount)=>({id,date,lines:[{accountId:dr,debit:amount,credit:0},{accountId:cr,debit:0,credit:amount}]});
 return {ledger:{accounts:[['cash','1100','asset'],['ar','1200','asset'],['equity','3000','equity'],['re','3100','equity'],['rev','4000','revenue'],['exp','6000','expense']].map(([id,code,type])=>({id,code,type,name:id,active:true})),entries:[entry('open','2025-01-01','cash','equity',1000),entry('old-sale','2025-06-01','cash','rev',200),entry('old-exp','2025-07-01','exp','cash',50),entry('sale','2026-01-02','ar','rev',300),entry('exp','2026-01-03','exp','cash',100)]},context:{entityId:'c1',entityName:'Synthetic Company',currency:'SAR',currencyExponent:2,start:'2026-01-01',end:'2026-12-31',basis:'management-ledger',scopeToken:'synthetic-token'},retainedAccountId:'re',sourceChecks:[]};
}
export function modelHarness(){const context=vm.createContext({window:{}});const file=new URL('../ui/core/management-report-model.js',import.meta.url);if(fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),context);return context.window.SKosifManagementModel;}
export function actualLedgerEngine(){const context=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(new URL('../ui/core/engines.js',import.meta.url),'utf8'),context);return context.window.SKEngines.finance.ledger;}
export function visualLedgerFixture(kind='supported'){
 const f=JSON.parse(fs.readFileSync(new URL('./fixtures/management-'+kind+'.json',import.meta.url),'utf8'));
 const decimal=n=>{const v=BigInt(n);return (v/100n).toString()+'.'+(v%100n).toString().padStart(2,'0')};
 const input=managementFixture();input.context={...input.context,entityId:f.context.entityId,entityName:f.context.entityName,start:f.context.period.start,end:f.context.period.end,currency:f.context.currency};input.retainedAccountId=null;
 input.ledger={accounts:f.journalRecipe.accounts.map(a=>({id:a.id,code:a.code,name:a.label||a.name,type:a.conceptualType,active:true})),entries:f.journalRecipe.journals.map(j=>({id:j.id,date:j.date,lines:j.lines.map(l=>{const v=BigInt(l.signedMinor);return{accountId:l.accountId,debit:v>0n?decimal(v):'0.00',credit:v<0n?decimal(-v):'0.00'}})}))};
 return {input,expected:f.expected,rows:f.rows};
}
export function sourceHarness({ledger=managementFixture().ledger,context=null}={}){
 const base=managementFixture();let raw=JSON.stringify(ledger),ctx=context||{...base.context,retainedAccountId:'re'},scope={status:'stable',token:'scope-1',userId:'u1',spaceId:'c1',entityId:'c1',periodId:'p1',context:{entityName:'Synthetic Company',start:'2026-01-01',end:'2026-12-31',currency:'SAR'}};
 const calls={ledger:0,context:0,scope:0,writes:0,legacy:0};let hashImpl=null;
 const vmc=vm.createContext({window:{},TextEncoder});vm.runInContext(fs.readFileSync(new URL('../ui/core/management-report-model.js',import.meta.url),'utf8'),vmc);const file=new URL('../ui/features/management-report-source.js',import.meta.url);if(fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),vmc);
 const deps={scopeReader:()=>{calls.scope++;return scope},ledgerReader:()=>{calls.ledger++;return raw},contextReader:()=>{calls.context++;return ctx},sha256:async value=>{if(hashImpl)return hashImpl(value);const {createHash}=await import('node:crypto');return createHash('sha256').update(value).digest('hex')}};
 return{api:vmc.window.SKosifManagementSource,deps,calls,setRaw:v=>raw=v,setLedger:v=>raw=JSON.stringify(v),getRaw:()=>raw,getContext:()=>ctx,setContext:v=>ctx=v,getScope:()=>scope,setScope:v=>scope=v,setHash:f=>hashImpl=f,context:vmc};
}
export function outputHarness({styles=true,crypto=true}={}){
 const context=vm.createContext({window:crypto?{crypto:webcrypto}:{},TextEncoder,Uint8Array});
 vm.runInContext(fs.readFileSync(new URL('../ui/core/engines.js',import.meta.url),'utf8'),context);
 vm.runInContext(fs.readFileSync(new URL('../ui/core/management-report-model.js',import.meta.url),'utf8'),context);
 const cssFile=new URL('../ui/features/management-report.css',import.meta.url);
 if(styles&&fs.existsSync(cssFile))context.window.__SK_MANAGEMENT_REPORT_CSS__=fs.readFileSync(cssFile,'utf8');
 const file=new URL('../ui/features/management-report-output.js',import.meta.url);if(fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),context);
 return{api:context.window.SKosifManagementOutput,model:context.window.SKosifManagementModel,context,engineHash:context.window.SKEngines.finance.journalChain.sha256};
}
export async function outputEnvelope(h,input=managementFixture()){
 const {createHash}=await import('node:crypto'),sha=s=>createHash('sha256').update(s).digest('hex');
 const m=h.model.build(input).model,inputHash=sha(h.model.canonical({ledger:input.ledger,context:input.context})),contextHash=sha(h.model.canonical(input.context)),evidenceHash=sha(h.model.canonical(m.sourceChecks));
 return{model:m,inputHash,contextHash,evidenceHash,capturedAt:'2026-10-04T12:00:00.000Z',scopeToken:input.context.scopeToken,attestation:{kind:'user-attested',inputHash,contextHash,confirmedAt:'2026-10-04T12:01:00.000Z'}};
}

// Shared verbatim storage seed for browser and pre-browser integration tests.
export function managementBrowserSeed(){
const input=visualLedgerFixture().input,seed=scopeFixture(),entity=input.context.entityId;
seed[keys.ledger]=input.ledger;for(const e of seed[keys.ledger].entries)for(const l of e.lines){l.debit=Number(l.debit);l.credit=Number(l.credit)}
seed[keys.users]={active:'synthetic-user',users:{'synthetic-user':{id:'synthetic-user',name:'Synthetic',pinHash:null,pinSalt:null,lastSpace:entity,spaces:{[entity]:{name:input.context.entityName}}}}};seed[keys.spaces]={active:entity,spaces:{[entity]:{name:input.context.entityName}}};seed[keys.companies]={active:{companyId:entity,periodId:'synthetic-period'},companies:[{id:entity,name:input.context.entityName,currency:'SAR'}],periods:[{id:'synthetic-period',companyId:entity,label:'Synthetic2026',startDate:input.context.start,endDate:input.context.end}]};
return seed;
}

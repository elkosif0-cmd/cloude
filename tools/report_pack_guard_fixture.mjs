import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {scopeFixture,managementFixture,keys} from './management_report_fixtures.mjs';
export {keys};
export const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
export const tick=()=>new Promise(setImmediate);
export async function packHarness({mutate,source,look="kosif",theme="light",extra={}}={}){
 const seed=scopeFixture();seed[keys.ledger]=managementFixture().ledger;
 seed['aghnam-pricing-v3']={settings:{biz:'Synthetic Co',preparer:'Prepared A'}};
 seed.skosif_profile_v1={name:'Prepared A'};
 seed[keys.companies].periods.push({id:'p2',companyId:'c1',startDate:'2025-07-01',endDate:'2026-06-30'});
 seed.skosif_tasks_v1=[{title:'GLOBAL_TASK_CANARY',done:false}];
 mutate?.(seed);
 const records=new Map(Object.entries(seed).map(([k,v])=>[k,JSON.stringify(v)]));
 const events=new Map(),timers=[],errors=[],toasts=[],windows=[],writes=[],calls={trend:0,sales:0,stats:0,risks:0,decisions:0};
 const listen=(t,f)=>{if(!events.has(t))events.set(t,new Set());events.get(t).add(f)};
 const emit=(t,detail)=>{for(const f of events.get(t)||[])f(detail)};
 class Storage {get length(){return this.m.size}key(i){return [...this.m.keys()][i]??null}constructor(m){this.m=m}getItem(k){return this.m.get(k)??null}setItem(k,v){writes.push(k);this.m.set(k,String(v))}removeItem(k){writes.push(k);this.m.delete(k)}}
 const localStorage=new Storage(records),sessionStorage=new Storage(new Map());
 const attrs={'data-look':look,'data-theme':theme};
 const document={readyState:'loading',documentElement:{getAttribute:n=>attrs[n],classList:{add(){},remove(){}}},body:{},addEventListener(){},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};
 const core={stats(){calls.stats++;return{boxes:7,boxLoss:3,target:.2,avgMargin:.1}},setOrg(f,v){const x=JSON.parse(records.get('aghnam-pricing-v3')||'{}');if(x.settings?.[f]===v)return false;x.settings={...x.settings,[f]:v};localStorage.setItem('aghnam-pricing-v3',JSON.stringify(x));emit('sk:org',{detail:{f,v}});return true},view:()=> 'reports',toast:(...x)=>toasts.push(x)};
 function open(){
  const ev=new Map(),parts={html:'',before:'',after:''},styles=[],bodyClasses=new Set(),mark={src:'https://sqc.invalid/art/sqc-mark.svg'};
  const w={closed:false,focus(){},print(){w.prints++},prints:0,close(){w.closed=true;w.guard?.onClose?.()},addEventListener(t,f){if(!ev.has(t))ev.set(t,new Set());ev.get(t).add(f)},removeEventListener(t,f){ev.get(t)?.delete(f)},dispatch(t){for(const f of ev.get(t)||[])f({preventDefault(){}})},__skEmbedded:true};
  const body={classList:{add:n=>bodyClasses.add(n)},insertAdjacentHTML(p,s){parts[p==='afterbegin'?'before':'after']+=s},replaceChildren(){parts.html=parts.before=parts.after=''},set textContent(s){parts.html=s;parts.before=parts.after=''},get textContent(){return parts.html},insertBefore(){}};
  const d={body,head:{appendChild(s){styles.push(s.textContent||'')}},documentElement:{setAttribute(){}},open(){parts.html=parts.before=parts.after='';ev.clear()},write(s){parts.html+=s},close(){},createElement:()=>({setAttribute(){}}),querySelectorAll:()=>[],querySelector:s=>s==='.skp-band img'?mark:null};w.document=d;w.styles=styles;w.bodyClasses=bodyClasses;w.mark=mark;w.content=()=>parts.before+parts.html+parts.after;
  windows.push(w);return w;
 }
 const ctx={console,Intl,Date,URL,Blob,TextEncoder,Uint8Array,crypto:webcrypto,Storage,localStorage,sessionStorage,document,location:{href:'https://sqc.invalid/app-safe.html',reload(){}},indexedDB:{databases:async()=>[]},addEventListener:listen,removeEventListener:(t,f)=>events.get(t)?.delete(f),setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},setInterval:()=>1,clearInterval(){},SKosifCore:core,SKosifMetrics:{trend:async()=>{calls.trend++;return{tip:['Jan','Feb'],labels:[],s:[99999],p:[0],o:[0],net:[99999]}},risks:()=>{calls.risks++;return{risks:[{title:'GLOBAL_RISK_CANARY'}],findings:[]}},decisions:()=>{calls.decisions++;return[{title:'GLOBAL_DECISION_CANARY'}]}},SKosifSalesIntel:{snapshot:async()=>{calls.sales++;return{empty:true}}},SKCharts:{bars:()=>'',heatmap:()=>''},SKosifTopbar:{profile:()=>({name:'Prepared A'})},open};Object.assign(ctx,extra);ctx.window=ctx;vm.createContext(ctx);
 const run=p=>vm.runInContext(read(p),ctx,{filename:p});
 run('ui/core/sk.js');ctx.SK.errors={report:(e,where)=>errors.push([e.message,where])};ctx.SK.perm={can:()=>true};
 run('ui/core/bus.js');run('ui/core/helper-space.js');run('ui/core/company.js');
 await tick();await tick();
 ctx.SK.output={guard(w,g){w.guard=g;w.addEventListener('beforeprint',()=>{if(!g.checkSync())w.document.body.textContent='STALE'});return true},invalidate(w){w.invalidated=true;w.document.body.textContent='STALE'},css(){}};
 run('ui/core/management-report-model.js');run('ui/features/management-report-source.js');vm.runInContext(source||read('ui/features/report-pack.js'),ctx,{filename:'report-pack.js'});
 return{ctx,records,windows,timers,errors,toasts,writes,calls,emit,api:ctx.SKosifReportPack,set(k,v){localStorage.setItem(k,JSON.stringify(v))},raw(k,v){localStorage.setItem(k,v)},get:k=>JSON.parse(records.get(k)),flush(){while(timers.length)timers.shift()()},async print(){await ctx.SKosifReportPack.print();return windows.at(-1)}};
}

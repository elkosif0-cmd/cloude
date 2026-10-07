import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function expose(file,names,extra={}){
 const c=vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},console,setTimeout(){},setInterval(){},addEventListener(){},matchMedia:()=>({}),SK:{esc:String,load:(_k,d)=>d,bus:{on(){}},view(){}},...extra});c.window=c;
 vm.runInContext(read(file).replace(/\}\)\(\);\s*$/,`window.testAPI={${names}};})();`),c);return c;
}
test('audit header resolves engagement without reading accounting; tools keeps its own scope',()=>{
 let section='audit',reads=0;const store={skosif_tbreview_v1:{ctx:{company:'Synthetic Audit USD',period:'FY2024',curSym:'مليون $',currency:'USD'}}};
 const c=expose('ui/layouts/topbar.js','ctx',{SK:{load:(k,d)=>store[k]||d,gate:{current:()=>section},company:{current(){reads++;return{name:'Synthetic Accounting',currency:'SAR',periods:[],period:null}},list:()=>[]}}});
 assert.equal(c.testAPI.ctx().c.name,'Synthetic Audit USD');assert.equal(c.testAPI.ctx().c.currency,'مليون $');assert.equal(reads,0);
 section='accounting';assert.equal(c.testAPI.ctx().c.name,'Synthetic Accounting');section='tools';assert.equal(c.testAPI.ctx().scope,'tools');
});
test('sidebar explicitly names its independent audit scope without rewriting storage',()=>{
 const d={tbText:'synthetic',ctx:{company:'Synthetic Audit'}};
 const c=expose('ui/layouts/rail-audit.js','rows',{localStorage:{getItem:()=>JSON.stringify(d)}});
 assert.match(c.testAPI.rows(),/ملف المراجعة المستقل/);assert.match(c.testAPI.rows(),/Synthetic Audit/);
});
for(const sent of [false,true])test(`monthly close denominator excludes optional audit step sent=${sent}`,()=>{
 const ledger={snapshot:()=>({accounts:[{}],entries:[],count:{},bank:{}}),pending:()=>({total:0}),parties:()=>null,trialBalance:()=>({balanced:true,rows:[]}),vat:()=>null};
 const c=expose('ui/features/month-close.js','steps,progress,html',{SKosifLedger:ledger,SK:{esc:String,money:String,load:()=>sent?{tbText:'synthetic',loadedAt:'2026-10-01'}:{}}});
 const s=c.testAPI.steps('2026-08'),p=c.testAPI.progress(s);assert.equal(p.of,s.filter(x=>x.id!=='review'&&x.st!=='na').length);
 const html=c.testAPI.html();assert.doesNotMatch(html,/ثماني/);assert.match(html,/خطوات معروضة/);assert.match(html,/غير مطلوبة/);
});
// Run the actual door renderer with a synthetic bilingual corpus, retaining both model years.
function door(){
 const html=read('unlock.html'),script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
 const els={},el=id=>els[id]||(els[id]={dataset:{},hidden:false,innerHTML:'',addEventListener(){}});
 const c=vm.createContext({document:{body:{dataset:{}},getElementById:el},localStorage:{getItem:()=>null},sessionStorage:{getItem:()=>null,setItem(){}},location:{search:'',hash:''},SQC_CORPUS:[{id:'amazon-2023',company:'Amazon.com, Inc.',fy:'FY2023'},{id:'amazon-2024',company:'Amazon.com, Inc.',fy:'FY2024'},{id:'other',company:'Other'}]});c.window=c;
 vm.runInContext(script.replace(/\}\)\(\);\s*$/,'window.testAPI={state,corpusRows};})();'),c);return c.testAPI;
}
test('Arabic Amazon search returns the same two years as English',()=>{
 const api=door();for(const q of ['Amazon','أمازون','امازون','آمازون']){api.state.q=q;const html=api.corpusRows();assert.match(html,/amazon-2023/);assert.match(html,/amazon-2024/);assert.doesNotMatch(html,/data-corpus="other"/)}
});

test('completion facilities and impact labels retain the engagement currency and scale',async()=>{
 const {harness}=await import('./apple-source-harness.mjs');const h=harness(),W=h.context;
 W.SKosifTBReview.load('رقم الحساب,اسم الحساب,مدين,دائن\n1100,النقد,100,0\n3100,رأس المال,0,100','Synthetic USD',{company:'Synthetic',country:'INTL',currency:'USD',curSym:'مليون USD',periodEnd:'2026-12-31'});
 vm.runInContext(read('ui/features/audit-practice.js'),W);const c=W.__test.compute();const before=JSON.stringify(h.state),html=W.SKosifAuditPractice.gcCard(c);
 assert.match(html,/تسهيلات بنكية غير مستخدمة \(مليون USD\)/);assert.match(html,/أثر شهري \(مليون USD\)/);assert.doesNotMatch(html,/\(ريال\)/);assert.equal(JSON.stringify(h.state),before);
});

for(const verdict of [null,'مرفوض','مقبول','unavailable'])test(`completion includes initial high-priority requests verdict=${verdict}`,async()=>{
 const {harness}=await import('./apple-source-harness.mjs');const h=harness(),W=h.context;
 W.SKosifTBReview.load('رقم الحساب,اسم الحساب,مدين,دائن\n1100,النقد,100,0\n3100,رأس المال,0,100','Synthetic',{company:'Synthetic',country:'SA'});
 vm.runInContext(read('ui/features/tb-fieldwork.js'),W);const c=W.__test.compute();c.base.requests=[{id:'synthetic-high',priority:'عالية'}];
 c.session=verdict?{rounds:[{requests:[],reviewed:[{requestId:'synthetic-high',verdict}]}],uploads:[],unavailable:verdict==='unavailable'?[{requestId:'synthetic-high',reason:'Synthetic unavailable'}]:[]}:null;
 const item=W.SKosifFieldwork.model(c).done.items.find(x=>x.id==='requests');assert.equal(item.ok,verdict==='مقبول');
});

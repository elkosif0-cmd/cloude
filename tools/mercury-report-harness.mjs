// Test-only boundary harness: executes the real report module against synthetic stores.
// It captures document.write and emitted styles, without a browser, network or app writes.
import fs from 'node:fs';
import vm from 'node:vm';
export const sections=['summary','books','trend','risks','findings','decisions','tasks','signoff'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function fixture(kind='populated',selected=sections){
 const empty=kind==='empty',big=kind==='large';
 const sales=empty?[0,0]:big?[123456789.75,5]:[100.5,0];
 const purchases=empty?[0,0]:big?[223456790,10]:[110.75,4];
 const expenses=empty?[0,0]:[3,3];
 return {
  stores:{skosif_report_pack_v1:{range:6,sections:selected,seen:sections,reviewer:'مراجع تجريبي',approver:'معتمد تجريبي'},skosif_tasks_v1:empty?[]:[{title:'مهمة تجريبية طويلة للاختبار فقط',done:false,due:'2026-01-01',priority:'high'},{title:'مكتملة',done:true}],skosif_companies_v1:{companies:[{id:'demo',name:'شركة اختبار SQC'}],active:{companyId:'demo'}}},
  stats:{target:.25,avgMargin:empty?NaN:.191,loss:empty?0:2,boxLoss:empty?0:2,boxes:empty?0:27},
  risks:empty?[]:[{ref:'R-001',title:'خطر تجريبي طويل <آمن>',response:'وصف عربي طويل لإثبات التفاف النص في الجدول دون حذف معلومات',category:'تشغيلي',likelihood:3,impact:3,status:'open',owner:'اختبار',due:'2026-12-01'}],
  findings:empty?[]:[{ref:'F-001',title:'ملاحظة اختبار',detail:'تفصيل آمن & ملاحظة',area:'تشغيل',severity:'high',status:'open',owner:'اختبار'}],
  decisions:empty?[]:[{sev:'warn',title:'قرار تجريبي',detail:'لا توجد بيانات شخصية أو عملاء حقيقيون'}],
  trend:{tip:['يناير 2026','فبراير 2026'],labels:['يناير','فبراير'],s:sales,p:purchases,o:expenses,net:sales.map((v,i)=>v-purchases[i]-expenses[i])},
  empty
 };
}
// `extra` adds globals (e.g. SKEngines + SKosifSalesIntel) for tests of sections that need them; omitted, the module
// sees exactly the stores above.
export async function render(source,f=fixture(),look='kosif',theme='light',extra={}){
 let html='',styles=[],writes=0;const bodyClasses=new Set(),mark={src:'https://sqc.invalid/art/sqc-mark.svg'};
 const document={open(){html=''},write(s){html+=s},close(){},createElement(){return{textContent:''}},head:{appendChild(s){styles.push(s.textContent)}},body:{classList:{add(n){bodyClasses.add(n)}}},querySelector(s){return s==='.skp-band img'?mark:null}};
 const w={document,focus(){},print(){},close(){throw Error('report closed unexpectedly')}};
 const ledger={snapshot:()=>({accounts:f.empty?[]:[{}],bank:{history:[{end:'2026-01-31'}]},lockDate:'2026-01-31'}),parties:()=>({balance:85,unassigned:5,totals:{'61-90':20,'90+':10},rows:[{party:'عميل اختبار',balance:85,aging:{current:20,'1-30':25,'31-60':10,'61-90':20,'90+':10}}]}),balance:()=>150,vat:()=>({q:{label:'فترة اختبار'},settled:false,r:{net:12}})};
 const FixedDate=class extends Date{constructor(...args){super(...(args.length?args:['2026-10-04T12:00:00Z']))}static now(){return Date.parse('2026-10-04T12:00:00Z')}};
 const ctx={console,Intl,Date:FixedDate,location:{href:'https://sqc.invalid/app-safe.html'},setTimeout(){},document:{documentElement:{getAttribute(n){return n==='data-look'?look:n==='data-theme'?theme:null}}},SK:{$$:()=>[],esc,load:(k,d)=>structuredClone(f.stores[k]??d),save(){writes++},toast(){throw Error('unexpected toast')},icon:()=>'',org:()=>({biz:'شركة اختبار SQC',preparer:'مُعد تجريبي'}),brandPrint(){},audit:{log(){}},errors:{report(e){throw e}}},SKosifCore:{stats:()=>structuredClone(f.stats)},SKosifMetrics:{risks:()=>({risks:structuredClone(f.risks),findings:structuredClone(f.findings)}),decisions:()=>structuredClone(f.decisions),trend:async()=>structuredClone(f.trend)},SKCharts:{bars:()=>'<div class="skch">رسم اختبار</div>',heatmap:()=>'<div class="skhm">مصفوفة اختبار</div>'},SKosifLedger:ledger,SKosifClose:{steps:()=>[{st:'ok'},{st:'warn'}]},SKosifTopbar:{profile:()=>({name:'مُعد تجريبي'})},open:()=>w};
 Object.assign(ctx,extra);ctx.window=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);const controls=ctx.SKosifReportPack.html();await ctx.SKosifReportPack.print();
 return {html,styles,controls,bodyClasses:[...bodyClasses],mark:mark.src,writes};
}
export function tables(html){return [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(t=>[...t[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(r=>[...r[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c=>c[1].replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim())))}
export function headings(html){return [...html.matchAll(/<h2\b[^>]*>(.*?)<\/h2>/g)].map(x=>x[1])}
export const readSource=p=>fs.readFileSync(p,'utf8');
// Entire report section text includes summary, books and task KPIs omitted by table-only parity.
export function sectionText(html){return [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(m=>m[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());}

// Test-only boundary harness: executes the real report module against synthetic stores.
// It captures document.write and emitted styles, without a browser, network or app writes.
import fs from 'node:fs';
import {packHarness,keys} from './report_pack_guard_fixture.mjs';
import {managementFixture} from './management_report_fixtures.mjs';
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
 const h=await packHarness({source,look,theme,extra,mutate:seed=>{
  for(const[k,v]of Object.entries(f.stores))if(k!==keys.companies)seed[k]=structuredClone(v);
  const l=managementFixture().ledger;
  if(f.empty)l.entries=[];
  else if(f.stats.boxes===27&&f.trend.s[0]>1000000){l.entries[3].lines.forEach(x=>{if(x.debit)x.debit=123456789.75;if(x.credit)x.credit=123456789.75});l.entries[4].lines.forEach(x=>{if(x.debit)x.debit=223456790;if(x.credit)x.credit=223456790})}
  seed[keys.ledger]=l;
 }});
 const before=h.writes.length,controls=h.api.html(),w=await h.print();
 return{html:w&&!w.closed&&!w.invalidated?w.content():'',styles:w?.styles||[],controls,bodyClasses:[...(w?.bodyClasses||[])],mark:w?.mark.src,writes:h.writes.length-before,blocked:!!(!w||w.closed||w.invalidated)};
}
export function tables(html){return [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(t=>[...t[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(r=>[...r[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c=>c[1].replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim())))}
export function headings(html){return [...html.matchAll(/<h2\b[^>]*>(.*?)<\/h2>/g)].map(x=>x[1])}
export const readSource=p=>fs.readFileSync(p,'utf8');
// Entire report section text includes summary, books and task KPIs omitted by table-only parity.
export function sectionText(html){return [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(m=>m[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());}

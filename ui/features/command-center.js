/* S.kosif feature — Command Center (home), KOSIF Luxe layout.
   The greeting lives in the page head (ui/layouts/topbar.js). Below it, as in the approved
   KOSIF dashboard: four KPI tiles with rings · sales vs purchases trend with net line · risk
   heatmap · period structure · what needs a decision · task status · recent activity · quick
   starts. Every number comes from recorded data (the core bridge, IndexedDB sales lines, the
   modules' own stores, the audit trail); an empty source shows an empty state, never a sample. */
(()=>{
"use strict";
const {esc,load}=SK;
const core=()=>window.SKosifCore;
const LAUNCH=[["zatca","فاتورة جديدة"],["offers","عرض سعر"],["followup","متابعة العملاء"],["purchasing","أمر شراء"],["catalog","الأسعار"],["inventory","المخزون"],["ledger","قيد محاسبي"],["risks","خطر أو ملاحظة"]];
const nf=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1});
const fmt=v=>nf.format(v);
/* the device's calendar day: toISOString() still gives yesterday in Riyadh until 03:00 */
const today=(d=new Date())=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
let range=12,trend=null,trendAt=0;

/* ---------- data ---------- */
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}
  q.onupgradeneeded=e=>{try{e.target.transaction.abort()}catch{}};q.onerror=()=>res([]);
  q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store,"readonly").objectStore(store).getAll();g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
const monthOf=d=>{const s=String(d||"");if(/^\d{4}-\d{2}/.test(s))return s.slice(0,7);const t=new Date(s);return isNaN(t)?"":t.toISOString().slice(0,7)};
function monthsBack(n,end){const out=[],d=end?new Date(+end.slice(0,4),+end.slice(5,7)-1,1):new Date();d.setDate(1);for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0"))}return out}
/* same sources as «التدفق النقدي»: sales lines in, supplier shipments + monthly opex out */
async function loadTrend(){
  if(trend&&Date.now()-trendAt<15000)return trend;
  const lines=await idbAll("sales_lines"),VAT=.15;
  const inn={},pur={};
  lines.forEach(l=>{const m=monthOf(l.date);if(m)inn[m]=(inn[m]||0)+(Number(l.amountHalalas)?Number(l.amountHalalas)/100:(Number(l.amount)||0))});
  (load("skosif_v31_supplier_batches",[])||[]).forEach(b=>{const m=monthOf(b.date);if(!m)return;const q=Number(b.qty)||0,g=Number(b.priceGross)||0;pur[m]=(pur[m]||0)+(b.vatIncl?g*q:g*q*(1+VAT))});
  const opex=Number(load("skosif_v31_monthly_opex",0))||0;
  const have=[...new Set([...Object.keys(inn),...Object.keys(pur)])].sort();
  trend={inn,pur,opex,have};trendAt=Date.now();return trend;
}
function series(t,n){
  let months=monthsBack(n);
  if(t.have.length&&!months.some(m=>t.inn[m]||t.pur[m]))months=monthsBack(n,t.have[t.have.length-1]);
  const lab=m=>new Date(+m.slice(0,4),+m.slice(5,7)-1,1).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{month:"short"});
  const full=m=>new Date(+m.slice(0,4),+m.slice(5,7)-1,1).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{month:"long",year:"numeric"});
  const s=months.map(m=>t.inn[m]||0),p=months.map(m=>t.pur[m]||0),o=months.map(m=>(t.inn[m]||t.pur[m])?t.opex:0);
  return{months,labels:months.map(lab),tip:months.map(full),s,p,o,net:months.map((_,i)=>s[i]-p[i]-o[i])};
}
function risksDb(){const d=load("skosif_risks_v1",{})||{};return{risks:d.risks||[],findings:d.findings||[]}}

/* ---------- blocks ---------- */
function tiles(){
  const C=SKCharts,st=core().stats(),out=[];
  const tgt=st.target>1?st.target:st.target*100;
  const tile=(view,ic,cls,l,v,sub,p)=>'<button type="button" class="skk4-t" data-go="'+view+'"><span class="chip '+cls+'">'+SK.icon(ic)+'</span><span class="tx"><span>'+esc(l)+'</span><b>'+esc(v)+'</b><small>'+esc(sub)+'</small></span>'+(p!=null?C.ring(p,{cls}):'')+'</button>';
  const avg=isFinite(st.avgMargin)?st.avgMargin*100:null;
  out.push(tile("catalog","catalog",avg!=null&&avg<tgt?"warn":"","متوسط هامش البوكسات",avg!=null?fmt(avg)+"٪":"—","الهدف "+fmt(tgt)+"٪",avg!=null&&tgt>0?avg/tgt*100:null));
  const inT=st.boxOnTarget;
  out.push(tile("builder","builder",st.boxLoss?"bad":"ok","بوكسات ضمن الهدف",st.boxes?fmt(Math.max(0,inT)):"—",st.boxes?"من أصل "+fmt(st.boxes)+(st.boxLoss?" · "+fmt(st.boxLoss)+" بخسارة":""):"لا بوكسات بعد",st.boxes?Math.max(0,inT)/st.boxes*100:null));
  const tasks=load("skosif_tasks_v1",[])||[],done=tasks.filter(x=>x.done).length;
  out.push(tile("tasks","tasks","ok","المهام المنجزة",fmt(done),tasks.length?"من أصل "+fmt(tasks.length):"لا مهام بعد",tasks.length?done/tasks.length*100:null));
  const R=risksDb(),open=R.risks.filter(r=>r.status!=="closed"),hi=open.filter(r=>(+r.likelihood||1)*(+r.impact||1)>=6).length;
  out.push(tile("risks","alert","bad","مخاطر مرتفعة",fmt(hi),open.length?"من أصل "+fmt(open.length)+" مفتوحة":"السجل فارغ",open.length?hi/open.length*100:null));
  return '<div class="skk4">'+out.join("")+'</div>';
}
function trendCard(){
  return '<section class="skc-card skc-trend"><h3>اتجاهات المبيعات والمشتريات<small>Sales vs Purchases</small>'+
    '<span class="skc-seg" role="group">'+[6,12].map(n=>'<button type="button" data-range="'+n+'" aria-pressed="'+(range===n)+'">'+n+' شهراً</button>').join("")+'</span></h3><div id="skc-trend">'+SK.ui.state.loading({text:"جارٍ قراءة المبيعات…"})+'</div></section>';
}
function fillTrend(root){
  loadTrend().then(t=>{
    const box=root.querySelector("#skc-trend"),str=root.querySelector("#skc-structure");if(!box)return;
    const s=series(t,range);
    box.innerHTML=SKCharts.bars({width:box.clientWidth,labels:s.labels,tipLabels:s.tip,series:[{name:"المبيعات",color:"var(--sk-c1)",values:s.s},{name:"المشتريات والمصروفات",color:"var(--sk-c2)",values:s.p.map((v,i)=>v+s.o[i])}],
      line:{name:"صافي التدفق",color:"var(--sk-c3)",values:s.net},height:250,title:"المبيعات والمشتريات شهرياً",empty:"لا مبيعات مستوردة ولا شحنات موردين بعد — استورد ملف المبيعات من مركز البيانات أو سجّل شحنة."});
    if(str){
      const S=s.s.reduce((a,b)=>a+b,0),P=s.p.reduce((a,b)=>a+b,0),O=s.o.reduce((a,b)=>a+b,0),N=S-P-O,base=Math.max(S,P+O,1),M=SKCharts.money;
      str.innerHTML=S||P?SKCharts.progress([{label:"المبيعات",value:S,max:base,text:M(S)},{label:"مشتريات الشحنات",value:P,max:base,text:M(P),cls:"ok"},{label:"المصروفات التشغيلية",value:O,max:base,text:M(O),cls:"warn"},{label:"صافي التدفق",value:Math.abs(N),max:base,text:(N<0?"−":"")+M(Math.abs(N)),cls:N<0?"bad":"cy"}])+
        '<p class="hint skc-note">آخر '+range+' شهراً · '+(S?"هامش التدفق "+fmt(N/S*100)+"٪":"لا مبيعات مسجلة")+'</p>':'<div class="skch-empty">تظهر هنا بنية المبيعات والمشتريات والمصروفات عند تسجيلها.</div>';
    }
  }).catch(e=>SK.errors.report(e,"dash:trend",{silent:true}));
}
function heatCard(){
  const R=risksDb(),open=R.risks.filter(r=>r.status!=="closed"),grid=[[0,0,0],[0,0,0],[0,0,0]];
  open.forEach(r=>{grid[(+r.impact||1)-1][(+r.likelihood||1)-1]++});
  return '<section class="skc-card"><h3>خريطة المخاطر<small>Risk Heatmap</small><button type="button" class="linkish" data-go="risks">عرض الكل</button></h3>'+
    (open.length?SKCharts.heatmap(grid):'<div class="skch-empty">لا مخاطر مفتوحة في السجل.<br><button type="button" class="btn sm" data-go="risks" style="margin-top:10px">إضافة خطر</button></div>')+'</section>';
}
/* operational follow-ups recorded in the app (tasks, call list, purchase receipts to review) */
function ownItems(){
  const out=[],t=today();
  const tasks=(load("skosif_tasks_v1",[])||[]).filter(x=>!x.done);
  const over=tasks.filter(x=>x.due&&x.due<t).length,due=tasks.filter(x=>x.due===t).length;
  if(over)out.push({sev:"critical",title:"مهام متأخرة",detail:over+" مهمة تجاوزت تاريخ الاستحقاق.",view:"tasks"});
  if(due)out.push({sev:"warn",title:"مهام مستحقة اليوم",detail:due+" مهمة.",view:"tasks"});
  const q=((load("skosif_followup_v1",{})||{}).queue||[]).filter(x=>!x.done).length;
  if(q)out.push({sev:"info",title:"أرقام بانتظار الاتصال",detail:q+" رقماً في قائمة متابعة العملاء.",view:"followup"});
  const rec=((load("skosif_purchasing_v1",{})||{}).receipts||[]).filter(r=>r.inspection&&r.inspection.overallStatus==="REVIEW"&&!r.reviewed).length;
  if(rec)out.push({sev:"warn",title:"استلامات تحتاج مراجعة",detail:rec+" استلام بفرق وزن أو حرارة خارج الحد.",view:"purchasing"});
  risksDb().findings.filter(f=>f.status!=="resolved"&&f.severity==="high").slice(0,3).forEach(f=>out.push({sev:"critical",title:f.title,detail:(f.ref?f.ref+" · ":"")+(f.detail||"ملاحظة عالية الأثر مفتوحة"),view:"risks"}));
  return out;
}
const SEVL={critical:["عالي","high"],warn:["متوسطة","medium"],info:["منخفض","low"]};
function inbox(){
  const rank={critical:0,warn:1,info:2};
  const list=[...(core().exceptions()||[]),...ownItems()].sort((a,b)=>rank[a.sev]-rank[b.sev]);
  if(!list.length)return '<div class="skc-ok">'+SK.icons.check+'<span>لا شيء يحتاج قراراً الآن — كل المؤشرات ضمن الحدود.</span></div>';
  return '<div class="skc-find">'+list.slice(0,6).map(x=>{const s=SEVL[x.sev]||SEVL.info;return '<button type="button" class="skc-f '+s[1]+'" data-go="'+esc(x.view||"decision")+'"><span class="sksev '+s[1]+'">'+s[0]+'</span><span class="tx"><b>'+esc(x.title||"")+'</b><small>'+esc(x.detail||"")+'</small></span><span class="go" aria-hidden="true">‹</span></button>'}).join("")+'</div>';
}
function taskCard(){
  const tasks=load("skosif_tasks_v1",[])||[],t=today(),n=tasks.length;
  const done=tasks.filter(x=>x.done).length,late=tasks.filter(x=>!x.done&&x.due&&x.due<t).length,open=n-done-late;
  const row=(cls,l,v)=>'<div class="skc-st"><i class="'+cls+'"></i><span>'+l+'</span><b>'+fmt(v)+'/'+fmt(n)+'</b><em>'+(n?fmt(v/n*100):0)+'٪</em></div>';
  return '<section class="skc-card"><h3>حالة المهام<small>Tasks</small><button type="button" class="linkish" data-go="tasks">عرض الكل</button></h3>'+
    (n?row("ok","منجزة",done)+row("info","مفتوحة",open)+row("bad","متأخرة",late)+SKCharts.progress([{label:"نسبة الإنجاز",value:done,max:n,text:fmt(done/n*100)+"٪",cls:"ok"}]):'<div class="skch-empty">لا مهام بعد.<br><button type="button" class="btn sm" data-go="tasks" style="margin-top:10px">مهمة جديدة</button></div>')+'</section>';
}
const KEYL={"aghnam-pricing-v3":["تحديث الأسعار والإعدادات","catalog"],"skosif_tasks_v1":["تحديث المهام","tasks"],"skosif_followup_v1":["سجل متابعة العملاء","followup"],"skosif_purchasing_v1":["أوامر الشراء والاستلام","purchasing"],
  "skosif_risks_v1":["تحديث سجل المخاطر والملاحظات","risks"],"skosif_v31_supplier_batches":["شحنات الموردين","suppliers"],"skosif_v38_ledger":["ائتمان المطاعم","b2bcredit"],"skosif_ledger_v1":["قيود الدفاتر المحاسبية","ledger"],
  "skosif_companies_v1":["الشركات والفترات","companies"],"skosif_profile_v1":["الملف الشخصي","settings"],"skosif_v32_offers":["عروض الأسعار","offers"],"aghnam_v29_inventory":["المخزون","inventory"],"skosif_v38_coldchain":["قراءة تبريد","traceability"],
  "skosif_v38_batches":["دفعات التتبع","traceability"],"aghnam_v29_jev_log":["قرار من Jev","jev"],"skosif_erp_finance_v1":["حركات مالية","cash"]};
function activity(){
  const rtf=window.SKosifNotify?SKosifNotify.ago:(ts=>new Date(ts).toLocaleString("ar"));
  const ev=(SK.audit.all()||[]).filter(e=>["data","backup","restore","transfer","role"].includes(e.type)&&(e.type!=="data"||KEYL[e.key])).slice(0,6);
  if(!ev.length)return '<div class="skch-empty">يظهر هنا ما تسجله: الأسعار والمهام والشحنات والنسخ الاحتياطية.</div>';
  const lab=e=>e.type==="data"?KEYL[e.key][0]+(e.n>1?" ("+e.n+" مرات)":""):e.type==="backup"?"نسخة كاملة للتطبيق":e.type==="restore"?(e.msg==="rollback"?"تراجع عن استعادة":"استعادة بيانات"):e.type==="transfer"?(e.act==="send"?"إرسال حزمة نقل":"استقبال حزمة نقل"):"تغيير الدور";
  const ic=e=>e.type==="backup"?["archive","ok"]:e.type==="restore"?["archive","warn"]:e.type==="transfer"?["devices",""]:e.type==="role"?["user",""]:[KEYL[e.key][1],""];
  return '<ul class="sktl">'+ev.map(e=>{const [i,c]=ic(e);return '<li><span class="ico '+c+'">'+SK.icon(i)+'</span><span class="tx"><b>'+esc(lab(e))+'</b><span>'+esc((SK.caps.roles()[e.role]||{}).label||"")+'</span></span><time>'+esc(rtf(Date.parse(e.at)))+'</time></li>'}).join("")+'</ul>';
}
function extras(){
  const out=[];
  const cold=load("skosif_v38_coldchain",[]),last=Array.isArray(cold)&&cold[0];
  if(last&&last.temp!=null)out.push({l:"آخر قراءة تبريد"+(last.loc?" — "+last.loc:""),v:fmt(Number(last.temp))+"°م",c:Number(last.temp)>4?"bad":"good",go:"traceability"});
  const led=load("skosif_v38_ledger",null);
  if(led&&typeof led==="object"){const cs=Array.isArray(led)?led:(led.customers||[]);const open=cs.reduce((a,c)=>a+(Number(c.balance)||0),0);if(cs.length)out.push({l:"أرصدة ائتمان المطاعم",v:SK.money(open),c:open>0?"warn":"",go:"b2bcredit"})}
  const st=core().stats();if(st.pendingMemos||st.memoItems)out.push({l:"اعتمادات معلّقة",v:fmt(st.pendingMemos+(st.memoItems?1:0)),c:"warn",go:"memo"});
  return out.length?'<div class="sk-kpis skc-extras">'+out.map(x=>'<button type="button" class="sk-kpi '+x.c+'" data-go="'+x.go+'"><span>'+esc(x.l)+'</span><b>'+esc(x.v)+'</b></button>').join("")+'</div>':'';
}
/* one quiet invitation to install the app on this device (hidden for 14 days after «لاحقاً») */
const NUDGE="sk-device-nudge";
function nudge(){
  const d=SK.device;if(!d)return "";
  const m=d.installMode();if(!["ios","prompt","mac-safari"].includes(m))return "";
  try{if(Date.now()-Number(localStorage.getItem(NUDGE)||0)<14*864e5)return ""}catch{}
  const phone=m==="ios";
  return '<div class="skc-install" role="note">'+SK.icon(phone?"phone":"laptop")+'<div class="tx"><b>ثبّت SQC على '+esc(d.label())+'</b><small>'+
    (phone?"يفتح بملء الشاشة من الشاشة الرئيسية، يعمل دون اتصال، ويحمي بياناتك من الحذف التلقائي الذي يطبّقه Safari على المواقع.":
      "نافذة مستقلة في Dock أو قائمة ابدأ، اختصارات لوحة المفاتيح كاملة، ويعمل دون اتصال.")+
    '</small></div><div class="sk-actions"><button type="button" class="btn primary sm" data-nudge="install">'+(m==="prompt"?"تثبيت الآن":"كيف أثبّته؟")+'</button><button type="button" class="btn sm" data-nudge="later">لاحقاً</button></div></div>';
}
function render(root){
  if(!root||!core())return;
  const old=root.querySelector(":scope > .skc");if(old)old.remove();
  const launch=LAUNCH.filter(([id])=>SK.perm.can(id)&&SK.caps.get(id)),can=id=>SK.caps.get(id)&&SK.perm.can(id);
  const html='<section class="skc skc-luxe" aria-label="مركز القيادة">'+nudge()+tiles()+extras()+
    '<div class="skc-row3">'+trendCard()+(can("risks")?heatCard():'')+'<section class="skc-card"><h3>بنية التدفق<small>Cash Structure</small><button type="button" class="linkish" data-go="cash">التفاصيل</button></h3><div id="skc-structure">'+SK.ui.state.loading({text:""})+'</div></section></div>'+
    '<div class="skc-row3b"><section class="skc-card"><h3>ما يحتاج قراراً الآن<small>Decision Inbox</small><button type="button" class="linkish" data-go="decision">مركز القرار</button></h3>'+inbox()+'</section>'+taskCard()+
      '<section class="skc-card"><h3>النشاطات الحديثة<small>Recent Activity</small>'+(can("archive")?'<button type="button" class="linkish" data-go="archive">الأرشيف</button>':'')+'</h3>'+activity()+'</section></div>'+
    (launch.length?'<section class="skc-card"><h3>ابدأ عملاً<small>Quick Start</small></h3><div class="skc-launch">'+launch.map(([id,l])=>'<button type="button" data-go="'+id+'">'+SK.icon(id)+'<span>'+esc(l)+'</span></button>').join("")+'</div></section>':'')+
  '</section>';
  root.insertAdjacentHTML("afterbegin",html);
  const box=root.querySelector(":scope > .skc");
  fillTrend(box);
  box.addEventListener("click",e=>{
    const n=e.target.closest("[data-nudge]");
    if(n){const card=n.closest(".skc-install");if(n.dataset.nudge==="later"){try{localStorage.setItem(NUDGE,String(Date.now()))}catch{}card.remove()}else SK.device.install().then(ok=>{if(ok)card.remove()});return}
    if(e.target.closest("[data-hm]")){core().go("risks");return}
    const r=e.target.closest("[data-range]");if(r){range=+r.dataset.range;box.querySelectorAll("[data-range]").forEach(x=>x.setAttribute("aria-pressed",String(x===r)));fillTrend(box);return}
    const b=e.target.closest("[data-go]");if(b&&SK.caps.get(b.dataset.go)&&SK.perm.can(b.dataset.go))core().go(b.dataset.go)});
}
/* the same numbers for the executive report pack (ui/features/report-pack.js) */
window.SKosifMetrics=Object.freeze({trend:async n=>series(await loadTrend(),n||12),risks:risksDb,findings:()=>risksDb().findings,decisions:()=>{const rank={critical:0,warn:1,info:2};return[...(core().exceptions()||[]),...ownItems()].sort((a,b)=>rank[a.sev]-rank[b.sev])}});
/* redraw the trend at the new width (labels keep their real size) */
let rz=0;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{const b=document.querySelector(".skc-luxe");if(b&&b.isConnected)fillTrend(b)},200)},{passive:true});
function boot(){const c=core();if(c)c.onView("dash",render)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();

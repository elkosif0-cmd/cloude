/* S.kosif — المحاسبة والمراجعة: تطبيقات KOSIF للمراجعة داخل S.kosif.
   ui/audit (مولّد من kosif-audit-studio بواسطة tools/vendor_audit.py) يحوي ثلاثة تطبيقات،
   كل منها داخل Shadow DOM خاص فلا تتداخل أنماطه مع التطبيق، ويُحمَّل عند أول فتح فقط:
   - استوديو المراجعة (ست شاشات لمساحات عمل ملف واحد)
   - استوديو التحليل المالي (بنفورد، المعاينة، اختبار القيود، الوكيل، الصوت)
   - مختبر المعايير والأبحاث */
(()=>{
"use strict";
const APPS={
  studio:{path:"./audit/mount.js",label:"استوديو المراجعة"},
  classic:{path:"./audit/classic/mount.js",label:"استوديو التحليل المالي"},
  lab:{path:"./audit/lab/mount.js",label:"مختبر المعايير"}
};
const state={};
/* ألوان التطبيق تُمرَّر عبر إطار أبٍ: المضيف نفسه يعيد تعريف --brand وغيرها داخل
   الـ Shadow DOM، فلو وُضعت عليه لأشار المتغير إلى نفسه وبطل */
const FRAME_VARS="--kx-ground:var(--ground);--kx-surface:var(--surface);--kx-surface-2:var(--surface-2);--kx-line:var(--line);--kx-ink:var(--ink);--kx-ink-3:var(--ink-3);--kx-brand:var(--brand);--kx-brand-2:var(--brand-2);--kx-font:var(--font)";
function app(key){
  if(state[key])return state[key];
  const frame=document.createElement("div");frame.className="kx-audit-frame";frame.style.cssText=FRAME_VARS;
  const host=document.createElement("div");host.className="kx-audit-host";frame.appendChild(host);
  return state[key]={frame,host,api:null,loading:null,want:"overview"};
}
function auditHubNav(activeId){
  const nav=document.createElement("div");
  nav.className="sk-hub-nav";
  nav.innerHTML=SCREENS.map(s=>'<button type="button" class="sk-hub-btn '+(s[0]===activeId?'active':'')+'" data-audit-go="'+s[0]+'"><span>'+s[5]+'</span><span>'+s[3]+'</span></button>').join("");
  nav.querySelectorAll("[data-audit-go]").forEach(b=>{
    b.onclick=()=>window.SKosifCore?.go(b.dataset.auditGo);
  });
  return nav;
}
function open(key,node,view,screenId){
  const a=app(key);a.want=view;
  const nav=auditHubNav(screenId);
  if(key==="studio"&&view==="documents")node.replaceChildren(nav,tbPanel(),a.frame);
  else node.replaceChildren(nav,a.frame);
  if(a.api){a.api.setView(view);return}
  if(a.loading)return;
  const wait=document.createElement("div");wait.className="sk-empty kx-wait";wait.textContent="جارٍ تحميل "+APPS[key].label+"…";a.frame.before(wait);
  a.loading=import(APPS[key].path).then(m=>m.mount(a.host,a.want)).then(api=>{
    a.api=api;api.setView(a.want);wait.remove();
    try{
      const sRoot=a.host.shadowRoot;
      if(sRoot&&!sRoot.getElementById("sk-audit-unify")){
        const style=document.createElement("style");style.id="sk-audit-unify";
        style.textContent=".topbar,#topbar,.shell-header,.kx-topbar{display:none!important;}.shell,.kx-shell{padding-top:0!important;margin-top:0!important;}";
        sRoot.appendChild(style);
      }
    }catch{}
  })
    .catch(e=>{console.error("S.kosif "+key,e);wait.textContent="تعذر تحميل "+APPS[key].label+". تحقق من الاتصال وأعد المحاولة.";a.loading=null});
}
/* ---------- ميزان مراجعة من دفاتر S.kosif ----------
   يُبنى للفترة المختارة من سجلات التطبيق نفسها، ثم يُسلَّم لنافذة الاستلام في
   الاستوديو ليراجع المستخدم ربط الأعمدة ويعتمده بنفسه. */
const VAT=0.15;
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const r2=v=>Math.round(v*100)/100;
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store,"readonly").objectStore(store).getAll();g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
function inPeriod(d,period){const s=String(d||"").slice(0,10);if(!s)return false;if(period==="all")return true;return period.length===4?s.startsWith(period):s.startsWith(period)}
function monthsIn(period,lines){if(period.length===7)return 1;if(period.length===4){const now=new Date();return String(now.getFullYear())===period?now.getMonth()+1:12}const m=new Set(lines.map(l=>String(l.date||"").slice(0,7)).filter(Boolean));return Math.max(1,m.size)}
async function buildTB(period){
  const lines=(await idbAll("sales_lines")).filter(l=>inPeriod(l.date,period));
  const salesGross=lines.reduce((a,l)=>a+(n(l.amountHalalas)?n(l.amountHalalas)/100:n(l.amount)),0);
  const salesNet=salesGross/(1+VAT),vatOut=salesGross-salesNet;
  const batches=load("skosif_v31_supplier_batches",[]).filter(b=>inPeriod(b.date,period));
  let purNet=0,vatIn=0;batches.forEach(b=>{const q=n(b.qty),g=n(b.priceGross),net=(b.vatIncl?g/(1+VAT):g)*q;purNet+=net;vatIn+=net*VAT});
  const flows=(load("skosif_erp_finance_v1",{flows:[]}).flows||[]).filter(f=>f.type==="payment"&&inPeriod(f.date,period));
  const exp={};flows.forEach(f=>{const k=String(f.category||"مصروفات تشغيلية أخرى");exp[k]=(exp[k]||0)+n(f.amount)});
  if(!flows.length){const opex=n(load("skosif_v31_monthly_opex",0));if(opex>0)exp["مصروفات تشغيلية (تقدير شهري)"]=opex*monthsIn(period,lines)}
  const ar=(load("skosif_v38_ledger",[])||[]).reduce((a,c)=>a+n(c.balance),0);
  const rows=[];
  if(ar)rows.push(["1201","ذمم عملاء آجل",ar,0,"ذمم مدينة"]);
  if(vatIn)rows.push(["1301","ضريبة القيمة المضافة على المشتريات",vatIn,0,"ضرائب مدينة"]);
  if(vatOut)rows.push(["2201","ضريبة القيمة المضافة على المبيعات",0,vatOut,"ضرائب دائنة"]);
  if(salesNet)rows.push(["4001","المبيعات (صافي الضريبة)",0,salesNet,"إيرادات"]);
  if(purNet)rows.push(["5001","مشتريات اللحوم والمواشي",purNet,0,"تكلفة المبيعات"]);
  let code=6001;Object.entries(exp).forEach(([k,v])=>rows.push([String(code++),k,v,0,"مصروفات تشغيلية"]));
  const dr=rows.reduce((a,r)=>a+r[2],0),cr=rows.reduce((a,r)=>a+r[3],0),cash=cr-dr;
  /* النقدية رقم موازن محسوب من الحركات أعلاه، وليس رصيداً بنكياً فعلياً */
  if(rows.length)rows.unshift(["1001","النقدية والبنوك (رصيد محسوب للموازنة)",cash>0?cash:0,cash<0?-cash:0,"نقدية وبنوك"]);
  return {rows:rows.map(r=>[r[0],r[1],r2(r[2]),r2(r[3]),r[4]]),counts:{lines:lines.length,batches:batches.length,flows:flows.length}};
}
const csvCell=v=>{let s=String(v??"");if(/^[=+\-@]/.test(s)&&isNaN(Number(s)))s="'"+s;return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
const tbCSV=rows=>"﻿"+[["كود الحساب","اسم الحساب","مدين","دائن","التصنيف"],...rows.map(r=>[r[0],r[1],r[2].toFixed(2),r[3].toFixed(2),r[4]])].map(r=>r.map(csvCell).join(",")).join("\n")+"\n";
function periods(){const now=new Date(),y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,"0"),pm=new Date(y,now.getMonth()-1,1);
  return [[y+"-"+m,"الشهر الحالي"],[pm.getFullYear()+"-"+String(pm.getMonth()+1).padStart(2,"0"),"الشهر السابق"],[String(y),"السنة الحالية"],["all","كل الفترات"]]}
let tbCard=null;
function tbPanel(){
  if(tbCard)return tbCard;
  tbCard=document.createElement("section");tbCard.className="card kx-tb";
  tbCard.innerHTML='<div class="card-h"><div><h3>ميزان مراجعة من دفاتر S.kosif</h3><p>من المبيعات وشحنات الموردين والمصروفات وذمم الآجل المسجلة في التطبيق، للفترة المختارة. النقدية رقم موازن محسوب.</p></div></div>'+
    '<div class="card-b sk-stack"><div class="sk-actions"><select class="kx-tb-period">'+periods().map(([v,l])=>'<option value="'+v+'">'+l+' ('+(v==="all"?"الكل":v)+')</option>').join("")+'</select>'+
    '<button type="button" class="btn kx-tb-build">إعداد الميزان</button><button type="button" class="btn primary kx-tb-send" disabled>إرسال لنافذة الاستلام</button><button type="button" class="btn kx-tb-csv" disabled>تنزيل CSV</button></div><div class="kx-tb-out"></div></div>';
  let last=null;const $=s=>tbCard.querySelector(s);
  $(".kx-tb-build").onclick=async()=>{
    const period=$(".kx-tb-period").value,tb=await buildTB(period);last={period,...tb};
    const out=$(".kx-tb-out");
    if(!tb.rows.length){out.innerHTML='<div class="sk-note warn">لا توجد مبيعات أو مشتريات أو مصروفات مسجلة في هذه الفترة.</div>';$(".kx-tb-send").disabled=$(".kx-tb-csv").disabled=true;return}
    const f=v=>v?v.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—",dr=tb.rows.reduce((a,r)=>a+r[2],0),cr=tb.rows.reduce((a,r)=>a+r[3],0);
    out.innerHTML='<div class="sk-note">المصادر: '+tb.counts.lines+' سطر مبيعات، '+tb.counts.batches+' شحنة مورد، '+tb.counts.flows+' مدفوعات مسجلة.</div>'+
      '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الكود</th><th>الحساب</th><th>مدين</th><th>دائن</th><th>التصنيف</th></tr></thead><tbody>'+
      tb.rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1].replace(/[<>&]/g,"")+'</td><td>'+f(r[2])+'</td><td>'+f(r[3])+'</td><td>'+r[4]+'</td></tr>').join("")+
      '<tr><td></td><td><b>الإجمالي</b></td><td><b>'+f(dr)+'</b></td><td><b>'+f(cr)+'</b></td><td>'+(Math.abs(dr-cr)<0.01?"متزن":"غير متزن")+'</td></tr></tbody></table></div>';
    $(".kx-tb-send").disabled=$(".kx-tb-csv").disabled=false;
  };
  $(".kx-tb-csv").onclick=()=>{if(!last)return;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([tbCSV(last.rows)],{type:"text/csv;charset=utf-8"}));a.download="S.kosif-trial-balance-"+last.period+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  $(".kx-tb-send").onclick=()=>{
    const a=state.studio,root=a&&a.host.shadowRoot;if(!last||!root)return;
    root.getElementById("openSpreadsheetIntake")?.click();
    const input=root.getElementById("spreadsheetFile");if(!input)return window.SK.toast("نافذة الاستلام غير جاهزة بعد","err");
    const dt=new DataTransfer();dt.items.add(new File([tbCSV(last.rows)],"S.kosif-trial-balance-"+last.period+".csv",{type:"text/csv"}));
    input.files=dt.files;input.dispatchEvent(new Event("change",{bubbles:true}));
    window.SK.toast("راجع ربط الأعمدة في نافذة الاستلام ثم اعتمد الاستيراد","info");
  };
  return tbCard;
}

const SV=p=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const SCREENS=[
  ["auditdesk","studio","overview","مركز المراجعة","المرحلة الحالية والخطوة التالية ومؤشرات ملف المراجعة","",SV('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>')],
  ["auditdocs","studio","documents","المستندات والأدلة","استلام المستندات وموازين المراجعة وطلبات الأدلة","",SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>')],
  ["auditissues","studio","issues","الملاحظات والقضايا","سجل الملاحظات وحالتها وربطها بالأدلة","",SV('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>')],
  ["auditcouncil","studio","council","مجلس المراجعين","تسعة مراجعين متخصصين وجولات المراجعة","",SV('<path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>')],
  ["auditfin","studio","financials","القوائم والقيود","القيود المقترحة والقوائم المالية والتدفقات وحقوق الملكية والإفصاحات","",SV('<path d="M4 4h16v16H4zM4 9h16M9 9v11"/>')],
  ["auditreport","studio","report","التقارير والإصدار","بناء التقارير والتتبع والإكمال والإصدار","",SV('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/>')],
  ["auditanalytics","classic","overview","التحليل المالي والمخاطر","بنفورد، المعاينة، اختبار القيود، النسب، الأهمية النسبية، الوكيل والمساعد الصوتي","",SV('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>')],
  ["auditlab","lab","overview","مختبر المعايير والأبحاث","مصادر IFRS وISA وSOCPA وسريانها، وأسئلة البحث المهني","",SV('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>')]
];
SCREENS.forEach(([id,key,view,title,sub,emoji,icon])=>window.SK.view(id,{title,sub,emoji,adv:true,icon,render(node){open(key,node,view,id)}}));
})();

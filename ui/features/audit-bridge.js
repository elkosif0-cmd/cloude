/* S.kosif — المحاسبة والمراجعة: تطبيقات KOSIF للمراجعة داخل S.kosif.
   ui/audit (مولّد من kosif-audit-studio بواسطة tools/vendor_audit.py) يحوي ثلاث أدوات،
   كل منها داخل Shadow DOM خاص فلا تتداخل أنماطه مع التطبيق، ويُحمَّل عند أول فتح فقط.
   منظومة واحدة: لا تطبيق داخل التطبيق —
   - استوديو المراجعة: تبويب «الاستوديو المتقدم» داخل «مركز المراجعة» يستقبل ميزان الملف نفسه
     (صفحاته الست مخفية من القائمة؛ فتحها بالبحث أو برابط يفتح التبويب على الصفحة المطلوبة)
   - التحليل والاختبارات (بنفورد، المعاينة، اختبار القيود، الوكيل، الصوت): صفحة في مركز المراجعة
   - مختبر المعايير والأبحاث: صفحة في «المعايير والمدونة» بجوار المدونة المحاسبية */
(()=>{
"use strict";
const APPS={
  studio:{path:"./audit/mount.js",label:"استوديو المراجعة"},
  classic:{path:"./audit/classic/mount.js",label:"استوديو التحليل المالي"},
  lab:{path:"./audit/lab/mount.js",label:"مختبر المعايير"}
};
const state={};
/* ---------- one identity: the embedded tools take the chosen theme's colours, type and night mode ----------
   custom properties cross the shadow boundary, so each tool's own variables are pointed at the app's tokens
   (:host raises specificity over the tools' own !important rules); their private sidebars give way to the
   app's own tabs above the frame. */
const TOK=(m)=>":host .kx-body,:host .kx-body[data-theme]{"+Object.entries(m).map(([k,v])=>k+":var("+v+")!important").join(";")+"}";
const BASE=":host .kx-body{background:transparent!important;color:var(--sk-ink)!important;font-family:var(--sk-font)!important;font-feature-settings:'tnum' 1}"+
  ":host .kx-body h1,:host .kx-body h2,:host .kx-body h3{font-family:var(--sk-font-display)!important;color:var(--sk-ink)!important}"+
  ":host .kx-body button,:host .kx-body input,:host .kx-body select,:host .kx-body textarea{font-family:inherit!important}";
const THEME={
  classic:TOK({"--bg":"--sk-bg","--surface":"--sk-surface","--surface-2":"--sk-surface-2","--surface-3":"--sk-surface-3","--text":"--sk-ink","--muted":"--sk-ink-3","--line":"--sk-line","--line-strong":"--sk-line-2",
    "--primary":"--sk-brand","--primary-strong":"--sk-brand","--primary-soft":"--sk-brand-soft","--accent":"--sk-brand-2","--accent-soft":"--sk-info-soft","--danger":"--sk-bad","--danger-soft":"--sk-bad-soft",
    "--warning":"--sk-warn","--warning-soft":"--sk-warn-soft","--success":"--sk-ok","--success-soft":"--sk-ok-soft","--info":"--sk-info","--info-soft":"--sk-info-soft","--critical":"--sk-bad","--shadow-sm":"--sk-shadow-1","--shadow-md":"--sk-shadow-2",
    "--radius-sm":"--sk-r-s","--radius":"--sk-r","--radius-lg":"--sk-r-l","--font":"--sk-font"})+BASE+
    ":host .sidebar,:host .sidebar-backdrop{display:none!important}:host .workspace{margin:0!important}:host .main-content{padding:8px 0 32px!important;max-width:none!important}",
  studio:TOK({"--bg":"--sk-bg","--surface":"--sk-surface","--surface2":"--sk-surface-2","--line":"--sk-line","--text":"--sk-ink","--muted":"--sk-ink-3","--brand":"--sk-brand","--brand2":"--sk-brand-2",
    "--green":"--sk-ok","--amber":"--sk-warn","--red":"--sk-bad","--blue":"--sk-info","--radius":"--sk-r-l","--kosif-ink":"--sk-ink","--kosif-purple":"--sk-brand","--kosif-purple-2":"--sk-brand-2","--kosif-cream":"--sk-bg","--kosif-line":"--sk-line","--kosif-gold":"--sk-warn-mark"})+BASE+
    ":host .kx-body{background-image:none!important}:host .panel,:host .card{background:var(--sk-surface)!important;border-color:var(--sk-line)!important;color:var(--sk-ink)!important;box-shadow:var(--sk-shadow-1)!important}",
  lab:TOK({"--bg":"--sk-bg","--panel":"--sk-surface","--panel2":"--sk-surface-2","--line":"--sk-line","--text":"--sk-ink","--muted":"--sk-ink-3","--accent":"--sk-brand","--good":"--sk-ok"})+BASE
};
/* the analytics tool's pages as the app's own tabs (its sidebar is hidden) */
function viewsBar(a){
  const root=a.host.shadowRoot;if(!root)return;const items=[...root.querySelectorAll("#mainNav .nav-item,.nav-list .nav-item")];if(!items.length)return;
  let bar=a.frame.previousElementSibling;if(!bar||!bar.classList.contains("kx-views")){bar=document.createElement("nav");bar.className="kx-views sk-seg";bar.setAttribute("aria-label","صفحات التحليل");a.frame.before(bar)}
  const cur=(items.find(x=>x.classList.contains("active"))||items[0]).dataset.view;
  /* nothing of the hidden chrome is lost: page counts ride on the tabs, voice and the tool's command palette sit beside them */
  const label=x=>{const t=(x.querySelector("span")||x).textContent.trim();return ({"مركز القيادة":"نظرة عامة"})[t]||t},badge=x=>{const n=x.querySelector(".nav-badge");const v=n?n.textContent.trim():"";return v&&v!=="0"&&v!=="—"?' <i class="kx-n">'+v+'</i>':""};
  bar.innerHTML=items.map(x=>'<button type="button" data-kxv="'+x.dataset.view+'" aria-pressed="'+(x.dataset.view===cur)+'">'+label(x)+badge(x)+'</button>').join("")+
    (root.getElementById("voiceTopButton")?'<button type="button" class="kx-tool" data-kxb="voiceTopButton" title="المحادثة الصوتية المباشرة (V)">🎙 صوتي</button>':"")+
    (root.getElementById("paletteButton")?'<button type="button" class="kx-tool" data-kxb="paletteButton" title="أوامر أدوات التحليل">⌘ الأوامر</button>':"");
  bar.onclick=e=>{const t=e.target.closest("[data-kxb]");if(t){const el=root.getElementById(t.dataset.kxb);if(el)el.click();return}
    const b=e.target.closest("[data-kxv]");if(!b)return;const it=items.find(x=>x.dataset.view===b.dataset.kxv);if(it){it.click();bar.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)))}};
}
/* night mode follows the app */
function syncTheme(){Object.values(state).forEach(a=>{const b=a.host.shadowRoot&&a.host.shadowRoot.querySelector(".kx-body");if(b)b.setAttribute("data-theme",document.documentElement.getAttribute("data-theme")==="dark"?"dark":"light")})}
new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-look"]});
/* ألوان التطبيق تُمرَّر عبر إطار أبٍ: المضيف نفسه يعيد تعريف --brand وغيرها داخل
   الـ Shadow DOM، فلو وُضعت عليه لأشار المتغير إلى نفسه وبطل */
const FRAME_VARS="--kx-ground:var(--ground);--kx-surface:var(--surface);--kx-surface-2:var(--surface-2);--kx-line:var(--line);--kx-ink:var(--ink);--kx-ink-3:var(--ink-3);--kx-brand:var(--brand);--kx-brand-2:var(--brand-2);--kx-font:var(--font)";
function app(key){
  if(state[key])return state[key];
  const frame=document.createElement("div");frame.className="kx-audit-frame";frame.style.cssText=FRAME_VARS;
  const host=document.createElement("div");host.className="kx-audit-host";frame.appendChild(host);
  return state[key]={frame,host,api:null,loading:null,want:"overview"};
}
function open(key,node,view,screenId){
  /* the domain strip above (shell) already lists every audit screen: no second hub menu here */
  const a=app(key);a.want=view;
  node.replaceChildren(a.frame);
  if(a.api){a.api.setView(view);if(key==="classic"){feedAnalytics(a);viewsBar(a)}return}
  if(a.loading)return;
  const wait=document.createElement("div");wait.className="sk-empty kx-wait";wait.textContent="جارٍ تحميل "+APPS[key].label+"…";a.frame.before(wait);
  a.loading=import(APPS[key].path).then(m=>m.mount(a.host,a.want)).then(api=>{
    a.api=api;api.setView(a.want);wait.remove();if(key==="studio")seedStudio(a);
    syncTheme();if(key==="classic"){setTimeout(()=>feedAnalytics(a),400);setTimeout(()=>viewsBar(a),300)}
    try{
      const sRoot=a.host.shadowRoot;
      if(sRoot&&!sRoot.getElementById("sk-audit-unify")){
        const style=document.createElement("style");style.id="sk-audit-unify";
        style.textContent=".topbar,#topbar,.shell-header,.kx-topbar{display:none!important;}.shell,.kx-shell{padding-top:0!important;margin-top:0!important;}"+(key==="studio"?".shell>.hero{display:none!important;}":"")+THEME[key];
        sRoot.appendChild(style);
      }
    }catch{}
  })
    .catch(e=>{console.error("S.kosif "+key,e);wait.textContent="تعذر تحميل "+APPS[key].label+". تحقق من الاتصال وأعد المحاولة.";a.loading=null});
}
/* ---------- ميزان مراجعة من السجلات التشغيلية ----------
   يُبنى للفترة من سجلات التطبيق نفسها (المبيعات والموردون والمدفوعات والآجل) ويستعمله ملف المراجعة
   حين لا توجد قيود في الدفاتر المحاسبية. */
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
  ["auditdesk","studio","overview","نظرة عامة","المرحلة الحالية والخطوة التالية ومؤشرات ملف المراجعة","",SV('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>')],
  ["auditdocs","studio","documents","المستندات والأدلة","استلام المستندات وموازين المراجعة وطلبات الأدلة","",SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>')],
  ["auditissues","studio","issues","الملاحظات والقضايا","سجل الملاحظات وحالتها وربطها بالأدلة","",SV('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>')],
  ["auditcouncil","studio","council","مجلس المراجعين","تسعة مراجعين متخصصين وجولات المراجعة","",SV('<path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>')],
  ["auditfin","studio","financials","القوائم والقيود","القيود المقترحة والقوائم المالية والتدفقات وحقوق الملكية والإفصاحات","",SV('<path d="M4 4h16v16H4zM4 9h16M9 9v11"/>')],
  ["auditreport","studio","report","التقارير والإصدار","بناء التقارير والتتبع والإكمال والإصدار","",SV('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/>')],
  ["auditanalytics","classic","overview","التحليل المالي والمخاطر","بنفورد، المعاينة، اختبار القيود، النسب، الأهمية النسبية، الوكيل والمساعد الصوتي","",SV('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>')],
  ["auditlab","lab","overview","مختبر المعايير والأبحاث","مصادر IFRS وISA وSOCPA وسريانها، وأسئلة البحث المهني","",SV('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>')]
];
/* send a trial balance (rows [code,name,debit,credit,category] in major units) into the studio's intake */
function sendTB(rows,label){
  const a=state.studio,root=a&&a.host.shadowRoot;if(!root){window.SK.toast("افتح الاستوديو أولاً ثم أعد الإرسال","warn");return false}
  root.getElementById("openSpreadsheetIntake")?.click();
  const input=root.getElementById("spreadsheetFile");if(!input){window.SK.toast("نافذة الاستلام غير جاهزة بعد","err");return false}
  const dt=new DataTransfer();dt.items.add(new File([tbCSV(rows)],"KOSIF-trial-balance-"+(label||"file")+".csv",{type:"text/csv"}));
  input.files=dt.files;input.dispatchEvent(new Event("change",{bubbles:true}));
  window.SK.toast("راجع ربط الأعمدة في نافذة الاستلام ثم اعتمد الاستيراد","info");return true;
}
/* the analytics tools take the engagement's own trial balance (once per version of it) — no second upload */
let fedSig="";
function feedAnalytics(a){
  try{const t=window.SKosifTBReview&&SKosifTBReview.rows();if(!t||t.sig===fedSig)return;
    const root=a.host.shadowRoot,input=root&&root.getElementById("fileInput");if(!input)return;
    const dt=new DataTransfer();dt.items.add(new File([tbCSV(t.rows)],"KOSIF-engagement-tb.csv",{type:"text/csv"}));input.files=dt.files;input.dispatchEvent(new Event("change",{bubbles:true}));
    fedSig=t.sig;window.SK.toast("استُلم ميزان ملف المراجعة («"+t.label+"») في أدوات التحليل","info");
  }catch(e){console.error("S.kosif analytics feed",e)}
}
/* on a device running the demo company an empty studio opens on its own sample engagement (5000 accounts) with a
   council round, a proposed adjustment and a report draft, so every page shows how it works; never over real work */
async function seedStudio(a){
  try{
    if(!(window.SK.demo&&SK.demo.active&&SK.demo.active()))return;
    const st=await import("./audit/v5/continuous-store.js");
    if(st.store.engagement.documents.length||st.store.analysis)return;
    (await import("./audit/v5/continuous-documents.js")).loadDemo();
    st.store.engagement.entity="نموذج استوديو المراجعة — 5000 حساب (بيانات تجريبية)";window.__skStudioDemo=true;
    const root=a.host.shadowRoot,wait=ms=>new Promise(r=>setTimeout(r,ms));
    for(const id of ["runCouncilButton","proposeAdjustmentButton","buildDraftButton"]){const b=root&&root.getElementById(id);if(b){b.click();await wait(700)}}
    a.api.setView(a.want);
  }catch(e){console.error("S.kosif studio demo",e)}
}
/* the audit studio lives inside «مركز المراجعة» (tab «الاستوديو المتقدم»): mount it in the engagement's own tab */
/* the studio's two starting points (its hidden welcome panel) from the engagement's tab */
function studioAction(id){const r=state.studio&&state.studio.host.shadowRoot,el=r&&r.getElementById(id);if(el){el.click();return true}window.SK.toast("افتح الاستوديو أولاً","warn");return false}
function mountStudio(node,view){open("studio",node,view||"overview","auditdesk");if((view||"overview")==="documents")node.insertBefore(tbPanel(),node.firstChild)}
/* the operational trial balance (sales, supplier batches, payments, credit) for the TB review */
window.SKosifAuditBridge=Object.freeze({buildTB,mountStudio,sendTB,studioAction,STUDIO_VIEWS:SCREENS.filter(x=>x[1]==="studio").map(x=>({id:x[0],view:x[2],label:x[3],sub:x[4]}))});
/* a studio page opened directly (search, deep link, old bookmark) opens the engagement's studio tab on that page */
SCREENS.forEach(([id,key,view,title,sub,emoji,icon])=>window.SK.view(id,{title,sub,emoji,adv:true,icon:window.SK.icons[id]||icon,render(node){
  if(key==="studio"&&window.SKosifTBReview&&SKosifTBReview.studio){node.innerHTML='<div class="sk-empty kx-wait">يفتح «مركز المراجعة › الاستوديو المتقدم»…</div>';setTimeout(()=>SKosifTBReview.studio(view),0);return}
  open(key,node,view,id)}}));
})();

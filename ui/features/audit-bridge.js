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
// The embedded applications do not yet carry published-source identity, units,
// comparative dates or non-assurance status. Refuse this transport at each entry.
function reviewTransport(){try{return window.SKosifTBReview&&SKosifTBReview.rows()}catch{return {sourceOnly:true}}}
function sourceBlocked(t=reviewTransport()){return !!(t&&(t.mappingUnsupported||t.sourceOnly||t.sourceKind!==undefined||t.ctx&&(t.ctx.sourceKind!==undefined||t.ctx.sourceModel!==undefined)))}
/* Read-only mapped-model projection. Never seed the secondary ledger or issue a report from this snapshot. */
function canonicalStatementHTML(s){
  const esc=SK.esc,money=v=>Number.isFinite(v)?(v/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—";
  const table=(key,title)=>{const before=new Map(s.before[key].map(r=>[r.key,r])),after=new Map(s.after[key].map(r=>[r.key,r])),rows=[...s.after[key]];
    // Preserve both versions: zero lines and conditional nonzero subtotals can be omitted from display rows.
    s.before[key].forEach((r,i)=>{if(after.has(r.key))return;const next=s.before[key].slice(i+1).find(x=>rows.some(y=>y.key===x.key)),at=next?rows.findIndex(x=>x.key===next.key):rows.length;rows.splice(at,0,r)});
    const value=(fs,map,r)=>{const displayed=map.get(r.key);if(displayed)return displayed.current;if(r.level==="line")return 0;const subtotal=fs.keys[r.key]?.current;return Number.isFinite(subtotal)?subtotal:null};
    return '<h4>'+title+'</h4><div class="sk-table-wrap"><table class="sk-table" data-sk-plain><thead><tr><th>البند</th><th>قبل التسويات</th><th>بعد التسويات</th><th>الفرق</th><th>الفترة المقارنة · '+esc(s.priorPeriodEnd||"تاريخ المقارنة غير موثق")+'</th></tr></thead><tbody>'+rows.map(r=>{
    if(r.level==="heading")return '<tr><th colspan="5">'+esc(r.ar)+'</th></tr>';
    const bv=value(s.before,before,r),av=value(s.after,after,r),delta=Number.isFinite(av)&&Number.isFinite(bv)?av-bv:null;return '<tr><td>'+esc(r.ar)+'</td><td class="num">'+money(bv)+'</td><td class="num">'+money(av)+'</td><td class="num">'+money(delta)+'</td><td class="num">'+money(r.prior)+'</td></tr>';
  }).join("")+'</tbody></table></div>'};
  const balance=(label,fs)=>'<p class="'+(fs.checks.balanced?'hint':'tbr-warn')+'">'+label+': '+(fs.checks.balanced?'متوازنة':'غير متوازنة — فرق '+money(fs.checks.difference))+' · الربط: '+esc(fs.checks.mappedPct)+'% · الفترة المقارنة: '+(!fs.hasPrior?'غير متاحة':fs.checks.priorBalanced?'متوازنة':'غير متوازنة')+'</p>';
  const pages=Object.entries(s.provenance.pages).map(([k,v])=>esc(k)+': '+esc(v)).join(' · ');
  return '<section class="card" data-canonical-statements><div class="card-h"><div><h3>القوائم المرجعية من ملف المراجعة الرئيسي</h3><p>'+esc(s.entity)+' · '+esc(s.period)+' · '+esc(s.framework)+' · '+esc(s.jurisdiction)+' · '+esc(s.currency)+' '+esc(s.unit)+' ('+esc(s.displayUnit)+')</p></div></div><div class="card-b">'+
    '<p class="tbr-warn" role="status">'+esc(s.limitation)+'</p><p>المصدر: '+esc(s.provenance.sourceLabel)+' · '+esc(s.provenance.corpusId)+(pages?' · صفحات الحزمة: '+pages:'')+'</p>'+
    '<p>'+(s.provenance.modifiedFromModel?'الميزان أو الربط عُدّل عن نموذج الحزمة؛ الأرقام تتبع الملف الحالي.':'الميزان والربط مطابقان لنموذج الحزمة؛ لا يعني ذلك تحققاً مستقلاً من المستند الأصلي.')+' التسويات المعتمدة في الملف الرئيسي: '+esc(s.acceptedIds.join('، ')||'لا توجد')+'. حقوق الملكية المعروضة تشمل نتيجة الفترة.</p>'+
    balance('قبل التسويات',s.before)+balance('بعد التسويات',s.after)+table('pl','قائمة الربح أو الخسارة')+table('sfp','قائمة المركز المالي')+
    '<details><summary>تتبع الربط إلى حسابات الملف</summary>'+s.after.lines.map(l=>'<p><b>'+esc(l.ar)+'</b>: '+l.accounts.map(a=>esc(a.code)+' — '+esc(a.name)).join('، ')+'</p>').join('')+'</details></div></section>';
}
function sourceUnavailable(node){
  const t=reviewTransport();
  if(node&&t&&t.mappingUnsupported){if(t.canonicalStatements){node.innerHTML=canonicalStatementHTML(t.canonicalStatements);return}node.innerHTML='<div class="sk-empty" role="status">الاستوديو الثانوي غير متاح لهذا الميزان: لا يدعم ربط بنوده أو بيانات إطار المصدر الحالية، وقد يعيد تصنيف الإيرادات والضرائب بصورة مختلفة. استخدم القوائم والتسويات وطلبات الأدلة في ملف المراجعة الرئيسي أعلاه. لم تتغير الأرقام أو المستندات المحفوظة.</div>';return}
  if(node)node.innerHTML='<div class="sk-empty" role="status">أدوات الاستوديو غير متاحة لنموذج القوائم المنشورة: انتقل إلى مرجع المصدر. لا يُحوّل هذا النموذج إلى دفتر أستاذ أو تكليف مراجعة.</div>'}
function sameTransport(t){const now=reviewTransport();return !sourceBlocked(now)&&(!t&&!now||!!t&&!!now&&t.sig===now.sig&&t.label===now.label)}
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
  if(key!=="lab"&&sourceBlocked()){sourceUnavailable(node);return}
  /* the domain strip above (shell) already lists every audit screen: no second hub menu here */
  const a=app(key);a.want=view;
  node.replaceChildren(a.frame);
  if(a.api){a.api.setView(view);if(key==="classic"){feedAnalytics(a);viewsBar(a)}if(key==="studio")syncStudio(a);return}
  if(a.loading)return;
  const wait=document.createElement("div");wait.className="sk-empty kx-wait";wait.textContent="جارٍ تحميل "+APPS[key].label+"…";a.frame.before(wait);
  a.loading=import(APPS[key].path).then(m=>{if(key!=="lab"&&sourceBlocked()){sourceUnavailable(node);return null}return m.mount(a.host,a.want)}).then(api=>{
    if(!api||key!=="lab"&&sourceBlocked()){sourceUnavailable(node);a.loading=null;return}
    a.api=api;if(key==="studio")recolorStudio(a.host.shadowRoot);api.setView(a.want);wait.remove();if(key==="studio")syncStudio(a);
    syncTheme();if(key==="classic"){setTimeout(()=>feedAnalytics(a),400);setTimeout(()=>viewsBar(a),300)}
    try{
      const sRoot=a.host.shadowRoot;
      if(sRoot&&!sRoot.getElementById("sk-audit-unify")){
        const style=document.createElement("style");style.id="sk-audit-unify";
        style.textContent=".topbar,#topbar,.shell-header,.kx-topbar{display:none!important;}.shell,.kx-shell{padding-top:0!important;margin-top:0!important;}"+(key==="studio"?".shell>.hero{display:none!important;}"+STUDIO_HIDE:"")+THEME[key];
        sRoot.appendChild(style);
      }
    }catch{}
  })
    .catch(e=>{console.error("SQC "+key,e);wait.textContent="تعذر تحميل "+APPS[key].label+". تحقق من الاتصال وأعد المحاولة.";a.loading=null});
}
/* ---------- ميزان مراجعة من السجلات التشغيلية ----------
   يُبنى للفترة من سجلات التطبيق نفسها (المبيعات والموردون والمدفوعات والآجل) ويستعمله ملف المراجعة
   حين لا توجد قيود في الدفاتر المحاسبية. */
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const r2=v=>Math.round(v*100)/100;
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store,"readonly").objectStore(store).getAll();g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
function inPeriod(d,period){const s=String(d||"").slice(0,10);if(!s)return false;if(period==="all")return true;return period.length===4?s.startsWith(period):s.startsWith(period)}
function monthsIn(period,lines){if(period.length===7)return 1;if(period.length===4){const now=new Date();return String(now.getFullYear())===period?now.getMonth()+1:12}const m=new Set(lines.map(l=>String(l.date||"").slice(0,7)).filter(Boolean));return Math.max(1,m.size)}
async function buildTB(period){
  const VAT=SK.vatRate();
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
/* the analytics tools take the engagement's own trial balance (once per version of it) — no second upload */
let fedSig="";
function feedAnalytics(a){
  try{const t=reviewTransport();if(sourceBlocked(t)||!t||t.sig===fedSig)return;
    const root=a.host.shadowRoot,input=root&&root.getElementById("fileInput");if(!input)return;
    const dt=new DataTransfer();dt.items.add(new File([tbCSV(t.rows)],"SQC-engagement-tb.csv",{type:"text/csv"}));input.files=dt.files;input.dispatchEvent(new Event("change",{bubbles:true}));
    /* said only on the analytics screen itself: fed in the background, it popped up over whatever screen was open */
    fedSig=t.sig;if(window.SKosifCore&&SKosifCore.view()==="auditanalytics")window.SK.toast("استُلم ميزان ملف المراجعة («"+t.label+"») في أدوات التحليل","info");
  }catch(e){console.error("SQC analytics feed",e)}
}
/* ---------- the studio is part of the engagement file, not a second app ----------
   It always works on the file's own trial balance and company (synced once per version of the file), its private
   menu, intake buttons and server settings are hidden (the engagement's tabs, its trial-balance tab and the documents
   tab's own status do those jobs), and its colours are rewritten to the app's tokens. Work the owner brings into the
   studio by other means (its cloud session) is never overwritten. */
const STUDIO_HIDE="#workspaceNavigation,.workspace-navigation,.gateway-strip,#remotePersistenceState,#demoButton,#openSpreadsheetIntake,.eyebrow{display:none!important}";
const V5="./audit/v5/";
async function renderStudio(expected){
  if(sourceBlocked()||expected&&!sameTransport(expected))return;
  const m=await Promise.all(["continuous-store","continuous-documents","continuous-council","continuous-issues","continuous-coverage","continuous-statements","continuous-statement-lineage","continuous-reporting",
    "continuous-report-intake","continuous-cash-flow","continuous-equity","continuous-disclosures","continuous-completion","continuous-publication","continuous-trace-inspector","continuous-workspace-navigation","dashboard-suite"].map(n=>import(V5+n+".js")));
  if(sourceBlocked()||expected&&!sameTransport(expected))return;
  const [st,dc,co,is,cv,sm,sl,rp,ri,cf,eq,di,cp,pb,tr,wn,ds]=m;
  ri.reconcileReportIntake();st.derive();rp.renderNow();dc.renderAnalysisMetrics();dc.renderDocuments();rp.renderRecipe();ri.renderReportIntake();co.renderCouncil();co.renderRequests();is.renderIssues();cv.renderCoverage();
  rp.renderCandidates();rp.renderAdjustments();sm.renderStatements();sl.renderStatementLineage();cf.renderCashFlow();eq.renderEquity();di.renderDisclosures();rp.renderTrace();if(st.store.engagement.reports.length)rp.renderReport();
  pb.renderPublication();tr.renderTraceInspector();cp.renderCompletion();wn.renderWorkspaceNavigation();ds.renderDashboardSuite();
}
let syncSig="",syncing=null;
/* the studio wants ISO codes: the file keeps the currency as the owner typed it */
function isoCurrency(c,country){const v=String(c||"");return /EGP|مصر|جنيه/i.test(v)||(!v&&country==="EG")?"EGP":/AED|درهم|إمارات/i.test(v)?"AED":/USD|دولار/i.test(v)?"USD":/KWD|كويت/i.test(v)?"KWD":"SAR"}
function hashId(v){let h=2166136261;for(const ch of String(v)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase()}
function yearEnd(p){const m=String(p||"").match(/(19|20)\d{2}/);return (m?m[0]:String(new Date().getFullYear()))+"-12-31"}
function syncStudio(a){if(sourceBlocked())return Promise.resolve();if(syncing)return syncing;syncing=doSync(a).finally(()=>{syncing=null});return syncing}
async function doSync(a){
  try{
    const t=reviewTransport();if(sourceBlocked(t))return;
    const st=await import(V5+"continuous-store.js");if(!sameTransport(t))return;
    const demo=!!(window.SK.demo&&SK.demo.active&&SK.demo.active());
    const own=String(st.store.engagement.id||"").startsWith("SK-")||window.__skStudioDemo,filled=st.store.engagement.documents.length||st.store.analysis;
    if(filled&&!own)return;
    const root=a.host.shadowRoot,wait=ms=>new Promise(r=>setTimeout(r,ms));
    if(t){
      if(t.sig===syncSig&&own)return;
      const em=await import(V5+"engagement-machine.js"),docs=await import(V5+"continuous-documents.js");if(!sameTransport(t))return;const c=t.ctx||{};
      st.resetEngagement(em.createEngagement({id:"SK-ENG-"+hashId(t.sig||t.label),entity:t.label,period:yearEnd(c.period),jurisdiction:c.country==="EG"?"EG":"SA",framework:c.framework||"IFRS",engagementType:"audit",currency:isoCurrency(c.currency,c.country)}));
      const csv=tbCSV(t.rows);
      st.store.engagement.documents.push({id:"DOC-0001",name:"ميزان الملف — "+t.label+".csv",type:"trial-balance",mime:"text/csv",size:new TextEncoder().encode(csv).length,sha256:"ميزان الملف · "+hashId(csv),version:1,status:"classified",analysisStatus:"ميزان الملف",createdAt:new Date().toISOString()});
      docs.loadTrialBalance(t.rows.map(r=>({code:r[0],name:r[1],debit:Number(r[2]).toFixed(2),credit:Number(r[3]).toFixed(2)})),t.label);
      syncSig=t.sig;window.__skStudioDemo=false;await renderStudio(t);
    }else if(demo&&!filled){
      const docs=await import(V5+"continuous-documents.js");if(!sameTransport(t))return;docs.loadDemo();
      st.store.engagement.entity="نموذج استوديو المراجعة — 5000 حساب (بيانات تجريبية)";window.__skStudioDemo=true;
    }else return;
    /* on the demo company every page shows how it works: a council round, a proposed entry and a report draft */
    if(demo)for(const id of ["runCouncilButton","proposeAdjustmentButton","buildDraftButton"]){if(!sameTransport(t))return;const b=root&&root.getElementById(id);if(b){b.click();await wait(600)}}
    a.api.setView(a.want);
  }catch(e){console.error("SQC studio sync",e)}
}
/* ---------- one palette: the studio's own colours (written for a dark stage) rewritten to the app's tokens ---------- */
const RC={
  border:{"#342741":"--sk-line","#ffffff0c":"--sk-line","#ffffff12":"--sk-line","#eef2f7":"--sk-line","#f1f5f9":"--sk-line","#e2e8f0":"--sk-line","#e0e7ff":"--sk-line","#ddd3df":"--sk-line","#ffffff05":"--sk-line",
    "#34d399":"--sk-ok","#69a889":"--sk-ok","#fb7185":"--sk-bad","#fbbf24":"--sk-warn","#c98f4c":"--sk-warn","#60a5fa":"--sk-info","#a78bfa":"--sk-info","#6366f1":"--sk-brand","#4f46e5":"--sk-brand"},
  color:{"#aaa1b4":"--sk-ink-3","#8f8798":"--sk-ink-3","#64748b":"--sk-ink-3","#94a3b8":"--sk-ink-3","#756d79":"--sk-ink-3","#b9b2c0":"--sk-ink-3","#c8c0d0":"--sk-ink-3",
    "#f6f2fa":"--sk-ink","#1e293b":"--sk-ink","#334155":"--sk-ink","#4f46e5":"--sk-brand","#6366f1":"--sk-brand","#4338ca":"--sk-brand","#5eead4":"--sk-ok","#34d399":"--sk-ok",
    "#fbbf24":"--sk-warn","#fb7185":"--sk-bad","#be123c":"--sk-bad","#a78bfa":"--sk-info","#60a5fa":"--sk-info"},
  bg:{"#ffffff03":"--sk-surface","#ffffff04":"--sk-surface","#ffffff05":"--sk-surface","#100c16":"--sk-surface","#0f0b14":"--sk-surface","#17101e":"--sk-surface","#1a1322":"--sk-surface","#100c16e8":"--sk-surface","#fff":"--sk-surface","#ffffff":"--sk-surface",
    "#f8fafc":"--sk-surface-2","#f1f5f9":"--sk-surface-2","#eef2ff":"--sk-surface-2","#f4effb":"--sk-surface-2","#fffdf8":"--sk-surface-2","#fffaf0":"--sk-surface-2","#fff8ee":"--sk-surface-2","#f1fff7":"--sk-ok-soft",
    "#fff1f2":"--sk-bad-soft","#8b5cf61d":"--sk-brand-soft","#6366f1":"--sk-brand","#4f46e5":"--sk-brand","#a855f7":"--sk-brand-2"}
};
const HEX=/#[0-9a-fA-F]{3,8}\b|rgba\(255,\s*255,\s*255,\s*\.28\)/g;
function recolorCSS(css){
  return css.replace(/([^{}]+)\{([^{}]*)\}/g,(m,sel,body)=>{
    const onBrand=/background[^;]*(#6366f1|#4f46e5|#4338ca|#a855f7|gradient|--brand|--kosif-purple)/i.test(body);
    const out=body.replace(/([a-z-]+)\s*:\s*([^;]*)/gi,(d,prop,val)=>{
      const kind=/background/i.test(prop)?"bg":/border|outline/i.test(prop)?"border":prop.toLowerCase()==="color"?"color":null;if(!kind)return d;
      return prop+":"+val.replace(HEX,h=>{const k=h.toLowerCase().startsWith("rgba")?"--sk-line":(h.toLowerCase()==="#fff"||h.toLowerCase()==="#ffffff")&&kind==="color"?(onBrand?null:"--sk-ink"):RC[kind][h.toLowerCase()];return k?"var("+k+")":h});
    });
    return sel+"{"+out+"}";
  });
}
function recolorStudio(root){try{const st=root&&root.querySelector("style");if(st&&!st.dataset.skRecolored){st.textContent=recolorCSS(st.textContent);st.dataset.skRecolored="1"}}catch(e){console.error("SQC studio colours",e)}}
/* ---------- document analysis: a plain status in the documents tab, the server address only under «advanced» ---------- */
const GW_KEY="kosif:v5:document-gateway",GW_DEFAULT="https://kosif-audit-realtime.kosif199022.workers.dev";
function docAIHTML(){
  const url=localStorage.getItem(GW_KEY)||GW_DEFAULT;
  return '<div class="tbr-docai"><p><b>تحليل المستندات الذكي</b> — يُحفظ كل مستند ويُصنّف ويُربط بالأدلة على الجهاز. قراءة محتواه بالذكاء الاصطناعي تعمل حين يتصل خادم التحليل. <span class="sk-pill" data-docai-state>لم يُفحص</span></p>'+
    '<details><summary>ربط خادم التحليل (متقدم)</summary><div class="sk-actions"><label class="sk-field"><span>عنوان الخادم</span><input data-docai-url dir="ltr" value="'+window.SK.esc(url)+'"></label><button type="button" class="btn sm" data-docai-test>فحص الاتصال</button></div></details></div>';
}
async function docAITest(btn){
  const box=btn.closest(".tbr-docai"),pill=box&&box.querySelector("[data-docai-state]"),inp=box&&box.querySelector("[data-docai-url]");if(!pill||!inp)return;
  const url=inp.value.trim().replace(/\/+$/,"");if(url)localStorage.setItem(GW_KEY,url);else localStorage.removeItem(GW_KEY);
  pill.className="sk-pill";pill.textContent="يفحص…";
  try{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),6000),r=await fetch((url||GW_DEFAULT)+"/health",{signal:ac.signal,headers:{Accept:"application/json"}});clearTimeout(t);
    const j=r.ok?await r.json():null,ok=!!(j&&j.documentIntelligence&&j.documentIntelligence.configured);pill.className="sk-pill "+(ok?"good":"warn");pill.textContent=ok?"متصل":r.ok?"الخادم يعمل والمفتاح غير مهيأ":"غير متاح ("+r.status+")"}
  catch{pill.className="sk-pill warn";pill.textContent="غير متصل — المستندات تُحفظ على الجهاز"}
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-docai-test]");if(b)docAITest(b)});
/* the studio's pages are mounted by the engagement file (tb-review.js), each under the tab it belongs to */
function mountStudio(node,view){open("studio",node,view||"overview","auditdesk")}
/* the operational trial balance (sales, supplier batches, payments, credit) for the TB review */
window.SKosifAuditBridge=Object.freeze({buildTB,mountStudio,docAIHTML,syncStudio:()=>state.studio&&state.studio.api?syncStudio(state.studio):null,STUDIO_VIEWS:SCREENS.filter(x=>x[1]==="studio").map(x=>({id:x[0],view:x[2],label:x[3],sub:x[4]}))});
/* a studio page opened directly (search, deep link, old bookmark) opens the engagement file on the tab that holds it */
SCREENS.forEach(([id,key,view,title,sub,emoji,icon])=>window.SK.view(id,{title,sub,emoji,adv:true,icon:window.SK.icons[id]||icon,render(node){
  if(key!=="lab"&&sourceBlocked()){sourceUnavailable(node);return}
  if(key==="studio"&&window.SKosifTBReview&&SKosifTBReview.studio){node.innerHTML='<div class="sk-empty kx-wait">يفتح «ملف المراجعة»…</div>';setTimeout(()=>SKosifTBReview.studio(view),0);return}
  open(key,node,view,id)}}));
})();

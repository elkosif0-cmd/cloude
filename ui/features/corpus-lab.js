/* SQC — مختبر الشركات العالمية (شاشة «corpuslab»، صفحة في مجموعة المرجع).
   الشركات السبع والأربعون التي تحمل قوائم مالية في حزمة البحث (12,506 صفحة) عميلاً للمراجعة: قوائمها المنشورة ميزاناً
   بسنتين، يشغّل عليه SQC المراجعة كما يشغلها لأي عميل (الأهمية النسبية، مخاطر البنود، الطلبات، الأمور الرئيسية)، ثم تُقارن
   النتيجة بما كتبه مراجعها فعلاً في تقريره — كل أمر بصفحته في الحزمة، والأهمية النسبية بما أفصح عنه المراجع.
   خبرة القطاع (نسبة مراجعي القطاع الذين ذكروا كل موضوع) تُحسب مع استبعاد الشركة نفسها، فلا تُعلِّم الشركةُ ترتيبَها.
   وما يطلبه المراجعون أولاً: الإجراءات التي اعتمد عليها مراجعو الحزمة في أمورهم الرئيسية، والمستندات التي تُطلب لكل منها.
   المحركات: SKEngines.reports.corpusCompanies · SKEngines.audit.{corpusReplay,openingRequests,globalBenchmarks}. */
(()=>{
"use strict";
const {esc}=SK;
const E=()=>window.SKEngines||{},RP=()=>E().audit.corpusReplay,OR=()=>E().audit.openingRequests,GB=()=>E().audit.globalBenchmarks;
const nf=new Intl.NumberFormat("en",{maximumFractionDigits:1}),pc=v=>v==null?"—":Math.round(v*100)+"%";
let root=null,prior=true,q="",sector="",memo={};
const run=p=>memo[p]||(memo[p]=RP().replayAll({prior:p}));
const FOUND={selected:["وجده SQC","ok"],ranked:["ضمن المرشحين","warn"],missed:["لم يجده","bad"]};

function tiles(r,other){
  const t=(ic,l,v,sub)=>'<div class="skk4-t"><span class="chip">'+SK.icon(ic)+'</span><span class="tx"><span>'+l+'</span><b>'+v+'</b><small>'+sub+'</small></span></div>';
  const d=x=>{const v=Math.round((r[x]-other[x])*100);return v?(v>0?"+":"")+v+" نقطة "+(prior?"بخبرة القطاع":"بدونها"):"دون تغيير"};
  return '<div class="skk4 cl-k">'+
    t("reports","الشركات المراجَعة",r.companies,r.withKams+' تقريراً فيها أمور رئيسية · '+r.kamThemes+' موضوعاً')+
    t("auditreport","ما وجده SQC من أمورهم",pc(r.recall),'ضمن الأمور الثلاثة المختارة · '+d("recall"))+
    t("target","ضمن المرشحين",pc(r.rankedRecall),'من الأمور الستة المرتبة · '+d("rankedRecall"))+
    t("check","دقة الاختيار",pc(r.precision),'ما اختاره SQC وذكره المراجع · '+d("precision"))+'</div>';
}
function matCard(r){
  if(!r.materiality.length)return"";
  return '<section class="card"><div class="card-h"><div><h3>الأهمية النسبية: SQC مقابل ما أفصح عنه المراجع</h3><p>SQC يحسبها من الميزان وحده (5% من الربح قبل الضريبة أو 1% من الإيرادات أو الموجودات)؛ المراجعون يعدّلون الأساس (استبعاد البنود غير المتكررة، التدفق النقدي، EBIT).</p></div></div><div class="card-b">'+
    '<div class="cl-tw"><table class="sk-table" data-sk-plain><thead><tr><th>الشركة</th><th>SQC</th><th>المراجع</th><th>النسبة</th><th>الصفحة</th></tr></thead><tbody>'+
    r.materiality.map(m=>'<tr><td>'+esc(m.company)+'</td><td class="num">'+nf.format(m.ours)+'</td><td class="num">'+nf.format(m.disclosed)+'</td><td class="num"><span class="sksev '+(m.ratio>=0.75&&m.ratio<=1.33?"ok":"warn")+'">'+nf.format(m.ratio)+'×</span></td><td>ص '+m.page+'</td></tr>').join("")+
    '</tbody></table></div><p class="hint">بالملايين من عملة التقرير. ما بين 0.75× و1.33× يقع ضمن مدى الحكم المهني المعتاد لاختيار الأساس.</p></div></section>';
}
function missedCard(r){
  if(!r.missed.length)return"";
  const top=Math.max(...r.missed.map(m=>m.n));
  return '<section class="card"><div class="card-h"><div><h3>ما فات SQC أكثر من غيره</h3><p>موضوعات ذكرها المراجعون ولم تظهر في مرشحي SQC — غالباً لأنها لا تُقرأ من الأرقام وحدها (معاملات معقدة، استثمارات الشركة الأم، أنظمة المعلومات، تجاوز الإدارة للضوابط) فتحتاج حكم المراجع ومحاضر المجلس.</p></div></div><div class="card-b cl-bars">'+
    r.missed.map(m=>'<div class="cl-bar"><span>'+esc(m.ar)+'</span><i style="width:'+Math.round(m.n/top*100)+'%"></i><b>'+m.n+'</b></div>').join("")+'</div></section>';
}
function table(r){
  const G=GB(),secs=[...new Set(r.list.map(x=>x.sector))];
  const rows=r.list.filter(x=>(!sector||x.sector===sector)&&(!q||(x.company+" "+x.auditor).toLowerCase().includes(q.toLowerCase())));
  return '<section class="card"><div class="card-h"><div><h3>الشركات واحدة واحدة</h3><p>أمور المراجع كما وردت في تقريره (بصفحتها) ولون كل منها بما وصل إليه SQC، ثم ما اختاره SQC. «افتح كملف مراجعة» يحمّل الشركة في ملف المراجعة لتكمل الجولات والتقارير عليها.</p></div></div><div class="card-b">'+
    '<div class="cdx-bar"><input type="search" data-cl-q placeholder="ابحث باسم الشركة أو المراجع…" value="'+esc(q)+'"><select data-cl-sector aria-label="القطاع"><option value="">كل القطاعات</option>'+secs.map(s=>'<option value="'+s+'"'+(sector===s?" selected":"")+'>'+esc(G.SECTOR_AR[s])+'</option>').join("")+'</select></div>'+
    '<div class="cl-list">'+rows.map(x=>'<article class="cl-co"><div class="cl-co-h"><div><b dir="auto">'+esc(x.company)+'</b><small>'+esc(G.SECTOR_AR[x.sector])+' · '+esc(x.fy)+' · '+esc(x.auditor||"المراجع غير مذكور")+'</small></div>'+
      '<button type="button" class="btn sm" data-cl-open="'+esc(x.id)+'">'+SK.icon("tbreview")+' افتح كملف مراجعة</button></div>'+
      '<div class="cl-cols"><div><h4>ما ذكره المراجع</h4>'+(x.actual.length?x.actual.map(a=>'<div class="cl-m"><span class="sksev '+FOUND[a.found][1]+'">'+FOUND[a.found][0]+'</span><span>'+esc(a.ar)+'</span><small dir="ltr" title="'+esc(a.titles.join(" · "))+'">'+esc(a.titles[0])+'</small><span class="ab-pg">ص '+a.pages[0]+'</span></div>').join(""):'<p class="hint">لا أمور رئيسية في مقتطف الحزمة.</p>')+'</div>'+
      '<div><h4>ما اختاره SQC</h4>'+x.ours.filter(o=>o.selected).map(o=>'<div class="cl-m"><span class="sksev '+(o.matched?"ok":"info")+'">'+(o.matched?"ذكره المراجع":"إضافي")+'</span><span>'+esc(o.title)+'</span></div>').join("")+
      '<small class="hint">الأهمية النسبية: '+nf.format(x.materiality.ours)+' '+esc(x.unit)+' ('+esc(x.materiality.benchmark)+')'+(x.materiality.disclosed?' · المراجع: '+nf.format(x.materiality.disclosed):'')+' · '+x.requests+' طلب مستندات'+(x.structure.theirs?' · شكل التقرير: '+x.structure.covered+'/'+x.structure.theirs+' قسماً':'')+'</small></div></div></article>').join("")+'</div></div></section>';
}
function procCard(){
  const L=OR().procedureLeague().slice(0,10);
  return '<section class="card"><div class="card-h"><div><h3>ما يطلبه المراجعون أولاً</h3><p>الإجراءات التي وصفها مراجعو الحزمة في أمورهم الرئيسية، مرتبة بعدد الأمور — وما يُطلب من العميل لكل منها. يضيفها ملف المراجعة تلقائياً إلى طلبات الجولة الأولى بحسب أمور المنشأة المتوقعة.</p></div></div><div class="card-b cl-procs">'+
    L.map(p=>'<div class="cl-proc"><b>'+esc(p.ar)+'</b><small>'+p.matters+' أمراً في '+p.themes+' موضوعاً</small><ul>'+p.docs.map(d=>'<li>'+esc(d)+'</li>').join("")+'</ul></div>').join("")+'</div></section>';
}
function paint(){
  if(!root)return;
  if(!RP()||!OR()){root.innerHTML='<div class="sk-empty">محركات المختبر غير محمّلة.</div>';return}
  const r=run(prior),other=run(!prior);
  root.innerHTML='<div class="cl-shell"><section class="card cl-hero"><div><span class="eyebrow">GLOBAL REPLAY</span><h2>مختبر الشركات العالمية</h2><p>قوائم '+r.companies+' شركة من التقارير العالمية (12,506 صفحة) مدخلة كموازين مراجعة. يراجعها SQC كما يراجع أي عميل، ثم نقارن ما وصل إليه بما كتبه مراجعها الفعلي.</p></div>'+
    '<div class="sk-seg" role="group" aria-label="الترتيب"><button type="button" data-cl-prior="1" aria-pressed="'+prior+'">بخبرة القطاع</button><button type="button" data-cl-prior="0" aria-pressed="'+!prior+'">الأرقام وحدها</button></div></section>'+
    tiles(r,other)+'<p class="cl-note">'+SK.icon("reports")+' شكل التقرير: أقسام تقرير SQC المتكامل تغطي '+pc(r.structure)+' من الأقسام الموجودة في تقارير هذه الشركات نفسها، بترتيبها في الحزمة (الناقص غالباً ملاحق نموذج 10-K وتوقيعاته).</p>'+table(r)+'<div class="cl-grid">'+missedCard(r)+matCard(r)+'</div>'+procCard()+'</div>';
}
function render(el){
  root=el;paint();
  el.addEventListener("click",async e=>{
    const p=e.target.closest("[data-cl-prior]");if(p){prior=p.dataset.clPrior==="1";paint();return}
    const o=e.target.closest("[data-cl-open]");if(o&&window.SKosifTBReview&&SKosifTBReview.loadCorpus){await SKosifTBReview.loadCorpus(o.dataset.clOpen);return}
  });
  el.addEventListener("input",e=>{if(e.target.matches("[data-cl-q]")){q=e.target.value;const pos=e.target.selectionStart;paint();const i=root.querySelector("[data-cl-q]");if(i){i.focus();i.setSelectionRange(pos,pos)}}});
  el.addEventListener("change",e=>{if(e.target.matches("[data-cl-sector]")){sector=e.target.value;paint()}});
}
SK.view("corpuslab",{render});
})();

/* S.kosif — المرجع العالمي للمراجعة (شاشة «auditbench»، صفحة في مجموعة «المعايير والمدونة») + window.SKosifAuditBench.
   ما قرأناه في حزمة البحث العالمية (12,506 صفحة: التقارير السنوية ونماذج 10-K و20-F لـ49 مجموعة من 15 دولة)
   محوَّلاً إلى أدوات عمل للمراجع — لا أرشيفاً:
   • مكتبة الأمور الرئيسية للمراجعة كما كتبها المراجعون فعلاً (ISA 701 وPCAOB AS 3101) بالموضوع والقطاع والمعيار،
     مع النمط المشترك لسبب اعتبار الأمر رئيسياً وإجراءات معالجته، وكل أمر بصفحته في الحزمة.
   • الأهمية النسبية: فحص اختيارك (الأساس والنسبة والتنفيذية وحد الضآلة) مقابل ما أفصح عنه المراجعون
     (bp · Unilever · AstraZeneca · GSK · HSBC · Airbus · أرامكو السعودية).
   • الشركات ومراجعوها ومدة الارتباط، والمصادر الرسمية الثلاثون للقوائم وجودة المراجعة.
   كل ذلك استرشادي: القرار المهني للمراجع (ISA 320 / ISA 701)، والمصدر الأصلي هو المرجع.
   المحرك: SKEngines.audit.globalBenchmarks (مختبر في CI). */
(()=>{
"use strict";
const {esc}=SK;
const G=()=>SKEngines.audit.globalBenchmarks,M=()=>SKEngines.audit.materiality;
const TABS=[["kams","الأمور الرئيسية"],["mat","الأهمية النسبية"],["cos","المراجعون"],["src","المصادر"]];
const CC={US:"الولايات المتحدة",UK:"المملكة المتحدة",CH:"سويسرا",DE:"ألمانيا",FR:"فرنسا",NL:"هولندا",JP:"اليابان",KR:"كوريا",TW:"تايوان",CN:"الصين",IN:"الهند",SA:"السعودية",AE:"الإمارات",CA:"كندا",AU:"أستراليا"};
const nf=new Intl.NumberFormat("en",{maximumFractionDigits:2}),cf=new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:2});
const pct=v=>v==null?"—":nf.format(Math.round(v*1000)/10)+"%";
const STD={PCAOB:"CAM · PCAOB",ISA:"KAM · ISA"};
const ST={within:["ضمن الممارسة","ok"],above:["أعلى من الممارسة","warn"],below:["أدنى من الممارسة","warn"],"no-precedent":["لا سابقة مفصح عنها","info"]};
let root=null,tab="kams",theme="",sector="",std="",q="",mat={benchmark:"pbz",amount:"",rate:5,perf:75,triv:5};

const page=p=>'<span class="ab-pg" title="صفحة في ملف الحزمة">ص '+nf.format(p)+'</span>';
function tiles(){
  const s=G().summary();
  const t=(ic,l,v,sub)=>'<div class="skk4-t"><span class="chip">'+SK.icon(ic)+'</span><span class="tx"><span>'+l+'</span><b>'+v+'</b><small>'+sub+'</small></span></div>';
  return '<div class="skk4 ab-k">'+
    t("reports","التقارير المقروءة",s.reports,nf.format(s.pages)+' صفحة · '+s.countries+' دولة')+
    t("auditreport","الأمور الرئيسية",s.kams,s.isa+' وفق ISA · '+s.pcaob+' وفق PCAOB')+
    t("calc","إفصاحات الأهمية النسبية",s.materiality,'مبالغ وأسس ونسب فعلية')+
    t("governance","المصادر الرسمية",s.sources,'إيداعات وجودة مراجعة ومعايير')+'</div>';
}

/* ---------- tab 1: the KAM library ---------- */
function kamsTab(){
  const stats=G().themeStats(),rows=G().kamLibrary({theme,sector,standard:std,q}),th=theme&&G().THEMES[theme];
  const secs=[...new Set(G().REPORTS.map(r=>r.sector))];
  return '<section class="card"><div class="card-h"><div><h3>أكثر الموضوعات تكراراً في تقارير المراجعين</h3><p>اضغط موضوعاً لتصفية المكتبة ورؤية النمط المشترك في صياغته ومعالجته.</p></div></div><div class="card-b">'+
      '<div class="ab-themes">'+stats.map(s=>'<button type="button" class="ab-th" data-ab-theme="'+s.theme+'" aria-pressed="'+(theme===s.theme)+'"><b>'+esc(s.ar)+'</b><small>'+s.count+' أمراً · '+s.companies+' شركة</small><i style="width:'+Math.round(s.count/stats[0].count*100)+'%"></i></button>').join("")+'</div>'+
    '</div></section>'+
    (th?'<section class="card ab-pattern"><div class="card-h"><div><h3>'+esc(th.ar)+' <small class="ab-en" dir="ltr">'+esc(th.en)+'</small></h3><p>النمط المشترك بين التقارير — استرشد به عند صياغة الأمر في تقريرك (ISA 701.13).</p></div><button type="button" class="btn sm" data-ab-theme="">إلغاء التصفية</button></div><div class="card-b ab-pat-g">'+
      '<div><h4>لماذا يُعد أمراً رئيسياً</h4><p>'+esc(th.why)+'</p></div><div><h4>كيف عالجه المراجعون</h4><ul>'+th.procedures.map(p=>'<li>'+esc(p)+'</li>').join("")+'</ul></div></div></section>':'')+
    '<section class="card"><div class="card-h"><div><h3>المكتبة</h3><p>'+rows.length+' من '+G().KAMS.length+' أمراً — العنوان كما ورد في تقرير المراجع، وبجواره صفحته في الحزمة.</p></div></div><div class="card-b">'+
      '<div class="cdx-bar"><input type="search" data-ab-q placeholder="ابحث: الزكاة، الشهرة، rebates، ECL، اسم الشركة أو المراجع…" value="'+esc(q)+'">'+
      '<select data-ab-sector aria-label="القطاع"><option value="">كل القطاعات</option>'+secs.map(s=>'<option value="'+s+'"'+(sector===s?' selected':'')+'>'+esc(G().SECTOR_AR[s])+'</option>').join("")+'</select>'+
      '<div class="sk-seg">'+[["","الكل"],["ISA","ISA"],["PCAOB","PCAOB"]].map(([k,l])=>'<button type="button" data-ab-std="'+k+'" aria-pressed="'+(std===k)+'">'+l+'</button>').join("")+'</div></div>'+
      (rows.length?'<div class="ab-list">'+rows.map(k=>'<article class="ab-kam"><div class="ab-kam-h"><b dir="ltr">'+esc(k.title)+'</b>'+page(k.page)+'</div>'+
        '<div class="ab-meta"><span class="ab-co">'+esc(k.company)+' · '+esc(k.fy)+'</span><span>'+esc(k.auditor||"المراجع غير مذكور في المقتطف")+'</span><span class="sksev info">'+esc(k.themeAr)+'</span><span class="ab-tag">'+esc(G().SECTOR_AR[k.sector])+'</span><span class="ab-tag">'+STD[k.standard]+'</span></div></article>').join("")+'</div>':'<p class="empty">لا نتائج لهذه التصفية.</p>')+
    '</div></section>';
}

/* ---------- tab 2: materiality ---------- */
function matResults(){
  const base=Math.abs(Number(mat.amount)||0);
  const calc=base?M().calculateMateriality({benchmark:mat.benchmark==="pbz"?"profit-before-tax":mat.benchmark,benchmarkAmount:base,benchmarkRate:mat.rate/100,performanceRate:mat.perf/100,trivialRate:mat.triv/100}):null;
  const chk=G().checkMateriality({benchmark:mat.benchmark,rate:mat.rate/100,performanceRate:mat.perf/100,trivialRate:mat.triv/100});
  return (calc?'<div class="ab-res"><div><span>الأهمية العامة</span><b>'+nf.format(calc.overall)+'</b></div><div><span>التنفيذية</span><b>'+nf.format(calc.performance)+'</b></div><div><span>حد الضآلة</span><b>'+nf.format(calc.trivial)+'</b></div></div>':'')+
    '<div class="ab-chk">'+chk.map(c=>'<div class="ab-chk-r"><span class="sksev '+ST[c.status][1]+'">'+ST[c.status][0]+'</span><div><b>'+esc(c.label)+': '+pct(c.value)+'</b><small>المفصح عنه: '+esc(c.observed)+'</small><small>'+esc(c.note)+'</small></div></div>').join("")+'</div>';
}
function matTab(){
  const p=G().materialityPractice();
  const num=(k,l,v,step)=>'<label class="sk-field"><span>'+l+'</span><input type="number" inputmode="decimal" min="0" step="'+step+'" data-ab-m="'+k+'" value="'+esc(v)+'"></label>';
  const rng=(r,l)=>'<div class="ab-rng"><span>'+l+'</span><b>'+(r?pct(r.min)+' – '+pct(r.max):'—')+'</b><small>'+(r?r.n+' تقارير':'')+'</small></div>';
  return '<section class="card"><div class="card-h"><div><h3>افحص اختيارك للأهمية النسبية</h3><p>يقارن اختيارك بما أفصح عنه مراجعو الشركات العالمية فعلاً. النسب المرجعية مشتقة من الإفصاحات لا مفترضة؛ والقرار لك (ISA 320).</p></div></div><div class="card-b">'+
      '<div class="ab-mform"><label class="sk-field"><span>أساس القياس</span><select data-ab-m="benchmark">'+[["pbz","الربح قبل الزكاة والضريبة"],["revenue","الإيرادات"],["assets","مجموع الموجودات"]].map(([k,l])=>'<option value="'+k+'"'+(mat.benchmark===k?' selected':'')+'>'+l+'</option>').join("")+'</select></label>'+
      num("amount","مبلغ الأساس (ريال) — اختياري",mat.amount,"any")+num("rate","النسبة %",mat.rate,"0.1")+num("perf","الأهمية التنفيذية % من العامة",mat.perf,"1")+num("triv","حد الضآلة % من العامة",mat.triv,"0.5")+'</div>'+
      '<div data-ab-mres aria-live="polite">'+matResults()+'</div>'+
    '</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>الممارسة المفصح عنها</h3><p>النطاقات محسوبة من الحالات أدناه.</p></div></div><div class="card-b"><div class="ab-rngs">'+
      rng(p.profit,'نسبة الأهمية من الربح')+rng(p.performance,'الأهمية التنفيذية')+rng(p.threshold,'حد الإبلاغ للجنة المراجعة')+rng(p.parentAssets,'الموجودات (شركات قابضة)')+'</div>'+
      '<div class="sk-table-wrap"><table class="sk-table ab-t" data-sk-plain><thead><tr><th>الشركة</th><th>المراجع</th><th>الأهمية العامة</th><th>الأساس</th><th>النسبة</th><th>التنفيذية</th><th>حد الإبلاغ</th><th>المصدر</th></tr></thead><tbody>'+
      p.cases.map(c=>'<tr><td><b>'+esc(c.company)+'</b><small class="ab-sub">'+esc(c.fy)+'</small></td><td>'+esc(c.auditor)+'</td><td class="num">'+esc(c.currency)+' '+cf.format(c.overall)+(c.prior?'<small class="ab-sub">السابقة '+cf.format(c.prior)+'</small>':'')+'</td><td dir="ltr" class="ab-basis">'+esc(c.basis)+'</td><td class="num">'+pct(c.pct)+'</td><td class="num">'+pct(c.performancePct)+'</td><td class="num">'+(c.threshold?esc(c.currency)+' '+cf.format(c.threshold):'—')+'</td><td>'+page(c.page)+'</td></tr>').join("")+
      '</tbody></table></div></div></section>';
}

/* ---------- tab 3: companies and auditors ---------- */
function cosTab(){
  const s=G().summary(),yr=new Date().getFullYear(),count=id=>G().KAMS.filter(k=>k.report===id).length;
  const rows=G().REPORTS.slice().sort((a,b)=>a.country.localeCompare(b.country)||a.company.localeCompare(b.company));
  const long=G().REPORTS.filter(r=>r.since).sort((a,b)=>a.since-b.since).filter((r,i,xs)=>xs.findIndex(x=>x.company===r.company)===i).slice(0,6);
  return '<div class="ab-2"><section class="card"><div class="card-h"><div><h3>توزيع المراجعين</h3><p>عدد التقارير لكل شبكة مراجعة في الحزمة.</p></div></div><div class="card-b">'+
      SKCharts.donut(s.auditors.map(([f,n])=>({label:f,value:n})),{center:s.reports,sub:"تقريراً"})+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>أطول ارتباطات المراجعة</h3><p>كما صرّح بها المراجع في تقريره.</p></div></div><div class="card-b">'+
      SKCharts.hbars({rows:long.map(r=>({label:r.company,sub:r.auditor+' منذ '+r.since,value:yr-r.since})),fmt:v=>v+' سنة',valueLabel:"سنوات الارتباط"})+'</div></section></div>'+
    '<section class="card"><div class="card-h"><div><h3>التقارير في الحزمة</h3><p>'+rows.length+' تقريراً — الإطار المحاسبي ومعيار المراجعة ونطاق الصفحات في ملف الحزمة.</p></div></div><div class="card-b"><div class="sk-table-wrap"><table class="sk-table ab-t"><thead><tr><th>الشركة</th><th>الدولة</th><th>القطاع</th><th>الإطار</th><th>المعيار</th><th>المراجع</th><th>الأمور الرئيسية</th><th>الصفحات</th></tr></thead><tbody>'+
      rows.map(r=>'<tr><td><b>'+esc(r.company)+'</b><small class="ab-sub">'+esc(r.kind)+' · '+esc(r.fy)+'</small></td><td>'+esc(CC[r.country]||r.country)+'</td><td>'+esc(G().SECTOR_AR[r.sector])+'</td><td dir="ltr">'+esc(r.framework)+'</td><td>'+r.standard+'</td><td>'+esc(r.auditor||"—")+(r.since?'<small class="ab-sub">منذ '+r.since+'</small>':'')+'</td><td class="num">'+(count(r.id)||'—')+'</td><td class="num">'+nf.format(r.pages[0])+'–'+nf.format(r.pages[1])+'</td></tr>').join("")+
    '</tbody></table></div></div></section>';
}

/* ---------- tab 4: the 30 official sources ---------- */
function srcTab(){
  const K={filings:"إيداعات الشركات المدرجة",["audit-quality"]:"جودة المراجعة والتفتيش",standards:"المعايير والسلوك المهني"};
  return Object.entries(K).map(([k,l])=>{const xs=G().SOURCES.filter(s=>s.kind===k);
    return '<section class="card"><div class="card-h"><div><h3>'+l+'</h3><p>'+xs.length+' مصدراً رسمياً من فهرس الحزمة.</p></div></div><div class="card-b"><div class="cdx-srcs ab-srcs">'+
      xs.map(s=>'<a class="cdx-src" href="'+esc(s.url)+'" target="_blank" rel="noopener"><b>'+esc(s.name)+'</b><small dir="ltr">'+esc(s.covers)+'</small></a>').join("")+'</div></div></section>'}).join("");
}

function paint(){
  if(!root)return;
  root.innerHTML='<div class="ab">'+tiles()+'<div class="sk-seg ab-tabs" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-ab-tab="'+k+'" aria-selected="'+(tab===k)+'" aria-pressed="'+(tab===k)+'">'+l+'</button>').join("")+'</div>'+
    (tab==="mat"?matTab():tab==="cos"?cosTab():tab==="src"?srcTab():kamsTab())+
    '<p class="hint ab-note">المصدر: '+esc(G().BUNDLE.file)+' — كل عنوان ورقم منقول من صفحته المذكورة. المحتوى استرشادي؛ القرار المهني للمراجع.</p></div>';
}
function paintMat(){const r=root&&root.querySelector("[data-ab-mres]");if(r)r.innerHTML=matResults()}
function bind(node){
  node.addEventListener("click",e=>{
    const t=e.target.closest("[data-ab-tab]");if(t){tab=t.dataset.abTab;paint();return}
    const h=e.target.closest("[data-ab-theme]");if(h){theme=theme===h.dataset.abTheme?"":h.dataset.abTheme;paint();const p=root.querySelector(".ab-pattern");if(p&&p.scrollIntoView)p.scrollIntoView({block:"nearest"});return}
    const s=e.target.closest("[data-ab-std]");if(s){std=s.dataset.abStd;paint();return}
  });
  node.addEventListener("change",e=>{
    if(e.target.matches("[data-ab-sector]")){sector=e.target.value;paint();return}
    if(e.target.matches("select[data-ab-m]")){mat.benchmark=e.target.value;mat.rate=({pbz:5,revenue:1,assets:0.5})[mat.benchmark];const r=root.querySelector('[data-ab-m="rate"]');if(r)r.value=mat.rate;paintMat()}
  });
  node.addEventListener("input",e=>{if(e.target.matches("input[data-ab-m]")){mat[e.target.dataset.abM]=e.target.value;paintMat();return}
    if(e.target.matches("[data-ab-q]")){q=e.target.value;const pos=e.target.selectionStart;paint();const i=root.querySelector("[data-ab-q]");i.focus();try{i.setSelectionRange(pos,pos)}catch{}}});
}

/* ---------- shared: precedents for the KAMs the engagement file proposes ---------- */
function precedentsHTML(lineKeys,activity){
  const g=G(),sec=g.sectorFromActivity(activity||""),seen=new Set();
  const items=lineKeys.flatMap(k=>g.precedentsFor(k,{sector:sec,limit:3})).filter(p=>!seen.has(p.theme)&&seen.add(p.theme));
  if(!items.length)return "";
  return '<section class="card ab-prec"><div class="card-h"><div><h3>سوابق عالمية للأمور الرئيسية</h3><p>كيف كتب مراجعو الشركات العالمية أموراً مشابهة'+(sec?' — الأقرب من قطاع '+esc(g.SECTOR_AR[sec])+' أولاً':'')+'. استرشد بها، ولا تنسخها.</p></div><button type="button" class="btn sm" data-go="auditbench">المرجع العالمي</button></div><div class="card-b">'+
    items.map(p=>'<div class="ab-prec-i"><h4>'+esc(p.ar)+'</h4><p>'+esc(p.why)+'</p><ul class="ab-ex">'+p.examples.map(k=>'<li><b dir="ltr">'+esc(k.title)+'</b><small>'+esc(k.company)+' · '+esc(k.fy)+' · '+esc(k.auditor||"")+' · ص '+nf.format(k.page)+'</small></li>').join("")+'</ul></div>').join("")+'</div></section>';
}
/* a one-line comparison of the engagement's materiality with disclosed practice */
function materialityNote(m){
  if(!m||!m.overall)return "";
  const rate=m.base>0?m.overall/m.base:m.rate,c=G().checkMateriality({benchmark:m.benchmark,rate,performanceRate:m.performance/m.overall,trivialRate:m.trivial/m.overall});
  const off=c.filter(x=>x.status==="above"||x.status==="below");
  return '<div class="ab-mn '+(off.length?"warn":"ok")+'"><span class="sksev '+(off.length?"warn":"ok")+'">'+(off.length?"راجِع":"ضمن الممارسة العالمية")+'</span><span>'+
    c.map(x=>esc(x.label)+' '+pct(x.value)+' ('+esc(ST[x.status][0])+')').join(" · ")+'</span><button type="button" class="btn sm" data-go="auditbench">المقارنة</button></div>';
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-go=\"auditbench\"]");if(!b)return;tab=b.closest(".ab-mn")?"mat":"kams";if(window.SKosifCore)SKosifCore.go("auditbench")});

window.SKosifAuditBench=Object.freeze({precedentsHTML,materialityNote});
SK.view("auditbench",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
})();

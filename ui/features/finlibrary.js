/* S.kosif — مركز التقارير المالية العالمية (شاشة «finlibrary»).
   محتوى فهرس حزمة البحث على Google Drive («global_financial_and_audit_research_bundle_extended_verified»
   كما يخدمه kosif-stable على /research/financial-reports): أنظمة الإفصاح الرسمية لأسواق العالم،
   تقارير الشفافية لشركات المراجعة الكبرى، ونتائج فحوص جهات الرقابة على جودة المراجعة، والتقارير
   السنوية المفهرسة فيها؛ مضافاً إليها مصادر السعودية ومصر والتقارير التي بُني عليها تصميم تقارير KOSIF.
   وتقارن تقرير المراجعة الحالي (من شاشة مراجعة الميزان) بعناصر التقارير السنوية العالمية، وتعرض
   موضوعات فحوص الجودة المتكررة وما يقابلها من ضوابط في التطبيق. */
(()=>{
"use strict";
const {esc,load}=SK;
const L=()=>SKEngines.reports.researchLibrary;
let root=null,kind="all",q="";
const nq=s=>String(s||"").toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي");

function currentPack(){
  const d=load("skosif_tbreview_v1",null);if(!d||!d.tbText)return null;
  try{
    const tb=SKEngines.reports.tbImport.parseTrialBalance(d.tbText),fs=SKEngines.reports.statements.buildStatements(tb,d.overrides||{});
    const f=d.session&&d.session.final;
    return {company:(d.ctx&&d.ctx.company)||"المراجعة الحالية",flags:{highlights:true,mdna:true,statements:true,notes:true,ratios:true,opinion:true,kams:true,cashFlow:!!fs.cf,comparatives:fs.hasPrior,managementLetter:!!(f&&f.letter&&f.letter.length)}};
  }catch{return null}
}
function paint(){
  if(!root)return;
  const lib=L(),S=lib.SOURCES,K=lib.KIND_AR,pack=currentPack(),b=lib.benchmarkReport(pack?pack.flags:{});
  const count=k=>S.filter(s=>s.kind===k).length;
  const hits=S.filter(s=>(kind==="all"||s.kind===kind)&&(!q||nq(s.name+" "+s.region).includes(nq(q))));
  const tile=(k,ic)=>'<button type="button" class="skk4-t" data-kind="'+k+'" aria-pressed="'+(kind===k)+'"><span class="chip">'+SK.icon(ic)+'</span><span class="tx"><span>'+esc(K[k])+'</span><b>'+count(k)+'</b><small>'+(k==="filings"?"هيئات الأسواق والسجلات":k==="transparency"?"الشركات الأربع الكبرى":k==="oversight"?"PCAOB · FRC · IFIAR":"IAASB · IESBA · SOCPA · FRA")+'</small></span></button>';
  root.innerHTML='<div class="flb">'+
    '<section class="tbr-hero flb-hero"><div class="tx"><span class="eyebrow">فهرس حزمة البحث المالي والمراجعة (Google Drive)</span><h2>مركز التقارير المالية العالمية</h2><p>مصادر رسمية للتقارير المالية المنشورة حول العالم، وتقارير جودة المراجعة، والتقارير السنوية المرجعية التي بُني عليها تقرير KOSIF.</p></div></section>'+
    '<div class="skk4">'+tile("filings","reports")+tile("transparency","check")+tile("oversight","governance")+tile("standards","codex")+'</div>'+
    '<section class="card"><div class="card-h"><div><h3>تقارير سنوية مرجعية</h3><p>ما تعلّمناه من كل تقرير وأين طبّقناه.</p></div></div><div class="card-b flb-reps">'+
      lib.REFERENCE_REPORTS.map(r=>'<article class="flb-rep"><header><b>'+esc(r.company)+'</b><span class="sksev info">'+esc(r.year)+'</span></header>'+(r.highlight?'<strong>'+esc(r.highlight)+'</strong>':'')+'<small>'+esc(r.framework)+' · '+esc(r.evidence)+'</small><ul>'+r.learn.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+(r.origin==="bundle"?'<i class="flb-tag">من حزمة Drive</i>':'')+'</article>').join("")+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>'+(pack?'تقرير «'+esc(pack.company)+'» مقارنة بالتقارير العالمية':'عناصر التقرير السنوي العالمي')+'</h3><p>'+(pack?'يغطي '+b.covered+' من '+b.total+' عنصراً.':'افتح مراجعة ميزان لتُقارن تقريرها بهذه العناصر.')+'</p></div>'+(pack?'':'<button type="button" class="btn sm primary" data-go="tbreview">مراجعة ميزان</button>')+'</div><div class="card-b tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>العنصر</th><th>يظهر في</th><th>في تقرير KOSIF</th></tr></thead><tbody>'+
      b.rows.map(x=>'<tr><td>'+esc(x.ar)+'</td><td class="muted">'+esc(x.seenIn)+'</td><td>'+(pack?'<span class="sksev '+(x.has?"ok":"warn")+'">'+(x.has?"موجود":"غير متاح بعد")+'</span>':'—')+'</td></tr>').join("")+'</tbody></table></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>دروس فحوص جودة المراجعة</h3><p>موضوعات تتكرر في نتائج فحوص IFIAR وPCAOB وFRC، والضابط الذي يطبقه KOSIF لكل منها.</p></div></div><div class="card-b tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>الموضوع</th><th>المعيار</th><th>الضابط في التطبيق</th></tr></thead><tbody>'+
      lib.AUDIT_QUALITY.map(x=>'<tr><td><b>'+esc(x.theme)+'</b></td><td class="mono">'+esc(x.standard)+'</td><td>'+esc(x.safeguard)+'</td></tr>').join("")+'</tbody></table></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>دليل المصادر الرسمية</h3><p>'+hits.length+' من '+S.length+' مصدراً — '+S.filter(s=>s.origin==="bundle").length+' من فهرس الحزمة.</p></div></div><div class="card-b">'+
      '<div class="cdx-bar"><input type="search" data-flb-q placeholder="ابحث باسم المصدر أو الدولة…" value="'+esc(q)+'"><div class="sk-seg">'+[["all","الكل"],...Object.entries(K)].map(([k,l])=>'<button type="button" data-kind="'+k+'" aria-pressed="'+(kind===k)+'">'+esc(l)+'</button>').join("")+'</div></div>'+
      '<div class="cdx-srcs flb-srcs">'+hits.map(s=>'<a class="cdx-src" href="'+esc(s.url)+'" target="_blank" rel="noopener"><b>'+esc(s.name)+'</b><small>'+esc(s.region)+' · '+esc(K[s.kind])+(s.origin==="bundle"?' · من الحزمة':'')+'</small></a>').join("")+'</div></div></section>'+
  '</div>';
}
function bind(node){
  node.addEventListener("click",e=>{
    const k=e.target.closest("[data-kind]");if(k){kind=kind===k.dataset.kind&&k.classList.contains("skk4-t")?"all":k.dataset.kind;paint();return}
    const g=e.target.closest("[data-go]");if(g){SKosifCore.go(g.dataset.go)}
  });
  node.addEventListener("input",e=>{if(e.target.matches("[data-flb-q]")){q=e.target.value;const pos=e.target.selectionStart;paint();const i=root.querySelector("[data-flb-q]");i.focus();try{i.setSelectionRange(pos,pos)}catch{}}});
}
SK.view("finlibrary",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
})();

/* SQC — المقارنة بالشركات العالمية (شاشة «benchmarks» في الأدوات المساعدة للمحاسب).
   نسب الشركة النشطة من دفاترها (الدخل والمركز المالي للفترة النشطة) مقابل 35 مجموعة غير مالية نُقلت قوائمها الأولية
   من حزمة الأبحاث بصفحاتها: الربيع الأدنى والوسيط والأعلى، ومرتبة الشركة، وأقرب ثلاث شركات، وحين تقع النسبة في
   الربع الأضعف: ماذا يفحص المحاسب أولاً وأي أداة مساعدة تفحصه. المقارنة سياق وليست هدفاً.
   المصدر: SKosifTBReview.booksTB (نفس مسار ميزان الدفاتر في ملف المراجعة) — قراءة فقط، لا يُنشئ دليلاً ولا قيداً.
   المحركات: SKEngines.reports.corpusBenchmarks · tbImport · statements. */
(()=>{
"use strict";
const {esc,load,save}=SK;
const B=()=>SKEngines.reports.corpusBenchmarks,PREF="sqc_bench_v1";
let root=null,state=null,sector=(load(PREF,{})||{}).sector||"";
const n1=v=>new Intl.NumberFormat("en",{maximumFractionDigits:1}).format(v),n2=v=>new Intl.NumberFormat("en",{maximumFractionDigits:2}).format(v);
const fmt=(v,u)=>v==null?"—":u==="%"?n1(v)+"٪":u==="days"?Math.round(v)+" يوماً":n2(v)+"×";
const BAND={top:["الربع الأفضل","ok"],upper:["فوق الوسيط","info"],lower:["دون الوسيط","warn"],bottom:["الربع الأضعف","bad"],"n/a":["—",""]};
const BAND_NEUTRAL={top:"الربع الأعلى",upper:"فوق الوسيط",lower:"دون الوسيط",bottom:"الربع الأدنى","n/a":"—"};

/* ---------- data: the active company's statements from its books ---------- */
async function loadState(){
  let fs=null,src=null;
  try{const b=window.SKosifTBReview&&await SKosifTBReview.booksTB();
    if(b){const tb=SKEngines.reports.tbImport.parseTrialBalance(b.text);if(tb.ok!==false){fs=SKEngines.reports.statements.buildStatements(tb);src=b}}}
  catch(e){SK.errors&&SK.errors.report(e,"benchmarks");fs=null}
  if(fs&&!(fs.keys&&fs.keys.revenue&&fs.keys.revenue.current>0))fs=null; /* ratios on revenue mean nothing without revenue */
  /* the corpus is full years: the period counts only its elapsed days (a year to date is not a full year) */
  let days=365;const c=src&&src.ctx||{};
  if(c.periodStart){const a=Date.parse(c.periodStart+"T00:00:00Z"),t=new Date().toISOString().slice(0,10),e=Date.parse(((c.periodEnd&&c.periodEnd<t)?c.periodEnd:t)+"T00:00:00Z");
    if(a&&e&&e>=a)days=Math.min(366,Math.round((e-a)/864e5)+1)}
  state={fs,src,days};return state;
}

/* ---------- the range bar: the corpus from min to max, the middle half shaded, the median and the company ---------- */
function bar(r){
  if(r.min==null||r.max==null)return"";
  const lo=Math.min(r.min,r.you??r.min),hi=Math.max(r.max,r.you??r.max),span=hi-lo||1,x=v=>Math.max(0,Math.min(100,(v-lo)/span*100));
  /* RTL: the bar reads right to left like the page, low values on the right */
  const at=v=>x(v).toFixed(1)+"%";
  return '<div class="bm-bar" role="img" aria-label="'+esc(r.ar)+': الشركة '+esc(fmt(r.you,r.unit))+'، الوسيط '+esc(fmt(r.median,r.unit))+'">'+
    '<span class="bm-iqr" style="right:'+(x(r.p25)).toFixed(1)+'%;width:'+Math.max(1,x(r.p75)-x(r.p25)).toFixed(1)+'%"></span>'+
    '<span class="bm-med" style="right:'+at(r.median)+'"></span>'+(r.you!=null?'<span class="bm-you '+(BAND[r.band]||["",""])[1]+'" style="right:'+at(r.you)+'"></span>':'')+'</div>';
}
function bandChip(r){
  if(r.band==="n/a")return'<span class="muted">—</span>';
  if(r.higherIsBetter===null)return'<span class="sksev info">'+BAND_NEUTRAL[r.band]+'</span>';
  const [t,c]=BAND[r.band];return'<span class="sksev '+c+'">'+t+'</span>';
}

function paint(){
  if(!root)return;
  if(!state){root.innerHTML='<div class="sk-empty">يقرأ دفاتر الشركة…</div>';return}
  const E=B(),rows=E.benchmark(state.fs,{sector,periodDays:state.days}),sum=E.summary(rows),secs=E.sectors(3),n=E.corpusPeers(sector).length;
  const ctx=state.src&&state.src.ctx||{};
  const k=(l,v,s)=>'<div class="sk-kpi"><span>'+l+'</span><b>'+v+'</b>'+(s?'<small>'+s+'</small>':'')+'</div>';
  const head='<section class="card"><div class="card-h"><div><h3>المقارنة بالشركات العالمية</h3><p>نسب '+(ctx.company?'«'+esc(ctx.company)+'»':'الشركة')+(ctx.period?' للفترة '+esc(ctx.period):'')+
    ' من دفاترها'+(state.fs&&state.days<365?' ('+state.days+' يوماً منقضية: العوائد محوّلة إلى سنة، والأيام محسوبة على طول الفترة)':'')+'، مقابل '+n+' مجموعة غير مالية من حزمة الأبحاث بقوائمها المنشورة وصفحاتها. المقارنة سياق وليست هدفاً: الحجم ونموذج الأعمال والإطار المحاسبي والسنة تختلف.</p></div>'+
    '<label class="bm-sec"><span>المقارنة مع</span><select data-bm-sector aria-label="قطاع المقارنة"><option value="">كل الشركات غير المالية ('+E.corpusPeers("").length+')</option>'+
    secs.map(s=>'<option value="'+s.id+'"'+(s.id===sector?' selected':'')+'>'+esc(s.ar)+' ('+s.companies+')</option>').join("")+'</select></label></div>'+
    (state.fs?'<div class="card-b sk-kpis">'+k("نسب قورنت",sum.compared+" من "+rows.length)+k("في الربع الأفضل",sum.strong.length,sum.strong.slice(0,2).join("، "))+k("في الربع الأضعف",sum.weak.length,sum.weak.slice(0,2).join("، "))+k("المصدر",esc(state.src.source||"الدفاتر"),state.src.rows+" حساباً")+'</div>'
      :'<div class="card-b"><div class="sk-note warn">لا توجد قيود بإيرادات للفترة النشطة في «الدفاتر المحاسبية»، فتظهر أرقام الشركات العالمية وحدها. سجّل القيود أو استوردها ثم عد إلى هذه الشاشة. <button type="button" class="btn sm" data-bm-go="ledger">فتح الدفاتر المحاسبية</button></div></div>')+'</section>';
  const table='<section class="card"><div class="card-h"><div><h3>النسب</h3><p>الشريط: من أدنى قيمة إلى أعلاها في الشركات المقارنة؛ المظلل هو النصف الأوسط (الربيع الأدنى إلى الأعلى)، والخط هو الوسيط، والنقطة هي الشركة.</p></div></div>'+
    '<div class="card-b bm-scroll"><table class="tbl bm-t"><thead><tr><th>النسبة</th><th>الشركة</th><th>الربيع الأدنى</th><th>الوسيط</th><th>الربيع الأعلى</th><th class="bm-bar-h">الموقع</th><th>التقدير</th><th>الأقرب إليها</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td><b>'+esc(r.ar)+'</b><small class="muted bm-f">'+esc(r.formula)+' · '+r.n+' شركة</small></td><td class="num"><b>'+fmt(r.you,r.unit)+'</b>'+(r.note?'<small class="muted bm-f">'+esc(r.note)+'</small>':'')+'</td><td class="num">'+fmt(r.p25,r.unit)+'</td><td class="num">'+fmt(r.median,r.unit)+'</td><td class="num">'+fmt(r.p75,r.unit)+'</td>'+
      '<td>'+bar(r)+'</td><td>'+bandChip(r)+(r.percentile!=null?'<small class="muted bm-f">المئين '+r.percentile+'</small>':'')+'</td>'+
      '<td class="bm-close">'+(r.closest.length?r.closest.map(c=>esc(c.company)+' <span class="muted">'+fmt(c.value,r.unit)+' · ص '+c.page+'</span>').join("<br>"):'<span class="muted">—</span>')+'</td></tr>').join("")+
    '</tbody></table></div></section>';
  const weak=rows.filter(r=>r.check);
  const checks=state.fs?'<section class="card"><div class="card-h"><div><h3>ماذا أفحص أولاً</h3><p>النسب التي تقع في الربع الأضعف من الشركات المقارنة، وأداة المساعدة التي تفحص سببها.</p></div></div><div class="card-b sk-stack">'+
    (weak.length?weak.map(r=>'<div class="bm-check"><div><b>'+esc(r.ar)+': '+fmt(r.you,r.unit)+'</b> <span class="muted">(الوسيط '+fmt(r.median,r.unit)+')</span><p>'+esc(r.check.ar)+'</p></div>'+
      (SK.caps.get(r.check.screen)&&SK.perm.can(r.check.screen)?'<button type="button" class="btn sm" data-bm-go="'+esc(r.check.screen)+'">'+esc(r.check.screenAr)+'</button>':'')+'</div>').join("")
      :'<div class="sk-note ok">لا تقع أي نسبة في الربع الأضعف مقارنة بهذه المجموعة.</div>')+'</div></section>':'';
  root.innerHTML='<div class="bm-shell">'+head+checks+table+'<p class="muted bm-src">المصدر: global_financial_and_audit_research_bundle_extended_verified.pdf — قائمة الدخل والمركز المالي لكل شركة (رقم الصفحة بجوار كل شركة). البنوك وشركات التأمين مستبعدة لاختلاف معنى الإيرادات والذمم لديها، ونسب النقد والإنفاق الرأسمالي غير مقارنة لأن الحزمة لا تحمل قوائم التدفق هنا.</p></div>';
}
async function refresh(){await loadState();paint()}
function render(el){
  root=el;state=null;paint();refresh();
  if(el.dataset.bmBound==="1")return;
  el.dataset.bmBound="1";
  el.addEventListener("click",e=>{const g=e.target.closest("[data-bm-go]");if(g)window.SKosifCore.go(g.dataset.bmGo)});
  el.addEventListener("change",e=>{if(e.target.matches("[data-bm-sector]")){sector=e.target.value;save(PREF,{sector});paint()}});
}
SK.view("benchmarks",{render});
})();

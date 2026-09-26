/* S.kosif — مستندات التقارير (window.SKosifReportDocs): تُبنى من بيانات مراجعة الميزان وتُعرض في
   تبويب «القوائم والتقارير» وتُطبع بتنسيق A4 فاخر. على غرار ما تنشره الشركات العالمية:
     • التقرير السنوي بنموذج 10-K (Apple): النشاط، عوامل المخاطر، تقرير الإدارة بجداوله (الإيرادات حسب
       الفئة مع التغير والحصة، مجمل الربح للمنتجات والخدمات، المصروفات التشغيلية كنسبة من الإيرادات،
       الزكاة/الضريبة والمعدل الفعلي، السيولة، مقاييس الأداء الإدارية، التقديرات الحرجة)، القوائم،
       الإيضاحات بجداولها، تقرير المراجع المستقل، الرقابة الداخلية
     • بيان النتائج (Amazon / Apple): عنوان، نقاط النمو، القوائم المختصرة، المؤشرات الإضافية، مطابقات
       التدفق النقدي الحر
     • تقرير المراجع المستقل (ISA 700/701/705 بصيغة EY): الرأي، الأساس، الأمور الرئيسية للمراجعة
       («وصف الأمر» و«كيف عالجنا الأمر في مراجعتنا»)، المسؤوليات، التوقيع
   كل رقم من المحركات؛ الأسماء والتواريخ غير المعروفة تظهر بين قوسين مربعين لتُستكمل. */
(()=>{
"use strict";
const {esc}=SK;
const R=()=>SKEngines.reports.annualReport,MN=()=>SKEngines.reports.money;
const m0=v=>MN().formatMinor(v||0,{decimals:0});
const pct=v=>v===null||v===undefined?"—":(v>0?"":"")+v+"%";
const chg=v=>v===null||v===undefined?"—":'<span class="'+(v>=0?"pos":"neg")+'">'+(v>=0?"+":"")+v+"%</span>";

/* x: {c (tb-review compute), fs, cur, ctx, fw, kams, opinion} */
const head=(cols,cur)=>'<thead><tr><th>'+esc(cols[0])+' <small>('+esc(cur)+')</small></th>'+cols.slice(1).map(c=>'<th>'+esc(c)+'</th>').join("")+'</tr></thead>';
function stmt(rows,hp,cur){
  return '<table class="rd-t">'+head(hp?["","إيضاح","السنة الحالية","السنة السابقة"]:["","إيضاح","المبلغ"],cur)+'<tbody>'+rows.map(r=>r.level==="heading"?'<tr class="h"><td colspan="'+(hp?4:3)+'">'+esc(r.ar)+'</td></tr>':
    '<tr class="'+(r.level==="line"?"":r.level==="total"?"tot":"sub")+'"><td>'+esc(r.ar)+'</td><td class="n">'+(r.note||"")+'</td><td class="n">'+m0(r.current)+'</td>'+(hp?'<td class="n">'+(r.prior===null?"":m0(r.prior))+'</td>':'')+'</tr>').join("")+'</tbody></table>';
}
/* ---------- figures: the year in charts (engines' numbers, major units) ---------- */
function figures(fs,cur,o={}){
  if(!window.SKCharts)return{};
  const rr=R().resultsTable(fs),v=ar=>{const r=rr.find(x=>x.ar===ar);return r?r:{current:0,prior:null}};
  const M=x=>(Number(x)||0)/100,nf=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0}),fmt=n=>nf.format(Math.round(n))+" "+cur;
  const zk=/ضريبة الدخل/.test(o.taxLabel||"")?"الضريبة":"الزكاة",W=o.width||720;
  const bridge=SKCharts.waterfall({title:"من الإيرادات إلى صافي الربح",width:W,height:270,fmt:SKCharts.compact,tools:o.tools,steps:[
    {label:"الإيرادات",value:M(v("الإيرادات").current)},{label:"التكلفة",value:-M(v("تكلفة الإيرادات").current)},{label:"مجمل الربح",total:true},
    {label:"التشغيل",value:-M(v("المصروفات التشغيلية").current)},{label:"الربح التشغيلي",total:true},
    {label:"التمويل",value:M(v("إيرادات الاستثمار وتكاليف التمويل (صافي)").current)},{label:zk,value:-M(v("الزكاة/ضريبة الدخل").current)},{label:"صافي الربح",total:true}]});
  const cats=R().revenueByCategory(fs).filter(r=>r.level!=="total");
  const categories=cats.length>1?SKCharts.hbars({title:"الإيرادات حسب الفئة",fmt,tools:o.tools,valueLabel:"الإيراد ("+cur+")",rows:cats.map(r=>({label:r.ar,value:M(r.current),sub:r.pctOfRevenue!=null?r.pctOfRevenue+"% من الإيرادات":""}))}):"";
  const keys=["الإيرادات","مجمل الربح","الربح التشغيلي","صافي الربح"];
  const compare=fs.hasPrior?SKCharts.bars({title:"السنة الحالية مقابل السابقة",width:W,height:240,fmt,tools:o.tools,labels:keys,
    series:[{name:"السنة الحالية",values:keys.map(k=>M(v(k).current))},{name:"السنة السابقة",values:keys.map(k=>M(v(k).prior))}]}):"";
  const ox=R().operatingExpenses(fs).filter(r=>r.level!=="total");
  const opex=ox.length?SKCharts.hbars({title:"المصروفات التشغيلية",fmt,tools:o.tools,valueLabel:"المبلغ ("+cur+")",rows:ox.map(r=>({label:r.ar,value:M(r.current),sub:r.pctOfRevenue!=null?r.pctOfRevenue+"% من الإيرادات":""}))}):"";
  return{bridge,categories,compare,opex};
}
function measures(ms,cur){
  return ms.map(mm=>'<div class="rd-m"><h5>'+esc(mm.ar)+'</h5><table class="rd-t sm">'+head(["البيان","المبلغ"],cur)+'<tbody>'+mm.rows.map(r=>'<tr><td>'+esc(r.ar)+'</td><td class="n">'+m0(r.amount)+'</td></tr>').join("")+
    '<tr class="tot"><td>'+esc(mm.ar)+'</td><td class="n">'+m0(mm.value)+'</td></tr></tbody></table><p class="rd-note">'+esc(mm.note)+'</p></div>').join("");
}
const item=(no,title,body,id)=>'<section class="rd-item" id="'+(id||"")+'"><h3><span>'+esc(no)+'</span>'+esc(title)+'</h3>'+body+'</section>';

/* ---------- the auditor's report ---------- */
function auditor(x){
  const a=R().auditorsReport({company:x.ctx.company,periodEnd:x.periodEnd,framework:x.fw,opinion:x.opinion.opinion,basis:x.opinion.basis,kams:x.kams,goingConcern:x.opinion.goingConcern,
    firm:x.ctx.auditFirm,partner:x.ctx.auditPartner,licence:x.ctx.auditLicence,city:x.ctx.auditCity});
  return '<article class="rd-doc rd-audit"><header class="rd-h"><small>'+(a.draft?'مسودة للمراجعة — لا تصدر قبل اعتماد الشريك':'')+'</small><h2>'+esc(a.title)+'</h2><p>'+esc(a.addressee)+'</p></header>'+
    a.sections.map(s=>'<section class="rd-sec"><h4>'+esc(s.title)+'</h4>'+s.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join("")+
      (s.kams?s.kams.map(k=>'<div class="rd-kam"><h5>'+esc(k.title)+'</h5><table class="rd-kt"><tr><th>وصف الأمر</th><td>'+esc(k.description)+'</td></tr><tr><th>كيف عالجنا الأمر في مراجعتنا</th><td>'+esc(k.how)+'</td></tr></table></div>').join(""):'')+'</section>').join("")+
    '<footer class="rd-sign"><div><b>'+esc(a.signature.firm)+'</b><span>'+esc(a.signature.partner)+' — ترخيص رقم '+esc(a.signature.licence)+'</span></div><div><span>'+esc(a.signature.city)+'</span><span>'+esc(a.signature.date)+'</span></div></footer></article>';
}

/* ---------- the results release ---------- */
function release(x){
  const r=R().resultsRelease(x.fs,x.ctx.company,x.ctx.period,x.cur),fs=x.fs,hp=fs.hasPrior,k=fs.keys;
  const cond=(rows)=>'<table class="rd-t">'+head(hp?["","السنة الحالية","السنة السابقة","التغير"]:["","المبلغ"],x.cur)+'<tbody>'+rows.map(([ar,key,tot])=>{const c=k[key]?k[key].current:0,p=hp&&k[key]?k[key].prior:null;
    return '<tr class="'+(tot?"tot":"")+'"><td>'+esc(ar)+'</td><td class="n">'+m0(c)+'</td>'+(hp?'<td class="n">'+(p===null?"—":m0(p))+'</td><td class="n">'+chg(p?Math.round((c-p)/Math.abs(p)*1000)/10:null)+'</td>':'')+'</tr>'}).join("")+'</tbody></table>';
  return '<article class="rd-doc rd-release"><header class="rd-h rd-press"><small>بيان صحفي · '+esc(x.ctx.auditCity||(x.fw==="EAS"?"القاهرة":"الرياض"))+'</small><h2>'+esc(r.headline)+'</h2></header>'+
    '<ul class="rd-bul">'+r.bullets.map(b=>'<li>'+esc(b)+'</li>').join("")+'</ul>'+
    '<p class="rd-quote">«[تعليق الرئيس التنفيذي على نتائج السنة]» — [الاسم، المنصب]</p>'+
    '<h4>قائمة الربح أو الخسارة المختصرة</h4><table class="rd-t">'+head(hp?["","السنة الحالية","السنة السابقة","التغير","% من الإيرادات"]:["","المبلغ","التغير","% من الإيرادات"],x.cur)+'<tbody>'+
      r.results.map(z=>'<tr class="'+(z.level==="total"?"tot":"")+'"><td>'+esc(z.ar)+'</td><td class="n">'+m0(z.current)+'</td>'+(hp?'<td class="n">'+(z.prior===null?"—":m0(z.prior))+'</td>':'')+'<td class="n">'+chg(z.change)+'</td><td class="n">'+pct(z.pctOfRevenue)+'</td></tr>').join("")+'</tbody></table>'+
    '<h4>الإيرادات حسب الفئة</h4><table class="rd-t">'+head(hp?["الفئة","السنة الحالية","السنة السابقة","التغير","الحصة"]:["الفئة","المبلغ","التغير","الحصة"],x.cur)+'<tbody>'+
      r.categories.map(z=>'<tr class="'+(z.level==="total"?"tot":"")+'"><td>'+esc(z.ar)+'</td><td class="n">'+m0(z.current)+'</td>'+(hp?'<td class="n">'+(z.prior===null?"—":m0(z.prior))+'</td>':'')+'<td class="n">'+chg(z.change)+'</td><td class="n">'+pct(z.pctOfRevenue)+'</td></tr>').join("")+'</tbody></table>'+
    '<h4>قائمة المركز المالي المختصرة</h4>'+cond([["الموجودات المتداولة","ca"],["الموجودات غير المتداولة","nca"],["مجموع الموجودات","assets",1],["المطلوبات المتداولة","cl"],["المطلوبات غير المتداولة","ncl"],["حقوق الملكية","equity",1]])+
    (fs.cf?'<h4>التدفقات النقدية المختصرة</h4><table class="rd-t">'+head(["","المبلغ"],x.cur)+'<tbody>'+fs.cf.filter(z=>["cf-op","cf-inv","cf-fin","cf-net","cf-close"].includes(z.key)).map(z=>'<tr class="'+(z.key==="cf-close"?"tot":"")+'"><td>'+esc(z.ar)+'</td><td class="n">'+m0(z.current)+'</td></tr>').join("")+'</tbody></table>':'')+
    '<h4>مؤشرات إضافية</h4><table class="rd-t sm"><tbody>'+r.supplemental.map(s=>'<tr><td>'+esc(s.ar)+'</td><td class="n">'+pct(s.value)+'</td></tr>').join("")+'</tbody></table>'+
    '<h4>مطابقة مقاييس الأداء التي تحددها الإدارة</h4>'+measures(r.measures,x.cur)+
    '<p class="rd-note">البيان مولّد من القوائم المالية المراجعة/قيد المراجعة؛ المقاييس غير المعرّفة في المعايير مطابقة مع أقرب مجموع فيها.</p></article>';
}

/* ---------- the annual report (10-K form) ---------- */
function annual(x){
  const fs=x.fs,hp=fs.hasPrior,c=x.c,ctx=x.ctx,cur=x.cur,rv=R();
  const cats=rv.revenueByCategory(fs),ps=rv.productsServices(fs),opx=rv.operatingExpenses(fs),tax=rv.taxProvision(fs,x.fw==="EAS"?"EG":"SA"),liq=rv.liquidity(fs),ms=rv.performanceMeasures(fs);
  const ppe=rv.ppeNote(fs),bsd=rv.balanceSheetDetails(fs),debt=rv.debtNote(fs),rel=rv.resultsRelease(fs,ctx.company,ctx.period,cur);
  const fig=figures(fs,cur,{width:860,taxLabel:x.fw==="EAS"?"ضريبة الدخل":"الزكاة"});
  const risks=c.base.risks.filter(r=>r.significant||r.level==="متوسط").slice(0,6),hf=c.all.findings.filter(f=>f.severity==="high");
  const gc=c.all.findings.filter(f=>f.kind==="going-concern");
  const toc=[["1","النشاط","it1"],["1أ","عوامل المخاطر","it1a"],["3","الإجراءات القانونية والالتزامات المحتملة","it3"],["7","تقرير الإدارة ومناقشتها وتحليلها","it7"],["7أ","الإفصاحات عن مخاطر السوق","it7a"],["8","القوائم المالية والإيضاحات","it8"],["","تقرير المراجع المستقل","itA"],["9أ","الضوابط والإجراءات","it9a"]];
  const shareTable=(rows)=>'<table class="rd-t">'+head(hp?["","السنة الحالية","السنة السابقة","التغير","% من الإيرادات","% السابقة"]:["","المبلغ","التغير","% من الإيرادات"],cur)+'<tbody>'+
    rows.map(r=>'<tr class="'+(r.level==="total"?"tot":"")+'"><td>'+esc(r.ar)+'</td><td class="n">'+m0(r.current)+'</td>'+(hp?'<td class="n">'+(r.prior===null?"—":m0(r.prior))+'</td>':'')+'<td class="n">'+chg(r.change)+'</td><td class="n">'+pct(r.pctOfRevenue)+'</td>'+(hp?'<td class="n">'+pct(r.pctOfRevenuePrior)+'</td>':'')+'</tr>').join("")+'</tbody></table>';
  let h='<article class="rd-doc rd-annual">'+
    '<header class="rd-cover"><small>التقرير السنوي</small><h1>'+esc(ctx.company||"[اسم المنشأة]")+'</h1><p>'+esc(ctx.period||"[الفترة]")+'</p><p>'+esc({IFRS:"المعايير الدولية للتقرير المالي المعتمدة في المملكة العربية السعودية",SME:"المعيار الدولي للتقرير المالي للمنشآت الصغيرة والمتوسطة (المملكة)",EAS:"معايير المحاسبة المصرية"}[x.fw])+' · العملة: '+esc(cur)+'</p><i>مسودة معدّة بـ KOSIF على نموذج التقرير السنوي (10-K) — للمراجعة قبل الإصدار</i></header>'+
    '<nav class="rd-toc"><h4>المحتويات</h4><ol>'+toc.map(([n,t,id])=>'<li><a href="#'+id+'"><span>'+(n?'البند '+esc(n):'تقرير')+'</span>'+esc(t)+'</a></li>').join("")+'</ol></nav>'+
    '<h2 class="rd-part">الجزء الأول</h2>'+
    item("البند 1","النشاط",'<p>'+esc(ctx.company||"المنشأة")+(ctx.legalForm?' — '+esc(ctx.legalForm):'')+'، ومقرها '+esc(ctx.registeredOffice||ctx.principalPlace||"[المقر]")+'، تعمل في '+esc(ctx.activity||"[النشاط]")+'. تُعد قوائمها المالية وفق '+esc({IFRS:"المعايير الدولية للتقرير المالي المعتمدة في المملكة العربية السعودية",SME:"المعيار الدولي للتقرير المالي للمنشآت الصغيرة والمتوسطة المعتمد في المملكة",EAS:"معايير المحاسبة المصرية"}[x.fw])+'.</p>'+
      '<p>بلغت إيرادات السنة '+m0(fs.keys.revenue.current)+' '+esc(cur)+' من '+(cats.length-1)+' فئة إيراد، وتضم قائمة المركز المالي موجودات بمجموع '+m0(fs.keys.assets.current)+' '+esc(cur)+'.</p>',"it1")+
    item("البند 1أ","عوامل المخاطر",(risks.map(r=>'<div class="rd-risk"><h5>'+esc(r.ar)+'</h5><p>'+esc(r.risk)+'. الرصيد '+m0(r.amount)+' '+esc(cur)+' ودرجة الخطر المقيّمة '+r.score+'/100'+(r.significant?' — خطر جوهري يتطلب استجابة خاصة (ISA 330).':'.')+'</p></div>').join("")||'<p>لم تُحدَّد مخاطر جوهرية.</p>')+
      (gc.length?'<div class="rd-risk"><h5>الاستمرارية</h5><p>'+esc(gc.map(f=>f.title+' ('+f.basis+')').join('؛ '))+'.</p></div>':'')+
      '<div class="rd-risk"><h5>الاعتراف بالإيراد</h5><p>يُفترض وجود خطر غش في الاعتراف بالإيراد ما لم يُدحض (ISA 240)، وتُفحص حدود القطع والفواتير حول نهاية السنة.</p></div>',"it1a")+
    item("البند 3","الإجراءات القانونية والالتزامات المحتملة",(c.base.fs.lines.some(l=>l.key==="provisions"&&l.current)?'<p>تتضمن القوائم مخصصات بمبلغ '+m0(c.base.fs.lines.find(l=>l.key==="provisions").current)+' '+esc(cur)+' وفق '+esc(x.fw==="EAS"?"معيار المحاسبة المصري 28":"IAS 37")+'؛ وتُطلب خطابات المستشار القانوني لتأكيد القضايا القائمة.</p>':'<p>لم تتضمن القوائم مخصصات لقضايا أو مطالبات؛ ويُستكمل هذا البند بخطاب المستشار القانوني وإقرار الإدارة.</p>'),"it3")+
    '<h2 class="rd-part">الجزء الثاني</h2>'+
    item("البند 7","تقرير الإدارة ومناقشتها وتحليلها للمركز المالي ونتائج الأعمال",
      '<h4>نظرة عامة على السنة</h4><ul class="rd-bul">'+rel.bullets.map(b=>'<li>'+esc(b)+'</li>').join("")+'</ul>'+
      (fig.bridge?'<div class="rd-fig"><h5>الشكل 1 — من الإيرادات إلى صافي الربح ('+esc(cur)+')</h5>'+fig.bridge+'</div>':'')+
      (fig.categories?'<div class="rd-fig"><h5>الشكل 2 — الإيرادات حسب الفئة</h5>'+fig.categories+'</div>':'')+
      '<h4>الإيرادات حسب الفئة</h4><table class="rd-t">'+head(hp?["الفئة","السنة الحالية","السنة السابقة","التغير","الحصة"]:["الفئة","المبلغ","التغير","الحصة"],cur)+'<tbody>'+
        cats.map(r=>'<tr class="'+(r.level==="total"?"tot":"")+'"><td>'+esc(r.ar)+'</td><td class="n">'+m0(r.current)+'</td>'+(hp?'<td class="n">'+(r.prior===null?"—":m0(r.prior))+'</td>':'')+'<td class="n">'+chg(r.change)+'</td><td class="n">'+pct(r.pctOfRevenue)+'</td></tr>').join("")+'</tbody></table>'+
      '<h4>مجمل الربح</h4>'+(ps?'<table class="rd-t">'+head(["","الإيرادات","مجمل الربح",hp?"الهامش: الحالي / السابق":"هامش مجمل الربح"],cur)+'<tbody>'+
          [ps.products,ps.services].map(s=>'<tr><td>'+esc(s.ar)+'</td><td class="n">'+m0(s.revenue)+'</td><td class="n">'+m0(s.margin)+'</td><td class="n">'+pct(s.marginPct)+(hp?' / '+pct(s.marginPctPrior):'')+'</td></tr>').join("")+
          '<tr class="tot"><td>الإجمالي</td><td class="n">'+m0(ps.total.revenue)+'</td><td class="n">'+m0(ps.total.margin)+'</td><td class="n">'+pct(ps.total.marginPct)+(hp?' / '+pct(ps.total.marginPctPrior):'')+'</td></tr></tbody></table>'+(ps.costSplit?'':'<p class="rd-note">لا توجد حسابات تكلفة مستقلة للخدمات؛ حُمّلت التكلفة كلها على المنتجات.</p>')
        :shareTable(rv.resultsTable(fs).slice(0,3)))+
      '<h4>المصروفات التشغيلية</h4>'+shareTable(opx)+
      '<h4>'+(x.fw==="EAS"?"ضريبة الدخل":"الزكاة")+'</h4><p>بلغ المصروف '+m0(tax.expense)+' '+esc(cur)+'، أي '+pct(tax.effectiveRate)+' من الربح قبل '+(x.fw==="EAS"?"الضريبة":"الزكاة")+(tax.effectiveRatePrior!==null?' مقابل '+pct(tax.effectiveRatePrior)+' في السنة السابقة':'')+'. '+esc(tax.basis)+'.</p>'+
        (tax.reconciliation.length?'<table class="rd-t sm">'+head(["مطابقة المعدل الفعلي","المبلغ"],cur)+'<tbody>'+tax.reconciliation.map((z,i)=>'<tr class="'+(i===2?"tot":"")+'"><td>'+esc(z.ar)+'</td><td class="n">'+m0(z.amount)+'</td></tr>').join("")+'</tbody></table>':'')+
      '<h4>السيولة ومصادر التمويل</h4><p>بلغ النقد وما في حكمه '+m0(liq.cash)+' '+esc(cur)+(liq.cashPrior!==null?' مقابل '+m0(liq.cashPrior):'')+'، والقروض والتزامات الإيجار '+m0(liq.debt)+'، فيكون '+(liq.netCash>=0?'صافي النقد':'صافي الدين')+' '+m0(Math.abs(liq.netCash))+'. رأس المال العامل '+m0(liq.workingCapital)+' ونسبة التداول '+(liq.currentRatio??"—")+' مرة'+(liq.cfo!==null?'، وولّدت الأنشطة التشغيلية '+m0(liq.cfo):'')+(liq.fcf!==null?' والتدفق النقدي الحر '+m0(liq.fcf):'')+'.</p>'+
      '<h4>مقاييس الأداء التي تحددها الإدارة</h4>'+measures(ms,cur)+
      '<h4>التقديرات المحاسبية الحرجة</h4>'+(x.c.disclosures.uncertainties.length?'<ul class="rd-bul">'+x.c.disclosures.uncertainties.map(u=>'<li><b>'+esc(u.nature)+'</b> — '+esc(u.affected)+' بمبلغ '+m0(u.carrying)+' '+esc(cur)+'؛ الافتراضات: '+esc(u.assumptions.join("، "))+'.</li>').join("")+'</ul>':'<p>لا توجد تقديرات جوهرية.</p>'),"it7")+
    item("البند 7أ","الإفصاحات الكمية والنوعية عن مخاطر السوق",debt?'<p>تبلغ القروض والتزامات الإيجار '+m0(debt.total)+' '+esc(cur)+' وتكاليف التمويل للسنة '+m0(debt.financeCost)+'؛ ويؤثر تغير أسعار الفائدة/العمولة على تكلفة التمويل ذي السعر المتغير.</p>':'<p>لا توجد قروض؛ تنحصر مخاطر السوق في مخاطر الائتمان على الذمم ومخاطر السيولة.</p>',"it7a")+
    item("البند 8","القوائم المالية والإيضاحات",
      '<h4>قائمة الربح أو الخسارة</h4>'+stmt(fs.pl,hp,cur)+'<h4>قائمة المركز المالي</h4>'+stmt(fs.sfp,hp,cur)+
      '<h4>قائمة التغيرات في حقوق الملكية</h4><table class="rd-t">'+head(["",...fs.soce.columns],cur)+'<tbody>'+fs.soce.rows.map((r,i)=>'<tr class="'+(i===fs.soce.rows.length-1?"tot":"")+'"><td>'+esc(r.ar)+'</td>'+r.values.map(v=>'<td class="n">'+m0(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table>'+
      (fs.cf?'<h4>قائمة التدفقات النقدية</h4>'+stmt(fs.cf,false,cur):'')+
      '<h4>إيضاح — تفصيل الإيرادات</h4><table class="rd-t">'+head(["الفئة","السنة الحالية","السنة السابقة"],cur)+'<tbody>'+cats.map(r=>'<tr class="'+(r.level==="total"?"tot":"")+'"><td>'+esc(r.ar)+'</td><td class="n">'+m0(r.current)+'</td><td class="n">'+(r.prior===null?"—":m0(r.prior))+'</td></tr>').join("")+'</tbody></table>'+
      (ppe?'<h4>إيضاح — الممتلكات والآلات والمعدات</h4><table class="rd-t">'+head(["","السنة الحالية","السنة السابقة"],cur)+'<tbody>'+ppe.rows.map(r=>'<tr><td>'+esc(r.ar)+'</td><td class="n">'+m0(r.current)+'</td><td class="n">'+(r.prior===null?"—":m0(r.prior))+'</td></tr>').join("")+
        '<tr class="sub"><td>إجمالي التكلفة</td><td class="n">'+m0(ppe.gross)+'</td><td class="n">'+(ppe.grossPrior===null?"—":m0(ppe.grossPrior))+'</td></tr><tr><td>الاستهلاك المتراكم</td><td class="n">'+m0(ppe.accumulated)+'</td><td class="n">'+(ppe.accumulatedPrior===null?"—":m0(ppe.accumulatedPrior))+'</td></tr>'+
        '<tr class="tot"><td>صافي القيمة الدفترية</td><td class="n">'+m0(ppe.net)+'</td><td class="n">'+(ppe.netPrior===null?"—":m0(ppe.netPrior))+'</td></tr></tbody></table><p class="rd-note">مصروف الاستهلاك للسنة '+m0(ppe.depreciation)+'.</p>':'')+
      bsd.map(b=>'<h4>إيضاح '+(b.note||"")+' — '+esc(b.ar)+'</h4><table class="rd-t">'+head(["","السنة الحالية","السنة السابقة"],cur)+'<tbody>'+b.rows.map(r=>'<tr><td>'+esc(r.ar)+'</td><td class="n">'+m0(r.current)+'</td><td class="n">'+(r.prior===null?"—":m0(r.prior))+'</td></tr>').join("")+'<tr class="tot"><td>المجموع</td><td class="n">'+m0(b.total)+'</td><td class="n">'+(b.totalPrior===null?"—":m0(b.totalPrior))+'</td></tr></tbody></table>').join("")+
      (debt?'<h4>إيضاح — القروض والتزامات الإيجار</h4><table class="rd-t">'+head(["","الاستحقاق","السنة الحالية","السنة السابقة"],cur)+'<tbody>'+debt.items.map(d=>'<tr><td>'+esc(d.ar)+'</td><td>'+esc(d.maturity)+'</td><td class="n">'+m0(d.current)+'</td><td class="n">'+(d.prior===null?"—":m0(d.prior))+'</td></tr>').join("")+'<tr class="tot"><td>المجموع</td><td></td><td class="n">'+m0(debt.total)+'</td><td></td></tr></tbody></table>':''),"it8")+
    '<section class="rd-item" id="itA">'+auditor(x)+'</section>'+
    item("البند 9أ","الضوابط والإجراءات",'<p>الإدارة مسؤولة عن تصميم الرقابة الداخلية على التقرير المالي وتشغيلها. أُبلغت الإدارة بـ'+hf.length+' ملاحظة عالية الأثر و'+c.all.summary.medium+' ملاحظة متوسطة خلال المراجعة (ISA 265)'+(hf.length?'، أبرزها: '+esc(hf.slice(0,4).map(f=>f.title).join("، ")):'')+'.</p>',"it9a")+
  '</article>';
  return h;
}
const CSS=`
.rd-fig{margin:14px 0 18px;padding:12px 14px;border:1px solid #e3e9f2;border-radius:10px;break-inside:avoid;page-break-inside:avoid}
.rd-fig h5{margin:0 0 8px;font-size:12.5px;color:#0b2a5b}
.rd-doc{font-family:"IBM Plex Sans Arabic",var(--sk-font,system-ui);color:#14233a;line-height:1.85;font-size:13.5px}
.rd-doc h1,.rd-doc h2,.rd-doc h3,.rd-doc h4,.rd-doc h5{color:#0b2a5b;line-height:1.4}
.rd-cover{padding:56px 40px;margin-bottom:24px;border-radius:14px;background:linear-gradient(140deg,#0b2a5b,#1668e3);color:#fff;text-align:center}
.rd-cover h1{color:#fff;font-size:34px;margin:10px 0}.rd-cover small{letter-spacing:.2em;opacity:.8}.rd-cover p{margin:4px 0;opacity:.92}.rd-cover i{display:block;margin-top:18px;font-size:12px;opacity:.75}
.rd-toc{padding:16px 20px;border:1px solid #dfe6ef;border-radius:12px;margin-bottom:22px}.rd-toc ol{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.rd-toc a{display:flex;gap:12px;color:#14233a;text-decoration:none}.rd-toc a span{min-width:74px;color:#1668e3;font-weight:700}
.rd-part{margin:26px 0 10px;padding-bottom:6px;border-bottom:3px double #0b2a5b;font-size:20px}
.rd-item{margin:18px 0 26px}.rd-item>h3{display:flex;align-items:baseline;gap:12px;font-size:17px;border-bottom:1px solid #dfe6ef;padding-bottom:6px}.rd-item>h3 span{color:#1668e3;font-size:13px;min-width:62px}
.rd-doc h4{margin:18px 0 8px;font-size:14.5px}.rd-doc h5{margin:10px 0 4px;font-size:13.5px}
.rd-t{width:100%;border-collapse:collapse;margin:6px 0 12px;font-size:12.5px}.rd-t th,.rd-t td{padding:6px 8px;border-bottom:1px solid #e7ecf3;text-align:start}
.rd-t thead th{background:#f3f6fb!important;color:#0b2a5b!important;font-weight:700;border-bottom:2px solid #0b2a5b}
.rd-doc .rd-t{border:0;border-radius:0}.rd-doc .rd-t tr:nth-child(even) td{background:none}.rd-t th small{font-weight:600;color:#6a7a92}
.rd-t td.n,.rd-t th:not(:first-child){text-align:end;direction:ltr;font-variant-numeric:tabular-nums;white-space:nowrap}
.rd-t tr.sub td{font-weight:700;background:#f8fafd}.rd-t tr.tot td{font-weight:800;border-top:1.5px solid #0b2a5b;border-bottom:3px double #0b2a5b}.rd-t tr.h td{font-weight:800;color:#1668e3;padding-top:12px;border-bottom:0}
.rd-t.sm{max-width:520px}.rd-doc .pos{color:#15803d}.rd-doc .neg{color:#b91c1c}
.rd-note{font-size:11.5px;color:#6a7a92;margin:4px 0 10px}
.rd-bul{margin:6px 0 12px;padding-inline-start:20px;display:grid;gap:6px}
.rd-m{margin:8px 0 14px}
.rd-risk{padding:10px 14px;border-inline-start:3px solid #f5a524;background:#fffaf0;border-radius:6px;margin:8px 0}
.rd-h{text-align:center;margin-bottom:16px}.rd-h small{color:#b45309;font-weight:700}.rd-h h2{font-size:22px;margin:6px 0}
.rd-press{text-align:start;border-bottom:3px solid #0b2a5b;padding-bottom:10px}.rd-press small{color:#6a7a92}
.rd-quote{font-style:italic;color:#34455e;border-inline-start:3px solid #1668e3;padding-inline-start:12px;margin:12px 0}
.rd-sec{margin:14px 0}.rd-sec h4{border-bottom:1px solid #dfe6ef;padding-bottom:4px}
.rd-kam{margin:10px 0;border:1px solid #dfe6ef;border-radius:8px;overflow:hidden}.rd-kam h5{margin:0;padding:8px 12px;background:#f3f6fb}
.rd-kt{width:100%;border-collapse:collapse;font-size:12.5px}.rd-kt th{width:26%;text-align:start;vertical-align:top;padding:8px 12px;color:#0b2a5b;background:#fbfcfe;border-top:1px solid #e7ecf3}.rd-kt td{padding:8px 12px;border-top:1px solid #e7ecf3;border-inline-start:1px solid #e7ecf3}
.rd-sign{display:flex;justify-content:space-between;gap:20px;margin-top:22px;padding-top:12px;border-top:1px solid #dfe6ef}.rd-sign div{display:grid;gap:2px}
@media print{.rd-cover{page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}.rd-part,.rd-audit{page-break-before:always}.rd-item,.rd-t{page-break-inside:auto}.rd-t tr{page-break-inside:avoid}.rd-toc{page-break-after:always}}
`;
window.SKosifReportDocs=Object.freeze({annual,release,auditor,figures,CSS});
})();

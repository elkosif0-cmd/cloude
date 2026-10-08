/* SQC — التقرير السنوي المتكامل (window.SKosifIntegrated).
   A published-grade integrated annual report, laid out as the reports read page by page in the research bundle
   (SKEngines.reports.globalCorpus.blueprint): the strategic report (year at a glance, chair's letter, chief executive's
   review, strategy, performance and liquidity, principal risks, viability, sustainability, outlook), governance (audit
   committee, directors' responsibilities), then the auditor's report, the financial statements and the notes, the global
   comparison, and an appendix that scores the report against the bundle and lists every figure the check could not trace.
   The narrative is the AI reviewer's draft (Gemini, OpenAI or Claude) or the engine's own; numbers always come from
   the engines. x = docX(c) of ui/features/tb-review.js with pack (the fact pack), narr (the narrative) and q (quality). */
(()=>{
"use strict";
const {esc}=SK;
const RD=()=>window.SKosifReportDocs,GC=()=>SKEngines.reports.globalCorpus;
const T={ارتفاع:["↑","up","يرتفع"],ثبات:["→","flat","مستقر"],انخفاض:["↓","down","ينخفض"]};
const P=a=>(a||[]).map(t=>'<p>'+esc(t)+'</p>').join("");
const badge=(narr,k)=>narr.source&&narr.source[k]==="ai"?'<span class="ir-ai" title="صياغة الذكاء الاصطناعي — مسودة تعتمدها الإدارة">صياغة الذكاء الاصطناعي</span>':'';
const sec=(id,kicker,title,body,cls)=>'<section class="ir-sec '+(cls||"")+'" id="ir-'+id+'"><header class="ir-sh"><small>'+esc(kicker)+'</small><h2>'+esc(title)+'</h2></header>'+body+'</section>';
const chg=v=>v===null||v===undefined?'':'<em class="'+(v>=0?"pos":"neg")+'">'+(v>=0?"▲ ":"▼ ")+Math.abs(v)+'%</em>';

function glance(x){
  const f=k=>x.pack.facts.find(z=>z.key===k);
  const keys=["revenue","operating","profit","ebitda","fcf","grossMargin","operatingMargin","gearing"].map(f).filter(z=>z&&z.value!==null);
  return '<div class="ir-kpis">'+keys.map(z=>'<div class="ir-kpi"><small>'+esc(z.ar.replace(/\s*\(.*\)$/,""))+'</small><b>'+esc(z.text)+'</b><span>'+(z.priorText?'السابقة '+esc(z.priorText):'&nbsp;')+' '+chg(z.change)+'</span></div>').join("")+'</div>';
}
function letter(narr,k,sign){
  const L=narr.narrative[k];
  return '<div class="ir-letter">'+badge(narr,k)+'<div class="ir-cols">'+P(L.paragraphs)+'</div><footer class="ir-signoff"><b>[الاسم]</b><span>'+esc(sign)+'</span></footer></div>';
}
function risks(narr){
  const R=narr.narrative.principalRisks;
  return badge(narr,"principalRisks")+'<p class="ir-lead">'+esc(R.intro)+'</p><table class="ir-rt"><thead><tr><th>الخطر</th><th>الوصف</th><th>كيف ندير الخطر</th><th>الاتجاه</th></tr></thead><tbody>'+
    R.risks.map(r=>{const t=T[r.trend]||T["ثبات"];return '<tr><td><b>'+esc(r.title)+'</b><small>'+esc(r.category)+'</small></td><td>'+esc(r.description)+'</td><td>'+esc(r.management)+'</td><td><span class="ir-trend '+t[1]+'" title="'+t[2]+'">'+t[0]+' '+esc(r.trend)+'</span></td></tr>'}).join("")+'</tbody></table>';
}
function viability(narr){
  const V=narr.narrative.viability;
  return badge(narr,"viability")+'<div class="ir-vb"><div class="ir-vp"><small>فترة التقييم</small><b>'+esc(V.period)+'</b></div><ol class="ir-steps">'+V.assessment.map(a=>'<li>'+esc(a)+'</li>').join("")+'</ol></div>'+
    (V.scenarios.length?'<table class="ir-rt"><thead><tr><th>السيناريو الشديد والمعقول</th><th>المخاطر المرتبطة</th><th>الأثر المختبر</th></tr></thead><tbody>'+V.scenarios.map(s=>'<tr><td>'+esc(s.scenario)+'</td><td>'+esc(s.risks)+'</td><td>'+esc(s.impact)+'</td></tr>').join("")+'</tbody></table>':'')+
    '<p class="ir-conc">'+esc(V.conclusion)+'</p>';
}
function committee(narr){
  const A=narr.narrative.auditCommittee;
  return badge(narr,"auditCommittee")+P(A.paragraphs)+(A.matters.length?'<h4>الأمور الهامة التي نظرت فيها اللجنة</h4><table class="ir-rt"><thead><tr><th>مجال التركيز</th><th>الأمر</th><th>الاستنتاج</th></tr></thead><tbody>'+
    A.matters.map(m=>'<tr><td><b>'+esc(m.area)+'</b></td><td>'+esc(m.matter)+'</td><td>'+esc(m.conclusion)+'</td></tr>').join("")+'</tbody></table>':'')+
    '<footer class="ir-signoff"><b>[الاسم]</b><span>رئيس لجنة المراجعة</span></footer>';
}
/* the KAMs in the bundle's two-column form (Aramco p 10164): the matter | how our audit addressed it, as bullets */
function kamsTable(narr){
  return '<div class="ir-kams">'+narr.narrative.kams.map((k,i)=>'<div class="ir-kam"><h5><span>'+(i+1)+'</span>'+esc(k.title)+'</h5><div class="ir-kg"><div><small>الأمر الرئيسي للمراجعة</small><p>'+esc(k.matter)+'</p></div>'+
    '<div><small>كيف عالجت مراجعتنا الأمر</small><p>شملت إجراءاتنا، من بين أمور أخرى، ما يلي:</p><ul>'+k.procedures.map(p=>'<li>'+esc(p)+'</li>').join("")+(k.disclosure?'<li>'+esc(k.disclosure)+'</li>':'')+'</ul></div></div></div>').join("")+'</div>';
}
function compatibilityKeys(x){
  const n=x.narr?.narrative||{},fs=x.fs||{},pk=x.notesPkg||{},keys=new Set(["auditor_report","income_statement","balance_sheet","notes","governance","icfr"]);
  const add=(k,on=true)=>{if(on)keys.add(k)};
  add("highlights",!!(x.pack?.facts||[]).length);add("chair_letter",(n.chairLetter?.paragraphs||[]).length>=2);add("ceo_letter",(n.ceoReview?.paragraphs||[]).length>=2);
  add("kpis",(n.ceoReview?.kpiCommentary||[]).length>=4);add("strategy",(n.strategy?.pillars||[]).length>=2);add("mdna",(n.performanceReview?.paragraphs||[]).length>0);
  add("liquidity",(n.liquidity?.paragraphs||[]).length>0);add("principal_risks",(n.principalRisks?.risks||[]).length>0);add("risk_management",String(n.principalRisks?.intro||"").length>30);
  add("viability",!!n.viability?.conclusion);add("sustainability",(n.sustainability?.paragraphs||[]).length>0);add("outlook",(n.outlook?.paragraphs||[]).length>0);
  add("audit_committee",(n.auditCommittee?.paragraphs||[]).length>0||(n.auditCommittee?.matters||[]).length>0);add("directors_resp",(n.directorsResponsibilities?.paragraphs||[]).length>0);
  add("kam",(n.kams||[]).length>0);add("materiality",!!x.approach);add("cash_flow",!!fs.cf);add("accounting_policies",!!x.policies&&Object.keys(x.policies).length>0);
  add("estimates",!!(x.c?.disclosures?.uncertainties||[]).length||(pk.supplementary||[]).some(z=>z.key==="sensitivity"));
  const line=k=>(fs.lines||[]).find(z=>z.key===k&&(z.current||z.prior));
  add("tax_note",!!line("zakatExpense")||!!line("taxExpense")||!!line("zakatPayable"));add("ppe_note",!!line("ppe"));add("intangibles_note",!!line("intangibles")||!!line("goodwill"));
  add("employee_benefits",!!line("eosb"));add("leases_note",!!line("rou")||!!line("leaseNcl")||!!line("leaseCl"));add("provisions_note",!!line("provisions"));add("revenue_note",!!line("revenue"));
  const sup=new Set((pk.supplementary||[]).map(z=>z.key));add("credit_risk",sup.has("risk"));add("liquidity_risk",sup.has("risk"));add("market_risk",sup.has("risk"));add("fin_instruments",sup.has("risk")||sup.has("financing"));add("capital_mgmt",sup.has("capital"));
  return [...keys];
}
function compatibilityTable(x){
  const G=GC(),keys=compatibilityKeys(x),rows=G.reportCompatibility(keys),sum=G.compatibilitySummary(keys),cls=n=>n>=80?"pos":n<55?"neg":"";
  return '<details class="ir-compat" open><summary><b>مقارنة البنية التاريخية ضمن فهرس '+sum.reports+' تقريراً</b><span>متوسط التغطية الهيكلية '+sum.averageCoveragePct+'% · ≥80%: '+sum.atLeast80+' · ≥60%: '+sum.atLeast60+'</span></summary>'+
    '<p class="rd-note">هذا اختبار بنية المخرجات، وليس ادعاء أن منشأتك يجب أن تقلّد شركة بعينها. تغطي المقارنة الأقسام المصنفة تاريخياً في '+sum.classifiedReports+' تقريراً؛ '+sum.unclassifiedReports+' تقرير لم تُفهرس أقسامه بعد ويُستبعد من متوسط التغطية. لم تُعد مراجعة تصنيف الأقسام في هذا الفحص.</p>'+
    '<div class="ir-compat-wrap"><table class="ir-rt ir-compat-t"><thead><tr><th>الشركة / التقرير</th><th>الإطار</th><th>التغطية</th><th>الموجود</th><th>أبرز الأقسام غير المغطاة</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td><b>'+esc(r.company)+'</b><small>'+esc(r.fy)+' · '+esc(r.id)+'</small></td><td>'+esc(r.framework)+'</td><td class="'+cls(r.coveragePct)+'"><b>'+(r.structureStatus==='not-classified'?'غير مصنف':r.coveragePct+'%')+'</b></td><td>'+r.matched+'/'+r.total+'</td><td>'+(r.structureStatus==='not-classified'?'لم تُفهرس أقسام هذا التقرير':r.missingSections.length?esc(r.missingSections.slice(0,5).map(z=>z.ar).join("، "))+(r.missingSections.length>5?' <small>+'+(r.missingSections.length-5)+'</small>':''):'<span class="pos">مغطى هيكلياً</span>')+'</td></tr>').join("")+
    '</tbody></table></div></details>';
}

function appendix(x){
  const q=x.q,narr=x.narr,G=GC(),sum=G.summary(),bp=G.blueprint();
  const ai=Object.values(narr.source||{}).filter(v=>v==="ai").length,tot=Object.keys(narr.source||{}).length;
  return '<div class="ir-q"><div class="ir-qs"><b>'+q.score+'%</b><small>مطابقة البنية والمحتوى للتقارير العالمية</small></div><div><p>يسند فهرس الحزمة '+sum.pages.toLocaleString("en-US")+' صفحة إلى '+sum.reports+' تقريراً. اكتملت مراجعة المصدر لـ'+sum.completeSourceReviewReports+' تقارير ('+sum.completeSourceReviewPages.toLocaleString("en-US")+' صفحة)؛ الفهرسة ليست مراجعة شاملة أو قبولاً للتطبيق. إحصاءات الأقسام تاريخية ولم تُعد مراجعتها دلالياً. '+
    'تُقاس هذه المسودة بما تحتويه تلك التقارير قسماً قسماً، ويُطابَق كل رقم في السرد مع أرقام المنشأة.</p><p class="ir-src">'+(ai?'صاغ الذكاء الاصطناعي '+ai+' من '+tot+' أقسام'+(narr.model?' ('+esc(narr.model)+(narr.at?' · '+esc(narr.at.slice(0,10)):'')+')':'')+'، والباقي من محرك SQC.':'السرد من محرك SQC (دون ذكاء اصطناعي).')+'</p></div></div>'+
    '<table class="ir-rt ir-qt"><thead><tr><th>المعيار</th><th>النتيجة</th><th>الأساس في الحزمة</th></tr></thead><tbody>'+q.items.map(i=>'<tr><td>'+esc(i.ar)+(i.detail?'<small>'+esc(i.detail)+'</small>':'')+'</td><td class="'+(i.ok?"pos":"neg")+'">'+(i.ok?"✓ مستوفى":"✗ غير مستوفى")+'</td><td>'+esc(i.basis)+'</td></tr>').join("")+'</tbody></table>'+
    (narr.unverified&&narr.unverified.length?'<p class="ir-warn">أرقام لم يمكن تتبعها إلى أرقام المنشأة — تُصحح أو تُحذف قبل الإصدار: '+esc(narr.unverified.map(u=>u.section+': '+u.numbers.join("، ")).join(" | "))+'</p>':'')+
    compatibilityTable(x)+
    '<h4>البنية المتبعة (من ترتيب الأقسام في التقارير الـ'+sum.sectionStatisticsReports+')</h4><div class="ir-bp">'+bp.map(p=>'<div><b>'+esc(p.ar)+'</b><ol>'+p.sections.map(s=>'<li>'+esc(s.ar)+' <small>'+s.reports+'/'+sum.sectionStatisticsReports+'</small></li>').join("")+'</ol></div>').join("")+'</div>';
}

function render(x){
  if(!x.pack||!x.narr)return '<p class="empty">يحتاج التقرير المتكامل إلى محركات السرد.</p>';
  const rd=RD(),n=x.narr.narrative,ctx=x.ctx,fs=x.fs,hp=fs.hasPrior,cur=x.cur,year=(ctx.periodEnd||"").slice(0,4)||"";
  const fig=rd.figures(fs,cur,{width:860,taxLabel:x.fw==="EAS"?"ضريبة الدخل":"الزكاة"});
  const toc=[["التقرير الاستراتيجي",[["glance","العام في لمحة"],["chair","رسالة رئيس مجلس الإدارة"],["ceo","مراجعة الرئيس التنفيذي"],["strategy","الاستراتيجية"],["performance","الأداء المالي"],["risks","المخاطر الرئيسية"],["viability","الجدوى والاستمرارية"],["esg","الاستدامة"],["outlook","النظرة المستقبلية"]]],
    ["الحوكمة",[["committee","تقرير لجنة المراجعة"],["directors","إقرار مسؤوليات المجلس"]]],
    ["القوائم المالية",[["auditor","تقرير المراجع المستقل"],["fs","القوائم المالية"],["notes","الإيضاحات المتممة"],["peers","المقارنة العالمية"],["quality","ملحق: المطابقة للتقارير العالمية"]]]];
  const kamsForAuditor=n.kams.map(k=>({title:k.title,description:k.matter,how:"شملت إجراءاتنا، من بين أمور أخرى: "+k.procedures.join("؛ ")+(k.disclosure?"؛ "+k.disclosure:"")}));
  return '<article class="rd-doc ir">'+
    '<header class="ir-cover"><div class="ir-cv-top"><small>التقرير السنوي المتكامل '+esc(year)+'</small></div><h1>'+esc(ctx.company||"[اسم المنشأة]")+'</h1><p>'+esc(ctx.period||"")+'</p>'+
      '<div class="ir-cv-kpi">'+x.pack.facts.filter(z=>["revenue","profit","fcf"].includes(z.key)&&z.value!==null).map(z=>'<div><small>'+esc(z.ar)+'</small><b>'+esc(z.text)+'</b>'+chg(z.change)+'</div>').join("")+'</div>'+
      '<i>'+esc(x.pack.framework)+' · مسودة للمراجعة قبل الإصدار · أُعدت بمنصة SQC — Smart Quality Control</i></header>'+
    '<nav class="ir-toc"><h3>المحتويات</h3><div>'+toc.map(([g,items])=>'<div><b>'+esc(g)+'</b><ol>'+items.map(([id,t])=>'<li><a href="#ir-'+id+'">'+esc(t)+'</a></li>').join("")+'</ol></div>').join("")+'</div></nav>'+
    '<h2 class="ir-part">التقرير الاستراتيجي</h2>'+
    sec("glance","نظرة عامة","العام في لمحة",glance(x)+(fig.compare?'<div class="rd-fig">'+fig.compare+'</div>':''))+
    sec("chair","رسالة إلى المساهمين",n.chairLetter.title||"رسالة رئيس مجلس الإدارة",letter(x.narr,"chairLetter","رئيس مجلس الإدارة"))+
    sec("ceo","مراجعة الأداء",n.ceoReview.title||"مراجعة الرئيس التنفيذي",letter(x.narr,"ceoReview","الرئيس التنفيذي")+
      (n.ceoReview.kpiCommentary.length?'<div class="ir-kc">'+n.ceoReview.kpiCommentary.map(k=>'<div><b>'+esc(k.kpi)+'</b><p>'+esc(k.comment)+'</p></div>').join("")+'</div>':''))+
    sec("strategy","الاستراتيجية","محاورنا الاستراتيجية",badge(x.narr,"strategy")+'<div class="ir-pillars">'+n.strategy.pillars.map((p,i)=>'<div><span>'+(i+1)+'</span><b>'+esc(p.title)+'</b><p>'+esc(p.text)+'</p></div>').join("")+'</div>')+
    sec("performance","المراجعة المالية","الأداء المالي والسيولة",badge(x.narr,"performanceReview")+P(n.performanceReview.paragraphs)+(fig.bridge?'<div class="rd-fig"><h5>من الإيرادات إلى صافي الربح ('+esc(cur)+')</h5>'+fig.bridge+'</div>':'')+
      (fig.opex?'<div class="rd-fig">'+fig.opex+'</div>':'')+'<h4>السيولة ومصادر التمويل</h4>'+P(n.liquidity.paragraphs)+
      (x.notesPkg&&x.notesPkg.supplementary?(x.notesPkg.supplementary.filter(s=>s.key==="capital").map(s=>s.tables.map(t=>'<div class="rd-nt"><h5>'+esc(t.title)+'</h5>'+tbl(t,cur)+(t.note?'<p class="rd-note">'+esc(t.note)+'</p>':'')+'</div>').join("")).join("")):''))+
    sec("risks","إدارة المخاطر","المخاطر الرئيسية",risks(x.narr))+
    sec("viability","الجدوى","بيان الجدوى والاستمرارية",viability(x.narr))+
    sec("esg","المسؤولية","الاستدامة",badge(x.narr,"sustainability")+P(n.sustainability.paragraphs))+
    sec("outlook","المستقبل","النظرة المستقبلية",badge(x.narr,"outlook")+P(n.outlook.paragraphs)+'<p class="rd-note">تتضمن هذه الفقرة عبارات تطلعية تخضع لمخاطر وعدم تأكد، وقد تختلف النتائج الفعلية.</p>')+
    '<h2 class="ir-part">الحوكمة</h2>'+
    sec("committee","الحوكمة","تقرير لجنة المراجعة",committee(x.narr))+
    sec("directors","الحوكمة","إقرار مسؤوليات أعضاء مجلس الإدارة",badge(x.narr,"directorsResponsibilities")+P(n.directorsResponsibilities.paragraphs)+'<footer class="ir-signoff"><b>[الاسم]</b><span>رئيس مجلس الإدارة</span></footer>')+
    '<h2 class="ir-part">القوائم المالية</h2>'+
    sec("auditor","تقرير المراجع","تقرير المراجع المستقل",badge(x.narr,"kams")+rd.auditor({...x,kams:kamsForAuditor})+'<h4>الأمور الرئيسية للمراجعة — عرض بعمودين</h4>'+kamsTable(x.narr),"ir-audit")+
    sec("fs","القوائم","القوائم المالية",'<h4>قائمة الربح أو الخسارة</h4>'+rd.stmt(fs.pl,hp,cur)+'<h4>قائمة المركز المالي</h4>'+rd.stmt(fs.sfp,hp,cur)+(fs.cf?'<h4>قائمة التدفقات النقدية</h4>'+rd.stmt(fs.cf,false,cur):''))+
    sec("notes","الإيضاحات","الإيضاحات المتممة",rd.notes(x))+
    sec("peers","التحليل","المقارنة بالنظراء العالميين",rd.peers(x))+
    sec("quality","ملحق","المطابقة للتقارير العالمية",appendix(x))+
  '</article>';
}
function tbl(t,cur){
  const m0=v=>v===null||v===undefined?"—":SKEngines.reports.money.formatMinor(v,{decimals:0});
  return '<table class="rd-t"><thead><tr>'+t.columns.map((c,i)=>'<th>'+esc(c)+(i===0?' <small>('+esc(cur)+')</small>':'')+'</th>').join("")+'</tr></thead><tbody>'+t.rows.map(r=>'<tr class="'+(r.level==="total"?"tot":r.level==="subtotal"?"sub":"")+'"><td>'+esc(r.ar)+'</td>'+r.values.map(v=>'<td class="n">'+m0(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table>';
}

const CSS=`
.ir{--ir-navy:#0b1030;--ir-blue:#2340c4;--ir-sky:#7cc4ff;--ir-ink:#12173a;--ir-soft:#f3f7fc}
.ir-cover{position:relative;overflow:hidden;min-height:420px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;padding:48px 44px 36px;margin-bottom:26px;border-radius:18px;color:#fff;
  background:radial-gradient(120% 90% at 85% 0%,rgba(124,196,255,.35),transparent 60%),linear-gradient(150deg,#07142a 0%,#1a2a8f 55%,#1557d6 100%)}
.ir-cover::before{content:"";position:absolute;inset:-40% -20% auto auto;width:520px;height:520px;border-radius:50%;border:60px solid rgba(255,255,255,.05)}
.ir-cover::after{content:"";position:absolute;inset:auto auto -160px -120px;width:380px;height:380px;border-radius:50%;border:40px solid rgba(124,196,255,.08)}
.ir-cv-top{position:absolute;top:28px;inset-inline-start:44px}.ir-cv-top small{letter-spacing:.18em;font-weight:700;color:var(--ir-sky)}
.ir-cover h1{margin:0;color:#fff!important;font-size:40px;line-height:1.25;max-width:80%}.ir-cover p{margin:0 0 12px;opacity:.85;font-size:15px}
.ir-cv-kpi{position:relative;display:flex;flex-wrap:wrap;gap:26px;margin:10px 0 18px}.ir-cv-kpi div{display:grid}.ir-cv-kpi small{opacity:.75;font-size:11.5px}.ir-cv-kpi b{font-size:22px}.ir-cv-kpi em{font-style:normal;font-size:12px}
.ir-cover .pos{color:#86efac}.ir-cover .neg{color:#fca5a5}.ir-cover i{position:relative;font-size:11.5px;opacity:.7}
.ir-toc{padding:20px 24px;border:1px solid #dfe6ef;border-radius:14px;margin-bottom:26px;background:var(--ir-soft)}.ir-toc h3{margin:0 0 10px}
.ir-toc>div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.ir-toc b{color:var(--ir-blue);font-size:13px}.ir-toc ol{margin:6px 0 0;padding-inline-start:18px;display:grid;gap:3px}.ir-toc a{color:var(--ir-ink);text-decoration:none}
.ir-part{margin:34px 0 8px;padding:14px 18px;border-radius:12px;color:#fff!important;background:linear-gradient(120deg,var(--ir-navy),var(--ir-blue));font-size:20px}
.ir-sec{margin:22px 0 30px}.ir-sh{margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--ir-navy)}.ir-sh small{color:var(--ir-blue);font-weight:700;letter-spacing:.08em;font-size:11.5px}.ir-sh h2{margin:2px 0 0;font-size:22px}
.ir-ai{display:inline-block;margin:0 0 8px;padding:2px 10px;border-radius:999px;background:#eef5ff;color:#1557d6;font-size:11px;font-weight:700;border:1px solid #cfe2ff}
.ir-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:6px 0 16px}
.ir-kpi{padding:14px 16px;border-radius:12px;border:1px solid #e3e9f2;background:#fff;box-shadow:0 1px 0 rgba(11,16,48,.04)}.ir-kpi small{display:block;color:#5b6b82;font-size:11.5px}.ir-kpi b{display:block;margin:4px 0;font-size:19px;color:var(--ir-navy)}.ir-kpi span{font-size:11px;color:#6a7a92}
.ir-kpi em,.ir-kc em{font-style:normal;font-weight:700}.ir .pos{color:#15803d}.ir .neg{color:#b91c1c}
.ir-letter{position:relative;padding:4px 0}.ir-cols{columns:2;column-gap:32px}.ir-cols p{margin:0 0 10px;break-inside:avoid-column}.ir-cols p:first-child{font-weight:700}
.ir-cols p:nth-child(2)::first-letter{float:right;font-size:44px;line-height:1;padding-inline-end:8px;color:var(--ir-blue);font-weight:800}
.ir-signoff{display:grid;gap:2px;margin-top:14px;padding-top:10px;border-top:1px solid #dfe6ef;max-width:260px}.ir-signoff span{color:#6a7a92;font-size:12px}
.ir-kc{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:14px}.ir-kc div{padding:12px 14px;border-inline-start:3px solid var(--ir-blue);background:var(--ir-soft);border-radius:8px}.ir-kc b{color:var(--ir-navy)}.ir-kc p{margin:4px 0 0;font-size:12.5px}
.ir-pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.ir-pillars div{padding:16px;border-radius:12px;background:linear-gradient(160deg,#f7faff,#eef4fd);border:1px solid #dde7f5}
.ir-pillars span{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--ir-blue);color:#fff;font-weight:800;margin-bottom:6px}.ir-pillars b{display:block;color:var(--ir-navy)}.ir-pillars p{margin:6px 0 0;font-size:12.5px}
.ir-lead{font-size:14px;color:#34455e}
.ir-rt{width:100%;border-collapse:collapse;margin:8px 0 14px;font-size:12.5px}.ir-rt th{background:var(--ir-navy)!important;color:#fff!important;text-align:start;padding:8px 10px;font-weight:700}
.ir-rt td{padding:9px 10px;border-bottom:1px solid #e7ecf3;vertical-align:top}.ir-rt td small{display:block;color:#6a7a92;font-size:11px;margin-top:2px}.ir-rt tr:nth-child(even) td{background:#fafcff}
.ir-trend{display:inline-block;padding:2px 10px;border-radius:999px;font-weight:700;white-space:nowrap}.ir-trend.up{background:#fdecec;color:#b91c1c}.ir-trend.flat{background:#eef2f7;color:#34455e}.ir-trend.down{background:#e8f6ee;color:#15803d}
.ir-vb{display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:start}.ir-vp{padding:16px;border-radius:12px;background:var(--ir-navy);color:#fff;text-align:center}.ir-vp small{opacity:.75}.ir-vp b{display:block;font-size:20px}
.ir-steps{margin:0;padding-inline-start:20px;display:grid;gap:6px}.ir-conc{padding:12px 14px;border-radius:10px;background:#e8f6ee;color:#14532d;font-weight:600}
.ir-kams{display:grid;gap:12px}.ir-kam{border:1px solid #dfe6ef;border-radius:12px;overflow:hidden}.ir-kam h5{display:flex;gap:10px;align-items:center;margin:0;padding:10px 14px;background:var(--ir-soft)}
.ir-kam h5 span{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:6px;background:var(--ir-navy);color:#fff;font-size:12px}
.ir-kg{display:grid;grid-template-columns:1fr 1fr}.ir-kg>div{padding:12px 14px}.ir-kg>div+div{border-inline-start:1px solid #e7ecf3}.ir-kg small{color:var(--ir-blue);font-weight:700}.ir-kg ul{margin:6px 0 0;padding-inline-start:18px;display:grid;gap:4px}
.ir-compat{margin:18px 0;border:1px solid #dfe6ef;border-radius:12px;background:#fff;overflow:hidden}.ir-compat summary{cursor:pointer;padding:12px 14px;display:flex;justify-content:space-between;gap:12px;background:var(--ir-soft);color:var(--ir-navy)}.ir-compat summary span{font-size:11px;color:#5b6b82}.ir-compat>p{margin:10px 14px}.ir-compat-wrap{max-height:520px;overflow:auto;border-top:1px solid #e7ecf3}.ir-compat-t{margin:0}.ir-compat-t td:first-child{min-width:210px}.ir-compat-t td:last-child{min-width:260px}.ir-compat-t td small{display:block}\n.ir-q{display:grid;grid-template-columns:150px 1fr;gap:18px;align-items:center;margin-bottom:10px}.ir-qs{display:grid;place-items:center;aspect-ratio:1;border-radius:50%;background:conic-gradient(var(--ir-blue) 0 100%,#e3e9f2 0);color:var(--ir-navy);text-align:center;padding:14px;border:10px solid #e3e9f2}
.ir-qs b{font-size:30px}.ir-qs small{font-size:10.5px;line-height:1.3}.ir-src{color:#34455e;font-weight:600}.ir-warn{padding:10px 14px;border-radius:10px;background:#fff4e5;color:#92400e}
.ir-qt td:nth-child(2){white-space:nowrap;font-weight:700}
.ir-bp{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.ir-bp ol{margin:6px 0 0;padding-inline-start:18px;font-size:12px;display:grid;gap:2px}.ir-bp small{color:#6a7a92}
.ir-audit .rd-doc{font-size:13px}
@media (max-width:760px){.ir-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.ir-cols{columns:1}.ir-toc>div,.ir-bp{grid-template-columns:1fr}.ir-kg,.ir-vb,.ir-q{grid-template-columns:1fr}.ir-kg>div+div{border-inline-start:0;border-top:1px solid #e7ecf3}
  .ir-cover{padding:36px 22px 26px;min-height:360px}.ir-cover h1{font-size:28px;max-width:100%}.ir-cv-top{inset-inline-start:22px}.ir-rt{display:block;overflow-x:auto}}
@media print{.ir-cover{min-height:250mm;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}.ir-toc{page-break-after:always}
  .ir-part{page-break-before:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}.ir-rt th,.ir-vp,.ir-kam h5 span,.ir-pillars span{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .ir-sec{page-break-inside:auto}.ir-kpi,.ir-kam,.ir-pillars div,.ir-rt tr{page-break-inside:avoid}.ir-ai{display:none}}
`;
window.SKosifIntegrated=Object.freeze({render,CSS});
})();

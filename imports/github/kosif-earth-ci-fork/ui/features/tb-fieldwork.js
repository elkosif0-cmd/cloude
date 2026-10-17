/* S.kosif — التخطيط والعمل الميداني والإكمال داخل «ملف المراجعة» (window.SKosifFieldwork).
   العمود الفقري المهني للمراجعة، مبني على نتائج المحرك في الملف نفسه (SKEngines.audit.fieldwork):
   • التخطيط (ISA 300 / 315): الأهمية النسبية ومقارنتها بالممارسة العالمية، مصفوفة المخاطر × التأكيدات، الاستراتيجية.
   • أوراق العمل (ISA 330 / 230): ورقة لكل مجال بمرجعها (A النقد … T الزكاة)، إجراءاتها — وللخطر الجوهري ما نفذه
     مراجعو الشركات العالمية في الموضوع نفسه بصفحته من حزمة البحث — حجم العينة (ISA 530)، الاستنتاج، وتوقيع المُعد
     ثم مراجِع مختلف (فصل المهام).
   • الجداول الرئيسية (Lead schedules): قبل التسويات، التسويات المعتمدة، بعدها — لكل حساب.
   • الإكمال (ISA 450 / 560 / 570 / 580 / 220): بوابة لا يكتمل التقرير قبل استيفائها، وخطاب الإقرارات.
   كل مستند يفتح في المعاينة داخل التطبيق قبل الطباعة أو التصدير (PDF · Word · Excel · HTML).
   البيانات: skosif_tbreview_v1.field = {so:{[ref]:{done,conclusion,preparer,preparedAt,reviewer,reviewedAt}}, conf:{[id]:bool}} */
(()=>{
"use strict";
const {esc,toast}=SK;
const F=()=>SKEngines.audit.fieldwork,G=()=>SKEngines.audit.globalBenchmarks;
let api=null;
const m0=v=>SKEngines.reports.money.formatMinor(v||0,{decimals:0});
const field=d=>{const f=d.field||{};return{so:f.so||{},conf:f.conf||{}}};
const RISK={high:["مرتفع","bad"],moderate:["متوسط","warn"],low:["منخفض","ok"]};
const ST={"not-started":["لم يبدأ",""],"in-progress":["قيد التنفيذ","warn"],prepared:["أعده المُعد — بانتظار المراجِع","info"],reviewed:["رُوجع ووُقّع","ok"]};
const SRC={line:"",analytical:"تحليلي",fraud:"غش ISA 240",global:"ممارسة عالمية"};

function model(c){
  const act=c.d.ctx.activity||"",wps=F().workingPapers(c.base,{activity:act}),fd=field(c.d);
  const uncorrected=c.pool.filter(a=>!c.d.accepted.includes(a.id));
  // Initial requests remain outstanding before any council round. A missing session is not evidence of completion.
  const rounds=c.session?c.session.rounds:[],requests=new Map();
  [...c.base.requests,...rounds.flatMap(r=>r.requests||[])].forEach(q=>{if(q.priority==="عالية")requests.set(q.id,q)});
  const highOpenRequests=[...requests.keys()].filter(id=>{
    const reviews=rounds.flatMap(r=>r.reviewed||[]).filter(r=>r.requestId===id);
    return !reviews.length||reviews[reviews.length-1].verdict!=="مقبول";
  }).length;
  const done=F().completion({papers:wps,signoffs:fd.so,uncorrected:c.derived.misstatement,materiality:c.base.materiality.overall,goingConcernIssue:c.derived.goingConcern,
    confirmations:fd.conf,kamsDrafted:true,highOpenRequests});
  return {wps,fd,matrix:F().riskMatrix(c.base,{activity:act}),lead:F().leadSchedules(c.tb,c.accepted,c.d.overrides),uncorrected,done,act};
}
const bar=p=>'<span class="fw-bar"><i style="width:'+p+'%"></i></span>';
const docBtn=(k,l)=>'<button type="button" class="btn sm" data-fw-doc="'+k+'">'+SK.icon("reports")+' '+esc(l)+'</button>';

/* ---------- the planning & fieldwork tab ---------- */
function planTab(c){
  const M=model(c),m=c.base.materiality,rate=m.base?m.overall/m.base:m.rate;
  const chk=G().checkMateriality({benchmark:m.benchmark,rate,performanceRate:m.performance/m.overall,trivialRate:m.trivial/m.overall});
  const reviewed=M.wps.filter(w=>F().wpStatus(w,M.fd.so[w.ref]).status==="reviewed").length,sig=M.matrix.filter(r=>r.significant).length;
  const tile=(ic,l,v,s)=>'<div class="skk4-t"><span class="chip">'+SK.icon(ic)+'</span><span class="tx"><span>'+l+'</span><b>'+v+'</b><small>'+s+'</small></span></div>';
  return '<div class="skk4">'+tile("calc","الأهمية النسبية",m0(m.overall),'التنفيذية '+m0(m.performance)+' · الضآلة '+m0(m.trivial))+tile("risks","المخاطر الجوهرية",sig,M.matrix.length+' بنداً بأرصدة')+
      tile("auditdocs","أوراق العمل",M.wps.length,reviewed+' موقعة من المراجِع')+tile("check","جاهزية الإكمال",M.done.pct+'%',M.done.open?M.done.open+' بنداً مفتوحاً':'جاهز للتوقيع')+'</div>'+
    '<section class="card"><div class="card-h"><div><h3>استراتيجية المراجعة (ISA 300)</h3><p>'+esc(c.d.ctx.company||"المنشأة")+' — '+esc(c.d.ctx.activity||"النشاط غير محدد")+'. الأهمية على '+esc(m.benchmarkAr)+' بنسبة '+(Math.round(rate*1000)/10)+'%.</p></div><div class="sk-actions">'+docBtn("plan","مذكرة التخطيط")+'</div></div><div class="card-b">'+
      '<div class="fw-chk">'+chk.map(x=>'<span class="sksev '+(x.status==="within"?"ok":x.status==="no-precedent"?"info":"warn")+'">'+esc(x.label)+': '+(Math.round(x.value*1000)/10)+'% — '+(x.status==="within"?"ضمن الممارسة العالمية":x.status==="no-precedent"?"لا سابقة مفصح عنها":"خارج الممارسة")+'</span>').join("")+'</div>'+
      '<div class="sk-table-wrap"><table class="sk-table fw-mx" data-sk-plain><thead><tr><th>المرجع</th><th>البند</th><th>الرصيد</th><th>التأكيدات</th><th>الخطر</th><th>غش/تقدير</th><th>الاستجابة المخططة</th><th>الموضوع العالمي</th></tr></thead><tbody>'+
      M.matrix.map(r=>'<tr'+(r.significant?' class="fw-sig"':'')+'><td class="mono">'+esc(r.ref)+'</td><td><b>'+esc(r.ar)+'</b></td><td class="num">'+m0(r.amount)+'</td><td><small>'+esc(r.assertions.join("، "))+'</small></td><td><span class="sksev '+(r.significant?"bad":r.level==="متوسط"?"warn":"ok")+'">'+(r.significant?"جوهري":esc(r.level))+' · '+r.score+'</span></td><td>'+(r.fraud?'<span class="sksev bad">غش</span> ':'')+(r.estimate?'<span class="sksev info">تقدير</span>':'')+'</td><td><small>'+esc(r.approach)+'</small></td><td><small>'+esc(r.theme||"—")+'</small></td></tr>').join("")+'</tbody></table></div></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>أوراق العمل (ISA 330 / 230)</h3><p>أكمل الإجراءات، اكتب الاستنتاج، ثم يوقّع المُعد ويراجع شخص آخر. الإجراءات الموسومة «ممارسة عالمية» نفذها مراجعو الشركات في حزمة البحث للموضوع نفسه.</p></div><div class="sk-actions">'+docBtn("wps","ملف أوراق العمل")+docBtn("lead","الجداول الرئيسية")+'</div></div><div class="card-b fw-wps">'+
      M.wps.map(w=>wpCard(w,M.fd.so[w.ref]||{})).join("")+'</div></section>';
}
function wpCard(w,s){
  const st=F().wpStatus(w,s),[stl,stc]=ST[st.status],done=new Set(s.done||[]),locked=st.status==="reviewed";
  return '<details class="fw-wp"'+(st.status!=="reviewed"&&w.significant?' open':'')+'><summary><span class="fw-ref">'+esc(w.ref)+'</span><span class="fw-tt"><b>'+esc(w.area)+'</b><small>'+m0(w.amount)+' · '+st.done+'/'+st.total+' إجراء</small></span>'+bar(st.pct)+
      '<span class="sksev '+RISK[w.risk][1]+'">خطر '+RISK[w.risk][0]+'</span><span class="sksev '+stc+'">'+stl+'</span></summary><div class="fw-wp-b">'+
    '<p class="fw-obj"><b>الهدف:</b> '+esc(w.objective)+'</p>'+
    '<p class="fw-smp"><b>'+(w.sample.confidence===100?'الاختبار':'العينة (ISA 530)')+':</b> '+(w.sample.n===null?esc(w.sample.note):w.sample.n+' مفردة من مجتمع '+m0(w.amount)+(w.sample.interval?' · الفترة '+m0(w.sample.interval):'')+' · '+esc(w.sample.note))+'</p>'+
    '<ol class="fw-steps">'+w.steps.map(x=>'<li><label><input type="checkbox" data-fw-step="'+esc(w.ref)+'" value="'+esc(x.id)+'"'+(done.has(x.id)?' checked':'')+(locked?' disabled':'')+'><span class="mono">'+esc(x.id)+'</span> '+esc(x.text)+
      (SRC[x.source]?' <em class="fw-src '+x.source+'">'+SRC[x.source]+'</em>':'')+(x.cite?'<small class="fw-cite">'+esc(x.theme)+' — '+esc(x.cite)+'</small>':'')+'</label></li>').join("")+'</ol>'+
    (w.precedents.length?'<details class="fw-prec"><summary>كيف صاغ مراجعو الشركات العالمية أموراً مشابهة ('+w.precedents.length+')</summary><ul>'+w.precedents.map(p=>'<li><b dir="ltr">'+esc(p.title)+'</b><small>'+esc(p.company)+' · ص '+p.page+'</small></li>').join("")+'</ul></details>':'')+
    '<label class="sk-field"><span>الاستنتاج</span><textarea rows="2" data-fw-conc="'+esc(w.ref)+'"'+(locked?' disabled':'')+' placeholder="مثال: حصلنا على أدلة كافية ومناسبة بأن الرصيد عادل من جميع الجوانب الجوهرية.">'+esc(s.conclusion||"")+'</textarea></label>'+
    '<div class="fw-sign"><div><small>المُعد</small>'+(s.preparer?'<b>'+esc(s.preparer)+'</b><small>'+esc((s.preparedAt||"").slice(0,10))+'</small>':'<span class="fw-in"><input data-fw-name="p-'+esc(w.ref)+'" placeholder="الاسم"><button type="button" class="btn sm primary" data-fw-sign="preparer" data-ref="'+esc(w.ref)+'">توقيع الإعداد</button></span>')+'</div>'+
      '<div><small>المراجِع</small>'+(s.reviewer?'<b>'+esc(s.reviewer)+'</b><small>'+esc((s.reviewedAt||"").slice(0,10))+'</small>':'<span class="fw-in"><input data-fw-name="r-'+esc(w.ref)+'" placeholder="اسم غير المُعد"><button type="button" class="btn sm" data-fw-sign="reviewer" data-ref="'+esc(w.ref)+'"'+(s.preparer?'':' disabled')+'>توقيع المراجعة</button></span>')+'</div>'+
      (s.preparer?'<button type="button" class="btn sm ghost" data-fw-reopen="'+esc(w.ref)+'">إعادة فتح</button>':'')+'</div></div></details>';
}

/* ---------- the completion tab ---------- */
function closeTab(c){
  const M=model(c),m=c.base.materiality;
  return '<section class="card fw-gate '+(M.done.ready?"ok":"")+'"><div class="card-h"><div><h3>بوابة الإكمال</h3><p>'+(M.done.ready?'اكتملت متطلبات الإكمال — يمكن للشريك اعتماد التقرير.':'لا يوقّع التقرير قبل استيفاء '+M.done.open+' بنداً.')+'</p></div>'+bar(M.done.pct)+'</div><div class="card-b">'+
      '<div class="fw-items">'+M.done.items.map(x=>'<label class="fw-item '+(x.ok?"ok":"")+'"><i>'+(x.ok?"✓":"!")+'</i><span><b>'+esc(x.ar)+'</b><small>'+esc(x.isa)+(x.auto?' · يُحتسب من الملف':' · تأكيد بشري')+'</small></span>'+
        (x.auto?'':'<input type="checkbox" data-fw-conf="'+esc(x.id)+'"'+(M.fd.conf[x.id]?' checked':'')+' aria-label="تأكيد">')+'</label>').join("")+
        (c.derived.goingConcern?'<label class="fw-item '+(M.fd.conf.goingConcernDisclosed?"ok":"")+'"><i>!</i><span><b>أُفصح عن عدم التأكد الجوهري المتعلق بالاستمرارية</b><small>ISA 570.22 · تأكيد بشري</small></span><input type="checkbox" data-fw-conf="goingConcernDisclosed"'+(M.fd.conf.goingConcernDisclosed?' checked':'')+'></label>':'')+'</div>'+
      '<div class="sk-actions">'+docBtn("completion","مذكرة الإكمال")+docBtn("reps","خطاب الإقرارات")+docBtn("plan","مذكرة التخطيط")+docBtn("wps","ملف أوراق العمل")+docBtn("lead","الجداول الرئيسية")+'</div></div></section>'+
    '<section class="card"><div class="card-h"><div><h3>ملخص التحريفات غير المصححة (ISA 450)</h3><p>أثرها المجمع '+m0(c.derived.misstatement)+' مقابل أهمية نسبية '+m0(m.overall)+' وحد ضآلة '+m0(m.trivial)+'.</p></div></div><div class="card-b">'+
      (M.uncorrected.length?'<div class="sk-table-wrap"><table class="sk-table" data-sk-plain><thead><tr><th>القيد</th><th>البيان</th><th>المعيار</th><th>المبلغ</th><th>مقارنة بالأهمية</th></tr></thead><tbody>'+
        M.uncorrected.map(a=>{const amt=a.lines.reduce((t,l)=>t+l.debit,0);return '<tr><td class="mono">'+esc(a.id)+'</td><td>'+esc(a.title)+'</td><td>'+esc(a.standard)+'</td><td class="num">'+m0(amt)+'</td><td><span class="sksev '+(amt>m.overall?"bad":amt>m.trivial?"warn":"ok")+'">'+(amt>m.overall?"جوهري":amt>m.trivial?"فوق حد الضآلة":"ضئيل")+'</span></td></tr>'}).join("")+'</tbody></table></div>'
        :'<p class="empty">لا تحريفات غير مصححة ضمن قيود ملف المراجعة الرئيسي. قيود الاستوديو الثانوي لها سجل مستقل.</p>')+'</div></section>';
}

/* ---------- documents (opened in the in-app preview) ---------- */
const H=(t,sub)=>'<header class="rd-h"><small>'+esc(sub||"ملف المراجعة")+'</small><h2>'+esc(t)+'</h2></header>';
const who=x=>esc(x.c.d.ctx.company||"[المنشأة]")+' — '+esc(x.c.d.ctx.period||"[الفترة]");
function planDoc(x){
  const c=x.c,M=model(c),m=c.base.materiality,rate=m.base?m.overall/m.base:m.rate;
  return '<article class="rd-doc">'+H("مذكرة التخطيط واستراتيجية المراجعة","ISA 300 / 315 / 320")+'<p>'+who(x)+'</p>'+
    '<h4>1. الأهمية النسبية</h4><table class="rd-t sm"><tbody><tr><td>الأهمية العامة</td><td class="n">'+m0(m.overall)+'</td></tr><tr><td>الأساس</td><td>'+esc(m.benchmarkAr)+' '+(Math.round(rate*1000)/10)+'%</td></tr><tr><td>التنفيذية</td><td class="n">'+m0(m.performance)+'</td></tr><tr><td>حد الضآلة</td><td class="n">'+m0(m.trivial)+'</td></tr></tbody></table>'+
    '<p class="rd-note">'+G().checkMateriality({benchmark:m.benchmark,rate,performanceRate:m.performance/m.overall,trivialRate:m.trivial/m.overall}).map(k=>esc(k.label)+': '+esc(k.observed)).join(" · ")+'</p>'+
    '<h4>2. مصفوفة المخاطر والتأكيدات</h4><table class="rd-t"><thead><tr><th>المرجع</th><th>البند</th><th>الرصيد</th><th>الخطر</th><th>الاستجابة</th></tr></thead><tbody>'+
      M.matrix.map(r=>'<tr><td>'+esc(r.ref)+'</td><td>'+esc(r.ar)+(r.fraud?' (غش مفترض)':'')+'</td><td class="n">'+m0(r.amount)+'</td><td>'+(r.significant?'جوهري':esc(r.level))+' ('+r.score+')</td><td>'+esc(r.approach)+'</td></tr>').join("")+'</tbody></table>'+
    '<h4>3. أوراق العمل المخططة</h4><table class="rd-t"><thead><tr><th>المرجع</th><th>المجال</th><th>الإجراءات</th><th>العينة</th></tr></thead><tbody>'+
      M.wps.map(w=>'<tr><td>'+esc(w.ref)+'</td><td>'+esc(w.area)+'</td><td class="n">'+w.steps.length+'</td><td class="n">'+(w.sample.n??"—")+'</td></tr>').join("")+'</tbody></table>'+
    '<h4>4. الفريق والتوقيت</h4><p>الشريك المسؤول: '+esc(c.d.ctx.auditPartner||"[الاسم]")+' · مكتب المراجعة: '+esc(c.d.ctx.auditFirm||"[المكتب]")+' · الجدول الزمني: [التخطيط] ← [العمل الميداني] ← [الإكمال] ← [التقرير]</p></article>';
}
function wpsDoc(x){
  const M=model(x.c);
  return '<article class="rd-doc">'+H("ملف أوراق العمل","ISA 230")+'<p>'+who(x)+'</p>'+M.wps.map(w=>{const s=M.fd.so[w.ref]||{},done=new Set(s.done||[]),st=F().wpStatus(w,s);
    return '<section class="rd-sec"><h4>'+esc(w.ref)+' — '+esc(w.area)+' <small>('+esc(ST[st.status][0])+')</small></h4><p>'+esc(w.objective)+'</p><p class="rd-note">العينة: '+(w.sample.n??"—")+' · '+esc(w.sample.note)+'</p>'+
      '<table class="rd-t"><thead><tr><th>الرقم</th><th>الإجراء</th><th>المصدر</th><th>منجز</th></tr></thead><tbody>'+w.steps.map(p=>'<tr><td>'+esc(p.id)+'</td><td>'+esc(p.text)+(p.cite?'<br><small>'+esc(p.cite)+'</small>':'')+'</td><td>'+esc(SRC[p.source]||"البند")+'</td><td>'+(done.has(p.id)?"✓":"—")+'</td></tr>').join("")+'</tbody></table>'+
      '<p><b>الاستنتاج:</b> '+esc(s.conclusion||"[لم يُكتب]")+'</p><p class="rd-note">المُعد: '+esc(s.preparer||"—")+' '+esc((s.preparedAt||"").slice(0,10))+' · المراجِع: '+esc(s.reviewer||"—")+' '+esc((s.reviewedAt||"").slice(0,10))+'</p></section>'}).join("")+'</article>';
}
function leadDoc(x){
  const M=model(x.c),hp=x.c.fsBefore.hasPrior;
  return '<article class="rd-doc">'+H("الجداول الرئيسية (Lead schedules)","قبل التسويات · التسويات المعتمدة · بعدها")+'<p>'+who(x)+'</p>'+M.lead.map(l=>'<h4>'+esc(l.ref)+' — '+esc(l.area)+'</h4><table class="rd-t"><thead><tr><th>الحساب</th>'+(hp?'<th>السابقة</th>':'')+'<th>قبل التسويات</th><th>التسويات</th><th>النهائي</th></tr></thead><tbody>'+
    l.rows.map(r=>'<tr><td>'+esc(r.code)+' '+esc(r.name)+'</td>'+(hp?'<td class="n">'+(r.prior===null?"—":m0(r.prior))+'</td>':'')+'<td class="n">'+m0(r.unadjusted)+'</td><td class="n">'+(r.adjustments?m0(r.adjustments):"—")+'</td><td class="n">'+m0(r.final)+'</td></tr>').join("")+
    '<tr class="tot"><td>المجموع</td>'+(hp?'<td class="n">'+(l.totals.prior===null?"—":m0(l.totals.prior))+'</td>':'')+'<td class="n">'+m0(l.totals.unadjusted)+'</td><td class="n">'+m0(l.totals.adjustments)+'</td><td class="n">'+m0(l.totals.final)+'</td></tr></tbody></table>').join("")+'</article>';
}
function completionDoc(x){
  const c=x.c,M=model(c);
  return '<article class="rd-doc">'+H("مذكرة الإكمال","ISA 220 / 450 / 560 / 570 / 580")+'<p>'+who(x)+'</p>'+
    '<table class="rd-t"><thead><tr><th>البند</th><th>المعيار</th><th>الحالة</th></tr></thead><tbody>'+M.done.items.map(i=>'<tr><td>'+esc(i.ar)+'</td><td>'+esc(i.isa)+'</td><td>'+(i.ok?"مستوفى":"مفتوح")+'</td></tr>').join("")+'</tbody></table>'+
    '<h4>الرأي المشتق</h4><p><b>'+esc(c.derived.ar)+'</b> ('+esc(c.derived.isa)+')</p>'+c.derived.basis.map(b=>'<p>'+esc(b)+'</p>').join("")+
    '<p class="rd-note">'+(M.done.ready?'اكتملت متطلبات الإكمال.':'لم تكتمل متطلبات الإكمال؛ لا يوقّع التقرير قبل استيفائها.')+'</p><footer class="rd-sign"><div><b>الشريك المسؤول</b><span>'+esc(c.d.ctx.auditPartner||"[الاسم]")+'</span></div><div><span>[التاريخ]</span></div></footer></article>';
}
function repsDoc(x){
  const c=x.c,M=model(c),L=F().representationLetter({company:c.d.ctx.company,auditFirm:c.d.ctx.auditFirm,periodEnd:x.periodEnd,framework:c.fw,currency:x.cur,
    uncorrected:M.uncorrected.map(a=>({title:a.title,amount:a.lines.reduce((t,l)=>t+l.debit,0)}))});
  return '<article class="rd-doc">'+H(L.title,"ISA 580 — على ورق المنشأة")+'<p>'+esc(L.to)+'</p>'+L.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join("")+
    '<footer class="rd-sign">'+L.signatures.map(s=>'<div><b>'+esc(s)+'</b><span>[الاسم والتوقيع]</span></div>').join("")+'<div><span>التاريخ: [تاريخ تقرير المراجع]</span></div></footer></article>';
}
const DOCS={plan:[planDoc,"مذكرة التخطيط"],wps:[wpsDoc,"ملف أوراق العمل"],lead:[leadDoc,"الجداول الرئيسية"],completion:[completionDoc,"مذكرة الإكمال"],reps:[repsDoc,"خطاب الإقرارات"]};

/* ---------- events (called by tb-review before its own handlers) ---------- */
function save(mut){const d=api.st(),f=field(d);mut(f);d.field=f;api.put(d)}
function onClick(e,c){
  const dk=e.target.closest("[data-fw-doc]");if(dk){api.print(dk.dataset.fwDoc);return true}
  const sg=e.target.closest("[data-fw-sign]");if(sg){const ref=sg.dataset.ref,role=sg.dataset.fwSign,w=model(c).wps.find(x=>x.ref===ref);if(!w)return true;
    const inp=api.root().querySelector('[data-fw-name="'+(role==="preparer"?"p-":"r-")+ref+'"]'),cur=field(api.st()).so[ref]||{};
    const r=F().signOff(w,cur,role,inp?inp.value:"");if(!r.ok){toast(r.error,"warn");return true}
    save(f=>{f.so[ref]=r.value});SK.audit&&SK.audit.log("tbreview",{act:"wp-"+role,ref});toast(role==="preparer"?"وُقّعت ورقة العمل "+ref+" — بانتظار المراجِع":"رُوجعت ورقة العمل "+ref,"ok");api.paint();return true}
  const ro=e.target.closest("[data-fw-reopen]");if(ro){const ref=ro.dataset.fwReopen;save(f=>{const s=f.so[ref]||{};f.so[ref]={done:s.done,conclusion:s.conclusion}});api.paint();return true}
  return false;
}
function onChange(e){
  const st=e.target.closest("[data-fw-step]");if(st){const ref=st.dataset.fwStep;save(f=>{const s=f.so[ref]||{},set=new Set(s.done||[]);st.checked?set.add(st.value):set.delete(st.value);f.so[ref]={...s,done:[...set]}});api.paint();return true}
  const cn=e.target.closest("[data-fw-conc]");if(cn){const ref=cn.dataset.fwConc;save(f=>{f.so[ref]={...(f.so[ref]||{}),conclusion:cn.value.trim()}});toast("حُفظ الاستنتاج","ok");return true}
  const cf=e.target.closest("[data-fw-conf]");if(cf){save(f=>{f.conf[cf.dataset.fwConf]=cf.checked});api.paint();return true}
  return false;
}
window.SKosifFieldwork=Object.freeze({init:a=>{api=a},planTab,closeTab,onClick,onChange,docs:DOCS,model});
})();

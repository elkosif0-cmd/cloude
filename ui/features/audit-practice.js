/* S.kosif — ممارسات المراجعة العالمية داخل ملف المراجعة (window.SKosifAuditPractice).
   ما تعلمناه من تقارير المراجعين لنحو 45 مجموعة عالمية (أرامكو، يونيليفر، أسترازينيكا، بي بي، فولكس فاجن، الإمارات
   دبي الوطني، e&، أمازون، أبل…) صار أدوات تعمل على ميزان هذا الملف نفسه، لا أرشيفاً:
     • خطة الأهمية النسبية (ISA 320) — تبويب «العمل الميداني»: أساس معدّل ونسبة ضمن مدى، أهمية تنفيذية حسب عوامل الخطر، وحد إبلاغ 5%
     • الأمور الرئيسية للمراجعة (ISA 701) — «الإصدار»: تُصاغ من مخاطر البنود والسوابق العالمية (global-benchmarks) بصيغة «الأمر، الاستجابة، النتيجة، المراجع»
     • الاستمرارية واختبار الضغط (ISA 570) — تبويب «الإكمال»: توقع نقدي 12 شهراً وسيناريوهات حادة ومعقولة وإجراءات مخففة واختبار عكسي
     • مراجعة التقديرات بأثر رجعي (ISA 540.14) — «العمل الميداني»: تقدير السنة السابقة مقابل ما حدث فعلاً، ومؤشر تحيز الإدارة
   تُحفظ مدخلاتها في ملف المراجعة نفسه (skosif_tbreview_v1) عبر st/put التي يمررها tb-review. */
(()=>{
"use strict";
const {esc,toast}=SK;
const E=()=>window.SKEngines,MP=()=>E().audit.materiality,KM=()=>E().audit.kam,GC=()=>E().audit.goingConcern,ER=()=>E().audit.estimatesReview,MN=()=>E().reports.money;
let H=null;
const m0=v=>MN().formatMinor(v||0,{decimals:0});
const riyal=v=>v===null||v===undefined||v===""?"":String(Math.round(v)/100);
const minor=v=>{const n=Number(String(v).replace(/[,\s]/g,""));return Number.isFinite(n)?Math.round(n*100):0};
const pc=x=>(Math.round(x*10000)/100)+"%";

/* ---------- materiality plan ---------- */
function planOf(c,cfg){
  const k=c.fsBefore.keys;
  return MP().planMateriality({pbt:k.pbz.current,revenue:k.revenue.current,assets:k.assets.current,equity:k.equity.current,...(cfg||{})});
}
function planCard(c){
  const d=c.d,cfg=d.matPlan||{},on=!!d.matPlanOn,p=planOf(c,cfg),r=cfg.risk||{},adds=(cfg.addBacks||[]).concat([{},{}]).slice(0,3);
  const B=MP().PLAN_BENCHMARKS,chk=(k,l,v)=>'<label class="checkline"><input type="checkbox" data-ap-risk="'+k+'"'+(v?' checked':'')+'> '+esc(l)+'</label>';
  return '<details class="card ap-card"'+(on?'':' open')+'><summary class="card-h"><div><h3>خطة الأهمية النسبية (ISA 320)</h3><p>كما يحددها مراجعو أرامكو ويونيليفر وأسترازينيكا: أساس معدّل، نسبة ضمن مدى، أهمية تنفيذية حسب عوامل الخطر، وحد إبلاغ 5%.</p></div><span class="sksev '+(on?'ok':'info')+'">'+(on?'مطبّقة على المراجعة':'مقترحة')+'</span></summary><div class="card-b">'+
    '<div class="ap-grid"><label class="sk-field"><span>الأساس</span><select data-ap-mp="benchmark"><option value="">تلقائي ('+esc(B[p.benchmark].ar)+')</option>'+Object.entries(B).map(([k,b])=>'<option value="'+k+'"'+(cfg.benchmark===k?' selected':'')+'>'+esc(b.ar)+'</option>').join("")+'</select></label>'+
      '<label class="sk-field"><span>النسبة % (المدى '+pc(p.range[0])+' – '+pc(p.range[1])+')</span><input type="number" step="0.05" min="0" data-ap-mp="rate" value="'+(cfg.rate?Math.round(cfg.rate*10000)/100:"")+'" placeholder="'+Math.round(p.rate*10000)/100+'"></label>'+
      '<label class="checkline ap-hold"><input type="checkbox" data-ap-mp="holding"'+(cfg.holding?' checked':'')+'> شركة قابضة (الأساس مجموع الموجودات)</label></div>'+
    '<h4>تعديل الربح (بنود لا تمثل النشاط المستمر)</h4><div class="ap-adds">'+adds.map((a,i)=>'<input data-ap-add="'+i+'" data-f="label" value="'+esc(a.label||"")+'" placeholder="'+(["انخفاض قيمة","تكاليف إعادة هيكلة","ربح بيع أصل (بالسالب)"][i])+'"><input type="number" step="1" data-ap-add="'+i+'" data-f="amount" value="'+riyal(a.amount)+'" placeholder="المبلغ">').join("")+'</div>'+
    '<h4>عوامل الخطر المؤثرة في الأهمية التنفيذية</h4><div class="ap-risk">'+chk("firstYear","أول سنة مراجعة لهذه المنشأة",r.firstYear)+chk("controlDeficiencies","أوجه قصور مهمة في الرقابة الداخلية",r.controlDeficiencies)+
      chk("noCorrect","الإدارة لم تصحح تحريفات أُبلغت بها",r.managementCorrects===false)+chk("publicInterest","منشأة ذات مصلحة عامة (مدرجة، بنك، تأمين)",r.publicInterest)+
      '<label class="sk-field"><span>تحريفات السنوات السابقة</span><select data-ap-mp="prior"><option value="none">لا يوجد</option><option value="few"'+(r.priorMisstatements==="few"?' selected':'')+'>بعض التحريفات</option><option value="many"'+(r.priorMisstatements==="many"?' selected':'')+'>متكررة أو كبيرة</option></select></label></div>'+
    '<div class="ap-res"><div><small>الأهمية النسبية</small><b>'+m0(p.overall)+'</b><span>'+pc(p.rate)+' من '+esc(p.benchmarkAr)+' ('+m0(p.base)+')</span></div>'+
      '<div><small>الأهمية التنفيذية</small><b>'+m0(p.performance)+'</b><span>'+pc(p.performanceRate)+' من الأهمية النسبية</span></div>'+
      '<div><small>حد إبلاغ المكلفين بالحوكمة</small><b>'+m0(p.trivial)+'</b><span>'+pc(p.trivialRate)+' — التحريفات دونه واضحة الضآلة</span></div></div>'+
    (p.factors.length?'<ul class="ap-ul">'+p.factors.map(f=>'<li>'+esc(f.label)+' <b>'+(f.effect*100)+' نقطة</b></li>').join("")+'</ul>':'<p class="hint">لا عوامل خطر مرتفعة: الأهمية التنفيذية في أعلى المدى المعتاد (75%) كما عند يونيليفر وأسترازينيكا.</p>')+
    '<p class="ap-why">'+esc(p.why)+'</p>'+
    '<table class="sk-table ap-cc" data-sk-plain><thead><tr><th>مقارنة الأهمية النسبية بالبنود الرئيسية</th><th>المبلغ</th><th>النسبة</th></tr></thead><tbody>'+p.crossCheck.map(x=>'<tr><td>'+esc(x.ar)+'</td><td class="num">'+m0(x.amount)+'</td><td class="num">'+x.pct+'%</td></tr>').join("")+'</tbody></table>'+
    (d.materiality?'<p class="tbr-warn">أُدخلت أهمية نسبية يدوية ('+m0(d.materiality)+') في بيانات المراجعة؛ تبقى هي الأهمية الكلية وتطبّق الخطة نسبتي التنفيذية والإبلاغ فقط.</p>':'')+
    '<div class="sk-actions"><button type="button" class="btn primary sm" data-ap="mp-on">'+(on?'تحديث الخطة المطبّقة':'اعتماد الخطة للمراجعة')+'</button>'+(on?'<button type="button" class="btn sm" data-ap="mp-off">إيقاف الخطة</button>':'')+'</div></div></details>';
}

/* ---------- key audit matters ---------- */
function kamList(c){
  const d=c.d,AI=E().audit.aiReview,GB=E().audit.globalBenchmarks,CRx=E().audit.corpusReplay;
  const cur=d.ctx.curSym||(d.source==="bundle"&&d.ctx.currency?d.ctx.currency:d.ctx.country==="EG"||c.fw==="EAS"?"ج.م":"ر.س"),sector=d.ctx.sector||(GB?GB.sectorFromActivity(d.ctx.activity||""):"");
  /* evidence from the rounds and from the working papers signed in the fieldwork tab */
  const ev=AI.mergeEvidence?AI.mergeEvidence(c.session?AI.evidenceFromSession(c.base,c.session):{},c.fieldEv||{}):(c.session?AI.evidenceFromSession(c.base,c.session):{});
  const end=/^\d{4}-\d{2}-\d{2}$/.test(d.ctx.periodEnd||"")?new Date(d.ctx.periodEnd+"T12:00:00").toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"}):"";
  /* a company of the research bundle never informs its own ranking: its sector prior leaves it out */
  const ks=KM().suggestKams({fs:c.fsAfterAdj,risks:c.base.risks,materiality:c.base.materiality.overall,currency:cur,periodEnd:end,sector,
    sectorPrior:CRx&&d.ctx.corpusId?CRx.sectorPrior(sector,d.ctx.corpusId):undefined,exclude:d.ctx.corpusId||d.bundleId||undefined,
    evidence:ev,priorKeys:Array.isArray(d.priorKams)?d.priorKams:undefined,standard:d.ctx.reportForm==="US"?"PCAOB":"ISA",max:d.ctx.reportForm==="UK"?4:undefined});
  if(Array.isArray(d.kamSel))ks.forEach(k=>{k.selected=d.kamSel.includes(k.key)});
  return ks;
}
const kams=c=>kamList(c).filter(k=>k.selected).map(k=>({title:k.title,why:k.description,how:k.how,observation:k.observation,refs:k.refs,trend:k.trend}));
function kamCard(c){
  const ks=kamList(c),d=c.d,prior=Array.isArray(d.priorKams)?d.priorKams:null,removed=prior?KM().removedKams(prior,ks):[];
  return '<section class="card"><div class="card-h"><div><h3>الأمور الرئيسية للمراجعة (ISA 701)</h3><p>مقترحة من مخاطر البنود بصيغة تقارير المراجعين العالمية: الأمر، كيف عالجناه، النتيجة، المراجع. اختر ما يدخل التقرير.</p></div>'+
    '<button type="button" class="btn sm" data-ap="kam-prior" title="يحفظ الاختيار الحالي كأمور العام السابق لإظهار الجديد والمحذوف في العام القادم">حفظ كأمور العام السابق</button></div><div class="card-b">'+
    (ks.map(k=>'<div class="tbr-kam ap-kam'+(k.selected?' on':'')+'"><label class="checkline"><input type="checkbox" data-ap-kam="'+esc(k.key)+'"'+(k.selected?' checked':'')+'> <b>'+esc(k.title)+'</b> <span class="sksev '+(k.score>=70?'bad':k.score>=55?'warn':'info')+'">خطر '+k.score+'</span>'+(k.trend==="new"?' <span class="sksev ok">جديد</span>':k.trend==="same"?' <span class="sksev">مستمر</span>':'')+'</label>'+
      '<p><small>الأمر:</small> '+esc(k.description)+'</p><p><small>كيف عالجناه:</small> '+esc(k.how)+'</p><p><small>النتيجة:</small> '+esc(k.observation)+'</p><p class="hint">'+esc(k.refs.join(" · "))+'</p>'+
      (k.examples.length?'<details class="fw-prec"><summary>كيف صاغ مراجعو الشركات العالمية أموراً مشابهة ('+k.examples.length+')</summary><ul>'+k.examples.map(x=>'<li><b dir="ltr">'+esc(x.title)+'</b> <small>'+esc(x.company)+' · ص '+x.page+'</small></li>').join("")+'</ul></details>':'')+'</div>').join("")||'<p class="empty">لا مخاطر بنود كافية لاقتراح أمور رئيسية.</p>')+
    (removed.length?'<p class="hint">أمور العام السابق التي لم تعد رئيسية: '+esc(removed.join("، "))+' — اذكر سبب استبعادها (كما تفعل أسترازينيكا).</p>':'')+'</div></section>';
}

/* ---------- going concern ---------- */
let gcMemo={sig:"",r:null};
function gcOf(c){
  const cfg=c.d.gc||{},sig=c.sig+"|"+JSON.stringify(cfg);
  if(gcMemo.sig===sig)return gcMemo.r;
  const GBk=E().audit.globalBenchmarks,sector=GBk?GBk.sectorFromActivity(c.d.ctx.activity||""):"";
  const base=GC().baselineFromStatements(c.fsAfterAdj,{undrawnFacilities:cfg.facilities||0,financial:sector==="banking"||sector==="insurance"});
  const mit=(cfg.mitigations||[]).filter(x=>x&&x.monthly).map(x=>({ar:x.ar||"إجراء مخفف",monthly:x.monthly,fromMonth:x.fromMonth||1,feasible:!!x.feasible}));
  const r=GC().assessGoingConcern({baseline:base,mitigations:mit,indicators:c.all.findings.filter(f=>f.kind==="going-concern").map(f=>({title:f.title,severity:f.severity}))});
  gcMemo={sig,r:{...r,baseline:base,mit}};return gcMemo.r;
}
const gcSection=c=>GC().goingConcernSection(gcOf(c).conclusion,{framework:c.fw});
function gcCard(c){
  const r=gcOf(c),cfg=c.d.gc||{},mits=(cfg.mitigations||[]).concat([{},{}]).slice(0,2),b=r.baseline;
  const cls=r.conclusion==="no-material-uncertainty"?"ok":r.conclusion==="close-call"?"warn":"bad";
  const lab=Array.from({length:12},(_,i)=>"ش"+(i+1)),M=v=>v/100;
  const chart=window.SKCharts?SKCharts.line({title:"النقد المتوقع — الحالة الأساسية مقابل أسوأ سيناريو",labels:lab,width:640,height:220,fmt:SKCharts.compact,
    series:[{name:"الحالة الأساسية",values:r.base.months.map(x=>M(x.cash))},{name:r.worst.ar,values:r.worst.months.map(x=>M(x.cash))}]}):"";
  const row=p=>'<tr><td><b>'+esc(p.ar)+'</b><small class="tbr-sub">'+esc(p.risk)+'</small></td><td class="num">'+m0(p.minCash)+'</td><td class="num">ش'+p.minMonth+'</td><td class="num '+(p.headroom<0?'neg':'pos')+'">'+m0(p.headroom)+'</td><td class="num">'+(p.mitigated?m0(p.mitigated.headroom):'—')+'</td></tr>';
  return '<section class="card ap-gc"><div class="card-h"><div><h3>الاستمرارية واختبار الضغط (ISA 570)</h3><p>توقع نقدي لاثني عشر شهراً من القوائم بعد التسويات، وسيناريوهات «حادة لكنها معقولة» مرتبطة بالمخاطر الرئيسية فرادى ومجتمعة، والإجراءات المخففة، واختبار الضغط العكسي — كما في بيانات الجدوى لبي بي ويونيليفر وأسترازينيكا.</p></div><span class="sksev '+cls+'">'+esc(r.ar)+'</span></div><div class="card-b">'+
    '<p class="ap-why">'+esc(r.why)+(r.breakPoint===null?' ولا ينفد النقد حتى لو توقفت الإيرادات كلياً خلال السنة.':r.breakPoint===0?'':' ينفد النقد والتسهيلات إذا انخفضت الإيرادات '+r.breakPoint+'% عن مستوى السنة المنتهية (اختبار الضغط العكسي).')+'</p>'+
    '<div class="ap-res"><div><small>النقد الافتتاحي</small><b>'+m0(b.openingCash)+'</b><span>متوسط الإيراد الشهري '+m0(b.monthlyRevenue)+'</span></div><div><small>هامش مجمل الربح</small><b>'+pc(b.grossMargin)+'</b><span>التحصيل '+b.dsoDays+' يوماً · السداد '+b.dpoDays+' يوماً</span></div><div><small>التزامات ثابتة شهرية</small><b>'+m0(b.monthlyFixedCosts+b.monthlyDebtService+b.monthlyCapex)+'</b><span>'+(b.zakatDue?'الزكاة '+m0(b.zakatDue.amount)+' في الشهر 4':'لا زكاة مستحقة')+'</span></div></div>'+
    chart+
    '<div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>السيناريو</th><th>أدنى نقد</th><th>الشهر</th><th>الهامش مع التسهيلات</th><th>بعد الإجراءات المخففة</th></tr></thead><tbody>'+row(r.base)+r.paths.map(row).join("")+'</tbody></table></div>'+
    '<h4>التسهيلات والإجراءات المخففة</h4><div class="ap-grid"><label class="sk-field"><span>تسهيلات بنكية غير مستخدمة (ريال)</span><input type="number" min="0" step="1000" data-ap-gc="facilities" value="'+riyal(cfg.facilities)+'"></label></div>'+
    '<div class="ap-mits">'+mits.map((x,i)=>'<input data-ap-mit="'+i+'" data-f="ar" value="'+esc(x.ar||"")+'" placeholder="'+(["تأجيل مصروفات رأسمالية","دعم من الشركاء"][i])+'"><input type="number" step="1000" data-ap-mit="'+i+'" data-f="monthly" value="'+riyal(x.monthly)+'" placeholder="أثر شهري (ريال)"><label class="checkline"><input type="checkbox" data-ap-mit="'+i+'" data-f="feasible"'+(x.feasible?' checked':'')+'> قابل للتنفيذ وموثق</label>').join("")+'</div>'+
    '<p class="hint">يُعد قسم «الاستنتاجات المتعلقة بالاستمرارية» في تقرير المراجع من هذه النتيجة تلقائياً (ISA 570 المحدث 2024 — يسري على الفترات التي تبدأ من 15 ديسمبر 2026). بعد مراجعة النتيجة أكّد بند الاستمرارية في بوابة الإكمال أعلاه.</p></div></section>';
}

/* ---------- retrospective review of estimates ---------- */
const KIND_LINES={ecl:["receivables"],inventory:["inventory"],zakat:["zakatPayable"],eosb:["eosb"],provisions:["provisions"],accruals:["accruals"]};
function estItems(c){
  const out=[],vals=c.d.estimates||{};
  for(const k of ER().ESTIMATE_KINDS){
    const accs=c.base.accounts.filter(a=>(KIND_LINES[k.key]||[]).includes(a.lineKey)&&a.prior!==null&&(k.key==="ecl"||k.key==="inventory"?k.kws.test(a.name):true));
    if(!accs.length)continue;
    const prior=Math.abs(accs.reduce((s,a)=>s+(a.prior||0),0));if(!prior)continue;
    out.push({key:k.key,label:k.label,priorEstimate:prior,outcome:Number.isFinite(vals[k.key])?vals[k.key]:null,basis:k.outcome,accounts:accs.map(a=>a.name)});
  }
  return out;
}
function estCard(c){
  if(!c.fsBefore.hasPrior)return '<section class="card"><div class="card-h"><div><h3>مراجعة التقديرات بأثر رجعي (ISA 540)</h3><p>تتطلب عمود السنة السابقة في الميزان: تقدير السنة الماضية يُقارن بما حدث فعلاً.</p></div></div></section>';
  const items=estItems(c);
  if(!items.length)return '<section class="card ap-est"><div class="card-h"><div><h3>مراجعة التقديرات بأثر رجعي (ISA 540)</h3><p>لا توجد في هذا الميزان بنود تقديرية بأرصدة للسنة السابقة (المخصصات، الخسائر الائتمانية، مخصص المخزون، منافع الموظفين، المستحقات، الزكاة) — عند ظهورها يُقارن تقدير السنة الماضية بما حدث فعلاً هنا.</p></div></div></section>';
  const m=c.base.materiality,r=ER().reviewEstimates(items,{overall:m.overall,performance:m.performance,trivial:m.trivial});
  const DIR={under:["أقل من الواقع","bad"],over:["أعلى من الواقع","warn"],accurate:["دقيق","ok"],pending:["بانتظار النتيجة","info"]};
  const SIG={trivial:"ضئيل","below-performance":"دون التنفيذية","above-performance":"فوق التنفيذية",material:"جوهري",pending:"—"};
  return '<section class="card ap-est"><div class="card-h"><div><h3>مراجعة التقديرات بأثر رجعي (ISA 540)</h3><p>تقدير السنة السابقة مقابل ما حدث فعلاً — الإجراء الذي يتكرر في معظم الأمور الرئيسية للمراجعة عالمياً (يونيليفر، نوفارتس، بي بي، بيركشاير). أدخل النتيجة الفعلية لكل تقدير.</p></div><span class="sksev '+(r.bias?'bad':r.pending?'info':'ok')+'">'+(r.bias?'مؤشر تحيز':r.pending?'غير مكتمل':'لا تحيز ظاهر')+'</span></div><div class="card-b tbr-tw">'+
    '<table class="sk-table" data-sk-plain><thead><tr><th>التقدير</th><th>تقدير السنة السابقة</th><th>النتيجة الفعلية</th><th>الفرق</th><th>الاتجاه</th><th>الأهمية</th></tr></thead><tbody>'+
    r.rows.map(x=>'<tr><td><b>'+esc(x.label)+'</b><small class="tbr-sub">'+esc(x.basis||"")+'</small></td><td class="num">'+m0(x.priorEstimate)+'</td><td><input type="number" step="1" data-ap-est="'+esc(x.key)+'" value="'+riyal(x.outcome)+'" aria-label="النتيجة الفعلية — '+esc(x.label)+'"></td><td class="num">'+(x.direction==="pending"?'—':m0(x.diff)+(x.pct!==null?' ('+x.pct+'%)':''))+'</td><td><span class="sksev '+DIR[x.direction][1]+'">'+DIR[x.direction][0]+'</span></td><td>'+SIG[x.significance]+'</td></tr>').join("")+'</tbody></table>'+
    '<p class="'+(r.bias?'tbr-warn':'ap-why')+'">'+esc(r.message)+'</p></div></section>';
}

/* ---------- events (delegated from tb-review's root) ---------- */
function onChange(e){
  const t=e.target,d=H.st();
  const mp=t.closest("[data-ap-mp]");
  if(mp){const cfg={...(d.matPlan||{}),risk:{...((d.matPlan||{}).risk||{})}},k=mp.dataset.apMp;
    if(k==="benchmark")cfg.benchmark=mp.value||undefined;
    else if(k==="rate"){const v=Number(mp.value);cfg.rate=v>0?v/100:undefined}
    else if(k==="holding")cfg.holding=mp.checked;
    else if(k==="prior")cfg.risk.priorMisstatements=mp.value;
    d.matPlan=cfg;H.put(d);H.paint();return true}
  const rk=t.closest("[data-ap-risk]");
  if(rk){const cfg={...(d.matPlan||{}),risk:{...((d.matPlan||{}).risk||{})}},k=rk.dataset.apRisk;
    if(k==="noCorrect")cfg.risk.managementCorrects=rk.checked?false:undefined;else cfg.risk[k]=rk.checked;
    d.matPlan=cfg;H.put(d);H.paint();return true}
  const ad=t.closest("[data-ap-add]");
  if(ad){const cfg={...(d.matPlan||{})},list=(cfg.addBacks||[]).slice(),i=Number(ad.dataset.apAdd);while(list.length<=i)list.push({label:"",amount:0});
    list[i]={...list[i],[ad.dataset.f]:ad.dataset.f==="amount"?minor(ad.value):ad.value.trim()};
    cfg.addBacks=list.filter(x=>x.label||x.amount);d.matPlan=cfg;H.put(d);H.paint();return true}
  const km=t.closest("[data-ap-kam]");
  if(km){const c=H.compute(),cur=kamList(c).filter(k=>k.selected).map(k=>k.key),key=km.dataset.apKam;
    d.kamSel=km.checked?[...new Set([...cur,key])]:cur.filter(k=>k!==key);H.put(d);H.paint();return true}
  const g=t.closest("[data-ap-gc]");
  if(g){d.gc={...(d.gc||{}),facilities:minor(g.value)};H.put(d);H.paint();return true}
  const mi=t.closest("[data-ap-mit]");
  if(mi){const gc={...(d.gc||{})},list=(gc.mitigations||[]).slice(),i=Number(mi.dataset.apMit);while(list.length<=i)list.push({ar:"",monthly:0,feasible:false});
    const f=mi.dataset.f;list[i]={...list[i],[f]:f==="feasible"?mi.checked:f==="monthly"?minor(mi.value):mi.value.trim()};
    gc.mitigations=list;d.gc=gc;H.put(d);H.paint();return true}
  const es=t.closest("[data-ap-est]");
  if(es){const v=es.value===""?undefined:minor(es.value);d.estimates={...(d.estimates||{})};if(v===undefined)delete d.estimates[es.dataset.apEst];else d.estimates[es.dataset.apEst]=v;H.put(d);H.paint();return true}
  return false;
}
function onClick(e){
  const b=e.target.closest("[data-ap]");if(!b)return false;
  const d=H.st(),a=b.dataset.ap;
  if(a==="mp-on"){d.matPlanOn=true;d.matPlan=d.matPlan||{};H.put(d);toast("طُبّقت خطة الأهمية النسبية على المراجعة","ok");SK.audit&&SK.audit.log("tbreview",{act:"materiality-plan"});H.paint();return true}
  if(a==="mp-off"){d.matPlanOn=false;H.put(d);H.paint();return true}
  if(a==="kam-prior"){const c=H.compute();d.priorKams=kamList(c).filter(k=>k.selected).map(k=>k.key);H.put(d);toast("حُفظت كأمور العام السابق","ok");H.paint();return true}
  return false;
}
window.SKosifAuditPractice=Object.freeze({init:h=>{H=h},planOf,planCard,kamList,kams,kamCard,gcOf,gcSection,gcCard,estCard,onChange,onClick});
})();

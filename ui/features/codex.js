/* S.kosif — المدونة المحاسبية والمعايير (شاشة «codex») + بطاقة المعيار المشتركة (window.SKosifCodex).
   • المكتبة: كل معيار في السجل (IFRS · IAS · ISA · المتطلبات السعودية) بمتطلباته وإفصاحاته وإجراءات
     مراجعته وقسمه المقابل في معيار المنشآت الصغيرة وحالته وسريانه ومصدره الرسمي.
   • تحديث المعايير من المصادر الرسمية: فحص عبر Gemini مع بحث Google مقيد بنطاقات الجهات المصدرة
     (IFRS Foundation · IAASB · SOCPA · ZATCA · وزارة التجارة · هيئة السوق المالية · IESBA)؛ كل تحديث
     يبقى «بانتظار الاعتماد» حتى يعتمده المستخدم، ويحفظ روابطه وتاريخ فحصه.
   • بطاقة المعيار: تُفتح من أي شاشة (شارة المعيار بجوار الحساب في مراجعة الميزان) وتعرض علاقة
     المعيار بالحساب المحدد.
   البيانات: skosif_codex_updates_v1 = {checkedAt, items:[UpdateItem]} */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const KEY="skosif_codex_updates_v1";
const X=()=>SKEngines.audit.codex,U=()=>SKEngines.audit.standardsUpdate,G=()=>window.SKosifAccountingGuidance;
const FAM={IFRS:"معايير التقرير المالي",IAS:"معايير المحاسبة",ISA:"معايير المراجعة",SAUDI:"متطلبات سعودية",EAS:"معايير المحاسبة المصرية",EGYPT:"متطلبات مصرية"};
const STATUS={effective:["ساري","ok"],upcoming:["سريان قادم","warn"],replaced:["يُستبدل","info"]};
let root=null,q="",fam="all",busy=false,guideTab="framework",guideMode="ifrs18",guideResult=null;
const upd=()=>{const d=load(KEY,{})||{};return{checkedAt:d.checkedAt||"",items:Array.isArray(d.items)?d.items:[]}};
const list=()=>U().applyApproved(X().STANDARDS,upd().items);
const get=code=>list().find(s=>s.code===code)||null;
const famCls=f=>"std-"+String(f||"").toLowerCase();

/* ---------- the shared standard sheet ---------- */
let sheet=null,prev=null;
function close(){if(!sheet)return;sheet.remove();sheet=null;document.removeEventListener("keydown",onKey,true);try{prev&&prev.focus()}catch{}}
function onKey(e){if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close()}}
const ul=(t,items)=>items&&items.length?'<h4>'+esc(t)+'</h4><ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':"";
/* ctx: {account:{code,name,lineKey,lineAr,basis,assertions}, note, findings:[{title,basis,severity}], procedures:[], framework} */
function open(code,ctx={}){
  const s=get(code);close();prev=document.activeElement;
  sheet=document.createElement("div");sheet.className="stdx-wrap";
  const a=ctx.account,st=s?STATUS[s.status]||["",""]:["",""];
  const pending=upd().items.filter(u=>u.code===code&&u.status==="pending");
  const rel=a?X().relationOf(code,a.lineKey||null):"";
  const why=a?{name:"اسم الحساب",code:"رقم الحساب في دليل الحسابات",type:"نوع الحساب",manual:"تبويب يدوي",none:"—"}[a.basis]||"":"";
  sheet.innerHTML='<aside class="stdx" role="dialog" aria-modal="true" aria-labelledby="stdx-t">'+
    '<header><span class="std-b big '+famCls(s&&s.family)+'">'+esc(code)+'</span><div><h3 id="stdx-t">'+esc(s?s.titleAr:code)+'</h3><p>'+esc(s?s.titleEn:"معيار غير موجود في السجل")+'</p></div>'+
      '<button type="button" class="btn sm" data-stdx-close aria-label="إغلاق">إغلاق</button></header><div class="stdx-b">'+
    (s?'<div class="stdx-meta"><span class="sksev '+st[1]+'">'+esc(st[0])+'</span><span>'+esc(s.org)+'</span><span>السريان: '+esc(s.effective)+'</span>'+(s.ifrs?'<button type="button" class="std-b" data-stdx-go="'+esc(s.ifrs)+'">≈ '+esc(s.ifrs)+'</button>':'')+'</div>':'')+
    (a?'<section class="stdx-rel"><h4>علاقته بالحساب '+esc(a.code)+' — '+esc(a.name)+'</h4><p>'+esc(rel)+'</p>'+
      (ctx.note?'<p class="stdx-ai"><b>ملاحظة المراجع الذكي:</b> '+esc(ctx.note)+'</p>':'')+
      '<p class="hint">البند في القوائم: '+esc(a.lineAr||"—")+(why?' · اقتُرح المعيار من '+esc(why):'')+(a.assertions&&a.assertions.length?' · الإقرارات: '+esc(a.assertions.join("، ")):'')+'</p></section>':'')+
    (ctx.findings&&ctx.findings.length?'<section class="stdx-f"><h4>ملاحظات على هذا الحساب</h4>'+ctx.findings.map(f=>'<div class="stdx-fi"><span class="sev '+esc(f.severity==="high"?"bad":f.severity==="medium"?"warn":"info")+'"></span><div><b>'+esc(f.title)+'</b><small>'+esc(f.basis||"")+'</small></div></div>').join("")+'</section>':'')+
    (s?'<p class="stdx-purpose">'+esc(s.purpose)+'</p>'+ul("المتطلبات الرئيسية",s.requirements)+ul("الإفصاحات",s.disclosures)+ul("إجراءات المراجعة",s.audit||[])+ul("إجراءات مقترحة لهذا البند",(ctx.procedures||[]).filter(p=>!(s.audit||[]).some(x=>x.slice(0,10)===p.slice(0,10))))+
      (s.sme?'<h4>في معيار المنشآت الصغيرة ومتوسطة الحجم</h4><p>'+esc(s.sme)+(ctx.framework==="SME"?' — الإطار المطبق على هذه المنشأة.':'')+'</p>':'')+
      '<h4>آخر المستجدات</h4><p>'+esc(s.latest)+'</p>'+
      (pending.length?'<p class="stdx-ai">'+pending.length+' تحديث من المصادر الرسمية بانتظار اعتمادك في شاشة المدونة المحاسبية.</p>':'')+
      '<a class="btn sm primary" href="'+esc(s.url)+'" target="_blank" rel="noopener">المصدر الرسمي ('+esc(s.org)+')</a>':'')+
    '</div></aside>';
  sheet.addEventListener("click",e=>{if(e.target===sheet||e.target.closest("[data-stdx-close]")){close();return}const g=e.target.closest("[data-stdx-go]");if(g&&get(g.dataset.stdxGo))open(g.dataset.stdxGo,ctx)});
  document.addEventListener("keydown",onKey,true);
  document.body.appendChild(sheet);sheet.querySelector("[data-stdx-close]").focus();
}


const AG_TABS=[["framework","الإطار"],["recognition","الاعتراف"],["change","السياسة / التقدير / الخطأ"],["presentation","العرض"],["disclosure","الإيضاحات"],["cashflow","التدفقات"],["advanced","تطبيقات متقدمة"]];
const agSel=(name,label,help,extra="")=>'<label class="cdx-guide-q"><span><b>'+esc(label)+'</b><small>'+esc(help||"")+'</small></span><select data-ag-f="'+name+'" '+extra+'><option value="">— اختر —</option><option value="yes">نعم</option><option value="no">لا</option></select></label>';
const agNum=(name,label,help,ph="")=>'<label class="cdx-guide-q"><span><b>'+esc(label)+'</b><small>'+esc(help||"")+'</small></span><input data-ag-f="'+name+'" type="number" step="any" placeholder="'+esc(ph)+'"></label>';
function guideForm(){
  if(guideTab==="framework")return agSel("listed","هل أدوات المنشأة مدرجة أو في طور الإدراج؟","يشمل الأسهم أو أدوات الدين.")+
    agSel("fiduciary","هل تحتفظ المنشأة بأصول لقطاع عريض من الغير كنشاط رئيس؟","مثل بنك أو تأمين أو صندوق استثمار.")+
    agSel("incidental","هل الاحتفاظ بأموال الغير عرضي وليس النشاط الرئيس؟","مثل مقدمات مدارس أو عملاء في نشاط تشغيلي.")+
    agSel("full","إذا لم تكن خاضعة للمساءلة العامة: هل اختارت Full IFRS؟","الاختيار يحتاج التزاماً متسقاً بالإطار الكامل.");
  if(guideTab==="recognition")return '<label class="cdx-guide-q"><span><b>نوع البند</b><small>أصل أو التزام — المحرك يختبر التعريف والاعتراف.</small></span><select data-ag-f="kind"><option value="asset">أصل</option><option value="liability">التزام</option></select></label>'+
    agSel("past","هل نشأ عن حدث سابق؟","شرط أساسي.")+agSel("measure","هل يمكن قياسه بدرجة موثوقة؟","القياس غير الموثوق يستلزم مراجعة.")+
    agSel("control","هل تسيطر المنشأة على المورد؟","للأصل.")+agSel("benefit","هل المنافع المستقبلية محتملة؟","للأصل.")+
    agSel("obligation","هل يوجد التزام حالي؟","للالتزام.")+agSel("legal","هل الالتزام قانوني أو ضمني؟","قد ينشأ الالتزام الضمني من ممارسة ثابتة أو تعهد محدد.")+
    agSel("outflow","هل خروج الموارد محتمل؟","للالتزام.")+agSel("material","هل البند جوهري؟","الجوهري يحتاج توثيق حكمه وأساس قياسه.");
  if(guideTab==="change")return agSel("priorinfo","هل كانت المعلومات الموثوقة متاحة عند إصدار الفترة السابقة؟","إذا نعم فقد يشير ذلك إلى خطأ فترة سابقة.")+
    agSel("misuse","هل كان هناك فشل أو سوء استخدام لمعلومات موثوقة؟","خطأ حسابي، تطبيق خاطئ للسياسة، سهو أو تفسير خاطئ.")+
    agSel("newinfo","هل التغيير بسبب معلومات أو خبرة جديدة؟","يميل إلى تغيير تقدير.")+
    agSel("technique","هل تغير افتراض أو تقنية قياس؟","مثل عمر أصل أو مخصص أو طريقة تقدير.")+
    agSel("rule","هل تغير مبدأ الاعتراف/القياس/العرض نفسه؟","يميل إلى تغيير سياسة.")+
    agSel("required","هل التغيير مطلوب بمعيار جديد؟","راجع الأحكام الانتقالية.")+
    agSel("transition","هل للمعيار أحكام انتقالية محددة؟","إذا نعم، تتقدم على القاعدة العامة.")+
    agSel("voluntary","هل تغيير السياسة اختياري؟","يحتاج مبرراً للملاءمة والموثوقية.")+
    agSel("material","هل الأثر جوهري؟","الأهمية النسبية تؤثر في طريقة التصحيح والإفصاح.");
  if(guideTab==="presentation")return agSel("comparatives","هل توجد أرقام مقارنة؟","للفترة السابقة للمبالغ، والسرد عند الحاجة.")+
    agSel("consistent","هل العرض ثابت عن الفترة السابقة؟","إن تغير، يلزم تفسير السبب وإعادة التصنيف.")+
    agSel("reclass","إذا تغير العرض: هل شُرح سبب وأثر إعادة التصنيف؟","")+
    agSel("current","هل طُبق متداول / غير متداول بوضوح؟","متى كان ذلك ملائماً لطبيعة المنشأة.")+
    agSel("materialsep","هل البنود الجوهرية مفصولة؟","لا تخفِ بنداً جوهرياً داخل تجميع واسع.")+
    agSel("offset","هل توجد مقاصة بلا أساس صريح؟","اختر «نعم» إذا توجد مقاصة غير مدعومة.")+
    agSel("oci","هل توجد بنود دخل شامل آخر؟","مثل بعض فروق الترجمة أو التحوط أو إعادة التقييم.")+
    agSel("ocipresent","إذا وجدت OCI: هل عُرضت بشكل صحيح؟","")+
    agSel("equity","هل تمت تسوية مكونات حقوق الملكية من الافتتاح للإقفال؟","")+
    agSel("xref","هل كل بند جوهري مرتبط بإيضاح؟","إشارة مرجعية من القائمة إلى الإيضاح.");
  if(guideTab==="disclosure")return agSel("entity","هل معلومات المنشأة مكتملة؟","الاسم، الشكل القانوني، الدولة، العنوان والنشاط.")+
    agSel("compliance","هل اعتمد شخص مسؤول بيان الالتزام بالإطار؟","التطبيق لا يعتمد بيان الالتزام تلقائياً.")+
    agSel("measurement","هل أسس القياس موضحة؟","")+
    agSel("policies","هل السياسات المحاسبية الجوهرية موضحة؟","")+
    agSel("support","هل إيضاحات البنود تتبع ترتيب القوائم؟","")+
    agSel("judgements","هل الأحكام المهنية مفصولة عن التقديرات؟","")+
    agSel("uncertainty","هل مصادر عدم تأكد التقدير مفصح عنها؟","بما في ذلك طبيعة البند ومبلغه الدفتري والافتراضات الرئيسية.")+
    agSel("unrecognized","هل روجعت البنود غير المعترف بها والارتباطات؟","مثل الالتزامات المحتملة والضمانات والارتباطات.");

  if(guideTab==="advanced"){
    const modes=[["ifrs18","IFRS 18"],["ifrs19","IFRS 19"],["related","الأطراف ذات العلاقة"],["events","الأحداث اللاحقة"]];
    const head='<div class="sk-seg cdx-guide-tabs">'+modes.map(([k,l])=>'<button type="button" data-ag-mode="'+k+'" aria-pressed="'+(guideMode===k)+'">'+esc(l)+'</button>').join("")+'</div>';
    if(guideMode==="ifrs18")return head+
      agSel("a18cat","هل خريطة الحسابات مصنفة إلى التشغيل والاستثمار والتمويل والضريبة/الزكاة والعمليات المتوقفة؟","أساس قائمة الربح أو الخسارة في IFRS 18.")+
      agSel("a18sub","هل المجاميع الإلزامية محسوبة ومختبرة؟","مثل الربح التشغيلي والربح قبل التمويل والضرائب حسب الانطباق.")+
      agSel("a18mpmi","هل تم حصر مقاييس الأداء المحددة من الإدارة MPM؟","راجع الاتصالات العامة خارج القوائم.")+
      agSel("a18mpmr","هل تمت مصالحة كل MPM مع أقرب مجموع IFRS؟","مع آثار الضريبة وحقوق غير المسيطرين عند الانطباق.")+
      agSel("a18exp","هل تحليل المصروفات التشغيلية المطلوب متاح؟","خصوصًا عند العرض حسب الوظيفة.")+
      agSel("a18agg","هل سياسة التجميع والتفصيل وأسماء البنود محدثة؟","لتجنب إخفاء معلومات جوهرية.")+
      agSel("a18comp","هل البيانات المقارنة وخطة الانتقال جاهزة؟","IFRS 18 إلزامي من 1 يناير 2027.")+
      agSel("a18sys","هل الأنظمة ومصادر البيانات تدعم التصنيفات الجديدة؟","تجنب الاعتماد على إعادة تصنيف يدوية بنهاية الفترة.");
    if(guideMode==="ifrs19")return head+
      agSel("a19sub","هل المنشأة شركة تابعة؟","شرط أساسي للأهلية.")+
      agSel("a19pa","هل المنشأة خاضعة للمساءلة العامة؟","اختر «لا» لتكون مؤهلة مبدئيًا.")+
      agSel("a19parent","هل الأم النهائية/الوسيطة تصدر قوائم موحدة IFRS متاحة للاستخدام العام؟","يلزم توافر القوائم الموحدة المؤهلة.")+
      agSel("a19full","هل التابعة تطبق الاعتراف والقياس وفق IFRS الكاملة؟","IFRS 19 يخفض الإفصاحات فقط.");
    if(guideMode==="related")return head+
      agSel("rpr","هل سجل الأطراف ذات العلاقة كامل ومحدث؟","الإدارة العليا، الملاك، المنشآت تحت السيطرة/التأثير وغيرها.")+
      agSel("rpm","هل روجعت محاضر المجلس واللجان والإدارة؟","للبحث عن أطراف أو معاملات لم تكن معروفة.")+
      agSel("rpc","هل عملية تحديد الأطراف وضوابطها مفهومة؟","من يحدد العلاقة وكيف تُراجع التغييرات.")+
      agSel("rpf","هل الأرصدة الجوهرية تمت مصادقتها أو تنفيذ بدائل؟","")+
      agSel("rps","هل عينة المعاملات مدعومة بالعقود والمستندات؟","")+
      agSel("rpa","هل المعاملات الجوهرية حاصلة على الموافقات المطلوبة؟","")+
      agSel("rpd","هل الإفصاحات مكتملة؟","IAS 24 ومتطلبات المخاطر ذات الصلة.")+
      agSel("rpu","هل المعاملات غير الاعتيادية/غير السوقية تم تقييمها؟","")+
      agSel("rpg","هل المنشأة حكومية/مرتبطة بالحكومة؟","لتفعيل فحص تركّز المعاملات.")+
      agSel("rpgc","إذا كانت مرتبطة بالحكومة: هل التركّز مقيم ومفصح عنه؟","");
    return head+
      agSel("evdate","هل تاريخ الحدث معروف؟","")+
      agSel("evauthd","هل تاريخ اعتماد القوائم ومن اعتمدها موثق؟","")+
      agSel("evbefore","هل وقع الحدث قبل تاريخ اعتماد القوائم؟","")+
      agSel("evcond","هل يقدم الحدث دليلاً عن ظروف كانت قائمة في تاريخ التقرير؟","هذا يفرق المعدّل عن غير المعدّل.")+
      agSel("evmat","هل الحدث جوهري؟","")+
      agSel("evdiv","هل هو توزيعات أرباح معلنة بعد الفترة؟","لا تثبت التوزيعات اللاحقة كالتزام في تاريخ التقرير.")+
      agSel("evgc","هل يؤثر الحدث في ملاءمة أساس الاستمرارية؟","قد يتجاوز مجرد تصنيف الحدث إلى إعادة تقييم أساس الإعداد.")+
      agSel("evlegal","هل يتعلق بدعوى/مطالبة قانونية؟","")+
      agSel("evlegalev","إذا قانوني: هل حصلت على أدلة/تأكيدات مناسبة من المستشار القانوني؟","");
  }

  return '<label class="cdx-guide-q"><span><b>الإطار</b><small>قواعد السعودية لمعيار المنشآت الصغيرة تُفعل عند SME.</small></span><select data-ag-f="framework"><option value="SME">IFRS for SMEs</option><option value="IFRS">Full IFRS</option></select></label>'+
    agNum("zakat","الزكاة المدفوعة","إن وجدت في السعودية ضمن SME تظهر منفصلة بالتشغيلية.","0")+
    agNum("months","مدة استحقاق معادل النقد بالأشهر","عادة 3 أشهر أو أقل مؤشر مهم.","3")+
    agSel("overdraft","هل السحب على المكشوف واجب عند الطلب وجزء لا يتجزأ من إدارة النقد؟","")+
    agSel("noncash","هل توجد معاملات غير نقدية؟","لا تدخل في التدفقات نفسها وتحتاج إفصاحاً.")+
    agSel("financecost","هل طبيعة تكاليف التمويل موثقة؟","مهم للتصنيف والإفصاح.");
}
function agVal(name){
  const el=root&&root.querySelector('[data-ag-f="'+name+'"]');if(!el)return undefined;
  if(el.type==="number")return el.value===""?undefined:Number(el.value);
  if(el.value==="yes")return true;if(el.value==="no")return false;return el.value||undefined;
}
function runGuide(){
  let data;
  if(guideTab==="framework")data=X().frameworkApplicability({listedOrIssuing:agVal("listed"),fiduciaryForBroadGroup:agVal("fiduciary"),incidentalDepositsOnly:agVal("incidental"),electedFullIfrs:agVal("full")});
  else if(guideTab==="recognition")data=G().recognition({kind:agVal("kind")||"asset",pastEvent:agVal("past"),measurableReliably:agVal("measure"),controlledResource:agVal("control"),probableFutureBenefit:agVal("benefit"),presentObligation:agVal("obligation"),legalOrConstructiveObligation:agVal("legal"),probableOutflow:agVal("outflow"),material:agVal("material")});
  else if(guideTab==="change")data=G().accountingChange({priorPeriodInformationWasAvailable:agVal("priorinfo"),failureOrMisuseOfReliableInformation:agVal("misuse"),newInformationOrNewExperience:agVal("newinfo"),changedMeasurementTechniqueOrAssumption:agVal("technique"),changedRecognitionMeasurementPresentationRule:agVal("rule"),requiredByNewStandard:agVal("required"),transitionSpecified:agVal("transition"),voluntaryPolicyChange:agVal("voluntary"),material:agVal("material")});
  else if(guideTab==="presentation")data=G().presentation({hasComparatives:agVal("comparatives"),presentationConsistent:agVal("consistent"),reclassificationExplained:agVal("reclass"),currentNoncurrentApplied:agVal("current"),materialItemsSeparated:agVal("materialsep"),unsupportedOffsetting:agVal("offset"),ociExists:agVal("oci"),ociPresented:agVal("ocipresent"),equityOpeningToClosingReconciled:agVal("equity"),statementLinesCrossReferencedToNotes:agVal("xref")});
  else if(guideTab==="disclosure")data=G().disclosures({entityInfo:agVal("entity"),complianceStatementHumanApproved:agVal("compliance"),measurementBases:agVal("measurement"),materialPolicies:agVal("policies"),statementSupportNotes:agVal("support"),judgementsSeparatedFromEstimates:agVal("judgements"),estimationUncertaintyDisclosed:agVal("uncertainty"),unrecognizedItemsReviewed:agVal("unrecognized")});
  else if(guideTab==="advanced"&&guideMode==="ifrs18")data=G().ifrs18Readiness({categoriesMapped:agVal("a18cat"),mandatorySubtotalsReady:agVal("a18sub"),mpmInventoryComplete:agVal("a18mpmi"),mpmReconciled:agVal("a18mpmr"),expenseAnalysisReady:agVal("a18exp"),aggregationPolicyUpdated:agVal("a18agg"),comparativesPrepared:agVal("a18comp"),systemsReady:agVal("a18sys")});
  else if(guideTab==="advanced"&&guideMode==="ifrs19")data=G().ifrs19Eligibility({isSubsidiary:agVal("a19sub"),publicAccountability:agVal("a19pa"),parentProducesPublicIfrsConsolidated:agVal("a19parent"),usesFullIfrs:agVal("a19full")});
  else if(guideTab==="advanced"&&guideMode==="related")data=G().relatedParties({relatedPartyRegisterComplete:agVal("rpr"),minutesReviewed:agVal("rpm"),processAndControlsUnderstood:agVal("rpc"),balancesConfirmedOrAlternative:agVal("rpf"),transactionsSupported:agVal("rps"),materialTransactionsApproved:agVal("rpa"),disclosuresComplete:agVal("rpd"),unusualTermsReviewed:agVal("rpu"),governmentRelated:agVal("rpg"),governmentConcentrationAssessed:agVal("rpgc")});
  else if(guideTab==="advanced"&&guideMode==="events")data=G().subsequentEvents({eventDateKnown:agVal("evdate"),authorizationDateKnown:agVal("evauthd"),beforeAuthorization:agVal("evbefore"),evidenceOfConditionAtReportingDate:agVal("evcond"),material:agVal("evmat"),dividendDeclaredAfterPeriod:agVal("evdiv"),affectsGoingConcern:agVal("evgc"),legalMatter:agVal("evlegal"),legalEvidenceObtained:agVal("evlegalev")});
  else data=G().cashFlow({framework:agVal("framework")||"SME",country:"SA",zakatPaid:agVal("zakat"),cashEquivalentsMaturityMonths:agVal("months"),overdraftRepayableOnDemandAndIntegralToCashManagement:agVal("overdraft"),nonCashTransactionsPresent:agVal("noncash"),financingCostNatureDocumented:agVal("financecost")});
  guideResult={tab:guideTab,data};paint();
}
function guideResultHTML(){
  if(!guideResult||guideResult.tab!==guideTab)return '<div class="cdx-guide-result"><h4>نتيجة التطبيق</h4><p class="hint">أجب عن الأسئلة ثم اضغط «حلّل». النتيجة قرار مساعد وليست اعتماداً مهنياً نهائياً.</p></div>';
  const d=guideResult.data;
  if(guideTab==="framework")return '<div class="cdx-guide-result"><div class="cdx-guide-verdict"><b>'+esc(d.label||d.framework)+'</b><small>'+esc(d.reason||"")+'</small></div><p class="hint">'+(d.mandatory?'الإطار إلزامي وفق الوقائع المدخلة.':'القرار يعتمد على اختيار المنشأة والوقائع؛ وثّق الأساس.')+'</p></div>';
  let head="";
  if(d.decision)head=({recognize:"يستوفي مؤشرات الاعتراف", "do-not-recognize":"لا يستوفي الاعتراف حالياً",review:"يحتاج حكماً مهنياً"}[d.decision]||d.decision);
  if(d.category)head=({policy:"تغيير سياسة محاسبية",estimate:"تغيير تقدير محاسبي","prior-period-error":"خطأ فترة سابقة",review:"يلزم فصل الوقائع"}[d.category]||d.category)+' · '+({retrospective:"أثر رجعي",prospective:"أثر مستقبلي","transition-provisions":"أحكام انتقالية","current-period":"الفترة الحالية",review:"مراجعة"}[d.treatment]||d.treatment);
  if(!head&&d.label)head=d.label;
  const rows=(d.checks||[]).map(x=>'<div class="cdx-guide-row '+x.status+'"><span class="cdx-guide-dot"></span><span><b>'+esc(x.label)+'</b><small>'+esc(x.detail||"")+'</small></span></div>').join("");
  const disc=(d.disclosures||d.disclosure||[]).length?'<details><summary>الإفصاحات / التوثيق المطلوب</summary><ul>'+(d.disclosures||d.disclosure).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></details>':"";
  return '<div class="cdx-guide-result">'+(head||d.reason?'<div class="cdx-guide-verdict">'+(head?'<b>'+esc(head)+'</b>':'')+(d.reason?'<small>'+esc(d.reason)+'</small>':'')+'</div>':'')+'<div class="cdx-guide-list">'+rows+'</div>'+disc+(d.order?'<p class="hint">ترتيب مقترح: '+esc(d.order.join(" ← "))+'</p>':'')+'<p class="hint">المراجعة البشرية مطلوبة قبل اعتماد المعالجة أو بيان الالتزام.</p></div>';
}
function guidanceCard(){
  return '<section class="card cdx-guide"><div class="card-h"><div><h3>المساعد التطبيقي للمعايير</h3><p>حوّلنا أفكار الإرشادات التطبيقية إلى قرارات وفحوص عملية داخل التطبيق — بدون نسخ الكتب كأرشيف.</p><div class="sk-seg cdx-guide-tabs">'+AG_TABS.map(([k,l])=>'<button type="button" data-ag-tab="'+k+'" aria-pressed="'+(guideTab===k)+'">'+esc(l)+'</button>').join("")+'</div></div><button type="button" class="btn primary sm" data-ag-run>حلّل</button></div><div class="card-b cdx-guide-grid"><div class="cdx-guide-form">'+guideForm()+'</div>'+guideResultHTML()+'</div></section>';
}

/* ---------- the library screen ---------- */
function cardOf(s){
  const st=STATUS[s.status]||["",""];
  return '<button type="button" class="cdx-c" data-std="'+esc(s.code)+'"><span class="std-b '+famCls(s.family)+'">'+esc(s.code)+'</span><span class="tx"><b>'+esc(s.titleAr)+'</b><small>'+esc(s.purpose)+'</small></span><span class="sksev '+st[1]+'">'+esc(st[0])+'</span></button>';
}
function updatesCard(){
  const u=upd(),pend=u.items.filter(i=>i.status==="pending"),ready=window.SKosifAI&&SKosifAI.ready();
  const srcs=U().OFFICIAL_SOURCES.map(s=>'<a class="cdx-src" href="'+esc(s.url)+'" target="_blank" rel="noopener"><b>'+esc(s.org)+'</b><small>'+esc(s.covers)+'</small></a>').join("");
  const item=i=>'<div class="cdx-u"><span class="std-b">'+esc(i.code)+'</span><div class="tx"><b>'+esc(i.change)+'</b><small>'+(i.effective?'السريان: '+esc(i.effective)+' · ':'')+(i.official?'مصدر رسمي مذكور':'مصدر من نتائج البحث الرسمية')+' · '+i.sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.title||"المصدر")+'</a>').join(" · ")+'</small></div>'+
    (i.status==="pending"?'<div class="sk-actions"><button type="button" class="btn sm primary" data-cx="approve" data-id="'+esc(i.code+"|"+i.change)+'">اعتماد</button><button type="button" class="btn sm" data-cx="dismiss" data-id="'+esc(i.code+"|"+i.change)+'">تجاهل</button></div>':'<span class="sksev '+(i.status==="approved"?"ok":"info")+'">'+(i.status==="approved"?"معتمد":"متجاهل")+'</span>')+'</div>';
  return '<section class="card"><div class="card-h"><div><h3>تحديث المعايير من المصادر الرسمية</h3><p>'+(u.checkedAt?'آخر فحص '+esc(u.checkedAt.slice(0,10))+' · ':'لم يُفحص بعد · ')+'السجل أُعد في '+esc(X().REGISTRY_DATE)+'. لا يُطبق أي تحديث قبل اعتمادك.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary sm" data-cx="check"'+(ready&&!busy?'':' disabled')+'>'+(busy?'جارٍ الفحص…':'فحص التحديثات عبر Gemini')+'</button></div></div><div class="card-b">'+
    (ready?'':'<p class="hint">يتطلب مفتاح Gemini — اضبطه في شاشة «مراجعة ميزان المراجعة».</p>')+
    '<div class="cdx-srcs">'+srcs+'</div>'+
    (u.items.length?'<h4 class="cdx-h">'+pend.length+' بانتظار الاعتماد من '+u.items.length+'</h4>'+u.items.slice().sort((a,b)=>(a.status!=="pending")-(b.status!=="pending")).map(item).join(""):'')+
  '</div></section>';
}
function paint(){
  if(!root)return;
  const all=list(),hits=X().searchCodex(q,all).filter(s=>fam==="all"||s.family===fam);
  const counts=Object.keys(FAM).map(k=>[k,all.filter(s=>s.family===k).length]);
  const up=all.filter(s=>s.status==="upcoming");
  root.innerHTML='<div class="skk4 cdx-k6">'+
      ['IFRS','IAS','ISA','SAUDI','EAS','EGYPT'].map((k,i)=>'<button type="button" class="skk4-t" data-fam="'+k+'"><span class="chip">'+SK.icon(["reports","ledger","check","governance","codex","zatca"][i])+'</span><span class="tx"><span>'+FAM[k]+'</span><b>'+counts.find(c=>c[0]===k)[1]+'</b><small>'+({ISA:"IAASB",SAUDI:"SOCPA · ZATCA · التجارة",EAS:"الهيئة العامة للرقابة المالية",EGYPT:"مصلحة الضرائب · قانون الشركات"}[k]||"IFRS Foundation")+'</small></span></button>').join("")+'</div>'+
    (up.length?'<section class="card cdx-up"><div class="card-b"><b>سريان قادم:</b> '+up.map(s=>'<button type="button" class="std-b '+famCls(s.family)+'" data-std="'+esc(s.code)+'">'+esc(s.code)+'</button> '+esc(s.effective)).join(" · ")+'</div></section>':'')+
    guidanceCard()+updatesCard()+
    '<section class="card"><div class="card-h"><div><h3>المدونة المحاسبية</h3><p>'+hits.length+' من '+all.length+' معياراً ومتطلباً — اضغط أي بطاقة لتفاصيلها ومصدرها الرسمي.</p></div></div><div class="card-b">'+
      '<div class="cdx-bar"><input type="search" data-cx-q placeholder="ابحث برقم المعيار أو موضوعه: IFRS 16، المخزون، الزكاة…" value="'+esc(q)+'"><div class="sk-seg">'+[["all","الكل"],...Object.entries(FAM)].map(([k,l])=>'<button type="button" data-fam="'+k+'" aria-pressed="'+(fam===k)+'">'+esc(l)+'</button>').join("")+'</div></div>'+
      '<div class="cdx-grid">'+(hits.map(cardOf).join("")||'<p class="empty">لا نتائج.</p>')+'</div></div></section>';
}
async function check(){
  if(busy)return;busy=true;paint();
  try{
    const codes=X().STANDARDS.map(s=>s.code),today=new Date().toISOString();
    const api=await SKosifAI.generate(U().buildUpdateCheckBody(codes,today.slice(0,10)),{timeout:240000});
    const r=U().parseUpdateResponse(api,today),d=upd(),key=i=>i.code+"|"+i.change;
    const have=new Set(d.items.map(key));
    save(KEY,{checkedAt:today,items:[...d.items,...r.items.filter(i=>!have.has(key(i)))]});
    toast(r.items.length?"وُجد "+r.items.length+" تحديث مدعوم بمصدر رسمي":"لا تحديثات جديدة من المصادر الرسمية"+(r.dropped?" (استُبعد "+r.dropped+" بلا مصدر رسمي)":""),"ok");
  }catch(e){toast(e.message,"bad")}
  finally{busy=false;paint()}
}
function bind(node){
  node.addEventListener("click",e=>{
    const gt=e.target.closest("[data-ag-tab]");if(gt){guideTab=gt.dataset.agTab;guideResult=null;paint();return}
    const gm=e.target.closest("[data-ag-mode]");if(gm){guideMode=gm.dataset.agMode;guideResult=null;paint();return}
    if(e.target.closest("[data-ag-run]")){runGuide();return}
    const s=e.target.closest("[data-std]");if(s){open(s.dataset.std);return}
    const f=e.target.closest("[data-fam]");if(f){fam=fam===f.dataset.fam&&f.classList.contains("skk4-t")?"all":f.dataset.fam;paint();return}
    const b=e.target.closest("[data-cx]");if(!b)return;
    if(b.dataset.cx==="check"){check();return}
    const d=upd(),i=d.items.find(x=>x.code+"|"+x.change===b.dataset.id);if(!i)return;
    i.status=b.dataset.cx==="approve"?"approved":"dismissed";save(KEY,d);toast(i.status==="approved"?"اعتُمد التحديث في السجل":"تم التجاهل","ok");paint();
  });
  node.addEventListener("input",e=>{if(e.target.matches("[data-cx-q]")){q=e.target.value;const pos=e.target.selectionStart;paint();const i=root.querySelector("[data-cx-q]");i.focus();try{i.setSelectionRange(pos,pos)}catch{}}});
}
window.SKosifCodex=Object.freeze({open,close,get,list});
SK.view("codex",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
})();

/* S.kosif — Accounting Application Guidance.
   Turns the user's SOCPA IFRS-for-SMEs application guides (sections 1–10) into deterministic
   decision support. This is not an archive and never auto-approves compliance.
   Final authority remains the effective standard in the Codex + human review. */
(()=>{
"use strict";
const bool=v=>v===true;
const check=(id,label,ok,detail,severity="blocker")=>({id,label,status:ok===undefined?"review":ok?"pass":"fail",severity,detail});
function recognition(i={}){
  const out=[check("past","حدث سابق",i.pastEvent,"يجب أن ينشأ البند عن حدث أو معاملة سابقة."),
    check("measure","قياس موثوق",i.measurableReliably,"يجب إمكان قياس المبلغ بدرجة موثوقة.")];
  if(i.kind==="asset"){
    out.push(check("control","سيطرة على المورد",i.controlledResource,"وجود منفعة مستقبلية وحده لا يكفي؛ يلزم سيطرة المنشأة على المورد."));
    out.push(check("benefit","منافع مستقبلية محتملة",i.probableFutureBenefit,"إذا لم تكن المنافع محتملة فلا يثبت أصل، مع مراجعة الإفصاح إن لزم."));
  }else if(i.kind==="liability"){
    out.push(check("obligation","التزام حالي قانوني أو ضمني",i.presentObligation&&(i.legalOrConstructiveObligation!==false),"يلزم التزام حالي؛ وقد يكون قانونياً أو ضمنياً."));
    out.push(check("outflow","تدفق موارد خارج محتمل",i.probableOutflow,"افحص احتمال خروج موارد لتسوية الالتزام."));
  }
  const failed=out.filter(x=>x.status==="fail"&&x.severity==="blocker"),review=out.filter(x=>x.status==="review");
  const decision=failed.length?"do-not-recognize":review.length?"review":"recognize";
  const disclosure=[];
  if(decision!=="recognize")disclosure.push("قيّم ما إذا كان البند يحتاج إفصاحاً كبند غير معترف به أو التزام/أصل محتمل.");
  if(i.material)disclosure.push("وثّق الحكم المهني وأساس القياس لأن البند ذو أهمية نسبية.");
  return{decision,checks:out,disclosure,humanReviewRequired:true};
}
function accountingChange(i={}){
  const error=!!i.failureOrMisuseOfReliableInformation||i.priorPeriodInformationWasAvailable===true;
  const estimate=!!i.newInformationOrNewExperience||!!i.changedMeasurementTechniqueOrAssumption;
  const policy=!!i.requiredByNewStandard||!!i.voluntaryPolicyChange||!!i.changedRecognitionMeasurementPresentationRule;
  const n=[error,estimate,policy].filter(Boolean).length;
  let category="review",treatment="review",reason="المعطيات غير كافية للتمييز بين سياسة وتقدير وخطأ.",disclosures=[];
  if(n>1)reason="المعطيات تشير إلى أكثر من نوع؛ افصل الوقائع قبل اختيار المعالجة.";
  else if(error){
    category="prior-period-error";treatment=i.material===false?"current-period":"retrospective";
    reason=i.material===false?"الخطأ غير الجوهري يمكن معالجته في الفترة الحالية وفق سياسة الأهمية النسبية الموثقة.":"خطأ فترة سابقة جوهري: أعد عرض المقارنات وصحح رصيد الافتتاح إلى أبكر فترة ممكنة عملياً.";
    disclosures=["طبيعة الخطأ ومبلغ التصحيح لكل بند وفترة متأثرة.","تصحيح رصيد افتتاح أبكر فترة معروضة أو سبب تعذر التحديد عملياً."];
  }else if(estimate){
    category="estimate";treatment="prospective";
    reason="معلومات أو خبرة جديدة / تحديث افتراض أو تقنية قياس: يعالج بأثر مستقبلي.";
    disclosures=["طبيعة ومبلغ أثر تغير التقدير في الفترة الحالية.","أثر الفترات المستقبلية إن أمكن تقديره."];
  }else if(policy){
    category="policy";
    if(i.requiredByNewStandard&&i.transitionSpecified){treatment="transition-provisions";reason="التغيير تفرضه متطلبات جديدة ولها أحكام انتقالية؛ اتبع الأحكام الانتقالية."}
    else{treatment="retrospective";reason="تغيير سياسة دون أحكام انتقالية خاصة: يطبق بأثر رجعي إلى أبكر فترة ممكنة عملياً."}
    disclosures=["طبيعة التغيير وسببه، ولماذا يوفر معلومات أكثر ملاءمة وموثوقية إن كان اختيارياً.","الأثر على المقارنات ورصيد الافتتاح إلى الحد الممكن عملياً."];
  }
  return{category,treatment,reason,disclosures,humanReviewRequired:true};
}
function presentation(i={}){
  const c=[
    check("comparatives","المعلومات المقارنة",i.hasComparatives,"اعرض الفترة المقارنة للمبالغ، وللمعلومات السردية عندما تلزم للفهم."),
    check("consistency","ثبات العرض",i.presentationConsistent,"لا تغيّر العرض إلا لتغير طبيعة النشاط أو متطلب مناسب."),
    check("current","متداول / غير متداول",i.currentNoncurrentApplied!==false,"استخدم تصنيفاً واضحاً للمتداول وغير المتداول متى كان مناسباً."),
    check("material","فصل البنود الجوهرية",i.materialItemsSeparated,"لا تخفِ بنداً جوهرياً داخل تجميع واسع."),
    check("offset","عدم المقاصة دون أساس",!i.unsupportedOffsetting,"لا تقاص الأصول والالتزامات أو الإيرادات والمصروفات بلا أساس."),
    check("xref","ربط القوائم بالإيضاحات",i.statementLinesCrossReferencedToNotes,"كل بند جوهري يجب أن يقود إلى الإيضاح الداعم.")
  ];
  if(i.presentationConsistent===false)c.push(check("reclass","شرح إعادة التصنيف",!!i.reclassificationExplained,"افصح عن طبيعة وسبب إعادة التصنيف وأثره.","warning"));
  if(i.ociExists!==undefined)c.push(check("oci","الدخل الشامل الآخر",!i.ociExists||!!i.ociPresented,"إذا نشأت بنود OCI اعرضها خارج الربح أو الخسارة وفق الإطار."));
  if(i.equityOpeningToClosingReconciled!==undefined)c.push(check("equity","تسوية حقوق الملكية",!!i.equityOpeningToClosingReconciled,"طابق كل مكوّن من الافتتاح إلى الإقفال."));
  return{checks:c,valid:!c.some(x=>x.status==="fail"&&x.severity==="blocker")};
}
function disclosures(i={}){
  const c=[
    check("entity","معلومات المنشأة",i.entityInfo,"الاسم والشكل القانوني والدولة والعنوان وطبيعة النشاط."),
    check("compliance","بيان الالتزام",i.complianceStatementHumanApproved,"بيان الالتزام يحتاج اعتماداً بشرياً؛ لا يعتمده التطبيق تلقائياً."),
    check("measurement","أسس القياس",i.measurementBases,"حدد أساس أو أسس القياس."),
    check("policies","السياسات المحاسبية الجوهرية",i.materialPolicies,"اعرض السياسات ذات الصلة بالبنود والقرارات الجوهرية."),
    check("support","إيضاحات البنود",i.statementSupportNotes,"رتّب المعلومات الداعمة بما يتبع ترتيب القوائم وبنودها."),
    check("judgements","فصل الأحكام عن التقديرات",i.judgementsSeparatedFromEstimates,"الأحكام المهنية ليست تقديرات قياس؛ افصل بينهما."),
    check("uncertainty","عدم تأكد التقدير",i.estimationUncertaintyDisclosed,"اذكر طبيعة البند ومبلغه الدفتري والافتراضات الرئيسية عند وجود مخاطر تعديل جوهري."),
    check("unrecognized","بنود غير معترف بها",i.unrecognizedItemsReviewed,"راجع الالتزامات/الأصول المحتملة والارتباطات حتى إن لم تظهر في صلب القوائم.","warning")
  ];
  return{checks:c,valid:!c.some(x=>x.status==="fail"&&x.severity==="blocker"),order:["بيان الالتزام","أسس القياس","السياسات المحاسبية","إيضاحات البنود بالترتيب","إفصاحات أخرى"],humanReviewRequired:true};
}
function cashFlow(i={}){
  const c=[];
  if(i.cashEquivalentsMaturityMonths!=null)c.push(check("cash-equivalents","معادلات النقد",i.cashEquivalentsMaturityMonths<=3?true:undefined,"الاستحقاق القصير — عادة ثلاثة أشهر أو أقل من تاريخ الاقتناء — مؤشر مهم مع فحص الغرض والسيولة ومخاطر تغير القيمة.","warning"));
  if(i.overdraftRepayableOnDemandAndIntegralToCashManagement!==undefined)c.push(check("overdraft","السحب على المكشوف",i.overdraftRepayableOnDemandAndIntegralToCashManagement?true:undefined,"إذا كان واجب السداد عند الطلب وجزءاً لا يتجزأ من إدارة النقد فقد يدخل ضمن النقد وما في حكمه؛ وإلا فهو تمويل.","warning"));
  if(i.country==="SA"&&i.framework==="SME"&&Number(i.zakatPaid||0)!==0)c.push(check("zakat","الزكاة المدفوعة",true,"اعرض الزكاة المدفوعة بشكل منفصل ضمن التدفقات التشغيلية وفق الإرشادات التطبيقية السعودية لمعيار المنشآت الصغيرة.","info"));
  if(i.nonCashTransactionsPresent)c.push(check("noncash","المعاملات غير النقدية",undefined,"لا تدخل المعاملة غير النقدية ضمن التدفقات نفسها؛ افصح عنها بما يمكّن من فهم أثرها.","warning"));
  if(i.financingCostNatureDocumented===false)c.push(check("finance-cost","طبيعة تكاليف التمويل",false,"وثّق طبيعة التمويل/الاستثمار والسياسة قبل التصنيف والإفصاح.","warning"));
  return{checks:c,humanReviewRequired:true};
}
window.SKosifAccountingGuidance=Object.freeze({recognition,accountingChange,presentation,disclosures,cashFlow});
})();
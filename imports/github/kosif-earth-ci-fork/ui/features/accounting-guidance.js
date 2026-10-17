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

function ifrs19Eligibility(i={}){
  const c=[
    check("subsidiary","المنشأة شركة تابعة",i.isSubsidiary,"IFRS 19 متاح فقط للمنشآت التابعة المؤهلة."),
    check("public-accountability","لا تخضع للمساءلة العامة",i.publicAccountability===false,"إذا كانت أدواتها متداولة/قيد الإدراج أو تحتفظ بأصول لقطاع عريض من الغير كنشاط رئيس فلا تكون مؤهلة."),
    check("parent-ifrs","المنشأة الأم تصدر قوائم موحدة وفق IFRS ومتاحة للاستخدام العام",i.parentProducesPublicIfrsConsolidated,"يلزم وجود قوائم موحدة للأم متوافقة مع IFRS ومتاحة للاستخدام العام."),
    check("full-ifrs","المنشأة تطبق متطلبات الاعتراف والقياس في IFRS الكاملة",i.usesFullIfrs,"IFRS 19 يخفف الإفصاحات؛ لا يستبدل قواعد الاعتراف والقياس في IFRS.")
  ];
  const fail=c.some(x=>x.status==="fail");
  const review=c.some(x=>x.status==="review");
  const decision=fail?"ineligible":review?"review":"eligible";
  const reason=decision==="eligible"?"تظهر المنشأة مؤهلة لاختيار IFRS 19 للإفصاحات المخفضة، مع بقاء الاعتراف والقياس وفق IFRS الكاملة."
    :decision==="ineligible"?"شرط أو أكثر من شروط الأهلية غير مستوفى؛ لا تستخدم IFRS 19 بناءً على الوقائع المدخلة."
    :"توجد وقائع غير محسومة؛ يلزم توثيق هيكل المجموعة وحالة المساءلة العامة قبل الاختيار.";
  return{decision,label:decision==="eligible"?"مؤهلة مبدئيًا لـ IFRS 19":decision==="ineligible"?"غير مؤهلة لـ IFRS 19":"أهلية IFRS 19 تحتاج مراجعة",reason,checks:c,
    disclosures:["وثّق سبب الأهلية وقرار اختيار IFRS 19.","تحقق من الإفصاحات المخفضة المنطبقة لكل معيار دون تغيير متطلبات الاعتراف والقياس."],
    effective:"1 يناير 2027",saudiAdoption:"اعتمدته SOCPA بتاريخ 26-12-2024 ضمن نسخة المعايير المحدثة 2025.",humanReviewRequired:true};
}

function ifrs18Readiness(i={}){
  const c=[
    check("categories","تصنيف بنود الربح أو الخسارة إلى التشغيل والاستثمار والتمويل والضريبة/الزكاة والعمليات المتوقفة",i.categoriesMapped,"أنشئ خريطة حسابات واضحة للفئات الجديدة."),
    check("subtotals","المجاميع الإلزامية محسوبة ومختبرة",i.mandatorySubtotalsReady,"يشمل الربح التشغيلي والربح قبل التمويل والضرائب بحسب الانطباق."),
    check("mpm-inventory","حصر مقاييس الأداء المحددة من الإدارة MPM",i.mpmInventoryComplete,"راجع التقارير العامة خارج القوائم لتحديد المقاييس التي تقع ضمن نطاق IFRS 18."),
    check("mpm-reconcile","مطابقة كل MPM مع أقرب مجموع IFRS",i.mpmReconciled,"يلزم بيان المصالحة وآثار الضريبة وحقوق غير المسيطرين عند الانطباق."),
    check("expenses","تحليل المصروفات التشغيلية المطلوب متاح",i.expenseAnalysisReady,"إذا عُرضت المصروفات حسب الوظيفة، جهّز معلومات الطبيعة المطلوبة في الإيضاحات."),
    check("aggregation","سياسة التجميع والتفصيل وأسماء البنود محدثة",i.aggregationPolicyUpdated,"اختبر ألا تحجب التجميعات الواسعة معلومات جوهرية."),
    check("comparatives","البيانات المقارنة وخطة الانتقال جاهزة",i.comparativesPrepared,"يتطلب التطبيق الأول إعادة عرض المقارنات وفق متطلبات الانتقال المنطبقة."),
    check("systems","مصادر البيانات والأنظمة تدعم التصنيفات والمصالحات الجديدة",i.systemsReady,"لا تجعل الإعداد اليدوي نهاية الفترة هو الضابط الوحيد.")
  ];
  const failed=c.filter(x=>x.status==="fail"),review=c.filter(x=>x.status==="review");
  const score=Math.round((c.filter(x=>x.status==="pass").length/c.length)*100);
  const decision=failed.length>=3?"not-ready":failed.length||review.length?"partial":"ready";
  const reason=decision==="ready"?"جاهزية مرتفعة للانتقال إلى IFRS 18 وفق عناصر الفحص المدخلة."
    :decision==="not-ready"?"توجد فجوات انتقال جوهرية؛ ابدأ بخريطة التصنيف وMPM والبيانات المقارنة قبل 2027."
    :"الجاهزية جزئية؛ أغلق عناصر الفحص غير المكتملة قبل التطبيق الإلزامي.";
  return{decision,label:"جاهزية IFRS 18 · "+score+"%",score,reason,checks:c,
    disclosures:["وثّق تقييم أثر IFRS 18 وخطة الانتقال.","احصر MPM المستخدمة في الاتصالات العامة واربطها بالمجاميع المحددة في IFRS."],
    effective:"1 يناير 2027",humanReviewRequired:true};
}

function relatedParties(i={}){
  const c=[
    check("register","سجل الأطراف ذات العلاقة محدث وموقع/معتمد",i.relatedPartyRegisterComplete,"ابدأ من الإدارة وكبار الملاك والإدارة العليا والمنشآت تحت السيطرة أو التأثير."),
    check("minutes","محاضر مجلس الإدارة واللجان والإدارة روجعت لاكتشاف أطراف/معاملات غير معروفة",i.minutesReviewed,"المحاضر قد تكشف معاملات لم تظهر في السجل المقدم."),
    check("controls","عملية تحديد وتسجيل الأطراف ذات العلاقة وضوابطها مفهومة",i.processAndControlsUnderstood,"وثّق من يحدد العلاقة وكيف تُراجع التغييرات خلال السنة."),
    check("confirm","الأرصدة الجوهرية تمت مصادقتها أو نُفذت إجراءات بديلة",i.balancesConfirmedOrAlternative,"اربط الرصيد بالطرف والشروط والتحصيل/السداد اللاحق عند الحاجة."),
    check("support","عينة المعاملات مختبرة بمستنداتها وشروطها",i.transactionsSupported,"لا تكتفِ باسم الطرف؛ افحص العقد والغرض والسعر والتوقيت."),
    check("approval","المعاملات الجوهرية خضعت للموافقات والحوكمة المطلوبة",i.materialTransactionsApproved,"غياب الموافقة أو تجاوزها يرفع مخاطر الغش والحوكمة."),
    check("disclosure","الإفصاحات تغطي طبيعة العلاقة والمعاملات والأرصدة والشروط",i.disclosuresComplete,"اختبر IAS 24 ومتطلبات المخاطر ذات الصلة مثل IFRS 7 عند الانطباق."),
    check("unusual","المعاملات غير الاعتيادية أو غير السوقية تم تقييمها",i.unusualTermsReviewed,"الشروط غير العادية أو المعاملات قرب نهاية الفترة تستلزم عناية إضافية.")
  ];
  if(i.governmentRelated)c.push(check("government","تركيز المعاملات مع الحكومة/المنشآت الحكومية مقيم ومفصح عنه",i.governmentConcentrationAssessed,"قيّم الإعفاءات المتاحة مع تقديم المؤشرات النوعية/الكمية المطلوبة ومخاطر التركّز."));
  const open=c.filter(x=>x.status!=="pass");
  const decision=open.length>=4?"high-risk":open.length?"needs-work":"controlled";
  const reason=decision==="controlled"?"لا تظهر فجوات تشغيلية في خطوات الأطراف ذات العلاقة المدخلة."
    :decision==="high-risk"?"عدة إجراءات أساسية غير مكتملة؛ اعتبر الأطراف ذات العلاقة منطقة مخاطر مرتفعة حتى إغلاقها."
    :"توجد فجوات محددة في الاكتمال أو الإثبات أو الإفصاح.";
  return{decision,label:decision==="controlled"?"مسار الأطراف ذات العلاقة مكتمل مبدئيًا":decision==="high-risk"?"مخاطر أطراف ذات علاقة مرتفعة":"الأطراف ذات العلاقة تحتاج استكمال",reason,checks:c,
    procedures:["مقارنة السجل مع محاضر المجلس واللجان.","مصادقة الأرصدة أو تنفيذ بدائل.","اختبار عينة المعاملات وشروطها وموافقاتها.","تقييم كفاية الإفصاح والتركيزات."],
    standards:["IAS 24","ISA 550"],humanReviewRequired:true};
}

function subsequentEvents(i={}){
  const within=i.beforeAuthorization===true;
  let decision="outside-review-window",label="بعد تاريخ اعتماد القوائم",reason="الحدث بعد تاريخ اعتماد القوائم؛ لا يصنف كحدث لاحق ضمن IAS 10 لهذه القوائم، مع تقييم أي مسؤوليات لاحقة بحسب الظروف.";
  const c=[
    check("date","تاريخ الحدث محدد",i.eventDateKnown,"يلزم تحديد تاريخ الحدث ومقارنته بتاريخ اعتماد القوائم."),
    check("authorization","تاريخ اعتماد القوائم ومن اعتمدها موثق",i.authorizationDateKnown,"الفترة اللاحقة تمتد حتى تاريخ اعتماد القوائم للإصدار.")
  ];
  if(within){
    if(i.affectsGoingConcern){
      decision="going-concern";label="حدث يؤثر في أساس الاستمرارية";reason="إذا دل الحدث على أن أساس الاستمرارية لم يعد مناسبًا فقد يتطلب تغيير أساس الإعداد، وليس مجرد إفصاح حدث غير معدل.";
    }else if(i.dividendDeclaredAfterPeriod){
      decision="non-adjusting-dividend";label="توزيعات معلنة بعد الفترة";reason="لا تُثبت كالتزام في تاريخ التقرير؛ تُفصح وفق المتطلبات المنطبقة.";
    }else if(i.evidenceOfConditionAtReportingDate===true){
      decision="adjusting";label="حدث مُعدِّل";reason="الحدث يقدم دليلاً إضافيًا عن ظروف كانت قائمة في تاريخ التقرير؛ عدّل الأرقام والإفصاحات المرتبطة.";
    }else if(i.evidenceOfConditionAtReportingDate===false){
      decision="non-adjusting";label="حدث غير مُعدِّل";reason=i.material===true?"لا تعدّل الأرقام، لكن افصح عن طبيعة الحدث وتقدير أثره المالي إذا كان جوهريًا.":"لا تعدّل الأرقام؛ قيّم ما إذا كان عدم الإفصاح قد يؤثر في قرارات المستخدمين.";
    }else{decision="review";label="يحتاج تحديد منشأ الظروف";reason="لم يُحسم هل الظروف كانت قائمة في تاريخ التقرير؛ افصل بين الدليل عن حالة قائمة وبين حدث نشأ بعد الفترة.";}
    c.push(check("condition","تحديد هل الظروف كانت قائمة بتاريخ التقرير",i.evidenceOfConditionAtReportingDate,"هذا هو الفاصل الأساسي بين المعدّل وغير المعدّل.","warning"));
    c.push(check("material","الأهمية النسبية للحدث مقيمة",i.material!==undefined,"الأحداث غير المعدلة الجوهرية تحتاج إفصاحًا عن الطبيعة والأثر المالي إن أمكن.","warning"));
  }
  if(i.legalMatter)c.push(check("legal","موقف الدعوى/المطالبة مدعوم بمراسلات أو تأكيد قانوني عند الحاجة",i.legalEvidenceObtained,"للمطالبات الجوهرية راجع المحامي الداخلي والخارجي واحصل على أدلة مناسبة."));
  const disclosures=[];
  if(["non-adjusting","non-adjusting-dividend"].includes(decision))disclosures.push("طبيعة الحدث بعد الفترة.","تقدير الأثر المالي أو بيان تعذر تقديره عند اللزوم.");
  if(decision==="adjusting")disclosures.push("تحديث الأرقام والإيضاحات المتأثرة وربط التعديل بدليل الحدث اللاحق.");
  if(decision==="going-concern")disclosures.push("إعادة تقييم أساس الإعداد وخطط الإدارة والإفصاحات المتعلقة بالاستمرارية.");
  return{decision,label,reason,checks:c,disclosures,standards:["IAS 10","ISA 560"],humanReviewRequired:true};
}

window.SKosifAccountingGuidance=Object.freeze({recognition,accountingChange,presentation,disclosures,cashFlow,ifrs19Eligibility,ifrs18Readiness,relatedParties,subsequentEvents});
})();
/* KOSIF accounting application guidance.
   Converts the user's SOCPA/IFRS-for-SMEs application guides (sections 2–10) into deterministic
   decision support instead of storing the PDFs as an archive. The source guides are explanatory,
   not a substitute for the currently effective standard; final compliance still goes through
   the codex/update workflow and human approval.

   Concepts encoded here:
   - recognition: definitions + probability + reliable measurement + control/present obligation
   - presentation: fair presentation, comparatives, consistency, material aggregation, no unsupported offset
   - disclosures: statement-to-note cross references, measurement bases, material policies,
     judgements separated from estimates, estimation uncertainty
   - accounting changes: policy vs estimate vs prior-period error; retrospective/prospective treatment
   - cash-flow review hints for KSA SME reporting (zakat shown separately in operating cash flows)
*/

export type DecisionStatus='pass'|'fail'|'review';
export type Severity='blocker'|'warning'|'info';

export type GuidanceCheck={
  id:string;
  label:string;
  status:DecisionStatus;
  severity:Severity;
  detail:string;
};

export type RecognitionInput={
  kind:'asset'|'liability'|'income'|'expense';
  pastEvent:boolean;
  measurableReliably:boolean;
  probableFutureBenefit?:boolean;
  probableOutflow?:boolean;
  controlledResource?:boolean;
  presentObligation?:boolean;
  legalOrConstructiveObligation?:boolean;
  material?:boolean;
};

export function assessRecognition(input:RecognitionInput){
  const checks:GuidanceCheck[]=[];
  const add=(id:string,label:string,ok:boolean|undefined,detail:string,severity:Severity='blocker')=>
    checks.push({id,label,status:ok===undefined?'review':ok?'pass':'fail',severity,detail});

  add('past-event','حدث سابق',input.pastEvent,'يلزم أن ينشأ البند عن حدث أو معاملة سابقة.');
  add('measurement','قياس موثوق',input.measurableReliably,'يجب إمكان قياس المبلغ بدرجة موثوقة.');

  if(input.kind==='asset'){
    add('control','سيطرة على المورد',input.controlledResource,'وجود منفعة مستقبلية وحده لا يكفي؛ يجب أن تكون المنشأة مسيطرة على المورد.');
    add('benefit','منافع اقتصادية مستقبلية محتملة',input.probableFutureBenefit,'إذا كانت المنافع غير محتملة فلا يثبت أصل؛ راجع الإفصاح عند اللزوم.');
  }else if(input.kind==='liability'){
    const obligation=input.presentObligation && (input.legalOrConstructiveObligation!==false);
    add('obligation','التزام حالي قانوني أو ضمني',obligation,'يلزم التزام حالي، وقد يكون قانونياً أو ضمنياً ناشئاً عن نمط ممارسة أو تعهد محدد.');
    add('outflow','تدفق موارد خارج محتمل',input.probableOutflow,'افحص احتمال خروج موارد لتسوية الالتزام.');
  }

  const blockers=checks.filter(c=>c.status==='fail'&&c.severity==='blocker');
  const review=checks.filter(c=>c.status==='review');
  const decision:blocker extends never ? never : 'recognize'|'do-not-recognize'|'review' =
    blockers.length?'do-not-recognize':review.length?'review':'recognize';

  const disclosures:string[]=[];
  if(decision!=='recognize') disclosures.push('قيّم ما إذا كان البند يحتاج إفصاحاً كبند غير معترف به أو التزام/أصل محتمل.');
  if(input.material) disclosures.push('وثّق الحكم المهني وأساس القياس لأن البند ذو أهمية نسبية.');
  return {decision,checks,disclosures,humanReviewRequired:true};
}

export type AccountingChangeInput={
  priorPeriodInformationWasAvailable?:boolean;
  failureOrMisuseOfReliableInformation?:boolean;
  newInformationOrNewExperience?:boolean;
  changedMeasurementTechniqueOrAssumption?:boolean;
  changedRecognitionMeasurementPresentationRule?:boolean;
  requiredByNewStandard?:boolean;
  transitionSpecified?:boolean;
  voluntaryPolicyChange?:boolean;
  material?:boolean;
  retrospectivePracticable?:boolean;
};

export type ChangeCategory='policy'|'estimate'|'prior-period-error'|'review';
export type ChangeTreatment='retrospective'|'prospective'|'transition-provisions'|'current-period'|'review';

export function classifyAccountingChange(i:AccountingChangeInput){
  let category:ChangeCategory='review',treatment:ChangeTreatment='review',reason='';
  const error=!!i.failureOrMisuseOfReliableInformation || i.priorPeriodInformationWasAvailable===true;
  const estimate=!!i.newInformationOrNewExperience || !!i.changedMeasurementTechniqueOrAssumption;
  const policy=!!i.requiredByNewStandard || !!i.voluntaryPolicyChange || !!i.changedRecognitionMeasurementPresentationRule;

  const flags=[error,estimate,policy].filter(Boolean).length;
  if(flags!==1){
    reason=flags===0?'المعطيات غير كافية للتمييز بين سياسة وتقدير وخطأ.':'المعطيات تشير إلى أكثر من نوع؛ يلزم فصل الوقائع قبل المعالجة.';
  }else if(error){
    category='prior-period-error';
    treatment=i.material===false?'current-period':(i.retrospectivePracticable===false?'retrospective':'retrospective');
    reason=i.material===false?'الخطأ غير الجوهري يمكن معالجته في الفترة الحالية وفق سياسة الأهمية النسبية الموثقة.':'خطأ فترة سابقة جوهري: إعادة عرض المقارنات وتصحيح أرصدة الافتتاح إلى أبكر فترة ممكنة عملياً.';
  }else if(estimate){
    category='estimate';treatment='prospective';
    reason='التغير نتج عن معلومات/خبرة جديدة أو تحديث افتراض/تقنية قياس؛ يعالج بأثر مستقبلي.';
  }else{
    category='policy';
    if(i.requiredByNewStandard&&i.transitionSpecified){treatment='transition-provisions';reason='التغيير تفرضه متطلبات جديدة ولها أحكام انتقالية؛ تتبع الأحكام الانتقالية.'}
    else {treatment='retrospective';reason='تغيير سياسة محاسبية بدون أحكام انتقالية خاصة: يطبق بأثر رجعي إلى أبكر فترة ممكنة عملياً.'}
  }

  const disclosures:string[]=[];
  if(category==='policy') disclosures.push('طبيعة التغيير وسببه ولماذا يوفر معلومات أكثر ملاءمة وموثوقية إن كان اختيارياً.','أثر التغيير على كل فترة مقارنة وإجمالي تعديل رصيد الافتتاح إلى الحد الممكن عملياً.');
  if(category==='estimate') disclosures.push('طبيعة ومبلغ أثر تغير التقدير في الفترة الحالية، وأثر الفترات المستقبلية إن أمكن تقديره.');
  if(category==='prior-period-error') disclosures.push('طبيعة الخطأ ومبلغ التصحيح لكل بند متأثر ولكل فترة معروضة.','مبلغ تصحيح رصيد الافتتاح لأبكر فترة معروضة، أو سبب تعذر تحديد الأثر عملياً.');
  return {category,treatment,reason,disclosures,humanReviewRequired:true};
}

export type PresentationInput={
  hasComparatives:boolean;
  presentationConsistent:boolean;
  reclassificationExplained?:boolean;
  currentNoncurrentApplied?:boolean;
  materialItemsSeparated:boolean;
  unsupportedOffsetting:boolean;
  ociExists?:boolean;
  ociPresented?:boolean;
  equityOpeningToClosingReconciled?:boolean;
  statementLinesCrossReferencedToNotes:boolean;
};

export function reviewPresentation(i:PresentationInput){
  const checks:GuidanceCheck[]=[];
  const add=(id:string,label:string,ok:boolean,detail:string,severity:Severity='blocker')=>checks.push({id,label,status:ok?'pass':'fail',severity,detail});
  add('comparatives','معلومات مقارنة',i.hasComparatives,'اعرض معلومات مقارنة للفترة السابقة للمبالغ، وللمعلومات السردية عندما تكون لازمة للفهم.');
  add('consistency','ثبات العرض من فترة لأخرى',i.presentationConsistent,'لا تغيّر العرض إلا لتغير طبيعة النشاط أو متطلب إطار مناسب.');
  if(!i.presentationConsistent)add('reclassification','تفسير إعادة التصنيف',!!i.reclassificationExplained,'عند تغيير العرض، افصح عن طبيعة وسبب إعادة التصنيف وأثره.','warning');
  add('current-noncurrent','متداول / غير متداول',i.currentNoncurrentApplied!==false,'طبّق تصنيفاً واضحاً للمتداول وغير المتداول متى كان مناسباً.');
  add('material-separation','فصل البنود ذات الأهمية النسبية',i.materialItemsSeparated,'لا تخفِ بنداً جوهرياً داخل تجميع واسع.');
  add('offsetting','عدم المقاصة دون أساس',!i.unsupportedOffsetting,'لا تُجرِ مقاصة بين الأصول والالتزامات أو الإيرادات والمصروفات دون أساس في الإطار.');
  if(i.ociExists!==undefined)add('oci','عرض الدخل الشامل الآخر',!i.ociExists||!!i.ociPresented,'إذا نشأت بنود دخل شامل آخر، اعرضها خارج الربح أو الخسارة بالطريقة الملائمة.');
  if(i.equityOpeningToClosingReconciled!==undefined)add('equity-reconciliation','تسوية حقوق الملكية',!!i.equityOpeningToClosingReconciled,'طابق كل مكوّن من رصيد الافتتاح إلى الإقفال مع الربح/الخسارة وOCI ومعاملات الملاك.');
  add('note-xref','إشارات مرجعية للإيضاحات',i.statementLinesCrossReferencedToNotes,'كل بند جوهري بالقوائم يجب أن يقود إلى الإيضاح الداعم.');
  const failed=checks.filter(c=>c.status==='fail');
  return {checks,valid:failed.filter(c=>c.severity==='blocker').length===0,summary:{passed:checks.length-failed.length,failed:failed.length,total:checks.length}};
}

export type DisclosureStructureInput={
  entityInfo:boolean;
  complianceStatementHumanApproved:boolean;
  measurementBases:boolean;
  materialPolicies:boolean;
  statementSupportNotes:boolean;
  otherDisclosures:boolean;
  judgementsSeparatedFromEstimates:boolean;
  estimationUncertaintyDisclosed:boolean;
  unrecognizedItemsReviewed:boolean;
};

export function reviewDisclosureStructure(i:DisclosureStructureInput){
  const ordered=[
    ['entity','معلومات المنشأة',i.entityInfo,'الاسم والشكل القانوني والدولة والعنوان وطبيعة النشاط.'],
    ['compliance','بيان الالتزام بالإطار',i.complianceStatementHumanApproved,'بيان الالتزام يحتاج مراجعة واعتماداً بشرياً؛ لا يعتمد آلياً.'],
    ['measurement','أسس القياس',i.measurementBases,'حدد أساس أو أسس القياس المستخدمة.'],
    ['policies','السياسات المحاسبية ذات الأهمية',i.materialPolicies,'اعرض السياسات ذات الصلة بالبنود والقرارات الجوهرية.'],
    ['support','الإيضاحات الداعمة للبنود',i.statementSupportNotes,'رتّب المعلومات الداعمة بما يتبع ترتيب القوائم وبنودها.'],
    ['other','الإفصاحات الأخرى',i.otherDisclosures,'أدرج الإفصاحات النظامية والمتخصصة الأخرى المنطبقة.'],
    ['judgements','فصل الأحكام عن التقديرات',i.judgementsSeparatedFromEstimates,'الأحكام المهنية ليست هي تقديرات القياس؛ افصل بينهما.'],
    ['uncertainty','مصادر عدم تأكد التقدير',i.estimationUncertaintyDisclosed,'اذكر طبيعة البند ومبلغه الدفتري والافتراضات الرئيسية عندما توجد مخاطر تعديل جوهري.'],
    ['unrecognized','بنود غير معترف بها',i.unrecognizedItemsReviewed,'راجع الالتزامات/الأصول المحتملة والارتباطات حتى إن لم تظهر في صلب القوائم.']
  ] as const;
  const checks:GuidanceCheck[]=ordered.map(([id,label,ok,detail])=>({id,label,status:ok?'pass':'fail',severity:id==='other'||id==='unrecognized'?'warning':'blocker',detail}));
  const blockers=checks.filter(c=>c.status==='fail'&&c.severity==='blocker');
  return {checks,valid:blockers.length===0,order:['بيان الالتزام','أسس القياس','السياسات المحاسبية','إيضاحات البنود بالترتيب','إفصاحات أخرى'],humanReviewRequired:true};
}

export type CashFlowReviewInput={
  framework:'IFRS'|'SME';
  country?:'SA'|'OTHER';
  zakatPaid?:number;
  cashEquivalentsMaturityMonths?:number;
  overdraftRepayableOnDemandAndIntegralToCashManagement?:boolean;
  nonCashTransactionsPresent?:boolean;
  financingCostNatureDocumented?:boolean;
};

export function reviewCashFlowPresentation(i:CashFlowReviewInput){
  const checks:GuidanceCheck[]=[];
  const add=(id:string,label:string,status:DecisionStatus,severity:Severity,detail:string)=>checks.push({id,label,status,severity,detail});
  if(i.cashEquivalentsMaturityMonths!=null)add('cash-equivalents','تعريف معادلات النقد',i.cashEquivalentsMaturityMonths<=3?'pass':'review','warning','المرجع التطبيقي يعتبر الاستحقاق القصير — عادة ثلاثة أشهر أو أقل من تاريخ الاقتناء — مؤشراً مهماً، مع فحص الغرض والسيولة ومخاطر تغير القيمة.');
  if(i.overdraftRepayableOnDemandAndIntegralToCashManagement!==undefined)add('overdraft','السحب على المكشوف',i.overdraftRepayableOnDemandAndIntegralToCashManagement?'pass':'review','warning','إذا كان واجب السداد عند الطلب وجزءاً لا يتجزأ من إدارة النقد فقد يدخل في النقد وما في حكمه؛ وإلا يعامل كتمويل.');
  if(i.country==='SA'&&i.framework==='SME'&&Number(i.zakatPaid||0)!==0)add('zakat','الزكاة المدفوعة', 'pass','info','اعرض الزكاة المدفوعة بشكل منفصل ضمن التدفقات التشغيلية وفق الإرشادات التطبيقية السعودية لمعيار المنشآت الصغيرة.');
  if(i.nonCashTransactionsPresent)add('noncash','المعاملات غير النقدية','review','warning','لا تدخل المعاملة غير النقدية ضمن التدفقات نفسها؛ افصح عنها ووفّر معلومات لفهم أثرها.');
  if(i.financingCostNatureDocumented===false)add('finance-costs','توثيق طبيعة تكاليف التمويل','fail','warning','وثّق طبيعة التمويل/الاستثمار والسياسة المستخدمة قبل التصنيف والإفصاح.');
  return {checks,humanReviewRequired:true};
}

/* KOSIF EARTH — Quiet contextual screen guide.
   The real capability registry is the source of truth. This guide never
   reads, mutates, copies or stores customer, accounting or audit data. */
(()=>{
"use strict";
const VERIFIED=Object.freeze({
 ledger:{needs:"شركة محاسبية وفترة محددة، دليل حسابات ومستندات القيود",steps:["اختر حسابات الشركة وفترة العمل","سجّل أو راجع القيود وتوازنها","راجع الأستاذ وميزان المراجعة"],result:"دفاتر الشركة وأرصدة قابلة للفحص داخل المحاسبة فقط."},
 smartmatch:{needs:"أوصاف بيع فعلية وقائمة الأصناف المعتمدة",steps:["جهّز أوصاف المبيعات","طابقها مع الأصناف المعروفة","راجع الأوصاف غير المطابقة"],result:"ربط أوصاف المبيعات بالأصناف، وليس تسوية كشف بنك."},
 reports:{needs:"تقرير وبيانات جاهزة للطباعة",steps:["اختر التقرير المطلوب","اضبط الهوية والتنسيق","عاين ثم اطبع أو احفظ"],result:"مستند قابل للطباعة؛ إعداد القوائم المالية وظيفة مستقلة."},
 reportingintake:{needs:"ميزان المراجعة والدفاتر أو ملفات المبيعات والمشتريات والبنوك",steps:["اختر الملفات المناسبة للفترة","ارفع البيانات للتحقق من وجودها","راجع قائمة النواقص قبل إعداد القوائم"],result:"بيانات مستلمة وفجوات ظاهرة للمراجعة قبل إعداد القوائم."},
 commerce:{needs:"طلبات العملاء وبنود الفواتير والتسويات",steps:["اختر الطلب أو الفاتورة","راجع البنود والمبالغ","تابع التحصيل والتسويات"],result:"ملف طلبات وتحصيل قابل للمراجعة."},
 inventory:{needs:"أصناف وأرصدة ومعلومات صلاحية",steps:["راجع المخزون المسجل","افحص نقاط إعادة الطلب","راجع تنبيهات الصلاحية"],result:"متابعة المخزون وحدود إعادة الطلب."},
 suppliers:{needs:"موردون وطلبات شراء وبيانات استلام",steps:["راجع بيانات المورد والشراء","تحقق من الاستلام والأوزان","راجع التكلفة الناتجة"],result:"سجل مشتريات وتكاليف مرتبطة بالموردين."},
 receivables:{needs:"أرصدة العملاء ومواعيد الاستحقاق",steps:["راجع أرصدة الذمم","افحص أعمار الديون","تابع التحصيل والفروقات"],result:"متابعة أعمار الذمم والتحصيل."},
 zatca:{needs:"بيانات بيع صحيحة وضريبة ومستند فاتورة",steps:["جهّز بنود الفاتورة","راجع احتساب الضريبة","راجع رمز QR وإصدار المستند"],result:"فاتورة مبسطة ضمن الوظائف المدعومة حاليًا."},
 tbreview:{needs:"ملف عميل مراجعة مستقل وفترة وميزان ومرفقات",steps:["حدّد ملف المراجعة ونطاق العمل","افحص الميزان والمستندات والاختبارات","راجع الملاحظات وأدلة التقرير"],result:"ملف مراجعة موثَّق يحتاج قرار المراجع البشري."},
 codex:{needs:"معيار محدد ومسألة محاسبية أو مراجعة",steps:["ابحث عن المعيار ذي الصلة","راجع المتطلب وإجراء المراجعة","تحقق من المصدر الرسمي قبل الاعتماد"],result:"مرجع معياري وإجراءات مراجعة قابلة للتحقق."},
 tasks:{needs:"مهمة ومسؤول وموعد مستهدف",steps:["أنشئ مهمة واضحة","أضف موعدًا ومسؤولًا","تابع حالتها حتى الإقفال"],result:"مهام قابلة للمتابعة حسب المواعيد والمسؤوليات."},
 productflow:{needs:"منتج أو بوكس ومكونات وتكاليف وأسعار",steps:["اختر المنتج ومكوناته","راجع تكاليف المكونات وسعر البيع","افحص أثر التغييرات على الربحية"],result:"تكوين تكلفة المنتج وهوامشه داخل استوديو المنتج."},
 salesintel:{needs:"مبيعات وفترات وبيانات عملاء مناسبة",steps:["اختر فترة المقارنة","راجع الشرائح والإيقاع والتوقع","افحص الاستثناءات قبل القرار"],result:"مقارنة فترات وتوقعات ومؤشرات مبيعات تحتاج مراجعة."},
 customers:{needs:"ملفات العملاء وطلباتهم وتحصيلهم",steps:["اختر العميل أو استورد ملفه","راجع سجل الطلبات والتحصيل","استخدم تبويبات العميل للمتابعة"],result:"عرض بيانات العميل المرتبطة بالطلبات والتحصيل."},
 decision:{needs:"سؤال واضح ومعلومات القرار والاستثناءات",steps:["صغ مسألة القرار","أضف المعطيات والاستثناءات","راجع التوصيات قبل اعتمادها"],result:"مسودة قرار مدعومة بالمعطيات، لا اعتماد آلي."},
 companies:{needs:"شركة محاسبية محددة وفترة مالية",steps:["راجع اسم الشركة وسياقها","اختر الفترة المطلوبة","احفظ تغييرات الشركة المصرح بها"],result:"إدارة سياق الشركة والفترات داخل دفاترها."},
 execreports:{needs:"فترة وبيانات تشغيلية ومالية للشركة",steps:["اختر التقرير وفترته","راجع الدخل والهدر والضريبة","تحقق من النتائج قبل التصدير"],result:"تقارير تنفيذية مبنية على البيانات المتاحة."}
});
const $=(s,r=document)=>r.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
let button=null,dialog=null,openFor="";
function ctx(){
 const sk=window.SK,core=window.SKosifCore;
 if(!sk?.caps||!core?.view)return null;
 const view=core.view(),cap=sk.caps.get(view);
 if(!cap)return null;
 const hub=sk.caps.hub(view)||cap;
 const gate=sk.gate?.current?.()||cap.gateway;
 return {sk,core,view,cap,hub,gate};
}
function line(parent,heading,value){
 const n=el("section","earth-screen-guide__field");
 n.append(el("h3","",heading),el("p","",value));
 parent.append(n);
}
function bullets(parent,heading,steps){
 const block=el("section","earth-screen-guide__field");
 block.append(el("h3","",heading));
 const list=el("ol","");
 steps.forEach(s=>list.append(el("li","",s)));
 block.append(list);parent.append(block);
}
function activePages(s){
 // Only routes that exist in the canonical registry and are permitted within
 // the CURRENT gateway. A Tools add-on in Accounting must be installed there.
 return (s.sk.caps.members(s.hub.id)||[])
  .filter(c=>c&&c.id!==s.view&&!c.hidden&&
    s.sk.caps.inGatewayOf(c,s.gate)&&
    (!s.sk.perm?.can||s.sk.perm.can(c.id)))
  .slice(0,7);
}
function relatedPages(parent,s,dialog){
 const pages=activePages(s);
 if(!pages.length)return;
 const block=el("section","earth-screen-guide__field");
 block.append(el("h3","","الخطوة التالية — افتح شاشة موجودة بالفعل"));
 const text=el("p","","اختار الوظيفة المناسبة. هنفضل داخل نفس القسم والشركة، ومش هتتنقل أي بيانات.");
 block.append(text);
 const list=el("div","earth-screen-guide__links");
 list.setAttribute("role","group");
 list.setAttribute("aria-label","شاشات موجودة مرتبطة بهذه المهمة");
 const companyId=s.sk.company?.current?.()?.id||"";
 for(const cap of pages){
   const b=el("button","earth-screen-guide__link",cap.label+" ←");
   b.type="button";
   b.dataset.capabilityId=cap.id;
   b.addEventListener("click",()=>{
     // A switch/reload can invalidate the old context while the modal is open.
     const now=ctx();
     if(!now||now.gate!==s.gate||now.hub.id!==s.hub.id||
        (now.sk.company?.current?.()?.id||"")!==companyId)return;
     const target=now.sk.caps.get(cap.id);
     if(!target||target.hidden||!now.sk.caps.inGatewayOf(target,now.gate)||
        (now.sk.perm?.can&&!now.sk.perm.can(target.id)))return;
     dialog.close();
     now.core.go(target.id);
   });
   list.append(b);
 }
 block.append(list);
 parent.append(block);
}
function show(){
 const s=ctx();
 if(!s||!button)return;
 if(dialog){dialog.close?.();dialog.remove()}
 const m=el("dialog","earth-screen-guide");
 m.id="earth-screen-guide";
 m.setAttribute("aria-labelledby","earth-screen-guide-title");
 m.dir="rtl";
 const body=el("div","earth-screen-guide__body");
 const header=el("header","earth-screen-guide__header");
 const heading=el("div","");
 heading.append(el("small","","KOSIF EARTH · دليل الشاشة"));
 const title=el("h2","",s.cap.label);title.id="earth-screen-guide-title";
 heading.append(title);
 const close=el("button","earth-screen-guide__close","إغلاق ×");close.type="button";close.addEventListener("click",()=>m.close());
 header.append(heading,close);body.append(header);
 const path=s.sk.caps.path(s.view)||s.cap.label;
 body.append(el("p","earth-screen-guide__path","أنت هنا: "+path));
 const own=s.cap.id===s.hub.id?s.cap:s.hub;
 const desc=s.cap.sub||own.sub||"هذه الشاشة تعرض وظيفة مسجلة داخل القسم الحالي.";
 line(body,"الشاشة دي بتعمل إيه؟",desc);
 let scope="مساحة أدوات مستقلة؛ لا تنتقل بيانات شركة محاسبية إليها تلقائيًا.";
 if(s.gate==="accounting")scope="تعمل داخل الشركة المحاسبية والفترة المختارتين فقط؛ لا تنقل البيانات إلى عميل مراجعة.";
 if(s.gate==="audit")scope="ملف مراجعة مستقل. لا يُستورَد دفتر شركة محاسبية إلا بإجراء ربط صريح.";
 line(body,"نطاق العمل",scope);
 // A verified parent process is NOT evidence that each of its child tabs
 // performs the very same task. Exact view evidence wins; otherwise stay
 // explicit that we only know the canonical registry description.
 const known=VERIFIED[s.cap.id]||(s.cap.id===s.hub.id?VERIFIED[s.hub.id]:null);
 if(known){
   line(body,"هتحتاج إيه؟",known.needs);
   bullets(body,"الخطوات",known.steps);
   line(body,"هتوصل لإيه؟",known.result);
 }else{
   line(body,"هتحتاج إيه؟",s.cap.sub||
     "افتح البيانات المتاحة لهذه الشاشة، وتأكد من الصلاحية ونطاق الشركة والفترة.");
   bullets(body,"الخطوات المقترحة",[
     "تأكد من اسم الشركة والقسم والفترة الظاهرة في التطبيق قبل بدء المهمة.",
     "استخدم وظائف الشاشة المسمّاة في السجل. افتح تبويباً مناسباً من الروابط التالية إن وُجد.",
     "راجع النتيجة داخل الشاشة نفسها؛ لا تعتمد على الوصف وحده كدليل لإنجاز المعالجة."
   ]);
   line(body,"هتوصل لإيه؟","استعراض الوظيفة المذكورة في وصف الشاشة، مع التحقق من مخرجاتها الفعلية قبل اتخاذ القرار.");
   body.append(el("p","earth-screen-guide__source",
     "مسار استرشادي من سجل وظائف KOSIF EARTH، وليس تأكيداً بأن كل المعالجات أو الصادرات مكتملة."));
 }
 relatedPages(body,s,m);
 const note=el("p","earth-screen-guide__note","هذا الدليل لا يحفظ بيانات ولا ينفّذ معاملات. الروابط تنقلك إلى شاشات مسموح بها فقط داخل نفس نطاق العمل.");
 body.append(note);m.append(body);document.body.append(m);
 dialog=m;openFor=s.view;
 m.addEventListener("close",()=>{m.remove();if(dialog===m)dialog=null;button?.focus({preventScroll:true})},{once:true});
 m.showModal();
}
function sync(){
 const t=$("#pg-title"),s=ctx();
 if(!t||!s)return;
 if(dialog&&openFor!==s.view){dialog.close();dialog=null}
 if(!button||!button.isConnected){
  button=el("button","earth-screen-guide__trigger","؟ دليل الشاشة");
  button.type="button";
  button.setAttribute("aria-haspopup","dialog");
  button.setAttribute("aria-controls","earth-screen-guide");
  button.addEventListener("click",show);
  t.after(button);
 }
 const atHome=!!$("#earth-goal-journey");
 button.hidden=atHome;
 button.setAttribute("aria-label","ما هدف شاشة "+s.cap.label+"، وما خطواتها والنتيجة؟");
}
function init(){
 addEventListener("sk:render",sync);
 window.SK?.bus?.on?.("gate",sync);
 sync();setTimeout(sync,140);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

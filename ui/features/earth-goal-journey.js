/* KOSIF EARTH — Goal → Steps → Result.
   Strict presentation/router-only layer. No storage, company mutation,
   audit-client selection, data transfer, or privileged capability escalation.
*/
(()=>{
"use strict";
const CONTENT=Object.freeze({
  accounting:{
    heading:"ماذا تريد أن تنجز في المحاسبة؟",
    lead:"اختر هدفك أولًا، ثم اتبع الخطوات للوصول إلى نتيجة واضحة داخل شركتك الحالية فقط.",
    goals:[
      {title:"أسجّل القيود",route:"ledger",action:"فتح الدفاتر",steps:["راجع دليل الحسابات الخاص بالشركة","أنشئ القيد ثم تحقّق من توازنه","راجع الأستاذ وميزان المراجعة"],result:"قيود متوازنة ودفاتر قابلة للمراجعة."},
      {title:"أطابق الحسابات",route:"smartmatch",action:"بدء المطابقة",steps:["جهّز ملفات البنك والدفتر","طابق المعاملات وحدّد الفروق","صدّر كشف الاستثناءات للتسوية"],result:"فروق واضحة وقائمة تسويات قابلة للمتابعة."},
      {title:"أُصدر القوائم",route:"reports",action:"فتح التقارير",steps:["تحقّق من أرصدة الفترة","اختر القوائم والفترة المناسبة","راجع النتائج وصدّر التقرير"],result:"قوائم مالية جاهزة للفحص والاعتماد."}
    ]
  },
  audit:{
    heading:"ما الهدف من ملف المراجعة؟",
    lead:"ابدأ من نطاق المهمة، ثم اجمع الأدلة، وانتهِ إلى مخرجات مراجعة موثقة. ملف المراجعة مستقل عن دفتر الشركة.",
    goals:[
      {title:"أبدأ مراجعة",route:"tbreview",action:"فتح ملف المراجعة",steps:["حدّد العميل والفترة ونطاق المهمة","ارفع ميزان المراجعة والمستندات","نفّذ الاختبارات ووثّق النتائج"],result:"ملف مراجعة قابل للتتبع وملاحظات موثقة."},
      {title:"أتابع الملاحظات",route:"auditissues",action:"فتح الملاحظات",steps:["استعرض الملاحظات المكتشفة","صنّف المخاطر واطلب أدلة إضافية","تحقّق من المعالجة والإقفال"],result:"سجل استثناءات وقرارات معالجة واضح."},
      {title:"أصدر التقرير",route:"auditreport",action:"فتح التقرير",steps:["راجع الأدلة والاختبارات المنفذة","تحقّق من النقاط المفتوحة","أعد التقرير للمراجعة البشرية"],result:"مسودة تقرير مستندة إلى الأدلة، لا رأي تلقائي بلا تحقق."}
    ]
  },
  tools:{
    heading:"ما المهمة التي تحتاج لها أداة؟",
    lead:"اختر وظيفة واحدة فقط. الأدوات إضافات اختيارية وليست بيانات مشتركة أو قسمًا مكررًا داخل المحاسبة.",
    goals:[
      {title:"أستكشف الأدوات",route:"helperdesk",action:"فتح الأدوات",steps:["حدّد المشكلة التي تريد حلها","اختر الأداة والملفات اللازمة لها","نفّذ المهمة وراجع المخرجات"],result:"أداة مختارة لاحتياج حقيقي، بدون زحام."},
      {title:"أنظّم المهام",route:"tasks",action:"فتح المهام",steps:["حدّد العمل والمسؤول عنه","أضف الخطوات والمواعيد","تابع الإنجاز حتى الإقفال"],result:"قائمة عمل قابلة للمتابعة والمساءلة."},
      {title:"أحلّل البيانات",route:"analyzer",action:"فتح التحليل",steps:["جهّز بيانات المهمة","شغّل التحليل المناسب","تحقّق من النتائج والتوصيات"],result:"تحليل قابل للمراجعة واتخاذ القرار."}
    ]
  }
});
const $=(s,r=document)=>r.querySelector(s);
let lastGate="", active=0, installed=false;
let watchedMain=null, mainObserver=null, scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  queueMicrotask(()=>{scheduled=false;sync();});
}
function watch(main){
  if(watchedMain===main)return;
  if(mainObserver)mainObserver.disconnect();
  watchedMain=main;
  // Only direct top-level screen replacements. Never observe company data
  // tables, forms or rows and never retain any payload.
  mainObserver=new MutationObserver(schedule);
  mainObserver.observe(main,{childList:true});
}
const root=()=>$(".main");
const state=()=>{
  const sk=window.SK,core=window.SKosifCore;
  if(!sk||!core||typeof core.view!=="function"||!sk.gate)return null;
  const gate=sk.gate.current(),home=sk.caps&&sk.caps.gatewayHome&&sk.caps.gatewayHome(gate);
  const view=core.view();
  if(!CONTENT[gate]||!home||home!==view)return null;
  return {sk,core,gate,home};
};
function allowed(sk,route){
  const cap=sk.caps.get(route);
  return !!cap && (!sk.perm||!sk.perm.can||sk.perm.can(route));
}
function node(name,className,text){
  const el=document.createElement(name);
  if(className)el.className=className;
  if(text!=null)el.textContent=text;
  return el;
}
function nextWork(main){
  const items=[...main.children];
  return items.find(el=>!el.classList.contains("earth-journey")&&!el.hidden);
}
function buildPlan(box,gate,sk,core){
  const content=CONTENT[gate],goal=content.goals[active]||content.goals[0];
  const plan=$(".earth-journey__plan",box);
  if(!plan)return;
  plan.replaceChildren();
  const head=node("div","earth-journey__plan-heading");
  head.append(node("b","",goal.title),node("small","","الخطوات المطلوبة → النتيجة المتوقعة"));
  const steps=node("ol","earth-journey__steps");
  for(const [i,step] of goal.steps.entries()){
    const item=node("li"),number=node("span","",String(i+1));
    number.setAttribute("aria-hidden","true");
    item.append(number,node("span","",step));
    steps.append(item);
  }
  const footer=node("div","earth-journey__outcome");
  const result=node("div","earth-journey__result");
  result.append(node("strong","","النتيجة"),node("span","",goal.result));
  const go=node("button","earth-journey__go",goal.action+" ←");
  go.type="button";
  const available=allowed(sk,goal.route);
  go.disabled=!available;
  if(!available)go.title="هذه الوظيفة غير متاحة لصلاحيات المستخدم الحالية";
  go.addEventListener("click",()=>{
    // The main router can be replaced during async company initialization,
    // particularly on slower touch devices. Always use the live router.
    const live=state();
    if(!live||live.gate!==gate||!allowed(live.sk,goal.route))return;
    if(live.core.view()!==goal.route)live.core.go(goal.route);
    else{
      const work=nextWork(root());
      if(work)work.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
    }
  });
  footer.append(result,go);
  plan.append(head,steps,footer);
  const buttons=[...box.querySelectorAll(".earth-journey__choice")];
  buttons.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===active)));
}
function create(s){
  const data=CONTENT[s.gate],box=node("section","earth-journey");
  box.id="earth-goal-journey";
  box.dataset.gateway=s.gate;
  box.setAttribute("aria-label","ابدأ بهدف واضح، ثم الخطوات والنتيجة");
  const inner=node("div","earth-journey__inner");
  inner.append(
    node("p","earth-journey__eyebrow","KOSIF EARTH  /  هدفك · خطواتك · نتيجتك"),
    node("h2","earth-journey__heading",data.heading),
    node("p","earth-journey__lead",data.lead)
  );
  const choices=node("div","earth-journey__choices");
  choices.setAttribute("role","group");
  choices.setAttribute("aria-label","اختر ما تريد إنجازه");
  data.goals.forEach((goal,i)=>{
    const button=node("button","earth-journey__choice",goal.title);
    button.type="button";
    button.setAttribute("aria-pressed",String(i===active));
    button.addEventListener("click",()=>{active=i;buildPlan(box,s.gate,s.sk,s.core);});
    choices.append(button);
  });
  const plan=node("div","earth-journey__plan");
  plan.setAttribute("aria-live","polite");
  plan.setAttribute("aria-atomic","true");
  inner.append(choices,plan);
  box.append(inner);
  buildPlan(box,s.gate,s.sk,s.core);
  return box;
}
function condenseDuplicateMap(main){
  // Do not move or reparent the legacy roadmap: it owns event handlers that can
  // be invalidated by the core render lifecycle, especially on small screens.
  // Hide the duplicate only on gateway home; all underlying screens stay intact.
  const roadmap=main.querySelector(":scope > .skjr");
  if(roadmap)roadmap.hidden=true;
  const guide=main.querySelector(":scope > .earth-journey");
  if(guide&&main.firstElementChild!==guide)main.prepend(guide);
}
function restoreRoadmap(main){
  const roadmap=main.querySelector(":scope > .skjr");
  if(roadmap)roadmap.hidden=false;
}
function sync(){
  const main=root();
  if(!main)return;
  watch(main);
  const current=state();
  let existing=$("#earth-goal-journey",main);
  if(!current){
    if(existing)existing.remove();
    restoreRoadmap(main);
    return;
  }
  if(lastGate!==current.gate){active=0;lastGate=current.gate;}
  if(existing&&existing.dataset.gateway===current.gate){
    condenseDuplicateMap(main);
    return;
  }
  if(existing)existing.remove();
  main.prepend(create(current));
  condenseDuplicateMap(main);
}
function boot(){
  if(installed)return;installed=true;
  addEventListener("sk:render",sync);
  if(window.SK&&SK.bus&&SK.bus.on)SK.bus.on("gate",()=>{active=0;lastGate="";queueMicrotask(sync);});
  // Run after the entry bridge and initial screen mount; no polling or mutation observers.
  queueMicrotask(sync);
  setTimeout(sync,120);
  setTimeout(sync,600); // the legacy roadmap can mount after the core render
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();

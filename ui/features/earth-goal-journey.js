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
      {title:"أسجّل القيود",route:"ledger",action:"فتح الدفاتر",needs:["الشركة والفترة المحاسبية","دليل الحسابات والمستند"],steps:["راجع دليل الحسابات الخاص بالشركة","أنشئ القيد ثم تحقّق من توازنه","راجع الأستاذ وميزان المراجعة"],result:"قيود متوازنة ودفاتر قابلة للمراجعة."},
      {title:"أطابق أوصاف المبيعات",route:"smartmatch",action:"فتح مطابقة المبيعات",needs:["أوصاف المبيعات أو ملفها","قائمة الأصناف المعتمدة"],steps:["جهّز أوصاف المبيعات وقائمة الأصناف","طابق أوصاف البيع بالأصناف الموجودة","راجع الاستثناءات قبل اعتماد النتائج"],result:"مطابقة أوصاف البيع بالأصناف؛ ليست أداة مطابقة بنك."},
      {title:"أجهّز تقارير للطباعة",route:"reports",action:"فتح مركز الطباعة",needs:["التقرير والبيانات المطلوب طباعتها","شعار الشركة عند الحاجة"],steps:["حدّد التقرير المطلوب طباعته","راجع التنسيق وهوية الشركة","عاين المستند واطبعه أو احفظه"],result:"مستند جاهز للطباعة؛ القوائم المالية تُعد من دفاتر الشركة."},
      {title:"أراجع حسابات شركتي",route:"ledger",tab:"tb",action:"مراجعة الميزان",needs:["الشركة والفترة الحالية","أرصدة الحسابات وقيود الفترة"],steps:["افتح ميزان المراجعة للشركة والفترة الحالية فقط","افحص اتزان الميزان وتفاصيل الحسابات في دفتر الأستاذ","راجع سلامة القيود والمطابقات قبل اعتماد النتائج"],result:"مراجعة داخلية لبيانات شركتك فقط؛ لا يُنشأ ملف مراجعة مستقل ولا تُنقل البيانات."}
    ]
  },
  audit:{
    heading:"ما الهدف من ملف المراجعة؟",
    lead:"ابدأ من نطاق المهمة، ثم اجمع الأدلة، وانتهِ إلى مخرجات مراجعة موثقة. ملف المراجعة مستقل عن دفتر الشركة.",
    goals:[
      {title:"أبدأ مراجعة",route:"tbreview",action:"فتح ملف المراجعة",needs:["عميل مراجعة مستقل وفترة المهمة","ميزان المراجعة والمستندات المتاحة"],steps:["حدّد العميل والفترة ونطاق المهمة","ارفع ميزان المراجعة والمستندات","نفّذ الاختبارات ووثّق النتائج"],result:"ملف مراجعة قابل للتتبع وملاحظات موثقة."},
      {title:"أتابع الملاحظات",route:"auditissues",action:"فتح الملاحظات",needs:["ملف مراجعة محدد وصلاحية الوصول","ملاحظات وأدلة قابلة للتتبع"],steps:["استعرض الملاحظات المكتشفة","صنّف المخاطر واطلب أدلة إضافية","تحقّق من المعالجة والإقفال"],result:"سجل استثناءات وقرارات معالجة واضح."},
      {title:"أصدر التقرير",route:"auditreport",action:"فتح التقرير",needs:["ملف مراجعة وأدلة مستوفاة","مراجعة بشرية للنقاط المفتوحة"],steps:["راجع الأدلة والاختبارات المنفذة","تحقّق من النقاط المفتوحة","أعد التقرير للمراجعة البشرية"],result:"مسودة تقرير مستندة إلى الأدلة، لا رأي تلقائي بلا تحقق."}
    ]
  },
  tools:{
    heading:"ما المهمة التي تحتاج لها أداة؟",
    lead:"اختر وظيفة واحدة فقط. الأدوات إضافات اختيارية وليست بيانات مشتركة أو قسمًا مكررًا داخل المحاسبة.",
    goals:[
      {title:"أستكشف الأدوات",route:"helperdesk",action:"فتح الأدوات",needs:["المهمة التي تريد إنجازها","ملفات المهمة عند الحاجة فقط"],steps:["حدّد المشكلة التي تريد حلها","اختر الأداة والملفات اللازمة لها","نفّذ المهمة وراجع المخرجات"],result:"أداة مختارة لاحتياج حقيقي، بدون زحام."},
      {title:"أنظّم المهام",route:"tasks",action:"فتح المهام",needs:["قائمة الأعمال","المسؤولون والمواعيد المستهدفة"],steps:["حدّد العمل والمسؤول عنه","أضف الخطوات والمواعيد","تابع الإنجاز حتى الإقفال"],result:"قائمة عمل قابلة للمتابعة والمساءلة."},
      {title:"أحسب تكلفة البوكس",route:"productflow",action:"فتح استوديو المنتج",needs:["مكونات المنتج أو البوكس","تكاليف المكونات وسعر البيع"],steps:["حدّد المنتج ومكوناته في استوديو المنتج","راجع تكلفة كل مكوّن وسعر البيع","حلّل أثر المكونات على التكلفة والربحية"],result:"تكوين تكلفة المنتج وأثر مكوّناته؛ ليس تحليلًا عامًا للبيانات."}
    ]
  }
});
const $=(s,r=document)=>r.querySelector(s);
let lastGate="", active=0, installed=false;
let readyTimer=0, readyAttempts=0;
/* Demo seeding and a company handoff can replace the page asynchronously.
   The guide must not offer a live action until both are settled. */
const isReady=(sk,gate)=>{
  if(gate!=="accounting")return true;
  const c=sk.company?.current?.();
  return !!(c?.id&&c.ownerScope==="FULL_ACCOUNTING"&&
    !window.SKosifSpace?.busy?.()&&
    (!sk.demo?.settled||sk.demo.settled()));
};
function scheduleReady(){
  if(readyTimer)return;
  const check=()=>{
    readyTimer=0;
    const s=state();
    if(!s||s.gate!=="accounting"){readyAttempts=0;return}
    sync();
    if(!isReady(s.sk,s.gate)&&++readyAttempts<160)
      readyTimer=setTimeout(check,250);
    else readyAttempts=0;
  };
  readyTimer=setTimeout(check,250);
}
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
  // Ledger is the accounting gateway home, but its TB, journal, reconciliations
  // and other tabs are real work screens — never cover them with the home guide.
  if(gate==="accounting"&&view==="ledger"){
    const tab=window.SKosifLedger?.current?.();
    if(tab&&!["close","accounts"].includes(tab))return null;
  }
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
  head.append(node("b","",goal.title),node("small","","المطلوب → الخطوات → النتيجة"));
  const needs=node("p","earth-journey__requirements");
  needs.append(node("strong","","هتحتاج: "),node("span","",goal.needs.join(" · ")));
  const steps=node("ol","earth-journey__steps");
  for(const [i,step] of goal.steps.entries()){
    const item=node("li"),number=node("span","",String(i+1));
    number.setAttribute("aria-hidden","true");
    item.append(number,node("span","",step));
    steps.append(item);
  }
  const companyAtRender=gate==="accounting"?sk.company?.current?.():null;
  const companyId=companyAtRender?.id||"";
  const ready=isReady(sk,gate);
  const footer=node("div","earth-journey__outcome");
  const result=node("div","earth-journey__result");
  result.append(node("strong","","النتيجة"),node("span","",goal.result));
  const go=node("button","earth-journey__go",goal.action+" ←");
  go.type="button";
  const available=ready&&allowed(sk,goal.route);
  go.disabled=!available;
  if(!ready){
    go.textContent=companyId?"جاري تجهيز الشركة...":"اختر شركة أولًا";
    go.title=companyId?"انتظر اكتمال تجهيز الشركة قبل بدء المهمة":"اختر شركة محاسبية أولًا";
  }else if(!available){
    go.title="هذه الوظيفة غير متاحة لصلاحيات المستخدم الحالية";
  }
  if(gate==="accounting")box.dataset.ready=String(ready);
  go.addEventListener("click",()=>{
    // The main router can be replaced during async company initialization,
    // particularly on slower touch devices. Always use the live router.
    const live=state();
    if(!live||live.gate!==gate||!allowed(live.sk,goal.route))return;
    if(gate==="accounting"){
      const now=live.sk.company?.current?.();
      // A stale home or delayed tap cannot accidentally act on another company.
      if(!companyId||now?.id!==companyId||now.ownerScope!=="FULL_ACCOUNTING"||
        window.SKosifSpace?.busy?.()||
        (live.sk.demo?.settled&&!live.sk.demo.settled()))return;
    }
    if(goal.tab&&goal.route==="ledger"){
      // Internal bookkeeping review opens ONLY the current company's ledger TB.
      // Never auto-import into SKosifTBReview or change the Audit gateway.
      const L=window.SKosifLedger;
      if(!L?.open){live.sk.toast?.("شاشة ميزان المراجعة غير جاهزة بعد","warn");return}
      L.open(goal.tab);
      return;
    }
    if(live.core.view()!==goal.route)live.core.go(goal.route);
    else{
      const work=nextWork(root());
      if(work)work.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
    }
  });
  footer.append(result,go);
  plan.append(head,needs,steps,footer);
  const buttons=[...box.querySelectorAll(".earth-journey__choice")];
  buttons.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===active)));
}
function create(s){
  const data=CONTENT[s.gate],box=node("section","earth-journey");
  box.id="earth-goal-journey";
  box.dataset.gateway=s.gate;
  const company=s.gate==="accounting"?s.sk.company?.current?.():null;
  box.dataset.companyId=company?.id||"";
  box.setAttribute("aria-label","ابدأ بهدف واضح، ثم الخطوات والنتيجة");
  const inner=node("div","earth-journey__inner");
  inner.append(
    node("p","earth-journey__eyebrow","KOSIF EARTH  /  هدفك · خطواتك · نتيجتك"),
    node("h2","earth-journey__heading",data.heading),
    node("p","earth-journey__lead",data.lead)
  );
  const scope=node("p","earth-journey__scope");
  if(s.gate==="accounting")
    scope.textContent=company?.id?"الشركة الحالية: "+company.name+" · مراجعة دفاتر هذه الشركة فقط":"اختر شركة محاسبية أولًا، ثم ابدأ هدفك";
  else if(s.gate==="audit")
    scope.textContent="مراجعة مستقلة: ملفاتها منفصلة عن دفتر أي شركة حتى تختار الربط صراحةً";
  else
    scope.textContent="مساحة أدوات مستقلة؛ شركات المحاسبة لا تُضاف تلقائيًا";
  inner.append(scope);
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
  const expectedCompany=current.gate==="accounting"?current.sk.company?.current?.()?.id||"":"";
  if(existing&&existing.dataset.gateway===current.gate&&existing.dataset.companyId===expectedCompany){
    if(current.gate==="accounting"&&
      existing.dataset.ready!==String(isReady(current.sk,current.gate))){
      buildPlan(existing,current.gate,current.sk,current.core);
    }
    condenseDuplicateMap(main);
    window.KOSIFEarthAddons?.attach?.(existing,current);
    if(current.gate==="accounting"&&current.sk.company?.current?.()?.id&&
      !isReady(current.sk,current.gate))
      scheduleReady();
    return;
  }
  if(existing)existing.remove();
  main.prepend(create(current));
  condenseDuplicateMap(main);
  window.KOSIFEarthAddons?.attach?.($("#earth-goal-journey",main),current);
  if(current.gate==="accounting"&&current.sk.company?.current?.()?.id&&
    !isReady(current.sk,current.gate))
    scheduleReady();
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

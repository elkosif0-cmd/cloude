/* KOSIF EARTH adaptive screen actions. Registry-only UI; no business data storage. */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const el=(tag,cls,value)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(value!=null)n.textContent=value;
 return n;
};
let disclosure=null,timer=0,attempts=0;
function plan(sk=window.SK,core=window.SKosifCore){
 if(!sk?.caps?.get||!core?.view||!sk.gate?.current)return null;
 const gate=sk.gate.current(),view=core.view(),cap=sk.caps.get(view);
 if(!["accounting","audit","tools"].includes(gate)||!cap)return null;
 const hub=sk.caps.hub?.(view)||cap;
 const company=sk.company?.current?.();
 const companyId=company?.id||"";
 let ready=true,reason="";
 if(gate==="accounting"){
   if(!companyId||company.ownerScope!=="FULL_ACCOUNTING"){
     ready=false;reason="اختر شركة محاسبية لعرض خطوات العمل المتاحة لها.";
   }else if(window.SKosifSpace?.busy?.()||
        (sk.demo?.settled&&!sk.demo.settled())){
     ready=false;reason="يجري تجهيز مساحة الشركة. الإجراءات متوقفة حتى تكتمل التهيئة.";
   }
 }
 const candidates=ready&&typeof sk.caps.members==="function"?
   (sk.caps.members(hub.id)||[]).filter(item=>item&&item.id!==view&&
     !item.hidden&&sk.caps.inGatewayOf?.(item,gate)&&
     (!sk.perm?.can||sk.perm.can(item.id)))
     .slice(0,3).map(item=>({id:item.id,label:item.label})):[];
 return {gate,view,companyId,ready,reason,candidates,capability:cap.label};
}
function dispatch(expected,id){
 const now=plan();
 if(!now||!expected.ready||!now.ready||now.gate!==expected.gate||
    now.view!==expected.view||now.companyId!==expected.companyId||
    !now.candidates.some(c=>c.id===id))return false;
 window.SKosifCore.go(id);
 return true;
}
function render(){
 const title=$("#pg-title"),state=plan();
 if(!title||!state||$("#earth-goal-journey")){
   disclosure?.remove();disclosure=null;return;
 }
 if(!disclosure||!disclosure.isConnected){
   disclosure=el("details","earth-adaptive");
   disclosure.id="earth-adaptive-actions";
   title.after(disclosure);
 }
 const wasOpen=disclosure.open;
 const summary=el("summary","earth-adaptive__summary",
   state.ready?"الخطوة التالية · "+state.capability:"الخطوة التالية · جاري التحقق");
 const body=el("div","earth-adaptive__contents");
 body.dir="rtl";
 const description=state.ready?
   (state.candidates.length?"انتقل إلى شاشة متاحة ضمن القسم نفسه، وفق الصلاحيات ودليل القدرات.":
   "لا توجد شاشة فرعية إضافية متاحة هنا. يمكنك متابعة الشاشة الحالية."):
   state.reason;
 body.append(el("p","earth-adaptive__description",description));
 if(state.candidates.length){
   const list=el("div","earth-adaptive__actions");
   list.setAttribute("role","group");
   list.setAttribute("aria-label","انتقالات متاحة في مساحة العمل الحالية");
   state.candidates.forEach(candidate=>{
     const button=el("button","earth-adaptive__action",candidate.label+" ←");
     button.type="button";
     button.addEventListener("click",()=>dispatch(state,candidate.id));
     list.append(button);
   });
   body.append(list);
 }
 body.append(el("small","earth-adaptive__note",
   "اقتراحات التنقل لا تنفذ معاملات ولا تنقل سجلات بين الشركات أو الأقسام."));
 disclosure.replaceChildren(summary,body);
 disclosure.open=wasOpen;
 disclosure.dataset.ready=String(state.ready);
 if(!state.ready&&state.gate==="accounting"&&!timer&&attempts<120){
   timer=setTimeout(()=>{timer=0;attempts++;render()},250);
 }else if(state.ready){attempts=0;}
}
function init(){
 window.addEventListener("sk:render",render);
 window.SK?.bus?.on?.("gate",render);
 render();
 setTimeout(render,180);
}
window.KOSIFEarthIntelligentUI=Object.freeze({plan,dispatch,render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();

/* S.kosif core — الترابط بين الأقسام (SK.flow).
   منظومة واحدة لا شاشات منفصلة:
   • «مسار العمل» تحت عنوان كل شاشة: ما يغذيها (قبلها) وما تغذيه (بعدها)، من حقل feeds في سجل القدرات،
     بضغطة تنتقل إلى الخطوة التالية.
   • الإرسال بين الأقسام: أي ملاحظة (مراجعة، تحليل، مجلس) تصبح مهمة أو ملاحظة في «المخاطر والملاحظات»
     بزر واحد، وتحمل رابط الشاشة التي جاءت منها.
   الأزرار: data-flow-task / data-flow-finding مع data-title, data-detail, data-sev, data-cap. */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
function strip(){
  const ph=document.querySelector(".sk-ph");if(!ph||!SK.caps||!SK.caps.flow)return;
  const v=core()&&core().view(),f=SK.caps.flow(v),can=c=>!c.hidden&&(!SK.perm||SK.perm.can(c.id));
  const from=f.from.filter(can),to=f.to.filter(can);let el=ph.querySelector(".skflow");
  if(!from.length&&!to.length){if(el)el.remove();return}
  const chip=c=>'<button type="button" class="skflow-c" data-flow-go="'+c.id+'" title="'+esc(c.sub||"")+'">'+(SK.icons[c.id]||"")+'<span>'+esc(c.label)+'</span></button>';
  const h=(from.length?'<span class="skflow-l">يأتي من</span>'+from.slice(0,5).map(chip).join(""):'')+'<span class="skflow-me" aria-current="page">'+esc((SK.caps.get(v)||{}).label||"")+'</span>'+(to.length?'<span class="skflow-l">يذهب إلى</span>'+to.slice(0,6).map(chip).join(""):'');
  if(!el){el=document.createElement("nav");el.className="skflow";el.setAttribute("aria-label","مسار العمل");ph.appendChild(el)}
  if(el.dataset.v!==v){el.innerHTML=h;el.dataset.v=v}
}
/* a finding sent to «المخاطر والملاحظات» */
function toFinding({title,detail,sev,area,cap}){
  const d=Object.assign({risks:[],findings:[]},load("skosif_risks_v1",{})),y=new Date().getFullYear();
  if(d.findings.some(x=>x.title===title&&x.status!=="closed")){toast("الملاحظة موجودة في السجل","info");return false}
  d.findings.push({id:"f-"+Date.now().toString(36),ref:"AF-"+y+"-"+String(d.findings.length+1).padStart(3,"0"),title:String(title||"ملاحظة").slice(0,200),detail:String(detail||"").slice(0,1000),
    area:area||((SK.caps.get(cap)||{}).label||""),severity:["high","medium","low"].includes(sev)?sev:"medium",status:"open",owner:"",date:new Date().toISOString().slice(0,10),from:cap||""});
  save("skosif_risks_v1",d);SK.audit&&SK.audit.log("flow",{act:"finding",from:cap});toast("أُضيفت إلى «المخاطر والملاحظات»","ok");return true;
}
function toTask({title,cap,sev}){
  if(!window.SKosifTasks||!SKosifTasks.add)return false;
  SKosifTasks.add({title:String(title||"").slice(0,200),cap:cap||"",priority:sev==="high"?"high":"normal"});SK.audit&&SK.audit.log("flow",{act:"task",from:cap});toast("أُضيفت إلى المهام","ok");return true;
}
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-flow-go]");if(g){core()&&core().go(g.dataset.flowGo);return}
  const t=e.target.closest("[data-flow-task]");if(t){toTask({title:t.dataset.title,cap:t.dataset.cap||(core()&&core().view()),sev:t.dataset.sev});return}
  const f=e.target.closest("[data-flow-finding]");if(f){toFinding({title:f.dataset.title,detail:f.dataset.detail,sev:f.dataset.sev,cap:f.dataset.cap||(core()&&core().view())})}
});
SK.bus&&SK.bus.on("render",()=>setTimeout(strip,0));
SK.bus&&SK.bus.on("nav",()=>setTimeout(strip,0));
/* the two buttons any screen can put beside a finding */
const actions=(o)=>{const a=' data-title="'+esc(o.title)+'" data-detail="'+esc(o.detail||"")+'" data-sev="'+esc(o.sev||"medium")+'" data-cap="'+esc(o.cap||"")+'"';
  return '<span class="skflow-acts"><button type="button" class="linkish" data-flow-task'+a+'>+ مهمة</button><button type="button" class="linkish" data-flow-finding'+a+'>+ سجل الملاحظات</button></span>'};
SK.flow=Object.freeze({toFinding,toTask,actions,strip});
})();

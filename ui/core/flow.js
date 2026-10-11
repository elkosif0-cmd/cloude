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
  const from=f.from.filter(can),to=f.to.filter(can);let el=ph.querySelector(".skflow"),btn=ph.querySelector(".skflow-btn");
  if(!from.length&&!to.length){if(el)el.remove();if(btn)btn.remove();return}
  /* the chips stay folded behind one button in the head (R1: one page head, DEEP_REVIEW_20261007); the choice lasts the session */
  const open=sessionStorage.getItem(FLOW_OPEN)==="1",host=ph.querySelector(".hdr")||ph;
  if(!btn){btn=document.createElement("button");btn.type="button";btn.className="skflow-btn btn sm";btn.setAttribute("aria-controls","skflow");host.appendChild(btn)}
  else if(btn.parentElement!==host)host.appendChild(btn);
  const n=from.length+to.length;if(btn.dataset.n!==String(n)){btn.innerHTML=ICON+'<span>مرتبط</span><i class="sk-pill">'+n+'</i>';btn.dataset.n=String(n)}
  btn.setAttribute("aria-expanded",String(open));btn.title=open?"إخفاء ما يغذي هذه الشاشة وما تغذيه":"ما يغذي هذه الشاشة وما تغذيه";
  const chip=c=>'<button type="button" class="skflow-c" data-flow-go="'+c.id+'" title="'+esc(c.sub||"")+'">'+(SK.icons[c.id]||"")+'<span>'+esc(c.label)+'</span></button>';
  const h=(from.length?'<span class="skflow-l">يأتي من</span>'+from.slice(0,5).map(chip).join(""):'')+'<span class="skflow-me" aria-current="page">'+esc((SK.caps.get(v)||{}).label||"")+'</span>'+(to.length?'<span class="skflow-l">يذهب إلى</span>'+to.slice(0,6).map(chip).join(""):'');
  if(!el){el=document.createElement("nav");el.className="skflow";el.id="skflow";el.setAttribute("aria-label","مسار العمل");ph.appendChild(el)}
  if(el.dataset.v!==v){el.innerHTML=h;el.dataset.v=v}
  el.hidden=!open;
}
const FLOW_OPEN="sqc_flow_open",ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h6m4 0h6"/><circle cx="12" cy="12" r="2"/><path d="m15 8 4 4-4 4M9 8l-4 4 4 4"/></svg>';
document.addEventListener("click",e=>{const b=e.target.closest(".skflow-btn");if(!b)return;const open=b.getAttribute("aria-expanded")!=="true";sessionStorage.setItem(FLOW_OPEN,open?"1":"0");strip()});
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
/* ---------- «رحلة العمل» on the command centre: how the whole app works, stage by stage, with live status ---------- */
const L=(k,d)=>{const v=load(k,d);return v==null?d:v};
function idbCount(store){return SK.legacyCompanyData.read(store).then(rows=>rows.length)}
async function journey(root){
  /* the dashboard can render twice in a row: one journey per render (flag before the awaits, re-check after them) */
  if(!root||root.querySelector(".skjr")||root.dataset.skjrBusy)return;
  root.dataset.skjrBusy="1";
  try{await journeyBuild(root)}finally{delete root.dataset.skjrBusy}
}
async function journeyBuild(root){
  const cat=(core()&&core().catalog().items.length)||0,cust=await idbCount("customers"),orders=await idbCount("orders"),pur=(L("skosif_purchasing_v1",{}).orders||[]).length,
    led=L("skosif_ledger_v1",{}),posted=new Set((led.entries||[]).filter(e=>!e.reversedBy).map(e=>e.sourceId).filter(Boolean)),pend=(L("aghnam-v12-manual-sales",[])||[]).filter(x=>x&&!posted.has("sale:"+x.id)).length,
    tb=L("skosif_tbreview_v1",{}),eng=tb.engagement&&tb.engagement.state,fnd=((L("skosif_risks_v1",{}).findings)||[]).filter(f=>f.status!=="closed").length,tasks=(L("skosif_tasks_v1",[])||[]).filter(t=>!t.done).length;
  const ST={new:"لم يبدأ",setup:"الإعداد",analysis:"التحليل","council":"مداولة المجلس","awaiting-client":"بانتظار العميل","human-review":"مراجعة بشرية","draft-report":"مسودة التقرير",approved:"معتمد"};
  const S=[["companies","البيانات الأساسية","الشركة والفترة، الكتالوج والأسعار، العملاء — يدوياً أو بقوالب الاستيراد",cat&&cust?["ok",cat+" صنف · "+cust+" عميل"]:["warn","أكمل الكتالوج والعملاء"],cat?"catalog":"companies"],
    ["commerce","العمليات اليومية","الطلبات والفواتير، الموردون وأوامر الشراء، المخزون والتتبع",orders||pur?["ok",orders+" طلب · "+pur+" أمر شراء"]:["info","لا عمليات بعد"],"commerce"],
    ["ledger","الدفاتر المحاسبية","كل بيع واستلام يُرحّل بقيد متوازن؛ ومنها ميزان المراجعة والقوائم",(led.entries||[]).length?(pend?["warn",pend+" عملية بانتظار الترحيل"]:["ok",(led.entries||[]).length+" قيد مرحّل"]):["info","أنشئ الدليل وابدأ الترحيل"],"ledger"],
    ["tbreview","المراجعة","ملف المراجعة من الدفاتر: المعايير، المجلس الذكي، الأدلة، التسويات",tb.tbText?[eng==="approved"?"ok":"warn","الملف: "+(ST[eng]||"جاهز")+(fnd?" · "+fnd+" ملاحظة مفتوحة":"")]:["info","أرسل الميزان من الدفاتر"],"tbreview"],
    ["decision","التقارير والقرار","التقارير التنفيذية، الطباعة والتصدير، القرارات والمهام",tasks?["warn",tasks+" مهمة مفتوحة"]:["ok","لا مهام متأخرة"],"execreports"]];
  if(root.querySelector(".skjr"))return;
  const el=document.createElement("section");el.className="skjr";el.setAttribute("aria-label","رحلة العمل");
  el.innerHTML='<ol>'+S.map((x,i)=>'<li><button type="button" data-flow-go="'+x[4]+'"><span class="n">'+(i+1)+'</span><b>'+esc(x[1])+'</b><small>'+esc(x[2])+'</small><span class="st '+x[3][0]+'">'+esc(x[3][1])+'</span></button></li>').join("")+'</ol>';
  const br=root.querySelector(":scope>.skbrief"),demo=root.querySelector(":scope>.skdemo");if(br)br.after(el);else if(demo)demo.after(el);else root.prepend(el);
}
function bootJourney(){const c=core();if(c&&c.onView)c.onView("dash",r=>setTimeout(()=>journey(r),0));else setTimeout(bootJourney,300)}
bootJourney();
SK.flow=Object.freeze({toFinding,toTask,actions,strip});
})();

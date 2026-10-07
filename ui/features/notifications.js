/* S.kosif — مركز الإشعارات (window.SKosifNotify + شاشة «notifications»).
   يجمع ما يستحق الانتباه من سجلات التطبيق نفسها — لا إشعارات مصطنعة:
     • استثناءات القرار من قواعد التطبيق (أصناف بخسارة، تحت الهدف، اعتمادات…)
     • المهام: متأخرة، مستحقة اليوم، قريبة الاستحقاق (يومان)
     • سجل المخاطر: مخاطر عالية مفتوحة، مواعيد معالجة فائتة، ملاحظات عالية الأثر
     • المشتريات: استلامات بفرق وزن أو حرارة · قائمة أرقام المتابعة
     • الدفاتر: موعد إقرار الضريبة، عملاء متأخرون، عمليات لم تُرحّل، مطابقة البنك، شهر لم يُقفل
     • النظام: أخطاء آخر 24 ساعة
     • نشاطك: النسخ والاستعادة والنقل وتغيير الدور (تُعرض مقروءة)
   حالة القراءة ووقت أول ظهور محفوظان على الجهاز (skosif_notify_v1). */
(()=>{
"use strict";
const {esc,load,save}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_notify_v1",DAY=864e5;
const today=()=>new Date().toISOString().slice(0,10);
const TYPES={all:"الكل",unread:"غير مقروءة",task:"المهام",risk:"المخاطر",alert:"التنبيهات",system:"النظام"};
const ICON={task:"tasks",risk:"alert",alert:"alert",activity:"check",system:"settings"};
let cache=null,cacheAt=0,filter="all",root=null;

function st(){const d=load(KEY,{})||{};return{seen:d.seen||{},read:d.read||{}}}
function collect(){
  const out=[],add=x=>out.push(x),t=today();
  /* 1. decision exceptions (the core's rule inbox) */
  try{(core().exceptions()||[]).forEach(x=>add({id:"ex:"+x.title,type:"alert",sev:x.sev==="critical"?"bad":x.sev==="warn"?"warn":"info",title:x.title,detail:x.detail,view:x.view||"decision"}))}catch{}
  /* 2. tasks */
  (load("skosif_tasks_v1",[])||[]).filter(k=>!k.done&&k.due).forEach(k=>{
    const soon=new Date(Date.now()+2*DAY).toISOString().slice(0,10);
    if(k.due<t)add({id:"tk-over:"+k.id,type:"task",sev:"bad",title:"مهمة متأخرة",detail:k.title+" — كان موعدها "+k.due,view:"tasks"});
    else if(k.due===t)add({id:"tk-due:"+k.id,type:"task",sev:"warn",title:"مهمة مستحقة اليوم",detail:k.title,view:"tasks"});
    else if(k.due<=soon)add({id:"tk-soon:"+k.id,type:"task",sev:"info",title:"موعد استحقاق قريب",detail:k.title+" — "+k.due,view:"tasks"});
  });
  const q=((load("skosif_followup_v1",{})||{}).queue||[]).filter(x=>!x.done).length;
  if(q)add({id:"fu:"+q,type:"task",sev:"info",title:"أرقام بانتظار الاتصال",detail:q+" رقماً في قائمة متابعة العملاء.",view:"followup"});
  /* 3. risk register */
  const R=load("skosif_risks_v1",{})||{};
  (R.risks||[]).filter(r=>r.status!=="closed").forEach(r=>{
    const sc=(+r.likelihood||1)*(+r.impact||1);
    if(sc>=6)add({id:"rk-high:"+r.id,type:"risk",sev:"bad",title:"خطر مرتفع مفتوح",detail:(r.ref?r.ref+" · ":"")+r.title,view:"risks"});
    if(r.due&&r.due<t)add({id:"rk-due:"+r.id+":"+r.due,type:"risk",sev:"warn",title:"موعد معالجة خطر فات",detail:r.title+" — "+r.due,view:"risks"});
  });
  (R.findings||[]).filter(f=>f.status!=="resolved"&&f.severity==="high").forEach(f=>add({id:"af:"+f.id,type:"risk",sev:"bad",title:"ملاحظة عالية الأثر مفتوحة",detail:(f.ref?f.ref+" · ":"")+f.title,view:"risks"}));
  /* 4. purchasing receipts to review */
  ((load("skosif_purchasing_v1",{})||{}).receipts||[]).filter(r=>r.inspection&&r.inspection.overallStatus==="REVIEW"&&!r.reviewed).forEach(r=>add({id:"rc:"+(r.id||r.at),type:"alert",sev:"warn",title:"استلام يحتاج مراجعة",detail:"فرق وزن أو حرارة خارج الحد"+(r.supplier?" — "+r.supplier:""),view:"purchasing"}));
  /* 5. cold chain */
  const cold=load("skosif_v38_coldchain",[]),c0=Array.isArray(cold)&&cold[0];
  if(c0&&c0.temp!=null&&Number(c0.temp)>4)add({id:"cold:"+(c0.at||c0.time||c0.temp),type:"alert",sev:"bad",title:"قراءة تبريد خارج الحد",detail:Number(c0.temp)+"°م"+(c0.loc?" — "+c0.loc:""),view:"traceability"});
  /* 6. system errors (last 24h) */
  (SK.errors.list()||[]).filter(e=>Date.now()-Date.parse(e.at)<DAY&&e.where!=="asset").slice(0,5).forEach(e=>add({id:"er:"+e.at,type:"system",sev:"warn",title:"تعذّر إكمال عملية",detail:String(e.msg||"").slice(0,120),view:"health",at:Date.parse(e.at)}));
  /* 7. the books: VAT deadline, customers overdue, operations not posted, bank not reconciled, month not closed */
  try{(window.SKosifClose?SKosifClose.alerts():[]).forEach(x=>add({id:"bk:"+x.id,type:"alert",sev:x.sev,title:x.title,detail:x.detail,view:"ledger",ledgerTab:x.tab,q:x.q}))}catch{}
  /* 8. own activity (read by default) */
  const ACT={backup:["نسخة كاملة للتطبيق","ok"],restore:["استعادة بيانات","warn"],transfer:["نقل بين الأجهزة","info"],role:["تغيير الدور","info"]};
  (SK.audit.all()||[]).filter(e=>ACT[e.type]&&Date.now()-Date.parse(e.at)<7*DAY).slice(0,8).forEach(e=>{const a=ACT[e.type];
    add({id:"au:"+e.at+":"+e.type,type:"activity",sev:a[1],title:"تم: "+a[0],detail:e.type==="role"?"الدور الحالي: "+(SK.caps.roles()[e.to]||{}).label:e.keys!=null?e.keys+" مفتاح بيانات":e.act==="send"?"أُرسلت حزمة نقل":e.act==="receive"?"استُقبلت حزمة نقل":"",view:e.type==="transfer"?"devices":"settings",at:Date.parse(e.at),self:true})});
  return out;
}
function items(){
  if(cache&&Date.now()-cacheAt<3000)return cache;
  const s=st(),now=Date.now(),list=collect();let dirty=false;
  list.forEach(x=>{if(!x.at){if(!s.seen[x.id]){s.seen[x.id]=now;dirty=true}x.at=s.seen[x.id]}x.unread=!x.self&&!s.read[x.id]});
  if(dirty){const ids=new Set(list.map(x=>x.id));Object.keys(s.seen).forEach(k=>{if(!ids.has(k))delete s.seen[k]});Object.keys(s.read).forEach(k=>{if(!ids.has(k))delete s.read[k]});save(KEY,s)}
  cache=list.sort((a,b)=>(b.unread-a.unread)||(b.at-a.at));cacheAt=now;
  return cache;
}
const unread=()=>items().filter(x=>x.unread).length;
function markRead(ids){const s=st();ids.forEach(id=>{s.read[id]=1});save(KEY,s);cache=null;SK.bus.emit("notify",{});if(root&&root.isConnected)paint()}
const markAll=()=>markRead(items().filter(x=>x.unread).map(x=>x.id));
function open(id){const x=items().find(i=>i.id===id);if(!x)return;markRead([id]);
  if(x.ledgerTab&&window.SKosifLedger&&SK.perm.can("ledger")){SKosifLedger.open(x.ledgerTab,{q:x.q});return}
  if(x.view&&SK.caps.get(x.view)&&SK.perm.can(x.view))core().go(x.view)}
const rtf=new Intl.RelativeTimeFormat("ar-u-nu-latn",{numeric:"auto"});
function ago(ts){const d=(ts-Date.now())/1000,a=Math.abs(d);return a<60?"الآن":a<3600?rtf.format(Math.round(d/60),"minute"):a<86400?rtf.format(Math.round(d/3600),"hour"):rtf.format(Math.round(d/86400),"day")}
function rowHTML(x){
  return '<button type="button" class="skn-row'+(x.unread?' unread':'')+'" data-nid="'+esc(x.id)+'"><span class="ico '+esc(x.sev==="info"?"":x.sev==="ok"?"ok":x.sev)+'">'+SK.icon(ICON[x.type]||"alert")+'</span>'+
    '<span class="tx"><b>'+esc(x.title)+'</b>'+(x.detail?'<span>'+esc(x.detail)+'</span>':'')+'<time>'+esc(ago(x.at))+'</time></span><span class="go" aria-hidden="true">‹</span></button>';
}

/* ---------- the screen ---------- */
function paint(){
  if(!root)return;
  const all=items(),count=k=>k==="all"?all.length:k==="unread"?all.filter(x=>x.unread).length:all.filter(x=>x.type===k).length;
  const list=all.filter(x=>filter==="all"||(filter==="unread"?x.unread:x.type===filter));
  const groups={};list.forEach(x=>{const d=Math.floor((Date.now()-x.at)/DAY),g=d<1?"اليوم":d<2?"أمس":d<7?"هذا الأسبوع":"أقدم";(groups[g]=groups[g]||[]).push(x)});
  root.innerHTML='<section class="card skn-screen"><div class="card-b"><div class="skn-top"><div class="sk-chips skn-filters" role="tablist">'+Object.entries(TYPES).map(([k,l])=>{const n=count(k);return(k==="all"||k==="unread"||n)?'<button type="button" class="chip" role="tab" data-f="'+k+'" aria-selected="'+(filter===k)+'">'+esc(l)+(n?' <b>'+n+'</b>':'')+'</button>':''}).join("")+'</div>'+(unread()?'<button type="button" class="btn sm" data-n="all">تعليم الكل كمقروء</button>':'')+'</div>'+
    (list.length?Object.entries(groups).map(([g,xs])=>'<h4 class="skn-day">'+esc(g)+'</h4><div class="skn-list">'+xs.map(rowHTML).join("")+'</div>').join(""):SK.ui.state.success({title:filter==="unread"?"لا إشعارات غير مقروءة":"لا إشعارات الآن",text:"كل المؤشرات ضمن الحدود."}))+
  '</div></section>';
}
function bind(node){
  node.addEventListener("click",e=>{
    const f=e.target.closest("[data-f]");if(f){filter=f.dataset.f;paint();return}
    if(e.target.closest('[data-n="all"]')){markAll();return}
    const r=e.target.closest("[data-nid]");if(r)open(r.dataset.nid);
  });
}
SK.view("notifications",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}cache=null;paint()}});
SK.bus.on("data",d=>{if(d&&d.key!==KEY)cache=null});
window.SKosifNotify=Object.freeze({items,unread,markRead,markAll,open,rowHTML,ago});
})();

/* S.kosif — نبض اليوم (window.SKosifPulse): what the company needs today, on the command centre under the morning brief.
   Today's orders and their revenue, what was collected today, the unpaid orders, the last seven days; the customers to
   call today by the sales engine's own rhythm (due and overdue, the most valuable first) with WhatsApp; and the month
   close's readiness band — Ready / Almost / Blocked / At Risk — with its blockers named by their numbers and the nearest
   deadline first (the reading of period-close readiness views in the research program). Reads only: the core's orders
   and payments, SKosifSalesIntel.snapshot, SKosifClose.steps, SKosifLedger.vat, SKosifBankStatement.pulse. It never writes a record. */
(()=>{
"use strict";
const {$,esc}=SK;
const core=()=>window.SKosifCore;
const DAY=864e5,iso=t=>new Date(t).toISOString().slice(0,10),today=()=>iso(Date.now()),day=s=>String(s||"").slice(0,10);
const nf=(v,d=0)=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:d}).format(Number(v)||0);
const sar=v=>nf(v,2)+" ر.س",riyal=h=>nf(Math.round((Number(h)||0)/100))+" ر.س";
const normPhone=p=>{let s=String(p||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"");if(s.startsWith("966"))s="0"+s.slice(3);if(s.length===9&&s.startsWith("5"))s="0"+s;return s};
const wa=p=>{const s=normPhone(p);return s?"https://wa.me/966"+s.replace(/^0/,""):""};
const isPaid=s=>/^(مدفوع|paid|captured|مكتمل)$/i.test(String(s||"").trim()),isCanceled=s=>/ملغ|cancel/i.test(String(s||""));
const STATUS={overdue:"متأخر",due:"حان الموعد"};
const BAND={ready:["جاهز للإقفال","ok"],almost:["شبه جاهز","info"],blocked:["متوقف","warn"],atRisk:["في خطر — موعد قريب","bad"]};

/* ---------- the model (pure) ---------- */
/* today's figures from the core's records: orders dated today, payments dated today (net of refunds), the unpaid orders
   and the last seven days */
function todayFigures(orders,payments,t){
  const live=(orders||[]).filter(o=>o&&!isCanceled(o.status)),todays=live.filter(o=>day(o.date)===t);
  const revenue=todays.reduce((s,o)=>s+(Number(o.orderTotal)||0),0);
  const collected=(payments||[]).filter(p=>p&&day(p.date)===t).reduce((s,p)=>s+(Number(p.capturedAmount??p.amount)||0)-(Number(p.refundedAmount)||0),0);
  const unpaid=live.filter(o=>o.paymentStatus&&!isPaid(o.paymentStatus)),outstanding=unpaid.reduce((s,o)=>s+(Number(o.orderTotal)||0),0);
  const t0=Date.parse(t),week=live.filter(o=>{const d=Date.parse(day(o.date));return d<=t0&&t0-d<7*DAY}).reduce((s,o)=>s+(Number(o.orderTotal)||0),0);
  return{orders:todays.length,revenue,collected,unpaidCount:unpaid.length,outstanding,week};
}
/* the customers to call today: due and overdue by the engine's rhythm, overdue first, the most valuable first */
function callList(followup,n=6){return (followup||[]).filter(c=>c&&(c.status==="overdue"||c.status==="due")).sort((a,b)=>((b.status==="overdue")-(a.status==="overdue"))||((b.monthlyValue||0)-(a.monthlyValue||0))).slice(0,n)}
/* the readiness band of the month close from its steps (ok / warn / bad / na) and the deadlines ahead:
   Ready = locked or every step ok · Almost = no step stopped and at most one needs an action · Blocked = otherwise ·
   At Risk overrides Almost and Blocked when a deadline is within seven days */
function readiness(steps,opts={}){
  const t=opts.today||today(),S=Array.isArray(steps)?steps:[],active=S.filter(s=>s.st!=="na");
  /* the lock step is the outcome, not a blocker: it is not counted among the actions still needed */
  const work=active.filter(s=>s.id!=="lock"),bad=work.filter(s=>s.st==="bad"),warn=work.filter(s=>s.st==="warn"),locked=S.some(s=>s.id==="lock"&&s.st==="ok");
  const runway=(opts.deadlines||[]).filter(d=>d&&/^\d{4}-\d{2}-\d{2}/.test(d.due)).map(d=>({...d,days:Math.round((Date.parse(d.due)-Date.parse(t))/DAY)})).sort((a,b)=>a.days-b.days);
  let band=locked||(!bad.length&&!warn.length)?"ready":(!bad.length&&warn.length<=1)?"almost":"blocked";
  if(band!=="ready"&&runway.length&&runway[0].days<=7)band="atRisk";
  return{band,label:BAND[band][0],tone:BAND[band][1],bad:bad.length,warn:warn.length,locked,done:active.filter(s=>s.st==="ok").length,of:active.length,
    blockers:[...bad,...warn].map(s=>({id:s.id,title:s.title,note:s.note,st:s.st})),next:runway[0]||null};
}

/* ---------- the data ---------- */
let cache=null,at=0,loading=null;
async function loadAll(){
  const idb=s=>SK.store&&SK.store.idbAll?SK.store.idbAll(s).catch(()=>[]):Promise.resolve([]);
  const [orders,payments,res]=await Promise.all([idb("orders"),idb("payments"),window.SKosifSalesIntel?SKosifSalesIntel.snapshot("all").catch(()=>null):null]);
  const t=today(),fig=todayFigures(orders,payments,t),calls=callList(res&&!res.empty?res.followup:[]);
  let close=null;
  if(window.SKosifClose&&window.SKosifLedger){try{
    const steps=SKosifClose.steps(),deadlines=[];const L=SKosifLedger,d=new Date(),q=Math.floor(d.getUTCMonth()/3),lq=q?d.getUTCFullYear()+"-Q"+q:(d.getUTCFullYear()-1)+"-Q4";
    const v=L.vat&&L.vat(lq);if(v&&!v.settled&&(v.r.outputVat||v.r.inputVat))deadlines.push({id:"vat",label:"إقرار ضريبة "+v.q.label,due:v.q.due});
    /* the close checklist's open tasks (owners' sign-offs, certified reconciliations) are blockers too, and its
       nearest due date is a deadline (close-checklist-engine via SKosifClose.readiness) */
    const R=SKosifClose.readiness&&SKosifClose.readiness();
    const extra=R&&!R.locked?R.blockers.map(b=>({id:"cl:"+b.id,title:b.title_ar,note:b.detail_ar,st:b.status==="blocked"?"bad":"warn"})):[];
    if(R&&!R.locked&&R.blockers.length){const due=R.blockers.map(b=>b.due).sort()[0];if(due)deadlines.push({id:"close",label:"مهام الإقفال",due})}
    close=readiness([...steps,...extra],{today:t,deadlines});close.month=SKosifClose.month();
  }catch(e){close=null}}
  /* the bank statement's open items since the last certified period (ui/features/bank-statement.js), when a statement was imported */
  let bank=null;try{bank=window.SKosifBankStatement&&SKosifBankStatement.pulse?SKosifBankStatement.pulse():null}catch(e){bank=null}
  return{t,fig,calls,close,bank,hasSales:!!(res&&!res.empty)};
}
function refresh(){if(loading)return loading;loading=loadAll().then(d=>{cache=d;at=Date.now();loading=null;return d}).catch(e=>{loading=null;SK.errors&&SK.errors.report&&SK.errors.report(e,"pulse");return null});return loading}

/* ---------- the card ---------- */
function tile(k,title,value,sub,tone,go){return '<button type="button" class="skpulse-t tone-'+tone+'" data-pulse-go="'+esc(go)+'"><span class="k">'+esc(title)+'</span><b>'+esc(value)+'</b><small>'+esc(sub)+'</small></button>'}
function html(d){
  const f=d.fig,tiles=[
    tile("orders","طلبات اليوم",String(f.orders),f.orders?sar(f.revenue):"لا طلبات مسجلة اليوم",f.orders?"ok":"info","commerce"),
    tile("collected","تحصيل اليوم",sar(f.collected),f.collected?"صافي المدفوعات المسجلة اليوم":"لا مدفوعات مسجلة اليوم",f.collected?"ok":"info","commerce"),
    tile("unpaid","طلبات غير مدفوعة",String(f.unpaidCount),f.unpaidCount?sar(f.outstanding)+" مستحقة":"كل الطلبات مدفوعة",f.unpaidCount?"warn":"ok","receivables"),
    tile("week","آخر 7 أيام",sar(f.week),"إيراد الطلبات غير الملغاة","info","salesintel")];
  if(d.bank)tiles.push(tile("bank","منذ آخر مطابقة بنكية",String(d.bank.unmatched),d.bank.sub,d.bank.tone,"ledger:recon"));
  const calls=d.calls.length?'<ul class="skpulse-list">'+d.calls.map(c=>'<li><span class="who"><b>'+esc(c.name||c.phone||c.id)+'</b><small>'+esc(STATUS[c.status]||"")+' · منذ '+c.daysSince+' يوماً · المتوقع '+esc(c.expected)+'</small></span><span class="val">'+riyal(c.monthlyValue)+'<small>شهرياً</small></span>'+
      (c.phone?'<a class="btn sm" href="'+esc(wa(c.phone))+'" target="_blank" rel="noopener">واتساب</a>':'')+'<button type="button" class="btn sm" data-pulse-go="customerflow" data-customer="'+esc(c.id)+'">الاستوديو</button></li>').join("")+'</ul>'
    :'<p class="skpulse-empty">'+(d.hasSales?"لا عميل تأخر عن إيقاعه اليوم.":"لا سجلات مبيعات بعد؛ الإيقاع يُحسب من سجل المبيعات.")+'</p>';
  const c=d.close,close=c?'<div class="skpulse-band"><span class="sk-pill '+(c.tone==="ok"?"good":c.tone)+'">'+esc(c.label)+'</span><b>'+c.done+' من '+c.of+' خطوات</b>'+(c.next?'<small>'+esc(c.next.label)+' خلال '+c.next.days+' يوماً ('+esc(c.next.due)+')</small>':'<small>لا موعد نظامي خلال الأيام القادمة</small>')+'</div>'+
      (c.blockers.length?'<ol class="skpulse-blockers">'+c.blockers.slice(0,4).map(b=>'<li class="st-'+b.st+'"><b>'+esc(b.title)+'</b><small>'+esc(b.note)+'</small></li>').join("")+'</ol>':'<p class="skpulse-empty">لا عوائق — '+(c.locked?"الشهر مقفل.":"يمكن إقفال الشهر.")+'</p>')+
      '<div class="sk-actions"><button type="button" class="btn sm" data-pulse-close="1">فتح الإقفال الشهري</button></div>'
    :'<p class="skpulse-empty">الدفاتر لم تُنشأ بعد؛ أنشئ دليل الحسابات لتظهر جاهزية الإقفال.</p>';
  const date=new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{weekday:"long",day:"numeric",month:"long"});
  return '<section class="skpulse card" aria-label="نبض اليوم"><header><div><span class="eyebrow">مؤشرات اليوم</span><h3>نبض اليوم</h3></div><span>'+esc(date)+' — من الطلبات والمدفوعات ومحرك الإيقاع والدفاتر</span></header>'+
    '<div class="skpulse-g'+(tiles.length>4?' n5':'')+'">'+tiles.join("")+'</div><div class="skpulse-cols"><section><h4>للاتصال اليوم<small>بإيقاع كل عميل</small></h4>'+calls+'</section><section><h4>جاهزية الإقفال<small>'+esc(c&&c.month?c.month:"")+'</small></h4>'+close+'</section></div></section>';
}
function mount(root){
  if(!root||!root.isConnected)return;
  let box=root.querySelector(":scope > .skpulse");
  const d=cache;if(!d)return;
  const h=html(d);
  if(box){if(box.outerHTML!==h)box.outerHTML=h}
  else{const brief=root.querySelector(":scope > .skbrief"),skc=root.querySelector(":scope > .skc");const el=document.createElement("div");el.innerHTML=h;box=el.firstElementChild;if(brief)brief.after(box);else if(skc)skc.after(box);else root.prepend(box)}
  box=root.querySelector(":scope > .skpulse");
  if(box&&!box.dataset.bound){box.dataset.bound="1";box.addEventListener("click",e=>{
    const g=e.target.closest("[data-pulse-go]");if(g){const c=core();if(!c)return;if(g.dataset.pulseGo.startsWith("ledger:")){if(window.SKosifLedger&&SKosifLedger.open)SKosifLedger.open(g.dataset.pulseGo.slice(7));else c.go("ledger");return}if(g.dataset.customer){try{const K="skosif_customer_flow_v1",st=SK.load(K,{})||{};st.selected=g.dataset.customer;SK.save(K,st)}catch{}}c.go(g.dataset.pulseGo);return}
    if(e.target.closest("[data-pulse-close]")){if(window.SKosifLedger&&SKosifLedger.open)SKosifLedger.open("close");else core()&&core().go("ledger")}
  })}
}
async function onDash(root){
  if(!cache||Date.now()-at>60000)await refresh();
  mount(root);
  /* the brief lands a moment later: keep the pulse right under it */
  setTimeout(()=>{const b=root.querySelector(":scope > .skbrief"),p=root.querySelector(":scope > .skpulse");if(b&&p&&b.nextElementSibling!==p)b.after(p)},1200);
}
function boot(){const c=core();if(c&&c.onView)c.onView("dash",r=>setTimeout(()=>onDash(r),0));else setTimeout(boot,300)}
boot();
if(SK.bus&&SK.bus.on)SK.bus.on("company",()=>{cache=null;at=0});
window.SKosifPulse=Object.freeze({todayFigures,callList,readiness,refresh,current:()=>cache,version:"1.0.0"});
})();

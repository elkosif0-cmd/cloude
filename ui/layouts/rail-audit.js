/* SQC — the rail's status card speaks for the audit file.
   The base page fills #status-card with the pricing workbook's profitability rows (box margins, items at a loss) —
   helper data. SQC is audit-first, so those rows are replaced by the open engagement: the client, the file's state
   (confidence-engine STATES), the council rounds, the adjustments accepted and the documents still owed.
   The card's actions (export, backup, settings) and the save and sync lines are kept as the base page draws them. */
(()=>{
"use strict";
const {esc}=SK;
const KEY="skosif_tbreview_v1";
const STATE_AR={new:"جديد",setup:"قيد الإعداد",analysis:"قيد التحليل",council:"نقاش المجلس","awaiting-client":"بانتظار العميل","human-review":"مراجعة بشرية","draft-report":"مسودة التقرير",approved:"معتمد ومغلق"};
function snapshot(){
  let d={};try{d=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
  const s=d.session||null,rounds=s&&Array.isArray(s.rounds)?s.rounds:[],state=d.engagement&&d.engagement.state||(d.tbText?"analysis":"new");
  const asked=new Set(rounds.flatMap(r=>(r.requests||[]).map(q=>q.id))),done=new Set(rounds.flatMap(r=>(r.reviewed||[]).filter(x=>x.verdict==="مقبول").map(x=>x.requestId)));
  const unavailable=s&&Array.isArray(s.unavailable)?s.unavailable.length:0,open=[...asked].filter(id=>!done.has(id)&&!(s.unavailable||[]).includes(id)).length;
  return {has:!!d.tbText,company:d.ctx&&d.ctx.company||"",state,rounds:rounds.length,accepted:Array.isArray(d.accepted)?d.accepted.length:0,open,unavailable};
}
function rows(){
  const x=snapshot();
  if(!x.has)return '<div class="row sqc-rs"><span>ملف المراجعة</span><span class="spill">لا ملف مفتوح</span></div><div class="row sqc-rs"><span>ابدأ بميزان مراجعة</span><button type="button" class="btn sm" data-sqc-go="tbreview">فتح</button></div>';
  const ready=x.state==="draft-report"||x.state==="approved";
  return '<div class="row sqc-rs"><span>ملف المراجعة</span><span class="spill '+(ready?"ok":x.state==="awaiting-client"?"bad":"")+'">'+esc(STATE_AR[x.state]||x.state)+'</span></div>'+
    '<div class="row sqc-rs sqc-rs-co"><span title="'+esc(x.company)+'">'+esc(x.company||"منشأة دون اسم")+'</span></div>'+
    '<div class="row sqc-rs"><span>جولات المجلس</span><b>'+x.rounds+'</b></div>'+
    '<div class="row sqc-rs"><span>مستندات معلقة</span><b class="'+(x.open?"red":"")+'">'+x.open+(x.unavailable?' · '+x.unavailable+' غير متوفر':'')+'</b></div>'+
    '<div class="row sqc-rs"><span>قيود تسوية معتمدة</span><b>'+x.accepted+'</b></div>';
}
let busy=false;
function apply(){
  const card=document.getElementById("status-card");if(!card||busy)return;
  const legacy=[...card.querySelectorAll(":scope > .row:not(.sqc-rs)")];
  const mine=card.querySelectorAll(":scope > .row.sqc-rs");
  const html=rows();
  if(!legacy.length&&mine.length&&card.dataset.sqcRs===html)return;
  busy=true;
  legacy.forEach(r=>r.remove());mine.forEach(r=>r.remove());
  card.insertAdjacentHTML("afterbegin",html);card.dataset.sqcRs=html;
  busy=false;
}
function start(){
  const card=document.getElementById("status-card");if(!card){setTimeout(start,500);return}
  apply();
  new MutationObserver(()=>{if(!busy)apply()}).observe(card,{childList:true});
  window.addEventListener("storage",e=>{if(e.key===KEY)apply()});
  setInterval(apply,4000);
  card.addEventListener("click",e=>{const b=e.target.closest("[data-sqc-go]");if(b&&window.SKosifCore)SKosifCore.go(b.dataset.sqcGo)});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

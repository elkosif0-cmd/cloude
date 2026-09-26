/* S.kosif — الإقفال الشهري والملخص الصباحي وتنبيهات الدفاتر (window.SKosifClose).
   آلية عمل واحدة واضحة: كل شهر يمر بثماني خطوات بالترتيب — ترحيل العمليات، متابعة التحصيل، مطابقة البنك، الجرد،
   الضريبة، ميزان المراجعة، الإرسال إلى المراجعة، ثم إقفال الفترة. حالة كل خطوة تُقرأ من البيانات نفسها (لا علامات
   يدوية)، وكل خطوة تفتح الشاشة التي تُنجز فيها. الملخص الصباحي في مركز القيادة وتنبيهات الجرس تقرأ من المصدر نفسه
   (SKosifLedger)، فلا يختلف رقم بين شاشة وأخرى. */
(()=>{
"use strict";
const {esc,load,money}=SK;
const L=()=>window.SKosifLedger;
const DAY=864e5,iso=t=>new Date(t).toISOString().slice(0,10),today=()=>iso(Date.now());
const endOf=m=>iso(Date.UTC(+m.slice(0,4),+m.slice(5,7),0));
const MONTHS=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const label=m=>MONTHS[+m.slice(5,7)-1]+" "+m.slice(0,4);
const prevMonth=(m,k=1)=>new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7)-1-k,1)).toISOString().slice(0,7);
const days=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/DAY);
let month=null;

/* the month to close: the first ended month after the lock date, else the last ended month */
function defaultMonth(){
  const last=prevMonth(today().slice(0,7)),lock=(L()&&L().snapshot().lockDate)||"";
  if(lock){const next=iso(Date.parse(lock)+DAY).slice(0,7);if(next<=last)return next}
  return last;
}
/* the quarter that ended most recently: the one whose return is due now */
function currentQuarter(){const d=new Date();return d.getUTCFullYear()+"-Q"+(Math.floor(d.getUTCMonth()/3)+1)}
function lastQuarter(){const d=new Date(),q=Math.floor(d.getUTCMonth()/3);return q?d.getUTCFullYear()+"-Q"+q:(d.getUTCFullYear()-1)+"-Q4"}

function steps(m){
  const l=L();if(!l)return [];
  const d=l.snapshot(),end=endOf(m),start=m+"-01",t=today(),S=[];
  const add=(id,title,why,st,note,act)=>S.push({id,title,why,st,note,act});
  if(!d.accounts.length)return [{id:"setup",title:"دليل الحسابات",why:"الإقفال يقرأ من الدفاتر",st:"bad",note:"أنشئ دليل الحسابات أولاً",act:{tab:"accounts",label:"إنشاء الدليل"}}];
  const p=l.pending(end);
  add("post","ترحيل عمليات الشهر","كل بيع واستلام حتى نهاية الشهر مرحّل بقيده",p.total?"warn":"ok",p.total?p.total+" عملية بانتظار الترحيل، أقدمها "+p.oldest:"كل العمليات مرحّلة",{tab:"entries",label:"ترحيل"});
  const ar=l.parties("ar",end),lateRows=ar?ar.rows.filter(r=>r.aging["61-90"]+r.aging["90+"]>0):[],late=ar?ar.totals["61-90"]+ar.totals["90+"]:0;
  add("collect","متابعة التحصيل","العملاء المتأخرون أكثر من 60 يوماً في نهاية الشهر",late>0?"warn":"ok",late>0?lateRows.length+" عميل متأخر بمبلغ "+money(late):"لا متأخرات تزيد على 60 يوماً",{tab:"cash",label:"التحصيل"});
  const hist=((d.bank||{}).history||[]).map(h=>h.end).sort(),rec=hist[hist.length-1]||null;
  add("bank","مطابقة البنك","كشف البنك مطابق لحساب النقدية حتى نهاية الشهر",rec&&rec>=end?"ok":"warn",rec?(rec>=end?"طوبق حتى "+rec:"آخر مطابقة معتمدة "+rec):"لم تُعتمد مطابقة بعد",{tab:"recon",label:"مطابقة البنك"});
  const c=d.count||{},counted=!!(c.posted&&c.date&&c.date>=start);
  add("count","جرد المخزون","الكميات على الرفوف مقابل حساب المخزون",counted?"ok":"warn",counted?"جُرد في "+c.date:"لم يُرحّل جرد لهذا الشهر",{tab:"recon",label:"الجرد"});
  const mm=+m.slice(5,7);
  if(mm%3===0){const qid=m.slice(0,4)+"-Q"+(mm/3),v=l.vat(qid);
    if(v)add("vat","إقرار الضريبة","الربع ينتهي هذا الشهر: الإقرار وقيد إقفال الضريبة",v.settled?"ok":t>v.q.due?"bad":"warn",
      v.settled?"أُقفلت ضريبة "+v.q.label+" — صافي "+money(v.r.net):"صافي "+(v.r.net>=0?"المستحق ":"المسترد ")+money(Math.abs(v.r.net))+" · آخر موعد "+v.q.due,{tab:"vat",q:qid,label:"الإقرار"});
  }else add("vat","إقرار الضريبة","الإقرار ربع سنوي","na","لا إقرار هذا الشهر — الربع ينتهي في "+label(m.slice(0,5)+String(Math.ceil(mm/3)*3).padStart(2,"0")),{tab:"vat",label:"عرض"});
  const tb=l.trialBalance(end);
  add("tb","ميزان المراجعة","المدين يساوي الدائن في نهاية الشهر",tb.balanced?"ok":"bad",tb.balanced?"متزن — "+tb.rows.length+" حساباً":"غير متزن — فرق "+money(tb.totals.debit-tb.totals.credit),{tab:"tb",label:"الميزان"});
  const r=load("skosif_tbreview_v1",{})||{},sent=!!(r.tbText&&r.loadedAt&&r.loadedAt.slice(0,10)>=end);
  add("review","الإرسال إلى المراجعة","ميزان الشهر في ملف المراجعة (المعايير والمجلس الذكي) — اختياري",sent?"ok":"na",sent?"أُرسل في "+r.loadedAt.slice(0,10):"لم يُرسل ميزان هذا الشهر",{run:"review",label:"إرسال الميزان"});
  const locked=!!(d.lockDate&&d.lockDate>=end),ready=S[0].st==="ok"&&S.find(x=>x.id==="tb").st==="ok"&&t>end;
  add("lock","إقفال الفترة","بعد الإقفال لا يتغير رقم في الشهر",locked?"ok":ready?"warn":"bad",locked?"مقفلة حتى "+d.lockDate:ready?"جاهز للإقفال":t<=end?"الشهر لم ينته بعد":"رحّل العمليات ووازن الميزان أولاً",{run:"lock",label:"إقفال الشهر",disabled:!ready||locked});
  return S;
}
function progress(S){const a=S.filter(x=>x.st!=="na");return{done:a.filter(x=>x.st==="ok").length,of:a.length,next:S.find(x=>x.st!=="ok"&&x.st!=="na")||null}}
const PILL={ok:["good","تم"],warn:["warn","يحتاج إجراء"],bad:["bad","متوقف"],na:["","لا يلزم"]};
const btn=(x,cls)=>'<button type="button" class="btn sm'+(cls||"")+'" data-cl="'+(x.act.run||"go")+'" data-go-tab="'+esc(x.act.tab||"")+'" data-q="'+esc(x.act.q||"")+'"'+(x.act.disabled?' disabled':'')+'>'+esc(x.act.label)+'</button>';

function html(){
  if(!L())return "";
  month=month||defaultMonth();
  const S=steps(month),P=progress(S),cur=today().slice(0,7),opts=[1,2,3].map(k=>prevMonth(cur,k));if(!opts.includes(month))opts.unshift(month);
  const pct=P.of?Math.round(P.done/P.of*100):0;
  return '<section class="card skclose"><div class="card-h"><div><h3>إقفال شهر '+esc(label(month))+'</h3><p>ثماني خطوات بالترتيب. حالة كل خطوة من الدفاتر نفسها، والزر يفتح مكان إنجازها.</p></div>'+
      '<div class="sk-chips">'+opts.map(x=>'<button type="button" class="chip'+(x===month?' active':'')+'" data-cl="month" data-m="'+x+'" aria-pressed="'+(x===month)+'">'+esc(label(x))+'</button>').join("")+'</div></div>'+
    '<div class="card-b"><div class="skclose-bar" role="progressbar" aria-label="تقدم الإقفال" aria-valuemin="0" aria-valuemax="'+P.of+'" aria-valuenow="'+P.done+'"><span style="width:'+pct+'%"></span></div>'+
    '<p class="hint">'+P.done+' من '+P.of+' خطوات مكتملة'+(P.next?' — التالية: <b>'+esc(P.next.title)+'</b>':' — الشهر مكتمل ومقفل')+'</p>'+
    '<ol class="skclose-steps">'+S.map((x,i)=>'<li class="st-'+x.st+'"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+esc(x.title)+'</b><small>'+esc(x.why)+'</small><span class="note">'+esc(x.note)+'</span></div>'+
      '<span class="sk-pill '+PILL[x.st][0]+'">'+PILL[x.st][1]+'</span>'+btn(x,x.st==="warn"||x.st==="bad"?" primary":"")+'</li>').join("")+'</ol></div></section>';
}

/* ---------- alerts for the bell: what the books say needs attention now ---------- */
function alerts(){
  const l=L();if(!l)return [];
  const d=l.snapshot();if(!d.accounts.length||!d.entries.length)return [];
  const out=[],t=today(),q=lastQuarter(),v=l.vat(q);
  if(v&&!v.settled&&(v.r.outputVat||v.r.inputVat)){const left=days(t,v.q.due);
    if(left<=20)out.push({id:"vat:"+q,sev:left<=5?"bad":"warn",title:left<0?"فات موعد إقرار الضريبة":"موعد إقرار الضريبة يقترب",detail:v.q.label+" "+q.slice(0,4)+" — صافي "+money(v.r.net)+" · آخر موعد "+v.q.due+(left>=0?" (بعد "+left+" يوماً)":""),tab:"vat",q})}
  const ar=l.parties("ar",t);
  if(ar){const late=ar.totals["61-90"]+ar.totals["90+"];if(late>0)out.push({id:"ar60:"+Math.round(late),sev:"warn",title:"عملاء متأخرون أكثر من 60 يوماً",detail:money(late)+" لدى "+ar.rows.filter(r=>r.aging["61-90"]+r.aging["90+"]>0).length+" عميل",tab:"cash"})}
  const p=l.pending(t);
  if(p.total&&p.oldest&&days(p.oldest,t)>3)out.push({id:"post:"+p.total+":"+p.oldest,sev:"warn",title:"عمليات لم تُرحّل للدفاتر",detail:p.total+" عملية، أقدمها "+p.oldest,tab:"entries"});
  const hist=((d.bank||{}).history||[]).map(h=>h.end).sort(),last=hist[hist.length-1];
  if(!last||days(last,t)>35)out.push({id:"bank:"+(last||"none"),sev:"info",title:"مطابقة البنك متأخرة",detail:last?"آخر مطابقة معتمدة "+last:"لم تُعتمد مطابقة بنكية بعد",tab:"recon"});
  const pm=prevMonth(t.slice(0,7));
  if(+t.slice(8,10)>15&&!(d.lockDate&&d.lockDate>=endOf(pm)))out.push({id:"close:"+pm,sev:"info",title:"شهر "+label(pm)+" لم يُقفل بعد",detail:"أكمل خطوات الإقفال الشهري",tab:"close"});
  return out;
}

/* ---------- the morning brief on the command centre ---------- */
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);q.onsuccess=()=>{const db=q.result;
  if(!db.objectStoreNames.contains(store)){db.close();return res([])}const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>{db.close();res(r.result||[])};r.onerror=()=>{db.close();res([])}}})}
async function briefHTML(){
  const l=L(),t=today(),y=iso(Date.now()-DAY),tiles=[];
  const tile=(k,title,value,sub,tone,go)=>tiles.push('<button type="button" class="skbrief-t tone-'+tone+'" '+(go.tab?'data-cl="go" data-go-tab="'+go.tab+'" data-q="'+esc(go.q||"")+'"':'data-flow-go="'+go.view+'"')+'><span class="k">'+esc(title)+'</span><b>'+esc(value)+'</b><small>'+esc(sub)+'</small></button>');
  /* sales: yesterday against the last 30 days */
  const byDay={},put=(d,v)=>{d=String(d||"").slice(0,10);if(d&&v)byDay[d]=(byDay[d]||0)+v};
  (await idbAll("sales_lines")).forEach(x=>put(x.date,Number(x.amountHalalas)?Number(x.amountHalalas)/100:Number(x.amount)||0));
  (load("aghnam-v12-manual-sales",[])||[]).forEach(x=>put(x&&x.date,Number(x&&x.amount)||0));
  const avg=[...Array(30)].reduce((s,_,i)=>s+(byDay[iso(Date.now()-(i+1)*DAY)]||0),0)/30,ys=byDay[y]||0;
  tile("sales","مبيعات أمس",money(ys),avg?(ys>=avg?"فوق":"دون")+" متوسط 30 يوماً ("+money(avg)+")":"لا مبيعات في آخر 30 يوماً",avg&&ys<avg*0.7?"warn":"ok",{view:"salesintel"});
  if(l&&l.snapshot().accounts.length){
    const ar=l.parties("ar",t);
    if(ar){const over=ar.totals["1-30"]+ar.totals["31-60"]+ar.totals["61-90"]+ar.totals["90+"],late=ar.totals["61-90"]+ar.totals["90+"];
      tile("ar","مستحق من العملاء",money(ar.balance+ar.unassigned),over?"متأخر "+money(over)+(late?"، منه "+money(late)+" فوق 60 يوماً":""):"لا متأخرات",late?"bad":over?"warn":"ok",{tab:"cash"})}
    const cash=l.balance("1100",t),hist=((l.snapshot().bank||{}).history||[]).map(h=>h.end).sort(),last=hist[hist.length-1];
    if(cash!=null)tile("cash","النقدية والبنوك",money(cash),last?"آخر مطابقة بنكية قبل "+days(last,t)+" يوماً":"لم تُطابق مع البنك بعد",!last||days(last,t)>35?"warn":"ok",{tab:"recon"});
    /* the return due now if it is still open, else the current quarter so far */
    const q=lastQuarter(),v=l.vat(q),cq=currentQuarter(),c=l.vat(cq);
    if(v&&!v.settled&&(v.r.outputVat||v.r.inputVat)){const left=days(t,v.q.due);
      tile("vat","ضريبة القيمة المضافة",money(Math.abs(v.r.net)),(v.r.net>=0?"مستحق":"مسترد")+" عن "+v.q.label+" · آخر موعد "+v.q.due+(left>=0?" (بعد "+left+" يوماً)":" (فات)"),left<=5?"bad":left<=20?"warn":"ok",{tab:"vat",q})}
    else if(c)tile("vat","ضريبة القيمة المضافة",money(Math.abs(c.r.net)),(c.r.net>=0?"مستحق":"مسترد")+" حتى الآن عن "+c.q.label+" · يُقدَّم حتى "+c.q.due,"ok",{tab:"vat",q:cq});
    const m=defaultMonth(),P=progress(steps(m));
    tile("close","إقفال "+label(m),P.done+" من "+P.of,P.next?"التالي: "+P.next.title:"مكتمل ومقفل",P.next?"warn":"ok",{tab:"close"});
  }
  const tasks=(load("skosif_tasks_v1",[])||[]).filter(k=>k&&!k.done&&k.due),over=tasks.filter(k=>k.due<t).length,due=tasks.filter(k=>k.due===t).length;
  tile("tasks","المهام",String(due+over),over?over+" متأخرة و"+due+" اليوم":due?due+" مستحقة اليوم":"لا مهام مستحقة اليوم",over?"bad":due?"warn":"ok",{view:"tasks"});
  const R=load("skosif_risks_v1",{})||{},high=(R.risks||[]).filter(r=>r.status!=="closed"&&(+r.likelihood||1)*(+r.impact||1)>=6).length+(R.findings||[]).filter(f=>f.status!=="resolved"&&f.severity==="high").length;
  tile("risks","مخاطر وملاحظات عالية",String(high),high?"مفتوحة وتحتاج قراراً":"لا شيء عالي الأثر مفتوح",high?"warn":"ok",{view:"risks"});
  const h=new Date().getHours(),date=new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{weekday:"long",day:"numeric",month:"long"});
  return '<section class="skbrief" aria-label="ملخص اليوم"><header><b>'+(h<12?"صباح الخير":"مساء الخير")+'</b><span>ملخص '+esc(date)+' — من بيانات التطبيق نفسها</span></header><div class="skbrief-g">'+tiles.join("")+'</div></section>';
}
async function brief(root){
  if(!root||root.querySelector(".skbrief"))return;
  let h;try{h=await briefHTML()}catch(e){SK.errors&&SK.errors.report(e,"brief");return}
  if(root.querySelector(".skbrief"))return;
  const w=document.createElement("div");w.innerHTML=h;const el=w.firstElementChild;
  const jr=root.querySelector(":scope>.skjr"),demo=root.querySelector(":scope>.skdemo");
  if(jr)jr.before(el);else if(demo)demo.after(el);else root.prepend(el);
}
function boot(){const c=window.SKosifCore;if(c&&c.onView)c.onView("dash",r=>setTimeout(()=>brief(r),0));else setTimeout(boot,300)}
boot();

document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-cl]");if(!b||b.disabled)return;
  const a=b.dataset.cl,l=L();if(!l)return;
  if(a==="month"){month=b.dataset.m;l.open("close");return}
  if(a==="go"){l.open(b.dataset.goTab||"close",{q:b.dataset.q||undefined});return}
  if(a==="review"){await l.sendToReview();return}
  if(a==="lock"){const end=endOf(month||defaultMonth());
    if(!await SK.confirm("إقفال الدفاتر حتى "+end+"؟ لن يُقبل بعدها قيد أو ترحيل أو عكس بتاريخ في "+label(end.slice(0,7))+" أو قبله.",{ok:"إقفال"}))return;
    if(l.lockTo(end))SK.toast("أُقفل شهر "+label(end.slice(0,7)),"ok");l.open("close")}
});
window.SKosifClose=Object.freeze({html,steps:m=>steps(m||defaultMonth()),alerts,month:()=>month||defaultMonth()});
})();

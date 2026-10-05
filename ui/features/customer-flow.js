/* S.kosif — Customer Studio (استوديو العميل), the second studio on the shared shell (SK.studio).
   The customer in the middle; what feeds the relationship on one side (orders, payments, the products bought, the
   channel) and what it yields on the other (RFM segment, buying rhythm and next expected purchase, monthly value,
   receivables, the last contact). Every number comes from the engine that owns it: the sales engine's own result
   (SKosifSalesIntel.snapshot — the same people, segments and rhythm the sales hub and the churn radar show), the
   core's orders and payments, and the follow-up log. The source screens stay the truth: the studio never writes a
   customer, an order or a contact; it opens their screens. Positions and the open tab live in skosif_customer_flow_v1. */
(()=>{
"use strict";
const {$,esc,load,save}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_customer_flow_v1",LV=1,FU="skosif_followup_v1",MAX=80,STALE=30000;
const nf=(v,d=0)=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:d}).format(Number(v)||0);
const riyal=h=>nf(Math.round((Number(h)||0)/100))+" ر.س";          /* the engine counts halalas */
const sar=v=>nf(v,2)+" ر.س";                                        /* the core's orders and payments are riyals */
const day=s=>String(s||"").slice(0,10);
const normPhone=p=>{let s=String(p||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"");if(s.startsWith("966"))s="0"+s.slice(3);if(s.length===9&&s.startsWith("5"))s="0"+s;return s};
const wa=p=>{const s=normPhone(p);return s?"https://wa.me/966"+s.replace(/^0/,""):""};
const isPaid=s=>/^(مدفوع|paid|captured|مكتمل)$/i.test(String(s||"").trim());
const isCanceled=s=>/ملغ|cancel|refunded$/i.test(String(s||""));
const STATUS={overdue:"متأخر",due:"حان الموعد",ok:"في موعده"};
let root=null,ctl=null,data=null,loading=null,loadedAt=0,selected="",q="",cur=null,qT=0;

/* ---------- the numbers ---------- */
async function loadAll(){
  const idb=s=>SK.store&&SK.store.idbAll?SK.store.idbAll(s).catch(()=>[]):Promise.resolve([]);
  const [res,orders,payments,lines]=await Promise.all([window.SKosifSalesIntel?SKosifSalesIntel.snapshot("all"):null,idb("orders"),idb("payments"),idb("sales_lines")]);
  const fu=load(FU,{})||{};
  return{res:res&&!res.empty?res:{empty:true,customers:[],followup:[],segments:[]},orders:orders||[],payments:payments||[],lines:lines||[],records:fu.records||[]};
}
const sales=()=>(window.SKEngines&&window.SKEngines.sales)||null;
const segInfo=k=>{const E=sales(),S=(E&&E.salesInsights&&E.salesInsights.SEGMENTS)||[];return S.find(s=>s.key===k)||{key:k,label:k||"—",tone:"info"}};
/* the engine's follow-up list carries only the customers who are due or overdue; a customer buying on time gets the
   same rhythm fields by the engine's own formulas (cadence, ratio, expected date, monthly value) */
function enrich(p,typical){
  const cadence=p.cadence!=null?p.cadence:(typical||30),E=sales(),SI=E&&E.salesInsights,dayAdd=(SI&&SI.dayAdd)||(E&&E.dayAdd),ratio=cadence>0?Math.round(p.daysSince/cadence*100)/100:0;
  return{...p,cadenceUsed:Math.round(cadence*10)/10,personal:p.cadence!=null,ratio,status:p.daysSince>Math.max(1.5*cadence,cadence+7)?"overdue":p.daysSince>cadence?"due":"ok",expected:dayAdd&&p.last?dayAdd(p.last,Math.round(cadence)):p.last,monthlyValue:Math.round(p.avgOrder*(30/Math.max(7,cadence)))};
}
function person(d,id){const fu=(d.res.followup||[]).find(c=>String(c.id)===id);if(fu)return fu;const p=(d.res.customers||[]).find(c=>String(c.id)===id);return p?enrich(p,d.res.typicalCadence):null}
const halalas=l=>Number.isFinite(+l.amountHalalas)&&l.amountHalalas!==""&&l.amountHalalas!=null?+l.amountHalalas:Math.round((+l.amount||0)*100);
/* one customer's model: pure, so a test can hold it against the engine */
function model(d,id){
  id=String(id);const p=person(d,id);if(!p)return null;
  const mine=o=>String(o.customerId||"")===id;
  const orders=d.orders.filter(mine).map(o=>({id:o.id,ref:o.externalOrderId||o.internalOrderId||o.invoiceNo||o.id,date:day(o.date),total:Number(o.orderTotal)||0,status:String(o.status||""),pay:String(o.paymentStatus||""),method:String(o.paymentMethod||""),items:Number(o.itemCount)||0,channel:String(o.source||"")})).sort((a,b)=>b.date.localeCompare(a.date));
  const live=orders.filter(o=>!isCanceled(o.status)),unpaid=live.filter(o=>o.pay&&!isPaid(o.pay));
  const pays=d.payments.filter(mine).map(x=>({id:x.id,date:day(x.date),amount:Number(x.capturedAmount??x.amount)||0,refund:Number(x.refundedAmount)||0,status:String(x.status||""),method:String(x.method||""),order:x.orderId||x.externalOrderId||""})).sort((a,b)=>b.date.localeCompare(a.date));
  const paid=pays.reduce((s,x)=>s+x.amount,0),refunded=pays.reduce((s,x)=>s+x.refund,0),outstanding=unpaid.reduce((s,o)=>s+o.total,0);
  const prod=new Map();d.lines.forEach(l=>{if(!mine(l))return;const k=String(l.descriptionOriginal||l.product||"—").trim();const x=prod.get(k)||{name:k,qty:0,amount:0,last:""};x.qty+=Number(l.qty)||0;x.amount+=halalas(l);if(day(l.date)>x.last)x.last=day(l.date);prod.set(k,x)});
  const products=[...prod.values()].sort((a,b)=>b.amount-a.amount);
  const chan=new Map();live.forEach(o=>chan.set(o.channel||"—",(chan.get(o.channel||"—")||0)+1));const channels=[...chan.entries()].sort((a,b)=>b[1]-a[1]);
  const phone=normPhone(p.phone);
  const contacts=phone?d.records.filter(r=>normPhone(r.phone)===phone).map(r=>({date:day(r.date),source:r.source||"",order:r.order||"",notes:r.notes||"",got:!!r.got})).sort((a,b)=>b.date.localeCompare(a.date)):[];
  const seg=segInfo(p.segment),checks=[];
  if(outstanding>0)checks.push({level:"bad",text:unpaid.length+" طلب غير مدفوع بقيمة "+sar(outstanding)});
  if(p.status==="overdue")checks.push({level:"warn",text:"تأخر عن إيقاعه: آخر شراء منذ "+p.daysSince+" يوماً والمعتاد كل "+nf(p.cadenceUsed,1)+" يوماً"});
  else if(p.status==="due")checks.push({level:"info",text:"حان موعد شرائه المعتاد ("+p.expected+")"});
  else checks.push({level:"ok",text:"يشتري في موعده؛ المتوقع "+p.expected});
  if(refunded>0)checks.push({level:"warn",text:"مبالغ مستردة "+sar(refunded)});
  if(!p.phone)checks.push({level:"warn",text:"لا رقم جوال مسجل — لا يمكن تسجيل متابعة"});
  else if(!contacts.length)checks.push({level:"info",text:"لا تواصل مسجل في «متابعة العملاء»"});
  if(seg.tone==="bad"&&seg.action)checks.push({level:"bad",text:seg.label+": "+seg.action});
  return{id,person:p,orders,live,unpaid,pays,paid,refunded,outstanding,products,channels,contacts,seg,checks};
}
/* the customers of the picker: with purchases, the biggest first, filtered by the search box */
function people(){const all=(data&&data.res.customers)||[];const nq=q.trim().toLowerCase(),dq=normPhone(nq);return all.filter(c=>!nq||String(c.name||"").toLowerCase().includes(nq)||(dq&&normPhone(c.phone).includes(dq))).sort((a,b)=>b.revenue-a.revenue)}
function pick(){
  const list=people(),st=state();
  if(!list.some(c=>String(c.id)===selected))selected=list.some(c=>String(c.id)===st.selected)?st.selected:String((list[0]||{}).id||"");
  if(st.selected!==selected){st.selected=selected;put(st)}
  cur=selected?model(data,selected):null;
}
/* ---------- local state: positions and the open tab, per customer ---------- */
function state(){const d=load(KEY,{})||{};return{selected:String(d.selected||""),tab:String(d.tab||"rhythm"),customers:d.customers&&typeof d.customers==="object"?d.customers:{}}}
const put=d=>save(KEY,d);
function slot(d,id){if(!d.customers[id])d.customers[id]={pos:{},posN:{},lv:LV};const s=d.customers[id];if(s.lv!==LV){s.lv=LV;s.pos={};s.posN={}}return s}

/* ---------- the map ---------- */
function nodes(){
  const m=cur;if(!m)return[];const p=m.person,tone=m.seg.tone==="bad"?"bad":m.seg.tone==="warn"?"warn":"";
  const rev=Math.max(1,p.revenue),N=[{id:"customer",type:"customer",role:"center",tag:"العميل",label:p.name||p.phone||m.id,value:m.seg.label+(p.city?" · "+p.city:""),sub:p.phone||"",band:tone}];
  N.push({id:"orders",type:"orders",role:"input",tag:"الطلبات",label:"الطلبات",value:p.orders+" طلب · "+riyal(p.revenue),sub:p.first?"من "+p.first:"",share:1});
  N.push({id:"payments",type:"payments",role:"input",tag:"التحصيل",label:"المدفوعات",value:sar(m.paid)+(m.refunded?" · مسترد "+sar(m.refunded):""),share:Math.min(1,m.paid/Math.max(1,p.revenue/100))});
  m.products.slice(0,3).forEach((x,i)=>N.push({id:"p:"+i,type:"product",role:"input",tag:"منتج",label:x.name,value:riyal(x.amount)+" · "+nf(x.qty,1),sub:x.last?"آخر مرة "+x.last:"",share:x.amount/rev}));
  if(m.channels.length)N.push({id:"channel",type:"channel",role:"input",tag:"القناة",label:m.channels[0][0],value:m.channels[0][1]+" من "+m.live.length+" طلب",share:m.channels[0][1]/Math.max(1,m.live.length)});
  N.push({id:"segment",type:"segment",role:"output",tag:"الشريحة",label:m.seg.label,value:"R"+p.r+" · F"+p.f+" · M"+p.m,band:tone});
  N.push({id:"cadence",type:"cadence",role:"output",tag:"الإيقاع",label:STATUS[p.status]||"الإيقاع",value:"كل "+nf(p.cadenceUsed,1)+" يوماً · منذ "+p.daysSince+" يوماً",sub:"المتوقع "+p.expected,band:p.status==="overdue"?"bad":p.status==="due"?"warn":""});
  N.push({id:"monthly",type:"monthly",role:"output",tag:"القيمة",label:"القيمة الشهرية",value:riyal(p.monthlyValue),sub:"متوسط الطلب "+riyal(p.avgOrder)});
  N.push({id:"receivables",type:"receivables",role:"output",tag:"الذمم",label:"غير مدفوع",value:m.unpaid.length?m.unpaid.length+" طلب · "+sar(m.outstanding):"لا شيء مستحق",band:m.outstanding>0?"bad":""});
  N.push({id:"followup",type:"followup",role:"output",tag:"المتابعة",label:"آخر تواصل",value:m.contacts.length?m.contacts[0].date+" · "+m.contacts[0].source:"لا تواصل مسجل",band:m.contacts.length?"":"warn"});
  return N;
}
const acts=list=>'<div class="sk-actions">'+list.map(([a,l,cls])=>a.startsWith("go:")?'<button type="button" class="btn sm'+(cls?" "+cls:"")+'" data-pf="go" data-go="'+esc(a.slice(3))+'">'+esc(l)+'</button>':'<button type="button" class="btn sm'+(cls?" "+cls:"")+'" data-pf="'+esc(a)+'">'+esc(l)+'</button>').join("")+'</div>';
const list=pairs=>pairs.length?'<ul class="pf-list">'+pairs.map(([a,b])=>'<li><span>'+esc(a)+'</span><span>'+esc(b)+'</span></li>').join("")+'</ul>':"";
function table(rows){
  if(!rows.length)return '<p class="pf-empty">لا طلبات.</p>';
  return '<div class="pf-tablew"><table class="pf-table"><thead><tr><th>التاريخ</th><th>المرجع</th><th class="n">الإجمالي</th><th>الحالة</th><th>الدفع</th></tr></thead><tbody>'+rows.map(o=>'<tr><td>'+esc(o.date)+'</td><td dir="ltr">'+esc(o.ref)+'</td><td class="n">'+sar(o.total)+'</td><td>'+esc(o.status||"—")+'</td><td'+(o.pay&&!isPaid(o.pay)?' class="pf-down"':'')+'>'+esc(o.pay||"—")+'</td></tr>').join("")+'</tbody></table></div>';
}
function inspector(id,all){
  const m=cur,n=all.find(x=>x.id===id);if(!m||!n)return"";const p=m.person,{kv,formula,inspHead}=SK.studio;let body="";
  if(id==="customer")body=kv([["الجوال",p.phone?'<a href="'+esc(wa(p.phone))+'" target="_blank" rel="noopener" dir="ltr">'+esc(p.phone)+'</a>':"—"],["المدينة",esc(p.city||"—")],["أول شراء",esc(p.first||"—")],["آخر شراء",esc(p.last||"—")],["الطلبات",String(p.orders)],["الإيراد",riyal(p.revenue)]])+acts([["open-customer","فتح ملف العميل","primary"],["go:followup","تسجيل تواصل"]]);
  else if(id==="orders")body=table(m.orders.slice(0,8))+acts([["go:commerce","كل الطلبات"]]);
  else if(id==="payments")body=kv([["المحصّل",sar(m.paid)],["المسترد",sar(m.refunded),m.refunded?"pf-kv-bad":""],["المستحق",sar(m.outstanding),m.outstanding>0?"pf-kv-bad":"pf-kv-ok"]])+list(m.pays.slice(0,6).map(x=>[x.date+" · "+x.method,sar(x.amount)+(x.refund?" − "+sar(x.refund):"")]))+acts([["go:receivables","الذمم والتحصيل"]]);
  else if(id.startsWith("p:")){const x=m.products[+id.slice(2)];if(x)body=kv([["الإيراد",riyal(x.amount)],["الكمية",nf(x.qty,1)],["نصيبه من إيراد العميل",nf(x.amount/Math.max(1,p.revenue)*100,1)+"٪"],["آخر مرة",esc(x.last||"—")]])+acts([["go:salesintel","ذكاء المبيعات"]])}
  else if(id==="channel")body=list(m.channels.map(([c,k])=>[c,k+" طلب"]));
  else if(id==="segment")body=kv([["الشريحة",esc(m.seg.label)],["الحداثة R",p.r+" من 5"],["التكرار F",p.f+" من 5"],["القيمة M",p.m+" من 5"]])+(m.seg.desc?'<p class="pf-hint">'+esc(m.seg.desc)+'</p>':"")+(m.seg.action?'<p class="pf-chk pf-info">'+esc(m.seg.action)+'</p>':"")+formula(["R وF وM أخماس بين كل العملاء: الحداثة = الأيام منذ آخر شراء، التكرار = عدد الطلبات، القيمة = الإيراد"]);
  else if(id==="cadence")body=kv([["إيقاعه",nf(p.cadenceUsed,1)+" يوماً"+(p.personal?"":" (المعتاد للشركة)")],["منذ آخر شراء",p.daysSince+" يوماً"],["النسبة",nf(p.ratio,2)],["الشراء المتوقع",esc(p.expected)],["الحالة",STATUS[p.status]||"—",p.status==="overdue"?"pf-kv-bad":p.status==="ok"?"pf-kv-ok":""]])+formula(["الإيقاع = وسيط الأيام بين طلباته"+(p.personal?"":"؛ تاريخه قصير فيُستخدم وسيط الشركة"),"متأخر إذا تجاوز 1.5 × الإيقاع أو الإيقاع + 7 أيام"]);
  else if(id==="monthly")body=kv([["متوسط الطلب",riyal(p.avgOrder)],["الإيقاع",nf(p.cadenceUsed,1)+" يوماً"],["القيمة الشهرية",riyal(p.monthlyValue)]])+formula(["القيمة الشهرية = متوسط الطلب × 30 ÷ الإيقاع (بحد أدنى 7 أيام)"]);
  else if(id==="receivables")body=(m.unpaid.length?table(m.unpaid):'<p class="pf-empty">لا طلبات غير مدفوعة.</p>')+acts([["go:receivables","الذمم والتحصيل"]]);
  else if(id==="followup")body=(m.contacts.length?list(m.contacts.slice(0,5).map(c=>[c.date+" · "+c.source+(c.order?" · "+c.order:""),c.got?"استلم":""])):'<p class="pf-empty">لا تواصل مسجل مع هذا الرقم.</p>')+acts([["go:followup","تسجيل تواصل"],...(p.phone?[["wa","واتساب"]]:[])]);
  return inspHead(n.tag,n.label)+body;
}
/* ---------- under the map ---------- */
function rhythm(m){
  const by=new Map();m.live.forEach(o=>{const k=o.date.slice(0,7);if(k)by.set(k,(by.get(k)||0)+o.total)});
  const keys=[...by.keys()].sort().slice(-12);if(!keys.length)return '<p class="pf-empty">لا طلبات مسجلة في الطلبات والتحصيل لهذا العميل؛ الإيقاع أعلاه من سجلات المبيعات.</p>';
  const chart=window.SKCharts&&SKCharts.bars?SKCharts.bars({labels:keys.map(k=>k.slice(5)+"/"+k.slice(2,4)),series:[{name:"الإيراد",values:keys.map(k=>Math.round(by.get(k)))}],height:180,fmt:v=>nf(v)}):"";
  return '<p class="pf-hint">إيراد الطلبات بالشهر (آخر 12 شهراً فيها طلبات) — المصدر: الطلبات والتحصيل.</p>'+chart+list(keys.slice().reverse().slice(0,6).map(k=>[k,sar(by.get(k))]));
}
function tabBody(tab){
  const m=cur;if(!m)return"";
  if(tab==="orders")return table(m.orders.slice(0,60))+(m.orders.length>60?'<p class="pf-hint">أول 60 طلباً؛ الباقي في «الطلبات والتحصيل».</p>':"");
  if(tab==="contacts")return(m.contacts.length?list(m.contacts.map(c=>[c.date+" · "+c.source+(c.order?" · "+c.order:"")+(c.notes?" — "+c.notes:""),c.got?"استلم":""])):'<p class="pf-empty">لا تواصل مسجل.</p>')+acts([["go:followup","تسجيل تواصل"]]);
  if(tab==="checks")return SK.studio.checks(m.checks);
  return rhythm(m);
}
function side(){
  const {group,link}=SK.studio;
  return '<div class="pf-sidehead"><b>الشاشات المرتبطة</b><small>الأصل يُفتح من هنا؛ الاستوديو لا يكتب فيه.</small></div>'+
    group("العميل والطلبات","السجلات التي يقرأها الاستوديو",link("customers","العملاء")+link("commerce","الطلبات والتحصيل")+link("followup","متابعة العملاء")+link("receivables","الذمم والتحصيل"),true)+
    group("التحليل","الشرائح والإيقاع لكل العملاء",link("salesintel","ذكاء المبيعات")+link("b2bcredit","ائتمان المطاعم"),false);
}
/* ---------- the spec ---------- */
const SPEC={
  eyebrow:"CUSTOMER STUDIO",title:"استوديو العميل",lead:"العميل في المنتصف: ما يغذّي العلاقة (الطلبات، المدفوعات، المنتجات، القناة) وما تنتجه (الشريحة، الإيقاع، القيمة، الذمم، المتابعة). كل مربع رقمه من محركه، والضغط عليه يفتح تفاصيله.",
  subjectLabel:"العميل",
  headExtra:()=>'<input id="pf-q" type="search" placeholder="ابحث بالاسم أو الجوال" value="'+esc(q)+'" aria-label="بحث عن عميل" autocomplete="off">',
  subject(){
    if(!data)return{empty:SK.ui.state.loading({text:"جارٍ قراءة العملاء والطلبات…"})};
    if(!(data.res.customers||[]).length)return{empty:SK.ui.state.empty({icon:"customers",title:"لا عملاء بمشتريات بعد",text:"استورد المبيعات أو سجّل الطلبات، ثم ارجع إلى استوديو العميل.",action:"فتح العملاء",act:"nav",value:"customers"})};
    pick();const m=cur;if(!m)return{label:"لا نتائج",sub:"لا عميل يطابق البحث؛ عدّل الكلمة."};
    const p=m.person,pill=(t,c)=>'<span class="'+(c?"pf-p-"+c:"")+'">'+esc(t)+'</span>';
    return{label:p.name||p.phone||m.id,sub:"اسحب المربعات لترتيبها، واضغط أي مربع لتفاصيله",pills:pill(m.seg.label,m.seg.tone)+pill(STATUS[p.status]||"",p.status==="overdue"?"bad":p.status==="due"?"warn":"ok")+pill(riyal(p.revenue))};
  },
  subjects:()=>people().slice(0,MAX).map(c=>({id:String(c.id),name:c.name||c.phone||String(c.id),note:riyal(c.revenue)})),
  selected:()=>selected,
  onSelect(id){selected=String(id||"");const st=state();st.selected=selected;put(st);cur=data?model(data,selected):null;ctl&&ctl.paint()},
  onInput(e){if(e.target.id!=="pf-q")return;q=e.target.value;clearTimeout(qT);qT=setTimeout(()=>{ctl&&ctl.paint();const i=$("#pf-q",root);if(i){i.focus();try{i.setSelectionRange(i.value.length,i.value.length)}catch{}}},220)},
  nodes,inspector,side,
  tabs:()=>{const bad=cur?cur.checks.filter(c=>c.level==="bad"||c.level==="warn").length:0;return[["rhythm","الإيقاع"],["orders","الطلبات"],["contacts","المتابعة"],["checks","الرقابة"+(bad?" ("+bad+")":"")]]},
  tab:{get:()=>state().tab||"rhythm",set:id=>{const st=state();st.tab=id;put(st)}},
  tabBody,
  positions:{get:nr=>{const s=slot(state(),selected);return(nr?s.posN:s.pos)||{}},set:(nr,all)=>{const st=state(),s=slot(st,selected);if(nr)s.posN=all;else s.pos=all;put(st)},reset:nr=>{const st=state(),s=slot(st,selected);if(nr)s.posN={};else s.pos={};put(st)}},
  onAction(a,b){
    const m=cur;if(!m)return false;
    if(a==="open-customer"){const c=core();if(!c)return true;c.go("customers");setTimeout(()=>{try{c.act("cust-open",{phone:m.person.phone||"",id:m.id})}catch{}},160);return true}
    if(a==="wa"){const u=wa(m.person.phone);if(u)window.open(u,"_blank","noopener");return true}
    return false;
  }
};
function refresh(){if(loading)return loading;loading=loadAll().then(d=>{data=d;loadedAt=Date.now();loading=null;cur=null;ctl&&ctl.paint()}).catch(e=>{loading=null;SK.errors&&SK.errors.report&&SK.errors.report(e,"customerflow");if(root)root.innerHTML=SK.ui.state.error({text:"تعذّرت قراءة العملاء والطلبات."})});return loading}
SK.view("customerflow",{render(node){root=node;ctl=SK.studio.mount(node,SPEC);if(!data||Date.now()-loadedAt>STALE)refresh();ctl.paint()}});
if(SK.bus&&SK.bus.on)SK.bus.on("company",()=>{data=null;cur=null;selected=""});
window.SKosifCustomerFlow=Object.freeze({model,current:()=>cur,refresh,version:"1.0.0"});
})();

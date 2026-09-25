/* S.kosif — متابعة العملاء (من «متابعة العملاء الاحترافية V8.2»):
   تسجيل يومي لكل تواصل، قوائم أرقام للاتصال كمهام، أولوية التواصل من بيانات الشراء الفعلية،
   وتقرير إنجاز يومي. البيانات: skosif_followup_v1 = {records:[], queue:[]}. */
(()=>{
"use strict";
const {$,esc,load,save,toast}=SK;
const KEY="skosif_followup_v1";
const SOURCES=["واتساب","اتصال","انستقرام","سناب شات","تيك توك","المتجر الإلكتروني","زيارة المحل","توصية عميل","أخرى"];
const PAY=["نقدي","مدى / بطاقة","تحويل بنكي","تابي / تمارا","آجل"];
let tab="log",day=new Date().toISOString().slice(0,10),prefill=null,risk=null;
const db=()=>{const d=load(KEY,{});return{records:d.records||[],queue:d.queue||[]}};
const put=d=>save(KEY,d);
const normPhone=p=>{let s=String(p||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"");if(s.startsWith("966"))s="0"+s.slice(3);if(s.length===9&&s.startsWith("5"))s="0"+s;return s};
const wa=p=>{const s=normPhone(p);return s?"https://wa.me/966"+s.replace(/^0/,""):""};
const dayOf=iso=>String(iso||"").slice(0,10);
const count=(arr,f)=>{const m={};arr.forEach(x=>{const k=f(x)||"غير محدد";m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])};

function logHTML(d){
  const p=prefill||{};prefill=null;
  const recs=d.records.filter(r=>r.date===day);
  return '<section class="card"><div class="card-h"><div><h3>تسجيل تواصل مع عميل</h3><p>كل اتصال أو طلب يُسجَّل هنا ليدخل تقرير اليوم.</p></div></div><div class="card-b sk-stack"><div class="sk-grid2">'+
    '<label class="sk-field"><span>التاريخ</span><input type="date" id="fu-date" value="'+esc(day)+'"></label><label class="sk-field"><span>الاسم</span><input id="fu-name" value="'+esc(p.name||"")+'" data-sk-required></label>'+
    '<label class="sk-field"><span>رقم الجوال</span><input id="fu-phone" inputmode="tel" dir="ltr" value="'+esc(p.phone||"")+'" data-sk-required></label><label class="sk-field"><span>وصلنا من خلال</span><select id="fu-src">'+SOURCES.map(s=>'<option>'+s+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>المدينة</span><input id="fu-city" list="fu-cities"></label><label class="sk-field"><span>الحي</span><input id="fu-district"></label>'+
    '<label class="sk-field"><span>الطلب</span><input id="fu-order" placeholder="ما طلبه العميل (اختياري)"></label><label class="sk-field"><span>طريقة الدفع</span><select id="fu-pay"><option value="">—</option>'+PAY.map(s=>'<option>'+s+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>تاريخ التسليم</span><input type="date" id="fu-deliv"></label><label class="sk-field"><span>مستلم الطلب</span><input id="fu-recv"></label></div>'+
    '<label class="sk-check"><input type="checkbox" id="fu-got"> استلم العميل الطلب</label>'+
    '<label class="sk-field"><span>ملاحظات</span><textarea id="fu-notes" rows="2">'+esc(p.notes||"")+'</textarea></label>'+
    '<datalist id="fu-cities">'+[...new Set(d.records.map(r=>r.city).filter(Boolean))].map(c=>'<option value="'+esc(c)+'">').join("")+'</datalist>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-f="save">حفظ السجل</button></div></div></section>'+
  '<section class="card"><div class="card-h"><div><h3>سجلات '+esc(day)+'</h3><p>'+recs.length+' سجلاً</p></div><div class="sk-actions"><button type="button" class="btn sm" data-f="prev">اليوم السابق</button><button type="button" class="btn sm" data-f="next">اليوم التالي</button></div></div><div class="card-b">'+
    (recs.length?table(recs):SK.ui.state.empty({title:"لا سجلات في هذا اليوم"}))+'</div></section>';
}
function table(recs){
  return '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الاسم</th><th>الجوال</th><th>المصدر</th><th>المدينة</th><th>الطلب</th><th>الدفع</th><th>الاستلام</th><th></th></tr></thead><tbody>'+
    recs.map(r=>'<tr><td>'+esc(r.name)+'</td><td dir="ltr">'+(wa(r.phone)?'<a href="'+wa(r.phone)+'" target="_blank" rel="noopener">'+esc(r.phone)+'</a>':esc(r.phone))+'</td><td>'+esc(r.source||"")+'</td><td>'+esc([r.city,r.district].filter(Boolean).join(" · "))+'</td><td>'+esc(r.order||"")+'</td><td>'+esc(r.payment||"")+'</td><td>'+(r.received?'<span class="sk-pill good">استلم</span>':(r.deliveryDate?'<span class="sk-pill warn">'+esc(r.deliveryDate)+'</span>':'—'))+'</td><td><button type="button" class="linkish" data-f="del" data-id="'+esc(r.id)+'">حذف</button></td></tr>').join("")+'</tbody></table></div>';
}
function queueHTML(d){
  const open=d.queue.filter(q=>!q.done),done=d.queue.filter(q=>q.done);
  return '<section class="card"><div class="card-h"><div><h3>قائمة أرقام للاتصال</h3><p>الصق الأرقام (رقم في كل سطر أو مفصولة بفواصل). المكرر والمسجل مسبقاً في القائمة يُتجاهل.</p></div></div><div class="card-b sk-stack">'+
    '<label class="sk-field"><span>الأرقام</span><textarea id="fu-nums" rows="4" dir="ltr"></textarea></label>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-f="q-add">إضافة للقائمة</button><button type="button" class="btn" data-f="q-risk">إضافة العملاء المتوقفين عن الشراء</button>'+(done.length?'<button type="button" class="btn" data-f="q-clear">حذف المنجز</button>':'')+(open.length?'<button type="button" class="btn" data-f="q-csv">تصدير المتبقي</button>':'')+'</div></div></section>'+
  '<section class="card"><div class="card-h"><div><h3>المتبقي '+open.length+'</h3><p>اتصل أو راسل واتساب، ثم «تم» أو «سجّل» لفتح نموذج التسجيل بالرقم.</p></div></div><div class="card-b">'+
    (open.length?'<div class="skc-list">'+open.map(q=>'<div class="skc-row" style="cursor:default"><span class="tx"><b dir="ltr">'+esc(q.phone)+'</b><small>'+esc(q.note||"")+'</small></span><a class="btn sm" href="tel:'+esc(normPhone(q.phone))+'">اتصال</a><a class="btn sm" href="'+wa(q.phone)+'" target="_blank" rel="noopener">واتساب</a><button type="button" class="btn sm" data-f="q-reg" data-id="'+esc(q.id)+'">سجّل</button><button type="button" class="btn sm primary" data-f="q-done" data-id="'+esc(q.id)+'">تم</button></div>').join("")+'</div>':SK.ui.state.empty({title:"القائمة فارغة"}))+'</div></section>';
}
async function priorityHTML(){
  if(!risk){const cs=await SK.store.idbAll("customers").catch(()=>[]);const now=Date.now();
    risk=cs.filter(c=>c.phone&&c.lastPurchase).map(c=>({name:c.name||"",phone:c.phone,days:Math.floor((now-Date.parse(c.lastPurchase))/864e5),orders:Number(c.summaryOrders)||0,sales:Number(c.summarySales)||0}))
      .filter(c=>c.days>=21&&c.orders>=2).sort((a,b)=>b.sales-a.sales).slice(0,60)}
  return '<section class="card"><div class="card-h"><div><h3>أولوية التواصل</h3><p>عملاء اشتروا مرتين على الأقل وتوقفوا 21 يوماً فأكثر، مرتبون بقيمة مشترياتهم — من بيانات المبيعات المستوردة.</p></div></div><div class="card-b">'+
    (risk.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>العميل</th><th>الجوال</th><th>منذ آخر شراء</th><th>الطلبات</th><th>المشتريات</th><th></th></tr></thead><tbody>'+
      risk.map(c=>'<tr><td>'+esc(c.name)+'</td><td dir="ltr">'+esc(c.phone)+'</td><td>'+c.days+' يوماً</td><td class="n">'+c.orders+'</td><td class="n">'+SK.money(c.sales)+'</td><td><a class="btn sm" href="'+wa(c.phone)+'" target="_blank" rel="noopener">واتساب</a></td></tr>').join("")+'</tbody></table></div>':SK.ui.state.empty({title:"لا يوجد عملاء متوقفون",text:"تظهر القائمة بعد استيراد المبيعات من «العملاء»."}))+'</div></section>';
}
function reportHTML(d){
  const recs=d.records.filter(r=>r.date===day),doneQ=d.queue.filter(q=>q.done&&dayOf(q.doneAt)===day);
  const block=(t,rows)=>'<div class="sk-kpi"><span>'+t+'</span>'+(rows.length?rows.slice(0,6).map(([k,v])=>'<small>'+esc(k)+': <b>'+v+'</b></small>').join(""):'<small>—</small>')+'</div>';
  const txt="تقرير متابعة العملاء — "+day+"\nسجلات التواصل: "+recs.length+"\nأرقام أُنجزت: "+doneQ.length+"\nطلبات مستلمة: "+recs.filter(r=>r.received).length+"\n"+count(recs,r=>r.source).map(([k,v])=>"• "+k+": "+v).join("\n");
  return '<section class="card"><div class="card-h"><div><h3>تقرير الإنجاز اليومي — '+esc(day)+'</h3></div><div class="sk-actions"><button type="button" class="btn sm" data-f="prev">السابق</button><button type="button" class="btn sm" data-f="next">التالي</button><a class="btn sm primary" href="https://wa.me/?text='+encodeURIComponent(txt)+'" target="_blank" rel="noopener">مشاركة واتساب</a><button type="button" class="btn sm" data-f="csv">تصدير السجلات</button></div></div><div class="card-b sk-stack">'+
    '<div class="sk-kpis"><div class="sk-kpi accent"><span>سجلات التواصل</span><b>'+recs.length+'</b></div><div class="sk-kpi good"><span>أرقام أُنجزت</span><b>'+doneQ.length+'</b></div><div class="sk-kpi"><span>طلبات مستلمة</span><b>'+recs.filter(r=>r.received).length+'</b></div><div class="sk-kpi warn"><span>متبقٍ في القائمة</span><b>'+d.queue.filter(q=>!q.done).length+'</b></div></div>'+
    '<div class="sk-kpis">'+block("حسب المصدر",count(recs,r=>r.source))+block("حسب المدينة",count(recs,r=>r.city))+block("طرق الدفع",count(recs,r=>r.payment))+block("مستلمو الطلبات",count(recs.filter(r=>r.receiver),r=>r.receiver))+'</div>'+
    (recs.length?table(recs):'')+'</div></section>';
}
async function paint(root){
  const d=db();
  const head=SK.ui.tabs([["log","التسجيل اليومي"],["queue","قائمة الاتصال",d.queue.filter(q=>!q.done).length],["priority","أولوية التواصل"],["report","تقرير اليوم"]],tab,"fu");
  root.innerHTML=head+(tab==="priority"?SK.ui.state.loading():({log:logHTML,queue:queueHTML,report:reportHTML}[tab])(d));
  if(tab==="priority"){const h=await priorityHTML();if(tab==="priority")root.innerHTML=head+h}
}
function bind(root){
  root.addEventListener("click",async e=>{
    const t=e.target.closest("[data-tab]");if(t&&t.closest('[data-sk-tabs="fu"]')){tab=t.dataset.tab;paint(root);return}
    const b=e.target.closest("[data-f]");if(!b)return;const a=b.dataset.f,d=db();
    const shift=n=>{const x=new Date(day+"T12:00:00");x.setDate(x.getDate()+n);day=x.toISOString().slice(0,10)};
    if(a==="save"){if(!SK.ui.validate(root))return;
      d.records.push({id:SK.ui.uid("fu"),date:$("#fu-date",root).value||day,name:$("#fu-name",root).value.trim(),phone:normPhone($("#fu-phone",root).value),source:$("#fu-src",root).value,city:$("#fu-city",root).value.trim(),district:$("#fu-district",root).value.trim(),
        order:$("#fu-order",root).value.trim(),payment:$("#fu-pay",root).value,deliveryDate:$("#fu-deliv",root).value,received:$("#fu-got",root).checked,receiver:$("#fu-recv",root).value.trim(),notes:$("#fu-notes",root).value.trim(),at:new Date().toISOString()});
      put(d);toast("حُفظ السجل","ok")}
    else if(a==="del"){if(!await SK.confirm("حذف هذا السجل؟",{danger:true,ok:"حذف"}))return;d.records=d.records.filter(r=>r.id!==b.dataset.id);put(d)}
    else if(a==="prev")shift(-1);else if(a==="next")shift(1);
    else if(a==="q-add"||a==="q-risk"){
      const have=new Set(d.queue.map(q=>q.phone));let add=[];
      if(a==="q-add")add=$("#fu-nums",root).value.split(/[\n,،;]+/).map(s=>({phone:normPhone(s),note:""})).filter(x=>x.phone.length>=9);
      else{risk=null;await priorityHTML();add=risk.map(c=>({phone:normPhone(c.phone),note:c.name+" — منذ "+c.days+" يوماً"}))}
      let n=0;add.forEach(x=>{if(!have.has(x.phone)){have.add(x.phone);d.queue.push({id:SK.ui.uid("q"),phone:x.phone,note:x.note,done:false});n++}});
      put(d);toast(n?"أُضيف "+n+" رقماً":"لا أرقام جديدة",n?"ok":"info")}
    else if(a==="q-done"){const q=d.queue.find(x=>x.id===b.dataset.id);if(q){q.done=true;q.doneAt=new Date().toISOString();put(d)}}
    else if(a==="q-reg"){const q=d.queue.find(x=>x.id===b.dataset.id);if(q){q.done=true;q.doneAt=new Date().toISOString();put(d);prefill={phone:q.phone,notes:q.note};tab="log"}}
    else if(a==="q-clear"){d.queue=d.queue.filter(q=>!q.done);put(d)}
    else if(a==="q-csv"){SK.csv.download("followup-queue",["الجوال","ملاحظة"],d.queue.filter(q=>!q.done).map(q=>[q.phone,q.note]));return}
    else if(a==="csv"){SK.csv.download("followup-"+day,["التاريخ","الاسم","الجوال","المصدر","المدينة","الحي","الطلب","الدفع","التسليم","استلم","المستلم","ملاحظات"],d.records.filter(r=>r.date===day).map(r=>[r.date,r.name,r.phone,r.source,r.city,r.district,r.order,r.payment,r.deliveryDate,r.received?"نعم":"لا",r.receiver,r.notes]));return}
    paint(root);
  });
  root.addEventListener("change",e=>{if(e.target.id==="fu-date"){day=e.target.value||day}});
}
SK.view("followup",{render(node){if(!node.dataset.bound){bind(node);node.dataset.bound="1"}risk=null;paint(node)}});
})();

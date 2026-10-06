/* S.kosif — المشتريات: أوامر الشراء، الاستلام مع فحص الوزن والحرارة، وقائمة أسعار الموردين بتواريخ سريان.
   المحركات: SKEngines.procurement (matchReceipt, purchaseOrderValue, inspectReceiving).
   الترحيل للدفاتر يتم من «الدفاتر المحاسبية › القيود». البيانات: skosif_purchasing_v1. */
(()=>{
"use strict";
/* a new order line starts at the company's VAT rate (SKosifCompanyPlatform.vatPolicy); the line keeps whatever the user types */
const defVat=()=>SK.vatRate();
/* the company rate, exempt, and the line's own rate when an older order carries another one (kept, never rewritten) */
const vatOptions=l=>{const own=String(l.vat??""),vals=[...new Set([String(defVat()),"0",own].filter(v=>v!==""&&Number.isFinite(Number(v))))];
  return vals.map(v=>'<option value="'+v+'"'+(own===v?" selected":"")+'>'+(v==="0"?"معفى":Math.round(Number(v)*10000)/100+"٪")+'</option>').join("")};
const {$,esc,load,save,money,toast}=SK;
const P=()=>window.SKEngines.procurement;
const KEY="skosif_purchasing_v1";
let tab="orders",po=null,recvFor="";
const db=()=>{const d=load(KEY,{});return{orders:d.orders||[],receipts:d.receipts||[],prices:d.prices||[]}};
const put=d=>save(KEY,d);
const today=()=>new Date().toISOString().slice(0,10);
const n=v=>Number(v)||0;
function suppliers(d){
  const s=new Set(d.orders.map(o=>o.supplier).concat(d.prices.map(p=>p.supplier)));
  (load("skosif_v31_supplier_batches",[])||[]).forEach(b=>b&&b.supplier&&s.add(b.supplier));
  return [...s].filter(Boolean).sort((a,b)=>a.localeCompare(b,"ar"));
}
function items(){try{return(window.SKosifCore.catalog().items||[]).filter(i=>i.kind==="raw").map(i=>i.name)}catch{return[]}}
/* the supplier price valid on a date (latest start wins) */
function priceFor(d,supplier,item,date){
  return d.prices.filter(p=>p.supplier===supplier&&p.item===item&&p.from<=date&&(!p.to||p.to>=date)).sort((a,b)=>b.from.localeCompare(a.from))[0]||null;
}
const STATUS={OPEN:["مفتوح","warn"],RECEIVED:["مستلم","good"],PARTIAL:["استلام جزئي","warn"],VOID:["ملغى",""]};
const pill=s=>{const [l,c]=STATUS[s]||[s,""];return '<span class="sk-pill '+c+'">'+l+'</span>'};

function ordersHTML(d){
  po=po||{supplier:"",date:today(),dueDate:"",lines:[{item:"",qty:"",cost:"",vat:String(defVat())}]};
  const sup=suppliers(d),its=items();
  const total=P().procurement.purchaseOrderValue(po.lines.map(l=>({itemId:l.item,orderedQty:n(l.qty),unitCost:n(l.cost)})));
  return '<datalist id="pu-sup">'+sup.map(s=>'<option value="'+esc(s)+'">').join("")+'</datalist><datalist id="pu-items">'+its.map(s=>'<option value="'+esc(s)+'">').join("")+'</datalist>'+
  '<section class="card"><div class="card-h"><div><h3>أمر شراء جديد</h3><p>تُقترح تكلفة الوحدة من قائمة أسعار المورد السارية.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>المورد</span><input id="pu-supplier" list="pu-sup" value="'+esc(po.supplier)+'" data-sk-required></label><label class="sk-field"><span>تاريخ الأمر</span><input type="date" id="pu-date" value="'+esc(po.date)+'"></label>'+
    '<label class="sk-field"><span>تاريخ التوريد المتوقع</span><input type="date" id="pu-due" value="'+esc(po.dueDate)+'"></label></div>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف</th><th>الكمية (كجم)</th><th>تكلفة الوحدة قبل الضريبة</th><th>الضريبة</th><th></th></tr></thead><tbody>'+
    po.lines.map((l,i)=>'<tr><td><input list="pu-items" data-pl="'+i+'" data-f="item" value="'+esc(l.item)+'"></td><td><input inputmode="decimal" data-pl="'+i+'" data-f="qty" value="'+esc(l.qty)+'" style="width:90px"></td><td><input inputmode="decimal" data-pl="'+i+'" data-f="cost" value="'+esc(l.cost)+'" style="width:110px"></td><td><select data-pl="'+i+'" data-f="vat">'+vatOptions(l)+'</select></td><td>'+(po.lines.length>1?'<button type="button" class="linkish" data-p="rm" data-i="'+i+'">حذف</button>':'')+'</td></tr>').join("")+
    '</tbody></table></div><div class="sk-actions"><button type="button" class="btn" data-p="add-line">إضافة سطر</button><b>قيمة الأمر قبل الضريبة: <span id="pu-total">'+money(total)+'</span></b><button type="button" class="btn primary" data-p="save-po">حفظ أمر الشراء</button></div></div></section>'+
  '<section class="card"><div class="card-h"><div><h3>أوامر الشراء</h3><p>'+d.orders.length+' أمراً.</p></div></div><div class="card-b">'+
    (d.orders.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الرقم</th><th>المورد</th><th>التاريخ</th><th>القيمة</th><th>الحالة</th><th></th></tr></thead><tbody>'+
      d.orders.slice().reverse().map(o=>'<tr><td class="n">'+esc(o.number)+'</td><td>'+esc(o.supplier)+'</td><td class="n">'+esc(o.date)+'</td><td class="n">'+money(o.value)+'</td><td>'+pill(o.status)+'</td><td>'+
      (o.status==="OPEN"||o.status==="PARTIAL"?'<button type="button" class="linkish" data-p="recv" data-id="'+esc(o.id)+'">استلام</button> · <button type="button" class="linkish" data-p="void" data-id="'+esc(o.id)+'">إلغاء</button>':'')+
      ' · <button type="button" class="linkish" data-p="wa" data-id="'+esc(o.id)+'">واتساب</button></td></tr>').join("")+'</tbody></table></div>':SK.ui.state.empty({title:"لا توجد أوامر شراء بعد"}))+'</div></section>';
}
function receiveHTML(d){
  const open=d.orders.filter(o=>o.status==="OPEN"||o.status==="PARTIAL");
  const o=d.orders.find(x=>x.id===recvFor)||open[0];
  const list='<section class="card"><div class="card-h"><div><h3>الاستلامات المسجلة</h3><p>'+d.receipts.length+' استلاماً — تُرحّل من «الدفاتر المحاسبية».</p></div></div><div class="card-b">'+
    (d.receipts.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>الأمر</th><th>الفحص</th><th>فرق الوزن</th><th>الحرارة</th></tr></thead><tbody>'+
      d.receipts.slice().reverse().map(r=>{const oo=d.orders.find(x=>x.id===r.orderId)||{};const i=r.inspection||{};return '<tr><td class="n">'+esc(r.date)+'</td><td>'+esc((oo.number||"")+" · "+(oo.supplier||""))+'</td><td>'+(i.overallStatus==="OK"?'<span class="sk-pill good">مقبول</span>':r.reviewed?'<span class="sk-pill">روجع</span>':'<span class="sk-pill warn">مراجعة</span> <button type="button" class="linkish" data-p="reviewed" data-id="'+esc(r.id)+'">تمت المراجعة</button>')+'</td><td><span class="n">'+esc(i.discrepancyKg??"—")+'</span> كجم (<span class="n">'+esc(i.discrepancyPercent??0)+'</span>٪)</td><td>'+(r.temperature!=null&&r.temperature!==""?'<span class="n">'+esc(r.temperature)+'</span> °م':"غير مسجلة")+'</td></tr>'}).join("")+'</tbody></table></div>':SK.ui.state.empty({title:"لا توجد استلامات"}))+'</div></section>';
  if(!o)return SK.ui.state.empty({title:"لا توجد أوامر مفتوحة للاستلام",text:"أنشئ أمر شراء من تبويب «أوامر الشراء»."})+list;
  return '<section class="card"><div class="card-h"><div><h3>استلام وفحص</h3><p>الكميات المستلمة مقابل المطلوبة، وفحص الوزن الفعلي ودرجة الحرارة عند الاستلام.</p></div></div><div class="card-b sk-stack">'+
    '<label class="sk-field"><span>أمر الشراء</span><select id="rc-po">'+open.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===o.id?" selected":"")+'>'+esc(x.number+" · "+x.supplier+" · "+x.date)+'</option>').join("")+'</select></label>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف</th><th>المطلوب</th><th>المستلم (كجم)</th></tr></thead><tbody>'+
    o.lines.map((l,i)=>'<tr><td>'+esc(l.item)+'</td><td class="n">'+esc(l.qty)+'</td><td><input inputmode="decimal" data-rq="'+i+'" value="'+esc(l.qty)+'" style="width:100px"></td></tr>').join("")+'</tbody></table></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>وزن الفاتورة (كجم)</span><input id="rc-inv" inputmode="decimal" value="'+esc(o.lines.reduce((s,l)=>s+n(l.qty),0))+'"></label><label class="sk-field"><span>الوزن الفعلي على الميزان (كجم)</span><input id="rc-act" inputmode="decimal" data-sk-required></label>'+
    '<label class="sk-field"><span>درجة الحرارة عند الاستلام (°م)</span><input id="rc-temp" inputmode="decimal" placeholder="اختياري"></label><label class="sk-field"><span>الحد الأعلى للحرارة / سماحية الوزن ٪</span><div class="sk-actions"><input id="rc-max" inputmode="decimal" value="4" style="width:70px"><input id="rc-tol" inputmode="decimal" value="2" style="width:70px"></div></label></div>'+
    '<label class="sk-field"><span>ملاحظات</span><input id="rc-notes"></label><div class="sk-actions"><button type="button" class="btn primary" data-p="save-rc">حفظ الاستلام</button></div><div id="rc-out"></div></div></section>'+list;
}
function pricesHTML(d){
  const sup=suppliers(d),its=items(),t=today();
  return '<datalist id="pu-sup">'+sup.map(s=>'<option value="'+esc(s)+'">').join("")+'</datalist><datalist id="pu-items">'+its.map(s=>'<option value="'+esc(s)+'">').join("")+'</datalist>'+
  '<section class="card"><div class="card-h"><div><h3>قائمة أسعار الموردين</h3><p>سعر لكل مورد وصنف بتاريخ سريان؛ يُقترح تلقائياً في أوامر الشراء.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>المورد</span><input id="pr-sup" list="pu-sup" data-sk-required></label><label class="sk-field"><span>الصنف</span><input id="pr-item" list="pu-items" data-sk-required></label>'+
    '<label class="sk-field"><span>سعر الوحدة قبل الضريبة</span><input id="pr-price" inputmode="decimal" data-sk-required data-sk-min="0.01"></label><label class="sk-field"><span>الوحدة</span><input id="pr-unit" value="كجم"></label>'+
    '<label class="sk-field"><span>ساري من</span><input type="date" id="pr-from" value="'+t+'"></label><label class="sk-field"><span>ساري إلى (اختياري)</span><input type="date" id="pr-to"></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-p="save-price">حفظ السعر</button></div>'+
    (d.prices.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المورد</th><th>الصنف</th><th>السعر</th><th>السريان</th><th>الحالة اليوم</th><th></th></tr></thead><tbody>'+
      d.prices.slice().sort((a,b)=>(a.supplier+a.item).localeCompare(b.supplier+b.item,"ar")||b.from.localeCompare(a.from)).map(p=>{const cur=priceFor(d,p.supplier,p.item,t);return '<tr><td>'+esc(p.supplier)+'</td><td>'+esc(p.item)+'</td><td class="n">'+money(p.price)+' / '+esc(p.unit||"")+'</td><td class="n">'+esc(p.from)+' → '+esc(p.to||"مفتوح")+'</td><td>'+(cur&&cur.id===p.id?'<span class="sk-pill good">ساري</span>':'<span class="sk-pill">غير ساري</span>')+'</td><td><button type="button" class="linkish" data-p="del-price" data-id="'+esc(p.id)+'">حذف</button></td></tr>'}).join("")+'</tbody></table></div>':SK.ui.state.empty({title:"لا توجد أسعار مسجلة"}))+
  '</div></section>';
}
function paint(root){
  const d=db();
  root.innerHTML=SK.ui.tabs([["orders","أوامر الشراء",d.orders.filter(o=>o.status==="OPEN").length],["receive","الاستلام والفحص",d.receipts.length],["prices","أسعار الموردين",d.prices.length]],tab,"pur")+
    ({orders:ordersHTML,receive:receiveHTML,prices:pricesHTML}[tab])(d);
}
function bind(root){
  root.addEventListener("click",async e=>{
    const t=e.target.closest("[data-tab]");if(t&&t.closest('[data-sk-tabs="pur"]')){tab=t.dataset.tab;paint(root);return}
    const b=e.target.closest("[data-p]");if(!b)return;const a=b.dataset.p,d=db();
    if(a==="add-line")po.lines.push({item:"",qty:"",cost:"",vat:String(defVat())});
    else if(a==="rm")po.lines.splice(+b.dataset.i,1);
    else if(a==="save-po"){
      if(!SK.ui.validate(root))return;
      const lines=po.lines.filter(l=>l.item.trim()&&n(l.qty)>0);
      if(!lines.length)return toast("أضف صنفاً بكمية","warn");
      const value=P().procurement.purchaseOrderValue(lines.map(l=>({itemId:l.item,orderedQty:n(l.qty),unitCost:n(l.cost)})));
      d.orders.push({id:SK.ui.uid("po"),number:"PO-"+String(d.orders.length+1).padStart(4,"0"),supplier:po.supplier.trim(),date:po.date,dueDate:po.dueDate,lines:lines.map(l=>({item:l.item.trim(),qty:n(l.qty),cost:n(l.cost),vat:l.vat})),value,status:"OPEN"});
      put(d);po=null;toast("حُفظ أمر الشراء","ok");
    }
    else if(a==="void"){if(!await SK.confirm("إلغاء أمر الشراء؟",{danger:true,ok:"إلغاء الأمر"}))return;const o=d.orders.find(x=>x.id===b.dataset.id);if(o){o.status="VOID";put(d)}}
    else if(a==="recv"){recvFor=b.dataset.id;tab="receive"}
    else if(a==="wa"){const o=d.orders.find(x=>x.id===b.dataset.id);if(o){const txt="أمر شراء "+o.number+"\n"+o.lines.map(l=>"• "+l.item+": "+l.qty+" كجم").join("\n")+(o.dueDate?"\nالتوريد: "+o.dueDate:"");window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank","noopener")}return}
    else if(a==="save-rc"){
      if(!SK.ui.validate(root))return;
      const o=d.orders.find(x=>x.id===$("#rc-po",root).value);if(!o)return;
      const received=o.lines.map((l,i)=>({item:l.item,qty:Number($('[data-rq="'+i+'"]',root).value)}));
      if(received.some(l=>!Number.isFinite(l.qty)||l.qty<0))return toast("أدخل كميات مستلمة صحيحة غير سالبة","warn");
      const lines=received.filter(l=>l.qty>0);
      if(!lines.length)return toast("أدخل كمية مستلمة أكبر من صفر لصنف واحد على الأقل","warn");
      const variances=P().procurement.matchReceipt(o.lines.map(l=>({itemId:l.item,orderedQty:l.qty,unitCost:l.cost})),lines.map(l=>({itemId:l.item,receivedQty:l.qty})));
      const input={id:SK.ui.uid("insp"),date:today(),invoicedKg:n($("#rc-inv",root).value),actualKg:n($("#rc-act",root).value),maxTemperatureC:n($("#rc-max",root).value),tolerancePercent:n($("#rc-tol",root).value)};
      const tv=$("#rc-temp",root).value.trim();if(tv!=="")input.temperatureC=n(tv);
      const v=P().receivingInspection.validateReceivingInspection(input);if(!v.valid)return toast("أدخل وزن الفاتورة والوزن الفعلي","warn");
      const inspection=P().receivingInspection.inspectReceiving(input);
      d.receipts.push({id:SK.ui.uid("rc"),orderId:o.id,date:today(),lines,variances,inspection,temperature:tv,notes:$("#rc-notes",root).value.trim(),status:"RECEIVED"});
      const short=variances.some(x=>x.status==="SHORT");o.status=short?"PARTIAL":"RECEIVED";
      /* the cold-chain log gets the reading too, so traceability sees it */
      if(tv!==""){const cold=load("skosif_v38_coldchain",[]);if(Array.isArray(cold)){cold.unshift({time:new Date().toLocaleString("ar-SA"),loc:"استلام — "+o.supplier,temp:n(tv),humidity:"",inspector:"فحص الاستلام"});save("skosif_v38_coldchain",cold.slice(0,500))}}
      put(d);toast(inspection.overallStatus==="OK"?"حُفظ الاستلام — مقبول":"حُفظ الاستلام — يحتاج مراجعة ("+(inspection.weightStatus==="REVIEW"?"فرق وزن":"")+(inspection.temperatureStatus==="REVIEW"?" حرارة":"")+")",inspection.overallStatus==="OK"?"ok":"warn");
      recvFor="";
    }
    else if(a==="save-price"){
      if(!SK.ui.validate(root))return;
      d.prices.push({id:SK.ui.uid("pr"),supplier:$("#pr-sup",root).value.trim(),item:$("#pr-item",root).value.trim(),price:n($("#pr-price",root).value),unit:$("#pr-unit",root).value.trim(),from:$("#pr-from",root).value||today(),to:$("#pr-to",root).value||""});
      put(d);toast("حُفظ السعر","ok");
    }
    else if(a==="reviewed"){const r=d.receipts.find(x=>x.id===b.dataset.id);if(r){r.reviewed=true;r.reviewedAt=new Date().toISOString();put(d)}}
    else if(a==="del-price"){d.prices=d.prices.filter(x=>x.id!==b.dataset.id);put(d)}
    paint(root);
  });
  root.addEventListener("input",e=>{
    const el=e.target;if(!po)return;
    if(el.dataset.pl!=null){const l=po.lines[+el.dataset.pl];l[el.dataset.f]=el.value;
      if(el.dataset.f==="item"&&!l.cost){const pr=priceFor(db(),po.supplier.trim(),el.value.trim(),po.date);if(pr){l.cost=String(pr.price);const c=root.querySelector('[data-pl="'+el.dataset.pl+'"][data-f="cost"]');if(c)c.value=l.cost}}}
    if(el.id==="pu-supplier")po.supplier=el.value;if(el.id==="pu-date")po.date=el.value;if(el.id==="pu-due")po.dueDate=el.value;
    const tot=root.querySelector("#pu-total");if(tot&&po)tot.textContent=money(P().procurement.purchaseOrderValue(po.lines.map(l=>({itemId:l.item,orderedQty:n(l.qty),unitCost:n(l.cost)}))));
  });
  root.addEventListener("change",e=>{if(e.target.id==="rc-po"){recvFor=e.target.value;paint(root)}});
}
SK.view("purchasing",{render(node){if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint(node)}});
})();

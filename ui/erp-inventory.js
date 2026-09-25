/* S.kosif ERP — inventory ledger and stock counts. Non-destructive extension. */
(()=>{
"use strict";
const SK=window.SK, core=window.SKosifCore;
if(!SK||!core)return;
const {esc,num,load,save,toast}=SK;
const INV_KEY="aghnam_v29_inventory";
const MOV_KEY="skosif_inventory_movements_v1";
const CNT_KEY="skosif_inventory_counts_v1";
const money=n=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2}).format(Number(n)||0);
const nowDate=()=>new Date().toISOString().slice(0,10);
function inv(){const x=load(INV_KEY,[]);return Array.isArray(x)?x:[]}
function movements(){const x=load(MOV_KEY,[]);return Array.isArray(x)?x:[]}
function counts(){const x=load(CNT_KEY,[]);return Array.isArray(x)?x:[]}
function recalc(x){
  const stock=num(x.stock),daily=num(x.daily),lead=num(x.lead),safety=num(x.safety),cycle=num(x.cycle);
  const cover=daily>0?stock/daily:0,reorderPoint=daily*(lead+safety),targetStock=daily*(lead+safety+cycle),suggested=Math.max(0,targetStock-stock);
  const status=daily<=0?"يحتاج معدل بيع":stock<=reorderPoint?"إعادة طلب عاجلة":cover<=lead+safety+Math.max(1,cycle*.35)?"إعادة طلب قريبة":"المخزون آمن حالياً";
  return {...x,stock,cover,reorderPoint,targetStock,suggested,status,ts:new Date().toISOString()};
}
function updateStock(item,delta,absolute){
  const list=inv();let i=list.findIndex(x=>String(x.item||"").trim()===item);
  if(i<0){list.unshift(recalc({item,stock:absolute!=null?absolute:delta,daily:0,lead:2,safety:2,cycle:7}));i=0}
  else list[i]=recalc({...list[i],stock:absolute!=null?absolute:num(list[i].stock)+delta});
  save(INV_KEY,list.slice(0,400));return list[i];
}
function itemNames(){
  const s=new Set(inv().map(x=>x.item).filter(Boolean));
  try{(core.raws?core.raws():[]).forEach(x=>x&&x.name&&s.add(x.name))}catch{}
  return [...s].sort((a,b)=>String(a).localeCompare(String(b),"ar"));
}
function statusClass(x){return String(x||"").includes("عاجلة")?"bad":String(x||"").includes("قريبة")?"warn":"good"}
function render(root){
  let host=root.querySelector("#sk-erp-inventory");
  if(!host){host=document.createElement("section");host.id="sk-erp-inventory";host.className="card sk-erp-card";root.appendChild(host)}
  const list=inv(), mv=movements(), ct=counts(), names=itemNames();
  const urgent=list.filter(x=>String(x.status).includes("عاجلة")).length;
  const lastCount=ct[0]?.date||"—";
  host.innerHTML=
    '<div class="card-h"><div><h3>دفتر المخزون والجرد</h3><p>رصيد حالي، حركة وارد/صادر، جرد فعلي وفروقات قابلة للمراجعة.</p></div><div class="sk-actions"><button type="button" class="btn sm" id="erp-inv-export">CSV</button></div></div>'+
    '<div class="card-b sk-stack">'+
      '<div class="sk-kpis"><div class="sk-kpi"><span>أصناف لها رصيد</span><b>'+list.length+'</b></div><div class="sk-kpi '+(urgent?"bad":"good")+'"><span>إعادة طلب عاجلة</span><b>'+urgent+'</b></div><div class="sk-kpi"><span>حركات مسجلة</span><b>'+mv.length+'</b></div><div class="sk-kpi"><span>آخر جرد</span><b>'+esc(lastCount)+'</b></div></div>'+
      '<div class="sk-erp-tabs"><button type="button" data-erp-inv-tab="balance" class="active">بيان المخزون</button><button type="button" data-erp-inv-tab="move">تسجيل حركة</button><button type="button" data-erp-inv-tab="count">جرد فعلي</button><button type="button" data-erp-inv-tab="history">سجلات الجرد</button></div>'+
      '<div id="erp-inv-body"></div>'+
    '</div>';
  const body=host.querySelector("#erp-inv-body");
  const opt=names.map(n=>'<option value="'+esc(n)+'">').join("");
  function balance(){
    body.innerHTML=list.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف</th><th>الرصيد الحالي</th><th>متوسط البيع</th><th>أيام التغطية</th><th>حد إعادة الطلب</th><th>الحالة</th><th>آخر حركة</th></tr></thead><tbody>'+
      list.map(x=>{const lm=mv.find(m=>m.item===x.item);return '<tr><td><b>'+esc(x.item)+'</b></td><td>'+money(x.stock)+'</td><td>'+money(x.daily)+'</td><td>'+money(x.cover)+'</td><td>'+money(x.reorderPoint)+'</td><td><span class="sk-pill '+statusClass(x.status)+'">'+esc(x.status)+'</span></td><td>'+(lm?esc(lm.date+" · "+lm.type):"—")+'</td></tr>'}).join("")+
      '</tbody></table></div>':'<div class="sk-empty">ابدأ من شاشة المخزون بتسجيل رصيد أول صنف.</div>';
  }
  function move(){
    body.innerHTML='<div class="sk-grid2">'+
      '<label class="sk-field"><span>التاريخ</span><input id="erp-mv-date" type="date" value="'+nowDate()+'"></label>'+
      '<label class="sk-field"><span>الصنف</span><input id="erp-mv-item" list="erp-inv-items" placeholder="اختر أو اكتب الصنف"><datalist id="erp-inv-items">'+opt+'</datalist></label>'+
      '<label class="sk-field"><span>نوع الحركة</span><select id="erp-mv-type"><option value="وارد">وارد</option><option value="صادر">صادر</option><option value="تسوية زيادة">تسوية زيادة</option><option value="تسوية نقص">تسوية نقص</option></select></label>'+
      '<label class="sk-field"><span>الكمية</span><input id="erp-mv-qty" type="number" min="0" step="0.01"></label>'+
      '<label class="sk-field"><span>المرجع</span><input id="erp-mv-ref" placeholder="فاتورة / إذن / أمر شراء"></label>'+
      '<label class="sk-field"><span>ملاحظة</span><input id="erp-mv-note" placeholder="اختياري"></label></div>'+
      '<div class="sk-actions"><button type="button" class="btn primary" id="erp-mv-save">حفظ الحركة وتحديث الرصيد</button></div>';
    host.querySelector("#erp-mv-save").onclick=()=>{
      const item=host.querySelector("#erp-mv-item").value.trim(),qty=num(host.querySelector("#erp-mv-qty").value),type=host.querySelector("#erp-mv-type").value;
      if(!item||qty<=0)return toast("أدخل الصنف والكمية","err");
      const neg=type==="صادر"||type==="تسوية نقص",delta=neg?-qty:qty;
      const row={id:"mv"+Date.now().toString(36),date:host.querySelector("#erp-mv-date").value||nowDate(),item,type,qty,delta,ref:host.querySelector("#erp-mv-ref").value.trim(),note:host.querySelector("#erp-mv-note").value.trim(),at:new Date().toISOString()};
      const updated=updateStock(item,delta,null);const rows=movements();rows.unshift({...row,balance:updated.stock});save(MOV_KEY,rows.slice(0,3000));toast("تم تحديث رصيد "+item,"ok");render(root);select("history");
    };
  }
  function count(){
    body.innerHTML='<div class="sk-grid2">'+
      '<label class="sk-field"><span>تاريخ الجرد</span><input id="erp-ct-date" type="date" value="'+nowDate()+'"></label>'+
      '<label class="sk-field"><span>الصنف</span><input id="erp-ct-item" list="erp-ct-items" placeholder="اختر الصنف"><datalist id="erp-ct-items">'+opt+'</datalist></label>'+
      '<label class="sk-field"><span>الرصيد الدفتري</span><input id="erp-ct-book" type="number" step="0.01" readonly></label>'+
      '<label class="sk-field"><span>الكمية الفعلية</span><input id="erp-ct-actual" type="number" min="0" step="0.01"></label>'+
      '<label class="sk-field"><span>القائم بالجرد</span><input id="erp-ct-by" placeholder="الاسم"></label>'+
      '<label class="sk-field"><span>ملاحظات</span><input id="erp-ct-note" placeholder="سبب الفرق إن وجد"></label></div>'+
      '<div class="sk-actions"><button type="button" class="btn primary" id="erp-ct-save">اعتماد الجرد وتسوية الرصيد</button></div><div id="erp-ct-preview"></div>';
    const itemEl=host.querySelector("#erp-ct-item"),bookEl=host.querySelector("#erp-ct-book"),actEl=host.querySelector("#erp-ct-actual"),prev=host.querySelector("#erp-ct-preview");
    const sync=()=>{const x=inv().find(r=>r.item===itemEl.value.trim());bookEl.value=x?num(x.stock):0;const d=num(actEl.value)-num(bookEl.value);prev.innerHTML='<div class="sk-note '+(d===0?"":"warn")+'">فرق الجرد: <b>'+money(d)+'</b></div>'};
    itemEl.oninput=sync;actEl.oninput=sync;sync();
    host.querySelector("#erp-ct-save").onclick=()=>{
      const item=itemEl.value.trim(),actual=num(actEl.value),book=num(bookEl.value),variance=actual-book;
      if(!item||actual<0)return toast("أدخل الصنف والكمية الفعلية","err");
      const row={id:"ct"+Date.now().toString(36),date:host.querySelector("#erp-ct-date").value||nowDate(),item,book,actual,variance,by:host.querySelector("#erp-ct-by").value.trim(),note:host.querySelector("#erp-ct-note").value.trim(),at:new Date().toISOString()};
      const rows=counts();rows.unshift(row);save(CNT_KEY,rows.slice(0,1200));updateStock(item,0,actual);
      const moves=movements();moves.unshift({id:"mv"+Date.now().toString(36),date:row.date,item,type:"تسوية جرد",qty:Math.abs(variance),delta:variance,ref:row.id,note:row.note,balance:actual,at:row.at});save(MOV_KEY,moves.slice(0,3000));
      toast("تم اعتماد الجرد","ok");render(root);select("history");
    };
  }
  function history(){
    body.innerHTML='<div class="sk-grid-2"><div><h4 class="sk-erp-subtitle">آخر حركات المخزون</h4>'+
      (mv.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>الصنف</th><th>الحركة</th><th>الكمية</th><th>الرصيد</th><th>المرجع</th></tr></thead><tbody>'+mv.slice(0,60).map(x=>'<tr><td>'+esc(x.date)+'</td><td>'+esc(x.item)+'</td><td>'+esc(x.type)+'</td><td>'+money(x.delta)+'</td><td>'+money(x.balance)+'</td><td>'+esc(x.ref||"—")+'</td></tr>').join("")+'</tbody></table></div>':'<div class="sk-empty">لا توجد حركات.</div>')+
      '</div><div><h4 class="sk-erp-subtitle">سجلات الجرد</h4>'+
      (ct.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>الصنف</th><th>دفتر</th><th>فعلي</th><th>الفرق</th><th>القائم بالجرد</th></tr></thead><tbody>'+ct.slice(0,60).map(x=>'<tr><td>'+esc(x.date)+'</td><td>'+esc(x.item)+'</td><td>'+money(x.book)+'</td><td>'+money(x.actual)+'</td><td class="'+(num(x.variance)?"sk-erp-var":"")+'">'+money(x.variance)+'</td><td>'+esc(x.by||"—")+'</td></tr>').join("")+'</tbody></table></div>':'<div class="sk-empty">لا توجد سجلات جرد.</div>')+
      '</div></div>';
  }
  const screens={balance,move,count,history};
  function select(k){host.querySelectorAll("[data-erp-inv-tab]").forEach(b=>b.classList.toggle("active",b.dataset.erpInvTab===k));screens[k]()}
  host.querySelectorAll("[data-erp-inv-tab]").forEach(b=>b.onclick=()=>select(b.dataset.erpInvTab));
  host.querySelector("#erp-inv-export").onclick=()=>SK.csv.download("S.kosif-inventory-ledger-"+nowDate(),["التاريخ","الصنف","الحركة","الكمية","الرصيد","المرجع","ملاحظة"],mv.map(x=>[x.date,x.item,x.type,x.delta,x.balance,x.ref||"",x.note||""]));
  balance();
}
function attach(root){
  if(root.dataset.erpInventoryHook)return;root.dataset.erpInventoryHook="1";
  let busy=false;const ensure=()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{try{render(root)}finally{busy=false}})};
  const mo=new MutationObserver(()=>{if(!root.querySelector("#sk-erp-inventory"))ensure()});mo.observe(root,{childList:true});ensure();
}
core.onView("inventory",attach);
})();
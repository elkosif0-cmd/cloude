/* S.kosif ERP+ — independent extension to avoid conflicts on main. */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const E=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const N=v=>{const n=Number(String(v??"").replace(/,/g,""));return Number.isFinite(n)?n:0};
const L=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const M=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v))+" ر.س";
const Q=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:3}).format(N(v));
const D=()=>new Date().toISOString().slice(0,10), MON=()=>new Date().toISOString().slice(0,7);
const toast=(m,t)=>window.SK?.toast?window.SK.toast(m,t):console.info(m);
const cat=()=>{try{return window.SKosifCore?.catalog?.()||{items:[]}}catch{return {items:[]}}};
const items=()=>{
  let list=(cat().items)||[];
  if(!list.length){try{list=(window.SKosifCore?.raws?.()||[]).map(r=>({id:r.id||r.name,name:r.name,cost:r.cost,price:r.price}))}catch{}}
  return list.filter(x=>x&&x.status!=="archived").sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"ar"));
};
const cost=i=>{for(const k of ["cost","unitCost","usableCost","netCost","cogs","currentCost","purchaseCost"]){const v=N(i?.[k]);if(v>0)return v}const p=N(i?.price),m=N(i?.margin);return p>0&&m>-1&&m<1?p*(1-m):0};
const add=(root,id,html,pos="afterbegin")=>{if(!root||root.querySelector("#"+id))return false;root.insertAdjacentHTML(pos,html);return true};
const id=p=>p+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const csv=(name,h,r)=>window.SK?.csv?.download?.(name,h,r);

const KINV="skosif_erp_inventory_v1", KFIN="skosif_erp_finance_v1", KAP="skosif_erp_payables_v1", KIS="skosif_income_statements_v1";

function inv(){
  const s=L(KINV,{stock:{},reorder:{},moves:[],counts:[]}), old=L("aghnam_v29_inventory",[]), its=items();
  if(Array.isArray(old))old.forEach(r=>{const x=its.find(i=>String(i.id)===String(r.id)||String(i.name)===String(r.name));if(x){if(s.stock[x.id]==null)s.stock[x.id]=N(r.stock);if(s.reorder[x.id]==null)s.reorder[x.id]=N(r.reorderPoint)}});
  its.forEach(x=>{if(s.stock[x.id]==null)s.stock[x.id]=0;if(s.reorder[x.id]==null)s.reorder[x.id]=0});
  return s;
}
function inventoryView(root){
  let s=inv();S(KINV,s);const its=items(), low=its.filter(x=>N(s.reorder[x.id])>0&&N(s.stock[x.id])<=N(s.reorder[x.id]));
  const opts=its.map(x=>'<option value="'+E(x.id)+'">'+E(x.name||x.id)+'</option>').join("");
  const rows=its.slice(0,120).map(x=>'<tr><td>'+E(x.name||x.id)+'</td><td>'+Q(s.stock[x.id])+'</td><td><input class="skx-mini" data-ro="'+E(x.id)+'" type="number" step=".001" min="0" value="'+N(s.reorder[x.id])+'"></td><td><input class="skx-mini" data-count="'+E(x.id)+'" type="number" step=".001" min="0" placeholder="—"></td></tr>').join("");
  const html='<section class="card skx" id="skx-inv"><div class="card-h"><div><h3>المخزون والجرد</h3><p>رصيد حالي، وارد وصادر، حد إعادة الطلب، جرد فعلي وسجل فروقات.</p></div><button class="btn sm" id="skx-inv-csv">CSV</button></div><div class="card-b skx-stack">'+
  '<div class="skx-kpis"><div><span>الأصناف</span><b>'+its.length+'</b></div><div><span>إجمالي الوحدات</span><b>'+Q(its.reduce((a,x)=>a+N(s.stock[x.id]),0))+'</b></div><div class="'+(low.length?'warn':'good')+'"><span>بلغ حد الطلب</span><b>'+low.length+'</b></div><div><span>آخر جرد</span><b>'+(s.counts[0]?E(s.counts[0].date):'—')+'</b></div></div>'+
  '<div class="skx-form"><label>الصنف<select id="skx-i-item">'+opts+'</select></label><label>الحركة<select id="skx-i-type"><option value="in">وارد</option><option value="out">صادر</option><option value="adjust">تسوية</option></select></label><label>الكمية<input id="skx-i-qty" type="number" step=".001" min="0"></label><label>مرجع/ملاحظة<input id="skx-i-note"></label><button class="btn primary" id="skx-i-save">حفظ الحركة</button></div>'+
  '<div class="skx-grid2"><div class="skx-panel"><div class="skx-title"><b>الجرد الفعلي</b><span>اكتب الفعلي للأصناف التي تم جردها فقط.</span></div><div class="skx-tablewrap"><table class="skx-table"><thead><tr><th>الصنف</th><th>الرصيد</th><th>حد الطلب</th><th>الفعلي</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="skx-actions"><button class="btn" id="skx-ro-save">حفظ الحدود</button><button class="btn primary" id="skx-count-save">اعتماد الجرد</button></div></div>'+
  '<div class="skx-panel"><div class="skx-title"><b>سجل الجرد والحركات</b><span>آخر العمليات</span></div><div class="skx-log">'+(s.counts.slice(0,5).map(c=>'<div><b>جرد '+E(c.date)+'</b><span>'+c.lines+' صنف · فرق '+Q(c.variance)+'</span></div>').join("")||'<p class="muted">لا يوجد جرد بعد.</p>')+s.moves.slice(0,12).map(m=>'<div><b>'+E(m.name)+'</b><span>'+E(m.label)+' '+Q(m.qty)+' · '+E(m.date)+(m.note?' · '+E(m.note):'')+'</span></div>').join("")+'</div></div></div></div></section>';
  if(!add(root,"skx-inv",html))return;const b=$("#skx-inv",root);
  $("#skx-i-save",b).onclick=()=>{s=inv();const iid=$("#skx-i-item",b).value,t=$("#skx-i-type",b).value,q=N($("#skx-i-qty",b).value),note=$("#skx-i-note",b).value.trim(),it=its.find(x=>String(x.id)===String(iid));if(!it||q<=0)return toast("اكتب كمية صحيحة","err");const before=N(s.stock[iid]);let after=t==="in"?before+q:t==="out"?Math.max(0,before-q):q;s.stock[iid]=after;s.moves.unshift({id:id("mv"),date:D(),name:it.name||iid,label:t==="in"?"وارد":t==="out"?"صادر":"تسوية",qty:q,before,after,note});s.moves=s.moves.slice(0,1000);S(KINV,s);toast("تم حفظ حركة المخزون","ok");b.remove();inventoryView(root)};
  $("#skx-ro-save",b).onclick=()=>{s=inv();$$("[data-ro]",b).forEach(x=>s.reorder[x.dataset.ro]=N(x.value));S(KINV,s);toast("تم حفظ حدود إعادة الطلب","ok")};
  $("#skx-count-save",b).onclick=()=>{s=inv();const lines=[];$$("[data-count]",b).forEach(x=>{if(x.value==="")return;const iid=x.dataset.count,it=its.find(y=>String(y.id)===String(iid)),book=N(s.stock[iid]),physical=N(x.value),vr=physical-book;s.stock[iid]=physical;lines.push({iid,name:it?.name||iid,book,physical,vr});s.moves.unshift({id:id("mv"),date:D(),name:it?.name||iid,label:"فرق جرد",qty:vr,before:book,after:physical,note:"اعتماد جرد فعلي"})});if(!lines.length)return toast("أدخل كمية فعلية لصنف واحد على الأقل","err");s.counts.unshift({id:id("cnt"),date:D(),lines:lines.length,variance:lines.reduce((a,x)=>a+x.vr,0),detail:lines});S(KINV,s);toast("تم اعتماد الجرد","ok");b.remove();inventoryView(root)};
  $("#skx-inv-csv",b).onclick=()=>csv("SQC-inventory-"+D(),["الصنف","الرصيد","حد الطلب"],its.map(x=>[x.name||x.id,s.stock[x.id],s.reorder[x.id]]));
}

const fin=()=>L(KFIN,{flows:[]});
function cashView(root){
  let s=fin();const m=MON(),r=s.flows.filter(x=>String(x.date).startsWith(m)),inc=r.filter(x=>x.type==="receipt").reduce((a,x)=>a+N(x.amount),0),out=r.filter(x=>x.type==="payment").reduce((a,x)=>a+N(x.amount),0),net=inc-out,cats={};
  r.forEach(x=>{const k=x.category||"أخرى";if(!cats[k])cats[k]={i:0,o:0};cats[k][x.type==="receipt"?"i":"o"]+=N(x.amount)});
  const html='<section class="card skx" id="skx-cash"><div class="card-h"><div><h3>التقارير المالية التفصيلية</h3><p>مقبوضات، مدفوعات، صافي التدفق، وتصنيف كل حركة حتى أصلها.</p></div><button class="btn sm" id="skx-cash-csv">CSV</button></div><div class="card-b skx-stack">'+
  '<div class="skx-kpis"><div class="good"><span>المقبوضات</span><b>'+M(inc)+'</b></div><div class="warn"><span>المدفوعات</span><b>'+M(out)+'</b></div><div class="'+(net>=0?'good':'bad')+'"><span>صافي التدفق</span><b>'+M(net)+'</b></div><div><span>الحركات</span><b>'+r.length+'</b></div></div>'+
  '<div class="skx-form"><label>التاريخ<input id="skx-f-date" type="date" value="'+D()+'"></label><label>النوع<select id="skx-f-type"><option value="receipt">مقبوض</option><option value="payment">مدفوع</option></select></label><label>البند<input id="skx-f-cat" placeholder="مبيعات، موردون، رواتب..."></label><label>الحساب<input id="skx-f-acc" placeholder="صندوق / بنك"></label><label>المبلغ<input id="skx-f-amt" type="number" min="0" step=".01"></label><label>المرجع<input id="skx-f-ref"></label><button class="btn primary" id="skx-f-save">إضافة</button></div>'+
  '<div class="skx-grid2"><div class="skx-panel"><div class="skx-title"><b>ملخص البنود</b><span>'+m+'</span></div><table class="skx-table"><thead><tr><th>البند</th><th>داخل</th><th>خارج</th><th>الصافي</th></tr></thead><tbody>'+(Object.entries(cats).map(([k,v])=>'<tr><td>'+E(k)+'</td><td>'+M(v.i)+'</td><td>'+M(v.o)+'</td><td>'+M(v.i-v.o)+'</td></tr>').join("")||'<tr><td colspan="4">لا توجد حركات.</td></tr>')+'</tbody></table></div><div class="skx-panel"><div class="skx-title"><b>آخر الحركات</b><span>تفاصيل قابلة للمراجعة</span></div><div class="skx-log">'+(s.flows.slice(0,16).map(x=>'<div><b>'+E(x.category)+' · '+M(x.amount)+'</b><span>'+E(x.date)+' · '+(x.type==="receipt"?"مقبوض":"مدفوع")+(x.account?' · '+E(x.account):'')+(x.ref?' · '+E(x.ref):'')+'</span></div>').join("")||'<p class="muted">لا توجد حركات بعد.</p>')+'</div></div></div></div></section>';
  if(!add(root,"skx-cash",html))return;const b=$("#skx-cash",root);
  $("#skx-f-save",b).onclick=()=>{s=fin();const a=N($("#skx-f-amt",b).value);if(a<=0)return toast("اكتب مبلغاً صحيحاً","err");s.flows.unshift({id:id("fl"),date:$("#skx-f-date",b).value||D(),type:$("#skx-f-type",b).value,category:$("#skx-f-cat",b).value.trim()||"أخرى",account:$("#skx-f-acc",b).value.trim(),amount:a,ref:$("#skx-f-ref",b).value.trim()});S(KFIN,s);toast("تم حفظ الحركة المالية","ok");b.remove();cashView(root)};
  $("#skx-cash-csv",b).onclick=()=>csv("SQC-cashflow-"+D(),["التاريخ","النوع","البند","الحساب","المبلغ","المرجع"],s.flows.map(x=>[x.date,x.type,x.category,x.account,x.amount,x.ref]));
}

const aps=()=>L(KAP,{rows:[]});
function suppliersView(root){
  let s=aps(),open=s.rows.filter(x=>!x.paid),tot=open.reduce((a,x)=>a+N(x.amount),0),late=open.filter(x=>x.due&&x.due<D()).reduce((a,x)=>a+N(x.amount),0);
  const html='<section class="card skx" id="skx-ap"><div class="card-h"><div><h3>ذمم الموردين وأوامر الشراء</h3><p>المبالغ المستحقة، تواريخ الاستحقاق، ومرجع أمر الشراء أو الفاتورة.</p></div></div><div class="card-b skx-stack"><div class="skx-kpis"><div><span>مفتوح</span><b>'+M(tot)+'</b></div><div class="'+(late?'bad':'good')+'"><span>متأخر</span><b>'+M(late)+'</b></div><div><span>بنود مفتوحة</span><b>'+open.length+'</b></div></div><div class="skx-form"><label>المورد<input id="skx-ap-s"></label><label>المرجع<input id="skx-ap-r"></label><label>الاستحقاق<input id="skx-ap-d" type="date"></label><label>المبلغ<input id="skx-ap-a" type="number" min="0" step=".01"></label><button class="btn primary" id="skx-ap-save">إضافة استحقاق</button></div><div class="skx-tablewrap"><table class="skx-table"><thead><tr><th>المورد</th><th>المرجع</th><th>الاستحقاق</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>'+(s.rows.slice(0,80).map(x=>'<tr><td>'+E(x.supplier)+'</td><td>'+E(x.ref||"—")+'</td><td>'+E(x.due||"—")+'</td><td>'+M(x.amount)+'</td><td>'+(x.paid?'مدفوع':'<button class="btn sm" data-paid="'+x.id+'">اعتماد السداد</button>')+'</td></tr>').join("")||'<tr><td colspan="5">لا توجد مستحقات.</td></tr>')+'</tbody></table></div></div></section>';
  if(!add(root,"skx-ap",html,"beforeend"))return;const b=$("#skx-ap",root);
  $("#skx-ap-save",b).onclick=()=>{s=aps();const supplier=$("#skx-ap-s",b).value.trim(),a=N($("#skx-ap-a",b).value);if(!supplier||a<=0)return toast("اكتب المورد والمبلغ","err");s.rows.unshift({id:id("ap"),supplier,ref:$("#skx-ap-r",b).value.trim(),due:$("#skx-ap-d",b).value,amount:a,paid:false});S(KAP,s);toast("تمت إضافة الاستحقاق","ok");b.remove();suppliersView(root)};
  $$("[data-paid]",b).forEach(x=>x.onclick=()=>{s=aps();const r=s.rows.find(y=>y.id===x.dataset.paid);if(r){r.paid=true;r.paidAt=D();S(KAP,s);toast("تم اعتماد السداد","ok");b.remove();suppliersView(root)}});
}

const sts=()=>L(KIS,[]);
/* R11 (docs/rebuild/HARSH_REVIEW_20261008_ar.md #19): the month as the books have it — sales, cost of sales (5xxx) and the
   other expenses — so the hand-made statement is checked against the books instead of standing beside them unaware */
function booksMonth(m){try{const B=window.SKosifLedger,d=B&&B.snapshot();if(!d||!d.accounts.length)return null;
  const acc=Object.fromEntries(d.accounts.map(a=>[a.id,a]));let sales=0,cogs=0,exp=0,n=0;
  d.entries.forEach(e=>{if(!String(e.date||"").startsWith(m))return;n++;(e.lines||[]).forEach(l=>{const a=acc[l.accountId];if(!a)return;const dr=N(l.debit),cr=N(l.credit);
    if(a.type==="revenue")sales+=cr-dr;else if(a.type==="expense"){if(String(a.code||"").startsWith("5"))cogs+=dr-cr;else exp+=dr-cr}})});
  return n?{sales,cogs,exp,net:sales-cogs-exp}:{empty:true}}catch{return null}}
function booksStrip(m){const b=booksMonth(m);if(!b)return "";
  if(b.empty)return '<p class="skx-books">لا قيود في الدفاتر لشهر '+E(m)+'.</p>';
  return '<div class="skx-books"><span>الدفاتر لشهر '+E(m)+':</span><b>مبيعات '+M(b.sales)+'</b><b>تكلفة المبيعات '+M(b.cogs)+'</b><b>مصاريف '+M(b.exp)+'</b><b>صافي '+M(b.net)+'</b>'+
    '<button type="button" class="btn sm" id="skx-is-books">خذ المبيعات من الدفاتر</button></div>'}
function reportsView(root){
  const saved=sts(), opts=items().map(x=>'<option value="'+E(x.id)+'">'+E(x.name||x.id)+'</option>').join("");
  const html='<section class="card skx" id="skx-is"><div class="card-h"><div><h3>حساب قائمة الدخل</h3><p>سجل مبيعات الشهر، المواد المباعة وكمياتها، والمصاريف الأخرى؛ والحساب يتم تلقائياً.</p></div><button class="btn sm" id="skx-is-csv">CSV</button></div><div class="card-b skx-stack">'+
  '<div class="skx-form"><label>الشهر<input id="skx-is-m" type="month" value="'+MON()+'"></label><label>مبيعات الشهر<input id="skx-is-sales" type="number" min="0" step=".01"></label></div><div id="skx-is-bk">'+booksStrip(MON())+'</div>'+
  '<div class="skx-grid2"><div class="skx-panel"><div class="skx-title"><b>تكلفة المواد المباعة</b><button class="btn sm" id="skx-m-add">+ صنف</button></div><div id="skx-mats"><div class="skx-line mat"><select>'+opts+'</select><input type="number" class="mqty" min="0" step=".001" placeholder="الكمية"><span class="lt">0.00</span><button class="skx-x">×</button></div></div></div>'+
  '<div class="skx-panel"><div class="skx-title"><b>المصاريف الأخرى</b><button class="btn sm" id="skx-e-add">+ بند</button></div><div id="skx-exps"><div class="skx-line exp"><input class="ename" placeholder="بند المصروف"><input type="number" class="eamt" min="0" step=".01" placeholder="المبلغ"><span></span><button class="skx-x">×</button></div></div></div></div>'+
  '<div class="skx-statement"><div><span>المبيعات</span><b id="p1">0</b></div><div><span>− تكلفة المواد</span><b id="p2">0</b></div><div class="em"><span>= مجمل الربح</span><b id="p3">0</b></div><div><span>− المصاريف الأخرى</span><b id="p4">0</b></div><div class="total"><span>= صافي الربح / الخسارة</span><b id="p5">0</b></div></div><div class="skx-actions"><button class="btn primary" id="skx-is-save">حفظ قائمة الشهر</button><button class="btn" id="skx-is-print">طباعة</button></div>'+
  '<div class="skx-panel"><div class="skx-title"><b>القوائم المحفوظة</b><span>'+saved.length+' شهر</span></div><div class="skx-log">'+(saved.slice(0,12).map(x=>'<div><b>'+E(x.month)+' · صافي '+M(x.net)+'</b><span>مبيعات '+M(x.sales)+' · مواد '+M(x.cogs)+' · مصاريف '+M(x.expenses)+'</span></div>').join("")||'<p class="muted">لا توجد قوائم محفوظة بعد.</p>')+'</div></div></div></section>';
  if(!add(root,"skx-is",html))return;const b=$("#skx-is",root), it=items();
  const mat=()=>'<div class="skx-line mat"><select>'+opts+'</select><input type="number" class="mqty" min="0" step=".001" placeholder="الكمية"><span class="lt">0.00</span><button class="skx-x">×</button></div>', exp=()=>'<div class="skx-line exp"><input class="ename" placeholder="بند المصروف"><input type="number" class="eamt" min="0" step=".01" placeholder="المبلغ"><span></span><button class="skx-x">×</button></div>';
  function calc(){const sales=N($("#skx-is-sales",b).value);let cogs=0;$$(".mat",b).forEach(r=>{const x=it.find(z=>String(z.id)===String($("select",r).value)),v=N($(".mqty",r).value)*cost(x);cogs+=v;$(".lt",r).textContent=M(v)});let ex=0;$$(".eamt",b).forEach(x=>ex+=N(x.value));const g=sales-cogs,n=g-ex;$("#p1",b).textContent=M(sales);$("#p2",b).textContent=M(cogs);$("#p3",b).textContent=M(g);$("#p4",b).textContent=M(ex);$("#p5",b).textContent=M(n);return {sales,cogs,g,ex,n}}
  const bindBooks=()=>{const k=$("#skx-is-books",b);if(k)k.onclick=()=>{const x=booksMonth($("#skx-is-m",b).value||MON());if(x&&!x.empty){$("#skx-is-sales",b).value=Math.round(x.sales*100)/100;calc()}}};
  bindBooks();$("#skx-is-m",b).addEventListener("change",()=>{$("#skx-is-bk",b).innerHTML=booksStrip($("#skx-is-m",b).value||MON());bindBooks()});
  function bindLine(r){$(".skx-x",r).onclick=()=>{r.remove();calc()};$$("input,select",r).forEach(x=>x.oninput=calc)}
  $$(".skx-line",b).forEach(bindLine);$("#skx-is-sales",b).oninput=calc;$("#skx-m-add",b).onclick=()=>{$("#skx-mats",b).insertAdjacentHTML("beforeend",mat());bindLine($("#skx-mats .skx-line:last-child",b));calc()};$("#skx-e-add",b).onclick=()=>{$("#skx-exps",b).insertAdjacentHTML("beforeend",exp());bindLine($("#skx-exps .skx-line:last-child",b));calc()};
  $("#skx-is-save",b).onclick=()=>{const t=calc(),month=$("#skx-is-m",b).value||MON(),materials=$$(".mat",b).map(r=>{const iid=$("select",r).value,x=it.find(z=>String(z.id)===String(iid)),q=N($(".mqty",r).value),uc=cost(x);return {id:iid,name:x?.name||iid,qty:q,unitCost:uc,cost:q*uc}}).filter(x=>x.qty>0), expenses=$$(".exp",b).map(r=>({name:$(".ename",r).value.trim()||"مصروف",amount:N($(".eamt",r).value)})).filter(x=>x.amount>0);let a=sts().filter(x=>x.month!==month);a.unshift({id:id("is"),month,sales:t.sales,cogs:t.cogs,gross:t.g,expenses:t.ex,net:t.n,materials,expenseLines:expenses});S(KIS,a.slice(0,120));toast("تم حفظ قائمة الدخل","ok");b.remove();reportsView(root)};
  $("#skx-is-csv",b).onclick=()=>csv("SQC-income-statements",["الشهر","المبيعات","تكلفة المواد","مجمل الربح","المصاريف","صافي الربح"],sts().map(x=>[x.month,x.sales,x.cogs,x.gross,x.expenses,x.net]));
  $("#skx-is-print",b).onclick=()=>{const t=calc(),month=$("#skx-is-m",b).value||MON(),w=window.open("","_blank");if(!w)return toast("اسمح بالنوافذ المنبثقة للطباعة","err");w.document.write('<html dir="rtl"><meta charset="utf-8"><title>قائمة الدخل '+E(month)+'</title><style>body{font-family:Arial;padding:30px}.r{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:10px}.t{font-size:20px;font-weight:700;border-top:2px solid #111}</style><h1>قائمة الدخل — '+E(month)+'</h1><div class="r"><span>المبيعات</span><b>'+M(t.sales)+'</b></div><div class="r"><span>تكلفة المواد</span><b>'+M(t.cogs)+'</b></div><div class="r"><span>مجمل الربح</span><b>'+M(t.g)+'</b></div><div class="r"><span>المصاريف الأخرى</span><b>'+M(t.ex)+'</b></div><div class="r t"><span>صافي الربح / الخسارة</span><b>'+M(t.n)+'</b></div><script>print()<\\/script>');w.document.close();SK.brandPrint(w);w.document.close()};calc();
}

function jevView(root){
  const its=items(), s=inv(), f=fin(), margins=its.map(x=>N(x.margin)).filter(x=>x>-1&&x<1&&x!==0),avg=margins.length?margins.reduce((a,b)=>a+b,0)/margins.length:0,below=its.filter(x=>N(x.target)>0&&N(x.margin)<N(x.target)),low=its.filter(x=>N(s.reorder[x.id])>0&&N(s.stock[x.id])<=N(s.reorder[x.id])),flows=f.flows.filter(x=>String(x.date).startsWith(MON())),cash=flows.reduce((a,x)=>a+(x.type==="receipt"?N(x.amount):-N(x.amount)),0);
  const alerts=[];if(below.length)alerts.push(below.length+" صنف تحت الهامش المستهدف");if(low.length)alerts.push(low.length+" صنف عند حد إعادة الطلب");if(cash<0)alerts.push("صافي التدفق المسجل للشهر سالب "+M(cash));if(!alerts.length)alerts.push("لا توجد إشارة حرجة من البيانات المسجلة حالياً");
  const html='<section class="card skx" id="skx-jev"><div class="card-h"><div><h3>Jev اليوم</h3><p>مراقب ذكي + محاكاة قبل القرار.</p></div></div><div class="card-b skx-stack"><div class="skx-kpis"><div><span>متوسط الهامش</span><b>'+(avg*100).toFixed(1)+'٪</b></div><div class="'+(below.length?'warn':'good')+'"><span>تحت المستهدف</span><b>'+below.length+'</b></div><div class="'+(low.length?'warn':'good')+'"><span>مخزون يحتاج انتباه</span><b>'+low.length+'</b></div><div class="'+(cash>=0?'good':'bad')+'"><span>صافي تدفق مسجل</span><b>'+M(cash)+'</b></div></div><div class="skx-grid2"><div class="skx-panel"><div class="skx-title"><b>المراقب الذكي</b><span>اضغط أي إشارة لإرسالها لسؤال Jev.</span></div><div class="skx-alerts">'+alerts.map(a=>'<button class="skx-alert" data-q="'+E(a)+'">'+E(a)+'<small>اسأل Jev</small></button>').join("")+'</div></div><div class="skx-panel"><div class="skx-title"><b>محاكاة قبل القرار</b><span>تقدير سريع للهامش</span></div><div class="skx-form compact"><label>تغير التكلفة %<input id="sc" type="number" step=".1" value="0"></label><label>تغير السعر %<input id="sp" type="number" step=".1" value="0"></label></div><div class="skx-sim"><span>هامش تقريبي</span><b id="sm">—</b><button class="btn sm" id="sa">اسأل Jev عن السيناريو</button></div></div></div></div></section>';
  if(!add(root,"skx-jev",html))return;const b=$("#skx-jev",root),put=q=>{const t=$("#jev-q",root);if(t){t.value=q;t.dispatchEvent(new Event("input",{bubbles:true}));t.focus();toast("تم وضع السؤال في Jev","ok")}};
  $$("[data-q]",b).forEach(x=>x.onclick=()=>put("حلل هذه الإشارة من بيانات التطبيق واقترح أفضل إجراء والمخاطر والبدائل: "+x.dataset.q));
  function sim(){const cp=N($("#sc",b).value)/100,pp=N($("#sp",b).value)/100,nm=1-((1-avg)*(1+cp))/Math.max(.01,1+pp);$("#sm",b).textContent=(nm*100).toFixed(1)+"٪";return nm}$("#sc",b).oninput=sim;$("#sp",b).oninput=sim;$("#sa",b).onclick=()=>put("حلل سيناريو تغير التكلفة "+($("#sc",b).value||0)+"٪ وتغير السعر "+($("#sp",b).value||0)+"٪؛ الهامش التقريبي "+(sim()*100).toFixed(1)+"٪. ما أفضل قرار؟");sim();
}

const hook=(v,f)=>{try{window.SKosifCore?.onView?.(v,f)}catch(e){console.warn("ERP+ hook",v,e)}};
hook("inventory",inventoryView);hook("cash",cashView);hook("suppliers",suppliersView);hook("reports",reportsView);hook("jev",jevView);
window.SKosifERPPlus=Object.freeze({inventory:inv,finance:fin,payables:aps,statements:sts});
})();
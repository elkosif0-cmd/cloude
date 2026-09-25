/* S.kosif ERP — monthly income statement builder and finance drilldown. */
(()=>{
"use strict";
const SK=window.SK,core=window.SKosifCore;
if(!SK||!core)return;
const {esc,num,load,save,toast,money}=SK;
const KEY="skosif_income_statements_v2", DRAFT="skosif_income_statement_draft_v2", DB="aghnam-app-v7";
const monthNow=()=>new Date().toISOString().slice(0,7);
function catalog(){try{return core.catalog()}catch{return {items:[]}}}
function costOf(i){for(const k of ["cost","unitCost","costNet","usableCost","purchaseCost"]){const v=Number(i?.[k]);if(Number.isFinite(v)&&v>=0)return v}return 0}
function items(){return (catalog().items||[]).filter(x=>x&&x.status!=="archived").map(x=>({id:String(x.id),name:String(x.name||x.id),cost:costOf(x)}))}
function readSales(month){
  return new Promise(resolve=>{if(!("indexedDB" in window))return resolve(null);let r;try{r=indexedDB.open(DB)}catch{return resolve(null)}
    r.onupgradeneeded=e=>{try{e.target.transaction.abort()}catch{}};r.onerror=()=>resolve(null);r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains("sales_lines")){db.close();return resolve(0)}
      const q=db.transaction("sales_lines","readonly").objectStore("sales_lines").getAll();q.onerror=()=>{db.close();resolve(null)};q.onsuccess=()=>{let t=0;(q.result||[]).forEach(x=>{const d=String(x.date||"");if(d.slice(0,7)===month)t+=(num(x.amountHalalas)?num(x.amountHalalas)/100:num(x.amount))});db.close();resolve(t)}}});
}
function blank(){return {month:monthNow(),revenue:0,materials:[],expenses:[],note:""}}
let st=load(DRAFT,blank());if(!st||typeof st!=="object")st=blank();
function calc(s){
  const materials=(s.materials||[]).map(x=>({...x,qty:num(x.qty),unitCost:num(x.unitCost),total:num(x.qty)*num(x.unitCost)}));
  const expenses=(s.expenses||[]).map(x=>({...x,amount:num(x.amount)}));
  const mat=materials.reduce((a,x)=>a+x.total,0),opex=expenses.reduce((a,x)=>a+x.amount,0),rev=num(s.revenue),gross=rev-mat,net=gross-opex;
  return {...s,revenue:rev,materials,expenses,materialCost:mat,otherExpenses:opex,grossProfit:gross,netProfit:net,grossMargin:rev?gross/rev:0,netMargin:rev?net/rev:0};
}
function options(){return items().map(x=>'<option value="'+esc(x.id)+'" data-cost="'+x.cost+'">'+esc(x.name)+'</option>').join("")}
function render(root){
  let host=root.querySelector("#sk-erp-pl");
  if(!host){host=document.createElement("section");host.id="sk-erp-pl";host.className="card sk-erp-card";root.insertBefore(host,root.firstChild)}
  const c=calc(st),hist=load(KEY,[]);
  host.innerHTML='<div class="card-h"><div><h3>حساب قائمة الدخل الشهرية</h3><p>اختَر المواد والكميات المباعة، فيحسب النظام تكلفة المواد تلقائياً، ثم أضف المصاريف الأخرى بنداً بنداً.</p></div><div class="sk-actions"><button type="button" class="btn sm" id="erp-pl-sales">جلب مبيعات الشهر</button><button type="button" class="btn primary sm" id="erp-pl-save">حفظ الشهر</button></div></div>'+
  '<div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>الشهر</span><input id="erp-pl-month" type="month" value="'+esc(st.month||monthNow())+'"></label><label class="sk-field"><span>إجمالي المبيعات</span><input id="erp-pl-revenue" type="number" min="0" step="0.01" value="'+num(st.revenue)+'"></label></div>'+
    '<div class="sk-erp-split"><div><div class="sk-erp-headrow"><h4>تكاليف المواد / المنتجات المباعة</h4><button class="btn sm" id="erp-pl-add-mat" type="button">+ مادة</button></div><div id="erp-pl-mats">'+
      ((st.materials||[]).length?(st.materials||[]).map((x,i)=>'<div class="sk-erp-line" data-mat="'+i+'"><select class="erp-mat-item"><option value="">اختر الصنف</option>'+options()+'</select><input class="erp-mat-qty" type="number" min="0" step="0.01" value="'+num(x.qty)+'" placeholder="الكمية"><input class="erp-mat-cost" type="number" min="0" step="0.01" value="'+num(x.unitCost)+'" placeholder="تكلفة الوحدة"><b>'+money(num(x.qty)*num(x.unitCost))+'</b><button type="button" class="linkish erp-line-del">حذف</button></div>').join(""):'<div class="sk-empty">أضف المواد التي بعتها خلال الشهر.</div>')+
    '</div></div><div><div class="sk-erp-headrow"><h4>المصاريف الأخرى</h4><button class="btn sm" id="erp-pl-add-exp" type="button">+ مصروف</button></div><div id="erp-pl-exps">'+
      ((st.expenses||[]).length?(st.expenses||[]).map((x,i)=>'<div class="sk-erp-line exp" data-exp="'+i+'"><input class="erp-exp-name" value="'+esc(x.name||"")+'" placeholder="البند: رواتب، إيجار…"><input class="erp-exp-amt" type="number" min="0" step="0.01" value="'+num(x.amount)+'" placeholder="المبلغ"><button type="button" class="linkish erp-line-del">حذف</button></div>').join(""):'<div class="sk-empty">أضف المصروفات التشغيلية والأخرى.</div>')+
    '</div></div></div>'+
    '<div class="sk-kpis"><div class="sk-kpi"><span>المبيعات</span><b>'+money(c.revenue)+'</b></div><div class="sk-kpi"><span>تكلفة المواد</span><b>'+money(c.materialCost)+'</b></div><div class="sk-kpi"><span>مجمل الربح</span><b>'+money(c.grossProfit)+'</b><small>'+((c.grossMargin||0)*100).toFixed(1)+'٪</small></div><div class="sk-kpi '+(c.netProfit>=0?"good":"bad")+'"><span>صافي الربح / الخسارة</span><b>'+money(c.netProfit)+'</b><small>'+((c.netMargin||0)*100).toFixed(1)+'٪</small></div></div>'+
    '<label class="sk-field"><span>ملاحظات الشهر</span><input id="erp-pl-note" value="'+esc(st.note||"")+'" placeholder="اختياري"></label>'+
    (hist.length?'<details><summary>القوائم المحفوظة ('+hist.length+')</summary><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الشهر</th><th>المبيعات</th><th>تكلفة المواد</th><th>المصاريف الأخرى</th><th>الصافي</th><th></th></tr></thead><tbody>'+hist.slice(0,24).map((x,i)=>'<tr><td>'+esc(x.month)+'</td><td>'+money(x.revenue)+'</td><td>'+money(x.materialCost)+'</td><td>'+money(x.otherExpenses)+'</td><td>'+money(x.netProfit)+'</td><td><button class="linkish" data-pl-load="'+i+'">فتح</button></td></tr>').join("")+'</tbody></table></div></details>':'')+
  '</div>';
  function sync(){
    st.month=host.querySelector("#erp-pl-month").value||monthNow();st.revenue=num(host.querySelector("#erp-pl-revenue").value);st.note=host.querySelector("#erp-pl-note").value;
    const mats=[];host.querySelectorAll("[data-mat]").forEach(r=>{const sel=r.querySelector(".erp-mat-item"),it=items().find(x=>x.id===sel.value);mats.push({itemId:sel.value,name:it?.name||"",qty:num(r.querySelector(".erp-mat-qty").value),unitCost:num(r.querySelector(".erp-mat-cost").value)})});st.materials=mats;
    const ex=[];host.querySelectorAll("[data-exp]").forEach(r=>ex.push({name:r.querySelector(".erp-exp-name").value.trim(),amount:num(r.querySelector(".erp-exp-amt").value)}));st.expenses=ex;save(DRAFT,st);
  }
  host.querySelectorAll("[data-mat]").forEach((r,i)=>{const sel=r.querySelector(".erp-mat-item");sel.value=st.materials[i]?.itemId||"";sel.onchange=()=>{const it=items().find(x=>x.id===sel.value);if(it)r.querySelector(".erp-mat-cost").value=it.cost;sync();render(root)};r.querySelectorAll("input").forEach(e=>e.onchange=()=>{sync();render(root)});r.querySelector(".erp-line-del").onclick=()=>{sync();st.materials.splice(i,1);save(DRAFT,st);render(root)}});
  host.querySelectorAll("[data-exp]").forEach((r,i)=>{r.querySelectorAll("input").forEach(e=>e.onchange=()=>{sync();render(root)});r.querySelector(".erp-line-del").onclick=()=>{sync();st.expenses.splice(i,1);save(DRAFT,st);render(root)}});
  host.querySelector("#erp-pl-month").onchange=()=>{sync();render(root)};host.querySelector("#erp-pl-revenue").onchange=()=>{sync();render(root)};host.querySelector("#erp-pl-note").onchange=sync;
  host.querySelector("#erp-pl-add-mat").onclick=()=>{sync();st.materials.push({itemId:"",name:"",qty:1,unitCost:0});save(DRAFT,st);render(root)};
  host.querySelector("#erp-pl-add-exp").onclick=()=>{sync();st.expenses.push({name:"",amount:0});save(DRAFT,st);render(root)};
  host.querySelector("#erp-pl-sales").onclick=async()=>{sync();const v=await readSales(st.month);if(v==null)return toast("تعذر قراءة المبيعات على هذا الجهاز","err");st.revenue=v;save(DRAFT,st);toast("تم جلب مبيعات "+st.month,"ok");render(root)};
  host.querySelector("#erp-pl-save").onclick=()=>{sync();const row={...calc(st),savedAt:new Date().toISOString()};let h=load(KEY,[]);const i=h.findIndex(x=>x.month===row.month);if(i>=0)h[i]=row;else h.unshift(row);h.sort((a,b)=>String(b.month).localeCompare(String(a.month)));save(KEY,h.slice(0,60));toast("تم حفظ قائمة دخل "+row.month,"ok");render(root)};
  host.querySelectorAll("[data-pl-load]").forEach(b=>b.onclick=()=>{st=JSON.parse(JSON.stringify(load(KEY,[])[+b.dataset.plLoad]||blank()));save(DRAFT,st);render(root)});
}
function attach(root){
  if(root.dataset.erpFinanceHook)return;root.dataset.erpFinanceHook="1";
  let busy=false;const ensure=()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{try{render(root)}finally{busy=false}})};
  const mo=new MutationObserver(()=>{if(!root.querySelector("#sk-erp-pl"))ensure()});mo.observe(root,{childList:true});ensure();
}
core.onView("reports",attach);
core.onView("cash",root=>{
  if(root.querySelector("#sk-erp-cash-note"))return;
  root.insertAdjacentHTML("afterbegin",'<section class="card sk-erp-card" id="sk-erp-cash-note"><div class="card-h"><div><h3>المركز المالي</h3><p>التدفق النقدي هنا يقرأ المبيعات والمشتريات؛ وقائمة الدخل الشهرية التفصيلية موجودة في «التقارير» وتحفظ كل شهر للمقارنة.</p></div><button type="button" class="btn sm" id="erp-go-pl">فتح قائمة الدخل</button></div></section>');
  root.querySelector("#erp-go-pl").onclick=()=>core.go("reports");
});
window.SKosifERPFinance=Object.freeze({getStatements:()=>load(KEY,[]),calculate:calc});
})();
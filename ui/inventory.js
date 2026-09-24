/* S.kosif — المخزون: تغطية المخزون ونقطة إعادة الطلب والكمية المقترحة (حساب قطعي).
   الأصناف المحفوظة تبقى على الجهاز (نفس مفتاح التخزين السابق فلا تضيع بياناتك). */
(()=>{
"use strict";
const {$,$$,esc,num,load,save,toast}=window.SK;
const KEY="aghnam_v29_inventory";
const nf=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2}).format(Number(v)||0);
let root=null,form={item:"",stock:"",daily:"",lead:2,safety:2,cycle:7},last=null;

function analyse(f){
  const stock=num(f.stock),daily=num(f.daily),lead=num(f.lead),safety=num(f.safety),cycle=num(f.cycle);
  if(daily<=0)return {error:"أدخل متوسط بيع يومي أكبر من صفر."};
  if([stock,lead,safety,cycle].some(x=>x<0))return {error:"القيم لا يمكن أن تكون سالبة."};
  const cover=stock/daily,reorderPoint=daily*(lead+safety),targetStock=daily*(lead+safety+cycle),suggested=Math.max(0,targetStock-stock);
  const status=stock<=reorderPoint?"إعادة طلب عاجلة":cover<=lead+safety+Math.max(1,cycle*.35)?"إعادة طلب قريبة":"المخزون آمن حالياً";
  return {item:(f.item||"").trim()||"الصنف",stock,daily,lead,safety,cycle,cover,reorderPoint,targetStock,suggested,status,ts:new Date().toISOString()};
}
const cls=s=>s.includes("عاجلة")?"bad":s.includes("قريبة")?"warn":"good";
function names(){try{return [...new Set(window.SKosifCore.raws().filter(r=>r.status!=="archived").map(r=>String(r.name||"")).filter(Boolean))]}catch{return []}}
const field=(k,label,type,extra="")=>'<label class="sk-field"><span>'+label+'</span><input data-inv="'+k+'" type="'+type+'" value="'+esc(form[k])+'" '+extra+'></label>';

function html(){
  const list=load(KEY,[]),urgent=list.filter(x=>cls(x.status)==="bad").length,near=list.filter(x=>cls(x.status)==="warn").length;
  return '<div class="sk-kpis"><div class="sk-kpi"><span>أصناف متابَعة</span><b>'+list.length+'</b></div><div class="sk-kpi '+(urgent?"bad":"good")+'"><span>إعادة طلب عاجلة</span><b>'+urgent+'</b></div><div class="sk-kpi '+(near?"warn":"good")+'"><span>إعادة طلب قريبة</span><b>'+near+'</b></div><div class="sk-kpi"><span>كمية طلب مقترحة (إجمالي)</span><b>'+nf(list.reduce((s,x)=>s+(x.suggested||0),0))+'</b></div></div>'+
  '<div class="sk-grid-2">'+
  '<section class="card"><div class="card-h"><div><h3>تحليل صنف</h3><p>أيام التغطية = المخزون ÷ البيع اليومي. نقطة إعادة الطلب = البيع اليومي × (التوريد + الأمان).</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2">'+field("item","الصنف","text",'list="sk-inv-names" placeholder="مثال: نعيمي"')+field("stock","المخزون الحالي","number",'step="0.01" min="0"')+field("daily","متوسط البيع اليومي","number",'step="0.01" min="0"')+field("lead","مدة التوريد (أيام)","number",'step="1" min="0"')+field("safety","مخزون أمان (أيام)","number",'step="1" min="0"')+field("cycle","دورة الطلب (أيام)","number",'step="1" min="0"')+'</div>'+
    '<datalist id="sk-inv-names">'+names().map(n=>'<option value="'+esc(n)+'">').join("")+'</datalist>'+
    '<div class="sk-actions"><button type="button" class="btn primary" id="inv-calc">حلّل</button><button type="button" class="btn" id="inv-save">حفظ الصنف</button></div>'+
    '<div id="inv-out"></div>'+
  '</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>الأصناف المحفوظة</h3><p>اضغط على صنف لتعديله.</p></div>'+(list.length?'<div class="sk-actions"><button type="button" class="btn sm" id="inv-csv">CSV</button><button type="button" class="btn sm" id="inv-clear">مسح الكل</button></div>':'')+'</div><div class="card-b">'+
    (list.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف</th><th>الحالة</th><th>المخزون</th><th>تغطية</th><th>طلب مقترح</th><th></th></tr></thead><tbody>'+
      list.map((x,i)=>'<tr><td><button type="button" class="linkish" data-inv-load="'+i+'">'+esc(x.item)+'</button></td><td><span class="sk-pill '+cls(x.status)+'">'+esc(x.status)+'</span></td><td>'+nf(x.stock)+'</td><td>'+nf(x.cover)+' يوم</td><td><b>'+nf(x.suggested)+'</b></td><td><button type="button" class="linkish" data-inv-del="'+i+'" aria-label="حذف">حذف</button></td></tr>').join("")+
    '</tbody></table></div>':'<div class="sk-empty">لا توجد أصناف محفوظة بعد.</div>')+
  '</div></section></div>';
}
function out(r){
  const box=$("#inv-out",root);if(!box)return;
  if(!r){box.innerHTML="";return}
  if(r.error){box.innerHTML='<div class="sk-note bad">'+esc(r.error)+'</div>';return}
  box.innerHTML='<div class="sk-kpis"><div class="sk-kpi '+(r.cover<=r.lead+r.safety?"bad":"")+'"><span>أيام التغطية</span><b>'+nf(r.cover)+'</b></div><div class="sk-kpi"><span>نقطة إعادة الطلب</span><b>'+nf(r.reorderPoint)+'</b></div><div class="sk-kpi"><span>المخزون المستهدف</span><b>'+nf(r.targetStock)+'</b></div><div class="sk-kpi accent"><span>كمية الطلب المقترحة</span><b>'+nf(r.suggested)+'</b></div></div>'+
    '<div class="sk-note '+(cls(r.status)==="good"?"":cls(r.status)==="bad"?"bad":"warn")+'" style="margin-top:10px"><b>'+esc(r.status)+'</b> — مدة التوريد + الأمان: '+nf(r.lead+r.safety)+' يوم</div>'+
    '<div class="sk-actions" style="margin-top:10px"><button type="button" class="btn" id="inv-jev">اسأل Jev عن الإجراء</button><button type="button" class="btn" id="inv-po">أمر شراء من مورد</button></div>';
  $("#inv-jev",root).onclick=()=>window.SK.askJev({type:"choice",question:"ما الإجراء الأنسب لمخزون "+r.item+"؟",
    context:"المخزون "+r.stock+"، البيع اليومي "+r.daily+"، أيام التغطية "+r.cover.toFixed(1)+"، نقطة إعادة الطلب "+r.reorderPoint.toFixed(1)+"، الكمية المقترحة "+r.suggested.toFixed(1),
    options:["إعادة طلب عاجلة","إعادة طلب طبيعية","مراقبة دون طلب","عرض لتصريف المخزون"]});
  $("#inv-po",root).onclick=()=>window.SKosifCore.go("suppliers");
}
function grab(){$$("[data-inv]",root).forEach(i=>form[i.dataset.inv]=i.value)}
function paint(){
  if(!root||!root.isConnected)return;
  root.innerHTML=html();
  $$("[data-inv]",root).forEach(i=>i.oninput=()=>{form[i.dataset.inv]=i.value});
  $("#inv-calc",root).onclick=()=>{grab();last=analyse(form);out(last)};
  $("#inv-save",root).onclick=()=>{grab();const r=analyse(form);if(r.error)return out(r);
    const list=load(KEY,[]),i=list.findIndex(x=>String(x.item).trim()===r.item);if(i>=0)list[i]=r;else list.unshift(r);
    save(KEY,list.slice(0,200));last=r;paint();out(r);toast("حُفظ «"+r.item+"»","ok")};
  $$("[data-inv-load]",root).forEach(b=>b.onclick=()=>{const x=load(KEY,[])[+b.dataset.invLoad];if(!x)return;form={item:x.item,stock:x.stock,daily:x.daily,lead:x.lead,safety:x.safety,cycle:x.cycle};last=x;paint();out(x)});
  $$("[data-inv-del]",root).forEach(b=>b.onclick=()=>{const l=load(KEY,[]);l.splice(+b.dataset.invDel,1);save(KEY,l);paint()});
  const clr=$("#inv-clear",root);if(clr)clr.onclick=()=>{if(confirm("مسح كل الأصناف المحفوظة؟")){save(KEY,[]);paint()}};
  const csv=$("#inv-csv",root);if(csv)csv.onclick=()=>window.SK.csv.download("S.kosif-inventory-"+new Date().toISOString().slice(0,10),["الصنف","الحالة","المخزون","البيع اليومي","أيام التغطية","نقطة إعادة الطلب","الكمية المقترحة"],load(KEY,[]).map(x=>[x.item,x.status,x.stock,x.daily,x.cover.toFixed(1),x.reorderPoint.toFixed(1),x.suggested.toFixed(1)]));
  if(last)out(last);
}
window.SK.view("inventory",{title:"المخزون",sub:"أيام التغطية ونقطة إعادة الطلب والكمية المقترحة لكل صنف",emoji:"📦",render(node){root=node;paint()}});
})();

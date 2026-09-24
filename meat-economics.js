/* S.kosif — Meat Economics & Receivables */
(()=>{
"use strict";
if(window.SKosifMeatEconomics)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const num=v=>Number(String(v??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬,\s]/g,"").replace("٫","."))||0;
const money=v=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
let cuts=[
  {name:"فخذ",yield:28,price:0},{name:"كتف",yield:22,price:0},{name:"ريش",yield:18,price:0},
  {name:"مفروم/تشفيه",yield:20,price:0},{name:"أحشاء ومنتجات جانبية",yield:12,price:0}
];
let arText="";
function dressing(live,carcass){return live>0?carcass/live*100:0}
function allocate(carcassKg,totalCost,rows){
  const totalYield=rows.reduce((s,x)=>s+Math.max(0,x.yield),0)||1;
  return rows.map(x=>{
    const kg=carcassKg*Math.max(0,x.yield)/100;
    const cost=totalCost*Math.max(0,x.yield)/totalYield;
    const costKg=kg?cost/kg:0,margin=x.price-costKg,revenue=kg*x.price;
    return {...x,kg,cost,costKg,margin,marginPct:x.price?margin/x.price*100:0,revenue};
  });
}
function parseAR(){
  return arText.split(/\r?\n/).map((line,i)=>{
    const p=line.split(/[;\t,]/).map(x=>x.trim());if(!p[0]||i===0&&/customer|عميل/i.test(p[0]))return null;
    const date=p[1]||"",total=num(p[2]),paid=num(p[3]);return {customer:p[0],date,total,paid,outstanding:Math.max(0,total-paid)};
  }).filter(Boolean);
}
function aging(rows){
  const out={current:0,d1:0,d31:0,d61:0,d90:0,total:0},today=new Date();
  rows.forEach(r=>{if(!r.outstanding)return;const d=new Date(r.date);if(Number.isNaN(d.getTime()))return;const age=Math.max(0,Math.floor((today-d)/86400000));out.total+=r.outstanding;if(age===0)out.current+=r.outstanding;else if(age<=30)out.d1+=r.outstanding;else if(age<=60)out.d31+=r.outstanding;else if(age<=90)out.d61+=r.outstanding;else out.d90+=r.outstanding});return out;
}
function html(){
  return '<div class="sk37-head"><div><b>اقتصاديات الذبيحة والتحصيل</b><span>Carcass → Cuts → Margin → Receivables</span></div><i>متقدم</i></div>'+
  '<div class="sk37-tabs"><button data-sk37="carcass" class="active">الذبيحة والقطعيات</button><button data-sk37="ar">أعمار الذمم</button></div>'+
  '<div id="sk37-body">'+carcassHTML()+'</div>';
}
function carcassHTML(){
  return '<div class="sk-grid2">'+field("sk37-live","الوزن الحي كجم",50)+field("sk37-carcass","وزن الذبيحة كجم",30)+field("sk37-cost","إجمالي تكلفة الذبيحة",1200)+field("sk37-target","هامش مستهدف %",25)+'</div>'+
  '<div class="sk-section-title"><b>القطعيات ونسب العائد</b><span>المجموع لا يلزم أن يكون 100٪؛ التوزيع يطبع نسب العائد تلقائيًا</span></div>'+
  '<div id="sk37-cuts">'+cuts.map((x,i)=>'<div class="sk37-cut"><input data-n="'+i+'" value="'+esc(x.name)+'"><input type="number" step=".1" data-y="'+i+'" value="'+x.yield+'"><input type="number" step=".01" data-p="'+i+'" value="'+x.price+'" placeholder="سعر بيع/كجم"><button data-d="'+i+'">×</button></div>').join("")+'</div>'+
  '<div class="sk-actions"><button id="sk37-add" class="sk-secondary">+ قطعة</button><button id="sk37-run" class="sk-primary">احسب الاقتصاديات</button></div><div id="sk37-result"></div>';
}
function arHTML(){
  return '<p class="sk37-note">الصق: العميل، التاريخ، إجمالي الفاتورة، المدفوع. سيحسب الرصيد = الفاتورة − المدفوع ثم يوزعه على أعمار الذمم.</p>'+
  '<textarea id="sk37-ar" class="sk37-ta" rows="10" placeholder="عميل أ,2026-09-01,5000,2000">'+esc(arText)+'</textarea>'+
  '<button id="sk37-ar-run" class="sk-primary">حلل أعمار الذمم</button><div id="sk37-ar-result"></div>';
}
function field(id,l,v){return '<label class="sk-field"><span>'+l+'</span><input id="'+id+'" type="number" step=".01" value="'+v+'"></label>'}
function bind(){
  $$("[data-sk37]").forEach(b=>b.onclick=()=>{ $$("[data-sk37]").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#sk37-body").innerHTML=b.dataset.sk37==="ar"?arHTML():carcassHTML();bind()});
  $$("[data-n]").forEach(x=>x.oninput=()=>cuts[+x.dataset.n].name=x.value);
  $$("[data-y]").forEach(x=>x.oninput=()=>cuts[+x.dataset.y].yield=num(x.value));
  $$("[data-p]").forEach(x=>x.oninput=()=>cuts[+x.dataset.p].price=num(x.value));
  $$("[data-d]").forEach(x=>x.onclick=()=>{cuts.splice(+x.dataset.d,1);$("#sk37-body").innerHTML=carcassHTML();bind()});
  $("#sk37-add")?.addEventListener("click",()=>{cuts.push({name:"قطعة جديدة",yield:0,price:0});$("#sk37-body").innerHTML=carcassHTML();bind()});
  $("#sk37-run")?.addEventListener("click",runCarcass);
  $("#sk37-ar-run")?.addEventListener("click",()=>{arText=$("#sk37-ar").value;runAR()});
}
function runCarcass(){
  const live=num($("#sk37-live").value),car=num($("#sk37-carcass").value),cost=num($("#sk37-cost").value),target=num($("#sk37-target").value);
  if(!(live>0&&car>0&&cost>=0)){ $("#sk37-result").innerHTML='<div class="sk37-bad">راجع الوزن والتكلفة.</div>';return}
  const rows=allocate(car,cost,cuts),rev=rows.reduce((s,x)=>s+x.revenue,0),profit=rev-cost,yieldSum=cuts.reduce((s,x)=>s+x.yield,0);
  $("#sk37-result").innerHTML='<div class="sk-kpis sk37-kpis"><div class="sk-kpi"><span>نسبة التصافي</span><b>'+dressing(live,car).toFixed(1)+'٪</b></div><div class="sk-kpi"><span>مجموع Yield</span><b>'+yieldSum.toFixed(1)+'٪</b></div><div class="sk-kpi"><span>إيراد القطع المتوقع</span><b>'+money(rev)+'</b></div><div class="sk-kpi '+(profit<0?"bad":"good")+'"><span>ربح الذبيحة</span><b>'+money(profit)+'</b></div></div>'+
  '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>القطعة</th><th>Yield</th><th>وزن</th><th>تكلفة/كجم</th><th>بيع/كجم</th><th>هامش</th><th>سعر مستهدف</th></tr></thead><tbody>'+
  rows.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+x.yield.toFixed(1)+'٪</td><td>'+x.kg.toFixed(2)+'</td><td>'+money(x.costKg)+'</td><td>'+money(x.price)+'</td><td class="'+(x.margin<0?"sk37-neg":"sk37-pos")+'">'+x.marginPct.toFixed(1)+'٪</td><td>'+money(x.costKg/(1-Math.min(95,Math.max(0,target))/100))+'</td></tr>').join("")+'</tbody></table></div>';
}
function runAR(){
  const rows=parseAR(),a=aging(rows);
  $("#sk37-ar-result").innerHTML='<div class="sk-kpis sk37-kpis"><div class="sk-kpi"><span>اليوم</span><b>'+money(a.current)+'</b></div><div class="sk-kpi"><span>1–30</span><b>'+money(a.d1)+'</b></div><div class="sk-kpi"><span>31–60</span><b>'+money(a.d31)+'</b></div><div class="sk-kpi"><span>61–90</span><b>'+money(a.d61)+'</b></div><div class="sk-kpi bad"><span>أكثر من 90</span><b>'+money(a.d90)+'</b></div><div class="sk-kpi accent"><span>إجمالي الذمم</span><b>'+money(a.total)+'</b></div></div>'+
  '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>العميل</th><th>التاريخ</th><th>الفاتورة</th><th>المدفوع</th><th>المتبقي</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(r.customer)+'</td><td>'+esc(r.date)+'</td><td>'+money(r.total)+'</td><td>'+money(r.paid)+'</td><td>'+money(r.outstanding)+'</td></tr>').join("")+'</tbody></table></div>';
}
function open(){
  window.SKosif?.open?.("overview");
  setTimeout(()=>{const body=$("#sk-body");if(!body)return;body.innerHTML=html();bind();},60);
}
function attach(){
  const tabs=$(".sk-tabs");if(!tabs||$("#sk37-tab"))return !!tabs;
  const b=document.createElement("button");b.id="sk37-tab";b.type="button";b.textContent="اقتصاديات اللحوم";b.onclick=open;(tabs.querySelector('.sk33-group[data-g="التسعير والقرار"]')||tabs).appendChild(b);return true;
}
function init(){let n=0;const t=setInterval(()=>{if(attach()||++n>40)clearInterval(t)},250);window.SKosifMeatEconomics=Object.freeze({version:"37.0",open,dressing,allocate,aging})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
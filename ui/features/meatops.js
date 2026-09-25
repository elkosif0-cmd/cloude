/* S.kosif — اقتصاديات الذبيحة (متقدم) وأعمار الذمم (يومي) */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const num=v=>Number(String(v??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬,\s]/g,"").replace("٫","."))||0;
const money=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
/* cut templates: names and typical yield % only; prices, weights and cost are the user's own */
const CARCASS_PRESETS=[
  {name:"خروف نعيمي بلدي فاخر",cuts:[
    {name:"فخذ نعيمي كامل",yield:28},{name:"كتف نعيمي طازج",yield:22},{name:"ريش كستليتة",yield:18},
    {name:"مفروم/رقبة وتشفيه",yield:20},{name:"أحشاء وكبده ورأس",yield:12}
  ]},
  {name:"خروف حري حجازي",cuts:[
    {name:"فخذ حري",yield:27},{name:"كتف حري",yield:23},{name:"ريش حري",yield:19},
    {name:"مفروم وتشفية",yield:19},{name:"أحشاء ومعاليق",yield:12}
  ]},
  {name:"تيس بلدي عارضي",cuts:[
    {name:"فخذ تيس",yield:29},{name:"كتف تيس",yield:23},{name:"أضلاع وجنب",yield:18},
    {name:"تشفية ورقبة",yield:18},{name:"سقط ورأس",yield:12}
  ]},
  {name:"عجل بلدي تسمين",cuts:[
    {name:"أفخاذ وتوب سايد",yield:32},{name:"كتف وموزات",yield:24},{name:"ريب آي وتندرلوين",yield:16},
    {name:"صدر وبريسكت ومفروم",yield:18},{name:"عظم ودهن وأحشاء",yield:10}
  ]}
];

let cuts=CARCASS_PRESETS[0].cuts.map(c=>({...c,price:0}));
const AR_KEY="skosif_ar_paste";
let arText=(()=>{try{return localStorage.getItem(AR_KEY)||""}catch{return ""}})();
function dressing(live,carcass){return (window.SKServices?.meatops?.dressingPercentage(live,carcass)) ?? (live>0?carcass/live*100:0)}
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
function carcassHTML(){
  return '<div class="sk-chips" style="margin-bottom:12px;">'+
    CARCASS_PRESETS.map((p,i)=>'<button type="button" class="chip sk37-preset" data-p="'+i+'">'+esc(p.name)+'</button>').join("")+
  '</div>'+
  '<div class="sk-grid2">'+field("sk37-live","الوزن الحي كجم",48)+field("sk37-carcass","وزن الذبيحة كجم",24)+field("sk37-cost","إجمالي تكلفة الذبيحة",1450)+field("sk37-target","هامش مستهدف %",25)+'</div>'+
  '<div class="sk37-map-wrap">'+
    '<div style="font-size:0.85rem;font-weight:bold;margin-bottom:8px;color:var(--ink-2,#6b5c4e);">مخطط تفكيك قطعيات الذبيحة التفاعلي (اضغط على أي قطعية لتحديدها)</div>'+
    '<svg viewBox="0 0 450 140" class="sk37-map-svg" xmlns="http://www.w3.org/2000/svg">'+
      '<g class="sk37-cut-part" data-part="رقبة"><path d="M40 30 C 50 20, 80 20, 95 35 L 85 75 L 35 65 Z"/><text x="65" y="52" font-size="10" text-anchor="middle" font-weight="bold">الرقبة</text></g>'+
      '<g class="sk37-cut-part" data-part="كتف"><path d="M95 35 C 120 30, 150 30, 160 50 L 150 100 L 85 75 Z"/><text x="122" y="65" font-size="11" text-anchor="middle" font-weight="bold">الكتف</text></g>'+
      '<g class="sk37-cut-part" data-part="ريش"><path d="M160 35 L 260 35 L 255 80 L 155 80 Z"/><text x="207" y="58" font-size="11" text-anchor="middle" font-weight="bold">الريش والظهر</text></g>'+
      '<g class="sk37-cut-part" data-part="فخذ"><path d="M260 35 C 300 25, 360 40, 370 70 L 330 115 L 255 80 Z"/><text x="310" y="70" font-size="12" text-anchor="middle" font-weight="bold">الفخذ</text></g>'+
      '<g class="sk37-cut-part" data-part="مفروم/رقبة وتشفيه"><path d="M140 80 L 255 80 L 250 120 L 130 115 Z"/><text x="190" y="102" font-size="10" text-anchor="middle" font-weight="bold">الصدر والبطن</text></g>'+
    '</svg>'+
  '</div>'+
  '<div class="sk-section-title"><b>القطعيات ونسب العائد (Carcass Yield)</b><span>المجموع لا يلزم أن يكون 100٪؛ التوزيع يطبع نسب العائد تلقائيًا</span></div>'+
  '<div id="sk37-cuts">'+cuts.map((x,i)=>'<div class="sk37-cut"><input data-n="'+i+'" value="'+esc(x.name)+'"><input type="number" step=".1" data-y="'+i+'" value="'+x.yield+'"><input type="number" step=".01" data-p="'+i+'" value="'+x.price+'" placeholder="سعر بيع/كجم"><button data-d="'+i+'">×</button></div>').join("")+'</div>'+
  '<div class="sk-actions"><button id="sk37-add" class="sk-secondary">+ قطعة</button><button id="sk37-run" class="sk-primary">احسب الاقتصاديات</button><button id="sk37-print" class="sk-secondary">أمر تشغيل التشفية</button></div><div id="sk37-result"></div>';
}
function arHTML(){
  return '<p class="sk37-note">الصق: العميل، التاريخ، إجمالي الفاتورة، المدفوع. سيحسب الرصيد = الفاتورة − المدفوع ثم يوزعه على أعمار الذمم.</p>'+
  '<textarea id="sk37-ar" class="sk37-ta" rows="10" placeholder="عميل أ,2026-09-01,5000,2000">'+esc(arText)+'</textarea>'+
  '<button id="sk37-ar-run" class="sk-primary">حلل أعمار الذمم</button><div id="sk37-ar-result"></div>';
}
function field(id,l,v){return '<label class="sk-field"><span>'+l+'</span><input id="'+id+'" type="number" step=".01" value="'+v+'"></label>'}
function bind(){
  $$(".sk37-preset").forEach(b=>{
    b.onclick=()=>{
      const p=CARCASS_PRESETS[+b.dataset.p];
      if(!p)return;
      /* keep the user's weights, cost and prices; take only the cut list and yields */
      const old=Object.fromEntries(cuts.map(c=>[c.name,c.price||0]));
      cuts=p.cuts.map(c=>({...c,price:old[c.name]||0}));
      paintCarcass();
      runCarcass();
    };
  });
  $$(".sk37-cut-part").forEach(g=>{
    g.onclick=()=>{
      const part=g.dataset.part;
      $$(".sk37-cut-part").forEach(x=>x.classList.toggle("active",x===g));
      const idx=cuts.findIndex(c=>c.name.includes(part));
      if(idx>=0){
        const inp=$$("[data-n]")[idx];
        if(inp){ inp.focus(); inp.style.outline="2px solid var(--brand,#8a5a2b)"; setTimeout(()=>inp.style.outline="",1200); }
      }
    };
  });
  $$("[data-n]").forEach(x=>x.oninput=()=>cuts[+x.dataset.n].name=x.value);
  $$("[data-y]").forEach(x=>x.oninput=()=>cuts[+x.dataset.y].yield=num(x.value));
  $$("[data-p]").forEach(x=>x.oninput=()=>cuts[+x.dataset.p].price=num(x.value));
  $$("[data-d]").forEach(x=>x.onclick=()=>{cuts.splice(+x.dataset.d,1);paintCarcass()});
  $("#sk37-add")?.addEventListener("click",()=>{cuts.push({name:"قطعة جديدة",yield:0,price:0});paintCarcass()});
  $("#sk37-run")?.addEventListener("click",runCarcass);
  $("#sk37-print")?.addEventListener("click",()=>{
    const live=num($("#sk37-live")?.value)||48,car=num($("#sk37-carcass")?.value)||24,cost=num($("#sk37-cost")?.value)||1450;
    const rows=allocate(car,cost,cuts);
    const w=window.open("","_blank","width=600,height=750");
    if(!w)return alert("يرجى السماح بالنوافذ المنبثقة لطباعة أمر التشفية");
    w.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>أمر تشغيل وتشفية الذبيحة</title>'+
      '<style>body{font-family:system-ui,sans-serif;padding:24px;line-height:1.5;color:#111;}'+
      'h2{margin:0 0 6px;color:#8a5a2b;}table{width:100%;border-collapse:collapse;margin:16px 0;}'+
      'th,td{border:1px solid #ccc;padding:8px 10px;text-align:right;}th{background:#f8fafc;}'+
      '.box{background:#fbf5ea;border:1px solid #e2d8cc;padding:12px;border-radius:8px;margin:12px 0;}'+
      '</style></head><body>'+
      '<h2>أمر تشغيل وتشفية ذبيحة — قسم الجزارة</h2>'+
      '<div class="box"><b>الوزن الحي:</b> '+live+' كجم | <b>وزن الذبيحة المعلقة:</b> '+car+' كجم | <b>نسبة التصافي:</b> '+dressing(live,car).toFixed(1)+'% | <b>التاريخ:</b> '+new Date().toLocaleDateString("ar-SA")+'</div>'+
      '<table><thead><tr><th>القطعية</th><th>نسبة العائد %</th><th>الوزن المقدر</th><th>تكلفة الكيلو</th><th>سعر البيع المقترح</th></tr></thead><tbody>'+
      rows.map(r=>'<tr><td><b>'+esc(r.name)+'</b></td><td>'+r.yield.toFixed(1)+'%</td><td>'+r.kg.toFixed(2)+' كجم</td><td>'+money(r.costKg)+'</td><td>'+money(r.price)+'</td></tr>').join("")+
      '</tbody></table>'+
      '<div style="font-size:12px;color:#666;margin-top:20px;">تعليمات التشفية: الالتزام بخطوط العضلات الطبيعية، فصل العظم بدقة دون هدر، وتبريد القطعيات فوراً عند 2° مئوية.</div>'+
      '<script>window.onload=()=>{window.print();}<\/script></body></html>');
    w.document.close();SK.brandPrint(w);
  });
  $("#sk37-ar-run")?.addEventListener("click",()=>{arText=$("#sk37-ar").value;try{localStorage.setItem(AR_KEY,arText)}catch{}runAR()});
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
const roots={};
function butcheryHubNav(activeId){
  const tabs=[
    {id:"carcass",icon:"",title:"تفكيك وتصافي الذبيحة وعائد القطعيات"},
    {id:"blending",icon:"",title:"خلط وفرم اللحوم ونسب الدهن (Lean/Fat)"}
  ];
  return '<div class="sk-hub-nav">'+tabs.map(t=>'<button type="button" class="sk-hub-btn '+(t.id===activeId?'active':'')+'" data-butchery-go="'+t.id+'"><span>'+t.icon+'</span><span>'+t.title+'</span></button>').join("")+'</div>';
}
function paintCarcass(){
  const r=roots.carcass;if(!r||!r.isConnected)return;
  r.innerHTML=butcheryHubNav("carcass")+'<section class="card"><div class="card-b sk-stack">'+carcassHTML()+'</div></section>';
  bind();
  $$("[data-butchery-go]",r).forEach(b=>b.onclick=()=>window.SKosifCore?.go(b.dataset.butcheryGo));
}
function paintAR(){const r=roots.ar;if(!r||!r.isConnected)return;r.innerHTML=arHTML();bind();if(arText.trim())runAR()}
window.SK.view("receivables",{title:"الذمم والتحصيل",sub:"أعمار الذمم: الرصيد المتبقي لكل عميل موزعاً على فترات التأخير",emoji:"⏳",
  render(node){roots.ar=node;paintAR()}});
window.SK.view("carcass",{title:"اقتصاديات الذبيحة",sub:"من الوزن الحي إلى القطعيات: التصافي وتوزيع التكلفة والهامش لكل قطعة",emoji:"",adv:true,
  render(node){roots.carcass=node;paintCarcass()}});
window.SKosifMeatOps=Object.freeze({dressing,allocate,aging});
})();
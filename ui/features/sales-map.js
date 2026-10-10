/* SQC — خريطة العملاء وتحليل المبيعات (شاشة «salesmap» في الأدوات المساعدة للمحاسب).
   • الخريطة: المملكة بمناطقها الثلاث عشرة، ملوّنة بقيمة الطلبات. اضغط منطقة لتقترب منها فتظهر مدنها، واضغط مدينة
     (جدة مثلاً) فتظهر أحياؤها حولها بألوان كثافة الطلبات، وبجوار الخريطة أرقام كل مستوى (الطلبات، القيمة، العملاء).
   • تحليل المبيعات: الإجمالي، الأصناف الأكثر طلباً (قيمة وكمية)، الشهور، أكبر العملاء، القنوات، تصنيف ABC.
   • تقرير صنف: أي صنف — مبيعاته عبر الشهور، عملاؤه، مدنه، متوسط سعره، وتكلفته وهامشه من «شجرة المنتجات» — للطباعة.
   • رفع المبيعات: ملف Excel أو CSV (التاريخ، الصنف، الكمية، المبلغ، العميل، المدينة، الحي، القناة) يُضاف إلى التحليل.
   المصادر: الطلبات في قاعدة aghnam-app-v7 (كما هي، للقراءة فقط) + الملف المرفوع (sqc_salesup_v1، لكل شركة).
   المحركات: SKEngines.sales.salesGeo · SKEngines.catalog.productTree · SKCharts. */
(()=>{
"use strict";
const {esc,toast,load,save}=SK;
const GE=()=>SKEngines.sales.salesGeo,UP="sqc_salesup_v1";
const TABS=[["map","الخريطة"],["analysis","تحليل المبيعات"],["item","تقرير صنف"],["upload","رفع مبيعات"]];
let root=null,tab="map",level={k:"country",region:"",city:""},item="",data=null,vb=null,anim=0,pending=null;
const nf=new Intl.NumberFormat("en",{maximumFractionDigits:0}),n0=v=>nf.format(Math.round(v||0)),n2=v=>new Intl.NumberFormat("en",{maximumFractionDigits:2}).format(v||0);
const W=1000,H=820;

/* ---------- data: the orders of the app, plus the uploaded sales ---------- */
async function idb(){
  const [orders,items]=await Promise.all([
    SK.legacyCompanyData.read("orders"),SK.legacyCompanyData.read("order_items")
  ]);
  const orderIds=new Set(orders.map(o=>o.id));
  return {orders,items:items.filter(i=>orderIds.has(i.orderId))};
}
async function loadData(){
  const {orders,items}=await idb(),up=(load(UP,{})||{}).rows||[];
  const byId=new Map(orders.map(o=>[o.id,o]));
  const ord=orders.map(o=>({id:o.id,date:String(o.date||"").slice(0,10),city:o.city||"",district:o.district||"",customer:o.customerName||o.phone||"",amount:+o.orderTotal||+o.subtotal||0,channel:o.source||""}));
  const lines=items.map(i=>{const o=byId.get(i.orderId)||{};return{date:String(o.date||"").slice(0,10),product:i.productName||i.descriptionOriginal||"",qty:+i.qty||0,amount:+i.amount||0,customer:o.customerName||"",city:o.city||"",district:o.district||"",channel:o.source||""}});
  up.forEach((r,i)=>{ord.push({id:"up-"+i,date:r.date,city:r.city,district:r.district,customer:r.customer,amount:+r.amount||0,channel:r.channel||"ملف مرفوع"});
    lines.push({date:r.date,product:r.product,qty:+r.qty||0,amount:+r.amount||0,customer:r.customer,city:r.city,district:r.district,channel:r.channel||"ملف مرفوع"})});
  data={orders:ord,lines,uploaded:up.length,agg:GE().aggregate(ord)};
  return data;
}

/* ---------- the map ---------- */
const P=(lat,lon)=>GE().project(lat,lon,{w:W,h:H});
const HEAT=["var(--sk-line)","#cfe3fb","#9cc5f5","#5f9fea","#2f77d6","#0b4fb0"];
function viewFor(){
  const G=GE();
  if(level.k==="country")return[0,0,W,H];
  const pts=level.k==="region"?G.CITIES.filter(c=>c.region===level.region).map(c=>P(c.lat,c.lon)):[P(G.cityOf(level.city).lat,G.cityOf(level.city).lon)];
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),pad=level.k==="city"?70:90;
  let x0=Math.min(...xs)-pad,y0=Math.min(...ys)-pad,w=Math.max(...xs)-Math.min(...xs)+pad*2,h=Math.max(...ys)-Math.min(...ys)+pad*2;
  const r=W/H;if(w/h>r){const nh=w/r;y0-=(nh-h)/2;h=nh}else{const nw=h*r;x0-=(nw-w)/2;w=nw}
  return[x0,y0,w,h];
}
function mapSVG(){
  const G=GE(),a=data.agg,outline=G.OUTLINE.map(([lon,lat])=>{const p=P(lat,lon);return p.x+","+p.y}).join(" ");
  const maxR=Math.max(1,...a.regions.map(r=>r.amount)),maxC=Math.max(1,...a.cities.map(c=>c.amount));
  const rad=(v,m,k)=>Math.max(6,Math.sqrt(v/m)*k);
  let marks="";
  if(level.k==="country"){
    marks=G.REGIONS.map(r=>{const c=a.regions.find(x=>x.key===r.key),v=c?c.amount:0,p=P(r.lat,r.lon),h=G.heat(v,maxR);
      return '<g class="sm-m'+(v?'':' zero')+'" data-sm-region="'+r.key+'" tabindex="0" role="button" aria-label="'+esc(r.ar+": "+n0(v))+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+rad(v||maxR*0.02,maxR,58)+'" fill="'+HEAT[h]+'"/><text x="'+p.x+'" y="'+(p.y+4)+'">'+esc(r.ar.replace(/^منطقة |^المنطقة /,""))+'</text></g>'}).join("");
  }else if(level.k==="region"){
    marks=G.CITIES.filter(c=>c.region===level.region).map(c=>{const x=a.cities.find(y=>y.ar===c.ar),v=x?x.amount:0,p=P(c.lat,c.lon),h=G.heat(v,maxC);
      return '<g class="sm-m'+(v?'':' zero')+'" data-sm-city="'+esc(c.ar)+'" tabindex="0" role="button" aria-label="'+esc(c.ar+": "+n0(v))+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+rad(v||maxC*0.02,maxC,26)+'" fill="'+HEAT[h]+'"/><text x="'+p.x+'" y="'+(p.y-rad(v||maxC*0.02,maxC,26)-4)+'">'+esc(c.ar)+'</text></g>'}).join("");
  }else{
    const c=G.cityOf(level.city),p=P(c.lat,c.lon),ds=a.districts.filter(d=>d.city===c.ar),spots=G.districtSpots(ds.length,Math.min(58,20+ds.length*3)),maxD=Math.max(1,...ds.map(d=>d.amount));
    marks='<circle class="sm-city" cx="'+p.x+'" cy="'+p.y+'" r="5"/>'+ds.map((d,i)=>{const h=G.heat(d.amount,maxD),x=p.x+spots[i].dx,y=p.y+spots[i].dy;
      return '<g class="sm-m sm-d" tabindex="0" aria-label="'+esc(d.ar+": "+n0(d.amount))+'"><circle cx="'+x+'" cy="'+y+'" r="'+Math.max(3.5,Math.sqrt(d.amount/maxD)*9)+'" fill="'+HEAT[h]+'"/><text x="'+x+'" y="'+(y-Math.max(3.5,Math.sqrt(d.amount/maxD)*9)-2)+'">'+esc(d.ar)+'</text></g>'}).join("");
  }
  const v=vb||viewFor();
  return '<svg class="sm-svg lvl-'+level.k+'" viewBox="'+v.join(" ")+'" role="img" aria-label="خريطة المبيعات"><polygon class="sm-land" points="'+outline+'"/>'+marks+'</svg>';
}
function crumbs(){
  const G=GE(),r=level.region&&G.REGIONS.find(x=>x.key===level.region);
  return '<nav class="sm-crumbs"><button type="button" data-sm-lvl="country"'+(level.k==="country"?' aria-current="page"':'')+'>المملكة</button>'+(r?'<span>›</span><button type="button" data-sm-lvl="region"'+(level.k==="region"?' aria-current="page"':'')+'>'+esc(r.ar)+'</button>':'')+(level.city?'<span>›</span><button type="button" aria-current="page">'+esc(level.city)+'</button>':'')+'</nav>';
}
function side(){
  const a=data.agg,G=GE();
  const cells=level.k==="country"?a.regions:level.k==="region"?a.cities.filter(c=>(G.cityOf(c.ar)||{}).region===level.region):a.districts.filter(d=>d.city===level.city);
  const mx=Math.max(1,...cells.map(c=>c.amount)),title=level.k==="country"?"المناطق":level.k==="region"?"المدن":"الأحياء";
  return '<aside class="sm-side"><h4>'+title+' <small>بالقيمة</small></h4>'+(cells.length?'<ol>'+cells.slice(0,14).map(c=>'<li'+(level.k!=="city"?' data-sm-'+(level.k==="country"?"region":"city")+'="'+esc(level.k==="country"?c.key:c.ar)+'" tabindex="0"':'')+'><span>'+esc(c.ar)+'</span><b>'+n0(c.amount)+'</b><i style="width:'+Math.round(c.amount/mx*100)+'%"></i><small>'+c.orders+' طلب · '+c.customers+' عميل · '+c.share+'%</small></li>').join("")+'</ol>':'<p class="hint">لا طلبات هنا.</p>')+
    (level.k==="country"&&a.unknown.length?'<p class="hint">مدن غير معروفة في الطلبات: '+esc(a.unknown.slice(0,4).map(u=>u.ar+" ("+u.orders+")").join("، "))+'</p>':'')+'</aside>';
}
function mapTab(){
  const a=data.agg;
  return '<section class="card"><div class="card-h"><div><h3>خريطة العملاء والطلبات</h3><p>المنطقة ← المدينة ← الحي. الألوان بقيمة الطلبات (الأغمق أكثر). مواضع الأحياء حول مدينتها تقريبية، وأرقامها في القائمة دقيقة.</p></div>'+crumbs()+'</div>'+
    '<div class="card-b sm-wrap"><div class="sm-map">'+mapSVG()+'<div class="sm-legend"><span>أقل</span>'+HEAT.slice(1).map(c=>'<i style="background:'+c+'"></i>').join("")+'<span>أكثر</span></div></div>'+side()+'</div>'+
    '<div class="card-b sk-kpis sm-k"><div class="sk-kpi"><span>الطلبات</span><b>'+n0(a.orders)+'</b></div><div class="sk-kpi"><span>القيمة</span><b>'+n0(a.total)+'</b></div><div class="sk-kpi"><span>المناطق</span><b>'+a.regions.length+'</b></div><div class="sk-kpi"><span>المدن</span><b>'+a.cities.length+'</b></div><div class="sk-kpi"><span>الأحياء</span><b>'+a.districts.length+'</b></div></div></section>';
}
function animateTo(target){
  const from=vb||[0,0,W,H],t0=performance.now(),dur=520;cancelAnimationFrame(anim);
  const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);vb=from.map((v,i)=>v+(target[i]-v)*e);const svg=root&&root.querySelector(".sm-svg");if(svg)svg.setAttribute("viewBox",vb.join(" "));if(k<1)anim=requestAnimationFrame(step);else{vb=target;paint()}};
  anim=requestAnimationFrame(step);
}
function go(lv){const before=vb||viewFor();level=lv;vb=before;paint();animateTo(viewFor())}

/* ---------- sales analysis ---------- */
function groupBy(lines,key){const m=new Map();for(const l of lines){const k=key(l)||"—",a=m.get(k)||{k,amount:0,qty:0,n:0,cust:new Set()};a.amount+=l.amount;a.qty+=l.qty;a.n++;if(l.customer)a.cust.add(l.customer);m.set(k,a)}return[...m.values()].sort((a,b)=>b.amount-a.amount)}
function analysisTab(){
  const L=data.lines,C=window.SKCharts;if(!L.length)return emptyCard();
  const total=L.reduce((s,l)=>s+l.amount,0),items=groupBy(L,l=>l.product),months=groupBy(L,l=>l.date.slice(0,7)).sort((a,b)=>a.k.localeCompare(b.k)).filter(m=>m.k!=="—"),custs=groupBy(L,l=>l.customer),chans=groupBy(L,l=>l.channel);
  let run=0;const abc=items.map(i=>{run+=i.amount;const c=run/total;return{...i,cls:c<=0.8?"A":c<=0.95?"B":"C"}});
  const k=(l,v,s)=>'<div class="sk-kpi"><span>'+l+'</span><b>'+v+'</b>'+(s?'<small>'+s+'</small>':'')+'</div>';
  const ords=new Set(data.orders.map(o=>o.id)).size;
  return '<section class="card"><div class="card-b sk-kpis">'+k("المبيعات",n0(total))+k("الطلبات",n0(ords),data.uploaded?data.uploaded+" سطراً من ملف مرفوع":"")+k("العملاء",n0(custs.length))+k("متوسط الطلب",n0(ords?data.orders.reduce((s,o)=>s+o.amount,0)/ords:0))+k("الأصناف",items.length)+'</div></section>'+
  '<div class="sm-grid"><section class="card"><div class="card-h"><div><h3>الأصناف الأكثر طلباً</h3><p>بالقيمة، ومعها الكمية وعدد العملاء. اضغط صنفاً لتقريره.</p></div></div><div class="card-b">'+(C?C.hbars({title:"الأصناف",rows:items.slice(0,10).map(i=>({label:i.k,value:Math.round(i.amount),sub:n2(i.qty)+" وحدة · "+i.cust.size+" عميل"}))}):"")+
    '<div class="sm-chips">'+items.slice(0,12).map(i=>'<button type="button" class="pt-chip" data-sm-item="'+esc(i.k)+'">'+esc(i.k)+'</button>').join("")+'</div></div></section>'+
  '<section class="card"><div class="card-h"><div><h3>المبيعات عبر الشهور</h3></div></div><div class="card-b">'+(C&&months.length?C.bars({title:"المبيعات الشهرية",labels:months.map(m=>m.k),series:[{name:"المبيعات",values:months.map(m=>Math.round(m.amount))}]}):'<p class="hint">لا تواريخ.</p>')+'</div></section></div>'+
  '<div class="sm-grid"><section class="card"><div class="card-h"><div><h3>أكبر العملاء</h3></div></div><div class="card-b">'+(C?C.hbars({title:"العملاء",rows:custs.slice(0,10).map(c=>({label:c.k,value:Math.round(c.amount),sub:c.n+" سطر"}))}):"")+'</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>القنوات</h3></div></div><div class="card-b">'+(C?C.hbars({title:"القنوات",rows:chans.slice(0,8).map(c=>({label:c.k,value:Math.round(c.amount),sub:Math.round(c.amount/total*100)+"%"}))}):"")+'</div></section></div>'+
  '<section class="card"><div class="card-h"><div><h3>تصنيف ABC للأصناف</h3><p>A: الأصناف التي تصنع 80% من المبيعات · B: الـ15% التالية · C: الباقي — لتركيز التسعير والمخزون والتسويق.</p></div></div><div class="card-b sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف</th><th>الفئة</th><th>المبيعات</th><th>الحصة</th><th>الكمية</th><th>العملاء</th></tr></thead><tbody>'+
    abc.slice(0,30).map(i=>'<tr><td><button type="button" class="linklike" data-sm-item="'+esc(i.k)+'">'+esc(i.k)+'</button></td><td><span class="sksev '+(i.cls==="A"?"ok":i.cls==="B"?"warn":"info")+'">'+i.cls+'</span></td><td class="num">'+n0(i.amount)+'</td><td class="num">'+n2(i.amount/total*100)+'%</td><td class="num">'+n2(i.qty)+'</td><td class="num">'+i.cust.size+'</td></tr>').join("")+'</tbody></table></div></section>';
}
function emptyCard(){return '<section class="card"><div class="card-b sk-empty"><p>لا مبيعات لهذه الشركة بعد.</p><div class="sk-actions"><button type="button" class="btn primary" data-sm-tab="upload">رفع ملف مبيعات</button></div></div></section>'}

/* ---------- item report ---------- */
function itemData(name){
  const L=data.lines.filter(l=>l.product===name),amount=L.reduce((s,l)=>s+l.amount,0),qty=L.reduce((s,l)=>s+l.qty,0);
  const months=groupBy(L,l=>l.date.slice(0,7)).sort((a,b)=>a.k.localeCompare(b.k)).filter(m=>m.k!=="—"),custs=groupBy(L,l=>l.customer),cities=groupBy(L,l=>l.city);
  let cost=null;try{const PT=SKEngines.catalog.productTree,t=(load("sqc_ptree_v1",null)||PT.emptyTree()),p=t.products.find(x=>x.name===name),m=t.materials.find(x=>x.name===name);
    cost=p?PT.productCost(t,p.id).total:m?PT.materialUnitCost(m):null}catch{}
  const avg=qty?amount/qty:null;
  return{name,L,amount,qty,months,custs,cities,avg,cost,margin:cost!=null&&avg?Math.round((avg-cost)/avg*1000)/10:null};
}
function itemTab(){
  const names=groupBy(data.lines,l=>l.product).map(i=>i.k);if(!names.length)return emptyCard();
  if(!item||!names.includes(item))item=names[0];
  const x=itemData(item),C=window.SKCharts,k=(l,v,s)=>'<div class="sk-kpi"><span>'+l+'</span><b>'+v+'</b>'+(s?'<small>'+s+'</small>':'')+'</div>';
  return '<section class="card"><div class="card-h"><div><h3>تقرير صنف</h3><p>كل ما يخص صنفاً واحداً: مبيعاته وعملاؤه ومدنه ومتوسط سعره، وتكلفته وهامشه من «شجرة المنتجات».</p></div><div class="sk-actions"><select data-sm-item-sel>'+names.map(n=>'<option'+(n===item?' selected':'')+'>'+esc(n)+'</option>').join("")+'</select><button type="button" class="btn primary" data-sm="print-item">'+SK.icon("print")+' طباعة التقرير</button></div></div>'+
    '<div class="card-b sk-kpis">'+k("المبيعات",n0(x.amount))+k("الكمية",n2(x.qty))+k("الأسطر",x.L.length)+k("العملاء",x.custs.length)+k("متوسط السعر",x.avg?n2(x.avg):"—")+k("التكلفة",x.cost!=null?n2(x.cost):"—",x.cost==null?"أضفه في شجرة المنتجات":"")+k("الهامش",x.margin!=null?n2(x.margin)+"%":"—")+'</div></section>'+
  '<div class="sm-grid"><section class="card"><div class="card-h"><div><h3>عبر الشهور</h3></div></div><div class="card-b">'+(C&&x.months.length?C.bars({title:"مبيعات "+x.name,labels:x.months.map(m=>m.k),series:[{name:"القيمة",values:x.months.map(m=>Math.round(m.amount))}]}):'<p class="hint">لا تواريخ.</p>')+'</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>أكبر عملائه</h3></div></div><div class="card-b">'+(C?C.hbars({title:"العملاء",rows:x.custs.slice(0,8).map(c=>({label:c.k,value:Math.round(c.amount),sub:n2(c.qty)+" وحدة"}))}):"")+'</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>مدنه</h3></div></div><div class="card-b">'+(C?C.hbars({title:"المدن",rows:x.cities.slice(0,8).map(c=>({label:c.k,value:Math.round(c.amount)}))}):"")+'</div></section></div>';
}
function printItem(){
  const x=itemData(item),w=window.open("");if(!w)return toast("تعذر فتح المعاينة","bad");
  const tbl=(h,rows)=>'<table><thead><tr>'+h.map(c=>'<th>'+c+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join("")+'</tr>').join("")+'</tbody></table>';
  w.document.write('<html dir="rtl"><meta charset="utf-8"><title>تقرير صنف — '+esc(x.name)+'</title><body><h1>تقرير صنف: '+esc(x.name)+'</h1>'+
    tbl(["المبيعات","الكمية","العملاء","متوسط السعر","التكلفة","الهامش"],[[n0(x.amount),n2(x.qty),x.custs.length,x.avg?n2(x.avg):"—",x.cost!=null?n2(x.cost):"—",x.margin!=null?n2(x.margin)+"%":"—"]])+
    '<h2>المبيعات الشهرية</h2>'+tbl(["الشهر","القيمة","الكمية"],x.months.map(m=>[m.k,n0(m.amount),n2(m.qty)]))+'<h2>العملاء</h2>'+tbl(["العميل","القيمة","الكمية"],x.custs.slice(0,20).map(c=>[esc(c.k),n0(c.amount),n2(c.qty)]))+
    '<h2>المدن</h2>'+tbl(["المدينة","القيمة"],x.cities.slice(0,20).map(c=>[esc(c.k),n0(c.amount)]))+'</body></html>');
  w.document.close();SK.brandPrint(w,"تقرير صنف — "+x.name);
}

/* ---------- upload ---------- */
const FIELDS=[["date","التاريخ",/تاريخ|date/],["product","الصنف",/صنف|منتج|وصف|بيان|product|item|description/],["qty","الكمية",/كمي|qty|quantity|عدد/],["amount","المبلغ",/مبلغ|قيمه|قيمة|اجمالي|إجمالي|amount|total|value|sales/],["customer","العميل",/عميل|زبون|customer|client/],["city","المدينة",/مدين|city/],["district","الحي",/حي|district|area|منطقه سكنيه/],["channel","القناة",/قناه|قناة|مصدر|channel|source/]];
function uploadTab(){
  const up=load(UP,{})||{};
  return '<section class="card"><div class="card-h"><div><h3>رفع ملف مبيعات</h3><p>Excel أو CSV بأعمدة مثل: التاريخ، الصنف، الكمية، المبلغ، العميل، المدينة، الحي، القناة — يتعرف SQC على الأعمدة وتعدّلها قبل الحفظ. يُضاف إلى التحليل والخريطة دون تغيير طلبات التطبيق.</p></div></div><div class="card-b sk-stack">'+
    '<label class="btn primary" style="cursor:pointer;justify-self:start">'+SK.icon("excelrecon")+' اختيار ملف<input type="file" data-sm-file accept=".xlsx,.csv,.tsv,.txt" hidden></label>'+
    (pending?'<div class="sm-map-cols">'+FIELDS.map(([f,l])=>'<label class="sk-field"><span>'+l+'</span><select data-sm-col="'+f+'"><option value="-1">—</option>'+pending.head.map((h,i)=>'<option value="'+i+'"'+(pending.map[f]===i?' selected':'')+'>'+esc(h||("عمود "+(i+1)))+'</option>').join("")+'</select></label>').join("")+'</div>'+
      '<div class="sk-table-wrap"><table class="sk-table" data-sk-plain><thead><tr>'+pending.head.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+pending.rows.slice(0,5).map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>'+
      '<div class="sk-actions"><button type="button" class="btn primary" data-sm="save-up">حفظ '+pending.rows.length+' سطراً</button><button type="button" class="btn" data-sm="cancel-up">إلغاء</button></div>':'')+
    (up.rows&&up.rows.length?'<p class="hint">المرفوع حالياً: '+up.rows.length+' سطراً من «'+esc(up.name||"ملف")+'» ('+esc((up.at||"").slice(0,10))+').</p><button type="button" class="btn sm danger" data-sm="clear-up" style="justify-self:start">مسح الملف المرفوع</button>':'')+'</div></section>';
}
async function readFile(f){
  let rows=[];
  if(/\.xlsx$/i.test(f.name)&&window.SKXlsx)rows=await SKXlsx.rows(f);
  else{const text=await f.text(),TI=SKEngines.reports.tbImport,d=TI.detectDelimiter(text);rows=text.split(/\r?\n/).filter(x=>x.trim()).map(l=>TI.splitLine(l,d))}
  rows=rows.filter(r=>r&&r.some(c=>String(c??"").trim()));if(rows.length<2)return toast("الملف فارغ أو بلا صفوف","warn");
  const head=rows[0].map(c=>String(c??"").trim()),map={};
  FIELDS.forEach(([f,,re])=>{const i=head.findIndex(h=>re.test(h.toLowerCase()));if(i>=0&&!Object.values(map).includes(i))map[f]=i});
  pending={name:f.name,head,rows:rows.slice(1).map(r=>r.map(c=>String(c??"").trim())),map};paint();
}
function saveUpload(){
  if(!pending)return;const m=pending.map,num=v=>Number(String(v||"").replace(/[^\d.\-]/g,""))||0;
  if(m.product==null||m.amount==null)return toast("حدّد عمودي الصنف والمبلغ على الأقل","warn");
  const iso=v=>{const s=String(v||"").trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const x=/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.exec(s);if(x)return x[3]+"-"+x[2].padStart(2,"0")+"-"+x[1].padStart(2,"0");const n=Number(s);if(n>30000&&n<80000){const d=new Date(Date.UTC(1899,11,30)+n*864e5);return d.toISOString().slice(0,10)}return s};
  const g=(r,f)=>m[f]==null||m[f]<0?"":r[m[f]];
  const rows=pending.rows.map(r=>({date:iso(g(r,"date")),product:g(r,"product"),qty:num(g(r,"qty"))||1,amount:num(g(r,"amount")),customer:g(r,"customer"),city:g(r,"city"),district:g(r,"district"),channel:g(r,"channel")})).filter(r=>r.product&&r.amount);
  save(UP,{name:pending.name,at:new Date().toISOString(),rows});SK.audit&&SK.audit.log("salesmap",{act:"upload",rows:rows.length});
  toast("حُفظ "+rows.length+" سطراً — أضيفت إلى التحليل والخريطة","ok");pending=null;tab="analysis";refresh();
}

/* ---------- paint & events ---------- */
function paint(){
  if(!root)return;if(!data){root.innerHTML='<div class="sk-empty">يقرأ الطلبات…</div>';return}
  root.innerHTML='<div class="sm-shell"><div class="sk-seg" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-sm-tab="'+k+'" aria-selected="'+(tab===k)+'">'+l+'</button>').join("")+'</div>'+
    (tab==="analysis"?analysisTab():tab==="item"?itemTab():tab==="upload"?uploadTab():mapTab())+'</div>';
}
async function refresh(){await loadData();vb=null;paint()}
function render(el){
  root=el;data=null;paint();refresh();
  if(el.dataset.smBound==="1")return;
  el.dataset.smBound="1";
  el.addEventListener("click",e=>{
    const t=e.target.closest("[data-sm-tab]");if(t){tab=t.dataset.smTab;paint();return}
    const r=e.target.closest("[data-sm-region]");if(r&&tab==="map"){go({k:"region",region:r.dataset.smRegion,city:""});return}
    const c=e.target.closest("[data-sm-city]");if(c&&tab==="map"&&GE().cityOf(c.dataset.smCity)){go({k:"city",region:GE().cityOf(c.dataset.smCity).region,city:GE().cityOf(c.dataset.smCity).ar});return}
    const l=e.target.closest("[data-sm-lvl]");if(l){go(l.dataset.smLvl==="country"?{k:"country",region:"",city:""}:{k:"region",region:level.region,city:""});return}
    const it=e.target.closest("[data-sm-item]");if(it){item=it.dataset.smItem;tab="item";paint();return}
    const a=e.target.closest("[data-sm]");if(a){const k=a.dataset.sm;if(k==="print-item")printItem();else if(k==="save-up")saveUpload();else if(k==="cancel-up"){pending=null;paint()}else if(k==="clear-up"){save(UP,{});refresh()}}
  });
  el.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const g=e.target.closest("[data-sm-region],[data-sm-city]");if(g)g.dispatchEvent(new MouseEvent("click",{bubbles:true}))});
  el.addEventListener("change",async e=>{
    if(e.target.matches("[data-sm-file]")&&e.target.files[0]){await readFile(e.target.files[0]);return}
    if(e.target.matches("[data-sm-col]")&&pending){pending.map[e.target.dataset.smCol]=Number(e.target.value);return}
    if(e.target.matches("[data-sm-item-sel]")){item=e.target.value;paint()}
  });
}
SK.view("salesmap",{render});
window.SKosifSalesMap=Object.freeze({refresh,data:()=>data});
})();

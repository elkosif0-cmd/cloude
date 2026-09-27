/* SQC — the customer map (خريطة العملاء الجغرافية).
   Saudi Arabia by region, coloured by orders (or sales, or customers); a click zooms into a region and its
   cities, a click on a city (Jeddah, Riyadh…) opens its districts coloured the same way. Beside the map: the
   ranking of the level on screen, its top products and top customers, and what could not be placed.
   The figures come from the orders in the base app's database (city and district of each order); the
   regions are Natural Earth's boundaries, the city and district points are approximate (the districts are
   drawn as cells around their points, not surveyed boundaries). Sales upload: the base app's import. */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_geomap_v1",APPDB="aghnam-app-v7";
const METRICS={orders:"الطلبات",sales:"المبيعات",customers:"العملاء"};
const PERIODS={all:"كل الفترة",365:"آخر سنة",90:"آخر 90 يوماً",30:"آخر 30 يوماً"};
const K=s=>String(s||"").trim().replace(/\s+/g," ").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/^ال/,"").toLowerCase();
const n0=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0}).format(Number(v)||0);
const money=v=>n0(v)+" ر.س";
let root=null,geo=null,data=null,vb=null,anim=0;

function st(){const d=load(KEY,{})||{};return{level:d.level||"country",region:d.region||"",city:d.city||"",metric:METRICS[d.metric]?d.metric:"orders",period:PERIODS[d.period]?d.period:"all"}}
function put(p){save(KEY,{...st(),...p})}

/* ---------- data ---------- */
async function loadGeo(){if(geo)return geo;const r=await fetch("./data/sa-geo.json");if(!r.ok)throw new Error("تعذر تحميل بيانات الخريطة");geo=await r.json();
  geo.cityBy=new Map();geo.cities.forEach(c=>{[c.name,...(c.aka||[])].forEach(a=>geo.cityBy.set(K(a),c))});
  geo.regionBy=new Map(geo.regions.map(r=>[r.id,r]));return geo}
function all(store){return new Promise(res=>{let q;try{q=indexedDB.open(APPDB)}catch{return res([])}q.onerror=()=>res([]);q.onupgradeneeded=()=>{};
  q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store).objectStore(store).getAll();g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
async function loadData(){
  const [orders,items,customers]=await Promise.all([all("orders"),all("order_items"),all("customers")]);
  const cById=new Map(customers.map(c=>[String(c.id),c]));
  const byOrder=new Map();items.forEach(i=>{const k=String(i.orderId);if(!byOrder.has(k))byOrder.set(k,[]);byOrder.get(k).push(i)});
  data={orders:orders.map(o=>{const c=cById.get(String(o.customerId))||{};return{id:String(o.id),date:String(o.date||"").slice(0,10),total:Number(o.orderTotal||o.subtotal||0),cid:String(o.customerId||""),cname:o.customerName||c.name||"",
    city:o.city||c.city||"",district:o.district||c.district||""}}),byOrder,customers:customers.length};
  return data;
}
function aggregate(p){
  const since=p.period==="all"?"":new Date(Date.now()-Number(p.period)*864e5).toISOString().slice(0,10);
  const mk=()=>({orders:0,sales:0,cust:new Set(),prod:new Map(),top:new Map()});
  const R=new Map(),C=new Map(),D=new Map(),T=mk();let unknown=0,unknownSales=0;
  const add=(a,o)=>{a.orders++;a.sales+=o.total;if(o.cid)a.cust.add(o.cid);
    const t=a.top.get(o.cid)||{name:o.cname,orders:0,sales:0};t.orders++;t.sales+=o.total;a.top.set(o.cid,t);
    (data.byOrder.get(o.id)||[]).forEach(i=>{const k=i.productName||i.descriptionOriginal||"—",x=a.prod.get(k)||{name:k,qty:0,sales:0};x.qty+=Number(i.qty)||0;x.sales+=Number(i.amount)||0;a.prod.set(k,x)})};
  data.orders.forEach(o=>{
    if(since&&o.date&&o.date<since)return;
    add(T,o);
    const c=geo.cityBy.get(K(o.city));if(!c){unknown++;unknownSales+=o.total;return}
    const r=c.region;if(!R.has(r))R.set(r,mk());add(R.get(r),o);
    if(!C.has(c.name))C.set(c.name,mk());add(C.get(c.name),o);
    const dk=c.name+"|"+(String(o.district||"").trim()||"غير محدد");if(!D.has(dk))D.set(dk,mk());add(D.get(dk),o);
  });
  return{R,C,D,T,unknown,unknownSales};
}
const val=(a,m)=>!a?0:m==="sales"?a.sales:m==="customers"?a.cust.size:a.orders;
const fmtV=(v,m)=>m==="sales"?money(v):n0(v);

/* ---------- colours: a ramp from the surface to the brand colour, as plain colours (they print) ---------- */
let RAMP=null;
function rgbOf(css){const el=document.createElement("i");el.style.color=css;document.body.appendChild(el);const c=getComputedStyle(el).color;el.remove();const m=c.match(/[\d.]+/g)||[0,0,0];return m.slice(0,3).map(Number)}
function ramp(){if(RAMP)return RAMP;const b=rgbOf("var(--sk-brand)"),s=rgbOf("var(--sk-surface)");RAMP=[.1,.28,.46,.66,.88].map(t=>"rgb("+s.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(",")+")");return RAMP}
function scaleOf(values){const v=values.filter(x=>x>0).sort((a,b)=>a-b);if(!v.length)return()=>null;const q=[.2,.4,.6,.8].map(p=>v[Math.min(v.length-1,Math.floor(p*v.length))]);return x=>x>0?ramp()[q.filter(t=>x>t).length]:null}
function legend(values,m){const v=values.filter(x=>x>0).sort((a,b)=>a-b);if(!v.length)return"";const q=[0,.2,.4,.6,.8].map(p=>v[Math.min(v.length-1,Math.floor(p*v.length))]);
  return'<div class="gm-legend" aria-label="مفتاح الألوان">'+ramp().map((c,i)=>'<span><i style="background:'+c+'"></i>'+(i===0?"":"≥ ")+fmtV(q[i],m)+'</span>').join("")+'<span><i class="gm-none"></i>لا يوجد</span></div>'}

/* ---------- districts as cells around their points ---------- */
function hull(pts){const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(p.length<3)return p;const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[];for(const x of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],x)<=0)lo.pop();lo.push(x)}
  const up=[];for(const x of p.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],x)<=0)up.pop();up.push(x)}
  return lo.slice(0,-1).concat(up.slice(0,-1))}
function clip(poly,a,b,c){/* keep a·x + b·y ≤ c */const out=[];for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length],fp=a*P[0]+b*P[1]-c,fq=a*Q[0]+b*Q[1]-c;
  if(fp<=0)out.push(P);if((fp<0&&fq>0)||(fp>0&&fq<0)){const t=fp/(fp-fq);out.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])])}}return out}
const hash=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h};
function cityCells(city,names){
  const known=(geo.districts||{})[city.name]||{},kn=new Map(Object.entries(known).map(([n,xy])=>[K(n),[n,xy]]));
  const pts=[...Object.values(known)];const cx=pts.length?pts.reduce((s,p)=>s+p[0],0)/pts.length:city.xy[0],cy=pts.length?pts.reduce((s,p)=>s+p[1],0)/pts.length:city.xy[1];
  const rad=pts.length?Math.max(2,...pts.map(p=>Math.hypot(p[0]-cx,p[1]-cy))):3;
  const sites=[],seen=new Set();
  names.forEach(nm=>{const k=K(nm);if(seen.has(k))return;seen.add(k);const hit=kn.get(k);
    if(hit)sites.push({name:nm,xy:hit[1],approx:false});else{const a=(hash(nm)%360)*Math.PI/180,r=rad*(.35+(hash(nm+"r")%40)/100);sites.push({name:nm,xy:[cx+Math.cos(a)*r,cy+Math.sin(a)*r],approx:true})}});
  /* the districts with no orders still draw, faint, so the city reads as a city */
  kn.forEach(([n,xy],k)=>{if(!seen.has(k)){seen.add(k);sites.push({name:n,xy,approx:false,empty:true})}});
  if(!sites.length)return{cells:[],outline:[],box:[city.xy[0]-4,city.xy[1]-4,8,8]};
  const all=sites.map(s=>s.xy);
  let nn=[];all.forEach((p,i)=>{let m=1e9;all.forEach((q,j)=>{if(i!==j)m=Math.min(m,Math.hypot(p[0]-q[0],p[1]-q[1]))});if(m<1e9)nn.push(m)});nn.sort((a,b)=>a-b);
  const pad=Math.max(1.2,(nn[Math.floor(nn.length/2)]||2)*.9);
  let outline;const H=hull(all);
  if(H.length<3)outline=Array.from({length:18},(_,i)=>{const a=i/18*Math.PI*2;return[cx+Math.cos(a)*(rad+pad),cy+Math.sin(a)*(rad+pad)]});
  else{const hx=H.reduce((s,p)=>s+p[0],0)/H.length,hy=H.reduce((s,p)=>s+p[1],0)/H.length;outline=H.map(p=>{const dx=p[0]-hx,dy=p[1]-hy,L=Math.hypot(dx,dy)||1;return[p[0]+dx/L*pad,p[1]+dy/L*pad]})}
  const cells=sites.map((s,i)=>{let poly=outline.slice();sites.forEach((o,j)=>{if(i===j||!poly.length)return;const a=o.xy[0]-s.xy[0],b=o.xy[1]-s.xy[1];if(!a&&!b)return;poly=clip(poly,a,b,(o.xy[0]*o.xy[0]+o.xy[1]*o.xy[1]-s.xy[0]*s.xy[0]-s.xy[1]*s.xy[1])/2)});return{...s,poly}});
  const xs=outline.map(p=>p[0]),ys=outline.map(p=>p[1]);
  return{cells,outline,box:[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)]};
}
const polyArea=poly=>Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1]},0))/2;
const pathOf=poly=>poly.length?"M"+poly.map(p=>p[0].toFixed(2)+","+p[1].toFixed(2)).join("L")+"Z":"";

/* ---------- the view box ---------- */
function fitBox(b,padK=.08){const el=root&&root.querySelector(".gm-svg");const W=el?el.clientWidth||600:600,H=el?el.clientHeight||500:500,ar=W/H;
  let [x,y,w,h]=b;const px=w*padK,py=h*padK;x-=px;y-=py;w+=2*px;h+=2*py;if(w/h>ar){const nh=w/ar;y-=(nh-h)/2;h=nh}else{const nw=h*ar;x-=(nw-w)/2;w=nw}return[x,y,w,h]}
function countryBox(){const xs=[],ys=[];geo.regions.forEach(r=>{xs.push(r.box[0],r.box[0]+r.box[2]);ys.push(r.box[1],r.box[1]+r.box[3])});return[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)]}
function setVB(to,animate=true){
  const svg=root&&root.querySelector(".gm-svg");if(!svg)return;const from=vb||to;cancelAnimationFrame(anim);
  if(!animate||matchMedia("(prefers-reduced-motion: reduce)").matches){vb=to;svg.setAttribute("viewBox",to.join(" "));scaleText();return}
  const t0=performance.now(),D=380;const step=now=>{const t=Math.min(1,(now-t0)/D),e=1-Math.pow(1-t,3);vb=from.map((v,i)=>v+(to[i]-v)*e);svg.setAttribute("viewBox",vb.join(" "));scaleText();if(t<1)anim=requestAnimationFrame(step)};anim=requestAnimationFrame(step);
}
function scaleText(){const svg=root&&root.querySelector(".gm-svg");if(!svg||!vb)return;const W=svg.clientWidth||600,u=vb[2]/W;svg.style.setProperty("--u",u);
  svg.querySelectorAll("[data-fs]").forEach(t=>t.setAttribute("font-size",(Number(t.dataset.fs)*u).toFixed(3)));svg.querySelectorAll("[data-r]").forEach(c=>c.setAttribute("r",(Number(c.dataset.r)*u).toFixed(3)));
  svg.querySelectorAll("text[data-area]").forEach(t=>{const px=Number(t.dataset.area)/(u*u);t.style.display=px<(t.classList.contains("is-zero")?2400:900)?"none":""})}

/* ---------- painting ---------- */
function mapSvg(p,A){
  const m=p.metric,rv=geo.regions.map(r=>val(A.R.get(r.id),m)),sc=scaleOf(rv);
  let s='<g class="gm-regions">'+geo.regions.map(r=>{const v=val(A.R.get(r.id),m),f=sc(v);const on=p.level!=="country"&&p.region===r.id;
    const fill=p.level==="city"?"var(--sk-surface-2)":(f||"var(--sk-surface-2)");
    return'<path d="'+r.d+'" data-region="'+r.id+'" class="gm-reg'+(on?' is-on':'')+(p.level!=="country"&&!on?' is-dim':'')+'" fill="'+fill+'" tabindex="0" role="button" aria-label="'+esc(r.name+": "+fmtV(v,m)+" "+METRICS[m])+'"><title>'+esc(r.name+" — "+fmtV(v,m))+'</title></path>'}).join("")+'</g>';
  if(p.level!=="city"){
    const cs=geo.cities.filter(c=>p.level==="country"||c.region===p.region),mx=Math.max(1,...cs.map(c=>val(A.C.get(c.name),m)));
    const lead=new Set();if(p.level==="country"){const best={};cs.forEach(c=>{const v=val(A.C.get(c.name),m);if(v&&(!best[c.region]||v>best[c.region][1]))best[c.region]=[c.name,v]});Object.values(best).forEach(([n])=>lead.add(n))}
    s+='<g class="gm-cities">'+cs.map(c=>{const v=val(A.C.get(c.name),m);if(!v&&p.level==="country")return"";const r=v?4+14*Math.sqrt(v/mx):3;
      return'<g class="gm-city'+(v?'':' is-zero')+'" data-city="'+esc(c.name)+'" tabindex="0" role="button" aria-label="'+esc(c.name+": "+fmtV(v,m))+'"><circle cx="'+c.xy[0]+'" cy="'+c.xy[1]+'" data-r="'+r.toFixed(1)+'"/>'+
        (p.level==="region"||lead.has(c.name)?'<text x="'+c.xy[0]+'" y="'+c.xy[1]+'" dy="-1.4em" data-fs="12" text-anchor="middle">'+esc(c.name)+(v?" · "+fmtV(v,m):"")+'</text>':'')+'<title>'+esc(c.name+" — "+fmtV(v,m))+'</title></g>'}).join("")+'</g>';
  }else{
    const city=geo.cities.find(c=>c.name===p.city);if(city){
      const names=[...A.D.keys()].filter(k=>k.startsWith(city.name+"|")).map(k=>k.split("|")[1]);
      const cc=cityCells(city,names),dv=cc.cells.map(c=>val(A.D.get(city.name+"|"+c.name),m)),dsc=scaleOf(dv);
      s+='<g class="gm-districts"><path class="gm-outline" d="'+pathOf(cc.outline)+'"/>'+cc.cells.map((c,i)=>{const v=dv[i],f=dsc(v);
        return'<path d="'+pathOf(c.poly)+'" class="gm-dist'+(c.approx?' is-approx':'')+'" data-district="'+esc(c.name)+'" fill="'+(f||"var(--sk-surface)")+'" tabindex="0" role="button" aria-label="'+esc(c.name+": "+fmtV(v,m))+'"><title>'+esc(c.name+" — "+fmtV(v,m)+(c.approx?" (موقع تقريبي)":""))+'</title></path>'}).join("")+
        cc.cells.map((c,i)=>{const v=dv[i],ar=polyArea(c.poly).toFixed(2);return'<text data-area="'+ar+'" class="gm-dl'+(v?'':' is-zero')+'" x="'+c.xy[0].toFixed(2)+'" y="'+c.xy[1].toFixed(2)+'" data-fs="'+(v?11:9)+'" text-anchor="middle">'+esc(c.name)+'</text>'+(v?'<text data-area="'+ar+'" class="gm-dv" x="'+c.xy[0].toFixed(2)+'" y="'+c.xy[1].toFixed(2)+'" dy="1.25em" data-fs="10" text-anchor="middle">'+fmtV(v,m)+'</text>':'')}).join("")+'</g>';
      root.__cityBox=cc.box;
    }
  }
  return s;
}
function crumbs(p){
  const r=p.region&&geo.regionBy.get(p.region);
  return'<nav class="gm-crumbs" aria-label="المستوى"><button type="button" data-go-level="country"'+(p.level==="country"?' aria-current="true"':'')+'>السعودية</button>'+
    (p.level!=="country"&&r?'<span>›</span><button type="button" data-go-level="region"'+(p.level==="region"?' aria-current="true"':'')+'>'+esc(r.name)+'</button>':'')+
    (p.level==="city"?'<span>›</span><button type="button" aria-current="true">'+esc(p.city)+'</button>':'')+'</nav>';
}
function side(p,A){
  const m=p.metric;let cur=A.T,rows=[],title="المناطق",kind="region";
  if(p.level==="country")rows=geo.regions.map(r=>({id:r.id,name:r.name,a:A.R.get(r.id)}));
  else if(p.level==="region"){cur=A.R.get(p.region);title="المدن";kind="city";rows=geo.cities.filter(c=>c.region===p.region).map(c=>({id:c.name,name:c.name,a:A.C.get(c.name)}))}
  else{cur=A.C.get(p.city);title="الأحياء";kind="district";rows=[...A.D.entries()].filter(([k])=>k.startsWith(p.city+"|")).map(([k,a])=>({id:k.split("|")[1],name:k.split("|")[1],a}))}
  rows=rows.filter(r=>val(r.a,m)>0).sort((x,y)=>val(y.a,m)-val(x.a,m));
  const mx=Math.max(1,...rows.map(r=>val(r.a,m)));
  const top=(mp,f)=>[...(mp||new Map()).values()].sort((a,b)=>b.sales-a.sales).slice(0,6).map(f).join("");
  const c=cur||{orders:0,sales:0,cust:new Set(),prod:new Map(),top:new Map()};
  return'<div class="gm-kpis"><span><b>'+n0(c.orders)+'</b>طلب</span><span><b>'+money(c.sales)+'</b>مبيعات</span><span><b>'+n0(c.cust.size)+'</b>عميل</span><span><b>'+money(c.orders?c.sales/c.orders:0)+'</b>متوسط الطلب</span></div>'+
    '<h4>'+title+' حسب '+METRICS[m]+'</h4>'+(rows.length?'<ol class="gm-rank">'+rows.slice(0,14).map(r=>'<li><button type="button" data-rank-'+kind+'="'+esc(r.id)+'"'+(kind==="district"?' disabled':'')+'><span class="gm-rn">'+esc(r.name)+'</span><span class="gm-rb"><i style="width:'+(val(r.a,m)/mx*100).toFixed(1)+'%"></i></span><b>'+fmtV(val(r.a,m),m)+'</b></button></li>').join("")+'</ol>':'<p class="muted sm">لا طلبات في هذا المستوى للفترة المختارة.</p>')+
    '<h4>الأكثر مبيعاً هنا</h4>'+(c.prod.size?'<ul class="gm-list">'+top(c.prod,x=>'<li><span>'+esc(x.name)+'</span><b>'+money(x.sales)+'</b><small>'+n0(x.qty)+' وحدة</small></li>')+'</ul>':'<p class="muted sm">—</p>')+
    '<h4>أكبر العملاء هنا</h4>'+(c.top.size?'<ul class="gm-list">'+top(c.top,x=>'<li><span>'+esc(x.name||"—")+'</span><b>'+money(x.sales)+'</b><small>'+n0(x.orders)+' طلب</small></li>')+'</ul>':'<p class="muted sm">—</p>')+
    (A.unknown?'<p class="gm-unk">'+n0(A.unknown)+' طلب ('+money(A.unknownSales)+') بمدينة غير معروفة للخريطة — صحّح المدينة في بيانات العميل.</p>':'')+
    '<div class="gm-acts"><button type="button" class="btn sm" data-gm-import>'+SK.icon("exports")+' استيراد مبيعات</button><button type="button" class="btn sm" data-gm-print>'+SK.icon("reports")+' طباعة التقرير</button><button type="button" class="btn ghost sm" data-gm-sales>تحليل المبيعات</button></div>';
}
async function paint(first){
  if(!root)return;
  try{await loadGeo();if(!data)await loadData()}catch(e){root.innerHTML='<p class="muted">'+esc(e.message||String(e))+'</p>';return}
  const p=st(),A=aggregate(p);
  if(!data.orders.length){root.innerHTML='<div class="gm-empty card"><h3>لا طلبات بعد</h3><p class="muted">الخريطة تُلوَّن من مدن وأحياء الطلبات. استورد ملف المبيعات أو شغّل البيانات التجريبية.</p><button type="button" class="btn primary" data-gm-import>استيراد مبيعات</button></div>';return}
  const values=p.level==="country"?geo.regions.map(r=>val(A.R.get(r.id),p.metric)):p.level==="region"?geo.regions.map(r=>val(A.R.get(r.id),p.metric)):[...A.D.entries()].filter(([k])=>k.startsWith(p.city+"|")).map(([,a])=>val(a,p.metric));
  root.innerHTML='<div class="gm">'+
    '<div class="gm-bar">'+crumbs(p)+'<div class="gm-seg" role="group" aria-label="المقياس">'+Object.entries(METRICS).map(([k,l])=>'<button type="button" data-metric="'+k+'" aria-pressed="'+(k===p.metric)+'">'+l+'</button>').join("")+'</div>'+
      '<label class="gm-per"><span class="sr-only">الفترة</span><select data-period>'+Object.entries(PERIODS).map(([k,l])=>'<option value="'+k+'"'+(k===p.period?' selected':'')+'>'+l+'</option>').join("")+'</select></label></div>'+
    '<div class="gm-body"><div class="gm-mapwrap"><svg class="gm-svg" role="img" aria-label="خريطة '+esc(p.level==="city"?p.city:p.level==="region"?(geo.regionBy.get(p.region)||{}).name||"":"السعودية")+' حسب '+METRICS[p.metric]+'" preserveAspectRatio="xMidYMid meet">'+mapSvg(p,A)+'</svg>'+
      '<div class="gm-zoom"><button type="button" class="btn sm" data-zoom="1" aria-label="تكبير">+</button><button type="button" class="btn sm" data-zoom="-1" aria-label="تصغير">−</button>'+(p.level!=="country"?'<button type="button" class="btn sm" data-up aria-label="مستوى أعلى">↑</button>':'')+'</div>'+
      legend(values,p.metric)+'<p class="gm-note">'+(p.level==="city"?'الأحياء خلايا حول مواقع تقريبية لمراكزها — للمقارنة بين الأحياء، لا للحدود. ':'')+'الحدود: Natural Earth.</p><div class="gm-tip" hidden></div></div>'+
    '<aside class="gm-side">'+side(p,A)+'</aside></div></div>';
  const box=p.level==="country"?countryBox():p.level==="region"?(geo.regionBy.get(p.region)||{}).box||countryBox():root.__cityBox;
  const target=fitBox(box,p.level==="city"?.06:.08);
  if(first||!vb){vb=target;root.querySelector(".gm-svg").setAttribute("viewBox",vb.join(" "));scaleText()}else setVB(target,true);
}
function go(p){put(p);paint()}

/* ---------- print ---------- */
function printReport(){
  const p=st(),A=aggregate(p),svg=root.querySelector(".gm-svg");if(!svg)return;
  const clone=svg.cloneNode(true);clone.setAttribute("width","100%");clone.setAttribute("height","420");clone.querySelectorAll("title").forEach(t=>t.remove());
  clone.querySelectorAll(".gm-reg,.gm-dist").forEach(x=>{x.setAttribute("stroke","#fff");x.setAttribute("stroke-width",String((vb[2]/600).toFixed(3)));if(/var\(/.test(x.getAttribute("fill")||""))x.setAttribute("fill","#eef1f5")});
  clone.querySelectorAll(".gm-reg.is-dim").forEach(x=>x.setAttribute("opacity",".35"));
  clone.querySelectorAll(".gm-city circle").forEach(c=>{c.setAttribute("fill","#1557d6");c.setAttribute("fill-opacity",".75");c.setAttribute("stroke","#fff")});
  clone.querySelectorAll("text").forEach(t=>{t.setAttribute("fill","#1d2433");t.setAttribute("font-family","IBM Plex Sans Arabic, sans-serif")});
  clone.querySelectorAll(".gm-outline").forEach(o=>{o.setAttribute("fill","none");o.setAttribute("stroke","#1d2433");o.setAttribute("stroke-width",String((vb[2]/400).toFixed(3)))});
  const where=p.level==="city"?p.city:p.level==="region"?(geo.regionBy.get(p.region)||{}).name:"المملكة العربية السعودية";
  const html=side(p,A).replace(/<div class="gm-acts">[\s\S]*$/,"").replace(/<button[^>]*>/g,"<span>").replace(/<\/button>/g,"</span>");
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","err");return}
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>خريطة العملاء — '+esc(where)+'</title></head><body><h1>خريطة العملاء — '+esc(where)+'</h1><p>حسب '+METRICS[p.metric]+' · '+PERIODS[p.period]+' · '+new Date().toLocaleDateString("ar-SA-u-nu-latn")+'</p>'+clone.outerHTML+
    '<div class="gm-print">'+html.replace(/<i style="width:[^"]*"><\/i>/g,"")+'</div><p style="font-size:10px;color:#667">الحدود: Natural Earth. مواقع المدن والأحياء تقريبية.</p></body></html>');
  w.document.close();SK.brandPrint(w,"خريطة العملاء");
}

/* ---------- events ---------- */
function tip(e,text){const t=root.querySelector(".gm-tip");if(!t)return;if(!text){t.hidden=true;return}const r=root.querySelector(".gm-mapwrap").getBoundingClientRect();t.textContent=text;t.hidden=false;t.style.left=(e.clientX-r.left)+"px";t.style.top=(e.clientY-r.top-12)+"px"}
function onClick(e){
  const t=e.target,p=st();
  const mt=t.closest("[data-metric]");if(mt)return go({metric:mt.dataset.metric});
  const gl=t.closest("[data-go-level]");if(gl){if(gl.dataset.goLevel==="country")return go({level:"country",region:"",city:""});return go({level:"region",city:""})}
  if(t.closest("[data-up]"))return go(p.level==="city"?{level:"region",city:""}:{level:"country",region:"",city:""});
  const z=t.closest("[data-zoom]");if(z&&vb){const k=+z.dataset.zoom>0?.7:1/.7,cx=vb[0]+vb[2]/2,cy=vb[1]+vb[3]/2;setVB([cx-vb[2]*k/2,cy-vb[3]*k/2,vb[2]*k,vb[3]*k]);return}
  if(t.closest("[data-gm-import]")){const c=core();if(!c)return;c.go("customers");setTimeout(()=>{try{c.act("market-import")}catch{}},400);return}
  if(t.closest("[data-gm-print]"))return printReport();
  if(t.closest("[data-gm-sales]")){core()&&core().go("salesintel");return}
  const rc=t.closest("[data-rank-region]");if(rc)return go({level:"region",region:rc.dataset.rankRegion,city:""});
  const ry=t.closest("[data-rank-city]");if(ry){const c=geo.cities.find(x=>x.name===ry.dataset.rankCity);return go({level:"city",region:c?c.region:p.region,city:ry.dataset.rankCity})}
  const cy=t.closest("[data-city]");if(cy){const c=geo.cities.find(x=>x.name===cy.dataset.city);return go({level:"city",region:c.region,city:c.name})}
  const rg=t.closest("[data-region]");if(rg){if(p.level==="city"&&rg.dataset.region===p.region)return go({level:"region",city:""});return go({level:"region",region:rg.dataset.region,city:""})}
}
function onKey(e){if((e.key==="Enter"||e.key===" ")&&e.target.closest&&e.target.closest("[data-region],[data-city]")){e.preventDefault();onClick(e)}}
function onMove(e){const x=e.target.closest&&e.target.closest("[data-region],[data-city],[data-district]");if(!x){tip(e,"");return}const l=x.getAttribute("aria-label");tip(e,l)}
function render(el){
  root=el;data=null;vb=null;RAMP=null;
  if(!el.__gm){el.__gm=true;el.addEventListener("click",onClick);el.addEventListener("keydown",onKey);el.addEventListener("pointermove",onMove);el.addEventListener("pointerleave",e=>tip(e,""));
    el.addEventListener("change",e=>{const s=e.target.closest("[data-period]");if(s)go({period:s.value})});
    addEventListener("resize",()=>{if(root&&root.isConnected&&vb)scaleText()},{passive:true});
    SK.bus&&SK.bus.on&&SK.bus.on("theme",()=>{RAMP=null;if(root&&root.isConnected)paint()});}
  root.innerHTML='<p class="muted">جارٍ تحميل الخريطة…</p>';
  paint(true);
}
window.SKosifGeoMap=Object.freeze({city:c=>{const x=geo&&geo.cities.find(y=>y.name===c);go({level:"city",region:x?x.region:"",city:c})},region:r=>go({level:"region",region:r,city:""}),country:()=>go({level:"country",region:"",city:""}),state:st});
SK.view("geomap",{render});
})();

/* SQC — شجرة المنتجات (شاشة «ptree» في الأدوات المساعدة للمحاسب).
   مم يتكوّن كل منتج، وكم يكلف، ومن يورّد مواده، ومن يشتريه — بثلاث طرق للعرض والتحرير:
   • الشجرة: المنتج ← مكوّناته (مواد خام بهدرها وأسعارها، ومنتجات فرعية) ← موردو كل مادة، وعملاء المنتج.
   • الجدول: المواد الخام (التكلفة، الهدر، الوحدة) والمنتجات (السعر، التكاليف الإضافية، المكوّنات) تُحرَّر مباشرة.
   • الأسهم: لوحة عُقد وأسهم — ارسم سهماً من مادة إلى منتج (بالكمية)، ومن مورد إلى مادة (بالسعر)، ومن منتج إلى عميل.
     المورد الجديد يُضاف تلقائياً إلى «الموردون والمشتريات» وقائمة أسعار الموردين.
   • التكلفة والتحليل: تكلفة كل منتج وهامشه، أثر تغير سعر مادة على كل المنتجات، وأين تُستخدم كل مادة، وطباعة التقرير.
   البيانات: sqc_ptree_v1 (لكل شركة، ضمن مساحة الأدوات المساعدة). تُستورد المواد والبوكسات من «الأصناف والأسعار»
   والعملاء من الطلبات (قاعدة aghnam-app-v7) دون المساس بهما. المحرك: SKEngines.catalog.productTree. */
(()=>{
"use strict";
const {esc,toast,load,save}=SK;
const KEY="sqc_ptree_v1",PT=()=>SKEngines.catalog.productTree;
const TABS=[["tree","الشجرة"],["table","الجدول"],["arrows","الأسهم"],["cost","التكلفة والتحليل"]];
let root=null,tab="tree",mode="move",linkFrom=null,focus="",best=false,shock={m:"",pct:10},used="";
const nf=new Intl.NumberFormat("en",{maximumFractionDigits:2}),n2=v=>v==null||!isFinite(v)?"—":nf.format(v);
const today=()=>new Date().toISOString().slice(0,10);
const get=()=>{const t=load(KEY,null);return t&&Array.isArray(t.materials)?t:PT().emptyTree()};
const put=t=>{save(KEY,t);SK.audit&&SK.audit.log("ptree",{act:"save",materials:t.materials.length,products:t.products.length})};

/* ---------- the app's own data: the pricing workbook's items and boxes, the orders ---------- */
function workbook(){try{const s=JSON.parse(localStorage.getItem("aghnam-pricing-v3")||"{}");return PT().fromWorkbook(s.raws||[],s.boxes||[])}catch{return PT().emptyTree()}}
async function orderLines(){
  try{if(indexedDB.databases&&!(await indexedDB.databases()).some(d=>d.name==="aghnam-app-v7"))return[];
    const db=await new Promise((res,rej)=>{const q=indexedDB.open("aghnam-app-v7");q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
    if(!db.objectStoreNames.contains("order_items")||!db.objectStoreNames.contains("orders")){db.close();return[]}
    const all=s=>new Promise(res=>{const t=db.transaction(s);const q=t.objectStore(s).getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])});
    const [items,orders]=await Promise.all([all("order_items"),all("orders")]);db.close();
    const who=new Map(orders.map(o=>[o.id,o.customerName||o.phone||""]));
    return items.map(i=>({product:i.productName||i.descriptionOriginal||"",customer:who.get(i.orderId)||"",qty:+i.qty||0,amount:+i.amount||0}));
  }catch{return[]}
}
/* the suppliers the app already knows for each material: shipments received and the suppliers' price list (latest price) */
function knownSupply(t){
  const norm=s=>String(s||"").trim().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").toLowerCase(),byName=new Map(t.materials.map(m=>[norm(m.name),m.id])),out=new Map();
  const add=(sup,item,price,date)=>{const id=byName.get(norm(item));if(!id||!sup||!(price>0))return;const k=sup+"|"+id,o=out.get(k);if(!o||String(date||"")>=String(o.date||""))out.set(k,{supplier:sup,materialId:id,price:Math.round(price*100)/100,date})};
  (load("skosif_v31_supplier_batches",[])||[]).forEach(b=>b&&add(b.supplier,b.itemName,+b.priceGross,b.date));
  ((load("skosif_purchasing_v1",{})||{}).prices||[]).forEach(p=>p&&add(p.supplier,p.item,+p.price,p.from));
  return [...out.values()].map(({date,...x})=>x);
}
async function sync(silent){
  const t=get(),m=PT().mergeWorkbook(t,workbook()),cl=PT().customersFromOrders(m,await orderLines());
  m.customers=[...m.customers.filter(c=>c.source==="manual"),...cl];
  knownSupply(m).forEach(s=>{if(!m.suppliers.some(x=>x.supplier===s.supplier&&x.materialId===s.materialId))m.suppliers.push(s)});put(m);
  if(!silent)toast("حُدّثت الشجرة: "+m.materials.length+" مادة، "+m.products.length+" منتجاً، "+new Set(m.suppliers.map(x=>x.supplier)).size+" مورداً، "+new Set(cl.map(c=>c.customer)).size+" عميلاً من الطلبات","ok");
  paint();
}
/* a supplier drawn on the canvas joins the app's suppliers: its price goes to the suppliers' price list */
function registerSupplier(name,material,price,unit){
  const d=load("skosif_purchasing_v1",{})||{};d.orders=d.orders||[];d.receipts=d.receipts||[];d.prices=d.prices||[];
  d.prices.push({id:(SK.ui&&SK.ui.uid?SK.ui.uid("pr"):"pr-"+Date.now().toString(36)),supplier:name,item:material,price,unit:unit||"كجم",from:today(),to:"",source:"شجرة المنتجات"});save("skosif_purchasing_v1",d);
  const ml=load("aghnam-v15-master-lists",{})||{};ml.suppliers=Array.isArray(ml.suppliers)?ml.suppliers:[];if(!ml.suppliers.some(s=>s&&s.name===name)){ml.suppliers.push({name});save("aghnam-v15-master-lists",ml)}
}

/* ---------- header ---------- */
function head(t){
  const costs=t.products.map(p=>PT().productCost(t,p.id)),m=costs.filter(c=>c.margin!=null),avg=m.length?m.reduce((s,c)=>s+c.margin,0)/m.length:null;
  const sup=new Set([...t.suppliers.map(s=>s.supplier),...((t.people||{}).suppliers||[])]).size,cus=new Set([...t.customers.map(c=>c.customer),...((t.people||{}).customers||[])]).size;
  const k=(l,v,s)=>'<div class="sk-kpi"><span>'+l+'</span><b>'+v+'</b>'+(s?'<small>'+s+'</small>':'')+'</div>';
  return '<section class="card pt-hero"><div class="pt-hero-t"><span class="eyebrow">PRODUCT TREE</span><h2>شجرة المنتجات</h2><p>ابدأ بالمواد الخام (التكلفة والهدر)، ثم المنتجات والبوكسات المكوّنة منها، ثم اربط الموردين والعملاء — جدولاً أو شجرةً أو أسهماً.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn" data-pt="sync" title="يضيف المواد والبوكسات الجديدة من «الأصناف والأسعار» وعملاء المنتجات من الطلبات دون حذف ما رسمته">'+SK.icon("sync")+' مزامنة من الأصناف والطلبات</button>'+
    '<button type="button" class="btn" data-pt="add-m">+ مادة خام</button><button type="button" class="btn" data-pt="add-p">+ منتج</button><button type="button" class="btn" data-pt="add-s">+ مورد</button><button type="button" class="btn" data-pt="add-c">+ عميل</button>'+
    '<button type="button" class="btn primary" data-pt="print">'+SK.icon("print")+' تقرير الشجرة</button></div>'+
    '<div class="sk-kpis">'+k("المواد الخام",t.materials.length)+k("المنتجات",t.products.length)+k("الموردون",sup)+k("العملاء",cus)+k("متوسط الهامش",avg==null?"—":n2(avg)+"%")+'</div></section>'+
    '<div class="sk-seg pt-tabs" role="tablist">'+TABS.map(([k2,l])=>'<button type="button" role="tab" data-pt-tab="'+k2+'" aria-selected="'+(tab===k2)+'">'+l+'</button>').join("")+'</div>';
}

/* ---------- the tree ---------- */
function treeTab(t){
  if(!t.products.length&&!t.materials.length)return empty();
  const mats=new Map(t.materials.map(m=>[m.id,m])),supOf=id=>t.suppliers.filter(s=>s.materialId===id),cusOf=id=>t.customers.filter(c=>c.productId===id);
  const node=(pid,depth,seen)=>{
    const c=PT().productCost(t,pid,{bestSupplier:best});if(!c.name)return"";
    const badge=c.margin==null?'':'<span class="sksev '+(c.margin<0?"bad":c.margin<15?"warn":"ok")+'">هامش '+n2(c.margin)+'%</span>';
    return '<details class="pt-node"'+(depth<1?' open':'')+'><summary><b>'+esc(c.name)+'</b><span>التكلفة '+n2(c.total)+(c.price!=null?' · السعر '+n2(c.price):'')+'</span>'+badge+'<button type="button" class="btn sm" data-pt-focus="'+esc(pid)+'">أسهم</button></summary><ul>'+
      c.lines.map(l=>l.kind==="product"&&!seen.includes(l.ref)?'<li class="pt-sub">'+node(l.ref,depth+1,[...seen,pid]).replace('<details class="pt-node"','<details class="pt-node" data-qty="'+l.qty+'"')+'<small>× '+n2(l.qty)+' = '+n2(l.amount)+' ('+l.share+'%)</small></li>':
        '<li><span class="pt-mat">'+esc(l.name)+'</span><small>'+n2(l.qty)+' × '+n2(l.unitCost)+' = <b>'+n2(l.amount)+'</b> ('+l.share+'%)'+(mats.get(l.ref)&&mats.get(l.ref).waste?' · هدر '+mats.get(l.ref).waste+'%':'')+'</small>'+
          (supOf(l.ref).length?'<span class="pt-chips">'+supOf(l.ref).map(s=>'<i class="pt-chip sup">'+esc(s.supplier)+' · '+n2(s.price)+'</i>').join("")+'</span>':'')+'</li>').join("")+
      (c.overhead?'<li><span class="pt-mat">تكاليف إضافية (تغليف، عمالة…)</span><small><b>'+n2(c.overhead)+'</b></small></li>':'')+
      (cusOf(pid).length?'<li class="pt-cus"><span>يشتريه:</span><span class="pt-chips">'+cusOf(pid).map(x=>'<i class="pt-chip cus">'+esc(x.customer)+(x.amount?' · '+n2(x.amount):'')+'</i>').join("")+'</span></li>':'')+
      (c.missing.length?'<li class="pt-miss">مكوّن غير معرّف: '+esc(c.missing.join("، "))+'</li>':'')+'</ul></details>';
  };
  const usedIds=new Set(t.products.flatMap(p=>p.components.map(c=>c.ref))),free=t.materials.filter(m=>!usedIds.has(m.id));
  const tops=t.products.filter(p=>!t.products.some(q=>q.components.some(c=>c.kind==="product"&&c.ref===p.id)));
  return '<section class="card"><div class="card-h"><div><h3>المنتجات ومكوّناتها</h3><p>كل منتج بتكلفته المتراكمة من مواده الخام (بعد الهدر) ومنتجاته الفرعية وتكاليفه الإضافية، وموردي كل مادة، وعملاء المنتج.</p></div>'+
    '<label class="checkline"><input type="checkbox" data-pt-best'+(best?' checked':'')+'> بأرخص سعر مورد</label></div><div class="card-b pt-tree">'+(tops.length?tops.map(p=>node(p.id,0,[])).join(""):'<p class="hint">لا منتجات بعد — أضف منتجاً أو زامن من الأصناف.</p>')+'</div></section>'+
    (free.length?'<section class="card"><div class="card-h"><div><h3>مواد خام لم تدخل في منتج بعد</h3></div></div><div class="card-b pt-chips">'+free.map(m=>'<i class="pt-chip">'+esc(m.name)+' · '+n2(PT().materialUnitCost(m))+'</i>').join("")+'</div></section>':'');
}
function empty(){return '<section class="card"><div class="card-b sk-empty"><p>الشجرة فارغة لهذه الشركة.</p><div class="sk-actions"><button type="button" class="btn primary" data-pt="sync">استيراد من الأصناف والطلبات</button><button type="button" class="btn" data-pt="add-m">+ مادة خام</button></div></div></section>'}

/* ---------- the table ---------- */
function tableTab(t){
  const inp=(kind,id,f,v,type)=>'<input class="pt-in" data-pt-edit="'+kind+'" data-id="'+esc(id)+'" data-f="'+f+'" value="'+esc(v==null?"":v)+'"'+(type==="n"?' inputmode="decimal"':'')+'>';
  const opts='<option value="">+ مكوّن…</option><optgroup label="مواد خام">'+t.materials.map(m=>'<option value="material|'+esc(m.id)+'">'+esc(m.name)+'</option>').join("")+'</optgroup><optgroup label="منتجات">'+t.products.map(p=>'<option value="product|'+esc(p.id)+'">'+esc(p.name)+'</option>').join("")+'</optgroup>';
  const name=id=>(t.materials.find(m=>m.id===id)||t.products.find(p=>p.id===id)||{name:id}).name;
  return '<section class="card"><div class="card-h"><div><h3>المواد الخام</h3><p>التكلفة لكل وحدة شراء، ونسبة الهدر (ما يُفقد في التجهيز) — التكلفة الفعلية للوحدة الصالحة = التكلفة ÷ (1 − الهدر).</p></div><button type="button" class="btn sm" data-pt="add-m">+ مادة</button></div><div class="card-b sk-table-wrap"><table class="sk-table pt-table"><thead><tr><th>المادة</th><th>الوحدة</th><th>التكلفة</th><th>الهدر %</th><th>التكلفة الفعلية</th><th>الموردون</th><th></th></tr></thead><tbody>'+
    t.materials.map(m=>'<tr><td>'+inp("m",m.id,"name",m.name)+'</td><td>'+inp("m",m.id,"unit",m.unit)+'</td><td>'+inp("m",m.id,"cost",m.cost,"n")+'</td><td>'+inp("m",m.id,"waste",m.waste,"n")+'</td><td class="num">'+n2(PT().materialUnitCost(m))+'</td><td>'+t.suppliers.filter(s=>s.materialId===m.id).map(s=>esc(s.supplier)+' ('+n2(s.price)+')').join("، ")+'</td><td><button type="button" class="btn sm" data-pt-del="'+esc(m.id)+'" aria-label="حذف">×</button></td></tr>').join("")+'</tbody></table></div></section>'+
  '<section class="card"><div class="card-h"><div><h3>المنتجات والبوكسات</h3><p>المكوّنات بكمياتها (مادة خام أو منتج فرعي)، والتكاليف الإضافية للوحدة (تغليف، عمالة، صحون).</p></div><button type="button" class="btn sm" data-pt="add-p">+ منتج</button></div><div class="card-b sk-table-wrap"><table class="sk-table pt-table"><thead><tr><th>المنتج</th><th>السعر</th><th>إضافية</th><th>المكوّنات</th><th>التكلفة</th><th>الهامش</th><th></th></tr></thead><tbody>'+
    t.products.map(p=>{const c=PT().productCost(t,p.id);return '<tr><td>'+inp("p",p.id,"name",p.name)+'</td><td>'+inp("p",p.id,"price",p.price,"n")+'</td><td>'+inp("p",p.id,"overhead",p.overhead,"n")+'</td><td class="pt-comps">'+
      p.components.map(x=>'<span class="pt-chip">'+esc(name(x.ref))+' × <input class="pt-q" data-pt-qty="'+esc(p.id)+'" data-ref="'+esc(x.ref)+'" value="'+x.qty+'" inputmode="decimal"><button type="button" data-pt-unlink="'+esc(p.id)+'" data-ref="'+esc(x.ref)+'" aria-label="إزالة">×</button></span>').join("")+
      '<span class="pt-add"><select data-pt-comp="'+esc(p.id)+'">'+opts+'</select></span></td><td class="num">'+n2(c.total)+'</td><td class="num">'+(c.margin==null?"—":n2(c.margin)+"%")+'</td><td><button type="button" class="btn sm" data-pt-del="'+esc(p.id)+'" aria-label="حذف">×</button></td></tr>'}).join("")+'</tbody></table></div></section>';
}

/* ---------- the arrows ---------- */
const NW=190,NH=54;
function arrowsTab(t){
  const g=PT().graph(t,{focus,width:1200}),W=g.width,mir=x=>W-x,byId=new Map(g.nodes.map(n=>[n.id,n]));
  const kindAr={supplier:"مورد",material:"مادة خام",product:"منتج",customer:"عميل"};
  const edge=e=>{const a=byId.get(e.from),b=byId.get(e.to);if(!a||!b)return"";const ax=mir(a.x),bx=mir(b.x),dir=ax>bx?-1:1;
    const x1=ax+dir*NW/2,x2=bx-dir*NW/2,mx=(x1+x2)/2;
    return '<g class="pt-e '+e.kind+'" data-e-from="'+esc(e.from)+'" data-e-to="'+esc(e.to)+'"><path d="M'+x1+','+a.y+' C'+mx+','+a.y+' '+mx+','+b.y+' '+x2+','+b.y+'" marker-end="url(#pt-arrow)"/>'+(e.label?'<text x="'+mx+'" y="'+((a.y+b.y)/2-6)+'">'+esc(e.label)+'</text>':'')+'</g>'};
  const node=n=>'<g class="pt-g '+n.kind+(linkFrom===n.id?' from':'')+'" data-n="'+esc(n.id)+'" transform="translate('+(mir(n.x)-NW/2)+','+(n.y-NH/2)+')" tabindex="0" role="button" aria-label="'+esc(kindAr[n.kind]+": "+n.label)+'"><rect width="'+NW+'" height="'+NH+'" rx="12"/>'+
    '<text class="l" x="'+(NW-12)+'" y="22">'+esc(n.label.length>22?n.label.slice(0,21)+"…":n.label)+'</text><text class="s" x="'+(NW-12)+'" y="41">'+esc(n.sub)+'</text></g>';
  const cols=[["supplier","الموردون"],["material","المواد الخام"],["product","المنتجات"],["customer","العملاء"]];
  return '<section class="card"><div class="card-h"><div><h3>الأسهم</h3><p>'+(mode==="link"?'<b>رسم سهم:</b> اضغط العقدة الأولى ثم الثانية — مادة ← منتج (الكمية)، مورد ← مادة (السعر، ويُضاف المورد إلى الموردين)، منتج ← منتج (منتج فرعي)، منتج ← عميل.':'اسحب العُقد لترتيبها، واضغط سهماً لحذفه، واختر عقدة للتركيز على ما يتصل بها.')+'</p></div>'+
    '<div class="sk-actions"><div class="sk-seg"><button type="button" data-pt-mode="move" aria-pressed="'+(mode==="move")+'">تحريك</button><button type="button" data-pt-mode="link" aria-pressed="'+(mode==="link")+'">رسم سهم</button></div>'+
    '<select data-pt-focus-sel aria-label="تركيز"><option value="">كل الشجرة</option>'+[...t.products.map(p=>[p.id,"منتج: "+p.name]),...t.materials.map(m=>[m.id,"مادة: "+m.name])].map(([v,l])=>'<option value="'+esc(v)+'"'+(focus===v?' selected':'')+'>'+esc(l)+'</option>').join("")+'</select>'+
    (t.pos&&Object.keys(t.pos).length?'<button type="button" class="btn sm" data-pt="relayout">ترتيب تلقائي</button>':'')+'</div></div>'+
    '<div class="card-b pt-canvas-w"><div class="pt-cols">'+cols.map(([,l])=>'<span>'+l+'</span>').join("")+'</div><svg class="pt-canvas" viewBox="0 0 '+W+' '+g.height+'" width="'+W+'" height="'+g.height+'" role="img" aria-label="شجرة المنتجات بالأسهم">'+
    '<defs><marker id="pt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>'+g.edges.map(edge).join("")+g.nodes.map(node).join("")+'</svg></div></section>';
}
async function linkNodes(a,b){
  let t=get();const kind=id=>id.startsWith("s:")?"supplier":id.startsWith("c:")?"customer":t.products.some(p=>p.id===id)?"product":t.materials.some(m=>m.id===id)?"material":"";
  let [x,y]=[a,b],[kx,ky]=[kind(a),kind(b)];
  const order={supplier:0,material:1,product:2,customer:3};if(order[kx]>order[ky]){[x,y]=[y,x];[kx,ky]=[ky,kx]}
  const nm=id=>(t.materials.find(m=>m.id===id)||t.products.find(p=>p.id===id)||{name:id.slice(2)}).name;
  try{
    if(kx==="material"&&ky==="product"||kx==="product"&&ky==="product"){
      const v=await SK.form("الكمية في «"+nm(y)+"»",[{key:"q",label:"كمية «"+nm(x)+"» في وحدة واحدة من المنتج",type:"number",required:true,min:0,step:"any",value:1}],{ok:"ربط"});if(!v)return;
      t=PT().connect(t,y,x,kx==="product"?"product":"material",v.q);
    }else if(kx==="supplier"&&ky==="material"){
      const m=t.materials.find(z=>z.id===y);const v=await SK.form("سعر «"+x.slice(2)+"» لـ «"+m.name+"»",[{key:"p",label:"سعر الوحدة ("+(m.unit||"كجم")+") قبل الضريبة",type:"number",required:true,min:0,step:"any",value:m.cost||""}],{ok:"ربط وإضافة للموردين"});if(!v)return;
      t=PT().linkSupplier(t,{supplier:x.slice(2),materialId:y,price:v.p,unit:m.unit});registerSupplier(x.slice(2),m.name,v.p,m.unit);toast("رُبط المورد وأضيف سعره إلى قائمة أسعار الموردين","ok");
    }else if(kx==="product"&&ky==="customer"){t=PT().linkCustomer(t,{customer:y.slice(2),productId:x,source:"manual"})}
    else{toast("لا يُرسم سهم بين "+({supplier:"مورد",material:"مادة",product:"منتج",customer:"عميل"}[kx]||"؟")+" و"+({supplier:"مورد",material:"مادة",product:"منتج",customer:"عميل"}[ky]||"؟"),"warn");return}
    put(t);
  }catch(e){toast(e.message==="LOOP"?"هذا السهم يجعل المنتج يحتوي نفسه — مرفوض":e.message,"bad")}
}

/* ---------- cost and analysis ---------- */
function costTab(t){
  const rows=t.products.map(p=>({p,a:PT().productCost(t,p.id),b:PT().productCost(t,p.id,{bestSupplier:true})})).sort((x,y)=>(x.a.margin??999)-(y.a.margin??999));
  const sh=shock.m?PT().priceShock(t,shock.m,Number(shock.pct)||0):[],wu=used?PT().whereUsed(t,used):[];
  const mopts=sel=>'<option value="">اختر مادة…</option>'+t.materials.map(m=>'<option value="'+esc(m.id)+'"'+(sel===m.id?' selected':'')+'>'+esc(m.name)+'</option>').join("");
  return '<section class="card"><div class="card-h"><div><h3>تكلفة كل منتج وهامشه</h3><p>الأضعف هامشاً أولاً. «بأرخص مورد» يعيد الحساب بأقل سعر مورد مسجّل لكل مادة.</p></div></div><div class="card-b sk-table-wrap"><table class="sk-table"><thead><tr><th>المنتج</th><th>المواد</th><th>إضافية</th><th>التكلفة</th><th>السعر</th><th>الربح</th><th>الهامش</th><th>بأرخص مورد</th></tr></thead><tbody>'+
    rows.map(({p,a,b})=>'<tr><td>'+esc(p.name)+'</td><td class="num">'+n2(a.materials)+'</td><td class="num">'+n2(a.overhead)+'</td><td class="num"><b>'+n2(a.total)+'</b></td><td class="num">'+n2(a.price)+'</td><td class="num">'+n2(a.profit)+'</td><td class="num"><span class="sksev '+(a.margin==null?"info":a.margin<0?"bad":a.margin<15?"warn":"ok")+'">'+(a.margin==null?"—":n2(a.margin)+"%")+'</span></td><td class="num">'+n2(b.total)+(b.total<a.total?' <small class="ok">(−'+n2(a.total-b.total)+')</small>':'')+'</td></tr>').join("")+'</tbody></table></div></section>'+
  '<div class="pt-grid"><section class="card"><div class="card-h"><div><h3>ماذا لو تغيّر سعر مادة؟</h3><p>أثر زيادة أو نقص سعر مادة خام على تكلفة كل منتج يستخدمها وهامشه.</p></div></div><div class="card-b"><div class="sk-grid2"><label class="sk-field"><span>المادة</span><select data-pt-shock-m>'+mopts(shock.m)+'</select></label><label class="sk-field"><span>التغير %</span><input data-pt-shock-p inputmode="decimal" value="'+esc(shock.pct)+'"></label></div>'+
    (sh.length?'<table class="sk-table" data-sk-plain><thead><tr><th>المنتج</th><th>التكلفة قبل</th><th>بعد</th><th>الهامش قبل → بعد</th></tr></thead><tbody>'+sh.map(r=>'<tr><td>'+esc(r.product)+'</td><td class="num">'+n2(r.before)+'</td><td class="num">'+n2(r.after)+'</td><td class="num">'+n2(r.marginBefore)+'% → '+n2(r.marginAfter)+'%</td></tr>').join("")+'</tbody></table>':shock.m?'<p class="hint">لا منتج يستخدم هذه المادة.</p>':'')+'</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>أين تُستخدم المادة؟</h3></div></div><div class="card-b"><label class="sk-field"><span>المادة</span><select data-pt-used>'+mopts(used)+'</select></label>'+
    (wu.length?'<table class="sk-table" data-sk-plain><thead><tr><th>المنتج</th><th>الكمية</th><th>المبلغ</th><th>من التكلفة</th></tr></thead><tbody>'+wu.map(r=>'<tr><td>'+esc(r.product)+'</td><td class="num">'+n2(r.qty)+'</td><td class="num">'+n2(r.amount)+'</td><td class="num">'+r.share+'%</td></tr>').join("")+'</tbody></table>':used?'<p class="hint">غير مستخدمة في أي منتج.</p>':'')+'</div></section></div>';
}
function printReport(){
  const t=get(),w=window.open("");if(!w)return toast("تعذر فتح المعاينة","bad");
  const rows=t.products.map(p=>PT().productCost(t,p.id));
  w.document.write('<html dir="rtl"><meta charset="utf-8"><title>تقرير شجرة المنتجات</title><body><h1>تقرير شجرة المنتجات والتكلفة</h1><p>'+t.materials.length+' مادة خام · '+t.products.length+' منتجاً · بتاريخ '+today()+'</p>'+
    rows.map(c=>'<h2>'+esc(c.name)+'</h2><table><thead><tr><th>المكوّن</th><th>الكمية</th><th>تكلفة الوحدة</th><th>المبلغ</th><th>النسبة</th></tr></thead><tbody>'+c.lines.map(l=>'<tr><td>'+esc(l.name)+'</td><td>'+n2(l.qty)+'</td><td>'+n2(l.unitCost)+'</td><td>'+n2(l.amount)+'</td><td>'+l.share+'%</td></tr>').join("")+
      (c.overhead?'<tr><td>تكاليف إضافية</td><td></td><td></td><td>'+n2(c.overhead)+'</td><td></td></tr>':'')+'<tr><td><b>التكلفة الكلية</b></td><td></td><td></td><td><b>'+n2(c.total)+'</b></td><td></td></tr></tbody></table><p>السعر '+n2(c.price)+' · الربح '+n2(c.profit)+' · الهامش '+(c.margin==null?"—":n2(c.margin)+"%")+'</p>').join("")+
    '<h2>المواد الخام</h2><table><thead><tr><th>المادة</th><th>التكلفة</th><th>الهدر</th><th>التكلفة الفعلية</th><th>الموردون</th></tr></thead><tbody>'+t.materials.map(m=>'<tr><td>'+esc(m.name)+'</td><td>'+n2(m.cost)+'</td><td>'+(m.waste||0)+'%</td><td>'+n2(PT().materialUnitCost(m))+'</td><td>'+t.suppliers.filter(s=>s.materialId===m.id).map(s=>esc(s.supplier)+' '+n2(s.price)).join("، ")+'</td></tr>').join("")+'</tbody></table></body></html>');
  w.document.close();SK.brandPrint(w,"تقرير شجرة المنتجات");
}

/* ---------- paint & events ---------- */
function paint(){
  if(!root)return;if(!PT()){root.innerHTML='<div class="sk-empty">محرك الشجرة غير محمّل.</div>';return}
  const t=get();
  root.innerHTML='<div class="pt-shell">'+head(t)+(tab==="table"?tableTab(t):tab==="arrows"?arrowsTab(t):tab==="cost"?costTab(t):treeTab(t))+'</div>';
}
async function addNode(kind){
  let t=get();
  if(kind==="m"){const v=await SK.form("مادة خام جديدة",[{key:"name",label:"الاسم",required:true},{key:"unit",label:"الوحدة",value:"كجم"},{key:"cost",label:"التكلفة للوحدة",type:"number",min:0,step:"any",required:true},{key:"waste",label:"الهدر %",type:"number",min:0,max:95,step:"any",value:0}],{ok:"إضافة"});if(!v)return;t=PT().addMaterial(t,{name:v.name,unit:v.unit||"كجم",cost:v.cost,waste:v.waste||0})}
  else if(kind==="p"){const v=await SK.form("منتج أو بوكس جديد",[{key:"name",label:"الاسم",required:true},{key:"price",label:"سعر البيع",type:"number",min:0,step:"any"},{key:"oh",label:"تكاليف إضافية للوحدة (تغليف، عمالة)",type:"number",min:0,step:"any",value:0}],{ok:"إضافة",message:"ثم اربط مكوّناته من الجدول أو بالأسهم."});if(!v)return;t=PT().addProduct(t,{name:v.name,price:v.price===""?null:v.price,overhead:v.oh||0,components:[]})}
  else{const isS=kind==="s",v=await SK.form(isS?"مورد جديد":"عميل جديد",[{key:"name",label:"الاسم",required:true}],{ok:"إضافة إلى الأسهم",message:isS?"ارسم بعدها سهماً منه إلى المادة التي يوردها بسعرها.":"ارسم بعدها سهماً من المنتج إليه."});if(!v)return;
    t.people=t.people||{};const k=isS?"suppliers":"customers";t.people[k]=[...new Set([...(t.people[k]||[]),v.name])];tab="arrows";mode="link"}
  put(t);paint();
}
function bind(el){
  el.addEventListener("click",async e=>{
    const tb=e.target.closest("[data-pt-tab]");if(tb){tab=tb.dataset.ptTab;linkFrom=null;paint();return}
    const a=e.target.closest("[data-pt]");if(a){const k=a.dataset.pt;
      if(k==="sync")return sync();if(k==="print")return printReport();if(k==="relayout"){const t=get();delete t.pos;put(t);paint();return}
      if(k.startsWith("add-"))return addNode(k.slice(4));}
    const fo=e.target.closest("[data-pt-focus]");if(fo){e.preventDefault();focus=fo.dataset.ptFocus;tab="arrows";paint();return}
    const md=e.target.closest("[data-pt-mode]");if(md){mode=md.dataset.ptMode;linkFrom=null;paint();return}
    const del=e.target.closest("[data-pt-del]");if(del){if(!await SK.confirm("حذف هذا العنصر وكل أسهمه؟",{danger:true,ok:"حذف"}))return;put(PT().removeNode(get(),del.dataset.ptDel));paint();return}
    const un=e.target.closest("[data-pt-unlink]");if(un){put(PT().disconnect(get(),un.dataset.ptUnlink,un.dataset.ref));paint();return}
    const ed=e.target.closest(".pt-e");if(ed&&mode==="move"){const t=get(),f=ed.dataset.eFrom,to=ed.dataset.eTo;if(!await SK.confirm("حذف هذا السهم؟",{ok:"حذف"}))return;
      let n=t;if(t.products.some(p=>p.id===to))n=PT().disconnect(t,to,f);else if(f.startsWith("s:"))n={...t,suppliers:t.suppliers.filter(s=>!(s.supplier===f.slice(2)&&s.materialId===to))};else if(to.startsWith("c:"))n={...t,customers:t.customers.filter(c=>!(c.customer===to.slice(2)&&c.productId===f))};put(n);paint();return}
    const nd=e.target.closest(".pt-g");if(nd&&mode==="link"){const id=nd.dataset.n;if(!linkFrom){linkFrom=id;paint();return}if(linkFrom===id){linkFrom=null;paint();return}const a2=linkFrom;linkFrom=null;await linkNodes(a2,id);paint();return}
  });
  el.addEventListener("change",e=>{
    const x=e.target;
    if(x.matches("[data-pt-best]")){best=x.checked;paint();return}
    if(x.matches("[data-pt-focus-sel]")){focus=x.value;paint();return}
    if(x.matches("[data-pt-shock-m]")){shock.m=x.value;paint();return}
    if(x.matches("[data-pt-shock-p]")){shock.pct=x.value;paint();return}
    if(x.matches("[data-pt-used]")){used=x.value;paint();return}
    if(x.matches("[data-pt-edit]")){const t=get(),list=x.dataset.ptEdit==="m"?t.materials:t.products,it=list.find(z=>z.id===x.dataset.id);if(!it)return;const f=x.dataset.f;
      it[f]=["cost","waste","price","overhead"].includes(f)?(x.value.trim()===""&&f==="price"?null:Number(String(x.value).replace(/[^\d.-]/g,""))||0):x.value.trim();put(t);paint();return}
    if(x.matches("[data-pt-qty]")){try{put(PT().connect(get(),x.dataset.ptQty,x.dataset.ref,get().products.some(p=>p.id===x.dataset.ref)?"product":"material",Number(x.value)||0))}catch(err){toast("مرفوض: "+err.message,"bad")}paint();return}
    if(x.matches("[data-pt-comp]")&&x.value){const [kind,ref]=x.value.split("|");try{put(PT().connect(get(),x.dataset.ptComp,ref,kind,1))}catch(err){toast(err.message==="LOOP"?"هذا المكوّن يجعل المنتج يحتوي نفسه — مرفوض":err.message,"bad")}paint();return}
  });
  /* dragging nodes on the canvas (move mode) */
  let drag=null;
  el.addEventListener("pointerdown",e=>{const nd=e.target.closest(".pt-g");if(!nd||mode!=="move")return;const svg=nd.ownerSVGElement,pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());
    const m=/translate\(([-\d.]+),([-\d.]+)\)/.exec(nd.getAttribute("transform"));drag={nd,svg,id:nd.dataset.n,ox:p.x-(+m[1]),oy:p.y-(+m[2]),moved:false};nd.setPointerCapture&&nd.setPointerCapture(e.pointerId)});
  el.addEventListener("pointermove",e=>{if(!drag)return;const pt=drag.svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(drag.svg.getScreenCTM().inverse());drag.x=p.x-drag.ox;drag.y=p.y-drag.oy;drag.moved=true;drag.nd.setAttribute("transform","translate("+drag.x+","+drag.y+")")});
  el.addEventListener("pointerup",()=>{if(!drag)return;const d=drag;drag=null;if(!d.moved)return;const t=get(),W=1200;t.pos=t.pos||{};t.pos[d.id]={x:Math.round(W-(d.x+NW/2)),y:Math.round(d.y+NH/2)};put(t);paint()});
}
function render(el){root=el;paint();bind(el);if(!get().materials.length&&!get().products.length)sync(true)}
SK.view("ptree",{render});
window.SKosifProductTree=Object.freeze({get,sync,print:printReport});
})();

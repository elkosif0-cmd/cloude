/* SQC core — the helper tools' records as one graph (SK.pricing, SK.graph).
   SK.pricing writes the pricing record (items, boxes and their make-up, expenses) the way a second tab of
   the base app would: it saves the record with a newer stamp and announces it on the base app's own tab
   channel, so the base app takes the new record at once (no reload) and every screen recomputes.
   SK.graph reads what the company holds — raw items, boxes, suppliers (deliveries, purchase orders, price
   lists, the master list), customers and their orders, stock, expenses — and the links between them. The
   link map (خريطة الربط) draws them, and writes through here when an arrow means a record. */
(()=>{
"use strict";
const {load,save}=SK;
const PRICING="aghnam-pricing-v3",MASTER="aghnam-v15-master-lists",PURCH="skosif_purchasing_v1",BATCH="skosif_v31_supplier_batches",INV="aghnam_v29_inventory",APPDB="aghnam-app-v7";
const K=s=>String(s||"").trim().replace(/\s+/g," ").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").toLowerCase();
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};

/* ---------- the pricing record ---------- */
function getP(){return load(PRICING,null)}
/* the base app says «updated from a newer copy on this device» when it takes the record: here it is our own
   write, so that note is dropped (the caller says what changed) */
const SYNC_NOTE="تم تحديث هذا التبويب";
function announce(updated){
  let mo=null;
  try{mo=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1&&String(n.textContent||"").includes(SYNC_NOTE)&&String(n.textContent).length<120)n.remove()})));mo.observe(document.body,{childList:true,subtree:true})}catch{}
  try{const bc=new BroadcastChannel("aghnam-v19-tabs");bc.postMessage({type:"state-saved",updated,tab:"sk-graph",at:Date.now()});setTimeout(()=>bc.close(),200)}catch{}
  setTimeout(()=>{try{mo&&mo.disconnect()}catch{}},1500);
}
/* fn(record) edits the record in place; returns whatever fn returns */
function mutate(fn,why){
  const st=getP();if(!st||!Array.isArray(st.raws))throw new Error("افتح «الأصناف والأسعار» مرة ثم أعد المحاولة");
  st.boxes=st.boxes||[];st.exps=st.exps||[];st.seq=st.seq||{};
  const out=fn(st);
  const updated=Math.max(Date.now(),num(st.meta&&st.meta.updated)+1);
  st.meta={...(st.meta||{}),updated};
  save(PRICING,st);announce(updated);
  SK.audit&&SK.audit.log("pricing",{act:why||"link-map"});
  SK.bus&&SK.bus.emit("pricing",{why});
  return out;
}
const nextId=(st,list,prefix,seqKey)=>{const n=Math.max(num(st.seq[seqKey]),...list.map(x=>num(String(x.id).replace(/\D/g,"")))) +1;st.seq[seqKey]=n;return prefix+n};
const nextCode=list=>Math.max(0,...list.map(x=>num(x.code)))+1;
const pricing=Object.freeze({
  get:getP,mutate,
  addRaw(o){return mutate(st=>{const ex=st.raws.find(r=>K(r.name)===K(o.name));if(ex)return ex.id;const id=nextId(st,st.raws,"r","raw");
    st.raws.push({id,code:nextCode(st.raws),name:String(o.name).trim(),cat:o.cat||"عام",buy:num(o.buy),vat:o.vat||"incl",waste:num(o.waste),price:num(o.price),kind:o.kind||"main",unit:o.unit||"كجم",src:"link-map"});return id},"add-raw")},
  addBox(o){return mutate(st=>{const ex=st.boxes.find(b=>K(b.name)===K(o.name));if(ex)return ex.id;const id=nextId(st,st.boxes,"b","box");
    st.boxes.push({id,code:nextCode(st.boxes),name:String(o.name).trim(),cat:o.cat||"عام",price:num(o.price),dishes:num(o.dishes),dishCost:0,comps:[],ohs:[],src:"link-map"});return id},"add-box")},
  addExpense(o){return mutate(st=>{const id=nextId(st,st.exps,"e","exp");st.exps.push({id,name:String(o.name).trim(),amt:num(o.amt),method:o.method||"fixed",vat:o.vat||"none",links:[],note:""});return id},"add-expense")},
  /* the make-up of a box: q of a raw item (kg) or of another box */
  setComp(boxId,t,id,q){return mutate(st=>{const b=st.boxes.find(x=>String(x.id)===String(boxId));if(!b)throw new Error("البوكس غير موجود");
    if(t==="box"&&(String(id)===String(boxId)||reaches(st,id,boxId)))throw new Error("لا يمكن: البوكس سيحتوي نفسه");
    b.comps=b.comps||[];const c=b.comps.find(x=>(x.t||"raw")===t&&String(x.id)===String(id));if(c)c.q=num(q);else b.comps.push({t,id:String(id),q:num(q)});return b.id},"box-comp")},
  dropComp(boxId,t,id){return mutate(st=>{const b=st.boxes.find(x=>String(x.id)===String(boxId));if(b)b.comps=(b.comps||[]).filter(x=>!((x.t||"raw")===t&&String(x.id)===String(id)))},"box-comp-remove")},
  linkExpense(expId,boxId,on){return mutate(st=>{const e=st.exps.find(x=>String(x.id)===String(expId));if(!e)throw new Error("المصروف غير موجود");e.links=(e.links||[]).filter(x=>String(x)!==String(boxId));if(on)e.links.push(String(boxId))},"expense-link")},
  setRaw(id,patch){return mutate(st=>{const r=st.raws.find(x=>String(x.id)===String(id));if(!r)throw new Error("الصنف غير موجود");Object.assign(r,patch)},"raw-edit")},
  setBox(id,patch){return mutate(st=>{const b=st.boxes.find(x=>String(x.id)===String(id));if(!b)throw new Error("البوكس غير موجود");Object.assign(b,patch)},"box-edit")}
});
function reaches(st,from,target,seen=new Set()){
  if(seen.has(String(from)))return false;seen.add(String(from));
  const b=st.boxes.find(x=>String(x.id)===String(from));if(!b)return false;
  return (b.comps||[]).some(c=>c.t==="box"&&(String(c.id)===String(target)||reaches(st,c.id,target,seen)));
}

/* ---------- suppliers ---------- */
function supplierRows(){
  const m=load(MASTER,null)||{},pur=load(PURCH,{})||{},bat=load(BATCH,[])||[];
  const by=new Map();const get=n=>{const k=K(n);if(!k)return null;if(!by.has(k))by.set(k,{name:String(n).trim(),phone:"",items:new Map(),deliveries:0,orders:0});return by.get(k)};
  const item=(s,name,price,unit,from,src)=>{if(!s||!name)return;const k=K(name),cur=s.items.get(k);if(!cur||String(from||"")>=String(cur.from||""))s.items.set(k,{name:String(name).trim(),price:num(price),unit:unit||"كجم",from:from||"",src})};
  (m.suppliers||[]).forEach(x=>{const s=get(typeof x==="string"?x:x&&x.name);if(s&&x&&x.phone)s.phone=x.phone});
  bat.forEach(b=>{const s=get(b.supplier);if(!s)return;s.deliveries++;item(s,b.itemName,b.vatIncl?num(b.priceGross)/1.15:b.priceGross,"كجم",b.date,"delivery")});
  (pur.orders||[]).forEach(o=>{const s=get(o.supplier);if(!s)return;s.orders++;(o.lines||[]).forEach(l=>item(s,l.item,l.cost,"كجم",o.date,"order"))});
  (pur.prices||[]).forEach(p=>{const s=get(p.supplier);item(s,p.item,p.price,p.unit,p.from||"9999","price")});
  return [...by.values()].map(s=>({...s,items:[...s.items.values()]}));
}
/* a supplier supplies an item at a price: the price list gets the line, the master list the supplier (added when new) */
function linkSupplier(o){
  const name=String(o.supplier||"").trim(),itemName=String(o.item||"").trim();if(!name||!itemName)throw new Error("المورد والصنف مطلوبان");
  const m=load(MASTER,null)||{currencies:[],suppliers:[]};m.suppliers=Array.isArray(m.suppliers)?m.suppliers:[];
  if(!m.suppliers.some(x=>K(typeof x==="string"?x:x&&x.name)===K(name))){m.suppliers.push({name,phone:o.phone||"",addedFrom:"link-map",at:new Date().toISOString()});save(MASTER,m)}
  if(o.price!=null&&o.price!==""){
    const pur=load(PURCH,{})||{};pur.prices=Array.isArray(pur.prices)?pur.prices:[];
    const today=new Date().toISOString().slice(0,10);
    pur.prices.forEach(p=>{if(K(p.supplier)===K(name)&&K(p.item)===K(itemName)&&!p.to&&String(p.from||"")<today)p.to=today});
    const same=pur.prices.find(p=>K(p.supplier)===K(name)&&K(p.item)===K(itemName)&&!p.to);
    if(same)Object.assign(same,{price:num(o.price),unit:o.unit||same.unit||"كجم"});
    else pur.prices.push({id:"lm-"+Date.now().toString(36),supplier:name,item:itemName,price:num(o.price),unit:o.unit||"كجم",from:today,to:"",src:"link-map"});
    save(PURCH,pur);
  }
  if(o.rawId&&o.useAsBuy&&o.price!=null&&o.price!=="")pricing.setRaw(o.rawId,{buy:num(o.price),vat:"excl",supplier:name});
  else if(o.rawId&&o.primary)pricing.setRaw(o.rawId,{supplier:name});
  SK.audit&&SK.audit.log("suppliers",{act:"link",supplier:name,item:itemName});
  return name;
}
function unlinkSupplier(o){
  const pur=load(PURCH,{})||{};if(!Array.isArray(pur.prices))return;
  const today=new Date().toISOString().slice(0,10);
  pur.prices.forEach(p=>{if(K(p.supplier)===K(o.supplier)&&K(p.item)===K(o.item)&&!p.to)p.to=today});save(PURCH,pur);
}
function addSupplier(name,phone){
  const m=load(MASTER,null)||{currencies:[],suppliers:[]};m.suppliers=Array.isArray(m.suppliers)?m.suppliers:[];
  if(!m.suppliers.some(x=>K(typeof x==="string"?x:x&&x.name)===K(name))){m.suppliers.push({name:String(name).trim(),phone:phone||"",addedFrom:"link-map",at:new Date().toISOString()});save(MASTER,m)}
  return String(name).trim();
}

/* ---------- customers and what they bought (the base app's database) ---------- */
function openApp(){return new Promise(res=>{if(!("indexedDB" in window))return res(null);let r;try{r=indexedDB.open(APPDB)}catch{return res(null)}r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);r.onupgradeneeded=()=>{}})}
async function all(store){const db=await openApp();if(!db||!db.objectStoreNames.contains(store)){db&&db.close();return[]}const out=await new Promise(res=>{const q=db.transaction(store).objectStore(store).getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])});db.close();return out}
let salesCache=null,salesAt=0;
/* one pass over the orders: per product (raw/box id, through the sales aliases), its buyers */
async function sales(){
  if(salesCache&&Date.now()-salesAt<30000)return salesCache;
  const st=getP()||{raws:[],boxes:[],salesAliases:[]};
  const byName=new Map();(st.raws||[]).forEach(r=>byName.set(K(r.name),{t:"raw",id:String(r.id)}));(st.boxes||[]).forEach(b=>byName.set(K(b.name),{t:"box",id:String(b.id)}));
  const isBox=new Set((st.boxes||[]).map(b=>String(b.id)));
  (st.salesAliases||[]).forEach(a=>{if(a&&a.salesName&&a.itemId)byName.set(K(a.salesName),{t:isBox.has(String(a.itemId))?"box":"raw",id:String(a.itemId)})});
  const [orders,items,customers]=await Promise.all([all("orders"),all("order_items"),all("customers")]);
  const oById=new Map(orders.map(o=>[String(o.id),o])),cById=new Map(customers.map(c=>[String(c.id),c]));
  const prod=new Map();/* "raw:r1" → {qty,amount,orders,buyers:Map(customerId→{qty,amount,orders})} */
  items.forEach(i=>{
    const hit=byName.get(K(i.productName||i.descriptionOriginal));if(!hit)return;
    const o=oById.get(String(i.orderId));const cid=String((o&&o.customerId)||"");
    const key=hit.t+":"+hit.id;if(!prod.has(key))prod.set(key,{qty:0,amount:0,orders:0,buyers:new Map()});
    const p=prod.get(key);p.qty+=num(i.qty);p.amount+=num(i.amount);p.orders++;
    if(cid){if(!p.buyers.has(cid))p.buyers.set(cid,{id:cid,name:(o&&o.customerName)||((cById.get(cid)||{}).name)||cid,city:(o&&o.city)||"",district:(o&&o.district)||"",qty:0,amount:0,orders:0});const b=p.buyers.get(cid);b.qty+=num(i.qty);b.amount+=num(i.amount);b.orders++}
  });
  salesCache={prod,customers,cById,orders:orders.length};salesAt=Date.now();
  return salesCache;
}
async function buyersOf(t,id,limit=8){const s=await sales(),p=s.prod.get(t+":"+id);if(!p)return{qty:0,amount:0,orders:0,buyers:[]};return{qty:p.qty,amount:p.amount,orders:p.orders,buyers:[...p.buyers.values()].sort((a,b)=>b.amount-a.amount).slice(0,limit)}}
async function boughtBy(cid,limit=10){
  const s=await sales(),st=getP()||{raws:[],boxes:[]},out=[];
  s.prod.forEach((p,key)=>{const b=p.buyers.get(String(cid));if(!b)return;const [t,id]=key.split(":");const rec=(t==="box"?st.boxes:st.raws).find(x=>String(x.id)===id);if(rec)out.push({t,id,name:rec.name,qty:b.qty,amount:b.amount,orders:b.orders})});
  return out.sort((a,b)=>b.amount-a.amount).slice(0,limit);
}
function stockOf(name){const inv=load(INV,[])||[];return inv.find(r=>K(r.item)===K(name))||null}

/* ---------- everything, for pickers ---------- */
async function entities(){
  const st=getP()||{raws:[],boxes:[],exps:[]},cat=(()=>{try{return(window.SKosifCore&&SKosifCore.catalog().items)||[]}catch{return[]}})();
  const cost=new Map(cat.map(c=>[c.kind+":"+c.id,c]));
  const s=await sales().catch(()=>({customers:[]}));
  return{
    raw:(st.raws||[]).filter(r=>r.status!=="archived").map(r=>({t:"raw",id:String(r.id),name:r.name,sub:[r.cat,num(r.buy)?"شراء "+num(r.buy):"",num(r.waste)?"هدر "+num(r.waste)+"٪":""].filter(Boolean).join(" · "),rec:r,calc:cost.get("raw:"+r.id)||null})),
    box:(st.boxes||[]).filter(b=>b.status!=="archived").map(b=>({t:"box",id:String(b.id),name:b.name,sub:[b.cat,(b.comps||[]).length+" مكوّن",num(b.price)?"سعر "+num(b.price):""].filter(Boolean).join(" · "),rec:b,calc:cost.get("box:"+b.id)||null})),
    supplier:supplierRows().map(x=>({t:"supplier",id:x.name,name:x.name,sub:x.items.length+" صنف"+(x.deliveries?" · "+x.deliveries+" شحنة":""),rec:x})),
    customer:(s.customers||[]).map(c=>({t:"customer",id:String(c.id),name:c.name,sub:[c.city,c.district,num(c.summaryOrders)?num(c.summaryOrders)+" طلب":""].filter(Boolean).join(" · "),rec:c})),
    expense:(st.exps||[]).map(e=>({t:"expense",id:String(e.id),name:e.name,sub:num(e.amt)+(e.method==="pct"?"٪":" ر.س")+" · "+(e.links||[]).length+" بوكس",rec:e})),
    stock:(load(INV,[])||[]).map(r=>({t:"stock",id:K(r.item),name:r.item,sub:"رصيد "+num(r.stock)+(r.status?" · "+r.status:""),rec:r}))
  };
}
/* the direct neighbours of a record, with the relation each one holds */
async function neighbours(t,id){
  const st=getP()||{raws:[],boxes:[],exps:[]},out=[];
  const raw=x=>st.raws.find(r=>String(r.id)===String(x)),box=x=>st.boxes.find(b=>String(b.id)===String(x));
  if(t==="box"){const b=box(id);if(b){
    (b.comps||[]).forEach(c=>{const r=(c.t==="box"?box(c.id):raw(c.id));if(r)out.push({t:c.t==="box"?"box":"raw",id:String(c.id),name:r.name,rel:"comp",dir:"in",q:num(c.q)})});
    (st.exps||[]).filter(e=>(e.links||[]).map(String).includes(String(id))).forEach(e=>out.push({t:"expense",id:String(e.id),name:e.name,rel:"charge",dir:"in"}));
    st.boxes.filter(x=>(x.comps||[]).some(c=>c.t==="box"&&String(c.id)===String(id))).forEach(x=>out.push({t:"box",id:String(x.id),name:x.name,rel:"comp",dir:"out",q:num(((x.comps||[]).find(c=>c.t==="box"&&String(c.id)===String(id))||{}).q)}));
    const s=stockOf(b.name);if(s)out.push({t:"stock",id:K(s.item),name:s.item,rel:"stock",dir:"out",derived:true});
    (await buyersOf("box",id)).buyers.forEach(c=>out.push({t:"customer",id:c.id,name:c.name,rel:"bought",dir:"out",derived:true,qty:c.qty,amount:c.amount}));
  }}
  else if(t==="raw"){const r=raw(id);if(r){
    st.boxes.filter(b=>(b.comps||[]).some(c=>(c.t||"raw")==="raw"&&String(c.id)===String(id))).forEach(b=>out.push({t:"box",id:String(b.id),name:b.name,rel:"comp",dir:"out",q:num(((b.comps||[]).find(c=>(c.t||"raw")==="raw"&&String(c.id)===String(id))||{}).q)}));
    supplierRows().forEach(s=>{const it=s.items.find(i=>K(i.name)===K(r.name));if(it)out.push({t:"supplier",id:s.name,name:s.name,rel:"supplies",dir:"in",price:it.price,unit:it.unit,derived:it.src!=="price"})});
    const s=stockOf(r.name);if(s)out.push({t:"stock",id:K(s.item),name:s.item,rel:"stock",dir:"out",derived:true});
    (await buyersOf("raw",id)).buyers.forEach(c=>out.push({t:"customer",id:c.id,name:c.name,rel:"bought",dir:"out",derived:true,qty:c.qty,amount:c.amount}));
  }}
  else if(t==="supplier"){const s=supplierRows().find(x=>K(x.name)===K(id));if(s)s.items.forEach(i=>{const r=st.raws.find(x=>K(x.name)===K(i.name));if(r)out.push({t:"raw",id:String(r.id),name:r.name,rel:"supplies",dir:"out",price:i.price,unit:i.unit,derived:i.src!=="price"})})}
  else if(t==="customer"){(await boughtBy(id)).forEach(p=>out.push({t:p.t,id:p.id,name:p.name,rel:"bought",dir:"in",derived:true,qty:p.qty,amount:p.amount}))}
  else if(t==="expense"){const e=(st.exps||[]).find(x=>String(x.id)===String(id));if(e)(e.links||[]).forEach(bid=>{const b=box(bid);if(b)out.push({t:"box",id:String(b.id),name:b.name,rel:"charge",dir:"out"})})}
  else if(t==="stock"){const r=st.raws.find(x=>K(x.name)===K(id))||st.boxes.find(x=>K(x.name)===K(id));if(r)out.push({t:st.raws.includes(r)?"raw":"box",id:String(r.id),name:r.name,rel:"stock",dir:"in",derived:true})}
  return out;
}
SK.pricing=pricing;
SK.graph=Object.freeze({key:K,entities,neighbours,suppliers:supplierRows,linkSupplier,unlinkSupplier,addSupplier,buyersOf,boughtBy,stockOf,sales,invalidate:()=>{salesCache=null}});
})();

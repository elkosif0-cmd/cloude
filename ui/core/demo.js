/* S.kosif core — البيانات التجريبية (SK.demo).
   كل قسم فارغ يمكن أن يعمل ببيانات تجريبية لشركة وهمية («شركة الوادي التجريبية للحوم») حتى يُرى
   كل شيء يعمل: الكتالوج والتسعير، العملاء والمبيعات والطلبات، الموردون والمشتريات، المخزون والتتبع،
   الآجل والمتابعة، الدفاتر المحاسبية، المخاطر والمهام والقرارات، وملف المراجعة من الدفاتر نفسها.
   القواعد:
   • لا يكتب فوق بيانات حقيقية أبداً: يملأ القسم الفارغ فقط.
   • كل سجل تجريبي معلَّم (demo:true) ويُمسح وحده بضغطة — تبقى السجلات التي أضفتها أنت.
   • الجهاز الجديد تماماً (لا كتالوج ولا مبيعات ولا دفاتر) يُملأ تلقائياً مرة واحدة ثم يعيد التحميل؛
     الجهاز الذي فيه بيانات يعرض شريطاً يقترح ملء الأقسام الفارغة، ولا يملأ شيئاً دون موافقتك.
   • الأرقام من محركات التطبيق نفسها (قيود المبيعات والاستلام وفحص الاستلام) فلا تختلف عن الإدخال اليدوي.
   السجل: skosif_demo_v1 {sections:{id:at}, at, off, dismissed}. */
(()=>{
"use strict";
const {load,save,esc,toast}=SK;
const REG="skosif_demo_v1";
const reg=()=>Object.assign({sections:{},at:null,off:false,dismissed:false},load(REG,{}));
const setReg=r=>save(REG,r);
const DAY=864e5,iso=d=>new Date(d).toISOString().slice(0,10),ago=n=>iso(Date.now()-n*DAY),nowIso=()=>new Date().toISOString();
const Y=new Date().getFullYear();
let s0=20260926;const rnd=()=>{s0=(Math.imul(s0,1664525)+1013904223)>>>0;return s0/4294967296};
const pick=a=>a[Math.floor(rnd()*a.length)],between=(a,b)=>a+rnd()*(b-a),r2=v=>Math.round(v*100)/100,int=(a,b)=>Math.floor(between(a,b+1));
const phone=i=>"05000000"+String(i%100).padStart(2,"0"),intl=p=>"966"+p.slice(1);
const norm=s=>String(s||"").replace(/[ً-ٰٟ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/\s+/g," ").trim().toLowerCase();
const D=o=>({...o,demo:true});
const E=()=>window.SKEngines;

/* ---------- the demo company's catalogue (same shape as the pricing engine's) ---------- */
const RAWS=[["r1","نعيمي طازج","أغنام",52,"incl",8,69,"main"],["r2","حري طازج","أغنام",64,"excl",0,82,"main"],["r3","سواكني","أغنام",58,"excl",0,76,"main"],
  ["r4","تيس بلدي","ماعز",61,"incl",6,79,"main"],["r5","عجل طازج","أبقار",44,"excl",3,59,"main"],["r6","مفروم بقري","مفروم",38,"incl",2,52,"main"],
  ["r7","مفروم غنم","مفروم",47,"incl",2,62,"main"],["r8","كبدة غنم","مخلفات",28,"incl",0,39,"main"],["r9","لية نعيمي","دهون",18,"incl",0,26,"by"],
  ["r10","مقادم غنم","مشتقات",17,"excl",0,32,"main"],["r11","برجر بقري","مصنعات",33,"incl",0,49,"main"],["r12","سجق عجل","مصنعات",31,"incl",0,46,"main"]];
const BOXES=[["b1","بوكس النعيمي العائلي","بوكسات عائلية",329,12,[["r1",4],["r8",.5]],[["o1","تغليف وصحون",12,"incl"]]],
  ["b2","بوكس المفروم الاقتصادي","بوكسات اقتصادية",219,10,[["r6",3],["r7",1]],[["o2","تغليف مفرغ",8,"incl"]]],
  ["b3","بوكس الحري VIP","بوكسات فاخرة",459,16,[["r2",5],["r10",1]],[["o3","صندوق فاخر",18,"incl"]]],
  ["b4","بوكس الشواء","بوكسات مشكلة",239,10,[["r5",2],["r11",1],["r12",1]],[["o4","تغليف وصحون",10,"incl"]]],
  ["b5","بوكس التوفير","بوكسات اقتصادية",179,8,[["r6",2],["r5",1.5]],[["o5","تغليف",6,"incl"]]]];
const EXPS=[["e1","توصيل مبرد للعميل",15,"fixed","none"],["e2","صحون وتغليف مفرغ",10,"fixed","incl"],["e3","خلطة بهارات وتتبيل",6,"fixed","incl"],["e4","جل ثلجي للنقل",5,"fixed","incl"]];
const PRODUCTS=[...RAWS.filter(r=>r[7]==="main").map(r=>({name:r[1],price:r[6],unit:"كجم",kg:[1,3]})),...BOXES.map(b=>({name:b[1],price:b[3],unit:"بوكس",kg:[1,2]}))];
const FIRST=["عبدالله","محمد","فهد","خالد","سلمان","نورة","سارة","ريم","عبدالعزيز","تركي","ماجد","هند","لمى","فيصل","يوسف","منيرة","بندر","عمر"];
const LAST=["الحربي","العتيبي","القحطاني","الشهري","الغامدي","الزهراني","المطيري","الدوسري","السبيعي","العنزي","الشمري","البقمي"];
const CITIES=[["الرياض",["العليا","الملقا","النرجس","الياسمين"]],["جدة",["الروضة","السلامة","الحمراء"]],["الدمام",["الشاطئ","الفيصلية"]],["مكة المكرمة",["العزيزية","الشوقية"]],["الخبر",["العقربية"]],["المدينة المنورة",["قباء"]]];
const CHANNELS=["المتجر","المعرض","التطبيق","مبيعات الجملة"],PAY=["مدى","نقدي","تحويل بنكي","آجل"];
const RESTAURANTS=["مطعم الديرة للمشويات","مطبخ الضيافة الملكية","مطعم نجد الأصيل","مطاعم سفرة الخير","مطعم البحر الأحمر"];

/* ---------- IndexedDB of the core (customers, sales, orders) ---------- */
const DBN="aghnam-app-v7",DBV=4,STORES=["meta","customers","sales_lines","sales_descriptions","imports","import_errors","pricing_snapshots","orders","order_items","payments","ops_orders","customer_master_rows"];
function idb(){return new Promise((res,rej)=>{let q;try{q=indexedDB.open(DBN,DBV)}catch(e){return rej(e)}
  q.onupgradeneeded=()=>{const db=q.result;STORES.forEach(n=>{if(!db.objectStoreNames.contains(n))db.createObjectStore(n,{keyPath:n==="meta"?"key":"id"})})};
  q.onsuccess=()=>res(q.result);q.onerror=()=>{/* a newer schema: open at its own version */const q2=indexedDB.open(DBN);q2.onsuccess=()=>res(q2.result);q2.onerror=()=>rej(q2.error)}})}
async function idbCount(stores){try{const db=await idb();const n=await Promise.all(stores.filter(s=>db.objectStoreNames.contains(s)).map(s=>new Promise(r=>{const q=db.transaction(s).objectStore(s).count();q.onsuccess=()=>r(q.result);q.onerror=()=>r(0)})));db.close();return n.reduce((a,b)=>a+b,0)}catch{return 0}}
async function idbPut(map){const db=await idb();await new Promise((res,rej)=>{const names=Object.keys(map).filter(s=>db.objectStoreNames.contains(s));if(!names.length)return res();const t=db.transaction(names,"readwrite");
  names.forEach(s=>map[s].forEach(r=>t.objectStore(s).put(r)));t.oncomplete=res;t.onerror=()=>rej(t.error)});db.close()}
async function idbClearDemo(stores){const db=await idb();await new Promise(res=>{const names=stores.filter(s=>db.objectStoreNames.contains(s));if(!names.length)return res();const t=db.transaction(names,"readwrite");
  names.forEach(s=>{const c=t.objectStore(s).openCursor();c.onsuccess=()=>{const cur=c.result;if(!cur)return;const v=cur.value;if(v&&(v.demo===true||(s==="meta"&&v.key==="dataset"&&v.value&&v.value.demo)))cur.delete();cur.continue()}});t.oncomplete=res;t.onerror=res});db.close()}

/* ---------- helpers for localStorage sections ---------- */
const arr=k=>{const v=load(k,[]);return Array.isArray(v)?v:[]};
const dropDemo=list=>(Array.isArray(list)?list:[]).filter(x=>!(x&&x.demo));
const months=n=>Array.from({length:n},(_,i)=>{const d=new Date();d.setDate(12);d.setMonth(d.getMonth()-(n-1-i));return d});

/* the whole demo dataset is generated once per call (deterministic) so the sections agree with each other */
function build(){
  s0=20260926;
  const customers=Array.from({length:36},(_,i)=>{const [city,ds]=pick(CITIES),p=phone(i);return{i,name:FIRST[i%FIRST.length]+" "+LAST[(i*5)%LAST.length],phone:p,city,district:pick(ds),source:pick(CHANNELS)}});
  const orders=[];let n=1;
  months(12).forEach((m,mi)=>{const count=16+mi+int(0,6);for(let k=0;k<count;k++){
    const day=int(1,28),d=new Date(m.getFullYear(),m.getMonth(),day);if(d>new Date())continue;
    const c=customers[Math.floor(Math.pow(rnd(),1.6)*customers.length)],items=Array.from({length:int(1,3)},()=>{const p=pick(PRODUCTS),q=p.unit==="كجم"?int(2,8):1;return{name:p.name,qty:q,unitPrice:p.price,amount:r2(q*p.price)}});
    const subtotal=r2(items.reduce((a,x)=>a+x.amount,0)),shipping=c.source==="التطبيق"?25:0,total=r2(subtotal+shipping),canceled=rnd()<.03;
    orders.push({n:n++,date:iso(d),c,items,subtotal,shipping,total,channel:c.source==="مبيعات الجملة"?"مبيعات الجملة":pick(CHANNELS.slice(0,3)),pay:pick(PAY),canceled,paid:rnd()<.86});
  }});
  return{customers,orders};
}

/* ---------- the sections ---------- */
const SECTIONS=[
{id:"company",label:"الشركة والفترات",caps:["companies"],
  empty:async()=>!(load("skosif_companies_v1",{}).companies||[]).length,
  seed:async()=>{const W=E().reports.sampleCompany&&E().reports.sampleCompany.WAHA_COMPANY;
    save("skosif_companies_v1",{companies:[D({id:"demo-co",name:"شركة الوادي التجريبية للحوم",country:"SA",currency:"SAR"}),...(W?[D({id:W.id,name:W.name,country:W.country,currency:W.currency})]:[])],
    periods:[D({id:"demo-p1",companyId:"demo-co",label:String(Y),startDate:Y+"-01-01",endDate:Y+"-12-31"}),D({id:"demo-p0",companyId:"demo-co",label:String(Y-1),startDate:(Y-1)+"-01-01",endDate:(Y-1)+"-12-31"}),
      ...(W?W.periods.map(p=>D({...p,companyId:W.id})):[])],
    active:{companyId:"demo-co",periodId:"demo-p1"}})},
  clear:async()=>{const d=load("skosif_companies_v1",{});if(!d.companies)return;d.companies=dropDemo(d.companies);d.periods=dropDemo(d.periods);if(d.active&&!d.companies.some(c=>c.id===d.active.companyId))d.active=d.companies[0]?{companyId:d.companies[0].id}:{};save("skosif_companies_v1",d)}},

{id:"catalog",label:"الأصناف والبوكسات والتسعير",caps:["catalog","sim","builder","memo","labels","finance","risklab","carcass","nrv","yieldlab","blending","compare","analyzer","kernel"],reload:true,
  empty:async()=>{const c=window.SKosifCore&&SKosifCore.catalog();const st=load("aghnam-pricing-v3",null);return !(c&&c.items&&c.items.length)&&!(st&&Array.isArray(st.raws)&&st.raws.length)},
  seed:async()=>{
    const st=load("aghnam-pricing-v3",null)||{v:8,settings:{vat:15,waste:"yield",base:"gross",show:"incl",target:25,excellent:25,good:15,round:"nine",biz:"شركة الوادي التجريبية للحوم",preparer:"فريق التسعير",logo:"",vatNo:"",crNo:"",phone:"",addr:"",vatReviewed:false,sv:4},
      memo:{ref:"APPR-"+Y+"-001",date:ago(0),reason:"",items:[],sign:{prepName:"فريق التسعير",prepNotes:"",finName:"",finNotes:"",decision:"approved",execName:"",execNotes:""}},memos:[],log:[],snaps:[],reps:{prefs:{},seq:0,log:[]},salesAliases:[],meta:{created:nowIso(),updated:0,source:"demo"}};
    st.raws=RAWS.map(([id,name,cat,buy,vat,waste,price,kind],i)=>D({id,code:i+1,name,cat,buy,vat,waste,price,kind}));
    st.boxes=BOXES.map(([id,name,cat,price,dishes,comps,ohs],i)=>D({id,code:i+1,name,cat,price,dishes,dishCost:0,comps:comps.map(([rid,q])=>({t:"raw",id:rid,q})),ohs:ohs.map(([oid,label,amt,vat])=>({id:oid,label,amt,vat}))}));
    st.exps=EXPS.map(([id,name,amt,method,vat])=>D({id,name,amt,method,vat,links:[],note:""}));
    st.seq=Object.assign({raw:26,box:27,exp:4,oh:4,memo:1,cat:0,ph:0,alias:0},st.seq||{},{raw:Math.max(26,RAWS.length),box:Math.max(27,BOXES.length),exp:Math.max(4,EXPS.length),oh:Math.max(4,BOXES.length)});
    /* the demo sales descriptions linked to the catalogue (as «مركز ربط المنتجات» does), so margins and yields use real costs */
    st.salesAliases=dropDemo(st.salesAliases);let sa=(st.seq&&st.seq.alias)||0;
    [...RAWS.map(r=>[r[1],r[0]]),...BOXES.map(b=>[b[1],b[0]])].forEach(([salesName,itemId])=>st.salesAliases.push(D({id:"sa"+(++sa),salesName,itemId,kind:"item",method:"demo",score:1,algorithmVersion:"matcher-v7",reviewedBy:"",reviewedAt:nowIso(),createdAt:nowIso(),updatedAt:nowIso()})));
    st.seq.alias=sa;
    if(!st.yt)st.yt={src:"r1",inKg:27.2,buy:52,vat:"incl",method:"zero",lines:[{name:"لحم صافي بعد التقطيع",kg:20.4,type:"main",val:0},{name:"عظم",kg:2.7,type:"by",val:7.5},{name:"مخرجات أخرى",kg:4.1,type:"waste",val:0}],apply:["r1"]};
    save("aghnam-pricing-v3",st)},
  clear:async()=>{const st=load("aghnam-pricing-v3",null);if(!st)return;["raws","boxes","exps","salesAliases"].forEach(k=>{st[k]=dropDemo(st[k])});save("aghnam-pricing-v3",st)}},

{id:"sales",label:"العملاء والمبيعات والطلبات",caps:["customers","commerce","salesintel","intelligence","economics","followup","dash"],reload:true,
  empty:async()=>(await idbCount(["customers","sales_lines","orders"]))===0,
  seed:async()=>{
    const {customers,orders}=build(),cust=new Map(),lines=[],items=[],ords=[],pays=[],desc=new Map();let li=1;
    customers.forEach(c=>cust.set(c.i,D({id:"c:"+intl(c.phone),phone:intl(c.phone),name:c.name,nameKey:norm(c.name),email:"",city:c.city,district:c.district,address:"",country:"SA",source:c.source,sources:[c.source],summarySales:0,summaryOrders:0,firstPurchase:"",lastPurchase:"",updatedAt:nowIso()})));
    orders.forEach(o=>{
      const cu=cust.get(o.c.i),ref="DMO-"+String(o.n).padStart(5,"0"),oid="demo-o"+o.n;
      ords.push(D({id:oid,externalOrderId:ref,internalOrderId:ref,invoiceNo:"INV-"+ref.slice(4),customerId:cu.id,customerName:cu.name,phone:cu.phone,city:cu.city,district:cu.district,date:o.date,
        subtotal:o.subtotal,vat:r2(o.subtotal-o.subtotal/1.15),shipping:o.shipping,discount:0,codFee:0,orderTotal:o.total,paymentMethod:o.pay,paymentStatus:o.paid?"مدفوع":"غير مدفوع",status:o.canceled?"ملغي":"مكتمل",itemCount:o.items.length,source:o.channel}));
      o.items.forEach((x,k)=>{
        items.push(D({id:oid+"-i"+k,orderId:oid,externalOrderId:ref,productName:x.name,descriptionOriginal:x.name,qty:x.qty,unitPrice:x.unitPrice,amount:x.amount}));
        if(o.canceled)return;
        const nm=norm(x.name),did="d:demo-"+PRODUCTS.findIndex(p=>p.name===x.name);
        lines.push(D({id:"demo-l"+li,source:o.channel,externalOrderId:ref,externalLineId:"",sourceExternal:o.channel+"|"+ref,customerId:cu.id,phone:cu.phone,date:o.date,ref,amount:x.amount,amountHalalas:Math.round(x.amount*100),qty:x.qty,descriptionId:did,descriptionOriginal:x.name,descriptionNormalized:nm,rawRowNo:li}));li++;
        let dd=desc.get(did);if(!dd){dd={id:did,original:x.name,normalized:nm,signature:[...new Set(nm.split(" "))].sort().join(" "),seenCount:0,qty:0,sales:0,cs:new Set(),firstSeen:"",lastSeen:""};desc.set(did,dd)}
        dd.seenCount++;dd.qty+=x.qty;dd.sales+=x.amount;dd.cs.add(cu.id);if(!dd.firstSeen||o.date<dd.firstSeen)dd.firstSeen=o.date;if(o.date>dd.lastSeen)dd.lastSeen=o.date;
        cu.summarySales=r2(cu.summarySales+x.amount);
      });
      if(!o.canceled){cu.summaryOrders++;if(!cu.firstPurchase||o.date<cu.firstPurchase)cu.firstPurchase=o.date;if(o.date>cu.lastPurchase)cu.lastPurchase=o.date}
      if(o.paid&&!o.canceled){const refund=rnd()<.04?r2(o.total*.3):0;pays.push(D({id:"demo-pay"+o.n,customerId:cu.id,externalOrderId:ref,orderId:oid,amount:o.total,capturedAmount:o.total,refundedAmount:refund,amountDelta:0,matched:true,date:o.date,status:refund?"partially_refunded":"captured",method:o.pay}))}
    });
    const descriptions=[...desc.values()].map(x=>D({id:x.id,original:x.original,normalized:x.normalized,signature:x.signature,seenCount:x.seenCount,qty:x.qty,sales:r2(x.sales),customerCount:x.cs.size,firstSeen:x.firstSeen,lastSeen:x.lastSeen}));
    await idbPut({customers:[...cust.values()],sales_lines:lines,sales_descriptions:descriptions,orders:ords,order_items:items,payments:pays,
      imports:[D({id:"demo-import",fileName:"بيانات تجريبية — SQC",size:0,sha256:"demo",source:"demo",status:"committed",rowCount:lines.length,errorCount:0,duplicateCount:0,createdAt:nowIso(),committedAt:nowIso(),orderCount:ords.length,itemCount:items.length,paymentCount:pays.length,opsOrderCount:0,insertedLines:lines.length,customerCount:cust.size})],
      meta:[{key:"dataset",value:{demo:true,datasetVersion:"demo-1",srcLabel:{},cover:null,lastImportAt:nowIso()}}]});
    /* direct sales recorded in «تسجيل بيع» (the ledger posts them) */
    const man=arr("aghnam-v12-manual-sales");
    if(!man.length)save("aghnam-v12-manual-sales",Array.from({length:10},(_,i)=>{const p=pick(PRODUCTS.slice(0,8)),q=int(2,6),c=customers[i*3%customers.length];
      return D({id:"MAN-DEMO"+(i+1),date:ago(int(0,40)),customer:c.name,phone:c.phone,item:p.name,category:"بيع مباشر",amount:r2(p.price*q),qty:q,unitPrice:p.price,city:c.city,payment:pick(PAY),status:"مكتمل",createdAt:nowIso()})}));
  },
  clear:async()=>{await idbClearDemo(["customers","sales_lines","sales_descriptions","orders","order_items","payments","imports","meta"]);save("aghnam-v12-manual-sales",dropDemo(arr("aghnam-v12-manual-sales")))}},

{id:"supply",label:"الموردون والتدفق النقدي",caps:["suppliers","cash"],
  empty:async()=>!arr("skosif_v31_supplier_batches").length,
  seed:async()=>{
    const sup=[["مؤسسة المراعي الذهبية","نعيمي طازج",52,8],["شركة الحري للمواشي","حري طازج",64,6],["مزرعة الخرج للأبقار","عجل طازج",44,4]],b=[];
    months(12).forEach((m,i)=>sup.forEach(([s,item,price,w],k)=>b.push(D({id:"demo-b"+i+"-"+k,date:iso(new Date(m.getFullYear(),m.getMonth(),4+k*7)),supplier:s,itemName:item,qty:int(180,320),priceGross:r2(price*between(.95,1.08)),vatIncl:k!==1,agreedWaste:w,actualWaste:r2(w+between(-1.5,3))}))));
    save("skosif_v31_supplier_batches",b);
    if(load("skosif_v31_monthly_opex",null)==null){save("skosif_v31_monthly_opex",26500);const r=reg();r.opex=true;setReg(r)}
    const f=load("skosif_erp_finance_v1",{flows:[]});if(!(f.flows||[]).length){f.flows=[];months(6).forEach((m,i)=>{const d=iso(new Date(m.getFullYear(),m.getMonth(),27));
      [["payment","الرواتب","6100",18000],["payment","الإيجار","6200",6000],["payment","الكهرباء والمياه","6300",1900],["payment","الوقود والتوصيل","6300",2300],["receipt","تحصيل عملاء الآجل","1200",int(9000,14000)]]
        .forEach(([type,category,account,amount],k)=>f.flows.push(D({id:"demo-fl"+i+"-"+k,date:d,type,category,account,amount,ref:"DMO-F"+i+k})))});save("skosif_erp_finance_v1",f)}
    const ap=load("skosif_erp_payables_v1",{rows:[]});if(!(ap.rows||[]).length){ap.rows=sup.map(([s],k)=>D({id:"demo-ap"+k,supplier:s,ref:"INV-S"+(k+101),due:ago(-10+k*9),amount:int(12000,38000),paid:k===2}));save("skosif_erp_payables_v1",ap)}
  },
  clear:async()=>{save("skosif_v31_supplier_batches",dropDemo(arr("skosif_v31_supplier_batches")));const r=reg();if(r.opex){localStorage.removeItem("skosif_v31_monthly_opex");delete r.opex;setReg(r)}
    const f=load("skosif_erp_finance_v1",null);if(f){f.flows=dropDemo(f.flows);save("skosif_erp_finance_v1",f)}const ap=load("skosif_erp_payables_v1",null);if(ap){ap.rows=dropDemo(ap.rows);save("skosif_erp_payables_v1",ap)}}},

{id:"purchasing",label:"أوامر الشراء والاستلام",caps:["purchasing"],
  empty:async()=>!(load("skosif_purchasing_v1",{}).orders||[]).length,
  seed:async()=>{
    const P=E().procurement,d=Object.assign({orders:[],receipts:[],prices:[]},load("skosif_purchasing_v1",{}));
    const L=[[["نعيمي طازج",240,45.2,"0.15"],["كبدة غنم",30,24,"0.15"]],[["حري طازج",180,64,"0"]],[["عجل طازج",260,38.3,"0.15"],["مفروم بقري",90,33,"0.15"]],[["سواكني",150,58,"0"]],[["تيس بلدي",120,53,"0.15"]]];
    L.forEach((lines,i)=>{const date=ago(40-i*8),o=D({id:"demo-po"+i,number:"PO-"+String(9001+i),supplier:["مؤسسة المراعي الذهبية","شركة الحري للمواشي","مزرعة الخرج للأبقار","شركة الحري للمواشي","مؤسسة المراعي الذهبية"][i],date,dueDate:ago(33-i*8),
      lines:lines.map(([item,qty,cost,vat])=>({item,qty,cost,vat})),status:i<3?"RECEIVED":"OPEN"});d.orders.push(o);
      if(i<3){const got=o.lines.map(l=>({item:l.item,qty:i===1?l.qty-6:l.qty}));let variances=[],inspection={overallStatus:"PASS",temperatureStatus:"PASS",weightStatus:"PASS"};
        try{variances=P.procurement.matchReceipt(o.lines.map(l=>({itemId:l.item,orderedQty:l.qty,unitCost:l.cost})),got.map(l=>({itemId:l.item,receivedQty:l.qty})))}catch{}
        try{const kg=o.lines.reduce((a,l)=>a+l.qty,0);inspection=P.receivingInspection.inspectReceiving({id:"demo-insp"+i,date,invoicedKg:kg,actualKg:i===1?kg-6:kg,maxTemperatureC:4,tolerancePercent:2,temperatureC:i===2?5.1:2.4})}catch{}
        d.receipts.push(D({id:"demo-rc"+i,orderId:o.id,date:ago(38-i*8),lines:got,variances,inspection,temperature:i===2?5.1:2.4,notes:i===1?"نقص 6 كجم عن الفاتورة":"",status:"RECEIVED"}))}});
    [["مؤسسة المراعي الذهبية","نعيمي طازج",45.2],["شركة الحري للمواشي","حري طازج",64],["مزرعة الخرج للأبقار","عجل طازج",38.3],["مؤسسة المراعي الذهبية","كبدة غنم",24]]
      .forEach(([supplier,item,price],k)=>d.prices.push(D({id:"demo-pr"+k,supplier,item,price,unit:"كجم",from:Y+"-01-01",to:""})));
    save("skosif_purchasing_v1",d)},
  clear:async()=>{const d=load("skosif_purchasing_v1",null);if(!d)return;["orders","receipts","prices"].forEach(k=>{d[k]=dropDemo(d[k])});save("skosif_purchasing_v1",d)}},

{id:"stock",label:"المخزون والصلاحية والتتبع",caps:["inventory","traceability"],
  empty:async()=>!arr("aghnam_v29_inventory").length&&!arr("skosif_inv_expiry_batches").length&&!arr("skosif_v38_batches").length,
  seed:async()=>{
    if(!arr("aghnam_v29_inventory").length)save("aghnam_v29_inventory",[["نعيمي طازج",120,34],["حري طازج",64,21],["عجل طازج",210,28],["مفروم بقري",38,19],["كبدة غنم",22,4],["سواكني",95,12]].map(([item,stock,daily])=>{
      const lead=2,safety=2,cycle=7,cover=stock/daily,rp=daily*(lead+safety),target=daily*(lead+safety+cycle),status=stock<=rp?"إعادة طلب عاجلة":cover<=lead+safety+Math.max(1,cycle*.35)?"إعادة طلب قريبة":"المخزون آمن حالياً";
      return D({item,stock,daily,lead,safety,cycle,cover:r2(cover),reorderPoint:r2(rp),targetStock:r2(target),suggested:r2(Math.max(0,target-stock)),status,ts:nowIso()})}));
    if(!arr("skosif_inv_expiry_batches").length)save("skosif_inv_expiry_batches",[["نعيمي طازج","ثلاجة 1",42,3,2],["مفروم بقري","ثلاجة 2",18,1,1],["عجل طازج","غرفة التبريد",70,4,5],["كبدة غنم","ثلاجة 1",9,2,0],["برجر بقري","فريزر",60,20,60]]
      .map(([item,storage,stockKg,prep,exp],k)=>D({id:"demo-ex"+k,item,storage,stockKg,datePrep:ago(prep),dateExp:ago(-exp)})));
    if(!arr("skosif_v38_batches").length)save("skosif_v38_batches",[["نعيمي — مزارع القصيم","مسلخ الرياض المركزي",24],["حري — مزارع الجوف","مسلخ الرياض المركزي",18],["عجل — مزرعة الخرج","مسلخ الخرج",6],["سواكني — مستورد","مسلخ جدة",30]]
      .map(([breed,slaughterhouse,count],k)=>D({id:"LOT-"+Y+"-0"+(901+k),breed,slaughterhouse,date:ago(3+k*5),cert:"VET-"+Y+"-"+(4401+k),count,status:"معتمد"})));
    if(!arr("skosif_v38_coldchain").length)save("skosif_v38_coldchain",[["غرفة التبريد 1",1.8,82],["براد الشحن 2",3.4,78],["غرفة التبريد 2",2.1,80],["براد الشحن 1",5.6,75],["ثلاجة العرض",3.9,70],["غرفة التبريد 1",1.6,83]]
      .map(([loc,temp,humidity],k)=>D({time:new Date(Date.now()-k*5*36e5).toLocaleString("ar-SA"),loc,temp,humidity,inspector:k%2?"سالم":"منيرة"})));
  },
  clear:async()=>{["aghnam_v29_inventory","skosif_inv_expiry_batches","skosif_v38_batches","skosif_v38_coldchain"].forEach(k=>save(k,dropDemo(arr(k))))}},

{id:"credit",label:"ائتمان المطاعم والذمم",caps:["b2bcredit","receivables"],
  empty:async()=>!arr("skosif_v38_ledger").length&&!(localStorage.getItem("skosif_ar_paste")||"").trim(),
  seed:async()=>{
    if(!arr("skosif_v38_ledger").length)save("skosif_v38_ledger",RESTAURANTS.map((name,k)=>{const moves=[],limit=[40000,25000,60000,30000,20000][k];let bal=0;
      for(let j=8;j>=0;j--){const a=int(3000,9000);bal+=a;moves.push({at:new Date(Date.now()-j*6*DAY).toISOString(),type:"sale",amount:a});if(j%2===0){const p=int(2000,Math.min(bal,8000));bal-=p;moves.push({at:new Date(Date.now()-j*6*DAY+DAY).toISOString(),type:"payment",amount:p})}}
      return D({id:"CUST-DEMO"+(k+1),name,phone:phone(60+k),limit,terms:["15","30","30","45","15"][k],balance:bal,moves:moves.reverse()})}));
    if(!(localStorage.getItem("skosif_ar_paste")||"").trim()){localStorage.setItem("skosif_ar_paste","العميل,التاريخ,المبلغ,المسدد\n"+RESTAURANTS.map((n,k)=>[n,ago(10+k*22),int(12000,40000),int(2000,10000)].join(",")).join("\n"));const r=reg();r.ar=true;setReg(r)}
  },
  clear:async()=>{save("skosif_v38_ledger",dropDemo(arr("skosif_v38_ledger")));const r=reg();if(r.ar){localStorage.removeItem("skosif_ar_paste");delete r.ar;setReg(r)}}},

{id:"followup",label:"متابعة العملاء",caps:["followup"],
  empty:async()=>!(load("skosif_followup_v1",{}).records||[]).length,
  seed:async()=>{const {customers}=build(),d=Object.assign({records:[],queue:[]},load("skosif_followup_v1",{}));
    for(let i=0;i<28;i++){const c=customers[(i*7)%customers.length],day=ago(i%7);d.records.push(D({id:"demo-fu"+i,date:day,name:c.name,phone:c.phone,source:c.source,city:c.city,district:c.district,order:pick(PRODUCTS).name,payment:pick(PAY),deliveryDate:day,received:rnd()<.8,receiver:rnd()<.5?"العميل":"الحارس",notes:rnd()<.3?"يطلب التوصيل مساءً":"",at:nowIso()}))}
    for(let i=0;i<6;i++)d.queue.push(D({id:"demo-q"+i,phone:customers[30-i].phone,note:["عميل لم يطلب منذ 45 يوماً","متابعة عرض بوكس الشواء","تأكيد موعد التوصيل","استطلاع رضا بعد الطلب","عرض اشتراك أسبوعي","تذكير بالدفعة الآجلة"][i],done:false}));
    save("skosif_followup_v1",d)},
  clear:async()=>{const d=load("skosif_followup_v1",null);if(!d)return;d.records=dropDemo(d.records);d.queue=dropDemo(d.queue);save("skosif_followup_v1",d)}},

{id:"ledger",label:"الدفاتر المحاسبية",caps:["ledger"],after:["company","sales","purchasing"],
  empty:async()=>{const d=load("skosif_ledger_v1",{});return !(d.accounts||[]).length&&!(d.entries||[]).length},
  seed:async()=>{
    const F=E().finance,BASIC=[["1100","النقدية والبنوك","asset"],["1200","الذمم المدينة","asset"],["1300","المخزون","asset"],["1400","ضريبة القيمة المضافة — مدخلات","asset"],["2100","الذمم الدائنة (الموردون)","liability"],
      ["2200","ضريبة القيمة المضافة — مخرجات","liability"],["3000","رأس المال","equity"],["3100","الأرباح المبقاة","equity"],["4000","إيرادات المبيعات","revenue"],["4900","إيرادات أخرى","revenue"],["5000","تكلفة المبيعات","expense"],["6100","الرواتب والأجور","expense"],["6200","الإيجار","expense"],["6300","مصروفات تشغيلية أخرى","expense"]];
    const accounts=BASIC.map(([code,name,type])=>D(F.accounts.createAccount({code,name,type}))),id=c=>accounts.find(a=>a.code===c).id,entries=[];let n=1;
    const je=(date,memo,lines,extra={})=>entries.push(D({id:"demo-je"+(n++),date,reference:extra.reference||"DMO-JE"+n,memo,source:extra.source||"يدوي",...(extra.sourceId?{sourceId:extra.sourceId}:{}),lines:lines.map(([c,dr,cr])=>({accountId:id(c),debit:r2(dr),credit:r2(cr)}))}));
    je(Y+"-01-01","رأس المال المدفوع",[["1100",350000,0],["3000",0,350000]]);
    /* monthly: sales summary from the demo orders, purchases, cost of sales, payroll, rent, other */
    const {orders}=build(),byM={};orders.filter(o=>!o.canceled&&o.date.startsWith(String(Y))).forEach(o=>{const k=o.date.slice(0,7);byM[k]=(byM[k]||0)+o.total});
    Object.keys(byM).sort().forEach(k=>{const gross=byM[k],net=r2(gross/1.15),vat=r2(gross-net),end=k+"-28",cogs=r2(net*.62),pur=r2(cogs*1.02);
      je(end,"مبيعات الشهر (ملخص نقاط البيع والطلبات)",[["1100",gross*.82,0],["1200",gross*.18,0],["4000",0,net],["2200",0,vat]],{reference:"SAL-"+k,source:"مبيعات"});
      je(end,"مشتريات الشهر من الموردين",[["1300",pur,0],["1400",pur*.15,0],["2100",0,pur*1.15]],{reference:"PUR-"+k,source:"مشتريات"});
      je(end,"سداد الموردين",[["2100",pur*1.15*.9,0],["1100",0,pur*1.15*.9]],{reference:"PAY-"+k});
      je(end,"تكلفة المبيعات",[["5000",cogs,0],["1300",0,cogs]],{reference:"COGS-"+k});
      je(end,"الرواتب والأجور",[["6100",18000,0],["1100",0,18000]],{reference:"PAYR-"+k});
      je(end,"إيجار المحل والمستودع",[["6200",6000,0],["1100",0,6000]],{reference:"RENT-"+k});
      je(end,"كهرباء ووقود وتغليف",[["6300",4200,0],["1100",0,4200]],{reference:"OPX-"+k});
      je(end,"تحصيل ذمم العملاء",[["1100",gross*.16,0],["1200",0,gross*.16]],{reference:"COL-"+k});
    });
    /* the direct sales and the goods received, posted by the same engines as the ledger's own buttons */
    const man=arr("aghnam-v12-manual-sales").filter(x=>x.demo);
    man.forEach(x=>{try{
      /* the ledger's own posting: VAT taken out of the price paid, cost of sales moved out of inventory */
      if(window.SKosifLedger&&SKosifLedger.saleEntry){const r=SKosifLedger.saleEntry({accounts,entries},x);if(r)entries.push(D({...r.entry,id:"demo-je"+(n++)}));return}
      const b=E().sales.salesPosting.buildSalesPosting({id:x.id,number:x.id,date:x.date,dueDate:x.date,customerId:x.customer,status:"DRAFT",lines:[{itemId:x.item,quantity:x.qty,unitPrice:x.unitPrice,vatRate:.15,priceIncludesVat:true}]},{receivableAccountId:id("1200"),revenueAccountId:id("4000"),vatPayableAccountId:id("2200")});
      entries.push(D({...b.journal,id:"demo-je"+(n++),memo:"بيع: "+x.item+" — "+x.customer,reference:x.id,source:"مبيعات",sourceId:"sale:"+x.id}))}catch{}});
    const pur=load("skosif_purchasing_v1",{});(pur.receipts||[]).filter(r=>r.demo).forEach(r=>{const po=(pur.orders||[]).find(o=>o.id===r.orderId);if(!po)return;try{
      const b=E().procurement.procurementPosting.buildReceiptPosting({id:po.id,number:po.number,date:po.date,dueDate:po.dueDate||po.date,supplierId:po.supplier,status:"OPEN",lines:po.lines.map(l=>({itemId:l.item,quantity:+l.qty||0,unitCostExVat:+l.cost||0,vatRate:+l.vat||0}))},
        {id:r.id,number:r.id,date:r.date,purchaseOrderId:po.id,status:"DRAFT",lines:r.lines.map(l=>({itemId:l.item,quantity:+l.qty||0}))},{inventoryAccountId:id("1300"),inputVatAccountId:id("1400"),payableAccountId:id("2100")});
      entries.push(D({...b.journal,id:"demo-je"+(n++),memo:"استلام من "+po.supplier+" — أمر "+po.number,reference:po.number,source:"مشتريات",sourceId:"receipt:"+r.id}))}catch{}});
    /* a collection from a credit customer and a part payment to a supplier: balances, ageing and statements have a story */
    try{const P=F.partyLedger,cr=man.find(x=>/آجل/.test(x.payment||""));
      if(cr)entries.push(D({...P.buildSettlementEntry({id:"demo-je"+(n++),date:ago(1),kind:"collection",party:cr.customer,amount:r2(cr.amount/2),cashAccountId:id("1100"),controlAccountId:id("1200"),reference:"RCV-DEMO1"}),memo:"تحصيل جزئي من "+cr.customer+" (تحويل بنكي)",source:"تحصيل"}));
      const r0=(pur.receipts||[]).find(r=>r.demo),po0=r0&&(pur.orders||[]).find(o=>o.id===r0.orderId),b0=po0&&entries.find(e=>e.sourceId==="receipt:"+r0.id);
      const owed=b0?b0.lines.filter(l=>l.accountId===id("2100")).reduce((t,l)=>t+l.credit,0):0;
      if(owed>0)entries.push(D({...P.buildSettlementEntry({id:"demo-je"+(n++),date:ago(0),kind:"payment",party:po0.supplier,amount:r2(owed*0.6),cashAccountId:id("1100"),controlAccountId:id("2100"),reference:"PAY-DEMO1"}),memo:"سداد جزئي إلى "+po0.supplier+" (تحويل بنكي)",source:"سداد"}));
    }catch{}
    const bad=entries.filter(e=>{try{return !F.ledger.validateJournalEntry(e).valid}catch{return false}});
    const good=entries.filter(e=>!bad.includes(e));let bank=null;
    /* past quarters are filed: each ended quarter closes its VAT into 2250 and is paid to the authority before its deadline */
    try{const V=F.vatReturn,typeOf=x=>(accounts.find(a=>a.id===x)||{}).type,t=ago(0);
      if(!accounts.some(a=>a.code==="2250"))accounts.push(D(F.accounts.createAccount({code:"2250",name:"ضريبة القيمة المضافة — صافي مستحق للهيئة",type:"liability"})));
      for(let q=0;q<4;q++){const st=iso(Date.UTC(Y,q*3,1)),en=iso(Date.UTC(Y,q*3+3,0)),due=iso(Date.UTC(Y,q*3+4,0));if(due>=t)break;
        const r=V.vatReturn({entries:good,start:st,end:en,outputVatAccountId:id("2200"),inputVatAccountId:id("1400"),typeOf,controlAccountIds:["1100","1200","2100","2250"].map(id)});
        if(!(r.outputVat>0||r.inputVat>0))continue;
        const se=V.buildVatSettlementEntry({id:"demo-je"+(n++),date:en,reference:"VAT-"+Y+"-Q"+(q+1),outputVat:r.outputVat,inputVat:r.inputVat,outputVatAccountId:id("2200"),inputVatAccountId:id("1400"),netAccountId:id("2250")});
        good.push(D({...se,memo:"إقفال ضريبة القيمة المضافة — الربع "+(q+1),source:"ضريبة",sourceId:"vat:"+Y+"-Q"+(q+1)}));
        if(r.net>0)good.push(D({id:"demo-je"+(n++),date:iso(Date.parse(due)-5*DAY),reference:"ZATCA-"+Y+"-Q"+(q+1),memo:"سداد ضريبة الربع "+(q+1)+" للهيئة",source:"سداد",
          lines:[{accountId:id("2250"),debit:r2(r.net),credit:0,description:"سداد للهيئة"},{accountId:id("1100"),debit:0,credit:r2(r.net),description:"سداد للهيئة"}]}));
      }}catch{}
    /* a bank statement for the last weeks: cash lines clear a day later, one deposit is still in transit, one payment
       outstanding, and a fee and a profit only the bank knows — so «مطابقة البنك» has a real story */
    try{const BR=F.bankReconciliation,book=BR.bookCashLines(good,id("1100")),end=ago(0),from=ago(40),recent=book.filter(l=>l.date>=from&&l.date<=end);
      if(recent.length>=3){const dep=[...recent].reverse().find(l=>l.amount>0),pay=[...recent].reverse().find(l=>l.amount<0);
        const lines=recent.filter(l=>l!==dep&&l!==pay).map((l,i)=>({id:"demo-bk"+i,date:l.date<end?iso(Date.parse(l.date)+DAY):l.date,amount:l.amount,description:l.memo||l.reference||"حركة",reference:""}));
        lines.push({id:"demo-bk-int",date:ago(10),amount:60,description:"أرباح حساب جاري",reference:"PRF"},{id:"demo-bk-fee",date:end,amount:-35,description:"رسوم خدمات بنكية",reference:"FEE"});
        const bal=book.filter(l=>l.date<=end).reduce((t,l)=>t+l.amount,0);
        bank={demo:true,lines,manual:[],closing:r2(bal-(dep?dep.amount:0)-(pay?pay.amount:0)+60-35),cleared:book.filter(l=>l.date<from).map(l=>l.id),history:[{end:from,closing:r2(book.filter(l=>l.date<from).reduce((t,l)=>t+l.amount,0)),at:from,matched:0}]}}}catch{}
    save("skosif_ledger_v1",{accounts,entries:good,...(bank?{bank}:{})});
  },
  clear:async()=>{const d=load("skosif_ledger_v1",null);if(!d)return;d.entries=dropDemo(d.entries);if(d.bank&&d.bank.demo)delete d.bank;const used=new Set(d.entries.flatMap(e=>(e.lines||[]).map(l=>l.accountId)));d.accounts=(d.accounts||[]).filter(a=>!a.demo||used.has(a.id));save("skosif_ledger_v1",d)}},

{id:"engagement",label:"ملف المراجعة من الدفاتر",caps:["tbreview"],after:["ledger"],
  empty:async()=>{const d=load("skosif_tbreview_v1",{});return !(d&&d.tbText)},
  /* the engagement file opens on شركة الواحة: a full year with its prior year (the app's own books stay one click away:
     «من دفاتر التطبيق» in the file) */
  seed:async()=>{const SC=E().reports.sampleCompany;let text="",ctx={company:"شركة الوادي التجريبية للحوم",period:"السنة المنتهية في 31 ديسمبر "+Y,periodStart:Y+"-01-01",periodEnd:Y+"-12-31",country:"SA"};
    if(SC){text=SC.WAHA_TB_CSV;ctx={...SC.WAHA_CONTEXT}}
    else try{const b=window.SKosifTBReview&&await SKosifTBReview.booksTB();if(b){text=b.text;ctx={...ctx,...Object.fromEntries(Object.entries(b.ctx).filter(([,v])=>v))}}}catch{}
    if(!text)text=E().reports.tbImport.SAMPLE_TB_CSV;
    save("skosif_tbreview_v1",{demo:true,ctx:{company:"",period:"",periodStart:"",periodEnd:"",activity:"تجارة اللحوم والمواشي بالتجزئة والجملة",country:"SA",framework:"IFRS",currency:"الريال السعودي",legalForm:"شركة ذات مسؤولية محدودة",registeredOffice:"الرياض",principalPlace:"الرياض",...ctx},
      fw:{},tbText:text,overrides:{},materiality:null,session:null,accepted:[],rejected:[],ecl:null,confirm:{independence:false,edition:false,compliance:false,unrecognized:false,partner:false}})},
  clear:async()=>{const d=load("skosif_tbreview_v1",null);if(d&&d.demo)localStorage.removeItem("skosif_tbreview_v1")}},

{id:"risks",label:"المخاطر والملاحظات والمهام",caps:["risks","tasks","notifications"],
  empty:async()=>{const r=load("skosif_risks_v1",{});return !(r.risks||[]).length&&!(r.findings||[]).length&&!arr("skosif_tasks_v1").length},
  seed:async()=>{const t=d=>ago(-d);
    const r=Object.assign({risks:[],findings:[]},load("skosif_risks_v1",{}));
    if(!r.risks.length)r.risks=[["ارتفاع أسعار المواشي قبل موسم الأضحى","المالية",3,3,"المشتريات",20,"open","عقود توريد مسبقة مع موردين اثنين"],["انقطاع التبريد في غرفة 2","التشغيلية",2,3,"المستودع",-2,"mitigating","مولد احتياطي وحساس حرارة"],
      ["تأخر تحصيل ذمم المطاعم","المالية",3,2,"المحاسب",10,"open","حد ائتمان وتذكير أسبوعي"],["عدم مطابقة الفواتير لمتطلبات الفوترة الإلكترونية","الالتزام والحوكمة",1,3,"المالية",30,"open",""],["فقدان بيانات الجهاز","تقنية المعلومات",2,2,"الإدارة",5,"open","نسخة كاملة أسبوعية ونقل مشفر"],["شكاوى جودة التوصيل","السمعة والعملاء",1,1,"المبيعات",0,"closed",""]]
      .map(([title,category,likelihood,impact,owner,due,status,response],i)=>D({id:"demo-r"+(i+1),ref:"RSK-"+Y+"-"+String(i+1).padStart(3,"0"),title,category,likelihood,impact,owner,due:due?t(due):"",status,response}));
    if(!r.findings.length)r.findings=[["قيود إيرادات دون مستندات داعمة","المبيعات","high","open"],["مخصص خسائر الذمم المدينة غير محدث","الذمم المدينة","medium","inprogress"],["تصنيف بعض المصروفات التشغيلية","المصروفات","low","open"]]
      .map(([title,area,severity,status],i)=>D({id:"demo-f"+(i+1),ref:"AF-"+Y+"-"+String(i+1).padStart(3,"0"),title,detail:"ملاحظة تجريبية لعرض سجل الملاحظات",area,severity,status,owner:"المحاسب",date:ago(12-i*4)}));
    save("skosif_risks_v1",r);
    if(!arr("skosif_tasks_v1").length)save("skosif_tasks_v1",[["مطابقة كشف البنك للشهر الماضي",-3,"high","ledger"],["اعتماد أسعار الموسم",0,"high","memo"],["جرد غرفة التبريد 2",1,"normal","inventory"],["متابعة ذمم مطعم الديرة",2,"normal","b2bcredit"],["مراجعة ميزان المراجعة واعتماد الأهمية النسبية",4,"high","tbreview"],["تحديث عروض بوكس الشواء",6,"low","offers"]]
      .map(([title,due,priority,cap],i)=>D({id:"demo-tk"+i,title,due:t(due),priority,cap,done:false,at:nowIso()})).concat([D({id:"demo-tk9",title:"إرسال الإقرار الضريبي",due:t(-12),priority:"high",cap:"reports",done:true,doneAt:nowIso(),at:nowIso()})]));
  },
  clear:async()=>{const r=load("skosif_risks_v1",null);if(r){r.risks=dropDemo(r.risks);r.findings=dropDemo(r.findings);save("skosif_risks_v1",r)}save("skosif_tasks_v1",dropDemo(arr("skosif_tasks_v1")))}},

{id:"decisions",label:"القرارات ومجلس القرار",caps:["council","jev","decision"],
  empty:async()=>!(load("skosif_council_v1",{}).cases||[]).length&&!arr("aghnam_v29_jev_log").length,
  seed:async()=>{const c=Object.assign({cases:[]},load("skosif_council_v1",{}));
    if(!c.cases.length)c.cases=[D({id:"demo-case1",question:"هل نرفع سعر بوكس الحري VIP بنسبة 5٪ هذا الشهر؟",options:[{id:"o0",label:"نعم"},{id:"o1",label:"لا"},{id:"o2",label:"نؤجل أسبوعاً"}],
      votes:[{provider:"المدير",optionId:"o0",confidence:.7,rationale:"هامش البوكس تحت الهدف"},{provider:"المحاسب",optionId:"o2",confidence:.6,rationale:"ننتظر أسعار الموردين الجديدة"},{provider:"Jev",optionId:"o0",confidence:.74,rationale:"الطلب مستقر على الفئة الفاخرة"}],at:nowIso()}),
      D({id:"demo-case2",question:"أي مورد نعتمد لعقد الربع القادم للنعيمي؟",options:[{id:"o0",label:"مؤسسة المراعي الذهبية"},{id:"o1",label:"شركة الحري للمواشي"}],votes:[{provider:"المشتريات",optionId:"o0",confidence:.8,rationale:"هدر أقل وسعر ثابت"}],at:nowIso()})];
    save("skosif_council_v1",c);
    if(!arr("aghnam_v29_jev_log").length)save("aghnam_v29_jev_log",[["choice","أي قيود التسوية يجب اعتماده أولاً؟","مخصص الخسائر الائتمانية — أثره الأكبر على صافي الربح"],["noul","هل نفتح قناة بيع للجملة للمطاعم؟","نعم باحتمال 0.72 — بشرط حدود ائتمان"],["score","تقييم جاهزية الإقفال الشهري","3.8 من 5"]]
      .map(([type,question,summary],i)=>D({at:new Date(Date.now()-i*2*DAY).toISOString(),source:"Jev",type,question,summary})))},
  clear:async()=>{const c=load("skosif_council_v1",null);if(c){c.cases=dropDemo(c.cases);save("skosif_council_v1",c)}save("aghnam_v29_jev_log",dropDemo(arr("aghnam_v29_jev_log")))}},

{id:"reports",label:"التقارير التنفيذية",caps:["execreports"],
  empty:async()=>{const p=load("skosif_rep_pl",null);return !p||!Object.values(p).some(v=>Number(v)>0)},
  seed:async()=>{save("skosif_rep_pl",{revenue:186400,cogs:112300,wasteLoss:3900,salaries:18000,rent:6000,utilities:1900,logistics:2300,packaging:1400,otherOpex:1100,demo:true})},
  clear:async()=>{const p=load("skosif_rep_pl",null);if(p&&p.demo)localStorage.removeItem("skosif_rep_pl")}}
];
const ORDER=SECTIONS.map(s=>s.id);

/* ---------- status, fill, clear ---------- */
async function status(){const r=reg();return Promise.all(SECTIONS.map(async s=>({id:s.id,label:s.label,caps:s.caps,demo:!!r.sections[s.id],empty:await s.empty().catch(()=>false)})))}
/* a brand-new device: no catalogue, no sales, no books, no supplier batches, no review */
async function fresh(){const st=await status(),core=["catalog","sales","ledger","supply","engagement"];return st.filter(x=>core.includes(x.id)).every(x=>x.empty)}
async function fill(ids,{quiet}={}){
  const st=await status(),want=ids?st.filter(x=>ids.includes(x.id)):st.filter(x=>x.empty);let reload=false,done=[];
  /* the registry is read again after every section: a seeder may record its own flags in it */
  for(const id of ORDER){const x=want.find(y=>y.id===id);if(!x||!x.empty)continue;const s=SECTIONS.find(y=>y.id===id);
    try{await s.seed();const r=reg();r.sections[id]=nowIso();setReg(r);done.push(s.label);if(s.reload)reload=true}catch(e){SK.errors&&SK.errors.report(e,"demo:"+id)}}
  const r=reg();r.at=r.at||nowIso();setReg(r);SK.audit&&SK.audit.log("demo",{act:"fill",sections:done.length});
  if(!quiet&&done.length)toast("بيانات تجريبية في "+done.length+" أقسام: "+done.join("، "),"ok");
  return {done,reload};
}
async function clear(){
  const ids=Object.keys(reg().sections);let reload=false;
  for(const id of ORDER.slice().reverse()){if(!ids.includes(id))continue;const s=SECTIONS.find(y=>y.id===id);try{await s.clear();if(s.reload)reload=true}catch(e){SK.errors&&SK.errors.report(e,"demo-clear:"+id)}}
  if(window.__skStudioDemo)reload=true; /* the audit studio holds its sample in memory: a reload empties it */
  const r=reg();r.sections={};r.dismissed=true;setReg(r);SK.audit&&SK.audit.log("demo",{act:"clear",sections:ids.length});
  return {cleared:ids.length,reload};
}

/* ---------- the strip that says which screens run on demo data ---------- */
let busy=false;
function bar(){
  const v=document.getElementById("view");if(!v)return;const old=v.querySelector(":scope>.skdemo");
  const r=reg(),on=Object.keys(r.sections),cur=window.SKosifCore&&SKosifCore.view();
  const mine=SECTIONS.filter(s=>on.includes(s.id)&&s.caps.includes(cur));
  if(!on.length||r.hideBar){if(old)old.remove();return}
  const h='<div class="skdemo" role="status"><span class="skdemo-dot" aria-hidden="true"></span><b>بيانات تجريبية</b><span>'+(mine.length?'هذه الشاشة تعرض بيانات تجريبية ('+esc(mine.map(s=>s.label).join("، "))+')':on.length+' أقسام تعمل ببيانات تجريبية')+' — شركة وهمية لعرض عمل التطبيق، وسجلاتك الحقيقية لا تُمس.</span>'+
    '<button type="button" class="btn sm" data-demo="panel">إدارة</button><button type="button" class="btn sm danger" data-demo="clear">مسح التجريبية</button><button type="button" class="skdemo-x" data-demo="hide" aria-label="إخفاء الشريط">×</button></div>';
  if(old){if(old.outerHTML!==h)old.outerHTML=h}else v.insertAdjacentHTML("afterbegin",h);
}
async function panel(){
  const st=await status(),rows=st.map(x=>'<tr><td>'+esc(x.label)+'</td><td>'+(x.demo?'<span class="sksev warn">تجريبي</span>':x.empty?'<span class="sksev info">فارغ</span>':'<span class="sksev ok">بياناتك</span>')+'</td></tr>').join("");
  const w=document.createElement("div");w.className="skd-wrap";
  w.innerHTML='<div class="skd skdemo-panel" role="dialog" aria-modal="true" aria-labelledby="skdm-t"><h3 id="skdm-t">البيانات التجريبية</h3><p>تملأ الأقسام الفارغة فقط بشركة وهمية حتى ترى كل شاشة تعمل، ولا تكتب فوق بياناتك. المسح يحذف السجلات التجريبية وحدها.</p>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>القسم</th><th>الحالة</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div class="skd-acts"><button type="button" class="btn" data-demo="close">إغلاق</button>'+(st.some(x=>x.demo)?'<button type="button" class="btn danger" data-demo="clear">مسح التجريبية</button>':'')+(st.some(x=>x.empty)?'<button type="button" class="btn primary" data-demo="fill">املأ الأقسام الفارغة</button>':'')+'</div></div>';
  document.body.appendChild(w);w.addEventListener("click",e=>{if(e.target===w||e.target.closest('[data-demo="close"]'))w.remove()});
}
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-demo]");if(!b||busy)return;const a=b.dataset.demo;
  if(a==="panel"){panel();return}
  if(a==="hide"){const r=reg();r.hideBar=true;setReg(r);bar();toast("أُخفي الشريط — تجده في لوحة الأوامر: «البيانات التجريبية»","info");return}
  if(a==="fill"){busy=true;document.querySelectorAll(".skdemo-panel").forEach(x=>x.closest(".skd-wrap").remove());const res=await fill(null);busy=false;if(res.reload){overlay("يعيد التحميل لعرض البيانات…");setTimeout(()=>location.reload(),400)}else{bar();window.SKosifCore&&SKosifCore.go(SKosifCore.view())}return}
  if(a==="clear"){if(!await SK.confirm("مسح كل السجلات التجريبية؟ تبقى سجلاتك الحقيقية كما هي.",{danger:true,ok:"مسح التجريبية"}))return;busy=true;document.querySelectorAll(".skdemo-panel").forEach(x=>x.closest(".skd-wrap").remove());
    const res=await clear();busy=false;toast("مُسحت البيانات التجريبية من "+res.cleared+" أقسام","ok");if(res.reload){overlay("يعيد التحميل…");setTimeout(()=>location.reload(),400)}else{bar();window.SKosifCore&&SKosifCore.go(SKosifCore.view())}}
});
function overlay(t){const o=document.createElement("div");o.className="skdemo-overlay";o.innerHTML='<div><i></i><b>'+esc(t)+'</b><small>بيانات تجريبية لشركة وهمية — تُمسح بضغطة من الشريط أعلى الشاشة</small></div>';document.body.appendChild(o)}

/* ---------- first run: a brand-new device fills itself once ---------- */
async function boot(){
  const r=reg();
  if(!r.at&&!r.off&&await fresh()){overlay("نجهز بيانات تجريبية لكل الأقسام…");const res=await fill(null,{quiet:true});if(res.done.length){setTimeout(()=>location.reload(),300);return}document.querySelectorAll(".skdemo-overlay").forEach(x=>x.remove())}
  bar();
}
/* the paste-based tools show their own worked example while the demo is on (once per visit) */
const EXAMPLES={smartmatch:["#sk34-sample","#sk34-run"],excelrecon:["#sk33-xlsample","#sk33-xlrun"]},shown=new Set();
function examples(){const v=window.SKosifCore&&SKosifCore.view(),ex=EXAMPLES[v];if(!ex||shown.has(v)||!Object.keys(reg().sections).length)return;
  const a=document.querySelector(ex[0]),b=document.querySelector(ex[1]);if(!a||!b)return;shown.add(v);a.click();setTimeout(()=>b.click(),80)}
SK.bus&&SK.bus.on("render",()=>setTimeout(()=>{bar();examples()},0));
SK.bus&&SK.bus.on("nav",()=>setTimeout(bar,0));
window.addEventListener("load",()=>setTimeout(()=>boot().catch(e=>SK.errors&&SK.errors.report(e,"demo:boot")),700));
SK.demo=Object.freeze({status,fill,clear,panel,fresh,active:()=>Object.keys(reg().sections).length>0,sections:()=>SECTIONS.map(s=>({id:s.id,label:s.label,caps:s.caps.slice()})),turnOff:()=>{const r=reg();r.off=true;setReg(r)}});
})();

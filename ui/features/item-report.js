/* SQC — the item report (تقرير الصنف): everything the company knows about one raw item or box, on one page
   that prints on the letterhead. What it costs and why (the cost map's lines), its price and margin, what it
   is made of or what it goes into, who supplies it and at what price, what is in stock, how it sells month by
   month, who buys it and where. It reads the records (SK.graph, the cost-map engine, the base app's orders);
   it writes nothing. */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_itemreport_v1",APPDB="aghnam-app-v7";
const n0=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0}).format(Number(v)||0);
const n2=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2}).format(Number(v)||0);
const money=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
const pct=v=>v==null?"—":n2(v*100)+"٪";
let root=null;

function all(store){return new Promise(res=>{let q;try{q=indexedDB.open(APPDB)}catch{return res([])}q.onerror=()=>res([]);q.onupgradeneeded=()=>{};
  q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store).objectStore(store).getAll();g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
function items(){const S=SK.pricing.get()||{raws:[],boxes:[]};return[...(S.boxes||[]).filter(b=>b.status!=="archived").map(b=>({t:"box",id:String(b.id),name:b.name,cat:b.cat})),...(S.raws||[]).filter(r=>r.status!=="archived").map(r=>({t:"raw",id:String(r.id),name:r.name,cat:r.cat}))]}
async function collect(t,id){
  const S=SK.pricing.get()||{raws:[],boxes:[],salesAliases:[]},K=SK.graph.key;
  const rec=(t==="box"?S.boxes:S.raws).find(x=>String(x.id)===String(id));if(!rec)return null;
  const cat=((core()&&core().catalog().items)||[]).find(x=>x.kind===t&&String(x.id)===String(id))||{};
  let map=null;try{map=SKEngines.catalog.costMap.productCostMap(S,String(id))}catch{}
  /* the names this item sells under: its own and its aliases */
  const names=new Set([K(rec.name)]);(S.salesAliases||[]).forEach(a=>{if(String(a.itemId)===String(id))names.add(K(a.salesName))});
  const [orders,its]=await Promise.all([all("orders"),all("order_items")]);
  const oBy=new Map(orders.map(o=>[String(o.id),o]));
  const months=new Map(),cities=new Map(),buyers=new Map();let qty=0,amount=0,lines=0;const ordersSet=new Set();
  its.forEach(i=>{if(!names.has(K(i.productName||i.descriptionOriginal)))return;const o=oBy.get(String(i.orderId))||{};const q=Number(i.qty)||0,a=Number(i.amount)||0;
    qty+=q;amount+=a;lines++;ordersSet.add(String(i.orderId));
    const m=String(o.date||"").slice(0,7)||"—";const mm=months.get(m)||{q:0,a:0};mm.q+=q;mm.a+=a;months.set(m,mm);
    const c=o.city||"غير محدد";const cc=cities.get(c)||{q:0,a:0,o:0};cc.q+=q;cc.a+=a;cc.o++;cities.set(c,cc);
    const cid=String(o.customerId||"");if(cid){const b=buyers.get(cid)||{name:o.customerName||cid,city:o.city||"",q:0,a:0,o:0};b.q+=q;b.a+=a;b.o++;buyers.set(cid,b)}});
  const nb=await SK.graph.neighbours(t,id);
  const batches=(load("skosif_v31_supplier_batches",[])||[]).filter(b=>K(b.itemName)===K(rec.name)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  return{t,id,rec,cat,map,qty,amount,lines,orders:ordersSet.size,months:[...months.entries()].filter(([m])=>m!=="—").sort(),cities:[...cities.entries()].sort((a,b)=>b[1].a-a[1].a),
    buyers:[...buyers.values()].sort((a,b)=>b.a-a.a),suppliers:nb.filter(x=>x.rel==="supplies"),usedIn:nb.filter(x=>x.rel==="comp"&&x.dir==="out"),comps:nb.filter(x=>x.rel==="comp"&&x.dir==="in"),
    expenses:nb.filter(x=>x.rel==="charge"),stock:SK.graph.stockOf(rec.name),batches};
}
function section(title,body,cls){return'<section class="ir-sec'+(cls?" "+cls:"")+'"><h3>'+esc(title)+'</h3>'+body+'</section>'}
function table(head,rows,foot){return'<div class="sk-table-wrap"><table class="sk-table ir-t" data-sk-plain><thead><tr>'+head.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody>'+(foot?'<tfoot>'+foot+'</tfoot>':'')+'</table></div>'}
function reportHtml(d,forPrint){
  const r=d.rec,c=d.cat,m=d.map,box=d.t==="box";
  const kpi=(l,v,s)=>'<div class="ir-k"><small>'+esc(l)+'</small><b>'+v+'</b>'+(s?'<span>'+s+'</span>':'')+'</div>';
  let h='<header class="ir-head"><div><span class="ir-type">'+(box?"بوكس / منتج":"صنف خام")+(r.cat?" · "+esc(r.cat):"")+(r.code?" · رمز "+esc(r.code):"")+'</span><h2>'+esc(r.name)+'</h2></div></header>'+
    '<div class="ir-kpis">'+kpi("التكلفة",money(c.cost!=null?c.cost:(m&&m.total)))+kpi("سعر البيع",c.price!=null?money(c.price):"—")+kpi("الهامش",pct(c.margin!=null?c.margin:(m&&m.margin)))+
      kpi("المبيعات",money(d.amount),n0(d.qty)+" وحدة · "+n0(d.orders)+" طلب")+kpi("متوسط سعر البيع الفعلي",d.qty?money(d.amount/d.qty):"—")+(d.stock?kpi("الرصيد",n2(d.stock.stock),esc(d.stock.status||"")):"")+'</div>';
  if(m&&m.lines&&m.lines.length)h+=section("لماذا هذه التكلفة",table(["البند","الكمية","تكلفة الوحدة","المبلغ","الحصة"],m.lines.map(l=>'<tr><td>'+esc(l.name)+'</td><td class="n">'+n2(l.qty)+" "+esc(l.unit||"")+'</td><td class="n">'+money(l.unitCost)+'</td><td class="n">'+money(l.amount)+'</td><td class="n">'+pct(l.share)+'</td></tr>'),'<tr><th colspan="3">الإجمالي</th><th class="n">'+money(m.total)+'</th><th></th></tr>'));
  if(!box)h+=section("بيانات الشراء",'<dl class="ir-dl"><dt>سعر الشراء</dt><dd>'+money(r.buy)+' '+(r.vat==="incl"?"شامل الضريبة":r.vat==="none"?"بدون ضريبة":"قبل الضريبة")+'</dd><dt>نسبة الهدر</dt><dd>'+n2(r.waste)+'٪</dd><dt>النوع</dt><dd>'+(r.kind==="by"?"منتج ثانوي":"رئيسي")+'</dd>'+(r.supplier?'<dt>المورد الرئيسي</dt><dd>'+esc(r.supplier)+'</dd>':'')+'</dl>');
  if(d.suppliers.length)h+=section("الموردون وأسعارهم",table(["المورد","السعر","الوحدة","المصدر"],d.suppliers.map(s=>'<tr><td>'+esc(s.name)+'</td><td class="n">'+money(s.price)+'</td><td>'+esc(s.unit||"")+'</td><td>'+(s.derived?"من الشحنات والأوامر":"قائمة الأسعار")+'</td></tr>')));
  if(d.batches.length){const last=d.batches.slice(-8);h+=section("آخر شحنات الشراء",table(["التاريخ","المورد","الكمية","السعر","الهدر المتفق / الفعلي"],last.map(b=>'<tr><td class="n">'+esc(b.date)+'</td><td>'+esc(b.supplier)+'</td><td class="n">'+n2(b.qty)+'</td><td class="n">'+money(b.priceGross)+'</td><td class="n">'+n2(b.agreedWaste)+'٪ / '+n2(b.actualWaste)+'٪</td></tr>')))}
  if(box&&d.comps.length)h+=section("مكوّنات البوكس",table(["المكوّن","الكمية"],d.comps.map(x=>'<tr><td>'+esc(x.name)+'</td><td class="n">'+n2(x.q)+'</td></tr>')));
  if(d.usedIn.length)h+=section("يدخل في",table(["البوكس","الكمية"],d.usedIn.map(x=>'<tr><td>'+esc(x.name)+'</td><td class="n">'+n2(x.q)+'</td></tr>')));
  if(d.expenses.length)h+=section("مصروفات محمّلة",'<ul class="ir-ul">'+d.expenses.map(x=>'<li>'+esc(x.name)+'</li>').join("")+'</ul>');
  if(d.months.length){
    const last=d.months.slice(-12);
    const chart=!forPrint&&window.SKCharts?SKCharts.bars({labels:last.map(([mm])=>mm.slice(2)),series:[{name:"المبيعات (ر.س)",values:last.map(([,v])=>Math.round(v.a))}],height:200}):"";
    h+=section("المبيعات شهراً بشهر",chart+table(["الشهر","الكمية","المبيعات"],last.map(([mm,v])=>'<tr><td class="n">'+esc(mm)+'</td><td class="n">'+n2(v.q)+'</td><td class="n">'+money(v.a)+'</td></tr>'),'<tr><th>الإجمالي</th><th class="n">'+n2(d.qty)+'</th><th class="n">'+money(d.amount)+'</th></tr>'));
  }else h+=section("المبيعات",'<p class="muted">لا مبيعات مسجّلة لهذا الصنف (ولا لأسمائه في المبيعات). اربط أسماء المبيعات بالصنف من «مطابقة المبيعات».</p>');
  if(d.buyers.length)h+=section("أكبر المشترين",table(["العميل","المدينة","الطلبات","الكمية","المبيعات"],d.buyers.slice(0,10).map(b=>'<tr><td>'+esc(b.name)+'</td><td>'+esc(b.city)+'</td><td class="n">'+n0(b.o)+'</td><td class="n">'+n2(b.q)+'</td><td class="n">'+money(b.a)+'</td></tr>')),"ir-half");
  if(d.cities.length)h+=section("أين يُباع",table(["المدينة","الطلبات","المبيعات"],d.cities.slice(0,10).map(([cn,v])=>'<tr><td>'+esc(cn)+'</td><td class="n">'+n0(v.o)+'</td><td class="n">'+money(v.a)+'</td></tr>')),"ir-half");
  return h;
}
async function paint(){
  const L=items();const s=load(KEY,{})||{};let pick=s.pick&&L.find(x=>x.t+":"+x.id===s.pick)?s.pick:(L[0]?L[0].t+":"+L[0].id:"");
  if(!L.length){root.innerHTML='<div class="card ir-empty"><p class="muted">لا أصناف بعد — أضف الأصناف والبوكسات أولاً.</p></div>';return}
  root.innerHTML='<div class="ir"><div class="ir-bar"><label class="sk-field ir-pick"><span>الصنف</span><select data-ir-pick>'+
    '<optgroup label="البوكسات والمنتجات">'+L.filter(x=>x.t==="box").map(x=>'<option value="box:'+esc(x.id)+'"'+(pick==="box:"+x.id?' selected':'')+'>'+esc(x.name)+'</option>').join("")+'</optgroup>'+
    '<optgroup label="الأصناف الخام">'+L.filter(x=>x.t==="raw").map(x=>'<option value="raw:'+esc(x.id)+'"'+(pick==="raw:"+x.id?' selected':'')+'>'+esc(x.name)+'</option>').join("")+'</optgroup></select></label>'+
    '<div class="ir-acts"><button type="button" class="btn primary sm" data-ir-print>'+SK.icon("reports")+' معاينة وطباعة</button><button type="button" class="btn sm" data-ir-map>'+SK.icon("linkmap")+' في خريطة الربط</button><button type="button" class="btn ghost sm" data-ir-open>افتح الصنف</button></div></div>'+
    '<article class="card ir-doc" data-ir-doc><p class="muted">جارٍ جمع بيانات الصنف…</p></article></div>';
  const [t,...rest]=pick.split(":"),id=rest.join(":");
  const d=await collect(t,id);const doc=root.querySelector("[data-ir-doc]");if(!doc)return;
  doc.innerHTML=d?reportHtml(d,false):'<p class="muted">الصنف غير موجود.</p>';root.__ir=d;
}
function print(){
  const d=root.__ir;if(!d)return;const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","err");return}
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير الصنف — '+esc(d.rec.name)+'</title></head><body><h1>تقرير الصنف — '+esc(d.rec.name)+'</h1><p>'+new Date().toLocaleDateString("ar-SA-u-nu-latn")+'</p>'+reportHtml(d,true)+'</body></html>');
  w.document.close();SK.brandPrint(w,"تقرير الصنف");
}
function render(el){
  root=el;
  if(!el.__ir){el.__ir=true;
    el.addEventListener("change",e=>{const s=e.target.closest("[data-ir-pick]");if(s){save(KEY,{pick:s.value});paint()}});
    el.addEventListener("click",e=>{
      if(e.target.closest("[data-ir-print]"))return print();
      const d=root.__ir;if(!d)return;
      if(e.target.closest("[data-ir-map]")){core().go("linkmap");setTimeout(()=>window.SKosifLinkMap&&window.SKosifLinkMap.item(d.t,d.id),350);return}
      if(e.target.closest("[data-ir-open]")){if(!(core()&&core().openItem(d.id)))core().go(d.t==="box"?"builder":"catalog")}
    });}
  paint();
}
window.SKosifItemReport=Object.freeze({open:(t,id)=>{save(KEY,{pick:t+":"+id});core()&&core().go("itemreport")}});
SK.view("itemreport",{render});
})();

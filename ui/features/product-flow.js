/* S.kosif — Product Flow Studio + commerce warm start.
   A compact visual workspace that connects one product to cost, selling price,
   components and analysis without duplicating the accounting/pricing source of truth.
   Custom canvas nodes/positions live locally in skosif_product_flow_v1. */
(()=>{
"use strict";
const {$,$$,esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_product_flow_v1";
let root=null,selected="",drag=null;
const builtins=[
  ["cost","التكلفة","costs","تكلفة الوحدة من سجل الصنف"],
  ["price","سعر البيع","sim","سعر البيع الحالي"],
  ["margin","الهامش","sim","الفرق بين البيع والتكلفة"],
  ["vat","الضريبة","zatca","ضريبة القيمة المضافة"],
  ["breakeven","نقطة التعادل","sim","أقل سعر يغطي التكلفة"]
];
const typeLabel={component:"مكوّن",packaging:"تعبئة",expense:"مصروف",note:"ملاحظة",cost:"التكلفة",price:"سعر البيع",margin:"الهامش",vat:"الضريبة",breakeven:"نقطة التعادل"};
const posDefaults={product:[50,50],cost:[22,25],price:[78,25],margin:[78,72],vat:[50,85],breakeven:[22,72]};
const money=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
const pct=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1}).format(Number(v)||0)+"٪";
function catalog(){try{return core().catalog()||{}}catch{return {}}}
function itemList(){
  const c=catalog(),raw=Array.isArray(c.items)?c.items:Array.isArray(c.raws)?c.raws:[];
  const boxes=Array.isArray(c.boxes)?c.boxes:[];
  const out=[...raw,...boxes].filter(Boolean);
  const seen=new Set();return out.filter(x=>{const id=String(x.id??x.sku??x.name??"");if(!id||seen.has(id))return false;seen.add(id);return true});
}
const itemId=x=>String(x.id??x.sku??x.name??"");
const nameOf=x=>String(x.name??x.label??x.sku??"صنف");
const num=(...v)=>{for(const x of v){const n=Number(x);if(Number.isFinite(n)&&n>=0)return n}return 0};
function economics(x){
  const c=catalog(),vat=num(x.vatRate,c.vat,c.defaultVatRate,.15);
  const cost=num(x.defaultCost,x.purchasePrice,x.costNet,x.unitCost,x.cost);
  const priceNet=num(x.defaultPrice,x.sellingPriceNet,x.sellPriceNet,x.priceNet,x.price);
  const priceGross=num(x.sellingPriceGross,x.sellPriceGross,priceNet*(1+vat));
  const margin=priceNet>0?(priceNet-cost)/priceNet*100:0;
  return{cost,priceNet,priceGross,vat,margin,breakeven:cost};
}
function state(){const d=load(KEY,{})||{};return{selected:String(d.selected||""),products:d.products&&typeof d.products==="object"?d.products:{}}}
function put(d){save(KEY,d)}
function prodState(id){const d=state();return d.products[id]||{nodes:[],pos:{}}}
function ensureProduct(d,id){if(!d.products[id])d.products[id]={nodes:[],pos:{}};return d.products[id]}
function pxy(ps,id,fallback){const p=ps.pos&&ps.pos[id];if(p&&Number.isFinite(+p.x)&&Number.isFinite(+p.y))return[+p.x,+p.y];return fallback}
function derivedComponents(x){
  const comps=Array.isArray(x.components)?x.components:Array.isArray(x.lines)?x.lines:[];
  if(!comps.length)return[];
  const items=itemList(),map=new Map(items.map(i=>[itemId(i),i]));
  return comps.slice(0,12).map((c,i)=>{const it=map.get(String(c.itemId??c.id??""));return{id:"derived-"+i,type:"component",label:nameOf(it||c),value:c.quantity!=null?String(c.quantity):"",derived:true}})
}
function nodeData(x,ps){
  const e=economics(x),nodes=[{id:"product",type:"product",label:nameOf(x),value:String(x.sku||x.category||x.unit||"")}];
  const has=new Set((ps.nodes||[]).map(n=>n.type));
  const addBuiltin=(type,label,value)=>{if(has.has(type)||["cost","price"].includes(type))nodes.push({id:type,type,label,value,builtin:true})};
  addBuiltin("cost","التكلفة",money(e.cost));addBuiltin("price","سعر البيع",money(e.priceGross||e.priceNet));
  if(has.has("margin"))addBuiltin("margin","الهامش",pct(e.margin));
  if(has.has("vat"))addBuiltin("vat","الضريبة",pct(e.vat*100));
  if(has.has("breakeven"))addBuiltin("breakeven","نقطة التعادل",money(e.breakeven));
  const custom=(ps.nodes||[]).filter(n=>!["cost","price","margin","vat","breakeven"].includes(n.type));
  return nodes.concat(derivedComponents(x)).concat(custom);
}
function defaultPos(n,i,total){
  if(posDefaults[n.id])return posDefaults[n.id];
  const angle=(i/Math.max(1,total))*Math.PI*2-Math.PI/2,r=32;
  return[50+Math.cos(angle)*r,50+Math.sin(angle)*r];
}
function nodeHtml(n,p){
  const fixed=n.id==="product",del=!fixed&&!n.builtin&&!n.derived;
  return '<div class="pf-node pf-'+esc(n.type)+'" data-node="'+esc(n.id)+'" data-x="'+p[0]+'" data-y="'+p[1]+'" style="left:'+p[0]+'%;top:'+p[1]+'%" tabindex="0" role="button" aria-label="'+esc(n.label)+'">'+
    (del?'<button type="button" class="pf-del" data-pf="delete" data-id="'+esc(n.id)+'" aria-label="حذف">×</button>':'')+
    '<span class="pf-ntag">'+esc(typeLabel[n.type]||"المنتج")+'</span><b>'+esc(n.label)+'</b>'+(n.value?'<small>'+esc(n.value)+'</small>':'')+'</div>';
}
function edgesHtml(nodes,pos){
  return '<svg class="pf-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="pf-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs>'+nodes.filter(n=>n.id!=="product").map(n=>{const a=pos.product,b=pos[n.id];return '<line data-edge="'+esc(n.id)+'" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" marker-end="url(#pf-arrow)"/>'}).join("")+'</svg>';
}
function group(title,desc,body,open=true){return '<details class="pf-group"'+(open?' open':'')+'><summary><span><b>'+esc(title)+'</b><small>'+esc(desc)+'</small></span><span class="pf-chev">⌄</span></summary><div class="pf-groupb">'+body+'</div></details>'}
function addButtons(ps){
  const has=new Set((ps.nodes||[]).map(n=>n.type));
  const btn=(t,l,ic)=>'<button type="button" class="pf-add" data-pf="add-type" data-type="'+t+'"'+(has.has(t)?' disabled':'')+'>'+SK.icon(ic||"action")+'<span>'+l+'</span></button>';
  return group("الأساسيات","أهم ما تحتاجه حول المنتج",btn("cost","التكلفة","costs")+btn("price","سعر البيع","sim")+btn("margin","هامش الربح","reports"),true)+
    group("التصنيع والمكونات","اجمع ما يدخل في المنتج",btn("component","مكوّن","builder")+btn("packaging","تعبئة","inventory")+btn("expense","مصروف مباشر","costs"),true)+
    group("التحليل والرقابة","أضف مؤشرات فقط عند الحاجة",btn("vat","الضريبة","zatca")+btn("breakeven","نقطة التعادل","sim")+btn("note","ملاحظة","memo"),false);
}
function linkGroups(){
  const b=(id,l,ic)=>'<button type="button" class="pf-link" data-pf="go" data-go="'+id+'">'+SK.icon(ic||id)+'<span>'+l+'</span></button>';
  return group("الشاشات المرتبطة","بدل تكرار الأدوات، افتح الأصل من هنا",b("catalog","الأصناف والأسعار")+b("costs","التكاليف")+b("sim","التسعير")+b("builder","المكونات والبوكسات")+b("memo","اعتماد السعر"),false)+
    group("تحليل متقدم","الأدوات الدقيقة عند الحاجة فقط",b("kernel","نواة التسعير")+b("analyzer","تحليل المكونات")+b("compare","المقارنة التحليلية"),false);
}
function formHtml(){return '<div class="pf-form" id="pf-form" hidden><label class="sk-field"><span>الاسم</span><input id="pf-label" placeholder="مثال: لحم مفروم"></label><label class="sk-field"><span>القيمة / الكمية</span><input id="pf-value" placeholder="مثال: 0.5 كجم"></label><div class="sk-actions"><button type="button" class="btn primary sm" data-pf="save-node">إضافة للخريطة</button><button type="button" class="btn sm" data-pf="cancel-node">إلغاء</button></div></div>'}
function paint(){
  if(!root)return;const items=itemList();
  if(!items.length){root.innerHTML=SK.ui.state.empty({icon:"catalog",title:"لا توجد أصناف بعد",text:"أضف أول صنف من سجل الأسعار، ثم ارجع إلى خريطة المنتج لربطه بالتكلفة والبيع والمكونات.",action:"فتح الأصناف",act:"nav",value:"catalog"});return}
  let d=state();if(!selected)selected=d.selected&&items.some(x=>itemId(x)===d.selected)?d.selected:itemId(items[0]);
  const x=items.find(i=>itemId(i)===selected)||items[0];selected=itemId(x);d.selected=selected;put(d);
  const ps=prodState(selected),nodes=nodeData(x,ps),pos={};nodes.forEach((n,i)=>pos[n.id]=pxy(ps,n.id,defaultPos(n,i,nodes.length)));
  const e=economics(x);
  root.innerHTML='<div class="pf-shell"><section class="pf-head card"><div><span class="pf-eyebrow">PRODUCT FLOW</span><h2>خريطة المنتج</h2><p>اختَر منتجًا، ثم أضف ما يهمك فقط. كل مربع مرتبط بالمنتج، والشاشات الأصلية تظل مصدر البيانات.</p></div><div class="pf-select"><label>المنتج</label><select id="pf-product">'+items.map(i=>'<option value="'+esc(itemId(i))+'"'+(itemId(i)===selected?' selected':'')+'>'+esc(nameOf(i))+'</option>').join("")+'</select></div></section>'+
    '<div class="pf-work"><section class="pf-board card"><div class="pf-boardtop"><div><b>'+esc(nameOf(x))+'</b><small>اسحب المربعات لترتيبها كما تريد</small></div><div class="pf-mini"><span>تكلفة '+money(e.cost)+'</span><span>بيع '+money(e.priceGross||e.priceNet)+'</span><span>هامش '+pct(e.margin)+'</span></div></div><div class="pf-canvas" id="pf-canvas">'+edgesHtml(nodes,pos)+nodes.map(n=>nodeHtml(n,pos[n.id])).join("")+'</div></section>'+
    '<aside class="pf-side card"><div class="pf-sidehead"><b>إضافة إلى الخريطة</b><small>المجموعات مرتبة، والمكرر لا يظهر مرتين.</small></div>'+formHtml()+addButtons(ps)+linkGroups()+'</aside></div></div>';
  bindDrag();
}
function addType(type){
  if(["cost","price","margin","vat","breakeven"].includes(type)){
    const d=state(),ps=ensureProduct(d,selected);if(!ps.nodes.some(n=>n.type===type))ps.nodes.push({id:type,type,label:typeLabel[type],value:"",builtin:true});put(d);paint();return;
  }
  const f=$("#pf-form",root);if(!f)return;f.hidden=false;f.dataset.type=type;$("#pf-label",f).value="";$("#pf-value",f).value="";$("#pf-label",f).placeholder=type==="component"?"مثال: لحم مفروم":type==="packaging"?"مثال: صحن وغطاء":type==="expense"?"مثال: تجهيز":"اكتب الملاحظة";$("#pf-label",f).focus();
}
function saveNode(){const f=$("#pf-form",root),type=f?.dataset.type||"note",label=$("#pf-label",f)?.value.trim(),value=$("#pf-value",f)?.value.trim();if(!label){toast("اكتب اسم العنصر أولاً","warn");return}const d=state(),ps=ensureProduct(d,selected);const id="n-"+Date.now().toString(36);ps.nodes.push({id,type,label,value});put(d);paint()}
function delNode(id){const d=state(),ps=ensureProduct(d,selected);ps.nodes=(ps.nodes||[]).filter(n=>n.id!==id);if(ps.pos)delete ps.pos[id];put(d);paint()}
function bind(node){
  node.addEventListener("change",e=>{if(e.target.id==="pf-product"){selected=e.target.value;const d=state();d.selected=selected;put(d);paint()}});
  node.addEventListener("click",e=>{const b=e.target.closest("[data-pf]");if(!b)return;const a=b.dataset.pf;if(a==="add-type")addType(b.dataset.type);else if(a==="save-node")saveNode();else if(a==="cancel-node"){$("#pf-form",root).hidden=true}else if(a==="delete")delNode(b.dataset.id);else if(a==="go")core().go(b.dataset.go)});
}
function bindDrag(){
  const canvas=$("#pf-canvas",root);if(!canvas)return;
  $$(".pf-node",canvas).forEach(n=>n.addEventListener("pointerdown",e=>{
    if(e.target.closest(".pf-del"))return;e.preventDefault();n.setPointerCapture&&n.setPointerCapture(e.pointerId);drag={node:n,id:n.dataset.node,pid:e.pointerId};n.classList.add("dragging");
  }));
  canvas.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.pid)return;const r=canvas.getBoundingClientRect(),x=Math.max(6,Math.min(94,(e.clientX-r.left)/r.width*100)),y=Math.max(8,Math.min(92,(e.clientY-r.top)/r.height*100));drag.node.style.left=x+"%";drag.node.style.top=y+"%";drag.node.dataset.x=x.toFixed(2);drag.node.dataset.y=y.toFixed(2);const line=canvas.querySelector('[data-edge="'+CSS.escape(drag.id)+'"]');if(line){line.setAttribute("x2",x);line.setAttribute("y2",y)}if(drag.id==="product")$$('.pf-lines line',canvas).forEach(l=>{l.setAttribute("x1",x);l.setAttribute("y1",y)})});
  const end=e=>{if(!drag||e.pointerId!==drag.pid)return;const d=state(),ps=ensureProduct(d,selected);ps.pos=ps.pos||{};ps.pos[drag.id]={x:+drag.node.dataset.x,y:+drag.node.dataset.y};put(d);drag.node.classList.remove("dragging");drag=null};canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);
}
/* Commerce: the old screen exposes a manual “load full …” action. On first entry we invoke that
   data-loading action once when it is present, then remember the warm start on this device. */
const WARM="skosif_commerce_warm_v1";
function warmCommerce(node){
  if(!node||sessionStorage.getItem(WARM)==="1")return;sessionStorage.setItem(WARM,"1");
  const tryLoad=()=>{
    const buttons=$$("button,[role=button]",node);
    const b=buttons.find(x=>{const t=String(x.textContent||"").replace(/s+/g," ").trim();return /(تحميل|جلب|إظهار)/.test(t)&&/(كامل|كاملة|الكل|البيانات)/.test(t)&&!/(نسخة احتياط|تصدير|تنزيل)/.test(t)});
    if(b&&!b.disabled){b.click();b.hidden=true;toast("تم تحميل بيانات الطلبات والتحصيل تلقائيًا","info");return true}return false;
  };
  const ok=tryLoad();if(!ok){setTimeout(()=>{if(!tryLoad())setTimeout(tryLoad,450)},120)}
}
SK.view("productflow",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
function boot(){const c=core();if(!c||!c.onView){setTimeout(boot,250);return}c.onView("commerce",node=>setTimeout(()=>warmCommerce(node),0))}
boot();
})();
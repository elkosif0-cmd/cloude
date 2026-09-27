/* S.kosif — Product Flow Studio + commerce warm start.
   The product's cost map: the product in the middle, what goes into its cost on one side and its price, margin, VAT
   and break-even on the other. Every input comes from the pricing record through SKEngines.catalog.costMap (the
   pricing engine's own formulas), so the map's cost reconciles to the catalogue's. A click on a box opens its formula
   and its what-if; under the map: what-if, the drivers of the margin, the IAS 2 view and the controls. The source
   screens stay the truth — the map never writes the pricing record. Custom boxes, positions and the what-if live
   locally in skosif_product_flow_v1. */
(()=>{
"use strict";
const {$,$$,esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const CM=()=>window.SKEngines&&SKEngines.catalog&&SKEngines.catalog.costMap;
const KEY="skosif_product_flow_v1",PRICING="aghnam-pricing-v3",LV=2;
let root=null,selected="",drag=null,focus="",lastNarrow=null,lastWide=null;
const COSTED=["component","packaging","expense"];
const typeLabel={component:"مكوّن مقترح",packaging:"تعبئة مقترحة",expense:"مصروف مقترح",note:"ملاحظة",cost:"التكلفة",price:"سعر البيع",margin:"الهامش",vat:"الضريبة",breakeven:"نقطة التعادل",
  purchase:"الشراء",waste:"الهدر",raw:"مكوّن خام",box:"بوكس داخلي",overhead:"تكلفة إضافية",dish:"الصحون",other:"أخرى"};
const lineTag={expense:"مصروف مرتبط"};
const CLS={materials:"مواد مباشرة وتعبئة",conversion:"تكاليف تحويل وتجهيز",selling:"تكاليف بيع وتوصيل",admin:"مصروفات إدارية"};
const fmt=(v,d=2)=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:d}).format(Number(v)||0);
const money=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
const pct=v=>fmt(v,1)+"٪";
const pts=v=>(v>0?"+":"")+fmt(v,1)+" نقطة";
const n0=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
function catalog(){try{return core().catalog()||{}}catch{return {}}}
function itemList(){
  const c=catalog(),raw=Array.isArray(c.items)?c.items:Array.isArray(c.raws)?c.raws:[];
  const boxes=Array.isArray(c.boxes)?c.boxes:[];
  const out=[...raw,...boxes].filter(x=>x&&x.status!=="archived");
  const seen=new Set();return out.filter(x=>{const id=String(x.id??x.sku??x.name??"");if(!id||seen.has(id))return false;seen.add(id);return true});
}
const itemId=x=>String(x.id??x.sku??x.name??"");
const nameOf=x=>String(x.name??x.label??x.sku??"صنف");
function state(){const d=load(KEY,{})||{};return{selected:String(d.selected||""),tab:String(d.tab||"whatif"),products:d.products&&typeof d.products==="object"?d.products:{},classes:d.classes&&typeof d.classes==="object"?d.classes:{}}}
function put(d){save(KEY,d)}
function ensureProduct(d,id){if(!d.products[id])d.products[id]={nodes:[],pos:{}};const p=d.products[id];p.nodes=Array.isArray(p.nodes)?p.nodes:[];return p}
function update(fn){const d=state(),ps=ensureProduct(d,selected);fn(ps,d);put(d);paint()}
const isDraft=n=>COSTED.includes(n.type)&&n0(n.unitCost)>0;

/* ---- the numbers: the pricing record through the cost-map engine; the catalogue's totals when the record lacks the product ---- */
function mapFor(x,classes){
  const E=CM(),S=load(PRICING,null);
  if(E&&S){try{const m=E.productCostMap(S,itemId(x),{classes});if(m)return m}catch(e){console.warn("cost map",e)}}
  const c=catalog(),vat=Number(c.vat)>0?Number(c.vat):.15,cost=n0(x.cost),price=n0(x.price),pn=price/(1+vat),net=c.netBase!==false,base=net?pn:price;
  return{id:itemId(x),kind:x.kind==="box"?"box":"raw",name:nameOf(x),lines:cost>0?[{key:"cost",kind:"purchase",refId:itemId(x),name:"تكلفة الصنف",qty:1,unit:"وحدة",unitCost:cost,amount:cost,share:1,formula:["من سجل الأصناف"],cls:"materials"}]:[],
    components:cost,total:cost,weight:n0(x.weight),dishes:0,hasPrice:price>0,price,priceNet:pn,vatAmount:price-pn,profit:price>0?pn-cost:0,margin:price>0&&base>0?(pn-cost)/base:null,marginBase:net?"net":"gross",
    breakeven:cost*(1+vat),targetRate:.25,target:n0(x.target)||null,band:x.band||"na",missing:0,cycle:false,vatRate:vat,yieldMethod:c.yieldMethod!==false,rounding:"",good:.15,excellent:.25,fallback:true};
}
function ctxOf(x,d){
  const E=CM(),ps=d.products[itemId(x)]||{nodes:[],pos:{}},m=mapFor(x,d.classes),w=ps.whatIf||{};
  const drafts=(ps.nodes||[]).filter(isDraft).map(n=>({id:n.id,type:n.type,label:n.label,qty:n0(n.qty)||1,unitCost:n0(n.unitCost),vat:n.vat==="incl"?"incl":"excl",method:n.method==="pct"?"pct":"unit"}));
  const wi={priceGross:n0(w.price)>0?n0(w.price):null,costPct:n0(w.costPct),lines:w.lines||{},drafts,targetRate:w.target!=null&&w.target!==""?n0(w.target)/100:undefined};
  const sc=E?E.scenario(m,wi):null;
  const checks=E?E.costChecks(m,{catalogCost:m.fallback?null:(x.cost!=null?Number(x.cost):null),drafts:drafts.length}):[];
  return{x,m,ps,w,wi,sc,checks,drafts,E,iv:E?E.inventoryView(m):null,sens:E?E.sensitivity(m):[],ceil:E?E.costCeiling(m):null};
}

/* ---- nodes and layout ---- */
function buildNodes(k){
  const {x,m,ps,sc}=k,changed=sc&&sc.changed>0,rows=new Map((sc?sc.rows:[]).map(r=>[r.key,r]));
  const alt=(a,b,f)=>changed&&b!=null&&Math.abs(a-b)>0.004?f(b):"";
  const has=new Set((ps.nodes||[]).map(n=>n.type));
  const nodes=[{id:"product",type:"product",role:"product",label:nameOf(x),value:(m.kind==="box"?"بوكس":"صنف خام")+(m.weight&&m.kind==="box"?" · "+fmt(m.weight,3)+" كجم":"")}];
  nodes.push({id:"cost",type:"cost",role:"cost",label:"التكلفة",value:money(m.total),alt:alt(m.total,sc&&sc.total,money)});
  nodes.push({id:"price",type:"price",role:"output",label:"سعر البيع",value:m.hasPrice?money(m.price)+" شامل":"بلا سعر",alt:alt(m.price,sc&&sc.price,money)});
  nodes.push({id:"margin",type:"margin",role:"output",label:"الهامش",band:m.band,value:m.margin!=null?pct(m.margin*100)+" · ربح "+money(m.profit):"—",alt:changed&&sc.deltaMarginPts?pct((sc.margin||0)*100)+" ("+pts(sc.deltaMarginPts)+")":""});
  if(has.has("breakeven"))nodes.push({id:"breakeven",type:"breakeven",role:"output",label:"نقطة التعادل",value:money(m.breakeven)+" شامل",alt:alt(m.breakeven,sc&&sc.breakeven,money)});
  if(has.has("vat"))nodes.push({id:"vat",type:"vat",role:"output",label:"الضريبة",value:pct(m.vatRate*100)+" · "+money(m.vatAmount)});
  const lines=[...m.lines],shown=lines.length>10?lines.slice(0,9):lines,rest=lines.length>10?lines.slice(9):[];
  shown.forEach(l=>{const r=rows.get(l.key);nodes.push({id:"L:"+l.key,type:l.kind,role:"input",label:l.name,line:l,share:l.share,
    value:money(l.amount)+" · "+pct(l.share*100),sub:(l.kind==="raw"||l.kind==="box")?fmt(l.qty,3)+" "+l.unit+" × "+fmt(l.unitCost):"",alt:r?alt(r.before,r.amount,money):""})});
  if(rest.length){const a=rest.reduce((s,l)=>s+l.amount,0);nodes.push({id:"L:rest",type:"other",role:"input",label:"أخرى ("+rest.length+")",share:m.total>0?a/m.total:0,value:money(a)})}
  const dAmt=new Map((sc?sc.drafts:[]).map(d=>[d.id,d.amount]));
  (ps.nodes||[]).forEach(n=>{
    if(["cost","price","margin","vat","breakeven"].includes(n.type))return;
    if(isDraft(n))nodes.push({id:n.id,type:n.type,role:"input",draft:true,custom:n,label:n.label,share:m.total>0?(dAmt.get(n.id)||0)/m.total:0,value:money(dAmt.get(n.id)||0)+" · مقترح"});
    else nodes.push({id:n.id,type:n.type,role:"note",custom:n,legacy:COSTED.includes(n.type),label:n.label,value:n.value||(COSTED.includes(n.type)?"أضف الكمية والتكلفة ليُحتسب":"")});
  });
  return nodes;
}
function spread(j,k,a,b,gap){if(k<=1)return(a+b)/2;const step=Math.min(gap,(b-a)/(k-1));return(a+b)/2+(j-(k-1)/2)*step}
function layout(nodes,W,narrow){
  const P={},ins=nodes.filter(n=>n.role==="input"),outs=nodes.filter(n=>n.role==="output"),notes=nodes.filter(n=>n.role==="note");
  if(!narrow){
    const H=Math.max(610,ins.length*128+80,outs.length*130+80),xm=Math.min(14,86/W*100),col=k=>100-xm-(100-2*xm)*k/3,gy=128/H*100;
    ins.forEach((n,i)=>P[n.id]=[col(0),spread(i,ins.length,9,91,gy)]);
    P.cost=[col(1),notes.length?42:50];P.product=[col(2),notes.length?42:50];
    outs.forEach((n,i)=>P[n.id]=[col(3),spread(i,outs.length,14,86,Math.max(gy,22))]);
    notes.forEach((n,i)=>P[n.id]=[spread(i%3,Math.min(3,notes.length-Math.floor(i/3)*3),col(2)-20,col(1)+2,24),84-Math.floor(i/3)*(gy)]);
    return{P,H};
  }
  const two=(list,start,R)=>list.forEach((n,i)=>{const last=i===list.length-1&&i%2===0;P[n.id]=[last?50:(i%2?27:73),(start+Math.floor(i/2)+.5)/R*100]});
  const ri=Math.ceil(ins.length/2),ro=Math.ceil(outs.length/2),rn=Math.ceil(notes.length/2),R=ri+2+ro+rn;
  two(ins,0,R);P.cost=[50,(ri+.5)/R*100];P.product=[50,(ri+1.5)/R*100];two(outs,ri+2,R);two(notes,ri+2+ro,R);
  return{P,H:R*118+24};
}
function nodeHtml(n,p){
  const del=!!n.custom,cls=["pf-node","pf-"+n.type,n.draft?"pf-draft":"",n.legacy?"pf-legacy":"",n.alt?"pf-changed":"",focus===n.id?"pf-focus":"",n.band?"pf-band-"+n.band:""].filter(Boolean).join(" ");
  const tag=n.draft||n.custom?typeLabel[n.type]:n.line?(lineTag[n.type]||typeLabel[n.type]):typeLabel[n.type]||"المنتج";
  return '<div class="'+cls+'" data-node="'+esc(n.id)+'" data-x="'+p[0]+'" data-y="'+p[1]+'" style="left:'+p[0]+'%;top:'+p[1]+'%" tabindex="0" role="button" aria-label="'+esc(n.label+" — "+(n.value||""))+'">'+
    (del?'<button type="button" class="pf-del" data-pf="delete" data-id="'+esc(n.id)+'" aria-label="حذف">×</button>':'')+
    '<span class="pf-ntag">'+esc(tag)+'</span><b>'+esc(n.label)+'</b>'+(n.value?'<small>'+esc(n.value)+'</small>':'')+(n.sub?'<small class="pf-sub">'+esc(n.sub)+'</small>':'')+
    (n.alt?'<small class="pf-alt">ماذا لو: '+esc(n.alt)+'</small>':'')+(n.share!=null&&n.role==="input"?'<i class="pf-share" style="--w:'+Math.max(2,Math.round(n.share*100))+'%"></i>':'')+'</div>';
}
function edgeOf(n){return n.role==="input"?[n.id,"cost"]:n.role==="cost"?["cost","product"]:n.role==="note"?[n.id,"product"]:n.id==="price"?["product","price"]:n.id==="breakeven"?["cost",n.id]:["price",n.id]}
function edgesHtml(nodes,pos){
  return '<svg class="pf-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+nodes.filter(n=>n.id!=="product").map(n=>{
    const [a,b]=edgeOf(n),A=pos[a],B=pos[b];if(!A||!B)return"";
    const w=n.role==="input"?(1.2+Math.min(1,n.share||0)*8).toFixed(1):"1.6",c=n.role==="input"?(n.draft?"pf-e-draft":"pf-e-in"):n.role==="note"?"pf-e-note":"pf-e-out";
    return '<line class="'+c+'" data-a="'+esc(a)+'" data-b="'+esc(b)+'" x1="'+A[0]+'" y1="'+A[1]+'" x2="'+B[0]+'" y2="'+B[1]+'" style="stroke-width:'+w+'px"/>'}).join("")+'</svg>';
}

/* ---- side panel: add, inspector, links ---- */
function group(title,desc,body,open=true){return '<details class="pf-group"'+(open&&innerWidth>900?' open':'')+'><summary><span><b>'+esc(title)+'</b><small>'+esc(desc)+'</small></span><span class="pf-chev">⌄</span></summary><div class="pf-groupb">'+body+'</div></details>'}
function addButtons(k){
  const has=new Set((k.ps.nodes||[]).map(n=>n.type)),bad=k.checks.filter(c=>c.level==="bad"||c.level==="warn").length;
  const btn=(t,l,ic,dis)=>'<button type="button" class="pf-add" data-pf="add-type" data-type="'+t+'"'+(dis?' disabled':'')+'>'+SK.icon(ic||"action")+'<span>'+l+'</span></button>';
  const tb=(t,l,ic,badge)=>'<button type="button" class="pf-add" data-pf="tab" data-tab="'+t+'">'+SK.icon(ic)+'<span>'+l+(badge?' <em class="pf-badge">'+badge+'</em>':'')+'</span></button>';
  return group("المؤشرات","أضف ما تريد رؤيته على الخريطة",btn("breakeven","نقطة التعادل","sim",has.has("breakeven"))+btn("vat","الضريبة","zatca",has.has("vat"))+btn("note","ملاحظة","memo"),true)+
    group("التصنيع والمكونات","عنصر مقترح بكمية وتكلفة — يدخل في «ماذا لو»",btn("component","مكوّن","builder")+btn("packaging","تعبئة","inventory")+btn("expense","مصروف مباشر","costs"),true)+
    group("التحليل والرقابة","تحت الخريطة، محسوب من السجل",tb("whatif","ماذا لو","calc")+tb("drivers","ما يحرّك الهامش","sensitivity")+tb("ias2","المخزون IAS 2","nrv")+tb("checks","الرقابة","check",bad),true);
}
function linkGroups(){
  const b=(id,l,ic)=>'<button type="button" class="pf-link" data-pf="go" data-go="'+id+'">'+SK.icon(ic||id)+'<span>'+l+'</span></button>';
  return group("الشاشات المرتبطة","بدل تكرار الأدوات، افتح الأصل من هنا",b("catalog","الأصناف والأسعار")+b("costs","التكاليف")+b("sim","التسعير")+b("builder","المكونات والبوكسات")+b("memo","اعتماد السعر"),false)+
    group("تحليل متقدم","الأدوات الدقيقة عند الحاجة فقط",b("kernel","نواة التسعير")+b("analyzer","تحليل المكونات")+b("compare","المقارنة التحليلية"),false);
}
const fld=(id,label,val,attrs="")=>'<label class="sk-field"><span>'+label+'</span><input id="'+id+'" value="'+esc(val??"")+'" '+attrs+'></label>';
function formHtml(){return '<div class="pf-form" id="pf-form" hidden><b class="pf-formt" id="pf-formt">عنصر جديد</b>'+fld("pf-label","الاسم","",'placeholder="مثال: علبة فلين"')+
  '<div class="pf-costed pf-row2">'+fld("pf-qty","الكمية للوحدة","1",'inputmode="decimal"')+fld("pf-unit","تكلفة الوحدة (ر.س)","",'inputmode="decimal" placeholder="0.00"')+'</div>'+
  '<div class="pf-costed pf-row2"><label class="sk-field"><span>الضريبة</span><select id="pf-vat"><option value="excl">السعر قبل الضريبة</option><option value="incl">السعر شامل الضريبة</option></select></label>'+
  '<label class="sk-field pf-exp-only"><span>الاحتساب</span><select id="pf-method"><option value="unit">مبلغ للوحدة</option><option value="pct">٪ من تكلفة المكونات</option></select></label></div>'+
  '<label class="sk-field pf-note-only"><span>النص</span><input id="pf-value" placeholder="مثال: يُراجع السعر كل شهر"></label>'+
  '<div class="sk-actions"><button type="button" class="btn primary sm" data-pf="save-node">إضافة للخريطة</button><button type="button" class="btn sm" data-pf="cancel-node">إلغاء</button></div></div>'}
function formula(list){return list&&list.length?'<ol class="pf-formula">'+list.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>':""}
function kv(rows){return '<dl class="pf-kv">'+rows.filter(Boolean).map(([a,b,c])=>'<div'+(c?' class="'+c+'"':'')+'><dt>'+esc(a)+'</dt><dd>'+b+'</dd></div>').join("")+'</dl>'}
function inspHtml(k,nodes){
  const n=nodes.find(z=>z.id===focus);if(!n)return"";
  const {m,sc,w,E}=k,head='<div class="pf-insph"><span class="pf-ntag">'+esc(n.custom?typeLabel[n.type]:n.line?(lineTag[n.type]||typeLabel[n.type]):typeLabel[n.type]||"المنتج")+'</span><b>'+esc(n.label)+'</b><button type="button" class="pf-x" data-pf="focus-close" aria-label="إغلاق">×</button></div>';
  let body="";
  if(n.line){
    const l=n.line,ch=(w.lines||{})[l.key]||{},wi=(key,label,val,ph)=>'<label class="sk-field"><span>'+label+'</span><input data-wi="'+key+'" data-key="'+esc(l.key)+'" value="'+esc(val??"")+'" placeholder="'+esc(ph)+'" inputmode="decimal"></label>';
    body=kv([["المبلغ للوحدة",money(l.amount)],["نصيبه من التكلفة",pct(l.share*100)],l.qty&&l.unit?["الكمية",fmt(l.qty,3)+" "+esc(l.unit)+" × "+fmt(l.unitCost,4)]:null,
      l.wasteRate?["الهدر",pct(l.wasteRate*100)]:null,["أثر +10٪ على الهامش",(()=>{const s=k.sens.find(z=>z.key===l.key);return s?pts(s.dMarginPts):"—"})()]])+formula(l.formula)+
      (l.kind==="expense"||l.kind==="overhead"?'<label class="sk-field"><span>التصنيف وفق IAS 2</span><select data-pf-cls="'+esc(l.refId)+'">'+Object.entries(CLS).map(([v,t])=>'<option value="'+v+'"'+(l.cls===v?' selected':'')+'>'+t+'</option>').join("")+'</select></label>':'')+
      '<div class="pf-insw"><b>ماذا لو لهذا العنصر</b><div class="pf-row2">'+wi("unitPct","تغيّر سعر الوحدة ٪",ch.unitPct,"0")+
      ((l.kind==="raw"||l.kind==="box")?wi("qty","الكمية",ch.qty,String(l.qty)):"")+((l.kind==="raw"&&l.wasteRate!=null)||l.kind==="waste"?wi("waste","الهدر ٪",ch.waste,fmt((l.wasteRate||0)*100,2)):"")+'</div></div>'+
      '<div class="sk-actions">'+((l.kind==="raw"||l.kind==="box"||l.kind==="purchase"||l.kind==="waste")?'<button type="button" class="btn sm" data-pf="open-src" data-id="'+esc(l.refId)+'">فتح الصنف في السجل</button>':l.kind==="expense"?'<button type="button" class="btn sm" data-pf="go" data-go="costs">فتح المصروفات</button>':'<button type="button" class="btn sm" data-pf="open-src" data-id="'+esc(m.id)+'">فتح البوكس في السجل</button>')+'</div>';
  }else if(n.custom){
    const c=n.custom,costed=COSTED.includes(c.type);
    body=(n.draft?kv([["أثره على التكلفة",money((sc?sc.drafts:[]).find(d=>d.id===c.id)?.amount||0)],["الحالة","مقترح — غير مسجل في الأصناف"]]):"")+
      '<div class="pf-edit" data-id="'+esc(c.id)+'">'+fld("pf-e-label","الاسم",c.label)+(costed?'<div class="pf-row2">'+fld("pf-e-qty","الكمية للوحدة",c.qty??1,'inputmode="decimal"')+fld("pf-e-unit","تكلفة الوحدة (ر.س)",c.unitCost??"",'inputmode="decimal" placeholder="0.00"')+'</div>'+
      '<div class="pf-row2"><label class="sk-field"><span>الضريبة</span><select id="pf-e-vat"><option value="excl">قبل الضريبة</option><option value="incl"'+(c.vat==="incl"?" selected":"")+'>شامل الضريبة</option></select></label>'+
      (c.type==="expense"?'<label class="sk-field"><span>الاحتساب</span><select id="pf-e-method"><option value="unit">مبلغ للوحدة</option><option value="pct"'+(c.method==="pct"?" selected":"")+'>٪ من المكونات</option></select></label>':"")+'</div>':"")+
      fld("pf-e-value",costed?"ملاحظة":"النص",c.value||"")+'<div class="sk-actions"><button type="button" class="btn primary sm" data-pf="save-edit">حفظ</button><button type="button" class="btn sm" data-pf="delete" data-id="'+esc(c.id)+'">حذف</button></div></div>'+
      (n.legacy?'<p class="pf-hint">هذا العنصر نصي من النسخة السابقة؛ أدخل الكمية وتكلفة الوحدة ليدخل في الحساب.</p>':"");
  }else if(n.id==="cost"){
    const iv=k.iv,rec=k.checks.find(c=>c.code==="reconciled"||c.code==="unreconciled");
    body=kv([["تكلفة الوحدة",money(m.total)],["المكونات",money(m.components)],iv?["مواد وتعبئة",money(iv.materials)]:null,iv&&iv.conversion?["تحويل وتجهيز",money(iv.conversion)]:null,iv&&iv.selling?["بيع وتوصيل",money(iv.selling)]:null,iv&&iv.admin?["إدارية",money(iv.admin)]:null,
      sc&&sc.changed?["في ماذا لو",money(sc.total)+" ("+(sc.deltaTotal>0?"+":"")+fmt(sc.deltaTotal)+")","pf-kv-alt"]:null])+(rec?'<p class="pf-chk pf-'+rec.level+'">'+esc(rec.text)+'</p>':"")+
      '<p class="pf-hint">'+(m.yieldMethod?"الهدر بطريقة العائد: تكلفة الكجم الصالح = الصافي ÷ (1 − الهدر).":"الهدر بطريقة الإضافة: الصافي × (1 + الهدر).")+' المشتريات الشاملة للضريبة تُحتسب صافية.</p>';
  }else if(n.id==="price"){
    body=kv([["السعر شامل الضريبة",m.hasPrice?money(m.price):"—"],["صافي البيع",money(m.priceNet)],["الضريبة",money(m.vatAmount)],["السعر للهامش المستهدف ("+pct(m.targetRate*100)+")",m.target!=null?money(m.target):"—"]])+
      fld("pf-wi-price2","جرّب سعرًا (شامل)",w.price||"",'inputmode="decimal" placeholder="'+esc(m.price||"")+'"')+
      '<div class="sk-actions">'+(m.target!=null?'<button type="button" class="btn sm" data-pf="use-target">استخدم السعر المقترح</button>':'')+'<button type="button" class="btn sm" data-pf="go" data-go="memo">اعتماد السعر</button></div>';
  }else if(n.id==="margin"){
    const c=k.ceil;
    body=kv([["الهامش",m.margin!=null?pct(m.margin*100):"—"],["أساس الهامش",m.marginBase==="net"?"صافي البيع":"السعر شامل الضريبة"],["الربح للوحدة",money(m.profit)],["المستهدف",pct(m.targetRate*100)],
      c?["سقف التكلفة للهامش المستهدف",money(c.ceiling)]:null,c?["المتاح تحت السقف",money(c.headroom)+" ("+(c.headroomPct>0?"+":"")+fmt(c.headroomPct,1)+"٪)",c.headroom<0?"pf-kv-bad":""]:null])+
      '<p class="pf-hint">سقف التكلفة: أعلى تكلفة يتحملها السعر الحالي مع بقاء الهامش عند المستهدف.</p>';
  }else if(n.id==="breakeven"){
    const f=n0(k.ps.fixed),u=E&&f>0?E.breakevenUnits(m,f,sc?sc.profit:m.profit):null;
    body=kv([["سعر التعادل شامل الضريبة",money(m.breakeven)],["هامش الأمان",m.hasPrice&&m.price>0?pct((m.price-m.breakeven)/m.price*100):"—"],u?["وحدات لتغطية التكاليف الثابتة",u.units!=null?fmt(u.units,0)+" وحدة":"لا تُغطّى — الربح للوحدة سالب",u.units==null?"pf-kv-bad":""]:null])+
      fld("pf-fixed","تكاليف ثابتة شهرية لا تدخل في تكلفة الوحدة (ر.س)",k.ps.fixed||"",'inputmode="decimal" placeholder="مثال: 18000"');
  }else if(n.id==="vat"){
    body=kv([["نسبة الضريبة",pct(m.vatRate*100)],["ضريبة المخرجات للوحدة",money(m.vatAmount)]])+'<p class="pf-hint">الربح والهامش يُحسبان على صافي البيع بعد الضريبة؛ ضريبة المشتريات الشاملة تُستبعد من التكلفة.</p>';
  }else if(n.id==="product"){
    body=kv([["النوع",m.kind==="box"?"بوكس":"صنف خام"],m.weight&&m.kind==="box"?["الوزن",fmt(m.weight,3)+" كجم"]:null,m.dishes?["الصحون",fmt(m.dishes,0)]:null,["عدد عناصر التكلفة",String(m.lines.length)],["التصنيف",esc(m.band==="ex"?"ممتاز":m.band==="good"?"جيد":m.band==="low"?"ضعيف":m.band==="loss"?"خسارة":m.band==="by"?"منتج ثانوي":"—")]])+
      (m.fallback?'':'<div class="sk-actions"><button type="button" class="btn sm" data-pf="open-src" data-id="'+esc(m.id)+'">فتح في السجل</button></div>');
  }
  return '<section class="pf-insp'+(innerWidth>900?'':' card')+'" aria-live="polite">'+head+body+'</section>';
}

/* ---- under the map: what-if, drivers, IAS 2, controls ---- */
function whatIfHtml(k){
  const {m,sc,w}=k;if(!sc)return"";
  const d=(a,b,f,inv)=>{const x=b-a;if(Math.abs(x)<0.005)return"";const good=inv?x<0:x>0;return ' <em class="'+(good?"pf-up":"pf-down")+'">'+(x>0?"+":"")+f(x)+'</em>'};
  const card=(t,a,b,note)=>'<div class="pf-wcard"><span>'+t+'</span><b>'+b+'</b>'+(a?'<small>'+a+'</small>':'')+(note?'<small>'+note+'</small>':'')+'</div>';
  const u=k.ps.fixed&&k.E?k.E.breakevenUnits(m,n0(k.ps.fixed),sc.profit):null;
  return '<div class="pf-wi"><div class="pf-wigrid">'+fld("pf-wi-price","سعر البيع شامل الضريبة",w.price||"",'inputmode="decimal" placeholder="'+esc(m.price||"")+'"')+
    fld("pf-wi-cost","تغيّر عام في كل التكاليف ٪",w.costPct||"",'inputmode="decimal" placeholder="0"')+fld("pf-wi-target","الهامش المستهدف ٪",w.target??"",'inputmode="decimal" placeholder="'+esc(fmt(m.targetRate*100,1))+'"')+'</div>'+
    '<div class="pf-wcards">'+card("التكلفة",sc.changed?"الحالية "+money(m.total):"",money(sc.total)+d(m.total,sc.total,fmt,true))+
    card("السعر",sc.changed&&sc.price!==m.price?"الحالي "+money(m.price):"",money(sc.price))+
    card("الهامش",sc.changed&&m.margin!=null?"الحالي "+pct(m.margin*100):"",sc.margin!=null?pct(sc.margin*100)+(sc.deltaMarginPts?' <em class="'+(sc.deltaMarginPts>0?"pf-up":"pf-down")+'">'+pts(sc.deltaMarginPts)+'</em>':''):"—")+
    card("الربح للوحدة","",money(sc.profit)+d(m.profit,sc.profit,fmt))+card("التعادل","",money(sc.breakeven))+
    card("السعر للهامش "+pct(sc.targetRate*100),"",sc.target!=null?money(sc.target):"—",sc.target!=null?'<button type="button" class="btn sm" data-pf="use-target">استخدمه</button>':"")+
    (u?card("وحدات التعادل الشهرية","",u.units!=null?fmt(u.units,0):"—"):"")+'</div>'+
    '<div class="pf-wifoot"><small>'+(sc.changed?sc.changed+" تغيير نشط · ":"")+'لا يغيّر سجل الأصناف؛ لاعتماد سعر جديد استخدم «اعتماد السعر».</small><span>'+(sc.changed?'<button type="button" class="btn sm" data-pf="wi-reset">إعادة الضبط</button>':'')+'<button type="button" class="btn sm" data-pf="go" data-go="memo">اعتماد السعر</button></span></div></div>';
}
function driversHtml(k){
  if(!k.sens.length)return '<p class="pf-empty">أدخل سعر بيع ليظهر أثر كل عنصر على الهامش.</p>';
  const max=Math.max(...k.sens.map(s=>Math.abs(s.dMarginPts)),.1);
  return '<p class="pf-hint">أثر زيادة 10٪ في كل عنصر على الهامش (بالنقاط). اضغط العنصر لتجربته في «ماذا لو».</p><div class="pf-tornado">'+k.sens.map(s=>'<button type="button" class="pf-trow" data-pf="focus" data-id="'+esc(s.key==="price"?"price":"L:"+s.key)+'"><span>'+esc(s.name)+'</span><i class="'+(s.dMarginPts<0?"neg":"pos")+'" style="--w:'+Math.round(Math.abs(s.dMarginPts)/max*100)+'%"></i><b>'+pts(s.dMarginPts)+'</b></button>').join("")+'</div>';
}
function ias2Html(k){
  const iv=k.iv,m=k.m;if(!iv)return"";
  const row=(a,b,c)=>'<tr'+(c?' class="'+c+'"':'')+'><td>'+a+'</td><td>'+b+'</td></tr>';
  return '<table class="pf-ias"><tbody>'+row("مواد مباشرة وتعبئة (IAS 2.11)",money(iv.materials))+row("تكاليف تحويل وتجهيز (IAS 2.12)",money(iv.conversion))+row("<b>تكلفة المخزون للوحدة (IAS 2.10)</b>","<b>"+money(iv.inventoriable)+"</b>","pf-tot")+
    row("تكاليف بيع وتوصيل — مستبعدة (IAS 2.16)",money(iv.selling))+row("مصروفات إدارية — مستبعدة (IAS 2.16)",money(iv.admin))+
    row("صافي سعر البيع",m.hasPrice?money(m.priceNet):"—")+row("− تكاليف البيع",money(iv.selling))+row("<b>صافي القيمة القابلة للتحقق (IAS 2.6)</b>","<b>"+(iv.nrv!=null?money(iv.nrv):"—")+"</b>","pf-tot")+
    row("القيمة الدفترية للوحدة: الأقل منهما (IAS 2.9)",money(iv.carrying))+row("التخفيض المطلوب (IAS 2.28)",iv.writeDown>0?money(iv.writeDown):"لا يوجد",iv.writeDown>0?"pf-bad":"pf-ok")+'</tbody></table>'+
    '<p class="pf-hint">التسعير يستخدم التكلفة الكاملة (بما فيها التوصيل)، أما تقييم المخزون في القوائم فيستخدم تكلفة IAS 2 فقط. غيّر تصنيف أي مصروف من مربعه على الخريطة.</p>';
}
function checksHtml(k){
  if(!k.checks.length)return '<p class="pf-empty">لا توجد ملاحظات.</p>';
  const ic={bad:"alert",warn:"alert",info:"action",ok:"check"};
  return '<ul class="pf-checks">'+k.checks.map(c=>'<li class="pf-chk pf-'+c.level+'">'+SK.icon(ic[c.level]||"action")+'<span>'+esc(c.text)+'</span></li>').join("")+'</ul>';
}
function analysisHtml(k,tab){
  const bad=k.checks.filter(c=>c.level==="bad"||c.level==="warn").length;
  const T=[["whatif","ماذا لو"],["drivers","ما يحرّك الهامش"],["ias2","المخزون IAS 2"],["checks","الرقابة"+(bad?" ("+bad+")":"")]];
  const body=tab==="drivers"?driversHtml(k):tab==="ias2"?ias2Html(k):tab==="checks"?checksHtml(k):whatIfHtml(k);
  return '<section class="pf-analysis card" id="pf-analysis"><div class="pf-tabs" role="tablist">'+T.map(([id,l])=>'<button type="button" role="tab" aria-selected="'+(id===tab)+'" class="pf-tab'+(id===tab?" on":"")+'" data-pf="tab" data-tab="'+id+'">'+esc(l)+'</button>').join("")+'</div><div class="pf-tabb">'+body+'</div></section>';
}

/* ---- paint ---- */
function isNarrow(){const rw=root.clientWidth||innerWidth;return(innerWidth>900?rw-326:rw)<600}
function paint(){
  if(!root)return;const items=itemList();
  if(!items.length){root.innerHTML=SK.ui.state.empty({icon:"catalog",title:"لا توجد أصناف بعد",text:"أضف أول صنف من سجل الأسعار، ثم ارجع إلى خريطة المنتج لربطه بالتكلفة والبيع والمكونات.",action:"فتح الأصناف",act:"nav",value:"catalog"});return}
  const d=state();if(!selected||!items.some(x=>itemId(x)===selected))selected=d.selected&&items.some(x=>itemId(x)===d.selected)?d.selected:itemId(items[0]);
  const x=items.find(i=>itemId(i)===selected)||items[0];selected=itemId(x);if(d.selected!==selected){d.selected=selected;put(d)}
  const k=ctxOf(x,d),nodes=buildNodes(k),narrow=isNarrow(),wide=innerWidth>900;lastNarrow=narrow;lastWide=wide;
  if(focus&&!nodes.some(n=>n.id===focus))focus="";
  const W=Math.max(320,(innerWidth>900?(root.clientWidth||innerWidth)-326:(root.clientWidth||innerWidth))),L=layout(nodes,W,narrow);
  const saved=k.ps.lv===LV?(narrow?k.ps.posN:k.ps.pos)||{}:{},pos={};
  nodes.forEach(n=>{const p=saved[n.id];pos[n.id]=p&&Number.isFinite(+p.x)&&Number.isFinite(+p.y)?[+p.x,+p.y]:(L.P[n.id]||[50,50])});
  const m=k.m,rec=k.checks.find(c=>c.code==="reconciled"||c.code==="unreconciled"),tab=d.tab||"whatif";
  root.innerHTML='<div class="pf-shell"><section class="pf-head card"><div><span class="pf-eyebrow">PRODUCT COST MAP</span><h2>خريطة المنتج والتكلفة</h2><p>كل مربع محسوب من سجل الأصناف: ما يدخل في التكلفة ثم المنتج ثم السعر والهامش. اضغط أي مربع لترى معادلته وجرّب «ماذا لو» دون تغيير السجل.</p></div><div class="pf-select"><label for="pf-product">المنتج</label><select id="pf-product">'+items.map(i=>'<option value="'+esc(itemId(i))+'"'+(itemId(i)===selected?' selected':'')+'>'+esc(nameOf(i))+(i.kind==="box"?" · بوكس":"")+'</option>').join("")+'</select><button type="button" class="btn sm pf-lm" data-pf="linkmap">'+SK.icon("linkmap")+' افتحه في خريطة الربط</button></div></section>'+
    '<div class="pf-work"><div class="pf-main"><section class="pf-board card"><div class="pf-boardtop"><div><b>'+esc(nameOf(x))+'</b><small>اسحب المربعات لترتيبها، واضغط أي مربع لتفاصيله</small></div><div class="pf-mini"><span>تكلفة '+money(m.total)+'</span><span>بيع '+(m.hasPrice?money(m.price):"—")+'</span><span class="pf-m-'+esc(m.band)+'">هامش '+(m.margin!=null?pct(m.margin*100):"—")+'</span>'+
    (rec?'<span class="pf-rec pf-'+rec.level+'" title="'+esc(rec.text)+'">'+(rec.level==="ok"?"✓ مطابق للسجل":"فرق عن السجل")+'</span>':'')+'<button type="button" class="pf-relayout" data-pf="relayout" title="إعادة ترتيب المربعات">ترتيب تلقائي</button></div></div>'+
    '<div class="pf-canvas" id="pf-canvas" style="min-height:'+L.H+'px">'+edgesHtml(nodes,pos)+nodes.map(n=>nodeHtml(n,pos[n.id])).join("")+'</div></section>'+(wide?'':inspHtml(k,nodes))+analysisHtml(k,tab)+'</div>'+
    '<aside class="pf-side card">'+(wide?inspHtml(k,nodes):'')+'<div class="pf-sidehead"><b>إضافة إلى الخريطة</b><small>المجموعات مرتبة، والمكرر لا يظهر مرتين.</small></div>'+formHtml()+addButtons(k)+linkGroups()+'</aside></div></div>';
  bindDrag();
}

/* ---- actions ---- */
function addType(type){
  if(type==="breakeven"||type==="vat"){update(ps=>{if(!ps.nodes.some(n=>n.type===type))ps.nodes.push({id:type,type,label:typeLabel[type],value:"",builtin:true})});return}
  const f=$("#pf-form",root);if(!f)return;f.hidden=false;f.dataset.type=type;const costed=COSTED.includes(type);
  $("#pf-formt",f).textContent=typeLabel[type]||"عنصر جديد";$$(".pf-costed",f).forEach(e=>e.hidden=!costed);$$(".pf-exp-only",f).forEach(e=>e.hidden=type!=="expense");$$(".pf-note-only",f).forEach(e=>e.hidden=costed);
  ["pf-label","pf-unit","pf-value"].forEach(id=>{$("#"+id,f).value=""});$("#pf-qty",f).value="1";
  $("#pf-label",f).placeholder=type==="component"?"مثال: بهارات إضافية":type==="packaging"?"مثال: علبة فلين":type==="expense"?"مثال: تجهيز وتتبيل":"عنوان الملاحظة";
  f.scrollIntoView({block:"nearest"});$("#pf-label",f).focus();
}
const numIn=v=>{const s=String(v??"").trim().replace(/[٠-٩]/g,c=>"٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace("٫",".").replace(/[٬,\s]/g,"");if(s==="")return null;const n=Number(s);return Number.isFinite(n)?n:null};
function saveNode(){
  const f=$("#pf-form",root),type=f?.dataset.type||"note",label=$("#pf-label",f)?.value.trim();if(!label){toast("اكتب اسم العنصر أولاً","warn");return}
  const node={id:"n-"+Date.now().toString(36),type,label};
  if(COSTED.includes(type)){const unit=numIn($("#pf-unit",f).value);if(unit==null||unit<=0){toast("أدخل تكلفة الوحدة ليدخل العنصر في الحساب","warn");return}
    Object.assign(node,{qty:numIn($("#pf-qty",f).value)||1,unitCost:unit,vat:$("#pf-vat",f).value,method:type==="expense"?$("#pf-method",f).value:"unit"})}
  else node.value=$("#pf-value",f).value.trim();
  focus=node.id;update(ps=>{ps.nodes.push(node)});toast("أُضيف «"+label+"» إلى الخريطة"+(COSTED.includes(type)?" — أثره في «ماذا لو»":""),"ok");
}
function saveEdit(){
  const box=$(".pf-edit",root);if(!box)return;const id=box.dataset.id;
  update(ps=>{const n=ps.nodes.find(z=>z.id===id);if(!n)return;const g=s=>$(s,box);
    n.label=(g("#pf-e-label")?.value||n.label).trim()||n.label;n.value=(g("#pf-e-value")?.value||"").trim();
    if(COSTED.includes(n.type)){const u=numIn(g("#pf-e-unit")?.value),q=numIn(g("#pf-e-qty")?.value);if(u!=null&&u>=0)n.unitCost=u;if(q!=null&&q>0)n.qty=q;n.vat=g("#pf-e-vat")?.value||"excl";if(g("#pf-e-method"))n.method=g("#pf-e-method").value}});
  toast("حُفظ","ok");
}
function delNode(id){if(focus===id)focus="";update(ps=>{ps.nodes=ps.nodes.filter(n=>n.id!==id);[ps.pos,ps.posN].forEach(p=>{if(p)delete p[id]})})}
function setWhatIf(fn){update(ps=>{ps.whatIf=ps.whatIf||{};fn(ps.whatIf,ps)})}
function onChange(e){
  const t=e.target;
  if(t.id==="pf-product"){selected=t.value;focus="";const d=state();d.selected=selected;put(d);paint();return}
  if(t.id==="pf-wi-price"||t.id==="pf-wi-price2"){const v=numIn(t.value);setWhatIf(w=>{if(v&&v>0)w.price=v;else delete w.price});return}
  if(t.id==="pf-wi-cost"){const v=numIn(t.value);setWhatIf(w=>{if(v)w.costPct=v;else delete w.costPct});return}
  if(t.id==="pf-wi-target"){const v=numIn(t.value);setWhatIf(w=>{if(v!=null&&v>=0&&v<95)w.target=v;else delete w.target});return}
  if(t.id==="pf-fixed"){const v=numIn(t.value);update(ps=>{if(v&&v>0)ps.fixed=v;else delete ps.fixed});return}
  if(t.dataset.wi){const key=t.dataset.key,f=t.dataset.wi,v=numIn(t.value);setWhatIf(w=>{w.lines=w.lines||{};const c=w.lines[key]||{};if(v==null||(f==="unitPct"&&v===0))delete c[f];else c[f]=v;if(Object.keys(c).length)w.lines[key]=c;else delete w.lines[key]});return}
  if(t.dataset.pfCls){const id=t.dataset.pfCls,v=t.value,d=state();d.classes[id]=v;put(d);paint();toast("صُنّف كـ«"+CLS[v]+"» في عرض IAS 2","ok")}
}
function bind(node){
  node.addEventListener("change",onChange);
  node.addEventListener("click",e=>{const b=e.target.closest("[data-pf]");if(!b)return;const a=b.dataset.pf;
    if(a==="add-type")addType(b.dataset.type);else if(a==="save-node")saveNode();else if(a==="cancel-node"){$("#pf-form",root).hidden=true}
    else if(a==="delete"){e.stopPropagation();delNode(b.dataset.id)}else if(a==="go")core().go(b.dataset.go)
    else if(a==="linkmap"){const x=itemList().find(i=>itemId(i)===selected);if(x&&window.SKosifLinkMap){core().go("linkmap");setTimeout(()=>window.SKosifLinkMap.item(x.kind==="box"?"box":"raw",itemId(x)),350)}}
    else if(a==="tab"){const d=state();d.tab=b.dataset.tab;put(d);paint();$("#pf-analysis",root)?.scrollIntoView({block:"nearest",behavior:"smooth"})}
    else if(a==="focus-close"){focus="";paint()}else if(a==="focus"){focus=b.dataset.id;paint()}
    else if(a==="open-src"){if(!core().openItem||!core().openItem(b.dataset.id))core().go("catalog")}
    else if(a==="save-edit")saveEdit();else if(a==="wi-reset")update(ps=>{delete ps.whatIf})
    else if(a==="use-target"){const d=state(),x=itemList().find(i=>itemId(i)===selected);if(!x)return;const k=ctxOf(x,d),p=k.sc&&k.sc.target;if(p)setWhatIf(w=>{w.price=p})}
    else if(a==="relayout")update(ps=>{ps.lv=LV;if(isNarrow())ps.posN={};else ps.pos={}})});
  node.addEventListener("keydown",e=>{const n=e.target.closest&&e.target.closest(".pf-node");if(n&&(e.key==="Enter"||e.key===" ")&&e.target===n){e.preventDefault();focus=n.dataset.node;paint();$(".pf-insp",root)?.scrollIntoView({block:"nearest"})}});
  let t=0;addEventListener("resize",()=>{clearTimeout(t);t=setTimeout(()=>{if(root&&root.isConnected&&$("#pf-canvas",root)&&(isNarrow()!==lastNarrow||(innerWidth>900)!==lastWide))paint()},180)});
}
function bindDrag(){
  const canvas=$("#pf-canvas",root);if(!canvas)return;
  $$(".pf-node",canvas).forEach(n=>n.addEventListener("pointerdown",e=>{
    if(e.target.closest(".pf-del")||e.button>0)return;e.preventDefault();n.setPointerCapture&&n.setPointerCapture(e.pointerId);drag={node:n,id:n.dataset.node,pid:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false};
  }));
  canvas.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.pid)return;
    if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<5)return;drag.moved=true;drag.node.classList.add("dragging");
    const r=canvas.getBoundingClientRect(),x=Math.max(6,Math.min(94,(e.clientX-r.left)/r.width*100)),y=Math.max(5,Math.min(95,(e.clientY-r.top)/r.height*100));
    drag.node.style.left=x+"%";drag.node.style.top=y+"%";drag.node.dataset.x=x.toFixed(2);drag.node.dataset.y=y.toFixed(2);
    const id=CSS.escape(drag.id);$$('.pf-lines line[data-a="'+id+'"]',canvas).forEach(l=>{l.setAttribute("x1",x);l.setAttribute("y1",y)});$$('.pf-lines line[data-b="'+id+'"]',canvas).forEach(l=>{l.setAttribute("x2",x);l.setAttribute("y2",y)})});
  const end=e=>{if(!drag||e.pointerId!==drag.pid)return;const g=drag;drag=null;g.node.classList.remove("dragging");
    if(!g.moved){if(e.type==="pointerup"){focus=focus===g.id?"":g.id;paint();if(focus&&innerWidth<=900)$(".pf-insp",root)?.scrollIntoView({block:"nearest",behavior:"smooth"})}return}
    const narrow=isNarrow(),d=state(),ps=ensureProduct(d,selected);if(ps.lv!==LV){ps.lv=LV;ps.pos={};ps.posN={}}
    const all={};$$(".pf-node",canvas).forEach(n=>all[n.dataset.node]={x:+n.dataset.x,y:+n.dataset.y});
    if(narrow)ps.posN=all;else ps.pos=all;put(d)};
  canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);
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

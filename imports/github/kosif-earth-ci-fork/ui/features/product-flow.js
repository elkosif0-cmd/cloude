/* S.kosif — Product Flow Studio + commerce warm start.
   The product's cost map on the shared studio shell (SK.studio): the product in the middle, what goes into its cost
   on one side and its price, margin, VAT and break-even on the other. Every input comes from the pricing record
   through SKEngines.catalog.costMap (the pricing engine's own formulas), so the map's cost reconciles to the
   catalogue's. A click on a box opens its formula and its what-if; under the map: what-if, the drivers of the margin,
   the IAS 2 view and the controls. The source screens stay the truth — the map never writes the pricing record.
   Custom boxes, positions and the what-if live locally in skosif_product_flow_v1. The studio shell (layout, drag,
   inspector, tabs) is SK.studio; this module owns only the numbers, the nodes and their details. */
(()=>{
"use strict";
const {$,$$,esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const CM=()=>window.SKEngines&&SKEngines.catalog&&SKEngines.catalog.costMap;
const KEY="skosif_product_flow_v1",PRICING="aghnam-pricing-v3",LV=2;
let root=null,ctl=null,selected="",cur=null;
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
function mutate(fn){const d=state(),ps=ensureProduct(d,selected);fn(ps,d);put(d)}
function update(fn){mutate(fn);ctl&&ctl.paint()}
const isDraft=n=>COSTED.includes(n.type)&&n0(n.unitCost)>0;
const tagOf=n=>n.draft||n.custom?typeLabel[n.type]:n.line?(lineTag[n.type]||typeLabel[n.type]):typeLabel[n.type]||"المنتج";

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
/* the product of this paint: the selection settled, the context computed once */
function prepare(){
  const items=itemList();if(!items.length){cur=null;return null}
  const d=state();if(!selected||!items.some(x=>itemId(x)===selected))selected=d.selected&&items.some(x=>itemId(x)===d.selected)?d.selected:itemId(items[0]);
  const x=items.find(i=>itemId(i)===selected)||items[0];selected=itemId(x);if(d.selected!==selected){d.selected=selected;put(d)}
  cur={items,x,k:ctxOf(x,d)};return cur;
}

/* ---- nodes ---- */
function buildNodes(k){
  const {x,m,ps,sc}=k,changed=sc&&sc.changed>0,rows=new Map((sc?sc.rows:[]).map(r=>[r.key,r]));
  const alt=(a,b,f)=>changed&&b!=null&&Math.abs(a-b)>0.004?f(b):"";
  const has=new Set((ps.nodes||[]).map(n=>n.type));
  const nodes=[{id:"product",type:"product",role:"center",label:nameOf(x),value:(m.kind==="box"?"بوكس":"صنف خام")+(m.weight&&m.kind==="box"?" · "+fmt(m.weight,3)+" كجم":"")}];
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
    if(isDraft(n))nodes.push({id:n.id,type:n.type,role:"input",draft:true,custom:n,del:true,label:n.label,share:m.total>0?(dAmt.get(n.id)||0)/m.total:0,value:money(dAmt.get(n.id)||0)+" · مقترح"});
    else nodes.push({id:n.id,type:n.type,role:"note",custom:n,del:true,legacy:COSTED.includes(n.type),label:n.label,value:n.value||(COSTED.includes(n.type)?"أضف الكمية والتكلفة ليُحتسب":"")});
  });
  nodes.forEach(n=>{n.tag=tagOf(n)});
  return nodes;
}
/* the product's own wiring: inputs feed the cost, the cost feeds the product, the price hangs off the product and
   the margin and VAT off the price; break-even off the cost */
function edgeOf(n){return n.role==="center"?null:n.role==="input"?[n.id,"cost"]:n.role==="cost"?["cost","product"]:n.role==="note"?[n.id,"product"]:n.id==="price"?["product","price"]:n.id==="breakeven"?["cost",n.id]:["price",n.id]}

/* ---- side panel: add, links, the new-item form ---- */
function addButtons(k){
  const {group}=SK.studio,has=new Set((k.ps.nodes||[]).map(n=>n.type)),bad=k.checks.filter(c=>c.level==="bad"||c.level==="warn").length;
  const btn=(t,l,ic,dis)=>'<button type="button" class="pf-add" data-pf="add-type" data-type="'+t+'"'+(dis?' disabled':'')+'>'+SK.icon(ic||"action")+'<span>'+l+'</span></button>';
  const tb=(t,l,ic,badge)=>'<button type="button" class="pf-add" data-pf="tab" data-tab="'+t+'">'+SK.icon(ic)+'<span>'+l+(badge?' <em class="pf-badge">'+badge+'</em>':'')+'</span></button>';
  return group("المؤشرات","أضف ما تريد رؤيته على الخريطة",btn("breakeven","نقطة التعادل","sim",has.has("breakeven"))+btn("vat","الضريبة","zatca",has.has("vat"))+btn("note","ملاحظة","memo"),true)+
    group("التصنيع والمكونات","عنصر مقترح بكمية وتكلفة — يدخل في «ماذا لو»",btn("component","مكوّن","builder")+btn("packaging","تعبئة","inventory")+btn("expense","مصروف مباشر","costs"),true)+
    group("التحليل والرقابة","تحت الخريطة، محسوب من السجل",tb("whatif","ماذا لو","calc")+tb("drivers","ما يحرّك الهامش","sensitivity")+tb("ias2","المخزون IAS 2","nrv")+tb("checks","الرقابة","check",bad),true);
}
function linkGroups(){
  const {group,link}=SK.studio;
  return group("الشاشات المرتبطة","بدل تكرار الأدوات، افتح الأصل من هنا",link("catalog","الأصناف والأسعار")+link("costs","التكاليف")+link("sim","التسعير")+link("builder","المكونات والبوكسات")+link("memo","اعتماد السعر"),false)+
    group("تحليل متقدم","الأدوات الدقيقة عند الحاجة فقط",link("kernel","نواة التسعير")+link("analyzer","تحليل المكونات")+link("compare","المقارنة التحليلية"),false);
}
const fld=(id,label,val,attrs="")=>'<label class="sk-field"><span>'+label+'</span><input id="'+id+'" value="'+esc(val??"")+'" '+attrs+'></label>';
function formHtml(){return '<div class="pf-form" id="pf-form" hidden><b class="pf-formt" id="pf-formt">عنصر جديد</b>'+fld("pf-label","الاسم","",'placeholder="مثال: علبة فلين"')+
  '<div class="pf-costed pf-row2">'+fld("pf-qty","الكمية للوحدة","1",'inputmode="decimal"')+fld("pf-unit","تكلفة الوحدة (ر.س)","",'inputmode="decimal" placeholder="0.00"')+'</div>'+
  '<div class="pf-costed pf-row2"><label class="sk-field"><span>الضريبة</span><select id="pf-vat"><option value="excl">السعر قبل الضريبة</option><option value="incl">السعر شامل الضريبة</option></select></label>'+
  '<label class="sk-field pf-exp-only"><span>الاحتساب</span><select id="pf-method"><option value="unit">مبلغ للوحدة</option><option value="pct">٪ من تكلفة المكونات</option></select></label></div>'+
  '<label class="sk-field pf-note-only"><span>النص</span><input id="pf-value" placeholder="مثال: يُراجع السعر كل شهر"></label>'+
  '<div class="sk-actions"><button type="button" class="btn primary sm" data-pf="save-node">إضافة للخريطة</button><button type="button" class="btn sm" data-pf="cancel-node">إلغاء</button></div></div>'}
function sideHtml(){const k=cur&&cur.k;if(!k)return"";return '<div class="pf-sidehead"><b>إضافة إلى الخريطة</b><small>المجموعات مرتبة، والمكرر لا يظهر مرتين.</small></div>'+formHtml()+addButtons(k)+linkGroups()}

/* ---- inspector: the focused box, its formula, its what-if ---- */
function inspHtml(fid,nodes){
  const k=cur&&cur.k,n=nodes.find(z=>z.id===fid);if(!k||!n)return"";
  const {kv,formula,inspHead}=SK.studio,{m,sc,w,E}=k,head=inspHead(tagOf(n),n.label);
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
  return head+body;
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
function tabBody(tab){const k=cur&&cur.k;if(!k)return"";return tab==="drivers"?driversHtml(k):tab==="ias2"?ias2Html(k):tab==="checks"?SK.studio.checks(k.checks):whatIfHtml(k)}

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
  mutate(ps=>{ps.nodes.push(node)});ctl.focus(node.id);toast("أُضيف «"+label+"» إلى الخريطة"+(COSTED.includes(type)?" — أثره في «ماذا لو»":""),"ok");
}
function saveEdit(){
  const box=$(".pf-edit",root);if(!box)return;const id=box.dataset.id;
  update(ps=>{const n=ps.nodes.find(z=>z.id===id);if(!n)return;const g=s=>$(s,box);
    n.label=(g("#pf-e-label")?.value||n.label).trim()||n.label;n.value=(g("#pf-e-value")?.value||"").trim();
    if(COSTED.includes(n.type)){const u=numIn(g("#pf-e-unit")?.value),q=numIn(g("#pf-e-qty")?.value);if(u!=null&&u>=0)n.unitCost=u;if(q!=null&&q>0)n.qty=q;n.vat=g("#pf-e-vat")?.value||"excl";if(g("#pf-e-method"))n.method=g("#pf-e-method").value}});
  toast("حُفظ","ok");
}
function delNode(id){mutate(ps=>{ps.nodes=ps.nodes.filter(n=>n.id!==id);[ps.pos,ps.posN].forEach(p=>{if(p)delete p[id]})})}
function setWhatIf(fn){update(ps=>{ps.whatIf=ps.whatIf||{};fn(ps.whatIf,ps)})}
function onChange(e){
  const t=e.target;
  if(t.id==="pf-wi-price"||t.id==="pf-wi-price2"){const v=numIn(t.value);setWhatIf(w=>{if(v&&v>0)w.price=v;else delete w.price});return}
  if(t.id==="pf-wi-cost"){const v=numIn(t.value);setWhatIf(w=>{if(v)w.costPct=v;else delete w.costPct});return}
  if(t.id==="pf-wi-target"){const v=numIn(t.value);setWhatIf(w=>{if(v!=null&&v>=0&&v<95)w.target=v;else delete w.target});return}
  if(t.id==="pf-fixed"){const v=numIn(t.value);update(ps=>{if(v&&v>0)ps.fixed=v;else delete ps.fixed});return}
  if(t.dataset.wi){const key=t.dataset.key,f=t.dataset.wi,v=numIn(t.value);setWhatIf(w=>{w.lines=w.lines||{};const c=w.lines[key]||{};if(v==null||(f==="unitPct"&&v===0))delete c[f];else c[f]=v;if(Object.keys(c).length)w.lines[key]=c;else delete w.lines[key]});return}
  if(t.dataset.pfCls){const id=t.dataset.pfCls,v=t.value,d=state();d.classes[id]=v;put(d);ctl.paint();toast("صُنّف كـ«"+CLS[v]+"» في عرض IAS 2","ok")}
}
function onAction(a,b){
  if(a==="add-type")addType(b.dataset.type);else if(a==="save-node")saveNode();else if(a==="cancel-node"){const f=$("#pf-form",root);if(f)f.hidden=true}
  else if(a==="open-src"){if(!core().openItem||!core().openItem(b.dataset.id))core().go("catalog")}
  else if(a==="save-edit")saveEdit();else if(a==="wi-reset")update(ps=>{delete ps.whatIf})
  else if(a==="use-target"){const p=cur&&cur.k.sc&&cur.k.sc.target;if(p)setWhatIf(w=>{w.price=p})}
  else return false;
  return true;
}

/* ---- the spec the studio shell draws ---- */
const SPEC={
  eyebrow:"استوديو المنتج",title:"خريطة المنتج والتكلفة",lead:"كل مربع محسوب من سجل الأصناف: ما يدخل في التكلفة ثم المنتج ثم السعر والهامش. اضغط أي مربع لترى معادلته وجرّب «ماذا لو» دون تغيير السجل.",
  subjectLabel:"المنتج",
  subject(){
    const c=prepare();
    if(!c)return{empty:SK.ui.state.empty({icon:"catalog",title:"لا توجد أصناف بعد",text:"أضف أول صنف من سجل الأسعار، ثم ارجع إلى خريطة المنتج لربطه بالتكلفة والبيع والمكونات.",action:"فتح الأصناف",act:"nav",value:"catalog"})};
    const m=c.k.m,rec=c.k.checks.find(x=>x.code==="reconciled"||x.code==="unreconciled");
    return{label:nameOf(c.x),sub:"اسحب المربعات لترتيبها، واضغط أي مربع لتفاصيله",pills:'<span>تكلفة '+money(m.total)+'</span><span>بيع '+(m.hasPrice?money(m.price):"—")+'</span><span class="pf-m-'+esc(m.band)+'">هامش '+(m.margin!=null?pct(m.margin*100):"—")+'</span>'+
      (rec?'<span class="pf-rec pf-'+rec.level+'" title="'+esc(rec.text)+'">'+(rec.level==="ok"?"✓ مطابق للسجل":"فرق عن السجل")+'</span>':'')};
  },
  subjects:()=>(cur?cur.items:itemList()).map(i=>({id:itemId(i),name:nameOf(i),note:i.kind==="box"?"بوكس":""})),
  selected:()=>selected,
  onSelect(id){selected=String(id||"");const d=state();d.selected=selected;put(d);ctl.paint()},
  nodes:()=>cur?buildNodes(cur.k):[],
  edgeOf,inspector:inspHtml,side:sideHtml,
  tabs:()=>{const bad=cur?cur.k.checks.filter(c=>c.level==="bad"||c.level==="warn").length:0;return[["whatif","ماذا لو"],["drivers","ما يحرّك الهامش"],["ias2","المخزون IAS 2"],["checks","الرقابة"+(bad?" ("+bad+")":"")]]},
  tab:{get:()=>state().tab||"whatif",set:id=>{const d=state();d.tab=id;put(d)}},
  tabBody,
  positions:{get:nr=>{const d=state(),ps=ensureProduct(d,selected);return ps.lv===LV?(nr?ps.posN:ps.pos)||{}:{}},
    set:(nr,all)=>mutate(ps=>{if(ps.lv!==LV){ps.lv=LV;ps.pos={};ps.posN={}}if(nr)ps.posN=all;else ps.pos=all}),
    reset:nr=>mutate(ps=>{ps.lv=LV;if(nr)ps.posN={};else ps.pos={}})},
  onChange,onAction,onDelete:delNode
};

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
SK.view("productflow",{render(node){root=node;ctl=SK.studio.mount(node,SPEC);ctl.paint()}});
function boot(){const c=core();if(!c||!c.onView){setTimeout(boot,250);return}c.onView("commerce",node=>setTimeout(()=>warmCommerce(node),0))}
boot();
})();

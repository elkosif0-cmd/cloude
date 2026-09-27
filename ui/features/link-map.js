/* SQC — the link map (خريطة الربط): arrows that link the company's records, not a picture of them.
   Add an item (a raw item, a box, a supplier, a customer, an expense, a stock line or a note), draw an arrow
   from one to another and choose what the arrow means. An arrow that means a record writes it:
     raw item/box → box   «مكوّن في»   the box's make-up (the quantity in the box)
     supplier → raw item   «يورّد»       the supplier's price list (and the item's buying price if chosen);
                                          a supplier added on the map joins the suppliers list
     expense → box         «يُحمّل على»  the expense is charged to the box
   Other arrows come from the records (who bought a product, its stock line) or are the board's own (a note, a
   by-product, any relation named by the user). Boards start empty or from a template: a product's tree, the
   raw items of a product to their suppliers, a customer and what they bought. Boards live with the company
   (skosif_linkmap_v1 moves with the helper-tools workspace). */
(()=>{
"use strict";
const {$,$$,esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_linkmap_v1",NW=184;
const G=()=>SK.graph,P=()=>SK.pricing;
const TYPES={
  raw:{label:"صنف خام",plural:"الأصناف الخام",icon:"catalog",open:"catalog"},
  box:{label:"بوكس / منتج",plural:"البوكسات والمنتجات",icon:"builder",open:"builder"},
  supplier:{label:"مورد",plural:"الموردون",icon:"suppliers",open:"suppliers"},
  customer:{label:"عميل",plural:"العملاء",icon:"customers",open:"customers"},
  expense:{label:"مصروف",plural:"المصروفات",icon:"costs",open:"costs"},
  stock:{label:"مخزون",plural:"أرصدة المخزون",icon:"inventory",open:"inventory"},
  note:{label:"ملاحظة",plural:"ملاحظات",icon:"memo",open:""}
};
/* what an arrow can mean between two kinds of item; "write" arrows are records */
const RELS={
  comp:{label:"مكوّن في",hint:"يدخل في تركيب البوكس بالكمية",pairs:[["raw","box"],["box","box"]],write:true,
    fields:[{key:"q",label:"الكمية في البوكس (كجم للصنف، عدد للبوكس)",type:"number",min:0,step:"any",required:true}]},
  supplies:{label:"يورّد",hint:"المورد يورّد الصنف بسعر — يُسجَّل في قائمة أسعار المورد",pairs:[["supplier","raw"]],write:true,
    fields:[{key:"price",label:"سعر الشراء (قبل الضريبة)",type:"number",min:0,step:"any"},{key:"unit",label:"الوحدة",type:"select",options:["كجم","حبة","كرتون","ذبيحة"]},
      {key:"useAsBuy",label:"اعتمده سعر شراء الصنف في التسعير؟",type:"select",options:[["no","لا — سجّل السعر للمورد فقط"],["yes","نعم — حدّث تكلفة الصنف"]]}]},
  charge:{label:"يُحمّل على",hint:"يُضاف المصروف إلى تكلفة البوكس",pairs:[["expense","box"]],write:true},
  sold:{label:"بيع إلى",hint:"من المبيعات: العميل اشترى المنتج",pairs:[["raw","customer"],["box","customer"]]},
  stock:{label:"رصيده",hint:"سطر المخزون للصنف",pairs:[["raw","stock"],["box","stock"]]},
  byproduct:{label:"منتج ثانوي من",hint:"مثل العظم والدهن من الذبيحة",pairs:[["raw","raw"]]},
  note:{label:"ملاحظة على",pairs:[["note","*"]]},
  custom:{label:"علاقة أخرى",hint:"اكتب اسم العلاقة",pairs:[["*","*"]],fields:[{key:"label",label:"اسم العلاقة",required:true,placeholder:"مثال: بديل عن"}]}
};
const n2=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2}).format(Number(v)||0);
const money=v=>n2(v)+" ر.س";
let root=null,view={s:1,tx:40,ty:30},sel=null,connectFrom=null,ents=null;

/* ---------- boards ---------- */
function st(){const d=load(KEY,{})||{};d.boards=Array.isArray(d.boards)?d.boards:[];return d}
function put(d){save(KEY,d)}
function board(d=st()){return d.boards.find(b=>b.id===d.active)||d.boards[0]||null}
function withBoard(fn){const d=st(),b=board(d);if(!b)return;fn(b,d);put(d)}
const nid=(t,ref)=>t+":"+ref;
const eid=(a,b,rel)=>a+">"+b+">"+rel;
function newBoard(name,kind){const d=st(),b={id:"bd-"+Date.now().toString(36),name,kind:kind||"free",nodes:[],edges:[],at:new Date().toISOString()};d.boards.push(b);d.active=b.id;put(d);view={s:1,tx:40,ty:30};sel=null;return b}

/* ---------- the records behind the nodes ---------- */
async function loadEnts(){ents=await G().entities();return ents}
function ent(t,ref){if(!ents)return null;if(t==="note")return null;const L=ents[t]||[];return L.find(e=>String(e.id)===String(ref))||null}
function nodeLabel(n){const e=ent(n.t,n.ref);return e?e.name:n.label||n.ref}
function nodeSub(n){
  if(n.t==="note")return"";
  const e=ent(n.t,n.ref);if(!e)return n.adhoc?"غير مسجّل":"غير موجود في السجلات";
  if((n.t==="raw"||n.t==="box")&&e.calc&&e.calc.cost!=null)return"تكلفة "+money(e.calc.cost)+(e.calc.price?" · سعر "+money(e.calc.price):"");
  return e.sub||"";
}
function relsFor(a,b){
  const m=(p,x)=>p==="*"||p===x;
  const out=[];
  Object.entries(RELS).forEach(([k,r])=>{
    if(r.pairs.some(([f,t])=>m(f,a.t)&&m(t,b.t)))out.push({k,flip:false});
    else if(r.pairs.some(([f,t])=>m(f,b.t)&&m(t,a.t)))out.push({k,flip:true});
  });
  return out;
}
function edgeText(e){
  const r=RELS[e.rel]||RELS.custom;let t=e.rel==="custom"?(e.label||"علاقة"):r.label;
  if(e.rel==="comp"&&e.q!=null)t+=" · "+n2(e.q);
  if(e.rel==="supplies"&&e.price)t+=" · "+money(e.price);
  if(e.rel==="sold"&&e.amount)t+=" · "+money(e.amount);
  return t;
}

/* ---------- applying an arrow to the records ---------- */
async function applyEdge(e,from,to,f){
  if(e.rel==="comp")P().setComp(to.ref,from.t,from.ref,f.q);
  else if(e.rel==="supplies"){const raw=ent("raw",to.ref);G().linkSupplier({supplier:from.ref,item:raw?raw.name:to.label,rawId:to.ref,price:f.price,unit:f.unit,useAsBuy:f.useAsBuy==="yes"})}
  else if(e.rel==="charge")P().linkExpense(from.ref,to.ref,true);
}
async function unapplyEdge(e,from,to){
  if(e.rel==="comp")P().dropComp(to.ref,from.t,from.ref);
  else if(e.rel==="supplies"){const raw=ent("raw",to.ref);G().unlinkSupplier({supplier:from.ref,item:raw?raw.name:to.label})}
  else if(e.rel==="charge")P().linkExpense(from.ref,to.ref,false);
}
/* the board's record arrows read their figures back from the records (a change elsewhere shows here) */
function syncBoard(b){
  const p=P().get()||{boxes:[],exps:[]};let changed=false;
  b.edges.forEach(e=>{
    const [ft,...fr]=e.from.split(":"),[,...tr]=e.to.split(":"),fref=fr.join(":"),tref=tr.join(":");
    if(e.rel==="comp"){const bx=(p.boxes||[]).find(x=>String(x.id)===tref),c=bx&&(bx.comps||[]).find(x=>(x.t||"raw")===ft&&String(x.id)===fref);
      const stale=!c;if(!!e.stale!==stale){e.stale=stale;changed=true}if(c&&e.q!==Number(c.q)){e.q=Number(c.q);changed=true}}
    else if(e.rel==="charge"){const ex=(p.exps||[]).find(x=>String(x.id)===fref),on=!!ex&&(ex.links||[]).map(String).includes(tref);if(!!e.stale!==!on){e.stale=!on;changed=true}}
  });
  return changed;
}

/* ---------- templates ---------- */
function place(b,t,ref,x,y,extra){const id=nid(t,ref);let n=b.nodes.find(z=>z.id===id);if(!n){n={id,t,ref:String(ref),x,y,...(extra||{})};b.nodes.push(n)}return n}
function link(b,from,to,rel,extra){const id=eid(from.id,to.id,rel);if(!b.edges.some(e=>e.id===id))b.edges.push({id,from:from.id,to:to.id,rel,...(extra||{})})}
/* templates lay their items out in levels: right to left on a wide screen (source → product → buyers),
   top to bottom on a phone */
const narrow=()=>{const cv=root&&(root.querySelector(".lm-canvas")||root);return(cv?cv.clientWidth:innerWidth)<640};
function layLevels(b,levels){
  const v=narrow(),out=[];let y0=0;
  levels.forEach((L,li)=>{
    if(!L.length)return;
    if(v){/* two to a row on a phone, the levels stacked */
      const rows=Math.ceil(L.length/2);
      L.forEach((it,i)=>{const r=Math.floor(i/2),inRow=Math.min(2,L.length-r*2),col=i%2;out.push(place(b,it.t,it.id,Math.round((col-(inRow-1)/2)*(NW+24)),y0+r*96,it.extra))});
      y0+=rows*96+70;
    }else L.forEach((it,i)=>out.push(place(b,it.t,it.id,1040-li*270,Math.round((i-(L.length-1)/2)*92),it.extra)));
  });
  return out;
}
async function tplProduct(boxId){
  await loadEnts();
  const bx=ent("box",boxId);if(!bx)return;const b=newBoard("شجرة "+bx.name,"product");
  const nb=await G().neighbours("box",boxId);
  const comps=nb.filter(x=>x.rel==="comp"&&x.dir==="in"),exps=nb.filter(x=>x.rel==="charge"),buyers=nb.filter(x=>x.rel==="bought").slice(0,6),stock=nb.find(x=>x.rel==="stock");
  const sups=[],supLinks=[];
  for(const c of comps)if(c.t==="raw")(await G().neighbours("raw",c.id)).filter(z=>z.rel==="supplies").slice(0,2).forEach(s=>{if(!sups.some(x=>x.id===s.id))sups.push({t:"supplier",id:s.id});supLinks.push([s,c])});
  layLevels(b,[sups,comps.map(c=>({t:c.t,id:c.id})),[{t:"box",id:boxId},...exps.map(e=>({t:"expense",id:e.id}))],[...(stock?[{t:"stock",id:stock.id}]:[]),...buyers.map(c=>({t:"customer",id:c.id}))]]);
  const N=(t,id)=>b.nodes.find(z=>z.id===nid(t,id)),center=N("box",boxId);
  comps.forEach(c=>link(b,N(c.t,c.id),center,"comp",{q:c.q}));
  supLinks.forEach(([s,c])=>link(b,N("supplier",s.id),N("raw",c.id),"supplies",{price:s.price,unit:s.unit,derived:!!s.derived}));
  exps.forEach(e=>link(b,N("expense",e.id),center,"charge"));
  if(stock)link(b,center,N("stock",stock.id),"stock",{derived:true});
  buyers.forEach(c=>link(b,center,N("customer",c.id),"sold",{derived:true,qty:c.qty,amount:c.amount}));
  finishTpl(b);
}
async function tplRawSuppliers(boxId){
  await loadEnts();
  const p=P().get()||{raws:[],boxes:[]};let raws;
  if(boxId){const seen=new Set();const walk=id=>{const bx=(p.boxes||[]).find(x=>String(x.id)===String(id));(bx&&bx.comps||[]).forEach(c=>{if(c.t==="box")walk(c.id);else seen.add(String(c.id))})};walk(boxId);raws=[...seen]}
  else raws=(p.raws||[]).filter(r=>r.status!=="archived"&&r.kind!=="by").slice(0,24).map(r=>String(r.id));
  const bx=boxId?ent("box",boxId):null;const b=newBoard("الموردون — "+(bx?bx.name:"كل الأصناف"),"suppliers");
  const sups=[],links=[];
  for(const rid of raws)(await G().neighbours("raw",rid)).filter(z=>z.rel==="supplies").forEach(s=>{if(!sups.some(x=>x.id===s.id))sups.push({t:"supplier",id:s.id});links.push([s,rid])});
  layLevels(b,[sups,raws.map(id=>({t:"raw",id})),...(boxId?[[{t:"box",id:boxId}]]:[])]);
  const N=(t,id)=>b.nodes.find(z=>z.id===nid(t,id));
  links.forEach(([s,rid])=>link(b,N("supplier",s.id),N("raw",rid),"supplies",{price:s.price,unit:s.unit,derived:!!s.derived}));
  if(boxId){const box=(p.boxes||[]).find(x=>String(x.id)===String(boxId));(box&&box.comps||[]).forEach(c=>{const n=N(c.t==="box"?"box":"raw",c.id);if(n)link(b,n,N("box",boxId),"comp",{q:Number(c.q)})})}
  finishTpl(b);
  const bare=raws.filter(id=>!links.some(l=>l[1]===id)).length;
  toast(bare?bare+" صنف بلا مورد — أضف مورداً واسحب السهم منه إلى الصنف":"كل الأصناف مربوطة بموردين","info");
}
async function tplCustomer(cid){
  await loadEnts();
  const c=ent("customer",cid);if(!c)return;const b=newBoard("مشتريات "+c.name,"customer");
  const bought=await G().neighbours("customer",cid);
  layLevels(b,[bought.map(x=>({t:x.t,id:x.id})),[{t:"customer",id:cid}]]);
  const N=(t,id)=>b.nodes.find(z=>z.id===nid(t,id));
  bought.forEach(x=>link(b,N(x.t,x.id),N("customer",cid),"sold",{derived:true,qty:x.qty,amount:x.amount}));
  finishTpl(b);
}
function finishTpl(b){const d=st(),i=d.boards.findIndex(x=>x.id===b.id);if(i>=0)d.boards[i]=b;put(d);sel=null;return paint().then(()=>{fit();const cv=root&&root.querySelector(".lm-canvas");if(cv&&cv.getBoundingClientRect().top>innerHeight*.6)cv.scrollIntoView({block:"center",behavior:"smooth"})})}
/* the neighbours of a node, placed beside it */
async function expand(n){
  const nb=await G().neighbours(n.t,n.ref);if(!nb.length){toast("لا روابط مسجّلة لهذا العنصر بعد","info");return}
  withBoard(b=>{
    let li=0,ri=0;
    nb.forEach(x=>{
      const inside=b.nodes.find(z=>z.id===nid(x.t,x.id));
      const m=inside||place(b,x.t,x.id,x.dir==="in"?n.x+280:n.x-280,n.y+(x.dir==="in"?(ri++):(li++))*84-40);
      const rel=x.rel==="bought"?"sold":x.rel;
      const [from,to]=x.dir==="in"?[m,n]:[n,m];
      link(b,from,to,rel,{q:x.q,price:x.price,unit:x.unit,qty:x.qty,amount:x.amount,derived:!!x.derived||rel==="sold"||rel==="stock"});
    });
  });
  paint();
}

/* ---------- dialogs ---------- */
function dialog(html,onReady){
  return new Promise(resolve=>{
    const prev=document.activeElement,w=document.createElement("div");w.className="skd-wrap";w.setAttribute("role","presentation");
    w.innerHTML='<div class="skd lm-dlg" role="dialog" aria-modal="true" aria-labelledby="lm-dt">'+html+'</div>';
    const done=r=>{w.remove();document.removeEventListener("keydown",key,true);try{prev&&prev.focus()}catch{}resolve(r)};
    const key=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();done(null)}};
    w.addEventListener("click",e=>{if(e.target===w||e.target.closest("[data-x]"))done(null)});
    document.addEventListener("keydown",key,true);document.body.appendChild(w);
    onReady(w.firstElementChild,done);
  });
}
async function addDialog(){
  await loadEnts();
  const b=board();if(!b)return;
  const on=new Set(b.nodes.map(n=>n.id));
  let type="box";
  return dialog('<h3 id="lm-dt">أضف عنصراً إلى اللوحة</h3><div class="lm-types" role="tablist">'+Object.entries(TYPES).map(([k,t])=>'<button type="button" role="tab" data-t="'+k+'" aria-selected="'+(k===type)+'">'+SK.icon(t.icon)+'<span>'+esc(t.label)+'</span></button>').join("")+'</div>'+
    '<input type="search" class="lm-q" placeholder="ابحث بالاسم…" aria-label="ابحث"><div class="lm-pick" role="listbox"></div><div class="lm-new"></div><div class="skd-acts"><button type="button" class="btn" data-x>إغلاق</button></div>',
  (box,done)=>{
    const q=$(".lm-q",box),list=$(".lm-pick",box),nw=$(".lm-new",box);
    const paintList=()=>{
      const t=q.value.trim(),K=G().key;
      if(type==="note"){list.innerHTML="";nw.innerHTML='<button type="button" class="btn primary" data-new>ملاحظة جديدة'+(t?': «'+esc(t)+'»':'')+'</button>';return}
      const L=(ents[type]||[]).filter(e=>!t||K(e.name).includes(K(t))).slice(0,60);
      list.innerHTML=L.length?L.map(e=>'<button type="button" role="option" data-ref="'+esc(e.id)+'"'+(on.has(nid(type,e.id))?' disabled':'')+'><b>'+esc(e.name)+'</b><small>'+esc(e.sub||"")+(on.has(nid(type,e.id))?' · على اللوحة':'')+'</small></button>').join(""):'<p class="muted">لا نتائج'+(t?' لـ «'+esc(t)+'»':'')+'.</p>';
      const exact=(ents[type]||[]).some(e=>K(e.name)===K(t));
      nw.innerHTML=type==="stock"?'<small class="muted">أرصدة المخزون تأتي من شاشة المخزون.</small>':(t&&!exact?'<button type="button" class="btn primary" data-new>'+(type==="customer"?"أضف «"+esc(t)+"» كعميل على اللوحة":"أنشئ "+esc(TYPES[type].label)+" جديداً: «"+esc(t)+"»")+'</button>':'<small class="muted">لم تجده؟ اكتب اسمه لإنشائه.</small>');
    };
    box.addEventListener("click",async e=>{
      const tb=e.target.closest("[data-t]");if(tb){type=tb.dataset.t;$$("[data-t]",box).forEach(x=>x.setAttribute("aria-selected",String(x===tb)));paintList();q.focus();return}
      const o=e.target.closest("[data-ref]");if(o&&!o.disabled){done({t:type,ref:o.dataset.ref});return}
      if(e.target.closest("[data-new]")){const name=q.value.trim();const r=await createNew(type,name);if(r)done(r)}
    });
    q.addEventListener("input",paintList);paintList();q.focus();
  });
}
async function createNew(type,name){
  try{
    if(type==="note"){const f=await SK.form("ملاحظة",[{key:"text",label:"النص",type:"textarea",value:name,required:true}]);return f?{t:"note",ref:"n"+Date.now().toString(36),label:f.text}:null}
    if(type==="raw"){const f=await SK.form("صنف خام جديد",[{key:"name",label:"الاسم",value:name,required:true},{key:"buy",label:"سعر الشراء للكجم",type:"number",min:0,step:"any"},{key:"waste",label:"نسبة الهدر ٪",type:"number",min:0,max:95,step:"any",value:0},{key:"price",label:"سعر البيع شامل الضريبة",type:"number",min:0,step:"any"},{key:"cat",label:"الفئة",value:"عام"}],{ok:"أضف إلى الأصناف"});
      if(!f)return null;const id=P().addRaw(f);toast("أُضيف «"+f.name+"» إلى الأصناف","ok");await loadEnts();return{t:"raw",ref:id}}
    if(type==="box"){const f=await SK.form("بوكس / منتج جديد",[{key:"name",label:"الاسم",value:name,required:true},{key:"price",label:"سعر البيع شامل الضريبة",type:"number",min:0,step:"any"},{key:"cat",label:"الفئة",value:"عام"}],{ok:"أضف إلى البوكسات",message:"بعد إنشائه اسحب الأصناف الخام إليه لتكوين تركيبته."});
      if(!f)return null;const id=P().addBox(f);toast("أُضيف «"+f.name+"» إلى البوكسات","ok");await loadEnts();return{t:"box",ref:id}}
    if(type==="supplier"){const f=await SK.form("مورد جديد",[{key:"name",label:"اسم المورد",value:name,required:true},{key:"phone",label:"الجوال (اختياري)",placeholder:"05xxxxxxxx"}],{ok:"أضف إلى الموردين"});
      if(!f)return null;const id=G().addSupplier(f.name,f.phone);toast("أُضيف المورد «"+id+"» إلى قائمة الموردين","ok");await loadEnts();return{t:"supplier",ref:id}}
    if(type==="expense"){const f=await SK.form("مصروف جديد",[{key:"name",label:"البند",value:name,required:true},{key:"amt",label:"المبلغ لكل بوكس",type:"number",min:0,step:"any",required:true}],{ok:"أضف إلى المصروفات"});
      if(!f)return null;const id=P().addExpense(f);await loadEnts();return{t:"expense",ref:id}}
    if(type==="customer")return{t:"customer",ref:"adhoc:"+name,label:name,adhoc:true};
  }catch(err){toast(err.message||String(err),"err")}
  return null;
}
async function relDialog(a,b){
  const opts=relsFor(a,b);if(!opts.length)return null;
  let pick=opts[0].k;
  return dialog('<h3 id="lm-dt">ماذا يعني هذا السهم؟</h3><p class="lm-pair"><b>'+esc(nodeLabel(a))+'</b> ⟵ <b>'+esc(nodeLabel(b))+'</b></p>'+
    '<div class="lm-rels" role="radiogroup">'+opts.map(o=>{const r=RELS[o.k],[f,t]=o.flip?[b,a]:[a,b];return'<label class="lm-rel"><input type="radio" name="rel" value="'+o.k+'"'+(o.k===pick?' checked':'')+'><span><b>'+esc(nodeLabel(f))+' ← '+esc(r.label)+' ← '+esc(nodeLabel(t))+'</b><small>'+esc(r.hint||"")+(r.write?' · يُسجَّل في السجلات':' · على اللوحة')+'</small></span></label>'}).join("")+'</div>'+
    '<div class="lm-fields"></div><p class="skd-err" role="alert" hidden></p><div class="skd-acts"><button type="button" class="btn" data-x>إلغاء</button><button type="button" class="btn primary" data-ok>اربط</button></div>',
  (box,done)=>{
    const fields=$(".lm-fields",box),err=$(".skd-err",box);
    const paintF=()=>{const r=RELS[pick];fields.innerHTML=(r.fields||[]).map(f=>'<label class="skd-f"><span>'+esc(f.label)+'</span>'+(f.type==="select"?'<select name="'+f.key+'">'+f.options.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return'<option value="'+esc(v)+'">'+esc(l)+'</option>'}).join("")+'</select>':'<input name="'+f.key+'" '+(f.type==="number"?'type="number" inputmode="decimal" step="any" min="0"':'type="text"')+(f.placeholder?' placeholder="'+esc(f.placeholder)+'"':'')+'>')+'</label>').join("");
      const s=pick==="supplies"?(ent("supplier",(opts.find(o=>o.k==="supplies").flip?b:a).ref)||{}).rec:null;
      if(s){const raw=ent("raw",(opts.find(o=>o.k==="supplies").flip?a:b).ref),it=raw&&s.items.find(i=>G().key(i.name)===G().key(raw.name));if(it&&fields.querySelector('[name=price]'))fields.querySelector('[name=price]').value=Math.round(it.price*100)/100}
      const f1=fields.querySelector("input,select");if(f1)f1.focus()};
    box.addEventListener("change",e=>{if(e.target.name==="rel"){pick=e.target.value;paintF()}});
    box.addEventListener("click",e=>{if(!e.target.closest("[data-ok]"))return;
      const r=RELS[pick],out={};
      for(const f of r.fields||[]){const el=fields.querySelector('[name="'+f.key+'"]'),v=String(el.value).trim();if(f.required&&!v){err.textContent="أكمل: "+f.label;err.hidden=false;el.focus();return}out[f.key]=f.type==="number"&&v!==""?Number(v):v}
      const o=opts.find(x=>x.k===pick);done({rel:pick,flip:o.flip,f:out});
    });
    paintF();
  });
}

/* ---------- drawing ---------- */
function boxOf(n){const el=root&&root.querySelector('[data-node="'+CSS.escape(n.id)+'"]');return{w:el?el.offsetWidth:NW,h:el?el.offsetHeight:60}}
function pathFor(a,b){
  const A=boxOf(a),B=boxOf(b);
  const acx=a.x+A.w/2,bcx=b.x+B.w/2,ay=a.y+A.h/2,by=b.y+B.h/2;
  /* one above the other (the phone layout): join bottom to top */
  if(Math.abs(by-ay)>(A.h+B.h)/2+10&&Math.abs(bcx-acx)<(A.w+B.w)/2){
    const down=by>ay,y1=down?a.y+A.h:a.y,y2=down?b.y:b.y+B.h,dy=Math.max(30,Math.abs(y2-y1)/2)*(down?1:-1);
    return curve([acx,y1],[acx,y1+dy],[bcx,y2-dy],[bcx,y2]);
  }
  let x1,x2;if(bcx<acx){x1=a.x;x2=b.x+B.w}else{x1=a.x+A.w;x2=b.x}
  const dx=Math.max(40,Math.abs(x2-x1)/2),s=x2<x1?-1:1;
  return curve([x1,ay],[x1+s*dx,ay],[x2-s*dx,by],[x2,by]);
}
/* a cubic curve; its label sits halfway, or near the arrow's end (at) so fanned-out arrows do not stack their labels */
function curve(p0,c1,c2,p3){
  const at=t=>{const u=1-t;return[u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p3[1]]};
  const m=at(.5);
  return{d:"M"+p0+" C"+c1+" "+c2+" "+p3,mx:m[0],my:m[1],at};
}
function paintEdges(){
  const b=board(),svg=root&&root.querySelector(".lm-edges");if(!b||!svg)return;
  const by=Object.fromEntries(b.nodes.map(n=>[n.id,n]));
  svg.innerHTML='<defs><marker id="lm-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>'+
    b.edges.map(e=>{const a=by[e.from],c=by[e.to];if(!a||!c)return"";const p=labelAt(pathFor(a,c),e),t=edgeText(e),w=Math.max(40,t.length*6.4+16);
      const cls="lm-e r-"+e.rel+(RELS[e.rel]&&RELS[e.rel].write?" is-w":"")+(e.derived?" is-d":"")+(e.stale?" is-stale":"")+(sel&&sel.edge===e.id?" is-sel":"");
      return'<g class="'+cls+'" data-edge="'+esc(e.id)+'"><path class="lm-hit" d="'+p.d+'"/><path class="lm-ln" d="'+p.d+'" marker-end="url(#lm-ar)"/><g class="lm-lb" transform="translate('+p.mx+','+p.my+')"><rect x="'+(-w/2)+'" y="-11" width="'+w+'" height="22" rx="11"/><text text-anchor="middle" dy="4">'+esc(t)+(e.stale?' ⚠':'')+'</text></g></g>'}).join("");
}
function nodeHtml(n){
  const T=TYPES[n.t]||TYPES.note,isSel=sel&&sel.node===n.id,isFrom=connectFrom===n.id;
  return'<div class="lm-node t-'+n.t+(isSel?' is-sel':'')+(isFrom?' is-from':'')+(n.t!=="note"&&!ent(n.t,n.ref)&&!n.adhoc?' is-missing':'')+'" data-node="'+esc(n.id)+'" style="left:'+n.x+'px;top:'+n.y+'px" role="button" tabindex="0" aria-label="'+esc(T.label+": "+nodeLabel(n))+'">'+
    '<span class="lm-ic">'+SK.icon(T.icon)+'</span><span class="lm-tx"><small class="lm-ty">'+esc(T.label)+'</small><b>'+esc(n.t==="note"?(n.label||""):nodeLabel(n))+'</b>'+(n.t==="note"?'':'<small>'+esc(nodeSub(n))+'</small>')+'</span>'+
    '<button type="button" class="lm-h" data-handle aria-label="اسحب من هنا لربط «'+esc(nodeLabel(n))+'» بعنصر آخر" title="اسحب لربط"></button></div>';
}
function applyView(){const s=root&&root.querySelector(".lm-stage");if(s)s.style.transform="translate("+view.tx+"px,"+view.ty+"px) scale("+view.s+")";const z=root&&root.querySelector("[data-zoom-v]");if(z)z.textContent=Math.round(view.s*100)+"٪"}
function fit(){
  const b=board(),cv=root&&root.querySelector(".lm-canvas");if(!b||!cv||!b.nodes.length){view={s:1,tx:40,ty:30};applyView();return}
  const xs=b.nodes.map(n=>n.x),ys=b.nodes.map(n=>n.y),minX=Math.min(...xs),maxX=Math.max(...xs)+NW,minY=Math.min(...ys),maxY=Math.max(...ys)+70;
  const W=cv.clientWidth||800,H=cv.clientHeight||500,s=Math.max(.3,Math.min(1.2,Math.min((W-40)/(maxX-minX),(H-40)/(maxY-minY))));
  view={s,tx:(W-(maxX-minX)*s)/2-minX*s,ty:(H-(maxY-minY)*s)/2-minY*s};applyView();
}
function paintStage(){
  const b=board(),stage=root.querySelector(".lm-stage");if(!stage)return;
  stage.innerHTML='<svg class="lm-edges" width="6000" height="4000" aria-hidden="true"></svg>'+(b?b.nodes.map(nodeHtml).join(""):"");
  applyView();requestAnimationFrame(paintEdges);
}
function sideHtml(){
  const b=board();if(!b)return"";
  if(sel&&sel.edge){const e=b.edges.find(x=>x.id===sel.edge);if(e){const by=Object.fromEntries(b.nodes.map(n=>[n.id,n])),a=by[e.from],c=by[e.to],r=RELS[e.rel]||RELS.custom;
    const flds=(r.fields||[]).filter(f=>f.key!=="useAsBuy");
    return'<h4>'+esc(edgeText(e))+'</h4><p class="lm-pair"><b>'+esc(a?nodeLabel(a):"")+'</b> ← '+esc(e.rel==="custom"?(e.label||""):r.label)+' ← <b>'+esc(c?nodeLabel(c):"")+'</b></p>'+
      '<p class="muted sm">'+(r.write?(e.derived?"مقروء من السجلات (شحنات أو أوامر شراء). حفظه يسجّله سعراً معتمداً.":"مسجّل في السجلات: تعديله هنا يعدّل السجل."):e.derived?"مقروء من السجلات.":"علاقة على اللوحة فقط.")+(e.stale?' <b class="lm-warn">لم يعد في السجل — احفظه لإعادته أو احذفه.</b>':'')+'</p>'+
      (flds.length&&!(e.derived&&!r.write)?'<form class="lm-ef" data-edit-edge>'+flds.map(f=>'<label class="skd-f"><span>'+esc(f.label)+'</span>'+(f.type==="select"?'<select name="'+f.key+'">'+f.options.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return'<option'+(String(e[f.key]||"")===String(v)?' selected':'')+' value="'+esc(v)+'">'+esc(l)+'</option>'}).join("")+'</select>':'<input name="'+f.key+'" '+(f.type==="number"?'type="number" step="any" min="0" inputmode="decimal"':'')+' value="'+esc(e[f.key]!=null?e[f.key]:"")+'">')+'</label>').join("")+'<button class="btn primary sm" type="submit">حفظ</button></form>':'')+
      (e.qty?'<p class="sm">الكمية المباعة: <b>'+n2(e.qty)+'</b></p>':'')+
      '<div class="lm-acts"><button type="button" class="btn danger sm" data-del-edge>'+(r.write&&!e.derived?"احذف السهم وألغِ السجل":"احذف السهم")+'</button></div>'}}
  if(sel&&sel.node){const n=b.nodes.find(x=>x.id===sel.node);if(n){const T=TYPES[n.t],e=ent(n.t,n.ref);
    const ins=b.edges.filter(x=>x.to===n.id),outs=b.edges.filter(x=>x.from===n.id);
    const by=Object.fromEntries(b.nodes.map(z=>[z.id,z]));
    let det="";
    if(e&&(n.t==="raw"||n.t==="box")&&e.calc)det='<dl class="lm-dl"><dt>التكلفة</dt><dd>'+money(e.calc.cost)+'</dd><dt>سعر البيع</dt><dd>'+(e.calc.price!=null?money(e.calc.price):"—")+'</dd><dt>الهامش</dt><dd>'+(e.calc.margin!=null?n2(e.calc.margin*100)+"٪":"—")+'</dd>'+(n.t==="raw"?'<dt>الهدر</dt><dd>'+n2(e.rec.waste)+'٪</dd>':'')+'</dl>';
    if(e&&n.t==="box"){const p=P().get()||{raws:[],boxes:[]};det+='<h5>التركيب (جدول)</h5><table class="lm-tb"><tbody>'+((e.rec.comps||[]).map(c=>{const r=(c.t==="box"?p.boxes:p.raws).find(x=>String(x.id)===String(c.id));return'<tr><td>'+esc(r?r.name:c.id)+'</td><td><input type="number" step="any" min="0" value="'+esc(c.q)+'" data-comp-q="'+esc((c.t||"raw")+":"+c.id)+'" aria-label="الكمية"></td></tr>'}).join("")||'<tr><td colspan="2" class="muted">لا مكوّنات — اسحب صنفاً خاماً إلى البوكس.</td></tr>')+'</tbody></table>'}
    if(e&&n.t==="supplier")det='<ul class="lm-ul">'+e.rec.items.slice(0,12).map(i=>'<li>'+esc(i.name)+' <b>'+money(i.price)+'</b>/'+esc(i.unit)+'</li>').join("")+'</ul>';
    if(e&&n.t==="customer")det='<dl class="lm-dl"><dt>المدينة</dt><dd>'+esc(e.rec.city||"—")+'</dd><dt>الحي</dt><dd>'+esc(e.rec.district||"—")+'</dd><dt>الطلبات</dt><dd>'+n2(e.rec.summaryOrders)+'</dd><dt>المبيعات</dt><dd>'+money(e.rec.summarySales)+'</dd></dl>';
    if(e&&n.t==="stock")det='<dl class="lm-dl"><dt>الرصيد</dt><dd>'+n2(e.rec.stock)+'</dd><dt>نقطة إعادة الطلب</dt><dd>'+n2(e.rec.reorderPoint)+'</dd><dt>الحالة</dt><dd>'+esc(e.rec.status||"—")+'</dd></dl>';
    const lst=(L,dir)=>L.map(x=>{const o=by[dir==="in"?x.from:x.to];return'<li><button type="button" class="linkish" data-sel-edge="'+esc(x.id)+'">'+(dir==="in"?esc(o?nodeLabel(o):"")+" ← "+esc(edgeText(x)):esc(edgeText(x))+" ← "+esc(o?nodeLabel(o):""))+'</button></li>'}).join("");
    return'<h4>'+SK.icon(T.icon)+' '+esc(n.t==="note"?"ملاحظة":nodeLabel(n))+'</h4><p class="muted sm">'+esc(T.label)+(n.t==="note"?"":" · "+esc(nodeSub(n)))+'</p>'+(n.t==="note"?'<p>'+esc(n.label||"")+'</p>':'')+det+
      (ins.length||outs.length?'<h5>الروابط</h5><ul class="lm-ul">'+lst(ins,"in")+lst(outs,"out")+'</ul>':'')+
      '<div class="lm-acts">'+(n.t!=="note"&&!n.adhoc?'<button type="button" class="btn sm" data-expand>'+SK.icon("linkmap")+' أظهر كل روابطه</button>':'')+
      '<button type="button" class="btn sm" data-connect>اربطه بعنصر…</button>'+
      (n.t==="box"?'<button type="button" class="btn sm" data-tpl-sup="'+esc(n.ref)+'">حوّل مكوّناته إلى أسهم الموردين</button>':'')+
      (T.open&&e?'<button type="button" class="btn ghost sm" data-open>افتح في «'+esc(T.plural)+'»</button>':'')+
      '<button type="button" class="btn ghost sm" data-remove>أزل من اللوحة</button></div>'}}
  const w=b.edges.filter(e=>RELS[e.rel]&&RELS[e.rel].write&&!e.derived).length;
  return'<h4>'+esc(b.name)+'</h4><p class="muted sm">'+b.nodes.length+' عنصر · '+b.edges.length+' سهم · '+w+' منها مسجّل في السجلات</p>'+
    '<ol class="lm-how"><li><b>أضف</b> عنصراً موجوداً أو جديداً (صنف، بوكس، مورد، عميل…).</li><li><b>اسحب</b> من الدائرة الصغيرة على طرف العنصر إلى عنصر آخر — أو اضغط «ربط» ثم العنصرين.</li><li><b>اختر</b> معنى السهم: مكوّن في، يورّد بسعر، يُحمّل على… فيُسجَّل في مكانه.</li></ol>'+
    '<div class="lm-legend">'+Object.entries(TYPES).map(([k,t])=>'<span class="t-'+k+'"><i></i>'+esc(t.label)+'</span>').join("")+'</div>'+
    '<div class="lm-legend lm-lg-e"><span><i class="w"></i>مسجّل في السجلات</span><span><i class="d"></i>مقروء من السجلات</span><span><i class="o"></i>على اللوحة فقط</span></div>';
}
function paintSide(){const s=root&&root.querySelector(".lm-side");if(s)s.innerHTML=sideHtml()}
function barHtml(){
  const d=st(),b=board(d);
  return'<div class="lm-bar" role="toolbar" aria-label="أدوات خريطة الربط">'+
    (d.boards.length?'<label class="lm-sel"><span class="sr-only">اللوحة</span><select data-board>'+d.boards.map(x=>'<option value="'+esc(x.id)+'"'+(b&&x.id===b.id?' selected':'')+'>'+esc(x.name)+'</option>').join("")+'</select></label>':'')+
    '<button type="button" class="btn sm" data-start>'+SK.icon("action")+' لوحة جديدة</button>'+
    (b?'<button type="button" class="btn primary sm" data-add>+ أضف عنصراً</button><button type="button" class="btn sm'+(connectFrom!=null?' is-on':'')+'" data-connect-mode aria-pressed="'+(connectFrom!=null)+'">'+SK.icon("linkmap")+' ربط</button>'+
      '<span class="lm-zoom"><button type="button" class="btn sm" data-zoom="-1" aria-label="تصغير">−</button><span data-zoom-v>100٪</span><button type="button" class="btn sm" data-zoom="1" aria-label="تكبير">+</button><button type="button" class="btn sm" data-fit>ملاءمة</button></span>'+
      '<button type="button" class="btn ghost sm" data-rename>إعادة تسمية</button><button type="button" class="btn ghost sm" data-drop-board>حذف اللوحة</button>':'')+'</div>';
}
function startHtml(){
  return'<div class="lm-start"><h3>ابدأ لوحة ربط</h3><p class="muted">كل سهم على اللوحة علاقة حقيقية: التركيب، أسعار الموردين، تحميل المصروفات — وما يأتي من المبيعات والمخزون.</p><div class="lm-tpls">'+
    '<button type="button" data-tpl="product">'+SK.icon("builder")+'<b>شجرة منتج</b><small>المنتج ومكوّناته الخام وموردوها ومصروفاته ومن اشتراه ورصيده</small></button>'+
    '<button type="button" data-tpl="suppliers">'+SK.icon("suppliers")+'<b>المواد الخام ← الموردون</b><small>حوّل شجرة المواد الخام إلى أسهم: اربط كل صنف بمورده وسعره</small></button>'+
    '<button type="button" data-tpl="customer">'+SK.icon("customers")+'<b>عميل وما اشتراه</b><small>العميل والمنتجات التي اشتراها بكمياتها وقيمها</small></button>'+
    '<button type="button" data-tpl="free">'+SK.icon("linkmap")+'<b>لوحة فارغة</b><small>أضف ما تريد واربطه بالأسهم</small></button></div></div>';
}
async function paint(){
  if(!root)return;
  if(!ents)await loadEnts();
  const d=st(),b=board(d);
  if(b&&syncBoard(b))put(d);
  root.innerHTML='<div class="lm">'+barHtml()+(b?'<div class="lm-body"><div class="lm-canvas" tabindex="0" aria-label="لوحة الربط — اسحب لتحريك اللوحة، واسحب العناصر لترتيبها"><div class="lm-stage"></div>'+(b.nodes.length?'':'<div class="lm-empty"><p>اللوحة فارغة.</p><button type="button" class="btn primary" data-add>+ أضف أول عنصر</button></div>')+(connectFrom!=null?'<p class="lm-hint" role="status">'+(connectFrom?'اضغط العنصر الذي تريد ربطه بـ «'+esc(nodeLabel(b.nodes.find(n=>n.id===connectFrom)||{}))+'»':'اضغط العنصر الأول ثم الثاني')+'</p>':'')+'</div><aside class="lm-side" aria-live="polite"></aside></div>':startHtml())+'</div>';
  if(b){paintStage();paintSide()}
}

/* ---------- actions ---------- */
async function pickEntity(type,title){
  await loadEnts();
  return dialog('<h3 id="lm-dt">'+esc(title)+'</h3><input type="search" class="lm-q" placeholder="ابحث…" aria-label="ابحث"><div class="lm-pick" role="listbox"></div>'+(type==="box"?'<button type="button" class="btn ghost sm" data-ref="">كل الأصناف بدون تحديد منتج</button>':'')+'<div class="skd-acts"><button type="button" class="btn" data-x>إلغاء</button></div>',(box,done)=>{
    const q=$(".lm-q",box),list=$(".lm-pick",box);
    const pl=()=>{const t=q.value.trim(),K=G().key;const L=(ents[type]||[]).filter(e=>!t||K(e.name).includes(K(t))).slice(0,60);list.innerHTML=L.map(e=>'<button type="button" role="option" data-ref="'+esc(e.id)+'"><b>'+esc(e.name)+'</b><small>'+esc(e.sub||"")+'</small></button>').join("")||'<p class="muted">لا نتائج.</p>'};
    box.addEventListener("click",e=>{const o=e.target.closest("[data-ref]");if(o)done({ref:o.dataset.ref})});q.addEventListener("input",pl);pl();q.focus();
  });
}
async function startTpl(kind){
  if(kind==="free"){const f=await SK.form("لوحة فارغة",[{key:"name",label:"اسم اللوحة",value:"لوحة "+(st().boards.length+1),required:true}]);if(f){newBoard(f.name,"free");paint()}return}
  if(kind==="product"){const r=await pickEntity("box","شجرة أي منتج؟");if(r&&r.ref)await tplProduct(r.ref);return}
  if(kind==="suppliers"){const r=await pickEntity("box","مكوّنات أي منتج تحوّلها إلى أسهم الموردين؟");if(r)await tplRawSuppliers(r.ref||null);return}
  if(kind==="customer"){const r=await pickEntity("customer","أي عميل؟");if(r&&r.ref)await tplCustomer(r.ref)}
}
async function startMenu(){
  return dialog('<h3 id="lm-dt">لوحة جديدة</h3>'+startHtml().replace('<h3>ابدأ لوحة ربط</h3>','')+'<div class="skd-acts"><button type="button" class="btn" data-x>إلغاء</button></div>',(box,done)=>{
    box.addEventListener("click",e=>{const t=e.target.closest("[data-tpl]");if(t){done(null);startTpl(t.dataset.tpl)}});
  });
}
async function addNode(){
  const r=await addDialog();if(!r)return;
  const cv=root.querySelector(".lm-canvas"),W=cv?cv.clientWidth:600,H=cv?cv.clientHeight:400;
  const b=board();
  const {x,y}=freeSpot(b,Math.round((W/2-view.tx)/view.s-NW/2),Math.round((H/2-view.ty)/view.s-30));
  withBoard(bd=>{place(bd,r.t,r.ref,x,y,r.label?{label:r.label,adhoc:!!r.adhoc}:null)});
  sel={node:nid(r.t,r.ref)};paint();
}
/* the nearest free place to (cx,cy): a spiral out until no node is within a node's size */
function freeSpot(b,cx,cy){
  const busy=(x,y)=>(b?b.nodes:[]).some(n=>Math.abs(n.x-x)<NW+16&&Math.abs(n.y-y)<76);
  for(let r=0;r<14;r++)for(let a=0;a<Math.max(1,r*6);a++){const t=a/Math.max(1,r*6)*Math.PI*2,x=Math.round(cx+Math.cos(t)*r*110),y=Math.round(cy+Math.sin(t)*r*70);if(!busy(x,y))return{x,y}}
  return{x:cx,y:cy};
}
async function connect(aId,bId){
  const b=board();if(!b||aId===bId)return;const a=b.nodes.find(n=>n.id===aId),c=b.nodes.find(n=>n.id===bId);if(!a||!c)return;
  const r=await relDialog(a,c);if(!r)return;
  const [from,to]=r.flip?[c,a]:[a,c];
  const e={id:eid(from.id,to.id,r.rel),from:from.id,to:to.id,rel:r.rel,...r.f};
  if(r.rel==="sold"||r.rel==="stock")e.manual=true;
  try{
    if(RELS[r.rel].write){if(to.adhoc||from.adhoc)throw new Error("سجّل العنصر أولاً ثم اربطه");await applyEdge(e,from,to,r.f);await loadEnts()}
    withBoard(bd=>{bd.edges=bd.edges.filter(x=>x.id!==e.id);bd.edges.push(e)});
    sel={edge:e.id};
    toast(RELS[r.rel].write?"رُبط وسُجّل: "+nodeLabel(from)+" ← "+RELS[r.rel].label+" ← "+nodeLabel(to):"رُبط على اللوحة","ok");
  }catch(err){toast(err.message||String(err),"err")}
  paint();
}
async function onClick(e){
  const t=e.target;
  if(t.closest("[data-start]"))return startMenu();
  const tp=t.closest("[data-tpl]");if(tp&&root.contains(tp)&&!t.closest(".skd"))return startTpl(tp.dataset.tpl);
  if(t.closest("[data-add]"))return addNode();
  if(t.closest("[data-connect-mode]")){connectFrom=connectFrom==null?"":null;paint();return}
  const z=t.closest("[data-zoom]");if(z){zoomAt(+z.dataset.zoom>0?1.2:1/1.2);return}
  if(t.closest("[data-fit]")){fit();return}
  if(t.closest("[data-rename]")){const b=board();const f=await SK.form("إعادة تسمية اللوحة",[{key:"name",label:"الاسم",value:b.name,required:true}]);if(f){withBoard(bd=>{bd.name=f.name});paint()}return}
  if(t.closest("[data-drop-board]")){const b=board();if(!await SK.confirm("حذف اللوحة «"+b.name+"»؟ السجلات (التركيب، أسعار الموردين…) لا تُحذف.",{title:"حذف اللوحة",danger:true,ok:"حذف"}))return;const d=st();d.boards=d.boards.filter(x=>x.id!==b.id);d.active=(d.boards[0]||{}).id;put(d);sel=null;paint();return}
  const se=t.closest("[data-sel-edge]");if(se){sel={edge:se.dataset.selEdge};paintEdges();paintSide();return}
  if(t.closest("[data-expand]")&&sel&&sel.node){const n=board().nodes.find(x=>x.id===sel.node);if(n)await expand(n);return}
  if(t.closest("[data-connect]")&&sel&&sel.node){connectFrom=sel.node;paint();return}
  const ts=t.closest("[data-tpl-sup]");if(ts){await tplRawSuppliers(ts.dataset.tplSup);return}
  if(t.closest("[data-open]")&&sel&&sel.node){const n=board().nodes.find(x=>x.id===sel.node);if(!n)return;if((n.t==="raw"||n.t==="box")&&core()&&core().openItem(n.ref))return;core()&&core().go(TYPES[n.t].open);return}
  if(t.closest("[data-remove]")&&sel&&sel.node){const id=sel.node;withBoard(b=>{b.nodes=b.nodes.filter(n=>n.id!==id);b.edges=b.edges.filter(x=>x.from!==id&&x.to!==id)});sel=null;paint();return}
  if(t.closest("[data-del-edge]")&&sel&&sel.edge){
    const b=board(),e=b.edges.find(x=>x.id===sel.edge);if(!e)return;const by=Object.fromEntries(b.nodes.map(n=>[n.id,n]));
    const w=RELS[e.rel]&&RELS[e.rel].write&&!e.derived&&!e.stale;
    if(w&&!await SK.confirm("حذف السهم يلغي السجل أيضاً ("+edgeText(e)+"). متابعة؟",{title:"حذف سهم مسجّل",danger:true,ok:"احذف"}))return;
    try{if(w)await unapplyEdge(e,by[e.from],by[e.to]);withBoard(bd=>{bd.edges=bd.edges.filter(x=>x.id!==e.id)});sel=null;await loadEnts();paint()}catch(err){toast(err.message||String(err),"err")}
  }
}
async function onSubmit(e){
  const f=e.target.closest("[data-edit-edge]");if(!f)return;e.preventDefault();
  const b=board(),ed=b.edges.find(x=>x.id===sel.edge);if(!ed)return;const by=Object.fromEntries(b.nodes.map(n=>[n.id,n]));
  const out=Object.fromEntries(new FormData(f));Object.keys(out).forEach(k=>{if(k==="q"||k==="price")out[k]=out[k]===""?"":Number(out[k])});
  try{if(RELS[ed.rel].write)await applyEdge({...ed,...out},by[ed.from],by[ed.to],{...ed,...out});withBoard(bd=>{const x=bd.edges.find(z=>z.id===ed.id);Object.assign(x,out,{derived:false,stale:false})});await loadEnts();toast("حُفظ","ok");paint()}catch(err){toast(err.message||String(err),"err")}
}
async function onChange(e){
  const bs=e.target.closest("[data-board]");if(bs){const d=st();d.active=bs.value;put(d);sel=null;connectFrom=null;await paint();fit();return}
  const cq=e.target.closest("[data-comp-q]");if(cq&&sel&&sel.node){const [t,...r]=cq.dataset.compQ.split(":"),boxRef=sel.node.split(":").slice(1).join(":");
    try{P().setComp(boxRef,t,r.join(":"),Number(cq.value)||0);await loadEnts();const b=board();if(b&&syncBoard(b))withBoard(bd=>{syncBoard(bd)});paintStage();toast("عُدّلت الكمية في التركيب","ok")}catch(err){toast(err.message||String(err),"err")}}
}

/* ---------- pointer: move nodes, draw arrows, pan, pinch ---------- */
let drag=null;const pts=new Map();
const toStage=(cx,cy)=>{const r=root.querySelector(".lm-canvas").getBoundingClientRect();return{x:(cx-r.left-view.tx)/view.s,y:(cy-r.top-view.ty)/view.s}};
function zoomAt(k,cx,cy){
  const cv=root.querySelector(".lm-canvas");if(!cv)return;const r=cv.getBoundingClientRect();
  const px=cx==null?r.width/2:cx-r.left,py=cy==null?r.height/2:cy-r.top,ns=Math.max(.25,Math.min(2.5,view.s*k));
  view.tx=px-(px-view.tx)*(ns/view.s);view.ty=py-(py-view.ty)*(ns/view.s);view.s=ns;applyView();
}
function onDown(e){
  const cv=e.target.closest(".lm-canvas");if(!cv||e.button>0)return;
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2){const [a,b]=[...pts.values()];drag={kind:"pinch",d:Math.hypot(a.x-b.x,a.y-b.y),s:view.s};return}
  const h=e.target.closest("[data-handle]"),nd=e.target.closest("[data-node]"),ed=e.target.closest("[data-edge]");
  if(h&&nd){e.preventDefault();const p=toStage(e.clientX,e.clientY);drag={kind:"link",from:nd.dataset.node,x0:p.x,y0:p.y};cv.setPointerCapture(e.pointerId);return}
  if(nd){const b=board(),n=b.nodes.find(x=>x.id===nd.dataset.node);drag={kind:"node",id:n.id,sx:e.clientX,sy:e.clientY,nx:n.x,ny:n.y,moved:false,el:nd,b};cv.setPointerCapture(e.pointerId);return}
  if(ed){sel={edge:ed.dataset.edge};paintEdges();paintSide();return}
  drag={kind:"pan",sx:e.clientX,sy:e.clientY,tx:view.tx,ty:view.ty,moved:false};cv.setPointerCapture(e.pointerId);
}
function onMove(e){
  if(!drag)return;if(pts.has(e.pointerId))pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(drag.kind==="pinch"&&pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt((drag.s*d/drag.d)/view.s,(a.x+b.x)/2,(a.y+b.y)/2);return}
  if(drag.kind==="pan"){const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;view.tx=drag.tx+dx;view.ty=drag.ty+dy;applyView();return}
  if(drag.kind==="node"){const dx=(e.clientX-drag.sx)/view.s,dy=(e.clientY-drag.sy)/view.s;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;if(!drag.moved)return;
    const b=drag.b,n=b.nodes.find(x=>x.id===drag.id);n.x=Math.round(drag.nx+dx);n.y=Math.round(drag.ny+dy);drag.el.style.left=n.x+"px";drag.el.style.top=n.y+"px";paintEdgesLive(b);return}
  if(drag.kind==="link"){const p=toStage(e.clientX,e.clientY),svg=root.querySelector(".lm-edges");let tmp=svg.querySelector(".lm-tmp");if(!tmp){tmp=document.createElementNS("http://www.w3.org/2000/svg","path");tmp.setAttribute("class","lm-tmp");svg.appendChild(tmp)}
    const n=board().nodes.find(x=>x.id===drag.from),B=boxOf(n),x1=p.x<n.x+B.w/2?n.x:n.x+B.w,y1=n.y+B.h/2;tmp.setAttribute("d","M"+x1+","+y1+" L"+p.x+","+p.y);
    $$(".lm-node.is-target",root).forEach(x=>x.classList.remove("is-target"));const over=document.elementFromPoint(e.clientX,e.clientY);const t=over&&over.closest("[data-node]");if(t&&t.dataset.node!==drag.from)t.classList.add("is-target")}
}
function labelAt(p,e){if(e.derived&&(e.rel==="sold"||e.rel==="stock")){const q=p.at(.78);p.mx=q[0];p.my=q[1]}return p}
function paintEdgesLive(b){
  const by=Object.fromEntries(b.nodes.map(n=>[n.id,n]));
  $$(".lm-edges [data-edge]",root).forEach(g=>{const e=b.edges.find(x=>x.id===g.dataset.edge);if(!e)return;const a=by[e.from],c=by[e.to];if(!a||!c)return;const p=labelAt(pathFor(a,c),e);g.querySelectorAll("path").forEach(x=>x.setAttribute("d",p.d));const lb=g.querySelector(".lm-lb");if(lb)lb.setAttribute("transform","translate("+p.mx+","+p.my+")")});
}
function onUp(e){
  pts.delete(e.pointerId);if(!drag)return;const d=drag;drag=pts.size?drag:null;if(d.kind==="pinch"){drag=null;return}
  if(d.kind==="pan"){if(!d.moved){if(sel){sel=null;paintEdges();paintSide();$$(".lm-node.is-sel",root).forEach(x=>x.classList.remove("is-sel"))}}return}
  if(d.kind==="node"){
    if(d.moved){withBoard(b=>{const n=b.nodes.find(x=>x.id===d.id),m=d.b&&d.b.nodes.find(x=>x.id===d.id);if(n&&m){n.x=m.x;n.y=m.y}});return}
    if(connectFrom!=null){if(!connectFrom){connectFrom=d.id;paint()}else{const a=connectFrom;connectFrom=null;connect(a,d.id)}return}
    sel={node:d.id};$$(".lm-node",root).forEach(x=>x.classList.toggle("is-sel",x.dataset.node===d.id));paintEdges();paintSide();return}
  if(d.kind==="link"){const tmp=root.querySelector(".lm-tmp");if(tmp)tmp.remove();$$(".lm-node.is-target",root).forEach(x=>x.classList.remove("is-target"));
    const over=document.elementFromPoint(e.clientX,e.clientY),t=over&&over.closest("[data-node]");if(t&&t.dataset.node!==d.from)connect(d.from,t.dataset.node);else toast("اترك السهم فوق عنصر آخر لربطهما","info")}
}
function onWheel(e){if(!e.target.closest(".lm-canvas")||!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoomAt(e.deltaY<0?1.1:1/1.1,e.clientX,e.clientY)}
function onKey(e){
  const nd=e.target.closest&&e.target.closest("[data-node]");
  if(nd&&(e.key==="Enter"||e.key===" ")){e.preventDefault();if(connectFrom!=null){if(!connectFrom){connectFrom=nd.dataset.node;paint()}else{const a=connectFrom;connectFrom=null;connect(a,nd.dataset.node)}}else{sel={node:nd.dataset.node};paintEdges();paintSide();$$(".lm-node",root).forEach(x=>x.classList.toggle("is-sel",x===nd))}}
  if(e.key==="Escape"&&connectFrom!=null){connectFrom=null;paint()}
}

function render(el){
  root=el;ents=null;sel=null;connectFrom=null;
  if(!G()||!P()){el.innerHTML='<p class="muted">محرك الربط غير متاح.</p>';return}
  if(!el.__lm){el.__lm=true;
    el.addEventListener("click",onClick);el.addEventListener("submit",onSubmit);el.addEventListener("change",onChange);el.addEventListener("keydown",onKey);
    el.addEventListener("pointerdown",onDown);el.addEventListener("pointermove",onMove);el.addEventListener("pointerup",onUp);el.addEventListener("pointercancel",onUp);el.addEventListener("wheel",onWheel,{passive:false});
    SK.bus&&SK.bus.on&&SK.bus.on("company",()=>{if(root&&root.isConnected){ents=null;paint()}});
  }
  paint().then(()=>fit());
}
/* any record on a new board with everything it links to (a box opens as its product tree) */
async function tplItem(t,id){
  if(t==="box")return tplProduct(id);
  await loadEnts();const e=ent(t,id);if(!e)return;const b=newBoard(e.name,"item");
  const n=place(b,t,id,500,0);put((d=>{const i=d.boards.findIndex(x=>x.id===b.id);d.boards[i]=b;return d})(st()));
  await expand(n);const d=st();return finishTpl(board(d));
}
window.SKosifLinkMap=Object.freeze({item:(t,id)=>tplItem(t,id),product:id=>tplProduct(id),suppliers:id=>tplRawSuppliers(id),customer:id=>tplCustomer(id),boards:()=>st().boards.map(b=>({id:b.id,name:b.name,nodes:b.nodes.length,edges:b.edges.length}))});
SK.view("linkmap",{render});
})();

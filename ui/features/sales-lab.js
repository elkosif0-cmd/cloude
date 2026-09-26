/* S.kosif — مختبر المبيعات داخل «ذكاء المبيعات» (لا شاشة جديدة).
   من لوحة تحليل المبيعات المرفقة، ما لم يكن موجوداً في الشاشة: النبض الزمني (الاتجاه اليومي بمتوسط متحرك
   7 أيام، الأداء الشهري والنمو، توقع 30 يوماً بنطاق ثقة 80٪)، توزيع الفواتير والشرائح السعرية، سباق الزخم
   (الصاعدون والمتراجعون)، الخرائط الحرارية (القنوات والأصناف × الشهور)، المختبر الإحصائي، وصندوق أفكار النمو.
   الأرقام من SKEngines.sales.salesAnalytics على سطور المبيعات المحفوظة في الجهاز (IndexedDB aghnam-app-v7). */
(()=>{
"use strict";
const {esc}=SK;
const A=()=>SKEngines.sales.salesAnalytics;
const sar=h=>SKCharts.compact(Math.round((Number(h)||0)/100));
let tab="pulse",cache=null;
const TABS=[["pulse","النبض الزمني"],["invoices","الفواتير والشرائح"],["momentum","سباق الزخم"],["maps","الخرائط الحرارية"],["stats","المختبر الإحصائي"],["profit","الربحية والقنوات"],["tree","شجرة الأصناف"],["ideas","أفكار النمو"]];
const RK="skosif_cost_rules_v1";let pf="all",pch="";

function lines(){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);
  q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains("sales_lines")){db.close();return res([])}const g=db.transaction("sales_lines").objectStore("sales_lines").getAll();
    g.onsuccess=()=>{db.close();res((g.result||[]).map(l=>({date:String(l.date||"").slice(0,10),amount:Number.isFinite(+l.amountHalalas)?+l.amountHalalas:Math.round((+l.amount||0)*100),qty:+l.qty||1,product:String(l.descriptionOriginal||l.product||"غير محدد"),customerId:l.customerId||"",invoice:l.ref||l.externalOrderId||"",channel:l.source||""})))};g.onerror=()=>{db.close();res([])}}})}

async function lab(){
  const L=await lines();if(!L.length)return null;
  const key=L.length+"|"+L.reduce((a,l)=>l.date>a?l.date:a,"");if(cache&&cache.key===key)return cache.lab;
  const last=L.reduce((a,l)=>l.date>a?l.date:a,""),today=new Date().toISOString().slice(0,10);
  const r=A().salesLab(L,last>today?today:last);cache={key,lab:r};return r;
}
const kpi=(l,v,s,cls)=>'<div class="skslab-k'+(cls?" "+cls:"")+'"><small>'+esc(l)+'</small><b>'+v+'</b>'+(s?'<span>'+s+'</span>':'')+'</div>';

function pulse(r){
  const d=r.daily,n=Math.min(120,d.labels.length),lab=d.labels.slice(-n).map(x=>x.slice(5)),vals=d.values.slice(-n).map(v=>Math.round(v/100)),ma=r.ma7.slice(-n).map(v=>v==null?null:Math.round(v/100));
  const f=r.forecast,fl=f.forecast.map((_,i)=>"+"+(i+1));
  return '<div class="skslab-kpis">'+kpi("توقع 30 يوماً",sar(f.total)+" ر.س","نطاق 80٪: "+sar(f.low)+" – "+sar(f.high))+kpi("ميل الاتجاه اليومي",(f.slope>=0?"+":"")+sar(f.slope)+" ر.س/يوم",f.slope>=0?"الاتجاه صاعد ↑":"الاتجاه هابط ↓ — تدخّل مبكراً",f.slope>=0?"ok":"bad")+
    kpi("آخر شهر",sar((r.monthly.at(-1)||{}).revenue)+" ر.س",(r.monthly.at(-1)||{}).growth==null?"":"النمو "+(r.monthly.at(-1).growth>=0?"+":"")+r.monthly.at(-1).growth+"٪")+'</div>'+
    '<div class="skslab-2"><div><h4>الاتجاه اليومي مع المتوسط المتحرك (7 أيام)</h4>'+SKCharts.line({labels:lab,series:[{name:"المبيعات اليومية",values:vals},{name:"المتوسط المتحرك",values:ma.map(v=>v==null?NaN:v)}],height:220,endLabels:false})+'</div>'+
    '<div><h4>الأداء الشهري والنمو</h4>'+SKCharts.bars({labels:r.monthly.map(m=>m.month.slice(2)),series:[{name:"الإيراد (ر.س)",values:r.monthly.map(m=>Math.round(m.revenue/100))}],height:220})+'<p class="hint">الفواتير شهرياً: '+r.monthly.slice(-6).map(m=>m.month.slice(2)+" "+m.invoices).join(" · ")+'</p>'+'</div></div>'+
    (f.forecast.length?'<h4>توقع المبيعات — 30 يوماً قادمة</h4>'+SKCharts.line({labels:fl,series:[{name:"التوقع اليومي (ر.س)",values:f.forecast.map(v=>Math.round(v/100))}],height:180,endLabels:false})+'<p class="hint">امتداد خطي لآخر '+f.basis+' يوماً؛ النطاق من تشتت البواقي (الخطأ المعياري '+sar(f.residStd)+' ر.س/يوم). توقع إرشادي وليس وعداً.</p>':'');
}
function invoices(r){
  const s=r.invoices;
  return '<div class="skslab-kpis">'+kpi("متوسط الفاتورة",sar(s.mean)+" ر.س",s.count+" فاتورة")+kpi("وسيط الفاتورة",sar(s.median)+" ر.س","نصف الفواتير فوق هذه القيمة")+kpi("عتبة الفواتير الكبيرة",sar(s.p90)+" ر.س","أعلى 10٪ تبدأ من هنا")+kpi("أكبر فاتورة",sar(s.max)+" ر.س","الصفقة القياسية")+'</div>'+
    '<div class="skslab-2"><div><h4>توزيع قيم الفواتير</h4>'+SKCharts.bars({labels:s.histogram.map(b=>sar(b.from)),series:[{name:"عدد الفواتير",values:s.histogram.map(b=>b.count)}],height:210})+'<p class="hint">شكل التوزيع يكشف شخصية البيع: سلة صغيرة متكررة أم صفقات كبيرة نادرة.</p></div>'+
    '<div><h4>الشرائح السعرية التي تصنع الإيراد</h4>'+SKCharts.hbars({rows:s.bands.map(b=>({label:sar(b.from)+(b.to?" – "+sar(b.to):"+")+" ر.س",value:Math.round(b.share*1000)/10})),fmt:v=>v+"٪",sort:false})+'</div></div>';
}
function race(r){
  const t=(list,up)=>list.length?'<div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>الصنف</th><th>آخر 30 يوماً</th><th>الثلاثون قبلها</th><th>التغير</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc(x.product)+'</td><td class="num">'+sar(x.cur)+'</td><td class="num">'+sar(x.prev)+'</td><td class="num"><span class="sksev '+(up?"ok":"bad")+'">'+(x.change==null?"جديد":(x.change>0?"+":"")+x.change+"٪")+'</span></td></tr>').join("")+'</tbody></table></div>':'<p class="hint">'+(up?"لا أصناف صاعدة بقوة في هذه الفترة.":"لا أصناف متراجعة بقوة.")+'</p>';
  return '<div class="skslab-2"><div><h4>🚀 الصاعدون</h4>'+t(r.momentum.risers,true)+'</div><div><h4>🧯 المتراجعون</h4>'+t(r.momentum.fallers,false)+'</div></div>'+
    '<h4>القنوات: آخر 60 يوماً مقابل الستين قبلها</h4><div class="skslab-kpis">'+r.channels.slice(0,4).map(c=>kpi(c.name,sar(c.cur)+" ر.س",c.growth==null?"":(c.growth>=0?"+":"")+c.growth+"٪",c.growth==null?"":c.growth>=0?"ok":"bad")).join("")+'</div>';
}
async function maps(){
  const L=await lines(),ch=A().monthMatrix(L,"channel"),it=A().monthMatrix(L,"product",{top:10}),f=v=>SKCharts.compact(Math.round(v/100));
  return '<h4>القنوات × الشهور</h4>'+SKCharts.matrix({...ch,fmt:f})+'<h4>الأصناف × الشهور (أعلى 10)</h4>'+SKCharts.matrix({...it,fmt:f})+'<p class="hint">كل خلية إيراد الشهر بالريال؛ الأغمق أعلى. ابحث عن الأنماط الموسمية وعن الأصناف التي تخبو.</p>';
}
function stats(r){
  const d=r.stats.daily,c=d.cv;
  return '<div class="skslab-kpis">'+kpi("متوسط الإيراد اليومي",sar(d.mean)+" ر.س","آخر "+d.n+" يوماً")+kpi("الوسيط اليومي",sar(d.median)+" ر.س","أقل تأثراً بالأيام الاستثنائية")+kpi("الانحراف المعياري",sar(d.std)+" ر.س",c==null?"":c>0.6?"تقلّب مرتفع — المبيعات غير منتظمة":"تقلّب معتدل")+
    kpi("المدى الربيعي IQR",sar(d.q1)+" – "+sar(d.q3),"50٪ من الأيام ضمن هذا النطاق")+kpi("معامل الالتواء",String(d.skew),d.skew>0.5?"ملتوٍ يميناً — أيام ذروة ترفع المتوسط":"شبه متماثل")+kpi("معامل الاختلاف CV",c==null?"—":Math.round(c*100)+"٪",c!=null&&c<0.4?"استقرار جيد":"يحتاج تنعيماً بالعروض",c!=null&&c<0.4?"ok":"warn")+
    kpi("تركيز أعلى 10 أصناف",Math.round(r.stats.top10Share*100)+"٪","مؤشر هيرفندال "+r.stats.hhi)+kpi("ارتباط الكمية بالإيراد",r.stats.qtyRevenue==null?"—":String(r.stats.qtyRevenue),"معامل بيرسون على سطور البيع")+kpi("العملاء المكررون",r.stats.repeatRate==null?"—":Math.round(r.stats.repeatRate*100)+"٪","اشتروا أكثر من فاتورة")+'</div>';
}
function ideas(r){
  return r.ideas.length?'<div class="skslab-ideas">'+r.ideas.map(i=>'<article><b>'+esc(i.title)+'</b><p>'+esc(i.body)+'</p><small>'+esc(i.metric)+'</small><button type="button" class="linkish" data-slab-task="'+esc(i.title)+'">+ مهمة</button></article>').join("")+'</div>':'<p class="hint">لا تشير الأرقام الحالية إلى مبادرة واضحة.</p>';
}
/* ---------- gross profit with the cost basis by validity period and channel (from the attached management module) ---------- */
const rules=()=>{const r=SK.load(RK,[]);return Array.isArray(r)?r:[]};
function catalogCost(){const m=new Map();try{(SKosifCore.catalog().items||[]).forEach(i=>{if(i.cost!=null)m.set(i.name,Math.round(i.cost*100))})}catch{}return m}
function costFn(){const R=rules().map(r=>({...r,cost:Math.round((+r.cost||0)*100)})),cat=catalogCost();return l=>A().resolveCost(R,l.product,l.channel,l.date,cat.has(l.product)?cat.get(l.product):null)}
async function profit(){
  const L=await lines(),f=costFn(),p=A().profitability(L,f),chs=p.channels.map(c=>c.key);if(!pch||!chs.includes(pch))pch=chs[0]||"";
  const rows=pf==="top"?p.products.filter(x=>x.costed).slice(0,10):pf==="weak"?p.products.filter(x=>p.losing.includes(x.key)||p.weak.includes(x.key)):p.products;
  const pct=m=>m==null?"—":Math.round(m*1000)/10+"٪";
  const T=list=>'<div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>البند</th><th>الإيراد الصافي</th><th>التكلفة</th><th>مجمل الربح</th><th>الهامش</th><th>الكمية</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc(x.key)+(x.costed?'':' <span class="sksev info">بلا تكلفة</span>')+'</td><td class="num">'+sar(x.revenue)+'</td><td class="num">'+sar(x.cost)+'</td><td class="num"><b class="'+(x.gross<0?"neg":"")+'">'+sar(x.gross)+'</b></td><td class="num"><span class="sksev '+(x.margin==null?"info":x.margin<0?"bad":x.margin<.1?"warn":"ok")+'">'+pct(x.margin)+'</span></td><td class="num">'+SKCharts.compact(x.qty)+'</td></tr>').join("")+'</tbody></table></div>';
  const R=rules();
  return '<div class="skslab-kpis">'+kpi("مجمل الربح",sar(p.products.reduce((a,x)=>a+x.gross,0))+" ر.س","الإيراد بعد الضريبة ناقص التكلفة")+kpi("أصناف خاسرة",String(p.losing.length),p.losing.slice(0,2).join("، "),p.losing.length?"bad":"ok")+kpi("هامش ضعيف (<10٪)",String(p.weak.length),p.weak.slice(0,2).join("، "),p.weak.length?"warn":"ok")+kpi("بلا تكلفة",String(p.uncosted.length),p.uncosted.length?"أضف قاعدة تكلفة":"كل الأصناف مسعّرة",p.uncosted.length?"warn":"ok")+'</div>'+
    '<div class="skslab-2"><div><h4>أداء القنوات</h4>'+SKCharts.hbars({rows:p.channels.map(c=>({label:c.key+" · "+pct(c.margin),value:Math.round(c.gross/100)})),fmt:v=>SKCharts.compact(v)+" ر.س"})+'</div>'+
      '<div><h4>المنتجات داخل القناة <select data-slab-ch aria-label="القناة">'+chs.map(c=>'<option'+(c===pch?' selected':'')+'>'+esc(c)+'</option>').join("")+'</select></h4>'+T(A().channelProducts(L,pch,f).slice(0,8))+'</div></div>'+
    '<h4>الترتيب حسب مجمل الربح <span class="sk-seg skslab-pf">'+[["all","الكل"],["top","الأعلى ربحاً"],["weak","الخاسرة والضعيفة"]].map(([k,l])=>'<button type="button" data-slab-pf="'+k+'" aria-pressed="'+(pf===k)+'">'+l+'</button>').join("")+'</span></h4>'+T(rows)+
    '<h4>قاعدة التكلفة حسب فترة السريان والقناة</h4><p class="hint">التكلفة للوحدة (كجم أو بوكس) بالريال. القاعدة الأدق تغلب: قناة محددة قبل «كل القنوات»، والأحدث سرياناً أولاً؛ وبدون قاعدة تُستخدم تكلفة الصنف المحسوبة في الكتالوج.</p>'+
    '<div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>الصنف</th><th>القناة</th><th>من</th><th>إلى</th><th>التكلفة</th><th></th></tr></thead><tbody>'+R.map(r=>'<tr><td>'+esc(r.product)+'</td><td>'+esc(r.channel||"كل القنوات")+'</td><td class="mono">'+esc(r.from||"—")+'</td><td class="mono">'+esc(r.to||"—")+'</td><td class="num">'+(+r.cost).toFixed(2)+'</td><td><button type="button" class="linkish" data-slab-rdel="'+esc(r.id)+'">حذف</button></td></tr>').join("")+
      '<tr class="skslab-new"><td><input data-cr="product" list="slab-prods" placeholder="الصنف" aria-label="الصنف"><datalist id="slab-prods">'+p.products.map(x=>'<option value="'+esc(x.key)+'">').join("")+'</datalist></td><td><select data-cr="channel" aria-label="القناة"><option value="">كل القنوات</option>'+chs.map(c=>'<option>'+esc(c)+'</option>').join("")+'</select></td><td><input type="date" data-cr="from" aria-label="من"></td><td><input type="date" data-cr="to" aria-label="إلى"></td><td><input type="number" step="0.01" min="0" data-cr="cost" placeholder="0.00" aria-label="التكلفة"></td><td><button type="button" class="btn sm primary" data-slab-radd>إضافة</button></td></tr></tbody></table></div>'+
    '<div class="sk-actions"><button type="button" class="btn sm" data-tpl-dl="costrules">تحميل قالب قواعد التكلفة</button><button type="button" class="btn sm" data-tpl-in="costrules">استيراد القواعد</button></div>';
}
/* ---------- the item tree with codes: category → items (code, cost, price, margin) ---------- */
function tree(){
  let items=[];try{items=SKosifCore.catalog().items||[]}catch{}if(!items.length)return '<p class="hint">الكتالوج فارغ.</p>';
  const cats=new Map();items.forEach(i=>{const k=i.cat||"بلا فئة";(cats.get(k)||cats.set(k,[]).get(k)).push(i)});
  const code=(i,n)=>(i.kind==="box"?"BOX-":"ITM-")+String(n).padStart(3,"0");let n=0;
  return '<p class="hint">'+cats.size+' فئة · '+items.length+' صنفاً — التكلفة والسعر من محرك التسعير.</p><div class="skslab-tree">'+[...cats.entries()].map(([k,list])=>'<details open><summary><b>'+esc(k)+'</b> <small>'+list.length+' · متوسط الهامش '+Math.round(list.filter(i=>i.margin!=null).reduce((a,i)=>a+i.margin,0)/Math.max(1,list.filter(i=>i.margin!=null).length)*100)+'٪</small></summary><table class="sk-table" data-sk-plain><thead><tr><th>الرمز</th><th>الصنف</th><th>النوع</th><th>التكلفة</th><th>السعر</th><th>الهامش</th></tr></thead><tbody>'+
    list.map(i=>'<tr><td class="mono">'+code(i,++n)+'</td><td>'+esc(i.name)+'</td><td>'+(i.kind==="box"?"بوكس":i.byProduct?"ثانوي":"خام")+'</td><td class="num">'+(i.cost==null?"—":i.cost.toFixed(2))+'</td><td class="num">'+(i.price==null?"—":i.price.toFixed(2))+'</td><td class="num"><span class="sksev '+(i.margin==null?"info":i.margin<0?"bad":i.margin<.15?"warn":"ok")+'">'+(i.margin==null?"—":Math.round(i.margin*100)+"٪")+'</span></td></tr>').join("")+'</tbody></table></details>').join("")+'</div>'+
    '<div class="sk-actions"><button type="button" class="btn sm" data-slab-treecsv>تصدير الشجرة</button><button type="button" class="btn sm" data-tpl-dl="catalog">قالب الأصناف</button></div>';
}
async function paint(host){
  const r=await lab();
  if(!r){host.innerHTML='';return}
  const body=tab==="pulse"?pulse(r):tab==="invoices"?invoices(r):tab==="momentum"?race(r):tab==="maps"?await maps():tab==="stats"?stats(r):tab==="profit"?await profit():tab==="tree"?tree():ideas(r);
  host.innerHTML='<section class="card skslab"><div class="card-h"><div><span class="eyebrow">مستفاد من لوحة التحليل المرفقة</span><h3>مختبر المبيعات</h3><p>فصول تحليلية إضافية على نفس سطور المبيعات — كل رقم من محرك قابل للتكرار.</p></div></div>'+
    '<div class="card-b"><div class="sk-seg skslab-tabs" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-slab="'+k+'" aria-pressed="'+(tab===k)+'">'+l+'</button>').join("")+'</div>'+body+'</div></section>';
}
function mount(root){
  let host=root.querySelector(":scope [data-slab-host]");
  if(!host){host=document.createElement("div");host.setAttribute("data-slab-host","");root.appendChild(host)}
  paint(host).catch(e=>SK.errors&&SK.errors.report(e,"sales-lab"));
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-slab]");if(b){tab=b.dataset.slab;const h=document.querySelector("[data-slab-host]");if(h)paint(h);return}
  const repaint=()=>{const h=document.querySelector("[data-slab-host]");if(h)paint(h)};
  const pfb=e.target.closest("[data-slab-pf]");if(pfb){pf=pfb.dataset.slabPf;repaint();return}
  const rd=e.target.closest("[data-slab-rdel]");if(rd){SK.save(RK,rules().filter(x=>x.id!==rd.dataset.slabRdel));repaint();return}
  if(e.target.closest("[data-slab-radd]")){const g=k=>{const el=document.querySelector('[data-cr="'+k+'"]');return el?el.value.trim():""};const product=g("product"),cost=Number(g("cost"));
    if(!product||!(cost>=0)||g("cost")===""){SK.toast("اكتب الصنف والتكلفة","warn");return}if(g("from")&&g("to")&&g("from")>g("to")){SK.toast("تاريخ البداية بعد النهاية","warn");return}
    SK.save(RK,[...rules(),{id:"cr-"+Date.now().toString(36),product,channel:g("channel"),from:g("from"),to:g("to"),cost}]);SK.toast("أُضيفت قاعدة التكلفة","ok");repaint();return}
  if(e.target.closest("[data-slab-treecsv]")){let items=[];try{items=SKosifCore.catalog().items||[]}catch{}SK.csv.download("SQC-item-tree.csv",["الفئة","الصنف","النوع","التكلفة","السعر","الهامش"],items.map(i=>[i.cat,i.name,i.kind==="box"?"بوكس":"خام",i.cost,i.price,i.margin==null?"":Math.round(i.margin*1000)/10+"%"]));return}
  const t=e.target.closest("[data-slab-task]");if(t&&window.SKosifTasks&&SKosifTasks.add){SKosifTasks.add({title:"مبادرة: "+t.dataset.slabTask,cap:"salesintel",priority:"normal"});SK.toast("أُضيفت إلى المهام","ok")}
});
document.addEventListener("change",e=>{const c=e.target.closest("[data-slab-ch]");if(c){pch=c.value;const h=document.querySelector("[data-slab-host]");if(h)paint(h)}});
function boot(){const c=window.SKosifCore;if(c&&c.onView)c.onView("salesintel",mount);else setTimeout(boot,300)}
boot();
window.SKosifSalesLab=Object.freeze({lab});
})();

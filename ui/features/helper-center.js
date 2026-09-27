/* SQC — the accountant's helper tools: the entry of the second program.
   The audit is the main program; the helper tools are a separate one that works on one company at a
   time (SK.ws): on entry it asks which company — the one open, another one, or a new company (empty or
   with demo data) — then shows that company's tree: its products and costs, sales and customers, stock
   and suppliers, books, and reports, each branch leading to its tools.
   Nothing here creates audit evidence: a helper output reaches an audit file only when the auditor
   attaches it inside the engagement. */
(()=>{
"use strict";
const {esc,$,$$}=SK;
const core=()=>window.SKosifCore;
const ACTIVITIES=["لحوم ومواشي","تجزئة وبيع مباشر","تصنيع","مطاعم وأغذية","توزيع وجملة","خدمات","مقاولات","أخرى"];
const CURRENCIES=[["SAR","ريال سعودي"],["AED","درهم إماراتي"],["EGP","جنيه مصري"],["KWD","دينار كويتي"],["USD","دولار أمريكي"]];
/* what each branch counts for the company on screen */
const COUNT={
  catalog:s=>[[s.items,"صنف خام"],[s.boxes,"بوكس ومنتج"]],
  sales:s=>[[s.customers,"عميل"],[s.orders,"طلب"]],
  stock:s=>[[s.suppliers,"مورد"]],
  finance:s=>[[s.entries,"قيد"]],
  reports:()=>[]
};
const BRANCH_SUB={
  catalog:"شجرة المنتج: المواد الخام والهدر، البوكسات وتركيبتها، التكلفة والتسعير",
  sales:"الطلبات والعملاء والائتمان والعروض وتحليل المبيعات",
  stock:"الأرصدة والحركة والموردون والمشتريات والإنتاج والعائد",
  finance:"الدفاتر والنقد والذمم والسلف والتحليل المالي",
  reports:"المطابقة والاستيراد والتقارير والأرشيف"
};
const n=v=>Number(v||0).toLocaleString("ar-SA");
const ws=()=>SK.ws;
const allowed=c=>c&&!c.hidden&&SK.perm.can(c.id);
function branches(){
  return SK.caps.groupsIn("helpers").filter(g=>g.id!=="helpers").map(g=>{
    const hubs=SK.caps.hubsInGroup(g.id).filter(allowed).map(h=>({hub:h,pages:SK.caps.members(h.id).filter(allowed).filter(p=>p.id!==h.id)}));
    return{g,hubs};
  }).filter(b=>b.hubs.length);
}
function coLine(c){return[c.activity,c.city,c.currency].filter(Boolean).map(esc).join(" · ")}
function counts(s,gid){return (COUNT[gid]||(()=>[]))(s).map(([v,l])=>'<span class="hd-count"><b>'+n(v)+'</b> '+esc(l)+'</span>').join("")}

/* ---------- the company step ---------- */
function companyCard(c,act){
  return '<article class="hd-co'+(act?' is-on':'')+'" data-co="'+esc(c.id)+'"><div class="hd-co-h"><span class="hd-co-ic">'+esc((c.name||"؟").replace(/^(شركة|مؤسسة)\s+/,"").charAt(0))+'</span><div><b>'+esc(c.name)+'</b><small>'+(coLine(c)||"—")+'</small></div>'+(act?'<span class="sk-pill good">المفتوحة الآن</span>':'')+'</div>'+
    '<div class="hd-co-s" data-co-sum="'+esc(c.id)+'"><small class="muted">…</small></div>'+
    '<div class="hd-co-a">'+(act?'<button type="button" class="btn primary" data-hd="stay">متابعة مع هذه الشركة</button>':'<button type="button" class="btn primary" data-hd="open" data-id="'+esc(c.id)+'">افتح أدواتها</button><button type="button" class="btn ghost sm" data-hd="del" data-id="'+esc(c.id)+'" aria-label="حذف '+esc(c.name)+'">حذف</button>')+'</div></article>';
}
function sumLine(s){
  if(!s)return'<small class="muted">لم تُفتح بعد — تبدأ فارغة</small>';
  return[[s.items,"صنف"],[s.boxes,"بوكس"],[s.suppliers,"مورد"],[s.customers,"عميل"],[s.orders,"طلب"],[s.entries,"قيد"]].map(([v,l])=>'<span><b>'+n(v)+'</b> '+l+'</span>').join("");
}
function newForm(){
  return '<article class="hd-co hd-new"><div class="hd-co-h"><span class="hd-co-ic">+</span><div><b>شركة جديدة</b><small>تبدأ بأدوات فارغة، أو ببيانات تجريبية للتجربة</small></div></div>'+
    '<form class="hd-new-f" data-hd-form novalidate>'+
    '<label class="sk-field"><span>اسم الشركة</span><input name="name" required maxlength="80" placeholder="مثال: مؤسسة النخبة للحوم"></label>'+
    '<label class="sk-field"><span>النشاط</span><select name="activity">'+ACTIVITIES.map(a=>'<option>'+esc(a)+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>المدينة</span><input name="city" maxlength="40" placeholder="جدة"></label>'+
    '<label class="sk-field"><span>العملة</span><select name="currency">'+CURRENCIES.map(([v,l])=>'<option value="'+v+'">'+esc(l)+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>الرقم الضريبي (اختياري)</span><input name="vatNo" inputmode="numeric" maxlength="15"></label>'+
    '<label class="hd-chk"><input type="checkbox" name="demo"> ابدأ ببيانات تجريبية (أصناف، عملاء، موردون، قيود)</label>'+
    '<button type="submit" class="btn primary">أنشئ الشركة وافتحها</button></form></article>';
}
function chooser(){
  const list=ws().list(),a=ws().activeId();
  const ordered=[...list.filter(c=>c.id===a),...list.filter(c=>c.id!==a)];
  return '<section class="card hd-choose" aria-labelledby="hd-ch-t"><div class="card-h"><div><h3 id="hd-ch-t">على أي شركة ستعمل؟</h3><p>الأدوات المساعدة برنامج مستقل: كل شركة لها أصنافها ومخزونها وموردوها وعملاؤها ومبيعاتها وقيودها وملاحظاتها. التبديل يحفظ بيانات الشركة الحالية كما هي ويفتح بيانات الأخرى.</p></div></div>'+
    '<div class="card-b hd-cos">'+ordered.map(c=>companyCard(c,c.id===a)).join("")+newForm()+'</div></section>';
}

/* ---------- the company's tree ---------- */
function tree(s){
  const c=ws().active()||{};
  return '<section class="card hd-tree-card"><div class="card-h"><div><h3>شجرة '+esc(c.name||"الشركة")+'</h3><p>كل فرع مجال عمل، وكل ورقة أداة. اضغط أي أداة لفتحها على بيانات هذه الشركة.</p></div>'+
    '<label class="hd-find"><span class="sr-only">ابحث في الأدوات</span><input type="search" data-hd-find placeholder="ابحث عن أداة…"></label></div>'+
    '<div class="card-b"><div class="hd-tree" role="tree" aria-label="أدوات '+esc(c.name||"")+'"><div class="hd-root"><span class="hd-root-ic">'+(SK.icons.helperdesk||"")+'</span><b>'+esc(c.name||"الشركة")+'</b><small>'+(coLine(c)||"")+'</small></div>'+
    '<ul class="hd-branches">'+branches().map(({g,hubs})=>'<li class="hd-branch" role="treeitem" aria-expanded="true"><details open><summary><span class="hd-b-ic">'+(SK.icons[hubs[0].hub.id]||"")+'</span><span class="hd-b-t"><b>'+esc(g.label)+'</b><small>'+esc(BRANCH_SUB[g.id]||"")+'</small></span><span class="hd-b-n">'+counts(s,g.id)+'</span></summary>'+
      '<ul class="hd-leaves" role="group">'+hubs.map(({hub,pages})=>'<li class="hd-leaf" data-hd-name="'+esc([hub.label,hub.hubLabel,hub.sub].concat(pages.map(p=>p.label+" "+(p.sub||""))).join(" "))+'"><button type="button" class="hd-tool" data-hd-go="'+esc(hub.id)+'">'+(SK.icons[hub.id]||SK.icons.action||"")+'<span><b>'+esc(hub.hubLabel||hub.label)+'</b><small>'+esc(hub.sub||"")+'</small></span></button>'+
        (pages.length?'<div class="hd-pages">'+pages.map(p=>'<button type="button" class="hd-page" data-hd-go="'+esc(p.id)+'" data-hd-name="'+esc(p.label+" "+(p.sub||""))+'">'+esc(p.label)+'</button>').join("")+'</div>':'')+'</li>').join("")+'</ul></details></li>').join("")+'</ul></div></div></section>';
}
const KPI=[["items","صنف خام"],["boxes","بوكس ومنتج"],["suppliers","مورد"],["customers","عميل"],["orders","طلب"],["entries","قيد"]];
async function render(root){
  if(!ws()){root.innerHTML='<p class="muted">مساحات الشركات غير متاحة.</p>';return}
  const c=ws().ensure(),ask=!ws().chosen();
  let s={};try{s=await ws().summary()}catch{}
  root.innerHTML='<div class="hd-shell"><section class="card hd-hero"><div><span class="eyebrow">الأدوات المساعدة للمحاسب</span><h2>'+esc(c?c.name:"الشركة")+'</h2><p>'+(coLine(c||{})||"برنامج مستقل عن المراجعة لشركة واحدة في كل مرة")+'</p>'+
    '<div class="hd-kpis">'+KPI.map(([k,l])=>'<span><b>'+n(s[k])+'</b>'+l+'</span>').join("")+'</div></div>'+
    '<div class="hd-hero-a"><button type="button" class="btn" data-hd="choose">'+(SK.icons.companies||"")+' تبديل الشركة أو شركة جديدة</button><span class="hd-badge">مستقلة عن ملفات المراجعة</span></div></section>'+
    '<div data-hd-choose'+(ask?'':' hidden')+'>'+chooser()+'</div>'+
    tree(s)+'</div>';
  if(ask)fillSummaries(root);
  wire(root);
}
async function fillSummaries(root){
  for(const c of ws().list()){
    const el=root.querySelector('[data-co-sum="'+CSS.escape(c.id)+'"]');if(!el)continue;
    try{el.innerHTML=sumLine(c.id===ws().activeId()?await ws().summary():((await ws().info(c.id))||{}).summary)}catch{el.innerHTML=sumLine(null)}
  }
}
function busy(root,msg){const w=root.querySelector("[data-hd-choose]");if(w)w.insertAdjacentHTML("afterbegin",'<p class="hd-busy" role="status">'+esc(msg)+'</p>');$$("button",root).forEach(b=>b.disabled=true)}
function wire(root){
  if(root.__hdWired)return;root.__hdWired=true;
  root.addEventListener("click",async e=>{
    const g=e.target.closest("[data-hd-go]");if(g){ws().markChosen();core()&&core().go(g.dataset.hdGo);return}
    const b=e.target.closest("[data-hd]");if(!b)return;
    const a=b.dataset.hd;
    if(a==="choose"){const w=root.querySelector("[data-hd-choose]");w.hidden=!w.hidden;if(!w.hidden){fillSummaries(root);w.scrollIntoView({behavior:"smooth",block:"start"})}}
    else if(a==="stay"){ws().markChosen();root.querySelector("[data-hd-choose]").hidden=true}
    else if(a==="open"){busy(root,"جارٍ حفظ الشركة الحالية وفتح الأخرى…");try{await ws().switchTo(b.dataset.id)}catch(err){SK.toast(err.message||String(err),"err");render(root)}}
    else if(a==="del"){const c=ws().list().find(x=>x.id===b.dataset.id);if(!c)return;
      if(!await SK.confirm("حذف «"+c.name+"» وكل بيانات أدواتها المساعدة من هذا الجهاز؟ ملفات المراجعة لا تتأثر.",{title:"حذف الشركة",danger:true,ok:"حذف"}))return;
      try{await ws().remove(c.id);SK.toast("حُذفت الشركة","ok");render(root);root.querySelector("[data-hd-choose]").hidden=false}catch(err){SK.toast(err.message||String(err),"err")}}
  });
  root.addEventListener("submit",async e=>{
    const f=e.target.closest("[data-hd-form]");if(!f)return;e.preventDefault();
    const d=Object.fromEntries(new FormData(f));
    if(!String(d.name||"").trim()){f.name.focus();SK.toast("اكتب اسم الشركة","warn");return}
    busy(root,"جارٍ إنشاء الشركة وفتح أدواتها…");
    try{await ws().create({name:d.name,activity:d.activity,city:d.city,currency:d.currency,vatNo:d.vatNo,demo:!!d.demo})}catch(err){SK.toast(err.message||String(err),"err");render(root)}
  });
  root.addEventListener("input",e=>{
    const q=e.target.closest("[data-hd-find]");if(!q)return;const t=q.value.trim();
    $$(".hd-leaf",root).forEach(l=>{l.hidden=!!t&&!l.dataset.hdName.includes(t)});
    $$(".hd-branch",root).forEach(br=>{const any=$$(".hd-leaf",br).some(l=>!l.hidden);br.hidden=!any;if(t&&any)$("details",br).open=true});
  });
}
SK.view("helperdesk",{render});
})();

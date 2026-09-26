/* S.kosif — المدونة المحاسبية والمعايير (شاشة «codex») + بطاقة المعيار المشتركة (window.SKosifCodex).
   • المكتبة: كل معيار في السجل (IFRS · IAS · ISA · المتطلبات السعودية) بمتطلباته وإفصاحاته وإجراءات
     مراجعته وقسمه المقابل في معيار المنشآت الصغيرة وحالته وسريانه ومصدره الرسمي.
   • تحديث المعايير من المصادر الرسمية: فحص عبر Gemini مع بحث Google مقيد بنطاقات الجهات المصدرة
     (IFRS Foundation · IAASB · SOCPA · ZATCA · وزارة التجارة · هيئة السوق المالية · IESBA)؛ كل تحديث
     يبقى «بانتظار الاعتماد» حتى يعتمده المستخدم، ويحفظ روابطه وتاريخ فحصه.
   • بطاقة المعيار: تُفتح من أي شاشة (شارة المعيار بجوار الحساب في مراجعة الميزان) وتعرض علاقة
     المعيار بالحساب المحدد.
   البيانات: skosif_codex_updates_v1 = {checkedAt, items:[UpdateItem]} */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const KEY="skosif_codex_updates_v1";
const X=()=>SKEngines.audit.codex,U=()=>SKEngines.audit.standardsUpdate;
const FAM={IFRS:"معايير التقرير المالي",IAS:"معايير المحاسبة",ISA:"معايير المراجعة",SAUDI:"متطلبات سعودية",EAS:"معايير المحاسبة المصرية",EGYPT:"متطلبات مصرية"};
const STATUS={effective:["ساري","ok"],upcoming:["سريان قادم","warn"],replaced:["يُستبدل","info"]};
let root=null,q="",fam="all",busy=false;
const upd=()=>{const d=load(KEY,{})||{};return{checkedAt:d.checkedAt||"",items:Array.isArray(d.items)?d.items:[]}};
const list=()=>U().applyApproved(X().STANDARDS,upd().items);
const get=code=>list().find(s=>s.code===code)||null;
const famCls=f=>"std-"+String(f||"").toLowerCase();

/* ---------- the shared standard sheet ---------- */
let sheet=null,prev=null;
function close(){if(!sheet)return;sheet.remove();sheet=null;document.removeEventListener("keydown",onKey,true);try{prev&&prev.focus()}catch{}}
function onKey(e){if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close()}}
const ul=(t,items)=>items&&items.length?'<h4>'+esc(t)+'</h4><ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':"";
/* ctx: {account:{code,name,lineKey,lineAr,basis,assertions}, note, findings:[{title,basis,severity}], procedures:[], framework} */
function open(code,ctx={}){
  const s=get(code);close();prev=document.activeElement;
  sheet=document.createElement("div");sheet.className="stdx-wrap";
  const a=ctx.account,st=s?STATUS[s.status]||["",""]:["",""];
  const pending=upd().items.filter(u=>u.code===code&&u.status==="pending");
  const rel=a?X().relationOf(code,a.lineKey||null):"";
  const why=a?{name:"اسم الحساب",code:"رقم الحساب في دليل الحسابات",type:"نوع الحساب",manual:"تبويب يدوي",none:"—"}[a.basis]||"":"";
  sheet.innerHTML='<aside class="stdx" role="dialog" aria-modal="true" aria-labelledby="stdx-t">'+
    '<header><span class="std-b big '+famCls(s&&s.family)+'">'+esc(code)+'</span><div><h3 id="stdx-t">'+esc(s?s.titleAr:code)+'</h3><p>'+esc(s?s.titleEn:"معيار غير موجود في السجل")+'</p></div>'+
      '<button type="button" class="btn sm" data-stdx-close aria-label="إغلاق">إغلاق</button></header><div class="stdx-b">'+
    (s?'<div class="stdx-meta"><span class="sksev '+st[1]+'">'+esc(st[0])+'</span><span>'+esc(s.org)+'</span><span>السريان: '+esc(s.effective)+'</span>'+(s.ifrs?'<button type="button" class="std-b" data-stdx-go="'+esc(s.ifrs)+'">≈ '+esc(s.ifrs)+'</button>':'')+'</div>':'')+
    (a?'<section class="stdx-rel"><h4>علاقته بالحساب '+esc(a.code)+' — '+esc(a.name)+'</h4><p>'+esc(rel)+'</p>'+
      (ctx.note?'<p class="stdx-ai"><b>ملاحظة المراجع الذكي:</b> '+esc(ctx.note)+'</p>':'')+
      '<p class="hint">البند في القوائم: '+esc(a.lineAr||"—")+(why?' · اقتُرح المعيار من '+esc(why):'')+(a.assertions&&a.assertions.length?' · الإقرارات: '+esc(a.assertions.join("، ")):'')+'</p></section>':'')+
    (ctx.findings&&ctx.findings.length?'<section class="stdx-f"><h4>ملاحظات على هذا الحساب</h4>'+ctx.findings.map(f=>'<div class="stdx-fi"><span class="sev '+esc(f.severity==="high"?"bad":f.severity==="medium"?"warn":"info")+'"></span><div><b>'+esc(f.title)+'</b><small>'+esc(f.basis||"")+'</small></div></div>').join("")+'</section>':'')+
    (s?'<p class="stdx-purpose">'+esc(s.purpose)+'</p>'+ul("المتطلبات الرئيسية",s.requirements)+ul("الإفصاحات",s.disclosures)+ul("إجراءات المراجعة",s.audit||[])+ul("إجراءات مقترحة لهذا البند",(ctx.procedures||[]).filter(p=>!(s.audit||[]).some(x=>x.slice(0,10)===p.slice(0,10))))+
      (s.sme?'<h4>في معيار المنشآت الصغيرة ومتوسطة الحجم</h4><p>'+esc(s.sme)+(ctx.framework==="SME"?' — الإطار المطبق على هذه المنشأة.':'')+'</p>':'')+
      '<h4>آخر المستجدات</h4><p>'+esc(s.latest)+'</p>'+
      (pending.length?'<p class="stdx-ai">'+pending.length+' تحديث من المصادر الرسمية بانتظار اعتمادك في شاشة المدونة المحاسبية.</p>':'')+
      '<a class="btn sm primary" href="'+esc(s.url)+'" target="_blank" rel="noopener">المصدر الرسمي ('+esc(s.org)+')</a>':'')+
    '</div></aside>';
  sheet.addEventListener("click",e=>{if(e.target===sheet||e.target.closest("[data-stdx-close]")){close();return}const g=e.target.closest("[data-stdx-go]");if(g&&get(g.dataset.stdxGo))open(g.dataset.stdxGo,ctx)});
  document.addEventListener("keydown",onKey,true);
  document.body.appendChild(sheet);sheet.querySelector("[data-stdx-close]").focus();
}

/* ---------- the library screen ---------- */
function cardOf(s){
  const st=STATUS[s.status]||["",""];
  return '<button type="button" class="cdx-c" data-std="'+esc(s.code)+'"><span class="std-b '+famCls(s.family)+'">'+esc(s.code)+'</span><span class="tx"><b>'+esc(s.titleAr)+'</b><small>'+esc(s.purpose)+'</small></span><span class="sksev '+st[1]+'">'+esc(st[0])+'</span></button>';
}
function updatesCard(){
  const u=upd(),pend=u.items.filter(i=>i.status==="pending"),ready=window.SKosifAI&&SKosifAI.ready();
  const srcs=U().OFFICIAL_SOURCES.map(s=>'<a class="cdx-src" href="'+esc(s.url)+'" target="_blank" rel="noopener"><b>'+esc(s.org)+'</b><small>'+esc(s.covers)+'</small></a>').join("");
  const item=i=>'<div class="cdx-u"><span class="std-b">'+esc(i.code)+'</span><div class="tx"><b>'+esc(i.change)+'</b><small>'+(i.effective?'السريان: '+esc(i.effective)+' · ':'')+(i.official?'مصدر رسمي مذكور':'مصدر من نتائج البحث الرسمية')+' · '+i.sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.title||"المصدر")+'</a>').join(" · ")+'</small></div>'+
    (i.status==="pending"?'<div class="sk-actions"><button type="button" class="btn sm primary" data-cx="approve" data-id="'+esc(i.code+"|"+i.change)+'">اعتماد</button><button type="button" class="btn sm" data-cx="dismiss" data-id="'+esc(i.code+"|"+i.change)+'">تجاهل</button></div>':'<span class="sksev '+(i.status==="approved"?"ok":"info")+'">'+(i.status==="approved"?"معتمد":"متجاهل")+'</span>')+'</div>';
  return '<section class="card"><div class="card-h"><div><h3>تحديث المعايير من المصادر الرسمية</h3><p>'+(u.checkedAt?'آخر فحص '+esc(u.checkedAt.slice(0,10))+' · ':'لم يُفحص بعد · ')+'السجل أُعد في '+esc(X().REGISTRY_DATE)+'. لا يُطبق أي تحديث قبل اعتمادك.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary sm" data-cx="check"'+(ready&&!busy?'':' disabled')+'>'+(busy?'جارٍ الفحص…':'فحص التحديثات عبر Gemini')+'</button></div></div><div class="card-b">'+
    (ready?'':'<p class="hint">يتطلب مفتاح Gemini — اضبطه في شاشة «مراجعة ميزان المراجعة».</p>')+
    '<div class="cdx-srcs">'+srcs+'</div>'+
    (u.items.length?'<h4 class="cdx-h">'+pend.length+' بانتظار الاعتماد من '+u.items.length+'</h4>'+u.items.slice().sort((a,b)=>(a.status!=="pending")-(b.status!=="pending")).map(item).join(""):'')+
  '</div></section>';
}
function paint(){
  if(!root)return;
  const all=list(),hits=X().searchCodex(q,all).filter(s=>fam==="all"||s.family===fam);
  const counts=Object.keys(FAM).map(k=>[k,all.filter(s=>s.family===k).length]);
  const up=all.filter(s=>s.status==="upcoming");
  root.innerHTML='<div class="skk4 cdx-k6">'+
      ['IFRS','IAS','ISA','SAUDI','EAS','EGYPT'].map((k,i)=>'<button type="button" class="skk4-t" data-fam="'+k+'"><span class="chip">'+SK.icon(["reports","ledger","check","governance","codex","zatca"][i])+'</span><span class="tx"><span>'+FAM[k]+'</span><b>'+counts.find(c=>c[0]===k)[1]+'</b><small>'+({ISA:"IAASB",SAUDI:"SOCPA · ZATCA · التجارة",EAS:"الهيئة العامة للرقابة المالية",EGYPT:"مصلحة الضرائب · قانون الشركات"}[k]||"IFRS Foundation")+'</small></span></button>').join("")+'</div>'+
    (up.length?'<section class="card cdx-up"><div class="card-b"><b>سريان قادم:</b> '+up.map(s=>'<button type="button" class="std-b '+famCls(s.family)+'" data-std="'+esc(s.code)+'">'+esc(s.code)+'</button> '+esc(s.effective)).join(" · ")+'</div></section>':'')+
    updatesCard()+
    '<section class="card"><div class="card-h"><div><h3>المدونة المحاسبية</h3><p>'+hits.length+' من '+all.length+' معياراً ومتطلباً — اضغط أي بطاقة لتفاصيلها ومصدرها الرسمي.</p></div></div><div class="card-b">'+
      '<div class="cdx-bar"><input type="search" data-cx-q placeholder="ابحث برقم المعيار أو موضوعه: IFRS 16، المخزون، الزكاة…" value="'+esc(q)+'"><div class="sk-seg">'+[["all","الكل"],...Object.entries(FAM)].map(([k,l])=>'<button type="button" data-fam="'+k+'" aria-pressed="'+(fam===k)+'">'+esc(l)+'</button>').join("")+'</div></div>'+
      '<div class="cdx-grid">'+(hits.map(cardOf).join("")||'<p class="empty">لا نتائج.</p>')+'</div></div></section>';
}
async function check(){
  if(busy)return;busy=true;paint();
  try{
    const codes=X().STANDARDS.map(s=>s.code),today=new Date().toISOString();
    const api=await SKosifAI.generate(U().buildUpdateCheckBody(codes,today.slice(0,10)),{timeout:240000});
    const r=U().parseUpdateResponse(api,today),d=upd(),key=i=>i.code+"|"+i.change;
    const have=new Set(d.items.map(key));
    save(KEY,{checkedAt:today,items:[...d.items,...r.items.filter(i=>!have.has(key(i)))]});
    toast(r.items.length?"وُجد "+r.items.length+" تحديث مدعوم بمصدر رسمي":"لا تحديثات جديدة من المصادر الرسمية"+(r.dropped?" (استُبعد "+r.dropped+" بلا مصدر رسمي)":""),"ok");
  }catch(e){toast(e.message,"bad")}
  finally{busy=false;paint()}
}
function bind(node){
  node.addEventListener("click",e=>{
    const s=e.target.closest("[data-std]");if(s){open(s.dataset.std);return}
    const f=e.target.closest("[data-fam]");if(f){fam=fam===f.dataset.fam&&f.classList.contains("skk4-t")?"all":f.dataset.fam;paint();return}
    const b=e.target.closest("[data-cx]");if(!b)return;
    if(b.dataset.cx==="check"){check();return}
    const d=upd(),i=d.items.find(x=>x.code+"|"+x.change===b.dataset.id);if(!i)return;
    i.status=b.dataset.cx==="approve"?"approved":"dismissed";save(KEY,d);toast(i.status==="approved"?"اعتُمد التحديث في السجل":"تم التجاهل","ok");paint();
  });
  node.addEventListener("input",e=>{if(e.target.matches("[data-cx-q]")){q=e.target.value;const pos=e.target.selectionStart;paint();const i=root.querySelector("[data-cx-q]");i.focus();try{i.setSelectionRange(pos,pos)}catch{}}});
}
window.SKosifCodex=Object.freeze({open,close,get,list});
SK.view("codex",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
})();

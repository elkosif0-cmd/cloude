/* SQC — independent helper-tools gateway: reusable company studios (product, customer, supply, books, reports) plus the decision node.
   Capabilities are shared; company data stays scoped to the open company/workspace. Using a helper never creates audit evidence automatically. */
(()=>{
"use strict";
const {esc}=SK;
const core=()=>window.SKosifCore,CP=()=>window.SKosifCompanyPlatform;
let decisionVersion=0;
SK.bus?.on?.("company",()=>{decisionVersion++});
SK.bus?.on?.("nav",()=>{decisionVersion++});
/* opt-in companies (FOUNDATION §3.0‑10): «added» = enabled for the company; a company from before keeps the old meaning, «linked» */
const optIn=()=>!!(CP()&&CP().capMode&&CP().capMode()==="opt-in");
const isInstalled=id=>!!(CP()&&(optIn()?CP().capEnabled(id):CP().installed(id)));
function profileCard(){
  const cp=CP();if(!cp||!cp.capabilityProfile)return"";
  const p=cp.capabilityProfile(),co=SK.company&&SK.company.current?SK.company.current():{name:""};
  const tools=p.mode==="all"?'<b>كل الأدوات متاحة</b><span class="sksev info">شركة سابقة — تبقى كما كانت</span>':'<b>'+p.enabled.length+' من '+p.tools.length+' أداة مفعّلة</b><span class="sksev ok">أدوات العمل اليومي ونشاط الشركة، والبقية عند الحاجة</span>';
  const ai=p.ai?(p.aiConfigured?'<span class="sksev ok">مفعّل ومتصل</span>':'<span class="sksev warn">مفعّل — لم يُضبط مزود بعد</span>'):'<span class="sksev info">غير مفعّل لهذه الشركة</span>';
  return '<section class="card hd-profile"><div class="card-h"><div><span class="eyebrow">ملف قدرات الشركة</span><h3>'+esc(co.name||"الشركة المفتوحة")+'</h3><p>ما تستخدمه هذه الشركة من الأدوات والذكاء الاصطناعي (الدستور §3.0‑10). لكل شركة ملفها، ولا ينتقل شيء بين الشركات.</p></div></div>'+
    '<div class="card-b"><div class="hd-prof-row">'+tools+'</div><div class="hd-prof-row"><b>الذكاء الاصطناعي</b>'+ai+'<button type="button" class="btn sm'+(p.ai?'':' primary')+'" data-hd-ai="'+(p.ai?"off":"on")+'">'+(p.ai?"إيقاف لهذه الشركة":"تفعيل لهذه الشركة")+'</button>'+
    (p.ai&&!p.aiConfigured?'<button type="button" class="linkish" data-hd-ailink>ربط مزود الذكاء الاصطناعي</button>':'')+'</div></div></section>';
}
/* R13 (docs/rebuild/HARSH_REVIEW_20261008_ar.md #23): the map already opens each task's tools; the full list below it repeated
   the map tool by tool (1,300 px of «اربط بالشركة»). Linking tools to the company is configuration, so the list is folded. */
let allOpen=false;
/* one node per company studio, read from the registry, plus the decision node; the hubs of a studio are its tools */
const NOTE={product:"احسب التكلفة، سعّر المنتجات، وحلّل المردود",customer:"حلّل المبيعات والعملاء والتحصيل والطلبات",supply:"طابق المخزون والموردين والمشتريات والتتبع",books:"استخدم الدفاتر والتحليل والمقارنات والمخاطر والحساسية",reports:"استلم البيانات وأنشئ التقارير والطباعة والأرشيف"};
const LABEL={product:"التكلفة والتسعير",customer:"المبيعات والعملاء",supply:"المخزون والمشتريات",books:"الدفاتر والتحليل",reports:"التقارير والمستندات"};
/* One task-oriented map. Company context is optional metadata, never the identity of the Tools gateway. */
const SECTIONS=()=>[...SK.caps.companyGroups().map(g=>({id:g.id,label:LABEL[g.id]||g.label,sub:NOTE[g.id]||"",icon:g.icon,targets:SK.caps.hubsInGroup(g.id).filter(c=>SK.caps.inGatewayOf(c,"tools")).map(c=>c.id)})).filter(s=>s.targets.length),
  {id:"decision",label:"القرار والذكاء",sub:"استخدم Jev ومجلس القرار والحساسية والملاحظات",icon:"jev",targets:["jev","council","decision","sensitivity","risks"]}];
const firstAllowed=s=>(s.targets.map(id=>SK.caps.get(id)).find(c=>c&&SK.perm.can(c.id))||null);
/* six places around the company: a studio keeps its place whatever the role may open, and a studio the role may not
   open draws neither its node nor its line */
const POS=[[50,12],[84,32],[78,76],[22,76],[16,32],[50,88]];
function point(s,i){
  const c=firstAllowed(s);if(!c)return"";
  const pos=POS[i]||[50,50];
  return '<button type="button" class="hd-node" data-hd-section="'+esc(s.id)+'" data-hd-go="'+esc(c.id)+'" style="left:'+pos[0]+'%;top:'+pos[1]+'%"><span class="hd-ic">'+(SK.icons[s.icon]||SK.icons.action||"")+'</span><b>'+esc(s.label)+'</b><small>'+esc(s.sub)+'</small></button>';
}
function lines(sections){
  return '<svg class="hd-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="hd-arrow" markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs>'+
    sections.map((s,i)=>{const [x,y]=POS[i]||[50,50];return firstAllowed(s)?'<line data-hd-section="'+esc(s.id)+'" x1="50" y1="50" x2="'+x+'" y2="'+y+'" marker-end="url(#hd-arrow)"/>':""}).join("")+'</svg>';
}
function table(){
  return SECTIONS().map(s=>{
    const caps=s.targets.map(id=>SK.caps.get(id)).filter(c=>c&&SK.perm.can(c.id));
    if(!caps.length)return"";
    return '<section class="card hd-group"><div class="card-h"><div><h3>'+esc(s.label)+'</h3><p>'+esc(s.sub)+'</p></div></div><div class="card-b hd-buttons">'+caps.map(c=>{
      const on=isInstalled(c.id);
      return '<div class="hd-tool" data-hd-row="'+esc(c.id)+'"><button type="button" class="linkish" data-hd-go="'+esc(c.id)+'">'+(SK.icons[c.id]||SK.icons.action||"")+'<span><b>'+esc(c.label)+'</b><small>'+esc(c.sub||c.hubLabel||"")+'</small></span></button><button type="button" class="btn sm'+(on?' primary':'')+'" data-hd-toggle="'+esc(c.id)+'" aria-pressed="'+on+'" title="الربط بالشركة اختياري">'+(on?'مرتبطة بالشركة':'اربط بالشركة')+'</button></div>';
    }).join("")+'</div></section>';
  }).join("");
}
function contextBadge(){
  const c=SK.company&&SK.company.current?SK.company.current():null,name=c&&c.name?String(c.name):"";
  const independent=!c||!c.id||c.id==="space-tools"||/مساحة الأدوات/.test(name);
  return independent?'<span class="hd-context neutral">بدون شركة مرتبطة</span>':'<span class="hd-context">سياق بيانات اختياري: <b>'+esc(name)+'</b></span>';
}
function exceptionQueue(){
  const cp=CP();if(!cp||!cp.aiExceptions)return"";
  const open=cp.aiExceptions("open"),history=cp.aiExceptions().filter(x=>x.status!=="open"),sev=x=>x==="high"?"bad":x==="warning"?"warn":"info";
  const rows=open.slice(-12).reverse();
  return '<section class="card hd-group"><div class="card-h"><div><span class="eyebrow">قائمة الاستثناءات</span><h3>تنبيهات واقتراحات تحتاج قرارك</h3><p>لا يُنفذ أي اقتراح من هذه القائمة تلقائيًا. القبول يعني «مقبول للمتابعة» فقط.</p></div><span class="sk-pill '+(open.length?"warn":"good")+'">'+open.length+' مفتوح</span></div><div class="card-b">'+
    (rows.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التنبيه</th><th>المصدر</th><th>الثقة</th><th>الإجراء المقترح</th><th></th></tr></thead><tbody>'+
      rows.map(x=>'<tr><td><span class="sksev '+sev(x.severity)+'">'+esc(x.severity)+'</span><b>'+esc(x.title)+'</b><small>'+esc((x.detail||"").slice(0,220))+'</small></td><td>'+esc(x.source||"AI")+(x.model?'<small>'+esc(x.model)+'</small>':'')+'</td><td class="n">'+(x.confidence==null?'—':Math.round(x.confidence*100)+'%')+'</td><td>'+esc(x.proposedAction||"راجع الاقتراح يدويًا")+'</td><td><button type="button" class="linkish" data-hd-exc="'+esc(x.id)+'" data-hd-status="accepted">مقبول للمتابعة</button> · <button type="button" class="linkish" data-hd-exc="'+esc(x.id)+'" data-hd-status="rejected">رفض</button> · <button type="button" class="linkish" data-hd-exc="'+esc(x.id)+'" data-hd-status="dismissed">إغلاق</button></td></tr>').join("")+
      '</tbody></table></div>':'<div class="sk-note good">لا توجد تنبيهات AI مفتوحة لهذه الشركة.</div>')+
    (history.length?'<p class="hint">'+history.length+' قرارًا سابقًا محفوظًا في سجل الشركة.</p>':'')+'</div></section>';
}
function render(root){
  const S=SECTIONS();
  root.innerHTML='<div class="hd-shell"><section class="card hd-hero"><div><span class="eyebrow">أدوات مستقلة</span><h2>مساحة الأدوات المساعدة</h2><p>ابدأ بالأداة التي تحتاجها أولاً. تعمل الأدوات كبوابة مستقلة، ويمكن ربط مساحة العمل بشركة فقط عندما تحتاج بياناتها. هذا الربط لا يحوّل الأداة إلى جزء من المحاسبة ولا يجعل نتائجها دليل مراجعة تلقائيًا.</p><div class="hd-context-row">'+contextBadge()+'</div></div><span class="hd-badge">الأداة أولاً · الشركة اختيارية</span></section>'+
  profileCard()+'<section class="card hd-map"><div class="hd-map-head"><div><h3>ماذا تريد أن تنجز؟</h3><p>اختر نوع المهمة؛ كل فرع يفتح الأدوات المناسبة مباشرة مع الحفاظ على نفس الروابط والصلاحيات.</p></div></div><div class="hd-canvas">'+lines(S)+'<div class="hd-center"><span>'+(SK.icons.helperdesk||SK.icons.productflow||"")+'</span><b>مساحة الأدوات</b><small>سياق الشركة اختياري</small></div>'+S.map(point).join("")+'</div></section>'+
  exceptionQueue()+'<details class="card hd-all"'+(allOpen?' open':'')+'><summary>كل الأدوات وربطها بالشركة <small>'+S.reduce((n,x)=>n+x.targets.length,0)+'</small></summary><div class="hd-grid">'+table()+'</div></details></div>';
  const all=root.querySelector&&root.querySelector(".hd-all");if(all)all.ontoggle=()=>{allOpen=all.open};
  if(root.dataset.hdBound==="1")return;
  root.dataset.hdBound="1";
  root.addEventListener("click",async e=>{
    const ex=e.target.closest("[data-hd-exc]");
    if(ex&&CP()){
      const status=ex.dataset.hdStatus,id=ex.dataset.hdExc,row=CP().aiExceptions().find(x=>x.id===id);if(!row)return;
      const version=++decisionVersion,companyId=SK.company?.current?.().id,original=JSON.stringify(row);
      let note="";if(status!=="dismissed"){const v=await SK.form(status==="accepted"?"قبول الاقتراح للمتابعة":"رفض الاقتراح",[{key:"note",label:"ملاحظة القرار",type:"textarea",placeholder:"اختياري — سبب القرار أو الإجراء التالي"}],{ok:status==="accepted"?"حفظ كمتابعة":"رفض",message:"هذا القرار لا ينفذ قيدًا أو تعديلًا تلقائيًا."});if(!v)return;note=v.note||""}
      if(!companyId||version!==decisionVersion||companyId!==SK.company?.current?.().id||window.SKosifSpace?.busy?.()||original!==JSON.stringify(CP().aiExceptions().find(x=>x.id===id)))return;
      try{if(!CP().resolveAIException(id,status,note))return;SK.toast(status==="accepted"?"حُفظ كمقبول للمتابعة فقط":status==="rejected"?"تم رفض الاقتراح":"تم إغلاق التنبيه","ok");render(root)}catch(err){SK.toast(err.message,"bad")}return
    }
    if(e.target.closest("[data-hd-ailink]")){core()&&core().go("settings");return}
    const aiB=e.target.closest("[data-hd-ai]");
    if(aiB&&CP()){try{CP().setAI(aiB.dataset.hdAi==="on");SK.toast(aiB.dataset.hdAi==="on"?"فُعّل الذكاء الاصطناعي لهذه الشركة":"أُوقف الذكاء الاصطناعي لهذه الشركة","ok");render(root)}catch(err){SK.toast(err.message,"bad")}return}
    const toggle=e.target.closest("[data-hd-toggle]");
    if(toggle&&CP()){const id=toggle.dataset.hdToggle,on=!isInstalled(id);try{CP().setTool(id,on);SK.toast(on?"أضيفت الأداة إلى الشركة":"أزيلت الأداة من الشركة","ok");render(root)}catch(err){SK.toast(err.message,"bad")}return}
    const b=e.target.closest("[data-hd-go]");
    if(b){
      const id=b.dataset.hdGo;
      if(CP()&&!isInstalled(id)){
        if(optIn()){const ok=await SK.confirm("هذه الأداة غير مفعّلة لهذه الشركة. فعّلها لها وافتحها؟",{title:"ملف قدرات الشركة",ok:"تفعيل وفتح",cancel:"إلغاء"});
          if(!ok)return;try{CP().setTool(id,true)}catch(err){SK.toast(err.message,"bad");return}}
        else{const add=await SK.confirm("يمكنك استخدام الأداة الآن بدون تغيير إعدادات الشركة. هل تريد إضافتها أيضًا إلى أدوات هذه الشركة؟",{title:"أداة مستقلة",ok:"إضافة وفتح",cancel:"فتح فقط"});
        if(add)try{CP().setTool(id,true)}catch{}}
      }
      core()&&core().go(id);
    }
  });
}
SK.view("helperdesk",{render});
})();
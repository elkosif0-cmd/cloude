/* SQC — independent helper-tools gateway: reusable company studios (product, customer, supply, books, reports) plus the decision node.
   Capabilities are shared; company data stays scoped to the open company/workspace. Using a helper never creates audit evidence automatically. */
(()=>{
"use strict";
const {esc}=SK;
const core=()=>window.SKosifCore,CP=()=>window.SKosifCompanyPlatform;
let decisionVersion=0;
SK.bus?.on?.("company",()=>{decisionVersion++});
SK.bus?.on?.("nav",()=>{decisionVersion++});
const isInstalled=id=>!!(CP()&&CP().installed(id));
/* one node per company studio, read from the registry, plus the decision node; the hubs of a studio are its tools */
const NOTE={product:"التكلفة، التسعير، البوكسات والتشريح",customer:"الطلبات، العملاء، التحصيل وتحليل الطلب",supply:"المخزون، التتبع، الموردون والشراء",books:"النقد، الذمم، الدفاتر، الحساسية والمخاطر",reports:"التقارير التنفيذية والطباعة والأرشيف"};
const SECTIONS=()=>[...SK.caps.companyGroups().map(g=>({id:g.id,label:g.label,sub:NOTE[g.id]||"",icon:g.icon,targets:SK.caps.hubsInGroup(g.id).filter(c=>c.gateway==="tools").map(c=>c.id)})).filter(s=>s.targets.length),
  {id:"decision",label:"القرار والذكاء",sub:"Jev، مجلس القرار، الحساسية والملاحظات",icon:"jev",targets:["jev","council","decision","sensitivity","risks"]}];
const firstAllowed=s=>(s.targets.map(id=>SK.caps.get(id)).find(c=>c&&SK.perm.can(c.id))||null);
const POSITIONS=[[50,12],[84,32],[78,76],[22,76],[16,32],[50,88]];
function visibleSections(){return SECTIONS().map((s,i)=>({...s,cap:firstAllowed(s),position:POSITIONS[i]||[50,50]})).filter(s=>s.cap);}
function point(s){
  const c=s.cap,pos=s.position;
  return '<button type="button" class="hd-node" data-hd-section="'+esc(s.id)+'" data-hd-go="'+esc(c.id)+'" style="left:'+pos[0]+'%;top:'+pos[1]+'%"><span class="hd-ic">'+(SK.icons[s.icon]||SK.icons.action||"")+'</span><b>'+esc(s.label)+'</b><small>'+esc(s.sub)+'</small></button>';
}
function lines(sections){
  return '<svg class="hd-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="hd-arrow" markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs>'+
    sections.map(s=>'<line data-hd-section="'+esc(s.id)+'" x1="50" y1="50" x2="'+s.position[0]+'" y2="'+s.position[1]+'" marker-end="url(#hd-arrow)"/>').join("")+'</svg>';
}
function table(){
  return SECTIONS().map(s=>{
    const caps=s.targets.map(id=>SK.caps.get(id)).filter(c=>c&&SK.perm.can(c.id));
    if(!caps.length)return"";
    return '<section class="card hd-group"><div class="card-h"><div><h3>'+esc(s.label)+'</h3><p>'+esc(s.sub)+'</p></div></div><div class="card-b hd-buttons">'+caps.map(c=>{
      const on=isInstalled(c.id);
      return '<div class="hd-tool" data-hd-row="'+esc(c.id)+'"><button type="button" class="linkish" data-hd-go="'+esc(c.id)+'">'+(SK.icons[c.id]||SK.icons.action||"")+'<span><b>'+esc(c.label)+'</b><small>'+esc(c.sub||c.hubLabel||"")+'</small></span></button><button type="button" class="btn sm'+(on?' primary':'')+'" data-hd-toggle="'+esc(c.id)+'" aria-pressed="'+on+'">'+(on?'مضافة للشركة':'أضف للشركة')+'</button></div>';
    }).join("")+'</div></section>';
  }).join("");
}
function exceptionQueue(){
  const cp=CP();if(!cp||!cp.aiExceptions)return"";
  const open=cp.aiExceptions("open"),history=cp.aiExceptions().filter(x=>x.status!=="open"),sev=x=>x==="high"?"bad":x==="warning"?"warn":"info";
  const rows=open.slice(-12).reverse();
  return '<section class="card hd-group"><div class="card-h"><div><span class="eyebrow">AI EXCEPTION QUEUE</span><h3>تنبيهات واقتراحات تحتاج قرارك</h3><p>لا يُنفذ أي اقتراح من هذه القائمة تلقائيًا. القبول يعني «مقبول للمتابعة» فقط.</p></div><span class="sk-pill '+(open.length?"warn":"good")+'">'+open.length+' مفتوح</span></div><div class="card-b">'+
    (rows.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التنبيه</th><th>المصدر</th><th>الثقة</th><th>الإجراء المقترح</th><th></th></tr></thead><tbody>'+
      rows.map(x=>'<tr><td><span class="sksev '+sev(x.severity)+'">'+esc(x.severity)+'</span><b>'+esc(x.title)+'</b><small>'+esc((x.detail||"").slice(0,220))+'</small></td><td>'+esc(x.source||"AI")+(x.model?'<small>'+esc(x.model)+'</small>':'')+'</td><td class="n">'+(x.confidence==null?'—':Math.round(x.confidence*100)+'%')+'</td><td>'+esc(x.proposedAction||"راجع الاقتراح يدويًا")+'</td><td><button type="button" class="linkish" data-hd-exc="'+esc(x.id)+'" data-hd-status="accepted">مقبول للمتابعة</button> · <button type="button" class="linkish" data-hd-exc="'+esc(x.id)+'" data-hd-status="rejected">رفض</button> · <button type="button" class="linkish" data-hd-exc="'+esc(x.id)+'" data-hd-status="dismissed">إغلاق</button></td></tr>').join("")+
      '</tbody></table></div>':'<div class="sk-note good">لا توجد تنبيهات AI مفتوحة لهذه الشركة.</div>')+
    (history.length?'<p class="hint">'+history.length+' قرارًا سابقًا محفوظًا في سجل الشركة.</p>':'')+'</div></section>';
}
function render(root){
  const sections=visibleSections();
  root.innerHTML='<div class="hd-shell"><section class="card hd-hero"><div><span class="eyebrow">INDEPENDENT TOOLS</span><h2>الأدوات المساعدة المستقلة</h2><p>قدرات مشتركة يمكن استخدامها أو إضافتها للشركة المفتوحة: التكلفة، المبيعات والعملاء، المخزون والموردون، التحليلات والتقارير والقرار. بيانات كل شركة تبقى في مساحتها، والعمل هنا لا يتحول إلى مستند أو دليل في ملف المراجعة إلا إذا أرفقه المراجع صراحة.</p></div><span class="hd-badge">مستقلة عن ملف المراجعة</span></section>'+
  '<section class="card hd-map"><div class="hd-map-head"><div><h3>قدرات الشركة</h3><p>اختر مجموعة الأدوات؛ كل فرع يقود إلى القدرات المستقلة التابعة له.</p></div></div><div class="hd-canvas">'+lines(sections)+'<div class="hd-center"><span>'+(SK.icons.helperdesk||SK.icons.productflow||"")+'</span><b>الشركة</b><small>أدوات مستقلة</small></div>'+sections.map(point).join("")+'</div></section>'+
  exceptionQueue()+'<div class="hd-grid">'+table()+'</div></div>';
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
    const toggle=e.target.closest("[data-hd-toggle]");
    if(toggle&&CP()){const id=toggle.dataset.hdToggle,on=!isInstalled(id);try{CP().setTool(id,on);SK.toast(on?"أضيفت الأداة إلى الشركة":"أزيلت الأداة من الشركة","ok");render(root)}catch(err){SK.toast(err.message,"bad")}return}
    const b=e.target.closest("[data-hd-go]");
    if(b){
      const id=b.dataset.hdGo;
      if(CP()&&!isInstalled(id)){
        const add=await SK.confirm("يمكنك استخدام الأداة الآن بدون تغيير إعدادات الشركة. هل تريد إضافتها أيضًا إلى أدوات هذه الشركة؟",{title:"أداة مستقلة",ok:"إضافة وفتح",cancel:"فتح فقط"});
        if(add)try{CP().setTool(id,true)}catch{}
      }
      core()&&core().go(id);
    }
  });
}
SK.view("helperdesk",{render});
})();
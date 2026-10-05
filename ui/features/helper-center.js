/* SQC — independent helper-tools gateway: studios with tool-gateway hubs, plus existing decision shortcuts.
   Helper snapshots scope selected stores to a company; audit files, tasks/risks, Jev and AI keys use separate/shared stores.
   Opening this map navigates only; it does not copy documents into an audit engagement. */
(()=>{
"use strict";
const {esc}=SK;
const core=()=>window.SKosifCore;
/* one node per company studio, read from the registry, plus the decision node; the hubs of a studio are its tools */
const NOTE={product:"التكلفة، التسعير، البوكسات والتشريح",customer:"الطلبات، العملاء، التحصيل وتحليل الطلب",supply:"المخزون، التتبع، الموردون والشراء",books:"النقد، الذمم، الدفاتر، الحساسية والمخاطر",reports:"التقارير التنفيذية والطباعة والأرشيف"};
const SECTIONS=()=>[...SK.caps.companyGroups().map(g=>({id:g.id,label:g.label,sub:NOTE[g.id]||"",icon:g.icon,targets:SK.caps.hubsInGroup(g.id).filter(c=>c.gateway==="tools").map(c=>c.id)})).filter(s=>s.targets.length),
  {id:"decision",label:"القرار والذكاء",sub:"Jev، مجلس القرار، الحساسية والملاحظات",icon:"jev",targets:["jev","council","decision","sensitivity","risks"]}];
const POSITIONS=[[50,12],[84,32],[78,76],[22,76],[16,32],[50,88]];
const firstAllowed=s=>(s.targets.map(id=>SK.caps.get(id)).find(c=>c&&SK.perm.can(c.id))||null);
const position=s=>POSITIONS[s.index]||[50,50];
function point(s){
  const c=firstAllowed(s);if(!c)return"";
  const pos=position(s);
  return '<button type="button" class="hd-node" data-hd-section="'+esc(s.id)+'" data-hd-go="'+esc(c.id)+'" style="left:'+pos[0]+'%;top:'+pos[1]+'%"><span class="hd-ic">'+(SK.icons[s.icon]||SK.icons.action||"")+'</span><b>'+esc(s.label)+'</b><small>'+esc(s.sub)+'</small></button>';
}
function lines(sections){
  return '<svg class="hd-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="hd-arrow" markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs>'+
    sections.map(s=>{const [x,y]=position(s);return '<line data-hd-section="'+esc(s.id)+'" x1="50" y1="50" x2="'+x+'" y2="'+y+'" marker-end="url(#hd-arrow)"/>'}).join("")+'</svg>';
}
function table(sections){
  return sections.map(s=>{
    const caps=s.targets.map(id=>SK.caps.get(id)).filter(c=>c&&SK.perm.can(c.id));
    if(!caps.length)return"";
    return '<section class="card hd-group"><div class="card-h"><div><h3>'+esc(s.label)+'</h3><p>'+esc(s.sub)+'</p></div></div><div class="card-b hd-buttons">'+caps.map(c=>'<button type="button" class="hd-tool" data-hd-go="'+esc(c.id)+'">'+(SK.icons[c.id]||SK.icons.action||"")+'<span><b>'+esc(c.label)+'</b><small>'+esc(c.sub||c.hubLabel||"")+'</small></span></button>').join("")+'</div></section>';
  }).join("");
}
function render(root){
  // Retain each section's existing position even when an earlier section is denied.
  const sections=SECTIONS().map((s,index)=>({...s,index})).filter(firstAllowed);
  root.innerHTML='<div class="hd-shell"><section class="card hd-hero"><div><span class="eyebrow">INDEPENDENT TOOLS</span><h2>الأدوات المساعدة المستقلة</h2><p>أدوات للتكلفة والمبيعات والعملاء ودعم القرار في الشركة المفتوحة. بعض البيانات، مثل المهام والمخاطر، مشتركة بين مساحات العمل؛ تحقّق من الشركة وملف المراجعة المختارين قبل استخدام النتائج.</p></div><span class="hd-badge">مستقلة عن ملف المراجعة</span></section>'+
  '<section class="card hd-map"><div class="hd-map-head"><div><h3>قدرات الشركة</h3><p>اختر مجموعة الأدوات؛ كل فرع يقود إلى القدرات المستقلة التابعة له.</p></div></div><div class="hd-canvas">'+lines(sections)+'<div class="hd-center"><span>'+(SK.icons.helperdesk||SK.icons.productflow||"")+'</span><b>الشركة</b><small>أدوات مستقلة</small></div>'+sections.map(point).join("")+'</div></section>'+
  '<div class="hd-grid">'+table(sections)+'</div></div>';
  if(root.dataset.hdBound==="1")return;
  root.dataset.hdBound="1";
  root.addEventListener("click",e=>{const b=e.target.closest("[data-hd-go]");if(b)core()&&core().go(b.dataset.hdGo)});
}
SK.view("helperdesk",{render});
})();

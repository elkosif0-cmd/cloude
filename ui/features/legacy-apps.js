/* SQC — the original systems (الأنظمة الأصلية): the four stand-alone apps the helper tools grew from, restored
   as they were and opened inside the app — CRM V8.2 (daily customer follow-up), V31 (sales and cost
   diagnostics), V33 (smart operations and quality), V40 (the integrated gold platform). Their embedded data is
   demo data (names, 05000000NN phones, sales figures); what they save stays on this device and moves with the
   company open in the helper tools. The sales-analytics app is not here: «تحليل المبيعات» and «خريطة العملاء»
   replaced it. */
(()=>{
"use strict";
const {esc,load,save}=SK;
const KEY="skosif_legacy_v1";
const APPS=[
  {id:"crm",file:"crm.html",name:"متابعة العملاء V8.2",sub:"التسجيل اليومي للاتصالات وقائمة الاتصال وأولوية التواصل وتقرير الإنجاز اليومي، مع التصدير إلى Excel",icon:"followup"},
  {id:"v31",file:"v31.html",name:"منصة المبيعات والتكاليف V31",sub:"النسخة المدققة: تحليل المبيعات والتكاليف لكل صنف وقناة، قواعد التكلفة والتسويات، والتقارير والتصدير",icon:"economics"},
  {id:"v33",file:"v33.html",name:"العمليات الذكية V33",sub:"المبيعات والتكاليف مع التشغيل الذكي: فحوص الجودة، التنبيهات، ولوحات الأداء",icon:"health"},
  {id:"v40",file:"v40.html",name:"منصة الذهب المتكاملة V40",sub:"الإصدار المتكامل: شجرة الأصناف، الحركات، درجة الجودة، ومقاييس الذهب",icon:"intelligence"}
];
let root=null;
function paint(){
  const cur=APPS.find(a=>a.id===(load(KEY,{})||{}).app)||APPS[0];
  root.innerHTML='<div class="lg"><div class="lg-cards" role="tablist" aria-label="الأنظمة الأصلية">'+APPS.map(a=>'<button type="button" role="tab" class="lg-card" data-lg="'+a.id+'" aria-selected="'+(a.id===cur.id)+'">'+SK.icon(a.icon)+'<span><b>'+esc(a.name)+'</b><small>'+esc(a.sub)+'</small></span></button>').join("")+'</div>'+
    '<div class="lg-bar"><p>النسخة الأصلية كما كانت، ببيانات تجريبية. ما تحفظه فيها يبقى على هذا الجهاز مع الشركة المفتوحة.</p><a class="btn sm" href="./legacy/'+cur.file+'" target="_blank" rel="noopener">افتح في نافذة مستقلة</a></div>'+
    '<iframe class="lg-frame" title="'+esc(cur.name)+'" src="./legacy/'+cur.file+'" loading="lazy" referrerpolicy="no-referrer"></iframe></div>';
}
function render(el){
  root=el;
  if(!el.__lg){el.__lg=true;el.addEventListener("click",e=>{const b=e.target.closest("[data-lg]");if(!b)return;save(KEY,{app:b.dataset.lg});paint()})}
  paint();
}
window.SKosifLegacy=Object.freeze({apps:()=>APPS.map(a=>({id:a.id,name:a.name})),open:id=>{save(KEY,{app:id});window.SKosifCore&&SKosifCore.go("legacyapps")}});
SK.view("legacyapps",{render});
})();

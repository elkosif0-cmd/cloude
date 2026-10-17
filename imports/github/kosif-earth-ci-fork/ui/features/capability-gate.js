/* SQC — the company's Capability Profile on screen (FOUNDATION §3.0‑10; owner 2026-10-09: opt-in, existing companies keep all).
   SKosifCompanyPlatform decides what is enabled for the open company (capEnabled); this module only shows it:
   • the menus: a tool not enabled for the company stays in its place, dimmed, with «غير مفعّلة لهذه الشركة» — never hidden;
   • the screen: opening it shows one card «فعّلها لهذه الشركة» instead of the tool, so nothing runs on a company that did not
     choose it, and enabling it opens the tool at once.
   Companies in «all» mode (every company from before the ownership stamp, and the demo) see no change at all. */
(()=>{
"use strict";
const {esc}=SK;
const CP=()=>window.SKosifCompanyPlatform;
const core=()=>window.SKosifCore;
const off=id=>{try{const cp=CP();return !!(cp&&cp.capEnabled&&id&&!cp.capEnabled(id))}catch{return false}};
let busy=false;
function markMenus(){
  document.querySelectorAll('#rail [data-v],.skn-domain [data-v],#skb [data-v]').forEach(b=>{
    const id=b.dataset.v,o=off(id);
    if(o!==b.classList.contains("skcap-off")){b.classList.toggle("skcap-off",o);
      if(o){b.dataset.skcapTitle=b.title||"";b.title=(b.title?b.title+" — ":"")+"غير مفعّلة لهذه الشركة"}else{b.title=b.dataset.skcapTitle||"";delete b.dataset.skcapTitle}}
  });
}
function gateView(){
  const view=document.getElementById("view"),c=core(),id=c&&c.view?c.view():"";if(!view)return;
  const locked=off(id),gate=view.querySelector(":scope > .skcap-gate");
  view.classList.toggle("skcap-locked",locked);
  if(!locked){if(gate)gate.remove();return}
  if(gate&&gate.dataset.v===id)return;if(gate)gate.remove();
  const cap=SK.caps.get(id)||{label:id},co=SK.company&&SK.company.current?SK.company.current():{name:""};
  const g=document.createElement("section");g.className="card skcap-gate";g.dataset.v=id;g.setAttribute("role","region");g.setAttribute("aria-label","أداة غير مفعّلة");
  g.innerHTML='<div class="card-b"><span class="eyebrow">ملف قدرات الشركة</span><h3>«'+esc(cap.label)+'» غير مفعّلة لـ«'+esc(co.name||"هذه الشركة")+'»</h3>'+
    '<p>كل شركة تختار أدواتها (الدستور §3.0‑10): تبدأ الشركة الجديدة بأدوات العمل اليومي وأدوات نشاطها، وتُفعَّل البقية عند الحاجة. التفعيل لا ينقل بيانات من شركة أخرى ولا يغير الدفاتر.</p>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-skcap-on="'+esc(id)+'">فعّلها لهذه الشركة وافتحها</button><button type="button" class="btn" data-skcap-lib>مكتبة الأدوات</button></div></div>';
  view.prepend(g);
}
/* a timer, not requestAnimationFrame: a hidden or background page does not paint frames */
function paint(){if(busy)return;busy=true;setTimeout(()=>{busy=false;try{markMenus();gateView()}catch(e){SK.errors&&SK.errors.report(e,"capability-gate",{silent:true})}},40)}
document.addEventListener("click",e=>{
  const on=e.target.closest&&e.target.closest("[data-skcap-on]");
  if(on){try{CP().setTool(on.dataset.skcapOn,true);SK.toast("فُعّلت الأداة لهذه الشركة","ok");const c=core();if(c)c.go(on.dataset.skcapOn)}catch(err){SK.toast(err.message,"bad")}paint();return}
  if(e.target.closest&&e.target.closest("[data-skcap-lib]")){const c=core();if(c)c.go("helperdesk")}
});
SK.bus&&SK.bus.on&&["nav","render","company-platform","company","scope"].forEach(t=>SK.bus.on(t,paint));
function start(){try{new MutationObserver(paint).observe(document.body,{childList:true,subtree:true})}catch{}paint()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
window.SKosifCapabilityGate=Object.freeze({paint,off});
})();

/* S.kosif core — screen tabs (SK.screenTabs): split a long screen into tabs without touching the modules that render it.
   A screen registers its tabs and a rule that names the tab of each block (a card, by its heading). The blocks keep rendering
   exactly as their modules write them; the ones of the other tabs carry data-st-off and CSS hides them. A block no rule names
   stays on the first tab, so nothing can disappear; blocks that modules add later are tagged on the next change of #view.
   R8 (docs/rebuild/DEEP_REVIEW_20261007_ar.md). «مركز القيادة» keeps its own organizer from R7. */
(()=>{
"use strict";
const defs={};
const KEY=id=>"sqc_tabs_"+id;
const core=()=>window.SKosifCore;
const read=id=>{try{return sessionStorage.getItem(KEY(id))}catch{return null}};
const headingOf=el=>{const h=el.querySelector("h2,h3");return h?(h.childNodes[0]&&h.childNodes[0].textContent||h.textContent||"").trim():""};
function current(id){const d=defs[id],t=read(id);return d&&d.tabs.some(([k])=>k===t)?t:(d?d.tabs[0][0]:"")}
function apply(){
  const c=core(),v=document.getElementById("view");if(!c||!v)return;
  const id=c.view(),d=defs[id];
  if(!d){if(v.dataset.stab){delete v.dataset.stab;const b=v.querySelector(":scope > .sk-stabs");if(b)b.remove()}return}
  const tab=current(id),first=d.tabs[0][0];
  /* the outermost blocks only: a card inside a tagged card follows its parent */
  v.querySelectorAll(d.blocks).forEach(el=>{
    if(el.closest(".sk-stabs"))return;const outer=el.parentElement&&el.parentElement.closest(d.blocks);if(outer&&v.contains(outer))return;
    const k=d.tag(el,headingOf(el))||first;if(el.dataset.st!==k)el.dataset.st=k;
    const off=k!==tab;if(off!==el.hasAttribute("data-st-off"))el.toggleAttribute("data-st-off",off);
  });
  let bar=v.querySelector(":scope > .sk-stabs");
  if(!bar){bar=document.createElement("div");bar.className="sk-stabs";const after=v.querySelector(":scope > .skdemo")||v.querySelector(":scope > .skn-domain");after?after.after(bar):v.prepend(bar)}
  const html=SK.ui.tabs(d.tabs,tab,"screen-"+id);if(bar.innerHTML!==html)bar.innerHTML=html;
  if(v.dataset.stab!==tab)v.dataset.stab=tab;
}
let t=0;const later=()=>{clearTimeout(t);t=setTimeout(apply,30)};
document.addEventListener("click",e=>{const b=e.target.closest('.sk-stabs [data-tab]');if(!b||!core())return;
  try{sessionStorage.setItem(KEY(core().view()),b.dataset.tab)}catch{}apply();const v=document.getElementById("view");if(v&&v.getBoundingClientRect().top<0)v.scrollIntoView({block:"start"})});
function boot(){
  const v=document.getElementById("view");if(!v||!SK.bus){setTimeout(boot,300);return}
  SK.bus.on("nav",later);SK.bus.on("render",later);
  if("MutationObserver" in window)new MutationObserver(()=>{if(core()&&defs[core().view()])later()}).observe(v,{childList:true,subtree:true});
}
/* register(viewId, {tabs:[[key,label],…], blocks:css selector, tag(el, heading) → key}) */
function register(id,def){defs[id]=Object.freeze({blocks:".card",...def});later()}
SK.screenTabs=Object.freeze({register,current,refresh:apply});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

/* «الإعدادات والمظهر»: the company and its reports first, then calculation and targets, the appearance, and permissions and data
   (the appearance studio alone was 1,700 px at the top, before every other card) */
register("settings",{
  tabs:[["company","الشركة والتقارير"],["calc","الاحتساب والأهداف"],["look","المظهر"],["data","الصلاحيات والبيانات"]],
  tag:(el,h)=>/المظهر|الألوان|الخط/.test(h)?"look":/طريقة الاحتساب|الأهداف|التصنيف/.test(h)?"calc":/الدور|الصلاحيات|نسخة كاملة|البيانات والنسخ|Capabilities|الأجهزة/.test(h)?"data":"company"
});

/* «الأجهزة والمزامنة»: the bottom-bar picker alone was 850 px of 65 checkboxes between the device and the laptop cards */
register("devices",{
  tabs:[["device","هذا الجهاز والنقل"],["phone","شريط الجوال"],["laptop","اللابتوب ولوحة المفاتيح"]],
  blocks:".dv > .card",
  tag:(el,h)=>/شريط الجوال/.test(h)?"phone":/^اللابتوب|لوحة المفاتيح/.test(h)?"laptop":"device"
});
/* «ذكاء العملاء والطلب»: segments and retention, the price-review priority, the reactivation list */
register("intelligence",{
  tabs:[["segments","الشرائح والاحتفاظ"],["prices","مراجعة الأسعار"],["reactivate","إعادة التنشيط"]],
  blocks:".intel-view > .card, .intel-view > .grid2",
  tag:(el,h)=>/أولوية مراجعة الأسعار|الأسعار/.test(h)?"prices":/إعادة التنشيط/.test(h)?"reactivate":"segments"
});
})();

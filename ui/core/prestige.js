/* KOSIF EARTH — «Maison» prestige motion for the app shell (with ui/ds/prestige.css).
   Decoration over working UI — it never reads, stores or changes company data:
     • a gold hairline runs across the top whenever the screen changes (SKosifCore.view() or #view's blocks are replaced),
     • cards answer the pointer with a soft gold spotlight (fine pointers; CSS variables --pm-sx / --pm-sy, class .pm-lit),
     • the light/dark switch cross-fades through the View Transitions API where the browser has it.
   Reduced motion turns all of it off. */
(()=>{
"use strict";
if(typeof document==="undefined")return;
const mq=q=>{try{return !!(window.matchMedia&&matchMedia(q).matches)}catch{return false}};
const reduce=mq("(prefers-reduced-motion: reduce)");
if(reduce)return;
const fine=mq("(hover:hover) and (pointer:fine)");
const CARDS=".card,.skc-card,.stat,.v12-kpi,.bento .bk,.skc-kpi";

/* ---- route hairline ---- */
let bar=null,lastView="";
function route(){
  if(!bar){bar=document.createElement("div");bar.className="pm-route";bar.setAttribute("aria-hidden","true");document.body.appendChild(bar)}
  bar.classList.remove("go");void bar.offsetWidth;bar.classList.add("go");
}
function currentView(){const c=window.SKosifCore;try{return c&&c.view?String(c.view()||""):""}catch{return""}}
function watchView(){
  const v=document.getElementById("view");if(!v)return false;
  lastView=currentView();
  new MutationObserver(()=>{const now=currentView();if(now&&now!==lastView){lastView=now;route()}}).observe(v,{childList:true});
  addEventListener("hashchange",()=>{const now=currentView();if(now!==lastView){lastView=now;route()}});
  return true;
}

/* ---- pointer spotlight on cards ---- */
function spotlight(){
  if(!fine)return;
  let raf=0,ev=null,lit=null;
  document.addEventListener("pointermove",e=>{ev=e;if(raf)return;raf=requestAnimationFrame(()=>{
    raf=0;const t=ev&&ev.target;const card=t&&t.closest?t.closest(CARDS):null;
    if(lit&&lit!==card){lit.classList.remove("pm-lit");lit=null}
    if(!card)return;
    const r=card.getBoundingClientRect();
    card.style.setProperty("--pm-sx",Math.round(ev.clientX-r.left)+"px");
    card.style.setProperty("--pm-sy",Math.round(ev.clientY-r.top)+"px");
    if(!card.classList.contains("pm-lit"))card.classList.add("pm-lit");lit=card;
  })},{passive:true});
  document.addEventListener("pointerleave",()=>{if(lit){lit.classList.remove("pm-lit");lit=null}});
}

/* ---- the theme switch cross-fades ---- */
function themeFade(){
  if(typeof document.startViewTransition!=="function")return;
  let passing=false;
  document.addEventListener("click",e=>{
    if(passing)return;
    const b=e.target&&e.target.closest?e.target.closest("#sk-tb-theme"):null;if(!b)return;
    e.stopImmediatePropagation();e.preventDefault();
    try{document.startViewTransition(()=>{passing=true;try{b.click()}finally{passing=false}})}
    catch{passing=true;try{b.click()}finally{passing=false}}
  },true);
}

function boot(){
  spotlight();themeFade();
  if(!watchView()){let n=0;const t=setInterval(()=>{if(watchView()||++n>40)clearInterval(t)},250)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();

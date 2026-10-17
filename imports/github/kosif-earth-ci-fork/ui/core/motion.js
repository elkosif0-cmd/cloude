/* SQC — the motion layer (SK.motion): one choreography for every screen, so the app feels alive and consistent.
   Opening a screen staggers its blocks in (opacity + a short rise, expo-out, 45 ms apart, first ten blocks); a screen
   that merely re-renders with new data does not replay it. Dialogs, toasts and menus get their enter motion from CSS
   (ui/ds/luxe.css, «motion» section). Everything here is decoration over working UI: it never delays data, never
   moves anything sideways (no horizontal scroll), and `prefers-reduced-motion` turns it all off. */
(()=>{
"use strict";
const reduce=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return false}};
const MAX=10,LIFE=900;
let last="",timer=0,count=0;
function view(){const c=window.SKosifCore;return c&&c.view?String(c.view()||""):""}
/* the screen's blocks: the direct children of #view, or of the module's mount node when the core only hosts it */
function blocks(){
  const v=document.getElementById("view");if(!v)return[];
  const kids=[...v.children].filter(n=>n.nodeType===1&&!n.classList.contains("skdemo")&&!n.classList.contains("sqc-space-bar"));
  if(kids.length===1&&kids[0].classList.contains("sk-view"))return[...kids[0].children].filter(n=>n.nodeType===1);
  return kids;
}
function enter(force){
  const id=view();if(!force&&id===last)return false;last=id;
  if(reduce())return false;
  const v=document.getElementById("view");if(!v)return false;
  const list=blocks().slice(0,MAX);if(!list.length)return false;
  list.forEach((n,i)=>n.style.setProperty("--sk-i",String(i)));
  v.classList.remove("sk-enter");void v.offsetWidth;v.classList.add("sk-enter");
  clearTimeout(timer);timer=setTimeout(()=>{v.classList.remove("sk-enter");list.forEach(n=>n.style.removeProperty("--sk-i"))},LIFE);
  count++;return true;
}
function boot(){
  if(!window.SK||!SK.bus){setTimeout(boot,200);return}
  SK.bus.on("nav",()=>setTimeout(()=>enter(false),0));
  SK.bus.on("render",()=>setTimeout(()=>enter(false),0));
  setTimeout(()=>enter(false),0);
}
boot();
window.SK&&(SK.motion=Object.freeze({enter:()=>enter(true),count:()=>count,reduced:reduce}));
})();

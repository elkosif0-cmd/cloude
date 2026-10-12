/* SQC — the motion layer (SK.motion): one choreography for every screen, so the app feels alive and consistent.
   Opening a screen staggers its blocks in (opacity + a short rise, expo-out, 45 ms apart, first ten blocks); a screen
   that merely re-renders with new data does not replay it. Dialogs, toasts and menus get their enter motion from CSS
   (ui/ds/luxe.css, «motion» section). Everything here is decoration over working UI: it never delays data, never
   moves anything sideways (no horizontal scroll), and `prefers-reduced-motion` turns it all off.
   v2 (KOSIF EARTH motion graphics): the blocks after the first ten rise as they scroll into view instead of appearing
   cold, and the plain figures of a screen (stat values, `.num` cells) count up to their value once when the screen
   opens — the final text is always the exact text the screen rendered. */
(()=>{
"use strict";
const reduce=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return false}};
const MAX=10,LIFE=900,COUNT_MS=720,COUNT_MAX=24;
/* a plain figure: Latin digits, optional thousands commas, decimals, a sign, and a percent or a short unit («ر.س») —
   anything else (words, mixed text, dates) is left alone */
const NUM=/^([-+]?)((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)(%|\s[^\d,]{1,8})?$/;
const SETTLE=3000;   /* a screen keeps painting its figures for a moment after it opens (async data); count those too */
let last="",timer=0,count=0,counted=0,opened=0;
function view(){const c=window.SKosifCore;return c&&c.view?String(c.view()||""):""}
/* the screen's blocks: the direct children of #view, or of the module's mount node when the core only hosts it */
function blocks(){
  const v=document.getElementById("view");if(!v)return[];
  const kids=[...v.children].filter(n=>n.nodeType===1&&!n.classList.contains("skdemo")&&!n.classList.contains("sqc-space-bar"));
  if(kids.length===1&&kids[0].classList.contains("sk-view"))return[...kids[0].children].filter(n=>n.nodeType===1);
  return kids;
}
/* blocks past the first ten rise when scrolled into view; a safety timer makes sure nothing ever stays hidden */
function reveal(list){
  if(!list.length||typeof IntersectionObserver!=="function")return;
  list.forEach(n=>n.classList.add("sk-reveal"));
  const done=n=>n.classList.remove("sk-reveal","sk-shown");
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;x.target.classList.add("sk-shown");io.unobserve(x.target);setTimeout(()=>done(x.target),LIFE)}),{rootMargin:"0px 0px -8% 0px"});
  list.forEach(n=>io.observe(n));
  setTimeout(()=>{io.disconnect();list.forEach(done)},8000);
}
/* the figures of the open screen count up once; the text they end on is exactly what the screen rendered */
function countUp(){
  if(reduce()||typeof requestAnimationFrame!=="function")return 0;
  const v=document.getElementById("view");if(!v||!v.querySelectorAll)return 0;
  /* the figure is the element's text, or its leading text node when a unit element follows (`36 <small>يوم</small>`) */
  const node=e=>e.children.length===0?e:(e.firstChild&&e.firstChild.nodeType===3?e.firstChild:null);
  const els=[...v.querySelectorAll(".stat .v .n,.stat .v,.num,.card .n")].filter(e=>!e.hasAttribute("data-sk-counted")&&node(e)&&NUM.test((node(e).textContent||"").trim())).slice(0,COUNT_MAX);
  for(const e of els){
    const t=node(e),raw=t.textContent.trim(),m=NUM.exec(raw),sign=m[1],body=m[2],unit=m[3]||"";
    const dec=(body.split(".")[1]||"").length,grouped=body.includes(","),target=parseFloat(body.replace(/,/g,""));
    if(!isFinite(target)||target===0)continue;
    e.setAttribute("data-sk-counted","1");e.classList.add("sk-counting");
    const fmt=n=>{let s=n.toFixed(dec);if(grouped)s=s.replace(/\B(?=(\d{3})+(?!\d))/g,",");return sign+s+unit};
    const t0=performance.now();let done=false;
    const end=()=>{if(done)return;done=true;t.textContent=raw;e.classList.remove("sk-counting")};
    const step=now=>{
      if(done)return;
      const p=Math.min(1,(now-t0)/COUNT_MS),k=1-Math.pow(1-p,3);
      if(p<1){t.textContent=fmt(target*k);requestAnimationFrame(step)}else end();
    };
    requestAnimationFrame(step);setTimeout(end,COUNT_MS+120);   /* a hidden tab gets no frames: the figure still lands */
    counted++;
  }
  return els.length;
}
function enter(force){
  const id=view();if(!force&&id===last)return false;last=id;
  if(reduce())return false;
  const v=document.getElementById("view");if(!v)return false;
  const all=blocks(),list=all.slice(0,MAX);if(!list.length)return false;
  list.forEach((n,i)=>n.style.setProperty("--sk-i",String(i)));
  v.classList.remove("sk-enter");void v.offsetWidth;v.classList.add("sk-enter");
  clearTimeout(timer);timer=setTimeout(()=>{v.classList.remove("sk-enter");list.forEach(n=>n.style.removeProperty("--sk-i"))},LIFE);
  reveal(all.slice(MAX));countUp();opened=Date.now();watch(v);
  count++;return true;
}
/* a re-render of the open screen: no choreography, but figures painted while it is still settling count up once */
function settle(){if(!enter(false)&&opened&&Date.now()-opened<SETTLE)countUp()}
/* screens paint their figures asynchronously (data, workers) without an event: watch the view while it settles */
let mo=null,debounce=0;
function watch(v){
  if(typeof MutationObserver!=="function")return;
  if(mo)mo.disconnect();
  mo=new MutationObserver(()=>{
    if(Date.now()-opened>=SETTLE){mo.disconnect();mo=null;return}
    clearTimeout(debounce);debounce=setTimeout(countUp,60);
  });
  mo.observe(v,{childList:true,subtree:true});
  setTimeout(()=>{if(mo){mo.disconnect();mo=null}},SETTLE+100);
}
function boot(){
  if(!window.SK||!SK.bus){setTimeout(boot,200);return}
  SK.bus.on("nav",()=>setTimeout(()=>enter(false),0));
  SK.bus.on("render",()=>setTimeout(settle,0));
  setTimeout(()=>enter(false),0);
}
boot();
window.SK&&(SK.motion=Object.freeze({enter:()=>enter(true),count:()=>count,counted:()=>counted,countUp,reduced:reduce}));
})();

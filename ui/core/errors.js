/* S.kosif core — central error handling (SK.errors).
   Every uncaught error or rejected promise is caught once, shown as a short message
   (never alert()), kept in a bounded local log for the health screen, and published on the bus. */
(()=>{
"use strict";
const KEY="skosif_error_log",MAX=60;
let lastMsg="",lastAt=0;
function list(){return SK.load(KEY,[])}
function clear(){SK.save(KEY,[])}
function text(e){return String(e&&(e.message||e.reason&&e.reason.message||e.reason)||e||"خطأ غير معروف").slice(0,300)}
function report(e,where,opts={}){
  const msg=text(e),now=Date.now();
  const entry={at:new Date(now).toISOString(),where:String(where||"app"),msg,stack:String(e&&e.stack||"").split("\n").slice(0,4).join("\n")};
  try{const l=list();l.unshift(entry);SK.save(KEY,l.slice(0,MAX))}catch{}
  console.error("S.kosif",where,e);
  if(!opts.silent&&(msg!==lastMsg||now-lastAt>4000)){lastMsg=msg;lastAt=now;SK.toast("تعذّر إكمال العملية — "+msg.slice(0,90),"err")}
  if(SK.bus)SK.bus.emit("error",entry);
  return entry;
}
/* wrap a function so a failure is reported instead of breaking the screen */
function guard(fn,where){return function(...a){try{const r=fn.apply(this,a);if(r&&typeof r.catch==="function")return r.catch(e=>{report(e,where)});return r}catch(e){report(e,where)}}}
addEventListener("error",e=>{
  if(e.target&&e.target!==window&&(e.target.src||e.target.href)){report(new Error("تعذر تحميل "+(e.target.src||e.target.href)),"asset",{silent:true});return}
  /* ignore cross-origin "Script error." noise; everything else is reported */
  if(e.message==="Script error.")return;
  report(e.error||e.message,"window");
},true);
addEventListener("unhandledrejection",e=>{report(e.reason,"promise")});
SK.errors=Object.freeze({report,guard,list,clear,KEY});
})();

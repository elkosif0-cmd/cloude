/* S.kosif core — the visible save state (SK.saveState). FOUNDATION §3.0 rule 8: every operational entry shows
   «جاري الحفظ / تم الحفظ / تعذر الحفظ». The app keeps its data on this device (localStorage + IndexedDB
   aghnam-app-v7) — there is no server copy yet, and the chip says so instead of implying one.
   Writes are observed, not changed: Storage#setItem/removeItem for the app's keys and every readwrite IndexedDB
   transaction; a failed write (quota, private mode, aborted transaction) turns the chip red and keeps the error. */
(()=>{
"use strict";
const SK=window.SK=window.SK||{};
const PREFIX=/^(aghnam|skosif|kosif|s_kosif|sales_customer_followup)/;
/* keys the app writes for itself on every paint — not the user's work */
const QUIET=/^(skosif_error_log|skosif_prefs|skosif_ui_|skosif_last_view|skosif_rail|aghnam-v12-theme|sqc_)/;
const st={state:"idle",at:0,pending:0,error:"",writes:0,failedOn:""};
const subs=new Set();
const emit=()=>{subs.forEach(f=>{try{f(snapshot())}catch{}});try{SK.bus&&SK.bus.emit("save",snapshot())}catch{}paint()};
const snapshot=()=>({state:st.state,at:st.at,error:st.error,writes:st.writes,where:"device"});
let settle=0;
/* a failure stays on screen until the same key (or IndexedDB store) is written successfully again —
   later writes elsewhere do not hide that one entry was not kept */
function begin(){st.pending++;if(st.state!=="saving"&&st.state!=="failed"){st.state="saving";emit()}}
function done(ok,err,key){
  st.pending=Math.max(0,st.pending-1);
  if(!ok){st.state="failed";st.failedOn=key||"";st.error=String(err&&err.message||err||"تعذر الحفظ");emit();return}
  st.writes++;
  if(st.state==="failed"){if(key!==st.failedOn)return;st.failedOn="";st.error="";st.state="saving";emit()}
  /* a burst of writes reads as one save; the «saved» state lands once the burst is over */
  clearTimeout(settle);settle=setTimeout(()=>{if(st.pending===0&&st.state!=="failed"){st.state="saved";st.at=Date.now();emit()}},160);
  if(st.state!=="saving"&&st.state!=="failed"){st.state="saving";emit()}
}
/* localStorage */
try{
  const P=Storage.prototype,set=P.setItem,rem=P.removeItem;
  const watch=(store,k)=>store===window.localStorage&&typeof k==="string"&&PREFIX.test(k)&&!QUIET.test(k);
  P.setItem=function(k,v){if(!watch(this,k))return set.call(this,k,v);begin();try{set.call(this,k,v)}catch(e){done(false,e.name==="QuotaExceededError"?"ذاكرة الجهاز ممتلئة":e,k);throw e}done(true,"",k)};
  P.removeItem=function(k){if(!watch(this,k))return rem.call(this,k);begin();try{rem.call(this,k)}catch(e){done(false,e,k);throw e}done(true,"",k)};
}catch{}
/* IndexedDB: every readwrite transaction on the app database */
try{
  const tx=IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction=function(names,mode,...rest){
    const t=tx.call(this,names,mode,...rest);
    if(mode==="readwrite"&&this.name==="aghnam-app-v7"){
      begin();let fin=false;const key="idb:"+[].concat(names).join(",");const end=(ok,e)=>{if(!fin){fin=true;done(ok,e,key)}};
      t.addEventListener("complete",()=>end(true));
      t.addEventListener("error",()=>end(false,t.error||"تعذر حفظ السجل"));
      t.addEventListener("abort",()=>end(false,t.error||"أُلغي الحفظ"));
    }
    return t;
  };
}catch{}

/* ---------- the chip (in the top bar, before the notifications bell — on phones too) ---------- */
const hhmm=t=>new Date(t).toLocaleTimeString("ar-SA-u-nu-latn",{hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
function label(){
  if(st.state==="saving")return["جاري الحفظ…","جاري الحفظ على هذا الجهاز"];
  if(st.state==="failed")return["تعذر الحفظ","تعذر الحفظ: "+st.error+" — صدّر نسخة احتياطية من الإعدادات قبل المتابعة"];
  if(st.state==="saved")return["تم الحفظ "+hhmm(st.at),"تم الحفظ على هذا الجهاز الساعة "+hhmm(st.at)+" · لا نسخة على خادم بعد (الدستور §3.0‑8)"];
  return["محفوظ على الجهاز","البيانات محفوظة على هذا الجهاز · لا نسخة على خادم بعد (الدستور §3.0‑8)"];
}
function paint(){
  const bell=document.getElementById("sk-tb-bell");if(!bell)return;
  let chip=document.getElementById("sk-save");
  if(!chip){
    chip=document.createElement("button");chip.type="button";chip.id="sk-save";chip.className="sk-save";
    chip.innerHTML='<i aria-hidden="true"></i><span></span>';
    chip.onclick=()=>{try{window.SKosifCore.go("settings")}catch{}};
  }
  if(chip.nextElementSibling!==bell)bell.before(chip);
  const [t,long]=label();
  chip.dataset.state=st.state;chip.querySelector("span").textContent=t;chip.title=long;chip.setAttribute("aria-label",long);
  chip.setAttribute("aria-live",st.state==="failed"?"assertive":"polite");
}
/* the top bar is built on its own schedule: attach as soon as the bell exists */
function attach(){
  paint();
  try{new MutationObserver(()=>{const c=document.getElementById("sk-save"),b=document.getElementById("sk-tb-bell");if(b&&(!c||c.nextElementSibling!==b))paint()}).observe(document.body,{childList:true,subtree:true})}catch{}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach);else attach();

SK.saveState={status:snapshot,on(f){subs.add(f);return()=>subs.delete(f)}};
})();

/* S.kosif core — event bus (SK.bus).
   Events: nav (screen opened), action (a data-act handler ran), data (a key was saved),
   error, backup, restore, role. The core's go()/render() also dispatch window "sk:*" events,
   which are relayed here, so features never need to observe the DOM to know what happened. */
(()=>{
"use strict";
const subs=new Map();
function on(type,fn){if(!subs.has(type))subs.set(type,new Set());subs.get(type).add(fn);return()=>subs.get(type).delete(fn)}
function emit(type,detail){
  for(const key of [type,"*"])(subs.get(key)||[]).forEach(fn=>{try{fn(detail,type)}catch(e){SK.errors&&SK.errors.report(e,"bus:"+type)}});
}
/* relay the core's window events */
["nav","render"].forEach(t=>addEventListener("sk:"+t,e=>emit(t,e.detail||{})));
/* every core action goes through data-act; record which one ran (not its data) */
document.addEventListener("click",e=>{
  const el=e.target.closest&&e.target.closest("[data-act]");
  if(el&&!el.disabled)emit("action",{act:el.dataset.act,view:window.SKosifCore?SKosifCore.view():""});
},true);
/* writes to app keys (feature modules and core both use localStorage) */
try{
  const proto=Storage.prototype,orig=proto.setItem;
  proto.setItem=function(k,v){orig.call(this,k,v);if(this===window.localStorage&&/^(aghnam|skosif|kosif)/.test(k)&&!/^(skosif_audit_trail|skosif_error_log|skosif_prefs|skosif_palette_recent|skosif_notify_v1|skosif_tables_v1|aghnam-v12-theme|aghnam-pricing-ui-v3)$/.test(k))emit("data",{key:k,bytes:String(v).length})};
}catch(e){}
SK.bus=Object.freeze({on,emit});
})();

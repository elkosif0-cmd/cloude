/* S.kosif components — screen states (SK.ui.state).
   One look for loading, empty, error, offline, no-permission, partial and success,
   so every screen reports its state the same way. Returns HTML strings. */
(()=>{
"use strict";
const I=id=>SK.icon(id);
const T={
  loading:(o={})=>'<div class="sks loading" role="status" aria-live="polite" aria-atomic="true"><div class="sks-skel"><i style="width:60%"></i><i></i><i style="width:80%"></i></div><p>'+SK.esc(o.text||"جارٍ التحميل…")+'</p></div>',
  empty:(o={})=>'<div class="sks empty" role="status" aria-live="polite" aria-atomic="true"><div class="sks-ic">'+I(o.icon||"item")+'</div><h3>'+SK.esc(o.title||"لا توجد بيانات بعد")+'</h3>'+(o.text?'<p>'+SK.esc(o.text)+'</p>':'')+(o.action?'<button type="button" class="btn primary" data-sks-go="'+SK.esc(o.action.go||"")+'">'+SK.esc(o.action.label)+'</button>':'')+'</div>',
  error:(o={})=>'<div class="sks error" role="alert" aria-atomic="true"><div class="sks-ic">'+I("alert")+'</div><h3>'+SK.esc(o.title||"تعذّر عرض هذه الشاشة")+'</h3><p>'+SK.esc(o.text||"بياناتك لم تتأثر. أعد المحاولة، أو افتح «الصحة والتشخيص».")+'</p><button type="button" class="btn primary" data-sks-retry>إعادة المحاولة</button> <button type="button" class="btn" data-sks-go="health">الصحة والتشخيص</button></div>',
  offline:(o={})=>'<div class="sks offline" role="status" aria-live="polite" aria-atomic="true"><div class="sks-ic">'+I("cloudoff")+'</div><h3>'+SK.esc(o.title||"أنت دون اتصال")+'</h3><p>'+SK.esc(o.text||"هذه الخدمة تحتاج إنترنت. بقية التطبيق يعمل كاملاً دون اتصال.")+'</p></div>',
  denied:(o={})=>'<div class="sks denied" role="status" aria-live="polite" aria-atomic="true"><div class="sks-ic">'+I("lock")+'</div><h3>غير متاح لدور «'+SK.esc(SK.perm?SK.perm.label():"")+'»</h3><p>'+SK.esc(o.text||"هذه الشاشة خارج صلاحيات الدور الحالي. غيّر الدور من «الإعدادات» إن كان لديك صلاحية المدير.")+'</p><button type="button" class="btn" data-sks-go="dash">مركز القيادة</button></div>',
  partial:(o={})=>'<div class="sks partial" role="status" aria-live="polite" aria-atomic="true"><div class="sks-ic">'+I("alert")+'</div><h3>'+SK.esc(o.title||"بيانات ناقصة")+'</h3><p>'+SK.esc(o.text||"بعض المصادر لم تُحمَّل؛ الأرقام المعروضة تغطي ما توفّر فقط.")+'</p></div>',
  success:(o={})=>'<div class="sks success" role="status" aria-live="polite" aria-atomic="true"><div class="sks-ic">'+I("check")+'</div><h3>'+SK.esc(o.title||"تم")+'</h3>'+(o.text?'<p>'+SK.esc(o.text)+'</p>':'')+'</div>'
};
document.addEventListener("click",e=>{const retry=e.target.closest&&e.target.closest("[data-sks-retry]");if(retry&&window.SKosifCore){SKosifCore.go(SKosifCore.view(),{keepScroll:true});return}const b=e.target.closest&&e.target.closest("[data-sks-go]");if(b&&b.dataset.sksGo&&window.SKosifCore)SKosifCore.go(b.dataset.sksGo)});
/* inline validation for any form field marked data-sk-required / data-sk-min */
let errorId=0;
function validate(root){
  let ok=true,first=null;
  (root||document).querySelectorAll("[data-sk-required],[data-sk-min]").forEach(el=>{
    const v=String(el.value||"").trim();let msg="";
    if(el.hasAttribute("data-sk-required")&&!v)msg="هذا الحقل مطلوب";
    else if(el.hasAttribute("data-sk-min")&&v&&SK.num(v)<Number(el.dataset.skMin))msg="القيمة أقل من "+el.dataset.skMin;
    el.setAttribute("aria-invalid",msg?"true":"false");
    const box=el.closest(".sk-field");let err=box&&box.querySelector(".sk-field-err");
    if(msg&&box){if(!err){err=document.createElement("small");err.className="sk-field-err";err.id="sk-field-error-"+(++errorId);err.setAttribute("role","alert");box.appendChild(err)}err.textContent=msg;
      const described=String(el.getAttribute("aria-describedby")||"").split(/\s+/).filter(Boolean);if(!described.includes(err.id))described.push(err.id);el.setAttribute("aria-describedby",described.join(" "));
    }else if(err){const described=String(el.getAttribute("aria-describedby")||"").split(/\s+/).filter(x=>x&&x!==err.id);if(described.length)el.setAttribute("aria-describedby",described.join(" "));else el.removeAttribute("aria-describedby");err.remove()}
    if(msg){ok=false;if(!first)first=el}
  });
  if(first)first.focus();
  return ok;
}
/* tab bar used by domain workspaces: [[id,label,count?]] */
function tabs(list,cur,name){return '<nav class="sk-hub-nav" role="tablist" data-sk-tabs="'+SK.esc(name||"tab")+'">'+list.map(([id,label,n])=>'<button type="button" role="tab" class="sk-hub-btn'+(id===cur?' active':'')+'" aria-selected="'+(id===cur)+'" data-tab="'+SK.esc(id)+'">'+SK.esc(label)+(n!=null?' <span class="sk-pill">'+SK.esc(n)+'</span>':'')+'</button>').join("")+'</nav>'}
/* small uid for records created on this device */
const uid=p=>(p||"id")+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
SK.ui=Object.freeze({state:Object.freeze(T),validate,tabs,uid});
})();

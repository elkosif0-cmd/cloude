/* S.kosif component — keyboard shortcuts for the laptop version (window.SKosifKeys).
   Keys are matched by their physical position (KeyboardEvent.code), so they work the same on an
   Arabic or an English keyboard layout:
     ? or F1            this sheet            Ctrl/⌘+B   fold the rail to icons
     Alt+1 … Alt+0      the ten domains       [  ]       previous / next screen of the domain
     G then a letter    jump to a screen (G D home, G O orders, G I inventory …)
   The command palette keeps Ctrl/⌘+K, /, Ctrl/⌘+S and the counter keys F2–F9 (palette.js). */
(()=>{
"use strict";
const {esc}=SK;
const core=()=>window.SKosifCore;
const GO=[["KeyH","dash","مركز القيادة"],["KeyO","commerce","الطلبات والتحصيل"],["KeyC","customers","العملاء"],["KeyF","followup","متابعة العملاء"],
  ["KeyZ","zatca","الفاتورة الضريبية"],["KeyI","inventory","المخزون"],["KeyP","purchasing","أوامر الشراء"],["KeyA","catalog","الأصناف والأسعار"],
  ["KeyL","ledger","الدفاتر المحاسبية"],["KeyR","execreports","التقارير التنفيذية"],["KeyJ","jev","Jev للقرار"],["KeyT","tasks","المهام"],
  ["KeyD","devices","الأجهزة والمزامنة"],["KeyS","settings","الإعدادات"]];
const letter=code=>code.replace(/^Key/,"");
const DIGITS=["Digit1","Digit2","Digit3","Digit4","Digit5","Digit6","Digit7","Digit8","Digit9","Digit0"];

const typing=t=>t&&(t.isContentEditable||/^(input|textarea|select)$/i.test(t.tagName));
const busy=()=>!!document.querySelector("#pr-modal .modal,.skd-wrap")||(window.SKosifCommand&&SKosifCommand.isOpen());
const can=id=>!!SK.caps.get(id)&&SK.perm.can(id);
function go(id){if(!can(id))return false;core().go(id);return true}
/* the first screen of the n-th domain the role can open (daily screens first) */
function domain(n){
  const g=SK.caps.groups()[n];if(!g)return false;
  const list=SK.caps.inGroup(g.id).filter(c=>SK.perm.can(c.id));
  const pick=list.find(c=>c.primary)||list[0];
  if(pick){core().go(pick.id);return true}
  return false;
}
/* [ and ]: walk the domain tab bar of the current screen */
function sibling(step){
  const c=core(),id=c.view(),adv=c.mode()==="advanced";
  const sibs=SK.caps.siblings(id).filter(x=>(adv||x.primary||x.id===id)&&SK.perm.can(x.id));
  const i=sibs.findIndex(x=>x.id===id);if(i<0||sibs.length<2)return false;
  c.go(sibs[(i+step+sibs.length)%sibs.length].id);return true;
}

/* ---------- the help sheet ---------- */
let sheet=null,prevFocus=null;
const k=(...keys)=>'<span>'+keys.map(x=>'<kbd>'+esc(x)+'</kbd>').join("")+'</span>';
function sheetHTML(){
  const d=SK.device||{mod:"Ctrl",apple:false,os:""},M=d.mod,alt=d.apple?"⌥":"Alt";
  const row=(t,keys)=>'<div class="skk-row"><span>'+esc(t)+'</span>'+keys+'</div>';
  const groups=SK.caps.groups().slice(0,10).map((g,i)=>row(g.label,k(alt,String((i+1)%10)))).join("");
  const gos=GO.filter(([,id])=>can(id)).map(([code,,l])=>row(l,k("G",letter(code)))).join("");
  const F=[["F2","فاتورة ضريبية","zatca"],["F3","ملصقات الموازين","labels"],["F4","ماسح الباركود","scanner"],["F8","المناسبات والتشغيل","operations"],["F9","المخزون","inventory"]].filter(x=>can(x[2]));
  return '<div class="skk" role="dialog" aria-modal="true" aria-labelledby="skk-t"><div class="skk-h"><h3 id="skk-t">اختصارات لوحة المفاتيح</h3><button type="button" class="btn sm" data-skk-close>إغلاق <kbd>Esc</kbd></button></div><div class="skk-b">'+
    '<section class="skk-sec"><h4>عام</h4>'+
      row("بحث وانتقال سريع",k(M,"K"))+row("بحث سريع",k("/"))+row("هذه القائمة",k("?"))+row("طيّ القائمة الجانبية / توسيعها",k(M,"B"))+row("نسخة كاملة للتطبيق",k(M,"S"))+
    '</section>'+
    '<section class="skk-sec"><h4>التنقل بين الشاشات</h4>'+row("الشاشة السابقة في المجال",k("["))+row("الشاشة التالية في المجال",k("]"))+gos+'</section>'+
    '<section class="skk-sec"><h4>المجالات العشرة</h4>'+groups+'</section>'+
    '<section class="skk-sec">'+(F.length?'<h4>الكاشير والمستودع</h4>'+F.map(([f,l])=>row(l,k(f))).join(""):'')+
      '<h4 style="margin-top:12px">داخل لوحة البحث</h4>'+row("تنقّل بين النتائج",k("↑","↓"))+row("فتح",k("Enter"))+row("تثبيت صنف",k(M,"P"))+row("حاسبة",k("=","12*4"))+
      (d.os==="ios"||d.os==="ipados"?'<p class="hint" style="margin-top:10px">الاختصارات تعمل مع لوحة مفاتيح خارجية على الآيباد والآيفون.</p>':'')+
    '</section></div></div>';
}
function help(){
  if(sheet){close();return}
  prevFocus=document.activeElement;
  sheet=document.createElement("div");sheet.className="skk-wrap";sheet.innerHTML=sheetHTML();
  sheet.addEventListener("click",e=>{if(e.target===sheet||e.target.closest("[data-skk-close]"))close()});
  document.body.appendChild(sheet);sheet.querySelector("[data-skk-close]").focus();
}
function close(){if(!sheet)return;sheet.remove();sheet=null;try{prevFocus&&prevFocus.focus()}catch{}}

/* ---------- key handling ---------- */
let gAt=0;
document.addEventListener("keydown",e=>{
  if(e.defaultPrevented||!core())return;
  const code=e.code||"",mod=e.ctrlKey||e.metaKey;
  if(sheet){if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close()}return}
  if(mod&&!e.altKey&&!e.shiftKey&&code==="KeyB"&&!(e.target&&e.target.isContentEditable)){if(innerWidth>900&&window.SKosifShell){e.preventDefault();SKosifShell.toggleRail()}return}
  if(mod||typing(e.target)||busy())return;
  if(e.altKey&&!e.shiftKey){const n=DIGITS.indexOf(code);if(n>=0&&domain(n))e.preventDefault();return}
  if(e.altKey)return;
  if(code==="F1"||(code==="Slash"&&e.shiftKey)){e.preventDefault();help();return}
  if(e.shiftKey)return;
  if(Date.now()-gAt<1200){gAt=0;const hit=GO.find(([c])=>c===code);if(hit&&go(hit[1]))e.preventDefault();return}
  if(code==="KeyG"){gAt=Date.now();e.preventDefault();return}
  if(code==="BracketRight"){if(sibling(1))e.preventDefault()}
  else if(code==="BracketLeft"){if(sibling(-1))e.preventDefault()}
});
window.SKosifKeys=Object.freeze({help,close,goKeys:()=>GO.map(([c,id,l])=>({keys:"G "+letter(c),id,label:l}))});
})();

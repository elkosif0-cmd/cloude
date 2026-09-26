/* S.kosif core — إتاحة الوصول التلقائية (SK.a11y).
   حقول الجداول القابلة للتعديل (التفكيك، المخزون، التكاليف…) كانت بلا اسم يقرؤه قارئ الشاشة. هذا المراقب
   يعطي كل حقل أو قائمة بلا اسم اسماً من رأس عمودها وأول خلية في صفها، أو من أقرب نص قبله، ويعطي
   الصور بلا وصف alt فارغاً، دون أن يغيّر أي شاشة. يعمل على #view بعد كل رسم. */
(()=>{
"use strict";
const txt=e=>e?String(e.textContent||"").replace(/\s+/g," ").trim().slice(0,60):"";
function named(el){return el.getAttribute("aria-label")||el.getAttribute("aria-labelledby")||el.closest("label")||(el.id&&document.querySelector('label[for="'+CSS.escape(el.id)+'"]'))||el.getAttribute("title")}
function nameFor(el){
  const td=el.closest("td,th");
  if(td){const tr=td.parentElement,table=td.closest("table"),i=[...tr.children].indexOf(td);
    const head=table&&table.tHead&&table.tHead.rows[0]&&table.tHead.rows[0].children[i];
    const first=tr.children[0]!==td?txt(tr.children[0]).slice(0,30):"";
    const h=txt(head);if(h||first)return [h,first].filter(Boolean).join(" — ")}
  if(el.placeholder)return el.placeholder;
  let n=el.previousElementSibling;for(let k=0;k<3&&n;k++,n=n.previousElementSibling){const t=txt(n);if(t&&!/^(input|select|textarea|button)$/i.test(n.tagName))return t}
  const p=el.parentElement,near=p?txt(p.querySelector("span,b,small,label")):"";if(near)return near;
  /* a grid row without headers: the section's title and the field's place in the row */
  const box=el.closest("section,.card,.sk-card,fieldset,div[id]"),h=box&&box.querySelector("h2,h3,h4,legend,b");
  const row=p?[...p.querySelectorAll("input,select,textarea")]:[];return (txt(h)||"حقل")+(row.length>1?" — "+(row.indexOf(el)+1):"");
}
function pass(root){
  if(!root)return;
  root.querySelectorAll("input:not([type=hidden]),select,textarea").forEach(el=>{if(named(el))return;const n=nameFor(el);if(n)el.setAttribute("aria-label",n)});
  root.querySelectorAll("img:not([alt])").forEach(i=>i.setAttribute("alt",""));
  root.querySelectorAll("button:not([aria-label]):not([title])").forEach(b=>{if(!txt(b)){const s=b.querySelector("svg title");b.setAttribute("aria-label",s?txt(s):"زر")}});
}
let t=0;
function schedule(){clearTimeout(t);t=setTimeout(()=>{pass(document.getElementById("view"));pass(document.querySelector(".sk-ph"))},120)}
function boot(){const v=document.getElementById("view");if(!v)return setTimeout(boot,300);new MutationObserver(schedule).observe(v,{childList:true,subtree:true});schedule()}
boot();
SK.a11y=Object.freeze({pass});
})();

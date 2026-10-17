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
/* Explicit adapter for the original quick-sale modal. The encoded save action is unchanged. */
const saleIds=['customer','phone','item','item-manual','price','currency','qty','city','payment','status','date'];
function saleFields(root){for(const name of saleIds){const el=root.querySelector('#v12s-'+name);if(!el)continue;const label=el.closest('.field')?.querySelector('label');if(label&&label.getAttribute('for')!==el.id)label.setAttribute('for',el.id);if(['customer','price'].includes(name)){if(!el.hasAttribute('required'))el.setAttribute('required','');if(el.getAttribute('aria-required')!=='true')el.setAttribute('aria-required','true')}if(!el.hasAttribute('aria-invalid'))el.setAttribute('aria-invalid','false')}}
function validateSale(e){
 if(!e.target.closest?.('[data-act="v12-sale-save"]'))return;const get=name=>document.getElementById('v12s-'+name),customer=get('customer');if(!customer)return;
 for(const name of saleIds){const el=get(name);if(!el)continue;const id='sqc-a11y-'+el.id;document.getElementById(id)?.remove();el.setAttribute('aria-invalid','false');const hints=(el.getAttribute('aria-describedby')||'').split(/\s+/).filter(x=>x&&x!==id);if(hints.length)el.setAttribute('aria-describedby',hints.join(' '));else el.removeAttribute('aria-describedby')}
 let field=null,message='';if(!customer.value.trim()){field=customer;message='اكتب اسم العميل'}else if(!(SK.num(get('price')?.value)>0)){field=get('price');message='أدخل سعر الوحدة'}else if((!get('item')?.value||get('item').value==='__manual')&&!get('item-manual')?.value.trim()){field=get('item')?.value==='__manual'?get('item-manual'):get('item');message='اختر المنتج أو اكتب اسمه'}
 if(!field)return;e.preventDefault();e.stopImmediatePropagation();const error=document.createElement('p');error.id='sqc-a11y-'+field.id;error.className='sk-field-err';error.setAttribute('role','alert');error.setAttribute('aria-live','assertive');error.textContent=message;field.closest('.field').appendChild(error);field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',[field.getAttribute('aria-describedby'),error.id].filter(Boolean).join(' '));field.focus();
}
document.addEventListener('click',validateSale,true);
function pass(root){
  if(!root)return;saleFields(root);
  /* Compact headers hide the text span; preserve this action's semantic name. */
  root.querySelectorAll('[data-act="v12-sale-new"]').forEach(b=>b.setAttribute("aria-label","إضافة بيع"));
  root.querySelectorAll("input:not([type=hidden]),select,textarea").forEach(el=>{if(named(el))return;const n=nameFor(el);if(n)el.setAttribute("aria-label",n)});
  root.querySelectorAll("img:not([alt])").forEach(i=>i.setAttribute("alt",""));
  root.querySelectorAll("button:not([aria-label]):not([title])").forEach(b=>{if(!txt(b)){const s=b.querySelector("svg title");b.setAttribute("aria-label",s?txt(s):"زر")}});
}
let t=0;
function schedule(){clearTimeout(t);t=setTimeout(()=>{pass(document.getElementById("view"));pass(document.querySelector(".sk-ph"))},120)}
function boot(){const v=document.getElementById("view");if(!v)return setTimeout(boot,300);new MutationObserver(schedule).observe(v,{childList:true,subtree:true});const hdr=document.getElementById("hdr");if(hdr)new MutationObserver(schedule).observe(hdr,{childList:true,subtree:true});if(document.body)new MutationObserver(()=>{const modal=document.getElementById('v12s-customer')?.closest('[role=dialog],.dlg');if(modal)pass(modal)}).observe(document.body,{childList:true,subtree:true});schedule()}
boot();
const bidi=(value,dir="auto")=>'<bdi dir="'+(["ltr","rtl"].includes(dir)?dir:"auto")+'">'+SK.esc(value)+'</bdi>';
SK.a11y=Object.freeze({pass,bidi});
})();

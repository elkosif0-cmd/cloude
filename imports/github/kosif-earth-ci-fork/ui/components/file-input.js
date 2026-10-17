/* S.kosif component — Arabic file fields (HARSH_REVIEW #25). The browser draws <input type=file> in its own language
   («Choose File · No file chosen» on an English browser) and its own style. Every file field on screen gets one button in
   the app's identity, «اختر ملفاً», and the chosen name beside it («لم يُختر ملف» before). The input itself stays in the
   page (visually hidden, still focusable and labelled), so every screen's change handler keeps working untouched. Inputs a
   screen creates off-screen to open the picker are not touched. */
(()=>{
"use strict";
let seq=0;
function enhance(input){
  if(input.dataset.skFile||input.closest(".sk-file")||!input.isConnected)return;
  /* a field the screen hides and opens from its own button keeps its button alone */
  if(input.hidden||getComputedStyle(input).display==="none"||input.closest("[hidden]"))return;
  /* a field already inside the screen's own button or drop zone (<label class="btn">…<input type=file>) is that button */
  const host=input.closest("label");if(host&&(/(btn|dropzone|sk-drop|tbr-drop)/.test(host.className)||host.closest(".dropzone")))return;
  input.dataset.skFile="1";
  if(!input.id)input.id="sk-file-"+(++seq);
  const wrap=document.createElement("span");wrap.className="sk-file";
  /* a button, not a <label for>: the field often sits inside a field <label> already, and labels do not nest */
  const btn=document.createElement("button");btn.type="button";btn.className="btn sm sk-file-btn";btn.textContent=input.multiple?"اختر ملفات":"اختر ملفاً";
  btn.addEventListener("click",e=>{e.preventDefault();input.click()});
  const name=document.createElement("span");name.className="sk-file-name";name.setAttribute("aria-live","polite");
  const show=()=>{const f=input.files;name.textContent=f&&f.length?(f.length===1?f[0].name:f.length+" ملفات"):"لم يُختر ملف"};
  input.parentNode.insertBefore(wrap,input);wrap.append(input,btn,name);
  input.classList.add("sk-file-input");
  if(!input.getAttribute("aria-label")&&!input.labels?.length)input.setAttribute("aria-label",btn.textContent);
  input.addEventListener("change",show);show();
}
function scan(root){(root.querySelectorAll?root:document).querySelectorAll('input[type="file"]:not([data-sk-file])').forEach(enhance)}
let pending=false;
function later(){if(pending)return;pending=true;setTimeout(()=>{pending=false;scan(document)},50)}
function start(){scan(document);try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}catch{}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
window.SKosifFileInput=Object.freeze({enhance,scan});
})();

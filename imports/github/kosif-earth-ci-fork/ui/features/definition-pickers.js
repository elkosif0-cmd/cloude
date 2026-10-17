/* S.kosif — the company's definitions feed the pickers of the core screens (FOUNDATION P2: one master data per company).
   The core sale dialog («تسجيل عملية بيع», #v12s-customer) gets a suggestion list of the customers defined in «التعريفات»
   followed by the customers already sold to, so a sale names the same customer the books, statements and ageing use.
   The list is (re)built each time the field takes focus: definitions added in another tab show at once. */
(()=>{
"use strict";
const LIST="sk-def-customers";
const defs=type=>{try{const P=window.SKosifCompanyPlatform;return P&&P.definitions?P.definitions(type):[]}catch{return[]}};
function names(){
  const sold=(SK.load("aghnam-v12-manual-sales",[])||[]).map(x=>x&&x.customer);
  return [...new Set(defs("customers").map(x=>x.name).concat(sold))].map(v=>String(v||"").trim()).filter(Boolean).slice(0,500);
}
function attach(input){
  let dl=document.getElementById(LIST);
  if(!dl){dl=document.createElement("datalist");dl.id=LIST;document.body.appendChild(dl)}
  dl.innerHTML=names().map(n=>'<option value="'+SK.esc(n)+'">').join("");
  input.setAttribute("list",LIST);input.setAttribute("autocomplete","off");
}
document.addEventListener("focusin",e=>{const t=e.target;if(t&&t.id==="v12s-customer")attach(t)});
window.SKosifDefinitionPickers=Object.freeze({customers:names});
})();

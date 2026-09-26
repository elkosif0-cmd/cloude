/* S.kosif core — المعاينة والتصدير الموحّد (SK.output).
   كل مستند يُطبع في التطبيق (التقارير، خطاب الإدارة، تقرير الجولة، الجداول، الفواتير، شاشات النواة) يُفتح داخل
   التطبيق في معاينة كاملة بدل نافذة منبثقة (تحجبها أجهزة iPhone غالباً):
   • ورقة بمقاسها الحقيقي مع التكبير، وخيارات الطباعة (الورق، الاتجاه، الهوامش، الحجم، رمادي، علامة مائية،
     الترويسة، أرقام الصفحات) — تُحفظ على الجهاز.
   • طباعة / حفظ PDF، Word (.doc)، Excel (كل جداول المستند، ورقة لكل جدول باسم عنوانه)، HTML، مشاركة، ونافذة
     مستقلة عند الحاجة.
   الطريقة: window.open("") بلا عنوان يُعيد نافذة المعاينة المضمّنة، فتعمل كل شاشة كما كُتبت دون تعديل. */
(()=>{
"use strict";
const {esc,toast}=SK;
const realOpen=window.open.bind(window);
let cur=null;
const slug=t=>String(t||"document").replace(/[^\w؀-ۿ]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"document";
const ascii=t=>"KOSIF-"+((String(t||"").match(/[A-Za-z0-9]+/g)||[]).join("-").slice(0,30)||(window.SKosifCore&&SKosifCore.view())||"document")+"-"+new Date().toISOString().slice(0,10);
const PAPER_CSS='@media screen{html{background:#dfe4ec!important}body{box-sizing:border-box;width:var(--skout-w,210mm);max-width:calc(100vw - 24px);min-height:var(--skout-h,297mm);margin:18px auto 40px!important;padding:14mm 12mm!important;background:#fff!important;box-shadow:0 14px 40px -12px rgba(11,31,58,.35);border-radius:4px}.skp-bar{display:none!important}}';
function css(d){
  if(!d||!d.head&&!d.documentElement)return;const o=SK.print.options(),dims={A4:["210mm","297mm"],A5:["148mm","210mm"],A3:["297mm","420mm"],letter:["216mm","279mm"]}[o.paper]||["210mm","297mm"];
  const [w,h]=o.orient==="landscape"?[dims[1],dims[0]]:dims;
  let st=d.getElementById("skout-paper");if(!st){st=d.createElement("style");st.id="skout-paper"}st.textContent=':root{--skout-w:'+w+';--skout-h:'+h+'}'+PAPER_CSS;
  let op=d.getElementById("skp-opts");if(!op){op=d.createElement("style");op.id="skp-opts"}op.textContent=SK.print.css(o);
  const host=d.head||d.documentElement;host.appendChild(st);host.appendChild(op);
}
function toolbar(o){
  const sel=(k,opts)=>'<select data-k="'+k+'" aria-label="'+k+'">'+opts.map(([v,l])=>'<option value="'+v+'"'+(String(o[k])===String(v)?' selected':'')+'>'+l+'</option>').join("")+'</select>';
  const chk=(k,l)=>'<label class="skout-chk"><input type="checkbox" data-k="'+k+'"'+(o[k]?' checked':'')+'> '+l+'</label>';
  return '<div class="skout-bar"><b class="skout-t"></b>'+
    '<div class="skout-acts"><button type="button" class="btn primary sm" data-o="print">طباعة / PDF</button><button type="button" class="btn sm" data-o="word">Word</button><button type="button" class="btn sm" data-o="excel">Excel</button><button type="button" class="btn sm" data-o="html">HTML</button>'+
    (navigator.share?'<button type="button" class="btn sm" data-o="share">مشاركة</button>':'')+'<button type="button" class="btn sm" data-o="window" title="فتح في نافذة مستقلة">↗</button><button type="button" class="btn sm" data-o="close" aria-label="إغلاق">✕</button></div>'+
    '<details class="skout-opts"><summary>خيارات الصفحة</summary><div>'+
      '<label>الورق '+sel("paper",[["A4","A4"],["A5","A5"],["letter","Letter"],["A3","A3"]])+'</label><label>الاتجاه '+sel("orient",[["portrait","طولي"],["landscape","عرضي"]])+'</label>'+
      '<label>الهوامش '+sel("margin",[["narrow","ضيقة"],["normal","عادية"],["wide","واسعة"]])+'</label><label>الحجم '+sel("scale",[[85,"85%"],[90,"90%"],[100,"100%"],[110,"110%"],[125,"125%"]])+'</label>'+
      '<label>علامة مائية <input type="text" data-k="wm" list="skout-wm" value="'+esc(o.wm)+'" placeholder="بلا"><datalist id="skout-wm"><option value="مسودة"><option value="سري"><option value="نسخة"><option value="للمراجعة"></datalist></label>'+
      chk("gray","رمادي")+chk("head","الترويسة")+chk("pages","أرقام الصفحات")+'<label>العرض '+'<select data-z><option value="1">100%</option><option value="0.8">80%</option><option value="0.65">65%</option><option value="1.2">120%</option></select></label>'+
    '</div></details></div>';
}
function sheet(){
  close();
  const wrap=document.createElement("div");wrap.className="skout";wrap.setAttribute("role","dialog");wrap.setAttribute("aria-modal","true");wrap.setAttribute("aria-label","معاينة المستند");
  wrap.innerHTML=toolbar(SK.print.options())+'<iframe class="skout-f" title="المستند" data-skout="1"></iframe>';
  document.body.appendChild(wrap);document.documentElement.classList.add("skout-open");
  const f=wrap.querySelector("iframe"),w=f.contentWindow;
  const esc=e=>{if(e.key==="Escape"){e.preventDefault();close()}};
  const patch=()=>{try{if(!w.__skRealPrint){const rp=w.print.bind(w);w.__skRealPrint=()=>{try{w.focus();rp()}catch{}}}w.print=()=>{};w.close=()=>close();w.__skEmbedded=true;if(w.document&&!w.document.__skEsc){w.document.__skEsc=1;w.document.addEventListener("keydown",esc,true)}}catch{}};
  patch();
  /* documents the core writes without the letterhead still get the paper and the options */
  let ticks=0;const t=setInterval(()=>{ticks++;try{patch();css(w.document);const title=w.document.title||(w.document.querySelector("h1")||{}).textContent||"مستند";wrap.querySelector(".skout-t").textContent=title}catch{}if(ticks>12)clearInterval(t)},250);
  cur={wrap,f,w,t};
  setTimeout(()=>{const b=wrap.querySelector('[data-o="print"]');b&&b.focus()},60);
  return w;
}
function close(){if(!cur)return;clearInterval(cur.t);cur.wrap.remove();document.documentElement.classList.remove("skout-open");cur=null}
function docHTML(d){
  const c=d.documentElement.cloneNode(true);c.querySelectorAll("script,.skp-bar,#skout-paper").forEach(x=>x.remove());
  c.querySelectorAll("img[src]").forEach(i=>{try{i.src=new URL(i.getAttribute("src"),location.href).href}catch{}});
  return "<!doctype html>\n"+c.outerHTML;
}
function tablesOf(d){
  return [...d.querySelectorAll("table")].filter(t=>t.rows.length>1).map((t,i)=>{
    let h=null,n=t;for(let k=0;k<30&&n;k++){n=n.previousElementSibling||n.parentElement;if(n&&/^H[1-4]$/.test(n.tagName)){h=n.textContent.trim();break}}
    const rows=[...t.rows].map(r=>[...r.cells].map(c=>c.textContent.replace(/\s+/g," ").trim()));
    const width=Math.max(...rows.map(r=>r.length));rows.forEach(r=>{while(r.length<width)r.push("")});
    return {name:(h||"جدول "+(i+1)).slice(0,28),headers:rows[0],rows:rows.slice(1)};
  });
}
async function act(a){
  if(!cur)return;const d=cur.w.document,title=(d.title||"مستند").trim();
  if(a==="close")return close();
  if(a==="print"){css(d);cur.w.__skRealPrint?cur.w.__skRealPrint():cur.w.print();SK.audit&&SK.audit.log("report",{act:"print",title:title.slice(0,60)});return}
  if(a==="word"){const html=docHTML(d).replace("<html",'<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"').replace("<head>",'<head><meta charset="utf-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>body{direction:rtl}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 6px}</style>');
    SK.download(ascii(title)+".doc",new Blob(["﻿"+html],{type:"application/msword"}));SK.audit&&SK.audit.log("report",{act:"word"});return}
  if(a==="excel"){const t=tablesOf(d);if(!t.length)return toast("لا توجد جداول في هذا المستند","info");SK.download(ascii(title)+".xlsx",SKXlsx.book(t));toast("صُدّر "+t.length+" جدولاً إلى Excel","ok");SK.audit&&SK.audit.log("report",{act:"excel",tables:t.length});return}
  if(a==="html"){SK.download(ascii(title)+".html",new Blob([docHTML(d)],{type:"text/html;charset=utf-8"}));return}
  if(a==="share"){try{const file=new File([docHTML(d)],slug(title)+".html",{type:"text/html"});if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title});else await navigator.share({title,text:d.body.innerText.slice(0,3000)})}catch{}return}
  if(a==="window"){const w=realOpen("","_blank");if(!w)return toast("اسمح بالنوافذ المنبثقة","warn");w.document.open();w.document.write(docHTML(d));w.document.close()}
}
document.addEventListener("click",e=>{const b=e.target.closest(".skout [data-o]");if(b)act(b.dataset.o)});
document.addEventListener("change",e=>{
  if(!cur||!e.target.closest(".skout-bar"))return;const el=e.target;
  if(el.hasAttribute("data-z")){cur.f.style.setProperty("--z",el.value);return}
  const k=el.dataset.k;if(!k)return;SK.print.set(k,el.type==="checkbox"?el.checked:k==="scale"?Number(el.value):el.value);css(cur.w.document);
});
document.addEventListener("input",e=>{if(cur&&e.target.dataset&&e.target.dataset.k==="wm"&&e.target.closest(".skout-bar")){SK.print.set("wm",e.target.value.slice(0,24));css(cur.w.document)}});
document.addEventListener("keydown",e=>{if(cur&&e.key==="Escape"){e.preventDefault();close()}},true);
/* moving to another screen closes the preview */
addEventListener("sk:nav",()=>close());
/* a blank window.open() (every print in the app) becomes the in-app preview */
window.open=function(url,target,features){
  const u=url==null?"":String(url);
  if((u===""||u==="about:blank")&&document.body&&SK.print.options().preview!==false)return sheet();
  return realOpen(url,target,features);
};
SK.output=Object.freeze({open:sheet,close,css,tables:tablesOf,embedded:w=>!!(w&&w.__skEmbedded)});
})();

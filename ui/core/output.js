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
const ascii=t=>"SQC-"+((String(t||"").match(/[A-Za-z0-9]+/g)||[]).join("-").slice(0,30)||(window.SKosifCore&&SKosifCore.view())||"document")+"-"+new Date().toISOString().slice(0,10);
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
    '<div class="skout-acts"><button type="button" class="btn primary sm" data-o="print">طباعة / PDF</button><button type="button" class="btn sm" data-o="present" title="عرض المستند قسماً قسماً بملء الشاشة">عرض تقديمي</button><button type="button" class="btn sm" data-o="word">Word</button><button type="button" class="btn sm" data-o="excel">Excel</button><button type="button" class="btn sm" data-o="html">HTML</button>'+
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
function close(){if(pres)endPresent();if(!cur)return;clearInterval(cur.t);cur.wrap.remove();document.documentElement.classList.remove("skout-open");cur=null}
function docHTML(d){
  const c=d.documentElement.cloneNode(true);c.querySelectorAll("script,.skp-bar,#skout-paper").forEach(x=>x.remove());
  c.querySelectorAll("img[src]").forEach(i=>{try{i.src=new URL(i.getAttribute("src"),location.href).href}catch{}});
  return "<!doctype html>\n"+c.outerHTML;
}
function sourceReportDocument(d){return !!d.querySelector?.('[data-source-kind="published-statements"], .rd-source');}
function tablesOf(d){
  if(sourceReportDocument(d))return [];
  return [...d.querySelectorAll("table")].filter(t=>t.rows.length>1).map((t,i)=>{
    let h=null,n=t;for(let k=0;k<30&&n;k++){n=n.previousElementSibling||n.parentElement;if(n&&/^H[1-4]$/.test(n.tagName)){h=n.textContent.trim();break}}
    const rows=[...t.rows].map(r=>[...r.cells].map(c=>c.textContent.replace(/\s+/g," ").trim()));
    const width=Math.max(...rows.map(r=>r.length));rows.forEach(r=>{while(r.length<width)r.push("")});
    return {name:(h||"جدول "+(i+1)).slice(0,28),headers:rows[0],rows:rows.slice(1)};
  });
}
/* ---------- presentation mode: the document, one section per slide, full screen ----------
   For a meeting with the client or the audit committee: a title slide (SQC, the document title, the company, the
   date), then one slide per section of the document (split at its h1/h2 headings), each under the SQC mark. The
   slides keep the document's own styles, so its tables look as they do in print. Keys: ← next, → previous (the
   document reads right to left), PageDown/Space next, PageUp previous, Home/End, Esc leaves; swipe on a phone. */
let pres=null;
const PRES_CSS='html,body{margin:0;height:100%;background:#0b1f3a}body{padding:0!important;width:auto!important;max-width:none!important;min-height:0!important;box-shadow:none!important}'+
  '.sl{display:none;box-sizing:border-box;flex-direction:column;height:100vh;padding:clamp(12px,3vw,40px) clamp(12px,4vw,56px);background:#fff;overflow:auto}.sl.on{display:flex}'+
  '.sl-h{display:flex;align-items:center;gap:12px;padding-bottom:10px;margin-bottom:clamp(10px,2vh,22px);border-bottom:3px solid #1668e3}.sl-h img{height:28px;width:auto}.sl-h span{font:800 14px/1 Montserrat,"Segoe UI",sans-serif;letter-spacing:.08em;color:#0b1f3a}'+
  '.sl-h b{margin-inline-start:auto;font:700 clamp(15px,2.2vw,24px)/1.3 "IBM Plex Sans Arabic","Segoe UI",sans-serif;color:#0b1f3a;text-align:end}'+
  '.sl-b{flex:1;font-size:clamp(13px,1.35vw,17px)}.sl-b table{font-size:inherit}.sl-b h1,.sl-b h2{display:none}'+
  '.sl.t{justify-content:center;align-items:center;text-align:center;background:linear-gradient(135deg,#0b1f3a 0%,#123a6b 60%,#1668e3 100%);color:#fff}'+
  '.sl.t img{height:64px;width:auto;margin-bottom:22px}.sl.t h1{display:block;margin:0 0 10px;color:#fff;font:800 clamp(22px,4vw,44px)/1.25 "IBM Plex Sans Arabic","Segoe UI",sans-serif}.sl.t p{margin:4px 0;color:#cfe0f5;font-size:clamp(13px,1.6vw,18px)}';
function slidesOf(d){
  const title=(d.title||(d.querySelector("h1")||{}).textContent||"مستند").trim();
  const body=d.body.cloneNode(true);body.querySelectorAll("script,.skp-bar,.no-print,.skp-lux,.skp-head,.skp-orn").forEach(x=>x.remove());
  let root=body;
  while(root.children.length===1&&!/^H[1-3]$/.test(root.firstElementChild.tagName)&&root.firstElementChild.children.length>1)root=root.firstElementChild;
  const out=[],pre=[];let s=null;
  for(const el of [...root.children]){
    if(/^H[12]$/.test(el.tagName)){s={h:el.textContent.trim()||title,nodes:[]};out.push(s);continue}
    if(!s){pre.push(el);continue}
    s.nodes.push(el);
  }
  /* short lines before the first heading (company, period) become the title slide's subtitle; a longer opening is its own slide */
  const preText=pre.map(n=>n.textContent.replace(/\s+/g," ").trim()).filter(Boolean).join(" · ");
  const shortPre=preText.length<=240&&!pre.some(n=>n.matches("table")||n.querySelector("table,img,svg"));
  if(pre.length&&!shortPre)out.unshift({h:title,nodes:pre});
  return {title,subtitle:shortPre?preText:"",slides:out.filter(x=>x.nodes.some(n=>n.textContent.trim()||n.querySelector("img,table,svg")))};
}
function present(){
  if(!cur)return;
  const d=cur.w.document,{title,subtitle,slides}=slidesOf(d),base=location.href.replace(/[^/?#]*([?#].*)?$/,""),mark=base+"art/sqc-mark.svg";
  let biz="";try{biz=(JSON.parse(localStorage.getItem("aghnam-pricing-v3")||"{}").settings||{}).biz||""}catch{}
  const date=new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"});
  const styles=[...d.querySelectorAll("style,link[rel=stylesheet]")].filter(x=>x.id!=="skout-paper"&&x.id!=="skp-opts").map(x=>x.outerHTML).join("");
  const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+styles+'<style>'+PRES_CSS+'</style></head><body>'+
    '<section class="sl t on"><img src="'+mark+'" alt="SQC"><h1>'+esc(title)+'</h1>'+(subtitle?'<p>'+esc(subtitle)+'</p>':biz?'<p>'+esc(biz)+'</p>':'')+'<p>'+esc(date)+'</p></section>'+
    slides.map(s=>'<section class="sl"><header class="sl-h"><img src="'+mark+'" alt=""><span>SQC</span><b>'+esc(s.h)+'</b></header><div class="sl-b">'+s.nodes.map(n=>n.outerHTML).join("")+'</div></section>').join("")+'</body></html>';
  const wrap=document.createElement("div");wrap.className="skpres";wrap.setAttribute("role","dialog");wrap.setAttribute("aria-modal","true");wrap.setAttribute("aria-label","عرض تقديمي: "+title);
  wrap.innerHTML='<iframe class="skpres-f" title="'+esc(title)+'"></iframe><div class="skpres-bar"><button type="button" class="btn sm" data-p="prev" aria-label="الشريحة السابقة">→</button>'+
    '<span class="skpres-n" aria-live="polite"></span><button type="button" class="btn sm" data-p="next" aria-label="الشريحة التالية">←</button><button type="button" class="btn sm" data-p="close" aria-label="إنهاء العرض">إنهاء</button></div>';
  document.body.appendChild(wrap);
  const f=wrap.querySelector("iframe");f.srcdoc=html;
  pres={wrap,f,i:0,n:slides.length+1};
  const key=e=>{if(!pres)return;const k=e.key;
    if(k==="Escape"){e.preventDefault();e.stopPropagation();return endPresent()}
    if(k==="ArrowLeft"||k==="PageDown"||k===" "){e.preventDefault();go(pres.i+1)}else if(k==="ArrowRight"||k==="PageUp"){e.preventDefault();go(pres.i-1)}
    else if(k==="Home"){e.preventDefault();go(0)}else if(k==="End"){e.preventDefault();go(pres.n-1)}};
  pres.key=key;document.addEventListener("keydown",key,true);
  f.addEventListener("load",()=>{const fd=f.contentDocument;if(!fd)return;fd.addEventListener("keydown",key,true);
    let x0=null;fd.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
    fd.addEventListener("touchend",e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)go(pres.i+(dx>0?1:-1))},{passive:true});
    go(0);try{f.contentWindow.focus()}catch{}});
  try{wrap.requestFullscreen&&wrap.requestFullscreen().catch(()=>{})}catch{}
  SK.audit&&SK.audit.log("report",{act:"present",title:title.slice(0,60)});
}
function go(i){
  if(!pres)return;pres.i=Math.max(0,Math.min(pres.n-1,i));
  const fd=pres.f.contentDocument;if(fd)[...fd.querySelectorAll(".sl")].forEach((s,k)=>{s.classList.toggle("on",k===pres.i);if(k===pres.i)s.scrollTop=0});
  pres.wrap.querySelector(".skpres-n").textContent=(pres.i+1)+" من "+pres.n;
  pres.wrap.querySelector('[data-p="prev"]').disabled=pres.i===0;pres.wrap.querySelector('[data-p="next"]').disabled=pres.i===pres.n-1;
}
function endPresent(){
  if(!pres)return;document.removeEventListener("keydown",pres.key,true);
  try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch{}
  pres.wrap.remove();pres=null;
  const b=cur&&cur.wrap.querySelector('[data-o="present"]');b&&b.focus();
}
document.addEventListener("click",e=>{const b=e.target.closest(".skpres [data-p]");if(!b||!pres)return;const p=b.dataset.p;if(p==="close")endPresent();else go(pres.i+(p==="next"?1:-1))});
async function act(a){
  if(!cur)return;const d=cur.w.document,title=(d.title||"مستند").trim();
  if(a==="close")return close();
  if(a==="present")return present();
  if(a==="print"){css(d);cur.w.__skRealPrint?cur.w.__skRealPrint():cur.w.print();SK.audit&&SK.audit.log("report",{act:"print",title:title.slice(0,60)});return}
  if(a==="word"){const html=docHTML(d).replace("<html",'<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"').replace("<head>",'<head><meta charset="utf-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>body{direction:rtl}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 6px}</style>');
    SK.download(ascii(title)+".doc",new Blob(["﻿"+html],{type:"application/msword"}));SK.audit&&SK.audit.log("report",{act:"word"});return}
  if(a==="excel"){if(sourceReportDocument(d)){SK.toast("تصدير Excel غير متاح لتقارير المصدر لأنه يفقد بيانات المصدر. استخدم CSV الموثق من نموذج المصدر.","warn");return}const t=tablesOf(d);if(!t.length)return toast("لا توجد جداول في هذا المستند","info");SK.download(ascii(title)+".xlsx",SKXlsx.book(t));toast("صُدّر "+t.length+" جدولاً إلى Excel","ok");SK.audit&&SK.audit.log("report",{act:"excel",tables:t.length});return}
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
document.addEventListener("keydown",e=>{if(cur&&e.key==="Escape"&&!pres){e.preventDefault();close()}},true);
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

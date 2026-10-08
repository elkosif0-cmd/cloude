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
const {esc}=SK;
const realOpen=window.open.bind(window);
let cur=null;
/* Optional report guards are scoped to the exact preview session. Legacy reports
   do not install one and retain their existing output behavior. */
const sessions=new WeakMap();
/* Focus belongs to the live preview/presentation only. A detached output window
   is deliberately not a layer in this document. No document-wide aria-hidden. */
const FOCUSABLE='button,input:not([type="hidden"]),select,textarea,a[href],area[href],summary,iframe,[tabindex],[contenteditable="true"],audio[controls],video[controls]';
function focusContext(){try{
  const scope=window.SKosifSpace?.scopeSnapshot?.();if(scope&&(scope.status!=="stable"||typeof scope.token!=="string"))return null;
  const c=SK.company?.current?.();return JSON.stringify([location.href,window.SKosifCore?.view?.(),c?.id,c?.period?.id,c?.period?.startDate,c?.period?.endDate,SK.perm?.role?.(),scope?.token]);
}catch{return null}}
function available(el){
  if(!el||!el.isConnected||el.disabled||el.getAttribute("aria-disabled")==="true")return false;
  if(el.closest?.('[hidden],[inert],[aria-hidden="true"]')||el.matches?.(':disabled'))return false;
  if(el.getClientRects&&!el.getClientRects().length)return false;
  const view=el.ownerDocument?.defaultView,style=view?.getComputedStyle?.(el);
  return !style||style.visibility!=="hidden"&&style.visibility!=="collapse";
}
function focusOn(el){if(!available(el))return false;try{el.focus();return !el.ownerDocument||el.ownerDocument.activeElement===el}catch{return false}}
function topLayer(){return pres?.layer||cur?.layer}
function tabStops(root){
  return [...root.querySelectorAll(FOCUSABLE)].filter(el=>available(el)&&el.tabIndex>=0).sort((a,b)=>(a.tabIndex>0?a.tabIndex:Infinity)-(b.tabIndex>0?b.tabIndex:Infinity));
}
function layerStops(layer){
  return tabStops(layer.wrap).flatMap(el=>{if(el!==layer.f)return [el];try{const children=tabStops(el.contentDocument);return children.length?children:[el]}catch{return [el]}});
}
function bindLayerFrame(layer){
  if(!layer||!layer.active)return;
  try{const d=layer.f.contentDocument;if(!d)return;
    if(layer.doc){layer.doc.removeEventListener("keydown",layer.key,true);layer.doc.removeEventListener("focusin",layer.focus,true)}
    layer.doc=d;d.removeEventListener("keydown",layer.key,true);d.addEventListener("keydown",layer.key,true);
    d.removeEventListener("focusin",layer.focus,true);d.addEventListener("focusin",layer.focus,true);
  }catch{}
}
function exitLayerFullscreen(layer,recover=layer.recoverTop){try{
  const element=document.fullscreenElement;if(!layer.exitPromise&&(!element||!layer.wrap.contains(element)))return;
  // Reuse the native transition if a newer modal opens before it settles.
  if(!layer.exitPromise)layer.exitPromise=Promise.resolve(document.exitFullscreen()).finally(()=>{layer.exitPromise=null});
  layer.exitPromise.then(()=>{if(!document.fullscreenElement)recover?.()}).catch(()=>{});
}catch{}}
/* Persistent palette wrappers may have been background before they became top.
   Release only our oldest recorded inert state, never another owner's original. */
function revealManagedRoot(root){
  if(!root)return;const node=[...document.body.children].find(el=>el===root||el.contains(root));if(!node||node.getAttribute("inert")!=="")return;
  const owner=[cur?.layer,pres?.layer].find(layer=>layer?.active&&layer.background.has(node));if(!owner)return;
  const inert=owner.background.get(node);if(inert===null)node.removeAttribute("inert");else node.setAttribute("inert",inert);
}
function startLayer(owner,dismiss){
  const layer={wrap:owner.wrap,f:owner.f,active:true,background:new Map()};owner.layer=layer;
  const owns=()=>layer.active&&layer.top!==false&&topLayer()===layer&&!layer.wrap.hasAttribute("inert");
  layer.key=e=>{
    if(!owns()||e.defaultPrevented||e.isComposing)return;
    if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();dismiss();return}
    if(e.key!=="Tab"||e.altKey||e.ctrlKey||e.metaKey)return;
    const stops=layerStops(layer),inFrame=e.target?.ownerDocument===layer.doc;
    const active=inFrame?layer.doc.activeElement:document.activeElement;
    let at=stops.indexOf(active);
    // Native print may leave focus on the frame body, outside its tabbable list.
    if(at<0&&inFrame){const first=stops.findIndex(el=>el.ownerDocument===layer.doc);at=first<0?stops.indexOf(layer.f):first-(e.shiftKey?0:1)}
    const next=stops.length?stops[at<0?(e.shiftKey?stops.length-1:0):(at+(e.shiftKey?-1:1)+stops.length)%stops.length]:layer.wrap;
    e.preventDefault();e.stopPropagation();focusOn(next);
  };
  layer.focus=e=>{if(!owns())return;const target=e.target;if(layer.wrap.contains(target)||target?.ownerDocument===layer.doc)return;focusOn(layer.wrap.querySelector('[data-o="close"],[data-p="close"]'))||focusOn(layer.wrap)};
  layer.hide=()=>{if(!owns())return;for(const node of document.body.children){if(node===layer.wrap||(layer.release&&(node===cur?.wrap||node===pres?.wrap)))continue;const current=node.getAttribute("inert");if(layer.background.has(node)&&current!==null&&current!==""&&current!==layer.background.get(node))continue;if(!layer.background.has(node))layer.background.set(node,current);node.setAttribute("inert","")}};
  layer.wrap.setAttribute("tabindex","-1");
  if(SK.modalFocus)layer.release=SK.modalFocus(layer.wrap,null,{managed:true,restore:false,onTopChange:(top,root,recover)=>{
    layer.recoverTop=recover;layer.top=top;if(!layer.active)return;
    if(!top){revealManagedRoot(root);if(owner.session)exitLayerFullscreen(layer)}
    if(!top&&!layer.suspended){layer.suspended={inert:layer.wrap.getAttribute("inert")};layer.wrap.setAttribute("inert","")}
    if(top&&layer.suspended){const {inert}=layer.suspended;delete layer.suspended;if(layer.wrap.getAttribute("inert")===""){if(inert===null)layer.wrap.removeAttribute("inert");else layer.wrap.setAttribute("inert",inert)}}
    if(top&&layer.started)layer.hide();
  }});
  document.addEventListener("keydown",layer.key,true);document.addEventListener("focusin",layer.focus,true);
  layer.f.addEventListener("load",layer.load=()=>bindLayerFrame(layer));bindLayerFrame(layer);
  // Focus before hiding the former opener from the accessibility tree.
  focusOn(layer.wrap.querySelector('[data-o="close"],[data-p="close"]'))||focusOn(layer.wrap);
  layer.started=true;layer.hide();
  if(typeof MutationObserver!=="undefined"){layer.observer=new MutationObserver(layer.hide);layer.observer.observe(document.body,{childList:true})}
  return layer;
}
function stopLayer(layer){
  if(!layer||!layer.active)return;layer.active=false;layer.observer?.disconnect();
  document.removeEventListener("keydown",layer.key,true);document.removeEventListener("focusin",layer.focus,true);
  layer.f.removeEventListener("load",layer.load);
  if(layer.doc){layer.doc.removeEventListener("keydown",layer.key,true);layer.doc.removeEventListener("focusin",layer.focus,true)}
  for(const [node,inert]of layer.background){if(node.getAttribute("inert")!=="")continue;if(inert===null)node.removeAttribute("inert");else node.setAttribute("inert",inert)}
  layer.background.clear();layer.release?.();
}
function restoreFocus(s,reason,ownedFocus){
  if(cur||!ownedFocus||document.hasFocus?.()===false||document.visibilityState==="hidden"||["replacement","navigation","pagehide"].includes(reason))return;
  if(reason==="dismiss"&&s.context!==null&&s.context===focusContext()&&s.opener!==document.body&&s.opener!==document.documentElement&&focusOn(s.opener))return;
  const target=[document.querySelector('#pg-title'),...document.querySelectorAll('#view h1,#view h2,#view [role="status"]'),document.getElementById("view"),...document.querySelectorAll('h1,h2,[role="status"]')].find(available);
  if(!available(target))return;
  const old=target.getAttribute("tabindex");target.setAttribute("tabindex","-1");
  target.addEventListener("blur",()=>{if(old===null)target.removeAttribute("tabindex");else target.setAttribute("tabindex",old)},{once:true});focusOn(target);
}
function notice(s,message){
  if(!live(s))return;const owner=pres?.session===s?pres:s;if(owner.layer?.top===false)return;
  const status=owner.wrap?.querySelector("[data-output-status]");if(status&&status.textContent!==message)status.textContent=message;
}
function live(s){return !!s&&s.active&&(!s.wrap||cur===s)&&!s.w.closed}
function blank(w){try{const d=w.document;if(d.body)d.body.textContent="";if(d.documentElement)d.documentElement.textContent=""}catch{}}
function validSync(s){
  if(!live(s))return false;
  if(!s.guard)return true;
  try{if(s.guard.checkSync()===true)return live(s)}catch{}
  dispose(s,"invalidation");return false;
}
async function valid(s){
  if(!validSync(s))return false;
  try{if(await s.guard.check()!==true){dispose(s,"invalidation");return false}}catch{dispose(s,"invalidation");return false}
  return validSync(s);
}
function bindGuard(s,w){
  let h=s.handles.get(w);
  if(!h){h={print:w.print.bind(w),close:w.close.bind(w)};s.handles.set(w,h);sessions.set(w,s)}
  w.__skRealPrint=()=>{if(w.closed||!validSync(s))return;try{w.focus();h.print()}catch{}};
  if(w!==s.w||!s.wrap)w.print=w.__skRealPrint;
  // This is called only after document.close(), which clears earlier handlers.
  if(h.beforeprint)w.removeEventListener("beforeprint",h.beforeprint);
  h.beforeprint=()=>{if(!validSync(s))blank(w)};
  w.addEventListener("beforeprint",h.beforeprint);
  if(w===s.w&&!s.wrap){
    if(h.pagehide)w.removeEventListener("pagehide",h.pagehide);
    h.pagehide=()=>dispose(s,"pagehide");w.addEventListener("pagehide",h.pagehide);
  }
}
function dispose(s,reason="invalidation"){
  if(!s||!s.active)return;
  const owned=cur===s,focused=document.activeElement,ownedFocus=owned&&(s.wrap?.contains(focused)||pres?.session===s&&pres.wrap.contains(focused));
  // Move out of the child browsing context before removing its focused iframe.
  // Otherwise native frame teardown can make hasFocus() false before restoration.
  if(ownedFocus&&focused?.tagName==="IFRAME"&&document.hasFocus?.()!==false&&document.visibilityState!=="hidden"&&!["replacement","navigation","pagehide"].includes(reason))focusOn(pres?.session===s?pres.wrap:s.wrap);
  s.closeReason=reason;
  s.active=false;clearInterval(s.t);
  if(s.guard){blank(s.w);for(const [w,h]of s.handles){blank(w);if(w!==s.w||!s.wrap)try{h.close()}catch{}}}
  if(pres&&pres.session===s)endPresent(false);
  stopLayer(s.layer);
  if(s.wrap)s.wrap.remove();
  if(cur===s){cur=null;document.documentElement.classList.remove("skout-open")}
  if(s.guard&&typeof s.guard.onClose==="function")try{s.guard.onClose()}catch{}
  if(owned)restoreFocus(s,reason,ownedFocus);
}
function guard(w,g){
  if(!w||w.closed||!g||typeof g.checkSync!=="function"||typeof g.check!=="function")return false;
  let s=sessions.get(w);
  if(s&&(!live(s)||(s.guard&&s.guardSource!==g)))return false;
  if(!s){s={w,active:true,handles:new Map()};sessions.set(w,s)}
  if(!s.guard){s.guardSource=g;s.guard={identity:Object.freeze({...g.identity}),checkSync:g.checkSync,check:g.check,onClose:g.onClose}}
  bindGuard(s,w);if(s.wrap)bindLayerFrame(s.layer);return true;
}
function invalidate(w){const s=sessions.get(w);if(!s||!s.guard)return false;dispose(s);return true}
const slug=t=>String(t||"document").replace(/[^\w؀-ۿ]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"document";
const ascii=t=>"SQC-"+((String(t||"").match(/[A-Za-z0-9]+/g)||[]).join("-").slice(0,30)||(window.SKosifCore&&SKosifCore.view())||"document")+"-"+new Date().toISOString().slice(0,10);
const PAPER_CSS='@media screen{html{background:#dfe4ec!important}body{box-sizing:border-box;width:var(--skout-w,210mm);max-width:calc(100vw - 24px);min-height:var(--skout-h,297mm);margin:18px auto 40px!important;padding:14mm 12mm!important;background:#fff!important;box-shadow:0 14px 40px -12px rgba(11,16,48,.35);border-radius:4px}.skp-bar{display:none!important}}';
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
    '</div></details><span data-output-status role="status" aria-live="polite"></span></div>';
}
function sheet(){
  const focused=document.activeElement,opener=cur&&(cur.wrap.contains(focused)||pres?.wrap.contains(focused))?cur.opener:focused;
  close(cur,"replacement");
  const wrap=document.createElement("div");wrap.className="skout";wrap.setAttribute("role","dialog");wrap.setAttribute("aria-modal","true");wrap.setAttribute("aria-label","معاينة المستند");
  wrap.innerHTML=toolbar(SK.print.options())+'<iframe class="skout-f" title="المستند" data-skout="1"></iframe>';
  document.body.appendChild(wrap);document.documentElement.classList.add("skout-open");
  const f=wrap.querySelector("iframe"),w=f.contentWindow;
  const s={wrap,f,w,opener,context:focusContext(),active:true,handles:new Map()};cur=s;sessions.set(w,s);
  startLayer(s,()=>close(s));
  const patch=()=>{if(!live(s))return;try{if(!w.__skRealPrint){const rp=w.print.bind(w);s.handles.set(w,{print:rp,close:w.close.bind(w)});w.__skRealPrint=()=>{if(!validSync(s))return;try{w.focus();rp()}catch{}}}w.print=()=>{};w.close=()=>close(s,"programmatic");w.__skEmbedded=true;bindLayerFrame(s.layer)}catch{}};
  patch();
  /* documents the core writes without the letterhead still get the paper and the options */
  let ticks=0;const t=setInterval(()=>{ticks++;try{patch();css(w.document);const title=w.document.title||(w.document.querySelector("h1")||{}).textContent||"مستند";wrap.querySelector(".skout-t").textContent=title}catch{}if(ticks>12)clearInterval(t)},250);
  s.t=t;
  return w;
}
function close(s=cur,reason="dismiss"){dispose(s,reason)}
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
/* ---------- presentation mode: the document, one section per slide, full screen ----------
   For a meeting with the client or the audit committee: a title slide (SQC, the document title, the company, the
   date), then one slide per section of the document (split at its h1/h2 headings), each under the SQC mark. The
   slides keep the document's own styles, so its tables look as they do in print. Keys: ← next, → previous (the
   document reads right to left), PageDown/Space next, PageUp previous, Home/End, Esc leaves; swipe on a phone. */
let pres=null;
const PRES_CSS='html,body{margin:0;height:100%;background:#0b1030}body{padding:0!important;width:auto!important;max-width:none!important;min-height:0!important;box-shadow:none!important}'+
  '.sl{display:none;box-sizing:border-box;flex-direction:column;height:100vh;padding:clamp(12px,3vw,40px) clamp(12px,4vw,56px);background:#fff;overflow:auto}.sl.on{display:flex}'+
  '.sl-h{display:flex;align-items:center;gap:12px;padding-bottom:10px;margin-bottom:clamp(10px,2vh,22px);border-bottom:3px solid #2340c4}.sl-h img{height:28px;width:auto}.sl-h span{font:800 14px/1 Montserrat,"Segoe UI",sans-serif;letter-spacing:.08em;color:#0b1030}'+
  '.sl-h b{margin-inline-start:auto;font:700 clamp(15px,2.2vw,24px)/1.3 "IBM Plex Sans Arabic","Segoe UI",sans-serif;color:#0b1030;text-align:end}'+
  '.sl-b{flex:1;font-size:clamp(13px,1.35vw,17px)}.sl-b table{font-size:inherit}.sl-b h1,.sl-b h2{display:none}'+
  '.sl.t{justify-content:center;align-items:center;text-align:center;background:linear-gradient(135deg,#0b1030 0%,#2a3fae 60%,#2340c4 100%);color:#fff}'+
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
function present(session){
  if(!validSync(session))return;
  if(pres)endPresent(false);
  const d=session.w.document,{title,subtitle,slides}=slidesOf(d),base=location.href.replace(/[^/?#]*([?#].*)?$/,""),mark=base+"art/sqc-mark.svg";
  let biz=session.guard?session.guard.identity.name||"":"";if(!session.guard)try{biz=(JSON.parse(localStorage.getItem("aghnam-pricing-v3")||"{}").settings||{}).biz||""}catch{}
  const date=session.guard?session.guard.identity.date||"":new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"});
  const styles=[...d.querySelectorAll("style,link[rel=stylesheet]")].filter(x=>x.id!=="skout-paper"&&x.id!=="skp-opts").map(x=>x.outerHTML).join("");
  const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+styles+'<style>'+PRES_CSS+'</style></head><body>'+
    '<section class="sl t on"><img src="'+mark+'" alt="SQC"><h1>'+esc(title)+'</h1>'+(subtitle?'<p>'+esc(subtitle)+'</p>':biz?'<p>'+esc(biz)+'</p>':'')+'<p>'+esc(date)+'</p></section>'+
    slides.map(s=>'<section class="sl"><header class="sl-h"><img src="'+mark+'" alt=""><span>SQC</span><b>'+esc(s.h)+'</b></header><div class="sl-b">'+s.nodes.map(n=>n.outerHTML).join("")+'</div></section>').join("")+'</body></html>';
  const wrap=document.createElement("div");wrap.className="skpres";wrap.setAttribute("role","dialog");wrap.setAttribute("aria-modal","true");wrap.setAttribute("aria-label","عرض تقديمي: "+title);
  wrap.innerHTML='<iframe class="skpres-f" title="'+esc(title)+'"></iframe><div class="skpres-bar"><button type="button" class="btn sm" data-p="prev" aria-label="الشريحة السابقة">→</button>'+
    '<span class="skpres-n" aria-live="polite"></span><button type="button" class="btn sm" data-p="next" aria-label="الشريحة التالية">←</button><button type="button" class="btn sm" data-p="close" aria-label="إنهاء العرض">إنهاء</button><span data-output-status role="status" aria-live="polite"></span></div>';
  if(session.guard&&!validSync(session))return;
  document.body.appendChild(wrap);
  const f=wrap.querySelector("iframe");f.srcdoc=html;
  const presentation={wrap,f,i:0,n:slides.length+1,session};pres=presentation;
  startLayer(presentation,()=>endPresent());
  const key=e=>{if(pres!==presentation||presentation.layer.top===false||!validSync(session))return;const k=e.key;
    if(k==="Escape"||k==="Tab"||e.defaultPrevented||e.target?.closest?.('button,a[href],input,select,textarea,summary,[contenteditable="true"]'))return;
    if(k==="ArrowLeft"||k==="PageDown"||k===" "){e.preventDefault();go(pres.i+1)}else if(k==="ArrowRight"||k==="PageUp"){e.preventDefault();go(pres.i-1)}
    else if(k==="Home"){e.preventDefault();go(0)}else if(k==="End"){e.preventDefault();go(pres.n-1)}};
  pres.key=key;document.addEventListener("keydown",key,true);
  f.addEventListener("load",()=>{const fd=f.contentDocument;if(pres!==presentation||!validSync(session)){blank(f.contentWindow);return}if(!fd)return;bindLayerFrame(presentation.layer);if(session.guard)bindGuard(session,f.contentWindow);fd.addEventListener("keydown",key,true);
    let x0=null;fd.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
    fd.addEventListener("touchend",e=>{if(x0==null||pres!==presentation||!validSync(session))return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)go(pres.i+(dx>0?1:-1))},{passive:true});
    go(0);});
  try{wrap.requestFullscreen&&wrap.requestFullscreen().then(()=>{if(pres!==presentation||presentation.layer.top===false)exitLayerFullscreen(presentation.layer)}).catch(()=>{})}catch{}
  SK.audit&&SK.audit.log("report",{act:"present",title:title.slice(0,60)});
}
function go(i){
  if(!pres||!validSync(pres.session))return;pres.i=Math.max(0,Math.min(pres.n-1,i));
  const fd=pres.f.contentDocument;if(fd)[...fd.querySelectorAll(".sl")].forEach((s,k)=>{s.classList.toggle("on",k===pres.i);if(k===pres.i)s.scrollTop=0});
  pres.wrap.querySelector(".skpres-n").textContent=(pres.i+1)+" من "+pres.n;
  pres.wrap.querySelector('[data-p="prev"]').disabled=pres.i===0;pres.wrap.querySelector('[data-p="next"]').disabled=pres.i===pres.n-1;
}
function endPresent(restore=true){
  if(!pres)return;const ended=pres;document.removeEventListener("keydown",pres.key,true);
  stopLayer(pres.layer);
  if(pres.session.guard)blank(pres.f.contentWindow);
  exitLayerFullscreen(ended.layer,cur?.layer?.recoverTop);
  pres.wrap.remove();pres=null;
  if(cur?.active)cur.layer?.hide();
  if(restore&&cur===ended.session&&live(cur)){const b=cur.wrap.querySelector('[data-o="present"]');focusOn(b)||focusOn(cur.wrap)}
}
document.addEventListener("click",e=>{const b=e.target.closest(".skpres [data-p]");if(!b||!pres)return;const p=b.dataset.p;if(p==="close")endPresent();else go(pres.i+(p==="next"?1:-1))});
async function act(a){
  if(!cur)return;const session=cur;
  if(a==="close")return close(session);
  if(session.guard&&!await valid(session))return;
  if(!live(session))return;
  const d=session.w.document,title=(d.title||"مستند").trim();
  const filename=session.guard?String(session.guard.identity.fileStem||("SQC-"+slug(session.guard.identity.name))).replace(/[\\/:*?"<>|\u0000-\u001f]/g,"-").slice(0,160):ascii(title);
  if(a==="present")return present(session);
  if(a==="print"){css(d);session.w.__skRealPrint?session.w.__skRealPrint():session.w.print();SK.audit&&SK.audit.log("report",{act:"print",title:title.slice(0,60)});return}
  if(a==="word"){const html=docHTML(d).replace("<html",'<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"').replace("<head>",'<head><meta charset="utf-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>body{direction:rtl}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 6px}</style>');
    const blob=new Blob(["﻿"+html],{type:"application/msword"});if(session.guard&&!validSync(session))return;SK.download(filename+".doc",blob);SK.audit&&SK.audit.log("report",{act:"word"});return}
  if(a==="excel"){const t=tablesOf(d);if(!t.length)return notice(session,"لا توجد جداول في هذا المستند");const blob=SKXlsx.book(t);if(session.guard&&!validSync(session))return;SK.download(filename+".xlsx",blob);notice(session,"صُدّر "+t.length+" جدولاً إلى Excel");SK.audit&&SK.audit.log("report",{act:"excel",tables:t.length});return}
  if(a==="html"){const blob=new Blob([docHTML(d)],{type:"text/html;charset=utf-8"});if(session.guard&&!validSync(session))return;SK.download(filename+".html",blob);return}
  if(a==="share"){try{const file=new File([docHTML(d)],(session.guard?filename:slug(title))+".html",{type:"text/html"});const fullFile=navigator.canShare&&navigator.canShare({files:[file]});
    if(session.guard){if(!validSync(session))return;if(!fullFile)return notice(session,"لم تتم المشاركة: الجهاز لا يدعم مشاركة ملف المسودة كاملاً. استخدم تنزيل HTML.")}
    if(fullFile)await navigator.share({files:[file],title});else await navigator.share({title,text:d.body.innerText.slice(0,3000)})}catch{}return}
  if(a==="window"){const html=docHTML(d);if(session.guard&&!validSync(session))return;const w=realOpen("","_blank");if(!w)return notice(session,"اسمح بالنوافذ المنبثقة");if(session.guard&&!validSync(session)){w.close();return}w.document.open();w.document.write(html);w.document.close();if(session.guard)bindGuard(session,w)}
}
document.addEventListener("click",e=>{const b=e.target.closest(".skout [data-o]");if(b)act(b.dataset.o)});
document.addEventListener("change",e=>{
  if(!cur||!e.target.closest(".skout-bar"))return;const el=e.target;
  if(el.hasAttribute("data-z")){cur.f.style.setProperty("--z",el.value);return}
  const k=el.dataset.k;if(!k)return;SK.print.set(k,el.type==="checkbox"?el.checked:k==="scale"?Number(el.value):el.value);css(cur.w.document);
});
document.addEventListener("input",e=>{if(cur&&e.target.dataset&&e.target.dataset.k==="wm"&&e.target.closest(".skout-bar")){SK.print.set("wm",e.target.value.slice(0,24));css(cur.w.document)}});

/* moving to another screen closes the preview */
addEventListener("sk:nav",()=>close(cur,"navigation"));
addEventListener("pagehide",()=>close(cur,"pagehide"));
addEventListener("beforeprint",()=>{if(cur&&cur.guard)validSync(cur)});
/* a blank window.open() (every print in the app) becomes the in-app preview */
window.open=function(url,target,features){
  const u=url==null?"":String(url);
  if((u===""||u==="about:blank")&&document.body&&SK.print.options().preview!==false)return sheet();
  return realOpen(url,target,features);
};
SK.output=Object.freeze({open:sheet,close,guard,invalidate,css,tables:tablesOf,embedded:w=>!!(w&&w.__skEmbedded)});
})();

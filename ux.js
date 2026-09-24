/* S.kosif V32 — Sinam-inspired Window & Privacy Experience
   Additive UI layer: window chrome, command palette, offline/PWA status,
   Jev privacy guard, safe CSV helpers. Does not own business data. */
(()=>{
  "use strict";
  if(window.SKosifUX) return;

  const VERSION="32.0";
  const PREF="skosif_v32_";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const mobile=()=>matchMedia("(max-width:760px)").matches || ("ontouchstart" in window && innerWidth<900);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

  /* ---------- toast ---------- */
  function toast(msg){
    let el=$("#sx-toast");
    if(!el){document.body.insertAdjacentHTML("beforeend",'<div id="sx-toast" class="sx-toast"></div>');el=$("#sx-toast")}
    el.textContent=msg;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),2800);
  }

  /* ---------- Privacy / Zero-PII guard for Jev ---------- */
  function redact(text){
    let s=String(text??"");
    s=s.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/gi,"[IBAN REDACTED]");
    s=s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[EMAIL REDACTED]");
    s=s.replace(/(?:\+?966[\s-]?[5]\d|05\d)(?:[\s-]?\d){7,8}\b/g,"[PHONE REDACTED]");
    s=s.replace(/\b(?:\d[\s-]?){10,15}\b/g,"[ID/PHONE REDACTED]");
    return s;
  }
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    try{
      const url=typeof input==="string"?input:(input&&input.url)||"";
      if(/aghnam-jev-api\..*\/api\/jev/i.test(url) && init && typeof init.body==="string"){
        const data=JSON.parse(init.body);
        if(typeof data.state==="string") data.state=redact(data.state);
        init={...init,body:JSON.stringify(data)};
      }
    }catch{}
    return nativeFetch(input,init);
  };
  function privacyUI(){
    const checkedDefault=localStorage.getItem(PREF+"jev_screen_optin")==="1";
    [
      ["jev-use-screen","استخدام بيانات الشاشة"],
      ["jev-ask-screen","استخدام بيانات الشاشة"]
    ].forEach(([id])=>{
      const cb=document.getElementById(id);
      if(!cb||cb.dataset.sxPrivacy==="1")return;
      cb.dataset.sxPrivacy="1";
      if(!checkedDefault) cb.checked=false;
      cb.addEventListener("change",()=>localStorage.setItem(PREF+"jev_screen_optin",cb.checked?"1":"0"));
      const host=cb.closest("label")||cb.parentElement;
      if(host&&!host.querySelector(".sx-privacy-note")){
        host.insertAdjacentHTML("afterend",'<div class="sx-privacy-note">🛡️ Zero‑PII Guard: الجوالات والبريد وIBAN والأرقام الحساسة تُحجب قبل الإرسال. بيانات الشاشة غير مفعّلة افتراضيًا.</div>');
      }
    });
  }

  /* ---------- Safe CSV foundation ---------- */
  function safeCell(v){
    let s=v==null?"":String(v);
    if(/^[=+\-@\t\r]/.test(s)) s="'"+s;
    if(/[",\n\r]/.test(s)) s='"'+s.replace(/"/g,'""')+'"';
    return s;
  }
  function csv(headers,rows){
    return "\uFEFF"+[headers,...rows].map(r=>r.map(safeCell).join(",")).join("\r\n");
  }
  function downloadCsv(filename,headers,rows){
    const blob=new Blob([csv(headers,rows)],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename.endsWith(".csv")?filename:filename+".csv";a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  window.SKosifSafeCSV=Object.freeze({cell:safeCell,build:csv,download:downloadCsv});

  /* ---------- Window manager ---------- */
  const defs=[
    {id:"sk-modal",panel:".sk-panel",head:".sk-head",title:"S.kosif"},
    {id:"jev-modal",panel:".jev-panel",head:".jev-head",title:"Jev"},
    {id:"v29-modal",panel:".v29-panel",head:".v29-head",title:"V29"}
  ];
  const minimized=new Map();
  function ensureTaskbar(){ return; }
  function minimizedRender(){
    ensureTaskbar();
    const host=$("#sx-minimized");
    host.innerHTML=[...minimized.values()].map(w=>'<button type="button" data-sx-restore="'+w.id+'">'+esc(w.title)+'</button>').join("");
    $$("[data-sx-restore]",host).forEach(b=>b.onclick=()=>restore(b.dataset.sxRestore));
  }
  function minimize(def,backdrop,panel){
    backdrop.classList.add("sx-minimized-host");
    minimized.set(def.id,def);
    minimizedRender();
  }
  function restore(id){
    const def=defs.find(x=>x.id===id);if(!def)return;
    const backdrop=document.getElementById(id);if(!backdrop)return;
    backdrop.classList.remove("sx-minimized-host");
    minimized.delete(id);minimizedRender();
  }
  function toggleMax(panel,btn){
    const on=panel.classList.toggle("sx-maximized");
    if(on){
      panel.classList.remove("sx-floating");
      panel.style.left=panel.style.top="";
    }
    btn.textContent=on?"❐":"□";
    btn.title=on?"استعادة الحجم":"تكبير";
  }
  function windowify(def){
    const backdrop=document.getElementById(def.id);if(!backdrop)return;
    const panel=$(def.panel,backdrop),head=$(def.head,backdrop);
    if(!panel||!head||panel.dataset.sxWindow==="1")return;
    panel.dataset.sxWindow="1";panel.classList.add("sx-windowed");head.classList.add("sx-titlebar");
    const controls=document.createElement("div");
    controls.className="sx-window-controls";
    controls.innerHTML='<button type="button" data-sx-max title="تكبير">□</button>';
    const close=head.lastElementChild;
    if(close&&close.tagName==="BUTTON")head.insertBefore(controls,close);else head.appendChild(controls);
    const max=$("[data-sx-max]",controls);max.onclick=e=>{e.stopPropagation();toggleMax(panel,max)};
    head.addEventListener("dblclick",e=>{if(!mobile()&&!e.target.closest("button,input,select,textarea"))toggleMax(panel,max)});
    let drag=null;
    head.addEventListener("pointerdown",e=>{
      if(mobile()||panel.classList.contains("sx-maximized")||e.target.closest("button,input,select,textarea"))return;
      const r=panel.getBoundingClientRect();
      drag={dx:e.clientX-r.left,dy:e.clientY-r.top};
      panel.classList.add("sx-floating");panel.style.left=r.left+"px";panel.style.top=r.top+"px";
      head.setPointerCapture?.(e.pointerId);
    });
    head.addEventListener("pointermove",e=>{
      if(!drag)return;
      const w=panel.offsetWidth,h=panel.offsetHeight;
      const left=Math.max(6,Math.min(innerWidth-w-6,e.clientX-drag.dx));
      const top=Math.max(6,Math.min(innerHeight-Math.min(h,innerHeight-12)-6,e.clientY-drag.dy));
      panel.style.left=left+"px";panel.style.top=top+"px";
    });
    const stop=()=>drag=null;
    head.addEventListener("pointerup",stop);head.addEventListener("pointercancel",stop);
  }
  function scanWindows(){defs.forEach(windowify);privacyUI()}

  /* ---------- Command palette ---------- */
  const commands=[
    ["المركز التنفيذي","S.kosif Command Center","⌂",()=>window.SKosif?.open?.("overview")],
    ["الكتالوج ومختارات الذواقة","Gourmet Catalog & Offers","▦",()=>window.SKosifCatalog?.open?.()],
    ["سلة الطلبيات وعروض الأسعار","Order & Quotation Cart","🛒",()=>{window.SKosifCatalog?.open?.();setTimeout(()=>document.getElementById("k32-open-cart-bar")?.click(),250)}],
    ["تصدير الكتالوج إكسل (CSV)","Export Catalog to Excel","📊",()=>window.SKosifCatalog?.exportCatalogCSV?.()],
    ["التسعير السريع","Quick Pricing","ر.س",()=>window.SKosif?.open?.("pricing")],
    ["العملاء 360","Customer 360","◎",()=>window.SKosif?.open?.("customers")],
    ["اعتماد الأسعار","Price Governance","✓",()=>window.SKosif?.open?.("approvals")],
    ["التقارير","Executive Reports","▤",()=>window.SKosif?.open?.("reports")],
    ["صحة البيانات","Health & Diagnostics","◇",()=>window.SKosif?.open?.("health")],
    ["الموردون والهدر","Supplier Performance","♢",()=>window.SKosifSupply?.open?.("suppliers")],
    ["السيولة الشهرية","Cash Flow","◒",()=>window.SKosifSupply?.open?.("cash")],
    ["اسأل Jev","Decision Assistant","J",()=>window.AskJev?.open?.("noul")],
    ["Jev اختيارات متعددة","Decision Choice","J",()=>window.AskJev?.open?.("choice")],
    ["المخزون الذكي","Inventory","▦",()=>{window.SKosifInventory?.open?.();setTimeout(()=>document.querySelector('[data-v29-tab="inventory"]')?.click(),80)}],
    ["ذكاء المبيعات","ABC / RFM / Pareto","↗",()=>window.SKosif?.openModule?.("sales")],
    ["اقتصاديات الطلب","Order Economics","Σ",()=>window.SKosif?.openModule?.("economics")],
    ["هندسة البوكسات","Box Engineering","▦",()=>window.SKosif?.openModule?.("boxes")],
    ["المطابقة","Reconciliation","≋",()=>window.SKosif?.openModule?.("recon")],
    ["الهندسة المالية","Financial Engineering","ƒ",()=>window.SKosif?.openModule?.("finance")],
    ["NRV وتفكيك الذبيحة","NRV","⚖",()=>window.SKosif?.openModule?.("nrv")]
  ];
  let paletteOpen=false;
  function ensurePalette(){
    if($("#sx-palette"))return;
    document.body.insertAdjacentHTML("beforeend",[
      '<div id="sx-palette" class="sx-palette" aria-hidden="true"><div class="sx-palette-card" role="dialog" aria-modal="true">',
      '<div class="sx-palette-search"><span>⌕</span><input id="sx-q" type="search" autocomplete="off" placeholder="ابحث في S.kosif…"><kbd>ESC</kbd></div>',
      '<div id="sx-results" class="sx-results"></div>',
      '<footer><span>↑↓ للتنقل · Enter للفتح</span><span>S.kosif</span></footer>',
      '</div></div>'
    ].join(""));
    $("#sx-palette").onclick=e=>{if(e.target===$("#sx-palette"))closePalette()};
    $("#sx-q").addEventListener("input",renderCommands);
    $("#sx-q").addEventListener("keydown",paletteKeys);
  }
  function renderCommands(){
    const q=($("#sx-q")?.value||"").trim().toLowerCase();
    const list=commands.filter(c=>(c[0]+" "+c[1]).toLowerCase().includes(q));
    const host=$("#sx-results");if(!host)return;
    host.innerHTML=list.map((c,i)=>'<button type="button" data-sx-cmd="'+commands.indexOf(c)+'" class="'+(i===0?"active":"")+'"><i>'+esc(c[2])+'</i><span><b>'+esc(c[0])+'</b><small>'+esc(c[1])+'</small></span><em>↵</em></button>').join("")||'<div class="sx-no-results">لا توجد نتيجة مطابقة.</div>';
    $$("[data-sx-cmd]",host).forEach(b=>b.onclick=()=>runCommand(Number(b.dataset.sxCmd)));
  }
  function paletteKeys(e){
    const items=$$("[data-sx-cmd]",$("#sx-results"));if(!items.length)return;
    let i=items.findIndex(x=>x.classList.contains("active"));if(i<0)i=0;
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      e.preventDefault();items[i].classList.remove("active");i=(i+(e.key==="ArrowDown"?1:-1)+items.length)%items.length;items[i].classList.add("active");items[i].scrollIntoView({block:"nearest"});
    }else if(e.key==="Enter"){e.preventDefault();items[i].click()}
  }
  function runCommand(i){const c=commands[i];if(!c)return;closePalette();try{c[3]()}catch{toast("تعذر فتح الوحدة الآن.")}}
  function openPalette(){
    ensurePalette();paletteOpen=true;$("#sx-palette").classList.add("open");$("#sx-palette").setAttribute("aria-hidden","false");$("#sx-q").value="";renderCommands();setTimeout(()=>$("#sx-q")?.focus(),20);
  }
  function closePalette(){paletteOpen=false;$("#sx-palette")?.classList.remove("open");$("#sx-palette")?.setAttribute("aria-hidden","true")}
  document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();paletteOpen?closePalette():openPalette()}
    if(e.key==="Escape"&&paletteOpen)closePalette();
  });

  /* ---------- Online/offline + install ---------- */
  let deferredInstall=null;
  function updateNetwork(){
    const b=$("#sx-net");if(!b)return;
    b.classList.toggle("offline",!navigator.onLine);
    const span=$("span",b);if(span)span.textContent=navigator.onLine?"متصل":"دون اتصال";
  }
  addEventListener("online",updateNetwork);addEventListener("offline",updateNetwork);
  addEventListener("beforeinstallprompt",e=>{
    e.preventDefault();deferredInstall=e;const b=$("#sx-install");if(b)b.hidden=false;
  });
  addEventListener("appinstalled",()=>{deferredInstall=null;const b=$("#sx-install");if(b)b.hidden=true;toast("تم تثبيت S.kosif كتطبيق.")});
  async function installPWA(){
    if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("#sx-install").hidden=true;return}
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
    if(ios&&!standalone)alert("لتثبيت S.kosif على الآيفون:\n1) افتح في Safari\n2) اضغط مشاركة\n3) اختر «إضافة إلى الشاشة الرئيسية»");
    else toast("إذا لم يظهر زر التثبيت، استخدم خيار إضافة التطبيق/الشاشة الرئيسية من المتصفح.");
  }

  /* ---------- boot ---------- */
  function boot(){
    ensureTaskbar();ensurePalette();scanWindows();updateNetwork();
    const mo=new MutationObserver(()=>scanWindows());mo.observe(document.documentElement,{childList:true,subtree:true});
    window.SKosifUX=Object.freeze({
      version:VERSION,
      openCommandPalette:openPalette,
      redact,
      safeCSV:window.SKosifSafeCSV,
      scanWindows
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
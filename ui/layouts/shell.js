/* S.kosif layout — the app shell (window.SKosifShell).
   Paints the rail from the capability registry (one source of truth), filtered by role and by
   the daily/advanced switch; keeps the topbar title, breadcrumb and search in sync; owns the
   appearance preferences, the phone drawer (with an edge swipe) and its bottom tab bar (the user
   picks its screens), the laptop's compact rail, the installed-window title bar, the offline
   notice, the update notice and the no-permission state. The core calls SKosifShell.paint()
   after every chrome paint. */
(()=>{
"use strict";
const {$,$$,esc,load,save}=SK;
const core=()=>window.SKosifCore;
const PREF_KEY="skosif_prefs";
const ADV_NOTE="الأدوات المتقدمة ظاهرة داخل كل مجال — أخفها من «التشغيل اليومي».";

/* ---------- preferences: theme (look) + density ----------
   look: kosif (default, the adopted KOSIF identity) | kosif-night | heritage | heritage-night | executive | audit | midnight | notebook | auto */
const LOOKS=[
  ["kosif","SQC","الهوية المعتمدة: شريط كحلي وأزرق SQC وبطاقات بيضاء وحلقات تقدّم",["#f3f6fb","#0c2340","#1668e3","#1fb6e0"]],
  ["kosif-night","SQC الليلي","نفس الهوية بإضاءة ليلية",["#0a1628","#071427","#4a93ff","#3fd0f0"]],
  ["heritage","تراث الوادي","الهوية الافتراضية: رَقّ وحبر بني ورسوم الوادي",["#f4ead8","#8a5a2b","#efe2cc","#2b1a0f"]],
  ["heritage-night","ليل الوادي","نفس الهوية بإضاءة ليلية",["#16110c","#d09a5e","#201811","#f4ead8"]],
  ["executive","التنفيذي","مساحة فاتحة، بنفسجي وأزرق، أرقام قوية",["#f5f6fb","#5b4ee6","#3d7bf5","#1d2340"]],
  ["audit","المراجعة الاحترافية","كثيف ورصين للجداول والأدلة",["#f3f4f6","#1f3b68","#172235","#161b26"]],
  ["midnight","ليل التحليل","داكن للوحات والجلسات الطويلة",["#0d1117","#7c8cff","#4fd1c5","#e8edf5"]],
  ["notebook","الدفتر","ورق مسطّر وعناوين بخط اليد",["#f7f3e8","#2c5aa0","#c0392b","#23252b"]],
  ["aurora","الشفق","زجاج شفاف فوق شفق ناعم — روح أجمل أنظمة الحاسب",["#eef2f9","#ffffff","#0a66ff","#7b61ff"],"pro"],
  ["aurora-night","الشفق الليلي","الزجاج نفسه على سماء ليلية",["#0a0c13","#141824","#5b95ff","#a18cff"],"pro"],
  ["vivid","النابض","ألوان لوحة تحليل المبيعات: نيلي وسماوي ووردي وخط تجوّل",["#f8fafc","#ffffff","#6366f1","#ec4899"],"pro"],
  ["vivid-night","النابض الليلي","النيلي والسماوي على ليل عميق",["#0f1124","#131630","#818cf8","#22d3ee"],"pro"],
  ["oasis","الواحة","رمل ومريمية وطين — فخامة محلية هادئة",["#f6f1e7","#2e4a3a","#3b6a4e","#c2703d"],"pro"],
  ["oasis-night","الواحة الليلي","الواحة في ليل الصحراء",["#141915","#101511","#86b896","#e59a63"],"pro"],
  ["graphite","الجرافيت","داكن مركّز بخطوط دقيقة — للعمل الطويل",["#0e0f12","#0b0c0f","#8183ff","#5ee0c4"],"pro"],
  ["onyx","العقيق","أسود وذهبي وعناوين بخط النسخ — فخامة المصارف الخاصة",["#0b0b0c","#080808","#d4af5a","#f4efe4"],"pro"],
  ["auto","حسب الجهاز","ثيمك المختار نهاراً ونسخته الليلية ليلاً",["#f3f6fb","#1668e3","#0a1628","#3fd0f0"]]];
const DARK=new Set(["kosif-night","heritage-night","midnight","aurora-night","vivid-night","oasis-night","graphite","onyx"]);
const NIGHT={kosif:"kosif-night",heritage:"heritage-night",aurora:"aurora-night",vivid:"vivid-night",oasis:"oasis-night"};
function prefs(){return Object.assign({look:"kosif",density:"cozy",lastLight:"kosif",rail:"full",font:"theme",scale:1,radius:"theme",accent:"",contrast:false},load(PREF_KEY,{}))}
/* ---------- theme studio: typeface, text size, accent colour, corners, contrast ----------
   applied on top of any look as inline tokens on <html>, so every screen, chart and print follows */
const FONTS=[
  ["theme","حسب الثيم","",""],
  ["plex","IBM Plex Sans Arabic","IBM+Plex+Sans+Arabic:wght@400;500;600;700",'"IBM Plex Sans Arabic"'],
  ["tajawal","تجوّل Tajawal","Tajawal:wght@400;500;700;800",'"Tajawal"'],
  ["cairo","القاهرة Cairo","Cairo:wght@400;500;600;700;800",'"Cairo"'],
  ["almarai","المراعي Almarai","Almarai:wght@400;700;800",'"Almarai"'],
  ["kufi","نوتو كوفي Noto Kufi","Noto+Kufi+Arabic:wght@400;500;600;700;800",'"Noto Kufi Arabic"'],
  ["readex","ريدكس Readex Pro","Readex+Pro:wght@400;500;600;700",'"Readex Pro"'],
  ["naskh","نسخ Noto Naskh","Noto+Naskh+Arabic:wght@400;500;600;700",'"Noto Naskh Arabic"'],
  ["system","خط الجهاز","",'system-ui']];
const FALLBACK=',-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,sans-serif';
const ACCENTS=[["","حسب الثيم"],["#1668e3","أزرق SQC"],["#0f9d6c","زمردي"],["#006c35","أخضر وطني"],["#0e8a9a","فيروزي"],["#6b4ee6","ملكي"],["#c2410c","عنبري"],["#b8862b","ذهبي"],["#d0343f","قرمزي"],["#3b4a5e","فحمي"]];
const hexRgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(String(h||"").trim());if(!m)return null;const n=parseInt(m[1],16);return[n>>16&255,n>>8&255,n&255]};
const rgbHex=c=>"#"+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
/* the brand steps for a chosen accent: readable on the surface, white or ink on the button */
function accentTokens(hex,dark,surface){
  let c=hexRgb(hex);if(!c)return null;const W=[255,255,255],K=[0,0,0],sf=hexRgb(surface)||(dark?[15,32,57]:W);
  if(dark){let t=0;while(contrast(c,sf)<4&&t<.9){t+=.08;c=mix(hexRgb(hex),W,t)}}
  else{let t=0;while(contrast(c,sf)<3&&t<.9){t+=.08;c=mix(hexRgb(hex),K,t)}}
  const on=contrast(c,W)>=3.2&&!dark?"#ffffff":(contrast(c,[6,16,31])>=4.5?"#06101f":"#ffffff");
  const b2=mix(c,dark?W:W,dark?.25:.32),deep=mix(hexRgb(hex),[11,31,58],.55);
  return{"--sk-brand":rgbHex(c),"--sk-brand-2":rgbHex(b2),"--sk-on-brand":on,"--sk-focus":rgbHex(c),"--sk-info":rgbHex(c),"--sk-s2":rgbHex(c),
    "--sk-brand-soft":"color-mix(in srgb,"+rgbHex(c)+" "+(dark?"22%":"11%")+",var(--sk-surface))","--sk-info-soft":"color-mix(in srgb,"+rgbHex(c)+" "+(dark?"22%":"11%")+",var(--sk-surface))",
    "--sk-grad-brand":"linear-gradient(135deg,"+rgbHex(b2)+" 0%,"+rgbHex(c)+" 55%,"+rgbHex(deep)+" 100%)","--sk-rail-active":"color-mix(in srgb,"+rgbHex(b2)+" 16%,transparent)"};
}
const RADII={sharp:{"--sk-r-s":"4px","--sk-r":"6px","--sk-r-l":"8px"},round:{"--sk-r-s":"12px","--sk-r":"16px","--sk-r-l":"22px"}};
const STUDIO_VARS=["--sk-font","--sk-font-display","--sk-brand","--sk-brand-2","--sk-on-brand","--sk-focus","--sk-info","--sk-s2","--sk-brand-soft","--sk-info-soft","--sk-grad-brand","--sk-rail-active","--sk-r-s","--sk-r","--sk-r-l","--sk-zoom"];
function loadFont(id){
  const f=FONTS.find(x=>x[0]===id);if(!f||!f[2]||document.getElementById("sk-font-"+id))return;
  const l=document.createElement("link");l.id="sk-font-"+id;l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family="+f[2]+"&display=swap";document.head.appendChild(l);
}
function applyStudio(de,p,mode){
  STUDIO_VARS.forEach(v=>de.style.removeProperty(v));
  const f=FONTS.find(x=>x[0]===p.font);
  if(f&&f[3]){loadFont(f[0]);const stack=f[3]+FALLBACK;de.style.setProperty("--sk-font",stack);de.style.setProperty("--sk-font-display",stack)}
  if(p.accent){const sf=getComputedStyle(de).getPropertyValue("--sk-surface").trim(),t=accentTokens(p.accent,mode==="dark",sf);if(t)Object.entries(t).forEach(([k,v])=>de.style.setProperty(k,v))}
  if(RADII[p.radius])Object.entries(RADII[p.radius]).forEach(([k,v])=>de.style.setProperty(k,v));
  const z=Number(p.scale);if(z&&z!==1)de.style.setProperty("--sk-zoom",String(z));
  de.toggleAttribute("data-contrast",!!p.contrast);
}
function migrate(){
  const p=load(PREF_KEY,null);
  /* v2: the KOSIF identity replaces «تراث الوادي» as the default; a deliberately chosen other theme is kept */
  if(p&&p.migrated&&p.look){if(!p.kosif){if(p.look==="heritage")p.look="kosif";else if(p.look==="heritage-night")p.look="kosif-night";if(p.lastLight==="heritage")p.lastLight="kosif";p.kosif=1;save(PREF_KEY,p)}return}
  const out=Object.assign({look:"kosif",density:"cozy",migrated:1,kosif:1},p||{});
  try{
    if(!out.look||out.appearance){out.look=out.appearance==="dark"?"kosif-night":out.appearance==="auto"?"auto":"kosif";delete out.appearance}
    if(!p){
      const oldTheme=load("skosif_theme",""),dark=["royal","notte","cyber"].includes(oldTheme),v12=localStorage.getItem("aghnam-v12-theme");
      out.look=dark||(!oldTheme&&v12==="dark")?"kosif-night":"kosif";
      if(localStorage.getItem("aghnam-v21-density")==="compact")out.density="compact";
    }
    ["skosif_theme","skosif_theme_dark","skosif_theme_light","aghnam-v21-accent","aghnam-v21-density","aghnam-v21-tour","aghnam-v21-whatsnew","aghnam-v21-ux-v1","aghnam-v203-magic-v1"].forEach(k=>localStorage.removeItem(k));
  }catch{}
  save(PREF_KEY,out);
}
const mq=matchMedia("(prefers-color-scheme: dark)");
/* «حسب الجهاز» follows the family of the last light look chosen (KOSIF by default) */
function lookNow(){const p=prefs(),l=p.look;if(l==="auto"){const day=LOOKS.some(x=>x[0]===p.lastLight)&&!DARK.has(p.lastLight)?p.lastLight:"kosif";return mq.matches?(NIGHT[day]||"kosif-night"):day}return LOOKS.some(x=>x[0]===l)?l:"kosif"}
function resolved(){return DARK.has(lookNow())?"dark":"light"}
const LOOK_FONTS={vivid:"Tajawal:wght@400;500;700;800",oasis:"Readex+Pro:wght@400;500;600;700",onyx:"Noto+Naskh+Arabic:wght@500;700"};
function fonts(look){
  const fam=look.replace(/-night$/,"");if(LOOK_FONTS[fam]&&!document.getElementById("sk-font-look-"+fam)){const l=document.createElement("link");l.id="sk-font-look-"+fam;l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family="+LOOK_FONTS[fam]+"&display=swap";document.head.appendChild(l)}
  if(look.startsWith("heritage")||document.getElementById("sk-font-plex"))return;
  const l=document.createElement("link");l.id="sk-font-plex";l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap";document.head.appendChild(l);
}
function applyPrefs(){
  const de=document.documentElement,look=lookNow(),mode=resolved(),p=prefs();
  de.setAttribute("data-look",look.replace(/-night$/,""));
  de.setAttribute("data-theme",mode);de.setAttribute("data-density",p.density==="compact"?"compact":"cozy");
  de.setAttribute("data-rail",p.rail==="mini"?"mini":"full");
  fonts(look);
  applyStudio(de,p,mode);
  try{localStorage.setItem("aghnam-v12-theme",mode)}catch{}
  const bar=getComputedStyle(de).getPropertyValue("--sk-rail").trim()||(mode==="dark"?"#1b140e":"#efe2cc");
  $$('meta[name="theme-color"]').forEach(m=>m.setAttribute("content",bar));
}
function setPref(k,v){const p=prefs();p[k]=v;save(PREF_KEY,p);applyPrefs()}
function setLook(l){const p=prefs();if(!LOOKS.some(x=>x[0]===l))l="kosif";p.look=l;if(!DARK.has(l)&&l!=="auto")p.lastLight=l;save(PREF_KEY,p);
  /* one smooth cross-fade where the browser supports view transitions */
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;if(document.startViewTransition&&!reduce)document.startViewTransition(()=>applyPrefs());else applyPrefs();SK.toast("المظهر: "+LOOKS.find(x=>x[0]===l)[1],"info")}
/* the topbar moon button: light look ↔ its night counterpart */
function toggleAppearance(){const cur=lookNow(),p=prefs();if(DARK.has(cur))setLook(p.lastLight||"kosif");else setLook(NIGHT[cur]||"midnight")}
const setAppearance=a=>setLook(a==="dark"?"kosif-night":a==="auto"?"auto":"kosif");
mq.addEventListener&&mq.addEventListener("change",()=>{if(prefs().look==="auto")applyPrefs()});
migrate();applyPrefs();

/* ---------- rail ---------- */
/* one entry per hub: it opens the first page the role may see, and stays current on every page of the hub */
function navButton(c,cur,pages){
  const go=pages[0],on=pages.some(x=>x.id===cur);
  const icon=SK.icons[c.id]||(core()&&core().navIcon(c.id))||SK.icons.action;
  const badge=core()?core().navBadge(go.id):"";
  const more=pages.length>1?'<i class="skn-hubn" title="'+pages.length+' صفحات">'+pages.length+'</i>':"";
  return '<button type="button" class="nav-btn" data-act="nav" data-v="'+go.id+'" data-hub="'+c.id+'" title="'+esc(c.hubLabel)+'"'+(on?' aria-current="page"':'')+'>'+icon+'<span>'+esc(c.hubLabel)+'</span>'+(badge||more)+'</button>';
}
/* the pages of a hub this user may open in the current mode */
function hubPages(id,cur){
  const adv=core()&&core().mode()==="advanced";
  return SK.caps.members(id).filter(x=>(adv||x.primary||x.id===cur)&&SK.perm.can(x.id));
}
let lastSig="";
/* the menu: collapsible domains (icon · name · count), the current screen's domain always open,
   and a filter box above it; open/closed state per device (skosif_nav_v1) */
const NAV_KEY="skosif_nav_v1";
const GICON={home:"dash",intelligence:"decision",sales:"commerce",stock:"inventory",finance:"ledger",catalog:"catalog",reports:"execreports",audit:"tbreview",system:"settings"};
const CHEV='<svg class="skn-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const navState=()=>{const d=load(NAV_KEY,{})||{};return d.open&&typeof d.open==="object"?d.open:{}};
function setNavOpen(g,v){const d=load(NAV_KEY,{})||{};d.open={...(d.open||{}),[g]:v};save(NAV_KEY,d)}
let navQ="";
const nq=s=>String(s||"").toLowerCase().replace(/[ً-ٰٟ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").trim();
function paintNav(){
  const nav=$("#nav");if(!nav||!core())return;
  const adv=core().mode()==="advanced",cur=core().view(),open=navState();
  let html="",helper=false;
  SK.caps.groups().forEach(g=>{
    const items=SK.caps.hubsInGroup(g.id).map(c=>[c,hubPages(c.id,cur)]).filter(([,pg])=>pg.length);
    if(!items.length)return;
    /* the audit is the application; everything after this heading helps the accountant and stands on its own */
    if(g.section==="helper"&&!helper){helper=true;html+='<p class="skn-sec">الأدوات المساعدة للمحاسب</p>'}
    if(g.section!=="helper"&&helper&&g.id==="system"){html+='<p class="skn-sec">النظام</p>';helper=false}
    const here=items.some(([,pg])=>pg.some(x=>x.id===cur)),isOpen=here||(open[g.id]!==undefined?open[g.id]:g.id==="audit");
    html+='<div class="skn-group'+(isOpen?'':' closed')+(here?' here':'')+'" role="group" aria-label="'+esc(g.label)+'" data-g="'+g.id+'">'+
      '<button type="button" class="nav-group skn-gh" data-g="'+g.id+'" aria-expanded="'+isOpen+'"><span class="skn-gi">'+(SK.icons[GICON[g.id]]||"")+'</span><span>'+esc(g.label)+'</span><i class="skn-gc">'+items.length+'</i>'+CHEV+'</button>'+
      items.map(([c,pg])=>navButton(c,cur,pg)).join("")+'</div>';
  });
  if(adv)html+='<p class="skn-note">'+ADV_NOTE+'</p>';
  if(html!==lastSig||!nav.querySelector(".skn-group")){nav.innerHTML=html;lastSig=html}
  navSearch();filterNav();
}
function filterNav(){
  const nav=$("#nav");if(!nav)return;const q=nq(navQ);
  nav.classList.toggle("skn-searching",!!q);
  $$(".skn-group",nav).forEach(g=>{
    let any=false;
    $$(".nav-btn",g).forEach(b=>{const txt=SK.caps.members(b.dataset.hub||b.dataset.v).map(c=>c.label+" "+c.hubLabel+" "+c.kw+" "+c.en+" "+c.sub).join(" "),hit=!q||nq(txt).includes(q);b.classList.toggle("skn-miss",!hit);if(hit)any=true});
    g.classList.toggle("skn-none",!!q&&!any);
  });
}
function navSearch(){
  const nav=$("#nav");if(!nav||$("#skn-q"))return;
  const w=document.createElement("div");w.className="skn-search";
  w.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg><input id="skn-q" type="search" autocomplete="off" placeholder="تصفية القائمة…" aria-label="تصفية شاشات القائمة">';
  nav.before(w);
  const inp=$("#skn-q",w);
  inp.addEventListener("input",()=>{navQ=inp.value;filterNav()});
  inp.addEventListener("keydown",e=>{
    if(e.key==="Escape"){inp.value="";navQ="";filterNav();inp.blur()}
    if(e.key==="Enter"){const b=$$(".nav-btn",nav).find(x=>!x.classList.contains("skn-miss"));if(b){core().go(b.dataset.v);inp.value="";navQ="";filterNav()}}
  });
  nav.addEventListener("click",e=>{
    const h=e.target.closest(".skn-gh");if(!h||!nav.contains(h))return;
    const g=h.closest(".skn-group"),closed=g.classList.toggle("closed");h.setAttribute("aria-expanded",String(!closed));setNavOpen(h.dataset.g,!closed);
  });
}
/* the tab bar on top of every screen: the pages of its hub when it has several (العملاء · المتابعة ·
   الائتمان), otherwise the hubs of its domain */
function stripItems(id){
  const c=core(),cap=SK.caps.get(id);if(!cap)return{hub:false,items:[]};
  const pages=hubPages(id,id);
  /* «متقدم» only marks an advanced page inside a daily hub */
  const hubAdv=!SK.caps.hub(id).primary;
  if(pages.length>1)return{hub:true,items:pages.map(x=>({id:x.id,go:x.id,label:x.label,primary:x.primary||hubAdv,on:x.id===id}))};
  const items=SK.caps.hubsInGroup(cap.group).map(h=>[h,hubPages(h.id,id)]).filter(([,pg])=>pg.length)
    .map(([h,pg])=>({id:h.id,go:pg[0].id,label:h.hubLabel,primary:h.primary,on:pg.some(x=>x.id===id)}));
  return{hub:false,items};
}
function domainTabs(){
  const c=core();if(!c)return;const v=$("#view");if(!v)return;
  const old=v.querySelector(":scope > .skn-domain");
  const id=c.view(),cap=SK.caps.get(id);
  const {hub,items}=stripItems(id);
  if(items.length<2){if(old)old.remove();return}
  const html='<nav class="skn-domain'+(hub?' skn-hubtabs':'')+'" aria-label="'+esc(hub?cap.hubLabel:cap.groupLabel)+'">'+(hub?'<b class="skn-hubt">'+esc(cap.hubLabel)+'</b>':'')+items.map(x=>'<button type="button" data-act="nav" data-v="'+x.go+'"'+(x.on?' aria-current="page"':'')+'>'+(SK.icons[x.id]||c.navIcon(x.id)||"")+'<span>'+esc(x.label)+'</span>'+(x.primary?'':'<i>متقدم</i>')+'</button>').join("")+'</nav>';
  if(old){if(old.outerHTML!==html)old.outerHTML=html}else v.insertAdjacentHTML("afterbegin",html);
  const on=v.querySelector(".skn-domain [aria-current]");if(on&&on.scrollIntoView)on.scrollIntoView({block:"nearest",inline:"nearest"});
}
function paintTop(){
  const c=core();if(!c)return;
  const cap=SK.caps.get(c.view());
  const t=$("#pg-title"),cr=$("#pg-crumb");
  document.documentElement.dataset.domain=cap?cap.group:"";
  if(cap){if(t&&t.textContent!==cap.label)t.textContent=cap.label;if(cr)cr.textContent=SK.caps.path(cap.id)+(cap.primary?"":" · متقدم")}
  else if(cr)cr.textContent="";
  document.title=(cap?cap.label:(t&&t.textContent)||"")+" · SQC";
  const rail=$("#rail");document.body.classList.toggle("skn-locked",!!(rail&&rail.classList.contains("open"))&&innerWidth<=900);
}
/* phones: bottom tab bar — in the page flow (sticky), never over content. Four screens the user
   picks in «الأجهزة والمزامنة» (prefs.tabs), then «المزيد» opens the drawer. */
/* default four chosen with Jev (hybrid: daily selling + the new risk screen, p=0.75); notifications live on the bell */
const TABS=["dash","commerce","tasks","risks"];
const SHORT={dash:"الرئيسية",commerce:"الطلبات",tasks:"المهام",inventory:"المخزون",zatca:"الفاتورة",customers:"العملاء",followup:"المتابعة",offers:"العروض",
  catalog:"الأسعار",sim:"التسعير",purchasing:"الشراء",suppliers:"الموردون",cash:"النقد",receivables:"الذمم",ledger:"الدفاتر",jev:"Jev",council:"المجلس",
  execreports:"التقارير",scanner:"الماسح",labels:"الملصقات",operations:"المناسبات",b2bcredit:"الائتمان",traceability:"التبريد",decision:"القرار",
  reports:"الطباعة",exports:"التصدير",settings:"الإعدادات",devices:"الأجهزة",memo:"الاعتماد",builder:"البوكسات",risks:"المخاطر",notifications:"الإشعارات"};
const TAB_MAX=4;
function tabIds(){const p=prefs().tabs;return(Array.isArray(p)&&p.length?p:TABS).filter(id=>SK.caps.get(id)).slice(0,TAB_MAX)}
function setTabs(ids){const p=prefs();p.tabs=(ids||[]).filter(id=>SK.caps.get(id)).slice(0,TAB_MAX);if(!p.tabs.length)delete p.tabs;save(PREF_KEY,p);paintTabs()}
const tabLabel=id=>SHORT[id]||(SK.caps.get(id)||{}).label||id;
function paintTabs(){
  const c=core(),host=$(".maincol");if(!c||!host)return;
  let bar=$("#skb");
  if(!bar){
    bar=document.createElement("nav");bar.id="skb";bar.className="skb";bar.setAttribute("aria-label","تنقل سريع");host.appendChild(bar);
    bar.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.more)c.act("rail-open");else c.go(b.dataset.v)});
  }
  const cur=c.view(),cap=SK.caps.get(cur),tabs=tabIds().filter(id=>SK.perm.can(id)).map(id=>[id,tabLabel(id)]);
  const html=tabs.map(([id,l])=>'<button type="button" data-v="'+id+'"'+(id===cur?' aria-current="page"':'')+'>'+(SK.icons[id]||c.navIcon(id)||"")+(c.navBadge(id)||"")+'<span>'+esc(l)+'</span></button>').join("")+
    '<button type="button" data-more="1"'+(tabs.some(([id])=>id===cur)?'':' aria-current="page"')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg><span>'+(cap&&!tabs.some(([id])=>id===cur)?esc(tabLabel(cur)):"المزيد")+'</span></button>';
  if(bar.innerHTML!==html)bar.innerHTML=html;
}
/* laptops: the rail folds to an icon column (Ctrl/⌘+B or the button under the brand) */
function railToggle(){
  const rail=$("#rail");if(!rail||$("#sk-rail-mini",rail))return;
  const b=document.createElement("button");b.type="button";b.id="sk-rail-mini";b.className="sk-rail-mini";
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/><path d="m10 10-2 2 2 2"/></svg><span>طيّ القائمة</span>';
  b.addEventListener("click",()=>toggleRail());
  const brand=$(".brand",rail);(brand||rail.firstChild).after(b);
  syncRailBtn();
}
function syncRailBtn(){const b=$("#sk-rail-mini"),mini=prefs().rail==="mini";if(!b)return;
  const t=(mini?"توسيع القائمة":"طيّ القائمة")+(SK.device?" ("+SK.device.keyHint("B")+")":"");b.title=t;b.setAttribute("aria-label",t);b.setAttribute("aria-pressed",String(mini));$("span",b).textContent=mini?"توسيع القائمة":"طيّ القائمة"}
function toggleRail(force){const mini=typeof force==="boolean"?force:prefs().rail!=="mini";setPref("rail",mini?"mini":"full");syncRailBtn();SK.toast(mini?"قائمة مطويّة — الأيقونات فقط":"قائمة كاملة","info")}
/* installed on a laptop with the title bar hidden (Window Controls Overlay): a draggable strip */
function titlebar(){
  const on=document.documentElement.getAttribute("data-display")==="window-controls-overlay";let bar=$("#sk-wco");
  if(!on){if(bar)bar.remove();return}
  if(!bar){bar=document.createElement("div");bar.id="sk-wco";bar.className="sk-wco";bar.innerHTML='<div class="sk-wco-in"><b>SQC</b><span id="sk-wco-t"></span></div>';document.body.prepend(bar)}
  const c=core(),cap=c&&SK.caps.get(c.view()),t=$("#sk-wco-t");if(t)t.textContent=cap?cap.label:"";
}
function paint(){paintNav();paintTop();paintTabs();railToggle();titlebar();if(window.SKosifTopbar)SKosifTopbar.paint()}

/* ---------- permission gate: a screen outside the role shows the no-permission state ---------- */
function gate(){
  const c=core();if(!c)return;
  const id=c.view();
  if(SK.caps.get(id)&&!SK.perm.can(id)){const v=$("#view");if(v)v.innerHTML=SK.ui.state.denied()}
}

/* ---------- offline + update notices (in the page flow, never floating) ---------- */
function offline(){
  let bar=$("#sk-offline");
  if(navigator.onLine){if(bar)bar.remove();return}
  if(bar)return;
  bar=document.createElement("div");bar.id="sk-offline";bar.className="sk-offline-bar";bar.setAttribute("role","status");
  bar.textContent="أنت دون اتصال — كل شيء يعمل ويُحفظ على هذا الجهاز؛ Jev والربط السحابي يعودان مع الاتصال.";
  ($(".maincol")||document.body).insertBefore(bar,$(".main"));
}
function updates(){
  if(!("serviceWorker" in navigator)||!/^https?:$/.test(location.protocol))return;
  const hadController=!!navigator.serviceWorker.controller;let reloading=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!hadController||reloading)return;reloading=true;location.reload()});
  navigator.serviceWorker.register("./sw.js").then(reg=>{
    const offer=w=>{
      if(!w||!hadController||$("#sk-update"))return;
      const bar=document.createElement("div");bar.id="sk-update";bar.className="sk-update";bar.setAttribute("role","status");
      bar.innerHTML='<span>نسخة أحدث من SQC جاهزة.</span><button type="button" class="btn sm primary">تحديث الآن</button>';
      bar.querySelector("button").onclick=()=>w.postMessage({type:"SKIP_WAITING"});
      ($(".maincol")||document.body).insertBefore(bar,$(".main"));
    };
    if(reg.waiting)offer(reg.waiting);
    reg.addEventListener("updatefound",()=>{const w=reg.installing;if(w)w.addEventListener("statechange",()=>{if(w.state==="installed")offer(w)})});
  }).catch(e=>SK.errors.report(e,"sw",{silent:true}));
}

/* ---------- settings: appearance, security, role, full backup ---------- */
function studioHTML(p){
  const seg=(name,cur,opts)=>'<div class="sk-seg" role="group" data-studio="'+name+'">'+opts.map(([v,l])=>'<button type="button" data-v="'+v+'" aria-pressed="'+(String(v)===String(cur))+'">'+l+'</button>').join("")+'</div>';
  return '<div class="skx-studio" id="skx-studio"><h4>استوديو المظهر</h4>'+
    '<div class="sk-field"><span>الخط</span><div class="skx-fonts">'+FONTS.map(([id,name,,stack])=>'<button type="button" data-font="'+id+'" aria-pressed="'+(p.font===id)+'"'+(stack?' style="font-family:'+esc(stack+FALLBACK).replace(/"/g,"&quot;")+'"':'')+'><b>'+esc(name)+'</b><small>المراجعة أذكى · ١٢٣٤ 1234</small></button>').join("")+'</div></div>'+
    '<div class="sk-field"><span>حجم النص في الصفحات</span>'+seg("scale",p.scale,[[0.9,"أصغر"],[1,"عادي"],[1.1,"أكبر"],[1.2,"كبير جداً"]])+'</div>'+
    '<div class="sk-field"><span>لون التمييز — الأزرار والروابط والتحديد والتدرجات</span><div class="skx-accents">'+ACCENTS.map(([hex,name])=>'<button type="button" data-accent="'+hex+'" aria-pressed="'+((p.accent||"")===hex)+'" title="'+esc(name)+'"><i style="background:'+(hex||"var(--sk-grad-brand)")+'"></i><span>'+esc(name)+'</span></button>').join("")+
      '<label class="skx-custom" title="لون مخصص"><input type="color" id="skx-accent" value="'+esc(p.accent||"#1668e3")+'"><span>مخصص</span></label></div><small class="hint" id="skx-accent-note"></small></div>'+
    '<div class="sk-field"><span>الزوايا</span>'+seg("radius",p.radius,[["sharp","حادة"],["theme","حسب الثيم"],["round","دائرية"]])+'</div>'+
    '<label class="checkline"><input type="checkbox" id="skx-contrast"'+(p.contrast?' checked':'')+'> تباين عالٍ — حدود أوضح ونص أغمق وتركيز ظاهر (لضعف النظر والشاشات الساطعة)</label>'+
    '<label class="checkline"><input type="checkbox" id="skx-preview"'+(SK.print&&SK.print.options().preview?' checked':'')+'> معاينة قبل الطباعة — الورق والاتجاه والهوامش والحجم والعلامة المائية والترويسة وأرقام الصفحات</label>'+
    '<div class="sk-actions"><button type="button" class="btn" id="skx-studio-reset">إعادة المظهر الافتراضي</button><span class="hint">يُحفظ على هذا الجهاز ويُطبق فوراً على كل الشاشات والرسوم والطباعة.</span></div></div>';
}
function bindStudio(root){
  const box=$("#skx-studio",root);if(!box)return;
  const note=()=>{const p=prefs(),n=$("#skx-accent-note",box);if(!n)return;if(!p.accent){n.textContent="";return}
    const c=hexRgb(p.accent),r=contrast(c,[255,255,255]);n.textContent=r<3?"اللون فاتح على النص الأبيض — عُدّلت درجته تلقائياً ليبقى مقروءاً (تباين "+r.toFixed(1)+":1).":"تباين اللون مع الأبيض "+r.toFixed(1)+":1 — مقروء."};
  box.addEventListener("click",e=>{
    const f=e.target.closest("[data-font]"),a=e.target.closest("[data-accent]"),sg=e.target.closest("[data-studio] button[data-v]");
    if(f){setPref("font",f.dataset.font);$$("[data-font]",box).forEach(x=>x.setAttribute("aria-pressed",String(x===f)));SK.toast("الخط: "+f.querySelector("b").textContent,"info")}
    else if(a){setPref("accent",a.dataset.accent);$$("[data-accent]",box).forEach(x=>x.setAttribute("aria-pressed",String(x===a)));note()}
    else if(sg){const g=sg.closest("[data-studio]"),k=g.dataset.studio;setPref(k,k==="scale"?Number(sg.dataset.v):sg.dataset.v);$$("button",g).forEach(x=>x.setAttribute("aria-pressed",String(x===sg)))}
  });
  $("#skx-accent",box).addEventListener("input",e=>{setPref("accent",e.target.value);$$("[data-accent]",box).forEach(x=>x.setAttribute("aria-pressed","false"));note()});
  $("#skx-contrast",box).addEventListener("change",e=>setPref("contrast",e.target.checked));
  $("#skx-preview",box).addEventListener("change",e=>{SK.print.set("preview",e.target.checked);SK.toast(e.target.checked?"ستظهر معاينة قبل كل طباعة":"الطباعة مباشرة دون معاينة","info")});
  $("#skx-studio-reset",box).addEventListener("click",()=>{const p=prefs();["font","scale","radius","accent","contrast"].forEach(k=>delete p[k]);save(PREF_KEY,p);applyPrefs();box.outerHTML=studioHTML(prefs());bindStudio(root);SK.toast("عاد المظهر الافتراضي","info")});
  note();
}
function settingsCards(root){
  if(!root||root.querySelector("#skx-prefs"))return;
  const p=prefs(),lock=SK.num(load(SK.lock.key,0)),role=SK.perm.role(),isAdmin=role==="admin";
  const seg=(name,cur,opts)=>'<div class="sk-seg" role="group" data-pref="'+name+'">'+opts.map(([v,l])=>'<button type="button" data-v="'+v+'" aria-pressed="'+(v===cur)+'">'+l+'</button>').join("")+'</div>';
  const html=
  '<section class="card" id="skx-prefs"><div class="card-h"><div><h3>المظهر والأمان</h3><p>نظام تصميم واحد بستة ثيمات كاملة، والقفل التلقائي لهذا الجهاز.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-field"><span>الثيم — يغيّر شكل التطبيق كله دون أي تغيير في البيانات</span><div class="skx-themes" id="skx-themes">'+LOOKS.map(([id,name,desc,c])=>'<button type="button" class="skx-theme" data-look="'+id+'" aria-pressed="'+(p.look===id)+'"><span class="pv" aria-hidden="true" style="--pv-bg:'+c[0]+';--pv-rail:'+c[1]+';--pv-brand:'+c[2]+';--pv-acc:'+c[3]+'"><i class="r"></i><i class="h"></i><i class="k"></i><i class="k2"></i><i class="bt"></i></span><b>'+esc(name)+'</b><small>'+esc(desc)+'</small></button>').join("")+'</div></div>'+
    '<div class="sk-field"><span>كثافة الواجهة</span>'+seg("density",p.density,[["cozy","مريحة"],["compact","مضغوطة"]])+'</div>'+
    studioHTML(p)+
    '<div class="sk-actions"><label class="sk-field" style="flex:1;min-width:200px"><span>القفل التلقائي بعد عدم النشاط</span><select id="skx-lock">'+
      [[0,"متوقف"],[5,"5 دقائق"],[15,"15 دقيقة"],[30,"30 دقيقة"],[60,"ساعة"]].map(o=>'<option value="'+o[0]+'"'+(o[0]===lock?' selected':'')+'>'+o[1]+'</option>').join("")+
    '</select></label><button type="button" class="btn sk-end" id="skx-lock-now">قفل الآن</button></div></div></section>'+
  '<section class="card" id="skx-role"><div class="card-h"><div><h3>الدور والصلاحيات</h3><p>الدور يحدد الشاشات الظاهرة والإجراءات المسموحة على هذا الجهاز. الحماية بين المستخدمين في مساحة عمل مشتركة تتم عبر «الصلاحيات ومساحات العمل».</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-seg" role="group" id="skx-roles">'+SK.perm.list().map(r=>'<button type="button" data-role="'+r.id+'" aria-pressed="'+(r.id===role)+'"'+(isAdmin||r.id===role?'':' disabled')+'>'+esc(r.label)+'</button>').join("")+'</div>'+
    (isAdmin?'':'<p class="sk-note">تغيير الدور متاح لدور «مدير النظام» فقط.</p>')+
    '<div class="sk-actions"><button type="button" class="btn" id="skx-audit-csv">تصدير سجل التدقيق</button><span class="hint">'+SK.audit.all().length+' حدثاً مسجلاً على هذا الجهاز</span></div></div></section>'+
  '<section class="card" id="skx-backup"><div class="card-h"><div><h3>نسخة كاملة للتطبيق</h3><p>كل بياناتك في ملف واحد: الأسعار والعملاء والمبيعات والطلبات والمخزون والموردون والتقارير. الاستعادة تعرض ما سيتغير أولاً، وتحتفظ بنقطة رجوع.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-actions"><button type="button" class="btn primary" id="skx-bk">تنزيل نسخة كاملة</button><label class="btn" style="cursor:pointer">استعادة من ملف…<input type="file" id="skx-rs" accept=".json,application/json" hidden></label>'+
    '<button type="button" class="btn" id="skx-rb"'+(SK.store.hasSnapshot()?'':' hidden')+'>التراجع عن آخر استعادة</button></div>'+
    '<div id="skx-bk-out" class="hint">'+usageText()+'</div></div></section>';
  root.insertAdjacentHTML("afterbegin",html);
  $$("[data-pref]",root).forEach(g=>g.addEventListener("click",e=>{const b=e.target.closest("button[data-v]");if(!b)return;
    setPref(g.dataset.pref,b.dataset.v);SK.toast(b.dataset.v==="compact"?"واجهة مضغوطة":"واجهة مريحة","info");
    $$("button",g).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))}));
  bindStudio(root);
  $("#skx-themes",root).addEventListener("click",e=>{const b=e.target.closest("[data-look]");if(!b)return;setLook(b.dataset.look);$$("[data-look]",root).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))});
  $("#skx-lock",root).onchange=e=>{save(SK.lock.key,SK.num(e.target.value));SK.lock.touch();SK.toast(SK.num(e.target.value)?"القفل التلقائي: "+e.target.selectedOptions[0].text:"أُوقف القفل التلقائي","info")};
  $("#skx-lock-now",root).onclick=()=>SK.lock.now();
  $("#skx-roles",root).addEventListener("click",e=>{const b=e.target.closest("button[data-role]");if(!b||b.disabled)return;
    if(SK.perm.setRole(b.dataset.role)){SK.toast("الدور الحالي: "+SK.perm.label(),"ok");lastSig="";core().go("settings")}});
  $("#skx-audit-csv",root).onclick=()=>SK.audit.csv();
  const out=$("#skx-bk-out",root);
  $("#skx-bk",root).onclick=async()=>{out.textContent="جارٍ تجهيز النسخة…";try{const c=await SK.store.backup();out.textContent="تم تنزيل النسخة: "+c.keys+" مفتاحاً و"+Object.values(c.rows).reduce((a,b)=>a+b,0)+" سجلاً."}catch(e){out.textContent="";SK.errors.report(e,"backup")}};
  $("#skx-rs",root).onchange=async e=>{
    const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;
    try{
      const p=await SK.store.restore(f,{dryRun:true});
      const rows=Object.entries(p.rows).filter(([,n])=>n).map(([k,n])=>k+": "+n).join("، ")||"لا سجلات قاعدة بيانات";
      const msg="نسخة بتاريخ "+String(p.createdAt||"غير معروف").slice(0,16).replace("T"," ")+"\n"+
        "مفاتيح جديدة: "+p.keys.add.length+" · ستتغير: "+p.keys.change.length+" · مطابقة: "+p.keys.same.length+"\n"+
        "سجلات قاعدة البيانات (تستبدل الحالية): "+rows+"\n"+
        "مفاتيح غير موجودة في الملف تبقى كما هي: "+p.untouched.length+"\n\nسيُحتفظ بنقطة رجوع قبل الكتابة.";
      if(!await SK.confirm(msg,{title:"معاينة الاستعادة (تجربة دون كتابة)",ok:"استعادة الآن"}))return;
      await SK.store.restore(f);
      out.innerHTML='تمت الاستعادة. <button type="button" class="btn sm" id="skx-snap">تنزيل نقطة الرجوع</button> <button type="button" class="btn sm primary" id="skx-reload">إعادة التحميل لتطبيقها</button>';
      $("#skx-rb",root).hidden=false;
      $("#skx-snap",root).onclick=()=>SK.store.downloadSnapshot();
      $("#skx-reload",root).onclick=()=>location.reload();
    }catch(err){SK.errors.report(err,"restore")}
  };
  $("#skx-rb",root).onclick=async()=>{if(!await SK.confirm("إرجاع البيانات كما كانت قبل آخر استعادة؟",{ok:"تراجع"}))return;try{await SK.store.rollback();SK.toast("تم التراجع — أعد التحميل","ok");setTimeout(()=>location.reload(),900)}catch(e){SK.errors.report(e,"rollback")}};
}
function usageText(){const u=SK.store.usage();return "على هذا الجهاز: "+u.keys+" مفتاح بيانات (~"+(u.bytes/1024).toFixed(0)+" ك.ب) + قاعدة بيانات العملاء والمبيعات."}

/* ---------- phones: swipe in from the rail's edge to open the drawer, swipe back to close ---------- */
function swipe(){
  let x0=null,y0=0,mode="";
  const narrow=()=>innerWidth<=900,rtl=()=>document.documentElement.dir!=="ltr";
  addEventListener("touchstart",e=>{
    if(!narrow()||e.touches.length!==1)return;const t=e.touches[0],r=$("#rail"),open=!!(r&&r.classList.contains("open"));
    const fromEdge=rtl()?t.clientX>innerWidth-24:t.clientX<24;
    mode=open?"close":fromEdge&&!document.querySelector("#pr-modal .modal,.skp-wrap.open,.skd-wrap")?"open":"";
    if(mode){x0=t.clientX;y0=t.clientY}else x0=null;
  },{passive:true});
  addEventListener("touchend",e=>{
    if(x0==null)return;const t=e.changedTouches[0],dx=(t.clientX-x0)*(rtl()?-1:1),dy=Math.abs(t.clientY-y0);x0=null;
    if(dy>60)return;const c=core();if(!c)return;
    if(mode==="open"&&dx>50)c.act("rail-open");else if(mode==="close"&&dx<-60)c.act("rail-close");
  },{passive:true});
}
/* keyboard hints follow the device: ⌘K on a Mac, Ctrl K on Windows, nothing on an iPhone */
function hints(){
  const k=$(".skt-search kbd"),d=SK.device;if(!k||!d)return;
  if(d.os==="ios"){k.remove();return}
  k.textContent=d.mod+" K";const b=k.closest(".skt-search");if(b)b.setAttribute("aria-label","بحث وانتقال سريع ("+d.keyHint("K")+")");
}

/* ---------- phones: customer cards instead of a wide table ---------- */
function customerCards(root){
  if(!root||!matchMedia("(max-width:760px)").matches)return;
  const wrap=root.querySelector(".customer-table"),body=wrap&&wrap.querySelector("table tbody");if(!body)return;
  const rows=[...body.rows].filter(r=>r.cells.length>=7);
  let list=wrap.parentElement.querySelector(":scope > .sk-customer-list");
  if(!list){list=document.createElement("div");list.className="sk-customer-list";wrap.before(list)}
  list.innerHTML=rows.map(r=>{const c=r.cells;return '<article class="sk-customer-card"><div class="sk-cc-head"><b>'+c[0].innerHTML+'</b><span dir="ltr">'+esc(c[1].textContent.trim())+'</span></div>'+
    '<dl><div><dt>الموقع</dt><dd>'+c[2].innerHTML+'</dd></div><div><dt>المشتريات</dt><dd>'+esc(c[3].textContent.trim())+'</dd></div><div><dt>آخر شراء</dt><dd>'+esc(c[5].textContent.trim())+'</dd></div><div><dt>التفاصيل</dt><dd>'+c[6].innerHTML+'</dd></div></dl>'+
    '<div class="sk-cc-actions">'+(c[7]?c[7].innerHTML:"")+'</div></article>'}).join("");
}

window.SKosifShell=Object.freeze({paint,stripItems,setPref,fonts:()=>FONTS.map(f=>({id:f[0],name:f[1]})),accents:()=>ACCENTS.map(a=>({hex:a[0],name:a[1]})),toggleAppearance,setAppearance,setLook,looks:()=>LOOKS.map(x=>({id:x[0],name:x[1]})),prefs,resolved,
  toggleRail,tabs:tabIds,setTabs,tabLabel,defaultTabs:()=>TABS.slice(),tabMax:TAB_MAX});

function boot(){
  const c=core();
  SK._flush();
  if(c){
    c.setAdvanced(SK.caps.advancedIds());
    c.onView("settings",settingsCards);
    c.onView("customers",customerCards);
  }
  addEventListener("sk:render",()=>{gate();domainTabs()});
  addEventListener("resize",()=>{if(innerWidth>900){const r=$("#rail");if(r&&r.classList.contains("open")&&c)c.act("rail-close")}},{passive:true});
  addEventListener("online",offline);addEventListener("offline",offline);offline();
  SK.bus.on("device",()=>titlebar());
  swipe();hints();
  SK.bus.on("role",()=>{lastSig="";paint()});
  paint();gate();updates();
  Object.freeze(window.SK);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();

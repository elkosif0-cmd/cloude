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
const sidebar={ready:false,rail:null,observer:null,narrow:innerWidth<=900,open:false,opener:null,openerMore:false,main:null,mainInert:false,route:false,scrollY:0,scrollCaptured:false,bodyStyle:null,restoreEpoch:0,openView:null};

function identityMetadata(){
  const h=document.head;if(!h)return;
  h.querySelectorAll('link[rel~="icon"]').forEach(x=>x.remove());
  const icon=document.createElement("link");icon.rel="icon";icon.type="image/svg+xml";icon.href="./art/sqc-icon.svg";h.appendChild(icon);
  let manifest=h.querySelector('link[rel="manifest"]');
  if(!manifest){manifest=document.createElement("link");manifest.rel="manifest";h.appendChild(manifest)}
  manifest.href="./manifest.webmanifest";
  let theme=h.querySelector('meta[name="theme-color"]');
  if(!theme){theme=document.createElement("meta");theme.name="theme-color";h.appendChild(theme)}
  if(!theme.content)theme.content="#0b1030";
}

/* ---------- preferences: theme (look) + density ----------
   look: kosif (default, the adopted KOSIF identity) | kosif-night | heritage | heritage-night | executive | audit | midnight | notebook | auto */
const LOOKS=[
  ["kosif","SQC","الهوية المعتمدة «كوبالت وجليد»: كوبالت ليلي وأزرق الكوبالت ولمعة الجليد وبطاقات بيضاء",["#f4f6fb","#0b1030","#2340c4","#19c3d9"]],
  ["kosif-night","SQC الليلي","نفس الهوية بإضاءة ليلية",["#070a1e","#050719","#9fb0ff","#5fdcea"]],
  ["navygold","الكحلي والذهبي","هوية SQC السابقة: كحلي وذهبي وعاجي",["#f7f4ec","#0b1f3a","#13305a","#c9a227"]],
  ["navygold-night","الكحلي والذهبي الليلي","الهوية السابقة بإضاءة ليلية",["#0a1424","#06101f","#8fb3e8","#d4af37"]],
  ["najd","نجد الفاخر","أخضر ملكي وذهب نجد وبطاقات بيضاء ناصعة وحلقات فخمة",["#f7faf7","#07381e","#006c35","#d4af37"],"pro"],
  ["najd-night","ليل نجد","نفس الفخامة بإضاءة ليلية خضراء داكنة",["#09150e","#07150d","#2ecc71","#f1c40f"],"pro"],
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
  ["auto","حسب الجهاز","ثيمك المختار نهاراً ونسخته الليلية ليلاً",["#f4f6fb","#2340c4","#070a1e","#5fdcea"]]];
const DARK=new Set(["kosif-night","navygold-night","najd-night","heritage-night","midnight","aurora-night","vivid-night","oasis-night","graphite","onyx"]);
const NIGHT={kosif:"kosif-night",navygold:"navygold-night",najd:"najd-night",heritage:"heritage-night",aurora:"aurora-night",vivid:"vivid-night",oasis:"oasis-night"};
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
const ACCENTS=[["","حسب الثيم"],["#2340c4","كوبالت SQC"],["#0f9d6c","زمردي"],["#006c35","أخضر وطني"],["#0e8a9a","فيروزي"],["#6b4ee6","ملكي"],["#c2410c","عنبري"],["#b8862b","ذهبي"],["#d0343f","قرمزي"],["#3b4a5e","فحمي"]];
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
const LOOK_FONTS={vivid:"Tajawal:wght@400;500;700;800",oasis:"Readex+Pro:wght@400;500;600;700",onyx:"Noto+Naskh+Arabic:wght@500;700",najd:"IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Aref+Ruqaa:wght@700"};
function fonts(look){
  const fam=look.replace(/-night$/,"");if(LOOK_FONTS[fam]&&!document.getElementById("sk-font-look-"+fam)){const l=document.createElement("link");l.id="sk-font-look-"+fam;l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family="+LOOK_FONTS[fam]+"&display=swap";document.head.appendChild(l)}
  if(look.startsWith("heritage")||document.getElementById("sk-font-plex"))return;
  const l=document.createElement("link");l.id="sk-font-plex";l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap";document.head.appendChild(l);
}
function applyPrefs(){
  const de=document.documentElement,look=lookNow(),mode=resolved(),p=prefs();
  /* «الكحلي والذهبي» is a brand variant of the kosif look (same layout rules, the previous colours) */
  const fam=look.replace(/-night$/,""),brand=fam==="navygold"?"navygold":"";
  de.setAttribute("data-look",brand?"kosif":fam);if(brand)de.setAttribute("data-brand",brand);else de.removeAttribute("data-brand");
  de.setAttribute("data-theme",mode);de.setAttribute("data-density",p.density==="compact"?"compact":"cozy");
  de.setAttribute("data-rail",p.rail==="mini"?"mini":"full");
  de.setAttribute("data-sidebar",p.sidebarHidden===true?"hidden":"visible");
  fonts(look);
  applyStudio(de,p,mode);
  try{localStorage.setItem("aghnam-v12-theme",mode)}catch{}
  const bar=getComputedStyle(de).getPropertyValue("--sk-rail").trim()||(mode==="dark"?"#1b140e":"#efe2cc");
  $$('meta[name="theme-color"]').forEach(m=>m.setAttribute("content",bar));
  if(sidebar.ready)syncSidebar();
}
function setPref(k,v){const p=prefs();p[k]=v;save(PREF_KEY,p);applyPrefs()}
function setLook(l){const p=prefs();if(!LOOKS.some(x=>x[0]===l))l="kosif";p.look=l;if(!DARK.has(l)&&l!=="auto")p.lastLight=l;save(PREF_KEY,p);
  const de=document.documentElement;de.classList.add("sk-theme-trans");setTimeout(()=>de.classList.remove("sk-theme-trans"),260);
  /* one smooth cross-fade where the browser supports view transitions */
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;if(document.startViewTransition&&!reduce){const vt=document.startViewTransition(()=>applyPrefs());for(const k of["ready","finished","updateCallbackDone"])vt[k]&&vt[k].catch(()=>{})}else applyPrefs();
  SK.bus.emit("theme",l);if(window.SKosifTopbar&&SKosifTopbar.paint)SKosifTopbar.paint();
  SK.toast("المظهر: "+LOOKS.find(x=>x[0]===l)[1],"info")}
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
const CHEV='<svg class="skn-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const navState=()=>{const d=load(NAV_KEY,{})||{};return d.open&&typeof d.open==="object"?d.open:{}};
function setNavOpen(g,v){const d=load(NAV_KEY,{})||{};d.open={...(d.open||{}),[g]:v};save(NAV_KEY,d)}
let navQ="";
const nq=s=>String(s||"").toLowerCase().replace(/[ً-ٰٟ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").trim();
/* the menu is the chosen entry's alone (FOUNDATION §3): a switcher for the three entries on top, then that entry's
   domains with their hubs; a screen reached outside the entry (a deep link, a shortcut) switches the entry to its own */
function paintNav(){
  const nav=$("#nav");if(!nav||!core())return;
  const cur=core().view(),open=navState(),gateways=SK.caps.gateways?SK.caps.gateways():[],cap=SK.caps.get(cur);
  let gate=gateways.length&&SK.gate?SK.gate.current():"";
  if(gate&&cap&&!SK.caps.inGatewayOf(cap,gate)){if(!SK.gate.pinned()){gate=cap.gateway;SK.gate.set(gate,{go:false,silent:true})}}
  else if(gate&&cap&&SK.gate.pinned()===cur)SK.gate.unpin(); /* the door's section arrived on its first screen */
  let html="";
  if(gate)html+='<div class="skn-gates" role="group" aria-label="القسم" data-gate="'+esc(gate)+'">'+gateways.map(g=>'<button type="button" class="skn-gate" data-gate="'+esc(g.id)+'" aria-pressed="'+(g.id===gate)+'" title="'+esc(g.label)+'">'+(SK.icons[g.icon]||"")+'<span>'+esc(g.short||g.label)+'</span></button>').join("")+'</div>';
  /* R3: the entry's own menu (the constitution's order) when it declares one, else the registry's groups */
  const menu=gate&&SK.caps.menu?SK.caps.menu(gate):null;
  const domains=menu||(gate?SK.caps.groupsInGateway(gate):SK.caps.groups());
  domains.forEach(gr=>{
    const items=(menu?gr.hubs:SK.caps.hubsInGroup(gr.id).filter(c=>!gate||SK.caps.inGatewayOf(c,gate))).map(c=>[c,hubPages(c.id,cur)]).filter(([,pg])=>pg.length);
    if(!items.length)return;
    const here=items.some(([,pg])=>pg.some(x=>x.id===cur)),isOpen=here||(open[gr.id]!==undefined?open[gr.id]:true);
    html+='<div class="skn-group'+(isOpen?'':' closed')+(here?' here':'')+'" role="group" aria-label="'+esc(gr.label)+'" data-g="'+esc(gr.id)+'"><button type="button" class="nav-group skn-gh" data-g="'+esc(gr.id)+'" aria-expanded="'+isOpen+'"><span class="skn-gi">'+(SK.icons[gr.icon]||"")+'</span><span>'+esc(gr.label)+'</span><i class="skn-gc">'+items.length+'</i>'+CHEV+'</button>'+
      '<div class="skn-subgroup" data-sg="'+esc(gr.id)+'">'+items.map(([c,pg])=>navButton(c,cur,pg)).join("")+'</div></div>';
  });
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
    const gb=e.target.closest(".skn-gate");if(gb&&nav.contains(gb)){if(SK.gate)SK.gate.set(gb.dataset.gate,{go:true});return}
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
  /* the hubs of the screen's menu section in the entry the user is in (R3), else of its group */
  const gate=SK.gate&&SK.gate.current?SK.gate.current():"",sec=gate&&SK.caps.section?SK.caps.section(id,gate):null;
  const items=(sec?sec.hubs:SK.caps.hubsInGroup(cap.group)).map(h=>[h,hubPages(h.id,id)]).filter(([,pg])=>pg.length)
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
  if(cap){
    if(t&&t.textContent!==cap.label)t.textContent=cap.label;
    if(cr){
      const gate=SK.gate?SK.gate.current():"";
      const gateLabel=SK.gate?SK.gate.label(gate):"";
      let crumbText=SK.caps.path(cap.id);
      if(gate==="accounting"&&SK.company){
        const comp=SK.company.current();
        const sec=comp&&comp.sector&&SK.caps.sector?SK.caps.sector(comp.sector):null;
        if(sec&&!crumbText.includes(sec.label)){
          crumbText=gateLabel+" › "+sec.label+" · "+(comp.name||"")+" › "+(cap.groupLabel||"")+" › "+cap.label;
        }
      }
      cr.textContent=crumbText+(cap.primary?"":" · متقدم");
    }
  }
  else if(cr)cr.textContent="";
  document.title=(cap?cap.label:(t&&t.textContent)||"")+" · SQC";
  /* Drawer scroll locking is owned by syncSidebar so it can capture/restore scroll atomically. */
}
/* phones: bottom tab bar — in the page flow (sticky), never over content. Four screens the user
   picks in «الأجهزة والمزامنة» (prefs.tabs), then «المزيد» opens the drawer. */
/* default tabs are section-aware (FOUNDATION §3): accounting · audit · tools */
const TABS_BY_GATE={
  accounting:["ledger","commerce","inventory","execreports"],
  audit:["tbreview","auditdesk","auditbench","auditcouncil"],
  tools:["helperdesk","costs","salesintel","decision"]
};
const TABS=TABS_BY_GATE.accounting;
const SHORT={dash:"الرئيسية",helperdesk:"الخريطة",tbreview:"المراجعة",codex:"المعايير",auditbench:"المرجع",auditdesk:"الاستوديو",auditcouncil:"المجلس",commerce:"الطلبات",tasks:"المهام",inventory:"المخزون",zatca:"الفاتورة",customers:"العملاء",followup:"المتابعة",offers:"العروض",
  catalog:"الأسعار",sim:"التسعير",costs:"التكاليف",salesintel:"المبيعات",purchasing:"الشراء",suppliers:"الموردون",cash:"النقد",receivables:"الذمم",ledger:"الدفاتر",jev:"Jev",council:"المجلس",
  execreports:"التقارير",scanner:"الماسح",labels:"الملصقات",operations:"المناسبات",b2bcredit:"الائتمان",traceability:"التبريد",decision:"القرار",
  reports:"الطباعة",exports:"التصدير",settings:"الإعدادات",devices:"الأجهزة",memo:"الاعتماد",builder:"البوكسات",risks:"المخاطر",notifications:"الإشعارات"};
const TAB_MAX=4;
function currentGate(){return (typeof SK!=="undefined"&&SK.gate&&SK.gate.current)?SK.gate.current():"accounting"}
function tabIds(){
  const g=currentGate();
  const def=TABS_BY_GATE[g]||TABS_BY_GATE.accounting||TABS;
  const p=prefs().tabs;
  if(Array.isArray(p)&&p.length){
    const inGate=p.filter(id=>{const c=SK.caps&&SK.caps.get?SK.caps.get(id):null;return c&&SK.caps.inGatewayOf&&SK.caps.inGatewayOf(c,g)});
    if(inGate.length)return inGate.slice(0,TAB_MAX);
  }
  return def.filter(id=>!SK.caps||!SK.caps.get||SK.caps.get(id)).slice(0,TAB_MAX);
}
function setTabs(ids){const p=prefs();p.tabs=(ids||[]).filter(id=>SK.caps.get(id)).slice(0,TAB_MAX);if(!p.tabs.length)delete p.tabs;save(PREF_KEY,p);paintTabs()}
const tabLabel=id=>SHORT[id]||(SK.caps.get(id)||{}).label||id;
function paintTabs(){
  const c=core(),host=$(".maincol");if(!c||!host)return;
  let bar=$("#skb");
  if(!bar){
    bar=document.createElement("nav");bar.id="skb";bar.className="skb";bar.setAttribute("aria-label","تنقل سريع");host.appendChild(bar);
    bar.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.more){sidebar.opener=b;sidebar.openerMore=true;toggleSidebar()}else c.go(b.dataset.v)});
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
function toggleRail(force){const mini=typeof force==="boolean"?force:prefs().rail!=="mini";setPref("rail",mini?"mini":"full");syncRailBtn();SK.toast(prefs().sidebarHidden===true&&innerWidth>900?(mini?"القائمة مخفية؛ ستظهر بالأيقونات فقط عند إظهارها":"القائمة مخفية؛ ستظهر كاملة عند إظهارها"):(mini?"قائمة مطويّة — الأيقونات فقط":"قائمة كاملة"),"info")}
/* Visibility is separate from the established full/mini preference and shortcut.
   Mobile actions stay in the core drawer controller; this adapter synchronizes focus and aria. */
function toggleSidebar(){
  const rail=$("#rail"),button=$(".topbar .menu-btn")||$(".menu-btn");if(!rail)return;
  if(innerWidth<=900){const opening=!rail.classList.contains("open"),returnY=!opening&&!sidebar.route&&sidebar.openView===(core()&&core().view())?(sidebar.scrollCaptured?sidebar.scrollY:Number(rail.dataset.returnScrollY||window.scrollY)):NaN;if(opening){sidebar.scrollY=window.scrollY;sidebar.scrollCaptured=true;rail.dataset.returnScrollY=String(sidebar.scrollY);if(!sidebar.opener)sidebar.opener=document.activeElement;sidebar.openerMore=!!(sidebar.opener&&sidebar.opener.matches&&sidebar.opener.matches("#skb [data-more]"))}const c=core();if(c)c.act(opening?"rail-open":"rail-close");syncSidebar();if(!opening&&Number.isFinite(returnY)){const se=document.scrollingElement;if(se)se.scrollTop=returnY;document.documentElement.scrollTop=returnY;document.body.scrollTop=returnY;window.scrollTo(0,returnY)}return}
  const hide=prefs().sidebarHidden!==true;
  if(hide&&rail.contains(document.activeElement)&&button)button.focus({preventScroll:true});
  setPref("sidebarHidden",hide);syncSidebar();
}
function sidebarFocusables(rail){return [...rail.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.closest('[inert],[hidden]')&&el.getClientRects().length)}
function sidebarModal(){return [...document.querySelectorAll('#pr-modal .modal,.skd-wrap,.skp-wrap.open,.skk-wrap,.sk-menu')].some(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden")}
function lockPageScroll(open,y=0){
  const b=document.body;if(!b)return;
  if(open){b.style.setProperty("--skn-lock-top","-"+Math.max(0,Number(y)||0)+"px");b.classList.add("skn-locked")}
  else{b.classList.remove("skn-locked");b.style.removeProperty("--skn-lock-top")}
}
function syncSidebar(){
  const rail=$("#rail"),button=$(".topbar .menu-btn")||$(".menu-btn");if(!rail)return;
  const narrow=innerWidth<=900,open=narrow&&rail.classList.contains("open"),hidden=!narrow&&prefs().sidebarHidden===true;
  const shown=narrow?open:!hidden;
  if(button){button.setAttribute("aria-controls","rail");button.setAttribute("aria-expanded",String(shown));const label=narrow?(open?"إغلاق قائمة التنقل":"فتح قائمة التنقل"):(hidden?"إظهار القائمة الجانبية":"إخفاء القائمة الجانبية");button.setAttribute("aria-label",label);button.title=label}
  if(!shown&&rail.contains(document.activeElement)&&button&&!sidebar.open)button.focus({preventScroll:true});
  rail.inert=!shown;rail.setAttribute("aria-hidden",String(!shown));
  const opening=open&&!sidebar.open,closing=!open&&sidebar.open;
  if(opening||closing)sidebar.restoreEpoch++;
  if(opening)sidebar.openView=core()&&core().view();
  if(opening&&!sidebar.scrollCaptured){sidebar.scrollY=window.scrollY;sidebar.scrollCaptured=true}
  if(opening){
    const b=document.body;sidebar.bodyStyle={position:b.style.position,top:b.style.top,left:b.style.left,right:b.style.right,width:b.style.width};
    b.classList.add("skn-locked");b.style.position="fixed";b.style.top=(-sidebar.scrollY)+"px";b.style.left="0";b.style.right="0";b.style.width="100%";
  }else if(closing){
    const b=document.body,lockedTop=parseFloat(b.style.top),lockedY=Number.isFinite(lockedTop)?Math.max(0,-lockedTop):sidebar.scrollY;
    rail.dataset.returnScrollY=String(lockedY);
    b.classList.remove("skn-locked");const s=sidebar.bodyStyle||{};
    b.style.position=s.position||"";b.style.top=s.top||"";b.style.left=s.left||"";b.style.right=s.right||"";b.style.width=s.width||"";sidebar.bodyStyle=null;
  }else document.body.classList.toggle("skn-locked",open);
  if(opening){
    sidebar.main=$(".maincol");sidebar.mainInert=!!(sidebar.main&&sidebar.main.inert);
    sidebar.opener=sidebar.opener&&sidebar.opener.isConnected?sidebar.opener:button;
    if(sidebar.main)sidebar.main.inert=true;
    const first=sidebarFocusables(rail)[0];if(first)first.focus({preventScroll:true});
  }else if(closing){
    if(sidebar.main)sidebar.main.inert=sidebar.mainInert;
    const routeClose=sidebar.route||sidebar.openView!==(core()&&core().view());
    const canReturn=el=>!!(el&&el.isConnected&&!el.inert&&!el.hidden&&!el.disabled&&!rail.contains(el)&&el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden"&&!(el.closest&&el.closest("[inert],[hidden]")));
    const liveMore=narrow&&sidebar.openerMore?$("#skb [data-more]"):null;const target=routeClose?$("#pg-title"):(canReturn(liveMore)?liveMore:canReturn(sidebar.opener)?sidebar.opener:button);
    if(target){if(routeClose&&!target.hasAttribute("tabindex"))target.setAttribute("tabindex","-1");if(!narrow&&target===button){target.focus();if(target.scrollIntoView)target.scrollIntoView({block:"nearest",inline:"nearest"})}else target.focus({preventScroll:true})}
    const y=Number(rail.dataset.returnScrollY||sidebar.scrollY||0);delete rail.dataset.returnScrollY;sidebar.main=null;sidebar.opener=null;sidebar.openerMore=false;sidebar.route=false;sidebar.openView=null;sidebar.scrollY=0;sidebar.scrollCaptured=false;
    /* fixed-body locking keeps the page visually still; unlock, flush layout, then restore the saved document offset. */
    lockPageScroll(false);void document.body.offsetHeight;
    if(narrow&&!routeClose&&Number.isFinite(y)&&Math.abs(window.scrollY-y)>1){const epoch=sidebar.restoreEpoch,view=core()&&core().view();const restore=()=>{if(epoch!==sidebar.restoreEpoch||rail.classList.contains("open")||(innerWidth<=900)!==narrow||(core()&&core().view())!==view)return;const se=document.scrollingElement;if(se)se.scrollTop=y;window.scrollTo(0,y)};restore();requestAnimationFrame(restore)}
  }
  sidebar.open=open;
}
function sidebarControls(){
  const rail=$("#rail"),button=$(".topbar .menu-btn")||$(".menu-btn");if(!rail)return;
  if(button&&!button.dataset.sidebarBound){button.dataset.sidebarBound="1";button.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();toggleSidebar()},true)}
  if(sidebar.rail!==rail){if(sidebar.observer)sidebar.observer.disconnect();sidebar.rail=rail;sidebar.observer=new MutationObserver(syncSidebar);sidebar.observer.observe(rail,{attributes:true,attributeFilter:["class"]})}
  sidebar.ready=true;syncSidebar();
}
function sidebarEvents(){
  document.addEventListener("click",e=>{const opener=e.target.closest('.menu-btn,#skb [data-more]');if(opener&&innerWidth<=900&&!sidebar.open){sidebar.opener=opener;sidebar.openerMore=!!opener.matches("#skb [data-more]")}if(sidebar.open&&e.target.closest('#rail .nav-btn'))sidebar.route=true},true);
  document.addEventListener("keydown",e=>{
    if(!sidebar.open||e.defaultPrevented)return;
    /* Core's bubbling Escape closes its drawer. Give exported child controllers first refusal. */
    if(e.key==="Escape"){
      let close=null;
      if(window.SKosifCommand&&window.SKosifCommand.isOpen())close=()=>window.SKosifCommand.close();
      else if(document.querySelector('.skk-wrap')&&window.SKosifKeys)close=()=>window.SKosifKeys.close();
      else if(document.querySelector('.sk-menu')&&window.SKosifTopbar)close=()=>{window.SKosifTopbar.closeMenu();const first=sidebarFocusables($("#rail"))[0];if(first)first.focus({preventScroll:true})};
      if(close){e.preventDefault();e.stopImmediatePropagation();close();return}
    }
    if(sidebarModal())return;
    const rail=$("#rail");if(!rail)return;
    if(e.key==="Escape"){
      if(e.target.matches&&e.target.matches('.skn-search input')&&e.target.value){e.preventDefault();e.stopImmediatePropagation();e.target.value="";navQ="";filterNav();return}
      e.preventDefault();e.stopImmediatePropagation();toggleSidebar();return;
    }
    if(e.key!=="Tab")return;const items=sidebarFocusables(rail);if(!items.length){e.preventDefault();return}
    const first=items[0],last=items[items.length-1];if(!rail.contains(document.activeElement)||(e.shiftKey&&document.activeElement===first)||(!e.shiftKey&&document.activeElement===last)){e.preventDefault();(e.shiftKey?last:first).focus()}
  },true);
  addEventListener("resize",()=>{
    const narrow=innerWidth<=900;if(narrow!==sidebar.narrow){sidebar.restoreEpoch++;sidebar.narrow=narrow;const c=core(),rail=$("#rail");if(rail&&rail.classList.contains("open")&&c)c.act("rail-close")}
    syncSidebar();
  },{passive:true});
}
/* installed on a laptop with the title bar hidden (Window Controls Overlay): a draggable strip */
function titlebar(){
  const on=document.documentElement.getAttribute("data-display")==="window-controls-overlay";let bar=$("#sk-wco");
  if(!on){if(bar)bar.remove();return}
  if(!bar){bar=document.createElement("div");bar.id="sk-wco";bar.className="sk-wco";bar.innerHTML='<div class="sk-wco-in"><b>SQC</b><span id="sk-wco-t"></span></div>';document.body.prepend(bar)}
  const c=core(),cap=c&&SK.caps.get(c.view()),t=$("#sk-wco-t");if(t)t.textContent=cap?cap.label:"";
}
function paint(){paintNav();paintTop();paintTabs();railToggle();titlebar();if(window.SKosifTopbar)SKosifTopbar.paint();sidebarControls()}

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
      '<label class="skx-custom" title="لون مخصص"><input type="color" id="skx-accent" value="'+esc(p.accent||"#2340c4")+'"><span>مخصص</span></label></div><small class="hint" id="skx-accent-note"></small></div>'+
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
  '<section class="card" id="skx-prefs"><div class="card-h"><div><h3>المظهر والأمان</h3><p>نظام تصميم متقدم بمظهر نهاري وليلي متكامل، والقفل التلقائي لهذا الجهاز.</p></div></div><div class="card-b sk-stack">'+
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
  /* R11 (docs/rebuild/HARSH_REVIEW_20261008_ar.md #8): in the audit section the core's identity card showed another
     company's name beside an open audit file; it says whose identity it is, and who signs the audit pages */
  if(SK.gate&&SK.gate.current&&SK.gate.current()==="audit"){const h=$$("h3",root).find(x=>x.textContent.trim()==="هوية المنشأة والتقارير"),card=h&&h.closest(".card"),head=card&&card.querySelector(".card-h");
    if(head&&!card.querySelector(".skx-idnote"))head.insertAdjacentHTML("afterend",'<p class="sk-note skx-idnote">هذه هوية المنشأة المفتوحة في البرنامج المحاسبي والأدوات، لا عميل ملف المراجعة. أوراق قسم المراجعة تُوقَّع باسم مكتبك وترخيصه من قائمة المستخدم.</p>')}
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
    if(mode==="open"&&dx>50){sidebar.scrollY=window.scrollY;sidebar.scrollCaptured=true;const r=$("#rail");if(r)r.dataset.returnScrollY=String(sidebar.scrollY);sidebar.opener=null;sidebar.openerMore=false;c.act("rail-open")}else if(mode==="close"&&dx<-60)toggleSidebar();
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
  toggleRail,toggleSidebar,tabs:tabIds,setTabs,tabLabel,defaultTabs:(g)=>(TABS_BY_GATE[g||currentGate()]||TABS_BY_GATE.accounting||TABS).slice(),tabMax:TAB_MAX});

function boot(){
  identityMetadata();
  const c=core();
  SK._flush();
  if(c){
    c.setAdvanced(SK.caps.advancedIds());
    c.onView("settings",settingsCards);
    c.onView("customers",customerCards);
  }
  addEventListener("sk:render",()=>{gate();domainTabs();paintTabs();paintTop()});
  addEventListener("resize",()=>{if(innerWidth>900){const r=$("#rail");if(r&&r.classList.contains("open")&&c)c.act("rail-close")}},{passive:true});
  addEventListener("online",offline);addEventListener("offline",offline);offline();
  SK.bus.on("device",()=>titlebar());
  swipe();hints();sidebarEvents();
  SK.bus.on("role",()=>{lastSig="";paint()});
  paint();gate();updates();
  Object.freeze(window.SK);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();

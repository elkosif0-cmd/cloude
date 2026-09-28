/* S.kosif core — the device this copy runs on (SK.device).
   One answer to "iPhone or laptop?": the platform (iOS, iPadOS, macOS, Windows, Android),
   the form factor (phone, tablet, laptop), whether the app is installed (home screen / dock /
   window) and which modifier key to show (⌘ or Ctrl). It marks <html> with data-device,
   data-os and data-standalone so the design system can adapt, keeps the browser's install
   prompt for the laptop, opens deep links (?go=screen, ?do=action, #screen — used by the manifest
   shortcuts and by the Shortcuts app on the iPhone) and wraps the share sheet (AirDrop,
   WhatsApp, Files) with a download fallback. */
(()=>{
"use strict";
const nav=navigator,ua=nav.userAgent||"",plat=String((nav.userAgentData&&nav.userAgentData.platform)||nav.platform||"");
const touch=(nav.maxTouchPoints||0)>1;
/* iPadOS 13+ reports itself as a Mac; a Mac with touch points is an iPad */
const os=/iPhone|iPod/.test(ua)?"ios":/iPad/.test(ua)||(/Mac/.test(plat)&&touch)?"ipados":/Android/i.test(ua)?"android":
  /Mac/.test(plat)?"macos":/Win/.test(plat)?"windows":/CrOS/.test(ua)?"chromeos":/Linux/.test(plat)?"linux":"other";
const apple=os==="ios"||os==="ipados"||os==="macos";
const mm=q=>{try{return matchMedia(q).matches}catch{return false}};
function kind(){
  if(os==="ios")return "phone";
  if(os==="ipados")return "tablet";
  const coarse=mm("(pointer:coarse)")&&!mm("(any-pointer:fine)"),short=Math.min(screen.width||innerWidth,screen.height||innerHeight);
  if(coarse)return short<600?"phone":"tablet";
  return "laptop";
}
const MODES=["window-controls-overlay","standalone","fullscreen","minimal-ui"];
function displayMode(){if(nav.standalone===true)return "standalone";for(const m of MODES)if(mm("(display-mode: "+m+")"))return m;return "browser"}
const standalone=()=>displayMode()!=="browser";
const isSafari=/Safari/.test(ua)&&!/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|Android/.test(ua);
const OS_LABEL={ios:"iPhone",ipados:"iPad",macos:"Mac",windows:"Windows",android:"Android",chromeos:"ChromeOS",linux:"Linux",other:"جهاز"};
const KIND_LABEL={phone:"جوال",tablet:"جهاز لوحي",laptop:"لابتوب / مكتبي"};
const label=()=>OS_LABEL[os]+" · "+KIND_LABEL[kind()];
/* the modifier shown in hints: ⌘ on Apple keyboards, Ctrl elsewhere */
const mod=apple?"⌘":"Ctrl";
const keyHint=k=>os==="ios"?"":mod+(apple?"":"+")+k;

function mark(){
  const de=document.documentElement;
  de.setAttribute("data-device",kind());de.setAttribute("data-os",os);
  de.setAttribute("data-standalone",String(standalone()));de.setAttribute("data-display",displayMode());
}
mark();
MODES.forEach(m=>{try{matchMedia("(display-mode: "+m+")").addEventListener("change",()=>{mark();SK.bus&&SK.bus.emit("device",{display:displayMode()})})}catch{}});

/* ---------- install: the browser prompt on laptops/Android, the Share → Home Screen steps on iOS ---------- */
let deferred=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;SK.bus&&SK.bus.emit("device",{installable:true})});
addEventListener("appinstalled",()=>{deferred=null;mark();SK.toast&&SK.toast("ثُبّت SQC على هذا الجهاز","ok");SK.bus&&SK.bus.emit("device",{installed:true})});
function installMode(){
  if(standalone())return "installed";
  if(deferred)return "prompt";
  if(os==="ios"||os==="ipados")return isSafari?"ios":"ios-other";
  if(os==="macos"&&isSafari)return "mac-safari";
  return "manual";
}
const STEPS={
  ios:["اضغط زر المشاركة ⬆︎ أسفل Safari.","اختر «إضافة إلى الشاشة الرئيسية».","اضغط «إضافة» — يفتح SQC بعدها بملء الشاشة ويعمل دون اتصال."],
  "ios-other":["افتح هذا الرابط في Safari (التثبيت على الآيفون يتم من Safari).","زر المشاركة ⬆︎ ← «إضافة إلى الشاشة الرئيسية»."],
  "mac-safari":["من قائمة «ملف» في Safari اختر «إضافة إلى Dock».","يظهر SQC في Dock كتطبيق مستقل بنافذته الخاصة."],
  manual:["في Chrome أو Edge: أيقونة التثبيت ⊕ في شريط العنوان، أو القائمة ⋮ ← «تثبيت SQC».","يفتح بعدها في نافذة مستقلة ويظهر في قائمة ابدأ أو Launchpad."],
  installed:["SQC مثبّت ويعمل كتطبيق على هذا الجهاز."]
};
async function install(){
  const m=installMode();
  if(m==="prompt"&&deferred){
    const e=deferred;deferred=null;
    try{await e.prompt();const r=await e.userChoice;return r&&r.outcome==="accepted"}catch(err){SK.errors.report(err,"install",{silent:true})}
    return false;
  }
  await SK.notify(STEPS[m].map((s,i)=>(i+1)+") "+s).join("\n"),{title:m==="installed"?"مثبّت":"تثبيت SQC على "+OS_LABEL[os]});
  return false;
}

/* ---------- storage: ask the browser to keep this device's data (Safari evicts idle site data) ---------- */
async function storage(){
  const out={persisted:null,usage:null,quota:null};
  try{if(nav.storage&&nav.storage.persisted)out.persisted=await nav.storage.persisted()}catch{}
  try{if(nav.storage&&nav.storage.estimate){const e=await nav.storage.estimate();out.usage=e.usage;out.quota=e.quota}}catch{}
  return out;
}
async function persist(){try{return !!(nav.storage&&nav.storage.persist&&await nav.storage.persist())}catch{return false}}
/* offline copy: a service worker controls the page and a build cache exists */
async function offlineReady(){
  try{if(!("serviceWorker" in nav)||!nav.serviceWorker.controller||!window.caches)return false;return (await caches.keys()).some(k=>k.startsWith("skosif-"))}catch{return false}
}

/* ---------- share sheet (AirDrop · WhatsApp · Files) with a download fallback ---------- */
function canShareFiles(files){try{return !!(nav.canShare&&nav.share&&nav.canShare({files}))}catch{return false}}
async function share({title,text,files,url}={}){
  const f=(files||[]).filter(Boolean);
  try{
    if(f.length&&canShareFiles(f)){await nav.share({title,text,files:f});return "shared"}
    if(!f.length&&nav.share){await nav.share({title,text,url});return "shared"}
  }catch(e){if(e&&e.name==="AbortError")return "cancelled";SK.errors.report(e,"share",{silent:true})}
  if(f.length){f.forEach(x=>SK.download(x.name,x));return "downloaded"}
  try{await nav.clipboard.writeText([text,url].filter(Boolean).join("\n"));SK.toast("نُسخ إلى الحافظة","ok");return "copied"}catch{return "failed"}
}

/* ---------- deep links: ?go=<screen>, ?do=<action> and #<screen> (manifest shortcuts, Shortcuts app, bookmarks) ---------- */
const DO={
  sale:c=>SK.perm.can("commerce","create")&&c.act("v12-sale-new"),
  search:()=>window.SKosifCommand&&SKosifCommand.open(),
  item:c=>{if(!SK.perm.can("catalog","create"))return;c.go("catalog");setTimeout(()=>c.act("item-new",{source:"catalog"}),150)},
  keys:()=>window.SKosifKeys&&SKosifKeys.help()
};
/* the first start fills the sample data and reloads the page after the link has been read (and the address cleaned):
   the link waits in this tab's session and is applied again after that reload; it is forgotten once the app has
   settled (no demo overlay on screen), so a later refresh does not jump again */
const PENDING="sk_deeplink";
/* #screen links (https://…/#salesmap, #sales, #المبيعات): the address names the screen that is open. A link
   opens it (also through the sign-in page, which keeps the address), and moving between screens rewrites the hash
   in place (replaceState — the back button is not flooded). The hash read at load is kept before the core's first
   render can rewrite it. */
const HASH_ALIAS={sales:"salesmap",orders:"commerce",pos:"zatca",invoice:"zatca",customers:"customers",audit:"tbreview",engagement:"tbreview",
  helpers:"helperdesk",home:"dash",books:"ledger",entries:"jesim",inventory:"inventory",reports:"auditreport",benchmark:"benchmarks",jev:"jev"};
const HOME="dash";
function screenOf(h){
  let k=String(h||"").replace(/^#\/?/,"");try{k=decodeURIComponent(k)}catch{}
  k=k.trim();if(!k)return null;
  const low=k.toLowerCase(),all=SK.caps.all();
  const c=SK.caps.get(k)||SK.caps.get(low)||SK.caps.get(HASH_ALIAS[low]||"")||all.find(x=>x.label===k||x.hubLabel===k)||null;
  return c&&SK.perm.can(c.id)?c.id:null;
}
const START_HASH=location.hash;
function syncHash(){
  const c=window.SKosifCore;if(!c)return;
  const v=c.view(),want=v&&v!==HOME&&SK.caps.get(v)?"#"+v:"";
  if(location.hash===want)return;
  try{history.replaceState(history.state,"",location.pathname+location.search+want)}catch{}
}
let syncing=false,syncT=0;
function followNav(){if(!syncing)return;clearTimeout(syncT);syncT=setTimeout(syncHash,60)}
addEventListener("hashchange",()=>{const id=screenOf(location.hash),c=window.SKosifCore;if(id&&c&&c.view()!==id)c.go(id);else if(!id&&syncing)setTimeout(syncHash,0)});
function deepLink(){
  let q;try{q=new URLSearchParams(location.search)}catch{return}
  let go=q.get("go"),act=q.get("do");const c=window.SKosifCore;
  if(!go&&!act)go=screenOf(START_HASH);
  syncing=true;SK.bus&&SK.bus.on("nav",followNav);setTimeout(syncHash,400);
  try{if(go||act)sessionStorage.setItem(PENDING,JSON.stringify({go,act,at:Date.now()}));
    else{const p=JSON.parse(sessionStorage.getItem(PENDING)||"null");if(p&&Date.now()-p.at<60000){go=p.go;act=p.act}}}catch{}
  if(!c||(!go&&!act))return;
  const settle=()=>{if(document.querySelector(".skdemo-overlay"))return setTimeout(settle,1000);try{sessionStorage.removeItem(PENDING)}catch{}};
  setTimeout(settle,2500);
  try{history.replaceState(history.state,"",location.pathname+location.hash)}catch{}
  if(go&&SK.caps.get(go)&&SK.perm.can(go))c.go(go);
  if(act&&DO[act])setTimeout(()=>{try{DO[act](c)}catch(e){SK.errors.report(e,"deeplink:"+act)}},200);
}
function link(params){const u=new URL(location.href.split(/[?#]/)[0]);Object.entries(params||{}).forEach(([k,v])=>u.searchParams.set(k,v));return u.href}
/* after the core has booted (its boot runs on DOMContentLoaded, after this deferred bundle) */
let linked=false;const boot=()=>{if(linked)return;linked=true;setTimeout(deepLink,120)};
if(document.readyState==="complete")boot();else{document.addEventListener("DOMContentLoaded",boot,{once:true});addEventListener("load",boot,{once:true})}

SK.device=Object.freeze({os,apple,mod,keyHint,kind,label,displayMode,standalone,isSafari,
  installMode,install,installSteps:()=>STEPS[installMode()]||STEPS.manual,
  storage,persist,offlineReady,share,canShareFiles,link,actions:()=>Object.keys(DO)});
})();

/* S.kosif — الأجهزة والمزامنة: نسخة الآيفون ونسخة اللابتوب من التطبيق نفسه.
   • هذا الجهاز: النوع، طريقة التشغيل (مثبّت أو متصفح)، الجاهزية دون اتصال، مساحة التخزين والحفظ الدائم.
   • النقل بين الأجهزة: حزمة مشفرة (AES-GCM 256 بمفتاح PBKDF2-SHA-256 من «رمز النقل») تحمل النسخة
     الكاملة نفسها التي يصنعها SK.store، تُرسل بورقة المشاركة (AirDrop · واتساب · الملفات) أو تُنزّل؛
     الاستقبال يفك التشفير ثم يعرض معاينة جافة قبل أي كتابة، مع نقطة رجوع.
   • شريط الجوال السفلي: المستخدم يختار شاشاته الأربع.
   • اللابتوب: القائمة المطوية واختصارات لوحة المفاتيح وروابط سريعة (?go= / ?do=) لتطبيق «الاختصارات».
   لا يغادر الجهازَ شيءٌ إلا بقرار المستخدم؛ الرمز لا يُحفظ أبداً. */
(()=>{
"use strict";
const {$,$$,esc,toast}=SK;
const D=()=>SK.device;
const FORMAT="skosif-transfer",ITER=250000,LOG="sk-device-log";
const ALPHA="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
let root=null,code="",incoming=null,info=null;

/* ---------- bytes ⇄ base64 (chunked: backups can be several MB) ---------- */
function b64(bytes){let s="";for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s)}
function unb64(str){const x=atob(str),a=new Uint8Array(x.length);for(let i=0;i<x.length;i++)a[i]=x.charCodeAt(i);return a}
async function pipe(bytes,stream){return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer())}
const gzipOk=()=>typeof CompressionStream==="function"&&typeof DecompressionStream==="function";

/* ---------- transfer code: 12 unambiguous characters (≈59 bits) shown as XXXX-XXXX-XXXX ---------- */
function newCode(){const r=crypto.getRandomValues(new Uint8Array(12));let s="";r.forEach(v=>{s+=ALPHA[v%ALPHA.length]});return s.replace(/(.{4})(?=.)/g,"$1-")}
const normCode=c=>String(c||"").normalize("NFC").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[\s\-–—_]/g,"").toUpperCase();
async function keyFor(c,salt,iterations){
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(normCode(c)),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",hash:"SHA-256",salt,iterations},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function seal(c){
  const backup=await SK.store.data(),plain=new TextEncoder().encode(JSON.stringify(backup));
  const gz=gzipOk(),body=gz?await pipe(plain,new CompressionStream("gzip")):plain;
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await keyFor(c,salt,ITER),body));
  const pkg={format:FORMAT,version:1,app:"S.kosif",createdAt:backup.createdAt,from:D().label(),counts:backup.counts,
    kdf:{name:"PBKDF2",hash:"SHA-256",iterations:ITER,salt:b64(salt)},cipher:{name:"AES-GCM",iv:b64(iv)},gz,data:b64(ct)};
  return{pkg,counts:backup.counts,bytes:plain.length};
}
async function open(pkg,c){
  if(!pkg||pkg.format!==FORMAT)throw new Error("هذا ليس ملف نقل من KOSIF");
  let body;
  try{body=new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(pkg.cipher.iv)},await keyFor(c,unb64(pkg.kdf.salt),pkg.kdf.iterations),unb64(pkg.data)))}
  catch{throw new Error("رمز النقل غير صحيح، أو الملف تغيّر بعد إرساله")}
  if(pkg.gz){if(!gzipOk())throw new Error("هذا المتصفح لا يدعم فك ضغط الحزمة — حدّث النظام أو استخدم Safari/Chrome حديثاً");body=await pipe(body,new DecompressionStream("gzip"))}
  return new TextDecoder().decode(body);
}

/* ---------- small helpers ---------- */
const fmtB=n=>n==null?"—":n<1024*1024?Math.max(1,Math.round(n/1024))+" ك.ب":(n/1048576).toFixed(n<10485760?1:0)+" م.ب";
const rowsOf=counts=>Object.values((counts&&counts.rows)||{}).reduce((a,b)=>a+b,0);
function logEvent(e){try{const l=JSON.parse(localStorage.getItem(LOG)||"[]");l.unshift({at:new Date().toISOString(),...e});localStorage.setItem(LOG,JSON.stringify(l.slice(0,12)))}catch{}}
function logList(){try{return JSON.parse(localStorage.getItem(LOG)||"[]")}catch{return[]}}
const when=iso=>{try{return new Date(iso).toLocaleString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch{return String(iso||"").slice(0,16)}};
const DISPLAY={browser:"في المتصفح","standalone":"مثبّت كتطبيق","window-controls-overlay":"مثبّت — نافذة بلا شريط عنوان","fullscreen":"ملء الشاشة","minimal-ui":"مثبّت (واجهة مختصرة)"};

/* ---------- cards ---------- */
function deviceCard(){
  const d=D(),inst=d.standalone(),m=d.installMode(),i=info||{};
  const evict=(d.os==="ios"||d.os==="ipados")&&!inst;
  return '<section class="card" id="dv-me"><div class="card-h"><div><h3>هذا الجهاز</h3><p>نفس التطبيق ونفس البيانات على الآيفون واللابتوب؛ كل جهاز يحفظ نسخته محلياً ويعمل دون اتصال.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-kpis">'+
      '<div class="sk-kpi accent"><span>الجهاز</span><b>'+esc(d.label())+'</b><small>'+esc(d.kind()==="phone"?"واجهة لمس بشريط سفلي وسحب للقائمة":d.apple?"اختصارات بمفتاح ⌘":"اختصارات بمفتاح Ctrl")+'</small></div>'+
      '<div class="sk-kpi '+(inst?"good":"warn")+'"><span>طريقة التشغيل</span><b>'+esc(DISPLAY[d.displayMode()]||"—")+'</b><small>'+(inst?"يفتح من أيقونته مباشرة":"ثبّته ليعمل كتطبيق")+'</small></div>'+
      '<div class="sk-kpi '+(i.offline?"good":i.offline===false?"warn":"")+'"><span>العمل دون اتصال</span><b>'+(i.offline==null?"…":i.offline?"جاهز":"بعد أول تحميل كامل")+'</b><small>'+(navigator.onLine?"متصل الآن":"غير متصل الآن")+'</small></div>'+
      '<div class="sk-kpi '+(i.persisted?"good":i.persisted===false?"warn":"")+'"><span>التخزين على الجهاز</span><b>'+(i.usage==null?"…":fmtB(i.usage))+'</b><small>'+(i.persisted?"محمي من الحذف التلقائي":i.persisted===false?"غير محمي من الحذف التلقائي":"")+(i.quota?" · من "+fmtB(i.quota):"")+'</small></div>'+
    '</div>'+
    (evict?'<div class="sk-note warn"><b>مهم للآيفون:</b> Safari قد يحذف بيانات المواقع التي لا تُفتح 7 أيام. التطبيق المثبّت على الشاشة الرئيسية مستثنى من ذلك — ثبّته وخذ نسخة نقل دورية.</div>':'')+
    '<div class="sk-actions">'+
      (inst?'':'<button type="button" class="btn primary" data-dv="install">'+SK.icon(d.kind()==="laptop"?"laptop":"phone")+(m==="prompt"?" تثبيت الآن":" كيف أثبّته؟")+'</button>')+
      (i.persisted===false?'<button type="button" class="btn" data-dv="persist">'+SK.icon("lock")+' اطلب حفظاً دائماً</button>':'')+
      '<button type="button" class="btn" data-dv="keys">'+SK.icon("keyboard")+' اختصارات لوحة المفاتيح</button>'+
    '</div></div></section>';
}
function transferCard(){
  const canOut=SK.perm.can("settings","export"),canIn=SK.perm.can("settings","import"),u=SK.store.usage(),log=logList(),d=D();
  const shareHint=d.os==="ios"||d.os==="ipados"?"تظهر ورقة المشاركة: اختر AirDrop إلى الماك، أو «حفظ في الملفات»، أو أرسلها لنفسك في واتساب.":
    d.canShareFiles&&d.canShareFiles([new File(["x"],"x.json",{type:"application/json"})])?"تظهر ورقة المشاركة، أو يُنزَّل الملف إن أغلقتها.":"يُنزَّل الملف؛ أرسله للآيفون عبر AirDrop أو واتساب أو iCloud Drive.";
  return '<section class="card" id="dv-sync"><div class="card-h"><div><h3>النقل بين الآيفون واللابتوب</h3><p>انقل كل بياناتك من جهاز إلى آخر في حزمة مشفرة: لا خادم، ولا حساب، ولا تُفتح الحزمة إلا برمز النقل.</p></div></div><div class="card-b">'+
    '<div class="dv-sync">'+
      '<div class="dv-pane"><h4>'+SK.icon("share")+' إرسال من هذا الجهاز</h4>'+
        (canOut?'<p class="hint">سيُضمَّن '+u.keys+' مفتاح بيانات (~'+fmtB(u.bytes)+') مع قاعدة بيانات العملاء والمبيعات.</p>'+
          '<div class="dv-code" aria-live="polite"><span>رمز النقل</span><b dir="ltr" id="dv-code">'+esc(code)+'</b><button type="button" class="btn sm" data-dv="copy-code">نسخ</button><button type="button" class="btn sm" data-dv="new-code">رمز جديد</button></div>'+
          '<p class="hint">اكتب هذا الرمز على الجهاز الآخر. لا يُحفظ في أي مكان — أرسله منفصلاً عن الملف.</p>'+
          '<div class="sk-actions"><button type="button" class="btn primary" data-dv="send">'+SK.icon("share")+' تجهيز الحزمة ومشاركتها</button></div>'+
          '<p class="hint">'+esc(shareHint)+'</p><div class="hint" id="dv-send-out"></div>'
        :'<div class="sk-note">الإرسال يحتاج صلاحية التصدير لدور «'+esc(SK.perm.label())+'».</div>')+
      '</div>'+
      '<div class="dv-pane"><h4>'+SK.icon("exports")+' استقبال على هذا الجهاز</h4>'+
        (canIn?'<label class="sk-field"><span>ملف النقل (KOSIF-transfer-….json)</span><input type="file" id="dv-file" accept=".json,application/json"></label>'+
          '<label class="sk-field"><span>رمز النقل</span><input id="dv-in-code" dir="ltr" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX"></label>'+
          '<div class="sk-actions"><button type="button" class="btn primary" data-dv="open">فك التشفير ومعاينة</button>'+(SK.store.hasSnapshot()?'<button type="button" class="btn" data-dv="rollback">التراجع عن آخر استيراد</button>':'')+'</div>'+
          '<div id="dv-in-out" class="hint">لن يُكتب شيء قبل أن ترى ما سيتغير وتوافق عليه، ويُحتفظ بنقطة رجوع.</div>'
        :'<div class="sk-note">الاستقبال يحتاج صلاحية الاستيراد لدور «'+esc(SK.perm.label())+'».</div>')+
      '</div>'+
    '</div>'+
    (log.length?'<details class="dv-log"><summary>سجل النقل على هذا الجهاز ('+log.length+')</summary><ul>'+log.map(e=>'<li><b>'+(e.dir==="out"?"أُرسلت":"استُقبلت")+'</b> '+esc(when(e.at))+(e.from?' · من '+esc(e.from):'')+(e.keys!=null?' · '+e.keys+' مفتاح و'+(e.rows||0)+' سجل':'')+(e.via?' · '+esc(e.via):'')+'</li>').join("")+'</ul></details>':'')+
  '</div></section>';
}
function tabsCard(){
  const S=window.SKosifShell;if(!S)return "";
  const sel=S.tabs(),max=S.tabMax;
  const groups=SK.caps.groups().map(g=>[g,SK.caps.inGroup(g.id).filter(c=>c.primary&&!c.hidden&&SK.perm.can(c.id))]).filter(([,l])=>l.length);
  return '<section class="card" id="dv-tabs"><div class="card-h"><div><h3>شريط الجوال السفلي</h3><p>اختر حتى '+max+' شاشات تظهر أسفل الشاشة على الآيفون، بالترتيب الذي تختاره؛ الباقي من «المزيد».</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn sm" data-dv="tabs-reset">الافتراضي</button></div></div><div class="card-b sk-stack">'+
    '<div class="dv-bar" aria-label="معاينة الشريط">'+sel.map(id=>'<span>'+SK.icon(id)+'<small>'+esc(S.tabLabel(id))+'</small></span>').join("")+
      '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg><small>المزيد</small></span></div>'+
    groups.map(([g,list])=>'<div class="dv-tabgrp"><h5>'+esc(g.label)+'</h5><div class="sk-chips">'+list.map(c=>{const n=sel.indexOf(c.id);return '<button type="button" class="chip" data-tab="'+c.id+'" aria-pressed="'+(n>=0)+'">'+(n>=0?'<i>'+(n+1)+'</i>':'')+esc(c.label)+'</button>'}).join("")+'</div></div>').join("")+
  '</div></section>';
}
function laptopCard(){
  const S=window.SKosifShell,d=D(),mini=S&&S.prefs().rail==="mini";
  const links=[["فاتورة ضريبية جديدة",{go:"zatca"}],["تسجيل عملية بيع",{do:"sale"}],["المخزون",{go:"inventory"}],["المهام",{go:"tasks"}],["بحث وانتقال سريع",{do:"search"}]];
  const top=[["بحث وانتقال سريع",[d.mod,"K"]],["كل الاختصارات",["?"]],["طيّ القائمة",[d.mod,"B"]],["المجالات العشرة",[d.apple?"⌥":"Alt","1…0"]],["الشاشة التالية/السابقة",["]","["]],["مركز القيادة",["G","H"]],["الطلبات",["G","O"]],["المخزون",["G","I"]]];
  return '<section class="card" id="dv-laptop"><div class="card-h"><div><h3>اللابتوب ولوحة المفاتيح</h3><p>على الماك وويندوز: نافذة مستقلة، قائمة يمكن طيّها، وتنقّل كامل من لوحة المفاتيح — بالعربي أو الإنجليزي.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-field"><span>القائمة الجانبية على الشاشات الواسعة</span><div class="sk-seg" role="group" id="dv-rail"><button type="button" data-railmode="full" aria-pressed="'+!mini+'">كاملة بالأسماء</button><button type="button" data-railmode="mini" aria-pressed="'+mini+'">أيقونات فقط</button></div></div>'+
    '<div class="dv-keys">'+top.map(([l,ks])=>'<div class="skd-keys"><span>'+esc(l)+'</span><span dir="ltr">'+ks.map(x=>'<kbd>'+esc(x)+'</kbd>').join(" ")+'</span></div>').join("")+'</div>'+
    '<div class="sk-actions"><button type="button" class="btn" data-dv="keys">'+SK.icon("keyboard")+' كل الاختصارات</button></div>'+
    '<h4 class="dv-h4">روابط سريعة</h4><p class="hint">كل رابط يفتح KOSIF على شاشة أو إجراء مباشرة (بعد كلمة المرور). على الآيفون: ضعه في تطبيق «الاختصارات» بإجراء «فتح عناوين URL» ليعمل من Siri والشاشة الرئيسية. على اللابتوب: ضعه في المفضلة. وعند التثبيت تظهر أربعة منها بالضغط المطوّل على الأيقونة.</p>'+
    '<div class="dv-links">'+links.map(([l,p])=>{const u=d.link(p);return '<div class="dv-link"><b>'+esc(l)+'</b><code dir="ltr">'+esc(u.replace(/^https?:\/\//,""))+'</code><button type="button" class="btn sm" data-dv="copy-link" data-u="'+esc(u)+'">نسخ</button></div>'}).join("")+'</div>'+
  '</div></section>';
}
function paint(){
  if(!root)return;
  if(!code)code=newCode();
  root.innerHTML='<div class="dv">'+deviceCard()+transferCard()+tabsCard()+laptopCard()+'</div>';
}
async function refreshInfo(){
  const d=D(),[st,off]=await Promise.all([d.storage(),d.offlineReady()]);
  info={...st,offline:off};
  const me=root&&$("#dv-me",root);if(me)me.outerHTML=deviceCard();
}

/* ---------- actions ---------- */
/* two steps where a share sheet exists: iOS only opens it straight from a tap, and sealing takes a moment */
let ready=null;
async function send(btn){
  const out=$("#dv-send-out",root);btn.disabled=true;ready=null;out.textContent="جارٍ تجميع البيانات وتشفيرها…";
  try{
    const {pkg,counts}=await seal(code);
    const day=new Date().toISOString().slice(0,10),name="KOSIF-transfer-"+D().os+"-"+day+".json";
    ready={file:new File([JSON.stringify(pkg)],name,{type:"application/json"}),counts,code};
    if(D().canShareFiles([ready.file]))out.innerHTML='الحزمة جاهزة ('+esc(fmtB(ready.file.size))+'). <button type="button" class="btn sm primary" data-dv="share-now">'+SK.icon("share")+' مشاركة الآن</button> <button type="button" class="btn sm" data-dv="download-now">تنزيل الملف</button>';
    else await deliver("download");
  }catch(e){out.textContent="";SK.errors.report(e,"transfer:send")}
  finally{btn.disabled=false}
}
async function deliver(mode){
  const out=$("#dv-send-out",root);if(!ready)return;
  const {file,counts}=ready;
  const how=mode==="share"?await D().share({files:[file],title:"KOSIF — حزمة نقل",text:"حزمة نقل مشفرة من KOSIF ("+D().label()+"). افتحها من «الأجهزة والمزامنة» بالرمز الذي أرسلته لك منفصلاً."}):(SK.download(file.name,file),"downloaded");
  if(how==="cancelled"){toast("أُلغيت المشاركة — لم يُرسل شيء","info");return}
  const via={shared:"ورقة المشاركة",downloaded:"تنزيل ملف"}[how]||how;
  logEvent({dir:"out",keys:counts.keys,rows:rowsOf(counts),via});
  SK.audit&&SK.audit.log("transfer",{act:"send",keys:counts.keys});
  out.innerHTML="جاهزة ("+esc(fmtB(file.size))+") — "+esc(via)+". اكتب الرمز <b dir=\"ltr\">"+esc(ready.code)+"</b> على الجهاز الآخر.";
  toast("حزمة النقل جاهزة","ok");
}
async function openIncoming(btn){
  const out=$("#dv-in-out",root),f=$("#dv-file",root).files[0],c=$("#dv-in-code",root).value;
  if(!f){out.textContent="اختر ملف النقل أولاً.";return}
  if(normCode(c).length<6){out.textContent="اكتب رمز النقل كما ظهر على الجهاز المرسل.";return}
  btn.disabled=true;out.textContent="جارٍ فك التشفير…";
  try{
    let pkg;try{pkg=JSON.parse(await f.text())}catch{throw new Error("الملف ليس حزمة نقل صالحة")}
    const text=await open(pkg,c),p=await SK.store.restore(text,{dryRun:true});
    incoming={text,pkg,p};
    const rows=Object.entries(p.rows).filter(([,n])=>n).map(([k,n])=>esc(k)+": "+n).join("، ")||"لا سجلات قاعدة بيانات";
    out.innerHTML='<div class="sk-note"><b>الحزمة سليمة</b> — من '+esc(pkg.from||"جهاز آخر")+' بتاريخ '+esc(when(pkg.createdAt))+'<br>'+
      'مفاتيح جديدة: '+p.keys.add.length+' · ستتغير: '+p.keys.change.length+' · مطابقة: '+p.keys.same.length+'<br>سجلات قاعدة البيانات (تستبدل الحالية): '+rows+'<br>مفاتيح موجودة هنا وليست في الحزمة تبقى كما هي: '+p.untouched.length+'</div>'+
      '<div class="sk-actions"><button type="button" class="btn primary" data-dv="apply">استيراد الآن</button><button type="button" class="btn" data-dv="discard">إلغاء</button></div>';
  }catch(e){incoming=null;out.textContent=String(e&&e.message||e)}
  finally{btn.disabled=false}
}
async function apply(){
  const out=$("#dv-in-out",root);if(!incoming)return;
  if(!await SK.confirm("ستُستبدل بيانات هذا الجهاز بما في الحزمة (مع الاحتفاظ بنقطة رجوع). متابعة؟",{title:"استيراد حزمة النقل",ok:"استيراد"}))return;
  try{
    const {pkg,p}=incoming;await SK.store.restore(incoming.text);incoming=null;
    logEvent({dir:"in",from:pkg.from,keys:Object.keys(p._b.local).length,rows:Object.values(p.rows).reduce((a,b)=>a+b,0)});
    SK.audit&&SK.audit.log("transfer",{act:"receive",keys:Object.keys(p._b.local).length});
    out.innerHTML='تم الاستيراد. <button type="button" class="btn sm primary" data-dv="reload">إعادة التحميل لتطبيقه</button> <button type="button" class="btn sm" data-dv="snap">تنزيل نقطة الرجوع</button>';
    toast("تم الاستيراد — أعد التحميل","ok");
  }catch(e){SK.errors.report(e,"transfer:apply")}
}
function toggleTab(id){
  const S=window.SKosifShell;let sel=S.tabs();
  if(sel.includes(id))sel=sel.filter(x=>x!==id);
  else if(sel.length>=S.tabMax){toast("أربع شاشات كحد أقصى — أزل واحدة أولاً","info");return}
  else sel=[...sel,id];
  if(!sel.length){toast("اترك شاشة واحدة على الأقل","info");return}
  S.setTabs(sel);$("#dv-tabs",root).outerHTML=tabsCard();
}
async function copy(text,msg){try{await navigator.clipboard.writeText(text);toast(msg||"نُسخ","ok")}catch{toast("تعذر النسخ — انسخه يدوياً","err")}}
function bind(node){
  node.addEventListener("click",async e=>{
    const t=e.target.closest("[data-tab]");if(t){toggleTab(t.dataset.tab);return}
    /* (<html> carries data-rail, so the picker buttons use their own attribute) */
    const r=e.target.closest("[data-railmode]");if(r){SKosifShell.toggleRail(r.dataset.railmode==="mini");$$("#dv-rail button",node).forEach(b=>b.setAttribute("aria-pressed",String(b===r)));return}
    const b=e.target.closest("[data-dv]");if(!b)return;
    const a=b.dataset.dv;
    if(a==="install"){if(await D().install())refreshInfo()}
    else if(a==="persist"){const ok=await D().persist();toast(ok?"سيحتفظ المتصفح ببيانات هذا الجهاز":"رفض المتصفح الطلب — التثبيت كتطبيق يحمي البيانات",ok?"ok":"info");refreshInfo()}
    else if(a==="keys")window.SKosifKeys&&SKosifKeys.help();
    else if(a==="copy-code")copy(code,"نُسخ رمز النقل");
    else if(a==="new-code"){code=newCode();ready=null;$("#dv-code",node).textContent=code;$("#dv-send-out",node).textContent=""}
    else if(a==="send")send(b);
    else if(a==="share-now")deliver("share");
    else if(a==="download-now")deliver("download");
    else if(a==="open")openIncoming(b);
    else if(a==="apply")apply();
    else if(a==="discard"){incoming=null;$("#dv-in-out",node).textContent="أُلغي — لم يُكتب شيء."}
    else if(a==="reload")location.reload();
    else if(a==="snap")SK.store.downloadSnapshot();
    else if(a==="rollback"){if(!await SK.confirm("إرجاع بيانات هذا الجهاز كما كانت قبل آخر استيراد؟",{ok:"تراجع"}))return;try{await SK.store.rollback();toast("تم التراجع — أعد التحميل","ok");setTimeout(()=>location.reload(),900)}catch(err){SK.errors.report(err,"transfer:rollback")}}
    else if(a==="tabs-reset"){SKosifShell.setTabs(SKosifShell.defaultTabs());$("#dv-tabs",node).outerHTML=tabsCard()}
    else if(a==="copy-link")copy(b.dataset.u,"نُسخ الرابط");
  });
}
SK.view("devices",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint();refreshInfo()}});
SK.bus.on("device",()=>{if(root&&root.isConnected)refreshInfo()});
})();

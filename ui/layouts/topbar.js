/* S.kosif layout — the KOSIF Luxe top bar and page header (window.SKosifTopbar).
   Rebuilds the core's header into the approved SQC layout without touching the core's DOM
   contract (#pg-title, #pg-sub, #hdr keep their ids; the core keeps writing them):
     top bar   : [☰] [KOSIF] [الشركة ▾] [الفترة ▾] [بحث ⌘K] … [🔔 n] [الاسم · الدور ◯]
     page head : [icon] العنوان / English name / الوصف          [إجراءات الشاشة]
   The company and period are the same active company/period the ledger uses
   (skosif_companies_v1); the name and title come from skosif_profile_v1 (fallback: the
   report preparer in الإعدادات); the bell counts unread items of the notification centre. */
(()=>{
"use strict";
const {$,esc,load,save}=SK;
const core=()=>window.SKosifCore;
const PROFILE="skosif_profile_v1",CO="skosif_companies_v1";
const I={
  building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  /* the SQC mark: the S in brand blue, Q and C in the current ink so it reads on light and dark bars */
  sqc:'<svg class="sk-tb-sqc" viewBox="0 0 300 110" aria-hidden="true"><defs><linearGradient id="sktb-s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc4ff"/><stop offset=".55" stop-color="#2f8cff"/><stop offset="1" stop-color="#1557d6"/></linearGradient></defs><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="19"><path stroke="url(#sktb-s)" d="M84 20H40a17 17 0 0 0 0 34h24a17 17 0 0 1 0 34H14"/><path stroke="currentColor" d="M144 20a34 34 0 1 0 0 68h6a34 34 0 0 0 0-68z"/><path stroke="#2f8cff" d="M156 66l24 26"/><path stroke="currentColor" d="M278 30a34 34 0 1 0 0 50"/></g><circle cx="276" cy="80" r="6" fill="#2f8cff"/></svg>',
  cloud:'<svg viewBox="0 0 96 64" aria-hidden="true"><defs><linearGradient id="sktb-kc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4af37"/><stop offset="1" stop-color="#13305a"/></linearGradient></defs><path d="M26 54h46a16 16 0 0 0 1.6-31.9A22 22 0 0 0 31.4 17 14.5 14.5 0 0 0 12 30.5 12 12 0 0 0 26 54z" fill="none" stroke="url(#sktb-kc)" stroke-width="6.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M40 54V43h16v11" fill="none" stroke="url(#sktb-kc)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* ---------- data ---------- */
function profile(){const p=load(PROFILE,{})||{},o=SK.org();return{name:String(p.name||o.preparer||"").trim(),title:String(p.title||"").trim(),firm:String(p.firm||"").trim(),license:String(p.license||"").trim()}}
function initials(n){const w=String(n||"").trim().split(/\s+/).filter(Boolean);if(!w.length)return "K";const f=s=>s.replace(/^(ال)/,"").charAt(0)||s.charAt(0);return w.length>1?f(w[0])+" "+f(w[1]):f(w[0])}
const firstName=n=>String(n||"").trim().split(/\s+/)[0]||"";
/* the open company (SK.company): the same one the rail, the books and every helper screen show */
function ctx(){
  const scope=SK.gate&&SK.gate.current?SK.gate.current():"accounting";
  if(scope==="audit"){
    const d=load("skosif_tbreview_v1",{})||{},a=d.ctx||{};
    return {scope,cs:[],ps:[],c:{name:a.company||"ملف مراجعة بلا اسم",currency:a.curSym||a.currency||""},p:{label:a.periodEnd||a.period||"فترة غير محددة"}};
  }
  if(SK.company){const c=SK.company.current(),cs=SK.company.list();return{scope,cs,ps:c.periods,c,p:c.period}}
  const d=load(CO,{})||{},cs=d.companies||[],ps=d.periods||[],a=d.active||{};
  const c=cs.find(x=>x.id===a.companyId)||cs[0]||null,own=c?ps.filter(x=>x.companyId===c.id):[];
  return{scope,d,cs,ps:own,c,p:own.find(x=>x.id===a.periodId)||null};
}
const biz=()=>((document.getElementById("biz-name")||{}).textContent||"").trim()||SK.org().biz||"SQC";
function setActive(patch){
  if(SK.company&&!("companyId" in patch)){SK.company.setPeriod(patch.periodId||null);paint();const c=core();if(c)c.go(c.view(),{keepScroll:true});return}
  const d=load(CO,{})||{};d.companies=d.companies||[];d.periods=d.periods||[];d.active=Object.assign({},d.active||{},patch);
  Object.keys(d.active).forEach(k=>{if(d.active[k]==null)delete d.active[k]});
  save(CO,d);SK.bus.emit("company",d.active);paint();
  const c=core();if(c)c.go(c.view(),{keepScroll:true});
}

/* ---------- build once ---------- */
let built=false;
function build(){
  const bar=$(".topbar"),main=$("#view"),col=$(".maincol");if(!bar||!main||!col)return false;
  if(built&&$("#sk-tb-user"))return true;
  const ttl=$(".ttl",bar)||$(".sk-ph .ttl"),hdr=$("#hdr");
  /* page head: title block + the screen's own actions (#hdr) */
  let ph=$(".sk-ph");
  if(!ph){ph=document.createElement("section");ph.className="sk-ph";ph.setAttribute("aria-label","عنوان الشاشة");col.insertBefore(ph,main)}
  if(ttl&&ttl.parentElement!==ph){
    ph.appendChild(ttl);
    if(!$(".sk-ph-ic",ttl)){
      const tx=document.createElement("div");tx.className="sk-ph-tx";
      [...ttl.childNodes].forEach(n=>tx.appendChild(n));
      const ic=document.createElement("span");ic.className="sk-ph-ic";ic.setAttribute("aria-hidden","true");
      const en=document.createElement("span");en.className="sk-ph-en";en.dir="ltr";
      const h=$("#pg-title",tx);if(h)h.after(en);else tx.appendChild(en);
      ttl.append(ic,tx);
    }
  }
  if(hdr&&hdr.parentElement!==ph)ph.appendChild(hdr);
  /* top bar */
  const menu=$(".menu-btn",bar),search=$(".skt-search",bar),grow=$(".grow",bar);
  const mk=(html)=>{const t=document.createElement("template");t.innerHTML=html.trim();return t.content.firstChild};
  const brand=mk('<button type="button" class="sk-tb-brand" data-sktb="home" aria-label="SQC — مركز القيادة">'+I.sqc+'<b>SQC</b></button>');
  const ctxBox=mk('<div class="sk-ctx" id="sk-ctx"><button type="button" class="sk-tb-btn" id="sk-tb-co" data-sktb="co" aria-haspopup="menu"><span class="ic">'+I.building+'</span><span class="tx"><b></b><small></small></span>'+I.chev+'</button>'+
    '<button type="button" class="sk-tb-btn sk-tb-pe" id="sk-tb-pe" data-sktb="pe" aria-haspopup="menu"><span class="ic">'+I.calendar+'</span><span class="tx"><b></b></span>'+I.chev+'</button></div>');
  const bell=mk('<button type="button" class="sk-tb-icon" id="sk-tb-bell" data-sktb="bell" aria-label="الإشعارات">'+I.bell+'<span class="dot" hidden></span></button>');
  const theme=mk('<button type="button" class="sk-tb-icon" id="sk-tb-theme" data-sktb="theme" aria-label="تبديل المظهر">'+I.moon+'</button>');
  const user=mk('<button type="button" class="sk-tb-user" id="sk-tb-user" data-sktb="user" aria-haspopup="menu" aria-label="قائمة المستخدم"><span class="sk-av" aria-hidden="true"></span><span class="tx"><b></b><small></small></span></button>');
  (menu||bar.firstChild).after(brand);brand.after(ctxBox);
  if(search)ctxBox.after(search);
  if(grow)(search||ctxBox).after(grow);
  bar.append(bell,theme,user);
  bar.addEventListener("click",onClick);ph.addEventListener("click",onClick);
  /* the description shows one line; a tap opens the rest (R1) */
  ph.addEventListener("click",e=>{if(e.target.closest(".sk-ph .sub"))ph.classList.toggle("sub-open")});
  built=true;place();
  return true;
}
/* phones: the company/period chips live in the page head of the home screen */
const narrow=matchMedia("(max-width:900px)");
function place(){
  const box=$("#sk-ctx"),bar=$(".topbar"),ph=$(".sk-ph");if(!box||!bar||!ph)return;
  const search=$(".skt-search",bar);
  if(narrow.matches){if(box.parentElement!==ph)ph.appendChild(box)}
  else if(box.parentElement!==bar){(search||$(".grow",bar)).before(box)}
}
narrow.addEventListener&&narrow.addEventListener("change",place);

/* ---------- paint (every chrome paint) ---------- */
function sectorOf(cap){try{const c=SK.company.current();return cap&&cap.group==="books"&&c&&c.sector&&SK.caps.sectors().some(s=>s.id===c.sector)?c.sector:""}catch{return ""}}
function sectorLabel(id){const s=SK.caps.sectors().find(x=>x.id===id);return s?s.label:""}
function paint(){
  if(!build())return;
  const c=core(),view=c?c.view():"",cap=SK.caps.get(view),pr=profile(),x=ctx();
  /* page head */
  const ic=$(".sk-ph-ic"),en=$(".sk-ph-en");
  if(ic){const h=SK.icon(view);if(ic.dataset.v!==view){ic.innerHTML=h;ic.dataset.v=view}
    /* the books carry the open company's sector picture (ui/art/brand/sector-<id>.webp) in place of the screen icon */
    const sec=sectorOf(cap);if(ic.dataset.sector!==sec){ic.dataset.sector=sec;ic.style.backgroundImage=sec?"url(./art/brand/sector-"+sec+".webp)":"";ic.classList.toggle("has-art",!!sec);ic.title=sec?sectorLabel(sec):""}}
  /* the line under the title names the section and the domain (rule 7), the English name stays as the title's tooltip */
  if(en){en.textContent=cap?SK.caps.path(cap.id):"";en.dir="auto";const t=$("#pg-title");if(t)t.title=cap&&cap.en||""}
  const ph=$(".sk-ph");if(ph){ph.dataset.view=view}
  if(view==="dash"){
    const t=$("#pg-title"),s=$("#pg-sub");
    if(t)t.textContent="مرحباً"+(pr.name?" "+firstName(pr.name):" بك")+" 👋";
    const now=new Date(),day=now.toLocaleDateString("ar-SA-u-nu-latn",{weekday:"long"}),greg=now.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"}),hij=now.toLocaleDateString("ar-SA-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"long",year:"numeric"});
    if(s)s.textContent="نظرة شاملة على أعمال "+(x.c?x.c.name:biz())+" · "+day+" "+greg+" · "+hij;
    if(en)en.textContent=SK.caps.path("dash");
  }
  /* company + period */
  const co=$("#sk-tb-co"),pe=$("#sk-tb-pe");
  /* FOUNDATION §3.0 rule 7 — the context is always on screen: the program, the activity (sector), the company, and the section */
  if(co){$("b",co).textContent=x.c?x.c.name:biz();const sec=x.scope==="accounting"&&x.c&&x.c.sector?sectorLabel(x.c.sector):"";
    $("small",co).textContent=(x.scope==="audit"?"ملف المراجعة":x.scope==="tools"?"مساحة الأدوات":"البرنامج المحاسبي")+(sec?" · "+sec:"")+(x.c?(x.c.currency?" · "+x.c.currency:"")+(x.cs.length>1?" · "+x.cs.length+" شركات":""):" · أضف الشركة والفترات")}
  if(pe){$("b",pe).textContent=x.p?x.p.label:"كل الفترات"}
  /* bell */
  const dot=$("#sk-tb-bell .dot"),n=window.SKosifNotify?SKosifNotify.unread():0;
  if(dot){dot.hidden=!n;dot.textContent=n>99?"99+":String(n)}
  const bell=$("#sk-tb-bell");if(bell)bell.setAttribute("aria-label",n?"الإشعارات — "+n+" غير مقروءة":"الإشعارات");
  /* theme */
  const themeBtn=$("#sk-tb-theme");
  if(themeBtn){
    const dark=window.SKosifShell&&SKosifShell.resolved()==="dark";
    themeBtn.innerHTML=dark?I.sun:I.moon;
    const tip=dark?"المظهر النهاري (Ctrl+Shift+L)":"المظهر الليلي (Ctrl+Shift+L)";
    themeBtn.setAttribute("aria-label",tip);
    themeBtn.setAttribute("title",tip);
  }
  /* user */
  const u=$("#sk-tb-user");
  if(u){u.setAttribute("aria-label","قائمة المستخدم"+(pr.name?": "+pr.name:""));$(".sk-av",u).textContent=initials(pr.name);$("b",u).textContent=pr.name||"أضف اسمك";$("small",u).textContent=pr.title||SK.perm.label()}
}

/* ---------- menus ---------- */
let menuEl=null,menuFor=null;
function closeMenu(){if(menuEl){menuEl.remove();menuEl=null;const b=menuFor;menuFor=null;if(b){b.setAttribute("aria-expanded","false")}}}
function openMenu(btn,html,cls){
  if(menuFor===btn){closeMenu();return}
  closeMenu();
  const m=document.createElement("div");m.className="sk-menu "+(cls||"");m.setAttribute("role","menu");m.innerHTML=html;
  document.body.appendChild(m);
  const r=btn.getBoundingClientRect(),w=m.offsetWidth,rtl=document.documentElement.dir!=="ltr";
  let left=rtl?r.right-w:r.left;left=Math.max(8,Math.min(left,innerWidth-w-8));
  m.style.top=Math.round(r.bottom+8)+"px";m.style.left=Math.round(left)+"px";
  menuEl=m;menuFor=btn;btn.setAttribute("aria-expanded","true");
  m.addEventListener("click",onMenu);
  const f=m.querySelector("button,[href],input");if(f)f.focus({preventScroll:true});
}
function coMenu(btn){
  const x=ctx();
  if(x.scope==="audit"){core().go("tbreview");return}
  const note=c=>c.locked&&!(x.c&&c.id===x.c.id)?"خاصة · بكلمة المرور":c.demo?"بيانات تجريبية":(c.currency||"");
  const list=x.cs.length?x.cs.map(c=>'<button type="button" role="menuitemradio" aria-checked="'+(x.c&&c.id===x.c.id)+'" data-m="co" data-id="'+esc(c.id)+'"><b>'+esc(c.name)+'</b><small>'+esc(note(c))+'</small></button>').join(""):'<p class="sk-menu-note">لم تُضف شركة بعد. الدفاتر والتقارير تعمل على الشركة النشطة وفترتها.</p>';
  openMenu(btn,'<div class="sk-menu-h">الشركة المفتوحة — بياناتها على الشاشة</div>'+list+(spaceItems())+'<hr><button type="button" data-m="go" data-v="companies">'+SK.icon("companies")+' إدارة الشركات والفترات</button><a class="sk-menu-a" role="menuitem" href="./" data-space-door>'+SK.icon("companies")+' كل الشركات (الباب الأمامي)</a>');
}
/* on a company screen of the helper tools: the accountant's user and the tools space, chosen from here (ui/core/helper-space.js listens) */
function spaceItems(){
  const cap=SK.caps.get(core().view());if(!cap||!cap.company||!window.SKosifSpace)return "";
  const who=SKosifSpace.user?SKosifSpace.user():null;
  return '<hr><button type="button" role="menuitem" data-m="space" data-space-open>'+SK.icon("companies")+' تبديل الشركة (مساحة الأدوات)</button>'+
    '<button type="button" role="menuitem" data-m="spaceuser" data-user-open>'+SK.icon("user")+' تبديل المستخدم'+(who&&who.name?' <small>'+esc(who.name)+'</small>':'')+'</button>';
}
function peMenu(btn){
  const x=ctx();
  if(x.scope==="audit"){core().go("tbreview");return}
  if(!x.c){openMenu(btn,'<p class="sk-menu-note">أضف شركة أولاً ثم فتراتها المالية.</p><button type="button" data-m="go" data-v="companies">'+SK.icon("companies")+' الشركات والفترات</button>');return}
  const list='<button type="button" role="menuitemradio" aria-checked="'+!x.p+'" data-m="pe" data-id="">كل الفترات</button>'+x.ps.map(p=>'<button type="button" role="menuitemradio" aria-checked="'+(x.p&&p.id===x.p.id)+'" data-m="pe" data-id="'+esc(p.id)+'"><b>'+esc(p.label)+'</b><small dir="ltr">'+esc((p.startDate||"")+" → "+(p.endDate||""))+'</small></button>').join("");
  openMenu(btn,'<div class="sk-menu-h">الفترة المالية — '+esc(x.c.name)+'</div>'+list+'<hr><button type="button" data-m="go" data-v="companies">'+SK.icon("calc")+' إضافة فترة</button>');
}
function userMenu(btn){
  const pr=profile(),dark=window.SKosifShell&&SKosifShell.resolved()==="dark",d=SK.device;
  openMenu(btn,'<div class="sk-menu-me"><span class="sk-av">'+esc(initials(pr.name))+'</span><span><b>'+esc(pr.name||"بدون اسم")+'</b><small>'+esc((pr.title?pr.title+" · ":"")+"الدور: "+SK.perm.label())+'</small></span></div>'+
    '<button type="button" data-m="profile">'+SK.icon("user")+' تعديل الاسم واللقب</button>'+
    '<button type="button" data-m="theme">'+SK.icon("settings")+(dark?' المظهر النهاري':' المظهر الليلي')+'</button>'+
    '<button type="button" data-m="go" data-v="devices">'+SK.icon("devices")+' الأجهزة والمزامنة</button>'+
    (d&&d.kind()!=="phone"?'<button type="button" data-m="keys">'+SK.icon("keyboard")+' اختصارات لوحة المفاتيح</button>':'')+
    '<button type="button" data-m="go" data-v="settings">'+SK.icon("settings")+' الإعدادات والدور</button>'+
    '<hr><button type="button" data-m="lock" class="danger">'+SK.icon("lock")+' قفل التطبيق</button>',"sk-menu-user");
}
function bellMenu(btn){
  const N=window.SKosifNotify;
  if(!N||narrow.matches){core().go("notifications");return}
  const items=N.items().slice(0,6);
  openMenu(btn,'<div class="sk-menu-h sk-menu-hx"><span>الإشعارات</span>'+(N.unread()?'<button type="button" data-m="readall" class="linkish">تعليم الكل كمقروء</button>':'')+'</div>'+
    (items.length?'<div class="sk-notif-mini">'+items.map(N.rowHTML).join("")+'</div>':'<p class="sk-menu-note">لا إشعارات الآن — كل شيء ضمن الحدود.</p>')+
    '<hr><button type="button" data-m="go" data-v="notifications" class="sk-menu-all">عرض كل الإشعارات</button>',"sk-menu-bell");
}
/* a small form dialog (the app has no prompt()) */
function profileDialog(){
  const pr=profile();
  const w=document.createElement("div");w.className="skd-wrap";
  w.innerHTML='<form class="skd" role="dialog" aria-modal="true" aria-labelledby="skpf-t"><h3 id="skpf-t">الاسم واللقب والمكتب</h3><p>يظهران أعلى التطبيق وفي التحية وعلى التقارير المطبوعة (المُعِدّ). يُحفظان على هذا الجهاز.</p>'+
    '<div class="sk-stack" style="margin-top:12px"><label class="sk-field"><span>الاسم</span><input name="n" value="'+esc(pr.name)+'" autocomplete="name" placeholder="مثال: أحمد المطيري"></label>'+
    '<label class="sk-field"><span>اللقب الوظيفي</span><input name="t" value="'+esc(pr.title)+'" placeholder="مثال: شريك المراجعة · المدير المالي"></label>'+
    '<label class="sk-field"><span>المكتب المهني (يظهر على تقارير المراجعة)</span><input name="f" value="'+esc(pr.firm||"")+'" placeholder="مثال: مكتب النخبة للمراجعة والاستشارات"></label>'+
    '<label class="sk-field"><span>رقم الترخيص المهني</span><input name="l" value="'+esc(pr.license||"")+'" inputmode="numeric" placeholder="اختياري"></label></div>'+
    '<div class="skd-acts"><button type="button" class="btn" data-r="0">إلغاء</button><button type="submit" class="btn primary">حفظ</button></div></form>';
  const done=()=>{w.remove();document.removeEventListener("keydown",esc_,true)};
  const esc_=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();done()}};
  w.addEventListener("click",e=>{if(e.target===w||e.target.closest('[data-r="0"]'))done()});
  $("form",w).addEventListener("submit",e=>{e.preventDefault();const f=e.target;save(PROFILE,{...(load(PROFILE,{})||{}),name:f.n.value.trim().slice(0,60),title:f.t.value.trim().slice(0,60),firm:f.f.value.trim().slice(0,80),license:f.l.value.trim().slice(0,30)});done();paint();SK.toast("حُفظ الاسم","ok");const c=core();if(c&&c.view()==="dash")c.go("dash",{keepScroll:true})});
  document.addEventListener("keydown",esc_,true);document.body.appendChild(w);$("input",w).focus();
}
function onClick(e){
  const b=e.target.closest("[data-sktb]");if(!b)return;
  const a=b.dataset.sktb;
  if(a==="home")core().go("dash");
  else if(a==="co")coMenu(b);
  else if(a==="pe")peMenu(b);
  else if(a==="user")userMenu(b);
  else if(a==="bell")bellMenu(b);
  else if(a==="theme"&&window.SKosifShell)SKosifShell.toggleAppearance();
}
function onMenu(e){
  const b=e.target.closest("[data-m],[data-nid]");if(!b)return;
  if(b.dataset.nid){closeMenu();window.SKosifNotify&&SKosifNotify.open(b.dataset.nid);return}
  const m=b.dataset.m;
  if(m==="readall"){SKosifNotify.markAll();closeMenu();paint();return}
  closeMenu();
  if(m==="co"){if(SK.company){if(b.dataset.id!==SK.company.current().id)SK.company.open(b.dataset.id)}else setActive({companyId:b.dataset.id,periodId:null})}
  else if(m==="pe")setActive({periodId:b.dataset.id||null});
  else if(m==="go")core().go(b.dataset.v);
  else if(m==="profile")profileDialog();
  else if(m==="theme")SKosifShell.toggleAppearance();
  else if(m==="keys")window.SKosifKeys&&SKosifKeys.help();
  else if(m==="lock")SK.lock.now();
}
document.addEventListener("click",e=>{if(menuEl&&!menuEl.contains(e.target)&&!(menuFor&&menuFor.contains(e.target)))closeMenu()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menuEl){e.preventDefault();const b=menuFor;closeMenu();b&&b.focus()}});
addEventListener("resize",()=>closeMenu(),{passive:true});
addEventListener("scroll",()=>closeMenu(),{passive:true});

function boot(){
  paint();
  SK.bus.on("data",d=>{if(d&&(d.key===CO||d.key===PROFILE||d.key==="skosif_tbreview_v1"||d.key==="aghnam-pricing-v3"))paint()});
  SK.bus.on("gate",()=>{closeMenu();paint()});
  SK.bus.on("company",()=>paint());SK.bus.on("notify",()=>paint());SK.bus.on("role",()=>paint());SK.bus.on("nav",()=>{closeMenu();paint()});
  SK.bus.on("theme",()=>paint());
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.SKosifTopbar=Object.freeze({paint,profile,initials,firstName,closeMenu});
})();

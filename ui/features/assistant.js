/* S.kosif — المساعد المباشر (window.SKosifAssistant): محادثة حية تتحكم في التطبيق كله.
   اكتب أو تكلّم: «افتح مراجعة الميزان»، «لخّص هذه الشاشة»، «صدّر الجدول إلى Excel»، «بدّل للوضع
   الليلي»، «اجعل اللون زمردياً والخط القاهرة»، «أضف مهمة جرد المخزون غداً»، «اضغط تحليل الميزان»…
     • أدوات (TOOLS): الانتقال لأي شاشة من السجل، قراءة الشاشة الحالية، البحث، فتح صنف، المظهر (الثيم،
       الوضع الليلي، لون التمييز، الخط، حجم النص، التباين)، الوضع اليومي/المتقدم، الطباعة، تصدير الجداول،
       المهام، ملخص الأعمال، مراجعة ميزان الدفاتر، إجراءات لوحة الأوامر، والضغط على أي زر أو تعبئة أي
       حقل في الشاشة — فكل ما يفعله المستخدم بيده يفعله المساعد بطلبه.
     • بمفتاح Gemini (على جهازك فقط): يفهم الطلبات الحرة والمركبة ويستدعي الأدوات بنفسه (function calling)
       ثم يجيب بما حدث؛ بدون مفتاح: أوامر عربية مباشرة تُفهم محلياً.
     • الإجراءات الهادمة (حذف، مسح، قفل، استعادة) تطلب تأكيدك دائماً، والصلاحيات تُحترم.
   ما يُرسل إلى Gemini: رسالتك، ووصف الشاشة إن طلبت قراءتها (بعد إخفاء الأرقام الحساسة). المحادثة تبقى
   على هذا الجهاز (skosif_chat_v1، خارج النسخة الكاملة والنقل). */
(()=>{
"use strict";
const {$,$$,esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_chat_v1",MAX=40;
const norm=s=>String(s||"").toLowerCase().replace(/[ً-ٰٟ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ـ/g,"").replace(/[؟?!.,،:؛]/g," ").replace(/\s+/g," ").trim();
const DANGER=/حذف|مسح|ازاله|إزالة|delete|remove|تفريغ|استعاده|استعادة|reset|اعاده ضبط|إعادة ضبط|قفل|تصفير/i;
const visible=el=>!!(el&&el.offsetParent!==null&&el.getClientRects().length);
const today=(d=0)=>{const x=new Date();x.setDate(x.getDate()+d);return x.toISOString().slice(0,10)};

/* ---------- finding things by their Arabic names ---------- */
function score(q,t){const n=norm(t);if(!q||!n)return 0;if(n===q)return 1000;const i=n.indexOf(q);if(i>=0)return 500-Math.min(i,200)-Math.abs(n.length-q.length);
  const words=q.split(" ").filter(w=>w.length>1);const hit=words.filter(w=>n.includes(w)).length;return hit?hit*60-words.length*5:0}
function findScreen(name){
  const q=norm(name).replace(/^(شاشه|صفحه|قسم)\s+/,"");if(!q)return null;
  const byId=SK.caps.get(String(name).trim());if(byId)return byId;
  let best=null,bs=0;
  SK.caps.all().forEach(c=>{const s=Math.max(score(q,c.label)*1.2,score(q,c.hubLabel),score(q,c.kw)*.8,score(q,c.en),score(q,c.sub)*.5);if(s>bs){bs=s;best=c}});
  return bs>=40?best:null;
}
function pick(list,name,key){const q=norm(name);let best=null,bs=0;list.forEach(x=>{const s=Math.max(score(q,x.name),score(q,x[key]||""));if(s>bs){bs=s;best=x}});return bs>=40?best:null}
function actionables(root){
  return $$('button,a[href],[role="button"],[data-act],[data-a],label.btn,summary',root).filter(el=>visible(el)&&!el.closest(".ska-panel,.skp-wrap,.rail,#nav,.skb"));
}
function findControl(label){
  const q=norm(label),roots=[$("#pr-modal"),$("#view"),$(".topbar")].filter(Boolean);
  let best=null,bs=0;
  roots.forEach(r=>actionables(r).forEach(el=>{const t=el.getAttribute("aria-label")||el.title||el.textContent;const s=score(q,t);if(s>bs){bs=s;best=el}}));
  return bs>=40?best:null;
}
function findField(label){
  const q=norm(label),v=$("#view"),m=$("#pr-modal");let best=null,bs=0;
  [m,v].filter(Boolean).forEach(root=>$$("input:not([type=hidden]):not([type=file]),select,textarea",root).filter(visible).forEach(el=>{
    const lab=el.closest("label")||(el.id&&root.querySelector('label[for="'+el.id+'"]'));
    const t=[lab&&lab.textContent,el.getAttribute("aria-label"),el.placeholder,el.name,el.dataset.ctx,el.previousElementSibling&&el.previousElementSibling.textContent].filter(Boolean).join(" ");
    const s=score(q,t);if(s>bs){bs=s;best=el}}));
  return bs>=40?best:null;
}
function setValue(el,value){
  if(el.tagName==="SELECT"){const o=[...el.options].find(o=>norm(o.textContent)===norm(value)||o.value===String(value))||[...el.options].find(o=>norm(o.textContent).includes(norm(value)));if(!o)return false;el.value=o.value}
  else if(el.type==="checkbox"){el.checked=/^(1|true|نعم|صح|فعل)/i.test(String(value))}
  else{const proto=el.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,"value").set.call(el,String(value))}
  el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));return true;
}

/* ---------- what is on the screen, as text (redacted) ---------- */
function readScreen(){
  const v=$("#view"),c=core(),cap=SK.caps.get(c.view());
  const txt=el=>String(el.innerText||el.textContent||"").replace(/\s+/g," ").trim();
  const out=["الشاشة: "+(cap?cap.label+" ("+SK.caps.path(cap.id)+")":c.view()),"الوصف: "+txt($("#pg-sub")||document.createElement("i"))];
  const kpis=$$(".sk-kpi,.skk4-t,.skc-kpi,.v16-kpi,.stat,.tbr-an>div",v).filter(visible).slice(0,16).map(txt).filter(Boolean);
  if(kpis.length)out.push("المؤشرات: "+kpis.join(" • "));
  const heads=$$("h3",v).filter(visible).slice(0,14).map(txt).filter(Boolean);if(heads.length)out.push("الأقسام: "+heads.join(" • "));
  $$("table",v).filter(visible).slice(0,2).forEach((t,i)=>{
    const hs=t.tHead?[...t.tHead.rows[t.tHead.rows.length-1].cells].map(txt):[];
    const rows=[...(t.tBodies[0]||{rows:[]}).rows].filter(r=>!r.classList.contains("sktb-off")).slice(0,8).map(r=>[...r.cells].map(txt).join(" | "));
    const foot=t.tFoot?[...t.tFoot.rows].map(r=>[...r.cells].map(txt).join(" | ")).join(" / "):"";
    out.push("جدول "+(i+1)+(hs.length?" ["+hs.join(" | ")+"]":"")+" — "+((t.tBodies[0]||{rows:[]}).rows.length)+" صف:\n"+rows.join("\n")+(foot?"\nالإجمالي: "+foot:""));
  });
  const buttons=actionables(v).slice(0,30).map(b=>txt(b)).filter(t=>t&&t.length<40);
  if(buttons.length)out.push("الأزرار المتاحة: "+[...new Set(buttons)].join(" • "));
  return SK.redact(out.join("\n")).slice(0,4000);
}
async function appSummary(){
  const out=[];
  try{const co=load("skosif_companies_v1",{})||{},a=co.active||{},c=(co.companies||[]).find(x=>x.id===a.companyId),p=(co.periods||[]).find(x=>x.id===a.periodId);out.push("الشركة: "+(c?c.name:(SK.org().biz||"—"))+(p?" · الفترة: "+p.label:""))}catch{}
  try{const all=load("skosif_tasks_v1",[])||[],t=today(),open=all.filter(x=>!x.done);out.push("المهام: "+open.length+" مفتوحة، "+open.filter(x=>x.due&&x.due<t).length+" متأخرة، "+open.filter(x=>x.due===t).length+" مستحقة اليوم")}catch{}
  try{if(window.SKosifMetrics){const d=SKosifMetrics.decisions();out.push("ما يحتاج قراراً: "+d.length+(d.length?" — "+d.slice(0,4).map(x=>x.title||x.t||x.text||"").filter(Boolean).join("؛ "):""));
    const tr=await SKosifMetrics.trend(3),n=tr.s.length-1,m=v=>SK.money(v);if(n>=0)out.push("آخر شهر ("+tr.tip[n]+"): المبيعات "+m(tr.s[n])+"، المشتريات "+m(tr.p[n])+"، المصروفات "+m(tr.o[n])+"، صافي التدفق "+m(tr.net[n]))}}catch{}
  try{const r=load("skosif_risks_v1",null);if(r&&Array.isArray(r.risks))out.push("المخاطر المفتوحة: "+r.risks.filter(x=>x.status!=="closed").length)}catch{}
  return SK.redact(out.join("\n"))||"لا بيانات كافية بعد.";
}

/* ---------- the tools: everything the user can do by hand ---------- */
const S=(type,description,extra)=>Object.assign({type,description},extra||{});
const shell=()=>window.SKosifShell;
const TOOLS=[
  {name:"go_to_screen",d:"فتح أي شاشة في التطبيق بالاسم العربي أو المعرّف (مثل: العملاء، مراجعة ميزان المراجعة، tbreview)",p:{screen:S("STRING","اسم الشاشة أو معرّفها")},req:["screen"],
    run:({screen})=>{const c=findScreen(screen);if(!c)return{ok:false,text:"لم أجد شاشة باسم «"+screen+"»"};if(!SK.perm.can(c.id))return{ok:false,text:"دورك الحالي لا يسمح بفتح «"+c.label+"»"};
      if(!c.primary&&core().mode()!=="advanced")core().setMode("advanced");core().go(c.id);return{ok:true,text:"فُتحت «"+c.label+"»"+(c.hubLabel!==c.label?" ضمن «"+c.hubLabel+"»":"")}}},
  {name:"list_screens",d:"قائمة شاشات التطبيق مجمّعة حسب المجالات",p:{},run:()=>({ok:true,text:SK.caps.groups().map(g=>g.label+": "+SK.caps.hubsInGroup(g.id).map(h=>h.hubLabel).join("، ")).join("\n")})},
  {name:"read_screen",d:"قراءة ما يظهر في الشاشة الحالية: العنوان والمؤشرات والأقسام وأول صفوف الجداول والأزرار المتاحة — استخدمها قبل الإجابة عن أي سؤال عن الأرقام",p:{},run:()=>({ok:true,text:readScreen()})},
  {name:"app_summary",d:"ملخص الأعمال: الشركة والفترة، المهام، ما يحتاج قراراً، أرقام آخر شهر، المخاطر",p:{},run:async()=>({ok:true,text:await appSummary()})},
  {name:"search",d:"البحث الشامل في العملاء والطلبات والمبيعات",p:{query:S("STRING","نص البحث")},req:["query"],run:({query})=>{core().search(String(query||""));return{ok:true,text:"بحثت عن «"+query+"»"}}},
  {name:"open_item",d:"فتح صنف من الكتالوج بالاسم",p:{name:S("STRING","اسم الصنف")},req:["name"],
    run:({name})=>{let items=[];try{items=(core().catalog().items||[]).filter(i=>i.status!=="archived")}catch{}const it=pick(items,name,"name");if(!it)return{ok:false,text:"لم أجد صنفاً باسم «"+name+"»"};core().openItem(it.id);return{ok:true,text:"فُتح الصنف «"+it.name+"»"}}},
  {name:"set_appearance",d:"الوضع الفاتح أو الليلي أو حسب الجهاز",p:{mode:S("STRING","light | dark | auto",{enum:["light","dark","auto"]})},req:["mode"],run:({mode})=>{shell().setAppearance(mode);return{ok:true,text:mode==="dark"?"الوضع الليلي":mode==="auto"?"المظهر حسب الجهاز":"الوضع الفاتح"}}},
  {name:"set_theme",d:"اختيار ثيم كامل للتطبيق",p:{look:S("STRING","معرّف الثيم",{enum:["kosif","kosif-night","heritage","heritage-night","executive","audit","midnight","notebook","auto"]})},req:["look"],run:({look})=>{shell().setLook(look);return{ok:true,text:"الثيم: "+((shell().looks().find(l=>l.id===look)||{}).name||look)}}},
  {name:"set_accent",d:"لون التمييز (الأزرار والروابط والتدرجات): اسم عربي مثل زمردي، ذهبي، ملكي، فيروزي، عنبري، قرمزي، فحمي، أخضر وطني، أزرق SQC، أو رمز hex، أو «افتراضي»",p:{color:S("STRING","اللون")},req:["color"],
    run:({color})=>{const c=String(color||"").trim();if(/^#?[0-9a-f]{6}$/i.test(c)){shell().setPref("accent",c[0]==="#"?c:"#"+c);return{ok:true,text:"لون التمييز "+c}}
      if(/افتراض|الثيم|default/.test(norm(c))){shell().setPref("accent","");return{ok:true,text:"لون التمييز حسب الثيم"}}
      const a=pick(shell().accents().filter(x=>x.hex).map(x=>({...x})),c,"hex");if(!a)return{ok:false,text:"لون غير معروف: "+c};shell().setPref("accent",a.hex);return{ok:true,text:"لون التمييز: "+a.name}}},
  {name:"set_font",d:"خط التطبيق: IBM Plex، تجوّل Tajawal، القاهرة Cairo، المراعي Almarai، نوتو كوفي، ريدكس، نسخ، خط الجهاز، أو «حسب الثيم»",p:{font:S("STRING","اسم الخط")},req:["font"],
    run:({font})=>{const f=pick(shell().fonts(),font,"id");if(!f)return{ok:false,text:"خط غير معروف: "+font};shell().setPref("font",f.id);return{ok:true,text:"الخط: "+f.name}}},
  {name:"set_text_size",d:"حجم النص في الصفحات",p:{scale:S("NUMBER","0.9 أو 1 أو 1.1 أو 1.2")},req:["scale"],run:({scale})=>{const s=[0.9,1,1.1,1.2].reduce((a,b)=>Math.abs(b-scale)<Math.abs(a-scale)?b:a,1);shell().setPref("scale",s);return{ok:true,text:"حجم النص "+Math.round(s*100)+"%"}}},
  {name:"set_contrast",d:"تشغيل أو إيقاف التباين العالي",p:{on:S("BOOLEAN","تشغيل")},req:["on"],run:({on})=>{shell().setPref("contrast",!!on);return{ok:true,text:on?"التباين العالي مفعّل":"التباين العالي متوقف"}}},
  {name:"set_mode",d:"التشغيل اليومي أو إظهار الأدوات المتقدمة",p:{mode:S("STRING","daily | advanced",{enum:["daily","advanced"]})},req:["mode"],run:({mode})=>{core().setMode(mode==="advanced"?"advanced":"standard");return{ok:true,text:mode==="advanced"?"الأدوات المتقدمة ظاهرة":"التشغيل اليومي"}}},
  {name:"print_page",d:"طباعة المستند أو التقرير المعروض في الشاشة الحالية (بمعاينة الطباعة)",p:{},
    run:()=>{const b=["[data-a=\"print\"]",".sktb-bar [data-t=\"export\"]"].map(s=>$$(s,$("#view")).find(visible))[0]||findControl("طباعة");
      if(b&&!/sktb/.test(b.className)){b.click();return{ok:true,text:"فُتحت معاينة الطباعة"}}const t=$$("table[data-sktb]",$("#view")).find(visible);if(t&&window.SKosifTable){SKosifTable.printTable(t);return{ok:true,text:"فُتحت طباعة الجدول"}}
      window.print();return{ok:true,text:"فُتحت نافذة الطباعة"}}},
  {name:"export_table",d:"تصدير الجدول الظاهر في الشاشة",p:{format:S("STRING","xlsx | csv | copy | print",{enum:["xlsx","csv","copy","print"]})},req:["format"],
    run:({format})=>{const t=$$("table[data-sktb]",$("#view")).find(visible);if(!t)return{ok:false,text:"لا يوجد جدول قابل للتصدير في هذه الشاشة"};
      const T=window.SKosifTable;if(format==="xlsx")T.exportXlsx(t);else if(format==="copy")T.copyTsv(t);else if(format==="print")T.printTable(t);else{const b=t._sktb&&t._sktb.bar;const m=b&&b.querySelector('[data-t="export"]');m&&m.click();setTimeout(()=>{const x=document.querySelector('.sktb-exp [data-x="csv"]');x&&x.click()},60)}
      return{ok:true,text:{xlsx:"صُدّر الجدول إلى Excel",csv:"صُدّر الجدول CSV",copy:"نُسخ الجدول للحافظة",print:"فُتحت طباعة الجدول"}[format]||"تم"}}},
  {name:"create_task",d:"إضافة مهمة بتاريخ استحقاق وأولوية",p:{title:S("STRING","نص المهمة"),due:S("STRING","YYYY-MM-DD (اختياري)"),priority:S("STRING","high | normal | low",{enum:["high","normal","low"]})},req:["title"],
    run:({title,due,priority})=>{if(!SK.perm.can("tasks"))return{ok:false,text:"دورك لا يسمح بالمهام"};const x=window.SKosifTasks.add({title,due:due||today(),priority:priority||"normal"});return{ok:true,text:"أُضيفت المهمة «"+x.title+"» — استحقاق "+x.due}}},
  {name:"list_tasks",d:"المهام المفتوحة",p:{},run:()=>{const l=window.SKosifTasks.open();return{ok:true,text:l.length?l.slice(0,12).map(x=>"• "+x.title+(x.due?" ("+x.due+")":"")+(x.priority==="high"?" — عالية":"")).join("\n"):"لا مهام مفتوحة"}}},
  {name:"tb_review_from_books",d:"سحب ميزان الشركة النشطة من الدفاتر المحاسبية (أو السجلات التشغيلية) إلى مراجعة الميزان وتحليله بالمعايير",p:{},
    run:async()=>{if(!window.SKosifTBReview)return{ok:false,text:"مراجعة الميزان غير متاحة"};const ok=await SKosifTBReview.fromBooks();return{ok,text:ok?"استُلم ميزان التطبيق وفُتحت مراجعة الميزان":"لم يُستلم ميزان — لا توجد قيود أو سجلات للفترة"}}},
  {name:"run_action",d:"تشغيل إجراء من لوحة الأوامر: sale (بيع)، item (صنف جديد)، box (بوكس)، backup (نسخة كاملة)، csv (تصدير الأسعار)، journal (قيد)، task، theme، adv، lock (قفل)، keys، rail، install، transfer",p:{action:S("STRING","معرّف الإجراء")},req:["action"],
    run:({action})=>{const C=window.SKosifCommand;const a=C&&C.actions().find(x=>x.id===action||norm(x.t).includes(norm(action)));if(!a)return{ok:false,text:"إجراء غير معروف: "+action};C.run(a.id);return{ok:true,text:"نُفّذ: "+a.t}},danger:a=>/lock|قفل/.test(String(a.action))},
  {name:"click",d:"الضغط على زر أو رابط أو تبويب ظاهر في الشاشة بنصه (مثل: تحليل الميزان، القوائم والتقارير، إضافة، حفظ)",p:{label:S("STRING","نص الزر")},req:["label"],
    run:async({label})=>{const el=findControl(label);if(!el)return{ok:false,text:"لم أجد زراً باسم «"+label+"» في هذه الشاشة"};const t=String(el.textContent||el.getAttribute("aria-label")||label).replace(/\s+/g," ").trim().slice(0,40);
      /* the matched control may be destructive even when the request was not worded so */
      if(DANGER.test(t)&&!DANGER.test(String(label))&&!await SK.confirm("الزر المطابق هو «"+t+"» — إجراء قد لا يمكن التراجع عنه. تنفيذ؟",{danger:true,ok:"نفّذ"}))return{ok:false,text:"ألغيت الضغط بطلبك"};
      el.scrollIntoView({block:"center"});el.click();return{ok:true,text:"ضغطت «"+t+"»"}},
    danger:a=>DANGER.test(String(a.label))},
  {name:"fill_field",d:"تعبئة حقل ظاهر في الشاشة بعنوانه (مثل: المنشأة، الفترة، المهمة، اسم العميل)",p:{label:S("STRING","عنوان الحقل"),value:S("STRING","القيمة")},req:["label","value"],
    run:({label,value})=>{const el=findField(label);if(!el)return{ok:false,text:"لم أجد حقلاً باسم «"+label+"»"};el.scrollIntoView({block:"center"});return setValue(el,value)?{ok:true,text:"كتبت «"+value+"» في «"+label+"»"}:{ok:false,text:"القيمة غير متاحة في القائمة"}}},
  {name:"scroll_to",d:"التمرير إلى قسم في الشاشة بعنوانه",p:{text:S("STRING","عنوان القسم")},req:["text"],
    run:({text})=>{const q=norm(text);const h=$$("h2,h3,h4",$("#view")).filter(visible).find(x=>norm(x.textContent).includes(q));if(!h)return{ok:false,text:"لم أجد قسماً بعنوان «"+text+"»"};h.scrollIntoView({behavior:"smooth",block:"start"});return{ok:true,text:"انتقلت إلى «"+h.textContent.trim().slice(0,40)+"»"}}}
];
const byName=Object.fromEntries(TOOLS.map(t=>[t.name,t]));
async function runTool(name,args){
  const t=byName[name];if(!t)return{ok:false,text:"أداة غير معروفة: "+name};
  args=args||{};
  if(t.danger&&t.danger(args)&&!await SK.confirm("المساعد يطلب: «"+(args.label||args.action||name)+"» — هذا إجراء قد لا يمكن التراجع عنه. تنفيذ؟",{danger:true,ok:"نفّذ"}))return{ok:false,text:"ألغيت التنفيذ بطلبك"};
  try{const r=await t.run(args);SK.audit&&SK.audit.log("assistant",{tool:name,ok:r.ok});return r}catch(e){return{ok:false,text:"تعذر التنفيذ: "+e.message}}
}

/* ---------- local understanding (no key needed) ---------- */
const ACC_WORDS=[["زمرد","زمردي"],["اخضر وطني","أخضر وطني"],["اخضر","أخضر وطني"],["فيروز","فيروزي"],["ملكي","ملكي"],["بنفسج","ملكي"],["عنبر","عنبري"],["برتقال","عنبري"],["ذهب","ذهبي"],["قرمز","قرمزي"],["احمر","قرمزي"],["فحم","فحمي"],["رمادي","فحمي"],["ازرق","أزرق SQC"]];
function localPlan(text){
  const n=norm(text),plan=[];
  if(/^(مساعده|ساعدني|ماذا تستطيع|ايش تقدر|شو تقدر|help|اوامر|الاوامر)/.test(n))return[{help:true}];
  if(/(وضع|مظهر|ثيم)?\s*(ليلي|داكن|غامق|dark)/.test(n))plan.push(["set_appearance",{mode:"dark"}]);
  else if(/(نهاري|فاتح|light)/.test(n)&&!/لون/.test(n))plan.push(["set_appearance",{mode:"light"}]);
  if(/(كبر|تكبير|اكبر|زود|كبير).*(خط|نص|الكتابه)|(خط|نص).*(اكبر|كبير)/.test(n))plan.push(["set_text_size",{scale:1.1}]);
  if(/(صغر|تصغير|اصغر|قلل).*(خط|نص|الكتابه)|(خط|نص).*(اصغر|صغير)/.test(n))plan.push(["set_text_size",{scale:0.9}]);
  if(/تباين/.test(n))plan.push(["set_contrast",{on:!/(اوقف|الغ|بدون|اطفي)/.test(n)}]);
  const lc=n.match(/لون\s+([^\s]+(?:\s+وطني)?)/);if(lc){const w=ACC_WORDS.find(([k])=>lc[1].includes(k));plan.push(["set_accent",{color:w?w[1]:/افتراض/.test(lc[1])?"افتراضي":lc[1]}])}
  const fm=n.match(/خط\s+([^\s]+)/);if(fm&&!/(كبر|صغر|اكبر|اصغر|تكبير|تصغير)/.test(n))plan.push(["set_font",{font:fm[1].replace(/^ال/,"")}]);
  if(/(الادوات المتقدمه|متقدم|advanced)/.test(n)&&/(اظهر|افتح|فعل|شغل|اعرض|وضع)/.test(n))plan.push(["set_mode",{mode:"advanced"}]);
  else if(/(التشغيل اليومي|الوضع اليومي|اخف(ي)? المتقدم)/.test(n))plan.push(["set_mode",{mode:"daily"}]);
  const task=text.match(/(?:أضف|اضف|انشئ|أنشئ|سجل|سجّل)\s+مهم[ةه]\s*[:：]?\s*(.+)/);
  if(task){let t=task[1].replace(/[\u064B-\u065F]/g,"").trim(),due=today();if(/غد[اًا]?|بكر[هة]/.test(t)){due=today(1);t=t.replace(/\s*(غد[اًا]?|بكر[هة])\s*/,"")}else if(/اليوم/.test(t))t=t.replace(/\s*اليوم\s*/,"");plan.push(["create_task",{title:t||task[1].trim(),due,priority:/عاجل|مهم[ةه] جدا/.test(t)?"high":"normal"}]);return plan}
  if(/(مهامي|المهام المفتوحه|ما هي المهام|اعرض المهام)/.test(n))plan.push(["list_tasks",{}]);
  const sr=text.match(/(?:ابحث|بحث|دور|دوّر|فتش)\s+(?:عن|على)\s+(.+)/);if(sr)plan.push(["search",{query:sr[1].trim()}]);
  if(/(لخص|ملخص|اقرا|اقرأ|ماذا في|ايش في|شو في|وش في).*(الشاشه|الصفحه|هنا)/.test(n))plan.push(["read_screen",{}]);
  else if(/(ملخص|حاله|وضع)\s+(الاعمال|العمل|التطبيق|الشركه)/.test(n))plan.push(["app_summary",{}]);
  if(/(صدر|تصدير|نزل|حمل).*(اكسل|excel|xlsx)/.test(n))plan.push(["export_table",{format:"xlsx"}]);
  else if(/(صدر|تصدير).*csv/.test(n))plan.push(["export_table",{format:"csv"}]);
  else if(/انسخ.*(جدول|الجدول)/.test(n))plan.push(["export_table",{format:"copy"}]);
  else if(/(اطبع|طباعه)/.test(n))plan.push(["print_page",{}]);
  if(/(راجع|مراجعه|حلل).*(دفاتر|ميزان التطبيق|ميزان الشركه|ميزاني)/.test(n))plan.push(["tb_review_from_books",{}]);
  if(/(اقفل|قفل)\s+(التطبيق|البرنامج)/.test(n))plan.push(["run_action",{action:"lock"}]);
  if(/نسخه\s+(كامله|احتياطيه)/.test(n))plan.push(["run_action",{action:"backup"}]);
  const click=text.match(/(?:اضغط|إضغط|انقر|اختر)\s+(?:على\s+|زر\s+)?(.+)/);if(click)plan.push(["click",{label:click[1].trim()}]);
  const fill=text.match(/(?:اكتب|أكتب)\s+(.+?)\s+في\s+(?:حقل\s+)?(.+)/);if(fill)plan.push(["fill_field",{value:fill[1].trim(),label:fill[2].trim()}]);
  const nav=text.match(/(?:افتح|إفتح|اذهب\s+(?:إلى|الى|ل)|روح\s+(?:على|ل)?|انتقل\s+(?:إلى|الى)|اعرض|ودني\s+(?:على|ل)?|وديني\s+(?:على|ل)?|خذني\s+(?:إلى|الى|ل)?)\s*(?:شاشة|صفحة|قسم)?\s*(.+)/);
  if(nav&&!plan.some(p=>p[0]==="click")){const target=nav[1].replace(/\s+(و|ثم)\s+.*/,"").trim();if(findScreen(target))plan.unshift(["go_to_screen",{screen:target}])}
  if(!plan.length&&findScreen(text)&&norm(text).split(" ").length<=4)plan.push(["go_to_screen",{screen:text}]);
  return plan;
}
const HELP="أستطيع التحكم في التطبيق كله. جرّب:\n• «افتح مراجعة الميزان» أو أي شاشة\n• «لخّص هذه الشاشة» · «ملخص الأعمال»\n• «ابحث عن 0555…»\n• «صدّر الجدول إلى Excel» · «اطبع»\n• «الوضع الليلي» · «لون زمردي» · «خط القاهرة» · «كبّر الخط» · «تباين عالٍ»\n• «أضف مهمة جرد المخزون غداً» · «مهامي»\n• «راجع ميزان الدفاتر»\n• «اضغط تحليل الميزان» · «اكتب شركة الأفق في المنشأة»\nبمفتاح الذكاء الاصطناعي (Gemini أو OpenAI أو Claude) (في مراجعة الميزان ← المراجع الذكي) أفهم الطلبات الحرة والمركبة وأجيب عن أسئلتك من أرقام الشاشة.";

/* ---------- Gemini: function calling over the same tools ---------- */
function decl(){return TOOLS.map(t=>({name:t.name,description:t.d,parameters:{type:"OBJECT",properties:Object.fromEntries(Object.entries(t.p).map(([k,v])=>[k,{...v}])),...(t.req?{required:t.req}:{})}}))}
function system(){
  const c=core(),cap=SK.caps.get(c.view());
  const screens=SK.caps.all().filter(x=>SK.perm.can(x.id)).map(x=>x.id+": "+x.label+(x.hubLabel!==x.label?" ("+x.hubLabel+")":"")).join("\n");
  return "أنت «مساعد SQC» داخل تطبيق SQC (SQC) لإدارة شركة تجارة لحوم ومواشي ومراجعة الحسابات بالمعايير (IFRS وSOCPA ومعايير المحاسبة المصرية). "+
    "تتحكم في التطبيق بالأدوات المتاحة: نفّذ الطلب بالأدوات مباشرة ولا تكتفِ بالشرح، ويمكنك استدعاء عدة أدوات بالتتابع لطلب مركب (مثل: افتح الشاشة ثم اضغط زراً ثم صدّر الجدول). "+
    "قبل الإجابة عن أي سؤال عن أرقام أو بيانات استدعِ read_screen أو app_summary، ولا تخترع أرقاماً أبداً. "+
    "لتعبئة نموذج أو الضغط على زر اقرأ الشاشة أولاً لتعرف أسماء الحقول والأزرار. الإجراءات الهادمة يؤكدها المستخدم بنفسه. "+
    "أجب بالعربية بإيجاز ووضوح وبلهجة المستخدم، واذكر ما نفّذته.\n"+
    "الشاشة الحالية: "+(cap?cap.id+" — "+cap.label:c.view())+" · الوضع: "+(c.mode()==="advanced"?"متقدم":"يومي")+" · الدور: "+SK.perm.label()+" · التاريخ: "+today()+"\nالشاشات المتاحة:\n"+screens;
}
async function gemini(history,onStep){
  const contents=history.filter(m=>m.role==="user"||m.role==="model").slice(-12).map(m=>({role:m.role,parts:[{text:m.text}]}));
  for(let step=0;step<6;step++){
    const res=await SKosifAI.generate({systemInstruction:{parts:[{text:system()}]},contents,tools:[{functionDeclarations:decl()}],toolConfig:{functionCallingConfig:{mode:"AUTO"}},generationConfig:{temperature:0.2}},{timeout:90000});
    const cand=res&&res.candidates&&res.candidates[0],parts=cand&&cand.content&&cand.content.parts||[];
    const calls=parts.filter(p=>p.functionCall);
    if(!calls.length){const t=parts.map(p=>p.text||"").join("").trim();return t||"تم."}
    contents.push({role:"model",parts});
    const out=[];
    for(const p of calls){const r=await runTool(p.functionCall.name,p.functionCall.args);onStep(p.functionCall.name,r);out.push({functionResponse:{name:p.functionCall.name,response:{ok:r.ok,result:r.text}}});await new Promise(r=>setTimeout(r,250))}
    contents.push({role:"user",parts:out});
  }
  return "نفّذت الخطوات المطلوبة.";
}

/* ---------- the chat panel ---------- */
let panel=null,busy=false,rec=null;
const hist=()=>{const h=load(KEY,[]);return Array.isArray(h)?h:[]};
const push=m=>{const h=[...hist(),{...m,at:Date.now()}].slice(-MAX);save(KEY,h);return h};
const I={chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 18-8-8 18-2-8z"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'};
const SUGG=["افتح مراجعة الميزان","لخّص هذه الشاشة","ملخص الأعمال","صدّر الجدول إلى Excel","الوضع الليلي","أضف مهمة جرد المخزون غداً","ماذا تستطيع؟"];
function md(t){return esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>")}
function paint(){
  if(!panel)return;const box=$(".ska-msgs",panel),h=hist();
  box.innerHTML=h.length?h.map(m=>m.role==="tool"?'<div class="ska-step '+(m.ok?"ok":"bad")+'"><i></i>'+esc(m.text)+'</div>':'<div class="ska-m '+(m.role==="user"?"me":"ai")+'">'+md(m.text)+'</div>').join(""):
    '<div class="ska-hello"><b>أهلاً — أنا مساعد SQC</b><p>أنفّذ ما تطلبه في التطبيق مباشرة: أفتح الشاشات، أقرأ الأرقام، أصدّر وأطبع، أغيّر المظهر، وأضغط الأزرار عنك.</p></div>';
  if(busy)box.insertAdjacentHTML("beforeend",'<div class="ska-m ai typing"><i></i><i></i><i></i></div>');
  $(".ska-sugg",panel).innerHTML=(h.length>6?[]:SUGG).map(s=>'<button type="button" data-s="'+esc(s)+'">'+esc(s)+'</button>').join("");
  const ai=window.SKosifAI&&SKosifAI.ready();$(".ska-status",panel).textContent=ai?"الذكاء الاصطناعي متصل · يفهم الطلبات الحرة":"أوامر مباشرة · أضف مفتاح الذكاء الاصطناعي (Gemini أو OpenAI أو Claude) للطلبات الحرة";$(".ska-status",panel).classList.toggle("on",!!ai);
  box.scrollTop=box.scrollHeight;
}
async function send(text){
  text=String(text||"").trim();if(!text||busy)return;
  push({role:"user",text});busy=true;paint();
  const SHORT={read_screen:"قرأت الشاشة",app_summary:"جمعت ملخص الأعمال",list_tasks:"عرضت المهام",list_screens:"عرضت الشاشات"};
  const step=(name,r)=>{push({role:"tool",text:r.ok&&SHORT[name]?SHORT[name]:r.text,ok:r.ok,tool:name});paint()};
  let reply="";
  try{
    const ai=window.SKosifAI&&SKosifAI.ready(),plan=localPlan(text);
    if(plan.length&&plan[0].help)reply=HELP;
    else if(ai){try{reply=await gemini(hist().filter(m=>m.role!=="tool").map(m=>({role:m.role==="user"?"user":"model",text:m.text})),step)}
      catch(e){if(plan.length){for(const [n,a] of plan)step(n,await runTool(n,a));reply="نفّذت ذلك محلياً — تعذر الوصول إلى مزود الذكاء الاصطناعي ("+e.message+")."}else reply="تعذر الوصول إلى مزود الذكاء الاصطناعي: "+e.message}}
    else if(plan.length){const results=[];for(const [n,a] of plan){const r=await runTool(n,a);step(n,r);results.push(r)}
      const info=plan.find(p=>["read_screen","app_summary","list_tasks","list_screens"].includes(p[0]));reply=info?results[plan.indexOf(info)].text:results.every(r=>r.ok)?"تم.":"لم يكتمل كل شيء — راجع الخطوات أعلاه."}
    else reply="لم أفهم الطلب بدون ذكاء اصطناعي. "+HELP.split("\n").slice(0,6).join("\n");
  }finally{busy=false}
  push({role:"model",text:reply});paint();
  if(panel&&panel.dataset.speak==="1"&&"speechSynthesis" in window){try{const u=new SpeechSynthesisUtterance(reply.replace(/[•*]/g,""));u.lang="ar-SA";speechSynthesis.cancel();speechSynthesis.speak(u)}catch{}}
}
function voice(btn){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast("المتصفح لا يدعم الإملاء الصوتي","warn");return}
  if(rec){rec.stop();return}
  rec=new SR();rec.lang="ar-SA";rec.interimResults=true;rec.continuous=false;
  const inp=$("textarea",panel);btn.classList.add("rec");
  rec.onresult=e=>{inp.value=[...e.results].map(r=>r[0].transcript).join(" ");if(e.results[e.results.length-1].isFinal){const t=inp.value;inp.value="";send(t)}};
  rec.onend=()=>{btn.classList.remove("rec");rec=null};rec.onerror=()=>{btn.classList.remove("rec");rec=null};
  rec.start();
}
function build(){
  if(panel)return panel;
  const fab=document.createElement("button");fab.type="button";fab.className="ska-fab";fab.id="ska-fab";fab.setAttribute("aria-label","المساعد المباشر (Ctrl+J)");fab.title="المساعد المباشر · Ctrl+J";
  fab.innerHTML=I.chat+"<span>المساعد</span>";document.body.appendChild(fab);fab.onclick=()=>toggle();
  panel=document.createElement("section");panel.className="ska-panel";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","المساعد المباشر");panel.dir="rtl";
  panel.innerHTML='<header class="ska-h"><span class="ska-ic">'+I.chat+'</span><div><b>المساعد المباشر</b><small class="ska-status"></small></div>'+
    '<label class="ska-speak" title="قراءة الردود بصوت"><input type="checkbox"> صوت</label><button type="button" class="ska-b" data-a="clear" title="مسح المحادثة">'+I.trash+'</button><button type="button" class="ska-b" data-a="close" title="إغلاق (Esc)">'+I.x+'</button></header>'+
    '<div class="ska-msgs" aria-live="polite"></div><div class="ska-sugg"></div>'+
    '<form class="ska-in"><textarea rows="1" placeholder="اطلب أي شيء… مثل «افتح العملاء»" aria-label="رسالتك"></textarea>'+
    '<button type="button" class="ska-b" data-a="mic" title="إملاء صوتي">'+I.mic+'</button><button type="submit" class="ska-send" title="إرسال">'+I.send+'</button></form>';
  document.body.appendChild(panel);
  const inp=$("textarea",panel);
  $(".ska-in",panel).addEventListener("submit",e=>{e.preventDefault();const t=inp.value;inp.value="";inp.style.height="";send(t)});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$(".ska-in",panel).requestSubmit()}});
  inp.addEventListener("input",()=>{inp.style.height="auto";inp.style.height=Math.min(120,inp.scrollHeight)+"px"});
  panel.addEventListener("click",async e=>{const s=e.target.closest("[data-s]");if(s){send(s.dataset.s);return}
    const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
    if(a==="close")toggle(false);else if(a==="mic")voice(b);
    else if(a==="clear"&&(!hist().length||await SK.confirm("مسح المحادثة من هذا الجهاز؟",{ok:"مسح"}))){save(KEY,[]);paint()}});
  $(".ska-speak input",panel).addEventListener("change",e=>{panel.dataset.speak=e.target.checked?"1":"";if(!e.target.checked&&"speechSynthesis" in window)speechSynthesis.cancel()});
  panel.addEventListener("keydown",e=>{if(e.key==="Escape"){e.stopPropagation();toggle(false)}});
  return panel;
}
function toggle(on){
  build();const open=on===undefined?panel.hidden:on;panel.hidden=!open;document.body.classList.toggle("ska-open",open);
  if(open){paint();setTimeout(()=>$("textarea",panel).focus(),30)}
}
addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&(e.code==="KeyJ"||e.key.toLowerCase()==="j")){e.preventDefault();toggle()}});
function boot(){if(document.body)build()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.SKosifAssistant=Object.freeze({open:()=>toggle(true),close:()=>toggle(false),toggle,send,tools:()=>TOOLS.map(t=>({name:t.name,description:t.d})),run:runTool,plan:localPlan});
})();

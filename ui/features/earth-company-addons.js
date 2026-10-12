/* KOSIF EARTH — install selected tools into the currently opened accounting company.
   UI adapter for the existing per-company Capability Profile. No purchases,
   subscriptions, entitlement claims, company duplication or automatic data copying.
*/
(()=>{
"use strict";
const P=()=>window.SKosifCompanyPlatform;
const company=()=>window.SK?.company?.current?.();
const ownerIsAccounting=c=>!!(c&&c.id&&c.ownerScope==="FULL_ACCOUNTING");
/* The front door and the one-time demo seeder both schedule page reloads.
   Disable editing until both initializers have finished, especially on mobile. */
const switching=()=>!!window.SKosifSpace?.busy?.()||
  (!!window.SK?.demo?.settled&&!window.SK.demo.settled());
const activeCompany=id=>{const c=company();return !switching()&&ownerIsAccounting(c)&&c.id===id&&window.SK?.gate?.current?.()==="accounting"&&P()?.state()?.companyId===id};
/* The demo initializer finishes after the window load event. Refresh the CTA
   when it settles without requiring users to navigate away and back. */
let readyTimer=0,readyAttempts=0;
function refreshWhenReady(){
  if(readyTimer)return;
  const check=()=>{
    readyTimer=0;
    const box=document.querySelector("#earth-goal-journey");
    if(!box||!box.isConnected)return;
    if(!switching()){readyAttempts=0;attach(box,{gate:"accounting"});return}
    if(++readyAttempts<160)readyTimer=setTimeout(check,250);
  };
  readyTimer=setTimeout(check,250);
}
const node=(tag,cl,text)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(text!=null)e.textContent=text;return e};
const groups=Object.freeze({
  product:"التكاليف والمنتجات",customer:"المبيعات والعملاء",supply:"المشتريات والمخزون",books:"المطابقات والدفاتر",
  reports:"التقارير والتحليل",jev:"الذكاء والقرار",home:"إدارة العمل",finance:"التحليل المالي"
});
function library(){
  const sk=window.SK,profile=P();
  if(!sk?.caps||!profile)return [];
  const available=sk.caps.hubsInGateway("tools")||[];
  // List every existing tool hub, even when its functionality is supplied
  // by the company's sector pack. Installing here is an *explicit link*
  // into the accounting menu, never a new paid or privileged entitlement.
  return available.filter(c=>
    c&&c.gateway==="tools"&&c.hub===c.id&&!c.hidden&&
    c.group!=="home"&&
    (!sk.perm||sk.perm.can(c.id))
  ).sort((a,b)=>((groups[a.group]||a.group||"")+" "+a.label).localeCompare((groups[b.group]||b.group||"")+" "+b.label,"ar"));
}
function countInstalled(catalog){
  const installed=P()?.state()?.installedTools||[];
  return catalog.filter(c=>installed.includes(c.id)).length;
}
function attach(box,ctx){
  if(!box||ctx?.gate!=="accounting")return;
  const c=company(),cp=P();
  const existing=box.querySelector(".earth-addon-entry");
  if(!ownerIsAccounting(c)||!cp){
    existing?.remove();box.querySelector(".earth-ai-dev-entry")?.remove();return;
  }
  const catalog=library();
  let section=existing;
  if(!section){
    section=node("div","earth-addon-entry");
    const text=node("div","earth-addon-entry__text");
    const heading=node("b","","أدوات إضافية لشركتك");
    const description=node("span","earth-addon-entry__sub");
    text.append(heading,description);
    const button=node("button","earth-addon-entry__action","إدارة الأدوات  +");
    button.type="button";
    button.addEventListener("click",()=>open(button.dataset.companyId));
    section.append(text,button);
    const inner=box.querySelector(".earth-journey__inner");
    if(!inner)return;
    inner.append(section);
  }
  section.dataset.companyId=c.id;
  let aiEntry=box.querySelector(".earth-ai-dev-entry");
  if(!aiEntry){
    const inner=box.querySelector(".earth-journey__inner");
    if(inner){
      aiEntry=node("div","earth-addon-entry earth-ai-dev-entry");
      const t=node("div","earth-addon-entry__text");
      t.append(node("b","","طوّر شركتك بالذكاء الاصطناعي"),
        node("span","earth-addon-entry__sub","تصدير Python · استيراد المقترحات · مراجعة قبل التنفيذ"));
      const go=node("button","earth-addon-entry__action","فتح استوديو التطوير");
      go.type="button";go.addEventListener("click",()=>openDeveloper(go.dataset.companyId));
      aiEntry.append(t,go);inner.append(aiEntry);
    }
  }
  const devButton=aiEntry?.querySelector("button");
  if(devButton){devButton.dataset.companyId=c.id;devButton.disabled=switching();}
  const button=section.querySelector(".earth-addon-entry__action");
  const pending=switching();
  if(button){
    button.dataset.companyId=c.id;
    button.disabled=pending;
    button.textContent=pending?"جاري فتح الشركة...":"إدارة الأدوات  +";
  }
  const sub=section.querySelector(".earth-addon-entry__sub");
  if(sub)sub.textContent=pending?"بانتظار اكتمال تجهيز الشركة قبل تعديل أدواتها.":countInstalled(catalog)+" مرتبطة · "+catalog.length+" متاحة للإضافة · البيانات مستقلة لكل شركة";
  if(pending)refreshWhenReady();
}
function open(companyId){
  if(!activeCompany(companyId)){SK.toast?.("غيّر الشركة من شاشة الشركة قبل إضافة أدوات","bad");return}
  const old=document.querySelector("#earth-addon-dialog");
  if(old){old.close?.();old.remove()}
  const c=company();
  const dialog=node("dialog","earth-addon-dialog");
  dialog.id="earth-addon-dialog";
  dialog.dir="rtl";
  dialog.setAttribute("aria-labelledby","earth-addon-title");
  const shell=node("div","earth-addon-dialog__shell");
  const header=node("header","earth-addon-dialog__head");
  const heading=node("div","");
  const kicker=node("span","earth-addon-dialog__kicker","KOSIF EARTH · إضافات اختيارية");
  const title=node("h2","", "أدوات "+c.name);
  title.id="earth-addon-title";
  const intro=node("p","", "اختر الأداة التي تحتاجها. ستظهر داخل برنامج المحاسبة لهذه الشركة فقط.");
  heading.append(kicker,title,intro);
  const close=node("button","earth-addon-dialog__close","إغلاق ×");
  close.type="button";
  close.addEventListener("click",()=>dialog.close());
  header.append(heading,close);
  const searchLabel=node("label","earth-addon-search");
  searchLabel.append(node("span","","ابحث عن أداة"),node("input"));
  const search=searchLabel.querySelector("input");
  search.type="search";
  search.autocomplete="off";
  search.placeholder="مثلاً: تحليل المبيعات، تكاليف، متابعة";
  search.setAttribute("aria-controls","earth-addon-results");
  const count=node("p","earth-addon-dialog__count");
  count.setAttribute("aria-live","polite");
  const rows=node("div","earth-addon-dialog__results");
  rows.id="earth-addon-results";
  const footer=node("p","earth-addon-dialog__note",
    "الإضافة هنا إعداد محلي للشركة ولا تنشئ شركة أو تنقل بيانات إليها. لا توجد عملية دفع أو اشتراك مفعّلة. أي بيع مستقبلي يتطلب ترخيصًا وفواتير وتحققًا من الخادم.");
  shell.append(header,searchLabel,count,rows,footer);
  dialog.append(shell);
  document.body.append(dialog);
  dialog.addEventListener("close",()=>{dialog.remove();document.querySelector("#earth-goal-journey")?.querySelector(".earth-addon-entry__action")?.focus()},{once:true});
  let searchTerm="";
  function paint(){
    if(!activeCompany(companyId)){dialog.close();return}
    const entries=library().filter(c=>(c.label+" "+(c.sub||"")+" "+(groups[c.group]||"")).toLowerCase().includes(searchTerm));
    rows.replaceChildren();
    const catalog=library();
    count.textContent=countInstalled(catalog)+" من "+catalog.length+" أدوات مضافة لهذه الشركة";
    if(!entries.length){rows.append(node("p","earth-addon-dialog__empty","لا توجد أداة تطابق بحثك."));return}
    for(const cap of entries){
      const row=node("div","earth-addon-row");
      row.dataset.capabilityId=cap.id;
      const info=node("div","earth-addon-row__info");
      info.append(node("small","",groups[cap.group]||"أدوات متخصصة"),node("b","",cap.label));
      if(cap.sub)info.append(node("p","",cap.sub));
      const enabled=P().installed(cap.id);
      const action=node("button","earth-addon-row__action"+(enabled?" is-installed":""),enabled?"إزالة من الشركة":"أضف للشركة");
      action.type="button";
      action.setAttribute("aria-pressed",String(enabled));
      if(cap.tier==="INTELLIGENCE"&&!P().aiEnabled()){
        info.append(node("p","earth-addon-row__warning","قد تحتاج هذه الأداة إلى تفعيل وربط مزوّد AI لتعمل بالكامل."));
      }
      action.addEventListener("click",()=>{
        if(!activeCompany(companyId)){dialog.close();return}
        const had=P().installed(cap.id);
        if(had&&action.dataset.confirm!=="yes"){
          action.dataset.confirm="yes";action.textContent="اضغط لتأكيد الإزالة";return;
        }
        try{
          P().setTool(cap.id,!had);
          SK.toast?.(had?"أزيلت الأداة من قائمة الشركة، دون حذف بياناتها":"أُضيفت الأداة إلى برنامج هذه الشركة","ok");
          const guide=document.querySelector("#earth-goal-journey");
          if(guide&&window.KOSIFEarthAddons)window.KOSIFEarthAddons.attach(guide,{gate:"accounting"});
          // Rebuild the contextual menu so installed hubs are accessible
          // immediately without switching the active accounting company.
          window.SKosifShell?.paint?.();
          paint();
        }catch(error){SK.toast?.(error?.message||"تعذر تعديل الأدوات","bad")}
      });
      row.append(info,action);rows.append(row);
    }
  }
  search.addEventListener("input",()=>{searchTerm=search.value.trim().toLowerCase();paint()});
  dialog.showModal();
  paint();
}

/* AI development workshop: export an anonymous Python-readable contract and
   stage declarative AI proposals. Never run uploaded Python/JS or mutate ledgers. */
const devStorageKey=id=>"skosif_ai_development_v1::"+encodeURIComponent(id);
const developerAreas=Object.freeze(["accounting","audit","tools","ui","reports","integrations","sector"]);
const developerActions=Object.freeze(["add","modify","remove"]);
function devPython(id){
  if(!activeCompany(id))throw new Error("اختر الشركة من برنامج المحاسبة أولًا");
  const c=company(),s=P().state();
  const caps=window.SK?.caps?.all?.()||[];
  const names=caps.filter(x=>x&&x.id&&x.label&&!x.hidden).slice(0,200).map(x=>({
    id:String(x.id).slice(0,80),area:String(x.gateway||"shared").slice(0,40),label:String(x.label).slice(0,100)
  }));
  // Never include the actual company name, ID, accounting balances, records,
  // uploaded documents, private workspace data or provider/API keys.
  const context={
    format:"kosif-company-ai-context/v1",product:"KOSIF EARTH",
    company:{name:"الشركة المحددة (محجوبة الهوية)",sector:c.sector,country:c.country,currency:c.currency},
    enabled_tools:(s.installedTools||[]).filter(x=>typeof x==="string").slice(0,200),
    capability_catalog:names,
    available_areas:developerAreas,
    proposal_format:{
      format:"kosif-extension-proposal/v1",scope:"current-company",
      title:"عنوان التطوير",summary:"لماذا هذا التطوير مهم",
      changes:[{area:"ui",action:"modify",target:"اسم الشاشة أو المحرك",description:"التغيير المقترح وسبب الحاجة إليه"}]
    },
    constraints:[
      "اقترح تعديلات على جميع أقسام الشركة بما فيها الحسابات والمراجعة والشاشات.",
      "لا ترسل بيانات عميل أو قيوداً فعلية أو أي أسرار أو مفاتيح API.",
      "أعد مقترحاً بصيغة JSON المذكورة؛ لا تضع كوداً تنفيذياً داخل المقترح.",
      "الكود المصدري الحقيقي للتطبيق JavaScript/TypeScript وليس نسخة Python من المحركات.",
      "التعديلات على كود المصدر تحتاج مراجعة واختبارات وخط نشر منفصل؛ هذا الملف نموذج سياق لاقتراح التطوير."
    ]
  };
  const json=JSON.stringify(context);
  return "# -*- coding: utf-8 -*-\n"+
    '"""KOSIF EARTH: anonymized company development context, not executable ERP source."""\n'+
    "import json\n\nKOSIF_CONTEXT = json.loads("+JSON.stringify(json)+")\n\n"+
    "def get_development_context():\n    return KOSIF_CONTEXT\n\n"+
    "if __name__ == '__main__':\n    print(json.dumps(get_development_context(), ensure_ascii=False, indent=2))\n";
}
function validateDevProposal(raw){
  if(typeof raw!=="string"||raw.length>65536)throw new Error("الملف غير صالح أو يتجاوز 64 كيلوبايت");
  let p;try{p=JSON.parse(raw)}catch{throw new Error("ارفع ملف JSON صحيحاً، وليس كوداً تنفيذياً")};
  if(!p||Array.isArray(p)||typeof p!=="object"||p.format!=="kosif-extension-proposal/v1"||p.scope!=="current-company")
    throw new Error("صيغة المقترح أو نطاقه غير معتمد");
  const cleanText=(x,max)=>{if(typeof x!=="string"||!x.trim()||x.length>max)throw new Error("وصف التعديل غير صالح");return x.trim()};
  const title=cleanText(p.title,120),summary=cleanText(p.summary,2000);
  if(!Array.isArray(p.changes)||!p.changes.length||p.changes.length>30)throw new Error("عدد التعديلات المسموح من 1 إلى 30");
  const changes=p.changes.map(x=>{
    if(!x||Array.isArray(x)||typeof x!=="object"||!developerAreas.includes(x.area)||!developerActions.includes(x.action))
      throw new Error("نوع تعديل غير معتمد");
    return {area:x.area,action:x.action,target:cleanText(x.target,140),description:cleanText(x.description,1600)};
  });
  // Whitelist rather than storing the untrusted input: scripts and extra fields
  // are intentionally discarded and never interpreted or executed.
  return {format:"kosif-extension-proposal/v1",scope:"current-company",title,summary,changes};
}
function openDeveloper(companyId){
  if(!activeCompany(companyId)){SK.toast?.("افتح الشركة أولاً قبل تطويرها","bad");return}
  document.querySelector("#earth-ai-developer-dialog")?.remove();
  const c=company(),dialog=node("dialog","earth-addon-dialog");
  dialog.id="earth-ai-developer-dialog";dialog.dir="rtl";
  dialog.setAttribute("aria-label","تطوير الشركة بالذكاء الاصطناعي");
  const shell=node("div","earth-addon-dialog__shell");
  const header=node("header","earth-addon-dialog__head");
  const info=node("div","");
  info.append(node("h2","","التطوير بالذكاء الاصطناعي — "+c.name),
    node("p","","صدّر سياق الشركة كملف Python، واطلب من Claude أو ChatGPT مقترحات تطوير شاملة. لا تُصدّر بيانات مالية أو مفاتيح API."));
  const close=node("button","earth-addon-dialog__close","إغلاق ×");
  close.type="button";close.addEventListener("click",()=>dialog.close());
  header.append(info,close);
  const exportButton=node("button","earth-addon-entry__action","تصدير Python آمن");
  exportButton.type="button";
  exportButton.addEventListener("click",()=>{
    try{
      if(!activeCompany(companyId))throw new Error("تغيرت الشركة الحالية");
      const blob=new Blob([devPython(companyId)],{type:"text/x-python;charset=utf-8"});
      const url=URL.createObjectURL(blob),a=node("a","");
      a.href=url;a.download="KOSIF-company-ai-context.py";document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),2000);
    }catch(e){SK.toast?.(e.message,"bad")}
  });
  const instruction=node("p","earth-addon-dialog__note",
    "الملف يصف قدرات الشركة وعقود التعديل، وليس تحويل المحركات المحاسبية إلى Python. اطلب من AI إعادة اقتراح JSON بالنموذج المضمّن.");
  const label=node("label","earth-addon-search");
  label.append(node("span","","استيراد مقترح JSON (للمراجعة فقط)"));
  const upload=node("input","");
  upload.type="file";upload.accept=".json,application/json";label.append(upload);
  const preview=node("div","earth-addon-dialog__results");
  preview.setAttribute("aria-live","polite");
  const saveButton=node("button","earth-addon-entry__action","حفظ المقترح لهذه الشركة");
  saveButton.type="button";saveButton.disabled=true;
  let staged=null;
  upload.addEventListener("change",async()=>{
    staged=null;saveButton.disabled=true;preview.replaceChildren();
    const f=upload.files?.[0];if(!f)return;
    try{
      if(f.size>65536)throw new Error("الحد الأقصى للمقترح 64 كيلوبايت");
      if(!activeCompany(companyId))throw new Error("تغيرت الشركة الحالية");
      staged=validateDevProposal(await f.text());
      if(!activeCompany(companyId))throw new Error("تغيرت الشركة أثناء القراءة");
      preview.append(node("b","",staged.title),node("p","",staged.summary));
      for(const ch of staged.changes)preview.append(node("p","",ch.action+" · "+ch.area+" · "+ch.target+" — "+ch.description));
      saveButton.disabled=false;
    }catch(e){preview.append(node("p","",e.message))}
  });
  saveButton.addEventListener("click",()=>{
    try{
      if(!staged||!activeCompany(companyId))throw new Error("لا يوجد مقترح صالح للشركة المفتوحة");
      const key=devStorageKey(companyId);
      // Store ONLY the validated structured proposal; do not apply changes to
      // financial records, execute uploaded code, or touch another company.
      const approved={...staged,companyId,reviewStatus:"pending",createdAt:new Date().toISOString()};
      if(SK.save(key,approved)!==true)throw new Error("تعذر حفظ مقترح التطوير");
      SK.audit?.log?.("ai-development.proposal-stage",{companyId,changeCount:approved.changes.length});
      preview.append(node("p","","تم حفظ المقترح للمراجعة لهذه الشركة فقط. لم تُطبّق تغييرات على البرنامج."));
      saveButton.disabled=true;
    }catch(e){SK.toast?.(e.message,"bad")}
  });
  const previous=SK.load(devStorageKey(companyId),null);
  const history=node("p","earth-addon-dialog__note",
    previous&&previous.companyId===companyId&&previous.reviewStatus==="pending"?
      "المقترح السابق بانتظار المراجعة: "+String(previous.title||"").slice(0,120):
      "لا يوجد مقترح محفوظ لهذه الشركة.");
  shell.append(header,exportButton,instruction,label,preview,saveButton,history,
    node("p","earth-addon-dialog__note",
      "الأمان: المعاينة والحفظ لا ينفذان Python أو JavaScript. تعديل الكود الفعلي أو ترحيل البيانات يتطلب بوابة مراجعة، اختبارات، نسخة رجوع، وموافقة قبل النشر."));
  dialog.append(shell);document.body.append(dialog);
  dialog.addEventListener("close",()=>dialog.remove(),{once:true});
  dialog.showModal();
}

window.KOSIFEarthAddons=Object.freeze({attach,open,library,openDeveloper,devPython,validateDevProposal,devStorageKey});
})();

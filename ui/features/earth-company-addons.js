/* KOSIF EARTH — install selected tools into the currently opened accounting company.
   UI adapter for the existing per-company Capability Profile. No purchases,
   subscriptions, entitlement claims, company duplication or automatic data copying.
*/
(()=>{
"use strict";
const P=()=>window.SKosifCompanyPlatform;
const company=()=>window.SK?.company?.current?.();
const ownerIsAccounting=c=>!!(c&&c.id&&c.ownerScope==="FULL_ACCOUNTING");
/* The front-door selection replaces client data and schedules a page reload.
   Never allow an add-on write during that handoff (especially on mobile). */
const switching=()=>!!window.SKosifSpace?.busy?.();
const activeCompany=id=>{const c=company();return !switching()&&ownerIsAccounting(c)&&c.id===id&&window.SK?.gate?.current?.()==="accounting"&&P()?.state()?.companyId===id};
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
    existing?.remove();return;
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
  const button=section.querySelector(".earth-addon-entry__action");
  if(button){
    button.dataset.companyId=c.id;
    button.disabled=switching();
    button.textContent=switching()?"جاري فتح الشركة...":"إدارة الأدوات  +";
  }
  const sub=section.querySelector(".earth-addon-entry__sub");
  if(sub)sub.textContent=switching()?"بانتظار اكتمال انتقال الشركة قبل تعديل أدواتها.":countInstalled(catalog)+" مرتبطة · "+catalog.length+" متاحة للإضافة · البيانات مستقلة لكل شركة";
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
window.KOSIFEarthAddons=Object.freeze({attach,open,library});
})();

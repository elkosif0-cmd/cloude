/* S.kosif Fusion V30 — unified capability layer */
(()=> {
  "use strict";
  const APP="S.kosif";
  const STORE={snap:"skosif_v30_price_snapshots",approve:"skosif_v30_approvals"};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const num=v=>Number(String(v??"").replace(/,/g,""))||0;
  const money=v=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
  const pct=v=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:1}).format(Number(v)||0)+"٪";
  const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
  const now=()=>new Date().toISOString();

  function brand(){
    document.title=APP;
    document.querySelectorAll(".brand h1,.app-brand h1,[data-app-name]").forEach(el=>{
      if(el && el.textContent.trim()) el.textContent=APP;
    });
  }

  const modules=[
    ["dashboard","لوحة العمل التنفيذية",["لوحة العمل","الرئيسية"],"المؤشرات اليومية والتنبيهات"],
    ["catalog","الأصناف والأسعار",["سجل الأسعار","الأصناف والأسعار","الأسعار"],"الشراء والبيع والهدر والضريبة"],
    ["boxes","هندسة البوكسات",["بناء البوكسات","ال بوكسات","البوكسات"],"الوصفات والمكونات والبوكسات المتداخلة"],
    ["orders","الطلبات والتحصيل",["الطلبات والتحصيل","الطلبات"],"الفواتير والمدفوعات والتسويات"],
    ["customers","Customer 360",["السوق والعملاء","العملاء"],"قيمة العميل وتكرار الشراء والمتابعة"],
    ["sales","ذكاء المبيعات",["ذكاء المبيعات"],"الاتجاهات وABC وPareto وRFM"],
    ["economics","اقتصاديات الطلب",["اقتصاديات الطلب","اقتصاديات الطلب الحقيقية"],"الربح بعد الشحن ورسوم الدفع"],
    ["sim","محاكي التسعير",["التسعير السريع","محاكي وحاسبة التسعير","تحليل وتسعير سريع"],"الحساسية والسعر المستهدف"],
    ["costs","التكاليف والمصروفات",["التكاليف والمصروفات"],"المصاريف والهدر وأسعار الشراء"],
    ["finance","الهندسة المالية",["الهندسة المالية"],"الهوامش ونقطة التعادل وصدمات التكلفة"],
    ["risk","المخاطر والربحية",["المخاطر وجسر الربحية","المخاطر"],"Profit Bridge والحساسية والسيناريوهات"],
    ["yield","مختبر الجزارة",["مختبر الجزارة"],"العائد الفعلي ومعامل التكلفة"],
    ["nrv","NRV وتفكيك الذبيحة",["تفكيك الذبيحة NRV","تفكيك الذبيحة"],"توزيع التكلفة المشتركة"],
    ["recon","المطابقة",["مطابقة ملف الإكسل","مطابقة الإكسل","مطابقة المبيعات بالكتالوج"],"ربط البيانات وكشف الفروقات"],
    ["approvals","حوكمة الأسعار",["اعتماد الأسعار","مذكرة واعتماد الأسعار"],"مسودة ومراجعة واعتماد وأرشيف"],
    ["reports","التقارير",["مركز التقارير","التقارير"],"تقارير تشغيلية ومالية قابلة للطباعة"],
    ["archive","سجل التدقيق",["الأرشيف والتغييرات","الأرشيف وسجل التعديلات"],"من غيّر ماذا ومتى"],
    ["health","صحة البيانات",["الصحة والاستثناءات","الصحة"],"فحص التخزين والاستثناءات"],
    ["governance","الحوكمة والجاهزية",["الحوكمة والجاهزية"],"الضوابط والصلاحيات والجاهزية"]
  ];

  function clickText(labels){
    const nodes=[...document.querySelectorAll("button,[role=button],a,.nav-btn")];
    for(const label of labels){
      const el=nodes.find(n=>n.offsetParent!==null && (n.textContent||"").trim().includes(label));
      if(el){el.click();return true}
    }
    return false;
  }
  function openModule(id){
    const m=modules.find(x=>x[0]===id); if(!m)return;
    close();
    setTimeout(()=>{
      if(clickText(m[2])) return;
      if(id==="sim"||id==="catalog"){window.AghnamV29?.open?.();return}
      if(id==="approvals"){openHub("approvals");return}
      if(id==="health"){openHub("health");return}
      openHub("overview");
      toast("الوحدة موجودة ضمن النسخة المتقدمة؛ افتح «المزيد» أو الوضع المتقدم إذا لم تظهر مباشرة.");
    },80);
  }
  function toast(msg){
    let t=$("sk-toast");
    if(!t){document.body.insertAdjacentHTML("beforeend",'<div id="sk-toast" class="sk-toast"></div>');t=$("sk-toast")}
    t.textContent=msg;t.classList.add("show");clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove("show"),3200);
  }

  function parseStorage(){
    const rows=[], arrays=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i); if(!key)continue;
      const raw=localStorage.getItem(key)||"";
      let value=null,valid=true;
      try{value=JSON.parse(raw)}catch{valid=false}
      rows.push({key,bytes:new Blob([raw]).size,valid,type:Array.isArray(value)?"array":typeof value,count:Array.isArray(value)?value.length:null});
      if(Array.isArray(value) && value.length && typeof value[0]==="object") arrays.push({key,value});
    }
    return {rows,arrays};
  }
  const pick=(o,names)=>{for(const k of names){if(o && o[k]!=null)return o[k]}return null};
  function discover(){
    const {rows,arrays}=parseStorage();
    const out={rows,customers:[],orders:[],products:[]};
    for(const a of arrays){
      const sample=a.value.find(x=>x&&typeof x==="object")||{};
      const keys=Object.keys(sample).map(x=>x.toLowerCase());
      if(keys.some(k=>k.includes("phone")||k.includes("mobile")) && keys.some(k=>k.includes("name")||k.includes("customer"))) out.customers.push(...a.value.map(x=>({...x,__source:a.key})));
      else if(keys.some(k=>k.includes("total")||k.includes("amount")) && keys.some(k=>k.includes("order")||k.includes("date")||k.includes("items"))) out.orders.push(...a.value.map(x=>({...x,__source:a.key})));
      else if(keys.some(k=>k.includes("selling")||k.includes("purchase")||k.includes("price")) && keys.some(k=>k.includes("name")||k.includes("code"))) out.products.push(...a.value.map(x=>({...x,__source:a.key})));
    }
    return out;
  }

  function shell(){
    if($("sk-fab"))return;
    document.body.insertAdjacentHTML("beforeend",[
      '<button id="sk-fab" class="sk-fab" type="button" aria-label="S.kosif"><b>S</b><small>kosif</small></button>',
      '<div id="sk-modal" class="sk-backdrop" aria-hidden="true"><section class="sk-panel" role="dialog" aria-modal="true">',
      '<header class="sk-head"><div class="sk-mark">S</div><div class="sk-headtxt"><b>S.kosif</b><span>Fusion Operations & Decision OS — V30</span></div><button id="sk-close" class="sk-close" type="button">×</button></header>',
      '<nav class="sk-tabs">',
      '<button data-sk-tab="overview" class="active">المركز</button><button data-sk-tab="pricing">التسعير</button><button data-sk-tab="customers">العملاء</button><button data-sk-tab="approvals">الاعتماد</button><button data-sk-tab="reports">التقارير</button><button data-sk-tab="health">الصحة</button>',
      '</nav>',
      '<div id="sk-body" class="sk-body"></div>',
      '</section></div>'
    ].join(""));
    $("sk-fab").onclick=()=>openHub("overview");
    $("sk-close").onclick=close;
    $("sk-modal").onclick=e=>{if(e.target===$("sk-modal"))close()};
    document.querySelectorAll("[data-sk-tab]").forEach(b=>b.onclick=()=>show(b.dataset.skTab));
    brand();
  }
  function openHub(tab="overview"){
    shell();$("sk-modal").classList.add("open");$("sk-modal").setAttribute("aria-hidden","false");show(tab);
  }
  function close(){$("sk-modal")?.classList.remove("open");$("sk-modal")?.setAttribute("aria-hidden","true")}
  function show(tab){
    document.querySelectorAll("[data-sk-tab]").forEach(b=>b.classList.toggle("active",b.dataset.skTab===tab));
    const body=$("sk-body"); if(!body)return;
    if(tab==="overview") body.innerHTML=overviewHTML();
    if(tab==="pricing") body.innerHTML=pricingHTML();
    if(tab==="customers") body.innerHTML=customersHTML();
    if(tab==="approvals") body.innerHTML=approvalsHTML();
    if(tab==="reports") body.innerHTML=reportsHTML();
    if(tab==="health") body.innerHTML=healthHTML();
    bindView(tab);
  }

  function overviewHTML(){
    const d=discover(), snaps=load(STORE.snap,[]), approvals=load(STORE.approve,[]);
    return [
      '<section class="sk-hero"><div><span class="sk-eyebrow">S.KOSIF COMMAND CENTER</span><h2>كل قدرات التشغيل والقرار في مكان واحد</h2><p>النسخة الحالية + أفضل قدرات المرفقات، بدون استبدال بياناتك أو كسر الوحدات القديمة.</p></div>',
      '<div class="sk-hero-kpis"><div><b>'+d.products.length+'</b><span>منتج مكتشف</span></div><div><b>'+d.customers.length+'</b><span>عميل مكتشف</span></div><div><b>'+d.orders.length+'</b><span>طلب مكتشف</span></div><div><b>'+snaps.length+'</b><span>لقطة سعر</span></div></div></section>',
      '<div class="sk-section-title"><b>الوحدات الموحدة</b><span>انقر لفتح الوحدة الأصلية داخل التطبيق</span></div>',
      '<div class="sk-module-grid">'+modules.map(m=>'<button class="sk-module" data-sk-module="'+m[0]+'" type="button"><b>'+esc(m[1])+'</b><span>'+esc(m[3])+'</span><i>فتح ←</i></button>').join("")+'</div>',
      '<div class="sk-ai-card"><div><b>Jev Decision Layer</b><span>الحسابات القطعية أولاً، ثم Jev للاختيار بين البدائل.</span></div><button id="sk-ask-jev" type="button">اسأل Jev</button></div>',
      approvals.filter(x=>x.status==="pending").length?'<div class="sk-warning">لديك '+approvals.filter(x=>x.status==="pending").length+' قرارات سعر في انتظار الاعتماد.</div>':""
    ].join("");
  }

  function pricingHTML(){
    return [
      '<div class="sk-section-title"><b>محرك التسعير V30</b><span>VAT · هدر · مصروفات · هامش · حساسية · تقريب</span></div>',
      '<div class="sk-grid2">',
      f("sk-p-name","الصنف","text","اسم الصنف"),
      f("sk-p-buy","شراء شامل الضريبة","number","0.00","0.01"),
      f("sk-p-sell","بيع حالي شامل الضريبة","number","0.00","0.01"),
      f("sk-p-vat","VAT %","number","15","0.1"),
      f("sk-p-waste","الهدر %","number","0","0.1"),
      sel("sk-p-wmethod","طريقة الهدر",[["yield","Yield: 1/(1-w)"],["markup","Markup: 1+w"]]),
      f("sk-p-fixed","مصروف مباشر/وحدة","number","0","0.01"),
      f("sk-p-pct","مصروف % من التكلفة","number","0","0.1"),
      f("sk-p-target","الهامش المستهدف %","number","25","0.1"),
      sel("sk-p-basis","قاعدة الهامش",[["net","صافي البيع"],["gross","السعر شامل الضريبة"]]),
      sel("sk-p-vatreclaim","ضريبة الشراء",[["yes","قابلة للاسترداد"],["no","غير قابلة للاسترداد"]]),
      sel("sk-p-round","تقريب السعر",[["none","بدون"],["90","ينتهي .90"],["99","ينتهي .99"],["half","أقرب 0.50"]]),
      '</div><button id="sk-p-calc" class="sk-primary" type="button">احسب واعمل لقطة سعر</button><div id="sk-p-error" class="sk-error"></div><div id="sk-p-result"></div>'
    ].join("");
  }
  function f(id,label,type,ph,step){return '<label class="sk-field"><span>'+label+'</span><input id="'+id+'" type="'+type+'" placeholder="'+ph+'"'+(step?' step="'+step+'"':'')+'></label>'}
  function sel(id,label,opts){return '<label class="sk-field"><span>'+label+'</span><select id="'+id+'">'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join("")+'</select></label>'}
  function roundPrice(x,mode){
    if(mode==="90") return Math.floor(x)+0.90;
    if(mode==="99") return Math.floor(x)+0.99;
    if(mode==="half") return Math.round(x*2)/2;
    return Math.round(x*100)/100;
  }
  function calcPrice(){
    const buy=num($("sk-p-buy").value), sell=num($("sk-p-sell").value), vat=num($("sk-p-vat").value), waste=num($("sk-p-waste").value), fixed=num($("sk-p-fixed").value), epct=num($("sk-p-pct").value), target=num($("sk-p-target").value);
    const err=$("sk-p-error");err.textContent="";
    if(buy<=0){err.textContent="أدخل سعر شراء أكبر من صفر.";return}
    if(waste<0||waste>=100||target<0||target>=100){err.textContent="راجع نسب الهدر والهامش.";return}
    const reclaim=$("sk-p-vatreclaim").value==="yes";
    const buyBase=reclaim?buy/(1+vat/100):buy;
    const factor=$("sk-p-wmethod").value==="yield"?1/(1-waste/100):1+waste/100;
    const afterWaste=buyBase*factor;
    const totalCost=afterWaste*(1+epct/100)+fixed;
    const basis=$("sk-p-basis").value;
    const targetNet=basis==="net"?totalCost/(1-target/100):totalCost/(1-target/100)/(1+vat/100);
    let targetGross=basis==="net"?targetNet*(1+vat/100):totalCost/(1-target/100);
    targetGross=roundPrice(targetGross,$("sk-p-round").value);
    const breakEvenGross=totalCost*(1+vat/100);
    const sellNet=sell/(1+vat/100), profit=sellNet-totalCost;
    const marginNet=sellNet?profit/sellNet*100:0, marginGross=sell?profit/sell*100:0;
    const snap={id:"SK-"+Date.now(),at:now(),item:$("sk-p-name").value.trim()||"صنف",inputs:{buy,sell,vat,waste,fixed,expensePercent:epct,target,basis,reclaim,wasteMethod:$("sk-p-wmethod").value,round:$("sk-p-round").value},results:{buyBase,afterWaste,totalCost,breakEvenGross,targetGross,sellNet,profit,marginNet,marginGross}};
    let list=load(STORE.snap,[]);list.unshift(snap);save(STORE.snap,list.slice(0,120));
    $("sk-p-result").innerHTML='<div class="sk-kpis">'+
      k("تكلفة الشراء الأساسية",money(buyBase))+k("بعد الهدر",money(afterWaste))+k("التكلفة الكلية",money(totalCost))+k("سعر التعادل",money(breakEvenGross))+k("السعر المستهدف",money(targetGross),"accent")+k("ربح السعر الحالي",money(profit),profit<0?"bad":"good")+k("هامش صافي البيع",pct(marginNet),marginNet<target?"warn":"good")+k("هامش من شامل الضريبة",pct(marginGross))+
      '</div><div class="sk-actions"><button id="sk-p-approve" class="sk-secondary" type="button">أرسل للاعتماد</button><button id="sk-p-jev" class="sk-jev" type="button">اسأل Jev عن القرار</button></div>';
    $("sk-p-approve").onclick=()=>makeApproval(snap);
    $("sk-p-jev").onclick=()=>askPricing(snap);
  }
  function k(a,b,c=""){return '<div class="sk-kpi '+c+'"><span>'+a+'</span><b>'+b+'</b></div>'}
  function makeApproval(snap){
    let a=load(STORE.approve,[]);
    a.unshift({id:"APR-"+Date.now(),createdAt:now(),status:"pending",item:snap.item,currentPrice:snap.inputs.sell,proposedPrice:snap.results.targetGross,targetMargin:snap.inputs.target,reason:"ناتج محرك S.kosif V30",snapshotId:snap.id});
    save(STORE.approve,a.slice(0,100));toast("تم إنشاء مذكرة اعتماد للسعر المقترح.");show("approvals");
  }
  function askPricing(snap){
    close();window.AskJev?.open?.("choice");
    setTimeout(()=>{
      const q=$("jev-ask-q"),o=$("jev-ask-options"),screen=$("jev-ask-screen");
      if(q)q.value="S.kosif حسب للصنف "+snap.item+": التكلفة الكلية "+snap.results.totalCost.toFixed(2)+"، السعر الحالي "+snap.inputs.sell.toFixed(2)+"، الهامش الحالي "+snap.results.marginNet.toFixed(1)+"٪، السعر المستهدف "+snap.results.targetGross.toFixed(2)+". ما الإجراء الأنسب؟";
      if(o)o.value="اعتماد السعر المستهدف\nتثبيت السعر الحالي\nرفع السعر تدريجيًا\nعرض ترويجي مؤقت\nمراجعة تكلفة الشراء أولًا";
      if(screen)screen.checked=false;
    },120);
  }

  function customersHTML(){
    const d=discover(), customers=d.customers.slice(0,100);
    const rows=customers.map(c=>{
      const name=pick(c,["name","customerName","fullName","اسم","customer_name"])||"عميل";
      const phone=pick(c,["phone","mobile","phoneNumber","الجوال"])||"—";
      const city=pick(c,["city","district","region","المدينة"])||"—";
      const spend=num(pick(c,["totalPurchases","totalSpent","sales","revenue","lifetimeValue","ltv","amount"]));
      const orders=num(pick(c,["orderCount","ordersCount","numberOfOrders"]));
      return {name,phone,city,spend,orders};
    }).sort((a,b)=>b.spend-a.spend);
    return '<div class="sk-section-title"><b>Customer 360</b><span>اكتشاف تلقائي لبيانات العملاء المخزنة محليًا</span></div>'+
      '<div class="sk-kpis">'+k("عملاء مكتشفون",rows.length)+k("قيمة مكتشفة",money(rows.reduce((s,x)=>s+x.spend,0)))+k("طلبات مرتبطة",rows.reduce((s,x)=>s+x.orders,0))+k("مصادر بيانات",new Set(d.customers.map(x=>x.__source)).size)+'</div>'+
      (rows.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>العميل</th><th>الجوال</th><th>المدينة</th><th>القيمة</th><th>طلبات</th></tr></thead><tbody>'+rows.slice(0,40).map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+esc(x.phone)+'</td><td>'+esc(x.city)+'</td><td>'+money(x.spend)+'</td><td>'+x.orders+'</td></tr>').join("")+'</tbody></table></div>':'<div class="sk-empty">لم أجد مصفوفة عملاء قابلة للقراءة في localStorage. استخدم وحدة «السوق والعملاء» الأصلية لعرض البيانات الداخلية.</div>')+
      '<button class="sk-primary" data-sk-module="customers" type="button">فتح وحدة العملاء الأصلية</button>';
  }

  function approvalsHTML(){
    const a=load(STORE.approve,[]);
    return '<div class="sk-section-title"><b>حوكمة واعتماد الأسعار</b><span>مسودة ← مراجعة ← اعتماد/رفض ← أرشيف</span></div>'+
      (a.length?'<div class="sk-approval-list">'+a.map((x,i)=>'<article class="sk-approval"><div><b>'+esc(x.item)+'</b><span>'+esc(x.id)+' · '+new Date(x.createdAt).toLocaleString("ar-SA")+'</span></div><div class="sk-price-change"><span>'+money(x.currentPrice)+'</span><b>←</b><strong>'+money(x.proposedPrice)+'</strong></div><em class="'+x.status+'">'+statusAr(x.status)+'</em><div class="sk-actions"><button data-apr="'+i+'" data-state="approved" type="button">اعتماد</button><button data-apr="'+i+'" data-state="rejected" type="button">رفض</button><button data-apr-del="'+i+'" type="button">حذف</button></div></article>').join("")+'</div>':'<div class="sk-empty">لا توجد مذكرات اعتماد بعد. احسب سعرًا من تبويب التسعير ثم اضغط «أرسل للاعتماد».</div>')+
      '<button class="sk-secondary" data-sk-module="approvals" type="button">فتح دورة الاعتماد الأصلية</button>';
  }
  function statusAr(s){return s==="approved"?"معتمد":s==="rejected"?"مرفوض":"قيد الاعتماد"}

  function reportsHTML(){
    const d=discover(), snaps=load(STORE.snap,[]), approvals=load(STORE.approve,[]);
    return '<div class="sk-section-title"><b>مركز تقارير S.kosif</b><span>تقرير تنفيذي سريع + التقارير الأصلية</span></div>'+
      '<div class="sk-kpis">'+k("منتجات",d.products.length)+k("عملاء",d.customers.length)+k("طلبات",d.orders.length)+k("لقطات أسعار",snaps.length)+k("موافقات معلقة",approvals.filter(x=>x.status==="pending").length)+k("موافقات معتمدة",approvals.filter(x=>x.status==="approved").length)+'</div>'+
      '<div class="sk-actions"><button id="sk-print-report" class="sk-primary" type="button">طباعة التقرير التنفيذي</button><button class="sk-secondary" data-sk-module="reports" type="button">فتح مركز التقارير الكامل</button></div>';
  }
  function printReport(){
    const d=discover(), snaps=load(STORE.snap,[]), approvals=load(STORE.approve,[]);
    const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة.");return}
    const html='<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>S.kosif Report</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#17202d}h1{margin:0}.sub{color:#667085;margin:6px 0 24px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.c{border:1px solid #ddd;border-radius:12px;padding:14px}.c b{font-size:22px;display:block}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:right}@media print{button{display:none}}</style><body><h1>S.kosif</h1><div class="sub">التقرير التنفيذي — '+new Date().toLocaleString("ar-SA")+'</div><div class="g"><div class="c"><b>'+d.products.length+'</b>منتجات</div><div class="c"><b>'+d.customers.length+'</b>عملاء</div><div class="c"><b>'+d.orders.length+'</b>طلبات</div><div class="c"><b>'+snaps.length+'</b>لقطات تسعير</div><div class="c"><b>'+approvals.filter(x=>x.status==="pending").length+'</b>اعتمادات معلقة</div><div class="c"><b>'+approvals.filter(x=>x.status==="approved").length+'</b>اعتمادات منجزة</div></div><table><thead><tr><th>آخر قرارات التسعير</th><th>الحالي</th><th>المقترح</th></tr></thead><tbody>'+snaps.slice(0,12).map(x=>'<tr><td>'+esc(x.item)+'</td><td>'+money(x.inputs.sell)+'</td><td>'+money(x.results.targetGross)+'</td></tr>').join("")+'</tbody></table><script>setTimeout(()=>print(),300)<\/script></body></html>';
    w.document.write(html);w.document.close();
  }

  function healthHTML(){
    const d=parseStorage(), invalid=d.rows.filter(x=>!x.valid), total=d.rows.reduce((s,x)=>s+x.bytes,0);
    const large=d.rows.filter(x=>x.bytes>1_000_000).sort((a,b)=>b.bytes-a.bytes);
    return '<div class="sk-section-title"><b>صحة البيانات والتخزين</b><span>فحص محلي بدون رفع البيانات</span></div>'+
      '<div class="sk-kpis">'+k("مفاتيح تخزين",d.rows.length)+k("حجم localStorage",(total/1024/1024).toFixed(2)+" MB",total>4_000_000?"warn":"good")+k("JSON غير صالح",invalid.length,invalid.length?"bad":"good")+k("مفاتيح > 1MB",large.length,large.length?"warn":"good")+'</div>'+
      (invalid.length?'<div class="sk-warning">مفاتيح غير قابلة للتحليل: '+invalid.map(x=>esc(x.key)).join("، ")+'</div>':'<div class="sk-success">لا توجد أخطاء JSON ظاهرة في التخزين المحلي.</div>')+
      (large.length?'<div class="sk-health-list">'+large.slice(0,10).map(x=>'<div><b>'+esc(x.key)+'</b><span>'+(x.bytes/1024/1024).toFixed(2)+' MB</span></div>').join("")+'</div>':"")+
      '<div class="sk-actions"><button id="sk-export-health" class="sk-secondary" type="button">تصدير تقرير الصحة</button><button class="sk-secondary" data-sk-module="health" type="button">فتح وحدة الصحة الأصلية</button></div>';
  }

  function exportHealth(){
    const payload={app:APP,version:"30.0",createdAt:now(),storage:parseStorage().rows,snapshots:load(STORE.snap,[]).length,approvals:load(STORE.approve,[]).length};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download="S.kosif-health-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  function bindView(tab){
    document.querySelectorAll("[data-sk-module]").forEach(b=>b.onclick=()=>openModule(b.dataset.skModule));
    if(tab==="overview") $("sk-ask-jev").onclick=()=>{close();window.AskJev?.open?.("noul")};
    if(tab==="pricing") $("sk-p-calc").onclick=calcPrice;
    if(tab==="approvals"){
      document.querySelectorAll("[data-apr]").forEach(b=>b.onclick=()=>{
        const list=load(STORE.approve,[]),i=Number(b.dataset.apr);if(!list[i])return;list[i].status=b.dataset.state;list[i].decidedAt=now();save(STORE.approve,list);show("approvals");
      });
      document.querySelectorAll("[data-apr-del]").forEach(b=>b.onclick=()=>{const list=load(STORE.approve,[]);list.splice(Number(b.dataset.aprDel),1);save(STORE.approve,list);show("approvals")});
    }
    if(tab==="reports") $("sk-print-report").onclick=printReport;
    if(tab==="health") $("sk-export-health").onclick=exportHealth;
  }

  function init(){
    shell();brand();
    const ob=new MutationObserver(()=>brand());ob.observe(document.documentElement,{subtree:true,childList:true});
    window.SKosif={open:openHub,openModule,version:"30.0"};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
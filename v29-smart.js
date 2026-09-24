/* Aghnam Alwadi — Smart Operations V29 */
(()=> {
  const STORE_INV="aghnam_v29_inventory";
  const STORE_LOG="aghnam_v29_jev_log";
  const STORE_PRICE="aghnam_v29_last_price";
  const MAX_LOG=100;
  const $=id=>document.getElementById(id);
  const n=v=>Number(String(v??"").replace(/,/g,""))||0;
  const money=v=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v)+" ر.س";
  const num=v=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:2}).format(v);
  const pct=v=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:1}).format(v)+"٪";
  const safe=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const write=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val))}catch{}};

  function emitOpen(){
    $("v29-modal")?.classList.add("open");
    $("v29-modal")?.setAttribute("aria-hidden","false");
    renderInventory();
    renderLog();
    loadLastPrice();
  }
  function close(){
    $("v29-modal")?.classList.remove("open");
    $("v29-modal")?.setAttribute("aria-hidden","true");
  }
  function shell(){
    if($("v29-fab")) return;
    document.body.insertAdjacentHTML("beforeend",[
      '<button id="v29-fab" class="v29-fab" type="button" aria-label="مركز التشغيل الذكي"><b>V29</b><small>ذكي</small></button>',
      '<div id="v29-modal" class="v29-backdrop" aria-hidden="true">',
      '<section class="v29-panel" role="dialog" aria-modal="true" aria-labelledby="v29-title">',
      '<div class="v29-head"><div class="v29-logo">29</div><div><b id="v29-title">مركز التشغيل الذكي</b><span>تسعير · مخزون · سجل قرارات Jev</span></div><button id="v29-close" class="v29-close" type="button">×</button></div>',
      '<div class="v29-tabs"><button class="active" data-v29-tab="pricing">التسعير الذكي</button><button data-v29-tab="inventory">المخزون الذكي</button><button data-v29-tab="decisions">سجل Jev</button></div>',
      '<div class="v29-view active" data-v29-view="pricing">'+pricingHTML()+'</div>',
      '<div class="v29-view" data-v29-view="inventory">'+inventoryHTML()+'</div>',
      '<div class="v29-view" data-v29-view="decisions">'+logHTML()+'</div>',
      '</section></div>'
    ].join(""));
    bind();
  }

  function pricingHTML(){
    return [
      '<div class="v29-section-title"><div><b>محرك التسعير اليومي</b><span>الحسابات تتم داخل التطبيق أولًا</span></div><span class="v29-deterministic">حساب قطعي</span></div>',
      '<div class="v29-form-grid">',
      field("v29-item","الصنف","text","مثال: بوفتيك"),
      field("v29-buy","سعر الشراء شامل الضريبة","number","0.00","0.01"),
      field("v29-sell","سعر البيع الحالي شامل الضريبة","number","0.00","0.01"),
      field("v29-waste","الهدر %","number","0","0.1"),
      field("v29-vat","الضريبة %","number","15","0.1"),
      field("v29-margin","الهامش المستهدف %","number","25","0.1"),
      '</div>',
      '<button id="v29-price-calc" class="v29-primary" type="button">احسب السعر الآمن</button>',
      '<div id="v29-price-error" class="v29-error"></div>',
      '<div id="v29-price-result" class="v29-results"></div>',
      '<div class="v29-helper">طريقة الحساب: تكلفة الشراء بدون الضريبة ← تكلفة الوحدة القابلة للبيع بعد الهدر ← سعر التعادل والسعر المستهدف. Jev لا يحسب الأرقام.</div>'
    ].join("");
  }
  function inventoryHTML(){
    return [
      '<div class="v29-section-title"><div><b>مساعد المخزون</b><span>تغطية المخزون ونقطة إعادة الطلب</span></div><span class="v29-deterministic">حساب قطعي</span></div>',
      '<div class="v29-form-grid">',
      field("v29-stock-item","الصنف","text","مثال: نعيمي"),
      field("v29-stock","المخزون الحالي","number","0","0.01"),
      field("v29-daily","متوسط البيع اليومي","number","0","0.01"),
      field("v29-lead","مدة التوريد بالأيام","number","2","1"),
      field("v29-safety","مخزون أمان بالأيام","number","2","1"),
      field("v29-cycle","دورة الطلب بالأيام","number","7","1"),
      '</div>',
      '<div class="v29-actions"><button id="v29-stock-calc" class="v29-primary" type="button">حلّل المخزون</button><button id="v29-stock-save" class="v29-secondary" type="button">حفظ الصنف</button></div>',
      '<div id="v29-stock-error" class="v29-error"></div><div id="v29-stock-result" class="v29-results"></div>',
      '<div class="v29-list-head"><b>الأصناف المحفوظة</b><button id="v29-stock-clear" class="v29-link" type="button">مسح الكل</button></div>',
      '<div id="v29-stock-list" class="v29-stock-list"></div>'
    ].join("");
  }
  function logHTML(){
    return [
      '<div class="v29-section-title"><div><b>سجل قرارات Jev</b><span>يسجل السؤال والنتيجة فقط — بدون بيانات الشاشة</span></div><span class="v29-ai">AI</span></div>',
      '<div class="v29-actions"><button id="v29-log-export" class="v29-secondary" type="button">تصدير JSON</button><button id="v29-log-clear" class="v29-secondary danger" type="button">مسح السجل</button></div>',
      '<div id="v29-log-list" class="v29-log-list"></div>'
    ].join("");
  }
  function field(id,label,type,ph,step){
    return '<label class="v29-field"><span>'+label+'</span><input id="'+id+'" type="'+type+'" placeholder="'+ph+'"'+(step?' step="'+step+'"':'')+'></label>';
  }

  function setTab(tab){
    document.querySelectorAll("[data-v29-tab]").forEach(b=>b.classList.toggle("active",b.dataset.v29Tab===tab));
    document.querySelectorAll("[data-v29-view]").forEach(v=>v.classList.toggle("active",v.dataset.v29View===tab));
    if(tab==="inventory") renderInventory();
    if(tab==="decisions") renderLog();
  }

  function calcPrice(){
    const item=$("v29-item").value.trim()||"الصنف";
    const buy=n($("v29-buy").value), sell=n($("v29-sell").value);
    const waste=n($("v29-waste").value), vat=n($("v29-vat").value), target=n($("v29-margin").value);
    const err=$("v29-price-error"), out=$("v29-price-result");
    err.textContent="";
    if(buy<=0){err.textContent="أدخل سعر شراء أكبر من صفر.";out.innerHTML="";return null}
    if(waste<0||waste>=100){err.textContent="الهدر يجب أن يكون بين 0 و أقل من 100٪.";return null}
    if(vat<0||vat>100||target<0||target>=100){err.textContent="راجع نسبة الضريبة والهامش المستهدف.";return null}
    const buyNet=buy/(1+vat/100);
    const effective=buyNet/(1-waste/100);
    const breakEvenInc=effective*(1+vat/100);
    const targetNet=effective/(1-target/100);
    const targetInc=targetNet*(1+vat/100);
    const sellNet=sell>0?sell/(1+vat/100):0;
    const profit=sellNet-effective;
    const margin=sellNet>0?(profit/sellNet)*100:0;
    const marginInc=sell>0?(profit/sell)*100:0;
    const gap=sell>0?targetInc-sell:0;
    const status=sell<=0?"لا يوجد سعر حالي":sell+0.0001<breakEvenInc?"خسارة":sell+0.0001<targetInc?"أقل من المستهدف":"ضمن/فوق المستهدف";
    const cls=status==="خسارة"?"bad":status==="أقل من المستهدف"?"warn":"good";
    const r={item,buy,sell,waste,vat,target,buyNet,effective,breakEvenInc,targetInc,sellNet,profit,margin,marginInc,gap,status,ts:new Date().toISOString()};
    write(STORE_PRICE,r);
    out.innerHTML=[
      '<div class="v29-kpis">',
      kpi("تكلفة بدون الضريبة",money(buyNet)),
      kpi("تكلفة بعد الهدر",money(effective)),
      kpi("سعر التعادل شامل الضريبة",money(breakEvenInc)),
      kpi("السعر المستهدف",money(targetInc),"accent"),
      sell>0?kpi("هامش السعر الحالي",pct(margin),margin<target?"warn":"good"):"",
      sell>0?kpi("الربح للوحدة بدون الضريبة",money(profit),profit<0?"bad":"good"):"",
      '</div>',
      '<div class="v29-status '+cls+'"><b>'+status+'</b>'+(sell>0?'<span>الفارق عن السعر المستهدف: '+money(gap)+'</span>':'')+'</div>',
      '<button id="v29-price-jev" class="v29-jev-btn" type="button">اسأل Jev: أرفع السعر أم أثبته أم أعمل عرض؟</button>'
    ].join("");
    $("v29-price-jev").onclick=()=>askPriceJev(r);
    return r;
  }

  function kpi(label,value,cls=""){
    return '<div class="v29-kpi '+cls+'"><span>'+label+'</span><b>'+value+'</b></div>';
  }

  function askPriceJev(r){
    if(!window.AskJev){alert("قسم Jev غير جاهز بعد.");return}
    close();
    window.AskJev.open("choice");
    setTimeout(()=>{
      const q=$("jev-ask-q"),o=$("jev-ask-options"),screen=$("jev-ask-screen");
      if(q) q.value="للصنف "+r.item+": سعر الشراء شامل الضريبة "+r.buy+"، الهدر "+r.waste+"٪، سعر البيع الحالي "+r.sell+"، سعر التعادل المحسوب "+r.breakEvenInc.toFixed(2)+"، السعر المستهدف "+r.targetInc.toFixed(2)+"، والهامش الحالي "+r.margin.toFixed(1)+"٪. ما القرار الأنسب؟";
      if(o) o.value="رفع السعر\nتثبيت السعر\nعرض ترويجي مؤقت\nإعادة التفاوض على تكلفة الشراء";
      if(screen) screen.checked=false;
    },120);
  }

  function stockCalc(){
    const item=$("v29-stock-item").value.trim()||"الصنف";
    const stock=n($("v29-stock").value), daily=n($("v29-daily").value);
    const lead=n($("v29-lead").value), safety=n($("v29-safety").value), cycle=n($("v29-cycle").value);
    const err=$("v29-stock-error"),out=$("v29-stock-result"); err.textContent="";
    if(daily<=0){err.textContent="أدخل متوسط بيع يومي أكبر من صفر.";out.innerHTML="";return null}
    if(stock<0||lead<0||safety<0||cycle<0){err.textContent="القيم لا يمكن أن تكون سالبة.";return null}
    const cover=stock/daily;
    const reorderPoint=daily*(lead+safety);
    const targetStock=daily*(lead+safety+cycle);
    const suggested=Math.max(0,targetStock-stock);
    let status,cls;
    if(stock<=reorderPoint){status="إعادة طلب عاجلة";cls="bad"}
    else if(cover<=lead+safety+Math.max(1,cycle*.35)){status="إعادة طلب قريبة";cls="warn"}
    else {status="المخزون آمن حاليًا";cls="good"}
    const r={item,stock,daily,lead,safety,cycle,cover,reorderPoint,targetStock,suggested,status,ts:new Date().toISOString()};
    out.innerHTML=[
      '<div class="v29-kpis">',
      kpi("أيام التغطية",num(cover)+" يوم",cover<=lead+safety?"bad":""),
      kpi("نقطة إعادة الطلب",num(reorderPoint)),
      kpi("المخزون المستهدف",num(targetStock)),
      kpi("كمية الطلب المقترحة",num(suggested),"accent"),
      '</div>',
      '<div class="v29-status '+cls+'"><b>'+status+'</b><span>مدة التوريد + الأمان: '+num(lead+safety)+' يوم</span></div>',
      '<button id="v29-stock-jev" class="v29-jev-btn" type="button">اسأل Jev عن إجراء المخزون</button>'
    ].join("");
    $("v29-stock-jev").onclick=()=>askStockJev(r);
    return r;
  }

  function askStockJev(r){
    if(!window.AskJev){alert("قسم Jev غير جاهز بعد.");return}
    close();
    window.AskJev.open("choice");
    setTimeout(()=>{
      const q=$("jev-ask-q"),o=$("jev-ask-options"),screen=$("jev-ask-screen");
      if(q) q.value="للصنف "+r.item+": المخزون "+r.stock+"، متوسط البيع اليومي "+r.daily+"، أيام التغطية "+r.cover.toFixed(1)+"، نقطة إعادة الطلب "+r.reorderPoint.toFixed(1)+"، والكمية المقترحة "+r.suggested.toFixed(1)+". ما الإجراء الأنسب؟";
      if(o) o.value="إعادة طلب عاجلة\nإعادة طلب طبيعية\nمراقبة دون طلب\nعمل عرض لتصريف المخزون";
      if(screen) screen.checked=false;
    },120);
  }

  function saveStock(){
    const r=stockCalc(); if(!r)return;
    let list=read(STORE_INV,[]);
    const i=list.findIndex(x=>x.item.trim().toLowerCase()===r.item.trim().toLowerCase());
    if(i>=0) list[i]=r; else list.unshift(r);
    list=list.slice(0,100); write(STORE_INV,list); renderInventory();
  }
  function renderInventory(){
    const el=$("v29-stock-list"); if(!el)return;
    const list=read(STORE_INV,[]);
    if(!list.length){el.innerHTML='<div class="v29-empty">لا توجد أصناف محفوظة بعد.</div>';return}
    el.innerHTML=list.map((x,i)=>{
      const cls=x.status.includes("عاجلة")?"bad":x.status.includes("قريبة")?"warn":"good";
      return '<article class="v29-stock-card"><div><b>'+safe(x.item)+'</b><span>'+safe(x.status)+'</span></div><div class="v29-stock-metrics"><span>مخزون <b>'+num(x.stock)+'</b></span><span>تغطية <b>'+num(x.cover)+' يوم</b></span><span>طلب <b>'+num(x.suggested)+'</b></span></div><button class="v29-delete '+cls+'" data-stock-del="'+i+'" type="button">حذف</button></article>';
    }).join("");
    el.querySelectorAll("[data-stock-del]").forEach(b=>b.onclick=()=>{
      const list=read(STORE_INV,[]); list.splice(Number(b.dataset.stockDel),1); write(STORE_INV,list); renderInventory();
    });
  }

  function logDecision(detail){
    if(!detail||!detail.question)return;
    const list=read(STORE_LOG,[]);
    const item={
      id:(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()),
      at:new Date().toISOString(),
      source:detail.source||"Jev",
      type:detail.type||"",
      question:String(detail.question).slice(0,1500),
      summary:String(detail.summary||"").slice(0,500),
      result:detail.result??null
    };
    list.unshift(item); write(STORE_LOG,list.slice(0,MAX_LOG)); renderLog();
  }
  function renderLog(){
    const el=$("v29-log-list"); if(!el)return;
    const list=read(STORE_LOG,[]);
    if(!list.length){el.innerHTML='<div class="v29-empty">لا توجد قرارات Jev مسجلة بعد. أي سؤال جديد سيظهر هنا تلقائيًا.</div>';return}
    el.innerHTML=list.map((x,i)=>{
      const dt=new Date(x.at); const date=isNaN(dt)?x.at:dt.toLocaleString("ar-SA");
      return '<article class="v29-log-card"><div class="v29-log-top"><span>'+safe(x.source)+'</span><time>'+safe(date)+'</time></div><b>'+safe(x.question)+'</b><p>'+safe(x.summary||"تمت المعالجة")+'</p><button data-log-del="'+i+'" type="button">حذف</button></article>';
    }).join("");
    el.querySelectorAll("[data-log-del]").forEach(b=>b.onclick=()=>{
      const list=read(STORE_LOG,[]); list.splice(Number(b.dataset.logDel),1); write(STORE_LOG,list); renderLog();
    });
  }
  function exportLog(){
    const list=read(STORE_LOG,[]);
    const blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),decisions:list},null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="aghnam-jev-decisions-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function loadLastPrice(){
    const r=read(STORE_PRICE,null); if(!r)return;
    const vals={"v29-item":r.item,"v29-buy":r.buy,"v29-sell":r.sell,"v29-waste":r.waste,"v29-vat":r.vat,"v29-margin":r.target};
    Object.entries(vals).forEach(([id,v])=>{if($(id)&&!$(id).value)$(id).value=v});
  }

  function bind(){
    $("v29-fab").onclick=emitOpen;
    $("v29-close").onclick=close;
    $("v29-modal").addEventListener("click",e=>{if(e.target===$("v29-modal"))close()});
    document.querySelectorAll("[data-v29-tab]").forEach(b=>b.onclick=()=>setTab(b.dataset.v29Tab));
    $("v29-price-calc").onclick=calcPrice;
    $("v29-stock-calc").onclick=stockCalc;
    $("v29-stock-save").onclick=saveStock;
    $("v29-stock-clear").onclick=()=>{if(confirm("مسح كل الأصناف المحفوظة؟")){write(STORE_INV,[]);renderInventory()}};
    $("v29-log-clear").onclick=()=>{if(confirm("مسح سجل قرارات Jev بالكامل؟")){write(STORE_LOG,[]);renderLog()}};
    $("v29-log-export").onclick=exportLog;
    window.addEventListener("jev:decision",e=>logDecision(e.detail));
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",shell,{once:true});else shell();
  window.AghnamV29={open:emitOpen,version:"29.0",logDecision};
})();
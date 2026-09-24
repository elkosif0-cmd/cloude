/* S.kosif V33 — أسلوب النوافذ والقدرات المستفادة من «سِنام»
   - تنقل مجمّع حسب القسم: شريط جانبي على الشاشات الكبيرة، وقائمة «الأقسام» على الجوال
   - رأس صفحة لكل قسم (أيقونة + عنوان عربي + وصف إنجليزي)
   - وضع داكن بأسلوب سِنام (يحفظ اختيارك)
   - قفل الشاشة الآن + قفل تلقائي بعد الخمول (يعيد إلى شاشة كلمة المرور)
   - «مختبر القرار»: نقطة التعادل، صدمات جاهزة، ومصفوفة حساسية السعر × التكلفة
   - «مطابقة إكسل»: الصق أرقام ملفك وقارنها بالتكلفة الحقيقية من محرك التسعير
   لا يغيّر بيانات التطبيق الأساسي. */
(()=>{
  "use strict";
  const K={theme:"skosif_v33_theme",lock:"skosif_v33_autolock_min",decision:"skosif_v33_decision"};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const num=v=>{const n=Number(String(v??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[,٬\s]/g,"").replace("٫","."));return Number.isFinite(n)?n:0};
  const nf=(d=2)=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:d,maximumFractionDigits:d});
  const money=v=>nf(2).format(Number(v)||0)+" ر.س";
  const pct=v=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:1}).format((Number(v)||0)*100)+"٪";
  const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
  const kpi=(a,b,c="")=>'<div class="sk-kpi '+c+'"><span>'+a+'</span><b>'+b+'</b></div>';
  const field=(id,label,type,ph,extra="")=>'<label class="sk-field"><span>'+label+'</span><input id="'+id+'" type="'+type+'" placeholder="'+esc(ph)+'" '+extra+'></label>';
  function toast(msg){
    let t=$("sk-toast");
    if(!t){document.body.insertAdjacentHTML("beforeend",'<div id="sk-toast" class="sk-toast"></div>');t=$("sk-toast")}
    t.textContent=msg;t.classList.add("show");clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove("show"),3200);
  }
  function catalog(){try{if(window.SKosifCore&&window.SKosifCore.catalog)return window.SKosifCore.catalog()}catch{}return {vat:0.15,netBase:true,items:[]}}

  /* ---------- خريطة الأقسام ---------- */
  const META={
    overview:["◎","المركز","Command Center"], k32:["▦","الكتالوج والعروض","Catalog & Offers"],
    pricing:["⌗","التسعير","Pricing Engine"], approvals:["✓","اعتماد الأسعار","Price Governance"], decision:["◈","مختبر القرار","Decision & Sensitivity Lab"],
    customers:["☺","العملاء","Customer 360"],
    suppliers:["⛟","الموردون","Suppliers & Inbound Quality"], cash:["⇄","السيولة","Cash Flow & Forecast"], excel:["⊞","مطابقة إكسل","Excel Reconciliation"],
    reports:["▤","التقارير","Reports Centre"], health:["♡","الصحة","Storage Health"],
  };
  const GROUPS=[["التشغيل اليومي",["overview","k32"]],["التسعير والقرار",["pricing","approvals","decision"]],["المبيعات والعملاء",["customers"]],["التوريد والمالية",["suppliers","cash","excel"]],["التقارير والنظام",["reports","health"]]];
  const keyOf=b=>b.dataset.skTab||b.dataset.sk31Tab||(b.hasAttribute("data-k32-tab")?"k32":"")||b.dataset.sk33Tab||"";

  /* ---------- الغلاف: تجميع التبويبات + رأس الصفحة ---------- */
  function group(){
    const tabs=document.querySelector(".sk-tabs"); if(!tabs)return;
    const loose=[...tabs.children].filter(el=>el.tagName==="BUTTON"&&!el.classList.contains("sk33-menu"));
    if(!loose.length)return;
    for(const [title,keys] of GROUPS){
      let g=tabs.querySelector('.sk33-group[data-g="'+title+'"]');
      if(!g){g=document.createElement("div");g.className="sk33-group";g.dataset.g=title;g.innerHTML='<span class="sk33-gtitle">'+esc(title)+'</span>';tabs.appendChild(g)}
      for(const k of keys){const b=loose.find(x=>keyOf(x)===k);if(b){b.dataset.sk33Icon=(META[k]||["•"])[0];g.appendChild(b)}}
    }
    /* أي تبويب غير معروف يبقى في آخر مجموعة */
    const rest=[...tabs.children].filter(el=>el.tagName==="BUTTON"&&!el.classList.contains("sk33-menu"));
    if(rest.length){const g=tabs.querySelector(".sk33-group:last-of-type");rest.forEach(b=>g.appendChild(b))}
    /* ترتيب المجموعات حسب GROUPS */
    GROUPS.forEach(([t])=>{const g=tabs.querySelector('.sk33-group[data-g="'+t+'"]');if(g)tabs.appendChild(g)});
    tabs.querySelectorAll(".sk33-group").forEach(g=>g.classList.toggle("empty",!g.querySelector("button")));
  }
  function pageHead(){
    const body=$("sk-body"); if(!body)return;
    const act=document.querySelector(".sk-tabs button.active"); const k=act?keyOf(act):"";
    let h=$("sk33-pagehead");
    if(!h){h=document.createElement("div");h.id="sk33-pagehead";body.parentNode.insertBefore(h,body)}
    const m=META[k]; if(!m){h.hidden=true;return}
    h.hidden=false;
    h.innerHTML='<i aria-hidden="true">'+m[0]+'</i><div><b>'+esc(m[1])+'</b><span>'+esc(m[2])+'</span></div>';
  }
  function shell(){
    const panel=document.querySelector(".sk-panel"), tabs=document.querySelector(".sk-tabs"), head=document.querySelector(".sk-head");
    if(!panel||!tabs||!head||panel.classList.contains("sk33"))return !!panel;
    panel.classList.add("sk33");
    /* أزرار الرأس: الوضع الداكن + القفل */
    const close=$("sk-close");
    const tools=document.createElement("div");tools.className="sk33-tools";
    tools.innerHTML='<button type="button" id="sk33-theme" aria-label="تبديل الوضع الداكن">☾</button><button type="button" id="sk33-lock" aria-label="قفل التطبيق">🔒</button>';
    head.insertBefore(tools,close);
    $("sk33-theme").onclick=toggleTheme; $("sk33-lock").onclick=lockSheet;
    /* زر «الأقسام» للجوال */
    tabs.insertAdjacentHTML("afterbegin",'<button type="button" class="sk33-menu" aria-label="كل الأقسام">☰ الأقسام</button>');
    tabs.querySelector(".sk33-menu").onclick=launcher;
    group();
    new MutationObserver(()=>group()).observe(tabs,{childList:true});
    tabs.addEventListener("click",e=>{
      const b=e.target.closest("button:not(.sk33-menu)"); if(!b)return;
      /* الوحدات الأخرى لا تعرف تبويبات V33؛ نزيل تمييزها عند فتح غيرها */
      if(!b.dataset.sk33Tab)tabs.querySelectorAll("[data-sk33-tab]").forEach(x=>x.classList.remove("active"));
      setTimeout(pageHead,60);
    });
    /* الوحدات تعيد رسم المحتوى؛ نحدّث الرأس عند فتح اللوحة */
    const modal=$("sk-modal"); if(modal)new MutationObserver(()=>{if(modal.classList.contains("open")){applyTheme();setTimeout(pageHead,60)}}).observe(modal,{attributes:true,attributeFilter:["class"]});
    applyTheme();
    pageHead();
    return true;
  }
  function launcher(){
    $("sk33-launch")?.remove();
    const tabs=document.querySelector(".sk-tabs");
    const html=GROUPS.map(([t,keys])=>{
      const btns=keys.map(k=>[...tabs.querySelectorAll("button")].find(b=>keyOf(b)===k)).filter(Boolean);
      if(!btns.length)return "";
      return '<section><h5>'+esc(t)+'</h5><div>'+btns.map(b=>{const k=keyOf(b),m=META[k]||["•",b.textContent,""];return '<button type="button" data-go="'+esc(k)+'"><i>'+m[0]+'</i><b>'+esc(m[1])+'</b><small>'+esc(m[2])+'</small></button>'}).join("")+'</div></section>';
    }).join("");
    document.body.insertAdjacentHTML("beforeend",'<div id="sk33-launch" class="sk33-sheet-wrap" role="dialog" aria-modal="true" aria-label="الأقسام"><div class="sk33-sheet"><div class="sk33-sheet-head"><b>الأقسام</b><button type="button" class="sk33-x" aria-label="إغلاق">×</button></div>'+html+'</div></div>');
    const w=$("sk33-launch");
    w.querySelector(".sk33-x").onclick=()=>w.remove(); w.onclick=e=>{if(e.target===w)w.remove()};
    w.querySelectorAll("[data-go]").forEach(x=>x.onclick=()=>{const b=[...tabs.querySelectorAll("button")].find(y=>keyOf(y)===x.dataset.go);w.remove();if(b){b.click();b.scrollIntoView&&b.scrollIntoView({block:"nearest",inline:"nearest"})}});
    applyTheme();
  }

  /* ---------- الوضع الداكن ---------- */
  function themeNow(){const t=load(K.theme,"");return t||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}
  function applyTheme(){
    const t=themeNow();
    ["sk-modal","sk33-launch","sk33-lockw","sk31-po-sheet"].forEach(id=>{const el=$(id);if(el)el.dataset.skTheme=t});
    const b=$("sk33-theme"); if(b){b.textContent=t==="dark"?"☀":"☾";b.setAttribute("aria-pressed",t==="dark")}
  }
  function toggleTheme(){save(K.theme,themeNow()==="dark"?"light":"dark");applyTheme()}
  /* نوافذ الوحدات الأخرى تُنشأ لاحقاً؛ نطبّق عليها الوضع عند ظهورها */
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&/^(sk31-po-sheet|sk33-launch|sk33-lockw)$/.test(n.id||""))n.dataset.skTheme=themeNow()}).observe(document.body,{childList:true});

  /* ---------- القفل ---------- */
  function lockNow(){
    try{sessionStorage.removeItem("aghnamJevSession")}catch{}
    location.replace("./index.html");
  }
  function lockSheet(){
    $("sk33-lockw")?.remove();
    const cur=num(load(K.lock,0));
    document.body.insertAdjacentHTML("beforeend",'<div id="sk33-lockw" class="sk33-sheet-wrap" role="dialog" aria-modal="true" aria-label="القفل"><div class="sk33-sheet"><div class="sk33-sheet-head"><b>قفل التطبيق</b><button type="button" class="sk33-x" aria-label="إغلاق">×</button></div>'+
      '<p class="sk33-note">يعيدك القفل إلى شاشة كلمة المرور. بياناتك تبقى محفوظة على الجهاز كما هي.</p>'+
      '<button type="button" id="sk33-lock-now" class="sk-primary sk33-wide">🔒 قفل الآن</button>'+
      '<label class="sk-field"><span>القفل التلقائي بعد عدم الاستخدام</span><select id="sk33-lock-min">'+[[0,"متوقف"],[5,"5 دقائق"],[15,"15 دقيقة"],[30,"30 دقيقة"],[60,"ساعة"]].map(o=>'<option value="'+o[0]+'"'+(o[0]===cur?' selected':'')+'>'+o[1]+'</option>').join("")+'</select></label>'+
      '</div></div>');
    const w=$("sk33-lockw");
    w.querySelector(".sk33-x").onclick=()=>w.remove(); w.onclick=e=>{if(e.target===w)w.remove()};
    $("sk33-lock-now").onclick=lockNow;
    $("sk33-lock-min").onchange=e=>{save(K.lock,num(e.target.value));last=Date.now();toast(num(e.target.value)?"سيُقفل التطبيق بعد "+e.target.selectedOptions[0].text+" من عدم الاستخدام":"أُوقف القفل التلقائي")};
    applyTheme();
  }
  let last=Date.now();
  ["pointerdown","keydown","touchstart","wheel"].forEach(ev=>addEventListener(ev,()=>{last=Date.now()},{passive:true,capture:true}));
  function idleCheck(){const m=num(load(K.lock,0));if(m>0&&Date.now()-last>m*60000)lockNow()}
  setInterval(idleCheck,30000);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")idleCheck();else last=Math.min(last,Date.now())});

  /* ---------- مختبر القرار ---------- */
  function decisionDefaults(){
    const d=catalog(), boxes=d.items.filter(x=>x.kind==="box"&&x.status!=="archived"&&x.price>0&&x.cost!=null);
    const src=boxes.length?boxes:d.items.filter(x=>x.status!=="archived"&&!x.byProduct&&x.price>0&&x.cost!=null);
    const avg=f=>src.length?src.reduce((a,x)=>a+f(x),0)/src.length:0;
    return {vol:150,price:Math.round(avg(x=>x.price)*100)/100,cost:Math.round(avg(x=>x.cost)*100)/100,fixed:12000,dc:0,dp:0,dv:1,vat:d.vat,src:boxes.length?"متوسط البوكسات النشطة":"متوسط الأصناف"};
  }
  function decisionHTML(){
    const def=decisionDefaults(), st={...def,...load(K.decision,{})}, v=def.vat;
    const pn=p=>p/(1+v);
    const calc=(price,cost,vol)=>{const c=pn(price)-cost;return {contrib:c,profit:vol*c-st.fixed,be:c>0?st.fixed/c:null,margin:pn(price)>0?c/pn(price):null}};
    const base=calc(st.price,st.cost,st.vol);
    const sp=st.price*(1+st.dp/100), sc=st.cost*(1+st.dc/100), sv=st.vol*st.dv, shock=calc(sp,sc,sv);
    const DP=[-10,-5,0,5,10,15], DC=[-10,-5,0,5,10,15,20];
    const cells=DC.map(c=>DP.map(p=>calc(st.price*(1+p/100),st.cost*(1+c/100),st.vol).profit));
    const mx=Math.max(1,...cells.flat().map(Math.abs));
    const color=x=>x>=0?'rgba(18,183,106,'+(0.12+0.55*x/mx).toFixed(2)+')':'rgba(240,68,56,'+(0.12+0.55*-x/mx).toFixed(2)+')';
    const presets=[["غلاء الأعلاف",15,0,1],["نقص المعروض",25,0,1],["موسم الأضحى",10,5,1.8],["ركود السوق",0,-5,0.8],["إعادة ضبط",0,0,1]];
    return [
      '<p class="sk33-note">الأساس من '+esc(def.src)+' في الكتالوج (سعر البيع شامل الضريبة، التكلفة صافية). عدّل الأرقام لتناسب شهرك.</p>',
      '<div class="sk-grid2">',
        field("sk33-vol","حجم المبيعات الشهري (وحدة)","number","150",'min="0" step="1" value="'+st.vol+'"'),
        field("sk33-price","متوسط سعر البيع (شامل الضريبة)","number","0",'min="0" step="0.01" value="'+st.price+'"'),
        field("sk33-cost","متوسط تكلفة الوحدة (صافي)","number","0",'min="0" step="0.01" value="'+st.cost+'"'),
        field("sk33-fixed","المصاريف الثابتة الشهرية","number","0",'min="0" step="1" value="'+st.fixed+'"'),
      '</div>',
      '<div class="sk-kpis">',
        kpi("ربح الوحدة (صافي)",money(base.contrib),base.contrib>0?"good":"warn"),
        kpi("الربح الشهري",money(base.profit),base.profit>=0?"good":"warn"),
        kpi("نقطة التعادل",base.be==null?"غير ممكنة":new Intl.NumberFormat("ar-SA",{maximumFractionDigits:0}).format(Math.ceil(base.be))+" وحدة/شهر",base.be!=null&&base.be<=st.vol?"good":"warn"),
        kpi("الهامش",base.margin==null?"—":pct(base.margin)),
      '</div>',
      '<h4 class="sk33-h">صدمة على السيناريو</h4>',
      '<div class="sk33-chips">'+presets.map(p=>'<button type="button" class="sk33-chip" data-preset="'+p.slice(1).join(",")+'">'+p[0]+'</button>').join("")+'</div>',
      '<div class="sk-grid2">',
        field("sk33-dc","تغيّر تكلفة الشراء ٪","number","0",'step="1" value="'+st.dc+'"'),
        field("sk33-dp","تغيّر سعر البيع ٪","number","0",'step="1" value="'+st.dp+'"'),
        field("sk33-dv","مضاعف حجم المبيعات","number","1",'step="0.05" min="0" value="'+st.dv+'"'),
      '</div>',
      '<div class="sk-kpis">',
        kpi("الربح تحت الصدمة",money(shock.profit),shock.profit>=0?"good":"warn"),
        kpi("الفرق عن الأساس",(shock.profit-base.profit>=0?"+":"")+money(shock.profit-base.profit),shock.profit>=base.profit?"good":"warn"),
        kpi("التعادل تحت الصدمة",shock.be==null?"غير ممكن":new Intl.NumberFormat("ar-SA",{maximumFractionDigits:0}).format(Math.ceil(shock.be))+" وحدة"),
        kpi("الهامش تحت الصدمة",shock.margin==null?"—":pct(shock.margin)),
      '</div>',
      '<h4 class="sk33-h">مصفوفة الحساسية: الربح الشهري حسب تغيّر السعر والتكلفة</h4>',
      '<div class="sk-table-wrap"><table class="sk-table sk33-matrix"><thead><tr><th>التكلفة ↓ / السعر ←</th>'+DP.map(p=>'<th>'+(p>0?"+":"")+p+'٪</th>').join("")+'</tr></thead><tbody>',
      DC.map((c,i)=>'<tr><th>'+(c>0?"+":"")+c+'٪</th>'+cells[i].map((x,j)=>'<td style="background:'+color(x)+'"'+(c===0&&DP[j]===0?' class="sk33-base"':'')+'>'+new Intl.NumberFormat("ar-SA",{maximumFractionDigits:0}).format(x)+'</td>').join("")+'</tr>').join(""),
      '</tbody></table></div>',
      '<p class="sk33-note">الخلية المحددة هي وضعك الحالي. الأخضر ربح والأحمر خسارة؛ اقرأ السطر لترى كم تحتاج رفع السعر لتعويض ارتفاع التكلفة.</p>'
    ].join("");
  }
  function bindDecision(){
    const ids={vol:"sk33-vol",price:"sk33-price",cost:"sk33-cost",fixed:"sk33-fixed",dc:"sk33-dc",dp:"sk33-dp",dv:"sk33-dv"};
    const upd=()=>{const o={};for(const [k,id] of Object.entries(ids))o[k]=num($(id).value);if(o.dv<=0)o.dv=1;save(K.decision,o);render("decision")};
    Object.values(ids).forEach(id=>{const el=$(id);if(el)el.onchange=upd});
    document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>{const [dc,dp,dv]=b.dataset.preset.split(",").map(Number);$("sk33-dc").value=dc;$("sk33-dp").value=dp;$("sk33-dv").value=dv;upd()});
  }

  /* ---------- مطابقة إكسل ---------- */
  const norm=s=>String(s||"").replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\s+/g," ").trim().toLowerCase();
  let excelText="", excelVat="net";
  function matchItem(name,items){
    const n=norm(name); if(!n)return null;
    let hit=items.find(x=>norm(x.name)===n); if(hit)return hit;
    const c=items.filter(x=>{const m=norm(x.name);return m&&(m.includes(n)||n.includes(m))}).sort((a,b)=>norm(b.name).length-norm(a.name).length);
    return c[0]||null;
  }
  function excelHTML(){
    const d=catalog(), items=d.items.filter(x=>x.status!=="archived"), raws=(()=>{try{return window.SKosifCore.raws()}catch{return[]}})();
    const rows=excelText.split(/\r?\n/).map(l=>l.split(/\t|;|,(?=\s*[\d٠-٩.])/).map(x=>x.trim())).filter(c=>c.length>=2&&c[0]);
    const res=rows.map(c=>{
      const it=matchItem(c[0],items), xc=num(c[1]), xp=c[2]!=null?num(c[2]):null;
      if(!it||!(xc>0))return {name:c[0],it,xc,xp,err:!it?"لا يوجد صنف مطابق في الكتالوج":"تكلفة غير صالحة"};
      const xcNet=excelVat==="gross"?xc/(1+d.vat):xc;
      const price=xp>0?xp:it.price, pNet=price/(1+d.vat), base=d.netBase?pNet:price;
      const gap=it.cost-xcNet, gapPct=xcNet>0?gap/xcNet:0;
      let diag="مطابق";
      if(Math.abs(gapPct)>0.003){
        diag=gap>0?"إكسل يُظهر تكلفة أقل من الحقيقية":"إكسل يُظهر تكلفة أعلى من الحقيقية";
        const r=it.kind==="raw"?raws.find(x=>String(x.id)===it.id):null, w=r?num(r.waste)/100:0;
        if(w>0){
          /* نسبة التكلفتين بين طريقتي الهدر: التشافي ÷ الإضافة = 1 / ((1−هدر)(1+هدر)) */
          const ratio=1/((1-w)*(1+w)), got=it.cost/xcNet;
          if(d.yieldMethod&&Math.abs(got-ratio)<0.004)diag="فرق طريقة الهدر: إكسل يضيف الهدر (×(1+هدر)) والتطبيق يقسم على (1−هدر) — إكسل يقلل التكلفة";
          if(!d.yieldMethod&&Math.abs(got*ratio-1)<0.004)diag="فرق طريقة الهدر: إكسل يقسم على (1−هدر) والتطبيق يضيف الهدر (×(1+هدر))";
        }
        if(excelVat==="net"&&Math.abs(xc/(it.cost*(1+d.vat))-1)<0.01)diag="يبدو أن تكلفة إكسل شاملة الضريبة — غيّر خيار «التكلفة في الملف»";
      }
      return {name:c[0],it,xc,xcNet,price,gap,gapPct,xm:base>0?(pNet-xcNet)/base:null,tm:base>0?(pNet-it.cost)/base:null,diag};
    });
    const ok=res.filter(r=>!r.err), under=ok.filter(r=>r.gapPct>0.003);
    return [
      '<p class="sk33-note">الصق من ملف الإكسل أعمدة: <b>اسم الصنف، التكلفة، سعر البيع</b> (السعر اختياري). سطر لكل صنف، مفصولة بـ Tab أو فاصلة. التطبيق يحسب الهدر حالياً بطريقة <b>'+(d.yieldMethod?"التشافي (÷(1−هدر))":"الإضافة (×(1+هدر))")+'</b>.</p>',
      '<label class="sk-field"><span>بيانات الملف</span><textarea id="sk33-xl" rows="6" class="sk33-ta" placeholder="حبشي	33.50	49">'+esc(excelText)+'</textarea></label>',
      '<div class="sk-grid2"><label class="sk-field"><span>التكلفة في الملف</span><select id="sk33-xlvat"><option value="net"'+(excelVat==="net"?" selected":"")+'>صافية (بدون ضريبة)</option><option value="gross"'+(excelVat==="gross"?" selected":"")+'>شاملة الضريبة</option></select></label>'+
      '<div class="sk-actions sk33-end"><button type="button" id="sk33-xlrun" class="sk-primary">مطابقة</button><button type="button" id="sk33-xlsample" class="sk-secondary">نموذج تجريبي</button></div></div>',
      ok.length?'<div class="sk-kpis">'+kpi("أصناف مطابقة",ok.length+" / "+res.length)+kpi("تكلفة إكسل أقل من الحقيقية",under.length,under.length?"warn":"good")+kpi("أكبر فرق",ok.length?pct(Math.max(...ok.map(r=>r.gapPct))):"—")+kpi("غير مطابقة",res.length-ok.length,res.length-ok.length?"warn":"good")+'</div>':'',
      res.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف في الملف</th><th>في الكتالوج</th><th>تكلفة إكسل (صافي)</th><th>التكلفة الحقيقية</th><th>الفرق</th><th>هامش إكسل</th><th>الهامش الحقيقي</th><th>التشخيص</th></tr></thead><tbody>'+
        res.map(r=>r.err?'<tr><td>'+esc(r.name)+'</td><td colspan="7" class="sk31-bad">'+esc(r.err)+'</td></tr>':
          '<tr><td>'+esc(r.name)+'</td><td>'+esc(r.it.name)+'</td><td>'+money(r.xcNet)+'</td><td>'+money(r.it.cost)+'</td><td class="'+(r.gapPct>0.003?'sk31-bad':'')+'">'+(r.gap>=0?"+":"")+pct(r.gapPct)+'</td><td>'+(r.xm==null?'—':pct(r.xm))+'</td><td>'+(r.tm==null?'—':pct(r.tm))+'</td><td>'+esc(r.diag)+'</td></tr>').join("")+
        '</tbody></table></div>':''
    ].join("");
  }
  function bindExcel(){
    const run=()=>{excelText=$("sk33-xl").value;excelVat=$("sk33-xlvat").value;render("excel")};
    $("sk33-xlrun").onclick=run; $("sk33-xlvat").onchange=run;
    $("sk33-xlsample").onclick=()=>{
      const d=catalog(), raws=d.items.filter(x=>x.kind==="raw"&&!x.byProduct&&x.cost>0).slice(0,4);
      const rs=(()=>{try{return window.SKosifCore.raws()}catch{return[]}})();
      excelText=raws.map((x,i)=>{const r=rs.find(y=>String(y.id)===x.id), w=r?num(r.waste)/100:0;
        /* نموذج: أول صنفين بطريقة الهدر الأخرى، والباقي مطابق */
        const ratio=w>0?1/((1-w)*(1+w)):1, c=i<2?(d.yieldMethod?x.cost/ratio:x.cost*ratio):x.cost;return x.name+"\t"+c.toFixed(2)+"\t"+(x.price||0)}).join("\n");
      excelVat="net";render("excel");
    };
  }

  /* ---------- تبويبات V33 ---------- */
  let current=null;
  function render(tab){
    const body=$("sk-body"); if(!body)return;
    current=tab;
    document.querySelectorAll(".sk-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.sk33Tab===tab));
    const y=body.closest(".sk-panel")?.scrollTop||0;
    if(tab==="decision"){body.innerHTML=decisionHTML();bindDecision();}
    if(tab==="excel"){body.innerHTML=excelHTML();bindExcel();}
    const p=body.closest(".sk-panel"); if(p)p.scrollTop=y;
    pageHead();
  }
  function attach(){
    const tabs=document.querySelector(".sk-tabs"); if(!tabs)return false;
    if(!tabs.querySelector("[data-sk33-tab]")){
      tabs.insertAdjacentHTML("beforeend",'<button type="button" data-sk33-tab="decision">مختبر القرار</button><button type="button" data-sk33-tab="excel">مطابقة إكسل</button>');
      tabs.querySelectorAll("[data-sk33-tab]").forEach(b=>b.onclick=()=>render(b.dataset.sk33Tab));
    }
    return shell();
  }
  function init(){
    let tries=0;const t=setInterval(()=>{if((attach()&&document.querySelector("[data-k32-tab]")&&document.querySelector("[data-sk31-tab]"))||++tries>40){clearInterval(t);group();pageHead()}},250);
    window.SKosifShell={open:(tab)=>{if(window.SKosif)window.SKosif.open("overview");attach();if(tab)render(tab)},lock:lockNow,version:"33.0"};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

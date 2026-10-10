/* S.kosif — منظومة التقارير التنفيذية والمالية والتشغيلية
   1. قائمة الدخل وصافي الربح التشغيلي (Operational P&L & EBITDA)
   2. تقرير تدقيق الهدر والتسرب المالي للذبائح (Yield Leakage Audit)
   3. ملخص الإقرار الضريبي الفصلي لهيئة الزكاة (ZATCA VAT Declaration)
   4. رادار العملاء المنقطعين وسلة المبيعات (Customer Retention & Basket Size)
   5. تقرير نهاية اليوم التنفيذي بنقرة واحدة (EOD Executive Digest & Print)
*/
(()=>{
"use strict";

const {$,$$,esc,num,load,save,money,csv}=window.SK;
const roots={};
let repTab="pack"; // pack | pl | yield | vat | churn | trends | eod — «pack» is ui/features/report-pack.js

/* State for P&L model */
const PL_KEY="skosif_rep_pl";
/* قائمة الدخل تبدأ فارغة: يدخل المستخدم أرقام شهره */
const defaultPL={
  revenue:0,
  cogs:0,
  wasteLoss:0,
  salaries:0,
  rent:0,
  utilities:0,
  logistics:0,
  packaging:0,
  otherOpex:0
};

/* State for Yield Audit */
/* تسرب الهدر من شحنات الموردين المسجلة فعلاً (الهدر المتفق عليه مقابل المقاس) */
function yieldData(){
  let rows=[];try{rows=JSON.parse(localStorage.getItem("skosif_v31_supplier_batches"))||[]}catch{}
  const by={};
  rows.forEach(r=>{const k=r.itemName||"صنف";const g=by[k]||(by[k]={name:k,carcasses:0,dressedKg:0,w:0,std:0,act:0,cost:0});const q=Number(r.qty)||0;g.carcasses+=1;g.dressedKg+=q;g.w+=q;g.std+=(Number(r.agreedWaste)||0)*q;g.act+=(Number(r.actualWaste)||0)*q;g.cost+=((Number(r.priceGross)||0)/(r.vatIncl?1.15:1))*q});
  return Object.values(by).map(g=>({name:g.name,carcasses:g.carcasses,dressedKg:g.dressedKg,stdWaste:g.w?g.std/g.w:0,actWaste:g.w?g.act/g.w:0,costKg:g.w?g.cost/g.w:0}));
}

/* بيانات فعلية من قاعدة التطبيق (العملاء وأسطر المبيعات) — لا أرقام ثابتة */
/* Legacy IndexedDB is device-wide, not a tenant database. Never infer ownership
   of untagged real records from whichever company happens to be open. */
const reportCompanyId=()=>String(window.SK?.company?.current?.()?.id||"").trim();
function companyOwnedRows(rows,companyId){
  if(!companyId||!Array.isArray(rows))return[];
  return rows.filter(r=>r&&typeof r==="object"&&(
    (typeof r.companyId==="string"&&r.companyId===companyId)||
    /* The explicit demo fixture predates companyId. Only allow marked demo data in its own workspace. */
    (companyId==="demo-co"&&r.demo===true&&!r.companyId)
  ));
}
const REAL={loaded:false,loading:false,companyId:"",generation:0,customers:[],lines:[]};
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store,"readonly").objectStore(store).getAll();g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
function loadReal(){
  const companyId=reportCompanyId();
  if(REAL.companyId===companyId&&(REAL.loaded||REAL.loading))return;
  /* Invalidate any outstanding asynchronous read when switching companies. */
  const generation=++REAL.generation;
  REAL.companyId=companyId;REAL.customers=[];REAL.lines=[];REAL.loaded=false;REAL.loading=false;
  if(!companyId)return;
  REAL.loading=true;
  Promise.all([idbAll("customers"),idbAll("sales_lines")]).then(([customers,lines])=>{
    if(generation!==REAL.generation||reportCompanyId()!==companyId)return;
    REAL.customers=companyOwnedRows(customers,companyId);
    REAL.lines=companyOwnedRows(lines,companyId);
    REAL.loaded=true;REAL.loading=false;
    if(roots.reports&&roots.reports.isConnected)paintReports();
  }).catch(()=>{
    if(generation!==REAL.generation||reportCompanyId()!==companyId)return;
    REAL.loaded=true;REAL.loading=false;
    if(roots.reports&&roots.reports.isConnected)paintReports();
  });
}
const lineAmt=l=>Number(l.amountHalalas)?Number(l.amountHalalas)/100:(Number(l.amount)||0);
/* the device's calendar day: toISOString() still gives yesterday in Riyadh until 03:00 */
const localDay=(d=new Date())=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");

/* ==========================================================================
   Tab 1: Operational P&L HTML & Logic
   ========================================================================== */
/* a share of revenue for exports and messages: "—" when there is no revenue, never NaN% or Infinity% */
const revPct=(v,rev)=>rev>0?((Number(v)||0)/rev*100).toFixed(1)+"%":"—";
function plHTML(){
  const pl=load(PL_KEY,defaultPL);
  const totalOpex=pl.salaries+pl.rent+pl.utilities+pl.logistics+pl.packaging+pl.otherOpex;
  const grossProfit=pl.revenue-pl.cogs-pl.wasteLoss;
  const netProfit=grossProfit-totalOpex;
  const grossMargin=pl.revenue>0?(grossProfit/pl.revenue)*100:0;
  const netMargin=pl.revenue>0?(netProfit/pl.revenue)*100:0;

  const cogsPct=pl.revenue>0?(pl.cogs/pl.revenue)*100:0;
  const wastePct=pl.revenue>0?(pl.wasteLoss/pl.revenue)*100:0;
  const opexPct=pl.revenue>0?(totalOpex/pl.revenue)*100:0;
  const profitPct=Math.max(0,netMargin);

  return [
    '<div class="sk-stack">',
      '<div class="sk-pl-meter">',
        '<div class="sk-pl-bar-cogs" style="width:'+cogsPct+'%;" title="تكلفة الشراء: '+cogsPct.toFixed(1)+'%"></div>',
        '<div class="sk-pl-bar-waste" style="width:'+wastePct+'%;" title="تكلفة الهدر: '+wastePct.toFixed(1)+'%"></div>',
        '<div class="sk-pl-bar-opex" style="width:'+opexPct+'%;" title="المصاريف التشغيلية: '+opexPct.toFixed(1)+'%"></div>',
        '<div class="sk-pl-bar-profit" style="width:'+profitPct+'%;" title="صافي الربح: '+profitPct.toFixed(1)+'%"></div>',
      '</div>',
      '<div class="sk-pl-legend">',
        '<span><i style="background:var(--sk-bad);"></i> المشتريات (COGS): '+cogsPct.toFixed(1)+'%</span>',
        '<span><i style="background:var(--sk-warn);"></i> تكلفة الهدر والعظم: '+wastePct.toFixed(1)+'%</span>',
        '<span><i style="background:var(--sk-brand);"></i> المصاريف التشغيلية: '+opexPct.toFixed(1)+'%</span>',
        '<span><i style="background:var(--sk-ok);"></i> صافي الربح التشغيلي: '+netMargin.toFixed(1)+'%</span>',
      '</div>',

      '<div class="sk-kpis">',
        '<div class="sk-kpi"><span>إجمالي الإيرادات</span><b>'+money(pl.revenue)+'</b></div>',
        '<div class="sk-kpi"><span>مجمل الربح (Gross Profit)</span><b>'+money(grossProfit)+'</b><small>الهامش '+grossMargin.toFixed(1)+'%</small></div>',
        '<div class="sk-kpi '+(netProfit>=0?'good':'bad')+'"><span>صافي الربح التشغيلي</span><b>'+money(netProfit)+'</b></div>',
        '<div class="sk-kpi accent"><span>هامش الربح الصافي</span><b>'+netMargin.toFixed(1)+'%</b></div>',
      '</div>',

      '<div class="sk-section-title" style="margin:12px 0 8px;"><b>تعديل أرقام الإيرادات والتكاليف الشهرية</b></div>',
      '<div class="sk-grid2">',
        '<label class="sk-field"><span>إجمالي المبيعات الشهرية</span><input id="sk-pl-rev" type="number" step="1000" value="'+pl.revenue+'"></label>',
        '<label class="sk-field"><span>تكلفة شراء الذبائح واللحوم (COGS)</span><input id="sk-pl-cogs" type="number" step="1000" value="'+pl.cogs+'"></label>',
        '<label class="sk-field"><span>تكلفة العظم والهدر غير المسترد</span><input id="sk-pl-waste" type="number" step="500" value="'+pl.wasteLoss+'"></label>',
        '<label class="sk-field"><span>رواتب القصابين والعمالة</span><input id="sk-pl-sal" type="number" step="500" value="'+pl.salaries+'"></label>',
      '</div>',
      '<div class="sk-grid2">',
        '<label class="sk-field"><span>إيجار الملحمة / المستودع</span><input id="sk-pl-rent" type="number" step="500" value="'+pl.rent+'"></label>',
        '<label class="sk-field"><span>كهرباء غرف التبريد والتكييف</span><input id="sk-pl-util" type="number" step="200" value="'+pl.utilities+'"></label>',
        '<label class="sk-field"><span>ديزل ونقل ومواصلات</span><input id="sk-pl-log" type="number" step="200" value="'+pl.logistics+'"></label>',
        '<label class="sk-field"><span>تغليف وفاكيوم وأطباق</span><input id="sk-pl-pkg" type="number" step="200" value="'+pl.packaging+'"></label>',
      '</div>',

      '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">',
        '<button type="button" id="sk-pl-wa" class="btn" style="background:var(--sk-ok);color:#fff;">إرسال ملخص الأرباح والخسائر عبر واتساب</button>',
        '<button type="button" id="sk-pl-export" class="btn">تصدير قائمة الدخل (CSV)</button>',
      '</div>',
    '</div>'
  ].join("");
}

function bindPL(){
  const reCalc=()=>{
    const pl={
      revenue: num($("#sk-pl-rev").value),
      cogs: num($("#sk-pl-cogs").value),
      wasteLoss: num($("#sk-pl-waste").value),
      salaries: num($("#sk-pl-sal").value),
      rent: num($("#sk-pl-rent").value),
      utilities: num($("#sk-pl-util").value),
      logistics: num($("#sk-pl-log").value),
      packaging: num($("#sk-pl-pkg").value),
      otherOpex: 1500
    };
    save(PL_KEY,pl);
    paintReports();
  };
  ["sk-pl-rev","sk-pl-cogs","sk-pl-waste","sk-pl-sal","sk-pl-rent","sk-pl-util","sk-pl-log","sk-pl-pkg"].forEach(id=>{
    $("#"+id)?.addEventListener("input",reCalc);
  });

  $("#sk-pl-wa")?.addEventListener("click",()=>{
    const pl=load(PL_KEY,defaultPL);
    const totalOpex=pl.salaries+pl.rent+pl.utilities+pl.logistics+pl.packaging+pl.otherOpex;
    const grossProfit=pl.revenue-pl.cogs-pl.wasteLoss;
    const netProfit=grossProfit-totalOpex;
    let msg="*📊 تقرير قائمة الدخل والأرباح التشغيلية — "+SK.bizName()+"*\n";
    msg+="المبيعات: "+money(pl.revenue)+"\n";
    msg+="تكلفة المشتريات (COGS): "+money(pl.cogs)+"\n";
    msg+="تكلفة الهدر والعظم: "+money(pl.wasteLoss)+"\n";
    msg+="إجمالي المصاريف التشغيلية: "+money(totalOpex)+"\n";
    msg+="--------------------------------\n";
    msg+="*مجمل الربح:* "+money(grossProfit)+" ("+revPct(grossProfit,pl.revenue)+")\n";
    msg+="*صافي الربح التشغيلي:* "+money(netProfit)+" ("+revPct(netProfit,pl.revenue)+")\n";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  });

  $("#sk-pl-export")?.addEventListener("click",()=>{
    const pl=load(PL_KEY,defaultPL);
    const totalOpex=pl.salaries+pl.rent+pl.utilities+pl.logistics+pl.packaging+pl.otherOpex;
    const grossProfit=pl.revenue-pl.cogs-pl.wasteLoss;
    const netProfit=grossProfit-totalOpex;
    const headers=["البند","القيمة (ر.س)","النسبة من المبيعات"];
    const rows=[
      ["إجمالي الإيرادات",pl.revenue.toFixed(2),"100%"],
      ["تكلفة المشتريات (COGS)",pl.cogs.toFixed(2),revPct(pl.cogs,pl.revenue)],
      ["تكلفة الهدر والعظم",pl.wasteLoss.toFixed(2),revPct(pl.wasteLoss,pl.revenue)],
      ["مجمل الربح",grossProfit.toFixed(2),revPct(grossProfit,pl.revenue)],
      ["رواتب وعمالة",pl.salaries.toFixed(2),revPct(pl.salaries,pl.revenue)],
      ["إيجار ومستودع",pl.rent.toFixed(2),revPct(pl.rent,pl.revenue)],
      ["كهرباء وتبريد",pl.utilities.toFixed(2),revPct(pl.utilities,pl.revenue)],
      ["نقل ولوجستيات",pl.logistics.toFixed(2),revPct(pl.logistics,pl.revenue)],
      ["تغليف وفاكيوم",pl.packaging.toFixed(2),revPct(pl.packaging,pl.revenue)],
      ["مصاريف تشغيلية أخرى",pl.otherOpex.toFixed(2),revPct(pl.otherOpex,pl.revenue)],
      ["إجمالي المصاريف التشغيلية",totalOpex.toFixed(2),revPct(totalOpex,pl.revenue)],
      ["صافي الربح التشغيلي",netProfit.toFixed(2),revPct(netProfit,pl.revenue)]
    ];
    csv.download("تقرير_قائمة_الدخل_التشغيلية.csv",headers,rows);
  });
}

/* ==========================================================================
   Tab 2: Yield Leakage Audit HTML & Logic
   ========================================================================== */
function yieldHTML(){
  let totalLossSAR=0;
  const rows=yieldData().map(r=>{
    const diffPct=Math.max(0,r.actWaste-r.stdWaste);
    const lossKg=(r.dressedKg*(diffPct/100));
    const lossSAR=lossKg*r.costKg;
    totalLossSAR+=lossSAR;
    const score=diffPct<=1?"⭐⭐⭐⭐":(diffPct<=3?"⭐⭐":"بحاجة تدريب");
    return { ...r, diffPct, lossKg, lossSAR, score };
  });

  return [
    '<div class="sk-stack">',
      '<div class="sk-kpis">',
        '<div class="sk-kpi bad"><span>إجمالي التسرب المالي للهدر</span><b>'+money(totalLossSAR)+'</b></div>',
        '<div class="sk-kpi"><span>إجمالي وزن الذبائح المشغلة</span><b>'+rows.reduce((s,x)=>s+x.dressedKg,0)+' كجم</b></div>',
        '<div class="sk-kpi"><span>الشحنات المدققة</span><b>'+rows.reduce((s,x)=>s+x.carcasses,0)+'</b></div>',
      '</div>',
      (rows.length?'':'<div class="sk-note">لا توجد شحنات مسجلة بعد. سجّل شحنات الموردين مع الهدر المتفق عليه والمقاس فعلياً في «الموردون والمشتريات» ليظهر التسرب هنا.</div>'),

      '<div class="sk-section-title" style="margin:14px 0 8px;"><b>مقارنة الهدر المخطط مقابل المسجل فعلياً في صالة التقطيع</b></div>',
      '<div class="sk-table-wrap">',
        '<table class="sk-table">',
          '<thead><tr><th>نوع الذبيحة</th><th>العدد</th><th>الوزن</th><th>الهدر المتوقع</th><th>الهدر الفعلي</th><th>الفاقد الإضافي</th><th>الخسارة بالريال</th><th>تقييم القصاب</th></tr></thead>',
          '<tbody>',
            rows.map(r=>'<tr>'+
              '<td><b>'+esc(r.name)+'</b></td>'+
              '<td>'+r.carcasses+'</td>'+
              '<td>'+r.dressedKg+' كجم</td>'+
              '<td>'+r.stdWaste+'%</td>'+
              '<td>'+r.actWaste+'%</td>'+
              '<td><span class="sk-leak-tag '+(r.diffPct>2?'high':'normal')+'">+'+r.diffPct.toFixed(1)+'% ('+r.lossKg.toFixed(1)+' كجم)</span></td>'+
              '<td style="color:#b91c1c;font-weight:bold;">'+money(r.lossSAR)+'</td>'+
              '<td>'+r.score+'</td>'+
            '</tr>').join(""),
          '</tbody>',
        '</table>',
      '</div>',

      '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">',
        '<button type="button" id="sk-yield-wa" class="btn" style="background:#25D366;color:#fff;">إرسال تقرير فاقد الهدر لفريق التقطيع</button>',
        '<button type="button" id="sk-yield-export" class="btn">تصدير تدقيق الهدر (CSV)</button>',
      '</div>',
    '</div>'
  ].join("");
}

function bindYield(){
  $("#sk-yield-wa")?.addEventListener("click",()=>{
    let totalLossSAR=0;
    let msg="*🥩 تقرير تدقيق الهدر والتسرب المالي — صالة التقطيع*\n";
    msg+="التاريخ: "+new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn")+"\n";
    msg+="--------------------------------\n";
    yieldData().forEach(r=>{
      const diffPct=Math.max(0,r.actWaste-r.stdWaste);
      const lossKg=(r.dressedKg*(diffPct/100));
      const lossSAR=lossKg*r.costKg;
      totalLossSAR+=lossSAR;
      msg+="• "+r.name+": هدر فعلي "+r.actWaste+"% (المخطط "+r.stdWaste+"%) | فاقد: "+lossKg.toFixed(1)+" كجم ("+money(lossSAR)+")\n";
    });
    msg+="--------------------------------\n";
    msg+="*إجمالي التسرب المالي للهدر:* "+money(totalLossSAR)+"\nيرجى مراجعة مهارات التشفية وفصل العظم بدقة لتفادي هذه الفروقات.";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  });

  $("#sk-yield-export")?.addEventListener("click",()=>{
    const headers=["نوع الذبيحة","الرؤوس","الوزن كجم","الهدر المتوقع","الهدر الفعلي","الفاقد كجم","الخسارة بالريال"];
    const rows=yieldData().map(r=>{
      const diffPct=Math.max(0,r.actWaste-r.stdWaste);
      const lossKg=(r.dressedKg*(diffPct/100));
      const lossSAR=lossKg*r.costKg;
      return [r.name,r.carcasses,r.dressedKg,r.stdWaste+"%",r.actWaste+"%",lossKg.toFixed(2),lossSAR.toFixed(2)];
    });
    csv.download("تقرير_تدقيق_الهدر_والتشفية.csv",headers,rows);
  });
}

/* ==========================================================================
   Tab 3: ZATCA VAT Declaration Summary HTML & Logic
   ========================================================================== */
function vatHTML(){
  const pl=load(PL_KEY,defaultPL);
  const taxableSales=pl.revenue/1.15;
  const outputVAT=taxableSales*0.15;
  const taxablePurchases=pl.cogs+pl.packaging;
  const inputVAT=taxablePurchases*0.15;
  const netVAT=outputVAT-inputVAT;

  /* the actual return comes from the books; this one is an estimate from the figures typed in «قائمة الدخل» */
  const books=window.SKosifLedger&&SKosifLedger.entries().length;
  return [
    '<div class="sk-stack">',
      '<div class="sk-note'+(books?'':' warn')+'">هذه الأرقام <b>تقدير</b> من مدخلات قائمة الدخل. '+(books?'الإقرار الفعلي من القيود المرحّلة، ربعاً بربع، مع قيد إقفال الضريبة: <button type="button" class="linkish" data-ledger-open="vat">إقرار الضريبة من الدفاتر</button>':'رحّل المبيعات والمشتريات في «الدفاتر المحاسبية» ليُحسب الإقرار الفعلي من القيود.')+'</div>',
      '<div class="sk-kpis">',
        '<div class="sk-kpi"><span>إجمالي المبيعات (شامل الضريبة)</span><b>'+money(pl.revenue)+'</b></div>',
        '<div class="sk-kpi"><span>ضريبة المخرجات المحصلة (15%)</span><b>'+money(outputVAT)+'</b></div>',
        '<div class="sk-kpi"><span>ضريبة المدخلات القابلة للخصم (15%)</span><b>'+money(inputVAT)+'</b></div>',
        '<div class="sk-kpi '+(netVAT>=0?'accent':'good')+'"><span>صافي الضريبة واجبة السداد للهيئة</span><b>'+money(netVAT)+'</b></div>',
      '</div>',

      '<div class="sk-section-title" style="margin:14px 0 8px;"><b>مسودة الإقرار الضريبي الرسمي (وفق نموذج هيئة الزكاة والضريبة والجمارك ZATCA)</b></div>',
      '<div class="sk-table-wrap">',
        '<table class="sk-table">',
          '<thead><tr><th>رقم البند</th><th>وصف البند الضريبي</th><th>المبلغ الخاضع للضريبة (ر.س)</th><th>مبلغ الضريبة 15% (ر.س)</th></tr></thead>',
          '<tbody>',
            '<tr><td><b>1.1</b></td><td>المبيعات الخاضعة للنسبة الأساسية (15%)</td><td>'+taxableSales.toFixed(2)+'</td><td>'+outputVAT.toFixed(2)+'</td></tr>',
            '<tr><td><b>1.2</b></td><td>المبيعات المحلية الخاضعة لنسبة الصفر</td><td>0.00</td><td>0.00</td></tr>',
            '<tr style="background:var(--surface-2,#fafafa);font-weight:bold;"><td></td><td>إجمالي ضريبة المبيعات (المخرجات)</td><td>'+taxableSales.toFixed(2)+'</td><td style="color:#b91c1c;">'+outputVAT.toFixed(2)+'</td></tr>',
            '<tr><td><b>2.1</b></td><td>المشتريات الخاضعة للنسبة الأساسية (15%)</td><td>'+taxablePurchases.toFixed(2)+'</td><td>'+inputVAT.toFixed(2)+'</td></tr>',
            '<tr style="background:var(--surface-2,#fafafa);font-weight:bold;"><td></td><td>إجمالي ضريبة المشتريات (المدخلات)</td><td>'+taxablePurchases.toFixed(2)+'</td><td style="color:#059669;">'+inputVAT.toFixed(2)+'</td></tr>',
            '<tr style="background:var(--surface-3,#eee);font-weight:bold;font-size:1.02rem;"><td><b>3.1</b></td><td>صافي الضريبة المستحقة للسداد للهيئة</td><td>—</td><td style="color:#8a5a2b;">'+netVAT.toFixed(2)+' ر.س</td></tr>',
          '</tbody>',
        '</table>',
      '</div>',

      '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">',
        '<button type="button" id="sk-vat-wa" class="btn" style="background:#25D366;color:#fff;">إرسال مسودة الإقرار للمحاسب القانوني</button>',
        '<button type="button" id="sk-vat-export" class="btn">تصدير جدول الإقرار (CSV)</button>',
      '</div>',
    '</div>'
  ].join("");
}

function bindVAT(){
  $("#sk-vat-wa")?.addEventListener("click",()=>{
    const pl=load(PL_KEY,defaultPL);
    const taxableSales=pl.revenue/1.15;
    const outputVAT=taxableSales*0.15;
    const taxablePurchases=pl.cogs+pl.packaging;
    const inputVAT=taxablePurchases*0.15;
    const netVAT=outputVAT-inputVAT;
    let msg="*🧾 مسودة الإقرار الضريبي — "+SK.bizName()+" (ZATCA)*\n";
    msg+="الفترة الضريبية: الربع الحالي 2026\n";
    msg+="--------------------------------\n";
    msg+="المبيعات الخاضعة للضريبة: "+money(taxableSales)+"\n";
    msg+="ضريبة المبيعات (المخرجات 15%): "+money(outputVAT)+"\n";
    msg+="المشتريات الخاضعة للضريبة: "+money(taxablePurchases)+"\n";
    msg+="ضريبة المشتريات (المدخلات 15%): "+money(inputVAT)+"\n";
    msg+="--------------------------------\n";
    msg+="*صافي الضريبة الواجبة السداد للهيئة:* "+money(netVAT)+"\nيرجى مراجعة الفواتير واعتماد التقديم في بوابة زكاة وفاتورة.";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  });

  $("#sk-vat-export")?.addEventListener("click",()=>{
    const pl=load(PL_KEY,defaultPL);
    const taxableSales=pl.revenue/1.15;
    const outputVAT=taxableSales*0.15;
    const taxablePurchases=pl.cogs+pl.packaging;
    const inputVAT=taxablePurchases*0.15;
    const netVAT=outputVAT-inputVAT;
    const headers=["البند","المبلغ الخاضع للضريبة","مبلغ الضريبة 15%"];
    const rows=[
      ["1.1 المبيعات الخاضعة للنسبة الأساسية",taxableSales.toFixed(2),outputVAT.toFixed(2)],
      ["2.1 المشتريات الخاضعة للنسبة الأساسية",taxablePurchases.toFixed(2),inputVAT.toFixed(2)],
      ["3.1 صافي الضريبة المستحقة للهيئة","—",netVAT.toFixed(2)]
    ];
    csv.download("مسودة_الإقرار_الضريبي_ZATCA.csv",headers,rows);
  });
}

/* ==========================================================================
   Tab 4: Customer Churn Radar & Basket Analysis HTML & Logic
   ========================================================================== */
/* رادار العملاء المنقطعين — the same stores, mapping and engine as «ذكاء المبيعات» (SKosifSalesIntel.snapshot). Each
   customer is measured against their own buying rhythm (the median days between their orders), not one fixed
   14/30-day rule on a stored summary, so this list, the hub's follow-up list and the executive pack always agree. */
const CH={res:null,loading:false,failed:false};
function loadChurn(){
  const si=window.SKosifSalesIntel;if(CH.loading||!si||!si.snapshot)return;
  CH.loading=true;
  si.snapshot("90").then(r=>{CH.res=r;CH.failed=false},e=>{CH.failed=true;SK.errors&&SK.errors.report(e,"reports:churn")})
    .finally(()=>{CH.loading=false;if(repTab==="churn"&&roots.reports&&roots.reports.isConnected)paintReports()});
}
const nf0=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0});
/* a WhatsApp link for a Saudi mobile in any common form (05…, 5…, 9665…, +966…, 00966…) */
function waLink(phone,text){let d=String(phone||"").replace(/\D/g,"");if(/^00/.test(d))d=d.slice(2);if(/^05\d{8}$/.test(d))d="966"+d.slice(1);else if(/^5\d{8}$/.test(d))d="966"+d;
  return d.length>=9?"https://wa.me/"+d+(text?"?text="+encodeURIComponent(text):""):""}
function churnHTML(){
  if(!window.SKosifSalesIntel||!SKosifSalesIntel.snapshot)return '<div class="sk-empty">رادار العملاء يعتمد على شاشة «ذكاء المبيعات»، ولم تُحمَّل في هذه النسخة.</div>';
  if(CH.failed)return '<div class="sk-empty">تعذّر حساب الرادار — افتح التبويب مرة أخرى.</div>';
  if(!CH.res){loadChurn();return '<div class="sk-empty" aria-busy="true">جارٍ قياس إيقاع كل عميل…</div>'}
  const r=CH.res;
  if(r.empty)return '<div class="sk-empty">لا توجد مبيعات مؤرخة بعد. استورد العملاء والمبيعات من «العملاء» ليظهر الرادار.</div>';
  const SEG=Object.fromEntries(SKEngines.sales.salesInsights.SEGMENTS.map(s=>[s.key,s]));
  const late=r.followup.filter(c=>c.status==="overdue").length,due=r.followup.length-late;
  const stake=r.followup.reduce((a,c)=>a+c.monthlyValue,0),cant=r.segments.find(s=>s.key==="cantLose");
  const rows=r.followup.slice(0,40).map(c=>{const s=SEG[c.segment]||{label:c.segment,tone:"info"};
    return '<tr><td class="s"><b>'+esc(c.name||"بدون اسم")+'</b>'+(c.city?'<small class="sk-churn-city">'+esc(c.city)+'</small>':'')+'</td>'+
      '<td><span class="sksev '+esc(s.tone)+'">'+esc(s.label)+'</span></td><td class="mono">'+esc(c.last)+'</td><td class="num">'+nf0.format(c.daysSince)+'</td>'+
      '<td class="num">'+nf0.format(c.cadenceUsed)+(c.personal?'':'*')+'</td>'+
      '<td>'+(c.status==="overdue"?'<span class="sksev bad">متأخر</span>':'<span class="sksev warn">حان موعده</span>')+'</td>'+
      '<td class="money">'+nf0.format(Math.round(c.monthlyValue/100))+'</td>'+
      '<td><span class="sk-churn-acts">'+(waLink(c.phone)?'<button type="button" class="btn sm" data-churn-wa="'+esc(c.id)+'">رسالة تنشيط</button>':'')+
      '<button type="button" class="btn sm" data-churn-task="'+esc(c.id)+'">+ مهمة</button></span></td></tr>'}).join("");
  return '<div class="sk-stack">'+
    '<div class="sk-kpis">'+
      '<div class="sk-kpi bad"><span>متأخرون عن إيقاعهم</span><b>'+nf0.format(late)+'</b></div>'+
      '<div class="sk-kpi warn"><span>حان موعدهم</span><b>'+nf0.format(due)+'</b></div>'+
      '<div class="sk-kpi"><span>قيمتهم الشهرية المتوقعة</span><b>'+money(stake/100)+'</b></div>'+
      '<div class="sk-kpi"><span>كبار عملاء غابوا</span><b>'+nf0.format(cant?cant.count:0)+'</b></div>'+
    '</div>'+
    (rows?'<div class="tw"><table class="t sk-churn"><thead><tr><th class="s">العميل</th><th>الشريحة</th><th>آخر شراء</th><th>منذ (يوم)</th><th>الإيقاع (يوم)</th><th>الحالة</th><th>القيمة الشهرية (ر.س)</th><th class="act">تواصل</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      :'<div class="sk-empty">لا أحد متأخر عن إيقاعه المعتاد الآن.</div>')+
    '<p class="hint">الإيقاع = وسيط الأيام بين طلبات العميل. «متأخر» إذا تجاوز غيابه 1.5 مرة من إيقاعه (وأسبوعاً على الأقل)، و«حان موعده» إذا تجاوز إيقاعه. * عميل بطلب واحد يُقاس بالإيقاع الشائع لعملائك ('+nf0.format(r.typicalCadence)+' يوماً). الترتيب حسب القيمة الشهرية المتوقعة × التأخر، حتى '+esc(r.period.to)+'. القائمة نفسها في «ذكاء المبيعات».</p>'+
    '<div><button type="button" class="btn" data-churn-go>فتح «ذكاء المبيعات»</button></div>'+
  '</div>';
}

function bindChurn(){
  const body=$("#sk-rep-body");if(!body||!CH.res||CH.res.empty)return;
  const byId=id=>CH.res.followup.find(c=>c.id===id);
  body.querySelectorAll("[data-churn-wa]").forEach(b=>b.onclick=()=>{const c=byId(b.dataset.churnWa);if(!c)return;
    const biz=((document.getElementById("biz-name")||{}).textContent||"SQC").trim();
    const link=waLink(c.phone,"مرحباً"+(c.name?" "+c.name:"")+"،\nاشتقنا لتعاملكم مع *"+biz+"*. يسعدنا خدمتكم في طلبكم القادم — تواصلوا معنا بالرد على هذه الرسالة.");
    if(link)window.open(link,"_blank","noopener")});
  body.querySelectorAll("[data-churn-task]").forEach(b=>b.onclick=()=>{const c=byId(b.dataset.churnTask);if(!c)return;
    if(!window.SKosifTasks||!SKosifTasks.add){SK.toast("المهام غير متاحة","warn");return}
    SKosifTasks.add({title:"تواصل مع "+(c.name||"عميل")+(c.phone?" — "+c.phone:"")+" (آخر شراء "+c.last+")",cap:"execreports",priority:c.status==="overdue"?"high":"normal"});SK.toast("أُضيفت إلى المهام","ok")});
  const go=body.querySelector("[data-churn-go]");if(go)go.onclick=()=>window.SKosifCore&&SKosifCore.go("salesintel");
}

function eodToday(){
  const today=localDay(),lines=REAL.lines.filter(l=>String(l.date||"").slice(0,10)===today);
  const total=lines.reduce((a,l)=>a+lineAmt(l),0),cust=new Set(lines.map(l=>l.customerId).filter(Boolean)).size,orders=new Set(lines.map(l=>l.ref||l.externalOrderId).filter(Boolean)).size;
  let cold=[];try{cold=JSON.parse(localStorage.getItem("skosif_v38_coldchain"))||[]}catch{}
  const coldToday=cold.filter(c=>String(c.time||"").slice(0,10)===today),breaks=coldToday.filter(c=>Number(c.temp)>4).length;
  return {today,total,cust,orders,lines:lines.length,coldToday,breaks};
}
function eodHTML(){
  if(REAL.companyId!==reportCompanyId()||!REAL.loaded){loadReal();return '<div class="sk-empty">جارٍ قراءة مبيعات اليوم…</div>'}
  const d=eodToday(),biz=((document.getElementById("biz-name")||{}).textContent||"SQC").trim(),now=new Date();
  return [
    '<div class="sk-stack">',
      '<div class="sk-exec-sheet" id="sk-exec-sheet-printable">',
        '<div class="sk-exec-header"><div class="sk-exec-title"><h2>'+esc(biz)+' • ملخص نهاية اليوم</h2><p>من المبيعات وقراءات التبريد المسجلة في التطبيق</p></div>',
          '<div class="sk-exec-meta"><div><b>التاريخ:</b> '+now.toLocaleDateString("ar-SA-u-nu-latn")+'</div><div><b>التوقيت:</b> '+now.toLocaleTimeString("ar-SA-u-nu-latn")+'</div></div></div>',
        '<div class="sk-kpis" style="margin-bottom:16px;">',
          '<div class="sk-kpi"><span>مبيعات اليوم المسجلة</span><b>'+money(d.total)+'</b></div>',
          '<div class="sk-kpi"><span>الطلبات</span><b>'+d.orders+'</b></div>',
          '<div class="sk-kpi"><span>العملاء</span><b>'+d.cust+'</b></div>',
          '<div class="sk-kpi '+(d.breaks?'bad':'')+'"><span>قراءات التبريد اليوم</span><b>'+d.coldToday.length+(d.breaks?' ('+d.breaks+' تجاوز)':'')+'</b></div>',
        '</div>',
        (d.lines?'':'<div class="sk-note">لا توجد مبيعات مؤكدة الملكية للشركة الحالية اليوم. البيانات القديمة غير المربوطة بشركة محفوظة دون عرض حتى يتم التحقق من ملكيتها وترحيلها بأمان.</div>'),
      '</div>',
      '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">',
        '<button type="button" id="sk-eod-wa" class="btn" style="background:#25D366;color:#fff;">إرسال الملخص عبر واتساب</button>',
        '<button type="button" id="sk-eod-print" class="btn btn-pri">طباعة الملخص</button>',
      '</div>',
    '</div>'
  ].join("");
}

function bindEOD(){
  $("#sk-eod-wa")?.addEventListener("click",()=>{
    const d=eodToday(),biz=((document.getElementById("biz-name")||{}).textContent||"SQC").trim();
    const msg=["*ملخص نهاية اليوم — "+biz+"*","التاريخ: "+new Date().toLocaleDateString("ar-SA-u-nu-latn"),"مبيعات اليوم المسجلة: "+money(d.total),"الطلبات: "+d.orders+" | العملاء: "+d.cust,"قراءات التبريد: "+d.coldToday.length+(d.breaks?" (تجاوز: "+d.breaks+")":"")].join("\n");
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank","noopener");
  });
  $("#sk-eod-print")?.addEventListener("click",()=>{
    const sheet=$("#sk-exec-sheet-printable");if(!sheet)return;
    sheet.classList.add("sk-print-report");window.print();setTimeout(()=>sheet.classList.remove("sk-print-report"),1000);
  });
}

/* ==========================================================================
   Master Render & View Registration
   ========================================================================== */
/* ==========================================================================
   Tab 6: Visual Charts & Analytics (SVG Zero-Dependency)
   ========================================================================== */
function trendsHTML(){
  if(REAL.companyId!==reportCompanyId()||!REAL.loaded){loadReal();return '<div class="sk-empty">جارٍ قراءة المبيعات…</div>'}
  const lines=REAL.lines.filter(l=>l&&l.date);
  if(!lines.length)return '<div class="sk-empty">لا توجد مبيعات مرتبطة بمعرّف الشركة الحالية. بيانات الشركات الأخرى والسجلات القديمة غير محددة الملكية محجوبة عن التقرير، ولم تُحذف.</div>';
  const amt=l=>Number(l.amount)||(Number(l.amountHalalas)||0)/100;
  const dayKey=d=>String(d).slice(0,10);
  const last=lines.map(l=>dayKey(l.date)).sort().pop();
  const end=new Date(last+"T12:00:00"),days=[];
  for(let i=6;i>=0;i--){const d=new Date(end);d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10))}
  const byDay=Object.fromEntries(days.map(d=>[d,0]));
  lines.forEach(l=>{const k=dayKey(l.date);if(k in byDay)byDay[k]+=amt(l)});
  const vals=days.map(d=>byDay[d]),total=vals.reduce((x,y)=>x+y,0),maxV=Math.max(...vals,1);
  const peakI=vals.indexOf(Math.max(...vals));
  const dayName=d=>new Date(d+"T12:00:00").toLocaleDateString("ar-SA-u-nu-latn",{weekday:"short"});
  const barW=32,gap=24,chartH=130;
  const bars=vals.map((v,i)=>{const h=Math.max(v?4:1,Math.round(v/maxV*chartH)),x=20+i*(barW+gap),y=chartH-h+15;
    return '<g><rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+h+'" rx="4" fill="var(--sk-brand)"></rect>'+
      '<text x="'+(x+barW/2)+'" y="'+(y-6)+'" text-anchor="middle" font-size="9" fill="var(--ink)" font-weight="bold">'+(v>=1000?(v/1000).toFixed(1)+'k':Math.round(v))+'</text>'+
      '<text x="'+(x+barW/2)+'" y="'+(chartH+30)+'" text-anchor="middle" font-size="10" fill="var(--ink-2)">'+esc(dayName(days[i]))+'</text></g>'}).join("");
  /* product mix: top descriptions over the 30 days ending at the latest sale */
  const from=new Date(end);from.setDate(from.getDate()-29);const fromK=from.toISOString().slice(0,10);
  const mix=new Map();let mixTotal=0;
  lines.forEach(l=>{const k=dayKey(l.date);if(k<fromK||k>last)return;const n=String(l.descriptionOriginal||l.description||"غير مسمى").trim().slice(0,40);const v=amt(l);mixTotal+=v;mix.set(n,(mix.get(n)||0)+v)});
  const top=[...mix.entries()].sort((x,y)=>y[1]-x[1]).slice(0,4);
  const colors=["var(--sk-brand)","var(--sk-brand-2)","var(--sk-ok-mark)","var(--sk-info-mark)"];
  let off=0;const C=2*Math.PI*35;
  const arcs=top.map(([,v],i)=>{const len=mixTotal?v/mixTotal*C:0;const el='<circle cx="50" cy="50" r="35" fill="transparent" stroke="'+colors[i]+'" stroke-width="16" stroke-dasharray="'+len.toFixed(1)+' '+C.toFixed(1)+'" stroke-dashoffset="'+(-off).toFixed(1)+'"/>';off+=len;return el}).join("");
  const topShare=mixTotal?top.reduce((x,[,v])=>x+v,0)/mixTotal*100:0;
  const target=Number(localStorage.getItem("aghnam-v18-monthly-target")||0);
  const month=last.slice(0,7),monthSales=lines.filter(l=>dayKey(l.date).startsWith(month)).reduce((x,l)=>x+amt(l),0);
  return [
    '<div class="sk-stack">',
      '<div class="sk-kpis">',
        '<div class="sk-kpi"><span>مبيعات آخر 7 أيام مسجلة</span><b>'+money(total)+'</b><small>حتى '+esc(last)+'</small></div>',
        '<div class="sk-kpi good"><span>يوم الذروة ('+esc(dayName(days[peakI]))+')</span><b>'+money(vals[peakI])+'</b></div>',
        '<div class="sk-kpi accent"><span>متوسط اليوم</span><b>'+money(total/7)+'</b></div>',
        (target>0?'<div class="sk-kpi"><span>تحقيق الهدف الشهري ('+esc(month)+')</span><b>'+(monthSales/target*100).toFixed(1)+'٪</b></div>':'<div class="sk-kpi"><span>مبيعات شهر '+esc(month)+'</span><b>'+money(monthSales)+'</b><small>لم يُحدَّد هدف شهري</small></div>'),
      '</div>',
      '<div class="sk-chart-grid">',
        '<div class="sk-chart-card"><div style="display:flex;justify-content:space-between;align-items:center;"><h4>حركة المبيعات اليومية (ر.س)</h4><small style="color:var(--ink-3);">آخر 7 أيام في بياناتك</small></div>',
          '<svg viewBox="0 0 420 180" class="sk-chart-svg" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="145" x2="410" y2="145" stroke="var(--line)" stroke-width="1"/>',bars,'</svg></div>',
        '<div class="sk-chart-card"><div style="display:flex;justify-content:space-between;align-items:center;"><h4>أعلى الأصناف مبيعاً</h4><small style="color:var(--ink-3);">آخر 30 يوماً</small></div>',
          '<div class="sk-donut-wrap"><svg viewBox="0 0 100 100" style="width:120px;height:120px;">',arcs,'<text x="50" y="54" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--ink)">'+topShare.toFixed(0)+'%</text></svg>',
            '<div class="sk-donut-legend">',top.map(([n,v],i)=>'<div class="sk-donut-legend-item"><span><i style="background:'+colors[i]+';"></i> '+esc(n)+'</span><b>'+(mixTotal?(v/mixTotal*100).toFixed(0):0)+'٪</b></div>').join(""),'</div>',
          '</div></div>',
      '</div>',
    '</div>'
  ].join("");
}
function bindTrends(){}

function renderNav(){
  return [
    '<nav class="sk-rep-nav">',
      (window.SKosifReportPack?'<button type="button" class="'+(repTab==='pack'?'active':'')+'" data-t="pack">الحزمة التنفيذية</button>':''),
      '<button type="button" class="'+(repTab==='pl'?'active':'')+'" data-t="pl">قائمة الدخل وصافي الربح</button>',
      '<button type="button" class="'+(repTab==='yield'?'active':'')+'" data-t="yield">تدقيق الهدر والتسرب المالي</button>',
      '<button type="button" class="'+(repTab==='vat'?'active':'')+'" data-t="vat">مسودة الإقرار الضريبي ZATCA</button>',
      '<button type="button" class="'+(repTab==='churn'?'active':'')+'" data-t="churn">رادار العملاء المنقطعين</button>',
      '<button type="button" class="'+(repTab==='trends'?'active':'')+'" data-t="trends">التحليلات البصرية والرسوم</button>',
      '<button type="button" class="'+(repTab==='eod'?'active':'')+'" data-t="eod">ملخص نهاية اليوم التنفيذي</button>',
    '</nav>'
  ].join("");
}

function renderContent(){
  if(repTab==="pack"){if(window.SKosifReportPack)return SKosifReportPack.html();repTab="pl"}
  if(repTab==="pl") return plHTML();
  if(repTab==="yield") return yieldHTML();
  if(repTab==="vat") return vatHTML();
  if(repTab==="churn") return churnHTML();
  if(repTab==="trends") return trendsHTML();
  if(repTab==="eod") return eodHTML();
  return plHTML();
}

function paintReports(){
  const r=roots.reports; if(!r||!r.isConnected)return;
  r.innerHTML=[
    '<section class="card">',
      '<div class="card-b sk-reports-wrap">',
        renderNav(),
        '<div id="sk-rep-body">'+renderContent()+'</div>',
      '</div>',
    '</section>'
  ].join("");
  bindAll();
}

function bindAll(){
  $$(".sk-rep-nav button").forEach(b=>{
    b.onclick=()=>{
      repTab=b.dataset.t;
      if(repTab==="churn"){CH.res=null;CH.failed=false}
      paintReports();
    };
  });
  if(repTab==="pack"&&window.SKosifReportPack) SKosifReportPack.bind($("#sk-rep-body"));
  if(repTab==="pl") bindPL();
  if(repTab==="yield") bindYield();
  if(repTab==="vat") bindVAT();
  if(repTab==="churn") bindChurn();
  if(repTab==="trends") bindTrends();
  if(repTab==="eod") bindEOD();
}

window.SK.view("execreports",{
  title:"التقارير التنفيذية والمالية",
  sub:"قائمة الدخل التشغيلية، تدقيق الهدر، الإقرار الضريبي ZATCA، ورادار العملاء",
  emoji:"",
  render(node){
    roots.reports=node;
    CH.res=null;CH.failed=false;
    paintReports();
  }
});

window.SKosifReports=Object.freeze({
  getPL:()=>load(PL_KEY,defaultPL),
  getYieldData:yieldData,
  scopedLegacyRows:rows=>companyOwnedRows(rows,reportCompanyId())
});

})();

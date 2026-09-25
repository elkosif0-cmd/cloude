/* S.kosif — منظومة التقارير التنفيذية والمالية والتشغيلية
   1. قائمة الدخل وصافي الربح التشغيلي (Operational P&L & EBITDA)
   2. تقرير تدقيق الهدر والتسرب المالي للذبائح (Yield Leakage Audit)
   3. ملخص الإقرار الضريبي الفصلي لهيئة الزكاة (ZATCA VAT Declaration)
   4. رادار العملاء المنقطعين وسلة المبيعات (Customer Retention & Basket Size)
   5. تقرير نهاية اليوم التنفيذي بنقرة واحدة (EOD Executive Digest & Print)
*/
(()=>{
"use strict";

const {$,$$,esc,num,load,save,money,pct,toast,csv}=window.SK;
const roots={};
let repTab="pl"; // pl | yield | vat | churn | eod

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
const REAL={loaded:false,loading:false,customers:[],lines:[]};
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store,"readonly").objectStore(store).getAll();g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
function loadReal(){if(REAL.loaded||REAL.loading)return;REAL.loading=true;Promise.all([idbAll("customers"),idbAll("sales_lines")]).then(([c,l])=>{REAL.customers=c;REAL.lines=l;REAL.loaded=true;REAL.loading=false;if(roots.reports&&roots.reports.isConnected)paintReports()})}
const lineAmt=l=>Number(l.amountHalalas)?Number(l.amountHalalas)/100:(Number(l.amount)||0);
const daysSince=d=>{const t=Date.parse(d);return Number.isFinite(t)?Math.floor((Date.now()-t)/86400000):null};
function churnList(){
  return REAL.customers.filter(c=>c.lastPurchase).map(c=>{const days=daysSince(c.lastPurchase);return {name:c.name||c.phone||"عميل",phone:c.phone||"",lastOrderDays:days,totalSpent:Number(c.summarySales)||0,orders:Number(c.summaryOrders)||0,status:days>30?"danger":days>14?"warn":"active"}})
    .filter(c=>c.lastOrderDays!=null).sort((a,b)=>(b.status==="danger")-(a.status==="danger")||b.totalSpent-a.totalSpent).slice(0,40);
}

/* ==========================================================================
   Tab 1: Operational P&L HTML & Logic
   ========================================================================== */
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
        '<span><i style="background:#b91c1c;"></i> المشتريات (COGS): '+cogsPct.toFixed(1)+'%</span>',
        '<span><i style="background:#d97706;"></i> تكلفة الهدر والعظم: '+wastePct.toFixed(1)+'%</span>',
        '<span><i style="background:#4f46e5;"></i> المصاريف التشغيلية: '+opexPct.toFixed(1)+'%</span>',
        '<span><i style="background:#059669;"></i> صافي الربح التشغيلي: '+netMargin.toFixed(1)+'%</span>',
      '</div>',

      '<div class="sk-kpis">',
        '<div class="sk-kpi"><span>إجمالي الإيرادات</span><b>'+money(pl.revenue)+'</b></div>',
        '<div class="sk-kpi"><span>مجمل الربح (Gross Profit)</span><b>'+money(grossProfit)+'</b></div>',
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
        '<button type="button" id="sk-pl-wa" class="btn" style="background:#25D366;color:#fff;">💬 إرسال ملخص الأرباح والخسائر عبر واتساب</button>',
        '<button type="button" id="sk-pl-export" class="btn">📊 تصدير قائمة الدخل (CSV)</button>',
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
    let msg="*📊 تقرير قائمة الدخل والأرباح التشغيلية — أغنام الوادي*\\n";
    msg+="المبيعات: "+money(pl.revenue)+"\\n";
    msg+="تكلفة المشتريات (COGS): "+money(pl.cogs)+"\\n";
    msg+="تكلفة الهدر والعظم: "+money(pl.wasteLoss)+"\\n";
    msg+="إجمالي المصاريف التشغيلية: "+money(totalOpex)+"\\n";
    msg+="--------------------------------\\n";
    msg+="*مجمل الربح:* "+money(grossProfit)+" ("+((grossProfit/pl.revenue)*100).toFixed(1)+"%)\\n";
    msg+="*صافي الربح التشغيلي:* "+money(netProfit)+" ("+((netProfit/pl.revenue)*100).toFixed(1)+"%)\\n";
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
      ["تكلفة المشتريات (COGS)",pl.cogs.toFixed(2),((pl.cogs/pl.revenue)*100).toFixed(1)+"%"],
      ["تكلفة الهدر والعظم",pl.wasteLoss.toFixed(2),((pl.wasteLoss/pl.revenue)*100).toFixed(1)+"%"],
      ["مجمل الربح",grossProfit.toFixed(2),((grossProfit/pl.revenue)*100).toFixed(1)+"%"],
      ["رواتب وعمالة",pl.salaries.toFixed(2),((pl.salaries/pl.revenue)*100).toFixed(1)+"%"],
      ["إيجار ومستودع",pl.rent.toFixed(2),((pl.rent/pl.revenue)*100).toFixed(1)+"%"],
      ["كهرباء وتبريد",pl.utilities.toFixed(2),((pl.utilities/pl.revenue)*100).toFixed(1)+"%"],
      ["نقل ولوجستيات",pl.logistics.toFixed(2),((pl.logistics/pl.revenue)*100).toFixed(1)+"%"],
      ["تغليف وفاكيوم",pl.packaging.toFixed(2),((pl.packaging/pl.revenue)*100).toFixed(1)+"%"],
      ["إجمالي المصاريف التشغيلية",totalOpex.toFixed(2),((totalOpex/pl.revenue)*100).toFixed(1)+"%"],
      ["صافي الربح التشغيلي",netProfit.toFixed(2),((netProfit/pl.revenue)*100).toFixed(1)+"%"]
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
    const score=diffPct<=1?"⭐⭐⭐⭐⭐":(diffPct<=3?"⭐⭐⭐":"⚠️ بحاجة تدريب");
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
        '<button type="button" id="sk-yield-wa" class="btn" style="background:#25D366;color:#fff;">💬 إرسال تقرير فاقد الهدر لفريق التقطيع</button>',
        '<button type="button" id="sk-yield-export" class="btn">📊 تصدير تدقيق الهدر (CSV)</button>',
      '</div>',
    '</div>'
  ].join("");
}

function bindYield(){
  $("#sk-yield-wa")?.addEventListener("click",()=>{
    let totalLossSAR=0;
    let msg="*🥩 تقرير تدقيق الهدر والتسرب المالي — صالة التقطيع*\\n";
    msg+="التاريخ: "+new Date().toLocaleDateString("ar-SA")+"\\n";
    msg+="--------------------------------\\n";
    yieldData().forEach(r=>{
      const diffPct=Math.max(0,r.actWaste-r.stdWaste);
      const lossKg=(r.dressedKg*(diffPct/100));
      const lossSAR=lossKg*r.costKg;
      totalLossSAR+=lossSAR;
      msg+="• "+r.name+": هدر فعلي "+r.actWaste+"% (المخطط "+r.stdWaste+"%) | فاقد: "+lossKg.toFixed(1)+" كجم ("+money(lossSAR)+")\\n";
    });
    msg+="--------------------------------\\n";
    msg+="*إجمالي التسرب المالي للهدر:* "+money(totalLossSAR)+"\\nيرجى مراجعة مهارات التشفية وفصل العظم بدقة لتفادي هذه الفروقات.";
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

  return [
    '<div class="sk-stack">',
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
        '<button type="button" id="sk-vat-wa" class="btn" style="background:#25D366;color:#fff;">💬 إرسال مسودة الإقرار للمحاسب القانوني</button>',
        '<button type="button" id="sk-vat-export" class="btn">📊 تصدير جدول الإقرار (CSV)</button>',
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
    let msg="*🧾 مسودة الإقرار الضريبي — أغنام الوادي (ZATCA)*\\n";
    msg+="الفترة الضريبية: الربع الحالي 2026\\n";
    msg+="--------------------------------\\n";
    msg+="المبيعات الخاضعة للضريبة: "+money(taxableSales)+"\\n";
    msg+="ضريبة المبيعات (المخرجات 15%): "+money(outputVAT)+"\\n";
    msg+="المشتريات الخاضعة للضريبة: "+money(taxablePurchases)+"\\n";
    msg+="ضريبة المشتريات (المدخلات 15%): "+money(inputVAT)+"\\n";
    msg+="--------------------------------\\n";
    msg+="*صافي الضريبة الواجبة السداد للهيئة:* "+money(netVAT)+"\\nيرجى مراجعة الفواتير واعتماد التقديم في بوابة زكاة وفاتورة.";
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
function churnHTML(){
  if(!REAL.loaded){loadReal();return '<div class="sk-empty">جارٍ قراءة بيانات العملاء…</div>'}
  const list=churnList();
  if(!list.length)return '<div class="sk-empty">لا توجد بيانات عملاء بمشتريات مؤرخة بعد. استورد بيانات السوق والمبيعات من «السوق والعملاء».</div>';
  const danger=list.filter(x=>x.status==="danger"),warn=list.filter(x=>x.status==="warn");
  const orders=REAL.customers.reduce((a,c)=>a+(Number(c.summaryOrders)||0),0),sales=REAL.customers.reduce((a,c)=>a+(Number(c.summarySales)||0),0);
  return [
    '<div class="sk-stack">',
      '<div class="sk-kpis">',
        '<div class="sk-kpi bad"><span>منقطعون (أكثر من 30 يوماً)</span><b>'+danger.length+'</b></div>',
        '<div class="sk-kpi warn"><span>معرّضون للانقطاع (15-30 يوماً)</span><b>'+warn.length+'</b></div>',
        '<div class="sk-kpi"><span>متوسط قيمة الطلب</span><b>'+(orders?money(sales/orders):'—')+'</b></div>',
        '<div class="sk-kpi"><span>عملاء بمشتريات مسجلة</span><b>'+REAL.customers.length+'</b></div>',
      '</div>',
      '<div class="sk-section-title" style="margin:14px 0 8px;"><b>العملاء الأعلى قيمة المتوقفون عن الشراء</b></div>',
      '<div>',
        list.filter(c=>c.status!=="active").map((c,idx)=>'<div class="sk-churn-card"><div><b style="font-size:1.02rem;">'+esc(c.name)+'</b>'+
          '<div style="font-size:0.8rem;color:var(--ink-2,#666);margin-top:2px;">إجمالي المشتريات: <b>'+money(c.totalSpent)+'</b> | الطلبات: <b>'+c.orders+'</b></div></div>'+
          '<div style="display:flex;gap:10px;align-items:center;"><span class="sk-churn-status '+c.status+'">'+(c.status==="danger"?"منقطع منذ ":"متوقف منذ ")+c.lastOrderDays+' يوم</span>'+
          (c.phone?'<button type="button" class="btn sk-churn-reactivate" data-p="'+esc(c.phone)+'" data-n="'+esc(c.name)+'" style="background:#25D366;color:#fff;font-size:0.8rem;padding:5px 10px;">💬 رسالة تنشيط</button>':'')+
          '</div></div>').join("")||'<div class="sk-empty">لا يوجد عملاء متوقفون حالياً.</div>',
      '</div>',
    '</div>'
  ].join("");
}

function bindChurn(){
  $$(".sk-churn-reactivate").forEach(b=>{
    b.onclick=()=>{
      const biz=(document.getElementById("biz-name")||{}).textContent||"S.kosif";
      const msg="مرحباً "+b.dataset.n+"،\nاشتقنا لتعاملكم مع *"+biz.trim()+"*. يسعدنا خدمتكم في طلبكم القادم — تواصلوا معنا بالرد على هذه الرسالة.";
      const phone=String(b.dataset.p).replace(/\D/g,"").replace(/^0/,"966");
      window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(msg),"_blank","noopener");
    };
  });
}

function eodToday(){
  const today=new Date().toISOString().slice(0,10),lines=REAL.lines.filter(l=>String(l.date||"").slice(0,10)===today);
  const total=lines.reduce((a,l)=>a+lineAmt(l),0),cust=new Set(lines.map(l=>l.customerId).filter(Boolean)).size,orders=new Set(lines.map(l=>l.ref||l.externalOrderId).filter(Boolean)).size;
  let cold=[];try{cold=JSON.parse(localStorage.getItem("skosif_v38_coldchain"))||[]}catch{}
  const coldToday=cold.filter(c=>String(c.time||"").slice(0,10)===today),breaks=coldToday.filter(c=>Number(c.temp)>4).length;
  return {today,total,cust,orders,lines:lines.length,coldToday,breaks};
}
function eodHTML(){
  if(!REAL.loaded){loadReal();return '<div class="sk-empty">جارٍ قراءة مبيعات اليوم…</div>'}
  const d=eodToday(),biz=((document.getElementById("biz-name")||{}).textContent||"S.kosif").trim(),now=new Date();
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
        (d.lines?'':'<div class="sk-note">لا توجد مبيعات مسجلة بتاريخ اليوم. تُحتسب الأرقام من المبيعات المستوردة أو المسجلة يدوياً.</div>'),
      '</div>',
      '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">',
        '<button type="button" id="sk-eod-wa" class="btn" style="background:#25D366;color:#fff;">💬 إرسال الملخص عبر واتساب</button>',
        '<button type="button" id="sk-eod-print" class="btn btn-pri">🖨️ طباعة الملخص</button>',
      '</div>',
    '</div>'
  ].join("");
}

function bindEOD(){
  $("#sk-eod-wa")?.addEventListener("click",()=>{
    const d=eodToday(),biz=((document.getElementById("biz-name")||{}).textContent||"S.kosif").trim();
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
function renderNav(){
  return [
    '<nav class="sk-rep-nav">',
      '<button type="button" class="'+(repTab==='pl'?'active':'')+'" data-t="pl">📊 قائمة الدخل وصافي الربح</button>',
      '<button type="button" class="'+(repTab==='yield'?'active':'')+'" data-t="yield">🥩 تدقيق الهدر والتسرب المالي</button>',
      '<button type="button" class="'+(repTab==='vat'?'active':'')+'" data-t="vat">🧾 مسودة الإقرار الضريبي ZATCA</button>',
      '<button type="button" class="'+(repTab==='churn'?'active':'')+'" data-t="churn">👥 رادار العملاء المنقطعين</button>',
      '<button type="button" class="'+(repTab==='eod'?'active':'')+'" data-t="eod">📲 ملخص نهاية اليوم التنفيذي</button>',
    '</nav>'
  ].join("");
}

function renderContent(){
  if(repTab==="pl") return plHTML();
  if(repTab==="yield") return yieldHTML();
  if(repTab==="vat") return vatHTML();
  if(repTab==="churn") return churnHTML();
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
      paintReports();
    };
  });
  if(repTab==="pl") bindPL();
  if(repTab==="yield") bindYield();
  if(repTab==="vat") bindVAT();
  if(repTab==="churn") bindChurn();
  if(repTab==="eod") bindEOD();
}

window.SK.view("execreports",{
  title:"التقارير التنفيذية والمالية",
  sub:"قائمة الدخل التشغيلية، تدقيق الهدر، الإقرار الضريبي ZATCA، ورادار العملاء",
  emoji:"📊",
  render(node){
    roots.reports=node;
    paintReports();
  }
});

window.SKosifReports=Object.freeze({
  getPL:()=>load(PL_KEY,defaultPL),
  getYieldData:yieldData
});

})();

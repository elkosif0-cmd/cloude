/* S.kosif core — قوالب الاستيراد (SK.templates).
   لكل قسم يستقبل بيانات قالب Excel جاهز: ورقة «البيانات» بالأعمدة المطلوبة وصفَّي مثال، وورقة «التعليمات»
   تشرح كل عمود (إلزامي أو اختياري، الصيغة، القيم المسموحة). املأ القالب ثم ارفعه من نفس الزر.
   • الأقسام التي لها استيراد في التطبيق نفسه (المبيعات، ميزان المراجعة) يطابق القالب أعمدتها بالضبط ويفتح شاشتها.
   • بقية الأقسام تستورد من القالب مباشرة: تُقرأ الأعمدة بأسمائها (بأي ترتيب)، ويُفحص كل صف قبل الحفظ،
     وتُعرض النتيجة (مقبول/مرفوض وسبب الرفض) قبل التأكيد، وتُضاف السجلات دون حذف الموجود.
   الزر «قوالب الاستيراد» يظهر في رأس كل شاشة لها قالب، والقائمة كاملة في «مركز التصدير» وفي لوحة الأوامر. */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const today=()=>new Date().toISOString().slice(0,10);
const uid=p=>p+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const K=s=>String(s==null?"":s).replace(/[ً-ٰٟ]/g,"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[\s_\-.()%٪:*]/g,"").toLowerCase();
const num=v=>{const n=window.SKXlsx?SKXlsx.asNumber(v):Number(v);return n==null||!Number.isFinite(n)?null:n};
function date(v){
  if(v==null||v==="")return "";
  if(typeof v==="number"&&v>20000&&v<80000)return new Date(Date.UTC(1899,11,30)+v*864e5).toISOString().slice(0,10);
  const s=String(v).trim().replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
  let m=/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s);if(m)return m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0");
  m=/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(s);if(m)return m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");
  const n=num(s);if(n&&n>20000&&n<80000)return date(n);return null;
}
const yes=v=>/^(نعم|اي|أيوه|yes|y|true|1|✓|x|صح|مسدد|تم)$/i.test(String(v==null?"":v).trim());
const col=(key,h,o={})=>({key,h,...o});

/* ---------- the templates ---------- */
const T=[
{id:"sales",label:"العملاء والمبيعات",caps:["customers","commerce","salesintel","intelligence","economics"],format:"csv",
  note:"يُستورد من «العملاء › مركز البيانات › استيراد JSON / CSV». احفظ الملف بصيغة CSV (UTF-8). سطر لكل صنف في الفاتورة؛ الفاتورة الواحدة تتكرر بعدد أصنافها.",
  cols:[col("phone","الجوال",{ex:"0500000001",hint:"رقم سعودي يبدأ بـ05"}),col("name","الاسم",{ex:"عبدالله الحربي"}),col("city","المدينة",{ex:"الرياض"}),col("district","الحي",{ex:"الملقا"}),col("address","العنوان",{ex:""}),
    col("date","التاريخ",{req:1,ex:"2026-09-01",hint:"YYYY-MM-DD"}),col("ref","رقم الفاتورة",{ex:"INV-1001"}),col("product","الصنف",{req:1,ex:"نعيمي طازج"}),col("qty","الكمية",{ex:"3"}),col("amount","المبلغ",{req:1,ex:"207",hint:"قيمة السطر شاملة الضريبة"}),col("source","المصدر",{ex:"المتجر"})],
  second:["0500000002","سارة الغامدي","جدة","الروضة","","2026-09-02","INV-1002","بوكس الشواء","1","239","التطبيق"],
  route:()=>{SKosifCore.go("customers");setTimeout(()=>SKosifCore.act&&SKosifCore.act("market-import"),250)}},
{id:"tb",label:"ميزان المراجعة",caps:["tbreview"],format:"xlsx",
  note:"سطر لكل حساب. يكفي عمودا المدين والدائن (أو عمود الرصيد). عمود «الرصيد السابق» اختياري ويضيف المقارنة بالسنة السابقة.",
  cols:[col("code","رقم الحساب",{req:1,ex:"1101"}),col("name","اسم الحساب",{req:1,ex:"النقدية بالصندوق"}),col("debit","مدين",{ex:"150000"}),col("credit","دائن",{ex:"0"}),col("prior","الرصيد السابق",{ex:"120000",hint:"اختياري"})],
  second:["4101","المبيعات","0","500000","-420000"],
  importFile:async(file,t)=>{const text=/\.xlsx$/i.test(file.name)?await SKXlsx.toTsv(file):await file.text();if(!window.SKosifTBReview||!SKosifTBReview.load)return toast("افتح «مركز المراجعة» أولاً","warn");
    if(await SKosifTBReview.load(text,file.name))SKosifTBReview.open("tb")}},
{id:"journal",label:"دفتر القيود اليومية",caps:["ledger","tbreview"],format:"xlsx",
  note:"سطر لكل طرف من القيد؛ أسطر القيد الواحد تحمل نفس «رقم القيد» ويجب أن يتساوى مدينها ودائنها. الحساب غير الموجود في الدليل يُنشأ بنوعه من أول رقم في رمزه (1 أصول، 2 التزامات، 3 حقوق ملكية، 4 إيرادات، 5-9 مصروفات).",
  cols:[col("ref","رقم القيد",{req:1,ex:"JE-101"}),col("date","التاريخ",{req:1,ex:"2026-09-01",type:"date"}),col("account","رقم الحساب",{req:1,ex:"1100"}),col("accountName","اسم الحساب",{ex:"النقدية والبنوك"}),
    col("debit","مدين",{ex:"5000",type:"num"}),col("credit","دائن",{ex:"0",type:"num"}),col("memo","البيان",{ex:"إيداع مبيعات اليوم"})],
  second:["JE-101","2026-09-01","4000","إيرادات المبيعات","0","5000","إيداع مبيعات اليوم"],
  importRows:rows=>{
    const F=SKEngines.finance,d=Object.assign({accounts:[],entries:[]},load("skosif_ledger_v1",{})),TYPE={1:"asset",2:"liability",3:"equity",4:"revenue"};
    const acc=(code,name)=>{let a=d.accounts.find(x=>String(x.code)===String(code));if(!a){a={...F.accounts.createAccount({code:String(code),name:name||("حساب "+code),type:TYPE[String(code)[0]]||"expense"}),imported:true};d.accounts.push(a)}return a};
    const groups=new Map();rows.forEach(r=>{const g=groups.get(r.ref)||[];g.push(r);groups.set(r.ref,g)});
    const bad=[];let n=0;
    groups.forEach((g,ref)=>{const e={id:uid("je"),date:g[0].date,reference:String(ref),memo:g[0].memo||"قيد مستورد",source:"استيراد",imported:true,lines:g.map(r=>({accountId:acc(r.account,r.accountName).id,debit:Math.round((r.debit||0)*100)/100,credit:Math.round((r.credit||0)*100)/100}))};
      const v=F.ledger.validateJournalEntry(e);if(!v.valid){bad.push("القيد "+ref+": غير متزن أو ناقص");return}d.entries.push(e);n++});
    save("skosif_ledger_v1",d);return {added:n,rejected:bad}}},
{id:"accounts",label:"دليل الحسابات",caps:["ledger"],format:"xlsx",
  note:"سطر لكل حساب. النوع: أصول، التزامات، حقوق ملكية، إيرادات، مصروفات. الرمز المكرر يُتجاهل.",
  cols:[col("code","رمز الحساب",{req:1,ex:"1100"}),col("name","اسم الحساب",{req:1,ex:"النقدية والبنوك"}),col("type","النوع",{req:1,ex:"أصول",choices:["أصول","التزامات","حقوق ملكية","إيرادات","مصروفات"]})],
  second:["6200","الإيجار","مصروفات"],
  importRows:rows=>{const MAP={"أصول":"asset","التزامات":"liability","حقوق ملكية":"equity","إيرادات":"revenue","مصروفات":"expense"},d=Object.assign({accounts:[],entries:[]},load("skosif_ledger_v1",{}));let n=0;const bad=[];
    rows.forEach(r=>{if(d.accounts.some(a=>String(a.code)===String(r.code))){bad.push("الرمز "+r.code+" موجود");return}const type=MAP[String(r.type).trim()];if(!type){bad.push("نوع غير معروف: "+r.type);return}
      d.accounts.push({...SKEngines.finance.accounts.createAccount({code:String(r.code),name:r.name,type}),imported:true});n++});save("skosif_ledger_v1",d);return{added:n,rejected:bad}}},
{id:"catalog",label:"الأصناف والأسعار",caps:["catalog","sim","costs"],format:"xlsx",
  note:"سطر لكل صنف خام. ضريبة الشراء: شامل، غير شامل، بدون. النوع: رئيسي أو ثانوي (منتج ثانوي مثل العظم والدهن). تُضاف الأصناف ثم يعيد التطبيق التحميل ليحسب التكلفة والهامش.",
  cols:[col("name","اسم الصنف",{req:1,ex:"نعيمي طازج"}),col("cat","الفئة",{ex:"أغنام"}),col("buy","سعر الشراء للكجم",{req:1,ex:"52",type:"num"}),col("vat","ضريبة الشراء",{ex:"شامل",choices:["شامل","غير شامل","بدون"]}),
    col("waste","نسبة الهدر",{ex:"8",type:"num",hint:"رقم مئوي"}),col("price","سعر البيع شامل الضريبة",{req:1,ex:"69",type:"num"}),col("kind","النوع",{ex:"رئيسي",choices:["رئيسي","ثانوي"]})],
  second:["لية نعيمي","دهون","18","شامل","0","26","ثانوي"],
  importRows:rows=>{const st=load("aghnam-pricing-v3",null);if(!st||!Array.isArray(st.raws))return{added:0,rejected:["افتح «الأصناف والأسعار» مرة ثم أعد المحاولة"]};
    st.seq=st.seq||{};let seq=Math.max(Number(st.seq.raw)||0,...st.raws.map(r=>Number(String(r.id).replace(/\D/g,""))||0)),code=Math.max(0,...st.raws.map(r=>Number(r.code)||0));const bad=[];let n=0;
    rows.forEach(r=>{if(st.raws.some(x=>K(x.name)===K(r.name))){bad.push("«"+r.name+"» موجود");return}
      st.raws.push({id:"r"+(++seq),code:++code,name:r.name,cat:r.cat||"عام",buy:r.buy,vat:{"غير شامل":"excl","بدون":"none"}[String(r.vat||"").trim()]||"incl",waste:r.waste||0,price:r.price,kind:String(r.kind).trim()==="ثانوي"?"by":"main",imported:true});n++});
    st.seq.raw=seq;save("aghnam-pricing-v3",st);return{added:n,rejected:bad,reload:n>0}}},
{id:"suppliers",label:"شحنات الموردين",caps:["suppliers","cash"],format:"xlsx",
  note:"سطر لكل شحنة. السعر للكيلو، و«شامل الضريبة» نعم أو لا. الهدر المتفق والفعلي نسب مئوية.",
  cols:[col("date","التاريخ",{req:1,ex:"2026-09-04",type:"date"}),col("supplier","المورد",{req:1,ex:"مؤسسة المراعي"}),col("itemName","الصنف",{req:1,ex:"نعيمي طازج"}),col("qty","الكمية (كجم)",{req:1,ex:"240",type:"num"}),
    col("priceGross","سعر الشراء للكجم",{req:1,ex:"52",type:"num"}),col("vatIncl","شامل الضريبة",{ex:"نعم",type:"bool"}),col("agreedWaste","الهدر المتفق",{ex:"8",type:"num"}),col("actualWaste","الهدر الفعلي",{ex:"9.5",type:"num"})],
  second:["2026-09-11","شركة الحري للمواشي","حري طازج","180","64","لا","6","7"],
  importRows:rows=>append("skosif_v31_supplier_batches",rows.map(r=>({id:uid("b"),...r})))},
{id:"prices",label:"قوائم أسعار الموردين",caps:["purchasing"],format:"xlsx",note:"سطر لكل سعر متفق عليه وفترة سريانه.",
  cols:[col("supplier","المورد",{req:1,ex:"مؤسسة المراعي"}),col("item","الصنف",{req:1,ex:"نعيمي طازج"}),col("price","السعر",{req:1,ex:"45.2",type:"num"}),col("unit","الوحدة",{ex:"كجم"}),col("from","من تاريخ",{ex:"2026-01-01",type:"date"}),col("to","إلى تاريخ",{ex:"",type:"date"})],
  second:["شركة الحري للمواشي","حري طازج","64","كجم","2026-01-01",""],
  importRows:rows=>{const d=Object.assign({orders:[],receipts:[],prices:[]},load("skosif_purchasing_v1",{}));rows.forEach(r=>d.prices.push({id:uid("pr"),...r,unit:r.unit||"كجم",from:r.from||today(),to:r.to||"",imported:true}));save("skosif_purchasing_v1",d);return{added:rows.length,rejected:[]}}},
{id:"inventory",label:"المخزون ونقطة إعادة الطلب",caps:["inventory"],format:"xlsx",note:"سطر لكل صنف: الرصيد الحالي ومتوسط البيع اليومي بالكيلو؛ يحسب التطبيق أيام التغطية ونقطة إعادة الطلب والكمية المقترحة.",
  cols:[col("item","الصنف",{req:1,ex:"نعيمي طازج"}),col("stock","المخزون الحالي",{req:1,ex:"120",type:"num"}),col("daily","متوسط البيع اليومي",{req:1,ex:"34",type:"num"}),col("lead","مدة التوريد (أيام)",{ex:"2",type:"num"}),col("safety","أيام الأمان",{ex:"2",type:"num"}),col("cycle","دورة الطلب (أيام)",{ex:"7",type:"num"})],
  second:["عجل طازج","210","28","3","2","7"],
  importRows:rows=>{const list=load("aghnam_v29_inventory",[]),bad=[];let n=0;rows.forEach(r=>{if(!(r.daily>0)){bad.push("«"+r.item+"»: البيع اليومي يجب أن يكون أكبر من صفر");return}
    const lead=r.lead??2,safety=r.safety??2,cycle=r.cycle??7,cover=r.stock/r.daily,rp=r.daily*(lead+safety),tg=r.daily*(lead+safety+cycle);
    const x={item:r.item,stock:r.stock,daily:r.daily,lead,safety,cycle,cover:Math.round(cover*100)/100,reorderPoint:rp,targetStock:tg,suggested:Math.max(0,tg-r.stock),status:r.stock<=rp?"إعادة طلب عاجلة":cover<=lead+safety+Math.max(1,cycle*.35)?"إعادة طلب قريبة":"المخزون آمن حالياً",ts:new Date().toISOString(),imported:true};
    const i=list.findIndex(y=>String(y.item).trim()===x.item);if(i>=0)list[i]=x;else list.unshift(x);n++});save("aghnam_v29_inventory",list.slice(0,200));return{added:n,rejected:bad}}},
{id:"expiry",label:"دفعات الصلاحية",caps:["inventory"],format:"xlsx",note:"سطر لكل دفعة في التخزين بتاريخ تجهيزها وانتهائها.",
  cols:[col("item","الصنف",{req:1,ex:"مفروم بقري"}),col("storage","مكان التخزين",{ex:"ثلاجة 2"}),col("stockKg","الكمية (كجم)",{req:1,ex:"18",type:"num"}),col("datePrep","تاريخ التجهيز",{ex:"2026-09-24",type:"date"}),col("dateExp","تاريخ الانتهاء",{req:1,ex:"2026-09-27",type:"date"})],
  second:["برجر بقري","فريزر","60","2026-09-01","2026-11-01"],importRows:rows=>append("skosif_inv_expiry_batches",rows.map(r=>({id:uid("ex"),...r})),true)},
{id:"credit",label:"عملاء الآجل (المطاعم)",caps:["b2bcredit"],format:"xlsx",note:"سطر لكل عميل آجل بحد ائتمانه ومدة سداده ورصيده الافتتاحي.",
  cols:[col("name","اسم العميل",{req:1,ex:"مطعم الديرة للمشويات"}),col("phone","الجوال",{ex:"0500000060"}),col("limit","حد الائتمان",{req:1,ex:"40000",type:"num"}),col("terms","مدة السداد (يوم)",{ex:"30"}),col("balance","الرصيد الافتتاحي",{ex:"12500",type:"num"})],
  second:["مطعم نجد الأصيل","0500000062","60000","30","0"],
  importRows:rows=>append("skosif_v38_ledger",rows.map(r=>({id:uid("CUST"),name:r.name,phone:r.phone||"",limit:r.limit,terms:String(r.terms||"30"),balance:r.balance||0,moves:r.balance?[{at:new Date().toISOString(),type:"sale",amount:r.balance}]:[]})))},
{id:"receivables",label:"أعمار الذمم",caps:["receivables"],format:"xlsx",note:"سطر لكل فاتورة آجلة: العميل وتاريخ الفاتورة ومبلغها والمسدد منها؛ يحسب التطبيق الأعمار والمتأخرات.",
  cols:[col("customer","العميل",{req:1,ex:"مطعم الديرة"}),col("date","تاريخ الفاتورة",{req:1,ex:"2026-08-01",type:"date"}),col("amount","المبلغ",{req:1,ex:"18000",type:"num"}),col("paid","المسدد",{ex:"5000",type:"num"})],
  second:["مطاعم سفرة الخير","2026-07-15","26000","0"],
  importRows:rows=>{const old=(localStorage.getItem("skosif_ar_paste")||"").trim();const head=old?"":"العميل,التاريخ,المبلغ,المسدد\n";
    localStorage.setItem("skosif_ar_paste",(old?old+"\n":head)+rows.map(r=>[String(r.customer).replace(/,/g," "),r.date,r.amount,r.paid||0].join(",")).join("\n"));return{added:rows.length,rejected:[]}}},
{id:"followup",label:"سجل متابعة العملاء",caps:["followup"],format:"xlsx",note:"سطر لكل تواصل أو طلب. «تم الاستلام» نعم أو لا.",
  cols:[col("date","التاريخ",{req:1,ex:"2026-09-26",type:"date"}),col("name","الاسم",{req:1,ex:"عبدالله الحربي"}),col("phone","الجوال",{ex:"0500000001"}),col("source","المصدر",{ex:"واتساب"}),col("city","المدينة",{ex:"الرياض"}),col("district","الحي",{ex:"الملقا"}),
    col("order","الطلب",{ex:"بوكس الشواء"}),col("payment","طريقة الدفع",{ex:"مدى"}),col("deliveryDate","تاريخ التوصيل",{ex:"2026-09-27",type:"date"}),col("received","تم الاستلام",{ex:"نعم",type:"bool"}),col("receiver","المستلم",{ex:"العميل"}),col("notes","ملاحظات",{ex:""})],
  second:["2026-09-26","سارة الغامدي","0500000002","التطبيق","جدة","الروضة","نعيمي طازج 3 كجم","تحويل بنكي","2026-09-26","لا","",""],
  importRows:rows=>{const d=Object.assign({records:[],queue:[]},load("skosif_followup_v1",{}));rows.forEach(r=>d.records.push({id:uid("fu"),...r,at:new Date().toISOString(),imported:true}));save("skosif_followup_v1",d);return{added:rows.length,rejected:[]}}},
{id:"calls",label:"قائمة أرقام للاتصال",caps:["followup"],format:"xlsx",note:"سطر لكل رقم مع سبب الاتصال؛ تظهر في «قائمة الاتصال».",
  cols:[col("phone","الجوال",{req:1,ex:"0500000010"}),col("note","ملاحظة",{ex:"عميل لم يطلب منذ 45 يوماً"})],second:["0500000011","متابعة عرض الأسبوع"],
  importRows:rows=>{const d=Object.assign({records:[],queue:[]},load("skosif_followup_v1",{}));rows.forEach(r=>d.queue.push({id:uid("q"),phone:r.phone,note:r.note||"",done:false,imported:true}));save("skosif_followup_v1",d);return{added:rows.length,rejected:[]}}},
{id:"cashflows",label:"المدفوعات والمقبوضات",caps:["cash"],format:"xlsx",note:"سطر لكل حركة نقدية. النوع: دفع أو قبض.",
  cols:[col("date","التاريخ",{req:1,ex:"2026-09-27",type:"date"}),col("type","النوع",{req:1,ex:"دفع",choices:["دفع","قبض"]}),col("category","الفئة",{ex:"الرواتب"}),col("account","الحساب",{ex:"6100"}),col("amount","المبلغ",{req:1,ex:"18000",type:"num"}),col("ref","المرجع",{ex:"PAYR-09"})],
  second:["2026-09-28","قبض","تحصيل عملاء الآجل","1200","12000","COL-09"],
  importRows:rows=>{const f=Object.assign({flows:[]},load("skosif_erp_finance_v1",{}));rows.forEach(r=>f.flows.unshift({id:uid("fl"),date:r.date,type:String(r.type).trim()==="قبض"?"receipt":"payment",category:r.category||"أخرى",account:r.account||"",amount:r.amount,ref:r.ref||"",imported:true}));save("skosif_erp_finance_v1",f);return{added:rows.length,rejected:[]}}},
{id:"payables",label:"فواتير الموردين المستحقة",caps:["cash","suppliers"],format:"xlsx",note:"سطر لكل فاتورة مورد مستحقة. «مسددة» نعم أو لا.",
  cols:[col("supplier","المورد",{req:1,ex:"مؤسسة المراعي"}),col("ref","رقم الفاتورة",{ex:"INV-S101"}),col("due","تاريخ الاستحقاق",{req:1,ex:"2026-10-05",type:"date"}),col("amount","المبلغ",{req:1,ex:"24000",type:"num"}),col("paid","مسددة",{ex:"لا",type:"bool"})],
  second:["مزرعة الخرج للأبقار","INV-S102","2026-10-12","31000","لا"],
  importRows:rows=>{const ap=Object.assign({rows:[]},load("skosif_erp_payables_v1",{}));rows.forEach(r=>ap.rows.unshift({id:uid("ap"),...r,paid:!!r.paid,imported:true}));save("skosif_erp_payables_v1",ap);return{added:rows.length,rejected:[]}}},
{id:"tasks",label:"المهام",caps:["tasks"],format:"xlsx",note:"الأولوية: عالية، عادية، منخفضة. عمود الشاشة اختياري (اسمها كما في القائمة).",
  cols:[col("title","المهمة",{req:1,ex:"مطابقة كشف البنك"}),col("due","تاريخ الاستحقاق",{ex:"2026-09-30",type:"date"}),col("priority","الأولوية",{ex:"عالية",choices:["عالية","عادية","منخفضة"]}),col("cap","الشاشة",{ex:"الدفاتر المحاسبية"})],
  second:["جرد غرفة التبريد","2026-10-01","عادية","المخزون"],
  importRows:rows=>{const P={"عالية":"high","منخفضة":"low"},capOf=l=>{const c=SK.caps.all().find(x=>K(x.label)===K(l)||x.id===l);return c?c.id:""};
    return append("skosif_tasks_v1",rows.map(r=>({id:uid("tk"),title:r.title,due:r.due||today(),priority:P[String(r.priority||"").trim()]||"normal",cap:capOf(r.cap),done:false,at:new Date().toISOString()})))}},
{id:"risks",label:"سجل المخاطر",caps:["risks"],format:"xlsx",note:"الاحتمالية والأثر من 1 (منخفض) إلى 3 (مرتفع).",
  cols:[col("title","الخطر",{req:1,ex:"ارتفاع أسعار المواشي"}),col("category","الفئة",{ex:"المالية"}),col("likelihood","الاحتمالية",{req:1,ex:"3",type:"num"}),col("impact","الأثر",{req:1,ex:"2",type:"num"}),col("owner","المسؤول",{ex:"المشتريات"}),col("due","تاريخ المراجعة",{ex:"2026-10-15",type:"date"}),col("response","الاستجابة",{ex:"عقود توريد مسبقة"})],
  second:["انقطاع التبريد","التشغيلية","2","3","المستودع","2026-10-01","مولد احتياطي"],
  importRows:rows=>{const d=Object.assign({risks:[],findings:[]},load("skosif_risks_v1",{})),y=new Date().getFullYear();let seq=d.risks.length;const bad=[];let n=0;
    rows.forEach(r=>{const l=Math.round(r.likelihood),i=Math.round(r.impact);if(!(l>=1&&l<=3&&i>=1&&i<=3)){bad.push("«"+r.title+"»: الاحتمالية والأثر من 1 إلى 3");return}
      d.risks.push({id:uid("r"),ref:"RSK-"+y+"-"+String(++seq).padStart(3,"0"),title:r.title,category:r.category||"التشغيلية",likelihood:l,impact:i,owner:r.owner||"",due:r.due||"",status:"open",response:r.response||"",imported:true});n++});
    save("skosif_risks_v1",d);return{added:n,rejected:bad}}}
];
function append(key,rows,flag){const list=load(key,[]);const arr=Array.isArray(list)?list:[];rows.forEach(r=>arr.push({...r,imported:true}));save(key,arr);return{added:rows.length,rejected:[]}}

/* ---------- download ---------- */
const typeHint=c=>c.hint||(c.type==="date"?"تاريخ YYYY-MM-DD":c.type==="num"?"رقم":c.type==="bool"?"نعم / لا":c.choices?"إحدى القيم: "+c.choices.join("، "):"نص");
function download(id,fmt){
  const t=T.find(x=>x.id===id);if(!t)return;const f=fmt||t.format,head=t.cols.map(c=>c.h),ex=[t.cols.map(c=>c.ex==null?"":c.ex),t.second||[]].filter(r=>r.length),name="KOSIF-template-"+t.id;
  if(f==="csv"){SK.csv.download(name+".csv",head,ex);return}
  const blob=SKXlsx.book([{name:"البيانات",headers:head,rows:ex,text:true,noFilter:true,wide:14},
    {name:"التعليمات",headers:["العمود","إلزامي","الصيغة أو القيم","مثال"],rows:[...t.cols.map(c=>[c.h,c.req?"نعم":"اختياري",typeHint(c),c.ex==null?"":String(c.ex)]),["","","",""],["ملاحظة",t.note,"",""],["","احذف صفي المثال قبل الاستيراد، ولا تغيّر أسماء الأعمدة (يمكن تغيير ترتيبها).","",""]],text:true,noFilter:true,wide:18}]);
  SK.download(name+".xlsx",blob);SK.audit&&SK.audit.log("template",{act:"download",id});
}

/* ---------- import ---------- */
function parseDelimited(text){
  const src=String(text).replace(/^﻿/,""),first=src.split(/\r?\n/)[0]||"",dl=first.includes("\t")?"\t":(first.split(";").length>first.split(",").length?";":",");
  const rows=[];let row=[],cell="",q=false;
  for(let i=0;i<src.length;i++){const ch=src[i];
    if(q){if(ch==='"'){if(src[i+1]==='"'){cell+='"';i++}else q=false}else cell+=ch;continue}
    if(ch==='"'){q=true;continue}if(ch===dl){row.push(cell);cell="";continue}
    if(ch==="\n"||ch==="\r"){if(ch==="\r"&&src[i+1]==="\n")i++;row.push(cell);rows.push(row);row=[];cell="";continue}cell+=ch}
  if(cell!==""||row.length){row.push(cell);rows.push(row)}
  return rows.filter(r=>r.some(c=>String(c).trim()!==""));
}
async function readRows(file){return /\.xlsx$/i.test(file.name)?await SKXlsx.rows(file):parseDelimited(await file.text())}
/* map the sheet's header row onto the template's columns and check every row */
function check(t,grid){
  if(!grid.length)return{rows:[],errors:["الملف فارغ"]};
  const head=grid[0].map(K),idx={};t.cols.forEach(c=>{const i=head.indexOf(K(c.h));if(i>=0)idx[c.key]=i});
  const miss=t.cols.filter(c=>c.req&&idx[c.key]==null).map(c=>c.h);if(miss.length)return{rows:[],errors:["أعمدة ناقصة: "+miss.join("، ")+" — نزّل القالب ولا تغيّر أسماء الأعمدة"]};
  const rows=[],errors=[];
  grid.slice(1).forEach((r,ri)=>{const o={},why=[];
    t.cols.forEach(c=>{if(idx[c.key]==null)return;let v=r[idx[c.key]];v=v==null?"":typeof v==="string"?v.trim():v;
      if(c.type==="num"){if(v===""){if(c.req)why.push(c.h+" فارغ");return}const n=num(v);if(n==null){why.push(c.h+" ليس رقماً");return}o[c.key]=n;return}
      if(c.type==="date"){if(v===""){if(c.req)why.push(c.h+" فارغ");o[c.key]="";return}const d=date(v);if(!d){why.push(c.h+" تاريخ غير مفهوم");return}o[c.key]=d;return}
      if(c.type==="bool"){o[c.key]=yes(v);return}
      if(c.req&&String(v)==="")why.push(c.h+" فارغ");
      if(c.choices&&String(v)!==""&&!c.choices.includes(String(v)))why.push(c.h+": «"+v+"» ليست من القيم المسموحة");
      o[c.key]=String(v)});
    if(why.length)errors.push("الصف "+(ri+2)+": "+why.join("، "));else rows.push(o)});
  return{rows,errors};
}
function pick(accept){return new Promise(res=>{const i=document.createElement("input");i.type="file";i.accept=accept;i.onchange=()=>res(i.files[0]||null);i.click()})}
async function importFrom(id){
  const t=T.find(x=>x.id===id);if(!t)return;
  if(SK.perm&&!SK.perm.can(t.caps[0],"import")&&!SK.perm.can(t.caps[0],"create")){toast("الاستيراد غير متاح لهذا الدور","warn");return}
  if(t.route){t.route();toast("اختر ملف القالب بعد تعبئته من نافذة الاستيراد","info");return}
  const file=await pick(".xlsx,.csv,.tsv,.txt");if(!file)return;
  try{
    if(t.importFile){await t.importFile(file,t);return}
    const {rows,errors}=check(t,await readRows(file));
    if(!rows.length){SK.notify((errors[0]||"لا صفوف صالحة")+(errors.length>1?"\n… و"+(errors.length-1)+" أخطاء أخرى":""),{title:"تعذر الاستيراد"});return}
    const ok=await SK.confirm(rows.length+" صفاً صالحاً للاستيراد إلى «"+t.label+"»"+(errors.length?"\nسيُترك "+errors.length+" صفاً:\n"+errors.slice(0,5).join("\n")+(errors.length>5?"\n…":""):"")+"\nتُضاف السجلات إلى الموجود دون حذف شيء.",{title:"استيراد من القالب",ok:"استيراد"});
    if(!ok)return;
    const res=t.importRows(rows)||{added:rows.length,rejected:[]};
    SK.audit&&SK.audit.log("template",{act:"import",id,added:res.added,rejected:(res.rejected||[]).length+errors.length});
    toast("استُورد "+res.added+" سجلاً إلى «"+t.label+"»"+((res.rejected||[]).length?" — تُرك "+res.rejected.length+": "+res.rejected[0]:""),res.added?"ok":"warn");
    if(res.reload){setTimeout(()=>location.reload(),600);return}
    window.SKosifCore&&SKosifCore.go(SKosifCore.view());
  }catch(e){SK.errors&&SK.errors.report(e,"template:"+id);toast("تعذرت قراءة الملف: "+e.message,"bad")}
}

/* ---------- where the user finds them ---------- */
const forView=v=>T.filter(t=>t.caps.includes(v));
function menu(list,anchor){
  document.querySelectorAll(".sktpl-menu").forEach(x=>x.remove());
  const m=document.createElement("div");m.className="sktpl-menu";m.setAttribute("role","menu");
  m.innerHTML='<b>قوالب الاستيراد</b>'+list.map(t=>'<div class="sktpl-row"><span>'+esc(t.label)+'<small>'+esc(t.format==="csv"?"CSV":"Excel")+" · "+t.cols.length+' أعمدة</small></span><button type="button" class="btn sm" data-tpl-dl="'+t.id+'">تحميل القالب</button><button type="button" class="btn sm primary" data-tpl-in="'+t.id+'">استيراد</button></div>').join("")+
    '<button type="button" class="linkish" data-tpl-all>كل القوالب…</button>';
  document.body.appendChild(m);const r=anchor.getBoundingClientRect();m.style.top=Math.min(innerHeight-m.offsetHeight-8,r.bottom+6)+"px";m.style.insetInlineEnd=Math.max(8,innerWidth-r.right)+"px";
  if(innerWidth<600){m.style.insetInlineEnd="8px";m.style.insetInlineStart="8px"}
  setTimeout(()=>document.addEventListener("click",function off(e){if(!e.target.closest(".sktpl-menu,.sktpl-btn")){m.remove();document.removeEventListener("click",off)}}),0);
}
function all(){
  const w=document.createElement("div");w.className="skd-wrap";
  w.innerHTML='<div class="skd sktpl-all" role="dialog" aria-modal="true" aria-labelledby="sktpl-t"><h3 id="sktpl-t">قوالب الاستيراد</h3><p>قالب لكل قسم: املأه في Excel ثم استورده. الأعمدة تُقرأ بأسمائها، وكل صف يُفحص قبل الحفظ.</p><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>القسم</th><th>الصيغة</th><th></th></tr></thead><tbody>'+
    T.map(t=>'<tr><td>'+esc(t.label)+'<small class="hint" style="display:block">'+esc(t.note.slice(0,110))+(t.note.length>110?"…":"")+'</small></td><td>'+(t.format==="csv"?"CSV":"Excel")+'</td><td style="white-space:nowrap"><button type="button" class="btn sm" data-tpl-dl="'+t.id+'">تحميل</button> <button type="button" class="btn sm primary" data-tpl-in="'+t.id+'">استيراد</button></td></tr>').join("")+
    '</tbody></table></div><div class="skd-acts"><button type="button" class="btn" data-tpl-close>إغلاق</button></div></div>';
  document.body.appendChild(w);w.addEventListener("click",e=>{if(e.target===w||e.target.closest("[data-tpl-close]"))w.remove()});
}
function headerButton(){
  const ph=document.querySelector(".sk-ph");if(!ph)return;const v=window.SKosifCore&&SKosifCore.view(),list=forView(v);let b=ph.querySelector(".sktpl-btn");
  if(!list.length){if(b)b.remove();return}
  if(!b){b=document.createElement("button");b.type="button";b.className="sktpl-btn btn sm";b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg><span>قوالب الاستيراد</span>';ph.appendChild(b)}
  b.dataset.view=v;b.title=list.map(t=>t.label).join("، ");
}
document.addEventListener("click",e=>{
  const b=e.target.closest(".sktpl-btn");if(b){menu(forView(b.dataset.view),b);return}
  const d=e.target.closest("[data-tpl-dl]");if(d){download(d.dataset.tplDl);return}
  const i=e.target.closest("[data-tpl-in]");if(i){document.querySelectorAll(".sktpl-menu").forEach(x=>x.remove());importFrom(i.dataset.tplIn);return}
  if(e.target.closest("[data-tpl-all]")){document.querySelectorAll(".sktpl-menu").forEach(x=>x.remove());all()}
});
SK.bus&&SK.bus.on("render",()=>setTimeout(headerButton,0));
SK.bus&&SK.bus.on("nav",()=>setTimeout(headerButton,0));
SK.templates=Object.freeze({list:()=>T.map(t=>({id:t.id,label:t.label,caps:t.caps.slice(),format:t.format,columns:t.cols.map(c=>c.h)})),download,import:importFrom,panel:all,check:(id,grid)=>check(T.find(x=>x.id===id),grid),parse:parseDelimited});
})();

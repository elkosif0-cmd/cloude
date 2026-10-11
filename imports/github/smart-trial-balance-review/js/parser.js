/* ============================================================
   قراءة ميزان المراجعة: Excel / CSV / لصق يدوي + نموذج جاهز
   ============================================================ */
(function(){
"use strict";

/* تحويل الأرقام العربية إلى إنجليزية وتنظيف الفواصل */
function normalizeNum(v){
  if(typeof v === "number") return v;
  let s = normStr(v).replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
                    .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  s = s.replace(/[,٬\s]/g,"").replace(/[٫，]/g,".").replace(/[^0-9.\-()]/g,"");
  if(/^\(.*\)$/.test(s)) s = "-"+s.slice(1,-1);
  const n = parseFloat(s);
  return isNaN(n)? 0 : n;
}
function normStr(s){ return (s==null? "" : s.toString()).trim(); }

const NAME_HEADERS = ["اسم الحساب","الحساب","اسم الحسابات","البيان","اسم البند","البند","اسم","account","account name","particulars","name"];
const DR_HEADERS   = ["مدين","مدين دائن","مدين/dt","debit","dr"];
const CR_HEADERS   = ["دائن","دائن/cr","credit","cr"];

function findHeaderRow(rows){
  for(let i=0;i<Math.min(rows.length,12);i++){
    const r = rows[i].map(normStr).map(x=>x.toLowerCase());
    const hasName = r.some(c=>NAME_HEADERS.includes(c));
    if(hasName && r.some(c=>DR_HEADERS.some(h=>c===h||c.startsWith(h))) ) return i;
    // يكفي وجود عمود نصي أول + عمودين رقميين بعده
  }
  return -1;
}

/** يجدد array من الصفوف [{..}] من ورقة XLSX مع تحديد الأعمدة تلقائيًا */
function sheetToRows(ws){
  const grid = XLSX.utils.sheet_to_json(ws, {header:1, defval:"", raw:true});
  if(!grid.length) return [];
  const hIdx = findHeaderRow(grid);
  let cName=0,cDr=1,cCr=2;
  if(hIdx>=0){
    const hdr = grid[hIdx].map(normStr).map(x=>x.toLowerCase());
    hdr.forEach((h,i)=>{
      if(NAME_HEADERS.includes(h)) cName=i;
      else if(DR_HEADERS.some(k=>h===k||h.startsWith(k))) cDr=i;
      else if(CR_HEADERS.some(k=>h===k||h.startsWith(k))) cCr=i;
    });
    var startRow = hIdx+1;
  } else {
    var startRow = 0;
    // توقع: العمود الأول اسم، أكبر عمودين من حيث نسبة القيم الرقمية مدين/دائن
    const widths = (grid[0]||[]).length || 3;
    cDr = Math.min(1,widths-1); cCr = Math.min(2,widths-1);
  }
  const items=[];
  for(let r=startRow;r<grid.length;r++){
    const row = grid[r];
    const name = normStr(row[cName]);
    if(!name) continue;
    if(/(المجموع|إجمالي|اجمالي|مجموع|total|balance)/i.test(name)) continue;
    const dr = normalizeNum(row[cDr]), cr = normalizeNum(row[cCr]);
    if(dr===0 && cr===0) continue;
    items.push({name, debit:dr, credit:cr});
  }
  return items;
}

function buildTB(items){
  const tb = {items:[], totals:{debit:0, credit:0}, balanced:false};
  items.forEach((it,i)=>{
    let d=it.debit||0, c=it.credit||0;
    if(d<0){ c+=-d; d=0; }          // سالب المدين يعالَج دائنًا
    if(c<0){ d+=-c; c=0; }
    tb.items.push({id:"it"+(i+1), name:it.name, debit:d, credit:c,
      cat:TBMap.classifyItem(it.name)});
  });
  recalc(tb);
  return tb;
}
function recalc(tb){
  tb.totals.debit = tb.items.reduce((s,i)=>s+(i.debit||0),0);
  tb.totals.credit= tb.items.reduce((s,i)=>s+(i.credit||0),0);
  tb.balanced = Math.abs(tb.totals.debit-tb.totals.credit)<0.01;
  return tb;
}

async function parseFile(file){
  const nameLower = file.name.toLowerCase();
  if(nameLower.endsWith(".xlsx")||nameLower.endsWith(".xls")){
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf,{type:"array"});
    let all=[];
    for(const sn of wb.SheetNames){
      const got = sheetToRows(wb.Sheets[sn]);
      if(got.length>all.length) all=got;
    }
    return all;
  }
  const text = await file.text();
  return parseDelimited(text);
}

function parseDelimited(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if(!lines.length) return [];
  // اكتشاف الفاصل
  const cand=[",","\t",";","|"];
  const delim = cand.sort((a,b)=> (lines[0].split(b).length)-(lines[0].split(a).length))[0];
  const grid = lines.map(l=>l.split(delim).map(normStr));
  const hIdx = findHeaderRow(grid);
  let cName=0,cDr=-1,cCr=-1;
  if(hIdx>=0){
    const hdr = grid[hIdx].map(x=>x.toLowerCase());
    hdr.forEach((h,i)=>{
      if(NAME_HEADERS.includes(h)) cName=i;
      else if(DR_HEADERS.some(k=>h===k||h.startsWith(k))) cDr=i;
      else if(CR_HEADERS.some(k=>h===k||h.startsWith(k))) cCr=i;
    });
    if(cDr<0&&cCr<0){cDr=cName+1;cCr=cName+2;}
  } else {
    const ncols = Math.max(...grid.map(r=>r.length));
    // آخر عمودين غير فارغين غالباً مدين/دائن؛ وإلا فثلاثة أعمدة افتراضية
    const numericCols={};
    grid.forEach(r=>r.forEach((c,i)=>{ if(normalizeNum(c)!==0) numericCols[i]=(numericCols[i]||0)+1;}));
    const sorted = Object.entries(numericCols).sort((a,b)=>b[1]-a[1]).map(e=>+e[0]);
    if(sorted.length>=2){ cCr=sorted[0]; cDr=sorted[1]; if(cCr<cDr){[cDr,cCr]=[cCr,cDr];} }
    else { cDr=1; cCr=2; }
  }
  const items=[];
  for(let r=(hIdx>=0?hIdx+1:0); r<grid.length; r++){
    const row=grid[r]; const name=row[cName]||"";
    if(!name) continue;
    if(/(المجموع|إجمالي|اجمالي|مجموع|total)/i.test(name)) continue;
    const dr=cDr>=0?normalizeNum(row[cDr]):0, cr=cCr>=0?normalizeNum(row[cCr]):0;
    if(dr===0&&cr===0) continue;
    items.push({name, debit:dr, credit:cr});
  }
  return items;
}

/* ===== نموذج جاهز متوازن (ريال سعودي) ===== */
const SAMPLE = [
  ["النقدية بالصندوق",18500,0],["النقدية لدى البنك",262400,0],
  ["العملاء - ذمم مدينة",415000,0],["أوراق قبض",60000,0],
  ["مخزون بضاعة موجودة بالمستودعات",348000,0],
  ["مصروفات إيجار مدفوعة مقدماً",24000,0],
  ["سيارات نقل",185000,0],["أثاث ومعدات مكتبية",92000,0],
  ["برامج وأنظمة محاسبية",45000,0],
  ["ضريبة القيمة المضافة على المشتريات",31200,0],
  ["تكلفة المبيعات",612000,0],["مصروفات بيع وتسويق",88400,0],
  ["مصروفات إدارية وعمومية",96500,0],
  ["الموردون - ذمم دائنة",0,296500],["أوراق دفع",0,75000],
  ["رواتب وأجور مستحقة",0,48300],
  ["ضريبة القيمة المضافة المستحقة",0,38700],
  ["قرض بنكي طويل الأجل",0,210000],
  ["رأس المال",0,600000],["الأرباح المدورة",0,132600],
  ["إيرادات المبيعات",0,876900]
];

window.TBParse = {
  normalizeNum, parseFile, parseDelimited,
  fromItems:(arr)=>buildTB(arr),
  sample(){ return buildTB(SAMPLE.map(([n,d,c])=>({name:n,debit:d,credit:c}))); },
  recalc
};
})();

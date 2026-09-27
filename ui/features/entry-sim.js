/* SQC — محاكي القيود (شاشة «jesim» في الأدوات المساعدة للمحاسب): يفهم كيف تسجّل هذه الشركة قيودها ثم يقترح قيد أي مستند.
   • علّمه: ارفع قيود اليومية لفترة (Excel/CSV، بأعمدة تُكتشف تلقائياً وتُصحَّح)، أو خذها من «الدفاتر المحاسبية» في
     التطبيق، وارفع تقارير المدراء الماليين (نصاً أو ملفاً؛ PDF والصور تُقرأ بالذكاء الاصطناعي إن وُجد مفتاح) — فيتعلم
     أنماط القيود: الحسابات وجهاتها ونسبها، ضريبة القيمة المضافة، الدفتر الذي يُسجل فيه كل نوع، وكلمات كل نمط.
   • اقترح قيداً: اكتب وصف المستند ومبلغه (وأرفقه إن شئت) → القيد المتزن، وأين يُسجل (اليومية والمستند)، ولماذا،
     ودرجة الثقة. إن لم يكن متأكداً يسألك ويعرض البدائل، أو تحدد الحسابات بنفسك — وجوابك يُحفظ قاعدةً في الذاكرة.
     بمفتاح الذكاء الاصطناعي يُستعان به فوق المحرك المحلي، ويُتحقق من جوابه: حسابات الدليل فقط، وقيد متزن.
   • الذاكرة: الأنماط والقواعد والملاحظات وسجل التعلم — تُراجع وتُحذف وتُصدَّر وتُستورد وتُطبع.
   ترحيل القيد المعتمد إلى «الدفاتر المحاسبية» (SKosifLedger.post) وطباعة سند القيد بترويسة SQC.
   البيانات: sqc_jesim_v1 (لكل شركة، ضمن مساحة الأدوات المساعدة). المحرك: SKEngines.finance.entryLearner. */
(()=>{
"use strict";
const {esc,toast,load,save}=SK;
const KEY="sqc_jesim_v1",EL=()=>SKEngines.finance.entryLearner,AIE=()=>SKEngines.audit.aiReview;
const TABS=[["suggest","اقترح قيداً"],["learn","علّمه"],["memory","الذاكرة"]];
const FIELDS=[["date","التاريخ"],["ref","رقم القيد"],["account","رقم الحساب"],["name","اسم الحساب"],["debit","مدين"],["credit","دائن"],["amount","المبلغ (عمود واحد)"],["side","مدين/دائن"],["memo","البيان"]];
let root=null,tab="",doc={text:"",amount:"",date:"",vatIncluded:true},res=null,edit=null,pending=null,busy=false,useAi=true,attach=null;
const nf=new Intl.NumberFormat("en",{minimumFractionDigits:2,maximumFractionDigits:2}),n2=v=>nf.format(Number(v)||0);
const today=()=>new Date().toISOString().slice(0,10);
const mem=()=>{const m=load(KEY,null);return m&&m.v===1&&Array.isArray(m.patterns)?m:EL().emptyMemory()};
const put=m=>{save(KEY,m);SK.audit&&SK.audit.log("jesim",{act:"memory",patterns:m.patterns.length,rules:m.rules.length})};
const aiReady=()=>!!(window.SKosifAI&&SKosifAI.ready());
const readAs=(file,how)=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error||new Error("تعذرت قراءة الملف"));how==="text"?r.readAsText(file):r.readAsDataURL(file)});
const mimeOf=f=>f.type||(/\.pdf$/i.test(f.name)?"application/pdf":/\.png$/i.test(f.name)?"image/png":/\.jpe?g$/i.test(f.name)?"image/jpeg":"application/octet-stream");
const STATUS={sure:["ok","متأكد"],unsure:["warn","غير متأكد — يسألك"],unknown:["bad","لا يعرف هذا المستند"]};

/* ---------- suggesting ---------- */
async function run(){
  const m=mem(),d={text:doc.text.trim(),amount:Number(String(doc.amount).replace(/[^\d.]/g,""))||0,date:doc.date||today(),vatIncluded:doc.vatIncluded};
  if(!d.text&&!attach)return toast("اكتب وصف المستند أو أرفقه","warn");
  let s=EL().suggest(m,d);edit=null;
  if(useAi&&aiReady()&&m.patterns.length&&(s.status!=="sure"||attach||!d.amount)){
    busy=true;paint();
    try{
      const api=await SKosifAI.generate(EL().aiBody(m,d,s,attach?{mime:attach.mime,data:attach.data}:undefined),{timeout:120000});
      const v=EL().verifyAi(m,AIE().parseJsonLoose(AIE().extractText(api).text),s);
      if(v.extracted&&v.extracted.amount&&!d.amount){doc.amount=String(v.extracted.amount);d.amount=v.extracted.amount;if(s.patternId)s={...s,lines:EL().linesFor(m.patterns.find(p=>p.id===s.patternId),d.amount,d.vatIncluded)}}
      if(v.lines.length&&(v.confidence>=s.confidence||!s.lines.length))s={...v,ai:true};else s={...s,reasons:s.reasons.concat(["رأي الذكاء الاصطناعي: "+(v.reasons[0]||"—")+" (ثقة "+Math.round(v.confidence*100)+"٪)"])};
    }catch(e){toast("الذكاء الاصطناعي: "+e.message,"warn")}
    busy=false;
  }
  res={...s,doc:d};paint();
}
function teachWith(patternId){
  const m=mem();try{const p=EL().teach(m,res.doc,{patternId});put(m);toast("حُفظ في الذاكرة: «"+p.title.slice(0,40)+"»","ok")}catch{return toast("النمط غير موجود","bad")}
  doc.text=res.doc.text;run();
}
function teachOwn(){
  const lines=(edit||[]).map(l=>({account:String(l.account||"").trim(),name:String(l.name||"").trim(),debit:Math.abs(+l.debit||0),credit:Math.abs(+l.credit||0)})).filter(l=>l.account&&(l.debit||l.credit));
  if(!EL().isBalanced(lines))return toast("القيد غير متزن — المدين يجب أن يساوي الدائن","warn");
  const m=mem();lines.forEach(l=>{if(m.accounts[l.account]&&m.accounts[l.account].name)l.name=m.accounts[l.account].name});
  const sh=EL().shapeOf({ref:"",date:"",memo:res.doc.text,lines});
  const p=EL().teach(m,res.doc,{legs:sh.legs,title:res.doc.text.slice(0,60),vatRate:sh.vatRate});put(m);
  toast("تعلّم قيداً جديداً: «"+p.title.slice(0,40)+"»","ok");edit=null;run();
}
function post(){
  const L=window.SKosifLedger;if(!L||!L.post)return toast("الدفاتر المحاسبية غير متاحة","bad");
  const r=L.post({date:res.doc.date,memo:res.doc.text||res.title,reference:"",lines:res.lines,source:"محاكي القيود"});
  if(!r.ok)return toast("لم يُرحّل: "+r.error,"bad");
  if(res.patternId){const m=mem();try{EL().teach(m,res.doc,{patternId:res.patternId});put(m)}catch{/* the pattern was removed meanwhile */}}
  toast("رُحّل القيد إلى الدفاتر المحاسبية وحُفظ في الذاكرة","ok");res={...res,posted:r.id};paint();
}
function printVoucher(){
  if(!res||!res.lines.length)return;const w=window.open("");if(!w)return toast("تعذر فتح المعاينة","bad");
  const D=res.lines.reduce((s,l)=>s+l.debit,0),C=res.lines.reduce((s,l)=>s+l.credit,0);
  w.document.write('<html dir="rtl"><meta charset="utf-8"><title>سند قيد يومية</title><body><h1>سند قيد يومية</h1>'+
    '<table><tbody><tr><th>التاريخ</th><td>'+esc(res.doc.date)+'</td><th>الدفتر</th><td>'+esc(res.journal)+'</td></tr><tr><th>البيان</th><td colspan="3">'+esc(res.doc.text||res.title)+'</td></tr></tbody></table>'+
    '<table><thead><tr><th>رقم الحساب</th><th>اسم الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>'+res.lines.map(l=>'<tr><td>'+esc(l.account)+'</td><td>'+esc(l.name)+'</td><td>'+(l.debit?n2(l.debit):"")+'</td><td>'+(l.credit?n2(l.credit):"")+'</td></tr>').join("")+
    '<tr><td colspan="2"><b>الإجمالي</b></td><td><b>'+n2(D)+'</b></td><td><b>'+n2(C)+'</b></td></tr></tbody></table>'+
    '<p>اقترحه محاكي القيود من طريقة تسجيل الشركة (ثقة '+Math.round(res.confidence*100)+'٪)'+(res.reasons.length?' — '+esc(res.reasons.slice(0,2).join(" · ")):"")+'.</p>'+
    '<table><tbody><tr><th>أعدّه</th><td></td><th>راجعه</th><td></td><th>اعتمده</th><td></td></tr></tbody></table></body></html>');
  w.document.close();SK.brandPrint(w,"سند قيد يومية");
}

/* ---------- learning ---------- */
async function readJournal(f){
  let rows=[];
  if(/\.xlsx$/i.test(f.name)&&window.SKXlsx)rows=await SKXlsx.rows(f);
  else{const text=await f.text(),TI=SKEngines.reports.tbImport,d=TI.detectDelimiter(text);rows=text.split(/\r?\n/).filter(x=>x.trim()).map(l=>TI.splitLine(l,d))}
  rows=rows.filter(r=>r&&r.some(c=>String(c??"").trim()));if(rows.length<2)return toast("الملف فارغ أو بلا صفوف","warn");
  /* the header is the first row that names an account column */
  let h=rows.findIndex(r=>r.some(c=>/حساب|account/i.test(String(c??""))));if(h<0)h=0;
  const head=rows[h].map(c=>String(c??"").trim());
  pending={name:f.name,head,rows:rows.slice(h+1).map(r=>r.map(c=>String(c??"").trim())),map:EL().detectColumns(head)};paint();
}
function learnPending(){
  const mp=pending.map;if(mp.account==null&&mp.name==null)return toast("حدّد عمود الحساب","warn");
  if(mp.debit==null&&mp.credit==null&&mp.amount==null)return toast("حدّد عمودي المدين والدائن أو عمود المبلغ","warn");
  const m=mem(),r=EL().learn(m,EL().rowsFrom(pending.rows,mp),pending.name);put(m);
  toast("تعلّم "+r.entries+" قيداً و"+r.newPatterns+" نمطاً جديداً"+(r.skipped?" — تُرك "+r.skipped+" قيداً غير متزن":""),"ok");pending=null;tab="memory";paint();
}
function learnBooks(){
  const L=window.SKosifLedger;const es=L?L.entries().filter(e=>!e.reversedBy):[];if(!es.length)return toast("لا توجد قيود في الدفاتر المحاسبية لهذه الشركة","warn");
  const acc=new Map(L.accounts().map(a=>[a.id,a]));
  const rows=es.flatMap(e=>e.lines.map(l=>{const a=acc.get(l.accountId)||{};return{date:e.date,ref:e.id,account:a.code||l.accountId,name:a.name||"",debit:l.debit,credit:l.credit,memo:e.memo||e.source||""}}));
  const m=mem(),r=EL().learn(m,rows,"الدفاتر المحاسبية في التطبيق");put(m);toast("تعلّم "+r.entries+" قيداً من الدفاتر ("+r.newPatterns+" نمطاً جديداً)","ok");paint();
}
async function learnReportFile(f){
  let text="";
  if(/\.xlsx$/i.test(f.name)&&window.SKXlsx)text=(await SKXlsx.rows(f)).map(r=>r.join(" ")).join("\n");
  else if(/^text\/|csv|json/.test(f.type)||/\.(txt|csv|tsv|md)$/i.test(f.name))text=await readAs(f,"text");
  else{
    if(!aiReady())return toast("قراءة PDF والصور تحتاج مفتاح الذكاء الاصطناعي — أو الصق نص التقرير","warn");
    busy=true;paint();
    try{const data=String(await readAs(f,"url")).split(",")[1];
      const api=await SKosifAI.generate({contents:[{role:"user",parts:[{text:"استخرج من هذا التقرير المالي كل الجمل التي تشرح كيف تُسجّل العمليات محاسبياً أو تُعالج أو تُحمّل أو تُرسمل أو تُخصص، حرفياً، جملة في كل سطر، دون تعليق."},{inlineData:{mimeType:mimeOf(f),data}}]}],generationConfig:{temperature:0}},{timeout:180000});
      text=AIE().extractText(api).text}
    catch(e){busy=false;paint();return toast("تعذرت قراءة الملف: "+e.message,"bad")}
    busy=false;
  }
  addReport(text,f.name);
}
function addReport(text,source){
  if(!String(text||"").trim())return toast("التقرير فارغ","warn");
  const m=mem(),r=EL().learnReport(m,text,source);put(m);toast(r.notes?"حُفظت "+r.notes+" ملاحظة عن طريقة التسجيل":"لم أجد في التقرير جملاً عن طريقة التسجيل","ok");paint();
}

/* ---------- views ---------- */
const kpi=(l,v,s)=>'<div class="sk-kpi"><span>'+l+'</span><b>'+v+'</b>'+(s?'<small>'+s+'</small>':'')+'</div>';
function linesTable(lines){
  const D=lines.reduce((s,l)=>s+l.debit,0),C=lines.reduce((s,l)=>s+l.credit,0);
  return '<div class="sk-table-wrap"><table class="sk-table js-lines"><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>'+lines.map(l=>'<tr><td><span class="mono">'+esc(l.account)+'</span> '+esc(l.name)+'</td><td class="num">'+(l.debit?n2(l.debit):"")+'</td><td class="num">'+(l.credit?n2(l.credit):"")+'</td></tr>').join("")+
    '</tbody><tfoot><tr><td>الإجمالي</td><td class="num">'+n2(D)+'</td><td class="num">'+n2(C)+'</td></tr></tfoot></table></div>';
}
function editor(m){
  const opts='<datalist id="js-acc">'+Object.entries(m.accounts).map(([c,a])=>'<option value="'+esc(c)+'">'+esc(a.name)+'</option>').join("")+'</datalist>';
  return '<section class="card js-edit"><div class="card-h"><div><h3>حدّد القيد بنفسك</h3><p>اختر الحسابات من دليل الشركة (أو اكتب رقماً جديداً) والمبالغ؛ يُحفظ نمطاً جديداً ويُتعرف على المستندات المشابهة بعده.</p></div></div><div class="card-b">'+opts+
    edit.map((l,i)=>'<div class="js-er"><input list="js-acc" data-je="account" data-i="'+i+'" value="'+esc(l.account)+'" placeholder="رقم الحساب" aria-label="رقم الحساب"><input data-je="name" data-i="'+i+'" value="'+esc(l.name)+'" placeholder="اسم الحساب" aria-label="اسم الحساب"><input inputmode="decimal" data-je="debit" data-i="'+i+'" value="'+esc(l.debit||"")+'" placeholder="مدين" aria-label="مدين"><input inputmode="decimal" data-je="credit" data-i="'+i+'" value="'+esc(l.credit||"")+'" placeholder="دائن" aria-label="دائن"><button type="button" class="btn sm" data-js="rm-line" data-i="'+i+'" aria-label="حذف السطر">×</button></div>').join("")+
    '<div class="sk-actions"><button type="button" class="btn sm" data-js="add-line">+ سطر</button><button type="button" class="btn primary" data-js="teach-own">احفظ القيد وتعلّمه</button><button type="button" class="btn" data-js="cancel-edit">إلغاء</button></div></div></section>';
}
function suggestTab(m){
  const empty=!m.patterns.length;
  return (empty?'<div class="js-empty card"><div class="card-b"><b>لم يتعلم المحاكي بعد طريقة تسجيل هذه الشركة.</b><p>ابدأ من «علّمه»: ارفع قيود فترة سابقة أو خذها من الدفاتر، ثم عُد هنا لتقترح قيد أي مستند.</p><button type="button" class="btn primary" data-js-tab="learn">علّمه الآن</button></div></div>':'')+
  '<section class="card"><div class="card-h"><div><h3>المستند</h3><p>صف المستند كما يُكتب في البيان (مثل: «فاتورة كهرباء الفرع لشهر مارس»، «تحصيل من عميل الأمل»)، ومبلغه.</p></div></div><div class="card-b js-doc">'+
    '<label class="sk-field js-wide"><span>وصف المستند</span><textarea rows="2" data-jd="text" placeholder="فاتورة شراء لحوم من مؤسسة المراعي آجل">'+esc(doc.text)+'</textarea></label>'+
    '<label class="sk-field"><span>المبلغ</span><input inputmode="decimal" data-jd="amount" value="'+esc(doc.amount)+'" placeholder="0.00"></label>'+
    '<label class="sk-field"><span>التاريخ</span><input type="date" data-jd="date" value="'+esc(doc.date||today())+'"></label>'+
    '<label class="js-chk"><input type="checkbox" data-jd="vatIncluded"'+(doc.vatIncluded?" checked":"")+'> المبلغ شامل ضريبة القيمة المضافة</label>'+
    '<label class="js-chk"><input type="checkbox" data-jd="ai"'+(useAi?" checked":"")+(aiReady()?"":" disabled")+'> استعن بالذكاء الاصطناعي'+(aiReady()?"":" (أضف المفتاح في المساعد أو مراجعة الميزان)")+'</label>'+
    '<div class="sk-actions js-wide"><label class="btn" style="cursor:pointer">'+SK.icon("scanner")+' '+(attach?"مرفق: "+esc(attach.name.slice(0,24)):"أرفق المستند")+'<input type="file" data-js-attach accept=".pdf,image/*" hidden></label>'+(attach?'<button type="button" class="btn sm" data-js="drop-attach">إزالة المرفق</button>':'')+
    '<button type="button" class="btn primary" data-js="run"'+(busy?" disabled":"")+'>'+(busy?"يفكر…":"اقترح القيد")+'</button></div></div></section>'+
  (res?resultCard(m):'')+(edit?editor(m):'');
}
function resultCard(m){
  const [cls,lab]=STATUS[res.status]||STATUS.unknown,pc=Math.round(res.confidence*100);
  return '<section class="card js-res js-'+res.status+'"><div class="card-h"><div><h3>القيد المقترح</h3><p>'+esc(res.title||"—")+(res.ai?' · <span class="sksev info">بمساعدة الذكاء الاصطناعي</span>':'')+'</p></div><span class="sksev '+cls+'">'+lab+' · '+pc+'٪</span></div><div class="card-b">'+
    '<div class="js-meter" role="meter" aria-valuenow="'+pc+'" aria-valuemin="0" aria-valuemax="100" aria-label="الثقة"><i style="width:'+pc+'%"></i></div>'+
    (res.journal?'<div class="js-where"><span>أين يُسجّل</span><b>'+esc(res.journal)+'</b></div>':'')+
    (res.lines.length?linesTable(res.lines):'')+
    (res.reasons.length?'<ul class="js-why">'+res.reasons.map(r=>'<li>'+esc(r)+'</li>').join("")+'</ul>':'')+
    (res.question?'<div class="js-q"><b>'+esc(res.question)+'</b><div class="js-opts">'+res.alternatives.map(a=>'<button type="button" class="btn sm" data-js-pick="'+esc(a.patternId)+'">'+esc((m.patterns.find(p=>p.id===a.patternId)||{}).title||a.title)+'</button>').join("")+
      '<button type="button" class="btn sm" data-js="own">قيد آخر — أحدده بنفسي</button></div></div>':'')+
    '<div class="sk-actions">'+(res.lines.length&&res.balanced?(res.patternId&&res.status!=="sure"?'<button type="button" class="btn" data-js-pick="'+esc(res.patternId)+'">صحيح — احفظه في الذاكرة</button>':'')+
      (res.posted?'<span class="sksev ok">رُحّل إلى الدفاتر</span>':'<button type="button" class="btn primary" data-js="post">رحّل إلى الدفاتر المحاسبية</button>')+'<button type="button" class="btn" data-js="print">'+SK.icon("print")+' سند القيد</button>':'')+
    '<button type="button" class="btn" data-js="own">عدّل الحسابات</button></div></div></section>';
}
function learnTab(m){
  return '<section class="card"><div class="card-h"><div><h3>قيود اليومية لفترة</h3><p>ملف Excel أو CSV من أي نظام: التاريخ، رقم القيد، رقم الحساب واسمه، مدين ودائن (أو مبلغ وعمود مدين/دائن)، والبيان. كلما زادت القيود فهم أكثر.</p></div></div><div class="card-b">'+
    '<div class="sk-actions"><label class="btn primary" style="cursor:pointer">'+SK.icon("excelrecon")+' رفع ملف القيود<input type="file" data-js-file accept=".xlsx,.csv,.tsv,.txt" hidden></label><button type="button" class="btn" data-js="books">تعلّم من الدفاتر المحاسبية في التطبيق</button></div>'+
    (pending?'<div class="js-cols">'+FIELDS.map(([f,l])=>'<label class="sk-field"><span>'+l+'</span><select data-js-col="'+f+'"><option value="-1">—</option>'+pending.head.map((h,i)=>'<option value="'+i+'"'+(pending.map[f]===i?' selected':'')+'>'+esc(h||("عمود "+(i+1)))+'</option>').join("")+'</select></label>').join("")+'</div>'+
      '<div class="sk-table-wrap"><table class="sk-table" data-sk-plain><thead><tr>'+pending.head.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+pending.rows.slice(0,5).map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>'+
      '<div class="sk-actions"><button type="button" class="btn primary" data-js="learn">تعلّم من '+pending.rows.length+' سطراً</button><button type="button" class="btn" data-js="cancel-up">إلغاء</button></div>':'')+'</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>تقارير المدراء الماليين</h3><p>السياسات والملاحظات التي تشرح كيف تُسجّل العمليات (مثل: «تُحمّل مصروفات الصيانة على…»، «تُرسمل…») تُحفظ مع الحسابات التي تذكرها وتُستخدم في الاقتراح.</p></div></div><div class="card-b">'+
    '<label class="sk-field"><span>الصق نص التقرير</span><textarea rows="4" data-js-report placeholder="تُسجّل مبيعات المتجر الإلكتروني عند التسليم في حساب إيرادات المبيعات…"></textarea></label>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-js="report">احفظ ما في النص</button><label class="btn" style="cursor:pointer">رفع تقرير (نص، Excel، PDF، صورة)<input type="file" data-js-rfile accept=".txt,.csv,.xlsx,.md,.pdf,image/*" hidden></label></div>'+(busy?'<p class="hint">يقرأ التقرير…</p>':'')+'</div></section>'+
  '<p class="hint">ما تعلمه حتى الآن: '+m.stats.entries+' قيداً، '+m.patterns.length+' نمطاً، '+Object.keys(m.accounts).length+' حساباً، '+m.notes.length+' ملاحظة، '+m.rules.length+' قاعدة'+(m.stats.from?' — من '+esc(m.stats.from)+' إلى '+esc(m.stats.to):'')+'.</p>';
}
function memoryTab(m){
  const pats=[...m.patterns].sort((a,b)=>b.count+b.confirmed-(a.count+a.confirmed));
  return '<div class="sk-kpis js-k">'+kpi("القيود المقروءة",m.stats.entries,m.stats.from?esc(m.stats.from)+" ← "+esc(m.stats.to):"")+kpi("الأنماط",m.patterns.length)+kpi("القواعد",m.rules.length,"من إجاباتك")+kpi("الملاحظات",m.notes.length,"من التقارير")+kpi("الحسابات",Object.keys(m.accounts).length)+'</div>'+
  '<section class="card"><div class="card-h"><div><h3>أنماط القيود</h3><p>كل نمط: الحسابات وجهتها ونسبتها المعتادة، والدفتر، وعدد مرات تكراره وتأكيدك له.</p></div><div class="sk-actions"><button type="button" class="btn sm" data-js="mprint">'+SK.icon("print")+' طباعة</button><button type="button" class="btn sm" data-js="export">تصدير</button><label class="btn sm" style="cursor:pointer">استيراد<input type="file" data-js-import accept=".json" hidden></label><button type="button" class="btn sm danger" data-js="clear">مسح الذاكرة</button></div></div><div class="card-b">'+
    (pats.length?'<div class="js-pats">'+pats.map(p=>'<article class="js-pat"><header><b>'+esc(p.title)+'</b><button type="button" class="btn sm" data-js-forget="'+esc(p.id)+'" aria-label="حذف النمط">×</button></header><small>'+esc(p.journal)+' · '+p.count+' مرة'+(p.confirmed?' · أكدته '+p.confirmed:'')+(p.vatRate?' · ض.ق.م '+Math.round(p.vatRate*1000)/10+'٪':'')+(p.source==="user"?' · علّمته أنت':'')+'</small>'+
      '<ul>'+p.legs.map(l=>'<li class="js-'+l.side+'"><span>'+(l.side==="D"?"من ح/":"إلى ح/")+'</span> <span class="mono">'+esc(l.account)+'</span> '+esc(l.name)+' <em>'+Math.round(l.share*100)+'٪</em></li>').join("")+'</ul>'+
      '<p class="js-words">'+Object.entries(p.words).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w])=>'<span>'+esc(w)+'</span>').join("")+'</p></article>').join("")+'</div>':'<p class="hint">الذاكرة فارغة.</p>')+'</div></section>'+
  (m.rules.length?'<section class="card"><div class="card-h"><div><h3>قواعد من إجاباتك</h3></div></div><div class="card-b"><ul class="js-list">'+m.rules.map(r=>'<li><span>«'+esc(r.example.slice(0,70))+'» ← '+esc((m.patterns.find(p=>p.id===r.patternId)||{}).title||r.patternId)+' <small>('+esc(r.words.join("، "))+')</small></span><button type="button" class="btn sm" data-js-forget="'+esc(r.id)+'" aria-label="حذف القاعدة">×</button></li>').join("")+'</ul></div></section>':'')+
  (m.notes.length?'<section class="card"><div class="card-h"><div><h3>من تقارير المدراء الماليين</h3></div></div><div class="card-b"><ul class="js-list">'+m.notes.map(n=>'<li><span>'+esc(n.text)+' <small>— '+esc(n.source)+(n.accounts.length?' · '+esc(n.accounts.join("، ")):'')+'</small></span><button type="button" class="btn sm" data-js-forget="'+esc(n.id)+'" aria-label="حذف الملاحظة">×</button></li>').join("")+'</ul></div></section>':'')+
  (m.log.length?'<section class="card"><div class="card-h"><div><h3>سجل التعلم</h3></div></div><div class="card-b"><ul class="js-log">'+m.log.slice(0,20).map(l=>'<li><small>'+esc(l.at.slice(0,16).replace("T"," "))+'</small> '+esc(l.what)+'</li>').join("")+'</ul></div></section>':'');
}
function printMemory(){
  const m=mem(),w=window.open("");if(!w)return toast("تعذر فتح المعاينة","bad");
  w.document.write('<html dir="rtl"><meta charset="utf-8"><title>ذاكرة محاكي القيود</title><body><h1>طريقة تسجيل القيود في الشركة</h1><p>'+m.stats.entries+' قيداً مقروءاً'+(m.stats.from?' من '+esc(m.stats.from)+' إلى '+esc(m.stats.to):'')+' · '+m.patterns.length+' نمطاً · بتاريخ '+today()+'</p>'+
    '<table><thead><tr><th>النمط</th><th>الدفتر</th><th>الحسابات</th><th>التكرار</th></tr></thead><tbody>'+[...m.patterns].sort((a,b)=>b.count-a.count).map(p=>'<tr><td>'+esc(p.title)+'</td><td>'+esc(p.journal)+'</td><td>'+p.legs.map(l=>(l.side==="D"?"من ح/ ":"إلى ح/ ")+esc(l.account+" "+l.name)+" ("+Math.round(l.share*100)+"٪)").join("<br>")+(p.vatRate?"<br>ض.ق.م "+Math.round(p.vatRate*1000)/10+"٪":"")+'</td><td>'+p.count+(p.confirmed?" + "+p.confirmed:"")+'</td></tr>').join("")+'</tbody></table>'+
    (m.notes.length?'<h2>من تقارير المدراء الماليين</h2><ul>'+m.notes.map(n=>'<li>'+esc(n.text)+'</li>').join("")+'</ul>':'')+'</body></html>');
  w.document.close();SK.brandPrint(w,"ذاكرة محاكي القيود");
}
function paint(){
  if(!root)return;const m=mem();if(!tab)tab=m.patterns.length?"suggest":"learn";
  root.innerHTML='<div class="js-shell"><div class="sk-seg" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-js-tab="'+k+'" aria-selected="'+(tab===k)+'">'+l+'</button>').join("")+'</div>'+
    (tab==="learn"?learnTab(m):tab==="memory"?memoryTab(m):suggestTab(m))+'</div>';
}

/* ---------- events ---------- */
function bind(el){
  el.addEventListener("click",async e=>{
    const t=e.target.closest("[data-js-tab]");if(t){tab=t.dataset.jsTab;paint();return}
    const pk=e.target.closest("[data-js-pick]");if(pk){teachWith(pk.dataset.jsPick);return}
    const fg=e.target.closest("[data-js-forget]");if(fg){if(!await SK.confirm("حذفه من الذاكرة؟",{danger:true,ok:"حذف"}))return;const m=mem();EL().forget(m,fg.dataset.jsForget);put(m);paint();return}
    const b=e.target.closest("[data-js]");if(!b)return;const a=b.dataset.js;
    if(a==="run")run();
    else if(a==="post")post();
    else if(a==="print")printVoucher();
    else if(a==="own"){edit=res&&res.lines.length?res.lines.map(l=>({...l})):[{account:"",name:"",debit:res&&res.doc.amount||"",credit:""},{account:"",name:"",debit:"",credit:res&&res.doc.amount||""}];paint();const x=root.querySelector(".js-edit");x&&x.scrollIntoView({behavior:"smooth",block:"start"})}
    else if(a==="add-line"){edit.push({account:"",name:"",debit:"",credit:""});paint()}
    else if(a==="rm-line"){edit.splice(+b.dataset.i,1);paint()}
    else if(a==="cancel-edit"){edit=null;paint()}
    else if(a==="teach-own")teachOwn();
    else if(a==="drop-attach"){attach=null;paint()}
    else if(a==="learn")learnPending();
    else if(a==="cancel-up"){pending=null;paint()}
    else if(a==="books")learnBooks();
    else if(a==="report"){const x=root.querySelector("[data-js-report]");addReport(x&&x.value,"تقرير ملصوق "+today())}
    else if(a==="mprint")printMemory();
    else if(a==="export"){const blob=new Blob([JSON.stringify(mem(),null,1)],{type:"application/json"}),u=URL.createObjectURL(blob),l=document.createElement("a");l.href=u;l.download="jesim-memory-"+today()+".json";l.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
    else if(a==="clear"){if(!await SK.confirm("مسح كل ما تعلمه المحاكي لهذه الشركة؟",{danger:true,ok:"مسح"}))return;put(EL().emptyMemory());res=null;tab="learn";paint()}
  });
  el.addEventListener("input",e=>{
    const x=e.target;
    if(x.dataset.jd&&x.dataset.jd!=="vatIncluded"&&x.dataset.jd!=="ai")doc[x.dataset.jd]=x.value;
    if(x.dataset.je&&edit){edit[+x.dataset.i][x.dataset.je]=x.value;if(x.dataset.je==="account"){const m=mem(),acc=m.accounts[x.value.trim()];if(acc){edit[+x.dataset.i].name=acc.name;const n=x.parentNode.querySelector('[data-je="name"]');if(n)n.value=acc.name}}}
  });
  el.addEventListener("change",async e=>{
    const x=e.target;
    if(x.dataset.jd==="vatIncluded"){doc.vatIncluded=x.checked;return}
    if(x.dataset.jd==="ai"){useAi=x.checked;return}
    if(x.matches("[data-js-col]")){pending.map[x.dataset.jsCol]=+x.value<0?undefined:+x.value;return}
    const f=x.files&&x.files[0];if(!f)return;
    if(x.matches("[data-js-file]"))readJournal(f).catch(err=>toast("تعذرت قراءة الملف: "+err.message,"bad"));
    else if(x.matches("[data-js-rfile]"))learnReportFile(f).catch(err=>toast("تعذرت قراءة التقرير: "+err.message,"bad"));
    else if(x.matches("[data-js-attach]")){attach={name:f.name,mime:mimeOf(f),data:String(await readAs(f,"url")).split(",")[1]};if(!aiReady())toast("المرفق يُقرأ بالذكاء الاصطناعي فقط — اكتب وصفه ومبلغه أيضاً","warn");paint()}
    else if(x.matches("[data-js-import]")){try{const m=JSON.parse(await readAs(f,"text"));if(!m||m.v!==1||!Array.isArray(m.patterns))throw new Error("ليس ملف ذاكرة محاكي القيود");put(m);toast("استُوردت الذاكرة: "+m.patterns.length+" نمطاً","ok");paint()}catch(err){toast(err.message,"bad")}}
    x.value="";
  });
}
function render(el){root=el;paint();bind(el)}
SK.view("jesim",{render});
/* for the assistant and other screens: the suggestion for a document, without opening the screen */
window.SKosifEntrySim=Object.freeze({memory:mem,suggest:(text,amount,o={})=>EL().suggest(mem(),{text:String(text||""),amount:Number(amount)||0,vatIncluded:o.vatIncluded!==false}),
  open:(text,amount)=>{doc={...doc,text:String(text||""),amount:amount?String(amount):""};tab="suggest";res=null;window.SKosifCore.go("jesim");if(text)setTimeout(run,0)}});
})();

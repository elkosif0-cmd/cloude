/* SQC — the journal simulator (محاكي القيود / فهم القيود), an accountant's helper.
   1 التعلّم   the journal entries of a period (a sheet, or the app's own books) and the finance manager's reports
               for the same period.
   2 الفهم     what was learned: the accounts and what each is for, the booking patterns and the recurring entries;
               with an AI key, a written explanation of how this company books.
   3 مستند جديد  any document (its text, or its image / PDF read by the AI) → the suggested entry, where it is
               recorded, what to do, why — and questions when it is not sure. The accountant corrects, confirms,
               and may post it to the books.
   4 الذاكرة   what was confirmed: each confirmed document is remembered and outweighs the history next time.
   The engine is SKEngines.finance.journalSim; everything stays with the company (skosif_jsim_v1). */
(()=>{
"use strict";
const {esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_jsim_v1";
const J=()=>SKEngines.finance.journalSim;
const n2=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0);
const TABS=[["learn","١ التعلّم"],["model","٢ الفهم"],["doc","٣ مستند جديد"],["memory","٤ الذاكرة"]];
const TYPE={cash:"asset",bank:"asset",receivable:"asset",inventory:"asset",asset:"asset",vat_in:"asset",payable:"liability",vat_out:"liability",vat:"liability",equity:"equity",revenue:"revenue",expense:"expense",payroll:"expense",other:"other"};
const KIND_AR={cash:"نقدية",bank:"بنك",receivable:"عملاء",payable:"موردون",vat_in:"ضريبة مدخلات",vat_out:"ضريبة مخرجات",vat:"ضريبة",revenue:"إيراد",expense:"مصروف",payroll:"رواتب",inventory:"مخزون",asset:"أصل",equity:"حقوق ملكية",other:"أخرى"};
let root=null,tab="learn",draft=null,pending=null,busy=false;

function st(){const d=load(KEY,{})||{};d.reports=Array.isArray(d.reports)?d.reports:[];d.memory=d.memory&&Array.isArray(d.memory.examples)?d.memory:{examples:[]};return d}
function put(d){try{save(KEY,d)}catch{toast("مساحة التخزين لا تكفي — احذف بعض التقارير","err")}}
const aiReady=()=>!!(window.SKosifAI&&SKosifAI.ready());
/* the AI writes light markdown: bold and bullets */
function md(t){return esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").split(/\n/).map(l=>/^\s*[*-]\s+/.test(l)?'<span class="js-li">'+l.replace(/^\s*[*-]\s+/,"")+"</span>":l).join("<br>").replace(/(<br>){2,}/g,"<br>")}
function aiText(res){const c=res&&res.candidates&&res.candidates[0],p=c&&c.content&&c.content.parts||[];return p.map(x=>x.text||"").join("").trim()}
function aiJson(res){const t=aiText(res).replace(/^```(?:json)?|```$/g,"").trim();try{return JSON.parse(t)}catch{const m=t.match(/\{[\s\S]*\}/);if(m)try{return JSON.parse(m[0])}catch{}}return null}

/* ---------- 1 learning ---------- */
async function readSheet(file){
  if(/\.xlsx$/i.test(file.name)&&window.SKXlsx)return SKXlsx.rows(file);
  const text=await file.text();const sep=text.split("\n")[0].includes("\t")?"\t":/;/.test(text.split("\n")[0])&&!/,/.test(text.split("\n")[0])?";":",";
  return text.split(/\r?\n/).map(line=>{const out=[];let cur="",q=false;for(const ch of line){if(ch==='"'){q=!q;continue}if(ch===sep&&!q){out.push(cur);cur="";continue}cur+=ch}out.push(cur);return out});
}
function fromLedger(){
  const L=window.SKosifLedger;if(!L)return[];const acc=new Map(L.accounts().map(a=>[a.id,a]));
  const out=[];L.entries().forEach(e=>(e.lines||[]).forEach(l=>{const a=acc.get(l.accountId)||{code:l.accountId,name:l.accountId};out.push({entry:e.id,date:String(e.date||"").slice(0,10),code:String(a.code),name:a.name,debit:Number(l.debit)||0,credit:Number(l.credit)||0,memo:e.memo||e.reference||"",party:e.party||""})}));
  return out;
}
function learnFrom(lines,sourceName){
  const d=st();const from=(root.querySelector("[data-js-from]")||{}).value||"",to=(root.querySelector("[data-js-to]")||{}).value||"";
  const m=J().learn(lines,{from,to});
  if(!m.entries){toast("لا قيود في الفترة المختارة","warn");return}
  d.model=m;d.source={name:sourceName,lines:m.lines,at:new Date().toISOString()};d.from=from;d.to=to;put(d);
  toast("تعلّمت "+m.entries+" قيداً و"+m.patterns.length+" نمط تسجيل","ok");tab="model";paint();
}
function learnHtml(d){
  return'<section class="card js-card"><h3>القيود اليومية للفترة</h3><p class="muted">ملف Excel أو CSV فيه سطر لكل طرف من القيد: رقم القيد، التاريخ، رمز الحساب، اسم الحساب، مدين، دائن، البيان (والطرف إن وجد). أو استخدم قيود الدفاتر المسجلة في التطبيق.</p>'+
    '<div class="js-row"><label class="sk-field"><span>من</span><input type="date" data-js-from value="'+esc(d.from||"")+'"></label><label class="sk-field"><span>إلى</span><input type="date" data-js-to value="'+esc(d.to||"")+'"></label></div>'+
    '<div class="js-row"><label class="btn primary js-file">'+SK.icon("exports")+' ارفع ملف القيود<input type="file" accept=".xlsx,.csv,.tsv,.txt" data-js-journal hidden></label><button type="button" class="btn" data-js-ledger>'+SK.icon("ledger")+' من دفاتر التطبيق</button><button type="button" class="btn ghost" data-js-sample>ملف نموذجي</button></div>'+
    (d.source?'<p class="js-ok">آخر تعلّم: '+esc(d.source.name)+' — '+d.source.lines+' سطراً · '+esc(d.source.at.slice(0,10))+'</p>':'')+'</section>'+
    '<section class="card js-card"><h3>تقارير المدير المالي عن نفس الفترة</h3><p class="muted">التقارير الشهرية أو الإقفالات أو السياسات المحاسبية: تساعد الذكاء الاصطناعي على فهم آلية العمل (الاستحقاقات، التوزيع على مراكز التكلفة…). ارفع ملفاً نصياً أو Excel، أو الصق النص.</p>'+
    '<div class="js-row"><label class="btn js-file">'+SK.icon("reports")+' ارفع تقريراً<input type="file" accept=".txt,.md,.csv,.xlsx,.json" data-js-report hidden></label></div>'+
    '<label class="sk-field"><span>أو الصق نص التقرير</span><textarea rows="4" data-js-report-text placeholder="مثال: تُسجّل مصروفات الكهرباء كمستحقات في آخر الشهر وتُسدد في الشهر التالي…"></textarea></label><button type="button" class="btn sm" data-js-add-report>أضف النص</button>'+
    (d.reports.length?'<ul class="js-reports">'+d.reports.map((r,i)=>'<li><b>'+esc(r.name)+'</b><small>'+n2(r.text.length/1000).replace(/\.00$/,"")+' ألف حرف · '+esc(r.at.slice(0,10))+'</small><button type="button" class="linkish" data-js-drop-report="'+i+'">حذف</button></li>').join("")+'</ul>':'')+'</section>';
}

/* ---------- 2 the model ---------- */
function modelHtml(d){
  const m=d.model;if(!m)return'<section class="card js-card"><p class="muted">لم أتعلم بعد — ابدأ من «التعلّم».</p></section>';
  const k=(l,v)=>'<div class="js-k"><small>'+l+'</small><b>'+v+'</b></div>';
  const byKind={};m.accounts.forEach(a=>{(byKind[a.kind]=byKind[a.kind]||[]).push(a)});
  return'<div class="js-kpis">'+k("الفترة",esc(m.from)+" ← "+esc(m.to))+k("القيود",m.entries)+k("السطور",m.lines)+k("الحسابات",m.accounts.length)+k("أنماط التسجيل",m.patterns.length)+k("قيود متكررة",m.recurring.length)+(m.unbalanced.length?k("قيود غير متزنة",'<span class="bad">'+m.unbalanced.length+'</span>'):"")+'</div>'+
    '<section class="card js-card"><h3>آلية العمل كما فهمتها</h3>'+(d.understanding?'<div class="js-under">'+md(d.understanding.text)+'</div><p class="muted sm">كُتب '+esc(d.understanding.at.slice(0,10))+'</p>':'<p class="muted">اطلب من الذكاء الاصطناعي شرح طريقة الشركة في التسجيل من القيود والتقارير.</p>')+
      '<button type="button" class="btn primary sm" data-js-understand'+(aiReady()?'':' disabled')+'>'+SK.icon("jev")+' '+(d.understanding?"أعد الفهم":"افهم آلية العمل")+'</button>'+(aiReady()?'':'<p class="muted sm">يحتاج مفتاح الذكاء الاصطناعي — أضفه من الإعدادات. الاقتراحات تعمل بدونه من الأنماط.</p>')+'</section>'+
    '<section class="card js-card"><h3>أنماط التسجيل</h3><div class="sk-table-wrap"><table class="sk-table" data-sk-plain><thead><tr><th>النوع</th><th>الدفتر</th><th>مرات</th><th>متوسط المبلغ</th><th>الحسابات</th><th>كلمات تميّزه</th></tr></thead><tbody>'+
      m.patterns.slice(0,40).map(p=>'<tr><td><b>'+esc(p.label)+'</b>'+(p.vat?' <span class="sk-pill">ضريبة</span>':'')+'</td><td>'+esc(J().BOOK_AR[p.book])+'</td><td class="n">'+p.count+'</td><td class="n">'+n2(p.total/p.count)+'</td><td class="js-acc">مدين: '+p.debit.map(x=>esc(x.code)).join("، ")+'<br>دائن: '+p.credit.map(x=>esc(x.code)).join("، ")+'</td><td>'+Object.entries(p.tokens).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>esc(x[0])).join("، ")+'</td></tr>').join("")+'</tbody></table></div></section>'+
    '<section class="card js-card"><h3>الحسابات وما تُستخدم له</h3><div class="js-kinds">'+Object.entries(byKind).map(([kd,L])=>'<div><h4>'+esc(KIND_AR[kd]||kd)+'</h4><ul>'+L.map(a=>'<li><span dir="ltr">'+esc(a.code)+'</span> '+esc(a.name)+'</li>').join("")+'</ul></div>').join("")+'</div></section>';
}
async function understand(){
  const d=st();if(!d.model||!aiReady())return;busy=true;paint();
  try{
    const rep=d.reports.map(r=>"### "+r.name+"\n"+r.text.slice(0,12000)).join("\n\n").slice(0,30000);
    const res=await SKosifAI.generate({systemInstruction:{parts:[{text:"أنت محاسب قانوني سعودي خبير. اشرح بالعربية الفصحى المختصرة، في نقاط، كيف تسجل هذه الشركة عملياتها: الدورات (مشتريات، مبيعات، رواتب، مصروفات، أصول)، الحسابات المستخدمة لكل دورة، معالجة ضريبة القيمة المضافة، الاستحقاقات والإقفالات الشهرية، وأي ملاحظات أو مخاطر (قيود غير معتادة، حسابات غامضة). لا تخترع حسابات غير موجودة."}]},
      contents:[{role:"user",parts:[{text:J().describe(d.model)+(rep?"\n\nتقارير المدير المالي:\n"+rep:"")}]}],generationConfig:{temperature:0.2}},{timeout:120000});
    const text=aiText(res);if(!text)throw new Error("لم يصل رد من الذكاء الاصطناعي");
    d.understanding={text,at:new Date().toISOString()};put(d);toast("فهمت آلية العمل","ok");
  }catch(e){toast(e.message||String(e),"err")}
  busy=false;paint();
}

/* ---------- 3 a new document ---------- */
function accOptions(d,code){const L=(d.model?d.model.accounts:[]);return'<option value="">— اختر الحساب —</option>'+L.map(a=>'<option value="'+esc(a.code)+'"'+(a.code===code?' selected':'')+'>'+esc(a.code+" · "+a.name)+'</option>').join("")+(code&&!L.some(a=>a.code===code)?'<option value="'+esc(code)+'" selected>'+esc(code)+'</option>':'')}
function docHtml(d){
  if(!d.model)return'<section class="card js-card"><p class="muted">تعلّم القيود أولاً من «التعلّم».</p></section>';
  const doc=pending||{};
  let h='<section class="card js-card"><h3>المستند</h3><label class="sk-field"><span>نص المستند (الصقه، أو ارفع صورة/PDF ليقرأه الذكاء الاصطناعي)</span><textarea rows="5" data-js-doc placeholder="مثال: فاتورة ضريبية من مؤسسة المراعي الذهبية — لحوم طازجة — الإجمالي 11,500 شامل الضريبة — آجل 30 يوماً">'+esc(doc.text||"")+'</textarea></label>'+
    '<div class="js-row"><label class="btn sm js-file">'+SK.icon("scanner")+' صورة أو PDF<input type="file" accept="image/*,application/pdf" data-js-docfile hidden></label>'+(aiReady()?'':'<small class="muted">قراءة الصور تحتاج مفتاح الذكاء الاصطناعي</small>')+'</div>'+
    '<div class="js-grid"><label class="sk-field"><span>المبلغ</span><input type="number" step="any" min="0" data-js-amount value="'+esc(doc.amount||"")+'"></label><label class="sk-field"><span>التاريخ</span><input type="date" data-js-date value="'+esc(doc.date||"")+'"></label>'+
    '<label class="sk-field"><span>الطرف</span><input data-js-party value="'+esc(doc.party||"")+'"></label><label class="sk-field"><span>الضريبة</span><select data-js-vat>'+[["unknown","يُستنتج من النص"],["incl","شامل الضريبة"],["excl","قبل الضريبة"],["none","بدون ضريبة"]].map(([v,l])=>'<option value="'+v+'"'+((doc.vat||"unknown")===v?' selected':'')+'>'+l+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>السداد</span><select data-js-method>'+[["","يُستنتج من النص"],["cash","نقداً"],["bank","بنك / بطاقة / شيك"],["credit","آجل"]].map(([v,l])=>'<option value="'+v+'"'+((doc.method||"")===v?' selected':'')+'>'+l+'</option>').join("")+'</select></label></div>'+
    '<div class="js-row"><button type="button" class="btn primary" data-js-suggest>'+SK.icon("decision")+' اقترح القيد</button>'+(aiReady()?'<button type="button" class="btn" data-js-ai>'+SK.icon("jev")+' اسأل الذكاء الاصطناعي</button>':'')+'</div></section>';
  if(draft){const s=draft,dr=s.lines.reduce((t,l)=>t+(Number(l.debit)||0),0),cr=s.lines.reduce((t,l)=>t+(Number(l.credit)||0),0),bal=Math.abs(dr-cr)<0.005;
    const pc=Math.round(s.confidence*100),cls=pc>=75?"good":pc>=55?"mid":"low";
    h+='<section class="card js-card js-sug"><div class="js-sug-h"><h3>القيد المقترح'+(s.label?' — '+esc(s.label):'')+'</h3><div class="js-conf '+cls+'" title="درجة الثقة"><i style="width:'+pc+'%"></i><span>الثقة '+pc+'٪'+(s.source==="memory"?" · من ذاكرتك":s.source==="ai"?" · بمساعدة الذكاء الاصطناعي":"")+'</span></div></div>'+
      (s.questions&&s.questions.length?'<div class="js-qs">'+s.questions.map(q=>'<div class="js-q"><b>'+esc(q.text)+'</b>'+(q.options?'<div class="js-chips">'+q.options.map(o=>'<button type="button" data-js-ans="'+esc(q.id)+'" data-v="'+esc(o.value)+'">'+esc(o.label)+'</button>').join("")+'</div>':q.id==="amount"?'<div class="js-chips"><input type="number" step="any" min="0" data-js-ans-amount placeholder="المبلغ"><button type="button" data-js-ans="amount">تم</button></div>':'')+'</div>').join("")+'</div>':'')+
      '<div class="sk-table-wrap"><table class="sk-table js-lines" data-sk-plain><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th><th></th></tr></thead><tbody>'+
      s.lines.map((l,i)=>'<tr><td><select data-js-l="'+i+'" data-f="code">'+accOptions(d,l.code)+'</select></td><td><input type="number" step="any" min="0" data-js-l="'+i+'" data-f="debit" value="'+(l.debit||"")+'"></td><td><input type="number" step="any" min="0" data-js-l="'+i+'" data-f="credit" value="'+(l.credit||"")+'"></td><td><button type="button" class="linkish" data-js-del="'+i+'" aria-label="حذف السطر">×</button></td></tr>').join("")+
      '</tbody><tfoot><tr><th><button type="button" class="linkish" data-js-addline>+ سطر</button></th><th class="n">'+n2(dr)+'</th><th class="n">'+n2(cr)+'</th><th>'+(bal?'<span class="sk-pill good">متزن</span>':'<span class="sk-pill bad">غير متزن</span>')+'</th></tr></tfoot></table></div>'+
      (s.where?'<p class="js-where"><b>أين يُسجّل:</b> '+esc(s.where)+'</p>':'')+
      (s.steps&&s.steps.length?'<h4>ماذا تفعل</h4><ol class="js-steps">'+s.steps.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>':'')+
      (s.why&&s.why.length?'<h4>لماذا هذا القيد</h4><ul class="js-why">'+s.why.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':'')+
      (s.alternatives&&s.alternatives.length?'<p class="js-alt">أو ربما: '+s.alternatives.map(a=>'<button type="button" class="linkish" data-js-force="'+esc(a.sig)+'">'+esc(a.label)+'</button>').join(" · ")+'</p>':'')+
      '<div class="js-row js-final"><button type="button" class="btn primary" data-js-accept'+(bal&&s.lines.length>=2?'':' disabled')+'>اعتمد وتعلّم</button><button type="button" class="btn" data-js-post'+(bal&&s.lines.length>=2&&window.SKosifLedger?'':' disabled')+'>اعتمد ورحّل إلى الدفاتر</button></div></section>';}
  return h;
}
function readDoc(){const q=s=>root.querySelector(s);const a=Number(q("[data-js-amount]").value);
  pending={...(pending||{}),text:q("[data-js-doc]").value,amount:a>0?a:undefined,date:q("[data-js-date]").value||undefined,party:q("[data-js-party]").value.trim()||undefined,vat:q("[data-js-vat]").value,method:q("[data-js-method]").value};return pending}
function runSuggest(){
  const d=st(),doc=readDoc();if(!String(doc.text||"").trim()&&!doc.amount){toast("اكتب نص المستند أو مبلغه","warn");return}
  const s=J().suggest(d.model,doc,d.memory);
  if(!doc.date&&s.extracted.date)pending.date=s.extracted.date;if(!doc.party&&s.extracted.party)pending.party=s.extracted.party;if(!doc.amount&&s.extracted.amount)pending.amount=s.extracted.amount;
  draft={...s,lines:s.lines.map(l=>({...l}))};paint();
}
async function askAI(){
  const d=st();readDoc();if(!aiReady()||!d.model)return;if(!draft)runSuggest();if(!draft)return;busy=true;paint();
  try{
    const ex=d.memory.examples.slice(0,12).map(e=>"- "+e.label+" · "+(e.party||"")+" · كلمات: "+e.tokens.slice(0,8).join(" ")).join("\n");
    const prompt=J().describe(d.model)+(d.understanding?"\n\nآلية العمل:\n"+d.understanding.text.slice(0,4000):"")+(ex?"\n\nأمثلة اعتمدها المحاسب:\n"+ex:"")+
      "\n\nالمستند:\n"+(pending.text||"")+"\nالمبلغ: "+(pending.amount||"غير محدد")+" · الطرف: "+(pending.party||"")+" · الضريبة: "+(pending.vat||"")+" · السداد: "+(pending.method||"")+
      "\n\nاقتراح النظام المحلي: "+JSON.stringify(draft.lines)+"\n\nأعد JSON فقط: {\"lines\":[{\"code\":\"رمز من الحسابات أعلاه\",\"debit\":0,\"credit\":0}],\"where\":\"أين يُسجّل\",\"steps\":[\"...\"],\"questions\":[\"سؤال للمحاسب إن لم تكن متأكداً\"],\"confidence\":0.0,\"reason\":\"لماذا\"}. استخدم الحسابات الموجودة فقط؛ إن احتجت حساباً غير موجود فاذكره في questions.";
    const res=await SKosifAI.generate({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.1,responseMimeType:"application/json"}},{timeout:90000});
    const j=aiJson(res);if(!j||!Array.isArray(j.lines))throw new Error("لم أفهم رد الذكاء الاصطناعي");
    const names=new Map(d.model.accounts.map(a=>[a.code,a.name]));
    const lines=j.lines.filter(l=>l&&l.code&&(Number(l.debit)||Number(l.credit))).map(l=>({code:String(l.code),name:names.get(String(l.code))||String(l.code),debit:Math.round((Number(l.debit)||0)*100)/100,credit:Math.round((Number(l.credit)||0)*100)/100}));
    draft={...draft,lines:lines.length>=2?lines:draft.lines,where:j.where||draft.where,steps:Array.isArray(j.steps)&&j.steps.length?j.steps.map(String):draft.steps,
      why:[...(j.reason?[String(j.reason)]:[]),...draft.why],confidence:Math.max(0,Math.min(1,Number(j.confidence)||draft.confidence)),source:"ai",
      questions:[...draft.questions,...(Array.isArray(j.questions)?j.questions.filter(Boolean).map(q=>({id:"ai",text:String(q)})):[])]};
  }catch(e){toast(e.message||String(e),"err")}
  busy=false;paint();
}
async function readFile(file){
  if(!aiReady()){toast("قراءة الصور وملفات PDF تحتاج مفتاح الذكاء الاصطناعي — الصق النص بدلاً منها","warn");return}
  if(file.size>8*1024*1024){toast("الملف أكبر من 8 ميجابايت","warn");return}
  busy=true;paint();
  try{
    const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(",")[1]);r.onerror=rej;r.readAsDataURL(file)});
    const res=await SKosifAI.generate({contents:[{role:"user",parts:[{inlineData:{mimeType:file.type||"application/pdf",data:b64}},{text:"اقرأ هذا المستند المحاسبي وأعد JSON فقط: {\"text\":\"نص المستند كاملاً بالعربية كما هو\",\"amount\":الإجمالي رقماً,\"date\":\"YYYY-MM-DD\",\"party\":\"اسم المورد أو العميل\",\"vat\":\"incl|excl|none|unknown\",\"method\":\"cash|bank|credit|\"}"}]}],generationConfig:{temperature:0,responseMimeType:"application/json"}},{timeout:120000});
    const j=aiJson(res);if(!j)throw new Error("لم أستطع قراءة المستند");
    pending={text:String(j.text||""),amount:Number(j.amount)>0?Number(j.amount):undefined,date:j.date||undefined,party:j.party||undefined,vat:["incl","excl","none"].includes(j.vat)?j.vat:"unknown",method:["cash","bank","credit"].includes(j.method)?j.method:"",file:file.name};
    toast("قُرئ المستند","ok");busy=false;paint();runSuggest();return;
  }catch(e){toast(e.message||String(e),"err")}
  busy=false;paint();
}
function accept(post){
  const d=st();if(!draft)return;const lines=draft.lines.filter(l=>l.code&&(Number(l.debit)||Number(l.credit)));
  d.memory=J().remember(d.memory,pending||{text:""},{sig:draft.sig,label:draft.label,book:draft.book,lines},d.model);
  (d.history=d.history||[]).unshift({at:new Date().toISOString(),text:String((pending||{}).text||"").slice(0,200),label:draft.label,lines,posted:false});d.history=d.history.slice(0,100);
  if(post){
    try{const L=window.SKosifLedger,acc=new Map(d.model.accounts.map(a=>[a.code,a]));
      const ids=lines.map(l=>{const a=acc.get(l.code)||{code:l.code,name:l.name,kind:J().accountKind(l.code,l.name)};return L.ensureAccount({code:a.code,name:a.name,type:TYPE[a.kind]||"other"})});
      const id=L.post({date:(pending&&pending.date)||new Date().toISOString().slice(0,10),reference:(pending&&pending.file)||"",memo:String((pending&&pending.text)||draft.label||"").split("\n")[0].slice(0,120),source:"محاكي القيود",
        lines:lines.map((l,i)=>({accountId:ids[i],debit:l.debit,credit:l.credit}))});
      d.history[0].posted=id;toast("اعتُمد ورُحّل إلى الدفاتر وتعلّمته","ok");
    }catch(e){put(d);toast("تعلّمته، لكن لم يُرحّل: "+(e.message||e),"err");draft=null;paint();return}
  }else toast("اعتُمد — سأتذكر هذا النوع من المستندات","ok");
  put(d);draft=null;pending=null;paint();
}

/* ---------- 4 memory ---------- */
function memoryHtml(d){
  const ex=d.memory.examples;
  return'<section class="card js-card"><h3>ما تعلّمته من اعتماداتك ('+ex.length+')</h3>'+(ex.length?'<div class="sk-table-wrap"><table class="sk-table" data-sk-plain><thead><tr><th>التاريخ</th><th>النوع</th><th>الطرف</th><th>المبلغ</th><th>كلمات</th><th></th></tr></thead><tbody>'+
    ex.map((e,i)=>'<tr><td class="n">'+esc(e.at.slice(0,10))+'</td><td>'+esc(e.label)+'</td><td>'+esc(e.party||"—")+'</td><td class="n">'+n2(e.amount)+'</td><td>'+e.tokens.slice(0,6).map(esc).join("، ")+'</td><td><button type="button" class="linkish" data-js-forget="'+i+'">انسَ</button></td></tr>').join("")+'</tbody></table></div>':'<p class="muted">لا شيء بعد — كل مستند تعتمده يُضاف هنا ويُقدَّم على الأنماط القديمة.</p>')+'</section>'+
    ((d.history||[]).length?'<section class="card js-card"><h3>آخر المستندات</h3><ul class="js-hist">'+d.history.slice(0,20).map(h=>'<li><b>'+esc(h.label||"—")+'</b> <small>'+esc(h.at.slice(0,16).replace("T"," "))+(h.posted?' · رُحّل':'')+'</small><br><small class="muted">'+esc(h.text)+'</small></li>').join("")+'</ul></section>':'')+
    '<section class="card js-card"><h3>البدء من جديد</h3><p class="muted">يمسح النموذج والذاكرة والتقارير لهذه الشركة.</p><button type="button" class="btn danger sm" data-js-reset>امسح كل ما تعلّمته</button></section>';
}

/* ---------- screen ---------- */
function paint(){
  if(!root)return;const d=st();
  root.innerHTML='<div class="js">'+(busy?'<p class="js-busy" role="status">جارٍ العمل…</p>':'')+'<nav class="js-tabs" role="tablist">'+TABS.map(([k,l])=>'<button type="button" role="tab" data-js-tab="'+k+'" aria-selected="'+(k===tab)+'">'+l+(k==="memory"&&d.memory.examples.length?' <i>'+d.memory.examples.length+'</i>':'')+'</button>').join("")+'</nav>'+
    (tab==="learn"?learnHtml(d):tab==="model"?modelHtml(d):tab==="doc"?docHtml(d):memoryHtml(d))+'</div>';
}
const SAMPLE="رقم القيد,التاريخ,رمز الحساب,اسم الحساب,مدين,دائن,البيان,الطرف\n1,2026-01-01,5100,مصروف الإيجار,5000,,إيجار المحل لشهر يناير,مكتب العقار\n1,2026-01-01,1110,البنك,,5000,إيجار المحل لشهر يناير,مكتب العقار\n2,2026-01-05,1300,المخزون,10000,,فاتورة شراء لحوم,مؤسسة المراعي\n2,2026-01-05,1410,ضريبة المدخلات,1500,,فاتورة شراء لحوم,مؤسسة المراعي\n2,2026-01-05,2100,الموردون,,11500,فاتورة شراء لحوم,مؤسسة المراعي\n";
function render(el){
  root=el;
  if(!el.__js){el.__js=true;
    el.addEventListener("click",e=>{
      const t=e.target;
      const tb=t.closest("[data-js-tab]");if(tb){tab=tb.dataset.jsTab;paint();return}
      if(t.closest("[data-js-ledger]")){const L=fromLedger();if(!L.length){toast("لا قيود في دفاتر التطبيق","warn");return}learnFrom(L,"دفاتر التطبيق");return}
      if(t.closest("[data-js-sample]")){SK.download("قيود-نموذج.csv",new Blob(["﻿"+SAMPLE],{type:"text/csv"}));return}
      if(t.closest("[data-js-add-report]")){const ta=root.querySelector("[data-js-report-text]"),v=ta.value.trim();if(!v)return;const d=st();d.reports.push({name:"نص ملصق "+(d.reports.length+1),text:v.slice(0,40000),at:new Date().toISOString()});put(d);paint();return}
      const dr=t.closest("[data-js-drop-report]");if(dr){const d=st();d.reports.splice(+dr.dataset.jsDropReport,1);put(d);paint();return}
      if(t.closest("[data-js-understand]"))return understand();
      if(t.closest("[data-js-suggest]"))return runSuggest();
      if(t.closest("[data-js-ai]"))return askAI();
      const an=t.closest("[data-js-ans]");if(an){readDoc();const id=an.dataset.jsAns;
        if(id==="kind")pending.sig=an.dataset.v;else if(id==="vat")pending.vat=an.dataset.v;else if(id==="method")pending.method=an.dataset.v;
        else if(id==="amount"){const v=Number((root.querySelector("[data-js-ans-amount]")||{}).value);if(v>0)pending.amount=v}
        paint();runSuggest();return}
      const fo=t.closest("[data-js-force]");if(fo){readDoc();pending.sig=fo.dataset.jsForce;runSuggest();return}
      const dl=t.closest("[data-js-del]");if(dl&&draft){draft.lines.splice(+dl.dataset.jsDel,1);paint();return}
      if(t.closest("[data-js-addline]")&&draft){draft.lines.push({code:"",name:"",debit:0,credit:0});paint();return}
      if(t.closest("[data-js-accept]"))return accept(false);
      if(t.closest("[data-js-post]"))return accept(true);
      const fg=t.closest("[data-js-forget]");if(fg){const d=st();d.memory.examples.splice(+fg.dataset.jsForget,1);put(d);paint();return}
      if(t.closest("[data-js-reset]")){SK.confirm("مسح النموذج والذاكرة والتقارير لهذه الشركة؟",{title:"البدء من جديد",danger:true,ok:"امسح"}).then(ok=>{if(ok){save(KEY,{});draft=null;pending=null;tab="learn";paint()}})}
    });
    el.addEventListener("change",async e=>{
      const t=e.target;
      if(t.matches("[data-js-journal]")&&t.files[0]){try{const rows=await readSheet(t.files[0]);const p=J().parseJournal(rows);if(p.issues.length&&!p.lines.length){toast(p.issues.join(" · "),"err");return}if(p.issues.length)toast(p.issues.join(" · "),"warn");learnFrom(p.lines,t.files[0].name)}catch(err){toast(err.message||String(err),"err")}return}
      if(t.matches("[data-js-report]")&&t.files[0]){const f=t.files[0];let text="";try{text=/\.xlsx$/i.test(f.name)&&window.SKXlsx?(await SKXlsx.rows(f)).map(r=>r.join(" | ")).join("\n"):await f.text()}catch{}if(!text.trim()){toast("تعذر قراءة الملف — الصق نصه بدلاً منه","warn");return}
        const d=st();d.reports.push({name:f.name,text:text.slice(0,40000),at:new Date().toISOString()});put(d);toast("أُضيف التقرير","ok");paint();return}
      if(t.matches("[data-js-docfile]")&&t.files[0]){readDoc();return readFile(t.files[0])}
      const l=t.closest("[data-js-l]");if(l&&draft){const i=+l.dataset.jsL,f=l.dataset.f,line=draft.lines[i];if(!line)return;
        if(f==="code"){line.code=l.value;const a=(st().model.accounts||[]).find(x=>x.code===l.value);line.name=a?a.name:l.value}else{line[f]=Math.round((Number(l.value)||0)*100)/100;if(line[f])line[f==="debit"?"credit":"debit"]=0}
        paint();}
    });
  }
  paint();
}
window.SKosifJournalSim=Object.freeze({learnLedger:()=>{const L=fromLedger();if(L.length){const d=st();const m=J().learn(L,{});d.model=m;d.source={name:"دفاتر التطبيق",lines:m.lines,at:new Date().toISOString()};put(d)}return L.length},
  suggest:(text,o={})=>{const d=st();return d.model?J().suggest(d.model,{text,...o},d.memory):null},open:t=>{tab=t||"doc";core()&&core().go("jsim")}});
SK.view("jsim",{render});
})();

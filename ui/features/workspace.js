/* S.kosif — شاشات مساحة العمل: الشركات والفترات، مجلس القرار، مركز التصدير، المهام.
   المحركات: SKEngines.system.companyContext، SKEngines.intelligence.council. */
(()=>{
"use strict";
const {$,$$,esc,load,save,money,toast}=SK;
const today=()=>new Date().toISOString().slice(0,10);

/* ================= الشركات والفترات المالية ================= */
const CO="skosif_companies_v1";
const co=()=>{const d=load(CO,{});return{companies:d.companies||[],periods:d.periods||[],active:d.active||{}}};
function companiesPaint(root){
  const d=co(),C=window.SKEngines.system.companyContext,ctx=C.selectCompany(d.companies,d.periods,d.active.companyId||"",d.active.periodId);
  root.innerHTML='<section class="card"><div class="card-h"><div><h3>الشركة والفترة النشطة</h3><p>الدفاتر المحاسبية تعرض القيود داخل الفترة النشطة فقط.</p></div></div><div class="card-b sk-stack">'+
    (ctx.company?'<div class="sk-kpis"><div class="sk-kpi accent"><span>الشركة</span><b>'+esc(ctx.company.name)+'</b><small>'+esc(ctx.company.currency)+'</small></div><div class="sk-kpi"><span>الفترة</span><b>'+esc(ctx.period?ctx.period.label:"كل الفترات")+'</b><small>'+esc(ctx.period?ctx.period.startDate+" → "+ctx.period.endDate:"")+'</small></div></div>':'<div class="sk-note">لم تُحدَّد شركة بعد — أضف شركتك ثم فترة مالية.</div>')+
  '</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>الشركات</h3></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>اسم الشركة</span><input id="co-name" data-sk-required value="'+esc((document.getElementById("biz-name")||{}).textContent||"")+'"></label><label class="sk-field"><span>العملة</span><select id="co-cur"><option>SAR</option><option>USD</option><option>AED</option><option>EGP</option></select></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-w="add-co">إضافة شركة</button></div>'+
    (d.companies.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الشركة</th><th>العملة</th><th></th></tr></thead><tbody>'+d.companies.map(c=>'<tr><td>'+esc(c.name)+'</td><td>'+esc(c.currency)+'</td><td>'+(c.id===d.active.companyId?'<span class="sk-pill good">نشطة</span>':'<button type="button" class="linkish" data-w="use-co" data-id="'+esc(c.id)+'">تفعيل</button>')+'</td></tr>').join("")+'</tbody></table></div>':'')+
  '</div></section>'+
  (ctx.company?'<section class="card"><div class="card-h"><div><h3>الفترات المالية — '+esc(ctx.company.name)+'</h3></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>اسم الفترة</span><input id="pe-label" placeholder="مثال: 2026" data-sk-required></label><label class="sk-field"><span>من</span><input type="date" id="pe-from" value="'+new Date().getFullYear()+'-01-01"></label><label class="sk-field"><span>إلى</span><input type="date" id="pe-to" value="'+new Date().getFullYear()+'-12-31"></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-w="add-pe">إضافة فترة</button><button type="button" class="btn" data-w="all-pe">كل الفترات</button></div>'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الفترة</th><th>من</th><th>إلى</th><th></th></tr></thead><tbody>'+d.periods.filter(p=>p.companyId===ctx.company.id).map(p=>'<tr><td>'+esc(p.label)+'</td><td class="n">'+esc(p.startDate)+'</td><td class="n">'+esc(p.endDate)+'</td><td>'+(p.id===d.active.periodId?'<span class="sk-pill good">نشطة</span>':'<button type="button" class="linkish" data-w="use-pe" data-id="'+esc(p.id)+'">تفعيل</button>')+'</td></tr>').join("")+'</tbody></table></div></div></section>':'');
}
function companiesBind(root){
  root.addEventListener("click",e=>{
    const b=e.target.closest("[data-w]");if(!b)return;const a=b.dataset.w,d=co();
    if(a==="add-co"){if(!SK.ui.validate(root))return;const c={id:SK.ui.uid("co"),name:$("#co-name",root).value.trim(),country:"SA",currency:$("#co-cur",root).value};d.companies.push(c);if(!d.active.companyId)d.active={companyId:c.id}}
    else if(a==="use-co")d.active={companyId:b.dataset.id};
    else if(a==="add-pe"){if(!SK.ui.validate(root))return;const p={id:SK.ui.uid("pe"),companyId:d.active.companyId,label:$("#pe-label",root).value.trim(),startDate:$("#pe-from",root).value,endDate:$("#pe-to",root).value};
      if(!window.SKEngines.system.companyContext.validatePeriod(p))return toast("تاريخ البداية يجب أن يسبق النهاية","warn");d.periods.push(p);d.active.periodId=p.id}
    else if(a==="use-pe")d.active.periodId=b.dataset.id;
    else if(a==="all-pe")delete d.active.periodId;
    save(CO,d);companiesPaint(root);
  });
}
SK.view("companies",{render(n){if(!n.dataset.bound){companiesBind(n);n.dataset.bound="1"}companiesPaint(n)}});

/* ================= مجلس القرار ================= */
const CN="skosif_council_v1";
let caseId="";
const cn=()=>{const d=load(CN,{});return{cases:d.cases||[]}};
function councilPaint(root){
  const d=cn(),c=d.cases.find(x=>x.id===caseId)||d.cases[d.cases.length-1];
  const res=c?window.SKEngines.intelligence.council.resolveCouncil(c.votes):null;
  const optLabel=id=>(c&&c.options.find(o=>o.id===id)||{}).label||id;
  root.innerHTML='<section class="card"><div class="card-h"><div><h3>قضية جديدة</h3><p>سؤال وخيارات، ثم أصوات من أكثر من مصدر (أنت، شريكك، المحاسب، Jev) بدرجة ثقة لكل صوت.</p></div></div><div class="card-b sk-stack">'+
    '<label class="sk-field"><span>السؤال</span><input id="cn-q" placeholder="مثال: هل نرفع سعر ريش النعيمي هذا الأسبوع؟" data-sk-required></label>'+
    '<label class="sk-field"><span>الخيارات (خيار في كل سطر)</span><textarea id="cn-opts" rows="3" data-sk-required>نعم\nلا\nنؤجل أسبوعاً</textarea></label>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-c="new">إنشاء القضية</button></div></div></section>'+
  (c?'<section class="card"><div class="card-h"><div><h3>'+esc(c.question)+'</h3><p>'+c.votes.length+' صوتاً</p></div>'+(d.cases.length>1?'<select id="cn-case">'+d.cases.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===c.id?" selected":"")+'>'+esc(x.question.slice(0,50))+'</option>').join("")+'</select>':'')+'</div><div class="card-b sk-stack">'+
    (res&&c.votes.length?'<div class="sk-kpis"><div class="sk-kpi '+(res.tied?"warn":"good")+'"><span>القرار</span><b>'+esc(res.tied?"تعادل — يحتاج صوتاً مرجحاً":optLabel(res.winningOptionId))+'</b></div><div class="sk-kpi"><span>نسبة الاتفاق</span><b>'+res.agreementPercent+'٪</b></div><div class="sk-kpi"><span>متوسط الثقة</span><b>'+Math.round(res.confidence*100)+'٪</b></div></div>':'')+
    '<div class="sk-grid2"><label class="sk-field"><span>المصوّت</span><input id="cn-who" list="cn-voters" placeholder="المدير / الشريك / المحاسب / Jev"></label><datalist id="cn-voters"><option value="المدير"><option value="الشريك"><option value="المحاسب"><option value="Jev"></datalist>'+
    '<label class="sk-field"><span>الخيار</span><select id="cn-opt">'+c.options.map(o=>'<option value="'+esc(o.id)+'">'+esc(o.label)+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>الثقة ٪</span><input id="cn-conf" inputmode="numeric" value="70"></label><label class="sk-field"><span>المبرر</span><input id="cn-why"></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-c="vote">إضافة صوت</button><button type="button" class="btn" data-c="jev">اسأل Jev عن هذه القضية</button></div>'+
    (c.votes.length?'<ul class="sk-log">'+c.votes.map(v=>'<li><b>'+esc(v.provider)+' → '+esc(optLabel(v.optionId))+'</b><span>ثقة '+Math.round(v.confidence*100)+'٪'+(v.rationale?' — '+esc(v.rationale):'')+'</span></li>').join("")+'</ul>':'')+
  '</div></section>':SK.ui.state.empty({title:"لا توجد قضايا بعد"}));
}
function councilBind(root){
  root.addEventListener("click",e=>{
    const b=e.target.closest("[data-c]");if(!b)return;const a=b.dataset.c,d=cn();
    if(a==="new"){if(!SK.ui.validate(root))return;const opts=$("#cn-opts",root).value.split("\n").map(s=>s.trim()).filter(Boolean);if(opts.length<2)return toast("أدخل خيارين على الأقل","warn");
      const c={id:SK.ui.uid("case"),question:$("#cn-q",root).value.trim(),options:opts.map((l,i)=>({id:"o"+i,label:l})),votes:[],at:new Date().toISOString()};d.cases.push(c);caseId=c.id}
    else{const c=d.cases.find(x=>x.id===caseId)||d.cases[d.cases.length-1];if(!c)return;
      if(a==="vote"){const who=$("#cn-who",root).value.trim();if(!who)return toast("اكتب اسم المصوّت","warn");
        c.votes=c.votes.filter(v=>v.provider!==who).concat({provider:who,optionId:$("#cn-opt",root).value,confidence:Math.min(1,Math.max(0,SK.num($("#cn-conf",root).value)/100)),rationale:$("#cn-why",root).value.trim()})}
      if(a==="jev"){SK.askJev({type:"choice",question:c.question,options:c.options.map(o=>o.label),context:"قضية من مجلس القرار"});return}}
    save(CN,d);councilPaint(root);
  });
  root.addEventListener("change",e=>{if(e.target.id==="cn-case"){caseId=e.target.value;councilPaint(root)}});
}
SK.view("council",{render(n){if(!n.dataset.bound){councilBind(n);n.dataset.bound="1"}councilPaint(n)}});

/* ================= مركز التصدير ================= */
const flat=o=>{const r={};Object.entries(o||{}).forEach(([k,v])=>{r[k]=v!==null&&typeof v==="object"?JSON.stringify(v):v});return r};
function toCsv(name,rows){
  if(!rows.length)return toast("لا توجد بيانات للتصدير","info");
  const list=rows.map(flat),cols=[...new Set(list.flatMap(r=>Object.keys(r)))];
  SK.csv.download(window.SKEngines.reports.export.safeExportName("skosif-"+name+"-"+today()),cols,list.map(r=>cols.map(c=>r[c])));
}
const SOURCES=[
  ["items","الأصناف والأسعار (من محرك التسعير)",async()=>window.SKosifCore.catalog().items],
  ["customers","العملاء",()=>SK.store.idbAll("customers")],
  ["sales","سطور المبيعات المستوردة",()=>SK.store.idbAll("sales_lines")],
  ["orders","الطلبات",()=>SK.store.idbAll("orders")],
  ["manual-sales","عمليات البيع اليدوية",async()=>load("aghnam-v12-manual-sales",[])],
  ["suppliers","شحنات الموردين",async()=>load("skosif_v31_supplier_batches",[])],
  ["purchase-orders","أوامر الشراء",async()=>load("skosif_purchasing_v1",{}).orders||[]],
  ["receipts","الاستلامات والفحص",async()=>load("skosif_purchasing_v1",{}).receipts||[]],
  ["credit","ائتمان المطاعم",async()=>load("skosif_v38_ledger",[])],
  ["inventory","المخزون",async()=>load("aghnam_v29_inventory",[])],
  ["journal","القيود المحاسبية (سطر لكل حساب)",async()=>(load("skosif_ledger_v1",{}).entries||[]).flatMap(e=>e.lines.map(l=>({date:e.date,reference:e.reference,memo:e.memo,source:e.source,account:l.accountId,debit:l.debit,credit:l.credit})))],
  ["followup","سجلات متابعة العملاء",async()=>load("skosif_followup_v1",{}).records||[]],
  ["tasks","المهام",async()=>load("skosif_tasks_v1",[])],
  ["audit-trail","سجل التدقيق",async()=>SK.audit.all()]
];
async function exportsPaint(root){
  root.innerHTML=SK.ui.state.loading({text:"جارٍ عدّ السجلات…"});
  const counts=await Promise.all(SOURCES.map(async([,,f])=>{try{const r=await f();return Array.isArray(r)?r.length:0}catch{return 0}}));
  root.innerHTML='<section class="card"><div class="card-h"><div><h3>مركز التصدير</h3><p>كل جدول إلى CSV يفتح في Excel (محمي من حقن المعادلات)، أو نسخة كاملة JSON.</p></div><button type="button" class="btn primary" data-x="all">نسخة كاملة للتطبيق</button></div><div class="card-b">'+
    '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>البيانات</th><th>السجلات</th><th></th></tr></thead><tbody>'+
    SOURCES.map(([id,label],i)=>'<tr><td>'+esc(label)+'</td><td class="n">'+counts[i]+'</td><td>'+(counts[i]?'<button type="button" class="btn sm" data-x="'+id+'">تصدير CSV</button>':'<span class="hint">لا بيانات</span>')+'</td></tr>').join("")+'</tbody></table></div></div></section>'+
    (SK.templates?'<section class="card"><div class="card-h"><div><h3>قوالب الاستيراد</h3><p>قالب Excel لكل قسم: الأعمدة المطلوبة وصفّا مثال وورقة تعليمات. املأه ثم استورده — كل صف يُفحص قبل الحفظ ويُضاف دون حذف الموجود.</p></div></div><div class="card-b"><div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>القسم</th><th>الأعمدة</th><th></th></tr></thead><tbody>'+
      SK.templates.list().map(t=>'<tr><td>'+esc(t.label)+'</td><td><small>'+esc(t.columns.join("، "))+'</small></td><td style="white-space:nowrap"><button type="button" class="btn sm" data-tpl-dl="'+t.id+'">تحميل '+(t.format==="csv"?"CSV":"Excel")+'</button> <button type="button" class="btn sm primary" data-tpl-in="'+t.id+'">استيراد</button></td></tr>').join("")+'</tbody></table></div></div></section>':'');
}
function exportsBind(root){
  root.addEventListener("click",async e=>{const b=e.target.closest("[data-x]");if(!b)return;
    if(!SK.perm.can("exports","export"))return toast("التصدير غير متاح لهذا الدور","warn");
    if(b.dataset.x==="all")return SK.store.backup().catch(err=>SK.errors.report(err,"backup"));
    const s=SOURCES.find(x=>x[0]===b.dataset.x);if(s)toCsv(s[0],await s[2]());
  });
}
SK.view("exports",{render(n){if(!n.dataset.bound){exportsBind(n);n.dataset.bound="1"}exportsPaint(n)}});

/* ================= المهام ================= */
const TK="skosif_tasks_v1";
const PRI={high:["عالية","bad"],normal:["عادية",""],low:["منخفضة",""]};
let tfilter="open";
const tasks=()=>{const t=load(TK,[]);return Array.isArray(t)?t:[]};
function tasksPaint(root){
  const all=tasks(),t=today(),caps=SK.caps.visible().filter(c=>SK.perm.can(c.id));
  const list=all.filter(x=>tfilter==="all"||(tfilter==="open"?!x.done:x.done)).sort((a,b)=>(a.done-b.done)||String(a.due||"9").localeCompare(String(b.due||"9"))||((b.priority==="high")-(a.priority==="high")));
  const over=all.filter(x=>!x.done&&x.due&&x.due<t).length,dueT=all.filter(x=>!x.done&&x.due===t).length;
  root.innerHTML='<div class="sk-kpis"><div class="sk-kpi '+(over?"bad":"")+'"><span>متأخرة</span><b>'+over+'</b></div><div class="sk-kpi '+(dueT?"warn":"")+'"><span>مستحقة اليوم</span><b>'+dueT+'</b></div><div class="sk-kpi"><span>مفتوحة</span><b>'+all.filter(x=>!x.done).length+'</b></div><div class="sk-kpi good"><span>منجزة</span><b>'+all.filter(x=>x.done).length+'</b></div></div>'+
  '<section class="card"><div class="card-h"><div><h3>مهمة جديدة</h3></div></div><div class="card-b sk-stack"><div class="sk-grid2">'+
    '<label class="sk-field"><span>المهمة</span><input id="tk-title" data-sk-required></label><label class="sk-field"><span>تاريخ الاستحقاق</span><input type="date" id="tk-due" value="'+t+'"></label>'+
    '<label class="sk-field"><span>الأولوية</span><select id="tk-pri"><option value="normal">عادية</option><option value="high">عالية</option><option value="low">منخفضة</option></select></label>'+
    '<label class="sk-field"><span>مرتبطة بشاشة (اختياري)</span><select id="tk-cap"><option value="">—</option>'+caps.map(c=>'<option value="'+c.id+'">'+esc(c.label)+'</option>').join("")+'</select></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-t="add">إضافة</button></div></div></section>'+
  SK.ui.tabs([["open","المفتوحة"],["done","المنجزة"],["all","الكل"]],tfilter,"tk")+
  (list.length?'<section class="card"><div class="card-b"><div class="skc-list">'+list.map(x=>'<div class="skc-row" style="cursor:default"><input type="checkbox" data-t="done" data-id="'+esc(x.id)+'"'+(x.done?" checked":"")+' aria-label="تم"><span class="tx"><b'+(x.done?' style="text-decoration:line-through;opacity:.6"':'')+'>'+esc(x.title)+'</b><small>'+(x.due?(x.due<t&&!x.done?'<span class="sk-bad-text">متأخرة — </span>':'')+esc(x.due):"بلا تاريخ")+' · <span class="sk-pill '+PRI[x.priority||"normal"][1]+'">'+PRI[x.priority||"normal"][0]+'</span>'+(x.cap&&SK.caps.get(x.cap)?' · <button type="button" class="linkish" data-t="go" data-id="'+esc(x.cap)+'">'+esc(SK.caps.get(x.cap).label)+'</button>':'')+'</small></span><button type="button" class="linkish" data-t="del" data-id="'+esc(x.id)+'">حذف</button></div>').join("")+'</div></div></section>':SK.ui.state.empty({title:"لا توجد مهام هنا"}));
}
function tasksBind(root){
  root.addEventListener("click",e=>{
    const tb=e.target.closest("[data-tab]");if(tb&&tb.closest('[data-sk-tabs="tk"]')){tfilter=tb.dataset.tab;tasksPaint(root);return}
    const b=e.target.closest("[data-t]");if(!b)return;const a=b.dataset.t,all=tasks();
    if(a==="add"){if(!SK.ui.validate(root))return;all.push({id:SK.ui.uid("tk"),title:$("#tk-title",root).value.trim(),due:$("#tk-due",root).value,priority:$("#tk-pri",root).value,cap:$("#tk-cap",root).value,done:false,at:new Date().toISOString()})}
    else if(a==="done"){const x=all.find(y=>y.id===b.dataset.id);if(x){x.done=b.checked;x.doneAt=b.checked?new Date().toISOString():null}}
    else if(a==="del"){const i=all.findIndex(y=>y.id===b.dataset.id);if(i>=0)all.splice(i,1)}
    else if(a==="go"){window.SKosifCore.go(b.dataset.id);return}
    save(TK,all);tasksPaint(root);
  });
}
SK.view("tasks",{render(n){if(!n.dataset.bound){tasksBind(n);n.dataset.bound="1"}tasksPaint(n)}});
window.SKosifTasks=Object.freeze({open:()=>tasks().filter(x=>!x.done),
  /* the live assistant adds tasks the same way the form does */
  add:({title,due,priority,cap})=>{const all=tasks(),x={id:SK.ui.uid("tk"),title:String(title||"").trim().slice(0,200),due:due||today(),priority:["high","normal","low"].includes(priority)?priority:"normal",cap:cap||"",done:false,at:new Date().toISOString()};all.push(x);save(TK,all);if(window.SKosifCore&&SKosifCore.view()==="tasks")SKosifCore.go("tasks");return x}});
})();

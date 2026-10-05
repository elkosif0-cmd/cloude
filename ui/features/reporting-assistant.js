/* KOSIF — reporting assistant intake.
   CSV/TSV/TXT/XLSX are analyzed through the existing deterministic financial engines.
   Other documents are registered as sources without inventing figures. */
(()=>{
"use strict";
const {esc,toast}=SK;
const D=()=>SK.companyData;
const E=()=>window.SKEngines&&SKEngines.reports;
const money=n=>{try{return new Intl.NumberFormat("ar-SA",{maximumFractionDigits:2}).format(Number(n||0)/100)}catch{return String(Number(n||0)/100)}};
const fileType=f=>{
  const n=String(f.name||"").toLowerCase();
  if(n.endsWith(".xlsx"))return"xlsx";
  if(/\.(csv|tsv|txt)$/.test(n))return"text";
  if(n.endsWith(".pdf"))return"pdf";
  if(/\.(doc|docx)$/.test(n))return"word";
  if((f.type||"").startsWith("image/"))return"image";
  return"other";
};
async function textOf(file){
  const t=fileType(file);
  if(t==="xlsx"){
    if(!window.SKXlsx)throw new Error("قارئ Excel غير متاح");
    return SKXlsx.toTsv(file);
  }
  if(t==="text")return file.text();
  return null;
}
function sourceMeta(file,status){
  return{id:SK.ui.uid("src"),name:String(file.name||"مصدر"),type:fileType(file),mime:file.type||"",size:Number(file.size||0),status,at:new Date().toISOString()};
}
function readiness(state){
  const hasTB=!!(state.latest&&state.latest.tb);
  const company=SK.company&&SK.company.current?SK.company.current():null;
  const hasCompany=!!(company&&company.id),hasPeriod=!!(company&&company.period);
  return{
    score:(hasCompany?25:0)+(hasPeriod?20:0)+(hasTB?55:0),
    missing:[!hasCompany&&"اختيار شركة",!hasPeriod&&"تحديد فترة مالية",!hasTB&&"ميزان مراجعة أو بيانات دفتر قابلة للقراءة"].filter(Boolean)
  };
}
function latestHTML(latest){
  if(!latest||!latest.tb)return'<div class="sk-note">لم يُحلل ميزان مراجعة بعد. ارفع CSV/TSV/TXT/XLSX أو الصق البيانات.</div>';
  const t=latest.tb,f=latest.fs;
  return '<div class="sk-kpis">'+
    '<div class="sk-kpi accent"><span>الحسابات</span><b>'+esc(t.accounts)+'</b><small>'+(t.balanced?"الميزان متزن":"فرق "+esc(money(t.difference)))+'</small></div>'+
    '<div class="sk-kpi"><span>التصنيف</span><b>'+esc(f.mappedPct)+'%</b><small>'+esc(f.unmapped)+' غير مصنّف</small></div>'+
    '<div class="sk-kpi"><span>الإيرادات</span><b>'+esc(money(f.revenue))+'</b><small>من القوائم المشتقة</small></div>'+
    '<div class="sk-kpi"><span>صافي النتيجة</span><b>'+esc(money(f.profit))+'</b><small>قبل الاعتماد البشري</small></div>'+
  '</div><div class="sk-actions"><button type="button" class="btn" data-rpa="open-reports">فتح مركز التقارير</button><button type="button" class="btn" data-rpa="open-audit">فتح المراجعة الذكية</button></div>';
}
function render(root){
  const d=D();if(!d){root.innerHTML='<div class="sk-note">تعذر تحميل بيانات الشركة.</div>';return}
  const state=d.reporting(),r=readiness(state),sources=state.sources||[];
  root.innerHTML='<div class="sk-stack">'+
  '<section class="card"><div class="card-h"><div><span class="eyebrow">REPORTING ASSISTANT</span><h3>مساعد إعداد القوائم والتقارير</h3><p>ارفع ما لديك؛ النظام يبني ما يستطيع من أرقام فعلية ويطلب الناقص بدل اختراع أرقام.</p></div><span class="sk-pill '+(r.score===100?"good":"warn")+'">'+r.score+'% جاهزية</span></div><div class="card-b">'+
    (r.missing.length?'<div class="sk-note">المطلوب حاليًا: '+r.missing.map(esc).join(" · ")+'</div>':'<div class="sk-note">الحد الأدنى متاح لبناء القوائم.</div>')+
    '<label class="sk-field"><span>رفع ملفات</span><input type="file" data-rpa-file multiple accept=".csv,.tsv,.txt,.xlsx,.pdf,.doc,.docx,image/*"><small>Excel وCSV والنص تُحلل مباشرة. PDF وWord والصور تُسجل كمصادر ولا تُحوّل لأرقام تلقائيًا في هذه الشاشة.</small></label>'+
    '<label class="sk-field"><span>أو الصق ميزان المراجعة / دفترًا جدوليًا</span><textarea data-rpa-text rows="8" placeholder="رقم الحساب,اسم الحساب,مدين,دائن"></textarea></label>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-rpa="analyze-text">تحليل البيانات الملصقة</button></div>'+
  '</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>النتيجة الحالية</h3><p>مخرجات حتمية من محركات KOSIF المالية الحالية.</p></div></div><div class="card-b">'+latestHTML(state.latest)+'</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>المصادر المستلمة</h3><p>'+sources.length+' مصدر</p></div></div><div class="card-b">'+
    (sources.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الملف</th><th>النوع</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>'+
      sources.map(s=>'<tr><td>'+esc(s.name)+'</td><td>'+esc(s.type)+'</td><td>'+esc(s.status)+'</td><td>'+esc((s.at||"").slice(0,10))+'</td></tr>').join("")+
    '</tbody></table></div>':'<div class="sk-note">لا توجد مصادر بعد.</div>')+
  '</div></section></div>';

  if(root.dataset.rpaBound==="1")return;
  root.dataset.rpaBound="1";

  async function analyze(text,name="بيانات ملصقة"){
    const eng=E();
    if(!eng||!eng.tbImport||!eng.statements)return toast("محركات القوائم غير متاحة","bad");
    const tb=eng.tbImport.parseTrialBalance(text);
    if(!tb.ok)return toast((tb.errors&&tb.errors[0]&&tb.errors[0].message)||"تعذر قراءة البيانات","bad");
    const p=d.profile(),fs=eng.statements.buildStatements(tb,{}, {tax:p.taxMode});
    const latest={
      source:name,at:new Date().toISOString(),
      tb:{accounts:tb.rows.length,balanced:tb.balanced,difference:tb.difference,errors:tb.errors.length,hasPrior:tb.hasPrior},
      fs:{mappedPct:fs.checks.mappedPct,unmapped:fs.unmapped.length,revenue:fs.keys.revenue?.current||0,profit:fs.keys.profit?.current||0,
        assets:fs.keys.assets?.current||0,liabilities:fs.keys.liabilities?.current||0,equity:fs.keys.equity?.current||0,cashTies:fs.checks.cashTies}
    };
    d.saveReporting({latest});
    render(root);
    toast(tb.balanced?"تم تحليل البيانات وبناء القوائم":"تم التحليل لكن الميزان غير متزن",tb.balanced?"ok":"warn");
  }

  root.addEventListener("click",async e=>{
    const b=e.target.closest("[data-rpa]");if(!b)return;
    const a=b.dataset.rpa;
    if(a==="analyze-text"){
      const t=root.querySelector("[data-rpa-text]").value.trim();
      if(!t)return toast("الصق البيانات أولًا","warn");
      await analyze(t);return;
    }
    if(a==="open-reports"){window.SKosifCore&&SKosifCore.go("execreports");return}
    if(a==="open-audit"){window.SKosifCore&&SKosifCore.go("tbreview");return}
  });

  root.querySelector("[data-rpa-file]").addEventListener("change",async e=>{
    const files=[...e.target.files||[]];if(!files.length)return;
    const stateNow=d.reporting(),sourcesNow=[...stateNow.sources];
    for(const f of files){
      try{
        const text=await textOf(f),meta=sourceMeta(f,text?"parsed":"received");
        sourcesNow.push(meta);d.saveReporting({sources:sourcesNow});
        if(text)await analyze(text,f.name);
      }catch(err){
        sourcesNow.push(sourceMeta(f,"error"));d.saveReporting({sources:sourcesNow});
        toast(f.name+": "+err.message,"bad");
      }
    }
    render(root);
  });
}
SK.view("reportintake",{render});
})();
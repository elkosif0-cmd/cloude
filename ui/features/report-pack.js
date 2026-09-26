/* S.kosif — الحزمة التنفيذية (window.SKosifReportPack): تقرير مجلس إدارة بنقرة واحدة.
   أول تبويب في «التقارير التنفيذية». يجمع في وثيقة واحدة مطبوعة بترويسة KOSIF (أو PDF من
   نافذة الطباعة): الغلاف · الملخص التنفيذي · اتجاهات المبيعات والمشتريات (رسم + جدول شهري) ·
   خريطة المخاطر وأعلى المخاطر · الملاحظات المفتوحة · ما يحتاج قراراً · حالة المهام · الاعتماد.
   الأرقام نفسها التي يعرضها مركز القيادة (window.SKosifMetrics) — لا أرقام مضافة. */
(()=>{
"use strict";
const {$$,esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const OPT="skosif_report_pack_v1";
const SECT=[["summary","الملخص التنفيذي"],["books","الدفاتر والإقفال"],["trend","اتجاهات المبيعات والمشتريات"],["risks","المخاطر"],["findings","الملاحظات المفتوحة"],["decisions","ما يحتاج قراراً"],["tasks","حالة المهام"],["signoff","الاعتماد والتوقيع"]];
const nf=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1});
const M=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0}).format(Math.round(v||0))+" ر.س";
const opts=()=>{const o=Object.assign({range:12,sections:SECT.map(s=>s[0]),reviewer:"",approver:""},load(OPT,{})||{});
  /* a section added after the owner saved a choice is shown until they untick it */
  if(!o.seen||!o.seen.includes("books")){o.sections=[...new Set([...o.sections,"books"])];o.seen=SECT.map(x=>x[0])}return o};
/* the books at a glance, from the same source as the morning brief and the month-end close */
function booksHTML(){
  const l=window.SKosifLedger;if(!l||!l.snapshot().accounts.length)return "";
  const t=new Date().toISOString().slice(0,10),ar=l.parties("ar",t),ap=l.parties("ap",t),cash=l.balance("1100",t),d=l.snapshot();
  const hist=((d.bank||{}).history||[]).map(h=>h.end).sort(),last=hist[hist.length-1];
  const S=window.SKosifClose?SKosifClose.steps():[],A=S.filter(x=>x.st!=="na"),done=A.filter(x=>x.st==="ok").length;
  const late=ar?ar.totals["61-90"]+ar.totals["90+"]:0;
  const q=(()=>{const n=new Date(),k=Math.floor(n.getUTCMonth()/3);return k?n.getUTCFullYear()+"-Q"+k:(n.getUTCFullYear()-1)+"-Q4"})(),v=l.vat(q);
  const tiles=[["النقدية والبنوك",cash==null?"—":M(cash)],["مستحق من العملاء",ar?M(ar.balance+ar.unassigned):"—",late?"bad":""],["منه متأخر أكثر من 60 يوماً",M(late),late?"bad":"ok"],
    ["مستحق للموردين",ap?M(ap.balance+ap.unassigned):"—"],["ضريبة "+(v?v.q.label:"الربع"),v?(v.settled?"أُقفلت":M(Math.abs(v.r.net))+(v.r.net>=0?" مستحقة":" مستردة")):"—",v&&!v.settled?"bad":"ok"],
    ["آخر مطابقة بنكية",last||"لم تُعتمد",last?"":"bad"],["الإقفال الشهري",A.length?done+" من "+A.length+" خطوات":"—",done===A.length?"ok":""],["الفترة مقفلة حتى",d.lockDate||"—"]];
  /* the journal's audit trail and the revenue reconciliation (research: Reliance/Infosys edit log; e& revenue tie-out) */
  const tr=l.trail?l.trail():null,rr=l.revenueRecon?l.revenueRecon():null;
  if(tr&&tr.total)tiles.push(["سجل التعديلات",tr.ok?(tr.legacy?"سليم — "+tr.legacy+" سابق للتفعيل":"سليم — "+tr.sealed+" قيداً مختوماً"):"يحتاج مراجعة",tr.ok?"ok":"bad"]);
  if(rr&&(rr.rows.length||rr.unposted.length))tiles.push(["مطابقة الإيرادات",rr.reconciled?"مطابقة":(rr.unposted.length?rr.unposted.length+" بيع غير مرحّل":"فرق "+M(rr.diff/100)),rr.reconciled?"ok":"bad"]);
  const top=ar?ar.rows.filter(r=>r.balance>0.004).slice(0,6):[];
  return '<section><h2>الدفاتر والإقفال</h2><div class="rp-k">'+tiles.map(([k,val,c])=>'<div><span>'+esc(k)+'</span><b class="'+(c||"")+'">'+esc(val)+'</b></div>').join("")+'</div>'+
    (top.length?'<table><tr><th>العميل</th><th>الرصيد</th><th>غير مستحق</th><th>1–60 يوماً</th><th>أكثر من 60</th></tr>'+top.map(r=>'<tr><td>'+esc(r.party)+'</td><td>'+M(r.balance)+'</td><td>'+M(r.aging.current)+'</td><td>'+M(r.aging["1-30"]+r.aging["31-60"])+'</td><td>'+M(r.aging["61-90"]+r.aging["90+"])+'</td></tr>').join("")+'</table>':'')+'</section>';
}
const score=r=>(+r.likelihood||1)*(+r.impact||1);
function snapshot(){
  const st=core().stats(),tgt=st.target>1?st.target:st.target*100;
  const tasks=load("skosif_tasks_v1",[])||[],t=new Date().toISOString().slice(0,10);
  const R=SKosifMetrics.risks(),open=R.risks.filter(r=>r.status!=="closed");
  return{st,tgt,avg:isFinite(st.avgMargin)?st.avgMargin*100:null,tasks,done:tasks.filter(x=>x.done).length,late:tasks.filter(x=>!x.done&&x.due&&x.due<t),
    risks:R.risks,open,high:open.filter(r=>score(r)>=6),findings:R.findings.filter(f=>f.status!=="resolved")};
}
function html(){
  const o=opts(),s=snapshot(),pr=window.SKosifTopbar?SKosifTopbar.profile():{name:""};
  const tile=(l,v,sub)=>'<div class="sk-kpi"><span>'+esc(l)+'</span><b>'+esc(v)+'</b><small>'+esc(sub)+'</small></div>';
  return '<div class="rp">'+
    '<div class="rp-hero"><div><h3>الحزمة التنفيذية</h3><p>تقرير شامل بنقرة واحدة بترويسة SQC: الغلاف، المؤشرات، الاتجاهات، المخاطر، الملاحظات، القرارات، المهام، والاعتماد — جاهز للطباعة أو الحفظ PDF.</p></div>'+
      '<button type="button" class="btn primary" data-rp="print">'+SK.icon("reports")+' معاينة وطباعة الحزمة</button></div>'+
    '<div class="sk-kpis">'+tile("متوسط هامش البوكسات",s.avg!=null?nf.format(s.avg)+"٪":"—","الهدف "+nf.format(s.tgt)+"٪")+tile("بوكسات بخسارة",nf.format(s.st.loss),"من "+nf.format(s.st.boxes))+
      tile("المهام المنجزة",s.tasks.length?nf.format(s.done/s.tasks.length*100)+"٪":"—",s.late.length+" متأخرة")+tile("مخاطر مرتفعة مفتوحة",nf.format(s.high.length),"من "+nf.format(s.open.length)+" مفتوحة")+tile("ملاحظات مفتوحة",nf.format(s.findings.length),s.findings.filter(f=>f.severity==="high").length+" عالية الأثر")+'</div>'+
    '<div class="rp-opts"><div class="sk-field"><span>الفترة</span><div class="sk-seg" role="group" data-rp-range>'+[6,12].map(n=>'<button type="button" data-v="'+n+'" aria-pressed="'+(o.range===n)+'">آخر '+n+' شهراً</button>').join("")+'</div></div>'+
      '<div class="sk-field"><span>الأقسام</span><div class="rp-sec">'+SECT.map(([k,l])=>'<label class="sk-check"><input type="checkbox" value="'+k+'"'+(o.sections.includes(k)?' checked':'')+'> '+l+'</label>').join("")+'</div></div>'+
      '<div class="sk-grid2"><label class="sk-field"><span>أعدّه</span><input value="'+esc(pr.name||SK.org().preparer||"")+'" disabled title="من قائمة المستخدم أعلى التطبيق"></label><label class="sk-field"><span>راجعه</span><input id="rp-rev" value="'+esc(o.reviewer)+'"></label></div>'+
      '<label class="sk-field"><span>اعتمده</span><input id="rp-app" value="'+esc(o.approver)+'" placeholder="اسم المدير أو الشريك المعتمد"></label></div>'+
  '</div>';
}
function bind(root){
  if(!root)return;
  root.addEventListener("click",e=>{
    const r=e.target.closest("[data-rp-range] button");
    if(r){const o=opts();o.range=+r.dataset.v;save(OPT,o);$$("[data-rp-range] button",root).forEach(b=>b.setAttribute("aria-pressed",String(b===r)));return}
    if(e.target.closest('[data-rp="print"]'))print(root);
  });
  root.addEventListener("change",e=>{
    const o=opts();
    if(e.target.matches(".rp-sec input"))o.sections=$$(".rp-sec input:checked",root).map(x=>x.value);
    if(e.target.id==="rp-rev")o.reviewer=e.target.value.trim();
    if(e.target.id==="rp-app")o.approver=e.target.value.trim();
    save(OPT,o);
  });
}
/* ---------- the printed pack ---------- */
const PACK_CSS='.rp-cover{padding:34px 0 18px;text-align:center;break-after:page}.rp-cover h1{margin:40px 0 6px;font-size:32px;color:#0b1f3a}.rp-cover .en{font:700 13px Montserrat,sans-serif;letter-spacing:.2em;color:#1668e3}'+
 '.rp-cover .meta{display:inline-grid;grid-template-columns:auto auto;gap:8px 24px;margin-top:36px;padding:18px 26px;border:1px solid #e4eaf2;border-radius:14px;text-align:start;font-size:13px}.rp-cover .meta span{color:#8292a8}'+
 '.rp-cover .sky{height:170px;margin:26px 0 0;border-radius:18px;background:#0b1f3a url(ART) center/cover no-repeat}'+
 'section{break-inside:avoid;margin-bottom:16px}.rp-k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.rp-k div{padding:10px 12px;border:1px solid #e4eaf2;border-radius:10px;background:#f8fafd}.rp-k span{display:block;font-size:10.5px;color:#8292a8}.rp-k b{display:block;font:800 17px Montserrat,"IBM Plex Sans Arabic",sans-serif;color:#0b1c33}.rp-k b.bad{color:#d3322a}.rp-k b.ok{color:#12884a}'+
 '.skch-legend{display:flex;gap:14px;font-size:10.5px;color:#44566f;margin:4px 0}.skch-legend span{display:inline-flex;align-items:center;gap:5px}.skch-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}.skch-legend i.ln{height:3px;width:14px}'+
 '.skch svg{width:100%;height:auto}.skch .grid line{stroke:#edf1f7}.skch text{fill:#8292a8;font-size:10.5px;font-family:"IBM Plex Sans Arabic",sans-serif}.skch .hit{fill:transparent}.skch .line{fill:none;stroke-width:2.2}.skch .pt{stroke:#fff;stroke-width:2}'+
 '.skhm{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center;max-width:360px}.skhm-y{writing-mode:vertical-rl;transform:rotate(180deg);font-size:10px;color:#8292a8}.skhm-grid{display:grid;grid-template-columns:auto repeat(3,1fr);gap:3px}.skhm-grid .lab{font-size:10px;color:#8292a8;text-align:center}'+
 '.skhm-cell{min-height:38px;border:0;border-radius:6px;font:700 13px Montserrat,sans-serif;color:#0b1c33}.skhm-cell.h1{background:#bfe9cf}.skhm-cell.h2{background:#f8e38b}.skhm-cell.h3{background:#f8b27e}.skhm-cell.h4{background:#f27f7f}.skhm-x{grid-column:2;text-align:center;font-size:10px;color:#8292a8}'+
 '.two{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start}.sev{display:inline-block;padding:1px 8px;border-radius:6px;font-size:10.5px;font-weight:700}.sev.high{background:#fdebea;color:#d3322a}.sev.medium{background:#fff2dc;color:#b86204}.sev.low{background:#e8f1fe;color:#1668e3}'+
 '.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:10px}.sign div{padding:12px;border:1px solid #e4eaf2;border-radius:10px;min-height:92px}.sign span{display:block;font-size:10.5px;color:#8292a8}.sign b{display:block;margin:4px 0 26px}.sign i{display:block;border-top:1px dashed #b8c4d4;padding-top:4px;font-style:normal;font-size:10px;color:#8292a8}'+
 '.note{font-size:10.5px;color:#8292a8}';
async function print(root){
  const o=opts(),w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة لطباعة الحزمة","warn");return}
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>التقرير التنفيذي</title></head><body><p style="font-family:sans-serif;padding:20px">جارٍ تجهيز الحزمة…</p></body></html>');
  try{
    const s=snapshot(),tr=await SKosifMetrics.trend(o.range),has=k=>o.sections.includes(k),org=SK.org(),pr=window.SKosifTopbar?SKosifTopbar.profile():{name:""};
    const cd=load("skosif_companies_v1",{})||{},cs=cd.companies||[],co=cs.find(c=>c.id===(cd.active||{}).companyId)||cs[0];
    const period=tr.tip.length?tr.tip[0]+" – "+tr.tip[tr.tip.length-1]:"";
    const S=tr.s.reduce((a,b)=>a+b,0),P=tr.p.reduce((a,b)=>a+b,0),O=tr.o.reduce((a,b)=>a+b,0),N=S-P-O;
    const base=location.href.replace(/[^/?#]*([?#].*)?$/,"");
    let b='<div class="rp-cover"><div class="en">EXECUTIVE REPORT</div><h1>التقرير التنفيذي</h1><p>'+esc(co?co.name:(org.biz||"أغنام الوادي"))+'</p>'+
      '<div class="meta"><span>الفترة</span><b>'+esc(period||"—")+'</b><span>أعدّه</span><b>'+esc(pr.name||org.preparer||"—")+'</b><span>تاريخ الإصدار</span><b>'+esc(new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"}))+'</b></div><div class="sky"></div></div>';
    if(has("summary"))b+='<section><h2>الملخص التنفيذي</h2><div class="rp-k">'+
      [["المبيعات",M(S)],["المشتريات والمصروفات",M(P+O)],["صافي التدفق",(N<0?"−":"")+M(Math.abs(N)),N<0?"bad":"ok"],["هامش التدفق",S?nf.format(N/S*100)+"٪":"—"],
       ["متوسط هامش البوكسات",s.avg!=null?nf.format(s.avg)+"٪":"—",s.avg!=null&&s.avg<s.tgt?"bad":"ok"],["بوكسات بخسارة",nf.format(s.st.loss),s.st.loss?"bad":""],["المهام المنجزة",s.tasks.length?nf.format(s.done/s.tasks.length*100)+"٪":"—"],["مخاطر مرتفعة مفتوحة",nf.format(s.high.length),s.high.length?"bad":"ok"]]
      .map(([l,v,c])=>'<div><span>'+l+'</span><b class="'+(c||"")+'">'+esc(v)+'</b></div>').join("")+'</div></section>';
    if(has("books"))b+=booksHTML();
    if(has("trend"))b+='<section><h2>اتجاهات المبيعات والمشتريات</h2>'+SKCharts.bars({width:700,labels:tr.labels,tipLabels:tr.tip,series:[{name:"المبيعات",color:"var(--sk-c1)",values:tr.s},{name:"المشتريات والمصروفات",color:"var(--sk-c2)",values:tr.p.map((v,i)=>v+tr.o[i])}],line:{name:"صافي التدفق",color:"var(--sk-c3)",values:tr.net},height:230})+
      '<table><tr><th>الشهر</th><th>المبيعات</th><th>المشتريات</th><th>المصروفات</th><th>الصافي</th></tr>'+tr.tip.map((m,i)=>'<tr><td>'+esc(m)+'</td><td>'+M(tr.s[i])+'</td><td>'+M(tr.p[i])+'</td><td>'+M(tr.o[i])+'</td><td>'+(tr.net[i]<0?"−":"")+M(Math.abs(tr.net[i]))+'</td></tr>').join("")+
      '<tr><td><b>الإجمالي</b></td><td><b>'+M(S)+'</b></td><td><b>'+M(P)+'</b></td><td><b>'+M(O)+'</b></td><td><b>'+(N<0?"−":"")+M(Math.abs(N))+'</b></td></tr></table><p class="note">المصدر: المبيعات المستوردة، شحنات الموردين، والمصروفات التشغيلية الشهرية المسجلة.</p></section>';
    if(has("risks")){const grid=[[0,0,0],[0,0,0],[0,0,0]];s.open.forEach(r=>{grid[(+r.impact||1)-1][(+r.likelihood||1)-1]++});
      const top=s.open.slice().sort((a,c)=>score(c)-score(a)).slice(0,10);
      b+='<section><h2>المخاطر</h2>'+(s.open.length?'<div class="two">'+SKCharts.heatmap(grid)+'<table><tr><th>الرمز</th><th>الخطر</th><th>الفئة</th><th>الدرجة</th><th>المسؤول</th><th>الموعد</th></tr>'+top.map(r=>'<tr><td>'+esc(r.ref||"")+'</td><td><b>'+esc(r.title)+'</b>'+(r.response?'<br><small>'+esc(r.response)+'</small>':'')+'</td><td>'+esc(r.category||"")+'</td><td>'+score(r)+'</td><td>'+esc(r.owner||"")+'</td><td>'+esc(r.due||"")+'</td></tr>').join("")+'</table></div>':'<p class="note">لا مخاطر مفتوحة في السجل.</p>')+'</section>'}
    if(has("findings"))b+='<section><h2>الملاحظات المفتوحة</h2>'+(s.findings.length?'<table><tr><th>الرقم</th><th>الملاحظة</th><th>المجال</th><th>الأثر</th><th>المسؤول</th></tr>'+s.findings.slice().sort((a,c)=>({high:0,medium:1,low:2}[a.severity]-{high:0,medium:1,low:2}[c.severity])).map(f=>'<tr><td>'+esc(f.ref||"")+'</td><td><b>'+esc(f.title)+'</b>'+(f.detail?'<br><small>'+esc(f.detail)+'</small>':'')+'</td><td>'+esc(f.area||"")+'</td><td><span class="sev '+esc(f.severity||"medium")+'">'+({high:"عالي",medium:"متوسطة",low:"منخفض"}[f.severity]||"متوسطة")+'</span></td><td>'+esc(f.owner||"")+'</td></tr>').join("")+'</table>':'<p class="note">لا ملاحظات مفتوحة.</p>')+'</section>';
    if(has("decisions")){const d=SKosifMetrics.decisions().slice(0,10);b+='<section><h2>ما يحتاج قراراً</h2>'+(d.length?'<table><tr><th>الأولوية</th><th>البند</th><th>التفاصيل</th></tr>'+d.map(x=>'<tr><td><span class="sev '+(x.sev==="critical"?"high":x.sev==="warn"?"medium":"low")+'">'+(x.sev==="critical"?"عالية":x.sev==="warn"?"متوسطة":"منخفضة")+'</span></td><td><b>'+esc(x.title)+'</b></td><td>'+esc(x.detail||"")+'</td></tr>').join("")+'</table>':'<p class="note">لا شيء يحتاج قراراً — كل المؤشرات ضمن الحدود.</p>')+'</section>'}
    if(has("tasks"))b+='<section><h2>حالة المهام</h2><div class="rp-k"><div><span>إجمالي المهام</span><b>'+s.tasks.length+'</b></div><div><span>منجزة</span><b class="ok">'+s.done+'</b></div><div><span>مفتوحة</span><b>'+(s.tasks.length-s.done-s.late.length)+'</b></div><div><span>متأخرة</span><b class="'+(s.late.length?"bad":"")+'">'+s.late.length+'</b></div></div>'+
      (s.late.length?'<table style="margin-top:8px"><tr><th>المهمة المتأخرة</th><th>الاستحقاق</th><th>الأولوية</th></tr>'+s.late.map(t=>'<tr><td>'+esc(t.title)+'</td><td>'+esc(t.due)+'</td><td>'+(t.priority==="high"?"عالية":"عادية")+'</td></tr>').join("")+'</table>':'')+'</section>';
    if(has("signoff"))b+='<section><h2>الاعتماد والتوقيع</h2><div class="sign"><div><span>أعدّه</span><b>'+esc(pr.name||org.preparer||" ")+'</b><i>التوقيع والتاريخ</i></div><div><span>راجعه</span><b>'+esc(o.reviewer||" ")+'</b><i>التوقيع والتاريخ</i></div><div><span>اعتمده</span><b>'+esc(o.approver||" ")+'</b><i>التوقيع والتاريخ</i></div></div></section>';
    w.document.open();w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>التقرير التنفيذي</title></head><body>'+b+'</body></html>');w.document.close();
    SK.brandPrint(w,"التقرير التنفيذي");
    const st=w.document.createElement("style");st.textContent=PACK_CSS.replace("ART",base+"art/kosif-sky.svg");w.document.head.appendChild(st);
    SK.audit&&SK.audit.log("report",{act:"executive-pack"});
    setTimeout(()=>{try{w.focus();w.print()}catch{}},700);
  }catch(e){try{w.close()}catch{}SK.errors.report(e,"report-pack")}
}
window.SKosifReportPack=Object.freeze({html,bind,print:()=>print()});
})();

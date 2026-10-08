/* S.kosif — المخاطر والملاحظات (شاشة «risks»): سجل مخاطر وملاحظات كما في تصميم KOSIF.
   • المخاطر: احتمالية × أثر (1–3)، خريطة حرارية 3×3 تُصفّي السجل، توزيع حسب الفئة، مسؤول،
     موعد معالجة، استجابة، حالة. تنبيهات التطبيق (استثناءات القرار) تتحول إلى خطر بضغطة.
   • الملاحظات: رقم AF-السنة-التسلسل، الأثر (عالي · متوسطة · منخفض)، المجال، المسؤول، الحالة،
     وربط اختياري بخطر.
   البيانات على الجهاز: skosif_risks_v1 = {risks:[], findings:[]} — تدخل في النسخة الكاملة والنقل. */
(()=>{
"use strict";
const {$,$$,esc,load,save,toast}=SK;
const core=()=>window.SKosifCore;
const KEY="skosif_risks_v1";
const CATS=["الاستراتيجية","المالية","التشغيلية","الالتزام والحوكمة","تقنية المعلومات","السمعة والعملاء"];
const CAT_C={"الاستراتيجية":"#2340c4","المالية":"#ef4444","التشغيلية":"#f5a524","الالتزام والحوكمة":"#22b35e","تقنية المعلومات":"#8b7cf6","السمعة والعملاء":"#19c3d9"};
const LV=["منخفض","متوسط","مرتفع"],SEV={high:"عالي",medium:"متوسطة",low:"منخفض"};
const RST={open:["مفتوح","bad"],mitigating:["قيد المعالجة","warn"],closed:["مغلق","ok"]};
const FST={open:["مفتوحة","bad"],inprogress:["قيد المعالجة","warn"],resolved:["محلولة","ok"]};
let tab="risks",sel=null,edit=null,editF=null,root=null,prefill=null;
const today=()=>new Date().toISOString().slice(0,10);
const canW=()=>SK.perm.can("risks","create")||SK.perm.can("risks","edit");
const db=()=>{const d=load(KEY,{})||{};return{risks:Array.isArray(d.risks)?d.risks:[],findings:Array.isArray(d.findings)?d.findings:[]}};
const put=d=>save(KEY,d);
const score=r=>(+r.likelihood||1)*(+r.impact||1);
const band=sc=>sc>=6?["مرتفع","bad"]:sc>=3?["متوسط","warn"]:["منخفض","info"];
function nextRef(list,prefix){const y=new Date().getFullYear(),re=new RegExp("^"+prefix+"-"+y+"-(\\d+)$");const n=list.reduce((m,x)=>{const k=re.exec(x.ref||"");return k?Math.max(m,+k[1]):m},0)+1;return prefix+"-"+y+"-"+String(n).padStart(3,"0")}
const seg=(name,cur,opts)=>'<div class="sk-seg" role="group" data-seg="'+name+'">'+opts.map(([v,l])=>'<button type="button" data-v="'+v+'" aria-pressed="'+(String(v)===String(cur))+'">'+esc(l)+'</button>').join("")+'</div>';

/* ---------- risks ---------- */
function riskKpis(d){
  const open=d.risks.filter(r=>r.status!=="closed"),hi=open.filter(r=>score(r)>=6),late=open.filter(r=>r.due&&r.due<today());
  const C=SKCharts,tile=(ic,cls,l,v,sub,ring)=>'<div class="skk4-t" role="group"><span class="chip '+cls+'">'+SK.icon(ic)+'</span><span class="tx"><span>'+l+'</span><b>'+v+'</b><small>'+sub+'</small></span>'+(ring!=null?C.ring(ring,{cls}):'')+'</div>';
  return '<div class="skk4">'+
    tile("risklab","", "إجمالي المخاطر",d.risks.length,open.length+" مفتوحة",null)+
    tile("alert","bad","مخاطر مرتفعة",hi.length,"من أصل "+open.length+" مفتوحة",open.length?hi.length/open.length*100:0)+
    tile("check","ok","مغلقة",d.risks.length-open.length,"من أصل "+d.risks.length,d.risks.length?(d.risks.length-open.length)/d.risks.length*100:0)+
    tile("receivables","warn","تجاوزت موعد المعالجة",late.length,late.length?"تحتاج متابعة":"لا تأخير",null)+
  '</div>';
}
function riskForm(d){
  const r=edit?d.risks.find(x=>x.id===edit)||{}:(prefill||{});
  return '<section class="card" id="rk-form"><div class="card-h"><div><h3>'+(edit?"تعديل خطر "+esc(r.ref||""):"إضافة خطر")+'</h3><p>الدرجة = الاحتمالية × الأثر؛ 6 فأكثر خطر مرتفع يظهر في الإشعارات.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>الخطر</span><input id="rk-title" data-sk-required value="'+esc(r.title||"")+'" placeholder="مثال: ارتفاع أسعار المواشي قبل الأضحى"></label>'+
    '<label class="sk-field"><span>الفئة</span><select id="rk-cat">'+CATS.map(c=>'<option'+(c===(r.category||"التشغيلية")?' selected':'')+'>'+c+'</option>').join("")+'</select></label></div>'+
    '<div class="sk-grid2"><div class="sk-field"><span>الاحتمالية</span>'+seg("lk",r.likelihood||2,[[1,"منخفضة"],[2,"متوسطة"],[3,"مرتفعة"]])+'</div><div class="sk-field"><span>الأثر</span>'+seg("im",r.impact||2,[[1,"منخفض"],[2,"متوسط"],[3,"مرتفع"]])+'</div></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>المسؤول</span><input id="rk-owner" value="'+esc(r.owner||"")+'"></label><label class="sk-field"><span>موعد المعالجة</span><input type="date" id="rk-due" value="'+esc(r.due||"")+'"></label></div>'+
    '<label class="sk-field"><span>الاستجابة وخطة المعالجة</span><textarea id="rk-resp" rows="2">'+esc(r.response||"")+'</textarea></label>'+
    (edit?'<div class="sk-field"><span>الحالة</span>'+seg("rst",r.status||"open",Object.entries(RST).map(([k,v])=>[k,v[0]]))+'</div>':'')+
    '<div class="sk-actions"><button type="button" class="btn primary" data-r="save">'+(edit?"حفظ التعديل":"إضافة إلى السجل")+'</button><button type="button" class="btn" data-r="cancel">إلغاء</button></div></div></section>';
}
function suggestions(d){
  let ex=[];try{ex=(core().exceptions()||[])}catch{}
  const have=new Set(d.risks.map(r=>r.source).filter(Boolean));ex=ex.filter(x=>!have.has("ex:"+x.title)).slice(0,5);
  if(!ex.length)return "";
  return '<section class="card"><div class="card-h"><div><h3>من تنبيهات التطبيق</h3><p>استثناءات تكررت في قواعد القرار — سجّلها كخطر لتتابع معالجتها.</p></div></div><div class="card-b skc-list">'+
    ex.map((x,i)=>'<div class="skc-row" role="group"><span class="sev '+esc(x.sev||"info")+'"></span><span class="tx"><b>'+esc(x.title)+'</b><small>'+esc(x.detail||"")+'</small></span>'+(canW()?'<button type="button" class="btn sm" data-r="promote" data-i="'+i+'">تحويل إلى خطر</button>':'')+'</div>').join("")+'</div></section>';
}
function risksHTML(d){
  const open=d.risks.filter(r=>r.status!=="closed"),grid=[[0,0,0],[0,0,0],[0,0,0]];
  open.forEach(r=>{grid[(+r.impact||1)-1][(+r.likelihood||1)-1]++});
  const byCat=CATS.map(c=>({label:c,value:open.filter(r=>r.category===c).length,color:CAT_C[c]}));
  let rows=d.risks.slice().sort((a,b)=>(a.status==="closed")-(b.status==="closed")||score(b)-score(a));
  if(sel){const [im,li]=sel.split("-").map(Number);rows=rows.filter(r=>(+r.impact-1)===im&&(+r.likelihood-1)===li&&r.status!=="closed")}
  return riskKpis(d)+
    '<div class="rk-grid"><section class="card"><div class="card-h"><div><h3>خريطة المخاطر</h3><p>المخاطر المفتوحة حسب الاحتمالية والأثر — اضغط خانة لتصفية السجل.</p></div>'+(sel?'<button type="button" class="btn sm" data-r="clear">إلغاء التصفية</button>':'')+'</div><div class="card-b">'+SKCharts.heatmap(grid,{sel})+'</div></section>'+
    '<section class="card"><div class="card-h"><div><h3>توزيع المخاطر حسب الفئة</h3><p>المفتوحة فقط.</p></div></div><div class="card-b">'+SKCharts.donut(byCat,{center:open.length,sub:"خطراً مفتوحاً",empty:"لا مخاطر مفتوحة — أضف أول خطر من الزر أعلاه."})+'</div></section></div>'+
    (edit!==null||prefill?riskForm(d):'')+suggestions(d)+
    '<section class="card"><div class="card-h"><div><h3>سجل المخاطر'+(sel?' — خانة مختارة':'')+'</h3><p>'+d.risks.length+' خطراً في السجل.</p></div><div class="sk-actions">'+
      (canW()?'<button type="button" class="btn primary sm" data-r="new">'+SK.icon("action")+' إضافة خطر</button>':'')+'<button type="button" class="btn sm" data-r="csv">تصدير</button><button type="button" class="btn sm" data-r="print">طباعة السجل</button></div></div><div class="card-b">'+
    (rows.length?'<div class="sk-table-wrap"><table class="sk-table rk-table"><thead><tr><th>الرمز</th><th>الخطر</th><th>الفئة</th><th>الاحتمالية</th><th>الأثر</th><th>الدرجة</th><th>المسؤول</th><th>موعد المعالجة</th><th>الحالة</th><th></th></tr></thead><tbody>'+
      rows.map(r=>{const sc=score(r),b=band(sc),s=RST[r.status||"open"],late=r.status!=="closed"&&r.due&&r.due<today();
        return '<tr><td dir="ltr">'+esc(r.ref||"")+'</td><td class="rk-t"><b>'+esc(r.title)+'</b>'+(r.response?'<small>'+esc(r.response)+'</small>':'')+'</td><td><span class="rk-cat" style="--c:'+(CAT_C[r.category]||"#94a3b8")+'">'+esc(r.category||"")+'</span></td>'+
          '<td>'+LV[(+r.likelihood||1)-1]+'</td><td>'+LV[(+r.impact||1)-1]+'</td><td><span class="sksev '+b[1]+'">'+sc+' · '+b[0]+'</span></td><td>'+esc(r.owner||"—")+'</td>'+
          '<td'+(late?' class="rk-late"':'')+'>'+esc(r.due||"—")+'</td><td><span class="sksev '+s[1]+'">'+s[0]+'</span></td>'+
          '<td class="rk-acts">'+(canW()?'<button type="button" class="linkish" data-r="edit" data-id="'+esc(r.id)+'">تعديل</button>'+(r.status!=="closed"?' · <button type="button" class="linkish" data-r="close" data-id="'+esc(r.id)+'">إغلاق</button>':'')+' · <button type="button" class="linkish" data-r="del" data-id="'+esc(r.id)+'">حذف</button>':'')+'</td></tr>'}).join("")+'</tbody></table></div>'
      :SK.ui.state.empty({icon:"risklab",title:sel?"لا مخاطر في هذه الخانة":"سجل المخاطر فارغ",text:sel?"":"أضف المخاطر التي تهدد الربحية أو التشغيل أو الالتزام، وحدد احتماليتها وأثرها."}))+
    '</div></section>';
}
/* ---------- findings ---------- */
function findingForm(d){
  const f=editF?d.findings.find(x=>x.id===editF)||{}:{};
  return '<section class="card" id="af-form"><div class="card-h"><div><h3>'+(editF?"تعديل ملاحظة "+esc(f.ref||""):"إضافة ملاحظة")+'</h3><p>ملاحظة مراجعة أو تشغيل: ما الذي وُجد، أين، وما أثره.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>الملاحظة</span><input id="af-title" data-sk-required value="'+esc(f.title||"")+'" placeholder="مثال: قيود مسح ضوابط الإيرادات"></label><label class="sk-field"><span>المجال</span><input id="af-area" value="'+esc(f.area||"")+'" list="af-areas" placeholder="المبيعات · المشتريات · المخزون…"></label></div>'+
    '<label class="sk-field"><span>التفاصيل</span><textarea id="af-detail" rows="2">'+esc(f.detail||"")+'</textarea></label>'+
    '<div class="sk-grid2"><div class="sk-field"><span>الأثر</span>'+seg("sev",f.severity||"medium",Object.entries(SEV))+'</div><label class="sk-field"><span>مرتبطة بخطر</span><select id="af-risk"><option value="">—</option>'+d.risks.map(r=>'<option value="'+esc(r.id)+'"'+(r.id===f.riskId?' selected':'')+'>'+esc((r.ref||"")+" · "+r.title)+'</option>').join("")+'</select></label></div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>المسؤول</span><input id="af-owner" value="'+esc(f.owner||"")+'"></label><label class="sk-field"><span>التاريخ</span><input type="date" id="af-date" value="'+esc(f.date||today())+'"></label></div>'+
    '<datalist id="af-areas">'+["المبيعات","المشتريات","المخزون","النقدية والبنوك","الذمم المدينة","الرواتب","الضريبة","تقنية المعلومات"].map(a=>'<option value="'+a+'">').join("")+'</datalist>'+
    '<div class="sk-actions"><button type="button" class="btn primary" data-r="fsave">'+(editF?"حفظ التعديل":"إضافة الملاحظة")+'</button><button type="button" class="btn" data-r="fcancel">إلغاء</button></div></div></section>';
}
function findingsHTML(d){
  const F=d.findings,by=k=>F.filter(f=>f.severity===k&&f.status!=="resolved").length,res=F.filter(f=>f.status==="resolved").length;
  const tile=(cls,l,v,sub)=>'<div class="skk4-t" role="group"><span class="chip '+cls+'">'+SK.icon(cls==="ok"?"check":"alert")+'</span><span class="tx"><span>'+l+'</span><b>'+v+'</b><small>'+sub+'</small></span></div>';
  const rows=F.slice().sort((a,b)=>(a.status==="resolved")-(b.status==="resolved")||({high:0,medium:1,low:2}[a.severity]-{high:0,medium:1,low:2}[b.severity])||String(b.date).localeCompare(String(a.date)));
  return '<div class="skk4">'+tile("bad","أثر عالٍ مفتوحة",by("high"),"تحتاج معالجة عاجلة")+tile("warn","متوسطة مفتوحة",by("medium"),"ضمن خطة المعالجة")+tile("","منخفضة مفتوحة",by("low"),"للمتابعة")+tile("ok","محلولة",res,"من أصل "+F.length)+'</div>'+
    (editF!==null?findingForm(d):'')+
    '<section class="card"><div class="card-h"><div><h3>الملاحظات</h3><p>'+F.length+' ملاحظة.</p></div><div class="sk-actions">'+(canW()?'<button type="button" class="btn primary sm" data-r="fnew">'+SK.icon("action")+' إضافة ملاحظة</button>':'')+'<button type="button" class="btn sm" data-r="fcsv">تصدير</button></div></div><div class="card-b">'+
    (rows.length?'<div class="sk-table-wrap"><table class="sk-table af-table"><thead><tr><th>الرقم</th><th>الملاحظة</th><th>المجال</th><th>الأثر</th><th>التاريخ</th><th>المسؤول</th><th>الحالة</th><th></th></tr></thead><tbody>'+
      rows.map(f=>{const s=FST[f.status||"open"];return '<tr><td dir="ltr">'+esc(f.ref||"")+'</td><td class="rk-t"><b>'+esc(f.title)+'</b>'+(f.detail?'<small>'+esc(f.detail)+'</small>':'')+'</td><td>'+esc(f.area||"—")+'</td><td><span class="sksev '+esc(f.severity||"medium")+'">'+SEV[f.severity||"medium"]+'</span></td><td dir="ltr">'+esc(f.date||"")+'</td><td>'+esc(f.owner||"—")+'</td><td><span class="sksev '+s[1]+'">'+s[0]+'</span></td>'+
        '<td class="rk-acts">'+(canW()?'<button type="button" class="linkish" data-r="fedit" data-id="'+esc(f.id)+'">تعديل</button> · '+(f.status==="resolved"?'<button type="button" class="linkish" data-r="freopen" data-id="'+esc(f.id)+'">إعادة فتح</button>':'<button type="button" class="linkish" data-r="fdone" data-id="'+esc(f.id)+'">حل</button>')+' · <button type="button" class="linkish" data-r="fdel" data-id="'+esc(f.id)+'">حذف</button>':'')+'</td></tr>'}).join("")+'</tbody></table></div>'
      :SK.ui.state.empty({icon:"memo",title:"لا ملاحظات بعد",text:"سجّل ملاحظات المراجعة أو التشغيل مع أثرها ومسؤولها، وتابعها حتى الحل."}))+
    '</div></section>';
}
function paint(){
  if(!root)return;const d=db();
  root.innerHTML='<div class="rk">'+seg("tab",tab,[["risks","المخاطر ("+d.risks.filter(r=>r.status!=="closed").length+")"],["findings","الملاحظات ("+d.findings.filter(f=>f.status!=="resolved").length+")"]]).replace('class="sk-seg"','class="sk-seg rk-tabs"')+
    (tab==="risks"?risksHTML(d):findingsHTML(d))+'</div>';
}
const segVal=(name)=>{const b=root.querySelector('[data-seg="'+name+'"] [aria-pressed="true"]');return b?b.dataset.v:null};
function bind(node){
  node.addEventListener("click",async e=>{
    const sb=e.target.closest("[data-seg] button");
    if(sb){const g=sb.closest("[data-seg]");if(g.dataset.seg==="tab"){tab=sb.dataset.v;edit=editF=prefill=null;paint();return}$$("button",g).forEach(x=>x.setAttribute("aria-pressed",String(x===sb)));return}
    const hm=e.target.closest("[data-hm]");if(hm){sel=sel===hm.dataset.hm?null:hm.dataset.hm;paint();return}
    const b=e.target.closest("[data-r]");if(!b)return;
    const a=b.dataset.r,d=db(),id=b.dataset.id;
    if(a==="new"){edit=null;prefill={};paint();$("#rk-title",root).focus();$("#rk-form",root).scrollIntoView({block:"nearest"})}
    else if(a==="cancel"){edit=null;prefill=null;paint()}
    else if(a==="clear"){sel=null;paint()}
    else if(a==="edit"){edit=id;prefill=null;paint();$("#rk-form",root).scrollIntoView({block:"nearest"})}
    else if(a==="promote"){const x=((core().exceptions()||[]).filter(x=>!new Set(d.risks.map(r=>r.source)).has("ex:"+x.title)))[+b.dataset.i];if(!x)return;
      prefill={title:x.title,response:x.detail||"",category:"المالية",likelihood:2,impact:x.sev==="critical"?3:x.sev==="warn"?2:1,source:"ex:"+x.title};edit=null;paint();$("#rk-form",root).scrollIntoView({block:"nearest"})}
    else if(a==="save"){
      if(!SK.ui.validate($("#rk-form",root)))return;
      const v={title:$("#rk-title",root).value.trim(),category:$("#rk-cat",root).value,likelihood:+segVal("lk")||2,impact:+segVal("im")||2,owner:$("#rk-owner",root).value.trim(),due:$("#rk-due",root).value,response:$("#rk-resp",root).value.trim()};
      if(edit){const r=d.risks.find(x=>x.id===edit);Object.assign(r,v,{status:segVal("rst")||r.status,updatedAt:new Date().toISOString()})}
      else d.risks.push(Object.assign({id:SK.ui.uid("rk"),ref:nextRef(d.risks,"RSK"),status:"open",createdAt:new Date().toISOString(),source:prefill&&prefill.source||""},v));
      put(d);toast(edit?"حُفظ الخطر":"أُضيف الخطر إلى السجل","ok");edit=null;prefill=null;paint();
    }
    else if(a==="close"){const r=d.risks.find(x=>x.id===id);r.status="closed";r.closedAt=new Date().toISOString();put(d);paint()}
    else if(a==="del"){if(!await SK.confirm("حذف هذا الخطر من السجل؟",{danger:true,ok:"حذف"}))return;d.risks=d.risks.filter(x=>x.id!==id);d.findings.forEach(f=>{if(f.riskId===id)f.riskId=""});put(d);paint()}
    else if(a==="csv")SK.csv.download("SQC-risk-register",["الرمز","الخطر","الفئة","الاحتمالية","الأثر","الدرجة","المسؤول","موعد المعالجة","الحالة","الاستجابة"],d.risks.map(r=>[r.ref,r.title,r.category,r.likelihood,r.impact,score(r),r.owner,r.due,RST[r.status||"open"][0],r.response]));
    else if(a==="print")printRegister(d);
    else if(a==="fnew"){editF="";paint();$("#af-title",root).focus()}
    else if(a==="fcancel"){editF=null;paint()}
    else if(a==="fedit"){editF=id;paint();$("#af-form",root).scrollIntoView({block:"nearest"})}
    else if(a==="fsave"){
      if(!SK.ui.validate($("#af-form",root)))return;
      const v={title:$("#af-title",root).value.trim(),area:$("#af-area",root).value.trim(),detail:$("#af-detail",root).value.trim(),severity:segVal("sev")||"medium",riskId:$("#af-risk",root).value,owner:$("#af-owner",root).value.trim(),date:$("#af-date",root).value||today()};
      if(editF){Object.assign(d.findings.find(x=>x.id===editF),v)}else d.findings.push(Object.assign({id:SK.ui.uid("af"),ref:nextRef(d.findings,"AF"),status:"open",createdAt:new Date().toISOString()},v));
      put(d);toast("حُفظت الملاحظة","ok");editF=null;paint();
    }
    else if(a==="fdone"||a==="freopen"){const f=d.findings.find(x=>x.id===id);f.status=a==="fdone"?"resolved":"open";put(d);paint()}
    else if(a==="fdel"){if(!await SK.confirm("حذف هذه الملاحظة؟",{danger:true,ok:"حذف"}))return;d.findings=d.findings.filter(x=>x.id!==id);put(d);paint()}
    else if(a==="fcsv")SK.csv.download("SQC-findings",["الرقم","الملاحظة","التفاصيل","المجال","الأثر","التاريخ","المسؤول","الحالة"],d.findings.map(f=>[f.ref,f.title,f.detail,f.area,SEV[f.severity||"medium"],f.date,f.owner,FST[f.status||"open"][0]]));
  });
}
function printRegister(d){
  const w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","warn");return}
  const open=d.risks.filter(r=>r.status!=="closed");
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>سجل المخاطر</title></head><body>'+
    '<h2>ملخص</h2><table><tr><th>إجمالي المخاطر</th><th>مفتوحة</th><th>مرتفعة (6+)</th><th>ملاحظات مفتوحة</th></tr><tr><td>'+d.risks.length+'</td><td>'+open.length+'</td><td>'+open.filter(r=>score(r)>=6).length+'</td><td>'+d.findings.filter(f=>f.status!=="resolved").length+'</td></tr></table>'+
    '<h2>سجل المخاطر</h2><table><tr><th>الرمز</th><th>الخطر</th><th>الفئة</th><th>الدرجة</th><th>المسؤول</th><th>الموعد</th><th>الحالة</th></tr>'+d.risks.map(r=>'<tr><td>'+esc(r.ref)+'</td><td><b>'+esc(r.title)+'</b><br><small>'+esc(r.response||"")+'</small></td><td>'+esc(r.category)+'</td><td>'+score(r)+' · '+band(score(r))[0]+'</td><td>'+esc(r.owner||"")+'</td><td>'+esc(r.due||"")+'</td><td>'+RST[r.status||"open"][0]+'</td></tr>').join("")+'</table>'+
    (d.findings.length?'<h2>الملاحظات</h2><table><tr><th>الرقم</th><th>الملاحظة</th><th>المجال</th><th>الأثر</th><th>الحالة</th></tr>'+d.findings.map(f=>'<tr><td>'+esc(f.ref)+'</td><td><b>'+esc(f.title)+'</b><br><small>'+esc(f.detail||"")+'</small></td><td>'+esc(f.area||"")+'</td><td>'+SEV[f.severity||"medium"]+'</td><td>'+FST[f.status||"open"][0]+'</td></tr>').join("")+'</table>':'')+
    '</body></html>');
  w.document.close();SK.brandPrint(w,"سجل المخاطر والملاحظات");setTimeout(()=>w.print(),400);
}
SK.view("risks",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
})();

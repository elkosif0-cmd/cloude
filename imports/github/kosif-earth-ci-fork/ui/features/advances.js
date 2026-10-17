/* S.kosif — السلف والدفعات المقدمة (window.SKosifAdvances).
   One screen, no detours: a new advance is typed in the table's first row; a click on any advance opens it in place —
   its fields editable where they are, its instalment schedule, its repayments (added, corrected or removed in the same
   row) and its entries in the books. Every save re-syncs the books through SKosifLedger.sync: new entries are posted,
   a changed one is reversed and posted again, so the journal keeps its history and the edit log stays whole.
   The numbers come from SKEngines.finance.advances. Data: skosif_advances_v1 {advances:[], seq}. */
(()=>{
"use strict";
const {$,esc,load,save,money,toast}=SK;
const KEY="skosif_advances_v1";
const AE=()=>window.SKEngines&&SKEngines.finance.advances;
const L=()=>window.SKosifLedger;
let root=null,open="",filter="all",q="";
const today=()=>new Date().toISOString().slice(0,10);
const r2=v=>Math.round((Number(v)||0)*100)/100;
const numIn=v=>{const s=String(v??"").trim().replace(/[٠-٩]/g,c=>"٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace("٫",".").replace(/[٬,\s]/g,"");const n=Number(s);return s!==""&&Number.isFinite(n)?n:null};
const KIND={employee:"سلفة موظف",supplier:"دفعة مقدمة لمورد",customer:"عربون من عميل"};
const METHOD={cash:"نقداً",salary:"خصم من الراتب",offset:"تسوية مع فاتورة"};
const STATE={open:["مفتوحة","info"],overdue:["متأخرة","warn"],settled:["مسددة","ok"],"written-off":["معدومة","bad"]};
const ACCOUNTS=[["1100","النقدية والبنوك","asset"],["1150","سلف الموظفين","asset"],["1160","دفعات مقدمة للموردين","asset"],["2150","دفعات مقدمة من العملاء","liability"],["2100","الذمم الدائنة (الموردون)","liability"],["1200","الذمم المدينة","asset"]];

function data(){const d=load(KEY,{})||{};return{advances:Array.isArray(d.advances)?d.advances:[],seq:Number(d.seq)||0}}
function put(d){save(KEY,d)}
const find=(d,id)=>d.advances.find(a=>a.id===id);

/* ---- the books ---- */
function accounts(){const l=L();if(!l||!l.ensureAccounts)return null;const ids=l.ensureAccounts(ACCOUNTS);
  return{cash:ids["1100"],employee:ids["1150"],supplier:ids["1160"],customer:ids["2150"],payable:ids["2100"],receivable:ids["1200"]}}
function post(a,removed){
  const l=L(),e=AE();if(!l||!l.sync||!e)return null;const acc=accounts();if(!acc)return null;
  const want=removed?[]:e.advanceEntries(a,acc).map(x=>a.demo?{...x,demo:true}:x);
  return l.sync("advance:"+a.id,want);
}
function postedCount(a){const l=L();if(!l)return 0;return l.entries().filter(e=>!e.reversedBy&&!e.reversalOf&&String(e.sourceId||"").startsWith("advance:"+a.id)).length}
function syncNote(r){if(!r)return"";const p=[];if(r.posted)p.push("رُحّل "+r.posted+" قيد");if(r.reversed)p.push("عُكس "+r.reversed+" قيد قديم");if(r.blocked.length)p.push(r.blocked.length+" داخل فترة مقفلة لم يُغيَّر");return p.length?" — "+p.join("، "):""}

/* ---- parties typed before: employees from earlier advances, suppliers from purchasing, customers from the core ---- */
function parties(){
  const d=data(),s=new Set(d.advances.map(a=>a.party));
  try{(load("skosif_purchasing_v1",{}).orders||[]).forEach(o=>o.supplier&&s.add(o.supplier))}catch{}
  try{(load("skosif_v31_supplier_batches",[])||[]).forEach(b=>b.supplier&&s.add(b.supplier))}catch{}
  try{(load("skosif_v38_ledger",[])||[]).forEach(c=>c.name&&s.add(c.name))}catch{}
  return[...s].filter(Boolean).slice(0,400);
}

/* ---- paint ---- */
const chip=(st)=>{const [t,c]=STATE[st]||STATE.open;return '<span class="sksev '+c+'">'+t+'</span>'};
function kpis(sum){
  const k=sum.kinds,card=(t,v,sub,c)=>'<div class="adv-kpi'+(c?" "+c:"")+'"><span>'+t+'</span><b>'+v+'</b><small>'+sub+'</small></div>';
  return '<div class="adv-kpis">'+card("سلف الموظفين",money(k.employee.balance),k.employee.count+" سلفة · صُرف "+money(k.employee.given))+
    card("دفعات مقدمة للموردين",money(k.supplier.balance),k.supplier.count+" دفعة")+card("عربون العملاء",money(k.customer.balance),k.customer.count+" عربون — التزام علينا")+
    card("المتأخر",money(k.employee.overdue+k.supplier.overdue+k.customer.overdue),sum.overdueCount+" سلفة متأخرة عن جدولها",sum.overdueCount?"warn":"")+'</div>';
}
function newRow(){
  return '<tr class="adv-new"><td><span class="adv-plus">+</span></td><td><select data-n="kind">'+Object.entries(KIND).map(([k,t])=>'<option value="'+k+'">'+t+'</option>').join("")+'</select></td>'+
    '<td><input data-n="party" list="adv-parties" placeholder="اسم الموظف أو المورد أو العميل"></td><td><input data-n="date" type="date" value="'+today()+'"></td>'+
    '<td><input data-n="amount" inputmode="decimal" placeholder="0.00"></td><td><input data-n="installments" inputmode="numeric" value="1" title="عدد الأقساط الشهرية"></td>'+
    '<td colspan="3"><input data-n="purpose" placeholder="الغرض (اختياري)"></td><td><button type="button" class="btn primary sm" data-adv="add">إضافة</button></td></tr>';
}
function row(a,s){
  return '<tr class="adv-row'+(open===a.id?" on":"")+'" data-open="'+esc(a.id)+'" tabindex="0"><td>'+esc(a.number)+'</td><td>'+esc(KIND[a.kind])+'</td><td><b>'+esc(a.party)+'</b>'+(a.purpose?'<small>'+esc(a.purpose)+'</small>':'')+'</td><td>'+esc(a.date)+'</td>'+
    '<td>'+money(a.amount)+'</td><td>'+a.installments+'</td><td>'+money(s.paid)+'</td><td><b>'+money(s.balance)+'</b></td><td>'+chip(s.state)+(s.overdue>0?'<small class="adv-od">متأخر '+money(s.overdue)+'</small>':'')+'</td>'+
    '<td><i class="adv-bar" style="--p:'+Math.round(s.progress*100)+'%"></i></td></tr>';
}
function detail(a,s,others){
  const e=AE(),issues=e.validateAdvance(a,others),posted=postedCount(a);
  const f=(k,label,val,type)=>'<label class="sk-field"><span>'+label+'</span>'+(k==="kind"?'<select data-f="kind">'+Object.entries(KIND).map(([v,t])=>'<option value="'+v+'"'+(a.kind===v?' selected':'')+'>'+t+'</option>').join("")+'</select>':'<input data-f="'+k+'"'+(type?' type="'+type+'"':'')+' value="'+esc(val??"")+'"'+(k==="party"?' list="adv-parties"':'')+'>')+'</label>';
  const sched='<div class="adv-sched">'+s.rows.map(r=>'<div class="'+(r.left<=0?"paid":r.month<=today().slice(0,7)?"late":"")+'"><small>'+esc(r.month)+'</small><b>'+money(r.due)+'</b><span>'+(r.left<=0?"مسدد":r.paid>0?"باقي "+money(r.left):r.month<=today().slice(0,7)?"مستحق":"قادم")+'</span></div>').join("")+'</div>';
  const methods=a.kind==="employee"?["salary","cash"]:["offset","cash"];
  const rep=(p,i)=>'<tr data-rep="'+esc(p.id)+'"><td>'+(i+1)+'</td><td><input data-r="date" type="date" value="'+esc(p.date)+'"></td><td><input data-r="amount" inputmode="decimal" value="'+r2(p.amount)+'"></td>'+
    '<td><select data-r="method">'+[...new Set([...methods,p.method])].map(m=>'<option value="'+m+'"'+(p.method===m?' selected':'')+'>'+METHOD[m]+'</option>').join("")+'</select></td><td><input data-r="note" value="'+esc(p.note||"")+'" placeholder="ملاحظة"></td>'+
    '<td><button type="button" class="btn sm" data-adv="rep-save">حفظ</button> <button type="button" class="btn sm danger" data-adv="rep-del" aria-label="حذف السداد">×</button></td></tr>';
  const next=s.nextDue?s.nextDue.due:s.balance;
  return '<tr class="adv-detail"><td colspan="10"><div class="adv-d">'+
    '<section><h4>بيانات السلفة — عدّل في مكانها</h4><div class="adv-grid">'+f("kind","النوع")+f("party","الطرف",a.party)+f("date","التاريخ",a.date,"date")+f("amount","المبلغ",r2(a.amount))+f("installments","عدد الأقساط",a.installments)+f("firstDue","أول قسط",a.firstDue||"","date")+f("purpose","الغرض",a.purpose||"")+'</div>'+
    (issues.length?'<ul class="adv-issues">'+issues.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':'')+
    '<div class="sk-actions"><button type="button" class="btn primary sm" data-adv="save">حفظ التعديل</button><button type="button" class="btn sm" data-adv="'+(a.writtenOff?"unwrite":"write")+'">'+(a.writtenOff?"إلغاء الإعدام":"إعدام الرصيد")+'</button><button type="button" class="btn sm danger" data-adv="del">حذف السلفة</button></div></section>'+
    '<section><h4>جدول الأقساط</h4>'+sched+'</section>'+
    '<section><h4>السداد</h4><table class="sk-table adv-reps"><thead><tr><th>#</th><th>التاريخ</th><th>المبلغ</th><th>الطريقة</th><th>ملاحظة</th><th></th></tr></thead><tbody>'+a.repayments.map(rep).join("")+
      (s.balance>0?'<tr class="adv-rnew"><td>+</td><td><input data-rn="date" type="date" value="'+today()+'"></td><td><input data-rn="amount" inputmode="decimal" value="'+r2(next)+'"></td><td><select data-rn="method">'+methods.map(m=>'<option value="'+m+'">'+METHOD[m]+'</option>').join("")+'</select></td><td><input data-rn="note" placeholder="ملاحظة"></td><td><button type="button" class="btn primary sm" data-adv="rep-add">+ سداد</button></td></tr>':'')+'</tbody></table></section>'+
    '<section class="adv-books"><h4>في الدفاتر</h4><p>'+(posted?'✓ '+posted+' قيد مرحّل باسم «'+esc(a.party)+'» — التعديل هنا يعكس القديم ويرحّل الجديد تلقائياً.':'لم يُرحّل بعد')+'</p><div class="sk-actions"><button type="button" class="btn sm" data-adv="repost">إعادة المزامنة مع الدفاتر</button><button type="button" class="btn sm" data-adv="books">فتح القيود</button></div></section>'+
    '</div></td></tr>';
}
function paint(){
  if(!root)return;const e=AE();if(!e){root.innerHTML='<p class="empty">المحرك لم يُحمّل بعد…</p>';return}
  const d=data(),asOf=today(),sum=e.advancesSummary(d.advances,asOf);
  const list=d.advances.map(a=>({a,s:e.advanceStatus(a,asOf)})).filter(({a,s})=>(filter==="all"||(filter==="overdue"?s.state==="overdue":filter==="settled"?s.state==="settled":a.kind===filter))&&(!q||(a.party+" "+a.number+" "+(a.purpose||"")).includes(q)))
    .sort((x,y)=>(y.a.date.localeCompare(x.a.date))||y.a.number.localeCompare(x.a.number));
  const F=[["all","الكل"],["employee","الموظفون"],["supplier","الموردون"],["customer","العملاء"],["overdue","المتأخرة"],["settled","المسددة"]];
  root.innerHTML='<div class="adv">'+
    kpis(sum)+'<section class="card adv-list"><div class="adv-bar-top"><div class="adv-filters">'+F.map(([k,t])=>'<button type="button" class="'+(filter===k?"on":"")+'" data-filter="'+k+'">'+t+'</button>').join("")+'</div><input type="search" data-q placeholder="بحث بالاسم أو الرقم" value="'+esc(q)+'"></div>'+
    '<div class="sk-table-wrap"><table class="sk-table adv-table"><thead><tr><th>الرقم</th><th>النوع</th><th>الطرف</th><th>التاريخ</th><th>المبلغ</th><th>الأقساط</th><th>المسدد</th><th>الرصيد</th><th>الحالة</th><th>السداد</th></tr></thead><tbody>'+
    newRow()+(list.length?list.map(({a,s})=>row(a,s)+(open===a.id?detail(a,s,d.advances):"")).join(""):'<tr><td colspan="10" class="empty">لا توجد سلف '+(filter==="all"?"بعد — أضف أول سلفة من السطر الأول":"في هذا التصنيف")+'.</td></tr>')+
    '</tbody></table></div><datalist id="adv-parties">'+parties().map(p=>'<option value="'+esc(p)+'">').join("")+'</datalist></section></div>';
}

/* ---- actions ---- */
function readNew(){const g=k=>$('.adv-new [data-n="'+k+'"]',root);return{kind:g("kind").value,party:g("party").value.trim(),date:g("date").value,amount:numIn(g("amount").value)||0,installments:Math.max(1,Math.floor(numIn(g("installments").value)||1)),purpose:g("purpose").value.trim()}}
function add(){
  const d=data(),x=readNew(),seq=d.seq+1,a={id:SK.ui.uid("adv"),number:"ADV-"+new Date().getFullYear()+"-"+String(seq).padStart(4,"0"),...x,repayments:[]};
  const issues=AE().validateAdvance(a,d.advances).filter(m=>!/سلفة أخرى مفتوحة/.test(m));if(issues.length){toast(issues[0],"warn");return}
  d.advances.push(a);d.seq=seq;put(d);open=a.id;const r=post(a);SK.audit&&SK.audit.log("advances",{act:"add",id:a.id});
  const warn=AE().validateAdvance(a,d.advances).find(m=>/سلفة أخرى مفتوحة/.test(m));
  paint();toast("أُضيفت "+KIND[a.kind]+" لـ«"+a.party+"»"+syncNote(r)+(warn?" — تنبيه: "+warn:""),warn?"warn":"ok");
}
function saveEdit(id){
  const d=data(),a=find(d,id);if(!a)return;const g=k=>$('.adv-detail [data-f="'+k+'"]',root);
  const next={...a,kind:g("kind").value,party:g("party").value.trim(),date:g("date").value,amount:numIn(g("amount").value)||0,installments:Math.max(1,Math.floor(numIn(g("installments").value)||1)),firstDue:g("firstDue").value||undefined,purpose:g("purpose").value.trim()};
  const issues=AE().validateAdvance(next,d.advances).filter(m=>!/سلفة أخرى مفتوحة/.test(m));if(issues.length){toast(issues[0],"warn");return}
  Object.assign(a,next);if(!a.firstDue)delete a.firstDue;put(d);const r=post(a);SK.audit&&SK.audit.log("advances",{act:"edit",id});paint();toast("حُفظ التعديل"+syncNote(r),"ok");
}
async function del(id){const d=data(),a=find(d,id);if(!a)return;
  if(!await SK.confirm("حذف "+KIND[a.kind]+" «"+a.number+"» لـ«"+a.party+"»؟ تُعكس قيودها في الدفاتر ويبقى أثرها في السجل.",{danger:true,ok:"حذف"}))return;
  const r=post(a,true);d.advances=d.advances.filter(x=>x.id!==id);put(d);open="";SK.audit&&SK.audit.log("advances",{act:"delete",id});paint();toast("حُذفت السلفة"+syncNote(r),"ok")}
function repAdd(id){
  const d=data(),a=find(d,id);if(!a)return;const g=k=>$('.adv-rnew [data-rn="'+k+'"]',root);
  const p={id:SK.ui.uid("rep"),date:g("date").value,amount:numIn(g("amount").value)||0,method:g("method").value,note:g("note").value.trim()};
  if(!(p.amount>0)){toast("أدخل مبلغ السداد","warn");return}
  const next={...a,repayments:[...a.repayments,p]},issues=AE().validateAdvance(next).filter(m=>!/سلفة أخرى مفتوحة/.test(m));if(issues.length){toast(issues[0],"warn");return}
  a.repayments.push(p);put(d);const r=post(a);paint();toast("سُجّل سداد "+money(p.amount)+syncNote(r),"ok");
}
function repSave(id,rid){
  const d=data(),a=find(d,id),p=a&&a.repayments.find(x=>x.id===rid);if(!p)return;const tr=$('[data-rep="'+CSS.escape(rid)+'"]',root),g=k=>$('[data-r="'+k+'"]',tr);
  const np={...p,date:g("date").value,amount:numIn(g("amount").value)||0,method:g("method").value,note:g("note").value.trim()};
  const next={...a,repayments:a.repayments.map(x=>x.id===rid?np:x)},issues=AE().validateAdvance(next).filter(m=>!/سلفة أخرى مفتوحة/.test(m));if(issues.length){toast(issues[0],"warn");return}
  Object.assign(p,np);put(d);const r=post(a);paint();toast("عُدّل السداد"+syncNote(r),"ok");
}
function repDel(id,rid){const d=data(),a=find(d,id);if(!a)return;a.repayments=a.repayments.filter(x=>x.id!==rid);put(d);const r=post(a);paint();toast("حُذف السداد"+syncNote(r),"ok")}
function bind(node){
  node.addEventListener("click",e=>{
    const f=e.target.closest("[data-filter]");if(f){filter=f.dataset.filter;paint();return}
    const b=e.target.closest("[data-adv]");
    if(b){const a=b.dataset.adv,rid=b.closest("[data-rep]")?.dataset.rep;
      if(a==="add")add();else if(a==="save")saveEdit(open);else if(a==="del")del(open);else if(a==="rep-add")repAdd(open);else if(a==="rep-save")repSave(open,rid);else if(a==="rep-del")repDel(open,rid);
      else if(a==="write"||a==="unwrite"){const d=data(),x=find(d,open);if(x){x.writtenOff=a==="write";put(d);paint();toast(a==="write"?"أُعدم الرصيد — راجع قيد الإعدام مع المحاسب":"أُلغي الإعدام","info")}}
      else if(a==="repost"){const x=find(data(),open);if(x){const r=post(x);toast("تمت المزامنة"+(syncNote(r)||" — القيود مطابقة"),"ok");paint()}}
      else if(a==="books"&&L())L().open("entries");
      return}
    const r=e.target.closest("[data-open]");if(r&&!e.target.closest("input,select,button")){open=open===r.dataset.open?"":r.dataset.open;paint()}
  });
  node.addEventListener("keydown",e=>{const r=e.target.closest&&e.target.closest("[data-open]");if(r&&e.key==="Enter"&&e.target===r){open=open===r.dataset.open?"":r.dataset.open;paint()}
    if(e.key==="Enter"&&e.target.closest(".adv-new")){e.preventDefault();add()}});
  node.addEventListener("input",e=>{if(e.target.matches("[data-q]")){q=e.target.value.trim();const pos=e.target.selectionStart;paint();const i=$("[data-q]",root);if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch{}}}});
}
SK.view("advances",{render(node){root=node;if(!node.dataset.bound){bind(node);node.dataset.bound="1"}paint()}});
window.SKosifAdvances=Object.freeze({list:()=>data().advances,summary:()=>AE()?AE().advancesSummary(data().advances,today()):null,post,accounts:ACCOUNTS});
})();

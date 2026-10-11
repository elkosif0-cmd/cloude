/* S.kosif — الربحية والقنوات (window.SKosifChannelProfit), the «الربحية والقنوات» chapter of «مختبر المبيعات».
   Merged from the owner's «لوحة المبيعات والتكاليف والأرباح» v16 (2026-10-08): the cost of every sale from the rule in force
   on its date for its product and channel, with the rule's components (purchase, purchase VAT when not recoverable, packaging,
   processing, the platform's commission and fixed fee, card fee, VIP discount, free shipping, other); the fixed order fees
   shared over the order's lines; coverage; per-channel product columns; product detail; rule-based recommendations; a
   printable report. Numbers come from SKEngines.sales.channelCosting (tested in app/src/engine/fusion/sales).
   Data: the app's own sales lines (IndexedDB aghnam-app-v7 › sales_lines) and, optionally, lines imported from the v16
   format (template «مبيعات القنوات») into skosif_channel_lines_v1 — per company (helper-space HELPER_KEY). The rules stay in
   skosif_cost_rules_v1 (a rule from before is a purchase cost per unit). */
(()=>{
"use strict";
const {esc}=SK;
const C=()=>SKEngines.sales.channelCosting;
const RK="skosif_cost_rules_v1",LK="skosif_channel_lines_v1";
const st={from:"",to:"",product:"",chs:null,src:"all",mode:"all",sel:"",edit:"",form:null,pv:{qty:1,sales:115,cond:true}};
const sar=h=>(Math.round(Number(h)||0)/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const sark=h=>SKCharts.compact(Math.round((Number(h)||0)/100));
const pct=m=>m==null?"—":(Math.round(m*1000)/10)+"٪";
const tone=m=>m==null?"info":m<0?"bad":m<.1?"warn":"ok";
const rules=()=>{const r=SK.load(RK,[]);return Array.isArray(r)?r:[]};
const imported=()=>{const d=SK.load(LK,null);return d&&Array.isArray(d.lines)?d:{lines:[],catalog:[]}};
const CH_ICON={"المعرض":"commerce","الجملة":"suppliers","المتجر":"catalog","هنغرستيشن":"customers"};

async function appLines(){
  const rows=await SK.legacyCompanyData.read("sales_lines");
  return rows.map((l,i)=>({id:"a"+i,date:String(l.date||"").slice(0,10),
    amount:Number.isFinite(+l.amountHalalas)?+l.amountHalalas:Math.round((+l.amount||0)*100),
    qty:+l.qty||1,product:String(l.descriptionOriginal||l.product||"صنف غير محدد"),
    channel:l.source||l.channel||"",invoice:l.ref||l.externalOrderId||"",
    paymentMethod:l.paymentMethod||l.payment||"",customerType:l.customerType||"",
    freeShipping:!!l.freeShipping,src:"app"}));
}
/* imported lines carry their catalog: codes, the approved name and aliases (v16 «شجرة الأصناف») */
function importedLines(){const d=imported(),cat=new Map((d.catalog||[]).map(c=>[String(c.code),c]));
  return d.lines.map((l,i)=>{const c=cat.get(String(l.code||""));return{...l,id:"i"+i,product:c?c.name:l.product,category:c?c.category:l.category||"",src:"import"}})}
async function allLines(){const a=st.src==="import"?[]:await appLines(),b=st.src==="app"?[]:importedLines();return a.concat(b)}
function catalogCostFn(){const m=new Map();try{(SKosifCore.catalog().items||[]).forEach(i=>{if(i.cost!=null)m.set(C().normalizeText(i.name),Math.round(i.cost*100))})}catch{}return p=>m.get(C().normalizeText(p))??null}

/* ---------- pieces ---------- */
const kpi=(l,v,s,cls,extra)=>'<div class="skcp-k'+(cls?" "+cls:"")+'">'+(extra||"")+'<small>'+esc(l)+'</small><b class="num">'+v+'</b>'+(s?'<span>'+s+'</span>':'')+'</div>';
function filters(chs,products){
  const on=st.chs||chs;
  return '<div class="skcp-filters"><label>من<input type="date" data-cpf="from" value="'+esc(st.from)+'"></label><label>إلى<input type="date" data-cpf="to" value="'+esc(st.to)+'"></label>'+
    '<label>الصنف<select data-cpf="product"><option value="">كل الأصناف</option>'+products.map(p=>'<option'+(p===st.product?' selected':'')+'>'+esc(p)+'</option>').join("")+'</select></label>'+
    '<label>المصدر<select data-cpf="src">'+[["all","كل السطور"],["app","مبيعات التطبيق"],["import","المستوردة (v16)"]].map(([k,l])=>'<option value="'+k+'"'+(st.src===k?' selected':'')+'>'+l+'</option>').join("")+'</select></label>'+
    '<button type="button" class="btn sm" data-cp="clear">مسح الفلاتر</button></div>'+
    '<div class="skcp-chips" role="group" aria-label="قنوات البيع">'+chs.map(c=>'<button type="button" class="skcp-chip" data-cp-ch="'+esc(c)+'" aria-pressed="'+on.includes(c)+'">'+SK.icon(CH_ICON[c]||"commerce")+esc(c)+'</button>').join("")+(chs.length>1?'<button type="button" class="linkish" data-cp="allch">كل القنوات</button>':'')+'</div>';
}
function recs(list){return '<div class="skcp-recs">'+list.map(r=>'<article class="skcp-rec '+r.tone+'"><span class="sksev '+r.tone+'">'+esc(r.tag)+'</span><b>'+esc(r.title)+'</b><p>'+esc(r.body)+'</p><button type="button" class="linkish" data-cp-task="'+esc(r.title)+'">+ مهمة</button></article>').join("")+'</div>'}
function charts(a){
  const L=C().COMPONENT_LABELS,segs=Object.keys(L).map((k,i)=>({label:L[k],value:Math.round((a.components[k]||0)/100)})).filter(s=>s.value>0);
  const top=a.products.filter(p=>p.costed).slice().sort((x,y)=>y.profit-x.profit).slice(0,7);
  return '<div class="skcp-grid">'+
    '<div class="skcp-card"><h4>الإيراد ومجمل الربح حسب القناة</h4>'+SKCharts.bars({labels:a.channels.map(c=>c.key),series:[{name:"الإيراد الصافي",values:a.channels.map(c=>Math.round(c.revenue/100))},{name:"مجمل الربح",values:a.channels.map(c=>Math.round(c.profit/100))}],height:230})+'</div>'+
    '<div class="skcp-card"><h4>مكونات التكلفة</h4>'+(segs.length?SKCharts.donut(segs.map(s=>({label:s.label,value:s.value})),{center:sark(a.totals.cost),sub:"ر.س"}):'<p class="hint">لا مكونات بعد — القواعد بتكلفة إجمالية أو التكلفة من الكتالوج.</p>')+'</div>'+
    '<div class="skcp-card"><h4>أعلى الأصناف ربحاً</h4>'+SKCharts.hbars({rows:top.map(p=>({label:p.key,value:Math.round(p.profit/100)})),fmt:v=>SKCharts.compact(v)+" ر.س",empty:"أضف قواعد التكلفة"})+'</div>'+
    (a.days.length>1?'<div class="skcp-card wide"><h4>الاتجاه اليومي</h4>'+SKCharts.line({labels:a.days.map(d=>d.key.slice(5)),series:[{name:"الإيراد الصافي",values:a.days.map(d=>Math.round(d.revenue/100))},{name:"مجمل الربح",values:a.days.map(d=>d.costed?Math.round(d.profit/100):NaN)}],height:200})+'</div>':'')+
  '</div>';
}
function table(a,chs){
  let rows=a.products.slice();
  if(st.mode==="profit")rows=rows.filter(p=>p.costed&&p.profit>0).sort((x,y)=>y.profit-x.profit);
  if(st.mode==="loss")rows=rows.filter(p=>p.costed&&(p.profit<=0||(p.margin!=null&&p.margin<.05))).sort((x,y)=>x.profit-y.profit);
  const head='<tr><th>الصنف</th>'+chs.map(c=>'<th>'+esc(c)+' · كمية</th><th>'+esc(c)+' · مبيعات</th>').join("")+'<th>الإيراد الصافي</th><th>الكمية</th><th>التكلفة</th><th>مجمل الربح</th><th>الهامش</th></tr>';
  const body=rows.map(p=>'<tr data-cp-row="'+esc(p.key)+'"'+(st.sel===p.key?' class="on"':'')+'><td><button type="button" class="linkish" data-cp-sel="'+esc(p.key)+'">'+esc(p.key)+'</button>'+(p.costed<p.lines?' <span class="sksev info">'+(p.costed?"تغطية جزئية":"بلا تكلفة")+'</span>':'')+'</td>'+
    chs.map(c=>{const x=p.channels[c];return '<td class="num'+(x?'':' dim')+'">'+(x?SKCharts.compact(x.qty):"—")+'</td><td class="num'+(x?'':' dim')+'">'+(x?sar(x.revenue):"—")+'</td>'}).join("")+
    '<td class="num">'+sar(p.revenue)+'</td><td class="num">'+SKCharts.compact(p.qty)+'</td><td class="num">'+(p.costed?sar(p.cost):"—")+'</td><td class="num"><b class="'+(p.profit<0?"neg":"")+'">'+(p.costed?sar(p.profit):"—")+'</b></td><td class="num"><span class="sksev '+tone(p.margin)+'">'+pct(p.margin)+'</span></td></tr>').join("");
  return '<div class="skcp-head"><h4>الأصناف حسب القناة</h4><span class="sk-seg">'+[["all","الكل"],["profit","الأعلى ربحاً"],["loss","الخاسرة والضعيفة"]].map(([k,l])=>'<button type="button" data-cp-mode="'+k+'" aria-pressed="'+(st.mode===k)+'">'+l+'</button>').join("")+'</span></div>'+
    '<div class="tbr-tw skcp-table"><table class="sk-table"><thead>'+head+'</thead><tbody>'+(body||'<tr><td colspan="'+(6+chs.length*2)+'" class="dim">لا أصناف في هذا الاختيار.</td></tr>')+'</tbody></table></div>';
}
function detail(a){
  const p=a.products.find(x=>x.key===st.sel);if(!p)return "";
  const L=C().COMPONENT_LABELS,parts=Object.keys(L).filter(k=>p.breakdown[k]);
  return '<section class="skcp-detail" aria-label="تفاصيل الصنف"><div class="skcp-head"><h4>'+esc(p.key)+(p.category?' <small>'+esc(p.category)+'</small>':'')+'</h4><button type="button" class="btn sm" data-cp="unsel">إغلاق</button></div>'+
    '<div class="skcp-kpis sm">'+kpi("الإيراد الصافي",sar(p.revenue))+kpi("الكمية",SKCharts.compact(p.qty))+kpi("التكلفة",p.costed?sar(p.cost):"—")+kpi("مجمل الربح",p.costed?sar(p.profit):"—","",p.profit<0?"bad":"")+kpi("الهامش",pct(p.margin),"",tone(p.margin))+'</div>'+
    '<div class="skcp-grid"><div class="skcp-card"><h4>حسب القناة</h4>'+SKCharts.hbars({rows:Object.entries(p.channels).map(([k,v])=>({label:k,value:Math.round(v.revenue/100)})),fmt:v=>SKCharts.compact(v)+" ر.س"})+'</div>'+
    '<div class="skcp-card"><h4>تفصيل مكونات التكلفة</h4>'+(parts.length?'<div class="skcp-break">'+parts.map(k=>'<div><small>'+esc(L[k])+'</small><b class="num">'+sar(p.breakdown[k])+'</b></div>').join("")+'</div>':'<p class="hint">التكلفة مستوردة أو من الكتالوج — لا مكونات.</p>')+'</div></div></section>';
}
/* the preview line alone — typing in the form never re-renders the chapter (it would drop the next field's input) */
function previewHTML(f){const pv=C().previewRule(f,Number(st.pv.qty)||0,Number(st.pv.sales)||0,!!st.pv.cond);
  return 'التكلفة <b class="num">'+sar(pv.cost)+'</b> · للوحدة <b class="num">'+(pv.perUnit==null?"—":sar(pv.perUnit))+'</b> · الربح <b class="num '+(pv.profit<0?"neg":"")+'">'+sar(pv.profit)+'</b> · الهامش <span class="sksev '+tone(pv.margin)+'">'+pct(pv.margin)+'</span>'}
/* ---------- the cost rule editor: the v16 form as one grouped table, with a live preview ---------- */
const FIELDS=[["g","تكلفة المنتج المباشرة"],["purchase","تكلفة الشراء قبل الضريبة","لكل وحدة أو كجم",""],["vatPct","ضريبة الشراء ٪","نسبة من الشراء","includeVat"],["packaging","التغليف","لكل وحدة",""],["processing","تجهيز / تقطيع","لكل وحدة",""],["otherUnit","مصروف آخر للوحدة","لكل وحدة",""],
  ["g","رسوم القناة والمبيعات"],["platformPct","عمولة المنصة ٪","من قيمة البيع",""],["platformFixed","رسوم منصة ثابتة","لكل طلب (تُوزّع على بنوده)",""],["cardPct","عمولة البطاقة ٪","من قيمة البيع","cardMode"],["vipPct","خصم العميل المميز ٪","من قيمة البيع","vipMode"],["otherPct","مصروفات أخرى ٪","من قيمة البيع",""],
  ["g","رسوم الطلب والشحن"],["shipping","تكلفة الشحن المجاني","لكل طلب (تُوزّع على بنوده)","shippingMode"]];
const MODES={includeVat:[["false","قابلة للاسترداد — لا تُضاف"],["true","تُضاف للتكلفة"]],cardMode:[["conditional","عند الدفع ببطاقة فقط"],["all","على كل المبيعات"]],vipMode:[["conditional","للعميل المميز فقط"],["all","على كل المبيعات"]],shippingMode:[["conditional","للطلب بشحن مجاني فقط"],["all","على كل الطلبات"]]};
function form(products,chs){
  const f=st.form||{product:"",channel:"",from:"",to:"",note:"",vatPct:15,includeVat:false,cardMode:"conditional",vipMode:"conditional",shippingMode:"conditional"};st.form=f;
  const v=k=>f[k]==null?"":f[k];
  return '<section class="skcp-rule"><div class="skcp-head"><h4>'+(st.edit?"تعديل قاعدة التكلفة":"قاعدة تكلفة جديدة")+'</h4><span class="hint">كل حركة بيع تأخذ القاعدة السارية في تاريخها لنفس الصنف والقناة</span></div>'+
    '<div class="tbr-tw"><table class="sk-table skcp-form" data-sk-plain><thead><tr><th>الصنف</th><th>القناة</th><th>من تاريخ</th><th>إلى تاريخ</th><th>ملاحظة</th></tr></thead><tbody><tr>'+
    '<td><input data-cpr="product" list="skcp-prods" value="'+esc(v("product"))+'" placeholder="الصنف" aria-label="الصنف"><datalist id="skcp-prods">'+products.map(p=>'<option value="'+esc(p)+'">').join("")+'</datalist></td>'+
    '<td><select data-cpr="channel" aria-label="القناة"><option value="">كل القنوات</option>'+chs.map(c=>'<option'+(c===f.channel?' selected':'')+'>'+esc(c)+'</option>').join("")+'</select></td>'+
    '<td><input type="date" data-cpr="from" value="'+esc(v("from"))+'" aria-label="من"></td><td><input type="date" data-cpr="to" value="'+esc(v("to"))+'" aria-label="إلى"></td><td><input data-cpr="note" value="'+esc(v("note"))+'" placeholder="عقد المورد لشهر يناير" aria-label="ملاحظة"></td></tr></tbody></table></div>'+
    '<div class="tbr-tw"><table class="sk-table skcp-form" data-sk-plain><thead><tr><th>بند التكلفة</th><th>أساس الاحتساب</th><th>القيمة</th><th>التطبيق</th></tr></thead><tbody>'+
    FIELDS.map(r=>r[0]==="g"?'<tr class="skcp-g"><td colspan="4">'+esc(r[1])+'</td></tr>':'<tr><td>'+esc(r[1])+'</td><td class="dim">'+esc(r[2])+'</td><td><input type="number" min="0" step="0.001" class="num" data-cpr="'+r[0]+'" value="'+esc(v(r[0]))+'" placeholder="0" aria-label="'+esc(r[1])+'"></td><td>'+(r[3]?'<select data-cpr="'+r[3]+'" aria-label="طريقة التطبيق">'+MODES[r[3]].map(([k,l])=>'<option value="'+k+'"'+(String(f[r[3]])===k?' selected':'')+'>'+l+'</option>').join("")+'</select>':'<span class="sksev ok">تُطبّق دائماً</span>')+'</td></tr>').join("")+
    '</tbody></table></div>'+
    '<div class="skcp-preview"><label>كمية المعاينة<input type="number" min="0" step="0.001" data-cpv="qty" value="'+esc(st.pv.qty)+'"></label><label>مبلغ البيع شاملاً الضريبة<input type="number" min="0" step="0.01" data-cpv="sales" value="'+esc(st.pv.sales)+'"></label>'+
    '<label class="skcp-check"><input type="checkbox" data-cpv="cond"'+(st.pv.cond?' checked':'')+'> بطاقة + عميل مميز + شحن مجاني</label>'+
    '<output aria-live="polite">'+previewHTML(f)+'</output></div>'+
    '<div class="sk-actions"><button type="button" class="btn sm primary" data-cp="save">'+(st.edit?"حفظ التعديل":"حفظ القاعدة")+'</button><button type="button" class="btn sm" data-cp="reset">تفريغ الحقول</button>'+
    '<button type="button" class="btn sm" data-tpl-dl="costrules">قالب قواعد التكلفة</button><button type="button" class="btn sm" data-tpl-in="costrules">استيراد القواعد</button><button type="button" class="btn sm" data-cp="export">تصدير القواعد</button></div></section>';
}
function ruleTable(){
  const R=rules(),f=x=>x==null||x===""?'<span class="dim">—</span>':esc(String(x));
  if(!R.length)return '<p class="hint">لا قواعد بعد. بدونها تُستخدم تكلفة الصنف من الكتالوج إن وُجدت.</p>';
  return '<div class="tbr-tw"><table class="sk-table"><thead><tr><th>الصنف</th><th>القناة</th><th>من</th><th>إلى</th><th>الشراء</th><th>ضريبة</th><th>تغليف</th><th>تجهيز</th><th>أخرى/وحدة</th><th>منصة ٪</th><th>ثابتة</th><th>بطاقة ٪</th><th>مميز ٪</th><th>أخرى ٪</th><th>شحن</th><th>ملاحظة</th><th>إجراء</th></tr></thead><tbody>'+
    R.map(r=>'<tr><td>'+esc(r.product)+'</td><td>'+esc(r.channel||"كل القنوات")+'</td><td class="mono">'+f(r.from)+'</td><td class="mono">'+f(r.to)+'</td><td class="num">'+f(r.purchase??r.cost)+'</td><td>'+(r.includeVat?f(r.vatPct)+"٪":'<span class="dim">مستردة</span>')+'</td><td class="num">'+f(r.packaging)+'</td><td class="num">'+f(r.processing)+'</td><td class="num">'+f(r.otherUnit)+'</td><td class="num">'+f(r.platformPct)+'</td><td class="num">'+f(r.platformFixed)+'</td><td class="num">'+f(r.cardPct)+'</td><td class="num">'+f(r.vipPct)+'</td><td class="num">'+f(r.otherPct)+'</td><td class="num">'+f(r.shipping)+'</td><td>'+f(r.note)+'</td>'+
      '<td class="skcp-acts"><button type="button" class="linkish" data-cp-edit="'+esc(r.id)+'">تعديل</button> <button type="button" class="linkish" data-cp-del="'+esc(r.id)+'">حذف</button></td></tr>').join("")+'</tbody></table></div>';
}

/* ---------- the chapter ---------- */
async function render(){
  const all=await allLines(),chs=[...new Set(all.map(l=>C().normalizeChannel(l.channel)||"غير محدد"))].sort((a,b)=>{const o=["المعرض","الجملة","المتجر","هنغرستيشن"];return (o.indexOf(a)+1||9)-(o.indexOf(b)+1||9)||a.localeCompare(b,"ar")});
  if(st.chs)st.chs=st.chs.filter(c=>chs.includes(c));if(st.chs&&!st.chs.length)st.chs=null;
  const products=[...new Set(all.map(l=>l.product))].sort((a,b)=>a.localeCompare(b,"ar"));
  const a=C().analyze(all,rules(),{from:st.from||undefined,to:st.to||undefined,product:st.product||undefined,channels:st.chs||undefined,catalogCost:catalogCostFn(),vat:SK.vatRate?SK.vatRate():0.15});
  const T=a.totals,top=a.channels[0],imp=imported();
  const intro='<p class="hint">التكلفة لكل حركة من قاعدة التكلفة السارية في تاريخها لنفس الصنف والقناة؛ الرسوم الثابتة للطلب تُوزّع على بنوده. الأولوية: تكلفة مستوردة ← ربح مستورد ← القاعدة ← تكلفة الكتالوج. الإيراد صافٍ من الضريبة، ونِسَب الرسوم من المبلغ المدفوع.</p>';
  if(!all.length)return intro+'<div class="skcp-empty"><b>لا سطور مبيعات بعد</b><p>استورد مبيعات التطبيق من «العملاء والمبيعات»، أو ارفع ملف لوحة القنوات (v16) بالقالب.</p><div class="sk-actions"><button type="button" class="btn sm primary" data-tpl-in="channelsales">استيراد مبيعات القنوات</button><button type="button" class="btn sm" data-tpl-dl="channelsales">تنزيل القالب</button></div></div>';
  const note=T.undatedOut?'<p class="hint skcp-note">'+T.undatedOut+' حركة بلا تاريخ (مثل تقرير PDF ملخّص) خارج هذه الفترة — امسح التاريخين لتدخل في الأرقام.</p>':'';
  return intro+filters(chs,products)+note+
    '<div class="skcp-kpis">'+
      kpi("الإيراد الصافي",sark(T.revenue)+' <small>ر.س</small>',T.lines+" حركة",'',SK.icon("cash"))+
      kpi("التكلفة",sark(T.cost)+' <small>ر.س</small>',"على "+T.costed+" حركة مغطاة",'',SK.icon("receivables"))+
      kpi("مجمل الربح",sark(T.profit)+' <small>ر.س</small>',"من الإيراد المغطى بالتكلفة",T.profit<0?"bad":"ok",SK.icon("execreports"))+
      kpi("الهامش",pct(T.margin),"مجمل الربح ÷ الإيراد المغطى",tone(T.margin),SKCharts.ring(T.margin==null?0:Math.max(0,T.margin*100),{size:38}))+
      kpi("أعلى قناة",top?esc(top.key):"—",top?sark(top.revenue)+" ر.س · "+pct(top.share)+" من الإيراد":"",'',SK.icon("commerce"))+
      kpi("الأصناف النشطة",String(a.products.length),"لها حركة في الاختيار",'',SK.icon("inventory"))+
      kpi("تغطية التكلفة",pct(T.coverage),T.missingLines?T.missingLines+" حركة بلا تكلفة":"كل الحركات مسعّرة",T.coverage<.99?"warn":"ok",SKCharts.ring(T.coverage*100,{size:38}))+
    '</div>'+
    '<h4 class="skcp-h">التوصيات المبنية على القواعد <small>بلا ذكاء اصطناعي — تتغير مع الأرقام والفلاتر</small></h4>'+recs(a.recommendations)+
    charts(a)+table(a,st.chs||chs)+detail(a)+
    '<h4 class="skcp-h">قواعد التكلفة حسب فترة السريان والقناة</h4>'+form(products,chs)+ruleTable()+
    '<div class="sk-actions skcp-foot"><button type="button" class="btn sm" data-cp="print">'+SK.icon("execreports")+' تقرير الربحية للطباعة</button><button type="button" class="btn sm" data-cp="csv">تصدير الجدول CSV</button>'+
      '<button type="button" class="btn sm" data-tpl-in="channelsales">استيراد مبيعات القنوات (v16)</button><button type="button" class="btn sm" data-tpl-dl="channelsales">قالب مبيعات القنوات</button>'+
      (imp.lines.length?'<button type="button" class="btn sm danger" data-cp="dropimp">حذف السطور المستوردة ('+imp.lines.length+')</button>':'')+'</div>';
}

/* ---------- the printable report (the letterhead of the open company) ---------- */
async function printReport(){
  const all=await allLines(),a=C().analyze(all,rules(),{from:st.from||undefined,to:st.to||undefined,product:st.product||undefined,channels:st.chs||undefined,catalogCost:catalogCostFn()}),T=a.totals;
  const biz=SK.bizName?SK.bizName():"",period=(st.from||"البداية")+" ← "+(st.to||"اليوم");
  const html='<header class="skcp-ph"><div><h1>تقرير الربحية حسب القنوات</h1><p>'+esc(biz)+' · '+esc(period)+' · القنوات: '+esc((st.chs||a.channels.map(c=>c.key)).join("، "))+'</p></div></header>'+
    '<div class="skcp-pk">'+[["الإيراد الصافي",sar(T.revenue)],["التكلفة",sar(T.cost)],["مجمل الربح",sar(T.profit)],["الهامش",pct(T.margin)],["تغطية التكلفة",pct(T.coverage)]].map(([l,v])=>'<div><small>'+l+'</small><b>'+v+'</b></div>').join("")+'</div>'+
    '<h3>القنوات</h3><table><thead><tr><th>القناة</th><th>الإيراد</th><th>الحصة</th><th>التكلفة</th><th>الربح</th><th>الهامش</th></tr></thead><tbody>'+a.channels.map(c=>'<tr><td>'+esc(c.key)+'</td><td>'+sar(c.revenue)+'</td><td>'+pct(c.share)+'</td><td>'+sar(c.cost)+'</td><td>'+sar(c.profit)+'</td><td>'+pct(c.margin)+'</td></tr>').join("")+'</tbody></table>'+
    '<h3>الأصناف</h3><table><thead><tr><th>الصنف</th><th>الكمية</th><th>الإيراد</th><th>التكلفة</th><th>الربح</th><th>الهامش</th></tr></thead><tbody>'+a.products.map(p=>'<tr><td>'+esc(p.key)+'</td><td>'+SKCharts.compact(p.qty)+'</td><td>'+sar(p.revenue)+'</td><td>'+(p.costed?sar(p.cost):"—")+'</td><td>'+(p.costed?sar(p.profit):"—")+'</td><td>'+pct(p.margin)+'</td></tr>').join("")+'</tbody></table>'+
    '<h3>التوصيات</h3><ul>'+a.recommendations.map(r=>'<li><b>'+esc(r.title)+'</b> — '+esc(r.body)+'</li>').join("")+'</ul>'+
    '<p class="skcp-pn">التكلفة من قواعد التكلفة السارية في تاريخ كل حركة؛ الأرقام بالريال السعودي، الإيراد صافٍ من الضريبة. صادر من SQC في '+new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn")+'.</p>';
  /* window.open("") opens the app's own preview (SK.output: paper, letterhead, PDF, Excel of every table) */
  const w=window.open("");if(!w){SK.toast("تعذر فتح المعاينة","warn");return}
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تقرير الربحية حسب القنوات</title><body>'+html+'</body></html>');w.document.close();
  /* the app's own letterhead and print identity (FOUNDATION §3.11.1), then this report's few layout rules */
  if(SK.brandPrint)SK.brandPrint(w,"تقرير الربحية حسب القنوات");
  const st=w.document.createElement("style");st.textContent=(window.SK&&SK.brandCSS?SK.brandCSS:String)(PRINT);(w.document.head||w.document.documentElement).appendChild(st);
}
const PRINT='body{font-family:"IBM Plex Sans Arabic",Tahoma,sans-serif;color:#0b1030;margin:12mm}h1{margin:0;font-size:22px}h3{margin:18px 0 8px;font-size:14px;border-inline-start:4px solid #19c3d9;padding-inline-start:8px}.skcp-ph{border-bottom:3px solid #2340c4;padding-bottom:10px;margin-bottom:14px}.skcp-ph p{margin:4px 0 0;color:#585f6e;font-size:11px}.skcp-pk{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.skcp-pk div{border:1px solid #e2e6f1;border-radius:10px;padding:8px}.skcp-pk small{display:block;color:#585f6e;font-size:10px}.skcp-pk b{font-size:15px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#0b1030;color:#fff}th,td{border:1px solid #e2e6f1;padding:5px;text-align:center}td:first-child{text-align:start}.skcp-pn{font-size:9px;color:#585f6e;margin-top:14px}@page{size:A4;margin:8mm}';

/* ---------- events (one set, on the document; the chapter re-renders through the lab) ---------- */
const repaint=()=>{if(window.SKosifSalesLab&&SKosifSalesLab.repaint)SKosifSalesLab.repaint()};
function readForm(){const f={...(st.form||{})};document.querySelectorAll("[data-cpr]").forEach(el=>{const k=el.dataset.cpr;f[k]=el.type==="number"?(el.value===""?undefined:Number(el.value)):k==="includeVat"?el.value==="true":el.value.trim()});st.form=f;return f}
document.addEventListener("click",async e=>{
  const t=e.target;if(!t.closest||!t.closest(".skslab"))return;
  const ch=t.closest("[data-cp-ch]");if(ch){const all=[...document.querySelectorAll("[data-cp-ch]")].map(b=>b.dataset.cpCh),on=new Set(st.chs||all),c=ch.dataset.cpCh;
    if(on.has(c)){if(on.size===1){SK.toast("أبقِ قناة واحدة على الأقل","warn");return}on.delete(c)}else on.add(c);st.chs=on.size===all.length?null:[...on];repaint();return}
  const md=t.closest("[data-cp-mode]");if(md){st.mode=md.dataset.cpMode;repaint();return}
  const sel=t.closest("[data-cp-sel]");if(sel){st.sel=st.sel===sel.dataset.cpSel?"":sel.dataset.cpSel;repaint();return}
  const ed=t.closest("[data-cp-edit]");if(ed){const r=rules().find(x=>x.id===ed.dataset.cpEdit);if(r){st.edit=r.id;st.form={...r,purchase:r.purchase??r.cost};delete st.form.cost;repaint();setTimeout(()=>{const el=document.querySelector(".skcp-rule");if(el)el.scrollIntoView({block:"start",behavior:"smooth"})},60)}return}
  const dl=t.closest("[data-cp-del]");if(dl){const ok=await (SK.confirm?SK.confirm("حذف قاعدة التكلفة؟",{danger:true,ok:"حذف"}):Promise.resolve(confirm("حذف قاعدة التكلفة؟")));if(!ok)return;SK.save(RK,rules().filter(x=>x.id!==dl.dataset.cpDel));if(st.edit===dl.dataset.cpDel){st.edit="";st.form=null}SK.toast("حُذفت القاعدة","ok");repaint();return}
  const tk=t.closest("[data-cp-task]");if(tk){if(window.SKosifTasks&&SKosifTasks.add){SKosifTasks.add({title:"الربحية: "+tk.dataset.cpTask,cap:"salesintel",priority:"normal"});SK.toast("أُضيفت إلى المهام","ok")}return}
  const b=t.closest("[data-cp]");if(!b)return;const act=b.dataset.cp;
  if(act==="clear"){Object.assign(st,{from:"",to:"",product:"",chs:null,mode:"all",sel:""});repaint()}
  else if(act==="allch"){st.chs=null;repaint()}
  else if(act==="unsel"){st.sel="";repaint()}
  else if(act==="reset"){st.form=null;st.edit="";repaint()}
  else if(act==="save"){const f=readForm();if(!f.product){SK.toast("اختر الصنف","warn");return}if(f.from&&f.to&&f.from>f.to){SK.toast("تاريخ البداية بعد النهاية","warn");return}
    const comp=["purchase","packaging","processing","otherUnit","platformPct","platformFixed","cardPct","vipPct","otherPct","shipping"];if(!comp.some(k=>Number(f[k])>0)){SK.toast("أدخل بنداً واحداً على الأقل","warn");return}
    const clash=rules().find(r=>r.id!==st.edit&&C().normalizeText(r.product)===C().normalizeText(f.product)&&(r.channel||"")===(f.channel||"")&&(!r.to||!f.from||f.from<=r.to)&&(!f.to||!r.from||r.from<=f.to));
    const rec={...f,id:st.edit||"cr-"+Date.now().toString(36)};comp.concat(["vatPct"]).forEach(k=>{if(rec[k]===undefined||Number.isNaN(rec[k]))delete rec[k]});
    SK.save(RK,st.edit?rules().map(r=>r.id===st.edit?rec:r):[...rules(),rec]);st.edit="";st.form=null;
    SK.toast(clash?"حُفظت القاعدة — تتداخل فترتها مع قاعدة أخرى لنفس الصنف والقناة؛ الأحدث بدايةً تغلب":"حُفظت قاعدة التكلفة",clash?"warn":"ok");repaint()}
  else if(act==="export"){const R=rules();SK.csv.download("SQC-cost-rules.csv",["الصنف","القناة","من","إلى","الشراء","ضريبة الشراء ٪","تُضاف الضريبة","التغليف","التجهيز","أخرى للوحدة","عمولة المنصة ٪","رسوم منصة ثابتة","عمولة البطاقة ٪","تطبيق البطاقة","خصم المميز ٪","تطبيق المميز","أخرى ٪","الشحن المجاني","تطبيق الشحن","ملاحظة"],
    R.map(r=>[r.product,r.channel||"",r.from||"",r.to||"",r.purchase??r.cost??"",r.vatPct??"",r.includeVat?"نعم":"لا",r.packaging??"",r.processing??"",r.otherUnit??"",r.platformPct??"",r.platformFixed??"",r.cardPct??"",r.cardMode||"",r.vipPct??"",r.vipMode||"",r.otherPct??"",r.shipping??"",r.shippingMode||"",r.note||""]))}
  else if(act==="csv"){const all=await allLines(),a=C().analyze(all,rules(),{from:st.from||undefined,to:st.to||undefined,product:st.product||undefined,channels:st.chs||undefined,catalogCost:catalogCostFn()});
    SK.csv.download("SQC-channel-profit.csv",["الصنف","الكمية","الإيراد الصافي","التكلفة","مجمل الربح","الهامش ٪"],a.products.map(p=>[p.key,p.qty,p.revenue/100,p.costed?p.cost/100:"",p.costed?p.profit/100:"",p.margin==null?"":Math.round(p.margin*1000)/10]))}
  else if(act==="print")printReport();
  else if(act==="dropimp"){const ok=await (SK.confirm?SK.confirm("حذف كل سطور المبيعات المستوردة من لوحة القنوات؟ لا تُمس مبيعات التطبيق.",{danger:true,ok:"حذف"}):Promise.resolve(confirm("حذف السطور المستوردة؟")));if(!ok)return;SK.save(LK,{lines:[],catalog:imported().catalog});repaint()}
});
document.addEventListener("change",e=>{
  const t=e.target;if(!t.closest||!t.closest(".skslab"))return;
  const f=t.closest("[data-cpf]");if(f){st[f.dataset.cpf]=f.value;st.sel="";repaint();return}
  const v=t.closest("[data-cpv]");if(v){st.pv[v.dataset.cpv]=v.type==="checkbox"?v.checked:v.value;livePreview();return}
  if(t.closest("[data-cpr]"))livePreview();
});
function livePreview(){const o=document.querySelector(".skcp-preview output");if(o)o.innerHTML=previewHTML(readForm())}
document.addEventListener("input",e=>{const t=e.target;if(t.closest&&t.closest(".skslab")&&t.closest("[data-cpr],[data-cpv]")){if(t.dataset.cpv)st.pv[t.dataset.cpv]=t.type==="checkbox"?t.checked:t.value;livePreview()}});

window.SKosifChannelProfit=Object.freeze({render,state:()=>({...st})});
})();

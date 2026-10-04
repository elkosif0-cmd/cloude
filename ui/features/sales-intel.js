/* S.kosif — «ذكاء المبيعات» (#sales → salesintel), rebuilt on one tested engine: SKEngines.sales.salesInsights.
   A period (30 / 90 days, 12 months, all) and a channel drive every card: six KPIs against the equal period
   before, the 30-day forecast whose model a backtest chose, the health score with its five parts, RFM in nine
   named segments (click one to list its customers), follow-up by each customer's own rhythm (WhatsApp + task),
   items ABC with momentum, channel mix, weekday averages, basket affinity (lift), monthly cohorts, data quality
   and recommendations that name their number. Excel workbook and a printable report of the same numbers.
   The core renders <div data-si-host> for this screen when this module is loaded (its v16 view stays as the
   fallback); «مختبر المبيعات» (sales-lab.js) still mounts below. Data: IndexedDB aghnam-app-v7, read only. */
(()=>{
"use strict";
const {esc}=SK;
const E=()=>SKEngines.sales.salesInsights;
const PREF="sqc_salesintel_v1";
const nf0=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0});
const sar=h=>nf0.format(Math.round((Number(h)||0)/100));
const pct=(v,d=0)=>v==null?"—":(Math.round(v*100*10**d)/10**d)+"٪";
const short=d=>String(d||"").slice(5).replace("-","/");
const I=()=>SKEngines.sales.salesInsights,orders=n=>I().countAr(n,I().ORDERS_AR),custs=n=>I().countAr(n,I().CUSTOMERS_AR);
let st=Object.assign({period:"90",channel:""},SK.load(PREF,{}),{seg:"",mode:"follow"});
let raw=null,res=null,resKey="",seq=0;
const DL='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>';

/* ---------- data: the core's stores, read only ---------- */
function idbAll(store){return new Promise(res=>{let q;try{q=indexedDB.open("aghnam-app-v7")}catch{return res([])}q.onerror=()=>res([]);
  q.onsuccess=()=>{const db=q.result;if(!db.objectStoreNames.contains(store)){db.close();return res([])}const g=db.transaction(store).objectStore(store).getAll();
    g.onsuccess=()=>{db.close();res(g.result||[])};g.onerror=()=>{db.close();res([])}}})}
async function load(){
  const [L,C]=await Promise.all([idbAll("sales_lines"),idbAll("customers")]);
  const lines=L.map(l=>({date:String(l.date||"").slice(0,10),amount:Number.isFinite(+l.amountHalalas)&&l.amountHalalas!==""&&l.amountHalalas!=null?+l.amountHalalas:Math.round((+l.amount||0)*100),
    qty:+l.qty||0,product:String(l.descriptionOriginal||l.product||"").trim(),customerId:l.customerId||"",
    invoice:String(l.source||"")+"|"+String(l.ref||l.externalOrderId||l.id||""),channel:String(l.source||"").trim()}));
  const customers=C.map(c=>({id:String(c.id),name:c.name||"",phone:c.phone||"",city:c.city||""}));
  const key=lines.length+"|"+customers.length+"|"+lines.reduce((a,l)=>l.date>a?l.date:a,"")+"|"+lines.reduce((a,l)=>a+l.amount,0);
  return {lines,customers,key};
}
function compute(){
  if(!raw)return null;const k=raw.key+"|"+st.period+"|"+st.channel;if(res&&resKey===k)return res;
  res=E().salesInsights(raw.lines,raw.customers,{period:st.period,channel:st.channel||undefined});resKey=k;
  if(st.channel&&!res.channels.includes(st.channel)){st.channel="";save();SK.toast("القناة السابقة لم تعد متاحة؛ تُعرض كل القنوات الآن.","warn");return compute()}
  return res;
}

/* ---------- pieces ---------- */
const chip=(d,{pp,inverse}={})=>{
  if(d==null)return '<span class="si-d none">لا فترة سابقة</span>';
  const up=d>0,good=inverse?!up:up,cls=d===0?"flat":good?"up":"down";
  /* the arrow carries the sign: a bare «-21.6٪» flips to «21.6٪-» in Arabic text */
  return '<span class="si-d '+cls+'" aria-label="'+(up?"ارتفاع ":d<0?"انخفاض ":"")+Math.abs(d)+(pp?" نقطة":"٪")+'"><span aria-hidden="true">'+(d===0?"■":up?"▲":"▼")+'</span>'+Math.abs(d)+(pp?" نقطة":"٪")+'</span>';
};
function kpis(r){
  const K=r.kpis,rr=K.repeatRate,ppd=rr.prev==null?null:Math.round((rr.cur-rr.prev)*1000)/10;
  const card=(label,val,d,how,extra)=>'<div class="si-kpi" title="'+esc(how)+'"><small>'+esc(label)+'</small><b>'+val+'</b><div class="si-kpi-f">'+d+(extra||"")+'</div></div>';
  const v=r.trend.values,step=v.length>120?7:1,spark=[];for(let i=v.length%step;i<v.length;i+=step)spark.push(v.slice(i,i+step).reduce((a,b)=>a+b,0));
  return '<div class="si-kpis">'+
    card("صافي الإيراد",sar(K.revenue.cur)+' <i>ر.س</i>',chip(K.revenue.delta),"مجموع مبالغ سطور البيع في الفترة بعد المرتجعات",SKCharts.spark(spark,{w:92,h:26}))+
    card("الطلبات",nf0.format(K.orders.cur),chip(K.orders.delta),"عدد الطلبات بقيمة موجبة (المرتجع ليس طلباً)")+
    card("متوسط الطلب",sar(K.avgOrder.cur)+' <i>ر.س</i>',chip(K.avgOrder.delta),"مجموع الطلبات الموجبة ÷ عددها")+
    card("العملاء النشطون",nf0.format(K.customers.cur),chip(K.customers.delta),"عملاء لهم طلب موجب واحد على الأقل في الفترة")+
    card("عملاء جدد",nf0.format(K.newCustomers.cur),chip(K.newCustomers.delta),"عملاء كان أول طلب لهم على الإطلاق داخل الفترة")+
    card("نسبة التكرار",pct(rr.cur),chip(ppd,{pp:true}),"نسبة العملاء النشطين الذين طلبوا أكثر من مرة في الفترة",K.returns.cur?'<span class="si-ret">مرتجعات '+sar(K.returns.cur)+'</span>':"")+'</div>';
}
function forecast(r){
  const f=r.forecast;
  if(!f.model)return '<div class="si-empty">التوقع يحتاج 14 يوماً على الأقل من المبيعات.</div>';
  const back=Math.min(28,r.trend.values.length),aL=r.trend.labels.slice(-back),aV=r.trend.values.slice(-back);
  const labels=[...aL,...f.labels].map(short),actual=[...aV.map(v=>Math.round(v/100)),...f.daily.map(()=>0)],fc=[...aV.map(()=>0),...f.daily.map(v=>Math.round(v/100))];
  const week=f.daily.slice(0,7).reduce((a,b)=>a+b,0),M=SKEngines.sales.salesInsights.MODEL_AR;
  const cand=f.candidates.length?f.candidates.map(c=>M[c.model]+" "+(c.wape==null?"—":Math.round(c.wape*100)+"٪")).join(" · "):"";
  const acc=f.wape==null?"بيانات أقل من 60 يوماً — بلا اختبار":"خطأ أسبوعي "+Math.round(f.wape*100)+"٪"+(f.totalError==null?"":" · خطأ مجموع الشهر "+Math.round(f.totalError*100)+"٪");
  return SKCharts.bars({labels,series:[{name:"فعلي (ر.س)",values:actual},{name:"متوقع (ر.س)",values:fc,color:"var(--sk-c2)"}],stacked:true,height:200,title:"آخر "+back+" يوماً والثلاثون القادمة"})+
    '<div class="si-mini">'+
      '<div><small>المتوقع 30 يوماً</small><b>'+sar(f.total)+'</b><span>نطاق 80٪: '+sar(f.low)+' – '+sar(f.high)+'</span></div>'+
      '<div><small>الأسبوع القادم</small><b>'+sar(week)+'</b><span>من '+short(f.labels[0])+' إلى '+short(f.labels[6])+'</span></div>'+
      '<div><small>النموذج</small><b class="sm">'+esc(M[f.model])+'</b><span>'+esc(acc)+'</span></div></div>'+
    '<p class="hint">كل نموذج دُرّب على ما قبل آخر 30 يوماً ثم قيس خطؤه على مجاميعها الأسبوعية'+(cand?" ("+esc(cand)+")":"")+'، واختير الأقل خطأً. التوقع إرشادي وليس وعداً.</p>';
}
function health(r){
  const h=r.health,cls=h.score>=70?"ok":h.score>=45?"warn":"bad";
  return '<div class="si-health">'+SKCharts.ring(h.score,{cls,size:92})+
    '<div class="si-parts">'+h.parts.map(p=>'<div class="si-part"><span>'+esc(p.label)+'</span><b>'+p.points+'<small>/20</small></b><div class="si-bar-t"><i class="'+(p.points>=14?"ok":p.points>=8?"warn":"bad")+'" style="width:'+(p.points*5)+'%"></i></div><small>'+esc(p.note)+'</small></div>').join("")+'</div></div>'+
    '<p class="hint">خمسة أجزاء من 20 نقطة لكل منها. درجة إرشادية لترتيب الاهتمام، وليست معياراً محاسبياً.</p>';
}
function segments(r){
  const tot=r.customers.length;
  return '<div class="si-segs">'+r.segments.map(s=>'<button type="button" class="si-seg '+s.tone+'" data-si-seg="'+s.key+'" aria-pressed="'+(st.seg===s.key)+'" title="'+esc(s.action)+'">'+
    '<span class="n">'+nf0.format(s.count)+'</span><b>'+esc(s.label)+'</b><small>'+esc(s.desc)+'</small><em>'+pct(s.share)+' من القيمة</em></button>').join("")+'</div>'+
    '<p class="hint">RFM: كل عميل يأخذ درجة 1–5 في الحداثة والتكرار والقيمة (خُمسيات على عملائك أنت)، ومجموع الشرائح = '+custs(tot)+'. اضغط شريحة لعرض عملائها.</p>';
}
const SEGL=()=>Object.fromEntries(SKEngines.sales.salesInsights.SEGMENTS.map(s=>[s.key,s]));
function wa(phone){let d=String(phone||"").replace(/\D/g,"");if(/^05\d{8}$/.test(d))d="966"+d.slice(1);else if(/^5\d{8}$/.test(d))d="966"+d;return d.length>=9?"https://wa.me/"+d:""}
function people(r){
  const S=SEGL();
  const list=st.mode==="seg"&&st.seg?r.customers.filter(c=>c.segment===st.seg).map(c=>({...c,...(r.followup.find(f=>f.id===c.id)||{})})).sort((a,b)=>b.revenue-a.revenue):r.followup;
  const title=st.mode==="seg"&&st.seg?"عملاء شريحة «"+S[st.seg].label+"»":"المتابعة حسب إيقاع كل عميل";
  const tag=s=>s==="overdue"?'<span class="sksev bad">متأخر</span>':s==="due"?'<span class="sksev warn">حان موعده</span>':'<span class="sksev ok">في موعده</span>';
  const rows=list.slice(0,150).map(c=>{const link=wa(c.phone),cad=c.cadenceUsed!=null?c.cadenceUsed:c.cadence,own=c.personal!=null?c.personal:c.cadence!=null;return '<tr><td class="s"><b>'+esc(c.name||"بدون اسم")+'</b></td><td><span class="mono" dir="ltr">'+esc(c.phone||"—")+'</span></td><td>'+esc(c.city||"—")+'</td>'+
    '<td><span class="si-tag '+S[c.segment].tone+'">'+esc(S[c.segment].label)+'</span></td><td class="mono">'+esc(c.last)+'</td><td class="num">'+nf0.format(c.daysSince)+'</td>'+
    '<td class="num">'+(cad!=null?nf0.format(cad)+(own?"":"*"):"—")+'</td><td>'+(c.status?tag(c.status):"—")+'</td><td class="num">'+nf0.format(c.orders)+'</td><td class="money">'+sar(c.revenue)+'</td>'+
    '<td><span class="si-acts">'+(link?'<a class="btn sm" href="'+esc(link)+'" target="_blank" rel="noopener">واتساب ↗</a>':"")+'<button type="button" class="btn sm" data-si-task="'+esc(c.id)+'">+ مهمة</button></span></td></tr>'}).join("");
  return '<div class="si-ph"><div class="sk-seg si-mode" role="group" aria-label="القائمة"><button type="button" data-si-mode="follow" aria-pressed="'+(st.mode!=="seg")+'">حسب الإيقاع ('+nf0.format(r.followup.length)+')</button>'+
      (st.seg?'<button type="button" data-si-mode="seg" aria-pressed="'+(st.mode==="seg")+'">'+esc(S[st.seg].label)+'</button>':'')+'</div>'+
      '<button type="button" class="btn sm" data-si-tasks'+(list.length?"":" disabled")+'>أضف الأعلى 10 إلى المهام</button></div>'+
    '<h4 class="si-sub">'+esc(title)+(st.mode==="seg"&&st.seg?' — <span class="hint">'+esc(S[st.seg].action)+'</span>':'')+'</h4>'+
    (list.length?'<div class="tw"><table class="t si-cust"><thead><tr><th class="s">العميل</th><th data-sk-nosum>الجوال</th><th>المدينة</th><th>الشريحة</th><th>آخر شراء</th><th data-sk-nosum>منذ (يوم)</th><th data-sk-nosum>الإيقاع (يوم)</th><th>الحالة</th><th>الطلبات</th><th>القيمة (ر.س)</th><th class="act">تواصل</th></tr></thead><tbody>'+rows+'</tbody></table></div>':
      '<div class="si-empty">'+(st.mode==="seg"?"لا عملاء في هذه الشريحة.":"لا أحد متأخر عن إيقاعه المعتاد الآن.")+'</div>')+
    '<p class="hint">الإيقاع = وسيط الأيام بين طلبات العميل؛ «متأخر» إذا تجاوز 1.5 مرة من إيقاعه (وأسبوعاً على الأقل). * عميل بطلب واحد: يُقاس بالإيقاع الشائع لعملائك ('+nf0.format(r.typicalCadence)+' يوماً). الترتيب حسب القيمة الشهرية المتوقعة × التأخر.</p>';
}
function products(r){
  const top=r.products.filter(p=>p.revenue>0).slice(0,10),abc=r.abc,w=x=>Math.max(0,x.share*100).toFixed(1);
  const g=v=>v==null?"":" · "+(v>0?"▲ ":v<0?"▼ ":"")+Math.abs(v)+"٪";
  const mv=(xs,up)=>xs.length?'<ul class="si-mv">'+xs.map(p=>'<li><span>'+esc(p.name)+'</span><b class="'+(up?"up":"down")+'">'+(up?"▲ ":"▼ ")+Math.abs(p.growth)+'٪</b></li>').join("")+'</ul>':'<p class="hint">'+(up?"لا أصناف صاعدة بقوة.":"لا أصناف متراجعة بقوة.")+'</p>';
  return '<div class="si-abc" role="img" aria-label="'+esc("A "+pct(abc[0].share)+"، B "+pct(abc[1].share)+"، C "+pct(abc[2].share))+'">'+abc.map(x=>'<i class="'+x.cls.toLowerCase()+'" style="width:'+w(x)+'%"><span>'+x.cls+' · '+x.count+'</span></i>').join("")+'</div>'+
    '<p class="hint">A تصنع أول 80٪ من الإيراد، B حتى 95٪، والباقي C. أعلى 10 أصناف '+pct(r.top10Share)+' · HHI '+nf0.format(r.hhi)+'.</p>'+
    SKCharts.hbars({rows:top.map(p=>({label:p.name,sub:p.cls+" · "+pct(p.share,1)+g(p.growth),value:Math.round(p.revenue/100)})),fmt:v=>SKCharts.compact(v)+" ر.س",sort:false,title:"أعلى الأصناف"})+
    (r.period.prevFrom?'<div class="si-2"><div><h4 class="si-sub">🚀 الصاعدون</h4>'+mv(r.momentum.risers,true)+'</div><div><h4 class="si-sub">🧯 المتراجعون</h4>'+mv(r.momentum.fallers,false)+'</div></div>':"");
}
function channels(r){
  const avgAll=r.weekdays.filter(w=>w.days).reduce((a,w)=>a+w.avg,0)/Math.max(1,r.weekdays.filter(w=>w.days).length);
  return '<h4 class="si-sub">مزيج القنوات</h4>'+SKCharts.hbars({rows:r.channelMix.map(c=>({label:c.name,sub:pct(c.share)+(c.growth==null?"":" · "+(c.growth>0?"▲ ":c.growth<0?"▼ ":"")+Math.abs(c.growth)+"٪"),value:Math.round(c.revenue/100)})),fmt:v=>SKCharts.compact(v)+" ر.س",sort:false,title:"القنوات"})+
    '<h4 class="si-sub">متوسط اليوم حسب يوم الأسبوع</h4>'+SKCharts.hbars({rows:r.weekdays.filter(w=>w.days).map(w=>({label:w.name,sub:orders(w.orders)+" في "+w.days+" يوماً",value:Math.round(w.avg/100),color:w.avg<avgAll*.8?"var(--sk-c2)":undefined})),fmt:v=>SKCharts.compact(v)+" ر.س",sort:false,title:"أيام الأسبوع"})+
    '<p class="hint">متوسط الإيراد لكل يوم من نوعه في الفترة (لا المجموع)، فلا يظلم يوماً تكرر مرات أقل.</p>';
}
function baskets(r){
  if(!r.pairs.length)return '<div class="si-empty">لا أزواج متكررة بعد (متعددة الأصناف في الفترة: '+orders(r.multiItemOrders)+').</div>';
  const lift=l=>l>=1.2?'<span class="sksev ok">×'+l+' ارتباط</span>':l>=.8?'<span class="sksev info">×'+l+' قرب الصدفة</span>':'<span class="sksev warn">×'+l+' نادراً معاً</span>';
  return '<div class="tw"><table class="t" data-sk-plain><thead><tr><th class="s">الزوج</th><th>طلبات معاً</th><th>الدعم</th><th>الثقة أ←ب / ب←أ</th><th>الرفع</th></tr></thead><tbody>'+
    r.pairs.slice(0,10).map(p=>'<tr><td class="s"><b>'+esc(p.a)+'</b> + '+esc(p.b)+'</td><td class="num">'+p.count+'</td><td class="num">'+pct(p.support,1)+'</td><td class="num">'+pct(p.confAB)+' / '+pct(p.confBA)+'</td><td>'+lift(p.lift)+'</td></tr>').join("")+'</tbody></table></div>'+
    '<p class="hint">الثقة: من طلبوا الأول كم منهم طلب الثاني. الرفع فوق 1.2 يعني أنهما يجتمعان أكثر من الصدفة — مرشحان لباقة. من '+orders(r.ordersInPeriod)+' في الفترة.</p>';
}
function cohorts(r){
  const c=r.cohorts;if(!c.rows.length)return '<div class="si-empty">لا عملاء مرتبطين بالطلبات بعد.</div>';
  return SKCharts.matrix({rows:c.rows.map((m,i)=>m+" ("+c.sizes[i]+")"),cols:c.cols.map(k=>k?"+"+k:"الأول"),values:c.values.map(r=>r.map(v=>v==null?0:v)),fmt:v=>v+"٪"})+
    '<p class="hint">كل صف: عملاء أول طلب لهم في ذلك الشهر (والعدد بين القوسين)، وكل عمود: نسبة من عاد منهم بعد شهر، شهرين… الخلايا الفارغة لم يحن وقتها أو صفر.</p>';
}
function recs(r){
  if(!r.recs.length)return '<div class="si-empty">المؤشرات مستقرة ولا توصيات ملحة الآن.</div>';
  const S=SEGL(),capL=id=>{try{const c=SK.caps&&SK.caps.get(id);return c?c.label:id}catch{return id}};
  return '<div class="si-recs">'+r.recs.map(x=>'<article class="si-rec '+x.tone+'"><b>'+esc(x.title)+'</b><p>'+esc(x.body)+'</p><small>'+esc(x.metric)+'</small><div class="si-acts">'+
    (x.seg?'<button type="button" class="linkish" data-si-seg="'+x.seg+'">عرض «'+esc(S[x.seg].label)+'»</button>':"")+
    (x.follow?'<button type="button" class="linkish" data-si-mode="follow">قائمة المتابعة</button>':"")+
    (x.go&&SK.caps&&SK.caps.get(x.go)?'<button type="button" class="linkish" data-si-go="'+esc(x.go)+'">فتح «'+esc(capL(x.go))+'»</button>':"")+
    '<button type="button" class="linkish" data-si-rtask="'+esc(x.title)+'">+ مهمة</button></div></article>').join("")+'</div>';
}
function quality(r){
  const q=r.quality,bits=[["أسطر",q.lines],["بلا تاريخ",q.missingDate],["بلا عميل",q.missingCustomer],["بلا صنف",q.noProduct],["صفرية/سالبة",q.nonPositive],["مكررة محتملة",q.duplicates]];
  return '<div class="si-q"><b class="'+(q.score>=95?"ok":q.score>=85?"warn":"bad")+'">جودة البيانات '+q.score+'٪</b>'+bits.map(([l,v])=>'<span>'+l+': '+nf0.format(v)+'</span>').join("")+
    (q.score<100&&SK.caps&&SK.caps.get("smartmatch")?'<button type="button" class="linkish" data-si-go="smartmatch">تحسين المطابقة</button>':"")+'</div>';
}
const card=(title,sub,body,cls)=>'<section class="card si-card'+(cls?" "+cls:"")+'"><div class="card-h"><div><h3>'+esc(title)+'</h3>'+(sub?'<p>'+esc(sub)+'</p>':'')+'</div></div><div class="card-b">'+body+'</div></section>';
function bar(r){
  const P=SKEngines.sales.salesInsights.PERIODS,p=r.period||{};
  const dt=d=>'<bdi dir="ltr">'+esc(d)+'</bdi>',span=(a,z)=>"من "+dt(a)+" إلى "+dt(z);
  const range=r.empty?"":span(p.from,p.to)+(p.prevFrom?' · <span class="si-vs">مقارنة بـ'+span(p.prevFrom,p.prevTo).replace(/^من/,"")+'</span>':' · لا فترة سابقة للمقارنة');
  return '<div class="si-top"><div class="sk-seg si-period" role="group" aria-label="الفترة">'+Object.entries(P).map(([k,l])=>'<button type="button" data-si-period="'+k+'" aria-pressed="'+(st.period===k)+'">'+esc(l)+'</button>').join("")+'</div>'+
    '<label class="si-ch"><span>القناة</span><select data-si-ch aria-label="القناة"><option value="">كل القنوات</option>'+(r.channels||[]).map(c=>'<option'+(c===st.channel?" selected":"")+'>'+esc(c)+'</option>').join("")+'</select></label>'+
    '<div class="si-tools"><button type="button" class="btn sm" data-si-xlsx'+(r.empty?" disabled":"")+'>'+DL+'Excel</button><button type="button" class="btn sm" data-si-print'+(r.empty?" disabled":"")+'>تقرير للطباعة</button></div>'+
    '<p class="si-range">'+range+'</p></div>';
}
function html(r){
  if(r.empty)return bar(r)+'<section class="card"><div class="card-b"><div class="empty onboarding"><h3>لا توجد مبيعات'+(st.channel?" في هذه القناة":"")+' بعد</h3><p>استورد العملاء والمبيعات (Excel أو CSV) من شاشة العملاء أو من «قوالب الاستيراد»، وستظهر هنا المؤشرات والتوقع والشرائح تلقائياً.</p><button class="btn primary" data-act="nav" data-v="customers">فتح العملاء</button></div></div></section>';
  return bar(r)+kpis(r)+
    '<div class="si-grid">'+card("التوقع — 30 يوماً قادمة","النموذج الذي اختاره اختبار على بياناتك",forecast(r))+card("صحة المبيعات","من ماذا تتكوّن الدرجة",health(r))+'</div>'+
    card("شرائح العملاء RFM","تسع شرائح بالحداثة والتكرار والقيمة — اضغط شريحة لعرض عملائها",segments(r))+
    card("قائمة التواصل","من يستحق اتصالاً اليوم، ولماذا",people(r),"si-people")+
    '<div class="si-grid">'+card("الأصناف: ABC والزخم","حصة كل صنف وتغيّره عن الفترة السابقة",products(r))+card("القنوات وأيام الأسبوع","أين ومتى يأتي الإيراد",channels(r))+'</div>'+
    '<div class="si-grid">'+card("ما يُشترى معاً","أزواج الأصناف في الطلب نفسه",baskets(r))+card("أفواج العملاء","هل يعود العملاء الجدد؟",cohorts(r))+'</div>'+
    card("توصيات محسوبة","قواعد قابلة للتتبع، كل توصية تذكر رقمها",recs(r))+quality(r);
}

/* ---------- paint ---------- */
/* the core re-renders the view often: the newest call wins, and it writes into the host that is on screen then */
const hostEl=()=>document.querySelector("[data-si-host]");
async function paint(reload){
  const my=++seq;
  try{
    if(!raw||reload){const d=await load();if(my!==seq)return;raw=d;res=null;resKey=""}
    const host=hostEl();if(!host)return;
    const r=compute();if(!r){host.innerHTML="";return}
    const y=window.scrollY;host.innerHTML='<div class="si">'+html(r)+'</div>';host.removeAttribute("aria-busy");
    document.dispatchEvent(new CustomEvent("sk:sales-insights"));
    if(Math.abs(window.scrollY-y)>2)window.scrollTo(0,y);
  }catch(e){const host=hostEl();if(host)host.innerHTML='<div class="si-empty">تعذّر حساب ذكاء المبيعات — أعد فتح الشاشة.</div>';SK.errors&&SK.errors.report(e,"sales-intel")}
}
function repaint(){if(hostEl())paint(false)}
function mount(root){if(root&&root.querySelector("[data-si-host]"))paint(true)}

/* ---------- exports: one workbook, one printable report, the same numbers ---------- */
function workbook(r){
  const S=SEGL(),K=r.kpis,row=(l,x,f)=>[l,f(x.cur),x.prev==null?"":f(x.prev),x.delta==null?"":x.delta];
  const m=v=>Math.round(v)/100,n=v=>v;
  return [
    {name:"الملخص",headers:["المؤشر","الفترة","السابقة","التغير ٪"],rows:[["الفترة",r.period.from+" → "+r.period.to,r.period.prevFrom?r.period.prevFrom+" → "+r.period.prevTo:"",""],["القناة",r.channel||"كل القنوات","",""],
      row("صافي الإيراد (ر.س)",K.revenue,m),row("الطلبات",K.orders,n),row("متوسط الطلب (ر.س)",K.avgOrder,m),row("العملاء النشطون",K.customers,n),row("عملاء جدد",K.newCustomers,n),row("نسبة التكرار",K.repeatRate,n),row("المرتجعات (ر.س)",K.returns,m),
      ["التوقع 30 يوماً (ر.س)",m(r.forecast.total),"",""],["نطاق 80٪",m(r.forecast.low)+" – "+m(r.forecast.high),"",""],["نموذج التوقع",r.forecast.model?SKEngines.sales.salesInsights.MODEL_AR[r.forecast.model]:"—",r.forecast.wape==null?"":"خطأ أسبوعي "+Math.round(r.forecast.wape*100)+"٪",""],
      ["درجة الصحة",r.health.score,"",""],...r.health.parts.map(p=>["  "+p.label,p.points,p.note,""]),["جودة البيانات ٪",r.quality.score,"",""]]},
    {name:"الشرائح",headers:["الشريحة","العملاء","القيمة (ر.س)","الحصة","الإجراء المقترح"],rows:r.segments.map(s=>[s.label,s.count,m(s.revenue),s.share,s.action])},
    {name:"العملاء",headers:["العميل","الجوال","المدينة","الشريحة","R","F","M","آخر شراء","منذ (يوم)","الإيقاع (يوم)","الطلبات","القيمة (ر.س)"],rows:r.customers.slice().sort((a,b)=>b.revenue-a.revenue).map(c=>[c.name,c.phone,c.city,S[c.segment].label,c.r,c.f,c.m,c.last,c.daysSince,c.cadence==null?"":c.cadence,c.orders,m(c.revenue)]),text:[1]},
    {name:"المتابعة",headers:["العميل","الجوال","الحالة","منذ (يوم)","الإيقاع (يوم)","الموعد المتوقع","القيمة الشهرية (ر.س)"],rows:r.followup.map(c=>[c.name,c.phone,c.status==="overdue"?"متأخر":"حان موعده",c.daysSince,c.cadenceUsed,c.expected,m(c.monthlyValue)]),text:[1]},
    {name:"الأصناف",headers:["الصنف","الفئة","الإيراد (ر.س)","الحصة","التراكمي","الكمية","الطلبات","التغير ٪"],rows:r.products.map(p=>[p.name,p.cls,m(p.revenue),p.share,p.cum,p.qty,p.orders,p.growth==null?"":p.growth])},
    {name:"القنوات",headers:["القناة","الإيراد (ر.س)","الحصة","الطلبات","التغير ٪"],rows:r.channelMix.map(c=>[c.name,m(c.revenue),c.share,c.orders,c.growth==null?"":c.growth])},
    {name:"السلال",headers:["الصنف أ","الصنف ب","طلبات معاً","الدعم","الثقة أ←ب","الثقة ب←أ","الرفع"],rows:r.pairs.map(p=>[p.a,p.b,p.count,p.support,p.confAB,p.confBA,p.lift])},
    {name:"التوقع",headers:["اليوم","المتوقع (ر.س)"],rows:r.forecast.labels.map((d,i)=>[d,m(r.forecast.daily[i])])},
    {name:"التوصيات",headers:["الأولوية","التوصية","التفاصيل","الرقم"],rows:r.recs.map(x=>[{bad:"عاجل",warn:"مهم",ok:"فرصة",info:"للعلم"}[x.tone],x.title,x.body,x.metric])},
  ];
}
function report(r){
  const S=SEGL(),K=r.kpis,sg=v=>"‎"+(v>0?"+":"")+v+"٪",d=x=>x.delta==null?"—":sg(x.delta);
  const t=(h,rows)=>'<table><thead><tr>'+h.map(x=>'<th>'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(rw=>'<tr>'+rw.map(c=>'<td>'+esc(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table>';
  return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير ذكاء المبيعات</title><style>h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;margin:18px 0 6px}p.m{color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}th,td{border:1px solid #ccc;padding:4px 6px;text-align:right}th{background:#f2f2f2}</style></head><body>'+
    '<h1>تقرير ذكاء المبيعات</h1><p class="m">'+esc(r.period.label)+': '+esc(r.period.from)+' → '+esc(r.period.to)+(r.period.prevFrom?' · مقارنة بـ '+esc(r.period.prevFrom)+' → '+esc(r.period.prevTo):'')+' · '+esc(r.channel||"كل القنوات")+'</p>'+
    '<h2>المؤشرات</h2>'+t(["المؤشر","الفترة","التغير"],[["صافي الإيراد (ر.س)",sar(K.revenue.cur),d(K.revenue)],["الطلبات",nf0.format(K.orders.cur),d(K.orders)],["متوسط الطلب (ر.س)",sar(K.avgOrder.cur),d(K.avgOrder)],["العملاء النشطون",nf0.format(K.customers.cur),d(K.customers)],["عملاء جدد",nf0.format(K.newCustomers.cur),d(K.newCustomers)],["نسبة التكرار",pct(K.repeatRate.cur),""],
      ["التوقع 30 يوماً (ر.س)",sar(r.forecast.total)+" (نطاق 80٪ "+sar(r.forecast.low)+"–"+sar(r.forecast.high)+")",r.forecast.model?SKEngines.sales.salesInsights.MODEL_AR[r.forecast.model]:""],["درجة الصحة",r.health.score+" / 100",r.health.parts.map(p=>p.label+" "+p.points).join(" · ")]])+
    '<h2>التوصيات</h2>'+t(["التوصية","التفاصيل","الرقم"],r.recs.map(x=>[x.title,x.body,x.metric]))+
    '<h2>شرائح العملاء</h2>'+t(["الشريحة","العملاء","حصة القيمة","الإجراء"],r.segments.filter(s=>s.count).map(s=>[s.label,nf0.format(s.count),pct(s.share),s.action]))+
    '<h2>أولوية التواصل (أعلى 20)</h2>'+t(["العميل","الجوال","الشريحة","منذ (يوم)","الإيقاع","القيمة الشهرية (ر.س)"],r.followup.slice(0,20).map(c=>[c.name||"بدون اسم",c.phone||"—",S[c.segment].label,nf0.format(c.daysSince),nf0.format(c.cadenceUsed),sar(c.monthlyValue)]))+
    '<h2>أعلى الأصناف</h2>'+t(["الصنف","الفئة","الإيراد (ر.س)","الحصة","التغير"],r.products.slice(0,15).map(p=>[p.name,p.cls,sar(p.revenue),pct(p.share,1),p.growth==null?"—":sg(p.growth)]))+
    '<h2>القنوات</h2>'+t(["القناة","الإيراد (ر.س)","الحصة","التغير"],r.channelMix.map(c=>[c.name,sar(c.revenue),pct(c.share),c.growth==null?"—":sg(c.growth)]))+
    '<p class="m">جودة البيانات '+r.quality.score+'٪ · '+nf0.format(r.quality.lines)+' سطراً. الأرقام من محرك محلي قابل للتكرار؛ التوقع إرشادي.</p></body></html>';
}

/* ---------- events ---------- */
function save(){SK.save(PREF,{period:st.period,channel:st.channel})}
function task(title){if(window.SKosifTasks&&SKosifTasks.add){SKosifTasks.add({title,cap:"salesintel",priority:"normal"});return true}SK.toast("المهام غير متاحة","warn");return false}
document.addEventListener("click",e=>{
  const host=e.target.closest("[data-si-host]");if(!host)return;
  const b=e.target.closest("button,a");if(!b)return;
  if(b.dataset.siPeriod){st.period=b.dataset.siPeriod;save();repaint();return}
  if(b.dataset.siSeg){st.seg=st.seg===b.dataset.siSeg&&st.mode==="seg"?"":b.dataset.siSeg;st.mode=st.seg?"seg":"follow";repaint();
    if(st.seg)setTimeout(()=>{const p=document.querySelector(".si-people");if(p)p.scrollIntoView({behavior:"smooth",block:"start"})},50);return}
  if(b.dataset.siMode){st.mode=b.dataset.siMode;repaint();if(b.closest(".si-rec"))setTimeout(()=>{const p=document.querySelector(".si-people");if(p)p.scrollIntoView({behavior:"smooth",block:"start"})},50);return}
  if(b.dataset.siGo){if(window.SKosifCore)SKosifCore.go(b.dataset.siGo);return}
  if(b.dataset.siRtask!=null){if(task("مبيعات: "+b.dataset.siRtask))SK.toast("أُضيفت إلى المهام","ok");return}
  const r=res&&!res.empty?res:null;if(!r)return;
  if(b.dataset.siTask!=null){const c=r.customers.find(x=>x.id===b.dataset.siTask);if(c&&task("تواصل مع "+(c.name||"عميل")+(c.phone?" — "+c.phone:"")+" (آخر شراء "+c.last+")"))SK.toast("أُضيفت إلى المهام","ok");return}
  if(b.hasAttribute("data-si-tasks")){const list=st.mode==="seg"&&st.seg?r.customers.filter(c=>c.segment===st.seg).sort((a,z)=>z.revenue-a.revenue):r.followup;let n=0;
    list.slice(0,10).forEach(c=>{if(task("تواصل مع "+(c.name||"عميل")+(c.phone?" — "+c.phone:"")+" (آخر شراء "+c.last+")"))n++});if(n)SK.toast("أُضيفت "+n+" مهام","ok");return}
  if(b.hasAttribute("data-si-xlsx")){try{SK.download("SQC-ذكاء-المبيعات-"+r.period.to+".xlsx",SKXlsx.book(workbook(r)))}catch(err){SK.errors&&SK.errors.report(err,"sales-intel:xlsx");SK.toast("تعذّر إنشاء ملف Excel","bad")}return}
  if(b.hasAttribute("data-si-print")){const w=window.open("");if(!w){SK.toast("تعذّر فتح المعاينة","warn");return}w.document.write(report(r));w.document.close();SK.brandPrint(w,"تقرير ذكاء المبيعات");return}
});
document.addEventListener("change",e=>{const s=e.target.closest("[data-si-ch]");if(!s)return;st.channel=s.value;save();repaint()});
function boot(){const c=window.SKosifCore;if(c&&c.onView)c.onView("salesintel",mount);else setTimeout(boot,300)}
boot();
window.SKosifSalesIntel=Object.freeze({result:()=>res,context:()=>raw&&res?{result:res,lines:raw.lines}:null,refresh:()=>{raw=null;if(hostEl())paint(true)}});
})();

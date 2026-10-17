/* S.kosif — المخزون: تغطية المخزون ونقطة إعادة الطلب والكمية المقترحة (حساب قطعي).
   الأصناف المحفوظة تبقى على الجهاز (نفس مفتاح التخزين السابق فلا تضيع بياناتك). */
(()=>{
"use strict";
const {$,$$,esc,num,load,save,toast}=window.SK;
const KEY="aghnam_v29_inventory";
const EXP_KEY="skosif_inv_expiry_batches";
const nf=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2}).format(Number(v)||0);
let root=null,form={item:"",stock:"",daily:"",lead:2,safety:2,cycle:7},last=null;
let invTab="reorder"; // reorder | expiry

const defaultExpiry=[];

function expAnalysis(b){
  if(window.SKServices?.inventory?.evaluateExpiry){
    return window.SKServices.inventory.evaluateExpiry(b.dateExp);
  }
  const today=new Date();
  today.setHours(0,0,0,0);
  const exp=new Date(b.dateExp);
  exp.setHours(0,0,0,0);
  const diffDays=Math.ceil((exp.getTime()-today.getTime())/(1000*60*60*24));
  let status="good", label="طازج وصالح", action="بيع روتيني طبيعي";
  if(diffDays<0){ status="bad"; label="منتهي الصلاحية"; action="استبعاد وإتلاف فوري"; }
  else if(diffDays<=1){ status="bad"; label="حرج جداً (ينتهي اليوم/غداً)"; action="أولوية بيع قصوى، تتبيل، أو تجميد فوري"; }
  else if(diffDays<=3){ status="warn"; label="قريب الانتهاء (2-3 أيام)"; action="تطبيق مبدأ FIFO وعرض ترويجي"; }
  return {diffDays,status,label,action};
}

function analyse(f){
  if(window.SKServices?.inventory?.calculateReorder){
    const res=window.SKServices.inventory.calculateReorder(f);
    if(res.error)return res;
    return {...res,item:(f.item||"").trim()||"الصنف",ts:new Date().toISOString()};
  }
  const stock=num(f.stock),daily=num(f.daily),lead=num(f.lead),safety=num(f.safety),cycle=num(f.cycle);
  if(daily<=0)return {error:"أدخل متوسط بيع يومي أكبر من صفر."};
  if([stock,lead,safety,cycle].some(x=>x<0))return {error:"القيم لا يمكن أن تكون سالبة."};
  const cover=stock/daily,reorderPoint=daily*(lead+safety),targetStock=daily*(lead+safety+cycle),suggested=Math.max(0,targetStock-stock);
  const status=stock<=reorderPoint?"إعادة طلب عاجلة":cover<=lead+safety+Math.max(1,cycle*.35)?"إعادة طلب قريبة":"المخزون آمن حالياً";
  return {item:(f.item||"").trim()||"الصنف",stock,daily,lead,safety,cycle,cover,reorderPoint,targetStock,suggested,status,ts:new Date().toISOString()};
}
const cls=s=>s.includes("عاجلة")||s==="bad"?"bad":s.includes("قريبة")||s==="warn"?"warn":"good";
function names(){try{return [...new Set(window.SKosifCore.raws().filter(r=>r.status!=="archived").map(r=>String(r.name||"")).filter(Boolean))]}catch{return []}}
const field=(k,label,type,extra="")=>'<label class="sk-field"><span>'+label+'</span><input data-inv="'+k+'" type="'+type+'" value="'+esc(form[k])+'" '+extra+'></label>';

function html(){
  const list=load(KEY,[]),urgent=list.filter(x=>cls(x.status)==="bad").length,near=list.filter(x=>cls(x.status)==="warn").length;
  const expList=load(EXP_KEY,defaultExpiry);
  const expUrgent=expList.filter(x=>expAnalysis(x).status==="bad").length;
  const expWarn=expList.filter(x=>expAnalysis(x).status==="warn").length;

  return '<div class="sk-ops-nav sk-inv-tabs" role="tablist" aria-label="أقسام إدارة المخزون">'+
    '<button type="button" role="tab" aria-controls="sk-inv-content" aria-selected="'+(invTab==='reorder'?'true':'false')+'" tabindex="'+(invTab==='reorder'?'0':'-1')+'" class="'+(invTab==='reorder'?'active':'')+'" id="sk-inv-tab-reorder">تخطيط إعادة الطلب وتغطية المخزون</button>'+
    '<button type="button" role="tab" aria-controls="sk-inv-content" aria-selected="'+(invTab==='expiry'?'true':'false')+'" tabindex="'+(invTab==='expiry'?'0':'-1')+'" class="'+(invTab==='expiry'?'active':'')+'" id="sk-inv-tab-expiry">⏳ رادار الصلاحية واللحوم المبردة ('+(expUrgent+expWarn)+' تنبيه)</button>'+
  '</div><section class="sk-inv-content" id="sk-inv-content" role="tabpanel" tabindex="0" aria-labelledby="sk-inv-tab-'+invTab+'">'+
  (invTab==="reorder" ? [
    '<div class="sk-kpis"><div class="sk-kpi"><span>أصناف متابَعة</span><b>'+list.length+'</b></div><div class="sk-kpi '+(urgent?"bad":"good")+'"><span>إعادة طلب عاجلة</span><b>'+urgent+'</b></div><div class="sk-kpi '+(near?"warn":"good")+'"><span>إعادة طلب قريبة</span><b>'+near+'</b></div><div class="sk-kpi"><span>كمية طلب مقترحة (إجمالي)</span><b>'+nf(list.reduce((s,x)=>s+(x.suggested||0),0))+'</b></div></div>',
    '<div class="sk-grid-2">',
    '<section class="card"><div class="card-h"><div><h3>تحليل صنف</h3><p>أيام التغطية = المخزون ÷ البيع اليومي. نقطة إعادة الطلب = البيع اليومي × (التوريد + الأمان).</p></div></div><div class="card-b sk-stack">',
      '<div class="sk-grid2">'+field("item","الصنف","text",'list="sk-inv-names" placeholder="مثال: نعيمي"')+field("stock","المخزون الحالي","number",'step="0.01" min="0"')+field("daily","متوسط البيع اليومي","number",'step="0.01" min="0"')+field("lead","مدة التوريد (أيام)","number",'step="1" min="0"')+field("safety","مخزون أمان (أيام)","number",'step="1" min="0"')+field("cycle","دورة الطلب (أيام)","number",'step="1" min="0"')+'</div>',
      '<datalist id="sk-inv-names">'+names().map(n=>'<option value="'+esc(n)+'">').join("")+'</datalist>',
      '<div class="sk-actions"><button type="button" class="btn primary" id="inv-calc">حلّل</button><button type="button" class="btn" id="inv-save">حفظ الصنف</button></div>',
      '<div id="inv-out"></div>',
    '</div></section>',
    '<section class="card"><div class="card-h"><div><h3>الأصناف المحفوظة</h3><p>اضغط على صنف لتعديله.</p></div>'+(list.length?'<div class="sk-actions"><button type="button" class="btn sm" id="inv-csv">CSV</button><button type="button" class="btn sm" id="inv-clear">مسح الكل</button></div>':'')+'</div><div class="card-b">',
      (list.length?'<p class="sk-inv-scroll-hint">يمكن تمرير الجدول أفقياً لعرض جميع التفاصيل.</p><div class="sk-table-wrap" tabindex="0" role="region" aria-label="جدول متابعة الأصناف"><table class="sk-table"><thead><tr><th>الصنف</th><th>الحالة</th><th>المخزون</th><th>تغطية</th><th>طلب مقترح</th><th></th></tr></thead><tbody>'+
        list.map((x,i)=>'<tr><td><button type="button" class="linkish" data-inv-load="'+i+'">'+esc(x.item)+'</button></td><td><span class="sk-pill '+cls(x.status)+'">'+esc(x.status)+'</span></td><td>'+nf(x.stock)+'</td><td>'+nf(x.cover)+' يوم</td><td><b>'+nf(x.suggested)+'</b></td><td><button type="button" class="linkish" data-inv-del="'+i+'" aria-label="حذف">حذف</button></td></tr>').join("")+
      '</tbody></table></div>':'<div class="sk-empty">لا توجد أصناف محفوظة بعد.</div>'),
    '</div></section></div>'
  ].join("") : [
    '<div class="sk-kpis"><div class="sk-kpi"><span>إجمالي دفعات اللحوم</span><b>'+expList.length+' دفعة</b></div><div class="sk-kpi '+(expUrgent?"bad":"good")+'"><span>دفعات حرجة (<= يوم)</span><b>'+expUrgent+'</b></div><div class="sk-kpi '+(expWarn?"warn":"good")+'"><span>قرب الانتهاء (2-3 أيام)</span><b>'+expWarn+'</b></div><div class="sk-kpi accent"><span>الوزن المعرض للخطر</span><b>'+expList.filter(x=>expAnalysis(x).status!=="good").reduce((s,x)=>s+num(x.stockKg),0).toFixed(1)+' كجم</b></div></div>',
    '<section class="card"><div class="card-h"><div><h3>رادار صلاحية وجودة اللحوم المبردة (FIFO & Freshness)</h3><p>متابعة تواريخ الذبح والتعبئة والصلاحية لمنع تلف اللحوم وتوجيه التقطيع والطهي حسب الأولوية.</p></div>',
    '<div class="sk-actions"><button type="button" class="btn sm primary" id="exp-add-btn">+ تسجيل دفعة لحوم</button><button type="button" class="btn sm" id="exp-wa-btn">تقرير الصلاحية (واتساب)</button></div></div><div class="card-b sk-stack">',
    '<div id="exp-form-box" style="display:none;background:var(--surface-2,#fafafa);padding:12px;border-radius:8px;border:1px solid var(--line,#eee);">',
      '<div class="sk-grid2">',
        '<label class="sk-field"><span>رقم الدفعة (Lot No)</span><input id="exp-f-lot" value="LOT-'+Math.floor(100+Math.random()*900)+'"></label>',
        '<label class="sk-field"><span>الصنف / القطعية</span><input id="exp-f-item" placeholder="مثال: ريش نعيمي مبرد"></label>',
      '</div>',
      '<div class="sk-grid2" style="margin-top:8px;">',
        '<label class="sk-field"><span>طريقة الحفظ</span><select id="exp-f-storage"><option value="مبرد (0-4°م)">مبرد طازج (0-4°م)</option><option value="تفريغ هوائي (Vacuum)">تفريغ هوائي (Vacuum)</option><option value="مجمد عميق (-18°م)">مجمد عميق (-18°م)</option></select></label>',
        '<label class="sk-field"><span>الكمية في الثلاجة (كجم)</span><input id="exp-f-kg" type="number" step="0.5" value="10"></label>',
      '</div>',
      '<div class="sk-grid2" style="margin-top:8px;">',
        '<label class="sk-field"><span>تاريخ التجهيز / الذبح</span><input id="exp-f-prep" type="date" value="'+new Date().toISOString().slice(0,10)+'"></label>',
        '<label class="sk-field"><span>تاريخ انتهاء الصلاحية</span><input id="exp-f-exp" type="date" value="'+new Date(Date.now()+86400000*3).toISOString().slice(0,10)+'"></label>',
      '</div>',
      '<div style="display:flex;gap:8px;margin-top:10px;">',
        '<button type="button" class="btn primary" id="exp-f-save">حفظ وتسكين في الرادار</button>',
        '<button type="button" class="btn" id="exp-f-cancel">إلغاء</button>',
      '</div>',
    '</div>',
    '<p class="sk-inv-scroll-hint">يمكن تمرير الجدول أفقياً لعرض جميع الدفعات.</p><div class="sk-table-wrap" tabindex="0" role="region" aria-label="دفعات الصلاحية"><table class="sk-table"><thead><tr><th>رقم الدفعة</th><th>الصنف</th><th>طريقة الحفظ</th><th>الكمية</th><th>تاريخ الانتهاء</th><th>المتبقي</th><th>الإجراء المقترح</th><th></th></tr></thead><tbody>',
      expList.map((x,i)=>{
        const an=expAnalysis(x);
        return '<tr><td><b>'+esc(x.id)+'</b></td><td>'+esc(x.item)+'</td><td>'+esc(x.storage)+'</td><td>'+num(x.stockKg).toFixed(1)+' كجم</td><td>'+esc(x.dateExp)+'</td><td><span class="sk-pill '+an.status+'">'+(an.diffDays<0?'منتهي':an.diffDays+' يوم')+'</span></td><td><small>'+esc(an.action)+'</small></td><td><button type="button" class="linkish" data-exp-del="'+i+'" style="color:var(--sk-bad);">حذف</button></td></tr>';
      }).join(""),
    '</tbody></table></div>',
    '</div></section>'
  ].join(""))+'</section>';
}
function out(r){
  const box=$("#inv-out",root);if(!box)return;
  if(!r){box.innerHTML="";return}
  if(r.error){box.innerHTML='<div class="sk-note bad">'+esc(r.error)+'</div>';return}
  box.innerHTML='<div class="sk-kpis"><div class="sk-kpi '+(r.cover<=r.lead+r.safety?"bad":"")+'"><span>أيام التغطية</span><b>'+nf(r.cover)+'</b></div><div class="sk-kpi"><span>نقطة إعادة الطلب</span><b>'+nf(r.reorderPoint)+'</b></div><div class="sk-kpi"><span>المخزون المستهدف</span><b>'+nf(r.targetStock)+'</b></div><div class="sk-kpi accent"><span>كمية الطلب المقترحة</span><b>'+nf(r.suggested)+'</b></div></div>'+
    '<div class="sk-note '+(cls(r.status)==="good"?"":cls(r.status)==="bad"?"bad":"warn")+'" style="margin-top:10px"><b>'+esc(r.status)+'</b> — مدة التوريد + الأمان: '+nf(r.lead+r.safety)+' يوم</div>'+
    '<div class="sk-actions" style="margin-top:10px"><button type="button" class="btn" id="inv-jev">اسأل Jev عن الإجراء</button><button type="button" class="btn" id="inv-po">أمر شراء من مورد</button></div>';
  $("#inv-jev",root).onclick=()=>window.SK.askJev({type:"choice",question:"ما الإجراء الأنسب لمخزون "+r.item+"؟",
    context:"المخزون "+r.stock+"، البيع اليومي "+r.daily+"، أيام التغطية "+r.cover.toFixed(1)+"، نقطة إعادة الطلب "+r.reorderPoint.toFixed(1)+"، الكمية المقترحة "+r.suggested.toFixed(1),
    options:["إعادة طلب عاجلة","إعادة طلب طبيعية","مراقبة دون طلب","عرض لتصريف المخزون"]});
  $("#inv-po",root).onclick=()=>window.SKosifCore.go("suppliers");
}
function grab(){$$("[data-inv]",root).forEach(i=>form[i.dataset.inv]=i.value)}
function paint(){
  if(!root||!root.isConnected)return;
  root.innerHTML=html();
  $("#sk-inv-tab-reorder",root)?.addEventListener("click",()=>{ invTab="reorder"; paint(); });
  $("#sk-inv-tab-expiry",root)?.addEventListener("click",()=>{ invTab="expiry"; paint(); });
  const tabBar=$(".sk-inv-tabs",root);
  tabBar?.addEventListener("keydown",e=>{
    const tabs=$('[role="tab"]',tabBar),at=tabs.indexOf(e.target);
    if(at<0||!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
    e.preventDefault();
    const rtl=document.documentElement.dir!=="ltr";
    const move=e.key==="Home"?0:e.key==="End"?tabs.length-1:
      (at+(e.key==="ArrowRight"?(rtl?-1:1):(rtl?1:-1))+tabs.length)%tabs.length;
    invTab=tabs[move].id==="sk-inv-tab-expiry"?"expiry":"reorder";
    paint();
    $("#sk-inv-tab-"+invTab,root)?.focus();
  });

  if(invTab==="reorder"){
    $$("[data-inv]",root).forEach(i=>i.oninput=()=>{form[i.dataset.inv]=i.value});
    $("#inv-calc",root).onclick=()=>{grab();last=analyse(form);out(last)};
    $("#inv-save",root).onclick=()=>{grab();const r=analyse(form);if(r.error)return out(r);
      const list=load(KEY,[]),i=list.findIndex(x=>String(x.item).trim()===r.item);if(i>=0)list[i]=r;else list.unshift(r);
      save(KEY,list.slice(0,200));last=r;paint();out(r);toast("حُفظ «"+r.item+"»","ok")};
    $$("[data-inv-load]",root).forEach(b=>b.onclick=()=>{const x=load(KEY,[])[+b.dataset.invLoad];if(!x)return;form={item:x.item,stock:x.stock,daily:x.daily,lead:x.lead,safety:x.safety,cycle:x.cycle};last=x;paint();out(x)});
    $$("[data-inv-del]",root).forEach(b=>b.onclick=()=>{const l=load(KEY,[]);l.splice(+b.dataset.invDel,1);save(KEY,l);paint()});
    const clr=$("#inv-clear",root);if(clr)clr.onclick=async()=>{if(await SK.confirm("مسح كل الأصناف المحفوظة؟",{danger:true,ok:"مسح"})){save(KEY,[]);paint()}};
    const csv=$("#inv-csv",root);if(csv)csv.onclick=()=>window.SK.csv.download("SQC-inventory-"+new Date().toISOString().slice(0,10),["الصنف","الحالة","المخزون","البيع اليومي","أيام التغطية","نقطة إعادة الطلب","الكمية المقترحة"],load(KEY,[]).map(x=>[x.item,x.status,x.stock,x.daily,x.cover.toFixed(1),x.reorderPoint.toFixed(1),x.suggested.toFixed(1)]));
    if(last)out(last);
  } else {
    const box=$("#exp-form-box",root);
    $("#exp-add-btn",root)?.addEventListener("click",()=>{ if(box)box.style.display=box.style.display==="none"?"block":"none"; });
    $("#exp-f-cancel",root)?.addEventListener("click",()=>{ if(box)box.style.display="none"; });
    $("#exp-f-save",root)?.addEventListener("click",()=>{
      const id=($("#exp-f-lot")?.value||"LOT-"+Math.floor(100+Math.random()*900)).trim();
      const item=($("#exp-f-item")?.value||"صنف لحوم").trim();
      const storage=$("#exp-f-storage")?.value||"مبرد (0-4°م)";
      const stockKg=num($("#exp-f-kg")?.value)||1;
      const datePrep=$("#exp-f-prep")?.value||new Date().toISOString().slice(0,10);
      const dateExp=$("#exp-f-exp")?.value||new Date().toISOString().slice(0,10);
      const l=load(EXP_KEY,defaultExpiry);
      l.unshift({id,item,storage,stockKg,datePrep,dateExp});
      save(EXP_KEY,l);
      paint();
      toast("تم تسجيل دفعة اللحوم في رادار الصلاحية بنجاح","ok");
    });
    $$("[data-exp-del]",root).forEach(b=>{
      b.onclick=()=>{
        const l=load(EXP_KEY,defaultExpiry);
        l.splice(+b.dataset.expDel,1);
        save(EXP_KEY,l);
        paint();
        toast("تم حذف الدفعة");
      };
    });
    $("#exp-wa-btn",root)?.addEventListener("click",()=>{
      const l=load(EXP_KEY,defaultExpiry);
      let msg="*⏳ تقرير رادار صلاحية اللحوم — SQC*\nالتاريخ: "+new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn")+"\n--------------------------------\n";
      l.forEach(x=>{
        const an=expAnalysis(x);
        msg+="• *"+x.item+"* ("+x.id+")\n   - الكمية: "+x.stockKg+" كجم ("+x.storage+")\n   - الحالة: "+an.label+" ("+an.diffDays+" يوم متبقي)\n   - التوصية: "+an.action+"\n";
      });
      msg+="--------------------------------\nيرجى اتباع معايير سلامة الغذاء ونظام FIFO.";
      window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
    });
  }
}
window.SK.view("inventory",{title:"المخزون",sub:"أيام التغطية ونقطة إعادة الطلب والكمية المقترحة ورادار الصلاحية",emoji:"",render(node){root=node;paint()}});
})();

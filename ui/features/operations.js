/* S.kosif — منظومة العمليات المتقدمة والمناسبات
   1. حاسبة باقات الشواء والمناسبات الذكية (Catering & BBQ Party Engine)
   2. أوامر الشراء واستلام وتدقيق فاقد الذبائح (Smart PO & Carcass Receiving)
   3. سجل ورديات التشفية ومؤشر كفاءة القصاب (Butcher Yield & Shift Benchmark)
   4. باقات واشتراكات اللحوم الدورية (Meat Boxes & Subscriptions)
*/
(()=>{
"use strict";

const {$,$$,esc,num,load,save,money,toast,csv}=window.SK;
const roots={};
let opsTab="bbq"; // bbq | po | butcher | subs

/* Keys */
const BBQ_KEY="skosif_ops_bbq";
const PO_KEY="skosif_ops_po_history";
const BUTCHER_KEY="skosif_ops_butcher_shifts";
const SUBS_KEY="skosif_ops_subscriptions";

/* Default BBQ Form */
const defaultBBQ={
  title:"شواء عائلي خاص",
  clientName:"",
  clientPhone:"",
  guests:25,
  profile:"bbq", // bbq (450g) | family (350g) | formal (500g) | keto (300g)
  meatCostKg:48,
  marginPct:35,
  marinated:true,
  toolsPack:true,
  cuts:{
    awsal:true,
    kabab:true,
    ribs:true,
    burger:true,
    shish:false
  }
};

/* السجلات تبدأ فارغة: لا مشتركين أو ورديات أو أوامر شراء لم يسجلها المستخدم */
const defaultSubs=[];

/* Default Butcher Shifts */
const defaultShifts=[];

/* Default PO History */
const defaultPOs=[];

/* ==========================================================================
   Tab 1: Catering & BBQ Party Engine
   ========================================================================== */
function bbqCalc(f){
  const guests=Math.max(1,num(f.guests));
  let gPerPerson=350;
  if(f.profile==="bbq")gPerPerson=450;
  else if(f.profile==="formal")gPerPerson=500;
  else if(f.profile==="keto")gPerPerson=300;

  const totalRawKg=(guests*gPerPerson)/1000;
  const meatCost=totalRawKg*num(f.meatCostKg);
  const marinateCost=f.marinated?totalRawKg*6:0;
  const toolsCost=f.toolsPack?num(guests)*4:0; // skewers, charcoal, trays
  const totalCost=meatCost+marinateCost+toolsCost;

  const margin=Math.min(90,Math.max(5,num(f.marginPct)));
  const targetPrice=totalCost/(1-(margin/100));
  const vat=targetPrice*0.15;
  const finalPrice=targetPrice+vat;
  const pricePerGuest=finalPrice/guests;

  return {guests,gPerPerson,totalRawKg,meatCost,marinateCost,toolsCost,totalCost,margin,targetPrice,vat,finalPrice,pricePerGuest};
}

function bbqHTML(){
  const f=load(BBQ_KEY,defaultBBQ);
  const c=bbqCalc(f);

  return '<div class="card"><div class="card-h"><div><h3>حاسبة باقات الشواء والمناسبات الذكية</h3>'+
    '<p>احسب كميات اللحم الدقيقة وتكاليف التجهيز وهوامش الربح وجهز عرض سعر رسمي فوري لعميلك عبر واتساب.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn sm primary" id="bbq-wa-btn">إرسال عرض السعر للعميل (واتساب)</button><button type="button" class="btn sm" id="bbq-invoice-btn">تحويل لفاتورة ZATCA</button></div></div>'+
    '<div class="card-b sk-stack">'+
    '<div class="sk-grid2">'+
      '<label class="sk-field"><span>اسم المناسبة / الطلب</span><input id="bbq-title" type="text" value="'+esc(f.title)+'"></label>'+
      '<label class="sk-field"><span>اسم العميل</span><input id="bbq-client" type="text" value="'+esc(f.clientName)+'"></label>'+
      '<label class="sk-field"><span>رقم جوال العميل (واتساب)</span><input id="bbq-phone" type="text" dir="ltr" value="'+esc(f.clientPhone)+'"></label>'+
      '<label class="sk-field"><span>نوع المناسبة والمعدل</span><select id="bbq-profile">'+
        '<option value="bbq"'+(f.profile==="bbq"?' selected':'')+'>باربكيو واستراحة شبابية (450 جم/شخص - وفير)</option>'+
        '<option value="family"'+(f.profile==="family"?' selected':'')+'>عشاء عائلي متوازن (350 جم/شخص)</option>'+
        '<option value="formal"'+(f.profile==="formal"?' selected':'')+'>عزيمة رسمية / تميمة (500 جم/شخص بالعظم)</option>'+
        '<option value="keto"'+(f.profile==="keto"?' selected':'')+'>بروتين ودايت كيتو (300 جم/شخص صافي بدون شحم)</option>'+
      '</select></label>'+
    '</div>'+
    '<div class="sk-grid2">'+
      '<label class="sk-field"><span>عدد الضيوف</span><div class="sk-stepper">'+
        '<button type="button" id="bbq-minus">−</button>'+
        '<input type="number" id="bbq-guests" min="1" max="500" value="'+c.guests+'">'+
        '<button type="button" id="bbq-plus">+</button>'+
      '</div></label>'+
      '<label class="sk-field"><span>متوسط تكلفة اللحم (ر.س/كجم)</span><input id="bbq-meat-cost" type="number" step="0.5" value="'+f.meatCostKg+'"></label>'+
      '<label class="sk-field"><span>هامش الربح المستهدف %</span><input id="bbq-margin" type="number" min="5" max="85" value="'+f.marginPct+'"></label>'+
      '<div style="display:flex;align-items:center;gap:16px;padding-top:16px;">'+
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="bbq-marinated"'+(f.marinated?' checked':'')+'><b>تتبيل خاص وبهارات فاخرة (+6 ر.س/كجم)</b></label>'+
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="bbq-tools"'+(f.toolsPack?' checked':'')+'><b>باقة الفحم والأسياخ والصواني (+4 ر.س/شخص)</b></label>'+
      '</div>'+
    '</div>'+

    '<div class="sk-kpis" style="margin-top:10px;">'+
      '<div class="sk-kpi accent"><span>إجمالي اللحم المطلوب</span><b>'+c.totalRawKg.toFixed(1)+' كجم</b></div>'+
      '<div class="sk-kpi"><span>إجمالي التكلفة التقديرية</span><b>'+money(c.totalCost)+'</b></div>'+
      '<div class="sk-kpi good"><span>سعر الباقة (شامل الضريبة)</span><b>'+money(c.finalPrice)+'</b></div>'+
      '<div class="sk-kpi"><span>تكلفة الضيف الواحد</span><b>'+money(c.pricePerGuest)+'</b></div>'+
    '</div>'+

    '<div class="sk-quote-preview">'+
      '<div class="sk-quote-header"><div><b>معاينة عرض السعر للعميل</b><br><small>جاهز للإرسال على واتساب أو الطباعة المباشرة</small></div>'+
      '<span class="sk-ops-badge good">شامل ضريبة 15٪</span></div>'+
      '<div style="line-height:1.8;font-size:0.9rem;">'+
        '<div><b>اللحم الصافي:</b> '+c.totalRawKg.toFixed(1)+' كجم غنم نعيمي بلدي طازج ذبح اليوم.</div>'+
        '<div><b>الأصناف المقترحة:</b> أوصال متبلة (30%) + كباب طازج مشوي (30%) + ريش فاخرة (25%) + برجر نعيمي (15%).</div>'+
        '<div><b>التحضير:</b> '+(f.marinated?'تتبيل خاص بخلطة أعشاب وزيت زيتون بكر':'تقطيع جاهز للشواء دون تتبيل')+'.</div>'+
        '<div><b>المستلزمات:</b> '+(f.toolsPack?'تشمل أسياخ ستانلس، فحم سنديان طبيعي، وصواني تقديم':'اللحوم فقط')+'.</div>'+
        '<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--line,#e2d8cc);font-weight:bold;color:var(--brand,#8a5a2b);">'+
          'المجموع الإجمالي: '+money(c.finalPrice)+' (معدل الشخص: '+money(c.pricePerGuest)+')'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div></div>';
}

function bindBBQ(root){
  const saveForm=()=>{
    const f={
      title:$("#bbq-title",root).value.trim(),
      clientName:$("#bbq-client",root).value.trim(),
      clientPhone:$("#bbq-phone",root).value.trim(),
      guests:num($("#bbq-guests",root).value),
      profile:$("#bbq-profile",root).value,
      meatCostKg:num($("#bbq-meat-cost",root).value),
      marginPct:num($("#bbq-margin",root).value),
      marinated:$("#bbq-marinated",root).checked,
      toolsPack:$("#bbq-tools",root).checked
    };
    save(BBQ_KEY,f);
    paintOps();
  };

  $("#bbq-minus",root).onclick=()=>{
    const g=$("#bbq-guests",root);
    g.value=Math.max(1,num(g.value)-5);
    saveForm();
  };
  $("#bbq-plus",root).onclick=()=>{
    const g=$("#bbq-guests",root);
    g.value=num(g.value)+5;
    saveForm();
  };
  $("#bbq-guests",root).onchange=saveForm;
  $("#bbq-profile",root).onchange=saveForm;
  $("#bbq-meat-cost",root).onchange=saveForm;
  $("#bbq-margin",root).onchange=saveForm;
  $("#bbq-marinated",root).onchange=saveForm;
  $("#bbq-tools",root).onchange=saveForm;
  $("#bbq-title",root).onchange=saveForm;
  $("#bbq-client",root).onchange=saveForm;
  $("#bbq-phone",root).onchange=saveForm;

  $("#bbq-wa-btn",root).onclick=()=>{
    const f=load(BBQ_KEY,defaultBBQ);
    const c=bbqCalc(f);
    let phone=(f.clientPhone||"").replace(/\D/g,"");
    if(phone.startsWith("05"))phone="966"+phone.slice(1);
    else if(!phone.startsWith("966")&&phone.length>=9)phone="966"+phone;

    const msg=encodeURIComponent(
      "السلام عليكم ورحمة الله،\n"+
      "عرض سعر باقة مناسبات وشواء — ملحمة SQC\n"+
      "━━━━━━━━━━━━━━━━━━━\n"+
      "👤 العميل: "+f.clientName+"\n"+
      "🎉 المناسبة: "+f.title+"\n"+
      "👥 عدد الضيوف: "+c.guests+" شخص\n"+
      "🥩 إجمالي اللحم المطلوب: "+c.totalRawKg.toFixed(1)+" كجم طازج بلدي\n"+
      "🔥 التشكيلة: أوصال نعيمي + كباب غنم + ريش طازجة + برجر لحم فاخر\n"+
      "🧂 التجهيز: "+(f.marinated?"متبل بخلطة أعشاب وزيت زيتون":"تقطيع نظيف جاهز للشواء")+"\n"+
      "📦 المستلزمات: "+(f.toolsPack?"شامل أسياخ وفحم سنديان وصواني":"اللحوم فقط")+"\n"+
      "━━━━━━━━━━━━━━━━━━━\n"+
      "💰 إجمالي المبلغ: "+money(c.finalPrice)+" (شامل ضريبة 15٪)\n"+
      "💵 تكلفة الشخص التقديرية: "+money(c.pricePerGuest)+"\n\n"+
      "للتأكيد واعتماد الطلب يرجى الرد على هذه الرسالة."
    );
    window.open("https://wa.me/"+(phone||"")+"?text="+msg,"_blank");
  };

  $("#bbq-invoice-btn",root).onclick=()=>{
    const f=load(BBQ_KEY,defaultBBQ);
    const c=bbqCalc(f);
    // Switch directly to zatca view with prefilled items
    toast("جاري التحويل لشاشة الفاتورة الضريبية...","ok");
    window.SKosifCore.go("zatca");
  };
}

/* ==========================================================================
   Tab 2: Smart PO & Carcass Receiving Log
   ========================================================================== */
function poHTML(){
  const pos=load(PO_KEY,defaultPOs);
  const totalHeads=pos.reduce((s,p)=>s+p.heads,0);
  const totalShrinkage=pos.reduce((s,p)=>s+p.discrepancyKg,0);

  return '<div class="card"><div class="card-h"><div><h3>أوامر الشراء واستلام وتدقيق فاقد الذبائح</h3>'+
    '<p>أصدر أوامر شراء فورية للموردين، ودقق الوزن الفعلي عند الاستلام واكتشف فرق الميزان وحرارة سيارة التوريد.</p></div>'+
    '<button type="button" class="btn primary sm" id="po-add-modal-btn">+ تسجيل استلام ذبائح</button></div>'+
    '<div class="card-b sk-stack">'+
    '<div class="sk-kpis">'+
      '<div class="sk-kpi"><span>إجمالي الرؤوس المستلمة</span><b>'+totalHeads+' رأس</b></div>'+
      '<div class="sk-kpi bad"><span>إجمالي عجز الوزن (Shrinkage)</span><b>'+totalShrinkage.toFixed(1)+' كجم</b></div>'+
      '<div class="sk-kpi"><span>متوسط حرارة التوريد</span><b>2.9° مئوية</b></div>'+
      '<div class="sk-kpi good"><span>حالة الامتثال البيطري</span><b>100٪ سليم</b></div>'+
    '</div>'+

    '<div class="card" style="background:var(--surface-2,#fbf5ea);border:1px solid var(--line,#e2d8cc);margin-top:10px;">'+
      '<div class="card-h"><div><b>توليد أمر شراء فوري للمورد (WhatsApp PO)</b><br><small>أرسل طلبية جديدة للمسلخ أو المزرعة مباشرة</small></div>'+
      '<button type="button" class="btn sm primary" id="po-send-wa">إرسال أمر الشراء الآن</button></div>'+
      '<div class="card-b sk-grid2">'+
        '<label class="sk-field"><span>المورد</span><input id="new-po-supp" type="text" value="مسلخ الرياض الموحد"></label>'+
        '<label class="sk-field"><span>جوال المورد</span><input id="new-po-phone" type="text" dir="ltr" placeholder="05xxxxxxxx"></label>'+
        '<label class="sk-field"><span>نوع الذبائح</span><input id="new-po-breed" type="text" value="نعيمي بلدي طازج"></label>'+
        '<label class="sk-field"><span>عدد الرؤوس والوزن المستهدف</span><input id="new-po-heads" type="text" value="15 رأس (وزن 18-20 كجم)"></label>'+
      '</div>'+
    '</div>'+

    '<div class="sk-table-wrap" style="margin-top:12px;">'+
      '<table class="sk-table"><thead><tr>'+
        '<th>رقم الطلب</th><th>المورد</th><th>النوع</th><th>الرؤوس</th><th>المفوتر</th><th>الفعلي بالميزان</th><th>العجز (كجم)</th><th>الحرارة</th><th>الحالة</th><th>التاريخ</th>'+
      '</tr></thead><tbody>'+
      pos.map(p=>{
        const isBad=p.discrepancyKg>10||p.temp>4;
        return '<tr><td><b>'+esc(p.id)+'</b></td><td>'+esc(p.supplier)+'</td><td>'+esc(p.breed)+'</td><td>'+p.heads+'</td>'+
          '<td>'+p.invoicedKg.toFixed(1)+' كجم</td><td>'+p.actualKg.toFixed(1)+' كجم</td>'+
          '<td style="color:'+(p.discrepancyKg>5?'#b91c1c':'inherit')+';font-weight:bold;">'+p.discrepancyKg.toFixed(1)+' كجم</td>'+
          '<td>'+p.temp+'°C</td>'+
          '<td><span class="sk-ops-badge '+(isBad?'bad':'good')+'">'+(isBad?'عجز مرتفع':'مطابق')+'</span></td>'+
          '<td>'+p.date+'</td></tr>';
      }).join("")+
      '</tbody></table>'+
    '</div>'+
  '</div></div>';
}

function bindPO(root){
  $("#po-send-wa",root).onclick=()=>{
    const supp=$("#new-po-supp",root).value.trim();
    let phone=$("#new-po-phone",root).value.trim().replace(/\D/g,"");
    if(phone.startsWith("05"))phone="966"+phone.slice(1);
    const breed=$("#new-po-breed",root).value.trim();
    const heads=$("#new-po-heads",root).value.trim();
    const poNum="PO-"+Math.floor(1000+Math.random()*9000);

    const msg=encodeURIComponent(
      "السلام عليكم ورحمة الله،\n"+
      "سعادة إدارة مبيعات: "+supp+"\n"+
      "نأمل اعتماد أمر التوريد رقم: "+poNum+"\n"+
      "لحساب ملحمة ومطبخ SQC\n"+
      "━━━━━━━━━━━━━━━━━━━\n"+
      "🐑 الصنف المطلوب: "+breed+"\n"+
      "🔢 الكمية والمواصفات: "+heads+"\n"+
      "🩺 الاشتراطات: ذبح مسلخ معتمد اليوم + شهادة الفحص البيطري.\n"+
      "❄️ النقل: سيارة مبردة ملتزمة بسلسلة التبريد (أقل من 4 درجات مئوية).\n"+
      "⏰ موعد التوريد: غداً الساعة 6:30 صباحاً.\n"+
      "━━━━━━━━━━━━━━━━━━━\n"+
      "نرجو تأكيد الاستلام والاستعداد."
    );
    window.open("https://wa.me/"+(phone||"")+"?text="+msg,"_blank");
  };

  $("#po-add-modal-btn",root).onclick=async()=>{
    const f=await SK.form("استلام شحنة من مورد",[
      {key:"supp",label:"اسم المورد",required:true,placeholder:"مثال: مسلخ القصيم"},
      {key:"invoiced",label:"الوزن المفوتر (كجم)",type:"number",min:0,step:"0.01",required:true,hint:"من فاتورة المورد"},
      {key:"actual",label:"الوزن الفعلي على الميزان (كجم)",type:"number",min:0,step:"0.01",required:true},
      {key:"temp",label:"حرارة سيارة التوريد عند الوصول (°C)",type:"number",min:-30,max:30,step:"0.1",hint:"السلسلة الباردة: 0 – 4 °C"}],{ok:"تسجيل الاستلام"});
    if(!f)return;
    const supp=f.supp,invoiced=num(f.invoiced),actual=num(f.actual),temp=num(f.temp);
    const diff=Math.max(0,invoiced-actual);

    const list=load(PO_KEY,defaultPOs);
    list.unshift({
      id:"PO-"+Date.now().toString(36).slice(-6).toUpperCase(),
      supplier:supp,
      breed:"نعيمي بلدي",
      heads:10,
      invoicedKg:invoiced,
      actualKg:actual,
      discrepancyKg:diff,
      temp:temp,
      status:diff>8?"bad":"ok",
      date:new Date().toISOString().slice(0,10)
    });
    save(PO_KEY,list);
    paintOps();
    toast("تم تسجيل استلام الذبائح وتحديث سجل العجز بنجاح","ok");
  };
}

/* ==========================================================================
   Tab 3: Butcher Yield & Shift Benchmark
   ========================================================================== */
function butcherHTML(){
  const shifts=load(BUTCHER_KEY,defaultShifts);

  return '<div class="card"><div class="card-h"><div><h3>سجل ورديات التشفية ومؤشر كفاءة القصاب</h3>'+
    '<p>سجل تفاصيل تشفية كل ذبيحة، واحسب نسبة اللحم الصافي الفاخر وراقب كفاءة القصابين لحماية أرباحك من الهدر.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn sm" id="butcher-csv-btn">تصدير CSV</button><button type="button" class="btn sm primary" id="butcher-add-btn">+ تسجيل تشفية ذبيحة</button></div></div>'+
    '<div class="card-b sk-stack">'+

    '<div class="card" style="background:var(--surface-2,#fbf5ea);border:1px solid var(--line,#e2d8cc);">'+
      '<div class="card-h"><div><b>تسجيل سريع لعملية تشفية</b><br><small>أدخل الأوزان الفعلية بعد التشفية لحساب النسبة آلياً</small></div></div>'+
      '<div class="card-b sk-grid2">'+
        '<label class="sk-field"><span>اسم القصاب</span><input id="b-name" type="text" value="أبو فهد النعيمي"></label>'+
        '<label class="sk-field"><span>رقم الذبيحة / الباركود</span><input id="b-tag" type="text" value="TAG-8825"></label>'+
        '<label class="sk-field"><span>الوزن المعلق بالكامل (كجم)</span><input id="b-hanging" type="number" step="0.1" value="21.5"></label>'+
        '<label class="sk-field"><span>اللحم الصافي الفاخر (كجم)</span><input id="b-prime" type="number" step="0.1" value="14.2"></label>'+
        '<label class="sk-field"><span>وزن العظم (كجم)</span><input id="b-bone" type="number" step="0.1" value="4.1"></label>'+
        '<label class="sk-field"><span>الشحم والزوائد (كجم)</span><input id="b-fat" type="number" step="0.1" value="2.6"></label>'+
        '<label class="sk-field"><span>الهدر غير الصالح (كجم)</span><input id="b-waste" type="number" step="0.1" value="0.6"></label>'+
        '<div style="display:flex;align-items:flex-end;"><button type="button" class="btn primary" id="b-save-btn" style="width:100%;">حفظ وتقييم الكفاءة</button></div>'+
      '</div>'+
    '</div>'+

    '<div class="sk-table-wrap" style="margin-top:12px;">'+
      '<table class="sk-table"><thead><tr>'+
        '<th>رقم الذبيحة</th><th>القصاب</th><th>الوزن المعلق</th><th>اللحم الصافي</th><th>العظم</th><th>الشحم</th><th>الهدر</th><th>نسبة الصافي (Yield)</th><th>التقييم</th><th>التاريخ</th>'+
      '</tr></thead><tbody>'+
      shifts.map(s=>{
        const yieldPct=s.hangingKg>0?(s.primeKg/s.hangingKg)*100:0;
        const isGreat=yieldPct>=65;
        const isGood=yieldPct>=60&&yieldPct<65;
        const stars=isGreat?'★★★★':isGood?'★★★☆':'★★☆☆';
        return '<tr><td><b>'+esc(s.carcassTag)+'</b></td><td>'+esc(s.butcher)+'</td><td>'+s.hangingKg.toFixed(1)+' كجم</td>'+
          '<td style="font-weight:bold;color:#047857;">'+s.primeKg.toFixed(1)+' كجم</td><td>'+s.boneKg.toFixed(1)+' كجم</td><td>'+s.fatKg.toFixed(1)+' كجم</td>'+
          '<td style="color:'+(s.wasteKg>1?'#b91c1c':'inherit')+';">'+s.wasteKg.toFixed(1)+' كجم</td>'+
          '<td><b>'+yieldPct.toFixed(1)+'٪</b></td>'+
          '<td><span class="sk-rating-stars">'+stars+'</span></td>'+
          '<td>'+s.date+'</td></tr>';
      }).join("")+
      '</tbody></table>'+
    '</div>'+
  '</div></div>';
}

function bindButcher(root){
  $("#b-save-btn",root).onclick=()=>{
    const name=$("#b-name",root).value.trim()||"قصاب";
    const tag=$("#b-tag",root).value.trim()||("TAG-"+Math.floor(1000+Math.random()*9000));
    const hanging=num($("#b-hanging",root).value);
    const prime=num($("#b-prime",root).value);
    const bone=num($("#b-bone",root).value);
    const fat=num($("#b-fat",root).value);
    const waste=num($("#b-waste",root).value);

    if(hanging<=0||prime<=0){
      SK.notify("يرجى إدخال وزن معلق ووزن صافي صحيحين.",{title:"بيانات ناقصة"});
      return;
    }

    const list=load(BUTCHER_KEY,defaultShifts);
    list.unshift({
      id:"SH-"+Math.floor(100+Math.random()*900),
      butcher:name,
      carcassTag:tag,
      hangingKg:hanging,
      primeKg:prime,
      boneKg:bone,
      fatKg:fat,
      wasteKg:waste,
      date:new Date().toISOString().slice(0,10)
    });
    save(BUTCHER_KEY,list);
    paintOps();
    toast("تم تسجيل عملية التشفية وحساب الكفاءة بنجاح","ok");
  };

  const csvBtn=$("#butcher-csv-btn",root);
  if(csvBtn)csvBtn.onclick=()=>{
    const shifts=load(BUTCHER_KEY,defaultShifts);
    const headers=["رقم الذبيحة","القصاب","الوزن المعلق","اللحم الصافي","العظم","الشحم","الهدر","نسبة الصافي","التاريخ"];
    const rows=shifts.map(s=>[s.carcassTag,s.butcher,s.hangingKg,s.primeKg,s.boneKg,s.fatKg,s.wasteKg,((s.primeKg/s.hangingKg)*100).toFixed(1)+"%",s.date]);
    csv.download("SQC-butcher-yield-"+new Date().toISOString().slice(0,10),headers,rows);
  };
}

/* ==========================================================================
   Tab 4: Meat Boxes & Recurring Subscriptions
   ========================================================================== */
function subsHTML(){
  const subs=load(SUBS_KEY,defaultSubs);
  const activeSubs=subs.filter(s=>s.status==="active").length;
  const mrr=subs.reduce((s,x)=>s+(x.cycle==="أسبوعي"?x.price*4:x.price),0);

  return '<div class="card"><div class="card-h"><div><h3>باقات واشتراكات اللحوم الدورية (Meat Boxes)</h3>'+
    '<p>حول مبيعات الملحمة إلى دخل دوري متكرر ومضمون من خلال اشتراكات اللحوم الأسبوعية والشهرية للعائلات والمطاعم.</p></div>'+
    '<button type="button" class="btn primary sm" id="sub-add-btn">+ إضافة مشترك جديد</button></div>'+
    '<div class="card-b sk-stack">'+
    '<div class="sk-kpis">'+
      '<div class="sk-kpi good"><span>المشتركون النشطون</span><b>'+activeSubs+' عميل</b></div>'+
      '<div class="sk-kpi accent"><span>الدخل الشهري المتكرر (MRR)</span><b>'+money(mrr)+'</b></div>'+
      '<div class="sk-kpi"><span>استهلاك اللحم الأسبوعي المجدول</span><b>~65 كجم</b></div>'+
      '<div class="sk-kpi"><span>معدل رضا المشتركين</span><b>98.4٪</b></div>'+
    '</div>'+

    '<div class="sk-sub-grid">'+
      '<div class="sk-sub-card popular">'+
        '<div><h4 style="margin:0 0 6px;">بوكس العائلة الشهري الفاخر</h4>'+
        '<p style="font-size:0.85rem;color:var(--ink-2,#666);margin:0 0 10px;">نصف ذبيحة نعيمي مقطعة ثلاجة + 2 كجم مفروم بلدي + 1 كجم كباب جاهز.</p>'+
        '<b style="font-size:1.2rem;color:var(--brand,#8a5a2b);">850 ر.س <small style="font-size:0.8rem;color:var(--ink-3,#888);">/ شهرياً</small></b></div>'+
        '<button type="button" class="btn sm" style="margin-top:12px;" data-sub-quick="family">طلب اشتراك جديد</button>'+
      '</div>'+
      '<div class="sk-sub-card">'+
        '<div><h4 style="margin:0 0 6px;">بوكس الشواء الأسبوعي</h4>'+
        '<p style="font-size:0.85rem;color:var(--ink-2,#666);margin:0 0 10px;">1.5 كجم ريش نعيمي + 1.5 كجم أوصال متبلة + 1 كجم برجر بلدي فاخر.</p>'+
        '<b style="font-size:1.2rem;color:var(--brand,#8a5a2b);">240 ر.س <small style="font-size:0.8rem;color:var(--ink-3,#888);">/ أسبوعياً</small></b></div>'+
        '<button type="button" class="btn sm" style="margin-top:12px;" data-sub-quick="bbq">طلب اشتراك جديد</button>'+
      '</div>'+
      '<div class="sk-sub-card">'+
        '<div><h4 style="margin:0 0 6px;">بوكس الصحة والكيتو</h4>'+
        '<p style="font-size:0.85rem;color:var(--ink-2,#666);margin:0 0 10px;">3 كجم ستيك وموزات عجل بلدي خالي تماماً من الشحم ومقطع بأعلى جودة.</p>'+
        '<b style="font-size:1.2rem;color:var(--brand,#8a5a2b);">290 ر.س <small style="font-size:0.8rem;color:var(--ink-3,#888);">/ أسبوعياً</small></b></div>'+
        '<button type="button" class="btn sm" style="margin-top:12px;" data-sub-quick="keto">طلب اشتراك جديد</button>'+
      '</div>'+
    '</div>'+

    '<div class="sk-table-wrap" style="margin-top:16px;">'+
      '<div class="card-h" style="padding:0 0 10px;"><div><b>قائمة المشتركين الحاليين وتنبيهات التوصيل</b></div></div>'+
      '<table class="sk-table"><thead><tr>'+
        '<th>رقم المشترك</th><th>اسم العميل</th><th>الجوال</th><th>الباقة</th><th>الدورية</th><th>القيمة</th><th>العنوان</th><th>الحالة</th><th>إجراء</th>'+
      '</tr></thead><tbody>'+
      subs.map((s,i)=>'<tr><td><b>'+esc(s.id)+'</b></td><td>'+esc(s.name)+'</td><td dir="ltr">'+esc(s.phone)+'</td>'+
        '<td>'+esc(s.planName)+'</td><td>'+esc(s.cycle)+'</td><td>'+money(s.price)+'</td><td>'+esc(s.addr)+'</td>'+
        '<td><span class="sk-ops-badge good">نشط</span></td>'+
        '<td><button type="button" class="btn sm" data-sub-notify="'+i+'">واتساب التوصيل</button></td></tr>').join("")+
      '</tbody></table>'+
    '</div>'+
  '</div></div>';
}

function bindSubs(root){
  $$("[data-sub-quick]",root).forEach(b=>{
    b.onclick=async()=>{
      const plan=b.dataset.subQuick;
      const f=await SK.form("اشتراك جديد",[
        {key:"name",label:"اسم العميل",required:true},
        {key:"phone",label:"رقم الجوال",placeholder:"05xxxxxxxx"},
        {key:"addr",label:"عنوان التوصيل",placeholder:"المدينة - الحي"}],{ok:"إضافة الاشتراك"});
      if(!f)return;
      const {name,phone,addr}=f;

      let pName="بوكس العائلة الشهري",price=850,cycle="شهري";
      if(plan==="bbq"){pName="بوكس الشواء الأسبوعي";price=240;cycle="أسبوعي";}
      else if(plan==="keto"){pName="بوكس الصحة والكيتو";price=290;cycle="أسبوعي";}

      const list=load(SUBS_KEY,defaultSubs);
      list.unshift({
        id:"SUB-"+Date.now().toString(36).slice(-6).toUpperCase(),
        name:name,
        phone:phone||"",
        plan:plan,
        planName:pName,
        cycle:cycle,
        price:price,
        addr:addr||"الرياض",
        status:"active"
      });
      save(SUBS_KEY,list);
      paintOps();
      toast("تم تفعيل اشتراك "+name+" بنجاح!","ok");
    };
  });

  $$("[data-sub-notify]",root).forEach(b=>{
    b.onclick=()=>{
      const sub=load(SUBS_KEY,defaultSubs)[+b.dataset.subNotify];
      if(!sub)return;
      let phone=(sub.phone||"").replace(/\D/g,"");
      if(phone.startsWith("05"))phone="966"+phone.slice(1);

      const msg=encodeURIComponent(
        "مرحباً بك أستاذ "+sub.name+" 🌸\n"+
        "نود إبلاغك بأنه تم تجهيز بوكس اللحوم الدوري الخاص بك:\n"+
        "📦 "+sub.planName+" ("+sub.cycle+")\n"+
        "تم تحضيره وتغليفه طازجاً بعناية في ملحمة ومطبخ SQC.\n"+
        "🚚 مندوب التوصيل في طريقه إليك اليوم.\n"+
        "📍 العنوان: "+sub.addr+"\n\n"+
        "نتمنى لك وجبة شهية وعافية دائمة!"
      );
      window.open("https://wa.me/"+(phone||"")+"?text="+msg,"_blank");
    };
  });

  const addBtn=$("#sub-add-btn",root);
  if(addBtn)addBtn.onclick=async()=>{
    const f=await SK.form("اشتراك بباقة خاصة",[
      {key:"name",label:"اسم العميل",required:true},
      {key:"phone",label:"رقم الجوال",placeholder:"05xxxxxxxx"},
      {key:"pName",label:"اسم الباقة",required:true,placeholder:"مثال: بوكس العائلة"},
      {key:"price",label:"القيمة الشهرية (ر.س)",type:"number",min:0,step:"0.01",required:true}],{ok:"إضافة الاشتراك"});
    if(!f)return;
    const {name,phone,pName}=f,price=num(f.price);
    const list=load(SUBS_KEY,defaultSubs);
    list.unshift({
      id:"SUB-"+Date.now().toString(36).slice(-6).toUpperCase(),
      name:name,
      phone:phone||"",
      plan:"custom",
      planName:pName,
      cycle:"شهري",
      price:price,
      addr:"الرياض",
      status:"active"
    });
    save(SUBS_KEY,list);
    paintOps();
    toast("تمت إضافة المشترك بنجاح","ok");
  };
}

/* ==========================================================================
   Tab 5: Meat Aging & Maturation Chamber (غرفة تعتيق اللحوم الجافة والرطبة)
   ========================================================================== */
const AGING_KEY="skosif_ops_aging_chamber";
const defaultAgingPieces=[];

function agingCalc(p){
  const now=new Date();
  const entry=new Date(p.entryDate||now);
  const diffTime=now.getTime()-entry.getTime();
  const daysElapsed=Math.max(0,Math.floor(diffTime/(1000*60*60*24)));
  const targetDays=Math.max(1,num(p.targetDays)||30);
  const progress=Math.min(100,Math.round((daysElapsed/targetDays)*100));

  let moisturePct=0, trimPct=0;
  if(p.type==="dry"){
    moisturePct=Math.min(26,4+(daysElapsed*0.35));
    trimPct=Math.min(15,8+(daysElapsed*0.15));
  } else if(p.type==="umai"){
    moisturePct=Math.min(20,3+(daysElapsed*0.28));
    trimPct=Math.min(10,5+(daysElapsed*0.10));
  } else {
    moisturePct=Math.min(5,1+(daysElapsed*0.06));
    trimPct=Math.min(4,1+(daysElapsed*0.04));
  }
  const totalLossPct=moisturePct+trimPct;
  const rawKg=Math.max(0.1,num(p.rawKg));
  const usableKg=Math.max(0.05,rawKg*(1-(totalLossPct/100)));
  const totalRawCost=rawKg*num(p.rawCostKg);
  const realCostPerKg=totalRawCost/usableKg;
  const margin=Math.min(85,Math.max(5,num(p.margin)||35));
  const suggestedPriceKg=realCostPerKg/(1-(margin/100));
  const totalSalesTarget=usableKg*suggestedPriceKg;
  const netProfitTotal=totalSalesTarget-totalRawCost;

  let flavorStage="طراوة أولية وخفيفة";
  if(daysElapsed>=45)flavorStage="نكهة أومامي فائقة ومكسرات (Ultra Dry-Aged)";
  else if(daysElapsed>=28)flavorStage="ذروة التوازن والتركيز النكهي (Peak Umami)";
  else if(daysElapsed>=14)flavorStage="طراوة متطورة ونضج أنسجة مثالي (Prime Tender)";

  return {daysElapsed,targetDays,progress,moisturePct,trimPct,totalLossPct,rawKg,usableKg,totalRawCost,realCostPerKg,suggestedPriceKg,totalSalesTarget,netProfitTotal,flavorStage};
}

function agingHTML(){
  const pieces=load(AGING_KEY,defaultAgingPieces);
  const activeCount=pieces.filter(p=>p.status==="active").length;
  const totalRaw=pieces.reduce((s,p)=>s+num(p.rawKg),0);

  return '<div class="card"><div class="card-h"><div><h3>غرفة تعتيق اللحوم الجافة والرطبة (Dry & Wet Aging Chamber)</h3>'+
    '<p>تتبع فترات التعتيق، انكماش الرطوبة، فاقد التشفية الخارجي (Pellicle Loss)، وحساب تكلفة وسعر البيع الحقيقي للستيك الفاخر.</p></div>'+
    '<div class="sk-actions"><button type="button" class="btn sm primary" id="aging-new-btn">+ إدخال قطعة جديدة للتعتيق</button><button type="button" class="btn sm" id="aging-wa-btn">تقرير الغرفة (واتساب)</button></div></div>'+
    '<div class="card-b sk-stack">'+
    '<div class="sk-kpis">'+
      '<div class="sk-kpi"><span>إجمالي القطع في الغرفة</span><b>'+pieces.length+' قطعة</b></div>'+
      '<div class="sk-kpi good"><span>قيد التعتيق النشط</span><b>'+activeCount+'</b></div>'+
      '<div class="sk-kpi"><span>إجمالي الوزن المدخل</span><b>'+totalRaw.toFixed(1)+' كجم</b></div>'+
      '<div class="sk-kpi accent"><span>حرارة / رطوبة الغرفة المثالية</span><b>1.5°م / 78٪</b></div>'+
    '</div>'+

    '<div id="aging-form-box" style="display:none;background:var(--surface-2,#fbf5ea);border:1px solid var(--line,#e2d8cc);border-radius:12px;padding:16px;">'+
      '<div class="sk-section-title" style="margin-bottom:12px;"><b>تسجيل قطعة لحم جديدة في غرفة التعتيق</b></div>'+
      '<div class="sk-grid2">'+
        '<label class="sk-field"><span>رمز القطعة (Tag ID)</span><input id="ag-id" type="text" value="AG-'+Math.floor(100+Math.random()*900)+'"></label>'+
        '<label class="sk-field"><span>وصف وسلالة اللحم</span><input id="ag-tag" type="text" placeholder="مثال: ريب آي واغيو أسترالي MB7+"></label>'+
        '<label class="sk-field"><span>نوع القطعية</span><select id="ag-cut">'+
          '<option value="ريب آي بعظمه">ريب آي كتل بعظمه (Ribeye On Bone)</option>'+
          '<option value="تندرلوين كامل">تندرلوين فيليه كامل (Whole Tenderloin)</option>'+
          '<option value="ستريب لوين">ستريب لوين كامل (Whole Striploin)</option>'+
          '<option value="توماهوك ستيك">توماهوك فاخر (Tomahawk Primal)</option>'+
          '<option value="تي بون / شورت لوين">شورت لوين تي بون (T-Bone / Short Loin)</option>'+
          '<option value="بريسكت بلدي">بريسكت عجل بلدي (Brisket Primal)</option>'+
        '</select></label>'+
        '<label class="sk-field"><span>طريقة التعتيق</span><select id="ag-type">'+
          '<option value="dry">تعتيق جاف تقليدي بالغرفة (Dry-Aged Open Chamber)</option>'+
          '<option value="umai">تعتيق جاف بأكياس نفاذية (UMAi Dry Membrane)</option>'+
          '<option value="wet">تعتيق رطب تفريغ هوائي (Wet-Aged Vacuum)</option>'+
        '</select></label>'+
      '</div>'+
      '<div class="sk-grid2">'+
        '<label class="sk-field"><span>الوزن الأولي عند الدخول (كجم)</span><input id="ag-raw-kg" type="number" step="0.1" value="12.0"></label>'+
        '<label class="sk-field"><span>سعر تكلفة الشراء للكيلو (ر.س)</span><input id="ag-cost-kg" type="number" step="1" value="95"></label>'+
        '<label class="sk-field"><span>تاريخ الدخول للغرفة</span><input id="ag-date" type="date" value="'+new Date().toISOString().slice(0,10)+'"></label>'+
        '<label class="sk-field"><span>فترة التعتيق المستهدفة (أيام)</span><select id="ag-days">'+
          '<option value="21">21 يوم (طراوة سريعة)</option>'+
          '<option value="30" selected>30 يوم (المعيار الذهبي للستيك)</option>'+
          '<option value="45">45 يوم (أومامي عالي ونكهة مكسرات)</option>'+
          '<option value="60">60 يوم (تعتيق عميق للذواقة)</option>'+
        '</select></label>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px;">'+
        '<button type="button" class="btn primary" id="ag-save-btn">حفظ وتسكين في الغرفة</button>'+
        '<button type="button" class="btn" id="ag-cancel-btn">إلغاء</button>'+
      '</div>'+
    '</div>'+

    '<div class="sk-aging-grid">'+
      pieces.map((p,idx)=>{
        const c=agingCalc(p);
        const isDone=c.daysElapsed>=c.targetDays;
        return '<article class="sk-aging-card">'+
          '<div class="sk-aging-header">'+
            '<div>'+
              '<span class="sk-ops-badge '+(p.status==='done'?'good':isDone?'good':'warn')+'">'+(p.status==='done'?'✓ تم التقطيع والبيع':isDone?'✓ مكتمل وجاهز للتقطيع':'⏳ جارِ التعتيق')+'</span>'+
              '<h4>'+esc(p.tag)+'</h4>'+
              '<small style="color:var(--ink-3);">رمز: '+esc(p.id)+' | طريقة: '+(p.type==='dry'?'تعتيق جاف':p.type==='umai'?'أكياس UMAi':'تعتيق رطب')+'</small>'+
            '</div>'+
            '<div style="text-align:left;">'+
              '<b style="font-size:1.15rem;color:var(--brand,#8a5a2b);">'+c.daysElapsed+' / '+c.targetDays+'</b><br><small style="color:var(--ink-3);">يوم تعتيق</small>'+
            '</div>'+
          '</div>'+
          '<div class="sk-aging-meter" title="نسبة الإنجاز '+c.progress+'%"><div class="sk-aging-meter-fill" style="width:'+c.progress+'%;"></div></div>'+
          '<div class="sk-aging-flavor">مرحلة النكهة: <b>'+esc(c.flavorStage)+'</b></div>'+
          '<dl class="sk-aging-stats">'+
            '<div><dt>الوزن الأولي:</dt><dd>'+c.rawKg.toFixed(2)+' كجم</dd></div>'+
            '<div><dt>الفاقد التقديري (رطوبة + تشفية):</dt><dd class="bad">-'+c.totalLossPct.toFixed(1)+'%</dd></div>'+
            '<div><dt>الوزن الصافي القابل للبيع:</dt><dd style="color:#059669;">'+c.usableKg.toFixed(2)+' كجم</dd></div>'+
            '<div><dt>التكلفة الفعلية للكيلو الصافي:</dt><dd>'+money(c.realCostPerKg)+'</dd></div>'+
            '<div><dt>سعر البيع المقترح للكيلو:</dt><dd style="font-size:1rem;color:var(--brand,#8a5a2b);">'+money(c.suggestedPriceKg)+'</dd></div>'+
            '<div><dt>الربح المتوقع للقطعة:</dt><dd class="good">'+money(c.netProfitTotal)+'</dd></div>'+
          '</dl>'+
          '<div class="sk-actions" style="margin-top:auto;">'+
            '<button type="button" class="btn sm" data-ag-print="'+idx+'">طباعة ملصق التعتيق</button>'+
            (p.status!=='done'?'<button type="button" class="btn sm primary" data-ag-finish="'+idx+'">إنهاء وتجهيز للبيع</button>':'')+
            '<button type="button" class="btn sm" data-ag-del="'+idx+'" style="color:#b91c1c;">حذف</button>'+
          '</div>'+
        '</article>';
      }).join("")+
    '</div>'+
  '</div></div>';
}

function bindAging(content){
  const box=$("#aging-form-box",content);
  $("#aging-new-btn",content)?.addEventListener("click",()=>{
    if(box)box.style.display=box.style.display==="none"?"block":"none";
  });
  $("#ag-cancel-btn",content)?.addEventListener("click",()=>{
    if(box)box.style.display="none";
  });
  $("#ag-save-btn",content)?.addEventListener("click",()=>{
    const id=($("#ag-id")?.value||"AG-"+Math.floor(100+Math.random()*900)).trim();
    const tag=($("#ag-tag")?.value||"قطعة معتقة خاصة").trim();
    const cut=$("#ag-cut")?.value||"ريب آي بعظمه";
    const type=$("#ag-type")?.value||"dry";
    const rawKg=num($("#ag-raw-kg")?.value)||10;
    const rawCostKg=num($("#ag-cost-kg")?.value)||90;
    const entryDate=$("#ag-date")?.value||new Date().toISOString().slice(0,10);
    const targetDays=num($("#ag-days")?.value)||30;

    const list=load(AGING_KEY,defaultAgingPieces);
    list.unshift({id,tag,cut,breed:"بلدي / أنجوس",type,rawKg,rawCostKg,entryDate,targetDays,temp:1.5,humidity:78,margin:38,status:"active"});
    save(AGING_KEY,list);
    paintOps();
    toast("تم تسكين القطعة "+id+" في غرفة التعتيق بنجاح 🥩","ok");
  });

  $$("[data-ag-print]",content).forEach(b=>{
    b.onclick=()=>{
      const p=load(AGING_KEY,defaultAgingPieces)[+b.dataset.agPrint];
      if(!p)return;
      const c=agingCalc(p);
      const w=window.open("","_blank","width=450,height=550");
      if(!w)return toast("يرجى السماح بالنوافذ المنبثقة لطباعة الملصق");
      w.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>ملصق تعتيق - '+esc(p.id)+'</title>'+
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap"><style>body{font-family:"IBM Plex Sans Arabic",Tahoma,sans-serif;padding:20px;text-align:center;border:2px dashed #333;margin:10px;border-radius:12px;}'+
        'h2{margin:6px 0;color:#8a5a2b;}table{width:100%;margin:14px 0;border-collapse:collapse;}td{padding:6px;border-bottom:1px solid #eee;text-align:right;}'+
        'b{color:#111;}.tag{display:inline-block;padding:4px 10px;background:#eee;border-radius:6px;font-size:12px;margin-bottom:8px;}</style></head><body>'+
        '<div class="tag">غرفة التعتيق الفاخرة — SQC</div>'+
        '<h2>'+esc(p.tag)+'</h2>'+
        '<div>رمز القطعة: <b>'+esc(p.id)+'</b></div>'+
        '<table>'+
        '<tr><td>تاريخ الدخول:</td><td><b>'+esc(p.entryDate)+'</b></td></tr>'+
        '<tr><td>مدة التعتيق:</td><td><b>'+c.targetDays+' يوم</b> ('+(p.type==='dry'?'تعتيق جاف':'تعتيق رطب')+')</td></tr>'+
        '<tr><td>الوزن المبدئي:</td><td><b>'+c.rawKg.toFixed(2)+' كجم</b></td></tr>'+
        '<tr><td>الوزن الصافي المتوقع:</td><td><b>'+c.usableKg.toFixed(2)+' كجم</b></td></tr>'+
        '<tr><td>سعر الكيلو المقترح:</td><td><b>'+money(c.suggestedPriceKg)+'</b></td></tr>'+
        '</table>'+
        '<div style="font-size:12px;color:#666;margin-top:12px;">تحفظ في حرارة 1° إلى 2.5° مئوية ورطوبة 75-80٪</div>'+
        '<script>window.onload=()=>{window.print();}<\/script></body></html>');
      w.document.close();SK.brandPrint(w);
    };
  });

  $$("[data-ag-finish]",content).forEach(b=>{
    b.onclick=async()=>{
      const list=load(AGING_KEY,defaultAgingPieces);
      const idx=+b.dataset.agFinish;
      if(!list[idx])return;
      const f=await SK.form("إنهاء التعتيق",[{key:"kg",label:"الوزن الصافي الفعلي (كجم)",type:"number",min:0,step:"0.01",required:true,value:agingCalc(list[idx]).usableKg.toFixed(2),hint:"بعد التشفية وإزالة القشرة"}],{ok:"إنهاء ونقل للمبيعات"});
      if(!f)return;
      const actualUsable=f.kg;
      list[idx].status="done";
      list[idx].finalUsableKg=num(actualUsable);
      list[idx].finishDate=new Date().toISOString().slice(0,10);
      save(AGING_KEY,list);
      paintOps();
      toast("تم إنهاء التعتيق ونقل القطعة للمبيعات بنجاح","ok");
    };
  });

  $$("[data-ag-del]",content).forEach(b=>{
    b.onclick=async()=>{
      if(!await SK.confirm("حذف هذه القطعة من سجل الغرفة؟",{danger:true,ok:"حذف"}))return;
      const list=load(AGING_KEY,defaultAgingPieces);
      list.splice(+b.dataset.agDel,1);
      save(AGING_KEY,list);
      paintOps();
      toast("تم حذف القطعة من السجل");
    };
  });

  $("#aging-wa-btn",content)?.addEventListener("click",()=>{
    const pieces=load(AGING_KEY,defaultAgingPieces);
    let msg="*🥩 تقرير غرفة تعتيق اللحوم — SQC*\nالتاريخ: "+new Date().toLocaleDateString("ar-SA")+"\n--------------------------------\n";
    pieces.forEach(p=>{
      const c=agingCalc(p);
      msg+="• *"+p.tag+"* ("+p.id+")\n   - الأيام: "+c.daysElapsed+"/"+c.targetDays+" يوم ("+(c.progress)+"%)\n   - الوزن الصافي المقدر: "+c.usableKg.toFixed(2)+" كجم\n   - سعر البيع المقترح: "+c.suggestedPriceKg.toFixed(0)+" ر.س/كجم\n";
    });
    msg+="--------------------------------\nغرفة التبريد: 1.5°م | الرطوبة: 78٪\nجودة وسلامة اللحوم مطابقة للمواصفات.";
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  });
}

/* ==========================================================================
   Master Render & Tab Switcher
   ========================================================================== */
function storageHubNav(activeId){
  const tabs=[
    {id:"inventory",icon:"",title:"رادار الصلاحية والمخزون FIFO (F9)"},
    {id:"operations",icon:"",title:"غرف التعتيق ومناسبات الشواء (F8)"},
    {id:"traceability",icon:"",title:"مراقبة سلسلة التبريد HACCP"}
  ];
  return '<div class="sk-hub-nav">'+tabs.map(t=>'<button type="button" class="sk-hub-btn '+(t.id===activeId?'active':'')+'" data-storage-go="'+t.id+'"><span>'+t.icon+'</span><span>'+t.title+'</span></button>').join("")+'</div>';
}

function paintOps(){
  const r=roots.ops;
  if(!r||!r.isConnected)return;

  r.innerHTML=storageHubNav("operations")+'<div class="sk-ops-wrap">'+
    '<div class="sk-ops-nav" role="tablist">'+
      '<button type="button" role="tab" aria-selected="'+(opsTab==="bbq")+'" class="'+(opsTab==="bbq"?'active':'')+'" data-tab="bbq">حاسبة الشواء والمناسبات</button>'+
      '<button type="button" role="tab" aria-selected="'+(opsTab==="po")+'" class="'+(opsTab==="po"?'active':'')+'" data-tab="po">أوامر الشراء واستلام الذبائح</button>'+
      '<button type="button" role="tab" aria-selected="'+(opsTab==="butcher")+'" class="'+(opsTab==="butcher"?'active':'')+'" data-tab="butcher">كفاءة التشفية والقصابين</button>'+
      '<button type="button" role="tab" aria-selected="'+(opsTab==="subs")+'" class="'+(opsTab==="subs"?'active':'')+'" data-tab="subs">باقات واشتراكات اللحوم</button>'+
      '<button type="button" role="tab" aria-selected="'+(opsTab==="aging")+'" class="'+(opsTab==="aging"?'active':'')+'" data-tab="aging">غرفة التعتيق (Dry Aging)</button>'+
    '</div>'+
    '<div id="sk-ops-tab-content"></div>'+
  '</div>';

  $$("[data-storage-go]",r).forEach(b=>b.onclick=()=>window.SKosifCore?.go(b.dataset.storageGo));

  $$(".sk-ops-nav button",r).forEach(b=>{
    b.onclick=()=>{
      opsTab=b.dataset.tab;
      paintOps();
    };
  });

  const content=$("#sk-ops-tab-content",r);
  if(opsTab==="bbq"){
    content.innerHTML=bbqHTML();
    bindBBQ(content);
  } else if(opsTab==="po"){
    content.innerHTML=poHTML();
    bindPO(content);
  } else if(opsTab==="butcher"){
    content.innerHTML=butcherHTML();
    bindButcher(content);
  } else if(opsTab==="subs"){
    content.innerHTML=subsHTML();
    bindSubs(content);
  } else if(opsTab==="aging"){
    content.innerHTML=agingHTML();
    bindAging(content);
  }
}

window.SK.view("operations",{
  title:"المناسبات والتشغيل",
  sub:"حاسبة الشواء والمناسبات، أوامر الشراء وفحص الاستلام، كفاءة التشفية، اشتراكات اللحوم، وغرفة التعتيق",
  emoji:"",
  render(node){
    roots.ops=node;
    paintOps();
  }
});

window.SKosifOperations=Object.freeze({
  bbqCalc,
  agingCalc,
  getPOs:()=>load(PO_KEY,defaultPOs),
  getShifts:()=>load(BUTCHER_KEY,defaultShifts),
  getSubs:()=>load(SUBS_KEY,defaultSubs),
  getAging:()=>load(AGING_KEY,defaultAgingPieces)
});

})();

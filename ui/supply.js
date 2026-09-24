/* S.kosif — الموردون والمشتريات + التدفق النقدي
   - شحنات الموردين: الهدر المتفق عليه مقابل المقاس فعلياً، الجودة، التكلفة الحقيقية للكيلو الصافي
   - ترتيب الموردين (A+ … D) ومستوى المخاطر، ومقارنة الموردين لنفس الصنف مقابل افتراض الكتالوج
   - أمر شراء جاهز للإرسال
   - التدفق النقدي الشهري: المبيعات المستوردة مقابل المشتريات والمصروفات، وتوقع موسمي بالهجري
   يقرأ بيانات التطبيق الأساسي فقط ولا يعدّلها. */
(()=>{
  "use strict";
  const STORE={batches:"skosif_v31_supplier_batches",opex:"skosif_v31_monthly_opex",season:"skosif_v33_season_factors"};
  const PRICING_KEY="aghnam-pricing-v3", MASTER_KEY="aghnam-v15-master-lists";
  const DB_NAME="aghnam-app-v7";
  const VAT=0.15, WASTE_STD=0.08;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const num=v=>{const n=Number(String(v??"").replace(/,/g,""));return Number.isFinite(n)?n:0};
  const money=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
  const pct=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1}).format((Number(v)||0)*100)+"٪";
  const UNITS=["كجم","ذبيحة","رأس","كرتون"];
  const qfmt=(v,u)=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2}).format(Number(v)||0)+" "+(u||"كجم");
  const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
  const kpi=(a,b,c="")=>'<div class="sk-kpi '+c+'"><span>'+a+'</span><b>'+b+'</b></div>';
  const field=(id,label,type,ph,extra="")=>'<label class="sk-field"><span>'+label+'</span><input id="'+id+'" type="'+type+'" placeholder="'+esc(ph)+'" '+extra+'></label>';

  const toast=msg=>window.SK.toast(msg,"info");
  async function copy(text){
    try{await navigator.clipboard.writeText(text);toast("تم النسخ");}
    catch{window.prompt("انسخ النص:",text);}
  }

  /* ---------- بيانات التطبيق الأساسي (قراءة فقط) ---------- */
  function catalogRaws(){
    let raws=[];
    try{if(window.SKosifCore)raws=window.SKosifCore.raws()}catch{}
    if(!raws.length){const s=load(PRICING_KEY,null);raws=s&&Array.isArray(s.raws)?s.raws:[];}
    return raws.filter(r=>r&&r.status!=="archived").map(r=>{
      const buy=num(r.buy), waste=num(r.waste)/100;
      const net=r.vat==="incl"?buy/(1+VAT):buy;
      return {id:String(r.id),name:String(r.name||r.id),cat:String(r.cat||""),buyNet:net,waste,usableCost:waste<1?net/(1-waste):0};
    });
  }
  function knownSuppliers(batches){
    const m=load(MASTER_KEY,null);
    const names=new Set((m&&Array.isArray(m.suppliers)?m.suppliers:[]).map(s=>String(s&&s.name||"").trim()).filter(Boolean));
    batches.forEach(b=>b.supplier&&names.add(b.supplier));
    return [...names];
  }

  /* ---------- حسابات الشحنات والموردين ---------- */
  function batchCalc(b){
    const qty=num(b.qty), gross=num(b.priceGross);
    const unitNet=b.vatIncl?gross/(1+VAT):gross;
    const totalNet=unitNet*qty, totalGross=b.vatIncl?gross*qty:gross*qty*(1+VAT);
    const actual=num(b.actualWaste)/100, agreed=num(b.agreedWaste)/100;
    const usable=qty*(1-actual);
    const variance=actual-agreed;
    const status=variance<=0.005?"compliant":variance<=0.02?"minor":"critical";
    return {...b,unitNet,totalNet,totalGross,actual,agreed,usable,variance,status,
      wasteCost:totalNet*actual, overWasteCost:Math.max(0,variance)*totalNet,
      effCost:usable>0?totalNet/usable:0};
  }
  function supplierStats(rows){
    const by=new Map();
    rows.forEach(r=>{const k=r.supplier||"غير محدد";if(!by.has(k))by.set(k,[]);by.get(k).push(r)});
    return [...by.entries()].map(([name,list])=>{
      const qty=list.reduce((a,r)=>a+num(r.qty),0), spend=list.reduce((a,r)=>a+r.totalNet,0);
      const w=(f)=>qty>0?list.reduce((a,r)=>a+f(r)*num(r.qty),0)/qty:0;
      const actual=w(r=>r.actual), agreed=w(r=>r.agreed), usable=list.reduce((a,r)=>a+r.usable,0);
      const quality=list.reduce((a,r)=>a+num(r.quality),0)/list.length;
      const variance=actual-agreed, critical=list.filter(r=>r.status==="critical").length;
      /* الدرجة من 100: مستوى الهدر (4٪ ممتاز ← 12٪ صفر)، الالتزام بالمتفق عليه، الجودة */
      const clamp01=x=>Math.max(0,Math.min(1,x));
      const score=100*(0.45*clamp01(1-(actual-0.04)/0.08)+0.30*clamp01(1-Math.max(0,variance)/0.02)+0.25*(quality/5));
      const tier=score>=90?"A+":score>=80?"A":score>=65?"B":score>=50?"C":"D";
      const risk=critical>=2||variance>0.03?"critical":variance>0.015||actual>0.10?"high":variance>0.005?"moderate":"low";
      return {name,batches:list.length,qty,spend,actual,agreed,variance,usable,quality,score,tier,risk,
        wasteCost:list.reduce((a,r)=>a+r.wasteCost,0),overWasteCost:list.reduce((a,r)=>a+r.overWasteCost,0),
        effCost:usable>0?spend/usable:0,items:[...new Set(list.map(r=>r.itemName))],
        unit:new Set(list.map(r=>r.unit||"كجم")).size===1?(list[0].unit||"كجم"):"وحدة"};
    }).sort((a,b)=>b.score-a.score);
  }
  function itemComparison(rows,raws){
    const by=new Map();
    rows.forEach(r=>{const u=r.unit||"كجم",k=(r.itemId||r.itemName)+"|"+u;if(!by.has(k))by.set(k,{itemId:r.itemId,itemName:r.itemName,unit:u,sup:new Map()});
      const g=by.get(k).sup;if(!g.has(r.supplier))g.set(r.supplier,[]);g.get(r.supplier).push(r)});
    return [...by.values()].map(it=>{
      /* الكتالوج بسعر الكيلو، فالمقارنة معه لوحدة الكجم فقط */
      const cat=it.unit==="كجم"?raws.find(x=>x.id===it.itemId):null;
      const sups=[...it.sup.entries()].map(([name,list])=>{
        const qty=list.reduce((a,r)=>a+num(r.qty),0), net=list.reduce((a,r)=>a+r.totalNet,0), usable=list.reduce((a,r)=>a+r.usable,0);
        return {name,qty,effCost:usable>0?net/usable:0,actual:qty>0?list.reduce((a,r)=>a+r.actual*num(r.qty),0)/qty:0,last:list.map(r=>r.date).sort().pop()};
      }).sort((a,b)=>a.effCost-b.effCost);
      return {...it,cat,sups};
    });
  }

  /* ---------- تبويب الموردين ---------- */
  function suppliersHTML(){
    const raws=catalogRaws(), rows=load(STORE.batches,[]).map(batchCalc);
    const stats=supplierStats(rows), comp=itemComparison(rows,raws);
    const spend=rows.reduce((a,r)=>a+r.totalNet,0), qty=rows.reduce((a,r)=>a+num(r.qty),0);
    const avgWaste=qty>0?rows.reduce((a,r)=>a+r.actual*num(r.qty),0)/qty:0;
    const wasteCost=rows.reduce((a,r)=>a+r.wasteCost,0), over=rows.reduce((a,r)=>a+r.overWasteCost,0);
    const sups=knownSuppliers(rows);
    const riskAr={low:"منخفض",moderate:"متوسط",high:"مرتفع",critical:"حرج"}, statusAr={compliant:"مطابق",minor:"انحراف بسيط",critical:"انحراف حرج"};
    const today=new Date().toISOString().slice(0,10);
    return [
      '<div class="sk31-title"><h3>أداء الموردين والهدر الفعلي</h3><p>سجّل كل شحنة مستلمة بالهدر المتفق عليه والمقاس فعلياً بعد التشفية، لتعرف التكلفة الحقيقية للكيلو الصافي ومن يلتزم من الموردين.</p></div>',
      '<div class="sk-kpis">',
        kpi("مشتريات مسجلة (صافي)",money(spend)),
        kpi("متوسط الهدر الفعلي المرجح",pct(avgWaste),avgWaste>WASTE_STD?"warn":"good"),
        kpi("قيمة الهدر",money(wasteCost)),
        kpi("خسارة تجاوز المتفق عليه",money(over),over>0?"warn":"good"),
      '</div>',
      '<div class="sk-actions"><button id="sk31-po-new" class="sk-secondary" type="button">منشئ أمر شراء (واتساب)</button></div>',
      '<details class="sk31-card" '+(rows.length?'':'open')+'><summary><b>＋ تسجيل شحنة مستلمة</b></summary>',
        '<div class="sk-grid2">',
          field("sk31-date","التاريخ","date","",'value="'+today+'"'),
          '<label class="sk-field"><span>المورد</span><input id="sk31-sup" list="sk31-sup-list" placeholder="اسم المورد"><datalist id="sk31-sup-list">'+sups.map(s=>'<option value="'+esc(s)+'">').join("")+'</datalist></label>',
          '<label class="sk-field"><span>الصنف</span><select id="sk31-item">'+(raws.length?raws.map(r=>'<option value="'+esc(r.id)+'">'+esc(r.name)+'</option>').join(""):'<option value="">لا توجد أصناف في الكتالوج</option>')+'<option value="__other">صنف آخر…</option></select></label>',
          field("sk31-item-other","اسم الصنف (إن لم يكن في الكتالوج)","text","مثال: نعيمي حي"),
          field("sk31-qty","الكمية المستلمة","number","0",'step="0.01" min="0"'),
          '<label class="sk-field"><span>الوحدة</span><select id="sk31-unit">'+UNITS.map(u=>'<option>'+u+'</option>').join("")+'</select></label>',
          field("sk31-price","سعر الوحدة","number","0",'step="0.01" min="0"'),
          '<label class="sk-field"><span>السعر</span><select id="sk31-vat"><option value="1">شامل الضريبة</option><option value="0">غير شامل الضريبة</option></select></label>',
          field("sk31-agreed","الهدر المتفق عليه ٪","number","8",'step="0.1" min="0" max="100"'),
          field("sk31-actual","الهدر المقاس فعلياً ٪","number","0",'step="0.1" min="0" max="100"'),
          '<label class="sk-field"><span>تقييم الجودة</span><select id="sk31-q">'+[5,4,3,2,1].map(n=>'<option value="'+n+'">'+"★".repeat(n)+'</option>').join("")+'</select></label>',
          field("sk31-note","ملاحظات الاستلام","text","اختياري"),
        '</div>',
        '<div id="sk31-err" class="sk-error"></div>',
        '<div class="sk-actions"><button id="sk31-add" class="sk-primary" type="button">حفظ الشحنة</button></div>',
      '</details>',
      rows.length?'':'<div class="sk-empty">لا توجد شحنات مسجلة بعد. سجّل أول شحنة لتظهر مقارنة الموردين.</div>',
      stats.length?[
        '<h4 class="sk31-h">ترتيب الموردين</h4>',
        '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المورد</th><th>التصنيف</th><th>الشحنات</th><th>الكمية</th><th>هدر فعلي / متفق</th><th>تكلفة الوحدة الصافية</th><th>الجودة</th><th>المخاطر</th></tr></thead><tbody>',
        stats.map(s=>'<tr><td><b>'+esc(s.name)+'</b><small class="sk31-sub">'+esc(s.items.join("، "))+'</small></td><td><span class="sk31-tier sk31-t'+s.tier.replace("+","p")+'">'+s.tier+'</span></td><td>'+s.batches+'</td><td>'+qfmt(s.qty,s.unit)+'</td><td>'+pct(s.actual)+' / '+pct(s.agreed)+(s.variance>0.005?' <small class="sk31-bad">+'+pct(s.variance)+'</small>':'')+'</td><td>'+money(s.effCost)+'</td><td>'+s.quality.toFixed(1)+' / 5</td><td><span class="sk31-risk sk31-'+s.risk+'">'+riskAr[s.risk]+'</span></td></tr>').join(""),
        '</tbody></table></div>'
      ].join(""):'',
      comp.length?[
        '<h4 class="sk31-h">مقارنة الموردين لنفس الصنف</h4>',
        comp.map(it=>{
          const best=it.sups[0], c=it.cat;
          const gap=c&&best?best.effCost-c.usableCost:0;
          return '<div class="sk31-card"><div class="sk31-row"><b>'+esc(it.itemName)+' <small>('+esc(it.unit)+')</small></b>'+
            (c?'<small>افتراض الكتالوج: هدر '+pct(c.waste)+' ← '+money(c.usableCost)+' للكيلو الصافي</small>':'<small>'+(it.unit==="كجم"?'غير مرتبط بصنف في الكتالوج':'الكتالوج بسعر الكيلو فلا تُقارن هذه الوحدة')+'</small>')+'</div>'+
            '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>المورد</th><th>الكمية</th><th>الهدر الفعلي</th><th>تكلفة الوحدة الصافية</th><th>آخر شحنة</th><th></th></tr></thead><tbody>'+
            it.sups.map((s,i)=>'<tr><td>'+(i===0?'🥇 ':'')+esc(s.name)+'</td><td>'+qfmt(s.qty,it.unit)+'</td><td>'+pct(s.actual)+'</td><td>'+money(s.effCost)+'</td><td>'+esc(s.last||"")+'</td><td><button class="sk-secondary sk31-po" type="button" data-sup="'+esc(s.name)+'" data-item="'+esc(it.itemName)+'" data-unit="'+esc(it.unit)+'">أمر توريد</button></td></tr>').join("")+
            '</tbody></table></div>'+
            (c&&best&&Math.abs(gap)>=0.01?'<p class="'+(gap>0?'sk-warning':'sk-success')+'">'+(gap>0
              ?'أفضل تكلفة فعلية أعلى من افتراض الكتالوج بـ '+money(gap)+' للكيلو — راجع نسبة الهدر أو سعر الشراء في الكتالوج.'
              :'أفضل تكلفة فعلية أقل من افتراض الكتالوج بـ '+money(-gap)+' للكيلو.')+'</p>':'')+
            '</div>';
        }).join("")
      ].join(""):'',
      rows.length?[
        '<h4 class="sk31-h">سجل الشحنات</h4>',
        '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>التاريخ</th><th>المورد</th><th>الصنف</th><th>الكمية</th><th>صافي الشحنة</th><th>هدر فعلي / متفق</th><th>الحالة</th><th></th></tr></thead><tbody>',
        rows.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(r=>'<tr><td>'+esc(r.date)+'</td><td>'+esc(r.supplier)+'</td><td>'+esc(r.itemName)+'</td><td>'+qfmt(r.qty,r.unit)+'</td><td>'+money(r.totalNet)+'</td><td>'+pct(r.actual)+' / '+pct(r.agreed)+'</td><td><span class="sk31-risk sk31-'+(r.status==="compliant"?"low":r.status==="minor"?"moderate":"critical")+'">'+statusAr[r.status]+'</span></td><td><button class="sk31-del" type="button" data-id="'+esc(r.id)+'" aria-label="حذف">🗑</button></td></tr>').join(""),
        '</tbody></table></div>',
        '<div class="sk-actions"><button id="sk31-csv" class="sk-secondary" type="button">تصدير الشحنات CSV</button></div>'
      ].join(""):''
    ].join("");
  }
  function bindSuppliers(){
    const itemSel=$("sk31-item"), other=$("sk31-item-other");
    const syncOther=()=>{if(other)other.closest(".sk-field").style.display=itemSel&&itemSel.value&&itemSel.value!=="__other"?"none":""};
    if(itemSel){itemSel.onchange=syncOther;syncOther();}
    const add=$("sk31-add");
    if(add)add.onclick=()=>{
      const err=$("sk31-err");err.textContent="";
      const raws=catalogRaws(), id=itemSel.value, cat=raws.find(r=>r.id===id);
      const itemName=cat?cat.name:other.value.trim();
      const b={id:"sb"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),date:$("sk31-date").value,supplier:$("sk31-sup").value.trim(),
        itemId:cat?cat.id:"",itemName,qty:num($("sk31-qty").value),unit:$("sk31-unit").value||"كجم",priceGross:num($("sk31-price").value),vatIncl:$("sk31-vat").value==="1",
        agreedWaste:num($("sk31-agreed").value||8),actualWaste:num($("sk31-actual").value),quality:num($("sk31-q").value),note:$("sk31-note").value.trim(),createdAt:new Date().toISOString()};
      if(!b.date||!b.supplier||!b.itemName){err.textContent="أدخل التاريخ والمورد والصنف.";return}
      if(b.qty<=0||b.priceGross<=0){err.textContent="الكمية والسعر يجب أن يكونا أكبر من صفر.";return}
      if(b.actualWaste<0||b.actualWaste>=100||b.agreedWaste<0||b.agreedWaste>=100){err.textContent="نسب الهدر بين 0 و100.";return}
      const list=load(STORE.batches,[]);list.push(b);
      if(!save(STORE.batches,list)){err.textContent="تعذر الحفظ في ذاكرة الجهاز.";return}
      toast("تم حفظ الشحنة");render("suppliers");
    };
    document.querySelectorAll(".sk31-del").forEach(btn=>btn.onclick=()=>{
      if(!confirm("حذف هذه الشحنة؟"))return;
      save(STORE.batches,load(STORE.batches,[]).filter(b=>b.id!==btn.dataset.id));render("suppliers");
    });
    document.querySelectorAll(".sk31-po").forEach(btn=>btn.onclick=()=>poComposer(btn.dataset.sup,btn.dataset.item,btn.dataset.unit||"كجم"));
    const poBtn=$("sk31-po-new"); if(poBtn)poBtn.onclick=()=>poComposer("","","كجم");
    const csv=$("sk31-csv");
    if(csv)csv.onclick=()=>{
      const rows=load(STORE.batches,[]).map(batchCalc);
      const cell=v=>{const s=String(v??"");return '"'+(/^[=+\-@]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"'};
      const head=["التاريخ","المورد","الصنف","الكمية","الوحدة","سعر الوحدة","شامل الضريبة","صافي الشحنة","هدر متفق ٪","هدر فعلي ٪","الكمية الصافية","تكلفة الوحدة الصافية","الجودة","ملاحظات"];
      const body=rows.map(r=>[r.date,r.supplier,r.itemName,r.qty,r.unit||"كجم",r.priceGross,r.vatIncl?"نعم":"لا",r.totalNet.toFixed(2),r.agreedWaste,r.actualWaste,r.usable.toFixed(2),r.effCost.toFixed(2),r.quality,r.note].map(cell).join(","));
      const blob=new Blob(["﻿"+[head.map(cell).join(","),...body].join("\n")],{type:"text/csv;charset=utf-8"});
      const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="skosif-supplier-batches.csv";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    };
  }

  /* منشئ أمر الشراء: مورد + عدة أصناف + موعد التسليم → معاينة → واتساب أو نسخ */
  function poComposer(sup,item,unit){
    document.getElementById("sk31-po-sheet")?.remove();
    const sups=knownSuppliers(load(STORE.batches,[])), raws=catalogRaws();
    const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
    document.body.insertAdjacentHTML("beforeend",
      '<div id="sk31-po-sheet" class="sk31-sheet-wrap" role="dialog" aria-modal="true" aria-label="أمر شراء"><div class="sk31-sheet">'+
      '<div class="sk31-sheet-head"><b>أمر شراء للمورد</b><button type="button" class="sk31-x" aria-label="إغلاق">×</button></div>'+
      '<label class="sk-field"><span>المورد</span><input id="sk31-po-sup" list="sk31-po-sups" value="'+esc(sup)+'" placeholder="اسم المورد"><datalist id="sk31-po-sups">'+sups.map(x=>'<option value="'+esc(x)+'">').join("")+'</datalist></label>'+
      '<label class="sk-field"><span>الأصناف والكميات (سطر لكل صنف)</span><textarea id="sk31-po-items" rows="4" placeholder="حبشي: 100 كجم">'+(item?esc(item)+': ':'')+'</textarea></label>'+
      '<div class="sk31-chips">'+raws.slice(0,12).map(r=>'<button type="button" class="sk31-chip" data-po-add="'+esc(r.name)+'">+ '+esc(r.name)+'</button>').join("")+'</div>'+
      '<div class="sk-grid2">'+field("sk31-po-date","موعد التسليم","date","",'value="'+tomorrow+'"')+field("sk31-po-note","ملاحظة","text","مثال: ذبح صباحي، تبريد")+'</div>'+
      '<label class="sk-field"><span>معاينة الرسالة</span><textarea id="sk31-po-preview" rows="7" readonly></textarea></label>'+
      '<div class="sk-actions"><button id="sk31-po-wa" class="sk-primary" type="button">إرسال واتساب</button><button id="sk31-po-copy" class="sk-secondary" type="button">نسخ</button></div>'+
      '</div></div>');
    const w=$("sk31-po-sheet"), items=$("sk31-po-items");
    const text=()=>{
      const lines=items.value.split("\n").map(x=>x.trim()).filter(Boolean);
      const d=$("sk31-po-date").value, note=$("sk31-po-note").value.trim();
      return ["السلام عليكم "+($("sk31-po-sup").value.trim()||"")+"،","نرغب بتوريد:",...lines.map(l=>"• "+l),
        d?"موعد التسليم: "+new Date(d+"T12:00").toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{weekday:"long",day:"numeric",month:"long"}):"",
        note?"ملاحظة: "+note:"","نسبة الهدر حسب المتفق عليه.","مع الشكر — "+"أغنام الوادي"].filter(Boolean).join("\n");
    };
    const upd=()=>{$("sk31-po-preview").value=text()};
    w.querySelectorAll("input,textarea").forEach(el=>el.addEventListener("input",upd));
    w.querySelectorAll("[data-po-add]").forEach(b=>b.onclick=()=>{items.value=(items.value.trim()?items.value.trim()+"\n":"")+b.dataset.poAdd+": ";items.focus();upd()});
    w.querySelector(".sk31-x").onclick=()=>w.remove();
    w.onclick=e=>{if(e.target===w)w.remove()};
    $("sk31-po-copy").onclick=()=>copy(text());
    $("sk31-po-wa").onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent(text()),"_blank","noopener");
    upd(); items.focus(); items.setSelectionRange(items.value.length,items.value.length);
  }

  /* ---------- تبويب السيولة ---------- */
  function readSalesLines(){
    return new Promise(resolve=>{
      if(!("indexedDB" in window)){resolve(null);return}
      let req;
      try{req=indexedDB.open(DB_NAME)}catch{resolve(null);return}
      /* لا ننشئ قاعدة جديدة إن لم تكن موجودة */
      req.onupgradeneeded=e=>{try{e.target.transaction.abort()}catch{}};
      req.onerror=()=>resolve(null);
      req.onsuccess=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains("sales_lines")){db.close();resolve([]);return}
        const g=db.transaction("sales_lines","readonly").objectStore("sales_lines").getAll();
        g.onsuccess=()=>{db.close();resolve(g.result||[])};
        g.onerror=()=>{db.close();resolve(null)};
      };
    });
  }
  const monthOf=d=>{const s=String(d||"");if(/^\d{4}-\d{2}/.test(s))return s.slice(0,7);const t=new Date(s);return isNaN(t)?"":t.toISOString().slice(0,7)};
  function monthsBack(n){
    const out=[],d=new Date();d.setDate(1);
    for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0"))}
    return out;
  }
  let cashRange=6;
  /* المواسم بالتقويم الهجري (أم القرى): رمضان، وموسم الأضحى (من 25 ذو القعدة إلى 13 ذو الحجة) */
  const hijri=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura",{month:"numeric",day:"numeric"});
  function seasonShare(ym){
    const [y,mo]=ym.split("-").map(Number), days=new Date(y,mo,0).getDate();
    let r=0,a=0;
    for(let d=1;d<=days;d++){
      const p=Object.fromEntries(hijri.formatToParts(new Date(y,mo-1,d,12)).map(x=>[x.type,x.value]));
      const hm=+p.month, hd=+p.day;
      if(hm===9)r++; else if((hm===11&&hd>=25)||(hm===12&&hd<=13))a++;
    }
    return {r:r/days,a:a/days};
  }
  function monthsAhead(n){
    const out=[],d=new Date();d.setDate(1);
    for(let i=1;i<=n;i++){const x=new Date(d.getFullYear(),d.getMonth()+i,1);out.push(x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0"))}
    return out;
  }
  async function cashHTML(){
    const lines=await readSalesLines();
    const batches=load(STORE.batches,[]).map(batchCalc);
    const opex=num(load(STORE.opex,0));
    let months=monthsBack(cashRange);
    /* إن كانت المبيعات المستوردة أقدم من الأشهر الأخيرة نعرض آخر أشهر فيها بيانات */
    const inByM={},purByM={};
    (lines||[]).forEach(l=>{const m=monthOf(l.date);if(m)inByM[m]=(inByM[m]||0)+(num(l.amountHalalas)?num(l.amountHalalas)/100:num(l.amount))});
    batches.forEach(b=>{const m=monthOf(b.date);if(m)purByM[m]=(purByM[m]||0)+b.totalGross});
    const dataMonths=[...new Set([...Object.keys(inByM),...Object.keys(purByM)])].sort();
    if(dataMonths.length&&!months.some(m=>inByM[m]||purByM[m])) months=dataMonths.slice(-cashRange);
    const rows=months.map(m=>{const inn=inByM[m]||0,pur=purByM[m]||0,out=pur+opex;return {m,inn,pur,opex,out,net:inn-out,cover:out>0?inn/out:null}});
    const tIn=rows.reduce((a,r)=>a+r.inn,0),tOut=rows.reduce((a,r)=>a+r.out,0),max=Math.max(1,...rows.map(r=>Math.max(r.inn,r.out)));
    const label=m=>{const [y,mo]=m.split("-");return new Date(+y,+mo-1,1).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{month:"short",year:"numeric"})};
    /* التوقع: متوسط آخر 3 أشهر فيها بيانات، مضروباً في معامل الموسم */
    const season=load(STORE.season,{r:1.3,a:1.8});
    const hist=dataMonths.slice(-3), baseIn=hist.length?hist.reduce((a,m)=>a+(inByM[m]||0),0)/hist.length:0, basePur=hist.length?hist.reduce((a,m)=>a+(purByM[m]||0),0)/hist.length:0;
    const fc=monthsAhead(cashRange).map(m=>{const sh=seasonShare(m),f=1+sh.r*(num(season.r)-1)+sh.a*(num(season.a)-1);
      const inn=baseIn*f,pur=basePur*f,out=pur+opex;return {m,f,sh,inn,out,net:inn-out,cover:out>0?inn/out:null}});
    const tag=r=>r.sh.a>0.05?'<span class="sk31-risk sk31-high">موسم الأضحى</span>':r.sh.r>0.05?'<span class="sk31-risk sk31-moderate">رمضان</span>':'';
    return [
      '<div class="sk31-title"><h3>مؤشر السيولة الشهري</h3><p>الداخل: المبيعات المستوردة في مركز البيانات. الخارج: مشتريات الشحنات المسجلة في «الموردون» + المصروفات التشغيلية الشهرية.</p></div>',
      lines===null?'<p class="sk-warning">تعذر قراءة المبيعات المستوردة على هذا الجهاز.</p>':(!lines.length?'<p class="sk-warning">لا توجد مبيعات مستوردة بعد — استورد ملف المبيعات من مركز البيانات ليظهر الداخل.</p>':''),
      '<div class="sk-grid2">',
        '<label class="sk-field"><span>الفترة</span><select id="sk31-range">'+[3,6,12].map(n=>'<option value="'+n+'"'+(n===cashRange?' selected':'')+'>آخر '+n+' أشهر</option>').join("")+'</select></label>',
        field("sk31-opex","المصروفات التشغيلية الشهرية (رواتب، إيجار…)","number","0",'step="0.01" min="0" value="'+(opex||"")+'"'),
      '</div>',
      '<div class="sk-kpis">',
        kpi("الداخل",money(tIn)),kpi("الخارج",money(tOut)),
        kpi("الصافي",money(tIn-tOut),tIn-tOut<0?"warn":"good"),
        kpi("التغطية",tOut>0?(tIn/tOut).toFixed(2)+"×":"—",tOut>0&&tIn<tOut?"warn":"good"),
      '</div>',
      '<div class="sk31-chart" role="img" aria-label="الداخل مقابل الخارج شهرياً">',
        rows.map(r=>'<div class="sk31-col"><div class="sk31-bars"><i class="sk31-in" style="height:'+(r.inn/max*100).toFixed(1)+'%" title="الداخل '+money(r.inn)+'"></i><i class="sk31-out" style="height:'+(r.out/max*100).toFixed(1)+'%" title="الخارج '+money(r.out)+'"></i></div><small>'+label(r.m)+'</small></div>').join(""),
      '</div>',
      '<div class="sk31-legend"><span><i class="sk31-in"></i>الداخل</span><span><i class="sk31-out"></i>الخارج</span></div>',
      '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الشهر</th><th>الداخل</th><th>مشتريات</th><th>تشغيلية</th><th>الصافي</th><th>التغطية</th></tr></thead><tbody>',
      rows.map(r=>'<tr><td>'+label(r.m)+'</td><td>'+money(r.inn)+'</td><td>'+money(r.pur)+'</td><td>'+money(r.opex)+'</td><td class="'+(r.net<0?'sk31-bad':'')+'">'+money(r.net)+'</td><td>'+(r.cover==null?'—':r.cover.toFixed(2)+'×')+'</td></tr>').join(""),
      '</tbody></table></div>',
      '<h4 class="sk31-h">توقع الأشهر القادمة</h4>',
      hist.length?'<p class="sk31-sub">الأساس: متوسط آخر '+hist.length+' أشهر فيها بيانات (داخل '+money(baseIn)+'، مشتريات '+money(basePur)+')، مضروباً في معامل الموسم حسب أيام رمضان وموسم الأضحى في كل شهر.</p>':'<p class="sk-warning">لا توجد بيانات سابقة كافية للتوقع.</p>',
      '<div class="sk-grid2">',
        field("sk31-sr","معامل رمضان","number","1.3",'step="0.05" min="0" value="'+num(season.r)+'"'),
        field("sk31-sa","معامل موسم الأضحى","number","1.8",'step="0.05" min="0" value="'+num(season.a)+'"'),
      '</div>',
      '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الشهر</th><th>المعامل</th><th>داخل متوقع</th><th>خارج متوقع</th><th>الصافي</th><th>التغطية</th></tr></thead><tbody>',
      fc.map(r=>'<tr><td>'+label(r.m)+' '+tag(r)+'</td><td>'+r.f.toFixed(2)+'×</td><td>'+money(r.inn)+'</td><td>'+money(r.out)+'</td><td class="'+(r.net<0?'sk31-bad':'')+'">'+money(r.net)+'</td><td>'+(r.cover==null?'—':r.cover.toFixed(2)+'×')+'</td></tr>').join(""),
      '</tbody></table></div>',
      (fc.some(r=>r.net<0)?'<p class="sk-warning">شهر أو أكثر متوقع فيه عجز — جهّز سيولة أو رتّب شروط دفع آجلة مع الموردين قبل الموسم.</p>':'')
    ].join("");
  }
  function bindCash(){
    const r=$("sk31-range");if(r)r.onchange=()=>{cashRange=num(r.value)||6;render("cash")};
    const o=$("sk31-opex");if(o)o.onchange=()=>{save(STORE.opex,Math.max(0,num(o.value)));render("cash")};
    const sr=$("sk31-sr"),sa=$("sk31-sa");
    const ss=()=>{save(STORE.season,{r:Math.max(0,num(sr.value)||1),a:Math.max(0,num(sa.value)||1)});render("cash")};
    if(sr)sr.onchange=ss; if(sa)sa.onchange=ss;
  }

  /* ---------- شاشتان في القائمة ---------- */
  const roots={};
  async function render(tab){
    const body=roots[tab];if(!body||!body.isConnected)return;
    if(tab==="suppliers"){body.innerHTML=suppliersHTML();bindSuppliers();}
    if(tab==="cash"){body.innerHTML='<div class="sk-empty">جارٍ حساب التدفق النقدي…</div>';const html=await cashHTML();if(body.isConnected){body.innerHTML=html;bindCash();}}
  }
  window.SK.view("suppliers",{title:"الموردون والمشتريات",sub:"شحنات الموردين والهدر الفعلي وتقييم الموردين وأوامر الشراء",emoji:"🚚",
    render(node){roots.suppliers=node;render("suppliers")}});
  window.SK.view("cash",{title:"التدفق النقدي",sub:"المبيعات مقابل المشتريات والمصروفات شهرياً، مع توقع موسمي",emoji:"💵",
    render(node){roots.cash=node;render("cash")}});
  window.SKosifSupply=Object.freeze({calc:{batchCalc,supplierStats,itemComparison}});
})();

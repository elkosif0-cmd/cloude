/* S.kosif V35 — Pricing Core UI adapter */
(()=>{
  "use strict";
  if(window.SKosifPricingV35)return;
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const num=v=>{const n=Number(String(v??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬,\s]/g,"").replace("٫","."));return Number.isFinite(n)?n:0};
  const money=v=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
  const pct=v=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:2}).format((Number(v)||0)*100)+"٪";
  let state={cost:100,sell:138,vat:15,target:25,margin:"net",rounding:"ending_dot_90"};
  function core(){return window.SKosifPricingCore}
  function catalog(){try{return window.SKosifCore?.catalog?.()||{items:[]}}catch{return {items:[]}}}
  function settings(){return {defaultVatRate:state.vat/100,wasteMethod:"yield",marginMode:state.margin,roundingPolicy:state.rounding,marginThresholds:{excellent:.25,good:.15}}}
  function calc(){return core().evaluatePrice(state.cost,state.sell,state.target/100,settings())}
  function html(){
    const c=core(),t=c?.selfTest?.()||{ok:false,checks:[]},out=c?calc():null,items=(catalog().items||[]).filter(x=>x.status!=="archived"&&x.cost!=null&&x.price>0);
    return [
      '<section class="sk35-hero"><div><span>CORE PRICING ENGINE</span><h3>S.kosif Pricing Kernel V35</h3><p>محرك نقي واحد للحسابات: VAT، الهدر، الهوامش، التقريب، البوكسات المتداخلة، المصروفات، NRV والتصافي.</p></div><div class="sk35-badge '+(t.ok?'ok':'bad')+'">'+(t.ok?'✓ Self-test OK':'! Check failed')+'</div></section>',
      '<div class="sk35-contracts"><div><b>6</b><span>سياسات تقريب</span></div><div><b>4</b><span>طرق مصروفات</span></div><div><b>2</b><span>طرق هدر</span></div><div><b>100%</b><span>Cycle-safe nested boxes</span></div></div>',
      '<div class="sk-section-title"><b>مختبر السعر</b><span>الحساب من Kernel V35 مباشرة</span></div>',
      '<div class="sk-grid2">'+
        field("sk35-cost","التكلفة الصافية",state.cost)+field("sk35-sell","سعر البيع شامل الضريبة",state.sell)+field("sk35-vat","VAT %",state.vat)+field("sk35-target","الهامش المستهدف %",state.target)+
        '<label class="sk-field"><span>أساس الهامش</span><select id="sk35-margin"><option value="net"'+(state.margin==="net"?" selected":"")+'>صافي البيع</option><option value="gross_excel"'+(state.margin==="gross_excel"?" selected":"")+'>Gross / Excel</option></select></label>'+
        '<label class="sk-field"><span>التقريب</span><select id="sk35-round">'+[
          ["none","بدون"],["two_decimals","منزلتان"],["whole_riyal_up","لأعلى ريال"],["half_riyal_up","لأعلى نصف ريال"],["ending_dot_90","ينتهي .90"],["ending_9","ينتهي 9"]
        ].map(x=>'<option value="'+x[0]+'"'+(state.rounding===x[0]?' selected':'')+'>'+x[1]+'</option>').join("")+'</select></label>'+
      '</div><button id="sk35-run" class="sk-primary" type="button">إعادة الحساب</button>',
      out?'<div class="sk-kpis sk35-kpis">'+k("صافي البيع",money(out.sellingPriceNet))+k("صافي الربح",money(out.profitNet),out.profitNet<0?"bad":"good")+k("الهامش",pct(out.marginPercent),out.marginGrade==="weak"?"warn":"good")+k("التعادل شامل الضريبة",money(out.breakEvenPriceGross))+k("السعر المستهدف",money(out.targetPriceGross),"accent")+k("المستهدف صافي",money(out.targetPriceNet))+'</div>':"",
      '<div class="sk35-rule">قاعدة أمان: <b>التقريب لا يسمح أبدًا أن ينزل السعر المقترح عن تكلفة التعادل.</b></div>',
      items.length?'<div class="sk-section-title"><b>اختبار صنف من الكتالوج الحالي</b><span>قراءة فقط — لا يغيّر السعر</span></div><div class="sk35-catalog"><select id="sk35-item"><option value="">اختر صنفًا…</option>'+items.slice(0,250).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join("")+'</select><button id="sk35-load" class="sk-secondary" type="button">تحميل التكلفة والسعر</button></div>':"",
      '<details class="sk35-tests"><summary>اختبارات Kernel الداخلية ('+t.checks.length+')</summary>'+t.checks.map(x=>'<p><i class="'+(x.ok?'ok':'bad')+'">'+(x.ok?'✓':'×')+'</i><span>'+esc(x.name)+'</span></p>').join("")+'</details>',
      '<div class="sk35-features"><article><b>Nested Boxes</b><span>حساب متكرر للبوكسات مع اكتشاف الحلقات الدائرية قبل أن تفسد التكلفة.</span></article><article><b>Linked Expenses</b><span>ثابت، لكل كجم، لكل صحن، أو نسبة من تكلفة المكونات.</span></article><article><b>NRV + Yield</b><span>توزيع التكلفة المشتركة وتجارب التصافي كدوال مستقلة قابلة للاختبار.</span></article><article><b>Integer Halalas</b><span>حدود مالية قابلة للتحويل للهللات لتقليل أخطاء الفاصلة العائمة.</span></article></div>',
      '<div class="sk-actions"><button id="sk35-jev" class="sk-jev" type="button">اسأل Jev بعد الحساب</button></div>'
    ].join("");
  }
  function field(id,label,value){return '<label class="sk-field"><span>'+label+'</span><input id="'+id+'" type="number" step="0.01" value="'+value+'"></label>'}
  function k(a,b,c=""){return '<div class="sk-kpi '+c+'"><span>'+a+'</span><b>'+b+'</b></div>'}
  function bind(){
    $("#sk35-run")?.addEventListener("click",()=>{state={cost:num($("#sk35-cost").value),sell:num($("#sk35-sell").value),vat:num($("#sk35-vat").value),target:num($("#sk35-target").value),margin:$("#sk35-margin").value,rounding:$("#sk35-round").value};render()});
    $("#sk35-load")?.addEventListener("click",()=>{const id=$("#sk35-item")?.value,it=(catalog().items||[]).find(x=>String(x.id)===String(id));if(!it)return;state.cost=num(it.cost);state.sell=num(it.price);render()});
    $("#sk35-jev")?.addEventListener("click",()=>{const o=calc();window.AskJev?.open?.("choice");setTimeout(()=>{const q=$("#jev-ask-q"),op=$("#jev-ask-options"),screen=$("#jev-ask-screen");if(q)q.value="محرك S.kosif V35 حسب: التكلفة الصافية "+o.costNet.toFixed(2)+"، السعر الحالي شامل الضريبة "+o.sellingPriceGross.toFixed(2)+"، الهامش "+(o.marginPercent*100).toFixed(2)+"٪، سعر التعادل "+o.breakEvenPriceGross.toFixed(2)+"، والسعر المستهدف بعد التقريب "+o.targetPriceGross.toFixed(2)+". ما الإجراء الأنسب؟";if(op)op.value="اعتماد السعر المستهدف\nتثبيت السعر الحالي\nرفع تدريجي\nمراجعة التكلفة أولًا";if(screen)screen.checked=false},120)});
  }
  function render(){const body=$("#sk-body");if(!body||!core())return;body.innerHTML=html();bind();document.querySelector(".sk-panel")?.scrollTo?.({top:0,behavior:"smooth"})}
  function open(){
    window.SKosif?.open?.("overview");attach();
    $$(".sk-tabs button").forEach(b=>b.classList.remove("active"));$("#sk35-tab")?.classList.add("active");render();
  }
  function attach(){
    const tabs=$(".sk-tabs");if(!tabs||$("#sk35-tab"))return !!tabs;
    const b=document.createElement("button");b.id="sk35-tab";b.type="button";b.dataset.sk35Tab="pricing-core";b.textContent="محرك V35";b.onclick=open;
    const group=tabs.querySelector('.sk33-group[data-g="التسعير والقرار"]');(group||tabs).appendChild(b);return true;
  }
  document.addEventListener("click",e=>{if(!e.target.closest(".sk33-menu"))return;setTimeout(()=>{const w=$("#sk33-launch");if(!w||w.querySelector("[data-sk35-go]"))return;const sec=[...w.querySelectorAll("section")].find(x=>/التسعير والقرار/.test(x.querySelector("h5")?.textContent||""));const grid=sec?.querySelector("div");if(!grid)return;grid.insertAdjacentHTML("beforeend",'<button type="button" data-sk35-go><i>ƒ</i><b>محرك V35</b><small>Strict Pricing Kernel</small></button>');$("[data-sk35-go]",w).onclick=()=>{w.remove();open()}},30)},true);
  function init(){let n=0;const t=setInterval(()=>{if(attach()||++n>40)clearInterval(t)},250);window.SKosifPricingV35=Object.freeze({version:"35.0",open,calculate:()=>calc()})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
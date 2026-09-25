/* S.kosif — أدوات متقدمة: مختبر الحساسية ومطابقة الإكسل.
   كلاهما يقرأ أرقام محرك التسعير عبر SKosifCore ولا يعدّل شيئاً. */
(()=>{
"use strict";
const {esc,num,load,save,money}=window.SK;
const $=id=>document.getElementById(id);
const pct=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1}).format((Number(v)||0)*100)+"٪";
const kpi=(a,b,c="")=>'<div class="sk-kpi '+c+'"><span>'+a+'</span><b>'+b+'</b></div>';
const field=(id,label,type,ph,extra="")=>'<label class="sk-field"><span>'+label+'</span><input id="'+id+'" type="'+type+'" placeholder="'+esc(ph)+'" '+extra+'></label>';
function catalog(){try{return window.SKosifCore.catalog()}catch{return {vat:.15,netBase:true,yieldMethod:true,items:[]}}}
const DECISION_KEY="skosif_v33_decision";
const roots={};

function decisionDefaults(){
  const d=catalog(), boxes=d.items.filter(x=>x.kind==="box"&&x.status!=="archived"&&x.price>0&&x.cost!=null);
  const src=boxes.length?boxes:d.items.filter(x=>x.status!=="archived"&&!x.byProduct&&x.price>0&&x.cost!=null);
  const avg=f=>src.length?src.reduce((a,x)=>a+f(x),0)/src.length:0;
  return {vol:150,price:Math.round(avg(x=>x.price)*100)/100,cost:Math.round(avg(x=>x.cost)*100)/100,fixed:12000,dc:0,dp:0,dv:1,vat:d.vat,src:boxes.length?"متوسط البوكسات النشطة":"متوسط الأصناف"};
}
function decisionHTML(){
  const def=decisionDefaults(), st={...def,...load(DECISION_KEY,{})}, v=def.vat;
  const pn=p=>p/(1+v);
  const calc=(price,cost,vol)=>{const c=pn(price)-cost;return {contrib:c,profit:vol*c-st.fixed,be:c>0?st.fixed/c:null,margin:pn(price)>0?c/pn(price):null}};
  const base=calc(st.price,st.cost,st.vol);
  const sp=st.price*(1+st.dp/100), sc=st.cost*(1+st.dc/100), sv=st.vol*st.dv, shock=calc(sp,sc,sv);
  const DP=[-10,-5,0,5,10,15], DC=[-10,-5,0,5,10,15,20];
  const cells=DC.map(c=>DP.map(p=>calc(st.price*(1+p/100),st.cost*(1+c/100),st.vol).profit));
  const mx=Math.max(1,...cells.flat().map(Math.abs));
  const color=x=>x>=0?'rgba(18,183,106,'+(0.12+0.55*x/mx).toFixed(2)+')':'rgba(240,68,56,'+(0.12+0.55*-x/mx).toFixed(2)+')';
  const presets=[["غلاء الأعلاف",15,0,1],["نقص المعروض",25,0,1],["موسم الأضحى",10,5,1.8],["ركود السوق",0,-5,0.8],["إعادة ضبط",0,0,1]];
  return [
    '<p class="sk-note">الأساس من '+esc(def.src)+' في الكتالوج (سعر البيع شامل الضريبة، التكلفة صافية). عدّل الأرقام لتناسب شهرك.</p>',
    '<div class="sk-grid2">',
      field("sk33-vol","حجم المبيعات الشهري (وحدة)","number","150",'min="0" step="1" value="'+st.vol+'"'),
      field("sk33-price","متوسط سعر البيع (شامل الضريبة)","number","0",'min="0" step="0.01" value="'+st.price+'"'),
      field("sk33-cost","متوسط تكلفة الوحدة (صافي)","number","0",'min="0" step="0.01" value="'+st.cost+'"'),
      field("sk33-fixed","المصاريف الثابتة الشهرية","number","0",'min="0" step="1" value="'+st.fixed+'"'),
    '</div>',
    '<div class="sk-kpis">',
      kpi("ربح الوحدة (صافي)",money(base.contrib),base.contrib>0?"good":"warn"),
      kpi("الربح الشهري",money(base.profit),base.profit>=0?"good":"warn"),
      kpi("نقطة التعادل",base.be==null?"غير ممكنة":new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0}).format(Math.ceil(base.be))+" وحدة/شهر",base.be!=null&&base.be<=st.vol?"good":"warn"),
      kpi("الهامش",base.margin==null?"—":pct(base.margin)),
    '</div>',
    '<h4 class="sk-h4">صدمة على السيناريو</h4>',
    '<div class="sk-chips">'+presets.map(p=>'<button type="button" class="chip" data-preset="'+p.slice(1).join(",")+'">'+p[0]+'</button>').join("")+'</div>',
    '<div class="sk-grid2">',
      field("sk33-dc","تغيّر تكلفة الشراء ٪","number","0",'step="1" value="'+st.dc+'"'),
      field("sk33-dp","تغيّر سعر البيع ٪","number","0",'step="1" value="'+st.dp+'"'),
      field("sk33-dv","مضاعف حجم المبيعات","number","1",'step="0.05" min="0" value="'+st.dv+'"'),
    '</div>',
    '<div class="sk-kpis">',
      kpi("الربح تحت الصدمة",money(shock.profit),shock.profit>=0?"good":"warn"),
      kpi("الفرق عن الأساس",(shock.profit-base.profit>=0?"+":"")+money(shock.profit-base.profit),shock.profit>=base.profit?"good":"warn"),
      kpi("التعادل تحت الصدمة",shock.be==null?"غير ممكن":new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0}).format(Math.ceil(shock.be))+" وحدة"),
      kpi("الهامش تحت الصدمة",shock.margin==null?"—":pct(shock.margin)),
    '</div>',
    '<h4 class="sk-h4">مصفوفة الحساسية: الربح الشهري حسب تغيّر السعر والتكلفة</h4>',
    '<div class="sk-table-wrap"><table class="sk-table sk-matrix"><thead><tr><th>التكلفة ↓ / السعر ←</th>'+DP.map(p=>'<th>'+(p>0?"+":"")+p+'٪</th>').join("")+'</tr></thead><tbody>',
    DC.map((c,i)=>'<tr><th>'+(c>0?"+":"")+c+'٪</th>'+cells[i].map((x,j)=>'<td style="background:'+color(x)+'"'+(c===0&&DP[j]===0?' class="sk-base"':'')+'>'+new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0}).format(x)+'</td>').join("")+'</tr>').join(""),
    '</tbody></table></div>',
    '<p class="sk-note">الخلية المحددة هي وضعك الحالي. الأخضر ربح والأحمر خسارة؛ اقرأ السطر لترى كم تحتاج رفع السعر لتعويض ارتفاع التكلفة.</p>'
  ].join("");
}
function bindDecision(){
  const ids={vol:"sk33-vol",price:"sk33-price",cost:"sk33-cost",fixed:"sk33-fixed",dc:"sk33-dc",dp:"sk33-dp",dv:"sk33-dv"};
  const upd=()=>{const o={};for(const [k,id] of Object.entries(ids))o[k]=num($(id).value);if(o.dv<=0)o.dv=1;save(DECISION_KEY,o);paint("sensitivity")};
  Object.values(ids).forEach(id=>{const el=$(id);if(el)el.onchange=upd});
  roots.sensitivity.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>{const [dc,dp,dv]=b.dataset.preset.split(",").map(Number);$("sk33-dc").value=dc;$("sk33-dp").value=dp;$("sk33-dv").value=dv;upd()});
}

/* ---------- مطابقة الإكسل ---------- */
const norm=s=>String(s||"").replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\s+/g," ").trim().toLowerCase();
let excelText="", excelVat="net";
function matchItem(name,items){
  const n=norm(name); if(!n)return null;
  let hit=items.find(x=>norm(x.name)===n); if(hit)return hit;
  const c=items.filter(x=>{const m=norm(x.name);return m&&(m.includes(n)||n.includes(m))}).sort((a,b)=>norm(b.name).length-norm(a.name).length);
  return c[0]||null;
}
function excelHTML(){
  const d=catalog(), items=d.items.filter(x=>x.status!=="archived"), raws=(()=>{try{return window.SKosifCore.raws()}catch{return[]}})();
  const rows=excelText.split(/\r?\n/).map(l=>l.split(/\t|;|,(?=\s*[\d٠-٩.])/).map(x=>x.trim())).filter(c=>c.length>=2&&c[0]);
  const res=rows.map(c=>{
    const it=matchItem(c[0],items), xc=num(c[1]), xp=c[2]!=null?num(c[2]):null;
    if(!it||!(xc>0))return {name:c[0],it,xc,xp,err:!it?"لا يوجد صنف مطابق في الكتالوج":"تكلفة غير صالحة"};
    const xcNet=excelVat==="gross"?xc/(1+d.vat):xc;
    const price=xp>0?xp:it.price, pNet=price/(1+d.vat), base=d.netBase?pNet:price;
    const gap=it.cost-xcNet, gapPct=xcNet>0?gap/xcNet:0;
    let diag="مطابق";
    if(Math.abs(gapPct)>0.003){
      diag=gap>0?"إكسل يُظهر تكلفة أقل من الحقيقية":"إكسل يُظهر تكلفة أعلى من الحقيقية";
      const r=it.kind==="raw"?raws.find(x=>String(x.id)===it.id):null, w=r?num(r.waste)/100:0;
      if(w>0){
        /* نسبة التكلفتين بين طريقتي الهدر: التشافي ÷ الإضافة = 1 / ((1−هدر)(1+هدر)) */
        const ratio=1/((1-w)*(1+w)), got=it.cost/xcNet;
        if(d.yieldMethod&&Math.abs(got-ratio)<0.004)diag="فرق طريقة الهدر: إكسل يضيف الهدر (×(1+هدر)) والتطبيق يقسم على (1−هدر) — إكسل يقلل التكلفة";
        if(!d.yieldMethod&&Math.abs(got*ratio-1)<0.004)diag="فرق طريقة الهدر: إكسل يقسم على (1−هدر) والتطبيق يضيف الهدر (×(1+هدر))";
      }
      if(excelVat==="net"&&Math.abs(xc/(it.cost*(1+d.vat))-1)<0.01)diag="يبدو أن تكلفة إكسل شاملة الضريبة — غيّر خيار «التكلفة في الملف»";
    }
    return {name:c[0],it,xc,xcNet,price,gap,gapPct,xm:base>0?(pNet-xcNet)/base:null,tm:base>0?(pNet-it.cost)/base:null,diag};
  });
  const ok=res.filter(r=>!r.err), under=ok.filter(r=>r.gapPct>0.003);
  return [
    '<p class="sk-note">الصق من ملف الإكسل أعمدة: <b>اسم الصنف، التكلفة، سعر البيع</b> (السعر اختياري). سطر لكل صنف، مفصولة بـ Tab أو فاصلة. التطبيق يحسب الهدر حالياً بطريقة <b>'+(d.yieldMethod?"التشافي (÷(1−هدر))":"الإضافة (×(1+هدر))")+'</b>.</p>',
    '<label class="sk-field"><span>بيانات الملف</span><textarea id="sk33-xl" rows="6" placeholder="حبشي	33.50	49">'+esc(excelText)+'</textarea></label>',
    '<div class="sk-grid2"><label class="sk-field"><span>التكلفة في الملف</span><select id="sk33-xlvat"><option value="net"'+(excelVat==="net"?" selected":"")+'>صافية (بدون ضريبة)</option><option value="gross"'+(excelVat==="gross"?" selected":"")+'>شاملة الضريبة</option></select></label>'+
    '<div class="sk-actions sk-end"><button type="button" id="sk33-xlrun" class="sk-primary">مطابقة</button><button type="button" id="sk33-xlsample" class="sk-secondary">نموذج تجريبي</button></div></div>',
    ok.length?'<div class="sk-kpis">'+kpi("أصناف مطابقة",ok.length+" / "+res.length)+kpi("تكلفة إكسل أقل من الحقيقية",under.length,under.length?"warn":"good")+kpi("أكبر فرق",ok.length?pct(Math.max(...ok.map(r=>r.gapPct))):"—")+kpi("غير مطابقة",res.length-ok.length,res.length-ok.length?"warn":"good")+'</div>':'',
    res.length?'<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف في الملف</th><th>في الكتالوج</th><th>تكلفة إكسل (صافي)</th><th>التكلفة الحقيقية</th><th>الفرق</th><th>هامش إكسل</th><th>الهامش الحقيقي</th><th>التشخيص</th></tr></thead><tbody>'+
      res.map(r=>r.err?'<tr><td>'+esc(r.name)+'</td><td colspan="7" class="sk-bad-text">'+esc(r.err)+'</td></tr>':
        '<tr><td>'+esc(r.name)+'</td><td>'+esc(r.it.name)+'</td><td>'+money(r.xcNet)+'</td><td>'+money(r.it.cost)+'</td><td class="'+(r.gapPct>0.003?'sk-bad-text':'')+'">'+(r.gap>=0?"+":"")+pct(r.gapPct)+'</td><td>'+(r.xm==null?'—':pct(r.xm))+'</td><td>'+(r.tm==null?'—':pct(r.tm))+'</td><td>'+esc(r.diag)+'</td></tr>').join("")+
      '</tbody></table></div>':''
  ].join("");
}
function bindExcel(){
  const run=()=>{excelText=$("sk33-xl").value;excelVat=$("sk33-xlvat").value;paint("excelrecon")};
  $("sk33-xlrun").onclick=run; $("sk33-xlvat").onchange=run;
  $("sk33-xlsample").onclick=()=>{
    const d=catalog(), raws=d.items.filter(x=>x.kind==="raw"&&!x.byProduct&&x.cost>0).slice(0,4);
    const rs=(()=>{try{return window.SKosifCore.raws()}catch{return[]}})();
    excelText=raws.map((x,i)=>{const r=rs.find(y=>String(y.id)===x.id), w=r?num(r.waste)/100:0;
      /* نموذج: أول صنفين بطريقة الهدر الأخرى، والباقي مطابق */
      const ratio=w>0?1/((1-w)*(1+w)):1, c=i<2?(d.yieldMethod?x.cost/ratio:x.cost*ratio):x.cost;return x.name+"\t"+c.toFixed(2)+"\t"+(x.price||0)}).join("\n");
    excelVat="net";paint("excelrecon");
  };
}

function paint(id){
  const r=roots[id];if(!r||!r.isConnected)return;
  if(id==="sensitivity"){r.innerHTML='<section class="card"><div class="card-b sk-stack">'+decisionHTML()+'</div></section>';bindDecision()}
  if(id==="excelrecon"){r.innerHTML='<section class="card"><div class="card-b sk-stack">'+excelHTML()+'</div></section>';bindExcel()}
}
window.SK.view("sensitivity",{title:"مختبر الحساسية",sub:"الربح الشهري ونقطة التعادل تحت صدمات السعر والتكلفة والحجم، مع مصفوفة حساسية",emoji:"",adv:true,
  render(node){roots.sensitivity=node;paint("sensitivity")}});
window.SK.view("excelrecon",{title:"مطابقة الإكسل",sub:"الصق تكاليف وأسعار ملف الإكسل لمقارنتها بالتكلفة الحقيقية وتشخيص سبب الفرق",emoji:"",adv:true,
  render(node){roots.excelrecon=node;paint("excelrecon")}});
})();

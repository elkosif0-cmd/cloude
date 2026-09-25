/* S.kosif ERP — Jev daily brief, local role profiles, and visual theme packs. */
(()=>{
"use strict";
const SK=window.SK,core=window.SKosifCore;
if(!SK||!core)return;
const {esc,num,load,save,toast}=SK;
const ROLE_KEY="skosif_role_profile_v1", PACK_KEY="skosif_visual_pack_v1";
const roles={
 owner:{name:"المالك / المدير",note:"كل الأقسام متاحة.",hide:[]},
 accountant:{name:"المحاسب",note:"يركز على التقارير، السيولة، الموردين والتكاليف.",hide:["culinary","blending","scanner"]},
 warehouse:{name:"المخزن",note:"المخزون، الموردون، التتبع والباركود.",hide:["reports","cash","receivables","jev","sensitivity","kernel","b2bcredit"]},
 sales:{name:"المبيعات",note:"الأصناف، العروض، العملاء والفواتير.",hide:["inventory","suppliers","cash","sensitivity","kernel","carcass","excelrecon"]}
};
const packs=[
 ["none","بدون نمط إضافي","الثيم الأساسي كما هو"],
 ["nature","وادي الطبيعة","خلفيات طبيعية خضراء وبطاقات هادئة"],
 ["farm","المزرعة المرِحة","ألوان دافئة وبطاقات مستديرة"],
 ["science","الموسوعة العلمية","شبكة تحريرية واضحة وتقارير بطابع علمي"],
 ["heritage2","تراث وأصالة","ورق دافئ وحدود كلاسيكية"],
 ["nightvalley","ليل الوادي","داكن كحلي بوهج هادئ"],
 ["pastel","الوادي الباستيل","ألوان ناعمة ومساحات مريحة"]
];
function applyPack(id){document.documentElement.setAttribute("data-sk-pack",id||"none");save(PACK_KEY,id||"none")}
function applyRole(){
  const cfg=load(ROLE_KEY,{enabled:false,role:"owner"}),r=roles[cfg.role]||roles.owner;
  document.querySelectorAll("#nav [data-v]").forEach(b=>{const hide=cfg.enabled&&r.hide.includes(b.dataset.v);b.hidden=hide;b.style.display=hide?"none":""});
}
function settings(root){
  if(root.querySelector("#sk-erp-admin"))return;
  const cfg=load(ROLE_KEY,{enabled:false,role:"owner"}),pack=load(PACK_KEY,"none");
  root.insertAdjacentHTML("beforeend",'<section class="card sk-erp-card" id="sk-erp-admin"><div class="card-h"><div><h3>الأدوار والتخصيص المتقدم</h3><p>ملفات عرض محلية لهذا الجهاز + ستة أنماط مرئية إضافية فوق الثيم الأساسي.</p></div></div><div class="card-b sk-stack">'+
    '<div class="sk-grid2"><label class="sk-field"><span>ملف الدور</span><select id="erp-role">'+Object.entries(roles).map(([k,v])=>'<option value="'+k+'"'+(cfg.role===k?" selected":"")+'>'+v.name+'</option>').join("")+'</select></label><label class="sk-check"><input id="erp-role-on" type="checkbox"'+(cfg.enabled?" checked":"")+'> تفعيل إخفاء الأقسام حسب الدور على هذا الجهاز</label></div><div class="sk-note">هذه صلاحيات واجهة محلية وليست بديلاً عن نظام مستخدمين مركزي وتسجيل دخول متعدد الحسابات.</div>'+
    '<div class="sk-erp-pack-grid">'+packs.map(x=>'<button type="button" data-pack="'+x[0]+'" class="'+(pack===x[0]?"on":"")+'"><b>'+x[1]+'</b><span>'+x[2]+'</span></button>').join("")+'</div>'+
  '</div></section>');
  const saveRole=()=>{const v={enabled:root.querySelector("#erp-role-on").checked,role:root.querySelector("#erp-role").value};save(ROLE_KEY,v);applyRole();toast("تم حفظ ملف الدور","ok")};
  root.querySelector("#erp-role").onchange=saveRole;root.querySelector("#erp-role-on").onchange=saveRole;
  root.querySelectorAll("[data-pack]").forEach(b=>b.onclick=()=>{applyPack(b.dataset.pack);root.querySelectorAll("[data-pack]").forEach(x=>x.classList.toggle("on",x===b));toast("تم تطبيق "+b.querySelector("b").textContent,"ok")});
}
function jev(root){
  if(root.querySelector("#sk-erp-jev-today"))return;
  const inv=load("aghnam_v29_inventory",[]),urgent=Array.isArray(inv)?inv.filter(x=>String(x.status||"").includes("عاجلة")).length:0;
  const stm=load("skosif_income_statements_v2",[]),last=stm[0]||null;
  const batches=load("skosif_v31_supplier_batches",[]),over=Array.isArray(batches)?batches.filter(x=>num(x.actualWaste)>num(x.agreedWaste)+2).length:0;
  root.insertAdjacentHTML("afterbegin",'<section class="card sk-erp-card" id="sk-erp-jev-today"><div class="card-h"><div><h3>Jev اليوم</h3><p>ملخص تشغيلي سريع من المخزون، قائمة الدخل والموردين قبل فتح سؤال تفصيلي.</p></div><button type="button" class="btn primary sm" id="erp-jev-brief">حلّل ملخص اليوم</button></div><div class="card-b">'+
    '<div class="sk-kpis"><div class="sk-kpi '+(urgent?"bad":"good")+'"><span>أصناف إعادة طلب عاجلة</span><b>'+urgent+'</b></div><div class="sk-kpi '+(last&&num(last.netProfit)<0?"bad":"good")+'"><span>آخر صافي ربح محفوظ</span><b>'+(last?SK.money(last.netProfit):"—")+'</b><small>'+(last?esc(last.month):"لا توجد قائمة محفوظة")+'</small></div><div class="sk-kpi '+(over?"warn":"good")+'"><span>شحنات تجاوز هدرها المتفق</span><b>'+over+'</b></div></div>'+
    '<div class="sk-erp-sim"><label class="sk-field"><span>محاكاة زيادة تكلفة المواد ٪</span><input id="erp-sim-cost" type="number" step="1" value="10"></label><div id="erp-sim-out" class="sk-note">اختر نسبة وشاهد أثرها على آخر قائمة دخل.</div></div>'+
  '</div></section>');
  const sim=()=>{const p=num(root.querySelector("#erp-sim-cost").value)/100,box=root.querySelector("#erp-sim-out");if(!last)return box.textContent="احفظ قائمة دخل أولاً.";const newCost=num(last.materialCost)*(1+p),newNet=num(last.revenue)-newCost-num(last.otherExpenses);box.innerHTML="لو زادت تكلفة المواد <b>"+(p*100).toFixed(1)+"٪</b> يصبح صافي الربح تقريباً <b>"+SK.money(newNet)+"</b> بدلاً من "+SK.money(last.netProfit)+"."};
  root.querySelector("#erp-sim-cost").oninput=sim;sim();
  root.querySelector("#erp-jev-brief").onclick=()=>SK.askJev({type:"choice",question:"ما الأولوية التشغيلية الأهم اليوم بناءً على ملخص S.kosif؟",context:"إعادة طلب عاجلة: "+urgent+"؛ آخر صافي ربح: "+(last?num(last.netProfit):"غير متاح")+"؛ شحنات تجاوز هدرها المتفق بأكثر من نقطتين: "+over,options:["المخزون وإعادة الطلب","الربحية والمصاريف","الموردون والهدر","لا توجد أولوية حرجة اليوم"]});
}
function boot(){applyPack(load(PACK_KEY,"none"));applyRole();const nav=document.getElementById("nav");if(nav)new MutationObserver(applyRole).observe(nav,{childList:true,subtree:true})}
core.onView("settings",settings);core.onView("jev",jev);
boot();
})();
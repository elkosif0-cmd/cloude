/* S.kosif feature — Command Center (home).
   The operational start page: what needs a decision now (the core's exception inbox),
   today's indicators and quick starts. Every number comes from recorded data through the
   core bridge or the modules' own stores; nothing is shown that was not recorded. */
(()=>{
"use strict";
const {esc,load}=SK;
const core=()=>window.SKosifCore;
const LAUNCH=[["zatca","فاتورة جديدة"],["offers","عرض سعر"],["catalog","الأسعار"],["customers","العملاء"],["inventory","المخزون"],["cash","التدفق النقدي"],["receivables","الذمم"],["jev","اسأل Jev"]];
const fmt=v=>new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:1}).format(v);

function greeting(){const h=new Date().getHours();return h<12?"صباح الخير":h<18?"مساء الخير":"مساء النور"}
function kpis(){
  const out=[],st=core().stats();
  if(st.boxes)out.push({l:"متوسط هامش البوكسات",v:isFinite(st.avgMargin)?fmt(st.avgMargin*100)+"٪":"—",c:isFinite(st.avgMargin)&&st.avgMargin*100<st.target?"warn":"ok"});
  out.push({l:"أصناف تُباع بخسارة",v:fmt(st.loss),c:st.loss?"bad":"ok"});
  out.push({l:"تحت الهامش المستهدف",v:fmt(st.below),c:st.below?"warn":""});
  if(st.pendingMemos||st.memoItems)out.push({l:"اعتمادات معلّقة",v:fmt(st.pendingMemos+(st.memoItems?1:0)),c:"warn"});
  const cold=load("skosif_v38_coldchain",[]),last=Array.isArray(cold)&&cold[0];
  if(last&&last.temp!=null)out.push({l:"آخر قراءة تبريد"+(last.loc?" — "+last.loc:""),v:fmt(Number(last.temp))+"°م",c:Number(last.temp)>4?"bad":"ok"});
  const ledger=load("skosif_v38_ledger",null);
  if(ledger&&typeof ledger==="object"){const cs=Array.isArray(ledger)?ledger:(ledger.customers||[]);const open=cs.reduce((a,c)=>a+(Number(c.balance)||0),0);if(cs.length)out.push({l:"أرصدة ائتمان المطاعم",v:SK.money(open),c:open>0?"warn":""})}
  return out;
}
function inbox(){
  const list=core().exceptions()||[];
  if(!list.length)return '<div class="skc-ok">'+SK.icons.check+'<span>لا شيء يحتاج قراراً الآن — كل المؤشرات ضمن الحدود.</span></div>';
  return '<div class="skc-list">'+list.slice(0,8).map(x=>'<button type="button" class="skc-row" data-go="'+esc(x.view||"decision")+'"><span class="sev '+esc(x.sev||"info")+'"></span><span class="tx"><b>'+esc(x.title||"")+'</b><small>'+esc(x.detail||"")+'</small></span><span class="go">فتح ›</span></button>').join("")+'</div>';
}
function render(root){
  if(!root||!core())return;
  const old=root.querySelector(":scope > .skc");if(old)old.remove();
  const now=new Date(),biz=((document.getElementById("biz-name")||{}).textContent||"").trim()||"S.kosif";
  const day=now.toLocaleDateString("ar-SA-u-nu-latn",{weekday:"long"});
  const greg=now.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long",year:"numeric"});
  const hijri=now.toLocaleDateString("ar-SA-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"long",year:"numeric"});
  const k=kpis(),launch=LAUNCH.filter(([id])=>SK.perm.can(id)&&SK.caps.get(id));
  const html='<section class="skc" aria-label="مركز القيادة">'+
    '<div class="skc-hero"><div><h2>'+greeting()+' — '+esc(biz)+'</h2><p>ابدأ بما يحتاج قراراً، ثم تابع يومك من الأزرار السريعة. للوصول لأي شيء: <kbd>Ctrl</kbd>+<kbd>K</kbd></p></div>'+
      '<div class="skc-date"><b>'+esc(day)+'</b><span>'+esc(greg)+'</span><small class="hint">'+esc(hijri)+'</small></div></div>'+
    '<div class="skc-grid">'+
      '<div class="skc-card"><h3>ما يحتاج قراراً الآن<small>من قواعد التطبيق وبياناتك</small></h3>'+inbox()+'</div>'+
      '<div class="skc-card"><h3>مؤشرات اليوم<small>من السجلات المحفوظة فقط</small></h3><div class="skc-kpis">'+k.map(x=>'<div class="skc-kpi '+x.c+'"><span>'+esc(x.l)+'</span><b>'+esc(x.v)+'</b></div>').join("")+'</div></div>'+
    '</div>'+
    (launch.length?'<div class="skc-card"><h3>ابدأ عملاً</h3><div class="skc-launch">'+launch.map(([id,l])=>'<button type="button" data-go="'+id+'">'+SK.icon(id)+'<span>'+esc(l)+'</span></button>').join("")+'</div></div>':'')+
  '</section>';
  root.insertAdjacentHTML("afterbegin",html);
  root.querySelector(":scope > .skc").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)core().go(b.dataset.go)});
}
function boot(){const c=core();if(c)c.onView("dash",render)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();

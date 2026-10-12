/* S.kosif — «سجل الذكاء الاصطناعي»: the unified AI trace log (docs/registry/EXTERNAL_BACKLOG_ar.md §3, §4‑1) as a tab of
   «الأجهزة والمزامنة» (settings hub) — a card added to an existing screen, not a new view. Every provider call ui/core/ai.js
   made for the open company: when, from which screen and section, which provider and model, how many identifiers were
   masked, the sizes, the outcome and the duration — and the SHA‑256 of the masked prompt, never the prompt. Filters by
   purpose, provider and outcome; counts; CSV export; the masking policy; clearing the company's log. Reads SK.aiGuard only. */
(()=>{
"use strict";
const {$,esc,toast}=SK;
const G=()=>SK.aiGuard;
const ID="dv-ai-trace",PAGE=60;
let f={purpose:"",provider:"",outcome:"",q:""},shown=PAGE;

/* the fourth tab of «الأجهزة والمزامنة» (ui/core/screen-tabs.js registered three) */
if(SK.screenTabs&&SK.screenTabs.register)SK.screenTabs.register("devices",{
  tabs:[["device","هذا الجهاز والنقل"],["phone","شريط الجوال"],["laptop","اللابتوب ولوحة المفاتيح"],["ai","سجل الذكاء الاصطناعي"]],
  blocks:".dv > .card",
  tag:(el,h)=>/الذكاء الاصطناعي/.test(h)?"ai":/شريط الجوال/.test(h)?"phone":/^اللابتوب|لوحة المفاتيح/.test(h)?"laptop":"device"
});

const OUT={ok:["تم","good"],error:["خطأ","bad"],blocked:["أُوقف","warn"]};
const PROVIDER={gemini:"Gemini",openai:"OpenAI",anthropic:"Claude"};
const KIND={iban:"آيبان",email:"بريد",vat:"ضريبي",nationalId:"هوية",cr:"سجل",phone:"هاتف",name:"عميل"};
const nf=v=>new Intl.NumberFormat("ar-SA-u-nu-latn").format(Number(v)||0);
const kb=n=>n==null?"—":n<1024?nf(n)+" ب":n<1048576?(n/1024).toFixed(n<10240?1:0)+" ك.ب":(n/1048576).toFixed(1)+" م.ب";
const when=iso=>{try{return new Date(iso).toLocaleString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch{return String(iso||"").slice(0,16)}};
const dur=ms=>ms>=1000?(ms/1000).toFixed(ms<10000?1:0)+" ث":nf(ms)+" م.ث";
const kinds=k=>Object.entries(k||{}).filter(([,n])=>n>0).map(([kind,n])=>(KIND[kind]||kind)+" "+nf(n)).join("، ");
const opt=(list,cur,label)=>'<option value="">'+esc(label)+'</option>'+list.map(v=>'<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(PROVIDER[v]||v)+'</option>').join("");

function card(){
  const g=G();if(!g)return "";
  const all=g.trace(),rows=g.filter(all,f),s=g.summary(all),pol=g.policy(),eng=!!g.engine();
  const purposes=[...new Set(all.map(r=>r.purpose).filter(Boolean))].sort(),providers=[...new Set(all.map(r=>r.provider).filter(Boolean))].sort();
  const head='<div class="card-h"><div><h3>سجل الذكاء الاصطناعي</h3><p>كل طلب غادر هذا الجهاز إلى مزود ذكاء اصطناعي من هذه الشركة: ما قُنِّع، حجمه، نتيجته — وبصمة الطلب لا نصّه.</p></div>'+
    '<span class="sk-pill '+(eng?'good':'warn')+'">'+(eng?'التقنيع يعمل':'محرك التقنيع غير محمّل')+'</span></div>';
  const kpis='<div class="ait-kpis" role="list">'+[["الطلبات",nf(s.total),""],["تمت",nf(s.ok),"good"],["أخطاء",nf(s.error),s.error?"bad":""],["أُوقفت",nf(s.blocked),s.blocked?"warn":""],["معرّفات مقنَّعة",nf(s.masked),""],["خرج",kb(s.inputBytes),""],["عاد",kb(s.outputBytes),""]]
    .map(([l,v,c])=>'<div class="ait-kpi'+(c?' '+c:'')+'" role="listitem"><b>'+esc(v)+'</b><span>'+esc(l)+'</span></div>').join("")+'</div>';
  const filters='<div class="ait-filters"><label class="sk-field"><span>الغرض / الشاشة</span><select data-ait-f="purpose">'+opt(purposes,f.purpose,"كل الأغراض")+'</select></label>'+
    '<label class="sk-field"><span>المزود</span><select data-ait-f="provider">'+opt(providers,f.provider,"كل المزودين")+'</select></label>'+
    '<label class="sk-field"><span>النتيجة</span><select data-ait-f="outcome"><option value="">كل النتائج</option>'+Object.entries(OUT).map(([k,[l]])=>'<option value="'+k+'"'+(f.outcome===k?' selected':'')+'>'+l+'</option>').join("")+'</select></label>'+
    '<label class="sk-field"><span>بحث</span><input type="search" data-ait-f="q" value="'+esc(f.q)+'" placeholder="النموذج، الملاحظة، البصمة…"></label></div>';
  const table=rows.length?'<div class="sk-table-wrap ait-table"><table class="sk-table"><thead><tr><th>الوقت</th><th>القسم / الشاشة</th><th>الغرض</th><th>المزود · النموذج</th><th>مقنَّع</th><th>خرج / عاد</th><th>المدة</th><th>النتيجة</th><th>البصمة</th></tr></thead><tbody>'+
    rows.slice(0,shown).map(r=>{const [ol,oc]=OUT[r.outcome]||OUT.ok;
      return '<tr><td>'+esc(when(r.ts))+'</td><td>'+esc(SK.gate&&SK.gate.label?SK.gate.label(r.gate)||r.gate:r.gate)+(r.screen?' / '+esc(r.screen):'')+'</td><td>'+esc(r.purpose)+'</td><td>'+esc(PROVIDER[r.provider]||r.provider)+' · <code>'+esc(r.model)+'</code></td>'+
        '<td title="'+esc(kinds(r.maskedKinds))+'">'+nf(r.maskedCount)+'</td><td>'+esc(kb(r.inputBytes))+' / '+esc(kb(r.outputBytes))+'</td><td>'+esc(dur(r.durationMs))+'</td>'+
        '<td><span class="sk-pill '+oc+'">'+ol+'</span>'+(r.error?'<small class="ait-err">'+esc(r.error)+'</small>':'')+(r.userNote?'<small class="ait-note">'+esc(r.userNote)+'</small>':'')+'</td><td><code class="ait-hash" title="'+esc(r.promptHash)+'">'+esc(r.promptHash.slice(0,12))+'</code></td></tr>'}).join("")+
    '</tbody></table></div>'+(rows.length>shown?'<div class="sk-actions"><button type="button" class="btn sm" data-ait="more">عرض المزيد ('+nf(rows.length-shown)+')</button></div>':'')
    :(all.length?'<p class="sk-empty">لا صفوف تطابق هذه المرشحات.</p>':'<p class="sk-empty">لم يغادر هذا الجهاز أي طلب ذكاء اصطناعي من هذه الشركة بعد.</p>');
  const policy='<details class="ait-policy"><summary>سياسة التقنيع</summary><div class="ait-policy-b">'+
    '<label class="ait-check"><input type="checkbox" data-ait-p="maskNames"'+(pol.maskNames?' checked':'')+'> تقنيع أسماء العملاء والموردين من بيانات الشركة</label>'+
    '<label class="sk-field"><span>الحد الأقصى لسطور جدول العملاء قبل الإيقاف</span><input type="number" min="5" max="1000" step="1" data-ait-p="tableRows" value="'+esc(pol.tableRows)+'"></label>'+
    '<label class="sk-field"><span>الحد الأقصى لحجم الطلب (بايت)</span><input type="number" min="10000" step="10000" data-ait-p="maxBytes" value="'+esc(pol.maxBytes)+'"></label>'+
    '<p class="hint">المعرّفات (هواتف، بريد، آيبان، هويات، سجلات، أرقام ضريبية) تُقنَّع دائماً؛ أي معرّف يبقى بعد التقنيع يوقف الطلب. خريطة الاستبدال تبقى في ذاكرة هذه الصفحة فقط.</p></div></details>';
  const actions='<div class="sk-actions"><button type="button" class="btn sm" data-ait="csv"'+(rows.length?'':' disabled')+'>'+SK.icon("download")+' تصدير CSV</button>'+
    '<button type="button" class="btn sm danger" data-ait="clear"'+(all.length?'':' disabled')+'>مسح سجل هذه الشركة</button></div>';
  return head+'<div class="card-b ait">'+kpis+filters+table+policy+actions+'</div>';
}
function exportCsv(rows){
  const H=["ts","company","gate","screen","purpose","provider","model","maskedCount","maskedKinds","inputBytes","outputBytes","outcome","durationMs","promptHash","error","userNote"];
  SK.csv.download("ai-trace-"+new Date().toISOString().slice(0,10),H,rows.map(r=>[r.ts,r.company,r.gate,r.screen,r.purpose,r.provider,r.model,r.maskedCount,kinds(r.maskedKinds),r.inputBytes,r.outputBytes,r.outcome,r.durationMs,r.promptHash,r.error,r.userNote]));
}
function paint(){const el=document.getElementById(ID);if(el)el.innerHTML=card()}
/* the card joins «الأجهزة والمزامنة» after devices.js painted its own cards */
function ensure(){
  const c=window.SKosifCore;if(!c||c.view()!=="devices"||!G())return;
  const host=$("#view .dv");if(!host||document.getElementById(ID))return;
  const sec=document.createElement("section");sec.className="card ait-card";sec.id=ID;sec.innerHTML=card();
  sec.addEventListener("change",e=>{
    const fl=e.target.closest("[data-ait-f]");if(fl){f={...f,[fl.dataset.aitF]:fl.value};shown=PAGE;paint();return}
    const p=e.target.closest("[data-ait-p]");if(p){const k=p.dataset.aitP;G().setPolicy({[k]:p.type==="checkbox"?p.checked:Math.max(Number(p.min)||0,Number(p.value)||0)});toast("حُفظت سياسة التقنيع","ok")}
  });
  sec.addEventListener("input",e=>{const q=e.target.closest('[data-ait-f="q"]');if(!q)return;f={...f,q:q.value};shown=PAGE;const all=G().trace();const rows=G().filter(all,f);const wrap=$(".ait-table",sec);if(wrap||rows.length)paint()});
  sec.addEventListener("click",async e=>{
    const b=e.target.closest("[data-ait]");if(!b)return;const a=b.dataset.ait;
    if(a==="more"){shown+=PAGE;paint()}
    else if(a==="csv"){exportCsv(G().filter(G().trace(),f));toast("صُدِّر السجل","ok")}
    else if(a==="clear"){if(!await SK.confirm("مسح سجل الذكاء الاصطناعي لهذه الشركة من هذا الجهاز؟",{danger:true,ok:"مسح"}))return;G().clear();toast("مُسح السجل","ok")}
  });
  host.appendChild(sec);
  if(SK.screenTabs&&SK.screenTabs.refresh)SK.screenTabs.refresh();
}
let t=0;const later=()=>{clearTimeout(t);t=setTimeout(ensure,40)};
if(SK.bus){SK.bus.on("render",later);SK.bus.on("nav",later);SK.bus.on("ai-trace",()=>{if(document.getElementById(ID))paint()})}
window.SKosifAITrace=Object.freeze({refresh:()=>{later();paint()},filters:()=>({...f})});
})();

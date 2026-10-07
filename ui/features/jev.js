/* S.kosif — Jev: مساعد القرار كشاشة يومية.
   يجمع ما كان في «مركز قرارات Jev» و«سؤال Jev» وسجل القرارات في شاشة واحدة.
   السياق المرسل ملخص أرقام من محرك التسعير فقط — لا أسماء عملاء ولا جوالات،
   ويمر أي نص عبر الحجب قبل الإرسال. */
(()=>{
"use strict";
const {$,$$,esc,load,save,redact}=window.SK;
const API="https://aghnam-jev-api.kosif199022.workers.dev",SKEY="aghnamJevSession";
const LOG_KEY="aghnam_v29_jev_log",DRAFT_KEY="skosif_jev_draft",MAX_LOG=100;
const THINK_ROLES={
  openai:"المحلّل الرئيسي — ابنِ الحل الأقوى واختبر اتساقه.",
  anthropic:"الناقد المتشكك — ابحث عن الثغرات والافتراضات والمخاطر.",
  gemini:"محلل البدائل — قارن المسارات وابحث عن أدلة أو زوايا مفقودة."
};
const TYPES={noul:"نعم / لا",choice:"اختيار من بدائل",score:"تقييم على سلّم"};
const PRESETS={
  pricing:{type:"noul",label:"التسعير",q:"هل مستوى الأسعار الحالي يحقق هامشاً آمناً بالنظر إلى التكلفة والهدر؟",c:"نعم: الأسعار تغطي التكلفة والهدر وتترك هامشاً مقبولاً\nلا: الهامش غير كافٍ أو توجد مخاطرة تسعير واضحة"},
  stock:{type:"choice",label:"المخزون",q:"ما الإجراء الأنسب للمخزون الحالي؟",c:"إعادة طلب عاجلة\nإعادة طلب طبيعية\nمراقبة دون طلب\nتصفية أو عرض ترويجي"},
  offer:{type:"choice",label:"العروض",q:"أي عرض ترويجي أنسب هذا الأسبوع دون الإضرار بالهامش؟",c:"خصم 5٪ على الأصناف الأعلى هامشاً\nبوكس عائلي بسعر ثابت\nتوصيل مجاني فوق حد معين\nلا عروض هذا الأسبوع"},
  customers:{type:"score",label:"العملاء",q:"قيّم فرصة إعادة الشراء لقاعدة العملاء الحالية.",c:"ضعيفة جداً\nضعيفة\nمتوسطة\nجيدة\nممتازة"}
};
let st={type:"noul",q:"",c:"",ctx:"",attach:true,busy:false,result:null,status:""};
let th={mode:"council",q:"",ctx:"",opts:"",busy:false,result:null,status:""};

/* ملخص أرقام فقط من محرك التسعير */
function appContext(){
  let d=null;try{d=window.SKosifCore.catalog()}catch{}
  if(!d||!d.items.length)return "لا توجد بيانات أصناف.";
  const act=d.items.filter(i=>i.status!=="archived"&&i.price!=null);
  const m=act.map(i=>i.margin).filter(x=>x!=null);
  const avg=m.length?m.reduce((a,b)=>a+b,0)/m.length:0;
  const below=act.filter(i=>i.target!=null&&i.margin!=null&&i.margin<i.target);
  const low=[...act].filter(i=>i.margin!=null).sort((a,b)=>a.margin-b.margin).slice(0,5);
  const inv=load("aghnam_v29_inventory",[]);
  const reorder=Array.isArray(inv)?inv.filter(x=>Number(x.stock)<=Number(x.reorderPoint||0)).length:0;
  return ["ملخص SQC (أرقام مجمعة):",
    "أصناف نشطة: "+act.length+" (خام "+act.filter(i=>i.kind==="raw").length+"، بوكسات "+act.filter(i=>i.kind==="box").length+")",
    "متوسط الهامش: "+(avg*100).toFixed(1)+"٪",
    "أصناف تحت الهامش المستهدف: "+below.length,
    "أدنى الهوامش: "+low.map(i=>i.name+" "+(i.margin*100).toFixed(1)+"٪").join("، "),
    "أصناف بلغت حد إعادة الطلب: "+reorder].join("\n");
}
function summary(r){
  const a=r?.answers?.decision||r?.decision||r;
  if(a?.type==="noul"&&typeof a.noul==="number"){const y=Math.round(a.noul*100);return {h:y>=50?"نعم":"لا",d:"احتمال نعم "+y+"٪ · لا "+(100-y)+"٪"}}
  if(a?.type==="choice"){const c=a.choice??a.answer??a.selected??a.label;return {h:c!=null?String(c):"تم اختيار بديل",d:typeof a.confidence==="number"?"الثقة "+Math.round(a.confidence*100)+"٪":""}}
  if(a?.type==="score"){const s=a.score??a.value;return {h:s!=null?"التقييم: "+s:"تم التقييم",d:""}}
  return {h:"تمت المعالجة",d:""};
}
async function callJev(payload){
  let token="";try{token=sessionStorage.getItem(SKEY)||""}catch{}
  if(!token)throw new Error("Jev غير مفعّل لهذه الجلسة.");
  const r=await fetch(API+"/api/jev",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+token},body:JSON.stringify(payload)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.ok)throw new Error(d.error||"تعذر تشغيل Jev ("+r.status+")");
  return d.result;
}
function aiText(d){return (d?.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("").trim()}
function parseAIJson(text){
  const raw=String(text||"").trim().replace(/^\`\`\`(?:json)?\s*/i,"").replace(/\s*\`\`\`$/,"");
  try{return JSON.parse(raw)}catch{
    const a=raw.indexOf("{"),b=raw.lastIndexOf("}");
    if(a>=0&&b>a)return JSON.parse(raw.slice(a,b+1));
    throw new Error("استجابة Agent ليست JSON صالحاً.");
  }
}
function cleanArtifact(provider,role,x){
  const list=v=>Array.isArray(v)?v.map(z=>String(z||"").trim()).filter(Boolean).slice(0,10):[];
  const confidence=Math.max(0,Math.min(1,Number(x?.confidence)||0));
  return {agentId:provider,provider,role,recommendationId:x?.recommendationId==null?null:String(x.recommendationId).slice(0,80),answer:String(x?.answer||"").slice(0,7000),evidence:list(x?.evidence),assumptions:list(x?.assumptions),risks:list(x?.risks),objections:list(x?.objections),confidence};
}
function thinkBody(provider,stage,question,context,options,peers){
  const role=THINK_ROLES[provider]||"مراجع مستقل";
  const schema={recommendationId:"A أو B... عند وجود بدائل، وإلا null",answer:"الخلاصة القابلة للمراجعة",evidence:["أدلة أو حقائق"],assumptions:["افتراضات"],risks:["مخاطر"],objections:["اعتراضات"],confidence:0.0};
  const task={question,context:context||"",options:options||{},stage,peerArtifacts:peers||[]};
  const stageRule=stage==="independent"?"حلل مستقلاً دون التأثر بوكلاء آخرين.":stage==="critique"?"راجع نتائج الوكلاء الآخرين، اكتشف الأخطاء والتعارضات ثم أعد موقفك المنظم.":"أصدر النسخة المنقحة بعد النقد المتبادل.";
  return {
    systemInstruction:{parts:[{text:"أنت عضو في KOSIF Think. دورك: "+role+" "+stageRule+" لا تعرض سلسلة التفكير الداخلية. أعد فقط JSON صالحاً يطابق هذا الشكل: "+JSON.stringify(schema)}]},
    contents:[{role:"user",parts:[{text:JSON.stringify(task)}]}],
    generationConfig:{responseMimeType:"application/json",maxOutputTokens:1800}
  };
}
async function runAgent(provider,stage,question,context,options,peers){
  const d=await SKosifAI.generateFor(provider,thinkBody(provider,stage,question,context,options,peers),{timeout:120000});
  return cleanArtifact(provider,THINK_ROLES[provider]||"مراجع مستقل",parseAIJson(aiText(d)));
}
async function runThinkStage(stage,providers,question,context,options,peers){
  const settled=await Promise.allSettled(providers.map(p=>runAgent(p,stage,question,context,options,(peers||[]).filter(x=>x.provider!==p))));
  return {
    artifacts:settled.flatMap(x=>x.status==="fulfilled"?[x.value]:[]),
    failures:settled.flatMap((x,i)=>x.status==="rejected"?[{provider:providers[i],message:x.reason?.message||String(x.reason)}]:[])
  };
}
function jevVerdict(raw){
  const a=raw?.answers?.decision||raw?.decision||raw||{};
  if(a.type==="noul"&&typeof a.noul==="number")return {decision:a.noul>=.5?"نعم":"لا",confidence:Math.max(a.noul,1-a.noul)};
  if(a.type==="choice")return {decision:String(a.choice??a.answer??a.selected??a.label??""),confidence:typeof a.confidence==="number"?a.confidence:null};
  if(a.type==="score")return {decision:String(a.score??a.value??""),confidence:typeof a.confidence==="number"?a.confidence:null};
  return {decision:"",confidence:null};
}
async function synthesizeThink(provider,question,artifacts,council,jev){
  const body={
    systemInstruction:{parts:[{text:"أنت رئيس KOSIF Think. كوّن إجابة عربية نهائية موجزة ودقيقة من نتائج الوكلاء وحكم Jev. لا تعرض سلسلة التفكير الداخلية. أعد JSON فقط: {\"finalAnswer\":\"...\",\"confidence\":0.0,\"remainingUncertainty\":[\"...\"]}"}]},
    contents:[{role:"user",parts:[{text:JSON.stringify({question,artifacts,council,jev})}]}],
    generationConfig:{responseMimeType:"application/json",maxOutputTokens:1800}
  };
  const d=await SKosifAI.generateFor(provider,body,{timeout:120000});
  return parseAIJson(aiText(d));
}
function thinkOptions(){
  const lines=th.opts.split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,12);
  return lines.length>=2?Object.fromEntries(lines.map((v,i)=>[String.fromCharCode(65+i),v])):{};
}
function thinkHTML(){
  const providers=window.SKosifAI?.configured?.()||[];
  const r=th.result;
  const cards=r?.artifacts?.map(a=>'<article class="sk-note"><b>'+esc((window.SKosifAI.conf(a.provider)?.label)||a.provider)+' · '+Math.round((a.confidence||0)*100)+'٪</b><div>'+esc(a.answer||"")+'</div>'+(a.risks?.length?'<small>مخاطر: '+esc(a.risks.join(" · "))+'</small>':'')+'</article>').join("")||"";
  const jev=r?.jev?summary(r.jev):null;
  return '<section class="card" id="kosif-think"><div class="card-h"><div><h3>KOSIF Think</h3><p>مجلس تفكير من عدة نماذج ذكاء اصطناعي مُعدّة في «المراجع الذكي»، ثم Jev كحاجز قرار.</p></div><span class="chip">'+providers.length+' Agent جاهز</span></div><div class="card-b sk-stack">'+
    '<div class="seg sk-seg" role="group" aria-label="عمق التفكير">'+["fast","council","deep"].map(m=>'<button type="button" data-th-mode="'+m+'" aria-pressed="'+(th.mode===m)+'">'+({fast:"سريع",council:"مجلس",deep:"عميق"}[m])+'</button>').join("")+'</div>'+
    '<div class="sk-chips">'+(providers.length?providers.map(p=>'<span class="chip">'+esc(window.SKosifAI.conf(p).label)+'</span>').join(""):'<span class="sk-note warn">أضف مفتاحين أو أكثر من إعداد «المراجع الذكي» لتفعيل المجلس متعدد النماذج.</span>')+'</div>'+
    /* R14: without configured models the council cannot run — its form folds under one line instead of three empty boxes */
    '<details class="th-form"'+(providers.length||th.q||r?' open':'')+'><summary>اكتب مسألة للمجلس</summary>'+
    '<label class="sk-field"><span>المسألة أو السؤال</span><textarea id="th-q" rows="4" placeholder="اكتب المسألة التي تريد من المجلس تحليلها...">'+esc(th.q)+'</textarea></label>'+
    '<label class="sk-field"><span>السياق / الحقائق</span><textarea id="th-ctx" rows="4" placeholder="أرقام، قيود، حقائق، أو ملخص مستند...">'+esc(th.ctx)+'</textarea></label>'+
    '<label class="sk-field"><span>بدائل اختيارية — بديل في كل سطر</span><textarea id="th-opts" rows="3" placeholder="خطة أ&#10;خطة ب">'+esc(th.opts)+'</textarea></label>'+
    '<div class="sk-actions"><button type="button" class="btn primary" id="th-run"'+(th.busy?' disabled':'')+'>'+(th.busy?"المجلس يعمل…":"شغّل KOSIF Think")+'</button><button type="button" class="btn" id="th-clear">مسح</button></div>'+
    '</details>'+
    (th.status?'<div class="sk-note'+(th.status.startsWith("!")?" bad":"")+'">'+esc(th.status.replace(/^!/,""))+'</div>':'')+
    (r?'<div class="sk-result"><span>النتيجة النهائية</span><b>'+esc(r.finalAnswer||"")+'</b><small>الوكلاء الناجحون '+r.artifacts.length+(r.council?" · اتفاق المجلس "+r.council.agreementPercent+"٪":"")+(jev?" · Jev: "+esc(jev.h)+" "+esc(jev.d):"")+' · البوابة: '+(r.gate?.passed?"اجتازت":"مراجعة إضافية")+'</small>'+(r.gate?.reasons?.length?'<div class="sk-note warn">'+esc(r.gate.reasons.join(" · "))+'</div>':'')+'</div><details><summary>نتائج الوكلاء والمخاطر</summary><div class="sk-stack">'+cards+(r.failures?.length?'<div class="sk-note bad">فشل: '+esc(r.failures.map(x=>x.provider+" — "+x.message).join(" | "))+'</div>':'')+'</div></details>':'')+
  '</div></section>';
}
function grabThink(){
  const q=$("#th-q",root),c=$("#th-ctx",root),o=$("#th-opts",root);
  if(q)th.q=q.value;if(c)th.ctx=c.value;if(o)th.opts=o.value;
}
function bindThink(){
  $$("[data-th-mode]",root).forEach(b=>b.onclick=()=>{grabThink();th.mode=b.dataset.thMode;paint()});
  const run=$("#th-run",root);if(run)run.onclick=runThink;
  const clear=$("#th-clear",root);if(clear)clear.onclick=()=>{Object.assign(th,{q:"",ctx:"",opts:"",result:null,status:""});paint()};
}
async function executeThink({question,context="",options={},mode="council"}){
  const q=String(question||"").trim();
  if(!q)throw new Error("اكتب السؤال أولاً.");
  const providers=window.SKosifAI?.configured?.()||[];
  if(!providers.length)throw new Error("لا يوجد مفتاح AI مضبوط. أضف مفتاح OpenAI أو Claude أو Gemini أولاً.");
  const failures=[];
  let round=await runThinkStage("independent",providers,q,String(context||""),options,[]);
  let artifacts=round.artifacts;failures.push(...round.failures);
  if(mode!=="fast"&&artifacts.length>1){
    round=await runThinkStage("critique",artifacts.map(x=>x.provider),q,String(context||""),options,artifacts);
    if(round.artifacts.length)artifacts=round.artifacts;failures.push(...round.failures);
  }
  if(mode==="deep"&&artifacts.length>1){
    round=await runThinkStage("revision",artifacts.map(x=>x.provider),q,String(context||""),options,artifacts);
    if(round.artifacts.length)artifacts=round.artifacts;failures.push(...round.failures);
  }
  if(!artifacts.length)throw new Error("لم ينجح أي Agent في إرجاع نتيجة.");
  const votes=artifacts.filter(a=>a.recommendationId&&options[a.recommendationId]).map(a=>({provider:a.provider,optionId:a.recommendationId,confidence:a.confidence,rationale:a.answer.slice(0,600)}));
  const council=votes.length&&window.SKEngines?.intelligence?.council?.resolveCouncil?SKEngines.intelligence.council.resolveCouncil(votes):null;
  let jev=null;
  try{
    const state=redact(JSON.stringify({artifacts,council}));
    jev=Object.keys(options).length>=2
      ? await callJev({type:"choice",instructions:"اختر البديل الأكثر اتساقاً مع الأدلة والقيود والمخاطر التي توصل إليها مجلس KOSIF Think.",state,criteria:options})
      : await callJev({type:"noul",instructions:"هل نتيجة مجلس KOSIF Think الحالية قوية بما يكفي للاعتماد دون جولة إضافية؟",state,true_criteria:"الأدلة متسقة والاعتراضات الجوهرية محلولة.",false_criteria:"يوجد تعارض جوهري أو افتراض غير محسوم قد يغيّر النتيجة."});
  }catch(e){failures.push({provider:"Jev",message:e.message||String(e)})}
  const jv=jev?jevVerdict(jev):null,reasons=[];
  if(council?.tied)reasons.push("تعادل في مجلس الوكلاء");
  if(council&&council.agreementPercent<80)reasons.push("اتفاق المجلس أقل من 80٪");
  if(jv?.confidence!=null&&jv.confidence<.8)reasons.push("ثقة Jev أقل من 80٪");
  const gate={passed:reasons.length===0,reasons};
  const chair=providers.includes("openai")?"openai":artifacts[0].provider;
  artifacts.sort((a,b)=>b.confidence-a.confidence);
  let finalAnswer=artifacts[0].answer,finalConfidence=artifacts[0].confidence,remainingUncertainty=[];
  try{
    const syn=await synthesizeThink(chair,q,artifacts,council,jev);
    if(syn?.finalAnswer)finalAnswer=String(syn.finalAnswer);
    if(Number.isFinite(Number(syn?.confidence)))finalConfidence=Math.max(0,Math.min(1,Number(syn.confidence)));
    if(Array.isArray(syn?.remainingUncertainty))remainingUncertainty=syn.remainingUncertainty.map(x=>String(x)).slice(0,8);
  }catch(e){failures.push({provider:chair+"-synthesis",message:e.message||String(e)})}
  return {mode,artifacts,council,jev,jevVerdict:jv,gate,failures,finalAnswer,finalConfidence,remainingUncertainty};
}
async function runThink(){
  grabThink();
  const q=th.q.trim();if(!q){th.status="!اكتب السؤال أولاً.";return paint()}
  const options=thinkOptions();
  Object.assign(th,{busy:true,status:"",result:null});paint();
  try{
    th.result=await executeThink({question:q,context:th.ctx.trim(),options,mode:th.mode});
    th.status="تم — "+th.result.artifacts.length+" Agent شارك"+(th.result.jev?" وJev راجع النتيجة.":"؛ Jev لم يكن متاحاً.")+(th.result.gate.passed?" · بوابة الاعتماد اجتازت.":" · تحتاج مراجعة إضافية.");
    logDecision({source:"KOSIF Think",type:th.mode,question:q,summary:th.result.finalAnswer.slice(0,220)});
  }catch(e){th.status="!"+(e.message||String(e))}
  finally{th.busy=false;paint()}
}
window.SKosifThink=Object.freeze({run:executeThink,configuredAgents:()=>window.SKosifAI?.configured?.()||[]});
window.SKosifJev=Object.freeze({call:callJev,summary});

function logDecision(x){const l=load(LOG_KEY,[]);l.unshift({at:new Date().toISOString(),...x});save(LOG_KEY,l.slice(0,MAX_LOG))}

function html(){
  const token=(()=>{try{return !!sessionStorage.getItem(SKEY)}catch{return false}})();
  const log=load(LOG_KEY,[]);
  const lab=st.type==="noul"?"معيار نعم / لا (اختياري)":st.type==="choice"?"البدائل — بديل في كل سطر (2 إلى 12)":"سلّم التقييم — من الأدنى للأعلى";
  const r=st.result&&summary(st.result);
  return thinkHTML()+'<div class="sk-grid-2">'+
  '<section class="card"><div class="card-h"><div><h3>اسأل Jev</h3><p>قرار احتمالي مساعد — الأرقام القطعية تبقى من محرك التسعير.</p></div></div><div class="card-b sk-stack">'+
    (token?'':'<div class="sk-note warn">Jev غير مفعّل في هذه الجلسة. افتح التطبيق من شاشة كلمة المرور ليتفعّل، أو راجع «الصحة والتشخيص».</div>')+
    '<div class="seg sk-seg" role="group" aria-label="نوع القرار">'+Object.entries(TYPES).map(([k,v])=>'<button type="button" data-jev-type="'+k+'" aria-pressed="'+(st.type===k)+'">'+v+'</button>').join("")+'</div>'+
    '<div class="sk-chips">'+Object.entries(PRESETS).map(([k,p])=>'<button type="button" class="chip" data-jev-preset="'+k+'">'+p.label+'</button>').join("")+'</div>'+
    '<label class="sk-field"><span>السؤال</span><textarea id="jev-q" rows="3" placeholder="مثال: هل أرفع سعر الكيلو 3٪ هذا الأسبوع؟">'+esc(st.q)+'</textarea></label>'+
    '<label class="sk-field"><span>'+lab+'</span><textarea id="jev-c" rows="4">'+esc(st.c)+'</textarea></label>'+
    (st.ctx?'<div class="sk-note">سياق مرفق من الأداة: '+esc(st.ctx.slice(0,220))+(st.ctx.length>220?"…":"")+' <button type="button" class="linkish" id="jev-ctx-x">إزالة</button></div>':'')+
    '<label class="sk-check"><input type="checkbox" id="jev-attach"'+(st.attach?' checked':'')+'> أرفق ملخص أرقام التطبيق (بدون أسماء عملاء أو جوالات)</label>'+
    '<div class="sk-actions"><button type="button" class="btn primary" id="jev-run"'+(st.busy?' disabled':'')+'>'+(st.busy?"Jev يحلل…":"اسأل Jev")+'</button><button type="button" class="btn" id="jev-clear">مسح</button></div>'+
    (st.status?'<div class="sk-note'+(st.status.startsWith("!")?" bad":"")+'">'+esc(st.status.replace(/^!/,""))+'</div>':'')+
    (r?'<div class="sk-result"><span>نتيجة Jev</span><b>'+esc(r.h)+'</b>'+(r.d?'<small>'+esc(r.d)+'</small>':'')+'<details><summary>التفاصيل</summary><pre dir="ltr">'+esc(JSON.stringify(st.result,null,2))+'</pre></details></div>':'')+
  '</div></section>'+
  '<section class="card"><div class="card-h"><div><h3>سجل القرارات</h3><p>آخر '+MAX_LOG+' قرار على هذا الجهاز.</p></div><div class="sk-actions"><button type="button" class="btn sm" id="jev-log-csv"'+(log.length?'':' disabled')+'>CSV</button><button type="button" class="btn sm" id="jev-log-clear"'+(log.length?'':' disabled')+'>مسح</button></div></div><div class="card-b">'+
    (log.length?'<ol class="sk-log">'+log.slice(0,30).map(x=>'<li><b>'+esc(x.summary||"")+'</b><span>'+esc(x.question||"")+'</span><small>'+esc(x.source||"Jev")+' · '+new Date(x.at).toLocaleString("ar-SA-u-nu-latn")+'</small></li>').join("")+'</ol>':'<div class="empty"><p>لا توجد قرارات بعد.</p></div>')+
  '</div></section></div>';
}
let root=null;
function paint(){if(!root)return;root.innerHTML=html();bind()}
function grab(){const q=$("#jev-q",root),c=$("#jev-c",root),a=$("#jev-attach",root);if(q)st.q=q.value;if(c)st.c=c.value;if(a)st.attach=a.checked}
function bind(){
  bindThink();
  $$("[data-jev-type]",root).forEach(b=>b.onclick=()=>{grab();st.type=b.dataset.jevType;paint()});
  $$("[data-jev-preset]",root).forEach(b=>b.onclick=()=>{const p=PRESETS[b.dataset.jevPreset];Object.assign(st,{type:p.type,q:p.q,c:p.c,result:null,status:""});paint()});
  $("#jev-run",root).onclick=run;
  $("#jev-clear",root).onclick=()=>{Object.assign(st,{q:"",c:"",ctx:"",result:null,status:""});paint()};
  const x=$("#jev-ctx-x",root);if(x)x.onclick=()=>{grab();st.ctx="";paint()};
  $("#jev-log-clear",root).onclick=async()=>{if(await SK.confirm("مسح سجل قرارات Jev بالكامل؟",{danger:true,ok:"مسح"})){save(LOG_KEY,[]);paint()}};
  $("#jev-log-csv",root).onclick=()=>window.SK.csv.download("SQC-jev-"+new Date().toISOString().slice(0,10),["التاريخ","المصدر","السؤال","النتيجة"],load(LOG_KEY,[]).map(x=>[x.at,x.source||"",x.question||"",x.summary||""]));
}
async function run(){
  grab();
  let token="";try{token=sessionStorage.getItem(SKEY)||""}catch{}
  if(!token){st.status="!Jev غير مفعّل لهذه الجلسة. افتح التطبيق من شاشة كلمة المرور مرة أخرى.";return paint()}
  const q=st.q.trim();if(!q){st.status="!اكتب السؤال أولاً.";return paint()}
  const lines=st.c.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  const state=redact(["قرار داخل تطبيق SQC",st.ctx,st.attach?appContext():""].filter(Boolean).join("\n\n"));
  const payload={type:st.type,instructions:redact(q),state};
  if(st.type==="noul"){
    const y=lines.find(x=>/^نعم\s*[:：]/.test(x)),n=lines.find(x=>/^لا\s*[:：]/.test(x));
    payload.true_criteria=y?y.replace(/^نعم\s*[:：]\s*/,""):"الأدلة المتاحة تؤيد السؤال أو القرار";
    payload.false_criteria=n?n.replace(/^لا\s*[:：]\s*/,""):"الأدلة المتاحة لا تؤيد السؤال أو القرار";
  }else{
    if(lines.length<2||lines.length>12){st.status="!اكتب من 2 إلى 12 سطراً في "+(st.type==="choice"?"البدائل":"سلّم التقييم")+".";return paint()}
    payload.criteria=st.type==="choice"?Object.fromEntries(lines.map(x=>[x,null])):lines;
  }
  Object.assign(st,{busy:true,status:"",result:null});paint();
  try{
    st.result=await callJev(payload);const s=summary(st.result);
    st.status="تم — استخدم النتيجة كمساعد قرار وراجع الأرقام القطعية.";
    logDecision({source:"Jev",type:st.type,question:q,summary:[s.h,s.d].filter(Boolean).join(" — ")});
  }catch(e){st.status="!"+(e.message||String(e))}
  finally{st.busy=false;paint()}
}
window.SK.view("jev",{title:"Jev للقرار",sub:"اسأل نعم/لا، أو اختر بين بدائل، أو قيّم — مع سجل لقراراتك",emoji:"",
  render(node){
    root=node;
    const draft=load(DRAFT_KEY,null);
    if(draft){localStorage.removeItem(DRAFT_KEY);Object.assign(st,{type:TYPES[draft.type]?draft.type:"choice",q:draft.question||"",c:(draft.options||[]).join("\n"),ctx:draft.context||"",result:null,status:""})}
    paint();
  }});

/* ---------- سلامة الجلسة والمتصفح (ضمن شاشة «الصحة والتشخيص») ---------- */
async function probeIDB(){
  if(!("indexedDB" in window))return false;
  return new Promise(res=>{let q;try{q=indexedDB.open("skosif-probe",1)}catch{return res(false)}
    q.onupgradeneeded=()=>{try{q.result.createObjectStore("p")}catch{}};q.onerror=()=>res(false);
    q.onsuccess=()=>{const db=q.result;db.close();indexedDB.deleteDatabase("skosif-probe");res(true)}});
}
function probeStore(s){try{const v=String(Math.random());s.setItem("skosif_probe",v);const ok=s.getItem("skosif_probe")===v;s.removeItem("skosif_probe");return ok}catch{return false}}
async function diagnose(){
  const token=(()=>{try{return !!sessionStorage.getItem(SKEY)}catch{return false}})();
  let api=false;if(navigator.onLine){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),4500);api=(await fetch(API+"/health",{cache:"no-store",signal:c.signal})).ok;clearTimeout(t)}catch{}}
  let sw=false;try{sw=!!(await navigator.serviceWorker?.getRegistration?.())}catch{}
  let q={};try{q=await navigator.storage?.estimate?.()||{}}catch{}
  let persisted=null;try{persisted=await navigator.storage?.persisted?.()}catch{}
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  return [
    ["اتصال آمن",isSecureContext?"HTTPS":"غير آمن",isSecureContext],
    ["sessionStorage",probeStore(sessionStorage)?"متاح":"غير متاح",probeStore(sessionStorage)],
    ["localStorage",probeStore(localStorage)?"متاح":"غير متاح",probeStore(localStorage)],
    ["IndexedDB",(await probeIDB())?"متاح":"غير متاح",await probeIDB()],
    ["التخزين الدائم",persisted===null?"غير معروف":persisted?"مثبت":"غير مثبت",persisted!==false],
    ["المساحة المستخدمة",q.quota?((q.usage/q.quota)*100).toFixed(1)+"٪":"—",true],
    ["العمل دون اتصال",sw?"مفعّل":"غير مفعّل",sw],
    ["جلسة Jev",token?"مفعّلة":"غير مفعّلة",token],
    ["خادم Jev",navigator.onLine?(api?"متاح":"غير متاح"):"دون اتصال",api],
    ["وضع التشغيل",standalone?"تطبيق مثبت":"متصفح",true]
  ];
}
window.SKosifCore.onView("health",async root=>{
  if(!root||root.querySelector("#sk-session"))return;
  root.insertAdjacentHTML("afterbegin",'<section class="card" id="sk-session"><div class="card-h"><div><h3>الجلسة والمتصفح</h3><p>تخزين الجهاز، العمل دون اتصال، وجلسة Jev.</p></div><button type="button" class="btn sm" id="sk-session-re">إعادة الفحص</button></div><div class="card-b"><div class="sk-kpis" id="sk-session-kpis"><div class="sk-kpi"><span>جارٍ الفحص…</span></div></div></div></section>');
  const fill=async()=>{const rows=await diagnose();const box=root.querySelector("#sk-session-kpis");if(box)box.innerHTML=rows.map(([a,b,ok])=>'<div class="sk-kpi '+(ok?"good":"warn")+'"><span>'+esc(a)+'</span><b>'+esc(b)+'</b></div>').join("")};
  root.querySelector("#sk-session-re").onclick=fill;fill();
});
})();

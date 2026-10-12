/* S.kosif core — the AI reviewer with the user's own API key (window.SKosifAI): Google Gemini, OpenAI or Anthropic Claude.
   The key and the model are kept on this device only (localStorage «skosif_ai_keys», excluded from the full backup and
   from the iPhone ⇄ laptop transfer by ui/core/store.js); requests go straight from the browser to the chosen provider —
   no server of ours sees the key or the documents. Features build every request in the Gemini shape and read the Gemini
   answer shape; SKEngines.audit.aiProviders translates both ways for OpenAI and Claude.
     SKosifAI.ready()            key present for the chosen provider?
     SKosifAI.generate(body)     → the answer in the Gemini shape (throws an Arabic message on failure); opts.purpose / opts.userNote
                                   name the call in the AI trace log (ui/core/ai-guard.js masks the request and records every call)
     SKosifAI.models()           → the models this key can use
     SKosifAI.cardHTML() / bindCard(node, onChange)   the settings card used by the review screens */
(()=>{
"use strict";
const {esc,toast}=SK;
const KEY="skosif_ai_keys";
const PV=()=>window.SKEngines&&SKEngines.audit.aiProviders;
const P=id=>PV().PROVIDERS[id];
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{return {}}};
const write=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch{toast("تعذر حفظ الإعداد على هذا الجهاز","bad")}};
const provider=()=>{const p=read().provider;return PV()&&PV().isProvider(p)?p:"gemini"};
const conf=(id)=>{const pid=id||provider(),o=read()[pid]||{},def=P(pid).models;
  return{provider:pid,label:P(pid).ar,key:String(o.key||""),model:String(o.model||def[0]),models:Array.isArray(o.models)&&o.models.length?o.models:def,checked:o.checked||""}};
const setConf=(patch,id)=>{const pid=id||provider(),o=read(),c=conf(pid);delete c.provider;delete c.label;o[pid]={...c,...patch};write(o)};
const setProvider=id=>{if(!PV().isProvider(id))return;const o=read();o.provider=id;write(o)};
const aiEng=()=>window.SKEngines&&SKEngines.audit.aiReview;

async function send(url,init,timeoutMs,signal,pid=provider()){
  const ac=new AbortController(),t=setTimeout(()=>ac.abort(),timeoutMs||180000);
  if(signal)signal.addEventListener("abort",()=>ac.abort(),{once:true});
  let res;
  try{res=await fetch(url,{...init,signal:ac.signal})}
  catch{clearTimeout(t);throw new Error(ac.signal.aborted?"أُلغي الطلب أو تجاوز المهلة.":PV().friendlyError(pid,0))}
  clearTimeout(t);
  let data=null;try{data=await res.json()}catch{}
  if(!res.ok){const e=new Error(PV().friendlyError(pid,res.status,PV().errorMessage(data)));e.status=res.status;throw e}
  return data;
}
function need(id){const c=conf(id);if(!c.key)throw new Error("لم يُضبط مفتاح "+c.label+" بعد — أدخله في بطاقة «المراجع الذكي».");return c}
/* a retired, overloaded or out-of-quota model does not stop the review: the next model is tried, and the one that answered
   becomes this device's model for that provider (a bad key fails at once — no other model would take it) */
async function generateFor(id,body,opts={}){
  if(!PV().isProvider(id))throw new Error("مزود ذكاء اصطناعي غير معروف.");
  /* FOUNDATION §3.0‑10: AI is a capability the open company enables («مكتبة الأدوات › ملف قدرات الشركة»); the audit entry works on
     an audit file, not a company, and is not gated here */
  const cp=window.SKosifCompanyPlatform,gate=SK.gate&&SK.gate.current?SK.gate.current():"";
  if(gate!=="audit"&&cp&&cp.aiEnabled&&!cp.aiEnabled()){const e=new Error("الذكاء الاصطناعي غير مفعّل لهذه الشركة — فعّله من «مكتبة الأدوات › ملف قدرات الشركة».");e.code="ai-disabled";throw e}
  const c=need(id),first=opts.model||c.model,tries=[first,...(opts.model?[]:PV().fallbackModels(c.provider,first,c.models))];let last=null;
  /* FOUNDATION §3.0‑9 (ui/core/ai-guard.js): identifiers and the company's own names leave as tokens, the answer is un-masked here,
     and every call — ok, error or blocked — is one row of the AI trace log; a blocked request throws before anything is sent */
  const g=SK.aiGuard&&SK.aiGuard.open?await SK.aiGuard.open(body,{provider:c.provider,model:first,purpose:opts.purpose,userNote:opts.userNote}):null;
  if(g)body=g.body;
  for(const model of tries){
    const w=PV().buildRequest(c.provider,body,model,c.key);
    try{const data=await send(w.url,{method:"POST",headers:w.headers,body:JSON.stringify(w.body)},opts.timeout,opts.signal,c.provider);
      if(model!==first){setConf({model},c.provider);toast("النموذج «"+first+"» غير متاح الآن — أكمل «"+model+"» واعتُمد لهذا الجهاز","info")}
      const out=PV().toGeminiResponse(c.provider,data);return g?g.done(out,model):out}
    catch(e){last=e;if(!(e&&e.status&&PV().retryWithOtherModel(e.status))||(opts.signal&&opts.signal.aborted)){if(g)g.fail(e,model);throw e}}
  }
  if(g)g.fail(last,tries[tries.length-1]);
  throw last;
}
async function generate(body,opts={}){
  return generateFor(provider(),body,opts);
}
async function models(){
  const c=need(),r=PV().modelsRequest(c.provider,c.key);
  const list=PV().modelsFrom(c.provider,await send(r.url,{method:"GET",headers:r.headers},30000,undefined,c.provider));
  if(list.length)setConf({models:list});
  return list;
}
async function test(){
  const d=await generate(aiEng()?aiEng().PING_BODY:{contents:[{role:"user",parts:[{text:"جاهز؟"}]}]},{timeout:60000});
  setConf({checked:new Date().toISOString()});
  const t=aiEng()?aiEng().extractText(d).text:"";return t||"تم";
}

function cardHTML(){
  const c=conf(),masked=c.key?c.key.slice(0,4)+"••••"+c.key.slice(-4):"",pv=P(c.provider);
  const tabs=Object.values(PV().PROVIDERS).map(x=>'<button type="button" data-skai-p="'+x.id+'" aria-pressed="'+(x.id===c.provider)+'">'+esc(x.ar)+(conf(x.id).key?' ✓':'')+'</button>').join("");
  return '<section class="card skai" data-skai><div class="card-h"><div><h3>المراجع الذكي — '+esc(c.label)+'</h3><p>'+(c.key?'المفتاح مضبوط ('+esc(masked)+')'+(c.checked?' · آخر اختبار '+esc(c.checked.slice(0,10)):''):'ضع مفتاح API من Gemini أو OpenAI أو Claude ليعمل مراجعاً: يراجع الميزان ويطلب المستندات ويقيّمها على جولات، ويصوغ التقارير المنشورة.')+'</p></div>'+
    '<span class="skai-dot '+(c.key?'on':'')+'" aria-hidden="true"></span></div><div class="card-b">'+
    '<div class="sk-seg skai-pv" role="group" aria-label="مزود الذكاء الاصطناعي">'+tabs+'</div>'+
    '<div class="sk-grid2"><label class="sk-field"><span>مفتاح API — '+esc(pv.ar)+'</span><input type="password" autocomplete="off" spellcheck="false" data-skai-key placeholder="'+(c.key?'اتركه فارغاً للإبقاء على المفتاح الحالي':esc(pv.keyHint))+'"></label>'+
    '<label class="sk-field"><span>النموذج</span><select data-skai-model>'+c.models.map(m=>'<option'+(m===c.model?' selected':'')+'>'+esc(m)+'</option>').join("")+(c.models.includes(c.model)?'':'<option selected>'+esc(c.model)+'</option>')+'</select></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary sm" data-skai-a="save">حفظ</button><button type="button" class="btn sm" data-skai-a="test"'+(c.key?'':' disabled')+'>اختبار الاتصال</button>'+
    '<button type="button" class="btn sm" data-skai-a="models"'+(c.key?'':' disabled')+'>تحديث قائمة النماذج</button>'+(c.key?'<button type="button" class="btn sm danger" data-skai-a="clear">حذف المفتاح</button>':'')+
    '<a class="btn sm" href="'+esc(pv.keyLink)+'" target="_blank" rel="noopener">الحصول على مفتاح</a></div>'+
    '<p class="hint">يبقى المفتاح على هذا الجهاز فقط ولا يدخل في النسخة الكاملة ولا في النقل بين الأجهزة. يُرسل الميزان والمستندات التي ترفعها مباشرة إلى '+esc(pv.ar)+' عند تشغيل كل جولة أو صياغة تقرير.</p></div></section>';
}
function bindCard(node,onChange){
  node.addEventListener("click",async e=>{
    const pb=e.target.closest("[data-skai-p]");
    if(pb&&node.contains(pb)){setProvider(pb.dataset.skaiP);const card=pb.closest("[data-skai]");if(card)card.outerHTML=cardHTML();onChange&&onChange();return}
    const b=e.target.closest("[data-skai-a]");if(!b||!node.contains(b))return;
    const card=b.closest("[data-skai]"),a=b.dataset.skaiA,kin=card.querySelector("[data-skai-key]"),min=card.querySelector("[data-skai-model]"),c=conf();
    if(a==="save"){const k=String(kin.value||"").trim();if(k&&!P(c.provider).keyPattern.test(k)){toast("صيغة مفتاح "+c.label+" غير صحيحة","bad");return}
      setConf({...(k?{key:k}:{}),model:min.value});toast("حُفظ إعداد "+c.label,"ok");onChange&&onChange();return}
    if(a==="clear"){if(!await SK.confirm("حذف مفتاح "+c.label+" من هذا الجهاز؟",{danger:true,ok:"حذف"}))return;const o=read();delete o[c.provider];write(o);toast("حُذف المفتاح","ok");onChange&&onChange();return}
    b.disabled=true;const old=b.textContent;b.textContent="…";
    try{
      if(a==="test"){setConf({model:min.value});const t=await test();toast(c.label+" يعمل: "+String(t).slice(0,40),"ok")}
      if(a==="models"){const l=await models();toast(l.length?"وُجد "+l.length+" نموذجاً":"لم تُرجع القائمة نماذج","ok")}
      onChange&&onChange();
    }catch(err){toast(err.message,"bad")}finally{b.disabled=false;b.textContent=old}
  });
}
window.SKosifAI=Object.freeze({ready:()=>!!(PV()&&conf().key),conf,provider,setProvider,providers:()=>PV()?Object.values(PV().PROVIDERS):[],configured:()=>PV()?Object.keys(PV().PROVIDERS).filter(id=>!!conf(id).key):[],setModel:m=>setConf({model:m}),generate,generateFor,models,test,cardHTML,bindCard});
})();

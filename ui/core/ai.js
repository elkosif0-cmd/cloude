/* S.kosif core — Gemini with the user's own API key (window.SKosifAI).
   The key and the model are kept on this device only (localStorage «skosif_ai_keys», excluded from
   the full backup and from the iPhone ⇄ laptop transfer by ui/core/store.js); requests go straight
   from the browser to generativelanguage.googleapis.com with the x-goog-api-key header — no server
   of ours sees the key or the documents. Pattern from smart-trial-balance-review (js/gemini.js).
     SKosifAI.ready()            key present?
     SKosifAI.generate(body)     → the API JSON (throws an Arabic message on failure)
     SKosifAI.models()           → the generateContent models this key can use
     SKosifAI.cardHTML() / bindCard(node, onChange)   the settings card used by the review screens */
(()=>{
"use strict";
const {esc,toast}=SK;
const KEY="skosif_ai_keys",BASE="https://generativelanguage.googleapis.com/v1beta/";
const DEFAULT_MODELS=["gemini-2.5-flash","gemini-2.5-pro","gemini-2.5-flash-lite"];
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{return {}}};
const write=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch{toast("تعذر حفظ الإعداد على هذا الجهاز","bad")}};
const conf=()=>{const o=read().gemini||{};return{key:String(o.key||""),model:String(o.model||DEFAULT_MODELS[0]),models:Array.isArray(o.models)&&o.models.length?o.models:DEFAULT_MODELS,checked:o.checked||""}};
const setConf=patch=>{const o=read();o.gemini={...conf(),...patch};write(o)};
const eng=()=>window.SKEngines&&SKEngines.audit.aiReview;
const errText=(status,msg)=>eng()?eng().friendlyError(status,msg):"خطأ "+status+(msg?": "+msg:"");

async function call(path,init,timeoutMs){
  const c=conf();if(!c.key)throw new Error("لم يُضبط مفتاح Gemini بعد — أدخله في بطاقة «المراجع الذكي».");
  const ac=new AbortController(),t=setTimeout(()=>ac.abort(),timeoutMs||180000);
  if(init&&init.signal)init.signal.addEventListener("abort",()=>ac.abort(),{once:true});
  let res;
  try{res=await fetch(BASE+path,{...init,signal:ac.signal,headers:{"Content-Type":"application/json","x-goog-api-key":c.key,...(init&&init.headers||{})}})}
  catch{clearTimeout(t);throw new Error(ac.signal.aborted?"أُلغي الطلب أو تجاوز المهلة.":errText(0))}
  clearTimeout(t);
  let data=null;try{data=await res.json()}catch{}
  if(!res.ok)throw new Error(errText(res.status,data&&data.error&&data.error.message||""));
  return data;
}
function generate(body,opts={}){
  const model=opts.model||conf().model;
  return call("models/"+encodeURIComponent(model)+":generateContent",{method:"POST",body:JSON.stringify(body),signal:opts.signal},opts.timeout);
}
async function models(){
  const data=await call("models?pageSize=200",{method:"GET"},30000);
  const list=(data&&data.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes("generateContent")).map(m=>String(m.name||"").replace(/^models\//,"")).filter(n=>/^gemini/.test(n)&&!/embedding|aqa|tts|image|live/.test(n));
  if(list.length)setConf({models:list.sort((a,b)=>b.localeCompare(a,"en"))});
  return list;
}
async function test(){
  const d=await generate(eng()?eng().PING_BODY:{contents:[{role:"user",parts:[{text:"جاهز؟"}]}]},{timeout:30000});
  setConf({checked:new Date().toISOString()});
  const t=eng()?eng().extractText(d).text:"";return t||"تم";
}

function cardHTML(){
  const c=conf(),masked=c.key?c.key.slice(0,4)+"••••"+c.key.slice(-4):"";
  return '<section class="card skai" data-skai><div class="card-h"><div><h3>المراجع الذكي — Gemini</h3><p>'+(c.key?'المفتاح مضبوط ('+esc(masked)+')'+(c.checked?' · آخر اختبار '+esc(c.checked.slice(0,10)):''):'ضع مفتاح Gemini API الخاص بك ليعمل Gemini مراجعاً: يراجع الميزان ويطلب المستندات ويقيّمها على جولات.')+'</p></div>'+
    '<span class="skai-dot '+(c.key?'on':'')+'" aria-hidden="true"></span></div><div class="card-b">'+
    '<div class="sk-grid2"><label class="sk-field"><span>مفتاح API</span><input type="password" autocomplete="off" spellcheck="false" data-skai-key placeholder="'+(c.key?'اتركه فارغاً للإبقاء على المفتاح الحالي':'AIza…')+'"></label>'+
    '<label class="sk-field"><span>النموذج</span><select data-skai-model>'+c.models.map(m=>'<option'+(m===c.model?' selected':'')+'>'+esc(m)+'</option>').join("")+(c.models.includes(c.model)?'':'<option selected>'+esc(c.model)+'</option>')+'</select></label></div>'+
    '<div class="sk-actions"><button type="button" class="btn primary sm" data-skai-a="save">حفظ</button><button type="button" class="btn sm" data-skai-a="test"'+(c.key?'':' disabled')+'>اختبار الاتصال</button>'+
    '<button type="button" class="btn sm" data-skai-a="models"'+(c.key?'':' disabled')+'>تحديث قائمة النماذج</button>'+(c.key?'<button type="button" class="btn sm danger" data-skai-a="clear">حذف المفتاح</button>':'')+
    '<a class="btn sm" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">الحصول على مفتاح</a></div>'+
    '<p class="hint">يبقى المفتاح على هذا الجهاز فقط ولا يدخل في النسخة الكاملة ولا في النقل بين الأجهزة. يُرسل الميزان والمستندات التي ترفعها مباشرة إلى Google Gemini عند تشغيل كل جولة.</p></div></section>';
}
function bindCard(node,onChange){
  node.addEventListener("click",async e=>{
    const b=e.target.closest("[data-skai-a]");if(!b||!node.contains(b))return;
    const card=b.closest("[data-skai]"),a=b.dataset.skaiA,kin=card.querySelector("[data-skai-key]"),min=card.querySelector("[data-skai-model]");
    if(a==="save"){const k=String(kin.value||"").trim();if(k&&!/^[\w-]{20,}$/.test(k)){toast("صيغة المفتاح غير صحيحة","bad");return}
      setConf({...(k?{key:k}:{}),model:min.value});toast("حُفظ إعداد Gemini","ok");onChange&&onChange();return}
    if(a==="clear"){if(!await SK.confirm("حذف مفتاح Gemini من هذا الجهاز؟",{danger:true,ok:"حذف"}))return;const o=read();delete o.gemini;write(o);toast("حُذف المفتاح","ok");onChange&&onChange();return}
    b.disabled=true;const old=b.textContent;b.textContent="…";
    try{
      if(a==="test"){setConf({model:min.value});const t=await test();toast("Gemini يعمل: "+String(t).slice(0,40),"ok")}
      if(a==="models"){const l=await models();toast(l.length?"وُجد "+l.length+" نموذجاً":"لم تُرجع القائمة نماذج","ok")}
      onChange&&onChange();
    }catch(err){toast(err.message,"bad")}finally{b.disabled=false;b.textContent=old}
  });
}
window.SKosifAI=Object.freeze({ready:()=>!!conf().key,conf,setModel:m=>setConf({model:m}),generate,models,test,cardHTML,bindCard});
})();

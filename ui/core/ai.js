/* S.kosif core — the AI reviewer with the user's own API key (window.SKosifAI): Google Gemini, OpenAI or Anthropic Claude.
   The key and the model are kept on this device only (localStorage «skosif_ai_keys», excluded from the full backup and
   from the iPhone ⇄ laptop transfer by ui/core/store.js); requests go straight from the browser to the chosen provider —
   no server of ours sees the key or the documents. Features build every request in the Gemini shape and read the Gemini
   answer shape; SKEngines.audit.aiProviders translates both ways for OpenAI and Claude.
     SKosifAI.ready()            key present for the chosen provider?
     SKosifAI.generate(body)     → the answer in the Gemini shape (throws an Arabic message on failure)
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

async function send(url,init,timeoutMs,signal){
  const ac=new AbortController(),t=setTimeout(()=>ac.abort(),timeoutMs||180000);
  if(signal)signal.addEventListener("abort",()=>ac.abort(),{once:true});
  let res;
  try{res=await fetch(url,{...init,signal:ac.signal})}
  catch{clearTimeout(t);throw new Error(ac.signal.aborted?"أُلغي الطلب أو تجاوز المهلة.":PV().friendlyError(provider(),0))}
  clearTimeout(t);
  let data=null;try{data=await res.json()}catch{}
  if(!res.ok)throw new Error(PV().friendlyError(provider(),res.status,PV().errorMessage(data)));
  return data;
}
function need(){const c=conf();if(!c.key)throw new Error("لم يُضبط مفتاح "+c.label+" بعد — أدخله في بطاقة «المراجع الذكي».");return c}
async function generate(body,opts={}){
  const c=need(),model=opts.model||c.model,w=PV().buildRequest(c.provider,body,model,c.key);
  const data=await send(w.url,{method:"POST",headers:w.headers,body:JSON.stringify(w.body)},opts.timeout,opts.signal);
  return PV().toGeminiResponse(c.provider,data);
}
async function models(){
  const c=need(),r=PV().modelsRequest(c.provider,c.key);
  const list=PV().modelsFrom(c.provider,await send(r.url,{method:"GET",headers:r.headers},30000));
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
window.SKosifAI=Object.freeze({ready:()=>!!(PV()&&conf().key),conf,provider,setProvider,providers:()=>PV()?Object.values(PV().PROVIDERS):[],setModel:m=>setConf({model:m}),generate,models,test,cardHTML,bindCard});
})();

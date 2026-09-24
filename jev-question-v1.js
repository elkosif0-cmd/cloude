/* Aghnam Alwadi — Ask Jev section v1 */
(()=> {
  const API="https://aghnam-jev-api.kosif199022.workers.dev";
  const SKEY="aghnamJevSession";
  let askMode="noul";
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function screenState(){
    const el=document.querySelector(".maincol")||document.querySelector(".main")||document.body;
    let t=(el?.innerText||"").replace(/\n{3,}/g,"\n\n").trim();
    if(t.length>10000)t=t.slice(0,10000)+"\n…";
    return "سؤال Jev داخل تطبيق أغنام الوادي\nالشاشة: "+(document.title||"أغنام الوادي")+"\nالمسار: "+location.hash+"\n\n"+t;
  }
  function resultSummary(r){
    const a=r?.answers?.decision||r?.decision||r;
    if(a?.type==="noul" && typeof a.noul==="number"){
      const yes=Math.round(a.noul*100), no=100-yes;
      return {headline:yes>=50?"نعم":"لا",detail:"نعم "+yes+"٪ · لا "+no+"٪"};
    }
    if(a?.type==="choice"){
      const chosen=a.choice??a.answer??a.selected??a.label;
      const confidence=a.confidence;
      return {headline:chosen!=null?String(chosen):"تم اختيار أحد البدائل",detail:typeof confidence==="number"?"الثقة "+Math.round(confidence*100)+"٪":""};
    }
    return {headline:"تمت المعالجة",detail:""};
  }
  function html(){
    return [
      '<section class="jev-ask-section" id="jev-ask-section">',
      '<div class="jev-ask-heading"><div><b>سؤال Jev</b><span>اسأل سؤالًا مباشرًا أو أعطه عدة اختيارات</span></div><span class="jev-ask-badge">JEV</span></div>',
      '<div class="jev-ask-mode" role="tablist" aria-label="نوع السؤال">',
      '<button type="button" class="active" data-ask-mode="noul">نعم / لا</button>',
      '<button type="button" data-ask-mode="choice">اختيارات متعددة</button>',
      '</div>',
      '<div class="jev-ask-field"><label for="jev-ask-q">السؤال</label><textarea id="jev-ask-q" placeholder="مثال: هل أحتاج لرفع سعر هذا الصنف؟"></textarea></div>',
      '<div class="jev-ask-field" id="jev-ask-options-wrap" hidden><label for="jev-ask-options">الاختيارات <small>— اختيار في كل سطر، من 2 إلى 12</small></label><textarea id="jev-ask-options" placeholder="رفع السعر 5٪\nالإبقاء على السعر\nعمل عرض ترويجي"></textarea></div>',
      '<label class="jev-ask-context"><input id="jev-ask-screen" type="checkbox" checked><span>استخدم بيانات الشاشة الحالية مع السؤال</span></label>',
      '<button type="button" id="jev-ask-send" class="jev-ask-send">اسأل Jev</button>',
      '<div id="jev-ask-status" class="jev-ask-status"></div>',
      '<div id="jev-ask-result" class="jev-ask-result"><span>إجابة Jev</span><strong id="jev-ask-answer"></strong><small id="jev-ask-detail"></small><details><summary>عرض التفاصيل</summary><pre id="jev-ask-json"></pre></details></div>',
      '</section>'
    ].join("");
  }
  function setMode(mode){
    askMode=mode==="choice"?"choice":"noul";
    document.querySelectorAll("[data-ask-mode]").forEach(b=>b.classList.toggle("active",b.dataset.askMode===askMode));
    const wrap=document.getElementById("jev-ask-options-wrap");
    if(wrap)wrap.hidden=askMode!=="choice";
    const q=document.getElementById("jev-ask-q");
    if(q)q.placeholder=askMode==="choice"?"مثال: ما أفضل قرار لهذا الصنف؟":"مثال: هل السعر الحالي مناسب؟";
  }
  async function run(){
    const q=document.getElementById("jev-ask-q")?.value.trim();
    const status=document.getElementById("jev-ask-status");
    const result=document.getElementById("jev-ask-result");
    const btn=document.getElementById("jev-ask-send");
    if(!q){status.textContent="اكتب السؤال أولًا.";return}
    const token=sessionStorage.getItem(SKEY);
    if(!token){status.innerHTML='<span class="jev-ask-error">Jev غير مفعّل لهذه الجلسة. أعد الدخول للتطبيق من شاشة كلمة المرور.</span>';return}
    const state=document.getElementById("jev-ask-screen")?.checked ? screenState() : "سؤال مباشر داخل تطبيق أغنام الوادي";
    const payload={type:askMode,instructions:q,state};
    if(askMode==="noul"){
      payload.true_criteria="نعم: الأدلة المتاحة تؤيد السؤال أو القرار";
      payload.false_criteria="لا: الأدلة المتاحة لا تؤيد السؤال أو القرار";
    }else{
      const options=document.getElementById("jev-ask-options").value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
      if(options.length<2){status.textContent="اكتب اختيارين على الأقل، كل اختيار في سطر.";return}
      if(options.length>12){status.textContent="الحد الأقصى 12 اختيارًا.";return}
      payload.criteria=Object.fromEntries(options.map(x=>[x,null]));
    }
    btn.disabled=true; status.textContent="Jev يراجع السؤال…"; result.classList.remove("show");
    try{
      const r=await fetch(API+"/api/jev",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+token},body:JSON.stringify(payload)});
      const d=await r.json();
      if(!r.ok||!d.ok)throw new Error(d.error||"تعذر تشغيل Jev");
      const s=resultSummary(d.result);
      document.getElementById("jev-ask-answer").textContent=s.headline;
      document.getElementById("jev-ask-detail").textContent=s.detail;
      document.getElementById("jev-ask-json").textContent=JSON.stringify(d.result,null,2);
      result.classList.add("show"); status.textContent="تمت الإجابة."; window.dispatchEvent(new CustomEvent("jev:decision",{detail:{source:"سؤال Jev",type:askMode,question:q,summary:[s.headline,s.detail].filter(Boolean).join(" — "),result:d.result}}));
    }catch(e){status.innerHTML='<span class="jev-ask-error">'+esc(e.message||e)+'</span>'}finally{btn.disabled=false}
  }
  function install(){
    const panel=document.querySelector("#jev-modal .jev-panel");
    if(!panel||document.getElementById("jev-ask-section"))return;
    const presets=panel.querySelector(".jev-presets");
    if(presets)presets.insertAdjacentHTML("beforebegin",html()); else panel.querySelector(".jev-head")?.insertAdjacentHTML("afterend",html());
    document.querySelectorAll("[data-ask-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.askMode)));
    document.getElementById("jev-ask-send")?.addEventListener("click",run);
    setMode("noul");
  }
  function boot(){install();const obs=new MutationObserver(()=>install());obs.observe(document.documentElement,{subtree:true,childList:true});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.AskJev={open:(mode="noul")=>{window.JevApp?.open?.();setTimeout(()=>{install();setMode(mode);document.getElementById("jev-ask-q")?.focus()},50)},version:"1.0"};
})();
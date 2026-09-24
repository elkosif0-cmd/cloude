/* Aghnam Alwadi — Jev Decision Center v1 */
(()=> {
  const API="https://aghnam-jev-api.kosif199022.workers.dev";
  const SKEY="aghnamJevSession";
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function currentContext(){
    const el=document.querySelector(".maincol")||document.querySelector(".main")||document.body;
    let t=(el?.innerText||"").replace(/\n{3,}/g,"\n\n").trim();
    if(t.length>11000)t=t.slice(0,11000)+"\n…";
    return "الشاشة الحالية: "+(document.title||"أغنام الوادي")+"\nالمسار: "+location.hash+"\n\n"+t;
  }
  function shell(){
    if(document.getElementById("jev-fab"))return;
    document.body.insertAdjacentHTML("beforeend",`
      <button id="jev-fab" type="button" aria-label="Jev"><span>Jev<small>قرار</small></span></button>
      <div class="jev-backdrop" id="jev-modal" aria-hidden="true">
        <section class="jev-panel" role="dialog" aria-modal="true" aria-labelledby="jev-title">
          <div class="jev-head"><div class="jev-mark">J</div><div class="jev-title"><b id="jev-title">مركز قرارات Jev</b><span>قرار احتمالي مساعد — وليس مصدر حقيقة</span></div><button class="jev-close" type="button" aria-label="إغلاق">×</button></div>
          <div class="jev-presets">
            <button class="jev-chip" data-preset="pricing">التسعير</button><button class="jev-chip" data-preset="stock">المخزون</button><button class="jev-chip" data-preset="customers">العملاء</button><button class="jev-chip" data-preset="custom">سؤال مخصص</button>
          </div>
          <div class="jev-types">
            <button class="jev-type active" data-type="noul">نعم / لا</button><button class="jev-type" data-type="choice">اختيار</button><button class="jev-type" data-type="score">تقييم</button>
          </div>
          <div class="jev-field"><label>السؤال / القرار المطلوب</label><textarea id="jev-q" placeholder="مثال: هل السعر الحالي مناسب مقارنة بالتكلفة والهدر والهامش؟"></textarea></div>
          <div class="jev-field" id="jev-criteria-wrap"><label id="jev-criteria-label">معيار نعم / لا (اختياري)</label><textarea id="jev-criteria" placeholder="نعم: الهامش آمن ولا توجد إشارة خطر&#10;لا: الهامش ضعيف أو توجد مخاطرة واضحة"></textarea></div>
          <label class="jev-context-row"><input id="jev-use-screen" type="checkbox" checked> <span>استخدم بيانات الشاشة الحالية كدليل للقرار</span></label>
          <div class="jev-note">عند التفعيل، يُرسل إلى Jev فقط النص الظاهر في الشاشة الحالية بحد أقصى محدد. لا يتم إرسال كلمة مرور التطبيق.</div>
          <div class="jev-actions"><button class="jev-run" id="jev-run" type="button">حلّل مع Jev</button><button class="jev-secondary" id="jev-clear" type="button">مسح</button></div>
          <div class="jev-status" id="jev-status"></div>
          <div class="jev-result" id="jev-result"><h4>نتيجة Jev</h4><div class="big" id="jev-big"></div><pre id="jev-json"></pre></div>
        </section>
      </div>`);
    bind();
  }
  let type="noul";
  function setType(t){
    type=t;
    document.querySelectorAll(".jev-type").forEach(b=>b.classList.toggle("active",b.dataset.type===t));
    const lab=document.getElementById("jev-criteria-label"),ta=document.getElementById("jev-criteria");
    if(t==="noul"){lab.textContent="معيار نعم / لا (اختياري)";ta.placeholder="نعم: ...\\nلا: ...";}
    if(t==="choice"){lab.textContent="الخيارات — خيار في كل سطر";ta.placeholder="رفع السعر\\nالإبقاء على السعر\\nتخفيض السعر";}
    if(t==="score"){lab.textContent="سلم التقييم — من الأدنى للأعلى";ta.placeholder="ضعيف جدًا\\nضعيف\\nمتوسط\\nجيد\\nممتاز";}
  }
  function preset(p){
    const q=document.getElementById("jev-q"),c=document.getElementById("jev-criteria");
    document.querySelectorAll(".jev-chip").forEach(b=>b.classList.toggle("active",b.dataset.preset===p));
    if(p==="pricing"){setType("noul");q.value="هل السعر الحالي مناسب ويحقق هامشًا آمنًا بالنظر إلى التكلفة والهدر والبيانات الظاهرة؟";c.value="نعم: السعر يغطي التكلفة والهدر ويترك هامشًا مقبولًا دون إشارة خطر واضحة\\nلا: الهامش غير كافٍ أو توجد مخاطرة تسعير واضحة";}
    else if(p==="stock"){setType("choice");q.value="ما الإجراء الأنسب للمخزون الظاهر حاليًا؟";c.value="إعادة طلب عاجلة\\nإعادة طلب طبيعية\\nمراقبة دون طلب\\nتصفية أو عرض ترويجي";}
    else if(p==="customers"){setType("score");q.value="قيّم جودة وفرصة قاعدة العملاء الظاهرة حاليًا من حيث النشاط والقيمة وإمكانية إعادة الشراء.";c.value="ضعيفة جدًا\\nضعيفة\\nمتوسطة\\nجيدة\\nممتازة";}
    else{setType("noul");q.value="";c.value="";}
  }
  function summary(r){
    const a=r?.answers?.decision||r?.decision||r;
    if(a?.type==="noul" && typeof a.noul==="number") return "احتمال نعم: "+Math.round(a.noul*100)+"٪";
    if(a?.type==="choice"){
      const chosen=a.choice??a.answer??a.selected;
      return chosen!=null?"الاختيار: "+chosen:"تم إرجاع اختيار من Jev";
    }
    if(a?.type==="score"){
      const s=a.score??a.value;
      return s!=null?"التقييم: "+s:"تم إرجاع تقييم من Jev";
    }
    return "تمت المعالجة";
  }
  async function run(){
    const status=document.getElementById("jev-status"),res=document.getElementById("jev-result"),big=document.getElementById("jev-big"),pre=document.getElementById("jev-json"),btn=document.getElementById("jev-run");
    const token=sessionStorage.getItem(SKEY);
    if(!token){status.innerHTML='<span class="jev-offline">Jev غير مفعّل لهذه الجلسة. أغلق التطبيق وافتحه من شاشة كلمة المرور مرة أخرى.</span>';return}
    const instructions=document.getElementById("jev-q").value.trim();
    if(!instructions){status.textContent="اكتب السؤال أولًا.";return}
    const raw=document.getElementById("jev-criteria").value.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    const payload={type,instructions,state:document.getElementById("jev-use-screen").checked?currentContext():"قرار داخل تطبيق أغنام الوادي"};
    if(type==="noul"){
      const yes=raw.find(x=>/^نعم\s*[:：]/.test(x)),no=raw.find(x=>/^لا\s*[:：]/.test(x));
      if(yes)payload.true_criteria=yes.replace(/^نعم\s*[:：]\s*/,"");
      if(no)payload.false_criteria=no.replace(/^لا\s*[:：]\s*/,"");
    } else if(type==="choice"){
      payload.criteria=Object.fromEntries(raw.map(x=>[x,null]));
    } else payload.criteria=raw;
    btn.disabled=true;status.textContent="Jev يحلل القرار…";res.classList.remove("show");
    try{
      const r=await fetch(API+"/api/jev",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+token},body:JSON.stringify(payload)});
      const d=await r.json();
      if(!r.ok||!d.ok)throw new Error(d.error||"تعذر تشغيل Jev");
      const resultText=summary(d.result);big.textContent=resultText;pre.textContent=JSON.stringify(d.result,null,2);res.classList.add("show");status.textContent="تم — استخدم النتيجة كمساعد قرار وراجع الأرقام القطعية.";window.dispatchEvent(new CustomEvent("jev:decision",{detail:{source:"مركز قرارات Jev",type,question:instructions,summary:resultText,result:d.result}}));
    }catch(e){status.innerHTML='<span class="jev-offline">'+esc(e.message||e)+'</span>'}finally{btn.disabled=false}
  }
  function bind(){
    const modal=document.getElementById("jev-modal");
    document.getElementById("jev-fab").onclick=()=>{modal.classList.add("open");modal.setAttribute("aria-hidden","false")};
    modal.querySelector(".jev-close").onclick=()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true")};
    modal.addEventListener("click",e=>{if(e.target===modal)modal.querySelector(".jev-close").click()});
    document.querySelectorAll(".jev-type").forEach(b=>b.onclick=()=>setType(b.dataset.type));
    document.querySelectorAll(".jev-chip").forEach(b=>b.onclick=()=>preset(b.dataset.preset));
    document.getElementById("jev-run").onclick=run;
    document.getElementById("jev-clear").onclick=()=>{document.getElementById("jev-q").value="";document.getElementById("jev-criteria").value="";document.getElementById("jev-result").classList.remove("show");document.getElementById("jev-status").textContent=""};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",shell,{once:true});else shell();
  window.JevApp={open:(presetName)=>{shell();document.getElementById("jev-modal").classList.add("open");if(presetName)preset(presetName)},version:"1.0"};
})();
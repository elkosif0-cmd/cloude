/* S.kosif V34 — Jazarti-inspired Arabic Sales Matcher + PWA Update UX
   Additive module. Does not mutate catalog or core business records.
   Manual corrections are stored as local aliases and reused in future matching. */
(()=>{
  "use strict";
  if(window.SKosifSalesMatching)return;
  const VER="34.0", ALIAS_KEY="skosif_v34_product_aliases";
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const num=v=>{let s=String(v??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬,\s]/g,"").replace("٫",".");const n=Number(s);return Number.isFinite(n)?n:0};
  const money=v=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v)||0)+" ر.س";
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
  function toast(msg){let t=$("#sk-toast");if(!t){document.body.insertAdjacentHTML("beforeend",'<div id="sk-toast" class="sk-toast"></div>');t=$("#sk-toast")}t.textContent=msg;t.classList.add("show");clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove("show"),3000)}

  /* ---------- Arabic NLP from Jazarti, adapted to current catalog ---------- */
  function normDigits(text){return String(text??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d))}
  function normalizeArabic(text){
    return normDigits(text)
      .replace(/[\u064B-\u065F\u0670\u0640]/g,"")
      .replace(/[أإآٱ]/g,"ا")
      .replace(/ى/g,"ي")
      .replace(/ة/g,"ه")
      .replace(/[^\w\s\u0600-\u06FF-]/g," ")
      .replace(/\s+/g," ").trim().toLowerCase();
  }
  function similarity(a,b){
    const x=normalizeArabic(a),y=normalizeArabic(b);
    if(!x||!y)return 0;
    if(x===y)return 100;
    if(x.includes(y)||y.includes(x)){
      const mn=Math.min(x.length,y.length),mx=Math.max(x.length,y.length);
      return Math.round(75+25*(mn/mx));
    }
    const A=new Set(x.split(" ").filter(t=>t.length>1)),B=new Set(y.split(" ").filter(t=>t.length>1));
    if(!A.size||!B.size)return 0;
    let inter=0;A.forEach(t=>{if(B.has(t))inter++});
    const union=new Set([...A,...B]).size;
    return Math.round(union?inter/union*100:0);
  }
  function catalog(){
    try{return window.SKosifCore?.catalog?.()||{items:[]}}catch{return {items:[]}}
  }
  function aliases(){return load(ALIAS_KEY,{})}
  function bestMatch(query){
    const items=(catalog().items||[]).filter(x=>x.status!=="archived");
    const n=normalizeArabic(query),map=aliases();
    if(map[n]){
      const it=items.find(x=>String(x.id)===String(map[n]));
      if(it)return {item:it,score:100,reason:"اسم مستعار محفوظ",normalized:n};
    }
    let best=null,score=0;
    for(const it of items){const s=similarity(query,it.name);if(s>score){score=s;best=it}}
    const reason=score>=90?"مطابقة ممتازة":score>=70?"مطابقة جيدة جدًا":score>=50?"مطابقة تقريبية — راجعها":"ثقة منخفضة";
    return {item:score>=35?best:null,score,reason,normalized:n};
  }

  /* ---------- POS text parsing ---------- */
  function splitLine(line){
    if(line.includes("\t"))return line.split("\t").map(x=>x.trim());
    if(line.includes(";"))return line.split(";").map(x=>x.trim());
    // CSV-ish: keep product text before last 1-2 numeric columns
    const p=line.split(",").map(x=>x.trim());
    return p;
  }
  let input="",rows=[];
  function parse(){
    rows=input.split(/\r?\n/).map((line,i)=>{
      const c=splitLine(line).filter((x,j)=>j===0||x!=="");
      if(!c[0])return null;
      // skip likely header
      if(i===0&&/(الصنف|المنتج|item|product|description)/i.test(c[0]))return null;
      const raw=c[0], q=c.length>=3?num(c[1]):1, amount=c.length>=3?num(c[2]):num(c[1]);
      const m=bestMatch(raw);
      return {id:"m"+i+"-"+Date.now(),raw,qty:q||1,amount,match:m.item,score:m.score,reason:m.reason,normalized:m.normalized,manual:false};
    }).filter(Boolean);
    render();
  }
  function setAlias(rowId,targetId){
    const r=rows.find(x=>x.id===rowId);if(!r)return;
    const it=(catalog().items||[]).find(x=>String(x.id)===String(targetId));
    if(!it)return;
    const a=aliases();a[r.normalized]=String(it.id);save(ALIAS_KEY,a);
    r.match=it;r.score=100;r.reason="تصحيح يدوي محفوظ";r.manual=true;
    render();toast("تم حفظ المطابقة؛ سيستخدمها S.kosif تلقائيًا لاحقًا.");
  }
  function pareto(){
    const by=new Map();
    rows.filter(r=>r.match&&r.amount>0).forEach(r=>{
      const k=String(r.match.id),cur=by.get(k)||{id:k,name:r.match.name,amount:0,qty:0};
      cur.amount+=r.amount;cur.qty+=r.qty;by.set(k,cur);
    });
    const list=[...by.values()].sort((a,b)=>b.amount-a.amount),total=list.reduce((a,x)=>a+x.amount,0);
    let cum=0;
    return list.map(x=>{cum+=x.amount;const share=total?cum/total*100:0;return {...x,cum:share,cls:share<=80?"A":share<=95?"B":"C"}});
  }

  /* ---------- UI ---------- */
  function html(){
    const p=pareto(),matched=rows.filter(r=>r.match),high=rows.filter(r=>r.score>=80),low=rows.filter(r=>r.score<50);
    const items=(catalog().items||[]).filter(x=>x.status!=="archived");
    return [
      '<div class="sk34-head"><div><b>مطابقة المبيعات العربية الذكية</b><span>Arabic POS Matcher · Aliases · Confidence · Pareto ABC</span></div><i>J34</i></div>',
      '<p class="sk33-note sk34-note">الصق بيانات الكاشير بصيغة <b>الصنف، الكمية، المبلغ</b> أو Tab/semicolon. يتم توحيد الهمزات والياء والتاء المربوطة والتشكيل والأرقام العربية قبل المطابقة. أي تصحيح يدوي تحفظه يصبح اسمًا مستعارًا للمرة القادمة.</p>',
      '<div class="sk34-grid"><div class="sk34-input"><label class="sk-field"><span>بيانات المبيعات</span><textarea id="sk34-input" rows="10" class="sk33-ta" placeholder="نعيمي كامل&#9;2&#9;1199.00">'+esc(input)+'</textarea></label>',
      '<div class="sk-actions"><button id="sk34-run" class="sk-primary" type="button">مطابقة ذكية</button><button id="sk34-sample" class="sk-secondary" type="button">نموذج</button></div></div>',
      '<div class="sk34-summary"><div class="sk-kpis">'+
        kpi("أسطر معالجة",rows.length)+kpi("مطابقة",matched.length,matched.length===rows.length&&rows.length?"good":"")+kpi("ثقة ≥ 80٪",high.length,rows.length&&high.length/rows.length>.7?"good":"")+kpi("تحتاج مراجعة",low.length,low.length?"warn":"good")+
      '</div><div class="sk34-help"><b>كيف تتعلم المطابقة؟</b><span>إذا كان «ك لحم نعيمي» يقصد «نعيمي فاخر»، اختر الصنف الصحيح مرة واحدة. S.kosif يحفظ الربط على جهازك ويعطيه 100٪ لاحقًا.</span></div></div></div>',
      rows.length?'<div class="sk34-list">'+rows.map(r=>rowHTML(r,items)).join("")+'</div>':'<div class="sk-empty">لا توجد بيانات معالجة بعد.</div>',
      p.length?paretoHTML(p):"",
      aliasHTML(items),
      rows.length?'<div class="sk-actions sk34-footer"><button id="sk34-export" class="sk-secondary" type="button">تصدير النتائج CSV الآمن</button><button id="sk34-clear" class="sk-secondary" type="button">مسح النتائج</button></div>':""
    ].join("");
  }
  function kpi(a,b,c=""){return '<div class="sk-kpi '+c+'"><span>'+a+'</span><b>'+b+'</b></div>'}
  function rowHTML(r,items){
    const cls=r.score>=80?"high":r.score>=50?"mid":"low";
    return '<article class="sk34-match '+cls+'"><div class="sk34-original"><small>النص الأصلي</small><b>'+esc(r.raw)+'</b><span>'+r.qty+' وحدة · '+money(r.amount)+'</span></div>'+
      '<div class="sk34-arrow">←</div><div class="sk34-target"><small>اقتراح S.kosif</small><b>'+(r.match?esc(r.match.name):"لا توجد مطابقة")+'</b><span>'+esc(r.reason)+'</span></div>'+
      '<div class="sk34-score"><b>'+r.score+'٪</b><span>'+(r.manual?"محفوظ":"ثقة")+'</span></div>'+
      '<label class="sk34-override"><span>تصحيح يدوي</span><select data-sk34-row="'+esc(r.id)+'"><option value="">اختر الصنف…</option>'+items.map(x=>'<option value="'+esc(x.id)+'"'+(r.match&&String(r.match.id)===String(x.id)?' selected':'')+'>'+esc(x.name)+'</option>').join("")+'</select></label></article>';
  }
  function paretoHTML(p){
    return '<section class="sk34-pareto"><div class="sk-section-title"><b>تحليل Pareto ABC</b><span>من المبيعات الملصقة بعد المطابقة</span></div>'+
      '<div class="sk34-abc"><div><b>A</b><span>حتى 80٪ من الإيراد — رقابة أعلى</span></div><div><b>B</b><span>80–95٪ — متابعة متوسطة</span></div><div><b>C</b><span>الباقي — راقب الركود</span></div></div>'+
      '<div class="sk-table-wrap"><table class="sk-table"><thead><tr><th>الصنف</th><th>الكمية</th><th>المبيعات</th><th>التراكمي</th><th>ABC</th></tr></thead><tbody>'+
      p.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+x.qty+'</td><td>'+money(x.amount)+'</td><td>'+x.cum.toFixed(1)+'٪</td><td><span class="sk34-class c'+x.cls+'">'+x.cls+'</span></td></tr>').join("")+
      '</tbody></table></div></section>';
  }
  function aliasHTML(items){
    const a=aliases(),entries=Object.entries(a);
    if(!entries.length)return "";
    return '<details class="sk34-alias"><summary>الأسماء المستعارة المحفوظة ('+entries.length+')</summary><div>'+
      entries.map(([n,id])=>{const it=items.find(x=>String(x.id)===String(id));return '<p><span>'+esc(n)+'</span><b>← '+esc(it?.name||id)+'</b><button type="button" data-sk34-alias-del="'+esc(n)+'">×</button></p>'}).join("")+
      '</div><button id="sk34-alias-clear" class="sk-secondary" type="button">مسح كل الأسماء المستعارة</button></details>';
  }
  function bind(){
    const run=()=>{input=$("#sk34-input")?.value||"";parse()};
    $("#sk34-run")?.addEventListener("click",run);
    $("#sk34-sample")?.addEventListener("click",()=>{
      const it=(catalog().items||[]).filter(x=>x.status!=="archived").slice(0,4);
      input=it.map((x,i)=>(i===0?x.name.replace(/ة/g,"ه"):x.name)+"\t"+(i+1)+"\t"+((x.price||50)*(i+1)).toFixed(2)).join("\n");
      rows=[];render();
    });
    $$("[data-sk34-row]").forEach(s=>s.onchange=()=>{if(s.value)setAlias(s.dataset.sk34Row,s.value)});
    $$("[data-sk34-alias-del]").forEach(b=>b.onclick=()=>{const a=aliases();delete a[b.dataset.sk34AliasDel];save(ALIAS_KEY,a);render()});
    $("#sk34-alias-clear")?.addEventListener("click",()=>{if(confirm("مسح كل الأسماء المستعارة المحفوظة؟")){save(ALIAS_KEY,{});render()}});
    $("#sk34-clear")?.addEventListener("click",()=>{input="";rows=[];render()});
    $("#sk34-export")?.addEventListener("click",()=>{
      const out=rows.map(r=>[r.raw,r.qty,r.amount,r.match?.name||"",r.score,r.reason,r.manual?"نعم":"لا"]);
      if(window.SKosifSafeCSV?.download)window.SKosifSafeCSV.download("S.kosif-sales-match.csv",["النص الأصلي","الكمية","المبلغ","الصنف المطابق","الثقة ٪","سبب المطابقة","تصحيح يدوي"],out);
      else toast("مكوّن CSV الآمن غير جاهز.");
    });
  }
  function render(){
    const body=$("#sk-body");if(!body)return;
    body.innerHTML=html();bind();
    document.querySelector(".sk-panel")?.scrollTo?.({top:0,behavior:"smooth"});
  }
  function open(){
    window.SKosif?.open?.("overview");
    attach();
    document.querySelectorAll(".sk-tabs button").forEach(b=>b.classList.remove("active"));
    $("#sk34-tab")?.classList.add("active");
    render();
  }
  function attach(){
    const tabs=$(".sk-tabs");if(!tabs)return false;
    if(!$("#sk34-tab")){
      const b=document.createElement("button");b.type="button";b.id="sk34-tab";b.dataset.sk34Tab="smartmatch";b.textContent="مطابقة المبيعات";b.onclick=open;
      const salesGroup=tabs.querySelector('.sk33-group[data-g="المبيعات والعملاء"]');
      (salesGroup||tabs).appendChild(b);
    }
    return true;
  }
  /* Add to mobile section launcher generated by V33 without editing its code. */
  document.addEventListener("click",e=>{
    if(!e.target.closest(".sk33-menu"))return;
    setTimeout(()=>{
      const w=$("#sk33-launch");if(!w||w.querySelector("[data-sk34-go]"))return;
      const sections=[...w.querySelectorAll("section")];
      const sec=sections.find(x=>/المبيعات والعملاء/.test(x.querySelector("h5")?.textContent||""))||sections[0];
      const grid=sec?.querySelector("div");if(!grid)return;
      grid.insertAdjacentHTML("beforeend",'<button type="button" data-sk34-go><i>≋</i><b>مطابقة المبيعات</b><small>Arabic POS Matcher & Pareto</small></button>');
      $("[data-sk34-go]",w).onclick=()=>{w.remove();open()};
    },30);
  },true);

  /* ---------- PWA update experience from Jazarti ---------- */
  let waiting=null, controllerChanged=false;
  function banner(){
    if($("#sk34-update"))return;
    document.body.insertAdjacentHTML("afterbegin",'<div id="sk34-update" class="sk34-update"><div><b>يتوفر تحديث جديد لـ S.kosif</b><span>يمكن تطبيق النسخة الجديدة الآن بدون حذف بيانات الجهاز.</span></div><button id="sk34-update-now" type="button">تحديث الآن</button><button id="sk34-update-x" type="button" aria-label="إخفاء">×</button></div>');
    $("#sk34-update-x").onclick=()=>$("#sk34-update")?.remove();
    $("#sk34-update-now").onclick=()=>{
      sessionStorage.setItem("skosif_v34_reload","1");
      if(waiting)waiting.postMessage({type:"SKIP_WAITING"});
      else location.reload();
    };
  }
  async function watchSW(){
    if(!("serviceWorker" in navigator))return;
    /* أول زيارة: لا يوجد متحكم سابق، فتسلّم عامل الخدمة الأول ليس «تحديثاً» */
    const hadController=!!navigator.serviceWorker.controller;
    try{
      const reg=await navigator.serviceWorker.getRegistration();
      if(!reg)return;
      if(reg.waiting){waiting=reg.waiting;banner()}
      reg.addEventListener("updatefound",()=>{
        const nw=reg.installing;if(!nw)return;
        nw.addEventListener("statechange",()=>{if(nw.state==="installed"&&navigator.serviceWorker.controller){waiting=nw;banner()}});
      });
      navigator.serviceWorker.addEventListener("controllerchange",()=>{
        if(controllerChanged||!hadController)return;controllerChanged=true;
        if(sessionStorage.getItem("skosif_v34_reload")==="1"){sessionStorage.removeItem("skosif_v34_reload");location.reload()}
        else banner();
      });
    }catch{}
  }

  function init(){
    let n=0;const t=setInterval(()=>{if(attach()||++n>40)clearInterval(t)},250);
    watchSW();
    window.SKosifSalesMatching=Object.freeze({version:VER,open,normalizeArabic,similarity,bestMatch,aliases});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
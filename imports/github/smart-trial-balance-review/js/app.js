/* ============================================================
   app.js — إدارة الحالة والتبويبات والحفظ المحلي وربط الوحدات
   ============================================================ */
"use strict";

const LS_SETTINGS="stbr_settings_v1";
const LS_SESSION="stbr_session_v1";

const App={
  state:{
    settings:{apiKey:"",model:"gemini-2.5-flash",maxRounds:6},
    entity:{name:"",period:"",currency:"ريال سعودي"},
    tb:null,
    rounds:[],          // تُدار عبر BoardEngine
    finalReport:null,
    finalizeMode:false
  },

  saveSettings(){
    try{ localStorage.setItem(LS_SETTINGS,JSON.stringify(this.state.settings)); }catch(e){}
  },
  /* تحفظ الجلسة دون الملفات الثنائية (تبقى في الذاكرة فقط) */
  saveSession(){
    try{
      const s={entity:this.state.entity,tb:this.state.tb,
        rounds:this.state.rounds.map(r=>({n:r.n,ts:r.ts,status:r.status,result:r.result,
          docs:(r.docs||[]).map(d=>({file:d.file,requestId:d.requestId}))})),
        finalReport:this.state.finalReport};
      localStorage.setItem(LS_SESSION,JSON.stringify(s));
    }catch(e){}
  },
  loadPersisted(){
    try{
      const st=JSON.parse(localStorage.getItem(LS_SETTINGS)||"null");
      if(st) Object.assign(this.state.settings,st);
      const se=JSON.parse(localStorage.getItem(LS_SESSION)||"null");
      if(se){
        this.state.entity=Object.assign(this.state.entity,se.entity||{});
        this.state.tb=se.tb||null;
        this.state.rounds=(se.rounds||[]).map(r=>({...r,docs:[]}));
        this.state.finalReport=se.finalReport||null;
      }
    }catch(e){}
  },
  resetSession(keepSettings=true){
    localStorage.removeItem(LS_SESSION);
    this.state.tb=null; this.state.rounds=[]; this.state.finalReport=null;
    if(!keepSettings){ localStorage.removeItem(LS_SETTINGS); this.state.settings={apiKey:"",model:"gemini-2.5-flash",maxRounds:6}; }
    location.reload();
  }
};

/* ============ أدوات عامة ============ */
function esc(s){ const d=document.createElement("div"); d.textContent=s==null?"":String(s); return d.innerHTML; }
function $(id){ return document.getElementById(id); }

/* ============ التبويبات ============ */
function switchTab(name){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.dataset.tab===name));
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="view-"+name));
  window.scrollTo({top:0});
}

/* ============ عرض معيار (المودال) ============ */
function showStandard(code,itemName){
  const s=StdDB.byCode[code]; if(!s) return;
  let rel = s.relation;
  if(itemName && App.state.tb){
    const it=App.state.tb.items.find(i=>i.name===itemName);
    const lnk=it&&(it.links||TBMap.mapItem(it.name)).find(l=>l.code===code);
    if(lnk&&lnk.reason) rel=lnk.reason;
    else if(itemName) rel=`علاقة «${itemName}» بـ ${code}: ${s.relation}`;
  }
  $("modalContent").innerHTML=`
    <h2>${esc(s.code)} — ${esc(s.ar)}</h2>
    <div class="en-name">${esc(s.en)}</div>
    <div class="meta-row">
      <span class="meta-pill"><b>آخر تطوير:</b> ${esc(s.lastUpdate)}</span>
      <span class="meta-pill"><b>التصنيف:</b> ${s.code.startsWith("IAS")?"معايير المحاسبة الدولية (IAS)":"معايير التقرير المالي الدولية (IFRS)"}</span>
    </div>
    <section><h4>🎯 دوره في المحاسبة</h4><p>${esc(s.purpose)}</p></section>
    <section class="rel-box"><h4>🔗 علاقته بالبند</h4><p>${esc(rel)}</p></section>
    <section class="src-links"><h4>🌐 المصادر الرسمية</h4>
      <ul class="plainlist">
        <li><a href="${esc(s.source)}" target="_blank" rel="noopener">${esc(s.source)}</a></li>
        <li><a href="${esc(s.soocpa)}" target="_blank" rel="noopener">الهيئة السعودية للمراجعين والمحاسبين (SOCPA)</a></li>
      </ul></section>`;
  $("modalBack").classList.remove("hidden");
}
window.AppShowStd=showStandard;

/* ============ الرئيسية: إدخال الميزان ============ */
function setParseStatus(html){ $("parseStatus").innerHTML=html; }

async function handleTBFile(file){
  setParseStatus("<span class='hint'>⏳ جارٍ قراءة الملف…</span>");
  try{
    const items=await TBParse.parseFile(file);
    if(!items.length) throw new Error("لم يُمكن استخراج أي صف صالح — تأكد من وجود عمود اسم حساب وأعمدة مدين/دائن.");
    acceptTB(TBParse.fromItems(items),`✅ تم قراءة ${items.length} بندًا من «${file.name}»`);
  }catch(e){ setParseStatus(`<span class='badge-bad'>⚠️ ${esc(e.message)}</span>`); }
}
function acceptTB(tb,msg){
  tb.items.forEach(i=>i.links=TBMap.mapItem(i.name));
  App.state.tb=tb; App.saveSession();
  setParseStatus(`<div style="margin-top:6px">
    <span class="${tb.balanced?'badge-ok':'badge-bad'}">${tb.balanced?"✅ الميزان متوازن":"❌ غير متوازن"}</span> —
    مدين: <strong>${TBMap.fmt(tb.totals.debit)}</strong> · دائن: <strong>${TBMap.fmt(tb.totals.credit)}</strong>
    <span class="muted">(${msg})</span><br>
    <button class="btn primary" style="margin-top:8px" onclick="switchTab('standards')">عرض البنود والمعايير ←</button></div>`);
  renderStandardsView();
}
function loadSample(){
  $("inpEntity").value=$("inpEntity").value||"شركة الواحة للتجارة";
  $("inpPeriod").value=$("inpPeriod").value||"السنة المنتهية في 31/12/2025";
  syncEntity();
  const tb=TBParse.sample();
  acceptTB(tb,"نموذج تجريبي متوازن — يمكنك تجربة المجلس فورًا");
  switchTab("standards");
}
function parsePastedText(){
  const txt=$("pasteArea").value.trim();
  if(!txt) return;
  const items=TBParse.parseDelimited(txt);
  if(!items.length) return setParseStatus("<span class='badge-bad'>⚠️ تعذر تحليل النص الملصوق — تأكد من الفواصل بين الأعمدة.</span>");
  acceptTB(TBParse.fromItems(items),"لصق يدوي");
}
function syncEntity(){
  App.state.entity={name:$("inpEntity").value.trim(),period:$("inpPeriod").value.trim(),currency:$("inpCurrency").value.trim()||"ريال سعودي"};
  App.saveSession();
}

/* ============ تبويب المعايير: الجدول والمستكشف ============ */
function renderStandardsView(){
  const tb=App.state.tb;
  const sumRow=$("tbSummaryRow");
  if(!tb){ sumRow.innerHTML="<div class='card hint' style='text-align:center;padding:30px'>لم يُدخل ميزان المراجعة بعد — عد إلى الرئيسية.</div>"; return; }
  sumRow.innerHTML="";
  const card=document.createElement("div"); card.className="card";
  card.style.cssText="display:flex;gap:18px;flex-wrap:wrap;align-items:center;font-size:.85rem";
  card.innerHTML=`<strong>🏢 ${esc(App.state.entity.name||"منشأة")}</strong>
    <span>📅 ${esc(App.state.entity.period||"—")}</span>
    <span>مدين: <strong>${TBMap.fmt(tb.totals.debit)}</strong></span>
    <span>دائن: <strong>${TBMap.fmt(tb.totals.credit)}</strong></span>
    <span class="${tb.balanced?'badge-ok':'badge-bad'}">${tb.balanced?"متوازن ✓":"غير متوازن ✗"}</span>`;
  sumRow.appendChild(card);

  const tbody=$("tbTable").querySelector("tbody");
  tbody.textContent="";
  tb.items.forEach((it,i)=>{
    const tr=document.createElement("tr");
    const c1=document.createElement("td");c1.textContent=i+1;
    const c2=document.createElement("td");c2.textContent=it.name;c2.style.fontWeight="600";
    const c3=document.createElement("td");c3.className="num";c3.textContent=it.debit?TBMap.fmt(it.debit):"—";
    const c4=document.createElement("td");c4.className="num";c4.textContent=it.credit?TBMap.fmt(it.credit):"—";
    const c5=document.createElement("td");
    (it.links||[]).forEach(l=>{
      const ch=document.createElement("span"); ch.className="chip"; ch.textContent=l.code;
      ch.title=l.code+" — اضغط للتفاصيل"; ch.dataset.std=l.code; ch.dataset.item=it.name;
      c5.appendChild(ch); c5.appendChild(document.createTextNode(" "));
    });
    const c6=document.createElement("td");
    const b=document.createElement("span"); b.className="cat-badge"; b.textContent=it.cat||TBMap.classifyItem(it.name);
    c6.appendChild(b);
    [c1,c2,c3,c4,c5,c6].forEach(c=>tr.appendChild(c));
    tbody.appendChild(tr);
  });
  renderExplorer("");
}
let searchTimer=null;
function renderExplorer(q){
  const wrap=$("stdList"); wrap.textContent="";
  StdDB.search(q).forEach(s=>{
    const d=document.createElement("div"); d.className="std-item";
    d.innerHTML=`<span class="code">${esc(s.code)}</span> <span class="nm">${esc(s.ar)}</span>
      <small>${esc(s.tags.join(" · "))}</small>`;
    d.onclick=()=>showStandard(s.code);
    wrap.appendChild(d);
  });
  if(!StdDB.search(q).length){ const p=document.createElement("p"); p.className="muted"; p.textContent="لا نتائج مطابقة."; wrap.appendChild(p);}
}

/* ============ الإعدادات ============ */
function fillSettingsUI(){
  $("inpApiKey").value=App.state.settings.apiKey||"";
  $("selModel").value=App.state.settings.model;
  $("inpMaxRounds").value=App.state.settings.maxRounds;
  ["inpEntity","inpPeriod","inpCurrency"].forEach(id=>{
    const map={inpEntity:"name",inpPeriod:"period",inpCurrency:"currency"};
    $(id).value=App.state.entity[map[id]]||"";
  });
}
function persistSettings(){
  App.state.settings={apiKey:$("inpApiKey").value.trim(),model:$("selModel").value,maxRounds:Math.max(1,Math.min(10,+$("inpMaxRounds").value||6))};
  App.saveSettings();
}

/* ============ تصدير/استيراد الجلسة ============ */
function exportSession(){
  const payload={app:"smart-tb-review",exportedAt:new Date().toISOString(),
    entity:App.state.entity,tb:App.state.tb,
    rounds:App.state.rounds.map(r=>({n:r.n,ts:r.ts,status:r.status,result:r.result,
      docsMeta:(r.docs||[]).map(d=>d.file.name)})),
    finalReport:App.state.finalReport};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download="جلسة-مراجعة-"+Date.now()+".json"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
}
function importSession(file){
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const j=JSON.parse(rd.result);
      if(j.entity)App.state.entity=j.entity;
      if(j.tb)App.state.tb=j.tb;
      if(j.rounds)App.state.rounds=j.rounds.map(r=>({...r,docs:[]}));
      App.state.finalReport=j.finalReport||null;
      App.saveSession(); refreshAll();
      alert("تم استيراد الجلسة (ملفات المستندات الأصلية لا تُستعاد).");
    }catch(e){ alert("ملف غير صالح."); }
  };
  rd.readAsText(file,"utf-8");
}
function refreshAll(){ fillSettingsUI(); renderStandardsView(); BoardEngine.render(); ReportEngine.render(); }

/* ============ التشغيل ============ */
document.addEventListener("DOMContentLoaded",()=>{
  App.loadPersisted();

  // التبويبات
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>switchTab(t.dataset.tab)));
  $("btnGoBoard").addEventListener("click",()=>{ syncEntity(); switchTab("board"); });

  // الرئيسية
  $("btnPickFile").onclick=()=>$("fileTB").click();
  $("fileTB").addEventListener("change",e=>{ if(e.target.files[0]) handleTBFile(e.target.files[0]); });
  const dz=$("dropZone");
  ["dragover","dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{
    e.preventDefault(); dz.classList.toggle("dragover",ev==="dragover");
    if(ev==="drop"&&e.dataTransfer.files[0]) handleTBFile(e.dataTransfer.files[0]);
  }));
  $("btnSample").onclick=loadSample;
  $("btnPasteTB").onclick=()=>{ $("pasteArea").classList.toggle("hidden"); };
  $("pasteArea").addEventListener("change",parsePastedText);
  ["inpEntity","inpPeriod","inpCurrency"].forEach(id=>$(id).addEventListener("change",syncEntity));

  // المعايير
  $("stdSearch").addEventListener("input",e=>{
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>renderExplorer(e.target.value),150);
  });

  // المودال
  $("modalClose").onclick=()=>$("modalBack").classList.add("hidden");
  $("modalBack").addEventListener("click",e=>{ if(e.target===$("modalBack")) $("modalBack").classList.add("hidden"); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape")$("modalBack").classList.add("hidden"); });

  // مجلس المراجعة
  $("btnStartReview").onclick=()=>{
    if(!App.state.settings.apiKey){ alert("ضبط مفتاح Gemini من تبويب ⚙️ الإعدادات أولًا."); switchTab("settings"); return; }
    syncEntity();
    BoardEngine.runNextRound([]);
  };
  $("btnForceReport").onclick=()=>BoardEngine.finalize();

  // الإعدادات
  ["inpApiKey","selModel","inpMaxRounds"].forEach(id=>$(id).addEventListener("change",persistSettings));
  $("btnTestKey").onclick=async ()=>{
    persistSettings();
    const st=$("keyStatus"); st.innerHTML="<span class='hint'>⏳ جارٍ اختبار الاتصال…</span>";
    try{
      await GeminiAI.testKey();
      st.innerHTML="<span class='badge-ok'>✅ الاتصال ناجح — مجلس المراجعين جاهز.</span>";
    }catch(e){ st.innerHTML=`<span class='badge-bad'>❌ ${esc(e.message)}</span>`; }
  };
  $("btnResetSession").onclick=()=>{ if(confirm("سيتم حذف كل شيء (بما فيه المفتاح). متابعة؟")) App.resetSession(false); };

  // جلسة
  $("btnExportSession").onclick=exportSession;
  $("fileImportSession").addEventListener("change",e=>{ if(e.target.files[0]) importSession(e.target.files[0]); });

  refreshAll();

  // إن كان هنالك مفتاح وميزان محفوظان → انتقل مباشرة للميزان
  if(App.state.tb && !App.state.finalReport) switchTab("standards");
});

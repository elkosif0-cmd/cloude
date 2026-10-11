/* ============================================================
   مجلس المراجعين — محرك الجولات والمستندات
   الجولة الأولى: مراجعة الميزان → طلب مستندات
   المستخدم يرفقها → جولة ثانية تتحقق منها وقد تطلب غيرها… حتى complete
   ============================================================ */
(function(){
"use strict";

const REVIEWERS = [
  {id:"tech", name:"المراجع الفني المحاسبي", cls:"tech"},
  {id:"comp", name:"مراجع الامتثال للمعايير والإفصاح", cls:"comp"},
  {id:"risk", name:"مدقق المخاطر والأدلة", cls:"risk"}
];

/* ---------- أدوات ---------- */
function esc(s){ const d=document.createElement("div"); d.textContent=s==null?"":String(s); return d.innerHTML; }
function fmtN(n){ return TBMap.fmt(n); }
function log(msg,cls){ const a=document.createElement("div"); a.className="alert "+(cls||"err"); a.textContent=msg;
  document.getElementById("boardAlerts").appendChild(a);
  setTimeout(()=>a.remove(),12000); }

/* ---------- بناء نص الميزان للموجّه ---------- */
function tbToText(){
  const tb = App.state.tb; if(!tb) return "";
  const lines = tb.items.map(it=>{
    const links=(it.links||TBMap.mapItem(it.name)).map(l=>l.code).join("+");
    return `- ${it.name} | مدين ${fmtN(it.debit)} | دائن ${fmtN(it.credit)} | تصنيف: ${it.cat} | معايير: ${links}`;
  });
  return ["ميزان المراجعة ("+tb.items.length+" بندًا):", ...lines,
    `المجاميع: مدين ${fmtN(tb.totals.debit)} / دائن ${fmtN(tb.totals.credit)} — ${tb.balanced?"متوازن":"غير متوازن!"}`].join("\n");
}

function standardsCheatSheet(codes){
  const uniq=[...new Set(codes.filter(Boolean))];
  return uniq.map(c=>{ const s=StdDB.byCode[c]; return s?`- ${c} (${s.ar}): ${s.purpose}`:`- ${c}`; }).join("\n") || "- (لا شيء)";
}

/* ---------- ملخص الجولات السابقة ---------- */
function priorRoundsText(idx){
  if(!idx) return "هذه الجولة الأولى.";
  const txt = App.state.rounds.slice(0,idx).map(r=>{
    const res=r.result||{};
    const f=(res.findings||[]).map(x=>`  • [${x.severity}] ${x.accountName}: ${x.comment}`).join("\n");
    const d=(res.requestedDocuments||[]).map(x=>{
      const v=(res.documentsReviewed||[]).find(vv=>vv.requestId===x.id);
      return `  • ${x.id}: ${x.title}${v?` ← استُلم «${v.fileName||""}» بحكم: ${v.verdict} (${v.notes||""})`:" ← لم يستلم بعد"}`;
    }).join("\n");
    return [`— الجولة ${r.n} (الحالة: ${res.status}):`,
      `ملخص المجلس: ${res.executiveSummary||""}`,
      res.findings&&res.findings.length?`ملاحظات:\n${f}`:"",
      res.requestedDocuments&&res.requestedDocuments.length?`طلبات المستندات:\n${d}`:""
    ].filter(Boolean).join("\n");
  }).join("\n\n");
  return `سجل الجولات السابقة:\n${txt}\n`;
}

/* ---------- المستندات المرفقة في جولة سابقة ---------- */
function collectNewDocParts(fromRound){
  // كل المستندات المرتبطة بالجولات حتى منRound-1 ولم تُقدَّم لأي نداء سابقًا
  const parts=[]; const listed=[];
  App.state.rounds.forEach(r=>{
    if(r.n>fromRound || !r.docs) return;
    r.docs.forEach(d=>{
      if(d.sent) return;
      d.sent=true;
      if(d.part) parts.push(d.part);
      listed.push(`${d.file.name} (${Math.round(d.file.size/1024)}KB)${d.requestId?" ⟵ يستجيب لـ "+d.requestId:""}`);
      // اقتباس نصي إن توفّر مقتطف نصي (CSV/TXT/XLSX)
      if(d.textPart){ parts.push({text:`مستند بصيغة نصية (${d.file.name}):\n${d.textPart}`}); d.textSent=true; }
    });
  });
  return {parts, listed};
}

async function fileToDoc(file, requestId){
  const doc={file:{name:file.name,type:file.type||"",size:file.size}, requestId:requestId||"", sent:false};
  const lower=file.name.toLowerCase();
  try{
    if(file.type.startsWith("image/")){
      doc.part={inlineData:{mimeType:file.type, data:await b64(file)}};
    } else if(lower.endsWith(".pdf")||file.type==="application/pdf"){
      if(file.size>15*1024*1024) throw new Error("حجم PDF كبير (>15MB)");
      doc.part={inlineData:{mimeType:"application/pdf", data:await b64(file)}};
    } else if(/\.(xlsx|xls)$/.test(lower)){
      const items=await TBParse.parseFile(file);
      doc.textPart=items.slice(0,80).map(i=>`${i.name}\t${i.debit}\t${i.credit}`).join("\n")
        || "(جدول فارغ أو غير قابل للقراءة)";
    } else {
      let t=await file.text();
      if(t.length>60000) t=t.slice(0,60000)+"\n...(مقتطع)";
      doc.textPart=`--- ${file.name} ---\n${t}`;
    }
  }catch(e){ doc.error=e.message; }
  return doc;
}
function b64(file){
  return new Promise((ok,no)=>{ const r=new FileReader();
    r.onload=()=>ok(String(r.result).split(",")[1]); r.onerror=no; r.readAsDataURL(file); });
}

/* ---------- تشغيل جولة ---------- */
let running=false;

async function runNextRound(suppliedDocs){
  if(running) return;
  if(!App.state.tb){ alert("أدخل ميزان المراجعة أولًا."); return; }
  if(App.state.finalReport){ alert("صدر التقرير النهائي بالفعل — صفّر الجلسة للبدء من جديد."); return; }

  // إلحاق المستندات بالجولة الحالية الأخيرة (إن وجدت) قبل الجولة الجديدة
  const prevPending = App.state.rounds[App.state.rounds.length-1];
  if(suppliedDocs && suppliedDocs.length && prevPending){
    const docs=[];
    for(const f of suppliedDocs){
      if(f.size>25*1024*1024){ log(`تم تجاهل «${f.name}» لأنه أكبر من 25MB`, "warn"); continue; }
      docs.push(await fileToDoc(f));
    }
    if(docs.length) prevPending.docs=(prevPending.docs||[]).concat(docs);
  }

  const idx=App.state.rounds.length;
  const n=idx+1;
  const lastStatus = prevPending && prevPending.result ? prevPending.result.status : null;
  if(lastStatus==="complete"){
    log("أقرّ المجلس اكتمال المراجعة في الجولة السابقة — انتقل إلى تبويب التقرير النهائي أو أصدره بضغطة «إنهاء وإصدار التقرير».", "warn");
    return;
  }
  if(n > App.state.settings.maxRounds){
    log(`بلغتَ الحد الأقصى (${App.state.settings.maxRounds}) من الجولات — يمكنك «إنهاء وإصدار التقرير الآن».`, "warn");
    render();
    return;
  }
  running=true; render();

  // تجهيز الأجزاء
  const newDocs = collectNewDocParts(n-1);
  const linkedCodes = [];
  App.state.tb.items.forEach(i=>(i.links||TBMap.mapItem(i.name)).forEach(l=>linkedCodes.push(l.code)));

  const prompt=[
    `جولة المراجعة رقم ${n} من أقصى ${App.state.settings.maxRounds}.`,
    "",
    tbToText(),
    "",
    "بطاقات المعايير المعنية بالبنود:",
    standardsCheatSheet(linkedCodes),
    "",
    priorRoundsText(n-1),
    newDocs.listed.length?
      ("مستندات جديدة رفعها العميل في هذه الجولة ليدققها المجلس:\n"+newDocs.listed.map((s,i)=>`${i+1}. ${s}`).join("\n"))
      : "",
    n===1
      ? "المطلوب: راجعوا ميزان المراجعة كاملًا اعتمادًا على ما هو متاح؛ حددوا الملاحظات، وأصدروا آراء المجلس، ثم قرروا: هل تكفي هذه البيانات أم تحتاجون مستندات إضافية محددة؟"
      : "المطلوب: تدقيقوا المستندات الجديدة مقابل طلباتكم السابقة (documentsReviewed)، حدثوا آراءكم، وأنجزوا أي ملاحظات متبقية، ثم قرروا: complete إذا اكتفت الأدلة، أو needs_docs مع طلبات جديدة محددة."
  ].filter(x=>x!=="").join("\n\n");

  const round={n, ts:new Date().toISOString(), status:"running", docs:[], result:null};
  App.state.rounds.push(round);

  try{
    const result = await GeminiAI.call({
      apiKey:App.state.settings.apiKey,
      model:App.state.settings.model,
      system:GeminiAI.boardSystem(App.state.entity.name, App.state.entity.period, App.state.entity.currency),
      parts:[{text:prompt}, ...newDocs.parts],
      schema:GeminiAI.SCHEMA_ROUND
    });
    if(!result) throw new Error("تعذر تحليل استجابة النموذج كـ JSON — أعد المحاولة.");
    round.result=result;
    round.status=result.status;
    // حفظ المعرّفات المقترحة لعرضها في القوائم القادمة
  }catch(e){
    round.status="error"; round.error=e.message;
    log("فشلت الجولة "+n+": "+e.message);
  }
  running=false;
  render();
}

/* ---------- الإنهاء والتقرير النهائي ---------- */
async function finalize(){
  if(!App.state.rounds.length) return alert("شغّل جولة مراجعة واحدة على الأقل قبل التقرير.");
  if(App.state.finalReport || running) return;
  running=true; render();
  const hist=priorRoundsText(App.state.rounds.length);
  try{
    const rep = await GeminiAI.call({
      apiKey:App.state.settings.apiKey, model:App.state.settings.model,
      system:GeminiAI.boardSystem(App.state.entity.name, App.state.entity.period, App.state.entity.currency)+
        "\nأنت الآن تكتب «التقرير الختامي» الرسمي لمجلس المراجعين انطلاقًا من سجل الجولات.",
      parts:[{text:["اكتب التقرير الختامي للمراجعة.", hist,
        "كن موضوعاً؛ لا تبدّل خطورة الملاحظات التي لم تعالج؛ ذكر القيود صراحة في حال أي نقص أدلة."].join("\n\n")}],
      schema:GeminiAI.SCHEMA_REPORT
    });
    if(!rep) throw new Error("تعذر توليد التقرير (استجابة غير صالحة).");
    App.state.finalReport={ai:rep, ts:new Date().toISOString()};
  }catch(e){ log("فشل توليد التقرير: "+e.message); }
  running=false; render();
  App.renderReport();
}

/* ---------- واجهة العرض ---------- */
function render(){
  const tl=document.getElementById("roundsTimeline");
  const btnStart=document.getElementById("btnStartReview");
  const btnForce=document.getElementById("btnForceReport");
  const lbl=document.getElementById("roundLabel"), fill=document.getElementById("roundMeterFill"),
        hint=document.getElementById("roundHint");

  document.querySelectorAll("#boardAlerts").forEach(()=>{});
  const alerts=document.getElementById("boardAlerts"); while(alerts.firstChild) alerts.removeChild(alerts.firstChild);

  const R=App.state.rounds;
  lbl.textContent = R.length? `الجولة ${R[R.length-1].n} / ${App.state.settings.maxRounds}` : "لم تبدأ المراجعة";
  fill.style.width=(R.length/Math.max(1,App.state.settings.maxRounds)*100)+"%";
  hint.textContent = R.length? (R.some(r=>r.result&&r.result.status==="complete")?"المراجعة اكتملت 🎉":"بانتظار تسليم المستندات أو بدء الجولة التالية") : "";

  btnStart.disabled = running || !App.state.tb || (R.length && R.length>=App.state.settings.maxRounds);
  btnStart.textContent = R.length? "▶️ تقديم المستندات / بدء الجولة التالية":"▶️ بدء الجولة الأولى";
  btnForce.classList.toggle("hidden", !(R.length && !App.state.finalReport));

  tl.textContent="";
  if(!R.length){ const p=document.createElement("p"); p.className="hint";
    p.style.padding="20px"; p.textContent="اضغط «بدء الجولة الأولى» ليقيم المجلس الميزان المرتبط بالمعايير ويحدد ما يحتاجه من مستندات.";
    tl.appendChild(p); return; }

  R.forEach((r,i)=>tl.appendChild(roundCard(r,i)));
  tl.scrollTop=tl.scrollHeight;
}

function roundCard(r,i){
  const li=document.createElement("li");
  li.className="card round-card "+(r.status==="complete"?"complete-round":r.status==="needs_docs"?"pending-docs":r.status==="running"?"loading":"");
  li.id="round-"+r.n;

  const head=document.createElement("div"); head.className="rc-head";
  head.innerHTML=`<span class="rc-num">الجولة ${r.n}</span>`;
  const st=document.createElement("span");
  st.className="rc-status "+(r.status==="complete"?"st-done":r.status==="running"?"st-run":"st-wait");
  st.textContent = r.status==="running"?"⏳ قيد المراجعة…" : r.status==="needs_docs"?"📌 بانتظار مستندات إضافية"
    : r.status==="complete"?"✅ اكتملت المراجعة" : r.status==="error"?"⚠️ خطأ" : "";
  head.appendChild(st);
  if(r.ts){ const t=document.createElement("small"); t.className="muted";
    t.textContent=new Date(r.ts).toLocaleString("ar-SA"); head.appendChild(t);}
  li.appendChild(head);

  if(r.error){ const e=document.createElement("div"); e.className="alert err"; e.textContent=r.error; li.appendChild(e); }

  const res=r.result;
  if(res){
    const q=document.createElement("div"); q.className="summary-quote";
    q.innerHTML=`<strong>⚠️ درجة الخطورة:</strong> <span style="font-weight:900;color:${res.riskScore>=70?'var(--sig)':res.riskScore>=40?'var(--rust)':'var(--low)'}">${esc(res.riskScore)}/100</span><br>${esc(res.executiveSummary)}`;
    li.appendChild(q);

    // آراء المراجعين الثلاثة
    const grid=document.createElement("div"); grid.className="reviewer-grid";
    (res.boardOpinions||[]).forEach(o=>{
      const c=document.createElement("div");
      const rv=REVIEWERS.find(x=>x.name===o.reviewer)||REVIEWERS[0];
      c.className="rev-card "+rv.cls;
      c.innerHTML=`<b class="rn">${esc(o.reviewer)}</b>${esc(o.opinion)}`;
      grid.appendChild(c);
    });
    li.appendChild(grid);

    // نتائج
    if(res.findings&&res.findings.length){
      const h=document.createElement("h3"); h.textContent="🔎 ملاحظات البنود ومعاييرها"; h.style.marginTop="12px"; li.appendChild(h);
      const wrap=document.createElement("div"); wrap.className="table-wrap";
      const t=document.createElement("table");
      t.innerHTML="<thead><tr><th>البند</th><th>المعيار</th><th>النوع</th><th>الخطورة</th><th>الملاحظة</th><th>التوصية</th></tr></thead>";
      const body=document.createElement("tbody");
      res.findings.forEach(f=>{
        const tr=document.createElement("tr");
        const tdA=td(f.accountName), tdS=td(f.standardCode||"—"), tdT=td(f.issueType||""),
              tdV=document.createElement("td"), tdC=td(f.comment), tdR=td(f.recommendation||"");
        tdS.innerHTML = f.standardCode&&StdDB.byCode[f.standardCode]
          ? `<span class="chip" data-std="${esc(f.standardCode)}">${esc(f.standardCode)}</span>` : esc(f.standardCode||"—");
        tdV.innerHTML=`<span class="sev sev-${esc(f.severity||"متوسطة")}">${esc(f.severity)}</span>`;
        [tdA,tdS,tdT,tdV,tdC,tdR].forEach(x=>tr.appendChild(x));
        body.appendChild(tr);
      });
      t.appendChild(body); wrap.appendChild(t); li.appendChild(wrap);
    }

    // تغطية المعايير
    if(res.standardsCoverage&&res.standardsCoverage.length){
      const h=document.createElement("h3"); h.textContent="📚 دور المعايير في هذا الميزان"; h.style.marginTop="12px"; li.appendChild(h);
      res.standardsCoverage.forEach(sc=>{
        const row=document.createElement("div"); row.className="docreq";
        const s=StdDB.byCode[sc.standardCode];
        row.innerHTML=`<div class="dt"><span class="chip" data-std="${esc(sc.standardCode)}">${esc(sc.standardCode)}</span>
          <span>${esc(s?s.ar:sc.relevance||"")} — ${esc(sc.roleInAccount)}</span></div>`;
        li.appendChild(row);
      });
    }

    // مراجعة المستندات المسلمة
    if(res.documentsReviewed&&res.documentsReviewed.length){
      const h=document.createElement("h3"); h.textContent="🗂️ حكم المجلس على المستندات المسلَّمة"; h.style.marginTop="12px"; li.appendChild(h);
      res.documentsReviewed.forEach(dr=>{
        const row=document.createElement("div"); row.className="doc-file-row";
        row.innerHTML=`📄 <strong>${esc(dr.fileName)}</strong> ${dr.requestId?`(طلب ${esc(dr.requestId)})`:""}
          <span class="doc-verdict dv-${esc((dr.verdict||"").replace(/\s/g,""))}">${esc(dr.verdict)}</span>
          <span style="flex:1;color:var(--muted)">${esc(dr.notes||"")}</span>`;
        li.appendChild(row);
      });
    }

    // طلبات المستندات
    if(res.requestedDocuments&&res.requestedDocuments.length){
      const h=document.createElement("h3"); h.textContent="📎 مستندات مطلوبة منك"; h.style.marginTop="12px"; li.appendChild(h);
      res.requestedDocuments.forEach(rd=>{
        const row=document.createElement("div"); row.className="docreq";
        row.innerHTML=`<div style="min-width:55%"><div class="dt">🧾 ${esc(rd.title)} <span class="muted">(${esc(rd.id)})</span></div>
          <div class="dp">${esc(rd.purpose)}${rd.relatedItems&&rd.relatedItems.length? "<br>البنود ذات الصلة: "+esc(rd.relatedItems.join("، ")):""}</div></div>
          <div style="text-align:center"><span class="prio prio-${esc(rd.priority)}">${esc(rd.priority)}</span></div>`;
        li.appendChild(row);
      });

      if(r.n===App.state.rounds.length && r.status==="needs_docs"){
        li.appendChild(uploadBox());
      }
    }

    const g=document.createElement("p"); g.className="hint"; g.style.marginTop="10px";
    g.textContent="🧭 الخطوة التالية: "+res.nextStepGuidance;
    li.appendChild(g);
  }
  return li;

  function td(txt){ const x=document.createElement("td"); x.textContent=txt==null?"":txt; return x; }
}

function uploadBox(){
  const box=document.createElement("div"); box.className="docs-upl";
  const input=document.createElement("input"); input.type="file"; input.multiple=true;
  input.style.display="none";
  input.accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.xlsx,.xls,.docx,application/pdf,image/*";
  box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
    <strong>📤 أرفق المستندات المطلوبة ثم اضغط الزر</strong>
    <span class="hint">PDF / صور / Excel / CSV / TXT — تبقى في ذاكرة هذه الجلسة فقط</span></div>`;
  const dz=document.createElement("div"); dz.className="dz-inner"; dz.style.cssText=
    "border:1.5px dashed var(--line2);border-radius:10px;padding:16px;text-align:center;margin-top:8px;font-size:.85rem;color:var(--muted)";
  dz.textContent="اسحب الملفات هنا أو اضغط للاختيار";
  box.appendChild(dz);
  ["click","dragover","dragleave","drop"].forEach(ev=>{
    dz.addEventListener(ev,(e)=>{
      e.preventDefault();
      if(ev==="dragover"){dz.classList.add("dragover");return;}
      if(ev==="dragleave"){dz.classList.remove("dragover");return;}
      if(ev==="drop"){input.files=e.dataTransfer.files;}
      if(ev==="click"){input.click();}
    });
  });
  box.appendChild(input);
  const bar=document.createElement("div"); bar.className="row-actions";
  const go=document.createElement("button"); go.className="btn primary"; go.textContent="📨 سلّم المستندات وشغّل الجولة التالية";
  go.onclick=()=>runNextRound([...(input.files||[])]);
  const cancel=document.createElement("button"); cancel.className="btn ghost"; cancel.textContent="⏭️ تخطٍ واطلب الجولة بدون مستندات";
  cancel.onclick=()=>runNextRound([]);
  bar.append(go,cancel); box.appendChild(bar);
  return box;
}

/* نقر شارات المعايير داخل بطاقات المجلس */
document.addEventListener("click",(e)=>{
  const chip=e.target.closest(".chip[data-std]");
  if(chip && window.AppShowStd){
    AppShowStd(chip.getAttribute("data-std"), chip.getAttribute("data-item"));
  }
});

window.BoardEngine = { runNextRound, finalize, render, REVIEWERS };
})();

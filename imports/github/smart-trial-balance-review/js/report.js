/* ============================================================
   التقرير النهائي + التحليلات الاحترافية (نسب، رسوم، مصفوفة أدلة)
   ============================================================ */
(function(){
"use strict";

function esc(s){ const d=document.createElement("div"); d.textContent=s==null?"":String(s); return d.innerHTML; }
const fmtN=(n)=>TBMap.fmt(n);

function render(){
  const body=document.getElementById("reportBody");
  const empty=document.getElementById("reportEmpty");
  if(!App.state.finalReport || !App.state.tb){
    empty.classList.remove("hidden"); body.classList.add("hidden"); body.textContent="";
    return;
  }
  empty.classList.add("hidden");
  body.classList.remove("hidden");
  draw(body);
}

function draw(root){
  root.textContent="";
  const rep=App.state.finalReport.ai;
  const tb=App.state.tb;
  const analysis=TBMap.analyze(tb, App.state.entity.currency||"ريال سعودي");

  /* ===== غلاف التقرير ===== */
  const hero=div("rep-hero card");
  hero.innerHTML=`<h2>📑 التقرير الختامي لمجلس المراجعين</h2>
    <p>${esc(App.state.entity.name||"منشأة غير مسمّاة")} — ${esc(App.state.entity.period||"")} — ${esc(App.state.entity.currency||"ريال سعودي")}</p>
    <p class="muted" style="color:#CBB687">صدر بتاريخ ${new Date(App.state.finalReport.ts).toLocaleDateString("ar-SA")} بعد ${App.state.rounds.length} جولة مراجعة</p>
    <span class="opinion">${esc(rep.overallOpinion)}</span>
    <p style="margin-top:10px;color:#EFE2C5">${esc(rep.headline||"")}</p>`;
  root.appendChild(hero);

  /* ===== مؤشرات رئيسية ===== */
  const kpis=div("kpis");
  const riskAvg=Math.round(App.state.rounds.filter(r=>r.result).reduce((s,r)=>s+(r.result.riskScore||0),0)/Math.max(1,App.state.rounds.filter(r=>r.result).length));
  const allFindings=collectFindings();
  const sevCount={"منخفضة":0,"متوسطة":0,"عالية":0,"جسيمة":0};
  allFindings.forEach(f=>{ if(sevCount[f.severity]!=null) sevCount[f.severity]++; });
  const docsReq=App.state.rounds.reduce((s,r)=>s+((r.result&&r.result.requestedDocuments)||[]).length,0);
  const docsDelivered=allDocs().length;
  [[fmtN(tb.totals.debit),"إجمالي أرصدة المدين"],
   [fmtN(tb.totals.credit),"إجمالي أرصدة الدائن"],
   [tb.balanced?"✅ متوازن":"❌ غير متوازن","التوازن المحاسبي"],
   [riskAvg+" /100","متوسط درجة الخطورة"],
   [Object.values(sevCount).reduce((a,b)=>a+b,0),"إجمالي الملاحظات"],
   [docsDelivered+" / "+docsReq,"المستندات المستلمة/المطلوبة"]
  ].forEach(([v,k])=>{
    const c=document.createElement("div"); c.className="kpi";
    c.innerHTML=`<div class="v">${esc(v)}</div><div class="k">${esc(k)}</div>`;
    kpis.appendChild(c);
  });
  root.appendChild(kpis);

  /* ===== الرسوم التحليلية ===== */
  const grid=div("charts-grid");
  mkChart(grid,"توزيع الملاحظات حسب الخطورة","bar-sev");
  mkChart(grid,"أكبر عشرة أرصدة في الميزان","bar-bal");
  mkChart(grid,"تطور درجة الخطورة عبر الجولات","line-risk");
  root.appendChild(grid);

  /* ===== النسب المالية ===== */
  const secRatios=div("report-section");
  secRatios.innerHTML=`<h3 style="color:var(--gold-dark)">📈 النسب والمؤشرات الاحترافية
    <small class="muted">(محسوبة آليًا من تصنيف بنود ميزانك — استراحة تحليلية)</small></h3>`;
  const rt=document.createElement("table");
  rt.innerHTML="<thead><tr><th>المؤشر</th><th>القيمة</th><th>طريقة الحساب</th></tr></thead>";
  analysis.ratios.forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td><strong>${esc(r.name)}</strong></td><td class="num">${esc(r.value)}</td><td style="color:var(--muted)">${esc(r.note)}</td>`;
    rt.appendChild(tr);
  });
  secRatios.appendChild(rt);
  root.appendChild(secRatios);

  /* ===== سرد المجلس ===== */
  addSection(root,"🧾 الملخص التنفيذي",`<p style="line-height:2.2">${esc(rep.summary)}</p>`);
  if(rep.keyRisks&&rep.keyRisks.length){
    let html="";
    rep.keyRisks.forEach(k=>{ html+=`<li><strong>${esc(k.title)}:</strong> ${esc(k.detail)}
      ${k.mitigation?`<br><em style="color:var(--teal)">معالجة مقترحة: ${esc(k.mitigation)}</em>`:""}</li>`;});
    addSection(root,"⚠️ أهم المخاطر المرصودة",`<ul class="plainlist">${html}</ul>`);
  }
  if(rep.recommendations&&rep.recommendations.length){
    addSection(root,"✅ التوصيات",`<ol class="plainlist">${rep.recommendations.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`);
  }

  /* ===== مسار الأدلة: الطلبات مقابل المسلَّم ===== */
  const trail=[];
  App.state.rounds.forEach(r=>{
    (r.result&&r.result.requestedDocuments||[]).forEach(rd=>{
      trail.push({n:r.n,...rd});
    });
  });
  if(trail.length){
    const t=document.createElement("table");
    t.innerHTML="<thead><tr><th>جول</th><th>#</th><th>المستند المطلوب</th><th>الأهمية</th><th>الحالة عند إغلاق المراجعة</th></tr></thead>";
    const finalVerdicts={};
    App.state.rounds.forEach(r=>(r.result&&r.result.documentsReviewed||[]).forEach(dv=>{
      if(dv.requestId) finalVerdicts[dv.requestId]={verdict:dv.verdict,file:dv.fileName};
    }));
    trail.forEach(td_=>{
      const v=finalVerdicts[td_.id];
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${td_.n}</td><td>${esc(td_.id)}</td><td>${esc(td_.title)}</td>
        <td><span class="prio prio-${esc(td_.priority)}">${esc(td_.priority)}</span></td>
        <td>${v? `<span class="doc-verdict dv-${esc((v.verdict||'').replace(/\s/g,''))}">${esc(v.verdict)}</span> <small class="muted">${esc(v.file||"")}</small>`
            : "<span class='muted'>لم يُسلَّم</span>"}</td>`;
      t.appendChild(tr);
    });
    addSection(root,"🗂️ مصفوفة تتبع المستندات والأدلة","",t);
  }

  /* ===== مصفوفة المعايير ===== */
  const cov={};
  App.state.rounds.forEach(r=>(r.result&&r.result.standardsCoverage||[]).forEach(sc=>{
    if(!cov[sc.standardCode]) cov[sc.standardCode]=sc.roleInAccount;
  }));
  const codes=Object.keys(cov);
  if(codes.length){
    const t=document.createElement("table");
    t.innerHTML="<thead><tr><th>المعيار</th><th>اسمه بالعربية</th><th>دوره في هذا الميزان</th></tr></thead>";
    codes.sort().forEach(c=>{
      const s=StdDB.byCode[c];
      const tr=document.createElement("tr");
      tr.innerHTML=`<td><strong>${esc(c)}</strong></td><td>${esc(s?s.ar:"")}</td><td>${esc(cov[c])}</td>`;
      t.appendChild(tr);
    });
    addSection(root,"📚 المعايير التي طبّقها المجلس على هذا الميزان","",t);
  }

  /* ===== خاتمة ===== */
  const closeS=document.createElement("section"); closeS.className="rel-box";
  closeS.style.marginTop="14px";
  closeS.innerHTML=`<strong>الخاتمة:</strong> ${esc(rep.closingStatement)}`;
  root.appendChild(closeS);

  const actions=div("row-actions center-actions");
  actions.innerHTML=`<button class="btn primary big" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="btn big" id="btnDlReport">⬇️ تنزيل بيانات التقرير JSON</button>`;
  root.appendChild(actions);
  actions.querySelector("#btnDlReport").onclick=downloadReport;

  drawCharts({sevCount, tb, rounds:App.state.rounds});
}

/* ---------- رسوم Chart.js ---------- */
let chartRefs=[];
function drawCharts(data){
  chartRefs.forEach(c=>{try{c.destroy()}catch(e){}}); chartRefs=[];

  const sevOrder=["منخفضة","متوسطة","عالية","جسيمة"];
  const ctx1=document.getElementById("c-bar-sev");
  if(ctx1) chartRefs.push(new Chart(ctx1,{type:"doughnut",
    data:{labels:sevOrder,datasets:[{data:sevOrder.map(s=>data.sevCount[s]||0),
      backgroundColor:["#6B7F3E","#B8862B","#A05A2C","#8C3B34"]}]},
    options:{plugins:{legend:{position:"bottom"}}}}));

  const ctx2=document.getElementById("c-bar-bal");
  if(ctx2){
    const top=[...data.tb.items].map(i=>({...i,bal:Math.abs((i.debit||0)-(i.credit||0))}))
      .sort((a,b)=>b.bal-a.bal).slice(0,10).reverse();
    chartRefs.push(new Chart(ctx2,{type:"bar",
      data:{labels:top.map(i=>i.name),datasets:[{label:"رصيد",data:top.map(i=>i.bal),
        backgroundColor:"#B8862B"}]},
      options:{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:9}}},
        y:{ticks:{font:{size:9}}}},maintainAspectRatio:true}}));
  }

  const ctx3=document.getElementById("c-line-risk");
  if(ctx3){
    const pts=data.rounds.filter(r=>r.result).map(r=>({x:r.n,y:r.result.riskScore||0}));
    chartRefs.push(new Chart(ctx3,{type:"line",
      data:{labels:pts.map(p=>"جولة "+p.x),datasets:[{label:"درجة الخطورة",data:pts.map(p=>p.y),
        borderColor:"#8C3B34",backgroundColor:"rgba(140,59,52,.15)",fill:true,tension:.35}]},
      options:{plugins:{legend:{display:false}},scales:{y:{min:0,max:100}}}}));
  }
}
function mkChart(parent,title,id){
  const box=document.createElement("div"); box.className="chart-box";
  box.innerHTML=`<h4>${title}</h4>`;
  const cv=document.createElement("canvas"); cv.id="c-"+id; box.appendChild(cv);
  parent.appendChild(box);
}

/* ---------- تجميع ---------- */
function collectFindings(){
  return App.state.rounds.flatMap(r=>(r.result&&r.result.findings)||[]);
}
function allDocs(){ return App.state.rounds.flatMap(r=>(r.docs)||[]); }

function div(cls){ const d=document.createElement("div"); d.className=cls; return d; }
function addSection(root,title,html,extraEl){
  const s=div("report-section");
  s.innerHTML=`<h3 style="color:var(--gold-dark)">${title}</h3>`+html;
  if(extraEl){ s.appendChild(document.createElement("br")); s.appendChild(extraEl); }
  root.appendChild(s);
}

function downloadReport(){
  const payload={
    app:"ميزان المراجعة الذكي — مجلس المراجعين AI",
    exportedAt:new Date().toISOString(),
    entity:App.state.entity,
    trialBalance:App.state.tb,
    rounds:App.state.rounds.map(r=>({n:r.n,ts:r.ts,status:r.status,result:r.result})),
    finalReport:App.state.finalReport,
    localAnalysis:TBMap.analyze(App.state.tb, App.state.entity.currency)
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`مراجعة-${(App.state.entity.name||"منشأة").replace(/\s+/g,"-")}-${Date.now()}.json`;
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),3000);
}

window.ReportEngine = { render };
})();

/* S.kosif — مجلس المراجعة الذكي داخل «مراجعة ميزان المراجعة» (window.SKosifCouncilUI).
   من البحث المرفق «مجلس المراجعة الذكي»:
     • الجولة بالمجلس: آراء مستقلة متوازية (المتشكك، المحلل، خبير المعايير، خبير الضرائب والزكاة) → تحقق
       آلي من الاستشهاد بالأدلة المرقمة → نقاش منظم على نقاط الخلاف → قرار الرئيس (المستندات والقيود والطلبات)
       مجلس مصغر (3) أو كامل (5) أو مراجع واحد كما كان.
     • درجة الثقة لكل بند × تأكيد (E·T·A) مقابل عتبته، وقاعدة الإيقاف (اكتفاء / تصعيد / استمرار) — بالكود.
     • سجل الأدلة المرقم، فحوص السلامة الست، اختبارات القيود على كامل المجتمع (غير المعتادة، بنفورد، القطع)
       من دفاتر التطبيق أو ملف قيود مرفوع.
     • حالات الملف الثماني وسجل الانتقالات، ونقاط الاعتماد البشرية الأربع، وقائمة فحص المراجع لكل جولة،
       وسجل الاستثناءات وتعديل العتبات بسبب موثق، وخريطة الربط بمعايير المراجعة، وجاهزية المكتب، وتقرير
       الجولة للطباعة.
   كل رقم من المحركات (SKEngines.audit.confidence / council)؛ Gemini يفسر ويحكم ويطلب فقط. */
(()=>{
"use strict";
const {esc,toast}=SK;
const CF=()=>SKEngines.audit.confidence,CN=()=>SKEngines.audit.council,AI=()=>SKEngines.audit.aiReview;
let H=null,memo=null,step="";
const M2=v=>Math.round((Number(v)||0)*100); /* major units → halalas */
const pct=v=>v==null?"—":Math.round(v*100)+"٪";
const who=()=>{try{const p=JSON.parse(localStorage.getItem("skosif_profile_v1")||"{}");return p&&p.name?p.name+(p.title?" — "+p.title:""):""}catch{return""}};
const nowIso=()=>new Date().toISOString();
const fmtAt=iso=>{try{return new Date(iso).toLocaleString("ar-SA-u-ca-gregory-nu-latn",{dateStyle:"medium",timeStyle:"short"})}catch{return iso}};
const eng=d=>d.engagement&&d.engagement.state?d.engagement:CF().newEngagement();
const EV_KIND=()=>Object.entries(CF().RELIABILITY);
const JKEY="journal|current"; /* one uploaded journal per review (cleared with the review's documents) */

/* ---------- journals: the app's books or an uploaded export ---------- */
async function journalEntries(d){
  if(d.journalSource==="books"&&window.SKosifLedger){
    const acc=SKosifLedger.accounts(),code=id=>(acc.find(a=>a.id===id)||{}).code||id;
    return SKosifLedger.entries().map(e=>({id:e.id,ref:e.reference||e.id,date:e.date,memo:e.memo||"",source:e.source||"",createdAt:e.createdAt||undefined,lines:e.lines.map(l=>({account:String(code(l.accountId)),debit:+l.debit||0,credit:+l.credit||0}))}));
  }
  if(d.journalSource==="file"){const x=await H.docGet(JKEY).catch(()=>null);if(x&&x.text){return CN().parseJournal(x.text).entries}}
  return [];
}

/* ---------- the council's view of the review (memoized per render) ---------- */
async function prepare(c){
  const d=c.d,s=c.session,key=JSON.stringify([c.sig,d.journalSource,d.journalMeta,d.evidenceMeta,d.thOverrides,s&&s.rounds.length]);
  if(memo&&memo.key===key)return memo;
  const lineOf=code=>{const a=c.base.accounts.find(x=>x.code===code);return a&&a.lineKey||null};
  const typeOf=code=>{const r=c.tb.rows.find(x=>x.code===code);return r?r.type:null};
  const assertions={};c.base.accounts.forEach(a=>{if(!a.lineKey)return;const set=new Set(assertions[a.lineKey]||[]);a.assertions.map(x=>CF().assertionKey(x)).filter(Boolean).forEach(k=>set.add(k));assertions[a.lineKey]=[...set]});
  const lines=c.base.risks.map(r=>({lineKey:r.lineKey,ar:r.ar,amount:Math.abs(r.amount),level:r.level,significant:r.significant}));
  const reqs=new Map();c.base.requests.forEach(q=>reqs.set(q.id,q));if(s)s.rounds.forEach(r=>r.requests.forEach(q=>reqs.set(q.id,q)));
  const reqLine=q=>q&&(q.lineKey||(q.accounts||[]).map(lineOf).find(Boolean))||null;
  /* E: accepted documents, with the reliability and amount the reviewer tagged (or the extracted amount) */
  const evidence=[],docs=[];
  if(s)s.rounds.forEach(r=>r.reviewed.forEach(x=>{
    const q=reqs.get(x.requestId),lk=reqLine(q),meta=(d.evidenceMeta||{})[x.requestId+"|"+x.fileName]||{};
    const line=lines.find(l=>l.lineKey===lk),ex=Number(String(x.extracted.amount||"").replace(/[^\d.-]/g,""));
    const amount=meta.amount?M2(meta.amount):ex?M2(ex):line?line.amount:0;
    const kind=meta.kind||(/مصادق/.test(q&&q.title||"")?"confirmation":"external");
    const ak=q&&q.assertion&&CF().assertionKey(q.assertion);
    docs.push({requestId:x.requestId,fileName:x.fileName,verdict:x.verdict,lineKey:lk||undefined,amount:amount/100});
    if(lk)evidence.push({id:x.requestId+"|"+x.fileName,lineKey:lk,assertions:ak?[ak]:[],kind,amount,accepted:x.verdict==="مقبول"});
  }));
  /* T: misstatements from the proposed entries the reviewer has not rejected, per line */
  const mis={};c.pool.filter(a=>!d.rejected.includes(a.id)).forEach(a=>a.lines.forEach(l=>{const lk=lineOf(l.code);if(lk)mis[lk]=(mis[lk]||0)+Math.abs(l.debit-l.credit)/2}));
  /* A: the latest council's member confidences */
  const council={},last=s&&[...s.rounds].reverse().find(r=>r.council&&r.council.opinions);
  if(last)last.council.opinions.filter(o=>!o.rejected).forEach(o=>o.items.forEach(x=>{const k=x.lineKey+"|"+x.assertion;(council[k]=council[k]||[]).push(x.confidence)}));
  const pm=c.base.materiality.performance;
  const matrix=CF().confidenceMatrix({lines,assertions,evidence,misstatements:mis,council,pm,overrides:d.thOverrides||{}});
  const entries=await journalEntries(d),per=d.ctx.periodStart&&d.ctx.periodEnd?{start:d.ctx.periodStart,end:d.ctx.periodEnd}:undefined;
  const checks=CN().integrityChecks({tb:c.tb,entries,period:per});
  const sensitive=code=>{const lk=lineOf(code),t=typeOf(code);return t==="revenue"||/provisions|impairment|zakat/.test(lk||"")};
  const journal=entries.length?CN().journalTests(entries,{periodEnd:d.ctx.periodEnd||undefined,sensitive,isResult:code=>{const t=typeOf(code);return t==="revenue"||t==="expense"}}):null;
  const register=CN().evidenceRegister({tb:c.tb,lineOf,findings:c.all.findings,checks,journal,docs,pm});
  /* the stopping rule over the rounds' open-item averages */
  const hist=s?s.rounds.map(r=>r.avgOpen).filter(v=>typeof v==="number"):[];
  const dis=last?last.council.disagreements.filter(x=>{const l=lines.find(y=>y.lineKey===x.lineKey);return l&&l.significant&&x.spread>0.5}):[];
  const stop=CF().stopRule({avgOpen:hist.length?hist:[matrix.avgOpen],allMet:matrix.allMet,round:s?s.rounds.length:0,maxRounds:AI().MAX_ROUNDS,fraud:!!(journal&&journal.fraudSignal),disagreement:dis.length>0&&!(d.engagement&&d.engagement.approvals&&d.engagement.approvals.escalation&&d.engagement.approvals.escalation.round===(s?s.rounds.length:0))});
  /* requests ranked by value */
  const out=s?AI().outstanding(s):c.base.requests;
  const ranked=CF().rankRequests(out.map(q=>{const lk=reqLine(q),row=matrix.rows.find(r=>r.lineKey===lk);
    const a=q.assertion&&CF().assertionKey(q.assertion)||(row&&(row.cells.find(x=>x.met===false)||row.cells[0])||{}).assertion||"existence";
    const kind=/مصادق/.test(q.title)?"confirmation":"external",gain=row?CF().expectedGain(row,a,kind,row.amount,{evidence}):0;
    return {...q,lineKey:lk,assertion:a,expectedGain:gain,materialityWeight:row?CF().materialityWeight(row.amount,c.base.materiality.overall):0.2,effort:q.effort||(kind==="confirmation"?"low":"medium")}}));
  memo={key,lineOf,lines,assertions,evidence,mis,council,matrix,entries,checks,journal,register,stop,ranked,last,dis};
  return memo;
}

/* keep the file's state honest: walk the allowed transitions to where the facts put it */
function sync(d,c,m,reason,actor){
  let e=eng(d);const s=c.session,last=s&&s.rounds[s.rounds.length-1];
  const target=CF().derivedState({hasTb:!!c,planApproved:!!e.approvals.plan,rounds:s?s.rounds.length:0,lastDecision:last&&last.stop?last.stop.decision:null,reportApproved:!!e.approvals.report});
  if(target===e.state)return e;
  const T=CF().TRANSITIONS,seen=new Set([e.state]),q=[[e.state,[]]];let path=null;
  while(q.length){const [st,p]=q.shift();if(st===target){path=p;break}for(const n of T[st])if(!seen.has(n)){seen.add(n);q.push([n,[...p,n]])}}
  for(const n of path||[]){try{e=CF().transition(e,n,actor||"النظام",reason||"")}catch{break}}
  d.engagement=e;return e;
}

/* ---------- Jev adjudication: choose the best-supported council opinion, never the accounting numbers ---------- */
const JEV_API="https://aghnam-jev-api.kosif199022.workers.dev",JEV_SESSION="aghnamJevSession";
async function jevAdjudicate(ops,dis,round,signal){
  let token="";try{token=sessionStorage.getItem(JEV_SESSION)||""}catch{}
  const valid=(ops||[]).filter(o=>!o.rejected&&o.position);
  if(!token)return{available:false,reason:"جلسة Jev غير مفعلة"};
  if(valid.length<2)return{available:false,reason:"لا توجد آراء كافية للتحكيم"};
  const name=k=>(CN().MEMBERS.find(x=>x.key===k)||{ar:k}).ar;
  const labels=valid.map((o,i)=>"رأي "+(i+1)+" — "+name(o.member)+": "+String(o.position).slice(0,220));
  const state=[
    "جولة مراجعة رقم "+round,
    "المطلوب: ترجيح الرأي الأكثر اتساقاً مع الأدلة والاستشهادات فقط، لا إنشاء أرقام أو معالجات جديدة.",
    "الآراء:",
    ...valid.map((o,i)=>(i+1)+") "+name(o.member)+" | "+o.position+" | الأدلة: "+(o.citations||[]).join("، ")),
    dis&&dis.length?"نقاط الخلاف: "+dis.map(x=>x.lineKey+"/"+x.assertion+" فارق "+x.spread).join("؛ "):"لا خلافات جوهرية مسجلة."
  ].join("\n");
  const payload={type:"choice",instructions:"اختر رأياً واحداً ليكون توصية التحكيم للمجلس. فضّل الرأي الذي يستند إلى أدلة صحيحة ومباشرة ويعالج المخاطر الجوهرية بوضوح. لا تغيّر الأرقام ولا تتجاوز قاعدة الاكتفاء الآلية أو اعتماد المراجع.",state:SK.redact?SK.redact(state):state,criteria:Object.fromEntries(labels.map(x=>[x,null]))};
  const res=await fetch(JEV_API+"/api/jev",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+token},body:JSON.stringify(payload),signal});
  const data=await res.json().catch(()=>({}));if(!res.ok||!data.ok)throw new Error(data.error||"تعذر تحكيم Jev");
  const a=data.result?.answers?.decision||data.result?.decision||data.result||{};
  const selected=a.choice??a.answer??a.selected??a.label??"";
  const confidence=typeof a.confidence==="number"?a.confidence:null;
  return{available:true,selected:String(selected).slice(0,500),confidence,at:new Date().toISOString()};
}

/* ---------- the council round ---------- */
async function run(){
  const c=H.compute();if(!c||H.getBusy())return;
  let d=H.st();const size=Number(d.councilSize)||1,e=eng(d);
  if(!e.approvals.plan){toast("اعتمد الأهمية النسبية وخطة المراجعة أولاً (نقطة الاعتماد الأولى) — من تبويب «الثقة والمجلس»","warn");return}
  const m=await prepare(c),members=CN().COUNCIL[size]||[];
  let s=H.session(d);
  const withData={...s,uploads:await Promise.all(s.uploads.map(async u=>{if(u.round!==s.rounds.length+1)return u;const x=await H.docGet(H.docKey(s.id,u)).catch(()=>null);return x?{...u,data:x.data||undefined,text:x.text||undefined}:u}))};
  const abort=new AbortController();H.setAbort(abort);H.setBusy("council");
  const say=t=>{step=t;H.paint()};
  try{
    const ctx={company:d.ctx.company,period:d.ctx.period,framework:c.fw,register:m.register,round:s.rounds.length+1,
      lines:m.matrix.rows.filter(r=>r.threshold!==null).map(r=>r.lineKey+" — "+r.ar+": العتبة "+r.threshold+" · "+r.cells.map(x=>x.assertion+"="+x.C).join("، ")).join("\n")||"لا بنود جوهرية",
      outstanding:m.ranked.map(q=>q.id+" "+q.title+" ("+q.lineKey+"/"+q.assertion+")").join("\n")};
    const ask=async(k,debate)=>{const api=await SKosifAI.generate(CN().memberBody(k,{...ctx,debate}),{signal:abort.signal,timeout:180000});const ex=AI().extractText(api);return CN().verifyOpinion(AI().parseJsonLoose(ex.text),k,m.register)};
    let ops=[];
    if(members.length){
      say("آراء مستقلة من "+members.length+" أعضاء بالتوازي…");
      ops=await Promise.all(members.map(k=>ask(k).catch(err=>({member:k,position:"تعذر الحصول على الرأي: "+err.message,reasoning:"",citations:[],items:[],requests:[],unknownCitations:[],unsupportedNumbers:[],rejected:true}))));
      let dis=CN().disagreements(ops);
      if(dis.length){
        say("نقاش منظم على "+dis.length+" نقطة خلاف…");
        const name=k=>CN().MEMBERS.find(x=>x.key===k).ar;
        const involved=[...new Set(dis.flatMap(x=>x.members.map(y=>y.member)))];
        await Promise.all(involved.map(async k=>{
          const pts=dis.filter(x=>x.members.some(y=>y.member===k)).map(x=>x.lineKey+"/"+x.assertion+": "+x.members.filter(y=>y.member!==k).map(y=>name(y.member)+" ثقته "+y.confidence+(y.sufficient?" (كافٍ)":" (غير كافٍ)")+" ["+y.citations.join("، ")+"]").join("؛ ")).join("\n");
          try{const r=await ask(k,pts),o=ops.find(x=>x.member===k);if(o&&!r.rejected){o.reply=r.position+" — "+r.reasoning.slice(0,500);o.items=r.items.length?r.items:o.items}}catch{}
        }));
        dis=CN().disagreements(ops);
      }
      ops._dis=dis;
    }
    const dis=ops._dis||[];
    let jev={available:false,reason:"مجلس أحادي"};
    if(members.length){
      say("Jev يحكّم بين الآراء وفق الأدلة…");
      try{jev=await jevAdjudicate(ops,dis,s.rounds.length+1,abort.signal)}catch(err){jev={available:false,reason:err.message||String(err)}}
    }
    say(members.length?"رئيس المجلس يراجع تحكيم Jev ويصدر توصيته…":"المراجع يراجع الميزان والمستندات…");
    const jevText=jev.available?"\n\nتحكيم Jev (توصية ترجيح لا تتجاوز القواعد الآلية): "+jev.selected+(jev.confidence!=null?" · الثقة "+Math.round(jev.confidence*100)+"٪":""):"";
    const api=await SKosifAI.generate(AI().buildRoundBody(withData,c.tb,c.base,{council:(members.length?CN().councilText(ops,dis)+jevText+"\n\n":"")+"سجل الأدلة المرقمة:\n"+CN().registerText(m.register)}),{signal:abort.signal,timeout:300000});
    const ex=AI().extractText(api);if(ex.blocked)throw new Error("رفض النموذج الرد لأسباب تتعلق بسياسة المحتوى.");
    const raw=AI().parseJsonLoose(ex.text);if(!raw)throw new Error("رد الرئيس لم يكن بالصيغة المتوقعة — أعد المحاولة.");
    d=H.st();s=H.session(d);
    const r=AI().normalizeRound(raw,s,c.tb,SKosifAI.conf().model,new Date(),new Set(m.register.map(x=>x.id)));
    if(members.length)r.council={size,opinions:ops.map(o=>({...o})),disagreements:dis,jev};
    d.session=AI().addRound(s,r);H.put(d);
    const last=await afterRound({govern:true,dis,size});
    toast({sufficient:"اكتفاء — تُعد مسودة التقرير لاعتمادك",escalate:"تصعيد للمراجع: "+last.stop.reason.split("—")[0],continue:"انتهت الجولة "+last.no+": راجع الطلبات واعتمد إرسالها"}[last.stop.decision],last.stop.decision==="escalate"?"warn":"ok");
  }catch(err){toast(err.message,"bad")}
  finally{step="";H.setAbort(null);H.setBusy("")}
}

/* the deterministic decision after any round: confidence recomputed, stopping rule applied, file state synced.
   govern (council rounds): the code's decision governs the round's status; a single reviewer's status stays
   Gemini's and the decision is shown beside it. */
async function afterRound(o={}){
  const c=H.compute();memo=null;const m=await prepare(c),d=H.st(),s=d.session;if(!s||!s.rounds.length)return null;
  const last=s.rounds[s.rounds.length-1],dis=o.dis||[];
  last.avgOpen=m.matrix.avgOpen;
  const hist=s.rounds.map(x=>x.avgOpen).filter(v=>typeof v==="number");
  last.stop=CF().stopRule({avgOpen:hist,allMet:m.matrix.allMet,round:s.rounds.length,maxRounds:AI().MAX_ROUNDS,fraud:!!(m.journal&&m.journal.fraudSignal),
    disagreement:dis.some(x=>{const l=m.lines.find(y=>y.lineKey===x.lineKey);return l&&l.significant&&x.spread>0.5})});
  if(o.govern){
    if(last.decision&&last.stop.decision!=="continue"&&({request_more_evidence:"continue",escalate:"escalate",sufficient:"sufficient"}[last.decision])!==last.stop.decision)
      last.warnings.push("قرار الرئيس «"+({request_more_evidence:"طلب أدلة",escalate:"تصعيد",sufficient:"اكتفاء"}[last.decision])+"» يختلف عن القرار الآلي من درجات الثقة — المعتمد هو القرار الآلي ويُعرض رأي الرئيس للمراجع.");
    if(last.stop.decision==="sufficient"&&!last.requests.filter(q=>q.round===last.no).length)last.status="complete";
    if(last.stop.decision!=="sufficient"&&last.status==="complete")last.status="needs_docs";
  }
  H.put(d);memo=null;const c2=H.compute(),d2=H.st();sync(d2,c2,await prepare(c2),"الجولة "+last.no+": "+last.stop.reason,"النظام");H.put(d2);
  SK.audit&&SK.audit.log("tbreview",{act:o.govern?"council-round":"round-decision",no:last.no,size:o.size||1,decision:last.stop.code,avgOpen:last.avgOpen});
  return last;
}

/* ---------- pieces of the round card ---------- */
const decAr={sufficient:["اكتفاء","ok"],escalate:["تصعيد للمراجع","bad"],continue:["طلب أدلة","warn"]};
function roundExtras(r,c){
  const d=c.d,e=eng(d),ck=(d.checklists||{})[r.no]||[],name=k=>(CN().MEMBERS.find(x=>x.key===k)||{ar:k}).ar;
  const icon={skeptic:"🔍",analyst:"📈",standards:"📘",tax:"🧾",chair:"⚖️"};
  let h='';
  if(r.stop)h+='<div class="tbc-dec"><span class="sksev '+decAr[r.stop.decision][1]+'">القرار الآلي: '+decAr[r.stop.decision][0]+'</span><p>'+esc(r.stop.reason)+'</p>'+(typeof r.avgOpen==="number"?'<small>متوسط الثقة في البنود المفتوحة '+pct(r.avgOpen)+'</small>':'')+'</div>';
  if(r.council&&r.council.opinions&&r.council.opinions.length){
    h+='<h4>المجلس ('+r.council.size+' أعضاء مع الرئيس)</h4><div class="tbc-members">'+r.council.opinions.map(o=>{const cs=o.items.map(x=>x.confidence),avg=cs.length?cs.reduce((a,b)=>a+b,0)/cs.length:null;
      return '<article class="tbc-mem'+(o.rejected?' rej':'')+'"><header><span class="av">'+(icon[o.member]||"•")+'</span><b>'+esc(name(o.member))+'</b>'+(avg!==null?SKCharts.ring(avg*100,{size:40,cls:avg>=.8?"ok":avg>=.6?"warn":"bad"}):'')+'</header>'+
        (o.rejected?'<p class="tbc-rej">مرفوض آلياً — '+(o.unknownCitations.length?'استشهد بدليل غير موجود: '+esc(o.unknownCitations.join("، ")):'بلا استشهاد بالأدلة')+'</p>':'')+
        '<p class="pos">'+esc(o.position)+'</p><p class="why">'+esc(o.reasoning)+'</p>'+
        (o.reply?'<p class="reply"><b>في النقاش:</b> '+esc(o.reply)+'</p>':'')+
        (o.unsupportedNumbers&&o.unsupportedNumbers.length?'<p class="tbc-warnn">أرقام غير موجودة في الأدلة المستشهد بها: '+esc(o.unsupportedNumbers.join("، "))+' — وزن صوته نصف</p>':'')+
        '<div class="cites">'+o.citations.map(x=>'<span class="cite ok">'+esc(x)+'</span>').join("")+(o.unknownCitations||[]).map(x=>'<span class="cite bad">'+esc(x)+'</span>').join("")+'</div></article>'}).join("")+'</div>';
    if(r.council.disagreements&&r.council.disagreements.length)h+='<p class="hint">نقاط خلاف نوقشت: '+r.council.disagreements.map(x=>esc(x.lineKey+"/"+CF().assertionAr(x.assertion))+' (فارق '+x.spread+(x.split?'، انقسام':'')+')').join("؛ ")+'</p>';
    if(r.council.jev)h+='<div class="tbc-jev '+(r.council.jev.available?'ok':'warn')+'"><b>تحكيم Jev</b><p>'+(r.council.jev.available?esc(r.council.jev.selected)+(r.council.jev.confidence!=null?' · ثقة '+Math.round(r.council.jev.confidence*100)+'٪':''):esc(r.council.jev.reason||'غير متاح'))+'</p><small>توصية ترجيح بين آراء المجلس فقط؛ قرار الاكتفاء يحكمه محرك الثقة واعتماد المراجع.</small></div>';
  }
  if(r.dissent&&r.dissent.length)h+='<h4>الآراء المخالفة غير المحسومة</h4><ul class="tbc-dis">'+r.dissent.map(x=>'<li><b>'+esc(x.member)+':</b> '+esc(x.note)+(x.citations.length?' <span class="cites">'+x.citations.map(z=>'<span class="cite ok">'+esc(z)+'</span>').join("")+'</span>':'')+'</li>').join("")+'</ul>';
  const asks=r.requests.filter(q=>q.round===r.no),approved=e.requestsApproved&&e.requestsApproved.includes(r.no);
  h+='<div class="tbc-appr">'+(asks.length?(approved?'<span class="sksev ok">اعتمد المراجع إرسال '+asks.length+' طلب للعميل</span> <button type="button" class="btn sm" data-cc="send-list" data-r="'+r.no+'">قائمة الطلبات للعميل</button>':
      '<button type="button" class="btn primary sm" data-cc="approve-requests" data-r="'+r.no+'">اعتمد إرسال الطلبات ('+asks.length+') للعميل</button><span class="hint">نقطة الاعتماد الثانية: لا يُرسل طلب للعميل دون موافقتك.</span>'):'')+
    '<button type="button" class="btn sm" data-cc="round-report" data-r="'+r.no+'">تقرير الجولة</button></div>'+
    '<details class="tbc-chk"'+(ck.filter(Boolean).length<6?'':' ')+'><summary>قائمة فحص المراجع في هذه الجولة ('+ck.filter(Boolean).length+'/6)</summary>'+CF().ROUND_CHECKLIST.map((t,i)=>'<label class="checkline"><input type="checkbox" data-ck="'+r.no+'" data-i="'+i+'"'+(ck[i]?' checked':'')+'> '+esc(t)+'</label>').join("")+'</details>';
  return h;
}
function aiControls(c){
  const d=c.d,size=Number(d.councilSize)||1;
  return '<div class="tbc-size"><span>تشكيل المجلس</span><div class="sk-seg" role="group">'+[[1,"مراجع واحد"],[3,"مجلس مصغّر · 3"],[5,"المجلس الكامل · 5"]].map(([v,l])=>'<button type="button" data-cc="size" data-v="'+v+'" aria-pressed="'+(size===v)+'">'+l+'</button>').join("")+'</div>'+
    '<small class="hint">'+(size===1?'نموذج واحد يراجع ويطلب — أسرع وأرخص.':size===3?'المتشكك والمحلل بآراء مستقلة ثم الرئيس — الحد الأدنى في المنتج الأولي.':'المتشكك والمحلل وخبير المعايير وخبير الضرائب والزكاة ثم الرئيس — للبنود الجوهرية عالية الخطر.')+' كل استشهاد يُتحقق منه آلياً ودرجات الثقة تُحسب بالكود.</small></div>'+
    (H.getBusy()==="council"&&step?'<div class="tbr-busy"><i></i><span>'+esc(step)+'</span></div>':'');
}

/* ---------- the tab: confidence, evidence, tests, approvals, states ---------- */
function stateBar(e){
  const cur=CF().STATES.findIndex(x=>x.key===e.state);
  return '<ol class="tbc-states">'+CF().STATES.map((x,i)=>'<li class="'+(i<cur?"done":i===cur?"cur":"")+'"><i>'+(i<cur?"✓":i+1)+'</i><span>'+esc(x.ar)+'</span></li>').join("")+'</ol>';
}
function matrixHTML(m){
  const A=CF().ASSERTIONS,rows=m.matrix.rows.slice().sort((a,b)=>(b.threshold||0)-(a.threshold||0)||b.amount-a.amount);
  const cell=(r,a)=>{const x=r.cells.find(z=>z.assertion===a.key);if(!x)return '<td class="na">—</td>';
    const cls=x.met===null?"info":x.met?"ok":x.C>=(r.threshold||0)-0.15?"warn":"bad";
    return '<td class="tbc-c '+cls+'" title="'+esc("E "+x.E+" · T "+x.T+" · A "+(x.A===null?"—":x.A))+'"><b>'+x.C.toFixed(2)+'</b><small>'+(x.met===null?"تحليلي":x.met?"✓ مكتفٍ":"▼ دون العتبة")+'</small></td>'};
  return '<div class="tbr-tw"><table class="sk-table tbc-mx" data-sk-plain><thead><tr><th>البند</th><th>العتبة</th>'+A.map(a=>'<th title="'+esc(a.question)+'">'+esc(a.ar)+'</th>').join("")+'<th></th></tr></thead><tbody>'+
    rows.map(r=>'<tr class="'+(r.threshold===null?"imm":"")+'"><td><b>'+esc(r.ar)+'</b><small>'+SKCharts.compact(r.amount/100)+' · خطر '+esc(r.level)+'</small></td><td class="num">'+(r.threshold===null?'—':r.threshold.toFixed(2))+(r.override?'<small title="'+esc(r.override.reason)+'">معدّلة</small>':'')+'</td>'+
      A.map(a=>cell(r,a)).join("")+'<td><button type="button" class="linkish" data-cc="threshold" data-l="'+esc(r.lineKey)+'">العتبة</button></td></tr>').join("")+'</tbody></table></div>'+
    '<p class="hint">C = 0.5·E (تغطية الأدلة بموثوقيتها) + 0.3·T (نتائج الاختبارات مقابل أهمية الأداء) + 0.2·A (اتفاق المجلس). مرّر المؤشر على الخلية لترى المكونات. البنود غير الجوهرية يكفيها الإجراء التحليلي.</p>';
}
function approvalsHTML(e,c){
  const s=c.session,round=s?s.rounds.length:0;
  return '<div class="tbc-apps">'+CF().APPROVALS.map((a,i)=>{const x=e.approvals[a.key];
    const allowed=a.key==="plan"||(a.key==="requests"&&round>0)||(a.key==="escalation"&&e.state==="human-review")||(a.key==="report"&&(e.state==="draft-report"||e.state==="human-review"));
    return '<article class="'+(x?"done":"")+'"><header><i>'+(i+1)+'</i><b>'+esc(a.ar)+'</b><small>'+esc(a.isa)+'</small></header><p>'+esc(a.why)+'</p>'+
      (x?'<p class="ok">✓ اعتمده <b>'+esc(x.by)+'</b> · '+esc(fmtAt(x.at))+(x.round?' · الجولة '+x.round:'')+(x.note?'<br><small>'+esc(x.note)+'</small>':'')+'</p>':
        a.key==="requests"?'<p class="hint">يُعتمد من بطاقة كل جولة في «جولات المراجعة».</p>':
        '<button type="button" class="btn '+(allowed?"primary":"")+' sm" data-cc="approve" data-k="'+a.key+'"'+(allowed?'':' disabled')+'>اعتمد</button>')+'</article>'}).join("")+'</div>';
}
function journalHTML(m,d){
  const j=m.journal,books=window.SKosifLedger&&SKosifLedger.entries().length;
  let h='<div class="sk-actions">'+(books?'<button type="button" class="btn'+(d.journalSource==="books"?' primary':'')+'" data-cc="journal-books">من دفاتر التطبيق ('+SKosifLedger.entries().length+' قيد)</button>':'')+
    '<label class="btn" style="cursor:pointer">رفع دفتر القيود (CSV/Excel)<input type="file" data-jfile accept=".csv,.tsv,.txt,.xlsx" hidden></label>'+(d.journalSource?'<button type="button" class="btn sm" data-cc="journal-clear">إزالة</button>':'')+
    '<span class="hint">'+(d.journalSource==="file"&&d.journalMeta?'الملف: '+esc(d.journalMeta.name)+' · '+d.journalMeta.count+' قيد':d.journalSource==="books"?'دفاتر التطبيق':'بلا دفتر قيود — الاختبارات على كامل المجتمع تحتاجه')+'</span></div>';
  if(!j)return h;
  const b=j.benford;
  h+='<div class="tbr-2"><div>'+(b.n>=50?SKCharts.bars({title:"بنفورد — الرقم الأول",width:520,height:200,labels:["1","2","3","4","5","6","7","8","9"],fmt:v=>Math.round(v*1000)/10+"٪",series:[{name:"المشاهد",values:b.observed},{name:"المتوقع (بنفورد)",values:b.expected}]}):'<p class="hint">بنفورد يحتاج 50 قيداً على الأقل ('+b.n+').</p>')+
    '<p><span class="sksev '+(b.conformity==="nonconformity"?"bad":b.conformity==="marginal"?"warn":b.conformity==="insufficient"?"info":"ok")+'">'+esc(b.conformityAr)+'</span> MAD '+b.mad+' · χ² '+b.chi2+' — مؤشر يستحق الفحص لا دليل على الغش.</p></div>'+
    '<div><h4>القيود غير المعتادة ('+j.unusual.length+' من '+j.count+')</h4>'+(j.unusual.length?'<div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>القيد</th><th>التاريخ</th><th>المبلغ</th><th>السبب</th></tr></thead><tbody>'+
      j.unusual.slice(0,12).map(u=>'<tr><td class="mono">'+esc(u.ref)+'</td><td class="mono">'+esc(u.date)+'</td><td class="num">'+SKCharts.compact(u.amount)+'</td><td>'+esc(u.reasons.map(x=>x.ar).join("، "))+'</td></tr>').join("")+'</tbody></table></div>':'<p class="hint">لا قيود غير معتادة.</p>')+
    '<h4>القطع حول تاريخ الإقفال ('+j.cutoff.length+')</h4>'+(j.cutoff.length?'<p class="hint">'+j.cutoff.slice(0,8).map(x=>esc(x.ref+" "+x.date+(x.side==="after"?" (بعد)":" (قبل)"))).join(" · ")+'</p>':'<p class="hint">لا قيود على الإيرادات والمصروفات في نافذة ±5 أيام.</p>')+
    (j.fraudSignal?'<p class="tbr-warn"><b>مؤشر غش محتمل</b> — يُصعد الملف للمراجع فوراً (ISA 240)، ولا تُرسل طلبات تنبه طرفاً مشتبهاً به.</p>':'')+'</div></div>';
  return h;
}
function isaStatus(k,c,m,e){
  const s=c.session,rounds=s?s.rounds.length:0;
  const st={plan:!!e.approvals.plan,risk:c.base.risks.length>0,response:rounds>0||c.base.requests.length>0,evidence:m.evidence.some(x=>x.accepted),analytics:c.base.findings.some(f=>f.kind==="analytical")||c.tb.hasPrior,
    sampling:!!m.journal||m.ranked.length>0,confirm:m.ranked.some(q=>/مصادق/.test(q.title))||m.evidence.some(x=>x.kind==="confirmation"),fraud:!!m.journal,estimates:m.evidence.some(x=>/provisions|receivables|inventory|ppe/.test(x.lineKey)),
    docs:rounds>0,misstatements:c.decided&&c.pool.length>0,deficiencies:!!(s&&s.final&&s.final.letter.length),opinion:!!e.approvals.report}[k];
  return st?'<span class="sksev ok">منجز</span>':'<span class="sksev info">قائم</span>';
}
async function confTab(c){
  const m=await prepare(c),d=c.d,e=sync(d,c,m,"مزامنة مع حالة المراجعة"),mat=c.base.materiality;
  if(JSON.stringify(e)!==JSON.stringify(H.st().engagement))H.put(d);
  const open=m.matrix.open,ex=d.exceptions||[],rd=d.readiness||[];
  const card=(t,p,b)=>'<section class="card"><div class="card-h"><div><h3>'+t+'</h3>'+(p?'<p>'+p+'</p>':'')+'</div></div><div class="card-b">'+b+'</div></section>';
  return card("حالة الملف","آلة حالات: كل انتقال بشرط، ويُسجل بتاريخه وسببه ومن نفذه.",stateBar(e)+
      '<div class="tbc-stop"><span class="sksev '+decAr[m.stop.decision][1]+'">'+decAr[m.stop.decision][0]+'</span><p>'+esc(m.stop.reason)+'</p></div>'+
      (e.history.length?'<details><summary>سجل الانتقالات ('+e.history.length+')</summary><ul class="tbc-hist">'+e.history.slice().reverse().map(x=>'<li><b>'+esc((CF().STATES.find(s=>s.key===x.to)||{}).ar)+'</b> ← '+esc((CF().STATES.find(s=>s.key===x.from)||{}).ar)+' · '+esc(fmtAt(x.at))+' · '+esc(x.actor)+(x.reason?' — '+esc(x.reason):'')+'</li>').join("")+'</ul></details>':''))+
    card("نقاط الاعتماد البشرية","أربع نقاط إلزامية: النظام يقترح ويوثق، والمراجع يعتمد ويوقع.",
      '<div class="tbc-mat"><div><small>الأهمية الكلية</small><b>'+SKCharts.compact(mat.overall/100)+'</b></div><div><small>أهمية الأداء</small><b>'+SKCharts.compact(mat.performance/100)+'</b></div><div><small>حد التوافه</small><b>'+SKCharts.compact(mat.trivial/100)+'</b></div><div><small>الأساس</small><b>'+esc(mat.benchmarkAr)+' × '+Math.round(mat.rate*1000)/10+'٪</b></div></div>'+approvalsHTML(e,c))+
    card("درجة الثقة لكل بند وتأكيد",(open.length?open.length+' بند جوهري دون عتبته · متوسطها '+pct(m.matrix.avgOpen):'كل البنود الجوهرية بلغت عتباتها')+' — تبدأ الثقة من الصفر ولا ترتفع إلا بدليل.',matrixHTML(m))+
    card("الطلبات مرتبة بالقيمة","الأولوية = الزيادة المتوقعة في الثقة × وزن الأهمية ÷ عبء العميل — مصادقة أكبر عميل قبل عشرين فاتورة صغيرة.",
      m.ranked.length?'<div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>الطلب</th><th>البند / التأكيد</th><th>+الثقة المتوقعة</th><th>وزن الأهمية</th><th>العبء</th><th>الأولوية</th></tr></thead><tbody>'+
        m.ranked.map(q=>'<tr><td><span class="mono">'+esc(q.id)+'</span> '+esc(q.title)+'</td><td>'+esc((m.lines.find(l=>l.lineKey===q.lineKey)||{ar:q.lineKey||"—"}).ar)+' / '+esc(CF().assertionAr(q.assertion))+'</td><td class="num">+'+pct(q.expectedGain)+'</td><td class="num">'+q.materialityWeight+'</td><td>'+esc(CF().EFFORT[q.effort].ar)+'</td><td class="num"><b>'+q.score+'</b></td></tr>').join("")+'</tbody></table></div>':'<p class="hint">لا طلبات قائمة.</p>')+
    card("فحوص السلامة الست","أي خلل يتحول إلى طلب محدد في الجولة الأولى بدلاً من أن يوقف العمل.",
      '<div class="tbc-checks">'+m.checks.map(x=>'<div class="'+(x.ok===true?"ok":x.ok===false?"bad":"na")+'"><i>'+(x.ok===true?"✓":x.ok===false?"✗":"—")+'</i><b>'+esc(x.ar)+'</b><small>'+esc(x.detail)+'</small>'+(x.request?'<em>طلب: '+esc(x.request)+'</em>':'')+'</div>').join("")+'</div>')+
    card("اختبارات القيود على كامل المجتمع","القيود غير المعتادة، بنفورد، القطع — بالكود ونتائجها قابلة للتكرار (ISA 240 · ISA 520 · ISA 530).",journalHTML(m,d))+
    card("سجل الأدلة المرقمة ("+m.register.length+")","لا يُقبل ادعاء في المجلس دون رقم دليل موجود هنا؛ الاستشهاد بغيره يرفض الرأي آلياً.",
      '<div class="tbr-tw tbc-reg"><table class="sk-table" data-sk-plain><thead><tr><th>الرقم</th><th>البند</th><th>الدليل</th><th>التفصيل</th></tr></thead><tbody>'+
        m.register.filter(x=>x.family!=="TB").concat(m.register.filter(x=>x.family==="TB").slice(0,25)).map(x=>'<tr><td class="mono">'+esc(x.id)+'</td><td>'+esc(x.lineKey||"—")+'</td><td>'+esc(x.title)+'</td><td>'+esc(x.detail)+'</td></tr>').join("")+'</tbody></table></div>')+
    card("سجل الاستثناءات","كل حالة تجاوز فيها المراجع قرار النظام أو عدّل عتبة، مع السبب — لتحسين الإعدادات (إدارة الجودة).",
      (ex.length?'<ul class="tbc-hist">'+ex.slice().reverse().map(x=>'<li><b>'+esc(x.what)+'</b> · '+esc(fmtAt(x.at))+' · '+esc(x.by)+' — '+esc(x.reason)+'</li>').join("")+'</ul>':'<p class="hint">لا استثناءات.</p>')+'<button type="button" class="btn sm" data-cc="exception">تسجيل استثناء</button>')+
    card("خريطة الربط بمعايير المراجعة","كل مرحلة في النظام مربوطة بمعيار — ما يجعل المخرجات قابلة للدفاع أمام فحص الجودة.",
      '<div class="tbr-tw"><table class="sk-table" data-sk-plain><thead><tr><th>المرحلة</th><th>المعيار</th><th>ما يطبقه النظام</th><th>الحالة</th></tr></thead><tbody>'+CF().ISA_MAP.map(x=>'<tr><td>'+esc(x.stage)+'</td><td class="mono">'+esc(x.isa)+'</td><td>'+esc(x.what)+'</td><td>'+isaStatus(x.key,c,m,e)+'</td></tr>').join("")+'</tbody></table></div>')+
    '<details class="card tbc-ready"><summary>جاهزية المكتب قبل الاستخدام ('+rd.filter(Boolean).length+'/'+CF().OFFICE_READINESS.length+')</summary><div class="card-b">'+CF().OFFICE_READINESS.map((t,i)=>'<label class="checkline"><input type="checkbox" data-rd="'+i+'"'+(rd[i]?' checked':'')+'> '+esc(t)+'</label>').join("")+'</div></details>';
}

/* ---------- the round report (research appendix B) ---------- */
async function roundReport(no){
  const c=H.compute();if(!c||!c.session)return;const r=c.session.rounds.find(x=>x.no===no);if(!r)return;
  const m=await prepare(c),d=c.d,e=eng(d),ck=(d.checklists||{})[no]||[],w=window.open("","_blank");if(!w){toast("اسمح بالنوافذ المنبثقة للطباعة","warn");return}
  const name=k=>(CN().MEMBERS.find(x=>x.key===k)||{ar:k}).ar,dec=r.stop?decAr[r.stop.decision][0]:({request_more_evidence:"طلب أدلة إضافية",escalate:"تصعيد",sufficient:"اكتفاء"}[r.decision]||(r.status==="complete"?"اكتفاء":"طلب أدلة إضافية"));
  const openRows=m.matrix.rows.filter(x=>x.threshold!==null).map(x=>esc(x.ar)+' (ثقة '+x.min.toFixed(2)+' من '+x.threshold.toFixed(2)+(x.met?': مكتفٍ':'')+')').join("، ");
  const asks=m.ranked.filter(q=>q.round===no),appr=e.approvals.requests&&e.requestsApproved.includes(no)?e.approvals.requests:null;
  const title="تقرير الجولة "+no+" — ملف: "+(d.ctx.company||"[اسم العميل]")+" — "+(d.ctx.period||"السنة المالية");
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+esc(title)+'</title></head><body><h1>'+esc(title)+'</h1>'+
    '<h2>ملخص القرار</h2><p><b>القرار:</b> '+esc(dec)+(r.stop?' — '+esc(r.stop.reason):'')+'</p><p><b>البنود الجوهرية:</b> '+(openRows||'—')+'</p>'+
    '<h2>الملاحظات المبدئية</h2>'+(r.findings.length?'<ul>'+r.findings.map(f=>'<li>'+esc(f.id)+' ('+esc({high:"عالية",medium:"متوسطة",low:"منخفضة"}[f.severity])+'): '+esc(f.title)+(f.citations&&f.citations.length?' ['+esc(f.citations.join("، "))+']':'')+'</li>').join("")+'</ul>':'<p>لا ملاحظات جديدة.</p>')+
    '<h2>الطلبات (مرتبة حسب الأولوية)</h2>'+(asks.length?'<ol>'+asks.map(q=>'<li><b>'+esc(q.id)+'</b> — '+esc((m.lines.find(l=>l.lineKey===q.lineKey)||{ar:q.lineKey||""}).ar)+' / '+esc(CF().assertionAr(q.assertion))+' — '+esc(q.title)+'<br><small>السبب: '+esc(q.purpose||"")+(q.citations&&q.citations.length?' ['+esc(q.citations.join("، "))+']':'')+' · الأولوية '+q.score+'</small></li>').join("")+'</ol>':'<p>لا طلبات جديدة.</p>')+
    (r.council&&r.council.opinions?'<h2>آراء المجلس</h2><ul>'+r.council.opinions.map(o=>'<li><b>'+esc(name(o.member))+':</b> '+esc(o.position)+(o.rejected?' <i>(مرفوض آلياً)</i>':'')+'</li>').join("")+'</ul>':'')+
    '<h2>الآراء المخالفة غير المحسومة</h2>'+((r.dissent||[]).length?'<ul>'+r.dissent.map(x=>'<li><b>'+esc(x.member)+':</b> '+esc(x.note)+(x.citations.length?' ['+esc(x.citations.join("، "))+']':'')+'</li>').join("")+'</ul>':'<p>لا آراء مخالفة.</p>')+
    '<h2>قائمة فحص المراجع</h2><ul>'+CF().ROUND_CHECKLIST.map((t,i)=>'<li>'+(ck[i]?'☑':'☐')+' '+esc(t)+'</li>').join("")+'</ul>'+
    '<h2>نقطة الاعتماد</h2><p>'+(appr?'☑ اعتمد المراجع إرسال الطلبات للعميل — التاريخ: '+esc(fmtAt(appr.at))+' — الاسم: '+esc(appr.by):'☐ اعتمد المراجع إرسال الطلبات للعميل — التاريخ: ____ — الاسم: ____')+'</p>'+
    '<p class="muted">القيم من محركات SQC؛ درجات الثقة محسوبة بالكود وليست من النموذج اللغوي.</p></body></html>');
  w.document.close();SK.brandPrint(w,title);setTimeout(()=>{try{w.focus();w.print()}catch{}},400);
}
function sendList(no){
  const c=H.compute();if(!c||!c.session)return;const r=c.session.rounds.find(x=>x.no===no),w=window.open("","_blank");if(!w||!r)return;
  const title="قائمة المستندات المطلوبة — "+(c.d.ctx.company||"")+" — الجولة "+no;
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+esc(title)+'</title></head><body><h1>'+esc(title)+'</h1><table><thead><tr><th>#</th><th>المستند المطلوب</th><th>الغرض</th><th>الأولوية</th></tr></thead><tbody>'+
    r.requests.filter(q=>q.round===no).map(q=>'<tr><td>'+esc(q.id)+'</td><td>'+esc(q.title)+'</td><td>'+esc(q.purpose)+'</td><td>'+esc(q.priority)+'</td></tr>').join("")+'</tbody></table><p class="muted">يُرجى تزويدنا بالمستندات أعلاه مع الإشارة إلى رقم الطلب.</p></body></html>');
  w.document.close();SK.brandPrint(w,title);setTimeout(()=>{try{w.focus();w.print()}catch{}},400);
}

/* ---------- events (delegated from the screen) ---------- */
async function onClick(e){
  const b=e.target.closest("[data-cc]");if(!b)return false;
  const a=b.dataset.cc,d=H.st();
  if(a==="size"){d.councilSize=Number(b.dataset.v);H.put(d);H.paint();return true}
  if(a==="approve"){const k=b.dataset.k,ap=CF().APPROVALS.find(x=>x.key===k),by=await askName("اعتماد: "+ap.ar,ap.why);if(!by)return true;
    try{const c=H.compute(),s=c&&c.session;let en=CF().approve(eng(d),k,by.name,by.note,new Date(),k==="escalation"&&s?s.rounds.length:undefined);d.engagement=en;if(c){memo=null;sync(d,c,await prepare(c),"اعتماد: "+CF().APPROVALS.find(x=>x.key===k).ar,by.name)}H.put(d);
      SK.audit&&SK.audit.log("tbreview",{act:"approve",key:k,by:by.name});toast("اعتُمد: "+CF().APPROVALS.find(x=>x.key===k).ar,"ok")}catch(err){toast(err.message,"bad")}H.paint();return true}
  if(a==="approve-requests"){const no=Number(b.dataset.r),by=await askName("اعتماد إرسال طلبات الجولة "+no+" للعميل",CF().ROUND_CHECKLIST[2]+" · "+CF().ROUND_CHECKLIST[3]);if(!by)return true;
    try{d.engagement=CF().approve(eng(d),"requests",by.name,by.note,new Date(),no);H.put(d);toast("اعتُمد إرسال الطلبات للعميل","ok")}catch(err){toast(err.message,"bad")}H.paint();return true}
  if(a==="round-report"){roundReport(Number(b.dataset.r));return true}
  if(a==="send-list"){sendList(Number(b.dataset.r));return true}
  if(a==="threshold"){const lk=b.dataset.l,c=H.compute(),m=c&&await prepare(c),row=m&&m.matrix.rows.find(x=>x.lineKey===lk),t=d.thOverrides||{},cur=t[lk];
    const auto=row?CF().thresholdFor(row):null,ar=row?row.ar:lk;
    const v=await SK.form("عتبة الثقة — "+ar,[{key:"threshold",label:"العتبة الجديدة (0.50 – 0.99)",type:"number",min:0.5,max:0.99,step:0.01,value:cur?cur.threshold:"",hint:"اتركها فارغة للعودة إلى العتبة الآلية"+(auto!=null?" ("+auto.toFixed(2)+")":" (البند غير جوهري)")},
      {key:"reason",label:"سبب التعديل — يُوثق في سجل الاستثناءات",type:"textarea",value:cur?cur.reason:""}],{validate:x=>x.threshold!==""&&!x.reason?"السبب إلزامي لتعديل العتبة (قسم 9.7 من المنهجية)":""});
    if(!v)return true;
    if(v.threshold===""){if(cur){delete t[lk];(d.exceptions=d.exceptions||[]).push({at:nowIso(),by:who()||"المراجع",what:"إعادة عتبة «"+ar+"» إلى الآلية",reason:v.reason||"—"})}d.thOverrides=t;H.put(d);memo=null;H.paint();return true}
    t[lk]={threshold:v.threshold,reason:v.reason};d.thOverrides=t;(d.exceptions=d.exceptions||[]).push({at:nowIso(),by:who()||"المراجع",what:"تعديل عتبة «"+ar+"» إلى "+v.threshold.toFixed(2),reason:v.reason});H.put(d);memo=null;H.paint();return true}
  if(a==="exception"){const v=await SK.form("تسجيل استثناء",[{key:"what",label:"القرار الذي تجاوزته",type:"textarea",required:true,placeholder:"مثال: قبول بند دون العتبة، رفض قرار الاكتفاء"},{key:"reason",label:"السبب",type:"textarea",required:true}],{ok:"تسجيل"});if(!v)return true;
    (d.exceptions=d.exceptions||[]).push({at:nowIso(),by:who()||"المراجع",what:v.what,reason:v.reason});H.put(d);H.paint();return true}
  if(a==="journal-books"){d.journalSource="books";delete d.journalMeta;H.put(d);memo=null;H.paint();return true}
  if(a==="journal-clear"){delete d.journalSource;delete d.journalMeta;H.put(d);memo=null;H.paint();return true}
  return false;
}
async function onChange(e){
  const ck=e.target.closest("[data-ck]");if(ck){const d=H.st(),no=ck.dataset.ck,list=((d.checklists||{})[no]||[]).slice();list[+ck.dataset.i]=ck.checked;d.checklists={...(d.checklists||{}),[no]:list};H.put(d);H.paint();return true}
  const rd=e.target.closest("[data-rd]");if(rd){const d=H.st(),list=(d.readiness||[]).slice();list[+rd.dataset.rd]=rd.checked;d.readiness=list;H.put(d);H.paint();return true}
  const jf=e.target.closest("[data-jfile]");if(jf&&jf.files[0]){const f=jf.files[0];jf.value="";
    try{const text=/\.xlsx$/i.test(f.name)?await SKXlsx.toTsv(f):await f.text(),p=CN().parseJournal(text);if(!p.entries.length){toast(p.errors[0]||"لم أجد قيوداً في الملف","bad");return true}
      const d=H.st();await H.docPut(JKEY,{text});d.journalSource="file";d.journalMeta={name:f.name,count:p.entries.length};H.put(d);memo=null;
      toast("استُلم دفتر القيود: "+p.entries.length+" قيد"+(p.errors.length?" ("+p.errors.length+" سطر لم يُقرأ)":""),"ok");H.paint()}catch(err){toast(err.message,"bad")}return true}
  const em=e.target.closest("[data-evk]");if(em){const d=H.st(),k=em.dataset.evk;d.evidenceMeta={...(d.evidenceMeta||{}),[k]:{...((d.evidenceMeta||{})[k]||{}),[em.dataset.f]:em.dataset.f==="amount"?Number(em.value)||0:em.value}};H.put(d);memo=null;H.paint();return true}
  return false;
}
/* the approver's name (the user menu's name by default) and an optional note */
function askName(title,hint){
  return SK.form(title,[{key:"name",label:"اسم المراجع المعتمد",value:who(),required:true},{key:"note",label:"ملاحظة (اختياري)",type:"textarea"}],{message:hint||"",ok:"اعتماد"});
}
/* the reliability and amount the reviewer tags on each reviewed document (E) */
function evidenceTagger(q,s,d){
  const rev=s?s.rounds.flatMap(r=>r.reviewed).filter(x=>x.requestId===q.id):[];if(!rev.length)return "";
  return rev.map(x=>{const k=x.requestId+"|"+x.fileName,m=(d.evidenceMeta||{})[k]||{};
    return '<div class="tbc-tag"><small>'+esc(x.fileName)+'</small><select data-evk="'+esc(k)+'" data-f="kind" aria-label="نوع الدليل">'+EV_KIND().map(([v,o])=>'<option value="'+v+'"'+((m.kind||(/مصادق/.test(q.title)?"confirmation":"external"))===v?' selected':'')+'>'+esc(o.ar)+' ('+o.w+')</option>').join("")+'</select>'+
      '<input type="number" min="0" step="100" data-evk="'+esc(k)+'" data-f="amount" value="'+(m.amount||"")+'" placeholder="المبلغ المغطى" aria-label="المبلغ المغطى"></div>'}).join("");
}
window.SKosifCouncilUI=Object.freeze({init:h=>{H=h},run,afterRound,aiControls,roundExtras,confTab,onClick,onChange,evidenceTagger,prepare,reset:()=>{memo=null}});
})();

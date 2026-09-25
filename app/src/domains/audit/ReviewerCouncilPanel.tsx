import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {addReviewerVote,closeReviewerRound,resolveReviewerCouncil,validateReviewerRound,type ReviewerCouncilRound} from './reviewer-council-engine';

export function ReviewerCouncilPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<ReviewerCouncilRound>(window.localStorage,makeScopedKey('audit.reviewer-council',scope)),[scope]);
  const [rounds,setRounds]=useState<ReviewerCouncilRound[]>([]);
  const [selectedId,setSelectedId]=useState('');
  const [title,setTitle]=useState('');
  const [subject,setSubject]=useState('');
  const [optionsText,setOptionsText]=useState('تعديل\nعدم تعديل');
  const [reviewer,setReviewer]=useState('');
  const [optionId,setOptionId]=useState('');
  const [confidence,setConfidence]=useState('80');
  const [rationale,setRationale]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void repo.list().then(rows=>{setRounds(rows);if(rows[0])setSelectedId(rows[0].id);});},[repo]);
  const selected=rounds.find(row=>row.id===selectedId)??null;
  const result=useMemo(()=>selected?resolveReviewerCouncil(selected):null,[selected]);

  async function createRound(){
    const options=optionsText.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const round:ReviewerCouncilRound={id:crypto.randomUUID(),title:title.trim(),subject:subject.trim()||undefined,options,votes:[],status:'OPEN',createdAt:new Date().toISOString()};
    if(!validateReviewerRound(round).valid){setMessage('أدخل عنوان الجولة وبديلين مختلفين على الأقل.');return;}
    await repo.put(round);const rows=await repo.list();setRounds(rows);setSelectedId(round.id);setTitle('');setSubject('');setOptionId(options[0]??'');setMessage('تم إنشاء جولة مراجعين.');
  }

  async function vote(){
    if(!selected){setMessage('أنشئ جولة أولًا.');return;}
    try{
      const next=addReviewerVote(selected,{reviewer,optionId,confidence:(Number(confidence)||0)/100,rationale:rationale.trim()||undefined});
      await repo.put(next);setRounds(await repo.list());setReviewer('');setRationale('');setMessage('تم تسجيل رأي المراجع.');
    }catch(error){setMessage(String(error));}
  }

  async function close(){
    if(!selected)return;
    try{
      await repo.put(closeReviewerRound(selected));
      setRounds(await repo.list());
      setMessage('تم إغلاق الجولة بعد تحقق الإجماع.');
    }catch{setMessage('الإجماع غير جاهز للإغلاق. راجع الأصوات أو التعادل.');}
  }

  return <section className="reviewer-council sk-surface">
    <div className="reviewer-council__head"><div><span className="eyebrow">Reviewer Council</span><h3>مجلس المراجعين وجولات الرأي</h3></div><strong>{rounds.filter(r=>r.status==='OPEN').length} مفتوحة</strong></div>
    <div className="reviewer-council__create">
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان الجولة"/>
      <input value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="الموضوع / المرجع"/>
      <textarea value={optionsText} onChange={(e)=>setOptionsText(e.target.value)} placeholder="كل بديل في سطر"/>
      <button onClick={()=>void createRound()}>إنشاء جولة</button>
    </div>
    {rounds.length>0?<label className="reviewer-council__selector">الجولة النشطة<select value={selectedId} onChange={(e)=>{setSelectedId(e.target.value);const r=rounds.find(x=>x.id===e.target.value);setOptionId(r?.options[0]??'');}}>{rounds.map(round=><option key={round.id} value={round.id}>{round.title} · {round.status}</option>)}</select></label>:null}
    {selected?<>
      <div className="reviewer-council__summary">
        <article><span>الأصوات</span><strong>{result?.voteCount??0}</strong></article>
        <article><span>الإجماع</span><strong>{result?.agreementPercent??0}%</strong></article>
        <article><span>متوسط الثقة</span><strong>{result?.averageConfidence??0}%</strong></article>
        <article><span>النتيجة</span><strong>{result?.winningOptionId??(result?.tied?'تعادل':'—')}</strong></article>
      </div>
      {selected.status==='OPEN'?<div className="reviewer-council__vote">
        <input value={reviewer} onChange={(e)=>setReviewer(e.target.value)} placeholder="اسم المراجع / المصدر"/>
        <select value={optionId} onChange={(e)=>setOptionId(e.target.value)}>{selected.options.map(option=><option key={option} value={option}>{option}</option>)}</select>
        <input inputMode="decimal" value={confidence} onChange={(e)=>setConfidence(e.target.value)} placeholder="الثقة %"/>
        <input value={rationale} onChange={(e)=>setRationale(e.target.value)} placeholder="مبررات مختصرة"/>
        <button onClick={()=>void vote()}>تسجيل الرأي</button>
        <button className="secondary" onClick={()=>void close()}>إغلاق الجولة</button>
      </div>:null}
      <div className="reviewer-council__votes">{selected.votes.map(vote=><article key={vote.id}><div><b>{vote.reviewer}</b><small>{new Date(vote.at).toLocaleString('ar-SA')}</small></div><span>{vote.optionId}</span><strong>{Math.round(vote.confidence*100)}%</strong><small>{vote.rationale??'—'}</small></article>)}</div>
    </>:null}
    {message?<p className="audit-message">{message}</p>:null}
    <p className="reviewer-council__note">المجلس يسجل آراء بشرية أو نتائج مصادر خارجية كما هي؛ لا ينسب النظام رأيًا لنموذج أو مراجع لم يقدمه فعليًا.</p>
  </section>;
}

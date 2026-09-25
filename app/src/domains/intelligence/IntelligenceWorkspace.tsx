import {useMemo,useState} from 'react';
import {resolveCouncil,type CouncilVote} from './council-engine';
import './intelligence-workspace.css';

export function IntelligenceWorkspace(){
  const [votes,setVotes]=useState<CouncilVote[]>([]);
  const [provider,setProvider]=useState('openai');
  const [optionId,setOptionId]=useState('A');
  const [confidence,setConfidence]=useState('80');
  const result=useMemo(()=>resolveCouncil(votes),[votes]);

  function addVote(){
    const value=Math.min(100,Math.max(0,Number(confidence)||0))/100;
    if(!provider.trim()||!optionId.trim())return;
    setVotes((rows)=>[...rows,{provider:provider.trim(),optionId:optionId.trim(),confidence:value}]);
  }

  return <section className="intelligence-workspace">
    <div className="intelligence-grid">
      <section className="sk-surface intelligence-form">
        <span className="eyebrow">Decision Council</span><h3>مصفوفة الإجماع</h3>
        <label>المصدر<input value={provider} onChange={(e)=>setProvider(e.target.value)} placeholder="openai / gemini / claude"/></label>
        <label>الخيار<input value={optionId} onChange={(e)=>setOptionId(e.target.value)} placeholder="A"/></label>
        <label>الثقة %<input inputMode="decimal" value={confidence} onChange={(e)=>setConfidence(e.target.value)}/></label>
        <button onClick={addVote}>إضافة تصويت</button>
        <p>واجهة Jev الخارجية لن تُزيف في المتصفح. تم بناء Gateway typed لها، وسيتم توصيلها عبر Backend/Worker بدون وضع مفاتيح سرية في الواجهة.</p>
      </section>
      <section className="sk-surface intelligence-result">
        <span className="eyebrow">Consensus</span><h3>نتيجة المجلس</h3>
        <div className="intelligence-kpis"><div><span>الخيار</span><strong>{result.winningOptionId??'—'}</strong></div><div><span>الاتفاق</span><strong>{result.agreementPercent}%</strong></div><div><span>الثقة</span><strong>{Math.round(result.confidence*100)}%</strong></div></div>
        <div className="vote-list">{votes.map((vote,index)=><article key={vote.provider+'-'+index}><b>{vote.provider}</b><span>{vote.optionId}</span><span>{Math.round(vote.confidence*100)}%</span></article>)}</div>
      </section>
    </div>
  </section>;
}

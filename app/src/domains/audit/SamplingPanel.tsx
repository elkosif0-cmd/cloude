import {useMemo,useState} from 'react';
import {selectAuditSample,type PopulationItem} from './sampling-engine';

function parsePopulation(text:string):PopulationItem[]{
  return text.split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line,index)=>{
    const [idRaw,amountRaw]=line.split(',');
    return {id:(idRaw||('ROW-'+(index+1))).trim(),amount:Number((amountRaw||'0').trim())||0};
  });
}

export function SamplingPanel(){
  const [populationText,setPopulationText]=useState('');
  const [sampleSize,setSampleSize]=useState('10');
  const [threshold,setThreshold]=useState('0');
  const [seed,setSeed]=useState('20260925');
  const population=useMemo(()=>parsePopulation(populationText),[populationText]);
  const sample=useMemo(()=>selectAuditSample(population,{sampleSize:Number(sampleSize)||0,seed:Number(seed)||20260925,includeAllAbove:(Number(threshold)||0)>0?Number(threshold):undefined}),[population,sampleSize,threshold,seed]);

  return <section className="audit-sampling sk-surface">
    <div className="audit-sampling__head"><div><span className="eyebrow">Audit Sampling</span><h3>اختيار العينة</h3></div><strong className="sk-number">{sample.length}/{population.length}</strong></div>
    <div className="audit-sampling__grid">
      <div><label>المجتمع - كل سطر: ID,Amount<textarea value={populationText} onChange={(e)=>setPopulationText(e.target.value)} placeholder={'INV-1,1500\nINV-2,800\nINV-3,25000'}/></label></div>
      <div className="audit-sampling__controls"><label>حجم العينة<input inputMode="numeric" value={sampleSize} onChange={(e)=>setSampleSize(e.target.value)}/></label><label>إدراج إجباري فوق<input inputMode="decimal" value={threshold} onChange={(e)=>setThreshold(e.target.value)}/></label><label>Seed<input inputMode="numeric" value={seed} onChange={(e)=>setSeed(e.target.value)}/></label></div>
    </div>
    {sample.length===0?<p className="audit-empty">ألصق مجتمعًا فعليًا لبدء اختيار العينة.</p>:<div className="audit-sample-list">{sample.map((item)=><span key={item.id}><b>{item.id}</b><i className="sk-number">{item.amount.toLocaleString('en-US')}</i></span>)}</div>}
  </section>;
}

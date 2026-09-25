import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {evaluateDecision,validateDecision,type DecisionCase} from './decision-engine';

function parseLines(text:string){
  return text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
}

export function DecisionCenterPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<DecisionCase>(window.localStorage,makeScopedKey('intelligence.decisions',scope)),[scope]);
  const [cases,setCases]=useState<DecisionCase[]>([]);
  const [selectedId,setSelectedId]=useState('');
  const [title,setTitle]=useState('');
  const [optionsText,setOptionsText]=useState('الخيار A\nالخيار B');
  const [criteriaText,setCriteriaText]=useState('التكلفة|50\nالجودة|50');
  const [message,setMessage]=useState('');

  useEffect(()=>{void repo.list().then(rows=>{setCases(rows);if(rows[0])setSelectedId(rows[0].id);});},[repo]);
  const selected=cases.find(row=>row.id===selectedId)??null;
  const results=useMemo(()=>selected?evaluateDecision(selected):[],[selected]);

  async function create(){
    const criteria=parseLines(criteriaText).map((line,index)=>{
      const parts=line.split('|').map(x=>x.trim());
      return {id:'c-'+(index+1)+'-'+crypto.randomUUID().slice(0,5),label:parts[0]??'',weight:Number(parts[1])||0};
    });
    const options=parseLines(optionsText).map((label,index)=>({id:'o-'+(index+1)+'-'+crypto.randomUUID().slice(0,5),label,scores:{}}));
    const decision:DecisionCase={id:crypto.randomUUID(),title:title.trim(),criteria,options,createdAt:new Date().toISOString()};
    if(!validateDecision(decision).valid){setMessage('أدخل عنوانًا وبديلين على الأقل ومعيارًا واحدًا بصيغة: المعيار|الوزن.');return;}
    await repo.put(decision);
    const rows=await repo.list();
    setCases(rows);
    setSelectedId(decision.id);
    setTitle('');
    setMessage('تم إنشاء حالة القرار.');
  }

  async function score(optionId:string,criterionId:string,value:number){
    if(!selected)return;
    const next:DecisionCase={
      ...selected,
      options:selected.options.map(option=>option.id===optionId?{...option,scores:{...option.scores,[criterionId]:Math.min(100,Math.max(0,value))}}:option),
    };
    await repo.put(next);
    setCases(await repo.list());
  }

  return <section className="decision-center sk-surface">
    <div className="decision-center__head"><div><span className="eyebrow">Decision Center</span><h3>مصفوفة قرار موزونة</h3></div><strong>{cases.length} حالة</strong></div>
    <div className="decision-center__create">
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان القرار"/>
      <textarea value={optionsText} onChange={(e)=>setOptionsText(e.target.value)} placeholder="كل بديل في سطر"/>
      <textarea value={criteriaText} onChange={(e)=>setCriteriaText(e.target.value)} placeholder="المعيار|الوزن"/>
      <button onClick={()=>void create()}>إنشاء حالة</button>
    </div>
    {message?<p className="intelligence-message">{message}</p>:null}
    {cases.length>0?<label className="decision-center__selector">الحالة النشطة<select value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>{cases.map(row=><option key={row.id} value={row.id}>{row.title}</option>)}</select></label>:null}
    {selected?<div className="decision-center__matrix">
      <div className="decision-center__table-wrap"><table><thead><tr><th>البديل</th>{selected.criteria.map(c=><th key={c.id}>{c.label}<small>{c.weight}</small></th>)}<th>النتيجة</th><th>التغطية</th></tr></thead><tbody>{selected.options.map(option=>{
        const result=results.find(r=>r.optionId===option.id);
        return <tr key={option.id}><td><b>{option.label}</b></td>{selected.criteria.map(c=><td key={c.id}><input type="number" min="0" max="100" value={option.scores[c.id]??''} onChange={(e)=>void score(option.id,c.id,Number(e.target.value)||0)}/></td>)}<td><strong>{result?.weightedScore??0}</strong></td><td>{result?.coveragePercent??0}%</td></tr>;
      })}</tbody></table></div>
      <div className="decision-center__ranking">{results.map((result,index)=><article key={result.optionId}><span>#{index+1}</span><div><b>{result.label}</b><small>تغطية {result.coveragePercent}%</small></div><strong>{result.weightedScore}</strong></article>)}</div>
    </div>:null}
    <p className="decision-center__note">هذه المصفوفة لا تستبدل الحكم البشري؛ استخدمها لتنظيم البدائل ثم مرّر القرار إلى Jev عند الحاجة لتحليل مستقل.</p>
  </section>;
}

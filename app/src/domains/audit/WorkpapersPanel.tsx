import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {AuditIssue} from './issues-engine';
import type {EvidenceRecord} from './evidence-engine';
import type {AuditPlan} from './planning-engine';
import {canTransitionWorkpaper,transitionWorkpaper,workpaperCompletion,type Workpaper,type WorkpaperStatus} from './workpapers-engine';

export function WorkpapersPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<Workpaper>(window.localStorage,makeScopedKey('audit.workpapers',scope)),[scope]);
  const evidenceRepo=useMemo(()=>new JsonStorageRepository<EvidenceRecord>(window.localStorage,makeScopedKey('audit.evidence',scope)),[scope]);
  const issueRepo=useMemo(()=>new JsonStorageRepository<AuditIssue>(window.localStorage,makeScopedKey('audit.issues',scope)),[scope]);
  const planRepo=useMemo(()=>new JsonStorageRepository<AuditPlan>(window.localStorage,makeScopedKey('audit.plans',scope)),[scope]);
  const [rows,setRows]=useState<Workpaper[]>([]);
  const [evidence,setEvidence]=useState<EvidenceRecord[]>([]);
  const [issues,setIssues]=useState<AuditIssue[]>([]);
  const [plans,setPlans]=useState<AuditPlan[]>([]);
  const [reference,setReference]=useState('');
  const [title,setTitle]=useState('');
  const [area,setArea]=useState('');
  const [objective,setObjective]=useState('');
  const [procedure,setProcedure]=useState('');
  const [conclusion,setConclusion]=useState('');
  const [actor,setActor]=useState('');
  const [riskId,setRiskId]=useState('');
  const [evidenceId,setEvidenceId]=useState('');
  const [issueId,setIssueId]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([repo.list(),evidenceRepo.list(),issueRepo.list(),planRepo.list()]).then(([w,e,i,p])=>{setRows(w);setEvidence(e);setIssues(i);setPlans(p);});},[repo,evidenceRepo,issueRepo,planRepo]);
  const risks=plans.flatMap(plan=>plan.risks);
  const completion=workpaperCompletion(rows);

  async function add(){
    if(!reference.trim()||!title.trim()){setMessage('أدخل مرجع ورقة العمل وعنوانها.');return;}
    const row:Workpaper={
      id:crypto.randomUUID(),reference:reference.trim(),title:title.trim(),area:area.trim(),
      objective:objective.trim(),procedure:procedure.trim(),conclusion:conclusion.trim(),
      riskIds:riskId?[riskId]:[],evidenceIds:evidenceId?[evidenceId]:[],issueIds:issueId?[issueId]:[],status:'DRAFT'
    };
    await repo.put(row);setRows(await repo.list());
    setReference('');setTitle('');setArea('');setObjective('');setProcedure('');setConclusion('');setRiskId('');setEvidenceId('');setIssueId('');
    setMessage('تم إنشاء ورقة العمل.');
  }

  async function move(row:Workpaper,to:WorkpaperStatus){
    try{
      await repo.put(transitionWorkpaper(row,to,actor.trim()||undefined));
      setRows(await repo.list());setMessage('تم تحديث دورة ورقة العمل.');
    }catch(error){setMessage(String(error));}
  }

  return <section className="audit-workpapers sk-surface">
    <div className="audit-workpapers__head"><div><span className="eyebrow">Workpapers</span><h3>أوراق العمل والمراجعة</h3></div><strong>{completion}% مراجَع</strong></div>
    <div className="audit-workpapers__form">
      <input value={reference} onChange={(e)=>setReference(e.target.value)} placeholder="مرجع A-1"/>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="العنوان"/>
      <input value={area} onChange={(e)=>setArea(e.target.value)} placeholder="المجال"/>
      <input value={objective} onChange={(e)=>setObjective(e.target.value)} placeholder="الهدف"/>
      <input value={procedure} onChange={(e)=>setProcedure(e.target.value)} placeholder="الإجراء"/>
      <input value={conclusion} onChange={(e)=>setConclusion(e.target.value)} placeholder="الاستنتاج"/>
      <select value={riskId} onChange={(e)=>setRiskId(e.target.value)}><option value="">خطر مرتبط - اختياري</option>{risks.map(r=><option key={r.id} value={r.id}>{r.area} · {r.description}</option>)}</select>
      <select value={evidenceId} onChange={(e)=>setEvidenceId(e.target.value)}><option value="">دليل مرتبط - اختياري</option>{evidence.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select>
      <select value={issueId} onChange={(e)=>setIssueId(e.target.value)}><option value="">ملاحظة مرتبطة - اختياري</option>{issues.map(i=><option key={i.id} value={i.id}>{i.title}</option>)}</select>
      <input value={actor} onChange={(e)=>setActor(e.target.value)} placeholder="المُعد / المراجع"/>
      <button onClick={()=>void add()}>إنشاء ورقة عمل</button>
    </div>
    {message?<p className="audit-message">{message}</p>:null}
    {rows.length===0?<p className="audit-empty">لا توجد أوراق عمل بعد.</p>:<div className="audit-workpapers__list">{rows.map(row=><article key={row.id}>
      <div><b>{row.reference} · {row.title}</b><small>{row.area||'بدون مجال'} · {row.status}</small></div>
      <span>{row.objective||'—'}</span>
      <span>{row.conclusion||'—'}</span>
      <div>{(['DRAFT','PREPARED','REVIEWED','LOCKED'] as WorkpaperStatus[]).filter(status=>canTransitionWorkpaper(row.status,status)).map(status=><button key={status} onClick={()=>void move(row,status)}>{status}</button>)}</div>
    </article>)}</div>}
  </section>;
}

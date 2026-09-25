import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {planningCompletion,planRiskScore,significantRisks,validateAuditPlan,type AuditAssertion,type AuditPlan,type RiskRating} from './planning-engine';

const ASSERTIONS:Record<AuditAssertion,string>={
  existence:'الوجود',
  completeness:'الاكتمال',
  accuracy:'الدقة',
  valuation:'التقييم',
  rights:'الحقوق والالتزامات',
  cutoff:'القطع',
  presentation:'العرض والإفصاح',
};

export function PlanningPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<AuditPlan>(window.localStorage,makeScopedKey('audit.plans',scope)),[scope]);
  const [plans,setPlans]=useState<AuditPlan[]>([]);
  const [selectedId,setSelectedId]=useState('');
  const [title,setTitle]=useState('');
  const [period,setPeriod]=useState('2026');
  const [objective,setObjective]=useState('إبداء رأي مهني على القوائم المالية وفق إطار التقرير المالي المعمول به.');
  const [riskArea,setRiskArea]=useState('');
  const [description,setDescription]=useState('');
  const [rating,setRating]=useState<RiskRating>('MEDIUM');
  const [assertion,setAssertion]=useState<AuditAssertion>('existence');
  const [response,setResponse]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void repo.list().then(rows=>{setPlans(rows);if(rows[0])setSelectedId(rows[0].id);});},[repo]);
  const selected=plans.find(p=>p.id===selectedId)??null;

  async function createPlan(){
    const plan:AuditPlan={id:crypto.randomUUID(),title:title.trim(),period:period.trim(),objective:objective.trim(),risks:[]};
    const result=validateAuditPlan(plan);
    if(!title.trim()||!period.trim()||!objective.trim()){setMessage('أكمل عنوان الخطة والفترة والهدف.');return;}
    if(!result.valid&&result.issues.some(x=>!x.includes(':'))){setMessage('بيانات الخطة غير مكتملة.');return;}
    await repo.put(plan);
    const rows=await repo.list();setPlans(rows);setSelectedId(plan.id);setTitle('');setMessage('تم إنشاء خطة المراجعة.');
  }

  async function addRisk(){
    if(!selected){setMessage('أنشئ خطة أولًا.');return;}
    if(!riskArea.trim()||!description.trim()||!response.trim()){setMessage('أكمل منطقة الخطر والوصف والاستجابة المخططة.');return;}
    const next:AuditPlan={...selected,risks:[...selected.risks,{
      id:crypto.randomUUID(),
      area:riskArea.trim(),
      description:description.trim(),
      rating,
      assertions:[assertion],
      plannedResponse:response.trim(),
      completed:false,
    }]};
    await repo.put(next);
    setPlans(await repo.list());
    setRiskArea('');setDescription('');setResponse('');setMessage('تمت إضافة الخطر والاستجابة.');
  }

  async function toggleRisk(riskId:string){
    if(!selected)return;
    const next={...selected,risks:selected.risks.map(r=>r.id===riskId?{...r,completed:!r.completed}:r)};
    await repo.put(next);setPlans(await repo.list());
  }

  return <section className="audit-planning sk-surface">
    <div className="audit-planning__head"><div><span className="eyebrow">Audit Planning</span><h3>تخطيط الارتباط ومصفوفة المخاطر</h3></div><strong>{plans.length} خطة</strong></div>
    <div className="audit-planning__create">
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان الخطة"/>
      <input value={period} onChange={(e)=>setPeriod(e.target.value)} placeholder="الفترة"/>
      <input value={objective} onChange={(e)=>setObjective(e.target.value)} placeholder="هدف المراجعة"/>
      <button onClick={()=>void createPlan()}>إنشاء خطة</button>
    </div>
    {plans.length>0?<label className="audit-planning__selector">الخطة النشطة<select value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>{plans.map(p=><option key={p.id} value={p.id}>{p.title} · {p.period}</option>)}</select></label>:null}
    {selected?<div className="audit-planning__metrics">
      <article><span>مؤشر المخاطر</span><strong>{planRiskScore(selected)}%</strong></article>
      <article><span>الإنجاز</span><strong>{planningCompletion(selected)}%</strong></article>
      <article><span>مرتفعة/جوهرية</span><strong>{significantRisks(selected).length}</strong></article>
      <article><span>إجمالي المخاطر</span><strong>{selected.risks.length}</strong></article>
    </div>:null}
    {selected?<div className="audit-planning__risk-form">
      <input value={riskArea} onChange={(e)=>setRiskArea(e.target.value)} placeholder="منطقة الخطر"/>
      <input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="وصف الخطر"/>
      <select value={rating} onChange={(e)=>setRating(e.target.value as RiskRating)}><option value="LOW">منخفض</option><option value="MEDIUM">متوسط</option><option value="HIGH">مرتفع</option><option value="SIGNIFICANT">خطر جوهري</option></select>
      <select value={assertion} onChange={(e)=>setAssertion(e.target.value as AuditAssertion)}>{Object.entries(ASSERTIONS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      <input value={response} onChange={(e)=>setResponse(e.target.value)} placeholder="الاستجابة/الإجراء المخطط"/>
      <button onClick={()=>void addRisk()}>إضافة خطر</button>
    </div>:null}
    {message?<p className="audit-message">{message}</p>:null}
    {selected?.risks.length?<div className="audit-planning__risks">{selected.risks.map(risk=><article key={risk.id} data-completed={risk.completed}><div><b>{risk.area}</b><small>{risk.rating} · {risk.assertions.map(a=>ASSERTIONS[a]).join('، ')}</small></div><span>{risk.description}</span><span>{risk.plannedResponse}</span><button onClick={()=>void toggleRisk(risk.id)}>{risk.completed?'إعادة فتح':'تم التنفيذ'}</button></article>)}</div>:null}
  </section>;
}

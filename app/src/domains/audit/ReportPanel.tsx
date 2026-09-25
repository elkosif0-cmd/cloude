import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {EvidenceRecord} from './evidence-engine';
import type {AuditIssue} from './issues-engine';
import type {PbcRequest} from './pbc-engine';
import {auditCompletionGates,finalizeAuditReport,type AuditReportDraft,type OpinionType} from './report-engine';
import type {Workpaper} from './workpapers-engine';

export function ReportPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const reportRepo=useMemo(()=>new JsonStorageRepository<AuditReportDraft>(window.localStorage,makeScopedKey('audit.reports',scope)),[scope]);
  const evidenceRepo=useMemo(()=>new JsonStorageRepository<EvidenceRecord>(window.localStorage,makeScopedKey('audit.evidence',scope)),[scope]);
  const issueRepo=useMemo(()=>new JsonStorageRepository<AuditIssue>(window.localStorage,makeScopedKey('audit.issues',scope)),[scope]);
  const pbcRepo=useMemo(()=>new JsonStorageRepository<PbcRequest>(window.localStorage,makeScopedKey('audit.pbc',scope)),[scope]);
  const wpRepo=useMemo(()=>new JsonStorageRepository<Workpaper>(window.localStorage,makeScopedKey('audit.workpapers',scope)),[scope]);

  const [reports,setReports]=useState<AuditReportDraft[]>([]);
  const [evidence,setEvidence]=useState<EvidenceRecord[]>([]);
  const [issues,setIssues]=useState<AuditIssue[]>([]);
  const [pbc,setPbc]=useState<PbcRequest[]>([]);
  const [workpapers,setWorkpapers]=useState<Workpaper[]>([]);
  const [entityName,setEntityName]=useState('');
  const [period,setPeriod]=useState('2026');
  const [opinionType,setOpinionType]=useState<OpinionType>('UNSET');
  const [opinionText,setOpinionText]=useState('');
  const [basisText,setBasisText]=useState('');
  const [keyAuditMatters,setKeyAuditMatters]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([reportRepo.list(),evidenceRepo.list(),issueRepo.list(),pbcRepo.list(),wpRepo.list()]).then(([r,e,i,p,w])=>{setReports(r);setEvidence(e);setIssues(i);setPbc(p);setWorkpapers(w);});},[reportRepo,evidenceRepo,issueRepo,pbcRepo,wpRepo]);
  const gates=useMemo(()=>auditCompletionGates({evidence,issues,pbc,workpapers}),[evidence,issues,pbc,workpapers]);

  function makeDraft():AuditReportDraft{
    return {id:'report-current',title:'تقرير المراجع',entityName:entityName.trim(),period:period.trim(),opinionType,opinionText,basisText,keyAuditMatters,otherInformation:'',responsibilities:'',auditorResponsibilities:'',status:'DRAFT'};
  }

  async function save(){
    const draft=makeDraft();
    await reportRepo.put(draft);setReports(await reportRepo.list());setMessage('تم حفظ مسودة التقرير.');
  }

  async function finalize(){
    try{
      const final=finalizeAuditReport(makeDraft(),gates);
      await reportRepo.put(final);setReports(await reportRepo.list());setMessage('تم تثبيت التقرير كنهائي بعد اجتياز بوابات الإكمال.');
    }catch(error){setMessage(String(error));}
  }

  const current=reports.find(r=>r.id==='report-current');

  return <section className="audit-report sk-surface">
    <div className="audit-report__head"><div><span className="eyebrow">Completion & Report</span><h3>التقرير النهائي وبوابات الإكمال</h3></div><strong>{current?.status??'DRAFT'}</strong></div>
    <div className="audit-gates">{gates.map(gate=><article key={gate.code} data-pass={gate.passed}><span>{gate.label}</span><b>{gate.passed?'مكتمل':(gate.count??0)+' متبقٍ'}</b></article>)}</div>
    <div className="audit-report__form">
      <input value={entityName} onChange={(e)=>setEntityName(e.target.value)} placeholder="اسم المنشأة"/>
      <input value={period} onChange={(e)=>setPeriod(e.target.value)} placeholder="الفترة"/>
      <select value={opinionType} onChange={(e)=>setOpinionType(e.target.value as OpinionType)}>
        <option value="UNSET">اختر نوع الرأي</option><option value="UNMODIFIED">غير معدل</option><option value="QUALIFIED">متحفظ</option><option value="ADVERSE">معاكس</option><option value="DISCLAIMER">امتناع عن إبداء الرأي</option>
      </select>
      <textarea value={opinionText} onChange={(e)=>setOpinionText(e.target.value)} placeholder="نص الرأي — قرار مهني بشري"/>
      <textarea value={basisText} onChange={(e)=>setBasisText(e.target.value)} placeholder="أساس الرأي"/>
      <textarea value={keyAuditMatters} onChange={(e)=>setKeyAuditMatters(e.target.value)} placeholder="أمور المراجعة الرئيسية"/>
      <div><button className="secondary" onClick={()=>void save()}>حفظ مسودة</button><button onClick={()=>void finalize()}>تثبيت نهائي</button></div>
    </div>
    {message?<p className="audit-message">{message}</p>:null}
    <p className="audit-report__note">النظام لا يختار نوع الرأي تلقائيًا. نوع الرأي ونصه مسؤولية مهنية بشرية، بينما بوابات الإكمال تمنع تثبيت تقرير نهائي قبل معالجة النواقص المسجلة.</p>
  </section>;
}

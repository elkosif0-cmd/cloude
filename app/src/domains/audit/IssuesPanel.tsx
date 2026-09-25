import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {canTransitionIssue,transitionIssue,type AuditIssue,type AuditIssueSeverity,type AuditIssueStatus} from './issues-engine';

export function IssuesPanel(){
  const [issues,setIssues]=useState<AuditIssue[]>([]);
  const [title,setTitle]=useState('');
  const [severity,setSeverity]=useState<AuditIssueSeverity>('MEDIUM');
  const storageKey=useMemo(()=>makeScopedKey('audit.issues',readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<AuditIssue & {id:string}>(window.localStorage,storageKey),[storageKey]);
  useEffect(()=>{void repo.list().then(setIssues);},[repo]);

  async function addIssue(){
    if(!title.trim())return;
    await repo.put({id:crypto.randomUUID(),title:title.trim(),severity,status:'OPEN'});
    setIssues(await repo.list());setTitle('');
  }

  async function move(issue:AuditIssue,to:AuditIssueStatus){
    if(!canTransitionIssue(issue.status,to))return;
    await repo.put(transitionIssue(issue,to));
    setIssues(await repo.list());
  }

  return <section className="audit-issues sk-surface">
    <div className="audit-issues__head"><div><span className="eyebrow">Audit Issues</span><h3>ملاحظات المراجعة</h3></div><strong>{issues.filter((x)=>x.status!=='FINAL').length} مفتوحة</strong></div>
    <div className="audit-issues__form"><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان الملاحظة"/><select value={severity} onChange={(e)=>setSeverity(e.target.value as AuditIssueSeverity)}><option value="LOW">منخفضة</option><option value="MEDIUM">متوسطة</option><option value="HIGH">عالية</option><option value="CRITICAL">حرجة</option></select><button onClick={()=>void addIssue()}>إضافة</button></div>
    {issues.length===0?<p className="audit-empty">لا توجد ملاحظات مراجعة حتى الآن.</p>:<div className="audit-issues__list">{issues.map((issue)=><article key={issue.id}><div><b>{issue.title}</b><small>{issue.severity}</small></div><span>{issue.status}</span><select value={issue.status} onChange={(e)=>void move(issue,e.target.value as AuditIssueStatus)}>{(['OPEN','MANAGEMENT_RESPONSE','CLEARED','FINAL'] as AuditIssueStatus[]).map((status)=><option key={status} value={status} disabled={status!==issue.status&&!canTransitionIssue(issue.status,status)}>{status}</option>)}</select></article>)}</div>}
  </section>;
}

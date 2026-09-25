import type {EvidenceRecord} from './evidence-engine';
import type {AuditIssue} from './issues-engine';
import type {PbcRequest} from './pbc-engine';
import {derivePbcStatus} from './pbc-engine';
import type {Workpaper} from './workpapers-engine';

export type OpinionType='UNMODIFIED'|'QUALIFIED'|'ADVERSE'|'DISCLAIMER'|'UNSET';

export type AuditReportDraft={
  id:string;
  title:string;
  entityName:string;
  period:string;
  opinionType:OpinionType;
  opinionText:string;
  basisText:string;
  keyAuditMatters:string;
  otherInformation:string;
  responsibilities:string;
  auditorResponsibilities:string;
  status:'DRAFT'|'FINAL';
};

export type CompletionGate={
  code:string;
  label:string;
  passed:boolean;
  count?:number;
};

export function auditCompletionGates(input:{
  evidence:EvidenceRecord[];
  issues:AuditIssue[];
  pbc:PbcRequest[];
  workpapers:Workpaper[];
}):CompletionGate[]{
  const unreviewedEvidence=input.evidence.filter(e=>e.status!=='REVIEWED').length;
  const openSevere=input.issues.filter(i=>(i.severity==='HIGH'||i.severity==='CRITICAL')&&i.status!=='CLEARED'&&i.status!=='FINAL').length;
  const incompletePbc=input.pbc.filter(p=>!['RECEIVED','CLOSED'].includes(derivePbcStatus(p))).length;
  const unreviewedWorkpapers=input.workpapers.filter(w=>w.status!=='REVIEWED'&&w.status!=='LOCKED').length;
  return [
    {code:'EVIDENCE_REVIEW',label:'كل الأدلة تمت مراجعتها',passed:unreviewedEvidence===0,count:unreviewedEvidence},
    {code:'SEVERE_ISSUES',label:'لا توجد ملاحظات عالية/حرجة مفتوحة',passed:openSevere===0,count:openSevere},
    {code:'PBC_COMPLETE',label:'طلبات PBC مكتملة أو مغلقة',passed:incompletePbc===0,count:incompletePbc},
    {code:'WORKPAPERS_REVIEWED',label:'أوراق العمل تمت مراجعتها',passed:unreviewedWorkpapers===0,count:unreviewedWorkpapers},
  ];
}

export function canFinalizeAuditReport(gates:CompletionGate[]){
  return gates.every(gate=>gate.passed);
}

export function finalizeAuditReport(report:AuditReportDraft,gates:CompletionGate[]):AuditReportDraft{
  if(report.opinionType==='UNSET')throw new Error('OPINION_TYPE_REQUIRED');
  if(!report.opinionText.trim())throw new Error('OPINION_TEXT_REQUIRED');
  if(!report.basisText.trim())throw new Error('BASIS_TEXT_REQUIRED');
  if(!canFinalizeAuditReport(gates))throw new Error('COMPLETION_GATES_FAILED');
  return {...report,status:'FINAL'};
}

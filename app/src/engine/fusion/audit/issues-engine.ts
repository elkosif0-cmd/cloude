export type AuditIssueStatus='OPEN'|'MANAGEMENT_RESPONSE'|'CLEARED'|'FINAL';
export type AuditIssueSeverity='LOW'|'MEDIUM'|'HIGH'|'CRITICAL';

export type AuditIssue={
  id:string;
  title:string;
  severity:AuditIssueSeverity;
  status:AuditIssueStatus;
  owner?:string;
  response?:string;
};

const allowed:Record<AuditIssueStatus,AuditIssueStatus[]>={
  OPEN:['MANAGEMENT_RESPONSE','FINAL'],
  MANAGEMENT_RESPONSE:['OPEN','CLEARED','FINAL'],
  CLEARED:['OPEN','FINAL'],
  FINAL:[],
};

export function canTransitionIssue(from:AuditIssueStatus,to:AuditIssueStatus){
  return allowed[from].includes(to);
}

export function transitionIssue(issue:AuditIssue,to:AuditIssueStatus):AuditIssue{
  if(!canTransitionIssue(issue.status,to))throw new Error('INVALID_AUDIT_ISSUE_TRANSITION');
  return {...issue,status:to};
}

export function issueRiskWeight(severity:AuditIssueSeverity){
  return {LOW:1,MEDIUM:2,HIGH:3,CRITICAL:4}[severity];
}

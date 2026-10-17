export type RiskRating='LOW'|'MEDIUM'|'HIGH'|'SIGNIFICANT';
export type AuditAssertion='existence'|'completeness'|'accuracy'|'valuation'|'rights'|'cutoff'|'presentation';

export type AuditRisk={
  id:string;
  area:string;
  description:string;
  rating:RiskRating;
  assertions:AuditAssertion[];
  plannedResponse:string;
  owner?:string;
  completed:boolean;
};

export type AuditPlan={
  id:string;
  title:string;
  period:string;
  objective:string;
  risks:AuditRisk[];
};

const weight:Record<RiskRating,number>={LOW:1,MEDIUM:2,HIGH:3,SIGNIFICANT:4};

export function planRiskScore(plan:AuditPlan){
  if(plan.risks.length===0)return 0;
  const achieved=plan.risks.reduce((sum,risk)=>sum+weight[risk.rating],0);
  return Math.round((achieved/(plan.risks.length*4))*10000)/100;
}

export function planningCompletion(plan:AuditPlan){
  if(plan.risks.length===0)return 0;
  return Math.round((plan.risks.filter(risk=>risk.completed).length/plan.risks.length)*10000)/100;
}

export function significantRisks(plan:AuditPlan){
  return plan.risks.filter(risk=>risk.rating==='SIGNIFICANT'||risk.rating==='HIGH');
}

export function validateAuditPlan(plan:AuditPlan){
  const issues:string[]=[];
  if(!plan.title.trim())issues.push('TITLE_REQUIRED');
  if(!plan.period.trim())issues.push('PERIOD_REQUIRED');
  if(!plan.objective.trim())issues.push('OBJECTIVE_REQUIRED');
  for(const risk of plan.risks){
    if(!risk.area.trim())issues.push('RISK_AREA_REQUIRED:'+risk.id);
    if(!risk.description.trim())issues.push('RISK_DESCRIPTION_REQUIRED:'+risk.id);
    if(risk.assertions.length===0)issues.push('ASSERTION_REQUIRED:'+risk.id);
    if(!risk.plannedResponse.trim())issues.push('PLANNED_RESPONSE_REQUIRED:'+risk.id);
  }
  return {valid:issues.length===0,issues};
}

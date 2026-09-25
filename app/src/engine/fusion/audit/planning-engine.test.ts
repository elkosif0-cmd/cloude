import {describe,expect,it} from 'vitest';
import {planningCompletion,planRiskScore,significantRisks,validateAuditPlan,type AuditPlan} from './planning-engine';

const plan:AuditPlan={
  id:'A1',title:'مراجعة 2026',period:'2026',objective:'إبداء رأي',risks:[
    {id:'R1',area:'Revenue',description:'Cutoff',rating:'SIGNIFICANT',assertions:['cutoff'],plannedResponse:'Test year-end sales',completed:true},
    {id:'R2',area:'Cash',description:'Existence',rating:'MEDIUM',assertions:['existence'],plannedResponse:'Confirm banks',completed:false},
  ]
};

describe('audit planning',()=>{
  it('calculates risk score and completion',()=>{
    expect(planRiskScore(plan)).toBe(75);
    expect(planningCompletion(plan)).toBe(50);
    expect(significantRisks(plan).map(x=>x.id)).toEqual(['R1']);
  });
  it('validates mandatory planning fields',()=>{
    expect(validateAuditPlan(plan).valid).toBe(true);
    expect(validateAuditPlan({...plan,objective:''}).issues).toContain('OBJECTIVE_REQUIRED');
  });
});

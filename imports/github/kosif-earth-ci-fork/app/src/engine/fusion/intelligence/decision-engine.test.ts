import {describe,expect,it} from 'vitest';
import {evaluateDecision,validateDecision,type DecisionCase} from './decision-engine';

const decision:DecisionCase={
  id:'D1',title:'اختيار مورد',createdAt:'2026-09-25',
  criteria:[{id:'price',label:'السعر',weight:60},{id:'quality',label:'الجودة',weight:40}],
  options:[
    {id:'A',label:'أ',scores:{price:90,quality:60}},
    {id:'B',label:'ب',scores:{price:70,quality:95}},
  ],
};

describe('decision engine',()=>{
  it('weights criteria and sorts options',()=>{
    const result=evaluateDecision(decision);
    expect(result[0]).toEqual(expect.objectContaining({optionId:'B',weightedScore:80}));
    expect(result[1]).toEqual(expect.objectContaining({optionId:'A',weightedScore:78}));
  });
  it('tracks incomplete coverage',()=>{
    const changed={...decision,options:[{id:'A',label:'أ',scores:{price:90}},decision.options[1]]};
    expect(evaluateDecision(changed).find(x=>x.optionId==='A')?.coveragePercent).toBe(60);
  });
  it('requires alternatives and criteria',()=>{
    expect(validateDecision({...decision,options:[]}).issues).toContain('TWO_OPTIONS_REQUIRED');
  });
});

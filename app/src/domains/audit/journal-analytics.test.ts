import {describe,expect,it} from 'vitest';
import {analyzeJournals} from './journal-analytics';

describe('journal analytics',()=>{
  it('flags just-below-materiality and round values',()=>{
    const findings=analyzeJournals([{
      id:'JV-RISK',date:'2026-09-24',lines:[
        {accountId:'1100',debit:9000,credit:0},
        {accountId:'4000',debit:0,credit:9000},
      ]
    }],{materiality:10000,largeAmount:20000,roundUnit:1000});

    expect(findings.map((x)=>x.code)).toEqual(expect.arrayContaining(['JUST_BELOW_MATERIALITY','ROUND_AMOUNT']));
  });

  it('flags an unbalanced entry',()=>{
    const findings=analyzeJournals([{
      id:'JV-BAD',date:'2026-09-24',lines:[
        {accountId:'1100',debit:100,credit:0},
        {accountId:'4000',debit:0,credit:90},
      ]
    }],{materiality:1000});
    expect(findings.some((x)=>x.code==='UNBALANCED')).toBe(true);
  });
});

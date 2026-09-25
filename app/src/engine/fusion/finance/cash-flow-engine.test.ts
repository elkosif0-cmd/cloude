import {describe,expect,it} from 'vitest';
import {buildCashFlow} from './cash-flow-engine';

describe('cash flow engine',()=>{
  const accounts=[
    {id:'cash',code:'1100',name:'Cash',type:'asset' as const,active:true},
    {id:'sales',code:'4000',name:'Sales',type:'revenue' as const,active:true},
    {id:'equipment',code:'1500',name:'Equipment',type:'asset' as const,active:true},
    {id:'loan',code:'2200',name:'Loan',type:'liability' as const,active:true},
  ];
  const journals=[
    {id:'J1',date:'2026-09-01',lines:[{accountId:'cash',debit:115,credit:0},{accountId:'sales',debit:0,credit:115}]},
    {id:'J2',date:'2026-09-02',lines:[{accountId:'equipment',debit:50,credit:0},{accountId:'cash',debit:0,credit:50}]},
    {id:'J3',date:'2026-09-03',lines:[{accountId:'cash',debit:200,credit:0},{accountId:'loan',debit:0,credit:200}]},
  ];

  it('classifies operating investing and financing cash movements',()=>{
    const result=buildCashFlow({journals,accounts,cashAccountIds:['cash']});
    expect(result.operating).toBe(115);
    expect(result.investing).toBe(-50);
    expect(result.financing).toBe(200);
    expect(result.netChange).toBe(265);
  });

  it('supports account classification overrides',()=>{
    const result=buildCashFlow({journals,accounts,cashAccountIds:['cash'],overrides:{equipment:'operating'}});
    expect(result.operating).toBe(65);
    expect(result.investing).toBe(0);
  });
});

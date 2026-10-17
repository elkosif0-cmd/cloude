import {describe,expect,it} from 'vitest';
import {accountMovement,validateTrialBalance} from './trial-balance-engine';

describe('trial balance validation',()=>{
  it('accepts balanced unique accounts',()=>{
    const result=validateTrialBalance([
      {accountId:'1100',debit:1000,credit:0},
      {accountId:'3000',debit:0,credit:1000},
    ]);
    expect(result.valid).toBe(true);
    expect(result.totals).toEqual({debit:1000,credit:1000,difference:0});
  });

  it('detects duplicate accounts and imbalance',()=>{
    const result=validateTrialBalance([
      {accountId:'1100',debit:1000,credit:0},
      {accountId:'1100',debit:0,credit:900},
    ]);
    expect(result.issues.map((i)=>i.code)).toEqual(expect.arrayContaining(['DUPLICATE_ACCOUNT','UNBALANCED_TOTALS']));
  });

  it('identifies new and vanished accounts against prior year',()=>{
    expect(accountMovement({accountId:'4100',debit:500,credit:0,priorDebit:0,priorCredit:0}).newAccount).toBe(true);
    expect(accountMovement({accountId:'5100',debit:0,credit:0,priorDebit:250,priorCredit:0}).vanishedAccount).toBe(true);
  });
});

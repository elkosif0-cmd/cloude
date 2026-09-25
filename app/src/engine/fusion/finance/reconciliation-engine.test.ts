import {describe,expect,it} from 'vitest';
import {reconcileSubledger,reconcileTrialBalanceToLedger} from './reconciliation-engine';

describe('financial reconciliations',()=>{
  const ledger=[
    {accountId:'1100',debit:1000,credit:200,balance:800},
    {accountId:'4000',debit:0,credit:800,balance:-800},
  ];

  it('matches TB accounts to general ledger and identifies missing accounts',()=>{
    const result=reconcileTrialBalanceToLedger([
      {accountId:'1100',debit:800,credit:0},
      {accountId:'4000',debit:0,credit:750},
      {accountId:'9999',debit:0,credit:50},
    ],ledger);
    expect(result.matched).toBe(1);
    expect(result.exceptions).toBe(2);
    expect(result.rows.find(x=>x.accountId==='4000')?.status).toBe('DIFFERENCE');
    expect(result.rows.find(x=>x.accountId==='9999')?.status).toBe('MISSING_GL');
  });

  it('reconciles a subledger to a control account',()=>{
    expect(reconcileSubledger({glAccountId:'1100',ledger,subledgerBalance:800}).matched).toBe(true);
    expect(reconcileSubledger({glAccountId:'1100',ledger,subledgerBalance:750}).difference).toBe(50);
  });
});

import {describe,expect,it} from 'vitest';
import {createTrialBalanceBatch,parseTrialBalanceCsv} from './trial-balance-import';

describe('trial balance import',()=>{
  it('maps English headers and validates totals',()=>{
    const batch=createTrialBalanceBatch({
      label:'2026',
      csv:'accountId,accountName,debit,credit,priorDebit,priorCredit\n1100,Cash,1000,0,900,0\n3000,Equity,0,1000,0,900',
      now:new Date('2026-09-25T00:00:00Z'),
    });
    expect(batch.rows).toHaveLength(2);
    expect(batch.validation.valid).toBe(true);
    expect(batch.validation.totals).toEqual({debit:1000,credit:1000,difference:0});
  });

  it('maps compact Arabic headers',()=>{
    const rows=parseTrialBalanceCsv('كود الحساب,اسم الحساب,مدين,دائن\n1100,النقدية,500,0\n4000,الإيراد,0,500');
    expect(rows[0]).toEqual(expect.objectContaining({accountId:'1100',accountName:'النقدية',debit:500,credit:0}));
  });

  it('keeps validation issues on an unbalanced import',()=>{
    const batch=createTrialBalanceBatch({label:'bad',csv:'account,مدين,دائن\n1100,100,0'});
    expect(batch.validation.valid).toBe(false);
    expect(batch.validation.issues.map(x=>x.code)).toContain('UNBALANCED_TOTALS');
  });
});

import {describe,expect,it} from 'vitest';
import {buildSalesPosting} from './sales-posting-engine';

describe('sales posting',()=>{
  it('posts receivable revenue VAT and stock movements',()=>{
    const bundle=buildSalesPosting({
      id:'SO1',number:'SO-1',date:'2026-09-25',dueDate:'2026-10-25',customerId:'customer-c1',status:'DRAFT',
      lines:[{itemId:'item-a',quantity:2,unitPrice:100,discount:20,vatRate:0.15}],
    },{
      receivableAccountId:'account-1200',
      revenueAccountId:'account-4000',
      vatPayableAccountId:'account-2105',
    });

    expect(bundle.journal.lines).toEqual([
      expect.objectContaining({accountId:'account-1200',debit:207,credit:0}),
      expect.objectContaining({accountId:'account-4000',debit:0,credit:180}),
      expect.objectContaining({accountId:'account-2105',debit:0,credit:27}),
    ]);
    expect(bundle.receivable.amount).toBe(207);
    expect(bundle.stockMovements).toHaveLength(1);
    expect(bundle.stockMovements[0]).toEqual(expect.objectContaining({itemId:'item-a',type:'SALE',quantity:2}));
  });

  it('rejects empty sales documents',()=>{
    expect(()=>buildSalesPosting({
      id:'SO2',number:'SO-2',date:'2026-09-25',dueDate:'2026-10-25',customerId:'customer-c1',status:'DRAFT',lines:[],
    },{
      receivableAccountId:'account-1200',revenueAccountId:'account-4000',vatPayableAccountId:'account-2105',
    })).toThrow('SALES_LINES_REQUIRED');
  });
});

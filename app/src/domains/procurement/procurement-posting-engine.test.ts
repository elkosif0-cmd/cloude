import {describe,expect,it} from 'vitest';
import {buildReceiptPosting} from './procurement-posting-engine';

describe('procurement receipt posting',()=>{
  const order={
    id:'PO1',number:'PO-1',date:'2026-09-25',dueDate:'2026-10-25',supplierId:'supplier-s1',status:'OPEN' as const,
    lines:[{itemId:'item-a',quantity:10,unitCostExVat:50,vatRate:0.15}],
  };

  it('posts inventory VAT payable and supplier aging record',()=>{
    const result=buildReceiptPosting(order,{
      id:'GR1',number:'GR-1',date:'2026-09-25',purchaseOrderId:'PO1',status:'DRAFT',
      lines:[{itemId:'item-a',quantity:4}],
    },{
      inventoryAccountId:'account-1300',inputVatAccountId:'account-1150',payableAccountId:'account-2100',
    });

    expect(result).toEqual(expect.objectContaining({taxable:200,vat:30,total:230}));
    expect(result.journal.lines).toEqual([
      expect.objectContaining({accountId:'account-1300',debit:200}),
      expect.objectContaining({accountId:'account-1150',debit:30}),
      expect.objectContaining({accountId:'account-2100',credit:230}),
    ]);
    expect(result.payable).toEqual(expect.objectContaining({supplierId:'supplier-s1',dueDate:'2026-10-25',amount:230,paid:0}));
    expect(result.stockMovements[0]).toEqual(expect.objectContaining({quantity:4,unitCost:50,type:'PURCHASE'}));
  });

  it('rejects unplanned receipt items',()=>{
    expect(()=>buildReceiptPosting(order,{
      id:'GR2',number:'GR-2',date:'2026-09-25',purchaseOrderId:'PO1',status:'DRAFT',lines:[{itemId:'item-x',quantity:1}],
    },{
      inventoryAccountId:'a',inputVatAccountId:'b',payableAccountId:'c',
    })).toThrow('UNPLANNED_RECEIPT_ITEM');
  });
});

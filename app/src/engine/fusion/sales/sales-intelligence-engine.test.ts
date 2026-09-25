import {describe,expect,it} from 'vitest';
import {buildSalesIntelligence} from './sales-intelligence-engine';

const customers=[
  {id:'c1',code:'C1',name:'عميل أ',active:true},
  {id:'c2',code:'C2',name:'عميل ب',active:true},
];

function invoice(id:string,customerId:string,total:number,vat:number,paid:number,date:string){
  return {
    id,number:id,issuedAt:date,sellerName:'Seller',sellerVatNumber:'VAT',customerId,
    lines:[],subtotalExVat:total-vat,vat,totalIncVat:total,zatcaTlvBase64:'x',payments:[],
    paid,balance:total-paid,status:(paid>=total?'PAID':'OPEN') as 'PAID'|'OPEN',
  };
}

describe('sales intelligence',()=>{
  it('aggregates customer revenue payments and recency',()=>{
    const result=buildSalesIntelligence({
      customers,
      invoices:[invoice('I1','c1',800,104,800,'2026-09-20T10:00:00Z'),invoice('I2','c2',200,26,100,'2026-09-10T10:00:00Z')],
      asOfDate:'2026-09-25',
    });
    expect(result.totalRevenueIncVat).toBe(1000);
    expect(result.totalOutstanding).toBe(100);
    expect(result.rows[0]).toEqual(expect.objectContaining({customerId:'c1',revenueIncVat:800,abcClass:'A',daysSinceLastInvoice:5}));
    expect(result.rows[1].revenueSharePercent).toBe(20);
  });

  it('ignores void invoices',()=>{
    const open=invoice('I1','c1',100,13,0,'2026-09-20T10:00:00Z');
    const voided={...open,id:'I2',status:'VOID' as const};
    expect(buildSalesIntelligence({customers,invoices:[open,voided],asOfDate:'2026-09-25'}).invoices).toBe(1);
  });
});

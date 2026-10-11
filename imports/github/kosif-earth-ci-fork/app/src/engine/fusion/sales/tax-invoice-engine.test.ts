import {describe,expect,it} from 'vitest';
import {applyInvoicePayment,createTaxInvoice,summarizePayments} from './tax-invoice-engine';

describe('tax invoice engine',()=>{
  it('creates totals and ZATCA TLV payload',()=>{
    const invoice=createTaxInvoice({
      id:'I1',number:'INV-1',issuedAt:'2026-09-25T12:00:00Z',
      sellerName:'شركة الاختبار',sellerVatNumber:'300000000000003',
      customerName:'عميل',
      lines:[{description:'منتج',quantity:2,unitPriceExVat:100,vatRate:0.15,discountExVat:20}],
      payments:[{method:'mada',amount:100}],
    });
    expect(invoice.subtotalExVat).toBe(180);
    expect(invoice.vat).toBe(27);
    expect(invoice.totalIncVat).toBe(207);
    expect(invoice.balance).toBe(107);
    expect(invoice.zatcaTlvBase64.length).toBeGreaterThan(10);
  });

  it('supports split payments until paid',()=>{
    const result=summarizePayments(200,[{method:'cash',amount:50},{method:'mada',amount:150}]);
    expect(result).toEqual({paid:200,balance:0,change:0,settled:true});
  });

  it('applies later payments',()=>{
    const invoice=createTaxInvoice({
      id:'I2',number:'INV-2',issuedAt:'2026-09-25T12:00:00Z',sellerName:'Seller',sellerVatNumber:'VAT',
      lines:[{description:'X',quantity:1,unitPriceExVat:100,vatRate:0}],
    });
    expect(applyInvoicePayment(invoice,{method:'cash',amount:100}).status).toBe('PAID');
  });
});

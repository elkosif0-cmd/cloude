import{describe,it,expect}from'vitest';import{butcherYield,receivingAudit,whatsappPhone,CULINARY_GUIDE}from'./operations';
describe('operational specialist services',()=>{
 it('flags receiving discrepancy or temperature exceptions',()=>{expect(receivingAudit({invoicedKg:200,actualKg:194,temp:2.5}).status).toBe('ok');expect(receivingAudit({invoicedKg:200,actualKg:190,temp:5}).status).toBe('bad')});
 it('computes butcher yield and unaccounted weight',()=>{const r=butcherYield({hangingKg:21.5,primeKg:14.2,boneKg:4.1,fatKg:2.6,wasteKg:.6});expect(r.yieldPct).toBeCloseTo(66.05,1);expect(r.unaccountedKg).toBeCloseTo(0);expect(r.tier).toBe('excellent')});
 it('normalizes Saudi WhatsApp numbers and keeps a culinary reference set',()=>{expect(whatsappPhone('0551234567')).toBe('966551234567');expect(CULINARY_GUIDE.length).toBeGreaterThanOrEqual(5)});
});

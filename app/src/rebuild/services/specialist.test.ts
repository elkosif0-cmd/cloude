import{describe,it,expect}from'vitest';import{blendCalc,cateringCalc,agingCalc,code128SVG,zatcaTLV}from'./specialist';
describe('specialist domain services',()=>{
 it('calculates blending without UI state',()=>{const r=blendCalc({leanKg:20,leanCost:40,fatKg:5,fatCost:10,spicesCost:50,pkgCost:50,pieceGrams:150,shrink:5,margin:30});expect(r.netYield).toBeCloseTo(23.75);expect(r.totalCost).toBe(950);expect(r.pricePerKg).toBeGreaterThan(r.costPerKg)});
 it('calculates event quote',()=>{const r=cateringCalc({guests:20,gramsPerGuest:400,meatCostKg:50,marginPct:20,extras:100});expect(r.kg).toBe(8);expect(r.cost).toBe(500);expect(r.price).toBe(625)});
 it('never creates negative aging yield',()=>{const r=agingCalc({entryDate:'2026-01-01',targetDays:30,rawKg:10,rawCostKg:100,type:'dry',margin:40},new Date('2026-03-01T12:00:00'));expect(r.usableKg).toBeGreaterThan(0);expect(r.costPerUsableKg).toBeGreaterThan(100);expect(r.ready).toBe(true)});
 it('generates barcode SVG and ZATCA TLV',()=>{expect(code128SVG('ABC-123')).toContain('<svg');expect(zatcaTLV('S.kosif','310000000000003','2026-09-25T00:00:00Z',115,15).length).toBeGreaterThan(10)});
});

import{describe,it,expect}from'vitest';
import{analyzeJournal,benford,calculateMateriality,deterministicSample,parseDelimited,searchStandards}from'./audit';

describe('zero-legacy audit domain',()=>{
 it('calculates materiality deterministically',()=>{
  const r=calculateMateriality({benchmark:'revenue',amount:10_000_000,risk:'medium'});
  expect(r.overall).toBe(50_000);expect(r.performance).toBe(35_000);expect(r.trivial).toBe(2_500);
 });
 it('flags duplicate, round, weekend and near-materiality entries',()=>{
  const rows=[
   {date:'2026-09-25',reference:'JV-1',amount:49000},
   {date:'2026-09-26',reference:'JV-1',amount:50000},
   {date:'2026-09-27',reference:'JV-2',amount:1234}
  ];
  const r=analyzeJournal(rows,50_000);
  expect(r.duplicateReference).toBe(2);expect(r.round).toBe(1);expect(r.nearMateriality).toBe(1);expect(r.large).toBe(1);expect(r.flagged).toBeGreaterThan(1);
 });
 it('produces a nine-row Benford profile',()=>{expect(benford([{amount:123},{amount:245},{amount:399},{amount:410}])).toHaveLength(9)});
 it('creates deterministic samples',()=>{const rows=[1,2,3,4,5,6,7,8,9,10];expect(deterministicSample(rows,3)).toEqual([1,4,7])});
 it('parses CSV and searches standards',()=>{expect(parseDelimited('date,amount\n2026-01-01,100').length).toBe(1);expect(searchStandards('IFRS 15')[0]?.code).toContain('IFRS 15')});
});

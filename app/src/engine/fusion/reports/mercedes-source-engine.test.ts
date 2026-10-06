import {describe,it,expect} from 'vitest';
import {MERCEDES_REVIEWED,MERCEDES_PRIMARY_ROWS} from './source-data/mercedes';
import {reviewedMercedesSource} from './mercedes-source-engine';
function allFrozen(x:unknown):boolean{return !x||typeof x!=='object'||Object.isFrozen(x)&&Object.values(x).every(allFrozen);}
describe('immutable Mercedes source canonical data',()=>{
 it('freezes every canonical object and array, leaving no mutable source oracle exposed',()=>{
  expect(allFrozen(MERCEDES_REVIEWED)).toBe(true);expect(allFrozen(MERCEDES_PRIMARY_ROWS)).toBe(true);
 });
 it('rejects direct canonical amount mutation and keeps independent adapter callers at the source value',()=>{
  expect(()=>{MERCEDES_REVIEWED.core.tables.income.rows.revenue['2025']='777';}).toThrow();
  expect(()=>{MERCEDES_PRIMARY_ROWS.income[0].values[0]=777;}).toThrow();
  const a=reviewedMercedesSource('mercedes-2025')!;expect(a.sourceModel.replay.tables[0].rows[0].cells['2025'].value).toBe(132214);
 });
});

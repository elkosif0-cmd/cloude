import {describe,it,expect} from 'vitest';
import {VOLKSWAGEN_REVIEWED,VOLKSWAGEN_PRIMARY_ROWS,VOLKSWAGEN_HASHES} from './source-data/volkswagen';
import {reviewedVolkswagenSource} from './volkswagen-source-engine';
const allFrozen=(x:unknown):boolean=>!x||typeof x!=='object'||Object.isFrozen(x)&&Object.values(x).every(allFrozen);
describe('Volkswagen immutable source canonical data',()=>{
 it('freezes every canonical object, amount array, status array and hash',()=>{expect(allFrozen(VOLKSWAGEN_REVIEWED)).toBe(true);expect(allFrozen(VOLKSWAGEN_PRIMARY_ROWS)).toBe(true);expect(allFrozen(VOLKSWAGEN_HASHES)).toBe(true);});
 it('refuses canonical mutation and isolates data returned to each caller',()=>{expect(()=>{VOLKSWAGEN_PRIMARY_ROWS.income.rows[0].values[0]=777;}).toThrow();expect(()=>{VOLKSWAGEN_REVIEWED.core.tables.cashflow.rows.nci_transactions.status[1]='reported_number';}).toThrow();const a=reviewedVolkswagenSource('volkswagen-2025')!;a.sourceModel.replay.tables[0].rows[0].cells['2025'].value=777;expect(reviewedVolkswagenSource('volkswagen-2025')!.sourceModel.replay.tables[0].rows[0].cells['2025'].value).toBe(321913);});
 it('refuses an unrecognized model ID rather than returning similar-company source data',()=>{expect(reviewedVolkswagenSource('volkswagen-2024')).toBe(null);expect(reviewedVolkswagenSource('mercedes-2025')).toBe(null);});
});
import {REPORTS} from '../audit/global-benchmarks-engine';
describe('Volkswagen source report boundary',()=>{it('assigns physical page 4323 to the visually verified next Deutsche Telekom cover',()=>{expect(REPORTS.find(r=>r.id==='volkswagen-2025')!.pages).toEqual([3650,4322]);expect(REPORTS.find(r=>r.id==='telekom-2025')!.pages[0]).toBe(4323);});});

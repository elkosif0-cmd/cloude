import {describe,it,expect}from'vitest';
import {replayAll,replayCompany,sectorPrior,typicalKamCount}from'./corpus-replay-engine';
import {REPORTS}from'./global-benchmarks-engine';
describe('published source references cannot stand in for an audit engagement',()=>{
 it('returns explicit unavailability rather than synthetic audit results for all source models',()=>{const r=replayAll();expect(r.status).toBe('unavailable');expect(r.companies).toBe(0);expect(r.list).toEqual([]);expect(r.materiality).toEqual([]);});
 it('does not create a professional audit by changing the sector-prior option',()=>{expect(replayAll({prior:false}).list).toEqual([]);expect(replayAll({prior:'smoothed'}).list).toEqual([]);});
 it('retains read-only leave-one-out source reference statistics',()=>{expect(sectorPrior('banking')['credit-losses']).toBe(1);expect(sectorPrior('banking','bofa-2025')['credit-losses']).toBe(1);expect(Object.keys(sectorPrior('industrial','airbus-2023'))).toEqual([]);});
 it('retains the historical standard comparison without calling it performed audit work',()=>{expect(typicalKamCount('PCAOB')).toBeLessThan(typicalKamCount('ISA'));});
 it('rejects direct known-company replay calls for every named report',()=>{for(const r of REPORTS)expect(replayCompany(r.id),r.id).toBeNull();});
 it('does not create an audit for unknown or misdated aliases',()=>{expect(replayCompany('mcdonalds-2025')).toBeNull();expect(replayCompany('nope')).toBeNull();});
});

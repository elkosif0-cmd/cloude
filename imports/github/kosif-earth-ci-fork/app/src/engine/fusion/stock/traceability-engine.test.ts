import {describe,expect,it} from 'vitest';
import {batchRisk,temperatureExcursions,traceabilitySummary,type TraceabilityBatch} from './traceability-engine';

const batch:TraceabilityBatch={id:'B1',lotCode:'LOT-1',itemId:'I1',receivedDate:'2026-09-20',expiryDate:'2026-09-27',storageMode:'chilled',quantity:10,unit:'kg'};

describe('traceability engine',()=>{
  it('classifies expiry windows',()=>{
    expect(batchRisk(batch,'2026-09-25')).toBe('WARNING');
    expect(batchRisk(batch,'2026-09-28')).toBe('EXPIRED');
  });
  it('detects operational temperature excursions',()=>{
    expect(temperatureExcursions(batch,[
      {id:'T1',batchId:'B1',recordedAt:'2026-09-25T10:00:00Z',celsius:3},
      {id:'T2',batchId:'B1',recordedAt:'2026-09-25T11:00:00Z',celsius:7},
    ])).toHaveLength(1);
  });
  it('summarizes batch risk',()=>{
    const summary=traceabilitySummary([batch],[], '2026-09-25');
    expect(summary.batches).toBe(1);
    expect(summary.risks.WARNING).toBe(1);
  });
});

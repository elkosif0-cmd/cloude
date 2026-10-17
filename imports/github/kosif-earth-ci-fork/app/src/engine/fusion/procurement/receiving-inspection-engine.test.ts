import {describe,expect,it} from 'vitest';
import {inspectReceiving,type ReceivingInspection} from './receiving-inspection-engine';

const base:ReceivingInspection={id:'R1',date:'2026-09-25',invoicedKg:200,actualKg:194,temperatureC:2.5,maxTemperatureC:4,tolerancePercent:2};

describe('receiving inspection',()=>{
  it('flags weight discrepancy beyond configured tolerance',()=>{
    const result=inspectReceiving(base);
    expect(result.discrepancyKg).toBe(6);
    expect(result.discrepancyPercent).toBe(3);
    expect(result.weightStatus).toBe('REVIEW');
  });
  it('flags temperature above the configured internal limit',()=>{
    const result=inspectReceiving({...base,actualKg:198,temperatureC:6});
    expect(result.temperatureStatus).toBe('REVIEW');
    expect(result.overallStatus).toBe('REVIEW');
  });
  it('does not invent a temperature if none was recorded',()=>{
    expect(inspectReceiving({...base,temperatureC:undefined}).temperatureStatus).toBe('NOT_RECORDED');
  });
});

import {describe,expect,it} from 'vitest';
import {runScenario} from './scenario-engine';

describe('scenario engine',()=>{
  it('calculates price volume and cost sensitivity',()=>{
    const result=runScenario({
      revenue:1000,variableCost:600,fixedCost:200,
      priceChangePercent:10,volumeChangePercent:5,variableCostChangePercent:2,fixedCostChangePercent:0,
    });
    expect(result.baseline.profit).toBe(200);
    expect(result.scenario.revenue).toBe(1155);
    expect(result.scenario.variableCost).toBe(642.6);
    expect(result.scenario.profit).toBe(312.4);
    expect(result.deltaProfit).toBe(112.4);
  });

  it('calculates break-even revenue from contribution margin',()=>{
    const result=runScenario({
      revenue:1000,variableCost:600,fixedCost:200,
      priceChangePercent:0,volumeChangePercent:0,variableCostChangePercent:0,fixedCostChangePercent:0,
    });
    expect(result.contributionMarginPercent).toBe(40);
    expect(result.breakEvenRevenue).toBe(500);
  });
});

import {describe,expect,it} from 'vitest';
import {buildExecutiveMetrics} from './executive-metrics';

describe('executive metrics',()=>{
  it('calculates profitability and working capital',()=>{
    expect(buildExecutiveMetrics({
      revenue:1000,costOfSales:700,receivables:200,payables:150,cash:100,inventory:300,
    })).toEqual({
      grossProfit:300,
      grossMarginPercent:30,
      netWorkingCapital:450,
      quickLiquidity:150,
    });
  });
});

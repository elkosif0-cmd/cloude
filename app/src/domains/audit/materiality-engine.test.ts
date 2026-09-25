import {describe,expect,it} from 'vitest';
import {calculateMateriality} from './materiality-engine';

describe('materiality engine',()=>{
  it('calculates overall performance and trivial materiality',()=>{
    expect(calculateMateriality({
      benchmark:'revenue',benchmarkAmount:10_000_000,benchmarkRate:0.01,performanceRate:0.75,trivialRate:0.05
    })).toEqual({overall:100000,performance:75000,trivial:5000});
  });
});

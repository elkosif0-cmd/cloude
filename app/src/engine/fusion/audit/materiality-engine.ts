export type MaterialityBenchmark = 'revenue' | 'profit-before-tax' | 'assets' | 'equity';

export type MaterialityInput = {
  benchmark: MaterialityBenchmark;
  benchmarkAmount: number;
  benchmarkRate: number;
  performanceRate: number;
  trivialRate: number;
};

export type MaterialityResult = {
  overall: number;
  performance: number;
  trivial: number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function calculateMateriality(input:MaterialityInput):MaterialityResult{
  const base=Math.abs(input.benchmarkAmount);
  const benchmarkRate=Math.max(0,input.benchmarkRate);
  const performanceRate=Math.min(1,Math.max(0,input.performanceRate));
  const trivialRate=Math.min(1,Math.max(0,input.trivialRate));
  const overall=base*benchmarkRate;
  return {
    overall:money(overall),
    performance:money(overall*performanceRate),
    trivial:money(overall*trivialRate),
  };
}

export type ExecutiveMetricInput={
  revenue:number;
  costOfSales:number;
  receivables:number;
  payables:number;
  cash:number;
  inventory:number;
};

export type ExecutiveMetrics={
  grossProfit:number;
  grossMarginPercent:number;
  netWorkingCapital:number;
  quickLiquidity:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function buildExecutiveMetrics(input:ExecutiveMetricInput):ExecutiveMetrics{
  const revenue=input.revenue;
  const grossProfit=revenue-input.costOfSales;
  const grossMarginPercent=revenue===0?0:(grossProfit/revenue)*100;
  const netWorkingCapital=input.cash+input.receivables+input.inventory-input.payables;
  const quickLiquidity=input.cash+input.receivables-input.payables;
  return {
    grossProfit:money(grossProfit),
    grossMarginPercent:money(grossMarginPercent),
    netWorkingCapital:money(netWorkingCapital),
    quickLiquidity:money(quickLiquidity),
  };
}

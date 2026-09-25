export type ScenarioInput={
  revenue:number;
  variableCost:number;
  fixedCost:number;
  priceChangePercent:number;
  volumeChangePercent:number;
  variableCostChangePercent:number;
  fixedCostChangePercent:number;
};

export type ScenarioResult={
  baseline:{revenue:number;variableCost:number;fixedCost:number;profit:number;marginPercent:number};
  scenario:{revenue:number;variableCost:number;fixedCost:number;profit:number;marginPercent:number};
  deltaProfit:number;
  contributionMarginPercent:number;
  breakEvenRevenue:number|null;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}
function pct(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function runScenario(input:ScenarioInput):ScenarioResult{
  const revenue=Math.max(0,input.revenue);
  const variableCost=Math.max(0,input.variableCost);
  const fixedCost=Math.max(0,input.fixedCost);
  const baselineProfit=money(revenue-variableCost-fixedCost);
  const baselineMargin=revenue===0?0:pct((baselineProfit/revenue)*100);

  const priceFactor=1+input.priceChangePercent/100;
  const volumeFactor=Math.max(0,1+input.volumeChangePercent/100);
  const variableCostFactor=Math.max(0,1+input.variableCostChangePercent/100);
  const fixedCostFactor=Math.max(0,1+input.fixedCostChangePercent/100);

  const scenarioRevenue=money(revenue*priceFactor*volumeFactor);
  const scenarioVariableCost=money(variableCost*volumeFactor*variableCostFactor);
  const scenarioFixedCost=money(fixedCost*fixedCostFactor);
  const scenarioProfit=money(scenarioRevenue-scenarioVariableCost-scenarioFixedCost);
  const scenarioMargin=scenarioRevenue===0?0:pct((scenarioProfit/scenarioRevenue)*100);

  const contribution=revenue===0?0:(revenue-variableCost)/revenue;
  const breakEven=contribution>0?money(fixedCost/contribution):null;

  return {
    baseline:{revenue:money(revenue),variableCost:money(variableCost),fixedCost:money(fixedCost),profit:baselineProfit,marginPercent:baselineMargin},
    scenario:{revenue:scenarioRevenue,variableCost:scenarioVariableCost,fixedCost:scenarioFixedCost,profit:scenarioProfit,marginPercent:scenarioMargin},
    deltaProfit:money(scenarioProfit-baselineProfit),
    contributionMarginPercent:pct(contribution*100),
    breakEvenRevenue:breakEven,
  };
}

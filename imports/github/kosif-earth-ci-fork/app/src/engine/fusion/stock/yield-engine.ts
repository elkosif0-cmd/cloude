export type YieldInput={
  purchaseCost:number;
  grossWeight:number;
  usableWeight:number;
  byproductRecovery?:number;
};

export type YieldResult={
  yieldPercent:number;
  wasteWeight:number;
  netCost:number;
  costPerUsableKg:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function calculateYield(input:YieldInput):YieldResult{
  const gross=Math.max(0,input.grossWeight);
  const usable=Math.min(gross,Math.max(0,input.usableWeight));
  const recovery=Math.max(0,input.byproductRecovery??0);
  const netCost=Math.max(0,input.purchaseCost-recovery);
  const yieldPercent=gross===0?0:(usable/gross)*100;
  return {
    yieldPercent:money(yieldPercent),
    wasteWeight:money(gross-usable),
    netCost:money(netCost),
    costPerUsableKg:usable===0?0:money(netCost/usable),
  };
}

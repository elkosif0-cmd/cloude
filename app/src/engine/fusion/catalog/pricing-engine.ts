export type PricingInput = {
  purchaseInclusiveVat: number;
  sellingInclusiveVat: number;
  vatRate?: number;
  wasteRate?: number;
};

export type PricingResult = {
  purchaseExVat: number;
  usableCostExVat: number;
  sellingExVat: number;
  grossProfitInclusiveVat: number;
  grossMarginPercentOnInclusiveSales: number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function calculatePricing(input:PricingInput):PricingResult{
  const vat=Math.max(0,input.vatRate ?? 0.15);
  const waste=Math.min(0.99,Math.max(0,input.wasteRate ?? 0));
  const purchaseInclusive=Math.max(0,input.purchaseInclusiveVat);
  const sellingInclusive=Math.max(0,input.sellingInclusiveVat);

  const purchaseExVat=purchaseInclusive/(1+vat);
  const usableCostExVat=waste===0?purchaseExVat:purchaseExVat/(1-waste);
  const sellingExVat=sellingInclusive/(1+vat);
  const costInclusiveEquivalent=usableCostExVat*(1+vat);
  const grossProfitInclusiveVat=sellingInclusive-costInclusiveEquivalent;
  const margin=sellingInclusive===0?0:(grossProfitInclusiveVat/sellingInclusive)*100;

  return {
    purchaseExVat:money(purchaseExVat),
    usableCostExVat:money(usableCostExVat),
    sellingExVat:money(sellingExVat),
    grossProfitInclusiveVat:money(grossProfitInclusiveVat),
    grossMarginPercentOnInclusiveSales:money(margin),
  };
}

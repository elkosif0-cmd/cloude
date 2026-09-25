export type BlendRecipe={
  id:string;
  name:string;
  leanItemId?:string;
  fatItemId?:string;
  leanKg:number;
  fatKg:number;
  leanCostPerKg:number;
  fatCostPerKg:number;
  spicesCost:number;
  packagingCost:number;
  shrinkPercent:number;
  pieceGrams:number;
  targetMarginPercent:number;
};

export type BlendEconomics={
  rawWeightKg:number;
  leanPercent:number;
  fatPercent:number;
  netYieldKg:number;
  totalCost:number;
  costPerKg:number;
  pieces:number;
  costPerPiece:number;
  suggestedPricePerKg:number;
  suggestedPricePerPiece:number;
  expectedRevenue:number;
  expectedProfit:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function calculateBlend(recipe:BlendRecipe):BlendEconomics{
  const leanKg=Math.max(0,recipe.leanKg);
  const fatKg=Math.max(0,recipe.fatKg);
  const rawWeightKg=leanKg+fatKg;
  const shrink=Math.min(0.95,Math.max(0,recipe.shrinkPercent/100));
  const netYieldKg=rawWeightKg*(1-shrink);
  const totalCost=leanKg*Math.max(0,recipe.leanCostPerKg)+fatKg*Math.max(0,recipe.fatCostPerKg)+Math.max(0,recipe.spicesCost)+Math.max(0,recipe.packagingCost);
  const costPerKg=netYieldKg===0?0:totalCost/netYieldKg;
  const pieceGrams=Math.max(0,recipe.pieceGrams);
  const pieces=pieceGrams===0?0:Math.floor((netYieldKg*1000)/pieceGrams);
  const costPerPiece=pieces===0?0:totalCost/pieces;
  const margin=Math.min(0.9,Math.max(0,recipe.targetMarginPercent/100));
  const suggestedPricePerKg=margin>=1?0:costPerKg/(1-margin);
  const suggestedPricePerPiece=margin>=1?0:costPerPiece/(1-margin);
  const expectedRevenue=pieces>0?pieces*suggestedPricePerPiece:netYieldKg*suggestedPricePerKg;
  return {
    rawWeightKg:money(rawWeightKg),
    leanPercent:rawWeightKg===0?0:money((leanKg/rawWeightKg)*100),
    fatPercent:rawWeightKg===0?0:money((fatKg/rawWeightKg)*100),
    netYieldKg:money(netYieldKg),
    totalCost:money(totalCost),
    costPerKg:money(costPerKg),
    pieces,
    costPerPiece:money(costPerPiece),
    suggestedPricePerKg:money(suggestedPricePerKg),
    suggestedPricePerPiece:money(suggestedPricePerPiece),
    expectedRevenue:money(expectedRevenue),
    expectedProfit:money(expectedRevenue-totalCost),
  };
}

export function validateBlend(recipe:BlendRecipe){
  const issues:string[]=[];
  if(!recipe.name.trim())issues.push('NAME_REQUIRED');
  if(recipe.leanKg+recipe.fatKg<=0)issues.push('WEIGHT_REQUIRED');
  if(recipe.leanCostPerKg<0||recipe.fatCostPerKg<0||recipe.spicesCost<0||recipe.packagingCost<0)issues.push('NEGATIVE_COST');
  if(recipe.shrinkPercent<0||recipe.shrinkPercent>=100)issues.push('INVALID_SHRINK');
  if(recipe.targetMarginPercent<0||recipe.targetMarginPercent>=100)issues.push('INVALID_MARGIN');
  return {valid:issues.length===0,issues};
}

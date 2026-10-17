import type {CatalogItem} from './items-engine';

export type BoxLine={itemId:string;quantity:number};

export type BoxRecipe={
  id:string;
  name:string;
  lines:BoxLine[];
  sellingPriceIncVat:number;
  vatRate:number;
  targetMarginPercent?:number;
  active:boolean;
};

export type BoxLineResult={
  itemId:string;
  quantity:number;
  unitCost:number;
  cost:number;
  missingCost:boolean;
};

export type BoxEconomics={
  lines:BoxLineResult[];
  totalCostExVat:number;
  sellingPriceExVat:number;
  vat:number;
  sellingPriceIncVat:number;
  profitExVat:number;
  marginPercent:number;
  minimumPriceForTargetMarginIncVat:number;
  missingCostItems:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function calculateBoxEconomics(recipe:BoxRecipe,items:CatalogItem[]):BoxEconomics{
  const map=new Map(items.map(item=>[item.id,item]));
  const lines=recipe.lines.map(line=>{
    const item=map.get(line.itemId);
    const unitCost=Math.max(0,item?.defaultCost??0);
    const quantity=Math.max(0,line.quantity);
    return {itemId:line.itemId,quantity,unitCost,cost:money(quantity*unitCost),missingCost:item?.defaultCost===undefined};
  });
  const totalCostExVat=money(lines.reduce((sum,line)=>sum+line.cost,0));
  const vatRate=Math.max(0,recipe.vatRate);
  const sellingPriceIncVat=money(Math.max(0,recipe.sellingPriceIncVat));
  const sellingPriceExVat=money(sellingPriceIncVat/(1+vatRate));
  const vat=money(sellingPriceIncVat-sellingPriceExVat);
  const profitExVat=money(sellingPriceExVat-totalCostExVat);
  const marginPercent=sellingPriceExVat===0?0:money((profitExVat/sellingPriceExVat)*100);
  const target=Math.min(95,Math.max(0,recipe.targetMarginPercent??0))/100;
  const targetNet=target>=1?0:totalCostExVat/(1-target);
  const minimumPriceForTargetMarginIncVat=money(targetNet*(1+vatRate));
  return {
    lines,totalCostExVat,sellingPriceExVat,vat,sellingPriceIncVat,profitExVat,marginPercent,
    minimumPriceForTargetMarginIncVat,
    missingCostItems:lines.filter(line=>line.missingCost).length,
  };
}

export function validateBoxRecipe(recipe:BoxRecipe){
  const issues:string[]=[];
  if(!recipe.name.trim())issues.push('NAME_REQUIRED');
  if(recipe.lines.length===0)issues.push('LINES_REQUIRED');
  if(recipe.lines.some(line=>!line.itemId||line.quantity<=0))issues.push('INVALID_LINE');
  if(recipe.sellingPriceIncVat<0)issues.push('INVALID_PRICE');
  if(recipe.vatRate<0||recipe.vatRate>1)issues.push('INVALID_VAT');
  return {valid:issues.length===0,issues};
}

import type {CatalogItem} from '../catalog/items-engine';
import {bestCatalogMatch,type ProductAliasMap} from './smart-match-engine';

export type ExcelVatMode='net'|'inclusive';

export type ExcelReconInput={
  sourceName:string;
  cost?:number;
  price?:number;
};

export type ExcelReconRow={
  sourceName:string;
  item:CatalogItem|null;
  matchScore:number;
  excelCostNet?:number;
  catalogCost?:number;
  costDifference?:number;
  costDifferencePercent?:number;
  excelPriceNet?:number;
  catalogPrice?:number;
  priceDifference?:number;
  priceDifferencePercent?:number;
  status:'MATCH'|'REVIEW'|'UNMATCHED';
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}
function percent(value:number){return Math.round((value+Number.EPSILON)*10000)/100;}

function numeric(value:string|undefined){
  if(!value)return undefined;
  const normalized=value.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).replace(/[٬,\s]/g,'').replace('٫','.');
  const parsed=Number(normalized);
  return Number.isFinite(parsed)?parsed:undefined;
}

export function parseExcelReconText(text:string):ExcelReconInput[]{
  return text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const cells=line.includes('\t')?line.split('\t'):line.includes(';')?line.split(';'):line.split(',');
    const values=cells.map(cell=>cell.trim());
    return {sourceName:values[0]??'',cost:numeric(values[1]),price:numeric(values[2])};
  }).filter(row=>row.sourceName);
}

export function reconcileExcelRows(input:{
  rows:ExcelReconInput[];
  items:CatalogItem[];
  vatMode:ExcelVatMode;
  aliases?:ProductAliasMap;
  tolerancePercent?:number;
}):ExcelReconRow[]{
  const tolerance=input.tolerancePercent??0.5;
  return input.rows.map(row=>{
    const matched=bestCatalogMatch(row.sourceName,input.items,input.aliases);
    const item=matched.item;
    if(!item)return {sourceName:row.sourceName,item:null,matchScore:matched.score,status:'UNMATCHED'} as ExcelReconRow;

    const vatDivisor=1+Math.max(0,item.vatRate||0);
    const excelCostNet=row.cost===undefined?undefined:money(input.vatMode==='inclusive'?row.cost/vatDivisor:row.cost);
    const excelPriceNet=row.price===undefined?undefined:money(input.vatMode==='inclusive'?row.price/vatDivisor:row.price);
    const catalogCost=item.defaultCost===undefined?undefined:money(item.defaultCost);
    const catalogPrice=item.defaultPrice===undefined?undefined:money(item.defaultPrice);

    const costDifference=excelCostNet===undefined||catalogCost===undefined?undefined:money(excelCostNet-catalogCost);
    const priceDifference=excelPriceNet===undefined||catalogPrice===undefined?undefined:money(excelPriceNet-catalogPrice);
    const costDifferencePercent=costDifference===undefined||!catalogCost?undefined:percent(costDifference/catalogCost);
    const priceDifferencePercent=priceDifference===undefined||!catalogPrice?undefined:percent(priceDifference/catalogPrice);
    const deviations=[costDifferencePercent,priceDifferencePercent].filter((value):value is number=>value!==undefined).map(Math.abs);
    const status:ExcelReconRow['status']=deviations.length===0||matched.score<50?'REVIEW':deviations.every(value=>value<=tolerance)?'MATCH':'REVIEW';

    return {
      sourceName:row.sourceName,
      item,
      matchScore:matched.score,
      excelCostNet,
      catalogCost,
      costDifference,
      costDifferencePercent,
      excelPriceNet,
      catalogPrice,
      priceDifference,
      priceDifferencePercent,
      status,
    };
  });
}

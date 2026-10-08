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

/* R18 (docs/rebuild/HARSH_REVIEW_20261008_ar.md #22): the cost diagnosis «مطابقة الإكسل» used to compute in the screen
   (ui/features/tools.js), moved here unchanged so the numbers come from a tested engine. One line of the user's sheet against
   the matched catalog item: the sheet's cost net of VAT, the gap to the app's true cost (positive = the sheet shows less than
   the truth), both margins on the company's base, and the most likely cause — the other waste method (adding waste ×(1+w)
   vs the yield method ÷(1−w); their costs differ by exactly 1/((1−w)(1+w))) or a VAT-inclusive cost typed as net. */
export type ExcelCostItem={name:string;cost:number;price:number;kind?:string;waste?:number};
export type ExcelCostDiagnosis={
  xcNet:number;price:number;gap:number;gapPct:number;excelMargin:number|null;trueMargin:number|null;
  code:'MATCH'|'UNDER'|'OVER'|'WASTE_EXCEL_ADDS'|'WASTE_EXCEL_DIVIDES'|'VAT_INCLUSIVE';diag:string;
};
export function excelCostDiagnosis(input:{
  excelCost:number;excelPrice?:number|null;vatMode:'net'|'gross';vat:number;item:ExcelCostItem;netBase:boolean;yieldMethod:boolean;tolerance?:number;
}):ExcelCostDiagnosis{
  const {excelCost:xc,item:it,vat}=input,tol=input.tolerance??0.003;
  const xcNet=input.vatMode==='gross'?xc/(1+vat):xc;
  const price=input.excelPrice&&input.excelPrice>0?input.excelPrice:it.price,pNet=price/(1+vat),base=input.netBase?pNet:price;
  const gap=it.cost-xcNet,gapPct=xcNet>0?gap/xcNet:0;
  let code:ExcelCostDiagnosis['code']='MATCH',diag='مطابق';
  if(Math.abs(gapPct)>tol){
    code=gap>0?'UNDER':'OVER';
    diag=gap>0?'إكسل يُظهر تكلفة أقل من الحقيقية':'إكسل يُظهر تكلفة أعلى من الحقيقية';
    const w=it.kind==='raw'?(Number(it.waste)||0)/100:0;
    if(w>0){
      const ratio=1/((1-w)*(1+w)),got=it.cost/xcNet;
      if(input.yieldMethod&&Math.abs(got-ratio)<0.004){code='WASTE_EXCEL_ADDS';diag='فرق طريقة الهدر: إكسل يضيف الهدر (×(1+هدر)) والتطبيق يقسم على (1−هدر) — إكسل يقلل التكلفة';}
      if(!input.yieldMethod&&Math.abs(got*ratio-1)<0.004){code='WASTE_EXCEL_DIVIDES';diag='فرق طريقة الهدر: إكسل يقسم على (1−هدر) والتطبيق يضيف الهدر (×(1+هدر))';}
    }
    if(input.vatMode==='net'&&Math.abs(xc/(it.cost*(1+vat))-1)<0.01){code='VAT_INCLUSIVE';diag='يبدو أن تكلفة إكسل شاملة الضريبة — غيّر خيار «التكلفة في الملف»';}
  }
  return {xcNet,price,gap,gapPct,excelMargin:base>0?(pNet-xcNet)/base:null,trueMargin:base>0?(pNet-it.cost)/base:null,code,diag};
}

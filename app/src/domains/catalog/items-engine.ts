export type ItemUnit='kg'|'piece'|'box'|'pack'|'other';

export type CatalogItem={
  id:string;
  sku:string;
  name:string;
  unit:ItemUnit;
  vatRate:number;
  defaultCost?:number;
  defaultPrice?:number;
  active:boolean;
};

export type CatalogItemInput=Omit<CatalogItem,'id'|'active'>;
export type CatalogItemIssue={code:'MISSING_SKU'|'MISSING_NAME'|'DUPLICATE_SKU'|'NEGATIVE_PRICE'|'INVALID_VAT';itemId?:string};

function clean(v:string){return v.trim();}

export function createCatalogItem(input:CatalogItemInput):CatalogItem{
  const sku=clean(input.sku);
  return {
    id:'item-'+sku.toLowerCase().replace(/[^a-z0-9_-]+/gi,'-'),
    sku,
    name:clean(input.name),
    unit:input.unit,
    vatRate:input.vatRate,
    defaultCost:input.defaultCost,
    defaultPrice:input.defaultPrice,
    active:true,
  };
}

export function inspectCatalog(items:CatalogItem[]):CatalogItemIssue[]{
  const issues:CatalogItemIssue[]=[];
  const skus=new Set<string>();
  for(const item of items){
    const sku=item.sku.trim().toLowerCase();
    if(!sku) issues.push({code:'MISSING_SKU',itemId:item.id});
    if(!item.name.trim()) issues.push({code:'MISSING_NAME',itemId:item.id});
    if(sku){
      if(skus.has(sku)) issues.push({code:'DUPLICATE_SKU',itemId:item.id});
      skus.add(sku);
    }
    if((item.defaultCost??0)<0||(item.defaultPrice??0)<0) issues.push({code:'NEGATIVE_PRICE',itemId:item.id});
    if(item.vatRate<0||item.vatRate>1) issues.push({code:'INVALID_VAT',itemId:item.id});
  }
  return issues;
}

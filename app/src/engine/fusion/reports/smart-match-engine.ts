import type {CatalogItem} from '../catalog/items-engine';

export type ProductAliasMap=Record<string,string>;

export type SalesMatchInput={
  sourceName:string;
  quantity?:number;
  amount?:number;
};

export type SalesMatchResult={
  sourceName:string;
  normalized:string;
  item:CatalogItem|null;
  score:number;
  reason:'ALIAS'|'EXACT'|'CONTAINS'|'TOKENS'|'LOW_CONFIDENCE';
  quantity?:number;
  amount?:number;
};

export function normalizeArabic(value:string){
  return String(value??'')
    .replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
    .replace(/[أإآٱ]/g,'ا')
    .replace(/ى/g,'ي')
    .replace(/ة/g,'ه')
    .replace(/[^\p{L}\p{N}\s-]+/gu,' ')
    .replace(/\s+/g,' ')
    .trim()
    .toLowerCase();
}

function tokenSet(value:string){
  return new Set(normalizeArabic(value).split(' ').filter(token=>token.length>1));
}

export function nameSimilarity(left:string,right:string){
  const a=normalizeArabic(left),b=normalizeArabic(right);
  if(!a||!b)return 0;
  if(a===b)return 100;
  if(a.includes(b)||b.includes(a)){
    const min=Math.min(a.length,b.length),max=Math.max(a.length,b.length);
    return Math.round(75+25*(min/max));
  }
  const A=tokenSet(a),B=tokenSet(b);
  if(!A.size||!B.size)return 0;
  let inter=0;
  for(const token of A)if(B.has(token))inter+=1;
  const union=new Set([...A,...B]).size;
  return Math.round((inter/union)*100);
}

export function bestCatalogMatch(query:string,items:CatalogItem[],aliases:ProductAliasMap={}):SalesMatchResult{
  const normalized=normalizeArabic(query);
  const active=items.filter(item=>item.active!==false);
  const aliasId=aliases[normalized];
  if(aliasId){
    const item=active.find(row=>row.id===aliasId)??null;
    if(item)return {sourceName:query,normalized,item,score:100,reason:'ALIAS'};
  }

  let best:CatalogItem|null=null;
  let score=0;
  for(const item of active){
    const candidate=Math.max(nameSimilarity(query,item.name),nameSimilarity(query,item.sku));
    if(candidate>score){score=candidate;best=item;}
  }

  const reason:SalesMatchResult['reason']=
    score===100?'EXACT':
    score>=75?'CONTAINS':
    score>=35?'TOKENS':'LOW_CONFIDENCE';

  return {sourceName:query,normalized,item:score>=35?best:null,score,reason};
}

function numeric(value:string|undefined){
  if(!value)return undefined;
  const normalized=value.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).replace(/[٬,\s]/g,'').replace('٫','.');
  const parsed=Number(normalized);
  return Number.isFinite(parsed)?parsed:undefined;
}

export function parseSalesMatchText(text:string):SalesMatchInput[]{
  return text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const cells=line.includes('\t')?line.split('\t'):line.includes(';')?line.split(';'):line.split(',');
    const cleaned=cells.map(cell=>cell.trim());
    return {sourceName:cleaned[0]??'',quantity:numeric(cleaned[1]),amount:numeric(cleaned[2])};
  }).filter(row=>row.sourceName);
}

export function matchSalesRows(rows:SalesMatchInput[],items:CatalogItem[],aliases:ProductAliasMap={}){
  return rows.map(row=>({...bestCatalogMatch(row.sourceName,items,aliases),quantity:row.quantity,amount:row.amount}));
}

export function learnAlias(aliases:ProductAliasMap,sourceName:string,itemId:string){
  const key=normalizeArabic(sourceName);
  if(!key)return aliases;
  return {...aliases,[key]:itemId};
}

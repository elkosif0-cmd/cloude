import {makeScopedKey,readActiveScope} from './scope-key';

export type LegacyDataset={
  local:Record<string,string>;
  idb:Record<string,unknown[]>;
  source:'device'|'backup-file';
  createdAt?:string;
};

export type MigrationReport={
  source:'device'|'backup-file';
  localKeys:number;
  idbStores:number;
  idbRows:number;
  catalogItems:number;
  customers:number;
  suppliers:number;
  supplierBatches:number;
  reorderPlans:number;
  offers:number;
  b2bCredits:number;
  legacyCommerceRows:number;
  warnings:string[];
};

type StorageLike={
  length:number;
  key:(index:number)=>string|null;
  getItem:(key:string)=>string|null;
  setItem:(key:string,value:string)=>void;
};

const LEGACY_PREFIX=/^(aghnam|skosif|kosif|s_kosif)/;
const LEGACY_DB='aghnam-app-v7';
const ARCHIVE_DB='skosif-migration-archive-v1';

function parseJson<T>(value:string|undefined,fallback:T):T{
  if(!value)return fallback;
  try{return JSON.parse(value) as T;}catch{return fallback;}
}

function money(value:number){
  return Math.round((value+Number.EPSILON)*100)/100;
}

function text(value:unknown){
  return String(value??'').trim();
}

function numeric(value:unknown){
  const n=Number(String(value??'').replace(/[,\s]/g,''));
  return Number.isFinite(n)?n:0;
}

function stableId(prefix:string,value:unknown,index=0){
  const base=text(value).toLowerCase().replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'');
  return prefix+'-'+(base||String(index+1));
}

function readEnvelope<T extends {id:string}>(storage:StorageLike,key:string):T[]{
  const raw=storage.getItem(key);
  if(!raw)return [];
  try{
    const parsed=JSON.parse(raw) as {version?:number;records?:T[]};
    return parsed?.version===1&&Array.isArray(parsed.records)?parsed.records:[];
  }catch{return [];}
}

function mergeEnvelope<T extends {id:string}>(storage:StorageLike,key:string,records:T[]){
  const map=new Map(readEnvelope<T>(storage,key).map(row=>[row.id,row]));
  for(const record of records)map.set(record.id,record);
  storage.setItem(key,JSON.stringify({version:1,records:[...map.values()]}));
}

function readLegacyLocal(storage:StorageLike){
  const local:Record<string,string>={};
  for(let i=0;i<storage.length;i+=1){
    const key=storage.key(i);
    if(!key||!LEGACY_PREFIX.test(key)||key.startsWith('skosif.v1.'))continue;
    const value=storage.getItem(key);
    if(value!==null)local[key]=value;
  }
  return local;
}

function openDb(name:string){
  return new Promise<IDBDatabase|null>((resolve,reject)=>{
    if(!('indexedDB' in window)){resolve(null);return;}
    const request=indexedDB.open(name);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onupgradeneeded=()=>resolve(null);
  });
}

function requestValue<T>(request:IDBRequest<T>){
  return new Promise<T>((resolve,reject)=>{
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function readLegacyIdb(){
  const db=await openDb(LEGACY_DB);
  if(!db)return {} as Record<string,unknown[]>;
  const out:Record<string,unknown[]>={};
  for(const storeName of Array.from(db.objectStoreNames)){
    out[storeName]=await requestValue(db.transaction(storeName).objectStore(storeName).getAll());
  }
  db.close();
  return out;
}

export async function discoverLegacyDataset(storage:StorageLike):Promise<LegacyDataset>{
  return {local:readLegacyLocal(storage),idb:await readLegacyIdb(),source:'device'};
}

export function parseLegacyBackup(textValue:string):LegacyDataset|null{
  try{
    const parsed=JSON.parse(textValue) as any;
    if(parsed?.format==='skosif-backup'&&parsed?.local&&parsed?.idb){
      return {local:parsed.local,idb:parsed.idb,source:'backup-file',createdAt:parsed.createdAt};
    }
    if(parsed?.app==='S.kosif'&&parsed?.data&&typeof parsed.data==='object'){
      const local:Record<string,string>={};
      for(const [key,value] of Object.entries(parsed.data)){
        if(LEGACY_PREFIX.test(key))local[key]=typeof value==='string'?value:JSON.stringify(value);
      }
      return {local,idb:{},source:'backup-file',createdAt:parsed.exportedAt};
    }
    return null;
  }catch{return null;}
}

export function inspectLegacyDataset(dataset:LegacyDataset):MigrationReport{
  const supplierBatches=parseJson<any[]>(dataset.local['skosif_v31_supplier_batches'],[]);
  const reorderPlans=parseJson<any[]>(dataset.local['aghnam_v29_inventory'],[]);
  const offers=parseJson<Record<string,unknown>>(dataset.local['skosif_v32_offers'],{});
  const b2b=parseJson<any[]>(dataset.local['skosif_v38_ledger'],[]);
  const pricing=parseJson<any>(dataset.local['aghnam-pricing-v3'],{});
  const raws=Array.isArray(pricing?.raws)?pricing.raws:[];
  const idbRows=Object.values(dataset.idb).reduce((sum,rows)=>sum+(Array.isArray(rows)?rows.length:0),0);
  const customerRows=[
    ...(Array.isArray(dataset.idb.customers)?dataset.idb.customers:[]),
    ...(Array.isArray(dataset.idb.customer_master_rows)?dataset.idb.customer_master_rows:[]),
    ...b2b,
  ];
  const supplierNames=new Set(supplierBatches.map(batch=>text(batch?.supplier)).filter(Boolean));
  return {
    source:dataset.source,
    localKeys:Object.keys(dataset.local).length,
    idbStores:Object.keys(dataset.idb).length,
    idbRows,
    catalogItems:raws.length,
    customers:customerRows.length,
    suppliers:supplierNames.size,
    supplierBatches:supplierBatches.length,
    reorderPlans:reorderPlans.length,
    offers:Object.keys(offers).length,
    b2bCredits:b2b.length,
    legacyCommerceRows:['orders','order_items','payments','sales_lines','sales_descriptions','ops_orders'].reduce((sum,key)=>sum+(dataset.idb[key]?.length??0),0),
    warnings:[],
  };
}

function mapCatalog(dataset:LegacyDataset){
  const pricing=parseJson<any>(dataset.local['aghnam-pricing-v3'],{});
  const raws=Array.isArray(pricing?.raws)?pricing.raws:[];
  return raws.filter((row:any)=>row&&row.status!=='archived').map((row:any,index:number)=>{
    const buy=numeric(row.buy);
    const vatRate=0.15;
    const cost=row.vat==='incl'?buy/(1+vatRate):buy;
    const price=numeric(row.sell||row.price||row.selling||0);
    return {
      id:stableId('item',row.id||row.sku||row.name,index),
      sku:text(row.id||row.sku)||('LEGACY-'+(index+1)),
      name:text(row.name)||('صنف قديم '+(index+1)),
      unit:'kg',
      vatRate,
      defaultCost:cost>0?money(cost):undefined,
      defaultPrice:price>0?money(price):undefined,
      active:true,
      legacy:{category:text(row.cat),wastePercent:numeric(row.waste),source:'aghnam-pricing-v3'},
    };
  });
}

function mapSuppliers(dataset:LegacyDataset){
  const batches=parseJson<any[]>(dataset.local['skosif_v31_supplier_batches'],[]);
  const names=[...new Set(batches.map(batch=>text(batch?.supplier)).filter(Boolean))];
  return names.map((name,index)=>({id:stableId('supplier',name,index),code:'LEG-S'+String(index+1).padStart(3,'0'),name,active:true}));
}

function mapCustomers(dataset:LegacyDataset){
  const b2b=parseJson<any[]>(dataset.local['skosif_v38_ledger'],[]);
  const rows=[
    ...(Array.isArray(dataset.idb.customers)?dataset.idb.customers:[]),
    ...(Array.isArray(dataset.idb.customer_master_rows)?dataset.idb.customer_master_rows:[]),
    ...b2b,
  ] as any[];
  const map=new Map<string,any>();
  rows.forEach((row,index)=>{
    const name=text(row?.name||row?.customer_name||row?.customerName||row?.customer);
    const phone=text(row?.phone||row?.mobile||row?.mobile_no||row?.phone_number);
    const code=text(row?.code||row?.customer_code||row?.customerCode||row?.id)||('LEG-C'+String(index+1).padStart(4,'0'));
    const identity=(phone.replace(/\D/g,'')||code.toLowerCase()||name.toLowerCase());
    if(!identity)return;
    map.set(identity,{
      id:stableId('customer',code||phone||name,index),
      code,
      name:name||code,
      phone:phone||undefined,
      email:text(row?.email)||undefined,
      city:text(row?.city||row?.region)||undefined,
      active:row?.active!==false,
    });
  });
  return [...map.values()];
}

function mapSupplierBatches(dataset:LegacyDataset,suppliers:any[],items:any[]){
  const batches=parseJson<any[]>(dataset.local['skosif_v31_supplier_batches'],[]);
  return batches.map((batch,index)=>{
    const supplier=suppliers.find(s=>s.name===text(batch?.supplier));
    const item=items.find(i=>i.sku===text(batch?.itemId)||i.name===text(batch?.itemName));
    return {
      id:text(batch?.id)||stableId('legacy-batch',batch?.createdAt||index,index),
      date:text(batch?.date)||text(batch?.createdAt).slice(0,10),
      supplierId:supplier?.id,
      supplierName:text(batch?.supplier),
      itemId:item?.id,
      itemName:text(batch?.itemName),
      quantity:numeric(batch?.qty),
      unit:text(batch?.unit)||'كجم',
      priceGross:numeric(batch?.priceGross),
      vatInclusive:Boolean(batch?.vatIncl),
      agreedWastePercent:numeric(batch?.agreedWaste),
      actualWastePercent:numeric(batch?.actualWaste),
      quality:numeric(batch?.quality),
      note:text(batch?.note)||undefined,
      legacySource:'skosif_v31_supplier_batches',
    };
  });
}

function mapB2BCredit(dataset:LegacyDataset,customers:any[]){
  const rows=parseJson<any[]>(dataset.local['skosif_v38_ledger'],[]);
  return rows.map((row,index)=>{
    const customer=customers.find(c=>c.phone&&c.phone===text(row?.phone))||customers.find(c=>c.name===text(row?.name));
    return {
      id:text(row?.id)||stableId('credit',row?.name,index),
      customerId:customer?.id,
      customerName:text(row?.name),
      limit:numeric(row?.limit),
      balance:numeric(row?.balance),
      terms:text(row?.terms),
      movements:Array.isArray(row?.moves)?row.moves:[],
      legacySource:'skosif_v38_ledger',
    };
  });
}

function mapOffers(dataset:LegacyDataset,items:any[]){
  const offers=parseJson<Record<string,unknown>>(dataset.local['skosif_v32_offers'],{});
  return Object.entries(offers).map(([legacyItemId,discount],index)=>{
    const item=items.find(i=>i.sku===legacyItemId||i.id===legacyItemId);
    return {id:'offer-'+(item?.id||stableId('legacy',legacyItemId,index)),itemId:item?.id,legacyItemId,discountRate:numeric(discount),active:numeric(discount)>0,legacySource:'skosif_v32_offers'};
  });
}

function mapReorderPlans(dataset:LegacyDataset){
  const rows=parseJson<any[]>(dataset.local['aghnam_v29_inventory'],[]);
  return rows.map((row,index)=>({
    id:text(row?.id)||stableId('reorder',row?.item||row?.ts,index),
    itemName:text(row?.item),
    stock:numeric(row?.stock),
    daily:numeric(row?.daily),
    leadDays:numeric(row?.lead),
    safetyDays:numeric(row?.safety),
    cycleDays:numeric(row?.cycle),
    coverDays:numeric(row?.cover),
    reorderPoint:numeric(row?.reorderPoint),
    targetStock:numeric(row?.targetStock),
    suggested:numeric(row?.suggested),
    status:text(row?.status),
    at:text(row?.ts)||undefined,
    legacySource:'aghnam_v29_inventory',
  }));
}

function mapLegacyCommerce(dataset:LegacyDataset){
  const stores=['orders','order_items','payments','sales_lines','sales_descriptions','ops_orders','imports','import_errors','pricing_snapshots'];
  const records:any[]=[];
  for(const store of stores){
    for(const [index,row] of (dataset.idb[store]??[]).entries()){
      records.push({id:'legacy-'+store+'-'+text((row as any)?.id||index),store,row});
    }
  }
  return records;
}

export async function archiveLegacyDataset(dataset:LegacyDataset){
  if(!('indexedDB' in window))return false;
  await new Promise<void>((resolve,reject)=>{
    const request=indexedDB.open(ARCHIVE_DB,1);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'id'});};
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result;
      const tx=db.transaction('snapshots','readwrite');
      tx.objectStore('snapshots').put({id:'migration-'+Date.now(),createdAt:new Date().toISOString(),dataset});
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onerror=()=>{db.close();reject(tx.error);};
    };
  });
  return true;
}

export async function applyLegacyMigration(storage:StorageLike,dataset:LegacyDataset){
  const scope=readActiveScope(storage as any);
  const items=mapCatalog(dataset);
  const customers=mapCustomers(dataset);
  const suppliers=mapSuppliers(dataset);
  const batches=mapSupplierBatches(dataset,suppliers,items);
  const credits=mapB2BCredit(dataset,customers);
  const offers=mapOffers(dataset,items);
  const reorderPlans=mapReorderPlans(dataset);
  const commerce=mapLegacyCommerce(dataset);

  mergeEnvelope(storage,makeScopedKey('catalog.items',scope),items);
  mergeEnvelope(storage,makeScopedKey('sales.customers',scope),customers);
  mergeEnvelope(storage,makeScopedKey('procurement.suppliers',scope),suppliers);
  mergeEnvelope(storage,makeScopedKey('procurement.supplier-batches',scope),batches);
  mergeEnvelope(storage,makeScopedKey('sales.credit-ledger',scope),credits);
  mergeEnvelope(storage,makeScopedKey('sales.offers',scope),offers);
  mergeEnvelope(storage,makeScopedKey('stock.reorder-plans',scope),reorderPlans);
  mergeEnvelope(storage,makeScopedKey('legacy.commerce',scope),commerce);

  await archiveLegacyDataset(dataset);

  const report=inspectLegacyDataset(dataset);
  storage.setItem('skosif.v1.system.last-legacy-migration',JSON.stringify({...report,migratedAt:new Date().toISOString()}));
  return report;
}

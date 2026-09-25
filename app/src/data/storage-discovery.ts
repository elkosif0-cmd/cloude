export type StorageSummary={key:string;bytes:number;classification:'known'|'unknown'};
export type StorageLike={length:number;key:(index:number)=>string|null;getItem:(key:string)=>string|null};

const knownKeys=new Set(['aghnam-pricing-v3','skosif_v38_ledger']);

export function discoverLocalStorage(storage:StorageLike):StorageSummary[]{
  const rows:StorageSummary[]=[];
  for(let i=0;i<storage.length;i+=1){
    const key=storage.key(i);
    if(!key)continue;
    const value=storage.getItem(key)??'';
    rows.push({key,bytes:new TextEncoder().encode(value).byteLength,classification:knownKeys.has(key)?'known':'unknown'});
  }
  return rows.sort((a,b)=>a.key.localeCompare(b.key));
}

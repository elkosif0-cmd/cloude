export type ActiveScope={companyId:string;periodId?:string};

const ACTIVE_SCOPE_KEY='skosif.v1.system.active-scope';

export function makeScopedKey(base:string,scope:ActiveScope|null){
  if(!scope?.companyId)return 'skosif.v1.unscoped.'+base;
  return 'skosif.v1.'+scope.companyId+'.'+(scope.periodId||'all-periods')+'.'+base;
}

export function readActiveScope(storage:{getItem:(key:string)=>string|null}):ActiveScope|null{
  const raw=storage.getItem(ACTIVE_SCOPE_KEY);
  if(!raw)return null;
  try{
    const value=JSON.parse(raw) as Partial<ActiveScope>;
    if(typeof value.companyId!=='string'||!value.companyId)return null;
    return {companyId:value.companyId,periodId:typeof value.periodId==='string'&&value.periodId?value.periodId:undefined};
  }catch{return null;}
}

export function writeActiveScope(storage:{setItem:(key:string,value:string)=>void},scope:ActiveScope|null){
  storage.setItem(ACTIVE_SCOPE_KEY,JSON.stringify(scope));
}

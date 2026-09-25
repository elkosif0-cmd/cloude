export type RepositoryChangeAction='CREATE'|'UPDATE'|'BATCH_PUT'|'REMOVE'|'CLEAR';

export type RepositoryChangeEvent={
  id:string;
  at:string;
  action:RepositoryChangeAction;
  entity:string;
  entityId?:string;
  detail?:Record<string,string|number|boolean|null>;
};

export const CHANGE_LOG_KEY='skosif.v1.system.audit-trail';
const MAX_EVENTS=2000;

type ReadStorage={getItem:(key:string)=>string|null};
type WriteStorage=ReadStorage&{setItem:(key:string,value:string)=>void};

function entityFromKey(key:string){
  return key.startsWith('skosif.v1.')?key.slice('skosif.v1.'.length):key;
}

export function readRepositoryChanges(storage:ReadStorage):RepositoryChangeEvent[]{
  const raw=storage.getItem(CHANGE_LOG_KEY);
  if(!raw)return [];
  try{
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[];
  }catch{return [];}
}

export function recordRepositoryChange(
  storage:WriteStorage,
  input:{key:string;action:RepositoryChangeAction;entityId?:string;count?:number}
){
  if(input.key===CHANGE_LOG_KEY||input.key==='skosif.v1.system.error-log')return null;
  const event:RepositoryChangeEvent={
    id:crypto.randomUUID(),
    at:new Date().toISOString(),
    action:input.action,
    entity:entityFromKey(input.key),
    entityId:input.entityId,
    detail:input.count===undefined?undefined:{count:input.count},
  };
  const events=readRepositoryChanges(storage);
  storage.setItem(CHANGE_LOG_KEY,JSON.stringify([event,...events].slice(0,MAX_EVENTS)));
  return event;
}

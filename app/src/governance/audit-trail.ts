export type AuditEvent={
  id:string;
  at:string;
  action:string;
  entity:string;
  entityId?:string;
  detail?:Record<string,string|number|boolean|null>;
};

const AUDIT_KEY='skosif.v1.system.audit-trail';
const MAX_EVENTS=2000;

export function readAuditTrail(storage:{getItem:(key:string)=>string|null}):AuditEvent[]{
  const raw=storage.getItem(AUDIT_KEY);
  if(!raw)return [];
  try{
    const value=JSON.parse(raw);
    return Array.isArray(value)?value:[];
  }catch{return [];}
}

export function recordAuditEvent(storage:{getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void},input:Omit<AuditEvent,'id'|'at'>){
  const events=readAuditTrail(storage);
  const event:AuditEvent={id:crypto.randomUUID(),at:new Date().toISOString(),...input};
  const next=[event,...events].slice(0,MAX_EVENTS);
  storage.setItem(AUDIT_KEY,JSON.stringify(next));
  return event;
}

export function clearAuditTrail(storage:{removeItem:(key:string)=>void}){
  storage.removeItem(AUDIT_KEY);
}

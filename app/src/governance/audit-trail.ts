import {CHANGE_LOG_KEY,readRepositoryChanges,recordRepositoryChange,type RepositoryChangeEvent} from '../data/change-log';

export type AuditEvent=RepositoryChangeEvent;

export function readAuditTrail(storage:{getItem:(key:string)=>string|null}):AuditEvent[]{
  return readRepositoryChanges(storage);
}

export function recordAuditEvent(
  storage:{getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void},
  input:{action:string;entity:string;entityId?:string;detail?:Record<string,string|number|boolean|null>}
){
  const event:AuditEvent={
    id:crypto.randomUUID(),
    at:new Date().toISOString(),
    action:input.action as AuditEvent['action'],
    entity:input.entity,
    entityId:input.entityId,
    detail:input.detail,
  };
  const events=readAuditTrail(storage);
  storage.setItem(CHANGE_LOG_KEY,JSON.stringify([event,...events].slice(0,2000)));
  return event;
}

export function clearAuditTrail(storage:{removeItem:(key:string)=>void}){
  storage.removeItem(CHANGE_LOG_KEY);
}

export {recordRepositoryChange};

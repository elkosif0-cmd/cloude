export type ErrorLogEntry={
  id:string;
  at:string;
  message:string;
  stack?:string;
  context?:string;
};

const ERROR_KEY='skosif.v1.system.error-log';
const MAX_ERRORS=500;

export function readErrorLog(storage:{getItem:(key:string)=>string|null}):ErrorLogEntry[]{
  const raw=storage.getItem(ERROR_KEY);
  if(!raw)return [];
  try{const value=JSON.parse(raw);return Array.isArray(value)?value:[];}catch{return [];}
}

export function logClientError(storage:{getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void},error:unknown,context?:string){
  const normalized=error instanceof Error?error:new Error(String(error));
  const entry:ErrorLogEntry={id:crypto.randomUUID(),at:new Date().toISOString(),message:normalized.message,stack:normalized.stack,context};
  const next=[entry,...readErrorLog(storage)].slice(0,MAX_ERRORS);
  storage.setItem(ERROR_KEY,JSON.stringify(next));
  return entry;
}

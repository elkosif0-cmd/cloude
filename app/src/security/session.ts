export const SESSION_TTL_MS=24*60*60*1000;

export type DeviceSession={version:1;userId:string;role:string;issuedAt:number;expiresAt:number;nonce:string};

export function createDeviceSession(input:{userId:string;role:string},now=Date.now()):DeviceSession{
  return {version:1,userId:input.userId,role:input.role,issuedAt:now,expiresAt:now+SESSION_TTL_MS,nonce:crypto.randomUUID()};
}

export function readDeviceSession(raw:string|null,now=Date.now()):DeviceSession|null{
  if(!raw)return null;
  try{
    const value=JSON.parse(raw) as Partial<DeviceSession>;
    if(value.version!==1||typeof value.userId!=='string'||typeof value.role!=='string'||typeof value.issuedAt!=='number'||typeof value.expiresAt!=='number'||typeof value.nonce!=='string')return null;
    if(value.expiresAt<=now||value.issuedAt>now)return null;
    return value as DeviceSession;
  }catch{return null;}
}

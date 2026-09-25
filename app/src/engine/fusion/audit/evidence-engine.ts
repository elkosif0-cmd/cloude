export type EvidenceStatus='RECEIVED'|'REVIEWED'|'REJECTED';

export type EvidenceRecord={
  id:string;
  name:string;
  size:number;
  mimeType:string;
  sha256:string;
  receivedAt:string;
  pbcRequestId?:string;
  notes?:string;
  status:EvidenceStatus;
};

function toHex(bytes:ArrayBuffer){
  return [...new Uint8Array(bytes)].map(value=>value.toString(16).padStart(2,'0')).join('');
}

export async function sha256Blob(blob:Blob){
  const hash=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
  return toHex(hash);
}

export async function createEvidenceRecord(input:{
  id:string;
  file:Blob&{name?:string;type:string;size:number};
  pbcRequestId?:string;
  notes?:string;
  now?:Date;
}):Promise<EvidenceRecord>{
  return {
    id:input.id,
    name:input.file.name??'evidence.bin',
    size:input.file.size,
    mimeType:input.file.type||'application/octet-stream',
    sha256:await sha256Blob(input.file),
    receivedAt:(input.now??new Date()).toISOString(),
    pbcRequestId:input.pbcRequestId||undefined,
    notes:input.notes?.trim()||undefined,
    status:'RECEIVED',
  };
}

export function updateEvidenceStatus(record:EvidenceRecord,status:EvidenceStatus):EvidenceRecord{
  return {...record,status};
}

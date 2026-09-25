export type StorageSnapshot={
  version:1;
  createdAt:string;
  entries:Record<string,string>;
};

export type RestorePreview={
  valid:boolean;
  incomingKeys:number;
  createKeys:number;
  replaceKeys:number;
  ignoredKeys:number;
};

export type StorageAccess={
  length:number;
  key:(index:number)=>string|null;
  getItem:(key:string)=>string|null;
  setItem:(key:string,value:string)=>void;
};

export function createStorageSnapshot(storage:StorageAccess,prefix='skosif.v1.'):StorageSnapshot{
  const entries:Record<string,string>={};
  for(let i=0;i<storage.length;i+=1){
    const key=storage.key(i);
    if(!key||!key.startsWith(prefix))continue;
    const value=storage.getItem(key);
    if(value!==null)entries[key]=value;
  }
  return {version:1,createdAt:new Date().toISOString(),entries};
}

export function parseStorageSnapshot(text:string):StorageSnapshot|null{
  try{
    const value=JSON.parse(text) as Partial<StorageSnapshot>;
    if(value.version!==1||typeof value.createdAt!=='string'||!value.entries||typeof value.entries!=='object'||Array.isArray(value.entries))return null;
    if(Object.entries(value.entries).some(([key,val])=>!key.startsWith('skosif.v1.')||typeof val!=='string'))return null;
    return value as StorageSnapshot;
  }catch{return null;}
}

export function previewRestore(storage:Pick<StorageAccess,'getItem'>,snapshot:StorageSnapshot):RestorePreview{
  let createKeys=0,replaceKeys=0,ignoredKeys=0;
  for(const [key] of Object.entries(snapshot.entries)){
    if(!key.startsWith('skosif.v1.')){ignoredKeys+=1;continue;}
    if(storage.getItem(key)===null)createKeys+=1;
    else replaceKeys+=1;
  }
  return {valid:true,incomingKeys:Object.keys(snapshot.entries).length,createKeys,replaceKeys,ignoredKeys};
}

export function restoreStorageSnapshot(storage:Pick<StorageAccess,'setItem'>,snapshot:StorageSnapshot){
  for(const [key,value] of Object.entries(snapshot.entries)){
    if(key.startsWith('skosif.v1.'))storage.setItem(key,value);
  }
}

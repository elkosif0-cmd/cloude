const DB_NAME='skosif-evidence-v1';
const STORE_NAME='files';

function openEvidenceDb(){
  return new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:'id'});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

export async function putEvidenceFile(id:string,file:Blob){
  const db=await openEvidenceDb();
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    tx.objectStore(STORE_NAME).put({id,file});
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error);
  });
  db.close();
}

export async function getEvidenceFile(id:string){
  const db=await openEvidenceDb();
  const result=await new Promise<{id:string;file:Blob}|undefined>((resolve,reject)=>{
    const request=db.transaction(STORE_NAME).objectStore(STORE_NAME).get(id);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
  db.close();
  return result?.file;
}

export async function deleteEvidenceFile(id:string){
  const db=await openEvidenceDb();
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error);
  });
  db.close();
}

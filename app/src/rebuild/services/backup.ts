export interface BackupEnvelope{app:string;schema:string;exportedAt:string;data:Record<string,unknown>}
const allowed=(k:string)=>k.startsWith('aghn')||k.startsWith('skosif')||k.startsWith('s_kosif')||k.startsWith('kosif');
export function parseBackup(text:string):BackupEnvelope{
 let x:any;try{x=JSON.parse(text)}catch{throw new Error('ملف النسخة الاحتياطية ليس JSON صالحًا')}
 if(!x||x.app!=='S.kosif'||!x.data||typeof x.data!=='object'||Array.isArray(x.data))throw new Error('هذا الملف ليس نسخة S.kosif معروفة');
 const keys=Object.keys(x.data);if(!keys.length)throw new Error('النسخة لا تحتوي بيانات');
 const bad=keys.filter(k=>!allowed(k));if(bad.length)throw new Error('النسخة تحتوي مفاتيح غير مسموحة: '+bad.slice(0,3).join(', '));
 return x;
}
export function restoreBackup(envelope:BackupEnvelope){
 const rollback=new Map<string,string|null>();let restored=0;
 try{
  for(const[k,v]of Object.entries(envelope.data)){if(!allowed(k))continue;rollback.set(k,localStorage.getItem(k));localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));restored++}
  localStorage.setItem('skosif_rebuild_restore_receipt',JSON.stringify({at:new Date().toISOString(),source:envelope.exportedAt,restored}));
  return{restored};
 }catch(error){
  for(const[k,v]of rollback.entries()){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch{}}
  throw error;
 }
}

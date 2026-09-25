import {useEffect,useMemo,useState,type ChangeEvent} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {createEvidenceRecord,updateEvidenceStatus,type EvidenceRecord,type EvidenceStatus} from './evidence-engine';
import {deleteEvidenceFile,getEvidenceFile,putEvidenceFile} from './evidence-store';
import type {PbcRequest} from './pbc-engine';

export function EvidencePanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const evidenceRepo=useMemo(()=>new JsonStorageRepository<EvidenceRecord>(window.localStorage,makeScopedKey('audit.evidence',scope)),[scope]);
  const pbcRepo=useMemo(()=>new JsonStorageRepository<PbcRequest>(window.localStorage,makeScopedKey('audit.pbc',scope)),[scope]);
  const [records,setRecords]=useState<EvidenceRecord[]>([]);
  const [pbc,setPbc]=useState<PbcRequest[]>([]);
  const [file,setFile]=useState<File|null>(null);
  const [pbcRequestId,setPbcRequestId]=useState('');
  const [notes,setNotes]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{void Promise.all([evidenceRepo.list(),pbcRepo.list()]).then(([e,p])=>{setRecords(e);setPbc(p);});},[evidenceRepo,pbcRepo]);

  async function upload(){
    if(!file){setMessage('اختر ملفًا أولًا.');return;}
    setBusy(true);
    try{
      const id=crypto.randomUUID();
      const record=await createEvidenceRecord({id,file,pbcRequestId:pbcRequestId||undefined,notes});
      await putEvidenceFile(id,file);
      await evidenceRepo.put(record);
      setRecords(await evidenceRepo.list());
      setFile(null);setNotes('');
      setMessage('تم حفظ الملف وبصمة SHA-256.');
    }catch(error){setMessage('تعذر حفظ الدليل: '+String(error));}
    finally{setBusy(false);}
  }

  async function setStatus(record:EvidenceRecord,status:EvidenceStatus){
    await evidenceRepo.put(updateEvidenceStatus(record,status));
    setRecords(await evidenceRepo.list());
  }

  async function download(record:EvidenceRecord){
    const blob=await getEvidenceFile(record.id);
    if(!blob){setMessage('ملف الدليل غير موجود على هذا الجهاز، لكن بيانات البصمة ما زالت محفوظة.');return;}
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download=record.name;anchor.click();
    URL.revokeObjectURL(url);
  }

  async function remove(record:EvidenceRecord){
    await deleteEvidenceFile(record.id);
    await evidenceRepo.remove(record.id);
    setRecords(await evidenceRepo.list());
    setMessage('تم حذف الدليل من مساحة العمل الحالية.');
  }

  return <section className="audit-evidence sk-surface">
    <div className="audit-evidence__head"><div><span className="eyebrow">Evidence Repository</span><h3>أدلة المراجعة وبصمة SHA-256</h3></div><strong>{records.length} ملف</strong></div>
    <div className="audit-evidence__form">
      <input type="file" onChange={(e:ChangeEvent<HTMLInputElement>)=>setFile(e.target.files?.[0]??null)}/>
      <select value={pbcRequestId} onChange={(e)=>setPbcRequestId(e.target.value)}><option value="">ربط بـ PBC - اختياري</option>{pbc.map(request=><option key={request.id} value={request.id}>{request.title}</option>)}</select>
      <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="ملاحظات الدليل"/>
      <button onClick={()=>void upload()} disabled={busy}>{busy?'جارٍ الحفظ…':'حفظ الدليل'}</button>
    </div>
    {message?<p className="audit-message">{message}</p>:null}
    {records.length===0?<p className="audit-empty">لا توجد أدلة محفوظة بعد.</p>:<div className="audit-evidence__list">{records.map(record=><article key={record.id}>
      <div><b>{record.name}</b><small>{(record.size/1024).toFixed(1)} KB · {new Date(record.receivedAt).toLocaleString('ar-SA')}</small><code>{record.sha256}</code></div>
      <span>{record.pbcRequestId?pbc.find(x=>x.id===record.pbcRequestId)?.title??record.pbcRequestId:'غير مرتبط'}</span>
      <select value={record.status} onChange={(e)=>void setStatus(record,e.target.value as EvidenceStatus)}><option value="RECEIVED">مستلم</option><option value="REVIEWED">تمت المراجعة</option><option value="REJECTED">مرفوض</option></select>
      <div className="audit-evidence__actions"><button onClick={()=>void download(record)}>تحميل</button><button className="danger" onClick={()=>void remove(record)}>حذف</button></div>
    </article>)}</div>}
  </section>;
}

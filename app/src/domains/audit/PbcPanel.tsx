import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {derivePbcStatus,pbcCompletionPercent,type PbcRequest} from './pbc-engine';

const STORAGE_KEY='skosif.v1.audit.pbc';

export function PbcPanel(){
  const [requests,setRequests]=useState<PbcRequest[]>([]);
  const [title,setTitle]=useState('');
  const [required,setRequired]=useState('1');
  const [received,setReceived]=useState('0');
  const [round,setRound]=useState('1');
  const repo=useMemo(()=>new JsonStorageRepository<PbcRequest & {id:string}>(window.localStorage,STORAGE_KEY),[]);
  useEffect(()=>{void repo.list().then(setRequests);},[repo]);
  const completion=pbcCompletionPercent(requests);

  async function addRequest(){
    const req=Math.max(0,Number(required)||0),rec=Math.max(0,Number(received)||0),rnd=Math.max(1,Math.floor(Number(round)||1));
    if(!title.trim()||req<=0)return;
    await repo.put({id:crypto.randomUUID(),title:title.trim(),requiredItems:req,receivedItems:rec,round:rnd});
    setRequests(await repo.list());setTitle('');setReceived('0');
  }

  return <section className="audit-pbc sk-surface">
    <div className="audit-pbc__head"><div><span className="eyebrow">PBC Requests</span><h3>طلبات المستندات والمتابعات</h3></div><strong className="sk-number">{completion}%</strong></div>
    <div className="audit-pbc__form"><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="اسم الطلب"/><input inputMode="numeric" value={required} onChange={(e)=>setRequired(e.target.value)} placeholder="المطلوب"/><input inputMode="numeric" value={received} onChange={(e)=>setReceived(e.target.value)} placeholder="المستلم"/><input inputMode="numeric" value={round} onChange={(e)=>setRound(e.target.value)} placeholder="الجولة"/><button onClick={()=>void addRequest()}>إضافة</button></div>
    {requests.length===0?<p className="audit-empty">لا توجد طلبات PBC بعد.</p>:<div className="audit-pbc__list">{requests.map((request)=><article key={request.id}><div><b>{request.title}</b><small>الجولة {request.round}</small></div><span>{request.receivedItems}/{request.requiredItems}</span><strong>{derivePbcStatus(request)}</strong></article>)}</div>}
  </section>;
}

import {useEffect,useMemo,useState,type ChangeEvent} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {sha256Blob} from './evidence-engine';
import {createStandard,searchStandards,type StandardFramework,type StandardRecord} from './standards-engine';
import {deleteStandardFile,getStandardFile,putStandardFile} from './standards-store';

export function StandardsPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<StandardRecord>(window.localStorage,makeScopedKey('audit.standards',scope)),[scope]);
  const [records,setRecords]=useState<StandardRecord[]>([]);
  const [query,setQuery]=useState('');
  const [code,setCode]=useState('');
  const [title,setTitle]=useState('');
  const [framework,setFramework]=useState<StandardFramework>('IFRS');
  const [effectiveDate,setEffectiveDate]=useState('');
  const [tags,setTags]=useState('');
  const [notes,setNotes]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [message,setMessage]=useState('');

  useEffect(()=>{void repo.list().then(setRecords);},[repo]);
  const filtered=useMemo(()=>searchStandards(records,query),[records,query]);

  async function add(){
    try{
      let sha256:string|undefined;
      if(file)sha256=await sha256Blob(file);
      const record=createStandard({
        code,title,framework,effectiveDate:effectiveDate||undefined,tags:tags.split(','),
        sha256,fileName:file?.name,fileSize:file?.size,notes:notes||undefined,
      });
      if(file)await putStandardFile(record.id,file);
      await repo.put(record);
      setRecords(await repo.list());
      setCode('');setTitle('');setEffectiveDate('');setTags('');setNotes('');setFile(null);
      setMessage('تمت إضافة المرجع إلى مكتبة المكتب.');
    }catch(error){setMessage(String(error));}
  }

  async function download(record:StandardRecord){
    const blob=await getStandardFile(record.id);
    if(!blob){setMessage('لا توجد نسخة ملف محلية لهذا المرجع.');return;}
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');anchor.href=url;anchor.download=record.fileName??record.code+'.pdf';anchor.click();URL.revokeObjectURL(url);
  }

  async function remove(record:StandardRecord){
    await deleteStandardFile(record.id);
    await repo.remove(record.id);
    setRecords(await repo.list());
  }

  return <section className="audit-standards sk-surface">
    <div className="audit-standards__head"><div><span className="eyebrow">Standards Lab</span><h3>مكتبة المكتب والمعايير</h3></div><strong>{records.length} مرجع</strong></div>
    <div className="audit-standards__form">
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="IFRS 18 / IAS 2 / SOCPA"/>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان المرجع"/>
      <select value={framework} onChange={(e)=>setFramework(e.target.value as StandardFramework)}>
        {(['IFRS','IAS','IFRIC','SOCPA','ZATCA','ETHICS','INTERNAL','OTHER'] as StandardFramework[]).map(v=><option key={v} value={v}>{v}</option>)}
      </select>
      <input type="date" value={effectiveDate} onChange={(e)=>setEffectiveDate(e.target.value)}/>
      <input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="وسوم مفصولة بفواصل"/>
      <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="ملاحظات"/>
      <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e:ChangeEvent<HTMLInputElement>)=>setFile(e.target.files?.[0]??null)}/>
      <button onClick={()=>void add()}>إضافة المرجع</button>
    </div>
    <input className="audit-standards__search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="بحث في الكود أو العنوان أو الوسوم"/>
    {message?<p className="audit-message">{message}</p>:null}
    {filtered.length===0?<p className="audit-empty">لا توجد مراجع مطابقة.</p>:<div className="audit-standards__list">{filtered.map(record=><article key={record.id}>
      <div><b>{record.code}</b><span>{record.title}</span><small>{record.framework}{record.effectiveDate?' · '+record.effectiveDate:''}</small></div>
      <span>{record.tags.join('، ')||'—'}</span>
      <code>{record.sha256??'بدون ملف'}</code>
      <div>{record.fileName?<button onClick={()=>void download(record)}>فتح الملف</button>:null}<button className="danger" onClick={()=>void remove(record)}>حذف</button></div>
    </article>)}</div>}
  </section>;
}

import {useMemo,useState,type ChangeEvent} from 'react';
import {createStorageSnapshot,parseStorageSnapshot,previewRestore,restoreStorageSnapshot,type StorageSnapshot} from '../../governance/backup';
import {readAuditTrail} from '../../governance/audit-trail';
import {readErrorLog} from '../../governance/error-log';

function downloadJson(name:string,data:unknown){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download=name;anchor.click();
  URL.revokeObjectURL(url);
}

export function GovernancePanel(){
  const [tick,setTick]=useState(0);
  const [pending,setPending]=useState<StorageSnapshot|null>(null);
  const [message,setMessage]=useState('');
  const audit=useMemo(()=>readAuditTrail(window.localStorage),[tick]);
  const errors=useMemo(()=>readErrorLog(window.localStorage),[tick]);
  const preview=useMemo(()=>pending?previewRestore(window.localStorage,pending):null,[pending,tick]);

  function backup(){
    downloadJson('skosif-full-backup-'+new Date().toISOString().slice(0,10)+'.json',createStorageSnapshot(window.localStorage));
    setMessage('تم إنشاء نسخة احتياطية لكل مفاتيح S.kosif.');
  }

  async function chooseBackup(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    const snapshot=parseStorageSnapshot(await file.text());
    setPending(snapshot);
    setMessage(snapshot?'تم فحص النسخة. راجع نتيجة المحاكاة قبل الاستعادة.':'الملف ليس نسخة S.kosif صالحة.');
  }

  function restore(){
    if(!pending)return;
    restoreStorageSnapshot(window.localStorage,pending);
    setPending(null);setTick(x=>x+1);
    setMessage('تمت الاستعادة. أعد تحميل التطبيق لتطبيق كل البيانات.');
  }

  return <section className="system-governance sk-surface">
    <div className="system-governance__head"><div><span className="eyebrow">Governance & Health</span><h3>الحوكمة والنسخ الاحتياطي والتشخيص</h3></div><strong>{errors.length} خطأ مسجل</strong></div>
    <div className="system-governance__actions">
      <button onClick={backup}>نسخة احتياطية كاملة</button>
      <label className="file-action">اختيار نسخة للاستعادة<input type="file" accept=".json,application/json" onChange={(e)=>void chooseBackup(e)}/></label>
      <button className="secondary" onClick={()=>setTick(x=>x+1)}>تحديث الحالة</button>
    </div>
    {preview?<div className="system-restore-preview">
      <span>مفاتيح واردة <b>{preview.incomingKeys}</b></span>
      <span>جديدة <b>{preview.createKeys}</b></span>
      <span>سيتم استبدالها <b>{preview.replaceKeys}</b></span>
      <button className="danger" onClick={restore}>تأكيد الاستعادة</button>
    </div>:null}
    {message?<p className="system-message">{message}</p>:null}
    <div className="system-health-grid">
      <article><span>سجل التدقيق</span><strong>{audit.length}</strong><small>آخر حدث: {audit[0]?.at?new Date(audit[0].at).toLocaleString('ar-SA'):'—'}</small></article>
      <article><span>الأخطاء المركزية</span><strong>{errors.length}</strong><small>{errors[0]?.message??'لا توجد أخطاء مسجلة'}</small></article>
      <article><span>مفاتيح S.kosif</span><strong>{Object.keys(createStorageSnapshot(window.localStorage).entries).length}</strong><small>تشمل البيانات والإعدادات والسجلات</small></article>
    </div>
    {audit.length>0?<div className="system-audit-list">{audit.slice(0,50).map(event=><article key={event.id}><div><b>{event.action}</b><small>{event.entity}{event.entityId?' · '+event.entityId:''}</small></div><span>{new Date(event.at).toLocaleString('ar-SA')}</span></article>)}</div>:null}
  </section>;
}

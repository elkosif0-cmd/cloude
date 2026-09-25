import {useEffect,useMemo,useState,type ChangeEvent} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {accountMovement} from './trial-balance-engine';
import {createTrialBalanceBatch,type TrialBalanceBatch} from './trial-balance-import';

const ISSUE_LABELS:Record<string,string>={
  DUPLICATE_ACCOUNT:'حساب مكرر',
  MISSING_ACCOUNT:'حساب مفقود',
  NEGATIVE_AMOUNT:'قيمة سالبة',
  UNBALANCED_TOTALS:'الميزان غير متزن',
  ABNORMAL_BOTH_SIDES:'مدين ودائن في السطر نفسه',
};

export function TrialBalanceImportPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const key=useMemo(()=>makeScopedKey('finance.trial-balance-batches',scope),[scope]);
  const repo=useMemo(()=>new JsonStorageRepository<TrialBalanceBatch>(window.localStorage,key),[key]);
  const [batches,setBatches]=useState<TrialBalanceBatch[]>([]);
  const [selectedId,setSelectedId]=useState('');
  const [label,setLabel]=useState('');
  const [sourceName,setSourceName]=useState('');
  const [csv,setCsv]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void repo.list().then(rows=>{
    const sorted=[...rows].sort((a,b)=>b.importedAt.localeCompare(a.importedAt));
    setBatches(sorted);
    if(sorted[0])setSelectedId(sorted[0].id);
  });},[repo]);

  const selected=batches.find(batch=>batch.id===selectedId)??null;
  const movements=useMemo(()=>selected?.rows.map(row=>accountMovement(row))??[],[selected]);
  const newAccounts=movements.filter(x=>x.newAccount).length;
  const vanishedAccounts=movements.filter(x=>x.vanishedAccount).length;

  async function loadFile(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    const text=await file.text();
    setCsv(text);
    setSourceName(file.name);
    if(!label)setLabel(file.name.replace(/\.[^.]+$/,''));
    setMessage('تم تحميل الملف للمعاينة. اضغط استيراد لحفظ الجولة.');
  }

  async function importBatch(){
    if(!csv.trim()){setMessage('الصق CSV أو اختر ملفًا أولًا.');return;}
    const batch=createTrialBalanceBatch({label,csv,sourceName:sourceName||undefined});
    if(batch.rows.length===0){setMessage('لم يتم العثور على سطور ميزان مراجعة صالحة.');return;}
    await repo.put(batch);
    const rows=[...(await repo.list())].sort((a,b)=>b.importedAt.localeCompare(a.importedAt));
    setBatches(rows);
    setSelectedId(batch.id);
    setCsv('');
    setSourceName('');
    setMessage(batch.validation.valid?'تم استيراد الجولة والميزان متزن.':'تم الاستيراد مع تنبيهات يجب مراجعتها.');
  }

  async function removeSelected(){
    if(!selected)return;
    await repo.remove(selected.id);
    const rows=[...(await repo.list())].sort((a,b)=>b.importedAt.localeCompare(a.importedAt));
    setBatches(rows);
    setSelectedId(rows[0]?.id??'');
    setMessage('تم حذف الجولة المحددة فقط.');
  }

  return <section className="finance-tb-import sk-surface">
    <div className="finance-tb-import__head">
      <div><span className="eyebrow">Trial Balance Import</span><h3>استيراد ميزان المراجعة — جولات متعددة</h3></div>
      <strong className="sk-number">{batches.length} جولة</strong>
    </div>

    <div className="finance-tb-import__form">
      <input value={label} onChange={(e)=>setLabel(e.target.value)} placeholder="اسم الجولة: أولي / معدل / نهائي"/>
      <input type="file" accept=".csv,text/csv" onChange={(e)=>void loadFile(e)}/>
      <button onClick={()=>void importBatch()}>استيراد الجولة</button>
    </div>
    <textarea value={csv} onChange={(e)=>setCsv(e.target.value)} placeholder={'accountId,accountName,debit,credit,priorDebit,priorCredit\n1100,Cash,1000,0,900,0\n3000,Equity,0,1000,0,900'}/>
    {message?<p className="finance-message">{message}</p>:null}

    {batches.length>0?<div className="finance-tb-rounds">
      <label>الجولة المعروضة<select value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>{batches.map(batch=><option key={batch.id} value={batch.id}>{batch.label} · {new Date(batch.importedAt).toLocaleString('ar-SA')}</option>)}</select></label>
      <button className="danger" onClick={()=>void removeSelected()}>حذف الجولة</button>
    </div>:null}

    {selected?<div className="finance-tb-summary">
      <article><span>مدين</span><strong className="sk-number">{selected.validation.totals.debit.toLocaleString('en-US')}</strong></article>
      <article><span>دائن</span><strong className="sk-number">{selected.validation.totals.credit.toLocaleString('en-US')}</strong></article>
      <article><span>الفرق</span><strong className="sk-number">{selected.validation.totals.difference.toLocaleString('en-US')}</strong></article>
      <article><span>حسابات جديدة</span><strong>{newAccounts}</strong></article>
      <article><span>حسابات اختفت</span><strong>{vanishedAccounts}</strong></article>
      <article><span>التنبيهات</span><strong>{selected.validation.issues.length}</strong></article>
    </div>:null}

    {selected?.validation.issues.length?<div className="finance-tb-issues">{selected.validation.issues.map((issue,index)=><span key={issue.code+'-'+index}>{ISSUE_LABELS[issue.code]??issue.code}{issue.accountId?' · '+issue.accountId:''}</span>)}</div>:null}

    {selected?.rows.length?<div className="finance-table-wrap"><table><thead><tr><th>الحساب</th><th>الاسم</th><th>مدين</th><th>دائن</th><th>السابق</th><th>التغير</th></tr></thead><tbody>{selected.rows.slice(0,200).map((row,index)=>{
      const movement=accountMovement(row);
      return <tr key={row.accountId+'-'+index}><td>{row.accountId}</td><td>{row.accountName??'—'}</td><td className="sk-number">{row.debit.toLocaleString('en-US')}</td><td className="sk-number">{row.credit.toLocaleString('en-US')}</td><td className="sk-number">{movement.prior.toLocaleString('en-US')}</td><td className="sk-number">{movement.absoluteChange.toLocaleString('en-US')}</td></tr>;
    })}</tbody></table></div>:null}
  </section>;
}

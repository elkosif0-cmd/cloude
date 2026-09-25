import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {createAccount,inspectChartOfAccounts,type Account,type AccountType} from './accounts-engine';

const STORAGE_BASE='finance.accounts';

const TYPE_LABELS: Record<AccountType,string> = {
  asset:'أصل',
  liability:'التزام',
  equity:'حقوق ملكية',
  revenue:'إيراد',
  expense:'مصروف',
  other:'أخرى',
};

export function AccountsPanel({onChanged}:{onChanged?:()=>void}){
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [code,setCode]=useState('');
  const [name,setName]=useState('');
  const [type,setType]=useState<AccountType>('asset');
  const [parentId,setParentId]=useState('');
  const [message,setMessage]=useState('');
  const storageKey=useMemo(()=>makeScopedKey(STORAGE_BASE,readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<Account>(window.localStorage,storageKey),[storageKey]);

  useEffect(()=>{void repo.list().then(setAccounts);},[repo]);
  const issues=useMemo(()=>inspectChartOfAccounts(accounts),[accounts]);

  async function addAccount(){
    if(!code.trim()||!name.trim()){
      setMessage('أدخل كود الحساب واسمه.');
      return;
    }

    const account=createAccount({code,name,type,parentId:parentId||undefined});
    const next=[...accounts,account];
    const nextIssues=inspectChartOfAccounts(next);
    const blocking=nextIssues.find((issue)=>issue.accountId===account.id);
    if(blocking){
      setMessage(blocking.code==='DUPLICATE_ACCOUNT_CODE'?'كود الحساب مستخدم بالفعل.':'تعذر حفظ الحساب بسبب علاقة أب غير صالحة.');
      return;
    }

    await repo.put(account);
    setAccounts(await repo.list());
    onChanged?.();
    setCode('');
    setName('');
    setParentId('');
    setMessage('تمت إضافة الحساب إلى دليل الحسابات.');
  }

  return <section className="finance-receivables sk-surface">
    <div className="finance-receivables__head">
      <div><span className="eyebrow">Chart of Accounts</span><h3>دليل الحسابات</h3></div>
      <strong className="sk-number">{accounts.length}</strong>
    </div>
    <div className="finance-receivable-form">
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="كود الحساب"/>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم الحساب"/>
      <select value={type} onChange={(e)=>setType(e.target.value as AccountType)}>
        {Object.entries(TYPE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}
      </select>
      <select value={parentId} onChange={(e)=>setParentId(e.target.value)}>
        <option value="">بدون حساب أب</option>
        {accounts.map((account)=><option key={account.id} value={account.id}>{account.code} — {account.name}</option>)}
      </select>
      <button onClick={()=>void addAccount()}>إضافة حساب</button>
    </div>
    {message?<p className="finance-message">{message}</p>:null}
    {issues.length>0?<p className="finance-message">يوجد {issues.length} تنبيهًا في هيكل دليل الحسابات.</p>:null}
    {accounts.length>0?<div className="finance-table-wrap"><table><thead><tr><th>الكود</th><th>الحساب</th><th>النوع</th><th>الحساب الأب</th></tr></thead><tbody>
      {accounts.map((account)=><tr key={account.id}><td className="sk-number">{account.code}</td><td>{account.name}</td><td>{TYPE_LABELS[account.type]}</td><td>{account.parentId?accounts.find((item)=>item.id===account.parentId)?.name??account.parentId:'—'}</td></tr>)}
    </tbody></table></div>:<p className="finance-empty">لم تتم إضافة حسابات بعد.</p>}
  </section>;
}

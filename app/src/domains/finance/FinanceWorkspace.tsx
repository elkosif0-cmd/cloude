import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {buildGeneralLedger,buildTrialBalance,validateJournalEntry,type JournalEntry} from './ledger-engine';
import type {Account} from './accounts-engine';
import {AccountsPanel} from './AccountsPanel';
import {ReceivablesPanel} from './ReceivablesPanel';
import {PayablesPanel} from './PayablesPanel';
import {TrialBalanceImportPanel} from './TrialBalanceImportPanel';
import {ReconciliationPanel} from './ReconciliationPanel';
import {CashFlowPanel} from './CashFlowPanel';
import './finance-workspace.css';

const STORAGE_BASE='finance.journals';

export function FinanceWorkspace(){
  const [entries,setEntries]=useState<JournalEntry[]>([]);
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [debitAccount,setDebitAccount]=useState('');
  const [creditAccount,setCreditAccount]=useState('');
  const [amount,setAmount]=useState('');
  const [reference,setReference]=useState('');
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [message,setMessage]=useState('');

  const storageKey=useMemo(()=>makeScopedKey(STORAGE_BASE,readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,storageKey),[storageKey]);
  const accountKey=useMemo(()=>makeScopedKey('finance.accounts',readActiveScope(window.localStorage)),[]);
  const accountRepo=useMemo(()=>new JsonStorageRepository<Account>(window.localStorage,accountKey),[accountKey]);

  useEffect(()=>{void Promise.all([repo.list(),accountRepo.list()]).then(([j,a])=>{setEntries(j);setAccounts(a);});},[repo,accountRepo]);

  const ledger=useMemo(()=>buildGeneralLedger(entries),[entries]);
  const trialBalance=useMemo(()=>buildTrialBalance(entries),[entries]);

  async function addEntry(){
    const value=Number(amount);
    const entry:JournalEntry={
      id:crypto.randomUUID(),
      date,
      reference:reference.trim()||undefined,
      lines:[
        {accountId:debitAccount.trim(),debit:value,credit:0},
        {accountId:creditAccount.trim(),debit:0,credit:value},
      ],
    };

    if(!debitAccount.trim()||!creditAccount.trim()||!Number.isFinite(value)||value<=0){
      setMessage('أدخل حساب مدين وحساب دائن ومبلغًا أكبر من صفر.');
      return;
    }

    const validation=validateJournalEntry(entry);
    if(!validation.valid){
      setMessage('القيد لم يجتز قواعد القيد المزدوج.');
      return;
    }

    await repo.put(entry);
    const next=await repo.list();
    setEntries(next);
    setDebitAccount('');
    setCreditAccount('');
    setAmount('');
    setReference('');
    setMessage('تم حفظ القيد في مساحة S.kosif الجديدة.');
  }

  return <section className="finance-workspace">
    <div className="finance-kpis">
      <article className="sk-surface"><span>عدد القيود</span><strong className="sk-number">{entries.length}</strong></article>
      <article className="sk-surface"><span>إجمالي المدين</span><strong className="sk-number">{trialBalance.totals.debit.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>إجمالي الدائن</span><strong className="sk-number">{trialBalance.totals.credit.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>حالة الميزان</span><strong>{trialBalance.balanced?'متزن':'غير متزن'}</strong></article>
    </div>

    <AccountsPanel onChanged={()=>{void accountRepo.list().then(setAccounts);}}/>
    <TrialBalanceImportPanel/>

    <div className="finance-grid">
      <section className="sk-surface finance-entry-form">
        <div><span className="eyebrow">قيد مزدوج حقيقي</span><h3>إضافة قيد يومية</h3></div>
        <label>التاريخ<input type="date" value={date} onChange={(e)=>setDate(e.target.value)}/></label>
        <label>المرجع<input value={reference} onChange={(e)=>setReference(e.target.value)} placeholder="مثال: INV-1001"/></label>
        <label>الحساب المدين<select value={debitAccount} onChange={(e)=>setDebitAccount(e.target.value)}><option value="">اختر حسابًا</option>{accounts.filter(a=>a.active).map(a=><option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}</select></label>
        <label>الحساب الدائن<select value={creditAccount} onChange={(e)=>setCreditAccount(e.target.value)}><option value="">اختر حسابًا</option>{accounts.filter(a=>a.active).map(a=><option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}</select></label>
        <label>المبلغ<input inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00"/></label>
        <button onClick={()=>void addEntry()}>حفظ القيد</button>
        {message?<p className="finance-message">{message}</p>:null}
      </section>

      <section className="sk-surface finance-ledger">
        <div><span className="eyebrow">الأستاذ العام</span><h3>الأرصدة حسب الحساب</h3></div>
        {ledger.length===0?<p className="finance-empty">لا توجد قيود بعد. لن يعرض النظام أرقامًا وهمية.</p>:
          <div className="finance-table-wrap"><table><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>
            {ledger.map((row)=><tr key={row.accountId}><td>{row.accountId}</td><td className="sk-number">{row.debit.toLocaleString('en-US')}</td><td className="sk-number">{row.credit.toLocaleString('en-US')}</td><td className="sk-number">{row.balance.toLocaleString('en-US')}</td></tr>)}
          </tbody></table></div>}
      </section>
    </div>
    <div className="finance-subledgers"><ReceivablesPanel/><PayablesPanel/></div>
    <ReconciliationPanel/>
    <CashFlowPanel/>
  </section>;
}

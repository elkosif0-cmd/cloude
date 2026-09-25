import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {buildGeneralLedger,type JournalEntry} from './ledger-engine';
import {agePayables,type PayableInvoice} from './payables-engine';
import {reconcileSubledger,reconcileTrialBalanceToLedger} from './reconciliation-engine';
import {ageReceivables,type ReceivableInvoice} from './receivables-engine';
import type {TrialBalanceBatch} from './trial-balance-import';

export function ReconciliationPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const [journals,setJournals]=useState<JournalEntry[]>([]);
  const [tbBatches,setTbBatches]=useState<TrialBalanceBatch[]>([]);
  const [receivables,setReceivables]=useState<ReceivableInvoice[]>([]);
  const [payables,setPayables]=useState<PayableInvoice[]>([]);
  const [tbId,setTbId]=useState('');
  const [arAccount,setArAccount]=useState('account-1200');
  const [apAccount,setApAccount]=useState('account-2100');

  useEffect(()=>{
    const journalRepo=new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,makeScopedKey('finance.journals',scope));
    const tbRepo=new JsonStorageRepository<TrialBalanceBatch>(window.localStorage,makeScopedKey('finance.trial-balance-batches',scope));
    const arRepo=new JsonStorageRepository<ReceivableInvoice & {id:string}>(window.localStorage,makeScopedKey('finance.receivables',scope));
    const apRepo=new JsonStorageRepository<PayableInvoice & {id:string}>(window.localStorage,makeScopedKey('finance.payables',scope));
    void Promise.all([journalRepo.list(),tbRepo.list(),arRepo.list(),apRepo.list()]).then(([j,t,a,p])=>{
      setJournals(j);setTbBatches(t);setReceivables(a);setPayables(p);
      const latest=[...t].sort((x,y)=>y.importedAt.localeCompare(x.importedAt))[0];
      if(latest)setTbId(latest.id);
    });
  },[scope]);

  const ledger=useMemo(()=>buildGeneralLedger(journals),[journals]);
  const selectedTb=tbBatches.find(batch=>batch.id===tbId)??null;
  const tbReconciliation=useMemo(()=>selectedTb?reconcileTrialBalanceToLedger(selectedTb.rows,ledger):null,[selectedTb,ledger]);
  const today=new Date().toISOString().slice(0,10);
  const arOutstanding=useMemo(()=>ageReceivables(receivables,today).outstanding,[receivables,today]);
  const apOutstanding=useMemo(()=>agePayables(payables,today).outstanding,[payables,today]);
  const arRecon=useMemo(()=>reconcileSubledger({glAccountId:arAccount,ledger,subledgerBalance:arOutstanding}),[arAccount,ledger,arOutstanding]);
  const apRecon=useMemo(()=>reconcileSubledger({glAccountId:apAccount,ledger,subledgerBalance:-apOutstanding}),[apAccount,ledger,apOutstanding]);

  return <section className="finance-reconciliation sk-surface">
    <div className="finance-reconciliation__head"><div><span className="eyebrow">Reconciliation Engine</span><h3>مطابقات TB ↔ GL والدفاتر المساعدة</h3></div><strong>{tbReconciliation?.exceptions??0} استثناء</strong></div>

    <div className="finance-reconciliation__controls">
      <label>جولة ميزان المراجعة<select value={tbId} onChange={(e)=>setTbId(e.target.value)}><option value="">بدون جولة</option>{[...tbBatches].sort((a,b)=>b.importedAt.localeCompare(a.importedAt)).map(batch=><option key={batch.id} value={batch.id}>{batch.label}</option>)}</select></label>
      <label>حساب العملاء<input value={arAccount} onChange={(e)=>setArAccount(e.target.value)}/></label>
      <label>حساب الموردين<input value={apAccount} onChange={(e)=>setApAccount(e.target.value)}/></label>
    </div>

    <div className="finance-reconciliation__cards">
      <article data-match={arRecon.matched}><span>العملاء AR ↔ GL</span><strong className="sk-number">{arRecon.difference.toLocaleString('en-US')}</strong><small>دفتر مساعد {arOutstanding.toLocaleString('en-US')} · GL {arRecon.glBalance.toLocaleString('en-US')}</small></article>
      <article data-match={apRecon.matched}><span>الموردون AP ↔ GL</span><strong className="sk-number">{apRecon.difference.toLocaleString('en-US')}</strong><small>دفتر مساعد {apOutstanding.toLocaleString('en-US')} · GL {apRecon.glBalance.toLocaleString('en-US')}</small></article>
      <article data-match={(tbReconciliation?.exceptions??0)===0&&Boolean(tbReconciliation)}><span>TB ↔ GL</span><strong>{tbReconciliation?(String(tbReconciliation.matched)+'/'+String(tbReconciliation.rows.length)):'—'}</strong><small>إجمالي الفروق المطلقة {tbReconciliation?.absoluteDifference.toLocaleString('en-US')??'—'}</small></article>
    </div>

    {tbReconciliation?.exceptions?<div className="finance-table-wrap"><table><thead><tr><th>الحساب</th><th>TB</th><th>GL</th><th>الفرق</th><th>الحالة</th></tr></thead><tbody>{tbReconciliation.rows.filter(row=>row.status!=='MATCH').slice(0,200).map(row=><tr key={row.accountId}><td>{row.accountId}</td><td className="sk-number">{row.tbBalance.toLocaleString('en-US')}</td><td className="sk-number">{row.glBalance.toLocaleString('en-US')}</td><td className="sk-number">{row.difference.toLocaleString('en-US')}</td><td>{row.status}</td></tr>)}</tbody></table></div>:<p className="finance-empty">{selectedTb?'لا توجد فروق بين TB وGL وفق الجولة المختارة.':'استورد جولة ميزان مراجعة لتفعيل مطابقة TB ↔ GL.'}</p>}
  </section>;
}

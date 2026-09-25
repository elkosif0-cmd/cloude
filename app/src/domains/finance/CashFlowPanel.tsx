import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {Account} from './accounts-engine';
import {buildCashFlow} from './cash-flow-engine';
import type {JournalEntry} from './ledger-engine';

export function CashFlowPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [journals,setJournals]=useState<JournalEntry[]>([]);
  const [cashIds,setCashIds]=useState<string[]>([]);
  const accountRepo=useMemo(()=>new JsonStorageRepository<Account>(window.localStorage,makeScopedKey('finance.accounts',scope)),[scope]);
  const journalRepo=useMemo(()=>new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,makeScopedKey('finance.journals',scope)),[scope]);

  useEffect(()=>{void Promise.all([accountRepo.list(),journalRepo.list()]).then(([a,j])=>{setAccounts(a);setJournals(j);setCashIds(a.filter(x=>/cash|bank|نقد|بنك/i.test(x.name)).map(x=>x.id));});},[accountRepo,journalRepo]);
  const summary=useMemo(()=>buildCashFlow({journals,accounts,cashAccountIds:cashIds}),[journals,accounts,cashIds]);

  function toggle(id:string){
    setCashIds(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);
  }

  return <section className="finance-cashflow sk-surface">
    <div className="finance-cashflow__head"><div><span className="eyebrow">Direct Cash Flow</span><h3>التدفق النقدي المباشر من القيود</h3></div><strong className="sk-number">{summary.netChange.toLocaleString('en-US')}</strong></div>
    <div className="finance-cashflow__accounts">
      <span>حسابات النقد والبنوك:</span>
      {accounts.filter(a=>a.active).map(account=><label key={account.id}><input type="checkbox" checked={cashIds.includes(account.id)} onChange={()=>toggle(account.id)}/>{account.code} · {account.name}</label>)}
    </div>
    <div className="finance-cashflow__kpis">
      <article><span>تشغيلي</span><strong className="sk-number">{summary.operating.toLocaleString('en-US')}</strong></article>
      <article><span>استثماري</span><strong className="sk-number">{summary.investing.toLocaleString('en-US')}</strong></article>
      <article><span>تمويلي</span><strong className="sk-number">{summary.financing.toLocaleString('en-US')}</strong></article>
      <article><span>غير مصنف</span><strong className="sk-number">{summary.unclassified.toLocaleString('en-US')}</strong></article>
    </div>
    {cashIds.length===0?<p className="finance-empty">حدد حسابًا واحدًا على الأقل كنقد/بنك لتفعيل التقرير.</p>:summary.activities.length===0?<p className="finance-empty">لا توجد حركات نقدية ضمن القيود الحالية.</p>:<div className="finance-table-wrap"><table><thead><tr><th>التاريخ</th><th>المرجع</th><th>التصنيف</th><th>المبلغ</th><th>الحسابات المقابلة</th></tr></thead><tbody>{summary.activities.slice().reverse().map(activity=><tr key={activity.entryId}><td>{activity.date}</td><td>{activity.reference??'—'}</td><td>{activity.classification}</td><td className="sk-number">{activity.amount.toLocaleString('en-US')}</td><td>{activity.counterpartAccountIds.join('، ')}</td></tr>)}</tbody></table></div>}
    <p className="finance-cashflow__note">التصنيف الافتراضي يعتمد على نوع الحساب ويمكن تطويره إلى خريطة تصنيف تفصيلية لكل حساب؛ الأرقام لا تُنشأ من بيانات تجريبية.</p>
  </section>;
}

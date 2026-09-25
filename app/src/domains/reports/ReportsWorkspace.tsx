import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {buildTrialBalance,type JournalEntry} from '../finance/ledger-engine';
import {buildStockPositions,type StockMovement} from '../stock/inventory-engine';
import './reports-workspace.css';

export function ReportsWorkspace(){
  const [journals,setJournals]=useState<JournalEntry[]>([]);
  const [movements,setMovements]=useState<StockMovement[]>([]);
  const journalRepo=useMemo(()=>new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,'skosif.v1.finance.journals'),[]);
  const stockRepo=useMemo(()=>new JsonStorageRepository<StockMovement & {id:string}>(window.localStorage,'skosif.v1.stock.movements'),[]);

  useEffect(()=>{void Promise.all([journalRepo.list(),stockRepo.list()]).then(([j,s])=>{setJournals(j);setMovements(s);});},[journalRepo,stockRepo]);

  const tb=useMemo(()=>buildTrialBalance(journals),[journals]);
  const stock=useMemo(()=>buildStockPositions(movements),[movements]);
  const positiveStock=stock.reduce((sum,row)=>sum+Math.max(0,row.quantity),0);
  const negativeStock=stock.filter((row)=>row.quantity<0).length;

  return <section className="reports-workspace">
    <div className="reports-kpis">
      <article className="sk-surface"><span>قيود فعلية</span><strong>{journals.length}</strong></article>
      <article className="sk-surface"><span>إجمالي المدين</span><strong className="sk-number">{tb.totals.debit.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>وحدات مخزون موجبة</span><strong className="sk-number">{positiveStock.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>أرصدة مخزون سالبة</span><strong>{negativeStock}</strong></article>
    </div>
    <section className="sk-surface reports-panel">
      <span className="eyebrow">Executive Analytics</span><h3>تقارير من نفس البيانات الأساسية</h3>
      <p>لا توجد قاعدة تقارير منفصلة. هذه الشاشة تقرأ القيود وحركات المخزون نفسها التي تستخدمها الوحدات التشغيلية، وبالتالي لا يوجد نسخ بيانات بين تطبيقات.</p>
      <div className="reports-status"><div><b>ميزان المراجعة</b><span>{tb.balanced?'متزن':'غير متزن'}</span></div><div><b>عدد حسابات الأستاذ</b><span>{tb.rows.length}</span></div><div><b>عدد أصناف المخزون</b><span>{stock.length}</span></div></div>
    </section>
  </section>;
}

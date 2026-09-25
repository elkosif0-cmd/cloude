import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import type {ReceivableInvoice} from '../finance/receivables-engine';
import {buildTrialBalance,type JournalEntry} from '../finance/ledger-engine';
import type {Supplier} from '../procurement/suppliers-engine';
import type {Customer} from '../sales/customers-engine';
import {buildStockPositions,type StockMovement} from '../stock/inventory-engine';
import {rowsToCsv,safeExportName,type ExportRow} from './export-engine';
import {ScenarioPanel} from './ScenarioPanel';
import {MatchingReconPanel} from './MatchingReconPanel';
import {WorkspaceSectionNav,WorkspaceSectionPage} from '../../shell/WorkspaceSectionNav';
import './reports-workspace.css';

function downloadText(name:string,content:string,type:string){
  const blob=new Blob([content],{type});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsWorkspace(){
  const [journals,setJournals]=useState<JournalEntry[]>([]);
  const [movements,setMovements]=useState<StockMovement[]>([]);
  const [receivables,setReceivables]=useState<ReceivableInvoice[]>([]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const [section,setSection]=useState('overview');

  const repoFor=<T extends {id:string},>(base:string)=>new JsonStorageRepository<T>(window.localStorage,makeScopedKey(base,scope));

  useEffect(()=>{
    const journalRepo=repoFor<JournalEntry & {id:string}>('finance.journals');
    const stockRepo=repoFor<StockMovement & {id:string}>('stock.movements');
    const arRepo=repoFor<ReceivableInvoice & {id:string}>('finance.receivables');
    const customerRepo=repoFor<Customer>('sales.customers');
    const supplierRepo=repoFor<Supplier>('procurement.suppliers');
    const itemRepo=repoFor<CatalogItem>('catalog.items');
    void Promise.all([journalRepo.list(),stockRepo.list(),arRepo.list(),customerRepo.list(),supplierRepo.list(),itemRepo.list()])
      .then(([j,s,a,c,p,i])=>{setJournals(j);setMovements(s);setReceivables(a);setCustomers(c);setSuppliers(p);setItems(i);});
  },[]);

  const tb=useMemo(()=>buildTrialBalance(journals),[journals]);
  const stock=useMemo(()=>buildStockPositions(movements),[movements]);
  const positiveStock=stock.reduce((sum,row)=>sum+Math.max(0,row.quantity),0);
  const negativeStock=stock.filter((row)=>row.quantity<0).length;

  function csv(name:string,rows:ExportRow[]){
    downloadText(safeExportName(name)+'.csv',rowsToCsv(rows),'text/csv;charset=utf-8');
  }

  function exportBackup(){
    const payload={
      exportedAt:new Date().toISOString(),
      scope,
      journals,
      movements,
      receivables,
      customers,
      suppliers,
      items,
    };
    downloadText('skosif-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(payload,null,2),'application/json;charset=utf-8');
  }

  return <section className="reports-workspace">
    <WorkspaceSectionNav active={section} onChange={setSection} items={[
      {id:'overview',label:'لوحة التقارير'},
      {id:'scenarios',label:'السيناريوهات'},
      {id:'matching',label:'المطابقة الذكية'},
      {id:'exports',label:'التصدير'},
    ]}/>
    <WorkspaceSectionPage id="overview" active={section}><div className="reports-kpis">
      <article className="sk-surface"><span>قيود فعلية</span><strong>{journals.length}</strong></article>
      <article className="sk-surface"><span>إجمالي المدين</span><strong className="sk-number">{tb.totals.debit.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>وحدات مخزون موجبة</span><strong className="sk-number">{positiveStock.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>أرصدة مخزون سالبة</span><strong>{negativeStock}</strong></article>
    </div>

    <section className="sk-surface reports-panel">
      <span className="eyebrow">Executive Analytics</span><h3>تقارير من نفس البيانات الأساسية</h3>
      <p>لا توجد قاعدة تقارير منفصلة. هذه الشاشة تقرأ القيود وحركات المخزون والذمم والبيانات الرئيسية نفسها التي تستخدمها الوحدات التشغيلية.</p>
      <div className="reports-status"><div><b>ميزان المراجعة</b><span>{tb.balanced?'متزن':'غير متزن'}</span></div><div><b>عدد حسابات الأستاذ</b><span>{tb.rows.length}</span></div><div><b>عدد أصناف المخزون</b><span>{stock.length}</span></div></div>
    </section></WorkspaceSectionPage>

    <WorkspaceSectionPage id="scenarios" active={section}><ScenarioPanel/></WorkspaceSectionPage>
    <WorkspaceSectionPage id="matching" active={section}><MatchingReconPanel/></WorkspaceSectionPage>

    <WorkspaceSectionPage id="exports" active={section}><section className="sk-surface reports-export">
      <span className="eyebrow">Export Center</span><h3>تصدير CSV متوافق مع Excel + نسخة احتياطية</h3>
      <div className="reports-export__grid">
        <button onClick={()=>csv('trial-balance',tb.rows.map(row=>({...row})))}>ميزان المراجعة</button>
        <button onClick={()=>csv('stock-positions',stock.map(row=>({...row})))}>أرصدة المخزون</button>
        <button onClick={()=>csv('receivables',receivables.map(row=>({...row})))}>الذمم المدينة</button>
        <button onClick={()=>csv('customers',customers.map(row=>({...row})))}>العملاء</button>
        <button onClick={()=>csv('suppliers',suppliers.map(row=>({...row})))}>الموردون</button>
        <button onClick={()=>csv('catalog-items',items.map(row=>({...row})))}>الأصناف</button>
        <button className="secondary" onClick={exportBackup}>نسخة JSON كاملة للنطاق</button>
      </div>
    </section></WorkspaceSectionPage>
  </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {Customer} from './customers-engine';
import {buildSalesIntelligence} from './sales-intelligence-engine';
import type {TaxInvoice} from './tax-invoice-engine';

export function CustomerIntelligencePanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const customerRepo=useMemo(()=>new JsonStorageRepository<Customer>(window.localStorage,makeScopedKey('sales.customers',scope)),[scope]);
  const invoiceRepo=useMemo(()=>new JsonStorageRepository<TaxInvoice>(window.localStorage,makeScopedKey('sales.tax-invoices',scope)),[scope]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [invoices,setInvoices]=useState<TaxInvoice[]>([]);

  useEffect(()=>{void Promise.all([customerRepo.list(),invoiceRepo.list()]).then(([c,i])=>{setCustomers(c);setInvoices(i);});},[customerRepo,invoiceRepo]);

  const today=new Date().toISOString().slice(0,10);
  const summary=useMemo(()=>buildSalesIntelligence({customers,invoices,asOfDate:today}),[customers,invoices,today]);

  return <section className="customer-intelligence sk-surface">
    <div className="customer-intelligence__head"><div><span className="eyebrow">Customer Intelligence</span><h3>تحليل العملاء والمبيعات الفعلية</h3></div><strong>{summary.customersWithSales} عميل نشط</strong></div>
    <div className="customer-intelligence__kpis">
      <article><span>إجمالي المبيعات</span><strong className="sk-number">{summary.totalRevenueIncVat.toLocaleString('en-US')}</strong></article>
      <article><span>عدد الفواتير</span><strong>{summary.invoices}</strong></article>
      <article><span>متوسط الفاتورة</span><strong className="sk-number">{summary.averageInvoice.toLocaleString('en-US')}</strong></article>
      <article><span>متبقي للتحصيل</span><strong className="sk-number">{summary.totalOutstanding.toLocaleString('en-US')}</strong></article>
    </div>
    {summary.rows.length===0?<p className="sales-empty">لا توجد فواتير فعلية بعد، لذلك لن يعرض النظام تصنيف عملاء وهميًا.</p>:<div className="sales-table"><table><thead><tr><th>العميل</th><th>ABC</th><th>الفواتير</th><th>المبيعات</th><th>الحصة</th><th>متوسط الفاتورة</th><th>المتبقي</th><th>منذ آخر فاتورة</th></tr></thead><tbody>{summary.rows.map(row=><tr key={row.customerId}><td><b>{row.customerName}</b></td><td><span className="abc-badge" data-class={row.abcClass}>{row.abcClass}</span></td><td>{row.invoiceCount}</td><td className="sk-number">{row.revenueIncVat.toLocaleString('en-US')}</td><td>{row.revenueSharePercent}%</td><td className="sk-number">{row.averageInvoice.toLocaleString('en-US')}</td><td className="sk-number">{row.outstanding.toLocaleString('en-US')}</td><td>{row.daysSinceLastInvoice===undefined?'—':row.daysSinceLastInvoice+' يوم'}</td></tr>)}</tbody></table></div>}
    <p className="customer-intelligence__note">تصنيف ABC يعتمد على المساهمة التراكمية في المبيعات الفعلية: الشريحة A حتى أول 80٪ تقريبًا، ثم B حتى 95٪، والباقي C.</p>
  </section>;
}

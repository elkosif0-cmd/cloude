import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import type {Customer} from '../sales/customers-engine';
import {applyItemMappings,extractLegacyCommerce,toHistoricalOrder,toHistoricalPayment,type LegacyCommerceRecord} from '../../data/legacy-commerce-engine';

type HistoricalOrder=ReturnType<typeof toHistoricalOrder>;
type HistoricalPayment=ReturnType<typeof toHistoricalPayment>;

export function LegacyCommerceReviewPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const legacyRepo=useMemo(()=>new JsonStorageRepository<LegacyCommerceRecord>(window.localStorage,makeScopedKey('legacy.commerce',scope)),[scope]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const customerRepo=useMemo(()=>new JsonStorageRepository<Customer>(window.localStorage,makeScopedKey('sales.customers',scope)),[scope]);
  const orderRepo=useMemo(()=>new JsonStorageRepository<HistoricalOrder>(window.localStorage,makeScopedKey('sales.historical-orders',scope)),[scope]);
  const paymentRepo=useMemo(()=>new JsonStorageRepository<HistoricalPayment>(window.localStorage,makeScopedKey('finance.historical-payments',scope)),[scope]);

  const [legacy,setLegacy]=useState<LegacyCommerceRecord[]>([]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [mappings,setMappings]=useState<Record<string,string>>({});
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([legacyRepo.list(),itemRepo.list(),customerRepo.list()]).then(([l,i,c])=>{setLegacy(l);setItems(i);setCustomers(c);});},[legacyRepo,itemRepo,customerRepo]);

  const extracted=useMemo(()=>extractLegacyCommerce(legacy,items,customers),[legacy,items,customers]);
  const orders=useMemo(()=>extracted.orders.map(order=>applyItemMappings(order,mappings)),[extracted.orders,mappings]);
  const ready=orders.filter(order=>order.readiness==='READY');

  async function importReady(){
    if(ready.length===0){setMessage('لا توجد طلبات جاهزة للتحويل بعد.');return;}
    await orderRepo.putMany(ready.map(toHistoricalOrder));
    const payments=extracted.payments.filter(payment=>payment.amount>0).map(toHistoricalPayment);
    if(payments.length)await paymentRepo.putMany(payments);
    setMessage('تم تحويل السجلات الجاهزة إلى سجل تاريخي آمن بدون إنشاء قيود أو حركات مخزون تلقائية.');
  }

  if(legacy.length===0)return <section className="legacy-commerce-review sk-surface"><span className="eyebrow">Legacy Commerce Review</span><h3>مراجعة الطلبات والمدفوعات القديمة</h3><p className="system-empty">نفّذ نقل البيانات القديمة أولًا ليظهر سجل التجارة هنا.</p></section>;

  return <section className="legacy-commerce-review sk-surface">
    <div className="legacy-commerce-review__head"><div><span className="eyebrow">Legacy Commerce Review</span><h3>تحويل الطلبات والمدفوعات القديمة بأمان</h3><p>لا يتم ترحيل أي طلب تاريخي للمالية أو المخزون تلقائيًا. يتم أولًا ربط الأصناف ثم حفظه كسجل تاريخي.</p></div><strong>{ready.length}/{orders.length} جاهز</strong></div>
    <div className="legacy-commerce-review__kpis"><span>طلبات <b>{orders.length}</b></span><span>مدفوعات <b>{extracted.payments.length}</b></span><span>جاهزة <b>{ready.length}</b></span><span>تحتاج مراجعة <b>{orders.length-ready.length}</b></span></div>
    <button className="legacy-commerce-review__import" onClick={()=>void importReady()}>تحويل السجلات الجاهزة</button>
    {message?<p className="system-message">{message}</p>:null}
    <div className="legacy-commerce-review__orders">{orders.map(order=><article key={order.sourceId} data-ready={order.readiness==='READY'}>
      <div className="legacy-order__header"><div><b>{order.number}</b><small>{order.date||'بدون تاريخ'} · {order.customerName||order.customerPhone||'عميل غير معروف'}</small></div><span>{order.confidence}% · {order.readiness}</span></div>
      {order.issues.length?<div className="legacy-order__issues">{order.issues.map(issue=><span key={issue}>{issue}</span>)}</div>:null}
      <div className="legacy-order__lines">{order.lines.length===0?<p>لا توجد سطور مرتبطة بهذا الطلب.</p>:order.lines.map((line,index)=><div key={line.sourceId}>
        <span>{line.description||line.legacyItemRef||'سطر بدون وصف'}</span>
        <small>كمية {line.quantity} · سعر {line.unitPrice}</small>
        <select value={mappings[order.sourceId+':'+index]??line.mappedItemId??''} onChange={(e)=>setMappings(current=>({...current,[order.sourceId+':'+index]:e.target.value}))}>
          <option value="">اربط بصنف…</option>{items.map(item=><option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}
        </select>
      </div>)}</div>
    </article>)}</div>
  </section>;
}

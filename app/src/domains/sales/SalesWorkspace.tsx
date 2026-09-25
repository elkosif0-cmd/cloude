import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {JournalEntry} from '../finance/ledger-engine';
import type {ReceivableInvoice} from '../finance/receivables-engine';
import type {StockMovement} from '../stock/inventory-engine';
import type {CatalogItem} from '../catalog/items-engine';
import {calculateSalesTotals,type SalesLine} from './sales-engine';
import {buildSalesPosting,type SalesDocument} from './sales-posting-engine';
import type {Customer} from './customers-engine';
import {CustomersPanel} from './CustomersPanel';
import {TaxInvoicePanel} from './TaxInvoicePanel';
import {CateringPanel} from './CateringPanel';
import {CustomerIntelligencePanel} from './CustomerIntelligencePanel';
import {CreditPanel} from './CreditPanel';
import {SubscriptionsPanel} from './SubscriptionsPanel';
import {WorkspaceSectionNav,WorkspaceSectionPage} from '../../shell/WorkspaceSectionNav';
import './sales-workspace.css';

export function SalesWorkspace(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [orders,setOrders]=useState<SalesDocument[]>([]);
  const [lines,setLines]=useState<SalesLine[]>([]);
  const [customerId,setCustomerId]=useState('');
  const [number,setNumber]=useState('');
  const [dueDate,setDueDate]=useState(new Date().toISOString().slice(0,10));
  const [itemId,setItemId]=useState('');
  const [quantity,setQuantity]=useState('1');
  const [unitPrice,setUnitPrice]=useState('');
  const [discount,setDiscount]=useState('0');
  const [vatRate,setVatRate]=useState('15');
  const [arAccount,setArAccount]=useState('account-1200');
  const [revenueAccount,setRevenueAccount]=useState('account-4000');
  const [vatAccount,setVatAccount]=useState('account-2105');
  const [message,setMessage]=useState('');
  const [section,setSection]=useState('orders');

  const customerRepo=useMemo(()=>new JsonStorageRepository<Customer>(window.localStorage,makeScopedKey('sales.customers',scope)),[scope]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const orderRepo=useMemo(()=>new JsonStorageRepository<SalesDocument>(window.localStorage,makeScopedKey('sales.orders',scope)),[scope]);
  const journalRepo=useMemo(()=>new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,makeScopedKey('finance.journals',scope)),[scope]);
  const receivableRepo=useMemo(()=>new JsonStorageRepository<ReceivableInvoice & {id:string}>(window.localStorage,makeScopedKey('finance.receivables',scope)),[scope]);
  const stockRepo=useMemo(()=>new JsonStorageRepository<StockMovement & {id:string}>(window.localStorage,makeScopedKey('stock.movements',scope)),[scope]);

  useEffect(()=>{void Promise.all([customerRepo.list(),itemRepo.list(),orderRepo.list()]).then(([c,i,o])=>{setCustomers(c);setItems(i);setOrders(o);});},[customerRepo,itemRepo,orderRepo]);

  const totals=useMemo(()=>calculateSalesTotals(lines),[lines]);

  function selectItem(id:string){
    setItemId(id);
    const item=items.find(x=>x.id===id);
    if(item){
      if(item.defaultPrice!==undefined)setUnitPrice(String(item.defaultPrice));
      setVatRate(String(Math.round(item.vatRate*10000)/100));
    }
  }

  function addLine(){
    const qty=Number(quantity);
    const price=Number(unitPrice);
    const disc=Number(discount);
    const vat=Number(vatRate)/100;
    if(!itemId.trim()||!Number.isFinite(qty)||qty<=0||!Number.isFinite(price)||price<0){
      setMessage('أدخل صنفًا وكمية وسعرًا صحيحًا.');
      return;
    }
    setLines((current)=>[...current,{itemId:itemId.trim(),quantity:qty,unitPrice:price,discount:Number.isFinite(disc)?Math.max(0,disc):0,vatRate:Number.isFinite(vat)?Math.max(0,vat):0}]);
    setItemId('');setUnitPrice('');setDiscount('0');setMessage('');
  }

  function makeDocument():SalesDocument|null{
    if(!customerId){setMessage('اختر العميل قبل الحفظ.');return null;}
    if(lines.length===0){setMessage('أضف سطر بيع واحدًا على الأقل.');return null;}
    const id=crypto.randomUUID();
    return {
      id,
      number:number.trim()||('SO-'+Date.now()),
      date:new Date().toISOString().slice(0,10),
      dueDate,
      customerId,
      lines,
      status:'DRAFT',
    };
  }

  function resetDraft(){
    setLines([]);setCustomerId('');setNumber('');setItemId('');setQuantity('1');setUnitPrice('');setDiscount('0');
  }

  async function saveDraft(){
    const document=makeDocument();
    if(!document)return;
    await orderRepo.put(document);
    setOrders(await orderRepo.list());
    resetDraft();
    setMessage('تم حفظ أمر البيع كمسودة.');
  }

  async function postDocument(document:SalesDocument){
    if(document.status==='POSTED'){setMessage('هذا المستند مُرحّل بالفعل.');return;}
    const bundle=buildSalesPosting(document,{
      receivableAccountId:arAccount.trim(),
      revenueAccountId:revenueAccount.trim(),
      vatPayableAccountId:vatAccount.trim(),
    });
    await journalRepo.put(bundle.journal);
    await receivableRepo.put(bundle.receivable);
    await stockRepo.putMany(bundle.stockMovements);
    await orderRepo.put({...document,status:'POSTED'});
    setOrders(await orderRepo.list());
    setMessage('تم ترحيل أمر البيع إلى المالية والذمم والمخزون.');
  }

  async function saveAndPost(){
    const document=makeDocument();
    if(!document)return;
    await orderRepo.put(document);
    await postDocument(document);
    resetDraft();
  }

  return <section className="sales-workspace">
    <WorkspaceSectionNav active={section} onChange={setSection} items={[
      {id:'orders',label:'الطلبات',badge:orders.length},
      {id:'customers',label:'العملاء',badge:customers.length},
      {id:'credit',label:'الائتمان والاشتراكات'},
      {id:'invoices',label:'الفواتير'},
      {id:'catering',label:'المناسبات'},
    ]}/>
    <WorkspaceSectionPage id="orders" active={section}><div className="sales-kpis">
      <article className="sk-surface"><span>قبل الخصم</span><strong className="sk-number">{totals.subtotal.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>الضريبة</span><strong className="sk-number">{totals.vat.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>الإجمالي</span><strong className="sk-number">{totals.total.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>مستندات مرحّلة</span><strong className="sk-number">{orders.filter(x=>x.status==='POSTED').length}</strong></article>
    </div></WorkspaceSectionPage>

    <WorkspaceSectionPage id="customers" active={section}><CustomersPanel onChanged={()=>{void customerRepo.list().then(setCustomers);}}/></WorkspaceSectionPage>

    <WorkspaceSectionPage id="orders" active={section}><div className="sales-grid">
      <section className="sk-surface sales-form">
        <span className="eyebrow">Sales Order</span><h3>أمر بيع قابل للترحيل</h3>
        <label>العميل<select value={customerId} onChange={(e)=>setCustomerId(e.target.value)}><option value="">اختر العميل</option>{customers.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></label>
        <label>رقم المستند<input value={number} onChange={(e)=>setNumber(e.target.value)} placeholder="يولد تلقائيًا"/></label>
        <label>تاريخ الاستحقاق<input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)}/></label>
        <label>الصنف<select value={itemId} onChange={(e)=>selectItem(e.target.value)}><option value="">اختر الصنف</option>{items.map(i=><option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}</select></label>
        <label>الكمية<input inputMode="decimal" value={quantity} onChange={(e)=>setQuantity(e.target.value)}/></label>
        <label>سعر الوحدة بدون الضريبة<input inputMode="decimal" value={unitPrice} onChange={(e)=>setUnitPrice(e.target.value)}/></label>
        <label>الخصم بدون الضريبة<input inputMode="decimal" value={discount} onChange={(e)=>setDiscount(e.target.value)}/></label>
        <label>VAT %<input inputMode="decimal" value={vatRate} onChange={(e)=>setVatRate(e.target.value)}/></label>
        <button onClick={addLine}>إضافة السطر</button>
        <div className="sales-posting-accounts">
          <input value={arAccount} onChange={(e)=>setArAccount(e.target.value)} placeholder="حساب العملاء"/>
          <input value={revenueAccount} onChange={(e)=>setRevenueAccount(e.target.value)} placeholder="حساب الإيراد"/>
          <input value={vatAccount} onChange={(e)=>setVatAccount(e.target.value)} placeholder="حساب ضريبة المخرجات"/>
        </div>
        <div className="sales-actions"><button className="secondary" onClick={()=>void saveDraft()}>حفظ مسودة</button><button onClick={()=>void saveAndPost()}>حفظ وترحيل</button></div>
        {message?<p className="sales-message">{message}</p>:null}
      </section>

      <section className="sk-surface sales-lines">
        <span className="eyebrow">الطلب الحالي</span><h3>السطور المحسوبة</h3>
        {lines.length===0?<p className="sales-empty">لا توجد سطور. اختر أصنافًا فعلية من الكتالوج.</p>:
        <div className="sales-table"><table><thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الخصم</th></tr></thead><tbody>{lines.map((line,index)=><tr key={line.itemId+'-'+index}><td>{items.find(i=>i.id===line.itemId)?.name??line.itemId}</td><td className="sk-number">{line.quantity}</td><td className="sk-number">{line.unitPrice}</td><td className="sk-number">{line.discount??0}</td></tr>)}</tbody></table></div>}
        {lines.length>0?<button className="secondary" onClick={()=>setLines([])}>مسح الطلب الحالي</button>:null}
      </section>
    </div></WorkspaceSectionPage>

    <WorkspaceSectionPage id="credit" active={section}><CreditPanel/>
    <SubscriptionsPanel/></WorkspaceSectionPage>
    <WorkspaceSectionPage id="invoices" active={section}><TaxInvoicePanel orders={orders} customers={customers} items={items}/></WorkspaceSectionPage>
    <WorkspaceSectionPage id="catering" active={section}><CateringPanel/></WorkspaceSectionPage>
    <WorkspaceSectionPage id="customers" active={section}><CustomerIntelligencePanel/></WorkspaceSectionPage>

    <WorkspaceSectionPage id="orders" active={section}><section className="sales-orders sk-surface">
      <div className="sales-customers__head"><div><span className="eyebrow">Sales Register</span><h3>سجل أوامر البيع</h3></div><strong>{orders.length}</strong></div>
      {orders.length===0?<p className="sales-empty">لا توجد أوامر محفوظة.</p>:<div className="sales-table"><table><thead><tr><th>الرقم</th><th>العميل</th><th>الحالة</th><th>الإجمالي</th><th></th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td>{order.number}</td><td>{customers.find(c=>c.id===order.customerId)?.name??order.customerId}</td><td>{order.status}</td><td className="sk-number">{calculateSalesTotals(order.lines).total.toLocaleString('en-US')}</td><td>{order.status==='DRAFT'?<button onClick={()=>void postDocument(order)}>ترحيل</button>:'—'}</td></tr>)}</tbody></table></div>}
    </section></WorkspaceSectionPage>
  </section>;
}

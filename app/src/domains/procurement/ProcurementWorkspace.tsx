import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import type {JournalEntry} from '../finance/ledger-engine';
import type {PayableInvoice} from '../finance/payables-engine';
import type {StockMovement} from '../stock/inventory-engine';
import {matchReceipt} from './procurement-engine';
import {buildReceiptPosting,type GoodsReceiptDocument,type PurchaseDocumentLine,type PurchaseOrderDocument} from './procurement-posting-engine';
import type {Supplier} from './suppliers-engine';
import {SuppliersPanel} from './SuppliersPanel';
import './procurement-workspace.css';

export function ProcurementWorkspace(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [orders,setOrders]=useState<PurchaseOrderDocument[]>([]);
  const [receipts,setReceipts]=useState<GoodsReceiptDocument[]>([]);
  const [orderLines,setOrderLines]=useState<PurchaseDocumentLine[]>([]);
  const [receiptLines,setReceiptLines]=useState<Array<{itemId:string;quantity:number}>>([]);
  const [supplierId,setSupplierId]=useState('');
  const [orderNumber,setOrderNumber]=useState('');
  const [dueDate,setDueDate]=useState(new Date().toISOString().slice(0,10));
  const [selectedOrderId,setSelectedOrderId]=useState('');
  const [itemId,setItemId]=useState('');
  const [orderedQty,setOrderedQty]=useState('');
  const [unitCost,setUnitCost]=useState('');
  const [vatRate,setVatRate]=useState('15');
  const [receiptItemId,setReceiptItemId]=useState('');
  const [receivedQty,setReceivedQty]=useState('');
  const [inventoryAccount,setInventoryAccount]=useState('account-1300');
  const [inputVatAccount,setInputVatAccount]=useState('account-1150');
  const [payableAccount,setPayableAccount]=useState('account-2100');
  const [message,setMessage]=useState('');

  const supplierRepo=useMemo(()=>new JsonStorageRepository<Supplier>(window.localStorage,makeScopedKey('procurement.suppliers',scope)),[scope]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const orderRepo=useMemo(()=>new JsonStorageRepository<PurchaseOrderDocument>(window.localStorage,makeScopedKey('procurement.orders',scope)),[scope]);
  const receiptRepo=useMemo(()=>new JsonStorageRepository<GoodsReceiptDocument>(window.localStorage,makeScopedKey('procurement.receipts',scope)),[scope]);
  const journalRepo=useMemo(()=>new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,makeScopedKey('finance.journals',scope)),[scope]);
  const stockRepo=useMemo(()=>new JsonStorageRepository<StockMovement & {id:string}>(window.localStorage,makeScopedKey('stock.movements',scope)),[scope]);
  const payableRepo=useMemo(()=>new JsonStorageRepository<PayableInvoice & {id:string}>(window.localStorage,makeScopedKey('finance.payables',scope)),[scope]);

  useEffect(()=>{void Promise.all([supplierRepo.list(),itemRepo.list(),orderRepo.list(),receiptRepo.list()]).then(([s,i,o,r])=>{setSuppliers(s);setItems(i);setOrders(o);setReceipts(r);});},[supplierRepo,itemRepo,orderRepo,receiptRepo]);

  const selectedOrder=orders.find(o=>o.id===selectedOrderId)??null;
  const matches=useMemo(()=>selectedOrder?matchReceipt(
    selectedOrder.lines.map(line=>({itemId:line.itemId,orderedQty:line.quantity,unitCost:line.unitCostExVat})),
    receiptLines.map(line=>({itemId:line.itemId,receivedQty:line.quantity}))
  ):[],[selectedOrder,receiptLines]);

  const draftOrderValue=orderLines.reduce((sum,line)=>sum+Math.max(0,line.quantity)*Math.max(0,line.unitCostExVat),0);

  function selectOrderItem(id:string){
    setItemId(id);
    const item=items.find(x=>x.id===id);
    if(item?.defaultCost!==undefined)setUnitCost(String(item.defaultCost));
    if(item)setVatRate(String(Math.round(item.vatRate*10000)/100));
  }

  function addOrderLine(){
    const qty=Number(orderedQty),cost=Number(unitCost),vat=(Number(vatRate)||0)/100;
    if(!itemId||!Number.isFinite(qty)||qty<=0||!Number.isFinite(cost)||cost<0){setMessage('أدخل صنفًا وكمية وتكلفة صحيحة.');return;}
    setOrderLines(rows=>[...rows,{itemId,quantity:qty,unitCostExVat:cost,vatRate:vat}]);
    setItemId('');setOrderedQty('');setUnitCost('');setMessage('');
  }

  async function saveOrder(){
    if(!supplierId){setMessage('اختر المورد.');return;}
    if(orderLines.length===0){setMessage('أضف سطر شراء واحدًا على الأقل.');return;}
    const order:PurchaseOrderDocument={
      id:crypto.randomUUID(),
      number:orderNumber.trim()||('PO-'+Date.now()),
      date:new Date().toISOString().slice(0,10),
      dueDate,
      supplierId,
      lines:orderLines,
      status:'OPEN',
    };
    await orderRepo.put(order);
    setOrders(await orderRepo.list());
    setSelectedOrderId(order.id);
    setSupplierId('');setOrderNumber('');setOrderLines([]);
    setMessage('تم حفظ أمر الشراء وأصبح جاهزًا للاستلام.');
  }

  function addReceiptLine(){
    const qty=Number(receivedQty);
    if(!selectedOrder){setMessage('اختر أمر شراء مفتوحًا.');return;}
    if(!receiptItemId||!Number.isFinite(qty)||qty<=0){setMessage('اختر الصنف وكمية الاستلام.');return;}
    setReceiptLines(rows=>[...rows,{itemId:receiptItemId,quantity:qty}]);
    setReceiptItemId('');setReceivedQty('');setMessage('');
  }

  async function postReceipt(){
    if(!selectedOrder){setMessage('اختر أمر شراء.');return;}
    if(receiptLines.length===0){setMessage('أضف كمية مستلمة واحدة على الأقل.');return;}
    const receipt:GoodsReceiptDocument={
      id:crypto.randomUUID(),
      number:'GR-'+Date.now(),
      date:new Date().toISOString().slice(0,10),
      purchaseOrderId:selectedOrder.id,
      lines:receiptLines,
      status:'DRAFT',
    };
    const bundle=buildReceiptPosting(selectedOrder,receipt,{
      inventoryAccountId:inventoryAccount.trim(),
      inputVatAccountId:inputVatAccount.trim(),
      payableAccountId:payableAccount.trim(),
    });
    await journalRepo.put(bundle.journal);
    await stockRepo.putMany(bundle.stockMovements);
    await payableRepo.put(bundle.payable);
    await receiptRepo.put({...receipt,status:'POSTED'});
    setReceipts(await receiptRepo.list());
    setReceiptLines([]);
    setMessage('تم ترحيل الاستلام إلى المخزون والمالية.');
  }

  return <section className="procurement-workspace">
    <div className="procurement-kpis">
      <article className="sk-surface"><span>أوامر شراء مفتوحة</span><strong>{orders.filter(x=>x.status==='OPEN').length}</strong></article>
      <article className="sk-surface"><span>قيمة المسودة الحالية</span><strong className="sk-number">{draftOrderValue.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>استلامات مرحّلة</span><strong>{receipts.filter(x=>x.status==='POSTED').length}</strong></article>
      <article className="sk-surface"><span>فروقات الاستلام الحالي</span><strong>{matches.filter(x=>x.status!=='MATCH').length}</strong></article>
    </div>

    <SuppliersPanel/>

    <div className="procurement-grid">
      <section className="sk-surface procurement-form">
        <span className="eyebrow">Purchase Order</span><h3>إنشاء أمر شراء</h3>
        <label>المورد<select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)}><option value="">اختر المورد</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select></label>
        <label>رقم الأمر<input value={orderNumber} onChange={(e)=>setOrderNumber(e.target.value)} placeholder="يولد تلقائيًا"/></label>
        <label>تاريخ الاستحقاق<input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)}/></label>
        <label>الصنف<select value={itemId} onChange={(e)=>selectOrderItem(e.target.value)}><option value="">اختر الصنف</option>{items.map(i=><option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}</select></label>
        <label>الكمية المطلوبة<input inputMode="decimal" value={orderedQty} onChange={(e)=>setOrderedQty(e.target.value)}/></label>
        <label>تكلفة الوحدة بدون الضريبة<input inputMode="decimal" value={unitCost} onChange={(e)=>setUnitCost(e.target.value)}/></label>
        <label>VAT %<input inputMode="decimal" value={vatRate} onChange={(e)=>setVatRate(e.target.value)}/></label>
        <button onClick={addOrderLine}>إضافة سطر</button>
        <button className="secondary" onClick={()=>void saveOrder()}>حفظ أمر الشراء</button>
      </section>

      <section className="sk-surface procurement-match">
        <span className="eyebrow">Goods Receipt</span><h3>الاستلام والترحيل</h3>
        <label>أمر الشراء<select value={selectedOrderId} onChange={(e)=>{setSelectedOrderId(e.target.value);setReceiptLines([]);}}><option value="">اختر أمرًا</option>{orders.filter(o=>o.status==='OPEN').map(o=><option key={o.id} value={o.id}>{o.number}</option>)}</select></label>
        <div className="procurement-receipt-form">
          <select value={receiptItemId} onChange={(e)=>setReceiptItemId(e.target.value)}><option value="">الصنف المستلم</option>{selectedOrder?.lines.map(l=><option key={l.itemId} value={l.itemId}>{items.find(i=>i.id===l.itemId)?.name??l.itemId}</option>)}</select>
          <input inputMode="decimal" value={receivedQty} onChange={(e)=>setReceivedQty(e.target.value)} placeholder="الكمية"/>
          <button onClick={addReceiptLine}>إضافة</button>
        </div>
        {matches.length===0?<p className="procurement-empty">اختر أمر شراء وأدخل الكمية المستلمة.</p>:<div className="procurement-table"><table><thead><tr><th>الصنف</th><th>مطلوب</th><th>مستلم</th><th>الفرق</th><th>الحالة</th></tr></thead><tbody>{matches.map(row=><tr key={row.itemId}><td>{items.find(i=>i.id===row.itemId)?.name??row.itemId}</td><td>{row.orderedQty}</td><td>{row.receivedQty}</td><td>{row.varianceQty}</td><td>{row.status}</td></tr>)}</tbody></table></div>}
        <div className="procurement-posting-accounts">
          <input value={inventoryAccount} onChange={(e)=>setInventoryAccount(e.target.value)} placeholder="حساب المخزون"/>
          <input value={inputVatAccount} onChange={(e)=>setInputVatAccount(e.target.value)} placeholder="ضريبة المدخلات"/>
          <input value={payableAccount} onChange={(e)=>setPayableAccount(e.target.value)} placeholder="حساب الموردين"/>
        </div>
        <button onClick={()=>void postReceipt()} disabled={receiptLines.length===0}>ترحيل الاستلام</button>
      </section>
    </div>
    {message?<p className="procurement-message">{message}</p>:null}

    <section className="procurement-register sk-surface">
      <span className="eyebrow">Procurement Register</span><h3>سجل أوامر الشراء</h3>
      {orders.length===0?<p className="procurement-empty">لا توجد أوامر شراء بعد.</p>:<div className="procurement-table"><table><thead><tr><th>الرقم</th><th>المورد</th><th>السطور</th><th>الحالة</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.number}</td><td>{suppliers.find(s=>s.id===o.supplierId)?.name??o.supplierId}</td><td>{o.lines.length}</td><td>{o.status}</td></tr>)}</tbody></table></div>}
    </section>
  </section>;
}

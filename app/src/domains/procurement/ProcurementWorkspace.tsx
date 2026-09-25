import {useMemo,useState} from 'react';
import {matchReceipt,purchaseOrderValue,type GoodsReceiptLine,type PurchaseOrderLine} from './procurement-engine';
import './procurement-workspace.css';

export function ProcurementWorkspace(){
  const [orders,setOrders]=useState<PurchaseOrderLine[]>([]);
  const [receipts,setReceipts]=useState<GoodsReceiptLine[]>([]);
  const [itemId,setItemId]=useState('');
  const [orderedQty,setOrderedQty]=useState('');
  const [unitCost,setUnitCost]=useState('');
  const [receivedQty,setReceivedQty]=useState('');
  const [message,setMessage]=useState('');

  const matches=useMemo(()=>matchReceipt(orders,receipts),[orders,receipts]);
  const orderValue=useMemo(()=>purchaseOrderValue(orders),[orders]);

  function addOrder(){
    const qty=Number(orderedQty),cost=Number(unitCost);
    if(!itemId.trim()||!Number.isFinite(qty)||qty<=0||!Number.isFinite(cost)||cost<0){setMessage('أدخل صنفًا وكمية وتكلفة صحيحة.');return;}
    setOrders((rows)=>[...rows,{itemId:itemId.trim(),orderedQty:qty,unitCost:cost}]);
    setOrderedQty('');setUnitCost('');setMessage('');
  }

  function addReceipt(){
    const qty=Number(receivedQty);
    if(!itemId.trim()||!Number.isFinite(qty)||qty<=0){setMessage('أدخل الصنف وكمية الاستلام.');return;}
    setReceipts((rows)=>[...rows,{itemId:itemId.trim(),receivedQty:qty}]);
    setReceivedQty('');setMessage('');
  }

  return <section className="procurement-workspace">
    <div className="procurement-kpis">
      <article className="sk-surface"><span>سطور أمر الشراء</span><strong>{orders.length}</strong></article>
      <article className="sk-surface"><span>قيمة أمر الشراء</span><strong className="sk-number">{orderValue.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>سطور الاستلام</span><strong>{receipts.length}</strong></article>
      <article className="sk-surface"><span>فروقات الاستلام</span><strong>{matches.filter((x)=>x.status!=='MATCH').length}</strong></article>
    </div>
    <div className="procurement-grid">
      <section className="sk-surface procurement-form">
        <span className="eyebrow">Purchase + Receiving</span><h3>أمر شراء واستلام</h3>
        <label>الصنف<input value={itemId} onChange={(e)=>setItemId(e.target.value)} placeholder="SKU"/></label>
        <label>الكمية المطلوبة<input inputMode="decimal" value={orderedQty} onChange={(e)=>setOrderedQty(e.target.value)}/></label>
        <label>تكلفة الوحدة<input inputMode="decimal" value={unitCost} onChange={(e)=>setUnitCost(e.target.value)}/></label>
        <button onClick={addOrder}>إضافة لأمر الشراء</button>
        <label>الكمية المستلمة<input inputMode="decimal" value={receivedQty} onChange={(e)=>setReceivedQty(e.target.value)}/></label>
        <button className="secondary" onClick={addReceipt}>تسجيل الاستلام</button>
        {message?<p>{message}</p>:null}
      </section>
      <section className="sk-surface procurement-match">
        <span className="eyebrow">Three-way foundation</span><h3>مطابقة الكميات</h3>
        {matches.length===0?<p className="procurement-empty">أضف أمر شراء أو استلام لبدء المطابقة.</p>:<div className="procurement-table"><table><thead><tr><th>الصنف</th><th>مطلوب</th><th>مستلم</th><th>الفرق</th><th>الحالة</th></tr></thead><tbody>{matches.map((row)=><tr key={row.itemId}><td>{row.itemId}</td><td>{row.orderedQty}</td><td>{row.receivedQty}</td><td>{row.varianceQty}</td><td>{row.status}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import type {Customer} from './customers-engine';
import type {SalesDocument} from './sales-posting-engine';
import {applyInvoicePayment,createTaxInvoice,type PaymentMethod,type TaxInvoice} from './tax-invoice-engine';

const METHOD_LABELS:Record<PaymentMethod,string>={cash:'نقدي',mada:'مدى',transfer:'تحويل',credit:'آجل'};

export function TaxInvoicePanel({orders,customers,items}:{orders:SalesDocument[];customers:Customer[];items:CatalogItem[]}){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<TaxInvoice>(window.localStorage,makeScopedKey('sales.tax-invoices',scope)),[scope]);
  const [invoices,setInvoices]=useState<TaxInvoice[]>([]);
  const [orderId,setOrderId]=useState('');
  const [sellerName,setSellerName]=useState('شركة أغنام الوادي');
  const [vatNumber,setVatNumber]=useState('');
  const [method,setMethod]=useState<PaymentMethod>('mada');
  const [amount,setAmount]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void repo.list().then(setInvoices);},[repo]);
  const order=orders.find(o=>o.id===orderId)??null;

  async function issueInvoice(){
    if(!order){setMessage('اختر أمر بيع مرحّل أولًا.');return;}
    if(invoices.some(inv=>inv.id==='invoice-'+order.id)){setMessage('تم إصدار فاتورة لهذا الأمر بالفعل.');return;}
    try{
      const customer=customers.find(c=>c.id===order.customerId);
      const invoice=createTaxInvoice({
        id:'invoice-'+order.id,
        number:'INV-'+order.number.replace(/^SO-?/,''),
        issuedAt:new Date().toISOString(),
        sellerName,
        sellerVatNumber:vatNumber,
        customerId:order.customerId,
        customerName:customer?.name,
        lines:order.lines.map(line=>({
          description:items.find(item=>item.id===line.itemId)?.name??line.itemId,
          quantity:line.quantity,
          unitPriceExVat:line.unitPrice,
          vatRate:line.vatRate??0,
          discountExVat:line.discount,
        })),
      });
      await repo.put(invoice);
      setInvoices(await repo.list());
      setMessage('تم إصدار الفاتورة الضريبية وحفظ TLV.');
    }catch(error){setMessage(String(error));}
  }

  async function pay(invoice:TaxInvoice){
    const value=Number(amount);
    if(!Number.isFinite(value)||value<=0){setMessage('أدخل مبلغ دفع صحيحًا.');return;}
    try{
      await repo.put(applyInvoicePayment(invoice,{method,amount:value}));
      setInvoices(await repo.list());
      setAmount('');
      setMessage('تم تسجيل الدفعة.');
    }catch(error){setMessage(String(error));}
  }

  return <section className="tax-invoices sk-surface">
    <div className="tax-invoices__head"><div><span className="eyebrow">Tax Invoice + POS</span><h3>الفاتورة الضريبية والمدفوعات</h3></div><strong>{invoices.filter(i=>i.status==='PAID').length}/{invoices.length}</strong></div>
    <div className="tax-invoices__issue">
      <select value={orderId} onChange={(e)=>setOrderId(e.target.value)}><option value="">اختر أمر بيع مرحّل</option>{orders.filter(o=>o.status==='POSTED').map(o=><option key={o.id} value={o.id}>{o.number}</option>)}</select>
      <input value={sellerName} onChange={(e)=>setSellerName(e.target.value)} placeholder="اسم البائع"/>
      <input value={vatNumber} onChange={(e)=>setVatNumber(e.target.value)} placeholder="الرقم الضريبي للبائع"/>
      <button onClick={()=>void issueInvoice()}>إصدار فاتورة</button>
    </div>
    {message?<p className="sales-message">{message}</p>:null}
    {invoices.length===0?<p className="sales-empty">لا توجد فواتير بعد. أصدر الفاتورة من أمر بيع مرحّل.</p>:<div className="tax-invoice-list">{invoices.map(invoice=><article key={invoice.id}>
      <div className="tax-invoice-list__main"><div><b>{invoice.number}</b><small>{invoice.customerName??'بدون اسم عميل'} · {new Date(invoice.issuedAt).toLocaleString('ar-SA')}</small></div><span data-status={invoice.status}>{invoice.status}</span></div>
      <div className="tax-invoice-totals"><span>قبل الضريبة <b className="sk-number">{invoice.subtotalExVat.toLocaleString('en-US')}</b></span><span>VAT <b className="sk-number">{invoice.vat.toLocaleString('en-US')}</b></span><span>الإجمالي <b className="sk-number">{invoice.totalIncVat.toLocaleString('en-US')}</b></span><span>المتبقي <b className="sk-number">{invoice.balance.toLocaleString('en-US')}</b></span></div>
      <div className="tax-invoice-tlv"><code>{invoice.zatcaTlvBase64}</code></div>
      {invoice.status!=='PAID'?<div className="tax-invoice-pay"><select value={method} onChange={(e)=>setMethod(e.target.value as PaymentMethod)}>{Object.entries(METHOD_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><input inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="المبلغ"/><button onClick={()=>void pay(invoice)}>تسجيل دفعة</button></div>:null}
    </article>)}</div>}
    <p className="tax-invoice-note">TLV هنا أساس بيانات QR للفاتورة الضريبية؛ التوقيع/الختم ومتطلبات التكامل المرحلية تحتاج خدمة ZATCA مخصصة عند تفعيلها.</p>
  </section>;
}

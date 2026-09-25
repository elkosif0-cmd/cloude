import {useMemo,useState} from 'react';
import {calculateSalesTotals,type SalesLine} from './sales-engine';
import './sales-workspace.css';

export function SalesWorkspace(){
  const [lines,setLines]=useState<SalesLine[]>([]);
  const [itemId,setItemId]=useState('');
  const [quantity,setQuantity]=useState('1');
  const [unitPrice,setUnitPrice]=useState('');
  const [discount,setDiscount]=useState('0');
  const [vatRate,setVatRate]=useState('15');
  const [message,setMessage]=useState('');

  const totals=useMemo(()=>calculateSalesTotals(lines),[lines]);

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
    setItemId('');
    setUnitPrice('');
    setDiscount('0');
    setMessage('');
  }

  return <section className="sales-workspace">
    <div className="sales-kpis">
      <article className="sk-surface"><span>قبل الخصم</span><strong className="sk-number">{totals.subtotal.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>الخصم</span><strong className="sk-number">{totals.discount.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>الضريبة</span><strong className="sk-number">{totals.vat.toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>الإجمالي</span><strong className="sk-number">{totals.total.toLocaleString('en-US')}</strong></article>
    </div>
    <div className="sales-grid">
      <section className="sk-surface sales-form">
        <span className="eyebrow">Sales Engine</span><h3>إنشاء سطور بيع</h3>
        <label>الصنف<input value={itemId} onChange={(e)=>setItemId(e.target.value)} placeholder="SKU أو اسم الصنف"/></label>
        <label>الكمية<input inputMode="decimal" value={quantity} onChange={(e)=>setQuantity(e.target.value)}/></label>
        <label>سعر الوحدة شامل الضريبة<input inputMode="decimal" value={unitPrice} onChange={(e)=>setUnitPrice(e.target.value)}/></label>
        <label>الخصم على السطر<input inputMode="decimal" value={discount} onChange={(e)=>setDiscount(e.target.value)}/></label>
        <label>VAT %<input inputMode="decimal" value={vatRate} onChange={(e)=>setVatRate(e.target.value)}/></label>
        <button onClick={addLine}>إضافة السطر</button>
        {message?<p>{message}</p>:null}
      </section>
      <section className="sk-surface sales-lines">
        <span className="eyebrow">الطلب الحالي</span><h3>السطور المحسوبة</h3>
        {lines.length===0?<p className="sales-empty">لا توجد سطور. الحسابات تبدأ فقط من إدخالك الفعلي.</p>:
        <div className="sales-table"><table><thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الخصم</th></tr></thead><tbody>{lines.map((line,index)=><tr key={line.itemId+'-'+index}><td>{line.itemId}</td><td className="sk-number">{line.quantity}</td><td className="sk-number">{line.unitPrice}</td><td className="sk-number">{line.discount??0}</td></tr>)}</tbody></table></div>}
        {lines.length>0?<button className="secondary" onClick={()=>setLines([])}>مسح الطلب الحالي</button>:null}
      </section>
    </div>
  </section>;
}

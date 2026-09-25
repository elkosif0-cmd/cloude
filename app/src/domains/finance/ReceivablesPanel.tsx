import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {ageReceivables,type ReceivableInvoice} from './receivables-engine';

const STORAGE_KEY='skosif.v1.finance.receivables';

export function ReceivablesPanel(){
  const [rows,setRows]=useState<ReceivableInvoice[]>([]);
  const [customerId,setCustomerId]=useState('');
  const [amount,setAmount]=useState('');
  const [paid,setPaid]=useState('0');
  const [dueDate,setDueDate]=useState(new Date().toISOString().slice(0,10));
  const [message,setMessage]=useState('');
  const repo=useMemo(()=>new JsonStorageRepository<ReceivableInvoice & {id:string}>(window.localStorage,STORAGE_KEY),[]);
  useEffect(()=>{void repo.list().then(setRows);},[repo]);
  const aging=useMemo(()=>ageReceivables(rows,new Date().toISOString().slice(0,10)),[rows]);

  async function addInvoice(){
    const value=Number(amount),paidValue=Number(paid);
    if(!customerId.trim()||!Number.isFinite(value)||value<=0){setMessage('أدخل العميل وقيمة فاتورة صحيحة.');return;}
    const invoice:ReceivableInvoice={id:crypto.randomUUID(),customerId:customerId.trim(),invoiceDate:new Date().toISOString().slice(0,10),dueDate,amount:value,paid:Number.isFinite(paidValue)?Math.max(0,paidValue):0};
    await repo.put(invoice);
    setRows(await repo.list());
    setCustomerId('');setAmount('');setPaid('0');setMessage('');
  }

  return <section className="finance-receivables sk-surface">
    <div className="finance-receivables__head"><div><span className="eyebrow">Accounts Receivable</span><h3>أعمار الذمم المدينة</h3></div><strong className="sk-number">{aging.outstanding.toLocaleString('en-US')}</strong></div>
    <div className="finance-aging"><span>حالي {aging.totals.current.toLocaleString('en-US')}</span><span>1-30 {aging.totals['1-30'].toLocaleString('en-US')}</span><span>31-60 {aging.totals['31-60'].toLocaleString('en-US')}</span><span>61-90 {aging.totals['61-90'].toLocaleString('en-US')}</span><span>90+ {aging.totals['90+'].toLocaleString('en-US')}</span></div>
    <div className="finance-receivable-form"><input value={customerId} onChange={(e)=>setCustomerId(e.target.value)} placeholder="العميل"/><input inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="قيمة الفاتورة"/><input inputMode="decimal" value={paid} onChange={(e)=>setPaid(e.target.value)} placeholder="المسدد"/><input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)}/><button onClick={()=>void addInvoice()}>إضافة فاتورة</button></div>
    {message?<p className="finance-message">{message}</p>:null}
    {aging.rows.length>0?<div className="finance-table-wrap"><table><thead><tr><th>العميل</th><th>المستحق</th><th>أيام التأخير</th><th>الفئة</th></tr></thead><tbody>{aging.rows.map((row)=><tr key={row.id}><td>{row.customerId}</td><td className="sk-number">{row.outstanding.toLocaleString('en-US')}</td><td>{row.daysPastDue}</td><td>{row.bucket}</td></tr>)}</tbody></table></div>:<p className="finance-empty">لا توجد ذمم مفتوحة حتى الآن.</p>}
  </section>;
}

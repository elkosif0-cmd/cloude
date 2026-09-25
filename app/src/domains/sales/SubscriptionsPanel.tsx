import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {Customer} from './customers-engine';
import {advanceDelivery,monthlyRecurringRevenue,subscriptionAnnualValue,subscriptionDue,type MeatSubscription,type SubscriptionCycle} from './subscription-engine';

export function SubscriptionsPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const customerRepo=useMemo(()=>new JsonStorageRepository<Customer>(window.localStorage,makeScopedKey('sales.customers',scope)),[scope]);
  const repo=useMemo(()=>new JsonStorageRepository<MeatSubscription>(window.localStorage,makeScopedKey('sales.subscriptions',scope)),[scope]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [rows,setRows]=useState<MeatSubscription[]>([]);
  const [customerId,setCustomerId]=useState('');
  const [customerName,setCustomerName]=useState('');
  const [phone,setPhone]=useState('');
  const [planName,setPlanName]=useState('بوكس العائلة الفاخر');
  const [cycle,setCycle]=useState<SubscriptionCycle>('MONTHLY');
  const [price,setPrice]=useState('');
  const [address,setAddress]=useState('');
  const [nextDeliveryDate,setNextDeliveryDate]=useState(new Date().toISOString().slice(0,10));
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([customerRepo.list(),repo.list()]).then(([c,s])=>{setCustomers(c);setRows(s);});},[customerRepo,repo]);
  const today=new Date().toISOString().slice(0,10);
  const mrr=monthlyRecurringRevenue(rows);
  const due=rows.filter(row=>subscriptionDue(row,today)).length;

  function selectCustomer(id:string){
    setCustomerId(id);
    const customer=customers.find(c=>c.id===id);
    if(customer){setCustomerName(customer.name);setPhone(customer.phone??'');}
  }

  async function add(){
    const value=Number(price);
    if(!customerName.trim()||!Number.isFinite(value)||value<=0){setMessage('أدخل اسم العميل وقيمة الاشتراك.');return;}
    const subscription:MeatSubscription={
      id:crypto.randomUUID(),customerId:customerId||undefined,customerName:customerName.trim(),phone:phone.trim()||undefined,
      planCode:'custom',planName:planName.trim()||'اشتراك لحوم',cycle,price:value,address:address.trim()||undefined,status:'ACTIVE',nextDeliveryDate,
    };
    await repo.put(subscription);setRows(await repo.list());
    setCustomerId('');setCustomerName('');setPhone('');setPrice('');setAddress('');setMessage('تم إنشاء الاشتراك.');
  }

  async function toggle(row:MeatSubscription){
    await repo.put({...row,status:row.status==='ACTIVE'?'PAUSED':'ACTIVE'});
    setRows(await repo.list());
  }

  async function delivered(row:MeatSubscription){
    await repo.put(advanceDelivery(row,today));
    setRows(await repo.list());setMessage('تم تأكيد التوصيل وتحديث الموعد القادم.');
  }

  return <section className="sales-subscriptions sk-surface">
    <div className="sales-subscriptions__head"><div><span className="eyebrow">Recurring Revenue</span><h3>اشتراكات وبوكسات اللحوم</h3></div><strong className="sk-number">{mrr.toLocaleString('en-US')} MRR</strong></div>
    <div className="sales-subscriptions__kpis"><span>نشطة <b>{rows.filter(r=>r.status==='ACTIVE').length}</b></span><span>توصيلات مستحقة <b>{due}</b></span><span>إجمالي الاشتراكات <b>{rows.length}</b></span></div>
    <div className="sales-subscriptions__form">
      <select value={customerId} onChange={(e)=>selectCustomer(e.target.value)}><option value="">عميل من الدليل - اختياري</option>{customers.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select>
      <input value={customerName} onChange={(e)=>setCustomerName(e.target.value)} placeholder="اسم العميل"/>
      <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="الجوال"/>
      <input value={planName} onChange={(e)=>setPlanName(e.target.value)} placeholder="اسم الباقة"/>
      <select value={cycle} onChange={(e)=>setCycle(e.target.value as SubscriptionCycle)}><option value="WEEKLY">أسبوعي</option><option value="MONTHLY">شهري</option><option value="CUSTOM">مخصص</option></select>
      <input inputMode="decimal" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="القيمة"/>
      <input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="عنوان التوصيل"/>
      <input type="date" value={nextDeliveryDate} onChange={(e)=>setNextDeliveryDate(e.target.value)}/>
      <button onClick={()=>void add()}>إضافة اشتراك</button>
    </div>
    {message?<p className="sales-message">{message}</p>:null}
    {rows.length===0?<p className="sales-empty">لا توجد اشتراكات بعد.</p>:<div className="sales-table"><table><thead><tr><th>العميل</th><th>الباقة</th><th>الدورة</th><th>القيمة</th><th>قيمة سنوية</th><th>التوصيل القادم</th><th>الحالة</th><th></th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{row.customerName}</td><td>{row.planName}</td><td>{row.cycle}</td><td className="sk-number">{row.price.toLocaleString('en-US')}</td><td className="sk-number">{subscriptionAnnualValue(row).toLocaleString('en-US')}</td><td data-due={subscriptionDue(row,today)}>{row.nextDeliveryDate??'—'}</td><td>{row.status}</td><td><div className="subscription-actions"><button className="secondary" onClick={()=>void toggle(row)}>{row.status==='ACTIVE'?'إيقاف':'تفعيل'}</button>{row.status==='ACTIVE'?<button onClick={()=>void delivered(row)}>تم التوصيل</button>:null}</div></td></tr>)}</tbody></table></div>}
  </section>;
}

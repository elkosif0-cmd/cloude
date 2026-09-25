import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {createCustomer,inspectCustomers,type Customer} from './customers-engine';

export function CustomersPanel({onChanged}:{onChanged?:()=>void}){
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [code,setCode]=useState('');
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [email,setEmail]=useState('');
  const [city,setCity]=useState('');
  const [message,setMessage]=useState('');

  const key=useMemo(()=>makeScopedKey('sales.customers',readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<Customer>(window.localStorage,key),[key]);
  useEffect(()=>{void repo.list().then(setCustomers);},[repo]);

  async function addCustomer(){
    const customer=createCustomer({code,name,phone,email,city});
    const issues=inspectCustomers([...customers,customer]).filter(x=>x.customerId===customer.id);
    if(issues.length){
      setMessage('تعذر الحفظ: تحقق من كود العميل والبيانات المكررة.');
      return;
    }
    await repo.put(customer);
    setCustomers(await repo.list());
    onChanged?.();
    setCode('');setName('');setPhone('');setEmail('');setCity('');
    setMessage('تم حفظ العميل.');
  }

  return <section className="sales-customers sk-surface">
    <div className="sales-customers__head"><div><span className="eyebrow">Customer Master</span><h3>دليل العملاء</h3></div><strong className="sk-number">{customers.length}</strong></div>
    <div className="sales-customers__form">
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="كود العميل"/>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم العميل"/>
      <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="الجوال"/>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="البريد"/>
      <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="المدينة"/>
      <button onClick={()=>void addCustomer()}>إضافة عميل</button>
    </div>
    {message?<p className="sales-message">{message}</p>:null}
    {customers.length===0?<p className="sales-empty">لا يوجد عملاء مسجلون بعد.</p>:<div className="sales-table"><table><thead><tr><th>الكود</th><th>العميل</th><th>الجوال</th><th>المدينة</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td>{c.code}</td><td>{c.name}</td><td>{c.phone??'—'}</td><td>{c.city??'—'}</td></tr>)}</tbody></table></div>}
  </section>;
}

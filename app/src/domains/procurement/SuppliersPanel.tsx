import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {createSupplier,inspectSuppliers,type Supplier} from './suppliers-engine';

export function SuppliersPanel({onChanged}:{onChanged?:()=>void}){
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [code,setCode]=useState('');
  const [name,setName]=useState('');
  const [taxNumber,setTaxNumber]=useState('');
  const [phone,setPhone]=useState('');
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');

  const key=useMemo(()=>makeScopedKey('procurement.suppliers',readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<Supplier>(window.localStorage,key),[key]);
  useEffect(()=>{void repo.list().then(setSuppliers);},[repo]);

  async function addSupplier(){
    const supplier=createSupplier({code,name,taxNumber,phone,email});
    const issues=inspectSuppliers([...suppliers,supplier]).filter(x=>x.supplierId===supplier.id);
    if(issues.length){
      setMessage('تعذر الحفظ: تحقق من كود المورد أو الرقم الضريبي المكرر.');
      return;
    }
    await repo.put(supplier);
    setSuppliers(await repo.list());
    onChanged?.();
    setCode('');setName('');setTaxNumber('');setPhone('');setEmail('');
    setMessage('تم حفظ المورد.');
  }

  return <section className="procurement-suppliers sk-surface">
    <div className="procurement-suppliers__head"><div><span className="eyebrow">Supplier Master</span><h3>دليل الموردين</h3></div><strong className="sk-number">{suppliers.length}</strong></div>
    <div className="procurement-suppliers__form">
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="كود المورد"/>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم المورد"/>
      <input value={taxNumber} onChange={(e)=>setTaxNumber(e.target.value)} placeholder="الرقم الضريبي"/>
      <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="الجوال"/>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="البريد"/>
      <button onClick={()=>void addSupplier()}>إضافة مورد</button>
    </div>
    {message?<p className="procurement-message">{message}</p>:null}
    {suppliers.length===0?<p className="procurement-empty">لا يوجد موردون مسجلون بعد.</p>:<div className="procurement-table"><table><thead><tr><th>الكود</th><th>المورد</th><th>الرقم الضريبي</th><th>الجوال</th></tr></thead><tbody>{suppliers.map(s=><tr key={s.id}><td>{s.code}</td><td>{s.name}</td><td>{s.taxNumber??'—'}</td><td>{s.phone??'—'}</td></tr>)}</tbody></table></div>}
  </section>;
}

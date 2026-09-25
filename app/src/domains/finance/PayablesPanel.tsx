import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {Supplier} from '../procurement/suppliers-engine';
import {agePayables,type PayableInvoice} from './payables-engine';

export function PayablesPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const [rows,setRows]=useState<PayableInvoice[]>([]);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const repo=useMemo(()=>new JsonStorageRepository<PayableInvoice & {id:string}>(window.localStorage,makeScopedKey('finance.payables',scope)),[scope]);
  const supplierRepo=useMemo(()=>new JsonStorageRepository<Supplier>(window.localStorage,makeScopedKey('procurement.suppliers',scope)),[scope]);

  useEffect(()=>{void Promise.all([repo.list(),supplierRepo.list()]).then(([p,s])=>{setRows(p);setSuppliers(s);});},[repo,supplierRepo]);
  const aging=useMemo(()=>agePayables(rows,new Date().toISOString().slice(0,10)),[rows]);

  return <section className="finance-payables sk-surface">
    <div className="finance-receivables__head"><div><span className="eyebrow">Accounts Payable</span><h3>أعمار الذمم الدائنة</h3></div><strong className="sk-number">{aging.outstanding.toLocaleString('en-US')}</strong></div>
    <div className="finance-aging"><span>حالي {aging.totals.current.toLocaleString('en-US')}</span><span>1-30 {aging.totals['1-30'].toLocaleString('en-US')}</span><span>31-60 {aging.totals['31-60'].toLocaleString('en-US')}</span><span>61-90 {aging.totals['61-90'].toLocaleString('en-US')}</span><span>90+ {aging.totals['90+'].toLocaleString('en-US')}</span></div>
    {aging.rows.length===0?<p className="finance-empty">لا توجد ذمم موردين مفتوحة. يتم إنشاؤها تلقائيًا عند ترحيل الاستلام من المشتريات.</p>:<div className="finance-table-wrap"><table><thead><tr><th>المورد</th><th>المستحق</th><th>أيام التأخير</th><th>الفئة</th></tr></thead><tbody>{aging.rows.map(row=><tr key={row.id}><td>{suppliers.find(s=>s.id===row.supplierId)?.name??row.supplierId}</td><td className="sk-number">{row.outstanding.toLocaleString('en-US')}</td><td>{row.daysPastDue}</td><td>{row.bucket}</td></tr>)}</tbody></table></div>}
  </section>;
}

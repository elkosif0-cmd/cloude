import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {PurchaseOrderDocument} from './procurement-posting-engine';
import type {Supplier} from './suppliers-engine';
import {inspectReceiving,validateReceivingInspection,type ReceivingInspection} from './receiving-inspection-engine';

export function ReceivingInspectionPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const orderRepo=useMemo(()=>new JsonStorageRepository<PurchaseOrderDocument>(window.localStorage,makeScopedKey('procurement.orders',scope)),[scope]);
  const supplierRepo=useMemo(()=>new JsonStorageRepository<Supplier>(window.localStorage,makeScopedKey('procurement.suppliers',scope)),[scope]);
  const inspectionRepo=useMemo(()=>new JsonStorageRepository<ReceivingInspection>(window.localStorage,makeScopedKey('procurement.receiving-inspections',scope)),[scope]);
  const [orders,setOrders]=useState<PurchaseOrderDocument[]>([]);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [rows,setRows]=useState<ReceivingInspection[]>([]);
  const [purchaseOrderId,setPurchaseOrderId]=useState('');
  const [supplierId,setSupplierId]=useState('');
  const [invoicedKg,setInvoicedKg]=useState('');
  const [actualKg,setActualKg]=useState('');
  const [temperatureC,setTemperatureC]=useState('');
  const [maxTemperatureC,setMaxTemperatureC]=useState('4');
  const [tolerancePercent,setTolerancePercent]=useState('2');
  const [notes,setNotes]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([orderRepo.list(),supplierRepo.list(),inspectionRepo.list()]).then(([o,s,i])=>{setOrders(o);setSuppliers(s);setRows(i);});},[orderRepo,supplierRepo,inspectionRepo]);

  function selectOrder(id:string){
    setPurchaseOrderId(id);
    const order=orders.find(row=>row.id===id);
    if(order)setSupplierId(order.supplierId);
  }

  async function save(){
    const temperature=temperatureC.trim()===''?undefined:Number(temperatureC);
    const inspection:ReceivingInspection={
      id:crypto.randomUUID(),
      purchaseOrderId:purchaseOrderId||undefined,
      supplierId:supplierId||undefined,
      date:new Date().toISOString().slice(0,10),
      invoicedKg:Number(invoicedKg)||0,
      actualKg:Number(actualKg)||0,
      temperatureC:Number.isFinite(temperature)?temperature:undefined,
      maxTemperatureC:Number(maxTemperatureC)||0,
      tolerancePercent:Number(tolerancePercent)||0,
      notes:notes.trim()||undefined,
    };
    if(!validateReceivingInspection(inspection).valid){setMessage('أدخل الوزن المفوتر والوزن الفعلي بصورة صحيحة.');return;}
    await inspectionRepo.put(inspection);
    setRows(await inspectionRepo.list());
    setInvoicedKg('');setActualKg('');setTemperatureC('');setNotes('');
    setMessage('تم حفظ فحص الاستلام.');
  }

  const reviews=rows.filter(row=>inspectReceiving(row).overallStatus==='REVIEW').length;

  return <section className="receiving-inspection sk-surface">
    <div className="receiving-inspection__head"><div><span className="eyebrow">Receiving Inspection</span><h3>تدقيق الوزن وحرارة الاستلام</h3></div><strong>{reviews} يحتاج مراجعة</strong></div>
    <div className="receiving-inspection__form">
      <select value={purchaseOrderId} onChange={(e)=>selectOrder(e.target.value)}><option value="">أمر الشراء - اختياري</option>{orders.map(order=><option key={order.id} value={order.id}>{order.number}</option>)}</select>
      <select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)}><option value="">المورد - اختياري</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <input inputMode="decimal" value={invoicedKg} onChange={(e)=>setInvoicedKg(e.target.value)} placeholder="الوزن المفوتر كجم"/>
      <input inputMode="decimal" value={actualKg} onChange={(e)=>setActualKg(e.target.value)} placeholder="الوزن الفعلي كجم"/>
      <input inputMode="decimal" value={temperatureC} onChange={(e)=>setTemperatureC(e.target.value)} placeholder="حرارة الاستلام °C"/>
      <input inputMode="decimal" value={maxTemperatureC} onChange={(e)=>setMaxTemperatureC(e.target.value)} placeholder="الحد الداخلي °C"/>
      <input inputMode="decimal" value={tolerancePercent} onChange={(e)=>setTolerancePercent(e.target.value)} placeholder="سماحية الوزن %"/>
      <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="ملاحظات"/>
      <button onClick={()=>void save()}>حفظ الفحص</button>
    </div>
    {message?<p className="procurement-message">{message}</p>:null}
    {rows.length===0?<p className="procurement-empty">لا توجد عمليات فحص استلام بعد.</p>:<div className="procurement-table"><table><thead><tr><th>التاريخ</th><th>أمر الشراء</th><th>المورد</th><th>مفوتر</th><th>فعلي</th><th>الفرق</th><th>فرق %</th><th>الحرارة</th><th>الحالة</th></tr></thead><tbody>{rows.slice().reverse().map(row=>{
      const result=inspectReceiving(row);
      return <tr key={row.id} data-status={result.overallStatus}><td>{row.date}</td><td>{orders.find(o=>o.id===row.purchaseOrderId)?.number??'—'}</td><td>{suppliers.find(s=>s.id===row.supplierId)?.name??'—'}</td><td>{row.invoicedKg}</td><td>{row.actualKg}</td><td>{result.discrepancyKg}</td><td>{result.discrepancyPercent}%</td><td>{row.temperatureC===undefined?'—':row.temperatureC+'°'}</td><td>{result.overallStatus}</td></tr>;
    })}</tbody></table></div>}
    <p className="receiving-inspection__note">حد الحرارة وسماحية الوزن إعدادات تشغيل داخلية قابلة للتغيير؛ النظام لا يفترض حدًا تنظيميًا بدل سياسات منشأتك.</p>
  </section>;
}

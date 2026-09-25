import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import type {Supplier} from '../procurement/suppliers-engine';
import {batchRisk,daysToExpiry,temperatureExcursions,traceabilitySummary,type StorageMode,type TemperatureEvent,type TraceabilityBatch} from './traceability-engine';

const RISK_LABELS={GOOD:'سليم',WARNING:'قريب الانتهاء',CRITICAL:'حرج',EXPIRED:'منتهي'};

export function TraceabilityPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const batchRepo=useMemo(()=>new JsonStorageRepository<TraceabilityBatch>(window.localStorage,makeScopedKey('stock.traceability-batches',scope)),[scope]);
  const tempRepo=useMemo(()=>new JsonStorageRepository<TemperatureEvent>(window.localStorage,makeScopedKey('stock.temperature-events',scope)),[scope]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const supplierRepo=useMemo(()=>new JsonStorageRepository<Supplier>(window.localStorage,makeScopedKey('procurement.suppliers',scope)),[scope]);

  const [batches,setBatches]=useState<TraceabilityBatch[]>([]);
  const [temps,setTemps]=useState<TemperatureEvent[]>([]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [lotCode,setLotCode]=useState('');
  const [itemId,setItemId]=useState('');
  const [supplierId,setSupplierId]=useState('');
  const [origin,setOrigin]=useState('');
  const [receivedDate,setReceivedDate]=useState(new Date().toISOString().slice(0,10));
  const [expiryDate,setExpiryDate]=useState('');
  const [storageMode,setStorageMode]=useState<StorageMode>('chilled');
  const [quantity,setQuantity]=useState('');
  const [unit,setUnit]=useState('kg');
  const [selectedBatchId,setSelectedBatchId]=useState('');
  const [temperature,setTemperature]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([batchRepo.list(),tempRepo.list(),itemRepo.list(),supplierRepo.list()]).then(([b,t,i,s])=>{setBatches(b);setTemps(t);setItems(i);setSuppliers(s);});},[batchRepo,tempRepo,itemRepo,supplierRepo]);

  const today=new Date().toISOString().slice(0,10);
  const summary=useMemo(()=>traceabilitySummary(batches,temps,today),[batches,temps,today]);

  async function addBatch(){
    const qty=Number(quantity);
    if(!lotCode.trim()||!itemId||!expiryDate||!Number.isFinite(qty)||qty<=0){setMessage('أكمل رقم الدفعة والصنف والصلاحية والكمية.');return;}
    const batch:TraceabilityBatch={
      id:crypto.randomUUID(),lotCode:lotCode.trim(),itemId,supplierId:supplierId||undefined,origin:origin.trim()||undefined,
      receivedDate,expiryDate,storageMode,quantity:qty,unit,
    };
    await batchRepo.put(batch);setBatches(await batchRepo.list());
    setLotCode('');setItemId('');setSupplierId('');setOrigin('');setExpiryDate('');setQuantity('');
    setMessage('تم حفظ دفعة التتبع.');
  }

  async function addTemperature(){
    const value=Number(temperature);
    if(!selectedBatchId||!Number.isFinite(value)){setMessage('اختر دفعة وأدخل درجة حرارة صحيحة.');return;}
    await tempRepo.put({id:crypto.randomUUID(),batchId:selectedBatchId,recordedAt:new Date().toISOString(),celsius:value});
    setTemps(await tempRepo.list());setTemperature('');setMessage('تم تسجيل قراءة التبريد.');
  }

  return <section className="traceability sk-surface">
    <div className="traceability__head"><div><span className="eyebrow">Traceability & Cold Chain</span><h3>التتبع والصلاحية وسلسلة التبريد</h3></div><strong>{summary.excursions} تجاوز حراري</strong></div>
    <div className="traceability__kpis"><span>الدفعات <b>{summary.batches}</b></span><span>الكمية <b>{summary.quantity.toLocaleString('en-US')}</b></span><span>حرجة <b>{summary.risks.CRITICAL}</b></span><span>منتهية <b>{summary.risks.EXPIRED}</b></span></div>
    <div className="traceability__forms">
      <div>
        <input value={lotCode} onChange={(e)=>setLotCode(e.target.value)} placeholder="رقم الدفعة/LOT"/>
        <select value={itemId} onChange={(e)=>setItemId(e.target.value)}><option value="">الصنف</option>{items.map(i=><option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}</select>
        <select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)}><option value="">المورد - اختياري</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <input value={origin} onChange={(e)=>setOrigin(e.target.value)} placeholder="المصدر/المنشأ"/>
        <input type="date" value={receivedDate} onChange={(e)=>setReceivedDate(e.target.value)}/>
        <input type="date" value={expiryDate} onChange={(e)=>setExpiryDate(e.target.value)}/>
        <select value={storageMode} onChange={(e)=>setStorageMode(e.target.value as StorageMode)}><option value="chilled">مبرد</option><option value="frozen">مجمد</option><option value="vacuum">فاكيوم</option></select>
        <input inputMode="decimal" value={quantity} onChange={(e)=>setQuantity(e.target.value)} placeholder="الكمية"/>
        <input value={unit} onChange={(e)=>setUnit(e.target.value)} placeholder="الوحدة"/>
        <button onClick={()=>void addBatch()}>حفظ الدفعة</button>
      </div>
      <div>
        <select value={selectedBatchId} onChange={(e)=>setSelectedBatchId(e.target.value)}><option value="">اختر دفعة لقراءة الحرارة</option>{batches.map(b=><option key={b.id} value={b.id}>{b.lotCode}</option>)}</select>
        <input inputMode="decimal" value={temperature} onChange={(e)=>setTemperature(e.target.value)} placeholder="°C"/>
        <button onClick={()=>void addTemperature()}>تسجيل قراءة</button>
      </div>
    </div>
    {message?<p className="stock-message">{message}</p>:null}
    {batches.length===0?<p className="stock-empty">لا توجد دفعات تتبع بعد.</p>:<div className="stock-table-wrap"><table><thead><tr><th>LOT</th><th>الصنف</th><th>المورد</th><th>الصلاحية</th><th>الأيام</th><th>الحالة</th><th>حرارة غير طبيعية</th></tr></thead><tbody>{batches.map(batch=>{
      const risk=batchRisk(batch,today);
      return <tr key={batch.id}><td>{batch.lotCode}</td><td>{items.find(i=>i.id===batch.itemId)?.name??batch.itemId}</td><td>{suppliers.find(s=>s.id===batch.supplierId)?.name??'—'}</td><td>{batch.expiryDate}</td><td>{daysToExpiry(batch.expiryDate,today)}</td><td data-risk={risk}>{RISK_LABELS[risk]}</td><td>{temperatureExcursions(batch,temps).length}</td></tr>;
    })}</tbody></table></div>}
    <p className="traceability__note">حدود الحرارة المستخدمة هنا قواعد تشغيل داخلية قابلة للتطوير وليست بديلًا عن متطلبات الجهة الرقابية أو مواصفات المنتج.</p>
  </section>;
}

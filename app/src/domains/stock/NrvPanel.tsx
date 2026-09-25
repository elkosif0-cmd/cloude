import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {allocateNrv,nrvAllocationCheck,type NrvCut} from './nrv-engine';

type NrvCase={id:string;name:string;jointCostNet:number;cuts:NrvCut[];createdAt:string};

export function NrvPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<NrvCase>(window.localStorage,makeScopedKey('stock.nrv-cases',scope)),[scope]);
  const [cases,setCases]=useState<NrvCase[]>([]);
  const [name,setName]=useState('');
  const [jointCost,setJointCost]=useState('');
  const [cuts,setCuts]=useState<NrvCut[]>([]);
  const [cutName,setCutName]=useState('');
  const [kg,setKg]=useState('');
  const [price,setPrice]=useState('');
  const [further,setFurther]=useState('0');
  const [message,setMessage]=useState('');

  useEffect(()=>{void repo.list().then(setCases);},[repo]);

  const allocations=useMemo(()=>allocateNrv(Math.max(0,Number(jointCost)||0),cuts),[jointCost,cuts]);
  const check=useMemo(()=>nrvAllocationCheck(Math.max(0,Number(jointCost)||0),allocations),[jointCost,allocations]);

  function addCut(){
    const weight=Number(kg),selling=Number(price),extra=Number(further);
    if(!cutName.trim()||!Number.isFinite(weight)||weight<=0||!Number.isFinite(selling)||selling<0){setMessage('أدخل اسم القطعية والوزن وسعر البيع الصافي.');return;}
    setCuts(rows=>[...rows,{id:crypto.randomUUID(),name:cutName.trim(),kg:weight,pricePerKgNet:selling,furtherCostNet:Number.isFinite(extra)?Math.max(0,extra):0}]);
    setCutName('');setKg('');setPrice('');setFurther('0');setMessage('');
  }

  async function saveCase(){
    const cost=Number(jointCost);
    if(!name.trim()||!Number.isFinite(cost)||cost<0||cuts.length===0){setMessage('أكمل اسم الحالة والتكلفة المشتركة والقطعيات.');return;}
    await repo.put({id:crypto.randomUUID(),name:name.trim(),jointCostNet:cost,cuts,createdAt:new Date().toISOString()});
    setCases(await repo.list());setName('');setJointCost('');setCuts([]);setMessage('تم حفظ حالة توزيع NRV.');
  }

  return <section className="nrv-panel sk-surface">
    <div className="nrv-panel__head"><div><span className="eyebrow">NRV Allocation</span><h3>تفكيك تكلفة الذبيحة بالقيمة القابلة للتحقق</h3></div><strong>{cases.length} حالة</strong></div>
    <div className="nrv-panel__form">
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم الحالة / الذبيحة"/>
      <input inputMode="decimal" value={jointCost} onChange={(e)=>setJointCost(e.target.value)} placeholder="التكلفة المشتركة بدون VAT"/>
      <input value={cutName} onChange={(e)=>setCutName(e.target.value)} placeholder="اسم القطعية"/>
      <input inputMode="decimal" value={kg} onChange={(e)=>setKg(e.target.value)} placeholder="كجم"/>
      <input inputMode="decimal" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="سعر البيع الصافي/كجم"/>
      <input inputMode="decimal" value={further} onChange={(e)=>setFurther(e.target.value)} placeholder="تكلفة إضافية"/>
      <button onClick={addCut}>إضافة قطعية</button>
      <button className="secondary" onClick={()=>void saveCase()}>حفظ الحالة</button>
    </div>
    {message?<p className="stock-message">{message}</p>:null}
    {allocations.length===0?<p className="stock-empty">أضف قطعيات لبدء توزيع التكلفة المشتركة.</p>:<>
      <div className="nrv-panel__kpis"><span>المخصص <b>{check.allocated.toLocaleString('en-US')}</b></span><span>الفرق <b>{check.difference.toLocaleString('en-US')}</b></span><span>الحالة <b>{check.balanced?'متزن':'راجع التقريب'}</b></span></div>
      <div className="stock-table-wrap"><table><thead><tr><th>القطعية</th><th>كجم</th><th>NRV</th><th>نسبة التوزيع</th><th>تكلفة مشتركة</th><th>تكلفة كلية</th><th>تكلفة/كجم</th><th></th></tr></thead><tbody>{allocations.map(row=><tr key={row.id}><td>{row.name}</td><td>{row.kg}</td><td>{row.nrv}</td><td>{(row.share*100).toFixed(2)}%</td><td>{row.allocatedJointCostNet}</td><td>{row.totalCostNet}</td><td>{row.costPerKgNet}</td><td><button onClick={()=>setCuts(current=>current.filter(cut=>cut.id!==row.id))}>×</button></td></tr>)}</tbody></table></div>
    </>}
  </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {buildStockPositions,type StockMovement,type StockMovementType} from './inventory-engine';
import './stock-workspace.css';

const STORAGE_KEY='skosif.v1.stock.movements';

export function StockWorkspace(){
  const [movements,setMovements]=useState<StockMovement[]>([]);
  const [itemId,setItemId]=useState('');
  const [type,setType]=useState<StockMovementType>('PURCHASE');
  const [quantity,setQuantity]=useState('');
  const [unitCost,setUnitCost]=useState('');
  const [message,setMessage]=useState('');

  const repo=useMemo(()=>new JsonStorageRepository<StockMovement & {id:string}>(window.localStorage,STORAGE_KEY),[]);
  useEffect(()=>{void repo.list().then(setMovements);},[repo]);
  const positions=useMemo(()=>buildStockPositions(movements),[movements]);

  async function addMovement(){
    const qty=Number(quantity);
    const cost=Number(unitCost);
    if(!itemId.trim()||!Number.isFinite(qty)||qty<=0){
      setMessage('أدخل صنفًا وكمية صحيحة.');
      return;
    }
    const movement:StockMovement={
      id:crypto.randomUUID(),
      itemId:itemId.trim(),
      date:new Date().toISOString().slice(0,10),
      type,
      quantity:qty,
      unitCost:Number.isFinite(cost)&&cost>=0?cost:undefined,
    };
    await repo.put(movement);
    setMovements(await repo.list());
    setItemId('');setQuantity('');setUnitCost('');setMessage('');
  }

  return <section className="stock-workspace">
    <div className="stock-kpis">
      <article className="sk-surface"><span>عدد الأصناف</span><strong className="sk-number">{positions.length}</strong></article>
      <article className="sk-surface"><span>إجمالي الوحدات المتاحة</span><strong className="sk-number">{positions.reduce((s,x)=>s+x.quantity,0).toLocaleString('en-US')}</strong></article>
      <article className="sk-surface"><span>أرصدة سالبة</span><strong className="sk-number">{positions.filter((x)=>x.quantity<0).length}</strong></article>
      <article className="sk-surface"><span>الحركات</span><strong className="sk-number">{movements.length}</strong></article>
    </div>
    <div className="stock-grid">
      <section className="sk-surface stock-form">
        <span className="eyebrow">Inventory Engine</span><h3>تسجيل حركة مخزون</h3>
        <label>الصنف<input value={itemId} onChange={(e)=>setItemId(e.target.value)} placeholder="SKU"/></label>
        <label>نوع الحركة<select value={type} onChange={(e)=>setType(e.target.value as StockMovementType)}><option value="PURCHASE">شراء</option><option value="SALE">بيع</option><option value="OPENING">رصيد افتتاحي</option><option value="ADJUSTMENT_IN">تسوية زيادة</option><option value="ADJUSTMENT_OUT">تسوية نقص</option></select></label>
        <label>الكمية<input inputMode="decimal" value={quantity} onChange={(e)=>setQuantity(e.target.value)}/></label>
        <label>تكلفة الوحدة - اختياري<input inputMode="decimal" value={unitCost} onChange={(e)=>setUnitCost(e.target.value)}/></label>
        <button onClick={()=>void addMovement()}>حفظ الحركة</button>
        {message?<p>{message}</p>:null}
      </section>
      <section className="sk-surface stock-table">
        <span className="eyebrow">الأرصدة</span><h3>المخزون حسب الصنف</h3>
        {positions.length===0?<p className="stock-empty">لا توجد حركات فعلية حتى الآن.</p>:<div className="stock-table-wrap"><table><thead><tr><th>الصنف</th><th>وارد</th><th>صادر</th><th>الرصيد</th><th>قيمة التكلفة المعروفة</th></tr></thead><tbody>{positions.map((row)=><tr key={row.itemId}><td>{row.itemId}</td><td>{row.inbound}</td><td>{row.outbound}</td><td data-negative={row.quantity<0}>{row.quantity}</td><td>{row.valueAtKnownCost.toLocaleString('en-US')}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </section>;
}

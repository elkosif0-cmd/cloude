import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {createCatalogItem,inspectCatalog,type CatalogItem,type ItemUnit} from './items-engine';

const UNIT_LABELS:Record<ItemUnit,string>={kg:'كجم',piece:'حبة',box:'كرتون',pack:'عبوة',other:'أخرى'};

export function ItemsPanel(){
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [sku,setSku]=useState('');
  const [name,setName]=useState('');
  const [unit,setUnit]=useState<ItemUnit>('kg');
  const [vat,setVat]=useState('15');
  const [cost,setCost]=useState('');
  const [price,setPrice]=useState('');
  const [message,setMessage]=useState('');

  const key=useMemo(()=>makeScopedKey('catalog.items',readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,key),[key]);
  useEffect(()=>{void repo.list().then(setItems);},[repo]);

  async function addItem(){
    const item=createCatalogItem({
      sku,
      name,
      unit,
      vatRate:(Number(vat)||0)/100,
      defaultCost:cost.trim()?Number(cost):undefined,
      defaultPrice:price.trim()?Number(price):undefined,
    });
    const issues=inspectCatalog([...items,item]).filter(x=>x.itemId===item.id);
    if(issues.length){
      setMessage('تعذر الحفظ: تحقق من SKU والأسعار والضريبة.');
      return;
    }
    await repo.put(item);
    setItems(await repo.list());
    setSku('');setName('');setCost('');setPrice('');
    setMessage('تم حفظ الصنف.');
  }

  return <section className="catalog-items sk-surface">
    <div className="catalog-items__head"><div><span className="eyebrow">Item Master</span><h3>الأصناف والكتالوج</h3></div><strong className="sk-number">{items.length}</strong></div>
    <div className="catalog-items__form">
      <input value={sku} onChange={(e)=>setSku(e.target.value)} placeholder="SKU"/>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم الصنف"/>
      <select value={unit} onChange={(e)=>setUnit(e.target.value as ItemUnit)}>{Object.entries(UNIT_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      <input inputMode="decimal" value={vat} onChange={(e)=>setVat(e.target.value)} placeholder="VAT %"/>
      <input inputMode="decimal" value={cost} onChange={(e)=>setCost(e.target.value)} placeholder="تكلفة افتراضية"/>
      <input inputMode="decimal" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="سعر افتراضي"/>
      <button onClick={()=>void addItem()}>إضافة صنف</button>
    </div>
    {message?<p className="catalog-message">{message}</p>:null}
    {items.length===0?<p className="catalog-empty">لا توجد أصناف مسجلة بعد.</p>:<div className="catalog-table"><table><thead><tr><th>SKU</th><th>الصنف</th><th>الوحدة</th><th>VAT</th><th>التكلفة</th><th>السعر</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td>{i.sku}</td><td>{i.name}</td><td>{UNIT_LABELS[i.unit]}</td><td>{Math.round(i.vatRate*100)}%</td><td>{i.defaultCost??'—'}</td><td>{i.defaultPrice??'—'}</td></tr>)}</tbody></table></div>}
  </section>;
}

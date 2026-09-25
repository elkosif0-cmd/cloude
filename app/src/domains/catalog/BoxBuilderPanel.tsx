import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {calculateBoxEconomics,validateBoxRecipe,type BoxLine,type BoxRecipe} from './box-engine';
import type {CatalogItem} from './items-engine';

export function BoxBuilderPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const boxRepo=useMemo(()=>new JsonStorageRepository<BoxRecipe>(window.localStorage,makeScopedKey('catalog.boxes',scope)),[scope]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [boxes,setBoxes]=useState<BoxRecipe[]>([]);
  const [name,setName]=useState('');
  const [lines,setLines]=useState<BoxLine[]>([]);
  const [itemId,setItemId]=useState('');
  const [quantity,setQuantity]=useState('1');
  const [sellingPrice,setSellingPrice]=useState('');
  const [vat,setVat]=useState('15');
  const [targetMargin,setTargetMargin]=useState('20');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([itemRepo.list(),boxRepo.list()]).then(([i,b])=>{setItems(i);setBoxes(b);});},[itemRepo,boxRepo]);

  const draft:BoxRecipe={id:'draft',name,lines,sellingPriceIncVat:Number(sellingPrice)||0,vatRate:(Number(vat)||0)/100,targetMarginPercent:Number(targetMargin)||0,active:true};
  const economics=useMemo(()=>calculateBoxEconomics(draft,items),[name,lines,sellingPrice,vat,targetMargin,items]);

  function addLine(){
    const qty=Number(quantity);
    if(!itemId||!Number.isFinite(qty)||qty<=0){setMessage('اختر الصنف وأدخل كمية صحيحة.');return;}
    setLines(current=>{
      const found=current.find(line=>line.itemId===itemId);
      return found?current.map(line=>line.itemId===itemId?{...line,quantity:line.quantity+qty}:line):[...current,{itemId,quantity:qty}];
    });
    setItemId('');setQuantity('1');setMessage('');
  }

  async function save(){
    const recipe:BoxRecipe={...draft,id:crypto.randomUUID(),name:name.trim()};
    const check=validateBoxRecipe(recipe);
    if(!check.valid){setMessage('أكمل اسم البوكس والسطور والسعر بصورة صحيحة.');return;}
    await boxRepo.put(recipe);
    setBoxes(await boxRepo.list());
    setName('');setLines([]);setSellingPrice('');
    setMessage('تم حفظ البوكس.');
  }

  async function remove(id:string){
    await boxRepo.remove(id);
    setBoxes(await boxRepo.list());
  }

  return <section className="box-builder sk-surface">
    <div className="box-builder__head"><div><span className="eyebrow">Box Builder</span><h3>بناء البوكس وتحليل ربحيته</h3></div><strong>{boxes.length} بوكس</strong></div>
    <div className="box-builder__layout">
      <section>
        <div className="box-builder__form">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم البوكس"/>
          <select value={itemId} onChange={(e)=>setItemId(e.target.value)}><option value="">اختر صنفًا</option>{items.map(item=><option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</select>
          <input inputMode="decimal" value={quantity} onChange={(e)=>setQuantity(e.target.value)} placeholder="الكمية"/>
          <button onClick={addLine}>إضافة للبوكس</button>
          <input inputMode="decimal" value={sellingPrice} onChange={(e)=>setSellingPrice(e.target.value)} placeholder="سعر البيع شامل الضريبة"/>
          <input inputMode="decimal" value={vat} onChange={(e)=>setVat(e.target.value)} placeholder="VAT %"/>
          <input inputMode="decimal" value={targetMargin} onChange={(e)=>setTargetMargin(e.target.value)} placeholder="هامش مستهدف %"/>
          <button className="secondary" onClick={()=>void save()}>حفظ البوكس</button>
        </div>
        <div className="box-lines">{lines.length===0?<p className="catalog-empty">أضف أصنافًا لتكوين البوكس.</p>:lines.map(line=>{
          const item=items.find(i=>i.id===line.itemId);
          return <article key={line.itemId}><div><b>{item?.name??line.itemId}</b><small>{item?.unit??'وحدة'}</small></div><span>{line.quantity}</span><button onClick={()=>setLines(current=>current.filter(row=>row.itemId!==line.itemId))}>×</button></article>;
        })}</div>
      </section>
      <section className="box-economics">
        <article><span>تكلفة البوكس بدون VAT</span><strong className="sk-number">{economics.totalCostExVat.toLocaleString('en-US')}</strong></article>
        <article><span>سعر البيع بدون VAT</span><strong className="sk-number">{economics.sellingPriceExVat.toLocaleString('en-US')}</strong></article>
        <article data-positive={economics.profitExVat>=0}><span>الربح</span><strong className="sk-number">{economics.profitExVat.toLocaleString('en-US')}</strong></article>
        <article data-positive={economics.marginPercent>=0}><span>الهامش</span><strong className="sk-number">{economics.marginPercent}%</strong></article>
        <article><span>أقل سعر للهامش المستهدف</span><strong className="sk-number">{economics.minimumPriceForTargetMarginIncVat.toLocaleString('en-US')}</strong></article>
        <article data-positive={economics.missingCostItems===0}><span>تكاليف ناقصة</span><strong>{economics.missingCostItems}</strong></article>
      </section>
    </div>
    {message?<p className="catalog-message">{message}</p>:null}
    {boxes.length>0?<div className="box-register">{boxes.map(box=>{
      const result=calculateBoxEconomics(box,items);
      return <article key={box.id}><div><b>{box.name}</b><small>{box.lines.length} مكوّن</small></div><span>تكلفة <b>{result.totalCostExVat.toLocaleString('en-US')}</b></span><span>بيع <b>{box.sellingPriceIncVat.toLocaleString('en-US')}</b></span><span>هامش <b>{result.marginPercent}%</b></span><button onClick={()=>void remove(box.id)}>حذف</button></article>;
    })}</div>:null}
  </section>;
}

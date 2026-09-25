import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from './items-engine';
import {canTransitionOffer,offerMargin,transitionOffer,validateOffer,type Offer,type OfferStatus} from './offers-engine';

export function OffersPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const offerRepo=useMemo(()=>new JsonStorageRepository<Offer>(window.localStorage,makeScopedKey('catalog.offers',scope)),[scope]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [offers,setOffers]=useState<Offer[]>([]);
  const [itemId,setItemId]=useState('');
  const [discount,setDiscount]=useState('10');
  const [startDate,setStartDate]=useState(new Date().toISOString().slice(0,10));
  const [endDate,setEndDate]=useState('');
  const [note,setNote]=useState('');
  const [actor,setActor]=useState('المستخدم الحالي');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([itemRepo.list(),offerRepo.list()]).then(([i,o])=>{setItems(i);setOffers(o);});},[itemRepo,offerRepo]);

  async function create(){
    const offer:Offer={id:crypto.randomUUID(),itemId,discountRate:(Number(discount)||0)/100,startDate,endDate,status:'DRAFT',createdBy:actor.trim()||undefined,note:note.trim()||undefined};
    const check=validateOffer(offer);
    if(!check.valid){setMessage('تحقق من الصنف ونسبة الخصم وتواريخ العرض.');return;}
    await offerRepo.put(offer);
    setOffers(await offerRepo.list());
    setItemId('');setDiscount('10');setEndDate('');setNote('');
    setMessage('تم إنشاء عرض كمسودة.');
  }

  async function move(offer:Offer,to:OfferStatus){
    try{
      await offerRepo.put(transitionOffer(offer,to,actor.trim()||undefined));
      setOffers(await offerRepo.list());
      setMessage('تم تحديث حالة العرض.');
    }catch(error){setMessage(String(error));}
  }

  return <section className="catalog-offers sk-surface">
    <div className="catalog-offers__head"><div><span className="eyebrow">Offer Governance</span><h3>العروض واعتماد الأسعار</h3></div><strong>{offers.filter(o=>o.status==='APPROVED').length} معتمد</strong></div>
    <div className="catalog-offers__form">
      <select value={itemId} onChange={(e)=>setItemId(e.target.value)}><option value="">اختر الصنف</option>{items.map(item=><option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</select>
      <input inputMode="decimal" value={discount} onChange={(e)=>setDiscount(e.target.value)} placeholder="خصم %"/>
      <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)}/>
      <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)}/>
      <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="ملاحظة"/>
      <input value={actor} onChange={(e)=>setActor(e.target.value)} placeholder="المنشئ/المعتمد"/>
      <button onClick={()=>void create()}>إنشاء عرض</button>
    </div>
    {message?<p className="catalog-message">{message}</p>:null}
    {offers.length===0?<p className="catalog-empty">لا توجد عروض بعد.</p>:<div className="catalog-offers__list">{offers.map(offer=>{
      const item=items.find(i=>i.id===offer.itemId);
      const economics=offerMargin({basePrice:item?.defaultPrice??0,discountRate:offer.discountRate,cost:item?.defaultCost??0});
      return <article key={offer.id} data-warning={economics.belowCost}>
        <div><b>{item?.name??offer.itemId}</b><small>{Math.round(offer.discountRate*10000)/100}% · {offer.startDate||'بدون تاريخ'} → {offer.endDate||'بدون تاريخ'}</small></div>
        <div><span>سعر العرض</span><strong className="sk-number">{economics.price.toLocaleString('en-US')}</strong><small>هامش {economics.marginPercent}%</small></div>
        <span className="offer-status" data-status={offer.status}>{offer.status}</span>
        <div className="offer-actions">
          {(['DRAFT','PENDING','APPROVED','REJECTED'] as OfferStatus[]).filter(status=>canTransitionOffer(offer.status,status)).map(status=><button key={status} onClick={()=>void move(offer,status)}>{status==='PENDING'?'إرسال للاعتماد':status==='APPROVED'?'اعتماد':status==='REJECTED'?'رفض':'إعادة لمسودة'}</button>)}
        </div>
      </article>;
    })}</div>}
  </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import {calculateBlend,validateBlend,type BlendRecipe} from './blending-engine';

type CulinaryGuide={
  id:string;
  itemId?:string;
  title:string;
  method:string;
  targetTemperature?:string;
  timeGuide?:string;
  notes?:string;
  active:boolean;
};

export function ProductionToolsPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const blendRepo=useMemo(()=>new JsonStorageRepository<BlendRecipe>(window.localStorage,makeScopedKey('stock.blend-recipes',scope)),[scope]);
  const culinaryRepo=useMemo(()=>new JsonStorageRepository<CulinaryGuide>(window.localStorage,makeScopedKey('stock.culinary-guides',scope)),[scope]);

  const [items,setItems]=useState<CatalogItem[]>([]);
  const [recipes,setRecipes]=useState<BlendRecipe[]>([]);
  const [guides,setGuides]=useState<CulinaryGuide[]>([]);

  const [name,setName]=useState('');
  const [leanItemId,setLeanItemId]=useState('');
  const [fatItemId,setFatItemId]=useState('');
  const [leanKg,setLeanKg]=useState('');
  const [fatKg,setFatKg]=useState('');
  const [leanCost,setLeanCost]=useState('');
  const [fatCost,setFatCost]=useState('');
  const [spicesCost,setSpicesCost]=useState('0');
  const [packagingCost,setPackagingCost]=useState('0');
  const [shrink,setShrink]=useState('5');
  const [pieceGrams,setPieceGrams]=useState('100');
  const [margin,setMargin]=useState('30');

  const [guideItemId,setGuideItemId]=useState('');
  const [guideTitle,setGuideTitle]=useState('');
  const [method,setMethod]=useState('');
  const [temperature,setTemperature]=useState('');
  const [timeGuide,setTimeGuide]=useState('');
  const [notes,setNotes]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([itemRepo.list(),blendRepo.list(),culinaryRepo.list()]).then(([i,b,g])=>{setItems(i);setRecipes(b);setGuides(g);});},[itemRepo,blendRepo,culinaryRepo]);

  function selectLean(id:string){
    setLeanItemId(id);
    const item=items.find(row=>row.id===id);
    if(item?.defaultCost!==undefined)setLeanCost(String(item.defaultCost));
  }
  function selectFat(id:string){
    setFatItemId(id);
    const item=items.find(row=>row.id===id);
    if(item?.defaultCost!==undefined)setFatCost(String(item.defaultCost));
  }

  const draft:BlendRecipe={
    id:'draft',name,leanItemId:leanItemId||undefined,fatItemId:fatItemId||undefined,
    leanKg:Number(leanKg)||0,fatKg:Number(fatKg)||0,leanCostPerKg:Number(leanCost)||0,fatCostPerKg:Number(fatCost)||0,
    spicesCost:Number(spicesCost)||0,packagingCost:Number(packagingCost)||0,shrinkPercent:Number(shrink)||0,
    pieceGrams:Number(pieceGrams)||0,targetMarginPercent:Number(margin)||0,
  };
  const economics=useMemo(()=>calculateBlend(draft),[name,leanItemId,fatItemId,leanKg,fatKg,leanCost,fatCost,spicesCost,packagingCost,shrink,pieceGrams,margin]);

  async function saveBlend(){
    const recipe={...draft,id:crypto.randomUUID(),name:name.trim()};
    if(!validateBlend(recipe).valid){setMessage('راجع اسم الوصفة والأوزان والتكاليف ونسب الهدر والهامش.');return;}
    await blendRepo.put(recipe);
    setRecipes(await blendRepo.list());
    setName('');setLeanItemId('');setFatItemId('');setLeanKg('');setFatKg('');
    setMessage('تم حفظ وصفة الخلطة.');
  }

  async function saveGuide(){
    if(!guideTitle.trim()||!method.trim()){setMessage('أدخل عنوان دليل الطهي والطريقة.');return;}
    await culinaryRepo.put({
      id:crypto.randomUUID(),itemId:guideItemId||undefined,title:guideTitle.trim(),method:method.trim(),
      targetTemperature:temperature.trim()||undefined,timeGuide:timeGuide.trim()||undefined,notes:notes.trim()||undefined,active:true,
    });
    setGuides(await culinaryRepo.list());
    setGuideItemId('');setGuideTitle('');setMethod('');setTemperature('');setTimeGuide('');setNotes('');
    setMessage('تم حفظ دليل الطهي الداخلي.');
  }

  return <section className="production-tools sk-surface">
    <div className="production-tools__head"><div><span className="eyebrow">Blending + Culinary</span><h3>خلطات اللحوم ودليل الشيف</h3></div><strong>{recipes.length} وصفة · {guides.length} دليل</strong></div>
    <div className="production-tools__grid">
      <section>
        <h4>حاسبة الخلطة</h4>
        <div className="production-tools__form">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم الوصفة"/>
          <select value={leanItemId} onChange={(e)=>selectLean(e.target.value)}><option value="">مكوّن الهبر</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select>
          <input inputMode="decimal" value={leanKg} onChange={(e)=>setLeanKg(e.target.value)} placeholder="هبر كجم"/>
          <input inputMode="decimal" value={leanCost} onChange={(e)=>setLeanCost(e.target.value)} placeholder="تكلفة كجم الهبر"/>
          <select value={fatItemId} onChange={(e)=>selectFat(e.target.value)}><option value="">مكوّن الدهن</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select>
          <input inputMode="decimal" value={fatKg} onChange={(e)=>setFatKg(e.target.value)} placeholder="دهن كجم"/>
          <input inputMode="decimal" value={fatCost} onChange={(e)=>setFatCost(e.target.value)} placeholder="تكلفة كجم الدهن"/>
          <input inputMode="decimal" value={spicesCost} onChange={(e)=>setSpicesCost(e.target.value)} placeholder="توابل"/>
          <input inputMode="decimal" value={packagingCost} onChange={(e)=>setPackagingCost(e.target.value)} placeholder="تغليف"/>
          <input inputMode="decimal" value={shrink} onChange={(e)=>setShrink(e.target.value)} placeholder="هدر %"/>
          <input inputMode="decimal" value={pieceGrams} onChange={(e)=>setPieceGrams(e.target.value)} placeholder="وزن القطعة جم"/>
          <input inputMode="decimal" value={margin} onChange={(e)=>setMargin(e.target.value)} placeholder="هامش %"/>
          <button onClick={()=>void saveBlend()}>حفظ الوصفة</button>
        </div>
        <div className="production-tools__economics">
          <span>هبر <b>{economics.leanPercent}%</b></span><span>دهن <b>{economics.fatPercent}%</b></span>
          <span>صافي الإنتاج <b>{economics.netYieldKg} كجم</b></span><span>تكلفة الكيلو <b>{economics.costPerKg}</b></span>
          <span>عدد القطع <b>{economics.pieces}</b></span><span>سعر القطعة المقترح <b>{economics.suggestedPricePerPiece}</b></span>
          <span>الربح المتوقع <b>{economics.expectedProfit}</b></span>
        </div>
      </section>

      <section>
        <h4>دليل الشيف الداخلي</h4>
        <div className="production-tools__form culinary">
          <select value={guideItemId} onChange={(e)=>setGuideItemId(e.target.value)}><option value="">الصنف - اختياري</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select>
          <input value={guideTitle} onChange={(e)=>setGuideTitle(e.target.value)} placeholder="عنوان الدليل"/>
          <input value={method} onChange={(e)=>setMethod(e.target.value)} placeholder="طريقة الطهي"/>
          <input value={temperature} onChange={(e)=>setTemperature(e.target.value)} placeholder="درجة الحرارة المستهدفة"/>
          <input value={timeGuide} onChange={(e)=>setTimeGuide(e.target.value)} placeholder="الوقت الإرشادي"/>
          <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="ملاحظات"/>
          <button onClick={()=>void saveGuide()}>حفظ الدليل</button>
        </div>
        <div className="production-tools__guides">{guides.slice().reverse().slice(0,12).map(guide=><article key={guide.id}><div><b>{guide.title}</b><small>{items.find(i=>i.id===guide.itemId)?.name??'دليل عام'}</small></div><span>{guide.method}</span><span>{[guide.targetTemperature,guide.timeGuide].filter(Boolean).join(' · ')||'—'}</span><small>{guide.notes??''}</small></article>)}</div>
      </section>
    </div>
    {message?<p className="stock-message">{message}</p>:null}
    <p className="production-tools__note">دليل الشيف محتوى تشغيلي يضيفه فريقك، وليس مرجع سلامة غذاء تلقائيًا.</p>
  </section>;
}

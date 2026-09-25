import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {calculateCatering,validateCateringQuote,type CateringProfile,type CateringQuote} from './catering-engine';
import type {Customer} from './customers-engine';

const PROFILE_LABELS:Record<CateringProfile,string>={
  bbq:'شواء — 450 جم/ضيف',
  family:'عائلي — 350 جم/ضيف',
  formal:'رسمي — 500 جم/ضيف',
  keto:'بروتين — 300 جم/ضيف',
  custom:'مخصص',
};

export function CateringPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const customerRepo=useMemo(()=>new JsonStorageRepository<Customer>(window.localStorage,makeScopedKey('sales.customers',scope)),[scope]);
  const quoteRepo=useMemo(()=>new JsonStorageRepository<CateringQuote>(window.localStorage,makeScopedKey('sales.catering-quotes',scope)),[scope]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [quotes,setQuotes]=useState<CateringQuote[]>([]);
  const [title,setTitle]=useState('');
  const [customerId,setCustomerId]=useState('');
  const [guests,setGuests]=useState('25');
  const [profile,setProfile]=useState<CateringProfile>('bbq');
  const [customGrams,setCustomGrams]=useState('400');
  const [meatCost,setMeatCost]=useState('');
  const [margin,setMargin]=useState('35');
  const [vat,setVat]=useState('15');
  const [marinated,setMarinated]=useState(true);
  const [marinationCost,setMarinationCost]=useState('6');
  const [toolsPack,setToolsPack]=useState(true);
  const [toolsCost,setToolsCost]=useState('4');
  const [notes,setNotes]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([customerRepo.list(),quoteRepo.list()]).then(([c,q])=>{setCustomers(c);setQuotes(q);});},[customerRepo,quoteRepo]);

  const customer=customers.find(row=>row.id===customerId);
  const draft:CateringQuote={
    id:'draft',title,customerId:customerId||undefined,customerName:customer?.name,customerPhone:customer?.phone,
    guests:Number(guests)||0,profile,gramsPerGuest:profile==='custom'?Number(customGrams)||0:undefined,
    meatCostPerKg:Number(meatCost)||0,marginPercent:Number(margin)||0,vatRate:(Number(vat)||0)/100,
    marinated,marinationCostPerKg:Number(marinationCost)||0,toolsPack,toolsCostPerGuest:Number(toolsCost)||0,
    notes:notes.trim()||undefined,createdAt:new Date().toISOString(),
  };
  const economics=useMemo(()=>calculateCatering(draft),[title,customerId,guests,profile,customGrams,meatCost,margin,vat,marinated,marinationCost,toolsPack,toolsCost,notes]);

  async function save(){
    const quote={...draft,id:crypto.randomUUID(),title:title.trim(),createdAt:new Date().toISOString()};
    if(!validateCateringQuote(quote).valid){setMessage('راجع اسم المناسبة وعدد الضيوف والتكلفة والهامش.');return;}
    await quoteRepo.put(quote);
    setQuotes(await quoteRepo.list());
    setTitle('');setCustomerId('');setNotes('');
    setMessage('تم حفظ عرض المناسبة.');
  }

  function quotationText(quote:CateringQuote){
    const x=calculateCatering(quote);
    return [
      'عرض سعر مناسبة — S.kosif',
      'المناسبة: '+quote.title,
      quote.customerName?'العميل: '+quote.customerName:'',
      'عدد الضيوف: '+quote.guests,
      'اللحم التقديري: '+x.totalRawKg.toFixed(2)+' كجم',
      'التجهيز: '+(quote.marinated?'مع تتبيل':'بدون تتبيل')+' · '+(quote.toolsPack?'يشمل مستلزمات':'بدون مستلزمات'),
      'السعر قبل الضريبة: '+x.targetPriceExVat.toFixed(2)+' ر.س',
      'الضريبة: '+x.vat.toFixed(2)+' ر.س',
      'الإجمالي: '+x.finalPriceIncVat.toFixed(2)+' ر.س',
      'للفرد: '+x.pricePerGuestIncVat.toFixed(2)+' ر.س',
      quote.notes?'ملاحظات: '+quote.notes:'',
    ].filter(Boolean).join('\n');
  }

  async function copyQuote(quote:CateringQuote){
    try{await navigator.clipboard.writeText(quotationText(quote));setMessage('تم نسخ عرض السعر.');}
    catch{setMessage('تعذر النسخ التلقائي على هذا المتصفح.');}
  }

  function whatsapp(quote:CateringQuote){
    const phone=(quote.customerPhone??'').replace(/\D/g,'');
    const normalized=phone.startsWith('05')?'966'+phone.slice(1):phone;
    window.open('https://wa.me/'+normalized+'?text='+encodeURIComponent(quotationText(quote)),'_blank','noopener,noreferrer');
  }

  return <section className="catering-panel sk-surface">
    <div className="catering-panel__head"><div><span className="eyebrow">Catering & Events</span><h3>تسعير المناسبات وعروض الأسعار</h3></div><strong>{quotes.length} عرض</strong></div>
    <div className="catering-panel__layout">
      <section className="catering-panel__form">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="اسم المناسبة"/>
        <select value={customerId} onChange={(e)=>setCustomerId(e.target.value)}><option value="">العميل — اختياري</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input inputMode="numeric" value={guests} onChange={(e)=>setGuests(e.target.value)} placeholder="عدد الضيوف"/>
        <select value={profile} onChange={(e)=>setProfile(e.target.value as CateringProfile)}>{Object.entries(PROFILE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
        {profile==='custom'?<input inputMode="decimal" value={customGrams} onChange={(e)=>setCustomGrams(e.target.value)} placeholder="جرام/ضيف"/>:null}
        <input inputMode="decimal" value={meatCost} onChange={(e)=>setMeatCost(e.target.value)} placeholder="تكلفة اللحم/كجم"/>
        <input inputMode="decimal" value={margin} onChange={(e)=>setMargin(e.target.value)} placeholder="هامش %"/>
        <input inputMode="decimal" value={vat} onChange={(e)=>setVat(e.target.value)} placeholder="VAT %"/>
        <label><input type="checkbox" checked={marinated} onChange={(e)=>setMarinated(e.target.checked)}/>تتبيل</label>
        <input inputMode="decimal" value={marinationCost} onChange={(e)=>setMarinationCost(e.target.value)} placeholder="تكلفة التتبيل/كجم"/>
        <label><input type="checkbox" checked={toolsPack} onChange={(e)=>setToolsPack(e.target.checked)}/>مستلزمات</label>
        <input inputMode="decimal" value={toolsCost} onChange={(e)=>setToolsCost(e.target.value)} placeholder="مستلزمات/ضيف"/>
        <input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="ملاحظات"/>
        <button onClick={()=>void save()}>حفظ عرض السعر</button>
      </section>
      <section className="catering-panel__economics">
        <article><span>جرام/ضيف</span><strong>{economics.gramsPerGuest}</strong></article>
        <article><span>اللحم المطلوب</span><strong>{economics.totalRawKg} كجم</strong></article>
        <article><span>التكلفة</span><strong>{economics.totalCostExVat.toLocaleString('en-US')}</strong></article>
        <article><span>الربح المتوقع</span><strong>{economics.expectedProfitExVat.toLocaleString('en-US')}</strong></article>
        <article><span>الإجمالي شامل VAT</span><strong>{economics.finalPriceIncVat.toLocaleString('en-US')}</strong></article>
        <article><span>سعر الضيف</span><strong>{economics.pricePerGuestIncVat.toLocaleString('en-US')}</strong></article>
      </section>
    </div>
    {message?<p className="sales-message">{message}</p>:null}
    {quotes.length>0?<div className="catering-register">{quotes.slice().reverse().map(quote=>{
      const x=calculateCatering(quote);
      return <article key={quote.id}><div><b>{quote.title}</b><small>{quote.customerName??'بدون عميل'} · {new Date(quote.createdAt).toLocaleString('ar-SA')}</small></div><span>{quote.guests} ضيف</span><span>{x.totalRawKg} كجم</span><strong>{x.finalPriceIncVat.toLocaleString('en-US')}</strong><div><button onClick={()=>void copyQuote(quote)}>نسخ</button>{quote.customerPhone?<button onClick={()=>whatsapp(quote)}>واتساب</button>:null}</div></article>;
    })}</div>:null}
  </section>;
}

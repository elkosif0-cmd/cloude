import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {agingEconomics,butcherYield,type AgingPiece,type AgingType,type ButcherShift} from './production-engine';

export function MeatOperationsPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const shiftRepo=useMemo(()=>new JsonStorageRepository<ButcherShift>(window.localStorage,makeScopedKey('stock.butcher-shifts',scope)),[scope]);
  const agingRepo=useMemo(()=>new JsonStorageRepository<AgingPiece>(window.localStorage,makeScopedKey('stock.aging-pieces',scope)),[scope]);
  const [shifts,setShifts]=useState<ButcherShift[]>([]);
  const [pieces,setPieces]=useState<AgingPiece[]>([]);
  const [butcher,setButcher]=useState('');
  const [carcassTag,setCarcassTag]=useState('');
  const [hangingKg,setHangingKg]=useState('');
  const [primeKg,setPrimeKg]=useState('');
  const [boneKg,setBoneKg]=useState('');
  const [fatKg,setFatKg]=useState('');
  const [wasteKg,setWasteKg]=useState('');
  const [tag,setTag]=useState('');
  const [cut,setCut]=useState('');
  const [agingType,setAgingType]=useState<AgingType>('dry');
  const [rawKg,setRawKg]=useState('');
  const [rawCostKg,setRawCostKg]=useState('');
  const [targetDays,setTargetDays]=useState('30');
  const [marginPercent,setMarginPercent]=useState('35');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([shiftRepo.list(),agingRepo.list()]).then(([s,a])=>{setShifts(s);setPieces(a);});},[shiftRepo,agingRepo]);

  async function addShift(){
    const shift:ButcherShift={
      id:crypto.randomUUID(),butcher:butcher.trim()||'قصاب',carcassTag:carcassTag.trim()||('TAG-'+Date.now()),
      hangingKg:Number(hangingKg)||0,primeKg:Number(primeKg)||0,boneKg:Number(boneKg)||0,fatKg:Number(fatKg)||0,wasteKg:Number(wasteKg)||0,
      date:new Date().toISOString().slice(0,10),
    };
    if(shift.hangingKg<=0||shift.primeKg<=0){setMessage('أدخل الوزن المعلق واللحم الصافي.');return;}
    await shiftRepo.put(shift);setShifts(await shiftRepo.list());
    setCarcassTag('');setHangingKg('');setPrimeKg('');setBoneKg('');setFatKg('');setWasteKg('');
    setMessage('تم تسجيل وردية التشفية.');
  }

  async function addAging(){
    const piece:AgingPiece={
      id:crypto.randomUUID(),tag:tag.trim()||('AG-'+Date.now()),cut:cut.trim()||'قطعة معتقة',type:agingType,
      rawKg:Number(rawKg)||0,rawCostKg:Number(rawCostKg)||0,entryDate:new Date().toISOString().slice(0,10),
      targetDays:Number(targetDays)||30,marginPercent:Number(marginPercent)||35,status:'ACTIVE',
    };
    if(piece.rawKg<=0||piece.rawCostKg<0){setMessage('أدخل وزنًا وتكلفة صحيحة.');return;}
    await agingRepo.put(piece);setPieces(await agingRepo.list());
    setTag('');setCut('');setRawKg('');setRawCostKg('');setMessage('تم تسكين القطعة في غرفة التعتيق.');
  }

  async function finish(piece:AgingPiece){
    const value=window.prompt('الوزن الصافي الفعلي بعد التعتيق والتشفية (كجم):',String(agingEconomics(piece).usableKg));
    if(value===null)return;
    const finalUsableKg=Number(value);
    if(!Number.isFinite(finalUsableKg)||finalUsableKg<=0){setMessage('وزن غير صالح.');return;}
    await agingRepo.put({...piece,status:'DONE',finalUsableKg,finishDate:new Date().toISOString().slice(0,10)});
    setPieces(await agingRepo.list());setMessage('تم إنهاء القطعة وتثبيت الوزن الفعلي.');
  }

  const averageYield=shifts.length?shifts.reduce((sum,s)=>sum+butcherYield(s).yieldPercent,0)/shifts.length:0;
  const activeAging=pieces.filter(p=>p.status==='ACTIVE').length;

  return <section className="meat-operations sk-surface">
    <div className="meat-operations__head"><div><span className="eyebrow">Meat Operations</span><h3>التشفية وغرفة التعتيق</h3></div><strong>{averageYield.toFixed(1)}% متوسط Yield</strong></div>
    <div className="meat-operations__kpis"><span>ورديات تشفية <b>{shifts.length}</b></span><span>قطع تعتيق نشطة <b>{activeAging}</b></span><span>إجمالي قطع التعتيق <b>{pieces.length}</b></span></div>

    <div className="meat-operations__grid">
      <section>
        <h4>تسجيل تشفية ذبيحة</h4>
        <div className="meat-operations__form">
          <input value={butcher} onChange={(e)=>setButcher(e.target.value)} placeholder="اسم القصاب"/>
          <input value={carcassTag} onChange={(e)=>setCarcassTag(e.target.value)} placeholder="رقم الذبيحة"/>
          <input inputMode="decimal" value={hangingKg} onChange={(e)=>setHangingKg(e.target.value)} placeholder="الوزن المعلق"/>
          <input inputMode="decimal" value={primeKg} onChange={(e)=>setPrimeKg(e.target.value)} placeholder="اللحم الصافي"/>
          <input inputMode="decimal" value={boneKg} onChange={(e)=>setBoneKg(e.target.value)} placeholder="العظم"/>
          <input inputMode="decimal" value={fatKg} onChange={(e)=>setFatKg(e.target.value)} placeholder="الشحم"/>
          <input inputMode="decimal" value={wasteKg} onChange={(e)=>setWasteKg(e.target.value)} placeholder="الهدر"/>
          <button onClick={()=>void addShift()}>حفظ التشفية</button>
        </div>
        <div className="meat-operations__list">{shifts.slice().reverse().slice(0,15).map(shift=>{
          const metrics=butcherYield(shift);
          return <article key={shift.id} data-balanced={metrics.balanced}><div><b>{shift.carcassTag}</b><small>{shift.butcher} · {shift.date}</small></div><span>صافي {shift.primeKg} كجم</span><strong>{metrics.yieldPercent}%</strong><small>{metrics.balanced?'متزن':'فرق '+metrics.unaccountedKg+' كجم'}</small></article>;
        })}</div>
      </section>

      <section>
        <h4>غرفة التعتيق</h4>
        <div className="meat-operations__form aging">
          <input value={tag} onChange={(e)=>setTag(e.target.value)} placeholder="Tag ID"/>
          <input value={cut} onChange={(e)=>setCut(e.target.value)} placeholder="القطعية"/>
          <select value={agingType} onChange={(e)=>setAgingType(e.target.value as AgingType)}><option value="dry">Dry Aging</option><option value="umai">UMAi</option><option value="wet">Wet Aging</option></select>
          <input inputMode="decimal" value={rawKg} onChange={(e)=>setRawKg(e.target.value)} placeholder="الوزن الأولي"/>
          <input inputMode="decimal" value={rawCostKg} onChange={(e)=>setRawCostKg(e.target.value)} placeholder="تكلفة الكيلو"/>
          <input inputMode="decimal" value={targetDays} onChange={(e)=>setTargetDays(e.target.value)} placeholder="الأيام المستهدفة"/>
          <input inputMode="decimal" value={marginPercent} onChange={(e)=>setMarginPercent(e.target.value)} placeholder="الهامش %"/>
          <button onClick={()=>void addAging()}>إدخال للتعتيق</button>
        </div>
        <div className="meat-operations__list">{pieces.slice().reverse().slice(0,15).map(piece=>{
          const metrics=agingEconomics(piece);
          return <article key={piece.id}><div><b>{piece.tag}</b><small>{piece.cut} · {piece.type}</small></div><span>{metrics.progress}% · {metrics.usableKg} كجم</span><strong>{metrics.suggestedPriceKg.toLocaleString('en-US')}</strong>{piece.status==='ACTIVE'?<button onClick={()=>void finish(piece)}>إنهاء</button>:<small>مكتمل</small>}</article>;
        })}</div>
      </section>
    </div>
    {message?<p className="stock-message">{message}</p>:null}
  </section>;
}

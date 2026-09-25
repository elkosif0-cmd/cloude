import {useEffect,useMemo,useRef,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from './items-engine';
import {code128SvgData,createScaleLabel,decodeScaleBarcode,scaleLabelPrintHtml,type ScaleLabel} from './label-engine';

type ScanResult={rawValue:string};

export function LabelScannerPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const labelRepo=useMemo(()=>new JsonStorageRepository<ScaleLabel>(window.localStorage,makeScopedKey('catalog.scale-labels',scope)),[scope]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [labels,setLabels]=useState<ScaleLabel[]>([]);
  const [itemId,setItemId]=useState('');
  const [lot,setLot]=useState('');
  const [weight,setWeight]=useState('');
  const [unitPrice,setUnitPrice]=useState('');
  const [packDate,setPackDate]=useState(new Date().toISOString().slice(0,10));
  const [expiryDate,setExpiryDate]=useState('');
  const [origin,setOrigin]=useState('');
  const [manualBarcode,setManualBarcode]=useState('');
  const [scanValue,setScanValue]=useState('');
  const [message,setMessage]=useState('');
  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const timerRef=useRef<number|null>(null);

  useEffect(()=>{void Promise.all([itemRepo.list(),labelRepo.list()]).then(([i,l])=>{setItems(i);setLabels(l);});},[itemRepo,labelRepo]);
  useEffect(()=>()=>stopScanner(),[]);

  const selectedItem=items.find(item=>item.id===itemId)??null;
  const currentPreview=useMemo(()=>{
    if(!selectedItem||!(Number(weight)>0))return null;
    try{
      return createScaleLabel({
        itemId:selectedItem.id,
        itemName:selectedItem.name,
        lot:lot.trim()||undefined,
        weightKg:Number(weight),
        unitPriceIncVat:Number(unitPrice)||0,
        packDate,
        expiryDate:expiryDate||packDate,
        origin:origin.trim()||undefined,
      });
    }catch{return null;}
  },[selectedItem,lot,weight,unitPrice,packDate,expiryDate,origin]);

  function selectItem(id:string){
    setItemId(id);
    const item=items.find(row=>row.id===id);
    if(item?.defaultPrice!==undefined)setUnitPrice(String(item.defaultPrice));
  }

  async function saveLabel(){
    if(!selectedItem||!expiryDate){setMessage('اختر الصنف وتاريخ الانتهاء.');return;}
    try{
      const label=createScaleLabel({
        itemId:selectedItem.id,itemName:selectedItem.name,lot:lot.trim()||undefined,
        weightKg:Number(weight),unitPriceIncVat:Number(unitPrice)||0,packDate,expiryDate,
        origin:origin.trim()||undefined,
      });
      await labelRepo.put(label);
      setLabels(await labelRepo.list());
      setMessage('تم حفظ الملصق وأصبح الباركود مرتبطًا بالصنف واللوت.');
    }catch(error){setMessage(String(error));}
  }

  function printLabel(label:ScaleLabel){
    const popup=window.open('','_blank','noopener,noreferrer,width=520,height=520');
    if(!popup){setMessage('تعذر فتح نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.');return;}
    popup.document.open();
    popup.document.write(scaleLabelPrintHtml(label,'أغنام الوادي · S.kosif'));
    popup.document.close();
  }

  function onScan(value:string){
    const raw=value.trim();
    if(!raw)return;
    setScanValue(raw);
    setManualBarcode(raw);
    const label=labels.find(row=>row.barcode===raw);
    if(label)setMessage('تم التعرف على ملصق محفوظ: '+label.itemName+(label.lot?' · '+label.lot:''));
    else{
      const decoded=decodeScaleBarcode(raw);
      setMessage(decoded?'باركود ميزان معروف: وزن '+decoded.weightKg.toFixed(3)+' كجم · سعر صحيح '+decoded.unitPriceWhole+' ر.س. لم يتم العثور على سجل ملصق مطابق.':'تمت قراءة الرمز، لكنه غير موجود ضمن الملصقات المحفوظة.');
    }
  }

  function stopScanner(){
    if(timerRef.current!==null){window.clearInterval(timerRef.current);timerRef.current=null;}
    streamRef.current?.getTracks().forEach(track=>track.stop());
    streamRef.current=null;
    if(videoRef.current)videoRef.current.srcObject=null;
  }

  async function startScanner(){
    stopScanner();
    if(!navigator.mediaDevices?.getUserMedia){setMessage('الكاميرا غير مدعومة في هذا المتصفح. استخدم الإدخال اليدوي.');return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      const Detector=(window as any).BarcodeDetector;
      if(!Detector){setMessage('الكاميرا تعمل، لكن BarcodeDetector غير متاح. استخدم الإدخال اليدوي على هذا الجهاز.');return;}
      const detector=new Detector({formats:['code_128','ean_13','qr_code']});
      timerRef.current=window.setInterval(async()=>{
        if(!videoRef.current||!streamRef.current)return;
        try{
          const codes:ScanResult[]=await detector.detect(videoRef.current);
          if(codes[0]?.rawValue){onScan(codes[0].rawValue);stopScanner();}
        }catch{}
      },350);
      setMessage('الكاميرا تعمل — وجّهها نحو الباركود.');
    }catch(error){setMessage('تعذر تشغيل الكاميرا: '+String(error));}
  }

  const previewBarcode=currentPreview?code128SvgData(currentPreview.barcode,30):null;
  const scannedLabel=labels.find(row=>row.barcode===scanValue)??null;

  return <section className="label-scanner sk-surface">
    <div className="label-scanner__head"><div><span className="eyebrow">Scale Labels + Scanner</span><h3>ملصقات الموازين والباركود</h3></div><strong>{labels.length} ملصق</strong></div>
    <div className="label-scanner__grid">
      <section className="label-builder">
        <div className="label-builder__form">
          <select value={itemId} onChange={(e)=>selectItem(e.target.value)}><option value="">اختر الصنف</option>{items.map(item=><option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</select>
          <input value={lot} onChange={(e)=>setLot(e.target.value)} placeholder="LOT / رقم الدفعة"/>
          <input inputMode="decimal" value={weight} onChange={(e)=>setWeight(e.target.value)} placeholder="الوزن كجم"/>
          <input inputMode="decimal" value={unitPrice} onChange={(e)=>setUnitPrice(e.target.value)} placeholder="سعر الكيلو شامل الضريبة"/>
          <input type="date" value={packDate} onChange={(e)=>setPackDate(e.target.value)}/>
          <input type="date" value={expiryDate} onChange={(e)=>setExpiryDate(e.target.value)}/>
          <input value={origin} onChange={(e)=>setOrigin(e.target.value)} placeholder="المصدر / المسلخ"/>
        </div>
        <div className="label-builder__actions"><button onClick={()=>void saveLabel()}>حفظ الملصق</button>{currentPreview?<button className="secondary" onClick={()=>printLabel(currentPreview)}>طباعة 60×40</button>:null}</div>
        {currentPreview&&previewBarcode?<div className="scale-label-preview">
          <div className="scale-label-preview__brand"><b>أغنام الوادي · S.kosif</b><span>{currentPreview.lot??'—'}</span></div>
          <h4>{currentPreview.itemName}</h4>
          <div><span>الوزن <b>{currentPreview.weightKg.toFixed(3)} كجم</b></span><span>سعر الكيلو <b>{currentPreview.unitPriceIncVat.toFixed(2)}</b></span></div>
          <strong>{currentPreview.totalIncVat.toFixed(2)} ر.س</strong>
          <svg viewBox={'0 0 '+previewBarcode.width+' '+(previewBarcode.height+13)} aria-label={'Barcode '+previewBarcode.value}>{previewBarcode.rects.map((rect,index)=><rect key={index} x={rect.x} y="0" width={rect.width} height={previewBarcode.height}/>) }<text x={previewBarcode.width/2} y={previewBarcode.height+10} textAnchor="middle">{previewBarcode.value}</text></svg>
          <small>تعبئة {currentPreview.packDate} · انتهاء {currentPreview.expiryDate}</small>
        </div>:null}
      </section>

      <section className="barcode-scanner">
        <div className="scanner-video-wrap"><video ref={videoRef} playsInline muted/><div className="scanner-reticle"/></div>
        <div className="scanner-actions"><button onClick={()=>void startScanner()}>تشغيل الكاميرا</button><button className="secondary" onClick={stopScanner}>إيقاف</button></div>
        <div className="scanner-manual"><input value={manualBarcode} onChange={(e)=>setManualBarcode(e.target.value)} placeholder="أدخل الباركود يدويًا"/><button onClick={()=>onScan(manualBarcode)}>بحث</button></div>
        {scannedLabel?<div className="scanner-result"><b>{scannedLabel.itemName}</b><span>{scannedLabel.lot??'بدون LOT'} · {scannedLabel.weightKg.toFixed(3)} كجم</span><small>{scannedLabel.barcode}</small></div>:scanValue?<div className="scanner-result"><b>رمز غير مربوط بسجل محفوظ</b><small>{scanValue}</small></div>:null}
      </section>
    </div>
    {message?<p className="catalog-message">{message}</p>:null}
  </section>;
}

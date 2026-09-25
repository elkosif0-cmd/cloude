import {useState,type ChangeEvent} from 'react';
import {applyLegacyMigration,discoverLegacyDataset,inspectLegacyDataset,parseLegacyBackup,type LegacyDataset,type MigrationReport} from '../../data/legacy-migration';

function Summary({report}:{report:MigrationReport}){
  const rows=[
    ['مفاتيح قديمة',report.localKeys],
    ['جداول IndexedDB',report.idbStores],
    ['صفوف IndexedDB',report.idbRows],
    ['أصناف',report.catalogItems],
    ['عملاء',report.customers],
    ['موردون',report.suppliers],
    ['شحنات موردين',report.supplierBatches],
    ['خطط إعادة طلب',report.reorderPlans],
    ['عروض',report.offers],
    ['ائتمان B2B',report.b2bCredits],
    ['دفعات تتبع',report.traceabilityBatches],
    ['قراءات تبريد',report.coldChainEvents],
    ['دفعات صلاحية',report.expiryBatches],
    ['قرارات Jev',report.jevDecisions],
    ['سجلات تجارة قديمة',report.legacyCommerceRows],
  ] as const;
  return <div className="legacy-migration__summary">{rows.map(([label,value])=><article key={label}><span>{label}</span><strong className="sk-number">{value}</strong></article>)}</div>;
}

export function LegacyMigrationPanel(){
  const [dataset,setDataset]=useState<LegacyDataset|null>(null);
  const [report,setReport]=useState<MigrationReport|null>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [migrated,setMigrated]=useState(false);

  async function inspectDevice(){
    setBusy(true);
    try{
      const found=await discoverLegacyDataset(window.localStorage);
      setDataset(found);
      setReport(inspectLegacyDataset(found));
      setMigrated(false);
      setMessage(Object.keys(found.local).length||Object.keys(found.idb).length?'تم العثور على بيانات قديمة. راجع الملخص قبل النقل.':'لم يتم العثور على بيانات قديمة على هذا النطاق.');
    }catch(error){
      setMessage('تعذر قراءة البيانات القديمة على هذا الجهاز: '+String(error));
    }finally{setBusy(false);}
  }

  async function loadBackup(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    setBusy(true);
    try{
      const parsed=parseLegacyBackup(await file.text());
      if(!parsed){setMessage('هذا الملف ليس نسخة S.kosif قديمة مدعومة.');return;}
      setDataset(parsed);
      setReport(inspectLegacyDataset(parsed));
      setMigrated(false);
      setMessage('تم تحليل النسخة القديمة بدون كتابة أي بيانات.');
    }finally{setBusy(false);}
  }

  async function migrate(){
    if(!dataset)return;
    setBusy(true);
    try{
      const result=await applyLegacyMigration(window.localStorage,dataset);
      setReport(result);
      setMigrated(true);
      setMessage('تم نقل البيانات المعروفة إلى المخازن الجديدة، وحفظ نسخة أرشيفية كاملة من المصدر قبل التخلص من أي بنية قديمة.');
    }catch(error){
      setMessage('توقفت عملية النقل بدون حذف المصدر القديم: '+String(error));
    }finally{setBusy(false);}
  }

  return <section className="legacy-migration sk-surface">
    <div className="legacy-migration__head">
      <div><span className="eyebrow">Legacy Data Bridge</span><h3>نقل بيانات التطبيقات القديمة إلى S.kosif الجديد</h3><p>النقل هنا ليس نسخ واجهات. يتم اكتشاف البيانات الفعلية، تحويل ما له معنى إلى مخازن المنتج الجديدة، وأرشفة المصدر الأصلي في IndexedDB كشبكة أمان.</p></div>
      <span className="migration-badge" data-done={migrated}>{migrated?'تم النقل':'آمن للمعاينة'}</span>
    </div>

    <div className="legacy-migration__actions">
      <button onClick={()=>void inspectDevice()} disabled={busy}>{busy?'جارٍ الفحص…':'فحص بيانات هذا الجهاز'}</button>
      <label className="file-action">استيراد نسخة احتياطية قديمة<input type="file" accept=".json,application/json" onChange={(e)=>void loadBackup(e)}/></label>
      <button className="primary" onClick={()=>void migrate()} disabled={!dataset||busy}>تنفيذ النقل إلى البنية الجديدة</button>
    </div>

    {report?<Summary report={report}/>:null}
    {message?<p className="system-message">{message}</p>:null}

    <div className="legacy-migration__rules">
      <div><b>يُنقل مباشرة</b><span>الكتالوج، العملاء، الموردون، العروض، شحنات الموردين، تخطيط إعادة الطلب، ائتمان B2B، دفعات التتبع والصلاحية، سجل التبريد، وسجل قرارات Jev.</span></div>
      <div><b>يُحفظ دون فقد</b><span>الطلبات، المدفوعات، سطور المبيعات، الواردات والبيانات غير المحسومة تُحفظ في أرشيف مرحلي حتى تُصهر في الوحدات الجديدة.</span></div>
      <div><b>لا يتم حذفه</b><span>أي مفتاح قديم أو قاعدة IndexedDB أثناء النقل؛ الحذف لا يتم إلا بعد مطابقة نهائية.</span></div>
    </div>
  </section>;
}

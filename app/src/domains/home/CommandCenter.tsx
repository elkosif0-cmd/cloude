import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {buildTrialBalance,type JournalEntry} from '../finance/ledger-engine';
import {buildStockPositions,type StockMovement} from '../stock/inventory-engine';
import {pbcCompletionPercent,type PbcRequest} from '../audit/pbc-engine';
import type {Company} from '../system/company-context';

export function CommandCenter(){
  const [journals,setJournals]=useState<JournalEntry[]>([]);
  const [movements,setMovements]=useState<StockMovement[]>([]);
  const [pbc,setPbc]=useState<PbcRequest[]>([]);
  const [companies,setCompanies]=useState<Company[]>([]);

  useEffect(()=>{
    const journalRepo=new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,'skosif.v1.finance.journals');
    const stockRepo=new JsonStorageRepository<StockMovement & {id:string}>(window.localStorage,'skosif.v1.stock.movements');
    const pbcRepo=new JsonStorageRepository<PbcRequest & {id:string}>(window.localStorage,'skosif.v1.audit.pbc');
    const companyRepo=new JsonStorageRepository<Company & {id:string}>(window.localStorage,'skosif.v1.system.companies');
    void Promise.all([journalRepo.list(),stockRepo.list(),pbcRepo.list(),companyRepo.list()]).then(([j,s,p,c])=>{setJournals(j);setMovements(s);setPbc(p);setCompanies(c);});
  },[]);

  const tb=useMemo(()=>buildTrialBalance(journals),[journals]);
  const stock=useMemo(()=>buildStockPositions(movements),[movements]);
  const stockQty=stock.reduce((sum,row)=>sum+row.quantity,0);
  const pbcPercent=pbcCompletionPercent(pbc);

  const metrics=[
    {title:'القيود المالية',value:journals.length.toLocaleString('en-US'),detail:tb.balanced?'ميزان المراجعة متزن':'ميزان المراجعة يحتاج مراجعة'},
    {title:'رصيد وحدات المخزون',value:stockQty.toLocaleString('en-US'),detail:stock.length+' صنف/رمز فعلي'},
    {title:'إنجاز PBC',value:pbc.length===0?'—':pbcPercent+'%',detail:pbc.length+' طلب مراجعة'},
    {title:'الشركات',value:companies.length.toLocaleString('en-US'),detail:'من نطاق النظام الجديد'},
  ];

  return <div className="dashboard-grid">
    <section className="hero-panel sk-surface">
      <div><span className="eyebrow">S.kosif · المشروع الأكبر</span><h1 className="sk-display">مركز القيادة الموحد</h1><p>كل رقم هنا يأتي من نفس مخازن البيانات التي تستخدمها الوحدات المالية والتشغيلية والمراجعة. لا توجد لوحة منفصلة ولا أرقام تجريبية مخفية.</p></div>
      <div className="hero-orb" aria-hidden="true" />
    </section>
    <section className="readiness-grid">{metrics.map((item)=><article className="readiness-card sk-surface" key={item.title}><span>{item.title}</span><strong className="sk-number">{item.value}</strong><small>{item.detail}</small></article>)}</section>
    <section className="sk-surface roadmap-card"><div><span className="eyebrow">الانصهار الجاري</span><h3>نواة واحدة بدل أربعة تطبيقات</h3></div><ol><li>المالية والمحاسبة تشغّل نفس القيود التي يقرأها التدقيق</li><li>المخزون والمشتريات والتسعير داخل نفس Shell</li><li>PBC والعينات والأهمية النسبية أصبحت قدرات أصلية</li><li>التقارير تقرأ نفس المصادر بدل نسخ البيانات</li></ol></section>
  </div>;
}

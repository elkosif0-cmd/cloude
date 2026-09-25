import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import type {Company,FiscalPeriod} from './company-context';
import './system-workspace.css';

const COMPANY_KEY='skosif.v1.system.companies';
const PERIOD_KEY='skosif.v1.system.periods';

export function SystemWorkspace(){
  const [companies,setCompanies]=useState<Company[]>([]);
  const [periods,setPeriods]=useState<FiscalPeriod[]>([]);
  const [name,setName]=useState('');
  const [currency,setCurrency]=useState('SAR');
  const [country,setCountry]=useState('SA');
  const [periodLabel,setPeriodLabel]=useState('2026');
  const [startDate,setStartDate]=useState('2026-01-01');
  const [endDate,setEndDate]=useState('2026-12-31');
  const [selectedCompany,setSelectedCompany]=useState('');

  const companyRepo=useMemo(()=>new JsonStorageRepository<Company & {id:string}>(window.localStorage,COMPANY_KEY),[]);
  const periodRepo=useMemo(()=>new JsonStorageRepository<FiscalPeriod & {id:string}>(window.localStorage,PERIOD_KEY),[]);

  useEffect(()=>{void Promise.all([companyRepo.list(),periodRepo.list()]).then(([c,p])=>{setCompanies(c);setPeriods(p);if(c[0])setSelectedCompany((current)=>current||c[0].id);});},[companyRepo,periodRepo]);

  async function addCompany(){
    if(!name.trim())return;
    const company:Company={id:crypto.randomUUID(),name:name.trim(),country,currency};
    await companyRepo.put(company);
    const next=await companyRepo.list();
    setCompanies(next);
    setSelectedCompany(company.id);
    setName('');
  }

  async function addPeriod(){
    if(!selectedCompany||!periodLabel.trim())return;
    const period:FiscalPeriod={id:crypto.randomUUID(),companyId:selectedCompany,startDate,endDate,label:periodLabel.trim()};
    await periodRepo.put(period);
    setPeriods(await periodRepo.list());
  }

  const selected=companies.find((item)=>item.id===selectedCompany)??null;
  const companyPeriods=periods.filter((item)=>item.companyId===selectedCompany);
  const scopeText=selected ? selected.country+' · '+selected.currency : 'أضف شركة لتثبيت نطاق البيانات.';

  return <section className="system-workspace">
    <div className="system-grid">
      <section className="sk-surface system-form">
        <span className="eyebrow">Company Context</span><h3>الشركات</h3>
        <label>اسم الشركة<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم الشركة"/></label>
        <label>الدولة<input value={country} onChange={(e)=>setCountry(e.target.value)} placeholder="SA"/></label>
        <label>العملة<input value={currency} onChange={(e)=>setCurrency(e.target.value)} placeholder="SAR"/></label>
        <button onClick={()=>void addCompany()}>إضافة شركة</button>
        <label>الشركة النشطة<select value={selectedCompany} onChange={(e)=>setSelectedCompany(e.target.value)}><option value="">اختر</option>{companies.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      </section>

      <section className="sk-surface system-form">
        <span className="eyebrow">Fiscal Period</span><h3>الفترات المالية</h3>
        <label>الفترة<input value={periodLabel} onChange={(e)=>setPeriodLabel(e.target.value)}/></label>
        <label>من<input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)}/></label>
        <label>إلى<input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)}/></label>
        <button onClick={()=>void addPeriod()} disabled={!selectedCompany}>إضافة فترة</button>
      </section>
    </div>

    <section className="sk-surface system-summary">
      <span className="eyebrow">النطاق النشط</span>
      <h3>{selected?.name??'لم يتم اختيار شركة'}</h3>
      <p>{scopeText}</p>
      <div className="period-chips">{companyPeriods.map((period)=><span key={period.id}>{period.label} · {period.startDate} → {period.endDate}</span>)}</div>
    </section>
  </section>;
}

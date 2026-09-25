import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {JournalEntry} from '../finance/ledger-engine';
import {analyzeJournals} from './journal-analytics';
import {calculateMateriality} from './materiality-engine';
import {PbcPanel} from './PbcPanel';
import {SamplingPanel} from './SamplingPanel';
import {IssuesPanel} from './IssuesPanel';
import {PlanningPanel} from './PlanningPanel';
import './audit-workspace.css';

const JOURNAL_STORAGE_BASE='finance.journals';

export function AuditWorkspace(){
  const [entries,setEntries]=useState<JournalEntry[]>([]);
  const [benchmark,setBenchmark]=useState('1000000');
  const [rate,setRate]=useState('0.01');
  const [performanceRate,setPerformanceRate]=useState('0.75');
  const [trivialRate,setTrivialRate]=useState('0.05');

  const journalStorageKey=useMemo(()=>makeScopedKey(JOURNAL_STORAGE_BASE,readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<JournalEntry & {id:string}>(window.localStorage,journalStorageKey),[journalStorageKey]);
  useEffect(()=>{void repo.list().then(setEntries);},[repo]);

  const materiality=useMemo(()=>calculateMateriality({
    benchmark:'revenue',
    benchmarkAmount:Number(benchmark)||0,
    benchmarkRate:Number(rate)||0,
    performanceRate:Number(performanceRate)||0,
    trivialRate:Number(trivialRate)||0,
  }),[benchmark,rate,performanceRate,trivialRate]);

  const findings=useMemo(()=>analyzeJournals(entries,{
    materiality:materiality.overall,
    largeAmount:materiality.performance,
    roundUnit:1000,
  }),[entries,materiality]);

  return <section className="audit-workspace">
    <div className="audit-kpis">
      <article className="sk-surface"><span>قيود المصدر</span><strong className="sk-number">{entries.length}</strong><small>من نفس دفتر المالية</small></article>
      <article className="sk-surface"><span>الأهمية النسبية</span><strong className="sk-number">{materiality.overall.toLocaleString('en-US')}</strong><small>محسوبة لحظيًا</small></article>
      <article className="sk-surface"><span>Performance</span><strong className="sk-number">{materiality.performance.toLocaleString('en-US')}</strong><small>حد التنفيذ</small></article>
      <article className="sk-surface"><span>علامات المخاطر</span><strong className="sk-number">{findings.length}</strong><small>من محرك تحليل القيود</small></article>
    </div>

    <div className="audit-grid">
      <section className="sk-surface audit-materiality">
        <span className="eyebrow">Materiality Engine</span><h3>إعداد الأهمية النسبية</h3>
        <label>قيمة Benchmark<input inputMode="decimal" value={benchmark} onChange={(e)=>setBenchmark(e.target.value)}/></label>
        <label>نسبة Benchmark<input inputMode="decimal" value={rate} onChange={(e)=>setRate(e.target.value)}/></label>
        <label>Performance Rate<input inputMode="decimal" value={performanceRate} onChange={(e)=>setPerformanceRate(e.target.value)}/></label>
        <label>Trivial Rate<input inputMode="decimal" value={trivialRate} onChange={(e)=>setTrivialRate(e.target.value)}/></label>
        <div className="materiality-results"><div><span>Overall</span><strong className="sk-number">{materiality.overall.toLocaleString('en-US')}</strong></div><div><span>Trivial</span><strong className="sk-number">{materiality.trivial.toLocaleString('en-US')}</strong></div></div>
      </section>

      <section className="sk-surface audit-findings">
        <span className="eyebrow">Journal Analytics</span><h3>نتائج تحليل القيود</h3>
        {entries.length===0?<p className="audit-empty">أضف قيودًا من قسم المالية أولًا. قسم المراجعة يقرأ نفس البيانات ولا ينشئ دفترًا منفصلًا.</p>:
          findings.length===0?<p className="audit-empty">لا توجد علامات مخاطر وفق الحدود الحالية.</p>:
          <div className="audit-list">{findings.map((item,index)=><article key={item.entryId+'-'+item.code+'-'+index}><div><strong>{item.entryId}</strong><small>{item.code}</small></div><span>{item.detail}</span><b className="sk-number">{item.score}</b></article>)}</div>}
      </section>
    </div>
    <PlanningPanel/>
    <PbcPanel/>
    <SamplingPanel/>
    <IssuesPanel/>
  </section>;
}

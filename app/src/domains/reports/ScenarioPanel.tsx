import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import {calculateSalesTotals} from '../sales/sales-engine';
import type {SalesDocument} from '../sales/sales-posting-engine';
import {runScenario} from './scenario-engine';

export function ScenarioPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const orderRepo=useMemo(()=>new JsonStorageRepository<SalesDocument>(window.localStorage,makeScopedKey('sales.orders',scope)),[scope]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,makeScopedKey('catalog.items',scope)),[scope]);
  const [orders,setOrders]=useState<SalesDocument[]>([]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [fixedCost,setFixedCost]=useState('0');
  const [priceChange,setPriceChange]=useState('0');
  const [volumeChange,setVolumeChange]=useState('0');
  const [variableCostChange,setVariableCostChange]=useState('0');
  const [fixedCostChange,setFixedCostChange]=useState('0');

  useEffect(()=>{void Promise.all([orderRepo.list(),itemRepo.list()]).then(([o,i])=>{setOrders(o);setItems(i);});},[orderRepo,itemRepo]);

  const baseline=useMemo(()=>{
    const posted=orders.filter(order=>order.status==='POSTED');
    let revenue=0,variableCost=0,unknownCostLines=0;
    for(const order of posted){
      revenue+=calculateSalesTotals(order.lines).taxable;
      for(const line of order.lines){
        const item=items.find(i=>i.id===line.itemId);
        if(item?.defaultCost===undefined){unknownCostLines+=1;continue;}
        variableCost+=Math.max(0,line.quantity)*Math.max(0,item.defaultCost);
      }
    }
    return {posted:posted.length,revenue,variableCost,unknownCostLines};
  },[orders,items]);

  const scenario=useMemo(()=>runScenario({
    revenue:baseline.revenue,
    variableCost:baseline.variableCost,
    fixedCost:Number(fixedCost)||0,
    priceChangePercent:Number(priceChange)||0,
    volumeChangePercent:Number(volumeChange)||0,
    variableCostChangePercent:Number(variableCostChange)||0,
    fixedCostChangePercent:Number(fixedCostChange)||0,
  }),[baseline,fixedCost,priceChange,volumeChange,variableCostChange,fixedCostChange]);

  return <section className="scenario-panel sk-surface">
    <div className="scenario-panel__head"><div><span className="eyebrow">Sensitivity Lab</span><h3>السيناريوهات وتحليل الحساسية</h3><p>خط الأساس مأخوذ من أوامر البيع المرحّلة وتكلفة الأصناف الحالية داخل نفس الشركة والفترة.</p></div><strong>{baseline.posted} أمر مرحّل</strong></div>
    <div className="scenario-panel__inputs">
      <label>تكاليف ثابتة<input inputMode="decimal" value={fixedCost} onChange={(e)=>setFixedCost(e.target.value)}/></label>
      <label>تغير السعر %<input inputMode="decimal" value={priceChange} onChange={(e)=>setPriceChange(e.target.value)}/></label>
      <label>تغير الحجم %<input inputMode="decimal" value={volumeChange} onChange={(e)=>setVolumeChange(e.target.value)}/></label>
      <label>تغير التكلفة المتغيرة %<input inputMode="decimal" value={variableCostChange} onChange={(e)=>setVariableCostChange(e.target.value)}/></label>
      <label>تغير التكاليف الثابتة %<input inputMode="decimal" value={fixedCostChange} onChange={(e)=>setFixedCostChange(e.target.value)}/></label>
    </div>
    <div className="scenario-panel__compare">
      <article><span>الربح الأساسي</span><strong className="sk-number">{scenario.baseline.profit.toLocaleString('en-US')}</strong><small>هامش {scenario.baseline.marginPercent}%</small></article>
      <article data-positive={scenario.deltaProfit>=0}><span>ربح السيناريو</span><strong className="sk-number">{scenario.scenario.profit.toLocaleString('en-US')}</strong><small>هامش {scenario.scenario.marginPercent}%</small></article>
      <article data-positive={scenario.deltaProfit>=0}><span>فرق الربح</span><strong className="sk-number">{scenario.deltaProfit.toLocaleString('en-US')}</strong><small>مقارنة بالأساس</small></article>
      <article><span>نقطة التعادل</span><strong className="sk-number">{scenario.breakEvenRevenue?.toLocaleString('en-US')??'—'}</strong><small>Contribution {scenario.contributionMarginPercent}%</small></article>
    </div>
    <div className="scenario-panel__details"><span>إيراد أساسي <b>{scenario.baseline.revenue.toLocaleString('en-US')}</b></span><span>تكلفة متغيرة <b>{scenario.baseline.variableCost.toLocaleString('en-US')}</b></span><span>إيراد السيناريو <b>{scenario.scenario.revenue.toLocaleString('en-US')}</b></span><span>تكلفة متغيرة للسيناريو <b>{scenario.scenario.variableCost.toLocaleString('en-US')}</b></span></div>
    {baseline.unknownCostLines>0?<p className="scenario-warning">يوجد {baseline.unknownCostLines} سطر بيع بلا تكلفة افتراضية للصنف؛ لذلك نتيجة التكلفة أقل من الواقع حتى تُستكمل تكاليف هذه الأصناف.</p>:null}
  </section>;
}

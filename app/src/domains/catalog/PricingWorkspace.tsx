import {useMemo,useState} from 'react';
import {calculatePricing} from './pricing-engine';
import {ItemsPanel} from './ItemsPanel';
import './pricing-workspace.css';

export function PricingWorkspace(){
  const [purchase,setPurchase]=useState('');
  const [selling,setSelling]=useState('');
  const [vat,setVat]=useState('15');
  const [waste,setWaste]=useState('0');

  const result=useMemo(()=>calculatePricing({
    purchaseInclusiveVat:Number(purchase)||0,
    sellingInclusiveVat:Number(selling)||0,
    vatRate:(Number(vat)||0)/100,
    wasteRate:(Number(waste)||0)/100,
  }),[purchase,selling,vat,waste]);

  return <section className="pricing-workspace">
    <ItemsPanel/>
    <div className="pricing-grid">
      <section className="sk-surface pricing-form">
        <span className="eyebrow">Costing + Pricing</span><h3>حاسبة التكلفة والتسعير</h3>
        <label>سعر الشراء شامل الضريبة<input inputMode="decimal" value={purchase} onChange={(e)=>setPurchase(e.target.value)}/></label>
        <label>سعر البيع شامل الضريبة<input inputMode="decimal" value={selling} onChange={(e)=>setSelling(e.target.value)}/></label>
        <label>VAT %<input inputMode="decimal" value={vat} onChange={(e)=>setVat(e.target.value)}/></label>
        <label>هدر %<input inputMode="decimal" value={waste} onChange={(e)=>setWaste(e.target.value)}/></label>
      </section>
      <section className="pricing-results">
        <article className="sk-surface"><span>شراء بدون ضريبة</span><strong className="sk-number">{result.purchaseExVat.toLocaleString('en-US')}</strong></article>
        <article className="sk-surface"><span>تكلفة بعد الهدر</span><strong className="sk-number">{result.usableCostExVat.toLocaleString('en-US')}</strong></article>
        <article className="sk-surface"><span>ربح شامل الضريبة</span><strong className="sk-number">{result.grossProfitInclusiveVat.toLocaleString('en-US')}</strong></article>
        <article className="sk-surface"><span>هامش الربح %</span><strong className="sk-number">{result.grossMarginPercentOnInclusiveSales.toLocaleString('en-US')}</strong></article>
      </section>
    </div>
  </section>;
}

import {useMemo,useState} from 'react';
import {calculateYield} from './yield-engine';

export function YieldPanel(){
  const [purchaseCost,setPurchaseCost]=useState('');
  const [grossWeight,setGrossWeight]=useState('');
  const [usableWeight,setUsableWeight]=useState('');
  const [recovery,setRecovery]=useState('0');
  const result=useMemo(()=>calculateYield({purchaseCost:Number(purchaseCost)||0,grossWeight:Number(grossWeight)||0,usableWeight:Number(usableWeight)||0,byproductRecovery:Number(recovery)||0}),[purchaseCost,grossWeight,usableWeight,recovery]);
  return <section className="stock-yield sk-surface">
    <div><span className="eyebrow">Yield Economics</span><h3>اقتصاديات الذبيحة والهدر</h3></div>
    <div className="stock-yield__form"><label>تكلفة الشراء<input inputMode="decimal" value={purchaseCost} onChange={(e)=>setPurchaseCost(e.target.value)}/></label><label>الوزن الإجمالي<input inputMode="decimal" value={grossWeight} onChange={(e)=>setGrossWeight(e.target.value)}/></label><label>الوزن الصالح للبيع<input inputMode="decimal" value={usableWeight} onChange={(e)=>setUsableWeight(e.target.value)}/></label><label>استرداد مخلفات/منتجات جانبية<input inputMode="decimal" value={recovery} onChange={(e)=>setRecovery(e.target.value)}/></label></div>
    <div className="stock-yield__results"><article><span>نسبة العائد</span><strong>{result.yieldPercent}%</strong></article><article><span>الهدر</span><strong>{result.wasteWeight} كجم</strong></article><article><span>صافي التكلفة</span><strong>{result.netCost.toLocaleString('en-US')}</strong></article><article><span>تكلفة الكيلو الصالح</span><strong>{result.costPerUsableKg.toLocaleString('en-US')}</strong></article></div>
  </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import type {CatalogItem} from '../catalog/items-engine';
import {parseExcelReconText,reconcileExcelRows,type ExcelVatMode} from './excel-recon-engine';
import {learnAlias,matchSalesRows,parseSalesMatchText,type ProductAliasMap} from './smart-match-engine';

function loadAliases(key:string):ProductAliasMap{
  try{
    const parsed=JSON.parse(window.localStorage.getItem(key)??'{}');
    return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
  }catch{return {};}
}

export function MatchingReconPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const itemKey=useMemo(()=>makeScopedKey('catalog.items',scope),[scope]);
  const aliasKey=useMemo(()=>makeScopedKey('reports.product-aliases',scope),[scope]);
  const itemRepo=useMemo(()=>new JsonStorageRepository<CatalogItem>(window.localStorage,itemKey),[itemKey]);
  const [items,setItems]=useState<CatalogItem[]>([]);
  const [aliases,setAliases]=useState<ProductAliasMap>(()=>loadAliases(aliasKey));
  const [salesText,setSalesText]=useState('');
  const [excelText,setExcelText]=useState('');
  const [vatMode,setVatMode]=useState<ExcelVatMode>('net');
  const [tolerance,setTolerance]=useState('0.5');
  const [message,setMessage]=useState('');

  useEffect(()=>{void itemRepo.list().then(setItems);},[itemRepo]);

  const salesRows=useMemo(()=>matchSalesRows(parseSalesMatchText(salesText),items,aliases),[salesText,items,aliases]);
  const excelRows=useMemo(()=>reconcileExcelRows({
    rows:parseExcelReconText(excelText),
    items,
    aliases,
    vatMode,
    tolerancePercent:Number(tolerance)||0.5,
  }),[excelText,items,aliases,vatMode,tolerance]);

  function teach(sourceName:string,itemId:string){
    const next=learnAlias(aliases,sourceName,itemId);
    window.localStorage.setItem(aliasKey,JSON.stringify(next));
    setAliases(next);
    setMessage('تم حفظ التصحيح كاسم مستعار، وسيستخدمه المحرك في المطابقات القادمة.');
  }

  const matched=salesRows.filter(row=>row.item).length;
  const unmatched=salesRows.length-matched;
  const excelExceptions=excelRows.filter(row=>row.status!=='MATCH').length;

  return <section className="matching-recon sk-surface">
    <div className="matching-recon__head">
      <div><span className="eyebrow">Smart Matching + Excel Recon</span><h3>مطابقة المبيعات والإكسل مع الكتالوج</h3><p>المحرك يطبّع العربية، يتعلم من تصحيحاتك، ويقارن التكلفة والسعر مع البيانات الأساسية بدون تعديل المصدر تلقائيًا.</p></div>
      <div className="matching-recon__stats"><span>مطابق <b>{matched}</b></span><span>غير مطابق <b>{unmatched}</b></span><span>فروق Excel <b>{excelExceptions}</b></span></div>
    </div>

    <div className="matching-recon__grid">
      <section>
        <div className="matching-recon__section-head"><div><small>Sales Matching</small><h4>مطابقة أسماء المبيعات الحرة</h4></div></div>
        <textarea value={salesText} onChange={(e)=>setSalesText(e.target.value)} placeholder={'اسم الصنف\tالكمية\tالمبلغ\nنعيمي فاخر\t2\t500\nتيس حري\t1\t300'}/>
        {salesRows.length===0?<p className="reports-empty">الصق سطور المبيعات لبدء المطابقة.</p>:<div className="matching-list">{salesRows.map((row,index)=><article key={row.sourceName+'-'+index} data-low={row.score<70}>
          <div><b>{row.sourceName}</b><small>الثقة {row.score}% · {row.reason}</small></div>
          <div><span>{row.item?.name??'غير مطابق'}</span><small>{row.quantity!==undefined?'كمية '+row.quantity:''}{row.amount!==undefined?' · مبلغ '+row.amount.toLocaleString('en-US'):''}</small></div>
          <select value={row.item?.id??''} onChange={(e)=>e.target.value&&teach(row.sourceName,e.target.value)}><option value="">تصحيح المطابقة</option>{items.map(item=><option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</select>
        </article>)}</div>}
      </section>

      <section>
        <div className="matching-recon__section-head">
          <div><small>Excel Reconciliation</small><h4>مطابقة ملف التكلفة والسعر</h4></div>
          <div className="excel-recon-controls"><select value={vatMode} onChange={(e)=>setVatMode(e.target.value as ExcelVatMode)}><option value="net">القيم بدون VAT</option><option value="inclusive">القيم شاملة VAT</option></select><label>سماحية %<input inputMode="decimal" value={tolerance} onChange={(e)=>setTolerance(e.target.value)}/></label></div>
        </div>
        <textarea value={excelText} onChange={(e)=>setExcelText(e.target.value)} placeholder={'الصنف\tالتكلفة\tالسعر\nنعيمي فاخر\t50\t70'}/>
        {excelRows.length===0?<p className="reports-empty">الصق بيانات Excel: الاسم، التكلفة، السعر.</p>:<div className="reports-table-wrap"><table><thead><tr><th>المصدر</th><th>المطابقة</th><th>تكلفة Excel</th><th>تكلفة النظام</th><th>فرق %</th><th>سعر Excel</th><th>سعر النظام</th><th>الحالة</th></tr></thead><tbody>{excelRows.map((row,index)=><tr key={row.sourceName+'-'+index} data-status={row.status}><td>{row.sourceName}</td><td>{row.item?.name??'—'} <small>{row.matchScore}%</small></td><td>{row.excelCostNet??'—'}</td><td>{row.catalogCost??'—'}</td><td>{row.costDifferencePercent===undefined?'—':row.costDifferencePercent+'%'}</td><td>{row.excelPriceNet??'—'}</td><td>{row.catalogPrice??'—'}</td><td>{row.status}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
    {message?<p className="reports-message">{message}</p>:null}
  </section>;
}

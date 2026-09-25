import {useEffect,useMemo,useRef,useState} from 'react';
import {makeScopedKey,readActiveScope} from '../data/scope-key';
import {searchItems,type SearchDomain,type SearchItem} from './search-engine';

function envelopeRecords(key:string){
  const raw=window.localStorage.getItem(key);
  if(!raw)return [] as any[];
  try{
    const parsed=JSON.parse(raw);
    return parsed?.version===1&&Array.isArray(parsed.records)?parsed.records:[];
  }catch{return [];}
}

function buildIndex():SearchItem[]{
  const scope=readActiveScope(window.localStorage);
  const read=(base:string)=>envelopeRecords(makeScopedKey(base,scope));
  const items:SearchItem[]=[];

  for(const row of read('sales.customers'))items.push({id:row.id,domain:'sales',kind:'عميل',title:row.name||row.code,subtitle:[row.code,row.phone,row.city].filter(Boolean).join(' · '),keywords:[row.email||'']});
  for(const row of read('procurement.suppliers'))items.push({id:row.id,domain:'procurement',kind:'مورد',title:row.name||row.code,subtitle:[row.code,row.phone,row.taxNumber].filter(Boolean).join(' · ')});
  for(const row of read('catalog.items'))items.push({id:row.id,domain:'catalog',kind:'صنف',title:row.name||row.sku,subtitle:[row.sku,row.unit].filter(Boolean).join(' · ')});
  for(const row of read('finance.accounts'))items.push({id:row.id,domain:'finance',kind:'حساب',title:row.name||row.code,subtitle:[row.code,row.type].filter(Boolean).join(' · ')});
  for(const row of read('audit.pbc'))items.push({id:row.id,domain:'audit',kind:'PBC',title:row.title||row.id,subtitle:[row.owner,row.dueDate].filter(Boolean).join(' · ')});
  for(const row of read('audit.issues'))items.push({id:row.id,domain:'audit',kind:'ملاحظة',title:row.title||row.id,subtitle:[row.severity,row.status].filter(Boolean).join(' · ')});
  for(const row of read('stock.traceability-batches'))items.push({id:row.id,domain:'stock',kind:'دفعة',title:row.lotCode||row.id,subtitle:[row.origin,row.expiryDate].filter(Boolean).join(' · ')});
  for(const row of read('sales.tax-invoices'))items.push({id:row.id,domain:'sales',kind:'فاتورة',title:row.number||row.id,subtitle:[row.customerName,row.status].filter(Boolean).join(' · ')});
  for(const row of read('procurement.orders'))items.push({id:row.id,domain:'procurement',kind:'أمر شراء',title:row.number||row.id,subtitle:[row.date,row.status].filter(Boolean).join(' · ')});
  return items;
}

const DOMAIN_LABELS:Record<SearchDomain,string>={
  sales:'المبيعات',procurement:'المشتريات',catalog:'الكتالوج',finance:'المالية',audit:'المراجعة',stock:'المخزون',reports:'التقارير',system:'النظام'
};

export function GlobalSearch({open,onClose,onNavigate}:{open:boolean;onClose:()=>void;onNavigate:(domain:SearchDomain)=>void}){
  const [query,setQuery]=useState('');
  const [version,setVersion]=useState(0);
  const inputRef=useRef<HTMLInputElement>(null);
  const index=useMemo(()=>buildIndex(),[version]);
  const results=useMemo(()=>searchItems(index,query,30),[index,query]);

  useEffect(()=>{
    if(open){
      setVersion(v=>v+1);
      setTimeout(()=>inputRef.current?.focus(),20);
    }else setQuery('');
  },[open]);

  useEffect(()=>{
    if(!open)return;
    const handler=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[open,onClose]);

  if(!open)return null;
  return <div className="global-search-backdrop" onClick={onClose}>
    <section className="global-search" onClick={(e)=>e.stopPropagation()} dir="rtl">
      <div className="global-search__input"><span>⌕</span><input ref={inputRef} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="ابحث عن عميل، حساب، صنف، فاتورة، PBC، دفعة…"/><kbd>ESC</kbd></div>
      <div className="global-search__meta"><span>{index.length} عنصر مفهرس</span><span>Ctrl / ⌘ + K</span></div>
      <div className="global-search__results">
        {!query?<div className="global-search__empty"><b>بحث موحد</b><span>ابدأ بكتابة الاسم أو الكود أو الجوال أو رقم المستند.</span></div>:
        results.length===0?<div className="global-search__empty"><b>لا توجد نتائج</b><span>جرّب كلمة أو كودًا مختلفًا.</span></div>:
        results.map(item=><button key={item.domain+'-'+item.id} onClick={()=>{onNavigate(item.domain);onClose();}}>
          <span className="search-kind">{item.kind}</span><div><b>{item.title}</b><small>{item.subtitle||DOMAIN_LABELS[item.domain]}</small></div><span className="search-domain">{DOMAIN_LABELS[item.domain]}</span>
        </button>)}
      </div>
    </section>
  </div>;
}

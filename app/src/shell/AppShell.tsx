import {useState,type PropsWithChildren} from 'react';
import {THEMES} from '../design/themes';
import type {ThemeId} from '../design/theme-contract';
import {useTheme} from '../design/ThemeProvider';
import {CapabilityDomainPanel} from '../app/CapabilityDomainPanel';
import type {ProductDomain} from '../app/capability-types';
import {FinanceWorkspace} from '../domains/finance/FinanceWorkspace';
import {AuditWorkspace} from '../domains/audit/AuditWorkspace';
import {SalesWorkspace} from '../domains/sales/SalesWorkspace';
import {StockWorkspace} from '../domains/stock/StockWorkspace';
import {ProcurementWorkspace} from '../domains/procurement/ProcurementWorkspace';
import {PricingWorkspace} from '../domains/catalog/PricingWorkspace';
import {IntelligenceWorkspace} from '../domains/intelligence/IntelligenceWorkspace';
import {ReportsWorkspace} from '../domains/reports/ReportsWorkspace';
import {SystemWorkspace} from '../domains/system/SystemWorkspace';
import './shell.css';

const nav:{id:string;label:string;short:string;domain:ProductDomain}[]=[
  {id:'home',label:'مركز القيادة',short:'الرئيسية',domain:'home'},
  {id:'sales',label:'المبيعات والعملاء',short:'المبيعات',domain:'sales'},
  {id:'stock',label:'المخزون والإنتاج',short:'المخزون',domain:'stock'},
  {id:'buy',label:'المشتريات والموردون',short:'المشتريات',domain:'procurement'},
  {id:'finance',label:'المالية والمحاسبة',short:'المالية',domain:'finance'},
  {id:'audit',label:'المراجعة والتأكيد',short:'المراجعة',domain:'audit'},
  {id:'catalog',label:'الكتالوج والتسعير',short:'التسعير',domain:'catalog'},
  {id:'ai',label:'Jev والذكاء',short:'الذكاء',domain:'intelligence'},
  {id:'reports',label:'التقارير والتحليلات',short:'التقارير',domain:'reports'},
  {id:'admin',label:'النظام والتكاملات',short:'النظام',domain:'system'},
];

const mobilePrimary=['home','sales','finance','audit'];
const mobileMore=nav.filter(item=>!mobilePrimary.includes(item.id));

function NavGlyph({id}:{id:string}){
  const path:Record<string,string>={
    home:'M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z',
    sales:'M4 5h16v12H4z M7 21h10 M8 9h2m4 0h2m-8 4h8',
    stock:'M4 7l8-4 8 4-8 4z M4 7v10l8 4 8-4V7 M12 11v10',
    buy:'M3 6h3l2 10h9l2-7H7 M10 20a1 1 0 1 0 0 .01 M17 20a1 1 0 1 0 0 .01',
    finance:'M12 3v18 M17 7h-6.5a3 3 0 0 0 0 6h3a3 3 0 0 1 0 6H7',
    audit:'M5 4h14v16H5z M8 9l2 2 4-4 M8 15h8',
    catalog:'M4 6h16 M4 12h16 M4 18h16 M7 6v0 M7 12v0 M7 18v0',
    ai:'M8 18h8 M9 21h6 M12 3a6 6 0 0 1 4 10.5c-1 .8-1.5 1.6-1.5 3.5h-5c0-1.9-.5-2.7-1.5-3.5A6 6 0 0 1 12 3z',
    reports:'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
    admin:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M4 12H2m20 0h-2M12 4V2m0 20v-2M6.3 6.3 4.9 4.9m14.2 14.2-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4',
    more:'M5 12h.01 M12 12h.01 M19 12h.01',
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path[id]??path.more}/></svg>;
}

export function AppShell({children}:PropsWithChildren){
  const [active,setActive]=useState('home');
  const [moreOpen,setMoreOpen]=useState(false);
  const {theme,setTheme}=useTheme();
  const current=nav.find((item)=>item.id===active)??nav[0];
  const hiddenActive=!mobilePrimary.includes(active);

  function go(id:string){
    setActive(id);
    setMoreOpen(false);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderWorkspace(){
    if(current.domain==='home')return children;
    if(current.domain==='sales')return <SalesWorkspace/>;
    if(current.domain==='stock')return <StockWorkspace/>;
    if(current.domain==='procurement')return <ProcurementWorkspace/>;
    if(current.domain==='finance')return <FinanceWorkspace/>;
    if(current.domain==='audit')return <AuditWorkspace/>;
    if(current.domain==='catalog')return <PricingWorkspace/>;
    if(current.domain==='intelligence')return <IntelligenceWorkspace/>;
    if(current.domain==='reports')return <ReportsWorkspace/>;
    if(current.domain==='system')return <SystemWorkspace/>;
    return <CapabilityDomainPanel domain={current.domain}/>;
  }

  return <div className="app-shell">
    <aside className="app-rail sk-surface" aria-label="التنقل الرئيسي">
      <div className="brand-block">
        <div className="brand-mark">S</div>
        <div><strong>S.kosif</strong><span>Grand Fusion OS</span></div>
      </div>
      <nav>{nav.map((item)=><button key={item.id} data-active={active===item.id} onClick={()=>go(item.id)}><span className="nav-glyph"><NavGlyph id={item.id}/></span><span>{item.label}</span></button>)}</nav>
      <div className="theme-picker"><label htmlFor="theme">المظهر</label><select id="theme" value={theme} onChange={(e)=>setTheme(e.target.value as ThemeId)}>{Object.entries(THEMES).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></div>
    </aside>

    <section className="app-workspace">
      <header className="app-topbar">
        <div className="topbar-title"><span className="topbar-icon"><NavGlyph id={current.id}/></span><div><small>S.kosif · مساحة العمل الموحدة</small><h2>{current.label}</h2></div></div>
        <div className="topbar-actions"><span className="live-dot"><i/>بيانات فعلية</span><button className="theme-quick" onClick={()=>setTheme(theme==='midnight-intelligence'?'aghnam-executive-light':'midnight-intelligence')} aria-label="تبديل الوضع">◐</button></div>
      </header>
      <main className="workspace-stage">{renderWorkspace()}</main>
    </section>

    <nav className="mobile-dock" aria-label="التنقل للجوال">
      {mobilePrimary.map(id=>{
        const item=nav.find(x=>x.id===id)!;
        return <button key={id} data-active={active===id} onClick={()=>go(id)}><NavGlyph id={id}/><span>{item.short}</span></button>;
      })}
      <button data-active={hiddenActive||moreOpen} onClick={()=>setMoreOpen(open=>!open)}><NavGlyph id="more"/><span>المزيد</span></button>
    </nav>

    {moreOpen?<div className="mobile-sheet-backdrop" onClick={()=>setMoreOpen(false)}>
      <section className="mobile-sheet" onClick={(e)=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="mobile-sheet__head"><div><small>S.kosif</small><h3>كل المساحات</h3></div><button onClick={()=>setMoreOpen(false)} aria-label="إغلاق">×</button></div>
        <div className="mobile-sheet__grid">{mobileMore.map(item=><button key={item.id} data-active={active===item.id} onClick={()=>go(item.id)}><span className="nav-glyph"><NavGlyph id={item.id}/></span><span>{item.label}</span></button>)}</div>
        <div className="mobile-sheet__theme"><label>الثيم</label><select value={theme} onChange={(e)=>setTheme(e.target.value as ThemeId)}>{Object.entries(THEMES).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></div>
      </section>
    </div>:null}
  </div>;
}

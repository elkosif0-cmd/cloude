import {useState,type PropsWithChildren} from 'react';
import {THEMES} from '../design/themes';
import type {ThemeId} from '../design/theme-contract';
import {useTheme} from '../design/ThemeProvider';
import {CapabilityDomainPanel} from '../app/CapabilityDomainPanel';
import type {ProductDomain} from '../app/capability-types';
import {FinanceWorkspace} from '../domains/finance/FinanceWorkspace';
import {AuditWorkspace} from '../domains/audit/AuditWorkspace';
import './shell.css';

const nav:{id:string;label:string;domain:ProductDomain}[]=[
  {id:'home',label:'مركز القيادة',domain:'home'},
  {id:'sales',label:'المبيعات والعملاء',domain:'sales'},
  {id:'stock',label:'المخزون والإنتاج',domain:'stock'},
  {id:'buy',label:'المشتريات والموردون',domain:'procurement'},
  {id:'finance',label:'المالية والمحاسبة',domain:'finance'},
  {id:'audit',label:'المراجعة والتأكيد',domain:'audit'},
  {id:'catalog',label:'الكتالوج والتسعير',domain:'catalog'},
  {id:'ai',label:'Jev والذكاء',domain:'intelligence'},
  {id:'reports',label:'التقارير والتحليلات',domain:'reports'},
  {id:'admin',label:'النظام والتكاملات',domain:'system'},
];

export function AppShell({children}:PropsWithChildren){
  const [active,setActive]=useState('home');
  const {theme,setTheme}=useTheme();
  const current=nav.find((item)=>item.id===active)??nav[0];

  function renderWorkspace(){
    if(current.domain==='home')return children;
    if(current.domain==='finance')return <FinanceWorkspace/>;
    if(current.domain==='audit')return <AuditWorkspace/>;
    return <CapabilityDomainPanel domain={current.domain}/>;
  }

  return <div className="app-shell">
    <aside className="app-rail sk-surface">
      <div className="brand-block"><strong>S.kosif</strong><span>Grand Fusion</span></div>
      <nav>{nav.map((item)=><button key={item.id} data-active={active===item.id} onClick={()=>setActive(item.id)}>{item.label}</button>)}</nav>
      <div className="theme-picker"><label htmlFor="theme">الثيم</label><select id="theme" value={theme} onChange={(e)=>setTheme(e.target.value as ThemeId)}>{Object.entries(THEMES).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></div>
    </aside>
    <section className="app-workspace">
      <header className="app-topbar"><div><small>مساحة العمل الموحدة</small><h2>{current.label}</h2></div><div className="status-pill">Clean Slate · v1</div></header>
      {renderWorkspace()}
    </section>
  </div>;
}

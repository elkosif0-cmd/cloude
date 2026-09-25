import {useState,type PropsWithChildren} from 'react';
import {THEMES} from '../design/themes';
import type {ThemeId} from '../design/theme-contract';
import {useTheme} from '../design/ThemeProvider';

const nav=[
  ['home','مركز القيادة'],['sales','المبيعات والعملاء'],['stock','المخزون والإنتاج'],['buy','المشتريات والموردون'],['finance','المالية والمحاسبة'],['audit','المراجعة والتأكيد'],['catalog','الكتالوج والتسعير'],['ai','Jev والذكاء'],['reports','التقارير والتحليلات'],['admin','النظام والتكاملات']
] as const;

export function AppShell({children}:PropsWithChildren){
  const [active,setActive]=useState('home');
  const {theme,setTheme}=useTheme();
  return <div className="app-shell">
    <aside className="app-rail sk-surface">
      <div className="brand-block"><strong>S.kosif</strong><span>Grand Fusion</span></div>
      <nav>{nav.map(([id,label])=><button key={id} data-active={active===id} onClick={()=>setActive(id)}>{label}</button>)}</nav>
      <div className="theme-picker"><label htmlFor="theme">الثيم</label><select id="theme" value={theme} onChange={(e)=>setTheme(e.target.value as ThemeId)}>{Object.entries(THEMES).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></div>
    </aside>
    <section className="app-workspace">
      <header className="app-topbar"><div><small>مساحة العمل الموحدة</small><h2>{nav.find(([id])=>id===active)?.[1]}</h2></div><div className="status-pill">Clean Slate · v1</div></header>
      {children}
    </section>
  </div>;
}

import React,{ReactNode,useEffect,useMemo,useRef,useState}from'react';
import{LayoutDashboard,ShoppingBag,PackageOpen,WalletCards,Tags,Sparkles,ShieldCheck,Settings2,Search,Menu,X,Sun,Moon,ChevronLeft,Command,BookOpenCheck,Boxes,Users,ReceiptText}from'lucide-react';
import{CAPABILITIES,CapabilityGroup}from'../core/capabilities';
import{unifiedSearch,SearchResult}from'../services/search';
import{Button,cx}from'../components/ui';

export type RouteId='command'|'sales'|'inventory'|'finance'|'catalog'|'intelligence'|'audit'|'system';
const ROUTES:{id:RouteId;label:string;short:string;icon:any;advanced?:boolean;description:string}[]=[
 {id:'command',label:'مركز القيادة',short:'الرئيسية',icon:LayoutDashboard,description:'ما يحتاج انتباهك الآن'},
 {id:'sales',label:'المبيعات والعملاء',short:'المبيعات',icon:ShoppingBag,description:'طلبات وفواتير وعملاء وتحصيل'},
 {id:'inventory',label:'المخزون والإنتاج',short:'المخزون',icon:PackageOpen,description:'مخزون وجرد وموردون وتشغيل'},
 {id:'finance',label:'المالية',short:'المالية',icon:WalletCards,description:'تدفق وقائمة دخل وذمم'},
 {id:'catalog',label:'الكتالوج والتسعير',short:'الكتالوج',icon:Tags,description:'أصناف وتكاليف وتسعير'},
 {id:'intelligence',label:'الذكاء والقرار',short:'Jev',icon:Sparkles,advanced:true,description:'Jev وتحليلات ومحاكاة'},
 {id:'audit',label:'المحاسبة والمراجعة',short:'المراجعة',icon:BookOpenCheck,advanced:true,description:'أدلة وقضايا وتحليلات مراجعة'},
 {id:'system',label:'النظام والتكاملات',short:'النظام',icon:Settings2,advanced:true,description:'صلاحيات ومزامنة وبيانات'}
];
const iconForKind=(kind:SearchResult['kind'])=>kind==='customer'?Users:kind==='order'?ReceiptText:kind==='product'?Boxes:Command;

function CommandPalette({open,onClose,onNavigate}:{open:boolean;onClose:()=>void;onNavigate:(route:RouteId)=>void}){
 const[q,setQ]=useState(''),[focus,setFocus]=useState(0);const input=useRef<HTMLInputElement>(null);
 const results=useMemo(()=>unifiedSearch(q),[q]);
 useEffect(()=>{if(open){setQ('');setFocus(0);setTimeout(()=>input.current?.focus(),30)}},[open]);
 useEffect(()=>{if(!open)return;const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowDown'){e.preventDefault();setFocus(x=>Math.min(x+1,results.length-1))}if(e.key==='ArrowUp'){e.preventDefault();setFocus(x=>Math.max(0,x-1))}if(e.key==='Enter'&&results[focus]){onNavigate(results[focus].route as RouteId);onClose()}};addEventListener('keydown',fn);return()=>removeEventListener('keydown',fn)},[open,results,focus,onClose,onNavigate]);
 if(!open)return null;
 return <><div className="z-command-backdrop" onClick={onClose}/><div className="z-command" role="dialog" aria-modal="true" aria-label="البحث الشامل">
  <input ref={input} className="z-command-search" value={q} onChange={e=>{setQ(e.target.value);setFocus(0)}} placeholder="ابحث عن عميل، صنف، طلب، تقرير أو أداة…"/>
  <div className="z-command-list">{!q?<div className="z-empty"><div className="z-empty-mark"><Command size={19}/></div><b>اكتب ما تريد الوصول إليه</b><p>البحث يشمل البيانات المسجلة وقدرات النظام، وليس أسماء الصفحات فقط.</p></div>:results.length?results.map((r,i)=>{const I=iconForKind(r.kind);return <button key={r.kind+r.id} className={cx('z-command-item',i===focus&&'focused')} onMouseEnter={()=>setFocus(i)} onClick={()=>{onNavigate(r.route as RouteId);onClose()}}><div><b>{r.title}</b><span>{r.subtitle}</span></div><span className="z-command-kind"><I size={16}/></span></button>}):<div className="z-empty"><b>لا توجد نتيجة مطابقة</b><p>جرّب اسمًا أو رقم طلب أو كلمة مثل «المخزون» أو «قائمة الدخل».</p></div>}</div>
 </div></>
}

export function AppShell({route,onRoute,children}:{route:RouteId;onRoute:(r:RouteId)=>void;children:ReactNode}){
 const[mode,setMode]=useState<'daily'|'advanced'>(()=>localStorage.getItem('skosif_rebuild_nav_mode')==='advanced'?'advanced':'daily');
 const[drawer,setDrawer]=useState(false),[palette,setPalette]=useState(false),[dark,setDark]=useState(()=>localStorage.getItem('skosif_rebuild_theme')==='dark');
 useEffect(()=>{document.documentElement.setAttribute('data-z-theme',dark?'dark':'light');localStorage.setItem('skosif_rebuild_theme',dark?'dark':'light')},[dark]);
 useEffect(()=>{const fn=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPalette(true)}};addEventListener('keydown',fn);return()=>removeEventListener('keydown',fn)},[]);
 const nav=(mobile=false)=><>{!mobile&&<div className="z-navmode"><button className={mode==='daily'?'active':''} onClick={()=>{setMode('daily');localStorage.setItem('skosif_rebuild_nav_mode','daily')}}>العمل اليومي</button><button className={mode==='advanced'?'active':''} onClick={()=>{setMode('advanced');localStorage.setItem('skosif_rebuild_nav_mode','advanced')}}>متقدم</button></div>}<nav className="z-nav">{!mobile&&<div className="z-nav-group">{mode==='daily'?'العمل اليومي':'الأدوات المتقدمة'}</div>}{ROUTES.filter(x=>mode==='advanced'?x.advanced:!x.advanced).map(x=>{const I=x.icon;return <button key={x.id} className={route===x.id?'active':''} onClick={()=>{onRoute(x.id);setDrawer(false)}}><I/><span>{x.label}</span></button>})}{mode==='advanced'&&<><div className="z-nav-group">عودة سريعة</div>{ROUTES.filter(x=>!x.advanced).slice(0,3).map(x=>{const I=x.icon;return <button key={x.id} className={route===x.id?'active':''} onClick={()=>{onRoute(x.id);setDrawer(false)}}><I/><span>{x.label}</span></button>})}</>}</nav></>;
 const mobilePrimary=ROUTES.filter(x=>!x.advanced).slice(0,5);
 return <div className="z-app"><div className="z-shell">
  <aside className="z-rail"><div className="z-brand"><div className="z-brand-mark">S</div><div><strong>S.kosif</strong><small>Operations & Decision OS</small></div></div>{nav()}<div className="z-rail-foot"><span>Zero-Legacy Rebuild</span><span className="z-online">● محلي</span></div></aside>
  <div className="z-workspace">
   <header className="z-top"><div className="z-top-start"><button className="z-icon-btn z-menu-btn" aria-label="فتح القائمة" onClick={()=>setDrawer(true)}><Menu/></button><button className="z-search-trigger" onClick={()=>setPalette(true)}><Search size={17}/><span>بحث شامل أو أمر سريع</span><kbd className="z-kbd">⌘ K</kbd></button></div><div className="z-top-end"><button className="z-icon-btn" aria-label={dark?'الوضع الفاتح':'الوضع الداكن'} onClick={()=>setDark(x=>!x)}>{dark?<Sun/>:<Moon/>}</button><Button variant="secondary" onClick={()=>setPalette(true)}><Command/>الأوامر</Button></div></header>
   <main className="z-content">{children}</main>
  </div>
 </div>
 <nav className="z-mobilebar">{mobilePrimary.map(x=>{const I=x.icon;return <button key={x.id} className={route===x.id?'active':''} onClick={()=>onRoute(x.id)}><I/><span>{x.short}</span></button>})}</nav>
 {drawer&&<><div className="z-drawer-backdrop" onClick={()=>setDrawer(false)}/><aside className="z-drawer"><div className="z-drawer-head"><div><b>S.kosif</b><div className="z-muted" style={{fontSize:10}}>كل القدرات في بنية واحدة</div></div><button className="z-icon-btn" onClick={()=>setDrawer(false)} aria-label="إغلاق"><X/></button></div><div className="z-navmode"><button className={mode==='daily'?'active':''} onClick={()=>setMode('daily')}>العمل اليومي</button><button className={mode==='advanced'?'active':''} onClick={()=>setMode('advanced')}>متقدم</button></div>{nav(true)}</aside></>}
 <CommandPalette open={palette} onClose={()=>setPalette(false)} onNavigate={onRoute}/>
 </div>
}
export const routeDefinitions=ROUTES;

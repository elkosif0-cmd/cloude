import React,{useEffect,useState}from'react';
import{AppShell,RouteId}from'./layouts/AppShell';
import{CommandView,CatalogView,SalesView}from'./views/DailyViews';
import{InventoryView,FinanceView}from'./views/OperationsFinanceViews';
import{SubscriptionsPanel}from'./views/OperationalToolsViews';
import{IntelligenceView,AuditView,SystemView}from'./views/AdvancedViews';
import{migratePrivateCatalog,migrateIndexedDb}from'./data/repositories';
import{AppErrorBoundary}from'./components/ErrorBoundary';
import'./styles.css';

function routeFromHash():RouteId{
 const v=location.hash.replace(/^#/,'') as RouteId;
 return(['command','sales','inventory','finance','catalog','intelligence','audit','system'] as RouteId[]).includes(v)?v:'command';
}
export default function RebuiltApp(){
 const[route,setRoute]=useState<RouteId>(routeFromHash);
 useEffect(()=>{migratePrivateCatalog();migrateIndexedDb().catch(()=>{});if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{})},[]);
 useEffect(()=>{const fn=()=>setRoute(routeFromHash());addEventListener('hashchange',fn);return()=>removeEventListener('hashchange',fn)},[]);
 const go=(r:RouteId)=>{location.hash=r;setRoute(r);window.scrollTo({top:0,behavior:'smooth'})};
 return <AppErrorBoundary><AppShell route={route} onRoute={go}>
  {route==='command'&&<CommandView go={go}/>}
  {route==='sales'&&<SalesView/>}
  {route==='inventory'&&<><InventoryView/><SubscriptionsPanel/></>}
  {route==='finance'&&<FinanceView/>}
  {route==='catalog'&&<CatalogView/>}
  {route==='intelligence'&&<IntelligenceView/>}
  {route==='audit'&&<AuditView/>}
  {route==='system'&&<SystemView/>}
 </AppShell></AppErrorBoundary>
}

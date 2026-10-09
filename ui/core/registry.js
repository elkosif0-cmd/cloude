/* S.kosif core — capability registry (SK.caps).
   Reads ui/core/capabilities.json (inlined by build.py as window.__SK_CAPS__): the single list
   of screens that the navigation, command palette, permissions and docs are built from.
   Hubs: a screen with "hub":"<parent id>" is a page of its parent's hub — the menu lists the hub
   once (under the parent's "hubLabel"), and the hub's pages open as tabs on top of each other.
   Every page keeps its own id, permission and deep link.
   "hidden": a page that lives inside its hub's screen (e.g. the audit studio inside «مركز المراجعة»):
   searchable and deep-linkable, but not a separate menu entry or hub tab. */
(()=>{
"use strict";
const RAW=window.__SK_CAPS__||{gateways:[],groups:[],capabilities:[],roles:{},tiers:{},sectors:[]};
/* the three entries of the front door (FOUNDATION §3): accounting, audit, helper tools; "home" is each one's first screen */
const gateways=(RAW.gateways||[]).map(g=>Object.freeze({...g}));
const gwById=Object.fromEntries(gateways.map(g=>[g.id,g]));
/* the sectors of the accounting entry (FOUNDATION §3.7): a company belongs to one; the priority sectors come first */
const sectors=(RAW.sectors||[]).map(s=>Object.freeze({...s}));
const sById=Object.fromEntries(sectors.map(s=>[s.id,s]));
const groups=RAW.groups.map(g=>Object.freeze({...g}));
const gById=Object.fromEntries(groups.map(g=>[g.id,g]));
const rawById=Object.fromEntries(RAW.capabilities.map(c=>[c.id,c]));
const hubOf=c=>c.hub&&rawById[c.hub]?c.hub:c.id;
const caps=RAW.capabilities.map(c=>{
  const h=hubOf(c),p=rawById[h];
  const gateway=c.gateway||(gById[c.group]||{}).gateway||(gateways[0]||{}).id||"";
  /* the other entries a screen is shared with ("also": reports, analysis, Jev, settings are layers, never a fourth
     gateway — FOUNDATION §4); a hub's pages inherit the hub's sharing */
  const also=Object.freeze([...new Set([...(c.also||[]),...((p&&p.also)||[])])].filter(g=>g!==gateway&&gwById[g]));
  return Object.freeze({...c,primary:!c.adv,groupLabel:(gById[c.group]||{}).label||"",gateway,gatewayLabel:(gwById[gateway]||{}).label||"",also,company:!!(c.company||(gById[c.group]||{}).company),
    hub:h,hubLabel:p.hubLabel||p.label,isHub:RAW.capabilities.some(x=>x.hub===c.id)});
});
const byId=Object.fromEntries(caps.map(c=>[c.id,c]));
/* R10 (docs/rebuild/HARSH_REVIEW_20261008_ar.md): a screen made for some sectors only ("sectors" in the registry, e.g.
   the carcass lab and the meat blends for meat) is offered only while a company of those sectors is open (FOUNDATION:
   tools are adapted to the sector); a hub's pages follow their hub. A deep link still opens it. */
const sectorNow=()=>{try{return(SK.company&&SK.company.current().sector)||""}catch{return""}};
const fits=c=>{if(!c)return false;const h=byId[c.hub]||c,s=(c.sectors&&c.sectors.length?c.sectors:h.sectors)||[];const now=s.length?sectorNow():"";return!s.length||!now||s.includes(now)};
/* a screen belongs to an entry when it is the screen's own entry or one it is shared with */
const inGw=(c,gid)=>!!c&&(c.gateway===gid||c.also.includes(gid));
/* the pages of a hub: its parent first, then its pages in registry order */
const members=id=>{const c=byId[id];if(!c)return[];const h=byId[c.hub];return[h,...caps.filter(x=>x.hub===h.id&&x.id!==h.id&&!x.hidden)].filter(fits)};
/* R3 (docs/rebuild/DEEP_REVIEW_20261007_ar.md): each entry's menu in the constitution's order, declared on the gateway
   (gateways[].menu = [{id,label,icon,hubs:[hub ids]}]). Only hubs of that entry are kept; a hub of the entry that no
   section lists lands in «أخرى», so the menu can never lose a screen. An entry without a menu falls back to the groups. */
const hubsOf=gid=>caps.filter(c=>inGw(c,gid)&&c.hub===c.id&&!c.hidden&&fits(c));
/* R20 (FOUNDATION §3.12): a menu item is
   - a hub id (the hub once, its pages as tabs on top),
   - a page id of a hub, listed in its own section («نقطة البيع والفاتورة الضريبية» under taxes while its hub sits under sales),
   - {go, tab, label, icon}: a tab of a screen («إقرار الضريبة» is the ledger's tab «vat»; "@ops" is a family's first tab),
   - {installed:true}: the tools the open company added from the tools library (§3.1 «الأدوات المساعدة التي يختار المستخدم
     إضافتها»), which then live in the accounting menu of that company.
   So each constitution section is reached without a second copy of a screen. Only screens of the entry (or installed in the
   company) are kept; a hub of the entry that no section lists lands in «أخرى», so the menu can never lose a screen. */
const installedNow=()=>{try{const P=window.SKosifCompanyPlatform,s=P&&P.state?P.state():null;return s&&Array.isArray(s.installedTools)?s.installedTools.slice():[]}catch{return[]}};
function itemOf(x,gid,all){
  if(typeof x==="string"){const c=byId[x];if(!c||!fits(c))return null;
    if(c.hub===c.id)return all.includes(c)?c:null;
    return inGw(c,gid)?Object.freeze({...c,page:true,hubLabel:c.label}):null}
  if(x&&x.go&&x.tab){const c=byId[x.go];if(!c||!inGw(c,gid)||!fits(c))return null;
    return Object.freeze({...c,id:x.go+">"+x.tab,view:x.go,tab:x.tab,link:true,hubLabel:x.label||c.label,icon:x.icon||c.id})}
  return null;
}
const menuCache={};
function menu(gid){
  const inst=installedNow(),key=gid+"|"+sectorNow()+"|"+inst.join(",");if(menuCache[key])return menuCache[key];
  const g=gwById[gid];if(!g||!Array.isArray(g.menu)||!g.menu.length)return null;
  const all=hubsOf(gid),seen=new Set(),listed=new Set();
  const out=g.menu.map(s=>{
    const raw=(s.hubs||[]).flatMap(x=>x&&x.installed?inst.map(id=>byId[id]).filter(c=>c&&c.hub===c.id&&!c.hidden&&fits(c)&&!listed.has(c.id)).map(c=>Object.freeze({...c,installed:true})):[itemOf(x,gid,all)]);
    const hubs=raw.filter(c=>c&&!seen.has(c.id)&&seen.add(c.id));hubs.forEach(c=>listed.add(c.link?c.view:c.id));
    return {id:s.id,label:s.label,icon:s.icon,hubs};
  }).filter(s=>s.hubs.length);
  const rest=all.filter(c=>!seen.has(c.id));
  if(rest.length)out.push({id:gid+"-more",label:"أخرى",icon:"action",hubs:rest});
  return(menuCache[key]=Object.freeze(out.map(s=>Object.freeze({...s,hubs:Object.freeze(s.hubs)}))));
}
/* the menu section of a screen in an entry: the section that lists the page itself, else its hub's */
const sectionOf=(id,gid)=>{const c=byId[id],m=c&&menu(gid);if(!m)return null;return m.find(s=>s.hubs.some(h=>!h.link&&h.id===c.id))||m.find(s=>s.hubs.some(h=>!h.link&&h.id===c.hub))||null};
/* whether an entry's menu offers the screen (a hub, one of its pages, a tab of it, or a tool installed in the company) */
const inMenu=(id,gid)=>{const c=byId[id],m=c&&menu(gid);return!!m&&m.some(s=>s.hubs.some(h=>(h.link?h.view:h.id)===c.id||h.id===c.hub))};
SK.caps=Object.freeze({
  all:()=>caps,
  gateways:()=>gateways,
  gateway:gid=>gwById[gid]||null,
  /* the first screen of an entry: its declared home, else its first visible screen */
  gatewayHome:gid=>{const g=gwById[gid];if(g&&g.home&&byId[g.home])return g.home;const c=caps.find(x=>x.gateway===gid&&!x.hidden);return c?c.id:""},
  inGatewayOf:inGw,
  sectors:()=>sectors,
  sector:id=>sById[id]||null,
  groups:()=>groups,
  group:gid=>gById[gid]||null,
  groupsInGateway:gid=>groups.filter(g=>caps.some(c=>inGw(c,gid)&&c.group===g.id)),
  inGateway:gid=>caps.filter(c=>inGw(c,gid)),
  hubsInGateway:gid=>caps.filter(c=>inGw(c,gid)&&c.hub===c.id&&!c.hidden&&fits(c)),
  /* the studios of the open company: their screens carry the company bar and the company chooser */
  companyGroups:()=>groups.filter(g=>g.company),
  get:id=>byId[id]||null,
  inGroup:gid=>caps.filter(c=>c.group===gid),
  /* the menu entries of a domain: one per hub (the parent screen) */
  hubsInGroup:gid=>caps.filter(c=>c.group===gid&&c.hub===c.id&&!c.hidden&&fits(c)),
  /* whether a screen is offered to the open company's sector */
  fits:id=>fits(byId[id]),
  visible:()=>caps.filter(c=>!c.hidden),
  /* the work flow: what feeds a screen and what it feeds ("feeds" in the registry; the inverse is computed) */
  flow:id=>{const c=byId[id];if(!c)return{from:[],to:[]};return{from:caps.filter(x=>(x.feeds||[]).includes(id)),to:(c.feeds||[]).map(f=>byId[f]).filter(Boolean)}},
  siblings:id=>{const c=byId[id];return c?caps.filter(x=>x.group===c.group):[]},
  hub:id=>{const c=byId[id];return c?byId[c.hub]:null},
  members,
  menu,
  inMenu,
  section:sectionOf,
  /* "البرنامج المحاسبي الكامل › القيود والدفاتر › الدفاتر المحاسبية" — in the entry the user is in (its menu section),
     else the screen's own entry and group */
  path:(id,gid)=>{const c=byId[id];if(!c)return"";const g=gid||(window.SK&&SK.gate&&SK.gate.current&&SK.gate.current())||"";
    const inG=g&&inGw(c,g),sec=inG?sectionOf(id,g):null,gl=inG?(gwById[g]||{}).label:c.gatewayLabel;
    const p=[gl,sec?sec.label:c.groupLabel].filter((x,i,a)=>x&&a.indexOf(x)===i);if(members(id).length>1)p.push(c.hubLabel);return p.join(" › ")},
  advancedIds:()=>caps.filter(c=>!c.primary).map(c=>c.id),
  roles:()=>RAW.roles||{},
  tiers:()=>RAW.tiers||{}
});
})();

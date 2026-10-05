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
/* a screen belongs to an entry when it is the screen's own entry or one it is shared with */
const inGw=(c,gid)=>!!c&&(c.gateway===gid||c.also.includes(gid));
/* the pages of a hub: its parent first, then its pages in registry order */
const members=id=>{const c=byId[id];if(!c)return[];const h=byId[c.hub];return[h,...caps.filter(x=>x.hub===h.id&&x.id!==h.id&&!x.hidden)]};
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
  hubsInGateway:gid=>caps.filter(c=>inGw(c,gid)&&c.hub===c.id&&!c.hidden),
  /* the studios of the open company: their screens carry the company bar and the company chooser */
  companyGroups:()=>groups.filter(g=>g.company),
  get:id=>byId[id]||null,
  inGroup:gid=>caps.filter(c=>c.group===gid),
  /* the menu entries of a domain: one per hub (the parent screen) */
  hubsInGroup:gid=>caps.filter(c=>c.group===gid&&c.hub===c.id&&!c.hidden),
  visible:()=>caps.filter(c=>!c.hidden),
  /* the work flow: what feeds a screen and what it feeds ("feeds" in the registry; the inverse is computed) */
  flow:id=>{const c=byId[id];if(!c)return{from:[],to:[]};return{from:caps.filter(x=>(x.feeds||[]).includes(id)),to:(c.feeds||[]).map(f=>byId[f]).filter(Boolean)}},
  siblings:id=>{const c=byId[id];return c?caps.filter(x=>x.group===c.group):[]},
  hub:id=>{const c=byId[id];return c?byId[c.hub]:null},
  members,
  /* "البرنامج المحاسبي الكامل › المالية والدفاتر › الدفاتر المحاسبية" */
  path:id=>{const c=byId[id];if(!c)return"";const p=[c.gatewayLabel,c.groupLabel].filter((x,i,a)=>x&&a.indexOf(x)===i);if(members(id).length>1)p.push(c.hubLabel);return p.join(" › ")},
  advancedIds:()=>caps.filter(c=>!c.primary).map(c=>c.id),
  roles:()=>RAW.roles||{},
  tiers:()=>RAW.tiers||{}
});
})();

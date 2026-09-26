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
const RAW=window.__SK_CAPS__||{groups:[],capabilities:[],roles:{},tiers:{}};
const groups=RAW.groups.map(g=>Object.freeze({...g}));
const gById=Object.fromEntries(groups.map(g=>[g.id,g]));
const rawById=Object.fromEntries(RAW.capabilities.map(c=>[c.id,c]));
const hubOf=c=>c.hub&&rawById[c.hub]?c.hub:c.id;
const caps=RAW.capabilities.map(c=>{
  const h=hubOf(c),p=rawById[h];
  return Object.freeze({...c,primary:!c.adv,groupLabel:(gById[c.group]||{}).label||"",
    hub:h,hubLabel:p.hubLabel||p.label,isHub:RAW.capabilities.some(x=>x.hub===c.id)});
});
const byId=Object.fromEntries(caps.map(c=>[c.id,c]));
/* the pages of a hub: its parent first, then its pages in registry order */
const members=id=>{const c=byId[id];if(!c)return[];const h=byId[c.hub];return[h,...caps.filter(x=>x.hub===h.id&&x.id!==h.id&&!x.hidden)]};
SK.caps=Object.freeze({
  all:()=>caps,
  groups:()=>groups,
  get:id=>byId[id]||null,
  inGroup:gid=>caps.filter(c=>c.group===gid),
  /* the menu entries of a domain: one per hub (the parent screen) */
  hubsInGroup:gid=>caps.filter(c=>c.group===gid&&c.hub===c.id&&!c.hidden),
  visible:()=>caps.filter(c=>!c.hidden),
  siblings:id=>{const c=byId[id];return c?caps.filter(x=>x.group===c.group):[]},
  hub:id=>{const c=byId[id];return c?byId[c.hub]:null},
  members,
  /* "المبيعات والعملاء › العملاء والائتمان" for a page inside a hub */
  path:id=>{const c=byId[id];if(!c)return"";return c.groupLabel+(members(id).length>1?" › "+c.hubLabel:"")},
  advancedIds:()=>caps.filter(c=>!c.primary).map(c=>c.id),
  roles:()=>RAW.roles||{},
  tiers:()=>RAW.tiers||{}
});
})();

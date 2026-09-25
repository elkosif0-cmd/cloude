/* S.kosif core — capability registry (SK.caps).
   Reads ui/core/capabilities.json (inlined by build.py as window.__SK_CAPS__): the single list
   of screens that the navigation, command palette, permissions and docs are built from. */
(()=>{
"use strict";
const RAW=window.__SK_CAPS__||{groups:[],capabilities:[],roles:{},tiers:{}};
const groups=RAW.groups.map(g=>Object.freeze({...g}));
const gById=Object.fromEntries(groups.map(g=>[g.id,g]));
const caps=RAW.capabilities.map(c=>Object.freeze({...c,primary:!c.adv,groupLabel:(gById[c.group]||{}).label||""}));
const byId=Object.fromEntries(caps.map(c=>[c.id,c]));
SK.caps=Object.freeze({
  all:()=>caps,
  groups:()=>groups,
  get:id=>byId[id]||null,
  inGroup:gid=>caps.filter(c=>c.group===gid),
  siblings:id=>{const c=byId[id];return c?caps.filter(x=>x.group===c.group):[]},
  advancedIds:()=>caps.filter(c=>!c.primary).map(c=>c.id),
  roles:()=>RAW.roles||{},
  tiers:()=>RAW.tiers||{}
});
})();

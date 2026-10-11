/* S.kosif core — permissions (SK.perm): User → Role → Capability → Action.
   Roles and their capabilities come from capabilities.json. On this device the role is a
   local working mode (hides screens and blocks actions in the UI); server-side enforcement
   for shared workspaces is done by capabilities-v2/worker.js. */
(()=>{
"use strict";
const KEY="skosif_role_mode";
const roles=()=>SK.caps.roles();
function role(){const r=SK.load(KEY,"admin");return roles()[r]?r:"admin"}
function def(){return roles()[role()]||{caps:"*",actions:[]}}
function can(capId,action="view"){
  if(capId==="settings"&&action==="view")return true;
  const d=def();
  const capOk=d.caps==="*"||(Array.isArray(d.caps)&&d.caps.includes(capId));
  return capOk&&(!action||action==="view"||(d.actions||[]).includes(action));
}
function setRole(r){if(!roles()[r])return false;SK.save(KEY,r);SK.bus&&SK.bus.emit("role",{role:r});return true}
function list(){return Object.entries(roles()).map(([id,r])=>({id,label:r.label,caps:r.caps,actions:r.actions}))}
SK.perm=Object.freeze({role,can,setRole,list,label:()=>(roles()[role()]||{}).label||role()});
})();

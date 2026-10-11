/* SQC — the entry the user came through: accounting, audit or helper tools (SK.gate).
   FOUNDATION §3: the front door chooses the section first; the shell paints only that section's menu, with a
   switcher at the top of the rail. The choice lives for the session (sessionStorage sqc_gate): the front door
   sets it through the one-time intent (ui/core/helper-space.js), a deep link into a screen of another section
   switches to that section, and the switcher changes it by hand. A bundle company chosen at the audit door
   (sqc_gate_corpus) is opened as the audit file's client once the company and the audit screen are ready. */
(()=>{
"use strict";
const KEY="sqc_gate",CORPUS="sqc_gate_corpus",AUDIT_NEW="sqc_gate_audit_new",PIN="sqc_gate_pin";
/* pinned: the door chose the section and its first screen (the pin's value) is still on its way; the screens the app
   paints meanwhile — the default one, then the last one opened, maybe of another section — must not switch the section
   (ui/core/helper-space.js sets it; the shell clears it when that screen arrives; a landing that never arrives, e.g. a
   screen the role may not open, releases the pin after a few seconds) */
const pinned=()=>{try{return sessionStorage.getItem(PIN)||""}catch{return ""}};
const unpin=()=>{try{sessionStorage.removeItem(PIN)}catch{}};
function watchPin(){if(!pinned())return;setTimeout(()=>{if(pinned()){unpin();if(window.SKosifShell&&SKosifShell.paint)SKosifShell.paint()}},8000)}
const ids=()=>SK.caps.gateways().map(g=>g.id);
const valid=g=>!!g&&ids().includes(g);
const read=()=>{try{return sessionStorage.getItem(KEY)||""}catch{return ""}};
const write=g=>{try{sessionStorage.setItem(KEY,g)}catch{}};
const ofView=id=>{const c=SK.caps.get(id);return c?c.gateway:""};
/* the section in force: the one chosen at the door, else the one the open screen belongs to, else the first */
function current(){const g=read();if(valid(g))return g;const c=window.SKosifCore,v=c&&c.view?ofView(c.view()):"";return valid(v)?v:ids()[0]||""}
/* change the section: the menu follows; a screen outside the new section gives way to the section's first screen.
   {go:false} only records the section (a deep link landed on one of its screens); {silent:true} is for the shell,
   which is already painting */
function set(g,opts={}){
  if(!valid(g))return false;const prev=read();write(g);if(!opts.silent)unpin();
  if(opts.go!==false){const c=window.SKosifCore,cap=c&&c.view?SK.caps.get(c.view()):null;
    if(c&&!(cap&&SK.caps.inGatewayOf(cap,g))){const home=SK.caps.gatewayHome(g);if(home&&(!SK.perm||SK.perm.can(home)))c.go(home)}}
  if(prev!==g&&!opts.silent){SK.bus&&SK.bus.emit("gate",g);if(window.SKosifShell&&SKosifShell.paint)SKosifShell.paint()}
  return true;
}
const label=g=>(SK.caps.gateway(g)||{}).label||"";
/* Independent Audit commands wait only for the Audit module itself. They never require or switch an accounting/helper company. */
function auditNew(){
  let pending="";try{pending=sessionStorage.getItem(AUDIT_NEW)||""}catch{}if(!pending)return;
  let tries=0;
  const t=()=>{
    const R=window.SKosifTBReview;
    if(R&&R.newEngagement){try{sessionStorage.removeItem(AUDIT_NEW)}catch{}R.newEngagement();return}
    if(++tries<160)setTimeout(t,250);
  };
  t();
}
function corpus(){
  let id="";try{id=sessionStorage.getItem(CORPUS)||""}catch{}if(!id)return;
  let tries=0;
  const t=()=>{
    const R=window.SKosifTBReview;
    if(R&&R.loadCorpus){try{sessionStorage.removeItem(CORPUS)}catch{}R.loadCorpus(id);return}
    if(++tries<160)setTimeout(t,250);
  };
  t();
}
SK.gate=Object.freeze({current,set,label,valid,ofView,pinned,unpin,list:()=>SK.caps.gateways(),home:g=>SK.caps.gatewayHome(g||current()),KEY,CORPUS,AUDIT_NEW,PIN});
const boot=()=>{watchPin();auditNew();corpus()};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();

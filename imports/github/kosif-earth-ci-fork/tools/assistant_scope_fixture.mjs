import vm from 'node:vm';
import fs from 'node:fs';
import {scopeFixture,keys} from './management_report_fixtures.mjs';
export const chatKey=(user='u1',company='c1')=>'skosif_chat_v2:'+encodeURIComponent(JSON.stringify([user,company]));
export const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
export const tick=()=>new Promise(setImmediate);
const channelsByStore=new WeakMap();
// Real SK.load/save, helper-space transitions, assistant and lock entry point. Synthetic host only.
// Deliberately no company-prefixing storage adapter; localStorage is one device-global string map.
export function assistantHarness({records,seed=scopeFixture(),provider,engines=false,broadcast=true}={}){
 records=records||new Map(Object.entries(seed).map(([k,v])=>[k,JSON.stringify(v)]));
 const timers=[],listeners=new Map(),subs=new Map(),writes=[],requests=[],effects=[],nodes=[];
 const emit=(type,event={})=>(listeners.get(type)||[]).forEach(fn=>fn(event));
 const on=(type,fn)=>{if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)};
 class Node {constructor(){this.innerHTML='';this.textContent='';this.value='';this.dataset={};this.style={};this.hidden=false;this.children={};this.handlers={};this.classList={toggle(){},add(){},remove(){}};nodes.push(this)}
  querySelector(s){return this.children[s]||null} querySelectorAll(){return []}
  setAttribute(){} addEventListener(t,fn){this.handlers[t]=fn} appendChild(){} focus(){} insertAdjacentHTML(_,html){this.innerHTML+=html}
 }
 const body=new Node();const doc={readyState:'loading',body,visibilityState:'visible',addEventListener:on,getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement(tag){const n=new Node();if(tag==='section')for(const s of ['.ska-msgs','.ska-sugg','.ska-status','textarea','.ska-in','.ska-speak input'])n.children[s]=new Node();return n}};
 const localStorage={get length(){return records.size},key:i=>[...records.keys()][i]??null,getItem:k=>records.get(k)??null,setItem(k,v){records.set(k,String(v));writes.push(k)},removeItem:k=>records.delete(k)};
 const sessions=new Map(),sessionStorage={getItem:k=>sessions.get(k)??null,setItem:(k,v)=>sessions.set(k,String(v)),removeItem:k=>sessions.delete(k)};
 const snapshots=new Map();const indexedDB={databases:async()=>[],open(){const r={};setImmediate(()=>{r.result={objectStoreNames:{contains:()=>true},close(){},transaction(){const t={};t.objectStore=()=>({put(v,k){snapshots.set(k,v);return{result:k}},get:k=>({result:snapshots.get(k)})});setImmediate(()=>t.oncomplete?.());return t}};r.onsuccess?.()});return r}};
 const W={console,Date,Intl,Math,AbortController,TextEncoder,structuredClone,document:doc,localStorage,sessionStorage,indexedDB,addEventListener:on,
  setTimeout:(fn,ms)=>{if(ms===250){setImmediate(fn);return 0}timers.push({fn,ms});return timers.length},clearTimeout(){},setInterval(){},location:{replace:()=>effects.push('lock'),reload(){}},speechSynthesis:{cancel:()=>effects.push('speech-cancel')}};
 if(broadcast){if(!channelsByStore.has(records))channelsByStore.set(records,new Set());const channels=channelsByStore.get(records);
  W.BroadcastChannel=class {constructor(name){this.name=name;channels.add(this)}postMessage(data){for(const peer of channels)if(peer!==this&&peer.name===this.name)setImmediate(()=>peer.onmessage?.({data:structuredClone(data)}))}close(){channels.delete(this)}};
 }
 W.window=W;vm.createContext(W);
 const run=file=>vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),W,{filename:file});
 run('ui/core/sk.js');Object.assign(W.SK,{bus:{on(t,fn){if(!subs.has(t))subs.set(t,[]);subs.get(t).push(fn)},emit(t,e){(subs.get(t)||[]).forEach(fn=>fn(e))}},
  caps:{get:()=>null,all:()=>[],groups:()=>[]},perm:{can:()=>true,label:()=> 'synthetic'},audit:{log(){}},errors:{report(){}},confirm:async()=>true});
 W.SKosifCore={view:()=> 'masterdata',toast(){}};
 W.SK.company={current:()=>{const d=W.SK.load(keys.companies,{});return (d.companies||[]).find(c=>c.id===d.active?.companyId)||{}}};
 run('ui/core/helper-space.js');
 W.SKosifShell={setAppearance:mode=>effects.push(mode)};
 W.SKosifAI={ready:()=>!!provider,generate:async(body,opts)=>{requests.push(structuredClone(body));return provider(body,opts)}};
 if(engines){run('ui/core/engines.js');W.SKosifCompanyPlatform={profile:()=>W.SK.company.current()};run('ui/core/standards.js')}
 run('ui/features/assistant.js');W.SKosifAssistant.open();const panel=nodes.find(n=>n.className==='ska-panel');
 return {W,run,records,writes,requests,effects,panel,emit,bus:(t,e)=>W.SK.bus.emit(t,e),
  html:()=>panel.children['.ska-msgs'].innerHTML,send:t=>W.SKosifAssistant.send(t),tool:(n,a)=>W.SKosifAssistant.run(n,a),
  set:(k,v)=>records.set(k,JSON.stringify(v)),get:k=>W.SK.load(k,null),
  history:(u='u1',c='c1')=>W.SK.load(chatKey(u,c),null)?.messages||[],
  select:async id=>W.SKosifSpace.switchTo(id,id,{reload:false}),user:async id=>W.SKosifSpace.switchUser(id,'',{reload:false}),
  flush:ms=>{const due=timers.filter(t=>t.ms===ms);for(const t of due){timers.splice(timers.indexOf(t),1);t.fn()}},
  clear:()=>panel.handlers.click({target:{closest:s=>s==='[data-a]'?{dataset:{a:'clear'}}:null}})};
}
export const reply=text=>({candidates:[{content:{parts:[{text}]}}]});
export {scopeFixture,keys};

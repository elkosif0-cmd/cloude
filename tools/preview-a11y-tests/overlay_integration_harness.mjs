import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {harness} from './output_focus_harness.mjs';

export const overlayRoot=()=>path.resolve(process.env.SQC_OUTPUT_ROOT||new URL('../preview-a11y-repair',import.meta.url).pathname);
export const moduleFiles={palette:'ui/components/palette.js',keys:'ui/components/keys.js',assistant:'ui/features/assistant.js'};
export function integrated({sources={},modules=['palette','keys','assistant']}={}){
  const h=harness({root:overlayRoot(),coreDialogs:true}),SK=h.context.SK;
  Object.assign(SK,{$:(s,r=h.document)=>r?.querySelector(s),$$:(s,r=h.document)=>[...r?.querySelectorAll(s)||[]],load:(_k,f)=>f,save(){},icons:{search:'Search'},icon:()=>'',caps:{all:()=>[],groups:()=>[],get:()=>null,path:()=>'',hubsInGroup:()=>[],members:()=>[]},perm:{can:()=>true,role:()=> 'admin'},errors:{report:e=>{throw e}},store:{backup:async()=>{}},money:String});
  h.host.SK=SK;h.host.SKosifCore={view:()=> 'reports',catalog:()=>({items:[]}),go(){},act(){},search(){}};h.context.SKosifCore=h.host.SKosifCore;
  h.context.innerWidth=1180;h.context.Node.prototype.scrollIntoView=function(){};
  for(const name of modules){const file=moduleFiles[name],code=sources[name]??fs.readFileSync(path.join(overlayRoot(),file),'utf8');vm.runInContext(code,h.context,{filename:file});const globalName={palette:'SKosifCommand',keys:'SKosifKeys',assistant:'SKosifAssistant'}[name];h.context[globalName]=h.host[globalName];}
  return h;
}
// Dispatch an actual module listener chain. The original fixture's document-only
// dispatch intentionally cannot model target listeners such as palette Escape.
export function key(h,key,more={}){
  const target=more.target||h.document.activeElement,e={key,code:more.code||'',target,defaultPrevented:false,...more};
  e.preventDefault=()=>{e.defaultPrevented=true};e.stopPropagation=()=>{e.stopped=true};e.stopImmediatePropagation=()=>{e.stopped=true;e.immediate=true};
  function invoke(node,capture){e.immediate=false;for(const rec of [...node.listeners?.keydown||[]])if(!!rec.capture===capture){rec.f(e);if(e.immediate)break;}}
  invoke(h.host,true);if(e.stopped)return e;invoke(h.document,true);if(e.stopped)return e;
  const ancestors=[];for(let n=target?.parentElement;n;n=n.parentElement)ancestors.push(n);
  for(const n of [...ancestors].reverse()){invoke(n,true);if(e.stopped)return e;}
  if(target){invoke(target,true);if(!e.immediate)invoke(target,false);}if(e.stopped)return e;
  for(const n of ancestors){invoke(n,false);if(e.stopped)return e;}
  invoke(h.document,false);if(!e.stopped)invoke(h.host,false);return e;
}
export function begin(h){const opener=h.button('overlay-opener');opener.focus();h.open();return opener;}
export function paletteOpen(h,mod='ctrlKey'){return key(h,'k',{code:'KeyK',[mod]:true});}
export function visibleAssistant(h){const p=h.document.querySelector('.ska-panel');return !!p&&!p.hidden;}

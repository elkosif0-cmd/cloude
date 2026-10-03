import fs from 'node:fs';
import vm from 'node:vm';
export function harness() {
  const listeners = new Map(), values = new Map(), bus = new Map();
  const doc = { readyState:'loading', activeElement:null, documentElement:{},
    addEventListener:(k,fn)=>{if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(fn)},
    removeEventListener:(k,fn)=>listeners.get(k)?.delete(fn),
    querySelector:()=>null, querySelectorAll:()=>[], getElementById:()=>null,
  };
  const ctx={document:doc, console, setTimeout:()=>1, clearTimeout(){}, setInterval:()=>1, clearInterval(){},
    addEventListener:doc.addEventListener, removeEventListener:doc.removeEventListener,
    localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)},
    location:{href:'https://example.test/app-safe.html',pathname:'/app-safe.html',search:'',hash:''},
    getComputedStyle:()=>({visibility:'visible',display:'block'}),
    history:{state:null,entries:[],replaceState(s){this.state=s},pushState(s){this.state=s;this.entries.push(s)}},
    scrollX:0,scrollY:0,scrollTo(){},CSS:{escape:s=>s},
    SK:{esc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
      icon:()=>'', icons:{},num:Number,toast(){},load:(k,d)=>values.has(k)?JSON.parse(values.get(k)):d,
      save:(k,v)=>{values.set(k,JSON.stringify(v));return true},
      bus:{on:(k,f)=>{if(!bus.has(k))bus.set(k,new Set());bus.get(k).add(f)},emit:(k,d)=>bus.get(k)?.forEach(f=>f(d))},
      caps:{get:id=>['dash','catalog','ledger','tasks','risks','followup','tbreview','auditbench'].includes(id)?{id,label:id,group:'helpers'}:null},
      perm:{can:()=>true,label:()=> 'test'}},
  };
  ctx.window=ctx;vm.createContext(ctx);
  return {ctx,values,doc,load:p=>vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p}),
    fire:(key,extra={})=>{const e={key,preventDefault(){this.prevented=true},stopPropagation(){},...extra};[...(listeners.get('keydown')||[])].forEach(fn=>fn(e));return e},
    dispatch:(type,e={})=>[...(listeners.get(type)||[])].forEach(fn=>fn(e))};
}
export function focusable(doc,name) {return {name,isConnected:true,disabled:false,hidden:false,tabIndex:0,
  closest:()=>null,getClientRects:()=>[{}],getAttribute:()=>null,
  focus(){doc.activeElement=this},setAttribute(){}};}

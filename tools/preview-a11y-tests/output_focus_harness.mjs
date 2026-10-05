import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Behavioral seam only, not a browser/AX/layout implementation. Runs output.js
// unchanged. Timers are deterministic; document.open clears document/window
// listeners; focus is tracked per owning document and through iframe elements.
export function harness({root=process.env.SQC_OUTPUT_ROOT||'../report-guard-872',preview=true,sourceTransform=x=>x,coreDialogs=false}={}) {
  if (!path.isAbsolute(root)) root=path.resolve(import.meta.dirname,root);
  const effects={focus:[],prints:[],downloads:[],shares:[],windows:[],errors:[]};
  const timers=new Map(),observers=new Set();let timerId=0,host;
  class EventTarget {
    constructor(){this.listeners={};}
    addEventListener(k,f,o){const a=this.listeners[k]??=[];if(!a.some(x=>x.f===f&&!!x.capture===!!(o===true||o?.capture)))a.push({f,capture:o===true||o?.capture});}
    removeEventListener(k,f){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x.f!==f);}
    dispatch(k,e={}){e.type=k;e.target??=this;e.defaultPrevented??=false;e.preventDefault??=()=>{e.defaultPrevented=true};e.stopPropagation??=()=>{e.stopped=true};e.stopImmediatePropagation??=()=>{e.stopped=true;e.immediate=true};for(const {f} of [...this.listeners[k]||[]]){f(e);if(e.immediate)break;}return e;}
  }
  function simpleMatch(n,selector) {
    selector=selector.trim();if(!selector)return false;
    if(selector==='*')return true;
    const nots=[...selector.matchAll(/:not\(([^)]+)\)/g)].map(x=>x[1]);selector=selector.replace(/:not\([^)]+\)/g,'');
    if(nots.some(s=>simpleMatch(n,s)))return false;
    if(selector.includes(':disabled')){if(!n.disabled)return false;selector=selector.replace(':disabled','');}
    if(selector.includes(':enabled')){if(n.disabled)return false;selector=selector.replace(':enabled','');}
    if(selector.includes(':checked')){if(!n.checked)return false;selector=selector.replace(':checked','');}
    const tag=selector.match(/^[a-zA-Z][\w-]*/);if(tag&&n.tagName!==tag[0].toUpperCase())return false;
    for(const [,id]of selector.matchAll(/#([\w-]+)/g))if(n.id!==id)return false;
    for(const [,cl]of selector.matchAll(/\.([\w-]+)/g))if(!n.className.split(/\s+/).includes(cl))return false;
    for(const [,key,op,value] of selector.matchAll(/\[([^\]\s=^$*~|]+)\s*(?:([~|^$*]?=)\s*["']?([^\]"']*)["']?)?\]/g)){
      const v=n.getAttribute(key);if(v===null)return false;if(op==='='&&v!==value)return false;if(op==='^='&&!v.startsWith(value))return false;
    }
    return true;
  }
  function matches(n,s){return s.split(',').some(s=>{const bits=s.trim().split(/\s+(?![^[]*\])/);if(!simpleMatch(n,bits.pop()))return false;let p=n.parentElement;while(bits.length){const b=bits.pop();while(p&&!simpleMatch(p,b))p=p.parentElement;if(!p)return false;p=p.parentElement;}return true;});}
  class Node extends EventTarget {
    constructor(tag='div',doc){super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];this.attrs={};this.dataset={};this._text='';this._html='';this.style={_priorities:{},setProperty(k,v,priority=''){this[k]=String(v);this._priorities[k]=priority},getPropertyValue(k){return this[k]||''},getPropertyPriority(k){return this._priorities[k]||''},removeProperty(k){delete this[k];delete this._priorities[k]}};this.disabled=false;this.hidden=false;this.inert=false;this.checked=false;this.open=false;this.className='';this.id='';this.classList={add:(...xs)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...xs])].join(' ')},remove:(...xs)=>{this.className=this.className.split(/\s+/).filter(x=>!xs.includes(x)).join(' ')},contains:x=>this.className.split(/\s+/).includes(x),toggle:(x,on)=>{on??=!this.classList.contains(x);this.classList[on?'add':'remove'](x);return on;}};}
    get isConnected(){return this===this.ownerDocument?.documentElement||!!this.parentElement?.isConnected;}
    get parentNode(){return this.parentElement||null;}
    get nextElementSibling(){const a=this.parentElement?.children||[];return a[a.indexOf(this)+1]||null;}
    get previousElementSibling(){const a=this.parentElement?.children||[];return a[a.indexOf(this)-1]||null;}
    get firstElementChild(){return this.children[0]||null;}
    get tabIndex(){const x=this.getAttribute('tabindex');return x!==null?Number(x):(/^(BUTTON|SELECT|TEXTAREA|INPUT|IFRAME|SUMMARY)$/.test(this.tagName)||this.tagName==='A'&&this.hasAttribute('href')?0:-1);}
    set tabIndex(v){this.setAttribute('tabindex',v);}
    get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
    set textContent(v){this._text=String(v);for(const n of this.children)n.parentElement=null;this.children=[];this._html='';}
    get innerText(){return this.textContent;}
    set innerHTML(v){this._html=String(v);this._text='';for(const n of this.children)n.parentElement=null;this.children=[];parseHTML(this,String(v));}
    get innerHTML(){return this._html||this._text+this.children.map(x=>x.outerHTML).join('');}
    get outerHTML(){return '<'+this.tagName.toLowerCase()+Object.entries(this.attrs).map(([k,v])=>' '+k+'="'+v+'"').join('')+'>'+this.innerHTML+'</'+this.tagName.toLowerCase()+'>';}
    appendChild(n){n.parentElement?.removeChild(n);n.parentElement=this;n.ownerDocument??=this.ownerDocument;this.children.push(n);return n;}
    append(...ns){for(const n of ns)this.appendChild(n);}
    prepend(n){this.appendChild(n);this.children.unshift(this.children.pop());}
    removeChild(n){this.children=this.children.filter(x=>x!==n);n.parentElement=null;return n;}
    remove(){if(this.contains(this.ownerDocument.activeElement))this.ownerDocument.activeElement=this.ownerDocument.body;this.parentElement?.removeChild(this);}
    setAttribute(k,v){v=String(v);this.attrs[k]=v;if(k==='class')this.className=v;if(k==='id')this.id=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=v;if(['inert','hidden','disabled','checked','open'].includes(k))this[k]=true;if(k==='type')this.type=v;}
    getAttribute(k){if(k==='class')return this.className||null;if(k==='id')return this.id||null;return this.attrs[k]??null;}
    hasAttribute(k){return this.getAttribute(k)!==null;}
    removeAttribute(k){delete this.attrs[k];if(['inert','hidden','disabled','checked','open'].includes(k))this[k]=false;}
    toggleAttribute(k,force){force??=!this.hasAttribute(k);force?this.setAttribute(k,''):this.removeAttribute(k);return force;}
    contains(n){return n===this||this.children.some(x=>x.contains(n));}
    matches(s){return matches(this,s);}
    closest(s){for(let n=this;n;n=n.parentElement)if(matches(n,s))return n;return null;}
    querySelectorAll(s){return this.children.flatMap(n=>[...(matches(n,s)?[n]:[]),...n.querySelectorAll(s)]);}
    querySelector(s){return this.querySelectorAll(s)[0]||null;}
    getClientRects(){let n=this;while(n){if(n.hidden||n.style.display==='none')return [];if(n.parentElement?.tagName==='DETAILS'&&!n.parentElement.open&&n.tagName!=='SUMMARY')return [];n=n.parentElement;}return this.isConnected?[{width:100,height:30}]:[];}
    getBoundingClientRect(){return {x:0,y:0,width:100,height:30,top:0,left:0,bottom:30,right:100};}
    focus(){const d=this.ownerDocument;if(!this.isConnected||this.disabled||this.closest('[inert],[hidden]'))return;if(d.activeElement===this)return;d.activeElement=this;if(d.defaultView.frameElement)d.defaultView.frameElement.ownerDocument.activeElement=d.defaultView.frameElement;effects.focus.push({node:this,document:d});d.dispatch('focusin',{target:this});}
    blur(){if(this.ownerDocument.activeElement===this)this.ownerDocument.activeElement=this.ownerDocument.body;}
    cloneNode(deep){const n=new Node(this.tagName,this.ownerDocument);Object.assign(n.attrs,this.attrs);n.className=this.className;n._text=this._text;n._html=this._html;if(deep)this.children.forEach(x=>n.appendChild(x.cloneNode(true)));return n;}
    set srcdoc(v){this.contentDocument.open();this.contentDocument.write(v);this.contentDocument.close();queueMicrotask(()=>this.dispatch('load'));}
    get srcdoc(){return this.contentDocument.documentElement.outerHTML;}
  }
  function parseHTML(root,html){const stack=[root],voids=new Set(['INPUT','META','LINK','IMG','BR','HR','WBR','SOURCE']);let m;const re=/<\/?[\w-]+\b[^>]*>|[^<]+/g;while(m=re.exec(html)){const part=m[0];if(part.startsWith('</')){const tag=part.match(/^<\/([\w-]+)/)[1].toUpperCase();let i=stack.length-1;while(i>0&&stack[i].tagName!==tag)i--;if(i)stack.length=i;}else if(part.startsWith('<')){const tag=part.match(/^<([\w-]+)/)[1],n=root.ownerDocument.createElement(tag);for(const [,key,,quoted,unquoted]of part.slice(tag.length+1,-1).matchAll(/([^\s=/>]+)(?:\s*=\s*(?:(["'])(.*?)\2|([^\s>]+)))?/g))n.setAttribute(key,quoted??unquoted??'');stack.at(-1).appendChild(n);if(!voids.has(n.tagName)&&!part.endsWith('/>'))stack.push(n);}else stack.at(-1)._text+=part.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}}
  function makeDocument(w){const d=new EventTarget();d.defaultView=w;d.nodeType=9;d.createElement=tag=>{const n=new Node(tag,d);if(tag.toLowerCase()==='iframe'){n.contentWindow=makeWindow(n);n.contentDocument=n.contentWindow.document;}return n;};d.documentElement=d.createElement('html');d.head=d.createElement('head');d.body=d.createElement('body');d.documentElement.append(d.head,d.body);d.activeElement=d.body;d.title='';d._html='';d.open=()=>{d.listeners={};w.listeners={};d._html='';d.body.textContent='';d.head.textContent='';};d.write=html=>{d._html+=html;d.title=(d._html.match(/<title>(.*?)<\/title>/s)||[])[1]||'';d.head.innerHTML=(d._html.match(/<head[^>]*>([\s\S]*?)<\/head>/)||[])[1]||'';d.body.innerHTML=(d._html.match(/<body[^>]*>([\s\S]*)<\/body>/)||[])[1]||d._html;};d.close=()=>{};d.querySelectorAll=s=>d.documentElement.querySelectorAll(s);d.querySelector=s=>d.documentElement.querySelector(s);d.getElementById=id=>d.querySelector('#'+id);d.contains=n=>d.documentElement.contains(n);d.hasFocus=()=>true;return d;}
  function makeWindow(frameElement){const w=new EventTarget();w.frameElement=frameElement;w.document=makeDocument(w);w.closed=false;w.focus=()=>{if(frameElement)frameElement.focus()};w.print=()=>{w.dispatch('beforeprint');effects.prints.push(w.document.body.textContent)};w.close=()=>{w.closed=true;w.dispatch('pagehide')};w.getComputedStyle=n=>({display:n.hidden?'none':n.style.display||'block',visibility:n.style.visibility||'visible'});return w;}
  host=makeWindow();const document=host.document;host.open=()=>{const w=makeWindow();effects.windows.push(w);return w;};host.location={href:'https://example.invalid/app/',hash:'#reports'};
  const SK={esc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),toast(){},print:{options:()=>({preview,paper:'A4'}),css:()=>'',set(){}},download:(name,blob)=>effects.downloads.push({name,blob}),audit:{log(){}},company:{current:()=>({id:'a',companyId:'a',periodId:'p1'}),ctx:()=>({companyId:'a',periodId:'p1'})}};
  const context=vm.createContext({window:host,document,SK,HTMLElement:Node,Element:Node,Node,navigator:{share:async x=>effects.shares.push(x),canShare:()=>true},localStorage:{getItem:()=>null},SKXlsx:{book:t=>new Blob([JSON.stringify(t)])},location:host.location,URL,Blob,File:class extends Blob{constructor(parts,name,opts){super(parts,opts);this.name=name}},console,addEventListener:host.addEventListener.bind(host),removeEventListener:host.removeEventListener.bind(host),getComputedStyle:host.getComputedStyle,MutationObserver:class{constructor(cb){this.cb=cb}observe(){observers.add(this)}disconnect(){observers.delete(this)}},requestAnimationFrame:f=>{timers.set(++timerId,{f,ms:16,once:true});return timerId;},cancelAnimationFrame:id=>timers.delete(id),setInterval:(f,ms)=>{timers.set(++timerId,{f,ms,once:false});return timerId;},clearInterval:id=>timers.delete(id),setTimeout:(f,ms=0)=>{timers.set(++timerId,{f,ms,once:true});return timerId;},clearTimeout:id=>timers.delete(id),queueMicrotask});
  Object.assign(host,{getComputedStyle:context.getComputedStyle,requestAnimationFrame:context.requestAnimationFrame,cancelAnimationFrame:context.cancelAnimationFrame});
  if(coreDialogs){const core=fs.readFileSync(path.join(root,'ui/core/sk.js'),'utf8'),start=core.indexOf('const modalStack=[];'),end=core.indexOf('/* ---------- auto-lock ---------- */',start);if(start<0||end<0)throw Error('Cannot locate exact production modal region');vm.runInContext('(function(){const esc=SK.esc;'+core.slice(start,end)+'SK.modalFocus=modalFocus;SK.confirm=confirmDialog;SK.form=formDialog;})();',context);}
  const source=fs.readFileSync(path.join(root,'ui/core/output.js'),'utf8');vm.runInContext(sourceTransform(source),context);
  const write=(w,label='CAPTURED')=>{w.document.open();w.document.write('<html><head><title>'+label+'</title></head><body><h1>'+label+'</h1><a href="#one" id="frame-first">First link</a><button id="frame-last">Last control</button><p>Report total 10</p></body></html>');w.document.close();return w;};
  const wrap=()=>document.querySelector('.skout');
  const click=a=>{const b=wrap()?.querySelector('[data-o="'+a+'"]');if(!b)throw Error('Missing action '+a);document.dispatch('click',{target:b});};
  const runTimers=({maxMs=Infinity,intervals=false}={})=>{for(const [id,t] of [...timers])if(t.ms<=maxMs&&(t.once||intervals)){if(t.once)timers.delete(id);t.f();}};
  const key=(d,k,shiftKey=false)=>d.dispatch('keydown',{key:k,shiftKey,target:d.activeElement});
  return {context,api:SK.output,document,host,effects,write,open:label=>write(host.open(''),label),click,wrap,presentation:()=>document.querySelector('.skpres'),runTimers,timers,key,mutations:()=>{for(const o of [...observers])o.cb([])},tick:()=>new Promise(setImmediate),button:(id='opener')=>{const n=document.createElement('button');n.id=id;document.body.appendChild(n);return n;},install:(w,g={})=>SK.output.guard(w,{identity:{name:'Synthetic Company',fileStem:'synthetic'},checkSync:()=>true,check:async()=>true,...g})};
}

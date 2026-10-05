// Test-only DOM subset: parse the production HTML rather than recreating either
// form or handler. Browser layout, native input semantics and reloads need E2E.
import fs from 'node:fs';
import vm from 'node:vm';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const engineScript = new vm.Script(read('ui/core/engines.js'), {filename:'ui/core/engines.js'});
const decode = value => value.replace(/&(amp|quot|lt|gt|#39);/g, (_, key) => ({amp:'&',quot:'"',lt:'<',gt:'>', '#39':"'"})[key]);
const voidTags = new Set(['input', 'br', 'hr', 'img', 'meta', 'link']);
class Element {
  constructor(tag, document) {
    this.tagName = tag; this.ownerDocument = document; this.children = [];
    this.attributes = {}; this.dataset = {}; this.listeners = new Map();
    this.value = ''; this.textContent = '';
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    if (name === 'value') this.value = String(value);
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  removeAttribute(name) { delete this.attributes[name]; }
  get id() { return this.getAttribute('id') || ''; }
  set id(value) { this.setAttribute('id', value); }
  get className() { return this.getAttribute('class') || ''; }
  set className(value) { this.setAttribute('class', value); }
  matches(selector) {
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.className.split(/\s+/).includes(selector.slice(1));
    const attr = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if (attr) return this.hasAttribute(attr[1]) && (attr[2] === undefined || this.getAttribute(attr[1]) === attr[2]);
    return this.tagName === selector;
  }
  querySelectorAll(selector) {
    const selectors = selector.split(',').map(s => s.trim()), result = [];
    const visit = node => { for (const child of node.children) { if (selectors.some(s => child.matches(s))) result.push(child); visit(child); } };
    visit(this); return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null; }
  focus() { this.ownerDocument.activeElement = this; }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
  set innerHTML(html) {
    this.children = []; this.html = html; const stack = [this];
    for (const token of html.match(/<[^>]+>|[^<]+/g) || []) {
      if (token.startsWith('</')) { stack.pop(); continue; }
      if (!token.startsWith('<')) { stack.at(-1).textContent += decode(token); continue; }
      const tag = token.match(/^<([\w-]+)/)?.[1]; if (!tag) continue;
      const node = new Element(tag, this.ownerDocument);
      const attrs = token.slice(tag.length + 1, -1);
      for (const match of attrs.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) node.setAttribute(match[1], decode(match[2] || ''));
      stack.at(-1).appendChild(node);
      if (!voidTags.has(tag)) stack.push(node);
    }
    for (const select of this.querySelectorAll('select')) {
      const option = select.querySelectorAll('option').find(o => o.hasAttribute('selected')) || select.querySelector('option');
      select.value = option ? option.getAttribute('value') ?? option.textContent : '';
    }
  }
  get innerHTML() { return this.html || ''; }
}

export async function workspaceHarness({service = true, books, source} = {}) {
  const document = {activeElement:null, addEventListener(){}, getElementById(){return null;}, createElement(tag){return new Element(tag, this);}};
  const root = document.createElement('main');
  const key = 'skosif_companies_v1';
  const initial = books || {companies:[{id:'synthetic-a', name:'Synthetic Cedar', country:'SA', currency:'SAR'}, {id:'synthetic-b', name:'Synthetic Birch', country:'US', currency:'USD'}], periods:[], active:{companyId:'synthetic-a'}};
  const store = new Map([[key, JSON.stringify(initial)]]), views = new Map(), warnings = [], transitions = [], events = [];
  const get = () => JSON.parse(store.get(key));
  const ctx = {
    console, document, Date, JSON, Number, String, Math, Intl, Object, Array,
    setTimeout(){return 1;}, addEventListener(){}, location:{href:''},
    localStorage:{getItem:k=>store.get(k) ?? null, setItem:(k,v)=>store.set(k,String(v)), removeItem:k=>store.delete(k)},
    SK:{
      $:(selector, container=root)=>container.querySelector(selector),
      esc:value=>String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]),
      num:value=>Number(value), load:(k,fallback)=>JSON.parse(store.get(k) || 'null') ?? fallback,
      save:(k,value)=>{store.set(k,JSON.stringify(value));return true;},
      toast:(message,type)=>warnings.push({message,type}), view:(name,view)=>views.set(name,view),
      bus:{on(){}, emit:(...args)=>events.push(args)},
    },
    SKosifCore:{setOrg(){return true;}},
    SKosifSpace:{current:()=>({id:'synthetic-a',name:'Synthetic Cedar'}), list:()=>initial.companies,
      intent:async()=>false, busy:()=>false, switchTo:async(id,name,options)=>{transitions.push({id,name,options});return true;}},
  };
  ctx.window = ctx; vm.createContext(ctx);
  const run = file => vm.runInContext(read(file), ctx, {filename:file});
  engineScript.runInContext(ctx); run('ui/components/states.js');
  if (service) { run('ui/core/company.js'); await Promise.resolve(); }
  vm.runInContext(source ?? read('ui/features/workspace.js'), ctx, {filename:'ui/features/workspace.js'});
  views.get('companies').render(root);
  return {ctx,root,document,get,warnings,transitions,events,
    field:id=>root.querySelector('#' + id),
    fill(values){for(const [id,value] of Object.entries(values)){const field=root.querySelector('#'+id); if(!field)throw new Error('Missing field '+id);field.value=value;}},
    click(action){const button=root.querySelector('[data-w="'+action+'"]');if(!button)throw new Error('Missing button '+action);for(const handler of root.listeners.get('click') || [])handler({target:button});},
    render(){views.get('companies').render(root);},
  };
}

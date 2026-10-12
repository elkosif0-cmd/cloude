// KOSIF EARTH motion graphics: the door layer (ui/art/brand/earth-motion.{css,js}) and motion v2 in the app
// (ui/core/motion.js count-up + scroll reveal). Decoration only: it must switch off under reduced motion, never touch
// the reviewed unlock script, and a counted figure must end on exactly the text the screen rendered.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const door=read('unlock.html'),css=read('ui/art/brand/earth-motion.css'),js=read('ui/art/brand/earth-motion.js'),luxe=read('ui/ds/luxe.css'),motion=read('ui/core/motion.js');

test('the door links the motion layer after the office door and after the crystal world',()=>{
  assert.ok(door.indexOf('earth-office-door.css')<door.indexOf('earth-motion.css'));
  assert.ok(door.indexOf('art/crystal-world.js')<door.indexOf('art/brand/earth-motion.js'));
  assert.equal((door.match(/earth-motion\.js/g)||[]).length,1);
});

test('the door layer is decoration: tokens, reduced motion, lite switch, no data or auth access',()=>{
  assert.ok(css.includes('prefers-reduced-motion:reduce') && css.includes('.em-lite'));
  for(const t of new Set(css.match(/var\(--sk-[a-z0-9-]+/g))){const k=t.slice(4);assert.ok(door.includes(k+':')||css.includes('var('+k+','),`${k} is a door token or carries a fallback`)}
  assert.doesNotMatch(css,/#(?!fff\b)[0-9a-f]{6}\b/i,'no literal colours beyond the white fallback');
  for(const bad of ['localStorage','sessionStorage','fetch(','XMLHttpRequest','crypto','password','SQC:AUTH']) assert.ok(!js.includes(bad),bad);
  assert.ok(js.includes("prefers-reduced-motion: reduce") && js.includes('saveData') && js.includes('deviceMemory'));
});

test('the app stylesheet carries motion v2 and switches it off under reduced motion',()=>{
  for(const k of ['@keyframes sk-reveal-in','#view .sk-reveal.sk-shown','.sk-counting','.sk-skel']) assert.ok(luxe.includes(k),k);
  assert.match(luxe,/prefers-reduced-motion:reduce\)\{#view \.sk-reveal\{opacity:1\}/);
});

/* motion.js in a vm: a screen with three figures counts them up and ends on the rendered text */
function app(){
  const handlers={},timers=[],frames=[];let now=0;
  const el=(text,cls)=>({nodeType:1,text,children:[],attrs:{},classes:new Set([cls]),
    get textContent(){return this.text},set textContent(v){this.text=v},hasAttribute(k){return k in this.attrs},setAttribute(k,v){this.attrs[k]=v},
    classList:{add:c=>{},remove:c=>{},contains:c=>false},style:{props:{},setProperty(k,v){this.props[k]=v},removeProperty(k){delete this.props[k]}}});
  const figures=[el('1,234.50','v'),el('87%','num'),el('نص','num'),el('0','num'),el('158,200 ر.س','v')];
  /* a stat whose unit is a child element: the leading text node is the figure */
  const unit={nodeType:3,text:'36',get textContent(){return this.text},set textContent(v){this.text=v}};
  figures.push(Object.assign(el('','v'),{children:[{}],firstChild:unit}));
  const view={id:'view',children:[el('','card')],offsetWidth:1,classList:{set:new Set(),add(c){this.set.add(c)},remove(c){this.set.delete(c)},contains(c){return this.set.has(c)}},querySelectorAll:()=>figures};
  const ctx={console,String,Math,Number,parseFloat,isFinite,setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},clearTimeout(){},
    requestAnimationFrame:fn=>{frames.push(fn);return frames.length},performance:{now:()=>now},
    matchMedia:()=>({matches:false}),document:{getElementById:id=>id==='view'?view:null},
    SK:{bus:{on:(t,fn)=>{(handlers[t]=handlers[t]||[]).push(fn)}}},SKosifCore:{view:()=>'dash'}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(motion,ctx);
  return {ctx,figures,timers,frames,tick:ms=>{now+=ms;const f=frames.splice(0);f.forEach(fn=>fn(now))}};
}

test('figures count up from zero and end on exactly the rendered text; words and zeros are left alone',()=>{
  const a=app();a.timers.splice(0).forEach(t=>t.fn());
  assert.equal(a.ctx.SK.motion.counted(),4,'1,234.50, 87%, 158,200 ر.س and the 36 before its unit are counted; «نص» and 0 are not');
  a.tick(0);
  const [big,pct,word,zero,cur,withUnit]=a.figures;
  assert.equal(word.text,'نص');assert.equal(zero.text,'0');
  a.tick(300);
  assert.match(cur.text,/^\d{1,3}(,\d{3})* ر\.س$/,'the unit stays while the figure moves');
  assert.match(big.text,/^\d{1,3}(,\d{3})*\.\d{2}$/,'grouped with two decimals while moving');
  assert.ok(parseFloat(big.text.replace(/,/g,''))>0 && parseFloat(big.text.replace(/,/g,''))<1234.5);
  assert.match(pct.text,/^\d+%$/);
  a.tick(1000);a.tick(100);
  assert.equal(big.text,'1,234.50');assert.equal(pct.text,'87%');assert.equal(cur.text,'158,200 ر.س');assert.equal(withUnit.firstChild.text,'36');
  assert.equal(big.attrs['data-sk-counted'],'1');
});

test('reduced motion counts nothing',()=>{
  const a=app();a.ctx.matchMedia=()=>({matches:true});
  assert.equal(a.ctx.SK.motion.countUp(),0);
});

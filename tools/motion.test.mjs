// The motion layer (ui/core/motion.js): a screen's blocks are choreographed once per screen, never on a data
// re-render, never under reduced motion, and the marks are cleaned up.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const src=readFileSync(new URL('../ui/core/motion.js',import.meta.url),'utf8');
function app({reduced=false,viewId='dash',children=3}={}){
  const handlers={},timers=[],all=[];
  const kid=()=>({nodeType:1,classList:{contains:()=>false},style:{props:{},setProperty(k,v){this.props[k]=v},removeProperty(k){delete this.props[k]}}});
  const view={id:'view',children:Array.from({length:children},kid),offsetWidth:1,classList:{set:new Set(),add(c){this.set.add(c)},remove(c){this.set.delete(c)},contains(c){return this.set.has(c)}}};
  let current=viewId;
  const ctx={console,String,Math,setTimeout:(fn,ms)=>{timers.push({fn,ms});all.push({fn,ms});return timers.length},clearTimeout(){},
    matchMedia:()=>({matches:reduced}),document:{getElementById:id=>id==='view'?view:null},
    SK:{bus:{on:(t,fn)=>{(handlers[t]=handlers[t]||[]).push(fn)}}},SKosifCore:{view:()=>current}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);
  const flush=()=>{const t=timers.splice(0);t.forEach(x=>x.fn());};
  return {ctx,view,handlers,flush,timers,all,setView:v=>{current=v},fire:t=>(handlers[t]||[]).forEach(fn=>fn())};
}

test('opening a screen choreographs its blocks once and cleans up',()=>{
  const a=app();a.flush();
  assert.ok(a.view.classList.contains('sk-enter'));
  assert.deepEqual(a.view.children.map(c=>c.style.props['--sk-i']),['0','1','2']);
  assert.equal(a.ctx.SK.motion.count(),1);
  a.fire('render');a.flush();
  assert.equal(a.ctx.SK.motion.count(),1,'a data re-render of the same screen does not replay');
  /* the cleanup timer removes the class and the marks */
  const end=a.all.find(t=>t.ms===900);assert.ok(end,'cleanup scheduled');end.fn();
  assert.ok(!a.view.classList.contains('sk-enter'));assert.ok(a.view.children.every(c=>c.style.props['--sk-i']==null));
});

test('a new screen replays; reduced motion plays nothing',()=>{
  const a=app();a.flush();a.setView('customers');a.fire('nav');a.flush();
  assert.equal(a.ctx.SK.motion.count(),2);
  const r=app({reduced:true});r.flush();
  assert.equal(r.ctx.SK.motion.count(),0);assert.ok(!r.view.classList.contains('sk-enter'));assert.ok(r.ctx.SK.motion.reduced());
});

test('at most ten blocks are staggered and an empty screen is left alone',()=>{
  const a=app({children:14});a.flush();
  assert.equal(a.view.children.filter(c=>c.style.props['--sk-i']!=null).length,10);
  const e=app({children:0});e.flush();assert.equal(e.ctx.SK.motion.count(),0);
});

test('the bundle and the stylesheet carry the layer',()=>{
  const build=readFileSync(new URL('../build.py',import.meta.url),'utf8'),css=readFileSync(new URL('../ui/ds/luxe.css',import.meta.url),'utf8'),tokens=readFileSync(new URL('../ui/ds/tokens.css',import.meta.url),'utf8');
  assert.ok(build.includes('"core/motion.js"'));
  for(const k of ['@keyframes sk-view-in','#view.sk-enter>*','prefers-reduced-motion'])assert.ok(css.includes(k),k);
  for(const k of ['--sk-ease-out','--sk-motion-enter','--sk-motion-stagger'])assert.ok(tokens.includes(k),k);
  assert.ok(/prefers-reduced-motion:reduce\)\{:root\{[^}]*--sk-motion-enter:0ms/.test(tokens),'reduced motion zeroes the enter duration');
});

// The crystal world engine (ui/art/crystal-world.js): loads without a browser, degrades without WebGL, and its
// procedural shard geometry is deterministic and well-formed.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const src=readFileSync(new URL('../ui/art/crystal-world.js',import.meta.url),'utf8');
function load({webgl=false}={}){
  const ctx={console,Math,Float32Array,Object,Promise,performance:{now:()=>0},navigator:{hardwareConcurrency:8,deviceMemory:8},innerWidth:1440,innerHeight:900,devicePixelRatio:1,scrollY:0,
    document:{hidden:false,documentElement:{scrollHeight:900},addEventListener(){},removeEventListener(){}},
    matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},removeEventListener(){}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);return ctx;
}
test('engine exposes a frozen API and a version',()=>{
  const c=load();assert.equal(typeof c.SQCCrystal.mount,'function');assert.ok(Object.isFrozen(c.SQCCrystal));assert.match(c.SQCCrystal.version,/^\d+\.\d+\.\d+$/);
  assert.deepEqual(Object.keys(c.SQCCrystal.MOODS).sort(),['locked','open','unlock']);
});
test('without WebGL mount returns null and throws nothing',()=>{
  const c=load();const canvas={getContext:()=>null,getBoundingClientRect:()=>({width:800,height:600}),width:0,height:0,classList:{add(){}}};
  assert.equal(c.SQCCrystal.mount(canvas,{}),null);
  const thrower={getContext:()=>{throw new Error('no gl')},getBoundingClientRect:()=>({width:1,height:1})};
  assert.equal(c.SQCCrystal.mount(thrower,{}),null);
});
test('a shard is a closed hexagonal prism with pointed caps and unit per-face normals',()=>{
  const c=load();let s=7;const rand=()=>{s=(s*16807)%2147483647;return s/2147483647};
  const g=c.SQCCrystal.shard(0.5,2,0.4,rand);
  assert.equal(g.count,72,'6 sides × 2 triangles + 6 top + 6 bottom = 24 triangles');
  assert.equal(g.pos.length,72*3);assert.equal(g.nor.length,72*3);
  for(let i=0;i<g.nor.length;i+=3){const l=Math.hypot(g.nor[i],g.nor[i+1],g.nor[i+2]);assert.ok(Math.abs(l-1)<1e-5)}
  /* the top apex is above every ring vertex and the bottom apex below */
  let zs=[];for(let i=2;i<g.pos.length;i+=3)zs.push(g.pos[i]);assert.ok(Math.max(...zs)>2*0.55);assert.ok(Math.min(...zs)<-2*0.55);
  /* deterministic for the same random stream */
  s=7;const h=c.SQCCrystal.shard(0.5,2,0.4,rand);assert.deepEqual([...h.pos],[...g.pos]);
});
test('the front door and the command center load the engine from the same offline-cached file',()=>{
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8'),door=readFileSync(new URL('../unlock.html',import.meta.url),'utf8'),cc=readFileSync(new URL('../ui/features/command-center.js',import.meta.url),'utf8');
  assert.ok(sw.includes("'./art/crystal-world.js'"));assert.ok(door.includes('src="./art/crystal-world.js" defer'));assert.ok(cc.includes('"./art/crystal-world.js"'));
  assert.ok(door.includes('id="sqc-world"'));
});

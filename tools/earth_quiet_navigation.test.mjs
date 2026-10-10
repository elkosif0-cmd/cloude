import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=f=>readFileSync(new URL(f,root),'utf8');
const shell=read('ui/layouts/shell.js');
const guide=read('ui/features/earth-screen-guide.js');
const css=read('ui/features/earth-screen-guide.css');
const meta=JSON.parse(read('ui/core/capabilities.json'));
const caps=meta.capabilities;
const byId=new Map(caps.map(c=>[c.id,c]));
test('sidebar defaults to opening the active group only',()=>{
 assert.match(shell,/const isOpen=here\|\|!!navQ\|\|\(open\[key\]===true\)/);
 assert.ok(shell.includes('key=navPrefKey(gate,gr.id)'), 'gateway-level key');
 assert.ok(shell.includes('[navPrefKey(gate,g)]:v'), 'stored by gateway');
 assert.ok(!shell.includes('open[gr.id]!==undefined?open[gr.id]:true'), 'old clutter default gone');
});
test('menu search exposes collapsed groups temporarily and clears without modifying saved preference',()=>{
 assert.match(shell,/inp\.addEventListener\("input",\(\)=>\{navQ=inp\.value;paintNav\(\)\}\)/);
 assert.match(shell,/if\(e\.key==="Escape"\)\{inp\.value="";navQ="";paintNav\(\)/);
 assert.match(shell,/if\(e\.key==="Enter"\)/);
});
test('KOSIF EARTH is used in browser title instead of old SQC',()=>{
 assert.ok(shell.includes('" · KOSIF EARTH"'));
 assert.ok(!shell.includes('" · SQC"'));
});
test('screen guide uses the real view and capability registry and does not duplicate home guide',()=>{
 for(const term of ['SKosifCore','sk.caps.get(view)','sk.caps.hub(view)','sk.caps.path(s.view)','earth-goal-journey','button.hidden=atHome','showModal','sk:render']){
  assert.ok(guide.includes(term),term);
 }
 assert.ok(guide.includes('const desc=s.cap.sub||own.sub'), 'what this screen actually does');
});
test('verified workflow cards refer to existing real capability hubs',()=>{
 const keys=[...guide.matchAll(/^\s*([a-z]+):\{needs:/gm)].map(x=>x[1]);
 assert.ok(keys.length>=16,'many substantive guide cards');
 for(const id of keys)assert.ok(byId.has(id)&&!byId.get(id).hub,'verified root capability '+id);
 assert.ok(guide.includes('ليست أداة مطابقة بنك')||guide.includes('ليس تسوية كشف بنك')||guide.includes('وليس تسوية كشف بنك'));
 assert.ok(guide.includes('مستند قابل للطباعة؛ إعداد القوائم المالية وظيفة مستقلة'));
});
test('unverified screens fall back to capability descriptions rather than fabricated outcomes',()=>{
 const hubs=caps.filter(c=>!c.hub);
 assert.equal(hubs.length,37);
 assert.ok(hubs.every(c=>typeof c.sub==='string'&&c.sub.length>=8));
 assert.ok(guide.includes('النتيجة التي توفرها الشاشة وفق وصفها أعلاه'));
 assert.ok(guide.includes('s.sk.caps.members(s.hub.id)'), 'available sub-pages derived from real registry');
});
test('screen guide does not access customer payloads, storage, network or write company state',()=>{
 for(const term of ['localStorage','sessionStorage','indexedDB','SK.store','fetch(','document.cookie','setTool(','company.switch','SK.save(']){
  assert.ok(!guide.includes(term), 'forbidden in guidance: '+term);
 }
});
test('screen guide is an accessible optional modal on desktop and mobile',()=>{
 for(const term of ['aria-labelledby','aria-haspopup','showModal','__close','prefers-reduced-motion','max-height:calc(100dvh - 52px)']){
  assert.ok(guide.includes(term)||css.includes(term),term);
 }
 assert.ok(css.includes('var(--sk-brand)'));
});

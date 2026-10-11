// KOSIF EARTH goal-first route and identity contract.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=f=>readFileSync(new URL(f,root),'utf8');
const journey=read('ui/features/earth-goal-journey.js');
const css=read('ui/ds/earth-office.css');
const door=read('unlock.html');
const caps=JSON.parse(read('ui/core/capabilities.json')).capabilities;
const byId=Object.fromEntries(caps.map(x=>[x.id,x]));

test('all goals open real screens in exactly their own gateway',()=>{
  const known={
    accounting:['ledger','smartmatch','reports'],
    audit:['tbreview','auditissues','auditreport'],
    tools:['helperdesk','tasks','productflow']
  };
  for(const [gateway,routes] of Object.entries(known)){
    for(const route of routes){
      assert.equal(byId[route]?.gateway,gateway,route+' belongs only in '+gateway);
      assert.match(journey,new RegExp('route:"'+route+'"'));
    }
  }
});
test('guide remains accessible and routes through existing permissions',()=>{
  for(const term of ['aria-live','aria-pressed','"group"','aria-label','prefers-reduced-motion','SKosifCore','live.core.go(goal.route)','sk:render']){
    assert.ok(journey.includes(term),term);
  }
  assert.match(journey,/allowed\(sk,goal.route\)/);
  assert.match(journey,/go\.disabled=!available/);
});
test('legacy roadmap remains in place, hidden only while the goal guide is displayed',()=>{
  assert.match(journey,/roadmap\.hidden=true/);
  assert.match(journey,/roadmap\.hidden=false/);
  assert.doesNotMatch(journey,/roadmap\.replaceWith\(details\)/);
});
test('presentation layer never reads company payload, persistent data, or credentials',()=>{
  for(const forbidden of ['localStorage','indexedDB','SK.store','sessionStorage','fetch(','document.cookie','payment','billing','crypto.subtle']){
    assert.equal(journey.includes(forbidden),false,forbidden);
  }
  assert.ok(journey.includes('sk.gate.current()'));
  assert.ok(journey.includes('home!==view'));
});
test('warm office branding is responsive, not a canvas mockup',()=>{
  const build=read('build.py');
  assert.ok(build.includes('ds/earth-office.css'));
  assert.ok(build.includes('features/earth-goal-journey.js'));
  assert.ok(door.includes('earth-office-door.css'));
  assert.ok(door.includes('earth-door-steps'));
  assert.match(css,/:root\[data-look="kosif"\]\[data-brand="ledger"\]/);
  assert.ok(css.includes('earth-office-sunlit-4k.webp'));
  assert.ok(css.includes('earth-office-sunlit-mobile.webp'));
  assert.match(css,/prefers-reduced-motion/);
  const picture=statSync(new URL('ui/art/brand/earth-office-sunlit-4k.webp',root));
  const phone=statSync(new URL('ui/art/brand/earth-office-sunlit-mobile.webp',root));
  assert.ok(picture.size>100000 && picture.size<4000000);
  assert.ok(phone.size>50000 && phone.size<1000000);
  assert.match(read('ui/ds/tokens.css'),/:root\[data-look="kosif"\]\[data-brand="navygold"\]/);
});

test('goal-step text expands naturally and only the number has fixed badge width',()=>{
  assert.match(css,/\.earth-journey__steps li > span:first-child\s*\{/);
  assert.match(css,/\.earth-journey__steps li > span:last-child\s*\{/);
  assert.doesNotMatch(css,/\.earth-journey__steps li span\s*\{/);
});

test('brand home action respects the active gateway instead of jumping to generic dash',()=>{
  const src=read('ui/layouts/topbar.js');
  assert.match(src,/SK\.caps\.gatewayHome\(gate\)/);
  assert.match(src,/core\(\)\.go\(home\|\|"dash"\)/);
});

test('KOSIF EARTH navigation logo is a valid nonempty vector, not a broken placeholder',()=>{
  const source=read('ui/art/brand/kosif-earth-mark.svg');
  assert.ok(Buffer.byteLength(source,'utf8')>=500,'real SVG asset, not an empty image');
  assert.match(source,/<svg\s[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(source,/<circle\s/);
  assert.match(source,/<path\s/);
  assert.ok(read('ui/layouts/topbar.js').includes('KOSIF EARTH — الصفحة الرئيسية'));
  assert.ok(css.includes('kosif-earth-mark.svg'));
});

test('goal descriptions match real registered capabilities and show prerequisites',()=>{
  assert.equal((journey.match(/needs:\[/g)||[]).length,10,"10 existing goals require explicit preparation");
  assert.match(journey,/className.*earth-journey__requirements|node\("p","earth-journey__requirements"\)/);
  assert.match(journey,/goal\.needs\.join/);
  assert.match(css,/\.earth-journey__requirements\{/);
  assert.match(journey,/title:"أطابق أوصاف المبيعات",route:"smartmatch"/);
  assert.match(journey,/title:"أجهّز تقارير للطباعة",route:"reports"/);
  assert.match(journey,/title:"أحسب تكلفة البوكس",route:"productflow"/);
  assert.equal(byId.smartmatch.label,"مطابقة المبيعات");
  assert.equal(byId.reports.label,"مركز الطباعة");
  assert.equal(byId.productflow.label,"استوديو المنتج");
  assert.doesNotMatch(journey,/جهّز ملفات البنك والدفتر/);
  assert.doesNotMatch(journey,/قوائم مالية جاهزة للفحص والاعتماد/);
  assert.match(journey,/ملف مراجعة مستقل/);
  assert.match(journey,/لا يُنشأ ملف مراجعة مستقل/);
});

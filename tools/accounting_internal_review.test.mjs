import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const src=readFileSync(new URL('ui/features/earth-goal-journey.js',root),'utf8');
const ledger=readFileSync(new URL('ui/features/ledger.js',root),'utf8');
const app=readFileSync(new URL('ui/core/gate.js',root),'utf8');

test('internal accounting review is the owning company ledger TB, not the audit module',()=>{
  assert.match(src,/title:"أراجع حسابات شركتي",route:"ledger",tab:"tb"/);
  assert.match(src,/L\.open\(goal\.tab\)/,'use existing ledger tab API');
  assert.match(ledger,/open:\(t,o=\{\}\)=>\{[\s\S]*?tab=t\|\|"accounts"/,'native ledger tab routes to itself');
  assert.match(ledger,/#view \.sk-view\[data-bound="1"\]/,'target the actual registered view renderer');
  assert.match(ledger,/if\(C\?\.view\?\.\(\)==="ledger"&&root\)\{[\s\S]*?paint\(root\)/,'repaint the already active ledger tab');
  assert.match(ledger,/dispatchEvent\(new Event\("sk:render"\)\)/,'refresh shell and remove home journey on a work tab');
  assert.match(src,/\!\["close","accounts"\]\.includes\(tab\)/,'work tabs must not show the home guide');
  assert.match(src,/لا يُنشأ ملف مراجعة مستقل ولا تُنقل البيانات/);
  assert.doesNotMatch(src,/SKosifTBReview\.fromBooks\(/,'must not import into independent audit');
});
test('company changes and stale touches cannot move the user into someone else’s review',()=>{
  for(const marker of [
    'companyId=companyAtRender?.id',
    'now?.id!==companyId',
    'now.ownerScope!=="FULL_ACCOUNTING"',
    'SKosifSpace?.busy?.()',
    'live.sk.demo?.settled&&!live.sk.demo.settled()'
  ])assert.ok(src.includes(marker),marker);
  assert.match(src,/existing\.dataset\.companyId===expectedCompany/);
  assert.match(src,/box\.dataset\.companyId=company\?\.id/);
});
test('independent audit and tools clearly disclose their separate, non-auto-imported scope',()=>{
  assert.match(src,/مراجعة مستقلة: ملفاتها منفصلة عن دفتر أي شركة/);
  assert.match(src,/مساحة أدوات مستقلة؛ شركات المحاسبة لا تُضاف تلقائيًا/);
  assert.match(app,/Independent Audit commands wait only for the Audit module itself/);
});
test('goal guide does not make storage writes or company-list crosslinks',()=>{
  for(const bad of ['localStorage.setItem','indexedDB','SK.store','location.href','SK.company.list()','SKosifTBReview.fromBooks(']){
    assert.equal(src.includes(bad),false,bad);
  }
});

test('accounting home actions wait for asynchronous company handoff and demo initialization',()=>{
  assert.match(src,/const isReady=\(sk,gate\)=>/);
  assert.match(src,/!window\.SKosifSpace\?\.busy\?\.\(\)/);
  assert.match(src,/!sk\.demo\?\.settled\|\|sk\.demo\.settled\(\)/);
  assert.match(src,/const available=ready&&allowed\(sk,goal\.route\)/);
  assert.match(src,/go\.disabled=!available/);
  assert.match(src,/go\.textContent=companyId\?/);
  assert.match(src,/existing\.dataset\.ready!==String\(isReady\(current\.sk,current\.gate\)\)/);
  assert.match(src,/scheduleReady\(\)/);
  assert.match(src,/readyTimer=setTimeout\(check,250\)/);
});

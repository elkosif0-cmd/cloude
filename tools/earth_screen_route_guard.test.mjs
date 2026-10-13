import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const src=read('ui/features/earth-screen-guide.js');
const css=read('ui/features/earth-screen-guide.css');
const registry=JSON.parse(read('ui/core/capabilities.json'));
const caps=registry.capabilities;
const byId=new Map(caps.map(c=>[c.id,c]));
const verified=new Set([...src.split('const VERIFIED=Object.freeze({')[1].split('\n});')[0].matchAll(/^\s*([a-z][\w-]+):\s*\{needs:/gm)].map(m=>m[1]));
test('registry has 79 unique capability ids and each curated guide has a real owner',()=>{
  assert.equal(caps.length,79);
  assert.equal(byId.size,caps.length);
  assert.equal(verified.size,18);
  for(const id of verified)assert.ok(byId.has(id),'curated guide exists in canonical capabilities: '+id);
});
test('only real non-hidden, permitted screen routes are clickable',()=>{
 for(const literal of ['s.sk.caps.members(s.hub.id)','c.id!==s.view','!c.hidden','s.sk.caps.inGatewayOf(c,s.gate)','s.sk.perm.can(c.id)','now.sk.perm.can(target.id)','now.core.go(target.id)'])
   assert.ok(src.includes(literal),'missing route guard: '+literal);
 const targets=[['inventory','traceability'],['codex','auditbench'],['salesintel','intelligence'],['productflow','catalog'],['tbreview','auditissues']];
 for(const [hub,child] of targets){
   assert.equal(byId.get(child)?.hub,hub);
 }
 assert.ok(byId.get('catalog').hidden,'inner productflow tab must NOT get a new external nav button');
 assert.ok(byId.get('auditissues').hidden,'inner audit tab must NOT get a new external nav button');
});
test('company/gateway context is re-checked on every guide link click',()=>{
 assert.match(src,/now\.gate!==s\.gate/);
 assert.match(src,/now\.hub\.id!==s\.hub\.id/);
 assert.match(src,/now\.sk\.company\?\.current\?\.\(\)\?\.id/);
 assert.match(src,/const now=ctx\(\);/);
 assert.ok(src.includes('(!s.sk.perm?.can||s.sk.perm.can(c.id))'));
});
test('curated parent instructions cannot be presented as verified child instructions',()=>{
 assert.ok(src.includes('VERIFIED[s.cap.id]||(s.cap.id===s.hub.id?VERIFIED[s.hub.id]:null)'));
 assert.ok(src.includes('مسار استرشادي من سجل وظائف KOSIF EARTH'));
 assert.ok(src.includes('ليس تأكيداً بأن كل المعالجات أو الصادرات مكتملة'));
});
test('browser guide is presentation-only; no persistent cross-company state or data export',()=>{
 for(const forbidden of ['localStorage','sessionStorage','fetch(','indexedDB','SK.store','company.save','company.set','openUrl(','billing','entitlement']){
   assert.equal(src.includes(forbidden),false,'guide unexpectedly uses '+forbidden);
 }
 assert.match(css,/\[?max-width:650px/);
 assert.match(css,/earth-screen-guide__link/);
 assert.match(css,/min-height:44px/);
});

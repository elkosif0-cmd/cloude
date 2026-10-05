// The identity ratchet: no measured drift from the SQC identity may grow, and the identity document is generated from
// the tokens that actually render (every hex it names exists in ui/ds/tokens.css).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {run,RATCHET} from './identity_audit.mjs';

test('no identity metric is worse than the accepted baseline',()=>{
  const r=run();
  assert.ok(r.rows.length===RATCHET.length);
  assert.deepEqual(r.worse.map(x=>x.metric+' '+x.now+'>'+x.baseline),[]);
});

test('the identity document is generated from the live tokens',()=>{
  /* the document may also cite a colour another stylesheet renders (the Mercury accent it reports as a conflict) */
  const doc=fs.readFileSync(new URL('../docs/design/SQC-IDENTITY-ar.md',import.meta.url),'utf8'),tokens=(fs.readFileSync(new URL('../ui/ds/tokens.css',import.meta.url),'utf8')+fs.readFileSync(new URL('../ui/ds/sqc.css',import.meta.url),'utf8')).toLowerCase();
  const hexes=[...new Set((doc.match(/#[0-9a-f]{6}\b/gi)||[]).map(h=>h.toLowerCase()))];
  assert.ok(hexes.length>=10,'the document names the palette');
  const missing=hexes.filter(h=>!tokens.includes(h));assert.deepEqual(missing,[],'every documented colour renders from tokens.css');
  for(const k of ['IBM Plex Sans Arabic','Montserrat','شبكة **8 بكسل**','prefers-reduced-motion','identity_audit'])assert.ok(doc.includes(k),k);
});

test('the SQC look keeps two families, a fluid screen title and one focus ring',()=>{
  const luxe=fs.readFileSync(new URL('../ui/ds/luxe.css',import.meta.url),'utf8'),tokens=fs.readFileSync(new URL('../ui/ds/tokens.css',import.meta.url),'utf8');
  /* the look is declared in more than one block: join them */
  const kosif=[...tokens.matchAll(/:root\[data-look="kosif"\]\{([^}]*)\}/g)].map(m=>m[1]).join(';');
  const decl=[...kosif.matchAll(/--sk-font(?:-display|-latin)?\s*:\s*([^;]+)/g)].map(m=>m[1]).join(',');
  const fams=[...new Set([...decl.matchAll(/"([^"]+)"/g)].map(m=>m[1]).filter(f=>!/Segoe|Tahoma|BlinkMac|SF Pro/.test(f)))];
  assert.deepEqual(fams.sort(),['IBM Plex Sans Arabic','Montserrat']);
  assert.match(luxe,/:root\[data-look="kosif"\] \.sk-ph h2\{[^}]*clamp\(/,'fluid screen title');
  assert.match(luxe,/:root\[data-look="kosif"\] :is\([^)]*\):focus-visible\{outline:3px solid var\(--sk-focus\);outline-offset:2px\}/,'one focus ring');
});

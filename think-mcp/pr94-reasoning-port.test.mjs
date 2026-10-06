import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');

test('PR94 reasoning knowledge is selectively merged into Capability Atlas',()=>{
  assert.match(src,/Actively seek disconfirming evidence and state what observation would make the current preferred conclusion wrong/);
  assert.match(src,/smallest reversible tracer action before a large or irreversible commitment/);
  assert.match(src,/Separate hard constraints from preferences before optimizing or scheduling work/);
  assert.match(src,/prefer a viable fallback from a different dependency group/);
});

test('old Clean APIs transport is not reintroduced by the reasoning merge',()=>{
  assert.doesNotMatch(src,/async function cleanApisChat\(/);
  assert.doesNotMatch(src,/async function cleanApisMicro\(/);
});

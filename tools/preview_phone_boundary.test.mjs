import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const phone='0512345678',hash='a'.repeat(20)+phone+'b'.repeat(34);
function phones(text){
  return JSON.parse(execFileSync(process.platform==='win32'?'python':'python3',['-c','import json,sys; from tools.preview_build_check import public_phone_numbers; print(json.dumps(sorted(public_phone_numbers(json.load(sys.stdin)))))'],{input:JSON.stringify(text),encoding:'utf8'}));
}
test('verified-shape sourceLineSha256 digest is not classified as a real phone',()=>{
  assert.equal(hash.length,64);assert.deepEqual(phones(JSON.stringify({sourceLineSha256:hash})),[]);
});
test('standalone phone detection remains effective alongside a source digest',()=>{
  assert.deepEqual(phones(JSON.stringify({sourceLineSha256:hash,contact:phone})),[phone]);
  assert.deepEqual(phones('Contact: '+phone),[phone]);
});
test('malformed hashes and unrelated fields cannot bypass phone detection',()=>{
  assert.deepEqual(phones(JSON.stringify({sourceLineSha256:hash.slice(1)})),[phone]);
  assert.deepEqual(phones(JSON.stringify({ordinaryValue:hash})),[phone]);
});
test('only the pre-existing synthetic demo-number range is allowlisted',()=>{
  assert.deepEqual(phones('0500000000 0500000099 '+phone),[phone]);
});

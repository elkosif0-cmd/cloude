import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');

test('Council-500 direct recovery only targets missing experts and keeps lease-claimed execution',()=>{
  assert.match(src,/async function c500DirectRecover\(env,id,limit=50\)/);
  assert.match(src,/rows\[j\]\?\.c500_complete!==true/);
  assert.match(src,/Promise\.allSettled\(selected\.map\(eid=>c500ExpertAdvance\(env,id,eid\)\)\)/);
  assert.match(src,/c500_duplicate_suppressed/);
  assert.match(src,/completion_reconciliation=await c500CompletionReconcile\(env,meta,secure\)/);
  assert.match(src,/recovery_version:"inline-c500-recovery-v1"/);
});

test('direct recovery is exposed only after mobile bridge verification',()=>{
  const verify=src.indexOf('await mobileBridgeVerify(env,id,b.bridge_token);');
  const action=src.indexOf('if(action==="c500_direct_recover")');
  assert.ok(verify>=0 && action>verify,'direct recovery must stay behind the per-request mobile bridge token');
  assert.match(src,/mobileFullProBridge:\{available:true,[\s\S]*"c500_direct_recover"/);
});

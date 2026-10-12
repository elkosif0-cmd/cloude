import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const client=fs.readFileSync(new URL('../ui/features/capabilities-v2.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');

test('Claude UI is opt-in and never handles a browser API key',()=>{
  assert.match(client,/id="skv2-claude-consent"/);
  assert.match(client,/if\(!consent\)return toast/);
  assert.match(client,/reviewWithClaude\(question,task\)/);
  assert.match(client,/api\("\/api\/capabilities-v2\/workspaces\/"/);
  assert.doesNotMatch(client,/x-api-key|sk-ant-/i);
});
test('the model receives anonymous aggregate financial metrics, never company identity',()=>{
  const start=client.indexOf('async function reviewWithClaude(');
  const end=client.indexOf('function claudeHTML()',start);
  const code=client.slice(start,end);
  assert.ok(start>=0 && end>start);
  for(const k of ['receipts','payments','inventoryItems','reorderAlerts','netProfit'])assert.ok(code.includes(k));
  assert.doesNotMatch(code,/company:\s*|companyName|customers|iban|documents|attachments|rawLedger/);
  assert.match(code,/companyRef\(\)\.id!==currentCompany/);
});
test('Claude is advertised runnable only after server-side Access and AI limiter are ready',()=>{
  assert.match(worker,/provider\.id==="claude"/);
  assert.match(worker,/env\?\.AI_LIMITER\?\.limit/);
  assert.match(worker,/normalizeAccessConfig\(env\)/);
  assert.match(worker,/ai_review|ai-review/);
});

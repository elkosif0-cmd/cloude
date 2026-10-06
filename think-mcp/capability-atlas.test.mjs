import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');

test('A1990 capability atlas is wired into Full Pro without replacing Council-500',()=>{
  assert.match(worker,/A1990_CAPABILITY_ATLAS_VERSION\s*=\s*["']attachment-capability-atlas-v3["']/);
  assert.match(worker,/function\s+a1990CapabilityAtlas\s*\(/);
  assert.match(worker,/function\s+a1990SelectCapabilityPacks\s*\(/);
  assert.match(worker,/function\s+a1990CapabilityPrompt\s*\(/);
  assert.match(worker,/name:"kosif_capability_route"/);
  assert.match(worker,/capability_packs=a1990SelectCapabilityPacks\(subject,executor\)/);
  assert.match(worker,/capability_atlas_version:meta\.capability_atlas_version\|\|null/);
  assert.match(worker,/capabilityRule=a1990CapabilityPrompt\(meta\.capability_packs\)/);
  assert.match(worker,/council500_mode:true/);
});

test('capability atlas keeps no-claim and evidence-first governance language',()=>{
  assert.match(worker,/Bundled third-party code is never auto-executed/);
  assert.match(worker,/method constraints, not claims of tool execution|method constraints, not claims of tool execution/i);
  assert.match(worker,/verification_completion/);
  assert.match(worker,/Before claiming success identify the fresh observation or command that proves the claim/);
});

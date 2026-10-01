import fs from 'node:fs';
import assert from 'node:assert/strict';

const thinkPath=process.argv[2]||'think-mcp/worker.js';
const securePath=process.argv[3]||'think-mcp/secure-executor/worker.js';
const think=fs.readFileSync(thinkPath,'utf8');
const secure=fs.readFileSync(securePath,'utf8');

assert.match(think,/const VERSION\s*=\s*"0\.17\.1"/);
assert.ok(think.includes('attachments-governance-v1'));
assert.ok(think.includes('einstein-attachments-v2'));
assert.ok(think.includes('source-taint-v1'));
assert.ok(think.includes('execution-binding-v1'));
assert.equal(/id:\s*"mythos"/.test(think),false,'Mythos must not return to frontier catalog');
assert.equal(/cleanapis|clean apis/i.test(think),false,'removed Clean APIs provider must not return');
assert.ok(think.includes('attachment-cinema-v1'));
assert.equal(think.includes('Apply this stage to the duck-vs-dragon single frame.'),false);

assert.match(secure,/const VERSION\s*=\s*"1\.4\.1"/);
assert.ok(secure.includes('vision_task_aware_v4'));
assert.ok(secure.includes('execution_contract_digest'));
assert.ok(secure.includes('EXECUTION_CONTRACT_MISMATCH'));
assert.equal(secure.includes('const required=["duck_anatomy"'),false);

const thinkMod=await import('data:text/javascript;base64,'+Buffer.from(
  think+'\nexport {c500DeterministicSceneSpec,fullProIsDuckDragonTask,fullProBuildExecutionContract,fullProCapabilityTruth};'
).toString('base64'));

const mug=thinkMod.c500DeterministicSceneSpec({
  subject:'A red ceramic mug on a wooden table in soft morning window light. No animals, fantasy creatures, rain, fire, armor, weapons, or text.'
});
const mugText=JSON.stringify(mug).toLowerCase();
assert.equal(thinkMod.fullProIsDuckDragonTask(mug.subject),false);
for(const forbidden of ['duck warrior','colossal dragon','dragon-fire','battle-worn bronze','wing-mounted']){
  assert.equal(mugText.includes(forbidden),false,'generic fallback leaked prior test content: '+forbidden);
}
assert.ok(mug.render_prompt.includes('red ceramic mug'));
assert.ok(mug.render_prompt.includes('Do not introduce unrequested characters'));
assert.equal(thinkMod.fullProIsDuckDragonTask('A duck fights a dragon in the rain'),true);
assert.equal(thinkMod.fullProIsDuckDragonTask('A duck beside a castle'),false);

const meta={
  request_id:'regression-contract-1',
  subject:mug.subject,
  scene_spec:mug,
  candidate_digest:'candidate-digest-test',
  c500_audit:{experts_validated:500},
  c500_finalists:[{id:'f1'}],
  c500_jev_calls_observed:42,
  einstein_stage_receipts:Array.from({length:7},(_,i)=>({stage:i}))
};
const built=await thinkMod.fullProBuildExecutionContract(meta);
assert.equal(built.contract.version,'execution-binding-v1');
assert.equal(built.contract.candidate_digest,'candidate-digest-test');
assert.equal(built.contract.executor_type,'image');
assert.ok(Array.isArray(built.contract.forbidden_attributes));
assert.match(built.digest,/^[0-9a-f]{64}$/);

const truth=thinkMod.fullProCapabilityTruth({
  ...meta,
  execution_contract_digest:built.digest
},{
  expert_completions:500,
  request:{status:'AUTHORIZED'},
  artifact_qa:{observed:true,pass:true,score:1,report_digest:'qa'}
});
assert.equal(truth.council500.state,'verified');
assert.equal(truth.einstein_method.state,'verified');
assert.equal(truth.execution_contract.state,'verified');
assert.equal(truth.artifact_qa.state,'verified');
assert.equal(truth.host_tool_exposure.state,'host-dependent');

const secureMod=await import('data:text/javascript;base64,'+Buffer.from(
  secure+'\nexport {artifactQaProfile};'
).toString('base64'));

const mugQa=secureMod.artifactQaProfile(mug);
for(const inactive of ['bird_anatomy','dragon_anatomy','fire_direction','rain_interaction','no_human_hands']){
  assert.equal(mugQa.required.includes(inactive),false,'generic QA activated '+inactive);
}

const duckDragonQa=secureMod.artifactQaProfile({
  subject:'A small duck fighting a colossal dragon in heavy rain with fire',
  negative_constraints:['no human hands','no watermark']
});
for(const check of ['bird_anatomy','dragon_anatomy','fire_direction','rain_interaction','scale_relation','no_human_hands']){
  assert.ok(duckDragonQa.required.includes(check),'missing conditional check: '+check);
}

console.log(JSON.stringify({
  passed:true,
  runtime:'0.17.1',
  secureExecutor:'1.4.1',
  governance:'attachments-governance-v1',
  executionBinding:true,
  capabilityTruth:true,
  sourceTaint:true,
  genericFallbackNoLeak:true,
  taskAwareQa:true,
  mythosRemoved:true,
  cleanApisRemoved:true
}));

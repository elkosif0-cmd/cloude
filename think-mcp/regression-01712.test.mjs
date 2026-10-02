import fs from 'node:fs';
import assert from 'node:assert/strict';

const thinkPath=process.argv[2]||'think-mcp/worker.js';
const securePath=process.argv[3]||'think-mcp/secure-executor/worker.js';
const think=fs.readFileSync(thinkPath,'utf8');
const secure=fs.readFileSync(securePath,'utf8');

assert.match(think,/const VERSION\s*=\s*"0\.17\.12"/);
assert.ok(think.includes('attachments-governance-v1'));
assert.ok(think.includes('einstein-attachments-v2'));
assert.ok(think.includes('source-taint-v1'));
assert.ok(think.includes('execution-binding-v1'));
assert.ok(think.includes('revision-closure-v1'));
assert.ok(think.includes('REVISION CLOSURE CONTRACT'));
assert.ok(think.includes('Never copy resolved objections/risks forward'));
assert.ok(think.includes("do not invent new subjects, props, styles, settings, facts, requirements, or aesthetic details"));
assert.ok(think.includes('public-broker-oauth-v2'));
assert.ok(think.includes('pre-verification-auth-fail-lockout'));
assert.ok(think.includes('authFailLockout:"pre-verification-ip-window"'));
assert.ok(think.includes('maxAgents:FRONTIER_AGENTS.length'));
assert.ok(think.includes('const VERSIONED_MCP_PATH = "/mcp/v0.17.12"'));
assert.ok(think.includes('const COMPAT_VERSIONED_MCP_PATH = "/mcp/v0.17.11"'));
assert.ok(think.includes('const SECONDARY_COMPAT_VERSIONED_MCP_PATH = "/mcp/v0.17.10"'));
assert.ok(think.includes('const TERTIARY_COMPAT_VERSIONED_MCP_PATH = "/mcp/v0.17.9"'));
assert.ok(think.includes('const LEGACY_VERSIONED_MCP_PATH = "/mcp/v0.9.3"'));
assert.equal(think.includes('five Cloudflare role agents'),false);
assert.equal(think.includes('Same five independent agents'),false);
assert.equal(/id:\s*"mythos"/.test(think),false,'Mythos must not return to frontier catalog');
assert.equal(/cleanapis|clean apis/i.test(think),false,'removed Clean APIs provider must not return');
assert.ok(think.includes('attachment-cinema-v1'));
assert.equal(think.includes('Apply this stage to the duck-vs-dragon single frame.'),false);

assert.match(secure,/const VERSION\s*=\s*"1\.4\.3"/);
assert.ok(secure.includes('vision_task_aware_v5'));
assert.ok(secure.includes('active-values-v3'));
assert.ok(secure.includes('execution_contract_digest'));
assert.ok(secure.includes('EXECUTION_CONTRACT_MISMATCH'));
assert.equal(secure.includes('const required=["duck_anatomy"'),false);

const thinkMod=await import('data:text/javascript;base64,'+Buffer.from(
  think+'\nexport {c500DeterministicSceneSpec,fullProIsDuckDragonTask,fullProBuildExecutionContract,fullProCapabilityTruth,normalizeAvailableTools,parseArithmeticAssertion,artifactArithmeticTerminal,optionBindingConsistency,decisionSensitivity,council,evaluateGate};'
).toString('base64'));


const unknownInventory=thinkMod.normalizeAvailableTools([{name:'Figma',costClass:'existing_plan'}]);
assert.equal(unknownInventory.get('figma').connected,null,'omitted host connectivity must remain unknown');
assert.equal(unknownInventory.get('figma').authState,'unknown');
const explicitInventory=thinkMod.normalizeAvailableTools([
  {name:'GitHub',connected:true,costClass:'existing_plan'},
  {name:'Runway',connected:false,costClass:'credits'}
]);
assert.equal(explicitInventory.get('github').connected,true);
assert.equal(explicitInventory.get('runway').connected,false);

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
assert.match(built.contract.verification_method,/vision_task_aware_v5/);
assert.doesNotMatch(built.contract.verification_method,/vision_task_aware_v4/);

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


const englishProof=thinkMod.parseArithmeticAssertion('7 + 5 equals 12');
assert.equal(englishProof?.value,12);
const arabicEquals=String.fromCharCode(0x64a,0x633,0x627,0x648,0x64a);
const arabicProof=thinkMod.parseArithmeticAssertion('7 + 5 '+arabicEquals+' 12');
assert.equal(arabicProof?.value,12);
const answerTerminal=thinkMod.artifactArithmeticTerminal({answer:'7 + 5 = 12',evidence:[]});
assert.equal(answerTerminal?.value,12);
const mixedTerminal=thinkMod.artifactArithmeticTerminal({answer:'The correct answer is 12.',evidence:['7 + 5 equals 12']});
assert.equal(mixedTerminal?.value,12);

const liveBugArtifacts=[
  {agentId:'gpt',source:'cloudflare',model:'m1',provenanceGroup:'p1',answer:'7 + 5 = 12',recommendationId:'B',evidence:['Basic arithmetic operation'],assumptions:[],risks:[],objections:[],confidence:1},
  {agentId:'claude',source:'cloudflare',model:'m2',provenanceGroup:'p2',answer:'The correct answer is 12.',recommendationId:'B',evidence:['7 + 5 equals 12'],assumptions:[],risks:[],objections:[],confidence:1},
  {agentId:'fable',source:'cloudflare',model:'m3',provenanceGroup:'p3',answer:'Basic arithmetic operation',recommendationId:'A',evidence:['Basic addition'],assumptions:[],risks:[],objections:[],confidence:1}
];
const liveBinding=thinkMod.optionBindingConsistency(liveBugArtifacts,{A:'10',B:'12',C:'14'});
assert.equal(liveBinding.checked,true);
assert.equal(liveBinding.canonicalValue,12);
assert.equal(liveBinding.canonicalOptionId,'B');
assert.deepEqual(liveBinding.quarantinedAgents,['fable']);
const liveCouncil=thinkMod.council(liveBugArtifacts,{A:'10',B:'12',C:'14'});
assert.equal(liveCouncil.winningOptionId,'B');
assert.equal(liveCouncil.validVotes,2);
assert.equal(liveCouncil.quarantinedVotes,1);

const bindingArtifacts=[
  {agentId:'gpt',source:'cloudflare',model:'m1',provenanceGroup:'p1',answer:'42',recommendationId:'correct',evidence:['17+25=42'],assumptions:[],risks:[],objections:[],confidence:0.95},
  {agentId:'claude',source:'cloudflare',model:'m2',provenanceGroup:'p2',answer:'42',recommendationId:'wrong',evidence:['17+25=42'],assumptions:[],risks:[],objections:[],confidence:0.99},
  {agentId:'gemini',source:'cloudflare',model:'m3',provenanceGroup:'p3',answer:'42',recommendationId:'correct',evidence:['17+25=42'],assumptions:[],risks:[],objections:[],confidence:0.90}
];
const bindingOptions={correct:'42',wrong:'43'};
const binding=thinkMod.optionBindingConsistency(bindingArtifacts,bindingOptions);
assert.equal(binding.checked,true);
assert.equal(binding.canonicalValue,42);
assert.equal(binding.canonicalOptionId,'correct');
assert.deepEqual(binding.quarantinedAgents,['claude']);
assert.equal(binding.contradictions[0].selectedValue,43);
const boundCouncil=thinkMod.council(bindingArtifacts,bindingOptions);
assert.equal(boundCouncil.winningOptionId,'correct');
assert.equal(boundCouncil.validVotes,2);
assert.equal(boundCouncil.quarantinedVotes,1);
assert.equal(boundCouncil.agreementPercent,100);
assert.equal(boundCouncil.rawParticipationAgreementPercent,66.67);
const boundGate=thinkMod.evaluateGate(bindingArtifacts,bindingOptions,['gpt','claude','gemini']);
assert.equal(boundGate.passed,false);
assert.ok(boundGate.reasons.includes('OPTION_BINDING_CONTRADICTION'));
assert.deepEqual(boundGate.optionBindingConsistency.quarantinedAgents,['claude']);


const fragileArtifacts=[
  {agentId:'a1',answer:'A',recommendationId:'A',evidence:['e1'],assumptions:[],risks:[],objections:[],confidence:0.6},
  {agentId:'a2',answer:'A',recommendationId:'A',evidence:['e2'],assumptions:[],risks:[],objections:[],confidence:0.6},
  {agentId:'b1',answer:'B',recommendationId:'B',evidence:['e3'],assumptions:[],risks:[],objections:[],confidence:1}
];
const fragileSensitivity=thinkMod.decisionSensitivity(fragileArtifacts,{A:'alpha',B:'beta'});
assert.equal(fragileSensitivity.version,'decision-sensitivity-v1');
assert.equal(fragileSensitivity.checked,true);
assert.equal(fragileSensitivity.baselineWinner,'A');
assert.equal(fragileSensitivity.singleVoteFlipCount,2);
assert.equal(fragileSensitivity.stableUnderSingleVoteRemoval,false);
const fragileGate=thinkMod.evaluateGate(fragileArtifacts,{A:'alpha',B:'beta'},['a1','a2','b1']);
assert.ok(fragileGate.reasons.includes('DECISION_UNSTABLE_UNDER_SINGLE_VOTE_REMOVAL'));

const stableArtifacts=[
  {agentId:'s1',answer:'A',recommendationId:'A',evidence:['e1'],assumptions:[],risks:[],objections:[],confidence:0.8},
  {agentId:'s2',answer:'A',recommendationId:'A',evidence:['e2'],assumptions:[],risks:[],objections:[],confidence:0.8},
  {agentId:'s3',answer:'A',recommendationId:'A',evidence:['e3'],assumptions:[],risks:[],objections:[],confidence:0.8}
];
const stableSensitivity=thinkMod.decisionSensitivity(stableArtifacts,{A:'alpha',B:'beta'});
assert.equal(stableSensitivity.checked,true);
assert.equal(stableSensitivity.singleVoteFlipCount,0);
assert.equal(stableSensitivity.stableUnderSingleVoteRemoval,true);

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
  runtime:'0.17.12',
  secureExecutor:'1.4.3',
  governance:'attachments-governance-v1',
  executionBinding:true,
  capabilityTruth:true,
  sourceTaint:true,
  genericFallbackNoLeak:true,
  taskAwareQa:true,
  triStateConnectivity:true,
  optionBindingConsistency:true,
  naturalLanguageArithmeticBinding:true,
  decisionSensitivity:true,
  mythosRemoved:true,
  cleanApisRemoved:true
}));

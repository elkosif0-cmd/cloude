import fs from 'node:fs';
import assert from 'node:assert/strict';

const thinkPath=process.argv[2]||'think-mcp/worker.js';
const securePath=process.argv[3]||'think-mcp/secure-executor/worker.js';
const think=fs.readFileSync(thinkPath,'utf8');
const secure=fs.readFileSync(securePath,'utf8');

assert.match(think,/const VERSION\s*=\s*"0\.17\.0"/);
assert.equal(/id:\s*"mythos"/.test(think),false,'Mythos must not return to the live frontier catalog');
assert.ok(think.includes('attachment-cinema-v1'),'attachment-derived visual intelligence profile must be present');
assert.ok(think.includes('function fullProIsDuckDragonTask'),'task-specific specialization gate must exist');
assert.equal(think.includes('Apply this stage to the duck-vs-dragon single frame.'),false,'Einstein stage must be task-generic');
assert.equal(think.includes('const required=["duck_anatomy"'),false,'main runtime must not contain the old globally-fixed duck QA contract');

assert.match(secure,/const VERSION\s*=\s*"1\.4\.0"/);
assert.ok(secure.includes('vision_task_aware_v4'),'Secure Executor must use task-aware visual QA');
assert.ok(secure.includes('function artifactQaProfile'),'task-aware QA profile must exist');
assert.ok(secure.includes('scene_spec_json'),'frozen SceneSpec must be retained for QA rechecks');
assert.equal(secure.includes('const required=["duck_anatomy"'),false,'Secure Executor must not apply duck/dragon checks globally');

const thinkMod=await import('data:text/javascript;base64,'+Buffer.from(
  think+'\nexport {c500DeterministicSceneSpec,fullProIsDuckDragonTask,fullProBuildCompactRenderPrompt};'
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

const secureMod=await import('data:text/javascript;base64,'+Buffer.from(
  secure+'\nexport {artifactQaProfile};'
).toString('base64'));

const mugQa=secureMod.artifactQaProfile(mug);
assert.equal(mugQa.profile.bird,false);
assert.equal(mugQa.profile.dragon,false);
assert.equal(mugQa.profile.fire,false);
assert.equal(mugQa.profile.rain,false);
assert.equal(mugQa.required.includes('bird_anatomy'),false);
assert.equal(mugQa.required.includes('dragon_anatomy'),false);
assert.equal(mugQa.required.includes('fire_direction'),false);
assert.equal(mugQa.required.includes('rain_interaction'),false);

const duckDragonQa=secureMod.artifactQaProfile({
  subject:'A small duck fighting a colossal dragon in heavy rain with fire',
  negative_constraints:['no human hands','no watermark']
});
for(const check of ['bird_anatomy','dragon_anatomy','fire_direction','rain_interaction','scale_relation','no_human_hands']){
  assert.ok(duckDragonQa.required.includes(check),'missing conditional check: '+check);
}

console.log(JSON.stringify({
  passed:true,
  runtime:'0.17.0',
  secureExecutor:'1.4.0',
  genericFallbackNoLeak:true,
  taskAwareQa:true,
  mythosRemoved:true
}));

import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync(process.argv[2]||'think-mcp/worker.js','utf8');
assert.match(source,/const VERSION\s*=\s*"0\.18\.6"/);
assert.equal(/id:\s*"mythos"/i.test(source),false);
assert.equal(/cleanapis|clean apis/i.test(source),false);
assert.ok(source.includes('decision-sensitivity-v1'));
assert.ok(source.includes('governanceContracts'));
assert.ok(source.includes('vision_task_aware_v5 postcondition QA'));

const mod=await import('data:text/javascript;base64,'+Buffer.from(
  source+'\nexport {FRONTIER_AGENTS,selfTestTool,decisionSensitivity,council};'
).toString('base64'));

assert.deepEqual(mod.FRONTIER_AGENTS.map(a=>a.id),['gpt','claude','gemini','fable']);
assert.equal(new Set(mod.FRONTIER_AGENTS.map(a=>a.model)).size,4);

const fragile=[
  {agentId:'a1',recommendationId:'A',confidence:0.6},
  {agentId:'a2',recommendationId:'A',confidence:0.6},
  {agentId:'b1',recommendationId:'B',confidence:1}
];
const ds=mod.decisionSensitivity(fragile,{A:'alpha',B:'beta'});
assert.equal(ds.checked,true);
assert.equal(ds.baselineWinner,'A');
assert.equal(ds.singleVoteFlipCount,2);
assert.equal(ds.stableUnderSingleVoteRemoval,false);

const c=mod.council(fragile,{A:'alpha',B:'beta'});
assert.equal(c.winningOptionId,'A');
assert.equal(c.decisionSensitivity.singleVoteFlipCount,2);

const self=mod.selfTestTool({});
assert.equal(self.version,'0.18.6');
assert.equal(self.allPassed,true);

console.log(JSON.stringify({passed:true,runtime:'0.18.6',frontierAgents:mod.FRONTIER_AGENTS.map(a=>a.id),decisionSensitivity:true}));

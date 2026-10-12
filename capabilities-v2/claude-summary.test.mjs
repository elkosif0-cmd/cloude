import test from 'node:test';
import assert from 'node:assert/strict';
import {runClaudeSummary,validateClaudeTask,allowedAggregate} from './claude-summary.mjs';
import {readFileSync} from 'node:fs';

const BASE='https://s-kosif-capabilities-v2.example/api/capabilities-v2/workspaces/wsp_123/ai/claude';
const auth={subject:'synthetic-auditor@example.invalid',tenantId:'ten_demo',workspaceId:'wsp_test',
            workspaceRole:'manager'};
const aggregate={
  period:{month:'2026-09',secret:'not-sent'},
  financeSummary:{receipts:5000,payments:2500,net:2500,customerPhones:'0551234567',customerPhone:551234567,month:'2026-09'},
  inventorySummary:{tracked:12,orders:'private-orders',reorderAlerts:3},
  reporting:{savedIncomeStatements:5,lastNetProfit:4255,lastMonth:'2026-08'},
  preferences:{currency:'SAR',personalNotes:'no'},
  rawTransactions:[{iban:'SA1234567890123456789012',secret:'never'}],
  notes:['private customer details'],
};
function req(body={task:'accounting-analysis'},origin='https://earth.kosif.pp.ua'){
  return new Request(BASE,{method:'POST',headers:{'content-type':'application/json',origin},
    body:typeof body==='string'?body:JSON.stringify(body)});
}
function env({snapshot=aggregate,change=1,haveState=true,enabled=true,key=true,model=true}={}){
  const trace=[];
  return {trace,
    AI_ENABLED:enabled?'true':'false',
    ALLOWED_ORIGINS:'https://earth.kosif.pp.ua',
    ANTHROPIC_API_KEY:key?'TEST-SECRET-DO-NOT-USE':undefined,
    ANTHROPIC_MODEL:model?'claude-sonnet-5':undefined,
    AI_DAILY_LIMIT:'3',
    DB:{prepare(sql){
      trace.push(sql);
      return {bind(...params){
        return {
          async first(){return haveState?{state_json:JSON.stringify(snapshot)}:null},
          async run(){return {meta:{changes:change}}}
        };
      }};
    }}
  };
}
async function json(r){return [r.status,await r.json()]}

test('task allowlist refuses unsolicited context or ledger data',()=>{
  assert.equal(validateClaudeTask({task:'audit-review',rawTransactions:[1]}).error,'invalid_request');
  assert.equal(validateClaudeTask({task:'post-journal'}).error,'invalid_task');
  assert.equal(validateClaudeTask({task:'reconciliation',question:'SA1234567890123456789012'}).error,'invalid_request');
  assert.equal(validateClaudeTask({task:'accounting-analysis',question:'راجع النسب'}).error,'invalid_request');
  assert.deepEqual(validateClaudeTask({task:'accounting-analysis'}),{task:'accounting-analysis'});
});
test('all non-aggregate records and personal details are stripped before model calls',()=>{
  const s=JSON.stringify(allowedAggregate(aggregate));
  for(const token of ['0551234567','551234567','customerPhone','private-orders','personalNotes','SA1234','rawTransactions','notes','customerPhones'])
    assert.equal(s.includes(token),false,token);
  assert.ok(s.includes('receipts'));assert.ok(s.includes('4255'));
});
test('refuses all AI requests without verified workspace identity',async()=>{
  const e=env();
  const [status,result]=await json(await runClaudeSummary(req(),e,{}));
  assert.equal(status,401);assert.equal(result.error,'authentication_required');
  assert.equal(e.trace.length,0);
});
test('viewer role is denied before any database or provider requests',async()=>{
  const e=env();const [status,r]=await json(await runClaudeSummary(req(),e,{...auth,workspaceRole:'viewer'}));
  assert.equal(status,403);assert.equal(r.error,'permission_denied');assert.equal(e.trace.length,0);
});
test('untrusted origins are denied, not reflected',async()=>{
  const [status,r]=await json(await runClaudeSummary(req(undefined,'https://evil.test'),env(),auth));
  assert.equal(status,403);assert.equal(r.error,'origin_denied');
});
test('missing provider secret/model or AI switch fails closed',async()=>{
  for(const overrides of [{enabled:false},{key:false},{model:false}]){
    const [status,r]=await json(await runClaudeSummary(req(),env(overrides),auth));
    assert.equal(status,503);assert.equal(r.error,'claude_server_not_configured');
  }
});
test('refuses raw transaction payload and missing snapshot',async()=>{
  assert.equal((await runClaudeSummary(req({task:'audit-review',rawTransactions:[1]}),env(),auth)).status,400);
  const [status,r]=await json(await runClaudeSummary(req(),env({haveState:false}),auth));
  assert.equal(status,409);assert.equal(r.error,'snapshot_required');
});
test('rejects exceeding workspace daily quota without paying Anthropic',async()=>{
  let providerCalled=false;
  const e=env({change:0});
  const [status,r]=await json(await runClaudeSummary(req(),e,auth,{fetchImpl:async()=>{providerCalled=true;throw Error('must not fetch')}}));
  assert.equal(status,429);assert.equal(r.error,'ai_daily_limit_reached');assert.equal(providerCalled,false);
  assert.ok(e.trace.some(x=>x.includes('workspace_ai_requests')));
});
test('valid authenticated accounting analysis uses server secret and only numeric aggregates',async()=>{
  let seen;
  const fetchImpl=async(url,init)=>{
    seen={url,init};
    return new Response(JSON.stringify({content:[{type:'text',text:'المبيعات بحاجة لمطابقة إضافية.'}],
      usage:{input_tokens:134,output_tokens:37}}),{status:200,headers:{'content-type':'application/json'}});
  };
  const [status,r]=await json(await runClaudeSummary(req({task:'accounting-analysis'}),env(),auth,{fetchImpl}));
  assert.equal(status,200);assert.equal(r.provider,'claude');assert.equal(r.requiresHumanApproval,true);
  assert.equal(r.scope,'workspace-aggregates-only');assert.equal(r.usage.input_tokens,134);
  assert.equal(seen.url,'https://api.anthropic.com/v1/messages');
  assert.equal(seen.init.headers['x-api-key'],'TEST-SECRET-DO-NOT-USE');
  const body=JSON.parse(seen.init.body),prompt=body.messages[0].content;
  assert.equal(prompt.includes('2500'),true);
  for(const token of ['customerPhones','0551234567','rawTransactions','SA123456789','private-orders']) assert.equal(prompt.includes(token),false,token);
  assert.ok(body.system.includes('not authorized'));
  assert.ok(!JSON.stringify(r).includes('TEST-SECRET'));
});
test('provider errors are sanitized and never disclose provider error bodies',async()=>{
  const [status,r]=await json(await runClaudeSummary(req(),env(),auth,{fetchImpl:async()=>new Response('PROVIDER SECRET ERROR',{status:429})}));
  assert.equal(status,502);assert.equal(r.error,'claude_provider_unavailable');
  assert.equal(JSON.stringify(r).includes('PROVIDER SECRET ERROR'),false);
});
test('Cloudflare worker enforces verified Access JWT on Claude route (not the spoofable subject header)',()=>{
  const source=readFileSync(new URL('./worker.js',import.meta.url),'utf8');
  assert.match(source,/action==="ai-claude" \? await verifyCloudflareAccessSubject\(request,env\) : await authenticatedSubject\(request,env\)/);
  assert.match(source,/workspaceAccessContext\(db,match\[1\],auth\)/);
  assert.match(source,/if\(!authorizeRole\(access\.role,permission\)\)/);
});

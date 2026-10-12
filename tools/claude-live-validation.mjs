// One-time Anthropic API smoke test. Synthetic numerical test cases only.
// At most three model calls. Do not log API keys, raw prompts or responses.
import {writeFileSync,mkdirSync} from 'node:fs';
const key=process.env.ANTHROPIC_API_KEY;
if(!key)throw Error('MOON GitHub secret unavailable');
const base='https://api.anthropic.com';
const headers={'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'};
const modelsResp=await fetch(base+'/v1/models?limit=100',{headers});
if(!modelsResp.ok)throw Error('Anthropic model listing unavailable HTTP '+modelsResp.status);
const models=await modelsResp.json();
const opus=(models.data||[]).filter(x=>/claude-opus/i.test(x.id||''));
opus.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
const model=opus[0]?.id;
if(!model)throw Error('No Anthropic Claude Opus model available to this API credential');
const cases=[
  {id:'ledger-balance',question:'قيد صناعي مدين 115 ريال ودائن إيراد 100 ودائن ضريبة 15. هل هو متوازن؟ أجب JSON بمفتاح balanced boolean.'},
  {id:'vat-arithmetic',question:'فاتورة صناعية قبل الضريبة 200 ريال، ضريبة قيمة مضافة 15%. أجب JSON بمفتاح vat_amount رقم.'},
  {id:'audit-independence',question:'قيد يدوي كبير في آخر يوم بلا مستندات مؤيدة. لا يجوز اعتماده آليًا. أجب بسطر JSON واحد فقط: {"requires_human_review":true}'}
];
const results=[];
for(const x of cases){
  const response=await fetch(base+'/v1/messages',{method:'POST',headers,
    body:JSON.stringify({model,max_tokens:850,
      system:'You are an Arabic IFRS accounting and audit assistant. Only synthetic cases. Output valid JSON, no commentary, no markdown.',
      messages:[{role:'user',content:x.question}]})});
  if(!response.ok){results.push({case:x.id,pass:false,http_status:response.status});break}
  const value=await response.json();
  const raw=(value.content||[]).filter(y=>y.type==='text').map(y=>y.text).join('').trim();
  let parsed;try{parsed=JSON.parse(raw)}catch{parsed={}}
  const pass=x.id==='ledger-balance'?parsed.balanced===true:
    x.id==='vat-arithmetic'?Number(parsed.vat_amount)===30:
    parsed.requires_human_review===true;
  results.push({case:x.id,pass,usage:value.usage||{},model});
}
mkdirSync('claude-live-validation',{recursive:true});
const allPassed=results.length===3&&results.every(x=>x.pass);
writeFileSync('claude-live-validation/receipt.json',JSON.stringify({model,allPassed,results,
  note:'Synthetic figures only, three requests maximum, never stored real company data.'},null,2));
console.log(JSON.stringify({model,tests:results.length,passed:results.filter(x=>x.pass).length,allPassed}));
if(!allPassed)process.exitCode=1;

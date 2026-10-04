/* SQC: pure draft projections. Hash validation is local integrity, never ownership or live freshness. */
(()=>{
"use strict";
const CSS=typeof window.__SK_MANAGEMENT_REPORT_CSS__==="string"?window.__SK_MANAGEMENT_REPORT_CSS__:"";
const M=()=>window.SKosifManagementModel;
const SUBTLE=window.crypto?.subtle;
const bad=code=>{throw new Error(code)};
const hash=async s=>{if(!SUBTLE||typeof SUBTLE.digest!=="function")bad("HASH_IMPLEMENTATION_MISSING");const bytes=await SUBTLE.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,"0")).join("")};
const canon=v=>M().canonical(v);
const digest=v=>hash(canon(v));
const freeze=v=>{if(v&&typeof v==="object"){Object.values(v).forEach(freeze);Object.freeze(v)}return v};
const object=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
function pick(v,keys){if(!object(v))bad("OUTPUT_SHAPE_INVALID");const out={};for(const k of keys)if(own(v,k)){const x=v[k];if(x!==null&&!["string","number","boolean"].includes(typeof x))bad("OUTPUT_SHAPE_INVALID");out[k]=x}return out}
const list=v=>{if(!Array.isArray(v)||v.some(x=>typeof x!=="string"))bad("OUTPUT_SHAPE_INVALID");return v.slice()};
const amount=v=>{if(typeof v!=="string"||!/^(-?[1-9]\d*|0)$/.test(v))bad("OUTPUT_AMOUNT_INVALID");return BigInt(v)};
function cleanModel(m){
  if(!object(m)||!Array.isArray(m.rows)||!Array.isArray(m.sourceChecks)||!Array.isArray(m.issues))bad("OUTPUT_SHAPE_INVALID");
  const context=pick(m.context,["entityId","entityName","currency","currencyExponent","start","end","basis","scopeToken"]);
  if(![context.entityId,context.entityName,context.currency,context.start,context.end,context.scopeToken].every(x=>typeof x==="string"&&x.length)||context.currencyExponent!==2||context.basis!=="management-ledger")bad("OUTPUT_CONTEXT_INVALID");
  context.scopeStatus="user-attested";
  const ids=new Set();let debit=0n,credit=0n;
  const rows=m.rows.map(r=>{
    const x=pick(r,["id","code","label","role","unresolved","balanceMinor","closingDebitMinor","closingCreditMinor"]);
    if(typeof x.id!=="string"||!x.id||ids.has(x.id)||typeof x.code!=="string"||typeof x.label!=="string"||!["detail","derived"].includes(x.role))bad("OUTPUT_ROW_INVALID");ids.add(x.id);
    const balance=amount(x.balanceMinor),d=amount(x.closingDebitMinor),c=amount(x.closingCreditMinor);
    if(d!==(balance>0n?balance:0n)||c!==(balance<0n?-balance:0n))bad("OUTPUT_CLOSING_SIDES_INVALID");debit+=d;credit+=c;
    x.sourceIds=list(r.sourceIds);
    if(r.derivedAdjustment){x.derivedAdjustment=pick(r.derivedAdjustment,["kind","amountMinor","formula"]);amount(x.derivedAdjustment.amountMinor);x.derivedAdjustment.sourceIds=list(r.derivedAdjustment.sourceIds)}return x;
  });
  const totals=pick(m.totals,["closingDebitMinor","closingCreditMinor"]);
  if(amount(totals.closingDebitMinor)!==debit||amount(totals.closingCreditMinor)!==credit||debit!==credit)bad("OUTPUT_TOTAL_INVALID");
  const summary=m.summary===null?null:pick(m.summary,["revenueMinor","expenseMinor","resultMinor"]);
  if(summary&&amount(summary.revenueMinor)-amount(summary.expenseMinor)!==amount(summary.resultMinor))bad("OUTPUT_SUMMARY_INVALID");
  if(rows.some(r=>r.unresolved)&&summary!==null)bad("OUTPUT_SUMMARY_UNRESOLVED");
  const validation=pick(m.validation,["numeric","evidence"]);validation.human="draft";
  return{schemaVersion:1,status:"draft",assuranceScopes:[],context,rows,totals,summary,validation,sourceChecks:m.sourceChecks.map(x=>pick(x,["id","status","message"])),issues:m.issues.map(x=>pick(x,["code","message","accountId","entryId","lineIndex"]))};
}
const hex=v=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
async function binding(s){
  if(!object(s)||![s.inputHash,s.contextHash,s.evidenceHash].every(hex))bad("OUTPUT_HASH_INVALID");
  const a=s.attestation;
  if(!object(a)||a.kind!=="user-attested"||a.inputHash!==s.inputHash||a.contextHash!==s.contextHash||typeof a.confirmedAt!=="string"||!Number.isFinite(Date.parse(a.confirmedAt)))bad("ATTESTATION_INVALID");
  if(await digest(s.model.sourceChecks)!==s.evidenceHash)bad("EVIDENCE_INTEGRITY");
}
const hashPayload=s=>({schemaVersion:1,model:s.model,inputHash:s.inputHash,contextHash:s.contextHash,evidenceHash:s.evidenceHash});
async function prepare(envelope){
  if(!object(envelope))bad("OUTPUT_SHAPE_INVALID");
  const model=cleanModel(envelope.model);
  const s={schemaVersion:1,model,inputHash:envelope.inputHash,contextHash:envelope.contextHash,evidenceHash:envelope.evidenceHash,capturedAt:envelope.capturedAt,scopeToken:envelope.scopeToken,attestation:pick(envelope.attestation,["kind","inputHash","contextHash","confirmedAt"])};
  if(s.scopeToken!==model.context.scopeToken||typeof s.capturedAt!=="string"||!Number.isFinite(Date.parse(s.capturedAt)))bad("OUTPUT_CONTEXT_INVALID");
  await binding(s);s.snapshotHash=await digest(hashPayload(s));return freeze(s);
}
async function validate(s){
  const allowed=["schemaVersion","model","inputHash","contextHash","evidenceHash","snapshotHash","capturedAt","scopeToken","attestation"];
  if(!object(s)||Object.keys(s).some(k=>!allowed.includes(k))||!object(s.attestation)||Object.keys(s.attestation).some(k=>!["kind","inputHash","contextHash","confirmedAt"].includes(k)))bad("OUTPUT_SHAPE_INVALID");
  if(typeof s.capturedAt!=="string"||!Number.isFinite(Date.parse(s.capturedAt)))bad("OUTPUT_CONTEXT_INVALID");
  s=JSON.parse(canon(s));
  await binding(s);
  if(!hex(s.snapshotHash)||s.snapshotHash!==await digest(hashPayload(s)))bad("SNAPSHOT_INTEGRITY");
  // Validate shape as well as hash; an arbitrary issued model must never gain an issued label.
  if(s.model.status!=="draft"||s.model.assuranceScopes?.length||s.model.context.scopeStatus!=="user-attested"||s.scopeToken!==s.model.context.scopeToken)bad("SNAPSHOT_INTEGRITY");
  if(canon(cleanModel(s.model))!==canon(s.model))bad("SNAPSHOT_INTEGRITY");return s;
}
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function money(v){const n=amount(v),abs=n<0n?-n:n,whole=(abs/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");const x=whole+"."+(abs%100n).toString().padStart(2,"0");return n<0n?"("+x+")":x}
const number=v=>'<bdi dir="ltr">'+esc(money(v))+'</bdi>';
const title="ميزان مراجعة إداري بالأرصدة الختامية",draft="مسودة إدارية",scope="نطاق التقرير أكده المستخدم";
const status=v=>({reconciled:"مطابق حسابيًا",incomplete:"غير مكتمل",not_tested:"غير مختبر",supported:"مدعوم ضمن الفحوص المحددة",discrepancy:"فروق تحتاج معالجة",stale:"ملاحظات قديمة"}[v]||"غير مختبر");
function metadata(s){const c=s.model.context;return[["status",draft],["scope",scope],["entity_id",c.entityId],["entity_name",c.entityName],["period_start",c.start],["period_end",c.end],["currency",c.currency],["unit","وحدة العملة؛ القيم الآلية بوحدات صغرى 1/100"],["input_hash",s.inputHash],["context_hash",s.contextHash],["evidence_hash",s.evidenceHash],["snapshot_hash",s.snapshotHash],["captured_at",s.capturedAt],["confirmed_at",s.attestation.confirmedAt],["evidence_status",status(s.model.validation.evidence)]]}
async function html(snapshot){
  const s=await validate(snapshot),m=s.model,c=m.context;if(!CSS.trim())bad("OUTPUT_STYLES_UNAVAILABLE");
  const top='<header><div class="mr-brand">SQC</div><h1>'+title+'</h1><p class="mr-status">'+draft+' · '+scope+'</p><p class="mr-status">تأكيد النطاق لا يثبت ملكية الدفاتر ولا يمثل تأكيدًا مهنيًا.</p><p>'+esc(c.entityName)+'</p><p>الفترة: <bdi dir="ltr">'+esc(c.start)+' — '+esc(c.end)+'</bdi> · العملة: <bdi dir="ltr">'+esc(c.currency)+'</bdi> · الوحدة: وحدة العملة</p></header>';
  const rows=m.rows.map(r=>'<tr data-role="detail" data-row-id="'+esc(r.id)+'" data-balance-minor="'+esc(r.balanceMinor)+'"><th scope="row"><bdi dir="ltr">'+esc(r.code)+'</bdi> '+esc(r.label)+(r.unresolved?' <span class="mr-status">غير مصنف</span>':'')+(r.derivedAdjustment?' <span class="mr-derived">يتضمن نتيجة سابقة مشتقة</span>':'')+'</th><td data-minor="'+r.closingDebitMinor+'">'+number(r.closingDebitMinor)+'</td><td data-minor="'+r.closingCreditMinor+'">'+number(r.closingCreditMinor)+'</td></tr>').join('');
  const table='<div class="mr-table-wrap" role="region" aria-label="أرصدة الحسابات" tabindex="0"><table><caption>الأرصدة الختامية؛ لا تمثل حركة الفترة</caption><colgroup><col class="mr-label"><col class="mr-amount"><col class="mr-amount"></colgroup><thead><tr><th colspan="3" class="mr-context">'+esc(c.entityName)+' · '+esc(c.end)+' · '+esc(c.currency)+' · '+draft+'</th></tr><tr><th scope="col">الحساب</th><th scope="col">الرصيد المدين</th><th scope="col">الرصيد الدائن</th></tr></thead><tbody>'+rows+'</tbody><tfoot><tr data-role="total"><th scope="row">إجمالي الأرصدة الختامية — كامل التقرير</th><td data-minor="'+m.totals.closingDebitMinor+'">'+number(m.totals.closingDebitMinor)+'</td><td data-minor="'+m.totals.closingCreditMinor+'">'+number(m.totals.closingCreditMinor)+'</td></tr></tfoot></table></div>';
  const summary='<section><h2>ملخص الإيرادات والمصروفات حسب تصنيف الحسابات</h2>'+(m.summary?'<dl>'+[["الإيرادات",m.summary.revenueMinor],["المصروفات",m.summary.expenseMinor],["النتيجة",m.summary.resultMinor]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+number(v)+'</dd></div>').join('')+'</dl>':'<p class="mr-status">غير متاح حتى معالجة الحسابات غير المصنفة؛ لا يُعرض صفر بديل.</p>')+'</section>';
  const findings='<section class="mr-findings"><h2>فحص التقرير والملاحظات وقت الالتقاط</h2><p class="mr-status">الأرقام: '+status(m.validation.numeric)+' · اكتمال المصادر: '+status(m.validation.evidence)+' · الحالة: '+draft+'</p><ul>'+m.sourceChecks.map(x=>'<li>'+esc(x.id)+' — '+status(x.status)+' · '+esc(x.message)+'</li>').join('')+m.issues.map(x=>'<li>'+esc(x.code)+' '+esc(x.message||'')+' '+esc(x.accountId||x.entryId||'')+'</li>').join('')+'</ul></section>';
  const meta='<section class="mr-metadata"><h2>هوية النسخة ونطاقها</h2><dl>'+metadata(s).map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl></section>';
  return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>'+esc(title)+'</title><style>'+CSS.replace(/</g,'\\3c ')+'</style></head><body class="sqc-management-document"><main class="sqc-management-report">'+top+table+summary+findings+meta+'<footer class="mr-footer">SQC · '+draft+' · <bdi dir="ltr">'+esc(s.snapshotHash.slice(0,12))+'</bdi></footer></main></body></html>';
}
async function csv(snapshot){
  const s=await validate(snapshot),m=s.model;
  // CSV cannot declare spreadsheet column types: preserve code text exactly; never emit formulas.
  const textCell=v=>{let x=String(v??"");if(/^[\s\uFEFF]*[=+\-@]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"'};
  const rows=[["record_type","id","account_code","label","balance_minor","closing_debit_minor","closing_credit_minor","value","currency"]];
  for(const [id,value] of metadata(s))rows.push(["metadata",id,"",id,"","","",value,m.context.currency]);
  for(const r of m.rows)rows.push(["detail",r.id,r.code,r.label,r.balanceMinor,r.closingDebitMinor,r.closingCreditMinor,"",m.context.currency]);
  rows.push(["total","closing-total","","إجمالي الأرصدة الختامية — كامل التقرير","",m.totals.closingDebitMinor,m.totals.closingCreditMinor,"",m.context.currency]);
  if(m.summary)for(const k of ["revenueMinor","expenseMinor","resultMinor"])rows.push(["summary",k,"",k,"","","",m.summary[k],m.context.currency]);
  else rows.push(["issue","SUMMARY_UNAVAILABLE","","الملخص غير متاح","","","","",m.context.currency]);
  for(const x of [...m.sourceChecks,...m.issues])rows.push(["issue",x.id||x.code,"",x.message||x.code||status(x.status),"","","",x.status||"",m.context.currency]);
  return '\uFEFF'+rows.map((r,index)=>r.map((v,col)=>index>0&&((col>=4&&col<=6&&v!=="")||(r[0]==="summary"&&col===7))?String(v):textCell(v)).join(',')).join('\r\n')+'\r\n';
}
async function json(snapshot){const s=await validate(snapshot);return JSON.stringify(s,null,2)}
window.SKosifManagementOutput=Object.freeze({prepare,html,csv,json});
})();

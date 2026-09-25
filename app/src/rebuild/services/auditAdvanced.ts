import type{AuditWorkspace}from'./audit';

export type RequestStatus='draft'|'requested'|'received'|'under-review'|'partial'|'closed'|'unavailable';
export type RequestPriority='normal'|'high'|'critical';
export interface EvidenceRequest{id:string;title:string;priority:RequestPriority;status:RequestStatus;note:string;createdAt:string;updatedAt:string}
export interface HumanDecision{id:string;checkId:string;status:'satisfied'|'not-applicable'|'blocked';actor:string;rationale:string;at:string}
export interface AuditReport{id:string;recipeId:string;title:string;status:'draft'|'ready'|'issued';generatedAt:string;issuedAt?:string;actor?:string;rationale?:string;html:string}
export interface RemoteAnalysis{id:string;documentName:string;documentId?:string;at:string;result:unknown}
export interface AdvancedAuditState{version:1;engagementId:string;gatewayUrl:string;requests:EvidenceRequest[];decisions:HumanDecision[];reports:AuditReport[];remoteAnalyses:RemoteAnalysis[];updatedAt:string;migratedFromLegacy?:boolean}
export interface RecipeRequirement{id:string;title:string;priority:RequestPriority;documentTypes:string[]}
export interface ReportRecipe{id:string;title:string;engagementType:string;requirements:RecipeRequirement[];sections:string[]}
export interface CompletionRequirement{id:string;title:string;mode:'system'|'human';status:'satisfied'|'pending'|'blocked'|'not-applicable';detail:string}

const KEY='skosif_rebuild_audit_advanced_v1',LEGACY='kosif-audit-studio:v1',SESSION='kosif:v5:remote-engagement';
const now=()=>new Date().toISOString(),arr=(v:any)=>Array.isArray(v)?v:[],parse=(s:string|null)=>{try{return s?JSON.parse(s):null}catch{return null}};
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m));

export const REPORT_RECIPES:Record<string,ReportRecipe>={
 'statement-of-financial-position':{id:'statement-of-financial-position',title:'قائمة المركز المالي',engagementType:'preparation',requirements:[
  {id:'TB',title:'ميزان المراجعة النهائي',priority:'critical',documentTypes:['trial-balance']},{id:'COA',title:'دليل الحسابات وربط الحسابات',priority:'high',documentTypes:['chart-of-accounts']}
 ],sections:['أساس الإعداد','قائمة المركز المالي','ملخص التسويات','التتبع']},
 'full-financial-statements':{id:'full-financial-statements',title:'القوائم المالية الكاملة',engagementType:'preparation',requirements:[
  {id:'TB',title:'ميزان المراجعة النهائي',priority:'critical',documentTypes:['trial-balance']},{id:'COA',title:'دليل الحسابات وربط الحسابات',priority:'critical',documentTypes:['chart-of-accounts']},{id:'PYFS',title:'مقارنات الفترة السابقة',priority:'high',documentTypes:['financial-statements']},{id:'CFS',title:'دعم التدفقات النقدية',priority:'high',documentTypes:['cash-flow-support']},{id:'EQS',title:'حركة حقوق الملكية',priority:'high',documentTypes:['equity-movement-support']}
 ],sections:['المركز المالي','الربح أو الخسارة','التدفقات النقدية','التغيرات في حقوق الملكية','الإيضاحات','التتبع']},
 'audit-report':{id:'audit-report',title:'تقرير مراجعة مالية',engagementType:'audit',requirements:[
  {id:'FS',title:'القوائم المالية محل المراجعة',priority:'critical',documentTypes:['financial-statements']},{id:'TB',title:'ميزان المراجعة وربطه بالقوائم',priority:'critical',documentTypes:['trial-balance']},{id:'GL',title:'الأستاذ العام وقيود الفترة',priority:'critical',documentTypes:['general-ledger','journal']}
 ],sections:['الرأي','أساس الرأي','الأهمية النسبية','النطاق','أمور المراجعة الرئيسية','الاستمرارية','مسؤوليات الأطراف','ملخص المجلس','تغطية الأدلة','التسويات','التتبع']},
 'management-letter':{id:'management-letter',title:'خطاب الإدارة ونقاط الرقابة',engagementType:'internal-control',requirements:[
  {id:'CONTROL',title:'وصف العمليات والضوابط الرئيسية',priority:'critical',documentTypes:['controls-document']}
 ],sections:['ملخص تنفيذي','ملاحظات الرقابة','التوصيات','رد الإدارة','خطة العمل']},
 'inventory-review':{id:'inventory-review',title:'مراجعة المخزون',engagementType:'agreed-procedures',requirements:[
  {id:'INVLIST',title:'كشف تفصيلي بالمخزون',priority:'critical',documentTypes:['inventory']},{id:'COUNT',title:'محاضر ونتائج الجرد',priority:'critical',documentTypes:['inventory-count']},{id:'COST',title:'مستندات التكلفة والمشتريات',priority:'high',documentTypes:['purchase-support']}
 ],sections:['النطاق','تحليل المخزون','الاستثناءات','التسويات','الاستنتاج']}
};

function defaultState():AdvancedAuditState{
 const s=parse(localStorage.getItem(SESSION))||{};
 return{version:1,engagementId:String(s.engagementId||('ENG-SK-'+new Date().toISOString().slice(0,10).replace(/-/g,''))),gatewayUrl:String(s.gatewayUrl||s.baseUrl||''),requests:[],decisions:[],reports:[],remoteAnalyses:[],updatedAt:now()};
}
export function loadAdvancedAudit():AdvancedAuditState{
 const saved=parse(localStorage.getItem(KEY));if(saved?.version===1)return saved;
 const state=defaultState(),legacy=parse(localStorage.getItem(LEGACY));if(legacy){
  const e=legacy.engagement||legacy;state.migratedFromLegacy=true;
  state.engagementId=String(e.id||state.engagementId);
  state.requests=arr(e.requests).map((x:any,i:number)=>({id:String(x.id||'REQ-L-'+i),title:String(x.title||'طلب دليل سابق'),priority:(['normal','high','critical'].includes(x.priority)?x.priority:'high') as RequestPriority,status:(['draft','requested','received','under-review','partial','closed','unavailable'].includes(x.status)?x.status:'requested') as RequestStatus,note:String(x.note||x.reason||''),createdAt:String(x.createdAt||now()),updatedAt:String(x.updatedAt||x.createdAt||now())}));
  state.reports=arr(e.reports).map((x:any,i:number)=>({id:String(x.id||'REP-L-'+i),recipeId:String(x.recipeId||'legacy'),title:String(x.title||'تقرير سابق'),status:(['draft','ready','issued'].includes(x.status)?x.status:'draft') as any,generatedAt:String(x.generatedAt||x.createdAt||now()),issuedAt:x.issuedAt,html:String(x.html||x.content||'')}));
 }
 saveAdvancedAudit(state);return state;
}
export function saveAdvancedAudit(v:AdvancedAuditState){const next={...v,updatedAt:now()};localStorage.setItem(KEY,JSON.stringify(next));return next}
export function addEvidenceRequest(s:AdvancedAuditState,input:{title:string;priority?:RequestPriority;note?:string}){
 const t=now(),request:EvidenceRequest={id:'REQ-'+Date.now().toString(36).toUpperCase(),title:input.title.trim(),priority:input.priority||'high',status:'requested',note:input.note||'',createdAt:t,updatedAt:t};
 return{state:saveAdvancedAudit({...s,requests:[request,...s.requests]}),request};
}
export function setRequestStatus(s:AdvancedAuditState,id:string,status:RequestStatus){
 return saveAdvancedAudit({...s,requests:s.requests.map(x=>x.id===id?{...x,status,updatedAt:now()}:x)});
}
export function classifyDocument(name:string,type=''){
 const v=(name+' '+type).toLowerCase();
 const rules:[string,RegExp][]=[
  ['trial-balance',/(trial.?balance|\btb\b|(?:ال)?ميزان.*(?:ال)?مراجعة)/i],['general-ledger',/(general.?ledger|\bgl\b|(?:ال)?أ?ستاذ)/i],['journal',/(journal|قيود|(?:ال)?يومية)/i],
  ['financial-statements',/(financial.?statements|(?:ال)?قوائم.*(?:ال)?مالية)/i],['chart-of-accounts',/(chart.?of.?accounts|\bcoa\b|دليل.*حسابات)/i],
  ['inventory-count',/(inventory.?count|جرد)/i],['inventory',/(inventory|مخزون)/i],['purchase-support',/(purchase|supplier|مشتريات|مورد)/i],
  ['cash-flow-support',/(cash.?flow|تدفقات.?نقدية)/i],['equity-movement-support',/(equity|حقوق.?الملكية)/i],['controls-document',/(control|رقابة|ضوابط)/i]
 ];return rules.find(([,r])=>r.test(v))?.[0]||'other';
}
export function buildReportPlan(recipeId:string,w:AuditWorkspace){
 const recipe=REPORT_RECIPES[recipeId];if(!recipe)throw new RangeError('Unknown report recipe');
 const types=new Set(w.evidence.map(x=>classifyDocument(x.name,x.type)));
 const requirements=recipe.requirements.map(r=>({...r,status:r.documentTypes.some(t=>types.has(t))?'satisfied':'required'}));
 return{recipe,requirements,readyForBuild:requirements.every(x=>x.status==='satisfied'),required:requirements.filter(x=>x.status==='required')};
}

const humanDefs=[
 ['MATERIALITY_APPROVED','اعتماد الأهمية النسبية'],['SUBSEQUENT_EVENTS','استكمال إجراءات الأحداث اللاحقة'],['GOING_CONCERN','استنتاج الاستمرارية'],
 ['RELATED_PARTIES','استكمال الأطراف ذات العلاقة'],['LEGAL_CONTINGENCIES','القضايا والالتزامات المحتملة'],['WRITTEN_REPRESENTATIONS','الإقرارات الكتابية من الإدارة'],
 ['KAM_DETERMINATION','تحديد أمور المراجعة الرئيسية KAM'],['UNCORRECTED_MISSTATEMENTS','تقييم التحريفات غير المصححة']
] as const;
export function completionRequirements(w:AuditWorkspace,a:AdvancedAuditState):CompletionRequirement[]{
 const latest=new Map(a.decisions.map(x=>[x.checkId,x]));
 const openReq=a.requests.filter(x=>['draft','requested','received','under-review','partial'].includes(x.status));
 const openIssues=w.issues.filter(x=>x.status==='open'),pendingAdj=w.adjustments.filter(x=>x.status==='proposed');
 const rows:CompletionRequirement[]=[
  {id:'COUNCIL_COMPLETED',title:'الجولة النهائية للمجلس مكتملة',mode:'system',status:w.councilRounds.length?'satisfied':'pending',detail:w.councilRounds.length?'توجد جولة مجلس مسجلة.':'لا توجد جولة مجلس.'},
  {id:'EVIDENCE_REQUESTS_CLOSED',title:'طلبات الأدلة مغلقة',mode:'system',status:openReq.length?'pending':'satisfied',detail:openReq.length?openReq.length+' طلب مفتوح':'لا توجد طلبات مفتوحة.'},
  {id:'ISSUES_RESOLVED',title:'القضايا المهنية محسومة',mode:'system',status:openIssues.length?'pending':'satisfied',detail:openIssues.length+ ' قضية مفتوحة.'},
  {id:'ADJUSTMENTS_DECIDED',title:'كل التسويات اتُخذ قرار بشأنها',mode:'system',status:pendingAdj.length?'pending':'satisfied',detail:pendingAdj.length+' تسوية معلقة.'},
  {id:'EVIDENCE_PRESENT',title:'وجود أدلة مسجلة',mode:'system',status:w.evidence.length?'satisfied':'blocked',detail:w.evidence.length?w.evidence.length+' مصدر مسجل':'لا توجد أدلة.'}
 ];
 if(['audit','review'].includes(w.engagementType))for(const [id,title] of humanDefs){const d=latest.get(id);rows.push({id,title,mode:'human',status:id==='MATERIALITY_APPROVED'&&!w.materiality?'blocked':d?.status||'pending',detail:id==='MATERIALITY_APPROVED'&&!w.materiality?'احسب الأهمية النسبية أولًا':d?.rationale||'يتطلب حكمًا مهنيًا بشريًا موثقًا.'})}
 return rows;
}
export function recordHumanDecision(a:AdvancedAuditState,input:{checkId:string;status:'satisfied'|'not-applicable'|'blocked';actor:string;rationale:string}){
 if(!input.actor.trim()||!input.rationale.trim())throw new Error('اسم صاحب القرار والمبرر مطلوبان');
 const d:HumanDecision={id:'DEC-'+Date.now().toString(36).toUpperCase(),checkId:input.checkId,status:input.status,actor:input.actor.trim(),rationale:input.rationale.trim(),at:now()};
 return saveAdvancedAudit({...a,decisions:[...a.decisions.filter(x=>x.checkId!==input.checkId),d]});
}
export function completionStatus(w:AuditWorkspace,a:AdvancedAuditState){const requirements=completionRequirements(w,a),blockers=requirements.filter(x=>!['satisfied','not-applicable'].includes(x.status));return{requirements,blockers,ready:blockers.length===0,score:Math.round((requirements.length-blockers.length)/Math.max(1,requirements.length)*100)}}

export function buildAuditReport(w:AuditWorkspace,a:AdvancedAuditState,recipeId:string){
 const plan=buildReportPlan(recipeId,w),completion=completionStatus(w,a),recipe=plan.recipe,date=new Date().toLocaleDateString('ar-SA-u-nu-latn');
 const issues=w.issues.map(x=>'<li>'+esc(x.title)+' — '+esc(x.severity)+' — '+esc(x.status)+'</li>').join('')||'<li>لا توجد قضايا مسجلة.</li>';
 const adjustments=w.adjustments.map(x=>'<li>'+esc(x.account)+' — مدين '+esc(x.debit)+' / دائن '+esc(x.credit)+' — '+esc(x.status)+'</li>').join('')||'<li>لا توجد تسويات مسجلة.</li>';
 const missing=plan.required.map(x=>'<li>'+esc(x.title)+'</li>').join('')||'<li>لا متطلبات مستندية ناقصة بحسب الوصفة.</li>';
 const html='<article dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8;padding:28px;max-width:900px;margin:auto"><h1>'+esc(recipe.title)+'</h1><p><b>المنشأة:</b> '+esc(w.entity||'—')+' · <b>الفترة:</b> '+esc(w.period)+' · <b>التاريخ:</b> '+esc(date)+'</p><p><b>جاهزية الإكمال:</b> '+completion.score+'٪</p><h2>المتطلبات غير المكتملة</h2><ul>'+missing+'</ul><h2>القضايا</h2><ul>'+issues+'</ul><h2>التسويات</h2><ul>'+adjustments+'</ul><h2>تغطية الأدلة</h2><p>'+w.evidence.length+' مصدر/دليل مسجل، '+w.journalRows.length+' قيد/صف تحليلي.</p><h2>مسار التتبع</h2><p>تم إنشاء هذه المسودة من حالة S.kosif المحلية الحالية. أي إصدار نهائي يتطلب اكتمال بوابات الإكمال وقرارًا بشريًا موثقًا.</p></article>';
 const report:AuditReport={id:'REP-'+Date.now().toString(36).toUpperCase(),recipeId,title:recipe.title,status:completion.ready&&plan.readyForBuild?'ready':'draft',generatedAt:now(),html};
 return{state:saveAdvancedAudit({...a,reports:[report,...a.reports]}),report,plan,completion};
}
export function issueReport(a:AdvancedAuditState,id:string,input:{actor:string;rationale:string}){
 if(!input.actor.trim()||!input.rationale.trim())throw new Error('اسم المُصدر والمبرر مطلوبان');
 const row=a.reports.find(x=>x.id===id);if(!row)throw new Error('التقرير غير موجود');if(row.status!=='ready')throw new Error('التقرير غير جاهز للإصدار');
 return saveAdvancedAudit({...a,reports:a.reports.map(x=>x.id===id?{...x,status:'issued',issuedAt:now(),actor:input.actor.trim(),rationale:input.rationale.trim()}:x)});
}
function sessionToken(){const s=parse(localStorage.getItem(SESSION))||{};return String(s.accessToken||'')}
export function saveGateway(a:AdvancedAuditState,gatewayUrl:string){const v=saveAdvancedAudit({...a,gatewayUrl:gatewayUrl.trim().replace(/\/+$/,'')});const old=parse(localStorage.getItem(SESSION))||{};localStorage.setItem(SESSION,JSON.stringify({...old,engagementId:v.engagementId,gatewayUrl:v.gatewayUrl}));return v}
async function jsonOrError(res:Response){const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(String(body.message||body.error||('HTTP '+res.status)));return body}
export async function analyzeRemoteDocument(a:AdvancedAuditState,file:File){
 if(!a.gatewayUrl)throw new Error('أدخل رابط بوابة Document Intelligence أولًا');
 const form=new FormData();form.append('file',file,file.name);form.append('engagementId',a.engagementId);form.append('jurisdiction','SA');form.append('framework','IFRS');
 const token=sessionToken(),headers:Record<string,string>={'X-KOSIF-Engagement':a.engagementId};if(token)headers.Authorization='Bearer '+token;
 const result=await jsonOrError(await fetch(a.gatewayUrl+'/api/documents/analyze',{method:'POST',headers,body:form}));
 const row:RemoteAnalysis={id:'RA-'+Date.now().toString(36).toUpperCase(),documentName:file.name,documentId:String(result.documentId||result.id||''),at:now(),result};
 return{state:saveAdvancedAudit({...a,remoteAnalyses:[row,...a.remoteAnalyses]}),analysis:row};
}
export async function gatewayHealth(a:AdvancedAuditState){if(!a.gatewayUrl)throw new Error('رابط البوابة غير مضبوط');return jsonOrError(await fetch(a.gatewayUrl+'/health',{headers:{Accept:'application/json'}}))}

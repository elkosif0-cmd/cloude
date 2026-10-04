// Independent bounded renderer regression tests. No app data, browser, or network writes.
// Mutation targets: remove Arabic state mapping; equate quality with issuance;
// mutate report enums while rendering; leak raw source/readiness labels.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function section(id,status){return {id,title:id,status,humanReviewRequired:status==='human-required',paragraphs:[],facts:[],tables:[],sourceIds:['DOC-001']};}
function fixture(){return {id:'RPT-001',version:1,title:'اختبار',status:'draft',sections:['ready','draft','human-required','unavailable'].map((s,i)=>section('s'+i,s)),quality:{readyForIssue:true,humanReviewSections:['s2'],unavailableSections:['s3'],orphaned:8},readiness:{score:100,checks:{a:true,b:true,c:true,d:true,e:true,f:true},blockers:[],openRequests:0,unresolvedIssues:0}};}
function load(file,globals,names){const source=fs.readFileSync(path.join(root,'ui/audit/v5',file),'utf8').replace(/^import .*;\s*$/gm,'').replace(/\bexport (?=(function|const|let)\b)/g,'').replace(/^export\s*\{[^}]*\};?\s*$/gm,'');const context=vm.createContext({...globals});vm.runInContext(source+'\n;globalThis.api={'+names.join(',')+'};',context,{filename:file});return context.api;}
function renderer(report){const nodes=new Map(['#reportOutline','#reportPaper','#reportInspector'].map(s=>[s,{innerHTML:''}]));const engagement={entity:'كيان تجريبي',period:'2025',reports:[report]};const api=load('continuous-reporting.js',{store:{engagement},esc,money:String,CSS:{escape:String},__kxRoot:()=>({querySelector:s=>nodes.get(s),querySelectorAll:()=>[]})},['renderReport']);return {api,nodes,engagement};}
test('outline localizes all four states without changing report state',()=>{const report=fixture(),before=JSON.stringify(report),{api,nodes}=renderer(report);api.renderReport(report);const html=nodes.get('#reportOutline').innerHTML;for(const label of ['محتوى جاهز للمراجعة','مسودة','يتطلب مراجعة بشرية','غير متاح'])assert.ok(html.includes(label),label);assert.equal(JSON.stringify(report),before);assert.ok(html.includes('data-report-section="s0"'));});
test('unknown outline state is neutral and escaped',()=>{const report=fixture();report.sections=[section('s0','<unknown>')];const {api,nodes}=renderer(report);api.renderReport(report);const html=nodes.get('#reportOutline').innerHTML;assert.ok(!html.includes('<unknown>'));assert.ok(!html.includes('جاهز'));assert.match(html,/غير معروفة|غير معروف|غير محدد/);});
test('inherited object keys are unknown states, never function or object labels',()=>{for(const status of ['constructor','toString','__proto__']){const report=fixture();report.sections=[section('s0',status)];const {api,nodes}=renderer(report);api.renderReport(report);const html=nodes.get('#reportOutline').innerHTML;assert.match(html,/حالة غير معروفة/);assert.doesNotMatch(html,/function|\[object/);}});
test('quality pass and 100 percent never erase draft warning',()=>{const report=fixture(),{api,nodes}=renderer(report);api.renderReport(report);assert.match(nodes.get('#reportPaper').innerHTML,/مسودة.*غير صالحة للإصدار/s);assert.equal(report.status,'draft');});
test('issued base report labels original status so extract decoration cannot contradict it',()=>{const report=fixture();report.status='issued';const {api,nodes}=renderer(report);api.renderReport(report);const html=nodes.get('#reportPaper').innerHTML;assert.doesNotMatch(html,/<strong>صادر<\/strong>/);assert.match(html,/حالة التقرير الأصلي: صادر/);assert.doesNotMatch(html,/الإصدار يتطلب اعتمادًا/);});
test('inspector names stored readiness and source labels in Arabic',()=>{const report=fixture(),{api,nodes}=renderer(report);api.renderReport(report);const text=nodes.get('#reportInspector').innerHTML;assert.match(text,/جاهزية/);assert.match(text,/محفوظ|نسخة/);assert.doesNotMatch(text,/Readiness:|Issue authority:/);assert.doesNotMatch(nodes.get('#reportPaper').innerHTML,/Trace sources:/);});
test('missing readiness checks never render NaN or undefined',()=>{const report=fixture();delete report.readiness.checks;const {api,nodes}=renderer(report);api.renderReport(report);assert.doesNotMatch(nodes.get('#reportInspector').innerHTML,/NaN|undefined/);});
test('repeated rendering is idempotent and leaves model untouched',()=>{const report=fixture(),before=JSON.stringify(report),{api,nodes}=renderer(report);api.renderReport(report);const first=[...nodes.values()].map(n=>n.innerHTML);api.renderReport(report);assert.deepEqual([...nodes.values()].map(n=>n.innerHTML),first);assert.equal(JSON.stringify(report),before);});
test('publication keeps serialized raw labels and every report section',()=>{const report=fixture(),before=JSON.stringify(report);const api=load('report-publication.js',{formatMoneyMinor:String,stringifyState:JSON.stringify},['reportPublicationStatus','serializeReportPackage','renderStandaloneReportHtml']);assert.equal(api.reportPublicationStatus(report).label,'DRAFT — NOT FOR ISSUE');const data=JSON.parse(api.serializeReportPackage(report,{mode:'executive',exportedAt:'fixed'}));assert.equal(data.viewMode,'executive');assert.equal(data.report.sections.length,4);assert.equal(data.publication.label,'DRAFT — NOT FOR ISSUE');assert.equal(JSON.stringify(report),before);});
test('standalone issued extract still warns that it is not formal report',()=>{const report=fixture();report.status='issued';const api=load('report-publication.js',{formatMoneyMinor:String,stringifyState:JSON.stringify},['renderStandaloneReportHtml']);const html=api.renderStandaloneReportHtml(report,{mode:'executive',exportedAt:'fixed'});assert.match(html,/مقتطف.*ليس التقرير الرسمي/s);assert.doesNotMatch(html,/PRESENTATION EXTRACT|Trace sources:/);assert.equal(report.status,'issued');});
test('buildDraft preserves final refresh decorators instead of replacing rendered DOM',()=>{
  const report=fixture(),nodes=new Map(['#reportOutline','#reportPaper','#reportInspector'].map(s=>[s,{innerHTML:''}]));
  const store={analysis:null,engagement:{entity:'demo',period:'2025',reports:[]},recipePlan:{understood:true,recipe:{id:'balance'}}};
  const api=load('continuous-reporting.js',{store,esc,money:String,CSS:{escape:String},__kxRoot:()=>({querySelector:s=>nodes.get(s),querySelectorAll:()=>[]}),buildEngagementTraceability:()=>({}),traceabilityMetrics:()=>({}),documentAnalysisMetrics:()=>({}),analyses:()=>[],buildProfessionalReportModel:()=>structuredClone(report),attachDisclosureSection:x=>x,deriveEngagementStage:()=> 'report'},['buildDraft','renderReport','setRefresh:fn=>refresh=fn']);
  let calls=0;api.setRefresh(()=>{calls++;api.renderReport();nodes.get('#reportPaper').innerHTML='<div class="publication-banner">DRAFT</div>'+nodes.get('#reportPaper').innerHTML+'<button data-trace-id="DOC-001">DOC-001</button>';nodes.get('#reportOutline').innerHTML+='<span data-mode="executive">3/5</span>';});
  api.buildDraft();
  assert.equal(calls,1);assert.equal(store.engagement.reports.length,1);
  assert.match(nodes.get('#reportPaper').innerHTML,/publication-banner/);
  assert.match(nodes.get('#reportPaper').innerHTML,/data-trace-id="DOC-001"/);
  assert.match(nodes.get('#reportOutline').innerHTML,/data-mode="executive"/);
  assert.equal(store.engagement.reports[0].status,'draft');
});
test('publication renderer mode switching preserves section counts, single banner, and raw model',()=>{
  const report=fixture();report.sections=['cover','basis','adjustment-summary','statement-of-financial-position','trace'].map(id=>section(id,'draft'));
  const before=JSON.stringify(report),banners=[],sections=report.sections.map(s=>({id:'report-'+s.id,hidden:false})),outline=report.sections.map(s=>({dataset:{reportSection:s.id},hidden:false}));
  const paper={querySelector:()=>banners.length?{remove(){banners.pop()}}:null,insertAdjacentHTML:(_where,html)=>banners.push(html)};
  const toolbar={dataset:{},querySelectorAll:()=>[]},count={textContent:''},select={value:''};
  const nodes={'#reportPaper':paper,'#reportPublicationToolbar':toolbar,'#reportVisibleSectionCount':count,'#reportPresentationMode':select,'.report-panel':{querySelector:()=>({})}};
  const domain=load('report-publication.js',{formatMoneyMinor:String,stringifyState:JSON.stringify},['reportPublicationStatus','reportSectionsForMode']);
  const api=load('continuous-publication.js',{...domain,store:{engagement:{reports:[report]}},esc,__kxRoot:()=>({querySelector:s=>nodes[s],querySelectorAll:s=>s.includes('#reportPaper')?sections:outline})},['renderPublication','setMode:value=>mode=value']);
  api.setMode('executive');api.renderPublication();assert.equal(sections.filter(s=>!s.hidden).length,3);assert.equal(outline.filter(s=>!s.hidden).length,3);assert.match(count.textContent,/3 من 5/);assert.match(banners[0],/مقتطف للعرض/);assert.equal(toolbar.dataset.status,'draft');
  api.renderPublication();assert.equal(banners.length,1);assert.equal(JSON.stringify(report),before);
  api.setMode('professional');api.renderPublication();assert.equal(sections.filter(s=>!s.hidden).length,5);assert.match(count.textContent,/5 من 5/);assert.match(banners[0],/مسودة — غير صالحة للإصدار/);
  report.status='issued';api.setMode('executive');api.renderPublication();assert.match(banners[0],/ليس التقرير الرسمي/);assert.equal(toolbar.dataset.status,'issued');
  for(const status of ['issued','draft']){
    report.status=status;const snapshot=JSON.stringify(report);api.setMode('evidence-book');api.renderPublication();
    assert.equal(select.value,'evidence-book');assert.equal(sections.filter(s=>!s.hidden).length,5);assert.equal(outline.filter(s=>!s.hidden).length,5);assert.match(count.textContent,/5 من 5/);
    assert.match(banners[0],/مقتطف للعرض — ليس التقرير الرسمي الصادر/);assert.match(banners[0],/سجل الأدلة/);assert.equal(toolbar.dataset.status,status);assert.equal(banners.length,1);assert.equal(JSON.stringify(report),snapshot);
  }
});
test('real source decorator remains idempotent and escapes source IDs',()=>{
  const report=fixture();report.sections=[section('cover','ready')];report.sections[0].sourceIds=['AJ-001','<bad>'];const before=JSON.stringify(report);
  const small={innerHTML:'',classList:{add(){}}};const api=load('continuous-trace-inspector.js',{store:{engagement:{reports:[report]}},esc,CSS:{escape:String},__kxRoot:()=>({querySelector:s=>s==='#report-cover > small'?small:null})},['decorateReportSources']);
  api.decorateReportSources();const once=small.innerHTML;api.decorateReportSources();assert.equal(small.innerHTML,once);assert.equal((once.match(/data-trace-id=/g)||[]).length,2);assert.match(once,/مصادر التتبع/);assert.match(once,/data-trace-id="AJ-001"/);assert.doesNotMatch(once,/<bad>/);assert.equal(JSON.stringify(report),before);
});

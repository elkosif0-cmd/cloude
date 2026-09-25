import{describe,it,expect}from'vitest';
import{buildReportPlan,classifyDocument,completionRequirements,REPORT_RECIPES,type AdvancedAuditState}from'./auditAdvanced';
import type{AuditWorkspace}from'./audit';

const workspace=(patch:Partial<AuditWorkspace>={}):AuditWorkspace=>({
 version:2,entity:'شركة اختبار',period:'2026',engagementType:'audit',evidence:[],issues:[],adjustments:[],journalRows:[],councilRounds:[],updatedAt:'2026-09-25T00:00:00Z',...patch
});
const advanced:AdvancedAuditState={version:1,engagementId:'ENG-1',gatewayUrl:'',requests:[],decisions:[],reports:[],remoteAnalyses:[],updatedAt:'2026-09-25T00:00:00Z'};

describe('advanced audit contracts',()=>{
 it('keeps the five report recipes',()=>expect(Object.keys(REPORT_RECIPES)).toHaveLength(5));
 it('classifies common evidence names',()=>{expect(classifyDocument('ميزان المراجعة.xlsx')).toBe('trial-balance');expect(classifyDocument('General Ledger.csv')).toBe('general-ledger')});
 it('blocks audit report until required evidence exists',()=>{const p=buildReportPlan('audit-report',workspace());expect(p.readyForBuild).toBe(false);expect(p.required.map(x=>x.id)).toEqual(expect.arrayContaining(['FS','TB','GL']))});
 it('recognizes document coverage by registered evidence names',()=>{const p=buildReportPlan('audit-report',workspace({evidence:[
  {id:'1',name:'القوائم المالية.pdf',type:'pdf',size:1,addedAt:'x',status:'received'},
  {id:'2',name:'ميزان المراجعة.xlsx',type:'xlsx',size:1,addedAt:'x',status:'received'},
  {id:'3',name:'General Ledger.csv',type:'csv',size:1,addedAt:'x',status:'received'}
 ]}));expect(p.readyForBuild).toBe(true)});
 it('separates system gates from human professional judgements',()=>{const r=completionRequirements(workspace(),advanced);expect(r.some(x=>x.mode==='human'&&x.id==='GOING_CONCERN')).toBe(true);expect(r.some(x=>x.id==='EVIDENCE_PRESENT'&&x.status==='blocked')).toBe(true)});
});

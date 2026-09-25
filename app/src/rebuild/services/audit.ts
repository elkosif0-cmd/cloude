export type AuditRisk='low'|'medium'|'high';
export interface AuditEvidence{ id:string; name:string; type:string; size:number; addedAt:string; sha256?:string; status:'received'|'reviewed'; }
export interface AuditIssue{ id:string; title:string; severity:'low'|'medium'|'high'|'critical'; status:'open'|'resolved'; note:string; createdAt:string; }
export interface AuditAdjustment{ id:string; account:string; debit:number; credit:number; rationale:string; status:'proposed'|'accepted'|'rejected'; createdAt:string; }
export interface AuditWorkspace{
 version:2; entity:string; period:string; engagementType:'audit'|'review'|'analysis';
 evidence:AuditEvidence[]; issues:AuditIssue[]; adjustments:AuditAdjustment[];
 materiality?:MaterialityResult; journalRows:Record<string,unknown>[]; journalAnalysis?:JournalAnalysis;
 councilRounds:CouncilRound[]; migratedFromLegacy?:boolean; updatedAt:string;
}
export interface MaterialityInput{benchmark:'revenue'|'profit'|'assets'|'equity'|'expenses';amount:number;risk:AuditRisk;performanceRate?:number;trivialRate?:number}
export interface MaterialityResult extends MaterialityInput{rate:number;overall:number;performance:number;trivial:number}
export interface JournalFlag{index:number;flags:string[];amount:number;reference:string;date:string}
export interface JournalAnalysis{rows:number;flagged:number;round:number;weekend:number;duplicateReference:number;nearMateriality:number;large:number;flags:JournalFlag[]}
export interface BenfordRow{digit:number;actual:number;expected:number;delta:number}
export interface CouncilSeat{seat:string;status:'clear'|'caution'|'blocked';message:string}
export interface CouncilRound{id:string;at:string;readiness:number;seats:CouncilSeat[]}
const KEY='skosif_rebuild_audit_workspace_v2';
const LEGACY_KEY='kosif-audit-studio:v1';

const empty=():AuditWorkspace=>({version:2,entity:'',period:new Date().getFullYear().toString(),engagementType:'audit',evidence:[],issues:[],adjustments:[],journalRows:[],councilRounds:[],updatedAt:new Date().toISOString()});
const safeParse=(raw:string|null)=>{try{return raw?JSON.parse(raw):null}catch{return null}};
const arr=(v:any)=>Array.isArray(v)?v:[];

export function legacyAuditState(){return safeParse(localStorage.getItem(LEGACY_KEY))}
export function legacyAuditSummary(){
 const x=legacyAuditState();if(!x)return{exists:false,version:null,documents:0,evidence:0,issues:0,requests:0,adjustments:0,reports:0};
 const e=x.engagement||x;
 return{exists:true,version:x.version??null,documents:arr(e.documents).length,evidence:arr(e.evidence).length,issues:arr(e.issues).length,requests:arr(e.requests).length,adjustments:arr(e.adjustments).length,reports:arr(e.reports).length};
}
export function loadAuditWorkspace():AuditWorkspace{
 const saved=safeParse(localStorage.getItem(KEY));if(saved?.version===2)return saved;
 const legacy=legacyAuditState(),w=empty();
 if(legacy){
  const e=legacy.engagement||legacy;
  w.entity=String(e.entity||'');w.period=String(e.period||w.period);w.migratedFromLegacy=true;
  w.evidence=arr(e.documents).map((d:any,i:number)=>({id:String(d.id||'legacy-doc-'+i),name:String(d.name||d.filename||d.title||'مستند قديم'),type:String(d.type||d.mime||''),size:Number(d.size)||0,addedAt:String(d.createdAt||d.addedAt||new Date().toISOString()),status:'reviewed' as const}));
  w.issues=arr(e.issues).map((x:any,i:number)=>({id:String(x.id||'legacy-issue-'+i),title:String(x.title||x.summary||'قضية من الملف السابق'),severity:(['low','medium','high','critical'].includes(x.severity)?x.severity:'medium') as any,status:(['closed','resolved'].includes(x.status)?'resolved':'open'),note:String(x.note||x.description||''),createdAt:String(x.createdAt||new Date().toISOString())}));
  w.adjustments=arr(e.adjustments).map((x:any,i:number)=>({id:String(x.id||'legacy-adj-'+i),account:String(x.account||x.title||'تسوية سابقة'),debit:Number(x.debit||0),credit:Number(x.credit||0),rationale:String(x.rationale||x.note||''),status:(['accepted','rejected'].includes(x.status)?x.status:'proposed') as any,createdAt:String(x.createdAt||new Date().toISOString())}));
  saveAuditWorkspace(w);
 }
 return w;
}
export function saveAuditWorkspace(w:AuditWorkspace){const next={...w,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(next));return next}
export function resetAuditWorkspace(){const w=empty();saveAuditWorkspace(w);return w}

const rates:Record<MaterialityInput['benchmark'],number>={revenue:.005,profit:.05,assets:.01,equity:.01,expenses:.005};
export function calculateMateriality(v:MaterialityInput):MaterialityResult{
 const amount=Math.max(0,Number(v.amount)||0),risk=v.risk||'medium',base=rates[v.benchmark]||.005;
 const factor=risk==='high'?.75:risk==='low'?1.15:1,rate=base*factor,performanceRate=Math.min(.95,Math.max(.3,v.performanceRate??.7)),trivialRate=Math.min(.1,Math.max(.01,v.trivialRate??.05));
 const overall=amount*rate;return{...v,amount,risk,rate,performanceRate,trivialRate,overall,performance:overall*performanceRate,trivial:overall*trivialRate};
}
const num=(v:unknown)=>{const n=Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:0};
const text=(r:Record<string,unknown>,keys:string[])=>{for(const k of keys)if(r[k]!=null&&String(r[k]).trim())return String(r[k]).trim();return''};
export function rowAmount(r:Record<string,unknown>){const debit=num(r.debit??r.Debit??r['مدين']),credit=num(r.credit??r.Credit??r['دائن']),amount=num(r.amount??r.Amount??r['المبلغ']);return Math.max(Math.abs(amount),Math.abs(debit),Math.abs(credit))}
export function analyzeJournal(rows:Record<string,unknown>[],materiality=0):JournalAnalysis{
 const refs=new Map<string,number>();rows.forEach(r=>{const ref=text(r,['reference','ref','voucher','journalNo','رقم القيد','المرجع']);if(ref)refs.set(ref,(refs.get(ref)||0)+1)});
 const flags:JournalFlag[]=[];let round=0,weekend=0,duplicateReference=0,nearMateriality=0,large=0;
 rows.forEach((r,index)=>{const amount=rowAmount(r),reference=text(r,['reference','ref','voucher','journalNo','رقم القيد','المرجع']),date=text(r,['date','Date','postingDate','التاريخ']);const f:string[]=[];
  if(amount>0&&amount%1000===0){f.push('round');round++}
  if(reference&&(refs.get(reference)||0)>1){f.push('duplicate-reference');duplicateReference++}
  const d=date?new Date(date):null;if(d&&!Number.isNaN(d.getTime())&&(d.getDay()===5||d.getDay()===6)){f.push('weekend');weekend++}
  if(materiality>0&&amount>=materiality*.9&&amount<materiality){f.push('near-materiality');nearMateriality++}
  if(materiality>0&&amount>=materiality){f.push('large');large++}
  if(f.length)flags.push({index,flags:f,amount,reference,date});
 });
 return{rows:rows.length,flagged:flags.length,round,weekend,duplicateReference,nearMateriality,large,flags};
}
export function benford(rows:Record<string,unknown>[]):BenfordRow[]{
 const counts=Array(9).fill(0),vals=rows.map(rowAmount).filter(x=>x>0);for(const v of vals){const d=Number(String(Math.abs(v)).replace(/^0+\.?0*/, '')[0]);if(d>=1&&d<=9)counts[d-1]++}
 const total=counts.reduce((a,b)=>a+b,0)||1;return counts.map((c,i)=>{const digit=i+1,expected=Math.log10(1+1/digit),actual=c/total;return{digit,actual,expected,delta:actual-expected}});
}
export function deterministicSample<T>(rows:T[],size:number){const n=Math.max(0,Math.min(rows.length,Math.floor(size)));if(!n)return[];const step=rows.length/n;return Array.from({length:n},(_,i)=>rows[Math.min(rows.length-1,Math.floor(i*step))])}
export function parseDelimited(textValue:string):Record<string,string>[]{
 const lines=textValue.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)return[];
 const sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?';':',';
 const parse=(line:string)=>{const out:string[]=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===sep&&!q){out.push(cur.trim());cur=''}else cur+=ch}out.push(cur.trim());return out};
 const headers=parse(lines[0]);return lines.slice(1).map(line=>{const vals=parse(line),r:Record<string,string>={};headers.forEach((h,i)=>r[h||('col'+i)]=vals[i]??'');return r});
}
export async function sha256File(file:File){const b=await file.arrayBuffer();const d=await crypto.subtle.digest('SHA-256',b);return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,'0')).join('')}
export function auditReadiness(w:AuditWorkspace){let s=0;if(w.entity)s+=15;if(w.period)s+=5;if(w.evidence.length)s+=25;if(w.materiality)s+=15;if(w.journalRows.length)s+=15;if(!w.issues.some(x=>x.status==='open'&&(x.severity==='high'||x.severity==='critical')))s+=15;if(w.councilRounds.length)s+=10;return Math.min(100,s)}
export function runCouncil(w:AuditWorkspace):CouncilRound{
 const readiness=auditReadiness(w),openHigh=w.issues.filter(x=>x.status==='open'&&(x.severity==='high'||x.severity==='critical')).length;
 const seats:CouncilSeat[]=[
  {seat:'مدير الارتباط',status:!w.entity||!w.evidence.length?'blocked':openHigh?'caution':'clear',message:!w.entity?'بيانات الارتباط غير مكتملة':!w.evidence.length?'لا توجد أدلة مستلمة':openHigh?'توجد قضايا مرتفعة مفتوحة':'مسار الارتباط قابل للاستمرار'},
  {seat:'خبير IFRS',status:w.materiality?'clear':'caution',message:w.materiality?'الأهمية النسبية موثقة':'حدد الأهمية النسبية قبل الاستنتاجات'},
  {seat:'خبير التحليلات',status:w.journalRows.length?(w.journalAnalysis?.flagged?'caution':'clear'):'caution',message:w.journalRows.length?((w.journalAnalysis?.flagged||0)+' قيد بعلامات تحتاج مراجعة'):'لا توجد قيود محللة'},
  {seat:'جودة وأدلة',status:w.evidence.length?'clear':'blocked',message:w.evidence.length?(w.evidence.length+' مصدر/دليل مسجل'):'لا يمكن دعم استنتاج بلا أدلة'},
  {seat:'الاستقلال والحكم المهني',status:openHigh?'caution':'clear',message:openHigh?'لا تعتمد نتيجة نهائية قبل حسم القضايا الجوهرية':'لا توجد قضية مرتفعة مفتوحة مسجلة'}
 ];
 return{id:'round-'+Date.now().toString(36),at:new Date().toISOString(),readiness,seats};
}
export const STANDARDS=[
 {code:'IAS 1 / IFRS 18',title:'Presentation and disclosure',note:'عرض القوائم والأداء المالي؛ IFRS 18 يغير بنية العرض لبعض الفترات المستقبلية.'},
 {code:'IAS 2',title:'Inventories',note:'قياس المخزون بالتكلفة أو صافي القيمة القابلة للتحقق أيهما أقل.'},
 {code:'IAS 7',title:'Statement of Cash Flows',note:'تصنيف وعرض التدفقات النقدية والتسويات ذات الصلة.'},
 {code:'IAS 8',title:'Accounting Policies and Estimates',note:'السياسات والتقديرات وتصحيح الأخطاء.'},
 {code:'IAS 10',title:'Events after the Reporting Period',note:'الأحداث المعدلة وغير المعدلة بعد نهاية الفترة.'},
 {code:'IAS 12',title:'Income Taxes',note:'الضريبة الحالية والمؤجلة والفروق المؤقتة.'},
 {code:'IAS 16',title:'Property, Plant and Equipment',note:'الاعتراف والقياس والإهلاك والاستبعاد للأصول الثابتة.'},
 {code:'IAS 19',title:'Employee Benefits',note:'منافع الموظفين قصيرة وطويلة الأجل والتزامات ما بعد الخدمة.'},
 {code:'IAS 36',title:'Impairment of Assets',note:'مؤشرات الانخفاض واختبار القيمة القابلة للاسترداد.'},
 {code:'IAS 37',title:'Provisions and Contingencies',note:'المخصصات والالتزامات والأصول المحتملة.'},
 {code:'IFRS 9',title:'Financial Instruments',note:'التصنيف والقياس والانخفاض في القيمة والتحوط.'},
 {code:'IFRS 15',title:'Revenue from Contracts with Customers',note:'الاعتراف بالإيراد وفق التزامات الأداء.'},
 {code:'IFRS 16',title:'Leases',note:'محاسبة عقود الإيجار لدى المستأجر والمؤجر.'},
 {code:'ISA 315',title:'Risk Identification and Assessment',note:'فهم المنشأة والرقابة وتحديد مخاطر التحريف الجوهري.'},
 {code:'ISA 330',title:'Responses to Assessed Risks',note:'تصميم استجابات المراجع للمخاطر المقيمة.'},
 {code:'ISA 500',title:'Audit Evidence',note:'كفاية وملاءمة أدلة المراجعة.'},
 {code:'ISA 530',title:'Audit Sampling',note:'تصميم العينة واختيارها وتقييم نتائجها.'},
 {code:'ISA 700',title:'Forming an Opinion and Reporting',note:'تكوين الرأي وشكل تقرير المراجع.'}
] as const;
export function searchStandards(q:string){const x=q.trim().toLowerCase();return !x?[...STANDARDS]:STANDARDS.filter(s=>(s.code+' '+s.title+' '+s.note).toLowerCase().includes(x))}

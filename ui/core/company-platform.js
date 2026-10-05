/* KOSIF company operating layer — shared company definitions, selected tools, document lineage and reporting intake.
   Capabilities are global; state is always bound to the open company. No AI result mutates authoritative accounting data here. */
(()=>{
"use strict";
const {load,save}=SK;
const KEY="skosif_company_platform_v1";
const DOC_DB="skosif-company-documents-v1",DOC_STORE="documents";
const TYPES=Object.freeze({
  products:{label:"المنتجات",icon:"catalog"},
  services:{label:"الخدمات",icon:"offers"},
  customers:{label:"العملاء",icon:"customers"},
  suppliers:{label:"الموردون",icon:"suppliers"},
  employees:{label:"الموظفون",icon:"tasks"},
  branches:{label:"الفروع",icon:"companies"},
  warehouses:{label:"المخازن",icon:"inventory"},
  costCenters:{label:"مراكز التكلفة",icon:"finance"},
  projects:{label:"المشروعات",icon:"operations"},
  units:{label:"وحدات القياس",icon:"labels"},
  taxes:{label:"الضرائب",icon:"zatca"}
});
const REPORT_TARGETS=Object.freeze({
  full:{label:"قوائم مالية كاملة",requires:["trial-balance"],optional:["general-ledger","bank-statement","inventory","fixed-assets-register","payroll","tax-document"]},
  income:{label:"قائمة الدخل وتحليل الإيرادات والمصروفات",requires:["trial-balance"],optional:["general-ledger","sales","purchases"]},
  position:{label:"قائمة المركز المالي",requires:["trial-balance"],optional:["bank-statement","inventory","fixed-assets-register","aging"]},
  cashflow:{label:"التدفقات النقدية",requires:["trial-balance"],optional:["bank-statement","general-ledger"]},
  management:{label:"تقارير الإدارة والربحية",requires:["trial-balance"],optional:["sales","purchases","inventory","products"]}
});
const clean=(v,n=160)=>String(v==null?"":v).replace(/\s+/g," ").trim().slice(0,n);
const cur=()=>window.SK&&SK.company&&SK.company.current?SK.company.current():{id:"",name:""};
const blank=id=>({version:1,companyId:id,profile:{activity:"",country:cur().country||"SA",currency:cur().currency||"SAR",fiscalYearStart:"01-01",taxMode:(cur().country==="EG"?"income":"zakat"),vatNo:"",crNo:"",address:"",notes:""},definitions:Object.fromEntries(Object.keys(TYPES).map(k=>[k,[]])),installedTools:[],documents:[],reporting:{target:"full",lastTrialBalance:null,lastStatements:null},auditHandoffs:[],standardTraces:[],updatedAt:null});
function state(){
  const id=cur().id||"";
  const v=load(KEY,null);
  if(!v||v.version!==1||v.companyId!==id)return blank(id);
  if(!v.profile||typeof v.profile!=="object")v.profile=blank(id).profile;
  for(const k of Object.keys(TYPES))if(!Array.isArray(v.definitions?.[k]))(v.definitions||(v.definitions={}))[k]=[];
  if(!Array.isArray(v.installedTools))v.installedTools=[];
  if(!Array.isArray(v.documents))v.documents=[];
  if(!v.reporting||typeof v.reporting!=="object")v.reporting={target:"full",lastTrialBalance:null,lastStatements:null};
  if(!Array.isArray(v.auditHandoffs))v.auditHandoffs=[];
  if(!Array.isArray(v.standardTraces))v.standardTraces=[];
  return v;
}
function commit(v,act,payload={}){
  const c=cur();if(!c.id)throw new Error("اختر شركة أولاً");
  v.version=1;v.companyId=c.id;v.updatedAt=new Date().toISOString();
  if(save(KEY,v)!==true)throw new Error("تعذر حفظ بيانات الشركة");
  try{SK.audit&&SK.audit.log("company-platform",{act,companyId:c.id,...payload})}catch{}
  try{SK.bus&&SK.bus.emit("company-platform",{act,companyId:c.id})}catch{}
  return v;
}
function uid(prefix){return SK.ui&&SK.ui.uid?SK.ui.uid(prefix):prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7)}
function profile(){const c=cur(),p=state().profile||{};return Object.freeze({activity:clean(p.activity),country:clean(p.country||c.country||"SA",3).toUpperCase(),currency:clean(p.currency||c.currency||"SAR",3).toUpperCase(),fiscalYearStart:/^\\d{2}-\\d{2}$/.test(String(p.fiscalYearStart||""))?String(p.fiscalYearStart):"01-01",taxMode:p.taxMode==="income"?"income":"zakat",vatNo:clean(p.vatNo,40),crNo:clean(p.crNo,40),address:clean(p.address,240),notes:clean(p.notes,500)})}
function setProfile(input={}){
  const s=state(),p=profile(),next={...p,activity:clean(input.activity??p.activity),country:clean(input.country??p.country,3).toUpperCase(),currency:clean(input.currency??p.currency,3).toUpperCase(),fiscalYearStart:/^\\d{2}-\\d{2}$/.test(String(input.fiscalYearStart??p.fiscalYearStart))?String(input.fiscalYearStart??p.fiscalYearStart):p.fiscalYearStart,taxMode:(input.taxMode??p.taxMode)==="income"?"income":"zakat",vatNo:clean(input.vatNo??p.vatNo,40),crNo:clean(input.crNo??p.crNo,40),address:clean(input.address??p.address,240),notes:clean(input.notes??p.notes,500)};
  if(!/^[A-Z]{3}$/.test(next.currency))throw new Error("العملة يجب أن تكون رمزًا من 3 أحرف");
  if(!/^[A-Z]{2,3}$/.test(next.country))throw new Error("رمز الدولة غير صالح");
  s.profile=next;commit(s,"profile.update",{fields:Object.keys(input)});
  if(SK.company&&SK.company.updateMeta)SK.company.updateMeta({country:next.country,currency:next.currency});
  return profile();
}
function definitions(type){if(!TYPES[type])return[];return state().definitions[type].map(x=>({...x}))}
function addDefinition(type,input={}){
  if(!TYPES[type])throw new Error("نوع تعريف غير معروف");
  const name=clean(input.name);if(!name)throw new Error("الاسم مطلوب");
  const s=state(),row={id:uid(type.slice(0,3)),name,code:clean(input.code,48),accountCode:clean(input.accountCode,48),costCenter:clean(input.costCenter,80),unit:clean(input.unit,40),notes:clean(input.notes,500),createdAt:new Date().toISOString()};
  for(const k of ["salePrice","purchasePrice","cost","wastePct","marginPct"])if(input[k]!==undefined&&input[k]!==""&&Number.isFinite(Number(input[k])))row[k]=Number(input[k]);
  s.definitions[type].push(row);commit(s,"definition.add",{type,id:row.id});return row;
}
function removeDefinition(type,id){
  if(!TYPES[type])return false;const s=state(),before=s.definitions[type].length;
  s.definitions[type]=s.definitions[type].filter(x=>x.id!==id);
  if(s.definitions[type].length===before)return false;commit(s,"definition.remove",{type,id});return true;
}
function installed(id){return state().installedTools.includes(id)}
function setTool(id,on){
  const cap=SK.caps&&SK.caps.get?SK.caps.get(id):null;
  if(!cap||cap.gateway!=="tools")throw new Error("الأداة ليست ضمن بوابة الأدوات المستقلة");
  const s=state(),set=new Set(s.installedTools);on?set.add(id):set.delete(id);s.installedTools=[...set];
  commit(s,on?"tool.install":"tool.remove",{capabilityId:id});return on;
}
function reportingTarget(id){if(!REPORT_TARGETS[id])return false;const s=state();s.reporting.target=id;commit(s,"reporting.target",{target:id});return true}
const inferType=(name,mime="")=>{
  const x=(String(name)+" "+String(mime)).toLowerCase();
  const tests=[[/trial|tb|ميزان/,"trial-balance"],[/general.*ledger|ledger|استاذ|أستاذ/,"general-ledger"],[/bank|بنك/,"bank-statement"],[/aging|اعمار|أعمار/,"aging"],[/inventory|مخزون|جرد/,"inventory"],[/fixed|asset|اصول|أصول/,"fixed-assets-register"],[/payroll|salary|رواتب|اجور|أجور/,"payroll"],[/sales|مبيعات/,"sales"],[/purchase|مشتريات/,"purchases"],[/tax|vat|zakat|ضريب|زكاة/,"tax-document"],[/financial.*statement|قوائم|ميزاني/,"financial-statements"],[/contract|عقد/,"contract"],[/invoice|فاتور/,"invoice"]];
  for(const [re,t] of tests)if(re.test(x))return t;
  return "other";
};
async function hashBuffer(buffer){
  if(!(globalThis.crypto&&crypto.subtle))return null;
  const d=await crypto.subtle.digest("SHA-256",buffer);return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
const openDb=()=>new Promise((res,rej)=>{const q=indexedDB.open(DOC_DB,1);q.onupgradeneeded=()=>{const db=q.result;if(!db.objectStoreNames.contains(DOC_STORE)){const s=db.createObjectStore(DOC_STORE,{keyPath:"id"});s.createIndex("companyId","companyId",{unique:false})}};q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
async function putDoc(rec){const db=await openDb();await new Promise((res,rej)=>{const tx=db.transaction(DOC_STORE,"readwrite");tx.objectStore(DOC_STORE).put(rec);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}
async function readDocument(id){
  const db=await openDb(),rec=await new Promise((res,rej)=>{const tx=db.transaction(DOC_STORE,"readonly"),q=tx.objectStore(DOC_STORE).get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)});db.close();
  return rec&&rec.companyId===cur().id?rec:null;
}
async function deleteDocBlob(id){const db=await openDb();await new Promise((res,rej)=>{const tx=db.transaction(DOC_STORE,"readwrite");tx.objectStore(DOC_STORE).delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}
async function ingestFiles(files,sourceGateway="reporting"){
  const c=cur();if(!c.id)throw new Error("اختر شركة أولاً");
  const s=state(),added=[];
  for(const file of [...(files||[])]){
    const buf=await file.arrayBuffer(),hash=await hashBuffer(buf),id=uid("doc"),meta={id,companyId:c.id,name:clean(file.name,180),mime:clean(file.type,100),size:Number(file.size)||buf.byteLength,type:inferType(file.name,file.type),sha256:hash,sourceGateway,importedAt:new Date().toISOString(),status:"received"};
    await putDoc({...meta,blob:new Blob([buf],{type:file.type||"application/octet-stream"})});
    s.documents.push(meta);added.push(meta);
  }
  if(added.length)commit(s,"documents.ingest",{count:added.length,sourceGateway,hashes:added.map(x=>x.sha256).filter(Boolean)});
  return added;
}
function documents(){return state().documents.filter(x=>x.companyId===cur().id).map(x=>({...x}))}
function setDocumentType(id,type){
  const allowed=new Set(["trial-balance","general-ledger","bank-statement","aging","inventory","fixed-assets-register","payroll","sales","purchases","tax-document","financial-statements","contract","invoice","other"]);
  if(!allowed.has(type))throw new Error("نوع المستند غير معروف");
  const s=state(),doc=s.documents.find(x=>x.id===id&&x.companyId===cur().id);if(!doc)return false;
  doc.type=type;commit(s,"document.type",{id,type,sha256:doc.sha256});return true;
}
async function removeDocument(id){
  const s=state(),doc=s.documents.find(x=>x.id===id);if(!doc)return false;
  await deleteDocBlob(id);s.documents=s.documents.filter(x=>x.id!==id);s.auditHandoffs=s.auditHandoffs.filter(x=>x.documentId!==id);commit(s,"document.remove",{id,sha256:doc.sha256});return true;
}
function requestAuditHandoff(id){
  const s=state(),doc=s.documents.find(x=>x.id===id&&x.companyId===cur().id);if(!doc)throw new Error("المستند غير موجود");
  if(!s.auditHandoffs.some(x=>x.documentId===id&&x.status==="pending"))s.auditHandoffs.push({id:uid("handoff"),documentId:id,status:"pending",requestedAt:new Date().toISOString(),requestedBy:"user"});
  commit(s,"audit.handoff.request",{documentId:id,sha256:doc.sha256});return true;
}
function auditHandoffs(){
  const s=state(),docs=Object.fromEntries(s.documents.filter(d=>d.companyId===cur().id).map(d=>[d.id,d]));
  return s.auditHandoffs.filter(h=>docs[h.documentId]).map(h=>({...h,document:{...docs[h.documentId]}}));
}
function markAuditHandoff(id,status,requestId=""){
  const allowed=new Set(["pending","attached","dismissed"]);if(!allowed.has(status))throw new Error("حالة التسليم غير صالحة");
  const s=state(),h=s.auditHandoffs.find(x=>x.id===id);if(!h)return false;
  h.status=status;h.requestId=clean(requestId,80);h.updatedAt=new Date().toISOString();commit(s,"audit.handoff."+status,{handoffId:id,documentId:h.documentId,requestId:h.requestId});return true;
}
function auditHandoffs(status=null){
  const s=state(),docs=Object.fromEntries(s.documents.map(d=>[d.id,d]));
  return s.auditHandoffs.filter(h=>!status||h.status===status).map(h=>({...h,document:docs[h.documentId]?{...docs[h.documentId]}:null})).filter(h=>h.document);
}
function setAuditHandoffStatus(id,status){
  if(!["pending","received","rejected"].includes(status))throw new Error("حالة تسليم غير معروفة");
  const s=state(),row=s.auditHandoffs.find(x=>x.id===id);if(!row)return false;
  row.status=status;row.updatedAt=new Date().toISOString();commit(s,"audit.handoff.status",{handoffId:id,status,documentId:row.documentId});return true;
}
function addStandardTrace(input={}){
  const s=state(),row={id:uid("std"),at:new Date().toISOString(),operation:clean(input.operation,120),standard:clean(input.standard,80),source:clean(input.source,500),result:clean(input.result,500),provider:clean(input.provider,80),approved:input.approved===true};
  s.standardTraces.push(row);if(s.standardTraces.length>500)s.standardTraces=s.standardTraces.slice(-500);commit(s,"standard.trace",{id:row.id,standard:row.standard});return row;
}
function saveReportResult(tb,fs,sourceName=""){
  const s=state();s.reporting.lastTrialBalance={at:new Date().toISOString(),sourceName:clean(sourceName,180),rows:tb.rows.length,balanced:!!tb.balanced,errors:tb.errors.length,unclassified:tb.unclassified,difference:String(tb.difference)};
  s.reporting.lastStatements={at:new Date().toISOString(),mappedPct:fs.checks.mappedPct,balanced:fs.checks.balanced,cashTies:fs.checks.cashTies,unmapped:fs.unmapped.length,keys:Object.fromEntries(Object.entries(fs.keys).map(([k,v])=>[k,{current:String(v.current),prior:v.prior==null?null:String(v.prior)}]))};
  commit(s,"reporting.generated",{sourceName,rows:tb.rows.length,mappedPct:fs.checks.mappedPct});return s.reporting;
}
function reportingStatus(){
  const s=state(),target=REPORT_TARGETS[s.reporting.target]||REPORT_TARGETS.full,types=new Set(documents().map(d=>d.type));
  return{target:s.reporting.target,label:target.label,requires:target.requires,optional:target.optional,missing:target.requires.filter(x=>!types.has(x)),present:[...types],lastTrialBalance:s.reporting.lastTrialBalance,lastStatements:s.reporting.lastStatements};
}
const normSearch=v=>String(v==null?"":v).toLowerCase().replace(/[ً-ٰٟ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ـ/g,"").replace(/\s+/g," ").trim();
const minorText=(v,currency)=>{
  try{const n=BigInt(String(v??"0")),neg=n<0n,a=neg?-n:n;return(neg?"-":"")+(a/100n).toLocaleString("en-US")+"."+String(a%100n).padStart(2,"0")+" "+currency}catch{return String(v??"0")+" "+currency}
};
function searchCompany(query){
  const q=normSearch(query),s=state(),c=cur(),hits=[];
  if(!q)return{text:"اكتب ما تريد البحث عنه داخل الشركة.",matches:[]};
  const words=q.split(" ").filter(w=>w.length>1),matched=hay=>hay.includes(q)||words.some(w=>w.length>2&&hay.includes(w));
  for(const [type,label] of Object.entries(TYPES))for(const x of s.definitions[type]||[]){
    const hay=normSearch([x.name,x.code,x.accountCode,x.costCenter,x.notes].filter(Boolean).join(" "));
    if(matched(hay))hits.push({kind:"definition",type,label:label.label,id:x.id,title:x.name,detail:[x.code,x.accountCode&&"حساب "+x.accountCode,x.costCenter].filter(Boolean).join(" · ")});
  }
  for(const d of documents()){
    const hay=normSearch([d.name,d.type,d.sourceGateway].join(" "));
    if(matched(hay))hits.push({kind:"document",id:d.id,title:d.name,detail:(d.type||"other")+" · "+(d.sha256||"").slice(0,12)});
  }
  const ledger=load("skosif_ledger_v1",{})||{},accounts=Object.fromEntries((ledger.accounts||[]).map(a=>[a.id,a]));
  for(const e of ledger.entries||ledger.journal||[]){
    const lineText=(e.lines||[]).map(l=>{const a=accounts[l.accountId]||{};return[a.code,a.name,l.memo].filter(Boolean).join(" ")}).join(" "),
      hay=normSearch([e.memo,e.description,e.ref,e.reference,e.date,lineText].filter(Boolean).join(" "));
    if(matched(hay))hits.push({kind:"journal",id:e.id||"",title:((e.date||"")+" "+(e.memo||e.description||e.ref||"قيد")).trim(),detail:(e.lines||[]).slice(0,4).map(l=>{const a=accounts[l.accountId]||{};return(a.code||"")+" "+(a.name||"")}).join(" · ")});
  }
  const financial={"الايرادات":"revenue","ايرادات":"revenue","المبيعات":"revenue","مجمل الربح":"gross","الربح التشغيلي":"operating","صافي الربح":"profit","الربح":"profit","الاصول":"assets","اصول":"assets","الالتزامات":"liabilities","المطلوبات":"liabilities","حقوق الملكيه":"equity","النقد":"cash","العملاء":"receivables","المخزون":"inventory","المصروفات الاداريه":"admin","المصاريف الاداريه":"admin","الاهلاك":"depreciation","تكلفه المبيعات":"cogs"},
    fs=s.reporting?.lastStatements,keys=fs?.keys||{},picked=[];
  for(const [word,key] of Object.entries(financial))if(q.includes(normSearch(word))&&keys[key]&&!picked.includes(key))picked.push(key);
  if(/مصروف|مصاريف|تكلف/.test(q))for(const k of ["cogs","selling","admin","depreciation","finance"])if(keys[k]&&!picked.includes(k))picked.push(k);
  const labels={revenue:"الإيرادات",gross:"مجمل الربح",operating:"الربح التشغيلي",profit:"صافي الربح",assets:"الأصول",liabilities:"الالتزامات",equity:"حقوق الملكية",cash:"النقد",receivables:"العملاء",inventory:"المخزون",cogs:"تكلفة المبيعات",selling:"مصروفات البيع",admin:"المصروفات الإدارية",depreciation:"الإهلاك",finance:"تكاليف التمويل"};
  for(const key of picked){const v=keys[key];hits.unshift({kind:"financial",id:key,title:labels[key]||key,detail:"الحالي "+minorText(v.current,c.currency)+" · السابق "+(v.prior==null?"لا توجد مقارنة":minorText(v.prior,c.currency))});}
  const rs=reportingStatus();
  if(/ناقص|مطلوب|مستند|وثيق/.test(q))hits.unshift({kind:"reporting",id:"missing",title:"نواقص مساعد التقارير",detail:rs.missing.length?rs.missing.join("، "):"لا توجد نواقص في الحد الأدنى للمخرج المختار"});
  const limited=hits.slice(0,20),text=limited.length?("نتائج داخل «"+c.name+"»:\n"+limited.map(x=>"• "+x.title+(x.detail?" — "+x.detail:"")).join("\n")):"لم أجد نتيجة مطابقة داخل بيانات الشركة الحالية.";
  return{text,matches:limited};
}
window.SKosifCompanyPlatform=Object.freeze({key:KEY,types:()=>TYPES,reportTargets:()=>REPORT_TARGETS,state,profile,setProfile,definitions,addDefinition,removeDefinition,installed,setTool,reportingTarget,reportingStatus,inferType,ingestFiles,documents,readDocument,setDocumentType,removeDocument,requestAuditHandoff,auditHandoffs,setAuditHandoffStatus,addStandardTrace,saveReportResult,search:searchCompany});
})();
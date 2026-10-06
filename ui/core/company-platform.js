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
  fixedAssets:{label:"الأصول الثابتة",icon:"finance"},
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
const blank=id=>({version:1,companyId:id,profile:{activity:"",country:cur().country||"SA",currency:cur().currency||"SAR",framework:(cur().country==="EG"?"EAS":"IFRS"),fiscalYearStart:"01-01",taxMode:(cur().country==="EG"?"income":"zakat"),vatRegistered:null,vatRate:null,vatNo:"",crNo:"",address:"",notes:""},definitions:Object.fromEntries(Object.keys(TYPES).map(k=>[k,[]])),installedTools:[],documents:[],reporting:{target:"full",lastTrialBalance:null,lastStatements:null,suggestedMeasures:[]},mpms:[],lineage:[],auditHandoffs:[],standardTraces:[],aiExceptions:[],updatedAt:null});
function state(){
  const id=cur().id||"";
  const v=load(KEY,null);
  if(!v||v.version!==1||v.companyId!==id)return blank(id);
  if(!v.profile||typeof v.profile!=="object")v.profile=blank(id).profile;
  for(const k of Object.keys(TYPES))if(!Array.isArray(v.definitions?.[k]))(v.definitions||(v.definitions={}))[k]=[];
  if(!Array.isArray(v.installedTools))v.installedTools=[];
  if(!Array.isArray(v.documents))v.documents=[];
  if(!v.reporting||typeof v.reporting!=="object")v.reporting={target:"full",lastTrialBalance:null,lastStatements:null,suggestedMeasures:[]};
  if(!Array.isArray(v.reporting.suggestedMeasures))v.reporting.suggestedMeasures=[];
  if(!Array.isArray(v.mpms))v.mpms=[];
  if(!Array.isArray(v.lineage))v.lineage=[];
  if(!Array.isArray(v.auditHandoffs))v.auditHandoffs=[];
  if(!Array.isArray(v.standardTraces))v.standardTraces=[];
  if(!Array.isArray(v.aiExceptions))v.aiExceptions=[];
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
/* the VAT policy every posting reads (finance/vat-policy-engine): the country rate unless the profile says otherwise */
const VR=()=>window.SKEngines&&SKEngines.finance&&SKEngines.finance.vatPolicy;
function vatPolicy(){const p=profile();return VR()?VR().vatPolicy({country:p.country,vatRegistered:p.vatRegistered,vatRate:p.vatRate}):{registered:true,rate:0.15,source:"country",country:p.country,label:"15%"}}
/* the sector pack (system/sector-pack-engine): what a company of this sector receives — accounts, cost centers, units,
   warehouses, tools. Applied once for a company created under a sector (packPending), never silently to an existing one;
   it only adds what is missing and records what it added. */
const SP=()=>window.SKEngines&&SKEngines.system&&SKEngines.system.sectorPack;
function sectorPack(){return SP()?SP().sectorPack(cur().sector):null}
function applySectorPack(){
  const P=sectorPack();if(!P)throw new Error("محرك حزم القطاعات غير متاح");
  const s=state(),names=t=>(s.definitions[t]||[]).map(x=>x.name),L=window.SKosifLedger;
  const add=SP().packAdditions(P,{accountCodes:L&&L.accounts?L.accounts().map(a=>a.code):[],definitions:{costCenters:names("costCenters"),units:names("units"),warehouses:names("warehouses")},tools:s.installedTools});
  const now=new Date().toISOString();let defs=0;
  for(const [type,list] of Object.entries(add.definitions))for(const name of list){s.definitions[type].push({id:uid(type.slice(0,3)),name,code:"",accountCode:"",costCenter:"",unit:"",notes:"من حزمة القطاع",createdAt:now});defs++}
  const tools=add.tools.filter(id=>{const c=SK.caps&&SK.caps.get?SK.caps.get(id):null;return !!c&&(SK.caps.inGatewayOf?SK.caps.inGatewayOf(c,"tools"):c.gateway==="tools")});
  s.installedTools=[...new Set([...s.installedTools,...tools])];
  s.sectorPack={id:P.id,depth:P.depth,at:now,definitions:defs,tools:tools.length};commit(s,"sector-pack.apply",{sector:P.id,definitions:defs,tools:tools.length});
  /* the books open the pack's missing accounts through their own account-opening rule */
  let accounts=0;try{if(L&&L.ensureAccounts&&add.accounts.length){L.ensureAccounts(add.accounts.map(a=>[...a]));accounts=add.accounts.length}}catch{}
  try{if(cur().packPending&&SK.company.updateMeta)SK.company.updateMeta({packPending:false})}catch{}
  return {sector:P.id,depth:P.depth,accounts,definitions:defs,tools:tools.length};
}
/* called by the first screens a new company opens (definitions, books): applies a pending pack once */
function ensureSectorPack(){try{const c=cur();if(!c.id||!c.packPending||state().sectorPack)return null;return applySectorPack()}catch{return null}}
function profile(){const c=cur(),p=state().profile||{};return Object.freeze({activity:clean(p.activity),country:clean(p.country||c.country||"SA",3).toUpperCase(),currency:clean(p.currency||c.currency||"SAR",3).toUpperCase(),framework:["IFRS","SME","EAS"].includes(p.framework)?p.framework:(clean(p.country||c.country||"SA",3).toUpperCase()==="EG"?"EAS":"IFRS"),fiscalYearStart:/^\\d{2}-\\d{2}$/.test(String(p.fiscalYearStart||""))?String(p.fiscalYearStart):"01-01",taxMode:p.taxMode==="income"?"income":"zakat",vatRegistered:typeof p.vatRegistered==="boolean"?p.vatRegistered:null,vatRate:VR()&&VR().normalizeRate(p.vatRate)!==null?VR().normalizeRate(p.vatRate):null,vatNo:clean(p.vatNo,40),crNo:clean(p.crNo,40),address:clean(p.address,240),notes:clean(p.notes,500)})}
function setProfile(input={}){
  const s=state(),p=profile(),next={...p,activity:clean(input.activity??p.activity),country:clean(input.country??p.country,3).toUpperCase(),currency:clean(input.currency??p.currency,3).toUpperCase(),framework:["IFRS","SME","EAS"].includes(input.framework??p.framework)?(input.framework??p.framework):p.framework,fiscalYearStart:/^\\d{2}-\\d{2}$/.test(String(input.fiscalYearStart??p.fiscalYearStart))?String(input.fiscalYearStart??p.fiscalYearStart):p.fiscalYearStart,taxMode:(input.taxMode??p.taxMode)==="income"?"income":"zakat",vatRegistered:"vatRegistered" in input?(typeof input.vatRegistered==="boolean"?input.vatRegistered:null):p.vatRegistered,vatRate:"vatRate" in input?(input.vatRate===null||input.vatRate===""?null:VR().normalizeRate(input.vatRate)):p.vatRate,vatNo:clean(input.vatNo??p.vatNo,40),crNo:clean(input.crNo??p.crNo,40),address:clean(input.address??p.address,240),notes:clean(input.notes??p.notes,500)};
  if(!/^[A-Z]{3}$/.test(next.currency))throw new Error("العملة يجب أن تكون رمزًا من 3 أحرف");
  if("vatRate" in input&&input.vatRate!==null&&input.vatRate!==""&&next.vatRate===null)throw new Error("نسبة الضريبة يجب أن تكون بين 0 و100%");
  if(!/^[A-Z]{2,3}$/.test(next.country))throw new Error("رمز الدولة غير صالح");
  s.profile=next;commit(s,"profile.update",{fields:Object.keys(input)});
  if(SK.company&&SK.company.updateMeta)SK.company.updateMeta({country:next.country,currency:next.currency});
  return profile();
}
function lineage(limit=100){const a=state().lineage||[];return a.slice(Math.max(0,a.length-Math.max(1,Math.min(1000,Number(limit)||100)))).map(x=>({...x}))}
function addLineage(input={},targetState=null){
  const s=targetState||state(),row={id:uid("ln"),companyId:cur().id,at:new Date().toISOString(),fromType:clean(input.fromType,60),fromId:clean(input.fromId,120),toType:clean(input.toType,60),toId:clean(input.toId,120),relation:clean(input.relation,100),sourceHash:clean(input.sourceHash,128),note:clean(input.note,500)};
  if(!row.fromType||!row.fromId||!row.toType||!row.toId||!row.relation)throw new Error("رابط التتبع غير مكتمل");
  s.lineage.push(row);if(s.lineage.length>2000)s.lineage=s.lineage.slice(-2000);
  if(!targetState)commit(s,"lineage.add",{id:row.id,relation:row.relation,fromType:row.fromType,toType:row.toType});
  return {...row};
}
function lineageFor(type,id){type=clean(type,60);id=clean(id,120);return lineage(1000).filter(x=>(x.fromType===type&&x.fromId===id)||(x.toType===type&&x.toId===id))}
function definitions(type){if(!TYPES[type])return[];return state().definitions[type].map(x=>({...x}))}
const amountMinor=v=>Math.round((Number(v)||0)*100);
const isoDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||""))?String(v):"";
function addDefinition(type,input={}){
  if(!TYPES[type])throw new Error("نوع تعريف غير معروف");
  const name=clean(input.name);if(!name)throw new Error("الاسم مطلوب");
  const s=state(),row={id:uid(type.slice(0,3)),name,code:clean(input.code,48),accountCode:clean(input.accountCode,48),costCenter:clean(input.costCenter,80),unit:clean(input.unit,40),notes:clean(input.notes,500),createdAt:new Date().toISOString()};
  for(const k of ["salePrice","purchasePrice","cost","wastePct","marginPct"])if(input[k]!==undefined&&input[k]!==""&&Number.isFinite(Number(input[k])))row[k]=Number(input[k]);
  if(type==="fixedAssets"){
    const cost=Number(input.cost),residual=Number(input.residualValue||0),life=Math.trunc(Number(input.usefulLifeMonths)),start=isoDate(input.inServiceDate||input.acquisitionDate);
    if(!Number.isFinite(cost)||cost<=0)throw new Error("تكلفة الأصل يجب أن تكون أكبر من صفر");
    if(!Number.isFinite(residual)||residual<0||residual>cost)throw new Error("القيمة التخريدية يجب أن تكون بين صفر وتكلفة الأصل");
    if(!Number.isInteger(life)||life<=0||life>1200)throw new Error("العمر الإنتاجي بالأشهر غير صالح");
    if(!start)throw new Error("تاريخ وضع الأصل في الخدمة مطلوب");
    Object.assign(row,{cost,residualValue:residual,usefulLifeMonths:life,inServiceDate:start,depreciationMethod:"straight-line",
      accumAccount:clean(input.accumAccount,48),expenseAccount:clean(input.expenseAccount,48)});
  }
  s.definitions[type].push(row);commit(s,"definition.add",{type,id:row.id});return row;
}
const monthNo=iso=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso||""));return m?(+m[1]*12+(+m[2]-1)):null};
function assetDepreciation(asset,asOf=new Date().toISOString().slice(0,10)){
  if(!asset||asset.depreciationMethod!=="straight-line")throw new Error("طريقة الإهلاك غير مدعومة");
  const start=isoDate(asset.inServiceDate),end=isoDate(asOf);if(!start||!end)throw new Error("تاريخ الإهلاك غير صالح");
  const cost=amountMinor(asset.cost),residual=amountMinor(asset.residualValue),life=Math.trunc(Number(asset.usefulLifeMonths));
  if(cost<=0||residual<0||residual>cost||life<=0)throw new Error("بيانات الأصل غير صالحة");
  const depreciable=cost-residual,startMonth=monthNo(start),endMonth=monthNo(end);
  let elapsed=end<start?0:Math.max(0,Math.min(life,endMonth-startMonth+1));
  const accumulated=elapsed>=life?depreciable:Math.round(depreciable*elapsed/life);
  const before=Math.max(0,elapsed-1),previous=before>=life?depreciable:Math.round(depreciable*before/life);
  const charge=elapsed?Math.max(0,accumulated-previous):0;
  return Object.freeze({assetId:asset.id,asOf:end,costMinor:cost,residualMinor:residual,depreciableMinor:depreciable,elapsedMonths:elapsed,
    usefulLifeMonths:life,remainingMonths:Math.max(0,life-elapsed),accumulatedMinor:accumulated,carryingMinor:cost-accumulated,
    currentMonthChargeMinor:charge,monthlyApproxMinor:life?Math.round(depreciable/life):0,complete:elapsed>=life});
}
function fixedAssetSummary(asOf=new Date().toISOString().slice(0,10)){
  return definitions("fixedAssets").map(asset=>({...asset,depreciation:assetDepreciation(asset,asOf)}));
}
function fixedAssetJournal(asOf=new Date().toISOString().slice(0,10)){
  const date=isoDate(asOf);if(!date)throw new Error("تاريخ القيد المقترح غير صالح");
  const proposals=fixedAssetSummary(date).filter(x=>x.depreciation.currentMonthChargeMinor>0).map(asset=>{
    const amountMinor=asset.depreciation.currentMonthChargeMinor,ready=!!(asset.expenseAccount&&asset.accumAccount);
    return Object.freeze({assetId:asset.id,assetName:asset.name,date,standard:"IAS 16",method:"straight-line",ready,amountMinor,
      memo:"إهلاك "+asset.name+" — "+date.slice(0,7),lines:[
        {accountCode:asset.expenseAccount||"",debitMinor:amountMinor,creditMinor:0},
        {accountCode:asset.accumAccount||"",debitMinor:0,creditMinor:amountMinor}
      ]});
  });
  return Object.freeze({date,proposals,totalMinor:proposals.reduce((a,x)=>a+x.amountMinor,0),authoritative:false,requiresHumanPosting:true});
}
function removeDefinition(type,id){
  if(!TYPES[type])return false;const s=state(),before=s.definitions[type].length;
  s.definitions[type]=s.definitions[type].filter(x=>x.id!==id);
  if(s.definitions[type].length===before)return false;commit(s,"definition.remove",{type,id});return true;
}
function installed(id){return state().installedTools.includes(id)}
function setTool(id,on){
  const cap=SK.caps&&SK.caps.get?SK.caps.get(id):null;
  /* a tool is anything the helper-tools entry offers: its own screens and the screens shared with it (suppliers, inventory, reports…) */
  if(!cap||!(SK.caps.inGatewayOf?SK.caps.inGatewayOf(cap,"tools"):cap.gateway==="tools"))throw new Error("الأداة ليست ضمن بوابة الأدوات المساعدة");
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
  const s=state(),companyId=cur().id,doc=s.documents.find(x=>x.id===id&&x.companyId===companyId);if(!doc)return false;
  await deleteDocBlob(id);s.documents=s.documents.filter(x=>!(x.id===id&&x.companyId===companyId));s.auditHandoffs=s.auditHandoffs.filter(x=>x.documentId!==id);commit(s,"document.remove",{id,sha256:doc.sha256});return true;
}
function requestAuditHandoff(id){
  const s=state(),doc=s.documents.find(x=>x.id===id&&x.companyId===cur().id);if(!doc)throw new Error("المستند غير موجود");
  let h=s.auditHandoffs.find(x=>x.documentId===id&&x.status==="pending");
  if(!h){h={id:uid("handoff"),documentId:id,status:"pending",requestedAt:new Date().toISOString(),requestedBy:"user"};s.auditHandoffs.push(h);addLineage({fromType:"document",fromId:id,toType:"audit-handoff",toId:h.id,relation:"submitted-for-audit",sourceHash:doc.sha256,note:doc.name},s)}
  commit(s,"audit.handoff.request",{documentId:id,handoffId:h.id,sha256:doc.sha256});return true;
}
function auditHandoffs(status=null){
  const s=state(),companyId=cur().id,docs=Object.fromEntries(s.documents.filter(d=>d.companyId===companyId).map(d=>[d.id,d]));
  return s.auditHandoffs.filter(h=>(!status||h.status===status)&&docs[h.documentId]).map(h=>({...h,document:{...docs[h.documentId]}}));
}
function markAuditHandoff(id,status,requestId=""){
  const allowed=new Set(["pending","attached","dismissed","received","rejected"]);if(!allowed.has(status))throw new Error("حالة التسليم غير صالحة");
  const s=state(),companyId=cur().id,h=s.auditHandoffs.find(x=>x.id===id),doc=h&&s.documents.find(d=>d.id===h.documentId&&d.companyId===companyId);if(!h||!doc)return false;
  h.status=status;h.requestId=clean(requestId,80);h.updatedAt=new Date().toISOString();
  if(status==="attached"&&h.requestId&&!s.lineage.some(x=>x.fromType==="document"&&x.fromId===h.documentId&&x.toType==="pbc-request"&&x.toId===h.requestId))addLineage({fromType:"document",fromId:h.documentId,toType:"pbc-request",toId:h.requestId,relation:"attached-to-pbc",sourceHash:doc.sha256,note:doc.name},s);
  commit(s,"audit.handoff."+status,{handoffId:id,documentId:h.documentId,requestId:h.requestId});return true;
}
function setAuditHandoffStatus(id,status){return markAuditHandoff(id,status)}
function addStandardTrace(input={}){
  const s=state(),row={id:uid("std"),at:new Date().toISOString(),operation:clean(input.operation,120),standard:clean(input.standard,80),source:clean(input.source,500),result:clean(input.result,500),provider:clean(input.provider,80),approved:input.approved===true};
  s.standardTraces.push(row);if(s.standardTraces.length>500)s.standardTraces=s.standardTraces.slice(-500);commit(s,"standard.trace",{id:row.id,standard:row.standard});return row;
}
function aiExceptions(status=null){
  const rows=state().aiExceptions||[];
  return rows.filter(x=>!status||x.status===status).map(x=>({...x,evidenceRefs:[...(x.evidenceRefs||[])]}));
}
function addAIException(input={}){
  const s=state(),allowed=new Set(["info","warning","high"]),confidence=input.confidence==null?null:Number(input.confidence);
  const source=clean(input.source||"ai",80),sourceId=clean(input.sourceId,180),title=clean(input.title||"اقتراح يحتاج مراجعة",180);
  if(!title)throw new Error("عنوان الاستثناء مطلوب");
  const key=clean(input.dedupeKey||[source,sourceId,title].join("|"),260);
  let row=s.aiExceptions.find(x=>x.status==="open"&&x.dedupeKey===key);
  const payload={source,sourceId,title,detail:clean(input.detail,2400),severity:allowed.has(input.severity)?input.severity:"warning",
    confidence:Number.isFinite(confidence)?Math.max(0,Math.min(1,confidence)):null,evidenceRefs:[...new Set((input.evidenceRefs||[]).map(x=>clean(x,120)).filter(Boolean))].slice(0,20),
    proposedAction:clean(input.proposedAction,800),provider:clean(input.provider,80),model:clean(input.model,120),authoritative:false,requiresHumanDecision:true};
  if(row){Object.assign(row,payload,{updatedAt:new Date().toISOString()})}
  else{row={id:uid("aix"),companyId:cur().id,at:new Date().toISOString(),updatedAt:new Date().toISOString(),status:"open",humanNote:"",dedupeKey:key,...payload};s.aiExceptions.push(row)}
  if(s.aiExceptions.length>500)s.aiExceptions=s.aiExceptions.slice(-500);
  commit(s,"ai-exception.upsert",{id:row.id,source:row.source,severity:row.severity,status:row.status});
  return {...row,evidenceRefs:[...(row.evidenceRefs||[])]};
}
function resolveAIException(id,status,note=""){
  const allowed=new Set(["open","accepted","rejected","dismissed"]);if(!allowed.has(status))throw new Error("حالة الاستثناء غير صالحة");
  const s=state(),row=s.aiExceptions.find(x=>x.id===id&&x.companyId===cur().id);if(!row)return false;
  row.status=status;row.humanNote=clean(note,1000);row.updatedAt=new Date().toISOString();row.humanDecidedAt=status==="open"?null:new Date().toISOString();
  commit(s,"ai-exception."+status,{id:row.id,source:row.source});
  return true;
}
function saveReportResult(tb,fs,sourceName="",suggestedMeasures=[],sourceDocumentId=""){
  const s=state(),reportRunId=uid("report"),at=new Date().toISOString();s.reporting.lastTrialBalance={reportRunId,at,sourceName:clean(sourceName,180),sourceDocumentId:clean(sourceDocumentId,120),rows:tb.rows.length,balanced:!!tb.balanced,errors:tb.errors.length,unclassified:tb.unclassified,difference:String(tb.difference)};
  s.reporting.lastStatements={reportRunId,at,mappedPct:fs.checks.mappedPct,balanced:fs.checks.balanced,cashTies:fs.checks.cashTies,unmapped:fs.unmapped.length,keys:Object.fromEntries(Object.entries(fs.keys).map(([k,v])=>[k,{current:String(v.current),prior:v.prior==null?null:String(v.prior)}]))};
  if(sourceDocumentId){const doc=s.documents.find(d=>d.id===sourceDocumentId&&d.companyId===cur().id);if(doc)addLineage({fromType:"document",fromId:doc.id,toType:"report-run",toId:reportRunId,relation:"generated-financial-statements",sourceHash:doc.sha256,note:doc.name},s)}
  s.reporting.suggestedMeasures=(Array.isArray(suggestedMeasures)?suggestedMeasures:[]).slice(0,20).map(m=>({key:clean(m.key,60),name:clean(m.ar||m.name,120),value:String(m.value??0),prior:m.prior==null?null:String(m.prior),note:clean(m.note,600),
    ifrs18Candidate:m.key==="ebitda",nearestSubtotal:m.key==="ebitda"?"operating":"",rows:(m.rows||[]).slice(0,20).map(r=>({label:clean(r.ar||r.label,160),amount:String(r.amount??0)}))}));
  commit(s,"reporting.generated",{sourceName,rows:tb.rows.length,mappedPct:fs.checks.mappedPct,suggestedMeasures:s.reporting.suggestedMeasures.length});return s.reporting;
}
const MPM_SUBTOTALS=Object.freeze({operating:"الربح التشغيلي",pbfz:"الربح قبل التمويل والزكاة/الضريبة",pbz:"الربح قبل الزكاة/الضريبة",profit:"صافي ربح/خسارة الفترة"});
function mpms(){return state().mpms.map(x=>({...x}))}
function registerMpm(input={}){
  const s=state(),name=clean(input.name,120),sourceKey=clean(input.sourceKey,60),nearestSubtotal=clean(input.nearestSubtotal,40),purpose=clean(input.purpose,600),communicationSource=clean(input.communicationSource,300);
  if(!name)throw new Error("اسم مقياس الأداء مطلوب");
  if(!Object.hasOwn(MPM_SUBTOTALS,nearestSubtotal))throw new Error("اختر أقرب مجموع IFRS للمطابقة");
  if(!purpose)throw new Error("سبب استخدام المقياس مطلوب");
  if(!communicationSource)throw new Error("حدد أين تستخدم الإدارة المقياس في الاتصالات العامة");
  const existing=s.mpms.find(x=>sourceKey&&x.sourceKey===sourceKey);
  if(existing)throw new Error("هذا المقياس مسجل بالفعل");
  const row={id:uid("mpm"),name,sourceKey,nearestSubtotal,purpose,communicationSource,method:clean(input.method||"مشتق من بيانات القوائم",300),approved:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  s.mpms.push(row);const reportRunId=s.reporting.lastStatements?.reportRunId;if(reportRunId)addLineage({fromType:"report-run",fromId:reportRunId,toType:"mpm",toId:row.id,relation:"supports-ifrs18-mpm",note:row.name},s);commit(s,"ifrs18.mpm.register",{id:row.id,sourceKey,nearestSubtotal});return {...row};
}
function removeMpm(id){
  const s=state(),before=s.mpms.length;s.mpms=s.mpms.filter(x=>x.id!==id);if(s.mpms.length===before)return false;commit(s,"ifrs18.mpm.remove",{id});return true;
}
function approveMpm(id,approved=true){
  const s=state(),row=s.mpms.find(x=>x.id===id);if(!row)return false;row.approved=approved===true;row.updatedAt=new Date().toISOString();
  commit(s,"ifrs18.mpm.approval",{id,approved:row.approved});addStandardTrace({operation:"ifrs18-mpm-review",standard:"IFRS 18",source:row.communicationSource,result:(row.approved?"approved: ":"draft: ")+row.name,approved:row.approved});return true;
}
function mpmReconciliation(id){
  const s=state(),row=s.mpms.find(x=>x.id===id);if(!row)return null;
  const measure=(s.reporting.suggestedMeasures||[]).find(x=>x.key===row.sourceKey),subtotal=s.reporting.lastStatements?.keys?.[row.nearestSubtotal]||null;
  const value=measure?BigInt(measure.value):null,nearest=subtotal?BigInt(subtotal.current):null;
  return{mpm:{...row},measure:measure?{...measure}:null,nearestLabel:MPM_SUBTOTALS[row.nearestSubtotal],nearestValue:nearest==null?null:String(nearest),difference:value==null||nearest==null?null:String(value-nearest),
    complete:!!(measure&&subtotal&&row.purpose&&row.communicationSource),humanApproved:row.approved===true};
}
function reportingStatus(){
  const s=state(),target=REPORT_TARGETS[s.reporting.target]||REPORT_TARGETS.full,types=new Set(documents().map(d=>d.type));
  if((s.definitions.fixedAssets||[]).length)types.add("fixed-assets-register");
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
  if(/ai|ذكاء|تنبيه|استثناء|اقتراح|خطا|خطأ|مراجعه|مراجعة/.test(q)){
    for(const x of aiExceptions("open").slice(-10).reverse())hits.unshift({kind:"ai-exception",id:x.id,title:x.title,detail:[x.severity,x.source,x.proposedAction].filter(Boolean).join(" · ")});
  }
  const limited=hits.slice(0,20),text=limited.length?("نتائج داخل «"+c.name+"»:\n"+limited.map(x=>"• "+x.title+(x.detail?" — "+x.detail:"")).join("\n")):"لم أجد نتيجة مطابقة داخل بيانات الشركة الحالية.";
  return{text,matches:limited};
}
window.SKosifCompanyPlatform=Object.freeze({key:KEY,types:()=>TYPES,reportTargets:()=>REPORT_TARGETS,state,profile,setProfile,vatPolicy,sectorPack,applySectorPack,ensureSectorPack,definitions,addDefinition,removeDefinition,assetDepreciation,fixedAssetSummary,fixedAssetJournal,installed,setTool,reportingTarget,reportingStatus,mpms,registerMpm,removeMpm,approveMpm,mpmReconciliation,mpmSubtotals:()=>MPM_SUBTOTALS,lineage,lineageFor,addLineage,inferType,ingestFiles,documents,readDocument,setDocumentType,removeDocument,requestAuditHandoff,auditHandoffs,markAuditHandoff,setAuditHandoffStatus,addStandardTrace,aiExceptions,addAIException,resolveAIException,saveReportResult,search:searchCompany});
})();
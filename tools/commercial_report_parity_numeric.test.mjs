import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildCommercialReport,serializeCommercialReportCsv} from '../app/src/engine/fusion/reports/commercial-report-parity.mjs';

const scope={companyId:'company-A',workspaceId:'workspace-A',vatRate:.15};
const raw={companyId:'company-A',workspaceId:'workspace-A',kind:'raw',
  code:'R-01',name:'Raw meat',category:'meat',sellingGross:'230.00',costNet:'111.11'};
const box={companyId:'company-A',workspaceId:'workspace-A',kind:'box',
  code:'B-01',name:'Package',category:'boxes',sellingGross:'299.00',costNet:'160.00',
  components:[{type:'raw',itemId:'r1',quantity:1.4}],dishesCount:2,totalWeightKg:1.4,
  breakdown:{componentsCostNet:'140.00',packagingCostNet:'10.00',expensesCostNet:'10.00'}};
const inactive={...raw,code:'R-X',archived:true,sellingGross:'900.00'};
const orders=[{companyId:'company-A',workspaceId:'workspace-A',orderNumber:'ORDER-1',
  totalGross:'230.00',paidTotal:'100.00',remainingTotal:'130.00',settlementVerified:true},
 {companyId:'company-A',workspaceId:'workspace-A',orderNumber:'ORDER-2',
  totalGross:'299.00',paidTotal:'299.00',remainingTotal:'0.00',settlementVerified:true}];
const report=(type,options={})=>buildCommercialReport({type,scope,...options});

test('catalog_margins excludes archive and reconciles VAT-inclusive sale to net profit in halalas',()=>{
 const model=report('catalog_margins',{catalog:[box,inactive,raw]});
 assert.equal(model.rows.length,2);
 assert.deepEqual(model.rows.map(x=>x.code),['B-01','R-01']);
 assert.deepEqual(model.rows.map(x=>[x.sellingGross,x.sellingNet,x.costNet,x.profitNet]),
   [['299.00','260.00','160.00','100.00'],['230.00','200.00','111.11','88.89']]);
 assert.equal(model.rows[1].marginPercent,'44.4450%');
 assert.equal(model.rows[0].marginPercent,'38.4615%');
 assert.equal(model.approvalStatus,'not-authorized-for-issuance');
});
test('box_engineering breakdown reconciles exactly and does not silently infer missing number of dishes or weight',()=>{
 const model=report('box_engineering',{catalog:[box,raw]});
 assert.equal(model.rows.length,1);
 assert.equal(model.rows[0].dishesCount,2);
 assert.equal(model.rows[0].componentCount,1);
 assert.equal(model.rows[0].totalWeightKg,1.4);
 assert.deepEqual(model.rows[0].breakdown,{
  componentsCostNet:'140.00',packagingCostNet:'10.00',expensesCostNet:'10.00'});
 assert.throws(()=>report('box_engineering',{catalog:[{...box,breakdown:{...box.breakdown,expensesCostNet:'9.99'}}]}),/BOX_COST_RECONCILIATION_FAILED/);
 assert.throws(()=>report('box_engineering',{catalog:[{...box,dishesCount:undefined}]}),/BOX_QUANTITIES_INVALID/);
 assert.throws(()=>report('box_engineering',{catalog:[{...box,breakdown:undefined}]}),/BOX_BREAKDOWN_REQUIRED/);
});
test('price_list uses company-configured VAT rate, excludes archived and never assumes 15%',()=>{
 const result=report('price_list',{catalog:[raw,box,inactive]});
 assert.equal(result.rows.length,2);
 assert.equal(result.rows[0].priceBasis,'gross-including-company-configured-vat');
 assert.equal(result.rows[1].sellingGross,'230.00');
 assert.equal(result.vatRate,.15);
 const zero=buildCommercialReport({type:'catalog_margins',scope:{...scope,vatRate:0},catalog:[raw]});
 assert.equal(zero.rows[0].sellingNet,'230.00');
 assert.equal(zero.rows[0].profitNet,'118.89');
 const twenty=buildCommercialReport({type:'catalog_margins',scope:{...scope,vatRate:.2},catalog:[{...raw,sellingGross:'240.00'}]});
 assert.equal(twenty.rows[0].sellingNet,'200.00');
 assert.equal(twenty.vatRate,.2);
 assert.throws(()=>buildCommercialReport({type:'price_list',scope:{companyId:'company-A',workspaceId:'workspace-A'},catalog:[raw]}),/COMPANY_VAT_RATE_REQUIRED/);
});
test('sales_collections distinguishes invoices, paid settlements, outstanding amounts and partial status',()=>{
 const out=report('sales_collections',{orders});
 assert.deepEqual(out.totals,{invoiced:'529.00',collected:'399.00',outstanding:'130.00'});
 assert.deepEqual(out.rows.map(x=>x.status),['partial','paid']);
 assert.equal(out.rows[0].remainingTotal,'130.00');
 assert.throws(()=>report('sales_collections',{orders:[{...orders[0],paidTotal:'230.01'}]}),/ORDER_OVERPAYMENT_REQUIRES_CREDIT_LEDGER/);
 assert.throws(()=>report('sales_collections',{orders:[{...orders[0],remainingTotal:'130.01'}]}),/ORDER_RECONCILIATION_FAILED/);
 assert.throws(()=>report('sales_collections',{orders:[{...orders[0],settlementVerified:false}]}),/SETTLEMENT_NOT_VERIFIED/);
});
test('company and workspace isolation rejects mixed rows, unknown ownership, unsupported reports, and invalid source decimals',()=>{
 const alt={...raw,companyId:'company-B'};
 assert.throws(()=>report('catalog_margins',{catalog:[raw,alt]}),/REPORT_ROW_OWNER_MISMATCH/);
 assert.throws(()=>report('catalog_margins',{catalog:[{...raw,companyId:undefined}]}),/REPORT_ROW_OWNER_MISMATCH/);
 assert.throws(()=>report('price_list',{catalog:[{...raw,workspaceId:'workspace-B'}]}),/REPORT_ROW_WORKSPACE_MISMATCH/);
 assert.throws(()=>report('price_list',{catalog:[{...raw,workspaceId:undefined}]}),/REPORT_ROW_WORKSPACE_MISMATCH/);
 assert.throws(()=>report('price_list',{catalog:[{...raw,sellingGross:'1.234'}]}),/SELLING_GROSS_AMOUNT_INVALID/);
 assert.throws(()=>report('catalog_margins',{catalog:[raw,{...raw}]}),/DUPLICATE_CATALOG_CODE/);
 assert.throws(()=>report('nonsense',{catalog:[raw]}),/REPORT_TYPE_UNSUPPORTED/);
 assert.throws(()=>report('sales_collections',{orders:[...orders,orders[0]]}),/DUPLICATE_ORDER_NUMBER/);
 assert.throws(()=>report('sales_collections',{orders:[{...orders[0],companyId:'company-B'}]}),/REPORT_ROW_OWNER_MISMATCH/);
 assert.throws(()=>report('price_list',{catalog:[raw,{...raw,code:'r-01'}]}),/DUPLICATE_CATALOG_CODE/);
 assert.throws(()=>report('price_list',{catalog:[{...raw,costNet:'99999999999999999999.00'}]}),/COST_NET_TOO_LARGE/);
 assert.throws(()=>report('price_list',{catalog:[{...raw,sellingGross:'-1.00'}]}),/SELLING_GROSS_AMOUNT_INVALID/);
 assert.throws(()=>buildCommercialReport({type:'price_list',scope:{...scope,vatRate:.15555},catalog:[raw]}),/COMPANY_VAT_PRECISION_UNSUPPORTED/);
});
test('monetary oracle matches canonical pricing engine to the halala; no copied legacy VAT formula',()=>{
 const source=fs.readFileSync(new URL('../ui/features/pricing-core.js',import.meta.url),'utf8');
 const browser={};vm.runInNewContext(source,{window:browser,console});
 const core=browser.SKosifPricingCore;
 const settings={defaultVatRate:.15,wasteMethod:'yield',marginMode:'net',
  roundingPolicy:'two_decimals',marginThresholds:{excellent:.25,good:.15}};
 const costedRaw=core.calculateRawPricing({
   id:'r1',name:'Raw meat',purchasePrice:100,isVatInclusive:false,
   wastePercent:.1,unit:'kg',sellingPriceNet:200
 },settings);
 assert.ok(Math.abs(costedRaw.totalCostNet-111.1111)<.0002);
 const rawReport=report('catalog_margins',{catalog:[raw]});
 assert.ok(Math.abs(+rawReport.rows[0].profitNet-costedRaw.profitNet)<.011);
 assert.ok(Math.abs(parseFloat(rawReport.rows[0].marginPercent)/100-costedRaw.marginPercent)<.0001);
 const r1={id:'r1',name:'Raw',purchasePrice:100,isVatInclusive:false,wastePercent:0,unit:'kg'};
 const b1={id:'b1',name:'Package',components:[{type:'raw',itemId:'r1',quantity:1.4,applyWaste:false}],
  packaging:[{count:2,unitCostNet:5}],
  linkedExpenses:[{method:'fixed',value:10,isVatInclusive:false}],sellingPriceNet:260};
 const pricedBox=core.calculateBoxPricing(b1,[r1],[b1],settings);
 assert.equal(pricedBox.totalCostNet,160);
 assert.equal(pricedBox.sellingPriceGross,299);
 const boxReport=report('box_engineering',{catalog:[box]});
 assert.equal(+boxReport.rows[0].profitNet,pricedBox.profitNet);
 assert.equal(+boxReport.rows[0].sellingGross,pricedBox.sellingPriceGross);
});

test('four draft CSV exports preserve scope, avoid formula injection and cannot claim approval',()=>{
 for(const type of ['catalog_margins','box_engineering','price_list','sales_collections']){
   const settings={catalog:[raw,box],orders};
   const report=reportFn(type,settings);
   const output=serializeCommercialReportCsv(report);
   assert.ok(output.startsWith('\uFEFF'));
   assert.match(output,/company-A/);
   assert.match(output,/workspace-A/);
   assert.match(output,/not-authorized-for-issuance/);
   assert.match(output,/kosif-commercial-report-parity-v1/);
   assert.doesNotMatch(output,/server-attested|audit-issued|PRIVATE_DOCUMENT/);
 }
 const hostile=buildCommercialReport({type:'price_list',scope,catalog:[{...raw,name:'\u200f=HYPERLINK("http://bad.test")'}]});
 const csv=serializeCommercialReportCsv(hostile);
 assert.match(csv,/\"'\u200f=HYPERLINK\(\"\"http:\/\/bad.test\"\"\)\"/);
 assert.throws(()=>serializeCommercialReportCsv({...hostile,approvalStatus:'approved'}),/COMMERCIAL_CSV_APPROVAL_STATUS_INVALID/);
 assert.throws(()=>serializeCommercialReportCsv({}),/COMMERCIAL_CSV_SCHEMA_INVALID/);
});
function reportFn(type,settings){return report(type,settings)}

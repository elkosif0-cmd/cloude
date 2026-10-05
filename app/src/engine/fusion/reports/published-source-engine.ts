import { reviewedVolkswagenSource } from './volkswagen-source-engine';
import { reviewedMercedesSource } from './mercedes-source-engine';
import { reviewedHomeDepotSource } from './home-depot-source-engine';
import { reviewedMcDonaldsSource } from './published-mcdonalds-source-engine';
import { procterGambleSource } from './sources/procter-gamble-source';
/* Reviewed published-statement adapter. These are statement observations, not ledger
   records or audit evidence. The test oracle is independent and is never imported here.
   Apple 2024 Form 10-K, original verified bundle pp. 125, 127, 144–146. */
export const SOURCE_MARKER = '# SQC source-only: ';
type SourceRow = readonly [code: string, label: string, line: string, debitPositive: boolean, current: number, prior: number, factId: string, page: number];
const APPLE_ROWS: readonly SourceRow[] = [
  ['11101','النقد وما في حكمه — Cash and cash equivalents','cash',true,29943,29965,'cash',127],
  ['11901','أوراق مالية قابلة للتداول متداولة — Marketable securities (current)','currentSecurities',true,35228,31590,'securities_current',127],
  ['11201','ذمم تجارية مدينة بالصافي — Accounts receivable net','receivables',true,33410,29508,'trade_receivables',127],
  ['11202','ذمم موردين غير تجارية — Vendor non-trade receivables','vendorReceivables',true,32833,31477,'vendor_receivables',127],
  ['11401','المخزون — Inventories','inventory',true,7286,6331,'inventory',127],
  ['11601','موجودات متداولة أخرى — Other current assets','otherCa',true,14287,14695,'other_current_assets',127],
  ['18001','أوراق مالية قابلة للتداول غير متداولة — Marketable securities (non-current)','investments',true,91479,100544,'securities_noncurrent',127],
  ['15001','ممتلكات وآلات ومعدات بالصافي — Property plant and equipment net','ppe',true,45680,43715,'ppe',127],
  ['19001','موجودات غير متداولة أخرى — Other non-current assets','otherNca',true,74834,64758,'other_noncurrent_assets',127],
  ['20101','الذمم الدائنة — Accounts payable','payables',false,68960,62611,'payables',127],
  ['20201','مطلوبات متداولة أخرى — Other current liabilities','otherCl',false,78304,58829,'other_current_liabilities',127],
  ['20301','إيرادات مؤجلة متداولة — Deferred revenue','contractLiab',false,8249,8061,'deferred_revenue_current',127],
  ['20701','أوراق تجارية — Commercial paper','loansCl',false,9967,5985,'commercial_paper',127],
  ['20702','دين لأجل متداول — Term debt (current)','loansCl',false,10912,9822,'term_debt_current',127],
  ['22201','دين لأجل غير متداول — Term debt (non-current)','loansNcl',false,85750,95281,'term_debt_noncurrent',127],
  ['22202','مطلوبات غير متداولة أخرى — Other non-current liabilities','otherNcl',false,45888,49848,'other_noncurrent_liabilities',127],
  ['31001','أسهم عادية ورأس مال إضافي مدفوع — Common stock and additional paid-in capital','capital',false,83276,73812,'common_stock_apic',127],
  // The existing statement engine adds current profit to equity. Remove that same
  // source profit here; this is a reversible presentation bridge, not an opening ledger.
  ['33001','العجز المتراكم بعد استبعاد ربح الفترة لأغراض العرض — Presentation bridge only','retained',false,-19154-93736,-214-96995,'accumulated_deficit-minus-net_income',127],
  ['32001','الخسارة الشاملة الأخرى المتراكمة — Accumulated other comprehensive loss','reserves',false,-7172,-11452,'accumulated_oci',127],
  ['41001','صافي مبيعات المنتجات — Products net sales','revenue',false,294866,298085,'revenue_products',125],
  ['41002','صافي مبيعات الخدمات — Services net sales','revenue',false,96169,85200,'revenue_services',125],
  ['51001','تكلفة مبيعات المنتجات — Products cost of sales','cogs',true,185233,189282,'cogs_products',125],
  ['51002','تكلفة مبيعات الخدمات — Services cost of sales','cogs',true,25119,24855,'cogs_services',125],
  ['53001','البحث والتطوير — Research and development','researchDevelopment',true,31370,29915,'research',125],
  ['52001','مصروفات البيع والعمومية والإدارية مجمعة — Selling general and administrative','sellingGeneralAdmin',true,26097,24932,'sga',125],
  ['48001','دخل أو مصروف آخر غير تشغيلي بالصافي — Other income/(expense) net','nonOperatingIncome',false,269,-565,'other_income',125],
  ['81001','مخصص ضريبة الدخل — Provision for income taxes','zakatExpense',true,29749,16741,'income_tax',125],
];
/** A fresh value per caller prevents one open file from relabelling another. */
export function reviewedPublishedSource(id: string) {
  if (id !== 'apple-2024') return procterGambleSource(id) ?? reviewedHomeDepotSource(id) ?? reviewedMcDonaldsSource(id) ?? reviewedMercedesSource(id) ?? reviewedVolkswagenSource(id);
  const signed = (r: SourceRow, i: 4 | 5) => r[3] ? r[i] : -r[i];
  const csv = [SOURCE_MARKER + id, 'رقم الحساب,اسم الحساب,مدين,دائن,السنة السابقة', ...APPLE_ROWS.map(r => {
    const current = signed(r,4); return [r[0],r[1],current > 0 ? current : '',current < 0 ? -current : '',signed(r,5)].join(',');
  })].join('\n');
  const sourceModel = {
    kind: 'published-statements' as const, id, issuer: 'Apple Inc.', issuerCountry: 'US', report: '2024 Form 10-K',
    accountingBasis: 'US_GAAP', currency: 'USD', unit: 'million', scope: 'consolidated',
    entities: 'Apple Inc. and wholly owned subsidiaries', periodEnd: '2024-09-28', priorPeriodEnd: '2023-09-30',
    sourceFile: 'global_financial_and_audit_research_bundle_extended_verified.pdf',
    sourceSha256: '8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802', sourcePages: [125,127],
    facts: APPLE_ROWS.map(r => ({id:r[6],line:r[2],code:r[0],label:r[1],current:r[4],prior:r[5],sourcePage:r[7],
      status:r[6].includes('-minus-') ? 'derived-presentation' : 'reported'})),
    auditorReference: {name:'Ernst & Young LLP',opinion:'unqualified',date:'2024-11-01',pages:[144,145,146],
      scope:'Original Apple consolidated financial statements; attributed source reference only'},
    cashFlow: {status:'unavailable',reason:'source-cash-flow-not-imported',sourcePage:129},
  };
  return {csv,overrides:Object.fromEntries(APPLE_ROWS.map(r=>[r[0],r[2]])),sourceModel};
}

const REVIEWED_SOURCE_IDS = ['apple-2024','pg-2026','homedepot-2025','mcdonalds-2022','mercedes-2025','volkswagen-2025'] as const;
let reviewedCarrierIds:Map<string,string>|undefined;
/** Lost transport markers never convert a known source carrier into a real ledger. */
export function identifyReviewedSourceTransport(text:string):string|null{
 if(!reviewedCarrierIds){reviewedCarrierIds=new Map();for(const id of REVIEWED_SOURCE_IDS){const source=reviewedPublishedSource(id);if(source){reviewedCarrierIds.set(source.csv.trim(),id);reviewedCarrierIds.set(source.csv.split('\n').filter(line=>!line.startsWith(SOURCE_MARKER)).join('\n').trim(),id);}}}
 return reviewedCarrierIds.get(text.replace(/^﻿/,'').replace(/\r\n/g,'\n').trim())??null;
}

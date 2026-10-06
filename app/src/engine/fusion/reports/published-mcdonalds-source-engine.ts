/* Reviewed McDonald’s FY2022 published observations. Not ledger records or audit evidence.
   Oracle is frozen independently in acceptance fixtures and is never imported here. */
import { MCDONALDS_REVIEWED_DATA } from './source-data/mcdonalds-2022';
export const MCDONALDS_SOURCE_ID = 'mcdonalds-2022';
const SOURCE_MARKER = '# SQC source-only: ';
type DataRow = {label:string;values:Record<string,string|null>;unit?:string;source_display?:Record<string,string>;normalization?:string;comparative_status?:string};
type DataTable = {source_physical_page:number;columns:string[];unit:string;rows:Record<string,DataRow>};
type Claim = Record<string,unknown> & {fact_id:string;value:string|null;temporal_kind:string;observation_date?:string;period_start?:string;period_end?:string};
type ReplayPeriod={kind:'duration'|'instant';start?:string;end:string};
function factPeriod(f:Claim):ReplayPeriod {
 if(f.temporal_kind==='instant'&&typeof f.observation_date==='string')return {kind:'instant',end:f.observation_date};
 if(f.temporal_kind==='duration'&&typeof f.period_start==='string'&&typeof f.period_end==='string')return {kind:'duration',start:f.period_start,end:f.period_end};
 throw new Error('Unsupported primary observation period '+f.fact_id);
}
const DATA = MCDONALDS_REVIEWED_DATA;
const TABLES = DATA.tables as unknown as Record<string,DataTable>;
const clone = <T>(value:T):T => structuredClone(value);
const ROWS = [
  {
    "code": "11101",
    "label": "Cash and equivalents",
    "line": "cash",
    "debitPositive": true,
    "current": 2583.8,
    "prior": 4709.2,
    "id": "balance_sheet.cash",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "11201",
    "label": "Accounts and notes receivable",
    "line": "mcdAccountsNotesReceivable",
    "debitPositive": true,
    "current": 2115.0,
    "prior": 1872.4,
    "id": "balance_sheet.receivables",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "11401",
    "label": "Inventories at cost not in excess of market",
    "line": "inventory",
    "debitPositive": true,
    "current": 52.0,
    "prior": 55.6,
    "id": "balance_sheet.inventory",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "11601",
    "label": "Prepaid expenses and other current assets",
    "line": "mcdPrepaidsOtherCurrent",
    "debitPositive": true,
    "current": 673.4,
    "prior": 511.3,
    "id": "balance_sheet.prepaids_other_current",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "18001",
    "label": "Investments in and advances to affiliates",
    "line": "mcdAffiliates",
    "debitPositive": true,
    "current": 1064.5,
    "prior": 1201.2,
    "id": "balance_sheet.affiliates",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "18002",
    "label": "Goodwill",
    "line": "mcdGoodwill",
    "debitPositive": true,
    "current": 2900.4,
    "prior": 2782.5,
    "id": "balance_sheet.goodwill",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "19001",
    "label": "Miscellaneous other assets",
    "line": "mcdMiscellaneousAssets",
    "debitPositive": true,
    "current": 4707.2,
    "prior": 4449.5,
    "id": "balance_sheet.other_misc_assets",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "18003",
    "label": "Lease right-of-use asset net",
    "line": "rou",
    "debitPositive": true,
    "current": 12565.7,
    "prior": 13552.0,
    "id": "balance_sheet.rou_asset",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "15001",
    "label": "Property and equipment at cost",
    "line": "ppe",
    "debitPositive": true,
    "current": 41037.6,
    "prior": 41916.6,
    "id": "balance_sheet.ppe_gross",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "15002",
    "label": "Accumulated depreciation and amortization",
    "line": "ppe",
    "debitPositive": true,
    "current": -17264.0,
    "prior": -17196.0,
    "id": "balance_sheet.ppe_accumulated",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "20101",
    "label": "Accounts payable",
    "line": "payables",
    "debitPositive": false,
    "current": 980.2,
    "prior": 1006.8,
    "id": "balance_sheet.accounts_payable",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "20501",
    "label": "Current lease liability",
    "line": "mcdCurrentLease",
    "debitPositive": false,
    "current": 661.1,
    "prior": 705.5,
    "id": "balance_sheet.lease_current",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "20502",
    "label": "Current income taxes",
    "line": "mcdCurrentIncomeTax",
    "debitPositive": false,
    "current": 274.9,
    "prior": 360.7,
    "id": "balance_sheet.income_tax_current",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "20503",
    "label": "Other taxes",
    "line": "mcdCurrentOtherTax",
    "debitPositive": false,
    "current": 255.1,
    "prior": 236.7,
    "id": "balance_sheet.other_tax_current",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "20504",
    "label": "Accrued interest",
    "line": "mcdAccruedInterest",
    "debitPositive": false,
    "current": 393.4,
    "prior": 363.3,
    "id": "balance_sheet.interest_current",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "20505",
    "label": "Accrued payroll and other liabilities",
    "line": "mcdPayrollOtherLiabilities",
    "debitPositive": false,
    "current": 1237.4,
    "prior": 1347.0,
    "id": "balance_sheet.payroll_other_current",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "22101",
    "label": "Long-term debt",
    "line": "loansNcl",
    "debitPositive": false,
    "current": 35903.5,
    "prior": 35622.7,
    "id": "balance_sheet.debt_long_term",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "22102",
    "label": "Long-term lease liability",
    "line": "leaseNcl",
    "debitPositive": false,
    "current": 12134.4,
    "prior": 13020.9,
    "id": "balance_sheet.lease_long_term",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "22201",
    "label": "Long-term income taxes",
    "line": "mcdLongTermIncomeTax",
    "debitPositive": false,
    "current": 791.9,
    "prior": 1896.8,
    "id": "balance_sheet.income_tax_long_term",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "22202",
    "label": "Deferred revenues initial franchise fees",
    "line": "mcdDeferredFranchiseFees",
    "debitPositive": false,
    "current": 757.8,
    "prior": 738.3,
    "id": "balance_sheet.franchise_deferred_revenue",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "22203",
    "label": "Other long-term liabilities",
    "line": "otherNcl",
    "debitPositive": false,
    "current": 1051.8,
    "prior": 1081.0,
    "id": "balance_sheet.other_long_term_liabilities",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "22204",
    "label": "Deferred income taxes",
    "line": "mcdDeferredIncomeTax",
    "debitPositive": false,
    "current": 1997.5,
    "prior": 2075.6,
    "id": "balance_sheet.deferred_income_taxes",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "31001",
    "label": "Preferred stock none issued",
    "line": "mcdPreferredStock",
    "debitPositive": false,
    "current": 0.0,
    "prior": 0.0,
    "id": "balance_sheet.preferred_stock",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "31002",
    "label": "Common stock",
    "line": "mcdCommonStock",
    "debitPositive": false,
    "current": 16.6,
    "prior": 16.6,
    "id": "balance_sheet.common_stock",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "31003",
    "label": "Additional paid-in capital",
    "line": "mcdAdditionalPaidInCapital",
    "debitPositive": false,
    "current": 8547.1,
    "prior": 8231.6,
    "id": "balance_sheet.paid_in_capital",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "33001",
    "label": "Retained earnings",
    "line": "retained",
    "debitPositive": false,
    "current": 59543.9,
    "prior": 57534.7,
    "id": "balance_sheet.retained_earnings",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "32001",
    "label": "Accumulated other comprehensive income loss",
    "line": "mcdAccumulatedOCI",
    "debitPositive": false,
    "current": -2486.6,
    "prior": -2573.7,
    "id": "balance_sheet.aoci",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "32002",
    "label": "Common stock in treasury at cost",
    "line": "mcdTreasuryStock",
    "debitPositive": false,
    "current": -71624.4,
    "prior": -67810.2,
    "id": "balance_sheet.treasury_stock",
    "sourcePage": 2174,
    "status": "reported"
  },
  {
    "code": "41001",
    "label": "company restaurant sales",
    "line": "revenue",
    "debitPositive": false,
    "current": 8748.4,
    "prior": 9787.4,
    "id": "income_statement.company_restaurant_sales",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "41002",
    "label": "franchise revenue",
    "line": "revenue",
    "debitPositive": false,
    "current": 14105.8,
    "prior": 13085.4,
    "id": "income_statement.franchise_revenue",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "41003",
    "label": "other revenue",
    "line": "revenue",
    "debitPositive": false,
    "current": 328.4,
    "prior": 350.1,
    "id": "income_statement.other_revenue",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53001",
    "label": "food and paper",
    "line": "mcdFoodAndPaper",
    "debitPositive": true,
    "current": 2737.3,
    "prior": 3096.8,
    "id": "income_statement.food_and_paper",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53002",
    "label": "payroll and benefits",
    "line": "mcdPayrollAndBenefits",
    "debitPositive": true,
    "current": 2617.4,
    "prior": 2677.2,
    "id": "income_statement.payroll_and_benefits",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53003",
    "label": "company occupancy other",
    "line": "mcdCompanyOccupancyOther",
    "debitPositive": true,
    "current": 2026.2,
    "prior": 2273.3,
    "id": "income_statement.company_occupancy_other",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53004",
    "label": "franchise occupancy",
    "line": "mcdFranchiseOccupancy",
    "debitPositive": true,
    "current": 2349.7,
    "prior": 2335.0,
    "id": "income_statement.franchise_occupancy",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53005",
    "label": "other restaurant",
    "line": "mcdOtherRestaurant",
    "debitPositive": true,
    "current": 244.8,
    "prior": 260.4,
    "id": "income_statement.other_restaurant",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53006",
    "label": "sga depreciation",
    "line": "mcdSgaDepreciation",
    "debitPositive": true,
    "current": 370.4,
    "prior": 329.7,
    "id": "income_statement.sga_depreciation",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53007",
    "label": "sga other",
    "line": "mcdSgaOther",
    "debitPositive": true,
    "current": 2492.2,
    "prior": 2377.8,
    "id": "income_statement.sga_other",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "53008",
    "label": "other operating expense income",
    "line": "mcdOtherOperatingExpenseIncome",
    "debitPositive": true,
    "current": 973.6,
    "prior": -483.3,
    "id": "income_statement.other_operating_expense_income",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "71001",
    "label": "interest expense net capitalized",
    "line": "mcdInterestExpense",
    "debitPositive": true,
    "current": 1207.0,
    "prior": 1185.8,
    "id": "income_statement.interest_expense_net_capitalized",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "71002",
    "label": "other nonoperating expense income",
    "line": "mcdOtherNonOperatingExpense",
    "debitPositive": true,
    "current": 338.6,
    "prior": 42.3,
    "id": "income_statement.other_nonoperating_expense_income",
    "sourcePage": 2172,
    "status": "reported"
  },
  {
    "code": "81001",
    "label": "income tax",
    "line": "zakatExpense",
    "debitPositive": true,
    "current": 1648.0,
    "prior": 1582.7,
    "id": "income_statement.income_tax",
    "sourcePage": 2172,
    "status": "reported"
  }
];

function jsonDomain(value:unknown,active=new Set<object>(),depth=0):boolean {
 if(depth>64)return false;
 if(value===null||typeof value==='string'||typeof value==='boolean')return true;
 if(typeof value==='number')return Number.isFinite(value);
 if(!value||typeof value!=='object'||active.has(value))return false;
 const prototype=Object.getPrototypeOf(value);
 if(!Array.isArray(value)&&prototype!==null&&Object.getPrototypeOf(prototype)!==null)return false;
 if(!Array.isArray(value)&&Object.prototype.toString.call(value)!=='[object Object]')return false;
 if(Reflect.ownKeys(value).some(k=>typeof k!=='string'))return false;
 active.add(value);
 const descriptors=Object.getOwnPropertyDescriptors(value);
 if(Object.values(descriptors).some(d=>d.get||d.set)){active.delete(value);return false;}
 const entries=Array.isArray(value)?Array.from(value):Object.values(value);
 const valid=entries.every(v=>jsonDomain(v,active,depth+1));active.delete(value);return valid;
}
function ordered(value:unknown):string {
  if(Array.isArray(value))return '['+value.map(ordered).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+ordered((value as Record<string,unknown>)[k])).join(',')+'}';
  return JSON.stringify(value)??'undefined';
}
/** Expectations are resolved only from the reviewed production data; caller data cannot define them. */
export function validateMcDonaldsClaims(claims:unknown, requiredIds:readonly string[] = DATA.facts.map(f=>f.fact_id)) {
  const expected=new Map(DATA.facts.map(f=>[f.fact_id,f])),seen=new Set<string>(),errors:{code:string;id?:string}[]=[];
  if(!Array.isArray(claims))return [{code:'INVALID_COLLECTION'}];
  for(const candidate of claims){
    if(!jsonDomain(candidate)||!candidate||typeof candidate!=='object'||typeof candidate.fact_id!=='string'){errors.push({code:'INVALID_CLAIM'});continue;}
    const id=candidate.fact_id, wanted=expected.get(id);
    if(!wanted){errors.push({code:'UNKNOWN_FACT',id});continue;}
    if(seen.has(id))errors.push({code:'DUPLICATE_FACT',id});seen.add(id);
    if(ordered(candidate)!==ordered(wanted))errors.push({code:'SOURCE_FACT_MISMATCH',id});
  }
  for(const id of requiredIds)if(!expected.has(id))errors.push({code:'UNKNOWN_REQUIRED_FACT',id});else if(!seen.has(id))errors.push({code:'MISSING_REQUIRED_FACT',id});
  return errors;
}
const TITLES:Record<string,string>={income_statement:'Consolidated Statement of Income',comprehensive_income:'Consolidated Statement of Comprehensive Income',balance_sheet:'Consolidated Balance Sheet',cash_flow:'Consolidated Statement of Cash Flows',equity_balances:'Consolidated Statement of Shareholders’ Equity — balances by component',equity_movements:'Consolidated Statement of Shareholders’ Equity — movements by component',balance_sheet_share_disclosures:'Consolidated Balance Sheet — share disclosures'};
const LABELS:Record<string,Record<string,string>>={
 income_statement:{company_restaurant_sales:'Sales by Company-operated restaurants',franchise_revenue:'Revenues from franchised restaurants',other_revenue:'Other revenues',total_revenue:'Total revenues',food_and_paper:'Food & paper',payroll_and_benefits:'Payroll & employee benefits',company_occupancy_other:'Occupancy & other operating expenses',franchise_occupancy:'Franchised restaurants-occupancy expenses',other_restaurant:'Other restaurant expenses',sga_depreciation:'Depreciation and amortization',sga_other:'Other',other_operating_expense_income:'Other operating (income) expense, net',total_operating_costs:'Total operating costs and expenses',operating_income:'Operating income',interest_expense_net_capitalized:'Interest expense-net of capitalized interest of $9.5, $6.8 and $6.0',other_nonoperating_expense_income:'Nonoperating (income) expense, net',pretax_income:'Income before provision for income taxes',income_tax:'Provision for income taxes',net_income:'Net income',basic_eps:'Earnings per common share–basic',diluted_eps:'Earnings per common share–diluted',dividend_declared_per_share:'Dividends declared per common share',weighted_average_basic_shares:'Weighted-average shares outstanding–basic',weighted_average_diluted_shares:'Weighted-average shares outstanding–diluted'},
 balance_sheet:{inventory:'Inventories, at cost, not in excess of market',other_misc_assets:'Miscellaneous',rou_asset:'Lease right-of-use asset, net',ppe_gross:'Property and equipment, at cost',lease_current:'Lease liability',income_tax_current:'Income taxes',franchise_deferred_revenue:'Deferred revenues - initial franchise fees',preferred_stock:'Preferred stock, no par value; authorized – 165.0 million shares; issued – none',common_stock:'Common stock, $0.01 par value; authorized – 3.5 billion shares; issued – 1,660.6 million',aoci:'Accumulated other comprehensive income (loss)',treasury_stock:'Common stock in treasury, at cost; 929.3 and 915.8 million shares',total_equity:'Total shareholders’ equity (deficit)',liabilities_and_equity:'Total liabilities and shareholders’ equity (deficit)'},
 cash_flow:{sale_loss_gain:'Net (gain) loss on sale of restaurant and other businesses',other_noncash:'Other',change_receivables:'Accounts receivable',change_inventory_prepaid:'Inventories, prepaid expenses and other current assets',change_payables:'Accounts payable',change_taxes:'Income taxes',change_other_accruals:'Other accrued liabilities',other_investing:'Other',cfi:'Cash used for investing activities',other_financing:'Other',cff:'Cash used for financing activities',cash_change:'Cash and equivalents increase (decrease)',cash_begin:'Cash and equivalents at beginning of year',cash_end:'Cash and equivalents at end of year',interest_paid:'Interest paid',tax_paid:'Income taxes paid'},
 comprehensive_income:{fx_recognized:'Gain (loss) recognized in accumulated other comprehensive income (AOCI), including net investment hedges',fx_reclassified:'Reclassification of (gain) loss to net income',fx_oci:'Foreign currency translation adjustments-net of tax benefit (expense) of $(207.6), $(186.5), and $204.8',hedge_recognized:'Gain (loss) recognized in AOCI',hedge_reclassified:'Reclassification of (gain) loss to net income',hedge_oci:'Cash flow hedges-net of tax benefit (expense) of $(16.0), $(24.9), and $36.6',pension_recognized:'Gain (loss) recognized in AOCI',pension_reclassified:'Reclassification of (gain) loss to net income',pension_oci:'Defined benefit pension plans-net of tax benefit (expense) of $43.2, $(36.6), and $9.3',total_oci:'Total other comprehensive income (loss), net of tax'}
};
const UNIT:Record<string,string>={USD_millions:'USD million',USD_per_share:'USD per common share',millions_of_shares:'million shares'};
function rowContext(t:string,r:string){
 if(t==='income_statement'){
  if(['food_and_paper','payroll_and_benefits','company_occupancy_other'].includes(r))return 'Operating costs and expenses / Company-operated restaurant expenses';
  if(['sga_depreciation','sga_other'].includes(r))return 'Operating costs and expenses / Selling, general & administrative expenses';
 }
 if(t==='balance_sheet'){
  if(['cash','receivables','inventory','prepaids_other_current','current_assets'].includes(r))return 'Assets / Current assets';
  if(['affiliates','goodwill','other_misc_assets','other_assets'].includes(r))return 'Assets / Other assets';
  if(['ppe_gross','ppe_accumulated','ppe_net'].includes(r))return 'Assets / Property and equipment';
  if(['preferred_stock','common_stock','paid_in_capital','retained_earnings','aoci','treasury_stock','total_equity'].includes(r))return 'Liabilities and shareholders’ equity / Shareholders’ equity (deficit)';
  if(['debt_long_term','lease_long_term','income_tax_long_term','franchise_deferred_revenue','other_long_term_liabilities','deferred_income_taxes'].includes(r))return 'Liabilities and shareholders’ equity';
  if(['lease_current','income_tax_current','other_tax_current','interest_current','payroll_other_current','accounts_payable'].includes(r))return 'Current liabilities';
  if(r==='other_misc_assets')return 'Other assets / Miscellaneous';
 }
 if(t==='cash_flow'){
  if(r==='interest_paid'||r==='tax_paid')return 'Supplemental cash flow disclosures';
  if(['capex','purchases_businesses','sales_businesses','sales_property','other_investing','cfi'].includes(r))return 'Investing activities';
  if(['short_borrowings','debt_issuance','debt_repayment','treasury_purchase','dividends','options_proceeds','other_financing','cff'].includes(r))return 'Financing activities';
  if(['net_income','cfo'].includes(r))return 'Operating activities';
  if(['depreciation','deferred_taxes','share_compensation','sale_loss_gain'].includes(r))return 'Operating activities / Adjustments to reconcile to cash provided by operations / Charges and credits';
  if(r==='other_noncash')return 'Operating activities / Adjustments to reconcile to cash provided by operations / Charges and credits';
  if(r.startsWith('change_'))return 'Operating activities / Changes in working capital items';
  if(r==='other_investing')return 'Investing activities';if(r==='other_financing')return 'Financing activities';
  if(r==='cash_begin'||r==='cash_end')return 'Instant balance at '+(r==='cash_begin'?'beginning':'end')+' of each source fiscal year; cell dates govern';
 }
 if(t==='comprehensive_income'){
  const parent=r.startsWith('fx_')?'Foreign currency translation adjustments':r.startsWith('hedge_')?'Cash flow hedges':r.startsWith('pension_')?'Defined benefit pension plans':'';
  return parent+(r.includes('tax_benefit_expense')?' / Tax qualifier disclosed in source row label; not an additional OCI component':'');
 }
 if(t.startsWith('equity_'))return 'Source matrix transposed by year/component for presentation only; reported component amounts and signs unchanged';
 return '';
}
function sourceTable(id:string){
 const t=TABLES[id],instant=['balance_sheet','balance_sheet_share_disclosures','equity_balances'].includes(id),index=new Map((DATA.facts as Claim[]).map(f=>[f.fact_id,f]));
 return {id,title:TITLES[id],sourcePages:[t.source_physical_page],columns:t.columns.map(year=>({id:year,label:year,period:instant?{kind:'instant' as const,end:year+'-12-31'}:{kind:'duration' as const,start:year+'-01-01',end:year+'-12-31'}})),
 rows:Object.entries(t.rows).map(([rid,r])=>({id:rid,label:LABELS[id]?.[rid]??r.label,unit:UNIT[r.unit??t.unit]??r.unit??t.unit,sourcePage:t.source_physical_page,
  level:(['total_revenue','total_operating_costs','operating_income','pretax_income','current_assets','other_assets','ppe_net','current_liabilities','cfo','cfi','cff','total_oci'].includes(rid)?'subtotal':['net_income','total_assets','total_equity','liabilities_and_equity','comprehensive_income','cash_end'].includes(rid)?'total':'line') as 'line'|'subtotal'|'total',status:'reported' as const,context:rowContext(id,rid),
  cells:Object.fromEntries(t.columns.map(year=>{const f=index.get(id+'.'+rid+'.'+year)!,n=r.values[year];return [year,{value:n===null?null:Number(n),status:n===null?'unavailable' as const:'reported' as const,...(r.source_display?.[year]?{display:r.source_display[year]}:{}),sourceFactId:f.fact_id,
   period:factPeriod(f)}]}))}))};
}
/** Calculated from passed values, so altered data creates residuals instead of canned success flags. */
export function calculateMcDonaldsChecks(tables:Record<string,DataTable> = TABLES){
 const checks:{id:string;reported:number;computed:number;residual:number;unit:string;sourcePages:number[];status:'exact'|'mismatch';assurance:'none'}[]=[];
 const v=(t:string,r:string,y:string)=>{const n=tables[t]?.rows[r]?.values[y],match=typeof n==='string'?n.match(/^(-?)(0|[1-9]\d*)(?:\.(\d{1,2}))?$/):null;if(!match)throw new Error('Invalid source value '+t+'.'+r+'.'+y);const integer=BigInt(match[2])*100n+BigInt((match[3]??'').padEnd(2,'0')),signed=match[1]?-integer:integer;if(signed>BigInt(Number.MAX_SAFE_INTEGER)||signed<BigInt(Number.MIN_SAFE_INTEGER))throw new Error('Invalid source value '+t+'.'+r+'.'+y);return Number(signed)};
 const check=(id:string,reported:number,computed:number,pages:number[],unit='USD million')=>checks.push({id,reported:reported/100,computed:computed/100,residual:(computed-reported)/100,unit,sourcePages:pages,status:computed===reported?'exact':'mismatch',assurance:'none'});
 const sum=(t:string,rows:string[],y:string)=>rows.reduce((a,r)=>a+v(t,r,y),0);
 for(const y of ['2022','2021','2020']){
  const i='income_statement',c='cash_flow',b='equity_balances',m='equity_movements',p=String(Number(y)-1);
  check('income.revenue.'+y,v(i,'total_revenue',y),sum(i,['company_restaurant_sales','franchise_revenue','other_revenue'],y),[2172]);
  check('income.operating_costs.'+y,v(i,'total_operating_costs',y),sum(i,['food_and_paper','payroll_and_benefits','company_occupancy_other','franchise_occupancy','other_restaurant','sga_depreciation','sga_other','other_operating_expense_income'],y),[2172]);
  check('income.operating.'+y,v(i,'operating_income',y),v(i,'total_revenue',y)-v(i,'total_operating_costs',y),[2172]);
  check('income.pretax.'+y,v(i,'pretax_income',y),v(i,'operating_income',y)-v(i,'interest_expense_net_capitalized',y)-v(i,'other_nonoperating_expense_income',y),[2172]);
  check('income.net.'+y,v(i,'net_income',y),v(i,'pretax_income',y)-v(i,'income_tax',y),[2172]);
  check('cash.operating.'+y,v(c,'cfo',y),sum(c,['net_income','depreciation','deferred_taxes','share_compensation','sale_loss_gain','other_noncash','change_receivables','change_inventory_prepaid','change_payables','change_taxes','change_other_accruals'],y),[2175]);
  check('cash.investing.'+y,v(c,'cfi',y),sum(c,['capex','purchases_businesses','sales_businesses','sales_property','other_investing'],y),[2175]);
  check('cash.financing.'+y,v(c,'cff',y),sum(c,['short_borrowings','debt_issuance','debt_repayment','treasury_purchase','dividends','options_proceeds','other_financing'],y),[2175]);
  check('cash.change.'+y,v(c,'cash_change',y),sum(c,['cfo','cfi','cff','fx'],y),[2175]);
  check('cash.bridge.'+y,v(c,'cash_end',y),v(c,'cash_begin',y)+v(c,'cash_change',y),[2175]);
  check('equity.rollforward.'+y,v(b,'total_equity',y),v(b,'total_equity',p)+sum(m,['comprehensive_income','dividends','treasury_purchase_amount','sbc','options_total'],y),[2176]);
  check('equity.retained.'+y,v(b,'retained_earnings',y),v(b,'retained_earnings',p)+sum(m,['net_income','dividends'],y),[2176]);
  for(const [total,parts] of [['fx_oci',['fx_recognized','fx_reclassified']],['hedge_oci',['hedge_recognized','hedge_reclassified']],['pension_oci',['pension_recognized','pension_reclassified']],['total_oci',['fx_oci','hedge_oci','pension_oci']]] as [string,string[]][])check('comprehensive.'+total+'.'+y,v('comprehensive_income',total,y),sum('comprehensive_income',parts,y),[2173]);
  for(const [component,movements] of [['paid_in_capital',['sbc','options_apic']],['pension_aoci',['oci_pension']],['hedge_aoci',['oci_hedge']],['fx_aoci',['oci_fx']],['treasury_shares',['treasury_purchase_shares','options_treasury_shares']],['treasury_stock',['treasury_purchase_amount','options_treasury_amount']]] as [string,string[]][])check('equity.component.'+component+'.'+y,v(b,component,y),v(b,component,p)+sum(m,movements,y),[2176],component==='treasury_shares'?'million shares':'USD million');
  check('equity.oci.'+y,v(m,'total_oci',y),sum(m,['oci_pension','oci_hedge','oci_fx'],y),[2176]);
  check('equity.options.'+y,v(m,'options_total',y),sum(m,['options_apic','options_treasury_amount'],y),[2176]);
  check('equity.comprehensive.'+y,v(m,'comprehensive_income',y),sum(m,['net_income','total_oci'],y),[2176]);
  check('cross.cash_net_income.'+y,v(c,'net_income',y),v(i,'net_income',y),[2172,2175]);
  check('cross.equity_net_income.'+y,v(m,'net_income',y),v(i,'net_income',y),[2172,2176]);
  check('cross.comprehensive_net_income.'+y,v('comprehensive_income','net_income',y),v(i,'net_income',y),[2172,2173]);
  check('comprehensive.total.'+y,v('comprehensive_income','comprehensive_income',y),sum('comprehensive_income',['net_income','total_oci'],y),[2173]);
 }
 for(const y of ['2022','2021']){
  const b='balance_sheet';
  check('balance.current_assets.'+y,v(b,'current_assets',y),sum(b,['cash','receivables','inventory','prepaids_other_current'],y),[2174]);
  check('balance.other_assets.'+y,v(b,'other_assets',y),sum(b,['affiliates','goodwill','other_misc_assets'],y),[2174]);
  check('balance.ppe.'+y,v(b,'ppe_net',y),sum(b,['ppe_gross','ppe_accumulated'],y),[2174]);
  check('balance.assets.'+y,v(b,'total_assets',y),sum(b,['current_assets','other_assets','rou_asset','ppe_net'],y),[2174]);
  check('balance.current_liabilities.'+y,v(b,'current_liabilities',y),sum(b,['accounts_payable','lease_current','income_tax_current','other_tax_current','interest_current','payroll_other_current'],y),[2174]);
  check('balance.equity.'+y,v(b,'total_equity',y),sum(b,['preferred_stock','common_stock','paid_in_capital','retained_earnings','aoci','treasury_stock'],y),[2174]);
  check('balance.liabilities_equity.'+y,v(b,'liabilities_and_equity',y),sum(b,['current_liabilities','debt_long_term','lease_long_term','income_tax_long_term','franchise_deferred_revenue','other_long_term_liabilities','deferred_income_taxes','total_equity'],y),[2174]);
  check('balance.identity.'+y,v(b,'total_assets',y),v(b,'liabilities_and_equity',y),[2174]);
  check('cross.cash_balance.'+y,v(b,'cash',y),v('cash_flow','cash_end',y),[2174,2175]);
  check('cross.cash_continuity.'+y,v('cash_flow','cash_begin',y),v('cash_flow','cash_end',String(Number(y)-1)),[2175]);
  check('debt.carrying.'+y,v('debt_carrying','total',y),sum('debt_carrying',['before_adjustments','fair_value','costs'],y),[2191]);
 }
 for(const y of ['2022','2021','2020','2019'])check('equity.total_components.'+y,v('equity_balances','total_equity',y),sum('equity_balances',['common_stock','paid_in_capital','retained_earnings','pension_aoci','hedge_aoci','fx_aoci','treasury_stock'],y),[2176]);
 check('debt.maturity_sum.2022',v('debt_carrying','before_adjustments','2022'),sum('debt_maturities',['2023','2024','2025','2026','2027','thereafter'],'amount'),[2191]);
 check('lease.discounting.2022',v('lease_maturities','present_value','amount'),sum('lease_maturities',['payments','interest'],'amount'),[2186]);
 check('lease.classification.2022',v('lease_maturities','present_value','amount'),sum('balance_sheet',['lease_current','lease_long_term'],'2022'),[2174,2186]);
 return checks;
}
export function reviewedMcDonaldsSource(id:string){
 if(id!==MCDONALDS_SOURCE_ID)return null;
 const quoted=(v:unknown)=>'"'+String(v).replace(/"/g,'""')+'"';
 const csv=[SOURCE_MARKER+id,'رقم الحساب,اسم الحساب,مدين,دائن,السنة السابقة',...ROWS.map(r=>{
  const signed=r.debitPositive?r.current:-r.current,prior=r.debitPositive?r.prior:-r.prior;
  return [r.code,quoted(r.label),signed>0?signed:'',signed<0?-signed:'',prior].join(',');
 })].join('\n');
 const sourceModel={kind:'published-statements' as const,id,issuer:DATA.identity.issuer,issuerCountry:'US',report:'2022 Annual Report and Form 10-K',accountingBasis:'US_GAAP',currency:'USD',unit:'million',scope:'consolidated',entities:DATA.identity.entity_scope,
  periodStart:'2022-01-01',periodEnd:'2022-12-31',priorPeriodEnd:'2021-12-31',flowPeriods:['2022','2021','2020'],balanceSheetDates:['2022-12-31','2021-12-31'],
  sourceFile:'global_financial_and_audit_research_bundle_extended_verified.pdf',sourceSha256:DATA.source.pdf_sha256,sourcePages:[2172,2173,2174,2175,2176],reviewedSourcePages:[2132,2204],
  sourcePackageSha256:'43611d867e6329bd531e45ec237fd97a63e560e42896186f1478b3d6d1ba2bcf',reviewedModelSha256:'873af9d6ab999fa21b8c278edab2d4423bfe3e32318ce362ea27e58d5b7a327e',
  facts:clone(ROWS),sourcePayload:clone(DATA),
  transport:{kind:'published-observation-carrier',isLedger:false,closingEquityUnchanged:true,balancingEntries:[] as unknown[],note:'CSV carries published leaves unchanged. It is not a preclosing trial balance. No balance plug or retained-earnings-minus-profit bridge.'},
  auditorReference:{name:'Ernst & Young LLP',opinion:'unqualified',date:'2023-02-24',pages:[2195,2196,2197],scope:'Original 2022/2021 consolidated balance sheets and 2022/2021/2020 income, comprehensive income, equity, cash flows and related notes under U.S. GAAP; historical source attribution only',financialStatementPages:[2195,2196],internalControl:{name:'Ernst & Young LLP',date:'2023-02-24',sourcePage:2197,pages:[2197],asOf:'2022-12-31',scope:'Original McDonald’s Corporation internal control over financial reporting as of December 31, 2022; historical source opinion only',criteria:'COSO Internal Control–Integrated Framework (2013)',opinion:'effective in all material respects; reported by EY only'},criticalAuditMatter:{title:'Valuation of Unrecognized Tax Benefits and Related Regulatory Actions',separateOpinion:false},applicationOutputAssured:false},
  cashFlow:{status:'reported-source-payload',sourcePage:2175,reconstruction:'unavailable'},
  replay:{schemaVersion:'1.0' as const,mode:'published-statement-replay' as const,tables:Object.keys(TITLES).map(sourceTable),checks:calculateMcDonaldsChecks(),
   unavailable:[{id:'ledger-reconstruction',reason:'No journal entries or transaction-level records supplied.'},{id:'audit-assurance',reason:'Published report observations and simulation do not establish professional assurance.'},{id:'notes-rendering',reason:'All 48 normalized tables, typed facts, selected policies and original opinion attribution are preserved in sourcePayload; full notes and narrative rendering are not implemented.',sourcePages:[2177,2193]}],
   limitations:[...DATA.limitations,'The two normalized equity tables transpose the source matrix by year/component without changing amounts; source cells retain their periods and units.','Primary statements are replayed from reported observations. Generic cash-flow/equity reconstruction and ledger analytics are unavailable.','Systemwide sales around USD 118.2 billion and franchised sales USD 109473 million are not consolidated revenue USD 23182.6 million.','USD 2700 million short-term obligations are classified long-term in the source debt note under a committed credit facility; no invented current reclassification.','2020 treasury purchases differ between cash flow (-907.8) and equity (-874.1); no fabricated bridge.']}
 };
 return {csv,overrides:Object.fromEntries(ROWS.map(r=>[r.code,r.line])),sourceModel};
}

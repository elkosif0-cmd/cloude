/* Global audit benchmarks — what the auditors of 50 of the world's largest groups actually reported.
   Source: global_financial_and_audit_research_bundle_extended_verified.pdf (12,506 pages: annual reports,
   Forms 10-K and 20-F of US, European, UK, Japanese, Korean, Taiwanese, Chinese, Indian, Saudi, Emirati,
   Canadian and Australian groups, plus an index of 30 official filing and audit-quality sources).
   Every entry below was read in the bundle and carries the bundle page it came from; nothing is inferred.
   What the app uses it for (advisory only — the engagement partner decides):
     • a library of real key / critical audit matters (ISA 701 KAMs, PCAOB AS 3101 CAMs) by theme and sector
     • precedents for the KAMs the trial-balance review proposes, matched through the statement line
     • a comparison of the engagement's materiality choices with the materiality auditors disclosed (ISA 320)
   Materiality and KAM decisions stay with the auditor; a precedent is evidence of practice, not a rule. */

import { REFERENCE_REPORTS, canonicalReferenceId, legacyReferenceId, type ReferenceReport } from '../reports/reference-index-engine';

export type Standard = 'PCAOB' | 'ISA';
export type Sector = 'tech' | 'retail' | 'fmcg' | 'banking' | 'insurance' | 'pharma' | 'energy' | 'auto' | 'telecom' | 'mining' | 'industrial' | 'conglomerate';
export type Theme = 'revenue-deductions' | 'revenue-recognition' | 'credit-losses' | 'tax-uncertainty' | 'impairment-intangibles' | 'impairment-assets'
  | 'provisions-litigation' | 'fair-value' | 'actuarial' | 'it-controls' | 'complex-transactions' | 'inventory' | 'fraud-override' | 'climate' | 'parent-investments' | 'related-parties';

export type Report = { id: string; company: string; country: string; sector: Sector; framework: string; standard: Standard | 'unknown'; auditor: string; reference?: ReferenceReport;
  /** Disclosed source audit basis, separate from the legacy operational standard classification. */ sourceAuditLabel?: string;
  /** first year of the audit engagement when the report states it */ since?: number; fy: string; kind: string; pages: [number, number] };
export type Kam = { report: string; title: string; theme: Theme; page: number };
export type MaterialityCase = { report: string; currency: string; overall: number; basis: string; benchmark: 'profit' | 'cash-flow' | 'ebit';
  /** materiality ÷ the benchmark, when the report states it */ pct?: number; performancePct?: number; threshold?: number;
  parent?: { pct: number; basis: string }; prior?: number; page: number };

export const BUNDLE = { file: 'global_financial_and_audit_research_bundle_extended_verified.pdf', pages: 12506 } as const;

/* ---------- the 30 official sources indexed on the bundle's cover page (page 1) ---------- */
export const SOURCES: { name: string; covers: string; url: string; kind: 'filings' | 'audit-quality' | 'standards' }[] = [
  { name: 'SEC EDGAR', covers: 'US public-company 10-K/10-Q filings', url: 'https://www.sec.gov/edgar/searchedgar/companysearch.html', kind: 'filings' },
  { name: 'SEC Financial Statement Data Sets', covers: 'Machine-readable quarterly financial statement data', url: 'https://www.sec.gov/dera/data/financial-statement-data-sets.html', kind: 'filings' },
  { name: 'Companies House', covers: 'UK company accounts and annual reports', url: 'https://find-and-update.company-information.service.gov.uk/', kind: 'filings' },
  { name: 'FCA National Storage Mechanism', covers: 'UK regulated issuers annual financial reports', url: 'https://data.fca.org.uk/#/nsm/nationalstoragemechanism', kind: 'filings' },
  { name: 'ESMA ESEF filings', covers: 'European electronic annual financial reports', url: 'https://registers.esma.europa.eu/publication/', kind: 'filings' },
  { name: 'SEDAR+', covers: 'Canadian public issuer filings', url: 'https://www.sedarplus.ca/', kind: 'filings' },
  { name: 'ASIC', covers: 'Australian company and financial reporting resources', url: 'https://asic.gov.au/for-business/financial-reporting/', kind: 'filings' },
  { name: 'SEC Philippines PSE Edge', covers: 'Philippine listed-company disclosures', url: 'https://edge.pse.com.ph/', kind: 'filings' },
  { name: 'HKEXnews', covers: 'Hong Kong listed-company financial reports', url: 'https://www.hkexnews.hk/', kind: 'filings' },
  { name: 'SGX', covers: 'Singapore listed-company annual reports', url: 'https://www.sgx.com/securities/company-announcements', kind: 'filings' },
  { name: 'JSE SENS', covers: 'South African issuer announcements and reports', url: 'https://senspdf.jse.co.za/', kind: 'filings' },
  { name: 'Saudi Tadawul', covers: 'Saudi listed-company financial statements', url: 'https://www.saudiexchange.sa/', kind: 'filings' },
  { name: 'ADX', covers: 'UAE Abu Dhabi issuer disclosures', url: 'https://www.adx.ae/', kind: 'filings' },
  { name: 'DFM', covers: 'Dubai listed-company disclosures', url: 'https://www.dfm.ae/', kind: 'filings' },
  { name: 'Euronext', covers: 'European issuer regulatory disclosures', url: 'https://live.euronext.com/en/products/equities/company-news', kind: 'filings' },
  { name: 'Japan EDINET', covers: 'Japanese statutory securities reports', url: 'https://disclosure2.edinet-fsa.go.jp/', kind: 'filings' },
  { name: 'Korea DART', covers: 'Korean corporate filings', url: 'https://englishdart.fss.or.kr/', kind: 'filings' },
  { name: 'India MCA', covers: 'Indian company filings and annual returns', url: 'https://www.mca.gov.in/', kind: 'filings' },
  { name: 'India SEBI', covers: 'Indian listed-company disclosures', url: 'https://www.sebi.gov.in/', kind: 'filings' },
  { name: 'Brazil CVM', covers: 'Brazilian issuer reference forms and financials', url: 'https://www.gov.br/cvm/pt-br', kind: 'filings' },
  { name: 'Deloitte Transparency Reports', covers: 'Audit-firm governance, quality and inspection disclosures', url: 'https://www.deloitte.com/global/en/about/story/impact/transparency-report.html', kind: 'audit-quality' },
  { name: 'PwC Transparency Reports', covers: 'Audit quality and governance reports', url: 'https://www.pwc.com/gx/en/about/corporate-governance/transparency-report.html', kind: 'audit-quality' },
  { name: 'EY Transparency Reports', covers: 'Audit quality transparency reports', url: 'https://www.ey.com/en_gl/about-us/transparency-report', kind: 'audit-quality' },
  { name: 'KPMG Transparency Reports', covers: 'Audit quality and independence reports', url: 'https://kpmg.com/xx/en/home/about/governance/transparency-report.html', kind: 'audit-quality' },
  { name: 'IAASB', covers: 'International auditing standards and implementation reports', url: 'https://www.iaasb.org/publications', kind: 'standards' },
  { name: 'IESBA', covers: 'Ethics and independence standards', url: 'https://www.ethicsboard.org/publications', kind: 'standards' },
  { name: 'PCAOB', covers: 'US audit inspection and standards reports', url: 'https://pcaobus.org/oversight/inspections', kind: 'audit-quality' },
  { name: 'FRC UK', covers: 'Audit quality review and corporate reporting reviews', url: 'https://www.frc.org.uk/library/annual-reports-and-reviews/', kind: 'audit-quality' },
  { name: 'IFIAR', covers: 'Global audit regulator inspection findings', url: 'https://www.ifiar.org/activities/inspection-findings/', kind: 'audit-quality' },
  { name: 'PCAOB firm inspection reports', covers: 'Audit firm inspection reports', url: 'https://pcaobus.org/oversight/inspections/firm-inspection-reports', kind: 'audit-quality' },
];

/* ---------- the reports in the bundle (page ranges in the bundle) ---------- */
const R = (id: string, company: string, country: string, sector: Sector, framework: string, standard: Standard, auditor: string, since: number | undefined, fy: string, kind: string, a: number, b: number, sourceAuditLabel?: string): Report =>
  ({ id, company, country, sector, framework, standard, auditor, ...(since ? { since } : {}), fy, kind, pages: [a, b], ...(sourceAuditLabel ? { sourceAuditLabel } : {}) });
const LEGACY_REPORTS: Report[] = [
  R('amazon-2023', 'Amazon.com, Inc.', 'US', 'retail', 'US GAAP', 'PCAOB', 'Ernst & Young LLP', 1996, 'FY2023', 'Annual report + 10-K', 2, 93),
  R('apple-2024', 'Apple Inc.', 'US', 'tech', 'US GAAP', 'PCAOB', 'Ernst & Young LLP', 2009, 'FY2024', '10-K', 94, 214),
  R('cisco-2024', 'Cisco Systems, Inc.', 'US', 'tech', 'US GAAP', 'PCAOB', 'PricewaterhouseCoopers LLP', 1988, 'FY2024', 'Annual report + 10-K', 215, 348),
  R('walmart-2023', 'Walmart Inc.', 'US', 'retail', 'US GAAP', 'PCAOB', 'Ernst & Young LLP', 1969, 'FY2023', '10-K', 349, 446),
  R('adobe-2024', 'Adobe Inc.', 'US', 'tech', 'US GAAP', 'PCAOB', 'KPMG LLP', 1983, 'FY2024', '10-K', 447, 547),
  R('jpmorgan-2023', 'JPMorgan Chase & Co.', 'US', 'banking', 'US GAAP', 'PCAOB', 'PricewaterhouseCoopers LLP', 1965, 'FY2023', 'Annual report', 548, 911),
  R('apple-2020', 'Apple Inc.', 'US', 'tech', 'US GAAP', 'PCAOB', 'Ernst & Young LLP', 2009, 'FY2020', '10-K', 912, 1016),
  R('amazon-2024', 'Amazon.com, Inc.', 'US', 'retail', 'US GAAP', 'PCAOB', 'Ernst & Young LLP', 1996, 'FY2024', 'Annual report + 10-K', 1017, 1107),
  R('apple-2023', 'Apple Inc.', 'US', 'tech', 'US GAAP', 'PCAOB', 'Ernst & Young LLP', 2009, 'FY2023', '10-K', 1108, 1187),
  R('berkshire-2025', 'Berkshire Hathaway Inc.', 'US', 'insurance', 'US GAAP', 'PCAOB', 'Deloitte & Touche LLP', 1985, 'FY2025', 'Annual report + 10-K', 1188, 1341),
  R('jpmorgan-2025', 'JPMorgan Chase & Co.', 'US', 'banking', 'US GAAP', 'PCAOB', 'PricewaterhouseCoopers LLP', 1965, 'FY2025', 'Annual report', 1342, 1706),
  R('bofa-2025', 'Bank of America', 'US', 'banking', 'US GAAP', 'PCAOB', 'PricewaterhouseCoopers LLP', 1958, 'FY2025', 'Annual report', 1707, 1818),
  R('pepsico-2025', 'PepsiCo, Inc.', 'US', 'fmcg', 'US GAAP', 'PCAOB', 'KPMG LLP', 1990, 'FY2025', 'Annual report + 10-K', 1819, 1962),
  R('pg-2026', 'The Procter & Gamble Company', 'US', 'fmcg', 'US GAAP', 'PCAOB', 'Deloitte & Touche LLP', 1890, 'FY2026', '10-K', 1963, 2043),
  R('homedepot-2025', 'The Home Depot, Inc.', 'US', 'retail', 'US GAAP', 'PCAOB', 'KPMG LLP', 1979, 'FY2025', '10-K', 2044, 2131),
  R('mcdonalds-2022', 'McDonald’s Corporation', 'US', 'retail', 'US GAAP', 'PCAOB', 'Ernst & Young LLP', 1964, 'FY2022', '2022 Annual Report and Form 10-K', 2132, 2204),
  R('nestle-2025', 'Nestlé Group', 'CH', 'fmcg', 'IFRS', 'ISA', 'Ernst & Young Ltd', undefined, 'FY2025', 'Financial statements', 2205, 2342),
  R('roche-2025', 'Roche Group', 'CH', 'pharma', 'IFRS', 'ISA', 'KPMG AG', undefined, 'FY2025', 'Finance report', 2343, 2539),
  R('novartis-2025', 'Novartis AG', 'CH', 'pharma', 'IFRS', 'ISA', 'KPMG AG', undefined, 'FY2025', 'Annual report', 2540, 2817),
  R('ubs-2025', 'UBS Group AG', 'CH', 'banking', 'IFRS', 'PCAOB', 'Ernst & Young Ltd', undefined, 'FY2025', 'Annual report', 2818, 3184),
  R('allianz-2025', 'Allianz SE', 'DE', 'insurance', 'IFRS', 'ISA', 'PricewaterhouseCoopers GmbH', undefined, 'FY2025', 'Annual report (extract)', 3185, 3240),
  R('mercedes-2025', 'Mercedes-Benz Group AG', 'DE', 'auto', 'IFRS', 'ISA', 'PricewaterhouseCoopers GmbH', undefined, 'FY2025', 'Annual report', 3241, 3649),
  R('volkswagen-2025', 'Volkswagen Group', 'DE', 'auto', 'IFRS', 'ISA', 'EY GmbH', undefined, 'FY2025', 'Annual report', 3650, 4322, 'HGB / EU Audit Regulation / IDW'),
  R('telekom-2025', 'Deutsche Telekom AG', 'DE', 'telecom', 'IFRS', 'ISA', 'Deloitte GmbH', undefined, 'FY2025', 'Annual report', 4323, 4704),
  R('bp-2025', 'BP p.l.c.', 'UK', 'energy', 'IFRS', 'ISA', 'Deloitte LLP', undefined, 'FY2025', 'Annual report and Form 20-F', 4705, 5101),
  R('unilever-2025', 'Unilever PLC', 'UK', 'fmcg', 'IFRS', 'ISA', 'KPMG LLP', 2014, 'FY2025', 'Annual report', 5102, 5385),
  R('astrazeneca-2025', 'AstraZeneca PLC', 'UK', 'pharma', 'IFRS', 'ISA', 'PricewaterhouseCoopers LLP', undefined, 'FY2025', 'Annual report and Form 20-F', 5386, 5698),
  R('gsk-2025', 'GSK plc', 'UK', 'pharma', 'IFRS', 'ISA', 'Deloitte LLP', undefined, 'FY2025', 'Annual report', 5699, 5949),
  R('hsbc-2025', 'HSBC Holdings plc', 'UK', 'banking', 'IFRS', 'ISA', 'PricewaterhouseCoopers LLP', undefined, 'FY2025', 'Annual report', 5950, 6321),
  R('totalenergies-2024', 'TotalEnergies SE', 'FR', 'energy', 'IFRS', 'PCAOB', 'PricewaterhouseCoopers Audit · Ernst & Young Audit', undefined, 'FY2024', 'Form 20-F', 6322, 6986),
  R('airbus-2023', 'Airbus SE', 'NL', 'industrial', 'IFRS', 'ISA', 'Ernst & Young Accountants LLP', undefined, 'FY2023', 'Annual report + URD', 6987, 7428),
  R('loreal-2024', "L'Oréal", 'FR', 'fmcg', 'IFRS', 'ISA', '', undefined, 'FY2024', 'Annual report (overview)', 7429, 7448),
  R('sanofi-2025', 'Sanofi', 'FR', 'pharma', 'IFRS', 'PCAOB', 'PricewaterhouseCoopers Audit · Forvis Mazars', undefined, 'FY2025', 'Form 20-F', 7449, 7746),
  R('toyota-2026', 'Toyota Motor Corporation', 'JP', 'auto', 'IFRS', 'PCAOB', 'PricewaterhouseCoopers Japan LLC', 2006, 'FY2026 (Mar)', 'Form 20-F', 7747, 8010),
  R('honda-2023', 'Honda Motor Co., Ltd.', 'JP', 'auto', 'IFRS', 'PCAOB', 'KPMG AZSA LLC', undefined, 'FY2023 (Mar)', 'Form 20-F', 8011, 8257),
  R('softbank-2026', 'SoftBank Group Corp.', 'JP', 'tech', 'IFRS', 'ISA', '', undefined, 'FY2026 (Mar)', 'Annual report', 8258, 8443),
  R('mufg-2026', 'Mitsubishi UFJ Financial Group', 'JP', 'banking', 'US GAAP', 'PCAOB', 'Deloitte Touche Tohmatsu LLC', 1976, 'FY2026 (Mar)', 'Form 20-F', 8444, 8795),
  R('smfg-2026', 'Sumitomo Mitsui Financial Group', 'JP', 'banking', 'J-GAAP', 'ISA', 'KPMG AZSA LLC', undefined, 'FY2026 (Mar)', 'Consolidated financial statements', 8796, 8915),
  R('samsung-2025', 'Samsung Electronics', 'KR', 'tech', 'K-IFRS', 'ISA', '', undefined, 'FY2025', 'Consolidated financial statements', 8916, 9017),
  R('honhai-2025', 'Hon Hai Precision (Foxconn)', 'TW', 'tech', 'TIFRS', 'ISA', 'PricewaterhouseCoopers Taiwan', undefined, 'FY2025', 'Annual report', 9018, 9185),
  R('tencent-2025', 'Tencent Holdings', 'CN', 'tech', 'IFRS', 'ISA', 'PricewaterhouseCoopers', undefined, 'FY2025', 'Annual report', 9186, 9468),
  R('reliance-2026', 'Reliance Industries', 'IN', 'energy', 'Ind AS', 'ISA', 'Deloitte Haskins & Sells LLP · Chaturvedi & Shah LLP', undefined, 'FY2025-26', 'Integrated annual report', 9469, 9615),
  R('infosys-2026', 'Infosys Limited', 'IN', 'tech', 'Ind AS', 'ISA', 'Deloitte Haskins & Sells LLP', undefined, 'FY2025-26', 'Integrated annual report', 9616, 9998),
  R('aramco-2025', 'Saudi Arabian Oil Company (Aramco)', 'SA', 'energy', 'IFRS endorsed in KSA + SOCPA', 'ISA', 'PricewaterhouseCoopers Public Accountants', undefined, 'FY2025', 'Annual report', 9999, 10244),
  R('emiratesnbd-2025', 'Emirates NBD Bank', 'AE', 'banking', 'IFRS', 'ISA', 'Ernst & Young Middle East', undefined, 'FY2025', 'Annual report', 10245, 10375),
  R('eand-2025', 'e& (Emirates Telecommunications Group)', 'AE', 'telecom', 'IFRS', 'ISA', 'Ernst & Young', undefined, 'FY2025', 'Integrated annual report', 10376, 10604),
  R('rbc-2025', 'Royal Bank of Canada', 'CA', 'banking', 'IFRS', 'ISA', 'PricewaterhouseCoopers LLP', 2016, 'FY2025', 'Annual report', 10605, 10850),
  R('bhp-2025', 'BHP Group Limited', 'AU', 'mining', 'IFRS', 'PCAOB', 'Ernst & Young', undefined, 'FY2025', 'Form 20-F + S-K 1300 technical reports', 10851, 12300),
  R('cba-2025', 'Commonwealth Bank of Australia', 'AU', 'banking', 'AASB (IFRS)', 'ISA', 'PricewaterhouseCoopers', undefined, 'FY2025', 'Annual report', 12301, 12506),
];

/* ---------- the key / critical audit matters, as titled in each auditor's report ---------- */
/** One verified ownership index feeds every live report catalog. Legacy audit
 * classification is preserved; disclosed source labels are separate fields. */
export const REPORTS: Report[] = REFERENCE_REPORTS.map(reference => {
  const old = LEGACY_REPORTS.find(r => r.id === legacyReferenceId(reference.id));
  const report: Report = {
    ...(old ?? {country: reference.country, sector: reference.sector as Sector,
      framework: 'Unknown — not reviewed', standard: 'unknown' as const, auditor: ''}),
    id: reference.id, company: reference.name_en, fy: reference.fy,
    kind: reference.document_type_en, pages: [reference.from, reference.to], reference,
  };
  if (reference.id === 'allianz-2025') {
    report.framework = 'HGB'; // Physical p. 3204: parent-company basis of preparation.
    report.sourceAuditLabel = 'HGB / EU Audit Regulation / IDW'; // Physical p. 3235.
  }
  return report;
});

const K = (report: string, theme: Theme, page: number, title: string): Kam => ({ report: canonicalReferenceId(report), title, theme, page });
export const KAMS: Kam[] = [
  K('amazon-2023', 'tax-uncertainty', 49, 'Uncertain Tax Positions'),
  K('amazon-2024', 'tax-uncertainty', 1063, 'Uncertain Tax Positions'),
  K('apple-2020', 'tax-uncertainty', 973, 'Uncertain Tax Positions'),
  K('apple-2023', 'tax-uncertainty', 1159, 'Uncertain Tax Positions'),
  K('apple-2024', 'tax-uncertainty', 144, 'Uncertain Tax Positions'),
  K('cisco-2024', 'revenue-recognition', 289, 'Revenue Recognition for Certain Product and Services Revenue'),
  K('cisco-2024', 'complex-transactions', 289, 'Acquisition of Splunk — Valuation of Customer Contracts and Related Relationships Asset and the Technology Asset Acquired'),
  K('walmart-2023', 'provisions-litigation', 399, 'Contingencies (opioid-related legal proceedings)'),
  K('adobe-2024', 'revenue-recognition', 538, 'Performance obligations in cloud-enabled software subscriptions'),
  K('jpmorgan-2023', 'credit-losses', 749, 'Allowance for Loan Losses – Portfolio-based component of Wholesale Loan and Credit Card Loan Portfolios'),
  K('jpmorgan-2023', 'fair-value', 749, 'Fair Value of Certain Level 3 Financial Instruments'),
  K('jpmorgan-2025', 'credit-losses', 1536, 'Allowance for Loan Losses – Portfolio-Based Component of the Wholesale and Credit Card Retained Loan Portfolios'),
  K('jpmorgan-2025', 'fair-value', 1536, 'Fair Value of Certain Level 3 Financial Instruments'),
  K('bofa-2025', 'credit-losses', 1771, 'Allowance for Loan and Lease Losses - Commercial and Consumer Card Loans'),
  K('berkshire-2025', 'actuarial', 1278, 'Unpaid Losses and Loss Adjustment Expenses — short-duration property and casualty claim liabilities'),
  K('berkshire-2025', 'actuarial', 1278, 'Unpaid Losses and Loss Adjustment Expenses — Retroactive Reinsurance Contracts'),
  K('pepsico-2025', 'tax-uncertainty', 1936, 'Unrecognized tax benefits'),
  K('pg-2026', 'impairment-intangibles', 2001, 'Intangible Assets — Gillette Indefinite-Lived Intangible Asset'),
  K('homedepot-2025', 'inventory', 2084, 'Sufficiency of audit evidence over certain merchandise inventories (retail inventory method)'),
  K('nestle-2025', 'revenue-deductions', 2312, 'Measurement of revenue as it relates to trade spend'),
  K('nestle-2025', 'impairment-intangibles', 2314, 'Carrying value of goodwill and indefinite useful life intangible assets'),
  K('roche-2025', 'revenue-deductions', 2508, 'Government and regulatory mandatory price reductions in the US pharmaceuticals business'),
  K('roche-2025', 'impairment-intangibles', 2509, 'Carrying value of product intangibles not available for use in the Pharmaceuticals Division'),
  K('novartis-2025', 'revenue-deductions', 2790, 'Provisions for deductions from revenue related to US Managed Care, Medicare Part D and Medicaid rebate programs'),
  K('ubs-2025', 'fair-value', 3047, 'Valuation of complex or illiquid instruments at fair value'),
  K('ubs-2025', 'credit-losses', 3048, 'Expected credit losses'),
  K('ubs-2025', 'tax-uncertainty', 3049, 'Recognition of deferred tax assets'),
  K('volkswagen-2025', 'impairment-intangibles', 4295, 'Recoverability of goodwill and acquired brand names'),
  K('volkswagen-2025', 'impairment-intangibles', 4297, 'Capitalization and recoverability of development costs'),
  K('volkswagen-2025', 'provisions-litigation', 4299, 'Accounting treatment of the risk provisions for the diesel issue'),
  K('volkswagen-2025', 'provisions-litigation', 4300, 'Completeness and measurement of provisions for warranty obligations'),
  K('volkswagen-2025', 'impairment-assets', 4301, 'Determination of the expected residual values of lease assets during impairment testing'),
  K('telekom-2025', 'revenue-recognition', 4686, 'Revenue recognition'),
  K('bp-2025', 'climate', 4837, 'Potential impact of climate change and the energy transition'),
  K('bp-2025', 'impairment-assets', 4837, 'Impairment of upstream oil and gas property, plant and equipment (PP&E) assets'),
  K('bp-2025', 'provisions-litigation', 4837, 'Decommissioning provisions'),
  K('bp-2025', 'fair-value', 4847, 'Valuation of commodity financial derivatives, where fraud risks may arise in revenue recognition'),
  K('bp-2025', 'fraud-override', 4837, 'Management override of controls'),
  K('unilever-2025', 'revenue-deductions', 5219, 'Revenue recognition – Rebates'),
  K('unilever-2025', 'tax-uncertainty', 5220, 'Indirect tax contingent liabilities in Brazil'),
  K('unilever-2025', 'complex-transactions', 5221, 'Ice Cream demerger'),
  K('unilever-2025', 'parent-investments', 5222, 'Investments in subsidiaries (Parent Company)'),
  K('astrazeneca-2025', 'revenue-deductions', 5504, 'Recognition and measurement of accruals for Managed Care, Medicaid and Medicare Part D rebates on US Product Sales'),
  K('astrazeneca-2025', 'impairment-intangibles', 5505, 'Impairment assessment of the product, marketing and distribution rights and other intangibles'),
  K('astrazeneca-2025', 'provisions-litigation', 5506, 'Recognition and measurement of legal provisions and disclosure of contingent liabilities'),
  K('astrazeneca-2025', 'actuarial', 5507, 'Valuation of defined benefit obligations in the United Kingdom'),
  K('astrazeneca-2025', 'parent-investments', 5503, 'Distributable reserves (Company)'),
  K('gsk-2025', 'revenue-deductions', 5796, 'Valuation of US Returns and Rebates (RAR) accruals'),
  K('gsk-2025', 'fair-value', 5797, 'Valuation of the ViiV Healthcare Shionogi contingent consideration liability'),
  K('gsk-2025', 'impairment-intangibles', 5798, 'Valuation of other intangible assets'),
  K('gsk-2025', 'tax-uncertainty', 5799, 'Valuation of uncertain tax positions, including transfer pricing'),
  K('hsbc-2025', 'credit-losses', 6206, 'Expected credit losses – Loans and advances to customers (Group)'),
  K('hsbc-2025', 'parent-investments', 6206, 'Investments in subsidiaries (parent company)'),
  K('totalenergies-2024', 'impairment-assets', 6369, 'Evaluation of the impairment of non-current assets used in exploration and production activities (E&P and Integrated LNG)'),
  K('totalenergies-2024', 'impairment-assets', 6372, 'Effect of estimated proved developed hydrocarbon reserves on the depreciation of the oil and gas assets used in production activities'),
  K('airbus-2023', 'revenue-recognition', 7380, 'Revenue recognition (including revenues and costs at completion for onerous and over-time contracts)'),
  K('airbus-2023', 'impairment-assets', 7383, 'Recoverability of key program assets - long-lived assets'),
  K('airbus-2023', 'fair-value', 7384, 'Accounting for derivative financial instruments and hedge ineffectiveness'),
  K('sanofi-2025', 'impairment-intangibles', 7636, 'Recoverable amount of other intangible assets - Acquired R&D, products, trademarks and other rights'),
  K('sanofi-2025', 'revenue-deductions', 7636, 'Valuation of the provisions for rebates relating to Sanofi’s business in the United States – Medicaid, Medicare and Managed Care'),
  K('sanofi-2025', 'tax-uncertainty', 7637, 'Uncertain tax positions'),
  K('toyota-2026', 'provisions-litigation', 7906, 'Liabilities for the costs of recalls and other safety measures'),
  K('toyota-2026', 'credit-losses', 7906, 'Allowance for credit losses—Retail finance receivables'),
  K('honda-2023', 'provisions-litigation', 8137, 'Evaluation of the provision for specific warranty programs'),
  K('honda-2023', 'credit-losses', 8137, 'Allowance for expected credit losses on retail receivables at the finance subsidiary in the United States'),
  K('honda-2023', 'impairment-assets', 8138, 'Estimated end of term residual values of lease vehicles at the finance subsidiary in the United States'),
  K('mufg-2026', 'credit-losses', 8615, 'Allowance for Credit Losses — Macroeconomic Variables in Multiple Economic Forecast Scenarios and Weightings'),
  K('mufg-2026', 'credit-losses', 8615, 'Allowance for Credit Losses — Krungsri Segment — Qualitative Adjustments'),
  K('mufg-2026', 'credit-losses', 8616, 'Allowance for Credit Losses — Commercial Segment — Internal Credit Rating'),
  K('smfg-2026', 'credit-losses', 8909, "The reasonableness of management's assessment of the reserve for possible loan losses for SMBC's corporate loans"),
  K('samsung-2025', 'impairment-assets', 8918, 'Evaluation of commencement of depreciation related to construction in progress'),
  K('samsung-2025', 'revenue-deductions', 8918, 'Sales deduction related to sales promotion activities'),
  K('tencent-2025', 'revenue-recognition', 9308, 'Revenue recognition on provision of online games value-added services related to in-game permanent virtual items – the estimates of expected user lifetime'),
  K('tencent-2025', 'impairment-intangibles', 9309, 'Impairment assessments of goodwill, investments in associates and investments in joint ventures'),
  K('tencent-2025', 'fair-value', 9311, 'Fair value measurement of Level 3 financial instruments'),
  K('reliance-2026', 'provisions-litigation', 9519, 'Litigation matters'),
  K('reliance-2026', 'fair-value', 9519, 'Fair Valuation of Investments'),
  K('reliance-2026', 'it-controls', 9520, 'Information Technology (IT) systems and controls over financial reporting'),
  K('reliance-2026', 'revenue-recognition', 9562, 'Revenue Recognition (reported by the auditors of Reliance Jio Infocomm)'),
  K('infosys-2026', 'revenue-recognition', 9810, 'Revenue recognition'),
  K('infosys-2026', 'revenue-recognition', 9811, 'Revenue recognition - Fixed price contracts using the percentage of completion method'),
  K('aramco-2025', 'impairment-intangibles', 10164, 'Recoverability of Downstream goodwill and the SABIC brand'),
  K('aramco-2025', 'impairment-assets', 10165, 'Valuation of property, plant and equipment and assets held for sale'),
  K('aramco-2025', 'complex-transactions', 10167, 'Sale of non-controlling interest in Jafurah Midstream Gas Company'),
  K('emiratesnbd-2025', 'credit-losses', 10336, 'Expected Credit Loss allowance against Loans and receivables'),
  K('emiratesnbd-2025', 'related-parties', 10338, 'Related party transactions and balances'),
  K('eand-2025', 'revenue-recognition', 10553, 'Revenue recognition'),
  K('eand-2025', 'impairment-intangibles', 10554, 'Carrying value of cash generating units, including goodwill'),
  K('rbc-2025', 'credit-losses', 10745, 'Allowance for Credit Losses on Loans Categorized as Stage 1 and Stage 2'),
  K('rbc-2025', 'tax-uncertainty', 10745, 'Uncertain Tax Positions'),
  K('bhp-2025', 'impairment-assets', 11205, 'Carrying value of property, plant and equipment'),
  K('bhp-2025', 'provisions-litigation', 11205, 'Closure and rehabilitation provisions'),
  K('bhp-2025', 'provisions-litigation', 11206, 'Samarco dam failure provisions recognised and the contingent liabilities disclosed'),
  K('cba-2025', 'credit-losses', 12468, 'Provisions for loan impairment'),
  K('cba-2025', 'provisions-litigation', 12469, 'Provisions for ongoing class actions'),
  K('cba-2025', 'it-controls', 12470, 'Operation of financial reporting Information Technology (IT) systems and controls'),
];

/* ---------- materiality the auditors disclosed (ISA (UK) 700, Dutch and KSA reports) ---------- */
export const MATERIALITY: MaterialityCase[] = [
  { report: 'bp-2025', currency: 'USD', overall: 700e6, prior: 800e6, benchmark: 'cash-flow', basis: 'Cash flow from operations (2.9%) and underlying replacement cost profit before interest and tax (3.6%)',
    pct: 0.029, performancePct: 0.65, threshold: 35e6, parent: { pct: 0.006, basis: 'net assets' }, page: 4849 },
  { report: 'unilever-2025', currency: 'EUR', overall: 500e6, prior: 500e6, benchmark: 'profit', basis: 'Normalised profit before tax from continuing operations (€8,946m)',
    pct: 0.0559, performancePct: 0.75, threshold: 25e6, parent: { pct: 0.0035, basis: 'total assets' }, page: 5216 },
  { report: 'astrazeneca-2025', currency: 'USD', overall: 620e6, prior: 500e6, benchmark: 'profit', basis: 'Profit before tax adding back intangible impairments and contingent-consideration fair value and discount unwind',
    pct: 0.05, performancePct: 0.75, parent: { pct: 0.004, basis: 'net assets' }, page: 5503 },
  { report: 'gsk-2025', currency: 'GBP', overall: 350e6, prior: 300e6, benchmark: 'profit', basis: 'Profit before tax 4.86% · core profit before tax 3.37% · revenue 1.09% · operating cash flow 4.81%',
    pct: 0.0486, performancePct: 0.70, threshold: 15e6, page: 5800 },
  { report: 'hsbc-2025', currency: 'USD', overall: 1.55e9, prior: 1.5e9, benchmark: 'profit', basis: 'Profit before tax excluding notable items',
    pct: 0.05, performancePct: 0.75, threshold: 77.5e6, parent: { pct: 0.0075, basis: 'total assets (capped at 95% of group materiality)' }, page: 6205 },
  { report: 'airbus-2023', currency: 'EUR', overall: 292e6, prior: 281e6, benchmark: 'ebit', basis: 'EBIT Adjusted', pct: 0.05, threshold: 15e6, page: 7375 },
  { report: 'aramco-2025', currency: 'SAR', overall: 26.25e9, prior: 30.0e9, benchmark: 'profit', basis: 'A percentage of income before income taxes and zakat — SAR 702,860m in note 8 (p. 10202), so 3.7%',
    pct: 0.0373, threshold: 1.88e9, page: 10162 },
];

/* ---------- themes: what they are, the statement lines they touch, the pattern the reports share ---------- */
export type ThemeInfo = { ar: string; en: string; lines: string[]; why: string; procedures: string[] };
export const THEMES: Record<Theme, ThemeInfo> = {
  'revenue-deductions': { ar: 'خصومات الإيراد والحوافز والمرتجعات', en: 'Rebates, trade spend and price reductions', lines: ['revenue', 'accruals', 'receivables'],
    why: 'تُطرح الخصومات والحوافز والمرتجعات من الإيراد عند البيع بتقدير يعتمد على معدلات الاستخدام والمطالبات المتوقعة؛ التقدير معقد وعرضة للتحيز ويؤثر مباشرة في الإيراد.',
    procedures: ['اختبار تصميم وتشغيل الضوابط على احتساب الاستحقاقات', 'بناء توقع مستقل للاستحقاق من المطالبات الفعلية والاتجاهات التاريخية', 'مقارنة تقديرات الفترة السابقة بما سُدد فعلاً لاختبار دقة التقدير وتحيزه', 'فحص المطالبات والتسويات اللاحقة لتاريخ الإقفال'] },
  'revenue-recognition': { ar: 'الاعتراف بالإيراد', en: 'Revenue recognition', lines: ['revenue', 'contractLiab', 'receivables'],
    why: 'تحديد التزامات الأداء وسعر المعاملة وتوقيت انتقال السيطرة (أو نسبة الإنجاز في العقود طويلة الأجل) يتطلب حكماً مهنياً، ومعالجة حجم كبير من المعاملات عبر أنظمة معقدة.',
    procedures: ['قراءة عينة من العقود وتحديد شروطها المؤثرة في الاعتراف (IFRS 15)', 'اختبار الضوابط الآلية وواجهات الأنظمة مع مختصي تقنية المعلومات', 'مطابقة عينة من المعاملات مع العقود والفواتير وإثبات التسليم', 'اختبار القطع وتقدير التكاليف حتى الإنجاز في العقود على مدى زمني'] },
  'credit-losses': { ar: 'الخسائر الائتمانية المتوقعة', en: 'Expected credit losses', lines: ['receivables'],
    why: 'مخصص الخسائر الائتمانية تقدير مستقبلي يعتمد على سيناريوهات اقتصادية وأوزانها وتصنيف المراحل والتعديلات النوعية على مخرجات النماذج.',
    procedures: ['اختبار ضوابط النماذج والبيانات والسيناريوهات وأوزانها', 'تقييم معقولية المتغيرات الاقتصادية المستقبلية مقابل مصادر خارجية', 'فحص عينة من التصنيف إلى المراحل والتقييم الفردي للعملاء', 'تقييم التعديلات النوعية والإفصاحات (IFRS 9 / IFRS 7)'] },
  'tax-uncertainty': { ar: 'الموقف الضريبي والزكوي غير المؤكد', en: 'Uncertain tax and zakat positions', lines: ['zakatPayable', 'zakatExpense', 'provisions'],
    why: 'تقدير ما إذا كان الموقف الضريبي سيُقبل وقياس أثره يعتمد على تفسير أنظمة معقدة وعلى مراسلات الجهات الضريبية وأحكام القضاء.',
    procedures: ['إشراك مختصي الضرائب والزكاة في تقييم الأسس الفنية للمواقف', 'فحص مراسلات الهيئة والربوط والاعتراضات', 'الحصول على مصادقات من المستشارين القانونيين الخارجيين', 'تقييم الإفصاحات (IFRIC 23 / IAS 12 / متطلبات الزكاة)'] },
  'impairment-intangibles': { ar: 'انخفاض الشهرة والأصول غير الملموسة', en: 'Goodwill and intangible impairment', lines: ['intangibles', 'impairment'],
    why: 'القيمة القابلة للاسترداد تعتمد على توقعات تدفقات نقدية ومعدلات نمو وخصم حساسة؛ تغير بسيط في الافتراض قد يغيّر نتيجة الاختبار.',
    procedures: ['تقييم منهجية التقييم والنماذج بمساعدة مختصي التقييم', 'مقارنة التوقعات بالموازنات المعتمدة والأداء الفعلي التاريخي', 'مقارنة معدلات الخصم والنمو بنطاق مستقل من بيانات السوق', 'تحليل الحساسية للافتراضات الرئيسة وتقييم الإفصاحات (IAS 36)'] },
  'impairment-assets': { ar: 'انخفاض الأصول طويلة الأجل وتقييمها', en: 'Long-lived asset impairment and valuation', lines: ['ppe', 'rou', 'depreciation', 'impairment'],
    why: 'استرداد القيمة الدفترية للأصول الثابتة يعتمد على افتراضات الأسعار والكميات والتكاليف والأعمار والقيم المتبقية وتوقيت بدء الاستهلاك.',
    procedures: ['تقييم تحديد وحدات توليد النقد ومؤشرات الانخفاض', 'اختبار الافتراضات مقابل الخطط المعتمدة وبيانات السوق', 'فحص بدء الاستهلاك والأعمار الإنتاجية والقيم المتبقية', 'فحص تصنيف الأصول المحتفظ بها للبيع وقياسها (IFRS 5)'] },
  'provisions-litigation': { ar: 'المخصصات والقضايا والالتزامات المحتملة', en: 'Provisions, litigation and contingencies', lines: ['provisions', 'accruals'],
    why: 'تقدير احتمال الخسارة ومبلغها في القضايا والضمانات والاستدعاءات وإعادة التأهيل يعتمد على أحكام الإدارة ورأي المستشارين القانونيين.',
    procedures: ['قراءة محاضر مجلس الإدارة واللجان', 'الحصول على خطابات مباشرة من المستشارين القانونيين الداخليين والخارجيين', 'مقارنة افتراضات التقدير بالتسويات والمدفوعات الفعلية', 'تقييم كفاية الإفصاح عن الالتزامات المحتملة (IAS 37)'] },
  'fair-value': { ar: 'القيمة العادلة للأدوات غير المتداولة', en: 'Level 3 fair value and derivatives', lines: ['investments'],
    why: 'تقييم الأدوات التي لا سعر سوق لها يعتمد على مدخلات غير قابلة للملاحظة، ما يجعل التقدير ذاتياً وعرضة للتحيز.',
    procedures: ['إعادة تقييم عينة بشكل مستقل بمساعدة مختصي التقييم', 'اختبار المدخلات غير القابلة للملاحظة مقابل معاملات حديثة وبيانات خارجية', 'تقييم تصنيف مستويات القيمة العادلة (IFRS 13)', 'تقييم الإفصاح عن الحساسية'] },
  actuarial: { ar: 'الالتزامات الاكتوارية ومنافع الموظفين', en: 'Actuarial liabilities and employee benefits', lines: ['eosb'],
    why: 'قياس الالتزام يعتمد على افتراضات الخصم والتضخم والوفيات أو أنماط المطالبات، وتغيرها يؤثر جوهرياً في المبلغ.',
    procedures: ['تقييم كفاءة الخبير الاكتواري واستقلاله', 'مقارنة الافتراضات بنطاق معقول مستقل', 'اختبار البيانات الأساسية (الموظفون والرواتب أو المطالبات)', 'تطوير تقدير مستقل ومقارنته بتقدير الإدارة (IAS 19)'] },
  'it-controls': { ar: 'أنظمة تقنية المعلومات وضوابطها', en: 'IT systems and controls', lines: [],
    why: 'التقرير المالي يعتمد على أنظمة آلية تعالج حجماً كبيراً من المعاملات؛ ضعف صلاحيات الدخول أو إدارة التغيير يهدد سلامة البيانات.',
    procedures: ['اختبار الضوابط العامة لتقنية المعلومات: الدخول وإدارة التغيير والتشغيل', 'اختبار الضوابط الآلية والواجهات بين الأنظمة', 'تقييم أثر أي قصور في الضوابط على نطاق الإجراءات الأساسية'] },
  'complex-transactions': { ar: 'المعاملات المعقدة وغير المعتادة', en: 'Complex and unusual transactions', lines: ['investments'],
    why: 'الاستحواذات والانفصالات وبيع الحصص تتطلب أحكاماً في التصنيف والقياس (السيطرة، القيمة العادلة، الحصص غير المسيطرة).',
    procedures: ['قراءة الاتفاقيات وتقييم جوهرها الاقتصادي', 'تقييم المعالجة المحاسبية مع المختصين الفنيين', 'التحقق من المتحصلات والقيم الدفترية في تاريخ المعاملة', 'تقييم الإفصاحات (IFRS 3 / IFRS 10)'] },
  inventory: { ar: 'المخزون وتقييمه', en: 'Inventory existence and valuation', lines: ['inventory', 'cogs'],
    why: 'تقييم المخزون يعتمد على طريقة التكلفة وافتراضات الهوامش والتخفيضات والفاقد، ويعالَج آلياً بحجم بيانات كبير.',
    procedures: ['حضور الجرد في مواقع مختارة', 'بناء توقع مستقل لمدخلات طريقة التقييم', 'مطابقة عينة مع فواتير الموردين والمدفوعات', 'اختبار صافي القيمة القابلة للتحقق (IAS 2)'] },
  'fraud-override': { ar: 'تجاوز الإدارة للضوابط', en: 'Management override of controls', lines: [],
    why: 'خطر تجاوز الإدارة للضوابط قائم في كل منشأة (ISA 240) ويتركز في القيود اليدوية والتقديرات والمعاملات غير المعتادة.',
    procedures: ['اختبار القيود اليومية والتسويات بمعايير مخاطر', 'مراجعة التقديرات بحثاً عن تحيز', 'تقييم المبرر التجاري للمعاملات غير المعتادة'] },
  climate: { ar: 'أثر المناخ وتحول الطاقة', en: 'Climate change and energy transition', lines: ['ppe', 'provisions'],
    why: 'افتراضات أسعار الطاقة والكربون وأعمار الأصول تؤثر في الانخفاض والمخصصات والإفصاحات.',
    procedures: ['تقييم اتساق افتراضات المناخ بين الخطط والقوائم', 'تحليل حساسية الانخفاض لسيناريوهات التحول', 'فحص الإفصاحات المتعلقة بالمناخ'] },
  'parent-investments': { ar: 'استثمارات الشركة الأم في التابعة', en: 'Parent-company investments in subsidiaries', lines: ['investments'],
    why: 'في القوائم المنفصلة للشركة القابضة تمثل الاستثمارات معظم الأصول، فيؤثر أي انخفاض فيها في الاحتياطيات القابلة للتوزيع.',
    procedures: ['مقارنة القيمة الدفترية بصافي أصول التابعة أو القيمة السوقية', 'تقييم مؤشرات الانخفاض', 'التحقق من الاحتياطيات القابلة للتوزيع'] },
  'related-parties': { ar: 'الأطراف ذات العلاقة', en: 'Related parties', lines: ['partners'],
    why: 'التعاملات مع الجهات الحكومية والأطراف ذات العلاقة جوهرية ومتطلبات إفصاحها محددة (IAS 24).',
    procedures: ['حصر الأطراف ذات العلاقة ومقارنتها بالسجلات', 'فحص الشروط والموافقات', 'تقييم الإفصاح عن التركزات'] },
};

export const SECTOR_AR: Record<Sector, string> = { tech: 'التقنية', retail: 'التجزئة', fmcg: 'السلع الاستهلاكية والأغذية', banking: 'البنوك', insurance: 'التأمين', pharma: 'الأدوية',
  energy: 'الطاقة', auto: 'السيارات', telecom: 'الاتصالات', mining: 'التعدين', industrial: 'الصناعة', conglomerate: 'المجموعات المتنوعة' };

/* ---------- queries ---------- */
const REPORT: Record<string, Report> = Object.fromEntries(REPORTS.map((r) => [r.id, r]));
export const reportOf = (id: string) => REPORT[canonicalReferenceId(id)];

export type KamRow = Kam & { company: string; fy: string; country: string; sector: Sector; standard: Report['standard']; sourceAuditLabel?: string; auditor: string; themeAr: string };
const row = (k: Kam): KamRow => { const r = REPORT[k.report]; return { ...k, company: r.company, fy: r.fy, country: r.country, sector: r.sector, standard: r.standard, ...(r.sourceAuditLabel ? { sourceAuditLabel: r.sourceAuditLabel } : {}), auditor: r.auditor, themeAr: THEMES[k.theme].ar }; };

export type KamFilter = { theme?: Theme | ''; sector?: Sector | ''; standard?: Standard | ''; sourceAuditLabel?: string; q?: string };
export function kamLibrary(f: KamFilter = {}): KamRow[] {
  const q = (f.q || '').trim().toLowerCase();
  return KAMS.map(row).filter((k) => (!f.theme || k.theme === f.theme) && (!f.sector || k.sector === f.sector) && (!f.standard || k.standard === f.standard)
    && (!f.sourceAuditLabel || (k.sourceAuditLabel ?? k.standard) === f.sourceAuditLabel)
    && (!q || [k.title, k.company, k.auditor, k.themeAr, THEMES[k.theme].en].some((s) => s.toLowerCase().includes(q))));
}

/** Theme counts across the bundle, most frequent first, with the sectors where each appears. */
export function themeStats() {
  return (Object.keys(THEMES) as Theme[]).map((t) => {
    const ks = KAMS.filter((k) => k.theme === t);
    return { theme: t, ar: THEMES[t].ar, en: THEMES[t].en, count: ks.length, companies: new Set(ks.map((k) => REPORT[k.report].company)).size,
      sectors: [...new Set(ks.map((k) => REPORT[k.report].sector))] };
  }).filter((s) => s.count > 0).sort((a, b) => b.count - a.count || a.ar.localeCompare(b.ar));
}

/** Sector from a free-text activity (Arabic or English), for choosing the closest precedents. */
export function sectorFromActivity(activity: string): Sector | '' {
  const t = (activity || '').toLowerCase();
  const map: [Sector, RegExp][] = [
    ['banking', /بنك|مصرف|تمويل|bank|financ|lending/], ['insurance', /تأمين|تكافل|insur|reinsur/], ['pharma', /دواء|أدوية|صيدل|pharma|drug|biotech/],
    ['energy', /نفط|بترول|غاز|طاقة|oil|gas|energy|petro/], ['mining', /تعدين|منجم|معادن|mining|mineral/], ['telecom', /اتصالات|telecom|mobile network/],
    ['auto', /سيار|مركبات|auto|vehicle|motor/], ['tech', /تقني|برمج|برامج|حاسب|software|tech|cloud|saas|electronic/],
    ['fmcg', /أغذية|غذائ|لحوم|أغنام|مواشي|ألبان|مشروبات|استهلاك|food|meat|dairy|beverage|consumer|fmcg/], ['retail', /تجزئة|متجر|سوبر|retail|store|e-?commerce/],
    ['industrial', /مقاولات|إنشاء|صناع|مصنع|طيران|construct|manufactur|industrial|aero/],
  ];
  return map.find(([, re]) => re.test(t))?.[0] ?? '';
}

/** How often each theme is a key/critical audit matter in the reports of this sector — the share of the sector's reports carrying it;
    for a sector the bundle does not cover, the share under the same standard, else across all reports. `exclude` leaves one report
    out, so the bundle can test itself without seeing the answer (the replay measured the plain sector share ranking best). */
export function themePrior(opts: { sector?: Sector | ''; standard?: Standard | ''; exclude?: string } = {}): Record<Theme, number> {
  const reps = REPORTS.filter((r) => r.id !== (opts.exclude ? canonicalReferenceId(opts.exclude) : undefined) && KAMS.some((k) => k.report === r.id));
  const has = (r: Report, t: Theme) => KAMS.some((k) => k.report === r.id && k.theme === t);
  const inSector = reps.filter((r) => opts.sector && r.sector === opts.sector), inStd = reps.filter((r) => opts.standard && r.standard === opts.standard);
  const pool = inSector.length ? inSector : inStd.length ? inStd : reps;
  const out = {} as Record<Theme, number>;
  for (const t of Object.keys(THEMES) as Theme[]) out[t] = pool.length ? Math.round((pool.filter((r) => has(r, t)).length / pool.length) * 100) / 100 : 0;
  return out;
}
/** How many matters reports of a standard carry: PCAOB reports about two critical audit matters, ISA reports three or more. */
export function typicalKamCount(standard?: Standard | '', ukStyle = false): number {
  if (ukStyle) return 4;
  return standard === 'PCAOB' ? 2 : 3;
}

export type Precedent = { theme: Theme; ar: string; why: string; procedures: string[]; examples: KamRow[] };
/** Real KAMs that match a statement line of the engagement — same sector first, then the rest. */
export function precedentsFor(lineKey: string, opts: { sector?: Sector | ''; limit?: number } = {}): Precedent[] {
  const limit = opts.limit ?? 3;
  return (Object.keys(THEMES) as Theme[]).filter((t) => THEMES[t].lines.includes(lineKey)).map((t) => {
    const all = KAMS.filter((k) => k.theme === t).map(row);
    const ranked = [...all.filter((k) => opts.sector && k.sector === opts.sector), ...all.filter((k) => !opts.sector || k.sector !== opts.sector)];
    return { theme: t, ar: THEMES[t].ar, why: THEMES[t].why, procedures: THEMES[t].procedures, examples: ranked.slice(0, limit) };
  }).filter((p) => p.examples.length).sort((a, b) => KAMS.filter((k) => k.theme === b.theme).length - KAMS.filter((k) => k.theme === a.theme).length);
}

/* ---------- materiality compared with disclosed practice ---------- */
const range = (xs: number[]) => (xs.length ? { min: Math.min(...xs), max: Math.max(...xs), n: xs.length } : null);
/** Observed ranges, computed from the disclosures (not hard-coded). */
export function materialityPractice() {
  const withPct = MATERIALITY.filter((m) => m.pct !== undefined);
  const profit = range(withPct.filter((m) => m.benchmark === 'profit' || m.benchmark === 'ebit').map((m) => m.pct!));
  const performance = range(MATERIALITY.filter((m) => m.performancePct !== undefined).map((m) => m.performancePct!));
  const threshold = range(MATERIALITY.filter((m) => m.threshold !== undefined).map((m) => Math.round((m.threshold! / m.overall) * 1000) / 1000));
  const parentAssets = range(MATERIALITY.filter((m) => m.parent).map((m) => m.parent!.pct));
  return { profit, performance, threshold, parentAssets, cases: MATERIALITY.map((m) => ({ ...m, company: REPORT[m.report].company, auditor: REPORT[m.report].auditor, fy: REPORT[m.report].fy })) };
}

export type MaterialityCheck = { key: 'rate' | 'performance' | 'trivial'; label: string; value: number; status: 'within' | 'below' | 'above' | 'no-precedent'; observed: string; note: string };
/** The engagement's choices against what auditors disclosed. Advisory: ISA 320 leaves the choice to professional judgement. */
export function checkMateriality(input: { benchmark: 'pbz' | 'revenue' | 'assets'; rate: number; performanceRate: number; trivialRate: number }): MaterialityCheck[] {
  const p = materialityPractice(), pct = (x: number) => `${Math.round(x * 1000) / 10}%`;
  /* compared to a tenth of a percentage point: amounts rounded to the nearest 100 must not flip 75% into «above» */
  const cmp = (x: number, r: { min: number; max: number } | null) => { const v = Math.round(x * 1000) / 1000;
    return (!r ? 'no-precedent' : v < r.min - 1e-9 ? 'below' : v > r.max + 1e-9 ? 'above' : 'within') as MaterialityCheck['status']; };
  const out: MaterialityCheck[] = [];
  if (input.benchmark === 'pbz') {
    const st = cmp(input.rate, p.profit);
    out.push({ key: 'rate', label: 'نسبة الأهمية من الربح', value: input.rate, status: st, observed: p.profit ? `${pct(p.profit.min)}–${pct(p.profit.max)} في ${p.profit.n} تقارير` : '—',
      note: st === 'within' ? 'ضمن ما أفصح عنه مراجعو الشركات العالمية على أساس الربح.' : st === 'above' ? 'أعلى من الممارسة المفصح عنها؛ وثّق مبرر النسبة (ISA 320.A8).' : 'أقل من الممارسة المفصح عنها؛ مقبول إن كان الخطر مرتفعاً، ووثّق السبب.' });
  } else if (input.benchmark === 'assets') {
    const st = cmp(input.rate, p.parentAssets);
    out.push({ key: 'rate', label: 'نسبة الأهمية من الموجودات', value: input.rate, status: st, observed: p.parentAssets ? `${pct(p.parentAssets.min)}–${pct(p.parentAssets.max)} (شركات قابضة)` : '—',
      note: st === 'above' ? 'المراجعون استخدموا الموجودات أساساً للشركات القابضة بنسب أقل؛ لمنشأة تشغيلية فضّل أساس الربح أو الإيراد متى كان مستقراً.' : 'ضمن نطاق أساس الموجودات المفصح عنه للشركات القابضة.' });
  } else {
    out.push({ key: 'rate', label: 'نسبة الأهمية من الإيراد', value: input.rate, status: 'no-precedent', observed: 'لم يعتمد أي تقرير في الحزمة الإيراد أساساً (GSK قارنت به: 1.09%)',
      note: 'الإيراد أساس مقبول حين يكون الربح متذبذباً أو قريباً من الصفر؛ وثّق سبب العدول عن أساس الربح.' });
  }
  const sp = cmp(input.performanceRate, p.performance);
  out.push({ key: 'performance', label: 'الأهمية التنفيذية', value: input.performanceRate, status: sp, observed: p.performance ? `${pct(p.performance.min)}–${pct(p.performance.max)} من الأهمية العامة` : '—',
    note: sp === 'within' ? 'ضمن الممارسة: 65% عند بيئة رقابة أضعف أو تحريفات سابقة، و75% عند بيئة مستقرة.' : sp === 'above' ? 'أعلى من الممارسة المفصح عنها (الحد الأعلى 75%).' : 'أدنى من الممارسة؛ مناسب إن كانت التحريفات السابقة كثيرة.' });
  const stt = cmp(input.trivialRate, p.threshold);
  out.push({ key: 'trivial', label: 'حد التحريفات الواضحة الضآلة', value: input.trivialRate, status: stt, observed: p.threshold ? `${pct(p.threshold.min)}–${pct(p.threshold.max)} من الأهمية العامة` : '—',
    note: stt === 'within' ? 'ضمن حد الإبلاغ للجنة المراجعة الذي أفصح عنه المراجعون.' : 'خارج حدود الإبلاغ المفصح عنها؛ راجع الحد مع المكلفين بالحوكمة.' });
  return out;
}

/** Headline numbers for the reference screen. */
export function summary() {
  const auditors = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  for (const k of KAMS) { const r = REPORT[k.report], label = r.sourceAuditLabel ?? r.standard; sourceCounts.set(label, (sourceCounts.get(label) || 0) + 1); }
  for (const r of REPORTS) { if (!r.auditor) continue; const f = /Ernst|EY/.test(r.auditor) ? 'EY' : /Pricewaterhouse|PwC/.test(r.auditor) ? 'PwC' : /KPMG/.test(r.auditor) ? 'KPMG' : /Deloitte/.test(r.auditor) ? 'Deloitte' : r.auditor; auditors.set(f, (auditors.get(f) || 0) + 1); }
  return { reports: REPORTS.length, pages: BUNDLE.pages, countries: new Set(REPORTS.map((r) => r.country)).size, kams: KAMS.length,
    sourceAuditStandards: [...sourceCounts].map(([label, count]) => ({ label, count })),
    pcaob: KAMS.filter((k) => REPORT[k.report].standard === 'PCAOB').length, isa: KAMS.filter((k) => REPORT[k.report].standard === 'ISA').length,
    materiality: MATERIALITY.length, sources: SOURCES.length, auditors: [...auditors.entries()].sort((a, b) => b[1] - a[1]) };
}

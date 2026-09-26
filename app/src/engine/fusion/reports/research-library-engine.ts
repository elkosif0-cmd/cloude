/* The global financial reports centre — the index page of the research bundle on Drive
   («global_financial_and_audit_research_bundle_extended_verified.pdf», as served by kosif-stable's
   /research/financial-reports): the official filing systems of the world's markets, the audit firms'
   transparency reports and the audit-oversight inspection findings, plus the annual reports it
   indexes; extended with the Saudi and Egyptian sources and the reports reviewed for KOSIF's own
   report design (docs/research/GLOBAL_ANNUAL_REPORTS_ar.md).
   benchmarkReport() checks a report pack against the elements global annual reports carry, and
   AUDIT_QUALITY maps the recurring inspection themes to the safeguard KOSIF applies for each. */

export type SourceKind = 'filings' | 'transparency' | 'oversight' | 'standards';
export type Source = { name: string; region: string; kind: SourceKind; url: string; origin: 'bundle' | 'kosif' };

const B = (name: string, region: string, kind: SourceKind, url: string): Source => ({ name, region, kind, url, origin: 'bundle' });
const K = (name: string, region: string, kind: SourceKind, url: string): Source => ({ name, region, kind, url, origin: 'kosif' });
export const SOURCES: Source[] = [
  B('SEC EDGAR', 'الولايات المتحدة', 'filings', 'https://www.sec.gov/edgar/searchedgar/companysearch.html'),
  B('SEC Financial Statement Data Sets', 'الولايات المتحدة', 'filings', 'https://www.sec.gov/dera/data/financial-statement-data-sets.html'),
  B('Companies House', 'المملكة المتحدة', 'filings', 'https://find-and-update.company-information.service.gov.uk/'),
  B('FCA National Storage Mechanism', 'المملكة المتحدة', 'filings', 'https://data.fca.org.uk/#/nsm/nationalstoragemechanism'),
  B('ESMA ESEF', 'الاتحاد الأوروبي', 'filings', 'https://registers.esma.europa.eu/publication/'),
  B('SEDAR+', 'كندا', 'filings', 'https://www.sedarplus.ca/'),
  B('ASIC Financial Reporting', 'أستراليا', 'filings', 'https://asic.gov.au/for-business/financial-reporting/'),
  B('PSE Edge', 'الفلبين', 'filings', 'https://edge.pse.com.ph/'),
  B('HKEXnews', 'هونغ كونغ', 'filings', 'https://www.hkexnews.hk/'),
  B('SGX Company Announcements', 'سنغافورة', 'filings', 'https://www.sgx.com/securities/company-announcements'),
  B('JSE SENS', 'جنوب أفريقيا', 'filings', 'https://senspdf.jse.co.za/'),
  B('Saudi Exchange Tadawul', 'السعودية', 'filings', 'https://www.saudiexchange.sa/'),
  B('ADX', 'الإمارات', 'filings', 'https://www.adx.ae/'),
  B('DFM', 'الإمارات', 'filings', 'https://www.dfm.ae/'),
  B('Euronext', 'أوروبا', 'filings', 'https://live.euronext.com/en/products/equities/company-news'),
  B('Japan EDINET', 'اليابان', 'filings', 'https://disclosure2.edinet-fsa.go.jp/'),
  B('Korea DART', 'كوريا الجنوبية', 'filings', 'https://englishdart.fss.or.kr/'),
  B('India MCA', 'الهند', 'filings', 'https://www.mca.gov.in/'),
  B('India SEBI', 'الهند', 'filings', 'https://www.sebi.gov.in/'),
  B('Brazil CVM', 'البرازيل', 'filings', 'https://www.gov.br/cvm/pt-br'),
  B('Deloitte Transparency Reports', 'جودة المراجعة', 'transparency', 'https://www.deloitte.com/global/en/about/story/impact/transparency-reports.html'),
  B('PwC Transparency Reports', 'جودة المراجعة', 'transparency', 'https://www.pwc.com/gx/en/about/corporate-governance/transparency-report.html'),
  B('EY Transparency Report', 'جودة المراجعة', 'transparency', 'https://www.ey.com/en_gl/about-us/transparency-report'),
  B('KPMG Transparency Reports', 'جودة المراجعة', 'transparency', 'https://kpmg.com/xx/en/home/about/governance/transparency-reports.html'),
  B('IAASB Publications', 'المعايير', 'standards', 'https://www.iaasb.org/publications'),
  B('IESBA Publications', 'الأخلاقيات', 'standards', 'https://www.ethicsboard.org/publications'),
  B('PCAOB Inspections', 'الرقابة — الولايات المتحدة', 'oversight', 'https://pcaobus.org/oversight/inspections'),
  B('FRC Reviews', 'الرقابة — المملكة المتحدة', 'oversight', 'https://www.frc.org.uk/library/annual-reports-and-reviews/'),
  B('IFIAR Inspection Findings', 'الرقابة — عالمي', 'oversight', 'https://www.ifiar.org/activities/inspection-findings/'),
  B('PCAOB Firm Reports', 'الرقابة — الولايات المتحدة', 'oversight', 'https://pcaobus.org/oversight/inspections/firm-inspection-reports'),
  K('هيئة السوق المالية (CMA)', 'السعودية', 'filings', 'https://cma.org.sa'),
  K('الهيئة السعودية للمراجعين والمحاسبين (SOCPA)', 'السعودية', 'standards', 'https://socpa.org.sa'),
  K('البورصة المصرية (EGX)', 'مصر', 'filings', 'https://www.egx.com.eg'),
  K('الهيئة العامة للرقابة المالية (FRA)', 'مصر', 'standards', 'https://fra.gov.eg'),
  K('IFRS Foundation — Issued standards', 'المعايير', 'standards', 'https://www.ifrs.org/issued-standards/'),
];
export const KIND_AR: Record<SourceKind, string> = { filings: 'الإفصاح والأسواق', transparency: 'تقارير الشفافية', oversight: 'الرقابة على جودة المراجعة', standards: 'المعايير والأخلاقيات' };

export type ReferenceReport = { company: string; year: string; framework: string; origin: 'bundle' | 'kosif'; highlight?: string; evidence: string; learn: string[] };
export const REFERENCE_REPORTS: ReferenceReport[] = [
  { company: 'Amazon', year: '2023', framework: 'US GAAP (SEC)', origin: 'bundle', highlight: 'الإيرادات 575 مليار دولار · الدخل التشغيلي 36.9 مليار · التدفق النقدي الحر 35.5 مليار', evidence: 'التقرير السنوي 2023 · ص3 (فهرس الحزمة)',
    learn: ['رسالة الإدارة تبدأ بالمؤشرات الثلاثة: الإيراد والربح التشغيلي والتدفق النقدي الحر', 'تعريف التدفق النقدي الحر ومطابقته مع التدفق من التشغيل'] },
  { company: 'Amazon', year: '2024', framework: 'US GAAP (SEC)', origin: 'bundle', evidence: 'فهرس الحزمة · ص1', learn: ['المقارنة عبر السنوات لنفس المؤشرات بنفس التعريف'] },
  { company: 'Apple', year: '2024', framework: 'US GAAP (SEC)', origin: 'bundle', evidence: 'فهرس الحزمة · ص1', learn: ['نموذج 10-K: الأعمال، عوامل المخاطر، تحليل الإدارة، القوائم، الضوابط الداخلية'] },
  { company: 'Apple', year: '2020', framework: 'US GAAP (SEC)', origin: 'bundle', evidence: 'فهرس الحزمة · ص1', learn: ['مقارنة طولية مع 2024 لقياس الاتساق في العرض'] },
  { company: 'المراعي', year: '2025', framework: 'IFRS المعتمدة في المملكة', origin: 'kosif', evidence: 'docs/research/GLOBAL_ANNUAL_REPORTS_ar.md', learn: ['تقرير متكامل (سنوي + استدامة)', '«السنة في لمحة» قبل القوائم'] },
  { company: 'نستله', year: '2025', framework: 'IFRS (IASB)', origin: 'kosif', evidence: 'docs/research/GLOBAL_ANNUAL_REPORTS_ar.md', learn: ['السياسة المحاسبية داخل إيضاح البند نفسه', 'إفصاح مسبق عن أثر IFRS 18'] },
  { company: 'أرامكو السعودية', year: '2025', framework: 'IFRS المعتمدة في المملكة', origin: 'kosif', evidence: 'docs/research/GLOBAL_ANNUAL_REPORTS_ar.md', learn: ['مؤشرات: التدفق النقدي الحر، نسبة المديونية، العائد على متوسط رأس المال المستخدم'] },
];

/* the elements a global annual report carries, and whether a KOSIF report pack has each */
export type PackFlags = { highlights: boolean; mdna: boolean; statements: boolean; cashFlow: boolean; notes: boolean; ratios: boolean; kams: boolean; opinion: boolean; managementLetter: boolean; comparatives: boolean };
export const REPORT_ELEMENTS: { key: keyof PackFlags | 'segments' | 'sustainability' | 'controls'; ar: string; seenIn: string }[] = [
  { key: 'highlights', ar: 'السنة في لمحة: المؤشرات الرئيسية مع المقارنة', seenIn: 'Amazon · المراعي · أرامكو' },
  { key: 'mdna', ar: 'تقرير الإدارة وتحليلها (MD&A)', seenIn: 'Apple 10-K · Amazon' },
  { key: 'statements', ar: 'القوائم الأساسية بعرض IFRS 18', seenIn: 'نستله · المراعي' },
  { key: 'cashFlow', ar: 'قائمة التدفقات النقدية والتدفق النقدي الحر', seenIn: 'Amazon · أرامكو' },
  { key: 'comparatives', ar: 'أرقام المقارنة للسنة السابقة', seenIn: 'جميع التقارير' },
  { key: 'notes', ar: 'إيضاحات لكل بند مع السياسات والتقديرات', seenIn: 'نستله' },
  { key: 'ratios', ar: 'تحليل النسب والمؤشرات المالية', seenIn: 'أرامكو' },
  { key: 'opinion', ar: 'تقرير المراجع المستقل ورأيه', seenIn: 'جميع التقارير' },
  { key: 'kams', ar: 'الأمور الرئيسية للمراجعة (ISA 701)', seenIn: 'المراعي (KPMG)' },
  { key: 'managementLetter', ar: 'ملاحظات الرقابة الداخلية وخطاب الإدارة', seenIn: 'Apple (ICFR)' },
  { key: 'segments', ar: 'المعلومات القطاعية (IFRS 8)', seenIn: 'Amazon · Apple · نستله' },
  { key: 'sustainability', ar: 'الاستدامة والمناخ (IFRS S1/S2)', seenIn: 'المراعي (تقرير متكامل)' },
  { key: 'controls', ar: 'تقرير عن فعالية الرقابة الداخلية', seenIn: 'Apple · Amazon (SEC)' },
];
export function benchmarkReport(flags: Partial<PackFlags>) {
  const rows = REPORT_ELEMENTS.map((e) => ({ ...e, has: (flags as Record<string, boolean>)[e.key] === true }));
  return { rows, covered: rows.filter((r) => r.has).length, total: rows.length, gaps: rows.filter((r) => !r.has).map((r) => r.ar) };
}

/* recurring themes of audit-oversight inspections (IFIAR, PCAOB, FRC) and the safeguard KOSIF applies */
export const AUDIT_QUALITY: { theme: string; standard: string; safeguard: string }[] = [
  { theme: 'التقديرات المحاسبية والقيمة العادلة (ومنها الخسائر الائتمانية المتوقعة)', standard: 'ISA 540', safeguard: 'حاسبة الخسائر الائتمانية بمصفوفة الأعمار، ومصادر عدم التأكد في جاهزية الإفصاح' },
  { theme: 'الاعتراف بالإيراد والقطع', standard: 'ISA 240 / IFRS 15', safeguard: 'خطر الغش المفترض في الإيراد، وطلب فواتير القطع حول نهاية السنة' },
  { theme: 'اختبار الضوابط الداخلية والاعتماد عليها', standard: 'ISA 330', safeguard: 'مرحلة «فهم المنشأة والرقابة» في برنامج المراجعة' },
  { theme: 'كفاية الأدلة ومستوى الشك المهني', standard: 'ISA 500', safeguard: 'لا يكتمل بند إلا بمستند مقبول من جولات المراجعة، ويتحقق المحرك من بيانات المستند' },
  { theme: 'مراجعة جودة الارتباط والاعتماد', standard: 'ISQM 1 / ISA 220', safeguard: 'الرأي مشتق آلياً ولا يصدر إلا باعتماد الشريك' },
  { theme: 'الاستمرارية', standard: 'ISA 570', safeguard: 'مؤشرات حقوق الملكية السالبة وعجز رأس المال العامل في المحرك' },
  { theme: 'تقييم التحريفات غير المصححة', standard: 'ISA 450', safeguard: 'أثر القيود غير المعتمدة مقابل الأهمية النسبية قبل الرأي' },
];

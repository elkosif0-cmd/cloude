/* sector packs (FOUNDATION §3.7, PRODUCT_MANDATE P3): what a company created under a sector receives, so the same capability
   behaves by sector and not just by label — its chart of accounts, cost centers, units, warehouses, the helper tools installed,
   the KPIs it is judged by, and (for meat) the posting rule of a cutting run (stock/cutting-run-engine).
   Every pack starts from the same base chart the books screen offers; a sector adds what its own operations post to.
   `depth` is honest about how far a pack goes today: 'deep' packs carry sector-specific postings, 'base' packs carry
   the sector's structure (accounts, cost centers, units) and are deepened wave by wave. */

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type PackAccount = readonly [code: string, name: string, type: AccountType];
export type SectorPack = {
  id: string;
  depth: 'deep' | 'base';
  accounts: readonly PackAccount[];
  costCenters: readonly string[];
  units: readonly string[];
  warehouses: readonly string[];
  /** capability ids of helper tools installed for the company (they must exist in the registry) */
  tools: readonly string[];
  kpis: readonly string[];
};

export const BASE_ACCOUNTS: readonly PackAccount[] = Object.freeze([
  ['1100', 'النقدية والبنوك', 'asset'], ['1200', 'الذمم المدينة', 'asset'], ['1300', 'المخزون', 'asset'], ['1400', 'ضريبة القيمة المضافة — مدخلات', 'asset'],
  ['2100', 'الذمم الدائنة (الموردون)', 'liability'], ['2200', 'ضريبة القيمة المضافة — مخرجات', 'liability'], ['3000', 'رأس المال', 'equity'], ['3100', 'الأرباح المبقاة', 'equity'],
  ['4000', 'إيرادات المبيعات', 'revenue'], ['5000', 'تكلفة المبيعات', 'expense'], ['6100', 'الرواتب والأجور', 'expense'], ['6200', 'الإيجار', 'expense'], ['6300', 'مصروفات تشغيلية أخرى', 'expense'],
] as const);

const pack = (p: Omit<SectorPack, 'accounts'> & { accounts: readonly PackAccount[] }): SectorPack => Object.freeze({ ...p, accounts: Object.freeze([...BASE_ACCOUNTS, ...p.accounts]) });

export const SECTOR_PACKS: Readonly<Record<string, SectorPack>> = Object.freeze({
  meat: pack({
    id: 'meat', depth: 'deep',
    accounts: [
      ['1310', 'مخزون الذبائح والحيوانات الحية', 'asset'], ['1320', 'مخزون القطع الجاهزة', 'asset'], ['1330', 'مخزون المنتجات الثانوية', 'asset'],
      ['1340', 'مواد التعبئة والتغليف', 'asset'], ['4100', 'إيرادات المنتجات الثانوية والجلود', 'revenue'],
      ['5100', 'هدر التقطيع غير الطبيعي', 'expense'], ['5200', 'تكلفة التعبئة والتغليف', 'expense'], ['6400', 'الذبح والتبريد والنقل المبرد', 'expense'],
    ],
    costCenters: ['الاستلام والذبح', 'التقطيع والتحويل', 'التعبئة والتغليف', 'التخزين المبرد', 'البيع والتوصيل'],
    units: ['كجم', 'رأس', 'ذبيحة', 'قطعة', 'كرتون'],
    warehouses: ['ثلاجة الذبائح', 'ثلاجة القطع الجاهزة', 'المجمد', 'منطقة التعبئة'],
    tools: ['carcass', 'yieldlab', 'purchasing', 'inventory', 'ptree'],
    kpis: ['مردود الذبيحة (Yield %)', 'تكلفة الكيلو لكل قطعة', 'نسبة الهدر', 'هامش القطعة', 'أيام بقاء المخزون المبرد'],
  }),
  health: pack({
    id: 'health', depth: 'deep',
    accounts: [['1210', 'ذمم شركات التأمين وجهات الدفع', 'asset'], ['1360', 'مخزون الصيدلية والمستلزمات الطبية', 'asset'], ['2150', 'أتعاب وعمولات الأطباء المستحقة', 'liability'],
      ['4010', 'إيرادات العيادات الخارجية', 'revenue'], ['4020', 'إيرادات التنويم والعمليات', 'revenue'], ['4030', 'إيرادات المختبر والأشعة', 'revenue'], ['4040', 'إيرادات الصيدلية', 'revenue'],
      ['5110', 'رفض المطالبات وتسويات التأمين', 'expense'], ['5210', 'أتعاب وعمولات الأطباء', 'expense'], ['5220', 'تكلفة الأدوية والمستلزمات المصروفة', 'expense']],
    costCenters: ['العيادات الخارجية', 'الطوارئ', 'التنويم', 'العمليات', 'المختبر', 'الأشعة', 'الصيدلية'],
    units: ['زيارة', 'يوم تنويم', 'إجراء', 'تحليل', 'عبوة'], warehouses: ['مستودع الصيدلية', 'مستودع المستلزمات'],
    tools: ['purchasing', 'inventory'], kpis: ['نسبة رفض المطالبات', 'تكلفة الحالة', 'إيراد السرير', 'أعمار ذمم الجهات'],
  }),
  hospitality: pack({
    id: 'hospitality', depth: 'base',
    accounts: [['2300', 'ودائع ودفعات الحجوزات المقدمة', 'liability'], ['2160', 'عمولات قنوات الحجز المستحقة', 'liability'], ['4050', 'إيرادات الغرف', 'revenue'], ['4060', 'إيرادات الأغذية والمشروبات', 'revenue'], ['5120', 'عمولات قنوات الحجز', 'expense']],
    costCenters: ['الغرف', 'الأغذية والمشروبات', 'التدبير الفندقي', 'الصيانة', 'الاستقبال'],
    units: ['ليلة', 'غرفة', 'وجبة'], warehouses: ['مخزن الأغذية', 'مخزن التدبير الفندقي'], tools: ['purchasing', 'inventory'],
    kpis: ['نسبة الإشغال', 'متوسط سعر الغرفة (ADR)', 'إيراد الغرفة المتاحة (RevPAR)'],
  }),
  construction: pack({
    id: 'construction', depth: 'base',
    accounts: [['1220', 'محتجزات لدى العملاء', 'asset'], ['1350', 'أعمال تحت التنفيذ (WIP)', 'asset'], ['2310', 'محتجزات مقاولي الباطن', 'liability'], ['2320', 'دفعات مقدمة من العملاء', 'liability'],
      ['4070', 'إيرادات العقود (المستخلصات)', 'revenue'], ['5130', 'تكاليف مقاولي الباطن', 'expense'], ['5140', 'تكاليف المواد بالموقع', 'expense']],
    costCenters: ['المشروعات', 'المعدات', 'الإدارة العامة'], units: ['م²', 'م³', 'طن', 'ساعة معدة', 'بند'], warehouses: ['مخزن الموقع', 'المخزن الرئيسي'],
    tools: ['purchasing', 'inventory'], kpis: ['نسبة الإنجاز', 'هامش المشروع المتوقع', 'المحتجزات القائمة'],
  }),
  digital: pack({
    id: 'digital', depth: 'base',
    accounts: [['2400', 'إيرادات مؤجلة (Retainer مقدّم)', 'liability'], ['2170', 'مستحقات المنصات الإعلانية', 'liability'], ['4080', 'إيرادات إدارة الحملات', 'revenue'], ['5150', 'الإنفاق الإعلاني المعاد تحميله', 'expense']],
    costCenters: ['الحملات', 'المحتوى والإبداع', 'المنصات', 'خدمة العملاء'], units: ['حملة', 'ساعة', 'شهر'], warehouses: [],
    tools: [], kpis: ['تكلفة اكتساب العميل', 'ربحية الحملة', 'العائد على الإنفاق الإعلاني'],
  }),
  education: pack({ id: 'education', depth: 'base', accounts: [['2410', 'رسوم دراسية مقبوضة مقدماً', 'liability'], ['4090', 'إيرادات الرسوم الدراسية', 'revenue'], ['5160', 'المنح والخصومات الدراسية', 'expense']],
    costCenters: ['المراحل الدراسية', 'النقل', 'الأنشطة'], units: ['طالب', 'فصل دراسي'], warehouses: [], tools: [], kpis: ['نسبة التحصيل', 'تكلفة الطالب'] }),
  manufacturing: pack({ id: 'manufacturing', depth: 'base', accounts: [['1370', 'مواد خام', 'asset'], ['1380', 'إنتاج تحت التشغيل', 'asset'], ['1390', 'منتج تام', 'asset'], ['5170', 'انحرافات التكلفة المعيارية', 'expense']],
    costCenters: ['خطوط الإنتاج', 'الصيانة', 'الجودة'], units: ['وحدة', 'كجم', 'دفعة'], warehouses: ['مخزن الخامات', 'مخزن الإنتاج التام'], tools: ['purchasing', 'inventory', 'ptree'], kpis: ['انحراف التكلفة', 'نسبة الهالك'] }),
  bakery: pack({ id: 'bakery', depth: 'base', accounts: [['1370', 'مواد ومكونات الإنتاج', 'asset'], ['1390', 'منتجات مخبوزة جاهزة', 'asset'], ['5180', 'التالف ومنتهي الصلاحية', 'expense']],
    costCenters: ['الإنتاج', 'البيع'], units: ['قطعة', 'كجم', 'دفعة'], warehouses: ['مخزن المكونات'], tools: ['purchasing', 'inventory', 'ptree'], kpis: ['مردود الدفعة', 'نسبة التالف'] }),
  agriculture: pack({ id: 'agriculture', depth: 'base', accounts: [['1395', 'الأصول الحيوية (حيوانات/محاصيل)', 'asset'], ['1396', 'أعلاف ومدخلات زراعية', 'asset'], ['5190', 'النفوق والهدر الزراعي', 'expense']],
    costCenters: ['الحظائر', 'الحقول', 'المواسم'], units: ['رأس', 'كجم', 'طن', 'دونم'], warehouses: ['مخزن الأعلاف'], tools: ['purchasing', 'inventory'], kpis: ['تكلفة الوحدة للدورة', 'نسبة النفوق'] }),
  trade: pack({ id: 'trade', depth: 'base', accounts: [], costCenters: ['الفروع', 'المستودعات'], units: ['وحدة', 'كرتون'], warehouses: ['المستودع الرئيسي'], tools: ['purchasing', 'inventory'], kpis: ['هامش الربح', 'دوران المخزون'] }),
});

/** the pack of a sector; an unknown or empty sector gets the general trade pack */
export function sectorPack(sector?: string | null): SectorPack {
  return SECTOR_PACKS[String(sector || '')] ?? SECTOR_PACKS.trade;
}

/** what applying a pack adds to a company that already has some of it — nothing is renamed, retyped or removed */
export function packAdditions(p: SectorPack, have: { accountCodes?: string[]; definitions?: Record<string, string[]>; tools?: string[] }) {
  const codes = new Set(have.accountCodes ?? []), defs = have.definitions ?? {}, tools = new Set(have.tools ?? []);
  const missing = (list: readonly string[], type: string) => { const got = new Set((defs[type] ?? []).map((x) => x.trim())); return list.filter((n) => !got.has(n)); };
  return {
    accounts: p.accounts.filter(([code]) => !codes.has(code)),
    definitions: { costCenters: missing(p.costCenters, 'costCenters'), units: missing(p.units, 'units'), warehouses: missing(p.warehouses, 'warehouses') },
    tools: p.tools.filter((t) => !tools.has(t)),
  };
}

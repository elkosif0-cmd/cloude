/* Financial statements from a trial balance — the layout of the annual reports of listed companies
   (Almarai, Nestlé, Aramco) under IFRS as endorsed in the Kingdom (SOCPA), IFRS 18-ready:
     • profit or loss in categories: operating → operating profit → investing → profit before
       financing and zakat → financing → zakat → profit for the year
     • financial position: non-current / current, equity including the result for the year
     • changes in equity: opening (prior closing) → profit → other movements → closing
     • cash flows, indirect method, derived from the movement of every position line
     • notes: one per line with the accounts that make it up (every number traceable)
   Built on the line maps of kosif-audit-pro (statements.mjs) and SEE (classification: standards and
   assertions per account family). Deterministic; no model involved. Amounts in halalas. */
import { type Minor } from './money-engine';
import { norm, type AccountType, type TrialBalance, type TbRow } from './tb-import-engine';

export type Statement = 'sfp' | 'pl';
export type Section = 'nca' | 'ca' | 'ncl' | 'cl' | 'eq' | 'rev' | 'cogs' | 'opex' | 'opinc' | 'inv' | 'fin' | 'zakat';
export type CfRole = 'cash' | 'wc' | 'noncash' | 'zakatPayable' | 'investing' | 'financing' | 'equity' | 'retained' | 'none';
export type LineDef = {
  key: string; ar: string; en: string; statement: Statement; section: Section; types: AccountType[];
  kws: string[]; prefixes: string[]; standards: string[]; assertions: string[]; cf: CfRole; da?: boolean;
};

/* order matters: the first keyword match wins, so specific lines come before general ones */
export const LINES: LineDef[] = [
  /* ---- non-current assets ---- */
  { key: 'rou', ar: 'موجودات حق الاستخدام', en: 'Right-of-use assets', statement: 'sfp', section: 'nca', types: ['asset'], kws: ['حق استخدام', 'حق الاستخدام', 'حق انتفاع', 'right of use', 'right-of-use'], prefixes: [], standards: ['IFRS 16'], assertions: ['الوجود', 'التقييم', 'الحقوق'], cf: 'investing' },
  { key: 'intangibles', ar: 'موجودات غير ملموسة', en: 'Intangible assets', statement: 'sfp', section: 'nca', types: ['asset'], kws: ['غير ملموس', 'برامج', 'تراخيص', 'ترخيص', 'شهره', 'intangible', 'software', 'goodwill'], prefixes: [], standards: ['IAS 38', 'IAS 36'], assertions: ['الوجود', 'التقييم'], cf: 'investing' },
  { key: 'biological', ar: 'موجودات حيوية', en: 'Biological assets', statement: 'sfp', section: 'nca', types: ['asset'], kws: ['موجودات حيويه', 'اصول حيويه', 'قطيع', 'مواشي منتجه', 'biological'], prefixes: [], standards: ['IAS 41'], assertions: ['الوجود', 'التقييم'], cf: 'investing' },
  { key: 'investments', ar: 'استثمارات طويلة الأجل', en: 'Long-term investments', statement: 'sfp', section: 'nca', types: ['asset'], kws: ['استثمار', 'شركه زميله', 'مشروع مشترك', 'investment'], prefixes: [], standards: ['IFRS 9', 'IAS 28'], assertions: ['الوجود', 'التقييم'], cf: 'investing' },
  { key: 'ppe', ar: 'ممتلكات وآلات ومعدات', en: 'Property, plant and equipment', statement: 'sfp', section: 'nca', types: ['asset'], kws: ['مباني', 'مبان', 'معدات', 'الات', 'اثاث', 'سيارات', 'مركبات', 'اراضي', 'ارض', 'تجهيزات', 'تحسينات', 'اصول ثابته', 'ممتلكات', 'اهلاك متراكم', 'مجمع اهلاك', 'مجمع الاهلاك', 'ppe', 'equipment', 'vehicles', 'building'], prefixes: ['15', '16'], standards: ['IAS 16', 'IAS 36'], assertions: ['الوجود', 'التقييم', 'الحقوق', 'العرض'], cf: 'investing' },
  { key: 'otherNca', ar: 'موجودات غير متداولة أخرى', en: 'Other non-current assets', statement: 'sfp', section: 'nca', types: ['asset'], kws: ['طويل الاجل'], prefixes: ['13', '14', '17', '18', '19'], standards: ['IAS 1'], assertions: ['الوجود', 'التقييم'], cf: 'investing' },
  /* ---- current assets ---- */
  { key: 'inventory', ar: 'المخزون', en: 'Inventories', statement: 'sfp', section: 'ca', types: ['asset'], kws: ['مخزون', 'بضاعه', 'مواد خام', 'تحت التشغيل', 'مواد تغليف', 'inventory', 'stock'], prefixes: ['114', '115'], standards: ['IAS 2', 'ISA 501'], assertions: ['الوجود', 'الاكتمال', 'التقييم', 'الحقوق'], cf: 'wc' },
  { key: 'receivables', ar: 'ذمم مدينة تجارية', en: 'Trade receivables', statement: 'sfp', section: 'ca', types: ['asset'], kws: ['ذمم مدينه', 'مدينون', 'مدينين', 'عملاء', 'عميل', 'اوراق قبض', 'خسائر ائتمانيه متوقعه', 'receivable'], prefixes: ['112', '113'], standards: ['IFRS 9', 'IFRS 15', 'ISA 505'], assertions: ['الوجود', 'التقييم', 'القطع', 'الحقوق'], cf: 'wc' },
  { key: 'vatAsset', ar: 'ضريبة قيمة مضافة مستردة', en: 'VAT receivable', statement: 'sfp', section: 'ca', types: ['asset'], kws: ['مدخلات', 'ضريبه المدخلات', 'ضريبه مدفوعه', 'input vat'], prefixes: [], standards: ['ZATCA VAT'], assertions: ['الوجود', 'الدقه'], cf: 'wc' },
  { key: 'prepayments', ar: 'مصروفات مدفوعة مقدماً وأرصدة مدينة أخرى', en: 'Prepayments and other receivables', statement: 'sfp', section: 'ca', types: ['asset'], kws: ['مقدم', 'مدفوعه مقدما', 'سلف', 'عهد', 'تامينات مسترده', 'prepaid', 'advance', 'deposit'], prefixes: ['116', '117', '118', '119'], standards: ['IAS 1', 'IFRS 9'], assertions: ['الوجود', 'القطع'], cf: 'wc' },
  { key: 'cash', ar: 'النقد وما في حكمه', en: 'Cash and cash equivalents', statement: 'sfp', section: 'ca', types: ['asset'], kws: ['نقد', 'نقديه', 'صندوق', 'بنك', 'مصرف', 'cash', 'bank'], prefixes: ['111', '101', '102'], standards: ['IAS 7', 'ISA 505'], assertions: ['الوجود', 'الحقوق', 'العرض'], cf: 'cash' },
  { key: 'otherCa', ar: 'موجودات متداولة أخرى', en: 'Other current assets', statement: 'sfp', section: 'ca', types: ['asset'], kws: [], prefixes: ['11', '12'], standards: ['IAS 1'], assertions: ['الوجود'], cf: 'wc' },
  /* ---- equity ---- */
  { key: 'capital', ar: 'رأس المال', en: 'Share capital', statement: 'sfp', section: 'eq', types: ['equity'], kws: ['راس المال', 'راسمال', 'capital'], prefixes: ['301', '31'], standards: ['IAS 1', 'IAS 32'], assertions: ['الوجود', 'العرض'], cf: 'financing' },
  { key: 'reserves', ar: 'الاحتياطيات', en: 'Reserves', statement: 'sfp', section: 'eq', types: ['equity'], kws: ['احتياطي', 'reserve'], prefixes: ['302', '303', '32'], standards: ['IAS 1', 'نظام الشركات'], assertions: ['العرض'], cf: 'equity' },
  { key: 'partners', ar: 'جاري الشركاء', en: "Partners' current accounts", statement: 'sfp', section: 'eq', types: ['equity'], kws: ['جاري الشريك', 'جاري الشركاء', 'جاري المالك', 'مسحوبات', 'drawings'], prefixes: [], standards: ['IAS 1', 'IAS 24'], assertions: ['الاكتمال', 'العرض'], cf: 'financing' },
  { key: 'retained', ar: 'الأرباح المبقاة', en: 'Retained earnings', statement: 'sfp', section: 'eq', types: ['equity'], kws: ['ارباح مبقاه', 'ارباح مدوره', 'خسائر متراكمه', 'ارباح محتجزه', 'retained'], prefixes: ['30', '33', '34'], standards: ['IAS 1'], assertions: ['العرض'], cf: 'retained' },
  /* ---- non-current liabilities ---- */
  { key: 'eosb', ar: 'التزامات منافع الموظفين (نهاية الخدمة)', en: 'Employee end-of-service benefits', statement: 'sfp', section: 'ncl', types: ['liability'], kws: ['نهايه الخدمه', 'مكافاه نهايه', 'end of service', 'eosb'], prefixes: [], standards: ['IAS 19'], assertions: ['الاكتمال', 'التقييم'], cf: 'noncash' },
  { key: 'leaseNcl', ar: 'التزامات عقود الإيجار', en: 'Lease liabilities', statement: 'sfp', section: 'ncl', types: ['liability'], kws: ['التزام ايجار', 'التزامات ايجار', 'التزامات عقود الايجار', 'lease liabilit'], prefixes: [], standards: ['IFRS 16'], assertions: ['الاكتمال', 'التقييم'], cf: 'financing' },
  { key: 'loansNcl', ar: 'قروض طويلة الأجل', en: 'Long-term borrowings', statement: 'sfp', section: 'ncl', types: ['liability'], kws: ['قرض طويل', 'قروض طويله', 'تمويل طويل', 'long-term loan', 'long term loan'], prefixes: ['22', '23', '24'], standards: ['IFRS 9', 'IFRS 7'], assertions: ['الاكتمال', 'الالتزامات', 'العرض'], cf: 'financing' },
  { key: 'otherNcl', ar: 'مطلوبات غير متداولة أخرى', en: 'Other non-current liabilities', statement: 'sfp', section: 'ncl', types: ['liability'], kws: [], prefixes: [], standards: ['IAS 1'], assertions: ['الاكتمال', 'العرض'], cf: 'noncash' },
  /* ---- current liabilities ---- */
  { key: 'zakatPayable', ar: 'زكاة مستحقة', en: 'Zakat payable', statement: 'sfp', section: 'cl', types: ['liability'], kws: ['زكاه مستحقه', 'مخصص الزكاه', 'مخصص زكاه', 'ضريبه الدخل المستحقه', 'ضرائب الدخل المستحقه', 'zakat payable', 'zakat provision', 'income tax payable'], prefixes: [], standards: ['لائحة الزكاة', 'IAS 37'], assertions: ['الاكتمال', 'التقييم'], cf: 'zakatPayable' },
  { key: 'vatLiability', ar: 'ضريبة قيمة مضافة مستحقة', en: 'VAT payable', statement: 'sfp', section: 'cl', types: ['liability'], kws: ['ضريبه القيمه المضافه', 'ضريبه المخرجات', 'مخرجات', 'vat'], prefixes: [], standards: ['ZATCA VAT'], assertions: ['الاكتمال', 'الدقه'], cf: 'wc' },
  { key: 'loansCl', ar: 'قروض قصيرة الأجل والجزء المتداول', en: 'Short-term borrowings', statement: 'sfp', section: 'cl', types: ['liability'], kws: ['قرض', 'قروض', 'تسهيلات', 'مرابحه', 'تورق', 'loan', 'borrowing', 'overdraft'], prefixes: [], standards: ['IFRS 9', 'IFRS 7'], assertions: ['الاكتمال', 'الالتزامات'], cf: 'financing' },
  { key: 'contractLiab', ar: 'مطلوبات عقود (دفعات مقدمة من عملاء)', en: 'Contract liabilities', statement: 'sfp', section: 'cl', types: ['liability'], kws: ['دفعات مقدمه من عملاء', 'ايرادات مؤجله', 'ايراد مقدم', 'عربون', 'unearned', 'deferred revenue', 'customer advance'], prefixes: [], standards: ['IFRS 15'], assertions: ['الاكتمال', 'القطع'], cf: 'wc' },
  { key: 'payables', ar: 'ذمم دائنة تجارية', en: 'Trade payables', statement: 'sfp', section: 'cl', types: ['liability'], kws: ['ذمم دائنه', 'دائنون', 'موردين', 'موردون', 'اوراق دفع', 'payable', 'supplier'], prefixes: ['201', '211'], standards: ['IFRS 9', 'IAS 1'], assertions: ['الاكتمال', 'القطع', 'الالتزامات'], cf: 'wc' },
  { key: 'accruals', ar: 'مصروفات مستحقة ومطلوبات أخرى', en: 'Accruals and other payables', statement: 'sfp', section: 'cl', types: ['liability'], kws: ['مستحق', 'مستحقه', 'رواتب مستحقه', 'accrued', 'accrual'], prefixes: ['202', '203', '204', '212', '213'], standards: ['IAS 37', 'IAS 1'], assertions: ['الاكتمال', 'القطع'], cf: 'wc' },
  { key: 'provisions', ar: 'مخصصات', en: 'Provisions', statement: 'sfp', section: 'cl', types: ['liability'], kws: ['مخصص', 'provision'], prefixes: [], standards: ['IAS 37'], assertions: ['الاكتمال', 'التقييم'], cf: 'noncash' },
  { key: 'otherCl', ar: 'مطلوبات متداولة أخرى', en: 'Other current liabilities', statement: 'sfp', section: 'cl', types: ['liability'], kws: [], prefixes: ['20', '21'], standards: ['IAS 1'], assertions: ['الاكتمال'], cf: 'wc' },
  /* ---- profit or loss (IFRS 18 categories) ---- */
  { key: 'revenue', ar: 'الإيرادات', en: 'Revenue', statement: 'pl', section: 'rev', types: ['revenue'], kws: ['مبيعات', 'ايراد المبيعات', 'ايرادات النشاط', 'ايرادات العقود', 'sales', 'revenue'], prefixes: ['41', '40'], standards: ['IFRS 15'], assertions: ['الحدوث', 'الاكتمال', 'الدقه', 'القطع'], cf: 'none' },
  { key: 'investIncome', ar: 'إيرادات الاستثمار', en: 'Investment income', statement: 'pl', section: 'inv', types: ['revenue'], kws: ['ايراد استثمار', 'ايرادات استثمار', 'عوائد ودائع', 'ارباح استثمار', 'توزيعات مستلمه', 'حصه في', 'investment income', 'dividend'], prefixes: ['47'], standards: ['IFRS 18', 'IFRS 9'], assertions: ['الحدوث', 'الدقه'], cf: 'none' },
  { key: 'otherIncome', ar: 'إيرادات تشغيلية أخرى', en: 'Other operating income', statement: 'pl', section: 'opinc', types: ['revenue'], kws: ['ايرادات اخرى', 'ايراد اخر', 'ارباح بيع', 'other income'], prefixes: ['42', '43', '44', '45', '46', '48', '49'], standards: ['IFRS 18'], assertions: ['الحدوث', 'التصنيف'], cf: 'none' },
  { key: 'zakatExpense', ar: 'الزكاة وضريبة الدخل', en: 'Zakat and income tax', statement: 'pl', section: 'zakat', types: ['expense'], kws: ['زكاه', 'ضريبه الدخل', 'zakat', 'income tax'], prefixes: ['8'], standards: ['لائحة الزكاة', 'IAS 12'], assertions: ['الاكتمال', 'الدقه'], cf: 'none' },
  { key: 'financeCost', ar: 'تكاليف التمويل', en: 'Finance costs', statement: 'pl', section: 'fin', types: ['expense'], kws: ['تكاليف تمويل', 'تكلفه تمويل', 'فوائد', 'عمولات مرابحه', 'تكلفه القرض', 'فائده ايجار', 'finance cost', 'interest'], prefixes: ['7'], standards: ['IFRS 18', 'IFRS 9', 'IFRS 16'], assertions: ['الاكتمال', 'الدقه'], cf: 'none' },
  { key: 'cogs', ar: 'تكلفة الإيرادات', en: 'Cost of revenue', statement: 'pl', section: 'cogs', types: ['expense'], kws: ['تكلفه المبيعات', 'تكلفه الايرادات', 'تكلفه البضاعه', 'مشتريات', 'تكلفه مباشره', 'cost of sales', 'cost of revenue', 'cogs', 'purchases'], prefixes: ['51', '50'], standards: ['IAS 2'], assertions: ['الحدوث', 'الاكتمال', 'القطع'], cf: 'none' },
  { key: 'depreciation', ar: 'الاستهلاك والإطفاء', en: 'Depreciation and amortisation', statement: 'pl', section: 'opex', types: ['expense'], kws: ['اهلاك', 'استهلاك', 'اطفاء', 'depreciation', 'amortisation', 'amortization'], prefixes: [], standards: ['IAS 16', 'IAS 38', 'IFRS 16'], assertions: ['التقييم', 'الدقه'], cf: 'none', da: true },
  { key: 'impairment', ar: 'خسائر الانخفاض والخسائر الائتمانية المتوقعة', en: 'Impairment and expected credit losses', statement: 'pl', section: 'opex', types: ['expense'], kws: ['انخفاض', 'خسائر ائتمانيه', 'ديون معدومه', 'ديون مشكوك', 'impairment', 'bad debt', 'credit loss'], prefixes: [], standards: ['IFRS 9', 'IAS 36'], assertions: ['التقييم'], cf: 'none' },
  { key: 'selling', ar: 'مصروفات البيع والتوزيع', en: 'Selling and distribution expenses', statement: 'pl', section: 'opex', types: ['expense'], kws: ['بيع', 'توزيع', 'تسويق', 'اعلان', 'دعايه', 'نقل', 'توصيل', 'شحن', 'عمولات بيع', 'selling', 'distribution', 'marketing', 'delivery'], prefixes: ['52'], standards: ['IFRS 18'], assertions: ['الحدوث', 'التصنيف'], cf: 'none' },
  { key: 'admin', ar: 'المصروفات العمومية والإدارية', en: 'General and administrative expenses', statement: 'pl', section: 'opex', types: ['expense'], kws: [], prefixes: ['53', '54', '55', '56', '57', '58', '59', '6'], standards: ['IFRS 18'], assertions: ['الحدوث', 'التصنيف'], cf: 'none' },
];
export const LINE: Record<string, LineDef> = Object.fromEntries(LINES.map((l) => [l.key, l]));
const FALLBACK: Record<AccountType, string | null> = { asset: 'otherCa', liability: 'otherCl', equity: 'retained', revenue: 'revenue', expense: 'admin', suspense: null };

/** The statement line of one account: user override, then name keywords, then code prefix, then its type. */
export function lineFor(row: Pick<TbRow, 'code' | 'name' | 'type'>, overrides: Record<string, string> = {}): { key: string | null; basis: 'manual' | 'name' | 'code' | 'type' | 'none' } {
  if (overrides[row.code] && LINE[overrides[row.code]]) return { key: overrides[row.code], basis: 'manual' };
  const name = norm(row.name), code = String(row.code || '').replace(/\D/g, '');
  const candidates = LINES.filter((l) => l.types.includes(row.type));
  const byName = candidates.find((l) => l.kws.some((k) => name.includes(norm(k))));
  if (byName) return { key: byName.key, basis: 'name' };
  const byCode = candidates.filter((l) => l.prefixes.some((p) => code.startsWith(p))).sort((a, b) => Math.max(...b.prefixes.filter((p) => code.startsWith(p)).map((p) => p.length)) - Math.max(...a.prefixes.filter((p) => code.startsWith(p)).map((p) => p.length)))[0];
  if (byCode) return { key: byCode.key, basis: 'code' };
  const fb = FALLBACK[row.type];
  return fb ? { key: fb, basis: 'type' } : { key: null, basis: 'none' };
}

export type FsLine = { key: string; ar: string; en: string; section: Section; note: number | null; current: Minor; prior: Minor | null;
  accounts: { code: string; name: string; current: Minor; prior: Minor | null; basis: string }[]; standards: string[]; assertions: string[] };
export type Row = { key: string; ar: string; en: string; current: Minor; prior: Minor | null; note?: number | null; level: 'line' | 'subtotal' | 'total' | 'heading'; };
export type FinancialStatements = {
  hasPrior: boolean; lines: FsLine[]; unmapped: { code: string; name: string; balance: Minor }[];
  pl: Row[]; sfp: Row[]; soce: { columns: string[]; rows: { ar: string; values: Minor[] }[] }; cf: Row[] | null;
  keys: Record<string, { current: Minor; prior: Minor | null }>;
  checks: { balanced: boolean; difference: Minor; priorBalanced: boolean | null; cashTies: boolean | null; cfDifference: Minor | null; mappedPct: number };
  notes: { no: number; ar: string; en: string; kind: 'policy' | 'line'; lineKey?: string }[];
};

/* value in the line's natural presentation: assets & expenses debit-positive, the rest credit-positive */
const present = (l: LineDef, signed: Minor) => (l.types.includes('asset') || l.types.includes('expense') ? signed : -signed);

/* Saudi entities pay zakat; Egyptian (and most other) entities pay income tax — the labels follow */
const TAX_WORDS = { zakat: { before: 'الربح قبل التمويل والزكاة', pbz: 'الربح قبل الزكاة', payable: 'زكاة مستحقة', paid: 'الزكاة المدفوعة' },
  income: { before: 'الربح قبل التمويل وضريبة الدخل', pbz: 'الربح قبل ضريبة الدخل', payable: 'ضريبة دخل مستحقة', paid: 'ضريبة الدخل المدفوعة' } };
export function buildStatements(tb: TrialBalance, overrides: Record<string, string> = {}, opts: { tax?: 'zakat' | 'income' } = {}): FinancialStatements {
  const TW = TAX_WORDS[opts.tax ?? 'zakat'];
  const hasPrior = tb.hasPrior;
  const acc = new Map<string, FsLine>(); const unmapped: FinancialStatements['unmapped'] = [];
  for (const r of tb.rows) {
    const { key, basis } = lineFor(r, overrides);
    if (!key) { unmapped.push({ code: r.code, name: r.name, balance: r.balance }); continue; }
    const d = LINE[key];
    if (!acc.has(key)) acc.set(key, { key, ar: d.ar, en: d.en, section: d.section, note: null, current: 0, prior: hasPrior ? 0 : null, accounts: [], standards: d.standards, assertions: d.assertions });
    const L = acc.get(key)!, cur = present(d, r.balance), pr = r.prior === null ? null : present(d, r.prior);
    L.current += cur; if (hasPrior) L.prior = (L.prior ?? 0) + (pr ?? 0);
    L.accounts.push({ code: r.code, name: r.name, current: cur, prior: pr, basis });
  }
  const v = (k: string) => acc.get(k)?.current ?? 0, vp = (k: string) => (hasPrior ? acc.get(k)?.prior ?? 0 : 0);
  const sec = (s: Section, prior = false) => LINES.filter((l) => l.section === s).reduce((a, l) => a + (prior ? vp(l.key) : v(l.key)), 0);
  /* profit or loss */
  const P = (prior: boolean) => {
    const g = (k: string) => (prior ? vp(k) : v(k)), sx = (s: Section) => sec(s, prior);
    const revenue = g('revenue'), cogs = g('cogs'), gross = revenue - cogs;
    const opex = sx('opex'), otherInc = sx('opinc'), operating = gross - opex + otherInc;
    const invest = sx('inv'), pbfz = operating + invest, finance = sx('fin'), pbz = pbfz - finance, zakat = sx('zakat'), profit = pbz - zakat;
    return { revenue, cogs, gross, opex, otherInc, operating, invest, pbfz, finance, pbz, zakat, profit };
  };
  const pc = P(false), pp = hasPrior ? P(true) : null;
  const row = (key: string, ar: string, en: string, c: Minor, p: Minor | null, level: Row['level'] = 'line'): Row => ({ key, ar, en, current: c, prior: p, level });
  const lr = (k: string, sign = 1) => { const d = LINE[k]; return row(k, k === 'zakatPayable' ? TW.payable : d.ar, d.en, sign * v(k), hasPrior ? sign * vp(k) : null); };
  const pl: Row[] = [
    lr('revenue'), lr('cogs', -1), row('gross', 'مجمل الربح', 'Gross profit', pc.gross, pp?.gross ?? null, 'subtotal'),
    lr('selling', -1), lr('admin', -1), lr('depreciation', -1), lr('impairment', -1), lr('otherIncome'),
    row('operating', 'الربح التشغيلي', 'Operating profit', pc.operating, pp?.operating ?? null, 'subtotal'),
    lr('investIncome'), row('pbfz', TW.before, 'Profit before financing and zakat', pc.pbfz, pp?.pbfz ?? null, 'subtotal'),
    lr('financeCost', -1), row('pbz', TW.pbz, 'Profit before zakat', pc.pbz, pp?.pbz ?? null, 'subtotal'),
    lr('zakatExpense', -1), row('profit', 'صافي ربح السنة', 'Profit for the year', pc.profit, pp?.profit ?? null, 'total'),
  ].filter((r) => r.level !== 'line' || r.current !== 0 || (r.prior ?? 0) !== 0);
  /* financial position (equity includes the result for the year: P&L accounts are open in a pre-closing trial balance) */
  const nca = sec('nca'), ca = sec('ca'), ncl = sec('ncl'), cl = sec('cl'), eqTb = sec('eq');
  const ncaP = sec('nca', true), caP = sec('ca', true), nclP = sec('ncl', true), clP = sec('cl', true), eqTbP = sec('eq', true);
  const eq = eqTb + pc.profit, eqP = hasPrior ? eqTbP + (pp?.profit ?? 0) : null;
  const H = (key: string, ar: string, en: string): Row => ({ key, ar, en, current: 0, prior: null, level: 'heading' });
  const secRows = (s: Section) => LINES.filter((l) => l.section === s).map((l) => lr(l.key)).filter((r) => r.current !== 0 || (r.prior ?? 0) !== 0);
  const sfp: Row[] = [
    H('h-assets', 'الموجودات', 'Assets'), H('h-nca', 'الموجودات غير المتداولة', 'Non-current assets'), ...secRows('nca'),
    row('nca', 'مجموع الموجودات غير المتداولة', 'Total non-current assets', nca, hasPrior ? ncaP : null, 'subtotal'),
    H('h-ca', 'الموجودات المتداولة', 'Current assets'), ...secRows('ca'),
    row('ca', 'مجموع الموجودات المتداولة', 'Total current assets', ca, hasPrior ? caP : null, 'subtotal'),
    row('assets', 'مجموع الموجودات', 'Total assets', nca + ca, hasPrior ? ncaP + caP : null, 'total'),
    H('h-eq', 'حقوق الملكية والمطلوبات', 'Equity and liabilities'), H('h-equity', 'حقوق الملكية', 'Equity'), ...secRows('eq'),
    row('resultYear', 'صافي ربح السنة', 'Profit for the year', pc.profit, pp?.profit ?? null),
    row('equity', 'مجموع حقوق الملكية', 'Total equity', eq, eqP, 'subtotal'),
    H('h-ncl', 'المطلوبات غير المتداولة', 'Non-current liabilities'), ...secRows('ncl'),
    row('ncl', 'مجموع المطلوبات غير المتداولة', 'Total non-current liabilities', ncl, hasPrior ? nclP : null, 'subtotal'),
    H('h-cl', 'المطلوبات المتداولة', 'Current liabilities'), ...secRows('cl'),
    row('cl', 'مجموع المطلوبات المتداولة', 'Total current liabilities', cl, hasPrior ? clP : null, 'subtotal'),
    row('liabilities', 'مجموع المطلوبات', 'Total liabilities', ncl + cl, hasPrior ? nclP + clP : null, 'subtotal'),
    row('eqLiab', 'مجموع حقوق الملكية والمطلوبات', 'Total equity and liabilities', eq + ncl + cl, eqP === null ? null : eqP + nclP + clP, 'total'),
  ];
  const difference = nca + ca - (eq + ncl + cl), priorDiff = hasPrior && eqP !== null ? ncaP + caP - (eqP + nclP + clP) : null;
  /* changes in equity: prior closing (prior TB equity + prior profit) → current closing */
  const eqCol = (k: string) => [v(k), vp(k)];
  const [capC, capP] = eqCol('capital'), [resC, resP] = eqCol('reserves'), [parC, parP] = eqCol('partners'), [retC, retP] = eqCol('retained');
  const openRet = retP + (pp?.profit ?? 0), closeRet = retC + pc.profit;
  const soce = { columns: ['رأس المال', 'الاحتياطيات', 'جاري الشركاء', 'الأرباح المبقاة', 'المجموع'],
    rows: hasPrior ? [
      { ar: 'الرصيد في بداية السنة', values: [capP, resP, parP, openRet, capP + resP + parP + openRet] },
      { ar: 'صافي ربح السنة', values: [0, 0, 0, pc.profit, pc.profit] },
      { ar: 'زيادة رأس المال والاحتياطيات والحركة في جاري الشركاء', values: [capC - capP, resC - resP, parC - parP, 0, capC - capP + resC - resP + parC - parP] },
      { ar: 'توزيعات وتحويلات أخرى', values: [0, 0, 0, closeRet - openRet - pc.profit, closeRet - openRet - pc.profit] },
      { ar: 'الرصيد في نهاية السنة', values: [capC, resC, parC, closeRet, capC + resC + parC + closeRet] },
    ] : [
      { ar: 'الرصيد قبل نتيجة السنة', values: [capC, resC, parC, retC, capC + resC + parC + retC] },
      { ar: 'صافي ربح السنة', values: [0, 0, 0, pc.profit, pc.profit] },
      { ar: 'الرصيد في نهاية السنة', values: [capC, resC, parC, closeRet, capC + resC + parC + closeRet] },
    ] };
  /* cash flows (indirect) — every position line's movement falls in exactly one activity, so the
     statement reconciles to the movement in cash whenever every account is mapped */
  let cf: Row[] | null = null, cashTies: boolean | null = null, cfDifference: Minor | null = null;
  if (hasPrior) {
    const d = (k: string) => v(k) - vp(k);
    const da = LINES.filter((l) => l.da).reduce((a, l) => a + v(l.key), 0);
    const byRole = (role: CfRole, sign: 1 | -1) => LINES.filter((l) => l.statement === 'sfp' && l.cf === role).map((l) => ({ l, amt: sign * d(l.key) })).filter((x) => x.amt !== 0);
    const assetWc = byRole('wc', -1).filter((x) => x.l.types.includes('asset')), liabWc = byRole('wc', 1).filter((x) => x.l.types.includes('liability'));
    const noncash = byRole('noncash', 1), zakatPaid = -(vp('zakatPayable') + pc.zakat - v('zakatPayable'));
    const opRows: Row[] = [
      row('cf-pbz', TW.pbz, 'Profit before zakat', pc.pbz, null),
      ...(da ? [row('cf-da', 'الاستهلاك والإطفاء', 'Depreciation and amortisation', da, null)] : []),
      ...noncash.map((x) => row('cf-nc-' + x.l.key, 'الحركة في ' + x.l.ar, 'Movement in ' + x.l.en, x.amt, null)),
      ...assetWc.map((x) => row('cf-wc-' + x.l.key, (x.amt <= 0 ? 'الزيادة في ' : 'النقص في ') + x.l.ar, 'Change in ' + x.l.en, x.amt, null)),
      ...liabWc.map((x) => row('cf-wc-' + x.l.key, (x.amt >= 0 ? 'الزيادة في ' : 'النقص في ') + x.l.ar, 'Change in ' + x.l.en, x.amt, null)),
      row('cf-zakat', TW.paid, 'Zakat paid', zakatPaid, null),
    ];
    const op = opRows.reduce((a, r) => a + r.current, 0);
    const inv = byRole('investing', -1).map((x) => row('cf-inv-' + x.l.key, (x.l.key === 'ppe' ? 'إضافات ' : 'الحركة في ') + x.l.ar, 'Investment in ' + x.l.en, x.amt - (x.l.key === 'ppe' ? da : 0), null)).filter((r) => r.current !== 0);
    if (da && !inv.some((r) => r.key === 'cf-inv-ppe')) inv.push(row('cf-inv-ppe', 'إضافات ممتلكات وآلات ومعدات', 'Additions to PPE', -da, null));
    const invT = inv.reduce((a, r) => a + r.current, 0);
    const finRows = [...byRole('financing', 1).map((x) => row('cf-fin-' + x.l.key, 'الحركة في ' + x.l.ar, 'Movement in ' + x.l.en, x.amt, null)),
      ...byRole('equity', 1).map((x) => row('cf-fin-' + x.l.key, 'الحركة في ' + x.l.ar, 'Movement in ' + x.l.en, x.amt, null))];
    const dividends = closeRet - openRet - pc.profit;
    if (dividends) finRows.push(row('cf-fin-div', 'توزيعات أرباح وتحويلات', 'Dividends and transfers', dividends, null));
    const finT = finRows.reduce((a, r) => a + r.current, 0);
    const net = op + invT + finT, cashOpen = vp('cash'), cashClose = v('cash');
    cfDifference = cashOpen + net - cashClose; cashTies = cfDifference === 0;
    cf = [
      { key: 'h-op', ar: 'الأنشطة التشغيلية', en: 'Operating activities', current: 0, prior: null, level: 'heading' }, ...opRows,
      row('cf-op', 'صافي النقد من الأنشطة التشغيلية', 'Net cash from operating activities', op, null, 'subtotal'),
      { key: 'h-inv', ar: 'الأنشطة الاستثمارية', en: 'Investing activities', current: 0, prior: null, level: 'heading' }, ...inv,
      row('cf-inv', 'صافي النقد من الأنشطة الاستثمارية', 'Net cash from investing activities', invT, null, 'subtotal'),
      { key: 'h-fin', ar: 'الأنشطة التمويلية', en: 'Financing activities', current: 0, prior: null, level: 'heading' }, ...finRows,
      row('cf-fin', 'صافي النقد من الأنشطة التمويلية', 'Net cash from financing activities', finT, null, 'subtotal'),
      row('cf-net', 'صافي التغير في النقد', 'Net change in cash', net, null, 'subtotal'),
      row('cf-open', 'النقد في بداية السنة', 'Cash at beginning of year', cashOpen, null),
      row('cf-close', 'النقد في نهاية السنة', 'Cash at end of year', cashOpen + net, null, 'total'),
    ];
  }
  /* notes: policies first, then one note per line in presentation order */
  const notes: FinancialStatements['notes'] = [
    { no: 1, ar: 'معلومات عن المنشأة', en: 'Corporate information', kind: 'policy' },
    { no: 2, ar: 'أساس الإعداد', en: 'Basis of preparation', kind: 'policy' },
    { no: 3, ar: 'السياسات المحاسبية الجوهرية', en: 'Material accounting policies', kind: 'policy' },
    { no: 4, ar: 'الأحكام والتقديرات المحاسبية الهامة', en: 'Significant judgements and estimates', kind: 'policy' },
  ];
  let no = 5;
  const order = ['nca', 'ca', 'eq', 'ncl', 'cl', 'rev', 'cogs', 'opex', 'opinc', 'inv', 'fin', 'zakat'] as Section[];
  for (const s of order) for (const l of LINES.filter((x) => x.section === s)) {
    const L = acc.get(l.key); if (!L || (L.current === 0 && (L.prior ?? 0) === 0)) continue;
    L.note = no; notes.push({ no, ar: l.ar, en: l.en, kind: 'line', lineKey: l.key }); no++;
  }
  const noteOf = (k: string) => acc.get(k)?.note ?? null;
  for (const r of [...pl, ...sfp]) if (LINE[r.key]) r.note = noteOf(r.key);
  const keys: FinancialStatements['keys'] = {};
  const put = (k: string, c: Minor, p: Minor | null) => { keys[k] = { current: c, prior: hasPrior ? p : null }; };
  (['revenue', 'cogs', 'gross', 'opex', 'operating', 'pbfz', 'finance', 'pbz', 'zakat', 'profit'] as const).forEach((k) => put(k, pc[k], pp ? pp[k] : null));
  put('nca', nca, ncaP); put('ca', ca, caP); put('assets', nca + ca, ncaP + caP); put('ncl', ncl, nclP); put('cl', cl, clP);
  put('liabilities', ncl + cl, nclP + clP); put('equity', eq, eqP);
  for (const k of ['cash', 'receivables', 'inventory', 'payables', 'ppe', 'loansCl', 'loansNcl', 'leaseNcl', 'depreciation', 'selling', 'admin']) put(k, v(k), vp(k));
  if (cf) { put('cfo', cf.find((r) => r.key === 'cf-op')!.current, null); put('capex', cf.filter((r) => r.key === 'cf-inv-ppe' || r.key === 'cf-inv-intangibles').reduce((a, r) => a + r.current, 0), null); }
  const mapped = tb.rows.length ? Math.round(((tb.rows.length - unmapped.length) / tb.rows.length) * 1000) / 10 : 0;
  return { hasPrior, lines: [...acc.values()], unmapped, pl, sfp, soce, cf, keys,
    checks: { balanced: difference === 0, difference, priorBalanced: priorDiff === null ? null : priorDiff === 0, cashTies, cfDifference, mappedPct: mapped }, notes };
}

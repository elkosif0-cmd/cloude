/* The notes package of a full set of IFRS financial statements — what the global reports in the research
   bundle disclose beyond one note per line, derived deterministically from the trial balance:
     • expenses by nature (IFRS 18.83 — required when profit or loss presents expenses by function)
     • zakat: movement of the provision (the layout of Aramco note 8(c), bundle p. 10202) and an indicative
       zakat base with the recorded charge compared to it
     • end-of-service benefits and provisions: opening → charge → paid/utilised → closing (IAS 19 / IAS 37)
     • reconciliation of liabilities arising from financing activities (IAS 7.44A–E)
     • financial risk management: credit exposure and loss allowance, liquidity maturity analysis
       (IFRS 7.35–39), interest-rate sensitivity (IFRS 7.40)
     • capital management (IAS 1.134): net debt, gearing and return on average capital employed as Aramco
       defines them (bundle p. 10041–10042)
     • illustrative sensitivities for the key estimates (IAS 1.125–129)
   Every table reconciles to the statements; what the numbers cannot carry (contractual maturities, the
   final zakat base) is stated on the table so the preparer completes it. Amounts in halalas. */
import { type Minor } from './money-engine';
import { norm } from './tb-import-engine';
import { type FinancialStatements, type FsLine } from './statements-engine';

export type Cell = Minor | null;
/** one table row: its values follow the table's columns after the label */
export type TRow = { ar: string; values: Cell[]; level?: 'line' | 'subtotal' | 'total' };
export type Table = { title: string; columns: string[]; rows: TRow[]; note?: string };

const line = (fs: FinancialStatements, k: string): FsLine | undefined => fs.lines.find((l) => l.key === k);
const cur = (fs: FinancialStatements, k: string) => line(fs, k)?.current ?? 0;
const pri = (fs: FinancialStatements, k: string) => (fs.hasPrior ? line(fs, k)?.prior ?? 0 : null);
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : null);
const yearCols = (fs: FinancialStatements) => (fs.hasPrior ? ['', 'السنة الحالية', 'السنة السابقة'] : ['', 'المبلغ']);
/** a row of a current-(and prior-)year table */
const R = (ar: string, current: Cell, prior?: Cell, level?: TRow['level']): TRow => ({ ar, values: prior === undefined ? [current] : [current, prior], ...(level ? { level } : {}) });
const sumRows = (rows: TRow[], i = 0) => rows.reduce((t, r) => t + (r.values[i] ?? 0), 0);

/* ---------- expenses by nature (IFRS 18.83) ---------- */
const NATURE: { key: string; ar: string; kws: string[] }[] = [
  { key: 'goods', ar: 'تكلفة البضاعة والمواد المستخدمة', kws: ['مشتريات', 'تكلفه المبيعات', 'تكلفه البضاعه', 'تكلفه الايرادات', 'مواد', 'خامات', 'بضاعه', 'purchases', 'cost of sales', 'materials'] },
  { key: 'staff', ar: 'منافع الموظفين', kws: ['رواتب', 'اجور', 'مكافا', 'بدل', 'تامينات اجتماعيه', 'التامينات الاجتماعيه', 'نهايه الخدمه', 'عمال', 'موظف', 'salar', 'wage', 'gosi', 'staff', 'employee'] },
  { key: 'rent', ar: 'الإيجارات قصيرة الأجل ومنخفضة القيمة', kws: ['ايجار', 'rent'] },
  { key: 'utilities', ar: 'المرافق والاتصالات', kws: ['كهرباء', 'مياه', 'اتصالات', 'هاتف', 'جوال', 'انترنت', 'utilit', 'electric', 'telecom'] },
  { key: 'transport', ar: 'النقل والشحن والوقود', kws: ['نقل', 'شحن', 'توصيل', 'وقود', 'محروقات', 'بنزين', 'ديزل', 'freight', 'fuel', 'delivery', 'transport'] },
  { key: 'marketing', ar: 'التسويق والإعلان', kws: ['تسويق', 'اعلان', 'دعايه', 'marketing', 'advertis'] },
  { key: 'professional', ar: 'الأتعاب المهنية', kws: ['اتعاب', 'استشار', 'محاما', 'مراجعه', 'professional', 'consult', 'audit', 'legal'] },
  { key: 'fees', ar: 'الرسوم الحكومية', kws: ['رسوم', 'تاشير', 'اقامه', 'اقامات', 'رخص', 'ترخيص', 'government fee', 'license'] },
  { key: 'maintenance', ar: 'الصيانة والإصلاح', kws: ['صيانه', 'اصلاح', 'maintenance', 'repair'] },
  { key: 'insurance', ar: 'التأمين', kws: ['تامين طبي', 'تامين المركبات', 'اقساط تامين', 'insurance'] },
];
const BY_LINE: Record<string, { key: string; ar: string }> = {
  depreciation: { key: 'da', ar: 'الاستهلاك والإطفاء' },
  impairment: { key: 'impairment', ar: 'خسائر الانخفاض والخسائر الائتمانية المتوقعة' },
};
/** The nature of one expense account (by name; cost of revenue defaults to goods and materials). */
export function natureOf(name: string, lineKey: string): { key: string; ar: string } {
  if (BY_LINE[lineKey]) return BY_LINE[lineKey];
  const n = norm(name), hit = NATURE.find((x) => x.kws.some((k) => n.includes(norm(k))));
  return hit ? { key: hit.key, ar: hit.ar } : lineKey === 'cogs' ? { key: 'goods', ar: NATURE[0].ar } : { key: 'other', ar: 'مصروفات أخرى' };
}
export function expensesByNature(fs: FinancialStatements) {
  const sums = new Map<string, { ar: string; c: Minor; p: Minor }>();
  for (const l of fs.lines.filter((x) => x.section === 'cogs' || x.section === 'opex')) for (const a of l.accounts) {
    const n = natureOf(a.name, l.key), s = sums.get(n.key) ?? { ar: n.ar, c: 0, p: 0 };
    s.c += a.current; s.p += a.prior ?? 0; sums.set(n.key, s);
  }
  const order = [...NATURE.map((x) => x.key), 'da', 'impairment', 'other'];
  const rows = order.filter((k) => sums.has(k) && (sums.get(k)!.c || sums.get(k)!.p)).map((k) => R(sums.get(k)!.ar, sums.get(k)!.c, fs.hasPrior ? sums.get(k)!.p : undefined));
  const total = sumRows(rows), totalPrior = fs.hasPrior ? sumRows(rows, 1) : null, other = sums.get('other')?.c ?? 0;
  rows.push(R('مجموع تكلفة الإيرادات والمصروفات التشغيلية', total, fs.hasPrior ? totalPrior : undefined, 'total'));
  const table: Table = { title: 'المصروفات حسب طبيعتها', columns: yearCols(fs), rows,
    note: 'تُعرض قائمة الربح أو الخسارة حسب الوظيفة، ويُفصح IFRS 18 (الفقرة 83) عن المبالغ حسب الطبيعة. التصنيف من أسماء الحسابات' + (total && other / total > 0.2 ? '؛ «مصروفات أخرى» تتجاوز 20% — أعد تسمية الحسابات أو صنّفها.' : '.') };
  return { table, total, totalPrior, ties: total === fs.keys.cogs.current + fs.keys.opex.current };
}

/* ---------- movements: opening → charge → paid/utilised → closing ---------- */
const expenseAccounts = (fs: FinancialStatements, kws: string[]) => fs.lines.filter((l) => ['cogs', 'opex', 'zakat', 'fin'].includes(l.section))
  .flatMap((l) => l.accounts).filter((a) => kws.some((k) => norm(a.name).includes(norm(k))));
function movement(title: string, opening: Minor | null, closing: Minor, charge: Minor | null, chargeAr: string, paidAr: string, note: string): Table {
  if (opening === null) return { title, columns: ['', 'المبلغ'], rows: [R('الرصيد في نهاية السنة', closing, undefined, 'total')], note: 'لا توجد أرصدة مقارنة؛ تُعرض الحركة عند توفر رصيد السنة السابقة.' };
  const rows = [R('الرصيد في بداية السنة', opening)];
  if (charge !== null) rows.push(R(chargeAr, charge), R(paidAr, closing - opening - charge));
  else rows.push(R('صافي الحركة خلال السنة', closing - opening));
  rows.push(R('الرصيد في نهاية السنة', closing, undefined, 'total'));
  return { title, columns: ['', 'المبلغ'], rows, note };
}
export function eosbMovement(fs: FinancialStatements): Table | null {
  if (!line(fs, 'eosb')) return null;
  const ch = expenseAccounts(fs, ['نهايه الخدمه', 'end of service']);
  return movement('حركة التزامات منافع نهاية الخدمة', pri(fs, 'eosb'), cur(fs, 'eosb'), ch.length ? ch.reduce((t, a) => t + a.current, 0) : null,
    'المحمل على السنة', 'المدفوع خلال السنة', ch.length ? 'المدفوع مشتق: رصيد البداية + المحمل − رصيد النهاية. افتراضات التقييم الاكتواري (IAS 19.144) تُضاف من تقرير الخبير.'
      : 'لا يوجد حساب مصروف مستقل لمكافأة نهاية الخدمة؛ أنشئ حساباً لها ليظهر المحمل والمدفوع منفصلين.');
}
export function provisionsMovement(fs: FinancialStatements): Table | null {
  const L = line(fs, 'provisions'); if (!L) return null;
  return movement('حركة المخصصات', pri(fs, 'provisions'), L.current, null, '', '', 'يفصح IAS 37.84 عن المكوَّن والمستخدم والمعكوس لكل فئة؛ فصّل الحسابات لتظهر الحركة بتفاصيلها.');
}

/* ---------- zakat (Aramco note 8(c) layout + an indicative base) ---------- */
export const ZAKAT_RATE = { hijri: 0.025, gregorian: 0.025775 } as const;
export function zakatNote(fs: FinancialStatements, opts: { calendar?: 'hijri' | 'gregorian' } = {}) {
  const charge = fs.keys.zakat.current;
  const move = movement('حركة مخصص الزكاة', pri(fs, 'zakatPayable'), cur(fs, 'zakatPayable'), charge, 'المكوَّن خلال السنة', 'المسدد خلال السنة',
    'على نهج أرامكو (الإيضاح 8(ج)): رصيد أول السنة ← المكوَّن ← المسدد ← رصيد آخر السنة. المسدد مشتق من الحركة.');
  const adds = [
    R('حقوق الملكية في بداية السنة (رأس المال والاحتياطيات وجاري الشركاء والأرباح المبقاة)', ['capital', 'reserves', 'partners', 'retained'].reduce((t, k) => t + cur(fs, k), 0)),
    R('مخصص نهاية الخدمة والمخصصات الأخرى', cur(fs, 'eosb') + cur(fs, 'provisions')),
    R('القروض والتزامات الإيجار طويلة الأجل', cur(fs, 'loansNcl') + cur(fs, 'leaseNcl')),
  ];
  const deds = [
    R('ناقصاً: صافي الممتلكات والآلات والمعدات', -cur(fs, 'ppe')),
    R('ناقصاً: الموجودات غير الملموسة وحق الاستخدام', -(cur(fs, 'intangibles') + cur(fs, 'rou'))),
    R('ناقصاً: الاستثمارات طويلة الأجل والموجودات الحيوية', -(cur(fs, 'investments') + cur(fs, 'biological'))),
  ];
  const adjProfit = fs.keys.pbz.current, net = sumRows([...adds, ...deds]) + Math.max(0, adjProfit);
  const base = Math.max(net, Math.max(0, adjProfit)), calendar = opts.calendar ?? 'gregorian', rate = ZAKAT_RATE[calendar], estimate = Math.round(base * rate);
  const difference = charge - estimate, tolerance = Math.max(100_00, Math.round(Math.abs(estimate) * 0.1));
  const baseTable: Table = { title: 'الوعاء الزكوي — تقدير إرشادي للمقارنة', columns: ['', 'المبلغ'], rows: [
    ...adds, ...deds, R('صافي الربح المعدل (الربح قبل الزكاة)', adjProfit),
    R('الوعاء الزكوي التقديري (لا يقل عن صافي الربح المعدل)', base, undefined, 'subtotal'),
    R(`الزكاة التقديرية بسعر ${Math.round(rate * 100000) / 1000}% (${calendar === 'hijri' ? 'سنة هجرية' : 'سنة ميلادية'})`, estimate, undefined, 'total'),
    R('الزكاة المسجلة في القوائم', charge), R('الفرق', difference) ],
    note: 'تقدير مبسط للمقارنة فقط: الاحتساب النهائي وفق لائحة جباية الزكاة الصادرة عن هيئة الزكاة والضريبة والجمارك بتعديلاتها على صافي الربح والحسميات، ويعتمده المختص الزكوي.' };
  return { movement: move, base: baseTable, estimate, charge, difference, flag: Math.abs(difference) > tolerance, rate };
}

/* ---------- IAS 7.44A: liabilities arising from financing activities ---------- */
export function financingReconciliation(fs: FinancialStatements): Table | null {
  if (!fs.hasPrior || !fs.cf) return null;
  const keys = ['loansCl', 'loansNcl', 'leaseNcl'].filter((k) => line(fs, k) && (cur(fs, k) || pri(fs, k)));
  if (!keys.length) return null;
  const cash = (k: string) => fs.cf!.find((r) => r.key === 'cf-fin-' + k)?.current ?? 0;
  const rows = keys.map((k) => { const op = pri(fs, k) ?? 0, cl = cur(fs, k), fl = cash(k); return { ar: line(fs, k)!.ar, values: [op, fl, cl - op - fl, cl] } as TRow; });
  rows.push({ ar: 'المجموع', values: [0, 1, 2, 3].map((i) => sumRows(rows, i)), level: 'total' });
  return { title: 'مطابقة المطلوبات الناشئة عن الأنشطة التمويلية', columns: ['', 'الرصيد الافتتاحي', 'التدفقات النقدية', 'تغيرات غير نقدية', 'الرصيد الختامي'], rows,
    note: 'IAS 7.44A–E: التغيرات غير النقدية تشمل عقود الإيجار الجديدة وإعادة التصنيف وفروق العملة؛ صفر يعني أن الحركة كلها نقدية.' };
}

/* ---------- financial risk management (IFRS 7) ---------- */
const ALLOW = /خسائر ائتمانيه|مخصص|ديون مشكوك|اضمحلال|allowance|provision|impair/;
export function creditRisk(fs: FinancialStatements) {
  const accs = line(fs, 'receivables')?.accounts ?? [];
  const allowance = accs.filter((a) => ALLOW.test(norm(a.name)) || a.current < 0).reduce((t, a) => t + a.current, 0);
  const gross = cur(fs, 'receivables') - allowance, cash = cur(fs, 'cash');
  const other = (line(fs, 'prepayments')?.accounts ?? []).filter((a) => /تامينات مسترده|ودائع|ودايع|deposit|مدينون اخرون|ذمم مدينه اخرى/.test(norm(a.name))).reduce((t, a) => t + a.current, 0);
  const maxExposure = cash + gross + allowance + other;
  const table: Table = { title: 'التعرض لمخاطر الائتمان', columns: ['', 'المبلغ'], rows: [
    R('النقد لدى البنوك', cash), R('الذمم المدينة التجارية (إجمالي)', gross), R('مخصص الخسائر الائتمانية المتوقعة', allowance),
    ...(other ? [R('ودائع وتأمينات وأرصدة مدينة أخرى', other)] : []), R('الحد الأقصى للتعرض لمخاطر الائتمان', maxExposure, undefined, 'total')],
    note: allowance ? `يغطي المخصص ${pct(-allowance, gross)}% من إجمالي الذمم؛ يُطبق النهج المبسط في IFRS 9 بمصفوفة أعمار.` : 'لا يوجد مخصص خسائر ائتمانية مسجل؛ قيّم الحاجة إليه بمصفوفة أعمار الديون (IFRS 9.5.5.15).' };
  return { gross, allowance: -allowance || 0, coverage: pct(-allowance, gross), maxExposure, table };
}
export function maturityAnalysis(fs: FinancialStatements): Table {
  const within = cur(fs, 'payables') + cur(fs, 'accruals') + cur(fs, 'loansCl'), later = cur(fs, 'loansNcl') + cur(fs, 'leaseNcl');
  const rows = [R('ذمم دائنة تجارية', cur(fs, 'payables')), R('مصروفات مستحقة ومطلوبات أخرى', cur(fs, 'accruals')), R('قروض قصيرة الأجل والجزء المتداول', cur(fs, 'loansCl')),
    R('تستحق خلال سنة', within, undefined, 'subtotal'), R('قروض طويلة الأجل', cur(fs, 'loansNcl')), R('التزامات عقود الإيجار', cur(fs, 'leaseNcl')),
    R('تستحق بعد سنة', later, undefined, 'subtotal'), R('مجموع المطلوبات المالية', within + later, undefined, 'total')];
  return { title: 'تحليل استحقاق المطلوبات المالية', columns: ['', 'المبلغ'], rows: rows.filter((r) => r.level || r.values[0]),
    note: 'مبني على تصنيف المتداول وغير المتداول. يتطلب IFRS 7.39 التدفقات التعاقدية غير المخصومة شاملة العمولة حسب فترات الاستحقاق؛ أضف جدول السداد لكل قرض وعقد إيجار.' };
}
export function interestSensitivity(fs: FinancialStatements, bp = 100) {
  const debt = cur(fs, 'loansCl') + cur(fs, 'loansNcl'), effect = Math.round((debt * bp) / 10000);
  return { debt, bp, effect };
}

/* ---------- capital management (IAS 1.134) — Aramco's gearing and ROACE ---------- */
export function capitalManagement(fs: FinancialStatements) {
  const at = (p: boolean) => {
    const g = (k: string) => (p ? pri(fs, k) ?? 0 : cur(fs, k));
    const borrowings = g('loansCl') + g('loansNcl') + g('leaseNcl'), cash = g('cash'), netDebt = borrowings - cash;
    const equity = p ? fs.keys.equity.prior ?? 0 : fs.keys.equity.current;
    return { borrowings, cash, netDebt, equity, gearing: netDebt + equity ? Math.round((netDebt / (netDebt + equity)) * 1000) / 10 : null,
      debtToEquity: equity ? Math.round((borrowings / equity) * 100) / 100 : null };
  };
  const c = at(false), p = fs.hasPrior ? at(true) : null;
  const capEmp = c.borrowings + c.equity, capEmpP = p ? p.borrowings + p.equity : null, avg = capEmpP === null ? capEmp : (capEmp + capEmpP) / 2;
  const roace = avg ? Math.round(((fs.keys.profit.current + fs.keys.finance.current) / avg) * 1000) / 10 : null;
  const pv = (x: number | undefined) => (p ? x ?? null : undefined);
  const table: Table = { title: 'إدارة رأس المال', columns: yearCols(fs), rows: [
    R('القروض والتزامات الإيجار', c.borrowings, pv(p?.borrowings)), R('ناقصاً: النقد وما في حكمه', -c.cash, pv(p ? -p.cash : undefined)),
    R('صافي الدين (النقد)', c.netDebt, pv(p?.netDebt), 'subtotal'), R('مجموع حقوق الملكية', c.equity, pv(p?.equity)),
    R('صافي الدين وحقوق الملكية', c.netDebt + c.equity, pv(p ? p.netDebt + p.equity : undefined), 'total')],
    note: `نسبة المديونية = صافي الدين ÷ (صافي الدين + حقوق الملكية): ${c.gearing ?? '—'}%${p ? ` مقابل ${p.gearing ?? '—'}%` : ''} — بتعريف أرامكو السعودية (ص 10041 من الحزمة). العائد على متوسط رأس المال المستخدم = (صافي الربح + تكاليف التمويل) ÷ متوسط (القروض + حقوق الملكية): ${roace ?? '—'}% — تبسيط لتعريف أرامكو (ص 10042) قبل تعديلات البنود غير المتكررة.` };
  return { current: c, prior: p, roace, table };
}

/* ---------- key estimates: illustrative sensitivities (IAS 1.125–129) ---------- */
export function estimateSensitivities(fs: FinancialStatements) {
  const out: { ar: string; assumption: string; effect: Minor }[] = [];
  const cr = creditRisk(fs);
  if (cr.gross) out.push({ ar: 'الخسائر الائتمانية المتوقعة', assumption: 'ارتفاع معدلات الخسارة 10%، أو خسارة 0.1% من إجمالي الذمم إن لم يوجد مخصص', effect: -Math.round(cr.allowance ? cr.allowance * 0.1 : cr.gross * 0.001) });
  const inv = cur(fs, 'inventory'); if (inv) out.push({ ar: 'صافي القيمة القابلة للتحقق للمخزون', assumption: 'انخفاض أسعار البيع 5% على البضاعة بطيئة الحركة (10% من المخزون)', effect: -Math.round(inv * 0.1 * 0.05) });
  const eosb = cur(fs, 'eosb'); if (eosb) out.push({ ar: 'منافع نهاية الخدمة', assumption: 'زيادة الالتزام 5% بتغير معدل الخصم أو نمو الرواتب', effect: -Math.round(eosb * 0.05) });
  const da = fs.keys.depreciation.current; if (cur(fs, 'ppe') && da) out.push({ ar: 'الأعمار الإنتاجية للممتلكات والمعدات', assumption: 'قِصَر الأعمار المتبقية 10%', effect: -Math.round(da * 0.1) });
  const ir = interestSensitivity(fs); if (ir.debt) out.push({ ar: 'أسعار العمولة', assumption: 'زيادة 1% على القروض بعمولة متغيرة', effect: -ir.effect });
  return out;
}

/* ---------- the package: statement notes gain their tables; supplementary notes follow, numbered after them ---------- */
export type SupNote = { no: number; key: string; ar: string; en: string; tables: Table[]; text: string[] };
export function notesPackage(fs: FinancialStatements, opts: { calendar?: 'hijri' | 'gregorian'; country?: 'SA' | 'EG' } = {}) {
  let no = Math.max(0, ...fs.notes.map((n) => n.no)) + 1;
  const sup: SupNote[] = [];
  const push = (key: string, ar: string, en: string, tables: (Table | null)[], text: string[] = []) => {
    const t = tables.filter((x): x is Table => !!x); if (!t.length && !text.length) return; sup.push({ no: no++, key, ar, en, tables: t, text });
  };
  const byNature = expensesByNature(fs);
  if (byNature.total) push('nature', 'المصروفات حسب طبيعتها', 'Expenses by nature', [byNature.table]);
  const cr = creditRisk(fs), ir = interestSensitivity(fs), eg = opts.country === 'EG';
  push('risk', 'إدارة المخاطر المالية', 'Financial risk management', [cr.table, maturityAnalysis(fs)], [
    'مخاطر الائتمان: تنشأ من النقد لدى البنوك والذمم المدينة؛ تودع المنشأة النقد لدى بنوك ذات تصنيف ائتماني جيد وتراقب أعمار الذمم وحدود الائتمان.',
    'مخاطر السيولة: تدار بمطابقة استحقاقات الموجودات والمطلوبات والاحتفاظ بتسهيلات كافية.',
    'مخاطر أسعار العمولة: ' + (ir.debt ? `زيادة الأسعار 1% تخفض الربح قبل ${eg ? 'الضريبة' : 'الزكاة'} بنحو ${(Math.round(ir.effect / 100)).toLocaleString('en')} (بافتراض عمولة متغيرة)، والانخفاض بالقدر نفسه يرفعه بالمبلغ ذاته.` : 'لا قروض بعمولة معرضة لتغير الأسعار.'),
    eg ? 'مخاطر العملات: معاملات المنشأة بالجنيه المصري أساساً، وتتعرض لتقلب سعر الصرف على المعاملات والأرصدة بالعملات الأجنبية.'
      : 'مخاطر العملات: معاملات المنشأة بالريال السعودي أساساً، والريال مرتبط بالدولار الأمريكي.']);
  push('capital', 'إدارة رأس المال', 'Capital management', [capitalManagement(fs).table],
    ['تهدف المنشأة من إدارة رأس المال إلى حماية قدرتها على الاستمرار وتحقيق عائد للشركاء، وتراقب هيكل رأس المال بنسبة المديونية.']);
  const fin = financingReconciliation(fs);
  push('financing', 'المطلوبات الناشئة عن الأنشطة التمويلية', 'Liabilities from financing activities', [fin]);
  const sens = estimateSensitivities(fs);
  if (sens.length) push('sensitivity', 'تحليل حساسية التقديرات الرئيسية', 'Sensitivity of key estimates', [{ title: `أثر تغير معقول في الافتراضات على الربح قبل ${eg ? 'الضريبة' : 'الزكاة'}`, columns: ['', 'الأثر'],
    rows: sens.map((s) => R(`${s.ar} — ${s.assumption}`, s.effect)), note: 'تحليل توضيحي مبني على الأرصدة؛ يُستبدل بتحليل الإدارة لافتراضاتها الفعلية (IAS 1.129).' }]);
  const zakat = eg ? null : zakatNote(fs, opts);
  const lineTables: Record<string, Table[]> = {};
  const at = (k: string, t: Table | null) => { if (t) (lineTables[k] ||= []).push(t); };
  if (zakat) { at('zakatPayable', zakat.movement); at('zakatExpense', zakat.base); }
  at('eosb', eosbMovement(fs)); at('provisions', provisionsMovement(fs));
  const debtNow = ['loansCl', 'loansNcl', 'leaseNcl'].reduce((t, k) => t + cur(fs, k), 0);
  return { lineTables, supplementary: sup, zakat, byNature, checks: { byNatureTies: byNature.ties, financingTies: !fin || fin.rows.at(-1)!.values[3] === debtNow } };
}

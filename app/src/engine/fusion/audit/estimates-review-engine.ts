/* Retrospective review of accounting estimates (ISA 540.14 · ISA 240.32(b)(ii)) — the procedure that runs through
   almost every key audit matter in the world's auditor's reports: last year's estimate against what actually happened.
   Unilever compared prior-year rebate accruals to actual spend «in aggregate and over time to identify trends that
   could suggest management bias»; Novartis compared recorded rebate provisions to amounts ultimately paid; Berkshire
   compared prior-year loss estimates to actual experience; bp performed «a retrospective analysis of management
   judgements… of the prior year»; Unilever did the same for tax assessments against earlier estimates.
   An outcome above the estimate means the estimate was too low (under-provided); below means too high. Amounts in
   minor units. The review is not a finding of error: a difference is judged against materiality and for direction. */
export type EstimateItem = { key: string; label: string; priorEstimate: number; outcome: number | null; basis?: string };
export type EstimateResult = EstimateItem & { diff: number; pct: number | null; direction: 'under' | 'over' | 'accurate' | 'pending';
  significance: 'trivial' | 'below-performance' | 'above-performance' | 'material' | 'pending' };

/** The estimates a trial balance usually carries, with last year's balance as the estimate to test. */
export const ESTIMATE_KINDS: { key: string; label: string; outcome: string; kws: RegExp }[] = [
  { key: 'ecl', label: 'مخصص الخسائر الائتمانية المتوقعة', outcome: 'الديون المعدومة الفعلية من أرصدة السنة السابقة', kws: /خسائر ائتماني|مشكوك|ديون معدوم|allowance|doubtful/i },
  { key: 'inventory', label: 'مخصص المخزون (التلف وبطء الحركة)', outcome: 'الشطب الفعلي للمخزون المخصص له', kws: /مخصص.*مخزون|مخزون.*مخصص|تلف|بطيء|obsolete/i },
  { key: 'zakat', label: 'مخصص الزكاة', outcome: 'الزكاة المسددة أو الربط النهائي عن السنة السابقة', kws: /زكاه|زكاة|zakat/i },
  { key: 'eosb', label: 'التزام نهاية الخدمة', outcome: 'المدفوع للمغادرين + الالتزام المعاد تقديره لهم', kws: /نهايه الخدمه|نهاية الخدمة|end of service|eosb/i },
  { key: 'provisions', label: 'المخصصات الأخرى والقضايا', outcome: 'المبالغ المسددة أو المحكوم بها', kws: /مخصص|provision/i },
  { key: 'accruals', label: 'المصروفات المستحقة والخصومات', outcome: 'المبالغ المفوترة أو المدفوعة فعلاً بعد نهاية السنة', kws: /مستحق|accru|خصومات/i },
];

export function reviewEstimates(items: EstimateItem[], o: { performance: number; overall: number; trivial: number }) {
  const rows: EstimateResult[] = items.map((x) => {
    if (x.outcome === null || !Number.isFinite(x.outcome)) return { ...x, diff: 0, pct: null, direction: 'pending', significance: 'pending' };
    const diff = x.outcome - x.priorEstimate, ad = Math.abs(diff);
    const pct = x.priorEstimate ? Math.round((diff / Math.abs(x.priorEstimate)) * 1000) / 10 : null;
    const direction = ad <= o.trivial || (pct !== null && Math.abs(pct) <= 5) ? 'accurate' : diff > 0 ? 'under' : 'over';
    const significance = ad <= o.trivial ? 'trivial' : ad < o.performance ? 'below-performance' : ad < o.overall ? 'above-performance' : 'material';
    return { ...x, diff, pct, direction, significance };
  });
  const done = rows.filter((r) => r.direction !== 'pending'), under = done.filter((r) => r.direction === 'under'), over = done.filter((r) => r.direction === 'over');
  const net = done.reduce((s, r) => s + r.diff, 0);
  /* bias: several estimates wrong the same way, or the net effect beyond performance materiality */
  const oneWay = (under.length >= 2 && over.length === 0) || (over.length >= 2 && under.length === 0);
  const bias = oneWay || Math.abs(net) >= o.performance;
  const side = under.length > over.length ? 'optimistic' : over.length > under.length ? 'pessimistic' : 'mixed';
  const message = !done.length ? 'أدخل النتيجة الفعلية لكل تقدير لإكمال المراجعة بأثر رجعي.'
    : bias ? (side === 'optimistic' ? 'تقديرات السنة السابقة جاءت أقل من الواقع في اتجاه واحد — مؤشر تحيز متفائل يرفع الربح؛ وسّع اختبار تقديرات السنة الحالية وقيّم خطر الغش (ISA 240).'
      : side === 'pessimistic' ? 'تقديرات السنة السابقة جاءت أعلى من الواقع في اتجاه واحد — مؤشر تحيز متحفظ قد يُستخدم لتسوية الأرباح بين السنوات؛ قيّم عكس المخصصات الزائدة.'
      : 'صافي فروقات التقديرات يتجاوز الأهمية التنفيذية؛ راجع منهجية التقدير قبل الاعتماد على تقديرات السنة الحالية.')
    : 'لا يظهر نمط تحيز: الفروقات ضمن الحدود أو متوازنة الاتجاه. يُوثق الاستنتاج في ملف المراجعة.';
  return { rows, under: under.length, over: over.length, accurate: done.filter((r) => r.direction === 'accurate').length, pending: rows.length - done.length, net, bias, side, message };
}

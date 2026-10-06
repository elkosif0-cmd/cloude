/* Relationship Health / Integration Monitor (FOUNDATION §3.6 «تركيب الأدوات المساعدة داخل المحاسبة»): every link between the
   books and what feeds them is checked, and a broken one is named with its source instead of silently corrupting results.
   The links checked, each a rule with the data it reads:
     • mapping   — a definition (cost centre, warehouse, unit…) or a sector-pack tool pointing at an account that is not in
                   the chart, or a pack account the sector posts to that is missing;
     • posting   — operations recorded in a helper tool (sales, goods received) and not yet posted, and how old the oldest is;
     • reference — an entry whose sector meta names an object that no longer exists (a contract, a term, an order, a product,
                   a cycle, a campaign, a branch);
     • sync      — an entry on an account outside the chart, one operation posted twice, an unbalanced entry;
     • party     — receivable or payable lines with no party, which the ageing cannot place.
   Each finding carries the link, what it reads, the source of the error and a suggested repair. The check is pure: it reads
   the books and their stores and changes nothing; the screen keeps a dated history of the runs. */

export type RhSeverity = 'ok' | 'warn' | 'fail';
export type RhFinding = { link: 'mapping' | 'posting' | 'reference' | 'sync' | 'party'; severity: RhSeverity; title: string; source: string; count: number; repair: string; sample?: string[] };
export type RhInput = {
  accounts: { id: string; code: string; name: string }[];
  entries: { id: string; date: string; sourceId?: string; party?: string; reversedBy?: string; reversalOf?: string; lines: { accountId: string; debit: number; credit: number }[]; [meta: string]: unknown }[];
  /** definitions by type (cost centres, warehouses…) with the account code each maps to, if any */
  definitions?: Record<string, { id: string; name: string; accountCode?: string }[]>;
  /** the account codes the company's sector pack posts to */
  packCodes?: string[];
  /** operations recorded in helper tools and not yet posted */
  pending?: { total: number; oldest: string | null };
  /** the objects sector entries refer to, by kind: ids (or names) that exist */
  objects?: Partial<Record<'contract' | 'term' | 'order' | 'product' | 'cycle' | 'retainer' | 'branch', string[]>>;
  asOf: string;
  /** operations older than this many days and still unposted are a failure, not a warning */
  staleDays?: number;
};

const REF: { meta: string; field: string; kind: keyof NonNullable<RhInput['objects']>; label: string }[] = [
  { meta: 'contract', field: 'id', kind: 'contract', label: 'عقد مقاولات' }, { meta: 'tuition', field: 'termId', kind: 'term', label: 'فصل دراسي' },
  { meta: 'production', field: 'orderId', kind: 'order', label: 'أمر تشغيل' }, { meta: 'production', field: 'productId', kind: 'product', label: 'منتج أو وصفة' },
  { meta: 'livestock', field: 'cycleId', kind: 'cycle', label: 'دورة زراعية' }, { meta: 'agency', field: 'retainerId', kind: 'retainer', label: 'اشتراك عميل' },
  { meta: 'trade', field: 'branch', kind: 'branch', label: 'فرع' },
];
const CONTROL = new Set(['1200', '1210', '2100', '2150', '2160', '2170']);
const days = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);

export function relationshipHealth(x: RhInput): { status: RhSeverity; findings: RhFinding[]; checked: number } {
  const findings: RhFinding[] = [], byId = new Map(x.accounts.map((a) => [a.id, a])), codes = new Set(x.accounts.map((a) => String(a.code)));
  const add = (f: RhFinding) => { if (f.count) findings.push(f); };
  /* mapping */
  const badDefs: string[] = [];
  for (const [type, list] of Object.entries(x.definitions ?? {})) for (const d of list) if (d.accountCode && !codes.has(String(d.accountCode))) badDefs.push(d.name + ' → ' + d.accountCode + ' (' + type + ')');
  add({ link: 'mapping', severity: 'fail', title: 'تعريفات مربوطة بحسابات غير موجودة في الدليل', source: 'التعريفات الأساسية للشركة', count: badDefs.length, repair: 'أعد ربط التعريف بحساب قائم أو افتح الحساب من «دليل الحسابات»', sample: badDefs.slice(0, 5) });
  const missingPack = (x.packCodes ?? []).filter((c) => !codes.has(String(c)));
  add({ link: 'mapping', severity: 'warn', title: 'حسابات حزمة القطاع غير مفتوحة', source: 'حزمة القطاع', count: missingPack.length, repair: 'أضفها من «دليل الحسابات» › «إضافة حسابات قطاع»', sample: missingPack.slice(0, 8) });
  /* posting */
  const p = x.pending ?? { total: 0, oldest: null }, age = p.oldest ? days(p.oldest, x.asOf) : 0;
  add({ link: 'posting', severity: age > (x.staleDays ?? 30) ? 'fail' : 'warn', title: 'عمليات مسجلة في الأدوات ولم تُرحّل إلى الدفاتر', source: 'المبيعات والاستلام', count: p.total,
    repair: 'رحّلها من «الإقفال الشهري» قبل إقفال الفترة', sample: p.oldest ? ['أقدمها ' + p.oldest + ' (' + age + ' يوماً)'] : [] });
  /* reference: sector meta pointing at objects that no longer exist */
  const live = x.entries.filter((e) => !e.reversedBy && !e.reversalOf);
  for (const r of REF) {
    const known = x.objects?.[r.kind]; if (!known) continue;
    const set = new Set(known), broken: string[] = [];
    for (const e of live) { const m = e[r.meta] as Record<string, unknown> | undefined, v = m && m[r.field]; if (typeof v === 'string' && v && !set.has(v)) broken.push(e.date + ' ' + v); }
    add({ link: 'reference', severity: 'fail', title: 'قيود تشير إلى ' + r.label + ' غير موجود', source: 'بيانات القطاع (' + r.meta + ')', count: broken.length, repair: 'استعد ' + r.label + ' المحذوف أو اعكس القيود المرتبطة به', sample: broken.slice(0, 5) });
  }
  /* sync */
  const orphan = x.entries.filter((e) => e.lines.some((l) => !byId.has(l.accountId))).map((e) => e.date + ' ' + e.id);
  add({ link: 'sync', severity: 'fail', title: 'قيود على حسابات خارج الدليل', source: 'الدفاتر', count: orphan.length, repair: 'أعد الحساب المحذوف أو اعكس القيد وأعد ترحيله', sample: orphan.slice(0, 5) });
  const seen = new Map<string, number>(); for (const e of live) if (e.sourceId) seen.set(e.sourceId, (seen.get(e.sourceId) ?? 0) + 1);
  const dup = [...seen.entries()].filter(([, n]) => n > 1).map(([k, n]) => k + ' ×' + n);
  add({ link: 'sync', severity: 'fail', title: 'عملية مرحّلة أكثر من مرة', source: 'مصدر العملية (sourceId)', count: dup.length, repair: 'اعكس القيد المكرر', sample: dup.slice(0, 5) });
  const unbalanced = x.entries.filter((e) => Math.round(e.lines.reduce((s, l) => s + l.debit - l.credit, 0) * 100) !== 0).map((e) => e.date + ' ' + e.id);
  add({ link: 'sync', severity: 'fail', title: 'قيود غير متزنة', source: 'الدفاتر', count: unbalanced.length, repair: 'اعكس القيد وأعد إدخاله متزناً', sample: unbalanced.slice(0, 5) });
  /* party */
  const noParty = live.filter((e) => !String(e.party || '').trim() && e.lines.some((l) => { const a = byId.get(l.accountId); return !!a && CONTROL.has(String(a.code)) && (l.debit || l.credit); })).map((e) => e.date + ' ' + e.id);
  add({ link: 'party', severity: 'warn', title: 'حركات ذمم بلا طرف (عميل أو مورد)', source: 'الذمم المدينة والدائنة', count: noParty.length, repair: 'حدد الطرف حتى تظهر في الأعمار وكشوف الحساب', sample: noParty.slice(0, 5) });
  const status: RhSeverity = findings.some((f) => f.severity === 'fail') ? 'fail' : findings.length ? 'warn' : 'ok';
  return { status, findings, checked: 5 + REF.filter((r) => x.objects?.[r.kind]).length };
}

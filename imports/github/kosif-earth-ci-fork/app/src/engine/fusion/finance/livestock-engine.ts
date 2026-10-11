/* the agriculture pack (FOUNDATION §3.6 «الزراعة/المزارع»): a production cycle — a flock in a barn or a crop in a field —
   is a cost centre with its own head count and cost. Animals bought and the feed and inputs consumed are capitalised into
   the biological asset (1395, from the feed store 1396); births add heads without cost, so the cost per head falls;
   deaths and losses are written off at the average cost per head (5190); a sale takes its heads out at the average cost
   (5000) against the revenue. IAS 41: a biological asset is measured at fair value less costs to sell when that can be
   measured reliably — `fairValueJournal` remeasures a cycle to it with the gain or loss in profit or loss (4950); a farm
   that cannot measure it reliably keeps the cost model. Money is in halalas. */

export type FarmAccounts = { biologicalAccountId: string; feedAccountId: string; cashAccountId: string; receivableAccountId: string; payableAccountId?: string;
  inputVatAccountId?: string; outputVatAccountId?: string; revenueAccountId: string; cogsAccountId: string; mortalityAccountId: string; fairValueAccountId?: string };
export type Cycle = { id: string; name: string; unit: string };
export type CycleState = { heads: number; costHalalas: number; bought: number; born: number; dead: number; sold: number; feedHalalas: number; revenueHalalas: number; cogsHalalas: number; fairValueHalalas: number };

const sar = (h: number) => h / 100;
const whole = (n: unknown) => Number.isInteger(n) && (n as number) > 0;
export const emptyCycleState = (): CycleState => ({ heads: 0, costHalalas: 0, bought: 0, born: 0, dead: 0, sold: 0, feedHalalas: 0, revenueHalalas: 0, cogsHalalas: 0, fairValueHalalas: 0 });
/** the carrying amount per head, the basis of every head that leaves the cycle */
export const costPerHead = (s: CycleState) => (s.heads > 0 ? Math.round(s.costHalalas / s.heads) : 0);
const out = (s: CycleState, n: number) => (n === s.heads ? s.costHalalas : costPerHead(s) * n);

/** animals (or seed and seedlings) bought into the cycle, paid or on credit */
export function stockingJournal(c: Cycle, x: { id: string; date: string; heads: number; amountHalalas: number; supplier?: string; onCredit?: boolean }, vatRate: number, a: FarmAccounts) {
  if (!whole(x.heads)) throw new Error('عدد الرؤوس غير صالح');
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('قيمة الشراء يجب أن تكون أكبر من صفر');
  const vat = vatRate > 0 ? Math.round(x.amountHalalas * vatRate) : 0;
  if (vat && !a.inputVatAccountId) throw new Error('حساب ضريبة المدخلات غير موجود');
  if (x.onCredit && (!a.payableAccountId || !String(x.supplier || '').trim())) throw new Error('الشراء الآجل يحتاج المورد وحساب الموردين');
  const pay = x.onCredit ? (a.payableAccountId as string) : a.cashAccountId;
  return { vat, journal: { id: x.id, date: x.date, reference: 'STOCK-' + c.id, memo: 'شراء ' + x.heads + ' ' + c.unit + ' — ' + c.name, party: x.onCredit ? x.supplier : undefined, lines: [
    { accountId: a.biologicalAccountId, debit: sar(x.amountHalalas), credit: 0, description: c.name },
    ...(vat ? [{ accountId: a.inputVatAccountId as string, debit: sar(vat), credit: 0, description: 'ضريبة المدخلات' }] : []),
    { accountId: pay, debit: 0, credit: sar(x.amountHalalas + vat), description: x.supplier || 'نقداً' },
  ] } };
}

/** feed and inputs bought into the feed store on credit */
export function feedPurchaseJournal(x: { id: string; date: string; supplier: string; amountHalalas: number }, vatRate: number, a: FarmAccounts) {
  if (!String(x.supplier || '').trim() || !a.payableAccountId) throw new Error('حدد مورد الأعلاف');
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('قيمة الأعلاف يجب أن تكون أكبر من صفر');
  const vat = vatRate > 0 ? Math.round(x.amountHalalas * vatRate) : 0;
  if (vat && !a.inputVatAccountId) throw new Error('حساب ضريبة المدخلات غير موجود');
  return { vat, journal: { id: x.id, date: x.date, reference: 'FEEDPO-' + x.id, memo: 'شراء أعلاف ومدخلات — ' + x.supplier, party: x.supplier, lines: [
    { accountId: a.feedAccountId, debit: sar(x.amountHalalas), credit: 0, description: 'مخزن الأعلاف' },
    ...(vat ? [{ accountId: a.inputVatAccountId as string, debit: sar(vat), credit: 0, description: 'ضريبة المدخلات' }] : []),
    { accountId: a.payableAccountId, debit: 0, credit: sar(x.amountHalalas + vat), description: x.supplier },
  ] } };
}

/** feed consumed by a cycle, capitalised into its cost (never more than the feed store holds) */
export function feedingJournal(c: Cycle, s: CycleState, x: { id: string; date: string; amountHalalas: number; feedOnHandHalalas: number }, a: FarmAccounts) {
  if (s.heads <= 0) throw new Error('لا رؤوس في ' + c.name);
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('قيمة الأعلاف المستهلكة يجب أن تكون أكبر من صفر');
  if (x.amountHalalas > x.feedOnHandHalalas) throw new Error('الأعلاف المستهلكة أكثر من رصيد مخزن الأعلاف');
  return { journal: { id: x.id, date: x.date, reference: 'FEED-' + c.id, memo: 'أعلاف مستهلكة — ' + c.name, lines: [
    { accountId: a.biologicalAccountId, debit: sar(x.amountHalalas), credit: 0, description: c.name },
    { accountId: a.feedAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'مخزن الأعلاف' },
  ] } };
}

/** deaths or losses: written off at the average cost per head */
export function mortalityJournal(c: Cycle, s: CycleState, x: { id: string; date: string; heads: number; cause: string }, a: FarmAccounts) {
  if (!whole(x.heads) || x.heads > s.heads) throw new Error('عدد النافق أكثر من رؤوس ' + c.name);
  if (!String(x.cause || '').trim()) throw new Error('سبب النفوق أو الهدر مطلوب');
  const cost = out(s, x.heads);
  return { cost, journal: { id: x.id, date: x.date, reference: 'MORT-' + c.id, memo: 'نفوق ' + x.heads + ' ' + c.unit + ' — ' + c.name + ': ' + x.cause.trim(), lines: [
    { accountId: a.mortalityAccountId, debit: sar(cost), credit: 0, description: x.cause.trim() },
    { accountId: a.biologicalAccountId, debit: 0, credit: sar(cost), description: c.name },
  ].filter((l) => l.debit || l.credit) } };
}

/** a sale: the revenue (cash or to a named customer) and the heads' average cost out of the cycle */
export function saleJournals(c: Cycle, s: CycleState, x: { id: string; date: string; heads: number; amountHalalas: number; customer?: string; onCredit?: boolean }, vatRate: number, a: FarmAccounts) {
  if (!whole(x.heads) || x.heads > s.heads) throw new Error('الرؤوس المباعة أكثر من رؤوس ' + c.name);
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('قيمة البيع يجب أن تكون أكبر من صفر');
  if (x.onCredit && !String(x.customer || '').trim()) throw new Error('البيع الآجل يحتاج اسم العميل');
  const vat = vatRate > 0 ? Math.round(x.amountHalalas * vatRate) : 0;
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  const cost = out(s, x.heads), to = x.onCredit ? a.receivableAccountId : a.cashAccountId;
  return { vat, cost, journal: { id: x.id, date: x.date, reference: 'SALE-' + c.id, memo: 'بيع ' + x.heads + ' ' + c.unit + ' — ' + c.name, party: x.onCredit ? x.customer : undefined, lines: [
    { accountId: to, debit: sar(x.amountHalalas + vat), credit: 0, description: x.customer || 'نقداً' },
    { accountId: a.revenueAccountId, debit: 0, credit: sar(x.amountHalalas), description: c.name },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة المخرجات' }] : []),
  ] }, costJournal: { id: x.id + '-c', date: x.date, reference: 'COGS-' + c.id, memo: 'تكلفة ' + x.heads + ' ' + c.unit + ' مباعة بمتوسط ' + sar(costPerHead(s)), lines: [
    { accountId: a.cogsAccountId, debit: sar(cost), credit: 0, description: c.name },
    { accountId: a.biologicalAccountId, debit: 0, credit: sar(cost), description: c.name },
  ] } };
}

/** IAS 41: the cycle remeasured to fair value less costs to sell per head; the change is a gain or a loss of the period */
export function fairValueJournal(c: Cycle, s: CycleState, x: { id: string; date: string; fairValuePerHeadHalalas: number; costsToSellPerHeadHalalas: number }, a: FarmAccounts) {
  if (!a.fairValueAccountId) throw new Error('حساب أرباح وخسائر القيمة العادلة للأصول الحيوية غير موجود');
  if (s.heads <= 0) throw new Error('لا رؤوس في ' + c.name);
  for (const v of [x.fairValuePerHeadHalalas, x.costsToSellPerHeadHalalas]) if (!Number.isInteger(v) || v < 0) throw new Error('القيمة العادلة أو تكاليف البيع غير صالحة');
  const target = (x.fairValuePerHeadHalalas - x.costsToSellPerHeadHalalas) * s.heads, change = target - s.costHalalas;
  if (target < 0) throw new Error('تكاليف البيع أكبر من القيمة العادلة');
  if (!change) throw new Error('القيمة الدفترية تساوي القيمة العادلة ناقص تكاليف البيع');
  return { change, target, journal: { id: x.id, date: x.date, reference: 'FV-' + c.id, memo: 'إعادة قياس ' + c.name + ' بالقيمة العادلة ناقص تكاليف البيع (معيار المحاسبة الدولي 41)', lines: change > 0 ? [
    { accountId: a.biologicalAccountId, debit: sar(change), credit: 0, description: s.heads + ' ' + c.unit },
    { accountId: a.fairValueAccountId, debit: 0, credit: sar(change), description: 'ربح إعادة القياس' },
  ] : [
    { accountId: a.fairValueAccountId, debit: sar(-change), credit: 0, description: 'خسارة إعادة القياس' },
    { accountId: a.biologicalAccountId, debit: 0, credit: sar(-change), description: s.heads + ' ' + c.unit },
  ] } };
}

/** a cycle's KPIs: heads, cost per head, mortality and birth rates, feed per head, margin on what was sold */
export function cycleKpis(s: CycleState) {
  const r2 = (v: number) => Math.round(v * 100) / 100, base = s.bought + s.born;
  return { heads: s.heads, costPerHeadHalalas: costPerHead(s), mortalityPct: base ? r2((s.dead / base) * 100) : null, birthPct: s.bought ? r2((s.born / s.bought) * 100) : null,
    feedPerHeadHalalas: base ? Math.round(s.feedHalalas / base) : null, marginHalalas: s.revenueHalalas - s.cogsHalalas,
    marginPct: s.revenueHalalas ? r2(((s.revenueHalalas - s.cogsHalalas) / s.revenueHalalas) * 100) : null };
}

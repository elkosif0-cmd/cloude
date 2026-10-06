/* production for the manufacturing and bakery packs (FOUNDATION §3.6 «المصانع» و«المخابز»):
   • a product's standard cost from its bill of materials (or recipe), its labour and its overhead per unit;
   • a factory's production order: raw materials issued into work in progress (1370 → 1380), direct labour and overhead
     absorbed at standard (6100 / 6300 → 1380), finished goods received at standard (1380 → 1390), scrap at its cost
     (5100), and the rest of the order's work in progress closed to the cost variance (5170, adverse or favourable) —
     so an order closes with no work in progress left;
   • a bakery's batch: ingredients and the bakers' wages straight into baked goods at actual cost (1370 + 6100 → 1390),
     its yield against the recipe, and expired or damaged goods written off (5180);
   • cost of sales out of finished goods, and the KPIs: yield, scrap rate, variance, unit cost and a price at a target margin.
   Money is in halalas; quantities in the product's unit. */

export type BomLine = { material: string; qtyPerUnit: number; unitCostHalalas: number };
export type Product = { id: string; name: string; unit: string; bom: BomLine[]; labourPerUnitHalalas: number; overheadPerUnitHalalas: number };
export type ProductionAccounts = { materialsAccountId: string; wipAccountId?: string; finishedAccountId: string; labourAccountId: string; overheadAccountId: string;
  scrapAccountId: string; varianceAccountId?: string; wasteAccountId?: string; cogsAccountId: string; payableAccountId?: string; inputVatAccountId?: string };
export type OrderState = { issuedHalalas: number; absorbedHalalas: number; completedHalalas: number; scrapHalalas: number; goodQty: number; scrapQty: number; closed: boolean };

const sar = (h: number) => h / 100;
const pos = (v: unknown) => Number.isFinite(v) && (v as number) > 0;
export const emptyOrderState = (): OrderState => ({ issuedHalalas: 0, absorbedHalalas: 0, completedHalalas: 0, scrapHalalas: 0, goodQty: 0, scrapQty: 0, closed: false });

/** a product's standard cost per unit: materials from the bill of materials, labour and overhead */
export function standardCost(p: Product) {
  if (!String(p.name || '').trim()) throw new Error('سمِّ المنتج');
  if (!Array.isArray(p.bom) || !p.bom.length) throw new Error('قائمة المواد (الوصفة) فارغة');
  for (const l of p.bom) if (!String(l.material || '').trim() || !pos(l.qtyPerUnit) || !Number.isInteger(l.unitCostHalalas) || l.unitCostHalalas < 0) throw new Error('سطر غير صالح في قائمة المواد');
  for (const v of [p.labourPerUnitHalalas, p.overheadPerUnitHalalas]) if (!Number.isInteger(v) || v < 0) throw new Error('تكلفة الأجور أو التحميل غير صالحة');
  const materials = Math.round(p.bom.reduce((s, l) => s + l.qtyPerUnit * l.unitCostHalalas, 0));
  return { materials, labour: p.labourPerUnitHalalas, overhead: p.overheadPerUnitHalalas, total: materials + p.labourPerUnitHalalas + p.overheadPerUnitHalalas };
}

/** raw materials or ingredients bought on credit */
export function materialsPurchaseJournal(x: { id: string; date: string; supplier: string; amountHalalas: number }, vatRate: number, a: ProductionAccounts) {
  if (!String(x.supplier || '').trim()) throw new Error('حدد المورد');
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('مبلغ الشراء يجب أن يكون أكبر من صفر');
  if (!a.payableAccountId) throw new Error('حساب الموردين غير موجود');
  const vat = vatRate > 0 ? Math.round(x.amountHalalas * vatRate) : 0;
  if (vat && !a.inputVatAccountId) throw new Error('حساب ضريبة المدخلات غير موجود');
  return { vat, journal: { id: x.id, date: x.date, reference: 'PO-' + x.id, memo: 'شراء مواد — ' + x.supplier, party: x.supplier, lines: [
    { accountId: a.materialsAccountId, debit: sar(x.amountHalalas), credit: 0, description: 'مواد ومكونات' },
    ...(vat ? [{ accountId: a.inputVatAccountId as string, debit: sar(vat), credit: 0, description: 'ضريبة المدخلات' }] : []),
    { accountId: a.payableAccountId, debit: 0, credit: sar(x.amountHalalas + vat), description: x.supplier },
  ] } };
}

/* ---------- the factory's production order ---------- */
export type Order = { id: string; productId: string; plannedQty: number };

/** materials issued to the order at their actual cost, never more than the materials store holds */
export function issueJournal(o: Order, x: { id: string; date: string; amountHalalas: number; materialsOnHandHalalas: number }, a: ProductionAccounts) {
  if (!a.wipAccountId) throw new Error('حساب الإنتاج تحت التشغيل غير موجود');
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('قيمة المواد المصروفة يجب أن تكون أكبر من صفر');
  if (x.amountHalalas > x.materialsOnHandHalalas) throw new Error('المواد المصروفة أكثر من رصيد مخزن المواد');
  return { journal: { id: x.id, date: x.date, reference: 'MI-' + o.id, memo: 'صرف مواد لأمر التشغيل ' + o.id, lines: [
    { accountId: a.wipAccountId, debit: sar(x.amountHalalas), credit: 0, description: 'أمر ' + o.id },
    { accountId: a.materialsAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'مخزن المواد' },
  ] } };
}

/** labour and overhead absorbed into the order at standard for the units worked */
export function absorbJournal(o: Order, p: Product, x: { id: string; date: string; units: number }, a: ProductionAccounts) {
  if (!a.wipAccountId) throw new Error('حساب الإنتاج تحت التشغيل غير موجود');
  if (!pos(x.units)) throw new Error('عدد الوحدات المشغّلة غير صالح');
  const std = standardCost(p), labour = Math.round(std.labour * x.units), overhead = Math.round(std.overhead * x.units);
  if (!labour && !overhead) throw new Error('لا أجور ولا تحميل في التكلفة المعيارية للمنتج');
  return { labour, overhead, journal: { id: x.id, date: x.date, reference: 'ABS-' + o.id, memo: 'تحميل الأجور والتكاليف غير المباشرة — أمر ' + o.id, lines: [
    { accountId: a.wipAccountId, debit: sar(labour + overhead), credit: 0, description: x.units + ' ' + p.unit },
    ...(labour ? [{ accountId: a.labourAccountId, debit: 0, credit: sar(labour), description: 'أجور محمّلة' }] : []),
    ...(overhead ? [{ accountId: a.overheadAccountId, debit: 0, credit: sar(overhead), description: 'تحميل صناعي' }] : []),
  ] } };
}

/** the order completed: good units into finished goods at standard, scrap at standard cost, and whatever work in progress
    is left closed to the variance account — an adverse variance is a debit, a favourable one a credit */
export function completeJournal(o: Order, p: Product, s: OrderState, x: { id: string; date: string; goodQty: number; scrapQty: number }, a: ProductionAccounts) {
  if (!a.wipAccountId || !a.varianceAccountId) throw new Error('حسابا الإنتاج تحت التشغيل والانحرافات مطلوبان');
  if (s.closed) throw new Error('أُقفل أمر التشغيل من قبل');
  if (!pos(x.goodQty) || !(Number.isFinite(x.scrapQty) && x.scrapQty >= 0)) throw new Error('الكميات غير صالحة');
  if (!s.issuedHalalas) throw new Error('لم تُصرف مواد لهذا الأمر');
  const std = standardCost(p), good = Math.round(std.total * x.goodQty), scrap = Math.round(std.materials * x.scrapQty);
  const wip = s.issuedHalalas + s.absorbedHalalas - s.completedHalalas - s.scrapHalalas, variance = wip - good - scrap;
  if (wip <= 0) throw new Error('لا رصيد تحت التشغيل لهذا الأمر');
  return { good, scrap, variance, journal: { id: x.id, date: x.date, reference: 'FG-' + o.id, memo: 'إقفال أمر التشغيل ' + o.id + ' — ' + x.goodQty + ' ' + p.unit + ' ' + p.name, lines: [
    { accountId: a.finishedAccountId, debit: sar(good), credit: 0, description: x.goodQty + ' ' + p.unit + ' بالتكلفة المعيارية' },
    ...(scrap ? [{ accountId: a.scrapAccountId, debit: sar(scrap), credit: 0, description: 'هالك ' + x.scrapQty + ' ' + p.unit }] : []),
    ...(variance > 0 ? [{ accountId: a.varianceAccountId, debit: sar(variance), credit: 0, description: 'انحراف غير مواتٍ' }] : []),
    { accountId: a.wipAccountId, debit: 0, credit: sar(wip), description: 'إقفال تحت التشغيل' },
    ...(variance < 0 ? [{ accountId: a.varianceAccountId, debit: 0, credit: sar(-variance), description: 'انحراف مواتٍ' }] : []),
  ].filter((l) => l.debit || l.credit) } };
}

/* ---------- the bakery's batch ---------- */
/** a batch baked: ingredients used and the bakers' wages into baked goods at actual cost; yield against the recipe */
export function batchJournal(p: Product, x: { id: string; date: string; plannedQty: number; goodQty: number; ingredientsHalalas: number; wagesHalalas: number; ingredientsOnHandHalalas: number }, a: ProductionAccounts) {
  if (!pos(x.plannedQty) || !pos(x.goodQty)) throw new Error('كميات الدفعة غير صالحة');
  if (!Number.isInteger(x.ingredientsHalalas) || x.ingredientsHalalas <= 0) throw new Error('قيمة المكونات المستخدمة يجب أن تكون أكبر من صفر');
  if (!Number.isInteger(x.wagesHalalas) || x.wagesHalalas < 0) throw new Error('الأجور غير صالحة');
  if (x.ingredientsHalalas > x.ingredientsOnHandHalalas) throw new Error('المكونات المستخدمة أكثر من رصيد مخزن المكونات');
  const cost = x.ingredientsHalalas + x.wagesHalalas, r2 = (v: number) => Math.round(v * 100) / 100;
  return { cost, unitCost: Math.round(cost / x.goodQty), yieldPct: r2((x.goodQty / x.plannedQty) * 100), standardUnit: standardCost(p).total,
    journal: { id: x.id, date: x.date, reference: 'BATCH-' + x.id, memo: 'دفعة ' + p.name + ' — ' + x.goodQty + ' ' + p.unit, lines: [
      { accountId: a.finishedAccountId, debit: sar(cost), credit: 0, description: x.goodQty + ' ' + p.unit + ' ' + p.name },
      { accountId: a.materialsAccountId, debit: 0, credit: sar(x.ingredientsHalalas), description: 'مكونات' },
      ...(x.wagesHalalas ? [{ accountId: a.labourAccountId, debit: 0, credit: sar(x.wagesHalalas), description: 'أجور الخبازين المحمّلة' }] : []),
    ] } };
}

/** expired or damaged goods written off at their cost */
export function wasteJournal(x: { id: string; date: string; amountHalalas: number; reason: string; finishedOnHandHalalas: number }, a: ProductionAccounts) {
  if (!a.wasteAccountId) throw new Error('حساب التالف غير موجود');
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('قيمة التالف يجب أن تكون أكبر من صفر');
  if (!String(x.reason || '').trim()) throw new Error('سبب التلف مطلوب');
  if (x.amountHalalas > x.finishedOnHandHalalas) throw new Error('التالف أكثر من رصيد المنتجات الجاهزة');
  return { journal: { id: x.id, date: x.date, reference: 'WASTE-' + x.id, memo: 'تالف — ' + x.reason.trim(), lines: [
    { accountId: a.wasteAccountId, debit: sar(x.amountHalalas), credit: 0, description: x.reason.trim() },
    { accountId: a.finishedAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'منتجات جاهزة' },
  ] } };
}

/** the cost of goods sold out of finished goods, never more than they hold */
export function costOfSalesJournal(x: { id: string; date: string; amountHalalas: number; finishedOnHandHalalas: number; memo?: string }, a: ProductionAccounts) {
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('تكلفة المبيعات يجب أن تكون أكبر من صفر');
  if (x.amountHalalas > x.finishedOnHandHalalas) throw new Error('تكلفة المبيعات أكثر من رصيد المنتجات الجاهزة');
  return { journal: { id: x.id, date: x.date, reference: 'COGS-' + x.id, memo: x.memo || 'تكلفة المبيعات', lines: [
    { accountId: a.cogsAccountId, debit: sar(x.amountHalalas), credit: 0, description: 'تكلفة المبيعات' },
    { accountId: a.finishedAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'منتجات جاهزة' },
  ] } };
}

/** an order's or a batch's KPIs, and the price that earns a target margin on the unit cost */
export function productionKpis(x: { plannedQty: number; goodQty: number; scrapQty?: number; actualHalalas: number; standardHalalas: number }) {
  const r2 = (v: number) => Math.round(v * 100) / 100, made = x.goodQty + (x.scrapQty ?? 0);
  return { yieldPct: x.plannedQty ? r2((x.goodQty / x.plannedQty) * 100) : null, scrapPct: made ? r2(((x.scrapQty ?? 0) / made) * 100) : null,
    variancePct: x.standardHalalas ? r2(((x.actualHalalas - x.standardHalalas) / x.standardHalalas) * 100) : null, unitCostHalalas: x.goodQty ? Math.round(x.actualHalalas / x.goodQty) : null };
}
export function priceForMargin(unitCostHalalas: number, marginPct: number, vatRate = 0) {
  if (!(marginPct >= 0 && marginPct < 100)) throw new Error('هامش الربح بين 0 و100');
  const net = Math.round(unitCostHalalas / (1 - marginPct / 100));
  return { net, gross: net + Math.round(net * (vatRate > 0 ? vatRate : 0)) };
}

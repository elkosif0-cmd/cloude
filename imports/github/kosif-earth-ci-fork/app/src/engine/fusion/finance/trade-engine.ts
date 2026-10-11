/* the general-trade pack (FOUNDATION §3.6 «التجارة: فروع ومستودعات، شراء وبيع، تسعير وهوامش، خصومات، مخزون ودوران،
   عملاء وموردون وائتمان»): every purchase, sale and stock transfer is tagged to a branch, so each branch has its own
   sales, discounts, gross margin and stock; a sale on credit is refused when it would take the customer past the credit
   limit; a discount allowed is shown against gross sales (4100); the cost of goods sold leaves the stock (1300 → 5000).
   A transfer between branches moves stock without changing the books' total. Money is in halalas. */

export type TradeAccounts = { cashAccountId: string; receivableAccountId: string; payableAccountId: string; inventoryAccountId: string; inputVatAccountId?: string;
  outputVatAccountId?: string; revenueAccountId: string; discountAccountId?: string; cogsAccountId: string };
const sar = (h: number) => h / 100;
const amt = (v: unknown, what: string, zero = false) => { if (!Number.isInteger(v) || (v as number) < 0 || (!zero && !(v as number))) throw new Error(what + ' غير صالح'); return v as number; };
const named = (v: unknown, what: string) => { const s = String(v ?? '').trim(); if (!s) throw new Error(what); return s; };

/** stock bought on credit for a branch */
export function branchPurchaseJournal(x: { id: string; date: string; branch: string; supplier: string; amountHalalas: number }, vatRate: number, a: TradeAccounts) {
  const branch = named(x.branch, 'حدد الفرع'), supplier = named(x.supplier, 'حدد المورد'), net = amt(x.amountHalalas, 'مبلغ الشراء');
  const vat = vatRate > 0 ? Math.round(net * vatRate) : 0;
  if (vat && !a.inputVatAccountId) throw new Error('حساب ضريبة المدخلات غير موجود');
  return { vat, journal: { id: x.id, date: x.date, reference: 'PO-' + x.id, memo: 'مشتريات ' + branch + ' — ' + supplier, party: supplier, lines: [
    { accountId: a.inventoryAccountId, debit: sar(net), credit: 0, description: 'مخزون ' + branch },
    ...(vat ? [{ accountId: a.inputVatAccountId as string, debit: sar(vat), credit: 0, description: 'ضريبة المدخلات' }] : []),
    { accountId: a.payableAccountId, debit: 0, credit: sar(net + vat), description: supplier },
  ] } };
}

/** a branch's sale: gross price less a discount (4100), VAT on what is charged, cash or on credit within the customer's
    limit; and its cost out of the branch's stock */
export function branchSaleJournals(x: { id: string; date: string; branch: string; customer?: string; onCredit?: boolean; grossHalalas: number; discountHalalas?: number; costHalalas: number;
  branchStockHalalas: number; customerBalanceHalalas?: number; creditLimitHalalas?: number | null }, vatRate: number, a: TradeAccounts) {
  const branch = named(x.branch, 'حدد الفرع'), gross = amt(x.grossHalalas, 'مبلغ البيع'), disc = amt(x.discountHalalas ?? 0, 'الخصم', true), cost = amt(x.costHalalas, 'تكلفة البضاعة المباعة');
  if (disc >= gross) throw new Error('الخصم لا يجوز أن يبلغ قيمة البيع');
  if (disc && !a.discountAccountId) throw new Error('حساب خصومات المبيعات غير موجود');
  if (cost > x.branchStockHalalas) throw new Error('تكلفة المبيع أكثر من مخزون ' + branch);
  const net = gross - disc, vat = vatRate > 0 ? Math.round(net * vatRate) : 0, total = net + vat;
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  let customer = '';
  if (x.onCredit) {
    customer = named(x.customer, 'البيع الآجل يحتاج اسم العميل');
    const limit = x.creditLimitHalalas;
    if (limit == null) throw new Error('لا حد ائتمان مسجل للعميل ' + customer + ' — سجّل حده أولاً');
    const after = (x.customerBalanceHalalas ?? 0) + total;
    if (after > limit) throw new Error('البيع يتجاوز حد ائتمان ' + customer + ': الرصيد بعده ' + sar(after) + ' والحد ' + sar(limit));
  }
  const to = x.onCredit ? a.receivableAccountId : a.cashAccountId;
  return { net, vat, total, journal: { id: x.id, date: x.date, reference: 'INV-' + x.id, memo: 'مبيعات ' + branch + (customer ? ' — ' + customer : ' — نقداً'), party: customer || undefined, lines: [
    { accountId: to, debit: sar(total), credit: 0, description: customer || 'نقداً' },
    ...(disc ? [{ accountId: a.discountAccountId as string, debit: sar(disc), credit: 0, description: 'خصم مسموح به' }] : []),
    { accountId: a.revenueAccountId, debit: 0, credit: sar(gross), description: 'مبيعات ' + branch },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة المخرجات' }] : []),
  ] }, costJournal: { id: x.id + '-c', date: x.date, reference: 'COGS-' + x.id, memo: 'تكلفة مبيعات ' + branch, lines: [
    { accountId: a.cogsAccountId, debit: sar(cost), credit: 0, description: branch },
    { accountId: a.inventoryAccountId, debit: 0, credit: sar(cost), description: 'مخزون ' + branch },
  ] } };
}

/** stock moved between branches at cost: the books' total does not change, each branch's stock does */
export function transferJournal(x: { id: string; date: string; from: string; to: string; costHalalas: number; fromStockHalalas: number }, a: TradeAccounts) {
  const from = named(x.from, 'حدد الفرع المحوِّل'), to = named(x.to, 'حدد الفرع المستلم'), cost = amt(x.costHalalas, 'قيمة التحويل');
  if (from === to) throw new Error('الفرعان متماثلان');
  if (cost > x.fromStockHalalas) throw new Error('قيمة التحويل أكثر من مخزون ' + from);
  return { journal: { id: x.id, date: x.date, reference: 'TRF-' + x.id, memo: 'تحويل مخزون من ' + from + ' إلى ' + to, lines: [
    { accountId: a.inventoryAccountId, debit: sar(cost), credit: 0, description: 'مخزون ' + to },
    { accountId: a.inventoryAccountId, debit: 0, credit: sar(cost), description: 'مخزون ' + from },
  ] } };
}

export type BranchMove = { branch: string; kind: 'purchase' | 'sale' | 'transfer-in' | 'transfer-out' | 'adjust'; amount?: number; gross?: number; discount?: number; cost?: number };
/** each branch's figures from its moves: stock, sales, discounts, gross margin, discount rate and stock turnover */
export function branchKpis(moves: BranchMove[]) {
  const by = new Map<string, { branch: string; purchases: number; gross: number; discounts: number; cogs: number; stock: number }>();
  const get = (b: string) => { let r = by.get(b); if (!r) { r = { branch: b, purchases: 0, gross: 0, discounts: 0, cogs: 0, stock: 0 }; by.set(b, r); } return r; };
  for (const m of moves) {
    const r = get(m.branch);
    if (m.kind === 'purchase') { r.purchases += m.amount ?? 0; r.stock += m.amount ?? 0; }
    if (m.kind === 'sale') { r.gross += m.gross ?? 0; r.discounts += m.discount ?? 0; r.cogs += m.cost ?? 0; r.stock -= m.cost ?? 0; }
    if (m.kind === 'transfer-in') r.stock += m.amount ?? 0;
    if (m.kind === 'transfer-out' || m.kind === 'adjust') r.stock -= m.amount ?? 0;
  }
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return [...by.values()].map((r) => { const net = r.gross - r.discounts, margin = net - r.cogs;
    return { ...r, net, margin, marginPct: net ? r2((margin / net) * 100) : null, discountPct: r.gross ? r2((r.discounts / r.gross) * 100) : null,
      /* turnover on the stock held now (the period's cost of sales over the closing stock) */ turnover: r.stock > 0 ? r2(r.cogs / r.stock) : null }; })
    .sort((a, b) => b.net - a.net);
}

/** a customer's position against the credit limit */
export function creditPosition(balanceHalalas: number, limitHalalas: number | null) {
  if (limitHalalas == null) return { limit: null, available: null, usedPct: null, over: false };
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return { limit: limitHalalas, available: limitHalalas - balanceHalalas, usedPct: limitHalalas ? r2((balanceHalalas / limitHalalas) * 100) : null, over: balanceHalalas > limitHalalas };
}

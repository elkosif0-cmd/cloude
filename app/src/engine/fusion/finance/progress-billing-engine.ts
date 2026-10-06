/* the construction pack (FOUNDATION §3.7 «عمق قطاع المقاولات»): a contract is billed by progress certificates
   (المستخلصات). Each certificate states the work certified to date; this period's work is the difference from the last
   certificate. From that work the customer holds back a retention (1220, released at handover) and recovers part of the
   advance it paid (2320); VAT is charged on the work less the advance recovered, because the advance was taxed when it was
   received; the customer owes the rest (1200). Contract revenue (4070) is the work certified. Money is in halalas.
   The projects' direct costs (subcontractors 5130, materials on site 5140) give the margin and the completion by cost. */

export type Contract = { id: string; project: string; customer: string; valueHalalas: number; retentionPct: number; advanceRecoveryPct: number };
export type CertificateInput = { id: string; date: string; certifiedToDateHalalas: number };
export type ContractState = { certifiedHalalas: number; advanceReceivedHalalas: number; advanceRecoveredHalalas: number; retentionHeldHalalas: number; retentionReleasedHalalas: number };
export type ContractAccounts = { cashAccountId: string; receivableAccountId: string; retentionAccountId: string; advanceAccountId: string; revenueAccountId: string; outputVatAccountId?: string };

const sar = (h: number) => h / 100;
const pct = (v: number) => Math.min(100, Math.max(0, Number(v) || 0));
export const emptyState = (): ContractState => ({ certifiedHalalas: 0, advanceReceivedHalalas: 0, advanceRecoveredHalalas: 0, retentionHeldHalalas: 0, retentionReleasedHalalas: 0 });

function checkContract(c: Contract) {
  if (!String(c.project || '').trim() || !String(c.customer || '').trim()) throw new Error('حدد المشروع والعميل');
  if (!Number.isInteger(c.valueHalalas) || c.valueHalalas <= 0) throw new Error('قيمة العقد يجب أن تكون أكبر من صفر');
}

/** an advance from the customer: cash in, the advance liability (2320), VAT on the advance */
export function advanceJournal(c: Contract, x: { id: string; date: string; amountHalalas: number }, vatRate: number, a: ContractAccounts) {
  checkContract(c);
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('مبلغ الدفعة المقدمة يجب أن يكون أكبر من صفر');
  const vat = vatRate > 0 ? Math.round(x.amountHalalas * vatRate) : 0;
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  return { vat, journal: { id: x.id, date: x.date, reference: 'ADV-' + c.project, memo: 'دفعة مقدمة — ' + c.project, party: c.customer, lines: [
    { accountId: a.cashAccountId, debit: sar(x.amountHalalas + vat), credit: 0, description: 'دفعة مقدمة من ' + c.customer },
    { accountId: a.advanceAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'دفعات مقدمة — ' + c.project },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة الدفعة المقدمة' }] : []),
  ] } };
}

/** a progress certificate: this period's work, the retention held, the advance recovered, VAT, and what the customer owes */
export function certificate(c: Contract, s: ContractState, x: CertificateInput, vatRate: number) {
  checkContract(c);
  if (!Number.isInteger(x.certifiedToDateHalalas) || x.certifiedToDateHalalas < 0) throw new Error('الأعمال المعتمدة حتى تاريخه غير صالحة');
  if (x.certifiedToDateHalalas > c.valueHalalas) throw new Error('الأعمال المعتمدة تتجاوز قيمة العقد — سجّل أمر التغيير أولاً');
  const work = x.certifiedToDateHalalas - s.certifiedHalalas;
  if (work <= 0) throw new Error('لا أعمال جديدة منذ المستخلص السابق');
  const retention = Math.round((work * pct(c.retentionPct)) / 100);
  const advanceLeft = s.advanceReceivedHalalas - s.advanceRecoveredHalalas;
  const recovery = Math.min(advanceLeft, Math.round((work * pct(c.advanceRecoveryPct)) / 100));
  const vat = vatRate > 0 ? Math.round((work - recovery) * vatRate) : 0;
  const receivable = work - retention - recovery + vat;
  return { work, retention, recovery, vat, receivable, completionPct: Math.round((x.certifiedToDateHalalas / c.valueHalalas) * 10000) / 100,
    next: { ...s, certifiedHalalas: x.certifiedToDateHalalas, advanceRecoveredHalalas: s.advanceRecoveredHalalas + recovery, retentionHeldHalalas: s.retentionHeldHalalas + retention } };
}

export function certificateJournal(c: Contract, s: ContractState, x: CertificateInput, vatRate: number, a: ContractAccounts) {
  const r = certificate(c, s, x, vatRate);
  if (r.vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  const lines = [
    ...(r.receivable ? [{ accountId: a.receivableAccountId, debit: sar(r.receivable), credit: 0, description: 'مستخلص ' + x.id + ' — ' + c.project }] : []),
    ...(r.retention ? [{ accountId: a.retentionAccountId, debit: sar(r.retention), credit: 0, description: 'محتجزات ' + pct(c.retentionPct) + '٪' }] : []),
    ...(r.recovery ? [{ accountId: a.advanceAccountId, debit: sar(r.recovery), credit: 0, description: 'استرداد من الدفعة المقدمة' }] : []),
    { accountId: a.revenueAccountId, debit: 0, credit: sar(r.work), description: 'أعمال معتمدة — ' + c.project + ' (إنجاز ' + r.completionPct + '٪)' },
    ...(r.vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(r.vat), description: 'ضريبة المستخلص' }] : []),
  ];
  return { ...r, journal: { id: x.id, date: x.date, reference: 'CERT-' + x.id, memo: 'مستخلص — ' + c.project + ' — ' + c.customer, party: c.customer, lines } };
}

/** handover: the retention held is released into the customer's receivable */
export function retentionReleaseJournal(c: Contract, s: ContractState, x: { id: string; date: string }, a: ContractAccounts) {
  const held = s.retentionHeldHalalas - s.retentionReleasedHalalas;
  if (held <= 0) throw new Error('لا محتجزات قائمة على هذا العقد');
  return { released: held, next: { ...s, retentionReleasedHalalas: s.retentionReleasedHalalas + held }, journal: { id: x.id, date: x.date, reference: 'RET-' + c.project, memo: 'الإفراج عن المحتجزات — ' + c.project, party: c.customer, lines: [
    { accountId: a.receivableAccountId, debit: sar(held), credit: 0, description: 'محتجزات مستحقة السداد' },
    { accountId: a.retentionAccountId, debit: 0, credit: sar(held), description: 'إفراج عن محتجزات ' + c.project },
  ] } };
}

/** margin and completion by cost per project: certified revenue against the direct costs posted to it */
export function projectProfitability(rows: { project: string; valueHalalas: number; budgetCostHalalas?: number; revenueHalalas: number; costHalalas: number }[]) {
  return rows.map((r) => { const margin = r.revenueHalalas - r.costHalalas, budget = Number(r.budgetCostHalalas) || 0;
    return { ...r, margin, marginPct: r.revenueHalalas ? Math.round((margin / r.revenueHalalas) * 10000) / 100 : null,
      completionByCostPct: budget > 0 ? Math.round((r.costHalalas / budget) * 10000) / 100 : null,
      expectedMarginHalalas: budget > 0 ? r.valueHalalas - budget : null }; });
}

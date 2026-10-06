/* the health pack's claim cycle (FOUNDATION §3.7 «عمق قطاع المستشفيات»): a visit is billed to the patient and to the payer
   (an insurer or another paying body), the payer's share is claimed, and the payer's remittance settles it — what it pays
   goes to cash and what it rejects is a loss on claims (5110), so the payer's receivable (1210) only ever holds open claims.
   Revenue is recognised by department (outpatient 4010, inpatient and procedures 4020, laboratory and radiology 4030,
   pharmacy 4040). Money is in halalas. VAT on healthcare services depends on the patient and the service and is not
   posted by this engine; amounts are before VAT. Patient data is never needed: a case is a reference number. */

export type Department = 'outpatient' | 'inpatient' | 'lab' | 'pharmacy';
export const DEPARTMENT_ACCOUNT: Readonly<Record<Department, string>> = Object.freeze({ outpatient: '4010', inpatient: '4020', lab: '4030', pharmacy: '4040' });
export const DEPARTMENT_LABEL: Readonly<Record<Department, string>> = Object.freeze({ outpatient: 'العيادات الخارجية', inpatient: 'التنويم والعمليات', lab: 'المختبر والأشعة', pharmacy: 'الصيدلية' });

export type Encounter = {
  id: string; date: string; caseRef: string; department: Department; grossHalalas: number;
  /** the paying body; empty means the patient pays everything */
  payer?: string;
  /** the payer's share of the bill, 0–100 */
  coveragePct?: number;
  /** the most the patient pays when a payer covers the visit (a policy's co-payment cap) */
  copayCapHalalas?: number;
};

export function splitEncounter(e: Encounter) {
  if (!Number.isInteger(e.grossHalalas) || e.grossHalalas <= 0) throw new Error('قيمة الزيارة يجب أن تكون أكبر من صفر');
  if (!(e.department in DEPARTMENT_ACCOUNT)) throw new Error('قسم غير معروف');
  const payer = String(e.payer ?? '').trim();
  if (!payer) return { payer: '', payerShare: 0, patientShare: e.grossHalalas };
  const pct = Math.min(100, Math.max(0, Number(e.coveragePct ?? 100)));
  let payerShare = Math.round((e.grossHalalas * pct) / 100), patientShare = e.grossHalalas - payerShare;
  const cap = Number(e.copayCapHalalas);
  if (Number.isInteger(cap) && cap >= 0 && patientShare > cap) { patientShare = cap; payerShare = e.grossHalalas - cap; }
  return { payer, payerShare, patientShare };
}

export type ClaimAccounts = { cashAccountId: string; payerReceivableAccountId: string; revenueAccountId: (code: string) => string; rejectionsAccountId: string };
const sar = (h: number) => h / 100;

/** the visit: the patient's share collected, the payer's share claimed (1210, named to the payer), revenue by department */
export function encounterJournal(e: Encounter, a: ClaimAccounts) {
  const s = splitEncounter(e), rev = a.revenueAccountId(DEPARTMENT_ACCOUNT[e.department]);
  if (!rev) throw new Error('حساب إيراد القسم غير موجود');
  const lines = [
    ...(s.patientShare ? [{ accountId: a.cashAccountId, debit: sar(s.patientShare), credit: 0, description: 'حصة المريض — حالة ' + e.caseRef }] : []),
    ...(s.payerShare ? [{ accountId: a.payerReceivableAccountId, debit: sar(s.payerShare), credit: 0, description: 'مطالبة ' + s.payer + ' — حالة ' + e.caseRef }] : []),
    { accountId: rev, debit: 0, credit: sar(e.grossHalalas), description: DEPARTMENT_LABEL[e.department] + ' — حالة ' + e.caseRef },
  ];
  return { split: s, journal: { id: e.id, date: e.date, reference: e.caseRef, memo: 'زيارة ' + DEPARTMENT_LABEL[e.department] + (s.payer ? ' — ' + s.payer : ''), party: s.payer || undefined, lines } };
}

export type Remittance = { id: string; date: string; payer: string; reference?: string; paidHalalas: number; rejectedHalalas: number; reason?: string };

/** the payer's remittance against its open claims: paid to cash, rejected to the claim-loss account, the receivable reduced by both */
export function remittanceJournal(r: Remittance, openHalalas: number, a: ClaimAccounts) {
  const payer = String(r.payer || '').trim();
  if (!payer) throw new Error('حدد الجهة الدافعة');
  for (const v of [r.paidHalalas, r.rejectedHalalas]) if (!Number.isInteger(v) || v < 0) throw new Error('المبالغ يجب أن تكون أعداداً صحيحة غير سالبة بالهللة');
  const total = r.paidHalalas + r.rejectedHalalas;
  if (total <= 0) throw new Error('أدخل المسدَّد أو المرفوض');
  if (total > openHalalas) throw new Error('التسوية تتجاوز المطالبات القائمة على الجهة');
  if (r.rejectedHalalas > 0 && !String(r.reason || '').trim()) throw new Error('سبب الرفض مطلوب');
  const lines = [
    ...(r.paidHalalas ? [{ accountId: a.cashAccountId, debit: sar(r.paidHalalas), credit: 0, description: 'سداد ' + payer }] : []),
    ...(r.rejectedHalalas ? [{ accountId: a.rejectionsAccountId, debit: sar(r.rejectedHalalas), credit: 0, description: 'رفض ' + payer + ': ' + String(r.reason).trim() }] : []),
    { accountId: a.payerReceivableAccountId, debit: 0, credit: sar(total), description: 'تسوية مطالبات ' + payer },
  ];
  return { journal: { id: r.id, date: r.date, reference: r.reference || 'REM-' + r.id, memo: 'تسوية مطالبات ' + payer, party: payer, lines }, claim: { payer, paid: r.paidHalalas, rejected: r.rejectedHalalas, reason: String(r.reason || '').trim() } };
}

export type ClaimEvent = { payer: string; kind: 'claim' | 'remittance'; billed?: number; paid?: number; rejected?: number };

/** billed, paid, rejected and the rejection rate per payer — the KPI the health pack is judged by */
export function payerStats(events: ClaimEvent[]) {
  const by = new Map<string, { payer: string; billed: number; paid: number; rejected: number }>();
  for (const e of events) {
    const k = String(e.payer || '').trim(); if (!k) continue;
    const r = by.get(k) ?? { payer: k, billed: 0, paid: 0, rejected: 0 };
    if (e.kind === 'claim') r.billed += e.billed ?? 0; else { r.paid += e.paid ?? 0; r.rejected += e.rejected ?? 0; }
    by.set(k, r);
  }
  return [...by.values()].map((r) => ({ ...r, open: r.billed - r.paid - r.rejected, rejectionRate: r.paid + r.rejected ? Math.round((r.rejected / (r.paid + r.rejected)) * 10000) / 100 : null }))
    .sort((a, b) => b.open - a.open || a.payer.localeCompare(b.payer));
}

/* the cost of a case: the doctor's fee (a share of the visit, or a fixed amount) accrued to the doctor (2150, named), and the
   medicines and supplies used, taken out of the pharmacy stock (1360). One entry per visit, named to the doctor, so the
   doctors' payable ages by doctor while the payer's claim stays on its own entry. */
export type CaseCost = { id: string; date: string; caseRef: string; doctor?: string; feePct?: number; feeFixedHalalas?: number; suppliesHalalas?: number };
export type CaseCostAccounts = { doctorFeesAccountId: string; doctorPayableAccountId: string; suppliesCostAccountId: string; pharmacyStockAccountId: string };

export function doctorFee(grossHalalas: number, c: Pick<CaseCost, 'feePct' | 'feeFixedHalalas'>) {
  const fixed = Number(c.feeFixedHalalas);
  if (Number.isInteger(fixed) && fixed > 0) return Math.min(fixed, grossHalalas);
  const pct = Math.min(100, Math.max(0, Number(c.feePct ?? 0)));
  return Math.round((grossHalalas * pct) / 100);
}

export function caseCostJournal(c: CaseCost, grossHalalas: number, a: CaseCostAccounts) {
  const doctor = String(c.doctor ?? '').trim(), fee = doctor ? doctorFee(grossHalalas, c) : 0;
  const supplies = Number.isInteger(c.suppliesHalalas) && (c.suppliesHalalas as number) > 0 ? (c.suppliesHalalas as number) : 0;
  if (!fee && !supplies) return null;
  if (fee && !doctor) throw new Error('حدد الطبيب');
  const lines = [
    ...(fee ? [{ accountId: a.doctorFeesAccountId, debit: sar(fee), credit: 0, description: 'أتعاب ' + doctor + ' — حالة ' + c.caseRef },
      { accountId: a.doctorPayableAccountId, debit: 0, credit: sar(fee), description: 'مستحق ' + doctor + ' — حالة ' + c.caseRef }] : []),
    ...(supplies ? [{ accountId: a.suppliesCostAccountId, debit: sar(supplies), credit: 0, description: 'أدوية ومستلزمات — حالة ' + c.caseRef },
      { accountId: a.pharmacyStockAccountId, debit: 0, credit: sar(supplies), description: 'صرف من الصيدلية — حالة ' + c.caseRef }] : []),
  ];
  return { fee, supplies, journal: { id: c.id, date: c.date, reference: c.caseRef, memo: 'تكلفة الحالة ' + c.caseRef + (doctor ? ' — ' + doctor : ''), party: doctor || undefined, lines } };
}

export type CaseEvent = { caseRef: string; revenue?: number; fee?: number; supplies?: number; rejected?: number };

/** revenue, doctor's fee, supplies and margin per case — the health pack's «تكلفة الحالة» */
export function caseCosts(events: CaseEvent[]) {
  const by = new Map<string, { caseRef: string; revenue: number; fee: number; supplies: number }>();
  for (const e of events) {
    const k = String(e.caseRef || '').trim(); if (!k) continue;
    const r = by.get(k) ?? { caseRef: k, revenue: 0, fee: 0, supplies: 0 };
    r.revenue += e.revenue ?? 0; r.fee += e.fee ?? 0; r.supplies += e.supplies ?? 0;
    by.set(k, r);
  }
  return [...by.values()].map((r) => { const cost = r.fee + r.supplies, margin = r.revenue - cost;
    return { ...r, cost, margin, marginPct: r.revenue ? Math.round((margin / r.revenue) * 10000) / 100 : null }; })
    .sort((a, b) => a.caseRef.localeCompare(b.caseRef));
}

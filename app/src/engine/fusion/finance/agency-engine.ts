/* the digital-marketing pack (FOUNDATION §3.7 «عمق قطاع التسويق الإلكتروني»): a client's retainer billed in advance and
   earned month by month, the ad spend bought on the platforms for a campaign, the spend rebilled to the client with the
   agency's markup, and each campaign's profitability with the KPIs the client judges it by (ROAS, CAC).
   The retainer is deferred revenue (2400) until its month is served; the spend is owed to the platform (2170) and expensed
   (5150) against the campaign; the rebill is revenue (4080). Money is in halalas. */

export type AgencyAccounts = { receivableAccountId: string; deferredAccountId: string; revenueAccountId: string; outputVatAccountId?: string;
  mediaCostAccountId: string; platformPayableAccountId: string };
export type Retainer = { id: string; client: string; campaign: string; monthlyHalalas: number; months: number; startMonth: string };
const sar = (h: number) => h / 100;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const addMonths = (m: string, n: number) => { const [y, mo] = m.split('-').map(Number); const t = y * 12 + (mo - 1) + n; return Math.floor(t / 12) + '-' + String((t % 12) + 1).padStart(2, '0'); };

function checkRetainer(r: Retainer) {
  if (!String(r.client || '').trim() || !String(r.campaign || '').trim()) throw new Error('حدد العميل والحملة');
  if (!Number.isInteger(r.monthlyHalalas) || r.monthlyHalalas <= 0) throw new Error('قيمة الاشتراك الشهري يجب أن تكون أكبر من صفر');
  if (!Number.isInteger(r.months) || r.months < 1 || r.months > 36) throw new Error('مدة الاشتراك بين شهر و36 شهراً');
  if (!MONTH.test(r.startMonth)) throw new Error('شهر البداية غير صالح');
}

/** the months a retainer covers and what is earned in each */
export function retainerSchedule(r: Retainer) {
  checkRetainer(r);
  return Array.from({ length: r.months }, (_, i) => ({ month: addMonths(r.startMonth, i), amountHalalas: r.monthlyHalalas }));
}

/** the retainer billed in advance for its whole term: receivable (with VAT) against deferred revenue */
export function retainerInvoiceJournal(r: Retainer, x: { id: string; date: string }, vatRate: number, a: AgencyAccounts) {
  checkRetainer(r);
  const total = r.monthlyHalalas * r.months, vat = vatRate > 0 ? Math.round(total * vatRate) : 0;
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  return { total, vat, journal: { id: x.id, date: x.date, reference: 'RET-' + r.id, memo: 'اشتراك ' + r.client + ' — ' + r.campaign + ' (' + r.months + ' شهر)', party: r.client, lines: [
    { accountId: a.receivableAccountId, debit: sar(total + vat), credit: 0, description: 'فاتورة اشتراك ' + r.client },
    { accountId: a.deferredAccountId, debit: 0, credit: sar(total), description: 'إيراد مؤجل — ' + r.campaign },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة المخرجات' }] : []),
  ] } };
}

/** the months served up to `throughMonth` that are not yet recognised: deferred revenue into revenue */
export function recognitionJournal(r: Retainer, recognisedMonths: string[], throughMonth: string, x: { id: string; date: string }, a: AgencyAccounts) {
  if (!MONTH.test(throughMonth)) throw new Error('الشهر غير صالح');
  const done = new Set(recognisedMonths), due = retainerSchedule(r).filter((s) => s.month <= throughMonth && !done.has(s.month));
  if (!due.length) throw new Error('لا أشهر مستحقة الاعتراف حتى ' + throughMonth);
  const amount = due.reduce((s, m) => s + m.amountHalalas, 0);
  return { months: due.map((m) => m.month), amount, journal: { id: x.id, date: x.date, reference: 'REC-' + r.id + '-' + throughMonth, memo: 'الاعتراف بإيراد ' + r.client + ' — ' + due.map((m) => m.month).join('، '), lines: [
    { accountId: a.deferredAccountId, debit: sar(amount), credit: 0, description: r.campaign },
    { accountId: a.revenueAccountId, debit: 0, credit: sar(amount), description: 'إيراد إدارة الحملة — ' + r.campaign },
  ] } };
}

/** ad spend bought on a platform for a campaign: expensed against the campaign and owed to the platform */
export function mediaSpendJournal(x: { id: string; date: string; campaign: string; platform: string; amountHalalas: number }, a: AgencyAccounts) {
  if (!String(x.campaign || '').trim() || !String(x.platform || '').trim()) throw new Error('حدد الحملة والمنصة');
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('مبلغ الإنفاق يجب أن يكون أكبر من صفر');
  return { journal: { id: x.id, date: x.date, reference: 'ADS-' + x.platform, memo: 'إنفاق إعلاني — ' + x.campaign + ' على ' + x.platform, party: x.platform, lines: [
    { accountId: a.mediaCostAccountId, debit: sar(x.amountHalalas), credit: 0, description: x.campaign },
    { accountId: a.platformPayableAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'مستحق ' + x.platform },
  ] } };
}

/** the spend rebilled to the client with the agency's markup (the agency buys the media as principal) */
export function rebillJournal(x: { id: string; date: string; client: string; campaign: string; spendHalalas: number; markupPct: number }, vatRate: number, a: AgencyAccounts) {
  if (!String(x.client || '').trim() || !String(x.campaign || '').trim()) throw new Error('حدد العميل والحملة');
  if (!Number.isInteger(x.spendHalalas) || x.spendHalalas <= 0) throw new Error('لا إنفاق لإعادة تحميله');
  const pct = Number(x.markupPct) || 0;
  if (pct < 0 || pct > 100) throw new Error('نسبة هامش الوكالة بين 0 و100');
  const amount = x.spendHalalas + Math.round((x.spendHalalas * pct) / 100), vat = vatRate > 0 ? Math.round(amount * vatRate) : 0;
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  return { amount, vat, journal: { id: x.id, date: x.date, reference: 'RB-' + x.campaign, memo: 'إعادة تحميل الإنفاق — ' + x.campaign + (pct ? ' (+' + pct + '٪)' : ''), party: x.client, lines: [
    { accountId: a.receivableAccountId, debit: sar(amount + vat), credit: 0, description: x.client },
    { accountId: a.revenueAccountId, debit: 0, credit: sar(amount), description: 'إنفاق معاد تحميله — ' + x.campaign },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة المخرجات' }] : []),
  ] } };
}

/** a campaign's profitability: revenue (retainer earned + rebills) less ad spend. When the client's results are given:
    ROAS = the client's attributed sales ÷ the ad spend; CAC = what the client paid the agency ÷ the new customers won */
export function campaignProfitability(rows: { campaign: string; client?: string; revenueHalalas: number; mediaCostHalalas: number; attributedSalesHalalas?: number; newCustomers?: number }[]) {
  const r2 = (x: number) => Math.round(x * 100) / 100;
  return rows.map((c) => {
    const margin = c.revenueHalalas - c.mediaCostHalalas;
    return { ...c, marginHalalas: margin, marginPct: c.revenueHalalas ? r2((margin / c.revenueHalalas) * 100) : null,
      roas: c.attributedSalesHalalas && c.mediaCostHalalas ? r2(c.attributedSalesHalalas / c.mediaCostHalalas) : null,
      cacHalalas: c.newCustomers && c.revenueHalalas ? Math.round(c.revenueHalalas / c.newCustomers) : null };
  });
}

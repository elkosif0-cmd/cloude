/* the reference model companies (FOUNDATION §3.6 «نماذج محاسبية افتراضية إلزامية»): a company per sector that has really
   been through an accounting cycle — operating document → journal entry → ledger → trial balance → receivables,
   inventory and cost → statements → close — with normal cases, exceptions, adjustments and one corrected error.
   Every book is generated deterministically (a seeded generator, no clock, no network) from the sector's own pack and,
   where the sector has one, its own posting engine (the hospital's visits and remittances go through the claims engine),
   so a model company and a company keyed in by hand cannot disagree. The data is synthetic; no real person or company
   appears. Journals carry account CODES; the books screen maps them to its accounts when the model company is opened.
   Money is in halalas internally and in riyals on the journal lines, like every posting engine. */

import { type AccountType, type PackAccount, sectorPack } from './sector-pack-engine';
import { encounterJournal, healthVatTreatment, remittanceJournal, type Department } from '../finance/insurance-claims-engine';
import * as TU from '../finance/tuition-engine';
import * as PO from '../finance/production-order-engine';
import * as LV from '../finance/livestock-engine';
import * as TR from '../finance/trade-engine';

export type ModelLine = { accountId: string; debit: number; credit: number; description?: string };
export type ModelEntry = { id: string; date: string; reference: string; memo: string; source: string; sourceId: string; party?: string; lines: ModelLine[];
  model: true; reversedBy?: string; reversalOf?: string; [meta: string]: unknown };
export type ModelCompany = { id: string; sector: string; name: string; story: string };
/** `ledger` holds what the books screen keeps beside the entries (the school's terms), written with them on first open */
export type ModelBooks = ModelCompany & { year: number; months: number; accounts: PackAccount[]; entries: ModelEntry[]; lockDate: string; ledger: Record<string, unknown> };

export const MODEL_COMPANIES: readonly ModelCompany[] = Object.freeze([
  { id: 'model-health', sector: 'health', name: 'مستشفى الشفاء النموذجي', story: 'مستشفى بإيراد شهري يتجاوز 11 مليوناً: زيارات يومية لأربعة أقسام، ثلاث شركات تأمين ومطالبات ورفض وتسويات، أتعاب أطباء وصيدلية، وضريبة المواطن والمقيم.' },
  { id: 'model-education', sector: 'education', name: 'مدارس المستقبل النموذجية', story: 'مجمع تعليمي بـ1,200 طالب: رسوم فصلين تُفوتر مقدماً وتُكتسب شهرياً، منح وخصومات، تحصيل متدرج ومتأخرات، نقل مدرسي، واسترداد رسوم طالب منسحب.' },
  { id: 'model-manufacturing', sector: 'manufacturing', name: 'مصنع الخليج النموذجي للبلاستيك', story: 'مصنع: شراء خامات، صرف للتشغيل، تحميل أجور وتكاليف غير مباشرة، إنتاج تام بالتكلفة المعيارية، هالك وانحرافات، مبيعات آجلة وتحصيل.' },
  { id: 'model-bakery', sector: 'bakery', name: 'مخبز السنابل النموذجي', story: 'مخبز: مبيعات نقدية يومية، مكونات وإنتاج شهري، تكلفة المبيعات، تالف ومنتهي الصلاحية، ورواتب الخبازين المحمّلة على الإنتاج.' },
  { id: 'model-agriculture', sector: 'agriculture', name: 'مزرعة الوادي الأخضر النموذجية', story: 'مزرعة أغنام: قطيع وأعلاف تُحمَّل على تكلفته، مواليد ونفوق، مبيعات شهرية بتكلفة الرأس المتوسطة.' },
  { id: 'model-trade', sector: 'trade', name: 'شركة النخبة التجارية النموذجية', story: 'توزيع تجاري بفرعين: مشتريات آجلة، مبيعات نقدية وآجلة لعملاء بأسمائهم، تحصيل وسداد، جرد بفروقات، ودين معدوم.' },
]);

const EXTRA: readonly PackAccount[] = [['2250', 'ضريبة القيمة المضافة — صافي مستحق للهيئة', 'liability'], ['4900', 'إيرادات أخرى', 'revenue'], ['5100', 'فروقات الجرد والهدر', 'expense']];
const pad = (n: number) => String(n).padStart(2, '0');
const dayOf = (y: number, m: number, d: number) => y + '-' + pad(m) + '-' + pad(d);
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const sar = (h: number) => Math.round(h) / 100;

/** a model company's books for `months` months of `year` (default January–September 2026), closed to the last month's end */
export function modelBooks(id: string, opts: { year?: number; months?: number; vatRate?: number } = {}): ModelBooks {
  const co = MODEL_COMPANIES.find((c) => c.id === id);
  if (!co) throw new Error('شركة نموذجية غير معروفة: ' + id);
  const year = opts.year ?? 2026, months = Math.min(12, Math.max(3, opts.months ?? 9)), vat = opts.vatRate ?? 0.15;
  const pack = sectorPack(co.sector), accounts: PackAccount[] = [...pack.accounts];
  for (const a of EXTRA) if (!accounts.some((x) => x[0] === a[0])) accounts.push(a);
  let seed = [...co.id].reduce((s, ch) => (Math.imul(s, 31) + ch.charCodeAt(0)) >>> 0, 20260101);
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const vary = (h: number, spread = 0.1) => Math.round(h * (1 + (rnd() * 2 - 1) * spread));
  const entries: ModelEntry[] = []; let n = 0;
  const L = (code: string, dr: number, cr: number, description?: string): ModelLine => ({ accountId: code, debit: sar(dr), credit: sar(cr), ...(description ? { description } : {}) });
  const je = (date: string, memo: string, lines: ModelLine[], x: { source?: string; reference?: string; party?: string; meta?: Record<string, unknown> } = {}) => {
    const eid = co.id + '-je' + ++n;
    const e: ModelEntry = { id: eid, date, reference: x.reference || 'MDL-' + n, memo, source: x.source || 'يدوي', sourceId: 'model:' + eid, lines: lines.filter((l) => l.debit || l.credit), model: true, ...(x.party ? { party: x.party } : {}), ...(x.meta || {}) };
    entries.push(e); return e;
  };
  /* VAT on a VAT-inclusive amount and on a net amount */
  const vatOfNet = (net: number) => Math.round(net * vat);
  const sale = (date: string, memo: string, netH: number, o: { revenue?: string; cashShare?: number; party?: string; source?: string; reference?: string; vatRate?: number; meta?: Record<string, unknown> } = {}) => {
    const v = Math.round(netH * (o.vatRate ?? vat)), gross = netH + v, cash = Math.round(gross * (o.cashShare ?? 1));
    return je(date, memo, [L('1100', cash, 0), L('1200', gross - cash, 0, o.party), L(o.revenue || '4000', 0, netH), L('2200', 0, v)], { source: o.source || 'مبيعات', reference: o.reference, party: gross - cash ? o.party : undefined, meta: o.meta });
  };
  const purchase = (date: string, memo: string, stock: string, netH: number, supplier: string, ref: string) =>
    je(date, memo, [L(stock, netH, 0), L('1400', vatOfNet(netH), 0), L('2100', 0, netH + vatOfNet(netH), supplier)], { source: 'مشتريات', reference: ref, party: supplier });
  const pay = (date: string, memo: string, code: string, h: number, ref: string, party?: string) => je(date, memo, [L(code, h, 0, party), L('1100', 0, h)], { source: 'سداد', reference: ref, party });
  const collect = (date: string, memo: string, code: string, h: number, ref: string, party?: string) => je(date, memo, [L('1100', h, 0), L(code, 0, h, party)], { source: 'تحصيل', reference: ref, party });
  const end = (m: number) => dayOf(year, m, lastDay(year, m));
  const M = Array.from({ length: months }, (_, i) => i + 1);

  je(dayOf(year, 1, 1), 'رأس المال المدفوع', [L('1100', CAPITAL[co.sector], 0), L('3000', 0, CAPITAL[co.sector])], { reference: 'CAP-' + year });
  const ledger: Record<string, unknown> = {};
  SECTOR[co.sector]({ year, months: M, vat, rnd, vary, je, L, sale, purchase, pay, collect, end, entries, co, ledger });

  /* the overheads every company carries; one month's rent is posted twice by mistake and corrected by a reversal */
  const OH = OVERHEAD[co.sector];
  for (const m of M) {
    if (OH.payroll) je(end(m), 'الرواتب والأجور — ' + pad(m) + '/' + year, [L('6100', OH.payroll, 0), L('1100', 0, OH.payroll)], { reference: 'PAYR-' + year + pad(m), source: 'رواتب' });
    je(dayOf(year, m, 1), 'الإيجار — ' + pad(m) + '/' + year, [L('6200', OH.rent, 0), L('1100', 0, OH.rent)], { reference: 'RENT-' + year + pad(m), source: 'سداد' });
    const opex = vary(OH.opex, 0.08);
    je(end(m), 'كهرباء ومياه ومصروفات تشغيل — ' + pad(m) + '/' + year, [L('6300', opex, 0), L('1100', 0, opex)], { reference: 'OPX-' + year + pad(m), source: 'سداد' });
  }
  const dup = je(dayOf(year, 3, 2), 'الإيجار — 03/' + year + ' (مكرر بالخطأ)', [L('6200', OH.rent, 0), L('1100', 0, OH.rent)], { reference: 'RENT-' + year + '03-DUP', source: 'سداد' });
  const rev = je(dayOf(year, 3, 5), 'عكس قيد إيجار مكرر — اكتُشف في مطابقة البنك', [L('1100', OH.rent, 0), L('6200', 0, OH.rent)], { reference: 'REV-' + dup.reference, source: 'تصحيح' });
  dup.reversedBy = rev.id; rev.reversalOf = dup.id;

  /* VAT: each quarter that ended inside the period is closed into 2250 and paid by the end of the following month when
     that date is still inside the period; the last quarter stays payable — exactly what the return screen expects */
  const lock = end(months);
  for (let q = 0; q * 3 + 3 <= months; q++) {
    const st = dayOf(year, q * 3 + 1, 1), en = end(q * 3 + 3), inQ = (e: ModelEntry) => e.date >= st && e.date <= en;
    let out = 0, inp = 0;
    for (const e of entries.filter(inQ)) for (const l of e.lines) { if (l.accountId === '2200') out += Math.round((l.credit - l.debit) * 100); if (l.accountId === '1400') inp += Math.round((l.debit - l.credit) * 100); }
    if (!out && !inp) continue;
    const net = out - inp;
    je(en, 'إقفال ضريبة القيمة المضافة — الربع ' + (q + 1), [L('2200', out, 0), L('1400', 0, inp), net >= 0 ? L('2250', 0, net) : L('2250', -net, 0)], { reference: 'VAT-' + year + '-Q' + (q + 1), source: 'ضريبة', meta: { vatClose: { quarter: q + 1 } } });
    const due = end(q * 3 + 4);
    if (net > 0 && due <= lock) je(dayOf(year, q * 3 + 4, 25), 'سداد ضريبة الربع ' + (q + 1) + ' للهيئة', [L('2250', net, 0), L('1100', 0, net)], { reference: 'ZATCA-' + year + '-Q' + (q + 1), source: 'سداد', party: 'هيئة الزكاة والضريبة والجمارك' });
  }
  entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { ...co, year, months, accounts, entries, lockDate: lock, ledger };
}

const CAPITAL: Record<string, number> = { health: 2_500_000_000, education: 1_200_000_000, manufacturing: 900_000_000, bakery: 60_000_000, agriculture: 400_000_000, trade: 700_000_000 };
const OVERHEAD: Record<string, { payroll: number; rent: number; opex: number }> = {
  health: { payroll: 360_000_000, rent: 45_000_000, opex: 38_000_000 }, education: { payroll: 190_000_000, rent: 35_000_000, opex: 12_000_000 },
  manufacturing: { payroll: 90_000_000, rent: 12_000_000, opex: 40_000_000 }, bakery: { payroll: 8_500_000, rent: 2_500_000, opex: 3_000_000 },
  agriculture: { payroll: 6_000_000, rent: 1_500_000, opex: 2_500_000 }, trade: { payroll: 9_000_000, rent: 3_500_000, opex: 2_000_000 },
};

type Ctx = { year: number; months: number[]; vat: number; rnd: () => number; vary: (h: number, s?: number) => number; co: ModelCompany; entries: ModelEntry[]; ledger: Record<string, unknown>;
  je: (date: string, memo: string, lines: ModelLine[], x?: { source?: string; reference?: string; party?: string; meta?: Record<string, unknown> }) => ModelEntry;
  L: (code: string, dr: number, cr: number, d?: string) => ModelLine; end: (m: number) => string;
  sale: (date: string, memo: string, netH: number, o?: { revenue?: string; cashShare?: number; party?: string; source?: string; reference?: string; vatRate?: number; meta?: Record<string, unknown> }) => ModelEntry;
  purchase: (date: string, memo: string, stock: string, netH: number, supplier: string, ref: string) => ModelEntry;
  pay: (date: string, memo: string, code: string, h: number, ref: string, party?: string) => ModelEntry;
  collect: (date: string, memo: string, code: string, h: number, ref: string, party?: string) => ModelEntry };

const SECTOR: Record<string, (c: Ctx) => void> = {
  /* the hospital: every day each department's insured citizens (state-borne VAT, 85% claimed from the day's payer) and its
     cash-paying residents (standard VAT); the payers remit the month's claims on the 20th of the next month, paying 94%
     and rejecting 3% for coding; doctors' fees accrue at 15% of clinical revenue; the pharmacy buys and consumes stock */
  health: ({ year, months, vat, vary, je, L, purchase, pay, end }) => {
    const DEPTS: [Department, number][] = [['outpatient', 9_500_000], ['inpatient', 17_000_000], ['lab', 6_000_000], ['pharmacy', 4_500_000]];
    const PAYERS = ['بوبا العربية', 'التعاونية', 'ميدغلف'];
    const A = { cashAccountId: '1100', payerReceivableAccountId: '1210', revenueAccountId: (c: string) => c, rejectionsAccountId: '5110', outputVatAccountId: '2200' };
    const claims: Record<string, Record<number, number>> = {}, open: Record<string, number> = {};
    let lastFees = 0, lastBuy = 0;
    const citizen = healthVatTreatment({ country: 'SA', policyRate: vat, category: 'citizen' }), resident = healthVatTreatment({ country: 'SA', policyRate: vat, category: 'non-citizen' });
    for (const m of months) {
      let clinical = 0, pharmacy = 0;
      for (let d = 1; d <= lastDay(year, m); d++) {
        const date = dayOf(year, m, d), payer = PAYERS[(d + m) % 3];
        for (const [dept, base] of DEPTS) {
          const day = vary(base, 0.12), ins = Math.round(day * 0.7), cash = day - ins, tag = dept.slice(0, 3).toUpperCase() + '-' + date.replace(/-/g, '');
          for (const [kind, gross, v, py] of [['A', ins, citizen, payer], ['B', cash, resident, '']] as const) {
            const r = encounterJournal({ id: 'v', date, caseRef: tag + '-' + kind, department: dept, grossHalalas: gross, payer: py || undefined, coveragePct: 85, vat: v }, A);
            /* the line descriptions repeat the case reference; dropped to keep ~2,200 visits light in the browser's storage */
            je(date, r.journal.memo + ' — ' + (kind === 'A' ? 'المؤمَّن عليهم' : 'الدفع النقدي'), r.journal.lines.map(({ accountId, debit, credit }) => ({ accountId, debit, credit })), { source: 'زيارات', reference: r.journal.reference, party: r.split.payer || undefined,
              meta: { visit: { caseRef: tag + '-' + kind, gross, vatTreatment: r.vat.treatment, vat: r.vat.amount }, ...(r.split.payer ? { claim: { kind: 'claim', payer: r.split.payer, billed: r.split.payerShare } } : {}) } });
            if (r.split.payer) { (claims[r.split.payer] ??= {})[m] = (claims[r.split.payer][m] ?? 0) + r.split.payerShare; open[r.split.payer] = (open[r.split.payer] ?? 0) + r.split.payerShare; }
          }
          if (dept === 'pharmacy') pharmacy += day; else clinical += day;
        }
      }
      /* the previous month's claims remitted on the 20th */
      if (m > 1) for (const p of PAYERS) {
        const billed = claims[p]?.[m - 1] ?? 0; if (!billed) continue;
        const paid = Math.round(billed * 0.94), rejected = Math.round(billed * 0.03);
        const r = remittanceJournal({ id: 'r', date: dayOf(year, m, 20), payer: p, reference: 'REM-' + p + '-' + year + pad(m - 1), paidHalalas: paid, rejectedHalalas: rejected, reason: 'عدم مطابقة الترميز الطبي' }, open[p], A);
        open[p] -= paid + rejected;
        je(r.journal.date, r.journal.memo + ' — مطالبات ' + pad(m - 1) + '/' + year, r.journal.lines, { source: 'تسويات التأمين', reference: r.journal.reference, party: p, meta: { claim: { kind: 'remittance', ...r.claim } } });
      }
      const fees = Math.round(clinical * 0.15);
      je(end(m), 'أتعاب الأطباء المتعاقدين — ' + pad(m) + '/' + year, [L('5210', fees, 0), L('2150', 0, fees, 'الأطباء المتعاقدون')], { source: 'أتعاب الأطباء', reference: 'FEE-' + year + pad(m), party: 'الأطباء المتعاقدون' });
      if (m > 1) pay(dayOf(year, m, 10), 'صرف أتعاب الأطباء عن ' + pad(m - 1) + '/' + year, '2150', lastFees, 'FEEPAY-' + year + pad(m - 1), 'الأطباء المتعاقدون');
      lastFees = fees;
      const buy = Math.round(pharmacy * 0.55 + clinical * 0.06);
      purchase(dayOf(year, m, 3), 'توريد أدوية ومستلزمات طبية', '1360', buy, 'شركة التوريدات الطبية الحديثة', 'PO-MED-' + year + pad(m));
      je(end(m), 'صرف أدوية ومستلزمات على الحالات', [L('5220', Math.round(buy * 0.95), 0), L('1360', 0, Math.round(buy * 0.95))], { source: 'الصيدلية', reference: 'CONS-' + year + pad(m) });
      if (m > 1) pay(dayOf(year, m, 15), 'سداد شركة التوريدات الطبية', '2100', lastBuy, 'PAY-MED-' + year + pad(m), 'شركة التوريدات الطبية الحديثة');
      lastBuy = buy + Math.round(buy * vat);
      if (m === 6) je(end(m), 'فرق جرد الصيدلية (عجز)', [L('5100', 4_500_000, 0), L('1360', 0, 4_500_000)], { source: 'جرد', reference: 'COUNT-' + year + '06' });
    }
  },
  /* the school, through the education pack's own engine (finance/tuition-engine) and with the books screen's meta, so the
     «الرسوم الدراسية» tab reads it: term 2 (January–May) billed on 5 January and term 1 of the new year (September–December)
     on 25 August, 960 citizens (VAT borne by the state) and 240 residents (15%); a 6% sibling-and-scholarship discount;
     two residents withdrawing from March; each month earned at its end; collections of 60% in the billing month, 30% the
     month after and 5% three months on; school transport */
  education: ({ year, months, vary, je, sale, end, vat, ledger }) => {
    const A = { receivableAccountId: '1200', cashAccountId: '1100', deferredAccountId: '2410', revenueAccountId: '4090', discountAccountId: '5160', outputVatAccountId: '2200' };
    const V = { country: 'SA', policyRate: vat };
    const terms: TU.Term[] = [{ id: 'model-term-2026-2', label: 'الفصل الثاني 2026', startMonth: year + '-01', months: 5, feeHalalas: 900_000, citizens: 960, residents: 240 }];
    if (months.includes(8)) terms.push({ id: 'model-term-2026-27-1', label: 'الفصل الأول 2026-2027', startMonth: year + '-09', months: 4, feeHalalas: 900_000, citizens: 960, residents: 240 });
    ledger.terms = terms;
    const st = new Map(terms.map((t) => [t.id, TU.emptyTermState()]));
    const post = (t: TU.Term, j: { date: string; reference: string; memo: string; party?: string; lines: ModelLine[] }, meta: Record<string, unknown>, source: string) =>
      je(j.date, j.memo, j.lines, { source, reference: j.reference, party: j.party, meta: { tuition: { termId: t.id, ...meta } } });
    const bill = (t: TU.Term, date: string) => {
      const s = st.get(t.id)!, r = TU.termInvoiceJournal(t, { id: 'i', date, ...V }, A);
      post(t, r.journal, { kind: 'invoice', fees: r.fees, vat: r.vat }, 'الرسوم الدراسية'); s.openHalalas += r.fees + r.vat;
      const amt = Math.round(r.fees * 0.06), d = TU.discountJournal(t, s, { id: 'd', date, category: 'citizen', amountHalalas: amt, reason: 'خصم الإخوة والمنح', ...V }, A);
      post(t, d.journal, { kind: 'discount', amount: amt, vat: d.vat }, 'المنح والخصومات'); s.discountHalalas += amt; s.openHalalas -= amt + d.vat;
      return s.openHalalas;
    };
    const collect = (t: TU.Term, date: string, amount: number) => {
      const s = st.get(t.id)!, a = Math.min(amount, s.openHalalas); if (a <= 0) return;
      post(t, TU.collectionJournal(t, s, { id: 'c', date, amountHalalas: a }, A).journal, { kind: 'collect', amount: a }, 'تحصيل الرسوم');
      s.collectedHalalas += a; s.openHalalas -= a;
    };
    const plan: Record<number, [TU.Term, number][]> = {};
    const due = (m: number, t: TU.Term, h: number) => { (plan[m] ??= []).push([t, h]); };
    for (const m of months) {
      for (const t of terms) {
        const m0 = Number(t.startMonth.slice(5)) === 9 ? 8 : 1;
        if (m === m0) { const open = bill(t, dayOf(year, m, m0 === 1 ? 5 : 25)); due(m, t, Math.round(open * 0.6)); due(m + 1, t, Math.round(open * 0.3)); due(m + 3, t, Math.round(open * 0.05)); }
      }
      if (m === 2) { const t = terms[0], s = st.get(t.id)!, w = TU.withdrawalJournal(t, s, { id: 'w', date: dayOf(year, 2, 10), category: 'resident', students: 2, fromMonth: year + '-03', ...V }, A);
        post(t, w.journal, { kind: 'withdraw', category: 'resident', students: 2, credit: w.credit, vat: w.vat }, 'انسحاب طلاب');
        s.creditedHalalas += w.credit; s.withdrawnResidents += 2; s.openHalalas -= w.credit + w.vat; }
      for (const [t, h] of plan[m] ?? []) collect(t, dayOf(year, m, 15), h);
      for (const t of terms) { const s = st.get(t.id)!, ym = year + '-' + pad(m);
        if (!TU.termMonths(t).includes(ym) || s.recognisedMonths.includes(ym)) continue;
        const r = TU.recognitionJournal(t, s, ym, { id: 'e', date: end(m) }, A);
        post(t, r.journal, { kind: 'earn', months: r.months, amount: r.amount }, 'الرسوم الدراسية'); s.recognisedMonths.push(...r.months); s.recognisedHalalas += r.amount; }
      if (m !== 6 && m !== 7) sale(end(m), 'النقل المدرسي — 300 طالب', vary(15_000_000, 0.03), { revenue: '4900', source: 'النقل' });
    }
  },
  /* the factory, through the production engine (finance/production-order-engine) and with the books screen's meta, so
     «أوامر التشغيل» reads it: one product, a one-litre bottle at a standard 0.85 (polyethylene 0.40, a cap 0.15, labour
     0.20, overhead 0.10); each month raw material bought on credit and a production order of about 2.4 million bottles —
     materials issued, labour and overhead absorbed at standard, closed into finished goods with 2% scrap and the cost
     variance (adverse or favourable) — then credit sales at 38% over standard cost, collected 85% the month after;
     suppliers paid 90% the month after */
  manufacturing: ({ year, months, rnd, vary, je, sale, pay, collect, end, vat, ledger }) => {
    const A = { materialsAccountId: '1370', wipAccountId: '1380', finishedAccountId: '1390', labourAccountId: '6100', overheadAccountId: '6300', scrapAccountId: '5100',
      varianceAccountId: '5170', cogsAccountId: '5000', payableAccountId: '2100', inputVatAccountId: '1400' };
    const P: PO.Product = { id: 'model-prd-bottle', name: 'عبوة بلاستيكية 1 لتر', unit: 'عبوة', labourPerUnitHalalas: 20, overheadPerUnitHalalas: 10,
      bom: [{ material: 'حبيبات بولي إيثيلين', qtyPerUnit: 0.05, unitCostHalalas: 800 }, { material: 'غطاء', qtyPerUnit: 1, unitCostHalalas: 15 }] };
    const orders: PO.Order[] = []; ledger.products = [P]; ledger.orders = orders;
    const post = (j: { date: string; reference: string; memo: string; party?: string; lines: ModelLine[] }, meta: Record<string, unknown>, source = 'الإنتاج') =>
      je(j.date, j.memo, j.lines, { source, reference: j.reference, party: j.party, meta: { production: meta } });
    const SUP = 'شركة البتروكيماويات للتوريد', CUST = ['شركة الأغذية المتحدة', 'مصانع العبوات الوطنية', 'مجموعة التجزئة الحديثة'];
    let owed = 0, due = 0, dueParty = '', materials = 0, finished = 0;
    for (const m of months) {
      if (owed) pay(dayOf(year, m, 12), 'سداد مورد الخامات', '2100', Math.round(owed * 0.9), 'PAY-RM-' + year + pad(m), SUP);
      if (due) collect(dayOf(year, m, 18), 'تحصيل من ' + dueParty, '1200', Math.round(due * 0.85), 'COL-' + year + pad(m), dueParty);
      const raw = vary(130_000_000, 0.06), b = PO.materialsPurchaseJournal({ id: 'PO-RM-' + year + pad(m), date: dayOf(year, m, 2), supplier: SUP, amountHalalas: raw }, vat, A);
      post(b.journal, { kind: 'purchase', amount: raw }, 'مشتريات'); materials += raw; owed = raw + b.vat;
      const o: PO.Order = { id: 'MO-' + year + '-' + pad(m), productId: P.id, plannedQty: 2_400_000 }; orders.push(o);
      const issue = Math.round(raw * 0.96);
      post(PO.issueJournal(o, { id: 'i', date: dayOf(year, m, 5), amountHalalas: issue, materialsOnHandHalalas: materials }, A).journal, { kind: 'issue', orderId: o.id, amount: issue }); materials -= issue;
      const made = Math.round(o.plannedQty * (0.97 + rnd() * 0.04)), ab = PO.absorbJournal(o, P, { id: 'a', date: end(m), units: made }, A);
      post(ab.journal, { kind: 'absorb', orderId: o.id, labour: ab.labour, overhead: ab.overhead });
      const scrapQty = Math.round(made * 0.02), goodQty = made - scrapQty;
      const c = PO.completeJournal(o, P, { ...PO.emptyOrderState(), issuedHalalas: issue, absorbedHalalas: ab.labour + ab.overhead }, { id: 'c', date: end(m), goodQty, scrapQty }, A);
      post(c.journal, { kind: 'complete', orderId: o.id, good: c.good, scrap: c.scrap, variance: c.variance, goodQty, scrapQty }); finished += c.good;
      const cogs = Math.round(c.good * 0.95), net = Math.round(cogs * 1.38), cust = CUST[m % 3];
      sale(end(m), 'مبيعات عبوات — ' + cust, net, { cashShare: 0, party: cust, reference: 'INV-' + year + pad(m) }); due = net + Math.round(net * vat); dueParty = cust;
      post(PO.costOfSalesJournal({ id: 'COGS-' + year + pad(m), date: end(m), amountHalalas: cogs, finishedOnHandHalalas: finished, memo: 'تكلفة المبيعات — ' + cust }, A).journal, { kind: 'cogs', amount: cogs }, 'مبيعات'); finished -= cogs;
    }
  },
  /* the bakery, through the same engine: a recipe (samoli bread at a standard 0.32), ingredients bought monthly on credit,
     a batch baked every day at actual cost with its yield against the plan, daily cash sales, and at each month end the
     cost of what was sold (88% of the month's batches) and 7% written off as expired */
  bakery: ({ year, months, rnd, vary, je, sale, pay, end, vat, ledger }) => {
    const A = { materialsAccountId: '1370', finishedAccountId: '1390', labourAccountId: '6100', overheadAccountId: '6300', scrapAccountId: '5100', wasteAccountId: '5180',
      cogsAccountId: '5000', payableAccountId: '2100', inputVatAccountId: '1400' };
    const P: PO.Product = { id: 'model-prd-bread', name: 'خبز صامولي', unit: 'قطعة', labourPerUnitHalalas: 6, overheadPerUnitHalalas: 2,
      bom: [{ material: 'دقيق', qtyPerUnit: 0.08, unitCostHalalas: 250 }, { material: 'سكر وخميرة وزيت', qtyPerUnit: 1, unitCostHalalas: 4 }] };
    ledger.products = [P];
    const post = (j: { date: string; reference: string; memo: string; party?: string; lines: ModelLine[] }, meta: Record<string, unknown>, source = 'الإنتاج') =>
      je(j.date, j.memo, j.lines, { source, reference: j.reference, party: j.party, meta: { production: meta } });
    const SUP = 'المطاحن الأولى';
    let owed = 0, ingredients = 0, finished = 0;
    for (const m of months) {
      if (owed) pay(dayOf(year, m, 8), 'سداد مورد الدقيق والمكونات', '2100', owed, 'PAY-ING-' + year + pad(m), SUP);
      const ing = vary(16_000_000, 0.04), b = PO.materialsPurchaseJournal({ id: 'PO-ING-' + year + pad(m), date: dayOf(year, m, 1), supplier: SUP, amountHalalas: ing }, vat, A);
      post(b.journal, { kind: 'purchase', amount: ing }, 'مشتريات'); ingredients += ing; owed = ing + b.vat;
      let made = 0;
      for (let d = 1; d <= lastDay(year, m); d++) {
        const date = dayOf(year, m, d), planned = 19_000, good = Math.round(planned * (0.95 + rnd() * 0.04)), used = Math.min(vary(470_000, 0.06), ingredients);
        const bt = PO.batchJournal(P, { id: 'B-' + date.replace(/-/g, ''), date, plannedQty: planned, goodQty: good, ingredientsHalalas: used, wagesHalalas: 130_000, ingredientsOnHandHalalas: ingredients }, A);
        post(bt.journal, { kind: 'batch', productId: P.id, plannedQty: planned, goodQty: good, cost: bt.cost }); ingredients -= used; finished += bt.cost; made += bt.cost;
        const g = vary(1_800_000, 0.2); sale(date, 'مبيعات اليوم النقدية', Math.round(g / (1 + vat)), { source: 'نقاط البيع', reference: 'POS-' + date });
      }
      const cogs = Math.round(made * 0.88), waste = Math.round(made * 0.07);
      post(PO.costOfSalesJournal({ id: 'COGS-' + year + pad(m), date: end(m), amountHalalas: cogs, finishedOnHandHalalas: finished }, A).journal, { kind: 'cogs', amount: cogs }, 'مبيعات'); finished -= cogs;
      post(PO.wasteJournal({ id: 'W-' + year + pad(m), date: end(m), amountHalalas: waste, reason: 'انتهاء الصلاحية والتلف', finishedOnHandHalalas: finished }, A).journal, { kind: 'waste', amount: waste }); finished -= waste;
    }
  },
  /* the sheep farm, through the agriculture pack's engine (finance/livestock-engine) and with the books screen's meta, so
     «الدورات والقطعان» reads it: one cycle, a flock of 2,000 head bought in January; feed bought monthly on credit and
     95% of it capitalised into the flock; lambs born in February and March (no cost: the cost per head falls); 1.2%
     mortality a month; 150–200 head sold each month at the flock's average cost per head; and at 30 September the flock
     remeasured to fair value less costs to sell (IAS 41) */
  agriculture: ({ year, months, rnd, vary, je, pay, end, vat, ledger }) => {
    const A = { biologicalAccountId: '1395', feedAccountId: '1396', cashAccountId: '1100', receivableAccountId: '1200', payableAccountId: '2100', inputVatAccountId: '1400',
      outputVatAccountId: '2200', revenueAccountId: '4000', cogsAccountId: '5000', mortalityAccountId: '5190', fairValueAccountId: '4950' };
    const C: LV.Cycle = { id: 'model-cycle-flock', name: 'القطيع الرئيسي — نعيمي', unit: 'رأس' }, births: { cycleId: string; date: string; heads: number }[] = [];
    ledger.cycles = [C]; ledger.cycleBirths = births;
    const post = (j: { date: string; reference: string; memo: string; party?: string; lines: ModelLine[] }, meta: Record<string, unknown>, source: string) =>
      je(j.date, j.memo, j.lines, { source, reference: j.reference, party: j.party, meta: { livestock: { cycleId: C.id, ...meta } } });
    const SUP = 'شركة الأعلاف الوطنية', s = LV.emptyCycleState();
    let owed = 0, feedStore = 0;
    const st = LV.stockingJournal(C, { id: 'FLOCK-' + year, date: dayOf(year, 1, 3), heads: 2000, amountHalalas: 180_000_000 }, vat, A);
    post(st.journal, { kind: 'stock', heads: 2000, amount: 180_000_000 }, 'مشتريات'); Object.assign(s, { heads: 2000, bought: 2000, costHalalas: 180_000_000 });
    for (const m of months) {
      if (owed) pay(dayOf(year, m, 6), 'سداد مورد الأعلاف', '2100', owed, 'PAY-FEED-' + year + pad(m), SUP);
      const feed = vary(20_000_000, 0.06), fp = LV.feedPurchaseJournal({ id: 'PO-FEED-' + year + pad(m), date: dayOf(year, m, 2), supplier: SUP, amountHalalas: feed }, vat, A);
      post(fp.journal, { kind: 'feedbuy', amount: feed }, 'مشتريات'); feedStore += feed; owed = feed + fp.vat;
      const fed = Math.round(feed * 0.95), fj = LV.feedingJournal(C, s, { id: 'FEED-' + year + pad(m), date: end(m), amountHalalas: fed, feedOnHandHalalas: feedStore }, A);
      post(fj.journal, { kind: 'feed', amount: fed }, 'الحظائر'); feedStore -= fed; s.costHalalas += fed; s.feedHalalas += fed;
      if (m === 2 || m === 3) { const born = 220 + Math.floor(rnd() * 60); births.push({ cycleId: C.id, date: end(m), heads: born }); s.heads += born; s.born += born; }
      const dead = Math.round(s.heads * 0.012), mj = LV.mortalityJournal(C, s, { id: 'MORT-' + year + pad(m), date: end(m), heads: dead, cause: 'نفوق طبيعي وأمراض' }, A);
      post(mj.journal, { kind: 'death', heads: dead, cost: mj.cost }, 'الحظائر'); s.heads -= dead; s.dead += dead; s.costHalalas -= mj.cost;
      const sold = 150 + Math.floor(rnd() * 50), price = sold * vary(145_000, 0.05), sj = LV.saleJournals(C, s, { id: 'SALE-' + year + pad(m), date: dayOf(year, m, 20), heads: sold, amountHalalas: price }, vat, A);
      post(sj.journal, { kind: 'sale', heads: sold, amount: price, cost: sj.cost }, 'مبيعات'); post(sj.costJournal, { kind: 'salecost', heads: 0, cost: 0 }, 'مبيعات');
      s.heads -= sold; s.sold += sold; s.costHalalas -= sj.cost; s.revenueHalalas += price; s.cogsHalalas += sj.cost;
    }
    const fv = LV.fairValueJournal(C, s, { id: 'FV-' + year, date: end(months[months.length - 1]), fairValuePerHeadHalalas: 150_000, costsToSellPerHeadHalalas: 6_000 }, A);
    post(fv.journal, { kind: 'fv', change: fv.change }, 'معيار 41');
  },
  /* the distributor, through the general-trade pack's engine (finance/trade-engine) and with the books screen's meta, so
     «الفروع والهوامش» reads it: two branches (Riyadh buys, 35% of its purchases transferred to Jeddah), credit sales to
     three named customers within their credit limits with a 2% trade discount, cash sales with 1%, cost of sales at 76% of
     net sales out of each branch's stock; purchases paid 85% the month after, customers collected 80% the month after; a
     stock count shortage at Riyadh in May and a bad debt written off in August */
  trade: ({ year, months, vary, je, L, pay, collect, end, vat, ledger }) => {
    const A = { cashAccountId: '1100', receivableAccountId: '1200', payableAccountId: '2100', inventoryAccountId: '1300', inputVatAccountId: '1400', outputVatAccountId: '2200',
      revenueAccountId: '4000', discountAccountId: '4100', cogsAccountId: '5000' };
    const RUH = 'الفرع الرئيسي — الرياض', JED = 'فرع جدة', SUP = 'شركة الإلكترونيات المتحدة';
    const CUST: [string, string][] = [['مؤسسة الريان', RUH], ['شركة الأفق الحديثة', RUH], ['متاجر الشرق', JED]];
    const limits: Record<string, number> = { 'مؤسسة الريان': 120_000_000, 'شركة الأفق الحديثة': 120_000_000, 'متاجر الشرق': 100_000_000 };
    ledger.branches = [RUH, JED]; ledger.creditLimits = limits;
    const stock: Record<string, number> = { [RUH]: 0, [JED]: 0 }, bal: Record<string, number> = {};
    const post = (j: { date: string; reference: string; memo: string; party?: string; lines: ModelLine[] }, meta: Record<string, unknown>, source: string) =>
      je(j.date, j.memo, j.lines, { source, reference: j.reference, party: j.party, meta: { trade: meta } });
    const sell = (date: string, branch: string, gross: number, discPct: number, customer?: string) => {
      const disc = Math.round(gross * discPct), cost = Math.round((gross - disc) * 0.76);
      const r = TR.branchSaleJournals({ id: (customer ? 'INV-' : 'POS-') + date.replace(/-/g, '') + '-' + branch.length + (customer ? customer.length : 0), date, branch, customer, onCredit: !!customer, grossHalalas: gross, discountHalalas: disc,
        costHalalas: cost, branchStockHalalas: stock[branch], customerBalanceHalalas: customer ? bal[customer] ?? 0 : 0, creditLimitHalalas: customer ? limits[customer] : null }, vat, A);
      post(r.journal, { kind: 'sale', branch, gross, discount: disc, cost }, 'مبيعات'); post(r.costJournal, { kind: 'salecost', branch }, 'مبيعات');
      stock[branch] -= cost; if (customer) bal[customer] = (bal[customer] ?? 0) + r.total;
      return r.total;
    };
    let owed = 0; const due: Record<string, number> = {};
    for (const m of months) {
      if (owed) pay(dayOf(year, m, 10), 'سداد الموردين', '2100', Math.round(owed * 0.85), 'PAY-' + year + pad(m), SUP);
      for (const [c] of CUST) if (due[c]) { const v = Math.round(due[c] * 0.8); collect(dayOf(year, m, 16), 'تحصيل من ' + c, '1200', v, 'COL-' + c + '-' + year + pad(m), c); bal[c] -= v; }
      const buy = vary(160_000_000, 0.05), pr = TR.branchPurchaseJournal({ id: 'PO-' + year + pad(m), date: dayOf(year, m, 3), branch: RUH, supplier: SUP, amountHalalas: buy }, vat, A);
      post(pr.journal, { kind: 'purchase', branch: RUH, amount: buy }, 'مشتريات'); stock[RUH] += buy; owed = buy + pr.vat;
      const moved = Math.round(buy * 0.35), tr = TR.transferJournal({ id: 'TRF-' + year + pad(m), date: dayOf(year, m, 4), from: RUH, to: JED, costHalalas: moved, fromStockHalalas: stock[RUH] }, A);
      post(tr.journal, { kind: 'transfer', from: RUH, to: JED, amount: moved }, 'تحويل مخزون'); stock[RUH] -= moved; stock[JED] += moved;
      for (const [i, [c, branch]] of CUST.entries()) due[c] = sell(dayOf(year, m, 12 + i * 5), branch, vary(25_000_000, 0.1), 0.02, c);
      sell(end(m), RUH, vary(60_000_000, 0.08), 0.01); sell(end(m), JED, vary(35_000_000, 0.08), 0.01);
      if (m === 5) { je(end(m), 'فرق جرد مستودع الرياض (عجز)', [L('5100', 1_850_000, 0), L('1300', 0, 1_850_000)], { source: 'جرد', reference: 'COUNT-' + year + '05', meta: { trade: { kind: 'adjust', branch: RUH, amount: 1_850_000 } } }); stock[RUH] -= 1_850_000; }
      if (m === 8) { const bad = 2_300_000; je(end(m), 'إعدام دين متعثر — متاجر الشرق', [L('6300', bad, 0), L('1200', 0, bad, 'متاجر الشرق')], { source: 'تسوية', reference: 'BAD-' + year + '08', party: 'متاجر الشرق' });
        due['متاجر الشرق'] = Math.max(0, due['متاجر الشرق'] - bad); bal['متاجر الشرق'] -= bad; }
    }
  },
};

/** the checks a model company must pass before it is offered: every entry balances and posts to the chart, the trial
    balance balances, cash never goes negative at a month end, and the period is closed */
export function checkModelBooks(b: ModelBooks) {
  const codes = new Set(b.accounts.map((a) => a[0])), issues: string[] = [];
  let dr = 0, cr = 0;
  for (const e of b.entries) {
    let d = 0, c = 0;
    for (const l of e.lines) { if (!codes.has(l.accountId)) issues.push(e.id + ': حساب غير موجود ' + l.accountId); d += Math.round(l.debit * 100); c += Math.round(l.credit * 100); }
    if (d !== c) issues.push(e.id + ': غير متزن'); dr += d; cr += c;
    if (e.date > b.lockDate) issues.push(e.id + ': بعد تاريخ الإقفال');
  }
  const bal = (code: string, upTo: string) => b.entries.filter((e) => e.date <= upTo).reduce((s, e) => s + e.lines.filter((l) => l.accountId === code).reduce((t, l) => t + Math.round(l.debit * 100) - Math.round(l.credit * 100), 0), 0);
  for (let m = 1; m <= b.months; m++) { const d = dayOf(b.year, m, lastDay(b.year, m)); if (bal('1100', d) < 0) issues.push('النقدية سالبة في ' + d); }
  const type = new Map(b.accounts.map((a) => [a[0], a[2] as AccountType]));
  const revenue = b.entries.reduce((s, e) => s + e.lines.filter((l) => type.get(l.accountId) === 'revenue').reduce((t, l) => t + Math.round(l.credit * 100) - Math.round(l.debit * 100), 0), 0);
  return { ok: !issues.length && dr === cr, issues, entries: b.entries.length, trialBalanceHalalas: dr - cr, revenueHalalas: revenue, balance: (code: string) => bal(code, b.lockDate) };
}

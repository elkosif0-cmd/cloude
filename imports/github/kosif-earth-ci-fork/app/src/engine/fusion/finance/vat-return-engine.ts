import type { JournalEntry } from './ledger-engine';

/* the VAT return from the books, laid out like the ZATCA form: standard-rated sales (box 1) and standard-rated domestic
   purchases (box 7) with their VAT, and the net due. The base of each side is read from the same entries that carry the
   tax, so a reversal or a credit note nets out on its own. Settlement entries are left out. */

export type VatEntry = JournalEntry & { vatSettlement?: boolean };

export type VatReturnInput = {
  entries: VatEntry[];
  start: string;
  end: string;
  outputVatAccountId: string;
  inputVatAccountId: string;
  typeOf: (accountId: string) => string | undefined;
  /** receivables, payables, cash and similar: never part of a tax base */
  controlAccountIds?: string[];
  rate?: number;
};

export type VatReturn = {
  salesBase: number;
  outputVat: number;
  purchasesBase: number;
  inputVat: number;
  net: number;
  salesEntries: number;
  purchaseEntries: number;
  /** entries whose VAT is not the standard rate of their base (zero-rated lines, typing errors) */
  offRate: string[];
};

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function vatReturn(input: VatReturnInput): VatReturn {
  const rate = input.rate ?? 0.15;
  const control = new Set([...(input.controlAccountIds ?? []), input.outputVatAccountId, input.inputVatAccountId]);
  let salesBase = 0, outputVat = 0, purchasesBase = 0, inputVat = 0, salesEntries = 0, purchaseEntries = 0;
  const offRate: string[] = [];
  for (const entry of input.entries) {
    const d = String(entry.date).slice(0, 10);
    if (entry.vatSettlement || d < input.start || d > input.end) continue;
    let out = 0, inp = 0, sBase = 0, pBase = 0;
    for (const line of entry.lines) {
      const dr = Number(line.debit) || 0, cr = Number(line.credit) || 0;
      if (line.accountId === input.outputVatAccountId) out += cr - dr;
      else if (line.accountId === input.inputVatAccountId) inp += dr - cr;
      else if (!control.has(line.accountId)) {
        const t = input.typeOf(line.accountId);
        if (t === 'revenue') sBase += cr - dr;
        else if (t === 'asset' || t === 'expense') pBase += dr - cr;
      }
    }
    if (Math.abs(out) > 0.004) {
      salesEntries++; outputVat += out; salesBase += sBase;
      if (Math.abs(out - sBase * rate) > 0.05) offRate.push(entry.id);
    }
    if (Math.abs(inp) > 0.004) {
      purchaseEntries++; inputVat += inp; purchasesBase += pBase;
      if (Math.abs(inp - pBase * rate) > 0.05) offRate.push(entry.id);
    }
  }
  outputVat = money(outputVat); inputVat = money(inputVat);
  return { salesBase: money(salesBase), outputVat, purchasesBase: money(purchasesBase), inputVat, net: money(outputVat - inputVat), salesEntries, purchaseEntries, offRate };
}

/** closes the period's output and input VAT into one account: what is owed to (or refundable from) the authority */
export function buildVatSettlementEntry(p: { id: string; date: string; reference: string; outputVat: number; inputVat: number; outputVatAccountId: string; inputVatAccountId: string; netAccountId: string }): VatEntry {
  const out = money(p.outputVat), inp = money(p.inputVat), net = money(out - inp);
  if (out < 0 || inp < 0 || (out === 0 && inp === 0)) throw new Error('NOTHING_TO_SETTLE');
  const lines = [
    ...(out > 0 ? [{ accountId: p.outputVatAccountId, debit: out, credit: 0, description: 'إقفال ضريبة المخرجات' }] : []),
    ...(inp > 0 ? [{ accountId: p.inputVatAccountId, debit: 0, credit: inp, description: 'إقفال ضريبة المدخلات' }] : []),
    ...(net > 0 ? [{ accountId: p.netAccountId, debit: 0, credit: net, description: 'صافي الضريبة المستحقة للهيئة' }] : []),
    ...(net < 0 ? [{ accountId: p.netAccountId, debit: -net, credit: 0, description: 'صافي الضريبة المستردة من الهيئة' }] : []),
  ];
  return { id: p.id, date: p.date, reference: p.reference, lines, vatSettlement: true };
}

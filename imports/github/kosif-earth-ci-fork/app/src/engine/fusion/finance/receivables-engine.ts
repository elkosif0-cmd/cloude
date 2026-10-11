export type ReceivableInvoice = {
  id: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paid: number;
};

export type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+';

export type AgedReceivable = ReceivableInvoice & {
  outstanding: number;
  daysPastDue: number;
  bucket: AgingBucket;
};

export type ReceivablesSummary = {
  rows: AgedReceivable[];
  totals: Record<AgingBucket, number>;
  outstanding: number;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function wholeDays(fromIso: string, toIso: string) {
  const from = Date.parse(fromIso + 'T00:00:00Z');
  const to = Date.parse(toIso + 'T00:00:00Z');
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

function bucketFor(days: number): AgingBucket {
  if (days <= 0) return 'current';
  if (days <= 30) return '1-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

export function ageReceivables(invoices: ReceivableInvoice[], asOfDate: string): ReceivablesSummary {
  const rows = invoices
    .map((invoice) => {
      const outstanding = roundMoney(Math.max(0, invoice.amount - invoice.paid));
      const daysPastDue = outstanding === 0 ? 0 : wholeDays(invoice.dueDate, asOfDate);
      return {
        ...invoice,
        outstanding,
        daysPastDue,
        bucket: bucketFor(daysPastDue),
      };
    })
    .filter((row) => row.outstanding > 0);

  const totals: Record<AgingBucket, number> = {
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0,
  };

  for (const row of rows) totals[row.bucket] = roundMoney(totals[row.bucket] + row.outstanding);

  return {
    rows,
    totals,
    outstanding: roundMoney(rows.reduce((sum, row) => sum + row.outstanding, 0)),
  };
}

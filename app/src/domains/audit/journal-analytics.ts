import type {JournalEntry} from '../finance/ledger-engine';

export type JournalRiskCode =
  | 'UNBALANCED'
  | 'ROUND_AMOUNT'
  | 'JUST_BELOW_MATERIALITY'
  | 'WEEKEND_POSTING'
  | 'LARGE_AMOUNT';

export type JournalRiskFinding = {
  entryId: string;
  code: JournalRiskCode;
  score: number;
  detail: string;
};

export type JournalAnalyticsOptions = {
  materiality: number;
  largeAmount?: number;
  roundUnit?: number;
};

function maxLineAmount(entry: JournalEntry) {
  return Math.max(0, ...entry.lines.map((line) => Math.max(line.debit, line.credit)));
}

export function analyzeJournals(entries: JournalEntry[], options: JournalAnalyticsOptions): JournalRiskFinding[] {
  const findings: JournalRiskFinding[] = [];
  const materiality = Math.max(0, options.materiality);
  const largeAmount = options.largeAmount ?? materiality;
  const roundUnit = options.roundUnit ?? 1000;

  for (const entry of entries) {
    const debit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const credit = entry.lines.reduce((sum, line) => sum + line.credit, 0);
    const amount = maxLineAmount(entry);

    if (Math.abs(debit - credit) > 0.005) {
      findings.push({entryId:entry.id,code:'UNBALANCED',score:100,detail:'إجمالي المدين لا يساوي إجمالي الدائن'});
    }

    if (amount > 0 && roundUnit > 0 && amount % roundUnit === 0) {
      findings.push({entryId:entry.id,code:'ROUND_AMOUNT',score:35,detail:`مبلغ دائري عند مضاعفات ${roundUnit}`});
    }

    if (materiality > 0 && amount >= materiality * 0.9 && amount < materiality) {
      findings.push({entryId:entry.id,code:'JUST_BELOW_MATERIALITY',score:75,detail:'القيد أقل مباشرة من الأهمية النسبية'});
    }

    if (amount >= largeAmount && largeAmount > 0) {
      findings.push({entryId:entry.id,code:'LARGE_AMOUNT',score:60,detail:'قيد مرتفع القيمة'});
    }

    const day = new Date(entry.date + 'T00:00:00Z').getUTCDay();
    if (day === 5 || day === 6) {
      findings.push({entryId:entry.id,code:'WEEKEND_POSTING',score:30,detail:'تاريخ القيد في عطلة نهاية الأسبوع'});
    }
  }

  return findings.sort((a,b)=>b.score-a.score || a.entryId.localeCompare(b.entryId));
}

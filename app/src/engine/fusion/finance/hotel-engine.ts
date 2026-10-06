/* the hospitality pack (FOUNDATION §3.7 «عمق قطاع الفنادق»): deposits taken ahead of a stay, the night audit that posts each
   day's room and food-and-beverage revenue, the booking channels' commissions, and the KPIs a hotel is judged by.
   A deposit is a liability (2300) taxed when it is received; the night audit first settles the stay from the deposit left
   (so VAT is charged only on the part the deposit does not cover) and the rest in cash or as a receivable. A channel's
   commission is a share of its room revenue, owed to the channel (2160) and expensed (5120). Money is in halalas. */

export type HotelAccounts = { cashAccountId: string; receivableAccountId: string; depositAccountId: string; roomRevenueAccountId: string; fbRevenueAccountId: string;
  outputVatAccountId?: string; commissionExpenseAccountId: string; commissionPayableAccountId: string };
const sar = (h: number) => h / 100;
const int = (v: unknown) => Number.isInteger(v) && (v as number) >= 0;

/** a guest's deposit ahead of the stay: cash (with its VAT) against the deposits liability */
export function depositJournal(x: { id: string; date: string; guest: string; amountHalalas: number }, vatRate: number, a: HotelAccounts) {
  if (!String(x.guest || '').trim()) throw new Error('حدد الضيف أو الحجز');
  if (!Number.isInteger(x.amountHalalas) || x.amountHalalas <= 0) throw new Error('مبلغ العربون يجب أن يكون أكبر من صفر');
  const vat = vatRate > 0 ? Math.round(x.amountHalalas * vatRate) : 0;
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  return { vat, journal: { id: x.id, date: x.date, reference: 'DEP-' + x.id, memo: 'عربون حجز — ' + x.guest, party: x.guest, lines: [
    { accountId: a.cashAccountId, debit: sar(x.amountHalalas + vat), credit: 0, description: 'عربون ' + x.guest },
    { accountId: a.depositAccountId, debit: 0, credit: sar(x.amountHalalas), description: 'ودائع الحجوزات — ' + x.guest },
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة العربون' }] : []),
  ] } };
}

export type NightInput = { id: string; date: string; guest: string; roomsSold: number; roomRevenueHalalas: number; fbRevenueHalalas?: number;
  settleBy: 'cash' | 'receivable'; depositLeftHalalas?: number; channel?: string; commissionPct?: number };

/** one night audit line (a guest, a group or a channel's sales for the day): deposit first, VAT on the rest, then cash or receivable */
export function nightAudit(x: NightInput, vatRate: number, a: HotelAccounts) {
  const guest = String(x.guest || '').trim();
  if (!guest) throw new Error('حدد الضيف أو الحجز');
  if (!Number.isInteger(x.roomsSold) || x.roomsSold < 0) throw new Error('عدد الغرف المباعة غير صالح');
  if (!int(x.roomRevenueHalalas) || !int(x.fbRevenueHalalas ?? 0)) throw new Error('الإيرادات يجب أن تكون أعداداً صحيحة غير سالبة بالهللة');
  const room = x.roomRevenueHalalas, fb = x.fbRevenueHalalas ?? 0, revenue = room + fb;
  if (revenue <= 0) throw new Error('لا إيراد في هذه الليلة');
  const applied = Math.min(Math.max(0, x.depositLeftHalalas ?? 0), revenue);
  const vat = vatRate > 0 ? Math.round((revenue - applied) * vatRate) : 0;
  if (vat && !a.outputVatAccountId) throw new Error('حساب ضريبة المخرجات غير موجود');
  const rest = revenue - applied + vat, settle = x.settleBy === 'receivable' ? a.receivableAccountId : a.cashAccountId;
  const lines = [
    ...(applied ? [{ accountId: a.depositAccountId, debit: sar(applied), credit: 0, description: 'من عربون ' + guest }] : []),
    ...(rest ? [{ accountId: settle, debit: sar(rest), credit: 0, description: (x.settleBy === 'receivable' ? 'على حساب ' : 'محصّل من ') + guest }] : []),
    ...(room ? [{ accountId: a.roomRevenueAccountId, debit: 0, credit: sar(room), description: 'إيراد الغرف — ' + x.roomsSold + ' غرفة' }] : []),
    ...(fb ? [{ accountId: a.fbRevenueAccountId, debit: 0, credit: sar(fb), description: 'الأغذية والمشروبات' }] : []),
    ...(vat ? [{ accountId: a.outputVatAccountId as string, debit: 0, credit: sar(vat), description: 'ضريبة المخرجات' }] : []),
  ];
  const channel = String(x.channel || '').trim(), pct = Math.min(100, Math.max(0, Number(x.commissionPct) || 0));
  const commission = channel && pct ? Math.round((room * pct) / 100) : 0;
  return { applied, vat, rest, commission,
    journal: { id: x.id, date: x.date, reference: 'NA-' + x.date, memo: 'الإقفال الليلي ' + x.date + ' — ' + guest + (channel ? ' (' + channel + ')' : ''), party: x.settleBy === 'receivable' ? guest : undefined, lines },
    commissionJournal: commission ? { id: x.id + '-c', date: x.date, reference: 'COM-' + x.date, memo: 'عمولة ' + channel + ' — ' + x.date, party: channel, lines: [
      { accountId: a.commissionExpenseAccountId, debit: sar(commission), credit: 0, description: 'عمولة ' + pct + '٪ من إيراد الغرف' },
      { accountId: a.commissionPayableAccountId, debit: 0, credit: sar(commission), description: 'مستحق ' + channel },
    ] } : null };
}

/** occupancy, ADR and RevPAR overall and by channel */
export function hotelKpis(nights: { date: string; roomsAvailable: number; roomsSold: number; roomRevenueHalalas: number; channel?: string }[]) {
  const avail = new Map<string, number>(); let sold = 0, rev = 0;
  const byChannel = new Map<string, { channel: string; roomsSold: number; roomRevenueHalalas: number }>();
  for (const n of nights) {
    avail.set(n.date, Math.max(avail.get(n.date) ?? 0, n.roomsAvailable || 0));
    sold += n.roomsSold || 0; rev += n.roomRevenueHalalas || 0;
    const k = String(n.channel || 'مباشر').trim() || 'مباشر', c = byChannel.get(k) ?? { channel: k, roomsSold: 0, roomRevenueHalalas: 0 };
    c.roomsSold += n.roomsSold || 0; c.roomRevenueHalalas += n.roomRevenueHalalas || 0; byChannel.set(k, c);
  }
  const available = [...avail.values()].reduce((s, v) => s + v, 0), r2 = (x: number) => Math.round(x * 100) / 100;
  return { roomsAvailable: available, roomsSold: sold, roomRevenueHalalas: rev,
    occupancyPct: available ? r2((sold / available) * 100) : null, adrHalalas: sold ? Math.round(rev / sold) : null, revparHalalas: available ? Math.round(rev / available) : null,
    channels: [...byChannel.values()].map((c) => ({ ...c, sharePct: rev ? r2((c.roomRevenueHalalas / rev) * 100) : null })).sort((a, b) => b.roomRevenueHalalas - a.roomRevenueHalalas) };
}

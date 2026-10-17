/* The journal's audit trail (edit log) — every posted entry sealed into a hash chain, so that an edited, deleted,
   inserted or reordered entry shows.
   Why: auditors of India's largest groups report, for every company, that «the accounting software… has the feature of
   recording audit trail (edit log) facility and the same has operated throughout the year for all relevant
   transactions… we did not come across any instance of the audit trail feature being tampered with, and the audit
   trail has been preserved» (Reliance, Infosys — Companies (Accounts) Rules). ZATCA's e-invoices chain each invoice
   to the hash of the one before it for the same reason.
   How: each entry's seal = SHA-256(previous seal | canonical content). The canonical content leaves out what may
   legitimately change after posting (the «reversed by» link — this app corrects by reversal, never by deletion).
   Entries posted before sealing began are «legacy»: outside the chain until sealed once, with the date recorded. */

/* ---------- SHA-256 (FIPS 180-4), synchronous, over UTF-8 ---------- */
const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
export function sha256(text: string): string {
  const bytes = new TextEncoder().encode(text), l = bytes.length, n = (((l + 9) >> 6) + 1) << 6, m = new Uint8Array(n);
  m.set(bytes); m[l] = 0x80;
  const bits = l * 8; m[n - 4] = (bits >>> 24) & 255; m[n - 3] = (bits >>> 16) & 255; m[n - 2] = (bits >>> 8) & 255; m[n - 1] = bits & 255;
  m[n - 5] = Math.floor(bits / 2 ** 32) & 255;
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], w = new Array<number>(64);
  const r = (x: number, s: number) => (x >>> s) | (x << (32 - s));
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = (m[o + 4 * i] << 24) | (m[o + 4 * i + 1] << 16) | (m[o + 4 * i + 2] << 8) | m[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0; h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

/* ---------- the chain ---------- */
export type ChainLine = { accountId: string; debit: number; credit: number; description?: string };
export type ChainEntry = { id: string; date: string; reference?: string; memo?: string; source?: string; sourceId?: string; party?: string;
  reversalOf?: string; lines: ChainLine[]; seq?: number; sealedAt?: string; prev?: string; hash?: string; legacy?: boolean; [k: string]: unknown };
export const GENESIS = '0'.repeat(64);
/** Demo entries (the sample company) are cleared at will, so they never enter the chain. */
const outside = (e: ChainEntry) => e.demo === true;

/** The content that must never change once posted («reversedBy» is added later by a reversal and is left out). */
export function canonical(e: ChainEntry): string {
  return JSON.stringify([e.seq ?? 0, e.sealedAt ?? '', e.id, e.date, e.reference ?? '', e.memo ?? '', e.source ?? '', e.sourceId ?? '', e.party ?? '', e.reversalOf ?? '',
    e.lines.map((l) => [l.accountId, Math.round(l.debit * 100), Math.round(l.credit * 100)])]); // to the halala: a 0.01 edit shows
}
export const sealOf = (e: ChainEntry, prev: string) => sha256(prev + '|' + canonical(e));

/** Seal every unsealed entry after the last sealed one, in posting order. Returns the count sealed. Mutates the entries. */
export function sealNew(entries: ChainEntry[], now: string): number {
  let last: ChainEntry | undefined, n = 0;
  for (const e of entries) if (e.hash && !outside(e)) last = e;
  let prev = last?.hash ?? GENESIS, seq = last?.seq ?? 0;
  const from = last ? entries.indexOf(last) + 1 : entries.findIndex((e) => !e.legacy && !outside(e));
  if (from < 0) return 0;
  for (let i = from; i < entries.length; i++) {
    const e = entries[i]; if (e.hash || e.legacy || outside(e)) continue;
    e.seq = ++seq; e.sealedAt = now; e.prev = prev; e.hash = sealOf(e, prev); prev = e.hash; n++;
  }
  return n;
}
/** Mark the entries posted before the chain existed as legacy (outside the chain), so sealing starts clean. */
export function markLegacy(entries: ChainEntry[]): number { let n = 0; for (const e of entries) if (!e.hash && !e.legacy && !outside(e)) { e.legacy = true; n++; } return n; }
/** Bring legacy entries into the chain once (they are sealed after the last sealed entry, with today's seal date). */
export function sealLegacy(entries: ChainEntry[], now: string): number {
  const legacy = entries.filter((e) => e.legacy && !e.hash); if (!legacy.length) return 0;
  const rest = entries.filter((e) => !legacy.includes(e));
  legacy.forEach((e) => { delete e.legacy; });
  entries.length = 0; entries.push(...rest, ...legacy);
  return sealNew(entries, now);
}

export type ChainIssue = { id: string; seq?: number; kind: 'edited' | 'broken-link' | 'gap' | 'unsealed'; ar: string };
export function verifyChain(entries: ChainEntry[]) {
  const sealed = entries.filter((e) => e.hash && !outside(e)), issues: ChainIssue[] = [];
  let prev = GENESIS, seq = 0;
  for (const e of sealed) {
    if ((e.seq ?? 0) !== seq + 1) issues.push({ id: e.id, seq: e.seq, kind: 'gap', ar: 'انقطاع في التسلسل بعد ' + seq + ' — قيد محذوف أو مُعاد ترتيبه' });
    if (e.prev !== prev) issues.push({ id: e.id, seq: e.seq, kind: 'broken-link', ar: 'الختم لا يرتبط بالقيد السابق' });
    if (sealOf(e, e.prev ?? '') !== e.hash) issues.push({ id: e.id, seq: e.seq, kind: 'edited', ar: 'محتوى القيد تغير بعد ترحيله' });
    prev = e.hash as string; seq = e.seq ?? seq + 1;
  }
  const firstSealed = entries.findIndex((e) => e.hash && !outside(e));
  if (firstSealed >= 0) entries.slice(firstSealed).forEach((e) => { if (!e.hash && !e.legacy && !outside(e)) issues.push({ id: e.id, kind: 'unsealed', ar: 'قيد أُضيف دون ختم (خارج سجل التعديلات)' }); });
  const dates = sealed.map((e) => e.date).sort();
  return { ok: issues.length === 0, issues, sealed: sealed.length, legacy: entries.filter((e) => e.legacy && !e.hash).length, demo: entries.filter(outside).length, total: entries.length,
    head: sealed.length ? sealed[sealed.length - 1].hash as string : GENESIS, firstDate: dates[0] ?? null, lastDate: dates[dates.length - 1] ?? null,
    sealedFrom: sealed.length ? sealed.map((e) => String(e.sealedAt ?? '')).sort()[0] ?? null : null,
    reversals: entries.filter((e) => e.reversalOf && !outside(e)).length, manual: entries.filter((e) => !outside(e) && (!e.source || e.source === 'يدوي')).length };
}
/** Entries found in storage without a seal after the chain began: they were not saved through the books (the books
 *  seal on every save), so they are recorded as an integrity event before being sealed. */
export function externalInserts(stored: ChainEntry[]): string[] {
  const first = stored.findIndex((e) => e.hash && !outside(e));
  return first < 0 ? [] : stored.slice(first).filter((e) => !e.hash && !e.legacy && !outside(e)).map((e) => e.id);
}
/** Does the trail cover a period? (Reliance/Infosys: «operated throughout the year for all relevant transactions»). */
export function coversPeriod(entries: ChainEntry[], start: string, end: string) {
  const inP = entries.filter((e) => e.date >= start && e.date <= end && !outside(e)), out = inP.filter((e) => !e.hash);
  return { entries: inP.length, uncovered: out.length, throughout: inP.length > 0 && out.length === 0 };
}

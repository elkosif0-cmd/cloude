/* KOSIF EARTH — the AI trust layer (FOUNDATION §3.0 rule 9: the AI session is bound to the workspace; the company's data
   never leaves the device unmasked). Pure functions, no DOM, no storage:
     maskText(text,{names})      → identifiers and master-data names replaced by stable tokens «[عميل-7]», with the reverse map
     maskBody / unmaskResponse   → the same over the Gemini request/answer shape every feature uses (ui/core/ai.js)
     unmask(text,map)            → the AI's answer back to the real values, on the device
     preflight(text,policy)      → {allowed,reasons}: residual identifiers, a customer-table dump, oversize → blocked
     traceRecord(...)            → one row of the unified AI trace log (docs/registry/EXTERNAL_BACKLOG_ar.md §3/§4-1): the hash
                                   of the masked prompt, counts and sizes — never the prompt text
     sha256Hex(text)             → synchronous SHA-256 (the trace must be built even where crypto.subtle is unavailable) */

export type Kind = 'iban' | 'email' | 'vat' | 'nationalId' | 'cr' | 'phone' | 'name';
export type MaskMap = Record<string, string>;
export type MaskCounts = Record<Kind, number>;
export type MaskResult = { masked: string; map: MaskMap; counts: MaskCounts; total: number };
export type MaskOptions = { names?: readonly string[]; map?: MaskMap };

export const TOKEN_LABEL: Readonly<Record<Kind, string>> = Object.freeze({
  iban: 'آيبان', email: 'بريد', vat: 'ضريبي', nationalId: 'هوية', cr: 'سجل', phone: 'هاتف', name: 'عميل',
});
const KINDS: readonly Kind[] = ['iban', 'email', 'vat', 'nationalId', 'cr', 'phone', 'name'];
export const emptyCounts = (): MaskCounts => ({ iban: 0, email: 0, vat: 0, nationalId: 0, cr: 0, phone: 0, name: 0 });

/* digits in either script; separators a human types inside a number */
const D = '[0-9\\u0660-\\u0669]';
const S = '[\\s\\-.]?';
const NOT_BEFORE = '(?<![\\p{L}\\p{N}@._-])';
const NOT_AFTER = '(?![\\p{L}\\p{N}])';
const NOT_DIGIT_BEFORE = '(?<![0-9\\u0660-\\u0669+])';
const NOT_DIGIT_AFTER = '(?![0-9\\u0660-\\u0669])';
const rx = (src: string, flags = 'gu') => new RegExp(src, flags);

/* order = priority on overlap: the longer, more specific identifier wins the span */
const RULES: readonly { kind: Kind; re: RegExp }[] = [
  /* SA + 2 check digits + 20 digits (24 characters), spaces or dashes allowed inside */
  { kind: 'iban', re: rx(`${NOT_BEFORE}SA(?:${S}${D}){22}${NOT_AFTER}`, 'giu') },
  { kind: 'email', re: rx(`[\\p{L}\\p{N}._%+-]+@[\\p{L}\\p{N}.-]+\\.[\\p{L}]{2,}`, 'gu') },
  /* ZATCA VAT number: 15 digits starting with 3 */
  { kind: 'vat', re: rx(`${NOT_DIGIT_BEFORE}3${D}{14}${NOT_DIGIT_AFTER}`) },
  /* a labelled commercial registration wins over the shape rules (Saudi CRs are 10 digits too) */
  { kind: 'cr', re: rx(`(?:س\\.?\\s?ت\\.?|سجل\\s+تجاري|رقم\\s+السجل|CR)\\s*[:#：]?\\s*${D}{10}${NOT_DIGIT_AFTER}`, 'giu') },
  /* national ID / iqama: 10 digits starting with 1 or 2 */
  { kind: 'nationalId', re: rx(`${NOT_DIGIT_BEFORE}[12\\u0661\\u0662]${D}{9}${NOT_DIGIT_AFTER}`) },
  /* an unlabelled CR: 10 digits starting with 4 or 7 (the registry's city prefixes) */
  { kind: 'cr', re: rx(`${NOT_DIGIT_BEFORE}[47\\u0664\\u0667]${D}{9}${NOT_DIGIT_AFTER}`) },
  /* Saudi mobiles: 05x…, +966 5…, 00966 5…, 966 5…; then any international +… number */
  { kind: 'phone', re: rx(`${NOT_DIGIT_BEFORE}(?:(?:\\+|00|٠٠)${S})?(?:966|٩٦٦)${S}[5\\u0665](?:${S}${D}){8}${NOT_DIGIT_AFTER}`) },
  { kind: 'phone', re: rx(`${NOT_DIGIT_BEFORE}[0\\u0660][5\\u0665](?:${S}${D}){8}${NOT_DIGIT_AFTER}`) },
  { kind: 'phone', re: rx(`${NOT_DIGIT_BEFORE}\\+${D}{1,3}(?:${S}${D}){7,12}${NOT_DIGIT_AFTER}`) },
];

const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* a master-data name matches its common spellings: alef/hamza, ta marbuta/ha, ya/alef maqsura, any whitespace run, no tashkeel */
const normalizeName = (s: string) => String(s ?? '').normalize('NFC').replace(/[ً-ْٰـ]/g, '').replace(/\s+/g, ' ').trim();
function nameRegex(name: string): string {
  return normalizeName(name).split('').map((ch) => {
    if (/[اأإآٱ]/.test(ch)) return '[اأإآٱ]';
    if (/[ةه]/.test(ch)) return '[ةه]';
    if (/[ىي]/.test(ch)) return '[ىي]';
    if (ch === ' ') return '\\s+';
    return escapeRx(ch) + (/[\p{L}]/u.test(ch) ? '[\\u064B-\\u0652\\u0670\\u0640]*' : '');
  }).join('');
}
/* the comparable form of a word: alef/hamza, ta marbuta, ya folded, lower case */
const foldWord = (w: string) => w.toLowerCase().replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
/** of a master list that may hold 30,000 names, only the names whose every word (3+ letters) occurs in the text can match —
    the regex is built from those alone (a word may carry an attached clitic: لمؤسسة، وشركة) */
export function candidateNames(names: readonly string[] | undefined, text: string): string[] {
  const words = new Set<string>();
  for (const w of normalizeName(text).split(/[^\p{L}\p{N}]+/u)) { if (!w) continue; const f = foldWord(w); words.add(f); if (/^[ولبكف]/.test(f) && f.length > 3) words.add(f.slice(1)); }
  return (names ?? []).filter((n) => { const parts = normalizeName(n).split(' ').filter((w) => w.length >= 3); return parts.length > 0 && parts.every((w) => words.has(foldWord(w))); });
}
/** the master-data names as one alternation, the longest first (so «شركة الوادي للحوم» wins over «شركة الوادي») */
export function nameRule(names: readonly string[] | undefined, text?: string): RegExp | null {
  const pool = text == null ? (names ?? []) : candidateNames(names, text);
  const list = [...new Set(pool.map(normalizeName).filter((n) => n.length >= 3))].sort((a, b) => b.length - a.length);
  if (!list.length) return null;
  /* a name may carry an attached Arabic clitic (لمؤسسة، وشركة، بأغنام) but is never part of a longer word */
  return rx(`(?:(?<=^|[^\\p{L}\\p{N}])|(?<=(?:^|[^\\p{L}\\p{N}])[ولبكف]))(?:${list.map(nameRegex).join('|')})(?![\\p{L}\\p{N}])`, 'giu');
}

/* the same original value always gets the same token inside one map (and across calls when the map is passed back) */
const digitsOnly = (raw: string) => raw.replace(/[\s\-.]/g, '').replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).toUpperCase();
/* 0512345678, +966512345678, 00966512345678 and 966512345678 are one number */
const canonPhone = (raw: string) => { const d = digitsOnly(raw).replace(/^\+/, '').replace(/^00/, ''); return /^9665\d{8}$/.test(d) ? '0' + d.slice(3) : d; };
const canon = (kind: Kind, raw: string) => kind === 'name' ? normalizeName(raw).toLowerCase() : kind === 'phone' ? canonPhone(raw) : digitsOnly(raw);
const tokenOf = (kind: Kind, n: number) => `[${TOKEN_LABEL[kind]}-${n}]`;
const TOKEN_RE = /\[(آيبان|بريد|ضريبي|هوية|سجل|هاتف|عميل)-(\d+)\]/gu;

type Span = { start: number; end: number; kind: Kind; raw: string };
function spans(text: string, names?: readonly string[]): Span[] {
  const found: Span[] = [];
  const rules: { kind: Kind; re: RegExp }[] = [...RULES];
  const nr = nameRule(names, text);
  if (nr) rules.push({ kind: 'name', re: nr });
  for (const { kind, re } of rules) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0, end = start + m[0].length;
      if (!m[0]) continue;
      if (found.some((s) => start < s.end && end > s.start)) continue; /* an earlier (higher-priority) rule owns this span */
      found.push({ start, end, kind, raw: m[0] });
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

export function maskText(text: string, opts: MaskOptions = {}): MaskResult {
  const src = String(text ?? '');
  const map: MaskMap = { ...(opts.map ?? {}) };
  const counts = emptyCounts();
  const byCanon = new Map<string, string>();
  const next: Record<Kind, number> = { iban: 0, email: 0, vat: 0, nationalId: 0, cr: 0, phone: 0, name: 0 };
  for (const [tok, raw] of Object.entries(map)) {
    const m = /^\[(.+)-(\d+)\]$/u.exec(tok); if (!m) continue;
    const kind = KINDS.find((k) => TOKEN_LABEL[k] === m[1]); if (!kind) continue;
    next[kind] = Math.max(next[kind], Number(m[2]));
    byCanon.set(kind + '|' + canon(kind, raw), tok);
  }
  let out = '', pos = 0, total = 0;
  for (const s of spans(src, opts.names)) {
    const key = s.kind + '|' + canon(s.kind, s.raw);
    let tok = byCanon.get(key);
    if (!tok) { tok = tokenOf(s.kind, ++next[s.kind]); byCanon.set(key, tok); map[tok] = s.raw; }
    out += src.slice(pos, s.start) + tok; pos = s.end; counts[s.kind]++; total++;
  }
  out += src.slice(pos);
  return { masked: out, map, counts, total };
}

/** the answer back to the real values; a token the map does not know stays as it is */
export function unmask(text: string, map: MaskMap): string {
  return String(text ?? '').replace(TOKEN_RE, (tok) => (tok in map ? map[tok] : tok));
}
/** how many tokens of the map a text still carries (0 after unmask) */
export const tokenCount = (text: string): number => (String(text ?? '').match(TOKEN_RE) ?? []).length;

/* ---------- the Gemini request/answer shape (the common language of ui/core/ai.js) ---------- */
type GPart = { text?: string; [k: string]: unknown };
type GContent = { role?: string; parts?: GPart[] };
export type GBody = { systemInstruction?: { parts?: GPart[] }; contents?: GContent[]; [k: string]: unknown };
export type GResponse = { candidates?: { content?: { parts?: GPart[]; [k: string]: unknown }; [k: string]: unknown }[]; [k: string]: unknown };

function mapParts(parts: GPart[] | undefined, fn: (t: string) => string): GPart[] | undefined {
  return parts ? parts.map((p) => (p && typeof p.text === 'string' ? { ...p, text: fn(p.text) } : p)) : parts;
}
/** every text part of the request (system instruction and all turns) masked with ONE shared map; inline documents untouched */
export function maskBody(body: GBody, opts: MaskOptions = {}): { body: GBody; map: MaskMap; counts: MaskCounts; total: number; text: string } {
  let map: MaskMap = { ...(opts.map ?? {}) };
  const counts = emptyCounts(); let total = 0; const texts: string[] = [];
  const run = (t: string) => { const r = maskText(t, { names: opts.names, map }); map = r.map; total += r.total; for (const k of KINDS) counts[k] += r.counts[k]; texts.push(r.masked); return r.masked; };
  const out: GBody = { ...body };
  if (body.systemInstruction) out.systemInstruction = { ...body.systemInstruction, parts: mapParts(body.systemInstruction.parts, run) };
  if (Array.isArray(body.contents)) out.contents = body.contents.map((c) => (c && Array.isArray(c.parts) ? { ...c, parts: mapParts(c.parts, run) } : c));
  return { body: out, map, counts, total, text: texts.join('\n') };
}
/** the answer's text parts un-masked on the device */
export function unmaskResponse<T extends GResponse>(res: T, map: MaskMap): T {
  if (!res || !Array.isArray(res.candidates)) return res;
  return { ...res, candidates: res.candidates.map((c) => (c && c.content && Array.isArray(c.content.parts) ? { ...c, content: { ...c.content, parts: mapParts(c.content.parts, (t) => unmask(t, map)) } } : c)) };
}
/** the answer's text, for sizes and the trace */
export function responseText(res: GResponse | undefined): string {
  return ((res?.candidates ?? []).flatMap((c) => c?.content?.parts ?? []).map((p) => (typeof p?.text === 'string' ? p.text : '')).join('\n'));
}

/* ---------- preflight: nothing leaves the device when the masked text still carries identifiers or a table of customers ---------- */
export type Policy = {
  /** identifiers (phones, IBANs, IDs…) the masked text may still carry — 0: none */
  maxUnmasked?: number;
  /** names from the master data the masked text may still carry */
  maxUnmaskedNames?: number;
  /** the request text in UTF-8 bytes */
  maxBytes?: number;
  /** lines that each carry a customer/phone token — this many of them is a customer table being dumped */
  tableRows?: number;
  /** the names to check residues against (the same list maskText used) */
  names?: readonly string[];
};
export const DEFAULT_POLICY: Readonly<Required<Omit<Policy, 'names'>>> = Object.freeze({ maxUnmasked: 0, maxUnmaskedNames: 0, maxBytes: 600_000, tableRows: 40 });
export type Preflight = { allowed: boolean; reasons: string[]; residual: MaskCounts; bytes: number; tableLines: number };

export const utf8Bytes = (text: string): number => { let n = 0; for (const ch of String(text ?? '')) { const c = ch.codePointAt(0) ?? 0; n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; } return n; };

export function preflight(text: string, policy: Policy = {}): Preflight {
  const p = { ...DEFAULT_POLICY, ...policy };
  const src = String(text ?? '');
  const reasons: string[] = [];
  const bytes = utf8Bytes(src);
  const r = maskText(src, { names: p.names });
  const residualIds = r.total - r.counts.name;
  if (residualIds > p.maxUnmasked) reasons.push(`بقي ${residualIds} معرّفاً غير مُقنَّع (هواتف/آيبان/هويات/أرقام ضريبية) — الحد ${p.maxUnmasked}`);
  if (r.counts.name > p.maxUnmaskedNames) reasons.push(`بقي ${r.counts.name} اسماً من بيانات الشركة الأساسية غير مُقنَّع — الحد ${p.maxUnmaskedNames}`);
  if (bytes > p.maxBytes) reasons.push(`حجم الطلب ${bytes} بايت يتجاوز الحد ${p.maxBytes}`);
  /* a customer table: many lines each carrying a customer/phone token — or, in a text that never went through the masker,
     a raw name or phone per line */
  const rows = src.split(/\r?\n/).filter((l) => { if (/\[(عميل|هاتف)-\d+\]/u.test(l)) return true; const m = maskText(l, { names: p.names }); return m.counts.name > 0 || m.counts.phone > 0; }).length;
  if (rows >= p.tableRows) reasons.push(`النص يحمل جدول عملاء (${rows} سطراً بأسماء أو هواتف) — لا يُرسل جدول العملاء إلى مزود خارجي`);
  return { allowed: reasons.length === 0, reasons, residual: r.counts, bytes, tableLines: rows };
}

/* ---------- the unified AI trace log ---------- */
export type Outcome = 'ok' | 'error' | 'blocked';
export type TraceRecord = {
  id: string; ts: string; company: string; gate: string; screen: string; provider: string; model: string; purpose: string;
  promptHash: string; maskedCount: number; maskedKinds: Partial<MaskCounts>; inputBytes: number; outputBytes: number;
  outcome: Outcome; durationMs: number; userNote: string; error: string;
};
export type TraceInput = Partial<Omit<TraceRecord, 'maskedKinds'>> & { maskedKinds?: Partial<MaskCounts> | MaskCounts };
const str = (v: unknown, max = 200) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const int = (v: unknown) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 ? n : 0; };
/** one row; never carries the prompt or the answer — the caller passes promptHash = sha256Hex(masked prompt) */
export function traceRecord(input: TraceInput): TraceRecord {
  const kinds: Partial<MaskCounts> = {};
  for (const k of KINDS) { const n = int((input.maskedKinds as Partial<MaskCounts> | undefined)?.[k]); if (n) kinds[k] = n; }
  const outcome: Outcome = input.outcome === 'error' || input.outcome === 'blocked' ? input.outcome : 'ok';
  return {
    id: str(input.id, 40) || 'ai-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ts: str(input.ts, 40) || new Date().toISOString(),
    company: str(input.company, 80), gate: str(input.gate, 20), screen: str(input.screen, 60),
    provider: str(input.provider, 20), model: str(input.model, 80), purpose: str(input.purpose, 60) || str(input.screen, 60) || 'عام',
    promptHash: /^[0-9a-f]{64}$/i.test(String(input.promptHash ?? '')) ? String(input.promptHash).toLowerCase() : '',
    maskedCount: int(input.maskedCount), maskedKinds: kinds, inputBytes: int(input.inputBytes), outputBytes: int(input.outputBytes),
    outcome, durationMs: int(input.durationMs), userNote: str(input.userNote, 280), error: outcome === 'ok' ? '' : str(input.error, 200),
  };
}
/** the trace must never hold these */
export const FORBIDDEN_TRACE_FIELDS = Object.freeze(['prompt', 'text', 'body', 'contents', 'response', 'answer', 'map', 'key', 'apiKey']);
export function traceSafe(row: unknown): boolean {
  if (!row || typeof row !== 'object') return false;
  return !FORBIDDEN_TRACE_FIELDS.some((f) => f in (row as Record<string, unknown>));
}
export type TraceSummary = { total: number; ok: number; error: number; blocked: number; masked: number; inputBytes: number; outputBytes: number; byProvider: Record<string, number>; byPurpose: Record<string, number>; byOutcome: Record<Outcome, number> };
export function traceSummary(rows: readonly TraceRecord[]): TraceSummary {
  const s: TraceSummary = { total: 0, ok: 0, error: 0, blocked: 0, masked: 0, inputBytes: 0, outputBytes: 0, byProvider: {}, byPurpose: {}, byOutcome: { ok: 0, error: 0, blocked: 0 } };
  for (const r of rows) {
    s.total++; s[r.outcome]++; s.byOutcome[r.outcome]++; s.masked += r.maskedCount; s.inputBytes += r.inputBytes; s.outputBytes += r.outputBytes;
    s.byProvider[r.provider] = (s.byProvider[r.provider] ?? 0) + 1; s.byPurpose[r.purpose] = (s.byPurpose[r.purpose] ?? 0) + 1;
  }
  return s;
}
export type TraceFilter = { purpose?: string; provider?: string; outcome?: Outcome | ''; q?: string };
export function filterTrace(rows: readonly TraceRecord[], f: TraceFilter = {}): TraceRecord[] {
  const q = str(f.q, 80).toLowerCase();
  return rows.filter((r) => (!f.purpose || r.purpose === f.purpose) && (!f.provider || r.provider === f.provider) && (!f.outcome || r.outcome === f.outcome)
    && (!q || [r.screen, r.model, r.userNote, r.company, r.promptHash].some((v) => String(v).toLowerCase().includes(q))));
}

/* ---------- synchronous SHA-256 (RFC 6234) over the UTF-8 bytes of a string ---------- */
const K = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
function utf8(text: string): Uint8Array {
  const out: number[] = [];
  for (const ch of String(text ?? '')) {
    const c = ch.codePointAt(0) ?? 0;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return Uint8Array.from(out);
}
export function sha256Hex(text: string): string {
  const msg = utf8(text), len = msg.length, bitLen = len * 8;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(msg); padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000)); dv.setUint32(padded.length - 4, bitLen >>> 0);
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), maj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0; H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return [...H].map((x) => x.toString(16).padStart(8, '0')).join('');
}

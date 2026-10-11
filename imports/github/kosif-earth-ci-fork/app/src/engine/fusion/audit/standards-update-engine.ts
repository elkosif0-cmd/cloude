/* Standards updates from official sources — asks Gemini (the user's key) with Google Search grounding
   to check the codex against the issuing bodies, and keeps only what an official domain supports:
     IFRS Foundation (ifrs.org) · IAASB (iaasb.org) · SOCPA (socpa.org.sa) · ZATCA (zatca.gov.sa) ·
     Ministry of Commerce (mc.gov.sa) · Capital Market Authority (cma.org.sa) · IESBA (ethicsboard.org)
   Nothing changes in the codex automatically: every found item is «pending» until the user approves it,
   and each keeps its source links and the date it was checked. (Search grounding cannot be combined
   with a JSON response schema, so the reply is JSON inside text and is parsed leniently.) */
import { normalizeCode, STANDARD, type StandardDoc } from './codex-engine';
import { extractText, parseJsonLoose } from './ai-review-engine';

export const OFFICIAL_SOURCES = [
  { org: 'IFRS Foundation', domain: 'ifrs.org', url: 'https://www.ifrs.org/issued-standards/', covers: 'IFRS / IAS / IFRS for SMEs' },
  { org: 'IAASB', domain: 'iaasb.org', url: 'https://www.iaasb.org/standards-pronouncements', covers: 'ISA / ISQM' },
  { org: 'SOCPA', domain: 'socpa.org.sa', url: 'https://socpa.org.sa', covers: 'اعتماد المعايير في المملكة' },
  { org: 'ZATCA', domain: 'zatca.gov.sa', url: 'https://zatca.gov.sa', covers: 'الزكاة وضريبة القيمة المضافة والفوترة' },
  { org: 'وزارة التجارة', domain: 'mc.gov.sa', url: 'https://mc.gov.sa', covers: 'نظام الشركات' },
  { org: 'هيئة السوق المالية', domain: 'cma.org.sa', url: 'https://cma.org.sa', covers: 'متطلبات الشركات المدرجة' },
  { org: 'IESBA', domain: 'ethicsboard.org', url: 'https://www.ethicsboard.org', covers: 'قواعد السلوك المهني' },
] as const;

export const isOfficial = (url: string) => { try { const h = new URL(url).hostname.toLowerCase(); return OFFICIAL_SOURCES.some((s) => h === s.domain || h.endsWith('.' + s.domain)); } catch { return false; } };

export type UpdateItem = { code: string; change: string; effective: string; kind: 'new' | 'amendment' | 'endorsement' | 'effective-date' | 'other';
  sources: { title: string; url: string }[]; official: boolean; status: 'pending' | 'approved' | 'dismissed'; checkedAt: string };

export function buildUpdateCheckBody(codes: string[], today: string) {
  const list = codes.map((c) => STANDARD[c]).filter((s): s is StandardDoc => !!s).map((s) => `${s.code} — ${s.titleEn} — آخر ما لدينا: ${s.latest} — السريان: ${s.effective}`);
  const text = [
    `تاريخ اليوم ${today}. تحقق من المصادر الرسمية فقط (${OFFICIAL_SOURCES.map((s) => s.domain).join('، ')}) عن أي معيار جديد أو تعديل أو قرار اعتماد في المملكة العربية السعودية أو تغيير في تاريخ السريان للمعايير التالية منذ 2024:`,
    ...list,
    'أعد JSON فقط بالشكل: {"updates":[{"code":"رمز المعيار","change":"وصف التغيير بالعربية","effective":"تاريخ السريان","kind":"new|amendment|endorsement|effective-date|other","sources":["رابط رسمي"]}]}.',
    'لا تذكر شيئاً بلا مصدر رسمي. إن لم تجد جديداً فأعد {"updates":[]}.',
  ].join('\n');
  return { contents: [{ role: 'user', parts: [{ text }] }], tools: [{ google_search: {} }], generationConfig: { temperature: 0 } };
}

/** Keep updates backed by an official source: either cited in the JSON or in the grounding metadata. */
export function parseUpdateResponse(api: unknown, checkedAt: string): { items: UpdateItem[]; dropped: number; sources: { title: string; url: string }[] } {
  const a = api as { candidates?: { groundingMetadata?: { groundingChunks?: { web?: { uri?: string; title?: string } }[] } }[] };
  const chunks = (a?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []).map((c) => ({ title: String(c.web?.title ?? ''), url: String(c.web?.uri ?? '') })).filter((c) => c.url);
  /* grounding URIs are often redirect links; the title carries the domain */
  const officialChunks = chunks.filter((c) => isOfficial(c.url) || OFFICIAL_SOURCES.some((s) => c.title.toLowerCase().includes(s.domain)));
  const raw = parseJsonLoose(extractText(api).text) as { updates?: Record<string, unknown>[] } | null;
  const items: UpdateItem[] = []; let dropped = 0;
  for (const u of raw?.updates ?? []) {
    const code = normalizeCode(String(u.code ?? '')) ?? String(u.code ?? '').trim();
    const cited = (Array.isArray(u.sources) ? u.sources : []).map(String).filter(isOfficial).map((url) => ({ title: new URL(url).hostname, url }));
    const sources = cited.length ? cited : officialChunks;
    if (!code || !String(u.change ?? '').trim() || !sources.length) { dropped++; continue; }
    const kind = (['new', 'amendment', 'endorsement', 'effective-date'] as const).find((k) => k === u.kind) ?? 'other';
    items.push({ code, change: String(u.change).trim().slice(0, 800), effective: String(u.effective ?? '').trim().slice(0, 80), kind, sources: sources.slice(0, 4), official: cited.length > 0, status: 'pending', checkedAt });
  }
  return { items, dropped, sources: officialChunks };
}

/** Apply approved updates: the record keeps its facts and gains the approved change as its latest note. */
export function applyApproved(list: StandardDoc[], updates: UpdateItem[]): StandardDoc[] {
  return list.map((s) => {
    const mine = updates.filter((u) => u.code === s.code && u.status === 'approved');
    if (!mine.length) return s;
    const last = mine[mine.length - 1];
    return { ...s, latest: last.change + (last.effective ? ' (السريان: ' + last.effective + ')' : '') + ' — تحقق ' + last.checkedAt.slice(0, 10), url: last.sources[0]?.url ?? s.url };
  });
}

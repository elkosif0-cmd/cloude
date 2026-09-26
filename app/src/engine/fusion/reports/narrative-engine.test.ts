import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from './tb-import-engine';
import { reviewTrialBalance } from '../audit/tb-review-engine';
import { buildNarrativeBody, compact, facts, fallbackNarrative, normalizeNarrative, numbersIn, quality, verifyNumbers } from './narrative-engine';
import { blueprint, CORPUS, kamProcedures, letterTopics, reportStructure, riskCatalogue, SECTIONS } from './global-corpus-engine';

const tb = parseTrialBalance(SAMPLE_TB_CSV);
const review = reviewTrialBalance(tb);
const input = { fs: review.fs, review, ctx: { company: 'شركة تجريبية', activity: 'تجارة اللحوم', period: 'السنة المنتهية في 31 ديسمبر 2025', periodEnd: '2025-12-31', country: 'SA' as const },
  framework: 'IFRS' as const, currency: 'ر.س', opinion: { ar: 'رأي غير معدل', modified: false, basis: [], goingConcern: false },
  kams: [{ title: 'ذمم مدينة تجارية', description: 'بلغ الرصيد 80,000 ر.س.', how: 'شملت إجراءاتنا: مصادقات العملاء؛ تحليل الأعمار؛ التحصيل اللاحق؛ تقييم المخصص' }] };
const pack = facts(input);

describe('the corpus read from every page of the bundle', () => {
  it('covers the whole bundle and orders the report', () => {
    expect(CORPUS.pages).toBe(12506);
    expect(CORPUS.pagesClassified).toBeGreaterThan(12400);
    expect(SECTIONS.length).toBeGreaterThan(50);
    const bp = blueprint();
    expect(bp.map((p) => p.part)).toEqual(['strategic', 'governance', 'financial']);
    expect(bp[2].sections.map((s) => s.key)).toContain('kam');
    expect(reportStructure('aramco-2025').find((s) => s.key === 'kam')!.page).toBe(10164);
  });
  it('ranks procedures, risks and letter topics by how many reports carry them', () => {
    const kp = kamProcedures(), rc = riskCatalogue(), lt = letterTopics();
    for (const list of [kp, rc, lt]) for (let i = 1; i < list.length; i++) expect(list[i - 1].reports).toBeGreaterThanOrEqual(list[i].reports);
    expect(rc[0].ar).toBeTruthy();
    expect(lt[0].share).toBeGreaterThan(50);
  });
});

describe('fact pack and number checks', () => {
  it('formats large figures the way the letters do and knows every allowed figure', () => {
    expect(compact(412_600_000, 'ر.س')).toBe('412.6 مليون ر.س');
    expect(pack.facts.find((f) => f.key === 'revenue')).toMatchObject({ value: 500000, prior: 400000, change: 25 });
    expect(verifyNumbers('بلغت الإيرادات 500,000 ر.س بارتفاع 25% عن 400,000', pack)).toEqual([]);
    expect(verifyNumbers('وبلغت الحصة السوقية 63.7% من 9,999,999', pack)).toEqual([63.7, 9999999]);
  });
  it('skips standards, pages, years and list numbers', () => {
    expect(numbersIn('وفق IFRS 15 وIAS 37 (ص 10164) في 2025 خلال 3 سنوات، ١٢٬٥٠٠')).toEqual([12500]);
  });
});

describe('the narrative', () => {
  it('asks the AI with the bundle patterns, the schema and the facts', () => {
    const b = buildNarrativeBody(pack);
    const sys = b.systemInstruction.parts[0].text;
    expect(sys).toContain('12506');
    expect(sys).toContain('ص 10164');
    expect(b.contents[0].parts[0].text).toContain('ذمم مدينة تجارية');
    expect(b.generationConfig.responseSchema.required).toContain('principalRisks');
  });
  it('drafts a complete report without AI that passes its own number check', () => {
    const r = normalizeNarrative(fallbackNarrative(pack), pack, { origin: 'engine' });
    expect(r.unverified).toEqual([]);
    expect(Object.values(r.source).every((v) => v === 'engine')).toBe(true);
    const q = quality(r, pack);
    expect(q.items.find((i) => i.key === 'numbers')!.ok).toBe(true);
    expect(q.score).toBeGreaterThanOrEqual(60);
  });
  it('keeps the engagement KAM titles, fills empty sections and flags invented numbers', () => {
    const raw = { chairLetter: { title: 'رسالة', paragraphs: ['السادة المساهمين', 'نمت الإيرادات إلى 500,000 ر.س وبلغت حصتنا السوقية 42.7%'] },
      kams: [{ title: 'عنوان آخر', matter: 'وصف', procedures: ['قيّمنا', 'اختبرنا', 'قارنّا', 'أعدنا الاحتساب'], disclosure: 'قيّمنا الإفصاح' }] };
    const r = normalizeNarrative(raw, pack);
    expect(r.narrative.kams[0].title).toBe('ذمم مدينة تجارية');
    expect(r.source.chairLetter).toBe('ai');
    expect(r.source.principalRisks).toBe('engine');
    expect(r.unverified).toEqual([{ section: 'chairLetter', numbers: [42.7] }]);
    expect(quality(r, pack).items.find((i) => i.key === 'numbers')!.ok).toBe(false);
  });
});

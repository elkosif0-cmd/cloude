/* The audit programme — ten stages from acceptance to completion (kosif-stable's audit rounds
   R01–R10 and kosif-audit-pro's A01–A10 gates), each with its standards and a status derived from
   the review's own data: what the trial balance contains, the evidence Gemini accepted, the entries
   decided, the disclosures, the final report and the human approvals. No stage is marked done by
   assumption — a stage without the data it needs stays open. */
import { type Review } from './tb-review-engine';
import { inFramework, type Framework } from './codex-engine';

export type StageStatus = 'منجز' | 'قيد التنفيذ' | 'لم يبدأ' | 'غير منطبق';
export type Stage = { id: string; title: string; focus: string; standards: string[]; status: StageStatus; detail: string };
export type ProgrammeInput = {
  review: Review; framework: Framework; evidence: Record<string, 'accepted' | 'partial'>;
  company?: string; period?: string; activity?: string;
  independenceConfirmed?: boolean; partnerApproved?: boolean; rounds?: number; finalIssued?: boolean;
  adjustmentsDecided?: boolean; disclosuresValid?: boolean;
};
const BLUEPRINT: { id: string; title: string; focus: string; standards: string[]; lines?: string[] }[] = [
  { id: 'R01', title: 'القبول والتخطيط والاستقلال', focus: 'حدود التكليف، الاستقلال، مصدر البيانات وخطة الجودة', standards: ['ISQM 1', 'ISA 210', 'ISA 220'] },
  { id: 'R02', title: 'فهم المنشأة والرقابة الداخلية', focus: 'النشاط والإطار والأنظمة والضوابط', standards: ['ISA 315'] },
  { id: 'R03', title: 'تقييم المخاطر والغش', focus: 'مخاطر التحريف الجوهري والغش والأطراف ذات العلاقة', standards: ['ISA 240', 'ISA 315', 'ISA 550'] },
  { id: 'R04', title: 'الأهمية النسبية والعينات', focus: 'مقياس الأهمية والأداء والعينات', standards: ['ISA 320', 'ISA 530'] },
  { id: 'R05', title: 'الإيرادات والعملاء والعقود', focus: 'الاعتراف بالإيراد والقطع والذمم وخسائر الائتمان', standards: ['IFRS 15', 'IFRS 9', 'ISA 505'], lines: ['revenue', 'receivables', 'contractLiab'] },
  { id: 'R06', title: 'المخزون والتكلفة والموردون', focus: 'الجرد والتكلفة وصافي القيمة القابلة للتحقق والالتزامات', standards: ['IAS 2', 'ISA 501'], lines: ['inventory', 'cogs', 'payables', 'accruals'] },
  { id: 'R07', title: 'الأصول والإيجارات والانخفاض', focus: 'الوجود والملكية والاستهلاك وحق الاستخدام', standards: ['IAS 16', 'IAS 36', 'IFRS 16'], lines: ['ppe', 'rou', 'intangibles', 'leaseNcl', 'depreciation'] },
  { id: 'R08', title: 'الأدوات المالية والعملات والضرائب', focus: 'القروض والاستثمارات والزكاة أو الضريبة والقيمة المضافة', standards: ['IFRS 9', 'IAS 12', 'IAS 21'], lines: ['loansCl', 'loansNcl', 'investments', 'zakatPayable', 'zakatExpense', 'vatAsset', 'vatLiability', 'financeCost', 'cash'] },
  { id: 'R09', title: 'العرض والإفصاحات والاستمرارية', focus: 'الإيضاحات والأحكام والتقديرات والأحداث اللاحقة والاستمرارية', standards: ['IAS 1', 'IAS 10', 'ISA 560', 'ISA 570'] },
  { id: 'R10', title: 'الإكمال ومراجعة الجودة والتقرير', focus: 'تجميع التحريفات والإقرارات ومسودة التقرير والاعتماد', standards: ['ISA 450', 'ISA 580', 'ISA 700'] },
];

export function auditProgramme(i: ProgrammeInput): Stage[] {
  const r = i.review, present = new Set(r.fs.lines.filter((l) => l.current !== 0 || (l.prior ?? 0) !== 0).map((l) => l.key));
  const gc = r.findings.some((f) => f.kind === 'going-concern' && f.severity === 'high');
  return BLUEPRINT.map((b) => {
    const standards = b.standards.map((s) => inFramework(s, i.framework)).filter((s, k, a) => a.indexOf(s) === k);
    let status: StageStatus = 'لم يبدأ', detail = '';
    if (b.lines) {
      const mine = b.lines.filter((k) => present.has(k));
      if (!mine.length) { status = 'غير منطبق'; detail = 'لا أرصدة لهذه البنود في الميزان.'; }
      else {
        const acc = mine.filter((k) => i.evidence[k] === 'accepted'), part = mine.filter((k) => i.evidence[k] === 'partial');
        const open = r.findings.filter((f) => f.severity === 'high' && f.lineKey && mine.includes(f.lineKey));
        status = acc.length === mine.length && !open.length ? 'منجز' : acc.length || part.length || (i.rounds ?? 0) > 0 ? 'قيد التنفيذ' : 'لم يبدأ';
        detail = `${acc.length} من ${mine.length} بنود بأدلة مقبولة` + (open.length ? ` · ${open.length} ملاحظة عالية مفتوحة` : '');
      }
    } else if (b.id === 'R01') {
      const ok = !!(i.company && i.period);
      status = ok && i.independenceConfirmed ? 'منجز' : ok ? 'قيد التنفيذ' : 'لم يبدأ';
      detail = !ok ? 'أدخل اسم المنشأة والفترة.' : i.independenceConfirmed ? 'التكليف والاستقلال مؤكدان.' : 'بانتظار تأكيد الاستقلال (ISA 220).';
    } else if (b.id === 'R02') { status = i.activity ? 'منجز' : 'قيد التنفيذ'; detail = i.activity ? 'النشاط والإطار محددان.' : 'أدخل نشاط المنشأة.'; }
    else if (b.id === 'R03') { status = 'منجز'; detail = `${r.risks.filter((x) => x.significant).length} خطر جوهري · خطر الغش المفترض في الإيراد مسجل.`; }
    else if (b.id === 'R04') { status = 'منجز'; detail = `الأهمية النسبية على ${r.materiality.benchmarkAr} بنسبة ${r.materiality.rate * 100}%.`; }
    else if (b.id === 'R09') { status = i.disclosuresValid && !gc ? 'منجز' : 'قيد التنفيذ'; detail = (i.disclosuresValid ? 'جاهزية الإفصاحات مكتملة' : 'جاهزية الإفصاحات غير مكتملة') + (gc ? ' · مؤشرات استمرارية مفتوحة' : ''); }
    else if (b.id === 'R10') { status = i.finalIssued && i.adjustmentsDecided && i.partnerApproved ? 'منجز' : i.finalIssued || i.adjustmentsDecided ? 'قيد التنفيذ' : 'لم يبدأ';
      detail = [i.adjustmentsDecided ? 'القيود محسومة' : 'قيود تنتظر القرار', i.finalIssued ? 'التقرير النهائي صادر' : 'التقرير النهائي لم يصدر', i.partnerApproved ? 'اعتمد الشريك' : 'بانتظار اعتماد الشريك'].join(' · '); }
    return { id: b.id, title: b.title, focus: b.focus, standards, status, detail };
  });
}
export const programmeProgress = (stages: Stage[]) => { const app = stages.filter((s) => s.status !== 'غير منطبق'); return app.length ? Math.round((app.filter((s) => s.status === 'منجز').length / app.length) * 100) : 0; };

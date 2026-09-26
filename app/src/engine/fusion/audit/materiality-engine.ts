export type MaterialityBenchmark = 'revenue' | 'profit-before-tax' | 'assets' | 'equity';

export type MaterialityInput = {
  benchmark: MaterialityBenchmark;
  benchmarkAmount: number;
  benchmarkRate: number;
  performanceRate: number;
  trivialRate: number;
};

export type MaterialityResult = {
  overall: number;
  performance: number;
  trivial: number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function calculateMateriality(input:MaterialityInput):MaterialityResult{
  const base=Math.abs(input.benchmarkAmount);
  const benchmarkRate=Math.max(0,input.benchmarkRate);
  const performanceRate=Math.min(1,Math.max(0,input.performanceRate));
  const trivialRate=Math.min(1,Math.max(0,input.trivialRate));
  const overall=base*benchmarkRate;
  return {
    overall:money(overall),
    performance:money(overall*performanceRate),
    trivial:money(overall*trivialRate),
  };
}

/* ---------- the materiality plan (ISA 320 · ISA 450) as the world's auditors set it ----------
   Distilled from the auditor's reports of ~45 global groups (Aramco/PwC, Unilever/KPMG, HSBC/PwC, bp/Deloitte,
   GSK, AstraZeneca/PwC, Airbus/EY…):
   • the benchmark is profit before zakat and tax for a profit-oriented entity, normalised by adding back items that
     are not part of normal continuing operations (impairments, restructuring, gains or losses on disposals) —
     Unilever «normalised PBTCO», HSBC «excluding notable items», AstraZeneca «after adding back impairment charges»;
   • around 5% of that benchmark (KPMG «a guideline range of up to 5%» for public-interest entities; HSBC and Airbus
     5%); revenue or total assets when profit is volatile or near break-even; a holding company uses its assets
     (AstraZeneca parent 0.4% of net assets, Unilever parent 0.35% of total assets, GSK 0.78% of total assets);
   • performance materiality 65%–75% of materiality, lower where the control environment is weaker, misstatements
     were found before, or management is not willing to correct them (bp 65%, GSK 70%, Unilever/AstraZeneca/HSBC 75%);
   • misstatements are reported to those charged with governance above 5% of materiality (Unilever, Airbus, HSBC,
     bp) — the «clearly trivial» threshold;
   • materiality is compared with the other main captions to judge it (Unilever: 0.99% of revenue, 0.71% of assets). */
export type PlanBenchmark = 'pbt' | 'revenue' | 'assets' | 'equity';
export type RiskFactors = {
  /** first audit of this entity: no history of misstatements to lean on */ firstYear?: boolean;
  priorMisstatements?: 'none' | 'few' | 'many';
  /** significant deficiencies in internal control identified */ controlDeficiencies?: boolean;
  /** false when management did not correct misstatements reported to it */ managementCorrects?: boolean;
  /** listed, bank, insurer or other public-interest entity */ publicInterest?: boolean;
};
export type PlanInput = {
  /** amounts in minor units (halalas) */
  pbt: number; revenue: number; assets: number; equity: number;
  /** added to profit before zakat to normalise it (a negative amount removes a gain) */
  addBacks?: { label: string; amount: number }[];
  /** a holding company whose purpose is to hold investments */ holding?: boolean;
  benchmark?: PlanBenchmark; rate?: number; risk?: RiskFactors; trivialRate?: number;
};
export const PLAN_BENCHMARKS: Record<PlanBenchmark, { ar: string; rate: number; min: number; max: number; why: string }> = {
  pbt: { ar: 'الربح قبل الزكاة والضريبة المعدّل', rate: 0.05, min: 0.03, max: 0.1,
    why: 'الربح قبل الزكاة والضريبة هو مؤشر الأداء الذي يركز عليه مستخدمو قوائم منشأة هادفة للربح، وهو المعيار المتعارف عليه لمثلها.' },
  revenue: { ar: 'الإيرادات', rate: 0.01, min: 0.005, max: 0.02,
    why: 'الربح متذبذب أو قريب من التعادل فلا يصلح أساساً مستقراً؛ الإيرادات تعكس حجم النشاط الذي يهم المستخدمين.' },
  assets: { ar: 'مجموع الموجودات', rate: 0.01, min: 0.0025, max: 0.02,
    why: 'غرض المنشأة الاحتفاظ بالاستثمارات أو الأصول لا تحقيق ربح تشغيلي، فالموجودات أنسب أساس.' },
  equity: { ar: 'حقوق الملكية', rate: 0.02, min: 0.01, max: 0.05,
    why: 'حقوق الملكية أساس مناسب حين يهتم المستخدمون بصافي الأصول أكثر من الربحية.' },
};
export type PlanResult = {
  benchmark: PlanBenchmark; benchmarkAr: string; reported: number; base: number; addBacks: { label: string; amount: number }[];
  rate: number; range: [number, number]; overall: number; performanceRate: number; performance: number; trivialRate: number; trivial: number;
  factors: { label: string; effect: number }[]; crossCheck: { ar: string; amount: number; pct: number }[]; why: string; auto: boolean;
};
const nice = (v: number) => { // three significant figures, never above the computed amount; whole riyals at least
  const a = Math.max(0, Math.floor(v)); if (a < 100) return a;
  const p = Math.pow(10, Math.max(2, Math.floor(Math.log10(a)) - 2)); return Math.floor(a / p) * p;
};
export function planMateriality(i: PlanInput): PlanResult {
  const addBacks = (i.addBacks ?? []).filter((x) => x && Number.isFinite(x.amount) && x.amount !== 0);
  const normalised = i.pbt + addBacks.reduce((s, x) => s + x.amount, 0), rev = Math.abs(i.revenue);
  const auto: PlanBenchmark = i.holding ? 'assets'
    : normalised > 0 && (rev === 0 || normalised >= rev * 0.02) ? 'pbt' : rev > 0 ? 'revenue' : 'assets';
  const benchmark = i.benchmark ?? auto, B = PLAN_BENCHMARKS[benchmark];
  const base = Math.abs(benchmark === 'pbt' ? normalised : benchmark === 'revenue' ? i.revenue : benchmark === 'assets' ? i.assets : i.equity);
  const lo = i.holding && benchmark === 'assets' ? 0.0025 : B.min, hi = i.risk?.publicInterest && benchmark === 'pbt' ? 0.05 : B.max;
  const def = i.holding && benchmark === 'assets' ? 0.005 : B.rate;
  const rate = Math.min(hi, Math.max(lo, i.rate ?? def));
  const overall = nice(base * rate);
  const r = i.risk ?? {}, factors: { label: string; effect: number }[] = [];
  if (r.firstYear) factors.push({ label: 'أول سنة مراجعة — لا تاريخ للتحريفات يمكن الاستناد إليه', effect: -0.1 });
  if (r.priorMisstatements === 'few') factors.push({ label: 'اكتُشفت تحريفات في سنوات سابقة', effect: -0.05 });
  if (r.priorMisstatements === 'many') factors.push({ label: 'تحريفات متكررة أو كبيرة في سنوات سابقة', effect: -0.15 });
  if (r.controlDeficiencies) factors.push({ label: 'أوجه قصور مهمة في الرقابة الداخلية', effect: -0.1 });
  if (r.managementCorrects === false) factors.push({ label: 'الإدارة لم تصحح تحريفات أُبلغت بها', effect: -0.05 });
  if (r.publicInterest) factors.push({ label: 'منشأة ذات مصلحة عامة', effect: -0.05 });
  const performanceRate = Math.round(Math.min(0.75, Math.max(0.5, 0.75 + factors.reduce((s, f) => s + f.effect, 0))) * 100) / 100;
  const trivialRate = Math.min(0.05, Math.max(0.01, i.trivialRate ?? 0.05));
  const crossCheck = ([['الإيرادات', i.revenue], ['الربح قبل الزكاة المعدّل', normalised], ['مجموع الموجودات', i.assets], ['حقوق الملكية', i.equity]] as [string, number][])
    .filter(([, v]) => v !== 0).map(([ar, v]) => ({ ar, amount: v, pct: Math.round((overall / Math.abs(v)) * 10000) / 100 }));
  const why = B.why + (benchmark === 'pbt' && addBacks.length ? ' عُدّل الربح بإضافة: ' + addBacks.map((x) => x.label).join('، ') + ' — بنود لا تمثل النشاط المستمر المعتاد.' : '');
  return { benchmark, benchmarkAr: B.ar, reported: i.pbt, base, addBacks, rate, range: [lo, hi], overall,
    performanceRate, performance: Math.round(overall * performanceRate / 100) * 100, trivialRate, trivial: Math.round(overall * trivialRate / 100) * 100,
    factors, crossCheck, why, auto: !i.benchmark };
}

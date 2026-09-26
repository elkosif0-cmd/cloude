/* The accounting codex (المدونة المحاسبية): the standards the trial-balance review cites, with what
   each one requires, how it relates to a given account, what the auditor does about it, the IFRS for
   SMEs section that corresponds to it, and the official source it was taken from.
   Sources: IFRS Foundation (issued standards), SOCPA (endorsement in the Kingdom; the 2025 complete
   edition and SOCPA's application guidance for IFRS for SMEs, sections 1–10), IAASB (ISAs), ZATCA
   (Zakat implementing regulations 1445H, VAT). Ported and extended from smart-trial-balance-review
   (js/data/standards.js, js/mapping.js) and SEE (classification: standards and assertions).
   A record is facts with a source; `registryDate` is when this registry was compiled, and an update
   found later (see standards-update) is applied only after the user approves it. */

export type Family = 'IFRS' | 'IAS' | 'ISA' | 'SAUDI' | 'EAS' | 'EGYPT';
export type Framework = 'IFRS' | 'SME' | 'EAS';
export type StdStatus = 'effective' | 'upcoming' | 'replaced';
export type StandardDoc = {
  code: string; family: Family; titleAr: string; titleEn: string; purpose: string;
  requirements: string[]; disclosures: string[]; audit: string[];
  sme?: string; effective: string; latest: string; status: StdStatus; replacedBy?: string;
  org: 'IFRS Foundation' | 'IAASB' | 'SOCPA' | 'ZATCA' | 'وزارة التجارة' | 'FRA مصر' | 'مصلحة الضرائب المصرية'; url: string; ifrs?: string;
};

export const REGISTRY_DATE = '2026-09-25';
const IFRS = (slug: string) => 'https://www.ifrs.org/issued-standards/list-of-standards/' + slug + '/';
const IAASB = 'https://www.iaasb.org/standards-pronouncements';

export const STANDARDS: StandardDoc[] = [
  /* ---------- presentation ---------- */
  { code: 'IAS 1', family: 'IAS', titleAr: 'عرض القوائم المالية', titleEn: 'Presentation of Financial Statements',
    purpose: 'يحدد أساس عرض القوائم ذات الغرض العام ومكوناتها والحد الأدنى من البنود وتصنيف المتداول وغير المتداول.',
    requirements: ['مجموعة كاملة من القوائم مع أرقام مقارنة', 'التمييز بين المتداول وغير المتداول', 'عدم المقاصة بين الأصول والالتزامات إلا بنص', 'الإفصاح عن السياسات المحاسبية ذات الأهمية النسبية والأحكام'],
    disclosures: ['السياسات المحاسبية ذات الأهمية النسبية', 'مصادر عدم التأكد من التقديرات', 'إدارة رأس المال'],
    audit: ['مطابقة القوائم مع ميزان المراجعة', 'فحص التصنيف والمقاصة', 'اكتمال الإفصاحات (ISA 700)'],
    sme: 'الأقسام 3–6 و8', effective: '2009 (المعدل)', latest: 'يحل محله IFRS 18 للفترات التي تبدأ في 1 يناير 2027 أو بعده', status: 'replaced', replacedBy: 'IFRS 18',
    org: 'IFRS Foundation', url: IFRS('ias-1-presentation-of-financial-statements') },
  { code: 'IFRS 18', family: 'IFRS', titleAr: 'العرض والإفصاح في القوائم المالية', titleEn: 'Presentation and Disclosure in Financial Statements',
    purpose: 'يحل محل IAS 1: قائمة ربح أو خسارة بفئات محددة ومجموعين إلزاميين، وإفصاح عن مقاييس الأداء المحددة من الإدارة، وتجميع وتفصيل أفضل.',
    requirements: ['تصنيف الإيرادات والمصروفات في فئات: التشغيل، الاستثمار، التمويل، الضرائب/الزكاة، العمليات المتوقفة', 'عرض الربح التشغيلي والربح قبل التمويل والضرائب', 'الإفصاح عن مقاييس الأداء المحددة من الإدارة (MPMs) ومطابقتها', 'مبادئ التجميع والتفصيل وتسمية البنود'],
    disclosures: ['مطابقة كل مقياس أداء للإدارة مع أقرب مجموع في IFRS', 'تحليل المصروفات التشغيلية حسب الطبيعة عند عرضها حسب الوظيفة'],
    audit: ['فحص تصنيف كل بند في فئته', 'إعادة احتساب المجاميع الإلزامية', 'تقييم أثر التطبيق الأول والإفصاح المسبق عنه'],
    effective: '1 يناير 2027 (يسمح بالتطبيق المبكر)', latest: 'اعتمدته SOCPA في 26-12-2024 مع نقل إفصاحاتها الإضافية من IAS 1؛ والشركات المدرجة تفصح عن تقييم أولي لأثره للفترات من 1 أبريل 2026', status: 'upcoming',
    org: 'IFRS Foundation', url: IFRS('ifrs-18-presentation-and-disclosure-in-financial-statements') },
  { code: 'IAS 7', family: 'IAS', titleAr: 'قائمة التدفقات النقدية', titleEn: 'Statement of Cash Flows',
    purpose: 'عرض التدفقات النقدية مصنفة إلى تشغيلية واستثمارية وتمويلية وتعريف النقد وما في حكمه.',
    requirements: ['الطريقة المباشرة أو غير المباشرة للتشغيل', 'النقد وما في حكمه: استثمارات قصيرة شديدة السيولة (عادة ≤ 3 أشهر)', 'الإفصاح عن ترتيبات تمويل الموردين (تعديل 2023)'],
    disclosures: ['مطابقة النقد في القائمة مع المركز المالي', 'المعاملات غير النقدية', 'التغيرات في الالتزامات الناشئة عن التمويل'],
    audit: ['إعادة اشتقاق القائمة من حركة المركز المالي', 'مطابقة الأرصدة البنكية مع المصادقات (ISA 505)'],
    sme: 'القسم 7', effective: '1994 (معدل)', latest: 'تعديلات ترتيبات تمويل الموردين 2024؛ تعديلات تبعية من IFRS 18 في 2027', status: 'effective',
    org: 'IFRS Foundation', url: IFRS('ias-7-statement-of-cash-flows') },
  { code: 'IAS 8', family: 'IAS', titleAr: 'السياسات المحاسبية والتغيرات في التقديرات والأخطاء', titleEn: 'Accounting Policies, Changes in Accounting Estimates and Errors',
    purpose: 'اختيار السياسات وتغييرها، ومعالجة تغير التقدير بأثر مستقبلي، وتصحيح أخطاء الفترات السابقة بأثر رجعي.',
    requirements: ['تصحيح الأخطاء الجوهرية بأثر رجعي وتعديل المقارنة', 'تغير التقدير بأثر مستقبلي', 'الثبات في تطبيق السياسات'],
    disclosures: ['طبيعة الخطأ وأثره على كل بند', 'المعايير الصادرة غير السارية وأثرها المتوقع'],
    audit: ['مقارنة أرصدة الافتتاح مع إقفال السنة السابقة (ISA 510)', 'فحص قيود التسوية ذات الأثر الرجعي'],
    sme: 'القسم 10', effective: '2005 (معدل)', latest: 'يعاد تسميته «أساس إعداد القوائم المالية» مع IFRS 18 في 2027', status: 'effective',
    org: 'IFRS Foundation', url: IFRS('ias-8-accounting-policies-changes-in-accounting-estimates-and-errors') },
  { code: 'IAS 10', family: 'IAS', titleAr: 'الأحداث بعد فترة التقرير', titleEn: 'Events after the Reporting Period',
    purpose: 'التمييز بين الأحداث المعدِّلة وغير المعدِّلة بعد تاريخ التقرير وحتى اعتماد القوائم.',
    requirements: ['تعديل القوائم بالأحداث المعدلة', 'الإفصاح عن الأحداث غير المعدلة الجوهرية', 'لا تعرض التوزيعات المعلنة بعد التاريخ كالتزام'],
    disclosures: ['تاريخ اعتماد القوائم ومن اعتمدها', 'طبيعة الأحداث غير المعدلة وأثرها المالي'],
    audit: ['فحص الأحداث اللاحقة (ISA 560)', 'قراءة محاضر الاجتماعات والتحصيلات والمدفوعات اللاحقة'],
    sme: 'القسم 32', effective: '2005', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-10-events-after-the-reporting-period') },
  /* ---------- assets ---------- */
  { code: 'IAS 2', family: 'IAS', titleAr: 'المخزون', titleEn: 'Inventories',
    purpose: 'قياس المخزون بالتكلفة أو صافي القيمة القابلة للتحقق أيهما أقل وتحديد التكلفة.',
    requirements: ['التكلفة تشمل الشراء والتحويل والتكاليف المباشرة الأخرى', 'الوارد أولاً صادر أولاً أو المتوسط المرجح (لا يسمح بالوارد أخيراً)', 'التخفيض إلى صافي القيمة القابلة للتحقق'],
    disclosures: ['السياسة وطريقة التكلفة', 'المبالغ المخفضة وعكسها', 'المخزون المرهون'],
    audit: ['حضور الجرد (ISA 501)', 'اختبار صافي القيمة القابلة للتحقق بالمبيعات اللاحقة', 'فحص القطع في نهاية السنة'],
    sme: 'القسم 13', effective: '2005', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-2-inventories') },
  { code: 'IAS 16', family: 'IAS', titleAr: 'الممتلكات والآلات والمعدات', titleEn: 'Property, Plant and Equipment',
    purpose: 'الاعتراف بالأصول الثابتة وقياسها بالتكلفة أو إعادة التقييم واستهلاكها على العمر الإنتاجي.',
    requirements: ['الاعتراف الأولي بالتكلفة', 'نموذج التكلفة أو إعادة التقييم لكل فئة', 'الاستهلاك المنتظم ومراجعة العمر والقيمة المتبقية سنوياً', 'الفصل بين الإنفاق الرأسمالي والإيرادي'],
    disclosures: ['جدول الحركة لكل فئة (التكلفة، الإضافات، الاستبعادات، الاستهلاك)', 'طرق الاستهلاك والأعمار', 'الأصول المرهونة والالتزامات الرأسمالية'],
    audit: ['مطابقة سجل الأصول مع الأستاذ', 'فحص الإضافات بالفواتير والملكية', 'إعادة احتساب الاستهلاك', 'المعاينة الفعلية لعينة'],
    sme: 'القسم 17', effective: '2005', latest: 'تعديل المتحصلات قبل الاستخدام المقصود (2022)', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-16-property-plant-and-equipment') },
  { code: 'IAS 36', family: 'IAS', titleAr: 'الانخفاض في قيمة الأصول', titleEn: 'Impairment of Assets',
    purpose: 'ضمان ألا تزيد القيمة الدفترية للأصول عن قيمتها القابلة للاسترداد.',
    requirements: ['تقييم مؤشرات الانخفاض في كل تاريخ تقرير', 'اختبار سنوي للشهرة والأصول غير الملموسة غير محددة العمر', 'القيمة القابلة للاسترداد = الأعلى من القيمة العادلة ناقصاً تكاليف البيع وقيمة الاستخدام'],
    disclosures: ['خسائر الانخفاض وعكسها', 'الافتراضات الرئيسية لقيمة الاستخدام'],
    audit: ['تقييم افتراضات الإدارة (ISA 540)', 'تحليل الحساسية'],
    sme: 'القسم 27', effective: '2004', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-36-impairment-of-assets') },
  { code: 'IAS 38', family: 'IAS', titleAr: 'الأصول غير الملموسة', titleEn: 'Intangible Assets',
    purpose: 'الاعتراف بالأصول غير الملموسة وقياسها وإطفاؤها.',
    requirements: ['قابلية التحديد والسيطرة والمنافع المستقبلية', 'مصروفات البحث تُحمّل؛ التطوير يُرسمل بشروط', 'الإطفاء على العمر المحدد'],
    disclosures: ['جدول الحركة', 'الأعمار وطرق الإطفاء'],
    audit: ['فحص شروط الرسملة', 'إعادة احتساب الإطفاء'],
    sme: 'القسم 18', effective: '2004', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-38-intangible-assets') },
  { code: 'IAS 40', family: 'IAS', titleAr: 'العقارات الاستثمارية', titleEn: 'Investment Property',
    purpose: 'العقارات المحتفظ بها للإيجار أو لزيادة رأس المال: نموذج القيمة العادلة أو التكلفة.',
    requirements: ['اختيار نموذج واحد لكل العقارات الاستثمارية', 'في المملكة: الاعتماد على مقيّم مستقل مؤهل عند القيمة العادلة'],
    disclosures: ['النموذج المستخدم', 'القيمة العادلة وطريقة تحديدها'],
    audit: ['تقييم عمل المقيّم (ISA 500/620)'], sme: 'القسم 16', effective: '2005', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-40-investment-property') },
  { code: 'IAS 41', family: 'IAS', titleAr: 'الزراعة', titleEn: 'Agriculture',
    purpose: 'قياس الأصول الحيوية والمنتجات الزراعية عند الحصاد بالقيمة العادلة ناقصاً تكاليف البيع.',
    requirements: ['القياس بالقيمة العادلة ناقصاً تكاليف البيع ما لم يتعذر', 'النباتات المثمرة ضمن IAS 16'],
    disclosures: ['التسوية بين أول وآخر الفترة', 'وصف كل مجموعة أصول حيوية'],
    audit: ['جرد القطيع أو المحصول', 'تقييم أساس القيمة العادلة'], sme: 'القسم 34', effective: '2003', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-41-agriculture') },
  { code: 'IAS 28', family: 'IAS', titleAr: 'الاستثمارات في الشركات الزميلة والمشاريع المشتركة', titleEn: 'Investments in Associates and Joint Ventures',
    purpose: 'المحاسبة عن الاستثمارات ذات التأثير الهام بطريقة حقوق الملكية.', requirements: ['طريقة حقوق الملكية', 'فحص الانخفاض كاستثمار واحد'],
    disclosures: ['الحصة في النتائج', 'المعلومات المالية الملخصة'], audit: ['الحصول على قوائم الزميلة المراجعة'],
    sme: 'القسم 14', effective: '2013', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-28-investments-in-associates-and-joint-ventures') },
  /* ---------- liabilities, equity, revenue ---------- */
  { code: 'IFRS 15', family: 'IFRS', titleAr: 'الإيراد من العقود مع العملاء', titleEn: 'Revenue from Contracts with Customers',
    purpose: 'نموذج الخطوات الخمس للاعتراف بالإيراد عند (أو كلما) انتقلت السيطرة على السلعة أو الخدمة للعميل.',
    requirements: ['تحديد العقد والتزامات الأداء', 'تحديد سعر المعاملة وتوزيعه', 'الاعتراف عند الوفاء بالتزام الأداء', 'أصول العقود ومطلوبات العقود (الدفعات المقدمة)'],
    disclosures: ['تفصيل الإيراد', 'أرصدة العقود', 'التزامات الأداء المتبقية'],
    audit: ['خطر الغش المفترض في الإيراد (ISA 240)', 'فحص القطع قبل وبعد نهاية السنة', 'مطابقة الإيراد مع إقرارات ضريبة القيمة المضافة', 'فحص عينة فواتير وعقود'],
    sme: 'القسم 23', effective: '2018', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ifrs-15-revenue-from-contracts-with-customers') },
  { code: 'IFRS 9', family: 'IFRS', titleAr: 'الأدوات المالية', titleEn: 'Financial Instruments',
    purpose: 'تصنيف الأصول والالتزامات المالية وقياسها، ونموذج الخسائر الائتمانية المتوقعة، ومحاسبة التحوط.',
    requirements: ['التصنيف: التكلفة المطفأة، القيمة العادلة من خلال الدخل الشامل، أو من خلال الربح والخسارة', 'الخسائر الائتمانية المتوقعة للذمم (النهج المبسط ومصفوفة المخصص)', 'إلغاء الاعتراف'],
    disclosures: ['مخاطر الائتمان والسيولة والسوق (IFRS 7)', 'حركة مخصص الخسائر الائتمانية'],
    audit: ['المصادقات (ISA 505)', 'فحص أعمار الذمم والتحصيل اللاحق', 'تقييم نموذج الخسائر المتوقعة (ISA 540)'],
    sme: 'القسمان 11 و12', effective: '2018', latest: 'تعديلات تصنيف الأدوات المالية وقياسها (سارية 1 يناير 2026)', status: 'effective', org: 'IFRS Foundation', url: IFRS('ifrs-9-financial-instruments') },
  { code: 'IFRS 7', family: 'IFRS', titleAr: 'الأدوات المالية: الإفصاحات', titleEn: 'Financial Instruments: Disclosures',
    purpose: 'الإفصاح عن أهمية الأدوات المالية وطبيعة المخاطر الناشئة عنها وإدارتها.', requirements: ['مخاطر الائتمان والسيولة (تحليل الاستحقاقات) والسوق'],
    disclosures: ['جدول استحقاق الالتزامات المالية', 'تركز مخاطر الائتمان'], audit: ['مطابقة الإفصاح مع العقود والجداول'],
    sme: 'القسمان 11 و12', effective: '2007', latest: 'تعديلات 2026 المرافقة لتعديلات IFRS 9', status: 'effective', org: 'IFRS Foundation', url: IFRS('ifrs-7-financial-instruments-disclosures') },
  { code: 'IAS 32', family: 'IAS', titleAr: 'الأدوات المالية: العرض', titleEn: 'Financial Instruments: Presentation',
    purpose: 'التمييز بين الالتزام وحقوق الملكية وقواعد المقاصة.', requirements: ['لا مقاصة إلا بحق قانوني ونية التسوية بالصافي'],
    disclosures: ['رأس المال والأسهم'], audit: ['مراجعة عقد التأسيس والسجل التجاري'], sme: 'القسم 22', effective: '2005', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-32-financial-instruments-presentation') },
  { code: 'IFRS 16', family: 'IFRS', titleAr: 'عقود الإيجار', titleEn: 'Leases',
    purpose: 'اعتراف المستأجر بأصل حق استخدام والتزام إيجار لجميع العقود تقريباً.',
    requirements: ['قياس الالتزام بالقيمة الحالية للدفعات', 'استهلاك حق الاستخدام وفائدة الالتزام', 'إعفاء العقود قصيرة الأجل ومنخفضة القيمة'],
    disclosures: ['حركة حق الاستخدام والالتزام', 'تحليل استحقاق التزامات الإيجار'],
    audit: ['حصر عقود الإيجار (ومنها المقار والمستودعات)', 'إعادة احتساب القيمة الحالية ومعدل الخصم'],
    sme: 'القسم 20 (الإصدار الثالث يتبنى نموذج IFRS 16 من 2027)', effective: '2019', latest: 'تعديل التزام الإيجار في البيع وإعادة الاستئجار (2024)', status: 'effective', org: 'IFRS Foundation', url: IFRS('ifrs-16-leases') },
  { code: 'IAS 19', family: 'IAS', titleAr: 'منافع الموظفين', titleEn: 'Employee Benefits',
    purpose: 'المحاسبة عن منافع الموظفين ومنها مكافأة نهاية الخدمة كخطة منافع محددة.',
    requirements: ['قياس التزام نهاية الخدمة بطريقة وحدة الائتمان المتوقعة (تقييم اكتواري)', 'الأرباح والخسائر الاكتوارية في الدخل الشامل الآخر'],
    disclosures: ['حركة الالتزام', 'الافتراضات الاكتوارية والحساسية'],
    audit: ['مطابقة بيانات الموظفين مع الرواتب', 'تقييم عمل الخبير الاكتواري (ISA 620)'],
    sme: 'القسم 28 (يسمح بتبسيط عند الجهد أو التكلفة غير المبررة)', effective: '2013 (معدل)', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-19-employee-benefits') },
  { code: 'IAS 37', family: 'IAS', titleAr: 'المخصصات والالتزامات والأصول المحتملة', titleEn: 'Provisions, Contingent Liabilities and Contingent Assets',
    purpose: 'الاعتراف بالمخصص عند وجود التزام حالي محتمل التدفق وقابل للتقدير الموثوق.',
    requirements: ['التزام قانوني أو ضمني ناشئ عن حدث سابق', 'أفضل تقدير في تاريخ التقرير', 'الإفصاح عن الالتزامات المحتملة دون اعتراف'],
    disclosures: ['حركة كل فئة مخصصات', 'طبيعة الالتزامات المحتملة'],
    audit: ['خطابات المحامين', 'فحص الاستخدام اللاحق للمخصص', 'تقييم التحيز في التقديرات (ISA 540)'],
    sme: 'القسم 21', effective: '1999', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-37-provisions-contingent-liabilities-and-contingent-assets') },
  { code: 'IAS 12', family: 'IAS', titleAr: 'ضرائب الدخل', titleEn: 'Income Taxes',
    purpose: 'الضريبة الحالية والمؤجلة على الأرباح (للحصص الأجنبية الخاضعة لضريبة الدخل).', requirements: ['الضريبة المؤجلة على الفروق المؤقتة'],
    disclosures: ['مطابقة المصروف مع الربح المحاسبي'], audit: ['مطابقة الإقرار والربط'], sme: 'القسم 29', effective: '1998', latest: 'تعديل الركيزة الثانية (2023)', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-12-income-taxes') },
  { code: 'IAS 21', family: 'IAS', titleAr: 'آثار التغيرات في أسعار صرف العملات الأجنبية', titleEn: 'The Effects of Changes in Foreign Exchange Rates',
    purpose: 'ترجمة المعاملات والأرصدة بالعملات الأجنبية.', requirements: ['البنود النقدية بسعر الإقفال', 'فروق الصرف في الربح أو الخسارة'],
    disclosures: ['فروق الصرف المعترف بها'], audit: ['إعادة احتساب الترجمة بأسعار الإقفال'], sme: 'القسم 30', effective: '2005', latest: 'تعديل انعدام قابلية التبادل (ساري 2025)', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-21-the-effects-of-changes-in-foreign-exchange-rates') },
  { code: 'IAS 23', family: 'IAS', titleAr: 'تكاليف الاقتراض', titleEn: 'Borrowing Costs',
    purpose: 'رسملة تكاليف الاقتراض المنسوبة مباشرة إلى أصل مؤهل.', requirements: ['الرسملة إلزامية للأصل المؤهل', 'بقية تكاليف الاقتراض مصروف'],
    disclosures: ['المبلغ المرسمل ومعدل الرسملة'], audit: ['مطابقة تكلفة التمويل مع عقود القروض'], sme: 'القسم 25 (مصروف دائماً)', effective: '2009', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-23-borrowing-costs') },
  { code: 'IAS 24', family: 'IAS', titleAr: 'الإفصاح عن الأطراف ذات العلاقة', titleEn: 'Related Party Disclosures',
    purpose: 'الإفصاح عن العلاقات والمعاملات والأرصدة مع الأطراف ذات العلاقة وتعويضات الإدارة العليا.', requirements: ['تحديد الأطراف ذات العلاقة', 'الإفصاح عن المعاملات والأرصدة وشروطها'],
    disclosures: ['طبيعة العلاقة والمعاملات والأرصدة', 'تعويضات كبار التنفيذيين'], audit: ['قائمة الأطراف من الإدارة (ISA 550)', 'فحص المعاملات غير الاعتيادية'],
    sme: 'القسم 33', effective: '2011 (معدل)', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ias-24-related-party-disclosures') },
  { code: 'IFRS 13', family: 'IFRS', titleAr: 'قياس القيمة العادلة', titleEn: 'Fair Value Measurement',
    purpose: 'إطار واحد لقياس القيمة العادلة وتسلسلها الهرمي.', requirements: ['المستويات 1–3', 'أعلى وأفضل استخدام للأصول غير المالية'],
    disclosures: ['المستوى الهرمي وأساليب التقييم'], audit: ['تقييم المدخلات غير القابلة للملاحظة'], sme: 'القسم 2 (مفاهيم القيمة العادلة)', effective: '2013', latest: 'دون تعديلات جوهرية حديثة', status: 'effective', org: 'IFRS Foundation', url: IFRS('ifrs-13-fair-value-measurement') },
  { code: 'IFRS 19', family: 'IFRS', titleAr: 'الشركات التابعة غير الخاضعة للمساءلة العامة: الإفصاحات', titleEn: 'Subsidiaries without Public Accountability: Disclosures',
    purpose: 'إفصاحات مخفضة للتابعة غير الخاضعة للمساءلة العامة التي تطبق IFRS الكاملة وأمها تعد قوائم موحدة متاحة.', requirements: ['اختياري بشروط الأهلية'],
    disclosures: ['إفصاحات مخفضة بدلاً من متطلبات المعايير الأخرى'], audit: ['التحقق من شروط الأهلية'], effective: '1 يناير 2027', latest: 'تعديلات أغسطس 2025 لاستكمال المعايير اللاحقة', status: 'upcoming', org: 'IFRS Foundation', url: IFRS('ifrs-19-subsidiaries-without-public-accountability-disclosures') },
  { code: 'IFRS for SMEs', family: 'IFRS', titleAr: 'المعيار الدولي للتقرير المالي للمنشآت الصغيرة ومتوسطة الحجم', titleEn: 'IFRS for SMEs Accounting Standard',
    purpose: 'إطار مبسط للمنشآت غير الخاضعة للمساءلة العامة، معتمد في المملكة لجميع هذه المنشآت بصرف النظر عن حجمها أو شكلها القانوني.',
    requirements: ['لا يجوز للمنشأة الخاضعة للمساءلة العامة وصف قوائمها بالامتثال له', 'لا يجوز المزج بينه وبين IFRS الكاملة', 'يجوز للمنشأة غير الخاضعة للمساءلة اختيار IFRS الكاملة ثم لا تعود إلا بتغير جوهري في وضعها', 'إعفاء «الجهد أو التكلفة غير المبررين» مع الإفصاح عن سببه'],
    disclosures: ['بيان صريح وغير متحفظ بالامتثال', 'أسباب استخدام إعفاء الجهد أو التكلفة غير المبررين'],
    audit: ['التحقق من أهلية المنشأة للإطار (القسم 1)', 'فحص الإفصاحات المطلوبة (القسم 8)'],
    effective: 'الإصدار الثالث: 1 يناير 2027 (إصدار 2015 حتى ذلك الحين)', latest: 'الإصدار الثالث فبراير 2025', status: 'effective', org: 'IFRS Foundation', url: 'https://www.ifrs.org/issued-standards/ifrs-for-smes/' },
  /* ---------- Saudi requirements ---------- */
  { code: 'لائحة الزكاة', family: 'SAUDI', titleAr: 'اللائحة التنفيذية لجباية الزكاة (1445هـ)', titleEn: 'Implementing Regulations for Zakat Collection 1445H',
    purpose: 'تحديد الوعاء الزكوي وحده الأدنى والأعلى وسعر 2.5% وإجراءات الإقرار والربط.',
    requirements: ['الوعاء: مصادر التمويل المضافة مطروحاً منها الحسميات (الأصول غير المتداولة وغيرها) مع حدين أدنى وأعلى', 'السعر 2.5% (على أساس السنة الهجرية ويعدل للسنة الميلادية)', 'تقديم الإقرار خلال 120 يوماً من نهاية السنة'],
    disclosures: ['حركة مخصص الزكاة', 'موقف الربوط الزكوية'], audit: ['مطابقة المخصص مع الإقرار', 'فحص الربوط والاعتراضات'],
    effective: 'السنوات المالية التي تبدأ في 1 يناير 2024 أو بعده', latest: 'القرار الوزاري 1007 بتاريخ 29-02-2024 (128 مادة)', status: 'effective', org: 'ZATCA', url: 'https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/ZakatRegulations.aspx' },
  { code: 'ZATCA VAT', family: 'SAUDI', titleAr: 'نظام ضريبة القيمة المضافة والفوترة الإلكترونية', titleEn: 'VAT Law and E-invoicing (FATOORA)',
    purpose: 'ضريبة 15% على التوريدات الخاضعة، واسترداد ضريبة المدخلات، والفوترة الإلكترونية ورمز QR.',
    requirements: ['الرقم الضريبي 15 خانة يبدأ وينتهي بالرقم 3', 'الفاتورة المبسطة تحمل رمز QR (اسم البائع، الرقم الضريبي، الوقت، الإجمالي، الضريبة)', 'الإقرار الشهري أو الربعي'],
    disclosures: ['رصيد الضريبة المستحقة أو المستردة'], audit: ['مطابقة الإيراد مع الإقرارات', 'فحص عينة فواتير ورموز QR'],
    effective: '2018 (النسبة 15% منذ يوليو 2020)', latest: 'الموجات المتتابعة للمرحلة الثانية (الربط والتكامل)', status: 'effective', org: 'ZATCA', url: 'https://zatca.gov.sa' },
  { code: 'نظام الشركات', family: 'SAUDI', titleAr: 'نظام الشركات (1443هـ)', titleEn: 'Companies Law',
    purpose: 'أحكام رأس المال والاحتياطيات والقوائم المالية والمراجع والجمعيات.',
    requirements: ['الاحتياطي النظامي لم يعد إلزامياً بالنظام الجديد ما لم ينص عليه عقد التأسيس أو النظام الأساس', 'إعداد القوائم وفق المعايير المعتمدة من SOCPA', 'إيداع القوائم المراجعة'],
    disclosures: ['رأس المال وعدد الحصص أو الأسهم'], audit: ['مراجعة السجل التجاري وعقد التأسيس وقرارات الشركاء'],
    effective: '19 يناير 2023', latest: 'اللوائح التنفيذية لوزارة التجارة وهيئة السوق المالية', status: 'effective', org: 'وزارة التجارة', url: 'https://mc.gov.sa' },
  /* ---------- auditing ---------- */
  ...([
    ['ISA 240', 'مسؤوليات المراجع المتعلقة بالغش', 'The Auditor’s Responsibilities Relating to Fraud', 'عدسة الغش في تقييم المخاطر: خطر مفترض في الإيراد وتجاوز الإدارة للضوابط وفحص قيود اليومية.', 'المعدل ساري للفترات التي تبدأ في 15 ديسمبر 2026 أو بعده', 'upcoming'],
    ['ISA 315', 'تحديد مخاطر التحريف الجوهري وتقييمها', 'Identifying and Assessing the Risks of Material Misstatement', 'فهم المنشأة وبيئتها ورقابتها وتقييم المخاطر على مستوى القوائم والإقرارات.', 'المعدل 2019', 'effective'],
    ['ISA 320', 'الأهمية النسبية في التخطيط والتنفيذ', 'Materiality in Planning and Performing an Audit', 'تحديد الأهمية النسبية العامة والتنفيذية وحد الأخطاء التافهة.', 'ساري', 'effective'],
    ['ISA 330', 'استجابات المراجع للمخاطر المقيمة', 'The Auditor’s Responses to Assessed Risks', 'تصميم إجراءات أساسية واختبارات رقابة تستجيب لكل خطر مقيم.', 'ساري', 'effective'],
    ['ISA 450', 'تقييم التحريفات المكتشفة', 'Evaluation of Misstatements Identified during the Audit', 'تجميع التحريفات غير المصححة ومقارنتها بالأهمية النسبية.', 'ساري', 'effective'],
    ['ISA 500', 'أدلة المراجعة', 'Audit Evidence', 'كفاية الأدلة وملاءمتها وموثوقيتها.', 'ساري (مشروع تحديث قائم)', 'effective'],
    ['ISA 501', 'أدلة المراجعة لبنود مختارة', 'Audit Evidence—Specific Considerations', 'حضور الجرد والتقاضي والمعلومات القطاعية.', 'ساري', 'effective'],
    ['ISA 505', 'المصادقات الخارجية', 'External Confirmations', 'مصادقات البنوك والعملاء والموردين.', 'ساري', 'effective'],
    ['ISA 510', 'الأرصدة الافتتاحية', 'Opening Balances', 'التحقق من أرصدة الافتتاح في الارتباط الأول.', 'ساري', 'effective'],
    ['ISA 520', 'الإجراءات التحليلية', 'Analytical Procedures', 'التوقع المستقل ومقارنة الفروق بحد مقبول.', 'ساري', 'effective'],
    ['ISA 530', 'العينات في المراجعة', 'Audit Sampling', 'تصميم العينة وتقييم نتائجها.', 'ساري', 'effective'],
    ['ISA 540', 'مراجعة التقديرات المحاسبية', 'Auditing Accounting Estimates', 'تقييم الطرق والافتراضات والبيانات والتحيز في التقديرات.', 'المعدل 2018', 'effective'],
    ['ISA 550', 'الأطراف ذات العلاقة', 'Related Parties', 'تحديد الأطراف والمعاملات وتقييم مخاطرها.', 'ساري', 'effective'],
    ['ISA 560', 'الأحداث اللاحقة', 'Subsequent Events', 'فحص الأحداث حتى تاريخ تقرير المراجع.', 'ساري', 'effective'],
    ['ISA 570', 'الاستمرارية', 'Going Concern', 'تقييم تقدير الإدارة للاستمرارية لمدة 12 شهراً على الأقل من تاريخ الاعتماد.', 'المعدل 2024 ساري للفترات التي تبدأ في 15 ديسمبر 2026 أو بعده', 'upcoming'],
    ['ISA 620', 'استخدام عمل خبير المراجع', 'Using the Work of an Auditor’s Expert', 'تقييم كفاءة الخبير وموضوعيته وعمله.', 'ساري', 'effective'],
    ['ISA 700', 'تكوين الرأي والتقرير', 'Forming an Opinion and Reporting', 'شكل تقرير المراجع ومكوناته.', 'ساري', 'effective'],
    ['ISA 701', 'الأمور الرئيسية للمراجعة', 'Communicating Key Audit Matters', 'الإبلاغ عن الأمور الأكثر أهمية وكيف عولجت.', 'ساري', 'effective'],
    ['ISA 705', 'التعديلات على الرأي', 'Modifications to the Opinion', 'الرأي المتحفظ والعكسي والامتناع حسب الجوهرية والانتشار.', 'ساري', 'effective'],
  ] as const).map(([code, ar, en, purpose, latest, status]): StandardDoc => ({ code, family: 'ISA', titleAr: ar, titleEn: en, purpose,
    requirements: [], disclosures: [], audit: [], effective: 'الإصدار المعتمد في المملكة', latest, status: status as StdStatus, org: 'IAASB',
    url: code === 'ISA 240' ? 'https://www.iaasb.org/publications/isa-240-revised-auditor-s-responsibilities-relating-fraud-audit-financial-statements'
      : code === 'ISA 570' ? 'https://www.iaasb.org/publications/isa-570-revised-2024-going-concern'
      : code === 'ISA 701' ? 'https://www.iaasb.org/publications/international-standard-auditing-isa-701-new-communicating-key-audit-matters-independent-auditor-s-3' : IAASB })),
];

/* ---------- Egyptian Accounting Standards (EAS), for companies audited in Egypt ----------
   Numbers and titles as issued by the Minister of Investment's decrees (FRA); each maps to its IFRS
   counterpart, whose requirements and audit focus the codex reuses. Numbers 3, 6, 9, 16, 19, 27, 33
   were never issued; 8 and 11 were replaced by 48, 20 by 49, 37 by 50. */
const FRA = 'https://fra.gov.eg/%D9%85%D8%B9%D8%A7%D9%8A%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D8%B3%D8%A8%D8%A9%D9%88%D9%85%D8%B1%D8%A7%D9%82%D8%A8%D9%8A-%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D8%A8%D8%A7%D8%AA/';
export const EAS_TABLE: [number, string, string, string?][] = [
  [1, 'عرض القوائم المالية', 'IAS 1'], [2, 'المخزون', 'IAS 2'], [4, 'قائمة التدفقات النقدية', 'IAS 7'],
  [5, 'السياسات المحاسبية والتغيرات في التقديرات المحاسبية والأخطاء', 'IAS 8'], [7, 'الأحداث التي تقع بعد الفترة المالية', 'IAS 10'],
  [8, 'عقود الإنشاء', 'IAS 11', 'EAS 48'], [10, 'الأصول الثابتة وإهلاكاتها', 'IAS 16'], [11, 'الإيراد', 'IAS 18', 'EAS 48'],
  [12, 'المنح الحكومية والإفصاح عن المساعدات الحكومية', 'IAS 20'], [13, 'آثار التغيرات في أسعار صرف العملات الأجنبية', 'IAS 21'],
  [14, 'تكلفة الاقتراض', 'IAS 23'], [15, 'الإفصاح عن الأطراف ذوي العلاقة', 'IAS 24'], [17, 'القوائم المالية المستقلة', 'IAS 27'],
  [18, 'الاستثمارات في الشركات الشقيقة', 'IAS 28'], [20, 'القواعد والمعايير المحاسبية المتعلقة بعمليات التأجير التمويلي', '', 'EAS 49'],
  [21, 'المحاسبة والتقرير عن نظم مزايا التقاعد', 'IAS 26'], [22, 'نصيب السهم في الأرباح', 'IAS 33'], [23, 'الأصول غير الملموسة', 'IAS 38'],
  [24, 'ضرائب الدخل', 'IAS 12'], [25, 'الأدوات المالية: العرض', 'IAS 32'], [26, 'الأدوات المالية: الاعتراف والقياس (نطاق التحوط المتبقي)', 'IAS 39'],
  [28, 'المخصصات والالتزامات المحتملة والأصول المحتملة', 'IAS 37'], [29, 'تجميع الأعمال', 'IFRS 3'], [30, 'القوائم المالية الدورية', 'IAS 34'],
  [31, 'اضمحلال قيمة الأصول', 'IAS 36'], [32, 'الأصول غير المتداولة المحتفظ بها لغرض البيع والعمليات غير المستمرة', 'IFRS 5'],
  [34, 'الاستثمار العقاري', 'IAS 40'], [35, 'الزراعة', 'IAS 41'], [36, 'التنقيب عن وتقييم الموارد التعدينية', 'IFRS 6'],
  [37, 'عقود التأمين (الإصدار السابق)', 'IFRS 4', 'EAS 50'], [38, 'مزايا العاملين', 'IAS 19'], [39, 'المدفوعات المبنية على أسهم', 'IFRS 2'],
  [40, 'الأدوات المالية: الإفصاحات', 'IFRS 7'], [41, 'القطاعات التشغيلية', 'IFRS 8'], [42, 'القوائم المالية المجمعة', 'IFRS 10'],
  [43, 'الترتيبات المشتركة', 'IFRS 11'], [44, 'الإفصاح عن الحصص في المنشآت الأخرى', 'IFRS 12'], [45, 'قياس القيمة العادلة', 'IFRS 13'],
  [46, 'الأحكام الانتقالية لتطبيق معايير المحاسبة المصرية', ''], [47, 'الأدوات المالية', 'IFRS 9'], [48, 'الإيراد من العقود مع العملاء', 'IFRS 15'],
  [49, 'عقود التأجير', 'IFRS 16'], [50, 'عقود التأمين', 'IFRS 17'], [51, 'القوائم المالية في اقتصاديات التضخم المفرط', 'IAS 29'],
];
export const IFRS_TO_EAS: Record<string, string> = Object.fromEntries(EAS_TABLE.filter(([, , i, r]) => i && !r).map(([n, , i]) => [i as string, 'EAS ' + n]));
const IFRS_BY = Object.fromEntries(STANDARDS.map((s) => [s.code, s]));
STANDARDS.push(...EAS_TABLE.map(([n, title, ifrs, by]): StandardDoc => {
  const twin = ifrs ? IFRS_BY[ifrs] : undefined;
  return { code: 'EAS ' + n, family: 'EAS', titleAr: 'معيار المحاسبة المصري رقم (' + n + ') — ' + title, titleEn: ifrs ? 'Egyptian Accounting Standard ' + n + ' (≈ ' + ifrs + ')' : 'Egyptian Accounting Standard ' + n,
    purpose: twin ? twin.purpose + (by ? '' : ' (مقابل ' + ifrs + '، مع اختلافات محدودة في بعض المعالجات والإفصاحات)') : title + '.',
    requirements: twin?.requirements ?? [], disclosures: twin?.disclosures ?? [], audit: twin?.audit ?? [],
    effective: 'حسب قرارات وزير الاستثمار وتعديلاتها', latest: by ? 'حل محله ' + by : 'راجع آخر قرارات الهيئة العامة للرقابة المالية', status: by ? 'replaced' : 'effective', replacedBy: by,
    org: 'FRA مصر', url: FRA, ifrs: ifrs || undefined };
}));
STANDARDS.push(
  { code: 'ضريبة الدخل (مصر)', family: 'EGYPT', titleAr: 'قانون الضريبة على الدخل رقم 91 لسنة 2005 وتعديلاته', titleEn: 'Egyptian Income Tax Law 91/2005',
    purpose: 'ضريبة على صافي الربح الضريبي للأشخاص الاعتبارية بسعر 22.5% (مع أسعار خاصة لبعض الأنشطة)، والضريبة المؤجلة وفق معيار المحاسبة المصري 24.',
    requirements: ['الإقرار الضريبي السنوي', 'تسوية الربح المحاسبي بالربح الضريبي', 'الخصم والإضافة تحت حساب الضريبة'], disclosures: ['مطابقة مصروف الضريبة مع الربح المحاسبي', 'الضريبة المؤجلة'],
    audit: ['مطابقة المخصص مع الإقرار', 'فحص الفحوص الضريبية والنزاعات'], effective: 'ساري', latest: 'تعديلات متتالية؛ راجع مصلحة الضرائب المصرية', status: 'effective', org: 'مصلحة الضرائب المصرية', url: 'https://www.eta.gov.eg' },
  { code: 'ضريبة القيمة المضافة (مصر)', family: 'EGYPT', titleAr: 'قانون الضريبة على القيمة المضافة رقم 67 لسنة 2016', titleEn: 'Egyptian VAT Law 67/2016',
    purpose: 'ضريبة 14% على السلع والخدمات بوجه عام، مع الفاتورة والإيصال الإلكتروني والتسجيل برقم ضريبي من 9 أرقام.',
    requirements: ['الإقرار الشهري', 'الفاتورة الإلكترونية', 'خصم ضريبة المدخلات بشروطها'], disclosures: ['الرصيد المستحق أو المستحق رده'], audit: ['مطابقة الإيراد مع الإقرارات والفواتير الإلكترونية'],
    effective: 'سبتمبر 2016', latest: 'منظومة الفاتورة والإيصال الإلكتروني', status: 'effective', org: 'مصلحة الضرائب المصرية', url: 'https://www.eta.gov.eg' },
  { code: 'قانون الشركات (مصر)', family: 'EGYPT', titleAr: 'قانون الشركات رقم 159 لسنة 1981 ولائحته التنفيذية', titleEn: 'Egyptian Companies Law 159/1981',
    purpose: 'أحكام رأس المال والاحتياطي القانوني (5% من الأرباح حتى نصف رأس المال) والقوائم المالية والجمعيات.',
    requirements: ['تجنيب الاحتياطي القانوني', 'اعتماد القوائم من الجمعية العامة'], disclosures: ['رأس المال والاحتياطيات'], audit: ['مراجعة السجل التجاري والنظام الأساسي ومحاضر الجمعية'],
    effective: 'ساري', latest: 'تعديلات متتالية', status: 'effective', org: 'FRA مصر', url: 'https://fra.gov.eg' },
);

export const STANDARD: Record<string, StandardDoc> = Object.fromEntries(STANDARDS.map((s) => [s.code, s]));

/** Normalize "ias16", "IAS-16", "معيار المحاسبة الدولي 16" → "IAS 16" when it is in the codex. */
export function normalizeCode(input: string): string | null {
  const t = String(input || '').trim();
  if (STANDARD[t]) return t;
  const e = t.replace(/[–—-]/g, ' ').match(/\bEAS\s*(\d{1,2})\b/i) ?? t.match(/معيار المحاسبة المصري\s*(?:رقم\s*)?\(?(\d{1,2})/);
  if (e) { const c = 'EAS ' + Number(e[1]); return STANDARD[c] ? c : null; }
  const m = t.replace(/[–—-]/g, ' ').match(/\b(IFRS|IAS|ISA)\s*(\d{1,3})\b/i);
  if (m) { const c = m[1].toUpperCase() + ' ' + Number(m[2]); return STANDARD[c] ? c : null; }
  const a = t.match(/(?:المعيار الدولي للتقرير المالي|معيار المحاسبة الدولي|معيار المراجعة الدولي)\s*(?:رقم\s*)?\(?(\d{1,3})/);
  if (a) { const fam = t.includes('للتقرير') ? 'IFRS' : t.includes('المراجعة') ? 'ISA' : 'IAS'; const c = fam + ' ' + Number(a[1]); return STANDARD[c] ? c : null; }
  if (/ضريبه الدخل \(مصر\)|ضريبة الدخل \(مصر\)/.test(t)) return 'ضريبة الدخل (مصر)';
  if (/زكا/.test(t)) return 'لائحة الزكاة';
  if (/قيمه المضافه|القيمة المضافة|vat/i.test(t)) return 'ZATCA VAT';
  return null;
}

/* How a standard bears on an account of a given statement line — the text shown when the user
   taps the standard badge beside the account. Specific pairs first, then the standard's purpose. */
const RELATION: Record<string, Record<string, string>> = {
  cash: { 'IAS 7': 'الحساب جزء من «النقد وما في حكمه» الذي تُطابق عليه قائمة التدفقات النقدية؛ الودائع الأطول من ثلاثة أشهر لا تدخل فيه.', 'ISA 505': 'رصيد بنكي يؤكَّد بمصادقة مباشرة من البنك وتسوية بنكية في تاريخ الإقفال.' },
  receivables: { 'IFRS 9': 'ذمم تقاس بالتكلفة المطفأة ويُكوَّن لها مخصص خسائر ائتمانية متوقعة (النهج المبسط) من أعمار الديون والخبرة التاريخية.', 'IFRS 15': 'الذمة تنشأ عند اكتساب الحق غير المشروط في المقابل؛ ما يسبق ذلك أصل عقد.', 'ISA 505': 'تُؤكد عينة الأرصدة بمصادقات العملاء أو بالتحصيل اللاحق.' },
  inventory: { 'IAS 2': 'يقاس المخزون بالتكلفة أو صافي القيمة القابلة للتحقق أيهما أقل، وتحدد التكلفة بالوارد أولاً أو المتوسط المرجح.', 'ISA 501': 'وجود المخزون يؤكد بحضور الجرد الفعلي أو إجراءات بديلة.' },
  ppe: { 'IAS 16': 'الحساب أصل ثابت يقاس بالتكلفة ناقصاً الاستهلاك المتراكم؛ يُراجع العمر الإنتاجي والقيمة المتبقية سنوياً، ويُفصل الرأسمالي عن الإيرادي.', 'IAS 36': 'تُقيَّم مؤشرات الانخفاض في القيمة في تاريخ التقرير (تقادم، تعطل، انخفاض الاستخدام).' },
  rou: { 'IFRS 16': 'أصل حق استخدام مقابل التزام إيجار؛ يستهلك على مدة العقد أو العمر أيهما أقصر.' },
  intangibles: { 'IAS 38': 'يرسمل فقط ما يستوفي القابلية للتحديد والسيطرة والمنافع المستقبلية، ويطفأ على العمر المحدد.' },
  investments: { 'IFRS 9': 'يصنف الاستثمار حسب نموذج الأعمال وخصائص التدفقات (تكلفة مطفأة أو قيمة عادلة).', 'IAS 28': 'إن وُجد تأثير هام (20% فأكثر عادة) تطبق طريقة حقوق الملكية.' },
  vatAsset: { 'ضريبة القيمة المضافة (مصر)': 'ضريبة مدخلات قابلة للخصم (14%) تطابق مع الإقرارات الشهرية والفواتير الإلكترونية.', 'ZATCA VAT': 'ضريبة مدخلات قابلة للاسترداد تُطابق مع الإقرارات وفواتير الموردين المستوفية للشروط.' },
  vatLiability: { 'ضريبة القيمة المضافة (مصر)': 'ضريبة مخرجات مستحقة (14%) تطابق مع المبيعات الخاضعة والإقرارات الشهرية.', 'ZATCA VAT': 'ضريبة مخرجات مستحقة تُطابق مع الإيراد الخاضع والإقرارات المقدمة.' },
  prepayments: { 'IAS 1': 'تعرض ضمن الموجودات المتداولة إذا كانت ستُستنفد خلال 12 شهراً.' },
  capital: { 'IAS 32': 'حقوق ملكية بموجب عقد التأسيس والسجل التجاري؛ أي زيادة تتطلب قراراً نظامياً.', 'نظام الشركات': 'يطابق رأس المال المسجل مع السجل التجاري وعقد التأسيس.' },
  reserves: { 'قانون الشركات (مصر)': 'الاحتياطي القانوني يُجنب بنسبة 5% من صافي الربح حتى يبلغ نصف رأس المال (قانون 159 لسنة 1981).', 'نظام الشركات': 'الاحتياطي النظامي لم يعد إلزامياً بالنظام الجديد إلا إذا نص عليه عقد التأسيس؛ يُتحقق من سند كل تحويل.' },
  partners: { 'IAS 24': 'حساب جاري الشريك معاملة مع طرف ذي علاقة يُفصح عنها بطبيعتها وشروطها.' },
  retained: { 'IAS 8': 'رصيد الافتتاح يجب أن يساوي إقفال السنة السابقة؛ أي فرق يشير إلى تسوية بأثر رجعي تتطلب إفصاحاً.' },
  eosb: { 'IAS 19': 'مكافأة نهاية الخدمة خطة منافع محددة تقاس بالتقييم الاكتواري (أو بتبسيط مسموح في معيار المنشآت الصغيرة عند الجهد غير المبرر).' },
  leaseNcl: { 'IFRS 16': 'التزام بالقيمة الحالية لدفعات الإيجار المتبقية؛ يُفصل الجزء المتداول.' },
  loansNcl: { 'IFRS 9': 'قرض يقاس بالتكلفة المطفأة بمعدل الفائدة الفعلي؛ يُفصل الجزء المستحق خلال سنة.', 'IFRS 7': 'يُفصح عن الاستحقاقات والضمانات والتعهدات.' },
  loansCl: { 'IFRS 9': 'التزام مالي بالتكلفة المطفأة؛ يُطابق مع كشوف البنك وعقد التمويل.', 'IFRS 7': 'يدخل في تحليل مخاطر السيولة.' },
  zakatPayable: { 'ضريبة الدخل (مصر)': 'ضريبة الدخل المستحقة عن السنة بعد خصم الدفعات المقدمة والخصم تحت حساب الضريبة؛ تطابق مع الإقرار والفحوص الضريبية.', 'لائحة الزكاة': 'مخصص الزكاة يُحسب على الوعاء الزكوي بسعر 2.5% ويطابق مع الإقرار والربوط.', 'IAS 37': 'التزام حالي ناشئ عن السنة يُقاس بأفضل تقدير.' },
  contractLiab: { 'IFRS 15': 'مقابل مستلم قبل الوفاء بالتزام الأداء؛ يُعترف به إيراداً عند نقل السيطرة.' },
  payables: { 'IFRS 9': 'التزام مالي بالتكلفة المطفأة؛ يُطابق مع كشوف الموردين ويُبحث عن الالتزامات غير المسجلة.' },
  accruals: { 'IAS 37': 'التزامات مستحقة عن سلع أو خدمات استلمت ولم تفوتر بعد.' },
  provisions: { 'IAS 37': 'يُعترف بالمخصص فقط لالتزام حالي محتمل التدفق وقابل للتقدير؛ وإلا يُفصح عنه كالتزام محتمل.' },
  revenue: { 'IFRS 15': 'الإيراد يُعترف به عند نقل السيطرة على السلع أو الخدمات بالمبلغ المتوقع استحقاقه.', 'ISA 240': 'يُفترض وجود خطر غش في الاعتراف بالإيراد ما لم يُدحض.', 'IFRS 18': 'يعرض ضمن فئة التشغيل.' },
  cogs: { 'IAS 2': 'تكلفة المخزون المباع تُحمل عند الاعتراف بالإيراد المقابل؛ وتُحمل التخفيضات إلى صافي القيمة القابلة للتحقق.' },
  depreciation: { 'IAS 16': 'مصروف الاستهلاك يجب أن يتسق مع تكلفة الأصول وأعمارها وطريقة الاستهلاك المعتمدة.' },
  impairment: { 'IFRS 9': 'حركة مخصص الخسائر الائتمانية المتوقعة تُعرض في الربح أو الخسارة.', 'IAS 36': 'خسائر الانخفاض في الأصول غير المالية.' },
  financeCost: { 'IFRS 18': 'تعرض ضمن فئة التمويل بعد «الربح قبل التمويل والضرائب».', 'IFRS 9': 'تكلفة الاقتراض بمعدل الفائدة الفعلي.', 'IFRS 16': 'فائدة التزامات الإيجار.' },
  investIncome: { 'IFRS 18': 'عوائد الاستثمارات والودائع تعرض ضمن فئة الاستثمار.' },
  otherIncome: { 'IFRS 18': 'تبقى في فئة التشغيل ما لم تكن من الاستثمار أو التمويل.' },
  zakatExpense: { 'ضريبة الدخل (مصر)': 'مصروف ضريبة الدخل الجارية (22.5% من الربح الضريبي) والمؤجلة؛ يطابق مع الإقرار ومع تسوية الربح المحاسبي بالضريبي.', 'لائحة الزكاة': 'مصروف زكاة السنة يطابق مع مخصص الزكاة والإقرار.', 'IAS 12': 'ينطبق على ضريبة الدخل للحصص غير السعودية/الخليجية.' },
  selling: { 'IFRS 18': 'مصروف تشغيلي؛ عند العرض حسب الوظيفة يُفصح عن التحليل حسب الطبيعة.' },
  admin: { 'IFRS 18': 'مصروف تشغيلي؛ عند العرض حسب الوظيفة يُفصح عن التحليل حسب الطبيعة.' },
};

export function relationOf(code: string, lineKey: string | null): string {
  const s = STANDARD[code];
  const twin = s?.ifrs && !s.replacedBy ? s.ifrs : null;
  const specific = lineKey ? RELATION[lineKey]?.[code] ?? (twin ? RELATION[lineKey]?.[twin] : undefined) : undefined;
  return specific ?? (s ? s.purpose : '');
}

/* ---------- which framework applies (SOCPA guidance on IFRS for SMEs, section 1) ---------- */
export type FrameworkInput = {
  listedOrIssuing?: boolean;            /* debt or equity traded, or in the process of issuing, in a public market */
  fiduciaryForBroadGroup?: boolean;     /* bank, insurer, investment fund, securities broker … as a primary business */
  incidentalDepositsOnly?: boolean;     /* e.g. schools or travel agents collecting advances — not public accountability */
  electedFullIfrs?: boolean;            /* a non-publicly-accountable entity that chose full IFRS */
};
export function frameworkApplicability(i: FrameworkInput) {
  const publicAcc = !!i.listedOrIssuing || (!!i.fiduciaryForBroadGroup && !i.incidentalDepositsOnly);
  if (publicAcc) return { framework: 'IFRS' as const, label: 'المعايير الدولية للتقرير المالي المعتمدة في المملكة (الكاملة)', mandatory: true,
    reason: i.listedOrIssuing ? 'أدوات المنشأة متداولة أو في طور الإدراج، فهي خاضعة للمساءلة العامة.' : 'تحتفظ بأصول بصفة ائتمانية لمجموعة عريضة من الغير كنشاط رئيس (بنك، تأمين، صندوق استثمار)، فهي خاضعة للمساءلة العامة.',
    cite: ['IFRS for SMEs 1.3', 'إرشادات SOCPA — القسم 1'] };
  if (i.electedFullIfrs) return { framework: 'IFRS' as const, label: 'المعايير الدولية الكاملة (اختيار المنشأة)', mandatory: false,
    reason: 'غير خاضعة للمساءلة العامة واختارت المعايير الكاملة؛ عليها تطبيقها كلها وعدم العودة لمعيار المنشآت الصغيرة إلا بتغير جوهري في وضعها.',
    cite: ['قرار لجنة معايير المحاسبة في SOCPA', 'إرشادات SOCPA — القسم 1 (2/1)'] };
  return { framework: 'SME' as const, label: 'المعيار الدولي للتقرير المالي للمنشآت الصغيرة ومتوسطة الحجم المعتمد في المملكة', mandatory: false,
    reason: 'غير خاضعة للمساءلة العامة' + (i.incidentalDepositsOnly ? '؛ الاحتفاظ بأموال العملاء عرضي وليس نشاطاً رئيساً' : '') + '، والمعيار معتمد لجميع هذه المنشآت بصرف النظر عن حجمها أو شكلها القانوني.',
    cite: ['IFRS for SMEs 1.2–1.4', 'إرشادات SOCPA — القسم 1'] };
}

/** A code in the terms of the framework: IFRS/IAS → EAS and Saudi requirements → Egyptian ones under EAS. */
const EGYPT_OF: Record<string, string> = { 'لائحة الزكاة': 'ضريبة الدخل (مصر)', 'ZATCA VAT': 'ضريبة القيمة المضافة (مصر)', 'نظام الشركات': 'قانون الشركات (مصر)', 'IFRS 18': 'EAS 1' };
export function inFramework(code: string, framework: Framework = 'IFRS'): string {
  if (framework !== 'EAS') return code;
  return EGYPT_OF[code] ?? IFRS_TO_EAS[code] ?? code;
}

/** Standards cited for an account, with the relation text and the SME section when that framework applies. */
export function standardsFor(codes: string[], lineKey: string | null, framework: Framework = 'IFRS') {
  return codes.map((code) => STANDARD[code] ? code : normalizeCode(code) ?? code).map((c) => inFramework(c, framework)).filter((c, i, a) => a.indexOf(c) === i).map((code) => {
    const s = STANDARD[code];
    return { code, known: !!s, title: s?.titleAr ?? code, relation: relationOf(code, lineKey), sme: framework === 'SME' ? s?.sme ?? null : null,
      status: s?.status ?? null, url: s?.url ?? null, org: s?.org ?? null };
  });
}

export function searchCodex(query: string, list: StandardDoc[] = STANDARDS): StandardDoc[] {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return list;
  const code = normalizeCode(query);
  return list.filter((s) => s.code === code || [s.code, s.titleAr, s.titleEn, s.purpose, ...s.requirements].join(' ').toLowerCase().includes(q));
}

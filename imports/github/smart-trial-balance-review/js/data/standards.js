/* ============================================================
   قاعدة بيانات معايير المحاسبة الدولية (IFRS/IAS كما تعتمدها
   الهيئة السعودية للمراجعين والمحاسبين — SOCPA)
   ملاحظة: "آخر تحديث" يذكر أبرز التعديلات الجوهرية وقد يكون تقريبيًا؛
   راجع دائمًا المصادر الرسمية في الروابط.
   ============================================================ */
(function(){
"use strict";

const STANDARDS = [
  {code:"IAS 1", en:"Presentation of Financial Statements", ar:"عرض القوائم المالية",
   purpose:"الإطار العام لعرض القوائم المالية ومحتوياتها: متطلبات الاكتمال، العرض العادل، الاستمرارية، أساس الاستحقاق، ثبات عرض البنود، والمقارنات. وهو المعيار المرجعي لأي بند لا ينص عليه معيار خاص.",
   relation:"يُطبق على الميزان ككل: من حيث هيكل البنود، ترتيب الأصول والالتزامات (متداول / غير متداول)، واكتمال الإفصاحات المصاحبة.",
   lastUpdate:"تعديلات «تصنيف الالتزامات المتداولة وغير المتداولة» والتعهدات — سارٍ من 1/1/2024 (وأصدر مجلس المعايير IFRS 18 الذي سيحل محله ابتداءً من 1/1/2027)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["عرض","قوائم","ميزان","إفصاح"], kws:[]},

  {code:"IAS 2", en:"Inventories", ar:"المخزون",
   purpose:"قياس المخزون وتكلفته (الأقل بين التكلفة وصافي القيمة القابلة للتحقق)، وقواعد إثبات مصروف استهلاك المخزون في تكلفة المبيعات.",
   relation:"يحكم بنود المخزون (بضاعة موجودة، مواد خام، تحت التشغيل): ربطها بالتكلفة المناسبة وإمكانية بيعها بأكثر من قيمتها الدفترية.",
   lastUpdate:"آخر تغيير جوهري ضمن مشروع تعديل الإفصاح عن الإيرادات والمخزون (2018)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["مخزون","بضاعة","تكلفة مبيعات"], kws:["مخزون","مخازن","بضاعة","مواد خام","تحت التشغيل","بضاعة بالطريق","تغليف"]},

  {code:"IAS 7", en:"Statement of Cash Flows", ar:"قائمة التدفقات النقدية",
   purpose:"عرض حركة النقد وما يعادله خلال الفترة في أنشطة تشغيلية واستثمارية وتمويلية.",
   relation:"يحكم بنود النقدية وما يعادلها وأثر العمليات عليها، ويستخدم للتحقق من منطقية صافي التغير في النقدية مقابل الأرصدة.",
   lastUpdate:"بدون تغييرات جوهرية حديثة على هذا المعيار",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-cash-flows/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["نقدية","تدفقات","بنك"], kws:["نقدية","صندوق","بنك","مصرف","نقد ومعادل"]},

  {code:"IAS 8", en:"Accounting Policies, Changes in Accounting Estimates and Errors", ar:"السياسات المحاسبية والتغيرات في التقديرات المحاسبية والأخطاء",
   purpose:"أساس اختيار السياسات وكيفية معالجة تغيّر التقديرات والأخطاء الجوهرية بشكل بأثر رجعي.",
   relation:"يحكم أي اعتماد على تقديرات محاسبية في الميزان (إهلاك، مخصصات) وتصحيح الأخطاء عند اكتشافها في مرحلة المراجعة.",
   lastUpdate:"تسمية المعيار عُدلت إلى «التقديرات المحاسبية» وتعريفها (تعديلات 2021 — نافذة 1/1/2023)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-8/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["سياسات","أخطاء","تقديرات"], kws:["تصحيح","خطأ","سابق سنوات","تسوية"]},

  {code:"IAS 10", en:"Events after the Reporting Period", ar:"الأحداث اللاحقة لفترة التقرير",
   purpose:"معالجة الأحداث الواقعة بعد تاريخ الميزان: معدِّلة تتطلب إعادة عرض، وغير معدِّلة تتطلب إفصاحًا.",
   relation:"يلزم المجلس بتساؤل الإدارة عن أي أحداث بعد تاريخ الميزان تمس بنود الميزان (كسداد ذمم أو خسائر مخزون لاحقة).",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-10-events-after-the-reporting-period/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["أحداث لاحقة"], kws:["أحداث لاحقة"]},

  {code:"IAS 12", en:"Income Taxes", ar:"ضرائب الدخل",
   purpose:"محاسبة ضرائب الدخل الحالية والمؤجلة بناء على الأصول والالتزامات، والاعتراف بأصول الضريبة المؤجلة عند الاحتمال الراجح.",
   relation:"يحكم بند ضريبة الدخل المستحقة وفروقاتها المؤقتة على أصول مثل الإهلاك والمخصصات، وبند «ضرائب مؤجلة» إن وجد.",
   lastUpdate:"بدون تغييرات جوهرية؛ مع عمليات تطوير مستمرة مرتبطة بمشروع ضرائب الاقتراض العالمي (Pillar Two — إعفاء مؤقت نافذ منذ 2023)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["ضريبة","ضريبة دخل","ضريبة مؤجلة"], kws:["ضريبة","زكاة","ضريبة الدخل","ضرائب مؤجلة","ضريبة مستحقة"]},

  {code:"IAS 16", en:"Property, Plant and Equipment", ar:"الممتلكات والآلات والمعدات",
   purpose:"قياس الأصول الملموسة طويلة الأجل بالتكلفة وتوزيع قابلة للاستهلاك منها على مدى العمر الإنتاجي بالإهلاك المنهجي.",
   relation:"يحكم بنود الآلات والمعدات والمباني والأثاث ومراكب النقل: رسملة التكاليف وطريقة ونسبة الإهلاك ومراجعة انخفاض القيمة.",
   lastUpdate:"تعديل استخدام ما قبل التشغيل (Proceeds before Intended Use — نافذ 1/1/2022)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["أصول ثابتة","إهلاك","ممتلكات"], kws:["أثاث","سيارات","آليات","آلات","مباني","أبنية","تركيبات","عقمات","مواصلات","عتاد","حاسوبا","أجهزة"]},

  {code:"IAS 19", en:"Employee Benefits", ar:"مزايا الموظفين",
   purpose:"محاسبة جميع مزايا الموظفين ومنها مكافأة نهاية الخدمة: قياس الالتزام على أساس الاستحقاق التراكمي وسعر الخصم والفائدة الصافية على الالتزام.",
   relation:"يحكم بنود الرواتب والأجور المستحقة والإجازات المتراكمة ومخصص مكافأة نهاية الخدمة في المنشآت ذات النظم الداخلية المكفولة.",
   lastUpdate:"تعديل الإعفاء من متطلب تحديد نهاية خدمة الموظفين في حالة وجود نظام داخلي غير رسمي (نافذ 1/1/2024)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-19-employee-benefits/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["رواتب","موظفين","نهاية خدمة"], kws:["رواتب","أجور","مكافأة نهاية","نهاية خدمة","موظفي","عاملين","إجازات مستحقة","تأمينات اجتماعية"]},

  {code:"IAS 21", en:"The Effects of Changes in Foreign Exchange Rates", ar:"أثر تغيرات أسعار الصرف الأجنبي",
   purpose:"قياس العملات الأجنبية في المعاملات والأرصدة، وكيفية إدراج فروقات الصرف في النتائج.",
   relation:"يحكم بنود الذمم أو الحسابات أو القروض بعملات أجنبية: تقييم الأرصدة بأسعار الإغلاق وإثبات فروق الصرف.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-21-the-effects-of-changes-in-foreign-exchange-rates/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["عملة أجنبية","صرف"], kws:["عملة أجنبية","عملات أجنبي","فروع خارجية","فرق عملة","بالتصدير"]},

  {code:"IAS 24", en:"Related Party Disclosures", ar:"الإفصاح عن الأطراف ذات العلاقة",
   purpose:"إلزام القوائم بإفصاح كافٍ عن العلاقات والمعاملات والأرصدة مع الأطراف ذات العلاقة (شركاء، شركات شقيقة، إدارة).",
   relation:"يطلب المجلس تحليل بنود «جاري الشركاء» أو «سلف/تسبيقات» والتأكد من طبيعة العلاقة والشروط التجارية.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-24-related-party-disclosures/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["أطراف علاقة","شركاء","شركات شقيقة"], kws:["شركاء","جاري الشركاء","مسحوبات شخصية","سلف شخصية","الحكومية","الشقيقة"]},

  {code:"IAS 33", en:"Earnings per Share", ar:"ربح السهم الأساسي والمخفف",
   purpose:"حساب رقم ربح السهم للشركات المساهمة العامة وأساسه البند الوارد في قائمة الدخل.",
   relation:"مرتبط بصافي ربح الفترة عند الكشف عنه داخل ميزان أخطاء التصحيح لنتائج النشاط.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-33-earnings-per-share/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["ربح سهم","أسهم"], kws:["ربح السهم","سهم","حقوق أصحاب"]},

  {code:"IAS 36", en:"Impairment of Assets", ar:"انخفاض قيمة الأصول",
   purpose:"التأكد من عدم حمل الأصول في الدفاتر بأكثر من المبلغ المسترد (الأعلى بين القيمة العادلة مطروحًا منها تكاليف البيع وقيمة الاستخدام)، مع عملية اختبار للسمعة التجارية سنويًا.",
   relation:"يجعل بنود الأصول الثابتة والسمعة والأصول غير الملموسة موضوع اختبار انخفاض عند وجود مؤشرات (انخفاض نشاط، تقادم) ويطلب أدلة على ذلك.",
   lastUpdate:"لم يتغير جوهريًا؛ خضع لعديد مقررات تفاعل مع البرامج المتجددة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-36-impairment-of-assets/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["انخفاض قيمة","سمعة"], kws:["سمعة تجاري","استموار","علامة تجاري","اختبار انخفاض","خسائر تدني","مخصص انخفاض"]},

  {code:"IAS 37", en:"Provisions, Contingent Liabilities and Contingent Assets", ar:"مخصصات والالتزامات والأصول المحتملة",
   purpose:"الاعتراف بالمخصص فقط عندما يوجد التزام حالي نابع من حدث سابق، واحتمال نفاد الموارد أكبر من مجرد احتمال، وقابل للموثوقية بالقياس؛ والإفصاح عن الباقي المحتمل دون إثبات.",
   relation:"يحكم بنود «مخصصات» ودعاوى قضائية وضمانات وأغراض هدم وعمليات إيقاف معينة قد تظهر ضمن الميزان.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["مخصصات","قضايا","ضمانات"], kws:["مخصص","مخصصات","دعاوي","قضايا","غرامات","ضمانات مشتركة","التزامات محتملة"]},

  {code:"IAS 38", en:"Intangible Assets", ar:"الأصول غير الملموسة",
   purpose:"الاعتراف بالأصول غير المادية القابلة للتفريق (برمجيات، حق انتفاع، تراخيص) بالتكلفة، ولا يجوز رسملة الأصول المطورة داخليًا إلا بشروط استيفائية محددة.",
   relation:"يشمل بنود برامج الحاسوب وشروط الانتشار والحقوق المدفوعة، ويعتبرها أصولا غير ملموسة مطابقة للأصول الثابتة.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["غير ملموسة","برمجيات","تراخيص"], kws:["برامج","ترخيص","تراخيص","حق انتفاع","علامة تجارية","رخص","أنظمة محاسبية","مواقع إلكترونية"]},

  {code:"IAS 40", en:"Investment Property", ar:"عقارات الاستثمار",
   purpose:"العقارات المحتفظ بها لكسب الإيجارات أو ارتفاع القيمة وليس للاستخدام الإداري؛ تقاس بالتكلفة أو نموذج القيمة العادلة مع الإفصاح.",
   relation:"يتطلب فرز عقارات الاستثمار عن الممتلكات الرأسمالية التشغيلية في الميزان والتنبيه على الاختلاف في طرق المعالجة.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-40-investment-property/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["عقارات استثمار","إيجارات"], kws:["عقارات استثمار","أراضٍ للاستثمار","عقارات إيجارية"]},

  {code:"IFRS 3", en:"Business Combinations", ar:"تراكم الأعمال",
   purpose:"قواعد محاسبة اقتناء الكيانات: منهجية الاستحواذ، تحديد السعر المشترى وتوزيعه على أصول والتزامات العميل بقيمة عادلة والسمعة المتبقية.",
   relation:"يهتم ببنود السمعة التجارية الناشئة عن اقتناء نشاط، ومبررات توزيع الثمن على الأصول المشتراة.",
   lastUpdate:"تعديل «الإشارة إلى افتراضات» ضمن مبادئ مقررة إغلاق الالتزامات المرتبطة بالمشتري (نافذ 1/1/2023)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-3-business-combinations/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["استحواذ","سمعة تجارية"], kws:["استحواذ","اندماج","شراء أعمال","سمعة تجاري"]},

  {code:"IFRS 5", en:"Non-current Assets Held for Sale and Discontinued Operations", ar:"الأصول غير المتداولة المحتفظ بها للبيع والأنشطة المتوقفة",
   purpose:"الأصول المرشحة للبيع الفوري يجب أن تُعرض منفصلة وبتقييم الأقل بين القيمة الدفترية والقيمة العادلة مطروحًا منها تكاليف البيع، وتوقف الإهلاك عليها.",
   relation:"يخص بنود الأصول «المعدة للبيع» أو الأنشطة المتوقفة الظاهرة في الميزان وجوباً تصنيفها وعروضها.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-5-non-current-assets-held-for-sale-and-discontinued-operations/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["معد للبيع","نشاط موقوف"], kws:["محتفظ به للبيع","معدة للبيع","نشاط متوقف","تصفية فرع"]},

  {code:"IFRS 7", en:"Financial Instruments: Disclosures", ar:"الأدوات المالية: الإفصاحات",
   purpose:"يحدد جميع الإفصاحات الهامة المرتبطة بالأدوات المالية: درجات المخاطر الائتمانية والسيولة والسوق، وتصنيف القياس والقيمة العادلة.",
   relation:"مكمل لتطبيق IFRS 9 على كل بنود الذمم والقروض والنقدية، ويسلب عدم كفاية إفصاح حدود الائتمان المستخدمة والأصول المتعثرة.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-7-financial-instruments-disclosures/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["أدوات مالية","إفصاح"], kws:["أدوات مالي","مشتقات","مقايضة"]},

  {code:"IFRS 9", en:"Financial Instruments", ar:"الأدوات المالية",
   purpose:"التصنيف والقياس بناء على نماذج الأعمال والتدفقات التعاقدية، وخفض شامل لخسائر الانحراف الائتمانية المتوقعة (ECL) على الذمم المدينة وأصول الأموال؛ ومحاسبة التحويلة (hedge accounting).",
   relation:"يحكم بنود الذمم المدينة والعملاء وأوراق القبض: تكوين مخصص خسائر ائتمانية متوقعة (حتى لو كانت صغيرة نسبة بساطة عملية)، وقواعد خصم القروض غير الملائمة.",
   lastUpdate:"بدون تغييرات جوهرية؛ مع مقررات توضيحية متتالية حول استبعاد مخصص ECL على السندات الخضراء",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["ذمم مدينة","خسائر ائتمانية","قروض"], kws:["ذمم مدينة","مدينين","عملاء","أوراق قبض","قرض","قروض","تمويلي","خصوم سحب بالمكشوف","استثمارات"]},

  {code:"IFRS 13", en:"Fair Value Measurement", ar:"قياس القيمة العادلة",
   purpose:"إطار موحد للقياس بالقيمة العادلة وإفصاح هرمية القيمة العادلة (مستوى 1، 2، 3) لما يقاس بها.",
   relation:"مساند للتقييمات في بنود استخدام القيمة العادلة: أصول استثمار ومشتقات وأصول اقتناء حديثة.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-13-fair-value-measurement/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["قيمة عادلة"], kws:["قيمة عادلة","تقييم عقاري","تقييم أعمال"]},

  {code:"IFRS 15", en:"Revenue from Contracts with Customers", ar:"الإيراد من العقود مع العملاء",
   purpose:"منهج خمس خطوات: تحديد العقد والتزامات الأداء وسعر المقابللة وتوزيعها والاعتراف بالإيراد عند/بحسب تسليم الالتزامات. المبادئ تفصل بيع المنتجات والخدمات والأوعية والمدفوعات المقدمة.",
   relation:"يحكم بند المدفوعات المقدمة من العملاء (التزام عقد) مقابل الاعتراف بالإيراد ومنطق حسابات «إيراد مقدماً». ويعرج أيضا على بنود الحوافز وهامش الوسطاء.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["إيراد","مبيعات","عملاء"], kws:["مبيعات","إيرادات","إيراد","عقود تنفيذ","رسوم خدمات","عمولات","دفعات مقدمة","مقدمات عملاء"]},

  {code:"IFRS 16", en:"Leases", ar:"عقود الإيجار",
   purpose:"على المستأجر: أصل حق الاستخدام والتزام إيجاري لكل عقد إيجار مادي (لا إيجارات تشغيلية خارج القوائم)، وعلى المؤجر: حفاظ على نموذج التشغيل/التمويل.",
   relation:"يحيط ببنود الإيجارات: أصول «حق انتفاع» والتزامات الإيجار المقابلة، وفصل إهلاك الأصل عن فوائد الالتزام بدل مصروف إيجار مستقيم.",
   lastUpdate:"بدون تغييرات جوهرية حديثة على متطلبات المستأجر",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["إيجار","حق انتفاع"], kws:["إيجار","ايجار","كراء","حق انتفاع","التزام إيجار","مكاتب مؤجر","معارض مؤجرة"]},

  {code:"IFRS 17", en:"Insurance Contracts", ar:"عقود التأمين",
   purpose:"نموذج شامل لمحاسبة عقود التأمين: هامش الخدمة الحالي وإعادة العرض بحصص التغطية ومجموعات الأدوات المتوقفة.",
   relation:"خاص بمنشآت التأمين: يحكم بنود الأقساط المستحقة ومخصصات المطالبات عند ظهورها في ميزان قطاع التأمين.",
   lastUpdate:"بدء التطبيق 2023 مع تعديلات سرعة اعتماد قياس أداة سنوية اجتيازية (نافذة 2023-2024)",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-17-insurance-contracts/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["تأمين"], kws:["تأمين","تعويضات تأمين","محتجزات"]},

  {code:"IFRS 8", en:"Operating Segments", ar:"المقاطع التشغيلية",
   purpose:"عرض البيانات المالية لحسب كيفيات تقييم المدير للقطاعات، تحت مظلة إيجاد الشركات العامة للتقطاعات والعملاء الجغرافيين.",
   relation:"كشف أفقي لدى المنشآت متعددة الأنشطة: تفكيك إجمالي ميزان المبيعات إلى قطاعات كعز ولوجستيات تفصيلية.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ifrs-8-operating-segments/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["قطاعات","أنشطة"], kws:["قطاعات","فروع تشغيلية"]},

  {code:"IAS 27", en:"Separate Financial Statements", ar:"القوائم المالية المنفردة",
   purpose:"محاسبة الاستثمارات في الشركات التابعة والزملاء والمشاريع المشتركة داخل قوائم المالك وحدها بالطريقة المعتمدة (بالتكلفة أو كأدوات مالية).",
   relation:"يبين طريقة عرض بنود «استثمار في شركة تابعة» أو «سهمية زمالة» داخل الميزان.",
   lastUpdate:"بدون تغييرات جوهرية حديثة",
   source:"https://www.ifrs.org/issued-standards/list-of-standards/ias-27-separate-financial-statements/",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["استثمارات تابعة","شركات شقيقة"], kws:["استثمار في شركات","تابعة","زمالة","مشروع مشترك"]},

  {code:"SOCPA-CO", en:"Charter / Local Regulations & Zakat", ar:"الأطر النظامية المحلية (الزكاة والنظام السعودي)",
   purpose:"الأطر التنظيمية المحلية السعودية الملازمة للقوائم: الضوابط الزكوية وفقاً لأنظمة هيئة الزكاة والضريبة والجمارك، وضوابط المنطقة الاقتصادية الخاصة، مع ملاءمة الاستحقاقات المحاسبية للفصل بين الضريبة والزكاة.",
   relation:"يطلب المجلس في بيئة S.A.R استيضاح بنود الزكاة والضريبة (VAT) والعلاوات المستحقة ضمن الأرصدة الختامية.",
   lastUpdate:"تحديثات دورية من ZATCA — أحدثها أدلة متسلسلة الفوترة الإلكترونية الفاز الثاني (الربط والتكامل)",
   source:"https://zatca.gov.sa/ar/RulesRegulations/Taxes/Pages/default.aspx",
   soocpa:"https://soocpa.org.sa/ar/technical/Standards/Pages/default.aspx",
   tags:["زكاة","ضريبة القيمة المضافة","نظامي"], kws:["ضريبة القيمة المضافة","vat","فاتورة إلكترونية","ضريبية مستحقة","مدخلات مضاعفة"]}
];

/* ---------- فهارس ومساعدات ---------- */
const byCode = {};
STANDARDS.forEach(s => byCode[s.code] = s);

function search(q){
  q = (q||"").trim().toLowerCase();
  if(!q) return STANDARDS;
  return STANDARDS.filter(s =>
    s.code.toLowerCase().includes(q) || s.ar.includes(q) ||
    s.en.toLowerCase().includes(q) || s.tags.join(" ").includes(q));
}

window.StdDB = { list:STANDARDS, byCode, search };
})();

# kosif-audit-pro — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `1be540e`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/kosif-audit-pro` — عام · اللغة الرئيسية TypeScript · 443 ك.ب على GitHub · آخر دفع 2026-08-31 · الفرع الافتراضي `main`
- الوصف على GitHub: —
- النسخة المفحوصة: **119 ملفاً** (1.1 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 3 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **عميق — قُرئت محركاته عند الدمج (docs/FUSION_ALL_REPOS_ar.md) وأُعيد مسحه آلياً اليوم**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `(root)` | 13 | 514 ك.ب |
| `components` | 65 | 295 ك.ب |
| `lib` | 12 | 143 ك.ب |
| `app` | 4 | 67 ك.ب |
| `tests` | 8 | 25 ك.ب |
| `patch` | 3 | 18 ك.ب |
| `scripts` | 3 | 9 ك.ب |
| `docs` | 2 | 7 ك.ب |
| `public` | 4 | 2 ك.ب |
| `worker` | 1 | 2 ك.ب |
| `db` | 2 | 1 ك.ب |
| `hooks` | 1 | 1 ك.ب |
| `drizzle` | 1 | 0 ك.ب |

الامتدادات: `.tsx` 67، `.mjs` 18، `.ts` 11، `.json` 5، `.md` 5، `.svg` 4، `.sh` 3، `(بلا)` 2، `.css` 2، `.mts` 1، `.js` 1

نقاط الدخول والإعداد:

- `package.json`
- package.json — deps: @base-ui/react, @hookform/resolvers, @shadcn/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react, input-otp, lucide-react, next, next-themes, radix-ui, react, react-day-picker, react-dom, react-hook-form, react-resizable-panels, recharts, sonner, tailwind-merge, vaul, zod; devDeps: @cloudflare/vite-plugin, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, @vitejs/plugin-react, @vitejs/plugin-rsc, drizzle-kit, eslint, eslint-config-next, react-server-dom-webpack, tailwindcss, tw-animate-css, typescript, vinext

سكربتات package.json: `install:ci`: bash scripts/install-ci.sh؛ `dev`: WRANGLER_LOG_PATH=.wrangler/wrangler.log vite؛ `build`: bash scripts/build-verified.sh؛ `start`: WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext start؛ `test`: npm run build && node --test tests/*.test.mjs؛ `lint`: bash scripts/sites-env.sh -- eslint . --ignore-pattern dist --ignore-pattern .next؛ `db:generate`: bash scripts/sites-env.sh -- drizzle-kit generate

## 4. README (`README.md`، أول الأسطر)

    # KOSIF Audit Studio Unified
    مساحة عمل عربية RTL لإدارة ملف المراجعة المالية من الإجراء التالي إلى التقرير، وليست أرشيفًا للملفات. تجمع بين الحساب الحتمي، جولات المراجعة، طلبات الأدلة، المخاطر، الإسناد، سجل المعايير، ومجلس مراجعي
    ## ما الذي يميّز النسخة الموحدة؟
    - نواة حسابية بوحدات العملة الصغرى و`BigInt` مع بوابة اعتماد `fail-closed`.
    - برنامج تشغيل من عشر جولات `A01–A10` و26 بوابة تشرح سبب حالتها وما ينقصها.
    - طلبات PBC مرتبطة بخطر وتأكيد وإجراء ومعيار، مع تقييم بشري للكفاية.
    - مجلس حتمي يعيد بناء ملاحظاته من كل ميزان مستورد، ومعه اقتراحات AI موثقة؛ كلاهما بلا سلطة اعتماد.
    - سجل إصدارات للـISA وIFRS يتضمن الفقرات والمصدر وتاريخ آخر تحقق.
    - مسار إسناد من المصدر إلى الطلب والإجراء والنتيجة والقرار.
    - واجهة تشغيلية تركّز على العمل المفتوح والتغطية والعوائق، مع RTL ووضع داكن واستجابة للجوال.
    - لوحة بنفسجية/فيروزية/كهرمانية/مرجانية مستوحاة من تناغم ريش الطيور، محكومة باختبارات تباين وفصل دلالي.
    - نظام حركة سينمائي هادئ للمشاهد والتنقل والقرارات ومسارات الأدلة، يعتمد `transform` و`opacity` ويحترم `prefers-reduced-motion` دون تحريك القيم المالية.
    ## المصدر والانتقاء
    بدأت النواة من المصدر المراجع في `kosif199022-jpg/mahmoud1990@767d1d1`، ثم أضيفت بوابة اعتماد صريحة وتغليف TypeScript. صُمم سير العمل بعد مراجعة مستودعات KOSIF المتاحة، ولا سيما `kosif-audit-studio` و
    ## البنية
    - `lib/kosif/`: خط التحليل الحتمي وبيانات العرض.
    - `lib/engine/`: وحدات التحليل الدقيقة المنتقاة من المصدر.
    - `lib/audit-workspace.ts`: نموذج الارتباط والجولات والأدلة والمخاطر والمعايير وAI.
    - `lib/reviewer-board.ts`: مجلس مراجعة حتمي؛ كل ملاحظة تحمل أساسًا رقميًا وجولة ومعيارًا وإجراءً وحدًا مهنيًا.
    - `components/kosif/`: قشرة التطبيق والمشاهد والتفاعلات.
    - `app/globals.css`: نظام التصميم المتجاوب المستوحى من البنفسجي الطبيعي والفيروزي الكينغفيش والعنبري المرجاني.
    - `tests/`: اختبارات الدقة والاتزان والحتمية والبوابات والمجلس والرأي المشتق وعقود الألوان والحركة والاستجابة والواجهة المبنية.
    ## التشغيل والتحقق
    يتطلب Node.js `>=22.13.0`.
    ```bash
    npm ci
    npm run lint
    npm test
    ```
    يتضمن `npm test` بناء نسخة الإنتاج ثم اختبارات HTML والمكونات والنواة. الاستيراد في الإصدار الحالي محلي داخل المتصفح ويقبل CSV وTSV والنص حتى 5 MB.
    ## ثوابت الحوكمة
    - لا قوائم ولا تقرير من ميزان غير صالح أو غير متوازن أو غير مصنف أو غير مترابط.
    - لا تُنقل النقود عبر `Number`؛ تحفظ الوحدات الصغرى كـ`BigInt` وتُسلسل كسلاسل عشرية.
    - لا يوجد حقل يختار منه المستخدم نوع الرأي. يشتق المحرك النتيجة من تقييمات منظمة معتمدة، ثم يعتمد الشريك البشري التقرير.
    - مخرجات المجلس وAI اقتراحات فقط؛ قبولها أو رفضها يولد حدثًا قابلًا للتتبع ولا يغير رقمًا تلقائيًا.
    - لا يحفظ التطبيق مفتاح Claude أو Gemini أو أي مفتاح مزود AI في المتصفح.
    انظر [بنية النظام](docs/ARCHITECTURE.md) و[سجل الانتقاء والقرارات](docs/LINEAGE_AND_DECISIONS.md) و[حدود الأمان](SECURITY.md).
    ## حدود الإصدار الأول
    الحالة التشغيلية تحفظ على الجهاز لأغراض العرض والاستمرار المحلي. الإنتاج متعدد المستخدمين يحتاج تخزينًا خادميًا مع عزل الارتباطات وRBAC وسجل أحداث ثابت، وموصل AI خادميًا، وخدمة رسمية لمراقبة تحديثات ا

## 5. الوحدات المصدرية

89 وحدة (الأكبر أولاً؛ تُعرض 89). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `lib/audit-workspace.ts` | 1114 | 32 |  | — |
| `components/kosif/views.tsx` | 677 | 8 |  | — |
| `lib/engine/v38-core.mjs` | 552 | 33 |  | KOSIF v38 — Trusted Audit Intelligence OS Deterministic accounting core. الحاكمية: كل حساب مالي، قيد، ميزان مراجعة، أهمية نسبية، عينة، أو ثابت محاسبي يُحسب هنا حسابًا حتميًا بدون أرقام عشرية عائمة وبدون تدخل نموذج لغوي.  |
| `components/ui/sidebar.tsx` | 724 | 0 |  | — |
| `components/kosif/workspace.tsx` | 517 | 1 |  | — |
| `lib/reviewer-board.ts` | 392 | 5 |  | Human-readable name for the single metric behind the note. |
| `components/kosif/overview.tsx` | 429 | 1 |  | — |
| `lib/kosif/trial-balance.mjs` | 346 | 9 |  | KOSIF — استيراد وتحليل ميزان المراجعة يحوّل نصًا جدوليًا (CSV / TSV / منسوخ من Excel) إلى ميزان مراجعة حتمي بوحدات minor، ويصنّف الحسابات ويكشف عدم التوازن. كل حساب مالي هنا يمر عبر parseMoney من المحرّك الحتمي — لا حساب |
| `components/kosif/app-shell.tsx` | 436 | 1 |  | — |
| `lib/engine/analytics-v52.mjs` | 258 | 10 |  | KOSIF Analytics Engine v52 — التحليل المالي السينمائي محرك حتمي بالكامل: نسب مالية، قانون بنفورد، أعمار الديون، ألتمان Z، كشف الشذوذ، ومؤشر مخاطر مركّب. لا عشوائية ولا AI — كل المخرجات قابلة لإعادة الإنتاج. الأموال بأعدا |
| `components/ui/chart.tsx` | 378 | 1 |  | — |
| `components/ui/combobox.tsx` | 311 | 0 |  | — |
| `components/ui/dropdown-menu.tsx` | 258 | 0 |  | — |
| `components/ui/menubar.tsx` | 277 | 0 |  | — |
| `components/ui/context-menu.tsx` | 253 | 0 |  | — |
| `lib/kosif/analysis.mjs` | 169 | 8 |  | KOSIF — طبقة التحليل المهني تربط ميزان المراجعة والقوائم المالية بمحرّك التحليلات الحتمي: النِسب، بنفورد، أعمار الذمم، ألتمان Z، الأهمية النسبية، والعيّنات. الذكاء الاصطناعي لا يدخل هنا إطلاقًا: كل رقم في هذا الملف ناتج  |
| `components/ui/calendar.tsx` | 221 | 0 |  | — |
| `lib/kosif/statements.mjs` | 139 | 2 |  | KOSIF — بناء القوائم المالية من ميزان المراجعة تحويل حتمي: كل بند في القائمة يُبنى من مجموع أرصدة حسابات محددة، ويحتفظ بمرجع الحسابات التي كوّنته حتى يظل كل رقم قابلًا للتتبع. |
| `components/ui/navigation-menu.tsx` | 169 | 0 |  | — |
| `components/ui/select.tsx` | 191 | 0 |  | — |
| `components/ui/field.tsx` | 249 | 0 |  | — |
| `components/ui/attachment.tsx` | 205 | 0 |  | — |
| `components/ui/carousel.tsx` | 242 | 0 |  | — |
| `components/ui/alert-dialog.tsx` | 197 | 0 |  | — |
| `components/ui/input-group.tsx` | 171 | 0 |  | — |
| `components/ui/command.tsx` | 185 | 0 |  | — |
| `components/ui/bubble.tsx` | 126 | 0 |  | — |
| `lib/kosif/format.mjs` | 109 | 8 |  | KOSIF — طبقة العرض الرقمية تنسيق حتمي للأرقام والنقود والنِسب، بلا اعتماد على Intl حتى تتطابق المخرجات حرفيًا بين Node والمتصفح و Workers. |
| `components/ui/item.tsx` | 194 | 0 |  | — |
| `components/ui/dialog.tsx` | 159 | 0 |  | — |
| `components/ui/drawer.tsx` | 136 | 0 |  | — |
| `components/ui/sheet.tsx` | 144 | 0 |  | — |
| `components/ui/message-scroller.tsx` | 131 | 0 |  | — |
| `components/ui/tabs.tsx` | 92 | 0 |  | — |
| `components/ui/form.tsx` | 168 | 0 |  | — |
| `lib/kosif/dataset.mjs` | 62 | 4 |  | KOSIF — بيانات العرض التوضيحي ميزان مراجعة متوازن واقعي لمنشأة خدمية، يُستخدم لتشغيل التطبيق فورًا دون انتظار ملف من المستخدم. بيانات مصنّعة بالكامل. |
| `patch/enhancement-module.fixed.js` | 62 | 2 |  | إصلاح: injectKosifV16 كان يحقن في المكان الخطأ. المشكلة — الملف frontend/index.html يحتوي وسمَي </head> اثنين: الأول عند 36901 ← رأس الصفحة الحقيقي الثاني عند 274995 ← داخل نص JavaScript يبني مستند تقرير للطباعة: `...</s |
| `components/ui/avatar.tsx` | 110 | 0 |  | — |
| `components/ui/pagination.tsx` | 128 | 0 |  | — |
| `lib/kosif/browser.mjs` | 94 | 4 |  | Browser-facing KOSIF pipeline. The numerical modules below are copied byte-for-byte from the reviewed 767d1d1 source. This bridge deliberately excludes the legacy dynamic module loader and adds a fail-closed reliance gat |
| `components/ui/table.tsx` | 117 | 0 |  | — |
| `components/ui/button.tsx` | 65 | 0 |  | — |
| `components/ui/empty.tsx` | 105 | 0 |  | — |
| `app/chatgpt-auth.ts` | 87 | 5 |  | — |
| `components/ui/breadcrumb.tsx` | 110 | 0 |  | — |
| `components/ui/popover.tsx` | 90 | 0 |  | — |
| `components/ui/toggle-group.tsx` | 84 | 0 |  | — |
| `components/ui/input-otp.tsx` | 78 | 0 |  | — |
| `components/ui/message.tsx` | 93 | 0 |  | — |
| `components/ui/button-group.tsx` | 84 | 0 |  | — |
| `components/ui/accordion.tsx` | 67 | 0 |  | — |
| `components/ui/card.tsx` | 93 | 0 |  | — |
| `components/ui/native-select.tsx` | 63 | 0 |  | — |
| `components/ui/slider.tsx` | 64 | 0 |  | — |
| `components/ui/marker.tsx` | 70 | 0 |  | — |
| `components/ui/tooltip.tsx` | 58 | 0 |  | — |
| `vite.config.ts` | 65 | 0 |  | — |
| `components/ui/resizable.tsx` | 54 | 0 |  | — |
| `components/ui/badge.tsx` | 49 | 0 |  | — |
| `worker/index.ts` | 48 | 0 |  | Cloudflare Worker entry point for the vinext-starter template. |
| `components/ui/scroll-area.tsx` | 59 | 0 |  | — |
| `components/ui/alert.tsx` | 67 | 0 |  | — |
| `components/ui/toggle.tsx` | 48 | 0 |  | — |
| `components/ui/hover-card.tsx` | 45 | 0 |  | — |
| `components/ui/radio-group.tsx` | 46 | 0 |  | — |
| `components/ui/switch.tsx` | 36 | 0 |  | — |
| `components/ui/checkbox.tsx` | 33 | 0 |  | — |
| `components/ui/sonner.tsx` | 41 | 0 |  | — |
| `components/ui/input.tsx` | 22 | 0 |  | — |
| `components/ui/kbd.tsx` | 29 | 0 |  | — |
| `eslint.config.mjs` | 29 | 0 |  | ", "out/ ", "build/ ", "next-env.d.ts", ]), { files: ["components/ui/ |
| `components/ui/collapsible.tsx` | 34 | 0 |  | — |
| `components/ui/progress.tsx` | 33 | 0 |  | — |
| `components/ui/textarea.tsx` | 19 | 0 |  | — |
| `components/ui/separator.tsx` | 29 | 0 |  | — |
| `app/layout.tsx` | 25 | 2 |  | — |
| `components/ui/label.tsx` | 25 | 0 |  | — |
| `hooks/use-mobile.ts` | 20 | 1 |  | — |
| `components/ui/direction.tsx` | 23 | 0 |  | — |
| `db/index.ts` | 14 | 1 |  | — |
| `components/ui/spinner.tsx` | 17 | 0 |  | — |
| `components/ui/skeleton.tsx` | 14 | 0 |  | — |
| `components/ui/aspect-ratio.tsx` | 12 | 0 |  | — |
| `lib/utils.ts` | 7 | 1 |  | — |
| `db/schema.ts` | 5 | 0 |  | Intentionally empty by default. Add Drizzle tables here when the site actually needs a database. See examples/d1/db/schema.ts for an opt-in example. |
| `drizzle.config.ts` | 8 | 0 |  | — |
| `next.config.ts` | 8 | 0 |  | config options here |
| `app/page.tsx` | 6 | 1 |  | — |
| `postcss.config.mjs` | 8 | 0 |  | — |

## 6. الاختبارات (8)

- `tests/palette.test.mjs` (205 سطراً) 
- `tests/kosif-engine.test.mjs` (96 سطراً) 
- `tests/audit-programme.test.mjs` (75 سطراً) 
- `tests/reviewer-board.test.mjs` (82 سطراً) 
- `tests/motion-contract.test.mjs` (71 سطراً) 
- `tests/ui-components.test.mjs` (86 سطراً) 
- `tests/responsive.test.mjs` (57 سطراً) 
- `tests/rendered-html.test.mjs` (35 سطراً) 

## 7. المخططات والبيانات

- `db/schema.ts`

## 8. المسارات والعمّال وواجهات API

- `worker/index.ts: url.pathname === "/_vinext/image`

## 9. مواد الذكاء الاصطناعي والوكلاء

- لا مهارات أو مطالبات أو مجالس ظاهرة.

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `codex/cinematic-ui-v3-20260831`، `main`، `unified-audit-os`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| المال الدقيق (BigInt) للميزان والقوائم | تمثيل المبالغ بوحدات صغرى بلا فقد عشري وتجميعها في ميزان وقوائم | المراجعة + المحاسبة | عام | منقول | cloude: app/src/engine/fusion/reports/money-engine.ts | SKEngines.reports.money | Merge (منفذ) | vitest money-engine | توحيد عقد الدقة مع ledger-engine (Number بوحدات كبرى) — P2 |
| القوائم المالية والتحليل من الميزان | بناء المركز المالي والدخل والتدفقات والنسب من ميزان مراجعة مصنف | المحاسبة (مشترك مع المراجعة والأدوات) | عام | منقول ومختبَر | cloude: reports/statements-engine.ts, analysis-engine.ts | SKEngines.reports.statements / analysis | Merge (منفذ) | vitest statements/analysis + bundle_verify | — |
| مجلس المراجعين وجولات A01–A10 | ملاحظات مجلس حتمية بأساس رقمي وإجراء لكل ملاحظة، وجولات مراجعة مرقمة | المراجعة | عام | منقول (الملاحظات)؛ الجولات في ai-review-engine | cloude: audit/tb-review-engine.ts + ai-review-engine.ts | ملف المراجعة ← الجولات | Merge (منفذ) — التحقق من تغطية A01–A10 واحدة واحدة | اختبار يقارن قائمة الجولات بالمصدر | جرد الجولات العشر مقابل programme-engine (P4) |
| تجميع التحريفات ISA 450 واشتقاق الرأي | جمع التحريفات غير المصححة ومقارنتها بالأهمية النسبية ثم نوع الرأي | المراجعة | عام | منقول | cloude: tb-review-engine deriveOpinion | SKEngines.audit.tbReview.deriveOpinion | Merge (منفذ) | vitest tb-review | — |

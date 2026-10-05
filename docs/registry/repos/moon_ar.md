# moon — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `52baec7`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/moon` — عام · اللغة الرئيسية TypeScript · 108 ك.ب على GitHub · آخر دفع 2026-09-02 · الفرع الافتراضي `main`
- الوصف على GitHub: السحاب الأبيض — استوديو مالي سينمائي فائق: محاسبة حتمية · تحليلات عميقة · 100 ثيم · تقارير احترافية · مجلس مراجعين
- النسخة المفحوصة: **49 ملفاً** (0.2 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 4 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **عميق — قُرئ عند الدمج وأُعيد مسحه اليوم**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `public` | 12 | 78 ك.ب |
| `packages` | 10 | 49 ك.ب |
| `apps` | 10 | 24 ك.ب |
| `database` | 3 | 14 ك.ب |
| `(root)` | 10 | 7 ك.ب |
| `scripts` | 2 | 4 ك.ب |
| `docs` | 2 | 2 ك.ب |

الامتدادات: `.ts` 16، `.js` 11، `.json` 6، `.md` 5، `(بلا)` 3، `.mjs` 2، `.example` 1، `.yml` 1، `.yaml` 1، `.sql` 1، `.html` 1، `.css` 1

نقاط الدخول والإعداد:

- `public/index.html`
- `package.json`
- `apps/api/package.json`
- `packages/domain/package.json`
- package.json — deps: —; devDeps: typescript

سكربتات package.json: `dev`: node scripts/serve.mjs؛ `dev:api`: pnpm --filter @moon/api dev؛ `build`: pnpm --filter @moon/domain build && pnpm --filter @moon/api build؛ `test`: node scripts/validate-static.mjs && pnpm --filter @moon/domain test:unit؛ `type-check`: pnpm --filter @moon/domain type-check && pnpm --filter @moon/domain build && pnpm --filter @moon/api type-check؛ `check`: pnpm type-check && pnpm test && pnpm build؛ `db:migrate`: node database/migrate.js؛ `db:seed`: node database/seed.js

## 4. README (`README.md`، أول الأسطر)

    # Moon — AI Audit Operating System
    نظام تشغيل عربي لملف المراجعة: يستوعب ميزان المراجعة، يحسب الأهمية النسبية، يفكك عوامل المخاطر، ينفذ مؤشرات قيود اليومية وفق ISA 240، يختار عينات قابلة لإعادة الإنتاج، يربط الأدلة، يجمع التحريفات، ويش
    ## التشغيل السريع
    ```bash
    corepack enable
    pnpm install
    pnpm dev
    ```
    ثم افتح `http://127.0.0.1:4173`.
    التطبيق الموجود في `public/` يعمل كنسخة متصفح كاملة دون قاعدة بيانات، ويحفظ بيانات التجربة محلياً في المتصفح. استخدم بيانات تجريبية فقط.
    ## بوابة الجودة
    ```bash
    pnpm check
    ```
    تتحقق البوابة من سلامة HTML وJavaScript، غياب الملفات السرية، اختبارات وحدة النقود، TypeScript، وبناء حزمتي `domain` و`api`.
    ## النشر على GitHub Pages
    يتطلب GitHub تفعيل Pages مرة واحدة بصلاحية مدير المستودع:
    1. افتح `Settings → Pages`.
    2. اختر `GitHub Actions` ضمن `Build and deployment → Source`.
    3. افتح `Actions → Deploy static Moon demo to GitHub Pages` ثم شغّل `Run workflow`.
    بعد نجاح النشر يكون العنوان المتوقع: `https://kosif199022-jpg.github.io/moon/`.
    ## تشغيل واجهة API الاختبارية
    ```bash
    cp .env.example .env
    # عدّل كلمة مرور PostgreSQL في .env و docker-compose.yml لتتطابقا.
    docker compose up -d postgres redis
    pnpm db:migrate
    pnpm db:seed
    pnpm dev:api
    ```
    - فحص الخدمة: `GET http://localhost:3001/health`
    - سياق التطوير المزروع:
      - `X-Organization-ID: 11111111-1111-4111-8111-111111111111`
      - `X-User-ID: 22222222-2222-4222-8222-222222222222`
    ## هيكل المستودع
    ```text
    public/                    التطبيق العربي RTL والمحركات الحتمية
    apps/api                   API أولي للمهمات والحسابات
    packages/domain            Money, Provenance, Engagement, Evidence, Risk
    database                   PostgreSQL migrations + development seed
    scripts                    خادم محلي وفحص ثابت
    .github/workflows          CI ونشر GitHub Pages
    ```
    ## حدود النسخة الحالية
    الواجهة المتكاملة في المتصفح هي المرجع التشغيلي الحالي. واجهة API تمثل أساس المرحلة الأولى وليست بعد خدمة إنتاج متعددة المستأجرين. لا ترفع ملفات عميل حقيقية أو نسخاً مرخصة من المعايير إلى المستودع الع

## 5. الوحدات المصدرية

30 وحدة (الأكبر أولاً؛ تُعرض 30). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `public/actions.js` | 90 | 0 |  | — |
| `database/migrations/V001__initial_schema.sql` | 262 | 0 |  | — |
| `packages/domain/src/value-objects/Provenance.ts` | 318 | 3 |  | Provenance - Complete traceability envelope for audit artifacts Every computed value must carry its lineage |
| `packages/domain/src/value-objects/Money.ts` | 296 | 3 |  | Immutable money value represented exclusively in minor units. Example: 1_000n with exp=2 represents SAR 10.00. |
| `public/views-review.js` | 12 | 0 |  | — |
| `public/views-dashboard.js` | 37 | 0 |  | — |
| `public/views-planning.js` | 15 | 0 |  | — |
| `public/state.js` | 111 | 0 |  | — |
| `public/engine.js` | 113 | 0 |  | — |
| `apps/api/src/routes/engagements.ts` | 182 | 1 |  | — |
| `public/audit-engines.js` | 80 | 0 |  | — |
| `packages/domain/src/entities/Engagement.ts` | 275 | 4 |  | Engagement Entity - Represents a single audit engagement/file Manages the complete audit lifecycle from draft to archive |
| `packages/domain/src/entities/Evidence.ts` | 239 | 6 |  | Evidence Entity - Represents audit evidence Evidence is a professional unit with source integrity, relevance, and reliability assessment |
| `packages/domain/src/entities/Risk.ts` | 252 | 6 |  | Risk Entity - Represents an identified audit risk Risks are identified through materiality and account analysis |
| `apps/api/src/routes/accounts.ts` | 110 | 1 |  | — |
| `apps/api/src/http.ts` | 88 | 8 |  | — |
| `apps/api/src/app.ts` | 96 | 1 |  | — |
| `public/index.html` | 50 | 0 |  | <title> Moon — نظام تشغيل المراجعة |
| `scripts/serve.mjs` | 72 | 0 |  | — |
| `public/render.js` | 21 | 0 |  | — |
| `scripts/validate-static.mjs` | 30 | 0 |  | — |
| `packages/domain/src/index.ts` | 66 | 10 |  | — |
| `database/migrate.js` | 72 | 0 |  | — |
| `apps/api/src/audit.ts` | 55 | 1 |  | — |
| `apps/api/src/types.ts` | 56 | 6 |  | — |
| `database/seed.js` | 42 | 0 |  | — |
| `apps/api/src/index.ts` | 29 | 0 |  | — |
| `apps/api/src/db.ts` | 36 | 2 |  | — |
| `public/boot.js` | 7 | 0 |  | — |
| `packages/domain/vitest.config.ts` | 10 | 0 |  | — |

## 6. الاختبارات (1)

- `packages/domain/tests/Money.test.ts` (235 سطراً) 

## 7. المخططات والبيانات

- `database/migrations/V001__initial_schema.sql`

## 8. المسارات والعمّال وواجهات API

- `apps/api/src/app.ts: app.get('/api`
- `apps/api/src/app.ts: app.get('/health`

## 9. مواد الذكاء الاصطناعي والوكلاء

- لا مهارات أو مطالبات أو مجالس ظاهرة.

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `feat/moon-audit-os-v1`، `fix/enable-github-pages`، `fix/pages-manual-deploy`، `main`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| تقييم المخاطر لكل بند | درجة خطر من الحجم والتقدير والتغير وفجوة الأدلة والطبيعة | المراجعة | عام | منقول | cloude: tb-review-engine (riskScore) | ملف المراجعة ← المخاطر | Merge (منفذ) | tb-review-engine.test.ts | — |
| اختبارات القيود (journal entry testing) | اختبارات شذوذ على القيود: نهاية الفترة، أرقام مستديرة، مستخدمون غير معتادين | المراجعة (مشترك مع الأدوات: الرقابة والجودة) | عام | متاح في استوديو التحليل (ui/audit) | cloude: ui/audit analysis studio | عائلة الرقابة والجودة في الأدوات + إجراء مراجعة | Relocate — شاشة مستقلة في الأدوات تقرأ دفاتر الشركة | اختبار يشغّل القواعد على دفتر تجريبي | P6 |
| اشتقاق الرأي ISA 705 | رأي نظيف/متحفظ/معاكس/امتناع من التحريفات والقيود | المراجعة | عام | منقول | cloude: deriveOpinion | التقرير النهائي | Merge (منفذ) | vitest | — |
| الاستوديو المالي السينمائي (الواجهة) | واجهة عرض مالية بحركة وطبقات | تصميم | عام | لم يُنقل | moon (ui) | docs/design (أفكار) | Specialize — تُحصد أفكار الحركة فقط؛ المنطق في cloude | — | مراجعة بصرية عند P8 |

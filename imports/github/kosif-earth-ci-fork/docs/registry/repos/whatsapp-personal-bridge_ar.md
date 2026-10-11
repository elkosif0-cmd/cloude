# whatsapp-personal-bridge — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `85a7562`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/whatsapp-personal-bridge` — عام · اللغة الرئيسية JavaScript · 23 ك.ب على GitHub · آخر دفع 2026-09-27 · الفرع الافتراضي `main`
- الوصف على GitHub: —
- النسخة المفحوصة: **6 ملفاً** (0.0 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 3 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **عميق — مستقل عمداً (أسرار تشغيل)؛ مسح آلي اليوم**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `src` | 1 | 3 ك.ب |
| `test` | 1 | 3 ك.ب |
| `(root)` | 4 | 2 ك.ب |

الامتدادات: `.mjs` 2، `(بلا)` 1، `.json` 1، `.md` 1، `.toml` 1

نقاط الدخول والإعداد:

- `package.json`
- `wrangler.toml`
- package.json — deps: —; devDeps: —

سكربتات package.json: `test`: node --test؛ `dev`: wrangler dev؛ `deploy`: wrangler deploy

## 4. README (`README.md`، أول الأسطر)

    # WhatsApp Personal Bridge
    جسر شخصي لاستقبال أوامر الرسائل مع تفويض مسبق وإيقاف فوري.
    ## الحالة الحالية
    هذه النسخة تنفّذ API آمنًا للطابور والتفويض، لكنها لا تتحكم تلقائيًا في جلسة WhatsApp Web داخل ChatGPT. Cloudflare Workers لا يستطيع الضغط على زر في متصفح خارجي. يلزم منفّذ دائم منفصل (متصفح Playwrigh
    ## التشغيل
    ```bash
    npm test
    npx wrangler secret put BRIDGE_TOKEN
    npm run deploy
    ```
    ## API
    - `POST /authorize` — تفعيل الإرسال التلقائي مسبقًا.
    - `POST /stop` — إيقاف فوري ومسح الطابور.
    - `GET /status` — حالة التفويض والمنفّذ والطابور.
    - `POST /send` — يضيف رسالة للطابور بصيغة `{ "to": "+201023082293", "message": "ازيك" }`.
    - `GET /queue` — قراءة الرسائل المعلّقة للمنفّذ.
    كل الطلبات تحتاج `Authorization: Bearer <BRIDGE_TOKEN>`. لا تضع رمز واتساب أو بيانات الدخول في GitHub أو Cloudflare.

## 5. الوحدات المصدرية

1 وحدة (الأكبر أولاً؛ تُعرض 1). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `src/bridge.mjs` | 67 | 1 |  | — |

## 6. الاختبارات (1)

- `test/bridge.test.mjs` (53 سطراً) 

## 7. المخططات والبيانات

- لا مخططات أو ملفات ترحيل ظاهرة.

## 8. المسارات والعمّال وواجهات API

- `src/bridge.mjs: url.pathname === '/`
- `src/bridge.mjs: url.pathname === '/authorize`
- `src/bridge.mjs: url.pathname === '/queue`
- `src/bridge.mjs: url.pathname === '/send`
- `src/bridge.mjs: url.pathname === '/status`
- `src/bridge.mjs: url.pathname === '/stop`

## 9. مواد الذكاء الاصطناعي والوكلاء

- لا مهارات أو مطالبات أو مجالس ظاهرة.

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `codex/whatsapp-bridge-v2`، `feat/whatsapp-mcp-replacement`، `main`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| جسر واتساب وعمّال wa-kosif* | إرسال واستقبال رسائل واتساب عبر عمّال مستقلين برموز اقتران | خدمة مشتركة (مستقلة) | عام | يعمل مستقلاً؛ PR #96 في cloude (المالك وحده يستدعي الأدوات) | whatsapp-personal-bridge | خارج التطبيق؛ يُستدعى من العروض والتقارير | Keep (مستقل) | — | إغلاق Issues رموز الاقتران المنتهية في cloude (18) |

# mafateeh-al-tharwa2 — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `fc85186`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/mafateeh-al-tharwa2` — عام · اللغة الرئيسية HTML · 1,259 ك.ب على GitHub · آخر دفع 2026-08-15 · الفرع الافتراضي `main`
- الوصف على GitHub: —
- النسخة المفحوصة: **94 ملفاً** (2.3 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 2 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **مرجع — نسخة ثانية من القارئ**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `public` | 62 | 1934 ك.ب |
| `(root)` | 11 | 387 ك.ب |
| `app` | 10 | 30 ك.ب |
| `scripts` | 7 | 29 ك.ب |
| `worker` | 1 | 3 ك.ب |
| `db` | 2 | 1 ك.ب |
| `drizzle` | 1 | 0 ك.ب |

الامتدادات: `.json` 40، `.ts` 13، `.js` 9، `.css` 6، `.sh` 5، `.mjs` 4، `.svg` 4، `.png` 4، `.webp` 3، `.txt` 2، `.tsx` 2، `.webmanifest` 1، `.html` 1

نقاط الدخول والإعداد:

- `public/audio/manifest.json`
- `package.json`
- `public/manifest.webmanifest`
- package.json — deps: drizzle-orm, next, react, react-dom; devDeps: @cloudflare/vite-plugin, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, @vitejs/plugin-react, @vitejs/plugin-rsc, drizzle-kit, eslint, eslint-config-next, react-server-dom-webpack, tailwindcss, typescript, vinext, vite

سكربتات package.json: `dev`: vinext dev؛ `build`: vinext build؛ `preview`: npm run build && vite preview؛ `deploy`: npm run build && wrangler deploy؛ `start`: vinext start؛ `lint`: eslint . --ignore-pattern dist --ignore-pattern .next؛ `db:generate`: drizzle-kit generate؛ `audio:build`: NODE_USE_ENV_PROXY=1 node scripts/generate-saved-audiobook.mjs

## 4. README

لا يوجد README.

## 5. الوحدات المصدرية

29 وحدة (الأكبر أولاً؛ تُعرض 29). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `public/reader.html` | 706 | 0 |  | ══════════ رموز التصميم ══════════ |
| `public/reader-smart-suite.js` | 172 | 0 |  | مفاتيح الثروة — Smart Suite v24 Unlimited Books - اقرأ أي نص: صوت الراوي / Piper / Gemini / OpenAI - مكتبة PDF ذكية بمساعدة Gemini مع استخراج دفعات وقارئ بنفس هوية مفاتيح الثروة - افهم كتابي Book AI + Book Intelligence - |
| `public/reader-studio.js` | 785 | 0 |  | مفاتيح الثروة — استوديو التصدير والصوت — الإصدار 13 يعيد بناء مركز التصدير: PDF مطابق لتنسيق الكتاب، EPUB، Word، كانفا، تنزيل الكتاب الصوتي كاملًا أو فصلًا واحدًا، واستوديو مقاطع النص المحدد. |
| `public/reader-tools.js` | 473 | 0 |  | مفاتيح الثروة — أدوات القارئ المتقدمة، الإصدار 10 |
| `public/reader-ambience.js` | 597 | 0 |  | مفاتيح الثروة — خلفية الكتاب والأجواء — الإصدار 13 مشاهد مصورة وحيّة، أصوات مولّدة داخل الجهاز، وثلاثة أشكال لسطح القراءة. كل ذلك اختياري: «الخلفية الأصلية» تُعيد الكتاب إلى شكله المعتاد تمامًا. |
| `public/reader-formats.js` | 510 | 0 |  | مفاتيح الثروة — مُولّد الصيغ (ZIP / EPUB / DOCX / HTML / TXT) وقص MP3 — الإصدار 13 هذا الملف لا يلمس الواجهة إطلاقًا: دوال خالصة قابلة للاختبار خارج المتصفح. |
| `app/api/_lib/ai.ts` | 315 | 19 |  | — |
| `public/reader-mixer.js` | 153 | 0 |  | مفاتيح الثروة — Professional Multi-Layer Audio Mixer v22 |
| `scripts/generate-saved-audiobook.mjs` | 304 | 0 |  | — |
| `public/reader-master-fixes.js` | 190 | 0 |  | مفاتيح الثروة — Runtime stability fixes (v30.1) Centralizes mobile modal/scroll safeguards without rewriting reader.html. |
| `scripts/generate-audio-timings.mjs` | 171 | 0 |  | — |
| `app/api/ai/pdf/route.ts` | 55 | 1 |  | This is a per-upload-part safety ceiling, not a book-size ceiling. V24 splits books in the browser and can process any number of parts sequentially. |
| `public/sw.js` | 126 | 0 |  | — |
| `worker/index.ts` | 78 | 0 |  | Cloudflare Worker entry point for the vinext-starter template. |
| `app/api/tts/route.ts` | 40 | 2 |  | — |
| `app/chatgpt-auth.ts` | 87 | 5 |  | — |
| `public/piper-worker.js` | 43 | 0 |  | مفاتيح الثروة — Piper Worker Piper يعمل محليًا في المتصفح بعد تنزيل نموذج ar_JO-kareem-medium. النص لا يُرسل إلى خادم التطبيق أو مزود سحابي في هذا الوضع. |
| `app/api/ai/tts/route.ts` | 16 | 1 |  | — |
| `app/api/ai/chat/route.ts` | 14 | 1 |  | — |
| `app/page.tsx` | 25 | 1 |  | Internal workspace sites can read the authenticated OpenAI user from the forwarded request headers:  import { headers } from "next/headers";  export default async function Home() { const requestHeaders = await headers(); |
| `app/layout.tsx` | 33 | 2 |  | — |
| `app/api/ai/status/route.ts` | 9 | 1 |  | — |
| `eslint.config.mjs` | 19 | 0 |  | Override default ignores of eslint-config-next. |
| `db/index.ts` | 14 | 1 |  | — |
| `vite.config.ts` | 16 | 0 |  | — |
| `db/schema.ts` | 5 | 0 |  | Intentionally empty by default. Add Drizzle tables here when the site actually needs a database. See examples/d1/db/schema.ts for an opt-in example. |
| `drizzle.config.ts` | 8 | 0 |  | — |
| `next.config.ts` | 8 | 0 |  | config options here |
| `postcss.config.mjs` | 8 | 0 |  | — |

## 6. الاختبارات (0)

- لا اختبارات.

## 7. المخططات والبيانات

- `db/schema.ts`

## 8. المسارات والعمّال وواجهات API

- `public/sw.js: addEventListener("fetch"`
- `worker/index.ts: url.pathname === "/_vinext/image`
- `worker/index.ts: url.pathname === "/reader.html`

## 9. مواد الذكاء الاصطناعي والوكلاء

- لا مهارات أو مطالبات أو مجالس ظاهرة.

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `main`، `release/v30-runtime-fixes`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| القارئ (نسخة 2) | كالسابق | طبقة مشتركة | عام | مكرر | mafateeh-al-tharwa | — | Merge مع mafateeh-al-tharwa | — | — |

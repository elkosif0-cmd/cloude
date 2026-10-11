# mafateeh-al-tharwa — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `a182735`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/mafateeh-al-tharwa` — عام · اللغة الرئيسية HTML · 67,853 ك.ب على GitHub · آخر دفع 2026-08-23 · الفرع الافتراضي `main`
- الوصف على GitHub: —
- النسخة المفحوصة: **182 ملفاً** (68.9 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 3 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **مرجع — مسح آلي اليوم؛ قارئ الكتب قُرئ عند الدمج**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `public` | 103 | 69820 ك.ب |
| `(root)` | 16 | 393 ك.ب |
| `scripts` | 41 | 318 ك.ب |
| `app` | 10 | 30 ك.ب |
| `tests` | 8 | 18 ك.ب |
| `worker` | 1 | 13 ك.ب |
| `db` | 2 | 1 ك.ب |
| `drizzle` | 1 | 0 ك.ب |

الامتدادات: `.json` 40، `.mp3` 34، `.mjs` 27، `.txt` 21، `.ts` 13، `.js` 12، `.css` 6، `.sh` 6، `(بلا)` 4، `.md` 4، `.svg` 4، `.png` 4، `.webp` 3، `.tsx` 2، `.webmanifest` 1، `.html` 1

نقاط الدخول والإعداد:

- `public/audio/manifest.json`
- `package.json`
- `public/manifest.webmanifest`
- package.json — deps: drizzle-orm, next, react, react-dom; devDeps: @cloudflare/vite-plugin, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, @vitejs/plugin-react, @vitejs/plugin-rsc, drizzle-kit, eslint, eslint-config-next, react-server-dom-webpack, tailwindcss, typescript, vinext, vite

سكربتات package.json: `install:ci`: bash scripts/install-ci.sh؛ `dev`: WRANGLER_LOG_PATH=.wrangler/wrangler.log vite؛ `build`: node scripts/apply-book-picker-failsafe.mjs && bash scripts/build-verified.sh؛ `start`: WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext start؛ `test`: chmod +x scripts/*.sh && scripts/master-regression.sh && node --test tests/*.test.mjs && npm run build؛ `audio:build`: NODE_USE_ENV_PROXY=1 node scripts/generate-saved-audiobook.mjs؛ `validate:artifact`: bash scripts/validate-artifact.sh؛ `lint`: bash scripts/sites-env.sh -- eslint . --ignore-pattern dist --ignore-pattern .next؛ `db:generate`: bash scripts/sites-env.sh -- drizzle-kit generate

## 4. README

لا يوجد README.

## 5. الوحدات المصدرية

47 وحدة (الأكبر أولاً؛ تُعرض 47). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `public/reader.html` | 703 | 0 |  | ══════════ رموز التصميم ══════════ |
| `public/reader-smart-suite.js` | 172 | 0 |  | مفاتيح الثروة — Smart Suite v24 Unlimited Books - اقرأ أي نص: صوت الراوي / Piper / Gemini / OpenAI - مكتبة PDF ذكية بمساعدة Gemini مع استخراج دفعات وقارئ بنفس هوية مفاتيح الثروة - افهم كتابي Book AI + Book Intelligence - |
| `scripts/apply-multi-book-library.mjs` | 204 | 0 |  | — |
| `public/reader-studio.js` | 785 | 0 |  | مفاتيح الثروة — استوديو التصدير والصوت — الإصدار 13 يعيد بناء مركز التصدير: PDF مطابق لتنسيق الكتاب، EPUB، Word، كانفا، تنزيل الكتاب الصوتي كاملًا أو فصلًا واحدًا، واستوديو مقاطع النص المحدد. |
| `public/reader-tools.js` | 473 | 0 |  | مفاتيح الثروة — أدوات القارئ المتقدمة، الإصدار 10 |
| `public/reader-ambience.js` | 597 | 0 |  | مفاتيح الثروة — خلفية الكتاب والأجواء — الإصدار 13 مشاهد مصورة وحيّة، أصوات مولّدة داخل الجهاز، وثلاثة أشكال لسطح القراءة. كل ذلك اختياري: «الخلفية الأصلية» تُعيد الكتاب إلى شكله المعتاد تمامًا. |
| `public/reader-formats.js` | 510 | 0 |  | مفاتيح الثروة — مُولّد الصيغ (ZIP / EPUB / DOCX / HTML / TXT) وقص MP3 — الإصدار 13 هذا الملف لا يلمس الواجهة إطلاقًا: دوال خالصة قابلة للاختبار خارج المتصفح. |
| `public/reader-mixer.js` | 214 | 0 |  | مفاتيح الثروة — Professional Multi-Layer Audio Mixer v25 |
| `public/reader-master-fixes.js` | 177 | 0 |  | مفاتيح الثروة — Master Runtime Fixes v30 iPhone modal scrolling, audio resilience, MediaSession, storage health, full-audiobook offline download, visual viewport, and regression telemetry. |
| `app/api/_lib/ai.ts` | 319 | 19 |  | — |
| `public/reader-mixer-core-v22.js` | 153 | 0 |  | مفاتيح الثروة — Professional Multi-Layer Audio Mixer v22 |
| `worker/index.ts` | 52 | 0 |  | Mafateeh Cloudflare Worker — v36 durable in-app audiobook builder. |
| `public/reader-audiobook-builder.js` | 167 | 0 |  | مفاتيح الثروة — In-App Gemini Mixed Audiobook Builder v36 Charon (Narrator) + Kore (Guide) · key is memory-only · each chapter saves to R2 immediately. |
| `scripts/generate-saved-audiobook.mjs` | 40 | 0 |  | — |
| `scripts/apply-book-routing-hardening.mjs` | 176 | 0 |  | — |
| `scripts/apply-v38-audio-scroll-containment.mjs` | 155 | 0 |  | Mobile viewport and native overflow fallbacks. |
| `scripts/apply-v32-reader-fixes.mjs` | 83 | 0 |  | Master v32 — distraction-free reading + iOS modal scrolling |
| `scripts/apply-v34-scroll-fixes.mjs` | 70 | 0 |  | Master v34 — Safari/iPhone scroll stability |
| `scripts/apply-v35-scroll-fixes.mjs` | 68 | 0 |  | Master v35 — unified iPhone tool-sheet scrolling |
| `scripts/generate-audio-timings.mjs` | 116 | 0 |  | — |
| `app/api/ai/pdf/route.ts` | 55 | 1 |  | This is a per-upload-part safety ceiling, not a book-size ceiling. V24 splits books in the browser and can process any number of parts sequentially. |
| `scripts/apply-v33-ios-fixes.mjs` | 52 | 0 |  | Master v33 — iOS gesture ownership |
| `public/sw.js` | 127 | 0 |  | — |
| `scripts/apply-v36-audio-sheet-scroll-fix.mjs` | 61 | 0 |  | Register the real audio modal with the legacy master runtime as a fallback. The dedicated window-level touch guard below remains authoritative on mobile. |
| `scripts/apply-v37-stable-reader-architecture.mjs` | 71 | 0 |  | v37 is based on the user-provided stable Reader v12 behavior: browser-native scrolling, no document-level touch interception, and the |
| `scripts/apply-book-picker-failsafe.mjs` | 55 | 0 |  | — |
| `scripts/apply-v36-audiobook-builder.mjs` | 66 | 0 |  | — |
| `public/reader-audio-touch-guard.js` | 69 | 0 |  | Mafateeh v36.4 — dedicated mobile audio modal touch guard. Owns vertical gestures before legacy document-level handlers can route them to the book. |
| `scripts/apply-modified-book.mjs` | 52 | 0 |  | — |
| `scripts/patch-gemini-audio-parser.mjs` | 50 | 0 |  | — |
| `app/chatgpt-auth.ts` | 87 | 5 |  | — |
| `public/piper-worker.js` | 44 | 0 |  | مفاتيح الثروة — Piper Worker Piper يعمل محليًا في المتصفح بعد تنزيل نموذج ar_JO-kareem-medium. النص لا يُرسل إلى خادم التطبيق أو مزود سحابي في هذا الوضع. |
| `scripts/apply-standalone-book-pages.mjs` | 34 | 0 |  | — |
| `scripts/verify-mixed-audiobook.mjs` | 30 | 0 |  | — |
| `app/api/tts/route.ts` | 66 | 2 |  | Backward-compatible legacy endpoint. New clients should use /api/ai/tts. Keeping this route thin prevents the Gemini request, origin checks, WAV conversion and retry logic from drifting away from the canonical AI impleme |
| `vite.config.ts` | 65 | 0 |  | — |
| `app/api/ai/tts/route.ts` | 16 | 1 |  | — |
| `app/api/ai/chat/route.ts` | 14 | 1 |  | — |
| `app/page.tsx` | 25 | 1 |  | Internal workspace sites can read the authenticated OpenAI user from the forwarded request headers:  import { headers } from "next/headers";  export default async function Home() { const requestHeaders = await headers(); |
| `app/layout.tsx` | 33 | 2 |  | — |
| `app/api/ai/status/route.ts` | 9 | 1 |  | — |
| `eslint.config.mjs` | 19 | 0 |  | Override default ignores of eslint-config-next. |
| `db/index.ts` | 14 | 1 |  | — |
| `db/schema.ts` | 5 | 0 |  | Intentionally empty by default. Add Drizzle tables here when the site actually needs a database. See examples/d1/db/schema.ts for an opt-in example. |
| `drizzle.config.ts` | 8 | 0 |  | — |
| `next.config.ts` | 8 | 0 |  | config options here |
| `postcss.config.mjs` | 8 | 0 |  | — |

## 6. الاختبارات (8)

- `tests/stable-reader-v37-regression.test.mjs` (73 سطراً) 
- `tests/reference-ui-capabilities.test.mjs` (69 سطراً) Visual identity baseline extracted from the user-provided reference archives (ه١/ه٣/ه٤).
- `tests/multi-book-library-regression.test.mjs` (51 سطراً) 
- `tests/scroll-v34-regression.test.mjs` (31 سطراً) 
- `tests/audiobook-v36-regression.test.mjs` (12 سطراً) 
- `tests/scroll-v35-regression.test.mjs` (25 سطراً) 
- `tests/scroll-regressions.test.mjs` (21 سطراً) 
- `tests/audio-sheet-scroll-v36-regression.test.mjs` (25 سطراً) 

## 7. المخططات والبيانات

- `db/schema.ts`

## 8. المسارات والعمّال وواجهات API

- `public/sw.js: addEventListener("fetch"`

## 9. مواد الذكاء الاصطناعي والوكلاء

- لا مهارات أو مطالبات أو مجالس ظاهرة.

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `main`، `package-source-20260823`، `review-v31`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| قارئ الكتب | عرض كتاب فصلاً فصلاً مع بحث | طبقة مشتركة (المعرفة) | عام | لم يُنقل؛ النمط نفسه في عامل kosif-standards-library | mafateeh-al-tharwa | knowledge/books قارئ | Rebuild (قارئ المكتبة) — Relocate الفكرة | فتح كتاب من catalog.json والبحث فيه | P9 |
| بوابة ذكاء على الخادم بحد معدل | استدعاء Gemini/OpenAI من الخادم مع تحقق المصدر وحد المعدل | طبقة AI | عام | نمط رسائل الأخطاء منقول | cloude: capabilities-v2 provider registry | AI Provider Bridge | Merge (النمط) | — | P7 |

# جسر واتساب — Cloudflare Worker + Container + Baileys

```
ChatGPT / Claude ──HTTPS + كلمة سر──► Worker (wa-kosif)
                                        │
                                        ▼
                         Durable Object "WaBridge"  ◄── يحفظ جلسة واتساب (SQLite)
                                        │
                                        ▼
                         Container: Baileys (Node) ──► WhatsApp
```

- مفيش متصفح. Baileys بيتصل بواتساب مباشرة.
- جلسة واتساب **مش محفوظة على قرص الـ Container**. بتتحفظ في تخزين الـ Durable Object. ولو الـ Container وقف أو اتنقل، الـ Durable Object بيرجّع له الجلسة وهو بيقوم تاني، ومش هتحتاج QR جديد.
- الـ Container **مش شغال 24 ساعة**. بيقوم لما يوصله طلب، وبيقفل بعد 10 دقائق من غير أي طلبات (`sleepAfter`)، وده بيقلّل التكلفة.

## الروابط

| الرابط | الوظيفة |
|---|---|
| `GET /pair?key=API_KEY` | صفحة QR لأول ربط. بعد ما الربط ينجح بتقول "تم الربط" ومبتطلعش QR تاني |
| `POST /send` | `{"to":"201012345678","message":"..."}` مع `Authorization: Bearer API_KEY` |
| `POST /send-media` | ملف واحد: `fileUrl` أو `fileBase64` أو `stored` (`cv-ar` / `cv-en`) |
| `POST /send-bundle` | رسالة + لحد 9 ملفات لنفس الرقم في طلب واحد (أسرع طريقة). تحت |
| `GET /jobs/<key>` | نتيجة الإرسال لمفتاح `idempotencyKey` معيّن |
| `GET /status` | الرقم مربوط ولا لأ |
| `POST /logout` | يفك الربط ويمسح الجلسة المحفوظة |
| `GET /openapi.json` | مواصفات الـ API لإضافتها كـ Action في ChatGPT |

الرقم يتكتب بالصيغة الدولية (مثال: `201012345678`)، أو بالصيغة المصرية المحلية (مثال: `01012345678`) وهيتحوّل تلقائياً.

## `/send-bundle` — رسالة + ملفات في طلب واحد

```json
{
  "to": "201012345678",
  "message": "السلام عليكم، مرفق الـ CV",
  "attachments": ["cv-ar", "cv-en"],
  "idempotencyKey": "job-123"
}
```

- الرسالة بتتبعت الأول، وبعدها الملفات بالترتيب. البحث عن الرقم بيحصل مرة واحدة، والملفات بتتحمّل مع بعض.
- `attachments` ممكن تكون أسماء ملفات محفوظة (`"cv-ar"`) أو أوبجكت فيه `stored` أو `r2Key` أو `fileUrl` أو `fileBase64`، ومعاه `filename` و`mimetype` و`caption`.
- لو ملف محفوظ مش موجود في R2 بيرجع **424** ومفيش حاجة بتتبعت خالص.
- لو عنصر فشل في النص، الإرسال بيقف عنده ويرجع **502**، ومعاه `results` بتقول إيه اتبعت وإيه لأ.
- **`idempotencyKey`** (أو هيدر `Idempotency-Key`): لو نفس المفتاح اتبعت تاني بعد ما نجح بيرجع `duplicate: true` ومش بيبعت حاجة. ولو كان فشل في النص، بيبعت العناصر الناقصة بس. آخر 500 مفتاح بيتحفظوا في الـ Durable Object.

### السرعة
- مفيش انتظار 1.5 ثانية قبل الرد. حفظ الجلسة بيحصل بعد الرد (`ctx.waitUntil`)، ومرة واحدة لكل حزمة، ومتسلسل علشان مفيش حفظين يتداخلوا.
- قبل ما الـ Container ينام (`onActivityExpired`) الجلسة بتتحفظ مرة أخيرة.

### الملفات المحفوظة (R2)
الـ Worker مربوط بالـ bucket `wa-kosif-files` باسم `FILES`. ارفع الـ CVs مرة واحدة:

```sh
npx wrangler r2 object put wa-kosif-files/cv/CV-Arabic.pdf  --file CV-Arabic.pdf  --content-type application/pdf --remote
npx wrangler r2 object put wa-kosif-files/cv/CV-English.pdf --file CV-English.pdf --content-type application/pdf --remote
```

الأسماء المختصرة (`cv-ar` و`cv-en`) معرّفة في `STORED` في `src/index.ts`.

## الـ Workers التانية (`workers/`)

| المجلد | الـ Worker | Secrets |
|---|---|---|
| `workers/dispatch` | `wa-kosif-dispatch` — رقم واحد يتبعت فوراً، وأكتر من رقم (لحد 30) يدخل الـ queue بفواصل عشوائية | `BRIDGE_KEY`, `DISPATCH_TOKEN_SHA256` |
| `workers/queue-consumer` | `wa-kosif-queue-consumer` — بيبعت كل عنصر في الـ queue على `/send-bundle` بالـ `idempotencyKey` بتاعه | `BRIDGE_KEY` |
| `workers/mcp` | `wa-kosif-mcp` — MCP للـ Plugin (فيه `send_whatsapp_bundle` و`get_whatsapp_job`) | — |

- الـ dispatcher بيرجع `batchId`، وبتعرف حالة الدفعة من `GET /batch/<batchId>?count=N`.
- الـ queue consumer بقى بيكلّم الجسر مباشرة عن طريق service binding، ومسار `/internal-send` اللي كان من غير مصادقة اتشال.
- كل Worker بيتنشر من المجلد بتاعه: `npx wrangler deploy` (والـ secrets بـ `npx wrangler secret put NAME`).

## الاختبارات

```sh
npm ci && (cd container && npm ci) && npm test
```

بتشغّل `container/server.mjs` الحقيقي مع Baileys وهمي، والـ Worker والـ Durable Object فوقه، والـ dispatcher والـ queue consumer والـ MCP.

## خطوات النشر (Workers Builds)

1. في Cloudflare لازم يكون عندك **Workers Paid**. الـ 5 دولار حد أدنى، واستهلاك الـ Container بيتحسب زيادة حسب الذاكرة والمعالج ووقت التشغيل.
2. Workers & Pages ← Create ← **Import a repository** ← اختار `cloude`.
   - **Root directory**: `whatsapp-bridge`
   - **Build command**: `npm ci`
   - **Deploy command**: `npx wrangler deploy`
   - **Branch**: الفرع اللي فيه الكود.
3. كلمة السر (`API_KEY`) مش محفوظة في أي مكان. اللي محفوظ في `wrangler.jsonc` هو بصمتها SHA-256 بس (`API_KEY_SHA256`). علشان تغيّرها: `printf %s 'NEW_KEY' | sha256sum` وحط الناتج مكان القيمة القديمة وانشر تاني.
4. افتح `https://wa-kosif.<subdomain>.workers.dev/pair?key=API_KEY`. أول تشغيل ممكن ياخد دقيقة أو أكتر. امسح الـ QR من: واتساب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز.

أو من جهازك (محتاج Docker): `npm ci && npx wrangler deploy`

النشر الحالي شغال من workflow `deploy-whatsapp-bridge.yml` في repo `kosif-audit-studio`، لأن `CLOUDFLARE_API_TOKEN` محفوظ هناك.

## ربطه بـ ChatGPT

1. ChatGPT ← Explore GPTs ← Create ← Configure ← **Create new action**.
2. **Import from URL**: `https://wa-kosif.<subdomain>.workers.dev/openapi.json`
3. **Authentication**: API Key ← Auth Type: **Bearer** ← حط قيمة `API_KEY`.
4. في التعليمات اكتب مثلاً: "لما أطلب إرسال رسالة واتساب، استخدم sendWhatsAppMessage بالرقم الدولي والنص. أكّد معايا الرقم والنص قبل الإرسال."

## تنبيهات

- Baileys **مش API رسمي** من واتساب. لو بعتّ رسايل كتير أو لأرقام مش حافظاك، الرقم ممكن يتحظر.
- أي حد معاه `API_KEY` يقدر يبعت من رقمك. لو اتسربت، غيّرها فوراً، وممكن تفك الربط من الموبايل (الأجهزة المرتبطة).
- لو الموبايل الأساسي فضل أكتر من 14 يوم من غير ما يفتح واتساب، واتساب بيفك ربط الأجهزة المرتبطة، وساعتها افتح `/pair` تاني.

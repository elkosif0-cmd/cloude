# KOSIF Contact Sync — اختصار الآيفون (Cloudflare → iPhone)

الاختصار السريع يعالج **الـPending فقط**: طلب GET واحد، ثم إضافة جهات الاتصال المعلّقة وإبلاغ Cloudflare.
لا `Find All Contacts`، ولا رفع دليل الهاتف، ولا TinyFish.

## 1. سبب ظهور "KOSIF: No new contacts." رغم وجود خالد

تم فحص الـWorker الحي `wa-kosif` مباشرة:

| الطلب | الرد |
|---|---|
| `GET /contact-sync/pending` بدون مفتاح | `401` و`{"error":"unauthorized"}` |
| بمفتاح خاطئ أو `Bearer` فارغ | `401` و`{"error":"unauthorized"}` |
| بمفتاح صحيح | `200` و`{"contacts":[…]}` |

رد الخطأ **لا يحتوي مفتاح `contacts`**. و`Get Contents of URL` في Shortcuts لا يفشل عند 401، بل يُرجع الجسم عاديًا.
فالاختصار القديم يقرأ `contacts` ← يجدها فارغة ← يعرض "No new contacts". هذا هو الاحتمال **D**، وسببه الفعلي واحد من:

- **A/C**: قيمة الـheader ليست `Bearer <key>` حرفيًا (مسافة ناقصة، كلمة Bearer مفقودة، اسم الـheader فيه مسافة زائدة، أو الـheader غير موجود).
- **B**: المفتاح المخزن فاضٍ، أو هو مفتاح الـBridge وليس Contact Sync key، أو **فيه سطر جديد/مسافة في آخره** (أشهر سبب عند تخزينه بـSave File)، أو المتغير يحمل Dictionary/File كاملًا بدل النص.

الـWorker لا يرسل CORS headers، لذلك لا يمكن اختبار الـendpoint من صفحة ويب على الآيفون؛ الاختصار أو `curl` فقط.

## 2. التحقق من Cloudflare (قبل وبعد) دون لمس الطابور

```bash
CONTACT_SYNC_API_KEY='<المفتاح>' tools/contact-sync-check.sh
```

يطبع `pendingContactsCount` وأسماء الـPending. يستخدم GET فقط، فلا يغيّر حالة خالد. ويحذّر إن كان في المفتاح مسافات أو سطر جديد.

## 3. بناء الاختصار Action-by-Action

أسماء الـActions بالإنجليزية كما في Shortcuts (بين قوسين المعنى). المتغيرات بخط `code`.

### أ. الإعداد (مرة واحدة ثم تلقائي)

1. **Text** `https://wa-kosif.kosif199022.workers.dev/contact-sync/pending` ← **Set Variable** `download_url`
2. **Text** `https://wa-kosif.kosif199022.workers.dev/contact-sync/complete` ← **Set Variable** `completion_url`
3. **Get File** من مجلد Shortcuts: `KOSIF/contact-sync-key.txt` — أطفئ *Error If Not Found*.
4. **If** (Get File) **does not have any value**:
   - **Ask for Input** (Text) بعنوان `Contact Sync API Key`
   - **Save File** إلى `KOSIF/contact-sync-key.txt`، *Ask Where to Save* مطفأ، *Overwrite* مفعّل.
   - **End If**
5. **Get File** `KOSIF/contact-sync-key.txt` مرة ثانية ← **Get Text from Input**
6. **Replace Text**: ابحث عن `\s` (فعّل *Regular Expression*) واستبدله بلا شيء ← **Set Variable** `api_key`
   (هذا يزيل السطر الجديد والمسافات؛ المفتاح نفسه لا يحتوي مسافات.)

> لو الاختصار الحالي يخزّن الإعداد بطريقة أخرى (Data Jar أو ملف JSON) فلا بأس بإبقائها، المهم أن ينتهي `api_key` **نصًا نظيفًا** وليس Dictionary أو File. لو كان الإعداد Dictionary استخدم **Get Dictionary Value** `api_key` ثم خطوة 6.

### ب. طلب الـPending (GET واحد)

7. **Get Contents of URL** — URL: `download_url`
   - Method: **GET**، بدون Request Body
   - Headers:
     - `Authorization` = `Bearer ` ثم متغير `api_key` (كلمة Bearer، مسافة واحدة، ثم المتغير — داخل حقل واحد)
     - `Accept` = `application/json`
   - **Set Variable** `pending_response`
8. **[DEBUG مؤقت]** **Quick Look** `pending_response` — احذفه بعد نجاح الاختبار.
9. **Get Dictionary from Input** (`pending_response`) ← **Set Variable** `response_dict`

### ج. فحص الأخطاء بالترتيب الصحيح

10. **Get Dictionary Value** — *Value* for `error` in `response_dict`
    - **If** has any value ← **Show Alert** `KOSIF Cloudflare Error: ` + القيمة ← **Stop This Shortcut** ← **End If**
11. **Get Dictionary Value** — *All Keys* in `response_dict` ← **Combine Text** (بفاصل مسافة)
    - **If** does not contain `contacts` ← **Show Alert** `KOSIF Error: Invalid Cloudflare response.` ← **Stop This Shortcut** ← **End If**
    - لا تستخدم "does not have any value" على `contacts` هنا: القائمة الفارغة `[]` قد تُعتبر "بلا قيمة" فتظهر رسالة خاطئة.
12. **Get Dictionary Value** — *Value* for `contacts` in `response_dict` ← **Set Variable** `pending_contacts`
13. **Count** Items in `pending_contacts`
    - **If** Count **is** `0` ← **Show Notification** `KOSIF: No new contacts.` ← **Stop This Shortcut** ← **End If**

### د. معالجة كل Pending

14. **Number** `0` ← **Set Variable** `added`؛ ونفس الشيء لـ`skipped` و`failed`.
15. **Repeat with Each** item in `pending_contacts`:
    1. **Get Dictionary Value** `id` من *Repeat Item* ← **Set Variable** `pending_id`
    2. **Get Dictionary Value** `name` من *Repeat Item* ← **Set Variable** `pending_name`
    3. **Get Dictionary Value** `phone` من *Repeat Item* ← **Replace Text** `[^0-9]` (Regex) بلا شيء ← **Set Variable** `phone_digits`
    4. **Match Text** `\d{9}$` في `phone_digits` ← **Get Item from List** (First Item) ← **Set Variable** `phone_key`
       آخر 9 أرقام تجعل هذه الصيغ متساوية: `+966 5X…` / `9665X…` / `05X…`، وكذلك `+7 996 408-16-69` / `79964081669` / `8 996…`.
    5. **Text** `+` ثم `phone_digits` ← **Set Variable** `phone_e164`
    6. **Find Contacts** — Filter: *Phone Number* **contains** `phone_key`، *Limit* مفعّل = 1
       (بحث iOS مفلتر على رقم واحد؛ لا يمر على الدليل كله داخل الاختصار.)
    7. **If** (Contacts) **has any value**:
       - **Text** `skipped` ← **Set Variable** `contact_status`
       - **Otherwise**
       - **Add New Contact** — First Name: `pending_name`، Phone: `phone_e164`، *Show Compose Sheet* مطفأ
       - **Text** `done` ← **Set Variable** `contact_status`
       - **End If**
    8. **Get Contents of URL** — URL: `completion_url`، Method: **POST**
       - Headers: `Authorization` = `Bearer ` + `api_key`، و`Content-Type` = `application/json`
       - Request Body: **JSON** — `id` (Text) = `pending_id`، `status` (Text) = `contact_status`
    9. **Get Dictionary Value** `error` من رد الـPOST:
       - **If** has any value ← **Calculate** `failed + 1` ← **Set Variable** `failed`
       - **Otherwise** ← **If** `contact_status` is `done` ← `added + 1` ← Set `added`، **Otherwise** ← `skipped + 1` ← Set `skipped` ← End If
       - **End If**
16. **End Repeat**

### هـ. الملخص

17. **Show Alert**:
    ```
    KOSIF Contact Sync Complete
    Added: [added]
    Skipped: [skipped]
    Failed: [failed]
    ```

## 4. اختبار خالد (Success Criteria)

1. قبل التشغيل: `tools/contact-sync-check.sh` ← يجب `pendingContactsCount = 1` ويظهر `خالد القصيف روسيا  +79964081669`.
2. شغّل الاختصار. الـQuick Look يجب أن يعرض `{"contacts":[{… "name":"خالد القصيف روسيا" …}]}`.
   - لو عرض `{"error":"unauthorized"}`: احذف `KOSIF/contact-sync-key.txt` من ملفات Shortcuts وأعد التشغيل وألصق **Contact Sync key** (ليس مفتاح الـBridge).
3. الملخص: `Added: 1`.
4. بعد التشغيل: `tools/contact-sync-check.sh` ← `pendingContactsCount = 0`.
5. في Contacts: ابحث عن "خالد القصيف" ← الرقم `+7 996 408-16-69`.
6. اختبار الـduplicate: أنشئ اختصارًا مؤقتًا من خطوة واحدة **Find Contacts** (Phone Number contains `964081669`) ← يجب أن يرجع خالد. لو لم يرجعه فمطابقة iOS لا تتجاهل التنسيق، ويجب تغيير خطوة 15.6 قبل الاعتماد على منع التكرار.
7. احذف خطوة **Quick Look** (8).

## 5. ممنوع في هذا الاختصار

`Find All Contacts`، أي Repeat على دليل الهاتف كاملًا، vCard لكل الأسماء، رفع الدليل، TinyFish، أتمتة المتصفح.
الرفع الكامل iPhone → Cloudflare يكون اختصارًا منفصلًا (`KOSIF Full Contact Upload`) لاحقًا.

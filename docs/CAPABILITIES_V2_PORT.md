# S.kosif — نقل قدرات kosif-stable-capabilities-v2

تمت مراجعة مصدر GitHub المرتبط بقدرات v2 في:
`kosif199022-jpg/kosif-audit-studio`، الفرع `codex/cloudflare-access-auth-v1`.
الـWorker المنشور على Cloudflare يعرض نفس البصمات الأساسية التي ظهرت في المصدر:
`ROLE_PERMISSIONS` و`authorizeRole` و`normalizeWorkspaceState` و`verifyCloudflareAccessSubject`.

## القدرات المنقولة

- Cloudflare Access JWT verification باستخدام RS256 وJWKs من نطاق Access.
- هوية بديلة آمنة من `oai-authenticated-user-email` عندما يمر الطلب من منصة موثوقة.
- عزل متعدد المستأجرين tenant-scoped.
- RBAC: owner / partner / manager / senior / viewer.
- Session endpoint يعيد الدور والصلاحيات الفعلية.
- Provider registry لـ KOSIF المحلي وJev وGemini وOpenAI وClaude بدون كشف الأسرار.
- إنشاء/قائمة/قراءة/أرشفة مساحات العمل.
- حفظ Workspace state بقائمة مفاتيح مسموحة وحظر صريح للأسرار والبيانات الخام الحساسة.
- حد 128 KiB لحالة مساحة العمل.
- optimistic concurrency عبر `base_revision` و409 عند التعارض.
- SHA-256 canonical hashing وحساب stable IDs.
- append-only audit chain وفحص integrity كامل.
- منع الكتابة بعد الأرشفة.
- secure headers وCSP وسياسة no-store للـAPI.

## ملفات النقل

- `capabilities-v2/worker.js` — Worker الخادمي.
- `capabilities-v2/schema.sql` — D1 schema.
- `wrangler.capabilities-v2.toml` — قالب نشر منفصل.
- `ui/capabilities-v2.js` و`ui/capabilities-v2.css` — عميل S.kosif ومركز القدرات.

## حدود مقصودة

هذا النقل لا يضع مفاتيح مزودي الذكاء الاصطناعي في المتصفح. كما لا يرفع العملاء أو الطلبات أو أرقام الجوال أو المرفقات داخل snapshot مساحة العمل. البيانات التشغيلية الحساسة تحتاج جداول D1 مخصصة بعقود وصلاحيات مستقلة، وليس JSON عام.

حتى يتم ربط D1 وCloudflare Access في Worker الجديد، مركز القدرات يعمل محليًا مع نفس مبادئ revision/hash/integrity، ثم يتحول تلقائيًا إلى الخادم عند ضبط عنوان API.

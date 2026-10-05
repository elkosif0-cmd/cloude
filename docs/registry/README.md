# السجلات الرسمية — docs/registry

المكان الذي يحيل إليه `FOUNDATION.md` §0.1 (الخطوة 3 من مسار القراءة) لكل ما جُرد واعتُمد.

| الملف | ما هو | كيف يُحدَّث |
|---|---|---|
| [`CAPABILITY_MIGRATION_MATRIX_ar.md`](CAPABILITY_MIGRATION_MATRIX_ar.md) + [`capability-migration-matrix.json`](capability-migration-matrix.json) | مصفوفة ترحيل القدرات (FOUNDATION §0.0.0): الشاشات الـ78، كل محرك، خدمات المنصة، المستودعات الـ17 بتغطيتها، الـPRs المفتوحة، الفروع كلها — بقرار لكل أصل | `python tools/capability_matrix.py` (لقطة مؤرخة) |
| [`CURRENT_STATE_2026-10-06_ar.md`](CURRENT_STATE_2026-10-06_ar.md) | تقرير الحالة مقابل الدستور بتاريخ التنفيذ (PRODUCT_MANDATE §12): لكل موجة P0–P10 ما هو منفذ وما ينقص، وما أغلقه آخر طلب دمج | يدوياً مع كل موجة |
| [`EXTERNAL_BACKLOG_ar.md`](EXTERNAL_BACKLOG_ar.md) | ما يتوقعه السوق (ZATCA، التغذية البنكية، OCR، الإقفال…) وما لدينا منه | يدوياً |
| `../rebuild/CAPABILITY_BASELINE.txt` | خط أساس المعرّفات: لا تُحذف قدرة دون قرار صريح (CI) | في التغيير نفسه الذي يضيف قدرة |
| `../rebuild/SYSTEM_CAPABILITY_INVENTORY.md`, `../rebuild/NEW_CAPABILITY_MAP.md` | جرد الشاشات وخريطتها من السجل | `python tools/capability_docs.py` (CI يتحقق) |
| `../product/capability-source-registry.json` | سجل مصادر القدرات من المستودعات (الوكيل الآخر) | يدوياً |

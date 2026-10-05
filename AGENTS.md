# اقرأ هذا أولاً

اقرأ [FOUNDATION.md](FOUNDATION.md) لمبادئ المنصة الموحدة والحماية وحفظ القدرات، ثم التكليف التفصيلي أدناه؛ يحددان معًا أحدث هيكل دخول وخطة قبول دون تعارض.

**ملف إلزامي لأي وكيل أو مساهم:** [`docs/PRODUCT_MANDATE_ar.md`](docs/PRODUCT_MANDATE_ar.md) — هيكل الدخول الذي طلبه المالك (ثلاثة مداخل:
البرنامج المحاسبي الكامل مع الشركات النموذجية من الحزمة، المراجعة بجولات ومطابقة الحقائق المنشورة مع فصلها عن الاستنتاج المستقل، الأدوات المساعدة)، وأين وصلنا،
وخطة الإتمام الملزمة M1–M7. نص الرؤية الأقدم محفوظ في [`docs/VISION_ar.md`](docs/VISION_ar.md)؛ عند تعارض عدد المداخل يُتبع التوضيح الأحدث في التكليف. ما يخالف التكليف لا يُدمج.

Mandatory for every agent and contributor: read `docs/PRODUCT_MANDATE_ar.md` before changing anything. It fixes the
three entry modes the owner asked for (full accounting program with the bundle's model companies, audit with rounds and
source-fact replay separated from independent audit conclusions, helper tools), the honest status of each, and the binding plan M1–M7.

## Acceptance and evidence boundaries

Read [the code-evidence gap matrix and acceptance plan](docs/product/THREE_ENTRY_IMPLEMENTATION_GAPS_AR.md) with the mandate. The plan retains M1–M7 and adds a P0 company/user/conversation/provider-context isolation gate before new imports or AI sharing. Preserve legacy history until ownership and recovery-safe migration are verified. Published statements must not be turned into invented complete transaction ledgers or treated as client audit evidence.

Preserve existing capabilities, protected access, deep links and applicable nested instructions. In every relevant PR, name the requirement, data/permission boundary, source lineage, migration impact, exact checks run on the final commit, and remaining gaps. Read README and the applicable workflow commands before selecting tests. Do not silently bypass the current four-gateway runtime contract; reconcile it in the reviewed runtime migration.

These are contribution requirements for tools and people that read repository instructions. They do not technically force every external agent to read them, and documentation alone does not create a CI gate or prove implementation is complete.

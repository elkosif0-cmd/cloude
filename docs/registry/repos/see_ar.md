# see — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `158e31c`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/see` — عام · اللغة الرئيسية TypeScript · 401 ك.ب على GitHub · آخر دفع 2026-09-05 · الفرع الافتراضي `main`
- الوصف على GitHub: —
- النسخة المفحوصة: **224 ملفاً** (0.5 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 7 · طلبات الدمج المفتوحة: 1 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **عميق — قُرئ عند الدمج وأُعيد مسحه اليوم؛ الـPR المفتوح يُفحص في تقرير المستودع**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `apps` | 68 | 295 ك.ب |
| `docs` | 10 | 118 ك.ب |
| `packages` | 125 | 69 ك.ب |
| `tests` | 19 | 22 ك.ب |
| `(root)` | 2 | 4 ك.ب |

الامتدادات: `.ts` 163، `.tsx` 27، `.md` 15، `.sql` 5، `.json` 4، `.css` 3، `.svg` 2، `.html` 1، `.jsonc` 1، `.webmanifest` 1، `.js` 1، `(بلا)` 1

نقاط الدخول والإعداد:

- `apps/cloudflare/index.html`
- `apps/cloudflare/package.json`
- `apps/cloudflare/public/manifest.webmanifest`
- `package.json`
- package.json — deps: —; devDeps: —

سكربتات package.json: `dev`: npm --workspace @see/cloudflare run dev؛ `test`: node --experimental-strip-types --test tests/*.test.ts؛ `typecheck`: npm --workspace @see/cloudflare run typecheck؛ `build`: npm --workspace @see/cloudflare run build؛ `deploy`: npm --workspace @see/cloudflare run deploy

## 4. README (`README.md`، أول الأسطر)

    # SEE — Advanced Financial Audit Operating System
    SEE is a traceable, AI-assisted financial audit workspace. It is designed as a professional audit operating system rather than a chat application.
    ## Architecture principles
    - Evidence before conclusion
    - Human approval for critical professional judgments
    - Deterministic financial calculations
    - Full provenance and version tracking
    - No silent mutation of approved records
    - AI remains advisory unless an explicitly authorized human gate is satisfied
    ## Phase A — unified governed pilot
    Phase A establishes the first end-to-end operating layer while preserving the existing pilot API. It includes:
    - Five-workspace Arabic RTL shell: Command Center, Audit, Analytics, AI Council, and More
    - Engagement lifecycle with recorded revisions and guarded transitions
    - Trial Balance ingestion and deterministic balance validation
    - Human-approved account mapping and materiality workflows
    - Risk assessment, PBC requests, procedures, procedure runs, workpapers, and review notes
    - Evidence storage in R2 with SHA-256 metadata in D1
    - Evidence trace links and an accessible trace graph foundation
    - Deterministic readiness and analytics projections with explicit method/version labels
    - Versioned report shell with readiness snapshots and Partner-only approval gate
    - Governed AI Council shell with evidence metadata snapshots and human-review gates
    - Append-only audit events for professional workflow actions
    - Additive D1 migrations; legacy `/api/...` routes remain available alongside `/api/v1/...`
    ### AI Council boundary
    The Phase A Council is a governance and workflow shell. It does **not** call an external model provider and does **not** have authority to approve materiality, post entries, issue a statutory audit op
    ### Capabilities intentionally deferred
    Provider-routed AI execution, standards RAG, full GL/reconciliation engines, tenant identity/RBAC expansion, client portal workflows, offline capture, advanced analytics, and final archive-lock infras
    ## Demo versus real data
    `/api/demo` creates clearly labelled demonstration records, including a PBC request, procedure/run, draft workpaper, open review note, evidence link, and a prepared Council run. The demo deliberately 
    The public pilot configuration may allow demo creation. **Do not upload real client data until access controls are configured for the deployment.** Set the Cloudflare Worker secret `APP_ACCESS_TOKEN` 
    ## Local verification
    From the repository root:
    ```bash
    npm install
    npm --workspace @see/cloudflare run db:check
    npm test
    npm run typecheck
    npm run build
    ```
    For local Cloudflare development:
    ```bash
    npm --workspace @see/cloudflare run dev
    ```
    `db:check` applies all D1 migrations to the local Wrangler database so SQL changes are validated before production deployment.
    ## Production deployment

## 5. الوحدات المصدرية

179 وحدة (الأكبر أولاً؛ تُعرض 140). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `apps/cloudflare/worker/index.ts` | 290 | 0 |  | — |
| `apps/cloudflare/src/components/AuditWorkspace.tsx` | 121 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/fieldwork.ts` | 232 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/journal.ts` | 133 | 1 |  | — |
| `apps/cloudflare/src/components/MoreWorkspace.tsx` | 113 | 1 |  | — |
| `apps/cloudflare/src/components/JournalWorkspace.tsx` | 149 | 1 |  | — |
| `apps/cloudflare/src/App.tsx` | 156 | 1 |  | — |
| `apps/cloudflare/src/components/EvidenceTrace.tsx` | 113 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/dashboard.ts` | 186 | 1 |  | — |
| `apps/cloudflare/src/api.ts` | 118 | 6 |  | — |
| `apps/cloudflare/src/components/CouncilWorkspace.tsx` | 110 | 1 |  | — |
| `apps/cloudflare/src/components/CommandCenter.tsx` | 44 | 1 |  | — |
| `apps/cloudflare/src/components/AppShell.tsx` | 124 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/trace.ts` | 102 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/demo-seed.ts` | 174 | 2 |  | — |
| `apps/cloudflare/worker/phase-a/council.ts` | 105 | 1 |  | — |
| `apps/cloudflare/src/components/StandardsWorkspace.tsx` | 69 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/lifecycle.ts` | 113 | 1 |  | — |
| `packages/domain/src/lifecycle.ts` | 221 | 16 |  | — |
| `apps/cloudflare/migrations/0002_phase_a.sql` | 140 | 0 |  | — |
| `apps/cloudflare/src/types.ts` | 149 | 19 |  | — |
| `apps/cloudflare/src/navigation.ts` | 96 | 10 |  | — |
| `apps/cloudflare/migrations/0003_kosif_port.sql` | 121 | 0 |  | — |
| `apps/cloudflare/src/components/AnalyticsCenter.tsx` | 30 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/pbc.ts` | 70 | 1 |  | — |
| `packages/audit-engine/src/sampling.ts` | 114 | 5 |  | — |
| `apps/cloudflare/worker/phase-a/demo-kosif-seed.ts` | 47 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/rounds.ts` | 55 | 1 |  | — |
| `apps/cloudflare/src/components/RoundsWorkspace.tsx` | 61 | 1 |  | — |
| `packages/audit-engine/src/classification.ts` | 61 | 4 |  | — |
| `apps/cloudflare/worker/phase-a/reporting.ts` | 62 | 1 |  | — |
| `packages/audit-engine/src/cloudflare-core.ts` | 101 | 9 |  | — |
| `packages/audit-engine/src/readiness.ts` | 86 | 4 |  | — |
| `apps/cloudflare/migrations/0001_init.sql` | 101 | 0 |  | — |
| `apps/cloudflare/worker/phase-a/standards.ts` | 46 | 1 |  | — |
| `packages/audit-engine/src/journal-signals.ts` | 108 | 7 |  | — |
| `packages/audit-engine/src/standards.ts` | 79 | 4 |  | — |
| `packages/audit-engine/src/rounds.ts` | 38 | 8 |  | — |
| `apps/cloudflare/src/components/ReviewNotesPanel.tsx` | 57 | 1 |  | — |
| `apps/cloudflare/worker/phase-a/router.ts` | 49 | 2 |  | — |
| `packages/audit-engine/src/money.ts` | 56 | 3 |  | — |
| `apps/cloudflare/worker/entry.ts` | 49 | 0 |  | — |
| `packages/audit-engine/src/analytics-summary.ts` | 50 | 3 |  | — |
| `apps/cloudflare/worker/phase-a/types.ts` | 58 | 8 |  | — |
| `apps/cloudflare/public/sw.js` | 37 | 0 |  | — |
| `apps/cloudflare/src/components/Status.tsx` | 20 | 4 |  | — |
| `apps/cloudflare/index.html` | 23 | 0 |  | <title> SEE — Audit Operating System |
| `packages/ai-gateway/src/extended-council.ts` | 38 | 3 |  | — |
| `apps/cloudflare/worker/phase-a/kosif-metrics.ts` | 36 | 2 |  | — |
| `apps/cloudflare/worker/phase-a/events.ts` | 36 | 5 |  | — |
| `apps/cloudflare/src/review-notes.ts` | 30 | 3 |  | — |
| `packages/audit-engine/src/text-normalization.ts` | 22 | 2 |  | — |
| `packages/domain/src/audit-model.ts` | 43 | 6 |  | — |
| `packages/database/schema.sql` | 31 | 0 |  | — |
| `packages/demo-company/src/enterprise-dataset.ts` | 26 | 3 |  | — |
| `packages/knowledge/src/ifrs-isa-retrieval.ts` | 26 | 3 |  | — |
| `packages/ingestion/src/import-engine.ts` | 21 | 3 |  | — |
| `packages/audit-engine/src/audit-run-pipeline.ts` | 17 | 4 |  | — |
| `packages/evidence/src/evidence-graph.ts` | 24 | 3 |  | — |
| `packages/ai-gateway/src/consensus-engine.ts` | 22 | 3 |  | — |
| `apps/cloudflare/src/main.tsx` | 18 | 0 |  | — |
| `packages/workpapers/workpaper.ts` | 22 | 3 |  | — |
| `apps/web/app/page.tsx` | 18 | 1 |  | — |
| `packages/fraud/src/advanced-fraud-analytics.ts` | 20 | 3 |  | — |
| `packages/audit-engine/src/trial-balance.ts` | 18 | 2 |  | — |
| `packages/orchestrator/src/audit-orchestrator.ts` | 25 | 3 |  | — |
| `packages/reporting/src/report-readiness.ts` | 15 | 2 |  | — |
| `packages/orchestrator/src/full-audit-run.ts` | 25 | 3 |  | — |
| `packages/client-portal/src/portal-model.ts` | 20 | 3 |  | — |
| `packages/findings/src/finding-workflow.ts` | 20 | 3 |  | — |
| `packages/ai-gateway/src/council.ts` | 19 | 3 |  | — |
| `packages/api/src/audit-run-service.ts` | 19 | 4 |  | — |
| `packages/ai-gateway/src/agent-orchestrator.ts` | 22 | 3 |  | — |
| `packages/fraud/src/fraud-engine.ts` | 20 | 3 |  | — |
| `packages/audit-engine/src/end-to-end-run.ts` | 23 | 3 |  | — |
| `packages/audit-engine/src/materiality.ts` | 18 | 3 |  | — |
| `packages/security/src/tenant-isolation.ts` | 15 | 3 |  | — |
| `packages/ingestion/src/csv-parser.ts` | 12 | 2 |  | — |
| `packages/orchestrator/src/pipeline-runner.ts` | 13 | 3 |  | — |
| `packages/audit-engine/src/je-testing.ts` | 17 | 2 |  | — |
| `apps/web/app/client-portal/page.tsx` | 14 | 1 |  | — |
| `packages/mapping/src/mapping-workspace.ts` | 15 | 3 |  | — |
| `packages/ai-gateway/src/boundary.ts` | 17 | 2 |  | — |
| `packages/orchestrator/src/findings-orchestrator.ts` | 14 | 3 |  | — |
| `packages/api/src/audit-run-api.ts` | 17 | 3 |  | — |
| `packages/audit-engine/src/risk-engine.ts` | 17 | 2 |  | — |
| `packages/validation/src/data-validation.ts` | 12 | 2 |  | — |
| `apps/web/app/timeline/page.tsx` | 18 | 1 |  | — |
| `packages/audit-engine/src/financial-statements.ts` | 15 | 2 |  | — |
| `packages/evidence/src/evidence-finding-graph.ts` | 16 | 3 |  | — |
| `packages/demo-company/src/generator.ts` | 14 | 2 |  | — |
| `packages/knowledge/src/standards-graph.ts` | 21 | 2 |  | — |
| `packages/reporting/src/final-report-generator.ts` | 20 | 3 |  | — |
| `apps/worker/src/index.ts` | 18 | 0 |  | — |
| `packages/risk/src/risk-dashboard-model.ts` | 16 | 2 |  | — |
| `packages/evidence/src/finding-link-engine.ts` | 20 | 2 |  | — |
| `packages/audit-engine/src/risk-heatmap.ts` | 15 | 3 |  | — |
| `packages/orchestrator/src/execution-context.ts` | 16 | 2 |  | — |
| `packages/api/src/audit-api-contract.ts` | 17 | 3 |  | — |
| `packages/audit-log/src/event-store.ts` | 21 | 2 |  | — |
| `apps/web/app/risk-dashboard/page.tsx` | 14 | 1 |  | — |
| `packages/audit-engine/src/financial-viewer.ts` | 16 | 3 |  | — |
| `packages/audit-log/src/append-only-log.ts` | 19 | 3 |  | — |
| `packages/audit-engine/src/quality-review.ts` | 15 | 2 |  | — |
| `packages/continuous-audit/src/monitoring-engine.ts` | 16 | 2 |  | — |
| `packages/mapping/src/account-mapping.ts` | 15 | 2 |  | — |
| `packages/workpapers/src/workpaper-viewer.ts` | 12 | 2 |  | — |
| `packages/api/src/command-center-service.ts` | 11 | 2 |  | — |
| `packages/database/schema-v2.sql` | 13 | 0 |  | — |
| `packages/reporting/src/report-studio.ts` | 16 | 2 |  | — |
| `packages/api/src/engagement-service.ts` | 14 | 2 |  | — |
| `packages/audit-engine/src/anomaly-detection.ts` | 14 | 2 |  | — |
| `packages/findings/src/findings-query.ts` | 6 | 2 |  | — |
| `packages/search/src/retrieval.ts` | 13 | 2 |  | — |
| `packages/evidence/src/evidence-lifecycle.ts` | 12 | 3 |  | — |
| `packages/intelligence/src/predictive-risk.ts` | 16 | 2 |  | — |
| `packages/reporting/src/report-package.ts` | 11 | 2 |  | — |
| `packages/orchestrator/src/audit-service-binding.ts` | 10 | 3 |  | — |
| `packages/standards/src/knowledge-engine.ts` | 11 | 2 |  | — |
| `packages/audit-engine/src/trial-balance-validation.ts` | 6 | 2 |  | — |
| `packages/audit-engine/src/approval.ts` | 11 | 2 |  | — |
| `packages/workpapers/src/workpaper-review-engine.ts` | 4 | 3 |  | — |
| `packages/quality/src/review-checklist.ts` | 11 | 2 |  | — |
| `apps/web/app/command-center/page.tsx` | 10 | 1 |  | — |
| `packages/audit-engine/src/analytics.ts` | 9 | 2 |  | — |
| `packages/reporting/src/report-viewer.ts` | 15 | 2 |  | — |
| `packages/orchestrator/src/service-registry.ts` | 10 | 3 |  | — |
| `packages/audit-engine/src/control-testing.ts` | 10 | 2 |  | — |
| `packages/findings/src/finding-model.ts` | 14 | 2 |  | — |
| `packages/workflows/src/approval-gates.ts` | 11 | 2 |  | — |
| `packages/findings/src/finding-dashboard-model.ts` | 11 | 2 |  | — |
| `packages/audit-engine/src/review-cycle.ts` | 11 | 2 |  | — |
| `apps/web/app/mapping/page.tsx` | 9 | 1 |  | — |
| `packages/ingestion/src/xlsx-parser.ts` | 10 | 2 |  | — |
| `packages/storage/src/file-storage.ts` | 13 | 2 |  | — |
| `apps/web/app/engagement/page.tsx` | 9 | 1 |  | — |
| `packages/audit-engine/src/mapping-engine.ts` | 10 | 2 |  | — |
| `packages/analytics/src/benchmark-engine.ts` | 10 | 2 |  | — |
| `packages/security/src/audit-permission-policy.ts` | 8 | 2 |  | — |
| `packages/security/src/rbac.ts` | 8 | 2 |  | — |

الباقي بالمجلد: `packages/testing` 8، `apps/web` 6، `packages/api` 3، `packages/analytics` 2، `packages/ai-gateway` 2، `apps/cloudflare` 2، `packages/audit-engine` 2، `packages/findings` 2، `packages/api-contracts` 2، `packages/demo` 1، `packages/evidence` 1، `packages/workpapers` 1، `packages/reporting` 1، `packages/audit-log` 1، `packages/workflows` 1، `packages/security` 1، `packages/quality` 1، `packages/ui` 1، `apps/api` 1

## 6. الاختبارات (18)

- `tests/lifecycle.test.ts` (70 سطراً) 
- `tests/audit-core.test.ts` (55 سطراً) 
- `tests/journal-signals.test.ts` (32 سطراً) 
- `tests/demo-seed.test.ts` (31 سطراً) 
- `tests/readiness.test.ts` (42 سطراً) 
- `tests/pwa-shell.test.ts` (32 سطراً) 
- `tests/review-notes-ui.test.ts` (44 سطراً) 
- `tests/kosif-command-metrics.test.ts` (35 سطراً) 
- `tests/analytics-summary.test.ts` (35 سطراً) 
- `tests/rounds.test.ts` (15 سطراً) 
- `tests/standards.test.ts` (22 سطراً) 
- `tests/module-selection.test.ts` (18 سطراً) 
- `tests/kosif-navigation.test.ts` (28 سطراً) 
- `tests/kosif-sampling.test.ts` (19 سطراً) 
- `tests/kosif-classification.test.ts` (17 سطراً) 
- `tests/kosif-money.test.ts` (17 سطراً) 
- `tests/phase-a-contracts.test.ts` (19 سطراً) 
- `tests/reporting-ui.test.ts` (17 سطراً) 

## 7. المخططات والبيانات

- `apps/cloudflare/migrations/0002_phase_a.sql`
- `apps/cloudflare/migrations/0003_kosif_port.sql`
- `apps/cloudflare/migrations/0001_init.sql`
- `packages/database/schema.sql`
- `packages/database/schema-v2.sql`
- `packages/database/src/migrations/001_initial_notes.md`

## 8. المسارات والعمّال وواجهات API

- `apps/cloudflare/public/sw.js: addEventListener('fetch'`
- `apps/worker/src/index.ts: url.pathname === '/health`

## 9. مواد الذكاء الاصطناعي والوكلاء

- `apps/cloudflare/worker/phase-a/council.ts`
- `packages/ai-gateway/src/council.ts`

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- PR #3 (2026-09-04، مسودة) `design/see-unified-architecture`: Design: SEE unified audit operating system
- لا Issues مفتوحة.
- الفروع: `design/see-unified-architecture`، `feat/cloudflare-mvp`، `feat/see-kosif-completion`، `feat/see-kosif-full-parity`، `feat/see-phase-a-unification`، `fix/cloudflare-resource-bindings`، `main`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| التصنيف والإقرارات لكل فئة | لكل بند قوائم: المعايير والإقرارات (assertions) ومتطلبات الإفصاح | المراجعة | عام | منقول | cloude: statements-engine LINES + codex | المعايير بجوار كل حساب | Merge (منفذ) | vitest | — |
| الجاهزية وإشارات القيود | درجة جاهزية الملف للمراجعة وإشارات على القيود | المراجعة | عام | منقول جزئياً | cloude: tb-review readiness | ملف المراجعة | Merge | council_readiness.test | — |
| بوابة ذكاء بلا اعتماد بشري لا تصدر | لا يصدر رأي من الذكاء دون اعتماد بشري | طبقة AI (حوكمة) | عام | منقول كقاعدة | cloude: governance-engine | حوكمة الذكاء | Merge (منفذ) | governance tests | — |

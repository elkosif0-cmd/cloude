# kosif-atlas — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `7aa515dda`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/kosif-atlas` — عام · اللغة الرئيسية Python · 175,844 ك.ب على GitHub · آخر دفع 2026-10-03 · الفرع الافتراضي `main`
- الوصف على GitHub: KOSIF Atlas: 14,793 Claude/ChatGPT skills as complete folders, with licenses and KOSIF security verdicts (mirror used by KOSIF Omni)
- النسخة المفحوصة: **71,789 ملفاً** (527.2 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 1 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **مسح آلي — مكتبة مهارات مرجعية، لا كود منتج**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `skills` | 71780 | 522800 ك.ب |
| `(root)` | 9 | 17008 ك.ب |

الامتدادات: `.md` 55172، `.json` 3365، `.py` 3259، `.yaml` 2312، `.sh` 1201، `(بلا)` 1124، `.mjs` 991، `.js` 756، `.ts` 683، `.fixture` 458، `.txt` 254، `.ps1` 221، `.html` 207، `.tsx` 149، `.png` 139، `.mts` 119

نقاط الدخول والإعداد:

- `skills/1120-ambient-library/2676-solofactory/app/docs/manual/index.html`
- `skills/1177-solofactory/2785-solofactory/app/docs/manual/index.html`
- `skills/2865-visual-docs/11574-visual-plan/server/lib/server.js`
- `skills/2865-visual-docs/11575-visual-recap/server/lib/server.js`
- `skills/3130-confidence/13420-migrate-eppo/test-fixtures/server.py`
- `skills/2707-nvidia/10417-omniverse-usd-performance-tuning/references/operations/manifest.json`
- `skills/2043-hotline/7281-hotline-switchboard/scripts/server.js`
- `skills/3130-confidence/13421-migrate-optimizely/test-fixtures/server.py`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/saas/index.html`
- `skills/3130-confidence/13423-migrate-statsig/test-fixtures/server.py`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/dayform/index.html`
- `skills/36-peer-review/50-cross-model-peer-review/scripts/server.py`
- `skills/76-peer-review/139-cross-model-peer-review/scripts/server.py`
- `skills/3603-quiver/14466-visual-companion/server.py`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/trace/index.html`
- `skills/1120-ambient-library/2676-solofactory/app/public/index.html`
- `skills/1177-solofactory/2785-solofactory/app/public/index.html`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/vanilla/index.html`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/research/index.html`
- `skills/x4367-sap-sac-custom-widget/x18445-sap-sac-custom-widget/templates/local-builder/index.html`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/commerce/index.html`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/luma-directed/index.html`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/developer/index.html`
- `skills/1120-ambient-library/2627-grill-with-prototype/bridge/server.py`
- `skills/1156-grill-with-prototype/2737-grill-with-prototype/bridge/server.py`
- `skills/2990-account-video-downloader/12670-account-video-downloader/scripts/main.py`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/index.html`
- `skills/x4367-sap-sac-custom-widget/x18445-sap-sac-custom-widget/templates/design-runtime/index.html`
- `skills/2629-gmailtriage/10006-gmailtriage/evals/baseline/MANIFEST.json`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/structures/index.html`
- `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/fixtures/gas/retained-products-v1/checkers/Index.html`
- `skills/97-frontend-design-director/206-frontend-design-director/examples/cinematic/index.html`
- `skills/3010-uxd-prototype/12859-uxd-prototype-evaluate/tests/fixtures/manifest.json`
- `skills/40-python-development/59-python-refactor-method/assets/pyproject.toml`
- `skills/80-python-development/156-python-refactor-method/assets/pyproject.toml`
- `skills/1444-salesforce-development/3471-platform-metadata-api-context-get/assets/metadata_api/Package.json`
- `skills/x4372-sapui5/x18450-sapui5/templates/manifest.json`
- `skills/3130-confidence/13420-migrate-eppo/test-fixtures/phase2-examples/python-server/src/server.py`

## 4. README (`README.md`، أول الأسطر)

    # KOSIF Atlas — مكتبة المهارات
    **بالعربية** · [English below](#english)
    مرآة أونلاين للمهارات (Skills) الخارجية التي تعتمد عليها أداة **KOSIF Omni**. كل مهارة في مجلد مستقل **كاملاً بكل ملفاتها**:
    SKILL.md، والمراجع، والسكربتات، والقوالب، والصور، والبيانات. وكلها مأخوذة من إضافات Claude وChatGPT منشورة بتراخيص تسمح
    بإعادة التوزيع (MIT وApache-2.0 وBSD وغيرها).
    ## البنية
    ```
    skills/<رقم>-<الإضافة>/SOURCE.md      مصدر الإضافة، والـ commit، والترخيص، ونتيجة فحص KOSIF الأمني
    skills/<رقم>-<الإضافة>/LICENSE        نص الترخيص الأصلي (إن وُجد في الإضافة)
    skills/<رقم>-<الإضافة>/<رقم>-<المهارة>/   المهارة كاملة كما هي في المصدر
    index.json · index.csv                  فهرس كل المهارات: الاسم، والوصف، والترخيص، والمسار، وعلامات الخطر
    NOTICES.md                              قائمة كل الإضافات بتراخيصها ومصادرها
    EXCLUDED.md                             ملفات لم تُنشر (اشتباه بوجود مفتاح سري، أو مسار طويل جداً)
    skills/x<رقم>-<الإضافة>/                إضافات بتراخيص "الحقوق المتروكة" (GPL وAGPL وMPL وCC-BY-SA...) مع نص ترخيصها
    index-copyleft.json · index-copyleft.csv · EXCLUDED-copyleft.md   فهرسها وملفاتها المستبعدة
    ```
    **تراخيص الحقوق المتروكة (المجلدات التي تبدأ بـ `x`):** يُسمح بإعادة نشرها، لكن أي عمل مشتق منها يجب أن يُنشر بالترخيص
    نفسه (مثل GPL). لذلك لا تُدمج في KOSIF Omni نفسها، وهي هنا للقراءة والرجوع فقط.
    ## الاستخدام
    - **من KOSIF Omni:** نتائج `kosif_atlas_search` و`kosif_atlas_read` تحمل رابطاً مباشراً (`online_url`) للمهارة هنا.
    - **يدوياً:** ابحث في `index.csv` (يفتح في Excel) أو بالبحث داخل GitHub، ثم افتح مجلد المهارة.
    - **برمجياً:** `https://raw.githubusercontent.com/kosif199022-jpg/kosif-atlas/main/index.json`
    ## تنبيهات
    - هذا محتوى طرف ثالث **لم يُراجع سطراً بسطر**. اقرأه كمرجع، و**لا تشغّل أي سكربت** قبل مراجعته.
      نتيجة الفحص الأمني الآلي لكل إضافة مذكورة في `SOURCE.md`.
    - الحقوق محفوظة لأصحابها الأصليين بموجب تراخيصهم. هذه مرآة غير رسمية للرجوع إليها.
    - لم تُنشر الإضافات ذات التراخيص المقيّدة (غير التجارية أو المملوكة) أو غير المحددة، ولا الإضافات التي رفضها الفحص الأمني.
    ---
    ## English
    An online mirror of the third-party skills used by **KOSIF Omni**'s Atlas. Each skill is a complete folder (SKILL.md,
    references, scripts, templates, images, data), taken from Claude/ChatGPT plugins whose licenses permit redistribution
    (MIT, Apache-2.0, BSD, ...).
    - `index.json` / `index.csv`: every skill with its plugin, description, license, path, risk flags and the KOSIF
      inspection verdict.
    - `skills/<pid>-<plugin>/SOURCE.md` + `LICENSE`: upstream source, commit and license text.
    - `NOTICES.md` lists all plugins. `EXCLUDED.md` lists files withheld (likely credentials or over-long paths); their
      content is not reproduced.
    - `skills/x<pid>-<plugin>/`: copyleft plugins (GPL, AGPL, LGPL, MPL, EPL, CC-BY(-SA)...), each with its license text,
      indexed in `index-copyleft.json` / `index-copyleft.csv` (withheld files in `EXCLUDED-copyleft.md`). They are
      redistributed under their own licenses; derivative works must follow the same terms, which is why KOSIF Omni does not
      embed them.
    This is unreviewed third-party content: treat it as reference material and read any script before running it. All
    rights remain with the original authors under their licenses. This is an unofficial mirror. Non-commercial, proprietary
    and unidentified-license plugins, and plugins that failed KOSIF's static inspection, are not included.

## 5. الوحدات المصدرية

5193 وحدة (الأكبر أولاً؛ تُعرض 140). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `skills/1120-ambient-library/2676-solofactory/app/docs/manual/index.html` | 71 | 0 |  | <title> SoloFactory User Manual |
| `skills/1177-solofactory/2785-solofactory/app/docs/manual/index.html` | 71 | 0 |  | <title> SoloFactory User Manual |
| `skills/1213-story-skills/2886-story-maintenance/scripts/story.js` | 10627 | 0 | 6 | src/cli.js src/commands.js |
| `skills/110-kicad-happy/280-kicad/scripts/analyze_schematic.py` | 9321 | 115 | 1 | — |
| `skills/2838-panews/11541-panews-creator/scripts/cli.mjs` | 109 | 0 |  | ! PANews Creator CLI Copyright (c) 2026 PANews License: MIT Source: https://github.com/panewslab/skills Entry: https://github.com/panewslab/skills/blob/main/src/panews-creator.ts |
| `skills/2838-panews/11540-panews/scripts/cli.mjs` | 162 | 0 |  | ! PANews Reader CLI Copyright (c) 2026 PANews License: MIT Source: https://github.com/panewslab/skills Entry: https://github.com/panewslab/skills/blob/main/src/panews.ts |
| `skills/3055-shopify-plugin/13169-shopify-functions/scripts/validate.mjs` | 210 | 0 |  | — |
| `skills/3055-shopify-plugin/13182-shopify-storefront-graphql/scripts/validate.mjs` | 205 | 0 |  | — |
| `skills/3055-shopify-plugin/13175-shopify-payments-apps/scripts/validate.mjs` | 205 | 0 |  | — |
| `skills/3055-shopify-plugin/13167-shopify-customer/scripts/validate.mjs` | 205 | 0 |  | — |
| `skills/3055-shopify-plugin/13174-shopify-partner/scripts/validate.mjs` | 205 | 0 |  | — |
| `skills/3055-shopify-plugin/13163-shopify-admin/scripts/validate.mjs` | 205 | 0 |  | — |
| `skills/110-kicad-happy/280-kicad/scripts/analyze_pcb.py` | 7328 | 100 |  | — |
| `skills/3440-workos/14133-workos-widgets/references/scripts/query-spec.cjs` | 7536 | 0 |  | @__PURE__ |
| `skills/110-kicad-happy/280-kicad/scripts/domain_detectors.py` | 6162 | 56 |  | Domain-specific detector functions for specialized circuit blocks. Identifies functional blocks (Ethernet, HDMI, RF, BMS, battery chargers, motor drivers, etc.) by IC keyword matching and pin tracing. Separated from sign |
| `skills/3406-skill-craft/13953-shiploop/scripts/shiploop_chain.py` | 4526 | 170 |  | — |
| `skills/2433-disk-hygiene/9440-clean/scripts/hygiene.py` | 5945 | 168 |  | — |
| `skills/2631-issueflow/10008-issueflow/evals/inputs/review-round/files/r1/src/local_fitness/agent/tools.py` | 5163 | 45 |  | Claude Agent SDK tools that query the fitness DB. All tools return text content (JSON-encoded payloads) so the model can reason over them. Optional-arg tools use full JSON Schema; required-only tools use the {name: type} |
| `skills/2631-issueflow/10008-issueflow/evals/inputs/review-round/files/r2/src/local_fitness/agent/tools.py` | 5163 | 45 |  | Claude Agent SDK tools that query the fitness DB. All tools return text content (JSON-encoded payloads) so the model can reason over them. Optional-arg tools use full JSON Schema; required-only tools use the {name: type} |
| `skills/2631-issueflow/10008-issueflow/evals/inputs/repo/src/local_fitness/agent/tools.py` | 5088 | 45 |  | Claude Agent SDK tools that query the fitness DB. All tools return text content (JSON-encoded payloads) so the model can reason over them. Optional-arg tools use full JSON Schema; required-only tools use the {name: type} |
| `skills/3406-skill-craft/13953-shiploop/scripts/shiploop_navigator.py` | 4245 | 144 |  | — |
| `skills/110-kicad-happy/280-kicad/scripts/signal_detectors.py` | 4700 | 36 |  | Signal path detector functions extracted from analyze_signal_paths(). Each detector takes an AnalysisContext (ctx) and returns its detection results. Some detectors also take prior results for cross-references. |
| `skills/3010-uxd-prototype/12859-uxd-prototype-evaluate/scripts/render-report.js` | 4287 | 0 |  | — |
| `skills/110-kicad-happy/278-emc/scripts/emc_rules.py` | 4540 | 59 |  | EMC geometric rule checks — operates on schematic + PCB analyzer JSON output. Each check function returns a list of finding dicts with: - category: str (ground_plane, decoupling, io_filtering, etc.) - severity: str (CRIT |
| `skills/2865-visual-docs/11574-visual-plan/server/assets/app.js` | 3464 | 0 |  | Visual Docs client. A small Preact app (vendored under /assets/vendor) renders the shell — sidebar, title block, comment drawer, routing, live reload — while markdown is rendered to HTML with marked, sanitized with DOMPu |
| `skills/2865-visual-docs/11575-visual-recap/server/assets/app.js` | 3464 | 0 |  | Visual Docs client. A small Preact app (vendored under /assets/vendor) renders the shell — sidebar, title block, comment drawer, routing, live reload — while markdown is rendered to HTML with marked, sanitized with DOMPu |
| `skills/2417-autonomy/9374-setup/scripts/check-security-binding.mjs` | 2636 | 0 |  | Security-binding check for the guardrail contract: validates a security binding document against the contract-owned schema shape (schemas/guardrails-security-binding.schema.json — the structural rules are mirrored here,  |
| `skills/3406-skill-craft/13953-shiploop/scripts/shiploop_navigator_v3_prompts.py` | 2396 | 8 |  | Prompt catalog for the navigator's script-owned SDLC traversal (protocol 4). The navigator selects one producer step at a time. After that producer has a result, the runtime renders :func:`improve_prompt` and parks the p |
| `skills/3419-wix/14029-wix-replatform/resources/rp-target-wix/lib/wix-writers.js` | 2996 | 1 |  | rp-target-wix — verified-once Wix write primitives.  The Wix API surface is identical for every migration regardless of source platform, so it is pre-built and verified HERE once rather than re-derived (and re-broken) by |
| `skills/3419-wix/14046-rp-target-wix/lib/wix-writers.js` | 2996 | 1 |  | rp-target-wix — verified-once Wix write primitives.  The Wix API surface is identical for every migration regardless of source platform, so it is pre-built and verified HERE once rather than re-derived (and re-broken) by |
| `skills/1120-ambient-library/2649-software-dev-factory/app/src/controller/sdlc/drive.ts` | 3136 | 22 |  | — |
| `skills/1176-software-dev-factory/2758-software-dev-factory/app/src/controller/sdlc/drive.ts` | 3136 | 22 |  | — |
| `skills/2142-comfyui-plugin/7660-comfyui-node-scaffold/scaffold.py` | 3686 | 52 | 9 | — |
| `skills/2987-railway/12638-use-railway/scripts/analyze-postgres.py` | 3059 | 21 | 1 | — |
| `skills/2433-disk-hygiene/9440-clean/scripts/destructive_guard.py` | 3192 | 95 |  | — |
| `skills/189-finance-skills/562-stock-analysis/scripts/ratios.py` | 2691 | 102 |  | — |
| `skills/3406-skill-craft/13953-shiploop/scripts/shiploop_lint.py` | 2592 | 123 |  | — |
| `skills/2631-issueflow/10008-issueflow/scripts/issueflow.js` | 2192 | 4 |  | issueflow — the deterministic half of the skill. Everything mechanical lives here so the agent never reshapes output with sed/grep/jq in the transcript: one command returns everything a step needs, already as a table. Th |
| `skills/1391-compound-engineering/3295-ce-polish/scripts/live-endpoint.js` | 2842 | 0 |  | Live endpoint for ce-polish live mode: page -> endpoint event intake over HTTP POST, endpoint -> page SSE, endpoint -> agent blocking wake. Adapted from the ce-prototype helper (light-webserver.js): the run-directory lif |
| `skills/3419-wix/14023-wix-headless-replatform/scripts/extract-page.mjs` | 2462 | 1 |  | — |
| `skills/3406-skill-craft/13937-ask-agent/scripts/ask_agent_workspace.py` | 2563 | 113 |  | — |
| `skills/3618-feishu2codex/14571-lark-apps/creative-design/starter-components/deck-stage.js` | 2484 | 1 |  | BEGIN USAGE |
| `skills/3425-stacked-planning/14054-authoring-stacked-plans/scripts/diff_census.py` | 2876 | 205 |  | /// script requires-python = ">=3.11" dependencies = ["pathspec", "pygments"] /// |
| `skills/2370-report-regeneration/9165-report-fidelity-harness/harness.py` | 2370 | 122 |  | — |
| `skills/2844-parable/11552-parable/scripts/parable.py` | 2499 | 86 |  | — |
| `skills/3010-uxd-prototype/12859-uxd-prototype-evaluate/templates/evaluation-report.html` | 1954 | 0 |  | PF Label — status (filled), categorical (outline), compact (inline) |
| `skills/1506-ops-perf-evolution/3874-evolution-world-model/scripts/wm_ops.py` | 2794 | 102 |  |  Copyright (c) 2026 Huawei Technologies Co., Ltd. This program is free software, you can redistribute it and/or modify it under the terms and conditions of CANN Open Software License Agreement Version 2.0 (the "License") |
| `skills/3419-wix/14011-replatform/resources/rp-target-wix/lib/wix-writers.js` | 2220 | 1 |  | rp-target-wix — verified-once Wix write primitives.  The Wix API surface is identical for every migration regardless of source platform, so it is pre-built and verified HERE once rather than re-derived (and re-broken) by |
| `skills/3419-wix/14020-rp-target-wix/lib/wix-writers.js` | 2220 | 1 |  | rp-target-wix — verified-once Wix write primitives.  The Wix API surface is identical for every migration regardless of source platform, so it is pre-built and verified HERE once rather than re-derived (and re-broken) by |
| `skills/1391-compound-engineering/3280-ce-brainstorm/scripts/peer-job-runner.py` | 2466 | 93 |  | — |
| `skills/1391-compound-engineering/3281-ce-code-review/scripts/peer-job-runner.py` | 2466 | 93 |  | — |
| `skills/1391-compound-engineering/3287-ce-doc-review/scripts/peer-job-runner.py` | 2466 | 93 |  | — |
| `skills/1391-compound-engineering/3294-ce-plan/scripts/peer-job-runner.py` | 2466 | 93 |  | — |
| `skills/1391-compound-engineering/3296-ce-pov/scripts/peer-job-runner.py` | 2466 | 93 |  | — |
| `skills/1391-compound-engineering/3310-ce-work/scripts/peer-job-runner.py` | 2466 | 93 |  | — |
| `skills/3388-doc-this/13920-doc-this-viewer/assets/viewer/assets/index-BtloYvfC.js` | 60 | 0 |  | — |
| `skills/1534-condux/4208-plan-review/references/plan-review-template.html` | 1950 | 0 |  | tokens:core:start |
| `skills/1541-session-report/4224-session-report/template.html` | 2968 | 0 |  | tokens:core:start |
| `skills/189-finance-skills/562-stock-analysis/scripts/score.py` | 2073 | 36 |  | — |
| `skills/110-kicad-happy/280-kicad/scripts/kicad_utils.py` | 2168 | 36 |  | Shared utility functions for KiCad schematic and PCB analyzers. Contains component classification, value parsing, net name classification, and other helpers extracted from analyze_schematic.py. |
| `skills/2998-patternfly/12764-pf-figma-check/scripts/patternfly-check.js` | 2721 | 1 |  | PatternFly v6 Design Compliance Checker Analyzes Figma prototypes against PatternFly design system standards |
| `skills/3001-pf-design-audit/12814-pf-figma-check/scripts/patternfly-check.js` | 2721 | 1 |  | PatternFly v6 Design Compliance Checker Analyzes Figma prototypes against PatternFly design system standards |
| `skills/2846-recall/11554-recall/scripts/recall.py` | 1940 | 66 |  | — |
| `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/verify_suite.py` | 1869 | 67 |  | — |
| `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/run.py` | 1615 | 49 |  | — |
| `skills/3419-wix/14029-wix-replatform/resources/rp-telemetry/lib/telemetry-recorder.js` | 2187 | 1 |  | Telemetry recorder for RePlatform migration runs.  The recorder owns everything mechanical and error-prone: schema validation (enums, subtype-per-event-type), timestamping, per-class event aggregation, the run/attempt/se |
| `skills/3419-wix/14047-rp-telemetry/lib/telemetry-recorder.js` | 2187 | 1 |  | Telemetry recorder for RePlatform migration runs.  The recorder owns everything mechanical and error-prone: schema validation (enums, subtype-per-event-type), timestamping, per-class event aggregation, the run/attempt/se |
| `skills/1506-ops-perf-evolution/3872-evolution-report/scripts/generate_report.py` | 2264 | 93 |  |  Copyright (c) 2026 Huawei Technologies Co., Ltd. This program is free software, you can redistribute it and/or modify it under the terms and conditions of CANN Open Software License Agreement Version 2.0 (the "License") |
| `skills/1505-catlass-dsl-generator/3866-catlass-dsl-bench/scripts/bench.py` | 2215 | 65 |  | ---------------------------------------------------------------------------------------------------------- Copyright (c) 2026 Huawei Technologies Co., Ltd. This program is free software, you can redistribute it and/or mo |
| `skills/3419-wix/14023-wix-headless-replatform/scripts/extract-interactions.mjs` | 1904 | 2 |  | — |
| `skills/2585-seo/9952-seo/scripts/generate_report.py` | 1767 | 24 |  | — |
| `skills/1277-analytics-verify/2955-analytics-verify/scripts/check_claims.py` | 1796 | 89 |  | — |
| `skills/2844-parable/11552-parable/runtime/lib/onboarding.js` | 2391 | 2 |  | — |
| `skills/3406-skill-craft/13953-shiploop/scripts/shiploop_workspace.py` | 1855 | 87 |  | — |
| `skills/3256-vercel/13711-benchmark-sandbox/run-eval.ts` | 1625 | 11 |  | Sandbox eval runner with 3-phase pipeline: Build → Verify → Deploy. Phase 1 (BUILD): Claude Code builds the app in a fresh sandbox. Phase 2 (VERIFY): A follow-up Claude Code session uses agent-browser to walk through use |
| `skills/1093-akbun-analysis/2414-akbun-analysiscode/scripts/analysis_artifacts.py` | 1778 | 24 |  | — |
| `skills/2511-azure/9728-foundry-iq/helpers/blob_source.py` | 1347 | 33 |  | — |
| `skills/3419-wix/14011-replatform/resources/rp-telemetry/lib/telemetry-recorder.js` | 1928 | 1 |  | Telemetry recorder for RePlatform migration runs.  The recorder owns everything mechanical and error-prone: schema validation (enums, subtype-per-event-type), timestamping, per-class event aggregation, the run/attempt/se |
| `skills/3419-wix/14021-rp-telemetry/lib/telemetry-recorder.js` | 1928 | 1 |  | Telemetry recorder for RePlatform migration runs.  The recorder owns everything mechanical and error-prone: schema validation (enums, subtype-per-event-type), timestamping, per-class event aggregation, the run/attempt/se |
| `skills/2476-source-control/9610-babysit-prs/scripts/babysit_delta.py` | 1488 | 22 |  | — |
| `skills/2476-source-control/9610-babysit-prs/scripts/babysit_merge.py` | 1732 | 24 |  | — |
| `skills/189-finance-skills/562-stock-analysis/scripts/verify_data.py` | 1664 | 50 |  | — |
| `skills/2537-unslop/9837-unslop-file/scripts/humanize.py` | 1668 | 36 |  | Core humanization logic: deterministic regex pass and LLM-driven rewrite. Contract: - Read file at `path`. - Write `<stem>.original.md` backup. - Humanize prose. Preserve fenced code, inline code, URLs, paths, headings.  |
| `skills/2788-spec-tree/11167-update-instruction-block/scripts/instruction_block.py` | 1762 | 93 |  | Deterministic generation and validation of a product's root Spec Tree instruction surface. One repository is worked by both Claude Code and Codex at once, and each agent harness retains its root instruction file across c |
| `skills/2800-spec-tree/11294-update-instruction-block/scripts/instruction_block.py` | 1762 | 93 |  | Deterministic generation and validation of a product's root Spec Tree instruction surface. One repository is worked by both Claude Code and Codex at once, and each agent harness retains its root instruction file across c |
| `skills/2812-spec-tree/11411-update-instruction-block/scripts/instruction_block.py` | 1762 | 93 |  | Deterministic generation and validation of a product's root Spec Tree instruction surface. One repository is worked by both Claude Code and Codex at once, and each agent harness retains its root instruction file across c |
| `skills/2707-nvidia/10415-omniverse-cad-to-simready/references/content-agents/scripts/content_agent_client.py` | 1830 | 50 |  | SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. SPDX-License-Identifier: Apache-2.0 |
| `skills/2511-azure/9728-foundry-iq/helpers/prompt_connect.py` | 1542 | 25 |  | — |
| `skills/2707-nvidia/10415-omniverse-cad-to-simready/references/preflight/scripts/preflight.py` | 1636 | 83 |  | SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. SPDX-License-Identifier: Apache-2.0 |
| `skills/110-kicad-happy/280-kicad/scripts/validation_detectors.py` | 1438 | 24 |  | Validation detectors — correctness checks that emit rich findings. Separated from domain_detectors.py (which discovers circuit topologies). These detectors check for design errors: missing components, wrong values, proto |
| `skills/3406-skill-craft/13944-plan-dispatcher/scripts/state.js` | 2121 | 0 |  | Bounded single-dispatcher experiment. This module coordinates a trusted local filesystem. It is not a security boundary and it does not launch, stop, or inspect native workers. In particular, confirmed_stopped is a calle |
| `skills/2511-azure/9728-foundry-iq/helpers/blob_recheck.py` | 1132 | 35 |  | Retained Blob creation/reuse observations and read-only readiness follow-up. |
| `skills/2511-azure/9728-foundry-iq/helpers/search_reconcile.py` | 1466 | 26 |  | — |
| `skills/3419-wix/14029-wix-replatform/resources/rp-source-wordpress/scripts/wp-discovery.js` | 1601 | 0 |  | Transport, auth, throttling, and pagination-header parsing live in the shared |
| `skills/3419-wix/14045-rp-source-wordpress/scripts/wp-discovery.js` | 1601 | 0 |  | Transport, auth, throttling, and pagination-header parsing live in the shared |
| `skills/2631-issueflow/10008-issueflow/scripts/lib/prreview.mjs` | 1206 | 82 |  | The pull request review loop — the deterministic half of it. A round is: finders write candidates, verifiers rule on them and on every finding still open from earlier rounds, the registrar (this file) decides what is rea |
| `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/oracle_games.py` | 1515 | 71 |  | Independent semantic game oracles for the Checkers and Battleship cases. The public surface is deliberately small: ``cases(step_id)`` returns the cumulative, JSON-serializable case records for one scenario step. ``evalua |
| `skills/2476-source-control/9610-babysit-prs/scripts/babysit_resolve_thread.py` | 1432 | 27 |  | — |
| `skills/1209-crowdstrike-falcon-fusion/2859-authoring/scripts/validate.py` | 1390 | 27 |  | Validate CrowdStrike Fusion workflow YAML files. Performs three levels of validation: 1. Pre-flight: checks header comment, required top-level keys, PLACEHOLDER markers 2. Structural: parses YAML and validates schema rul |
| `skills/374-sagemaker-ai/1385-hyperpod-issue-report/scripts/hyperpod_issue_report.py` | 1442 | 20 |  | /// script requires-python = ">=3.8" dependencies = [ "boto3>=1.26.0", "botocore>=1.29.0", "pexpect>=4.8.0", ] |
| `skills/3199-evidence-lab-core/13557-evidence-lab-onboarding/scripts/bootstrap.py` | 1386 | 58 |  | — |
| `skills/2629-gmailtriage/10006-gmailtriage/scripts/gmailtriage.js` | 1262 | 1 |  | gmailtriage — the deterministic half of the skill. The Gmail MCP is agent-side, so this binary never touches a mailbox. The agent fetches threads and the agent trashes them; everything that must not depend on a model beh |
| `skills/2050-assistant/7295-scribe/scripts/notion_payload.mjs` | 1301 | 1 |  | notion_payload.mjs — Archivist Notion request builder + writer.  WHY THIS EXISTS The KB is reached through the official `ntn` CLI (a thin wrapper over the Notion REST API). A page's `properties` map still has a non-obvio |
| `skills/110-kicad-happy/280-kicad/scripts/analyze_gerbers.py` | 1671 | 18 |  | — |
| `skills/3055-shopify-plugin/13179-shopify-polaris-customer-account-extensi/scripts/validate.mjs` | 48 | 0 |  | — |
| `skills/3055-shopify-plugin/13178-shopify-polaris-checkout-extensions/scripts/validate.mjs` | 48 | 0 |  | — |
| `skills/3055-shopify-plugin/13176-shopify-polaris-admin-extensions/scripts/validate.mjs` | 48 | 0 |  | — |
| `skills/3055-shopify-plugin/13177-shopify-polaris-app-home/scripts/validate.mjs` | 48 | 0 |  | — |
| `skills/3055-shopify-plugin/13170-shopify-hydrogen/scripts/validate.mjs` | 48 | 0 |  | — |
| `skills/3055-shopify-plugin/13180-shopify-pos-ui/scripts/validate.mjs` | 48 | 0 |  | — |
| `skills/306-receipts/922-receipts/scripts/mine-transcripts.mjs` | 1448 | 0 |  | — |
| `skills/1120-ambient-library/2632-ireport/reports/ai-engine-optimization-guide.html` | 1030 | 0 |  | <title> AI Engine Optimization: The Complete Guide to Discoverability, Citation & Authority |
| `skills/1160-ireport/2741-ireport/reports/ai-engine-optimization-guide.html` | 1030 | 0 |  | <title> AI Engine Optimization: The Complete Guide to Discoverability, Citation & Authority |
| `skills/2987-railway/12638-use-railway/scripts/analyze-mongo.py` | 1550 | 23 |  | — |
| `skills/1511-homie/3895-perf/scripts/perf.mjs` | 811 | 0 |  | perf.mjs: make a studio's game faster one measured change at a time, and keep only what really helped. baseline <game> --url <site> [--goal <metric>] [--devices computer,phone] [--runs 6] [--seconds 15] [--cpu 4] [--min  |
| `skills/2666-nimble/10149-brand-mention-monitor/example.html` | 641 | 0 |  | — |
| `skills/2623-devlog/10000-devlog/bin/devlog.js` | 1506 | 1 |  | — |
| `skills/110-kicad-happy/284-spice/scripts/spice_templates.py` | 1741 | 27 |  | Testbench generation templates for Phase 1 SPICE simulation. Each function takes a detector output dict (from signal_detectors.py) and returns a complete ngspice .cir file as a string. Testbenches use .control blocks for |
| `skills/1551-dev-skills/4317-swagger-doc-skill/scripts/extract_swagger_docs.mjs` | 1671 | 1 |  | Extract endpoint documentation from Swagger/OpenAPI URLs without external dependencies. |
| `skills/1505-catlass-dsl-generator/3868-catlass-dsl-develop/scripts/develop_state.py` | 1429 | 42 |  | — |
| `skills/110-kicad-happy/280-kicad/scripts/diff_analysis.py` | 1597 | 38 |  | — |
| `skills/2655-yandex-direct-for-all/10098-yandex-performance-ops/scripts/change_tracker.py` | 1211 | 26 |  | — |
| `skills/2779-coding-agents/11062-operate-prowl/scripts/prowl_environment.py` | 1703 | 68 |  | — |
| `skills/2791-coding-agents/11189-operate-prowl/scripts/prowl_environment.py` | 1703 | 68 |  | — |
| `skills/2803-coding-agents/11315-operate-prowl/scripts/prowl_environment.py` | 1703 | 68 |  | — |
| `skills/110-kicad-happy/280-kicad/scripts/what_if.py` | 1555 | 29 |  | — |
| `skills/236-agent-transcripts/761-transcript-ingest/transcripts.py` | 1520 | 46 |  | /// script requires-python = ">=3.12" dependencies = ["zstandard"] /// |
| `skills/3419-wix/14029-wix-replatform/resources/rp-source-wordpress/lib/wp-plugin-detect.js` | 1271 | 0 |  | Pure plugin detection, generic derivation, and coverage classification.  Everything here is a pure function over already-fetched inputs (REST index, plugin list, types/taxonomies, sampled records) so the whole surface is |
| `skills/3419-wix/14045-rp-source-wordpress/lib/wp-plugin-detect.js` | 1271 | 0 |  | Pure plugin detection, generic derivation, and coverage classification.  Everything here is a pure function over already-fetched inputs (REST index, plugin list, types/taxonomies, sampled records) so the whole surface is |
| `skills/2631-issueflow/10008-issueflow/evals/inputs/review-round/files/r1/src/local_fitness/plans.py` | 1384 | 50 |  | Training-plan pure logic — no I/O. Validation, type-aware adherence, data-frontier grading, Riegel projection, and weekly-mileage rollup. These functions take plain dicts/rows and return verdicts/numbers so they unit-tes |
| `skills/2631-issueflow/10008-issueflow/evals/inputs/review-round/files/r2/src/local_fitness/plans.py` | 1384 | 50 |  | Training-plan pure logic — no I/O. Validation, type-aware adherence, data-frontier grading, Riegel projection, and weekly-mileage rollup. These functions take plain dicts/rows and return verdicts/numbers so they unit-tes |
| `skills/2981-designer-skill/12625-designer-skill/scripts/palette.mjs` | 667 | 3 |  | Brand-seed picker. Returns one OKLCH seed color + the mood it most naturally evokes, and teaches the model how to compose a full palette around it. The seed is the brand's anchor color. The 5-role palette (bg, surface, i |
| `skills/2637-shipflow/10014-shipflow/lib/release.mjs` | 1123 | 25 |  | Component-scoped release engine: resolve a named component, read what is actually on main, propose a bump, write it, drive it to main, and prove the tag exists.  Everything here is deterministic and mechanical on purpose |
| `skills/1454-herdr/3553-herdr/scripts/herd.ts` | 1529 | 24 |  | herd.ts — a small, typed wrapper over the raw `herdr` CLI for in-session agent orchestration. Collapses herdr's multi-step recipes (create pane → start → prompt → wait → read) into ten verbs an agent can call without re- |
| `skills/2666-nimble/10149-brand-mention-monitor/references/template.html` | 908 | 0 |  | BRAND HEADER |
| `skills/1508-tilelang2ascendc-ops-generator/3881-tilelang2ascend-translator/scripts/verification_ascendc.py` | 1511 | 52 |  | ---------------------------------------------------------------------------------------------------------- Copyright (c) 2026 Huawei Technologies Co., Ltd. This program is free software, you can redistribute it and/or mo |
| `skills/2992-development-skills/12679-ai-agent-bench/scripts/parse_transcript.py` | 1421 | 27 |  | Parse AI agent session transcripts + aggregate run artifacts into unified metrics. Supported agents: - claude : Claude Code stream-json (newline-delimited) - codex : OpenAI Codex `exec --json` (newline-delimited) Modes:  |
| `skills/1391-compound-engineering/3310-ce-work/scripts/unit_workspace_jobs.py` | 1162 | 35 |  | Unit preparation, runner evidence, and complete-tree transport lifecycle. |
| `skills/2511-azure/9728-foundry-iq/helpers/file_upload.py` | 854 | 31 |  | Synchronous File batches; one in-operation queue-429 retry, never unknown-outcome replay. |
| `skills/3010-uxd-prototype/12859-uxd-prototype-evaluate/scripts/mlflow-trace-eval.py` | 1306 | 25 |  | — |

الباقي بالمجلد: `skills/3419-wix` 407، `skills/2451-knowledge` 133، `skills/1120-ambient-library` 114، `skills/2511-azure` 112، `skills/2640-skillhelp` 102، `skills/2585-seo` 90، `skills/110-kicad-happy` 86، `skills/3406-skill-craft` 83، `skills/2655-yandex-direct-for-all` 81، `skills/365-aws-core` 63، `skills/1117-clickhouse-best-practices` 63، `skills/2707-nvidia` 61، `skills/192-marketing-skills` 61، `skills/138-c-level-skills` 59، `skills/2631-issueflow` 57، `skills/2957-posthog` 54، `skills/2998-patternfly` 50، `skills/3055-shopify-plugin` 49، `skills/1176-software-dev-factory` 48، `skills/3214-togetherai-skills` 47، `skills/1514-huggingface-skills` 44، `skills/886-intel` 42، `skills/3010-uxd-prototype` 42، `skills/97-frontend-design-director` 41، `skills/1893-podium-pack` 41، `skills/2626-ghostwriter` 39، `skills/1452-dispatch` 38، `skills/214-ra-qm-skills` 38، `skills/2106-feature-dev-kit` 34، `skills/2627-ghostwriter-x` 32، `skills/1391-compound-engineering` 31، `skills/2657-figures` 30، `skills/1980-jfrog` 30، `skills/1506-ops-perf-evolution` 29، `skills/2478-testing` 29، `skills/247-claude-dev-infrastructure` 28، `skills/1511-homie` 27، `skills/314-bio-research` 25، `skills/2700-google-drive` 25، `skills/1329-playwright-kit` 25

## 6. الاختبارات (944)

- `skills/2433-disk-hygiene/9440-clean/scripts/test_hygiene.py` (8804 سطراً) 
- `skills/2094-brewcode/7418-semble-setup/tests/suite-hooks.mjs` (3319 سطراً) suite-hooks.mjs — unit D: rule template, .sembleignore, CLAUDE.md marker block, the five hooks (session, prefetch, stats, reminder, subagent) and the settings.json merge performed by semble-guidance.sh — including the mi
- `skills/1452-dispatch/3544-autopilot/scripts/orchestrator-script.test.ts` (4195 سطراً) Deterministic fixture for the canonical orchestrator script. The script lives in `references/orchestrator.md` as a fenced JS block, because the Workflow runtime takes it as source — it cannot import a module. So this tes
- `skills/2098-brewtools/7439-agent-deadline-setup/tests/suite.mjs` (1597 سطراً) E2E suite for agent-deadline hooks (guard + cleanup). Runs in isolated TEMP HOME + TMPDIR (os.tmpdir()/os.homedir() both respect these env vars). Never touches real ~/.claude, real /tmp state, or repo state. Assertion po
- `skills/2098-brewtools/7441-agent-router-setup/tests/suite.mjs` (1878 سطراً) E2E suite for the agent-router PreToolUse hook (tier 1, deterministic). Runs in an isolated TEMP HOME + TMPDIR per test (os.tmpdir()/os.homedir() both respect these env vars). Never touches the real ~/.claude, real /tmp 
- `skills/2094-brewcode/7422-teams-setup/tests/suite-agent-profile-contract.mjs` (2088 سطراً) Compact team-agent profile contract. Validates the Claude authority, native Codex projection, shared team contract, and the intent-guard/non-team exemptions without mutating the repository.
- `skills/2091-brewcode/7403-teams-setup/tests/suite-agent-profile-contract.mjs` (2024 سطراً) Compact team-agent profile contract. Validates the Codex authority, native Codex projection, shared team contract, and the intent-guard/non-team exemptions without mutating the repository.
- `skills/2094-brewcode/7413-teams-setup/tests/suite-agent-profile-contract.mjs` (2024 سطراً) Compact team-agent profile contract. Validates the Codex authority, native Codex projection, shared team contract, and the intent-guard/non-team exemptions without mutating the repository.
- `skills/2095-brewcode/7427-teams-setup/tests/suite-agent-profile-contract.mjs` (2024 سطراً) Compact team-agent profile contract. Validates the Codex authority, native Codex projection, shared team contract, and the intent-guard/non-team exemptions without mutating the repository.
- `skills/2476-source-control/9610-babysit-prs/scripts/tests/test_babysit_resolve_thread.py` (2136 سطراً) Resolve-thread reporting counters. Golden regression for #512: `humanThreadsActed` must count only threads whose OPENING author is human, gated through the shared `is_bot` authorship classifier -- not `botOnly` (every co
- `skills/2094-brewcode/7418-semble-setup/tests/suite-core.mjs` (1403 سطراً) suite-core.mjs (unit B) — lib/semble-common.sh, semble-mcp.sh, semble-cache.sh, semble-state.sh. Self-contained: no shared harness module, no dependency on tests/run.sh, and no dependency on another unit's fixtures — eve
- `skills/1277-analytics-verify/2955-analytics-verify/scripts/test_check_claims.py` (1347 سطراً) Tests for check_claims.py: python3 -m unittest discover -s <this dir> -p 'test_*.py' The replay cases rebuild, with fictional names and figures, the errors found in two real agent-written deliverables (2026-09-24) and pi
- `skills/375-migration-to-aws/1398-agent-advisor/scripts/test_unit_grouping.py` (1168 سطراً) Content lock for the unit-inventory grouping rules in the Discover phase. The grouping judgment (in-process agents merge; cross-process split) is prose, so these tests pin the load-bearing sentences the same way the temp
- `skills/367-aws-startup-advisor/1354-agent-advisor/scripts/test_unit_grouping.py` (1168 سطراً) Content lock for the unit-inventory grouping rules in the Discover phase. The grouping judgment (in-process agents merge; cross-process split) is prose, so these tests pin the load-bearing sentences the same way the temp
- `skills/1455-monitor/3555-cockpit/contract/daemon.contract.test.ts` (1145 سطراً) 
- `skills/2629-gmailtriage/10006-gmailtriage/scripts/tests/units.test.mjs` (1239 سطراً) Unit tests, deliberately in their own file — `skillfactory freeze` rewrites baseline.test.mjs, so a guard written there is deleted on the next refresh. Several of these pin defects the first real run against a live inbox
- `skills/2476-source-control/9610-babysit-prs/scripts/tests/test_babysit_merge.py` (1675 سطراً) Autopilot-merge-tier (#476) criteria evaluated in `babysit_merge`. The base readiness gate already blocks on state/mergeability/checks/approval/ threads; those paths are covered by the subprocess guard tests. This module
- `skills/2473-session-flow/9591-running-retro/scripts/test_observer.py` (1580 سطراً) 
- `skills/2476-source-control/9610-babysit-prs/scripts/tests/guard_contract.py` (1734 سطراً) The guard contract: every lane fact a consumer is allowed to rely on. This module is the single source of truth for two artifacts that must never disagree: the executable assertions in `test_guards.py` and the citable pr
- `skills/1454-herdr/3553-herdr/scripts/herd.test.ts` (2087 سطراً) A mock runner that records argv and replies from a scripted table.
- `skills/2091-brewcode/7403-teams-setup/tests/suite-trace-ops.mjs` (1265 سطراً) 
- `skills/2094-brewcode/7413-teams-setup/tests/suite-trace-ops.mjs` (1265 سطراً) 
- `skills/2094-brewcode/7422-teams-setup/tests/suite-trace-ops.mjs` (1265 سطراً) 
- `skills/2095-brewcode/7427-teams-setup/tests/suite-trace-ops.mjs` (1265 سطراً) 
- `skills/2094-brewcode/7418-semble-setup/tests/suite-status.mjs` (1175 سطراً) suite-status.mjs - unit A: semble-status.sh (read-only) + semble-install.sh. Everything runs inside one mkdtemp base with an injected HOME, project root, cache roots, a stubbed `claude` and a deliberately narrow PATH (so
- `skills/2421-code-metrics/9383-audit-coverage/scripts/test_join.py` (1464 سطراً) 
- `skills/3618-feishu2codex/14590-lark-slides/scripts/xml_text_overlap_lint_test.py` (1314 سطراً) Copyright (c) 2026 Lark Technologies Pte. Ltd. SPDX-License-Identifier: MIT
- `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/test_run.py` (1069 سطراً) Whole-run apparatus checks with a fake Grok process; never model evidence.
- `skills/2631-issueflow/10008-issueflow/scripts/tests/prreview.test.mjs` (902 سطراً) The pull request review loop, two-sided, over a real git repository. Every rule the registrar enforces is paired with the shape it refuses: a finding on a context line posts inline beside one outside every hunk that does
- `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/test_verify_suite.py` (1085 سطراً) 
- `skills/363-aws-agents/1301-agents-pay/scripts/test_x402_policy.py` (1431 سطراً) 
- `skills/2094-brewcode/7418-semble-setup/tests/suite-project.mjs` (1003 سطراً) suite-project.mjs — brewcode:semble-setup unit C. Covers semble-project.sh (audit/warm/smoke/enable/disable/reindex), semble-remove.sh (integration/mcp/cli/purge) and the §12.3 full-lifecycle integration test. Self-conta
- `skills/1552-codex-review/4318-codex-plan-review/scripts/codex-review.test.mjs` (1041 سطراً) @type {any}
- `skills/2631-issueflow/10008-issueflow/scripts/tests/parallel.test.mjs` (1020 سطراً) Parallel sessions on one repo (#251). One Claude Code session per issue, all on one machine, all against one checkout. A run's identity is `owner/name#N`, and until 0.8.0 nothing ever asked whether that identity was take
- `skills/1452-dispatch/3546-flightplan/scripts/lint-task.test.ts` (1664 سطراً) 
- `skills/2631-issueflow/10008-issueflow/scripts/tests/durability.test.mjs` (1119 سطراً) The checkpoint, the worktrees, and the promise that offline means offline. These drive real things — a real temporary git repository, a real `gh` on `PATH` — rather than mocks, for the same reason the gate tests do: a mo
- `skills/2094-brewcode/7418-semble-setup/tests/suite-integration.mjs` (936 سطراً) suite-integration.mjs - cross-unit integration for brewcode:semble-setup.  Every other suite stubs its siblings. This one runs the REAL scripts against each other: semble-status.sh composes semble-mcp.sh / semble-cache.s
- `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/test_grok_adapter.py` (1126 سطراً) 
- `skills/2094-brewcode/7418-semble-setup/tests/suite-telemetry.mjs` (827 سطراً) suite-telemetry.mjs - assets/semble-stats.mjs (the measurement hook) and semble-status.sh --section telemetry (the reader), plus the guidance merge/unmerge/status round trip with the two new want rows present. Everything
- `skills/2631-issueflow/10008-issueflow/scripts/tests/next.test.mjs` (829 سطراً) `next` — every reachable state yields exactly one action, and the CLI's exit codes are a contract. `decide()` is driven over real run directories the way the CLI drives it, with the two things it needs from outside the r
- `skills/2098-brewtools/7440-agent-return-setup/tests/suite.mjs` (829 سطراً) E2E suite for the agent-return hook pair (contract + guard). Each case drives a hook as a REAL child process (JSON on stdin -> JSON on stdout) and asserts exit code, empty stderr and exact stdout. Isolation: every worksp
- `skills/1120-ambient-library/2601-chat-n-build/tests/test_dash.py` (1152 سطراً) Tests for scripts/dash.py. Standard library only: python3 -m unittest discover -s chat-n-build/tests
- `skills/1131-chat-n-build/2710-chat-n-build/tests/test_dash.py` (1152 سطراً) Tests for scripts/dash.py. Standard library only: python3 -m unittest discover -s chat-n-build/tests
- `skills/2657-figures/10114-svg-primitives/tests/test_e2e.py` (980 سطراً) End-to-end tests for svg-primitives. Each test renders a real SVG via the public API, then parses it back from the file system (no in-memory shortcuts) and asserts geometric or structural invariants. No mocks.
- `skills/2476-source-control/9610-babysit-prs/scripts/tests/test_babysit_gh.py` (985 سطراً) GitHub read helpers: discovery axis matrix and the review-thread paginator. Ports the discovery, author-scope, and review-thread coverage onto `babysit_gh`. Network is stubbed by monkeypatching the module's `gh_json` / `
- `skills/1456-relay/3558-relay/scripts/relay.test.ts` (1367 سطراً) 
- `skills/2476-source-control/9610-babysit-prs/scripts/tests/test_prune_babysit_worktrees.py` (957 سطراً) Worktree-pruner resolution and reporting, hermetically. `repo_path` and `remove_worktree` are exercised against a real on-disk git repository with a linked worktree, so the whole path is hermetic -- no `gh`, and notably 
- `skills/2476-source-control/9610-babysit-prs/scripts/tests/test_babysit_delta.py` (973 سطراً) Per-PR classifier and fan-out delta engine. Ports the pull-request classification coverage onto `babysit_delta`: branch freshness, the trust-boundary mutation policy, foreign-activity (L3) detection, the twelve `worker_a
- `skills/2631-issueflow/10008-issueflow/evals/inputs/review-round/files/r1/tests/test_plans.py` (893 سطراً) Tests for plans.py pure logic — validation, adherence, grading, projection.
- `skills/2631-issueflow/10008-issueflow/evals/inputs/review-round/files/r2/tests/test_plans.py` (893 سطراً) Tests for plans.py pure logic — validation, adherence, grading, projection.
- `skills/1456-relay/3558-relay/scripts/live.test.ts` (1238 سطراً) 
- `skills/2476-source-control/9610-babysit-prs/scripts/tests/test_guards.py` (831 سطراً) Executes the guard contract in `guard_contract.py` against the real entry points. Every assertion here exercises a fact a consumer is told to rely on, and fails with the prose claim that just became false rather than a b
- `skills/2098-brewtools/7444-manager-setup/tests/suite.mjs` (904 سطراً) E2E suite for the manager HARD wall guard (brewtools/hooks/hardmode-guard.mjs). Focus: main-session vs subagent discrimination. State is driven through an isolated temp project passed as `cwd` on stdin — this repo's .cla
- `skills/2093-brewtools/7405-manager-setup/tests/suite.mjs` (904 سطراً) E2E suite for the manager HARD wall guard (brewtools/hooks/hardmode-guard.mjs). Focus: main-session vs subagent discrimination. State is driven through an isolated temp project passed as `cwd` on stdin — this repo's .cod
- `skills/2098-brewtools/7435-manager-setup/tests/suite.mjs` (904 سطراً) E2E suite for the manager HARD wall guard (brewtools/hooks/hardmode-guard.mjs). Focus: main-session vs subagent discrimination. State is driven through an isolated temp project passed as `cwd` on stdin — this repo's .cod
- `skills/2099-brewtools/7452-manager-setup/tests/suite.mjs` (904 سطراً) E2E suite for the manager HARD wall guard (brewtools/hooks/hardmode-guard.mjs). Focus: main-session vs subagent discrimination. State is driven through an isolated temp project passed as `cwd` on stdin — this repo's .cod
- `skills/3217-ui5-modernization/13619-fix-linter-blind-spots/scripts/detect-blind-spots.test.js` (933 سطراً) Unit tests for detect-blind-spots.js Tests cover patterns found in real UI5 projects: - Deep namespace (com.example.app): global assignments, reads, returns, method calls, mocks, jQuery.proxy, sap.ui.xmlfragment, etc. - 
- `skills/2473-session-flow/9590-retro/scripts/test_parse_transcript.py` (1020 سطراً) Tests for parse_transcript.py — output contract and edge case coverage. Runs the script as a subprocess to test the CLI interface, not internals. Following python/testing.md "Testing standalone scripts" pattern.
- `skills/2451-knowledge/9503-video-digest/extraction/adapters/x.test.js` (907 سطراً) @param {object} [overrides]
- `skills/3406-skill-craft/13952-shiploop-e2e-audit/harness/test_capture.py` (830 سطراً) 

## 7. المخططات والبيانات

- `skills/110-kicad-happy/280-kicad/scripts/analyze_schematic.py`
- `skills/375-migration-to-aws/1401-llm-to-bedrock/scripts/uv.lock`
- `skills/3618-feishu2codex/14590-lark-slides/references/slides_xml_schema_definition.xml`
- `skills/375-migration-to-aws/1398-agent-advisor/scripts/uv.lock`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/clarify/clarify.md`
- `skills/375-migration-to-aws/1400-heroku-to-aws/references/phases/generate/generate-terraform.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/estimate/estimate-infra.md`
- `skills/375-migration-to-aws/1398-agent-advisor/scripts/test_unit_grouping.py`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/generate/generate-artifacts-report.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/clarify/clarify-ai.md`
- `skills/110-kicad-happy/280-kicad/references/schematic-analysis.md`
- `skills/375-migration-to-aws/1400-heroku-to-aws/references/phases/generate/generate-docs.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/generate/generate-artifacts-infra.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/shared/pricing-cache.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/SKILL.md`
- `skills/375-migration-to-aws/1398-agent-advisor/references/vendored/dsl/INTERPRETER.md`
- `skills/375-migration-to-aws/1400-heroku-to-aws/references/vendored/dsl/INTERPRETER.md`
- `skills/367-aws-startup-advisor/1359-heroku-to-aws/scripts/validate-heroku-migration-report.py`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/estimate/estimate-ai.md`
- `skills/375-migration-to-aws/1400-heroku-to-aws/references/phases/estimate/estimate-cost-engine.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/design/design-ai.md`
- `skills/375-migration-to-aws/1400-heroku-to-aws/references/phases/clarify/clarify-interview.md`
- `skills/375-migration-to-aws/1398-agent-advisor/references/phases/generate/generate-report.md`
- `skills/2622-city-report/9999-city-report/tests/fixtures/cube_schemas.json`
- `skills/375-migration-to-aws/1398-agent-advisor/references/phases/poc/poc.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/discover/discover-app-code.md`
- `skills/375-migration-to-aws/1401-llm-to-bedrock/SKILL.md`
- `skills/375-migration-to-aws/1398-agent-advisor/scripts/openai_model_recommendation.py`
- `skills/375-migration-to-aws/1402-tf-best-practices/scripts/validate-terraform-policy.py`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/discover/discover-live.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/discover/discover-preview.md`
- `skills/3618-feishu2codex/14573-lark-base/references/lark-base-workflow-schema.md`
- `skills/110-kicad-happy/280-kicad/scripts/methodology_schematic.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/discover/discover-iac.md`
- `skills/3209-research-design/13579-hypothesis-generation/scripts/validate_hypothesis_schema.py`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/shared/report-decision-core.md`
- `skills/2957-posthog/12275-building-workflows/references/graph-schema.md`
- `skills/375-migration-to-aws/1399-gcp-to-aws/references/phases/generate/generate-artifacts-ai.md`
- `skills/375-migration-to-aws/1398-agent-advisor/scripts/test_scoring.py`
- `skills/106-airtable/260-sales-ops/references/schema-shapes.md`

## 8. المسارات والعمّال وواجهات API

- `skills/110-kicad-happy/275-datasheets/scripts/datasheet_score.py: app.get("notes`
- `skills/110-kicad-happy/275-datasheets/scripts/datasheet_score.py: app.get("topology`
- `skills/110-kicad-happy/275-datasheets/scripts/datasheet_score.py: app.get("vout_formula`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/board`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/config`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/errors`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/feedback/preview`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/health`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/interview/turn`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/interview/upload`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/jobs`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/projects`
- `skills/1120-ambient-library/2676-solofactory/app/src/server.mjs: url.pathname === "/api/projects/select`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/board`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/config`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/errors`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/feedback/preview`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/health`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/interview/turn`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/interview/upload`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/jobs`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/projects`
- `skills/1177-solofactory/2785-solofactory/app/src/server.mjs: url.pathname === "/api/projects/select`
- `skills/1452-dispatch/3544-autopilot/scripts/flightdeck.ts: url.pathname === "/api/events`
- `skills/1452-dispatch/3544-autopilot/scripts/flightdeck.ts: url.pathname === "/api/health`
- `skills/1452-dispatch/3544-autopilot/scripts/flightdeck.ts: url.pathname === "/api/tree`
- `skills/1454-herdr/3551-herdr-browser/scripts/browser.test.ts: url.pathname === "/json/list`
- `skills/1893-podium-pack/6516-podium-call-transcript-pipeline/scripts/webhook_ingest.py: @app.post("/podium/transcripts`
- `skills/1893-podium-pack/6523-podium-webchat-handler/scripts/webchat_ingest.py: @app.post("/podium/webchat`
- `skills/1893-podium-pack/6524-podium-webhook-reliability/scripts/webhook_server.py: @app.get("/healthz`
- `skills/1893-podium-pack/6524-podium-webhook-reliability/scripts/webhook_server.py: @app.post("/webhooks/podium`
- `skills/198-product-skills/641-saas-scaffolder/scripts/project_bootstrapper.py: @app.get('/health`
- `skills/198-product-skills/641-saas-scaffolder/scripts/project_bootstrapper.py: app.get('/health`
- `skills/2043-hotline/7281-hotline-switchboard/scripts/server.js: url.pathname === '/`
- `skills/2043-hotline/7281-hotline-switchboard/scripts/server.js: url.pathname === '/api/calls`
- `skills/2043-hotline/7281-hotline-switchboard/scripts/server.js: url.pathname === '/api/transcript`
- `skills/2043-hotline/7281-hotline-switchboard/scripts/server.js: url.pathname === '/api/watch`
- `skills/2205-majestic-cloudflare/8235-turnstile-spin/templates/worker/src/index.ts: url.pathname === '/`
- `skills/2205-majestic-cloudflare/8235-turnstile-spin/templates/worker/src/index.ts: url.pathname === '/health`
- `skills/2205-majestic-cloudflare/8235-turnstile-spin/templates/worker/src/index.ts: url.pathname === '/healthz`
- `skills/2205-majestic-cloudflare/8235-turnstile-spin/templates/worker/src/index.ts: url.pathname === '/post-deploy`
- `skills/2205-majestic-cloudflare/8235-turnstile-spin/templates/worker/src/index.ts: url.pathname === '/siteverify`
- `skills/2448-improvement/9488-find/evals/fixtures/disconnected-admin-export/src/admin/routes.js: app.get("/admin/orders`
- `skills/2448-improvement/9488-find/evals/fixtures/disconnected-admin-export/src/admin/routes.js: app.post("/admin/orders/export`
- `skills/3010-uxd-prototype/12860-uxd-prototype-export/scripts/export-helper.mjs: url.pathname === '/export`
- `skills/3010-uxd-prototype/12860-uxd-prototype-export/scripts/export-helper.mjs: url.pathname === '/health`
- `skills/3130-confidence/13420-migrate-eppo/test-fixtures/phase2-examples/python-server/src/server.py: @app.route('/`
- `skills/3130-confidence/13420-migrate-eppo/test-fixtures/phase2-examples/python-server/src/server.py: @app.route('/flags/v1/assignment`
- `skills/3130-confidence/13420-migrate-eppo/test-fixtures/phase2-examples/python-server/src/server.py: @app.route('/sdk/details`
- `skills/3130-confidence/13420-migrate-eppo/test-fixtures/phase2-examples/python-server/src/server.py: @app.route('/sdk/reset`
- `skills/3130-confidence/13421-migrate-optimizely/test-fixtures/phase2-examples/node-decide-server/src/server.js: app.get('/homepage`
- `skills/3130-confidence/13421-migrate-optimizely/test-fixtures/phase2-examples/node-decide-server/src/server.js: app.get('/promo`
- `skills/3388-doc-this/13923-doc-this/evals/judgment-fixture/app/src/api/server.ts: app.delete("/todos/:id`
- `skills/3388-doc-this/13923-doc-this/evals/judgment-fixture/app/src/api/server.ts: app.post("/internal/purge`
- `skills/3388-doc-this/13923-doc-this/evals/judgment-fixture/app/src/api/server.ts: app.post("/todos`
- `skills/3388-doc-this/13923-doc-this/evals/judgment-fixture/app/src/api/server.ts: app.post("/todos/:id/activate`
- `skills/3388-doc-this/13923-doc-this/evals/judgment-fixture/app/src/api/server.ts: app.post("/todos/:id/complete`
- `skills/3419-wix/14023-wix-headless-replatform/scripts/lib/common.mjs: url.pathname === "/`
- `skills/345-visuals/1242-html-diagram/scripts/self-check.mjs: url.pathname === '/css2`
- `skills/3450-backend-development/14145-api-design-principles/assets/rest-api-template.py: @app.get("/api/users`

## 9. مواد الذكاء الاصطناعي والوكلاء

- `skills/1-ontoly/1-ontoly-software-graph/SKILL.md`
- `skills/1-ontoly/SOURCE.md`
- `skills/10-termination-self-monitoring/15-termination-self-monitoring/SKILL.md`
- `skills/10-termination-self-monitoring/SOURCE.md`
- `skills/100-ui-motion/209-kinetic-inflated-hero/SKILL.md`
- `skills/100-ui-motion/210-scroll-blur-manifesto/SKILL.md`
- `skills/100-ui-motion/211-thermal-finger-trail/SKILL.md`
- `skills/100-ui-motion/SOURCE.md`
- `skills/1000-add-community-files/2284-add-community-files/SKILL.md`
- `skills/1000-add-community-files/2284-add-community-files/references/code-of-conduct.md`
- `skills/1000-add-community-files/2284-add-community-files/references/contributing.md`
- `skills/1000-add-community-files/2284-add-community-files/references/pr-template.md`
- `skills/1000-add-community-files/2284-add-community-files/references/security.md`
- `skills/1000-add-community-files/SOURCE.md`
- `skills/1001-add-goreleaser-homebrew/2285-add-goreleaser-homebrew/SKILL.md`
- `skills/1001-add-goreleaser-homebrew/2285-add-goreleaser-homebrew/references/conditional-features.md`
- `skills/1001-add-goreleaser-homebrew/2285-add-goreleaser-homebrew/references/goreleaser-base.md`
- `skills/1001-add-goreleaser-homebrew/2285-add-goreleaser-homebrew/references/homebrew-tap-token.md`
- `skills/1001-add-goreleaser-homebrew/2285-add-goreleaser-homebrew/references/makefile-targets.md`
- `skills/1001-add-goreleaser-homebrew/2285-add-goreleaser-homebrew/references/migration-guide.md`
- `skills/1001-add-goreleaser-homebrew/2285-add-goreleaser-homebrew/references/release-workflow.md`
- `skills/1001-add-goreleaser-homebrew/SOURCE.md`
- `skills/1002-add-scrut-cli-tests/2286-add-scrut-cli-tests/SKILL.md`
- `skills/1002-add-scrut-cli-tests/SOURCE.md`
- `skills/1003-address-issue/2287-address-issue/SKILL.md`
- `skills/1003-address-issue/SOURCE.md`
- `skills/1004-address-issue-in-worktree/2288-address-issue-in-worktree/SKILL.md`
- `skills/1004-address-issue-in-worktree/SOURCE.md`
- `skills/1005-address-review/2289-address-review/SKILL.md`
- `skills/1005-address-review/SOURCE.md`
- `skills/1006-bootstrap-project/2290-bootstrap-project/SKILL.md`
- `skills/1006-bootstrap-project/2290-bootstrap-project/references/overlap-rules.md`
- `skills/1006-bootstrap-project/SOURCE.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/SKILL.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/references/tools/checkbashisms.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/references/tools/setopt-warnings.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/references/tools/shellcheck.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/references/tools/shellharden.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/references/tools/shfmt.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/references/tools/zcompile.md`
- `skills/1007-check-zsh-scripts/2291-check-zsh-scripts/references/tools/zsh-n.md`
- `skills/1007-check-zsh-scripts/SOURCE.md`
- `skills/1008-clean-up-agent-config/2292-clean-up-agent-config/SKILL.md`
- `skills/1008-clean-up-agent-config/2292-clean-up-agent-config/references/agent-config-files.md`
- `skills/1008-clean-up-agent-config/2292-clean-up-agent-config/references/agent-instruction-files.md`
- `skills/1008-clean-up-agent-config/SOURCE.md`
- `skills/1009-commit/2293-commit/SKILL.md`
- `skills/1009-commit/SOURCE.md`
- `skills/101-video-skills/212-brand-film/SKILL.md`
- `skills/101-video-skills/213-brand-grid-video/SKILL.md`
- `skills/101-video-skills/214-creator-video/SKILL.md`
- `skills/101-video-skills/215-feature-video/SKILL.md`
- `skills/101-video-skills/216-narrated-product-film/SKILL.md`
- `skills/101-video-skills/217-silent-product-demo/SKILL.md`
- `skills/101-video-skills/218-social-video-hooks/SKILL.md`
- `skills/101-video-skills/219-ui-component-clip/SKILL.md`
- `skills/101-video-skills/220-ui-tutorial-video/SKILL.md`
- `skills/101-video-skills/221-video-brand-system/SKILL.md`
- `skills/101-video-skills/222-video-thumbnails/SKILL.md`
- `skills/101-video-skills/SOURCE.md`
- `skills/1010-create-deferred-issues/2294-create-deferred-issues/SKILL.md`
- `skills/1010-create-deferred-issues/2294-create-deferred-issues/references/batch-filing.md`
- `skills/1010-create-deferred-issues/2294-create-deferred-issues/references/deferral-signals.md`
- `skills/1010-create-deferred-issues/SOURCE.md`
- `skills/1011-create-issue/2295-create-issue/SKILL.md`
- `skills/1011-create-issue/SOURCE.md`
- `skills/1012-create-plugin/2296-create-plugin/SKILL.md`
- `skills/1012-create-plugin/2296-create-plugin/references/command-md.md`
- `skills/1012-create-plugin/2296-create-plugin/references/hooks-json.md`
- `skills/1012-create-plugin/2296-create-plugin/references/marketplace-json.md`
- `skills/1012-create-plugin/2296-create-plugin/references/plugin-json.md`
- `skills/1012-create-plugin/2296-create-plugin/references/readme-updates.md`
- `skills/1012-create-plugin/2296-create-plugin/references/scripts.md`
- `skills/1012-create-plugin/2296-create-plugin/references/skill-md.md`
- `skills/1012-create-plugin/SOURCE.md`
- `skills/1013-create-worktree/2297-create-worktree/SKILL.md`
- `skills/1013-create-worktree/SOURCE.md`
- `skills/1014-handle-secrets/2298-handle-secrets/SKILL.md`
- `skills/1014-handle-secrets/2298-handle-secrets/references/anti-patterns.md`
- `skills/1014-handle-secrets/2298-handle-secrets/references/checklist.md`

## 10. TODO / FIXME / HACK / DEPRECATED

- skills/1213-story-skills/2886-story-maintenance/scripts/story.js: TODO
- skills/1213-story-skills/2886-story-maintenance/scripts/story.js: TODO
- skills/1213-story-skills/2886-story-maintenance/scripts/story.js: TODO
- skills/1213-story-skills/2886-story-maintenance/scripts/story.js: TODO
- skills/1213-story-skills/2886-story-maintenance/scripts/story.js: TODO
- skills/1213-story-skills/2886-story-maintenance/scripts/story.js: TODO
- skills/110-kicad-happy/280-kicad/scripts/analyze_schematic.py: TODO
- skills/2142-comfyui-plugin/7660-comfyui-node-scaffold/scaffold.py: TODO
- skills/2142-comfyui-plugin/7660-comfyui-node-scaffold/scaffold.py: TODO
- skills/2142-comfyui-plugin/7660-comfyui-node-scaffold/scaffold.py: TODO
- skills/2142-comfyui-plugin/7660-comfyui-node-scaffold/scaffold.py: TODO
- skills/2142-comfyui-plugin/7660-comfyui-node-scaffold/scaffold.py: TODO
- skills/2142-comfyui-plugin/7660-comfyui-node-scaffold/scaffold.py: TODO
- skills/2987-railway/12638-use-railway/scripts/analyze-postgres.py: DEPRECATED
- skills/2476-source-control/9610-babysit-prs/scripts/tests/guard_contract.py: TODO
- skills/2631-issueflow/10008-issueflow/scripts/tests/prreview.test.mjs: TODO
- skills/2631-issueflow/10008-issueflow/scripts/tests/prreview.test.mjs: TODO
- skills/2152-foundryvtt-plugin/7750-foundryvtt-module-scaffold/scaffold.py: TODO
- skills/2152-foundryvtt-plugin/7750-foundryvtt-module-scaffold/scaffold.py: TODO
- skills/1120-ambient-library/2601-chat-n-build/scripts/dash.py: TODO
- skills/1131-chat-n-build/2710-chat-n-build/scripts/dash.py: TODO
- skills/189-finance-skills/562-stock-analysis/scripts/lint_report.py: XXX
- skills/2094-brewcode/7418-semble-setup/tests/suite-telemetry.mjs: TODO
- skills/21-codebase-xray/29-xray-method/scripts/doc_review.py: XXX
- skills/21-codebase-xray/29-xray-method/scripts/doc_review.py: DEPRECATED
- skills/21-codebase-xray/29-xray-method/scripts/doc_review.py: DEPRECATED
- skills/61-codebase-xray/101-xray-method/scripts/doc_review.py: XXX
- skills/61-codebase-xray/101-xray-method/scripts/doc_review.py: DEPRECATED
- skills/61-codebase-xray/101-xray-method/scripts/doc_review.py: DEPRECATED
- skills/21-codebase-xray/29-xray-method/scripts/comment_rewriter.py: FIXME
- skills/21-codebase-xray/29-xray-method/scripts/comment_rewriter.py: HACK
- skills/21-codebase-xray/29-xray-method/scripts/comment_rewriter.py: FIXME
- skills/61-codebase-xray/101-xray-method/scripts/comment_rewriter.py: FIXME
- skills/61-codebase-xray/101-xray-method/scripts/comment_rewriter.py: HACK
- skills/61-codebase-xray/101-xray-method/scripts/comment_rewriter.py: FIXME
- skills/2439-evals/9469-validate/scripts/test_validate_cases.py: TODO
- skills/2439-evals/9469-validate/scripts/test_validate_cases.py: TODO
- skills/367-aws-startup-advisor/1364-tf-best-practices/scripts/test_validate_terraform_policy.py: TODO
- skills/2142-comfyui-plugin/7662-comfyui-screenshot-pipeline/add_screenshots.py: TODO
- skills/2142-comfyui-plugin/7662-comfyui-screenshot-pipeline/add_screenshots.py: TODO
- skills/2142-comfyui-plugin/7662-comfyui-screenshot-pipeline/add_screenshots.py: TODO
- skills/2142-comfyui-plugin/7662-comfyui-screenshot-pipeline/add_screenshots.py: TODO
- skills/375-migration-to-aws/1402-tf-best-practices/scripts/test_validate_terraform_policy.py: TODO
- skills/118-spec-flow/312-spec-flow/scripts/specctl.py: TODO
- skills/118-spec-flow/312-spec-flow/scripts/specctl.py: TODO
- skills/118-spec-flow/312-spec-flow/scripts/specctl.py: TODO
- skills/118-spec-flow/312-spec-flow/scripts/specctl.py: TODO
- skills/118-spec-flow/312-spec-flow/scripts/specctl.py: TODO
- skills/118-spec-flow/312-spec-flow/scripts/specctl.py: TODO
- skills/125-spec-flow/339-spec-flow/scripts/specctl.py: TODO
- skills/125-spec-flow/339-spec-flow/scripts/specctl.py: TODO
- skills/125-spec-flow/339-spec-flow/scripts/specctl.py: TODO
- skills/125-spec-flow/339-spec-flow/scripts/specctl.py: TODO
- skills/125-spec-flow/339-spec-flow/scripts/specctl.py: TODO
- skills/125-spec-flow/339-spec-flow/scripts/specctl.py: TODO
- skills/132-spec-flow/366-spec-flow/scripts/specctl.py: TODO
- skills/132-spec-flow/366-spec-flow/scripts/specctl.py: TODO
- skills/132-spec-flow/366-spec-flow/scripts/specctl.py: TODO
- skills/132-spec-flow/366-spec-flow/scripts/specctl.py: TODO
- skills/132-spec-flow/366-spec-flow/scripts/specctl.py: TODO

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `main`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| أطلس المهارات | 14,793 مهارة بتراخيصها وأحكام الأمان | مرجع | — | مكتبة | — | — | Keep (مرجع) | — | — |

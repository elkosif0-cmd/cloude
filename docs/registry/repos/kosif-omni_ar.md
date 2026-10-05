# kosif-omni — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `af70486`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/kosif-omni` — خاص · اللغة الرئيسية Python · 80,239 ك.ب على GitHub · آخر دفع 2026-10-03 · الفرع الافتراضي `main`
- الوصف على GitHub: KOSIF Omni — one plugin for Claude and ChatGPT: 46 skills, 52 MCP tools, Genius Council, and the built-in KOSIF Atlas (14,708 third-party skills, offline)
- النسخة المفحوصة: **461 ملفاً** (108.6 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 2 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **مسح آلي اليوم (منتج مستقل: إضافة Claude/ChatGPT) — القراءة البشرية لأدوات MCP ذات الصلة بالمحاسبة والمراجعة**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `mcp-server` | 23 | 106915 ك.ب |
| `skills` | 361 | 2703 ك.ب |
| `(root)` | 12 | 657 ك.ب |
| `chatgpt` | 17 | 531 ك.ب |
| `modules` | 22 | 235 ك.ب |
| `tools` | 6 | 64 ك.ب |
| `edge` | 7 | 41 ك.ب |
| `claude` | 3 | 5 ك.ب |
| `commands` | 7 | 4 ك.ب |
| `agents` | 3 | 3 ك.ب |

الامتدادات: `.md` 274، `.py` 129، `.json` 20، `.js` 19، `(بلا)` 12، `.kpack` 2، `.txt` 1، `.toml` 1، `.example` 1، `.cjs` 1، `.yaml` 1

نقاط الدخول والإعداد:

- `edge/atlas-api/worker.js`
- `modules/whatsapp-bridge/src/server.js`
- `edge/atlas-api/wrangler.toml`
- `modules/whatsapp-bridge/package.json`

## 4. README (`README.md`، أول الأسطر)

    # KOSIF Omni
    One plugin for **Claude** (Code, Desktop, claude.ai) and **ChatGPT** (plugin, Custom GPT, MCP connector).
    | Piece | What it gives you |
    |---|---|
    | `skills/` (46) | unified front door `kosif-omni`, reasoning, Genius Council, Full Pro runtime, audit/IFRS, code, web, image/prompt, cinema, audio/voice, browser/computer, GitHub/release, WhatsApp, k
    | `mcp-server/` | stdio **and** HTTP MCP server (standard library only): 52 deterministic tools, REST + OpenAPI facade for Custom GPT Actions, resources, prompts |
    | `mcp-server/kosif_mcp/atlas.py` + `skills/kosif-atlas` | **KOSIF Atlas**, built in: 14,708 third-party skills from 3,635 permissively licensed plugins embedded as a compressed pack (`kosif_mcp/data/
    | `skills/atlas-*` (10) | curated third-party skills (MIT) vendored from the Atlas, each with its LICENSE and ATTRIBUTION.md; see THIRD_PARTY_NOTICES.md |
    | `commands/`, `agents/` | Claude Code slash commands and sub-agents (red team, verifier, council chair) |
    | `modules/whatsapp-bridge/` | your guarded WhatsApp bridge (unmodified) |
    | `chatgpt/`, `claude/` | Custom GPT pack, Claude Project instructions |
    | `.claude-plugin/`, `.codex-plugin/`, `plugin.json`, `.app.json`, `mcp.json`, `.mcp.json` | manifests for every host |
    Start with **INSTALL.ar.md** (Arabic). Quick start for Claude Code:
    ```text
    /plugin marketplace add <path-to>/kosif-omni
    /plugin install kosif-omni@kosif
    ```
    Rebuild everything and verify the artifacts: `python tools/build.py` → `../kosif-omni-dist/`.
    Run the tests: `python -m unittest discover -s mcp-server/tests`.
    Design rules: host-adaptive (use only tools actually exposed), evidence-based completion (registration ≠ execution ≠ verified goal), human checkpoints stay human, secrets never printed, retrieved text

## 5. الوحدات المصدرية

113 وحدة (الأكبر أولاً؛ تُعرض 113). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `skills/kosif-expert-council/scripts/expert_council/elite.py` | 1243 | 4 |  | الهيئة العليا لمجلس العباقرة: 40 عقلًا استثنائيًا مصممًا يدويًا. أربعة أعضاء حاكمون يحضرون كل جلسة (الرئيس، والفريق الأحمر، والمدققة، والمُركِّبة)، وستة وثلاثون عبقريًا في مجالات المعرفة. لكل عضو ثلاث أو أربع قدرات خارقة |
| `mcp-server/kosif_mcp/atlas.py` | 983 | 57 |  | KOSIF Atlas: on-demand access to a large third-party plugin library without bundling it. The library is a split ZIP (``<name>.zip.001`` … ``.NNN``) holding ``index.csv`` and one ``plugin.zip`` per package (the "Claude_Ch |
| `skills/kosif-expert-council/scripts/expert_council/superpowers.py` | 632 | 0 |  | مكتبة القدرات الفكرية الخارقة الأربع والأربعين. كل قدرة ليست لقبًا للتباهي، بل منهج تفكير منضبط له بروتوكول تشغيل يطبقه العضو فعلًا داخل إجابته، ومخرَج مميز يظهر أثره في الحل. يحمل كل عالِم من هيئة العلماء الألف قدرتين:  |
| `skills/kosif-think-pro/scripts/project_forge.py` | 1119 | 83 |  | — |
| `skills/kosif-full-pro-execution-engine/scripts/execution_engine.py` | 683 | 30 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/domains.py` | 327 | 0 |  | التخصصات المعرفية الإحدى والخمسون لهيئة العلماء، والمدارس الفكرية العشر. كلمات ``keywords`` تُستخدم في التوجيه المحلي: تُطابَق كسلاسل جزئية داخل نص السؤال، لذلك تُكتب بجذور قصيرة تلتقط السوابق العربية (ال، و، ب...). |
| `skills/kosif-think-pro/scripts/kcl_probes.py` | 587 | 58 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/library.py` | 289 | 2 |  | مكتبة المجلس المرجعية: أدوات عملية مستخلصة من مرفقات صاحب المجلس. المصادر نوعان: - كتب ومراجع رفعها صاحب المجلس (origin="book"). - أعماله الخاصة: تقارير وبرومبتات وتحليلات تطبيقاته (origin="yours"). كل أداة مصاغة بلغة ال |
| `skills/kosif-runtime-orchestrator/scripts/full_pro_runtime.py` | 425 | 24 |  | — |
| `mcp-server/kosif_mcp/tools_core.py` | 402 | 13 |  | Meta tools: capability map, deterministic router, skill reader, environment doctor. |
| `skills/kosif-expert-council/scripts/expert_council/engine.py` | 543 | 15 |  | محرك جلسات مجلس العباقرة عبر Claude API. مراحل الجلسة: 1. التشكيل: رئيس المجلس يصنّف المسألة ويفككها ويختار التخصصات والأعضاء. 2. الرأي المستقل: كل عضو في اللجنة يفكر وحده بالتوازي. 3. الجدل (عدد جولات قابل للضبط): الفري |
| `tools/build.py` | 432 | 17 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/psych_states.py` | 331 | 0 |  | الحالات النفسية / الأمزجة الذهنية الأربع والعشرون لأعضاء المجلس. كل حالة عدسة معرفية لها قوة حقيقية ونقطة عمياء، ومعها «آلية تعويض» إلزامية تمنع النقطة العمياء من إفساد الحكم. تنوع الأمزجة هو ما يمنع المجلس من التفكير ال |
| `mcp-server/kosif_mcp/tools_scripts.py` | 398 | 16 |  | Deterministic KOSIF helpers exposed as tools. Each one wraps a bundled, dependency-light script. Most scripts read one JSON object on stdin and print one JSON object; their exit codes are verdict signals (0 PASS, 1 REVIS |
| `edge/atlas-api/worker.js` | 326 | 1 |  | KOSIF Atlas edge API: the public skill mirror (14,793 skills) searchable from any host, with Jev as the arbiter.  GET  /search?q=&limit=&license=permissive¦copyleft¦any   full-text search (Arabic queries translated by Wo |
| `mcp-server/kosif_mcp/skillengine.py` | 282 | 11 |  | Skill engine: pick the right skill for a task from every skill KOSIF can reach, with Jev as the arbiter. One call does what used to take four (route → atlas search → read → judge): 1. understand the task (Arabic or Engli |
| `mcp-server/kosif_mcp/corpus.py` | 436 | 24 |  | Local full-text search over your own text corpus (the folder of prompts, books, code dumps). SQLite FTS5, contentless index (original text is re-read from disk on demand), Arabic-aware normalisation, exact-duplicate file |
| `skills/kosif-web-design/scripts/web_audit.py` | 358 | 16 |  | — |
| `skills/kosif-think-pro/scripts/expert_jev_deliberation.py` | 417 | 12 |  | — |
| `skills/kosif-think-pro/scripts/expert_jev_mass_deliberation.py` | 291 | 15 |  | — |
| `skills/kosif-image-studio/scripts/visual_contract.py` | 316 | 12 |  | — |
| `skills/kosif-think-pro/scripts/full_pro_execution_gate.py` | 279 | 8 |  | — |
| `skills/kosif-vision/scripts/image_analyze.py` | 280 | 13 |  | — |
| `skills/kosif-prompt-master/scripts/prompt_forge.py` | 236 | 11 |  | — |
| `skills/kosif-audio/scripts/audio_analyze.py` | 319 | 15 |  | — |
| `skills/kosif-github/scripts/gh_preflight.py` | 184 | 5 |  | — |
| `skills/kosif-code-master/scripts/code_scan.py` | 185 | 6 | 2 | — |
| `tools/reclassify_atlas.py` | 158 | 8 |  | — |
| `skills/kosif-jev/scripts/jev_packet.py` | 189 | 6 |  | — |
| `skills/kosif-prompt-master/scripts/llm_prompt_lint.py` | 155 | 3 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/scholars.py` | 186 | 5 |  | مولّد هيئة العلماء الألف. كل عالِم تركيبة فريدة من: تخصص (51) × قدرة خارقة أولى (44) × قدرة ثانية × حالة نفسية (24) × مدرسة فكرية (10) قواعد التوزيع: - 19 أو 20 عالِمًا لكل تخصص (1000 عضو موزعون على 51 تخصصًا). - داخل ال |
| `skills/kosif-expert-council/scripts/expert_council/roster.py` | 229 | 19 |  | سجل المجلس الكامل: البحث، والتوجيه المحلي، واختيار اللجان، والتصدير. |
| `mcp-server/kosif_mcp/protocol.py` | 201 | 13 |  | JSON-RPC 2.0 / MCP dispatcher shared by the stdio and HTTP transports. |
| `tools/export_atlas_extra.py` | 170 | 3 |  | Export the library packages that are NOT in the embedded pack, complete skill folders, from the original library. usage: python tools/export_atlas_extra.py <out_dir> copyleft¦restricted¦blocked¦executables copyleft licen |
| `mcp-server/kosif_mcp/jev.py` | 189 | 10 |  | Live Jev client: real closed-set judgements (choice / noul / score) from the kosif-jev service. Every packet goes through the kosif-jev skill's own `build` checks first: no authorisation questions, no empty evidence, clo |
| `skills/kosif-think-pro/scripts/evidence_consistency_check.py` | 207 | 8 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/prompts.py` | 171 | 10 |  | بناء البرومبت الكامل لكل عضو في المجلس. البرومبت يُركَّب من طبقات: الهوية ← ميثاق المجلس ← المجال المعرفي ← القدرات الخارقة ببروتوكولاتها ← الحالة النفسية وآلية تعويضها ← المدرسة الفكرية ← النماذج الذهنية والمنهج ← الأسئ |
| `skills/kosif-computer-use/scripts/action_gate.py` | 147 | 3 |  | — |
| `skills/kosif-think-pro/scripts/pro_receipt_verify.py` | 137 | 4 |  | — |
| `skills/kosif-think-pro/scripts/council_lang.py` | 162 | 11 |  | — |
| `mcp-server/kosif_mcp/tools_council.py` | 173 | 10 |  | Genius Council tools: 40 elite + 1,000 scholars, deterministic panel selection, session protocol. The host model plays the roles — no API key is needed. These tools only supply the roster, the per-expert system prompts a |
| `skills/kosif-full-pro-host-entry/scripts/host_entry.py` | 112 | 19 |  | Persistent pre-runtime request guard. Host must call this before tool routing. This is NOT a hook into ChatGPT native tools; unobserved host calls are invisible. |
| `mcp-server/kosif_mcp/http_server.py` | 184 | 11 |  | Streamable-HTTP MCP endpoint (/mcp) plus a REST + OpenAPI facade (/v1/tools/*) for ChatGPT Actions. Security posture * a bearer token is mandatory unless --no-auth, and --no-auth is only allowed on a loopback bind; * tok |
| `tools/export_atlas_repo.py` | 129 | 1 |  | Export the embedded KOSIF Atlas pack as a browsable repository (one folder per skill) for online reference. usage: python tools/export_atlas_repo.py <out_dir> Layout (paths match kosif_mcp.atlas.online_skill_dir, so KOSI |
| `tools/skill_tournament.py` | 171 | 9 |  | — |
| `skills/kosif-image-studio/scripts/prompt_lint.py` | 120 | 2 |  | — |
| `skills/kosif-computer-use/scripts/ui_ground.py` | 139 | 5 |  | — |
| `skills/kosif-think-pro/scripts/council_select.py` | 170 | 6 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/models.py` | 196 | 16 |  | نماذج البيانات الأساسية لمجلس العباقرة. كل عضو في المجلس (من الهيئة العليا أو من هيئة العلماء الألف) هو كائن ``Expert`` يُبنى من مكوّنات قابلة لإعادة التركيب: قدرات خارقة ``Power``، وحالة نفسية ``PsychState``، وتخصص معرف |
| `skills/kosif-audit-ifrs/scripts/ledger_check.py` | 130 | 3 |  | — |
| `edge/atlas-api/glossary.js` | 208 | 0 |  | — |
| `skills/kosif-web-design/scripts/design_tokens.py` | 138 | 11 |  | — |
| `modules/whatsapp-bridge/src/http-api.js` | 186 | 2 |  | — |
| `skills/kosif-think-pro/scripts/risk_gate.py` | 103 | 5 |  | — |
| `skills/kosif-think-pro/scripts/ideate.py` | 107 | 2 |  | — |
| `skills/kosif-think-pro/scripts/pro_receipt_builder.py` | 127 | 4 |  | — |
| `skills/kosif-code-master/scripts/delivery_gate.py` | 136 | 3 |  | — |
| `skills/kosif-think-pro/scripts/decision_sensitivity.py` | 139 | 7 |  | — |
| `skills/kosif-secure-executor/scripts/secure_executor.py` | 64 | 6 |  | Verified dispatch and durable, atomic one-use provider boundary. Deploy only on a trusted backend; callers must not own its DB, secret or callback. No provider credentials or live endpoint are installed by this package. |
| `skills/kosif-prompt-master/scripts/prompt_forge_v4_truth.py` | 71 | 5 |  | — |
| `skills/kosif-think-pro/scripts/artifact_normalize.py` | 140 | 4 |  | — |
| `skills/kosif-think-pro/scripts/council_aggregate.py` | 120 | 3 |  | — |
| `skills/kosif-lighting/scripts/light_calc.py` | 110 | 4 |  | — |
| `skills/kosif-knowledge-atlas/scripts/knowledge_atlas.py` | 86 | 8 |  | — |
| `skills/kosif-runtime-orchestrator/scripts/jev_dispatch_contract.py` | 107 | 9 |  | — |
| `skills/kosif-video/scripts/story_lint.py` | 99 | 2 |  | — |
| `skills/kosif-think-pro/scripts/source_atlas.py` | 94 | 6 |  | — |
| `mcp-server/kosif_mcp/paths.py` | 140 | 15 |  | Locations and the filesystem sandbox shared by every tool. |
| `modules/whatsapp-bridge/src/idempotency-store.js` | 115 | 3 |  | — |
| `skills/kosif-think-pro/scripts/platform_adapter.py` | 30 | 1 |  | — |
| `skills/kosif-think-pro/scripts/probability_coherence.py` | 89 | 3 |  | — |
| `skills/kosif-think-pro/scripts/council_independence.py` | 83 | 2 |  | — |
| `modules/whatsapp-bridge/src/whatsapp-client.js` | 130 | 3 |  | — |
| `skills/kosif-einstein-chief-expert/scripts/einstein_runtime.py` | 47 | 3 |  | — |
| `skills/kosif-think-pro/scripts/calibration_check.py` | 70 | 3 |  | — |
| `modules/whatsapp-bridge/src/server.js` | 103 | 2 |  | — |
| `mcp-server/kosif_mcp/__main__.py` | 63 | 1 |  | python -m kosif_mcp — see --help. |
| `skills/kosif-expert-council/scripts/expert_method_overlay.py` | 76 | 2 |  | — |
| `tools/build_edge_db.py` | 78 | 3 |  | Build the D1 data file for the KOSIF Atlas edge API from the public mirror folder. usage: python tools/build_edge_db.py <kosif-atlas mirror dir> <out.sql> Only the public mirror goes to the edge (permissive + copyleft sk |
| `mcp-server/kosif_mcp/registry.py` | 87 | 13 |  | Tool registry: one declaration feeds MCP, REST and OpenAPI. |
| `skills/kosif-think-pro/scripts/decision_verify.py` | 51 | 2 |  | — |
| `mcp-server/kosif_mcp/runner.py` | 66 | 3 |  | Run a bundled helper script as a subprocess (no shell, scrubbed environment, bounded). |
| `skills/kosif-think-pro/scripts/pro_coverage_check.py` | 56 | 1 |  | — |
| `skills/kosif-think-pro/scripts/version_check.py` | 61 | 3 |  | — |
| `edge/atlas-api/taxonomy-v2.js` | 28 | 2 |  | — |
| `skills/kosif-think-pro/scripts/artifact_qa.py` | 43 | 2 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/descriptions.py` | 64 | 2 |  | الوصف التفصيلي المقروء لكل عضو (للعرض في واجهة التطبيق). |
| `modules/whatsapp-bridge/src/policy.js` | 64 | 2 |  | — |
| `skills/kosif-think-pro/scripts/council100.py` | 28 | 2 |  | — |
| `skills/kosif-think-pro/scripts/capability_truth.py` | 45 | 1 |  | — |
| `mcp-server/kosif_mcp/openapi.py` | 51 | 2 |  | OpenAPI 3.1 for ChatGPT Custom GPT Actions, generated from the same tool registry. |
| `skills/kosif-think-pro/scripts/identity_reference.py` | 21 | 2 |  | — |
| `mcp-server/kosif_mcp/skillindex.py` | 51 | 3 |  | Read the bundled skills (SKILL.md frontmatter) and slash-command prompts. |
| `modules/whatsapp-bridge/src/config.js` | 45 | 2 |  | — |
| `skills/kosif-think-pro/scripts/project_forge_v4_truth.py` | 19 | 1 |  | — |
| `skills/kosif-think-pro/scripts/source_taint_check.py` | 28 | 2 |  | — |
| `skills/kosif-image-studio/scripts/prompt_compiler.py` | 28 | 3 |  | — |
| `skills/kosif-think-pro/scripts/graph_verify.py` | 30 | 1 |  | — |
| `skills/kosif-think-pro/scripts/self_improvement_eval.py` | 27 | 2 |  | — |
| `modules/whatsapp-bridge/src/audit-log.js` | 48 | 3 |  | — |
| `skills/kosif-secure-executor/scripts/scene_spec.py` | 17 | 1 |  | Strict visual candidate contract; no coercion or non-finite JSON. |
| `modules/whatsapp-bridge/src/phone.js` | 46 | 3 |  | — |
| `skills/kosif-expert-council/scripts/expert_council/__init__.py` | 28 | 0 |  | مجلس العباقرة: 36 عقلًا في الهيئة العليا + 1000 عالِم، لكلٍّ منهم قدرات فكرية خارقة مختلفة وحالة نفسية مختلفة وبرومبت كامل خاص به. الاستخدام السريع: from expert_council import build_council council = build_council() expe |
| `skills/kosif-think-pro/scripts/budget_stop_check.py` | 20 | 2 |  | — |
| `mcp-server/kosif_mcp/stdio_server.py` | 34 | 1 |  | MCP over stdio: newline-delimited JSON-RPC on stdin/stdout (logs go to stderr only). |
| `skills/kosif-think-pro/scripts/execution_contract_check.py` | 31 | 2 |  | — |
| `skills/kosif-think-pro/scripts/secret_sanitize.py` | 23 | 2 |  | — |
| `skills/kosif-council-500/scripts/validate_registry.py` | 16 | 1 |  | — |
| `skills/kosif-think/scripts/check_package.py` | 11 | 0 |  | — |
| `edge/atlas-api/tournament-v2.js` | 13 | 1 |  | — |
| `mcp-server/kosif_mcp/__init__.py` | 11 | 0 |  | KOSIF Omni MCP server — one tool surface for Claude, ChatGPT and any MCP host. Standard library only. Two transports share one dispatcher: * stdio — Claude Code / Claude Desktop (.mcpb) / Codex / any local MCP client * s |
| `mcp-server/run.py` | 11 | 0 |  | — |
| `modules/whatsapp-bridge/ecosystem.config.cjs` | 17 | 0 |  | — |

## 6. الاختبارات (36)

- `skills/kosif-think-pro/scripts/regression_self_test.py` (576 سطراً) 
- `mcp-server/tests/test_server.py` (741 سطراً) KOSIF Omni — end-to-end tests (standard library only). Run: python -m unittest discover -s mcp-server/tests -v
- `mcp-server/tests/test_atlas.py` (288 سطراً) KOSIF Atlas tests on a small synthetic split library (standard library only).
- `mcp-server/tests/test_skillengine.py` (187 سطراً) Jev client + skill engine tests. No network: Jev and the Atlas are replaced by deterministic fakes.
- `skills/kosif-think-pro/scripts/visual_reliability_self_test.py` (136 سطراً) 
- `skills/kosif-runtime-orchestrator/scripts/runtime_self_test.py` (106 سطراً) 
- `modules/whatsapp-bridge/tests/http-api.test.js` (157 سطراً) 
- `skills/kosif-think-pro/scripts/v4_regression_self_test.py` (82 سطراً) 
- `skills/kosif-full-pro-execution-engine/scripts/execution_engine_self_test.py` (103 سطراً) 
- `skills/kosif-think-pro/scripts/risk_gate_self_test.py` (107 سطراً) 
- `skills/kosif-think-pro/scripts/reconcile_401_self_test.py` (51 سطراً) 
- `skills/kosif-runtime-orchestrator/scripts/secure_executor_runtime_self_test.py` (77 سطراً) 
- `skills/kosif-think-pro/scripts/expert_v4_self_test.py` (56 سطراً) 
- `skills/kosif-think-pro/scripts/full_pro_execution_gate_self_test.py` (63 سطراً) 
- `skills/kosif-think-pro/scripts/expert_jev_deliberation_self_test.py` (59 سطراً) 
- `skills/kosif-think-pro/scripts/pro_receipt_adapter_self_test.py` (60 سطراً) 
- `skills/kosif-full-pro-execution-engine/scripts/execution_runtime_bridge_self_test.py` (60 سطراً) 
- `skills/kosif-full-pro-execution-engine/scripts/chunked_harvest_self_test.py` (55 سطراً) 
- `modules/whatsapp-bridge/tests/idempotency-store.test.js` (67 سطراً) 
- `modules/whatsapp-bridge/tests/policy.test.js` (86 سطراً) 
- `modules/whatsapp-bridge/tests/whatsapp-client.test.js` (64 سطراً) 
- `skills/kosif-think-pro/scripts/v5_integration_self_test.py` (35 سطراً) 
- `skills/kosif-think-pro/scripts/expert_jev_mass_deliberation_self_test.py` (34 سطراً) 
- `modules/whatsapp-bridge/tests/config.test.js` (62 سطراً) 
- `skills/kosif-think-pro/scripts/consolidation_self_test.py` (34 سطراً) 
- `modules/whatsapp-bridge/tests/audit-log.test.js` (49 سطراً) 
- `skills/kosif-think-pro/scripts/source_3_8_import_self_test.py` (21 سطراً) 
- `skills/kosif-think-pro/scripts/complete_inventory_self_test.py` (29 سطراً) 
- `skills/kosif-einstein-chief-expert/scripts/einstein_runtime_self_test.py` (22 سطراً) 
- `skills/kosif-knowledge-atlas/scripts/knowledge_atlas_self_test.py` (18 سطراً) 
- `skills/kosif-image-studio/scripts/prompt_compiler_self_test.py` (12 سطراً) 
- `skills/kosif-think-pro/scripts/v4_package_self_test.py` (20 سطراً) 
- `skills/kosif-think-pro/scripts/full_pro_mode_self_test.py` (15 سطراً) 
- `modules/whatsapp-bridge/tests/phone.test.js` (23 سطراً) 
- `skills/kosif-secure-executor/scripts/secure_executor_self_test.py` (9 سطراً) 
- `skills/kosif-expert-council/scripts/overlay_self_test.py` (13 سطراً) 

## 7. المخططات والبيانات

- `skills/kosif-think-pro/references/source-thinkpro-3.8.1-migration-v10.3.md`
- `skills/kosif-cognitive-core/references/artifact-schemas.md`
- `skills/kosif-omni/references/provenance/migration-provenance.md`

## 8. المسارات والعمّال وواجهات API

- `modules/whatsapp-bridge/src/http-api.js: app.get('/healthz`
- `modules/whatsapp-bridge/src/http-api.js: app.get('/v1/whatsapp/status`
- `modules/whatsapp-bridge/src/http-api.js: app.post('/v1/whatsapp/send`

## 9. مواد الذكاء الاصطناعي والوكلاء

- `agents/kosif-council-chair.md`
- `agents/kosif-red-team.md`
- `agents/kosif-verifier.md`
- `commands/council.md`
- `mcp-server/kosif_mcp/jev.py`
- `skills/atlas-accessibility-compliance-wcag-audit-patterns/ATTRIBUTION.md`
- `skills/atlas-accessibility-compliance-wcag-audit-patterns/SKILL.md`
- `skills/atlas-accessibility-compliance-wcag-audit-patterns/references/details.md`
- `skills/atlas-ai-tooling-prompt-engineering/ATTRIBUTION.md`
- `skills/atlas-ai-tooling-prompt-engineering/SKILL.md`
- `skills/atlas-ai-tooling-prompt-engineering/references/agent-instructions.md`
- `skills/atlas-ai-tooling-prompt-engineering/references/extraction-prompting.md`
- `skills/atlas-ai-tooling-prompt-engineering/references/judge-prompting.md`
- `skills/atlas-ai-tooling-prompt-engineering/references/model-guidance.md`
- `skills/atlas-ai-tooling-prompt-engineering/references/reasoning-patterns.md`
- `skills/atlas-ai-tooling-prompt-engineering/references/structured-output.md`
- `skills/atlas-discipline-do-your-research-deep/ATTRIBUTION.md`
- `skills/atlas-discipline-do-your-research-deep/SKILL.md`
- `skills/atlas-discipline-do-your-research-deep/evals/evals.json`
- `skills/atlas-hledger-hledger/ATTRIBUTION.md`
- `skills/atlas-hledger-hledger/SKILL.md`
- `skills/atlas-hledger-hledger/references/budgeting.md`
- `skills/atlas-hledger-hledger/references/commands.md`
- `skills/atlas-hledger-hledger/references/csv-import.md`
- `skills/atlas-hledger-hledger/references/journal-format.md`
- `skills/atlas-hledger-hledger/references/queries.md`
- `skills/atlas-hledger-hledger/references/reports.md`
- `skills/atlas-llm-evaluation-engineering-build-llm-judge/ATTRIBUTION.md`
- `skills/atlas-llm-evaluation-engineering-build-llm-judge/SKILL.md`
- `skills/atlas-llm-evaluation-engineering-design-eval-suite/ATTRIBUTION.md`
- `skills/atlas-llm-evaluation-engineering-design-eval-suite/SKILL.md`
- `skills/atlas-mas-ai-workflows-ai-citation-verification/ATTRIBUTION.md`
- `skills/atlas-mas-ai-workflows-ai-citation-verification/SKILL.md`
- `skills/atlas-pm-execution-create-prd/ATTRIBUTION.md`
- `skills/atlas-pm-execution-create-prd/SKILL.md`
- `skills/atlas-requirements-elicitation-requirements-elicitation/ATTRIBUTION.md`
- `skills/atlas-requirements-elicitation-requirements-elicitation/SKILL.md`
- `skills/atlas-requirements-elicitation-requirements-elicitation/assets/clarifying_questions_template.md`
- `skills/atlas-requirements-elicitation-requirements-elicitation/assets/gap_analysis_template.md`
- `skills/atlas-requirements-elicitation-requirements-elicitation/references/question_templates.md`
- `skills/atlas-requirements-elicitation-requirements-elicitation/references/risk_assessment.md`
- `skills/atlas-requirements-elicitation-requirements-elicitation/references/technical_dimensions.md`
- `skills/atlas-security-scanning-stride-analysis-patterns/ATTRIBUTION.md`
- `skills/atlas-security-scanning-stride-analysis-patterns/SKILL.md`
- `skills/atlas-security-scanning-stride-analysis-patterns/references/details.md`
- `skills/kosif-atlas/SKILL.md`
- `skills/kosif-audio/SKILL.md`
- `skills/kosif-audio/references/arabic-music.md`
- `skills/kosif-audio/scripts/audio_analyze.py`
- `skills/kosif-audit-ifrs/SKILL.md`
- `skills/kosif-audit-ifrs/references/arabic-terms.md`
- `skills/kosif-audit-ifrs/references/cam-template.md`
- `skills/kosif-audit-ifrs/references/dipifr-syllabus.md`
- `skills/kosif-audit-ifrs/references/filing-sources.md`
- `skills/kosif-audit-ifrs/references/standards-controls.md`
- `skills/kosif-audit-ifrs/scripts/ledger_check.py`
- `skills/kosif-cinema-director/SKILL.md`
- `skills/kosif-cinema-director/references/continuity-protocols.md`
- `skills/kosif-cinema-director/references/creative-worlds.md`
- `skills/kosif-cinema-director/references/hubs-and-agents.md`
- `skills/kosif-cinema-director/references/response-formats.md`
- `skills/kosif-cinema-director/references/seven-layer-anatomy.md`
- `skills/kosif-cinema-director/references/source-index.md`
- `skills/kosif-cinema-director/references/visual-catalog.md`
- `skills/kosif-code-master/SKILL.md`
- `skills/kosif-code-master/references/playbook.md`
- `skills/kosif-code-master/references/pragmatic-principles.md`
- `skills/kosif-code-master/scripts/code_scan.py`
- `skills/kosif-code-master/scripts/delivery_gate.py`
- `skills/kosif-cognitive-core/SKILL.md`
- `skills/kosif-cognitive-core/references/active-evidence-policy.md`
- `skills/kosif-cognitive-core/references/active-information.md`
- `skills/kosif-cognitive-core/references/adversarial-stakes.md`
- `skills/kosif-cognitive-core/references/artifact-schemas.md`
- `skills/kosif-cognitive-core/references/audit-evidence.md`
- `skills/kosif-cognitive-core/references/bias-calibration.md`
- `skills/kosif-cognitive-core/references/book-to-mechanism-map.md`
- `skills/kosif-cognitive-core/references/calibration-ledger.md`
- `skills/kosif-cognitive-core/references/calibration-stop-rules.md`
- `skills/kosif-cognitive-core/references/causal-ladder.md`

## 10. TODO / FIXME / HACK / DEPRECATED

- skills/kosif-code-master/scripts/code_scan.py: TODO
- skills/kosif-code-master/scripts/code_scan.py: TODO

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `canary/atlas-tournament-e2e-20261004`، `main`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

لم تُكتب بعد — المستودع مجرود آلياً فقط.

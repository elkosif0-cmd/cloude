# 100-superskills — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `aab8afe`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/100-superskills` — عام · اللغة الرئيسية Python · 40,979 ك.ب على GitHub · آخر دفع 2026-10-05 · الفرع الافتراضي `main`
- الوصف على GitHub: 100 مهارة خارقة — 100 Super Skills for Claude & ChatGPT, composed from the KOSIF Atlas (15,122 skills): Claude-made animation, image/video prompt forges, Prompt Master Pro, Excel/Word, web design, programming
- النسخة المفحوصة: **308 ملفاً** (17.0 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 1 · طلبات الدمج المفتوحة: 0 · Issues المفتوحة: 0

## 2. التغطية

- حالة الجرد: **مسح آلي — مهارات مركبة من الأطلس**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `tools` | 13 | 9386 ك.ب |
| `examples` | 10 | 4637 ك.ب |
| `skills` | 276 | 2974 ك.ب |
| `(root)` | 9 | 462 ك.ب |

الامتدادات: `.md` 248، `.py` 36، `.json` 12، `.html` 6، `(بلا)` 2، `.png` 1، `.mp4` 1، `.gif` 1، `.jsonl` 1

نقاط الدخول والإعداد:

- `examples/demo2d/index.html`

## 4. README (`README.md`، أول الأسطر)

    # 100 مهارة خارقة — 100 Super Skills
    108 مهارة جديدة لكلاود (Claude Code وClaude Desktop وclaude.ai) وChatGPT، رُكّبت من قراءة فهرس **KOSIF Atlas** الكامل (15,122 مهارة في 3,691 إضافة) ودمج قدرات أقوى المهارات مفتوحة الترخيص في كل مجال، 
    **المميزات:** أنيميشن ترند يصنعه كلاود كاملاً (8 مهارات)، وبرومبتات صور وفيديو بكل المنصات، وسيّد برومبتات باحترافية، وإكسل ووورد وباوربوينت، وتصميم مواقع وبرمجة متكاملة، وأعمال وتعليم وقرارات.
    ## التثبيت
    من GitHub (Claude Code):
    ```text
    /plugin marketplace add kosif199022-jpg/100-superskills
    /plugin install 100-superskills@superskills
    ```
    أو من النسخة المحلية:
    ```text
    /plugin marketplace add C:\Users\اغنام الوادي\Desktop\الاداة\100-superskills
    /plugin install 100-superskills@superskills
    ```
    أو للتجربة: `claude --plugin-dir "C:\Users\اغنام الوادي\Desktop\الاداة\100-superskills"`. لـ claude.ai وClaude Desktop: ارفع الملفات من `dist/claude-ai-skills/`. التفاصيل في `INSTALL.ar.md`.
    ## الفهرس
    ### الحركة والأنيميشن — Motion & Animation
    | # | المهارة | Skill | ماذا تفعل |
    |---|---|---|---|
    | 01 | [استوديو الأنيميشن بكلاود](skills/claude-animation-studio/SKILL.md) | `claude-animation-studio` | يصنع فيديو أنيميشن كامل داخل كلاود بلا أي برنامج مونتاج: من الفكرة إلى DESIGN.md وSTORYBOARD.md
    | 02 | [أساليب الأنيميشن الترند](skills/trend-animation-styles/SKILL.md) | `trend-animation-styles` | مكتبة الأساليب الرائجة جاهزة للتنفيذ بكلاود: الكينتك تايبوغرافي، وموشن الواجهات الزجاجية، وLo-fi، 
    | 03 | [تايبوغرافي عربية متحركة](skills/kinetic-typography-arabic/SKILL.md) | `kinetic-typography-arabic` | فيديوهات كلمات متحركة بالعربية (اقتباسات، شعارات، أرقام، كلمات أغانٍ) مع خطوط عربية صحيحة وا
    | 04 | [تحريك الشخصيات 2D](skills/character-animation-2d/SKILL.md) | `character-animation-2d` | شخصيات كرتونية متحركة داخل المتصفح: تصميم الشخصية بأجزاء (rig) من SVG، ودورات المشي والحديث والتعبيرات، 
    | 05 | [أنيميشن تعليمي توضيحي](skills/explainer-edu-animation/SKILL.md) | `explainer-edu-animation` | فيديوهات شرح مبسّطة (علوم، تاريخ، اقتصاد، منتجات) بأسلوب مسطّح واضح: فكرة واحدة لكل مشهد، ورسوم تخ
    | 06 | [مشهد سينمائي ثلاثي الأبعاد](skills/cinematic-3d-scene/SKILL.md) | `cinematic-3d-scene` | مشاهد Three.js سينمائية داخل المتصفح: إضاءة فيزيائية، وBloom وتدرّج ألوان، وضباب وجسيمات، وشيدرات بسيطة
    | 07 | [بيانات متحركة](skills/data-in-motion/SKILL.md) | `data-in-motion` | رسوم بيانية متحركة للفيديو والعروض: أعمدة تنمو، وخطوط ترسم نفسها، وأرقام تعدّ، وخرائط تضيء، مع قواعد الوضوح وا… |
    | 08 | [موشن الواجهات والتفاعلات الدقيقة](skills/ui-motion-microinteractions/SKILL.md) | `ui-motion-microinteractions` | حركة واجهات بمستوى الجوائز: أزرار وقوائم وانتقالات صفحات بفيزياء النوابض، وFram
    ### الصورة والفيديو والسينما — Image, Video & Cinema
    | # | المهارة | Skill | ماذا تفعل |
    |---|---|---|---|
    | 09 | [مصنع برومبتات الصور](skills/image-prompt-forge/SKILL.md) | `image-prompt-forge` | برومبت صورة احترافي من مواصفة واحدة إلى كل منصة: Midjourney (المعاملات)، وFlux (لغة طبيعية)، وSDXL (أوزان وسلب
    | 10 | [مخرج برومبتات الفيديو](skills/video-prompt-director/SKILL.md) | `video-prompt-director` | برومبتات فيديو لمنصات Veo وSora وKling وRunway وLuma وPika وHailuo: لقطة بلقطة مع حركة الكاميرا وسرعته
    | 11 | [المخرج السينمائي (7 طبقات)](skills/cinema-director-7layers/SKILL.md) | `cinema-director-7layers` | تصميم مشاهد بصرية بسبع طبقات: الهوية، والعالم، والفعل والفيزياء، والكاميرا والعدسة، والإضاءة،
    | 12 | [الستوري بورد وقائمة اللقطات](skills/storyboard-shotlist/SKILL.md) | `storyboard-shotlist` | يحوّل أي فكرة أو سكربت إلى بنية إيقاعية (خطّاف، تمهيد، تصعيد، ذروة، نداء) ثم قائمة لقطات مرقّمة بالأ
    | 13 | [الهوية البصرية والشعار](skills/brand-identity-logo/SKILL.md) | `brand-identity-logo` | هوية كاملة من الصفر: شعار SVG متجه بثلاث نسخ (أساسي، أيقونة، أحادي)، ولوحة ألوان بأدوار وتباينات مفحوصة، 
    | 14 | [الرسوم المتجهة والأيقونات](skills/svg-illustration-icons/SKILL.md) | `svg-illustration-icons` | رسوم SVG نظيفة من الكود: أيقونات متناسقة بشبكة 24px، ورسوم مسطّحة للمواقع والعروض، وشخصيات بسيطة
    | 15 | [المخططات والرسوم الهندسية](skills/diagrams-mermaid-architecture/SKILL.md) | `diagrams-mermaid-architecture` | مخططات Mermaid وSVG لتدفقات العمل والمعماريات وقواعد البيانات والتسلسلات والخرائط 
    | 16 | [بكسل آرت وأصول الألعاب](skills/pixel-art-game-assets/SKILL.md) | `pixel-art-game-assets` | سبرايتات بكسل آرت وورق حركة (مشي، قفز، هجوم) بأربع أو ثماني جهات، وبلاطات أرضية، وواجهات، ومؤثرات، بل
    | 17 | [الصور المصغّرة وتصاميم السوشيال](skills/thumbnail-social-graphics/SKILL.md) | `thumbnail-social-graphics` | صور مصغّرة ليوتيوب ومنشورات وستوريات وأغلفة بقواعد الجذب: وجه أو عنصر واحد كبير، وثل
    | 18 | [تخطيط الإضاءة للصور والفيديو](skills/photo-lighting-plan/SKILL.md) | `photo-lighting-plan` | خطة إضاءة لأي تصوير أو مشهد مولّد: الهدف العاطفي، ونسبة المفتاح إلى التعبئة، ونوع المصادر وأحجامها 
    | 19 | [نقد الصور واستخراج البرومبت](skills/image-critique-reverse-prompt/SKILL.md) | `image-critique-reverse-prompt` | تحليل أي صورة: التكوين، والإضاءة، واللون، والحدة، وعيوب الذكاء الاصطناعي (أيدٍ، 
    | 20 | [مكتبة الأساليب الفنية للتوليد](skills/ai-art-style-library/SKILL.md) | `ai-art-style-library` | قاموس أساليب لتوليد الصور والفيديو: سينمائي واقعي، وأنمي، وكلاي، وأكواريل، وخط حبر، وإيزومتريك، 
    | 21 | [صور المنتجات والموك-أب](skills/product-photo-mockups/SKILL.md) | `product-photo-mockups` | صور منتجات للمتاجر والإعلانات: برومبتات استوديو بخلفية نظيفة أو مشهد حياة، وإضاءة منتج (softbox، grad
    | 22 | [القصص المصوّرة وكتب الأطفال](skills/comics-picture-books/SKILL.md) | `comics-picture-books` | قصص مصوّرة وكتب أطفال من السكربت إلى الصفحات: تقسيم الصفحات واللوحات، وسكربت كومكس بالحوار والصوت،
    | 23 | [الإعلان الإبداعي 30 ثانية](skills/ad-creative-30s/SKILL.md) | `ad-creative-30s` | إعلان كامل لمنتج أو خدمة: 3 خطّافات بديلة، وبنية مشكلة-حل-إثبات-نداء، وسكربت تعليق صوتي بالعامية أو الفصحى، وق

## 5. الوحدات المصدرية

42 وحدة (الأكبر أولاً؛ تُعرض 42). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `examples/sales-dashboard/sales-dashboard.html` | 704 | 0 |  | Layout: sticky header → insights strip → one filter row + active chips → 5 KPI tiles → chart grid in three groups (الاتجاه، التوزيع، الفريق) → orders table. Motion: one orchestrated entrance (GSAP), count-up numbers, 150 |
| `tools/data_b.py` | 180 | 0 |  | -*- coding: utf-8 -*- |
| `tools/data_a.py` | 180 | 0 |  | -*- coding: utf-8 -*- |
| `tools/data_d.py` | 180 | 0 |  | -*- coding: utf-8 -*- |
| `tools/data_c.py` | 180 | 0 |  | -*- coding: utf-8 -*- |
| `tools/data_e.py` | 61 | 0 |  | -*- coding: utf-8 -*- |
| `tools/advanced_index.py` | 464 | 10 |  | — |
| `tools/build.py` | 381 | 13 |  | -*- coding: utf-8 -*- |
| `tools/deep_index.py` | 292 | 3 |  | -*- coding: utf-8 -*- |
| `tools/deep_read.py` | 424 | 18 |  | — |
| `skills/excel-model-architect/scripts/model_builder.py` | 200 | 4 |  | — |
| `skills/prompt-architect-reasoning-models/scripts/prompt_frontier.py` | 144 | 5 |  | — |
| `skills/prompt-master-pro/scripts/prompt_lint.py` | 149 | 3 |  | — |
| `skills/davinci-resolve-pipeline/scripts/resolve_pipeline.py` | 170 | 6 |  | — |
| `skills/llm-judge-eval-lab/scripts/eval_runner.py` | 164 | 9 |  | — |
| `skills/pro-video-editor-ffmpeg/scripts/edl_render.py` | 165 | 4 |  | — |
| `skills/image-prompt-forge/scripts/image_prompt_forge.py` | 181 | 11 |  | — |
| `skills/claude-animation-studio/templates/scene-2d.html` | 121 | 0 |  | ── الألوان من DESIGN.md: غيّرها هنا فقط ───────────────────────────── |
| `examples/demo2d/index.html` | 121 | 0 |  | ── الألوان من DESIGN.md: غيّرها هنا فقط ───────────────────────────── |
| `skills/prompt-master-pro/scripts/prompt_build.py` | 130 | 5 |  | — |
| `skills/claude-animation-studio/templates/scene-3d.html` | 121 | 0 |  | <title> {{TITLE}} |
| `skills/excel-automation-power/scripts/formula_translate.py` | 94 | 2 |  | — |
| `skills/prompt-architect-reasoning-models/scripts/injection_shield.py` | 88 | 2 |  | — |
| `skills/audio-reactive-captions-studio/scripts/captions_pages.py` | 128 | 7 |  | — |
| `skills/excel-automation-power/scripts/lambda_library.py` | 67 | 1 |  | — |
| `skills/motion-director-pro/scripts/motion_energy.py` | 117 | 5 |  | — |
| `skills/excel-model-architect/scripts/model_audit.py` | 93 | 1 |  | — |
| `skills/video-prompt-director/scripts/video_prompt_forge.py` | 115 | 4 |  | — |
| `skills/audio-reactive-captions-studio/templates/audio-reactive.html` | 101 | 0 |  | <title> {{TITLE}} |
| `skills/claude-animation-studio/scripts/capture.py` | 109 | 3 |  | — |
| `skills/motion-director-pro/scripts/storyboard_gate.py` | 72 | 1 |  | — |
| `skills/excel-power-formulas/scripts/xlsx_check.py` | 92 | 1 |  | — |
| `skills/claude-animation-studio/scripts/new_scene.py` | 108 | 1 |  | — |
| `skills/pro-video-editor-ffmpeg/scripts/probe.py` | 76 | 3 |  | — |
| `skills/excel-automation-power/scripts/xlsx_recalc.py` | 82 | 3 |  | — |
| `skills/claude-animation-studio/scripts/encode.py` | 97 | 3 |  | — |
| `skills/pro-video-editor-ffmpeg/scripts/beat_cuts.py` | 98 | 5 |  | — |
| `skills/claude-animation-studio/scripts/qa.py` | 80 | 1 |  | — |
| `skills/audio-reactive-captions-studio/scripts/extract_audio_data.py` | 80 | 2 |  | — |
| `skills/audio-reactive-captions-studio/templates/captions.html` | 58 | 0 |  | المنطقة الآمنة للريلز: أسفل بـ 20% من الارتفاع وهامش جانبي 8% |
| `skills/pro-video-editor-ffmpeg/scripts/silence_cut.py` | 54 | 2 |  | — |
| `tools/catalog.py` | 48 | 1 |  | — |

## 6. الاختبارات (0)

- لا اختبارات.

## 7. المخططات والبيانات

- `skills/database-schema-migrations/references/sources.md`
- `skills/legacy-code-migration/references/sources.md`
- `skills/database-schema-migrations/SKILL.md`
- `skills/legacy-code-migration/SKILL.md`

## 8. المسارات والعمّال وواجهات API

- لا مسارات ظاهرة.

## 9. مواد الذكاء الاصطناعي والوكلاء

- `skills/ab-testing-experiments/SKILL.md`
- `skills/ab-testing-experiments/references/sources.md`
- `skills/accessibility-wcag/SKILL.md`
- `skills/accessibility-wcag/references/sources.md`
- `skills/accounting-ifrs-journal/SKILL.md`
- `skills/accounting-ifrs-journal/references/sources.md`
- `skills/ad-creative-30s/SKILL.md`
- `skills/ad-creative-30s/references/sources.md`
- `skills/agent-tool-instructions/SKILL.md`
- `skills/agent-tool-instructions/references/sources.md`
- `skills/ai-art-style-library/SKILL.md`
- `skills/ai-art-style-library/references/sources.md`
- `skills/arabic-copywriting/SKILL.md`
- `skills/arabic-copywriting/references/sources.md`
- `skills/audio-mastering-analysis/SKILL.md`
- `skills/audio-mastering-analysis/references/sources.md`
- `skills/audio-reactive-captions-studio/SKILL.md`
- `skills/audio-reactive-captions-studio/examples/words.example.json`
- `skills/audio-reactive-captions-studio/references/captions-rules.md`
- `skills/audio-reactive-captions-studio/references/sources.md`
- `skills/audio-reactive-captions-studio/scripts/captions_pages.py`
- `skills/audio-reactive-captions-studio/scripts/extract_audio_data.py`
- `skills/automation-scripts-cli/SKILL.md`
- `skills/automation-scripts-cli/references/sources.md`
- `skills/backend-api-design/SKILL.md`
- `skills/backend-api-design/references/sources.md`
- `skills/book-to-skill-knowledge/SKILL.md`
- `skills/book-to-skill-knowledge/references/sources.md`
- `skills/brand-identity-logo/SKILL.md`
- `skills/brand-identity-logo/references/sources.md`
- `skills/browser-automation-playwright/SKILL.md`
- `skills/browser-automation-playwright/references/sources.md`
- `skills/business-plan-prd/SKILL.md`
- `skills/business-plan-prd/references/sources.md`
- `skills/character-animation-2d/SKILL.md`
- `skills/character-animation-2d/references/sources.md`
- `skills/cinema-director-7layers/SKILL.md`
- `skills/cinema-director-7layers/references/sources.md`
- `skills/cinematic-3d-scene/SKILL.md`
- `skills/cinematic-3d-scene/references/sources.md`
- `skills/claude-animation-studio/SKILL.md`
- `skills/claude-animation-studio/references/motion-rules.md`
- `skills/claude-animation-studio/references/sources.md`
- `skills/claude-animation-studio/scripts/capture.py`
- `skills/claude-animation-studio/scripts/encode.py`
- `skills/claude-animation-studio/scripts/new_scene.py`
- `skills/claude-animation-studio/scripts/qa.py`
- `skills/cloudflare-edge-deploy/SKILL.md`
- `skills/cloudflare-edge-deploy/references/sources.md`
- `skills/code-review-refactor/SKILL.md`
- `skills/code-review-refactor/references/sources.md`
- `skills/comics-picture-books/SKILL.md`
- `skills/comics-picture-books/references/sources.md`
- `skills/context-window-budget/SKILL.md`
- `skills/context-window-budget/references/sources.md`
- `skills/curriculum-course-builder/SKILL.md`
- `skills/curriculum-course-builder/references/sources.md`
- `skills/custom-gpt-claude-project/SKILL.md`
- `skills/custom-gpt-claude-project/references/sources.md`
- `skills/dashboards-dataviz/SKILL.md`
- `skills/dashboards-dataviz/references/sources.md`
- `skills/data-in-motion/SKILL.md`
- `skills/data-in-motion/references/sources.md`
- `skills/database-schema-migrations/SKILL.md`
- `skills/database-schema-migrations/references/sources.md`
- `skills/davinci-resolve-pipeline/SKILL.md`
- `skills/davinci-resolve-pipeline/references/color-grading-order.md`
- `skills/davinci-resolve-pipeline/references/sources.md`
- `skills/davinci-resolve-pipeline/references/transitions-catalog.md`
- `skills/davinci-resolve-pipeline/scripts/resolve_pipeline.py`
- `skills/debugging-root-cause/SKILL.md`
- `skills/debugging-root-cause/references/sources.md`
- `skills/diagrams-mermaid-architecture/SKILL.md`
- `skills/diagrams-mermaid-architecture/references/sources.md`
- `skills/docker-ci-devops/SKILL.md`
- `skills/docker-ci-devops/references/sources.md`
- `skills/ecommerce-store-listings/SKILL.md`
- `skills/ecommerce-store-listings/references/sources.md`
- `skills/excel-automation-power/SKILL.md`
- `skills/excel-automation-power/references/dax-patterns.md`

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- لا طلبات دمج مفتوحة.
- لا Issues مفتوحة.
- الفروع: `main`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| 108 مهارات + فهرس عميق | مهارات للمحاسبة والمراجعة والبرمجة مركبة من الأطلس | مرجع | — | مكتبة | — | — | Keep (مرجع) | — | — |

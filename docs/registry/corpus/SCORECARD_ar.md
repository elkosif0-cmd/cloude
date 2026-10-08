# بطاقة نتائج الحزمة المرجعية (P5)

> مولَّدة بـ `tools/corpus_scorecard.mjs` من المحركات نفسها التي يستخدمها التطبيق. لكل شركة من الحزمة (47 شركة بقوائم منشورة): ما يصل إليه SQC من ميزانها وحده، مقابل ما كتبه مراجعها. ملف المراجعة المفتوح من باب المراجعة يصل إلى الأرقام نفسها (`tools/corpus_same_results.test.mjs`). أي تغيير في هذه الأرقام يُفشل `tools/corpus_scorecard.test.mjs` حتى تُعاد كتابة المصفوفة ويُشرح السبب.

## الإجمالي

| المقياس | بلا خبرة القطاع | بخبرة القطاع (الافتراضي) | الخبرة الممهّدة |
|---|---|---|---|
| شركات / فيها أمور رئيسية / مواضيع | 47 / 43 / 88 | 47 / 43 / 88 | 47 / 43 / 88 |
| ما وجده SQC من أمور المراجع (ضمن الثلاثة المختارة) | 42% | **58%** | 57% |
| ضمن المرشحين المرتبين | 52% | **74%** | 73% |
| دقة الاختيار | 29% | **40%** | 39% |
| شركات وجد SQC أمراً واحداً على الأقل من أمورها | 32 | **35** | 35 |
| أقسام تقرير الشركة التي تحملها حزمة تقارير SQC | 97% | 97% | 97% |

خبرة القطاع تُحسب دائماً مع استبعاد الشركة نفسها (leave-one-out)، فلا تُعلِّم الشركةُ ترتيبها.

**أكثر ما يفوت SQC (بخبرة القطاع):** `provisions-litigation` 4، `complex-transactions` 3، `fair-value` 3، `parent-investments` 3، `actuarial` 2، `it-controls` 2، `tax-uncertainty` 1، `climate` 1، `fraud-override` 1، `revenue-deductions` 1، `impairment-intangibles` 1، `related-parties` 1

## الأهمية النسبية مقابل ما أفصح عنه المراجع

| الشركة | SQC | المراجع | النسبة | ضمن ±33%؟ | الصفحة |
|---|---|---|---|---|---|
| BP p.l.c. (مليون $) | 387 | 700 | 0.55 | **لا** | 4849 |
| Unilever PLC (مليون €) | 625 | 500 | 1.25 | نعم | 5216 |
| AstraZeneca PLC (مليون $) | 620 | 620 | 1 | نعم | 5503 |
| GSK plc (مليون £) | 370 | 350 | 1.06 | نعم | 5800 |
| HSBC Holdings plc (مليون $) | 1495 | 1550 | 0.96 | نعم | 6205 |
| Airbus SE (مليون €) | 238 | 292 | 0.82 | نعم | 7375 |
| Saudi Arabian Oil Company (Aramco) (مليون ريال) | 35143 | 26250 | 1.34 | **لا** | 10162 |

ضمن النطاق: 5 من 7.

## الشركات

✓ اختاره SQC · ◐ ضمن مرشحيه · ✗ فاته

| الشركة | القطاع | المراجع | السنة | أمور المراجع | ما اختاره SQC | وجد | دقة | بلا خبرة | الأقسام | متوازن |
|---|---|---|---|---|---|---|---|---|---|---|
| Amazon.com, Inc. | retail | Ernst & Young LLP | FY2023 | ◐ tax-uncertainty | impairment-assets، revenue-recognition، inventory | 0% | 0% | 0% | 95% | نعم |
| Apple Inc. | tech | Ernst & Young LLP | FY2024 (ended 2024-09-28) | ✓ tax-uncertainty | revenue-recognition، tax-uncertainty، fair-value | 100% | 33% | 0% | 94% | نعم |
| Cisco Systems, Inc. | tech | PricewaterhouseCoopers LLP | FY2024 | ✓ revenue-recognition<br>✗ complex-transactions | impairment-intangibles، revenue-recognition، tax-uncertainty | 50% | 33% | 50% | 97% | نعم |
| Walmart Inc. | retail | Ernst & Young LLP | FY2023 (ended 2023-01-31) | ✗ provisions-litigation | tax-uncertainty، impairment-assets، revenue-recognition | 0% | 0% | 0% | 95% | نعم |
| Adobe Inc. | tech | KPMG LLP | FY2024 | ✓ revenue-recognition | revenue-recognition، impairment-intangibles، tax-uncertainty | 100% | 33% | 100% | 96% | نعم |
| JPMorgan Chase & Co. | banking | PricewaterhouseCoopers LLP | FY2023 | ✓ credit-losses<br>✓ fair-value | credit-losses، fair-value، tax-uncertainty | 100% | 67% | 100% | 100% | نعم |
| Apple Inc. | tech | Ernst & Young LLP | FY2020 (ended 2020-09-26) | ◐ tax-uncertainty | revenue-recognition، fair-value، inventory | 0% | 0% | 0% | 96% | نعم |
| Amazon.com, Inc. | retail | Ernst & Young LLP | FY2024 | ◐ tax-uncertainty | impairment-assets، revenue-recognition، inventory | 0% | 0% | 0% | 95% | نعم |
| Apple Inc. | tech | Ernst & Young LLP | FY2023 (ended 2023-09-30) | ◐ tax-uncertainty | revenue-recognition، fair-value، inventory | 0% | 0% | 0% | 96% | نعم |
| Berkshire Hathaway Inc. | insurance | Deloitte & Touche LLP | FY2025 | ✗ actuarial | fair-value، retained، revenue-recognition | 0% | 0% | 0% | 96% | نعم |
| JPMorgan Chase & Co. | banking | PricewaterhouseCoopers LLP | FY2025 | ✓ credit-losses<br>✓ fair-value | credit-losses، fair-value، otherNca | 100% | 67% | 50% | 100% | نعم |
| Bank of America | banking | PricewaterhouseCoopers LLP | FY2025 | ✓ credit-losses | credit-losses، fair-value، payables | 100% | 33% | 100% | 100% | نعم |
| PepsiCo, Inc. | fmcg | KPMG LLP | FY2025 | ◐ tax-uncertainty | revenue-deductions، impairment-intangibles، impairment-assets | 0% | 0% | 0% | 94% | نعم |
| The Procter & Gamble Company | fmcg | Deloitte & Touche LLP | FY2026 (ended 2026-06-30) | ✓ impairment-intangibles | revenue-deductions، impairment-intangibles، tax-uncertainty | 100% | 33% | 100% | 96% | نعم |
| The Home Depot, Inc. | retail | KPMG LLP | FY2025 (ended 2026-02-01) | ◐ inventory | tax-uncertainty، revenue-recognition، impairment-intangibles | 0% | 0% | 0% | 96% | نعم |
| Nestlé Group | fmcg | Ernst & Young Ltd | FY2025 | ✓ revenue-deductions<br>✓ impairment-intangibles | revenue-deductions، impairment-intangibles، tax-uncertainty | 100% | 67% | 50% | 100% | نعم |
| Roche Group | pharma | KPMG AG | FY2025 | ✓ revenue-deductions<br>✓ impairment-intangibles | revenue-deductions، impairment-intangibles، tax-uncertainty | 100% | 67% | 50% | 100% | نعم |
| Novartis AG | pharma | KPMG AG | FY2025 | ✓ revenue-deductions | impairment-intangibles، revenue-deductions، tax-uncertainty | 100% | 33% | 0% | 100% | نعم |
| UBS Group AG | banking | Ernst & Young Ltd | FY2025 | ✗ fair-value<br>✓ credit-losses<br>✗ tax-uncertainty | credit-losses، payables، otherNca | 33% | 33% | 33% | 100% | نعم |
| Allianz SE | insurance | PricewaterhouseCoopers GmbH | FY2025 | — | fair-value، tax-uncertainty، credit-losses | — | — | — | 100% | نعم |
| Mercedes-Benz Group AG | auto | PricewaterhouseCoopers GmbH | FY2025 | — | credit-losses، impairment-assets، provisions-litigation | — | — | — | 100% | نعم |
| Volkswagen Group | auto | EY GmbH | FY2025 | ◐ impairment-intangibles<br>✓ provisions-litigation<br>✓ impairment-assets | credit-losses، provisions-litigation، impairment-assets | 67% | 67% | 33% | 97% | نعم |
| Deutsche Telekom AG | telecom | Deloitte GmbH | FY2025 | ✓ revenue-recognition | impairment-intangibles، revenue-recognition، impairment-assets | 100% | 33% | 100% | 100% | نعم |
| BP p.l.c. | energy | Deloitte LLP | FY2025 | ✗ climate<br>✓ impairment-assets<br>◐ provisions-litigation<br>◐ fair-value<br>✗ fraud-override | impairment-assets، revenue-recognition، impairment-intangibles | 20% | 33% | 20% | 93% | نعم |
| Unilever PLC | fmcg | KPMG LLP | FY2025 | ✓ revenue-deductions<br>✓ tax-uncertainty<br>✗ complex-transactions<br>✗ parent-investments | impairment-intangibles، revenue-deductions، tax-uncertainty | 50% | 67% | 0% | 93% | نعم |
| AstraZeneca PLC | pharma | PricewaterhouseCoopers LLP | FY2025 | ✓ revenue-deductions<br>✓ impairment-intangibles<br>✗ provisions-litigation<br>✗ actuarial<br>✗ parent-investments | revenue-deductions، impairment-intangibles، tax-uncertainty | 40% | 67% | 20% | 94% | نعم |
| GSK plc | pharma | Deloitte LLP | FY2025 | ✓ revenue-deductions<br>✗ fair-value<br>✓ impairment-intangibles<br>✓ tax-uncertainty | revenue-deductions، impairment-intangibles، tax-uncertainty | 75% | 100% | 25% | 92% | نعم |
| HSBC Holdings plc | banking | PricewaterhouseCoopers LLP | FY2025 | ✓ credit-losses<br>✗ parent-investments | credit-losses، fair-value، payables | 50% | 33% | 50% | 95% | نعم |
| TotalEnergies SE | energy | PricewaterhouseCoopers Audit · Ernst & Young Audit | FY2024 | ✓ impairment-assets | impairment-assets، revenue-recognition، fair-value | 100% | 33% | 100% | 97% | نعم |
| Airbus SE | industrial | Ernst & Young Accountants LLP | FY2023 | ✓ revenue-recognition<br>◐ impairment-assets<br>✓ fair-value | revenue-recognition، inventory، fair-value | 67% | 67% | 67% | 100% | نعم |
| Sanofi | pharma | PricewaterhouseCoopers Audit · Forvis Mazars | FY2025 | ✓ impairment-intangibles<br>✓ revenue-deductions<br>◐ tax-uncertainty | impairment-intangibles، revenue-deductions، fair-value | 67% | 67% | 33% | 96% | نعم |
| Toyota Motor Corporation | auto | PricewaterhouseCoopers Japan LLC | FY2026 (ended 2026-03-31) | ✓ provisions-litigation<br>✓ credit-losses | impairment-assets، credit-losses، provisions-litigation | 100% | 67% | 50% | 97% | نعم |
| Honda Motor Co., Ltd. | auto | KPMG AZSA LLC | FY2023 (ended 2023-03-31) | ✓ provisions-litigation<br>✓ credit-losses<br>✓ impairment-assets | provisions-litigation، credit-losses، impairment-assets | 100% | 100% | 67% | 96% | نعم |
| SoftBank Group Corp. | tech |  | FY2025 (ended 2026-03-31); report 2026 | — | fair-value، revenue-recognition، otherNcl | — | — | — | 100% | نعم |
| Mitsubishi UFJ Financial Group | banking | Deloitte Touche Tohmatsu LLC | Year ended 2026-03-31 | ✓ credit-losses | credit-losses، fair-value، otherNca | 100% | 33% | 100% | 97% | نعم |
| Sumitomo Mitsui Financial Group | banking | KPMG AZSA LLC | Year ended 2026-03-31 | ✓ credit-losses | credit-losses، fair-value، payables | 100% | 33% | 100% | 100% | نعم |
| Samsung Electronics | tech |  | FY2025 | ✓ impairment-assets<br>✗ revenue-deductions | revenue-recognition، impairment-assets، tax-uncertainty | 50% | 33% | 50% | 100% | نعم |
| Hon Hai Precision (Foxconn) | tech | PricewaterhouseCoopers Taiwan | FY2025 | — | revenue-recognition، otherCl، tax-uncertainty | — | — | — | 100% | نعم |
| Tencent Holdings | tech | PricewaterhouseCoopers | FY2025 | ✓ revenue-recognition<br>✗ impairment-intangibles<br>✗ fair-value | revenue-recognition، complex-transactions، tax-uncertainty | 33% | 33% | 67% | 100% | نعم |
| Reliance Industries | energy | Deloitte Haskins & Sells LLP · Chaturvedi & Shah LLP | FY2025–26 | ◐ provisions-litigation<br>✓ fair-value<br>✗ it-controls<br>✓ revenue-recognition | impairment-assets، revenue-recognition، fair-value | 50% | 67% | 25% | 100% | نعم |
| Infosys Limited | tech | Deloitte Haskins & Sells LLP | FY2025–26 | ✓ revenue-recognition | revenue-recognition، tax-uncertainty، admin | 100% | 33% | 100% | 100% | نعم |
| Saudi Arabian Oil Company (Aramco) | energy | PricewaterhouseCoopers Public Accountants | FY2025 | ◐ impairment-intangibles<br>✓ impairment-assets<br>✗ complex-transactions | impairment-assets، revenue-recognition، fair-value | 33% | 33% | 33% | 97% | نعم |
| Emirates NBD Bank | banking | Ernst & Young Middle East | FY2025 | ✓ credit-losses<br>✗ related-parties | credit-losses، fair-value، payables | 50% | 33% | 50% | 100% | نعم |
| e& (Emirates Telecommunications Group) | telecom | Ernst & Young | FY2025 | ✓ revenue-recognition<br>✓ impairment-intangibles | revenue-recognition، impairment-intangibles، impairment-assets | 100% | 67% | 100% | 100% | نعم |
| Royal Bank of Canada | banking | PricewaterhouseCoopers LLP | FY2025 (ended 2025-10-31) | ✓ credit-losses<br>◐ tax-uncertainty | credit-losses، fair-value، payables | 50% | 33% | 50% | 97% | نعم |
| BHP Group Limited | mining | Ernst & Young | FY2025 (ended 2025-06-30) | ✓ impairment-assets<br>✗ provisions-litigation | impairment-assets، revenue-recognition، tax-uncertainty | 50% | 33% | 50% | 95% | نعم |
| Commonwealth Bank of Australia | banking | PricewaterhouseCoopers | FY2026 (ended 2026-06-30) | ✓ credit-losses<br>✗ provisions-litigation<br>✗ it-controls | credit-losses، payables، tax-uncertainty | 33% | 33% | 33% | 100% | نعم |


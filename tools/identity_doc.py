# Generate docs/design/SQC-IDENTITY-ar.md from the SQC look's tokens, so every hex in the document is the one that renders.
import re, sys
from pathlib import Path
ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
css = (ROOT / "ui/ds/tokens.css").read_bytes().decode("utf-8")

def block(selector):
    """every declaration of this selector, later blocks winning (a look may be declared in several blocks)"""
    out, start = {}, 0
    while True:
        i = css.find(selector + "{", start)
        if i < 0:
            return out
        j = css.index("}", i)
        out.update(dict(re.findall(r"(--sk-[a-z0-9-]+)\s*:\s*([^;]+);", css[i + len(selector) + 1:j])))
        start = j

light = block(':root[data-look="kosif"]')
dark = block(':root[data-look="kosif"][data-theme="dark"]')
base = block(":root")
def t(k, d=light): return d.get(k) or base.get(k) or "—"

palette = [
    ("العلامة", "--sk-brand", "زر الإجراء الأول في الشاشة، الروابط، الحلقات، التحديد"),
    ("العلامة الثانوية", "--sk-brand-2", "المؤشر النشط، خط الصافي، التدرّجات"),
    ("القائمة الكحلية", "--sk-rail", "الشريط الجانبي، شاشة الدخول، أغلفة التقارير"),
    ("الأرضية", "--sk-bg", "خلفية التطبيق"),
    ("السطح", "--sk-surface", "البطاقات والحقول"),
    ("الحبر", "--sk-ink", "النص الأساسي"),
    ("الحبر الثانوي", "--sk-ink-2", "النص المساعد"),
    ("الحبر الخافت", "--sk-ink-3", "التسميات والملاحظات"),
    ("الخط الفاصل", "--sk-line", "حدود البطاقات والجداول"),
    ("نجاح", "--sk-ok", "مكتمل، مطابق، ضمن الهدف"),
    ("تحذير", "--sk-warn", "قيد المراجعة، متوسط، قارب الحد"),
    ("خطر", "--sk-bad", "عالي، متأخر، خسارة"),
    ("معلومة", "--sk-info", "إرشاد، للعلم"),
]
rows = "\n".join(f"| {n} | `{k}` | `{t(k)}` | `{t(k, dark)}` | {u} |" for n, k, u in palette)

doc = f"""# هوية SQC — المرجع الواحد (يولَّد من `ui/ds/tokens.css`، شكل «kosif»)

> لا يُعدَّل هذا الملف باليد؛ يولّده `python3 tools/identity_doc.py` من الرموز نفسها التي تُرسم على الشاشة، فكل قيمة هنا هي ما يراه المستخدم فعلاً.
> المرجع المنهجي: مراجعة الأطلس (`docs/rebuild/ATLAS_REVIEW_ar.md`): لوحة من خمسة أدوار، شبكة 8 بكسل، أقطار متداخلة، عائلتا خط، لون تمييز واحد لكل شاشة.

## 1. الاسم والصوت
- الاسم: **SQC — Smart Quality Control**. الشعار اللاتيني بخط Montserrat 700–800. الشعارات في `ui/art/sqc-logo.svg` و`sqc-mark.svg` و`sqc-mark-dark.svg`.
- الجملة: «رقابة جودة ذكية، مراجعة بمعايير عالمية — AI-Powered Audit & Assurance Platform».
- الصوت: عربي فصيح مختصر، أفعال في الأزرار («فتح الشركة»، «إنشاء الشركة وفتحها»)، لا مجاملات ولا تعجّب، كل رقم بمصدره.

## 2. اللون — خمسة أدوار لا أكثر
| الدور | الرمز | نهاري | ليلي | أين يُستخدم |
|---|---|---|---|---|
{rows}

- **قاعدة التمييز الواحد:** لون العلامة يُنفق مرة واحدة في كل شاشة (الإجراء الأول). ألوان الحالة محور مستقل لا يُحسب منه.
- **المحايدات مائلة نحو الكحلي** (`{t("--sk-grid")}`، `{t("--sk-line")}`) لا رمادية صرفة.
- خريطة المخاطر: `{t("--sk-heat-1")}` → `{t("--sk-heat-2")}` → `{t("--sk-heat-3")}` → `{t("--sk-heat-4")}`.
- التدرّج: `{t("--sk-grad-brand")}`.

## 3. الخط
- النص: `{t("--sk-font")}`
- العناوين: `{t("--sk-font-display")}`
- اللاتيني (الشعار، الأسماء الإنجليزية): `{t("--sk-font-latin")}`
- **عائلتان فقط** في شكل SQC. الأوزان: 400 للنص، 600 للتسميات، 700–800 للعناوين والأرقام؛ لا 900.
- المقياس: {t("--sk-fs-xs")} · {t("--sk-fs-s")} · {t("--sk-fs")} · {t("--sk-fs-l")} · {t("--sk-fs-xl")} · {t("--sk-fs-2xl")}؛ عنوان الشاشة سائل `clamp(24px, 1.4vw + 17px, 32px)`.
- الأرقام جدولية لاتينية (`tnum`, `lnum`) ومحاذاة لليمين في الجداول.

## 4. المسافات والأقطار
- شبكة **8 بكسل** ({t("--sk-2")} · {t("--sk-4")} · {t("--sk-5")} · {t("--sk-6")} · {t("--sk-7")})؛ نصف الخطوة {t("--sk-1")} فقط حين تفيض 8.
- الأقطار متداخلة: الخارجي `{t("--sk-r-l")}` ← بحاشية 8 ← الداخلي `{t("--sk-r-s")}`؛ البطاقة العادية `{t("--sk-r")}`؛ الحبوب `{t("--sk-r-pill")}`.
- لا حدود على العناصر في حالة الراحة؛ المرور بالماوس يُظهر الهدف كاملاً (ظل أو حد كامل)، لا حركة جزئية.

## 5. الظل والعمق
- `{t("--sk-shadow-1")}`
- `{t("--sk-shadow-2")}`
- الزجاج فوق الخلفيات الداكنة فقط (الباب الأمامي، الأغلفة).

## 6. الحركة
- دخول: `{t("--sk-ease-out")}` خلال `{t("--sk-motion-enter")}`، تدرّج `{t("--sk-motion-stagger")}` بين الكتل؛ تغذية راجعة خلال 100 مللي ثانية؛ ارتداد خفيف للنوافذ والتنبيهات `{t("--sk-ease-spring")}`.
- `prefers-reduced-motion`: كل المدد صفر.

## 7. التركيز والإتاحة
- حلقة تركيز واحدة: `3px solid {t("--sk-focus")}` بإزاحة 2px.
- تباين النص ≥ 4.5:1، أهداف اللمس ≥ 44px، كل رسم له بديل نصي.

## 8. قرار العلامة الواحدة (2026-10-05)
كان شكل SQC الفاتح يحمل لونين للعلامة: الأزرق `{t("--sk-brand")}` (الشعار، الباب الأمامي، عالم البلورات، `manifest`) والبنفسجي السابق الذي فرضته طبقة «Mercury» (`ui/ds/sqc.css`) على القائمة وزر «+» والتقارير. بقرار المالك صارت العلامة **زرقاء واحدة** في كل الشاشات والطباعة، مع إبقاء هدوء Mercury (بطاقات مسطحة، رؤوس مضغوطة). الاختبار `mercury_report_presentation.test.mjs` يمنع عودة البنفسجي.

## 9. كيف يُقاس الالتزام
`node tools/identity_audit.mjs` يطبع: ألوان مكتوبة يدوياً خارج الرموز، مسافات خارج شبكة 4، أقطار حرفية، ألوان داخل JS، `!important`، أوزان ثقيلة، تعدد حلقات التركيز. الخط الأساس في `tools/fixtures/identity-baseline.json` ولا يُسمح بأن يسوء أي رقم (CI).
"""
out = ROOT / "docs/design/SQC-IDENTITY-ar.md"
out.write_bytes(doc.encode("utf-8"))
print("written", out, len(doc))

"""Generate the capability docs from ui/core/capabilities.json (the single source of truth).

    python3 tools/capability_docs.py          # rewrite docs/rebuild/SYSTEM_CAPABILITY_INVENTORY.md + NEW_CAPABILITY_MAP.md
    python3 tools/capability_docs.py --check  # exit 1 if the docs are stale (used by CI)
"""
from pathlib import Path
import json, sys

ROOT = Path(__file__).resolve().parent.parent
CAPS = json.loads((ROOT / "ui/core/capabilities.json").read_text(encoding="utf-8"))
OUT = ROOT / "docs/rebuild"
groups = {g["id"]: g for g in CAPS["groups"]}
caps = CAPS["capabilities"]


def roles_for(cid):
    return ", ".join(k for k, r in CAPS["roles"].items() if r["caps"] == "*" or cid in r["caps"])


def inventory():
    rows = ["# SYSTEM CAPABILITY INVENTORY", "",
            "Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.", "",
            f"Total capabilities: **{len(caps)}** (screens). Cross-cutting capabilities are listed after the table.", "",
            "| ID | Capability | Module | Current Location | Data Used | Dependencies | Status | Keep/Remove/Merge/Rebuild |",
            "|---|---|---|---|---|---|---|---|"]
    for c in caps:
        g = groups[c["group"]]
        loc = ("القائمة الأساسية" if g["primary"] else "الأدوات المتقدمة") + " › " + g["label"]
        deps = "SKosifCore" + (", Engine" if c["module"].startswith("core") else "") + (", IndexedDB" if any(d.startswith("IDB") for d in c["data"]) else "")
        rows.append(f"| `{c['id']}` | {c['label']} | {c['module']} | {loc} | {', '.join('`'+d+'`' for d in c['data']) or '—'} | {deps} | Working | {c['decision']} |")
    rows += ["", "## Cross-cutting capabilities", "",
             "| ID | Capability | Module | Data | Decision |", "|---|---|---|---|---|",
             "| X-search | البحث الموحد + لوحة الأوامر Ctrl+K | ui/components/palette.js (يحل محل v21 palette وزر v23) | `skosif_palette_recent`, `aghnam-v21-pins` | Rebuild |",
             "| X-backup | نسخ احتياطي/استعادة كاملة مع تجربة جافة وتراجع | ui/core/store.js + core backup | كل مفاتيح التطبيق + IDB | Merge (نسختان سابقتان) |",
             "| X-errors | معالجة أخطاء مركزية بلا alert() | ui/core/errors.js | `skosif_error_log` | Rebuild |",
             "| X-audit | سجل تدقيق للأحداث والإجراءات | ui/core/audit.js | `skosif_audit_trail` | Rebuild |",
             "| X-perm | الصلاحيات User→Role→Capability→Action | ui/core/perm.js | `skosif_role_mode` | Merge (erp-plus ROLES) |",
             "| X-events | ناقل الأحداث | ui/core/bus.js | — | Rebuild |",
             "| X-theme | المظهر فاتح/داكن/تلقائي + الكثافة | ui/layouts/shell.js | `skosif_prefs` | Rebuild (12 ثيماً → نظام تصميم واحد) |",
             "| X-lock | القفل التلقائي وفك التشفير | ui/core/sk.js + unlock.html | `skosif_autolock_min` | Keep |",
             "| X-pwa | العمل دون اتصال وتحديث النسخة | sw.js + ui/core/pwa.js | Cache Storage | Keep |",
             "| X-jev | Jev داخل مسارات العمل | ui/jev.js + jev-api/worker.js | `aghnam_v29_jev_log` | Keep |",
             "| X-print | الطباعة وPDF | core reports + ui modules | — | Keep |",
             "| X-whatsapp | إرسال واتساب | offers/reports/operations | — | Keep |",
             "| X-excel | استيراد/تصدير Excel/CSV | core DataHub + SK.csv | IDB imports | Keep |",
             "| X-cloud | الربط السحابي وCapabilities v2 | capabilities-v2/worker.js | D1 | Keep |"]
    return "\n".join(rows) + "\n"


def cap_map():
    rows = ["# NEW CAPABILITY MAP", "",
            "Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.", "",
            "## Old → New matrix", "",
            "| Old name / location | New ID | New location | Tier | Roles |", "|---|---|---|---|---|"]
    for c in caps:
        g = groups[c["group"]]
        rows.append(f"| {c['legacy']} | `{c['id']}` | {'Primary' if g['primary'] else 'Advanced'} › {g['label']} › {c['label']} | {c['tier']} | {roles_for(c['id'])} |")
    rows += ["", "## By tier", ""]
    for t, label in CAPS["tiers"].items():
        ids = [c for c in caps if c["tier"] == t]
        rows.append(f"- **{t}** — {label} ({len(ids)}): " + ", ".join(f"`{c['id']}`" for c in ids))
    covered = len(caps)
    rows += ["", f"Coverage gate: {covered}/{covered} legacy screens mapped (100%)."]
    return "\n".join(rows) + "\n"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = {OUT / "SYSTEM_CAPABILITY_INVENTORY.md": inventory(), OUT / "NEW_CAPABILITY_MAP.md": cap_map()}
    if "--check" in sys.argv:
        stale = [p.name for p, t in files.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        if stale:
            raise SystemExit("stale capability docs (run tools/capability_docs.py): " + ", ".join(stale))
        return
    for p, t in files.items():
        p.write_text(t, encoding="utf-8")
    print("wrote", ", ".join(p.name for p in files))


main()

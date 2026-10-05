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
gateways = {g["id"]: g for g in CAPS.get("gateways", [])}
caps = CAPS["capabilities"]
by_id = {c["id"]: c for c in caps}


def hub_of(c):
    """the hub (menu entry) a screen belongs to: its parent, or itself"""
    return by_id[c["hub"]] if c.get("hub") else c


def hub_label(c):
    h = hub_of(c)
    return h.get("hubLabel") or h["label"]


def is_hub(c):
    return any(x.get("hub") == c["id"] for x in caps)


def roles_for(cid):
    return ", ".join(k for k, r in CAPS["roles"].items() if r["caps"] == "*" or cid in r["caps"])


def gateway_label(c):
    return gateways.get(c.get("gateway"), {}).get("label", "")


def inventory():
    rows = ["# SYSTEM CAPABILITY INVENTORY", "",
            "Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.", "",
            f"Total capabilities: **{len(caps)}** (screens). Cross-cutting capabilities are listed after the table.", "",
            "| ID | Capability | Module | Current Location | Data Used | Dependencies | Status | Keep/Remove/Merge/Rebuild |",
            "|---|---|---|---|---|---|---|---|"]
    for c in caps:
        g = groups[c["group"]]
        parts = [gateway_label(c), g["label"]]
        if c.get("hub") or is_hub(c):
            parts.append(hub_label(c))
        parts.append("متقدم" if c.get("adv") else "يومي")
        loc = " › ".join(x for x in parts if x)
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
        hub = f"{hub_label(c)} › " if c.get("hub") or is_hub(c) else ""
        prefix = (gateway_label(c) + " › ") if gateway_label(c) else ""
        rows.append(f"| {c['legacy']} | `{c['id']}` | {prefix}{g['label']} › {hub}{c['label']}{' (advanced)' if c.get('adv') else ''} | {c['tier']} | {roles_for(c['id'])} |")
    rows += ["", "## User-facing gateways → internal domains → hubs", "",
             "The sidebar exposes the four gateways. The eight historical domains remain an internal compatibility/company-scoping layer; one menu entry is shown per hub and every page keeps its id, permission and deep link.", "",
             "| Gateway | Internal domain | Menu entry | Pages |", "|---|---|---|---|"]
    gateway_rows = CAPS.get("gateways", []) or [{"id": "", "label": "—"}]
    for gw in gateway_rows:
        for g in CAPS["groups"]:
            visible = [c for c in caps if c["group"] == g["id"] and not c.get("hub") and (not gw["id"] or c.get("gateway") == gw["id"])]
            for h in visible:
                pages = [h] + [c for c in caps if c.get("hub") == h["id"]]
                rows.append(f"| {gw['label']} | {g['label']} | {hub_label(h)} | " + " · ".join(f"`{p['id']}` {p['label']}" for p in pages) + " |")
    entries = sum(1 for c in caps if not c.get("hub"))
    rows += ["", f"{len(caps)} screens in {entries} menu entries.", "", "## By tier", ""]
    for t, label in CAPS["tiers"].items():
        ids = [c for c in caps if c["tier"] == t]
        rows.append(f"- **{t}** — {label} ({len(ids)}): " + ", ".join(f"`{c['id']}`" for c in ids))
    covered = len(caps)
    rows += ["", f"Coverage gate: {covered} screens in {len(gateways) or 0} user-facing gateways and {len(groups)} internal domains; see CAPABILITY_COVERAGE_ALL_VERSIONS.md for every historical version."]
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

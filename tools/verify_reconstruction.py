from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REQUIRED_DOCS=[
    "SYSTEM_AUDIT.md","SYSTEM_CAPABILITY_INVENTORY.md","DEPENDENCY_MAP.md",
    "NEW_INFORMATION_ARCHITECTURE.md","NEW_CAPABILITY_MAP.md","USER_JOURNEYS.md",
    "DATA_FLOW_MAP.md","MIGRATION_PLAN.md","DESIGN_SYSTEM.md","REBUILD_PLAN.md",
    "CAPABILITY_COVERAGE_MATRIX.md",
]
for name in REQUIRED_DOCS:
    p=ROOT/name
    assert p.exists() and p.stat().st_size>200, f"missing reconstruction artifact: {name}"

build=(ROOT/"build.py").read_text(encoding="utf-8")
assert '"fusion.css"' in build, "fusion.css is not bundled"
assert '"fusion-shell.js"' in build, "fusion-shell.js is not bundled"
assert build.index('"fusion.css"') > build.index('"capabilities-v2.css"'), "fusion CSS must load last"
assert build.index('"fusion-shell.js"') > build.index('"audit-bridge.js"'), "fusion shell must load after audit bridge"

js=(ROOT/"ui/fusion-shell.js").read_text(encoding="utf-8")
css=(ROOT/"ui/fusion.css").read_text(encoding="utf-8")
for marker in ["SKosifFusion","fusion-v1","sk-command-layer","sk-fusion-command","sk-fusion-nav-section"]:
    assert marker in js or marker in css, f"fusion marker missing: {marker}"
for marker in ["document.documentElement.dataset.skInformationArchitecture","C()?.onView?.(\"dash\",commandCenter)"]:
    assert marker in js, f"runtime fusion contract missing: {marker}"
assert '.rail .modeseg' in js and '.remove()' in js, "legacy standard/advanced switch is not removed at runtime"
assert "MutationObserver" in js and "sk-fusion-audit-style" in js, "audit nested-shell fusion is not installed"

# The Fusion layer is orchestration only; no data schema migrations or destructive storage writes.
for forbidden in ["indexedDB.deleteDatabase", "localStorage.clear()", "DROP TABLE", "DELETE FROM"]:
    assert forbidden not in js, f"destructive data operation in fusion shell: {forbidden}"

print("Zero-legacy reconstruction contract: OK")

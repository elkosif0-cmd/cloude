from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ENTRYPOINTS=[
    "SYSTEM_AUDIT.md","SYSTEM_CAPABILITY_INVENTORY.md","DEPENDENCY_MAP.md",
    "NEW_INFORMATION_ARCHITECTURE.md","NEW_CAPABILITY_MAP.md","USER_JOURNEYS.md",
    "DATA_FLOW_MAP.md","MIGRATION_PLAN.md","DESIGN_SYSTEM.md","REBUILD_PLAN.md",
    "CAPABILITY_COVERAGE_MATRIX.md",
]
CANONICAL=[
    "docs/rebuild/00-audit.md","docs/rebuild/01-core-contract.md",
    "docs/rebuild/02-capability-map.md","docs/rebuild/03-orchestration.md",
    "docs/rebuild/04-design-system.md","docs/rebuild/05-parity-matrix.md",
    "docs/rebuild/06-testing-report.md","docs/rebuild/07-final-report.md",
]
for name in ENTRYPOINTS + CANONICAL:
    p=ROOT/name
    assert p.exists() and p.stat().st_size>200, f"missing reconstruction artifact: {name}"

build=(ROOT/"build.py").read_text(encoding="utf-8")
assert '"services.js"' in build, "application service layer is not bundled"
assert '"fusion.css"' in build, "fusion.css is not bundled"
assert '"fusion-shell.js"' in build, "fusion-shell.js is not bundled"
assert build.index('"fusion.css"') > build.index('"capabilities-v2.css"'), "fusion CSS must load last"
assert build.index('"fusion-shell.js"') > build.index('"audit-bridge.js"'), "fusion shell must load after audit bridge"

js=(ROOT/"ui/fusion-shell.js").read_text(encoding="utf-8")
css=(ROOT/"ui/fusion.css").read_text(encoding="utf-8")
for marker in ["SKosifFusion","fusion-v1","sk-command-layer","sk-fusion-command","sk-fusion-nav-section"]:
    assert marker in js or marker in css, f"fusion marker missing: {marker}"
assert 'dataset.skInformationArchitecture="fusion-v1"' in js, "one-IA runtime marker missing"
assert 'onView?.("dash",commandCenter)' in js, "command center hook missing"
assert '.rail .modeseg' in js and '.remove()' in js, "legacy Standard/Advanced switch is not retired at runtime"
assert "MutationObserver" in js and "sk-fusion-audit-style" in js, "nested audit-shell fusion is not installed"

# Presentation fusion may read existing browser state, but it must not perform destructive migrations.
for forbidden in ["indexedDB.deleteDatabase", "localStorage.clear()", "DROP TABLE", "DELETE FROM"]:
    assert forbidden not in js, f"destructive data operation in fusion shell: {forbidden}"

print("Zero-legacy reconstruction contract: OK")

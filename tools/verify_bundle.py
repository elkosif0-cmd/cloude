"""Validates the production dist/ bundle against S.kosif zero-legacy standards."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

def verify():
    app = (DIST / "app-safe.html").read_text(encoding="utf-8")
    unlock = (DIST / "index.html").read_text(encoding="utf-8")
    manifest = (DIST / "manifest.webmanifest").read_text(encoding="utf-8")
    js = (DIST / "skosif.js").read_text(encoding="utf-8")
    css = (DIST / "skosif.css").read_text(encoding="utf-8")
    sw = (DIST / "sw.js").read_text(encoding="utf-8")

    required_files = ["skosif.js", "skosif.css", "sw.js", "manifest.webmanifest", "secure/crypto.json"]
    if (DIST / "secure/private.json").exists():
        required_files.append("secure/private.json")
    for f in required_files:
        assert (DIST / f).exists(), f"missing file: {f}"

    assert "./skosif.css?v=" in app and "./skosif.js?v=" in app, "ui bundle not linked"
    assert "<title>S.kosif</title>" in app, "safe app title missing"
    assert "S.kosif" in unlock, "unlock screen title missing"
    assert '"name":"S.kosif"' in manifest, "manifest app name mismatch"
    assert 'const SEED_B64 = "";' in app, "safe app marker missing"
    assert len(list((DIST / "secure").glob("seed.enc.b64.part*"))) == 6, "missing encrypted seed parts"
    assert "SEED_RAWS=[{" not in app, "price catalog left in plaintext"

    # One navigation, no floating legacy layers
    for gone in ["sk-fab", "jev-fab", "v29-fab", "sx-taskbar", "sk33-dock", "v21-dock", "v26-tabbar", "v203-magic-fab", "v204-contract-fab", "V25_MODULES_BEGIN"]:
        assert gone not in app and gone not in js, "old floating layer is back: " + gone

    for marker in ["registerView", "SKosifCore", "const DAILY=[", "const ADVANCED=["]:
        assert marker in app, f"core app marker missing: {marker}"

    # Every screen is registered in the one bundle
    for view in ["offers", "inventory", "suppliers", "cash", "receivables", "jev", "sensitivity", "kernel", "carcass", "smartmatch", "excelrecon",
                 "zatca", "blending", "labels", "traceability", "culinary", "scanner", "b2bcredit", "execreports", "operations"]:
        assert f'view("{view}"' in js, "screen missing: " + view

    for marker in ["calculateUsableUnitCost", "applyRoundingPolicy", "calculateBoxPricing", "hasCircularDependency", "nrvAllocate", "yieldTrial", "selfTest",
                   "normalizeArabic", "similarity", "redact", "SKIP_WAITING", "data-sk-theme", "zatcaTLV", "code128SVG", "SKosifEnterpriseV38", "SKosifReports", "SKosifERPPlus", "SKosifOperations", "SKosifCapabilitiesV2"]:
        assert marker in js, f"required logic marker missing: {marker}"

    assert "SKServices" in js, "application services layer missing"

    for marker in ["SKosifFusion", "fusion-v1", "sk-command-layer", "sk-fusion-command"]:
        assert marker in js, f"fusion marker missing in js: {marker}"

    assert "/* ---- ui/fusion.css ---- */" in css and ".sk-fusion-nav-section" in css, "fusion css missing in bundle"
    assert "/* ---- ui/fusion-shell.js ---- */" in js, "fusion shell build order missing in bundle"
    assert 'SK.view("capabilitiesv2"' in js, "Capabilities v2 screen missing"

    cap_worker = (ROOT / "capabilities-v2/worker.js").read_text(encoding="utf-8")
    cap_schema = (ROOT / "capabilities-v2/schema.sql").read_text(encoding="utf-8")
    for marker in ["ROLE_PERMISSIONS", "authorizeRole", "normalizeWorkspaceState", "verifyCloudflareAccessSubject", "workspace_revision_conflict", "integrityStatus"]:
        assert marker in cap_worker, f"cap_worker marker missing: {marker}"
    for marker in ["CREATE TABLE IF NOT EXISTS tenants", "tenant_members", "workspaces", "workspace_revisions", "audit_log", "archived_workspace_is_read_only"]:
        assert marker in cap_schema, f"cap_schema marker missing: {marker}"

    assert "SKIP_WAITING" in sw and "skosif.js" in sw

    # accounting & audit: three vendored apps, loaded on first use from dist/audit
    for f in ["audit/mount.js", "audit/app.css", "audit/markup.html", "audit/classic/mount.js", "audit/lab/mount.js"]:
        assert (DIST / f).exists(), f"missing audit file: {f}"

    for view in ["auditdesk", "auditdocs", "auditissues", "auditcouncil", "auditfin", "auditreport", "auditanalytics", "auditlab"]:
        assert f'"{view}"' in js and f"'{view}'" in app, f"audit screen missing: {view}"

    audit_js = "\n".join(p.read_text(encoding="utf-8") for p in (DIST / "audit").rglob("*.js"))
    assert "document.querySelector(" not in audit_js, "audit studio must query its own shadow root"

    print("ALL PRODUCTION DIST BUNDLE & AUDIT ASSERTIONS PASSED (100% OK)")

if __name__ == "__main__":
    verify()

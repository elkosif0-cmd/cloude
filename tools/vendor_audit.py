"""Bring KOSIF Audit Studio (kosif-audit-studio) into S.kosif as ui/audit/.

Three apps from the studio repository run inside S.kosif screens, each inside
its own Shadow DOM so its styles and S.kosif's never touch each other:

  ui/audit/          the v5 accounting & audit workspace (index.html)
  ui/audit/classic/  the analysis studio: Benford, sampling, journal tests,
                     agent, voice (legacy.html)
  ui/audit/lab/      the standards research lab (research-lab.html)

This script copies each app's modules and rewrites the few places that assume
the app owns the whole page:

  document.querySelector/All/getElementById -> the app's shadow root
  document.addEventListener (click/keydown…)  -> the shadow root
  document.body / documentElement            -> the app's own body wrapper
  :root / html / body in CSS                 -> :host or .kx-body

Floating controls (voice button, bottom dock) become in-page controls or are
hidden: S.kosif's side menu is the only navigation.

Run it again after the studio repository changes:

  python3 tools/vendor_audit.py /path/to/kosif-audit-studio
"""
from pathlib import Path
import re, shutil, sys

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "../kosif-audit-studio").resolve()
OUT = Path(__file__).resolve().parent.parent / "ui" / "audit"
IMPORT_RE = re.compile(r"""(?:from\s*|import\s*\(\s*|import\s+)['"](\.{1,2}/[^'"]+\.js)['"]""")

V5_CSS = [  # index.html links first, then the v5 style registry (ui-assets.js) order
    "continuous-review.css", "document-intelligence.css", "product-model.css", "kosif-one-editorial-theme.css",
    "freshness-specialists.css", "issue-workspace.css", "council-insights.css", "statement-comparison.css",
    "statement-lineage.css", "report-intake.css", "cash-flow-workspace.css", "equity-workspace.css",
    "disclosure-workspace.css", "report-publication.css", "trace-inspector.css", "workspace-navigation.css",
    "dashboard-capabilities.css", "dashboard-navigation-theme.css", "dashboard-theme.css",
]

V5_BRIDGE = """
:host{display:block;--bg:var(--kx-ground);--surface:var(--kx-surface);--surface2:var(--kx-surface-2);--line:var(--kx-line);
 --text:var(--kx-ink);--ink:var(--kx-ink);--muted:var(--kx-ink-3);--brand:var(--kx-brand);--brand2:var(--kx-brand-2);--paper:var(--kx-surface);
 --kosif-ink:var(--kx-ink);--kosif-purple:var(--kx-brand);--kosif-purple-2:var(--kx-brand-2);--kosif-cream:var(--kx-surface);--kosif-line:var(--kx-line)}
.kx-body{background:transparent!important;background-image:none!important;color:var(--kx-ink)!important;font-family:var(--kx-font,inherit)!important;min-height:0!important}
.kx-body .topbar{position:static!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0 0 8px!important}
.kx-body .topbar .brand,.kx-body .topbar a.ghost[href$="legacy.html"],.kx-body #workspaceNavigation{display:none!important}
.kx-body .shell{padding:0!important;max-width:none!important;margin:0!important}
.kx-body .shell .hero.hero.hero{background:linear-gradient(125deg,var(--kx-brand) 0%,var(--kx-brand-2) 100%)!important;color:#fff!important;box-shadow:none!important}
.kx-body button.primary,.kx-body .primary{background:var(--kx-brand)!important;border-color:var(--kx-brand)!important;color:#fff!important}
.kx-body:not([data-workspace-view="overview"]) #kosif-operating-model{display:none!important}
"""

CLASSIC_BRIDGE = """
:host{display:block}
.kx-body.kx-body:not([data-theme="dark"]){--primary:var(--kx-brand);--primary-strong:var(--kx-brand);--primary-soft:color-mix(in srgb,var(--kx-brand) 14%,var(--kx-surface));
 --surface:var(--kx-surface);--surface-2:var(--kx-surface-2);--surface-3:var(--kx-ground);--text:var(--kx-ink);--muted:var(--kx-ink-3);--line:var(--kx-line)}
.kx-body{background:transparent!important;background-image:none!important;min-height:0!important;font-family:var(--kx-font,inherit)!important;border-radius:16px;overflow:hidden}
.kx-body .skip-link,.kx-body .mobile-dock{display:none!important}
.kx-body .voice-fab{position:static!important;display:inline-grid!important;width:auto!important;height:auto!important;min-height:42px;padding:0 16px!important;border-radius:12px!important;margin:12px!important;box-shadow:none!important}
@media (min-width:901px){
 .kx-body .app-shell{display:grid!important;grid-template-columns:var(--sidebar-width,240px) minmax(0,1fr);align-items:start;min-height:0!important}
 .kx-body .sidebar{position:sticky!important;top:0!important;transform:none!important;height:auto!important;max-height:100vh;overflow:auto}
 .kx-body .workspace{margin:0!important;min-height:0!important}
}
"""

LAB_BRIDGE = """
:host{display:block}
/* the lab is designed dark end to end; it stays a dark panel inside the page */
.kx-body{min-height:0!important;border-radius:18px;overflow:hidden;padding:4px 0;font-family:var(--kx-font,inherit)!important}
.kx-body a.back{display:none!important}
"""

APPS = {
    "": dict(entry="continuous-review.js", extra=["product-model.js"], html="index.html", css=V5_CSS,
             root="__kxRoot", body="__kxBody", host_root=True, bridge=V5_BRIDGE),
    "classic": dict(entry="app.js", extra=[], html="legacy.html", css=["styles.css", "studio.css"],
                    root="__kxRootC", body="__kxBodyC", host_root=False, bridge=CLASSIC_BRIDGE),
    "lab": dict(entry="research-lab.js", extra=[], html="research-lab.html", css=[],
                root="__kxRootR", body="__kxBodyR", host_root=False, bridge=LAB_BRIDGE),
}

def rewrite_js(text, name, app):
    r, b = app["root"], app["body"]
    text = text.replace("document.querySelectorAll(", f"{r}().querySelectorAll(")
    text = text.replace("document.querySelector(", f"{r}().querySelector(")
    text = text.replace("document.getElementById(", f"{r}().getElementById(")
    text = re.sub(r"document\.addEventListener\((?!['\"](?:DOMContentLoaded|visibilitychange)['\"])", f"{r}().addEventListener(", text)
    text = re.sub(r"(\b\w+\s*=\s*)document(\s*[),])", lambda m: m.group(1) + r + "()" + m.group(2), text)  # (sel, root = document)
    text = text.replace("document.body", f"{b}()")
    text = text.replace("document.documentElement", f"{b}()")
    text = re.sub(r"document\.title\s*=", "window.__kxTitle=", text)
    text = text.replace("document.activeElement", f"({r}().activeElement||document.activeElement)")
    if name == "v5/ui-assets.js":  # styles are bundled into the app's css and live in the shadow root
        text = re.sub(r"export function ensureV5Styles\([^)]*\)\{.*\}\s*$", "export function ensureV5Styles(){}\n", text, flags=re.S)
    if name == "v5/continuous-documents.js":
        text = text.replace(f"if(!{r}().querySelector('link[href=\"./document-intelligence.css\"]')){{const link=document.createElement('link');link.rel='stylesheet';link.href='./document-intelligence.css';document.head.append(link)}}", "")
        assert "document-intelligence.css" not in text, "continuous-documents.js loader changed upstream"
    if name == "v5/continuous-workspace-navigation.js":  # S.kosif's menu drives the view, not the URL hash
        text = text.replace("workspaceViewFromHash(location.hash)", "workspaceViewFromHash(window.__kxInitialView||'')")
        text = text.replace("history.replaceState(null,'',target)", "void target")
    return text

def scope_selector(sel, root_to):
    s = sel.strip()
    if not s:
        return s
    s = re.sub(r"^:root\b", root_to, s)
    s = re.sub(r"^html\s+body\b", ".kx-body", s)
    s = re.sub(r"^html\b", root_to, s)
    s = re.sub(r"^body\b", ".kx-body", s)
    return s

def scope_css(css, root_to):
    """Rewrite top-level and @media/@supports selectors; leave @keyframes/@font-face alone."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find("{", i)
        if j < 0:
            out.append(css[i:]); break
        head = css[i:j]
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == "{": depth += 1
            elif css[k] == "}": depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        h = head.strip()
        if h.startswith("@import"):
            h = h[h.find(";") + 1:].strip() if ";" in h else ""
        if h.startswith("@media") or h.startswith("@supports"):
            out.append(h + "{" + scope_css(body, root_to) + "}")
        elif h.startswith("@"):
            out.append(h + "{" + body + "}")
        elif h:
            out.append(",".join(scope_selector(x, root_to) for x in h.split(",")) + "{" + body + "}")
        i = k
    return "\n".join(x for x in out if x.strip())

def module_closure(entries):
    """Every module reachable from the entries through relative imports."""
    seen, todo = set(), list(entries)
    while todo:
        f = todo.pop()
        if f in seen:
            continue
        seen.add(f)
        for spec in IMPORT_RE.findall((SRC / f).read_text(encoding="utf-8")):
            todo.append((SRC / f).parent.joinpath(spec).resolve().relative_to(SRC).as_posix())
    return seen

def mount_js(app):
    imports = "\n".join(f"  await import('./{m}');" for m in [app["entry"], *app["extra"]])
    nav = ("  const nav = await import('./v5/continuous-workspace-navigation.js');\n"
           "  return { setView: v => nav.setWorkspaceView(v, { syncHash: false }) };\n") if app["entry"] == "continuous-review.js" else "  return { setView() {} };\n"
    return f"""/* Generated by tools/vendor_audit.py — mounts the app inside a shadow root. */
export async function mount(host, view) {{
  const root = host.shadowRoot || host.attachShadow({{ mode: 'open' }});
  window.{app['root']} = () => root;
  window.{app['body']} = () => root.querySelector('.kx-body');
  window.__kxInitialView = view || 'overview';
  const [css, markup] = await Promise.all([
    fetch(new URL('./app.css', import.meta.url)).then(r => r.text()),
    fetch(new URL('./markup.html', import.meta.url)).then(r => r.text()),
  ]);
  root.innerHTML = '<style>' + css + '</style><div class="kx-body">' + markup + '</div>';
{imports}
{nav}}}
"""

def build_app(sub, app):
    dst = OUT / sub if sub else OUT
    dst.mkdir(parents=True, exist_ok=True)
    for f in sorted(module_closure([app["entry"]]) | set(app["extra"])):
        (dst / f).parent.mkdir(parents=True, exist_ok=True)
        (dst / f).write_text(rewrite_js((SRC / f).read_text(encoding="utf-8"), f, app), encoding="utf-8")
    html = (SRC / app["html"]).read_text(encoding="utf-8")
    inline = "\n".join(re.findall(r"<style\b[^>]*>(.*?)</style>", html, flags=re.S))
    root_to = ":host" if app["host_root"] else ".kx-body"
    css = "\n".join(f"/* {n} */\n" + scope_css((SRC / n).read_text(encoding="utf-8"), root_to) for n in app["css"])
    if inline:
        css += "\n/* inline styles */\n" + scope_css(inline, root_to)
    (dst / "app.css").write_text(css + "\n/* S.kosif theme bridge */" + app["bridge"], encoding="utf-8")
    body = html[html.index("<body"):]
    body = body[body.index(">") + 1:body.rindex("</body>")]
    body = re.sub(r"<script\b[^>]*>.*?</script>", "", body, flags=re.S)
    (dst / "markup.html").write_text(body.strip() + "\n", encoding="utf-8")
    (dst / "mount.js").write_text(mount_js(app), encoding="utf-8")

def main():
    if not (SRC / "continuous-review.js").exists():
        raise SystemExit(f"not a kosif-audit-studio checkout: {SRC}")
    if OUT.exists():
        shutil.rmtree(OUT)
    for sub, app in APPS.items():
        build_app(sub, app)
    (OUT / "SOURCE.txt").write_text("Vendored from kosif199022-jpg/kosif-audit-studio by tools/vendor_audit.py.\n"
                                    "Edit upstream and re-run the tool; files here are generated.\n", encoding="utf-8")
    print("audit studio vendored:", sum(1 for _ in OUT.rglob("*")), "files")

if __name__ == "__main__":
    main()

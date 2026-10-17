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
/* KOSIF identity: the studio's dark leftovers (strips, dialogs, inputs) take the app's tokens */
.kx-body .gateway-strip,.kx-body .delta-cards div,.kx-body .document-preview-column,.kx-body .document-claim-column,.kx-body .workspace-overview-strip,.kx-body .journey,.kx-body .now-panel{background:var(--sk-surface-2)!important;border-color:var(--sk-line)!important;color:var(--sk-ink)!important}
.kx-body .document-preview-surface{background:var(--sk-surface-3)!important}
.kx-body .gateway-strip input,.kx-body .recipe-form input,.kx-body dialog select,.kx-body dialog input[type=file],.kx-body .issue-dialog input,.kx-body .issue-dialog select,.kx-body .issue-dialog textarea,.kx-body .lineage-search input,.kx-body .cash-flow-balances input,.kx-body .cash-movement-form input,.kx-body .cash-movement-form select,.kx-body .equity-component-form input,.kx-body .equity-movement-form input,.kx-body .equity-movement-form select,.kx-body .report-publication-toolbar select{background:var(--sk-surface)!important;color:var(--sk-ink)!important;border-color:var(--sk-line-2)!important}
.kx-body .statement-lineage-dialog,.kx-body .trace-inspector-dialog{background:var(--sk-surface)!important;color:var(--sk-ink)!important;border-color:var(--sk-line)!important}
.kx-body .statement-lineage-table thead{background:var(--sk-surface-2)!important}
.kx-body .trace-inspector-shell pre{background:var(--sk-surface-2)!important;color:var(--sk-ink)!important;border-color:var(--sk-line)!important}
.kx-body dialog::backdrop{background:rgba(11,31,58,.5)!important}
.kx-body .specialist-grid article{border-color:var(--sk-line)!important;background:var(--sk-surface-2)!important}
.kx-body .intent-card:not(.hero *){background:var(--sk-surface)!important;border-color:var(--sk-line)!important;color:var(--sk-ink)!important}
.kx-body .report-panel:before,.kx-body .council-panel:before{background:var(--sk-grad-brand)!important}
.kx-body .callout{border-inline-start-color:var(--sk-brand)!important;background:var(--sk-brand-soft)!important}
.kx-body .dropzone,.kx-body .readiness{background:var(--sk-surface-2)!important;border-color:var(--sk-line-2)!important}
"""

CLASSIC_BRIDGE = """
:host{display:block}
/* KOSIF identity: the analysis studio speaks the app's tokens in every look and mode */
.kx-body.kx-body,.kx-body.kx-body[data-theme="dark"]{color-scheme:inherit;
 --bg:var(--sk-bg);--surface:var(--sk-surface);--surface-2:var(--sk-surface-2);--surface-3:var(--sk-surface-3);
 --text:var(--sk-ink);--muted:var(--sk-ink-3);--line:var(--sk-line);--line-strong:var(--sk-line-2);
 --primary:var(--sk-brand);--primary-strong:var(--sk-brand);--primary-soft:var(--sk-brand-soft);
 --accent:var(--sk-brand-2);--accent-soft:var(--sk-brand-soft);
 --danger:var(--sk-bad);--danger-soft:var(--sk-bad-soft);--warning:var(--sk-warn);--warning-soft:var(--sk-warn-soft);
 --success:var(--sk-ok);--success-soft:var(--sk-ok-soft);--info:var(--sk-info);--info-soft:var(--sk-info-soft);
 --shadow-sm:var(--sk-shadow-1);--shadow-md:var(--sk-shadow-2);--radius-sm:var(--sk-r-s);--radius:var(--sk-r-l);--radius-lg:calc(var(--sk-r-l) + 4px);
 --font:var(--sk-font)}
.kx-body{background:transparent!important;background-image:none!important;min-height:0!important;font-family:var(--sk-font)!important;border-radius:16px;overflow:hidden}
.kx-body ::selection{background:var(--sk-brand-soft);color:var(--sk-ink)}
.kx-body .skip-link,.kx-body .mobile-dock{display:none!important}
/* its menu is the rail of the app: KOSIF navy, sky active pill, no second brand */
.kx-body .sidebar{background:var(--sk-grad-rail)!important;color:var(--sk-rail-ink)!important;border-radius:var(--sk-r-l)}
.kx-body .sidebar .brand{display:none!important}
.kx-body .nav-group{color:var(--sk-rail-mute)!important}
.kx-body .nav-item{color:var(--sk-rail-ink)!important}
.kx-body .nav-item:hover{background:var(--sk-rail-2)!important}
.kx-body .nav-item.active{background:var(--sk-rail-active)!important;color:#fff!important;box-shadow:inset -3px 0 0 var(--sk-brand-2)!important}
.kx-body .nav-item.active .nav-badge,.kx-body .nav-badge{background:rgba(255,255,255,.1)!important;color:var(--sk-rail-ink)!important}
.kx-body .new-indicator{background:var(--sk-brand-2)!important}
.kx-body .sidebar-status{border-top-color:rgba(255,255,255,.08)!important;color:var(--sk-rail-mute)!important}
/* heroes and covers: the KOSIF gradient, white type, sky highlights */
.kx-body .command-hero,.kx-body .hero-card,.kx-body .reference-hero,.kx-body .report-cover{background:var(--sk-grad-brand)!important;color:#fff!important}
.kx-body .hero-copy h1 em{color:#cfeeff!important}
.kx-body .hero-card .button.primary{background:#fff!important;color:var(--sk-brand)!important;border-color:#fff!important}
.kx-body .hero-card .button.primary:hover{background:#e8f1fe!important}
.kx-body .hero-visual::before{border-color:rgba(255,255,255,.22)!important;box-shadow:0 0 0 24px rgba(255,255,255,.04),0 0 0 50px rgba(255,255,255,.02)!important}
.kx-body .readiness-ring{background:conic-gradient(#fff var(--progress),rgba(255,255,255,.18) 0)!important;box-shadow:none!important}
.kx-body .readiness-ring::after{background:radial-gradient(ellipse at 30% 70%,#1668e3,#0b1030 85%)!important;box-shadow:inset 0 0 30px rgba(6,18,38,.45)!important}
.kx-body .readiness-ring::before{background:#fff!important;box-shadow:0 0 14px rgba(255,255,255,.8)!important}
.kx-body .agent-emblem,.kx-body .voice-fab{background:var(--sk-grad-brand)!important;color:#fff!important}
.kx-body .voice-orb{background:radial-gradient(circle at 35% 35%,#bfe9ff,#1668e3 60%,#0b1030)!important}
.kx-body .toast{background:var(--sk-rail)!important}
.kx-body .studio-dialog::backdrop{background:rgba(11,31,58,.5)!important}
.kx-body .voice-fab{position:static!important;display:inline-grid!important;width:auto!important;height:auto!important;min-height:42px;padding:0 16px!important;border-radius:12px!important;margin:12px!important;box-shadow:none!important}
@media (min-width:901px){
 .kx-body .app-shell{display:grid!important;grid-template-columns:var(--sidebar-width,240px) minmax(0,1fr);align-items:start;min-height:0!important}
 .kx-body .sidebar{position:sticky!important;top:0!important;transform:none!important;height:auto!important;max-height:100vh;overflow:auto}
 .kx-body .workspace{margin:0!important;min-height:0!important}
}
"""

LAB_BRIDGE = """
:host{display:block}
/* KOSIF identity: the lab takes the app's tokens (it was a dark purple panel) */
.kx-body.kx-body{color-scheme:inherit;--bg:var(--sk-bg);--panel:var(--sk-surface);--panel2:var(--sk-surface-2);--line:var(--sk-line);--text:var(--sk-ink);--muted:var(--sk-ink-3);
 --accent:var(--sk-brand);--good:var(--sk-ok);--warn:var(--sk-warn);--danger:var(--sk-bad);--shadow:var(--sk-shadow-1)}
.kx-body{min-height:0!important;background:transparent!important;color:var(--sk-ink)!important;font-family:var(--sk-font)!important}
.kx-body a.back,.kx-body .top{display:none!important}
.kx-body .shell{padding:0!important;max-width:none!important}
.kx-body .card{background:var(--sk-surface)!important;border-color:var(--sk-line)!important;box-shadow:var(--sk-shadow-1)!important;border-radius:var(--sk-r-l)!important}
.kx-body .hero .hero-copy{background:var(--sk-grad-brand)!important;border:0!important;color:#fff}
.kx-body .hero .hero-copy p{color:rgba(255,255,255,.88)!important}
.kx-body .hero .hero-copy .eyebrow{display:none!important}
.kx-body .hero .hero-copy .note{background:rgba(255,255,255,.12)!important;color:#fff!important;border-right-color:#cfeeff!important}
.kx-body .source-pill{background:var(--sk-brand-soft)!important;border-color:color-mix(in srgb,var(--sk-brand) 22%,transparent)!important;color:var(--sk-ink-2)!important}
.kx-body select,.kx-body input{background:var(--sk-surface)!important;color:var(--sk-ink)!important;border-color:var(--sk-line-2)!important}
.kx-body button{background:var(--sk-brand)!important;color:var(--sk-on-brand)!important}
.kx-body button.secondary,.kx-body .secondary{background:var(--sk-surface)!important;color:var(--sk-ink)!important;border:1px solid var(--sk-line-2)!important}
.kx-body .metric,.kx-body .item{background:var(--sk-surface-2)!important;border-color:var(--sk-line)!important}
.kx-body .status.good{background:var(--sk-ok-soft)!important}.kx-body .status.warn{background:var(--sk-warn-soft)!important}
.kx-body .status.danger{background:var(--sk-bad-soft)!important}.kx-body .status.info{background:var(--sk-brand-soft)!important;color:var(--sk-brand)!important}
.kx-body th{color:var(--sk-ink-2)!important;background:var(--sk-surface-2)!important}
.kx-body td{color:var(--sk-ink)!important}
.kx-body th,.kx-body td{border-bottom-color:var(--sk-line)!important}
.kx-body .bar{background:var(--sk-surface-3)!important}
.kx-body .bar>i{background:var(--sk-grad-brand)!important}
.kx-body .note{background:var(--sk-brand-soft)!important;color:var(--sk-ink-2)!important;border-right-color:var(--sk-brand)!important}
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
    # Font URLs contain semicolons inside quoted weights. Remove the complete
    # import, not the first semicolon, before looking for selector blocks.
    css = re.sub(r"@import\s+(?:url\(\s*(?:\"[^\"]*\"|'[^']*'|[^)]*)\s*\)|\"[^\"]*\"|'[^']*')[^;]*;", "", css, flags=re.I)
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

STUDIO_READABILITY = """
/* SQC audit readability: custom properties cross the shadow boundary. */
.kx-body{font-size:max(16px,var(--sk-fs,16px));line-height:1.65}
.kx-body :where(p,small,label,td,th){line-height:1.65}
.kx-body :where(button,input,select,textarea){font-family:inherit;font-size:max(16px,var(--sk-fs,16px))!important;line-height:1.5;min-inline-size:0;max-inline-size:100%}
.kx-body :where(button,input:not([type=checkbox]):not([type=radio]):not([type=hidden]),select){min-block-size:44px}
.kx-body :where(.section-head,.top-actions,.ops-actions,.report-publication-toolbar){flex-wrap:wrap;gap:12px}
.kx-body .workspace-grid{gap:20px;margin-bottom:20px}
.kx-body .workspace-grid>*{min-width:0}
.kx-body .stack{gap:12px}
.kx-body :where(.cash-movement-form,.equity-movement-form,.equity-component-form,.cash-flow-balances,.cash-flow-summary,.ops-form,.spreadsheet-mapping){grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px}
.kx-body :where(.cash-movement-form,.equity-movement-form,.equity-component-form,.cash-flow-balances,.ops-form,.spreadsheet-mapping)>*{min-width:0}
.kx-body .workspace-overview-strip{grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));overflow:visible}
.kx-body :where(.panel,.cash-flow-workspace,.statement-workspace){min-width:0}
.kx-body :where(.statement-lineage-table-wrap,.spreadsheet-preview){max-width:100%;overflow:auto}
@media(max-width:980px){.kx-body .workspace-grid{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){
 .kx-body .panel{padding:16px}
 .kx-body .lineage-search{grid-template-columns:minmax(0,1fr)}
 .kx-body :where(.cash-movement-form,.equity-movement-form,.equity-component-form,.ops-form,.spreadsheet-mapping){grid-template-columns:minmax(0,1fr)}
 .kx-body .ops-form .span-2{grid-column:auto}
}
"""

def readable_studio_css(css):
    """Normalize imported studio text without overriding the user's theme font."""
    # The upstream universal !important family defeats even the theme bridge.
    css = re.sub(r"\*\:not\(i\)[^{]*\{font-family:[^}]*\}", "", css)
    css = re.sub(r"font-family:'Tajawal'[^;}]*!important", "font-family:var(--kx-font,inherit)", css)
    css = re.sub(r"font-size:\s*(\d+(?:\.\d+)?)px", lambda m: "font-size:13px" if float(m.group(1)) < 13 else m.group(0), css)
    css = re.sub(r"(font:\s*(?:(?:normal|italic|oblique|small-caps|bold|bolder|lighter|[1-9]00)\s+)*)(\d+(?:\.\d+)?)px",
                 lambda m: m.group(1) + "13px" if float(m.group(2)) < 13 else m.group(0), css)
    return css + STUDIO_READABILITY

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
    if not sub:
        css = readable_studio_css(css)
    (dst / "app.css").write_text(css + "\n/* S.kosif theme bridge */" + app["bridge"], encoding="utf-8")
    body = html[html.index("<body"):]
    body = body[body.index(">") + 1:body.rindex("</body>")]
    body = re.sub(r"<script\b[^>]*>.*?</script>", "", body, flags=re.S)
    (dst / "markup.html").write_text(body.strip() + "\n", encoding="utf-8")
    (dst / "mount.js").write_text(mount_js(app), encoding="utf-8")

BRAND_RE = re.compile(r"\bKOSIF\b(?!_)|\bS\.kosif\b")
def rebrand(root):
    """The product is SQC — Smart Quality Control: the studio's visible name follows it (storage keys and identifiers are
    lower-case or joined with «_» and stay as they are, so saved work keeps loading)."""
    for f in root.rglob("*"):
        if f.suffix in (".js", ".html", ".css") and f.is_file():
            t = f.read_text(encoding="utf-8"); u = BRAND_RE.sub("SQC", t)
            if u != t: f.write_text(u, encoding="utf-8")

def main():
    if not (SRC / "continuous-review.js").exists():
        raise SystemExit(f"not a kosif-audit-studio checkout: {SRC}")
    if OUT.exists():
        shutil.rmtree(OUT)
    for sub, app in APPS.items():
        build_app(sub, app)
    rebrand(OUT)
    (OUT / "SOURCE.txt").write_text("Vendored from kosif199022-jpg/kosif-audit-studio by tools/vendor_audit.py.\n"
                                    "Edit upstream and re-run the tool; files here are generated.\n", encoding="utf-8")
    print("audit studio vendored:", sum(1 for _ in OUT.rglob("*")), "files")

if __name__ == "__main__":
    main()

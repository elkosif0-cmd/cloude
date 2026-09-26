"""Temporary research ingest: a large PDF from Google Drive -> page text in a temporary Cloudflare D1 database.

Runs only in GitHub Actions (research-ingest.yml). Nothing from the document is written to the repository.
  python ingest.py probe   <request.json>                      check D1 write access
  python ingest.py plan    <request.json> <pdf>                page count, outline, page ranges for the extract jobs
  python ingest.py extract <request.json> <pdf> <first> <last> text per page (OCR for image-only pages)
"""
import json, os, re, subprocess, sys, tempfile, time, urllib.request

ACCOUNT = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")


def d1(db, sql, params=None, tries=4):
    body = json.dumps({"sql": sql, "params": params or []}).encode()
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/d1/database/{db}/query"
    for i in range(tries):
        req = urllib.request.Request(url, data=body, method="POST",
                                     headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                out = json.load(r)
            if out.get("success"):
                return out
            raise RuntimeError(json.dumps(out.get("errors"))[:300])
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 * (i + 1))


# Arabic extracted in visual order comes out reversed; common words tell which way a page reads
WORDS = ["المالية", "القوائم", "المعايير", "الشركة", "التقرير", "المراجعة", "الدولي", "المحاسبة", "الأصول", "الإيرادات", "المعيار", "الضريبة"]


def fix_rtl(text):
    fwd = sum(text.count(w) for w in WORDS)
    rev = sum(text.count(w[::-1]) for w in WORDS)
    if rev > fwd:
        return "\n".join(line[::-1] for line in text.split("\n"))
    return text


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(req):
    d1(req["db"], "INSERT OR REPLACE INTO meta VALUES ('probe', datetime('now'))")
    print("D1 write: OK")


def plan(req, pdf):
    info = run(["pdfinfo", pdf]).stdout
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    d1(req["db"], "INSERT OR REPLACE INTO meta VALUES ('pdfinfo', ?)", [info[:4000]])
    d1(req["db"], "INSERT OR REPLACE INTO meta VALUES ('pages', ?)", [str(pages)])
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf)
        rows = []

        def walk(items, level):
            for it in items:
                if isinstance(it, list):
                    walk(it, level + 1)
                else:
                    try:
                        rows.append((level, reader.get_destination_page_number(it) + 1, str(it.title)[:500]))
                    except Exception:
                        pass

        walk(reader.outline, 1)
        for i, (lv, pg, title) in enumerate(rows):
            d1(req["db"], "INSERT OR REPLACE INTO outline VALUES (?,?,?,?)", [i, lv, pg, title])
        print("outline entries:", len(rows))
    except Exception as e:
        print("outline: none", e)
    size = int(req.get("pagesPerJob", 150))
    ranges = [[a, min(a + size - 1, pages)] for a in range(1, pages + 1, size)]
    with open(os.environ["GITHUB_OUTPUT"], "a") as f:
        f.write("ranges=" + json.dumps(ranges) + "\n")
    print("pages:", pages, "jobs:", len(ranges))


def extract(req, pdf, first, last):
    out = run(["pdftotext", "-f", str(first), "-l", str(last), "-enc", "UTF-8", pdf, "-"]).stdout
    parts = out.split("\f")
    stored = 0
    for i, n in enumerate(range(first, last + 1)):
        text = parts[i] if i < len(parts) else ""
        ocr = 0
        if len(text.strip()) < 40:  # an image-only page: read it with OCR
            with tempfile.TemporaryDirectory() as t:
                run(["pdftoppm", "-f", str(n), "-l", str(n), "-r", "200", "-png", pdf, f"{t}/p"])
                pngs = sorted(p for p in os.listdir(t) if p.endswith(".png"))
                if pngs:
                    text = run(["tesseract", f"{t}/{pngs[0]}", "-", "-l", "ara+eng", "--psm", "3"]).stdout
                    ocr = 1
        else:
            text = fix_rtl(text)
        text = re.sub(r"[ \t]+\n", "\n", text).strip()[:90000]
        d1(req["db"], "INSERT OR REPLACE INTO pages VALUES (?,?,?,?)", [n, len(text), ocr, text])
        stored += 1
    print(f"pages {first}-{last}: {stored} stored")


if __name__ == "__main__":
    mode, req_path = sys.argv[1], sys.argv[2]
    request = json.load(open(req_path))
    if mode == "probe":
        probe(request)
    elif mode == "plan":
        plan(request, sys.argv[3])
    elif mode == "extract":
        extract(request, sys.argv[3], int(sys.argv[4]), int(sys.argv[5]))

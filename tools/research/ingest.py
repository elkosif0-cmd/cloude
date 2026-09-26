"""Temporary research ingest: a large PDF from Google Drive -> page text, for study.

Runs only in GitHub Actions (research-ingest.yml). The text is pushed to a temporary branch of this private repository
(research-tmp-ingest), pulled for analysis and the branch deleted; nothing reaches the app or its branches.
  python ingest.py plan    <pdf> <pagesPerJob> <outdir>         page count, outline, page ranges for the extract jobs
  python ingest.py extract <pdf> <first> <last> <outfile>       text per page (OCR for image-only pages) as JSON lines
"""
import json, os, re, subprocess, sys, tempfile

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


def plan(pdf, size, outdir):
    os.makedirs(outdir, exist_ok=True)
    info = run(["pdfinfo", pdf]).stdout
    open(os.path.join(outdir, "pdfinfo.txt"), "w").write(info)
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    rows = []
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf)

        def walk(items, level):
            for it in items:
                if isinstance(it, list):
                    walk(it, level + 1)
                else:
                    try:
                        rows.append((level, reader.get_destination_page_number(it) + 1, str(it.title)))
                    except Exception:
                        pass

        walk(reader.outline, 1)
    except Exception as e:
        print("outline: none", e)
    with open(os.path.join(outdir, "outline.tsv"), "w") as f:
        for lv, pg, title in rows:
            f.write(f"{lv}\t{pg}\t{title}\n")
    ranges = [[a, min(a + size - 1, pages)] for a in range(1, pages + 1, size)]
    with open(os.environ["GITHUB_OUTPUT"], "a") as f:
        f.write("ranges=" + json.dumps(ranges) + "\n")
    print("pages:", pages, "outline entries:", len(rows), "jobs:", len(ranges))


def extract(pdf, first, last, outfile):
    out = run(["pdftotext", "-f", str(first), "-l", str(last), "-enc", "UTF-8", pdf, "-"]).stdout
    parts = out.split("\f")
    ocr_pages = 0
    with open(outfile, "w") as f:
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
                        ocr_pages += 1
            else:
                text = fix_rtl(text)
            text = re.sub(r"[ \t]+\n", "\n", text).strip()
            f.write(json.dumps({"n": n, "ocr": ocr, "text": text}, ensure_ascii=False) + "\n")
    print(f"pages {first}-{last} done, {ocr_pages} by OCR")


if __name__ == "__main__":
    if sys.argv[1] == "plan":
        plan(sys.argv[2], int(sys.argv[3]), sys.argv[4])
    elif sys.argv[1] == "extract":
        extract(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5])

#!/usr/bin/env python3
"""Resume ONE existing budget-capped Claude session using GitHub Actions metadata.
No new Claude session, no repository writes, no private code ingestion.
"""
import concurrent.futures
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

SESSION = "sesn_014qkk3U2qnXQ3ecc4TAZDDM"
OWNERS = ("elkosif0-cmd", "kosif199022-jpg")
GH = "https://api.github.com"
CLAUDE = "https://api.anthropic.com"
OUTPUT = Path("claude-1000-resume-evidence")
STOP_SECONDS = 465
BLOCK = re.compile(r"(?i)(^|/)(\.env|secrets?|credentials?|private|password|tokens?|node_modules|\.git)(/|$)|\.(pem|key|p12)$")
SENSITIVE_REPOS = {"CLOUDFLARE_API_TOKEN", "whatsapp-personal-bridge", "-"}
MODEL_MAX_CENTS = 1700


def request(url, *, body=None, claude=False):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "kosif-branch-evidence"}
    if claude:
        headers = {
            "x-api-key": os.environ["ANTHROPIC_API_KEY"],
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "managed-agents-2026-04-01",
            "content-type": "application/json",
        }
    else:
        headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    req = urllib.request.Request(url, headers=headers,
                                 method="POST" if body is not None else "GET",
                                 data=json.dumps(body).encode("utf8") if body is not None else None)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as response:
                return json.load(response)
        except urllib.error.HTTPError as err:
            if err.code in (429, 500, 502, 503) and attempt < 2:
                time.sleep(2 ** attempt * 2)
                continue
            raise RuntimeError(f"HTTP {err.code} for {urllib.parse.urlparse(url).path}") from None


def pages(path, limit=12):
    out = []
    for page in range(1, limit + 1):
        join = "&" if "?" in path else "?"
        response = request(GH + path + join + f"per_page=100&page={page}")
        if not isinstance(response, list):
            raise ValueError("Expected GitHub API list")
        out.extend(response)
        if len(response) < 100:
            break
    return out


def refs():
    gathered = []
    public_repos = []
    for owner in OWNERS:
        for repo in pages(f"/users/{owner}/repos?type=owner", limit=5):
            if (repo.get("private") or repo.get("archived") or not repo.get("size")
                or repo["name"] in SENSITIVE_REPOS or BLOCK.search(repo["name"])):
                continue
            full = repo["full_name"]
            public_repos.append(full)
            branch_list = pages(f"/repos/{full}/branches", limit=15)
            for branch in branch_list:
                name = branch.get("name", "")
                if name and not BLOCK.search(name):
                    gathered.append((full, repo.get("default_branch", "main"), name))
    return sorted(set(gathered)), sorted(set(public_repos))


def check(ref):
    repo, base, branch = ref
    row = {"repo": repo, "default": base, "branch": branch, "status": "unknown",
           "ahead": 0, "behind": 0, "paths": [], "error": None}
    if base == branch:
        row["status"] = "base"
        return row
    try:
        uri = f"/repos/{repo}/compare/{urllib.parse.quote(base,safe='')}...{urllib.parse.quote(branch,safe='')}"
        data = request(GH + uri)
        row["status"] = data.get("status", "unknown")
        row["ahead"] = data.get("ahead_by", 0)
        row["behind"] = data.get("behind_by", 0)
        row["paths"] = [f.get("filename") for f in data.get("files", [])
                        if f.get("filename") and not BLOCK.search(f["filename"])][:8]
        if len(data.get("files", [])) == 300:
            row["error"] = "file list truncated by GitHub"
    except Exception as exc:
        row["error"] = str(exc)[:90]
    return row


def clean(text):
    text = re.sub(r"(?i)(sk-ant-[a-z0-9_-]+|github_pat_[a-z0-9_-]+|ghp_[a-z0-9_-]+)",
                  "[REDACTED]", text)
    return "\n".join("[REDACTED]" if re.search(
        r"(?i)(authorization:\s*\S|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=])",
        line) else line for line in text.splitlines())


def summary(message):
    value = clean(message)
    print(value[:5500], flush=True)
    if os.getenv("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf8") as f:
            f.write(value[:5500] + "\n")


def collect():
    src, names = refs()
    summary(f"Indexed {len(src)} unique public branch refs in {len(names)} repositories.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        rows = list(pool.map(check, src))
    OUTPUT.mkdir(exist_ok=True)
    (OUTPUT / "gh-comparisons.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf8")
    counter = Counter(x["status"] for x in rows)
    failures = sum(bool(x["error"]) for x in rows)
    candidates = [x for x in rows if x["ahead"] > 0]
    stats = {"unique_public_branches": len(rows), "repositories": len(names),
             "compare_failures": failures, "statuses": dict(counter),
             "ahead_candidates": len(candidates), "private_repos_included": False}
    (OUTPUT / "coverage.json").write_text(
        json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf8")
    summary("GitHub compare status: " + json.dumps(stats, ensure_ascii=False))
    return rows, stats


def resume(rows, stats):
    if not os.getenv("ANTHROPIC_API_KEY") or not os.getenv("GITHUB_TOKEN"):
        raise RuntimeError("Secure GitHub Actions secrets missing")
    state = request(CLAUDE + "/v1/sessions/" + SESSION, claude=True)
    cap = state.get("budget", {}).get("max_list_cost", {})
    if (cap.get("currency") != "USD" or int(cap.get("amount", "0")) > MODEL_MAX_CENTS
        or int(cap.get("amount", "0")) <= 0):
        raise RuntimeError("Existing Claude session has no verified shared $17 cap")
    if state.get("status") != "idle":
        raise RuntimeError("Existing Claude session not idle; refusing duplicate launch")
    # Upload only path/commit comparison metadata, never source content or private repositories.
    # The request is to run up to 1000 *useful* agents, not to waste 444 tasks
    # auditing duplicate branch names.
    eligible = sorted((x for x in rows if x["ahead"] > 0),
                      key=lambda x: (x["error"] is not None, -x["ahead"]))
    prepared = [
        {k: x[k] for k in ("repo", "branch", "default", "status", "ahead",
                           "behind", "paths", "error")}
        for x in eligible
    ]
    others = [x for x in rows if x["ahead"] == 0 or x["error"]]
    summary(f"Sending {len(prepared)} ahead candidates and {len(others)} others as evidence.")
    prompt = (
        "The user already authorized this ONE Claude session and a budget below "
        "USD 20, and wants a broad, fast audit. Do not ask again for authorization. "
        "This is a continuation of existing session, not a new session. "
        "CRITICAL FIX: Your sandbox receives 403 from api.github.com. "
        "DO NOT call the GitHub API from your sandbox. The attached evidence in "
        "this message was collected by GitHub Actions using authorized read-only "
        "access. Treat it as authoritative **metadata only**, not the full code. "
        "Review ALL unique ahead/divergent branches in this evidence in one "
        "Dynamic Workflow and prioritize high-value, material features. "
        "Aim for up to 1000 genuinely useful focused review agents within the "
        "remaining shared USD 17 list-cost cap and within 7.5 minutes. "
        "If a smaller set of agents is sufficient or limits prevent 1000, "
        "complete that set and report actual counts; do not abort merely "
        "because all 1000 cannot finish. Each branch gets ONE integrated "
        "review of features, accounting, IFRS, ZATCA, tenant isolation, "
        "security, Arabic UX and migration risk. Additional agents only for "
        "unique, difficult file- or subsystem-specific tasks (never duplicate "
        "branch passes). Small routine tasks use Haiku; reserve Sonnet for "
        "up to 8 serious problems and Opus for at most 1 critical architectural "
        "question if the agent API supports different models. "
        "Only analyse public code, no secrets or private GitHub repositories. "
        "No pushing, writing repository files, merging, or deploying. "
        "Propose selective ports to the independent audit branch, cite exact "
        "repo/branch/file evidence, list unverified assumptions, give test gates "
        "and a checkpoint of completed/failed agents. "
        "NO NEED FOR A FURTHER USER APPROVAL, BEGIN THE WORKFLOW NOW. "
        "Here are the GitHub-generated evidence tables: \n"
        + "AHEAD_OR_DIVERGED:\n" + json.dumps(prepared, ensure_ascii=False, separators=(",", ":"))
        + "\nOTHER_BRANCHES:\n" + json.dumps(
            [{k: x[k] for k in ("repo", "branch", "status", "error")} for x in others],
            ensure_ascii=False, separators=(",", ":"))
    )
    reply = request(CLAUDE + "/v1/sessions/" + SESSION + "/events",
                    body={"events": [{"type": "user.message", "content": [
                        {"type": "text", "text": prompt}]}]}, claude=True)
    summary(f"Continuation accepted for session {SESSION}; reusing its budget.")
    start = time.monotonic()
    last = state
    while time.monotonic() - start < STOP_SECONDS:
        time.sleep(15)
        last = request(CLAUDE + "/v1/sessions/" + SESSION, claude=True)
        if last.get("status") in ("idle", "archived", "terminated"):
            break
    else:
        summary("7.75-minute limit reached; asking the coordinator to stop its runs.")
        try:
            request(CLAUDE + "/v1/sessions/" + SESSION + "/events",
                    body={"events": [{"type": "user.interrupt"}]}, claude=True)
            request(CLAUDE + "/v1/sessions/" + SESSION + "/events",
                    body={"events": [{"type": "user.message", "content": [
                        {"type": "text", "text": "Stop ALL active runs now and summarize the work completed."}]}]},
                    claude=True)
        except RuntimeError:
            summary("Coordinator stop steering failed; server-side budget remains.")
    # Pagination with a bounded number of pages; count observed agent threads.
    observed = Counter()
    reports = []
    cursor = None
    for _ in range(35):
        params = "?order=desc&limit=100"
        if cursor:
            params += "&page=" + urllib.parse.quote(cursor, safe="")
        events = request(CLAUDE + "/v1/sessions/" + SESSION + "/events" + params,
                         claude=True)
        for ev in events.get("data", []):
            observed[ev.get("type", "unknown")] += 1
            if ev.get("type") == "agent.message":
                msg = "\n".join(part.get("text", "") for part in ev.get("content", [])
                                if part.get("type") == "text")
                if msg:
                    reports.append(msg)
        cursor = events.get("next_page")
        if not cursor:
            break
    last = request(CLAUDE + "/v1/sessions/" + SESSION, claude=True)
    usage = last.get("usage", {})
    checkpoint = {"session_id": SESSION, "status": last.get("status"),
                  "list_cost": usage.get("list_cost"), "budget": last.get("budget"),
                  "thread_created_events_seen": observed["session.thread_created"],
                  "workflow_end_events_seen": observed["workflow_run.status_ended"],
                  "pagination_truncated": bool(cursor), "coverage": stats,
                  "actual_agent_completion_needs_report_verification": True}
    (OUTPUT / "claude-checkpoint.json").write_text(
        json.dumps(checkpoint, ensure_ascii=False, indent=2), encoding="utf8")
    if reports:
        (OUTPUT / "claude-coordinator-report.md").write_text(
            clean(reports[0][:26000]), encoding="utf8")
    summary("Completed one-session review checkpoint: " +
            json.dumps({k: checkpoint[k] for k in ("status", "list_cost",
                       "thread_created_events_seen", "workflow_end_events_seen",
                       "pagination_truncated")}, ensure_ascii=False))


if __name__ == "__main__":
    OUTPUT.mkdir(exist_ok=True)
    data, status = collect()
    resume(data, status)

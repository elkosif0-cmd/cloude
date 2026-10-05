# S.KOSIF — SHARED AGENT WORKLOG

> Mandatory live coordination ledger.
> Authority: Owner → FOUNDATION.md → Claude lead-development coordination → execution docs → this log.

## Rules
- Read FOUNDATION.md and this log before significant work.
- Claude is the Lead Development Agent for architecture, capability placement, sequencing, and reconciliation of parallel work, subject to the Owner and FOUNDATION.md.
- Every Agent still performs the full Rule Zero inventory.
- Before editing, register: Task ID, Agent, status, scope, branch/PR, expected files/modules.
- Update the entry when scope changes, a material discovery appears, an important milestone completes, or a PR/branch changes.
- If another Agent overlaps, split scope or follow the existing handoff. Do not create a silent competing architecture.
- If you disagree with Claude's current direction, log PROPOSAL / CONFLICT with evidence before implementing a parallel path.
- On stop/completion record evidence, unfinished work, and NEXT ACTION.
- Do not remove another Agent's history; add a new update.

## Status
CLAIMED · ACTIVE · WAITING · BLOCKED · HANDOFF · DONE · SUPERSEDED · PROPOSAL · CONFLICT

## Template
### TASK <id> — <title>
- Agent:
- Status:
- Goal:
- Scope:
- Expected touch set:
- Branch / PR:
- Current progress:
- Evidence / tests:
- Risks / conflicts:
- Unfinished:
- NEXT ACTION:
- Commit(s):

---

### TASK GOVERNANCE-20261005-001 — Constitution and coordination baseline
- Agent: ChatGPT
- Status: HANDOFF
- Goal: Establish canonical product rules, deep inventory, no-capability-loss, and shared Agent coordination.
- Scope: Governance/documentation only.
- Current progress:
  - FOUNDATION.md is canonical.
  - Rule Zero covers every repository under kosif199022-jpg.
  - Inventory must be deep at file/module level and produce a Capability Migration Matrix.
  - No old/unmerged capability may be ignored without a documented decision.
  - Claude is Lead Development Agent for architectural coordination.
  - The 12,506-page financial reference library is an official benchmark source.
- Risks / conflicts:
  - Several open PRs contain useful work but some follow older architecture assumptions.
- Unfinished:
  - Fresh all-repository deep inventory.
  - Capability Migration Matrix.
  - Reconciliation of open PRs/branches.
  - Runtime implementation of the new architecture.
- NEXT ACTION:
  - Active Agents must re-read the latest FOUNDATION.md, register their current task here, inspect Claude's current related work, and continue only in a non-conflicting scope.
- Commit(s):
  - 252bb8ab85ff54070396b0bea886bcc9d6980707
  - c93200c9e620ceed271322d018856e8d3263b243
  - 46fc6610d7c12da15e9f20139d204333019fa793

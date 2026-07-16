# P1 Remediation Program Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` task by task. TDD and two different adversarial review rounds are mandatory.

**Goal:** Materialize the approved P1 WIP=1 remediation Program, preserve all 125 P1 findings as independent audit items, and complete the safety-scoped second-level review input for F-0001, F-0003, F-0129, and F-0131 without changing product code.

**Architecture:** The closed P1/P2 startup package remains immutable historical evidence. A new guarded P1 Program becomes the current recovery surface in `project-state.yaml` and `task-queue.yaml`; only one independently reviewable execution task may be active. Candidate clusters remain routing hints, while concrete remediation tasks are created only after just-in-time second-level review proves a stable authority path, business invariant, and exact file allowlist.

**Tech Stack:** Git worktrees, PowerShell, YAML, Markdown, existing Module Run v2/v3 governance scripts; no dependency changes.

## Global Constraints

- Entry source/master/origin/live SHA: `4cd2792f57d4eea3ac2770598b5490ebcfdead51`.
- Frozen P0 product static baseline: `e136ca28acde82282a17c65ccfb828a01e872c0b`.
- Read-only audit repository: `D:/tiku-readonly-audit`, HEAD `a84224fa12ec85b28e6acd945deba2afa28c6c02`, clean; no Agent may modify it.
- P1 count is 125; P2 count is 18 and is impact-mapping only; 21 runtime validations remain pending and are not executed.
- F-0013 remains `runtime_evidence_required` + `runtime_hold` unless a future independently approved runtime Goal produces evidence.
- Program WIP is 1. Candidate clusters are not execution tasks and never justify deduplication or closure.
- No PR, deployment, browser/runtime validation, real Provider/vector/database operation, dependency/package/lockfile change, force push, or force-with-lease.
- Schema/migration source may be introduced only by a later independently planned task when second-level review proves it necessary; actual migration/apply/backfill/seed remains blocked.
- Each remediation task must use a short branch/worktree, RED before production code, focused and blast-radius regression, P0 baseline guard, two distinct adversarial reviews, evidence, one focused commit, ff-only merge, fresh-master validation, ordinary push to `origin/master`, and cleanup.

---

Date: 2026-07-16

Task ID: `p1-remediation-program-bootstrap-2026-07-16`

Branch: `codex/p1-remediation-program-bootstrap`

Worktree: `D:/tiku/.worktrees/p1-remediation-program-bootstrap`

Task kind: `mechanism_hardening`

Execution profile: `R3`

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all files under `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/lean-module-run-v3-governance.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`

## Requirement Decision Map

- Account identity: learner/employee and administrator account domains must not reuse a phone number; the invariant must hold on every authoritative creation path and under concurrency.
- Learner session: one active session per learner/employee account; a newer login invalidates the older session. Admin sessions intentionally allow multiple devices.
- Logout: every role has a visible logout path, but UI state is not the credential boundary; completion requires server-side revocation or a non-misleading failure state.
- Registration: successful registration creates a usable account and enters the redeem flow; a failed response must not silently leave an unrecoverable partial identity.
- Role-separated runtime remains blocked; this Program performs static remediation and local automated tests only.
- Edition-aware authorization remains service-computed and is not changed by this bootstrap. The advanced reading surface is included because the reviewed session flows affect organization roles, but no edition or authorization scope implementation is authorized here.

## Requirement Mapping

- F-0001 maps to `00-index.md` data rule 1, `modules/01-user-auth.md` unified-account rules, `epic-01-user-auth.md` US-01-01 AC-3, and `modules/06-admin-ops.md` administrator account creation rules.
- F-0003 maps to `modules/03-student-experience.md` personal-center logout, `modules/06-admin-ops.md` role-aware visible logout, and the role-separated R1 workspace/logout requirement.
- F-0129 maps to US-01-01 AC-1/AC-4 and the atomicity/idempotency capability recorded by the finding; the product contract requires one explainable registration outcome.
- F-0131 maps to `modules/01-user-auth.md` session management and US-01-02 AC-2/AC-3.
- This bootstrap modifies governance only. It does not claim any of the four findings is fixed or statically closed.

## Evidence-Only Sources

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-15-p1-remediation-serial-program.md`
- `docs/05-execution-logs/task-plans/2026-07-15-p1-p2-remediation-startup-package-v1.md`
- `docs/05-execution-logs/evidence/2026-07-15-p1-p2-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml`
- `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml`
- `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml`
- `D:/tiku-readonly-audit/findings/finding-register.yaml` and related audit artifacts are immutable evidence, not requirement SSOT.

## Conflict Check

- Git, remote, P0 baseline, and audit-repository entry facts match the user-supplied recovery baseline. No unexplained drift exists.
- The four P1-RC-01 candidates do not currently justify one implementation task: their claimed authority boundaries differ (cross-domain identity uniqueness, client/server logout completion, registration unit-of-work, and concurrent single-session issuance). The Program must preserve them as four separate triage items until current-code review proves any narrower shared root cause.
- The closed startup package says P1 implementation is blocked pending a new Goal. The current user request supplies that new Goal and task-scoped closeout authorization; the bootstrap must supersede the old block in the new Program projection without rewriting the historical startup evidence.
- No requirement/ADR/traceability conflict currently requires user decision. If current code and P0 evidence cannot settle a finding statically, it remains `needs_review`/project `runtime_evidence_required` rather than being assumed safe or vulnerable.

## Subagent Safety Assessment

Result: `approved_read_only_after_plan`.

- Maximum concurrency: main Agent plus at most three Subagents; Program WIP remains 1.
- Single writer: the main Agent is the only writer for bootstrap and the default writer for product remediation.
- Subagent A may only read requirements, ADRs, traceability, original findings, P0 evidence, and business invariants.
- Subagent B may only read current authority paths, data models, tests, attack paths, and propose an exact file allowlist.
- Subagent C is reserved for the independent second adversarial review after implementation.
- A/B may run concurrently only because both are read-only and have disjoint analysis deliverables. They may not edit, stage, commit, change state/queue/ledger/evidence, merge, push, clean worktrees, run databases/Providers/runtime/browser/deploy, or modify `D:/tiku-readonly-audit`.
- No coding Subagent is approved for this bootstrap or the initial four-finding review. If a later task delegates coding, the user-specified independent worktree, exact allowlist/invariants/commands, single-writer, diff review, and main-Agent verification rules are mandatory.
- If paths overlap ambiguously, requirements conflict, or validation cannot be isolated, Subagents are stopped and the task returns to single-Agent serial execution.

## Allowed Files

- `.husky/pre-commit`
- `.husky/pre-push`
- `scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1`
- `scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.Smoke.ps1`
- `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
- `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md`
- `docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-program-bootstrap.md`
- `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-program-bootstrap.md`
- `docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-program-bootstrap.md`

## Blocked Files And Actions

- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `migrations/**`, `seed/**`
- `package.json`, every lockfile, `.env*`, cloud/external configuration
- existing startup ledger/map/cluster/evidence and all files under `D:/tiku-readonly-audit/**`
- PR, force push, force-with-lease, deployment, runtime/browser validation, database/Provider/vector/external-service operation
- any P2 implementation or modification of F-0013 runtime hold

## Task 1: Program Guard RED

- [x] Add smoke fixtures proving the current repository cannot validate a P1 successor Program and cannot safely release the closed startup package's ownership of `currentTask`.
- [x] Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`.
- [x] Expected RED: non-zero because the P1 Program guard does not exist or cannot validate the successor projection.

## Task 2: Minimal Guard And Recovery Projection

- [x] Implement the smallest P1 Program guard that validates canonical candidate dependency order, WIP=1, dynamic task materialization, status consistency, closeout checkpoints, approval boundaries, artifact existence, and F-0013/runtime/P2 exclusions.
- [x] Update the closed startup guard only enough to validate its immutable package while allowing a current successor Program; retain all 143-item, audit-integrity, and product-zero-change checks relevant to the frozen startup artifact.
- [x] Mount the P1 guard in pre-commit and pre-push without removing existing historical/P0 guards.
- [x] Materialize the user approval, current serial Program, bootstrap task, state, and queue. Only the bootstrap task is `in_progress`; no product remediation task is active.

## Task 3: GREEN And Adversarial Verification

- [x] Run the P1 guard smoke; expected GREEN includes positive coverage plus negative cases for WIP>1, reordered candidate dependencies, premature P2/runtime work, scope/approval expansion, missing artifacts, and invalid closeout state.
- [x] Execute every hash-dependent guard through Git for Windows `sh` -> Windows PowerShell 5.1 so hook-shell module resolution cannot differ from interactive validation.
- [x] Poison `GIT_INDEX_FILE` with the product worktree index and prove audit-repository Git checks isolate and restore repository-local environment variables.
- [x] Probe `git --no-optional-locks status` against a disposable repository and prove its index SHA-256, mtime, and size remain unchanged.
- [x] Prove the fresh-master SHA gate rejects an `in_progress` task, then allow only an exact same-task `ready_for_closeout` projection with a negative contract-laundering fixture.
- [x] Distinguish the full pre-push task range from its status-only tip commit; preserve implementation/review gates across the range and reject tip-level contract laundering.
- [x] Compare normalized state/queue across the full `origin/master..HEAD` range so an intermediate scope mutation cannot be hidden behind a pure closeout tip.
- [x] Run the startup-package guard, P0 global baseline guard, P0 serial guard, Module Run pre-commit/closeout/pre-push gates, scoped Prettier, and `git diff --check`.
- [x] Round 1 attacks Program state machine, immutable finding identity, dynamic task decomposition, WIP, authority boundaries, and changed-file scope.
- [x] Round 2 attacks approval expansion, successor recovery, P0/P2/runtime regression, sensitive evidence, remote closeout, and audit-repository contamination.
- [x] Write evidence and an independent audit review; do not claim product remediation.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-program-bootstrap-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-program-bootstrap-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-program-bootstrap-2026-07-16 -SkipRemoteAheadCheck`
- `D:/tiku/node_modules/.bin/prettier.cmd --write <changed governance files>`
- `D:/tiku/node_modules/.bin/prettier.cmd --check <changed governance files>`
- `git diff --check`
- `git diff --name-only 4cd2792f57d4eea3ac2770598b5490ebcfdead51 -- src tests e2e package.json pnpm-lock.yaml src/db/schema drizzle migrations`
- source/master/origin/live and audit HEAD/status/hash integrity commands from the startup evidence.

## Stop Conditions

- Unexplained source/remote/audit drift.
- Requirement/ADR/traceability conflict that changes product behavior.
- Need for product source, tests, schema/migration, dependencies, database, Provider, browser/runtime, PR, force push, or deployment during bootstrap.
- Guard, fresh checkout, or closeout validation cannot be repaired within the exact allowlist.
- Evidence would expose secrets, tokens, cookies, passwords, database URLs, plaintext `redeem_code`, private rows, raw prompts/answers, or full protected content.

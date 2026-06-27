# Active Queue Nonterminal Closeout Triage Approval Package Plan

Task id: `active-queue-nonterminal-closeout-triage-approval-package-2026-06-27`

Branch: `codex/nonterminal-closeout-triage-20260627`

Task kind: `docs_state_approval_package`

moduleRunVersion: 2

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Evidence-Only Sources

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-27-active-queue-archive-index-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-active-queue-archive-index-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-active-queue-archive-index-approval-package.md`

## Requirement Decision Map

- The active goal still requires high-risk package cleanup and Layer 2/Layer 3 advancement.
- Current project status reports no executable pending task.
- Active queue still contains 28 non-terminal task entries: 26 `ready_for_closeout` and 2 `blocked`.
- Changing those entries to terminal or retiring them changes queue semantics and must be handled through a future
  explicitly approved state repair/closeout task.

## Conflict Check

No conflict was found. The task lifecycle SOP allows terminal cleanup only with evidence and clear closeout policy. This
package prepares that future approval only and does not rewrite historical task statuses.

## Allowed Scope

- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create this task plan.
- Create evidence, audit review, and acceptance documents under `docs/05-execution-logs/`.

## Blocked Scope

- Do not change existing non-terminal task statuses.
- Do not archive task blocks or update `task-history-index.yaml`.
- Do not run browser, dev server, e2e, DB, Provider, Cost Calibration, runtime mutation, staging/prod, deploy, payment,
  OCR, export, PR, force push, release readiness, or final Pass.
- Do not edit source, tests, e2e, schema, migration, seed, package, lockfile, `.env*`, scripts, archive files, or
  private local files.

## Implementation Plan

1. Record the non-terminal active queue inventory.
2. Define a future approval boundary for status-only closeout/retirement triage.
3. Update project state and task queue with this docs/state-only approval package.
4. Run scoped formatting, queue/project diagnostics, and Module Run v2 gates.
5. Commit, ff-only merge to `master`, push `origin/master`, and delete the short branch if gates pass under the
   materialized docs/state closeout policy.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md docs/05-execution-logs/evidence/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md docs/05-execution-logs/evidence/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-active-queue-nonterminal-closeout-triage-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-nonterminal-closeout-triage-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId active-queue-nonterminal-closeout-triage-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId active-queue-nonterminal-closeout-triage-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any existing non-terminal status change becomes necessary.
- Any archive/index movement becomes necessary.
- Any blocked runtime, DB, Provider, Cost Calibration, staging/prod, payment, external-service, PR, force push, release
  readiness, or final Pass action becomes necessary.
- Evidence would need to expose sensitive values.

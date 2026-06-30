# AGENTS.md User Instruction Adoption Evidence

## Materialization

- Task id: `agents-md-user-instruction-adoption-2026-06-29`
- Branch: `codex/agents-md-user-instruction-adoption-20260629`
- Base commit: `c805f330b16b86dc07ac1740761b15fee3528900`
- Result: pass governed instruction adoption with scoped validation and state SHA alignment.
- localFullLoopGate: governance instruction adoption only; no source/test/script implementation, dependency, DB,
  Provider, browser, staging/prod, release readiness, final Pass, or Cost Calibration execution.
- Cost Calibration Gate remains blocked.

## Batch Evidence

- Batch range: single task `agents-md-user-instruction-adoption-2026-06-29`.
- Batch type: governance instruction adoption.
- Batch evidence: user-authored `AGENTS.md` instruction update is adopted through scoped governance files.

## RED Evidence

- RED: the user-authored `AGENTS.md` change existed in the worktree but was not yet governed by a task-specific
  allowedFiles boundary for commit hooks.

## GREEN Evidence

- GREEN: this task materializes `AGENTS.md` and scoped governance files as allowedFiles for commit, merge, push, and
  cleanup.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Result | Redacted summary                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------- |
| `npx.cmd prettier --write --ignore-unknown AGENTS.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/task-plans/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/evidence/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/audits-reviews/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/acceptance/2026-06-29-agents-md-user-instruction-adoption.md` | pass   | Scoped formatting applied to allowed files only.                                  |
| `npx.cmd prettier --check --ignore-unknown AGENTS.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/task-plans/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/evidence/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/audits-reviews/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/acceptance/2026-06-29-agents-md-user-instruction-adoption.md` | pass   | All matched files use Prettier style.                                             |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | pass   | No whitespace errors.                                                             |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts drizzle migrations seed e2e playwright-report test-results .next .env`                                                                                                                                                                                                                                                                                                                                                                                | pass   | No blocked path diffs.                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId agents-md-user-instruction-adoption-2026-06-29`                                                                                                                                                                                                                                                                                                                                                                                                       | pass   | Scope, sensitive evidence, and terminology checks passed for 8 files.             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId agents-md-user-instruction-adoption-2026-06-29`                                                                                                                                                                                                                                                                                                                                                                                                  | pass   | Module closeout readiness passed.                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId agents-md-user-instruction-adoption-2026-06-29 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                                                                                                                                                   | pass   | Passed after repository SHA checkpoint alignment to current master/origin master. |

## Validation Notes

- Initial pre-push readiness detected stale repository checkpoint values from a prior task; no source or blocked file
  change was involved. The checkpoint was aligned to current local `master` / `origin/master` base
  `c805f330b16b86dc07ac1740761b15fee3528900` and the readiness gate was rerun.

## Thread Rollover Decision

- threadRolloverGate: continue only from `project-state.yaml`, `task-queue.yaml`, this evidence file, and this task plan.

## Next Module Run Candidate

- nextModuleRunCandidate: none selected inside this task.

## Blocked Remainder

- blockedRemainder: dependency/package manager or toolchain changes, Provider/AI runtime, DB-backed browser/e2e runtime,
  staging/prod/cloud/deploy, release readiness, final Pass, PR, force-push, and Cost Calibration remain blocked unless
  separately approved.

## Batch Commit Evidence

- Commit: to_be_created_after_validation.

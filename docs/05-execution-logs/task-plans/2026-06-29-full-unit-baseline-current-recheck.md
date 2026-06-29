# Full Unit Baseline Current Recheck Plan

- Task id: `full-unit-baseline-current-recheck-2026-06-29`
- Branch: `codex/full-unit-current-recheck-20260629`
- Status: claimed
- Date: `2026-06-29`

## Goal

Re-prove the current `master` full unit baseline after the latest organization analytics local repair closeout. Run
`npm.cmd run test:unit`; if it fails, perform narrow source/test repairs inside the approved unit baseline scope until
the command is green.

## Authorization

This task consumes the active durable goal and staged local Stage C approval recorded in
`durableFullAcceptanceStagedLocalExecutionApproval20260628`, plus the inherited per-task local commit, fast-forward
merge, push, and cleanup approval already materialized in `project-state.yaml` and `task-queue.yaml`.

No additional approval is consumed for browser, DB, AI Provider, dependency, schema/migration/seed, staging/prod,
release readiness, final Pass, PR, force-push, or Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-unit-baseline-current-recheck-and-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-db-alignment-repair.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Requirement Mapping

| Requirement                                       | Current task decision                                                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Current full unit baseline must be green          | Re-run `npm.cmd run test:unit` on the current branch/master state.                                                                             |
| Source/test repair only if needed                 | If current unit baseline fails, repair only allowed source/test files with focused tests before full unit rerun.                               |
| Full acceptance checklist remains completion gate | This task records no browser role completion; later stages must read and cover the checklist.                                                  |
| Sensitive boundary                                | Evidence records command names, counts, failure classes, and pass/fail only.                                                                   |
| Blocked gates                                     | No browser, DB, Provider, dependency, schema/migration/seed, staging/prod, PR, force-push, release readiness, final Pass, or Cost Calibration. |

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-unit-baseline-current-recheck.md`
- `src/app/**`
- `src/components/**`
- `src/features/**`
- `src/hooks/**`
- `src/lib/**`
- `src/server/**`
- `tests/unit/**`

Source/test writes are conditionally allowed only if the current full unit recheck fails.

## Blocked

- `.env*`, package/lockfiles, schema/migration/seed, scripts, e2e, browser/dev-server runtime, DB connection/read/write,
  Provider calls/configuration/credentials, Cost Calibration, staging/prod/deploy, payment/OCR/export/external-service,
  PR, force-push, release readiness, and final Pass.
- `D:\tiku-local-private` reads are blocked for this task because no account or fixture material is needed for unit
  baseline recheck.

## Execution Steps

1. Run `npm.cmd run test:unit`.
2. If green, record current full unit baseline as current-green and skip source/test edits.
3. If red, record redacted failure classes, run focused `npx.cmd vitest run <failing files>`, diagnose root cause, and
   repair narrowly inside allowed source/test files.
4. Run focused GREEN checks when repair is needed.
5. Run `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd run test:unit`.
6. Run scoped Prettier check, `git diff --check`, Module Run v2 pre-commit, module closeout, and pre-push readiness.
7. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, then continue acceptance work.

## Validation Commands

- `npm.cmd run test:unit`
- `npx.cmd vitest run <focused failing unit files if current recheck fails>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-unit-baseline-current-recheck.md docs/05-execution-logs/task-plans/2026-06-29-full-unit-baseline-current-recheck.md docs/05-execution-logs/evidence/2026-06-29-full-unit-baseline-current-recheck.md docs/05-execution-logs/audits-reviews/2026-06-29-full-unit-baseline-current-recheck.md docs/05-execution-logs/acceptance/2026-06-29-full-unit-baseline-current-recheck.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-unit-baseline-current-recheck-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-unit-baseline-current-recheck-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-unit-baseline-current-recheck-2026-06-29 -SkipRemoteAheadCheck`

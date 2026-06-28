# Full Acceptance Local Mutation Boundary Plan

- Task id: `full-acceptance-local-mutation-boundary-2026-06-28`
- Branch: `codex/full-acceptance-local-mutation-boundary-20260628`
- Status: closed
- Date: `2026-06-28`

## Goal

Prepare a redacted docs/state approval package for future localhost UI/API mutations against explicitly test-owned local
fixture data, so write-flow acceptance can resume only after explicit task-level approval.

## SSOT Read List

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-matrix-execution.md`

## Requirement Mapping Result

- Organization training and other write-flow acceptance rows remain blocked until a future task explicitly approves
  localhost UI/API mutations against test-owned data.
- Direct DB/schema/seed work remains outside this approval package.
- Provider/AI write flows remain separately blocked even if local mutation approval is later granted.

## Scope

Allowed files are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-local-mutation-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-local-mutation-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-local-mutation-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-local-mutation-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-local-mutation-boundary.md`

Blocked files include `.env*`, `src/**`, `tests/**`, `e2e/**`, DB schema/migration/seed paths, scripts, package/lockfiles,
Playwright artifacts, `.next/**`, and `D:/tiku-local-private/**`.

## Execution Steps

- [x] Materialize this task in `project-state.yaml` and `task-queue.yaml`.
- [x] Create traceability, evidence, audit, and acceptance files with redacted boundary-only content.
- [x] Record future copyable approval text that contains no raw data or credentials.
- [x] Run scoped Prettier, `git diff --check`, Module Run v2 precommit, closeout, and prepush readiness.
- [x] Close this docs/state package without executing local UI/API mutation.

## Boundaries

- DB: blocked for direct connection, read, write, migration, seed, schema change, and destructive operations.
- AI/Provider: blocked for Provider call, Provider configuration, Provider credential, prompt payload, raw input/output, and
  Cost Calibration Gate.
- Local mutation: blocked for all current execution; future task must name test-owned workflows and keep evidence redacted.
- Evidence: boundary decision and future approval text only; no raw DOM, screenshots, traces, secrets, rows, ids, payloads, or
  complete business content.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/evidence/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-local-mutation-boundary.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/evidence/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-local-mutation-boundary.md docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-local-mutation-boundary.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-local-mutation-boundary-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-local-mutation-boundary-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-local-mutation-boundary-2026-06-28 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push `origin/master`, and deletion of the merged short branch are approved by
the current user's inherited per-task closeout authorization. PR, force-push, deployment, DB, Provider, local mutation
execution, source/test changes, release readiness, final Pass, and Cost Calibration Gate remain blocked.

# Full Acceptance Session Fixture Boundary Plan

- Task id: `full-acceptance-session-fixture-boundary-2026-06-28`
- Branch: `codex/full-acceptance-session-fixture-boundary-20260628`
- Status: closed
- Date: `2026-06-28`

## Goal

Prepare a redacted docs/state approval package for future test-owned local account/session switching, so all-role acceptance
can resume only after explicit task-level approval.

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

- Student, content admin, and ops admin runtime acceptance rows remain blocked until a future task explicitly approves a
  test-owned local account/session switching method.
- Organization admin read-only rows already have partial coverage from the source matrix task; this package does not widen
  that coverage.
- Authorization SSOT requires session and authorization evidence to remain redacted and owner-facing; this task therefore
  prepares approval boundaries only.

## Scope

Allowed files are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-session-fixture-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-session-fixture-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-session-fixture-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-session-fixture-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-session-fixture-boundary.md`

Blocked files include `.env*`, `src/**`, `tests/**`, `e2e/**`, DB schema/migration/seed paths, scripts, package/lockfiles,
Playwright artifacts, `.next/**`, and `D:/tiku-local-private/**`.

## Execution Steps

- [ ] Materialize this task in `project-state.yaml` and `task-queue.yaml`.
- [ ] Create traceability, evidence, audit, and acceptance files with redacted boundary-only content.
- [ ] Record future copyable approval text that contains no credentials or session values.
- [ ] Run scoped Prettier, `git diff --check`, Module Run v2 precommit, closeout, and prepush readiness.
- [ ] Close this docs/state package without executing credential/session access.

## Boundaries

- DB: blocked for connection, read, write, migration, seed, schema change, and destructive operations.
- AI/Provider: blocked for Provider call, Provider configuration, Provider credential, prompt payload, raw input/output, and
  Cost Calibration Gate.
- Account/session: blocked for credential read/entry, cookie/token/session/localStorage/Authorization header capture, and
  browser role-flow login execution.
- Evidence: boundary decision and future approval text only; no raw DOM, screenshots, traces, secrets, rows, ids, payloads, or
  complete business content.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/evidence/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-session-fixture-boundary.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/evidence/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-session-fixture-boundary.md docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-session-fixture-boundary.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-session-fixture-boundary-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-session-fixture-boundary-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-session-fixture-boundary-2026-06-28 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push `origin/master`, and deletion of the merged short branch are approved by
the current user's inherited per-task closeout authorization. PR, force-push, deployment, DB, Provider, credential/session
execution, source/test changes, release readiness, final Pass, and Cost Calibration Gate remain blocked.

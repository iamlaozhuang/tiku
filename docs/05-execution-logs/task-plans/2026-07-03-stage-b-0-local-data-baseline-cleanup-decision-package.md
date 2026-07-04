# 2026-07-03 Stage B-0 Local Data Baseline Cleanup Decision Package Plan

## Task

- Task ID: `stage-b-0-local-data-baseline-cleanup-decision-package-2026-07-03`
- Branch: `codex/stage-b-0-local-data-baseline-cleanup-decision-package-2026-07-03`
- Status: prepared

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-db-provider-staging-cost-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-db-provider-staging-cost-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-db-provider-staging-cost-approval-package.md`

## Scope

Prepare a local data baseline and cleanup decision package before any DB-backed Stage B execution.

This task is docs/state only. It does not connect to DB, read env files, run acceptance, start a dev server, run browser
validation, call Provider, execute staging/prod, mutate local data, or clean any data.

## Implementation Plan

1. Record the cleanup decision: no wholesale local data cleanup before Stage B.
2. Classify local data into keep, isolate, cleanup-candidate, and never-clean-without-separate-approval groups.
3. Define mandatory prerequisites for any later aggregate DB inventory or cleanup task.
4. Materialize redacted evidence and audit notes.
5. Update `project-state.yaml` and `task-queue.yaml` with exact allowed files, blocked files, gates, and closeout policy.
6. Run scoped documentation validation and Module Run v2 gates.

## Risk Controls

- No credentials, passwords, cookies, sessions, Authorization headers, env values, connection strings, raw DB rows,
  internal ids, PII, plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full content,
  screenshots, traces, DOM dumps, or exports in evidence.
- No cleanup or reset without exact DB target, backup/rollback policy, task-owned selector, and dry-run evidence.
- No operation on accounts, organizations, authorization, `redeem_code`, audit logs, AI call logs, migrations, seeds,
  schema, staging, prod, or Provider materials in this task.
- Any later DB inventory must be aggregate-only and must stop on unknown target, unknown ownership, or sensitive output.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-03-stage-b-0-local-data-baseline-cleanup-decision-package.md docs/05-execution-logs/acceptance/2026-07-03-stage-b-0-local-data-baseline-cleanup-decision-package.md docs/05-execution-logs/evidence/2026-07-03-stage-b-0-local-data-baseline-cleanup-decision-package.md docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-0-local-data-baseline-cleanup-decision-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-0-local-data-baseline-cleanup-decision-package-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId stage-b-0-local-data-baseline-cleanup-decision-package-2026-07-03 -SkipRemoteAheadCheck`

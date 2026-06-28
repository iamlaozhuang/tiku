# Full Acceptance Remaining Execution Approval Package

status: closed
taskId: full-acceptance-remaining-execution-approval-package-2026-06-28
branch: codex/full-acceptance-remaining-execution-approval-20260628
createdAt: 2026-06-28T14:50:16-07:00

## Goal

Prepare the remaining execution approval package for finishing the all-role, all-flow, all-function acceptance matrix after the full unit baseline repair. This task is docs/state only. It does not execute browser role switching, credential/session handling, local write flows, direct DB work, Provider/AI calls, source/test edits, dependency changes, staging/prod work, release readiness, or final Pass.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Materialized Authorization

The user approved continuing with the durable goal: complete "full acceptance matrix + full unit baseline repair" under Tiku governance and inherited per-task closeout authorization. This task consumes only the docs/state approval-package portion of that authorization.

Inherited closeout authorization for this task:

- Local commit: approved.
- Fast-forward merge to `master`: approved.
- Push `origin/master`: approved.
- Delete merged short branch: approved.

This package is not fresh approval for the next browser, account/session, DB, Provider, mutation, release, or final Pass task.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-remaining-execution-approval-package.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-remaining-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-remaining-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-remaining-execution-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-remaining-execution-approval-package.md`

## Blocked Files

- `.env*`
- `package.json`
- `package-lock.yaml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `src/**`
- `tests/**`
- `e2e/**`
- `scripts/**`
- `src/db/schema/**`
- `drizzle/**`
- `migrations/**`
- `seed/**`
- `docs/04-agent-system/state/archive/**`
- `docs/04-agent-system/state/task-history-index.yaml`
- `playwright-report/**`
- `test-results/**`
- `.next/**`
- `D:/tiku-local-private/**`
- `D:\tiku-local-private\**`

## Execution Boundaries

- Browser: blocked for this task. No role switching, no credential entry, no session fixture use, no screenshots/traces/raw DOM.
- DB: blocked for this task. No direct connection, no read/write, no migration, no seed, no schema change.
- AI/Provider: blocked for this task. No Provider call, config read/write, credential read, prompt payload, raw AI input/output, or Cost Calibration.
- Account credentials: blocked for this task. No password, cookie, token, session, localStorage, or Authorization header access or evidence.
- Source/tests/dependencies: blocked for this task.

## Remaining Approval Options

Recommended next approval is Option A only. Option B can follow after account/session coverage is stable.

Option A: test-owned local account/session switching only.

Option B: localhost UI/API mutation execution only against explicitly test-owned local fixture data.

Option C: combined Option A and Option B local matrix continuation.

Provider/AI execution, direct DB/schema/seed, dependency changes, staging/prod/deploy, PR/force-push, release readiness, final Pass, and Cost Calibration remain blocked regardless of Option A/B/C.

## Planned Validation

- `npx.cmd prettier --write --ignore-unknown <allowed files>`
- `npx.cmd prettier --check --ignore-unknown <allowed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-remaining-execution-approval-package-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-remaining-execution-approval-package-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-remaining-execution-approval-package-2026-06-28 -SkipRemoteAheadCheck`

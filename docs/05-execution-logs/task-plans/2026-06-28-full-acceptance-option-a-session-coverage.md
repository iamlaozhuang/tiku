# Full Acceptance Option A Session Coverage Task Plan

status: in_progress
taskId: full-acceptance-option-a-session-coverage-2026-06-28
branch: codex/full-acceptance-option-a-session-coverage-20260628
createdAt: 2026-06-28T15:28:05-07:00

## Goal

Execute Option A for the full acceptance matrix: use only localhost/127.0.0.1 and test-owned acceptance accounts or an approved safe role-switching method to verify redacted role, route, workflow, and status coverage for:

- `org_advanced_admin`
- `org_standard_admin`
- `org_advanced_employee`
- `org_standard_employee`
- `ops_admin`
- `content_admin`
- `personal_advanced_student`
- `personal_standard_student`

## Fresh Approval

The user approved:

```text
Approve task-level execution for test-owned local account/session switching only.
Scope: localhost or 127.0.0.1, test-owned acceptance accounts or an approved safe role-switching method, redacted role/route/status evidence only.
Allowed roles: org_advanced_admin, org_standard_admin, org_advanced_employee, org_standard_employee, ops_admin, content_admin, personal_advanced_student, personal_standard_student.
Forbidden: recording credentials, cookies, tokens, sessions, localStorage, Authorization headers, env files, raw DOM, screenshots, traces, raw DB rows, Provider payloads, prompts, raw AI input/output, complete question/paper/material/resource/chunk content, direct DB changes, schema/migration/seed, dependency changes, staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration Gate.
```

## Staged Local Execution Approval

On 2026-06-28T15:43:35-07:00, the user approved staged local execution for the durable goal `full acceptance matrix + full unit baseline repair`.

This current task may consume only Stage A continuation:

- test-owned local account/session switching for all acceptance roles;
- read-only use of `D:\tiku-local-private\acceptance` for a test-owned `ops_admin` login or an approved safe local role-switching method;
- no credential, cookie, token, session, localStorage, Authorization header, raw account file, raw DOM, screenshot, trace, DB row, Provider payload, prompt, raw AI input/output, or complete content evidence.

Stages B-E are recorded in `project-state.yaml` and `task-queue.yaml` as standing local approvals for later task-queued execution only:

- Stage B: localhost-only test-owned write-flow acceptance, no Provider, no direct DB write, no schema/migration/seed.
  User prepared local test material under `D:\tiku-local-private\owner-facing-fixtures` for later Stage B tasks; this
  Option A task records the location only and does not read or quote fixture content.
- Stage C: task-queued source/test/documentation repairs with per-task materialized allowedFiles/blockedFiles and validation.
- Stage D: read-only local DB proof only when needed, aggregate counts/status labels only.
- Stage E: dependency/package/lockfile changes only after a separate reasoned gate task, isolated commit.

This staged approval does not approve staging/prod/deploy, PR, force-push, release readiness, final Pass, or Cost Calibration Gate.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-option-a-session-coverage.md`

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
- `D:/tiku-local-private/owner-facing-fixtures/**`
- `D:\tiku-local-private\owner-facing-fixtures\**`

## Read-Only Private Input

- `D:\tiku-local-private\acceptance` may be used only as local test-owned account input.
- Do not copy, commit, quote, summarize, or record raw account file content.
- Do not record credentials, cookies, tokens, sessions, localStorage, Authorization headers, email, phone, or plaintext `redeem_code`.

## Execution Boundaries

- Browser target: `http://localhost:3000` or `http://127.0.0.1:3000` only.
- Browser action: role/session switching and route/status checks only.
- Evidence: role labels, route/workflow labels, status labels, pass/fail/blocked status, redacted gap summaries.
- Credential/session material: do not record credentials, cookies, tokens, session IDs, localStorage, Authorization headers, screenshots, traces, raw DOM, or storage dumps.
- DB: no direct DB connection, read/write, migration, seed, schema change, raw rows, internal IDs, email, phone, or plaintext `redeem_code`.
- AI/Provider: no Provider calls, prompt payloads, raw AI input/output, Provider config, Provider credentials, or Cost Calibration.
- Data mutation: no local UI/API create/update/delete or write-flow execution.
- Code/dependencies: no source/test/package/lockfile/schema/migration/seed/script changes.
- Release: no staging/prod/deploy, PR, force-push, release readiness, or final Pass claim.

## Execution Steps

- [x] Materialize this task in `project-state.yaml`, `task-queue.yaml`, and this plan.
- [x] Prepare traceability/evidence/audit/acceptance files with redaction boundaries.
- [x] Use in-app browser only after materialization.
- [x] For each allowed role, use a test-owned account/session or approved safe role-switching method.
- [x] Record only route labels, workflow labels, and pass/fail/blocked status.
- [x] Stop and record `blocked` for any role that requires unavailable credentials or sensitive session material.
- [ ] Run scoped formatting and Module Run v2 closeout checks.
- [ ] Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch if validation passes.

## Planned Validation

- `npx.cmd prettier --write --ignore-unknown <allowed files>`
- `npx.cmd prettier --check --ignore-unknown <allowed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-option-a-session-coverage-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-option-a-session-coverage-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-option-a-session-coverage-2026-06-28 -SkipRemoteAheadCheck`

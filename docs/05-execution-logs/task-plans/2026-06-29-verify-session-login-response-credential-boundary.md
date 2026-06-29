# Verify Session Login Response Credential Boundary Task Plan

## Task

- Task id: `verify-session-login-response-credential-boundary-2026-06-29`
- Branch: `codex/session-login-response-boundary-20260629`
- Source story: `seeded_by_security_permission_role_boundary_inventory_2026_06_29`
- Finding id: `role-inv-001`
- Target closure item: prove or route to a fresh-approved repair that session login JSON does not expose client bearer credentials.

## Mandatory Governance Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest related execution packages:
  - `docs/05-execution-logs/task-plans/2026-06-29-security-permission-role-boundary-inventory.md`
  - `docs/05-execution-logs/evidence/2026-06-29-security-permission-role-boundary-inventory.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-security-permission-role-boundary-inventory.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-security-permission-role-boundary-inventory.md`
  - `docs/01-requirements/traceability/2026-06-29-security-permission-role-boundary-inventory.md`
  - `docs/05-execution-logs/task-plans/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
  - `docs/05-execution-logs/evidence/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
  - `docs/01-requirements/traceability/2026-06-29-verify-api-list-sort-by-validation-boundary.md`

## Authorization And Scope

This task is verification-only. It may read the scoped source and test files needed to classify the login/session response boundary, and it may run existing focused unit tests. It may not change source or test files. If verification proves a repair is needed, the outcome must seed a separate repair task with explicit fresh approval for source/test modification.

## Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-verify-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-session-login-response-credential-boundary.md`

## Read-Only Source/Test Surfaces

- `src/server/auth/session-route.ts`
- `src/server/auth/session-route.test.ts`
- `src/server/services/session-service.ts`
- `src/server/services/session-service.test.ts`
- `src/server/contracts/user-auth/session-boundary.ts`
- `src/server/contracts/user-auth/session-boundary.test.ts`
- `tests/unit/auth/**`

## Blocked Files And Actions

- No source or test writes.
- No package or lockfile changes.
- No `.env*`, secrets, connection strings, credentials, cookies, tokens, sessions, localStorage, or Authorization header access or evidence.
- No DB connection, raw row read, mutation, schema, migration, seed, or destructive operation.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI input/output, or Cost Calibration.
- No browser runtime, dev server, raw DOM, screenshots, traces, staging, prod, cloud, deployment, release readiness, final Pass, PR, or force-push.

## Evidence Redaction

Allowed evidence is limited to file paths, route/service/contract/test labels, risk category, severity, status, counts, validation command names, and redacted expected/observed summaries. Evidence must not include literal credential/token/session/cookie/Auth-header values, raw exception payloads, raw DB rows, internal IDs, PII, env content, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, or complete question/paper/material/resource/chunk content.

## Plan

1. Confirm `master` and `origin/master` are aligned and create the short branch.
2. Materialize this task in `project-state.yaml`, `task-queue.yaml`, and this task plan before source reads.
3. Inventory the allowed source/test files and select existing focused tests without reading private fixtures or env files.
4. Trace the login/session response path from service to route to response contract, recording only redacted status summaries.
5. Run focused existing tests when present and safe under the no-DB/no-Provider/no-browser boundary.
6. Classify `role-inv-001` as `not_actionable`, `not_actionable_with_contract_watch`, or `needs_repair_pending_fresh_source_test_approval`.
7. Write traceability, evidence, audit, and acceptance docs with redacted results.
8. Run scoped Prettier, `git diff --check`, Module Run v2 governance checks, then commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch if validation passes.

## Planned Validation

- `npx.cmd vitest run src/server/auth/session-route.test.ts src/server/services/session-service.test.ts src/server/contracts/user-auth/session-boundary.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-session-login-response-credential-boundary.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-session-login-response-credential-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-session-login-response-credential-boundary.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-session-login-response-credential-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-session-login-response-credential-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-session-login-response-credential-boundary-2026-06-29 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved for this verification-only docs/state task after validation passes. Source/test repair remains blocked without fresh materialization and approval.

## Verification Result

- Verdict: `confirmed_needs_repair_pending_fresh_source_test_approval`
- Static review: login success response currently carries a client-visible credential field from service response through route JSON response after cookie persistence.
- Contract check: post-login boundary declares no client bearer credential exposure and server-session persistence.
- Focused existing tests: pass, with a coverage gap for sanitized login JSON.
- Next recommended task: `repair-session-login-response-credential-boundary-2026-06-29`

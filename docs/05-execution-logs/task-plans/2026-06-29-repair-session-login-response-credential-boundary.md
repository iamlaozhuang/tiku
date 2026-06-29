# Repair Session Login Response Credential Boundary Task Plan

## Task

- Task id: `repair-session-login-response-credential-boundary-2026-06-29`
- Branch: `codex/repair-session-login-response-boundary-20260629`
- Source story: `seeded_by_verify_session_login_response_credential_boundary_2026_06_29`
- Finding id: `role-inv-001`
- Target closure item: remove client-visible login response credential exposure while preserving server-session cookie persistence.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest related execution packages:
  - `docs/05-execution-logs/task-plans/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/evidence/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/01-requirements/traceability/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/task-plans/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
  - `docs/05-execution-logs/evidence/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`

## Mandatory Governance Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest related execution packages:
  - `docs/05-execution-logs/task-plans/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/evidence/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/01-requirements/traceability/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/task-plans/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
  - `docs/05-execution-logs/evidence/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`

## Authorization And Scope

This source/test repair task consumes the centralized local security repair-loop authorization recorded at `2026-06-29T10:01:28-07:00`. The authorization is limited to the local repair loop and still requires this task-specific materialization before any source/test changes.

The task may modify only the listed session route/service/contract files and focused tests. The repair must remove client-visible credential exposure from successful login JSON while keeping server-session cookie persistence behavior.

## Writable Files

- `src/server/auth/session-route.ts`
- `src/server/auth/session-route.test.ts`
- `src/server/services/session-service.ts`
- `src/server/services/session-service.test.ts`
- `src/server/contracts/user-auth/session-boundary.ts`
- `src/server/contracts/user-auth/session-boundary.test.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-repair-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-repair-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-repair-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-repair-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-repair-session-login-response-credential-boundary.md`

## Blocked Files And Actions

- No package or lockfile changes.
- No `.env*`, secrets, connection strings, real credentials, cookies, tokens, sessions, localStorage, or Authorization header access or evidence.
- No DB connection, raw row read, mutation, schema, migration, seed, or destructive operation.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI input/output, or Cost Calibration.
- No browser runtime, dev server, raw DOM, screenshots, traces, staging, prod, cloud, deployment, release readiness, final Pass, PR, or force-push.

## Evidence Redaction

Allowed evidence is limited to file paths, route/service/contract/test labels, risk category, severity, status, counts, validation command names, and redacted expected/observed summaries. Evidence must not include literal credential/token/session/cookie/Auth-header values, raw exception payloads, raw DB rows, internal IDs, PII, env content, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, or complete question/paper/material/resource/chunk content.

## Plan

1. Materialize this repair in state, queue, and this task plan before source reads or writes.
2. Read only the allowed session route/service/contract files and focused tests.
3. Add or update a failing focused test that proves successful login JSON does not expose a client-visible credential field after cookie persistence.
4. Implement the smallest repair that preserves cookie persistence and API response shape.
5. Run focused tests and scoped formatting/diff checks.
6. Write redacted traceability, evidence, audit, and acceptance docs.
7. Run Module Run v2 precommit, closeout, and prepush readiness.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch if all gates pass.

## Planned Validation

- `npx.cmd vitest run src/server/auth/session-route.test.ts src/server/services/session-service.test.ts src/server/contracts/user-auth/session-boundary.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/task-plans/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/evidence/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/acceptance/2026-06-29-repair-session-login-response-credential-boundary.md src/server/auth/session-route.ts src/server/auth/session-route.test.ts src/server/services/session-service.ts src/server/services/session-service.test.ts src/server/contracts/user-auth/session-boundary.ts src/server/contracts/user-auth/session-boundary.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/task-plans/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/evidence/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-repair-session-login-response-credential-boundary.md docs/05-execution-logs/acceptance/2026-06-29-repair-session-login-response-credential-boundary.md src/server/auth/session-route.ts src/server/auth/session-route.test.ts src/server/services/session-service.ts src/server/services/session-service.test.ts src/server/contracts/user-auth/session-boundary.ts src/server/contracts/user-auth/session-boundary.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId repair-session-login-response-credential-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId repair-session-login-response-credential-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId repair-session-login-response-credential-boundary-2026-06-29 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved by the centralized local security repair-loop authorization after task validation passes. Source/test changes remain limited to this task's allowed files.

## Initial Status

- Status: `in_progress_materialized_source_test_repair`
- DB, Provider/AI, browser/dev server, release readiness, final Pass, and Cost Calibration: blocked.

# Verify Organization Analytics Admin Capability Source Boundary Task Plan

## Task

- Task id: `verify-organization-analytics-admin-capability-source-boundary-2026-06-29`
- Branch: `codex/org-analytics-capability-boundary-20260629`
- Source story: `seeded_by_security_permission_role_boundary_inventory_2026_06_29`
- Finding id: `role-inv-002`
- Target closure item: prove or route to a fresh-approved repair that organization analytics advanced access cannot bypass service-computed organization capability source.

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
  - `docs/05-execution-logs/task-plans/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/evidence/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-verify-session-login-response-credential-boundary.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-verify-session-login-response-credential-boundary.md`

## Authorization And Scope

This task is verification-only. It may read scoped organization analytics route, service, and test files and run focused existing unit tests. It may not change source or test files. If verification proves a repair is needed, the outcome must seed a separate repair task with explicit fresh approval for source/test modification.

The already confirmed session login response credential repair remains blocked in this task. No source/test repair is approved here.

## Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`

## Read-Only Source/Test Surfaces

- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`

## Blocked Files And Actions

- No source or test writes.
- No package or lockfile changes.
- No `.env*`, secrets, connection strings, credentials, cookies, tokens, sessions, localStorage, or Authorization header access or evidence.
- No DB connection, raw row read, mutation, schema, migration, seed, or destructive operation.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI input/output, or Cost Calibration.
- No browser runtime, dev server, raw DOM, screenshots, traces, staging, prod, cloud, deployment, release readiness, final Pass, PR, or force-push.

## Evidence Redaction

Allowed evidence is limited to file paths, route/service/test labels, risk category, severity, status, counts, validation command names, and redacted expected/observed summaries. Evidence must not include credential/token/session/cookie/Auth-header values, raw exception payloads, raw DB rows, internal IDs, PII, env content, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, or complete question/paper/material/resource/chunk content.

## Plan

1. Confirm `master` and `origin/master` are aligned and create the short branch.
2. Materialize this task in `project-state.yaml`, `task-queue.yaml`, and this task plan before source reads.
3. Read the scoped organization analytics route/service/test files only.
4. Trace whether route-level organization context can bypass service-computed advanced organization capability and visible organization scope.
5. Run focused existing tests when safe under the no-DB/no-Provider/no-browser boundary.
6. Classify `role-inv-002` as `not_actionable`, `not_actionable_with_contract_watch`, or `needs_repair_pending_fresh_source_test_approval`.
7. Write traceability, evidence, audit, and acceptance docs with redacted results.
8. Run scoped Prettier, `git diff --check`, Module Run v2 governance checks, then commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch if validation passes.

## Planned Validation

- `npx.cmd vitest run src/server/services/organization-analytics-route.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-organization-analytics-admin-capability-source-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-organization-analytics-admin-capability-source-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-organization-analytics-admin-capability-source-boundary-2026-06-29 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved for this verification-only docs/state task after validation passes. Source/test repair remains blocked without fresh materialization and approval.

## Initial Status

- Status: `closed`
- Source/test writes: blocked.
- DB, Provider/AI, browser/dev server, release readiness, final Pass, and Cost Calibration: blocked.

## Verification Result

- Verdict: `confirmed_capability_source_mismatch_needs_repair_pending_fresh_source_test_approval`
- Static review: organization analytics route synthesizes advanced organization analytics capability context from session role and route query instead of directly proving service-computed organization capability source.
- Mitigating guard: service still requires advanced organization authorization context and repository-visible organization scope before analytics reads.
- Focused existing tests: pass, 2 files and 20 tests, with a coverage gap for service-computed capability source mismatch.
- Next repair task for this finding: `repair-organization-analytics-capability-source-boundary-2026-06-29`
- Highest-priority confirmed repair remains: `repair-session-login-response-credential-boundary-2026-06-29`

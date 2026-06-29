# Verify Organization AI Generation Capability Source Boundary Task Plan

## Task

- Task id: `verify-organization-ai-generation-capability-source-boundary-2026-06-29`
- Branch: `codex/org-ai-generation-capability-boundary-20260629`
- Source story: `seeded_by_security_permission_role_boundary_inventory_2026_06_29`
- Finding id: `role-inv-003`
- Target closure item: prove or route to a fresh-approved repair that the organization AI generation local contract cannot bypass the service-computed organization capability source.

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
  - `docs/05-execution-logs/task-plans/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
  - `docs/05-execution-logs/evidence/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-verify-organization-analytics-admin-capability-source-boundary.md`

## Authorization And Scope

This task is verification-only. It may read scoped organization AI generation local-contract route and test files and run focused existing unit tests. It may not change source or test files. If verification proves a repair is needed, the outcome must seed a separate repair task with explicit fresh approval for source/test modification.

The already confirmed session login response credential repair and organization analytics capability-source repair are now covered by the centralized local security repair-loop authorization recorded at `2026-06-29T10:01:28-07:00`, but they remain unexecuted in this verification task. Each repair still requires its own short branch, task plan, allowedFiles/blockedFiles, boundary materialization, validation, redacted evidence, and closeout before any source/test change.

The centralized authorization keeps these items forbidden: staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, DB connection/raw rows/mutation/schema/migration/seed, real Provider/AI calls or configuration, env/secrets/connection strings, credentials/cookies/tokens/sessions/localStorage/Authorization headers, package/lockfile/dependency changes, raw DOM/screenshots/traces, PR creation, and force-push. It allows local pure fake Provider unit tests when they use no network, no real Provider, no env/secrets, no real provider configuration, and no raw payload evidence.

## Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`

## Read-Only Source/Test Surfaces

- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Blocked Files And Actions

- No source or test writes.
- No package or lockfile changes.
- No `.env*`, secrets, connection strings, credentials, cookies, tokens, sessions, localStorage, or Authorization header access or evidence.
- No DB connection, raw row read, mutation, schema, migration, seed, or destructive operation.
- No real Provider/AI call, real Provider configuration, model configuration read/write, prompt, payload, raw AI input/output, or Cost Calibration. Local pure fake Provider unit tests are allowed by the centralized local repair-loop authorization.
- No browser runtime, dev server, raw DOM, screenshots, traces, staging, prod, cloud, deployment, release readiness, final Pass, PR, or force-push.

## Evidence Redaction

Allowed evidence is limited to file paths, route/contract/test labels, risk category, severity, status, counts, validation command names, and redacted expected/observed summaries. Evidence must not include credential/token/session/cookie/Auth-header values, raw exception payloads, raw DB rows, internal IDs, PII, env content, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, or complete question/paper/material/resource/chunk content.

## Plan

1. Confirm `master` and `origin/master` are aligned and create the short branch.
2. Materialize this task in `project-state.yaml`, `task-queue.yaml`, and this task plan before source reads.
3. Read the scoped organization AI generation local contract route and focused tests only.
4. Trace whether organization AI generation access can rely on role/session route state without service-computed organization capability source.
5. Confirm real Provider execution remains disabled or unreachable under this local contract boundary.
6. Run focused existing tests when safe under the no-DB/no-real-Provider/no-browser boundary. Local pure fake Provider unit tests are allowed by the centralized local repair-loop authorization as long as they do not use network, real Provider configuration, env/secrets, or raw payload evidence.
7. Classify `role-inv-003` as `not_actionable`, `not_actionable_with_contract_watch`, or `needs_repair_pending_fresh_source_test_approval`.
8. Write traceability, evidence, audit, and acceptance docs with redacted results.
9. Run scoped Prettier, `git diff --check`, Module Run v2 governance checks, then commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch if validation passes.

## Planned Validation

- `npx.cmd vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-organization-ai-generation-capability-source-boundary.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-organization-ai-generation-capability-source-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-organization-ai-generation-capability-source-boundary-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-organization-ai-generation-capability-source-boundary-2026-06-29 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved for this verification-only docs/state task after validation passes. Source/test repair remains blocked without fresh materialization and approval.

## Initial Status

- Status: `reviewed_pending_validation`
- Source/test writes: blocked.
- DB, real Provider/AI, browser/dev server, release readiness, final Pass, and Cost Calibration: blocked.

## Verification Result

- Verdict: `confirmed_capability_source_mismatch_needs_repair_pending_task_materialization`
- Static review: organization AI generation local-contract route synthesizes advanced organization AI generation context from session role and organization binding instead of directly proving service-computed capability metadata.
- Provider guard: default local-contract path keeps Provider call, env secret access, Provider configuration read, and Cost Calibration blocked.
- Focused existing tests: pass, 2 files and 33 tests, including the pure local fake Provider branch and no real Provider access.
- Next repair task for this finding: `repair-organization-ai-generation-capability-source-boundary-2026-06-29`
- Highest-priority confirmed repair remains: `repair-session-login-response-credential-boundary-2026-06-29`

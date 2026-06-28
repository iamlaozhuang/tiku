# Organization Workspace UX Polish Permission Contract TDD Plan

Task id: `organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`

Branch: `codex/organization-workspace-permission-contract-polish-20260628`

Task kind: `implementation_tdd`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-permission-contract-tdd.md`

## SSOT Decision Map

- ADR-002: route handlers and UI adapters must stay thin over service-layer contracts.
- ADR-007: `effectiveEdition` is service-computed; UI visibility and menu state are not authorization boundaries.
- Organization training, analytics, and AI generation advanced entries require valid advanced organization authorization and must fail closed for standard or unverified organization contexts.
- Evidence and implementation must not perform DB, schema, Provider, browser, staging/prod, payment, OCR/export, external-service, Cost Calibration, release readiness, or final Pass work.

## Scope

Allowed:

- `src/server/contracts/admin-workspace-role-guard-contract.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/mappers/auth-mapper.ts`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- task plan, evidence, audit, acceptance, `project-state.yaml`, and `task-queue.yaml`

Forbidden:

- schema/migration/seed, package/lockfile, `.env*`
- DB connection/read/write, Provider call/configuration
- browser/dev-server/e2e
- staging/prod/deploy, payment/OCR/export/external-service
- PR, force push, release readiness, final Pass

## TDD Approach

1. RED: add focused tests proving that advanced organization routes and UI helpers do not accept a `session_fallback` or missing `org_auth` capability source as advanced authorization.
2. GREEN: require advanced organization capability to be backed by `capabilitySource = "service_computed"` and `organizationAuthorizationSource = "org_auth"` before allowing advanced organization workspace routes, menu entries, or training capability context.
3. Keep standard `org_auth` direct routes as `standard_unavailable`; keep missing organization context as `denied` before any edition fallback.
4. Preserve current mapper behavior that emits redacted, public-id-only `adminWorkspaceCapability` summaries without DB access in this task.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- scoped Prettier write/check on task allowed docs/source/test files
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`

## Evidence And Review

- Write RED/GREEN evidence with aggregate test counts only.
- Write self audit because this task changes authorization/permission contract behavior.
- Write acceptance limited to permission-contract TDD; no browser or runtime release claim.

## Stop Conditions

- Any required DB/schema/provider/browser/deploy/payment/external-service action.
- Any need to record secrets, tokens, credentials, raw DOM, DB rows, Provider payloads, prompts, raw AI output, plaintext `redeem_code`, full `question`/`paper`, or employee subjective answers.
- Any out-of-scope file change or failing hard gate.

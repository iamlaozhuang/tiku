# Backend Workspace Role Guard Contract TDD Task Plan

## Task

- Task id: `backend-workspace-role-guard-contract-tdd-2026-06-27`
- Branch: `codex/backend-workspace-role-guard-contract-20260627`
- Scope: permission/authorization contract TDD for backend workspace route guard and capability summary.
- Runtime claim: none.
- Release claim: none.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`

## User Approval Boundary

Current user approved the permission/authorization contract task
`backend-workspace-role-guard-contract-tdd-2026-06-27`.

Allowed changes:

- task-queue-listed route guard, capability contract, validator/mapper/service adapter;
- focused unit test;
- docs/state/evidence/audit/acceptance for this task.

Required invariant:

- `effectiveEdition` remains service-computed.
- UI menu visibility is not an authorization boundary.

Blocked surfaces:

- schema, migration, seed;
- DB connection or write;
- Provider, Provider configuration, Cost Calibration;
- staging, production, deploy;
- payment, OCR, export, external service;
- browser, dev-server, e2e;
- package or lockfile changes, `.env*`;
- PR, force push, release readiness, final Pass.

## Implementation Plan

1. Materialize the task in `project-state.yaml` and `task-queue.yaml` with concrete allowed files and validation commands.
2. Write a RED focused unit test for the route guard contract:
   - cross-workspace direct route denial for `ops_admin`, `content_admin`, and organization admins;
   - organization advanced-only route denial or standard-unavailable result when service-computed capability says standard;
   - content and operations scoped allow decisions remain separate;
   - no UI menu visibility or component state is used as the permission boundary.
3. Add the smallest source contract/service implementation:
   - pure contract types for workspace, route, decision, denial reason, and capability summary;
   - pure service adapter that resolves a decision from route path plus service-computed capability summary;
   - no repository, DB, Provider, environment, browser, or runtime calls.
4. Run focused unit test to GREEN.
5. Write redacted evidence, audit review, and acceptance note.
6. Run scoped Prettier check, `git diff --check`, lint, typecheck, and ModuleRunV2 gates before local closeout.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/contracts/admin-workspace-role-guard-contract.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-role-guard-contract-tdd.md`

## Validation Plan

- RED: `npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts`
- GREEN: `npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId backend-workspace-role-guard-contract-tdd-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId backend-workspace-role-guard-contract-tdd-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId backend-workspace-role-guard-contract-tdd-2026-06-27 -SkipRemoteAheadCheck`

## Risk Controls

- The task does not change authorization persistence or the edition computation service.
- The guard accepts an already service-computed capability summary; it does not derive `effectiveEdition` from UI state or menu visibility.
- Evidence will record command status, test names, and redacted decisions only.
- Browser/runtime acceptance remains a separate future task.
